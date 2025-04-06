// Leaves.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../styles/Leaves.css";
import { FiMoreVertical } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_ENDPOINTS } from "../config";

const API_URL = API_ENDPOINTS.LEAVES;
const API_URL_UPLOAD = API_ENDPOINTS.UPLOADS;
const EMPLOYEES_API = API_ENDPOINTS.EMPLOYEES;
const statusOptions = ["Pending", "Approved", "Rejected"];

const initialForm = {
  name: "",
  date: "",
  reason: "",
  status: "Pending",
  docs: "",
};

const Leaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [filterStatus, setFilterStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [dropdownIndex, setDropdownIndex] = useState(null);
  const [empLoading, setEmpLoading] = useState(true);
  const dropdownRefs = useRef([]);

  useEffect(() => {
    fetchLeaves();
    fetchEmployees();
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleClickOutside = (e) => {
    if (dropdownRefs.current.some((ref) => ref && ref.contains(e.target))) return;
    setDropdownIndex(null);
  };

  const fetchLeaves = async () => {
    try {
      const res = await axios.get(API_URL);
      setLeaves(res.data);
    } catch (err) {
      toast.error("Failed to fetch leave records!");
    }
  };

  const fetchEmployees = async () => {
    try {
      setEmpLoading(true);
      const res = await axios.get(EMPLOYEES_API);
      setEmployees(res.data || []);
    } catch (err) {
      toast.error("Failed to fetch employee list!");
    } finally {
      setEmpLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "docs" && files.length > 0) {
      setFormData({ ...formData, docs: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateForm = () => {
    if (!formData.name || !formData.date || !formData.reason) {
      toast.warn("Please fill out all required fields.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const form = new FormData();
      Object.keys(formData).forEach((key) => form.append(key, formData[key]));

      if (editId) {
        await axios.put(`${API_URL}/${editId}`, form);
        toast.success("Leave updated successfully.");
      } else {
        await axios.post(API_URL, form);
        toast.success("Leave added successfully.");
      }

      fetchLeaves();
      setFormData(initialForm);
      setShowForm(false);
      setEditId(null);
    } catch (err) {
      toast.error("Error submitting leave.");
    }
  };

  const handleEdit = (leave) => {
    setFormData({
      name: leave.name,
      date: leave.date,
      reason: leave.reason,
      status: leave.status,
      docs: leave.docs,
    });
    setEditId(leave._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this leave?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_URL}/${id}`);
      toast.success("Leave deleted successfully.");
      fetchLeaves();
    } catch (err) {
      toast.error("Error deleting leave.");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await axios.put(`${API_URL}/${id}`, { status });
      toast.info(`Status updated to ${status}`);
      fetchLeaves();
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  const filteredLeaves = leaves.filter(
    (leave) =>
      (filterStatus === "All" || leave.status === filterStatus) &&
      (leave.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const approvedLeaves = leaves.filter((l) => l.status === "Approved");

  const leaveCountByDate = leaves.reduce((acc, leave) => {
    if (leave.status === "Approved") {
      const date = new Date(leave.date).toDateString();
      acc[date] = (acc[date] || 0) + 1;
    }
    return acc;
  }, {});

  const getEmpDesignation = (name) => {
    const emp = employees.find((e) => e.fullName === name);
    return emp ? emp.designation : "";
  };

  return (
    <div className="leave-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="leave-left">
        <div className="leave-header">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            {["All", ...statusOptions].map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <div className="right-controls">
            <button
              className="violet-button"
              onClick={() => {
                setShowForm(true);
                setFormData(initialForm);
                setEditId(null);
              }}
            >
              Add Leave
            </button>
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <h3>Applied Leaves</h3>
        <table className="leave-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Designation</th>
              <th>Date</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Docs</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeaves.map((leave, idx) => (
              <tr key={leave._id}>
                <td>{leave.name}</td>
                <td>{getEmpDesignation(leave.name)}</td>
                <td>{new Date(leave.date).toLocaleDateString()}</td>
                <td>{leave.reason}</td>
                <td>
                  <select
                    value={leave.status}
                    onChange={(e) => handleStatusChange(leave._id, e.target.value)}
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  {leave.docs && (
                    <a href={`${API_URL_UPLOAD}/${leave.docs}`} download>
                      Download
                    </a>
                  )}
                </td>
                <td>
                  <div className="action-col" ref={(el) => (dropdownRefs.current[idx] = el)}>
                    <FiMoreVertical
                      onClick={() => setDropdownIndex(dropdownIndex === idx ? null : idx)}
                    />
                    {dropdownIndex === idx && (
                      <div className="dropdown-menu active">
                        <div onClick={() => handleEdit(leave)}>Edit</div>
                        <div onClick={() => handleDelete(leave._id)}>Delete</div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="leave-right">
        <Calendar
          tileContent={({ date }) => {
            const dateStr = date.toDateString();
            return leaveCountByDate[dateStr] ? (
              <div className="date-badge">{leaveCountByDate[dateStr]}</div>
            ) : null;
          }}
        />

        <div className="approved-list">
          <h4>Approved Leaves</h4>
          {approvedLeaves.map((leave) => (
            <div key={leave._id} className="approved-card">
              <div>
                <strong>{leave.name}</strong>
                <div className="designation">{getEmpDesignation(leave.name)}</div>
                <div>{new Date(leave.date).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showForm && (
        <div className="popup-overlay">
          <div className="popup-form">
            <div className="popup-header">
              <h3>{editId ? "Edit Leave" : "Add Leave"}</h3>
              <span onClick={() => setShowForm(false)}>&times;</span>
            </div>
            <div className="popup-body grid-form">
              <div className="form-group">
                <label>Name</label>
                {empLoading ? (
                  <p>Loading employees...</p>
                ) : employees.length > 0 ? (
                  <select name="name" value={formData.name} onChange={handleInputChange}>
                    <option value="">Select</option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp.fullName}>
                        {emp.fullName}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p>No employees found</p>
                )}
              </div>

              <div className="form-group">
                <label>Designation</label>
                <input
                  type="text"
                  value={getEmpDesignation(formData.name)}
                  readOnly
                />
              </div>

              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Reason</label>
                <input
                  type="text"
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Docs</label>
                <input type="file" name="docs" onChange={handleInputChange} />
              </div>

              <div className="form-group full-width">
                <button className="violet-button" onClick={handleSubmit}>
                  {editId ? "Update" : "Submit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaves;
