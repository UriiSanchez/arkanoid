# 03 - Niveles procedurales con dificultad creciente

**Estado:** Implementado
**Depende de:** SPEC 01, SPEC 02
**Fecha:** 2026-09-13

**Objetivo:** Añadir una progresión de 5 niveles generados proceduralmente con dificultad creciente (más filas de bloques, bola más rápida y colores más variados) que termina en la pantalla de Victoria existente, manteniendo sin cambios el sistema de sonido ya implementado en SPEC 01/02.

## Alcance

**Incluye:**

- Una variable de nivel (`level`, iniciando en 1) que avanza cada vez que el jugador destruye todos los bloques del nivel actual, hasta un total fijo de **5 niveles**.
- Generación procedural del layout de bloques por nivel a partir de `createBlocks(level)`: el número de filas crece con el nivel y la asignación de color por fila se aleatoriza en cada nivel (usando la paleta completa de 7 colores de `assets/spritesheet.js`), en vez del patrón fijo de 6 filas/6 colores de SPEC 01.
- La velocidad base de la bola aumenta ligeramente en cada nivel nuevo (se resetea a esa velocidad de nivel tanto al lanzarla por primera vez como al perder una vida dentro de ese nivel).
- Las **vidas** y la **puntuación** se mantienen entre niveles: no se reinician al pasar de nivel, solo al perder la última vida (game over) o al pulsar "Reiniciar".
- Un indicador de "Nivel: X" dibujado en el canvas junto a los indicadores existentes de puntuación y vidas, visible durante toda la partida.
- Un overlay breve "Nivel X superado" que aparece al completar un nivel (excepto el último) y desaparece automáticamente tras un tiempo fijo, tras lo cual se genera el siguiente nivel y la bola queda pegada a la pala lista para lanzar (igual que al perder una vida).
- Al completar el nivel 5, se mantiene el comportamiento actual de SPEC 01: se muestra la pantalla de Victoria final con la puntuación total acumulada (no hay un nivel 6 ni loop infinito).
- Reiniciar la partida (desde Game Over o Victoria) vuelve siempre a nivel 1, con la puntuación, vidas y velocidad de bola iniciales.
- Los efectos de sonido existentes (`ball-bounce.mp3` en rebotes, `break-sound.mp3` al romper bloques) y el botón de silenciar/activar de SPEC 02 siguen funcionando exactamente igual en todos los niveles; este spec no introduce sonidos nuevos ni cambia su lógica.

**No incluye (fuera de alcance de este spec):**

- Sonidos nuevos (música de fondo, SFX de cambio de nivel, victoria, etc.) — el usuario confirmó que el sistema de sonido actual ya cubre lo necesario y solo debe preservarse.
- Bloques de más de un golpe / con variantes de "dañado" (el spritesheet no tiene esas variantes).
- Selección manual de nivel o menú de niveles.
- Persistencia del nivel alcanzado entre sesiones (localStorage de progreso); cada partida empieza en nivel 1.
- Niveles ilimitados o generación infinita tras el nivel 5.
- Power-ups, múltiples bolas u otros sistemas no relacionados con niveles/sonido.

## Modelo de datos

Este spec extiende el estado en memoria de `js/game.js` (no introduce persistencia nueva):

```js
let level = 1;
const MAX_LEVEL = 5;

const BASE_ROWS = 4;      // filas en el nivel 1
const MAX_ROWS = 8;       // tope de filas en el nivel 5
const BASE_BALL_SPEED = 5;        // velocidad de bola en el nivel 1 (igual que hoy)
const BALL_SPEED_INCREMENT = 0.7; // incremento de velocidad por nivel

const LEVEL_TRANSITION_DURATION = 1500; // ms que se muestra "Nivel X superado"
```

- `createBlocks(level)` sustituye a `createBlocks()`: calcula `rows = Math.min(BASE_ROWS + (level - 1), MAX_ROWS)` (nivel 1→4 filas, nivel 5→8 filas) y, para cada fila, elige un color de la paleta completa (`gray`, `red`, `yellow`, `cyan`, `magenta`, `hotpink`, `green`) mediante un barajado aleatorio (colores pueden repetirse si `rows > 7`). Los puntos de cada fila se calculan como `(rows - row) * 10` (las filas superiores valen más, igual que el criterio de SPEC 01).
- `getBallSpeedForLevel(level)` devuelve `BASE_BALL_SPEED + (level - 1) * BALL_SPEED_INCREMENT`, usada en vez de la constante `BALL_SPEED` al lanzar la bola y al reposicionarla tras perder una vida.
- `gameState` añade un nuevo valor transitorio: `"levelup"`, además de los existentes (`"start"`, `"playing"`, `"paused"`, `"gameover"`, `"win"`).

## Plan de implementación

