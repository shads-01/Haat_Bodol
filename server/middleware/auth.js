import jwt from 'jsonwebtoken';
import User from '../models/user.js';

const auth = async (req, res, next) => {
    try {
        // Try Authorization header first
        let token = req.header('Authorization');

        if (token) {
            token = token.replace('Bearer ', '');
        } else if (req.cookies && req.cookies.token) {
            // Fallback to cookie
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get the full user object and attach to req.user
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(401).json({ message: 'Token is not valid' });
        }

        req.user = user;
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

export default auth;