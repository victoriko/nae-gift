import React from "react";
import { Route, Routes } from "react-router-dom";
import Main from "../pages/Main";
import Header from "../components/organisms/Header";
import View from "../pages/View";
import ProductWrite from "../pages/ProductWrite";
import MyStoreList from "../pages/MyStoreList";
import Gift from "../pages/Gift";

const App: React.FC = () => {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/product/:id" element={<View />} />
        <Route path="/product" element={<ProductWrite />} />
        <Route path="/store" element={<MyStoreList />} />
        <Route path="/gift" element={<Gift />} />
      </Routes>
    </>
  );
};

export default App;
