import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../styles/Leaves.css";
import { FiMoreVertical } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = "http://localhost:5000/api/leaves";
const statusOptions = ["Pending", "Approved", "Rejected"];

const employeeNames = [
  { name: "Alice", designation: "Developer" },
  { name: "Bob", designation: "Designer" },
  { name: "Charlie", designation: "Manager" },
  { name: "David", designation: "QA Engineer" },
  { name: "Evelyn", designation: "HR" },
];

const initialForm = {
  name: "",
  designation: "",
  date: "",
  reason: "",
  status: "Pending",
  docs: "",
};

const Leaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [filterStatus, setFilterStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [dropdownIndex, setDropdownIndex] = useState(null);
  const dropdownRefs = useRef([]);

  useEffect(() => {
    fetchLeaves();
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
      console.error("Error fetching leaves:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "docs" && files.length > 0) {
      setFormData({ ...formData, docs: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });

      if (name === "name") {
        const selectedEmp = employeeNames.find((emp) => emp.name === value);
        if (selectedEmp) {
          setFormData((prev) => ({ ...prev, designation: selectedEmp.designation }));
        }
      }
    }
  };

  const validateForm = () => {
    if (!formData.name || !formData.designation || !formData.date || !formData.reason) {
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
      console.error("Error submitting leave:", err);
    }
  };

  const handleEdit = (leave) => {
    setFormData(leave);
    setEditId(leave._id);
    setShowForm(true);
  };

  const handleStatusChange = async (id, status) => {
    try {
      await axios.put(`${API_URL}/${id}`, { status });
      toast.info(`Status updated to ${status}`);
      fetchLeaves();
    } catch (err) {
      toast.error("Failed to update status.");
      console.error("Error updating status:", err);
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

  return (
    <div className="leave-container">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="leave-left">
        <div className="leave-header">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            {["All", ...statusOptions].map((status) => (
              <option key={status} value={status}>{status}</option>
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
              <th>Profile</th>
              <th>Name</th>
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
                <td>
                  <img
                    src={leave.profile || "/default-profile.png"}
                    alt="profile"
                    className="profile-img"
                  />
                </td>
                <td>{leave.name}</td>
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
                    <a
                      href={`http://localhost:5000/uploads/${leave.docs}`}
                      download
                    >
                      Download
                    </a>
                  )}
                </td>
                <td>
                  <div ref={(el) => (dropdownRefs.current[idx] = el)}>
                    <FiMoreVertical
                      onClick={() =>
                        setDropdownIndex(dropdownIndex === idx ? null : idx)
                      }
                    />
                    {dropdownIndex === idx && (
                      <div className="dropdown-menu active">
                        <div onClick={() => handleEdit(leave)}>Edit</div>
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
              <img
                src={leave.profile || "/default-profile.png"}
                alt="profile"
                className="profile-img"
              />
              <div>
                <strong>{leave.name}</strong>
                <div className="designation">{leave.designation}</div>
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
                <select name="name" value={formData.name} onChange={handleInputChange}>
                  <option value="">Select</option>
                  {employeeNames.map((emp) => (
                    <option key={emp.name} value={emp.name}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Designation</label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
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

export default Leaves;