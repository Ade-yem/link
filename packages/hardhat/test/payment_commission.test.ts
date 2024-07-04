import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { LinkContract } from "../typechain-types";
// const {BigNumb} = require("ethers")

describe("Link Contract", function () {
  let Link: any;
  let link: any;
  let owner: HardhatEthersSigner;
  let customer: HardhatEthersSigner;
  let vendor: HardhatEthersSigner;
  let arbitrator: HardhatEthersSigner;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let addrs: any;

  beforeEach(async function () {
    Link = await ethers.getContractFactory("LinkContract");
    [owner, customer, vendor, arbitrator, ...addrs] = await ethers.getSigners();
    link = (await Link.deploy(10)) as LinkContract; // Assuming 10% commission rate
    await link.waitForDeployment();
    const transaction = {
      to: link.getAddress(),
      value: ethers.parseEther("1.0"),
    };
    customer.sendTransaction(transaction);
    await link.connect(arbitrator).addArbitrator();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await link.owner()).to.equal(owner.address);
    });

    it("Should set the right commission rate", async function () {
      expect(await link.commission_rate()).to.equal(10);
    });
  });

  describe("Transactions", function () {
    it("Should emit TaskAdded event when a new task is added", async function () {
      const taskID = await link.generateID("Gadget", vendor.address);
      await expect(link.connect(vendor).addTask("Gadget", "Features", ethers.parseEther("1"), vendor.address))
        .to.emit(link, "TaskAdded")
        .withArgs(vendor.address, "Gadget", taskID, ethers.parseEther("1"));
    });

    it("Should get all tasks created", async function () {
      await link.connect(vendor).addTask("Gadget", "Features", ethers.parseEther("1"), vendor.address);
      await link.connect(vendor).addTask("Gadgetss", "Featuresez", ethers.parseEther("1"), vendor.address);
      await link.connect(vendor).addTask("Gadgets", "Features", ethers.parseEther("1"), vendor.address);
      const req = await link.connect(vendor).getAllTasks();
      expect(req.length).to.equal(3);
    });

    it("Should allow a customer to purchase a task and emit TaskPaid event", async function () {
      const taskID = await link.generateID("Gadget", vendor.address);
      const id = await link.connect(vendor).addTask("Gadget", "Features", ethers.parseEther("1"), vendor.address);
      console.log(id + "   =>   " + taskID);
      await expect(link.connect(customer).payForTask("Gadget", { value: ethers.parseEther("1") }))
        .to.emit(link, "TaskPaid")
        .withArgs(customer.address, vendor.address, ethers.parseEther("0.1"), "Gadget", taskID);
    });

    it("Should fail if the task does not exist", async function () {
      const fakeTaskName = "ethers.encodeBytes32String";
      await expect(
        link
          .connect(customer)
          .payForTask(fakeTaskName, { value: ethers.parseEther("1") })
          .to.be.revertedWith("Task does not exist"),
      );
    });

    it("Should allow owner to withdraw balance", async function () {
      customer.sendTransaction({
        to: link.getAddress(),
        value: ethers.parseEther("1.0"),
      });
      const ownerBalanceBefore = await ethers.provider.getBalance(owner.getAddress());
      // const contract_balance = await ethers.provider.getBalance(link.getAddress());

      // Capture the transaction details to calculate gas cost
      // const tx =
      await link.connect(owner).withdraw();
      // const receipt = await tx.wait(); // Wait for the transaction to be mined
      // const gasUsed = ethers.toBigInt(receipt.gasUsed) * ethers.toBigInt(receipt.effectiveGasPrice);

      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);

      // The owner's balance after should be the initial balance plus the contract balance minus the gas cost
      expect(ownerBalanceAfter).to.equal(ownerBalanceBefore);
      // expect(ownerBalanceAfter).to.equal(ownerBalanceBefore.add(contract_balance).sub(gasUsed));
    });

    it("Should fail if non-owner tries to withdraw", async function () {
      await expect(link.connect(customer).withdraw()).to.be.revertedWith("You cannot do this!");
    });
  });

  describe("Arbitration", function () {
    it("Should lodge a complaint about a bought task", async function () {
      expect(await link.connect(customer).lodgeComplaint("Gadget", "Not the expected specification"))
        .to.emit(link, "ComplaintLodged")
        .withArgs(customer.address, "Gadget", "Not the expected specification");
    });

    it("Should resolve the conflict without refunding customer", async function () {
      expect(await link.connect(arbitrator).resolveComplaint(customer, "Not a problem"))
        .to.emit(link, "ComplaintLodged")
        .withArgs(customer.address, arbitrator.address, "Gadget", "Not a problem");
    });
  });
});
