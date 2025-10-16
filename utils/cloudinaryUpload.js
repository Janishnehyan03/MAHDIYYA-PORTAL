const cloudinary = require("../config/cloudinary");

const uploadToCloudinary = async (fileBuffer, filename) => {
  return await cloudinary.uploader.upload_stream(
    {
      folder: "students",
      public_id: filename,
      resource_type: "auto",
    },
    (error, result) => {
      if (error) throw error;
      return result;
    }
  );
};

module.exports = uploadToCloudinary;