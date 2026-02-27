# Gerenciador de Tarefas

> **Um Progressive Web App (PWA) moderno para gerenciar suas tarefas diárias**

![Status](https://img.shields.io/badge/Status-Funcional-brightgreen)
![PWA](https://img.shields.io/badge/PWA-Enabled-purple)
![Flask](https://img.shields.io/badge/Backend-Flask-blue)
![JavaScript](https://img.shields.io/badge/Frontend-Vanilla%20JS-yellow)

## Características

### **Funcionalidades Principais**
- **CRUD completo** - Criar, editar, concluir e excluir tarefas
- **Gestão de prazos** - Defina datas limite para suas tarefas
- **Status inteligente** - Pendente, Concluída e Atrasada (automático)
- **Tarefas do dia** - Seção dedicada para tarefas com prazo hoje
- **Interface moderna** - Design glassmorphism com gradientes elegantes

### **Tecnologia PWA**
- **Instalável** - Funciona como app nativo no desktop e mobile
- **Offline-first** - Funciona sem conexão com internet
- **Auto-atualização** - Notifica e atualiza automaticamente
- **Cache inteligente** - Performance otimizada
- **Ícones personalizados** - Visual profissional em todas as plataformas

### **Design Moderno**
- **Gradientes elegantes** - Tema roxo/rosa vibrante
- **Fontes modernas** - Inter, Poppins e Space Grotesk
- **Responsivo** - Adapta-se a qualquer tamanho de tela
- **Animações suaves** - Hover effects e transições
- **Status visuais** - Cores diferenciadas para cada estado

## Tecnologias Utilizadas

### **Backend**
- **Python 3.x**
- **Flask** - Framework web minimalista
- **SQLite** - Banco de dados local
- **SQLAlchemy** - ORM para Python

### **Frontend**
- **HTML5** - Estrutura semântica
- **CSS3** - Estilização moderna com gradientes e glassmorphism
- **JavaScript ES6+** - Funcionalidades interativas
- **PWA** - Service Worker para funcionalidade offline

## Estrutura do Projeto

```
gerenciador_tarefas/
├── 📂 backend/                 # Servidor Flask
│   ├── app.py              # Aplicação principal
│   ├── models.py           # Modelos do banco de dados
│   ├── database.py         # Configuração do banco
│   ├── requirements.txt    # Dependências Python
│   ├── 📂 routes/
│   │   └── tasks.py        # Rotas da API
│   └── 📂 instance/
│       └── database.db     # Banco SQLite
├── 📂 frontend/               # Interface do usuário
│   ├── index.html          # Página principal
│   ├── manifest.json       # Configuração PWA
│   ├── sw.js               # Service Worker
│   ├── 📂 css/
│   │   └── style.css       # Estilos modernos
│   ├── 📂 js/
│   │   └── main.js          # Lógica da aplicação
│   └── 📂 icons/              # Ícones do PWA
│       ├── icon-16x16.png
│       ├── icon-32x32.png
│       └── ... (vários tamanhos)
└── README.md              # Este arquivo
```

## Como Executar

### **Pré-requisitos**
- Python 3.7+ instalado
- pip (gerenciador de pacotes Python)
- Navegador moderno (Chrome, Firefox, Edge, Safari)

### **Instalação Rápida**

1. **Clone o repositório**
   ```bash
   git clone <https://github.com/Felipewv93/Gerenciador_Tarefas.git>
   cd gerenciador_tarefas
   ```

2. **Configure o backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   python app.py
   ```
   > Servidor rodando em: http://localhost:5000

3. **Inicie o frontend**
   ```bash
   # Em outro terminal
   cd frontend
   python -m http.server 8080
   ```
   > App disponível em: http://localhost:8080

4. **Instale como PWA**
   - Abra http://localhost:8080 no navegador
   - Clique no botão "Instalar App"
   - Confirme a instalação
   - Use como aplicativo nativo!

## Como Usar

### **Criar Tarefa**
1. Clique em **"+ Nova Tarefa"** no canto superior direito
2. Preencha **nome** e **descrição**
3. Defina **prazo** (opcional)
4. Clique **"Salvar"**

### **Editar Tarefa**
1. Clique no botão **"Editar"** na tarefa desejada
2. Modifique as informações
3. Clique **"Salvar Alterações"**

### **Concluir Tarefa**
1. Clique no botão **"Concluir"** na tarefa
2. Status muda automaticamente para **"Concluída"**

### **Excluir Tarefa**
1. Clique no botão **"Excluir"** na tarefa
2. Confirme a exclusão

### **Status das Tarefas**
- **Pendente** - Tarefa criada, aguardando conclusão
- **Atrasada** - Prazo vencido e não concluída
- **Concluída** - Tarefa finalizada com sucesso

## Funcionalidades Especiais

### **Funcionalidade Offline**
- Funciona mesmo sem internet
- Dados salvos localmente
- Sincroniza quando volta online
- Notificações de status de conexão

### **Atualizações Automáticas**
- Notifica quando há nova versão
- Atualização com um clique
- Cache inteligente mantém performance

### **Experiência Nativa**
- Instala como aplicativo no Windows/Mac/Linux
- Funciona em smartphones e tablets
- Ícone personalizado na área de trabalho
- Inicialização rápida

## Personalização

### **Alterar Cores**
Edite as variáveis CSS em `frontend/css/style.css`

### **Mudar Fontes**
Altere as importações no `frontend/index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=SuaFonte:wght@300;400;500;600;700&display=swap">
```

### **Customizar PWA**
Modifique `frontend/manifest.json`:
```json
{
  "name": "Seu Nome do App",
  "short_name": "App",
  "theme_color": "#sua-cor",
  "background_color": "#sua-cor-de-fundo"
}
```

## API Endpoints

### **Listar Tarefas**
```http
GET /tasks
Retorna: Lista de todas as tarefas
```

### **Tarefas do Dia**
```http
GET /tasks/today
Retorna: Tarefas com prazo para hoje
```

### **Criar Tarefa**
```http
POST /tasks
Body: {
  "nome": "Nome da tarefa",
  "descricao": "Descrição",
  "prazo": "2025-10-10" (opcional)
}
```

### **Editar Tarefa**
```http
PUT /tasks/<id>
Body: {
  "nome": "Nome atualizado",
  "descricao": "Nova descrição",
  "prazo": "2025-10-15"
}
```

### **Concluir Tarefa**
```http
PUT /tasks/<id>/complete
```

### **Excluir Tarefa**
```http
DELETE /tasks/<id>
```

## Deploy

### **Deploy Web**
1. Configure um servidor web (Apache, Nginx)
2. Aponte para a pasta `frontend/`
3. Configure proxy reverso para API Flask
4. Configure SSL para PWA em produção

### **Deploy na Nuvem**
- **Frontend**: Netlify, Vercel, GitHub Pages
- **Backend**: Heroku, Railway, DigitalOcean
- **Banco**: PostgreSQL, MongoDB Atlas

**Se este projeto te ajudou, considere dar uma estrela!**
