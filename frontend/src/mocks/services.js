// Simulated backend. Same method signatures as src/api/real/index.js, so the UI never knows the difference.
import { DEMO_TIERS, DEMO_USER, posts as seedPosts, seedCommentsFor } from "./data.js";
import { readDb, writeDb, viewerOf } from "./db.js";
import { ApiError } from "../api/client.js";
import { teaser } from "../utils/format.js";
import { postContentText } from "../utils/postContent.js";

const delay = (ms = 220) => new Promise((r) => setTimeout(r, ms));
const COLORS = ["#111111", "#333333", "#555555", "#777777", "#FF7A24"];
const colorFor = (s) => COLORS[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % COLORS.length];
const byNewest = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);

const publicUser = (u) => u && ({ id: u.id, email: u.email, username: u.username, displayName: u.displayName, bio: u.bio, color: u.color });

function requireUser(s) {
  if (!s.session) throw new ApiError("Войдите в аккаунт, чтобы выполнить это действие", 401);
  return s.session;
}

function requireAuthor(s) {
  const id = requireUser(s);
  if (id !== DEMO_USER.id) throw new ApiError("Публикации доступны только автору", 403);
  return id;
}

function author(s) {
  return publicUser(s.users.find((user) => user.id === DEMO_USER.id));
}

function allPosts(s) {
  const owned = s.posts.filter((post) => post.authorId === DEMO_USER.id);
  const ids = new Set(owned.map((post) => post.id));
  return [...seedPosts.filter((post) => !ids.has(post.id)), ...owned];
}

function creatorView(s) {
  const subscribed = viewerOf(s, s.session)?.subs[DEMO_USER.id];
  return {
    ...author(s),
    category: "Авторский блог",
    coverColor: "#E5E5E5",
    tiers: DEMO_TIERS,
    subscribed: subscribed?.tierId ?? null,
    subscribers: Object.values(s.viewer).filter((viewer) => viewer.subs[DEMO_USER.id]).length,
    postsCount: allPosts(s).length,
    isMe: s.session === DEMO_USER.id,
  };
}

function decorate(s, p) {
  const uid = s.session;
  const v = viewerOf(s, uid);
  const owner = author(s);
  const unlocked = p.visibility !== "paid" || (uid && (p.authorId === uid || v.subs[p.authorId]));
  return {
    id: p.id,
    authorId: p.authorId,
    author: { id: owner.id, username: owner.username, displayName: owner.displayName, color: owner.color },
    title: p.title,
    content: unlocked ? p.content : teaser(postContentText(p.content)),
    visibility: p.visibility,
    createdAt: p.createdAt,
    liked: !!v?.likes.includes(p.id),
    bookmarked: !!v?.bookmarks.includes(p.id),
    likes: (p.likes || 0) + (v?.likes.includes(p.id) ? 1 : 0),
    comments: (p.comments || 0) + (s.comments[p.id]?.length || 0),
    locked: !unlocked,
  };
}

function findPost(s, id) {
  const p = allPosts(s).find((x) => String(x.id) === String(id));
  if (!p) throw new ApiError("Публикация не найдена", 404);
  return p;
}

const matches = (text, q) => text.toLowerCase().includes(q.trim().toLowerCase());

