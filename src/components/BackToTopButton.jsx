// BackToTopButton.jsx
import React, { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BackToTopButton({ targetRef }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = targetRef?.current;
    if (!el) return;

    const onScroll = () => {
      setShow(el.scrollTop > 100);
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [targetRef]);

  if (!show) return null;

  return (
    <Button
      onClick={() => {
        targetRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      }}
      className="fixed bottom-6 right-6 p-3 rounded-full bg-orange-500 text-white shadow-lg hover:scale-110 transition-transform"
    >
      <ArrowUp className="w-5 h-5" />
    </Button>
  );
}


