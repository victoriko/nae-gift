import React, { useState } from "react";
import Image from "next/image";
// import { useParams } from "react-router";
import { useParams, useRouter } from "next/navigation";
import { ESCROW_ABI } from "../../abi/escrow";
import { Product } from "../../app/product/[id]/page";
import { closeBtn } from "../../images/Icon";
import { walletState } from "../../recoil/walletState";
import { cn } from "../../utils/cn";
import Button from "../atoms/button";
import Inputs from "../atoms/inputs";
import { ExternalProvider } from "@ethersproject/providers";
import { formatEther } from "@ethersproject/units";
import axios from "axios";
import { ethers } from "ethers";
import { useRecoilValue } from "recoil";
import { v4 as uuid } from "uuid";
import { useAccount } from "wagmi";

interface ModalProps {
  onClose: () => void;
  product: Product;
}

const Modal: React.FC<ModalProps> = ({ onClose, product }) => {
  const [receiverInput, setReceiverInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { address: walletAddress } = useAccount();
  const priceETH = formatEther(product.price);
  const navigate = useRouter();
  const { id } = useParams();

  const protocol = window.location.href.split("//")[0] + "//";

  const runEthers = async () => {
    if (!window.ethereum) {
      alert("Ethereum wallet not found.");
      return;
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum as unknown as ExternalProvider);
    const address = walletAddress;
    const signer = provider.getSigner();
    const UUID = uuid();

    const buyer = address;
    const seller = product.seller;
    const receiver = receiverInput;
    const market = process.env.NEXT_PUBLIC_MARKET_ADDRESS;
    console.log(process.env.NEXT_PUBLIC_MARKET_ADDRESS);
    console.log(market);

    setLoading(true);

    const contract = new ethers.Contract(process.env.NEXT_PUBLIC_PROXY_ADDRESS as any, ESCROW_ABI, provider);

    const transaction = {
      to: process.env.NEXT_PUBLIC_PROXY_ADDRESS,
      data: contract.interface.encodeFunctionData("createEscrow", [
        UUID,
        buyer,
        seller,
        receiver,
        market,
        ethers.utils.parseUnits(priceETH, "ether").toString(),
      ]),
      value: ethers.utils.parseUnits(priceETH, "ether").toString(),
      gasLimit: 3000000,
    };
    console.log(transaction);

    const reqBody = {
      buyer,
      receiver,
      uuid: UUID,
    };

    const payUrl = `${process.env.NEXT_PUBLIC_API_URL}/product/${id}/pay`;
    console.log(payUrl, reqBody);
    const response = axios.post(payUrl, reqBody);

    signer
      .sendTransaction(transaction)
      .then(response => {
        // Handle the successful transaction here
      })
      .catch(error => {
        setLoading(false);
        alert("The transaction has been canceled");
      });

    console.log("Transaction sign post body: ", {
      buyer,
      receiver,
      uuid: UUID,
    });

    console.log(response);

    if (await response) {
      alert("Your gift has been sent successfully! Moving to the gift box");
      navigate.push("/gift");
    }
    // } catch (error) {
    //   console.log("선물보내기에서 오류", error);
    //   alert("선물을 보내지못했습니다ㅠㅠ");
    // } finally {
    //   setLoading(false);
    // }
  };

  const sendGift = async () => {
    if (receiverInput.trim() !== "") {
      await runEthers();
    } else {
      alert("Please enter the recipient's wallet address.");
    }
  };

  return (
    <>
      {onClose && (
        <div className="fixed top-0 left-0 flex items-center justify-center w-full h-full bg-black bg-opacity-70 z-50">
          <div className="p-8 bg-white rounded-xl w-1/3 flex flex-col gap-2">
            <div className="flex justify-end">
              <button onClick={onClose}>
                <Image src={closeBtn} alt="" />
              </button>
            </div>
            <div className="py-2 text-center">
              <h3 className="text-2xl py-3 text-gray-900 ">{product.title} Send a gift</h3>

              <p className="py-3">Price : {priceETH} ETH </p>

              <Inputs
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReceiverInput(e.target.value)}
                type="text"
                size="xlg"
                placeholder="Please input the recipient's wallet address"
              />
            </div>
            <div className="px-4 py-3 flex justify-center ">
              {loading ? (
                <div
                  className={cn(
                    "flex justify-center items-center gap-4 ",
                    "w-[300px] h-[50px] text-[20px] text-white rounded-xl bg-gradient-to-r from-[#ec4609] to-[#FFA787]",
                  )}
                >
                  <svg
                    className="animate-spin -ml-1 mr-3 h-8 w-8 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span className="font-bold">Please wait a moment..!</span>
                </div>
              ) : (
                <Button onClick={sendGift} variant="sendBtn2" size="lg" label="After payment, send the gift." />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Modal;
