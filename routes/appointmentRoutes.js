const express = require('express');
const router = express.Router();
const checkPermission = require('../middleware/permissionValidation');
const auth = require('./../middleware/auth');
const validationMiddleware = require('../middleware/validations');
const {createAppointment,appointmentAction,appointmentByAppointmentId,listAppoinments,blockUser,cancelAppointment,exportMeeting,meetingReport} =require('./../controller/appointmentController');
const {createAppointmentSchema,appointmentActionSchema,appointmentStatusSchema,cancelAppointmentSchema} = require('../config/JoiSchema');


/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Appointment:
 *       type: object
 *       required:
 *         - ManagerId
 *         - AppointedDate
 *         - Status
 *         - Attendees
 *       properties:
 *         ManagerId:
 *           type: string
 *           format: uuid
 *           description: The ID of the manager creating the appointment.
 *         AppointedDate:
 *           type: string
 *           format: date-time
 *           description: The date and time for the appointment.
 *         Status:
 *           type: string
 *           description: The status of the appointment.
 *           enum:
 *             - Scheduled
 *             - Completed
 *             - Cancelled
 *         Attendees:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *             description: Array of user IDs attending the appointment.
 *       example:
 *         ManagerId: "66bc5a830deeffdbc8f1ed97"
 *         AppointedDate: "2024-08-19T14:00:00Z"
 *         Status: "Scheduled"
 *         Attendees: [{"DeveloperId":"66c21c9b39bd11e8a4099606"}]
 *
 * /api/appointment/createAppointment:
 *   post:
 *     summary: Create a new appointment
 *     description: Endpoint to create a new appointment, ensuring that attendees are not in the manager's block list.
 *     tags: [Appointments]
 *     security:
 *       - BearerAuth: []   # Apply Bearer token security to this endpoint
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Appointment'
 *     responses:
 *       200:
 *         description: Appointment created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: Bad request due to missing or invalid data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 *               example:
 *                 error: 'There might be few users in your block list with whom you are scheduling meeting, Kindly remove those users'
 */

router.post('/createAppointment',auth.authenticateJWT,validationMiddleware(createAppointmentSchema),checkPermission(['Cancel Meeting']),createAppointment);

/**
 * @swagger
 * components:
 *   schemas:
 *     AppointmentAction:
 *       type: object
 *       required:
 *         - appointmentId
 *         - attendeeId
 *         - status
 *       properties:
 *         appointmentId:
 *           type: string
 *           format: uuid
 *           description: The ID of the appointment.
 *         attendeeId:
 *           type: string
 *           format: uuid
 *           description: The ID of the attendee responding to the appointment.
 *         status:
 *           type: string
 *           description: The status of the appointment from the attendee's perspective.
 *           enum:
 *             - Accepted
 *             - Declined
 *       example:
 *         appointmentId: "64db9a5f4f9c2900132e0a4f"
 *         attendeeId: "64db9a5f4f9c2900132e0a51"
 *         status: "Accepted"
 *
 * /api/appointment/appointmentAction:
 *   post:
 *     summary: Update attendee's status for an appointment
 *     description: Allows an attendee to accept or decline an appointment.
 *     tags: [Appointments]
 *     security:
 *       - BearerAuth: []   # Apply Bearer token security to this endpoint
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AppointmentAction'
 *     responses:
 *       200:
 *         description: Status updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                   example: 'Status updated successfully'
 *                 appointment:
 *                   $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: Bad request due to invalid status or other issues.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 *                   example: 'Invalid Status codes'
 *       404:
 *         description: Appointment or Attendee not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 *                   example: 'Appointment or Attendee not found'
 */

router.post('/appointmentAction',auth.authenticateJWT,validationMiddleware(appointmentActionSchema),checkPermission(['Accept appointemnt','Decline appointemnt']),appointmentAction);

