# Configuração do Painel Administrativo

Este documento explica como configurar e executar o painel administrativo do e-commerce.

## 📋 Pré-requisitos

- Node.js instalado
- MySQL configurado
- Variáveis de ambiente configuradas no arquivo `.env`

## 🚀 Configuração Inicial

### 1. Instalar Dependências

```bash
# Instalar dependências do backend
npm install

# Instalar dependências do admin (Angular)
cd Admin
npm install
cd ..
```

### 2. Configurar Banco de Dados

#### Opção A: Configuração Automática
```bash
# Criar arquivo .env automaticamente
node setup-database.js

# Editar o arquivo .env com sua senha do MySQL
# Depois executar a migração
node admin-migration.js
```

#### Opção B: Configuração Manual
1. Crie um arquivo `.env` na raiz do projeto
2. Copie o conteúdo do arquivo `config-example.env`
3. Configure suas credenciais do MySQL:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=ecommerce_db
   DB_USER=root
   DB_PASSWORD=sua_senha_aqui
   JWT_SECRET=seu_jwt_secret_super_secreto_aqui
   ```
4. Execute a migração:
   ```bash
   node admin-migration.js
   ```

Este script irá:
- ✅ Criar todas as tabelas necessárias
- ✅ Inserir dados de exemplo (usuários, produtos, pedidos, cupons)
- ✅ Mostrar estatísticas do banco

### 3. Iniciar o Backend

```bash
npm start
# ou
node server.js
```

O backend estará disponível em `http://localhost:3000`

### 4. Iniciar o Painel Admin

```bash
cd Admin
ng serve
# ou
npm start
```

O painel admin estará disponível em `http://localhost:4200`

## 🔑 Credenciais de Acesso

**Admin Principal:**
- Email: `admin@ecommerce.com`
- Senha: `admin123`

## 📊 Dados de Exemplo

O script de migração cria:

### Usuários (4)
- 1 Admin principal
- 3 Usuários comuns

### Produtos (5)
- Camiseta Básica - R$ 29,90
- Calça Jeans - R$ 89,90
- Tênis Esportivo - R$ 199,90
- Bolsa de Couro - R$ 299,90
- Relógio Digital - R$ 149,90

### Cupons (4)
- WELCOME10 - 10% de desconto
- FREESHIP - R$ 15,00 de desconto
- SUMMER25 - 25% de desconto
- VIP50 - R$ 50,00 de desconto

### Pedidos (4)
- Com diferentes status (pending, paid, shipped, delivered)
- Itens de pedido associados

## 🛠️ Funcionalidades do Admin

### Dashboard
- Estatísticas de vendas
- Gráficos de performance
- Resumo de pedidos

### Usuários
- Listar todos os usuários
- Visualizar detalhes
- Editar informações
- Deletar usuários

### Produtos
- Listar todos os produtos
- Adicionar novos produtos
- Editar produtos existentes
- Deletar produtos
- Upload de imagens

### Pedidos
- Listar todos os pedidos
- Visualizar detalhes do pedido
- Atualizar status do pedido
- Filtrar por status

### Cupons
- Listar todos os cupons
- Criar novos cupons
- Editar cupons existentes
- Deletar cupons
- Validar cupons

## 🔧 Rotas da API

### Autenticação
- `POST /auth/login` - Login do admin

### Usuários
- `GET /users` - Listar usuários (admin)
- `GET /users/:id` - Obter usuário
- `POST /users` - Criar usuário
- `PUT /users/:id` - Atualizar usuário (admin)
- `DELETE /users/:id` - Deletar usuário (admin)

### Produtos
- `GET /products` - Listar produtos
- `GET /products/:id` - Obter produto
- `POST /products` - Criar produto (admin)
- `PUT /products/:id` - Atualizar produto (admin)
- `DELETE /products/:id` - Deletar produto (admin)

### Pedidos
- `GET /orders` - Listar pedidos (admin)
- `GET /orders/:id` - Obter pedido (admin)
- `POST /orders` - Criar pedido
- `PUT /orders/:id/status` - Atualizar status (admin)

### Cupons
- `GET /coupons` - Listar cupons (admin)
- `GET /coupons/:id` - Obter cupom (admin)
- `POST /coupons` - Criar cupom (admin)
- `PUT /coupons/:id` - Atualizar cupom (admin)
- `DELETE /coupons/:id` - Deletar cupom (admin)
- `POST /coupons/validate` - Validar cupom

### Admin
- `GET /admin/stats` - Estatísticas do dashboard

## 🐛 Solução de Problemas

### Erro de Conexão com Banco
1. Verifique se o MySQL está rodando
2. Confirme as credenciais no arquivo `.env`
3. Execute `node admin-migration.js` novamente

### Erro de CORS
1. Verifique se o backend está rodando na porta 3000
2. Confirme se o admin está rodando na porta 4200
3. Verifique as configurações de CORS no `server.js`

### Erro de Autenticação
1. Verifique se o token JWT está sendo enviado
2. Confirme se o usuário tem role 'admin'
3. Verifique se o JWT_SECRET está configurado

## 📝 Notas Importantes

- O script de migração só insere dados se o banco estiver vazio
- Todas as rotas de admin requerem autenticação
- As imagens dos produtos são placeholders (via.placeholder.com)
- O sistema usa JWT para autenticação
- As senhas são armazenadas em texto simples (apenas para demonstração)

## 🔄 Reset do Banco

Para resetar o banco e executar a migração novamente:

```bash
# Deletar todas as tabelas
node -e "require('./src/models').sequelize.sync({force: true})"

# Executar migração
node admin-migration.js
```

## 📞 Suporte

Em caso de problemas, verifique:
1. Logs do console
2. Status do banco de dados
3. Configurações de rede
4. Variáveis de ambiente
