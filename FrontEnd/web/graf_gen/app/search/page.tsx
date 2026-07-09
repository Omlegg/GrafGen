"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Post from "../../components/Post";



export default function SearchPage() {
  // 1. Get the search params object using the hook
  const searchParams = useSearchParams();
  const query = searchParams.get("query"); // Use .get() to extract the value
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 2. Only fetch if query exists
    console.log(query)
    if (!query) return;
    
    setLoading(true);
    fetch(`http://localhost:5166/api/Post/search?query=${query}`)
      .then(res => res.json())
      .then(data => setResults(data))
      .catch((err) => console.error("Search failed", err))
      .finally(() => setLoading(false));
  }, [query]); // Re-run whenever the query in the URL changes

  return (
    <div className="flex flex-col items-center py-10 space-y-10">
      <h1 className="text-xl mb-6">Results for: "{query}"</h1>
      {loading ? (
        <p>Searching...</p>
      ) : results.length > 0 ? (
        results.map((post) => {
    // Rename post.image to imageUrl here
        const { image: imageURL, ...rest } = post;
        
        // Pass the renamed prop to your Post component
        return <Post key={post.id} post={{ ...rest, imageURL }} />;
      })
      ) : (
        <p>No results found.</p>
      )}
    </div>
  );
}