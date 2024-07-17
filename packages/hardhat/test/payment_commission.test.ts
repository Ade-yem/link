import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { LinkContract } from "../typechain-types";
// const {BigNumb} = require("ethers")

describe("Link Contract", function () {
  let Link;
  let link: LinkContract;
  let owner: HardhatEthersSigner;
  let customer: HardhatEthersSigner;
  let vendor: HardhatEthersSigner;
  let arbitrator: HardhatEthersSigner;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let addrs: any;

  beforeEach(async function () {
    Link = await ethers.getContractFactory("LinkContract");
    [owner, customer, vendor, arbitrator, ...addrs] = await ethers.getSigners();
    link = (await Link.deploy()) as LinkContract; // Assuming 10% commission rate
    await link.waitForDeployment();
    await link.connect(arbitrator).addArbitrator();
    await link.connect(vendor).RegisterVendor("vfgxhvjklkjcrxcygugu");
    await link.connect(customer).RegisterCustomer("vfgxhvjklkjcrxcygugu");
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await link.owner()).to.equal(owner.address);
    });

    it("Should set the right commission rate", async function () {
      expect(await link.commission_rate()).to.equal(10);
    });
  });

  describe("Register", function () {
    it("Should throw error when vendor trying to re register", async function () {
      await expect(link.connect(vendor).RegisterVendor("vfgxhvjklkjcrxcygugu")).to.be.revertedWith(
        "You are already registered",
      );
    });
    it("Should throw error when customer trying to re register", async function () {
      await expect(link.connect(customer).RegisterCustomer("vfgxhvjklkjcrxcygugu")).to.be.revertedWith(
        "You are already registered",
      );
    });
  });

  describe("Transactions", function () {
    it("Should emit TaskAdded event when a new task is added", async function () {
      const taskID = await link.generateID("Gadget", vendor.address);
      await expect(link.connect(customer).addTask("Gadget", "Features", ethers.parseEther("1"), vendor.address))
        .to.emit(link, "TaskAdded")
        .withArgs(vendor.address, "Gadget", taskID, ethers.parseEther("1"));
    });

    it("Should get all tasks created", async function () {
      await link.connect(customer).addTask("Gadget", "Features", ethers.parseEther("1"), vendor.address);
      await link.connect(customer).addTask("Gadgetss", "Featuresez", ethers.parseEther("1"), vendor.address);
      await link.connect(customer).addTask("Gadgets", "Features", ethers.parseEther("1"), vendor.address);
      const req = await link.connect(customer).getAllTasks();
      expect(req.length).to.equal(3);
    });

    it("Should allow a customer to purchase a task and emit TaskPaid event", async function () {
      const taskID = await link.generateID("Gadget", vendor.address);
      await link.connect(customer).addTask("Gadget", "Features", ethers.parseEther("1"), vendor.address);
      await expect(link.connect(customer).payForTask("Gadget", { value: ethers.parseEther("1") }))
        .to.emit(link, "TaskPaid")
        .withArgs(customer.address, vendor.address, ethers.parseEther("0.1"), "Gadget", taskID);
    });

    it("Should fail if the task does not exist", async function () {
      const fakeTaskName = "ethers.encodeBytes32String";
      await expect(
        link.connect(customer).payForTask(fakeTaskName, { value: ethers.parseEther("1") }),
      ).to.be.revertedWith("Task does not exist");
    });

    it("Should allow a vendor to remove his money", async function () {
      const finMoney = ethers.parseEther("1") - ethers.parseEther("1") / BigInt(10);
      await link.connect(customer).addTask("Gadget", "Features", ethers.parseEther("1"), vendor.address);
      await link.connect(customer).payForTask("Gadget", { value: ethers.parseEther("1") });
      await expect(await link.connect(vendor).paySeller())
        .to.emit(link, "VendorPaid")
        .withArgs(vendor.address, finMoney);
    });

    it("Should allow owner to withdraw balance", async function () {
      customer.sendTransaction({
        to: link.getAddress(),
        value: ethers.parseEther("1.0"),
      });
      const contract_balance = await ethers.provider.getBalance(link.getAddress());

      // Capture the transaction details to calculate gas cost
      await expect(link.connect(owner).withdraw()).to.changeEtherBalance(owner, contract_balance);
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
