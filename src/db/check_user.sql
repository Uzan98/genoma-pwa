-- Verifica a estrutura da tabela User
SELECT 
    c.name as 'Column Name',
    t.name as 'Data Type',
    c.max_length as 'Max Length',
    c.is_nullable as 'Is Nullable',
    CASE WHEN dc.definition IS NOT NULL THEN dc.definition ELSE '' END as 'Default Value'
FROM sys.columns c
INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
LEFT JOIN sys.default_constraints dc ON c.default_object_id = dc.object_id
WHERE OBJECT_NAME(c.object_id) = 'User'
ORDER BY c.column_id;

-- Verifica se a tabela User existe
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'User')
BEGIN
    -- Cria a tabela User se não existir
    CREATE TABLE [User] (
        id NVARCHAR(255) PRIMARY KEY,
        name NVARCHAR(255) NOT NULL,
        email NVARCHAR(255) UNIQUE NOT NULL,
        createdAt DATETIME2 DEFAULT GETDATE(),
        updatedAt DATETIME2
    );
    PRINT 'Tabela User criada.';
END
ELSE
BEGIN
    PRINT 'Tabela User já existe.';
END

-- Lista todos os usuários
SELECT * FROM [User]; 