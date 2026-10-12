# Frontend FoodTrack

Aplicação desktop em React, Vite, JavaScript e Tailwind CSS.

## Executar localmente

1. Instale as dependências:

   ```sh
   npm install
   ```

2. Opcionalmente, crie `.env` a partir do exemplo:

   ```sh
   cp .env.example .env
   ```

3. Inicie o servidor de desenvolvimento:

   ```sh
   npm run dev
   ```

Configure `VITE_API_URL` no `.env` para indicar a URL base da API. O valor de
desenvolvimento é `http://localhost:8000`. A variável está documentada em
`.env.example`. O login e a restauração da sessão usam a API; as demais telas e
operações dos recursos ainda não estão conectadas aos serviços de dados.
