# Prueba_tecnica_API_fechas_habiles_Colombia

## Descripción

Este proyecto implementa un **servicio REST en Node.js + Express + TypeScript** que calcula la **fecha y hora hábil siguiente** a partir de una fecha inicial, considerando:

- **Horario laboral:** lunes a viernes, de **8:00 a.m. a 5:00 p.m. (hora Colombia)**
- **Exclusión de fines de semana y festivos**
- **Cálculo basado en horas y/o días hábiles**

---

## Tecnologías utilizadas

- Node.js + Express
- TypeScript
- Luxon (manejo de fechas y zonas horarias)
- dotenv (variables de entorno)
- ts-node-dev / nodemon (desarrollo)

---

## Instalación y configuración

### Clonar el repositorio

```bash
git clone https://github.com/AndresRojo12/Prueba_tecnica_API_fechas_habiles_Colombia.git
cd Prueba_tecnica_API_fechas_habiles_Colombia

# Instalar dependencias
npm install

# Configurar el entorno
- Crear un archivo .env en la raiz del proyecto, en el archivo .env.example esta el contenido para colocar en el .env

# Ejecutar el servidor
- npm run dev

# Modo producción
npm run build
npm start

# El servidor quedara disponible en:
- https://prueba-tecnica-api-fechas-habiles.onrender.com/
# Ruta principal

- /calculate-date
- ejemplo de solicitud: GET: http://localhost:3001/calculate-date?date=2025-04-10T15:00:00Z&days=5&hours=4


