# Generated by Django 5.1.2 on 2025-02-21 06:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0004_queryusers"),
    ]

    operations = [
        migrations.AlterField(
            model_name="queryusers",
            name="id",
            field=models.BigAutoField(
                auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
            ),
        ),
    ]
