import { FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import magnifyingGlass from "../../public/magnifyingGlass.svg";

const Hero = () => {
  const router = useRouter();
  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    // Navigate to the dynamic route with the search term
    const search = formData.get("search") as string;
    router.push(`/search?query=${search}`);
  };
  return (
    <div className="w-full p-4 md:w-1/2 mx-auto">
      <div className="w-full md:w-[500px] mx-auto mt-28 text-center text-4xl md:text-5xl leading-[123%]">
        Get Trusted Help for Home <span className="text-[#FFA17A]">Tasks</span>
      </div>
      <div className="w-full md:w-[500px] mx-auto mt-3 text-center">
        Connecting You with Verified Local Service Providers for All Your Home Needs
      </div>
      {/*search bar*/}
      <form onSubmit={handleSearch} className="relative w-[95%] mx-auto mt-10">
        <input
          type="text"
          name="search"
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
        <button className="hidden" type="submit">
          Submit
        </button>
      </form>
    </div>
  );
};

export default Hero;
