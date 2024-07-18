"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ServiceProfileCard from "./component/ServiceProfileCard";
import servicesData from "./servicesData";
import { useScaffoldContract, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { Details } from "~~/types/utils";

const Services = () => {
  const [result, setResult] = useState<Details[]>([]);
  const { data } = useScaffoldReadContract({
    contractName: "LinkContract",
    functionName: "getAllVendors",
  });
  const { data: Contract } = useScaffoldContract({
    contractName: "LinkContract",
  });

  useEffect(() => {
    const parseResult = async () => {
      data?.forEach(async vendor => {
        try {
          const vendorData = await Contract?.read.vendors([vendor]);
          const vendorProfile = await Contract?.read.profiles([vendor]);
          if (vendorData && vendorProfile) {
            const details: Details = {
              name: vendorProfile[0],
              picture: vendorProfile[5],
              service: vendorData[0],
              walletAddress: vendor as string,
            };
            setResult(prev => [...prev, details]);
          }
        } catch (error) {
          console.log(error);
        }
      });
    };
    parseResult();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);
  return (
    <div className="px-8">
      {/* List of services */}
      <div className="my-10 space-x-2 flex justify-center flex-wrap">
        {servicesData.listOfServices.map(listOfService => (
          <Link
            key={listOfService.to}
            href={listOfService.to}
            className="flex items-center px-4 py-2 w-fit shadow-sm shadow-gray-400 justify-center hover:scale-105"
          >
            <Image src={listOfService.icon} width={10} height={10} alt={listOfService.name} />
            <span className="capitalize text-[0.6rem] ml-1">{listOfService.name}</span>
          </Link>
        ))}
      </div>

      {/* List of services */}

      <div className="grid grid-cols-1 xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2  place-center gap-8">
        {result.map(servicesProfile => (
          <ServiceProfileCard
            key={servicesProfile.name}
            picture={servicesProfile.picture}
            // rating={servicesProfile.stars}
            name={servicesProfile.name}
            service={servicesProfile.service}
            profileLink={servicesProfile.walletAddress}
          />
        ))}
      </div>
    </div>
  );
};

export default Services;
