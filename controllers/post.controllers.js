import { isObjectIdOrHexString } from 'mongoose'
import uploadOnCloudinary from '../config/cloudinary.js'
import Post from '../models/post.model.js'
import User from '../models/user.model.js'
import { getSocketId, io } from '../socket.js';
import Notification from '../models/notification.model.js';


// upload and assign post to the user
export const uploadPost = async (req,res)=>{
    try {
        const {caption, mediaType}= req.body
        if (!mediaType) {
        return res.status(400).json({ message: "mediaType is required" });
         }

        let media;
        if(req.file){
            media= await uploadOnCloudinary(req.file.path)
        }else{
            return res.status(400).json({message :"media is required"})
        }
        //creating the post
        const post = await Post.create({
            caption,media,mediaType,author:req.userId
        })
        // user ke ander post upload kar rhe he
        const user = await User.findById(req.userId)
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.posts.push(post._id)
         await user.save()
        
    const populatedPost = await Post.findById(post._id).populate("author","name userName profileImage")
        return res.status(201).json(populatedPost)
} catch (error) {
    console.log(error);
    
                return res.status(500).json({message:`error in uploading the post ${error}`})
    }
}


//for get all the post of the user
export const getAllPost = async (req,res)=>{
    try {
        //we are getting all the post
        const posts = await Post.find({}).
        populate("author","name userName profileImage").
        populate("comments.author","name userName profileImage").
        sort({createdAt:-1})
        if (!posts.length) return res.status(404).json({ message: "No Post Found" });

         return res.status(200).json(posts)   
    } catch (error) {
        return res.status(500).json({message:`message in get post ${error}`})
    }
}

// for the like
export const like = async (req,res) =>{
    try {
        //itrate the id and find the post
        const postId = req.params.postId
        const post =  await Post.findById(postId)
        if(!post) return res.status(404).json({message:"post not found"})
        
        // here we are checking alredy liked or not 
        const alreadyLiked = post.likes.some(id=>id.toString()== req.userId.toString())
        if(alreadyLiked){
            post.likes = post.likes.filter(id=>id.toString()!= req.userId.toString())
        }else{
            post.likes.push(req.userId)
            //this is for the notification
            if(post.author._id != req.userId){
                const notification = await Notification.create({
                    sender:req.userId,
                    receiver:post.author._id,
                    type:"like",
                    post:post._id,
                    message:"Liked your post"
                })
                const populatedNotification = await Notification.findById(notification._id).
                populate("sender receiver post")
                const receiverSocketId = getSocketId(post.author._id)
                if(receiverSocketId){
                    io.to(receiverSocketId).emit("newNotification",populatedNotification)
                }

            }
        }


        await post.save()
        await  post.populate("author","name userName profileImage");
         await post.populate("comments.author", "name userName profileImage")

        //this is the like event
        io.emit("likedPost",{
            postId:post._id,
            likes:post.likes
        })

        return res.status(201).json(post);

    } catch (error) {
         return res.status(500).json({message:`like post error ${error}`})
    }
}

// for the comments
export const comment = async (req,res)=>{
    try {
        const {message} = req.body
        const postId = req.params.postId
        const post = await Post.findById(postId)
            if(!post) return res.status(404).json({message:"post not found"})
        
        post.comments.push({
            author:req.userId,
            message
        })
         //this is for the comment notification
            if(post.author._id != req.userId){
                const notification = await Notification.create({
                    sender:req.userId,
                    receiver:post.author._id,
                    type:"comment",
                    post:post._id,
                    message:"commented on your post"
                })
                const populatedNotification = await Notification.findById(notification._id).
                populate("sender receiver post")
                const receiverSocketId = getSocketId(post.author._id)
                if(receiverSocketId){
                    io.to(receiverSocketId).emit("newNotification",populatedNotification)
                }
                
            }


        await post.save()
        await post.populate("author","name userName profileImage");
        (await post.populate("comments.author", "name userName profileImage"));
            //this is the commnet event
         io.emit("commentedPost",{
            postId:post._id,
            comments:post.comments
        })


        return res.status(201).json(post)
    } catch (error) {
        return res.status(500).json({message:`comment post error ${error}`})
    }
}

// for saved post
export const saved = async (req, res) => {
  try {
    
    const postId = req.params.postId;
    const post = await Post.findById(postId)
    if(!post){
        return res.status(404).json("post not found")
    }

    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }


    //check already saved
    const alreadySaved = user.saved.some(
      id => id.toString() === postId.toString()
    );

    if (alreadySaved) {
      user.saved = user.saved.filter(
        id => id.toString() !== postId.toString()
      );
    } else {
      user.saved.push(postId);
    }
    
    await user.save();
    await user.populate({
    path: "saved",
    populate: [
    { path: "author", select: "name userName profileImage" },
    { path: "comments.author", select: "name userName profileImage" }
  ]
});
    return res.status(200).json(user);
  } catch (error) {
    console.error("Error in savedPost:", error);
    return res.status(500).json({ message: "Error in saved post" });
  }
};


