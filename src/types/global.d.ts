/// <reference types="vite/client" />

// Vite environment variables
interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_DATABASE_URL: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  readonly NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID?: string
  readonly NEXT_PUBLIC_WHATSAPP_ACCESS_TOKEN?: string
  readonly WHATSAPP_WEBHOOK_VERIFY_TOKEN?: string
  readonly NEXT_PUBLIC_TWILIO_ACCOUNT_SID?: string
  readonly NEXT_PUBLIC_TWILIO_AUTH_TOKEN?: string
  readonly NEXT_PUBLIC_TWILIO_WHATSAPP_NUMBER?: string
  readonly NEXT_PUBLIC_APP_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
