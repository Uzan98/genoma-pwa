-- Verifica se a coluna existe antes de tentar remover
IF EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Simulado' 
    AND COLUMN_NAME = 'score'
)
BEGIN
    -- Remove a coluna score da tabela Simulado
    ALTER TABLE Simulado
    DROP COLUMN score;

    PRINT 'Coluna score removida com sucesso da tabela Simulado.';
END
ELSE
BEGIN
    PRINT 'Coluna score não existe na tabela Simulado.';
END 