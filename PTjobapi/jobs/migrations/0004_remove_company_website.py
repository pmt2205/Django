# Generated by Django 5.2 on 2025-05-21 15:13

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('jobs', '0003_alter_candidateprofile_cv_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='company',
            name='website',
        ),
    ]
