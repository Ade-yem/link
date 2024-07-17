import { useRouter } from "next/router";

export default function BackButton() {
  const router = useRouter();
  return (
    <div className="absolute top-6 left-20" onClick={() => router.back()}>
      <svg width="35px" height="35px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
        <g id="SVGRepo_iconCarrier">
          {" "}
          <path
            d="M15 6L9 12L15 18M15 12H15.01"
            stroke="#000000"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></path>{" "}
        </g>
      </svg>
    </div>
  );
}
