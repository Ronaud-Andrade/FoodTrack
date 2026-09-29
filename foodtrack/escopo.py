def filtrar_por_restaurante(qs, user, campo):
    """Limita a consulta ao restaurante do usuário logado.

    Superusuário fica de fora do filtro: ele pode existir sem restaurante
    e, por isso, administra os dados de todas as empresas.
    """
    if user.is_superuser:
        return qs
    # pk compara com o id. Os demais campos são a foreign key do restaurante.
    if campo == 'pk':
        return qs.filter(pk=user.restaurante_id)
    return qs.filter(**{campo: user.restaurante})
