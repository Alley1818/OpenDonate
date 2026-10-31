// REAL backend services. Only endpoints that exist in the backend are wired; the rest report "not supported".
// Contract is based on the current backend sources and may need updates as the backend evolves.
import { request, notSupported } from "../client.js";
import { postFromApi, userFromApi } from "../mappers.js";

const byDate = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);

async function listPosts({ filter = "all", q = "" } = {}) {
  const raw = await request("/posts");
  let items = raw.map(postFromApi).sort(byDate);
  if (filter === "public" || filter === "paid") items = items.filter((p) => p.visibility === filter);
  if (q.trim()) {
    const s = q.toLowerCase();
    items = items.filter((p) => `${p.title} ${p.content}`.toLowerCase().includes(s));
  }
  return items;
}

export const realApi = {
  auth: {
    async register(d) {
      await request("/users/register", { method: "POST", body: { email: d.email, username: d.username, password: d.password } });
      return realApi.auth.login({ username: d.username, password: d.password });
    },
    async login({ username, password }) {
      const r = await request("/users/login", { method: "POST", body: { username, password } });
      return userFromApi(r, username);
    },
    async logout() { return null; }, // no logout endpoint yet
    async me() { return null; }, // no /me endpoint yet
  },
  posts: {
    list: listPosts,
    async get(id) {
      const found = (await listPosts()).find((p) => String(p.id) === String(id));
      if (!found) throw Object.assign(new Error("Публикация не найдена"), { status: 404 });
      return found;
    },
    async create({ title, content, visibility }) {
      return postFromApi(await request("/posts", { method: "POST", body: { title, content, visibility } }));
    },
    async listByAuthor(authorId) { return (await listPosts()).filter((p) => String(p.authorId) === String(authorId)); },
    toggleLike: notSupported("Лайки"),
    toggleBookmark: notSupported("Закладки"),
    listBookmarked: notSupported("Сохранённое"),
    comments: notSupported("Комментарии"),
    addComment: notSupported("Комментарии"),
  },
  creators: {
    list: notSupported("Каталог авторов"),
    categories: async () => [],
    suggested: async () => [],
    get: notSupported("Профиль автора"),
    subscribe: notSupported("Подписки"),
    unsubscribe: notSupported("Подписки"),
    listSubscriptions: notSupported("Подписки"),
  },
  profile: { update: notSupported("Редактирование профиля") },
};
