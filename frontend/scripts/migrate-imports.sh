#!/bin/bash
# Script para migrar relative imports a path aliases (@/*)
# Convierte imports como '../types/x' a '@/types/x'

set -e

echo "🔍 Migrando relative imports a path aliases..."

# Función para procesar cada archivo
process_file() {
  local file=$1
  local dir=$(dirname "$file")

  # Saltar archivos de node_modules, .next, etc.
  if [[ $file == *"node_modules"* ]] || [[ $file == *".next"* ]] || [[ $file == *"dist"* ]]; then
    return
  fi

  # Procesar solo archivos .ts y .tsx
  if [[ ! $file =~ \.(ts|tsx)$ ]]; then
    return
  fi

  # Usar sed para reemplazar relative imports
  # Patrón 1: from './archivo' → from '@/dir/archivo'
  # Patrón 2: from '../dir/archivo' → from '@/dir/archivo'
  # Patrón 3: from '../../dir/archivo' → from '@/dir/archivo'

  sed -i.bak -E \
    -e "s|from '\\./([^']+)'|from '@/$(echo $dir | sed 's|^src/||')/\\1'|g" \
    -e "s|from \"\\./([^\"]+)\"|from \"@/$(echo $dir | sed 's|^src/||')/\\1\"|g" \
    "$file"

  # Limpiar archivos backup
  rm -f "${file}.bak"
}

# Encontrar todos los archivos .ts y .tsx en src/
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | while read file; do
  process_file "$file"
done

echo "✅ Migración completada"
echo "📊 Ejecutando contador de relative imports..."
remaining=$(grep -r "from ['\"]\.\.\\?/" src --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l | xargs)
echo "Remaining relative imports: $remaining"
