#!/bin/bash
set -e;

export TAG=${TAG-:latest}

export ENV=${ENV-:development}


docker build . -f web/flat-web/deploy/Dockerfile -t agoraflat/flat-web:$TAG --build-arg build_env=$ENV --ulimit nofile=65535:65535
docker push agoraflat/flat-web:$TAG
