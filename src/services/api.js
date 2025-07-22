// src/services/api.js
import axios from "axios";

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;

// ✅ 全局请求超时
axios.defaults.timeout = 10000;
// ✅ 全局错误拦截（可选）
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

/**
 * ✅ 查询食材
 */
export const fetchIngredients = (params) => {
  return axios.get("/ingredients", { params });
};

/**
 * ✅ 获取用户库存
 * @param {string} userId - LINE 用户 ID
 */
export const getInventory = (userId) =>
  axios.get(`/users/${encodeURIComponent(userId)}/inventory`);

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
export const requestRecipeRecommendation = (payload) => {
  return axios.post("/recipes/recommendations", payload);
}
