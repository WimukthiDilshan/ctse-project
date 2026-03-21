# Project Overview: School Management System (Microservices)

## 1. Overall Idea
This project is a cloud-ready School Management System built using a microservice architecture. Instead of one large backend, the system is split into focused services that work together.

Main goal:
- Build a secure, containerized, and independently deployable 4-service system.
- Show real service-to-service communication.
- Apply DevOps and basic DevSecOps practices.

## 2. High-Level Architecture
The solution includes:
- Frontend web dashboard (React)
- 4 backend microservices (Node.js + Express)
- Dedicated MongoDB database per service (logical separation)
- Containerized deployment model
- Cloud deployment support using Azure Container Apps

Core backend services:
1. Student Service
2. Teacher Service
3. Course Service
4. Result Service

## 3. What Each Service Does

### Student Service
Responsibility:
- User authentication entry point (register/login)
- Student profile and dashboard
- Student rank updates (triggered by Result Service)

Key behaviors:
- Hashes passwords
- Issues JWT on login
- Calls Result Service to fetch student result data

### Teacher Service
Responsibility:
- Teacher records and class/subject-level views
- Mentor-mentee management

Key behaviors:
- Calls Student Service to validate mentee students
- Calls Result Service to fetch subject statistics

### Course Service
Responsibility:
- Course catalog and course details
- Course information enrichment with teacher details

Key behaviors:
- Calls Teacher Service to fetch teacher profile data for courses

### Result Service
Responsibility:
- Result submission and result retrieval
- Subject-level analytics
- Sync actions to Student Service after grade updates

Key behaviors:
- Calls Student Service to update rank after result creation

## 4. Integration Flow (Service-to-Service)
The project demonstrates real communication paths:
- Student Service -> Result Service: student dashboard results
- Teacher Service -> Student Service: mentee validation
- Teacher Service -> Result Service: class/subject stats
- Course Service -> Teacher Service: teacher details for course view
- Result Service -> Student Service: rank synchronization

This ensures each microservice integrates with at least one other service.

## 5. Security and DevSecOps Highlights
Implemented controls include:
- Secrets removed from hardcoded source values
- Secure parameter + secret reference pattern for cloud template usage
- Password hashing and JWT-based login flow
- API hardening with security headers and rate limiting
- SAST/SCA integrations in CI/CD workflows (SonarCloud and Snyk)

## 6. DevOps and Deployment Approach
- Source code maintained in GitHub
- CI/CD workflows for build, scan, and deployment steps
- Services containerized via Docker
- Images pushed to container registry
- Cloud deployment using managed container platform (Azure Container Apps)
- ARM-template-based deployment path for consistent infrastructure + app rollout

## 7. Why This Architecture Was Used
Benefits of this approach:
- Better modularity (each service has a clear responsibility)
- Independent deployment and scaling
- Easier maintenance and team collaboration
- Fault isolation (issues in one service are less likely to break everything)
- Better alignment with cloud-native development and DevOps workflows

## 8. Current Project Outcome
This project demonstrates:
- A complete end-to-end microservice application
- Functional integration among 4 independent services
- Practical cloud deployment readiness
- Baseline security and DevSecOps adoption suitable for academic evaluation

## 9. Useful References in This Repository
- System architecture and API summary: README.md
- Azure deployment guide: Deployment_Guide_AZ.md
- Security write-up: SECURITY_PART_EXPLANATION.md
- Assignment evidence checklist: AZURE_SECURITY_EVIDENCE_CHECKLIST.md
