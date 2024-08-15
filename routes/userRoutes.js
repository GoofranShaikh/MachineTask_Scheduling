const express = require('express');
const router = express.Router();
const upload = require('./../config/multerConfig');
const auth = require('./../middleware/auth');
const {registerUser,createRole,forgotPassword,resetPassword,Login,createPermissions,CreatinfRolePermissionMapping,bulkUploadUsers,downloadFile,listBulkUploads} =require('./../controller/userController');

router.post('/register',registerUser);
router.post('/createRole',createRole);
router.post('/forgotPassword',forgotPassword);
router.post('/reset/:token', resetPassword);
router.post('/login',Login);
router.post('/createPermissions',createPermissions);
router.post('/permissionMapping',CreatinfRolePermissionMapping);
router.post('/upload-file',auth.authenticateJWT,upload.single('file'), bulkUploadUsers);
router.post('/download/:id',downloadFile);
router.post('/uploadedList',listBulkUploads);



module.exports = router;