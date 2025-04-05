import React, { useState } from 'react';
import Logo from '../assets/Logo.png';
import CandidatesIcon from '../assets/candidates.png';
import EmployeesIcon from '../assets/employees.png';
import AttendanceIcon from '../assets/attendance.png';
import LeavesIcon from '../assets/leaves.png';
import LogoutIcon from '../assets/logout.png';

import "../styles/Sidebar.css";

const Sidebar = ({ onSelect, selected }) => {
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("tokenTime");
    window.location.href = "/auth";
  };

  return (
    <>
      <div className="sidebar">
        <div className='logo-container'>
          <img src={Logo} className="logo" alt="Logo" />
        </div>

        <input type="text" placeholder="Search" />

        <div className="menu-section">
          <div className="menu-title">Recruitment</div>
          <div
            className={`menu-item ${selected === 'Candidates' ? 'active' : ''}`}
            onClick={() => onSelect('Candidates')}
          >
            <img src={CandidatesIcon} alt="Candidates" width="20" />
            Candidates
          </div>
        </div>

        <div className="menu-section">
          <div className="menu-title">Organization</div>
          <div
            className={`menu-item ${selected === 'Employees' ? 'active' : ''}`}
            onClick={() => onSelect('Employees')}
          >
            <img src={EmployeesIcon} alt="Employees" width="20" />
            Employees
          </div>
          <div
            className={`menu-item ${selected === 'Attendance' ? 'active' : ''}`}
            onClick={() => onSelect('Attendance')}
          >
            <img src={AttendanceIcon} alt="Attendance" width="20" />
            Attendance
          </div>
          <div
            className={`menu-item ${selected === 'Leaves' ? 'active' : ''}`}
            onClick={() => onSelect('Leaves')}
          >
            <img src={LeavesIcon} alt="Leaves" width="20" />
            Leaves
          </div>
        </div>

        <div className="menu-section">
          <div className="menu-title">Others</div>
          <div className="menu-item" onClick={() => setShowLogoutPopup(true)}>
            <img src={LogoutIcon} alt="Logout" width="20" />
            Logout
          </div>
        </div>
      </div>

      {showLogoutPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <div className="popup-header">Logout</div>
            <p className="popup-body">Are you sure you want to log out?</p>
            <div className="popup-buttons">
              <button className="cancel" onClick={() => setShowLogoutPopup(false)}>Cancel</button>
              <button className="logout" onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
