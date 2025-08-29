import express from 'express'
import isAuth from '../middlewares/isAuth.js'
import { editProfile, follow, followingList, 
    getAllNotification, 
getCurrentUser, getProfile, markAsRead, search, suggestedUsers } from '../controllers/user.controllers.js';
import { upload } from '../middlewares/multer.js';


// creating the router
const userRouter=express.Router();

userRouter.get("/current", isAuth , getCurrentUser)
userRouter.get("/suggested", isAuth ,suggestedUsers)
userRouter.post("/editprofile", isAuth, upload.single("profileImage"),editProfile)
userRouter.get("/getProfile/:userName", isAuth ,getProfile)
userRouter.get("/follow/:targetUserId", isAuth ,follow)
userRouter.get("/followingList", isAuth ,followingList)
userRouter.get("/search", isAuth ,search)
userRouter.get("/getAllNotification", isAuth ,getAllNotification)
userRouter.post("/markAsRead", isAuth ,markAsRead)



export default userRouter