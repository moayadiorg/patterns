# GitHub Actions Workflows

This directory contains automated workflows for the patterns repository to ensure quality, consistency, and proper review processes.

## Workflows

### 1. `validate-pattern.yml` - Pattern Validation

**Triggers:**
- Pull requests to `main` or `master` branch
- Manual workflow dispatch

**Purpose:**
Automatically validates pattern submissions against repository standards to ensure consistency and completeness.

**Validation Checks:**

1. **Pattern ID Naming Convention**
   - Validates that pattern directory names follow kebab-case format
   - Example: `my-automation-pattern` ✅
   - Invalid: `MyAutomationPattern`, `my_automation_pattern` ❌

2. **Required Files Check**
   - `pattern.yaml` - Must exist and not be empty
   - `README.md` - Must exist and contain adequate documentation
   - `diagrams/` - Directory must exist

3. **YAML Schema Validation**
   - Validates `pattern.yaml` against JSON Schema
   - Ensures all required fields are present
   - Validates data types and formats
   - Checks enum values (category, language, framework, status)

4. **Category Validation**
   - Verifies category exists in `categories.config.json`
   - Valid categories: `automation`, `observability`, `security`, `monitoring`, `integration`, `data-protection`

5. **Referenced Files Validation**
   - Ensures architecture diagrams exist if referenced
   - Validates code snippet files exist in `implementation/` directory

**Jobs:**

- `detect-changes` - Identifies which pattern directories have been modified
- `validate-patterns` - Runs validation for each changed pattern (matrix strategy)
- `validate-summary` - Aggregates results and provides summary
- `no-patterns-detected` - Handles PRs without pattern changes

**Outputs:**
- Validation results in job logs
- Step summary with pattern count and status
- Artifact uploads for validation analysis

---

### 2. `notify-reviewers.yml` - SME Reviewer Notification

**Triggers:**
- Pull request opened, synchronized, or reopened
- Manual workflow dispatch

**Purpose:**
Automatically identifies and notifies Subject Matter Experts (SMEs) based on pattern categories for proper technical review.

**Features:**

1. **Category-Based Reviewer Assignment**
   - Reads pattern category from `pattern.yaml`
   - Maps category to designated SME reviewers
   - Supports multiple reviewers per category

2. **PR Comment Generation**
   - Posts detailed review assignment comment
   - Lists SMEs by category
   - Includes review checklist
   - Updates existing comment if already posted

3. **Automatic Review Requests**
   - Requests reviews from identified SMEs (if they have repository access)
   - Falls back to comment notification if auto-assignment fails

4. **Label Management**
   - Adds `pattern-submission` label
   - Adds `needs-review` label

**SME Mapping:**

The reviewer mapping is defined in `.github/scripts/notify-reviewers.js`:

```javascript
const SME_MAPPING = {
  automation: {
    reviewers: ['automation-sme1', 'automation-sme2'],
    team: 'automation-team',
    description: 'Automation & Workflows'
  },
  // ... other categories
};
```

**To Configure:**
1. Edit `.github/scripts/notify-reviewers.js`
2. Update the `SME_MAPPING` object with actual GitHub usernames
3. Update `FALLBACK_REVIEWERS` for general reviewers
4. Commit changes

---

## Scripts

### `validate-pattern.js`

**Location:** `.github/scripts/validate-pattern.js`

**Usage:**
```bash
node validate-pattern.js <pattern-directory>
```

**Dependencies:**
- `js-yaml` - YAML parsing
- `ajv` - JSON Schema validation
- `ajv-formats` - Additional format validators

**Features:**
- Comprehensive pattern validation
- Colored console output
- Detailed error messages
- Warning vs. error classification
- Exit codes for CI/CD integration

**Example Output:**
```
🔍 Pattern Validation Starting
============================================================

📝 Step 1: Validating Pattern ID
✅ Pattern ID "my-automation-pattern" follows naming conventions

📂 Step 2: Checking Required Files
✅ Required file exists: pattern.yaml
✅ Required file exists: README.md
✅ Required directory exists: diagrams/

📋 Step 3: Loading Categories Configuration
✅ Loaded categories.config.json

🔬 Step 4: Validating pattern.yaml
✅ pattern.yaml is valid YAML format
✅ pattern.yaml conforms to JSON Schema
✅ Category "automation" is valid
✅ Architecture diagram exists: diagrams/architecture.png

📖 Step 5: Validating README.md
✅ README.md has adequate content

============================================================
📊 Validation Summary
============================================================

✨ All validations passed! Pattern is ready for review.
```

---

### `detect-changed-patterns.sh`

**Location:** `.github/scripts/detect-changed-patterns.sh`

**Usage:**
```bash
./detect-changed-patterns.sh
```

**Purpose:**
Detects which pattern directories have been modified in a pull request by comparing against the base branch.

**Outputs:**
- `changed_patterns` - Space-separated list of pattern directories
- `pattern_count` - Number of changed patterns
- `patterns_json` - JSON array of pattern directories

**Logic:**
1. Fetches base branch
2. Gets diff of changed files
3. Extracts unique pattern directories
4. Excludes special directories (`.github/`, `schemas/`, `pattern-template/`)
5. Validates directories exist
6. Outputs results for GitHub Actions

