# Deploy da Aplicação Appraizes com Docker

Este documento contém instruções detalhadas para fazer o deploy da aplicação Appraizes utilizando Docker, conectando-se ao banco de dados existente. Inclui instruções para deploy local, no Docker Hub e em uma VPS.

## Pré-requisitos

- Docker instalado
- Docker Compose instalado
- Acesso ao banco de dados MySQL existente

## Estrutura de Arquivos

- `Dockerfile`: Configuração para construir a imagem da aplicação
- `docker-compose.yml`: Configuração para orquestrar os serviços (aplicação e nginx)
- `nginx.conf`: Configuração do servidor web Nginx
- `.env.docker`: Variáveis de ambiente para o ambiente Docker

## Instruções para Deploy

### 1. Configuração de Variáveis de Ambiente

Antes de iniciar o deploy, verifique e ajuste as variáveis de ambiente no arquivo `.env.docker`:

```env
# Configurações do banco de dados
DB_HOST=207.180.249.172
DB_PORT=3306
DB_USER=root
DB_PASSWORD=Fatec555133
DB_NAME=appraizes_db

# Configurações da API
API_PORT=3001
NODE_ENV=production
```

### 2. Deploy Automático

Execute o script de deploy:

```bash
# No Linux/Mac
chmod +x deploy-docker.sh
./deploy-docker.sh

# No Windows (PowerShell)
.\deploy-docker.sh
```

### 3. Deploy Manual

Se preferir fazer o deploy manualmente, siga estes passos:

1. **Copiar as variáveis de ambiente**:

   ```bash
   cp .env.docker .env
   ```

2. **Construir as imagens Docker**:

   ```bash
   docker-compose build
   ```

3. **Iniciar os serviços**:

   ```bash
   docker-compose up -d
   ```

4. **Verificar o status dos serviços**:

   ```bash
   docker-compose ps
   ```

## Acessando a Aplicação

- Frontend: [http://localhost](http://localhost)
- API: [http://localhost/api](http://localhost/api)
- Status da API: [http://localhost/api/status](http://localhost/api/status)

## Deploy no Docker Hub

Para publicar a imagem no Docker Hub e facilitar o deploy em outros ambientes, siga estes passos:

1. **Configurar credenciais**:

   Edite o arquivo `push-to-dockerhub.sh` e configure seu usuário e senha do Docker Hub:

   ```bash
   DOCKERHUB_USERNAME="seu_usuario"
   DOCKERHUB_PASSWORD="sua_senha" # Opcional, pode deixar em branco para digitar durante a execução
   IMAGE_NAME="appraizes"
   IMAGE_TAG="latest"
   ```

2. **Executar o script**:

   ```bash
   chmod +x push-to-dockerhub.sh
   ./push-to-dockerhub.sh
   ```

   No Windows (PowerShell):

   ```bash
   ./push-to-dockerhub.sh
   ```

## Deploy na VPS

Para fazer o deploy na sua VPS utilizando a imagem do Docker Hub:

1. **Configurar credenciais**:

   Edite o arquivo `deploy-to-vps.sh` e configure as informações da sua VPS:

   ```bash
   DOCKERHUB_USERNAME="seu_usuario"
   IMAGE_NAME="appraizes"
   IMAGE_TAG="latest"
   VPS_USER="usuario_vps"
   VPS_HOST="endereco_vps"
   VPS_PORT="22"
   ```

2. **Executar o script**:

   ```bash
   chmod +x deploy-to-vps.sh
   ./deploy-to-vps.sh
   ```

   No Windows (PowerShell):

   ```bash
   ./deploy-to-vps.sh
   ```

## Comandos Úteis

- **Visualizar logs**:

  ```bash
  docker-compose logs -f
  ```

- **Parar a aplicação**:

  ```bash
  docker-compose down
  ```

- **Reiniciar a aplicação**:

  ```bash
  docker-compose restart
  ```

- **Remover volumes (dados do banco)**:

  ```bash
  docker-compose down -v
  ```

## Estrutura dos Serviços

### 1. Aplicação (Node.js)

- Portas: 3001 (API) e 5173 (Frontend em desenvolvimento)
- Volumes: Código fonte e logs
- Conecta-se ao banco de dados MySQL existente (207.180.249.172)

### 2. Nginx (Servidor Web)

- Porta: 80
- Serve o frontend estático e faz proxy para a API

## Solução de Problemas

### Banco de dados não conecta

- Verifique se o serviço do banco de dados está em execução: `docker-compose ps`
- Verifique os logs do banco de dados: `docker-compose logs db`
- Verifique se as variáveis de ambiente estão corretas

### API não responde

- Verifique os logs da aplicação: `docker-compose logs app`
- Verifique se o banco de dados está acessível
- Tente reiniciar o serviço: `docker-compose restart app`

### Frontend não carrega

- Verifique os logs do Nginx: `docker-compose logs nginx`
- Verifique se a aplicação está gerando corretamente os arquivos estáticos
- Verifique se o Nginx está configurado corretamente
