import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export interface Config {
  PORT: number;
  API_ID: number;
  API_HASH: string;
  PHONE: string;
  GROQ_API_KEY: string;
  GROQ_MODEL: string;
  MONGO_URI: string;
  AUTO_REPLY_CONTACTS: boolean;
  AUTO_REPLY_UNKNOWN: boolean;
  MIN_DELAY: number;
  MAX_DELAY: number;
  TELEGRAM_CLIENT_PORT: number;
  TELEGRAM_CLIENT_HOST: string;
  BACKEND_URL: string;
}

const getRequiredEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is required but was not provided.`);
  }
  return value;
};

const getOptionalEnv = (name: string, defaultValue: string): string => {
  return process.env[name] || defaultValue;
};

const getBooleanEnv = (name: string, defaultValue: boolean): boolean => {
  const value = process.env[name];
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === "true";
};

const getNumberEnv = (name: string, defaultValue: number): number => {
  const value = process.env[name];
  if (value === undefined) return defaultValue;
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

// Validate that required credentials exist before booting
export const config: Config = {
  PORT: getNumberEnv("PORT", 5000),
  API_ID: Number(getRequiredEnv("API_ID")),
  API_HASH: getRequiredEnv("API_HASH"),
  PHONE: getRequiredEnv("PHONE"),
  GROQ_API_KEY: getRequiredEnv("GROQ_API_KEY"),
  GROQ_MODEL: getOptionalEnv("GROQ_MODEL", "llama-3.3-70b-versatile"),
  MONGO_URI: getOptionalEnv("MONGO_URI", "mongodb://localhost:27017/telegram_assistant"),
  AUTO_REPLY_CONTACTS: getBooleanEnv("AUTO_REPLY_CONTACTS", false),
  AUTO_REPLY_UNKNOWN: getBooleanEnv("AUTO_REPLY_UNKNOWN", true),
  MIN_DELAY: getNumberEnv("MIN_DELAY", 5),
  MAX_DELAY: getNumberEnv("MAX_DELAY", 15),
  TELEGRAM_CLIENT_PORT: getNumberEnv("TELEGRAM_CLIENT_PORT", 5001),
  TELEGRAM_CLIENT_HOST: getOptionalEnv("TELEGRAM_CLIENT_HOST", "localhost"),
  BACKEND_URL: getOptionalEnv("BACKEND_URL", "http://localhost:5000"),
};
