SELECT 
    c.name as 'Column Name',
    t.name as 'Data Type',
    c.max_length as 'Max Length',
    c.is_nullable as 'Is Nullable',
    CASE WHEN dc.definition IS NOT NULL THEN dc.definition ELSE '' END as 'Default Value'
FROM sys.columns c
INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
LEFT JOIN sys.default_constraints dc ON c.default_object_id = dc.object_id
WHERE OBJECT_NAME(c.object_id) = 'Simulado'
ORDER BY c.column_id; 