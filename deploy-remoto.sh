#!/bin/bash

# Script para fazer deploy remoto da aplicação Appraizes

# Variáveis
DOCKERHUB_USERNAME="fatec@fatec.info"
DOCKERHUB_PASSWORD="F@tec555133#"
IMAGE_NAME="appraizes"
IMAGE_TAG="latest"
VPS_USER=""
VPS_HOST=""
VPS_PORT="22"
VPS_DEPLOY_DIR="/home/$VPS_USER/appraizes"

# Verificar parâmetros
if [ -z "$VPS_USER" ]; then
    read -p "Digite o usuário da VPS: " VPS_USER
fi

if [ -z "$VPS_HOST" ]; then
    read -p "Digite o endereço da VPS: " VPS_HOST
fi

# Criar diretório temporário para arquivos de deploy
TEMP_DIR="deploy_temp"
mkdir -p $TEMP_DIR

# Copiar arquivos necessários para o diretório temporário
cp Dockerfile $TEMP_DIR/
cp -r src $TEMP_DIR/
cp package.json $TEMP_DIR/
cp package-lock.json $TEMP_DIR/
cp vite.config.js $TEMP_DIR/
cp .env.docker $TEMP_DIR/.env
cp nginx.conf $TEMP_DIR/

# Criar docker-compose.yml para a VPS
cat > $TEMP_DIR/docker-compose.yml << EOL
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

# Criar script de build e deploy para executar na VPS
cat > $TEMP_DIR/build-and-deploy.sh << EOL
#!/bin/bash

# Script para construir e fazer deploy da aplicação na VPS

# Variáveis
DOCKERHUB_USERNAME="${DOCKERHUB_USERNAME}"
DOCKERHUB_PASSWORD="${DOCKERHUB_PASSWORD}"
IMAGE_NAME="${IMAGE_NAME}"
IMAGE_TAG="${IMAGE_TAG}"
DEPLOY_DIR="${VPS_DEPLOY_DIR}"

# Criar diretório de deploy se não existir
mkdir -p \${DEPLOY_DIR}
cd \${DEPLOY_DIR}

# Fazer login no Docker Hub
echo "\${DOCKERHUB_PASSWORD}" | docker login -u "\${DOCKERHUB_USERNAME}" --password-stdin

# Verificar se o login foi bem-sucedido
if [ \$? -ne 0 ]; then
    echo "Falha ao fazer login no Docker Hub. Verifique suas credenciais."
    exit 1
fi

echo "Login no Docker Hub realizado com sucesso!"

# Construir a imagem da aplicação
echo "Construindo a imagem da aplicação..."
docker build -t \${DOCKERHUB_USERNAME}/\${IMAGE_NAME}:\${IMAGE_TAG} .

# Enviar a imagem para o Docker Hub
echo "Enviando a imagem para o Docker Hub..."
docker push \${DOCKERHUB_USERNAME}/\${IMAGE_NAME}:\${IMAGE_TAG}

echo "Imagem enviada com sucesso para o Docker Hub!"

# Iniciar os serviços
echo "Iniciando serviços..."
docker-compose down
docker-compose up -d

# Verificar status dos serviços
docker-compose ps

echo "Deploy concluído com sucesso!"
echo "A aplicação está disponível em: http://\$(hostname -I | awk '{print \$1}')"
echo "A API está disponível em: http://\$(hostname -I | awk '{print \$1}')/api"
EOL

# Compactar arquivos para transferência
tar -czf appraizes-deploy.tar.gz -C $TEMP_DIR .

# Transferir arquivos para a VPS
echo "Transferindo arquivos para a VPS..."
scp -P $VPS_PORT appraizes-deploy.tar.gz $VPS_USER@$VPS_HOST:~/

# Executar script de deploy na VPS
echo "Executando script de deploy na VPS..."
ssh -p $VPS_PORT $VPS_USER@$VPS_HOST << EOF
mkdir -p $VPS_DEPLOY_DIR
tar -xzf ~/appraizes-deploy.tar.gz -C $VPS_DEPLOY_DIR
cd $VPS_DEPLOY_DIR
chmod +x build-and-deploy.sh
./build-and-deploy.sh
EOF

# Limpar arquivos temporários
rm -rf $TEMP_DIR
rm appraizes-deploy.tar.gz

echo "Deploy na VPS iniciado com sucesso!"
echo "Verifique o status do deploy na sua VPS."
