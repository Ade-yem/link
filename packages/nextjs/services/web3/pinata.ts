import { json } from "@helia/json";
import { createHelia } from "helia";
import { CID } from "multiformats/cid";

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

const helia = await createHelia();
const J = json(helia);
export async function getDetailsFromIPFS(hash: string) {
  try {
    const cid = CID.parse(hash);
    const res = await J.get(cid);
    return res;
  } catch (error) {
    console.error(error);
  }
}

export async function pinJSONToIPFS(formData: any) {
  try {
    const res = J.add(formData);
    console.log(res);
    return res;
  } catch (error) {
    console.log(error);
  }
}
