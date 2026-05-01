import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { requireAuth, requireSuperAdmin } from '../middleware/auth';
import Notification from '../models/Notification';
import { DeliveryMan } from '../models/DeliveryMan';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'craving_jwt_secret_dev';

// ─── Register ─────────────────────────────────────────────────────────────────
router.post('/register', async (req: Request, res: Response) => {
    try {
        const { name, username, phone, email, password } = req.body;

        if (!name || !username || !phone || !email || !password) {
            return res.status(400).json({ message: 'Name, username, phone, email, and password are required.' });
        }

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(409).json({ message: 'An account with this email already exists.' });
        }

        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(409).json({ message: 'This username is already taken.' });
        }

        // First user ever gets superadmin, all others start as 'user' with 'pending' status
        const userCount = await User.countDocuments();
        const isFirstUser = userCount === 0;

        const newUser = new User({
            name,
            username,
            phone,
            email,
            password,
            role: isFirstUser ? 'superadmin' : 'user',
            status: isFirstUser ? 'approved' : 'pending',
            allowedModules: isFirstUser
                ? ['dashboard', 'tables', 'pos', 'orders', 'delivery', 'customers', 'menu', 'inventory', 'reservations', 'notifications', 'messages', 'settings', 'users']
                : [],
        });

        const savedUser = await newUser.save();

        // Fire a notification to alert superadmins of new sign-up
        if (!isFirstUser) {
            await Notification.create({
                type: 'staff_signup',
                title: 'New Staff Sign-Up Request',
                message: `${savedUser.name} (@${savedUser.username}) has registered and is awaiting approval.`,
                isRead: false,
            });
        }

        const token = jwt.sign(
            { userId: savedUser._id, role: savedUser.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: isFirstUser ? 'Superadmin account created.' : 'Registration successful. Awaiting admin approval.',
            token,
            user: {
                _id: savedUser._id,
                name: savedUser.name,
                username: savedUser.username,
                phone: savedUser.phone,
                email: savedUser.email,
                role: savedUser.role,
                staffRole: savedUser.staffRole,
                status: savedUser.status,
                allowedModules: savedUser.allowedModules,
            },
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ message: 'Registration failed.' });
    }
});

// ─── Login ────────────────────────────────────────────────────────────────────
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required.' });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        if (user.status === 'pending') {
            return res.status(403).json({ message: 'Your account is pending approval by a superadmin.' });
        }

        if (user.status === 'rejected') {
            return res.status(403).json({ message: 'Your account has been rejected.' });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful.',
            token,
            user: {
                _id: user._id,
                name: user.name,
                username: user.username,
                phone: user.phone,
                email: user.email,
                role: user.role,
                staffRole: user.staffRole,
                status: user.status,
                allowedModules: user.allowedModules,
            },
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Login failed.' });
    }
});

// ─── Get Current User (me) ────────────────────────────────────────────────────
router.get('/me', requireAuth, async (req: Request, res: Response) => {
    try {
        const user = await User.findById((req as any).userId).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found.' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch profile.' });
    }
});

// ─── List All Users (Superadmin only) ─────────────────────────────────────────
router.get('/users', requireAuth, requireSuperAdmin, async (req: Request, res: Response) => {
    try {
        const { status } = req.query;
        const filter: any = {};
        if (status && typeof status === 'string') filter.status = status;
        const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch users.' });
    }
});

// ─── List Staff (approved staff — accessible by managers) ─────────────────────
router.get('/staff', requireAuth, async (req: Request, res: Response) => {
    try {
        const staff = await User.find({ role: 'staff', status: 'approved' })
            .select('-password')
            .sort({ staffRole: 1, name: 1 });
        res.json(staff);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch staff.' });
    }
});

// ─── Pending count (superadmin only) ─────────────────────────────────────────
router.get('/pending-count', requireAuth, requireSuperAdmin, async (req: Request, res: Response) => {
    try {
        const count = await User.countDocuments({ status: 'pending' });
        res.json({ count });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch pending count.' });
    }
});

// ─── Update User Role, Status & Password (Superadmin only) ──────────────────────
router.patch('/users/:id', requireAuth, requireSuperAdmin, async (req: Request, res: Response) => {
    try {
        const { role, staffRole, status, allowedModules, password, name, username, phone } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) return res.status(404).json({ message: 'User not found.' });

        if (role !== undefined) user.role = role;
        if (staffRole !== undefined) user.staffRole = staffRole;
        if (status !== undefined) user.status = status;
        if (allowedModules !== undefined) user.allowedModules = allowedModules;
        if (password !== undefined && password !== '') user.password = password;
        if (name !== undefined) user.name = name;
        if (username !== undefined) user.username = username.toLowerCase().replace(/\s/g, '');
        if (phone !== undefined) user.phone = phone;

        await user.save();

        // Unified Logic: If user is approved as 'delivery' staff, ensure a DeliveryMan record exists
        if (user.status === 'approved' && user.staffRole === 'delivery') {
            const existingDM = await DeliveryMan.findOne({ userId: user._id });
            if (!existingDM) {
                await DeliveryMan.create({
                    name: user.name,
                    phone: user.phone,
                    email: user.email,
                    userId: user._id,
                    status: 'active'
                });
            }
        }

        const { password: _, ...updated } = user.toObject();

        res.json({ message: 'User updated.', user: updated });
    } catch (err) {
        console.error('Update user error:', err);
        res.status(500).json({ message: 'Failed to update user.' });
    }
});

// ─── Delete User (Superadmin only) ───────────────────────────────────────────
router.delete('/users/:id', requireAuth, requireSuperAdmin, async (req: Request, res: Response) => {
    try {
        const userId = req.params.id;
        
        // If it's a deliveryman, remove that record too
        await DeliveryMan.findOneAndDelete({ userId });

        const deleted = await User.findByIdAndDelete(userId);
        if (!deleted) return res.status(404).json({ message: 'User not found.' });
        res.json({ message: 'User deleted.' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete user.' });
    }
});

export default router;
