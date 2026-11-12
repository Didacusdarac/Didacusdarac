# Política de seguridad

## Reportar una vulnerabilidad
No abras un issue público. Usa **Security > Report a vulnerability** (aviso privado de GitHub) en este
repositorio. Responderemos en 7 días.

## Alcance
- `game/` (Dona Manía, juego de un solo jugador, sin cuentas ni red).
- La futura app de iOS y el backend asociado, si llega a existir.
- Fuera de alcance: ingeniería social, denegación de servicio volumétrica y trampas locales en un juego sin ranking.

## Versiones con soporte
Solo la última versión publicada.

## Divulgación
Pedimos 90 días para corregir antes de divulgar públicamente.

## Reglas para quien contribuya
- Nunca subas secretos: claves, tokens, `.env`, certificados (`.p12`, `.pem`), perfiles de aprovisionamiento ni claves
  de Supabase `service_role`. Si se sube uno por error, hay que **rotarlo de inmediato**; borrar el commit no basta.
- El juego carga el guardado con una lista blanca (`loadSave()` en `game/index.html`). Todo campo nuevo del estado
  debe añadirse ahí y a `fresh()`.
- La música, la fuente y los recursos deben ser propios o tener licencia comercial (ver `game/fonts/LICENSE.txt`).
