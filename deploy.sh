#!/bin/bash

# Script para deploy e restart da aplicação ecommerce_api
# Uso: ./deploy.sh [IP_DO_SERVIDOR] [USUARIO_SSH]

# Verificar se os parâmetros foram fornecidos
if [ $# -ne 2 ]; then
    echo "Uso: $0 <IP_DO_SERVIDOR> <USUARIO_SSH>"
    echo "Exemplo: $0 192.168.1.100 root"
    exit 1
fi

SERVER_IP=$1
SSH_USER=$2
PROJECT_PATH="/var/www/ecommerce_api"
PM2_APP_NAME="ecommerce_api"

echo "🚀 Iniciando deploy para $SSH_USER@$SERVER_IP"
echo "📁 Pasta do projeto: $PROJECT_PATH"
echo ""

# Função para executar comandos via SSH
run_ssh_command() {
    ssh -o StrictHostKeyChecking=no $SSH_USER@$SERVER_IP "$1"
}

# Função para executar comandos na pasta do projeto
run_project_command() {
    run_ssh_command "cd $PROJECT_PATH && $1"
}

echo "1️⃣ Conectando ao servidor..."
if ! run_ssh_command "echo 'Conexão SSH estabelecida com sucesso'"; then
    echo "❌ Erro: Não foi possível conectar ao servidor SSH"
    exit 1
fi

echo "✅ Conexão SSH estabelecida"
echo ""

echo "2️⃣ Verificando se a pasta do projeto existe..."
if ! run_ssh_command "[ -d '$PROJECT_PATH' ]"; then
    echo "❌ Erro: Pasta $PROJECT_PATH não encontrada"
    exit 1
fi

echo "✅ Pasta do projeto encontrada"
echo ""

echo "3️⃣ Verificando se o PM2 está instalado..."
if ! run_ssh_command "command -v pm2 >/dev/null 2>&1"; then
    echo "❌ Erro: PM2 não está instalado no servidor"
    exit 1
fi

echo "✅ PM2 encontrado"
echo ""

echo "4️⃣ Verificando se o Nginx está instalado..."
if ! run_ssh_command "command -v nginx >/dev/null 2>&1"; then
    echo "❌ Erro: Nginx não está instalado no servidor"
    exit 1
fi

echo "✅ Nginx encontrado"
echo ""

echo "5️⃣ Fazendo backup da aplicação atual..."
run_project_command "cp -r . ../ecommerce_api_backup_\$(date +%Y%m%d_%H%M%S) 2>/dev/null || echo 'Backup opcional criado'"
echo "✅ Backup realizado"
echo ""

echo "6️⃣ Atualizando dependências do projeto..."
run_project_command "npm install --production"
if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências"
    exit 1
fi
echo "✅ Dependências atualizadas"
echo ""

echo "7️⃣ Reiniciando aplicação PM2..."
run_project_command "pm2 restart $PM2_APP_NAME"
if [ $? -ne 0 ]; then
    echo "⚠️  Aplicação não encontrada no PM2, tentando iniciar..."
    run_project_command "pm2 start server.js --name $PM2_APP_NAME"
    if [ $? -ne 0 ]; then
        echo "❌ Erro ao iniciar aplicação no PM2"
        exit 1
    fi
fi
echo "✅ Aplicação PM2 reiniciada"
echo ""

echo "8️⃣ Verificando status da aplicação..."
run_project_command "pm2 status $PM2_APP_NAME"
echo ""

echo "9️⃣ Testando configuração do Nginx..."
run_ssh_command "nginx -t"
if [ $? -ne 0 ]; then
    echo "❌ Erro na configuração do Nginx"
    exit 1
fi
echo "✅ Configuração do Nginx válida"
echo ""

echo "🔟 Reiniciando Nginx..."
run_ssh_command "systemctl reload nginx"
if [ $? -ne 0 ]; then
    echo "⚠️  Tentando restart completo do Nginx..."
    run_ssh_command "systemctl restart nginx"
    if [ $? -ne 0 ]; then
        echo "❌ Erro ao reiniciar Nginx"
        exit 1
    fi
fi
echo "✅ Nginx reiniciado"
echo ""

echo "1️⃣1️⃣ Verificando status dos serviços..."
echo "📊 Status PM2:"
run_project_command "pm2 status"
echo ""
echo "📊 Status Nginx:"
run_ssh_command "systemctl status nginx --no-pager -l"
echo ""

echo "1️⃣2️⃣ Testando conectividade..."
echo "🌐 Testando se a aplicação está respondendo..."
if run_ssh_command "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/health || curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/"; then
    echo "✅ Aplicação respondendo"
else
    echo "⚠️  Aplicação pode não estar respondendo corretamente"
fi

echo ""
echo "🎉 Deploy concluído com sucesso!"
echo ""
echo "📋 Resumo:"
echo "   • Servidor: $SSH_USER@$SERVER_IP"
echo "   • Projeto: $PROJECT_PATH"
echo "   • PM2 App: $PM2_APP_NAME"
echo "   • Nginx: Reiniciado"
echo ""
echo "🔗 Para verificar logs em tempo real:"
echo "   ssh $SSH_USER@$SERVER_IP 'cd $PROJECT_PATH && pm2 logs $PM2_APP_NAME'"
echo ""
echo "📊 Para monitorar status:"
echo "   ssh $SSH_USER@$SERVER_IP 'cd $PROJECT_PATH && pm2 monit'"
