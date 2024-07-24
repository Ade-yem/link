import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { ChatContract } from "../typechain-types";

describe("ChatContract", function () {
  let Chat;
  let chat: ChatContract;
  let sender: HardhatEthersSigner;
  let receiver: HardhatEthersSigner;

  beforeEach(async function () {
    Chat = await ethers.getContractFactory("ChatContract");
    [sender, receiver] = await ethers.getSigners();
    chat = (await Chat.deploy()) as ChatContract;
    await chat.waitForDeployment();
  });

  describe("Chats ", async function () {
    it("should create a chat", async function () {
      await expect(
        chat.createChat("bidfuidfbiudfbf", sender.getAddress(), receiver.getAddress(), "Hi, how are you doing", ""),
      )
        .to.emit(chat, "ChatCreated")
        .withArgs(
          "bidfuidfbiudfbf",
          sender.getAddress(),
          receiver.getAddress(),
          "Hi, how are you doing",
          "",
          (await time.latest()) + 1,
        );
    });

    it("should get all chats", async function () {
      await chat.createChat("bidfuidfbiudfbf", sender.getAddress(), receiver.getAddress(), "Hi, how are you doing", "");
      await chat.createChat("bidfuidfbiudfbf", sender.getAddress(), receiver.getAddress(), "Hi, how are you doing", "");
      expect((await chat.getChats()).length).to.equal(2);
    });
  });
});
