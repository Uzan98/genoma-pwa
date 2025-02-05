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

async function createExamTables() {
  try {
    console.log('Conectando ao banco de dados...');
    const pool = await sql.connect(config);
    console.log('Conexão estabelecida com sucesso!');

    // Cria a tabela Exam (Simulados)
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Exam')
      BEGIN
        CREATE TABLE Exam (
          id NVARCHAR(255) PRIMARY KEY,
          userId NVARCHAR(255) NOT NULL,
          title NVARCHAR(255) NOT NULL,
          description NVARCHAR(MAX),
          totalQuestions INT NOT NULL DEFAULT 0,
          completedQuestions INT NOT NULL DEFAULT 0,
          score FLOAT NOT NULL DEFAULT 0,
          status NVARCHAR(20) NOT NULL DEFAULT 'not_started',
          createdAt DATETIME NOT NULL DEFAULT GETDATE(),
          updatedAt DATETIME NOT NULL DEFAULT GETDATE()
        );

        CREATE INDEX IX_Exam_UserId ON Exam(userId);
      END
    `);
    console.log('Tabela Exam criada!');

    // Cria a tabela Question (Questões)
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Question')
      BEGIN
        CREATE TABLE Question (
          id NVARCHAR(255) PRIMARY KEY,
          examId NVARCHAR(255) NOT NULL,
          statement NVARCHAR(MAX) NOT NULL,
          explanation NVARCHAR(MAX),
          difficulty INT NOT NULL DEFAULT 1,
          orderNumber INT NOT NULL,
          createdAt DATETIME NOT NULL DEFAULT GETDATE(),
          updatedAt DATETIME NOT NULL DEFAULT GETDATE(),
          FOREIGN KEY (examId) REFERENCES Exam(id) ON DELETE CASCADE
        );

        CREATE INDEX IX_Question_ExamId ON Question(examId);
      END
    `);
    console.log('Tabela Question criada!');

    // Cria a tabela Answer (Alternativas)
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Answer')
      BEGIN
        CREATE TABLE Answer (
          id NVARCHAR(255) PRIMARY KEY,
          questionId NVARCHAR(255) NOT NULL,
          text NVARCHAR(MAX) NOT NULL,
          isCorrect BIT NOT NULL DEFAULT 0,
          orderNumber INT NOT NULL,
          createdAt DATETIME NOT NULL DEFAULT GETDATE(),
          updatedAt DATETIME NOT NULL DEFAULT GETDATE(),
          FOREIGN KEY (questionId) REFERENCES Question(id) ON DELETE CASCADE
        );

        CREATE INDEX IX_Answer_QuestionId ON Answer(questionId);
      END
    `);
    console.log('Tabela Answer criada!');

    // Cria a tabela UserAnswer (Respostas do Usuário)
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'UserAnswer')
      BEGIN
        CREATE TABLE UserAnswer (
          id NVARCHAR(255) PRIMARY KEY,
          userId NVARCHAR(255) NOT NULL,
          questionId NVARCHAR(255) NOT NULL,
          answerId NVARCHAR(255) NOT NULL,
          isCorrect BIT NOT NULL DEFAULT 0,
          answeredAt DATETIME NOT NULL DEFAULT GETDATE(),
          FOREIGN KEY (questionId) REFERENCES Question(id) ON DELETE CASCADE,
          FOREIGN KEY (answerId) REFERENCES Answer(id)
        );

        CREATE INDEX IX_UserAnswer_UserId ON UserAnswer(userId);
        CREATE INDEX IX_UserAnswer_QuestionId ON UserAnswer(questionId);
      END
    `);
    console.log('Tabela UserAnswer criada!');

    await pool.close();
    console.log('Todas as tabelas foram criadas com sucesso!');
  } catch (err) {
    console.error('Erro:', err);
  }
}

createExamTables(); 