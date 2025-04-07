#!/bin/bash

# Script para fazer deploy da aplicação Appraizes em uma VPS

# Variáveis
DOCKERHUB_USERNAME=""
IMAGE_NAME="appraizes"
IMAGE_TAG="latest"
VPS_USER=""
VPS_HOST=""
VPS_PORT="22"
VPS_DEPLOY_DIR="/home/$VPS_USER/appraizes"

# Verificar parâmetros
if [ -z "$DOCKERHUB_USERNAME" ]; then
    read -p "Digite seu usuário do Docker Hub: " DOCKERHUB_USERNAME
fi

if [ -z "$VPS_USER" ]; then
    read -p "Digite o usuário da VPS: " VPS_USER
fi

if [ -z "$VPS_HOST" ]; then
    read -p "Digite o endereço da VPS: " VPS_HOST
fi

# Criar arquivo docker-compose para a VPS
cat > docker-compose.vps.yml << EOL
version: '3.8'

services:
  # Serviço para a aplicação (API + Frontend)
  app:
    image: ${DOCKERHUB_USERNAME}/${IMAGE_NAME}:${IMAGE_TAG}
    container_name: appraizes-app
    restart: always
    environment:
      - NODE_ENV=production
      - DB_HOST=207.180.249.172
      - DB_PORT=3306
      - DB_USER=root
      - DB_PASSWORD=Fatec555133
      - DB_NAME=appraizes_db
      - API_PORT=3001
    ports:
      - "3001:3001"
      - "5173:5173"
    networks:
      - appraizes-network
    volumes:
      - ./logs:/app/logs

  # Serviço para o servidor web Nginx
  nginx:
    image: nginx:alpine
    container_name: appraizes-nginx
    restart: always
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - app
    networks:
      - appraizes-network

networks:
  appraizes-network:
    driver: bridge
EOL

# Criar script de deploy para executar na VPS
cat > deploy-script.sh << EOL
#!/bin/bash

# Script para executar na VPS

# Criar diretório de deploy se não existir
mkdir -p ${VPS_DEPLOY_DIR}
cd ${VPS_DEPLOY_DIR}

# Copiar arquivos de configuração
cp ~/nginx.conf ./nginx.conf
cp ~/docker-compose.vps.yml ./docker-compose.yml

# Criar diretório de logs
mkdir -p logs

# Fazer login no Docker Hub (se necessário)
# docker login -u ${DOCKERHUB_USERNAME}

# Parar containers existentes
docker-compose down

# Remover imagens antigas (opcional)
# docker rmi ${DOCKERHUB_USERNAME}/${IMAGE_NAME}:${IMAGE_TAG}

# Iniciar os serviços
docker-compose up -d

# Verificar status dos serviços
docker-compose ps

echo "Deploy concluído com sucesso!"
echo "A aplicação está disponível em: http://${VPS_HOST}"
echo "A API está disponível em: http://${VPS_HOST}/api"
EOL

# Copiar arquivos para a VPS
echo "Copiando arquivos para a VPS..."
scp -P $VPS_PORT docker-compose.vps.yml $VPS_USER@$VPS_HOST:~/docker-compose.vps.yml
scp -P $VPS_PORT nginx.conf $VPS_USER@$VPS_HOST:~/nginx.conf
scp -P $VPS_PORT deploy-script.sh $VPS_USER@$VPS_HOST:~/deploy-script.sh

# Executar script de deploy na VPS
echo "Executando script de deploy na VPS..."
ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "chmod +x ~/deploy-script.sh && ~/deploy-script.sh"

# Limpar arquivos temporários
rm docker-compose.vps.yml deploy-script.sh

echo "Deploy na VPS concluído com sucesso!"
echo "A aplicação está disponível em: http://${VPS_HOST}"
echo "A API está disponível em: http://${VPS_HOST}/api"
