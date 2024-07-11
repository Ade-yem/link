import Image from "next/image";
import { Details } from "~~/types/utils";

export default function VendorCard({ details }: { details: Details }) {
  return (
    <div className="p-4 flex flex-col items-center space-y-3 shadow-md">
      <div className="flex items-center">
        <Image src={details.picture} alt="Vendor" className="w-16 h-16 rounded-full" />
        <h3 className="text-lg font-semibold">{details.name}</h3>
      </div>
      <div>
        <p className="text-sm text-gray-500">{details.service}</p>
      </div>
      <div className="flex justify-center space-x-4 m-2 p-2">
        <button className="btn btn-md bg-success dark:bg-secondary">
          <a href={`/profile/view/${details.walletAddress}`}>View Profile</a>
        </button>
        <button className="btn btn-md dark:bg-success bg-secondary">
          <a href={`/chat/${details.walletAddress}`}>Message</a>
        </button>
      </div>
    </div>
  );
}
