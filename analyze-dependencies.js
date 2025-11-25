#!/usr/bin/env node
/**
 * Dependency Analyzer for Features-Based Architecture
 * Analyzes imports, detects circular dependencies, and verifies Single Responsibility
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  backend: {
    root: 'backend/app/Features',
    extensions: ['.php']
  },
  frontend: {
    root: 'frontend/src/features',
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  }
};

// Results storage
const results = {
  backend: { features: {}, dependencies: [], circular: [], issues: [] },
  frontend: { features: {}, dependencies: [], circular: [], issues: [] }
};

/**
 * Recursively find all files with specific extensions
 */
function findFiles(dir, extensions) {
  const files = [];

  if (!fs.existsSync(dir)) {
    return files;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...findFiles(fullPath, extensions));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (extensions.includes(ext)) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

/**
 * Extract imports from TypeScript/JavaScript file
 */
function extractJSImports(content, filePath) {
  const imports = [];

  // Match: import X from '@/features/xxx'
  // Match: import { X } from '@/features/xxx'
  // Match: import('@/features/xxx')
  const importRegex = /import\s+(?:[\w\s{},*]+\s+from\s+)?['"]@\/features\/([^'"]+)['"]/g;

  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    const featureName = importPath.split('/')[0];
    imports.push({
      feature: featureName,
      fullPath: importPath,
      line: content.substring(0, match.index).split('\n').length
    });
  }

  // Also check for relative imports that escape feature
  const relativeEscapeRegex = /import\s+(?:[\w\s{},*]+\s+from\s+)?['"]\.\.\/\.\.\/([^'"]+)['"]/g;
  while ((match = relativeEscapeRegex.exec(content)) !== null) {
    const importPath = match[1];
    const featureName = importPath.split('/')[0];
    imports.push({
      feature: featureName,
      fullPath: importPath,
      line: content.substring(0, match.index).split('\n').length,
      type: 'relative-escape'
    });
  }

  return imports;
}

/**
 * Extract imports from PHP file
 */
function extractPHPImports(content, filePath) {
  const imports = [];

  // Match: use App\Features\XXX\...
  const useRegex = /use\s+App\\Features\\([^\\;]+)\\([^;]+);/g;

  let match;
  while ((match = useRegex.exec(content)) !== null) {
    const featureName = match[1];
    const className = match[2].split('\\').pop();
    imports.push({
      feature: featureName,
      class: className,
      line: content.substring(0, match.index).split('\n').length
    });
  }

  return imports;
}

/**
 * Analyze a single feature
 */
function analyzeFeature(featureDir, featureName, type) {
  const extensions = CONFIG[type].extensions;
  const files = findFiles(featureDir, extensions);

  const featureData = {
    name: featureName,
    type,
    path: featureDir,
    fileCount: files.length,
    files: {},
    imports: [],
    externalDependencies: new Set(),
    internalImports: 0,
    linesOfCode: 0
  };

  for (const filePath of files) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const relativePath = path.relative(featureDir, filePath);

    // Count lines
    const lineCount = content.split('\n').length;
    featureData.linesOfCode += lineCount;

    // Extract imports
    const imports = type === 'backend'
      ? extractPHPImports(content, filePath)
      : extractJSImports(content, filePath);

    featureData.files[relativePath] = {
      path: filePath,
      lines: lineCount,
      imports: imports.length
    };

    // Categorize imports
    for (const imp of imports) {
      if (imp.feature === featureName) {
        featureData.internalImports++;
      } else {
        featureData.externalDependencies.add(imp.feature);
        featureData.imports.push({
          from: relativePath,
          to: imp.feature,
          line: imp.line,
          type: imp.type || 'normal'
        });
      }
    }
  }

  featureData.externalDependencies = Array.from(featureData.externalDependencies);

  return featureData;
}

/**
 * Detect circular dependencies
 */
function detectCircularDependencies(features, type) {
  const circular = [];

  for (const featureName in features) {
    const feature = features[featureName];

    // Check if any of our dependencies depend back on us
    for (const depName of feature.externalDependencies) {
      if (features[depName]) {
        const depFeature = features[depName];
        if (depFeature.externalDependencies.includes(featureName)) {
          circular.push({
            feature1: featureName,
            feature2: depName,
            type: 'bidirectional'
          });
        }
      }
    }
  }

  // Remove duplicates (A→B is same as B→A)
  const unique = [];
  const seen = new Set();

  for (const circ of circular) {
    const key = [circ.feature1, circ.feature2].sort().join('↔');
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(circ);
    }
  }

  return unique;
}

/**
 * Check Single Responsibility violations
 */
