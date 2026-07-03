import Image from "next/image";
import Link from "next/link";
import { Form } from "next/form";

export default function Header() {
  return (
    <div className="z-10 sticky top-0 flex flex-row items-center bg-[#c8d9e68b] w-full max-w-250 mt-2 py-3 px-8 m-auto  rounded-2xl shadow-lg shadow-[#0d0e0f54]">
      <div className="mr-auto flex flex-row space-x-12 w-100 align-middle" >

      <Link href="/dashboard" >
        <Image 
          src="home-icon-silhouette-svgrepo-com.svg" 
          width={30} 
          height={30} 
          alt="Home Button" 
          className="grayscale mix-blend-overlay my-6"
        />
      </Link>

       <form action="/search" className="flex flex-row items-center bg-[#ffffff] w-[90%] max-w-2xl mt-2 my-3 py-3 px-6 m-auto rounded-2xl shadow-lg shadow-[#0d0e0f54] hover:shadow-[#0d0e0f54] hover:shadow-2xl transition-shadow duration-300 ease-in-out">
                <input name="query" type="text" placeholder="Search..."  className="w-55 mx-2" />
                <button type="submit">
                <Image src="/search-svgrepo-com.svg" width={30} height={30} alt="Search"/>
                </button>
        </form>
    </div>
      <div className="flex flex-row space-x-12">
        
        <Link href="/dashboard">
          <Image src="file.svg" width={30} height={30} alt="Create Button" className="" />
        </Link>
        <Link href="/dashboard">
          <Image src="globe.svg" width={30} height={30} alt="Home Button" className="invert" />
        </Link>
      </div>
    </div>
  );
}