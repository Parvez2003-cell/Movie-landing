export function checkEnv() {
  const missing = [];
  if (!process.env.DB_HOST) missing.push('DB_HOST');
  if (!process.env.DB_PORT) missing.push('DB_PORT');
  if (!process.env.DB_USER) missing.push('DB_USER');
  if (!process.env.DB_PASSWORD) missing.push('DB_PASSWORD');
  if (!process.env.DB_NAME) missing.push('DB_NAME');
  if (!process.env.JWT_SECRET) missing.push('JWT_SECRET');
  return missing;
}
