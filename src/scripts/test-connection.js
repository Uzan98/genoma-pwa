const sql = require('mssql');

const config = {
  server: 'genoma.database.windows.net',
  database: 'genoma study',
  authentication: {
    type: 'azure-active-directory-default',
    options: {
      clientId: 'dcaa0301-98af-429c-9a1d-91846a531a3f'
    }
  },
  options: {
    encrypt: true,
    trustServerCertificate: false,
    connectTimeout: 30000
  }
};

async function testConnection() {
  try {
    console.log('Tentando conectar ao banco de dados...');
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT @@VERSION');
    console.log('Conexão bem sucedida!');
    console.log('Versão do SQL Server:', result.recordset[0]['']);
    await pool.close();
  } catch (err) {
    console.error('Erro ao conectar:', err);
    if (err.code === 'ETIMEOUT') {
      console.log('\nPossíveis causas:');
      console.log('1. IP não liberado no firewall do Azure SQL');
      console.log('2. VPN ou proxy bloqueando a conexão');
      console.log('3. Problemas na rede');
    }
    if (err.message?.includes('Azure Active Directory')) {
      console.log('\nPossíveis causas:');
      console.log('1. Client ID incorreto');
      console.log('2. Permissões insuficientes no Azure AD');
      console.log('3. Token expirado ou inválido');
    }
  }
}

testConnection(); 