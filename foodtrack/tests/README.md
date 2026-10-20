# Testes do FoodTrack

Pasta criada para atender à demanda da matéria de Testes de Software.

## Foco Escolhido: Usabilidade

Os testes em `test_usabilidade.py` validam a experiência e facilidade de uso do sistema:

1. **Avisar campos obrigatórios**: Quando o usuário esquece de preencher o nome de um alimento, o sistema avisa claramente o erro.
2. **Mensagem clara no login**: Se errar a senha ou usuário, avisa sem travar a aplicação.
3. **Facilidade no cadastro**: Preenche o restaurante automaticamente pelo usuário logado (evita que a pessoa precise digitar IDs manuais).
4. **Proteção contra erros acidentais**: Não deixa o usuário excluir a própria conta logada por engano.

## Como Executar

No terminal, dentro da pasta `FoodTrack`:

```bash
# Rodar apenas os testes de usabilidade
python manage.py test foodtrack.tests.test_usabilidade

# Rodar todos os testes
python manage.py test
```
