# 02 - Animación de explosión de bloques y botón de sonido

**Estado:** implementado
**Depende de:** SPEC 01
**Fecha:** 2026-09-13

**Objetivo:** Añadir una animación de explosión al destruir bloques usando `EXPLOSION_FRAMES`/`EXPLOSION_DURATION` de `assets/spritesheet.js`, y un botón para activar/desactivar todos los efectos de sonido del juego, con la preferencia guardada en `localStorage`.

## Alcance

**Incluye:**

- Al destruirse un bloque (`block.alive = false`), se dibuja en su posición una animación de explosión usando los `EXPLOSION_FRAMES[block.color]` definidos en `assets/spritesheet.js`, reproduciendo las 4 frames de forma secuencial a lo largo de `EXPLOSION_DURATION` (150ms) antes de desaparecer del todo.
- La lógica de física existente no cambia: el bloque deja de ser colisionable y la bola rebota en el mismo instante en que se detecta el impacto (igual que hoy); la animación es un efecto puramente visual superpuesto.
- Soporte para múltiples explosiones simultáneas en pantalla (p.ej. si la bola rompe más de un bloque en fotogramas cercanos), cada una con su propio temporizador independiente.
- Un botón HTML (no dibujado en canvas) fijo en la esquina superior derecha de `#game-container`, visible en todos los estados del juego (inicio, jugando, pausa, game over, victoria), que activa/desactiva todos los efectos de sonido (`ball-bounce.mp3` y `break-sound.mp3`, los únicos sonidos existentes actualmente).
- El botón muestra un icono distinto según el estado: 🔊 cuando el sonido está activado, 🔇 cuando está desactivado.
- Al desactivar el sonido, `playBounceSound()` y `playBreakSound()` no reproducen nada mientras el estado siga desactivado; al reactivarlo, vuelven a sonar con normalidad.
- La preferencia de sonido se guarda en `localStorage` bajo la clave `arkanoid:soundEnabled` y se restaura al cargar la página (si no existe la clave, el sonido empieza activado por defecto).

**No incluye (fuera de alcance de este spec):**

- Música de fondo o cualquier sonido nuevo distinto de los dos SFX existentes.
- Control de volumen granular (slider, niveles intermedios); el botón es un simple todo/nada.
- Animaciones de partículas o efectos adicionales más allá de `EXPLOSION_FRAMES`.
- Cambios al layout de bloques, física de la bola o cualquier otro sistema descrito en SPEC 01 que no sea la destrucción de bloques y el sonido.

## Modelo de datos

Este spec añade dos piezas de estado nuevas en `js/game.js`:

```js
// Explosiones activas en pantalla
let explosions = [
  // { x, y, width, height, color, startTime }
];

// Preferencia de sonido, inicializada desde localStorage
let soundEnabled = true; // localStorage['arkanoid:soundEnabled'] !== 'false'
```

- `explosions`: array de objetos efímeros. Cada uno se crea cuando un bloque se destruye (con la posición/tamaño del bloque y su color) y se elimina del array cuando pasan `EXPLOSION_DURATION` ms desde `startTime`.
- El frame a dibujar en cada instante se calcula a partir del tiempo transcurrido dividido entre `EXPLOSION_DURATION / EXPLOSION_FRAMES[color].length`.
- `soundEnabled`: booleano en memoria, sincronizado con `localStorage.getItem('arkanoid:soundEnabled')`. Se reescribe en `localStorage` cada vez que el jugador pulsa el botón.

## Plan de implementación