function checkSingleResponsibility(features, type) {
  const issues = [];

  for (const featureName in features) {
    const feature = features[featureName];

    // Rule 1: Feature with too many dependencies (>5 = too coupled)
    if (feature.externalDependencies.length > 5) {
      issues.push({
        feature: featureName,
        type: 'too-many-dependencies',
        severity: 'high',
        message: `Feature has ${feature.externalDependencies.length} external dependencies (should be ≤5)`,
        details: feature.externalDependencies
      });
    }

    // Rule 2: Feature with too many files (>20 = might need split)
    if (feature.fileCount > 20) {
      issues.push({
        feature: featureName,
        type: 'too-many-files',
        severity: 'medium',
        message: `Feature has ${feature.fileCount} files (consider splitting if >20)`,
        details: null
      });
    }

    // Rule 3: Feature with too many LOC (>2000 = definitely needs split)
    if (feature.linesOfCode > 2000) {
      issues.push({
        feature: featureName,
        type: 'too-large',
        severity: 'high',
        message: `Feature has ${feature.linesOfCode} lines of code (should be <2000)`,
        details: null
      });
    }

    // Rule 4: Features that are heavily depended on (>5 features = should be in /shared)
    let dependentCount = 0;
    for (const otherName in features) {
      if (otherName !== featureName) {
        const other = features[otherName];
        if (other.externalDependencies.includes(featureName)) {
          dependentCount++;
        }
      }
    }

    if (dependentCount > 5) {
      issues.push({
        feature: featureName,
        type: 'should-be-shared',
        severity: 'medium',
        message: `Feature is used by ${dependentCount} other features (consider moving to /shared)`,
        details: null
      });
    }
  }

  return issues;
}

/**
 * Build dependency graph
 */
function buildDependencyGraph(features, type) {
  const edges = [];

  for (const featureName in features) {
    const feature = features[featureName];
    for (const dep of feature.externalDependencies) {
      edges.push({
        from: featureName,
        to: dep,
        count: feature.imports.filter(i => i.to === dep).length
      });
    }
  }

  return edges;
}

/**
 * Generate ASCII dependency graph
 */
function generateASCIIGraph(features, dependencies) {
  let graph = '\n';

  for (const dep of dependencies) {
    const count = dep.count;
    const arrow = count > 5 ? '═══>>' : count > 2 ? '═══>' : '───>';
    graph += `  ${dep.from.padEnd(20)} ${arrow} ${dep.to} (${count} imports)\n`;
  }

  return graph;
}

/**
 * Main analysis
 */
function analyze() {
  console.log('🔍 Analyzing Features Architecture...\n');

  // Analyze Backend
  console.log('📦 Backend Features:');
  const backendRoot = CONFIG.backend.root;
  if (fs.existsSync(backendRoot)) {
    const backendFeatures = fs.readdirSync(backendRoot, { withFileTypes: true })
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name);

    for (const featureName of backendFeatures) {
      const featureDir = path.join(backendRoot, featureName);
      console.log(`  - Analyzing ${featureName}...`);
      results.backend.features[featureName] = analyzeFeature(featureDir, featureName, 'backend');
    }
  }

  // Analyze Frontend
  console.log('\n🎨 Frontend Features:');
  const frontendRoot = CONFIG.frontend.root;
  if (fs.existsSync(frontendRoot)) {
    const frontendFeatures = fs.readdirSync(frontendRoot, { withFileTypes: true })
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name);

    for (const featureName of frontendFeatures) {
      const featureDir = path.join(frontendRoot, featureName);
      console.log(`  - Analyzing ${featureName}...`);
      results.frontend.features[featureName] = analyzeFeature(featureDir, featureName, 'frontend');
    }
  }

  // Detect circular dependencies
  console.log('\n🔄 Detecting circular dependencies...');
  results.backend.circular = detectCircularDependencies(results.backend.features, 'backend');
  results.frontend.circular = detectCircularDependencies(results.frontend.features, 'frontend');

  // Check Single Responsibility
  console.log('✅ Checking Single Responsibility...');
  results.backend.issues = checkSingleResponsibility(results.backend.features, 'backend');
  results.frontend.issues = checkSingleResponsibility(results.frontend.features, 'frontend');

  // Build dependency graphs
  results.backend.dependencies = buildDependencyGraph(results.backend.features, 'backend');
  results.frontend.dependencies = buildDependencyGraph(results.frontend.features, 'frontend');

  console.log('✅ Analysis complete!\n');
}

/**
 * Generate report
 */
