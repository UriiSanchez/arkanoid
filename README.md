# Juego de Arkanoid

Un juego de Arkanoid/Breakout hecho con **HTML, CSS y JavaScript puro, sin dependencias** (sin frameworks, sin npm, sin bundler). Se juega abriendo `index.html` directamente o sirviendo la carpeta como archivos estáticos.

## Cómo jugar

Abrí `index.html` en el navegador (o serví el proyecto con cualquier servidor estático).

**Controles:**

- **Mover la pala:** flechas ← → , teclas `A`/`D`, o moviendo el mouse sobre el canvas.
- **Lanzar la bola:** barra espaciadora (o clic, según el estado).
- **Pausar/reanudar:** `P` o `Escape`.
- **Sonido:** botón 🔊/🔇 en la esquina superior derecha del área de juego, activa/desactiva los efectos de sonido (se recuerda entre partidas).

**Progresión:** 3 vidas, puntuación acumulada, 5 niveles generados proceduralmente con dificultad creciente (más filas de bloques y bola más rápida en cada nivel). Vidas y puntuación se mantienen entre niveles; se reinician solo al perder la última vida o reiniciar la partida.

## Estructura del proyecto

```
index.html          Punto de entrada del juego
css/style.css        Estilos
js/game.js            Lógica del juego (estado, física, render, input)
assets/               Spritesheet, sonidos y el módulo assets/spritesheet.js
specs/                 Especificaciones del proyecto (ver más abajo)
```

## Desarrollo: flujo spec-driven

Este proyecto no se construye con código ad hoc: cada funcionalidad nace de una **spec** en `specs/` que se escribe, se aprueba y luego se implementa paso a paso. El detalle completo del flujo está en `CLAUDE.md`; resumen rápido:

1. `/spec <descripción>` — crea una spec nueva en estado `Borrador` en `specs/NN-slug.md`.
2. Un humano revisa la spec y la marca como `Aprobado`.
3. `/spec-impl NN-slug` — implementa la spec aprobada paso a paso, creando la rama `spec-NN-slug`.

Specs existentes (todas en estado `Implementado`):

- **`01-mvp-jugable.md`** — MVP jugable: pala, física de la bola, bloques, vidas/puntuación y pantallas de inicio/pausa/game over/victoria.
- **`02-explosion-bloques-y-boton-sonido.md`** — animación de explosión al romper bloques y botón para activar/desactivar el sonido.
- **`03-niveles-procedurales.md`** — 5 niveles generados proceduralmente con dificultad creciente.

## Requisitos

Ninguno más allá de un navegador moderno. No hay `package.json`, build system, linter ni test runner en este repo.
