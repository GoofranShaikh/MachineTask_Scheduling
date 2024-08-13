const mongoose = require('mongoose');
// Import models
// const User = require('./../models/User');
// const Role = require('./../modelss/Role');
// const Permission = require('./../models/Permission');
// const RolePermissionMapping = require('./../models/RolePermissionMapping');
// const Appointment = require('./../models/Appointment');
// const BulkUpload = require('./../models/BulkUpload');
// const Report = require('./../models/Report');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser:true,
        useUnifiedTopology:true,
    });
    console.log('MongoDB connected...');
  } catch (err) {
    console.log('error conneciing')
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
