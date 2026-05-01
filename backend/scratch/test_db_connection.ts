import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const testConnection = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        console.log('Testing connection to:', uri?.replace(/:([^@]+)@/, ':****@')); // Hide password
        
        if (!uri) {
            console.error('MONGODB_URI is missing');
            return;
        }

        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log('Successfully connected to MongoDB');
        
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Available collections:', collections.map(c => c.name));
        
        const MenuItem = mongoose.model('MenuItem', new mongoose.Schema({}, { strict: false }), 'menuitems');
        const count = await MenuItem.countDocuments();
        console.log(`Documents in menuitems: ${count}`);
        
        await mongoose.disconnect();
    } catch (error) {
        console.error('Connection test failed:');
        console.error(error);
    }
};

testConnection();
