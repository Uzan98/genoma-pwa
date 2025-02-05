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

async function createExamIndexes() {
  try {
    console.log('Conectando ao banco de dados...');
    const pool = await sql.connect(config);
    console.log('Conexão estabelecida com sucesso!');

    // Verifica se os índices já existem
    const checkIndexes = await pool.request().query(`
      SELECT name 
      FROM sys.indexes 
      WHERE name IN (
        'IX_Exam_UserProgress',
        'IX_Question_SimuladoComposite',
        'IX_Answer_QuestionComposite',
        'IX_UserAnswer_Composite'
      )
    `);

    if (checkIndexes.recordset.length < 4) {
      console.log('Criando índices...');
      
      // Índice para Exams (Simulados)
      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Exam_UserProgress')
        CREATE NONCLUSTERED INDEX IX_Exam_UserProgress 
        ON Exam(userId, status) 
        INCLUDE (title, totalQuestions, completedQuestions, score)
        WITH (ONLINE = OFF);
      `);
      console.log('Índice de Simulados criado!');

      // Índice para Questions (Questões)
      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Question_SimuladoComposite')
        CREATE NONCLUSTERED INDEX IX_Question_SimuladoComposite 
        ON Question(simuladoId) 
        INCLUDE (statement, correctAlternative)
        WITH (ONLINE = OFF);
      `);
      console.log('Índice de Questões criado!');

      // Índice para Answers (Alternativas)
      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Answer_QuestionComposite')
        CREATE NONCLUSTERED INDEX IX_Answer_QuestionComposite 
        ON Answer(questionId) 
        INCLUDE (selectedAlternative, isCorrect)
        WITH (ONLINE = OFF);
      `);
      console.log('Índice de Alternativas criado!');

      // Índice para UserAnswers (Respostas do Usuário)
      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_UserAnswer_Composite')
        CREATE NONCLUSTERED INDEX IX_UserAnswer_Composite 
        ON UserAnswer(userId, questionId) 
        INCLUDE (answerId, isCorrect, answeredAt)
        WITH (ONLINE = OFF);
      `);
      console.log('Índice de Respostas do Usuário criado!');

      // Atualiza estatísticas
      await pool.request().query(`
        UPDATE STATISTICS Exam WITH FULLSCAN;
        UPDATE STATISTICS Question WITH FULLSCAN;
        UPDATE STATISTICS Answer WITH FULLSCAN;
        UPDATE STATISTICS UserAnswer WITH FULLSCAN;
      `);
      console.log('Estatísticas atualizadas!');
    } else {
      console.log('Todos os índices já existem!');
    }

    await pool.close();
    console.log('Operação concluída com sucesso!');
  } catch (err) {
    console.error('Erro:', err);
  }
}

createExamIndexes(); 