import { randomUUID } from "crypto";
import mongoose, { Schema } from "mongoose";

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
    default: randomUUID(),
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

export default mongoose.model("User", userSchema);
