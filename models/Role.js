const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoleSchema = new Schema({
    RoleName:{type:String,required:true},
    Description:{type:String},
});

const Role = mongoose.model('Role',RoleSchema);
module.exports = Role;