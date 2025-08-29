import express from 'express'
import isAuth from '../middlewares/isAuth.js'

import { upload } from '../middlewares/multer.js';
import { comment, getAllLoop, like, uploadLoop } from '../controllers/loop.controllers.js';

// creating the router
const loopRouter=express.Router();

loopRouter.post("/upload",isAuth,upload.single("media"),uploadLoop)
loopRouter.get("/getAll", isAuth ,getAllLoop)
loopRouter.get("/like/:loopId", isAuth ,like)
loopRouter.post("/comment/:loopId", isAuth,comment)




export default loopRouter