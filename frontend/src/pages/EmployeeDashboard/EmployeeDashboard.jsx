import {
  useEffect,
  useState,
} from "react";

import Navbar from "../../components/Navbar/Navbar";
import LeaveForm from "../../components/LeaveForm/LeaveForm";
import LeaveTable from "../../components/LeaveTable/LeaveTable";

import leaveService from "../../services/leaveService";

import "./EmployeeDashboard.css";

function EmployeeDashboard() {
  const [leaves, setLeaves] =
    useState([]);

  const fetchLeaves =
    async () => {
      try {
        const response =
          await leaveService.getMyLeaves();

        setLeaves(
          response.data || []
        );
      } catch (error) {
        console.error(error);
      }
    };

  useEffect(() => {
    fetchLeaves();
  }, []);

  return (
    <>
      <Navbar />

      <div className="employee-dashboard">
        <LeaveForm
          onLeaveCreated={
            fetchLeaves
          }
        />

        <div className="history-section">
          <h3>
            Leave History
          </h3>

          <LeaveTable
            leaves={leaves}
          />
        </div>
      </div>
    </>
  );
}

export default EmployeeDashboard;