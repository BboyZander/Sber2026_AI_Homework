import { redirect } from "next/navigation";

/** Каталог переехал на Главную (маркетплейс). Оставляем редирект для старых ссылок. */
export default function TeenTasksPage() {
  redirect("/teen/dashboard");
}
