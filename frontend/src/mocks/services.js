// Simulated backend. Same method signatures as src/api/real/index.js, so the UI never knows the difference.
import { creators as seedCreators, posts as seedPosts, seedCommentsFor, CATEGORIES } from "./data.js";
import { readDb, writeDb, viewerOf } from "./db.js";
import { ApiError } from "../api/client.js";
import { teaser } from "../utils/format.js";

const delay = (ms = 220) => new Promise((r) => setTimeout(r, ms));
const COLORS = ["#111111", "#333333", "#555555", "#777777", "#FF7A24"];
const colorFor = (s) => COLORS[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % COLORS.length];
const byNewest = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);

const publicUser = (u) => u && ({ id: u.id, email: u.email, username: u.username, displayName: u.displayName, bio: u.bio, color: u.color });

function requireUser(s) {
  if (!s.session) throw new ApiError("Войдите в аккаунт, чтобы выполнить это действие", 401);
  return s.session;
}

function creatorBase(s, id) {
  const c = seedCreators.find((x) => x.id === id);
  if (c) return c;
  const u = s.users.find((x) => x.id === id);
  if (u) return { id: u.id, username: u.username, displayName: u.displayName, bio: u.bio, category: "Авторы", color: u.color, coverColor: "#E5E5E5", subscribers: 0, tiers: [], verified: false };
  return { id, username: "unknown", displayName: "Автор", bio: "", category: "Авторы", color: "#777777", coverColor: "#E5E5E5", subscribers: 0, tiers: [], verified: false };
}

const allPosts = (s) => [...seedPosts, ...s.posts];

function creatorView(s, base) {
  const v = viewerOf(s, s.session);
  const sub = v?.subs[base.id] || null;
  return {
    ...base,
    subscribed: sub ? sub.tierId : null,
    subscribers: base.subscribers + (sub ? 1 : 0),
    postsCount: allPosts(s).filter((p) => p.authorId === base.id).length,
    isMe: s.session === base.id,
  };
}

function decorate(s, p) {
  const uid = s.session;
  const v = viewerOf(s, uid);
  const author = creatorBase(s, p.authorId);
  const unlocked = p.visibility !== "paid" || (uid && (p.authorId === uid || v.subs[p.authorId]));
  return {
    id: p.id,
    authorId: p.authorId,
    author: { id: author.id, username: author.username, displayName: author.displayName, color: author.color, verified: !!author.verified },
    title: p.title,
    content: unlocked ? p.content : teaser(p.content),
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
    async list({ filter = "all", q = "" } = {}) {
      await delay();
      const s = readDb();
      const v = viewerOf(s, s.session);
      let items = allPosts(s);
      if (filter === "following") items = items.filter((p) => s.session && (p.authorId === s.session || v.subs[p.authorId]));
      if (filter === "public" || filter === "paid") items = items.filter((p) => p.visibility === filter);
      if (q.trim()) items = items.filter((p) => matches(`${p.title} ${p.content} ${creatorBase(s, p.authorId).displayName}`, q));
      return items.sort(byNewest).map((p) => decorate(s, p));
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
        const uid = requireUser(s);
        const post = { id: `p-${Date.now()}`, authorId: uid, title: title.trim(), content: content.trim(), visibility, createdAt: new Date().toISOString(), likes: 0, comments: 0 };
        s.posts.push(post);
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
    categories: async () => CATEGORIES,
    async list({ q = "", category = "" } = {}) {
      await delay();
      const s = readDb();
      let items = seedCreators;
      if (category) items = items.filter((c) => c.category === category);
      if (q.trim()) items = items.filter((c) => matches(`${c.displayName} ${c.username} ${c.bio} ${c.category}`, q));
      return items.map((c) => creatorView(s, c)).sort((a, b) => b.subscribers - a.subscribers);
    },
    async suggested() {
      await delay(150);
      const s = readDb();
      return seedCreators.map((c) => creatorView(s, c)).filter((c) => !c.subscribed).sort((a, b) => b.subscribers - a.subscribers).slice(0, 3);
    },
    async get(username) {
      await delay();
      const s = readDb();
      const key = username.toLowerCase();
      const base = seedCreators.find((c) => c.username === key) || s.users.map((u) => creatorBase(s, u.id)).find((c) => c.username.toLowerCase() === key);
      if (!base) throw new ApiError("Автор не найден", 404);
      return creatorView(s, base);
    },
    async subscribe(creatorId, tierId) {
      await delay(500); // simulated payment
      return writeDb((s) => {
        const v = viewerOf(s, requireUser(s));
        const base = creatorBase(s, creatorId);
        if (!base.tiers.some((t) => t.id === tierId)) throw new ApiError("Уровень подписки не найден", 404);
        v.subs[creatorId] = { tierId, since: v.subs[creatorId]?.since || new Date().toISOString() };
        return creatorView(s, base);
      });
    },
    async unsubscribe(creatorId) {
      await delay(300);
      return writeDb((s) => {
        const v = viewerOf(s, requireUser(s));
        delete v.subs[creatorId];
        return creatorView(s, creatorBase(s, creatorId));
      });
    },
    async listSubscriptions() {
      await delay();
      const s = readDb();
      const v = viewerOf(s, requireUser(s));
      return Object.entries(v.subs).map(([cid, sub]) => {
        const creator = creatorView(s, creatorBase(s, cid));
        const tier = creator.tiers.find((t) => t.id === sub.tierId);
        return { creator, tier, since: sub.since, status: "active" };
      });
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
