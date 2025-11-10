#!/usr/bin/env node

/**
 * Pattern Validation Script
 * Validates pattern submissions against repository standards
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

class PatternValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(this.ajv);
  }

  log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
  }

  error(message) {
    this.errors.push(message);
    this.log(`❌ ERROR: ${message}`, colors.red);
  }

  warning(message) {
    this.warnings.push(message);
    this.log(`⚠️  WARNING: ${message}`, colors.yellow);
  }

  success(message) {
    this.log(`✅ ${message}`, colors.green);
  }

  info(message) {
    this.log(`ℹ️  ${message}`, colors.cyan);
  }

  /**
   * Validate pattern ID naming convention
   */
  validatePatternId(patternDir) {
    const patternId = path.basename(patternDir);
    const kebabCaseRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

    if (!kebabCaseRegex.test(patternId)) {
      this.error(
        `Pattern ID "${patternId}" does not follow kebab-case naming convention. ` +
        `Use lowercase letters, numbers, and hyphens only (e.g., "my-pattern-name").`
      );
      return false;
    }

    this.success(`Pattern ID "${patternId}" follows naming conventions`);
    return true;
  }

  /**
   * Check if required files exist
   */
  validateRequiredFiles(patternDir) {
    const requiredFiles = [
      'pattern.yaml',
      'README.md',
    ];

    const requiredDirs = [
      'diagrams',
    ];

    let allFilesExist = true;

    // Check files
    for (const file of requiredFiles) {
      const filePath = path.join(patternDir, file);
      if (!fs.existsSync(filePath)) {
        this.error(`Required file missing: ${file}`);
        allFilesExist = false;
      } else {
        // Check if file is not empty
        const stats = fs.statSync(filePath);
        if (stats.size === 0) {
          this.error(`Required file is empty: ${file}`);
          allFilesExist = false;
        } else {
          this.success(`Required file exists: ${file}`);
        }
      }
    }

    // Check directories
    for (const dir of requiredDirs) {
      const dirPath = path.join(patternDir, dir);
      if (!fs.existsSync(dirPath)) {
        this.error(`Required directory missing: ${dir}/`);
        allFilesExist = false;
      } else if (!fs.statSync(dirPath).isDirectory()) {
        this.error(`${dir} exists but is not a directory`);
        allFilesExist = false;
      } else {
        this.success(`Required directory exists: ${dir}/`);
      }
    }

    return allFilesExist;
  }


  /**
   * Validate pattern.yaml against JSON Schema
   */
  async validatePatternYaml(patternDir, repoRoot) {
    const patternYamlPath = path.join(patternDir, 'pattern.yaml');

    if (!fs.existsSync(patternYamlPath)) {
      this.error('pattern.yaml not found');
      return false;
    }

    let patternData;
    try {
      const yamlContent = fs.readFileSync(patternYamlPath, 'utf8');
      patternData = yaml.load(yamlContent);
      this.success('pattern.yaml is valid YAML format');
    } catch (error) {
      this.error(`Failed to parse pattern.yaml: ${error.message}`);
      return false;
    }

    // Load JSON Schema
    const schemaPath = path.join(repoRoot, 'schemas', 'pattern-schema.json');
    if (!fs.existsSync(schemaPath)) {
      this.error('JSON Schema not found at schemas/pattern-schema.json');
      return false;
    }

    let schema;
    try {
      const schemaContent = fs.readFileSync(schemaPath, 'utf8');
      schema = JSON.parse(schemaContent);
    } catch (error) {
      this.error(`Failed to load JSON Schema: ${error.message}`);
      return false;
    }

    // Validate against schema
    const validate = this.ajv.compile(schema);
    const valid = validate(patternData);

    if (!valid) {
      this.error('pattern.yaml does not conform to JSON Schema:');
      for (const error of validate.errors) {
        const field = error.instancePath || error.params.missingProperty || 'root';
        this.error(`  - ${field}: ${error.message}`);
      }
      return false;
    }

    this.success('pattern.yaml conforms to JSON Schema (including category, required fields, formats, etc.)');

    // Validate referenced files exist
    if (patternData.architecture_diagram) {
      const diagramPath = path.join(patternDir, patternData.architecture_diagram);
      if (!fs.existsSync(diagramPath)) {
        this.error(`Architecture diagram not found: ${patternData.architecture_diagram}`);
        return false;
      }
      this.success(`Architecture diagram exists: ${patternData.architecture_diagram}`);
    }

    // Validate code snippet files exist
    if (patternData.implementation && patternData.implementation.code_snippets) {
      for (const snippet of patternData.implementation.code_snippets) {
        const snippetPath = path.join(patternDir, snippet.file);
        if (!fs.existsSync(snippetPath)) {
          this.error(`Code snippet file not found: ${snippet.file}`);
          return false;
        }
        this.success(`Code snippet exists: ${snippet.file}`);
      }
    }

    return true;
  }

  /**
   * Validate README.md content
   */
  validateReadme(patternDir) {
    const readmePath = path.join(patternDir, 'README.md');

    if (!fs.existsSync(readmePath)) {
      return false;
    }

    const content = fs.readFileSync(readmePath, 'utf8');
    const minLength = 100; // Minimum reasonable README length

    if (content.length < minLength) {
      this.warning('README.md seems too short. Consider adding more documentation.');
      return true;
    }

    // Check for common sections
    const recommendedSections = [
      'Overview',
      'Architecture',
      'Implementation',
      'Prerequisites',
    ];

    const missingSections = recommendedSections.filter(
      section => !content.toLowerCase().includes(section.toLowerCase())
    );

    if (missingSections.length > 0) {
      this.warning(
        `README.md is missing recommended sections: ${missingSections.join(', ')}`
      );
    }

    this.success('README.md has adequate content');
    return true;
  }

  /**
   * Main validation function
   */
  async validate(patternDir, repoRoot) {
    this.log('\n' + '='.repeat(60), colors.blue);
    this.log('🔍 Pattern Validation Starting', colors.blue);
    this.log('='.repeat(60) + '\n', colors.blue);

    this.info(`Validating pattern at: ${patternDir}\n`);

    // 1. Validate pattern ID naming convention
    this.log('📝 Step 1: Validating Pattern ID', colors.cyan);
    this.validatePatternId(patternDir);
    console.log();

    // 2. Check required files
    this.log('📂 Step 2: Checking Required Files', colors.cyan);
    const filesValid = this.validateRequiredFiles(patternDir);
    console.log();

    // 3. Validate pattern.yaml against JSON Schema
    this.log('🔬 Step 3: Validating pattern.yaml', colors.cyan);
    const yamlValid = await this.validatePatternYaml(patternDir, repoRoot);
    console.log();

    // 4. Validate README
    this.log('📖 Step 4: Validating README.md', colors.cyan);
    this.validateReadme(patternDir);
    console.log();

    // Summary
    this.log('='.repeat(60), colors.blue);
    this.log('📊 Validation Summary', colors.blue);
    this.log('='.repeat(60), colors.blue);

    if (this.errors.length === 0 && this.warnings.length === 0) {
      this.success('\n✨ All validations passed! Pattern is ready for review.\n');
      return 0;
    }

    if (this.warnings.length > 0) {
      this.log(`\n⚠️  Warnings: ${this.warnings.length}`, colors.yellow);
      this.warnings.forEach((warning, i) => {
        this.log(`  ${i + 1}. ${warning}`, colors.yellow);
      });
    }

    if (this.errors.length > 0) {
      this.log(`\n❌ Errors: ${this.errors.length}`, colors.red);
      this.errors.forEach((error, i) => {
        this.log(`  ${i + 1}. ${error}`, colors.red);
      });
      this.log('\n🚫 Validation failed. Please fix the errors above.\n', colors.red);
      return 1;
    }

    this.log('\n✅ Validation passed with warnings.\n', colors.yellow);
    return 0;
  }
}

