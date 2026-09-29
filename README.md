# FoodTrack

FoodTrack é um projeto Django para gestão e acompanhamento de alimentos/itens relacionados ao consumo alimentar.

## Tecnologias

- Python
- Django
- Django REST framework
- django-environ

## Estrutura do projeto

```text
FoodTrack/
├── config/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
├── foodtrack/
│   ├── __init__.py
│   ├── admin.py
│   ├── api.py
│   ├── urls.py
│   ├── apps.py
│   ├── escopo.py
│   ├── migrations/
│   ├── models.py
│   ├── serializers.py
│   └── tests.py
├── manage.py
├── requirements.txt
└── README.md
```

## Requisitos

- Python 3.10 ou superior
- pip
- Ambiente virtual (opcional, mas recomendado)

## Configuração do ambiente

1. Clone o repositório:

```bash
git clone <url-do-repositorio>
cd FoodTrack
```

2. Crie e ative um ambiente virtual:

No Windows:

```bash
python -m venv .venv
.venv\Scripts\activate
```

No Linux/macOS:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

3. Instale as dependências:

```bash
pip install -r requirements.txt
```

4. Crie um arquivo `.env` na raiz do projeto com as variáveis de ambiente necessárias, por exemplo:

```env
SECRET_KEY=sua-chave-secreta-aqui
DEBUG=True
```

> O projeto usa `django-environ` para carregar essas variáveis em `config/settings.py`.

## Execução local

1. Aplique as migrações:

```bash
python manage.py migrate
```

2. Inicie o servidor de desenvolvimento:

```bash
python manage.py runserver
```

3. A API fica em `http://127.0.0.1:8000/api/`.

Obtenha um token com o usuário e a senha:

```http
POST /api/token/
Content-Type: application/json

{"username": "seu-usuario", "password": "sua-senha"}
```

Envie o token nas próximas requisições:

```http
Authorization: Token seu-token
```

Recursos:

- `/api/restaurantes/`
- `/api/usuarios/`
- `/api/alimentos/`
- `/api/estoques/`
- `/api/desperdicios/`

Cada recurso aceita listar, criar, consultar, atualizar e excluir. Usuário comum só acessa os dados do próprio restaurante. Superusuário administra todos e é quem cadastra restaurantes.

## Admin do Django

Para acessar o painel administrativo:

```bash
python manage.py createsuperuser
```

Em seguida, acesse:

```text
http://127.0.0.1:8000/admin/
```

## Observações

- A aplicação responde JSON. As telas HTML do sistema foram removidas.
- O admin do Django continua disponível para a gestão inicial.
- Para ambiente de produção, é recomendado ajustar `DEBUG`, `ALLOWED_HOSTS`, `SECRET_KEY` e outras configurações do Django.

## Licença

Este projeto não especifica uma licença neste momento.
