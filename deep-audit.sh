#!/bin/bash

# 🔍 AUDITORÍA PROFUNDA - TucumánEvents Platform
# Fecha: Octubre 28, 2025
# Propósito: Analizar proyecto completo y generar reportes detallados
# Uso: bash deep-audit.sh [--backend|--frontend|--all]

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Variables
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M")
OUTPUT_DIR="audit-reports-${TIMESTAMP}"
PROJECT_ROOT=$(pwd)

# Detectar sistema operativo
OS=$(uname -s)

# Función de logging
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_section() { echo -e "\n${CYAN}▶ $1${NC}"; }

# Header
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🔍 AUDITORÍA PROFUNDA - TucumánEvents Platform   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar que estamos en el root del proyecto
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    log_error "Este script debe ejecutarse desde el root del proyecto"
    log_info "Estructura esperada: proyecto-root/backend/ y proyecto-root/frontend/"
    exit 1
fi

# Crear directorio de output
mkdir -p "$OUTPUT_DIR"
log_success "Directorio de reportes: $OUTPUT_DIR/"

# ============================================================
# FUNCIÓN: AUDITORÍA BACKEND
# ============================================================
audit_backend() {
    log_section "AUDITANDO BACKEND (Laravel + PostgreSQL)"

    BACKEND_REPORT="$PROJECT_ROOT/$OUTPUT_DIR/backend-audit-report.md"

    cd backend
    
    cat > "$BACKEND_REPORT" << 'HEADER'
# 🔍 BACKEND AUDIT REPORT
**Generated:** $(date)
**Platform:** Laravel + PostgreSQL
**Purpose:** Comprehensive backend analysis

---

## 📊 EXECUTIVE SUMMARY

HEADER
    
    # PHP Version
    log_info "Verificando PHP version..."
    PHP_VERSION=$(php -v | head -n 1 | cut -d ' ' -f 2)
    echo "**PHP Version:** $PHP_VERSION" >> "$BACKEND_REPORT"
    
    # Laravel Version
    log_info "Verificando Laravel version..."
    LARAVEL_VERSION=$(php artisan --version 2>/dev/null | cut -d ' ' -f 3 || echo "N/A")
    echo "**Laravel Version:** $LARAVEL_VERSION" >> "$BACKEND_REPORT"
    echo "" >> "$BACKEND_REPORT"
    
    # Composer dependencies
    log_info "Analizando dependencias composer..."
    echo "## 📦 DEPENDENCIES" >> "$BACKEND_REPORT"
    echo "" >> "$BACKEND_REPORT"
    echo "\`\`\`json" >> "$BACKEND_REPORT"
    if [ -f "composer.lock" ]; then
        jq -r '.packages | length' composer.lock >> "$BACKEND_REPORT" 2>/dev/null || echo "N/A" >> "$BACKEND_REPORT"
    fi
    echo "\`\`\`" >> "$BACKEND_REPORT"
    echo "" >> "$BACKEND_REPORT"
    
    # Database migrations
    log_info "Contando migrations..."
    MIGRATIONS_COUNT=$(find database/migrations -name "*.php" 2>/dev/null | wc -l)
    echo "## 🗄️ DATABASE" >> "$BACKEND_REPORT"
    echo "" >> "$BACKEND_REPORT"
    echo "**Migrations:** $MIGRATIONS_COUNT" >> "$BACKEND_REPORT"
    echo "" >> "$BACKEND_REPORT"
    
    # Models
    log_info "Contando models..."
    MODELS_COUNT=$(find app/Models -name "*.php" 2>/dev/null | wc -l)
    echo "**Models:** $MODELS_COUNT" >> "$BACKEND_REPORT"
    echo "" >> "$BACKEND_REPORT"
    
    echo "\`\`\`" >> "$BACKEND_REPORT"
    find app/Models -name "*.php" 2>/dev/null | sed 's|app/Models/||' | sort >> "$BACKEND_REPORT"
    echo "\`\`\`" >> "$BACKEND_REPORT"
    echo "" >> "$BACKEND_REPORT"
    
    # Architecture: Features
    log_info "Analizando arquitectura Features..."
    echo "## 🏗️ ARCHITECTURE" >> "$BACKEND_REPORT"
    echo "" >> "$BACKEND_REPORT"
    
    if [ -d "app/Features" ]; then
        echo "**Type:** Features-based ✅" >> "$BACKEND_REPORT"
        echo "" >> "$BACKEND_REPORT"
        echo "**Features:**" >> "$BACKEND_REPORT"
        echo "\`\`\`" >> "$BACKEND_REPORT"
        find app/Features -maxdepth 1 -type d 2>/dev/null | tail -n +2 | sed 's|app/Features/||' | sort >> "$BACKEND_REPORT"
        echo "\`\`\`" >> "$BACKEND_REPORT"
        
        # Controllers count
        CONTROLLERS_COUNT=$(find app/Features -name "*Controller.php" 2>/dev/null | wc -l)
        echo "" >> "$BACKEND_REPORT"
        echo "**Controllers:** $CONTROLLERS_COUNT" >> "$BACKEND_REPORT"
        
        # Services count
        SERVICES_COUNT=$(find app/Features -name "*Service.php" 2>/dev/null | wc -l)
        echo "**Services:** $SERVICES_COUNT" >> "$BACKEND_REPORT"
        
        # Tests count
        TESTS_COUNT=$(find app/Features -name "*Test.php" 2>/dev/null | wc -l)
        echo "**Tests:** $TESTS_COUNT" >> "$BACKEND_REPORT"
    else
        echo "**Type:** Traditional Laravel" >> "$BACKEND_REPORT"
        CONTROLLERS_COUNT=$(find app/Http/Controllers -name "*.php" 2>/dev/null | wc -l)
        echo "**Controllers:** $CONTROLLERS_COUNT" >> "$BACKEND_REPORT"
    fi
    echo "" >> "$BACKEND_REPORT"
    
    # Routes
    log_info "Analizando rutas..."
    echo "## 🛣️ ROUTES" >> "$BACKEND_REPORT"
    echo "" >> "$BACKEND_REPORT"
    if command -v php &> /dev/null; then
        echo "\`\`\`" >> "$BACKEND_REPORT"
        php artisan route:list --compact 2>/dev/null | head -n 50 >> "$BACKEND_REPORT" || echo "No se pudo generar lista de rutas" >> "$BACKEND_REPORT"
        echo "\`\`\`" >> "$BACKEND_REPORT"
    fi
    echo "" >> "$BACKEND_REPORT"
    
    # Tests execution
    log_info "Ejecutando tests..."
    echo "## 🧪 TESTS" >> "$BACKEND_REPORT"
    echo "" >> "$BACKEND_REPORT"
    
    if command -v php &> /dev/null; then
        echo "\`\`\`" >> "$BACKEND_REPORT"
        php artisan test --compact 2>&1 | tee -a "$BACKEND_REPORT" || echo "Tests failed or not configured" >> "$BACKEND_REPORT"
        echo "\`\`\`" >> "$BACKEND_REPORT"
    fi
    echo "" >> "$BACKEND_REPORT"
    
    # Code metrics
    log_info "Generando métricas de código..."
    echo "## 📏 CODE METRICS" >> "$BACKEND_REPORT"
    echo "" >> "$BACKEND_REPORT"
    
    # Lines of code
    if [ -d "app/Features" ]; then
        FEATURES_LOC=$(find app/Features -name "*.php" -exec wc -l {} + 2>/dev/null | tail -n 1 | awk '{print $1}')
        echo "**Features LOC:** $FEATURES_LOC lines" >> "$BACKEND_REPORT"
    fi
    
    TOTAL_PHP_LOC=$(find app -name "*.php" -exec wc -l {} + 2>/dev/null | tail -n 1 | awk '{print $1}')
    echo "**Total PHP LOC:** $TOTAL_PHP_LOC lines" >> "$BACKEND_REPORT"
    echo "" >> "$BACKEND_REPORT"
    
    # TODO/FIXME count
    TODO_COUNT=$(grep -r "TODO" app/ 2>/dev/null | wc -l)
    FIXME_COUNT=$(grep -r "FIXME" app/ 2>/dev/null | wc -l)
    echo "**TODOs in code:** $TODO_COUNT" >> "$BACKEND_REPORT"
    echo "**FIXMEs in code:** $FIXME_COUNT" >> "$BACKEND_REPORT"
    echo "" >> "$BACKEND_REPORT"
    
    # Composer outdated
    log_info "Verificando dependencias desactualizadas..."
    echo "## 📦 OUTDATED DEPENDENCIES" >> "$BACKEND_REPORT"
    echo "" >> "$BACKEND_REPORT"
    echo "\`\`\`" >> "$BACKEND_REPORT"
    composer outdated --direct 2>/dev/null | head -n 20 >> "$BACKEND_REPORT" || echo "No outdated dependencies or composer not available" >> "$BACKEND_REPORT"
    echo "\`\`\`" >> "$BACKEND_REPORT"
    echo "" >> "$BACKEND_REPORT"
    
    cd ..
    
    log_success "Backend audit completado: $BACKEND_REPORT"
}

