import uploadOnCloudinary from "../config/cloudinary.js"
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js"
import { getIo, getSocketId } from "../socket.js"

//getting the current user with the post
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;
    // geting user with the populated things
    const user = await User.findById(userId)
      .populate("posts loops followers following story")
      .populate({
        path: "saved",
        populate: [
          {
            path: "author",
            select: "name userName profileImage",
          },
          {
            path: "comments.author",
            select: "name userName profileImage",
          },
         
        ],
      })
      .select("-password");

    if (!user) return res.status(400).json({ message: "User not found" });

    if (user && !user.story) {
  user.story = null;
}
    
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({
      message: `getin error in the current user ${error}`,
    });
  }
};

// user suggestion to the login user
export const suggestedUsers = async (req,res) =>{
    try {
        const users = await User.find({
            _id:{$ne:req.userId}             // suggest user me jo ligin he usko ni dikhana chahiye
        }).select("-password").populate("followers following")
        return res.status(200).json(users)
    } catch (error) {
        return res.status(500).json({message:`get suggested user error ${error}`})
    }
}

//for edit and update the login user details
export const editProfile = async (req,res) =>{
    try {
        const {name,userName, bio , profession , gender} = req.body
        const user = await User.findById(req.userId).select("-password");
        if(!user){
            return res.status(404).json("user not found")
        }
        const sameUserWithUserName = await User.findOne({userName}).select("-password")
        // validate same name user
        if(sameUserWithUserName && sameUserWithUserName._id != req.userId){
            return res.status(404).json({message:"username already exist"})
        }

        let profileImage 
        if(req.file){
            profileImage = await uploadOnCloudinary(req.file.path)
        }
        user.name=name;
        user.userName=userName
        if(profileImage){
            user.profileImage=profileImage
        }
        user.profession=profession
        user.gender=gender
        user.bio=bio

        await user.save()
        return res.status(200).json(user)

    } catch (error) {
       console.error("Edit profile error:", error);
         return res.status(500).json({message:`error in edit user`})
    }
}

//for get the profile
export const getProfile = async (req,res)=>{
    try {
        const userName= req.params.userName
        const user = await User.findOne({userName}).select("-password").populate("posts loops followers following saved")

        if(!user) return res.status(404).json({message:"user not found"})

        return res.status(200).json(user)
    } catch (error) {
         return res.status(500).json({message:`get profile error ${error}`})
    }
}

// for unfollow and follow 
export const follow=async (req,res)=>{
  try {
    const currentUserId=req.userId
    const targetUserId=req.params.targetUserId

    if(!targetUserId){
      return res.status(400).json({message:"target user is not found"})
    }

    if(currentUserId==targetUserId){
return res.status(400).json({message:"you can not follow yourself."})
    }

const currentUser=await User.findById(currentUserId)
const targetUser=await User.findById(targetUserId)

const isFollowing=currentUser.following.includes(targetUserId)

if(isFollowing){
  currentUser.following=currentUser.following.filter(id=>id.toString()!=targetUserId)
  targetUser.followers=targetUser.followers.filter(id=>id.toString()!=currentUserId)
  await currentUser.save()
   await targetUser.save()
   return res.status(200).json({
  following: false,
  message: "unfollow successfully",
  updatedCurrentUser: currentUser,
  updatedTargetUser: targetUser
});

}else{
  currentUser.following.push(targetUserId)
 targetUser.followers.push(currentUserId)
   if (currentUser._id !=  targetUser._id) {
    //sending the notification at the time of following 
                             const notification = await Notification.create({
                                 sender:currentUser._id,
                                 receiver: targetUser._id,
                                 type: "follow",
                                 message:"started following you"
                             })
                             const populatedNotification = await Notification.findById(notification._id).populate("sender receiver")
                             const receiverSocketId=getSocketId(targetUser._id)
                             if(receiverSocketId){
                              const io = getIo()
                                 io.to(receiverSocketId).emit("newNotification",populatedNotification)
                             }
                         
                         }
       await currentUser.save()
        await targetUser.save()
        
         return res.status(200).json({
       following: true,
       message: "follow successfully",
       updatedCurrentUser: currentUser,
       updatedTargetUser: targetUser
     });

}


  } catch (error) {
    return res.status(500).json({message:`follow error ${error}`})
  }
}


export const followingList=async (req,res)=>{
  try {
    const result=await User.findById(req.userId)
    return res.status(200).json(result?.following)
  } catch (error) {
     return res.status(500).json({message:`following error ${error}`})
  }
}


export const search=async (req,res)=>{
  try {
    const keyWord=req.query.keyword

    if(!keyWord){
      return res.status(400).json({message:"keyword is required"})
    }

    const users=await User.find({
      $or:[
        {userName:{$regex:keyWord,$options:"i"}},
        {name:{$regex:keyWord,$options:"i"}}
      ]
    }).select("-password")

    return res.status(200).json(users)

  } catch (error) {
    return res.status(500).json({message:`search error ${error}`})
  }
}

export const getAllNotification=async (req,res)=>{
  try {
    const notifications=await Notification.find({
      receiver:req.userId
    }).populate("sender receiver post loop").sort({createdAt:-1})
    return res.status(200).json(notifications)
  } catch (error) {
     return res.status(500).json({message:`get notification error ${error}`})
  }
}

export const markAsRead=async (req,res)=>{
  try {
    const {notificationId}=req.body

   if (Array.isArray(notificationId)) {
      // bulk mark-as-read
      await Notification.updateMany(
        { _id: { $in: notificationId }, receiver: req.userId },
        { $set: { isRead: true } }
      );
    } else {
      // mark single notification as read
      await Notification.findOneAndUpdate(
        { _id: notificationId, receiver: req.userId },
        { $set: { isRead: true } }
      );
    }
    return res.status(200).json({message:"marked as read"})

  } catch (error) {
    return res.status(500).json({message:`read notification error ${error}`})
  }
}