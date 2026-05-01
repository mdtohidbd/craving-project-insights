import express from 'express';
import Settings from '../models/Settings';
import { requireAuth, requireSuperAdmin } from '../middleware/auth';

const router = express.Router();

// Ensure settings exists, with all defaults populated
const ensureSettings = async () => {
    let settings = await Settings.findOne();
    if (!settings) {
        settings = await Settings.create({ deliveryFee: 50, smsNumber: '' });
    }
    // Backfill globalModules if they were missing from an old record
    if (!settings.globalModules || settings.globalModules.length === 0) {
        const defaults = [
            { id: 'dashboard',     label: 'Dashboard',      enabled: true },
            { id: 'tables',        label: 'Tables',          enabled: true },
            { id: 'pos',           label: 'POS System',      enabled: true },
            { id: 'orders',        label: 'Orders',          enabled: true },
            { id: 'delivery',      label: 'Delivery',        enabled: true },
            { id: 'customers',     label: 'Customers',       enabled: true },
            { id: 'menu',          label: 'Menu Items',      enabled: true },
            { id: 'inventory',     label: 'Inventory',       enabled: true },
            { id: 'reservations',  label: 'Reservations',    enabled: true },
            { id: 'notifications', label: 'Notifications',   enabled: true },
            { id: 'messages',      label: 'Messages',        enabled: true },
            { id: 'settings',      label: 'Settings',        enabled: true },
            { id: 'users',         label: 'User Management', enabled: true },
            { id: 'modules',       label: 'Module Control',  enabled: true },
        ];
        settings.globalModules = defaults as any;
        await settings.save();
    }
    return settings;
};

// ─── Get settings ─────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const settings = await ensureSettings();
        res.json(settings);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// ─── Update settings ──────────────────────────────────────────────────────────
router.put('/', async (req, res) => {
    try {
        const settings = await ensureSettings();
        if (req.body.deliveryFee  !== undefined) settings.deliveryFee  = req.body.deliveryFee;
        if (req.body.adminPassword !== undefined) settings.adminPassword = req.body.adminPassword;
        if (req.body.smsNumber     !== undefined) settings.smsNumber     = req.body.smsNumber;
        await settings.save();
        res.json(settings);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// ─── Get global modules (public — used by frontend on load) ───────────────────
router.get('/modules', async (req, res) => {
    try {
        const settings = await ensureSettings();
        res.json(settings.globalModules);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// ─── Update global modules (superadmin only) ──────────────────────────────────
router.patch('/modules', requireAuth, requireSuperAdmin, async (req, res) => {
    try {
        // req.body.modules = [{ id, enabled }]
        const { modules } = req.body as { modules: { id: string; enabled: boolean }[] };
        if (!Array.isArray(modules)) {
            return res.status(400).json({ message: 'modules must be an array' });
        }
        const settings = await ensureSettings();

        // Merge incoming changes into existing array
        modules.forEach(({ id, enabled }) => {
            const mod = settings.globalModules.find((m: import('../models/Settings').IModuleConfig) => m.id === id);
            if (mod) mod.enabled = enabled;
        });

        settings.markModified('globalModules');
        await settings.save();
        res.json(settings.globalModules);
    } catch (err: any) {
        console.error('Update modules error:', err);
        res.status(500).json({ message: err.message });
    }
});

export default router;

