import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        let dbUri = process.env.MONGODB_URI;

        const ATLAS_URI = 'mongodb+srv://tejakiran188_db_user:teja%401243@cluster0.rgoa8eu.mongodb.net/food_court?appName=Cluster0';
        const LOCAL_URI = 'mongodb://localhost:27017/FOOD_COURT_MAIN';

        // Check if running on a deployed environment (Render, Vercel, or NODE_ENV is production)
        const isDeployed = process.env.NODE_ENV === 'production' || process.env.RENDER || process.env.VERCEL;

        if (isDeployed) {
            // Deployed environment: prefer platform env MONGODB_URI if it's not a localhost URI, otherwise fallback to Atlas URI
            dbUri = (dbUri && !dbUri.includes('localhost')) ? dbUri : ATLAS_URI;
        } else {
            // Local environment: use MONGODB_URI if it is set and contains localhost, otherwise LOCAL_URI
            dbUri = (dbUri && dbUri.includes('localhost')) ? dbUri : LOCAL_URI;
        }

        const conn = await mongoose.connect(dbUri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

export default connectDB;
