import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'superadmin' | 'staff' | 'user';
export type StaffRole = 'manager' | 'cashier' | 'chef' | 'waiter' | 'delivery' | null;
export type UserStatus = 'pending' | 'approved' | 'rejected';

export interface IUser extends mongoose.Document {
    name: string;
    username: string;
    phone: string;
    email: string;
    password: string;
    role: UserRole;
    staffRole: StaffRole;
    status: UserStatus;
    allowedModules: string[];
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>(
    {
        name: { type: String, required: true, trim: true },
        username: { type: String, required: true, unique: true, lowercase: true, trim: true },
        phone: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true },
        role: {
            type: String,
            enum: ['superadmin', 'staff', 'user'],
            default: 'user',
        },
        staffRole: {
            type: String,
            enum: ['manager', 'cashier', 'chef', 'waiter', 'delivery', null],
            default: null,
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
        allowedModules: {
            type: [String],
            default: [],
        },
    },
    { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);
