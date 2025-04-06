// Attendance.js
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiMoreVertical } from "react-icons/fi";
import "../styles/Attendance.css";
import { API_ENDPOINTS } from "../config";

const API_URL = API_ENDPOINTS.ATTENDANCE;
const statusOptions = ["Present", "Absent", "Work From Home", "Medical Leave"];
const initialForm = {
  employee: "",
  date: "",
  task: "",
  status: "Present",
};

const Attendance = () => {
  const [records, setRecords] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const dropdownRefs = useRef({});

  console.log('dropdownOpen', dropdownOpen)

  useEffect(() => {
    fetchAttendance();
    fetchEmployees();
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchAttendance = async () => {
    try {
      const res = await axios.get(API_URL);
      setRecords(res.data);
    } catch {
      toast.error("Error fetching attendance records.");
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/employees");
      setEmployees(res.data);
    } catch {
      toast.error("Error fetching employees.");
    }
  };

  const handleClickOutside = (e) => {
    Object.keys(dropdownRefs.current).forEach((key) => {
      if (
        dropdownRefs.current[key] &&
        !dropdownRefs.current[key].contains(e.target)
      ) {
        setDropdownOpen(null);
      }
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const { employee, date, task } = formData;
    if (!employee || !date || !task.trim()) {
      toast.error("Please fill all required fields.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, formData);
        toast.success("Attendance updated successfully.");
      } else {
        await axios.post(API_URL, formData);
        toast.success("Attendance added successfully.");
      }
      fetchAttendance();
      setFormData(initialForm);
      setShowForm(false);
      setEditId(null);
    } catch {
      toast.error("Error submitting attendance.");
    }
  };

  const handleEdit = (rec) => {
    setFormData({
      employee: rec.employee._id,
      date: rec.date.split("T")[0],
      task: rec.task,
      status: rec.status,
    });
    setEditId(rec._id);
    setShowForm(true);
    setDropdownOpen(null);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchAttendance();
      toast.success("Attendance deleted successfully.");
    } catch {
      toast.error("Error deleting attendance.");
    }
    setDropdownOpen(null);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`${API_URL}/${id}`, { status: newStatus });
      fetchAttendance();
      toast.success("Status updated.");
    } catch {
      toast.error("Error updating status.");
    }
  };

  const filteredRecords = records.filter((rec) => {
    const matchesStatus = statusFilter ? rec.status === statusFilter : true;
    const matchesSearch = searchTerm
      ? rec.employee?.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="attendance-container">
      <ToastContainer />
      <div className="attendance-header">
        <select
          className="search-input"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <div className="attendance-header-actions">
          <input
            type="text"
            placeholder="Search by employee name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button
            className="violet-button"
            onClick={() => {
              setShowForm(true);
              setFormData(initialForm);
              setEditId(null);
            }}
          >
            Add Attendance
          </button>
        </div>
      </div>

      <table className="attendance-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Date</th>
            <th>Task</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredRecords.map((rec) => (
            <tr key={rec._id}>
              <td>{rec.employee?.fullName || "N/A"}</td>
              <td>{new Date(rec.date).toLocaleDateString()}</td>
              <td>{rec.task}</td>
              <td>
                <select
                  className="status-dropdown"
                  value={rec.status}
                  onChange={(e) => handleStatusChange(rec._id, e.target.value)}
                >
                  {statusOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </td>
              <td
                className="action-cell"
                ref={(el) => (dropdownRefs.current[rec._id] = el)}
              >
                <button
                  className="icon-button"
                  onClick={() =>
                    setDropdownOpen(dropdownOpen === rec._id ? null : rec._id)
                  }
                >
                  <FiMoreVertical size={20} />
                </button>
                {dropdownOpen === rec._id && (
                  <div className="dropdown-menu">
                    <div onClick={() => handleEdit(rec)}>Edit</div>
                    <div onClick={() => handleDelete(rec._id)}>Delete</div>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && (
        <div className="popup-overlay">
          <div className="popup-form">
            <div className="popup-header">
              <h3>{editId ? "Edit Attendance" : "Add Attendance"}</h3>
              <span onClick={() => setShowForm(false)}>&times;</span>
            </div>
            <div className="popup-body grid-form">
              <div className="form-group">
                <label htmlFor="employee">Employee</label>
                <select
                  name="employee"
                  value={formData.employee}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.fullName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="date">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="task">Task</label>
                <input
                  type="text"
                  name="task"
                  value={formData.task}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  {statusOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="action-button-container">
              <button className="violet-button" onClick={handleSubmit}>
                {editId ? "Update" : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;