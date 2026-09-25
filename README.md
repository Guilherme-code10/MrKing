# 👑 Mr.King — Moda de Gente Grande

Site desenvolvido para a **Mr.King**, loja de moda masculina plus size, com catálogo online, integração com WhatsApp, painel administrativo e recursos de provador virtual.

## 🚀 Recursos

- Catálogo de produtos online
- Integração com WhatsApp
- Painel administrativo com autenticação
- Cadastro, edição e exclusão de produtos
- Upload de imagens para o Supabase Storage
- Controle de produtos publicados
- Registro de leads e eventos do site
- Solicitações de provador virtual
- Upload privado da foto do cliente
- Acompanhamento das solicitações pelo painel
- Layout responsivo

## 🛠️ Tecnologias

- HTML5
- CSS3
- JavaScript
- Supabase
  - Database
  - Authentication
  - Storage
  - Row Level Security (RLS)
- Git e GitHub
- Cloudflare Pages

## 🧱 Arquitetura atual

O frontend é composto por HTML, CSS e JavaScript e pode ser publicado como site estático.

O Supabase é utilizado para:

- armazenar os produtos;
- autenticar o usuário do painel;
- armazenar imagens dos produtos;
- registrar leads e eventos;
- armazenar solicitações do provador;
- manter as fotos enviadas pelos clientes em bucket privado.

### Provador

Na versão atual, o cliente seleciona uma peça, envia uma foto e informa o WhatsApp. A solicitação é registrada no Supabase para atendimento pelo painel administrativo.

Os arquivos `provador.js` e `tryon-service.js` também mantêm uma implementação de demonstração no navegador. O repositório atual **não possui** uma função `functions/api/tryon.js` nem depende de `FAL_KEY` para o fluxo publicado.

## 🗄️ Banco de dados

Os arquivos SQL do projeto são:

- `supabase-schema.sql` — produtos, leads, eventos e Storage dos produtos;
- `tryon-requests.sql` — solicitações do provador e bucket privado para fotos dos clientes.

## 🔐 Segurança

A chave presente em `config.js` é a chave pública/publishable do Supabase e é utilizada pelo navegador. Chaves secretas, como `service_role`, nunca devem ser colocadas no frontend.

As políticas RLS devem ser revisadas antes de uso em produção. Em especial, permissões administrativas não devem ser concedidas genericamente a qualquer usuário autenticado.

## 🌐 Publicação

O frontend pode ser hospedado no Cloudflare Pages ou em outro serviço de hospedagem estática.

## ⚠️ Privacidade

O projeto pode armazenar WhatsApp e fotos enviadas pelos clientes. Antes do uso em produção, é importante disponibilizar uma política de privacidade adequada e definir regras de retenção e exclusão desses dados.

## 👨‍💻 Autor

**Guilherme Augusto Morais**

- GitHub: https://github.com/Guilherme-code10
- LinkedIn: https://www.linkedin.com/in/guilherme-augusto-morais/
