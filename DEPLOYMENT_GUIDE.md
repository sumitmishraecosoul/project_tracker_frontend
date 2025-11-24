# 🚀 Azure Deployment Guide - Project Tracker

This guide will help you set up CI/CD pipeline for deploying your Project Tracker application to Azure.

## 📋 Prerequisites

1. **Azure Account** with active subscription
2. **GitHub Repository** with your project
3. **Azure CLI** installed locally (optional, for testing)

## 🔧 Azure Setup

### 1. Create Azure Web App

```bash
# Login to Azure
az login

# Create Resource Group (if not exists)
az group create --name ProjectTrackerRG --location "East US"

# Create App Service Plan
az appservice plan create \
  --name ProjectTrackerPlan \
  --resource-group ProjectTrackerRG \
  --sku B1 \
  --is-linux

# Create Web App
az webapp create \
  --name your-project-tracker-app \
  --resource-group ProjectTrackerRG \
  --plan ProjectTrackerPlan \
  --runtime "NODE|18-lts"
```

### 2. Configure Web App Settings

```bash
# Set Node.js version
az webapp config appsettings set \
  --name your-project-tracker-app \
  --resource-group ProjectTrackerRG \
  --settings WEBSITE_NODE_DEFAULT_VERSION=18.17.0

# Set environment variables
az webapp config appsettings set \
  --name your-project-tracker-app \
  --resource-group ProjectTrackerRG \
  --settings NODE_ENV=production NEXT_PUBLIC_API_URL=https://project-tracker-backend-xi.vercel.app

# Enable build during deployment
az webapp config appsettings set \
  --name your-project-tracker-app \
  --resource-group ProjectTrackerRG \
  --settings SCM_DO_BUILD_DURING_DEPLOYMENT=true
```

## 🔐 GitHub Secrets Setup

### 1. Generate Azure Service Principal

```bash
# Create service principal
az ad sp create-for-rbac \
  --name "ProjectTrackerDeploy" \
  --role contributor \
  --scopes /subscriptions/{subscription-id}/resourceGroups/ProjectTrackerRG \
  --sdk-auth

# This will output JSON like:
{
  "clientId": "...",
  "clientSecret": "...",
  "subscriptionId": "...",
  "tenantId": "...",
  "activeDirectoryEndpointUrl": "https://login.microsoftonline.com",
  "resourceManagerEndpointUrl": "https://management.azure.com/",
  "activeDirectoryGraphResourceId": "https://graph.windows.net/",
  "sqlManagementEndpointUrl": "https://management.core.windows.net:8443/",
  "galleryEndpointUrl": "https://gallery.azure.com/",
  "managementEndpointUrl": "https://management.core.windows.net/"
}
```

### 2. Add GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:

| Secret Name | Value |
|-------------|-------|
| `AZURE_CREDENTIALS` | The entire JSON output from service principal creation |
| `AZURE_WEBAPP_NAME` | Your Azure Web App name (e.g., `your-project-tracker-app`) |
| `AZURE_SUBSCRIPTION_ID` | Your Azure subscription ID |

## 📝 Update Workflow Files

### 1. Update `ci-cd.yml`

Replace the placeholder values:

```yaml
env:
  AZURE_WEBAPP_NAME: your-project-tracker-app  # Your actual Azure Web App name
```

### 2. Update `deploy-staging.yml`

```yaml
env:
  AZURE_WEBAPP_NAME: your-staging-app-name  # Your staging Azure Web App name
```

### 3. Update `deploy-production.yml`

```yaml
env:
  AZURE_WEBAPP_NAME: your-production-app-name  # Your production Azure Web App name
```

## 🔄 Workflow Usage

### Automatic Deployment (Main Branch)
- Push to `main` branch → Automatic deployment to production
- Push to `develop` branch → Automatic deployment to staging

### Manual Deployment (Production)
1. Go to GitHub Actions tab
2. Select "Deploy to Production" workflow
3. Click "Run workflow"
4. Choose environment and click "Run workflow"

## 🧪 Testing the Pipeline

### 1. Test Staging Deployment
```bash
# Create a test branch
git checkout -b feature/test-deployment

# Make a small change
echo "# Test deployment" >> README.md

# Push to develop branch
git push origin develop
```

### 2. Monitor Deployment
- Go to GitHub Actions tab
- Watch the workflow execution
- Check Azure Web App logs if needed

## 🔍 Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Check if all dependencies are in package.json
npm install

# Verify build works locally
npm run build
```

#### 2. Azure Authentication Issues
```bash
# Regenerate service principal
az ad sp create-for-rbac --name "ProjectTrackerDeploy" --role contributor --scopes /subscriptions/{subscription-id}/resourceGroups/ProjectTrackerRG --sdk-auth
```

#### 3. Web App Not Starting
```bash
# Check Web App logs
az webapp log tail --name your-project-tracker-app --resource-group ProjectTrackerRG

# Check application settings
az webapp config appsettings list --name your-project-tracker-app --resource-group ProjectTrackerRG
```

### Environment Variables

Make sure these are set in Azure Web App:

| Setting | Value |
|---------|-------|
| `NODE_ENV` | `production` |
| `WEBSITE_NODE_DEFAULT_VERSION` | `18.17.0` |
| `SCM_DO_BUILD_DURING_DEPLOYMENT` | `true` |
| `WEBSITE_RUN_FROM_PACKAGE` | `1` |

## 📊 Monitoring

### 1. Azure Application Insights
```bash
# Create Application Insights
az monitor app-insights component create \
  --app ProjectTrackerInsights \
  --location "East US" \
  --resource-group ProjectTrackerRG \
  --application-type web
```

### 2. Health Check Endpoint
Add a health check endpoint to your Next.js app:

```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({ status: 'healthy', timestamp: new Date().toISOString() });
}
```

## 🔒 Security Best Practices

1. **Use Service Principal** instead of personal credentials
2. **Rotate secrets** regularly
3. **Enable HTTPS** on Azure Web App
4. **Set up monitoring** and alerting
5. **Use staging environment** for testing

## 📈 Scaling

### Auto-scaling
```bash
# Enable auto-scaling
az monitor autoscale create \
  --resource-group ProjectTrackerRG \
  --resource your-project-tracker-app \
  --resource-type Microsoft.Web/sites \
  --name ProjectTrackerAutoscale \
  --min-count 1 \
  --max-count 3 \
  --count 1
```

## 🎯 Next Steps

1. ✅ Set up Azure Web App
2. ✅ Configure GitHub Secrets
3. ✅ Update workflow files
4. ✅ Test deployment pipeline
5. 🔄 Set up monitoring
6. 🔄 Configure custom domain
7. 🔄 Set up SSL certificate
8. 🔄 Implement rollback strategy

## 📞 Support

If you encounter issues:

1. Check GitHub Actions logs
2. Review Azure Web App logs
3. Verify Azure credentials
4. Test locally with `npm run build`

---

**Happy Deploying! 🚀**
