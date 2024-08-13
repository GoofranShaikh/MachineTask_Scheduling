const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  Name: { type: String, required: true },
  Email: {type:String, required:true, unique:true,  lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']},
  Password: { type: String, required: true }, 
  RoleId: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
  BlockedUser: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  CreatedAt: { type: Date, default: Date.now },
  UpdatedAt: { type: Date, default: Date.now },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
