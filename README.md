# NossaMentoria

Plataforma privada de mentoria para organizar relacionamentos entre mentores e mentorados, planos de aprendizado, aulas, materiais, sessões e progresso.

O MVP é gratuito e foi modelado para múltiplos mentores desde o início. Mentores e mentorados podem criar uma conta pública completa; somente o acesso administrativo permanece restrito a convites emitidos por administradores. A interface está em português e segue uma identidade visual clara, acolhedora e orientada a aprendizado.

## Estado atual

O frontend está funcional e pode ser executado localmente. Todas as rotas privadas exibem exclusivamente dados reais permitidos pelo Supabase. Quando ainda não existem relações, planos, materiais, sessões, notificações ou notas, a interface apresenta estados vazios equivalentes aos do futuro deploy; não há mais registros fictícios nem editores que simulam persistência local.

A integração com Supabase cobre autenticação, validação de convites, relacionamentos e leitura das áreas operacionais. O schema completo foi aplicado ao projeto Supabase em 21 de outubro de 2026 e validado pelas APIs de Auth, REST/RPC e Storage, sem depender de uma connection string PostgreSQL. As próximas implementações devem adicionar as mutações reais que ainda faltam, sem reintroduzir estado demonstrativo no navegador.

### Implementado

- Landing page pública e responsiva.
- Design system completo com os 14 componentes obrigatórios da Etapa 07 e gate automatizado.
- Logo NossaMentoria reutilizável e símbolo próprio aplicado à navegação, autenticação, workspace e metadados do navegador.
- Landing hero reutilizável, cartões compartilhados de material/sessão e indicador de progresso.
- Entradas animadas na landing, autenticação e dashboard com suporte a movimento reduzido.
- Cadastro guiado em quatro etapas, com nome, e-mail, senha e áreas de conhecimento; formação acadêmica obrigatória somente para mentores.
- LinkedIn e GitHub obrigatórios para mentores e opcionais para mentorados.
- Login unificado por e-mail e senha, confirmação de e-mail, recuperação e alteração de senha.
- Senhas armazenadas exclusivamente pelo Supabase Auth com bcrypt e salt aleatório por senha; nenhuma senha ou salt é copiado para tabelas públicas.
- Aceite de convite e callback de autenticação.
- Catálogo persistido com 15 áreas e 80 conhecimentos para especialidades de mentores e interesses de mentorados.
- Workspace privado com contexto de admin, mentor, mentorado e usuário misto.
- Layout privado compartilhado com navegação e troca de contexto por papel.
- Dashboard compacto com contagens reais de relações, planos, sessões e notificações via RLS.
- Dashboard com prioridades específicas de mentor e mentorado usando dados visíveis via RLS.
- Tela de relacionamentos alimentada pelo Supabase, sem mentores, planos, sessões ou pessoas fictícias.
- Planos, materiais, templates, calendário, notificações e notas carregados das tabelas e views reais, com estados vazios de produção.
- Ambiente local com as mesmas exigências de autenticação, configuração e papéis do deploy; não existe troca para papéis não atribuídos.
- Catálogo seguro de mentorados disponíveis para mentores e administradores, sem expor e-mail ou dados privados do perfil.
- Solicitação de mentoria e aceite ou recusa pelo mentorado persistidos no banco.
- Sincronização automática da disponibilidade do mentorado ao iniciar ou encerrar uma relação.
- Rotas operacionais separadas para administração, mentorias, planos, materiais e agenda.
- Regras tipadas de papéis, permissões, convites e relações mentor-mentorado.
- Ciclo real de relacionamento com solicitação, aceite, recusa e encerramento.
- Escolha de mentorados existentes e criação de convite por link associado a um e-mail.
- Prevenção de relações duplicadas.
- Leitura real de planos e progresso calculado pelas aulas persistidas.
- Biblioteca privada que respeita propriedade, relações e compartilhamentos via RLS.
- Dez templates globais de aula persistidos e exibidos diretamente do catálogo do banco.
- Leitura real de próximas sessões, histórico, notificações e notas visíveis para o usuário.
- Estrutura de banco pronta para anexos entre materiais, planos, aulas e sessões.
- Triggers e RPCs de domínio para ativação de plano, sessões, notificações e consistência dos vínculos.
- Vocabulário de domínio centralizado em `src/lib/domain-types.ts`.
- Schema Supabase aplicado com tabelas de domínio, perfis, formações acadêmicas, catálogo de conhecimentos, vínculos por usuário, cinco views, funções/RPCs, triggers, índices, RLS e bucket privado `materials`.
- Banco Supabase provisionado com 54 políticas de domínio, quatro políticas de Storage e todas as tabelas protegidas por RLS.
- Dez templates globais de aula persistidos no banco.
- RPC pública de validação de convite testada e leitura anônima de perfis bloqueada.
- Primeiro usuário administrador provisionado no Auth, em `profiles`, em `user_roles` e na metadata usada pela interface atual.
- Sessão autenticada, leitura protegida por RLS e RPC administrativa validadas com o primeiro administrador.
- Criação de convites reais pela área administrativa, com link de uso único retornado apenas na criação.
- Revogação administrativa protegida no servidor e correção do trigger compartilhado aplicada e validada no Supabase.
- Endpoint operacional `/api/health`, cabeçalhos globais de segurança e configuração fail-closed em produção.
- Validação automatizada de ambiente, build, bundle público, rotas, sessão administrativa e RLS anônima.
- Runbook de custo zero e modelos reutilizáveis para releases e incidentes.

