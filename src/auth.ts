// TODO: Implementar autenticação real com Auth0
export async function auth() {
  // Por enquanto, retorna um usuário mockado
  return {
    user: {
      id: '1',
      name: 'Usuário Teste',
      email: 'teste@example.com',
    },
  };
} 