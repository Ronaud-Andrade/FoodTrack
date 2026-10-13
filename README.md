# FoodTrack

FoodTrack é um sistema para gestão de alimentos, estoque e desperdícios em
restaurantes. O projeto combina uma API REST em Django com uma interface desktop
em React.

## Componentes

- **Backend:** Django REST Framework, autenticação por token e PostgreSQL.
- **Frontend:** React, Vite, JavaScript e Tailwind CSS.
- **API:** restaurantes, usuários, alimentos, estoques e desperdícios.

Este branch inclui a tela de login integrada à API, o gerenciamento de sessão e
as rotas/telas da aplicação. As telas de recursos e seus fluxos de criação,
edição e exclusão ainda não estão integrados às chamadas da API.

## Requisitos

- Python 3.12 ou superior
- PostgreSQL
- Node.js e npm

## Backend

1. Crie e ative um ambiente virtual na raiz do repositório:

   ```bash
   python -m venv .venv
   ```

   No Windows (PowerShell):

   ```powershell
   .\.venv\Scripts\Activate.ps1
   ```

   No Linux/macOS:

   ```bash
   source .venv/bin/activate
   ```

2. Instale as dependências:

   ```bash
   pip install -r requirements.txt
   ```

3. Crie um banco PostgreSQL e configure um arquivo `.env` na raiz do projeto:

   ```env
   SECRET_KEY=substitua-por-uma-chave-secreta
   DEBUG=True
   DB_NAME=foodtrack
   DB_USER=postgres
   DB_PASSWORD=sua-senha-do-postgres
   DB_HOST=localhost
   DB_PORT=5432
   CORS_ALLOWED_ORIGINS=http://localhost:5173
   ```

   Ajuste as credenciais e a origem do frontend para o seu ambiente. O banco
   configurado precisa existir antes de aplicar as migrações.

4. Aplique as migrações, crie um usuário administrativo e inicie a API:

   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   python manage.py runserver
   ```

A API estará disponível em `http://127.0.0.1:8000/api/`. O schema OpenAPI pode ser
consultado em `http://127.0.0.1:8000/api/schema/`; uma cópia está em
[`openapi.yaml`](./openapi.yaml).

### Autenticação e recursos

Obtenha um token com as credenciais de um usuário cadastrado. No Postman, envie
uma requisição `POST` para `http://127.0.0.1:8000/api/token/`, com `Body` >
`raw` > `JSON`:

```json
{
  "username": "seu-usuario",
  "password": "sua-senha"
}
```

Na resposta, copie o valor de `token`. Para usar o token no Postman, configure
`Authorization` como `API Key`, com `Key` igual a `Authorization`, `Value` igual
a `Token SEU_TOKEN` e `Add to` igual a `Header`. **Não use `Bearer Token`**: esta
API espera o prefixo `Token`.

Também é possível selecionar `No Auth` e adicionar manualmente este cabeçalho
na aba `Headers`:

```text
Authorization: Token SEU_TOKEN
```

Os recursos disponíveis são:

- `/api/restaurantes/`
- `/api/usuarios/`
- `/api/alimentos/`
- `/api/estoques/`
- `/api/desperdicios/`

Usuários comuns acessam os dados do próprio restaurante; superusuários podem
administrar dados de todos os restaurantes e são responsáveis por cadastrá-los.
Todas as rotas abaixo usam `POST`, `Body` > `raw` > `JSON` e o cabeçalho de
autenticação descrito acima.

Para criar um restaurante, envie para `http://127.0.0.1:8000/api/restaurantes/`.
Essa operação só é permitida a superusuários:

```json
{
  "nome": "Restaurante Exemplo",
  "cnpj": "12.345.678/0001-90"
}
```

Para criar um alimento, envie para `http://127.0.0.1:8000/api/alimentos/`.
Um superusuário pode informar o ID do restaurante:

```json
{
  "nome": "Arroz",
  "categoria": "Grãos",
  "medida": "kg",
  "restaurante": 2
}
```

Altere os valores para os dados desejados. Usuários comuns têm o restaurante
definido automaticamente a partir da própria conta; o campo `restaurante` não
precisa ser enviado por eles.

Os contratos, campos e permissões estão descritos em
[`docs/api-mapping.md`](./docs/api-mapping.md).

O painel administrativo do Django fica em `http://127.0.0.1:8000/admin/`.

## Frontend

Com o backend em execução, abra outro terminal:

```bash
cd frontend
npm ci
```

Configure `VITE_API_URL` em `frontend/.env` com a URL base do backend. O exemplo
está em `frontend/.env.example`:

```env
VITE_API_URL=http://localhost:8000
```

No Windows (PowerShell), copie o exemplo com:

```powershell
Copy-Item .env.example .env
```

No Linux/macOS:

```bash
cp .env.example .env
```

Inicie a interface:

```bash
npm run dev
```

O Vite informa no terminal a URL local da aplicação (por padrão,
`http://localhost:5173`). Para comandos adicionais do frontend, consulte
[`frontend/README.md`](./frontend/README.md).

## Desenvolvimento e produção

O projeto não está configurado para produção por padrão. Antes de implantá-lo,
configure adequadamente `DEBUG`, `SECRET_KEY`, hosts permitidos, banco de dados e
origens CORS para o ambiente de destino.

## Licença

Este projeto não especifica uma licença neste momento.