### Ainda não implementado

- Criação e edição reais de planos, materiais, aulas, sessões, notas e notificações — as telas atuais são somente leitura onde a mutação ainda não foi ligada.
- Testes das políticas RLS com usuários reais de admin, mentor e mentorado.
- Ligação dos formulários e painéis restantes às tabelas e RPCs reais.
- SMTP próprio e templates de e-mail com a identidade NossaMentoria.
- Upload real de arquivos para o Supabase Storage.
- Envio de notificações por e-mail.
- Operações administrativas completas.
- Deploy e observabilidade de produção.
- Projeto Vercel, variáveis de Preview/Production e smoke test nas URLs publicadas.
- Reavaliação da hospedagem caso o projeto deixe de ser filantrópico e não comercial, pois o Vercel Hobby não permite uso comercial.

## Tecnologias

- Next.js com App Router.
- React.
- TypeScript em modo estrito.
- CSS Modules e tokens globais de design.
- Framer Motion para movimentos das páginas públicas.
- Lucide React para ícones.
- Supabase SSR e Supabase JS em uso na autenticação, autorização, consultas e convites.

## Rotas disponíveis

| Rota | Descrição |
| --- | --- |
| `/` | Landing page pública. |
| `/login` | Login unificado por e-mail e senha. |
| `/register` | Cadastro público completo para mentor e mentorado; aceita também token de convite. |
| `/forgot-password` | Solicitação segura de recuperação de senha. |
| `/update-password` | Definição da nova senha após validar o link de recuperação. |
| `/invite/[token]` | Validação e aceite de convite. |
| `/auth/callback` | Callback de autenticação do Supabase. |
| `/api/health` | Estado operacional e de configuração, sem retornar segredos. |
| `/app` | Dashboard privado com contagens reais e atalhos por papel. |
| `/app/admin` | Resumo real de usuários, papéis e convites para administradores. |
| `/app/relationships` | Relações reais, mentorados disponíveis, solicitações, aceite e acompanhamento. |
| `/app/plans` | Planos, aulas e progresso. |
| `/app/materials` | Biblioteca de materiais e organização de aulas. |
| `/app/calendar` | Agenda, sessões, notificações e notas. |

`/app` sempre exige configuração válida do Supabase e um usuário autenticado, tanto localmente quanto no deploy.

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

O seletor de contexto mostra apenas papéis realmente atribuídos ao usuário no Supabase. Para revisar as experiências de Admin, Mentor e Mentorado, use contas reais de cada papel; o ambiente local segue a mesma regra do deploy.

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

Uma connection string PostgreSQL não é necessária para executar a aplicação. Os clientes atuais usam a URL do projeto com a chave pública no navegador/SSR e a service role apenas no servidor.

As RPCs `validate_invitation_token` e `accept_invitation_token` já existem no Supabase. A primeira foi validada também pela API REST com a chave pública.

## Banco Supabase

O projeto Supabase configurado já recebeu:

- enums e tabelas de perfis, papéis, convites, relações, planos, aulas, materiais, sessões, notas e notificações;
- tabelas de formações acadêmicas, áreas, conhecimentos e seleções de especialidade ou interesse;
- catálogo inicial com 15 áreas e 80 conhecimentos ativos;
- vínculos explícitos de materiais com planos, aulas e sessões;
- views para relações detalhadas, progresso, próximas sessões, compartilhamentos e notificações não lidas;
- RPCs para convites, catálogo seguro de mentorados, solicitação e resposta de mentoria, ativação de plano, cópia de templates, sessões e notificações;
- triggers de consistência, datas de atualização e notificações internas;
- políticas RLS para admin, mentor, mentorado e usuários com papéis combinados;
- bucket privado `materials`, limitado a 50 MB por arquivo e organizado por proprietário.

Os arquivos operacionais `.sql` são mantidos apenas localmente e ignorados pelo Git. Para reproduzir o banco em outro projeto, gere e armazene um export privado do schema antes de fazer a migração. Nunca inclua senhas, connection strings ou chaves secretas nesses artefatos.

Em **Authentication > URL Configuration**, configure:

- Site URL local: `http://localhost:3000`;
- Redirect URL local: `http://localhost:3000/auth/callback`;
- as URLs equivalentes de produção quando o domínio estiver definido.

