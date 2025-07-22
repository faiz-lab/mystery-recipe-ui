import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainPage from "./pages/MainPage";   // 既存コンポーネント

export default function App() {
  /* ----- 右下のクレジット位置 (sticky ↔ bottom) ----- */
  const [atBottom, setAtBottom] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      const nearBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 2;
      setAtBottom(nearBottom);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();               // 初回判定
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/registration" element={<MainPage />} />
          <Route path="*" element={<Navigate to="/registration" />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
