const express = require('express');
const router = express.Router();
const checkPermission = require('../middleware/permissionValidation')
const {createAppointment} =require('./../controller/appointmentController');

router.post('/createAppointment',checkPermission(['Cancel Meeting']),createAppointment)


module.exports = router;