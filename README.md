# ◈ TaskFlow

**TaskFlow** es un gestor de tareas minimalista diseñado bajo una estética de "Editorial Suizo Modernizado". No es solo una lista de pendientes; es un entorno de enfoque que integra la metodología Pomodoro para maximizar la productividad sin distracciones visuales.

<img width="1280" height="894" alt="image" src="https://github.com/user-attachments/assets/07c26400-beac-4bd1-ab3f-62af8ed93386" />


## ✦ Características Principales

* **Gestión de Tareas Inteligente:** Crea, edita y organiza tareas con categorías visuales (Trabajo, Personal, Urgente).
* **Temporizador Pomodoro Integrado:** Ciclos de 25/5 minutos con un anillo de progreso dinámico en SVG para mantener el flujo de trabajo.
* **Sistema de Filtros:** Visualiza rápidamente todas tus tareas, solo las pendientes, las completadas o fíltralas por su categoría específica.
* **Persistencia Local:** Tus tareas y el contador de sesiones Pomodoro se guardan automáticamente en el navegador (`localStorage`), por lo que no perderás tus datos al recargar.
* **Diseño Adaptive & Dark Mode:** Interfaz optimizada para una fatiga visual mínima con una paleta de colores Pizarra y Cobalto.
* **Notificaciones Nativas:** Alertas del sistema cuando finaliza una sesión de enfoque o descanso.

## 🛠️ Tecnologías Utilizadas

Este proyecto fue construido utilizando tecnologías web estándar para garantizar ligereza y velocidad:

* **HTML5 & CSS3:** Arquitectura semántica y diseño basado en CSS Variables y Flexbox/Grid.
* **JavaScript (Vanilla JS):** Lógica de estado, manipulación del DOM y gestión de temporizadores sin dependencias externas.
* **Google Fonts:** Uso de *Syne* para titulares con carácter y *DM Sans/Mono* para legibilidad técnica.

## 📂 Estructura del Proyecto

```text
├── index.html          # Estructura principal de la aplicación
├── css/
│   └── style.css       # Estilos (Layout, Temas, Animaciones)
├── js/
│   ├── app.js          # Lógica del CRUD de tareas y filtros
│   └── pomodoro.js     # Lógica del temporizador y notificaciones
└── assets/             # Recursos visuales
```

## 🚀 Instalación y Uso
1. Clona este repositorio o descarga los archivos.

2. Asegúrate de que la estructura de carpetas sea la correcta (especialmente las rutas de CSS y JS en el index.html).

3. Abre el archivo index.html en cualquier navegador moderno.

4. Atajos de Teclado
- Espacio: Iniciar o pausar el temporizador Pomodoro (cuando el modal está abierto).

- Esc: Cerrar ventanas modales.

## 📋 Próximas Mejoras (Roadmap)
* [ ] Implementación de Drag & Drop para reordenar prioridades.

* [ ] Exportación de datos en formato JSON.

* [ ] Estadísticas semanales de productividad.

Creado con enfoque y orden. TaskFlow — 2026.
