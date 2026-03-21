<#
.SYNOPSIS
Builds and deploys the CTSE microservices project to Azure Container Apps natively using Docker Hub, preventing Azure CLI hangs caused by GitHub Actions authentication.
#>

$ErrorActionPreference = "Stop"

$ResourceGroup = "ctse-project-rg"
$Environment = "ctse-env"

Write-Host "`n[1/5] Checking Docker login..." -ForegroundColor Cyan
$DockerInfo = docker info
$UsernameLine = $DockerInfo | Select-String "Username:"
if ($null -ne $UsernameLine) {
    $DockerUsername = $UsernameLine.ToString().Split(':')[1].Trim()
    Write-Host "Detected Docker Username: $DockerUsername" -ForegroundColor Green
} else {
    Write-Host "You do not appear to be logged into Docker Hub locally." -ForegroundColor Yellow
    docker login
    $DockerUsername = Read-Host -Prompt "Enter your Docker Hub username"
}

# Define microservices and ports
$services = @(
    @{ name = "frontend"; path = "frontend"; port = 3000 },
    @{ name = "student-service"; path = "services\student-service"; port = 5001 },
    @{ name = "teacher-service"; path = "services\teacher-service"; port = 5002 },
    @{ name = "course-service"; path = "services\course-service"; port = 5003 },
    @{ name = "result-service"; path = "services\result-service"; port = 5004 }
)

foreach ($service in $services) {
    $imgName = "$DockerUsername/$($service.name):latest"
    Write-Host "`n=======================================================" -ForegroundColor Magenta
    Write-Host " Deploying $($service.name)..." -ForegroundColor Magenta
    Write-Host "=======================================================" -ForegroundColor Magenta
    
    Write-Host "-> Building Docker image: $imgName" -ForegroundColor Cyan
    Push-Location $service.path
    docker build -t $imgName .
    Pop-Location
    
    Write-Host "`n-> Pushing Docker image to Docker Hub (Public)..." -ForegroundColor Cyan
    docker push $imgName
    
    Write-Host "`n-> Deploying to Azure Container Apps..." -ForegroundColor Cyan
    $url = az containerapp create `
        --name $service.name `
        --resource-group $ResourceGroup `
        --environment $Environment `
        --image $imgName `
        --target-port $service.port `
        --ingress external `
        --query properties.configuration.ingress.fqdn `
        --output tsv
        
    Write-Host "Successfully deployed $($service.name)! URL: https://$url" -ForegroundColor Green
}

Write-Host "`n=======================================================" -ForegroundColor Green
Write-Host " All services deployed successfully to Azure! " -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Green
