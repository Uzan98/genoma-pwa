require('dotenv').config();
const sql = require('mssql');

const config = {
  server: process.env.AZURE_SQL_HOST,
  database: process.env.AZURE_SQL_DATABASE,
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

async function checkTables() {
  try {
    console.log('Conectando ao banco de dados...');
    const pool = await sql.connect(config);
    console.log('Conexão estabelecida com sucesso!');

    const result = await pool.request().query(`
      SELECT 
        t.name AS TableName,
        c.name AS ColumnName,
        ty.name AS DataType,
        c.max_length AS MaxLength,
        c.is_nullable AS IsNullable
      FROM sys.tables t
      INNER JOIN sys.columns c ON t.object_id = c.object_id
      INNER JOIN sys.types ty ON c.user_type_id = ty.user_type_id
      WHERE t.name IN ('Exam', 'Question', 'Answer', 'UserAnswer')
      ORDER BY t.name, c.column_id;
    `);

    console.log('\nEstrutura das Tabelas:');
    console.log(JSON.stringify(result.recordset, null, 2));

    await pool.close();
  } catch (err) {
    console.error('Erro:', err);
  }
}

checkTables(); 