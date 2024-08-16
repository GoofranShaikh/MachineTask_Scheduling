const express = require('express');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const app = express();
connectDB();
// app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/appointment', appointmentRoutes);


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

