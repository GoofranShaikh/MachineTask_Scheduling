const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');

const createAppointment = async(req, res) => {
    try {
        let { ManagerId, AppointedDate, Status, Attendees } = req.body;

        // Creating a new appointment instance
        const appointment = new Appointment({
            ManagerId: new mongoose.Types.ObjectId(ManagerId),
            AppointedDate: new Date(AppointedDate),
            Attendees: getAttendees(Attendees),
            Status
        });

        // Saving the appointment to the database
        await appointment.save();

        // Sending the response
        res.status(200).json(appointment);
    } catch (err) {
        // Handling errors
        res.status(400).json({ error: err.message });
    }
}

// Function to transform attendees
const getAttendees = (Attendees) => {
    return Attendees.map((elm) => {
        return {
            DeveloperId: new mongoose.Types.ObjectId(elm?.DeveloperId),
            Status: elm?.Status
        };
    });
}

// Exporting the createAppointment function
module.exports = { createAppointment };
