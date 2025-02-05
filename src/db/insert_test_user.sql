-- Verifica se o usuário já existe
IF NOT EXISTS (
    SELECT * FROM [User] 
    WHERE id = '1'
)
BEGIN
    -- Insere o usuário de teste
    INSERT INTO [User] (id, name, email, password, createdAt, updatedAt)
    VALUES (
        '1',
        'Usuário Teste',
        'teste@example.com',
        'senha123', -- Em produção, usar hash da senha
        GETDATE(),
        GETDATE()
    );
    PRINT 'Usuário de teste criado com sucesso.';
END
ELSE
BEGIN
    PRINT 'Usuário de teste já existe.';
END 