require('dotenv').config();
const sql = require('mssql');
const fs = require('fs');
const path = require('path');

const config = {
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

async function executeScript() {
  try {
    console.log('Conectando ao banco de dados...');
    const pool = await sql.connect(config);
    console.log('Conexão estabelecida com sucesso!');

    // Lista de scripts para executar
    const scripts = [
      'check_user.sql',
      'insert_test_user.sql',
      'check_columns.sql',
      'check_alternative.sql',
      'remove_extra_columns.sql',
      'fix_columns.sql',
      'add_ispublic_column.sql',
      'add_time_column.sql',
      'add_description_column.sql',
      'fix_score_column.sql',
      'fix_totaltime_column.sql'
    ];

    // Executa cada script
    for (const scriptName of scripts) {
      console.log(`\nExecutando ${scriptName}...`);
      const scriptPath = path.join(__dirname, '..', 'db', scriptName);
      const sqlScript = fs.readFileSync(scriptPath, 'utf8');
      
      const result = await pool.request().query(sqlScript);
      console.log(`${scriptName} executado com sucesso!`);
      console.log('Resultado:', result);
    }

    await pool.close();
    console.log('\nConexão fechada.');
  } catch (err) {
    console.error('Erro ao executar script:', err);
  }
}

executeScript(); 