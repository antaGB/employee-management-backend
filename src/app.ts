import express from 'express';
import cors from "cors";
import dotenv from "dotenv"
import userRoutes from './routes/userRoutes';
import employeeRoutes from './routes/employeeRoutes';
import departmentRoutes from './routes/departmentRoutes';
import holidayRoutes from './routes/holidayRoutes';
import authRoutes from './routes/authRoutes';
import shiftRoutes from './routes/shiftRoutes';
import attendanceRoutes from './routes/attendanceRoutes';
import leaveRoutes from './routes/leaveRoutes';
import scheduleRoutes from './routes/scheduleRoutes';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/attendances', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/holidays', holidayRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});