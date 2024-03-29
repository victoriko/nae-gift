import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// import useWalletAndSuscribe from "../../hooks/useWalletAndSuscribe";
import { useRecoilState } from "recoil";
import Button from "../atoms/button";
import { logo } from "../../images/index";
import { menuBar2 } from "../../images/Icons";
// import { walletState } from "../../recoil/walletState";
import { cn } from "../utils/cn";
// import Notification from "./Notification";
import Menu from "../molecules/Menu";

const Header: React.FC = () => {
  // const { connectWallet, notificationData } = useWalletAndSuscribe();
  // const [sellerWallets] = useRecoilState(walletState);
  const [menu, setMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  // const [modalConnect, setModalConnect] = useState(false);

  // const handleLoginButtonClick = async () => {
  //   if (!sellerWallets.walletAddress) {
  //     try {
  //       await connectWallet();
  //     } catch (error) {
  //       console.error("로그인 에러:", error);
  //     }
  //   }
  // };
  // const menuOpen = () => {
  //   setMenu(!menu);
  // };

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const scrolled = scrollTop > 10;
      setIsScrolled(scrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      className={cn(
        "flex flex-row border-b-2 justify-between p-5 items-center relative transition-colors duration-700",
        "fixed top-0 right-0 w-full z-[10] h-[97px] mobile:h-[50px]",
        isScrolled ? "bg-white" : "bg-gradient-to-r from-transparent"
      )}
    >
      {/* <Notification notificationData={notificationData} /> */}
      <div>
        <Link to="/">
          <img
            src={logo}
            alt=""
            className=" tablet:w-[120px] mobile:w-[150px]"
          />
        </Link>
      </div>
      {menu && <Menu menu={menu} setMenu={setMenu} />}
      <div className="flex flex-row gap-10 items-center">
        <Link to="/product" className="tablet:hidden mobile:hidden">
          {/* <Button variant="sendBtn2" size="mdl" label="Product" /> */}
          <button className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800">
            <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-slate-200 dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
              Product
            </span>
          </button>
        </Link>
        <Link to="/store" className="tablet:hidden mobile:hidden">
          {/* <Button variant="sendBtn2" size="mdl" label="SELLER" /> */}
          <button className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800">
            <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-slate-200 dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
              SELLER
            </span>
          </button>
        </Link>

        <Link to="/gift" className="tablet:hidden mobile:hidden">
          {/* <Button variant="sendBtn2" size="mdl" label="Gift Box" /> */}
          <button className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800">
            <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-slate-200 dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
              Gift Box
            </span>
          </button>
        </Link>

        <Button
          variant="basicBtn"
          size="md"
          label="Connect"
          // onClick={handleLoginButtonClick}
        />

        <div
          className={cn(
            "hidden cursor-pointer tablet:inline-block",
            "mobile:block"
          )}
          // onClick={menuOpen}
        >
          <img src={menuBar2} alt="" className="w-[25px]" />
        </div>
      </div>
    </div>
  );
};

export default Header;
