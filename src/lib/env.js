import { config } from 'dotenv';

export default function loadEnv() {
  config({ path: `.env.${process.env.NODE_ENV}` || '.env.development' });
}
