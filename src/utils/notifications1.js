// src/utils/notifications.js
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
}

export function showBrowserNotification(alert) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const body = `${alert.msg}`;
  const notification = new Notification(`Alerte: ${alert.code}`, { 
    body,
    icon: '/vite.svg'
  });
  notification.onclick = () => {
    window.focus();
    window.location.href = '/mainlayout/alerts';
  };
}