import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FiMoreVertical } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/Candidates.css";

const API_URL = "http://localhost:5000/api/candidates";

const levels = ["All", "Fresher", "Mid", "Senior"];
const statusOptions = ["New", "Shortlisted", "Interviewed", "Selected"];

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  position: "",
  experience: "",
  resume: "",
  appliedDate: "",
  status: "New",
};

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [filterLevel, setFilterLevel] = useState("All");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [dropdownIndex, setDropdownIndex] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const dropdownRefs = useRef([]);

  useEffect(() => {
    fetchCandidates();
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleClickOutside = (e) => {
    if (dropdownRefs.current.some((ref) => ref && ref.contains(e.target))) return;
    setDropdownIndex(null);
  };

  const fetchCandidates = async () => {
    try {
      const res = await axios.get(API_URL);
      setCandidates(res.data);
    } catch (err) {
      toast.error("Error fetching candidates.");
      console.error("Error fetching candidates:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "resume" && files.length > 0) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, resume: reader.result });
      };
      reader.readAsDataURL(files[0]);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateForm = () => {
    const { fullName, email, phone, position, experience, appliedDate } = formData;

    if (!fullName || !email || !phone || !position || !experience || !appliedDate) {
      toast.warning("Please fill all required fields.");
      return false;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    const phoneRegex = /^[0-9]{10}$/;

    if (!emailRegex.test(email)) {
      toast.warning("Invalid email format.");
      return false;
    }

    if (!phoneRegex.test(phone)) {
      toast.warning("Phone number must be 10 digits.");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, formData);
        toast.success("Candidate updated successfully!");
      } else {
        await axios.post(API_URL, formData);
        toast.success("Candidate added successfully!");
      }
      fetchCandidates();
      setFormData(initialForm);
      setShowForm(false);
      setEditId(null);
    } catch (err) {
      toast.error("Error submitting candidate.");
      console.error("Error submitting form:", err);
    }
  };

  const handleEdit = (candidate) => {
    setFormData(candidate);
    setEditId(candidate._id);
    setShowForm(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${API_URL}/${confirmDeleteId}`);
      toast.success("Candidate deleted successfully!");
      fetchCandidates();
      setConfirmDeleteId(null);
    } catch (err) {
      toast.error("Error deleting candidate.");
      console.error("Error deleting candidate:", err);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`${API_URL}/${id}`, { status: newStatus });
      toast.success("Status updated!");
      fetchCandidates();
    } catch (err) {
      toast.error("Error updating status.");
      console.error("Error updating status:", err);
    }
  };

  const filteredCandidates = candidates.filter(
    (cand) =>
      (filterLevel === "All" || cand.experience === filterLevel) &&
      cand.fullName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="candidates-container">
      <ToastContainer />
      <div className="candidates-header">
        <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)} className="filter-dropdown">
          {levels.map((lvl) => (
            <option key={lvl} value={lvl}>
              {lvl}
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
            Add Candidate
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

      <table className="candidate-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Position</th>
            <th>Experience</th>
            <th>Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredCandidates.map((cand, idx) => (
            <tr key={cand._id}>
              <td>{cand.fullName}</td>
              <td>{cand.email}</td>
              <td>{cand.phone}</td>
              <td>{cand.position}</td>
              <td>{cand.experience}</td>
              <td>{new Date(cand.appliedDate).toLocaleDateString()}</td>
              <td>
                <select
                  value={cand.status}
                  onChange={(e) => handleStatusChange(cand._id, e.target.value)}
                  className="status-dropdown"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <div className="action-dropdown" ref={(el) => (dropdownRefs.current[idx] = el)}>
                  <FiMoreVertical onClick={() => setDropdownIndex(dropdownIndex === idx ? null : idx)} />
                  {dropdownIndex === idx && (
                    <div className="dropdown-menu active">
                      <div onClick={() => handleEdit(cand)}>Edit</div>
                      <div onClick={() => setConfirmDeleteId(cand._id)}>Delete</div>
                      {cand.resume && (
                        <div>
                          <a
                            href={`http://localhost:5000/api/candidates/download/${cand.resume}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            style={{ textDecoration: "none", color: "inherit" }}
                          >
                            Download
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="popup-overlay">
          <div className="popup-form">
            <div className="popup-header">
              <h3>{editId ? "Edit Candidate" : "Add Candidate"}</h3>
              <span onClick={() => setShowForm(false)}>&times;</span>
            </div>
            <div className="popup-body grid-form">
              {["fullName", "email", "phone", "position", "experience", "resume", "appliedDate", "status"].map((field) => (
                <div className="form-group" key={field}>
                  <label htmlFor={field}>
                    {field.replace(/([A-Z])/g, " $1")} <span style={{ color: "red" }}>*</span>
                  </label>
                  {field === "experience" ? (
                    <select name="experience" value={formData.experience} onChange={handleInputChange}>
                      <option value="">Select</option>
                      {levels.slice(1).map((lvl) => (
                        <option key={lvl} value={lvl}>
                          {lvl}
                        </option>
                      ))}
                    </select>
                  ) : field === "resume" ? (
                    <input type="file" name="resume" onChange={handleInputChange} />
                  ) : field === "appliedDate" ? (
                    <input type="date" name="appliedDate" value={formData.appliedDate} onChange={handleInputChange} />
                  ) : field === "status" ? (
                    <select name="status" value={formData.status} onChange={handleInputChange}>
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input type="text" name={field} value={formData[field]} onChange={handleInputChange} />
                  )}
                </div>
              ))}
            </div>
            <div className="action-button-container">
              <button className="violet-button" onClick={handleSubmit}>
                {editId ? "Update" : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      {confirmDeleteId && (
        <div className="popup-overlay">
          <div className="confirm-popup">
            <h3>Are you sure you want to delete this candidate?</h3>
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

export default Candidates;