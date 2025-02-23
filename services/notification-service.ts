interface NotificationPayload {
  to: string
  subject: string
  body: string
}

export async function sendEmail(payload: NotificationPayload) {
  // בפועל, כאן תהיה קריאה לשירות שליחת מיילים כמו SendGrid או Amazon SES
  console.log("Sending email:", payload)
  // לדוגמה בלבד:
  // return axios.post('https://api.sendgrid.com/v3/mail/send', payload)
}

export async function sendWhatsApp(payload: NotificationPayload) {
  // בפועל, כאן תהיה קריאה ל-API של WhatsApp Business
  console.log("Sending WhatsApp message:", payload)
  // לדוגמה בלבד:
  // return axios.post('https://graph.facebook.com/v13.0/YOUR_PHONE_NUMBER_ID/messages', payload)
}

