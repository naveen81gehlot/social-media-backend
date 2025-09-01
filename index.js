import express from 'express';
import dotenv from 'dotenv'
import connectDb from './config/db.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';
import postRouter from './routes/post.routes.js';
import loopRouter from './routes/loop.routes.js';
import storyRouter from './routes/story.routes.js';
import messageRouter from './routes/message.routes.js';
import { app, server } from './socket.js';



dotenv.config()
//create tehe app  ===========remove the normal for the socket io and use those app with all the requirments
//const app=express()

// accessing the port
const port =process.env.PORT || 5000

// middlewares 
app.use(cors({
     origin:"https://social-media-frontend-v8p4.onrender.com",
     credentials:true}))
app.use(express.json())
app.use(cookieParser())

// all router
app.use("/api/auth",authRouter)
app.use("/api/user",userRouter)
app.use("/api/post",postRouter)
app.use("/api/loop",loopRouter)
app.use("/api/story",storyRouter)
app.use("/api/message",messageRouter)

app.get('/', (req, res) => {
    res.send('Welcome to my API! 🚀');
});

//creating the server     // we have change the server for socket io thats why using the socket server
server.listen(port,()=>{
      connectDb()
      console.log(`Server started at http://localhost:${port}`);
})