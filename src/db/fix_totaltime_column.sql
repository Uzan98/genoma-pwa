-- Verifica se a coluna existe antes de tentar remover
IF EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Simulado' 
    AND COLUMN_NAME = 'totalTime'
)
BEGIN
    -- Remove a coluna totalTime da tabela Simulado
    ALTER TABLE Simulado
    DROP COLUMN totalTime;

    PRINT 'Coluna totalTime removida com sucesso da tabela Simulado.';
END
ELSE
BEGIN
    PRINT 'Coluna totalTime não existe na tabela Simulado.';
END 