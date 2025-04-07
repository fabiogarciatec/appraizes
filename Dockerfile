FROM node:20-alpine as build

WORKDIR /app

# Copiar arquivos de configuração
COPY package*.json ./
COPY vite.config.js ./

# Instalar dependências
RUN npm install

# Copiar código fonte
COPY . .

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

# Comando para iniciar a aplicação
CMD ["node", "src/server/newApi.cjs"]
