# Configuração do GitHub Actions para Deploy no Docker Hub

Este documento contém instruções para configurar o GitHub Actions para construir e enviar automaticamente a imagem Docker para o Docker Hub.

## Pré-requisitos

1. Repositório no GitHub
2. Conta no Docker Hub (já configurada como `fatec@fatec.info`)

## Configuração dos Segredos no GitHub

Para que o GitHub Actions possa fazer login no Docker Hub, você precisa configurar os seguintes segredos no seu repositório GitHub:

1. Acesse seu repositório no GitHub
2. Vá para "Settings" (Configurações)
3. No menu lateral, clique em "Secrets and variables" e depois em "Actions"
4. Clique no botão "New repository secret"
5. Adicione os seguintes segredos:

   - Nome: `DOCKERHUB_USERNAME`
   - Valor: `fatec@fatec.info`

   - Nome: `DOCKERHUB_TOKEN`
   - Valor: `F@tec555133#` (ou um token de acesso pessoal do Docker Hub para maior segurança)

## Como Funciona

O workflow configurado no arquivo `.github/workflows/docker-publish.yml` fará o seguinte:

1. Será acionado quando você fizer um push para as branches `main` ou `master`
2. Também pode ser acionado manualmente através da interface do GitHub
3. Fará login no Docker Hub usando as credenciais configuradas
4. Construirá a imagem Docker a partir do Dockerfile
5. Enviará a imagem para o Docker Hub com as tags:
   - `seu-usuario/appraizes:latest`
   - `seu-usuario/appraizes:[hash do commit]`

## Executando o Workflow Manualmente

Se você quiser executar o workflow manualmente:

1. Acesse seu repositório no GitHub
2. Vá para a aba "Actions"
3. Selecione o workflow "Docker Hub Publish" na lista
4. Clique no botão "Run workflow"
5. Selecione a branch e clique em "Run workflow"

## Verificando o Status

Você pode verificar o status da execução do workflow na aba "Actions" do seu repositório no GitHub.

Após a conclusão bem-sucedida, a imagem estará disponível no Docker Hub com o nome do seu usuário, por exemplo:
`seu-usuario/appraizes:latest`

## Usando a Imagem no Portainer

Depois que a imagem estiver no Docker Hub, você poderá configurar uma stack no Portainer usando a imagem:

```yaml
version: '3.8'

services:
  # Serviço para a aplicação (API + Frontend)
  app:
    image: seu-usuario/appraizes:latest
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
    networks:
      - appraizes-network
    volumes:
      - appraizes_logs:/app/logs

  # Serviço para o servidor web Nginx
  nginx:
    image: nginx:alpine
    container_name: appraizes-nginx
    restart: always
    ports:
      - "80:80"
    volumes:
      - nginx_config:/etc/nginx/conf.d
    depends_on:
      - app
    networks:
      - appraizes-network

networks:
  appraizes-network:
    driver: bridge

volumes:
  appraizes_logs:
    driver: local
  nginx_config:
    driver: local
```

Lembre-se de configurar o arquivo de configuração do Nginx no volume `nginx_config`.
