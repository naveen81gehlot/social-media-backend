import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import genToken from "../config/token.js";
import validator from "validator";
import sendMail from "../config/Mail.js";

// this is the sign up / register
export const signUp = async (req, res) => {
  try {
    const { name, email, password, userName } = req.body;

    // Email validation
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    // Username validation
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(userName)) {
      return res.status(400).json({
        message:
          "Username must be 3–20 chars, only letters, numbers, and underscores allowed.",
      });
    }

    // Detailed password validation
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long." });
    }
    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({
        message: "Password must include at least one uppercase letter.",
      });
    }
    if (!/[a-z]/.test(password)) {
      return res.status(400).json({
        message: "Password must include at least one lowercase letter.",
      });
    }
    if (!/\d/.test(password)) {
      return res
        .status(400)
        .json({ message: "Password must include at least one number." });
    }
    if (!/[@$!%*?&]/.test(password)) {
      return res.status(400).json({
        message: "Password must include at least one special character.",
      });
    }

    //checking the email already exist or not
    const findByEmail = await User.findOne({ email: email.toLowerCase() });
    if (findByEmail) {
      return res.status(400).json({ message: "Email already exits" });
    }
    //checking the userName already exist or not
    const findByUserName = await User.findOne({
      userName: { $regex: new RegExp(`^${userName}$`, "i") },
    });
    if (findByUserName) {
      return res.status(400).json({ message: "UserName already exits" });
    }

    //hashing the password before saving the user
    const hashedPassword = await bcrypt.hash(password, 10);
    /// saving the new user
    const user = await User.create({
      name,
      userName,
      email: email.toLowerCase(),
      password: hashedPassword,
    });
    // yaha par token generate karne par wo direct home par jaa rha tha isliye token generate nhi kiya
    //generating the token and saving in the cookie
    // const token = await genToken(user._id);

    // res.cookie("token", token, {
    //   httpOnly: true,
    //   maxAge: 10 * 365 * 24 * 60 * 60 * 1000, //10years
    //   secure: false,
    //   sameSite: "Strict",
    // });

    // deleting the password for the  responce nhi to password dikh jayega respoce me
    
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    return res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error("Sign up error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


// this is for the sign in - login
export const signIn = async (req, res) => {
  try {
    const { password, identifier } = req.body;

const user = await User.findOne({
  $or: [
    { email: identifier.toLowerCase() },
    { userName: { $regex: new RegExp(`^${identifier}$`, "i") } },
  ],
});
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // matching the entered password and hashed password is same
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    //generating the token and saving in the cookie
    const token = await genToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 10 * 365 * 24 * 60 * 60 * 1000, //10years
      secure: false,
      sameSite: "Strict",
    });

    // Return user without password
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    return res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error("Sign In error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


// this is the signout
export const signOut= async (req,res)=>{
    try {
        res.clearCookie("token");
        return res.status(200).json({message:"log out successfully"})
    } catch (error) {
        return res.status(500).json({message:`sign out error ${error}`})
    }
}

//this is for the otp first setp step 1
export const sendOtp = async (req,res) =>{
  try {
    const {email} = req.body;
    const user= await User.findOne({ email: email.toLowerCase()});
    if(!user) return res.status(404).json({message:"user not found"});

    const otp= Math.floor(1000 + Math.random() * 9000).toString();

    user.resetOtp = otp;
    user.otpExpires =Date.now() + 10*60*1000
    user.isOtpVerified= false

    await sendMail(email,otp)
    await user.save()
    return res.status(200).json({message:"email successfully send"})
  } catch (error) {
    return res.status(500).json({message:`Error in sending otp ${error}`});
  }
}

// step 2 otp verifying
export const verifyOtp= async (req,res) =>{
  try {
    const {email , otp}= req.body
    const user= await User.findOne({ email: email.toLowerCase()});

    if(!user || user.resetOtp !== otp || user.otpExpires< Date.now()){
      return res.status(400).json({message:"invalid or expired otp"})
    }

    user.isOtpVerified=true
    user.resetOtp=undefined
    user.otpExpires=undefined

    await user.save()
    return res.status(201).json({message:"Otp verified successfully"})

  } catch (error) {
    return res.status(500).json({message:`Error in otp verify ${error}`});
    
  }
}

//step three
export const resetPassword= async (req,res) =>{
  try {
    const {email,password}= req.body
    const user= await User.findOne({ email: email.toLowerCase()});

    if(!user || !user.isOtpVerified ){
      return res.status(400).json({message:"OTP verification required"})
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long." });
    }
    if (!/[A-Z]/.test(password)) {
      return res
        .status(400)
        .json({ message: "Password must include at least one uppercase letter." });
    }
    if (!/[a-z]/.test(password)) {
      return res
        .status(400)
        .json({ message: "Password must include at least one lowercase letter." });
    }
    if (!/\d/.test(password)) {
      return res
        .status(400)
        .json({ message: "Password must include at least one number." });
    }
    if (!/[@$!%*?&]/.test(password)) {
      return res
        .status(400)
        .json({ message: "Password must include at least one special character." });
    }

    const hashedPassword =await bcrypt.hash(password, 10);
    user.password=hashedPassword;
    user.isOtpVerified= false;
     await user.save();
     return res.status(200).json({message:"Password reset successfully"})

  } catch (error) {
     return res.status(500).json({message:`Reset otp error ${error}`})

  }
}

