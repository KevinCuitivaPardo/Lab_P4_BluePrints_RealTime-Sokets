# Lab P4 — BluePrints en Tiempo Real (Sockets & STOMP)

> **Repositorio:** `DECSIS-ECI/Lab_P4_BluePrints_RealTime-Sokets`  
> **Front:** React + Vite (Canvas, CRUD, y selector de tecnología RT)  
> **Backends guía (elige uno o compáralos):**
> - **Socket.IO (Node.js):** https://github.com/DECSIS-ECI/example-backend-socketio-node-/blob/main/README.md
> - **STOMP (Spring Boot):** https://github.com/DECSIS-ECI/example-backend-stopm/tree/main

## 🎯 Objetivo del laboratorio
Implementar **colaboración en tiempo real** para el caso de BluePrints. El Front consume la API CRUD de la Parte 3 (o equivalente) y habilita tiempo real usando **Socket.IO** o **STOMP**, para que múltiples clientes dibujen el mismo plano de forma simultánea.

Al finalizar, el equipo debe:
1. Integrar el Front con su **API CRUD** (listar/crear/actualizar/eliminar planos, y total de puntos por autor).
2. Conectar el Front a un backend de **tiempo real** (Socket.IO **o** STOMP) siguiendo los repos guía.
3. Demostrar **colaboración en vivo** (dos pestañas navegando el mismo plano).

---

## 🧩 Alcance y criterios funcionales
- **CRUD** (REST):
  - `GET /api/blueprints?author=:author` → lista por autor (incluye total de puntos).
  - `GET /api/blueprints/:author/:name` → puntos del plano.
  - `POST /api/blueprints` → crear.
  - `PUT /api/blueprints/:author/:name` → actualizar.
  - `DELETE /api/blueprints/:author/:name` → eliminar.
- **Tiempo real (RT)** (elige uno):
  - **Socket.IO** (rooms): `join-room`, `draw-event` → broadcast `blueprint-update`.
  - **STOMP** (topics): `@MessageMapping("/draw")` → `convertAndSend(/topic/blueprints.{author}.{name})`.
- **UI**:
  - Canvas con **dibujo por clic** (incremental).
  - Panel del autor: **tabla** de planos y **total de puntos** (`reduce`).
  - Barra de acciones: **Create / Save/Update / Delete** y **selector de tecnología** (None / Socket.IO / STOMP).
- **DX/Calidad**: código limpio, manejo de errores, README de equipo.

---

## 🏗️ Arquitectura (visión rápida)

```
React (Vite)
 ├─ HTTP (REST CRUD + estado inicial) ───────────────> Tu API (P3 / propia)
 └─ Tiempo Real (elige uno):
     ├─ Socket.IO: join-room / draw-event ──────────> Socket.IO Server (Node)
     └─ STOMP: /app/draw -> /topic/blueprints.* ────> Spring WebSocket/STOMP
```

**Convenciones recomendadas**  
- **Plano como canal/sala**: `blueprints.{author}.{name}`  
- **Payload de punto**: `{ x, y }`

---

## 📦 Repos guía (clona/consulta)
- **Socket.IO (Node.js)**: https://github.com/DECSIS-ECI/example-backend-socketio-node-/blob/main/README.md  
  - *Uso típico en el cliente:* `io(VITE_IO_BASE, { transports: ['websocket'] })`, `join-room`, `draw-event`, `blueprint-update`.
- **STOMP (Spring Boot)**: https://github.com/DECSIS-ECI/example-backend-stopm/tree/main  
  - *Uso típico en el cliente:* `@stomp/stompjs` → `client.publish('/app/draw', body)`; suscripción a `/topic/blueprints.{author}.{name}`.

---

## ⚙️ Variables de entorno (Front)
Crea `.env.local` en la raíz del proyecto **Front**:
```bash
# REST (tu backend CRUD)
VITE_API_BASE=http://localhost:8080

# Tiempo real: apunta a uno u otro según el backend que uses
VITE_IO_BASE=http://localhost:3001     # si usas Socket.IO (Node)
VITE_STOMP_BASE=http://localhost:8080  # si usas STOMP (Spring)
```
En la UI, selecciona la tecnología en el **selector RT**.

---

## 🚀 Puesta en marcha

### 1) Backend RT (elige uno)

**Opción A — Socket.IO (Node.js)**  
Sigue el README del repo guía:  
https://github.com/DECSIS-ECI/example-backend-socketio-node-/blob/main/README.md
```bash
npm i
npm run dev
# expone: http://localhost:3001
# prueba rápida del estado inicial:
curl http://localhost:3001/api/blueprints/juan/plano-1
```

