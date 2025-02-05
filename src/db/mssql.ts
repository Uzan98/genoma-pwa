import * as mssql from 'mssql';

const config: mssql.config = {
  server: process.env.DB_SERVER || '',
  database: process.env.DB_NAME || '',
  authentication: {
    type: 'azure-active-directory-default',
    options: {
      clientId: process.env.AZURE_CLIENT_ID
    }
  },
  options: {
    encrypt: true,
    trustServerCertificate: false,
  },
};

let pool: mssql.ConnectionPool | null = null;

export async function getPool(): Promise<mssql.ConnectionPool> {
  if (!pool) {
    pool = await new mssql.ConnectionPool(config).connect();
  }
  return pool;
}

export { mssql }; 