#!/bin/bash

# Script para refactorizar imports relativos a usar alias @/
# NO EJECUTAR AUTOMÁTICAMENTE - Solo para referencia

echo "=== REFACTOR IMPORTS TO USE @/ ALIAS ==="
echo ""
echo "⚠️  ADVERTENCIA: Este script modificará 21 archivos"
echo "   Haz backup antes de ejecutar"
echo ""
echo "Archivos que serán modificados:"
echo ""

# Lista de archivos con imports relativos
files=(
  "src/app/(admin)/layout.tsx"
  "src/app/(admin)/page.tsx"
  "src/app/(public)/calendar/[slug]/EventDetailPage.tsx"
  "src/app/layout.tsx"
  "src/components/layout/Sidebar.tsx"
  "src/context/AuthContext.tsx"
  "src/context/useAuthActions.ts"
  "src/features/appearance/hooks/useAppearanceForm.ts"
  "src/features/categories/components/CreateCategoryModal.tsx"
  "src/features/categories/components/EditCategoryModal.tsx"
  "src/features/categories/components/dumb/CategoryTable.tsx"
  "src/features/categories/components/smart/CategoryTableContainer.tsx"
  "src/features/categories/hooks/useCategoryManager.ts"
  "src/features/events/components/CreateEventForm.tsx"
  "src/features/events/components/EditEventForm.tsx"
  "src/features/events/components/smart/ApprovalModalContainer.tsx"
  "src/features/events/components/smart/EventCardContainer.tsx"
  "src/features/events/components/smart/EventTableContainer.tsx"
  "src/features/events/hooks/useApprovalManager.ts"
  "src/features/events/hooks/useEventManager.ts"
  "src/services/apiClient.ts"
)

# Mostrar archivos
for file in "${files[@]}"; do
  echo "  - $file"
done

echo ""
read -p "¿Continuar con el refactor? (y/N): " confirm

if [ "$confirm" != "y" ]; then
  echo "Operación cancelada"
  exit 0
fi

echo ""
echo "Refactorizando imports..."
echo ""

# Función para convertir path relativo a absoluto
convert_imports() {
  local file=$1

  # Backup
  cp "$file" "$file.backup"

  # Obtener directorio del archivo
  dir=$(dirname "$file")

  # Convertir imports relativos
  # Esto es un ejemplo simplificado - requiere lógica más compleja
  sed -i '' "s|from ['\"]\\.\\.\\./\\.\\.\\./\\.\\.\\./|from '@/|g" "$file"
  sed -i '' "s|from ['\"]\\.\\.\\./\\.\\.\\./|from '@/|g" "$file"
  sed -i '' "s|from ['\"]\\.\\./|from '@/features/|g" "$file"

  echo "✓ Refactorizado: $file"
}

# Ejecutar conversión
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    convert_imports "$file"
  else
    echo "⚠️  Archivo no encontrado: $file"
  fi
done

echo ""
echo "✅ Refactor completado"
echo ""
echo "SIGUIENTES PASOS:"
echo "1. Revisar cambios con: git diff"
echo "2. Ejecutar: npm run build"
echo "3. Si hay errores, restaurar: ls *.backup | xargs -I {} sh -c 'mv {} \${0%.backup}'"
echo "4. Si todo está bien, eliminar backups: rm *.backup"
