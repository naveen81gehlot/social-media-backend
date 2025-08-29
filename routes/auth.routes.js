import express from 'express'
import { signIn, signUp ,signOut, sendOtp, verifyOtp, resetPassword} from '../controllers/auth.controllers.js';

// creating the router
const authRouter=express.Router();

// for sign up , signout , sign in
authRouter.post("/signup",signUp)
authRouter.post("/signin",signIn)
authRouter.get("/signout",signOut)

// for resete password and otp
authRouter.post("/sendOtp",sendOtp)
authRouter.post("/verifyOtp",verifyOtp)
authRouter.post("/resetPassword",resetPassword)

export default authRouter