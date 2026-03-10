import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error("MongoDB URI is missing in .env");

        await mongoose.connect(uri);
        console.log('MongoDB Connected successfully');
    } catch (error) {
        console.error('MongoDB connection error (Server will still attempt to start):', error);
        // Removed process.exit(1) to allow the server to be up for non-DB routes/diagnostics
    }
};

export default connectDB;
