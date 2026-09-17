# Taylor Tech — Sistema de Gestão + Vitrine de Orçamentos

Sistema completo para assistência técnica de celulares e computadores:
vitrine pública para orçamento (PWA) + painel administrativo (SPA) +
API em Node.js/Express com banco de dados MySQL.

## Estrutura de pastas

```
taylor-tech-sistema/
├── backend/
│   ├── package.json
│   ├── .env.example
│   ├── database/
│   │   ├── schema.sql        # CREATE TABLE de todas as tabelas
│   │   └── seed.sql          # Catálogo real de peças (Apple, Samsung, Motorola, Xiaomi)
│   └── src/
│       ├── server.js         # Ponto de entrada (Express)
│       ├── config/db.js      # Pool de conexão MySQL
│       ├── data/margens.js   # Regras de precificação (custo + margem)
│       ├── controllers/      # Regras de negócio de cada módulo
│       └── routes/           # Rotas REST (/api/...)
└── frontend/
    ├── index.html            # Vitrine pública (landing page de orçamento)
    ├── admin.html            # Painel administrativo (SPA)
    ├── manifest.json         # PWA
    ├── sw.js                 # Service worker (PWA)
    └── assets/
        ├── css/ (base.css, client.css, admin.css)
        ├── js/  (api.js, client.js, admin.js)
        └── icons/icon.svg
```

## Como o preço final é calculado

O preço mostrado ao cliente **nunca** é gravado no banco. Ele é calculado
em tempo real por `preco_custo (estoque) + margem da categoria`:

| Categoria da peça          | Margem somada |
|-----------------------------|---------------|
| Bateria                     | + R$ 120,00   |
| Tela LCD / Incell / Vivid    | + R$ 150,00   |
| Tela OLED / Soft OLED / Premium | + R$ 200,00 |
| Tampa Traseira (iPhone)      | + R$ 300,00   |

Essa regra está centralizada em `backend/src/data/margens.js`. Alterar os
valores ali reflete automaticamente em toda a vitrine e no painel.

O catálogo (`backend/database/seed.sql`) já vem populado com custos reais
de peças de Apple, Samsung, Motorola e Xiaomi, extraídos das tabelas de
fornecedor fornecidas (telas, baterias e tampas). Ajuste os custos e o
estoque diretamente na tela **Estoque** do painel administrativo, ou
editando o `seed.sql`.

## Regra de negócio: fechamento de OS

Ao clicar em **Concluir** numa Ordem de Serviço (`PUT /api/ordens/:id/concluir`),
o backend executa em uma única transação MySQL:

1. Altera o status da OS para `concluido`;
2. Subtrai 1 da tabela `estoque` referente à peça usada (`peca_id`);
3. Insere uma linha em `financeiro` com o valor cobrado, o custo da peça
   e o lucro real (`valor_cobrado - preco_custo`).

Se qualquer etapa falhar (ex.: peça sem estoque), toda a transação é
revertida (`ROLLBACK`) e nada é alterado.

## Login e Equipe (permissões por funcionário)

O painel administrativo exige login (`/login.html`). Cada pessoa da
equipe tem um `cargo` e uma lista de módulos liberados:

- **Dono**: acesso total, sempre — ignora a lista de permissões.
- Qualquer outro cargo (Gerente, Tecnico, Atendente, ou outro nome
  livre): só vê e só acessa (mesmo via API) os módulos marcados na
  tela **Equipe** (`ordens`, `financeiro`, `estoque`, `clientes`, `equipe`).

Login inicial (criado pelo `seed_usuarios.sql`):

```
E-mail: admin@taylortech.com
Senha:  TaylorTech@123
```

Troque essa senha (ou crie seu próprio usuário Dono e desative o
padrão) na tela **Equipe** assim que o sistema estiver no ar.

## Pré-requisitos

