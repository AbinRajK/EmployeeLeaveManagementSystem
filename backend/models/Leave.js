const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fromDate:     { type: Date, required: true },
    toDate:       { type: Date, required: true },
    numberOfDays: { type: Number, required: true },
    reason:       { type: String, required: true, trim: true, maxlength: 500 },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reviewedBy:    { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewComment: { type: String, trim: true, default: "" },
    reviewedAt:    { type: Date, default: null },
  },
  { timestamps: true }
);

// ─── Indexes ────────────────────────────────────────────────────────────────
// Manager dashboard: filter by status, sort by date
leaveSchema.index({ status: 1, createdAt: -1 });

// Employee "my leaves": filter by employee + optional status, sort by date
leaveSchema.index({ employeeId: 1, status: 1, createdAt: -1 });

// Overlap check: keep the scan to one employee's date range
leaveSchema.index({ employeeId: 1, fromDate: 1, toDate: 1 });

module.exports = mongoose.model("Leave", leaveSchema);