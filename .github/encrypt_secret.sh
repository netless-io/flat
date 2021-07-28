#!/bin/bash

# github actions doc: https://docs.github.com/en/actions/reference/encrypted-secrets

# Prepare:
#   install gpg
#
#   macos: brew install gpg
#   ubuntu/debian: apt-get install -y gpg
#   centos/RedHat: apt-get install -y gpg
#
# Usage:
#
# ./.github/envcrypt_secret.sh [development|production]

set -e;

ENV=$1

if [ -d $ENV ]
then
    echo "Cannot find args ENV"
    echo "Usage: ./.github/envcrypt_secret.sh [development|production]"
    exit 1
fi

if [ -f "config/.env.${ENV}.local" ]
then
    echo "encrypt config/.env.${ENV}.local to base64 format"
    gpg --symmetric --output tmp --cipher-algo AES256 config/.env.${ENV}.local
    cat tmp | base64 -w 0 > config/.env.${ENV}.local.gpg
    rm tmp
    echo "encrypt complete, add .env.${ENV}.local.gpg to github secret >>GPG_SECRET_FILE<< and PASSWORD to github >>GPG_SECRET_PASSWORD<< for flat docker build"
else
    echo "Cannot find config/.env.${ENV}.local"
fi