O login é único para todos os papéis e usa e-mail e senha. Mentor e mentorado podem se cadastrar publicamente, precisam confirmar o endereço de e-mail e só então conseguem entrar. Administradores continuam restritos a convites emitidos por outro administrador.

As senhas ficam exclusivamente no Supabase Auth. O serviço aplica bcrypt com um salt aleatório por senha e salva apenas o resultado necessário à autenticação em `auth.users`; o projeto não cria colunas públicas de senha, hash ou salt. O salt impede que duas senhas iguais gerem hashes iguais, mas não impede usuários de escolherem a mesma senha.

O administrador original, criado antes da migração para senha, deve usar **Esqueci minha senha** uma vez para definir a própria senha. Em uma instalação nova, o primeiro administrador pode ser promovido manualmente depois de confirmar o e-mail:

```sql
insert into public.user_roles (user_id, role)
values ('UUID_DO_USUARIO', 'admin')
on conflict (user_id, role) do nothing;
```

Mantenha `public.hook_require_pending_invitation` configurada em **Authentication > Hooks > Before User Created**. Apesar do nome histórico, a função agora valida o cadastro completo de mentor e mentorado e bloqueia a criação de administradores sem convite administrativo válido, inclusive quando alguém tenta chamar a API de autenticação fora da interface do projeto.

Para a confirmação de e-mail e recuperação de senha funcionarem com usuários reais, configure um SMTP próprio em **Authentication > SMTP Settings**. O remetente padrão do Supabase é limitado e não deve ser usado em produção; é possível manter custo zero usando a franquia gratuita de um provedor SMTP compatível.

Nunca envie nem exponha a `SUPABASE_SERVICE_ROLE_KEY` no navegador ou em repositórios. Salve-a somente em `.env.local` e nas variáveis secretas do ambiente de deploy.

## Validação do projeto

Execute a verificação do TypeScript:

```powershell
npm run typecheck
```

Valide os componentes, tokens e regras de movimento da identidade visual:

```powershell
npm run check:design
```

Valide somente as variáveis obrigatórias:

```powershell
npm run check:env
```

Execute o gate completo de release — ambiente, TypeScript, build e inspeção do bundle público:

```powershell
npm run check
```

Com a aplicação rodando, execute o smoke test local:

```powershell
npm run qa:smoke
```

Para testar a sessão administrativa, RLS e convites sem enviar e-mail:

```powershell
npm run qa:auth
```

O último teste cria um convite técnico identificado, confirma sua revogação no banco e remove o registro ao final.

Para validar cadastro completo, materialização do perfil e login por senha sem enviar e-mail:

```powershell
npm run qa:registration
```

Esse teste cria uma conta descartável já confirmada, verifica papel, formação e especialidade e remove o usuário ao final.

## Estrutura principal

```text
src/
  app/                  Rotas do Next.js e páginas públicas/privadas
  components/app/       Componentes do workspace
  components/marketing/ Componentes da landing e autenticação
  components/ui/        Componentes visuais compartilhados
  lib/                  Regras, tipos canônicos de domínio e clientes Supabase
public/brand/            Símbolo e ativos públicos da identidade NossaMentoria
scripts/                Gates de ambiente, segurança e QA operacional
operations/             Modelos de registro de release e incidente
plan/                   Especificações funcionais e visuais
kanban.html             Estado de implementação de cada especificação
prompt-design.md        Referência original de movimento e interação
AGENT.md                Regras de execução e atualização do projeto
```

## Direção de produto e design

- MVP gratuito, privado e sem pagamentos.
- Cadastro público para mentor e mentorado; contas administrativas somente por convite de outro administrador.
- Suporte a admin, mentor, mentorado e usuários com papéis combinados.
- Superfícies claras e quentes, com Sora em títulos e Inter na interface operacional.
- Landing e onboarding mais expressivos; workspace compacto e orientado a tarefas.
- Materiais privados por padrão e compartilhados somente por vínculo explícito.
- HTML enviado por mentores nunca deve executar dentro do contexto privilegiado do aplicativo.

## Controle do projeto

As especificações vivem em `plan/`. O estado de cada uma é mantido em `kanban.html`, seguindo os estados `To Do`, `In Development`, `In Tests` e `Done`.

Até o momento, estão concluídas as etapas de fundação, domínio e permissões, ciclo de mentoria, conteúdo/aulas, calendário/comunicação e o roadmap da Etapa 05. A Etapa 07 consolidou a identidade visual, os componentes compartilhados, as telas por papel e as regras de movimento. Na Etapa 06, o panorama operacional e o runbook pós-lançamento estão concluídos; o deploy permanece adiado. As telas privadas agora representam o estado real do banco, enquanto a criação e edição persistentes de planos, materiais, aulas, sessões e notas continuam como bloqueadores explícitos de lançamento.
