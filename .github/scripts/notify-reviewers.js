#!/usr/bin/env node

/**
 * SME Reviewer Notification Script
 * Identifies and notifies subject matter experts based on pattern category
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// SME mapping by category
// TODO: Update with actual GitHub usernames of SMEs
const SME_MAPPING = {
  automation: {
    reviewers: ['automation-sme1', 'automation-sme2'],
    team: 'automation-team',
    description: 'Automation & Workflows'
  },
  observability: {
    reviewers: ['observability-sme1', 'observability-sme2'],
    team: 'observability-team',
    description: 'Observability & Monitoring'
  },
  security: {
    reviewers: ['security-sme1', 'security-sme2'],
    team: 'security-team',
    description: 'Security & Compliance'
  },
  monitoring: {
    reviewers: ['monitoring-sme1', 'monitoring-sme2'],
    team: 'monitoring-team',
    description: 'System Monitoring'
  },
  integration: {
    reviewers: ['integration-sme1', 'integration-sme2'],
    team: 'integration-team',
    description: 'System Integration'
  },
  'data-protection': {
    reviewers: ['data-protection-sme1', 'data-protection-sme2'],
    team: 'data-protection-team',
    description: 'Data Protection & Recovery'
  }
};

// Fallback reviewers if category not found or for general review
const FALLBACK_REVIEWERS = ['pattern-maintainer1', 'pattern-maintainer2'];

class ReviewerNotifier {
  constructor() {
    this.allReviewers = new Set();
    this.categoryReviewers = new Map();
    this.patterns = [];
  }

  log(message, emoji = 'ℹ️') {
    console.log(`${emoji} ${message}`);
  }

  error(message) {
    console.error(`❌ ERROR: ${message}`);
  }

  /**
   * Get category from pattern.yaml
   */
  getPatternCategory(patternDir) {
    const patternYamlPath = path.join(patternDir, 'pattern.yaml');

    if (!fs.existsSync(patternYamlPath)) {
      this.error(`pattern.yaml not found in ${patternDir}`);
      return null;
    }

    try {
      const yamlContent = fs.readFileSync(patternYamlPath, 'utf8');
      const patternData = yaml.load(yamlContent);
      return patternData.category || null;
    } catch (error) {
      this.error(`Failed to parse pattern.yaml in ${patternDir}: ${error.message}`);
      return null;
    }
  }

  /**
   * Get reviewers for a specific category
   */
  getReviewersForCategory(category) {
    if (!category) {
      return FALLBACK_REVIEWERS;
    }

    const sme = SME_MAPPING[category];
    if (!sme) {
      this.log(`No SME mapping found for category: ${category}`, '⚠️');
      return FALLBACK_REVIEWERS;
    }

    return sme.reviewers || FALLBACK_REVIEWERS;
  }

  /**
   * Process all changed patterns
   */
  processPatterns(patternDirs) {
    if (!patternDirs || patternDirs.length === 0) {
      this.log('No patterns to process', '⚠️');
      return;
    }

    this.log(`Processing ${patternDirs.length} pattern(s)...`, '🔍');

    for (const patternDir of patternDirs) {
      const category = this.getPatternCategory(patternDir);
      const reviewers = this.getReviewersForCategory(category);

      this.patterns.push({
        directory: patternDir,
        category: category || 'unknown',
        reviewers: reviewers
      });

      // Track reviewers by category
      if (category) {
        if (!this.categoryReviewers.has(category)) {
          this.categoryReviewers.set(category, new Set());
        }
        reviewers.forEach(reviewer => {
          this.categoryReviewers.get(category).add(reviewer);
          this.allReviewers.add(reviewer);
        });
      }

      this.log(
        `  Pattern: ${patternDir} | Category: ${category || 'unknown'} | Reviewers: ${reviewers.join(', ')}`,
        '📋'
      );
    }
  }

  /**
   * Generate PR comment body
   */
  generateComment() {
    if (this.patterns.length === 0) {
      return null;
    }

    let comment = '## 👥 Pattern Review Assignments\n\n';
    comment += 'The following Subject Matter Experts (SMEs) have been identified for review:\n\n';

    // Group patterns by category
    const patternsByCategory = new Map();
    for (const pattern of this.patterns) {
      if (!patternsByCategory.has(pattern.category)) {
        patternsByCategory.set(pattern.category, []);
      }
      patternsByCategory.get(pattern.category).push(pattern);
    }

    // Generate category sections
    for (const [category, patterns] of patternsByCategory) {
      const sme = SME_MAPPING[category];
      const categoryName = sme ? sme.description : category;
      const icon = this.getCategoryIcon(category);

      comment += `### ${icon} ${categoryName}\n\n`;

      if (sme) {
        const reviewerMentions = sme.reviewers.map(r => `@${r}`).join(', ');
        comment += `**Reviewers:** ${reviewerMentions}\n\n`;
      }

      comment += '**Patterns:**\n';
      for (const pattern of patterns) {
        comment += `- \`${pattern.directory}\`\n`;
      }
      comment += '\n';
    }

    // Add instructions
    comment += '---\n\n';
    comment += '### 📝 Review Checklist\n\n';
    comment += 'Please ensure the following before approving:\n\n';
    comment += '- [ ] Pattern follows repository structure and naming conventions\n';
    comment += '- [ ] `pattern.yaml` contains all required fields and valid data\n';
    comment += '- [ ] `README.md` provides clear implementation guidance\n';
    comment += '- [ ] Architecture diagram is included and clear\n';
    comment += '- [ ] Code examples are correct and follow best practices\n';
    comment += '- [ ] Security considerations are documented\n';
    comment += '- [ ] Pattern is categorized correctly\n\n';

    comment += '**Note:** Automated validation has already checked basic requirements. ';
    comment += 'Please focus on technical accuracy, completeness, and alignment with organizational standards.\n';

    return comment;
  }

  /**
   * Get icon for category
   */
  getCategoryIcon(category) {
    const icons = {
      automation: '🤖',
      observability: '👁️',
      security: '🔒',
      monitoring: '📊',
      integration: '🔗',
      'data-protection': '💾'
    };
    return icons[category] || '📦';
  }

  /**
   * Generate GitHub Actions output
   */
  generateOutput() {
    const reviewersList = Array.from(this.allReviewers);
    const reviewersJson = JSON.stringify(reviewersList);

    // Output for GitHub Actions
    if (process.env.GITHUB_OUTPUT) {
      fs.appendFileSync(process.env.GITHUB_OUTPUT, `reviewers=${reviewersJson}\n`);
      fs.appendFileSync(process.env.GITHUB_OUTPUT, `reviewer_count=${reviewersList.length}\n`);

      const comment = this.generateComment();
      if (comment) {
        // Escape newlines and special characters for GitHub Actions output
        const escapedComment = comment.replace(/%/g, '%25').replace(/\n/g, '%0A').replace(/\r/g, '%0D');
        fs.appendFileSync(process.env.GITHUB_OUTPUT, `pr_comment<<EOF\n${comment}\nEOF\n`);
      }
    }

    return {
      reviewers: reviewersList,
      patterns: this.patterns,
      comment: this.generateComment()
    };
  }

  /**
   * Main execution
   */
  async run(patternDirs) {
    this.log('========================================', '🔔');
    this.log('SME Reviewer Notification', '🔔');
    this.log('========================================', '🔔');
    console.log();

    this.processPatterns(patternDirs);
    console.log();

    const output = this.generateOutput();

    this.log('========================================', '✅');
    this.log(`Identified ${output.reviewers.length} reviewer(s)`, '✅');
    this.log(`Reviewers: ${output.reviewers.join(', ')}`, '✅');
    this.log('========================================', '✅');

    return output;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: node notify-reviewers.js <pattern-dir1> [pattern-dir2] ...');
    console.error('   or: node notify-reviewers.js (reads from CHANGED_PATTERNS env var)');
    process.exit(1);
  }

  let patternDirs = args;

  // If first arg is a space-separated list, split it
  if (args.length === 1 && args[0].includes(' ')) {
    patternDirs = args[0].trim().split(/\s+/);
  }

  const notifier = new ReviewerNotifier();
  await notifier.run(patternDirs);
}

if (require.main === module) {
  main().catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
}

module.exports = { ReviewerNotifier, SME_MAPPING };
