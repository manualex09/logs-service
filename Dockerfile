# Imagen base con Node
FROM node:18-alpine

# Carpeta de trabajo dentro del contenedor
WORKDIR /usr/src/app

ARG HTTP_PROXY
ARG HTTPS_PROXY

# Copiar package.json y package-lock.json
COPY package*.json ./

ENV HTTP_PROXY=$HTTP_PROXY
ENV HTTPS_PROXY=$HTTPS_PROXY

# Instalar dependencias
RUN npm install

ENV HTTP_PROXY=""
ENV HTTPS_PROXY=""

# Copiar el resto del código
COPY . .

# Compilar el proyecto (NestJS usa TypeScript)
RUN npm run build

# Exponer el puerto (NestJS suele usar 3000)
EXPOSE 3000

# Comando para arrancar la app en modo producción
CMD ["npm", "run", "start:prod"]
