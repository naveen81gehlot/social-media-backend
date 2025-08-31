import mongoose from "mongoose";

const connectDb=async ()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI,{
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log("database is connectd");
        
    } catch (error) {
        console.log("something is wrong in connected the db",error);
        
    }
}

export default connectDb;