import "dotenv/config";
export const envs = {
  PORT: Number(process.env.PORT!),
  OPEN_IA_API_KEY: process.env.OPEN_IA_API_KEY!,
  MONGODB_URL: process.env.MONGODB_URL!,
};
