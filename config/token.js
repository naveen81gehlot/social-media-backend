import jwt from 'jsonwebtoken'

// generating the token and return the token
const genToken= async (userId)=>{
    try {
        const token=await jwt.sign({userId},process.env.JWT_SECRET,{expiresIn:"10y"});
        return token
    } catch (error) {
        console.log(`error in token generation ${error}`);
        throw error
    }
}

export default genToken