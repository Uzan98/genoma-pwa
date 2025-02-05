-- Verifica a estrutura da tabela Alternative
SELECT 
    c.name as 'Column Name',
    t.name as 'Data Type',
    c.max_length as 'Max Length',
    c.is_nullable as 'Is Nullable',
    CASE WHEN dc.definition IS NOT NULL THEN dc.definition ELSE '' END as 'Default Value'
FROM sys.columns c
INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
LEFT JOIN sys.default_constraints dc ON c.default_object_id = dc.object_id
WHERE OBJECT_NAME(c.object_id) = 'Alternative'
ORDER BY c.column_id;

-- Lista todas as chaves estrangeiras da tabela Alternative
SELECT 
    OBJECT_NAME(f.parent_object_id) AS TableName,
    COL_NAME(fc.parent_object_id, fc.parent_column_id) AS ColumnName,
    OBJECT_NAME (f.referenced_object_id) AS ReferenceTableName,
    COL_NAME(fc.referenced_object_id, fc.referenced_column_id) AS ReferenceColumnName
FROM sys.foreign_keys AS f
INNER JOIN sys.foreign_key_columns AS fc
    ON f.object_id = fc.constraint_object_id
WHERE OBJECT_NAME(f.parent_object_id) = 'Alternative';

-- Lista todas as alternativas
SELECT * FROM Alternative; 