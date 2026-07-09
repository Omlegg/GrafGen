import Image from "next/image";

interface PostDto {
  title: string;
  content: string;
  createdAt: string;
  contentURL: string;
  imageURL: string;
}

interface PostProps {
  post: PostDto;
}

export default function Post({ post }: PostProps) {
  const imageUrl = `http://localhost:5166/content/posts/${post.imageURL}`;


  return (
        <div className="w-150 bg-[#C8D9E6] h-175 rounded-2xl shadow-lg shadow-[#0d0e0f54] ">
              <div className="mx-10 my-10">
              <Image src={imageUrl} width={600} height={600} alt="GrafGen Logo" className="object-fit" unoptimized/>
              <h1 className="text-2xl font-bold mt-4 text-gray-700">{post.title}</h1>
              <h4 className="text-1xl font-bold mt-4 text-gray-700">{post.contentURL}</h4>
              <p className="text-gray-500 mt-2">{new Date(post.createdAt).toLocaleString()}</p>
              </div>
            </div>
  )
};