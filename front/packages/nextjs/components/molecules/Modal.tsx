import React, { useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { ESCROW_ABI } from "../../abi/escrow";
import { closeBtn } from "../../images/Icon";
import { cn } from "../../utils/cn";
import Button from "../atoms/button";
import Inputs from "../atoms/inputs";
import { Product } from "../templates/ProductPage";
import { formatEther, parseEther } from "@ethersproject/units";
import { ethers } from "ethers";
import { v4 as uuid } from "uuid";
import { useAccount } from "wagmi";
import { useScaffoldContractWrite, useScaffoldEventSubscriber } from "~~/hooks/scaffold-eth";

interface ModalProps {
  onClose: () => void;
  product: Product;
}

const Modal: React.FC<ModalProps> = ({ onClose, product }) => {
  const [receiverInput, setReceiverInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { address: walletAddress, isConnected } = useAccount();
  const priceETH = formatEther(product.price);
  const navigate = useRouter();
  const { id } = useParams();
  const UUID = uuid();

  const { write: createEscrowWrite, isLoading: isCreateEscrowLoading } = useScaffoldContractWrite({
    contractName: "Escrow",
    functionName: "createEscrow",
    args: [
      UUID,
      walletAddress,
      product.seller,
      receiverInput,
      process.env.NEXT_PUBLIC_MARKET_ADDRESS,
      parseEther(priceETH),
    ],
    value: BigInt(parseEther(priceETH).toString()),
  });

  useScaffoldEventSubscriber({
    contractName: "Escrow",
    eventName: "EscrowCreated",
    listener: () => {
      navigate.push("/gift");
    },
  });

  const sendGift = async () => {
    if (!isConnected) {
      alert("Ethereum wallet not found.");
      return;
    }

    if (receiverInput.trim() === "") {
      alert("Please enter the recipient's wallet address.");
      return;
    }

    setLoading(true);

    alert("sending gift now. please wait.");

    try {
      await createEscrowWrite();
    } catch (error) {
      console.error("Error sending gift:", error);
      alert("cancle transaction");
    } finally {
      setLoading(false);
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
              <h3 className="text-2xl py-3 text-gray-900 ">Sending {product.title} as gift...</h3>
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
                  {/* Loading spinner and text */}
                </div>
              ) : (
                <Button onClick={sendGift} variant="sendBtn2" size="lg" label="Pay with MetaMask" />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Modal;
