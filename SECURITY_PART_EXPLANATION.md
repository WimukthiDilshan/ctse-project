# Security Part Explanation (LO2, LO4)

This document explains the security improvements implemented in this project for the assignment security section.

## 1. Objective

The security objective was to integrate basic security controls across the microservices system, including:

- secure credential handling
- stronger authentication
- API hardening
- managed security scanning in CI/CD
- least-privilege and IAM/security group guidance for deployment

## 2. Implemented Security Controls

### 2.1 Secret Hygiene

What was done:

- Removed hardcoded MongoDB credentials from service environment files.
- Replaced direct credentials with placeholders to avoid committing live secrets.
- Added ignore rules to prevent accidental commits of secret files.

Files:

- `.gitignore`
- `services/student-service/.env`
- `services/teacher-service/.env`
- `services/course-service/.env`
- `services/result-service/.env`
- `services/course-service/test-mongo.js`

Why this matters:

- Prevents credential leakage in source control.
- Supports secure secret injection at deploy/runtime.

### 2.2 Authentication Hardening

What was done:

- Updated student authentication flow to hash passwords using `bcryptjs`.
- Login now validates password hash instead of plaintext comparison.
- Added JWT token issuance on successful login.

Files:

- `services/student-service/server.js`
- `services/student-service/package.json`

Why this matters:

- Protects stored credentials if database is exposed.
- Enables token-based session/auth handling.

### 2.3 API Hardening

What was done:

- Added `helmet` middleware to set secure HTTP headers.
- Added `express-rate-limit` middleware to reduce abuse/brute force traffic.

Files:

- `services/student-service/server.js`
- `services/teacher-service/server.js`
- `services/course-service/server.js`
- `services/result-service/server.js`
- service `package.json` files for dependency additions

Why this matters:

- Reduces common web attack surface.
- Adds a basic protective layer against flooding and brute-force attempts.

### 2.4 Managed Security Scanning (SAST/SCA in CI)

What was done:

- CI pipeline Snyk step was tightened to fail closed (security findings can fail the build).
- Existing SonarCloud integration remains available in workflows.

Files:

- `.github/workflows/ci-cd.yml`

Why this matters:

- Security vulnerabilities are detected during CI instead of after release.
- Enforces secure build quality gate behavior.

## 3. Least Privilege, IAM, and Security Group Coverage

### 3.1 Current project-level coverage

The repository now includes strong application-level security controls (secrets, auth, middleware, CI scanning).

### 3.2 Cloud-level controls expected for full LO2/LO4 evidence

For complete assignment evidence on IAM/security groups/least privilege in Azure, configure and present:

- RBAC with minimum required roles only (no broad Owner/Contributor where not needed).
- Separate identities for CI/CD and runtime workloads.
- Restrictive network access rules (allow only required inbound/outbound paths).
- Secret storage in a secure secret manager (for example: environment secrets or key vault style integration), not hardcoded in templates.

Suggested evidence to include in report:

- screenshots of role assignments and scoped permissions
- screenshots of network restrictions/security rules
- CI run showing successful security scan gates
- code references listed in this document

## 4. Quick Verification Checklist

- [x] No hardcoded DB credentials in service source/env templates
- [x] `.env` files ignored from git tracking
- [x] Password hashing enabled
- [x] JWT token generated at login
- [x] Helmet enabled in all services
- [x] Rate limiting enabled in all services
- [x] Snyk CI gate configured to fail closed
- [ ] Azure RBAC and network rule screenshots attached in assignment submission

## 5. Notes for Deployment

Because credentials were removed from tracked files, deployments must provide real values securely at runtime (environment variables/secrets). Do not reintroduce credentials into committed files.
