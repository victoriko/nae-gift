import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "../../utils/cn";
import { runEthers } from "../../utils/ethers";
import Button from "../atoms/button";
import { Product } from "../templates/ProductPage";
import Modal from "./Modal";
import { formatEther } from "@ethersproject/units";
import axios from "axios";
import Swal from "sweetalert2";

interface viewBoxData {
  product: Product;
  userWalletAddress: string;
}

const ViewBox: React.FC<viewBoxData> = ({ product, userWalletAddress }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [updatedData, setUpdatedData] = useState<Product>(product);
  const [isEditMode, setIsEditMode] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isInputValid, setIsInputValid] = useState(false);
  const navigate = useRouter();

  const protocol = window.location.href.split("//")[0] + "//";

  const openModal = () => {
    if (window.innerWidth <= 1024) {
      Swal.fire({
        icon: "error",
        text: "Please fill out all input fields.",
      });
    } else {
      setModalOpen(true);
    }
  };

  const handleEditProduct = async (productId: number) => {
    try {
      const formData = new FormData();
      const { signature } = await runEthers(updatedData.title, updatedData.content, updatedData.price);
      formData.append("title", updatedData.title);
      formData.append("price", updatedData.price);
      formData.append("content", updatedData.content);
      formData.append("signature", signature);
      if (imageFile) {
        formData.append("file", imageFile);
      }

      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/product/${productId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setIsEditMode(false);
      return response;
    } catch (error) {
      Swal.fire({
        icon: "error",
        text: "Error updating product:",
      });
    }
  };
  const handleDeleteProduct = async (productId: number) => {
    try {
      const { signature } = await runEthers("delete", "delete", "delete");
      if (product.seller === userWalletAddress) {
        const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/product/${productId}`, {
          headers: {
            "Content-Type": "application/json",
            Accept: "*/*",
          },
          data: {
            title: "delete",
            content: "delete",
            price: "delete",
            signature,
          },
        });

        navigate.push("/store");
      } else {
        navigate.push("/");
      }
    } catch (error) {
      navigate.push("/");
    }
  };

  const handleEditButtonClick = () => {
    setUpdatedData({ ...product });
    setIsEditMode(true);
  };

  const handleDeleteButtonClick = () => {
    handleDeleteProduct(product.id);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === "price") {
      const validNumberRegex = /^[0-9.]+$/;
      if (value === "" || validNumberRegex.test(value)) {
        setUpdatedData((prevData: Product) => ({
          ...prevData,
          [name]: value,
        }));
      }
    } else {
      setUpdatedData((prevData: Product) => ({
        ...prevData,
        [name]: value,
      }));
    }
    setIsInputValid(!!updatedData.title && !!updatedData.price && !!updatedData.content);
  };

  const handleCompleteButtonClick = () => {
    if (isInputValid) {
      handleEditProduct(product.id);
    }
  };

  return (
    <div
      className={cn(
        "w-full py-14 flex justify-center gap-36 ",
        "tablet:flex-col tablet:items-center tablet:gap-10 tablet:w-full tablet:px-3",
        "mobile:flex-col mobile:gap-2 mobile:py-5 ",
      )}
    >
      <div className="mobile:px-5">
        <img
          className="w-[324px] h-[324px]"
          src={imageFile ? URL.createObjectURL(imageFile) : updatedData.image}
          alt=""
        />
        {isEditMode && <input type="file" accept="image/*" onChange={handleImageChange} />}
        <div className="flex flex-row gap-10 mt-6 justify-center ">
          {product.seller === userWalletAddress && (
            <>
              {isEditMode ? (
                <Button
                  variant="basicBtn2"
                  size="mm"
                  label="완료"
                  onClick={handleCompleteButtonClick}
                  disabled={!isInputValid}
                  style={{
                    opacity: isInputValid ? 1 : 0.5,
                  }}
                />
              ) : (
                <Button variant="iconBtn" size="mm" label="Modify" onClick={handleEditButtonClick} />
              )}
              <Button variant="basicBtn2" size="mm" label="Delete" onClick={handleDeleteButtonClick} />
            </>
          )}
        </div>
      </div>

      <div className={cn("w-1/4 tablet:w-2/3 mobile:w-full mobile:px-5 ")}>
        {isEditMode ? (
          <div className="flex flex-col gap-y-5">
            <div>
              <p>Title</p>
              <input
                type="text"
                name="title"
                value={updatedData.title}
                onChange={handleChange}
                className="border w-full"
              />
            </div>
            <div>
              <p>WEI</p>
              <input
                type="text"
                name="price"
                value={updatedData.price}
                onChange={handleChange}
                className="border w-full"
              />
            </div>
            <div>
              <p>content</p>
              <textarea
                name="content"
                value={updatedData.content}
                onChange={handleChange}
                className="border w-full h-[200px] resize-none"
              />
            </div>
          </div>
        ) : (
          <>
            <p className="text-3xl mobile:text-2xl">{updatedData.title}</p>
            <p className="text-2xl py-3 border-b mobile:text-xl">{formatEther(updatedData.price).toString()} ETH</p>
            <span className="inline-block py-3">Product description</span>
            <p className="py-5">{updatedData.content}</p>
          </>
        )}
        {/* <p className="py-7">Seller: {updatedData.seller}</p> */}
        <div
          className={cn(
            "py-5 tablet:flex tablet:items-center tablet:justify-center",
            "mobile:flex mobile:justify-center mobile:items-center",
          )}
        >
          {isEditMode ? <></> : <Button onClick={openModal} variant="sendBtn2" size="lg" label="Send" />}
        </div>
      </div>
      {modalOpen && <Modal product={product} onClose={() => setModalOpen(false)} />}
    </div>
  );
};

export default ViewBox;
