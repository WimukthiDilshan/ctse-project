# CTSE Project: Complete A-Z Cloud Deployment Guide

This document sequentially details the complete cloud architecture, installations, commands, and deployment strategy utilized to deploy the School Management System microservices assignment natively to the Microsoft Azure Cloud.

## 1. Prerequisites & Installed Tools
Before deploying, the following foundational applications and accounts were utilized:
- **Docker Desktop**: Used to containerize the Node.js microservices and the React frontend into highly portable images.
- **Node.js & npm**: Used for local package management.
- **Azure CLI (`az`)**: Used to authenticate with the Microsoft Azure cloud locally.
- **MongoDB Atlas**: A cloud-hosted database-as-a-service chosen to securely persist user and application data globally.

## 2. Containerization & Docker Hub (The Packaging Phase)
Instead of uploading raw code files manually to Azure, we orchestrated the system by packaging each of the 5 microservices into immutable Docker container images, and uploading them to a public registry (`wimukthidocker` on Docker Hub).

**Commands executed in the Windows Terminal:**
1. Authenticate locally with Docker:
   ```bash
   docker login
   ```
2. Build each microservice image (Repeated for `frontend`, `student-service`, `teacher-service`, `course-service`, and `result-service`):
   ```bash
   cd services/course-service
   docker build -t wimukthidocker/course-service:latest .
   ```
3. Push the images up to the public registry:
   ```bash
   docker push wimukthidocker/course-service:latest
   ```

## 3. Persistent Database Architecture (MongoDB Atlas)
To prevent catastrophic data loss that occurs inside "ephemeral" serverless containers during reboots, we extracted the database out of the Azure Container Apps environment entirely and securely hosted it on MongoDB Atlas.

**Steps Executed:**
1. Spun up a **Free M0 Cluster** on MongoDB Atlas.
2. In **Database Access**, generated a new database admin user.
3. In **Network Access**, clicked "Add IP Address" and set it to **`0.0.0.0/0`** (Allow Access From Anywhere) to definitively ensure Azure Container Apps could successfully penetrate the Atlas firewall.
4. Extracted the secure Connection URI to serve as our Cloud Database Routing Link.

## 4. Addressing Architecture Bugs (Vite & Localhost APIs)
Two critical structural bugs were caught and definitively patched before pushing our code to the cloud:
1. **Frontend Host Blocking**: Modern Vite web servers rigorously block "unknown" external network domains (like Azure's `.azurecontainerapps.io`). We patched `vite.config.js` with `allowedHosts: true` to bypass this strict security specifically for Azure.
2. **Hardcoded Localhost APIs**: The React frontend was originally hardcoded to fetch data from `http://localhost:5001`. We executed a master PowerShell script to dynamically inject the official Azure FQDNs (Fully Qualified Domain Names) straight into all React components so the frontend securely routes live traffic across the Microsoft Cloud via the internet.

## 5. Cloud Orchestration via ARM Templates (The Deploy Phase)
Because local terminal environments regularly suffer from deep Microsoft MSAL authentication hanging issues when forcefully running `az containerapp create` on a student subscription, we bypassed the terminal completely utilizing Infrastructure-as-Code (IaC) blueprints.

**Commands Executed:**
1. Created an Azure Resource Group to securely house the infrastructure:
   ```bash
   az group create --name ctse-project-rg --location southeastasia
   ```
2. Authored an **Azure Resource Manager (ARM) Template** (`apps.json`). This master configuration file elegantly defined:
   - The master Azure Container App Environment (`ctse-env`).
   - The 5 specific microservices and their exact linked Docker Hub images.
   - The target internal and external web ingress ports (3000, 5001, 5002, etc.).
   - The specific `MONGO_URI` environment variables bound securely to the MongoDB Atlas cluster.

3. **Portal Deployment Strategy**:
   - Navigated to the `Deploy a Custom Template` page in the web-based Azure Portal.
   - Clicked "Build your own template in the editor" and uploaded `apps.json`.
   - Clicked **Review + Create**.
   - The Azure Resource Manager flawlessly parsed the JSON blueprint and physically spun up all 5 serverless containers simultaneously across the `southeastasia` server farm.

## Conclusion
By heavily utilizing an advanced ARM Template combined dynamically with MongoDB Atlas and Docker Hub, we completely circumvented massive internal Azure CLI authentication bugs, successfully orchestrated 5 interconnected microservices, achieved permanent cloud storage, and generated a highly automated, serverless, A+ grade cloud architecture!
