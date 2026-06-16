import { useState } from "react";
import toast from "react-hot-toast";
import leaveService from "../../services/leaveService";
import "./LeaveForm.css";

function LeaveForm({ onLeaveCreated, existingLeaves = [] }) {
  const [formData, setFormData] = useState({
    fromDate: "",
    toDate: "",
    reason: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const hasOverlap = (newStart, newEnd) => {
    const newStartTime = new Date(newStart).getTime();
    const newEndTime = new Date(newEnd).getTime();

    return existingLeaves.some((leave) => {
      const existingStart = new Date(leave.fromDate).getTime();
      const existingEnd = new Date(leave.toDate).getTime();
      return newStartTime <= existingEnd && existingStart <= newEndTime;
    });
  };

  const validateForm = () => {
    if (!formData.fromDate || !formData.toDate) {
      toast.error("Select leave dates");
      return false;
    }

    if (!formData.reason.trim()) {
      toast.error("Reason is required");
      return false;
    }

    const fromDate = new Date(formData.fromDate);
    const toDate = new Date(formData.toDate);

    if (fromDate > toDate) {
      toast.error("From Date cannot be greater than To Date");
      return false;
    }

    const days = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1;

    if (days > 10) {
      toast.error("Maximum leave is 10 days");
      return false;
    }

    if (hasOverlap(formData.fromDate, formData.toDate)) {
      toast.error("You already have a leave request in this date range");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      await leaveService.applyLeave(formData);
      toast.success("Leave applied successfully");
      setFormData({
        fromDate: "",
        toDate: "",
        reason: "",
      });
      onLeaveCreated?.();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to apply leave");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="leave-form-card">
      <h3>Apply Leave</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div>
            <label>From Date</label>
            <input
              type="date"
              name="fromDate"
              value={formData.fromDate}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>To Date</label>
            <input
              type="date"
              name="toDate"
              value={formData.toDate}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <label>Reason</label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            rows="4"
          />
        </div>

        <button type="submit" className="apply-btn" disabled={loading}>
          {loading ? "Submitting..." : "Apply Leave"}
        </button>
      </form>
    </div>
  );
}

export default LeaveForm;