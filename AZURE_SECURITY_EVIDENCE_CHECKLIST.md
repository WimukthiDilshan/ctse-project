# Azure Security Evidence Checklist (For Assignment Submission)

This file closes the remaining assignment gaps for IAM, least privilege, and network security evidence.

## 1. IAM / Least Privilege Evidence

Capture screenshots for all items below and include them in the final report.

- [ ] Azure AD App Registration or Service Principal used by CI/CD
- [ ] Role assignments scoped to Resource Group (not subscription-wide)
- [ ] No `Owner` role assigned to runtime app identities
- [ ] CI/CD identity has only deployment permissions required for Container Apps
- [ ] Runtime app identity has only required data access permissions

Recommended minimum deployment role scope:
- Scope: Resource Group containing Container Apps
- Role: `Contributor` (or a tighter custom role if created)

## 2. Network Security Evidence

Capture screenshots for all items below and include them in the final report.

- [ ] Container Apps ingress settings reviewed (only required services external)
- [ ] Database network policy reviewed (Atlas allowlist documented)
- [ ] No unnecessary public endpoints exposed
- [ ] Service-to-service calls use internal DNS names where possible

## 3. Secret Management Evidence

- [x] `apps.json` uses `securestring` parameters
- [x] `apps.json` maps secrets via `secretRef`
- [ ] GitHub repository secrets created for deployment workflow:
  - `STUDENT_MONGO_URI`
  - `TEACHER_MONGO_URI`
  - `COURSE_MONGO_URI`
  - `RESULT_MONGO_URI`
  - `STUDENT_JWT_SECRET`
  - `RESOURCE_GROUP`
  - `AZURE_CREDENTIALS`

## 4. DevSecOps Evidence

- [x] Snyk scan in CI: `.github/workflows/ci-cd.yml`
- [x] SonarCloud scan in deploy workflows
- [ ] Attach one successful pipeline run screenshot per tool (Snyk + Sonar)

## 5. Commands You Can Run for Evidence

```bash
# List role assignments for your CI/CD principal at RG scope
az role assignment list --resource-group <RESOURCE_GROUP_NAME> --output table

# Confirm container apps and ingress status
az containerapp list --resource-group <RESOURCE_GROUP_NAME> --output table

# Show one app in detail (including ingress)
az containerapp show --name student-service --resource-group <RESOURCE_GROUP_NAME>
```

## 6. Submission Reminder

For grading, screenshots are mandatory evidence. Code and workflow files are not enough on their own for IAM/security-group criteria.
