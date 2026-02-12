# agents-md

CLI para generar archivos AGENTS.md automáticamente para proyectos Node.js.

## ¿Qué es AGENTS.md?

AGENTS.md es un "README para AI agents" que reduce las alucinaciones de agentes de IA (Claude, Copilot, Windsurf, etc.) al proporcionar:
- Comandos canónicos (setup, test, build, lint)
- Convenciones de código y estilo
- Guías de testing
- Reglas de seguridad
- Definition of Done

## Instalación

```bash
npm install -g agents-md
```

## Uso

```bash
# Generar AGENTS.md en el directorio actual
agents-md init

# Preview sin escribir archivo
agents-md init --dry-run

# Elegir perfil de salida (default: compact)
agents-md init --profile compact
agents-md init --profile standard
agents-md init --profile full

# Sobrescribir archivo existente
agents-md init --force

# Modo verbose (mostrar detalles de detección)
agents-md init --verbose

# Especificar ruta de salida
agents-md init --out ./docs/AGENTS.md
```

## Proyectos Soportados

- React (con Vite, CRA, o Next.js)
- Vue (con Vite o Nuxt)
- Firebase Functions
- Proyectos Node.js genéricos
- Monorepos (Turborepo/Nx)

## Cómo Funciona

1. Lee tu `package.json`
2. Detecta framework y estructura de carpetas
3. Extrae comandos canónicos desde scripts
4. Genera un AGENTS.md limpio y conciso según el profile seleccionado

## Profiles de salida

- `compact` (default): salida corta y directa (hasta ~110 líneas)
- `standard`: salida más completa para equipos (~150-230 líneas)
- `full`: salida más detallada para handoff y CI (~220-360 líneas)

## Output Profiles & Soft Limits

- `compact`: 50-110 lines, max ~900 tokens
- `standard`: 150-230 lines, max ~1600 tokens
- `full`: 220-360 lines, max ~2400 tokens

Exceder estos rangos genera **warnings** y no bloquea la generación.
La generación solo se bloquea cuando hay **errors** de validación.

## Requisitos

- Node.js 18+
- `package.json` en la raíz del proyecto

## Desarrollo

```bash
# Instalar dependencias
npm install

# Build
npm run build

# Modo desarrollo (watch)
npm run dev

# Tests
npm test

# Lint (verificar tipos)
npm run lint
```

## License

MIT © 2026 sebasgc0399
