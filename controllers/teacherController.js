const Teacher = require("../models/teacherModel");
const globalFunction = require("../utils/globalFuctions");

exports.createTeacher = globalFunction.createOne(Teacher);
exports.getOneTeacher = globalFunction.getOne(Teacher, "branch", "subjects");
exports.deleteTeacher = globalFunction.deleteOne(Teacher);
exports.updateTeacher = globalFunction.updateOne(Teacher);
exports.getAllTeachers = async (req, res) => {
  try {
    let data = await Teacher.find({
      branch: req.user.branch,
    }).populate("branch");


    res.status(200).json(data);
  } catch (error) {
    res.status(200).json(error);
  }
};
