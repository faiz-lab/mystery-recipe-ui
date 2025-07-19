import axios from "axios";

export const postSuggest = (data) => axios.post("/api/suggest", data);

/**
 * ✅ 获取用户库存
 */
export const getInventory = (lineId) =>
  axios.get(`/users/${encodeURIComponent(lineId)}/inventory`);

/**
 * ✅ 更新用户库存
 */
export const updateInventory = (lineId, payload) =>
  axios.post(`/users/${encodeURIComponent(lineId)}/inventory`, payload);

/**
 * ✅ 提交必用食材（生成料理推荐）
 */
export const requestRecipeRecommendation = (payload) =>
  axios.post("/recipes/recommendations", payload);