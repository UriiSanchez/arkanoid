# 01 - MVP jugable de Arkanoid

**Estado:** implementado
**Depende de:** Ninguno
**Fecha:** 2026-09-13

**Objetivo:** Crear un MVP jugable de Arkanoid con un solo nivel fijo, pala controlable por teclado o ratón, sistema de vidas y puntuación, y pantallas de inicio, pausa, game over y victoria.

## Alcance

**Incluye:**

- Un canvas HTML donde se renderiza el juego usando `assets/spritesheet.js` (`drawSprite`/`drawFrame`) para pala, bola y bloques.
- Control de la pala tanto con teclado (flechas o A/D) como con el ratón (la pala sigue la posición horizontal del cursor sobre el canvas).
- Física de bola: movimiento continuo, rebote en paredes laterales y superior, rebote en la pala con ángulo variable según el punto de impacto (golpear cerca del borde de la pala desvía más la bola), y detección de colisión con bloques (el bloque golpeado se destruye y la bola rebota).
- Un único nivel con un layout fijo de bloques (número de filas/columnas y distribución de colores queda a criterio de implementación, usando los `block_<color>` definidos en `assets/spritesheet.js`).
- Sistema de vidas: el jugador empieza con 3 vidas. Al caer la bola fuera del área de juego (sin tocar la pala), se resta 1 vida y la bola/pala se reposicionan en su posición inicial, quedando la bola "pegada" a la pala hasta que el jugador la lance de nuevo (clic o tecla, p.ej. espacio).
- Sistema de puntuación: cada bloque roto suma puntos, con un valor distinto según la fila/color (las filas superiores valen más, similar al Arkanoid clásico). El puntaje actual se muestra en pantalla durante la partida.
- Reproducción de `assets/sounds/ball-bounce.mp3` al rebotar la bola (pared o pala) y `assets/sounds/break-sound.mp3` al romper un bloque.
- Pantallas/estados del juego:
  - **Inicio:** pantalla previa a la partida con opción de empezar (botón o tecla).
  - **Jugando:** el estado normal descrito arriba.
  - **Pausa:** el jugador puede pausar y reanudar la partida (p.ej. con una tecla como `P` o Escape), congelando el movimiento de la bola y la lógica del juego.
  - **Game Over:** se muestra al perder la tercera vida, con el puntaje final y opción de reiniciar la partida.
  - **Victoria:** se muestra al romper todos los bloques del nivel, con el puntaje final y opción de reiniciar.
- Estructura de archivos nueva: `index.html`, `css/style.css`, `js/game.js`. `js/game.js` importa `assets/spritesheet.js` como módulo ES.

**No incluye (fuera de alcance de este spec):**

- Power-ups o power-downs de ningún tipo.
- Múltiples niveles o progresión entre niveles.
- Animación de explosión de bloques (aunque `EXPLOSION_FRAMES` exista en el spritesheet, su uso queda fuera de este MVP; el bloque simplemente desaparece al romperse).
- Persistencia de puntuación entre sesiones (high scores, localStorage, etc.).
- Soporte táctil/móvil.
- Ajustes de dificultad, velocidad progresiva de la bola, o múltiples bolas.

## Modelo de datos

No se introduce persistencia ni estructuras complejas de datos externas. El estado del juego vive en memoria durante la ejecución, como variables/objetos JS dentro de `js/game.js`:

- **Estado del juego (`gameState`):** una de `"start"`, `"playing"`, `"paused"`, `"gameover"`, `"win"`.
- **Pala (`paddle`):** `{ x, y, width, height }`.
- **Bola (`ball`):** `{ x, y, radius, dx, dy, attachedToPaddle: boolean }`.
- **Bloques (`blocks`):** array de `{ x, y, width, height, color, points, alive: boolean }`, generado una vez al iniciar el nivel a partir de un layout fijo definido en código.
- **Puntuación y vidas:** variables simples `score` (number) y `lives` (number, inicia en 3).

## Plan de implementación

