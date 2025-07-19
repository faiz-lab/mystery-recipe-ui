

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function QuantityInput({ value = 0, onChange, disabled }) {
  const [local, setLocal] = useState(value);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  const commit = (num) => {
    const v = Math.max(0, num);
    setLocal(v);
    onChange?.(v);
  };

  const handleMinus = () => commit(local - 1);
  const handlePlus = () => commit(local + 1);
  const handleChange = (e) => {
    const num = parseInt(e.target.value, 10);
    commit(isNaN(num) ? 0 : num);
  };

  return (
    <div className="flex items-center gap-1 h-9">
      <Button
        size="icon"
        variant="secondary"
        onClick={handleMinus}
        disabled={disabled || local === 0}
        className="h-9 w-9"
      >
        −
      </Button>

      <input
        type="number"
        min="0"
        className="w-14 text-center border rounded h-9"
        value={local}
        onChange={handleChange}
        disabled={disabled}
      />

      <Button
        size="icon"
        variant="secondary"
        onClick={handlePlus}
        disabled={disabled}
        className="h-9 w-9"
      >
        ＋
      </Button>
    </div>
  );
}
