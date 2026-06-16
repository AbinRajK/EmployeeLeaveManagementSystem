import { useEffect, useState, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import Navbar from "../../components/Navbar/Navbar";
import SearchBar from "../../components/SearchBar/SearchBar";
import StatsCard from "../../components/StatsCard/StatsCard";
import LeaveTable from "../../components/LeaveTable/LeaveTable";
import Pagination from "../../components/Pagination/Pagination";
import leaveService from "../../services/leaveService";
import "./ManagerDashboard.css";

function ManagerDashboard() {
  const [leaves, setLeaves]           = useState([]);
  const [search, setSearch]           = useState("");
  const [status, setStatus]           = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [stats, setStats]             = useState({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading]         = useState(false);

  // ── useRef-based debounce: avoids the broken `this` context in the original
  //    and never needs to be listed in useCallback deps
  const timerRef = useRef(null);

  const fetchLeaves = useCallback((page, searchTerm, statusFilter) => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        // Service returns { leaves, totalPages, stats } — matching the controller shape
        const data = await leaveService.getAllLeaves(page, searchTerm, statusFilter);
        setLeaves(data.leaves);
        setTotalPages(data.totalPages);
        setStats(data.stats);
      } catch {
        toast.error("Failed to load leaves");
      } finally {
        setLoading(false);
      }
    }, 400);
  }, []); // stable — no deps needed because we close over state setters, not state values

  // Reset to page 1 when search/status filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, status]);

  useEffect(() => {
    fetchLeaves(currentPage, search, status);
    return () => clearTimeout(timerRef.current);  // cleanup on unmount
  }, [currentPage, search, status, fetchLeaves]);

  const handleStatusChange = async (leaveId, leaveStatus) => {
    try {
      await leaveService.updateLeaveStatus(leaveId, leaveStatus);
      toast.success(`Leave ${leaveStatus}`);
      fetchLeaves(currentPage, search, status);
    } catch {
      toast.error("Action failed");
    }
  };

  return (
    <>
      <Navbar />
      <div className="manager-dashboard">
        <div className="stats-container">
          <StatsCard title="Pending"  count={stats.pending}  />
          <StatsCard title="Approved" count={stats.approved} />
          <StatsCard title="Rejected" count={stats.rejected} />
        </div>

        <div className="filters">
          <SearchBar search={search} setSearch={setSearch} />
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <LeaveTable
          leaves={leaves}
          isManager={true}
          onStatusChange={handleStatusChange}
          loading={loading}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </>
  );
}

export default ManagerDashboard;