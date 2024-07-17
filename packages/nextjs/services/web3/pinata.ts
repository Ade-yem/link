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

export async function getDetailsFromIPFS(hash: string) {
  try {
    const res = fetch(`${hash}`);
    return (await res).json();
  } catch (error) {
    console.error(error);
  }
}
