# Generated by Django 5.1.2 on 2024-11-08 08:13

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_remove_game_board_alter_game_createdat_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='board',
            name='game',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='board', to='api.game'),
        ),
    ]
