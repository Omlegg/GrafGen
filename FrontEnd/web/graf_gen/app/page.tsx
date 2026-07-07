"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Post from "../components/Post";

interface PostDto {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  contentURL:string;
}
export default function Home() {
  const [posts, setPosts] = useState<PostDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false); // Added error state

  const isFetchingRef = useRef(false);
  const observerTarget = useRef<HTMLDivElement | null>(null);

  const loadMorePosts = useCallback(async () => {
    if (isFetchingRef.current) return;

    isFetchingRef.current = true;
    setIsLoading(true);
    setHasError(false);

    try {
      const response = await fetch("http://localhost:5166/api/Post");

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const data = (await response.json()) as PostDto[];
      
      // Update state only if we got data
      if (Array.isArray(data)) {
        setPosts((prev) => [...prev, ...data]);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      setHasError(true);
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log("Component mounted, forcing fetch...");
    loadMorePosts();
  }, []);
  return (
    <div className="flex justify-center w-full">
      <div className="flex flex-col w-full max-w-lg gap-6 py-20">
        
        {/* Render posts if they exist */}
        {posts && posts.length > 0 ? (
          posts.map((post, index) => (
            <Post key={`${post.id}-${index}`} post={post} />
          ))
        ) : (
          // Handle the empty state or loading state
          !isLoading && (
            <div className="text-center p-10 text-gray-500">
              {hasError ? "Could not load posts." : "No posts found."}
            </div>
          )
        )}

        <div ref={observerTarget} className="flex items-center justify-center h-10">
          {isLoading && <p>Loading more posts...</p>}
        </div>
      </div>
    </div>
  );
}