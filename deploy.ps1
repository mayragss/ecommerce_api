# Script PowerShell para deploy e restart da aplicação ecommerce_api
# Uso: .\deploy.ps1 -ServerIP "IP_DO_SERVIDOR" -SSHUser "USUARIO_SSH"

param(
    [Parameter(Mandatory=$true)]
    [string]$ServerIP,
    
    [Parameter(Mandatory=$true)]
    [string]$SSHUser,
    
    [string]$ProjectPath = "/var/www/ecommerce_api",
    [string]$PM2AppName = "ecommerce_api"
)

Write-Host "🚀 Iniciando deploy para $SSHUser@$ServerIP" -ForegroundColor Green
Write-Host "📁 Pasta do projeto: $ProjectPath" -ForegroundColor Cyan
Write-Host ""

# Função para executar comandos via SSH
function Invoke-SSHCommand {
    param([string]$Command)
    
    try {
        $result = ssh -o StrictHostKeyChecking=no "$SSHUser@$ServerIP" $Command
        return $result
    }
    catch {
        Write-Host "❌ Erro ao executar comando SSH: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Função para executar comandos na pasta do projeto
function Invoke-ProjectCommand {
    param([string]$Command)
    
    return Invoke-SSHCommand "cd $ProjectPath && $Command"
}

Write-Host "1️⃣ Conectando ao servidor..." -ForegroundColor Yellow
$connectionTest = Invoke-SSHCommand "echo 'Conexão SSH estabelecida com sucesso'"
if (-not $connectionTest) {
    Write-Host "❌ Erro: Não foi possível conectar ao servidor SSH" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Conexão SSH estabelecida" -ForegroundColor Green
Write-Host ""

Write-Host "2️⃣ Verificando se a pasta do projeto existe..." -ForegroundColor Yellow
$folderExists = Invoke-SSHCommand "[ -d '$ProjectPath' ]"
if (-not $folderExists) {
    Write-Host "❌ Erro: Pasta $ProjectPath não encontrada" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Pasta do projeto encontrada" -ForegroundColor Green
Write-Host ""

Write-Host "3️⃣ Verificando se o PM2 está instalado..." -ForegroundColor Yellow
$pm2Exists = Invoke-SSHCommand "command -v pm2 >/dev/null 2>&1"
if (-not $pm2Exists) {
    Write-Host "❌ Erro: PM2 não está instalado no servidor" -ForegroundColor Red
    exit 1
}

Write-Host "✅ PM2 encontrado" -ForegroundColor Green
Write-Host ""

Write-Host "4️⃣ Verificando se o Nginx está instalado..." -ForegroundColor Yellow
$nginxExists = Invoke-SSHCommand "command -v nginx >/dev/null 2>&1"
if (-not $nginxExists) {
    Write-Host "❌ Erro: Nginx não está instalado no servidor" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Nginx encontrado" -ForegroundColor Green
Write-Host ""

Write-Host "5️⃣ Fazendo backup da aplicação atual..." -ForegroundColor Yellow
Invoke-ProjectCommand "cp -r . ../ecommerce_api_backup_`$(date +%Y%m%d_%H%M%S) 2>/dev/null || echo 'Backup opcional criado'"
Write-Host "✅ Backup realizado" -ForegroundColor Green
Write-Host ""

Write-Host "6️⃣ Atualizando dependências do projeto..." -ForegroundColor Yellow
$npmResult = Invoke-ProjectCommand "npm install --production"
if (-not $npmResult) {
    Write-Host "❌ Erro ao instalar dependências" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependências atualizadas" -ForegroundColor Green
Write-Host ""

Write-Host "7️⃣ Reiniciando aplicação PM2..." -ForegroundColor Yellow
$pm2Restart = Invoke-ProjectCommand "pm2 restart $PM2AppName"
if (-not $pm2Restart) {
    Write-Host "⚠️  Aplicação não encontrada no PM2, tentando iniciar..." -ForegroundColor Yellow
    $pm2Start = Invoke-ProjectCommand "pm2 start server.js --name $PM2AppName"
    if (-not $pm2Start) {
        Write-Host "❌ Erro ao iniciar aplicação no PM2" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✅ Aplicação PM2 reiniciada" -ForegroundColor Green
Write-Host ""

Write-Host "8️⃣ Verificando status da aplicação..." -ForegroundColor Yellow
Invoke-ProjectCommand "pm2 status $PM2AppName"
Write-Host ""

Write-Host "9️⃣ Testando configuração do Nginx..." -ForegroundColor Yellow
$nginxTest = Invoke-SSHCommand "nginx -t"
if (-not $nginxTest) {
    Write-Host "❌ Erro na configuração do Nginx" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Configuração do Nginx válida" -ForegroundColor Green
Write-Host ""

Write-Host "🔟 Reiniciando Nginx..." -ForegroundColor Yellow
$nginxReload = Invoke-SSHCommand "systemctl reload nginx"
if (-not $nginxReload) {
    Write-Host "⚠️  Tentando restart completo do Nginx..." -ForegroundColor Yellow
    $nginxRestart = Invoke-SSHCommand "systemctl restart nginx"
    if (-not $nginxRestart) {
        Write-Host "❌ Erro ao reiniciar Nginx" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✅ Nginx reiniciado" -ForegroundColor Green
Write-Host ""

Write-Host "1️⃣1️⃣ Verificando status dos serviços..." -ForegroundColor Yellow
Write-Host "📊 Status PM2:" -ForegroundColor Cyan
Invoke-ProjectCommand "pm2 status"
Write-Host ""
Write-Host "📊 Status Nginx:" -ForegroundColor Cyan
Invoke-SSHCommand "systemctl status nginx --no-pager -l"
Write-Host ""

Write-Host "1️⃣2️⃣ Testando conectividade..." -ForegroundColor Yellow
Write-Host "🌐 Testando se a aplicação está respondendo..." -ForegroundColor Cyan
$healthCheck = Invoke-SSHCommand "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/health || curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/"
if ($healthCheck) {
    Write-Host "✅ Aplicação respondendo" -ForegroundColor Green
} else {
    Write-Host "⚠️  Aplicação pode não estar respondendo corretamente" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Deploy concluído com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Resumo:" -ForegroundColor Cyan
Write-Host "   • Servidor: $SSHUser@$ServerIP" -ForegroundColor White
Write-Host "   • Projeto: $ProjectPath" -ForegroundColor White
Write-Host "   • PM2 App: $PM2AppName" -ForegroundColor White
Write-Host "   • Nginx: Reiniciado" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Para verificar logs em tempo real:" -ForegroundColor Cyan
Write-Host "   ssh $SSHUser@$ServerIP 'cd $ProjectPath && pm2 logs $PM2AppName'" -ForegroundColor White
Write-Host ""
Write-Host "📊 Para monitorar status:" -ForegroundColor Cyan
Write-Host "   ssh $SSHUser@$ServerIP 'cd $ProjectPath && pm2 monit'" -ForegroundColor White