# ============================================================
# FUNCIÓN: AUDITORÍA FRONTEND
# ============================================================
audit_frontend() {
    log_section "AUDITANDO FRONTEND (Next.js + TypeScript + React)"

    FRONTEND_REPORT="$PROJECT_ROOT/$OUTPUT_DIR/frontend-audit-report.md"

    cd frontend
    
    cat > "$FRONTEND_REPORT" << 'HEADER'
# 🔍 FRONTEND AUDIT REPORT
**Generated:** $(date)
**Platform:** Next.js + TypeScript + React
**Purpose:** Comprehensive frontend analysis

---

## 📊 EXECUTIVE SUMMARY

HEADER
    
    # Node/npm versions
    log_info "Verificando Node/npm versions..."
    NODE_VERSION=$(node -v 2>/dev/null || echo "N/A")
    NPM_VERSION=$(npm -v 2>/dev/null || echo "N/A")
    echo "**Node Version:** $NODE_VERSION" >> "$FRONTEND_REPORT"
    echo "**npm Version:** $NPM_VERSION" >> "$FRONTEND_REPORT"
    echo "" >> "$FRONTEND_REPORT"
    
    # Next.js version
    if [ -f "package.json" ]; then
        NEXT_VERSION=$(jq -r '.dependencies.next // .dependencies."next"' package.json 2>/dev/null)
        REACT_VERSION=$(jq -r '.dependencies.react // .dependencies."react"' package.json 2>/dev/null)
        TS_VERSION=$(jq -r '.devDependencies.typescript // .devDependencies."typescript"' package.json 2>/dev/null)
        
        echo "**Next.js Version:** $NEXT_VERSION" >> "$FRONTEND_REPORT"
        echo "**React Version:** $REACT_VERSION" >> "$FRONTEND_REPORT"
        echo "**TypeScript Version:** $TS_VERSION" >> "$FRONTEND_REPORT"
    fi
    echo "" >> "$FRONTEND_REPORT"
    
    # Dependencies
    log_info "Analizando dependencias npm..."
    echo "## 📦 DEPENDENCIES" >> "$FRONTEND_REPORT"
    echo "" >> "$FRONTEND_REPORT"
    
    if [ -f "package.json" ]; then
        DEPS_COUNT=$(jq '.dependencies | length' package.json 2>/dev/null)
        DEV_DEPS_COUNT=$(jq '.devDependencies | length' package.json 2>/dev/null)
        echo "**Dependencies:** $DEPS_COUNT" >> "$FRONTEND_REPORT"
        echo "**Dev Dependencies:** $DEV_DEPS_COUNT" >> "$FRONTEND_REPORT"
    fi
    echo "" >> "$FRONTEND_REPORT"
    
    # Architecture: Features
    log_info "Analizando arquitectura Features..."
    echo "## 🏗️ ARCHITECTURE" >> "$FRONTEND_REPORT"
    echo "" >> "$FRONTEND_REPORT"
    
    if [ -d "src/features" ]; then
        echo "**Type:** Features-based ✅" >> "$FRONTEND_REPORT"
        echo "" >> "$FRONTEND_REPORT"
        echo "**Features:**" >> "$FRONTEND_REPORT"
        echo "\`\`\`" >> "$FRONTEND_REPORT"
        find src/features -maxdepth 1 -type d 2>/dev/null | tail -n +2 | sed 's|src/features/||' | sort >> "$FRONTEND_REPORT"
        echo "\`\`\`" >> "$FRONTEND_REPORT"
    fi
    echo "" >> "$FRONTEND_REPORT"
    
    # Components count
    log_info "Contando componentes..."
    COMPONENTS_COUNT=$(find src -name "*.tsx" -o -name "*.jsx" 2>/dev/null | wc -l)
    echo "**Components:** $COMPONENTS_COUNT" >> "$FRONTEND_REPORT"
    
    # Hooks count
    HOOKS_COUNT=$(find src -name "use*.ts" -o -name "use*.tsx" 2>/dev/null | wc -l)
    echo "**Custom Hooks:** $HOOKS_COUNT" >> "$FRONTEND_REPORT"
    
    # Services count
    SERVICES_COUNT=$(find src -name "*.service.ts" 2>/dev/null | wc -l)
    echo "**Services:** $SERVICES_COUNT" >> "$FRONTEND_REPORT"
    
    # Types/Interfaces count
    TYPES_COUNT=$(find src -name "*.types.ts" -o -name "*types.ts" 2>/dev/null | wc -l)
    echo "**Type Files:** $TYPES_COUNT" >> "$FRONTEND_REPORT"
    echo "" >> "$FRONTEND_REPORT"
    
    # TypeScript check
    log_info "Ejecutando TypeScript check..."
    echo "## 🔷 TYPESCRIPT" >> "$FRONTEND_REPORT"
    echo "" >> "$FRONTEND_REPORT"
    echo "\`\`\`" >> "$FRONTEND_REPORT"
    npx tsc --noEmit 2>&1 | head -n 50 >> "$FRONTEND_REPORT" || echo "TypeScript check completed" >> "$FRONTEND_REPORT"
    echo "\`\`\`" >> "$FRONTEND_REPORT"
    echo "" >> "$FRONTEND_REPORT"
    
    # ESLint check
    log_info "Ejecutando ESLint..."
    echo "## 🔍 ESLINT" >> "$FRONTEND_REPORT"
    echo "" >> "$FRONTEND_REPORT"
    echo "\`\`\`" >> "$FRONTEND_REPORT"
    npm run lint 2>&1 | head -n 50 >> "$FRONTEND_REPORT" || echo "ESLint not configured" >> "$FRONTEND_REPORT"
    echo "\`\`\`" >> "$FRONTEND_REPORT"
    echo "" >> "$FRONTEND_REPORT"
    
    # Tests execution
    log_info "Ejecutando tests..."
    echo "## 🧪 TESTS" >> "$FRONTEND_REPORT"
    echo "" >> "$FRONTEND_REPORT"
    echo "\`\`\`" >> "$FRONTEND_REPORT"
    npm test -- --passWithNoTests 2>&1 | tail -n 100 >> "$FRONTEND_REPORT" || echo "Tests not configured or failed" >> "$FRONTEND_REPORT"
    echo "\`\`\`" >> "$FRONTEND_REPORT"
    echo "" >> "$FRONTEND_REPORT"
    
    # Build test
    log_info "Verificando build..."
    echo "## 🏗️ BUILD" >> "$FRONTEND_REPORT"
    echo "" >> "$FRONTEND_REPORT"
    echo "\`\`\`" >> "$FRONTEND_REPORT"
    npm run build 2>&1 | tail -n 50 >> "$FRONTEND_REPORT" || echo "Build failed or not configured" >> "$FRONTEND_REPORT"
    echo "\`\`\`" >> "$FRONTEND_REPORT"
    echo "" >> "$FRONTEND_REPORT"
    
    # Code metrics
    log_info "Generando métricas de código..."
    echo "## 📏 CODE METRICS" >> "$FRONTEND_REPORT"
    echo "" >> "$FRONTEND_REPORT"
    
    # Lines of code
    if [ -d "src/features" ]; then
        FEATURES_LOC=$(find src/features -name "*.ts" -o -name "*.tsx" -exec wc -l {} + 2>/dev/null | tail -n 1 | awk '{print $1}')
        echo "**Features LOC:** $FEATURES_LOC lines" >> "$FRONTEND_REPORT"
    fi
    
    SRC_LOC=$(find src -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -exec wc -l {} + 2>/dev/null | tail -n 1 | awk '{print $1}')
    echo "**Total src/ LOC:** $SRC_LOC lines" >> "$FRONTEND_REPORT"
    echo "" >> "$FRONTEND_REPORT"
    
    # TODO/FIXME count
    TODO_COUNT=$(grep -r "TODO" src/ 2>/dev/null | wc -l)
    FIXME_COUNT=$(grep -r "FIXME" src/ 2>/dev/null | wc -l)
    CONSOLE_LOG_COUNT=$(grep -r "console.log" src/ 2>/dev/null | wc -l)
    ANY_TYPE_COUNT=$(grep -r ": any" src/ 2>/dev/null | wc -l)
    
    echo "**TODOs in code:** $TODO_COUNT" >> "$FRONTEND_REPORT"
    echo "**FIXMEs in code:** $FIXME_COUNT" >> "$FRONTEND_REPORT"
    echo "**console.log() calls:** $CONSOLE_LOG_COUNT" >> "$FRONTEND_REPORT"
    echo "**any types:** $ANY_TYPE_COUNT" >> "$FRONTEND_REPORT"
    echo "" >> "$FRONTEND_REPORT"
    
    # npm outdated
    log_info "Verificando dependencias desactualizadas..."
    echo "## 📦 OUTDATED DEPENDENCIES" >> "$FRONTEND_REPORT"
    echo "" >> "$FRONTEND_REPORT"
    echo "\`\`\`" >> "$FRONTEND_REPORT"
    npm outdated 2>/dev/null | head -n 20 >> "$FRONTEND_REPORT" || echo "No outdated dependencies" >> "$FRONTEND_REPORT"
    echo "\`\`\`" >> "$FRONTEND_REPORT"
    echo "" >> "$FRONTEND_REPORT"
    
    cd ..
    
    log_success "Frontend audit completado: $FRONTEND_REPORT"
}

