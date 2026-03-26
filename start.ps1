Write-Host "Starting CrisisIQ Services..."

# Try to start databases if Docker is available
try {
    docker compose -f docker-compose.dev.yml up -d mongodb redis 2>$null
} catch {
    Write-Host "Docker not found. Skipping databases."
}

# Start AI Engine
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd ai-engine; .\venv\Scripts\activate; uvicorn src.main:app --port 8000 --reload"

# Start Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; `$env:MONGODB_URI='mongodb://admin:secret@localhost:27017/crisisiq?authSource=admin'; `$env:REDIS_URL='redis://:secret@localhost:6379'; npm run dev"

# Start Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "==============================================="
Write-Host "All services are booting up in separate windows!"
Write-Host "Frontend URL: http://localhost:5173"
Write-Host "Backend URL:  http://localhost:3001"
Write-Host "AI Engine:    http://localhost:8000"
Write-Host "==============================================="
