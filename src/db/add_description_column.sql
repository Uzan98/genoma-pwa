-- Verifica se a coluna já existe antes de adicionar
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Simulado' 
    AND COLUMN_NAME = 'description'
)
BEGIN
    -- Adiciona a coluna description
    ALTER TABLE Simulado
    ADD description NVARCHAR(1000) NOT NULL DEFAULT '';

    PRINT 'Coluna description adicionada com sucesso.';
END
ELSE
BEGIN
    PRINT 'Coluna description já existe.';
END 