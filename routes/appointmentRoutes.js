const express = require('express');
const router = express.Router();
const checkPermission = require('../middleware/permissionValidation');
const auth = require('./../middleware/auth');
const {createAppointment,appointmentAction,appointmentByAppointmentId,listAppoinments,blockUser,cancelAppointment,exportMeeting,meetingReport} =require('./../controller/appointmentController');

router.post('/createAppointment',checkPermission(['Cancel Meeting']),createAppointment);
router.post('/appointmentAction',checkPermission(['Accept appointemnt','Decline appointemnt']),appointmentAction);
router.post('/viewAppointmentStatus',checkPermission(['Meeting Status']),appointmentByAppointmentId);
router.post('/block/:userid',auth.authenticateJWT,checkPermission(['Block User']),blockUser);
router.get('/listAppointments',auth.authenticateJWT,listAppoinments);
router.put('/cancelAppointment',auth.authenticateJWT,checkPermission(['Cancel Meeting']),cancelAppointment);
router.get('/exportMeeting',auth.authenticateJWT,checkPermission(['Export Meeting']),exportMeeting);
router.get('/generateReport',auth.authenticateJWT,checkPermission(['Generate Report']),meetingReport)



module.exports = router;