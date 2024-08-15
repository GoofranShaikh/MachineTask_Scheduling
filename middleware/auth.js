const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();


const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {

    const token = authHeader.split(' ')[1];

    
    jwt.verify(token, process.env.SECKRET_KEY, (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
      }

      // Attach user information to request object
      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ error: 'Unauthorized: No token provided' });
  }
};

module.exports = {authenticateJWT};
