"""
Testes de Usabilidade (Usability Testing) - FoodTrack

Critério de Qualidade Avaliado: USABILIDADE (ISO/IEC 25010 & Heurísticas de Nielsen)
Subcaracterísticas avaliadas:
1. Proteção contra erros do usuário (User Error Protection) / Prevenção de Erros (Nielsen H5)
2. Comunicação e diagnóstico claro de erros (Help Users Recognize and Recover from Errors - Nielsen H9)
3. Redução da carga cognitiva e eficiência de uso (Flexibility and Efficiency of Use - Nielsen H7)
4. Consistência e padronização das respostas (Consistency and Standards - Nielsen H4)
5. Facilidade de aprendizado e documentação da interface (Learnability & Documentation - Nielsen H10)
"""

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from foodtrack.models import Alimento, Estoque, Restaurante, Usuario


class UsabilidadeTests(APITestCase):
    """
    Suíte de testes voltada para validar a Usabilidade do sistema FoodTrack.
    Garante que a interface (API REST) seja intuitiva, consistente, previna
    erros comuns do operador de restaurante e comunique feedbacks claros.
    """

    def setUp(self):
        # Cenário básico com dois restaurantes distintos para validar usabilidade e escopo
        self.restaurante_a = Restaurante.objects.create(
            nome='Cantina Bella Vista', cnpj='12.345.678/0001-90'
        )
        self.restaurante_b = Restaurante.objects.create(
            nome='Bistrô do Sol', cnpj='98.765.432/0001-10'
        )

        self.gerente_a = Usuario.objects.create_user(
            username='gerente_a',
            email='gerente@bellavista.test',
            password='SenhaSegura@123',
            nome='Carlos Gerente',
            perfil='gerente',
            restaurante=self.restaurante_a,
        )

        self.alimento_a = Alimento.objects.create(
            nome='Farinha de Trigo',
            categoria='Secos',
            medida='Kg',
            restaurante=self.restaurante_a,
        )
        self.alimento_b = Alimento.objects.create(
            nome='Azeite de Oliva',
            categoria='Óleos',
            medida='L',
            restaurante=self.restaurante_b,
        )

        self.estoque_a = Estoque.objects.create(
            alimento=self.alimento_a,
            quantidade_atual=25,
            entrada='2026-10-01',
            localizacao='Prateleira 2',
        )
        self.estoque_b = Estoque.objects.create(
            alimento=self.alimento_b,
            quantidade_atual=10,
            entrada='2026-10-05',
            localizacao='Despensa B',
        )

    def autenticar(self, usuario):
        self.client.force_authenticate(user=usuario)

    # --------------------------------------------------------------------------
    # 1. Prevenção de Erros e Validação de Entradas (Nielsen H5 / ISO 25010)
    # --------------------------------------------------------------------------
    def test_previne_cadastro_incompleto_com_feedback_especifico_por_campo(self):
        """
        [Usabilidade - Prevenção de Erros]:
        Ao tentar cadastrar um alimento sem preencher o campo obrigatório 'nome',
        o sistema deve rejeitar a operação com HTTP 400 e informar exatamente
        qual campo precisa ser corrigido pelo usuário, evitando dados inconsistentes.
        """
        self.autenticar(self.gerente_a)

        payload_invalido = {
            'categoria': 'Carnes',
            'medida': 'Kg',
            # 'nome' foi omitido propositalmente
        }

        resposta = self.client.post(
            reverse('api-alimento-list'), payload_invalido, format='json'
        )

        self.assertEqual(resposta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('nome', resposta.data)
        # Garante que o usuário recebe uma mensagem compreensível
        self.assertTrue(len(resposta.data['nome']) > 0)

    def test_protege_usuario_contra_autoexclusao_acidental(self):
        """
        [Usabilidade - Proteção contra Erros Irreversíveis]:
        O sistema deve impedir que o operador exclua a sua própria conta logada por engano,
        retornando HTTP 403 Forbidden com uma mensagem clara e autoexplicativa.
        """
        self.autenticar(self.gerente_a)

        resposta = self.client.delete(
            reverse('api-usuario-detail', args=[self.gerente_a.pk])
        )

        self.assertEqual(resposta.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('Você não pode excluir o próprio usuário.', str(resposta.data))
        # Verifica que o usuário continua existindo no banco
        self.assertTrue(Usuario.objects.filter(pk=self.gerente_a.pk).exists())

    # --------------------------------------------------------------------------
    # 2. Diagnóstico e Comunicação Clara de Erros (Nielsen H9 / ISO 25010)
    # --------------------------------------------------------------------------
    def test_comunica_mensagem_clara_ao_tentar_vincular_estoque_de_outro_restaurante(self):
        """
        [Usabilidade - Comunicação de Erros]:
        Quando o operador tenta lançar desperdício associando a um estoque de outro
        restaurante, a API deve apresentar feedback imediato no campo 'estoque'
        com HTTP 400, impedindo a vinculação indevida de dados entre estabelecimentos.
        """
        self.autenticar(self.gerente_a)

        payload_desperdicio_invalido = {
            'descricao': 'Quebra de embalagem',
            'quantidade': 3,
            'data': '2026-10-10',
            'estoque': self.estoque_b.pk,  # Pertence ao restaurante B
        }

        resposta = self.client.post(
            reverse('api-desperdicio-list'), payload_desperdicio_invalido, format='json'
        )

        self.assertEqual(resposta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('estoque', resposta.data)
        # O DRF valida o campo e aponta que o objeto não existe no contexto do restaurante do usuário
        erro_estoque = str(resposta.data['estoque'])
        self.assertTrue(
            'não existe' in erro_estoque or 'nao existe' in erro_estoque or 'does_not_exist' in erro_estoque,
            f"Mensagem inesperada: {erro_estoque}",
        )

    def test_feedback_amigavel_para_falha_de_autenticacao(self):
        """
        [Usabilidade - Feedback de Login]:
        Ao informar credenciais incorretas, o sistema deve fornecer uma resposta clara
        de impossibilidade de login, permitindo ao usuário entender o ocorrido sem
        expor falhas não tratadas.
        """
        resposta = self.client.post(
            reverse('api-token'),
            {'username': 'gerente_a', 'password': 'SenhaErrada!'},
            format='json',
        )

        self.assertEqual(resposta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('non_field_errors', resposta.data)

    # --------------------------------------------------------------------------
    # 3. Eficiência e Redução de Carga Cognitiva (Nielsen H7 / ISO 25010)
    # --------------------------------------------------------------------------
    def test_preenchimento_automatico_de_contexto_no_cadastro_de_alimento(self):
        """
        [Usabilidade - Eficiência de Uso & Menor Esforço]:
        O usuário comum não precisa informar nem memorizar o ID do seu restaurante
        ao cadastrar novos alimentos. O sistema infere automaticamente pelo usuário
        autenticado, facilitando a rotina diária no restaurante.
        """
        self.autenticar(self.gerente_a)

        payload = {
            'nome': 'Molho de Tomate',
            'categoria': 'Molhos',
            'medida': 'un',
        }

        resposta = self.client.post(
            reverse('api-alimento-list'), payload, format='json'
        )

        self.assertEqual(resposta.status_code, status.HTTP_201_CREATED)
        # O restaurante do alimento criado é automaticamente o restaurante do gerente
        self.assertEqual(resposta.data['restaurante'], self.restaurante_a.pk)
        molho = Alimento.objects.get(nome='Molho de Tomate')
        self.assertEqual(molho.restaurante, self.restaurante_a)

    # --------------------------------------------------------------------------
    # 4. Consistência e Padronização de Dados (Nielsen H4 / ISO 25010)
    # --------------------------------------------------------------------------
    def test_consistencia_estrutural_na_resposta_de_listagem(self):
        """
        [Usabilidade - Consistência e Padrões]:
        A listagem de itens deve seguir contrato padronizado, contendo os campos
        fundamentais (id, nome, categoria, medida, restaurante), garantindo
        previsibilidade para o usuário e interfaces clientes.
        """
        self.autenticar(self.gerente_a)

        resposta = self.client.get(reverse('api-alimento-list'))

        self.assertEqual(resposta.status_code, status.HTTP_200_OK)
        self.assertTrue(isinstance(resposta.data, list))
        self.assertGreaterEqual(len(resposta.data), 1)

        item = resposta.data[0]
        campos_esperados = {'id', 'nome', 'categoria', 'medida', 'restaurante'}
        self.assertTrue(
            campos_esperados.issubset(set(item.keys())),
            f"Faltam campos esperados na estrutura: {campos_esperados - set(item.keys())}",
        )

    # --------------------------------------------------------------------------
    # 5. Aprendizado e Documentação da Interface (Nielsen H10 / ISO 25010)
    # --------------------------------------------------------------------------
    def test_esquema_openapi_disponivel_para_facilitar_aprendizado_e_integracao(self):
        """
        [Usabilidade - Facilidade de Aprendizado (Learnability)]:
        A documentação interativa/OpenAPI do sistema deve estar acessível e íntegra,
        permitindo ao operador, desenvolvedor ou integrador conhecer as rotas e contratos
        sem necessidade de tentativas e erros manuais.
        """
        resposta = self.client.get(reverse('schema'))

        self.assertEqual(resposta.status_code, status.HTTP_200_OK)
        conteudo = resposta.content.decode('utf-8')
        # Verifica se o título da aplicação e rotas centrais estão descritos no schema
        self.assertIn('FoodTrack', conteudo)
        self.assertIn('/api/alimentos/', conteudo)
        self.assertIn('/api/estoques/', conteudo)
        self.assertIn('/api/desperdicios/', conteudo)
