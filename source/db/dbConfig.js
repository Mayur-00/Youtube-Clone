import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();
 


const connectDB = async function(){

    try {
        
        const connectionInstance= await mongoose.connect(`${process.env.DB_URI}/ytClone`)

        console.log(`\n DB CONNECTED !!`);
        
        
    } catch (error) {
        console.log("MONGODB Connection Error:", error)
        
    }
}

export default connectDB