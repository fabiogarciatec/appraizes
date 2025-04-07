#!/bin/bash

# Script para construir e enviar a imagem para o Docker Hub

# Variáveis
DOCKERHUB_USERNAME="fatec@fatec.info"
DOCKERHUB_PASSWORD="F@tec555133#"
IMAGE_NAME="appraizes"
IMAGE_TAG="latest"

# Verificar se o Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "Docker não encontrado. Este script deve ser executado em um ambiente com Docker."
    exit 1
fi

# Fazer login no Docker Hub
echo "Fazendo login no Docker Hub..."
echo "$DOCKERHUB_PASSWORD" | docker login -u "$DOCKERHUB_USERNAME" --password-stdin

# Verificar se o login foi bem-sucedido
if [ $? -ne 0 ]; then
    echo "Falha ao fazer login no Docker Hub. Verifique suas credenciais."
    exit 1
fi

echo "Login no Docker Hub realizado com sucesso!"

# Construir a imagem da aplicação
echo "Construindo a imagem da aplicação..."
docker build -t $DOCKERHUB_USERNAME/$IMAGE_NAME:$IMAGE_TAG .

# Enviar a imagem para o Docker Hub
echo "Enviando a imagem para o Docker Hub..."
docker push $DOCKERHUB_USERNAME/$IMAGE_NAME:$IMAGE_TAG

echo "Imagem enviada com sucesso para o Docker Hub!"
echo "Repositório: $DOCKERHUB_USERNAME/$IMAGE_NAME:$IMAGE_TAG"

# Logout do Docker Hub
docker logout

echo "Processo concluído com sucesso!"
echo "Agora você pode usar esta imagem no Portainer para criar uma stack."
