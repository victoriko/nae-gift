"use client";

import React, { useEffect, useState } from "react";
import GiftList from "../../components/templates/GiftList";
import axios from "axios";
import { useAccount } from "wagmi";

export interface Product {
  id: number;
  title: string;
  content: string;
  price: string;
  image: string;
  state: string;
  updatedAt: string;
  buyer: string;
  receiver: string;
}

const Gift: React.FC = () => {
  const { address: connectedAddress } = useAccount();
  const [receiveProduct, setReceiveProduct] = useState<Product[]>([]);
  const [payProduct, setPayProduct] = useState<Product[]>([]);
  const [receivePage, setReceivePage] = useState<number>(1);
  const [payPage, setPayPage] = useState<number>(1);
  const [receiveTotalPage, setReceiveTotalPage] = useState<number>(1);
  const [payTotalPage, setPayTotalPage] = useState<number>(1);
  const [receiveOrder, setReceiveOrder] = useState<string>("desc");
  const [payOrder, setPayOrder] = useState<string>("desc");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const receiveUrl = `${process.env.NEXT_PUBLIC_API_URL}/gift?receiver=${connectedAddress}&page=${receivePage}&order=${receiveOrder}`;
        const receiveResponse = await axios.get(receiveUrl);
        setReceiveProduct(receiveResponse.data.gifts);
        setReceiveTotalPage(receiveResponse.data.totalPages);

        const payUrl = `${process.env.NEXT_PUBLIC_API_URL}/gift?buyer=${connectedAddress}&page=${payPage}&order=${payOrder}`;
        const payResponse = await axios.get(payUrl);
        setPayProduct(payResponse.data.gifts);
        setPayTotalPage(payResponse.data.totalPages);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, [connectedAddress, receivePage, payPage, receiveOrder, payOrder]);
  const receivePageChange = (pageNumber: number) => {
    setReceivePage(pageNumber);
  };

  const payPageChange = (pageNumber: number) => {
    setPayPage(pageNumber);
  };

  const receiveOrderChange = (selected: string) => {
    setReceiveOrder(selected);
  };

  const payOrderChange = (selected: string) => {
    setPayOrder(selected);
  };

  return (
    <div className="mt-[97px]">
      <GiftList
        payProducts={payProduct}
        receiveProducts={receiveProduct}
        payPage={payPage}
        receivePage={receivePage}
        receiveTotalPage={receiveTotalPage}
        payTotalPage={payTotalPage}
        onReceivePageChange={receivePageChange}
        onPayPageChange={payPageChange}
        onReceiveOrderChange={receiveOrderChange}
        onPayOrderChange={payOrderChange}
      />
    </div>
  );
};

export default Gift;
