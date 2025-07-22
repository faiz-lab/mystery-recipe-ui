import { useState, useEffect } from "react";
import axios from "axios";
import qs from "qs";

export function useIngredientSearch() {
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchResults = async () => {
    if (!query && categories.length === 0) {
      setResults([]);
      setTotal(0);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/ingredients/search`, {
        params: { q: query, categories, page, limit: 20 },
        paramsSerializer: (params) => qs.stringify(params, { arrayFormat: "repeat" })
      });
      setResults(res.data.results);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(fetchResults, 300);
    return () => clearTimeout(delayDebounce);
  }, [query, categories, page]);

  return {
    query, setQuery,
    categories, setCategories,
    results, total, page, setPage, loading
  };
}
