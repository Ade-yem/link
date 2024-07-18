// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

/**
 * @title Link payment and commissions
 * @author Adeyemi
 * @notice 
 */
contract LinkContract {
    struct Task {
        bytes32 id;
        string name;
        string description;
        uint256 price;
        address vendor;
        address customer;
        bool completed;
    }
    struct Complaint {
        address lodger;
        string productName;
        string complaint;
        string judgement;
        uint256 time;
        bool resolved;
    }
    struct Vendor {
        string service;
        string file1;
        string file2;
        string file3;
        address account;
        uint256 totalMoney;
        bool flagged;
    }
    struct Profile {
        string  name;
        string email;
        string phoneNumber;
        string homeAddress;
        string role;
        string picture;
        address account;
    }
    struct PendingTransferToVendor {
        address vendor;
        address customer;
        uint256 amount;
    }
    address public owner;
    mapping (address => Profile) public customers;
    mapping (address => Profile) public profiles;
    mapping (address => Vendor) public vendors;
    mapping (bytes32 => Task) internal tasks;
    mapping (string => bytes32) internal taskNames;
    mapping (address => Complaint) internal complaints;
    mapping (address => bool) internal arbitrator;
    mapping (address => bool) public vendor_C;
    mapping (address => bool) public customer_C;
    uint256 public commission_rate;
    uint256 internal outstanding;
    uint256 private commission_total = 0;
    Task[] public taskList;
    address[] public allVendors;
    event Withdrawal(uint amount, uint when);
    event TaskAdded(address vendor, string name, bytes32 id, uint256 price);
    event TaskPaid(address customer, address vendor, uint256 commission, string productName, bytes32 id);
    event VendorPaid(address vendor, uint256 amount);
    event ComplaintLodged(address lodger, string product, string complaint);
    event ComplaintResolved(address lodger, address arbitrator, string product, string judgement);
    event BuyerRefunded(address customer, string productName, string complaint);
    event VendorRegistered(address vendor);
    event VendorFlagged(address vendor, uint256 time);
    event VendorUnflagged(address vendor, uint256 time);
    event CustomerRegistered(address vendor);


    constructor() {
        owner = msg.sender;
        commission_rate = 10;
    }

    modifier onlyOwner {
        if (msg.sender != owner) {
            revert("You cannot do this!");
        }
        _;
    }
    modifier onlyArbitrator {
        if (!arbitrator[msg.sender]) {
            revert("You are not an arbitrator!");
        }
        _;
    }
    
    modifier onlyCustomer {
        if (!customer_C[msg.sender]) {
            revert("You are not a customer!");
        }
        _;
    }
    modifier onlyVendor {
        if (!vendor_C[msg.sender]) {
            revert("You are not a customer!");
        }
        _;
    }
    modifier verifyBeforeRegistration() {
        if (vendor_C[msg.sender] || customer_C[msg.sender]) {
            revert("You are already registered");
        }
        _;
    }

    /**
     * adds an arbitrator
     */
    function addArbitrator() public {
        arbitrator[msg.sender] = true;
    }

    /**
     * creates a bytes32 array from two strings
     * @param str1 first string
     * @param str2 second string
     */
    function generateID(string memory str1, address str2) public pure returns (bytes32) {
        return(keccak256(abi.encodePacked(str1, str2)));
    }

    function setCommissionRate(uint256 _rate) public onlyOwner {
        commission_rate = _rate;
    }

    /**
     * Take commission on payment
     * @param amount price of product
     * @param vendor vendor's address
     */
    function takeCommission(uint256 amount, address vendor) internal returns(uint256) {
        uint256 commission = (amount * commission_rate) / 100;
        uint256 rem = amount - commission;
        vendors[vendor].totalMoney += rem;
        outstanding += rem;
        commission_total += commission;
        return (commission);
    }

    function withdrawCommission() public onlyOwner {
        payable(owner).transfer(commission_total);
        emit Withdrawal(commission_total, block.timestamp);
    }    

    function RegisterVendor(string memory name, string memory email, string memory phoneNumber, string memory homeAddress, string memory role, string memory picture, string memory service, string memory file1, string memory file2, string memory file3) public {
        Profile memory newP = Profile(name, email, phoneNumber, homeAddress, role, picture, msg.sender);
        Vendor memory newV = Vendor(service, file1, file2, file3, msg.sender, 0, false);
        profiles[msg.sender] = newP;
        vendors[msg.sender] = newV;
        vendor_C[msg.sender] = true;
        allVendors.push(msg.sender);
        emit VendorRegistered(msg.sender);
    }

    function RegisterCustomer(string memory name, string memory email, string memory phoneNumber, string memory homeAddress, string memory role, string memory picture) public {
        Profile memory newC = Profile(name, email, phoneNumber, homeAddress, role, picture, msg.sender);
        customers[msg.sender] = newC;
        profiles[msg.sender] = newC;
        customer_C[msg.sender] = true;
        emit CustomerRegistered(msg.sender);
    }

    /**
     * @dev Adds a product to the contract
     * @param name name of product
     * @param description description of the product
     * @param price price of the product
     * @param vendor vendor's address
     */
    function addTask(string memory name, string memory description, uint256 price, address vendor) public onlyCustomer {
        if (vendor_C[vendor] != true) {
            revert("The vendor address is not valid");
        }
        bytes32 id = generateID(name, vendor);
        Task memory item = Task(id, name, description, price, vendor, msg.sender, false);
        tasks[id] = item;
        taskNames[name] = id;
        taskList.push(item);
        emit TaskAdded(vendor, name, id, price);
    }

    function getAllTasks() public view returns (Task[] memory) {
        return taskList;
    }

    function getAllVendors() public view returns (address[] memory) {
        return allVendors;
    }

    function getTask(bytes32 id) public view returns(Task memory) {
        if (id[0] == 0) {
            revert("Task does not exist");
        }
        Task memory item = tasks[id];
        if (item.vendor == address(0) || item.price == 0) {
            revert ("Task does not exist");
        }
        return tasks[id];
    }

    /**
     * Pay money for task
     * @param name name of the product
     */
    function payForTask(string memory name) public payable {
        bytes32 _id = taskNames[name];
        if (_id[0] == 0) {
            revert("Task does not exist");
        }
        Task memory item = tasks[_id];
        if (item.vendor == address(0) || item.price == 0) {
            revert ("Task does not exist");
        }
        if (msg.value < item.price) {
            revert("Insufficient funds");
        }
        uint256 commission = takeCommission(msg.value, item.vendor);
        tasks[_id].completed = true;

        emit TaskPaid(msg.sender, item.vendor, commission, item.name, _id);
    }

    /**
     * Pay payable vendor
     */
    function paySeller() public {
        if (vendors[msg.sender].totalMoney == 0) {
            revert("You are not a vendor or we do not have your money");
        }
        if (vendors[msg.sender].flagged) {
            revert("Someone lodged a complaint about you, await resolution!");
        }
        payable(msg.sender).transfer(vendors[msg.sender].totalMoney);
        emit VendorPaid(msg.sender, vendors[msg.sender].totalMoney);
        outstanding -= vendors[msg.sender].totalMoney;
        vendors[msg.sender].totalMoney = 0;
    }

    /**
     * owner withdraws money
     */
    function withdraw() public payable onlyOwner {
        if (address(this).balance > 0) {
            revert("You should have more money");
        }
        payable(owner).transfer(address(this).balance);
        emit Withdrawal(address(this).balance, block.timestamp);
    }

    /**
     * Lodges a complaint
     * @param product_name name of the product
     * @param complaint complaint
     * emits [ComplaintLodged] event
     */
    function lodgeComplaint(string memory product_name, string memory complaint) public {
        Complaint memory complain = Complaint(msg.sender, product_name, complaint, "", block.timestamp, false);
        complaints[msg.sender] = complain;
        bytes32 id = taskNames[product_name];
        vendors[tasks[id].vendor].flagged = true;
        emit ComplaintLodged(msg.sender, product_name, complaint);
        emit VendorFlagged(tasks[id].vendor, block.timestamp);
    }

    /**
     * Complaint resolving
     * @param customer complainer
     * @param judgement arbitrator's judgement
     */
    function resolveComplaint(address customer, string memory judgement) public onlyArbitrator {
        complaints[customer].judgement = judgement;
        complaints[customer].resolved = true;
        bytes32 _id = taskNames[complaints[customer].productName];
        vendors[tasks[_id].vendor].flagged = false;
        emit ComplaintResolved(customer, msg.sender, complaints[customer].productName, judgement);
        emit VendorUnflagged(tasks[_id].vendor, block.timestamp);
    }

    function returnBuyerFunds(address customer, string memory judgement) public onlyArbitrator {
        Complaint memory complain = complaints[customer];
        complain.judgement = judgement;
        complain.resolved = true;
        complaints[customer] = complain;
        uint256 amt = tasks[taskNames[complain.productName]].price;
        payable(customer).transfer(amt);
        uint256 commission = (amt * commission_rate) / 100;
        vendors[tasks[taskNames[complain.productName]].vendor].totalMoney -= amt - commission;
        commission_total -= commission;
        tasks[taskNames[complain.productName]].completed = false;
        vendors[tasks[taskNames[complain.productName]].vendor].flagged = false;
        emit BuyerRefunded(customer, complain.productName, complain.complaint);
    }

    
}
