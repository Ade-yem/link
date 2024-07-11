import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import VendorCard from "~~/components/VendorCard";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { getDetailsFromIPFS } from "~~/services/web3/pinata";
import { Details, Vendor } from "~~/types/utils";

const SearchPage = () => {
  const search = useSearchParams();
  const router = useRouter();
  const query = search.get("query")?.toLocaleLowerCase() || "";
  const [result, setResult] = useState<Details[]>([]);
  const handleSearch = (e: any) => {
    e.preventDefault();
    // Navigate to the dynamic route with the search term
    router.push(`/search?query=${e.target.value}`);
  };
  const { data } = useScaffoldReadContract({
    contractName: "LinkContract",
    functionName: "getAllVendors",
  });

  useEffect(() => {
    const parseResult = async () => {
      const res = data as unknown as Vendor[];
      res.forEach(async vendor => {
        try {
          const details = await getDetailsFromIPFS(vendor.ipfsDetails);
          if (details.service === query) {
            const det: Details = {
              name: "",
              picture: "",
              service: "",
              walletAddress: vendor.account,
            };
            det.name = details.name;
            det.picture = details.picture;
            det.service = details.service;
            setResult(prev => [...prev, det]);
          }
        } catch (error) {
          console.log(error);
        }
      });
    };
    parseResult();
  }, [data, query]);

  return (
    <div>
      <form onSubmit={handleSearch} className="flex justify-center space-x-2">
        <label className="input input-bordered flex items-center gap-2">
          <input type="text" className="grow" placeholder="Search" />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="h-4 w-4 opacity-70"
          >
            <path
              fillRule="evenodd"
              d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
              clipRule="evenodd"
            />
          </svg>
        </label>
        <button type="submit" className="btn btn-ghost btn-md">
          Search
        </button>
      </form>
      <p className="p-3 mt-3 mb-2">
        Search Results for{" "}
        <h1>
          {'"'}
          {query}
          {'"'}
        </h1>
      </p>
      <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-3">
        {result.length > 0 &&
          result.map((vendor: Details, index: number) => <VendorCard key={index} details={vendor} />)}
      </div>
      <div className="flex justify-center h-fit items-center text-lg ">{result.length === 0 && "No results found"}</div>
    </div>
  );
};

export default SearchPage;
