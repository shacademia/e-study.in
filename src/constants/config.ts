export const config = {
  API_BASE_URL: "localhost:3000/api",
  TIMEOUT: 5000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  TOKEN_EXPIRY: '7d',
  DEFAULT_LANGUAGE: "en",
  MAX_UPLOAD_SIZE: 10485760, // 10 MB
} as const;

export type Config = (typeof config)[keyof typeof config];
