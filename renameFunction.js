const fs = require("fs-extra");
const axios = require("axios");
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
const archiver = require("archiver");

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function downloadFolder(folder) {
  let nextCursor = null;
  let allResources = [];

  console.log("Fetching resources...");

  // Pagination loop
  do {
    const res = await cloudinary.search
      .expression(`folder:${folder}`)
      .max_results(1000)
      .next_cursor(nextCursor)
      .execute();

    allResources = [...allResources, ...res.resources];
    nextCursor = res.next_cursor;

    console.log(`Fetched ${allResources.length} items so far...`);
  } while (nextCursor);

  console.log(`Total files found: ${allResources.length}`);

  // Ensure local folder exists
  const downloadPath = `./downloads/${folder}`;
  fs.ensureDirSync(downloadPath);

  // Download files
  for (const file of allResources) {
    const url = file.secure_url;
    const fileName = file.public_id.replace(`${folder}/`, "") + `.${file.format}`;
    const filePath = `${downloadPath}/${fileName}`;

    console.log("Downloading:", fileName);

    const response = await axios.get(url, { responseType: "stream" });

    await new Promise((resolve, reject) => {
      const stream = response.data.pipe(fs.createWriteStream(filePath));
      stream.on("finish", resolve);
      stream.on("error", reject);
    });
  }

  console.log("All files downloaded!");

  // Create ZIP file
  const zipPath = `./${folder}.zip`;
  await zipFolder(downloadPath, zipPath);

  console.log(`ZIP created: ${zipPath}`);
}

// Function to zip folder
async function zipFolder(sourceFolder, outPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => {
      console.log(`Total ZIP size: ${archive.pointer()} bytes`);
      resolve();
    });

    archive.on("error", (err) => reject(err));

    archive.pipe(output);
    archive.directory(sourceFolder, false);
    archive.finalize();
  });
}

// Run
downloadFolder("students"); // change folder name
