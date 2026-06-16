const Leave =
  require("../models/Leave");

const calculateLeaveDays =
  require("../utils/calculateLeaveDays");

const createLeave =
  async (
    userId,
    leaveData
  ) => {
    const days =
      calculateLeaveDays(
        leaveData.fromDate,
        leaveData.toDate
      );

    return await Leave.create({
      employeeId: userId,
      fromDate:
        leaveData.fromDate,
      toDate:
        leaveData.toDate,
      reason:
        leaveData.reason,
      days,
    });
  };

module.exports = {
  createLeave,
};