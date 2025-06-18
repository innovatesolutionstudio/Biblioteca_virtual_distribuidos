# Imagen base oficial de Node.js
FROM node:20

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar los archivos de dependencias (package.json y package-lock.json si existe)
COPY package*.json ./

# Instalar las dependencias definidas
RUN npm install

# Copiar todo el código de la app al contenedor
COPY . .

# Exponer el puerto en el que corre el servidor central (debe coincidir con app.js)
EXPOSE 3000

# Comando para arrancar la aplicación
CMD ["node", "app.js"]
