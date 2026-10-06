# Farmacia

Evaluación N.° 02 — Desarrollo de Aplicaciones Web Avanzado

Aplicación web con **Node.js + Express + PostgreSQL (pg) + EJS + JWT**, que implementa
autenticación por roles y el CRUD completo de **dos entidades relacionadas**:
**Laboratorio 1 : N OrdenCompra**.

- **Repositorio:** <https://github.com/edi2-star/Farmacia>
- **Despliegue:** Render (Web Service) + PostgreSQL.
- **Health check:** `GET /health`

---

## 1. Objetivo

Desarrollar una aplicación MVC profesional que cumpla la Evaluación N.° 02 de *Desarrollo de
Aplicaciones Web Avanzado*:

- Autenticación **JWT** (registro, login, logout, protección de rutas y roles).
- Base de datos **bd_Farmacia** en PostgreSQL.
- Dos entidades relacionadas (**Laboratorio** y **OrdenCompra**) con relación 1:N.
- **CRUD completo** (listar, crear, editar, eliminar y buscar).
- Datos precargados mediante un **seed**.
- Validaciones **en el frontend y en el backend**.
- Interfaz con **Bootstrap 5** que cambia según el rol del usuario.

> Nota: la evaluación original describía tablas SQL con Sequelize. En este proyecto se
> usan **tablas PostgreSQL** mediante el driver **pg**, respetando el diagrama original.

---

## 2. Tecnologías

| Capa | Tecnología |
|------|------------|
| Backend | Node.js + Express |
| Base de datos | PostgreSQL + pg |
| Vistas | EJS |
| Autenticación | JWT (jsonwebtoken) + cookies HttpOnly |
| Seguridad de contraseñas | bcryptjs |
| Frontend | Bootstrap 5 + Bootstrap Icons + CSS propio + JavaScript (validaciones) |
| Configuración | dotenv |

---

## 3. Estructura del proyecto

```
.
├── app.js                     # Configuración de Express (middlewares y rutas)
├── server.js                  # Punto de entrada (conexión a BD + listen)
├── package.json
├── .env                       # Variables reales (NO se sube a git)
├── .env.example               # Plantilla de variables de entorno
├── README.md
└── src/
    ├── config/
    │   └── database.js        # Conexión centralizada a PostgreSQL (pg)
    ├── models/
    │   ├── Usuario.js
    │   ├── Laboratorio.js
    │   └── OrdenCompra.js
    ├── middleware/
    │   ├── auth.middleware.js # verifyToken / adjuntarUsuario (JWT)
    │   ├── roles.middleware.js# authorizeRoles(...roles)
    │   └── flash.middleware.js# Mensajes de éxito/error en las vistas
    ├── controllers/
    │   ├── auth.controller.js
    │   ├── laboratorio.controller.js
    │   ├── ordenCompra.controller.js
    │   └── web.controller.js
    ├── routes/
    │   ├── auth.routes.js
    │   ├── web.routes.js
    │   ├── laboratorio.routes.js
    │   └── ordenCompra.routes.js
    ├── views/
    │   ├── partials/ (head, navbar, messages, footer)
    │   ├── auth/ (login, registro)
    │   ├── laboratorio/index.ejs
    │   ├── ordenCompra/index.ejs
    │   ├── menu.ejs
    │   └── error.ejs
    ├── public/
    │   ├── css/styles.css
    │   └── js/ (validations.js, laboratorio.js, ordenCompra.js)
    └── seed.js                # Datos iniciales
```

---

## 4. Instalación

```bash
npm install
```

---

## 5. Configuración de `.env`

Copia `.env.example` a `.env` y ajusta los valores:

```env
PORT=4000
DATABASE_URL=postgresql://usuario:clave@127.0.0.1:5432/bd_Farmacia
PGSSL=false
JWT_SECRET=una_clave_segura
JWT_EXPIRES_IN=2h
```

> El `JWT_SECRET` nunca se escribe en el código: solo se lee desde `process.env`.

---

## 6. Cómo iniciar PostgreSQL

- **Local (Windows):** inicia el servicio *PostgreSQL* (`services.msc`) y crea la base
  `bd_Farmacia`. Verifica que escuche en `127.0.0.1:5432`.
- **Producción (Render):** crea una instancia de **PostgreSQL** en Render y usa su
  `internalConnectionString` como `DATABASE_URL`. El esquema se crea automáticamente al
  arrancar y los datos iniciales se cargan si la base está vacía.
  **No es necesario cambiar nada más en el código.**

---

## 7. Ejecutar el seed (datos iniciales)

```bash
npm run seed
```

Crea (sin duplicar) en **bd_Farmacia**:

- 3 usuarios (administrador, moderador, usuario)
- 3 laboratorios
- 4 órdenes de compra

---

## 8. Ejecutar la aplicación

```bash
npm run dev     # con nodemon (desarrollo)
npm start       # producción
```

URL local: <http://localhost:4000>

---

## 9. Roles y usuarios de prueba

| Rol | Email | Contraseña | Permisos |
|-----|-------|------------|----------|
| administrador | `admin@farmacia.com` | `admin123` | CRUD completo (crear, editar, eliminar, consultar) |
| moderador | `moderador@farmacia.com` | `moderador123` | Crear, editar y consultar (no elimina) |
| usuario | `usuario@farmacia.com` | `usuario123` | Solo consulta |

