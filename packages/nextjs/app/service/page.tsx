import Image from "next/image";
import Link from "next/link";
import ServiceProfileCard from "./component/ServiceProfileCard";
import servicesData from "./servicesData";

const Services = () => {
  return (
    <div className="px-8">
      {/* List of services */}
      <div className="my-10 grid gap-2 grid-cols-[repeat(auto-fit,minmax(110px,150px))]">
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
      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] place-center gap-8">
        {servicesData.servicesProfiles.map(servicesProfile => (
          <ServiceProfileCard
            key={servicesProfile.name}
            image={servicesProfile.image}
            rating={servicesProfile.stars}
            name={servicesProfile.name}
            service={servicesProfile.service}
            profile={servicesProfile.profile}
            message={servicesProfile.message}
            profileLink={servicesProfile.profileLink}
          />
        ))}
      </div>
    </div>
  );
};

export default Services;
