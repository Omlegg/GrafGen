"use client";
import { useState, useEffect } from "react";

interface User {
  email: string;
  username: string;
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    try {
      const response = await fetch("http://localhost:5166/api/identity/me");
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
    loadUser();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <p>Username: {user?.username}</p>
      <p>Email: {user?.email}</p>
    </div>
  );
}