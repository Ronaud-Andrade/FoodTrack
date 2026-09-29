from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('foodtrack', '0002_alter_usuario_restaurante'),
    ]

    operations = [
        migrations.AddConstraint(
            model_name='usuario',
            constraint=models.CheckConstraint(
                condition=models.Q(is_superuser=True) | models.Q(restaurante__isnull=False),
                name='usuario_restaurante_nulo_apenas_superuser',
                violation_error_message='Usuários que não são superusuários precisam estar atrelados a um restaurante.',
            ),
        ),
    ]