/**
 * @swagger
 * components:
 *   schemas:
 *     AppointmentByAppointmentId:
 *       type: object
 *       required:
 *         - AppointmentId
 *         - UserId
 *       properties:
 *         AppointmentId:
 *           type: string
 *           format: uuid
 *           description: The ID of the appointment to retrieve.
 *         UserId:
 *           type: string
 *           format: uuid
 *           description: The ID of the user (manager) requesting the appointment details.
 *       example:
 *         AppointmentId: "66bc9d7ed65cbcbbb91bf5d5"
 *         UserId: "66bb1aa7897b92e1bf5e6abe"
 *
 * /api/appointment/viewAppointmentStatus:
 *   post:
 *     summary: Get appointment details by appointment ID
 *     description: Retrieve appointment details including manager and attendees' information.
 *     tags: [Appointments]
 *     security:
 *       - BearerAuth: []   # Apply Bearer token security to this endpoint
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AppointmentByAppointmentId'
 *     responses:
 *       200:
 *         description: Appointment details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The ID of the appointment.
 *                 ManagerId:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: The ID of the manager.
 *                     Name:
 *                       type: string
 *                       description: The name of the manager.
 *                     Email:
 *                       type: string
 *                       description: The email of the manager.
 *                 Attendees:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       DeveloperId:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: The ID of the attendee.
 *                           Name:
 *                             type: string
 *                             description: The name of the attendee.
 *                           Email:
 *                             type: string
 *                             description: The email of the attendee.
 *                       Status:
 *                         type: string
 *                         description: The status of the attendee's response.
 *                       ResponseTime:
 *                         type: string
 *                         format: date-time
 *                         description: The time when the attendee responded.
 *       404:
 *         description: Appointment not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 *                   example: 'Appointment not found'
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 *                   example: 'Server error'
 */

router.post('/viewAppointmentStatus',auth.authenticateJWT,validationMiddleware(appointmentStatusSchema),checkPermission(['Meeting Status']),appointmentByAppointmentId);
/**
 * @swagger
 * components:
 *   schemas:
 *     BlockUser:
 *       type: object
 *       required:
 *         - LoggedInUserId
 *       properties:
 *         LoggedInUserId:
 *           type: string
 *           format: uuid
 *           description: The ID of the currently logged-in user who is blocking another user.
 *       example:
 *         LoggedInUserId: "64db9a5f4f9c2900132e0a4e"
 *
 * /api/appointment/block/{userid}:
 *   post:
 *     summary: Block a user
 *     description: Allows the logged-in user to block another user.
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []   # Apply Bearer token security to this endpoint
 *     parameters:
 *       - in: path
 *         name: userid
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The ID of the user to be blocked.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BlockUser'
 *     responses:
 *       200:
 *         description: User blocked successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was successful.
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                   example: 'User blocked successfully.'
 *       404:
 *         description: Logged-in user not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation failed.
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: 'User not found.'
 *       400:
 *         description: Bad request or other error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 *                   example: 'err.msg'
 */

router.post('/block/:userid',auth.authenticateJWT,checkPermission(['Block User']),blockUser);
/**
 * @swagger
 * components:
 *   schemas:
 *     ListAppointmentsResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: uuid
 *           description: The ID of the appointment.
 *         ManagerId:
 *           type: string
 *           format: uuid
 *           description: The ID of the manager.
 *         AppointedDate:
 *           type: string
 *           format: date-time
 *           description: The date and time of the appointment.
 *         Attendees:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               DeveloperId:
 *                 type: string
 *                 format: uuid
 *                 description: The ID of the attendee.
 *               Status:
 *                 type: string
 *                 description: The status of the attendee's response.
 *               ResponseTime:
 *                 type: string
 *                 format: date-time
 *                 description: The time when the attendee responded.
 *
 * /api/appointment/listAppointments:
 *   get:
 *     summary: List appointments for the logged-in user
 *     description: Retrieve a list of appointments where the user is either the manager or an attendee, filtered by an optional date range.
 *     tags: [Appointments]
 *     security:
 *       - BearerAuth: []   # Apply Bearer token security to this endpoint
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: The start date to filter appointments.
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: The end date to filter appointments.
 *     responses:
 *       200:
 *         description: List of appointments retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ListAppointmentsResponse'
 *       400:
 *         description: Bad request due to invalid data or other issues.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 *                   example: 'Invalid date range'
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 *                   example: 'Server error'
 */

