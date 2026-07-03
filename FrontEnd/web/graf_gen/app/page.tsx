"use client"; // Required because we are using hooks
import { useState, useEffect, useRef } from "react";
import Post from "../components/Post.jsx";

export default function Home() {
  const [posts, setPosts] = useState(Array.from({ length: 10 }));
  const [isLoading, setIsLoading] = useState(false);
  const observerTarget = useRef(null);

  // This function imitates an API call
  const loadMorePosts = () => {
    setIsLoading(true);
    // Simulate network delay of 1.5 seconds
    setTimeout(() => {
      setPosts((prev) => [...prev, ...Array.from({ length: 10 })]);
      setIsLoading(false);
    }, 1500);
  };

  // Intersection Observer to trigger when we hit the bottom
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          loadMorePosts();
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [isLoading]);

  return (
    <div className="flex flex-row w-full justify-center">
      <div className="flex flex-col py-20 gap-6 w-full max-w-lg">
        {posts.map((_, index) => (
          <Post key={index} />
        ))}
        
        {/* This div acts as the "trigger" at the bottom of your list */}
        <div ref={observerTarget} className="h-10 flex items-center justify-center">
          {isLoading && <p>Loading more posts...</p>}
        </div>
      </div>
    </div>
  );
}