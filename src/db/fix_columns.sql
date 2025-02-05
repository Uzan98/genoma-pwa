-- Remove a coluna questions se existir
IF EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Simulado' 
    AND COLUMN_NAME = 'questions'
)
BEGIN
    ALTER TABLE Simulado
    DROP COLUMN questions;
    PRINT 'Coluna questions removida com sucesso.';
END

-- Remove outras colunas que não deveriam estar na tabela
DECLARE @sql NVARCHAR(MAX) = '';

-- Lista de colunas que devem existir na tabela
DECLARE @valid_columns TABLE (name NVARCHAR(255));
INSERT INTO @valid_columns (name) VALUES 
('id'),
('userId'),
('title'),
('description'),
('time'),
('isPublic'),
('createdAt'),
('updatedAt');

-- Encontra e remove colunas que não estão na lista de válidas
SELECT @sql = @sql + 
    'ALTER TABLE Simulado DROP COLUMN ' + c.name + ';' + CHAR(13)
FROM sys.columns c
WHERE OBJECT_NAME(c.object_id) = 'Simulado'
AND c.name NOT IN (SELECT name FROM @valid_columns);

IF @sql <> ''
BEGIN
    EXEC sp_executesql @sql;
    PRINT 'Colunas inválidas removidas com sucesso.';
END
ELSE
BEGIN
    PRINT 'Nenhuma coluna inválida encontrada.';
END 