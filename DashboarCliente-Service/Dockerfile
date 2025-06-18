# DashboarCliente-Service/Dockerfile
FROM python:3.10

WORKDIR /app

COPY . .

RUN pip install --upgrade pip && pip install -r requirements.txt

# Ejecutar flask_app.py desde la subcarpeta
CMD ["python", "prueba_python/flask_app.py"]
