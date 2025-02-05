# Genoma PWA

Plataforma de estudos inteligente com simulados, flashcards e comunidade.

## Tecnologias

- Next.js 14
- TypeScript
- TailwindCSS
- SQL Server
- React Query
- Shadcn/UI

## Pré-requisitos

- Node.js 18+
- NPM 8+
- SQL Server (Azure)

## Configuração

1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/genoma-pwa.git
cd genoma-pwa
```

2. Instale as dependências
```bash
npm install
```

3. Configure as variáveis de ambiente
```bash
cp .env.example .env
```

4. Execute o projeto em desenvolvimento
```bash
npm run dev
```

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria a build de produção
- `npm run start` - Inicia o servidor de produção
- `npm run lint` - Executa o linter
- `npm run db:check` - Verifica as tabelas do banco
- `npm run db:create` - Cria as tabelas do banco

## Estrutura do Projeto

```
src/
  ├── app/           # Rotas e páginas
  ├── components/    # Componentes React
  ├── hooks/         # Custom hooks
  ├── lib/          # Utilitários e configurações
  ├── providers/    # Providers React
  └── db/           # Configuração do banco de dados
```

## Deploy

O projeto está configurado para deploy na Vercel com integração contínua.
