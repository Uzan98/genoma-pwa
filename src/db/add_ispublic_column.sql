-- Verifica se a coluna já existe antes de adicionar
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Simulado' 
    AND COLUMN_NAME = 'isPublic'
)
BEGIN
    -- Adiciona a coluna isPublic com valor padrão false
    ALTER TABLE Simulado
    ADD isPublic BIT NOT NULL DEFAULT 0;

    PRINT 'Coluna isPublic adicionada com sucesso.';
END
ELSE
BEGIN
    PRINT 'Coluna isPublic já existe.';
END 