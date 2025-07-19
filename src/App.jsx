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
          {/* 他ページを追加する場合↓
          <Route path="/selection" element={<SelectionPage />} /> */}
          <Route path="*" element={<Navigate to="/registration" />} />
        </Routes>
      </BrowserRouter>

      {/* ---- クレジット ---- */}
      
      {/*<footer
        className={`text-xs text-gray-500 z-50 transition-all
          ${atBottom ? "absolute bottom-2" : "fixed bottom-2"} right-2`}
      >
        Designed&nbsp;by&nbsp;
        <a
          href="https://www.freepik.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-700"
        >
          Freepik
        </a>
      </footer>*/}
      
    </>
  );
}
