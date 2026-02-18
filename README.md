# Presentation Timer ⏱

Temporizador profesional para presentaciones en tiempo real, sin backend, pensado para eventos con tiempos muy ajustados.

## Características

- **Modo Configuración**: define presentadores, secciones (con minutos y segundos), rango de tiempo mínimo/máximo y reordena arrastrando
- **Modo Presentación**: countdown grande, contador negativo al superar el tiempo, indicador de adelanto/retraso respecto al planning
- **Tiempo real**: mide el tiempo de reloj real transcurrido desde el inicio de la presentación, no el tiempo teórico de las secciones
- **Controles**: Play/Pause, anterior/siguiente (botones + teclado: `Espacio`, `←`, `→`)
- **Timer drift-free**: usa `requestAnimationFrame` + `performance.now()` para máxima precisión
- **Persistencia**: toda la configuración se guarda automáticamente en `localStorage`
- **Sin dependencias pesadas**: React + Vite, CSS vanilla, sin librerías de UI

## Requisitos

- [Node.js](https://nodejs.org/) ≥ 18

## Instalación

```bash
git clone <repo-url>
cd timer
npm install
```

## Uso

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

### Build de producción

```bash
npm run build
npm run preview
```

## Estructura del proyecto

```
src/
├── main.jsx                # Punto de entrada
├── App.jsx                 # Componente raíz, gestión de estado y modos
├── index.css               # Estilos globales
├── hooks/
│   └── useTimer.js         # Hook drift-free con requestAnimationFrame
└── components/
    ├── ConfigPanel.jsx     # Panel de configuración (presentadores, secciones, drag & drop)
    ├── PresentationView.jsx # Vista de presentación (countdown, progreso, schedule diff)
    ├── TimerDisplay.jsx    # Display del contador MM:SS / -MM:SS
    └── Controls.jsx        # Botones Play/Pause, Prev, Next
```

## Atajos de teclado (modo presentación)

| Tecla | Acción |
|-------|--------|
| `Espacio` | Play / Pause |
| `→` | Siguiente sección |
| `←` | Sección anterior |

## Tecnologías

- React 19
- Vite 6
- CSS vanilla
- Google Fonts (Inter, JetBrains Mono)

## Licencia

MIT
