import mongoose, { Schema } from "mongoose";

const previewSchema = new Schema({
  receiver: {
    type: String,
    required: true,
  },
  sender: {
    type: String,
    required: true,
  },
  room: {
    type: String,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const userSchema = new Schema({
  address: {
    type: String,
    required: true,
  },
  preview: [previewSchema],
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
