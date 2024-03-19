import { MongoClient } from "mongodb";
import archaeaJSON from "../read-txt/archaea-output.json" assert { type: "json" };
import bacteriaJSON from "../read-txt/bacteria-output.json" assert { type: "json" };
import eukaryaJSON from "../read-txt/eukarya-output.json" assert { type: "json" };
import virusJSON from "../read-txt/virus-output.json" assert { type: "json" };

const DB_NAME = "OpenGateLab";
const COLLECTION_NAME = "proteins";

async function listDatabases(client) {
  const databasesList = await client.db().admin().listDatabases();

  console.log("Databases:");
  databasesList.databases.forEach((db) => console.log(` - ${db.name}`));
}

async function addData(client) {
  console.log("inserting new data");
  const db = await client.db(DB_NAME);
  const col = db.collection(COLLECTION_NAME);

  await col.drop();

  const a = await col.insertMany(archaeaJSON);
  console.log("added", a.length);
  const b = await col.insertMany(bacteriaJSON);
  console.log("added", b.length);
  const e = await col.insertMany(eukaryaJSON);
  console.log("added", e.length);
  const v = await col.insertMany(virusJSON);
  console.log("added", v.length);
}

const uri =
  "mongodb+srv://worm:opengate@cluster0.gkt5d82.mongodb.net/?retryWrites=true&w=majority";

async function main() {
  const client = new MongoClient(uri);
  try {
    console.log("hello");
    await client.connect();
    await addData(client);
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

main().catch(console.error);
