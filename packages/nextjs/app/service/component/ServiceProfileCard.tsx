import React from "react";
import Image from "next/image";
import Button from "~~/components/Button";

interface ServiceProfileCardProps {
  image: string;
  rating: string;
  name: string;
  service: string;
  profile: string;
  profileLink?: string;
  message: string;
}

const ServiceProfileCard = ({
  image,
  rating,
  name,
  service,
  profile,
  profileLink,
  message,
}: ServiceProfileCardProps) => {
  return (
    <div className="py-4 px-2 flex flex-col items-center space-y-4 rounded-md shadow-md hover:shadow-lg hover:shadow-gray-400 border border-gray-500">
      <Image
        src={image}
        width={70}
        height={70}
        alt={`${image} svg`}
        className="rounded-full border border-black w-[70px] h-[70px]"
      />
      <div className="flex flex-col items-center">
        <p className="capitalize text-[1.1rem] font-semibold">{name}</p>
        <span className="text-sm">{service}</span>
      </div>
      <Image src={rating} width={70} height={70} alt="rating" className="h-[20px]" />
      <div className="w-[75%] flex items-center justify-center space-x-1">
        <Button type="customizedBlack" text={profile} to={profileLink ?? "#"} />
        <Button type="customizedWhite" text={message} to={profileLink ?? "#"} />
      </div>
    </div>
  );
};

export default ServiceProfileCard;
