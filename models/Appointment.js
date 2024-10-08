const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AppointmentSchema = new Schema({
    ManagerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    AppointedDate: { type: Date, required: true },
    Attendees: [{
      DeveloperId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      Status: { type: String, enum: ['Accepted', 'Declined',null] ,default:null},
      ResponseTime: { type: Date,default: null }
    }],
    CreatedAt: { type: Date, default: Date.now },
    UpdatedAt: { type: Date, default: Date.now },
    Status: { type: String, enum: ['Scheduled', 'Cancelled'], default: 'Scheduled' }
  });
  
  const Appointment = mongoose.model('Appointment', AppointmentSchema);
  module.exports = Appointment;
  