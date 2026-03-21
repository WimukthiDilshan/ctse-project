$ErrorActionPreference = "Stop"

Write-Host "Creating Azure AD Application..."
$appJsonRaw = az rest --method POST --uri "https://graph.microsoft.com/v1.0/applications" --body '{"displayName":"ctse-github-actions"}'
$appJson = $appJsonRaw | ConvertFrom-Json
$appId = $appJson.appId
$appObjectId = $appJson.id

Write-Host "Created App with AppId: $appId"

Write-Host "Creating Service Principal..."
$spJsonRaw = az rest --method POST --uri "https://graph.microsoft.com/v1.0/servicePrincipals" --body "{`"appId`":`"$appId`"}"
$spJson = $spJsonRaw | ConvertFrom-Json
$spObjectId = $spJson.id

Write-Host "Created SP with ObjectId: $spObjectId"

Write-Host "Generating Client Secret..."
$secretJsonRaw = az rest --method POST --uri "https://graph.microsoft.com/v1.0/applications/$appObjectId/addPassword" --body '{"passwordCredential":{"displayName":"github-actions"}}'
$secretJson = $secretJsonRaw | ConvertFrom-Json
$clientSecret = $secretJson.secretText

Write-Host "Getting Tenant ID..."
$accountRaw = az account show
$account = $accountRaw | ConvertFrom-Json
$tenantId = $account.tenantId

Write-Host "Waiting 15 seconds for propagation to allow role assignment..."
Start-Sleep -Seconds 15

Write-Host "Assigning Contributor Role..."
az role assignment create --assignee $spObjectId --role Contributor --scope "/subscriptions/d797d60a-aba0-4f5f-ae72-ff8e8972e350/resourceGroups/ctse-project-rg"

Write-Host "`n--- GITHUB ACTION CREDENTIALS JSON ---"

$creds = @"
{
  "clientId": "$appId",
  "clientSecret": "$clientSecret",
  "subscriptionId": "d797d60a-aba0-4f5f-ae72-ff8e8972e350",
  "tenantId": "$tenantId"
}
"@

$creds | Out-File -FilePath "github_creds.json" -Encoding utf8
Write-Host "Done! Saved to github_creds.json"
