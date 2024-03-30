"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ViewBox from "../../components/molecules/ViewBox";
import ViewDetail from "../../components/molecules/ViewDetail";
import Loading from "../../components/organisms/Loading";
import { bannerImg1 } from "../../images/Banner";
import axios from "axios";

export interface Product {
  id: number;
  title: string;
  content: string;
  image: string;
  price: string;
  seller: string;
}

const ProductPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState<Product>({
    id: 0,
    title: "",
    content: "",
    image: "",
    price: "",
    seller: "",
  });
  const [loading, setLoading] = useState(true);
  const [userWalletAddress, setUserWalletAddress] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<Product>(`${process.env.NEXT_PUBLIC_API_URL}/product/${id}`);
        setProduct(response.data);
        setLoading(false);
      } catch (error) {
        console.log(error);
      }
    };

    const fetchWalletAddress = async () => {
      // MetaMask 또는 유사한 웹3 지갑에서 계정 가져오기
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
          const account = accounts[0];
          setUserWalletAddress(account);
        } catch (error) {
          console.error("MetaMask 또는 유사한 웹3 지갑이 설치되어 있지 않습니다.");
        }
      } else {
        console.error("MetaMask 또는 유사한 웹3 지갑이 설치되어 있지 않습니다.");
      }
    };

    fetchData();
    fetchWalletAddress();
  }, [id]);

  return (
    <div className="mt-24">
      {loading ? (
        <Loading />
      ) : (
        <div className="w-full">
          <ViewBox product={product} userWalletAddress={userWalletAddress} />
          <ViewDetail />
        </div>
      )}
    </div>
  );
};

export default ProductPage;
