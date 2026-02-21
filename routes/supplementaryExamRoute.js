const express = require("express");
const supplementaryExamController = require("../controllers/supplementaryExamController");
const authController = require("../controllers/authController");
const multer = require("multer");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Super Admin Routes
router.get(
    "/template/:classId",
    authController.protect,
    authController.restrictTo('superAdmin'),
    supplementaryExamController.getTemplate
);

router.post(
    "/upload-initial",
    authController.protect,
    authController.restrictTo('superAdmin'),
    upload.single("file"),
    supplementaryExamController.uploadInitialData
);

router.get(
    "/super-admin-records",
    authController.protect,
    authController.restrictTo('superAdmin'),
    supplementaryExamController.getSuperAdminRecords
);

router.get(
    "/download-final-data/:classId?",
    authController.protect,
    authController.restrictTo('superAdmin'),
    supplementaryExamController.downloadFinalData
);

// Study Centre Routes
router.get(
    "/centre-records",
    authController.protect,
    authController.restrictTo('admin'),
    supplementaryExamController.getStudyCentreRecords
);

router.get(
    "/download-centre-list/:classId?",
    authController.protect,
    authController.restrictTo('admin'),
    supplementaryExamController.downloadCentreList
);

router.post(
    "/upload-marks",
    authController.protect,
    authController.restrictTo('admin'),
    upload.single("file"),
    supplementaryExamController.uploadMarks
);

module.exports = router;
