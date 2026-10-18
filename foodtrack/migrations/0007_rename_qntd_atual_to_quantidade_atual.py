from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('foodtrack', '0006_remove_alimento_estoque_minimo_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='estoque',
            old_name='qntd_atual',
            new_name='quantidade_atual',
        ),
    ]
