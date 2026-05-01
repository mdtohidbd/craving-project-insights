const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const testConnection = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) return;

        console.log('Connecting with explicit dbName: craving_insights...');
        await mongoose.connect(uri, { dbName: 'craving_insights' });
        
        const db = mongoose.connection.db;
        console.log('Connected to database:', db.databaseName);
        
        const count = await db.collection('menuitems').countDocuments();
        console.log(`Documents in "menuitems": ${count}`);
        
        await mongoose.disconnect();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

testConnection();
