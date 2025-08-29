import mongoose from "mongoose";

const connectDb=async ()=>{
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/socialmedia")
        console.log("database is connectd");
        
    } catch (error) {
        console.log("something is wrong in connected the db",error);
        
    }
}

export default connectDb;