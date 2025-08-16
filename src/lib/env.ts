const ensureString = (value: string | undefined) => {
  if (value === undefined) {
    throw new Error("Environment variable is not defined");
  }
  return value;
};

export const databaseUrl = ensureString(process.env.DATABASE_URL);
