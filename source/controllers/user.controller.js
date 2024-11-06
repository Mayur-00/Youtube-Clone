import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { validateUser } from "../utils/validate.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"


const generateAccessTokenAndRefreshToken = async (userId) => {

   const user = await User.findById(userId);
   const refreshToken = user.generateRefreshToken();
   const accessToken = user.generateAccessToken();

   user.refreshToken = refreshToken;
   await user.save({ validateBeforeSave: false })

   return ({ refreshToken, accessToken })
}

const registerUser = asyncHandler(async (req, res) => {

   // get the userdata from the frontend
   const { fullName, password, email, userName } = req.body
   const userdata = {
      fullName,
      password,
      email,
      userName
   };

   // userdata validation
   const { error, value } = validateUser.validate(userdata);

   if (error) throw new ApiError(400, "All Fields Are Required");


   //check if the user already exists: username , email 
   const existingUser = await User.findOne({
      $or: [{ userName }, { email }]
   });

   if (existingUser) {
      throw new ApiError(409, "email or username already exist please login !!!")
      res.status(409)
   }


   // check for images for avatar
   const avatarLocalPath = req.files?.avatar[0]?.path;
   // const coverImageLocalPath= req.files?.coverImage[0]?.path;

   let coverImageLocalPath;

   if (req.files && Array.isArray(req.files.
      coverImage) && req.files.coverImage.length > 0) {
      coverImageLocalPath.req.files.coverImage[0].path
   }



   if (!avatarLocalPath) {
      throw new ApiError(400, "avathar file is required")
   }


   // upload images on cloudinary, avatar
   const avatar = await uploadOnCloudinary(avatarLocalPath)
   const coverImage = await uploadOnCloudinary(coverImageLocalPath)

   if (!avatar) {
      throw new ApiError(400, "avathar file is required")
   }


   // create user object in database
   const user = await User.create({
      fullName,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email,
      password,
      userName

   });

   // console.log(user);


   // remove password and refresh token from the field  response
   const createdUser = await User.findById(user._id).select(" -password -refreshToken");


   // check for user creation
   if (!createdUser) {
      throw new ApiError(500, "something went wrong while creating the user !")
   }


   // return res
   return res.status(200).json(
      new ApiResponse(200, createdUser, "user created successfully")
   )

});

const loginUser = asyncHandler(async (req, res) => {

   const { email, password } = req.body;

   if (!email) {
      throw new ApiError(400, "email is required for login !!!!")
   }


   const user = await User.findOne({ email: email });

   if (!user) {
      throw new ApiError(404, "user does not exist ")
   }


   const isPasswordValid = await user.isPasswordCorrect(password);

   if (!isPasswordValid) {
      throw new ApiError(401, "invalid user credentails");
   }

   const { refreshToken, accessToken } = await generateAccessTokenAndRefreshToken(user._id);

   const loggedinUser = await User.findById(user._id).select("-password -refreshToken")

   const options = {
      httpOnly: true,
      secure: true
   };

   return res.status(200)
      .cookie("accessToken", accessToken.toString(), options)
      .cookie("refreshToken", refreshToken.  toString(), options)
      .json(
         new ApiResponse(
            200,
            {
               user: loggedinUser, accessToken, refreshToken
            }
         )
      )



});

const logoutUser = asyncHandler(async (req, res) => { 

   await User.findOneAndUpdate(
      req.user._id,
      {
         $set: {
            refreshToken: undefined
         }
      },
      {
         new: true
      }
   );

   const options = {
      httpOnly: true,
      secure: true
   };

   return res
   .status(200)
   .clearCookie("accessToken",options )
   .clearCookie("refreshToken",options )
   .json( new ApiResponse(200, {}, "user logged out successfully!"))

});

const refreshAccessToken = asyncHandler(async (req,res)=>{

   try {
      const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
   
      if(!incomingRefreshToken){
         throw new ApiError(401,"unauthorized request")
      }
      const decodedToken =jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_KEY);
   
      const user = await User.findById(decodedToken._id)
   
      if(!user){
         throw new ApiError(401, "invalid Refresh Token")
      }
   
      if(incomingRefreshToken !== user.refreshToken){
         throw new ApiError(401, "Refresh token is expired or used")
      }
   
      const options = {
         httpOnly:true,
         secure:true
      }
   
     const {accessToken, newrefreshToken} = await generateAccessTokenAndRefreshToken(user._id)
   
     return res.status(200)
     .cookie("accessToken", accessToken, options)
     .cookie("refreshToken", newrefreshToken, options)
     .json(
      new ApiResponse(
         200,
         {
            accessToken,
            refreshToken:newrefreshToken
         },
         "accessToken refreshed"
      )
     )
   } catch (error) {
      throw new ApiError(401, error.message || "invalid RefressToken")
      
   }


})


export {
   registerUser,
   loginUser,
   logoutUser,
   refreshAccessToken
}