# Usa una imagen base con Python y pip
FROM python:3.11-slim

# Crear el directorio de trabajo
WORKDIR /app

# Copiar los archivos del proyecto
COPY . .

# Instalar las dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Exponer el puerto Flask (por ejemplo 5003)
EXPOSE 5003

# Comando para ejecutar la app Flask
CMD ["python", "app.py"]
