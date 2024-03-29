import React from "react";
import { Route, Routes } from "react-router-dom";
import Main from "../components/pages/Main";
import Header from "../components/organisms/Header";

const App: React.FC = () => {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Main />} />
      </Routes>
    </>
  );
};

export default App;