1. Crear la estructura base de archivos (`index.html`, `css/style.css`, `js/game.js`) con un `<canvas>` a pantalla, referenciando el CSS y cargando `js/game.js` como `type="module"`. El canvas debe renderizarse en blanco/vacío sin errores en consola.
2. Cargar `assets/spritesheet.js` desde `js/game.js` y dibujar la pala y la bola estáticas en su posición inicial dentro del canvas, para confirmar que el spritesheet se integra correctamente.
3. Implementar el movimiento de la pala con teclado (flechas/A-D) y ratón, limitado a los bordes del canvas.
4. Implementar el bucle de juego (`requestAnimationFrame`) con la bola en movimiento, rebote en paredes laterales y superior, y bola pegada a la pala en el estado inicial hasta que se lance con clic/tecla.
5. Implementar la colisión bola-pala con ángulo variable según el punto de impacto, y reproducir `ball-bounce.mp3` en cada rebote (pared o pala).
6. Generar el layout fijo de bloques con `assets/spritesheet.js` y detectar colisión bola-bloque: al impactar, el bloque se marca `alive: false` y desaparece, la bola rebota, se reproduce `break-sound.mp3` y se suma la puntuación correspondiente a la fila/color del bloque.
7. Implementar el sistema de vidas: al caer la bola por debajo de la pala, restar una vida, reposicionar pala y bola, y volver al estado de bola pegada a la pala. Si `lives` llega a 0, transicionar a `gameState = "gameover"`.
8. Implementar la detección de victoria: cuando todos los bloques tienen `alive: false`, transicionar a `gameState = "win"`.
9. Implementar las pantallas de inicio, pausa, game over y victoria como overlays sobre el canvas (HTML/CSS o dibujo en canvas), incluyendo el puntaje visible durante la partida y el puntaje final en game over/victoria, y los controles para iniciar, pausar/reanudar y reiniciar la partida.

## Criterios de aceptación

- [x] Abrir `index.html` directamente en un navegador (o servido como estático) carga el juego sin errores en consola.
- [x] Desde la pantalla de inicio, se puede iniciar una partida con un botón o tecla.
- [x] La pala se mueve tanto con teclado (flechas o A/D) como con el ratón, sin salirse de los límites del canvas.
- [x] La bola rebota correctamente en las paredes laterales, la pared superior y la pala, con ángulo de rebote variable según el punto de impacto en la pala.
- [x] Al golpear un bloque, este desaparece, se reproduce `break-sound.mp3` y la puntuación aumenta según la fila/color del bloque.
- [x] Al rebotar la bola en pared o pala, se reproduce `ball-bounce.mp3`.
- [x] Si la bola cae sin tocar la pala, se resta una vida, la bola/pala se reposicionan y la bola queda pegada a la pala hasta lanzarla de nuevo.
- [x] Al perder la tercera vida, se muestra la pantalla de Game Over con el puntaje final y opción de reiniciar.
- [x] Al romper todos los bloques del nivel, se muestra la pantalla de Victoria con el puntaje final y opción de reiniciar.
- [x] Se puede pausar y reanudar la partida en cualquier momento durante el juego, congelando y reanudando el movimiento de la bola.
- [x] Reiniciar desde Game Over o Victoria regresa a un estado de partida limpio (vidas, puntuación y bloques reiniciados).

## Decisiones tomadas y descartadas

- **Controles duales (teclado + ratón):** se decidió soportar ambos en vez de uno solo, para mayor flexibilidad de juego sin coste adicional relevante de implementación.
- **Un solo nivel fijo:** se descarta la generación aleatoria o múltiples niveles para mantener el MVP acotado; queda para un spec futuro si se desea ampliar.
- **Puntuación variable por fila/color:** se eligió sobre puntuación uniforme para replicar la sensación clásica de Arkanoid, sin añadir complejidad significativa.
- **Ángulo de rebote variable en la pala:** se eligió sobre un rebote simple porque da más control al jugador y es una mecánica esperada en este tipo de juego, a cambio de algo más de lógica de física.
- **Bola pegada a la pala al iniciar/perder vida:** se eligió sobre el lanzamiento automático para dar control al jugador sobre el ritmo de la partida.
- **Detalle exacto de filas/columnas del layout de bloques:** el usuario delegó esta decisión a la implementación; se resolverá con un layout simple razonable durante `/spec-impl`, sin necesidad de otra ronda de preguntas.
- **Sin animación de explosión (`EXPLOSION_FRAMES`):** se deja fuera del MVP para no introducir lógica de animación adicional no solicitada; el asset queda disponible para un spec futuro.
- **Sin persistencia de puntuación:** al ser un MVP jugable de una sola sesión, no se justifica aún localStorage u otro almacenamiento.

## Riesgos identificados

- **Timing de audio en navegadores:** algunos navegadores bloquean la reproducción de audio hasta una interacción explícita del usuario; el primer sonido podría no reproducirse si no se dispara tras un clic/tecla del jugador (mitigado porque el flujo ya requiere clic/tecla para iniciar y lanzar la bola).
- **Colisión bola-bloque a alta velocidad:** si la bola se mueve muy rápido, podría "atravesar" un bloque delgado en un solo frame (tunneling). Se deberá elegir una velocidad de bola y un tamaño de bloque que minimicen este riesgo durante la implementación.
