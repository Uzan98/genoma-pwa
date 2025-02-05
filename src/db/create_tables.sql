-- Simulados
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Simulado')
BEGIN
  CREATE TABLE Simulado (
    id NVARCHAR(255) PRIMARY KEY,
    userId NVARCHAR(255) NOT NULL,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(1000) NOT NULL,
    time INT NOT NULL,
    isPublic BIT DEFAULT 0,
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2,
    FOREIGN KEY (userId) REFERENCES [User](id)
  );
  PRINT 'Tabela Simulado criada.';
END
ELSE
BEGIN
  PRINT 'Tabela Simulado já existe.';
END

-- Questões do Simulado
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Question')
BEGIN
  CREATE TABLE Question (
    id NVARCHAR(255) PRIMARY KEY,
    simuladoId NVARCHAR(255) NOT NULL,
    statement NVARCHAR(2000) NOT NULL,
    correctAlternative INT NOT NULL,
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2,
    FOREIGN KEY (simuladoId) REFERENCES Simulado(id) ON DELETE CASCADE
  );
  PRINT 'Tabela Question criada.';
END
ELSE
BEGIN
  PRINT 'Tabela Question já existe.';
END

-- Alternativas da Questão
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Alternative')
BEGIN
  CREATE TABLE Alternative (
    id NVARCHAR(255) PRIMARY KEY,
    questionId NVARCHAR(255) NOT NULL,
    text NVARCHAR(1000) NOT NULL,
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2,
    FOREIGN KEY (questionId) REFERENCES Question(id) ON DELETE CASCADE
  );
  PRINT 'Tabela Alternative criada.';
END
ELSE
BEGIN
  PRINT 'Tabela Alternative já existe.';
END

-- Tentativas de Simulado
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SimuladoAttempt')
BEGIN
  CREATE TABLE SimuladoAttempt (
    id NVARCHAR(255) PRIMARY KEY,
    userId NVARCHAR(255) NOT NULL,
    simuladoId NVARCHAR(255) NOT NULL,
    startedAt DATETIME2 DEFAULT GETDATE(),
    finishedAt DATETIME2,
    score FLOAT,
    FOREIGN KEY (userId) REFERENCES [User](id),
    FOREIGN KEY (simuladoId) REFERENCES Simulado(id)
  );
  PRINT 'Tabela SimuladoAttempt criada.';
END
ELSE
BEGIN
  PRINT 'Tabela SimuladoAttempt já existe.';
END

-- Respostas das Questões
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Answer')
BEGIN
  CREATE TABLE Answer (
    id NVARCHAR(255) PRIMARY KEY,
    attemptId NVARCHAR(255) NOT NULL,
    questionId NVARCHAR(255) NOT NULL,
    selectedAlternative INT NOT NULL,
    isCorrect BIT NOT NULL,
    createdAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (attemptId) REFERENCES SimuladoAttempt(id),
    FOREIGN KEY (questionId) REFERENCES Question(id)
  );
  PRINT 'Tabela Answer criada.';
END
ELSE
BEGIN
  PRINT 'Tabela Answer já existe.';
END 