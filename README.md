
# Assignment  - Appointment Management

Details:
Managers can create an appointment with one or multiple developers.
Attendees have the ability to accept or decline the appointment.
Managers who have scheduled an appointment should be able to see if the developers have accepted or declined appointment.
Users should be able to filter the number of appointments date wise.
Users can have a blocked list where they can block other users.
If someone has blocked a user then she/he cannot schedule an appointment with them. Example. If Rajesh has blocked Mahesh then Mahesh cannot schedule an appointment with Rajesh.
Developers cannot delete the appointment only Managers can.
Bulk Upload users in the application from a CSV or Excel file.
Below are the features of Bulk upload : 
View the list of bulk upload
Show the number of records uploaded successfully and error count in the list.
Allow the user to download the file which was uploaded
Users should be able to export the meetings with the filter
Create Reports to view the number of meetings scheduled and attended in a month and a custom filter for date.

Must have:
Authentication using jwt flow: Login, Register, Forgot Password, Reset Password
Roles: Manager and Developers.
Proper error handling and validations.
Design the database schema first. Get it approved and only then start working on the assignment.
At least one native query should be implemented.
Implement Redis wherever possible.
Implement all the standards that you have learned so far.
Proper naming convention is must.
Create swagger api documentation for created API.




Tech Stack:
NodeJS
MongoDB
Redis


#NOTE: FYI Need to add .env variables and connect to Redis before running the project

#.env variables


PORT=3000
MONGO_URI= mongodb://0.0.0.0:27017/Scheduling
RESETPASS_URI= http://localhost:3000/api/users/reset
EMAIL_USER='example@gmail.com'   // kindly add your email this will be from Email
PASS_KEY='hagsajhs sdsdjh jkahsd kasdksdj'  //kindly add your password
SECKRET_KEY ='dsgjfghjsdfgjsdf-dskfhsjdkfhkd-sjdfhjsdf'



#Permission Required in DB 

[{ "_id": { "$oid": "66bb50c15b117951244350ba" }, "PermissionName": "Cancel Meeting", "Description": "This permission cancel meeting", "__v": 0 },{ "_id": { "$oid": "66bb51515b117951244350bc" }, "PermissionName": "Accept appointemnt", "Description": "This permission allow to accept appointment", "__v": 0 },{ "_id": { "$oid": "66bb51625b117951244350be" }, "PermissionName": "Decline appointemnt", "Description": "This permission allow to decline appointment", "__v": 0 },{ "_id": { "$oid": "66bdf01ba1732ecc2b2a5061" }, "PermissionName": "Meeting Status", "Description": "This Permission will allow to see the attendee meeting status" },{ "_id": { "$oid": "66be2722a1732ecc2b2a5071" }, "PermissionName": "Block User", "Description": "This permission allow user to block other user" },{ "_id": { "$oid": "66bf28530717a35c47070385" }, "PermissionName": "Export Meeting", "Description": "This permission allow users to export meetings", "__v": 0 },{ "_id": { "$oid": "66bf28b20717a35c47070387" }, "PermissionName": "Generate Report", "Description": "This permission allow users to generate report", "__v": 0 },{ "_id": { "$oid": "66c20bba7bc98906ebc50878" }, "PermissionName": "Create Role", "Description": "This permission allows creating the role", "__v": 0 },{ "_id": { "$oid": "66c22ed1e46ac1e4c42181f7" }, "PermissionName": "view uploaded list", "Description": "This permission allows creating the role", "__v": 0 }]

#Roles Required in DB

 [{ "_id": { "$oid": "66bb0a43dab2d86f7b2b1c4e" }, "RoleName": "Manager", "__v": 0 },{ "_id": { "$oid": "66bb0a8cdab2d86f7b2b1c50" }, "RoleName": "Developer", "__v": 0 }]
