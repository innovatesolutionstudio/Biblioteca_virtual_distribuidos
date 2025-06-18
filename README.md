# 📚 Biblioteca Virtual - Sistema Distribuido con Microservicios

Este repositorio contiene el sistema distribuido completo de la **Biblioteca Virtual**, un proyecto educativo e histórico desarrollado con enfoque en tecnologías emergentes, microservicios, bases de datos distribuidas y herramientas de inteligencia artificial para Bolivia.

## 🧩 Estructura del Proyecto

Este sistema está compuesto por múltiples servicios independientes que se comunican entre sí:

| Carpeta | Descripción |
|--------|-------------|
| `Biblioteca-Servidor` | Servidor central donde se integran todos los módulos. Maneja rutas y renderiza vistas. |
| `Chatbot-Service` | Servicio de chatbot con Cohere AI, conectado a Firebase para responder preguntas históricas. |
| `DashboarCliente-Service` | Panel interactivo para mostrar dashboards y analítica basada en los datos de usuarios. |
| `Elecciones-Service` | Módulo con estadísticas y visualización de elecciones bolivianas mediante gráficos. |
| `Libros-Service` | Servicio de gestión de libros: carga de PDF, generación de portada, almacenamiento en Firebase. |
| `PreguntaLB-Service` | Servicio especializado en responder preguntas sobre libros disponibles. |
| `mapa_bolivia` | Servicio Flask que muestra mapas históricos comparativos del territorio boliviano. |
| `base_datos` | Contiene la base de datos MySQL utilizada por algunos servicios (usuarios, roles, logs, etc). |
| `docker-compose.yml` | Archivo que orquesta todos los contenedores de microservicios del sistema. |

---
# base de datos 
## Para la base de datos MySql 

busca la carpeta base_datos ahi encontraras una script, cargalo en un motor de base de datos mysql (laragon)

##  Clave de Firebase Firestore

Para conectarse correctamente a Firestore en los microservicios que lo requieran (`Chatbot-Service`, `Libros-Service`, `PreguntaLB-Service`,`Bilioteca-Servidor`), debes crear en cada uno de ellos una carpeta llamada:
clave.json y agregar el siguiente codigo 
```bash
firebase/
*/
{
  "type": "service_account",
  "project_id": "biblioteca-virtual-96858",
  "private_key_id": "585f36cac309f3c9bfd1425825e8b7b475c29eb9",
  "private_key": "-----BEGIN PRIVATE KEY-----\\nMIIEuwIBADANBgkqhkiG9w0BAQEFAASCBKUwggShAgEAAoIBAQCpWF2ERNEvN8sr\\n...\\n-----END PRIVATE KEY-----\\n",
  "client_email": "firebase-adminsdk-fbsvc@biblioteca-virtual-96858.iam.gserviceaccount.com",
  "client_id": "116280243623776178171",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40biblioteca-virtual-96858.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}
*/
```
# Como hacer Correr en docker
## Paso 1: Verifica que tengas Docker y Docker Compose
```bash
docker --version
docker-compose --version
```

## Paso 2: En la raíz del proyecto (donde está docker-compose.yml), ejecuta:
```bash
docker-compose up --build
```

##Paso 3: Acceder a la plataforma
```bash
http://localhost:3000
```
