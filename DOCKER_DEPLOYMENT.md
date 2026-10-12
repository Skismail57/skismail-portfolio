# Docker & Kubernetes Deployment Guide

## 🐳 Docker Deployment

### Prerequisites
- Docker installed on your machine
- MongoDB (or use docker-compose)

### Quick Start with Docker

#### 1. Build Docker Image
```bash
docker build -t portfolio:latest .
```

#### 2. Run Container
```bash
docker run -p 3000:3000 \
  -e MONGODB_URI=mongodb://localhost:27017/portfolio \
  -e PORT=3000 \
  portfolio:latest
```

### Docker Compose (Recommended)

#### 1. Start All Services
```bash
docker-compose up -d
```

#### 2. View Logs
```bash
docker-compose logs -f
```

#### 3. Stop Services
```bash
docker-compose down
```

#### 4. Rebuild After Changes
```bash
docker-compose up -d --build
```

---

## ☸️ Kubernetes Deployment

### Prerequisites
- kubectl installed
- Kubernetes cluster (minikube, GKE, AKS, EKS)
- Container registry (Docker Hub, AWS ECR, GCR)

### Steps

#### 1. Build and Push Docker Image
```bash
# Build image
docker build -t your-dockerhub-username/portfolio:latest .

# Login to Docker Hub
docker login

# Push image
docker push your-dockerhub-username/portfolio:latest
```

#### 2. Update k8s-deployment.yaml
Replace `your-dockerhub-username` with your actual Docker Hub username in the image field.

#### 3. Apply Kubernetes Manifests
```bash
kubectl apply -f k8s-deployment.yaml
```

#### 4. Check Deployment Status
```bash
kubectl get pods
kubectl get services
```

#### 5. Get Service URL
```bash
minikube service portfolio-service --url
# Or for cloud providers, check the LoadBalancer external IP
```

#### 6. Scale Deployment
```bash
kubectl scale deployment portfolio-app --replicas=5
```

#### 7. View Logs
```bash
kubectl logs -f deployment/portfolio-app
```

---

## 🔧 Environment Variables

### Required
- `PORT` - Application port (default: 3000)
- `MONGODB_URI` - MongoDB connection string

### Optional
- `NODE_ENV` - Environment (development/production)
- `JWT_SECRET` - JWT secret for authentication
- `EMAIL_USER` - Email for notifications
- `EMAIL_PASS` - Email password
- `TWO_FACTOR_SECRET` - 2FA secret

---

## 📊 Monitoring

### Docker
```bash
# View container stats
docker stats

# View logs
docker logs <container-id>

# Exec into container
docker exec -it <container-id> sh
```

### Kubernetes
```bash
# View pod status
kubectl get pods

# View logs
kubectl logs -f <pod-name>

# Describe pod
kubectl describe pod <pod-name>

# Port forward
kubectl port-forward service/portfolio-service 3000:80
```

---

## 🚀 Production Tips

### 1. Use Environment Files
```bash
# Create .env file
cat > .env << EOF
MONGODB_URI=mongodb://user:pass@host:27017/db
JWT_SECRET=your-secret-key
EOF

# Use in docker-compose
docker-compose --env-file .env up
```

### 2. Enable Health Checks
Docker Compose already includes health checks. Kubernetes has liveness and readiness probes configured.

### 3. Use Multi-Stage Builds (for smaller images)
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production
CMD ["node", "server.js"]
```

### 4. Add MongoDB to Kubernetes
```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mongodb
spec:
  serviceName: mongodb-service
  replicas: 1
  selector:
    matchLabels:
      app: mongodb
  template:
    metadata:
      labels:
        app: mongodb
    spec:
      containers:
      - name: mongodb
        image: mongo:7
        ports:
        - containerPort: 27017
        env:
        - name: MONGO_INITDB_ROOT_USERNAME
          value: "admin"
        - name: MONGO_INITDB_ROOT_PASSWORD
          value: "password123"
        volumeMounts:
        - name: mongodb-storage
          mountPath: /data/db
  volumeClaimTemplates:
  - metadata:
      name: mongodb-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 10Gi
```

---

## 🛠️ Troubleshooting

### Docker Issues
```bash
# Container won't start
docker logs <container-id>

# Port already in use
docker ps -a
docker rm <container-id>

# Rebuild from scratch
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Kubernetes Issues
```bash
# Pod not starting
kubectl describe pod <pod-name>

# Service not accessible
kubectl get endpoints portfolio-service

# CrashLoopBackOff
kubectl logs <pod-name> --previous
```

---

## 📝 Notes

- Docker Compose is perfect for local development and testing
- Kubernetes is recommended for production scalability
- Always use environment variables for sensitive data
- Regularly update base images for security patches
- Monitor resource usage and adjust limits accordingly
