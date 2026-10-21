DOCUMENTACAO = ('/api/schema', '/api/swagger', '/api/docs')


def somente_api(endpoints):
    """O schema exportável lista só as rotas da API, sem o admin e sem as páginas de documentação."""
    return [
        endpoint
        for endpoint in endpoints
        if endpoint[0].startswith('/api/') and not endpoint[0].startswith(DOCUMENTACAO)
    ]
