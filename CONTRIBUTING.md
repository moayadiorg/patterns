# Contributing to Patterns Repository

Thank you for contributing to the patterns repository! This guide will help you submit high-quality patterns that follow our standards.

## Table of Contents

- [Getting Started](#getting-started)
- [Pattern Structure](#pattern-structure)
- [Submission Process](#submission-process)
- [Local Validation](#local-validation)
- [Review Process](#review-process)
- [Style Guidelines](#style-guidelines)
- [Categories](#categories)
- [Getting Help](#getting-help)

---

## Getting Started

### Prerequisites

- Git installed locally
- Text editor or IDE
- Basic understanding of YAML
- Node.js 18+ (for local validation)

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/patterns.git
   cd patterns
   ```

3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/moayadiorg/patterns.git
   ```

---

## Pattern Structure

Each pattern must follow this directory structure:

```
my-pattern-name/
├── pattern.yaml              # Required: Pattern metadata
├── README.md                 # Required: Detailed documentation
├── diagrams/                 # Required: Architecture diagrams
│   └── architecture.png      # Main architecture diagram
└── implementation/           # Optional: Code examples
    └── example.js            # Code snippets
```

### Pattern Naming Convention

Pattern directories must use **kebab-case** (lowercase with hyphens):

✅ **Good Examples:**
- `api-gateway-authentication`
- `multi-region-deployment`
- `event-driven-processing`

❌ **Bad Examples:**
- `ApiGatewayAuthentication` (PascalCase)
- `api_gateway_authentication` (snake_case)
- `API-Gateway-Auth` (mixed case)

---

## pattern.yaml Structure

The `pattern.yaml` file must include the following fields:

### Required Fields

```yaml
# Basic Information
title: "Your Pattern Title"
description: "Brief one-line description of what this pattern accomplishes"

# Author Information
author:
  name: "Your Name"
  email: "your.email@example.com"
  github: "your-github-username"    # Optional
  organization: "Your Organization"  # Optional

# Pattern Classification
category: "automation"  # Must be one of: automation, observability, security, monitoring, integration, data-protection

# Tags (kebab-case, lowercase only)
tags:
  - "tag-one"
  - "tag-two"

# Technologies Used
technologies:
  - name: "Technology Name"
    type: "Vendor/Type"

# Use Case
use_case: |
  Detailed description of the problem this pattern solves
  and when it should be used.
```

### Optional Fields

```yaml
# Architecture
architecture_diagram: "diagrams/architecture.png"

# Prerequisites
prerequisites:
  - "Prerequisite 1 (e.g., AWS Account)"
  - "Prerequisite 2 (e.g., Node.js 18+)"

# Implementation Details
implementation:
  repo_url: "https://github.com/your-org/your-repo"
  language: "javascript"  # Options: javascript, python, java, go, typescript, csharp, ruby, php, rust, other
  framework: "terraform"  # Options: sam, cdk, terraform, cloudformation, pulumi, ansible, kubernetes, docker, other, none
  code_snippets:
    - file: "implementation/handler.js"
      title: "Lambda Handler Function"
      description: "Main Lambda function that processes events"
      language: "javascript"

# Security Considerations
security:
  - "Security consideration 1"
  - "Security consideration 2"

# Limitations
limitations:
  - "Known limitation 1"
  - "Known limitation 2"

# Related Patterns and Plays
related_patterns:
  - "pattern-id-1"
  - "pattern-id-2"

related_plays:
  - "play-id-1"
  - "play-id-2"

# Metadata
created_date: "2024-01-15"    # YYYY-MM-DD format
last_updated: "2024-01-15"    # YYYY-MM-DD format
version: "1.0.0"              # Semantic versioning
status: "active"              # Options: active, deprecated, experimental
```

---

## README.md Structure

Your pattern's `README.md` should include comprehensive documentation. Use this template:

### Recommended Sections

1. **Overview**
   - Problem statement
   - Benefits and value proposition
   - When to use this pattern

2. **Architecture**
   - Component descriptions
   - Data flow explanation
   - Architecture diagram

3. **Prerequisites**
   - Required accounts/services
   - Tools and dependencies
   - Permissions needed

4. **Implementation**
   - Step-by-step instructions
   - Code examples with explanations
   - Configuration details

5. **Testing**
   - Manual testing steps
   - Automated testing approach
   - Validation criteria

6. **Deployment**
   - Local development setup
   - Production deployment steps
   - Environment configuration

7. **Monitoring & Observability**
   - Key metrics to track
   - Logging strategy
   - Alerting recommendations
   - Dashboard examples

8. **Security Considerations**
   - Authentication & authorization
   - Data encryption
   - Network security
   - Secrets management
   - Compliance considerations

9. **Performance Characteristics**
   - Expected latency
   - Throughput capacity
   - Scalability considerations
   - Potential bottlenecks

10. **Troubleshooting**
    - Common issues with solutions
    - Debug procedures
    - Error messages and meanings

11. **Cleanup**
    - Resource removal instructions
    - Deprovisioning steps

12. **Limitations & Alternatives**
    - Known constraints
    - Trade-offs
    - Alternative approaches

13. **Related Patterns & Resources**
    - Links to related patterns
    - External documentation
    - References

14. **Changelog**
    - Version history
    - Changes and updates

---

## Submission Process

### 1. Create a New Branch

```bash
# Sync with upstream
git fetch upstream
git checkout main
git merge upstream/main

# Create feature branch
git checkout -b pattern/my-pattern-name
```

### 2. Create Your Pattern

```bash
# Copy the template
cp -r pattern-template/ my-pattern-name/

# Edit the files
cd my-pattern-name/
# Update pattern.yaml with your pattern details
# Write comprehensive documentation in README.md
# Add architecture diagrams to diagrams/
# Add code examples to implementation/
```

### 3. Validate Locally (Recommended)

Before submitting, validate your pattern locally:

```bash
# Install validation dependencies
cd .github/scripts
npm install

# Validate your pattern
node validate-pattern.js ../../my-pattern-name

# You should see:
# ✅ All validations passed! Pattern is ready for review.
```

### 4. Commit Your Changes

```bash
git add my-pattern-name/
git commit -m "Add pattern: my-pattern-name

Brief description of what this pattern does and the problem it solves."
```

### 5. Push and Create Pull Request

```bash
git push origin pattern/my-pattern-name
```

Then create a pull request on GitHub:
1. Go to your fork on GitHub
2. Click "Compare & pull request"
3. Fill in the PR template
4. Submit the pull request

---

## Local Validation

### Installing Validation Tools

```bash
cd .github/scripts
npm install
```

### Running Validation

```bash
# From .github/scripts directory
node validate-pattern.js ../../your-pattern-directory
```

### Validation Checks

The validator will check:

1. ✅ **Pattern ID Naming Convention** - Directory name is kebab-case
2. ✅ **Required Files** - pattern.yaml, README.md, diagrams/ exist
3. ✅ **JSON Schema Validation** - All required fields, correct formats, valid enums
4. ✅ **Referenced Files** - Architecture diagrams and code snippets exist

### Common Validation Errors

**Error: Pattern ID does not follow kebab-case**
- Solution: Rename directory to use lowercase letters and hyphens only

**Error: pattern.yaml does not conform to JSON Schema**
- Solution: Check the error message for the specific field and fix the format

**Error: Category must be one of the allowed values**
- Solution: Use one of: `automation`, `observability`, `security`, `monitoring`, `integration`, `data-protection`

**Error: Architecture diagram not found**
- Solution: Ensure the file path in `pattern.yaml` matches the actual file location

**Error: README.md seems too short**
- Solution: Add more comprehensive documentation using the recommended sections

---

## Review Process

### Automated Checks

When you submit a PR, automated workflows will:

1. **Validate Pattern Structure** - Check naming, files, and schema compliance
2. **Assign SME Reviewers** - Based on the pattern category
3. **Run Additional Checks** - Verify all referenced files exist

### Manual Review

Subject Matter Expert (SME) reviewers will check:

- ✅ Technical accuracy and completeness
- ✅ Code quality and best practices
- ✅ Security considerations
- ✅ Documentation clarity
- ✅ Architecture diagram quality
- ✅ Alignment with organizational standards

### Review Checklist

Your pattern should meet these criteria:

- [ ] Pattern follows repository structure and naming conventions
- [ ] `pattern.yaml` contains all required fields with valid data
- [ ] `README.md` provides clear, comprehensive implementation guidance
- [ ] Architecture diagram is included, clear, and accurate
- [ ] Code examples are correct and follow best practices
- [ ] Security considerations are properly documented
- [ ] Pattern is categorized correctly
- [ ] All referenced files exist
- [ ] No sensitive information (credentials, secrets) included

### Addressing Feedback

1. Reviewers will leave comments on your PR
2. Make requested changes in your branch
3. Push updates to the same branch
4. Reply to comments when addressed
5. Request re-review when ready

---

## Style Guidelines

### YAML Formatting

- Use 2 spaces for indentation (no tabs)
- Keep lines under 120 characters where possible
- Use double quotes for strings
- Use `|` for multi-line strings

Example:
```yaml
description: "Brief single-line description"

use_case: |
  This is a multi-line description
  that explains the use case in detail.
```

### Tags

- Use kebab-case (lowercase with hyphens)
- Be specific and descriptive
- Include technology names
- Include pattern types
- Maximum 20 tags

Example:
```yaml
tags:
  - "api-gateway"
  - "authentication"
  - "jwt"
  - "serverless"
  - "aws-lambda"
```

### Code Examples

- Include clear comments
- Follow language-specific style guides
- Remove sensitive information
- Keep examples focused and concise
- Show actual working code

### Architecture Diagrams

- Use PNG or SVG format
- Include a clear title
- Label all components
- Show data flow with arrows
- Keep diagrams readable and uncluttered
- Recommended tools: draw.io, Lucidchart, Mermaid

---

## Categories

Choose the category that best fits your pattern:

| Category | ID | Description | Use For |
|----------|----|----|---------|
| **Automation** | `automation` | Automated workflows and processes | CI/CD, infrastructure automation, deployment patterns |
| **Observability** | `observability` | Monitoring, logging, tracing | Metrics collection, distributed tracing, log aggregation |
| **Security** | `security` | Security controls and compliance | Authentication, authorization, encryption, compliance |
| **Monitoring** | `monitoring` | System and application monitoring | Health checks, alerting, performance monitoring |
| **Integration** | `integration` | System integration and APIs | API gateways, event-driven architecture, data sync |
| **Data Protection** | `data-protection` | Data backup and recovery | Backup strategies, disaster recovery, data archival |

If you're unsure which category fits best, reviewers can help you choose during the review process.

---

## Getting Help

### Questions or Issues?

- **Documentation Issues**: Open an issue with the `documentation` label
- **Technical Questions**: Open an issue with the `question` label
- **Validation Problems**: Check `.github/workflows/README.md` for troubleshooting

### Resources

- **Pattern Template**: See `pattern-template/` directory
- **Workflow Documentation**: See `.github/workflows/README.md`
- **JSON Schema**: See `schemas/pattern-schema.json`
- **Categories Config**: See `categories.config.json`

### Need Clarification?

Don't hesitate to:
1. Open a GitHub issue for general questions
2. Comment on your PR for pattern-specific questions
3. Tag reviewers for clarification on feedback

---

## Code of Conduct

Please note that this project is released with a Contributor Code of Conduct. By participating in this project you agree to abide by its terms:

- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

---

## License

By contributing to this repository, you agree that your contributions will be licensed under the same license as the repository.

---

## Thank You! 🎉

Your contributions help build a valuable knowledge base for the entire organization. Thank you for taking the time to share your patterns!
