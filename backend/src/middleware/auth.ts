import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'craving_jwt_secret_dev';

// Extend Request to carry userId and role
declare global {
    namespace Express {
        interface Request {
            userId?: string;
            userRole?: string;
        }
    }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication required.' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
        req.userId = decoded.userId;
        req.userRole = decoded.role;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
};

export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (req.userRole !== 'superadmin') {
        return res.status(403).json({ message: 'Superadmin access required.' });
    }
    next();
};

export const requireApproved = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await User.findById(req.userId);
        if (!user || user.status !== 'approved') {
            return res.status(403).json({ message: 'Account not yet approved.' });
        }
        next();
    } catch (err) {
        res.status(500).json({ message: 'Authorization check failed.' });
    }
};
