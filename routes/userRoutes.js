const express = require('express');
const router = express.Router();
const upload = require('./../config/multerConfig');
const auth = require('./../middleware/auth');
const checkPermission = require('../middleware/permissionValidation');
const validationMiddleware = require('../middleware/validations')
const {registrationSchema,roleSchema,forgotPasswordSchema,resetPasswordSchema,loginSchema,permissionSchema,rolePremissionSchema} = require('../config/JoiSchema');
const {registerUser,createRole,forgotPassword,resetPassword,Login,createPermissions,CreatingRolePermissionMapping,bulkUploadUsers,downloadFile,listBulkUploads} =require('./../controller/userController');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - Name
 *         - Email
 *         - Password
 *         - RoleId
 *       properties:
 *         Name:
 *           type: string
 *           description: The user's name
 *         Email:
 *           type: string
 *           description: The user's email address
 *           format: email
 *         Password:
 *           type: string
 *           description: The user's password
 *         RoleId:
 *           type: string
 *           description: The ID of the role assigned to the user
 *           format: ObjectId
 *         CreatedAt:
 *           type: string
 *           description: The date when the user was created
 *           format: date-time
 *         UpdatedAt:
 *           type: string
 *           description: The date when the user was last updated
 *           format: date-time

 *       example:
 *         Name: "Garry Christen"
 *         Email: "chrisg98@gmail.com"
 *         Password: "hashedpassword"
 *         RoleId: "66bb0a8cdab2d86f7b2b1c50"
 *         CreatedAt: "2023-08-18T08:40:51.620Z"
 *         UpdatedAt: "2023-08-18T08:40:51.620Z"

 */

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request, validation failed
 */
router.post('/register',validationMiddleware(registrationSchema),registerUser);


/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Role:
 *       type: object
 *       required:
 *         - RoleName
 *         - Description
 *       properties:
 *         RoleName:
 *           type: string
 *           description: The role name
 *         Description:
 *           type: string
 *           description: The role description
 *       example:
 *         RoleName: "Dummy Role"
 *         Description: "Dummy Role Description"
 */

/**
 * @swagger
 * /api/users/createRole:
 *   post:
 *     summary: Create a new role
 *     tags: [Role]
 *     security:
 *       - BearerAuth: []   # Apply Bearer token security to this endpoint
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Role'
 *     responses:
 *       201:
 *         description: Role created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Role'
 *       400:
 *         description: Bad request, validation failed
 */

router.post('/createRole',validationMiddleware(roleSchema),auth.authenticateJWT,checkPermission(['Create Role']),createRole);

/**
 * @swagger
 * components:
 *   schemas:
 *     ForgotPassword:
 *       type: object
 *       properties:
 *         Email:
 *           type: string
 *           format: email
 *       example:
 *         Email: "joe@gmail.com"
 */

/**
 * @swagger
 * /api/users/forgotPassword:
 *   post:
 *     summary: Forgot password
 *     tags: [Forgot Password]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPassword'
 *     responses:
 *       200:
 *         description: Password reset email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForgotPassword'
 *       400:
 *         description: Bad request, validation failed
 */    
router.post('/forgotPassword',validationMiddleware(forgotPasswordSchema),forgotPassword);

/**
 * @swagger
 * components:
 *   schemas:
 *     ResetPassword:
 *       type: object
 *       required:
 *         - Password
 *       properties:
 *         Password:
 *           type: string
 *           description: The new password for the user
 *           format: password
 *       example:
 *         Password: "newSecurePassword123"
 */

/**
 * @swagger
 * /api/users/reset/{resetToken}:
 *   post:
 *     summary: Reset user password
 *     tags: [Reset Password]
 *     parameters:
 *       - in: path
 *         name: resetToken
 *         schema:
 *           type: string
 *         required: true
 *         description: The token sent to the user's email for password reset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPassword'
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmation of password reset
 *               example:
 *                 message: "Password reset successfully"
 *       400:
 *         description: Bad request, token may be invalid or expired, or validation failed
 */

