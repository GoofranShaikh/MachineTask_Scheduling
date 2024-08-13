const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReportSchema = new Schema({
    CreatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    DateRange: {
      StartDate: { type: Date, required: true },
      EndDate: { type: Date, required: true }
    },
    MeetingScheduled: { type: Number, required: true },
    MeetingAttended: { type: Number, required: true },
    CreatedAt: { type: Date, default: Date.now },
    export_url: { type: String, required: true }
  });
  
  const Report = mongoose.model('Report', ReportSchema);
  module.exports = Report;
  