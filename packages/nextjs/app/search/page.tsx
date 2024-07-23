"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import VendorCard from "~~/components/VendorCard";
import { useScaffoldContract, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { Details } from "~~/types/utils";

const SearchPage = () => {
  const search = useSearchParams();
  const router = useRouter();
  const query = search.get("query")?.toLocaleLowerCase() || "";
  const [result, setResult] = useState<Details[]>([]);
  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    // Navigate to the dynamic route with the search term
    const search = formData.get("search") as string;
    router.push(`/search?query=${search}`);
    router.refresh();
  };
  const { data } = useScaffoldReadContract({
    contractName: "LinkContract",
    functionName: "getAllVendors",
  });
  const { data: Contract } = useScaffoldContract({
    contractName: "LinkContract",
  });

  useEffect(() => {
    const parseResult = async () => {
      const res: Details[] = [];
      data?.forEach(async (vendor: any) => {
        try {
          const vendorData: any = await Contract?.read.vendors([vendor]);
          const vendorProfile: any = await Contract?.read.profiles([vendor]);
          if (vendorData && vendorProfile && (vendorData[0] === query || query === "")) {
            const details: Details = {
              name: vendorProfile[0],
              picture: vendorProfile[5],
              service: vendorData[0],
              walletAddress: vendor as string,
            };
            res.push(details);
          }
        } catch (error) {
          console.log(error);
        }
      });
      setResult(res);
    };
    parseResult();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, query]);

  return (
    <div>
      <form onSubmit={handleSearch} className="flex justify-center space-x-2 mt-4">
        <label className="input input-bordered flex items-center gap-2">
          <input type="text" className="grow" placeholder="Search" name="search" />
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
      <p className="p-3 mt-3 mb-2 text-center flex justify-center">
        Search Results for{" "}
        <span className="font-bold">
          {'"'}
          {query}
          {'"'}
        </span>
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
