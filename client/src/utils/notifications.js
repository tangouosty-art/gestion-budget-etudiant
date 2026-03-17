export async function requestBrowserNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  if (Notification.permission === "denied") {
    return "denied";
  }

  return Notification.requestPermission();
}

export function sendNotificationOnce(key, title, body) {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }

  if (Notification.permission !== "granted") {
    return false;
  }

  const storageKey = `notif_${key}`;

  if (localStorage.getItem(storageKey)) {
    return false;
  }

  new Notification(title, { body });
  localStorage.setItem(storageKey, new Date().toISOString());

  return true;
}