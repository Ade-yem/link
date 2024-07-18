import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const chatSchema = new Schema({
  sender: {
    type: String,
    required: true,
  },
  receiver: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  imageURI: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
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
    default: uuidv4(),
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
  chats: [chatSchema],
  preview: [previewSchema],
});

const User = mongoose.model("User", userSchema);
export default User;