**Opción B — STOMP (Spring Boot)**  
Sigue el repo guía:  
https://github.com/DECSIS-ECI/example-backend-stopm/tree/main
```bash
./mvnw spring-boot:run
# expone: http://localhost:8080
# endpoint WS (ej.): /ws-blueprints
```

### 2) Front (este repo)
```bash
npm i
npm run dev
# http://localhost:5173
```
En la interfaz: selecciona **Socket.IO** o **STOMP**, define `author` y `name`, abre **dos pestañas** y dibuja en el canvas (clics).

---

## 🔌 Protocolos de Tiempo Real (detalle mínimo)

### A) Socket.IO
- **Unirse a sala**
  ```js
  socket.emit('join-room', `blueprints.${author}.${name}`)
  ```
- **Enviar punto**
  ```js
  socket.emit('draw-event', { room, author, name, point: { x, y } })
  ```
- **Recibir actualización**
  ```js
  socket.on('blueprint-update', (upd) => { /* append points y repintar */ })
  ```

### B) STOMP
- **Publicar punto**
  ```js
  client.publish({ destination: '/app/draw', body: JSON.stringify({ author, name, point }) })
  ```
- **Suscribirse a tópico**
  ```js
  client.subscribe(`/topic/blueprints.${author}.${name}`, (msg) => { /* append points y repintar */ })
  ```

---

## 🧪 Casos de prueba mínimos
- **Estado inicial**: al seleccionar plano, el canvas carga puntos (`GET /api/blueprints/:author/:name`).  
- **Dibujo local**: clic en canvas agrega puntos y redibuja.  
- **RT multi-pestaña**: con 2 pestañas, los puntos se **replican** casi en tiempo real.  
- **CRUD**: Create/Save/Delete funcionan y refrescan la lista y el **Total** del autor.

---

## 📊 Entregables del equipo
1. Código del Front integrado con **CRUD** y **RT** (Socket.IO o STOMP).  
2. **Video corto** (≤ 90s) mostrando colaboración en vivo y operaciones CRUD.  
3. **README del equipo**: setup, endpoints usados, decisiones (rooms/tópicos), y (opcional) breve comparativa Socket.IO vs STOMP.

---

## 🧮 Rúbrica sugerida
- **Funcionalidad (40%)**: RT estable (join/broadcast), aislamiento por plano, CRUD operativo.  
- **Calidad técnica (30%)**: estructura limpia, manejo de errores, documentación clara.  
- **Observabilidad/DX (15%)**: logs útiles (conexión, eventos), health checks básicos.  
- **Análisis (15%)**: hallazgos (latencia/reconexión) y, si aplica, pros/cons Socket.IO vs STOMP.

---

## 🩺 Troubleshooting
- **Pantalla en blanco (Front)**: revisa consola; confirma `@vitejs/plugin-react` instalado y que `AppP4.jsx` esté en `src/`.  
- **No hay broadcast**: ambas pestañas deben hacer `join-room` al **mismo** plano (Socket.IO) o suscribirse al **mismo tópico** (STOMP).  
- **CORS**: en dev permite `http://localhost:5173`; en prod, **restringe orígenes**.  
- **Socket.IO no conecta**: fuerza transporte WebSocket `{ transports: ['websocket'] }`.  
- **STOMP no recibe**: verifica `brokerURL`/`webSocketFactory` y los prefijos `/app` y `/topic` en Spring.

---

## 🔐 Seguridad (mínimos)
- Validación de payloads (p. ej., zod/joi).  
- Restricción de orígenes en prod.  
- Opcional: **JWT** + autorización por plano/sala.

---

## 📄 Licencia
MIT (o la definida por el curso/equipo).

---

## 👥 README del equipo (implementación del Front)

### Setup
```bash
cp .env.example .env.local   # ajusta URLs
npm i
npm run dev                  # http://localhost:5173
```

### Estructura
- `src/App.jsx` — estado, barra de acciones (Create / Save/Update / Delete) y selector RT (None / Socket.IO / STOMP).
- `src/components/BlueprintCanvas.jsx` — canvas con dibujo por clic.
- `src/components/AuthorPanel.jsx` — tabla de planos y total de puntos (`reduce`).
- `src/lib/api.js` — cliente REST (`VITE_API_BASE`).
- `src/lib/useRealtime.js` — hook RT: conecta/desconecta según tecnología, autor y plano.

### Endpoints usados
`GET /api/blueprints?author=`, `GET|PUT|DELETE /api/blueprints/:author/:name`, `POST /api/blueprints`.

### Decisiones
- Sala/tópico por plano: `blueprints.{author}.{name}` (aislamiento entre planos).
- Con RT activo, el clic **no** pinta localmente: se publica el punto y se repinta con el `blueprint-update` / mensaje del tópico (fuente única de verdad, igual en todas las pestañas). Con `None` el punto se agrega localmente y se persiste con Save/Update.
- Socket.IO: `join-room` se reemite en cada `connect` (reconexión). STOMP: `reconnectDelay` 1s y re-suscripción en `onConnect`.
- El payload de actualización puede traer `points` (plano completo) o `point` (incremental); ambos se soportan.

