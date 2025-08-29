import User from "../models/user.model.js"
import Story from "../models/story.model.js"
import uploadOnCloudinary from '../config/cloudinary.js'

//uploading the sotry
export const uploadStory = async (req,res)=>{
    try {
         const user = await User.findById(req.userId)
         if(!user) return res.status(404).json("user not found")

        if(user.story){
            await Story.findByIdAndDelete(user.story)
            user.story = null
            //24aug
            await user.save()
        }
        // geting the media and its types
        const {mediaType} = req.body
        let media;;
        if(req.file){
            media = await uploadOnCloudinary(req.file.path)
        }else{
            return res.status(404).json({message:"media file is required"})
        }
        //creating the story
        const story = await Story.create({
            author:req.userId , mediaType, media
        })
        user.story=story._id
        await user.save()
        //populating the story and there viewers
        const populatedStory = await Story.findById(story._id).
        populate("author" ,"name userName profileImage").populate("viewers" ,"name userName profileImage")

        return res.status(200).json(populatedStory)
    } catch (error) {
        console.error("Upload story error:", error);
        return res.status(500).json({message:"story uploaded error"})
    }
}

//view the story of our followers
export const viewStory = async (req,res)=>{
    try {
        const storyId= req.params.storyId
        const story = await Story.findById(storyId)
        if(!story){
            return res.status(404).json({message:"story not found"})
        }
        //getting the viewersId
        const viewersIds = story.viewers.map(id=>id.toString()) 
        if(!viewersIds.includes(req.userId.toString())){
            story.viewers.push(req.userId)
            await story.save()
        }

        const populatedStory = await Story.findById(story._id).
          populate("author" ,"name userName profileImage").populate("viewers" ,"name userName profileImage")
          return res.status(200).json(populatedStory)
         
    } catch (error) {
         return res.status(500).json({message:"story view error"})
    }
}

//get story by userName
export const getStoryByUserName = async (req,res)=>{
    try {
        //iterate story by username 
        const userName = req.params.userName;
        if(!userName) return res.status(404).json({message:"userName is required"})
        //iterate the user
        const user = await User.findOne({userName})
        if(!user) return res.status(404).json({message:"user not found"})
            
           const story = await Story.find({
            author:user._id
           }).populate("viewers author")
           return res.status(201).json(story)
    } catch (error) {
        return res.status(500).json({message:`error in get story by username${error}`})
    }
}

// for getting the stories of our followings
export const getAllStories = async (req,res) =>{
    try {
        const currentUser = await User.findById(req.userId)
        //getting the following id
        const followingIds = await currentUser.following
        //getting the stories
        const stories = await Story.find({
            author:{$in:followingIds}
        }).populate("viewers author").sort({createdAt:-1})

        return res.status(200).json(stories)
    } catch (error) {
           return res.status(500).json({message:"error in getting all stories",error})
    }
}
