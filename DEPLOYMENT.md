# TruContext Demo - Deployment Guide

This guide provides step-by-step instructions for deploying the TruContext Demo application to various platforms.

## 🚀 Quick Deploy to Vercel (Recommended)

Vercel is the recommended platform for deploying Next.js applications.

### Prerequisites
- GitHub/GitLab/Bitbucket account
- Vercel account (free tier available)
- Neo4j Aura database credentials

### Step 1: Push to Git Repository

```bash
# Initialize git repository (if not already done)
git init
git add .
git commit -m "Initial commit: TruContext Demo application"

# Push to your preferred git platform
git remote add origin <your-repository-url>
git push -u origin main
```

### Step 2: Deploy to Vercel

1. **Connect Repository**
   - Visit [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your repository
   - Select the repository containing TruContext Demo

2. **Configure Build Settings**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Set Environment Variables**
   Add the following environment variables in Vercel dashboard:
   ```
   NEO4J_URI=neo4j+s://ebd05d7f.databases.neo4j.io
   NEO4J_USERNAME=neo4j
   NEO4J_PASSWORD=RX8GYHKu9fH4vrpiZ7UGC0y8HbIJudrJg0ovqbeNdLM
   NEO4J_DATABASE=neo4j
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build completion
   - Access your live application

### Step 3: Verify Deployment

1. **Test Upload Functionality**
   - Upload the sample dataset
   - Verify graph visualization loads
   - Check browser console for errors

2. **Test Neo4j Connection**
   - Ensure data imports successfully
   - Verify graph data retrieval works

## 🐳 Docker Deployment

### Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

### Create docker-compose.yml

```yaml
version: '3.8'
services:
  trucontext-demo:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEO4J_URI=neo4j+s://ebd05d7f.databases.neo4j.io
      - NEO4J_USERNAME=neo4j
      - NEO4J_PASSWORD=RX8GYHKu9fH4vrpiZ7UGC0y8HbIJudrJg0ovqbeNdLM
      - NEO4J_DATABASE=neo4j
    restart: unless-stopped
```

### Deploy with Docker

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## ☁️ AWS Deployment

### Using AWS Amplify

1. **Connect Repository**
   - Open AWS Amplify Console
   - Choose "Host web app"
   - Connect your Git repository

2. **Configure Build Settings**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

3. **Set Environment Variables**
   Add Neo4j credentials in Amplify environment variables

### Using AWS EC2

1. **Launch EC2 Instance**
   - Choose Ubuntu 20.04 LTS
   - Configure security groups (port 3000)
   - Launch with key pair

2. **Install Dependencies**
   ```bash
   # Connect to instance
   ssh -i your-key.pem ubuntu@your-instance-ip
   
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2
   sudo npm install -g pm2
   ```

3. **Deploy Application**
   ```bash
   # Clone repository
   git clone <your-repository-url>
   cd trucontext-demo
   
   # Install dependencies
   npm install
   
   # Build application
   npm run build
   
   # Create environment file
   echo "NEO4J_URI=neo4j+s://ebd05d7f.databases.neo4j.io" > .env.local
   echo "NEO4J_USERNAME=neo4j" >> .env.local
   echo "NEO4J_PASSWORD=RX8GYHKu9fH4vrpiZ7UGC0y8HbIJudrJg0ovqbeNdLM" >> .env.local
   echo "NEO4J_DATABASE=neo4j" >> .env.local
   
   # Start with PM2
   pm2 start npm --name "trucontext-demo" -- start
   pm2 startup
   pm2 save
   ```

## 🌐 Netlify Deployment

1. **Connect Repository**
   - Visit [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Choose your repository

2. **Configure Build Settings**
   - Build command: `npm run build && npm run export`
   - Publish directory: `out`

3. **Add Build Script**
   Update `package.json`:
   ```json
   {
     "scripts": {
       "export": "next export"
     }
   }
   ```

4. **Set Environment Variables**
   Add Neo4j credentials in Netlify environment variables

## 🔧 Environment Variables

### Required Variables
```env
NEO4J_URI=neo4j+s://ebd05d7f.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=RX8GYHKu9fH4vrpiZ7UGC0y8HbIJudrJg0ovqbeNdLM
NEO4J_DATABASE=neo4j
```

### Optional Variables
```env
NODE_ENV=production
NEXT_PUBLIC_APP_NAME=TruContext Demo
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## 🔍 Post-Deployment Checklist

### Functionality Tests
- [ ] Application loads without errors
- [ ] File upload works correctly
- [ ] Neo4j connection is successful
- [ ] Graph visualization renders
- [ ] Sample dataset imports properly
- [ ] Responsive design works on mobile

### Performance Tests
- [ ] Page load times are acceptable
- [ ] Large dataset uploads complete
- [ ] Graph rendering is smooth
- [ ] API responses are fast

### Security Tests
- [ ] Environment variables are secure
- [ ] No sensitive data in client code
- [ ] HTTPS is enabled
- [ ] Neo4j connection is encrypted

## 🐛 Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

2. **Neo4j Connection Issues**
   - Verify environment variables
   - Check Neo4j Aura status
   - Test connection from deployment environment

3. **Memory Issues**
   - Increase Node.js memory limit
   - Optimize build process
   - Use smaller datasets for testing

### Debug Commands

```bash
# Check environment variables
printenv | grep NEO4J

# Test Neo4j connection
node -e "
const neo4j = require('neo4j-driver');
const driver = neo4j.driver(process.env.NEO4J_URI, neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD));
driver.verifyConnectivity().then(() => console.log('Connected')).catch(console.error);
"

# Check application logs
pm2 logs trucontext-demo
```

## 📊 Monitoring

### Vercel Analytics
- Enable Vercel Analytics for performance monitoring
- Monitor function execution times
- Track user interactions

### Custom Monitoring
```javascript
// Add to pages/_app.tsx for custom analytics
useEffect(() => {
  // Track page views
  console.log('Page view:', router.pathname)
}, [router.pathname])
```

## 🔄 Updates and Maintenance

### Automated Deployments
Set up automatic deployments on git push:
- Vercel: Automatic with git integration
- AWS Amplify: Automatic with git integration
- Manual: Use GitHub Actions or similar CI/CD

### Database Maintenance
- Monitor Neo4j Aura usage
- Regular data backups
- Performance optimization

### Security Updates
- Keep dependencies updated
- Monitor for security vulnerabilities
- Regular security audits

## 📞 Support

For deployment issues:
1. Check application logs
2. Verify environment variables
3. Test Neo4j connectivity
4. Review platform-specific documentation
5. Contact development team

---

**TruContext Demo - Deployment Guide**
**Powered by Visium Technologies** 