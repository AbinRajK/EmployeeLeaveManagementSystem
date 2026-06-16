import axiosInstance from "./axiosInstance";

const leaveService = {
  applyLeave: (leaveData) =>
    axiosInstance.post("/leaves", leaveData).then((r) => r.data.data),

  // Returns raw leave array — matches controller shape: { success, data, pagination }
  getMyLeaves: (page = 1, status = "") =>
    axiosInstance
      .get("/leaves/my-leaves", { params: { page, status } })
      .then((r) => r.data),

  // Returns { leaves, totalPages, stats } — matches controller getAllLeaves shape exactly
  getAllLeaves: (page = 1, search = "", status = "") =>
    axiosInstance
      .get("/leaves", { params: { page, search: search || undefined, status: status || undefined } })
      .then((r) => r.data),
  //             ^ skip empty params so Mongo doesn't build pointless filter keys

  updateLeaveStatus: (leaveId, status, reviewComment = "") =>
    axiosInstance
      .patch(`/leaves/${leaveId}/status`, { status, reviewComment })
      .then((r) => r.data),
};

export default leaveService;