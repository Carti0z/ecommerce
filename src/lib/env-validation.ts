// Environment variable validation
const requiredEnvVars = [
  "DATABASE_URL",
  "AUTH_SECRET",
  "NEXTAUTH_URL",
  "APP_URL",
]

const optionalEnvVars = [
  "PAYMENT_PROVIDER_SECRET_KEY",
  "PAYMENT_PROVIDER_PUBLIC_KEY",
  "PAYMENT_WEBHOOK_SECRET",
  "CRYPTO_PROVIDER_API_KEY",
  "CRYPTO_WEBHOOK_SECRET",
  "EMAIL_PROVIDER_API_KEY",
  "OBJECT_STORAGE_ENDPOINT",
  "OBJECT_STORAGE_ACCESS_KEY",
  "OBJECT_STORAGE_SECRET_KEY",
  "REDIS_URL",
]

export function validateEnv() {
  const missing: string[] = []
  const warnings: string[] = []

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar)
    }
  }

  for (const envVar of optionalEnvVars) {
    if (!process.env[envVar]) {
      warnings.push(envVar)
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    )
  }

  if (warnings.length > 0 && process.env.NODE_ENV === "production") {
    console.warn(
      `Warning: Optional environment variables not set: ${warnings.join(", ")}`
    )
  }

  return {
    missing,
    warnings,
  }
}

// Validate on import if in production
if (process.env.NODE_ENV === "production") {
  validateEnv()
}
