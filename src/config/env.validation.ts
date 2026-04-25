const requiredEnvironmentVariables = [
  'PORT',
  'MONGO_URI',
  'JWT_SECRET',
  'JWT_ISSUER',
  'ENCRYPTION_KEY',
] as const;

type RequiredEnvironmentVariable = (typeof requiredEnvironmentVariables)[number];

export const validateEnvironment = (environment: NodeJS.ProcessEnv): NodeJS.ProcessEnv => {
  requiredEnvironmentVariables.forEach((key: RequiredEnvironmentVariable) => {
    const value = environment[key];
    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  });

  const port = Number(environment.PORT);
  if (Number.isNaN(port) || port <= 0) {
    throw new Error('PORT must be a valid positive number');
  }

  return environment;
};
