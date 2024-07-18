import { ethers } from "ethers";
import { Profile } from "~~/types/utils";

const ipfsJWT = process.env.NEXT_PUBLIC_JWT;
export const addFileToIpfs = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const pinataMetadata = JSON.stringify({
      name: file.name,
    });
    formData.append("pinataMetadata", pinataMetadata);
    const pinataOptions = JSON.stringify({
      cidVersion: 0,
    });
    formData.append("pinataOptions", pinataOptions);
    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ipfsJWT}`,
      },
      body: formData,
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

const DataType = ethers.ParamType.from({
  components: [
    { name: "name", type: "string" },
    { name: "email", type: "string" },
    { name: "phoneNumber", type: "string" },
    { name: "address", type: "string" },
    { name: "role", type: "string" },
    { name: "picture", type: "string" },
    { name: "service", type: "string" },
    { name: "file1", type: "string" },
    { name: "file2", type: "string" },
    { name: "walletAddress", type: "string" },
  ],
  name: "Profile",
  type: "tuple",
});

export async function getDetailsFromHash(hash: string) {
  try {
    console.log(hash);
    const decodeData = new ethers.AbiCoder();
    const decoded = decodeData.decode([DataType], hash);
    console.log(decoded);
    const data: Profile = {
      name: decoded[0],
      email: decoded[1],
      phoneNumber: decoded[2],
      address: decoded[3],
      role: decoded[4],
      picture: decoded[5],
      service: decoded[6],
      file1: decoded[7],
      file2: decoded[8],
      file3: decoded[9],
      walletAddress: decoded[10],
    };
    return data;
  } catch (error) {
    console.error(error);
  }
}

export async function hashDetails(formData: Profile) {
  try {
    // Use ethers.utils.AbiCoder to encode the data
    const encodeData = new ethers.AbiCoder();
    const encoded = encodeData.encode([DataType], [formData]);
    return encoded;
  } catch (error) {
    console.log(error);
  }
}
