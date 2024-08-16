const RolePermissionMapping = require('../models/RolePermissionMapping'); 

const checkPermission = (requiredPermissions) => {
    return async (req, res, next) => {
        try {
            const userRoleId = req.body.RoleId; 
            if (!userRoleId) {
                return res.status(403).json({ error: 'Access denied. No role assigned.' });
            }

            // Fetch the permissions for the user's role
            const rolePermissions = await RolePermissionMapping.findOne({ RoleId: userRoleId }).populate('Permission_ids');
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
