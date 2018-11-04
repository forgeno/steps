# Generated by Django 2.1.1 on 2018-10-30 00:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='sidewalk',
            name='average_accessibility_rating',
        ),
        migrations.RemoveField(
            model_name='sidewalk',
            name='average_comfort_rating',
        ),
        migrations.RemoveField(
            model_name='sidewalk',
            name='average_connectivity_rating',
        ),
        migrations.RemoveField(
            model_name='sidewalk',
            name='average_overall_rating',
        ),
        migrations.RemoveField(
            model_name='sidewalk',
            name='average_physical_safety_rating',
        ),
        migrations.RemoveField(
            model_name='sidewalk',
            name='average_sense_of_security',
        ),
        migrations.AddField(
            model_name='sidewalkcomment',
            name='is_deleted',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='sidewalkimage',
            name='is_deleted',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='sidewalkimage',
            name='is_pending',
            field=models.BooleanField(default=True),
        ),
    ]
