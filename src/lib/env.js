import { config } from 'dotenv';

export default function loadEnv() {
  const envFilePath = process.env.NODE_ENV ? `env.${process.env.NODE_ENV}` : '.env.development';

  config({ path: envFilePath });
}
