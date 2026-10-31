// Maps backend (snake_case) payloads to the shapes the UI uses. Keep ALL backend-shape knowledge here.
const COLORS = ["#111111", "#333333", "#555555", "#777777", "#FF7A24"];
const colorFor = (s = "") => COLORS[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % COLORS.length];

export function userFromApi(raw, fallbackUsername = "user") {
  const username = raw?.username || fallbackUsername;
  return {
    id: raw?.id ?? username,
    email: raw?.email || "",
    username,
    displayName: raw?.display_name || username,
    bio: raw?.bio || "",
    color: colorFor(username),
  };
}

export function postFromApi(raw) {
  const authorId = raw.author_id;
  const username = raw.author?.username || `user${authorId}`;
  return {
    id: raw.id,
    authorId,
    author: {
      id: authorId,
      username,
      displayName: raw.author?.display_name || `Автор #${authorId}`,
      color: colorFor(username),
      verified: false,
    },
    title: raw.title,
    content: raw.content,
    visibility: raw.visibility,
    createdAt: raw.created_at,
    liked: false,
    bookmarked: false,
    likes: 0,
    comments: 0,
    locked: false,
  };
}