router.post('/reset/:token', validationMiddleware(resetPasswordSchema),resetPassword);


/**
 * @swagger
 * components:
 *   schemas:
 *     Login:
 *       type: object
 *       required:
 *         - Email
 *         - Password
 *       properties:
 *         Email:
 *           type: string
 *           format: email
 *           description: The email address of the user
 *         Password:
 *           type: string
 *           format: password
 *           description: The password of the user
 *       example:
 *         Email: "joe@gmail.com"
 *         Password: "12345678"
 */

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: User login
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Login'
 *     responses:
 *       200:
 *         description: Login successful, returns a JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Token:
 *                   type: string
 *                   description: JWT token for authentication
 *                 RoleId:
 *                   type: string
 *                   description: The role ID of the user
 *                 UserId:
 *                   type: string
 *                   description: The user ID
 *               example:
 *                 Token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 RoleId: "60c72b2f9b1d4f1a88a9d9a1"
 *                 UserId: "60c72b2f9b1d4f1a88a9d9a2"
 *       400:
 *         description: Bad request, error occurred during login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *               example:
 *                 error: "Invalid email or password"
 */

router.post('/login',validationMiddleware(loginSchema),Login);

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     createPermissions:
 *       type: object
 *       required:
 *         - PermissionName
 *         - Description
 *       properties:
 *         PermissionName:
 *           type: string
 *           description: Name of the permission
 *         Description:
 *           type: string
 *           description: Description of the permission
 *       example:
 *         PermissionName: 'Create Role'
 *         Description: 'This permission allows creating the role'
 */

/**
 * @swagger
 * /api/users/createPermissions:
 *   post:
 *     summary: Create a new permission
 *     tags: [Permissions]
 *     security:
 *       - BearerAuth: []   # Apply Bearer token security to this endpoint
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/createPermissions'
 *     responses:
 *       201:
 *         description: Permission created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/createPermissions'
 *       400:
 *         description: Bad request, validation failed
 */

router.post('/createPermissions',auth.authenticateJWT,validationMiddleware(permissionSchema),createPermissions);

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     RolePermissionMapping:
 *       type: object
 *       required:
 *         - RoleId
 *         - Permission_ids
 *       properties:
 *         RoleId:
 *           type: string
 *           description: The ID of the role
 *           format: ObjectId
 *         Permission_ids:
 *           type: array
 *           description: List of permission IDs to be mapped
 *           items:
 *             type: string
 *             format: ObjectId
 *       example:
 *         RoleId: "60c72b2f9b1d4f1a88a9d9a1"
 *         Permission_ids: ["60c72b2f9b1d4f1a88a9d9a2", "60c72b2f9b1d4f1a88a9d9a3"]
 */

/**
 * @swagger
 * /api/users/permissionMapping:
 *   post:
 *     summary: Create or update role-permission mapping
 *     tags: [Role-Permission Mapping]
 *     security:
 *       - BearerAuth: []   # Apply Bearer token security to this endpoint
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RolePermissionMapping'
 *     responses:
 *       200:
 *         description: Role-permission mapping created or updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   description: Success message
 *               example:
 *                 msg: 'Mapped Successfully'
 *       400:
 *         description: Bad request, invalid role ID or permissions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *               example:
 *                 error: 'One or more Permission_ids are invalid'
 */

router.post('/permissionMapping',auth.authenticateJWT,validationMiddleware(rolePremissionSchema),CreatingRolePermissionMapping);

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     BulkUploadResponse:
 *       type: object
 *       properties:
 *         totalRecords:
 *           type: integer
 *           description: Total number of records processed
 *         successRecords:
 *           type: integer
 *           description: Number of records successfully uploaded
 *         errorRecords:
 *           type: integer
 *           description: Number of records that encountered errors
 *         errorDetails:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               Row:
 *                 type: integer
 *                 description: The row number where the error occurred
 *               Error:
 *                 type: string
 *                 description: Error message
 *           description: Details of errors encountered during processing
 *         filePath:
 *           type: string
 *           description: Path to the uploaded file
 *       example:
 *         totalRecords: 100
 *         successRecords: 95
 *         errorRecords: 5
 *         errorDetails:
 *           - Row: 2
 *             Error: "Invalid email format"
 *           - Row: 5
 *             Error: "Password too short"
 *         filePath: "/uploads/users.xlsx"
 */

