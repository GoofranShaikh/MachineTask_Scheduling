const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const User = require('../models/User');


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

//Accept/Decline appointment
const appointmentAction = async(req,res)=>{
    try{
        const{appointmentId,attendeeId,status} =req.body;
       
        if(!['Accepted','Declined'].includes(status)){
           return res.status(400).json({error:'Invalid Status codes'})
        }
        let appointment = await Appointment.findOneAndUpdate({
           _id:appointmentId,
           'Attendees.DeveloperId':attendeeId
        },
        {
       
            $set:{
               'Attendees.$.Status':status,
               'Attendees.$.ResponseTime':Date.now()
            },
           UpdatedAt:Date.now()
        },
       {new:true} //to return the updated document
       );
       
       if (!appointment) {
           return res.status(404).json({ error: 'Appointment or Attendee not found' });
         }
       
         res.json({ message: 'Status updated successfully', appointment });
    }
    catch(err){
        console.error(err.message);
        res.status(400).json({error:err.message});
    }
 
}


const appointmentByAppointmentId =async (req, res) => {
    try {
      const { AppointmentId,UserId} = req.body;
  
      // Find the appointment by ID
      const appointment = await Appointment.findOne({_id:AppointmentId,ManagerId:UserId})
        .populate('ManagerId','Name Email')
        .populate('Attendees.DeveloperId', 'Name Email'); // Populating developer details
 
      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }
  
  
      res.json(appointment);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Server error' });
    }
  };

  const listAppoinments =async(req,res)=>{
    try{
        const UserId = req.user?.UserId;
        const {startDate,endDate}= req.query;

        let query ={
          $or:[
            { ManagerId: new mongoose.Types.ObjectId(UserId) },
            { 'Attendees.DeveloperId': new mongoose.Types.ObjectId(UserId) }
          ]
          
        }
        query.AppointedDate = {};
        if(startDate){
          query['AppointedDate']['$gte'] = new Date(startDate);
        }
        if(endDate){
          query['AppointedDate']['$lte']  = new Date(endDate);
        }
        let filteredAppointments = await Appointment.find(query)
        res.status(200).json(filteredAppointments);
      }
    catch(err){
        console.error(err.message);
        res.status(400).json({error:err.message});
    }
  }


  const blockUser =async(req,res)=>{
    try{
      const{userid} = req.params;
      const{LoggedInUserId} =req.body;
    // Find the current user
    const user = await User.findById(LoggedInUserId);
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Add the blockUserId to the blockedUsers array if not already blocked
    if (!user.BlockedUser.includes(userid)) {
        user.BlockedUser.push(userid);
        await user.save();
    }

    res.status(200).json({ success: true, message: 'User blocked successfully.' });
    }
    catch(err){
      res.status(400).json({error:'err.msg'})
    }

  }
  
 

// Exporting the createAppointment function
module.exports = { createAppointment,appointmentAction ,appointmentByAppointmentId,listAppoinments,blockUser};
