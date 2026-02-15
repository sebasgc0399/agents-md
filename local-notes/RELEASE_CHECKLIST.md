# Release Checklist (simple)

## Regla clave

- `--dry-run` solo simula. No crea release real.
- En este repo, `release-it` no publica npm (`npm.publish=false`).

## Paso 1: Pre-check

```bash
git status --short
git branch --show-current
npm whoami
npm run build
npm test
```

Debes estar en branch correcta y con working tree limpio.

## Paso 2: Preview del bump

Usa el mismo tipo de bump que vas a ejecutar:

```bash
# patch (0.2.0 -> 0.2.1)
npm run release -- --dry-run --increment patch

# minor (0.2.0 -> 0.3.0)
npm run release -- --dry-run --increment minor
```

## Paso 3: Release real en GitHub

Ejecuta sin `--dry-run`:

```bash
# patch
npm run release -- --increment patch

# minor
npm run release -- --increment minor
```

Esto actualiza version/changelog, crea commit, tag y GitHub Release.

## Paso 4: Publicar en npm

```bash
npm publish --access public
npm view @sebasgc0399/agents-md version
```

## Paso 5: Verificacion final

- En GitHub debe existir `vX.Y.Z` en Tags/Releases.
- En npm debe aparecer la misma version.

## Si algo falla (rapido)

### Corriste dry-run pensando que era real

Vuelve a correr release sin `--dry-run`:

```bash
npm run release -- --increment patch
```

### npm publicado pero no aparece release en GitHub

```bash
git ls-remote --tags origin vX.Y.Z vX.Y.Z^{}
git tag -a vX.Y.Z -m "Release X.Y.Z"
git push origin vX.Y.Z
```

Luego crea release manual en GitHub (Releases -> Draft new release).

### Error de auth npm

```bash
npm logout
npm config delete //registry.npmjs.org/:_authToken
npm config set //registry.npmjs.org/:_authToken=TU_TOKEN_NUEVO
npm whoami
```
