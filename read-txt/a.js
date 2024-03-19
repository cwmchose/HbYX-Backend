import fs from "fs";

// Define the path to the JSON file
const jsonFilePath = "archaea-output.json";

// Read the JSON file asynchronously
fs.readFile(jsonFilePath, "utf8", (err, data) => {
  if (err) {
    console.error(`Error reading ${jsonFilePath}: ${err}`);
    return;
  }

  try {
    // Parse the JSON data into an array
    const jsonArray = JSON.parse(data);

    // Check if the parsed data is an array
    if (Array.isArray(jsonArray)) {
      const itemCount = jsonArray.length;
      console.log(`Number of items in the JSON array: ${itemCount}`);
    } else {
      console.error("The JSON data is not an array.");
    }
  } catch (parseError) {
    console.error(`Error parsing JSON: ${parseError}`);
  }
});