export const mockApi = {
  auth: {
    async me() { await delay(120); const s = readDb(); return publicUser(s.users.find((u) => u.id === s.session)) || null; },
    async register({ email, username, password }) {
      await delay(350);
      return writeDb((s) => {
        const e = email.trim().toLowerCase();
        const un = username.trim();
        if (s.users.some((u) => u.email.toLowerCase() === e || u.username.toLowerCase() === un.toLowerCase())) {
          throw new ApiError("Email или username уже заняты", 409);
        }
        const user = { id: `u-${Date.now()}`, email: e, username: un, password, displayName: un, bio: "", color: colorFor(un), createdAt: new Date().toISOString() };
        s.users.push(user);
        s.session = user.id;
        return publicUser(user);
      });
    },
    async login({ username, password }) {
      await delay(300);
      return writeDb((s) => {
        const key = username.trim().toLowerCase();
        const user = s.users.find((u) => u.username.toLowerCase() === key || u.email.toLowerCase() === key);
        if (!user || user.password !== password) throw new ApiError("Неверный логин или пароль", 400);
        s.session = user.id;
        return publicUser(user);
      });
    },
    async logout() { await delay(100); writeDb((s) => { s.session = null; }); return null; },
  },

  posts: {
    async page({ offset = 0, limit = 12, signal } = {}) {
      signal?.throwIfAborted();
      await delay();
      signal?.throwIfAborted();
      const s = readDb();
      return allPosts(s).sort(byNewest).slice(offset, offset + limit).map((post) => decorate(s, post));
    },
    async list({ filter = "all", q = "" } = {}) {
      await delay();
      const s = readDb();
      const v = viewerOf(s, s.session);
      let items = allPosts(s);
      if (filter === "following") items = items.filter((p) => s.session && (p.authorId === s.session || v.subs[p.authorId]));
      if (filter === "public" || filter === "paid") items = items.filter((p) => p.visibility === filter);
      const posts = items.sort(byNewest).map((p) => decorate(s, p));
      return q.trim() ? posts.filter((p) => matches(`${p.title} ${postContentText(p.content)}`, q)) : posts;
    },
    async get(id) { await delay(); const s = readDb(); return decorate(s, findPost(s, id)); },
    async listByAuthor(authorId) {
      await delay();
      const s = readDb();
      return allPosts(s).filter((p) => p.authorId === authorId).sort(byNewest).map((p) => decorate(s, p));
    },
    async create({ title, content, visibility }) {
      await delay(400);
      return writeDb((s) => {
        const uid = requireAuthor(s);
        const post = { id: `p-${Date.now()}`, authorId: uid, title: title.trim(), content: content.trim(), visibility, createdAt: new Date().toISOString(), likes: 0, comments: 0 };
        s.posts.push(post);
        return decorate(s, post);
      });
    },
    async update(id, changes) {
      await delay(300);
      return writeDb((s) => {
        requireAuthor(s);
        const original = findPost(s, id);
        const post = {
          ...original,
          title: changes.title ?? original.title,
          content: changes.content ?? original.content,
          visibility: changes.visibility ?? original.visibility,
        };
        const index = s.posts.findIndex((saved) => saved.id === post.id);
        if (index === -1) s.posts.push(post);
        else s.posts[index] = post;
        return decorate(s, post);
      });
    },
    async toggleLike(id) {
      await delay(80);
      return writeDb((s) => {
        const v = viewerOf(s, requireUser(s));
        const p = findPost(s, id);
        v.likes = v.likes.includes(p.id) ? v.likes.filter((x) => x !== p.id) : [...v.likes, p.id];
        return decorate(s, p);
      });
    },
    async toggleBookmark(id) {
      await delay(80);
      return writeDb((s) => {
        const v = viewerOf(s, requireUser(s));
        const p = findPost(s, id);
        v.bookmarks = v.bookmarks.includes(p.id) ? v.bookmarks.filter((x) => x !== p.id) : [...v.bookmarks, p.id];
        return decorate(s, p);
      });
    },
    async listBookmarked() {
      await delay();
      const s = readDb();
      const v = viewerOf(s, requireUser(s));
      return allPosts(s).filter((p) => v.bookmarks.includes(p.id)).sort(byNewest).map((p) => decorate(s, p));
    },
    async comments(id) {
      await delay(150);
      const s = readDb();
      const p = findPost(s, id);
      return [...seedCommentsFor(p), ...(s.comments[p.id] || [])].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    },
    async addComment(id, text) {
      await delay(250);
      return writeDb((s) => {
        const uid = requireUser(s);
        const p = findPost(s, id);
        const u = s.users.find((x) => x.id === uid);
        const c = { id: `c-${Date.now()}`, postId: p.id, author: { id: u.id, username: u.username, displayName: u.displayName, color: u.color }, text: text.trim(), createdAt: new Date().toISOString() };
        (s.comments[p.id] ||= []).push(c);
        return c;
      });
    },
  },

  creators: {
    categories: async () => [],
    async list({ q = "", category = "" } = {}) {
      await delay();
      const s = readDb();
      const profile = creatorView(s);
      if (category && profile.category !== category) return [];
      return matches(`${profile.displayName} ${profile.username} ${profile.bio}`, q) ? [profile] : [];
    },
    async suggested() {
      await delay(150);
      return [creatorView(readDb())];
    },
    async get(username) {
      await delay();
      const s = readDb();
      const profile = creatorView(s);
      if (profile.username.toLowerCase() !== username.toLowerCase()) throw new ApiError("Автор не найден", 404);
      return profile;
    },
    async subscribe(creatorId, tierId) {
      await delay(500); // simulated payment
      return writeDb((s) => {
        const id = requireUser(s);
        if (creatorId !== DEMO_USER.id) throw new ApiError("Автор не найден", 404);
        if (id === creatorId) throw new ApiError("Нельзя оформить подписку на себя", 403);
        const v = viewerOf(s, id);
        if (!DEMO_TIERS.some((t) => t.id === tierId)) throw new ApiError("Уровень подписки не найден", 404);
        v.subs[creatorId] = { tierId, since: v.subs[creatorId]?.since || new Date().toISOString() };
        return creatorView(s);
      });
    },
    async unsubscribe(creatorId) {
      await delay(300);
      return writeDb((s) => {
        const v = viewerOf(s, requireUser(s));
        if (creatorId !== DEMO_USER.id) throw new ApiError("Автор не найден", 404);
        delete v.subs[creatorId];
        return creatorView(s);
      });
    },
    async listSubscriptions() {
      await delay();
      const s = readDb();
      const v = viewerOf(s, requireUser(s));
      const sub = v.subs[DEMO_USER.id];
      const tier = DEMO_TIERS.find((t) => t.id === sub?.tierId);
      return tier ? [{ creator: creatorView(s), tier, since: sub.since, status: "active" }] : [];
    },
  },

  profile: {
    async update({ displayName, bio }) {
      await delay(300);
      return writeDb((s) => {
        const u = s.users.find((x) => x.id === requireUser(s));
        u.displayName = displayName.trim() || u.username;
        u.bio = bio.trim();
        return publicUser(u);
      });
    },
  },
};