# ============================================================
# FUNCIÓN: MÉTRICAS GENERALES
# ============================================================
audit_general() {
    log_section "GENERANDO MÉTRICAS GENERALES DEL PROYECTO"

    GENERAL_REPORT="$PROJECT_ROOT/$OUTPUT_DIR/project-metrics.md"

    cat > "$GENERAL_REPORT" << 'HEADER'
# 📊 PROJECT METRICS
**Generated:** $(date)
**Purpose:** General project analysis

---

HEADER
    
    # Git statistics
    log_info "Analizando repositorio Git..."
    echo "## 📈 GIT STATISTICS" >> "$GENERAL_REPORT"
    echo "" >> "$GENERAL_REPORT"
    
    if [ -d ".git" ]; then
        TOTAL_COMMITS=$(git rev-list --all --count 2>/dev/null)
        BRANCHES=$(git branch -a 2>/dev/null | wc -l)
        CONTRIBUTORS=$(git shortlog -s -n --all 2>/dev/null | wc -l)
        LAST_COMMIT=$(git log -1 --format="%cd" 2>/dev/null)
        
        echo "**Total Commits:** $TOTAL_COMMITS" >> "$GENERAL_REPORT"
        echo "**Branches:** $BRANCHES" >> "$GENERAL_REPORT"
        echo "**Contributors:** $CONTRIBUTORS" >> "$GENERAL_REPORT"
        echo "**Last Commit:** $LAST_COMMIT" >> "$GENERAL_REPORT"
        echo "" >> "$GENERAL_REPORT"
        
        echo "**Recent commits:**" >> "$GENERAL_REPORT"
        echo "\`\`\`" >> "$GENERAL_REPORT"
        git log --oneline -20 2>/dev/null >> "$GENERAL_REPORT"
        echo "\`\`\`" >> "$GENERAL_REPORT"
    fi
    echo "" >> "$GENERAL_REPORT"
    
    # Docker
    log_info "Analizando configuración Docker..."
    echo "## 🐳 DOCKER" >> "$GENERAL_REPORT"
    echo "" >> "$GENERAL_REPORT"
    
    if [ -f "docker-compose.yml" ]; then
        echo "**docker-compose.yml:** ✅ Present" >> "$GENERAL_REPORT"
        echo "" >> "$GENERAL_REPORT"
        echo "\`\`\`yaml" >> "$GENERAL_REPORT"
        grep "services:" -A 50 docker-compose.yml 2>/dev/null | head -n 30 >> "$GENERAL_REPORT"
        echo "\`\`\`" >> "$GENERAL_REPORT"
    fi
    echo "" >> "$GENERAL_REPORT"
    
    # Documentation
    log_info "Analizando documentación..."
    echo "## 📚 DOCUMENTATION" >> "$GENERAL_REPORT"
    echo "" >> "$GENERAL_REPORT"
    
    DOCS_COUNT=$(find . -name "*.md" 2>/dev/null | wc -l)
    echo "**Markdown files:** $DOCS_COUNT" >> "$GENERAL_REPORT"
    echo "" >> "$GENERAL_REPORT"
    echo "**Files:**" >> "$GENERAL_REPORT"
    echo "\`\`\`" >> "$GENERAL_REPORT"
    find . -name "*.md" -not -path "./node_modules/*" -not -path "./vendor/*" 2>/dev/null | sort >> "$GENERAL_REPORT"
    echo "\`\`\`" >> "$GENERAL_REPORT"
    echo "" >> "$GENERAL_REPORT"
    
    # Environment files
    log_info "Verificando archivos de configuración..."
    echo "## ⚙️ CONFIGURATION" >> "$GENERAL_REPORT"
    echo "" >> "$GENERAL_REPORT"
    
    [ -f ".env.example" ] && echo "- ✅ .env.example" >> "$GENERAL_REPORT"
    [ -f "backend/.env.example" ] && echo "- ✅ backend/.env.example" >> "$GENERAL_REPORT"
    [ -f "frontend/.env.example" ] && echo "- ✅ frontend/.env.example" >> "$GENERAL_REPORT"
    [ -f ".gitignore" ] && echo "- ✅ .gitignore" >> "$GENERAL_REPORT"
    [ -f "README.md" ] && echo "- ✅ README.md" >> "$GENERAL_REPORT"
    echo "" >> "$GENERAL_REPORT"
    
    log_success "General metrics completadas: $GENERAL_REPORT"
}

