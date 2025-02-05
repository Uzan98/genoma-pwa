-- Verifica se a coluna já existe antes de adicionar
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Simulado' 
    AND COLUMN_NAME = 'time'
)
BEGIN
    -- Adiciona a coluna time com valor padrão de 60 minutos
    ALTER TABLE Simulado
    ADD time INT NOT NULL DEFAULT 60;

    PRINT 'Coluna time adicionada com sucesso.';
END
ELSE
BEGIN
    PRINT 'Coluna time já existe.';
END 