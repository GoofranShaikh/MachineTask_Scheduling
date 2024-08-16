const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Report = require('../models/Report');
const xlsx = require('xlsx');


const createAppointment = async (req, res) => {
  try {
    let { ManagerId, AppointedDate, Status, Attendees } = req.body;
    const currentUser = await User.findById(ManagerId).select('BlockedUser').lean();
    if (Attendees?.length == 0 || Attendees == null || Attendees == undefined) {
      return res.status(400).json({ error: 'Attendees are mandatory' });
    }

    const appointment = new Appointment({
      ManagerId: new mongoose.Types.ObjectId(ManagerId),
      AppointedDate: new Date(AppointedDate),
      Attendees: getAttendees(Attendees, currentUser),
      Status
    });

    if (Attendees?.length != appointment?.Attendees?.length) {
      return res.status(400).json({ error: 'There might be few user in your block list with whom you are scheduling meeting, Kindly remove those users' })
    }
    await appointment.save();
    res.status(200).json(appointment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}


const getAttendees = (Attendees, currentUser) => {
  let blockUsers = [];
  let BlockedList = [];
  if (currentUser != null && currentUser != undefined) {
    BlockedList = currentUser.BlockedUser.map(res => res?.toString());
  }
  Attendees.map((elm) => {
    if (!BlockedList.includes(elm?.DeveloperId)) { //check  user is not blocked
      let AttendeesObj = {
        DeveloperId: new mongoose.Types.ObjectId(elm?.DeveloperId),
        Status: elm?.Status
      };
      blockUsers.push(AttendeesObj);
    }
  });
  return blockUsers;

}

//Accept/Decline appointment
const appointmentAction = async (req, res) => {
  try {
    const { appointmentId, attendeeId, status } = req.body;

    if (!['Accepted', 'Declined'].includes(status)) {
      return res.status(400).json({ error: 'Invalid Status codes' })
    }
    let appointment = await Appointment.findOneAndUpdate({
      _id: appointmentId,
      'Attendees.DeveloperId': attendeeId
    },
      {

        $set: {
          'Attendees.$.Status': status,
          'Attendees.$.ResponseTime': Date.now()
        },
        UpdatedAt: Date.now()
      },
      { new: true } //to return the updated document
    );

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment or Attendee not found' });
    }

    res.json({ message: 'Status updated successfully', appointment });
  }
  catch (err) {
    console.error(err.message);
    res.status(400).json({ error: err.message });
  }

}


const appointmentByAppointmentId = async (req, res) => {
  try {
    const { AppointmentId, UserId } = req.body;

    // Find the appointment by ID
    const appointment = await Appointment.findOne({ _id: AppointmentId, ManagerId: UserId })
      .populate('ManagerId', 'Name Email')
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

const listAppoinments = async (req, res) => {
  try {
    const UserId = req.user?.UserId;
    const { startDate, endDate } = req.query;

    let query = {
      $or: [
        { ManagerId: new mongoose.Types.ObjectId(UserId) },
        { 'Attendees.DeveloperId': new mongoose.Types.ObjectId(UserId) }
      ]

    }
    query.AppointedDate = {};
    if (startDate) {
      query['AppointedDate']['$gte'] = new Date(startDate);
    }
    if (endDate) {
      query['AppointedDate']['$lte'] = new Date(endDate);
    }
    let filteredAppointments = await Appointment.find(query)
    res.status(200).json(filteredAppointments);
  }
  catch (err) {
    console.error(err.message);
    res.status(400).json({ error: err.message });
  }
}


const blockUser = async (req, res) => {
  try {
    const { userid } = req.params;
    const { LoggedInUserId } = req.body;
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
  catch (err) {
    res.status(400).json({ error: 'err.msg' })
  }

}


const cancelAppointment = async (req, res) => {
  const { appointmentId } = req.body;
  const userId = req.user.UserId;

  try {
    const appointment = await Appointment.findOne(
      {
        ManagerId: new mongoose.Types.ObjectId(userId),
        _id: new mongoose.Types.ObjectId(appointmentId)

      })
    appointment.Status = 'Cancelled';
    await appointment.save();



    return res.status(200).json({ message: "Appointment Cancelled successfully." });
  } catch (err) {
    return res.status(500).json({ error: err?.message });
  }
};


const exportMeeting = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    let query = {
      ManagerId: new mongoose.Types.ObjectId(req.user.UserId)
    }
    console.log(startDate, 'startDate')
    if (startDate) {
      if (query['AppointedDate'] == undefined) {
        query.AppointedDate = {};
      }
      query['AppointedDate']['$gte'] = new Date(startDate);
    }
    if (endDate) {
      query['AppointedDate']['$lte'] = new Date(endDate);
    }
    if (status) {
      query['Status'] = status
    }
    console.log(query, 'query')

    let filteredAppointments = await Appointment.find(query).populate('ManagerId', 'Name').populate('Attendees.DeveloperId', 'Name Email');
    console.log(filteredAppointments, 'filteredAppointments')
    let meetings = await exportToExcel(filteredAppointments);

    // Create a new workbook and add the data
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(meetings);

    xlsx.utils.book_append_sheet(workbook, worksheet, 'Meetings');

    const buffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    const base64Data = buffer.toString('base64');
    res.setHeader('Content-Type', 'application/json');

    // Send the Base64-encoded data as JSON
    res.status(200).json({
      filename: 'meetings.xlsx',
      data: base64Data
    });

    // Send the Excel file as the response

  }
  catch (err) {
    res.status(400).json({ error: err.message });
  }
}

const exportToExcel = async (meetings) => {
  const excelData = meetings.map(meeting => ({
    "Meeting ID": meeting._id.toString(),
    "AppointedDate": meeting.AppointedDate.toISOString(),
    "Status": meeting.Status,
    "Attendees": meeting?.Attendees?.map((elm) => elm.DeveloperId.Name).join(','),
    "ManagerName": meeting.ManagerId?.Name
  }));

  return excelData
}


const meetingReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user.UserId; let query = {
      ManagerId: new mongoose.Types.ObjectId(req.user.UserId)
    }
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);


    if (query['AppointedDate'] == undefined) {
      query.AppointedDate = {};
    }
    query['AppointedDate']['$gte'] = startDate ? new Date(startDate) : currentMonthStart;

    if (endDate) {
      query['AppointedDate']['$lte'] = endDate ? new Date(endDate) : currentMonthEnd;
    }
    query['Status'] = 'Scheduled';
    query['ManagerId'] = userId;

    const meetingScheduled = await Appointment.countDocuments(query);
    const MeetingAttended = await Appointment.countDocuments({ ...query, 'Attendees.Status': 'Accepted' });

    const report = new Report({
      CreatedBy: userId,
      DateRange: {
        StartDate: startDate ? startDate : currentMonthStart,
        EndDate: endDate ? endDate : currentMonthEnd
      },
      MeetingScheduled: meetingScheduled,
      MeetingAttended: MeetingAttended
    })

    await report.save();
    res.status(200).json(report);
  }
  catch (err) {
    res.status(400).json({ error: err.message });
  }


}


// Exporting the createAppointment function
module.exports = { createAppointment, appointmentAction, appointmentByAppointmentId, listAppoinments, blockUser, cancelAppointment, exportMeeting, meetingReport };
