import express from "express";
import db from "../db/conn.js";
import { ObjectId } from "mongodb";

const router = express.Router();

const testFilter = {
  motif: /^W/,
};
let a = "C";

const getRegexValue = (value, matchMode) => {
  if (matchMode == "startsWith") {
    return { $regex: new RegExp(`^${value}`) };
  }
  if (matchMode == "contains") {
    return { $regex: new RegExp(`${value}`) };
  }
  if (matchMode == "notContains") {
    return { $not: new RegExp(`^${value}`) };
  }
  if (matchMode == "endsWith") {
    return { $regex: new RegExp(`${value}$`) };
  }
  if (matchMode == "equals") {
    return value;
  }
  if (matchMode == "notEquals") {
    return { $not: value };
  }
};

const mapFilter = (filters) => {
  const mongoFilters = Object.entries(filters).reduce((acc, f) => {
    if (f[1].value == null || f[1].value == "") return acc;

    const key = f[0];
    const { value, matchMode } = f[1];

    const regexValue = getRegexValue(value, matchMode);
    return { ...acc, [key]: regexValue };
  }, {});

  return mongoFilters;
};

// Get a list of 50 posts
router.post("/", async (req, res) => {
  const collection = await db.collection("proteins");
  let { pageNumber, pageSize, filter, sort } = req.body.query;
  // console.log(req.body.query);
  try {
    pageNumber = parseInt(pageNumber, 10) || 0;
    pageSize = parseInt(pageSize, 10) || 10;

    console.log("query", { pageNumber, pageSize, skip: pageSize * pageNumber });

    const filters = mapFilter(filter);
    const cursor = collection.aggregate(
      [
        { $match: filters },
        {
          $facet: {
            total: [{ $group: { _id: null, count: { $sum: 1 } } }],
            edges: [
              { $sort: sort },
              { $skip: pageSize * pageNumber },
              { $limit: pageSize },
            ],
          },
        },
        {
          $project: {
            total: "$total.count",
            edges: "$edges",
          },
        },
      ],
      { allowDiskUse: true }
    );

    const [
      {
        total: [total = 0],
        edges,
      },
    ] = await cursor.toArray();

    let b = await collection.distinct("species");
    console.log(b);

    return res.status(200).json({
      success: true,
      total,
      proteins: edges,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false });
  }
});

// Get a single post
router.get("/:id", async (req, res) => {
  let collection = await db.collection("posts");
  let query = { _id: ObjectId(req.params.id) };
  let result = await collection.findOne(query);

  if (!result) res.send("Not found").status(404);
  else res.send(result).status(200);
});

export default router;
