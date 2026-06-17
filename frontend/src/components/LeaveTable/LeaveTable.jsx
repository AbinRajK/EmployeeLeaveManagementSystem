import "./LeaveTable.css";

function LeaveTable({ leaves, isManager = false, onStatusChange }) {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const calculateDays = (fromDate, toDate) => {
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const timeDiff = end - start;
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <div className="table-wrapper">
      <table className="leave-table">
        <thead>
          <tr>
            {isManager && <th>Employee</th>}
            <th>From</th>
            <th>To</th>
            <th>Days</th>
            <th>Reason</th>
            <th>Status</th>
            {isManager && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {leaves.length === 0 ? (
            <tr>
              <td colSpan={isManager ? 7 : 5} className="no-data">
                No records found
              </td>
            </tr>
          ) : (
            leaves.map((leave) => (
              <tr key={leave._id}>
                {isManager && <td>{leave.employeeId?.name || "N/A"}</td>}
                <td>{formatDate(leave.fromDate)}</td>
                <td>{formatDate(leave.toDate)}</td>
                <td>{calculateDays(leave.fromDate, leave.toDate)}</td>
                <td>{leave.reason}</td>
                <td>
                  <span className={`status ${leave.status}`}>{leave.status}</span>
                </td>
                {isManager && (
                  <td>
                    {leave.status === "pending" && (
                      <>
                        <button
                          className="approve-btn"
                          onClick={() => onStatusChange(leave._id, "approved")}
                        >
                          Approve
                        </button>
                        <button
                          className="reject-btn"
                          onClick={() => onStatusChange(leave._id, "rejected")}
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default LeaveTable;