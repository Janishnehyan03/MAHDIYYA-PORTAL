const express = require("express");
const supplementaryExamController = require("../controllers/supplementaryExamController");
const authController = require("../controllers/authController");

const router = express.Router();

// All routes require authentication
router.use(authController.protect);

// ==========================================
// SUPER ADMIN ROUTES
// ==========================================
router.post(
  "/templates",
  authController.restrictTo("superAdmin"),
  supplementaryExamController.createTemplate
);

router.get(
  "/templates",
  authController.restrictTo("admin", "superAdmin"),
  supplementaryExamController.getTemplates
);

router.get(
  "/templates/:id",
  authController.restrictTo("admin", "superAdmin"),
  supplementaryExamController.getTemplateById
);

router.put(
  "/templates/:id",
  authController.restrictTo("superAdmin"),
  supplementaryExamController.updateTemplate
);

router.patch(
  "/templates/:id/toggle-status",
  authController.restrictTo("superAdmin"),
  supplementaryExamController.toggleTemplateStatus
);

router.delete(
  "/templates/:id",
  authController.restrictTo("superAdmin"),
  supplementaryExamController.deleteTemplate
);

router.get(
  "/super-admin-applications",
  authController.restrictTo("superAdmin"),
  supplementaryExamController.getSuperAdminApplications
);

router.get(
  "/export-excel/:templateId",
  authController.restrictTo("admin", "superAdmin"),
  supplementaryExamController.exportApplicationsExcel
);

// ==========================================
// STUDY CENTRE ADMIN & SHARED ROUTES
// ==========================================
router.get(
  "/open-templates",
  authController.restrictTo("admin", "superAdmin"),
  supplementaryExamController.getOpenTemplates
);

router.get(
  "/search-student/:regNo",
  authController.restrictTo("admin", "superAdmin"),
  supplementaryExamController.searchStudentByRegNo
);

router.post(
  "/submit-application",
  authController.restrictTo("admin", "superAdmin"),
  supplementaryExamController.submitApplication
);

router.get(
  "/my-applications",
  authController.restrictTo("admin", "superAdmin"),
  supplementaryExamController.getAdminApplications
);

router.delete(
  "/application/:id",
  authController.restrictTo("admin", "superAdmin"),
  supplementaryExamController.deleteApplication
);

router.get(
  "/hall-ticket-sessions",
  authController.restrictTo("admin", "superAdmin"),
  supplementaryExamController.getSupplementaryHallTicketSessions
);

router.get(
  "/hall-tickets",
  authController.restrictTo("admin", "superAdmin"),
  supplementaryExamController.getSupplementaryHallTickets
);

module.exports = router;
