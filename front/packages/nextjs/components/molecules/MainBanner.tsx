import Image from "next/image";

const MainBanner: React.FC = () => {
  return (
    <div className="flex items-center justify-center bg-center bg-cover ">
      <div className=" h-[500px]">
        <Image alt="SE2 logo" src="/coupleBanner2.png" layout="fixed" width={1800} height={900} />
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
