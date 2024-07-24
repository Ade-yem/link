// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract ChatContract {
    struct Chat {
        string id;
        address sender;
        address receiver;
        string message;
        string imageURI;
        uint256 createdAt;
    }

    mapping (string => Chat[]) private roomMessages;
    mapping (bytes32 => string) private rooms;

    event ChatCreated(string id, address sender, address receiver, string message, string imageURI, uint256 createdAt, string room);

    /** 
     * @dev Creates a chat and emits a ChatCreated event
     * @param _id id of the message
     * @param sender sender address
     * @param receiver receiver address
     * @param message message sent
     * @param imageURI image sent
     */
    function createChat(string memory _id, address sender, address receiver, string memory message, string memory imageURI, string memory room) public {
        Chat memory chat = Chat(_id, sender, receiver, message, imageURI, block.timestamp);
        roomMessages[room].push(chat);
        emit ChatCreated(_id, sender, receiver, message, imageURI, block.timestamp, room);
    }

    /**
     * @dev retrieve all chats from the chat list
     */
    function getRoomMessages(string memory room) public view returns (Chat[] memory) {
        return roomMessages[room];
    }

    /**
     * @dev generate a room id
     * @param addr1 first address
     * @param addr2 second address
     */
    function generateKey(address addr1, address addr2) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(addr1, addr2));
    }

    /**
     * @dev create a room
     * @param addr1 first address
     * @param addr2 second address
     * @param room room
     */
    function createRoom(address addr1, address addr2, string memory room) public {
        bytes32 _id = generateKey(addr1, addr2);
        rooms[_id] = room;
    }

    /**
     * @dev get room
     * @param _id room id
     */
    function getRoom(bytes32 _id) public view returns (string memory) {
        return rooms[_id];
    }

    /**
     * @dev get a room
     * @param addr1 first address
     * @param addr2 second address
     */
    function getRoomIDByAddress(address addr1, address addr2) public view returns (string memory) {
        bytes32 key = generateKey(addr1, addr2);
        return rooms[key];
    }    
}