- [Node.js](https://nodejs.org) 18 ou superior
- [MySQL](https://dev.mysql.com/downloads/) 8 ou superior (ou MariaDB compatível)

## Passo a passo — Mac ou Windows

### 1. Instale o MySQL (se ainda não tiver)

- **Mac:** `brew install mysql && brew services start mysql`
- **Windows:** instale o [MySQL Installer](https://dev.mysql.com/downloads/installer/) e inicie o serviço "MySQL80".

### 2. Crie o banco e as tabelas

No terminal (Mac) ou no "MySQL Command Line Client" / `cmd` (Windows), dentro
da pasta `backend/database`:

```bash
mysql -u root -p < schema.sql
mysql -u root -p taylor_tech < seed.sql
mysql -u root -p taylor_tech < seed_usuarios.sql
```

O `seed_usuarios.sql` cria o usuário administrador padrão do painel
(login inicial abaixo). Troque a senha na tela **Equipe** assim que
possível.

### 3. Configure as variáveis de ambiente

```bash
cd backend
cp .env.example .env
```

Edite o `.env` com o usuário/senha do seu MySQL e o número de WhatsApp da
loja (formato internacional, só números, ex: `5581999999999`):

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=taylor_tech
WHATSAPP_NUMERO=5581999999999
JWT_SECRET=qualquer-texto-aleatorio-aqui
```

### 4. Instale as dependências e rode o servidor

```bash
npm install
npm run dev
```

O terminal deve mostrar:

```
Taylor Tech rodando em http://localhost:3000
  Vitrine do cliente: http://localhost:3000/index.html
  Painel administrativo: http://localhost:3000/admin.html
```

O próprio backend já serve o front-end (não é preciso um segundo
servidor) — basta abrir os links acima no navegador.

### 5. Instalar como PWA

No Chrome/Edge, abra `http://localhost:3000/index.html` e clique no ícone
de instalação na barra de endereço (ou "Adicionar à tela inicial" no
celular).

## Deploy gratuito online (Render + TiDB Cloud)

Combinação 100% gratuita, sem cartão de crédito, para colocar o sistema
no ar com uma URL pública.

> Já tentamos o **db4free.net** antes, mas esse serviço costuma ficar
> instável/fora do ar. O **TiDB Cloud Serverless** é compatível com
> MySQL, gratuito para sempre e bem mais confiável — inclusive tem um
> editor SQL no navegador, então nem precisa instalar `mysql` na sua
> máquina para rodar os scripts.

### 1. Banco de dados gratuito (TiDB Cloud Serverless)

1. Acesse **https://tidbcloud.com/** e crie uma conta (GitHub, Google ou e-mail — sem cartão).
2. Crie um cluster **Serverless** (plano gratuito, criação em ~1 minuto).
3. Abra o cluster → aba **SQL Editor** (direto no navegador) → cole o
   conteúdo de `backend/database/schema.sql` e execute, depois faça o
   mesmo com `backend/database/seed.sql`.
4. Vá em **Connect** → escolha "General" → anote: `Host`, `Port` (geralmente `4000`,
   não `3306`), `User` (algo como `xxxxx.root`) e defina uma senha.

### 2. Hospedar o site (Render, plano Free)

1. Crie uma conta em **https://render.com** (pode entrar com GitHub).
2. **New +** → **Blueprint** → conecte o repositório
   `TaylorTech2024/taylor-tech-sistema`. O Render detecta o `render.yaml`
   do projeto e já configura tudo (pasta `backend/`, build e start).
3. Preencha as variáveis de ambiente pedidas com os dados do TiDB Cloud:

   | Variável | Valor |
   |---|---|
   | `DB_HOST` | host do TiDB Cloud |
   | `DB_PORT` | `4000` |
   | `DB_USER` | usuário do TiDB Cloud |
   | `DB_PASSWORD` | senha que você definiu |
   | `DB_NAME` | `test` (ou o nome do banco que você criou) |
   | `DB_SSL` | `true` |
   | `WHATSAPP_NUMERO` | número da loja, só números (ex: `5581999999999`) |

4. Clique em **Apply/Create**. Em poucos minutos o Render gera uma URL
   pública, ex: `https://taylor-tech.onrender.com`.
5. Acesse `https://taylor-tech.onrender.com/index.html` (vitrine) e
   `.../admin.html` (painel) — já no ar.

**Limitações do plano grátis (normais):** o Render "dorme" o site após
15 min sem acesso (o primeiro acesso depois demora ~30-50s para
"acordar"); o TiDB Cloud Serverless free tem limite de 5GB, de sobra
para o catálogo e histórico de uma assistência técnica.

## Scripts disponíveis (backend)

- `npm run dev` — inicia com `nodemon` (reinicia automaticamente ao salvar)
- `npm start` — inicia em modo produção

## Principais rotas da API

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/catalogo/marcas` | Lista marcas disponíveis |
| GET | `/api/catalogo/modelos?marca=` | Lista modelos de uma marca |
| GET | `/api/catalogo/servicos?marca=&modelo=` | Lista serviços/preço final |
| POST | `/api/pedidos` | Cria pedido a partir da vitrine |
| GET | `/api/ordens?status=` | Lista OS (fila do painel) |
| POST | `/api/ordens` | Cria OS manual (balcão) |
| PUT | `/api/ordens/:id/concluir` | Fecha a OS (baixa estoque + financeiro) |
| GET/POST | `/api/checklist/:osId` | Consulta/salva checklist de entrada |
| GET/POST/PUT/DELETE | `/api/estoque` | CRUD de peças |
| GET | `/api/financeiro/resumo` | Faturamento, custo, lucro e margem |
| GET | `/api/clientes` | Base de clientes com total gasto |