function generateReport() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 FEATURES ARCHITECTURE ANALYSIS REPORT');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Backend Summary
  console.log('━━━ BACKEND SUMMARY ━━━');
  console.log(`Features: ${Object.keys(results.backend.features).length}`);
  console.log(`Total Files: ${Object.values(results.backend.features).reduce((sum, f) => sum + f.fileCount, 0)}`);
  console.log(`Total LOC: ${Object.values(results.backend.features).reduce((sum, f) => sum + f.linesOfCode, 0).toLocaleString()}`);
  console.log(`Dependencies: ${results.backend.dependencies.length}`);
  console.log(`Circular Dependencies: ${results.backend.circular.length} ⚠️`);
  console.log(`Issues Found: ${results.backend.issues.length}\n`);

  // Frontend Summary
  console.log('━━━ FRONTEND SUMMARY ━━━');
  console.log(`Features: ${Object.keys(results.frontend.features).length}`);
  console.log(`Total Files: ${Object.values(results.frontend.features).reduce((sum, f) => sum + f.fileCount, 0)}`);
  console.log(`Total LOC: ${Object.values(results.frontend.features).reduce((sum, f) => sum + f.linesOfCode, 0).toLocaleString()}`);
  console.log(`Dependencies: ${results.frontend.dependencies.length}`);
  console.log(`Circular Dependencies: ${results.frontend.circular.length} ⚠️`);
  console.log(`Issues Found: ${results.frontend.issues.length}\n`);

  // Circular Dependencies
  if (results.backend.circular.length > 0 || results.frontend.circular.length > 0) {
    console.log('━━━ CIRCULAR DEPENDENCIES ━━━');

    if (results.backend.circular.length > 0) {
      console.log('\n🔴 Backend:');
      results.backend.circular.forEach(circ => {
        console.log(`  ⚠️  ${circ.feature1} ↔ ${circ.feature2}`);
      });
    }

    if (results.frontend.circular.length > 0) {
      console.log('\n🔴 Frontend:');
      results.frontend.circular.forEach(circ => {
        console.log(`  ⚠️  ${circ.feature1} ↔ ${circ.feature2}`);
      });
    }
    console.log();
  }

  // Single Responsibility Issues
  if (results.backend.issues.length > 0 || results.frontend.issues.length > 0) {
    console.log('━━━ SINGLE RESPONSIBILITY VIOLATIONS ━━━');

    if (results.backend.issues.length > 0) {
      console.log('\n🔴 Backend Issues:');
      results.backend.issues.forEach(issue => {
        const icon = issue.severity === 'high' ? '🔴' : '🟡';
        console.log(`  ${icon} [${issue.feature}] ${issue.message}`);
        if (issue.details) {
          console.log(`     Dependencies: ${issue.details.join(', ')}`);
        }
      });
    }

    if (results.frontend.issues.length > 0) {
      console.log('\n🔴 Frontend Issues:');
      results.frontend.issues.forEach(issue => {
        const icon = issue.severity === 'high' ? '🔴' : '🟡';
        console.log(`  ${icon} [${issue.feature}] ${issue.message}`);
        if (issue.details) {
          console.log(`     Dependencies: ${issue.details.join(', ')}`);
        }
      });
    }
    console.log();
  }

  // Dependency Graphs
  console.log('━━━ DEPENDENCY GRAPHS ━━━');

  if (results.backend.dependencies.length > 0) {
    console.log('\n📦 Backend Dependencies:');
    console.log(generateASCIIGraph(results.backend.features, results.backend.dependencies));
  }

  if (results.frontend.dependencies.length > 0) {
    console.log('🎨 Frontend Dependencies:');
    console.log(generateASCIIGraph(results.frontend.features, results.frontend.dependencies));
  }

  // Feature Details
  console.log('━━━ FEATURE DETAILS ━━━\n');

  console.log('📦 Backend Features:');
  for (const [name, feature] of Object.entries(results.backend.features)) {
    console.log(`\n  ${name}:`);
    console.log(`    Files: ${feature.fileCount}`);
    console.log(`    LOC: ${feature.linesOfCode.toLocaleString()}`);
    console.log(`    External Deps: ${feature.externalDependencies.length}`);
    if (feature.externalDependencies.length > 0) {
      console.log(`      → ${feature.externalDependencies.join(', ')}`);
    }
  }

  console.log('\n🎨 Frontend Features:');
  for (const [name, feature] of Object.entries(results.frontend.features)) {
    console.log(`\n  ${name}:`);
    console.log(`    Files: ${feature.fileCount}`);
    console.log(`    LOC: ${feature.linesOfCode.toLocaleString()}`);
    console.log(`    External Deps: ${feature.externalDependencies.length}`);
    if (feature.externalDependencies.length > 0) {
      console.log(`      → ${feature.externalDependencies.join(', ')}`);
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('✅ Report generation complete!');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Save JSON report
  const reportPath = 'architecture-analysis-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`📄 Detailed JSON report saved to: ${reportPath}\n`);
}

// Run analysis
try {
  analyze();
  generateReport();
} catch (error) {
  console.error('❌ Error during analysis:', error);
  process.exit(1);
}
