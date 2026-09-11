# Agenda Diaria

Agenda digital mobile-first: cada día es una página, anotás lo que tenés que hacer,
tachás lo que hiciste, y lo que no hiciste se corre solo al día siguiente.

Stack: Vite + React + TypeScript + Tailwind, Supabase (auth + base de datos), PWA
instalable, alojado en Cloudflare Pages.

## Desarrollo local

1. Instalar dependencias:

   ```bash
   npm install
   ```

2. Copiar `.env.example` a `.env` (ya viene precargado con las credenciales del
   proyecto `agenda-diaria` en Supabase):

   ```bash
   cp .env.example .env
   ```

3. Levantar el servidor de desarrollo:

   ```bash
   npm run dev
   ```

## Supabase

- Proyecto: `agenda-diaria` (ref `hbyiudfncymityzoatcy`, región `sa-east-1`).
- Esquema documentado en [`supabase/schema.sql`](supabase/schema.sql).
- Auth: email + contraseña. Row Level Security activo en `tasks` y `daily_notes`
  (cada usuario solo ve sus propias filas).
- El rollover automático (tareas no hechas que se pasan al día siguiente) corre
  vía la función `rollover_tasks(date)`, invocada una vez por sesión desde el
  cliente al cargar la app.

## Deploy en Cloudflare Pages

1. Subir este repo a GitHub (ver comandos abajo).
2. En el dashboard de Cloudflare → **Workers & Pages → Create → Pages → Connect to Git**,
   elegir el repo.
3. Configuración de build:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Variables de entorno (Settings → Environment variables), iguales a las de `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_VAPID_PUBLIC_KEY`
5. Deploy. Cada push a la rama principal genera un deploy automático.

### Subir a GitHub

```bash
git init
git add .
git commit -m "Agenda Diaria: MVP"
git branch -M main
git remote add origin <URL_DE_TU_REPO_EN_GITHUB>
git push -u origin main
```

## Diseño

La identidad visual sigue el mockup de Claude Design ("tinta sobre papel"):
fondo gris-blanco (`#EEF1F3`), tinta negro/azul (`#111827` / `#0F5F8A`) para lo
normal, rojo (`#B4472A`) solo para lo atrasado. Tipografía Crimson Pro (serif,
fechas y títulos) + Archivo (sans, UI). El detalle pixel a pixel de cada
pantalla está en el handoff original `Agenda Diaria.dc.html` (exportado desde
Claude Design).

## Funcionalidades implementadas

- Vista Hoy: línea de tiempo (tareas con horario) + "Sueltas" (sin horario).
- Rollover automático (respeta el toggle "¿se pasa sola a mañana?" por tarea).
- Navegación día a día, selector de calendario (tira de la semana + mes + atajos
  Hoy/Mañana/próximo lunes).
- Categorías, prioridad (alta/media/baja) y subtareas por tarea.
- "Copiar el día de ayer" en el estado vacío.
- Vista semanal (grilla de 7 días) y "Cómo vas" (racha, % cumplido, arrastradas,
  por categoría, mejor/peor día).
- Cuenta con email/contraseña, sync con Supabase, PWA instalable.
- Tamaño de letra ajustable (Ajustes → Normal/Grande/Muy grande/Mono).
- **Alarmas y notificaciones por tarea**: toda tarea con horario manda una
  notificación push (llega aunque el celular esté bloqueado o la app cerrada).
  Si se activa la alarma de esa tarea, el aviso suena/vibra más fuerte y no se
  cierra solo — a la hora exacta o los minutos antes que elijas. Ver detalle
  técnico y limitaciones en [`supabase/functions/send-task-reminders`](supabase/functions/send-task-reminders).
  **En iPhone requiere instalar la app** ("Agregar a pantalla de inicio") — es
  una restricción de Apple para cualquier sitio web, no algo propio de esta app.

## Roadmap pendiente

- Swipe gestures (deslizar para completar/posponer).
- Buscador de tareas pasadas.
- Nota rápida del día.
- Carga rápida por voz.
- Integración con Google Calendar.
