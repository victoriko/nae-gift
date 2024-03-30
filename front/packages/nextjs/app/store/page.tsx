"use client";

import React, { useEffect, useState } from "react";
import Button from "../../components/atoms/button";
import StoreBanner from "../../components/molecules/StoreBanner";
import MyProductList from "../../components/templates/MyProductList";
import axios from "axios";
import { ethers } from "ethers";
import Pagination from "react-js-pagination";
import Swal from "sweetalert2";

export interface Data {
  nextPage: number;
  products: [];
  productsCount: number;
  totalPages: number;
}

export interface Product {
  id: number;
  title: string;
  image: string;
  price: string;
  seller: string;
}

export interface DataGift {
  nextPage: number;
  gifts: [];
  productsCount: number;
  totalPages: number;
}

export interface Gift {
  id: number;
  title: string;
  content: string;
  image: string;
  price: string;
  seller: string;
  buyer: string;
  receiver: string;
  contract: string;
  state: string;
  updatedAt: string;
}

const MyStoreList: React.FC = () => {
  const [product, setProduct] = useState<Product[]>([]);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [userAddress] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [order, setOrder] = useState<string>("desc");
  const [seller, setSeller] = useState<string>("");
  const [totalPage, setTotalPage] = useState<number>(1);
  const [giftTotalPage, setGiftTotalPage] = useState<number>(1);
  const [scrollPosition, setScrollPosition] = useState<number>(0);
  const [showBanner, setShowBanner] = useState<boolean>(true);

  //   const protocol = window.location.href.split("//")[0] + "//";
  const changePage = async (pageNumber: number) => {
    setPage(pageNumber);
  };

  useEffect(() => {
    const getWalletAddress = async () => {
      if (window.ethereum) {
        try {
          await window.ethereum.request({
            method: "eth_requestAccounts",
          });
          const ethereum = window.ethereum as any;
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const userAddress = await signer.getAddress();

          setSeller(userAddress);
        } catch (error) {
          console.log("자갑주소 가져오기 에러", error);
          Swal.fire({
            icon: "error",
            text: "Get Wallet Address Error",
          });
          return;
        }
      } else {
        console.log("메타마스크 설치하십시오");
      }
    };

    getWalletAddress();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get<Data>(
        `${process.env.NEXT_PUBLIC_API_URL}/store?seller=${seller}&page=${page}&order=${order}`,
      );

      setTotalPage(response.data.totalPages);
      setProduct(response.data.products);
    } catch (error) {
      console.error("데이터를 불러오는 중 에러 발생:", error);
    }
  };

  const fetchGifts = async () => {
    try {
      const responseGift = await axios.get<DataGift>(
        `${process.env.NEXT_PUBLIC_API_URL}/store/verified?seller=${seller}&page=${page}&order=${order}`,
      );
      setGifts(responseGift.data.gifts);
      setGiftTotalPage(responseGift.data.totalPages);
    } catch (error) {
      console.error("Error fetching gifts:", error);
    }
  };

  const orderChange = (selected: string) => {
    setOrder(selected);
  };

  useEffect((): void => {
    if (seller) {
      fetchData();
      fetchGifts();
    }
  }, [seller, page, order]);

  useEffect(() => {
    const handleScroll = () => {
      const position = window.pageYOffset;
      setScrollPosition(position);
      if (window.innerWidth < 640) {
        if (position > 150) {
          setShowBanner(false);
        } else {
          setShowBanner(true);
        }
      } else {
        if (position > 600) {
          setShowBanner(false);
        } else {
          setShowBanner(true);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="">
      <div className={`transition-opacity duration-500 ${showBanner ? "opacity-100" : "opacity-0"}`}>
        <StoreBanner />
      </div>

      <div>
        <div className="h-full w-[70%] mt-[20px]">
          <div>
            <div className="flex flex-row py-5 gap-5 px-20 mx-auto items-center">
              <Button variant="basicBtn2" size="md" label="Latest" onClick={() => orderChange("desc")} />
              <Button variant="basicBtn2" size="md" label="Past" onClick={() => orderChange("asc")} />
            </div>
            <div className="h-full">
              <MyProductList products={product} userAddress={userAddress} />
            </div>
            <div className="w-full flex flex-row py-2 gap-5 justify-center items-center">
              <Pagination
                activePage={page}
                itemsCountPerPage={10}
                totalItemsCount={totalPage * 10}
                pageRangeDisplayed={5}
                prevPageText={"‹"}
                nextPageText={"›"}
                onChange={pageNumber => changePage(pageNumber)}
                innerClass="flex flex-row py-5 justify-center items-center gap-8"
                itemClass="inline-block w-10 h-10 border rounded flex justify-center items-center rounded-3xl hover:bg-[#ff4400] hover:text-white hover:border-none"
                activeClass="pagination-active text-black"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyStoreList;
