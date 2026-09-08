# Mr.King V6 — Site online

Esta versão mantém o design do V5 e troca o painel `localStorage` por **Supabase**.

## Arquitetura

- Frontend: HTML/CSS/JS, pronto para Cloudflare Pages.
- Banco e autenticação: Supabase.
- Fotos dos produtos: Supabase Storage.
- Provador: função `functions/api/tryon.js`, com `FAL_KEY` somente no servidor.
- Leads: tabela `leads`.
- Eventos: tabela `site_events`.

## Configuração do Supabase

1. Crie um projeto no Supabase.
2. Em Authentication > Providers, habilite Email.
3. Crie o usuário administrador e, se possível, desative o cadastro público.
4. Abra SQL Editor e execute `supabase-schema.sql`.
5. Em Project Settings > API, copie a **Project URL** e a chave **anon/public**.
6. Cole essas duas informações em `config.js`.
7. Nunca coloque `service_role` ou `FAL_KEY` em `config.js`.

## Publicação

O projeto pode ser publicado no Cloudflare Pages como site estático. Não é necessário manter o computador ligado.

## Provador

A função `functions/api/tryon.js` espera `FAL_KEY` como variável secreta no ambiente do Cloudflare. O navegador não recebe essa chave.

## Importante sobre o modelo de IA

O provador V5 foi preparado para um serviço externo de Virtual Try-On. A implementação local CatVTON usada apenas para testes não faz parte da arquitetura comercial final.

## Dados e privacidade

O site registra eventos básicos e, quando o cliente informa o WhatsApp após usar o provador, registra um lead. A loja deve publicar uma política de privacidade adequada antes do uso em produção.
