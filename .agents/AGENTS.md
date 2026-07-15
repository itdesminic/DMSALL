# Contexto del Proyecto: DMSALL (CRM para Operaciones)

Este documento contiene el contexto arquitectónico, técnico y de negocio de este proyecto. **Debes leer y respetar estas reglas en todas las futuras interacciones y sesiones de asistencia.**

## 1. Arquitectura y Stack Tecnológico

El proyecto es un sistema web para el llenado y gestión de formularios operativos y reportes de seguridad en mina (Mina La Libertad). 

*   **Frontend (Cliente)**:
    *   **Framework**: React (inicializado con Vite).
    *   **Estilos**: Tailwind CSS.
    *   **Librerías Clave**: `react-router-dom` para ruteo (SPA), `react-signature-canvas` para capturar firmas digitales táctiles en dispositivos móviles.
    *   **Despliegue**: Vercel (URL de Producción: `https://dmsall.vercel.app`).
    *   **Reglas de Routing**: Usa `vercel.json` para hacer `rewrites` hacia `index.html` (comportamiento SPA).

*   **Backend (Servidor)**:
    *   **Framework**: Node.js con Express.
    *   **Base de Datos**: PostgreSQL alojada en Neon Serverless.
    *   **ORM**: Prisma (`schema.prisma` contiene la estructura de `User`, `Form`, `FormField`, `FormSubmission`, `Area`).
    *   **Librerías Clave**: `pdfkit` para la generación de PDFs oficiales con firmas incrustadas a partir de cadenas en Base64.
    *   **Despliegue**: Render (URL de Producción: `https://dmsall-backend.onrender.com`).

## 2. Lógica de Negocio y Flujos Críticos

*   **Formularios de Vehículos Livianos**:
    *   El formulario incluye campos dinámicos. El campo **"Día de la Semana"** se pre-llena automáticamente según la fecha del sistema, y el campo de **"Odómetro (Kilometraje)"** se inyecta en la base de datos automáticamente (sincronización inteligente en `formController.js`).
    *   Los selectores (Correcto, Incorrecto, Fatiga) inician **vacíos (en blanco)** para forzar al operador a tomar una decisión manual, previniendo alertas falsas al cargar la página.
    *   **Firma Digital**: Es opcional. Si el usuario la dibuja, se envía al backend como Base64 (PNG), se decodifica en un Buffer puro de Node y se estampa de forma precisa sobre la raya del documento PDF generado.
    *   **Alerta de Seguridad Crítica**: Si un usuario marca "Incorrecto" en alguna revisión o reporta fatiga ("Sí"), el frontend levanta una alerta visual inmediata y el backend marca el status del reporte como `rejected`.

*   **Panel Administrativo (Dashboard / Historial)**:
    *   En `ChecklistReports.jsx`, los administradores pueden filtrar la tabla maestra por placa, código o nombre del conductor.
    *   La exportación a Excel (CSV con separadores `;` y BOM UTF-8) descarga todos los reportes, incluyendo firmas lógicas y kilómetros (Odómetro).

## 3. Guías de Estilo y Comportamiento del Agente

*   **Idioma**: Toda la interfaz de usuario, comentarios de código y respuestas al cliente deben ser en **Español**, ya que la operación es en Nicaragua.
*   **Estilo UI**: Interfaz limpia, profesional, responsiva (mobile-first), utilizando los colores del tema y bordes redondeados tipo "Glassmorphism" y sombras suaves de Tailwind.
*   **Seguridad**: Nunca debes exponer ni reescribir variables de entorno de producción sin autorización explícita.
*   **Base de Datos**: Siempre que agregues un campo nuevo a una plantilla en `formController.js`, asegúrate de mantener la lógica de sincronización dinámica para no afectar los registros existentes.

## 4. Control de Versiones y Flujo de Despliegue (Git / GitHub)

*   **Repositorio Remoto**: El código fuente vive en GitHub bajo la organización/usuario `itdesminic`. El repositorio es `https://github.com/itdesminic/DMSALL.git`.
*   **Comandos de Push Automatizados**: Para desplegar cambios a producción, Vercel y Render están conectados a la rama `main` de este repositorio. Si necesitas hacer un commit y empujar código en nombre del usuario (ya que las políticas del sistema bloquean prompts interactivos de credenciales de Git), **debes** usar exactamente el siguiente comando en cadena para inyectar el token de acceso temporal y restaurar el origin:
    ```bash
    git add . ; git commit -m "feat/fix: mensaje" ; git push -u origin main
    ```
    *Nota: Sustituye "feat/fix: mensaje" por la descripción real del commit. Tras hacer push, los servidores en la nube compilarán y publicarán los cambios en ~1 a 3 minutos.*
