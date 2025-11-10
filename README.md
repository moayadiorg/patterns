# Patterns Repository

A curated collection of reusable patterns for infrastructure, automation, security, and operational excellence. This repository serves as a knowledge base for proven solutions to common technical challenges.

## 📚 What Are Patterns?

Patterns are documented, reusable solutions to recurring problems. Each pattern includes:

- **Architecture diagrams** showing component relationships
- **Implementation guides** with step-by-step instructions
- **Code examples** demonstrating the solution
- **Best practices** for security, performance, and scalability
- **Troubleshooting guides** for common issues

## 🗂️ Pattern Categories

| Category | Description | Examples |
|----------|-------------|----------|
| 🤖 **Automation** | Automated workflows and processes | CI/CD pipelines, infrastructure automation, deployment strategies |
| 👁️ **Observability** | Monitoring, logging, and tracing | Distributed tracing, metrics collection, log aggregation |
| 🔒 **Security** | Security controls and compliance | Authentication, authorization, encryption, compliance patterns |
| 📊 **Monitoring** | System and application monitoring | Health checks, alerting, performance monitoring |
| 🔗 **Integration** | System integration and APIs | API gateways, event-driven architecture, data synchronization |
| 💾 **Data Protection** | Data backup and recovery | Backup strategies, disaster recovery, data archival |

## 🚀 Getting Started

### Browse Patterns

```bash
# Clone the repository
git clone https://github.com/moayadiorg/patterns.git
cd patterns

# Browse patterns by category
ls -d */
```

### Use a Pattern

1. Navigate to the pattern directory
2. Read the `README.md` for implementation details
3. Review the `pattern.yaml` for metadata and prerequisites
4. Check the `diagrams/` directory for architecture visuals
5. Use code examples from `implementation/` directory

### Example

```bash
# Navigate to a specific pattern
cd my-automation-pattern/

# Read the documentation
cat README.md

# View pattern metadata
cat pattern.yaml

# Check architecture diagrams
ls diagrams/
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:

- Pattern structure and requirements
- Submission process
- Validation tools
- Review process
- Style guidelines

### Quick Start for Contributors

1. **Fork and clone** the repository
2. **Copy the template**: `cp -r pattern-template/ my-pattern-name/`
3. **Create your pattern** following the structure
4. **Validate locally**:
   ```bash
   cd .github/scripts
   npm install
   node validate-pattern.js ../../my-pattern-name
   ```
5. **Submit a pull request**

## 🔍 Pattern Structure

Each pattern follows this structure:

```
pattern-name/
├── pattern.yaml              # Pattern metadata
├── README.md                 # Comprehensive documentation
├── diagrams/                 # Architecture diagrams
│   └── architecture.png
└── implementation/           # Code examples (optional)
    └── example.js
```

## ✅ Quality Standards

All patterns are:

- **Validated** against JSON Schema for structure and completeness
- **Reviewed** by Subject Matter Experts (SMEs) for technical accuracy
- **Tested** to ensure code examples work as documented
- **Documented** with clear explanations and diagrams
- **Secure** following security best practices

### Automated Validation

Every pull request is automatically validated for:

- ✅ Proper naming conventions (kebab-case)
- ✅ Required files (pattern.yaml, README.md, diagrams/)
- ✅ JSON Schema compliance
- ✅ Valid category assignment
- ✅ Referenced files existence

## 📖 Documentation

- **[Contributing Guide](CONTRIBUTING.md)** - How to submit patterns
- **[Workflow Documentation](.github/workflows/README.md)** - GitHub Actions workflows
- **[Pattern Schema](schemas/pattern-schema.json)** - Validation rules
- **[Categories Config](categories.config.json)** - Category definitions

## 🛠️ Tools

### Local Validation

Validate your pattern before submitting:

```bash
cd .github/scripts
npm install
node validate-pattern.js ../../your-pattern-directory
```

### Pattern Template

Start with the pre-configured template:

```bash
cp -r pattern-template/ my-new-pattern/
cd my-new-pattern/
# Edit pattern.yaml and README.md
```

## 🏗️ Repository Structure

```
patterns/
├── .github/
│   ├── workflows/           # GitHub Actions workflows
│   │   ├── validate-pattern.yml
│   │   ├── notify-reviewers.yml
│   │   └── README.md
│   └── scripts/             # Validation scripts
│       ├── validate-pattern.js
│       ├── detect-changed-patterns.sh
│       └── notify-reviewers.js
├── schemas/
│   └── pattern-schema.json  # JSON Schema for validation
├── pattern-template/        # Template for new patterns
├── categories.config.json   # Category definitions
├── CONTRIBUTING.md          # Contribution guide
├── README.md               # This file
└── [pattern-directories]/   # Individual patterns
```

## 🔄 Workflow

### Submitting a Pattern

1. Fork repository
2. Create pattern from template
3. Validate locally
4. Submit pull request
5. Address review feedback
6. Pattern is merged

### Automated Review Process

When you submit a PR:

1. **Validation Workflow** runs automatically
   - Checks naming conventions
   - Validates required files
   - Verifies JSON Schema compliance
   - Confirms referenced files exist

2. **Reviewer Notification** happens automatically
   - SMEs are assigned based on category
   - Review checklist is posted
   - Labels are added

3. **Manual Review** by SMEs
   - Technical accuracy
   - Code quality
   - Security considerations
   - Documentation completeness

## 🎯 Pattern Template

New patterns should use the provided template:

```yaml
title: "Your Pattern Title"
description: "Brief one-line description"
author:
  name: "Your Name"
  email: "your.email@example.com"
category: "automation"  # Choose appropriate category
tags:
  - "tag-one"
  - "tag-two"
technologies:
  - name: "Technology Name"
    type: "Vendor/Type"
use_case: |
  Detailed description of the problem this pattern solves.
```

See [pattern-template/pattern.yaml](pattern-template/pattern.yaml) for the complete template.

## 🔐 Security

- **No Credentials**: Never commit secrets, credentials, or sensitive data
- **Security Review**: All patterns undergo security review
- **Best Practices**: Patterns must document security considerations
- **Compliance**: Patterns should align with organizational security policies

## 📊 Metrics and Monitoring

Each pattern should document:

- Expected performance characteristics
- Key metrics to monitor
- Alerting recommendations
- Dashboard examples
- Troubleshooting procedures

## 🐛 Troubleshooting

### Pattern Validation Fails

See [Workflow Documentation](.github/workflows/README.md#troubleshooting) for common issues:

- Pattern ID naming errors
- Missing required files
- Schema validation failures
- Category validation errors

### Need Help?

- **Questions**: Open an issue with the `question` label
- **Bug Reports**: Open an issue with the `bug` label
- **Documentation**: Open an issue with the `documentation` label

## 📝 License

[Specify your license here]

## 🙏 Acknowledgments

Thank you to all contributors who have shared their patterns and expertise to build this knowledge base!

## 📬 Contact

For questions or feedback:
- Open an issue on GitHub
- Contact the repository maintainers
- Check the [Contributing Guide](CONTRIBUTING.md)

---

**Ready to contribute?** Check out our [Contributing Guide](CONTRIBUTING.md) to get started! 🚀
