const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const cron = require('node-cron');

const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');

const Attendance = require('./models/Attendance');
const Employee = require('./models/Employee');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/uploads', express.static('uploads'));

const initializeTodayAttendance = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
        const alreadyExists = await Attendance.findOne({ date: today });
        if (alreadyExists) {
            console.log('Attendance already initialized for today.');
            return;
        }

        const employees = await Employee.find();
        for (const emp of employees) {
            await new Attendance({
                employee: emp._id,
                date: today,
                status: 'Present',
                task: '',
            }).save();
        }

        console.log('Attendance initialized for all employees.');
    } catch (error) {
        console.error('Error initializing attendance:', error.message);
    }
};

cron.schedule('1 0 * * *', async () => {
    console.log('Running daily attendance initialization...');
    await initializeTodayAttendance();
});

app.get('/api/manual-attendance', async (req, res) => {
    try {
        await initializeTodayAttendance();
        res.status(200).json({ message: 'Manual attendance initialized (if not already).' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create attendance' });
    }
});

initializeTodayAttendance();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
