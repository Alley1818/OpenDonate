import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { EmptyState } from "../components/States.jsx";

export default function NotFound() {
  return <EmptyState icon={Compass} title="Страница не найдена" text="Такой страницы нет или она была перемещена." action={<Link className="btn btn-primary" to="/">На главную</Link>} />;
}
