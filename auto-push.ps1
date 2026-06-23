# Define la hora objetivo (17:00 de hoy)
$targetTime = [datetime]::Today.AddHours(17)

# Si al ejecutar el script ya pasaron las 17:00, programa para las 17:00 de mañana
if ((Get-Date) -gt $targetTime) {
    $targetTime = $targetTime.AddDays(1)
}

# Calcula cuántos segundos faltan exactamente entre la hora actual y las 17:00
$sleepSeconds = ($targetTime - (Get-Date)).TotalSeconds

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   Script programado para subir los cambios a GIT" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Hora actual: $(Get-Date)"
Write-Host "Hora de subida: $targetTime"
Write-Host "Faltan $([math]::Round($sleepSeconds / 60)) minutos para ejecutar la subida."
Write-Host "Por favor, NO CIERRES ESTA VENTANA de la terminal." -ForegroundColor Yellow
Write-Host "=========================================================="

# Pausa la ejecución de la terminal (la duerme) por los segundos calculados
Start-Sleep -Seconds $sleepSeconds

Write-Host "¡Es la hora (17:00)! Subiendo cambios a Git..." -ForegroundColor Green

# Se ejecutan los comandos de Git
git add .
git commit -m "UI: Refactor del Panel de Administración, adopción del tema global y correcciones menores"
git push

Write-Host "¡Cambios subidos correctamente!" -ForegroundColor Green
Start-Sleep -Seconds 10
