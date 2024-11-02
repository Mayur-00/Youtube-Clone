import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const userSchema = new Schema({
    userName:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    fullName:{
        type:String,
        required:true,
        trim:true,
        index:true
    },
    avatar:{
        type:String, //cloudinary
        required:true,
        
    },
    coverImage:{
        type:String, //cloudinary
        required:true,
        
    },
    watchHistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"video"
        }
    ],
    password:{
        type:String,
        required:[true,"password is required"]
    },
    refreshToken:{
        type:String
    }

},
{
    timestamps:true
}

);

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next()

     this.password = await bcrypt.hash(this.password,10)
    next()
});

userSchema.methods.isPasswordCorrect= async function(password){
      return await bcrypt.compare(password,this.password);
};

userSchema.methods.generateAccessToken = async function(){
    return jwt.sign(
        {
            _id : this._id,
            email : this.email,
            userName: this.userName
        },
        process.env.ACCESS_KEY,
        {
            expiresIn:ACCESS_KEY_EXPIRY
        }
    )
};
userSchema.methods.generateRefreshToken = async function(){
    return jwt.sign(
        {
            _id : this._id,
         
        },
        process.env.REFRESH_TOKEN_KEY,
        {
            expiresIn:REFRESH_TOKEN_KEY_EXPIRY
        }
    )
};
userSchema.methods.generateAccessToken = async function(){
    return jwt.sign(
        {
            _id : this._id,
            email : this.email,
            userName: this.userName
        },
        process.env.ACCESS_KEY,
        {
            expiresIn:ACCESS_KEY_EXPIRY
        }
    )
};


export const user = mongoose.model("User",userSchema)