import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FiMoreVertical } from 'react-icons/fi';
import "../styles/Employees.css";
import { API_ENDPOINTS } from "../config";

const API_URL = API_ENDPOINTS.EMPLOYEES;

const positions = ['All', 'Intern', 'Full time', 'Junior', 'Senior', 'Team Lead'];

const initialFormData = {
  fullName: '',
  email: '',
  phone: '',
  department: '',
  position: '',
  profile: '',
  dateOfJoining: '',
};

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedPosition, setSelectedPosition] = useState('All');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [dropdownOpenIndex, setDropdownOpenIndex] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const dropdownRefs = useRef([]);

  // Fetch employees on mount
  useEffect(() => {
    fetchEmployees();
    document.addEventListener('click', handleClickOutsideDropdown);
    return () => document.removeEventListener('click', handleClickOutsideDropdown);
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(API_URL);
      setEmployees(response.data);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
    }
  };

  const handleClickOutsideDropdown = (event) => {
    if (dropdownRefs.current.some(ref => ref && ref.contains(event.target))) return;
    setDropdownOpenIndex(null);
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profile' && files.length > 0) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profile: reader.result });
      };
      reader.readAsDataURL(files[0]);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAddEditSubmit = async () => {
    try {
      if (editMode && editingId) {
        await axios.put(`${API_URL}/${editingId}`, formData);
      } else {
        await axios.post(API_URL, formData);
      }

      fetchEmployees();
      resetForm();
    } catch (error) {
      console.error("Failed to submit form:", error);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditMode(false);
    setEditingId(null);
    setShowForm(false);
  };

  const openEditForm = (employee) => {
    setFormData(employee);
    setEditMode(true);
    setEditingId(employee._id);
    setShowForm(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${API_URL}/${confirmDeleteId}`);
      fetchEmployees();
      setConfirmDeleteId(null);
    } catch (error) {
      console.error("Failed to delete employee:", error);
    }
  };

  const filteredEmployees = employees.filter(emp =>
    (selectedPosition === 'All' || emp.position === selectedPosition) &&
    emp.fullName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="employees-container">
      {/* Header */}
      <div className="employees-header">
        <select
          className="filter-dropdown"
          value={selectedPosition}
          onChange={(e) => setSelectedPosition(e.target.value)}
        >
          {positions.map(pos => (
            <option key={pos} value={pos}>{pos}</option>
          ))}
        </select>

        <div className="right-controls">
          <button
            className="violet-button"
            onClick={() => {
              setShowForm(true);
              setEditMode(false);
              setFormData(initialFormData);
            }}
          >
            Add Employee
          </button>

          <input
            type="text"
            className="search-input"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Employee Table */}
      <table className="employee-table">
        <thead>
          <tr>
            <th>Profile</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Position</th>
            <th>Department</th>
            <th>Date of Joining</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredEmployees.map((emp, idx) => (
            <tr key={emp._id || idx}>
              <td>
                <img src={emp.profile || ""} alt="profile" className="profile-pic" />
              </td>
              <td>{emp.fullName}</td>
              <td>{emp.email}</td>
              <td>{emp.phone}</td>
              <td>{emp.position}</td>
              <td>{emp.department}</td>
              <td>{new Date(emp.dateOfJoining).toLocaleDateString()}</td>
              <td>
                <div
                  className="action-dropdown"
                  ref={el => dropdownRefs.current[idx] = el}
                >
                  <FiMoreVertical
                    onClick={() =>
                      setDropdownOpenIndex(dropdownOpenIndex === idx ? null : idx)
                    }
                  />
                  {dropdownOpenIndex === idx && (
                    <div className="dropdown-menu active">
                      <div onClick={() => openEditForm(emp)}>Edit</div>
                      <div onClick={() => setConfirmDeleteId(emp._id)}>Delete</div>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add/Edit Form Popup */}
      {showForm && (
        <div className="popup-overlay">
          <div className="popup-form">
            <div className="popup-header">
              <h3>{editMode ? "Edit Employee Details" : "Enter Employee Details"}</h3>
              <span onClick={() => setShowForm(false)}>&times;</span>
            </div>

            <div className="popup-body grid-form">
              {Object.keys(initialFormData).map(field => (
                <div className="form-group" key={field}>
                  <label htmlFor={field}>
                    {field.replace(/([A-Z])/g, " $1")}
                    <span style={{ color: "red" }}> *</span>
                  </label>

                  {field === "position" ? (
                    <select
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Position</option>
                      {positions.slice(1).map(pos => (
                        <option key={pos} value={pos}>{pos}</option>
                      ))}
                    </select>
                  ) : field === "profile" ? (
                    <input
                      type="file"
                      name="profile"
                      accept="image/*"
                      onChange={handleInputChange}
                    />
                  ) : (
                    <input
                      type={field === "dateOfJoining" ? "date" : "text"}
                      name={field}
                      value={formData[field]}
                      onChange={handleInputChange}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="action-button-container">
              <button className="violet-button" onClick={handleAddEditSubmit}>
                {editMode ? "Update" : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Popup */}
      {confirmDeleteId && (
        <div className="popup-overlay">
          <div className="confirm-popup">
            <h3>Are you sure you want to delete this employee?</h3>
            <div className="confirm-buttons">
              <button className="cancel-btn" onClick={() => setConfirmDeleteId(null)}>
                Cancel
              </button>
              <button className="delete-btn" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;