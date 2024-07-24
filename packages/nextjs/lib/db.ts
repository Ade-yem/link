"use server";

import User from "./chat";

export const initializeUser = async (address: string) => {
  try {
    const us = await User.findOne({ address: address });
    if (us) {
      return;
    }
    await User.create({ address: address, preview: [] });
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

export const createPreview = async (address: string, receiver: string, room: string) => {
  try {
    const user = await User.findOne({ address: address });
    const preview = { sender: address, receiver: receiver, room: room };
    user?.preview.push(preview);
    user?.save();
    const user1 = await User.findOne({ address: receiver });
    const preview1 = { sender: receiver, receiver: address, room: room };
    user1?.preview.push(preview1);
    user1?.save();
  } catch (e) {
    console.error(e);
  }
};
