#!/bin/bash

# Script para fazer deploy da aplicação Appraizes em ambiente Docker
echo "Iniciando deploy da aplicação Appraizes em Docker..."

# Verificar se o Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "Docker não encontrado. Por favor, instale o Docker antes de continuar."
    exit 1
fi

# Verificar se o Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose não encontrado. Por favor, instale o Docker Compose antes de continuar."
    exit 1
fi

# Copiar arquivo de variáveis de ambiente
echo "Configurando variáveis de ambiente..."
cp .env.docker .env

# Construir as imagens Docker
echo "Construindo imagens Docker..."
docker-compose build

# Iniciar os serviços
echo "Iniciando serviços..."
docker-compose up -d

# Verificar status dos serviços
echo "Verificando status dos serviços..."
docker-compose ps

echo "Deploy concluído com sucesso!"
echo "A aplicação está disponível em: http://localhost"
echo "A API está disponível em: http://localhost/api"
echo "Para visualizar logs: docker-compose logs -f"
echo "Para parar a aplicação: docker-compose down"