### Backend usado (extensión de Lab P1)
El front consume `Lab_P1_BluePrints_Java21_API`, al que se añadió:
- `PUT /api/v1/blueprints/{author}/{name}` (reemplaza los puntos) y `DELETE /api/v1/blueprints/{author}/{name}`.
- STOMP en el mismo servidor: endpoint `/ws-blueprints`, publicar en `/app/draw`, suscribirse a `/topic/blueprints.{author}.{name}`. Persiste el punto (crea el plano si no existe) y emite el plano completo.
- CORS para `http://localhost:5173`.

```bash
# backend (puerto 8080)
mvn spring-boot:run
# front (.env.local con VITE_API_BASE=http://localhost:8080 y VITE_STOMP_BASE=http://localhost:8080)
npm run dev
```
Socket.IO sigue disponible en el selector pero requiere el backend Node de la guía (`VITE_IO_BASE`); con STOMP no hace falta nada más.

### Observabilidad y seguridad mínima (backend)
- Health check: `GET /actuator/health`.
- Logs: conexión, suscripción y desconexión STOMP, y cada `draw` (`draw autor/plano -> N puntos`).
- Validación: `/app/draw` ignora (con `warn`) payloads sin autor/plano/punto, con nombres > 100 caracteres o coordenadas fuera de ±10 000. CORS restringido a `http://localhost:5173`.

### Hallazgos (STOMP, pruebas locales)
| Prueba | Resultado |
|---|---|
| Latencia emisor → otro cliente (200 puntos secuenciales, localhost) | p50 ≈ 1.3 ms, p95 ≈ 2.5 ms, máx ≈ 46 ms |
| Replicación entre 2 pestañas (navegador) | Canvas idéntico en ambas (mismos píxeles) |
| Aislamiento por plano | Un cliente suscrito a otro plano no recibe nada |
| Reconexión (servidor caído y vuelto a levantar) | El front pasa a `connecting` y vuelve a `connected` ~3 s después de que el servidor responde; se re-suscribe y el dibujo vuelve a replicarse |
| Estado tras reiniciar el backend | Con persistencia en memoria se pierde lo no guardado; usar el perfil `postgres` para persistir |

Nota: con dos clientes dibujando a la vez, el orden de los puntos lo define el orden de llegada al servidor.

### Comparativa Socket.IO vs STOMP
| | Socket.IO | STOMP |
|---|---|---|
| Modelo | Eventos propios + *rooms* (`join-room`, `draw-event`) | Protocolo de mensajería con destinos (`/app/*`, `/topic/*`) |
| Aislamiento por plano | Room por plano; el servidor gestiona la membresía | Un tópico por plano; el broker gestiona la suscripción |
| Reconexión | Integrada (hay que reenviar `join-room` en cada `connect`) | `reconnectDelay` de stompjs; hay que re-suscribir en `onConnect` |
| Integración | Ideal con Node | Natural con Spring (`@MessageMapping`, `SimpMessagingTemplate`) y comparte servicios/persistencia con el REST |
| Estándar | Protocolo propio (cliente y servidor deben ser Socket.IO) | Estándar abierto, interoperable con otros brokers |
| Decisión del equipo | — | Se eligió STOMP: el estado REST y el de tiempo real son el mismo servicio |

### Socket.IO (backend guía `example-backend-socketio-node-`)
Se usó el backend de la guía sin modificarlo; el front funciona con **ambas** tecnologías.
```bash
# backend Socket.IO (puerto 3001)
git clone https://github.com/DECSIS-ECI/example-backend-socketio-node- && cd example-backend-socketio-node- && npm i && npm run dev
# REST/CRUD sigue siendo el backend P1 (8080); VITE_IO_BASE=http://localhost:3001
```
Diferencias que el front resuelve:
- El servidor hace `socket.to(room).emit(...)` → **no devuelve el punto a quien dibuja**, así que el front lo pinta localmente al hacer clic.
- Emite solo los **puntos nuevos** (`points:[point]`), no el plano completo → el front los agrega (con STOMP el servidor envía el plano completo y se reemplaza).
- No persiste ni valida: el estado inicial viene del REST (P1) y lo dibujado solo queda guardado tras **Save/Update**.
- Prueba en 2 pestañas (autor `juan`, plano `plano-1`, 4 clics alternados): canvas idéntico en ambas. Si dos usuarios dibujan a la vez, el **orden de los puntos puede diferir** entre pestañas (cada una pone los suyos primero), algo que STOMP evita porque el servidor decide el orden.
