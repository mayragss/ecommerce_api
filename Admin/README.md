# 🛒 Admin Panel - E-commerce

Painel administrativo moderno e responsivo para gerenciar uma API de e-commerce, construído com Angular 18 e Bootstrap 5.

## ✨ Funcionalidades

### 🔐 Autenticação
- Login seguro com JWT
- Proteção de rotas com guards
- Logout automático

### 📊 Dashboard
- Estatísticas em tempo real
- Cards com métricas principais
- Pedidos recentes
- Ações rápidas

### 👥 Gerenciamento de Usuários
- Listar, criar, editar e excluir usuários
- Filtros por role e busca
- Validação de formulários

### 📦 Gerenciamento de Produtos
- CRUD completo de produtos
- Upload de imagens
- Controle de estoque
- Categorização

### 🛍️ Gerenciamento de Pedidos
- Visualizar todos os pedidos
- Atualizar status dos pedidos
- Detalhes completos dos pedidos
- Filtros por status e pagamento

### 🎫 Gerenciamento de Cupons
- Criar cupons de desconto
- Controle de validade
- Limites de uso
- Tipos de desconto (porcentagem/valor fixo)

## 🚀 Tecnologias Utilizadas

- **Angular 18** - Framework principal
- **Bootstrap 5** - Framework CSS
- **Font Awesome** - Ícones
- **TypeScript** - Linguagem de programação
- **RxJS** - Programação reativa
- **SCSS** - Pré-processador CSS

## 📁 Estrutura do Projeto

```
Admin/
├── src/
│   ├── app/
│   │   ├── components/          # Componentes da aplicação
│   │   │   ├── dashboard/       # Dashboard principal
│   │   │   ├── users/          # Gerenciamento de usuários
│   │   │   ├── products/       # Gerenciamento de produtos
│   │   │   ├── orders/         # Gerenciamento de pedidos
│   │   │   ├── coupons/        # Gerenciamento de cupons
│   │   │   ├── login/          # Página de login
│   │   │   ├── navbar/         # Barra de navegação
│   │   │   └── sidebar/        # Menu lateral
│   │   ├── services/           # Serviços da aplicação
│   │   │   └── api.service.ts  # Serviço de comunicação com API
│   │   ├── models/             # Interfaces TypeScript
│   │   ├── guards/             # Guards de autenticação
│   │   └── app.routes.ts       # Configuração de rotas
│   ├── assets/                 # Arquivos estáticos
│   └── styles.scss             # Estilos globais
├── package.json
├── angular.json
└── README.md
```

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou yarn
- API de e-commerce rodando na porta 3000

### Passos para instalação

1. **Navegue até o diretório Admin:**
   ```bash
   cd Admin
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure a URL da API:**
   - Abra `src/app/services/api.service.ts`
   - Altere a variável `baseUrl` se necessário:
   ```typescript
   private baseUrl = 'http://localhost:3000'; // URL da sua API
   ```

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm start
   ```

5. **Acesse a aplicação:**
   - Abra seu navegador em `http://localhost:4200`

## 🔧 Scripts Disponíveis

- `npm start` - Inicia o servidor de desenvolvimento
- `npm run build` - Compila a aplicação para produção
- `npm run watch` - Compila e observa mudanças
- `npm test` - Executa os testes unitários

## 🎨 Interface

### Design Responsivo
- Layout adaptável para desktop, tablet e mobile
- Sidebar colapsível
- Cards com animações suaves
- Tema moderno com gradientes

### Componentes Principais
- **Navbar**: Barra superior com informações do usuário
- **Sidebar**: Menu lateral com navegação
- **Dashboard**: Visão geral com estatísticas
- **Modais**: Formulários para criar/editar entidades
- **Tabelas**: Listagem com filtros e busca

## 🔐 Autenticação

O painel utiliza autenticação JWT:

1. **Login**: Credenciais são enviadas para `/auth/login`
2. **Token**: JWT é armazenado no localStorage
3. **Guards**: Rotas protegidas verificam a validade do token
4. **Headers**: Token é enviado em todas as requisições autenticadas

## 📡 Integração com API

O painel se comunica com a API através dos seguintes endpoints:

### Usuários
- `GET /users` - Listar usuários
- `POST /users` - Criar usuário
- `PUT /users/:id` - Atualizar usuário
- `DELETE /users/:id` - Excluir usuário

### Produtos
- `GET /products` - Listar produtos
- `POST /products` - Criar produto
- `PUT /products/:id` - Atualizar produto
- `DELETE /products/:id` - Excluir produto

### Pedidos
- `GET /orders` - Listar pedidos
- `PUT /orders/:id/status` - Atualizar status

### Cupons
- `GET /coupons` - Listar cupons
- `POST /coupons` - Criar cupom
- `PUT /coupons/:id` - Atualizar cupom
- `DELETE /coupons/:id` - Excluir cupom

## 🚀 Deploy

### Build para Produção
```bash
npm run build
```

Os arquivos compilados estarão na pasta `dist/admin-panel/`.

### Servidor Web
Configure seu servidor web (Apache, Nginx, etc.) para servir os arquivos da pasta `dist/admin-panel/`.

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Se você encontrar algum problema ou tiver dúvidas:

1. Verifique se a API está rodando na porta 3000
2. Confirme se as credenciais de login estão corretas
3. Verifique o console do navegador para erros
4. Abra uma issue no repositório

## 🔄 Atualizações Futuras

- [ ] Upload de imagens para produtos
- [ ] Relatórios avançados
- [ ] Notificações em tempo real
- [ ] Exportação de dados
- [ ] Temas personalizáveis
- [ ] Logs de auditoria

---

**Desenvolvido com ❤️ para gerenciar seu e-commerce de forma eficiente!**



