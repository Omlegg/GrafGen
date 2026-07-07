"use client";
import { useState, useEffect } from "react";

interface User {
  email: string;
  username: string;
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null); // Track auth state

  const loadUser = async (token: string) => {
    try {
      const response = await fetch("http://localhost:5166/api/identity/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
      });
      
      if (!response.ok) throw new Error("Failed to fetch");
      
      const data: User = await response.json();
      setUser(data);
    } catch (error) {
      console.error("Error loading user:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("accessToken");
    
    if (!savedToken) {
      setIsLoggedIn(false);
      setLoading(false);
      return;
    }
    
    setIsLoggedIn(true);
    loadUser(savedToken); 
  }, []);
  
  if (isLoggedIn === false) return <p>Please Log In</p>;
  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <p>Username: {user?.username}</p>
      <p>Email: {user?.email}</p>
    </div>
  );
}