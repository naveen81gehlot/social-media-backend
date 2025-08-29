import jwt from 'jsonwebtoken'

const isAuth = async (req,res,next)=>{
    try {
        const token= req.cookies.token
        if(!token){
            return res.status(400).json({message:"Token not found"})
        }
        // token varify karne ke liye
         const verifyToken= await jwt.verify(token,process.env.JWT_SECRET );

         // verify token ke object me se userid nikal kar req me assign kar rhe he 
         req.userId = verifyToken.userId
         next()
    } catch (error) {
         return res.status(500).json({message:` error in Isauth / means verify token ${error}`})
    }
}

export default isAuth