# NossaMentoria

Plataforma privada de mentoria para organizar relacionamentos entre mentores e mentorados, planos de aprendizado, aulas, materiais, sessões e progresso.

O MVP é gratuito, funciona somente por convite e foi modelado para múltiplos mentores desde o início. A interface está em português e segue uma identidade visual clara, acolhedora e orientada a aprendizado.

## Estado atual

O frontend está funcional e pode ser executado localmente. Os fluxos privados usam dados de demonstração e estado local do React; portanto, mudanças feitas na interface são perdidas ao recarregar a página.

A integração base com Supabase já existe para autenticação, validação de convites e storage, mas a criação do banco, migrations, políticas RLS, RPCs e persistência dos fluxos será feita no final do desenvolvimento das interfaces.

### Implementado

- Landing page pública e responsiva.
- Login, aceite de convite e callback de autenticação.
- Workspace privado com contexto de admin, mentor, mentorado e usuário misto.
- Regras tipadas de papéis, permissões, convites e relações mentor-mentorado.
- Ciclo de mentoria, da conexão à conclusão ou pausa do plano.
- Escolha de mentorados existentes e convite por e-mail.
- Prevenção de relações duplicadas.
- Editor de plano com rascunho, ativação e validação dos campos obrigatórios.
- Dez templates de aulas que geram cópias editáveis no plano.
- Progresso calculado a partir de aulas, sessões, notas e próximas ações.
- Biblioteca privada de materiais com busca e filtros.
- Suporte de interface para HTML, PDF, apresentações, Markdown, texto, imagens, URLs e repositórios.
- Cadastro local de arquivos e links com metadados, tags e categoria.
- Regra de prévia isolada para arquivos HTML.
- Anexos explícitos entre materiais, planos, aulas e sessões.
- Criação manual e reordenação de aulas.
- Visões específicas de materiais e aulas compartilhados com o mentorado.
- Registro de sessões com conteúdo aplicado, notas e próximas ações.
- Atualização automática da aula vinculada ao concluir uma sessão.
- Agenda semanal com próximas sessões, histórico e visibilidade por papel.
- Agendamento rápido com sessão confirmada ou proposta ao mentorado.
- Confirmação, reagendamento, conclusão, cancelamento e registro de falta.
- Preservação da criação, das notas e da aula vinculada ao reagendar.
- Central de notificações internas com contagem de não lidas e vínculos navegáveis.
- Notificações automáticas de agendamento, reagendamento, conclusão e notas compartilhadas.
- Notas de comunicação ligadas à relação, ao plano, à aula ou à sessão.
- Separação entre notas privadas do mentor, notas compartilhadas, notas do mentorado, próximas ações e resumos.

### Ainda não implementado

- Persistência real no Supabase.
- Schema e migrations do banco.
- Políticas RLS.
- RPCs reais para criação e aceite de convites.
- Upload real de arquivos para o Supabase Storage.
- Envio de notificações por e-mail.
- Operações administrativas completas.
- Deploy e observabilidade de produção.

## Tecnologias

- Next.js com App Router.
- React.
- TypeScript em modo estrito.
- CSS Modules e tokens globais de design.
- Framer Motion para movimentos das páginas públicas.
- Lucide React para ícones.
- Supabase SSR e Supabase JS preparados para a integração final.

## Rotas disponíveis

| Rota | Descrição |
| --- | --- |
| `/` | Landing page pública. |
| `/login` | Entrada para usuários convidados. |
| `/invite/[token]` | Validação e aceite de convite. |
| `/invite/demo-token` | Prévia local da experiência de convite. |
| `/auth/callback` | Callback de autenticação do Supabase. |
| `/app` | Workspace com domínio, lifecycle, conteúdo, aulas, calendário e comunicação. |

Quando as variáveis do Supabase não estão configuradas, `/app` funciona como uma prévia local e mostra um aviso de configuração. Quando elas estão configuradas, a rota exige um usuário autenticado.

## Como executar localmente

Pré-requisitos:

- Node.js recente.
- npm.

No PowerShell, entre na pasta do projeto:

```powershell
cd C:\Users\Kauai\Desktop\Trampo\nossamentoria
```

Instale as dependências:

```powershell
npm install
```

Inicie o servidor de desenvolvimento:

```powershell
npm run dev
```

Abra `http://localhost:3000` no navegador. Para visualizar diretamente o workspace, use `http://localhost:3000/app`.

Se a porta 3000 estiver ocupada:

```powershell
npx next dev --port 3001
```

## Configuração opcional do Supabase

O frontend pode ser visualizado sem Supabase. Para testar a infraestrutura de autenticação existente, copie `.env.example` para `.env.local` e preencha:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

`SUPABASE_SERVICE_ROLE_KEY` é uma credencial exclusiva de servidor e nunca deve ser exposta em componentes cliente ou enviada ao navegador.

As RPCs `validate_invitation_token` e `accept_invitation_token` precisarão existir no Supabase para o fluxo real de convites funcionar.

## Validação do projeto

Execute a verificação do TypeScript:

```powershell
npm run typecheck
```

Gere o build de produção:

```powershell
npm run build
```

## Estrutura principal

```text
src/
  app/                  Rotas do Next.js e páginas públicas/privadas
  components/app/       Componentes do workspace
  components/marketing/ Componentes da landing e autenticação
  components/ui/        Componentes visuais compartilhados
  lib/                  Regras de domínio e clientes Supabase
plan/                   Especificações funcionais e visuais
kanban.html             Estado de implementação de cada especificação
prompt-design.md        Referência original de movimento e interação
AGENT.md                Regras de execução e atualização do projeto
```

## Direção de produto e design

- MVP gratuito, privado e sem pagamentos.
- Contas criadas somente por convite.
- Suporte a admin, mentor, mentorado e usuários com papéis combinados.
- Superfícies claras e quentes, com Sora em títulos e Inter na interface operacional.
- Landing e onboarding mais expressivos; workspace compacto e orientado a tarefas.
- Materiais privados por padrão e compartilhados somente por vínculo explícito.
- HTML enviado por mentores nunca deve executar dentro do contexto privilegiado do aplicativo.

## Controle do projeto

As especificações vivem em `plan/`. O estado de cada uma é mantido em `kanban.html`, seguindo os estados `To Do`, `In Development`, `In Tests` e `Done`.

Até o momento, estão concluídas as etapas de fundação, domínio e permissões, ciclo de mentoria, conteúdo/aulas e calendário/comunicação. O próximo conjunto planejado é a consolidação do roadmap técnico e da estrutura do MVP.
