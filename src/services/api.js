// src/services/api.js
import axios from "axios";

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
/**
 * ✅ 搜索建议
 */
export const postSuggest = (data) =>
  axios.post("/api/suggest", data);

/**
 * ✅ 获取用户库存
 * @param {string} lineId - LINE 用户 ID
 */
export const getInventory = (lineId) =>
  axios.get(`/users/${encodeURIComponent(lineId)}/inventory`);

/**
 * ✅ 更新库存的部分数据
 * @param {string} userId - 用户ID（LINE ID）
 * @param {Array} updateItems - 要更新的食材
 * @param {Array} removeItems - 要删除的食材（可选）
 */
export const patchInventory = async (userId, updateItems = [], removeItems = []) => {
  return axios.patch(`/users/${encodeURIComponent(userId)}/inventory`, {
    update: updateItems,
    remove: removeItems
  });
};

/**
 * ✅ 提交食材选择（生成料理推荐）
 * @param {Object} payload - { time, required_ingredients, available_ingredients }
 */
export const requestRecipeRecommendation = (payload) =>
  axios.post("/recipes/recommendations", payload);
