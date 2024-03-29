import React from "react";
import { orkBanner, coupleBanner2 } from "../../images/Banners";

const MainBanner = () => {
  return (
    <div className="flex items-center justify-center bg-center bg-cover ">
      <img src={orkBanner} className="w-full h-screen mobile:h-[300px]" />
      <div className="absolute h-screen inset-0 bg-black opacity-60 mobile:h-[300px]"></div>
      <div className="absolute z-10 text-white text-center">
        <p className="text-4xl">Test</p>
        <p className="italic p-[20px] mt-[50px]">"Banner test"</p>
      </div>
    </div>
  );
};

export default MainBanner;
