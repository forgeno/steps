# Generated by Django 2.1.1 on 2018-10-20 22:15

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_auto_20181020_1557'),
    ]

    operations = [
        migrations.RenameField(
            model_name='sidewalkcomment',
            old_name='sidewalk_ID',
            new_name='sidewalk',
        ),
        migrations.RenameField(
            model_name='sidewalkimage',
            old_name='sidewalk_ID',
            new_name='sidewalk',
        ),
        migrations.RenameField(
            model_name='sidewalkrating',
            old_name='sidewalk_ID',
            new_name='sidewalk',
        ),
    ]