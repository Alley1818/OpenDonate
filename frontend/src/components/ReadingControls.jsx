import { Moon, Sun } from "lucide-react";
import { isDarkTheme, usePreferences } from "../hooks/usePreferences.js";

export function ReadingSizeButton() {
  const [preferences, update] = usePreferences();
  const large = preferences.readingSize === "large";
  return (
    <button
      type="button"
      className="btn btn-secondary btn-sm reading-size-button"
      aria-label="Крупный текст"
      aria-pressed={large}
      title="Размер текста статьи"
      onClick={() => update({ readingSize: large ? "normal" : "large" })}
    >
      <span aria-hidden="true">Аа</span>
    </button>
  );
}

export function ReadingSizeOptions() {
  const [preferences, update] = usePreferences();
  return (
    <div className="reading-size-options" role="group" aria-label="Размер текста статьи">
      <button type="button" className="btn btn-secondary btn-sm" aria-pressed={preferences.readingSize !== "large"} onClick={() => update({ readingSize: "normal" })}>Обычный</button>
      <button type="button" className="btn btn-secondary btn-sm" aria-pressed={preferences.readingSize === "large"} onClick={() => update({ readingSize: "large" })}>Крупный</button>
    </div>
  );
}

export function ThemeButton() {
  const [preferences, update] = usePreferences();
  const dark = isDarkTheme(preferences);
  const Icon = dark ? Sun : Moon;
  return (
    <button
      type="button"
      className="icon-btn theme-button"
      aria-label="Тёмная тема"
      aria-pressed={dark}
      title={dark ? "Светлая тема" : "Тёмная тема"}
      onClick={() => update({ theme: dark ? "light" : "dark" })}
    >
      <Icon size={19} aria-hidden="true" />
    </button>
  );
}

export default function ReadingControls() {
  return (
    <section className="side-card reading-controls">
      <h2>Настройки чтения</h2>
      <div className="reading-control-row">
        <span>Размер текста</span>
        <ReadingSizeButton />
      </div>
      <div className="reading-control-row">
        <span>Тёмная тема</span>
        <ThemeButton />
      </div>
    </section>
  );
}
