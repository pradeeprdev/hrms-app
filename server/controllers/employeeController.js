const Employee = require('../models/Employee');

// Create a new employee
exports.createEmployee = async (req, res) => {
  try {
    const newEmployee = new Employee(req.body);
    await newEmployee.save();
    res.status(201).json(newEmployee);
  } catch (err) {
    res.status(400).json({ message: 'Error creating employee', error: err });
  }
};

// Get all employees with optional filtering and search
exports.getAllEmployees = async (req, res) => {
  try {
    const { position, search } = req.query;
    const filter = {};

    if (position) filter.position = position;
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const employees = await Employee.find(filter);
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// Get single employee
exports.getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching employee', error: err });
  }
};

// Update employee
exports.updateEmployee = async (req, res) => {
  try {
    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedEmployee);
  } catch (err) {
    res.status(400).json({ message: 'Error updating employee', error: err });
  }
};

// Delete employee
exports.deleteEmployee = async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: 'Error deleting employee', error: err });
  }
};