---

### `notify-reviewers.js`

**Location:** `.github/scripts/notify-reviewers.js`

**Usage:**
```bash
node notify-reviewers.js <pattern-dir1> [pattern-dir2] ...
```

**Purpose:**
Identifies SME reviewers based on pattern categories and generates notification content.

**Features:**
- Category-to-reviewer mapping
- PR comment generation
- GitHub Actions output formatting
- Fallback reviewers for unknown categories

**Outputs:**
- `reviewers` - JSON array of reviewer usernames
- `reviewer_count` - Number of reviewers
- `pr_comment` - Formatted PR comment body

---

## JSON Schema

### `pattern-schema.json`

**Location:** `schemas/pattern-schema.json`

**Purpose:**
Defines the structure and validation rules for `pattern.yaml` files.

**Key Features:**
- Required field enforcement
- Type validation
- Format validation (email, URI, date)
- Enum constraints for controlled vocabularies
- Pattern matching for naming conventions
- Array constraints (min/max items, uniqueness)

**Required Fields:**
- `title`
- `description`
- `author` (with `name` and `email`)
- `category`
- `tags`
- `technologies`
- `use_case`

**Optional Fields:**
- `architecture_diagram`
- `prerequisites`
- `implementation`
- `security`
- `limitations`
- `related_patterns`
- `related_plays`
- `created_date`
- `last_updated`
- `version`
- `status`

---

## Setup Instructions

### 1. Configure SME Reviewers

Edit `.github/scripts/notify-reviewers.js`:

```javascript
const SME_MAPPING = {
  automation: {
    reviewers: ['alice', 'bob'],  // Update with actual usernames
    team: 'automation-team',
    description: 'Automation & Workflows'
  },
  // ... update other categories
};

const FALLBACK_REVIEWERS = ['pattern-lead', 'tech-lead'];  // Update fallback reviewers
```

### 2. Install Dependencies (Local Testing)

```bash
cd .github/scripts
npm install
```

### 3. Test Validation Locally

```bash
cd .github/scripts
node validate-pattern.js ../../pattern-template
```

### 4. Test Reviewer Notification Locally

```bash
cd .github/scripts
node notify-reviewers.js ../../pattern-template
```

---

## Workflow Outputs

### Validation Workflow

**Success:**
- All jobs pass
- Green checkmark on PR
- Summary shows validated patterns

**Failure:**
- Failed jobs with detailed logs
- Red X on PR
- Summary shows errors to fix

### Reviewer Notification Workflow

**Success:**
- PR comment with reviewer assignments
- Labels added
- Review requests sent (if configured)
- Summary shows notification status

---

## Troubleshooting

### Validation Fails with "JSON Schema not found"

**Cause:** Schema file is missing or not in the correct location.

**Solution:**
```bash
# Ensure schema exists
ls -la schemas/pattern-schema.json

# If missing, the schema file should be at: schemas/pattern-schema.json
```

### Reviewer Notification Doesn't Assign Reviewers

**Cause:** SME usernames may not exist or may not have repository access.

**Solution:**
1. Verify usernames in `notify-reviewers.js` are correct
2. Ensure SMEs have repository access
3. Check PR comment for notification (reviewers are still notified even if auto-assignment fails)

### Pattern Not Detected in PR

**Cause:** Changes may be in excluded directories.

**Solution:**
- Ensure pattern is in a top-level directory (not under `.github/`, `schemas/`, etc.)
- Check `detect-changed-patterns.sh` exclusion list
- Verify directory structure matches expected format

### Validation Script Dependencies Missing

**Cause:** npm dependencies not installed.

**Solution:**
```bash
cd .github/scripts
npm install
```

---

## Maintenance

### Adding New Validation Rules

1. Update `schemas/pattern-schema.json` for schema-based validation
2. Update `validate-pattern.js` for custom validation logic
3. Test locally before committing
4. Update this README with new validation details

### Adding New Categories

1. Update `categories.config.json` with new category
2. Update `schemas/pattern-schema.json` enum for `category` field
3. Update `notify-reviewers.js` with SME mapping
4. Update this README with new category details

### Updating Dependencies

```bash
cd .github/scripts
npm update
npm audit fix
```

---

## CI/CD Integration

Both workflows are designed to:
- Run automatically on PRs
- Provide clear feedback via comments and summaries
- Block merging on validation failures (if branch protection is enabled)
- Support manual triggering via workflow dispatch

### Branch Protection Recommendations

Configure branch protection rules for `main`:
- ✅ Require status checks to pass before merging
  - ✅ `Validate Pattern` workflow
- ✅ Require pull request reviews before merging
- ✅ Require conversation resolution before merging

---

## Contributing

When modifying workflows:

1. Test changes locally first using the scripts
2. Use workflow_dispatch trigger for testing in GitHub Actions
3. Document changes in this README
4. Update schema and scripts as needed
5. Ensure backward compatibility where possible

---

## Support

For issues with workflows:
1. Check workflow logs in the Actions tab
2. Review this README for troubleshooting steps
3. Test scripts locally to reproduce issues
4. Open an issue with detailed logs and context
