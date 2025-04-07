#!/bin/bash

# Script para preparar os arquivos para enviar a imagem para o Docker Hub

# Criar diretório temporário
TEMP_DIR="deploy_temp"
echo "Criando diretório temporário: $TEMP_DIR"
mkdir -p $TEMP_DIR

# Copiar arquivos necessários
echo "Copiando arquivos necessários..."
cp Dockerfile $TEMP_DIR/
cp build-dockerhub.sh $TEMP_DIR/
cp -r src $TEMP_DIR/
cp package.json $TEMP_DIR/
cp package-lock.json $TEMP_DIR/
cp vite.config.js $TEMP_DIR/
cp .env.docker $TEMP_DIR/.env

# Compactar arquivos
echo "Compactando arquivos..."
tar -czf appraizes-dockerhub.tar.gz -C $TEMP_DIR .

# Limpar diretório temporário
echo "Limpando diretório temporário..."
rm -rf $TEMP_DIR

echo "=================================================="
echo "Pacote para Docker Hub criado: appraizes-dockerhub.tar.gz"
echo "=================================================="
echo ""
echo "PRÓXIMOS PASSOS:"
echo ""
echo "1. Transfira este arquivo para sua VPS:"
echo "   scp appraizes-dockerhub.tar.gz usuario@sua-vps:/home/usuario/"
echo ""
echo "2. Na sua VPS, execute:"
echo "   mkdir -p appraizes"
echo "   tar -xzf appraizes-dockerhub.tar.gz -C appraizes"
echo "   cd appraizes"
echo "   chmod +x build-dockerhub.sh"
echo "   ./build-dockerhub.sh"
echo ""
echo "3. Após o envio da imagem para o Docker Hub, configure a stack no Portainer"
echo "   usando a imagem: fatec@fatec.info/appraizes:latest"
echo ""
echo "=================================================="
