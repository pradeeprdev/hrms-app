import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FiMoreVertical } from "react-icons/fi";
import "../styles/Attendance.css";

const API_URL = "http://localhost:5000/api/attendance";
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
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchAttendance();
    fetchEmployees();
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const fetchAttendance = async () => {
    try {
      const res = await axios.get(API_URL);
      setRecords(res.data);
    } catch (err) {
      console.error("Error fetching attendance:", err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/employees");
      setEmployees(res.data);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpen(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, formData);
      } else {
        await axios.post(API_URL, formData);
      }
      fetchAttendance();
      setFormData(initialForm);
      setShowForm(false);
      setEditId(null);
    } catch (err) {
      console.error("Error submitting attendance:", err);
    }
  };

  const handleEdit = (record) => {
    setFormData({
      employee: record.employee._id,
      date: record.date.split("T")[0],
      task: record.task,
      status: record.status,
    });
    setEditId(record._id);
    setShowForm(true);
    setDropdownOpen(null);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchAttendance();
    } catch (err) {
      console.error("Error deleting attendance:", err);
    }
    setDropdownOpen(null);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`${API_URL}/${id}`, { status: newStatus });
      fetchAttendance();
    } catch (err) {
      console.error("Error updating status:", err);
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
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
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
              <td className="action-cell" ref={dropdownRef}>
                <FiMoreVertical
                  className="dots-icon"
                  onClick={() =>
                    setDropdownOpen(dropdownOpen === rec._id ? null : rec._id)
                  }
                />
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
