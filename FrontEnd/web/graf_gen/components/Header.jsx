"use client";

import Image from "next/image";
import Link from "next/link";
import { Form } from "next/form";
import { usePathname } from 'next/navigation'

import { useState, useEffect } from "react";

export function useUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setLoading(false);
      return;
    }

    fetch("http://localhost:5166/api/identity/me", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.ok ? res.json() : null)
    .then(data => {
      setUser(data);
    })
    .catch(() => setUser(null))
    .finally(() => setLoading(false));
  }, []);

  return { user, loading };
}
export default function Header() {
  const { user, loading } = useUser();
  
  const pathname = usePathname();
  return (
    <div className="z-10 sticky top-0 flex flex-row items-center bg-[#c8d9e68b] w-full max-w-250 mt-2 py-3 px-8 m-auto  rounded-2xl shadow-lg shadow-[#0d0e0f54]">
      <div className="mr-auto flex flex-row space-x-12 w-100 align-middle" >

      <Link href="/" >
        <Image 
          src={pathname != "/"? "home-svgrepo-com.svg": "home-svgrepo-com(1).svg"} 
          width={30} 
          height={30} 
          alt="Home Button" 
          className="grayscale mix-blend-overlay my-6"
        />
      </Link>

       <form action="/search" className="flex flex-row items-center bg-[#ffffff] w-[90%] max-w-2xl mt-2 my-3 py-3 px-6 m-auto rounded-2xl shadow-lg shadow-[#0d0e0f54] hover:shadow-[#0d0e0f54] hover:shadow-2xl transition-shadow duration-300 ease-in-out">
                <input name="query" type="text" placeholder="Search..."  className="w-55 mx-2" />
                <button type="submit">
                <Image src="/search-svgrepo-com.svg" width={30} height={30} alt="Search"/>
                </button>
        </form>
    </div>
      <div className="flex flex-row space-x-12">
        {(user)? (
        <Link href="/post">
          <Image src="plus-square-svgrepo-com.svg" width={30} height={30} alt="Create Button" className="grayscale mix-blend-overlay " />
        </Link>)
        :null }
        {(user)? (
        <Link href="/">
          <Image src="alert-svgrepo-com.svg" width={30} height={30} alt="Notification" className="grayscale mix-blend-overlay " />
        </Link>)
        :null }
        <div className="flex flex-row space-x-12 ml-auto">
        {loading ? (
          <div className="w-8 h-8 rounded-full animate-pulse bg-gray-300" />
        ) : user ? (
          // LOGGED IN: Show PFP or Default
          <Link href="/profile">
            <Image 
              src={user.profilePicture || "/default_pfp.jpg"} 
              width={30} 
              height={30} 
              alt="Profile" 
              className="rounded-full border border-gray-400" 
            />
          </Link>
        ) : (
          <Link href="/auth" className="px-4 py-2 bg-[#2e386d] text-white rounded-lg text-sm">
            Sign In
          </Link>
        )}
      </div>
      </div>
    </div>
  );
}