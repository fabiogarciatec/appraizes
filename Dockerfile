FROM node:20-alpine as build

WORKDIR /app

# Copiar arquivos de configuração
COPY package*.json ./
COPY vite.config.js ./

# Instalar dependências
RUN npm install

# Copiar código fonte
COPY . .

# Definir a URL base da API para o frontend
ENV VITE_API_BASE_URL="https://raizesapp.fatec.info"

# Construir o frontend
RUN npm run build

# Imagem de produção
FROM node:20-alpine

WORKDIR /app

# Copiar arquivos necessários para produção
COPY --from=build /app/dist ./dist
COPY --from=build /app/src/server ./src/server
COPY --from=build /app/package*.json ./
COPY --from=build /app/.env* ./

# Instalar apenas dependências de produção
RUN npm ci --only=production

# Criar diretório de logs
RUN mkdir -p /app/logs

# Expor portas
EXPOSE 5173
EXPOSE 3001

# Variáveis de ambiente
ENV NODE_ENV=production
ENV DB_HOST=207.180.249.172
ENV DB_PORT=3306
ENV DB_USER=root
ENV DB_PASSWORD=Fatec555133
ENV DB_NAME=appraizes_db
ENV API_PORT=3001

# Instalar o serve para servir arquivos estáticos
RUN npm install -g serve

# Criar script de inicialização
RUN echo '#!/bin/sh' > /app/start.sh
RUN echo 'node src/server/newApi.cjs &' >> /app/start.sh
RUN echo 'serve -s dist -l 5173' >> /app/start.sh
RUN chmod +x /app/start.sh

# Comando para iniciar a aplicação
CMD ["/bin/sh", "/app/start.sh"]
