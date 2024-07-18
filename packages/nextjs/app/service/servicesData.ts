import svg4 from "/public/5.svg";
import svg5 from "/public/5_1.svg";
import svg1 from "/public/Rating=1.svg";
import houseSVG from "/public/house.svg";
import man from "/public/man.svg";
import woman from "/public/woman.svg";

interface ServiceProfile {
  image: string;
  name: string;
  service: string;
  stars: string;
  profile: string;
  profileLink?: string;
  message: string;
}

interface Service {
  name: string;
  icon: string;
  to: string;
}

const servicesProfiles: ServiceProfile[] = [
  {
    image: man,
    name: "esther howard",
    service: "cleaner",
    stars: svg5,
    profile: "view profile",
    profileLink: "profile",
    message: "message",
  },
  {
    image: man,
    name: "Jacob Jones",
    service: "painter",
    stars: svg1,
    profile: "view profile",
    message: "message",
  },
  {
    image: man,
    name: "guy hawkings",
    service: "generator repair",
    stars: svg5,
    profile: "view profile",
    message: "message",
  },
  {
    image: man,
    name: "jerome bell",
    service: "plumber",
    stars: svg5,
    profile: "view profile",
    message: "message",
  },
  {
    image: man,
    name: "Tobi Onoh",
    service: "Electrician",
    stars: svg4,
    profile: "view profile",
    message: "message",
  },
  {
    image: man,
    name: "tochukwu mmadu",
    service: "pest control",
    stars: svg5,
    profile: "view profile",
    message: "message",
  },
  {
    image: man,
    name: "ibrahim dauda",
    service: "solar installator",
    stars: svg5,
    profile: "view profile",
    message: "message",
  },
  {
    image: woman,
    name: "esther akali",
    service: "home security system",
    stars: svg5,
    profile: "view profile",
    message: "message",
  },
];

const listOfServices: Service[] = [
  {
    name: "Cleaning",
    icon: houseSVG,
    to: "#",
  },
  {
    name: "Plumbing",
    icon: houseSVG,
    to: "#",
  },
  {
    name: "electrical",
    icon: houseSVG,
    to: "#",
  },
  {
    name: "appearance repair",
    icon: houseSVG,
    to: "#",
  },
  {
    name: "handyman",
    icon: houseSVG,
    to: "#",
  },
  {
    name: "tree trimming",
    icon: houseSVG,
    to: "#",
  },
  {
    name: "painting",
    icon: houseSVG,
    to: "#",
  },
  {
    name: "roofing",
    icon: houseSVG,
    to: "#",
  },
  {
    name: "local moving",
    icon: houseSVG,
    to: "#",
  },
];

const servicesData = { servicesProfiles, listOfServices };

export default servicesData;