El **registro público** siempre crea usuarios con rol `usuario`.
Las contraseñas se almacenan **hasheadas con bcrypt**.

La **barra de navegación cambia según el rol**:

- **Administrador / Moderador:** `Inicio`, `Compras ▾` (Órdenes de compra), `Almacén ▾` (Laboratorios).
- **Usuario:** `Inicio`, enlaces de solo consulta a `Laboratorios` y `Órdenes de compra`.
- Todos: menú de usuario con nombre, rol y **Cerrar sesión**.

Además de ocultar los botones, **el backend protege cada ruta** con `verifyToken` y
`authorizeRoles(...)`.

---

## 10. Funcionalidades

- Registro, login y logout con **JWT en cookie HttpOnly**.
- Protección de rutas y control de acceso por roles.
- Menú principal (`/menu`) con accesos según el rol.
- CRUD de **Laboratorios** (código, razón social, dirección, teléfono, email, contacto).
- CRUD de **Órdenes de Compra** (nro., fecha, situación, total, laboratorio, nro. factura).
- **Buscador** en la barra superior que filtra el listado actual.
- **Modales** Bootstrap para crear/editar con validación previa.
- **Eliminación con confirmación**.
- Mensajes de éxito/error.
- Validaciones **frontend (JS)** y **backend (controladores)**.

---

## 11. Relación Laboratorio 1:N OrdenCompra

```
Laboratorio (1) ────< OrdenCompra (N)
```

- `ordenes_compra.codlab` es una **clave foránea** (`FOREIGN KEY`) que referencia `laboratorios(id)`.
- En las vistas y en la API la consulta hace un `LEFT JOIN` para mostrar
  `CodLab - razonSocial` del laboratorio.
- Al crear/editar una orden, el formulario usa un **SELECT de laboratorios** y guarda
  internamente el `id` (nunca se escribe un id a mano).
- No se permite eliminar un laboratorio que tenga órdenes asociadas.

### Modelo de datos

**Laboratorio**
| Campo | Tipo | Reglas |
|-------|------|--------|
| CodLab | String | único, obligatorio |
| razonSocial | String | obligatorio |
| direccion | String | obligatorio |
| telefono | String | obligatorio |
| email | String | obligatorio, formato email |
| contacto | String | obligatorio |

**OrdenCompra**
| Campo | Tipo | Reglas |
|-------|------|--------|
| NroOrdenC | String | único, obligatorio |
| fechaEmision | Date | obligatorio |
| Situacion | String | obligatorio |
| Total | Number | obligatorio, ≥ 0 |
| CodLab | INTEGER → laboratorios(id) | obligatorio, clave foránea |
| NrofacturaProv | String | obligatorio |

**Usuario** (auxiliar de autenticación)
| Campo | Tipo | Reglas |
|-------|------|--------|
| nombre | String | obligatorio |
| email | String | único, obligatorio |
| password | String | hash bcrypt |
| role | String | administrador / moderador / usuario |

---

## 12. Rutas principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/POST | `/registro` | Registro de usuario (rol `usuario`) |
| GET/POST | `/login` | Inicio de sesión (JWT en cookie) |
| GET/POST | `/logout` | Cierre de sesión |
| GET | `/menu` | Menú principal (protegido) |
| GET | `/laboratorios` | Vista del listado de laboratorios |
| GET/POST/PUT/DELETE | `/api/laboratorios[/:id]` | API CRUD de laboratorios |
| GET | `/ordenes-compra` | Vista del listado de órdenes de compra |
| GET/POST/PUT/DELETE | `/api/ordenes-compra` | API CRUD de órdenes de compra |

---

## 13. Despliegue

### Ejecución local

```bash
npm install
npm run seed
npm run dev
```

### Producción (Render)

La aplicación está preparada para desplegarse en **Render** como Web Service:

- **Build Command:** `npm install` (o `npm ci` si se usa `package-lock.json`)
- **Start Command:** `npm start`
- **Health Check Path:** `/health`
- **Variables de entorno en Render:** `DATABASE_URL` (cadena interna de PostgreSQL),
  `PGSSL=false`, `JWT_SECRET`, `JWT_EXPIRES_IN=2h`, `NODE_ENV=production`
  (no definir `PORT`; Render lo inyecta).

**URL pública de producción:**

```
https://farmacia-edi2-star.onrender.com
```

Requisitos para publicar:

1. Establecer `NODE_ENV=production`.
2. Definir en el proveedor las variables `DATABASE_URL`, `PGSSL`, `JWT_SECRET`, `JWT_EXPIRES_IN` y `PORT`.
- Usar **PostgreSQL** (Render PostgreSQL) como base de datos en producción.
- `start` ya está listo (`node server.js`) y `process.env.PORT` se respeta.
- No subir `.env` (ya está en `.gitignore`).
- Las cookies se marcan `secure` automáticamente cuando `NODE_ENV=production` (requiere HTTPS).
- Al arrancar, la app crea las tablas si no existen y carga los datos iniciales si la base está vacía.

> No se modifica ningún servicio remoto (Render, etc.) sin autorización.