const User = require('../models/User');
const Role = require('../models/Role')
const Permission = require('../models/Permission')
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer=require('nodemailer');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
dotenv.config();
const jwtSceret = process.env.SECKRET_KEY;

const createRole = async (req, res) => {
    let role;
    role = new Role({
        RoleName: req.body.RoleName,
        Description: req.body.Description
    })
    await role.save();
    res.status(201).json({ msg: 'User Registered Successfully' });

}

const createPermissions = async (req, res) => {
    let permission;
    permission = new Permission({
        PermissionName: req.body.PermissionName,
        Description: req.body.Description
    })
    await permission.save();
    res.status(201).json({ msg: 'Permission Created Successfully' });

}

const findUserByEmail =  async(Email)=>{
    let user = await User.findOne({ Email });
    return user;
}

const registerUser = async (req, res) => {
    try {
        const { Name, Email, Password, RoleId } = req.body;
        let user = findUserByEmail(Email);
        if (user) {
            return res.status(400).json({ msg: 'User Already Exist' });
        }

        user = new User({
            Name,
            Email,
            Password: await getHashedPassword(Password),
            RoleId
        })

        await user.save();
        res.status(201).json({ msg: 'User Registered Successfully' });
    }
    catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
}

const forgotPassword = async (req, res) => {
    try {
        const { Email } = req.body;
        let user = await User.findOne({ Email });
        if (!user) {
            return res.status(400).json({ error: 'User Id Not Registered' });
        }
        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 60000; // 1 min
        await user.save();
        // Send email with the token
        const transporter = nodemailer.createTransport({
            service: 'Gmail', // Use your email provider
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.PASS_KEY,
            },
        });

        const mailOptions = {
            to: user.Email,
            from: 'passwordreset@yourapp.com',
            subject: 'Password Reset',
            text: `You are receiving this because you  have requested the reset of the password for your account.\n
    Please click on the following link, or paste this into your browser to complete the process:\n
    ${process.env.RESETPASS_URI}/${token}\n
    If you did not request this, please ignore this email and your password will remain unchanged.\n`
        };

        transporter.sendMail(mailOptions, (err, response) => {
            if (err) {
                console.error('Error sending email:', err);
                return res.status(500).json({ error: 'Error sending email' });
            }
            res.status(200).json({ msg: 'Password reset email sent successfully' });
        });

    }
    catch (err) {
        console.error(err.message);
        res.status(400).json({error:err.message});

    }
}

const resetPassword = async(req,res)=>{
    try{
        const resetToken = req.params;
        const {Password} = req.body;
        console.log(resetToken)

        const user = await User.findOne({
            resetPasswordToken:resetToken.token,
            resetPasswordExpires:{$gt:Date.now()}
        })
        console.log(user.resetPasswordExpires,'resetPasswordExpires')
        console.log(Date.now(),"Date.now()")

        if(!user){
            return res.status(400).json({error:'Token may be invalid or may have expired'});
        }

        user.Password = await getHashedPassword(Password);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        res.status(200).json('Password reseted successfully');
    }
    catch(err){
        res.status(400).json({error:err.message});
    }
}

const Login = async(req,res) =>{
    try{
        const{Email,Password} = req.body;
        let user = await findUserByEmail(Email);
        if(!user){
            return res.status(200).json({error:'User Not Registered'});
        }
       let passwordMatch = await bcrypt.compare(Password,user.Password);
       if(!passwordMatch){
        return res.status(200).json({error:'Incorrect Password'});
       }

       let token = jwt.sign({Email:Email},jwtSceret,{expiresIn:'1h'})
        res.status(200).json({token:token});
    }
    catch(err){
        console.error(err.message)
        res.status(400).json({err:err.message});
    }
}

async function getHashedPassword(password) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
}

module.exports = { createRole, registerUser, forgotPassword, resetPassword,Login ,createPermissions};
