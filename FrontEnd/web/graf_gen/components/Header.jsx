import Image from "next/image";
import Link from "next/link"
export default function Header(){
    return(
        <div className="flex flex-row space-x-12 justify-center-safe bg-[#000099] w-200 mt-2 py-2 m-auto mix-blend-color-burn">
            <Link href="/dashboard">
                <Image src="home-icon-silhouette-svgrepo-com.svg" width={30} height={30} alt="Home Button " className="invert"></Image>
            </Link>
            <Link href="/search">
                <Image src="search-svgrepo-com.svg" width={30} height={30} alt="Search Button" className="invert"></Image>
            </Link>
            <Link href="/dashboard">
                <Image src="create_button.svg" width={30} height={30} alt="Create Button" className="invert"></Image>
            </Link>
            <Link href="/dashboard">
                <Image src="home-icon-silhouette-svgrepo-com.svg" width={30} height={30} alt="Home Button" className="invert"></Image>
            </Link>
        </div>
    )
}