router.get('/listAppointments',auth.authenticateJWT,listAppoinments);

/**
 * @swagger
 * components:
 *   schemas:
 *     CancelAppointmentRequest:
 *       type: object
 *       required:
 *         - appointmentId
 *       properties:
 *         appointmentId:
 *           type: string
 *           format: uuid
 *           description: The ID of the appointment to be canceled.
 *       example:
 *         appointmentId: "64db9a5f4f9c2900132e0a4f"
 *
 * /api/appointment/cancelAppointment:
 *   put:
 *     summary: Cancel an appointment
 *     description: Allows the manager of the appointment to cancel it.
 *     tags: [Appointments]
 *     security:
 *       - BearerAuth: []   # Apply Bearer token security to this endpoint
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CancelAppointmentRequest'
 *     responses:
 *       200:
 *         description: Appointment canceled successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                   example: "Appointment Cancelled successfully."
 *       404:
 *         description: Appointment not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 *                   example: "Appointment not found."
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 *                   example: "Server error"
 */

router.put('/cancelAppointment',auth.authenticateJWT,validationMiddleware(cancelAppointmentSchema),checkPermission(['Cancel Meeting']),cancelAppointment);
/**
 * @swagger
 * components:
 *   schemas:
 *     ExportMeetingResponse:
 *       type: object
 *       properties:
 *         filename:
 *           type: string
 *           description: The name of the exported Excel file.
 *           example: "meetings.xlsx"
 *         data:
 *           type: string
 *           format: base64
 *           description: The Base64-encoded data of the Excel file.
 *
 * /api/appointment/exportMeeting:
 *   get:
 *     summary: Export meetings to an Excel file
 *     description: Allows the manager to export meetings to an Excel file, filtered by optional date range and status.
 *     tags: [Meetings]
 *     security:
 *       - BearerAuth: []   # Apply Bearer token security to this endpoint
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: The start date to filter meetings.
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: The end date to filter meetings.
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         required: false
 *         description: The status to filter meetings (e.g., 'Scheduled', 'Cancelled').
 *     responses:
 *       200:
 *         description: The meetings were exported successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExportMeetingResponse'
 *       400:
 *         description: Bad request due to invalid data or other issues.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 *                   example: "Invalid date range"
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 *                   example: "Server error"
 */

router.get('/exportMeeting',auth.authenticateJWT,checkPermission(['Export Meeting']),exportMeeting);

/**
 * @swagger
 * components:
 *   schemas:
 *     MeetingReportResponse:
 *       type: object
 *       properties:
 *         CreatedBy:
 *           type: string
 *           format: uuid
 *           description: The ID of the user who created the report.
 *         DateRange:
 *           type: object
 *           properties:
 *             StartDate:
 *               type: string
 *               format: date
 *               description: The start date of the reporting period.
 *             EndDate:
 *               type: string
 *               format: date
 *               description: The end date of the reporting period.
 *         MeetingScheduled:
 *           type: integer
 *           description: The number of meetings scheduled within the date range.
 *         MeetingAttended:
 *           type: integer
 *           description: The number of meetings attended within the date range.
 *       example:
 *         CreatedBy: "64db9a5f4f9c2900132e0a4e"
 *         DateRange:
 *           StartDate: "2024-08-01"
 *           EndDate: "2024-08-31"
 *         MeetingScheduled: 10
 *         MeetingAttended: 5
 *
 * /api/appointment/generateReport:
 *   get:
 *     summary: Generate a meeting report
 *     description: Generate a report of scheduled and attended meetings for the logged-in user within a specified date range. Defaults to the current month if no date range is provided.
 *     tags: [Meetings]
 *     security:
 *       - BearerAuth: []   # Apply Bearer token security to this endpoint
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: The start date for the report.
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: The end date for the report.
 *     responses:
 *       200:
 *         description: Report generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MeetingReportResponse'
 *       400:
 *         description: Bad request due to invalid data or other issues.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 *                   example: "Invalid date range"
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 *                   example: "Server error"
 */

router.get('/generateReport',auth.authenticateJWT,checkPermission(['Generate Report']),meetingReport)



module.exports = router;