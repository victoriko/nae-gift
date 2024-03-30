import React from "react";
import { Product } from "../../app/page";
import ProductBox from "../molecules/productBox";

interface mainData {
  products: Product[];
}

const ProductList: React.FC<mainData> = ({ products }) => {
  return (
    <>
      {products.map((product, index) => (
        <ProductBox key={index} product={product} />
      ))}
    </>
  );
};

export default ProductList;
