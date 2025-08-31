import express from 'express'
import isAuth from '../middlewares/isAuth.js'
import { comment, getAllPost, like, saved, uploadPost, deletePost } from '../controllers/post.controllers.js';
import { upload } from '../middlewares/multer.js';

// creating the router
const postRouter=express.Router();

postRouter.post("/upload",isAuth,upload.single("media"),uploadPost)
postRouter.get("/getAll", isAuth ,getAllPost)
postRouter.get("/like/:postId", isAuth ,like)
postRouter.post("/comment/:postId", isAuth,comment)
postRouter.get("/saved/:postId", isAuth ,saved)
postRouter.delete("/delete/:postId", isAuth, deletePost)

export default postRouter