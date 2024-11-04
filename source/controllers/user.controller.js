import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { validateUser } from "../utils/validate.js";
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js"

const registerUser = asyncHandler( async (req,res) => {

   // get the userdata from the frontend
   const {fullName, password, email, userName}= req.body
    const userdata={
        fullName,
        password,
        email,
        userName
    };

       // userdata validation
    const{error,value}= validateUser.validate(userdata);

if(error) throw new ApiError(400, "All Fields Are Required");


   //check if the user already exists: username , email 
const existingUser = await  User.findOne({
    $or: [{userName},{email}]
});

if(existingUser){
    throw new ApiError(409,"email or username already exist please login !!!")
}


   // check for images for avatar
const avatarLocalPath= req.files?.avatar[0]?.path;
const coverImageLocalPath= req.files?.coverImage[0]?.path;

if(!avatarLocalPath){
    throw new ApiError(400, "avathar file is required")
}


   // upload images on cloudinary, avatar
 const avatar = await uploadOnCloudinary(avatarLocalPath)
 const coverImage = await uploadOnCloudinary(coverImageLocalPath)

 if(!avatar){
    throw new ApiError(400, "avathar file is required")
 }


   // create user object in database
 const user= await User.create({
    fullName,
    avatar:avatar.url,
    coverImage:coverImage?.url ||"",
    email,
    password,
    userName:userName.toString()
 });

 console.log(createdUser);


   // remove password and refresh token from the field  response
 const createdUser = User.findById(user._id).select(" -password -refreshToken");


   // check for user creation
 if(!createdUser){
    throw new ApiError(500, "something went wrong while creating the user !")
 }


   // return res
 return res.status(200).json(
    new ApiResponse(200,createdUser,"user created successfully")
 )
 



})


export  {registerUser}