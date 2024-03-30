import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "../../app/page";
import { viewImg1 } from "../../images/Product";
// import { formatEther } from "@ethersproject/units";
import { cn } from "../../utils/cn";

interface iProductBox {
  product: Product;
}

const ProductBox: React.FC<iProductBox> = ({ product }) => {
  //   const priceETH = formatEther(product.price);

  return (
    <Link href={`/product/${product.id}`} passHref>
      <div
        className={cn("drop-shadow-[0_35px_35px_rgba(0,0,0,0.25)] rounded-md hover:scale-105 duration-200 pb-3", "")}
      >
        <div className="w-full h-full ">
          <Image
            className={cn(
              "rounded-tl-lg rounded-tr-lg",
              "w-[350px] h-[250px]",
              "tablet:w-[240px] tablet:h-[265px]",
              "mobile:w-[250px] mobile:h-[275px]",
            )}
            src={product.image && product.image !== "http://example.com" ? product.image : viewImg1}
            alt=""
            width={350}
            height={250}
          />
        </div>
        <div className="">
          <p className="py-2 pl-2 text-xl font-extrabold  ">{product.title}</p>
          <div className="flex flex-row p-2">
            {/* <img src={ethIcon} alt="" className="w-[30px] h-[30px]" /> */}
            <p className="text-[18px] text-slate-400 pl-2">{/* {priceETH} ETH */}ETh</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductBox;