# Generated by Django 5.2 on 2025-05-02 10:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('jobs', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='candidateprofile',
            name='cv',
            field=models.FileField(blank=True, null=True, upload_to='cv/'),
        ),
        migrations.AlterField(
            model_name='candidateprofile',
            name='verification_documents',
            field=models.FileField(blank=True, null=True, upload_to='verification_documents/'),
        ),
    ]
