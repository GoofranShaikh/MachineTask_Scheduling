const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PermissionSchema = new Schema({
    PermissionName: { type: String, required: true },
    Description: { type: String }
  });
  
  const Permission = mongoose.model('Permission', PermissionSchema);
  module.exports = Permission;
  