1. Añadir la variable `level` (inicial 1) y dibujar `Nivel: {level}` en el canvas junto a los textos existentes de puntuación/vidas en `draw()`. Verificación manual: recargar el juego y ver "Nivel: 1" durante la partida, sin cambiar nada más del comportamiento actual.
2. Refactorizar `createBlocks()` a `createBlocks(level)` con la fórmula de filas y el barajado de colores descritos en el modelo de datos; actualizar la llamada inicial para pasar `level` (1 al arrancar/reiniciar). Verificación: el nivel 1 se ve jugable con 4 filas de bloques de colores variados.
3. Añadir `getBallSpeedForLevel(level)` y sustituir los usos directos de `BALL_SPEED` al lanzar la bola y al reposicionarla tras perder una vida. Verificación: en nivel 1 la velocidad de lanzamiento se siente igual que antes del cambio.
4. Modificar la detección de "todos los bloques destruidos": si `level < MAX_LEVEL`, incrementar `level`, generar los nuevos bloques con `createBlocks(level)`, reposicionar pala/bola (bola pegada a la pala) y pasar a `gameState = "levelup"` en vez de `"win"`; si `level === MAX_LEVEL`, mantener el comportamiento actual (`gameState = "win"`). Verificación: al romper todos los bloques del nivel 1, el juego pasa a un estado `levelup` en vez de a Victoria.
5. Añadir el overlay `#overlay-levelup` en `index.html` (mismo patrón visual que los overlays existentes, mensaje "Nivel {level} superado") y su estilo en `css/style.css`; en `js/game.js`, al entrar en `gameState = "levelup"`, programar un `setTimeout` de `LEVEL_TRANSITION_DURATION` que oculte el overlay y pase a `gameState = "playing"`. Verificación: tras romper todos los bloques del nivel 1, se ve el overlay ~1.5s y luego se continúa jugando en nivel 2 con más filas y la bola algo más rápida.
6. Hacer que reiniciar partida (`btn-restart-gameover`, `btn-restart-win`) también reinicie `level = 1` y regenere los bloques del nivel 1, además de resetear `score`/`lives` como ya ocurre. Verificación: tras avanzar a nivel 3 y perder todas las vidas, reiniciar vuelve a nivel 1 con el layout y velocidad originales.
7. Verificación manual completa: jugar los 5 niveles seguidos comprobando que vidas y puntuación se mantienen entre niveles, que la dificultad aumenta visiblemente (más bloques, bola más rápida, colores más variados), que tras el nivel 5 aparece la pantalla de Victoria final (sin overlay de "levelup" ni nivel 6), y que `ball-bounce.mp3`, `break-sound.mp3` y el botón de silenciar siguen funcionando igual en todos los niveles.

## Criterios de aceptación

- [ ] El canvas muestra "Nivel: X" junto a la puntuación y las vidas durante toda la partida.
- [ ] El nivel 1 genera 4 filas de bloques; el nivel 5 genera 8 filas; los niveles intermedios generan un número creciente de filas entre ambos.
- [ ] El color de cada fila se asigna de forma aleatoria en cada nivel usando la paleta completa de 7 colores del spritesheet.
- [ ] La velocidad de la bola en el nivel N es mayor que en el nivel N-1, tanto al lanzarla como al reposicionarla tras perder una vida dentro de ese nivel.
- [ ] Al destruir todos los bloques de un nivel (excepto el 5º), aparece el overlay "Nivel X superado", que desaparece solo tras ~1.5s, y el juego continúa en el siguiente nivel con la bola pegada a la pala.
- [ ] Las vidas y la puntuación acumuladas se conservan al pasar de un nivel a otro (no se reinician).
- [ ] Al destruir todos los bloques del nivel 5, se muestra la pantalla de Victoria final existente (SPEC 01) con la puntuación total, sin overlay de "levelup" y sin generar un nivel 6.
- [ ] Reiniciar la partida desde Game Over o Victoria vuelve siempre a nivel 1, con puntuación, vidas y velocidad de bola iniciales.
- [ ] `ball-bounce.mp3` sigue sonando en cada rebote de pared/pala y `break-sound.mp3` en cada bloque roto, en todos los niveles.
- [ ] El botón de silenciar/activar sonido (SPEC 02) sigue funcionando igual en todos los niveles y estados, incluido el nuevo estado "levelup".

## Decisiones tomadas y descartadas

- **5 niveles con generación procedural, no layouts fijos codificados a mano:** confirmado explícitamente por el usuario sobre la alternativa de codificar cada nivel manualmente.
- **Pantalla de Victoria final tras el nivel 5 (no loop infinito):** confirmado por el usuario; la generación procedural se limita a un tope fijo de niveles en vez de continuar indefinidamente.
- **La dificultad escala en tres ejes a la vez (más filas, más velocidad de bola, más variedad de color):** el usuario seleccionó las tres opciones en el bloque de preguntas, en vez de escalar solo una.
- **Fórmulas concretas (filas 4→8, velocidad +0.7/nivel, `LEVEL_TRANSITION_DURATION` 1500ms):** el usuario no fijó números exactos; se delegó el detalle a la escritura de la spec, igual que el layout de bloques se delegó a la implementación en SPEC 01.
- **Vidas y puntuación se mantienen entre niveles:** confirmado por el usuario sobre reiniciarlas en cada nivel nuevo.
- **Overlay de transición automático (no requiere pulsar tecla):** confirmado por el usuario ("overlay breve... antes de continuar automáticamente") sobre la alternativa de esperar una pulsación del jugador.
- **Sin cambios en el sistema de sonido:** el usuario aclaró que no hay ningún bug ni sonido nuevo pendiente; este spec solo debe verificar que la lógica de niveles no rompe el comportamiento de sonido ya implementado en SPEC 01/02.
- **Sin bloques de más de un golpe:** descartado porque el spritesheet no tiene sprites de bloque "dañado"; introducir esa variante requeriría nuevos asset o dibujar overlays de daño, fuera de lo pedido.
- **Sin persistencia del nivel alcanzado:** no se pidió guardar progreso entre sesiones; cada partida nueva empieza en nivel 1, igual que hoy con la puntuación.

## Riesgos identificados

- **Tunneling a mayor velocidad de bola:** el riesgo de que la bola atraviese un bloque delgado en un solo frame (ya identificado en SPEC 01) aumenta ligeramente en niveles altos por la mayor velocidad; se mitiga eligiendo un `BALL_SPEED_INCREMENT` moderado (0.7/nivel) que no debería requerir cambios en el tamaño de bloque.
- **Barajado aleatorio de colores sin semilla:** cada partida en un mismo nivel puede verse visualmente distinta (no es un problema funcional, pero conviene que el usuario lo sepa: no hay determinismo entre partidas para un mismo nivel).
