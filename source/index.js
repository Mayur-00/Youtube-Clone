
import connectDB from "./db/dbConfig.js";
import { app } from "./app.js";
import dotenv from 'dotenv';
dotenv.config();

connectDB()
.then(
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`server is running on : ${process.env.PORT}`);
        
    })
)
.catch((err)=>{
    console.log("DB Connection Faild !!", err);
     
})


 