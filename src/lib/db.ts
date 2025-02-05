import sql from 'mssql';

const config: sql.config = {
  server: 'genoma.database.windows.net',
  database: 'genoma study',
  authentication: {
    type: 'azure-active-directory-default',
    options: {
      clientId: process.env.AZURE_CLIENT_ID
    }
  },
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

let pool: sql.ConnectionPool | null = null;

export async function getConnection() {
  try {
    if (pool) {
      return pool;
    }
    
    pool = await new sql.ConnectionPool(config).connect();
    return pool;
  } catch (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    throw new Error('Erro ao conectar ao banco de dados');
  }
}

export async function query<T = sql.IRecordSet<any>>(queryString: string, params: any[] = []): Promise<T> {
  try {
    const pool = await getConnection();
    const request = pool.request();
    
    // Adiciona os parâmetros à query
    params.forEach((param, index) => {
      request.input(`P${index + 1}`, param);
    });
    
    const result = await request.query(queryString);
    return result.recordset as T;
  } catch (err) {
    console.error('Erro ao executar query:', err);
    throw new Error('Erro ao executar query');
  }
}

// Exemplo de uso:
// const result = await query<{ id: number, name: string }>('SELECT * FROM Users WHERE id = @param0', [1]); 