export namespace ConfigNotifications {
  export const subject2fa: string = 'Verificatión code';
  export const subjectValidation: string = 'Validate your account'
  export const subjectPost: string = 'Welcome to UrbanNav system';
  export const subjectPqrs: string = 'New PQRS';
  export const subjectPqrsUser: string = 'Your PQRS has been created';

  export const emailValidation: string = 'http://localhost:4200/security/hash-validation-public-user';

  export const urlEmail: string ='http://localhost:8081/Notifications/send-email';
  export const urlSMS: string = 'http://localhost:8081/Notifications/send-sms';
}
