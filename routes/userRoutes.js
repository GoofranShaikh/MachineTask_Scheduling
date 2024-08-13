const express = require('express');
const router = express.Router();
const {registerUser,createRole,forgotPassword,resetPassword,Login,createPermissions} =require('./../controller/userController');


router.post('/register',registerUser);
router.post('/createRole',createRole);
router.post('/forgotPassword',forgotPassword);
router.post('/reset/:token', resetPassword);
router.post('/login',Login);
router.post('/createPermissions',createPermissions);
module.exports = router;