interface DatabaseConfig {
  host: string;
  database: string;
  user: string;
  password: string;
  port: number;
  ssl: boolean;
}

const config: DatabaseConfig = {
  host: process.env.AZURE_SQL_HOST || '',
  database: process.env.AZURE_SQL_DATABASE || '',
  user: process.env.AZURE_SQL_USER || '',
  password: process.env.AZURE_SQL_PASSWORD || '',
  port: Number(process.env.AZURE_SQL_PORT) || 1433,
  ssl: true,
};

export default config; 