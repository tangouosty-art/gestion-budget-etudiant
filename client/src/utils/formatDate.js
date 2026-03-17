export function formatDate(value) {
  if (!value) return "Non définie";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("fr-FR").format(date);
}