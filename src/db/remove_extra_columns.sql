-- Remove a coluna questions
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

-- Remove a coluna correct
IF EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Simulado' 
    AND COLUMN_NAME = 'correct'
)
BEGIN
    ALTER TABLE Simulado
    DROP COLUMN correct;
    PRINT 'Coluna correct removida com sucesso.';
END 