const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BulkUploadSchema = new Schema({
    UploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    FileName: { type: String, required: true },
    CreatedAt: { type: Date, default: Date.now },
    TotalRecords: { type: Number, required: true },
    SuccessRecords: { type: Number, required: true },
    ErrorRecords: { type: Number, required: true },
    ErrorDetails: [{
      Row: { type: Number, required: true },
      Error: { type: String, required: true }
    }],
    file_url: { type: String, required: true }
  });
  
  const BulkUpload = mongoose.model('BulkUpload', BulkUploadSchema);
  module.exports = BulkUpload;
  