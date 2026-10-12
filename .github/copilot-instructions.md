# Instruções para o GitHub Copilot — FoodTrack

Projeto: backend Django + Django REST Framework (autenticação por token) na raiz; frontend em React na pasta frontend/, com Vite, JavaScript (sem TypeScript) e Tailwind CSS.

Regras permanentes:
1. Antes de qualquer alteração, inspecione os arquivos existentes (estrutura de pastas, package.json, componentes, hooks, serviços, estilos) e reutilize o que já existe em vez de duplicar.
2. Preserve funcionalidades atuais. Não remova nem reescreva código fora do escopo do pedido.
3. Não instale dependências sem que o pedido as autorize explicitamente. Não invente endpoints, campos de API, bibliotecas ou funcionalidades.
4. Dados vêm da API Django. Se um dado exibido no design não existir na API, NÃO invente valor: pare, liste o que falta e peça decisão.
5. Estilização somente com Tailwind e os tokens definidos em frontend/src/index.css. Evite valores soltos (cores hex, px) quando houver token equivalente.
6. Layout otimizado apenas para desktop (a partir de 1024px). Não crie versões mobile. Evite larguras fixas em px; use grid/flex fluidos com largura máxima.
7. Acessibilidade: HTML semântico (header, nav, main, section, table), labels ligados aos inputs, botões com texto ou aria-label, foco visível, contraste adequado, role/aria para barras de progresso.
8. Componentes pequenos, nomes em inglês para código e português para textos da interface. Um componente por arquivo.
9. Ao terminar, liste os arquivos criados/alterados e aponte qualquer divergência em relação ao pedido.