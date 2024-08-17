const express = require('express');
const router = express.Router();
const upload = require('./../config/multerConfig');
const auth = require('./../middleware/auth');
const validationMiddleware = require('../middleware/validations')
const {registrationSchema,roleSchema,forgotPasswordSchema,resetPasswordSchema,loginSchema,permissionSchema,rolePremissionSchema} = require('../config/JoiSchema');
const {registerUser,createRole,forgotPassword,resetPassword,Login,createPermissions,CreatingRolePermissionMapping,bulkUploadUsers,downloadFile,listBulkUploads} =require('./../controller/userController');

router.post('/register',validationMiddleware(registrationSchema),registerUser);
router.post('/createRole',validationMiddleware(roleSchema),createRole);
router.post('/forgotPassword',validationMiddleware(forgotPasswordSchema),forgotPassword);
router.post('/reset/:token', validationMiddleware(resetPasswordSchema),resetPassword);
router.post('/login',validationMiddleware(loginSchema),Login);
router.post('/createPermissions',validationMiddleware(permissionSchema),createPermissions);
router.post('/permissionMapping',validationMiddleware(rolePremissionSchema),CreatingRolePermissionMapping);
router.post('/upload-file',auth.authenticateJWT,upload.single('file'), bulkUploadUsers);
router.post('/download/:id',downloadFile);
router.post('/uploadedList',listBulkUploads);



module.exports = router;