/**
 * Find repository root by looking for .git directory or categories.config.json
 */
function findRepoRoot(startPath) {
  let currentPath = startPath;

  while (currentPath !== path.parse(currentPath).root) {
    // Check for .git directory
    if (fs.existsSync(path.join(currentPath, '.git'))) {
      return currentPath;
    }

    // Check for categories.config.json
    if (fs.existsSync(path.join(currentPath, 'categories.config.json'))) {
      return currentPath;
    }

    // Move up one directory
    currentPath = path.dirname(currentPath);
  }

  // Fallback to current working directory
  return process.cwd();
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: node validate-pattern.js <pattern-directory>');
    process.exit(1);
  }

  const patternDir = path.resolve(args[0]);

  if (!fs.existsSync(patternDir)) {
    console.error(`Error: Pattern directory not found: ${patternDir}`);
    process.exit(1);
  }

  if (!fs.statSync(patternDir).isDirectory()) {
    console.error(`Error: Path is not a directory: ${patternDir}`);
    process.exit(1);
  }

  // Find repository root
  const repoRoot = findRepoRoot(patternDir);

  const validator = new PatternValidator();
  const exitCode = await validator.validate(patternDir, repoRoot);
  process.exit(exitCode);
}

if (require.main === module) {
  main().catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
}

module.exports = { PatternValidator };
