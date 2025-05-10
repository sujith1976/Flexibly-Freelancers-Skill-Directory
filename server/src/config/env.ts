import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 5000;
// Using MongoDB Atlas connection string
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://suhithbvps2976:PTR4R0p7R8zT1Lig@sujithcluster.bbmzrxr.mongodb.net/?retryWrites=true&w=majority&appName=SUJITHCLUSTER'; 
