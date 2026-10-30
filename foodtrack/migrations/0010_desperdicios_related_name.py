import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('foodtrack', '0009_perfil_motivo_cnpj_e_alerta_validade'),
    ]

    operations = [
        migrations.AlterField(
            model_name='desperdicio',
            name='estoque',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='desperdicios', to='foodtrack.estoque'),
        ),
        migrations.AlterField(
            model_name='desperdicio',
            name='usuario',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='desperdicios', to=settings.AUTH_USER_MODEL),
        ),
    ]
