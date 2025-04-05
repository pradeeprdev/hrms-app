import React from 'react';
import MessageIcon from '../assets/message.png';
import BellIcon from '../assets/bell.png';
import ProfileIcon from '../assets/profile.png';
import DownArrowIcon from '../assets/down-arrow.png';
import "../styles/Topbar.css";

const Topbar = ({ title }) => {
  return (
    <div className="topbar">
      <h3>{title}</h3>
      <div className="top-actions">
        <img src={MessageIcon} alt="Message" className="top-icon" />
        <img src={BellIcon} alt="Notifications" className="top-icon" />
        <div className="profile-container">
          <img src={ProfileIcon} alt="Profile" className="top-icon profile-icon" />
          <img src={DownArrowIcon} alt="Dropdown" className="top-icon dropdown-icon" />
        </div>
      </div>
    </div>
  );
};

export default Topbar;