1. Añadir el botón de sonido al HTML (`index.html`, dentro de `#game-container`, fuera de los overlays) y sus estilos en `css/style.css` (posición fija en la esquina superior derecha, por encima de los overlays). El botón debe verse correctamente en todos los estados sin bloquear la partida.
2. En `js/game.js`, leer `localStorage` al cargar para inicializar `soundEnabled`, actualizar el icono del botón (🔊/🔇) acorde, y añadir el listener de clic que alterna `soundEnabled`, actualiza el icono y persiste el valor en `localStorage`.
3. Modificar `playBounceSound()` y `playBreakSound()` para que no hagan nada si `soundEnabled` es `false`.
4. Añadir el array `explosions` y una función `spawnExplosion(block)` que se llama desde `checkBlockCollision()` justo cuando un bloque se marca `alive = false`, empujando `{ x: block.x, y: block.y, width: block.width, height: block.height, color: block.color, startTime: performance.now() }`.
5. En el bucle de dibujo (`draw()`), tras dibujar los bloques vivos, recorrer `explosions`, calcular el frame correspondiente según el tiempo transcurrido y dibujarlo con `drawFrame()`; eliminar del array las explosiones cuyo tiempo transcurrido supere `EXPLOSION_DURATION`.
6. Verificación manual: romper varios bloques de distintos colores y comprobar que la animación de explosión se ve en cada uno con el frame correcto, que romper bloques cercanos en el tiempo muestra explosiones simultáneas independientes, que el botón de sonido silencia/reactiva ambos efectos, y que recargar la página tras desactivar el sonido lo mantiene desactivado.

## Criterios de aceptación

- [x] Al romper un bloque, se reproduce una animación de explosión en su posición usando los `EXPLOSION_FRAMES` del color correspondiente, y desaparece al cabo de `EXPLOSION_DURATION` (150ms).
- [x] La física de la bola (rebote, desaparición del bloque) no se ve afectada ni retrasada por la animación.
- [x] Romper dos o más bloques en un intervalo corto muestra varias animaciones de explosión simultáneas e independientes en pantalla.
- [x] Existe un botón visible en todos los estados del juego (inicio, jugando, pausa, game over, victoria) que alterna el sonido activado/desactivado, cambiando su icono entre 🔊 y 🔇.
- [x] Con el sonido desactivado, ni `ball-bounce.mp3` ni `break-sound.mp3` se reproducen al rebotar o romper bloques.
- [x] Al recargar la página, el estado del botón de sonido refleja la última preferencia guardada en `localStorage`.
- [x] Sin ninguna preferencia guardada previamente (primera visita), el sonido empieza activado.

## Decisiones tomadas y descartadas

- **El bloque desaparece de la colisión al instante, la animación es solo visual:** se descartó mantener el bloque como sólido durante la animación para no alterar la física ya aprobada en SPEC 01; el usuario confirmó esta opción explícitamente.
- **Botón HTML fijo, visible en todos los estados:** se eligió sobre limitarlo a los overlays de inicio/pausa para que el jugador pueda silenciar el sonido en cualquier momento, incluso durante la partida activa. Confirmado por el usuario.
- **Persistencia con `localStorage`:** se eligió sobre reiniciar siempre a "activado" para evitar que el jugador tenga que re-silenciar en cada recarga. Confirmado por el usuario.
- **El botón controla todos los SFX por igual (no hay música de fondo que distinguir):** dado que actualmente solo existen `ball-bounce.mp3` y `break-sound.mp3`, no se introduce una distinción entre "sonido" y "música".
- **Sin control de volumen granular:** un simple todo/nada es suficiente para el alcance solicitado; un slider de volumen queda fuera por no haberse pedido.
- **Múltiples explosiones simultáneas soportadas mediante un array:** se decidió durante la escritura del spec, como detalle de implementación razonable para que romper varios bloques a la vez no descarte animaciones pendientes.

## Riesgos identificados

- **`localStorage` no disponible (modo privado estricto en algunos navegadores):** si `localStorage` lanza una excepción al leer/escribir, el juego debe seguir funcionando con `soundEnabled` en memoria (sin persistir), sin romper la carga del juego.
- **Timing de la animación bajo pestañas en segundo plano:** si el navegador limita `requestAnimationFrame` en pestañas inactivas, la animación de explosión podría alargarse visualmente; no se considera crítico para este spec.
