echo "[1/3] Pulling latest Docker images"
docker-compose pull
echo "[2/3] Compose up containers in background"
docker-compose up -d --remove-orphans
echo "[3/3] Deploy finished"
