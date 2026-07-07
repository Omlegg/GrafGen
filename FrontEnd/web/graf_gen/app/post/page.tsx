"use client";

import { useState, ChangeEvent } from "react";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("title", title);
      formData.append("content", content);

      if (image) {
        formData.append("image", image);
      }

      const response = await fetch(
        "http://localhost:5166/api/post",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.status.toString().startsWith("2")) {
        throw new Error(await response.text());
      }

      setTitle("");
      setContent("");
      setImage(null);
      setPreview(null);

      alert("Post created successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to create post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 p-8 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="grid grid-cols-2 gap-8">
        {/* LEFT SIDE */}
        <div className="space-y-6">
          <div className="p-6 bg-gray-100 rounded">
            <h1 className="text-3xl font-bold">Create Post</h1>
            <p className="text-gray-500 mt-2">
              Share your thoughts with the community.
            </p>
          </div>

          <div className="bg-gray-100 rounded p-5">
            <label className="block text-sm uppercase text-gray-500 mb-2">
              Title
            </label>

            <input
              className="w-full rounded border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-[#2e386d]"
              placeholder="Enter a title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="bg-gray-100 rounded p-5">
            <label className="block text-sm uppercase text-gray-500 mb-2">
              Content
            </label>

            <textarea
              rows={10}
              className="w-full resize-none rounded border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-[#2e386d]"
              placeholder="Write your post..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full p-4 bg-[#2e386d] text-white rounded font-bold hover:bg-[#b0dcde] hover:text-black transition-all duration-300 disabled:opacity-50"
          >
            {loading ? "Publishing..." : "Publish Post"}
          </button>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-col space-y-4">
          <div className="w-full aspect-square bg-gray-100 border-2 border-gray-300 rounded-lg overflow-hidden flex items-center justify-center">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-400">Image Preview</span>
            )}
          </div>

          <label className="cursor-pointer text-center w-full p-4 bg-[#2e386d] text-white rounded hover:bg-[#b0dcde] hover:text-black font-bold transition-all duration-300">
            Upload Image
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>

          <div className="bg-gray-100 rounded p-5">
            <h2 className="text-sm uppercase text-gray-500 mb-3">
              Post Tips
            </h2>

            <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
              <li>Use a descriptive title.</li>
              <li>Add an eye-catching image.</li>
              <li>Keep paragraphs short.</li>
              <li>Be respectful to others.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}