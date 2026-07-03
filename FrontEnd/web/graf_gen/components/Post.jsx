import Image from "next/image";

export default function Post() {
  return (
        <div className="w-150 bg-[#C8D9E6] h-175 rounded-2xl shadow-lg shadow-[#0d0e0f54] ">
              <div className="mx-10 my-10">
              <Image src="/images.jpg" width={600} height={600} alt="GrafGen Logo" className="object-fit"/>
              <h1 className="text-2xl font-bold mt-4 text-gray-700">Welcome to GrafGen</h1>
                <h4 className="text-1xl font-bold mt-4 text-gray-700">Welcome to GrafGen</h4>
              </div>
            </div>
  )
};