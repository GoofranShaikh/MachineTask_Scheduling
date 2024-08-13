const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RolePermissionMappingSchema = new Schema({
    RoleId: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
    Permission_ids: [{ type: Schema.Types.ObjectId, ref: 'Permission', required: true }]
  });
  
  const RolePermissionMapping = mongoose.model('RolePermissionMapping', RolePermissionMappingSchema);
  module.exports = RolePermissionMapping;
  