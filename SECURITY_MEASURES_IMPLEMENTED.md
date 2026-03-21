# Security Measures Implemented

This document explains the security controls implemented in the School Management System microservices project.

## 1. HTTP Security Hardening

All backend services apply `helmet()` middleware to set secure HTTP headers and reduce common web attack vectors (for example, clickjacking and MIME sniffing risks).

Implemented in:
- services/student-service/server.js
- services/teacher-service/server.js
- services/course-service/server.js
- services/result-service/server.js

## 2. Request Rate Limiting

All backend services apply `express-rate-limit` to throttle excessive traffic. This helps reduce brute-force and abuse attempts.

Current policy:
- Window: 15 minutes
- Max requests: 300 per client per window

Implemented in:
- services/student-service/server.js
- services/teacher-service/server.js
- services/course-service/server.js
- services/result-service/server.js

## 3. Password Protection

The Student Service hashes passwords using `bcryptjs` before storage. Passwords are never stored as plain text.

Implemented flow:
- Registration endpoint hashes password with bcrypt
- Login endpoint compares hash using bcrypt

Implemented in:
- services/student-service/server.js

## 4. Token-Based Authentication

The Student Service issues JWTs at login using `jsonwebtoken`.

Current token behavior:
- Signed with `JWT_SECRET`
- Contains user id and role claims
- Expires in 1 hour

Implemented in:
- services/student-service/server.js

## 5. Secret Handling in Cloud Deployment

The ARM template uses secure secret injection for sensitive runtime values.

Controls implemented:
- Sensitive parameters defined as `securestring` in `apps.json`
- Values mapped to Container Apps `configuration.secrets`
- Runtime environment variables use `secretRef` (instead of plaintext values)

Secrets currently handled this way:
- `studentMongoUri`
- `teacherMongoUri`
- `courseMongoUri`
- `resultMongoUri`
- `studentJwtSecret`

Implemented in:
- apps.json

## 6. CI/CD Secret Usage

Deployment workflow reads sensitive values from GitHub Actions Secrets and validates required secrets before ARM deployment.

Implemented in:
- .github/workflows/deploy-arm-template.yml

## 7. Service Isolation

The architecture uses separated microservices and separate databases per bounded domain (student, teacher, course, result). This limits blast radius and reduces cross-service data exposure.

## 8. Additional Good Practices Included

- Environment-based configuration via `process.env`
- No hardcoded production database credentials in service runtime configuration
- OpenAPI contracts documented for API visibility and safer integration

## 9. Recommended Next Hardening Steps

To strengthen production security further, the following are recommended:
- Enforce strong JWT secret rotation policy
- Add role-based authorization middleware for protected endpoints
- Add API input validation/sanitization on all write endpoints
- Restrict CORS to known frontend origins only
- Enable centralized audit logging and alerting
- Add TLS certificate validation checks and security response headers verification in CI

## 10. Evidence Mapping (for report submission)

To support assignment/report evidence, capture:
- Middleware usage in each `server.js` file (helmet + rate limiting)
- Password hash and JWT creation logic in Student Service
- `securestring` and `secretRef` sections in `apps.json`
- GitHub workflow secret usage and required-secret check in deploy workflow
