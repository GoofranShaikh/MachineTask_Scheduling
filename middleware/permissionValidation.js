const RolePermissionMapping = require('../models/RolePermissionMapping'); 
const redisClient = require('../config/redisClient');
const checkPermission = (requiredPermissions) => {
    return async (req, res, next) => {
        try {
            let rolePermissions;
            const userRoleId = req.body.RoleId; 
            if (!userRoleId) {
                return res.status(403).json({ error: 'Access denied. No role assigned.' });
            }

            let cachedResult = await redisClient.get(`mapping-${userRoleId}`)
            rolePermissions = JSON.parse(cachedResult);
            console.log('Fetched from redis')
            if(!rolePermissions || rolePermissions == null || rolePermissions == undefined){
                // Fetch the permissions for the user's role
                rolePermissions = await RolePermissionMapping.findOne({ RoleId: userRoleId }).populate('Permission_ids');
                await redisClient.set(`mapping-${userRoleId}`,JSON.stringify(rolePermissions)); //save to redis after gettig response
                console.log('Fetched from db')

            }
            console.log(rolePermissions,'rolePermissions')
            const userPermissions = rolePermissions.Permission_ids.map(permission => permission.PermissionName); 

            // Check if the user has all the required permissions
            const hasPermission = requiredPermissions.every(permission => userPermissions.includes(permission));

            if (!hasPermission) {
                return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
            }

            next(); // User has permission, proceed to the next middleware or route handler
        } catch (err) {
            return res.status(500).json({ error: err.message});
        }
    };
};

module.exports = checkPermission;
