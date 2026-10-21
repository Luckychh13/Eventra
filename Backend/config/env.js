
const validateEnv = () => {
  const errors = [];

  if (!process.env.MONGO_URI?.trim()) {
    errors.push("MONGO_URI is required.");
  }

  if (process.env.PORT !== undefined) {
    const port = Number(process.env.PORT);

    if (
      !Number.isInteger(port) ||
      port < 1 ||
      port > 65535
    ) {
      errors.push("PORT must be an integer between 1 and 65535.");
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `Invalid environment configuration:\n- ${errors.join("\n- ")}`
    );
  }
};

export default validateEnv;
