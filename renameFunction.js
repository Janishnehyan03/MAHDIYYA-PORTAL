require("dotenv").config();
const mongoose = require("mongoose");
const axios = require("axios");
const { v2: cloudinary } = require("cloudinary");
const Student = require("./models/studentModel");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function connectDB() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");
}

const wait = (ms) => new Promise((res) => setTimeout(res, ms));

async function reuploadImages() {
  await connectDB();

  const students = await Student.find({
    imageUrl: { $exists: true, $ne: "" }
  });

  console.log(`Found ${students.length} students to re-upload.`);

  for (const stu of students) {
    try {
      if (!stu.registerNo) {
        console.log(`SKIPPED ${stu._id} (no registerNo)`);
        continue;
      }

      console.log(`\n---- FIXING ${stu.registerNo} ----`);
      console.log("Downloading:", stu.imageUrl);

      // 1) Download original (CDN cached) image
      const res = await axios.get(stu.imageUrl, {
        responseType: "arraybuffer",
      });

      const buffer = Buffer.from(res.data, "binary");

      // 2) Re-upload to Cloudinary using CLEAN public_id
      const uploaded = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "students",
            public_id: stu.registerNo,
            overwrite: true,
            resource_type: "image",
          },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        );

        stream.end(buffer);
      });

      // 3) BUILD CLEAN VERSIONLESS URL
      const cleanUrl =
        `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}` +
        `/image/upload/students/${stu.registerNo}.${uploaded.format}`;

      console.log("Uploaded clean URL:", cleanUrl);

      // 4) Update DB
      stu.imageUrl = cleanUrl;
      await stu.save();

      console.log("DB UPDATED");

    } catch (err) {
      console.log(`ERROR for ${stu.registerNo}:`, err.message);
    }

    await wait(250); // avoid Cloudinary rate limit
  }

  console.log("\nALL DONE (version removed from every URL)");
  process.exit();
}

reuploadImages();
