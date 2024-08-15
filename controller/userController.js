const User = require('../models/User');
const Role = require('../models/Role');
const Permission = require('../models/Permission');
const RolePermissionMapping = require('../models/RolePermissionMapping');
const path = require('path');

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer=require('nodemailer');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const fs = require('fs');
const csvParser = require('csv-parser');
const xlsx = require('xlsx');
const BulkUpload = require('../models/BulkUpload');  
const mime = require('mime-types'); 
dotenv.config();
const jwtSceret = process.env.SECKRET_KEY;

//Create Role
const createRole = async (req, res) => {
    let role;
    role = new Role({
        RoleName: req.body.RoleName,
        Description: req.body.Description
    })
    await role.save();
    res.status(201).json({ msg: 'User Registered Successfully' });

}
//Create Permissions

const createPermissions = async (req, res) => {
    let permission;
    permission = new Permission({
        PermissionName: req.body.PermissionName,
        Description: req.body.Description
    })
    await permission.save();
    res.status(201).json({ msg: 'Permission Created Successfully' });

}

//Create Role-Permission mapping
const CreatinfRolePermissionMapping = async(req,res)=>{
    try{     
        let {RoleId,Permission_ids}=req.body;

        const roleExists = await Role.findById(RoleId);
        if (!roleExists) {
            return res.status(400).json({ error: 'Invalid RoleId' });
        }
        console.log(roleExists,'roleExists')
        const permissionExist = await Permission.find({
            _id:{$in:Permission_ids.map((elm)=>new mongoose.Types.ObjectId(elm))}
        })
        console.log(permissionExist,'permissionExist')
        if (permissionExist.length !== Permission_ids.length) {
            return res.status(400).json({ error: 'One or more Permission_ids are invalid' });
        }

        let mapping = new RolePermissionMapping({
            RoleId: new mongoose.Types.ObjectId(RoleId),
            Permission_ids:Permission_ids.map((elm)=> new mongoose.Types.ObjectId(elm))
        })
        await mapping.save();
        res.status(200).json({msg:'Mapped Successfully'});
    }
    catch(err){
        res.status(400).json({error:err.message});

    }
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

       let token = jwt.sign({UserId:user?._id,RoleId:user?.RoleId},jwtSceret,{expiresIn:'1h'})
        res.status(200).json({
            Token:token,
            RoleId:user?.RoleId,
            UserId:user?._id
        });
    }
    catch(err){
        console.error(err.message)
        res.status(400).json({err:err.message});
    }
}

const bulkUploadUsers = async(req,res)=>{
    try {
        const file = req.file;
        const uploadedBy = req.body.UserId;  // Assuming you're using some auth middleware to attach the user
        const filePath = file.path;

        let totalRecords = 0;
        let successRecords = 0;
        let errorRecords = 0;
        let errorDetails = [];
   
            // Read the file content
            const extension = path.extname(file.originalname).toLowerCase();

            const processRow = async (row, index) => {
                totalRecords++;
                try {

                    const newUser = new User({
                        Name: row.Name,
                        Email: row.Email,
                        Password: await getHashedPassword(row.Password.toString()),  // You'll want to hash this
                        RoleId:new mongoose.Types.ObjectId(row.RoleId.toString())
                    });
                    console.log(newUser,'saved')
                    await newUser.save();
                    successRecords++;
                } catch (err) {
                    errorRecords++;
                    errorDetails.push({
                        Row: index + 1,  // To show 1-based indexing
                        Error: err.message
                    });
                }
            };
    console.log(extension,'extension')
    if (extension === '.csv') {
        let index = 0;
        const stream = fs.createReadStream(filePath).pipe(csvParser());
        
        for await (const row of stream) {
            await processRow(row, index);
            index++;
        }
        
       const bulkResponse = await saveBulkUploadRecord(uploadedBy, file, totalRecords, successRecords, errorRecords, errorDetails, filePath);
        res.status(200).json(bulkResponse);
        
    }       
    else if (extension === '.xlsx') {
                // Process Excel file
                const workbook = xlsx.readFile(filePath);
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const rows = xlsx.utils.sheet_to_json(sheet);
    
                for (let index = 0; index < rows.length; index++) {
                    await processRow(rows[index], index);
                }
    
                 const bulkResponse=await saveBulkUploadRecord(uploadedBy,file,totalRecords,successRecords,errorRecords,errorDetails,filePath);
                res.status(200).json(bulkResponse);
            } else {
                return res.status(400).json({ error: 'Unsupported file type' });
            }
     
          
        } catch (err) {
            console.error('Bulk upload error:', err);
            res.status(500).json({ error: 'An error occurred during bulk upload' });
        }
}

async function getHashedPassword(password) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
}

const saveBulkUploadRecord = async (uploadedBy,file,totalRecords,successRecords,errorRecords,errorDetails,filePath) => {
    console.log(file,'file')
    const bulkUpload = new BulkUpload({
        UploadedBy: uploadedBy,
        FileName: file.filename,
        TotalRecords: totalRecords,
        SuccessRecords: successRecords,
        ErrorRecords: errorRecords,
        ErrorDetails: errorDetails,
        file_url: filePath
    });
    await bulkUpload.save();
    return bulkUpload;
};


// Download the uploaded file
const downloadFile = async (req, res) => {
    try {
        const { id } = req.params;
        const upload = await BulkUpload.findById(id);

        if (!upload) {
            return res.status(404).json({ error: 'File not found' });
        }
const filename = upload.FileName;
console.log(__dirname,'__dirname')
    const filePath = path.join(__dirname, '..' , 'uploads', filename);

    // Read the file
    fs.readFile(filePath, (err, data) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Encode file data to Base64
        const base64Data = data.toString('base64');

        // Send the Base64 data to the client
        res.json({
            filename: filename,
            base64: base64Data,
            mimetype: mime.lookup(filename) || 'application/octet-stream'
        });
    });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const listBulkUploads = async(req,res) => {
    try{
        const bulkUploadList = await BulkUpload.find().populate('UploadedBy', 'Name Email').sort({CreatedAt :-1});
        res.status(200).json(bulkUploadList);
    }
    catch(err){
        res.status(400).json({error:err.message});
    }
}





module.exports = { createRole, registerUser, forgotPassword, resetPassword,Login ,createPermissions,CreatinfRolePermissionMapping,bulkUploadUsers,downloadFile,listBulkUploads};
