import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Candidates from '../components/Candidates';
import Employees from '../components/Employees';
import Attendance from '../components/Attendance';
import Leaves from '../components/Leaves';
import "../styles/Dashboard.css";

export default function Dashboard() {
  const [selectedSection, setSelectedSection] = useState('Candidates');

  const renderContent = () => {
    switch (selectedSection) {
      case 'Candidates':
        return <Candidates />;
      case 'Employees':
        return <Employees />;
      case 'Attendance':
        return <Attendance />;
      case 'Leaves':
        return <Leaves />;
      default:
        return <Candidates />;
    }
  };

  return (
    <div className="dashboard">
      <Sidebar onSelect={setSelectedSection} selected={selectedSection} />
      <div className="main-content">
        <Topbar title={selectedSection} />
        <div className="content-body">{renderContent()}</div>
      </div>
    </div>
  );
}