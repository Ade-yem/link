import Image from "next/image";
import magnifyingGlass from "../../public/magnifyingGlass.svg";

const Hero = () => {
  return (
    <div className="w-full p-4 md:w-1/2 mx-auto">
      <div className="w-full md:w-[500px] mx-auto mt-28 text-center text-4xl md:text-5xl leading-[123%]">
        Get Trusted Help for Home <span className="text-[#FFA17A]">Tasks</span>
      </div>
      <div className="w-full md:w-[500px] mx-auto mt-3 text-center">
        Connecting You with Verified Local Service Providers for All Your Home Needs
      </div>
      {/*search bar*/}
      <div className="relative w-[95%] mx-auto mt-10">
        <input
          type="text"
          placeholder="Search for.."
          className="bg-gray-100 text-[#2f2f2f] mx-auto w-full py-4 pl-14 pr-2 rounded-full"
        />
        <Image
          src={magnifyingGlass}
          height={24}
          width={24}
          alt="magnifying-glass"
          className="absolute top-[18px] left-[20px] tyext"
        />
      </div>
    </div>
  );
};

export default Hero;
