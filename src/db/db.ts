import { Connection, Request, ConnectionConfiguration, TYPES } from 'tedious';

const config: ConnectionConfiguration = {
  server: 'genoma.database.windows.net',
  authentication: {
    type: 'azure-active-directory-default',
    options: {
      clientId: process.env.AZURE_CLIENT_ID
    }
  },
  options: {
    database: 'genoma study',
    encrypt: true,
    trustServerCertificate: false
  }
};

export async function query<T = any>(sqlQuery: string, params: any[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const connection = new Connection(config);
    const results: any[] = [];

    connection.on('connect', (err) => {
      if (err) {
        reject(err);
        return;
      }

      const request = new Request(sqlQuery, (err, rowCount) => {
        if (err) {
          reject(err);
          return;
        }
        connection.close();
        resolve(results);
      });

      params.forEach((param, index) => {
        request.addParameter(`P${index + 1}`, getParamType(param), param);
      });

      request.on('row', (columns) => {
        const row: any = {};
        columns.forEach((column: any) => {
          row[column.metadata.colName] = column.value;
        });
        results.push(row);
      });

      connection.execSql(request);
    });

    connection.connect();
  });
}

function getParamType(param: any) {
  switch (typeof param) {
    case 'string':
      return TYPES.NVarChar;
    case 'number':
      return TYPES.Int;
    case 'boolean':
      return TYPES.Bit;
    case 'object':
      if (param instanceof Date) {
        return TYPES.DateTime;
      }
      return TYPES.NVarChar;
    default:
      return TYPES.NVarChar;
  }
} 