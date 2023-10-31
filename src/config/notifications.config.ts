export namespace ConfigNotifications {
  export const subject2fa: string = 'Verificatión code';
  export const subjectPost: string = 'Welcome to UrbanNav system';
  export const urlPostNotification: string =
    'http://localhost:8081/Notifications/welcome-email';
  export const urlNotifications2fa: string =
    'http://localhost:8081/Notifications/2fa-email';
  export const urlNotificationsSms: string =
    'http://localhost:8081/Notifications/send-sms';
}
