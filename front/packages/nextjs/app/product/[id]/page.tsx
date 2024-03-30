"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
// 'useParams'를 임포트합니다.
import ViewBox from "../../../components/molecules/ViewBox";
import ViewDetail from "../../../components/molecules/ViewDetail";
import Loading from "../../../components/organisms/Loading";
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
  const params = useParams(); // 'useParams' 훅을 사용하여 매개변수를 가져옵니다.
  const id = params.id; // 'id' 매개변수에 직접 접근합니다.
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
      if (!id) return;
      const productId = parseInt(Array.isArray(id) ? id[0] : id, 10);
      try {
        const response = await axios.get<Product>(`${process.env.NEXT_PUBLIC_API_URL}/product/${productId}`);
        setProduct(response.data);
        setLoading(false);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
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

