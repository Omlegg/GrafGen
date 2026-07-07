"use client";
import { useState, useEffect, ChangeEvent } from "react";
import Image from "next/image"

interface User {
  email: string;
  username: string;
  profilePictureURL?: string;
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const loadUser = async (token: string) => {
    try {
      const response = await fetch("http://localhost:5166/api/identity/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error("Failed to fetch");
      
      const data = await response.json();
      setUser(data); 
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleAvatarUpload = async (e: ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file); 

  try {
    const token = localStorage.getItem("accessToken");
    const response = await fetch("http://localhost:5166/api/identity/upload-profile-picture", {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` },
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      setUser((prev) => prev ? { ...prev, avatarUrl: data.url } : null);
    } else {
      const error = await response.text();
      console.error("Upload error:", error);
    }
  } catch (err) {
    console.error("Upload failed", err);
  }
};

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) { setIsLoggedIn(false); setLoading(false); return; }
    setIsLoggedIn(true);
    loadUser(token);
  }, []);

  if (isLoggedIn === false) return <div className="p-8 text-center">Please Log In to view profile.</div>;
  if (loading) return <div className="p-8 text-center">Loading your profile...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-8 bg-white border border-gray-200 rounded-lg shadow-sm">

      <div className="grid grid-cols-2 gap-8">
        
        <div className="space-y-6">
          <div className="p-6 text-center bg-gray-100 rounded">
            <p className="text-4xl font-sans font-bold">{user?.username}</p>
          </div>
          
          <div className="text-center  rounded">
            <p className="text-4xs text-gray-700 ">{user?.email}</p>
          </div>

          <div className="p-4 text-center my-10 h-70 bg-gray-100 rounded">
            <h2 className="text-sm text-gray-400 uppercase">Bio</h2>
            <p className="text-gray-500 italic">Add bio later...</p>
          </div>
        </div>

        {/* RIGHT COLUMN: Avatar and Button */}
        <div className="flex flex-col space-y-4">
          <div className="w-full aspect-square bg-gray-100 border-2 border-gray-300 rounded-lg overflow-hidden flex items-center justify-center">
            {user?.profilePictureURL ? (
              <img 
                src={`http://localhost:5166${user.profilePictureURL}`} 
                alt="Profile" 
                className="w-full h-full object-cover" 
              />
            ) : (
              <span className="text-gray-400">No Image</span>
            )}
          </div>

          <label className="cursor-pointer text-center w-full p-4 bg-[#2e386d] text-white rounded hover:bg-[#b0dcde] hover:text-black font-bold transition-all duration-300">
            Change Avatar
            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
          </label>
        </div>

      </div>
    </div>
  );
}