"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Post from "../components/Post";

interface PostDto {
  id: number;
  title: string;
  content: string;
  createdAt: string;
}

export default function Home() {
  const [posts, setPosts] = useState<PostDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const observerTarget = useRef<HTMLDivElement | null>(null);

  const loadMorePosts = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5166/api/posts");

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const data = (await response.json()) as PostDto[];

      setPosts((prev) => [...prev, ...data]);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  // Initial load
  useEffect(() => {
    loadMorePosts();
  }, []);

  // Infinite scroll
  useEffect(() => {
    const target = observerTarget.current;

    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMorePosts();
        }
      },
      {
        threshold: 1,
      }
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [loadMorePosts]);

  return (
    <div className="flex justify-center w-full">
      <div className="flex flex-col w-full max-w-lg gap-6 py-20">
        {posts.map((post) => (
          <Post key={post.id} post={post} />
        ))}

        <div
          ref={observerTarget}
          className="flex items-center justify-center h-10"
        >
          {isLoading && <p>Loading more posts...</p>}
        </div>
      </div>
    </div>
  );
}