"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Button from "../components/atoms/button";
import MainBanner from "../components/molecules/MainBanner";
import ProductList from "../components/templates/ProductList";
import { cn } from "../utils/cn";
import axios from "axios";
import type { NextPage } from "next";
import Pagination from "react-js-pagination";
import { useAccount } from "wagmi";
// import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";

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
  price: number;
}

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [product, setProduct] = useState<Product[]>([]);
  const [latestProduct, setLatestProduct] = useState<Product[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPage, setTotalPage] = useState<number>(1);
  const [order, setOrder] = useState<string>("asc");

  const changePage = async (pageNumber: number) => {
    setPage(pageNumber);
  };

  const mainData = async (page: number) => {
    try {
      const response = await axios.get<Data>(`${process.env.NEXT_PUBLIC_API_URL}/?page=${page}&order=${order}`);

      setProduct(response.data.products);
      setTotalPage(response.data.totalPages);
    } catch (error) {
      console.log(error);
    }
  };

  const latestData = async () => {
    try {
      const latestRes = await axios.get<Data>(`${process.env.NEXT_PUBLIC_API_URL}/?page=1&order=desc`);
      console.log(latestRes.data.products);
      setLatestProduct(latestRes.data.products);
    } catch (error) {
      console.log(error);
    }
  };

  const orderChange = (selected: string) => {
    setOrder(selected);
  };

  useEffect((): void => {
    mainData(page);
    latestData();
  }, [page, order]);

  return (
    <>
      <div className="flex items-center flex-col flex-grow ">
        <div>
          <MainBanner />
        </div>
        <div className="px-5 flex-grow w-full pt-[10%] flex flex-col items-center justify-center absolute mobile:pt-[5%]">
          <h1 className="text-center mb-8">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">Naegift</span>
          </h1>
          <div className="flex justify-center items-center space-x-2 mb-8">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress} />
          </div>
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div
            className={cn(
              "w-4/5 flex flex-row gap-5 py-8 px-20 mt-[50px] mx-auto items-center justify-between ",
              "note:w-full",
              "tablet:w-full tablet:px-14",
              "mobile:px-5 mobile:flex-col",
            )}
          >
            <span className="text-2xl font-extrabold">New collections!</span>
          </div>

          <div
            className={cn(
              "w-4/5 flex flex-row pb-20 pt-[10px] gap-7 px-20 mx-auto",
              "note:w-full",
              "tablet:w-full tablet:flex-wrap tablet:px-16 tablet:gap-12",
              "mobile:flex-wrap mobile:px-6",
            )}
          >
            <ProductList products={latestProduct} />
          </div>
          <div
            className={cn(
              "w-4/5 flex flex-row py-5  px-20 mx-auto items-center justify-between ",
              "note:w-full",
              "tablet:w-full tablet:px-14",
              "mobile:px-5 mobile:flex-col",
            )}
          >
            <span className="text-2xl font-extrabold">All collections</span>
            <div className="flex flex-row gap-8">
              <Button variant="basicBtn2" size="md" label="Latest" onClick={() => orderChange("desc")} />
              <Button variant="basicBtn2" size="md" label="Past" onClick={() => orderChange("asc")} />
            </div>
          </div>

          <div
            className={cn(
              "w-4/5 flex flex-row py-4 gap-7 px-20 mx-auto ",
              "note:w-full",
              "tablet:w-full tablet:flex-wrap tablet:px-16 tablet:gap-12",
              "mobile:flex-wrap mobile:px-6",
            )}
          >
            <ProductList products={product} />
          </div>

          <div className={cn("w-4/5 flex flex-row py-5 gap-5 mx-auto justify-center items-center", "mobile:w-full")}>
            <Pagination
              activePage={page}
              itemsCountPerPage={5}
              totalItemsCount={totalPage * 5}
              pageRangeDisplayed={5}
              prevPageText={"‹"}
              nextPageText={"›"}
              onChange={pageNumber => changePage(pageNumber)}
              innerClass="flex flex-row py-5 justify-center items-center gap-2 mobile:gap-[5px] moblie:w-full"
              itemClass="inline-block w-10 h-10 border border-gray-300 flex justify-center items-center rounded-3xl hover:bg-[#ff4400] hover:text-white hover:border-none"
              activeClass="pagination-active text-black"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
