#!/bin/bash

# Script para fazer login no Docker Hub e enviar as imagens

# Variáveis
DOCKERHUB_USERNAME="fatec@fatec.info"
DOCKERHUB_PASSWORD="F@tec555133#"
IMAGE_NAME="appraizes"
IMAGE_TAG="latest"

# Verificar se o Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "Docker não encontrado. Por favor, instale o Docker antes de continuar."
    exit 1
fi

# Solicitar credenciais do Docker Hub se não fornecidas
if [ -z "$DOCKERHUB_USERNAME" ]; then
    read -p "Digite seu usuário do Docker Hub: " DOCKERHUB_USERNAME
fi

if [ -z "$DOCKERHUB_PASSWORD" ]; then
    read -s -p "Digite sua senha do Docker Hub: " DOCKERHUB_PASSWORD
    echo
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
