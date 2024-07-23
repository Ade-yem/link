"use server";

import User from "./chat";
import { ChatMessage, Preview } from "~~/types/utils";

export const getUserByAddress = async (address: string) => {
  return await User.findOne({ address: address });
};

export const initializeUser = async (address: string) => {
  try {
    const us = await User.findOne({ address: address });
    if (us) {
      return;
    }
    await User.create({ address: address, chats: [], preview: [] });
  } catch (e: any) {
    console.log(e);
  }
};

export const getPreview = async (sender: string) => {
  try {
    const user = await User.findOne({ address: sender });
    const previews = user?.preview;
    return previews;
  } catch (e) {
    console.error(e);
  }
};

export const getRoomFromPreview = async (address: string, receiver: string) => {
  try {
    const user = await User.findOne({ address: address });
    const previews = user?.preview;
    if (previews) {
      const preview = previews.find((preview: any) => preview.receiver === receiver || preview.sender === receiver);
      return preview ? preview?.room : undefined;
    } else {
      throw new Error("User not found");
    }
  } catch (e) {
    console.error(e);
  }
};

export const createPreview = async (address: string, receiver: string) => {
  try {
    const user = await User.findOne({ address: address });
    const preview = { sender: address, receiver: receiver };
    user?.preview.push(preview);
    user?.save();
    const user1 = await User.findOne({ address: receiver });
    const preview1 = { sender: receiver, receiver: address };
    user1?.preview.push(preview1);
    user1?.save();
  } catch (e) {
    console.error(e);
  }
};
export const getMessages = async (address: string, receiver: string) => {
  try {
    const user = await User.findOne({ address: address });
    if (user) {
      const chats = user.chats;
      return chats.filter(
        (chat: any) =>
          (chat.receiver === receiver || chat.sender === address) &&
          // eslint-disable-next-line prettier/prettier
          (chat.receiver === address || chat.sender === receiver)
      );
    } else {
      throw new Error("User not found");
    }
  } catch (e) {
    console.error(e);
  }
};

export const addMessageTo = async (address: string, message: ChatMessage) => {
  try {
    const user = await User.findOne({ address: address });
    const user1 = await User.findOne({ address: message.receiver });
    if (user && user1) {
      user?.chats.push(message);
      user1?.chats.push(message);
      user?.save();
      user1?.save();
    } else {
      throw new Error("User not found");
    }
  } catch (e) {
    console.error(e);
  }
};

export const addPreviewTo = async (address: string, preview: Preview) => {
  try {
    const user = await User.findOne({ address: address });
    const user1 = await User.findOne({ address: preview.receiver });
    if (user && user1) {
      user?.preview.push(preview);
      const preview1 = preview;
      preview1.receiver = address;
      preview1.sender = preview.receiver;
      user1?.preview.push(preview1);
      user?.save();
      user1?.save();
    } else {
      throw new Error("User not found");
    }
  } catch (e) {
    console.error(e);
  }
};
