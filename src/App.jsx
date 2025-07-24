import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";

export default function App() {
  const [atBottom, setAtBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const nearBottom =
          window.innerHeight + window.scrollY >= document.body.offsetHeight - 2;
      setAtBottom(nearBottom);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
      <BrowserRouter>
        <Routes>
          {/* ✅ "/" と "/registration" どちらでも MainPage を表示 */}
          <Route path="/" element={<MainPage />} />
          <Route path="/registration" element={<MainPage />} />
        </Routes>
      </BrowserRouter>
  );
}
