import mongoose,{Schema} from "mongoose";
import bcrypt from "bcrypt"
import { type } from "os";

const userSchema = new Schema({
    name: String,
    username: String,
    email: String,
    age: Number,
    password: String,
   posts:[{ type: mongoose.Schema.ObjectId, ref: "Post" }],
   profilePicture:{
    type:String,
    default:"default.jpg"
   }

},{
    timestamps: true
});

userSchema.pre('save', async function(next){
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password, 10)
    }
    next();
})

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;