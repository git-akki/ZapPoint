# ⚡ ZapPoint - Charging Station Management System

**ZapPoint** is a full-stack web application for managing Electric Vehicle (EV) charging stations. Users can register and login to create, update, and delete charging stations, view them in a list, and explore them on an interactive map.

---

## 🛠️ Tech Stack

**Frontend**
- [Vue 3](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- [Pinia](https://pinia.vuejs.org/) – State management
- [Vue Router](https://router.vuejs.org/)
- [Leaflet.js](https://leafletjs.com/) – For maps
- [Tailwind CSS](https://tailwindcss.com/)

**Backend**
- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/) + Mongoose
- [JWT](https://jwt.io/) – For authentication

**Deployment**
- Frontend: [Vercel](https://zap-point-m4cq.vercel.app/)
- Backend: [Render](https://zappoint.onrender.com) 
## 🧪 Postman Collection

You can test the API using this [ZapPoint Postman Collection](https://letsupgradexpostman.postman.co/workspace/Postman-API-Fundamentals-Studen~86518f50-9017-43a0-9d20-409177354b26/collection/39962658-aa1a8f5f-5a51-42c6-95cb-6bc15b724f04?action=share&creator=39962658).


---

## 🔧 Features

### 🧾 Authentication
- User Registration & Login
- JWT-based authentication
- Protected API routes

### 🔌 Charging Station Management
- Add new charging stations
- Update station information
- Delete a station
- Filter & search stations in a list

### 🗺️ Map Integration
- View stations on Leaflet Map (OpenStreetMap)
- Clickable markers with station info popup

---

## 📍 Station Fields

Each station includes the following attributes:

| Field           | Description                        |
|----------------|------------------------------------|
| `Name`         | Station name                       |
| `Location`     | Latitude & Longitude               |
| `Status`       | Active / Inactive                  |
| `Power Output` | Measured in kW                     |
| `Connector`    | Type of EV connector supported     |

---

## 🚀 Deployment

### Frontend (Vercel)

```bash
# Production build
npm install
npm run build