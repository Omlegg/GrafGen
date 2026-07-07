"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from 'next/navigation';
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
    .then(data => setUser(data))
    .catch(() => setUser(null))
    .finally(() => setLoading(false));
  }, []);

  return { user, loading };
}

export default function Header() {
  const { user, loading } = useUser();
  const pathname = usePathname();

  // Helper to build the image URL correctly
  const getAvatarUrl = (fileName) => {
    return `http://localhost:5166/api/identity/profile-picture/${fileName}`;
  };

  return (
    <div className="z-10 sticky top-0 flex flex-row items-center bg-[#c8d9e68b] w-full max-w-5xl mt-2 py-3 px-8 m-auto rounded-2xl shadow-lg shadow-[#0d0e0f54]">
      <div className="mr-auto flex flex-row items-center space-x-8">
        <Link href="/">
          <Image 
            src={pathname !== "/" ? "/home-svgrepo-com.svg" : "/home-svgrepo-com(1).svg"} 
            width={30} height={30} alt="Home" className="grayscale mix-blend-overlay"
          />
        </Link>

        {/* Standard form element */}
        <form action="/search" className="flex flex-row items-center bg-white w-full max-w-xs py-2 px-4 rounded-xl shadow-md">
            <input name="query" type="text" placeholder="Search..." className="w-full outline-none px-2" />
            <button type="submit">
              <Image src="/search-svgrepo-com.svg" width={24} height={24} alt="Search"/>
            </button>
        </form>
      </div>

      <div className="flex flex-row items-center space-x-8 ml-auto">
        {user && (
          <>
            <Link href="/create"><Image src="/plus-square-svgrepo-com.svg" width={30} height={30} alt="Create" className="grayscale mix-blend-overlay" /></Link>
            <Link href="/notifications"><Image src="/alert-svgrepo-com.svg" width={30} height={30} alt="Notifications" className="grayscale mix-blend-overlay" /></Link>
          </>
        )}
        
        <div className="flex items-center">
          {loading ? (
            <div className="w-8 h-8 rounded-full animate-pulse bg-gray-300" />
          ) : user ? (
            <Link href="/profile">
              <Image 
                src={user.profilePicture ? getAvatarUrl(user.profilePicture) : "/default_pfp.jpg"} 
                width={30} height={30} alt="Profile" 
                className="rounded-full border border-gray-400 object-cover w-8 h-8" 
              />
            </Link>
          ) : (
            <Link href="/auth" className="px-4 py-2 bg-[#2e386d] text-white rounded-lg text-sm font-medium">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}