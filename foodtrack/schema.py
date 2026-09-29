def somente_api(endpoints):
    """O schema exportável lista só as rotas da API, sem o admin do Django."""
    return [
        endpoint
        for endpoint in endpoints
        if endpoint[0].startswith('/api/') and not endpoint[0].startswith('/api/schema')
    ]
