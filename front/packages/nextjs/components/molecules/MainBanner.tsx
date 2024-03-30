import Image from "next/image";
import { introBanner2 } from "../../images/Banner";

const MainBanner: React.FC = () => {
  return (
    <div className="flex items-center justify-center bg-center bg-cover ">
      <div className=" relative  w-full h-full">
        <Image src={introBanner2} alt="" />
      </div>

      {/* <div className="absolute h-[400px]inset-0 bg-black opacity-60 mobile:h-[300px]"></div> */}
      {/* <div className="absolute z-10 text-white text-center">
        <p className="text-4xl">Test</p>
        <p className="italic p-[20px] mt-[50px]">"Banner test"</p>
      </div> */}
    </div>
  );
};

export default MainBanner;
