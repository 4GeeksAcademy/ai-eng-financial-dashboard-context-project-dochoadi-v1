# Git workflow and agent context

## Nombre

Contexto de agentes, cambios acotados y commits por fase.
**Activa desde fase 3.** Origen: R12 y R18 del
[borrador histórico](../../memory-bank/archive/phase2-proposed-rules.md).

## Alcance

Todo trabajo en el repositorio: descubrimiento, documentación, delegación,
validación y commits. Las reglas guían cambios futuros; no autorizan una
campaña automática de correcciones del baseline.

## Justificación

[AGENTS.md](../../AGENTS.md) exige descubrir reglas/skills/memoria (H29).
Las fases ya usan commits dedicados y
[verification.md](../../verification.md) separa evidencias de pendientes
(H30). Hay estilo mixto que no debe generar ruido de diff (H19).

## Guía específica del proyecto

- Antes de analizar/editar: leer AGENTS, reglas aplicables, skills locales
  si existen y memoria reciente. Si faltan, registrar ausencia, no inventar
  skills/políticas. Estas cinco reglas son activas; el borrador histórico
  está fuera de `.agents/rules` y no se aplica como una sexta regla.
- Registrar baseline (`git log -1 --oneline`) y estado (`git status --short`)
  antes de trabajar. No revertir cambios ajenos ni incorporar archivos
  no relacionados al commit; ante conflicto real pedir aclaración.
- Un cambio pequeño debe tener diff pequeño: mantener estilo local, evitar
  renombrados/refactors ajenos, paquetes y formatter innecesarios.
- No solucionar H06/H08/H13 ni otras decisiones pendientes como efecto
  secundario de un título o un health-check. Las mejoras pueden exigirse al
  modificar su comportamiento, con contrato y pruebas adecuados.
- Mantener navegación README español/inglés, ejemplos reales y memoria al
  cambiar contratos/ejecución. La fuente de hallazgos es
  [phase2-analysis.md](../../memory-bank/phase2-analysis.md); no existe
  findings.md en el baseline. No crear una copia divergente del análisis.
- Rastro breve por fase en verification: petición, reglas aplicadas,
  diff, comando y resultado; ✅/❌/❓ sin sobreafirmar cobertura.
  Conservar secciones históricas; actualizar referencias si se archivan.
- Delegación para comprobar reglas: indicar explícitamente
  “Aplica las reglas recién creadas en `.agents/rules`”, acotar tarea/archivos,
  pedir reglas leídas y comprobaciones, y contrastar el diff real.
  No considerar autoinforme de un agente prueba suficiente ni afirmar
  cumplimiento universal a partir de una sola tarea.
- Commit dedicado después de verificar, con archivos explícitos y mensaje
  descriptivo de fase. Sin push ni amend salvo petición.
- Incluir trailer de coautoría en el commit; no secretos, outputs temporales
  o notas privadas. Limpiar solo artefactos propios.

### Ejemplos del repositorio

Historial real:

```text
ef53539 docs: document phase 1 project context and verification
b5b0d39 docs: record phase 2 findings and proposed rules
```

Patrón de cierre para esta fase:

```bash
git diff --check
git diff --cached --check
git commit -m "docs: activate phase 3 rules and verify agent application" \
  -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
git status --short
```

### Comprobación requerida

Contrastar archivos del diff con alcance acordado, revisar tests/evidencia y
enlaces locales antes de commit. Confirmar commit creado y estado posterior;
si existen cambios ajenos, decirlo en vez de afirmar árbol limpio.
