import * as sql from 'mssql';
import type { SqlQueryResult } from '@/app/estudos/flashcards/types';

const config: sql.config = {
  server: process.env.AZURE_SQL_HOST || '',
  database: process.env.AZURE_SQL_DATABASE || '',
  authentication: {
    type: 'azure-active-directory-default',
    options: {
      clientId: process.env.AZURE_CLIENT_ID
    }
  },
  options: {
    encrypt: true,
    trustServerCertificate: false,
    enableArithAbort: true,
    connectTimeout: 15000, // 15 segundos
    requestTimeout: 15000  // 15 segundos
  },
  pool: {
    max: 10,
    min: 1,
    idleTimeoutMillis: 30000
  }
};

let pool: sql.ConnectionPool | null = null;

async function connectWithRetry(retries = 3, delay = 2000): Promise<sql.ConnectionPool> {
  try {
    if (!pool) {
      pool = await new sql.ConnectionPool(config).connect();
      console.log('Pool de conexões estabelecido com sucesso');
    }
    return pool;
  } catch (error) {
    if (retries > 0) {
      console.log(`Tentativa de conexão falhou. Tentando novamente em ${delay/1000} segundos...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return connectWithRetry(retries - 1, delay);
    }
    console.error('Todas as tentativas de conexão falharam:', error);
    throw error;
  }
}

// Cache em memória para queries frequentes
const queryCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export const db = {
  getDb: async () => connectWithRetry(),
  
  query: async <T = any>(queryString: string, params: any[] = []): Promise<SqlQueryResult<T>> => {
    const cacheKey = `${queryString}-${JSON.stringify(params)}`;
    const cached = queryCache.get(cacheKey);
    
    // Verifica se tem cache válido
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    
    const pool = await connectWithRetry();
    const request = pool.request();
    
    // Adiciona os parâmetros à query
    params.forEach((param, index) => {
      request.input(`P${index + 1}`, param);
    });
    
    try {
      console.time('query-execution');
      const result = await request.query<T>(queryString);
      console.timeEnd('query-execution');
      
      // Armazena no cache
      queryCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      
      return result as SqlQueryResult<T>;
    } catch (error) {
      console.error('Erro na execução da query:', error);
      throw error;
    }
  },

  // Método para limpar o cache quando necessário
  clearCache: () => {
    queryCache.clear();
  }
}; 