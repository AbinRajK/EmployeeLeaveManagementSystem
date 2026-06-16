const express =
  require("express");

const router =
  express.Router();

const authMiddleware =
  require("../middleware/authMiddleware");

const roleMiddleware =
  require("../middleware/roleMiddleware");

const {
  createLeaveRequest,
  getMyLeaves,
  getAllLeaves,
  updateStatus,
} = require("../controllers/leaveController");

router.post(
  "/",
  authMiddleware,
  roleMiddleware("employee"),
  createLeaveRequest
);

router.get(
  "/my-leaves",
  authMiddleware,
  roleMiddleware("employee"),
  getMyLeaves
);

router.get(
  "/",
  authMiddleware,
  roleMiddleware("manager"),
  getAllLeaves
);

router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware("manager"),
  updateStatus
);

module.exports =
  router;