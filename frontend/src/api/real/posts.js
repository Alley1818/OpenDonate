import { getActivity, savedIds, setActivity } from "../activity.js";
import { ApiError, request } from "../client.js";
import { isAuthor } from "../config.js";
import { postFromApi } from "../mappers.js";

const pathFor = (id) => `/posts/${encodeURIComponent(id)}`;
// The likes route currently repeats the router prefix in FastAPI.
const likePath = (id) => `/posts${pathFor(id)}/likes`;
const withActivity = (raw, userId) => ({ ...postFromApi(raw, userId), ...getActivity(userId, raw.id) });

export const posts = {
  async page({ offset = 0, limit = 12, signal, userId } = {}) {
    const result = await request(`/posts?offset=${offset}&limit=${limit}`, { signal });
    if (!Array.isArray(result)) throw new ApiError("Сервер вернул неожиданный список публикаций.", 502);
    return result.map((post) => withActivity(post, userId));
  },

  async get(id, { userId, signal } = {}) {
    const post = await request(pathFor(id), { signal });
    if (!isAuthor(post.author_id)) throw new ApiError("Публикация не найдена.", 404);
    return withActivity(post, userId);
  },

  async create(values, userId) {
    return withActivity(await request("/posts", { method: "POST", body: values }), userId);
  },

  async update(id, changes, userId) {
    return withActivity(await request(pathFor(id), { method: "PATCH", body: changes }), userId);
  },

  async toggleLike(id, { userId, post }) {
    const { liked } = getActivity(userId, id);
    try {
      await request(likePath(id), { method: liked ? "DELETE" : "POST" });
    } catch (error) {
      if (!(liked && error.detail === "Like not found")) throw error;
    }
    setActivity(userId, id, "likes", !liked);
    return { ...post, liked: !liked };
  },

  async toggleBookmark(id, { userId, post }) {
    const { bookmarked } = getActivity(userId, id);
    setActivity(userId, id, "bookmarks", !bookmarked);
    return { ...post, bookmarked: !bookmarked };
  },

  async listBookmarked(userId) {
    const results = await Promise.all(savedIds(userId).map(async (id) => {
      try {
        return await posts.get(id, { userId });
      } catch (error) {
        if (error.status === 404) return null;
        throw error;
      }
    }));
    return results.filter(Boolean);
  },
};
