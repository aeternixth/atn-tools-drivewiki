---
name: security-audit
description: "Security vulnerability scanner for web apps, APIs, and cloud infrastructure"
profile: standard
triggers:
  en: ["security audit", "security scan", "vulnerability check", "OWASP"]
  th: ["ตรวจความปลอดภัย", "security audit", "หาช่องโหว่"]
---

## Quick Reference
Comprehensive security vulnerability scanning and reporting.
- **OWASP Top 10**: Check all categories against codebase
- **Dependencies**: Scan for known CVEs in packages
- **Secrets**: Detect hardcoded credentials, API keys, tokens
- **Report**: Severity-rated findings with remediation steps
- **Output**: `_aegis-output/security-audit/`
- **Agent**: Loki (opus) — primary scanner; Black Panther (sonnet) — report

## Full Instructions

### Invocation

```
/security-audit [full|owasp|deps|secrets|infra] [target]
```
- `full` — Complete security audit (default)
- `owasp` — OWASP Top 10 check only
- `deps` — Dependency vulnerability scan only
- `secrets` — Secret detection only
- `infra` — Infrastructure/config security only

### OWASP Top 10 (2021) Checks

#### A01: Broken Access Control
- [ ] Missing authentication on protected endpoints
- [ ] Missing authorization checks (RBAC/ABAC)
- [ ] Insecure direct object references (IDOR)
- [ ] CORS misconfiguration
- [ ] Path traversal vulnerabilities
- [ ] Missing rate limiting

#### A02: Cryptographic Failures
- [ ] Sensitive data transmitted without TLS
- [ ] Weak encryption algorithms (MD5, SHA1 for passwords)
- [ ] Hardcoded encryption keys
- [ ] Missing data-at-rest encryption
- [ ] Insecure random number generation

#### A03: Injection
- [ ] SQL injection (raw queries, string concatenation)
- [ ] NoSQL injection
- [ ] Command injection (exec, spawn with user input)
- [ ] XSS (reflected, stored, DOM-based)
- [ ] Template injection
- [ ] LDAP injection

#### A04: Insecure Design
- [ ] Missing input validation
- [ ] Business logic flaws
- [ ] Missing abuse case handling
- [ ] Insufficient security requirements in design

#### A05: Security Misconfiguration
- [ ] Default credentials
- [ ] Unnecessary features enabled
- [ ] Missing security headers
- [ ] Verbose error messages exposing internals
- [ ] Outdated software/frameworks

#### A06: Vulnerable Components
- [ ] Known CVEs in dependencies
- [ ] Outdated packages with security patches
- [ ] Unmaintained dependencies
- [ ] Dependencies with excessive permissions

#### A07: Authentication Failures
- [ ] Weak password policies
- [ ] Missing brute-force protection
- [ ] Insecure session management
- [ ] Missing MFA for sensitive operations
- [ ] Credential stuffing vulnerability

#### A08: Data Integrity Failures
- [ ] Missing integrity checks on updates
- [ ] Insecure deserialization
- [ ] Missing CI/CD pipeline security
- [ ] Unsigned code/packages

#### A09: Logging & Monitoring Failures
- [ ] Missing security event logging
- [ ] Sensitive data in logs
- [ ] No alerting on suspicious activity
- [ ] Insufficient audit trail

#### A10: Server-Side Request Forgery (SSRF)
- [ ] Unvalidated URL fetching
- [ ] Internal network access from user input
- [ ] Missing URL allowlisting

### Dependency Vulnerability Scan

1. Identify package manager (npm, pip, cargo, etc.)
2. Check lock file for exact versions
3. Cross-reference with:
   - npm: `npm audit`
   - Python: `pip-audit` or `safety check`
   - Go: `govulncheck`
   - General: OSV database, Snyk DB
4. Classify findings by severity (Critical/High/Medium/Low)
5. Provide upgrade paths for each vulnerability

### Secret Detection

Scan for patterns:
```
Patterns:
- API keys: /[A-Za-z0-9_-]{20,}/  near "key", "api_key", "apikey"
- AWS keys: /AKIA[0-9A-Z]{16}/
- Private keys: /-----BEGIN (RSA |EC )?PRIVATE KEY-----/
- Tokens: /Bearer [A-Za-z0-9\-._~+/]+=*/
- Connection strings: /mongodb(\+srv)?:\/\/[^:]+:[^@]+@/
- Passwords in config: /password\s*[:=]\s*["'][^"']+["']/
- .env files committed to repo
```

### Infrastructure Security

- [ ] Dockerfile: running as non-root, minimal base image
- [ ] docker-compose: no exposed debug ports, secrets management
- [ ] Kubernetes: RBAC, network policies, resource limits
- [ ] Cloud IAM: least privilege, no wildcard permissions
- [ ] HTTPS: valid certificates, HSTS enabled

### Report Format

```markdown
# Security Audit Report
**Date**: YYYY-MM-DD
**Auditor**: Loki (AEGIS)
**Target**: <scope>
**Risk Level**: CRITICAL | HIGH | MEDIUM | LOW

## Executive Summary
<2-3 sentences: overall security posture and key findings>

## Findings Summary
| Severity | Count |
|----------|-------|
| 🔴 Critical | <n> |
| 🟠 High | <n> |
| 🟡 Medium | <n> |
| 🔵 Low | <n> |
| ℹ️ Info | <n> |

## Detailed Findings

### 🔴 [SEC-001] <title>
- **Category**: <OWASP category>
- **Location**: `<file>:<line>`
- **Description**: <what the vulnerability is>
- **Impact**: <what an attacker could do>
- **Reproduction**: <steps to exploit>
- **Remediation**: <how to fix>
- **Priority**: Immediate

...

## Remediation Roadmap
| Priority | Finding | Effort | Deadline |
|----------|---------|--------|----------|
| Immediate | SEC-001 | <hours> | <date> |
| Short-term | SEC-003 | <hours> | <date> |
| Medium-term | SEC-005 | <days> | <date> |
```

### Output

```
_aegis-output/security-audit/
  security-report.md
  dependency-audit.md
  secrets-scan.md
```

### Gate Integration

Security audit integrates with review gates:
- 0 Critical + 0 High = PASS
- 1+ Critical = FAIL (blocks merge/deploy)
- High only = CONDITIONAL (human review required)
