import { useState, useCallback } from "react";
import {
  getInventory,
  updateInventory,
  requestRecipeRecommendation,
} from "@/services/api";

export default function useInventory(userId) {
  const [inventory, setInventory] = useState([]);

  const fetchInventory = useCallback(async () => {
    if (!userId) return;
    const { data } = await getInventory(userId);
    setInventory(data.filter((d) => d.amount > 0));
  }, [userId]);

  const registerInventory = useCallback(
    (payload) => updateInventory(payload),
    []
  );

  const sendRecommendation = useCallback(
    (payload) => requestRecipeRecommendation(payload),
    []
  );

  return {
    inventory,
    setInventory,
    fetchInventory,
    registerInventory,
    sendRecommendation,
  };
}
