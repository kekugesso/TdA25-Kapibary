# Generated by Django 5.1.2 on 2024-11-05 08:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_remove_line_board_board_board_delete_cell_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='game',
            name='board',
            field=models.JSONField(default=1),
            preserve_default=False,
        ),
        migrations.DeleteModel(
            name='Board',
        ),
    ]
