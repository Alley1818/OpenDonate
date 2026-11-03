
import { request, notSupported } from "../client.js";
import { postFromApi, userFromApi } from "../mappers.js";

const byDate = (a, b) =>
  new Date(b.createdAt) - new Date(a.createdAt);

// Получение и фильтрация публикаций
async function listPosts({ filter = "all", q = "" } = {}) {
  const raw = await request("/posts");

  if (!Array.isArray(raw)) {
    throw new Error("Некорректный ответ API: ожидался массив публикаций");
  }

  let items = raw.map(postFromApi).sort(byDate);

  if (filter === "public" || filter === "paid") {
    items = items.filter((post) => post.visibility === filter);
  }

  const search = q.trim().toLowerCase();

  if (search) {
    items = items.filter((post) =>
      `${post.title} ${post.content}`.toLowerCase().includes(search)
    );
  }

  return items;
}

export const realApi = {
  // Авторизация
  auth: {
    async register(data) {
      await request("/users/register", {
        method: "POST",
        body: {
          email: data.email,
          username: data.username,
          password: data.password,
        },
      });

      // После регистрации выполняем вход
      return realApi.auth.login({
        username: data.username,
        password: data.password,
      });
    },

    async login({ username, password }) {
      const response = await request("/users/login", {
        method: "POST",
        body: {
          username,
          password,
        },
      });

      // Backend устанавливает JWT в HttpOnly Cookie
      // Поэтому access_token из localStorage не нужен
      return userFromApi(response.user || response, username);
    },

    async logout() {
      await request("/users/logout", {
        method: "POST",
      });

      return null;
    },

    async me() {
      try {
        const response = await request("/users/me");

        if (!response || !response.id) {
          throw new Error("Некорректный ответ при получении пользователя");
        }

        return userFromApi(response);
      } catch (error) {
        if (error.status === 401) {
          return null;
        }

        throw error;
      }
    },
  },

  // Публикации
  posts: {
    list: listPosts,

    async get(id) {
      const response = await request(`/posts/${id}`);
      return postFromApi(response);
    },

    async create({ title, content, visibility }) {
      const response = await request("/posts", {
        method: "POST",
        body: {
          title,
          content,
          visibility,
        },
      });

      return postFromApi(response);
    },

    async listByAuthor(authorId) {
      const posts = await listPosts();

      return posts.filter(
        (post) => String(post.authorId) === String(authorId)
      );
    },

    toggleLike: notSupported("Лайки"),
    toggleBookmark: notSupported("Закладки"),
    listBookmarked: notSupported("Сохранённое"),
    comments: notSupported("Комментарии"),
    addComment: notSupported("Комментарии"),
  },

  // Авторы
  creators: {
    list: notSupported("Каталог авторов"),

    categories: async () => [],

    suggested: async () => [],

    async get(username) {
      const response = await request(
        `/creators/${encodeURIComponent(username)}`
      );

      return userFromApi(response, username);
    },

    subscribe: notSupported("Подписки"),
    unsubscribe: notSupported("Подписки"),
    listSubscriptions: notSupported("Подписки"),
  },

  // Профиль
  profile: {
    update: notSupported("Редактирование профиля"),
  },
};
