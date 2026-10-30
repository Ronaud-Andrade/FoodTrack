from django.db import migrations, models


def marcar_superusuarios(apps, schema_editor):
    usuario = apps.get_model('foodtrack', 'Usuario')
    usuario.objects.filter(is_superuser=True).update(perfil='superuser')


class Migration(migrations.Migration):

    dependencies = [
        ('foodtrack', '0010_desperdicios_related_name'),
    ]

    operations = [
        migrations.RemoveConstraint(
            model_name='usuario',
            name='usuario_perfil_conhecido',
        ),
        migrations.RunPython(marcar_superusuarios, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='usuario',
            name='perfil',
            field=models.CharField(
                choices=[
                    ('superuser', 'Administrador do site'),
                    ('proprietario', 'Proprietário'),
                    ('gerente', 'Gerente'),
                    ('funcionario', 'Funcionário'),
                ],
                max_length=20,
            ),
        ),
        migrations.AddConstraint(
            model_name='usuario',
            constraint=models.CheckConstraint(
                condition=models.Q(is_superuser=True, perfil='superuser') | models.Q(
                    is_superuser=False,
                    perfil__in=['proprietario', 'gerente', 'funcionario'],
                ),
                name='usuario_perfil_conhecido',
                violation_error_message=(
                    'O superusuário precisa ter o perfil de administrador do site. '
                    'Os demais usuários precisam ser proprietário, gerente ou funcionário.'
                ),
            ),
        ),
    ]
