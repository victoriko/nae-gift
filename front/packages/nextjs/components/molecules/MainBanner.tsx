import Image from "next/image";
import { coupleBanner2 } from "../../images/Banner/index";

const MainBanner: React.FC = () => {
  return (
    <div className="flex items-center justify-center bg-center bg-cover ">
      <Image alt="SE2 logo" className="cursor-pointer" fill src="coupleBanner2.png" />
      <div className="absolute h-screen inset-0 bg-black opacity-60 mobile:h-[300px]"></div>
      <div className="absolute z-10 text-white text-center">
        <p className="text-4xl">Test</p>
        <p className="italic p-[20px] mt-[50px]">"Banner test"</p>
      </div>
    </div>
  );
};

export default MainBanner;
