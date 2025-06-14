import os
from pathlib import Path
import cloudinary
import cloudinary.uploader
from cloudinary.utils import cloudinary_url

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-cspe#vszd!5u@q_n6=7llh0)vj933i@pm#sw4gy2))2r=0qz(&'

DEBUG = True

ALLOWED_HOSTS = []

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'jobs.apps.JobsConfig',
    'rest_framework',
    'drf_yasg',
    'oauth2_provider'
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
    'oauth2_provider.contrib.rest_framework.OAuth2Authentication',
    )
}

cloudinary.config(
    cloud_name = "dwc0l2bty",
    api_key = "333266118323265",
    api_secret = "ByZOYDVV4ktSRHPDV0smkJKhHKk",
    secure=True
)

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'PTjobapi.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'PTjobapi.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'jobdb',
        'USER': 'root',
        'PASSWORD': 'Admin@123',
        'HOST': ''
    }
}

AUTH_USER_MODEL = 'jobs.User'

import pymysql
pymysql.install_as_MySQLdb()

# Password validation
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
# https://docs.djangoproject.com/en/5.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.2/howto/static-files/

STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/5.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'mt.tuongpham@gmail.com'
EMAIL_HOST_PASSWORD = 'bnls vung xagc xsem'

DEFAULT_FROM_EMAIL = 'mt.tuongpham@gmail.com'
FRONTEND_URL = 'https://yourfrontend.com'  # hoặc http://localhost:3000 nếu dev

Client_id = 'iDhMA9hBs4x64KNdv69H6Ckzx5mnCJFFW6El5GBn'
client_secret = 'RbkqWEycoaH3dUmY6E5JAp84X5tVEgalzHxIB35VF8k50jpKpaGEivk6etRdQk6MUVGjClM8HmJMuG67YJToeIGgv7ecs8U3ibasgQOxbIzqHLyyIck21u6s1OhilERQ'