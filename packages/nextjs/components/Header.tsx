"use client";

import React, { useCallback, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import { Bars3Icon, WrenchIcon } from "@heroicons/react/24/outline";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useOutsideClick, useScaffoldReadContract } from "~~/hooks/scaffold-eth";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "Home",
    href: "/",
  },
  // {
  //   label: "Debug Contracts",
  //   href: "/debug",
  //   icon: <BugAntIcon className="h-4 w-4" />,
  // },
  {
    label: "Services",
    href: "/service",
    icon: <WrenchIcon className="h-4 w-4" />,
  },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();
  const filteredMenuLinks = menuLinks.filter(({ label }) => {
    if (process.env.NEXT_PUBLIC_NODE_ENV !== "dev" && label === "Debug Contract") {
      return false;
    }
    return true;
  });
  return (
    <>
      {filteredMenuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              passHref
              className={`${
                isActive ? "bg-secondary shadow-md" : ""
              } hover:bg-secondary hover:shadow-md focus:!bg-secondary active:!text-neutral py-1.5 px-3 text-sm rounded-full gap-2 grid grid-flow-col`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};

/**
 * Site header
 */
export const Header = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const burgerMenuRef = useRef<HTMLDivElement>(null);
  useOutsideClick(
    burgerMenuRef,
    useCallback(() => setIsDrawerOpen(false), []),
  );
  const { address } = useAccount();
  const { data: isCustomer } = useScaffoldReadContract({
    contractName: "LinkContract",
    functionName: "customer_C",
    args: [address],
  });
  const { data: isVendor } = useScaffoldReadContract({
    contractName: "LinkContract",
    functionName: "vendor_C",
    args: [address],
  });

  return (
    <div className="sticky lg:static top-0 navbar bg-base-100 min-h-0 flex-shrink-0 justify-between z-20 shadow-md shadow-secondary px-0 sm:px-2">
      <div className="navbar-start w-auto lg:w-1/2">
        <div className="lg:hidden dropdown" ref={burgerMenuRef}>
          <label
            tabIndex={0}
            className={`ml-1 btn btn-ghost ${isDrawerOpen ? "hover:bg-secondary" : "hover:bg-transparent"}`}
            onClick={() => {
              setIsDrawerOpen(prevIsOpenState => !prevIsOpenState);
            }}
          >
            <Bars3Icon className="h-1/2" />
          </label>
          {isDrawerOpen && (
            <ul
              tabIndex={0}
              className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
              onClick={() => {
                setIsDrawerOpen(false);
              }}
            >
              <HeaderMenuLinks />
            </ul>
          )}
        </div>
        <Link href="/" passHref className="hidden lg:flex items-center gap-2 ml-4 mr-6 shrink-0">
          <div className="flex relative w-10 h-10">
            <Image alt="Link logo" className="cursor-pointer" fill src="/favicon.ico" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold font-mono text-xl">Link</span>
          </div>
        </Link>
        <ul className="hidden lg:flex lg:flex-nowrap menu menu-horizontal px-1 gap-2">
          <HeaderMenuLinks />
        </ul>
      </div>
      <div className="navbar-end flex-grow mr-4">
        {isVendor || isCustomer ? (
          <Link
            href={"/profile"}
            className="bg-info font-semibold mr-4 dark:bg-secondary shadow-md hover:bg-secondary hover:shadow-md focus:!bg-secondary active:!text-neutral py-1.5 px-8 text-sm rounded-full gap-2 grid grid-flow-col"
          >
            Profile
          </Link>
        ) : (
          <Link
            href={"/register"}
            className="bg-info font-semibold mr-4 dark:bg-secondary shadow-md hover:bg-secondary hover:shadow-md focus:!bg-secondary active:!text-neutral py-1.5 px-8 text-sm rounded-full gap-2 grid grid-flow-col"
          >
            Join
          </Link>
        )}
        <RainbowKitCustomConnectButton />
        <FaucetButton />
      </div>
    </div>
  );
};
