-- Tabela de Usuários
CREATE TABLE [User] (
  id NVARCHAR(255) PRIMARY KEY,
  name NVARCHAR(255) NOT NULL,
  email NVARCHAR(255) UNIQUE NOT NULL,
  password NVARCHAR(255) NOT NULL,
  createdAt DATETIME2 DEFAULT GETDATE(),
  updatedAt DATETIME2
);

-- Registro de Horas de Estudo
CREATE TABLE StudyHour (
  id NVARCHAR(255) PRIMARY KEY,
  userId NVARCHAR(255) NOT NULL,
  date DATETIME2 NOT NULL,
  hours FLOAT NOT NULL,
  subject NVARCHAR(255) NOT NULL,
  createdAt DATETIME2 DEFAULT GETDATE(),
  FOREIGN KEY (userId) REFERENCES [User](id)
);

-- Simulados
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

-- Questões do Simulado
CREATE TABLE Question (
  id NVARCHAR(255) PRIMARY KEY,
  simuladoId NVARCHAR(255) NOT NULL,
  statement NVARCHAR(2000) NOT NULL,
  correctAlternative INT NOT NULL,
  createdAt DATETIME2 DEFAULT GETDATE(),
  updatedAt DATETIME2,
  FOREIGN KEY (simuladoId) REFERENCES Simulado(id) ON DELETE CASCADE
);

-- Alternativas da Questão
CREATE TABLE Alternative (
  id NVARCHAR(255) PRIMARY KEY,
  questionId NVARCHAR(255) NOT NULL,
  text NVARCHAR(1000) NOT NULL,
  createdAt DATETIME2 DEFAULT GETDATE(),
  updatedAt DATETIME2,
  FOREIGN KEY (questionId) REFERENCES Question(id) ON DELETE CASCADE
);

-- Tentativas de Simulado
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

-- Respostas das Questões
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