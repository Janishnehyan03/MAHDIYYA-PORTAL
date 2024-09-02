const Teacher = require("../models/teacherModel");
const globalFunction = require("../utils/globalFuctions");

exports.createTeacher = globalFunction.createOne(Teacher);
exports.getOneTeacher = globalFunction.getOne(Teacher, "branch", "subjects");
exports.deleteTeacher = globalFunction.deleteOne(Teacher);
exports.updateTeacher = globalFunction.updateOne(Teacher);
exports.getAllTeachers = async (req, res, next) => {
  try {
    let query = {}; // Initialize an empty query object
    let data = [];

    if (req.query.all) {
      data = await Teacher.find().populate("branch");
    } else {
      if (req.query.studyCentre) {
        query.branch = req.query.studyCentre;
      }
      data = await Teacher.find(query).populate("branch");
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching students", error });
  }
};
