// src/hooks/useDebouncedEffect.js
import { useEffect } from "react";

export default function useDebouncedEffect(effect, deps, delay) {
  useEffect(() => {
    const handler = setTimeout(() => effect(), delay);
    return () => clearTimeout(handler);
  }, [...(deps || []), delay]);
}
