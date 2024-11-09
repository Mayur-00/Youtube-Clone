import mongoose, {Schema} from "mongoose"; 



const subscriptionsSchema = new Schema(
    
    {
        subscriber:{
            type: Schema.Types.ObjectId,
            ref:"User"
        },
        channel:{
            type:Schema.Types.ObjectId,
            ref:"user"
        }
    }

);

export const subscription = mongoose.model("sabscription", subscriptionsSchema)