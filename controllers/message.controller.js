import uploadOnCloudinary from '../config/cloudinary.js'
import Conversation from '../models/conversation.model.js';
import Message from '../models/message.model.js';
import { getSocketId, io } from '../socket.js';

//sending message 
export const sendMessage = async(req,res)=>{
    try {
        const senderId = req.userId;
        const receiverId = req.params.receiverId
        const {message} = req.body

        let image;
        if(req.file){
            image = await uploadOnCloudinary(req.file.path)
        }
        //creating the message
        const newMessage = await Message.create({
            sender:senderId,
            receiver:receiverId,
            message,
            image
        })

        let conversation = await Conversation.findOne({
            participants:{$all:[senderId,receiverId]}
        })
        if(!conversation){
            conversation = await Conversation.create({
                participants:[senderId,receiverId],
                messages:[newMessage._id]
            })
        }else{
            conversation.messages.push(newMessage._id)
           await conversation.save()
        }
const receiverSocketId = getSocketId(receiverId);
const senderSocketId = getSocketId(senderId);

// sending message to the receiver
if (receiverSocketId) {
    io.to(receiverSocketId).emit("newMessage", newMessage);
    io.to(receiverSocketId).emit("updatePrevChatUsers", senderId);
}

//  sending message to the sender
if (senderSocketId) {
    io.to(senderSocketId).emit("newMessage", newMessage);
    io.to(senderSocketId).emit("updatePrevChatUsers", receiverId);
}
return res.status(200).json(newMessage)

    } catch (error) {
        return res.status(500).json({message:`send message error ${error}`})
    }
}

//getting all the msg
export const getAllMessages = async(req,res)=>{
    try {

        const senderId = req.userId;
        const receiverId = req.params.receiverId
        //finding the old conversation
       const conversation = await Conversation.findOne({
          participants:{$all:[senderId,receiverId]}
       }).populate("messages")

        return res.status(200).json(conversation?.messages)

    } catch (error) {
        return res.status(500).json({message:`get message error ${error}`})
    }
}

//getting the old chats
export const getPreviousUserChats = async(req,res)=>{
    try {
        const currentUserId = req.userId
        //finding the conversation
        const conversations = await Conversation.find({
            participants:currentUserId
        }).populate("participants").sort({updatedAt:-1})

         const userMap = {}; 

        conversations.forEach(conv => {
            conv.participants.forEach(user =>{
                if(user._id != currentUserId){
                    userMap[user._id] = user
                }
            })
        });

        const previousUser = Object.values(userMap)
        return res.status(200).json(previousUser)
    } catch (error) {
          return res.status(500).json({message:`get previous user error ${error}`})
    }
}