# ============================================================
# FUNCIÓN: CONSOLIDAR REPORTES
# ============================================================
consolidate_reports() {
    log_section "CONSOLIDANDO REPORTES FINALES"

    CONSOLIDATED="$PROJECT_ROOT/$OUTPUT_DIR/00-AUDIT-SUMMARY.md"

    cat > "$CONSOLIDATED" << 'HEADER'
# 🔍 AUDITORÍA PROFUNDA - RESUMEN CONSOLIDADO
**Generated:** $(date)
**Project:** TucumánEvents Platform
**Purpose:** Comprehensive deep audit of the entire codebase

---

## 📊 EXECUTIVE SUMMARY

Este reporte consolida los resultados de la auditoría profunda realizada sobre:
- ✅ Backend (Laravel + PostgreSQL)
- ✅ Frontend (Next.js + TypeScript + React)
- ✅ General Project Metrics
- ✅ Git History Analysis

---

## 📁 REPORTES GENERADOS

HEADER
    
    for report in "$PROJECT_ROOT/$OUTPUT_DIR"/*.md; do
        if [ "$report" != "$CONSOLIDATED" ]; then
            FILENAME=$(basename "$report")
            echo "- [$FILENAME](./$FILENAME)" >> "$CONSOLIDATED"
        fi
    done
    
    echo "" >> "$CONSOLIDATED"
    echo "---" >> "$CONSOLIDATED"
    echo "" >> "$CONSOLIDATED"
    echo "## 🎯 SIGUIENTE PASO" >> "$CONSOLIDATED"
    echo "" >> "$CONSOLIDATED"
    echo "1. Revisar los reportes generados en \`$OUTPUT_DIR/\`" >> "$CONSOLIDATED"
    echo "2. Subir estos reportes a Claude para análisis profundo" >> "$CONSOLIDATED"
    echo "3. Claude generará documentación actualizada basada en estos datos reales" >> "$CONSOLIDATED"
    echo "" >> "$CONSOLIDATED"
    
    log_success "Resumen consolidado: $CONSOLIDATED"
}

# ============================================================
# MAIN EXECUTION
# ============================================================

MODE="${1:---all}"

case $MODE in
    --backend)
        audit_backend
        ;;
    --frontend)
        audit_frontend
        ;;
    --general)
        audit_general
        ;;
    --all)
        audit_backend
        audit_frontend
        audit_general
        consolidate_reports
        ;;
    *)
        log_error "Modo inválido: $MODE"
        echo "Uso: bash deep-audit.sh [--backend|--frontend|--general|--all]"
        exit 1
        ;;
esac

# Summary
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ AUDITORÍA COMPLETADA EXITOSAMENTE             ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}📁 Reportes generados en: ${OUTPUT_DIR}/${NC}"
echo ""
echo "Archivos generados:"
ls -lh "$PROJECT_ROOT/$OUTPUT_DIR"/ | tail -n +2
echo ""
log_info "Siguiente paso: Subir estos reportes a Claude para análisis profundo"
echo ""

exit 0