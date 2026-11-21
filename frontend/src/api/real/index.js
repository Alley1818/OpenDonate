import { AUTHOR_USERNAME, isAuthor } from "../config.js";
import { ApiError, request } from "../client.js";
import { userFromApi } from "../mappers.js";
import { posts } from "./posts.js";

async function me() {
  try {
    return userFromApi(await request("/users/me"));
  } catch (error) {
    if (error.status === 401) return null;
    throw error;
  }
}

async function openSession(path, body) {
  await request(path, { method: "POST", body });
  const user = await me();
  if (!user) throw new ApiError("Сессия не открылась. Проверьте адрес API и настройки cookie.", 401);
  return user;
}

async function getProfile(username, signal) {
  const result = await request(`/creators/${encodeURIComponent(username)}`, { signal });
  return userFromApi(result, username);
}

export const realApi = {
  auth: {
    me,
    register: ({ email, username, password }) =>
      openSession("/users/register", { email: email.trim(), username: username.trim(), password }),
    login: ({ username, password }) =>
      openSession("/users/login", { username: username.trim(), password }),
    async logout() {
      await request("/users/logout", { method: "POST" });
      if (await me()) throw new ApiError("Сервер не завершил сессию. Вы всё ещё в аккаунте.", 502);
    },
  },

  posts,

  creators: {
    async get(username) {
      const profile = await getProfile(username);
      if (!isAuthor(profile.id)) throw new ApiError("Профиль автора не найден.", 404);
      return profile;
    },

    async author(signal) {
      if (AUTHOR_USERNAME) {
        const profile = await getProfile(AUTHOR_USERNAME, signal);
        if (isAuthor(profile.id)) return profile;
        throw new ApiError("VITE_AUTHOR_USERNAME должен указывать на аккаунт автора.", 404);
      }

      // Without a configured username, resolve the owner from the publication metadata.
      const limit = 12;
      for (let offset = 0; !signal?.aborted; offset += limit) {
        const entries = await posts.page({ offset, limit, signal });
        const latest = entries.find((post) => isAuthor(post.authorId));
        if (latest) return latest.author;
        if (entries.length < limit) break;
      }
      return null;
    },
  },

  profile: {
    async update({ displayName, bio, avatarUrl, websiteUrl }) {
      await request("/creators/me", {
        method: "PATCH",
        body: {
          display_name: displayName.trim(),
          bio: bio.trim() || null,
          avatar_url: avatarUrl?.trim() || null,
          website_url: websiteUrl?.trim() || null,
        },
      });
      const user = await me();
      if (!user) throw new ApiError("Войдите в аккаунт, чтобы продолжить.", 401);
      return user;
    },
  },
};
