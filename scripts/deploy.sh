#!/bin/bash

set -e

echo "⚙️ Registry configuration"

read -p "💻 Registry server [ghcr.io by default]: " REGISTRY
REGISTRY=${REGISTRY:-ghcr.io}

read -p "👤 Docker/GHCR user: " USERNAME
read -s -p "🤐 Access token: " TOKEN
echo ""

read -p "📧 User email: " EMAIL

echo "$TOKEN" | docker login "$REGISTRY" -u "$USERNAME" --password-stdin

read -p "🔧 Do you want to build and push images? (y/N): " BUILDANDPUSH
BUILDANDPUSH=${BUILDANDPUSH:-n}

if [[ "$BUILDANDPUSH" =~ ^[Yy]$ ]]; then
    read -p "🚨 IMPORTANT: IS YOUR CLUSTER ARCHITECTURE ARM64 BASED? (y/N): " IS_ARM
    IS_ARM=${IS_ARM:-n}

    if [[ "$IS_ARM" =~ ^[Yy]$ ]]; then
        echo "🛠️  Building for ARM64 with buildx..."

        docker buildx create --name multiarch-builder --driver docker-container 2>/dev/null || true
        docker buildx inspect --bootstrap

        echo "🐳 Building backend image (ARM64 platform)..."
        docker buildx build \
            --builder multiarch-builder \
            --platform linux/arm64 \
            -t $REGISTRY/$USERNAME/backend-app:local \
            --push \
            ./backend

        echo "🐳 Building frontend image (ARM64 platform)..."
        docker buildx build \
            --builder multiarch-builder \
            --platform linux/arm64 \
            -t $REGISTRY/$USERNAME/frontend-app:local \
            --push \
            ./frontend
    else
        echo "🐳 Building backend image (default platform)..."
        docker build -t $REGISTRY/$USERNAME/backend-app:local ./backend
        docker push $REGISTRY/$USERNAME/backend-app:local

        echo "🐳 Building frontend image (default platform)..."
        docker build -t $REGISTRY/$USERNAME/frontend-app:local ./frontend
        docker push $REGISTRY/$USERNAME/frontend-app:local
    fi
fi

echo "🔐 Verifying GHCR secret..."
if kubectl get secret ghcr-secret &> /dev/null; then
    echo "⚠️  Secret 'ghcr-secret' already exists"
    read -p "Do you want to replace it? (y/N): " CONFIRM
    if [[ "$CONFIRM" =~ ^[Yy]$ ]]; then
        kubectl delete secret ghcr-secret
    else
        echo "➡️  Using existing 'ghcr-secret'"
        SKIP_SECRET=true
    fi
fi

if [ "$SKIP_SECRET" != "true" ]; then
    kubectl create secret docker-registry ghcr-secret \
      --docker-server="$REGISTRY" \
      --docker-username="$USERNAME" \
      --docker-password="$TOKEN" \
      --docker-email="$EMAIL"
    echo "✅ 'ghcr-secret' created successfully"
fi

echo "🔐 Sealing application secrets from ./k8s/secrets"

mkdir -p ./k8s/sealed-secrets

for secret in ./k8s/secrets/*.yaml; do
    if [ -f "$secret" ]; then
        name=$(basename "$secret" .yaml)
        sealed="./k8s/sealed-secrets/${name}-sealedsecret.yaml"
        echo "🔒 Sealing $name → $sealed"
        kubeseal --format=yaml --namespace=default < "$secret" > "$sealed"
    fi
done

echo "🚀 Applying sealed secrets..."
kubectl apply -f ./k8s/sealed-secrets/

echo "📦 Deploying PostgreSQL..."
helm upgrade --install postgres ./helm/postgres

echo "🚀 Deploying Backend..."
helm upgrade --install backend ./helm/backend

echo "🎨 Deploying Frontend..."
helm upgrade --install frontend ./helm/frontend

echo "🌐 Applying Ingress..."
kubectl apply -f k8s/ingress.yaml

echo "✅ Deployment completed!"