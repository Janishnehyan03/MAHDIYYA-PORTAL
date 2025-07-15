const globalFuctions = require("../utils/globalFuctions");
const Auth = require("../models/authModel");
// const sharp = require("sharp");
const catchAsync = require("../utils/catchAsync");
const Student = require("../models/studentModel");
const Teacher = require("../models/teacherModel");
const StudyCentre = require("../models/studyCentreModel");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUDNAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.createBranch = async (req, res, next) => {
  try {
    let data = await StudyCentre.create(req.body);
    let user = await Auth.create({ ...req.body, branch: data._id });
    data.admin = user._id;
    data.save();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
exports.getBranch = async (req, res, next) => {
  let studyCentreId;
  if (req.user.role === "superAdmin") {
    studyCentreId = req.params.id;
  } else if (req.user.role === "admin") {
    studyCentreId = req.user.branch;
  }
  try {
    let data = await StudyCentre.findById(studyCentreId);
    let students = await Student.countDocuments({ branch: studyCentreId });
    let teachers = await Teacher.countDocuments({ branch: studyCentreId });
    res.status(200).json({ data, students, teachers });
  } catch (error) {
    next(error);
  }
};

exports.getStudyCentreDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the study centre profile
    const studyCentre = await StudyCentre.findById(id);
    if (!studyCentre) {
      return res.status(404).json({ message: "Study Centre not found" });
    }

    // Count students and teachers
    const [studentCount, teacherCount] = await Promise.all([
      Student.countDocuments({ branch: id }),
      Teacher.countDocuments({ branch: id }),
    ]);

    // Return the complete profile
    res.status(200).json({
      message: "Study Centre details fetched successfully",
      data: {
        studyCentre,
        studentCount,
        teacherCount,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};
exports.editBranch = async (req, res, next) => {
  let studyCentreId;
  if (req.user.role === "superAdmin") {
    studyCentreId = req.params.id;
  } else if (req.user.role === "admin") {
    studyCentreId = req.user.branch;
  }
  try {
    let data = await StudyCentre.findByIdAndUpdate(studyCentreId, req.body);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
exports.getStudyCentreDetails = async (req, res, next) => {
  let studyCentreId = req.params.studyCentreId;
  try {
    let students = await Student.find({ branch: studyCentreId });
    let teachers = await Teacher.find({ branch: studyCentreId });
    res.status(200).json({ students, teachers });
  } catch (error) {
    next(error);
  }
};

exports.getAllBranches = globalFuctions.getAll(StudyCentre);
exports.deleteBranch = globalFuctions.deleteOne(StudyCentre);

exports.updateCoverImage = async (req, res, next) => {
  try {
    const cldRes = await cloudinary.uploader.upload(req.file.path);
    await StudyCentre.findByIdAndUpdate(
      req.params.id,
      { imageCover: cldRes.secure_url },
      { new: true }
    );
    res.status(200).json({ message: "Cover updated" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
  }
};
