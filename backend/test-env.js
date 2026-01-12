import 'dotenv/config';

console.log({
  STRIPE: !!process.env.STRIPE_SECRET_KEY,
  MAPS: !!process.env.MAPS_API_KEY,
  DB: process.env.DB_NAME
});
