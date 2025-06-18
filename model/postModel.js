import mongoose, { Schema } from "mongoose";

const postSchema = new Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User"
  },
  content: String,
  likes: [
    { type: mongoose.Schema.ObjectId, ref: "User" }
  ]
}, {
  timestamps: true
});

const Post = mongoose.models.Post || mongoose.model("Post", postSchema);

export default Post;