/**
 * @swagger
 * /api/users/upload-file:
 *   post:
 *     summary: Upload users in bulk from a CSV or Excel file
 *     tags: [User]
 *     security:
 *       - BearerAuth: []   # Apply Bearer token security to this endpoint
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to upload (CSV or Excel)
 *               UserId:
 *                 type: string
 *                 description: The ID of the user performing the upload (attached by middleware)
 *             required:
 *               - file
 *     responses:
 *       200:
 *         description: Bulk upload completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BulkUploadResponse'
 *       400:
 *         description: Bad request, unsupported file type or validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *               example:
 *                 error: 'Unsupported file type'
 *       500:
 *         description: Internal server error during bulk upload
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *               example:
 *                 error: 'An error occurred during bulk upload'
 */

router.post('/upload-file',auth.authenticateJWT,checkPermission(['view uploaded list']),upload.single('file'), bulkUploadUsers);
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     DownloadFileResponse:
 *       type: object
 *       properties:
 *         filename:
 *           type: string
 *           description: The name of the file being downloaded
 *         base64:
 *           type: string
 *           description: The Base64 encoded content of the file
 *         mimetype:
 *           type: string
 *           description: The MIME type of the file
 *       example:
 *         filename: "example.csv"
 *         base64: "data:text/csv;base64,Y29tcGxldGVkIGZpbGUgY29udGVudA=="
 *         mimetype: "text/csv"
 */

/**
 * @swagger
 * /api/users/download/{id}:
 *   get:
 *     summary: Download a file by ID
 *     tags: [File]
 *     security:
 *       - BearerAuth: []   # Apply Bearer token security to this endpoint
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the file to download
 *     responses:
 *       200:
 *         description: File downloaded successfully, returned as Base64 encoded content
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DownloadFileResponse'
 *       404:
 *         description: File not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *               example:
 *                 error: "File not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *               example:
 *                 error: "An error occurred while reading the file"
 */

router.get('/download/:id',auth.authenticateJWT,downloadFile);

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     BulkUpload:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique identifier for the bulk upload
 *         FileName:
 *           type: string
 *           description: The name of the uploaded file
 *         TotalRecords:
 *           type: integer
 *           description: The total number of records in the upload
 *         SuccessRecords:
 *           type: integer
 *           description: The number of records successfully processed
 *         ErrorRecords:
 *           type: integer
 *           description: The number of records that encountered errors
 *         UploadedBy:
 *           type: object
 *           properties:
 *             Name:
 *               type: string
 *               description: The name of the user who uploaded the file
 *             Email:
 *               type: string
 *               format: email
 *               description: The email of the user who uploaded the file
 *         CreatedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the upload was created
 *       example:
 *         _id: "60c72b2f9b1d4f1a88a9d9a1"
 *         FileName: "upload.csv"
 *         TotalRecords: 100
 *         SuccessRecords: 95
 *         ErrorRecords: 5
 *         UploadedBy:
 *           Name: "John Doe"
 *           Email: "john.doe@example.com"
 *         CreatedAt: "2024-08-18T10:00:00Z"
 */

/**
 * @swagger
 * /api/users/uploadedList:
 *   get:
 *     summary: List all bulk uploads
 *     tags: [Bulk Uploads]
 *     security:
 *       - BearerAuth: []   # Apply Bearer token security to this endpoint
 *     responses:
 *       200:
 *         description: A list of all bulk uploads
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BulkUpload'
 *       400:
 *         description: Bad request, error occurred while fetching the data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *               example:
 *                 error: "An error occurred while fetching bulk uploads"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *               example:
 *                 error: "An error occurred while processing the request"
 */

router.get('/uploadedList',auth.authenticateJWT,checkPermission(['view uploaded list']),listBulkUploads);



module.exports = router;