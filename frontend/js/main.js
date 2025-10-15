const API_URL = "http://localhost:5000"

function getStatusClass(status) {
  switch(status) {
    case 'Pendente': return 'status-pendente'
    case 'Concluída': return 'status-concluida'
    case 'Atrasada': return 'status-atrasada'
    default: return 'status-pendente'
  }
}

async function listarTarefasHj() {
  const response = await fetch(`${API_URL}/tasks/today`)
  const tarefas = await response.json()
  const listaTarefasHj = document.getElementById('tarefas-do-dia')
  listaTarefasHj.innerHTML = ''
  
  if (tarefas.length === 0) {
    const emptyMessage = document.createElement('div')
    emptyMessage.className = 'empty-message'
    emptyMessage.innerHTML = `
      <div class="empty-icon">📅</div>
      <div class="empty-text">Nenhuma tarefa para hoje</div>
    `
    listaTarefasHj.appendChild(emptyMessage)
    return
  }
  
  tarefas.forEach(tarefa => {
    const li = document.createElement('li')
    li.className = 'task-card'
    
    li.innerHTML = `
      <div class="task-header">
        <div class="task-title">${tarefa.nome}</div>
        <div class="task-status ${getStatusClass(tarefa.status)}">
          ${tarefa.status}
        </div>
      </div>
      
      <div class="task-description">${tarefa.descricao}</div>
      
      <div class="task-info">📅 Criada em: ${tarefa.data_criacao}</div>
      ${tarefa.prazo ? `<div class="task-info">⏰ Prazo: ${tarefa.prazo}</div>` : ''}
      ${tarefa.status === 'Concluída' && tarefa.data_conclusao ? `<div class="task-info">✅ Concluída em: ${tarefa.data_conclusao}</div>` : ''}
      
      <div class="task-actions">
        <button class="btn btn-editar" onclick="editarTarefa(${tarefa.id})">Editar</button>
        ${(tarefa.status === 'Pendente' || tarefa.status === 'Atrasada') ? `<button class="btn btn-concluir" onclick="concluirTarefa(${tarefa.id})">Concluir</button>` : ''}
        <button class="btn btn-excluir" onclick="deletarTarefa(${tarefa.id})">Excluir</button>
      </div>
    `
    listaTarefasHj.appendChild(li)
  })
}

async function listarTarefas(params) {
  const response = await fetch(`${API_URL}/tasks`)
  const tarefas = await response.json()
  const listaTarefas = document.getElementById('lista-tarefas')
  listaTarefas.innerHTML = ''
  tarefas.forEach(tarefa => {
    const li = document.createElement('li')
    li.className = 'task-card'
    
    li.innerHTML = `
      <div class="task-header">
        <div class="task-title">${tarefa.nome}</div>
        <div class="task-status ${getStatusClass(tarefa.status)}">
          ${tarefa.status}
        </div>
      </div>
      
      <div class="task-description">${tarefa.descricao}</div>
      
      <div class="task-info">📅 Criada em: ${tarefa.data_criacao}</div>
      ${(tarefa.status === 'Pendente' || tarefa.status === 'Atrasada') && tarefa.prazo ? `<div class="task-info">⏰ Prazo: ${tarefa.prazo}</div>` : ''}
      ${tarefa.status === 'Concluída' && tarefa.data_conclusao ? `<div class="task-info">✅ Concluída em: ${tarefa.data_conclusao}</div>` : ''}
      
      <div class="task-actions">
        <button class="btn btn-editar" onclick="editarTarefa(${tarefa.id})">Editar</button>
        ${(tarefa.status === 'Pendente' || tarefa.status === 'Atrasada') ? `<button class="btn btn-concluir" onclick="concluirTarefa(${tarefa.id})">Concluir</button>` : ''}
        <button class="btn btn-excluir" onclick="deletarTarefa(${tarefa.id})">Excluir</button>
      </div>
    `
    listaTarefas.appendChild(li)
  }) 
}

function toggleListarTarefas() {
  const listaTarefas = document.getElementById('lista-tarefas')
  const botao = document.querySelector('button[onclick="toggleListarTarefas()"]')
  
  if (listaTarefas.classList.contains('limited')) {
    // Expandir - mostrar todas as tarefas
    listaTarefas.classList.remove('limited')
    botao.textContent = 'Mostrar Menos'
  } else {
    // Limitar - mostrar apenas 2 linhas
    listaTarefas.classList.add('limited')
    botao.textContent = 'Mostrar Mais'
  }
}

function fecharFormulario() {
  const modal = document.getElementById('modal-nova-tarefa')
  if (modal) {
    modal.remove()
  }
}

async function concluirTarefa(taskId) {
  try {
    const response = await fetch(`${API_URL}/tasks/${taskId}/complete`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'}
    })
    
    if (!response.ok) {
      const error = await response.text()
      alert(`Erro ao concluir tarefa: ${error}`)
      return
    }
    
    alert('Tarefa concluída com sucesso!')
    listarTarefasHj()
    
    // Atualiza a lista completa
    listarTarefas()
  } catch (error) {
    alert(`Erro de conexão: ${error.message}`)
  }
}

async function editarTarefa(taskId) {
  // Verifica se já existe um formulário de edição aberto
  const formularioExistente = document.getElementById('modal-editar-tarefa')
  if (formularioExistente) {
    return // Não cria novo formulário se já existir um
  }

  try {
    // Busca os dados da tarefa
    const response = await fetch(`${API_URL}/tasks`)
    const tarefas = await response.json()
    const tarefa = tarefas.find(t => t.id === taskId)
    
    if (!tarefa) {
      alert('Tarefa não encontrada!')
      return
    }

    // Converte a data do formato brasileiro para o formato do input (YYYY-MM-DD)
    let prazoInput = ''
    if (tarefa.prazo) {
      const [dia, mes, ano] = tarefa.prazo.split('/')
      prazoInput = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`
    }

    // Obtém a data de hoje no fuso horário local para validação (apenas para tarefas pendentes)
    const agoraEdicao = new Date()
    const hoje = new Date(agoraEdicao.getTime() - agoraEdicao.getTimezoneOffset() * 60000).toISOString().split('T')[0]
    const minDate = tarefa.status === 'Pendente' ? `min='${hoje}'` : ''

    // Cria o modal overlay
    const modalOverlay = document.createElement('div')
    modalOverlay.id = 'modal-editar-tarefa'
    modalOverlay.className = 'modal-overlay'
    
    // Cria o formulário dentro do modal
    const form = document.createElement('form')
    form.id = 'form-editar-tarefa'
    form.innerHTML = `
    <button type='button' class='modal-close' onclick='fecharFormularioEdicao()'>&times;</button>
    <h3>Editar Tarefa</h3>
    <label>Nome: <input type='text' name='nome' value="${tarefa.nome}" required></label><br>
    <label>Descrição: <input type='text' name='descricao' value="${tarefa.descricao}" required></label><br>
    <label>Prazo: <input type='date' name='prazo' value="${prazoInput}" ${minDate}></label><br>
    <button type='submit'>Salvar Alterações</button>
    <button type='button' onclick='fecharFormularioEdicao()'>Cancelar</button>`
    
    modalOverlay.appendChild(form)
    document.body.appendChild(modalOverlay)
    
    // Fechar modal clicando no overlay
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        fecharFormularioEdicao()
      }
    })
    
    // Focar no primeiro campo
    setTimeout(() => {
      form.querySelector('input[name="nome"]').focus()
    }, 100)
    
    form.onsubmit = async (e) => {
      e.preventDefault()
      const formData = new FormData(form)
      const tarefaAtualizada = {
        nome: formData.get('nome'),
        descricao: formData.get('descricao'),
        prazo: formData.get('prazo') || null
      }
      
      try {
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
          method: 'PUT',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(tarefaAtualizada)
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          alert(`Erro ao atualizar tarefa: ${errorData.error || 'Erro desconhecido'}`)
          return
        }
        
        alert('Tarefa atualizada com sucesso!')
        listarTarefasHj()
        
        // Atualiza a lista completa
        listarTarefas()
      } catch (error) {
        alert(`Erro de conexão: ${error.message}`)
      }
      
      fecharFormularioEdicao()
    }
  } catch (error) {
    alert(`Erro ao carregar dados da tarefa: ${error.message}`)
  }
}

function fecharFormularioEdicao() {
  const modal = document.getElementById('modal-editar-tarefa')
  if (modal) {
    modal.remove()
  }
}

async function deletarTarefa(taskId) {
  if (!confirm('Tem certeza que deseja excluir esta tarefa?')) {
    return
  }
  
  try {
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
      method: 'DELETE'
    })
    
    if (!response.ok) {
      const error = await response.text()
      alert(`Erro ao excluir tarefa: ${error}`)
      return
    }
    
    alert('Tarefa excluída com sucesso!')
    listarTarefasHj()
    
    // Atualiza a lista completa
    listarTarefas()
  } catch (error) {
    alert(`Erro de conexão: ${error.message}`)
  }
}

async function criarTarefa(params) {
  // Verifica se já existe um formulário aberto
  const formularioExistente = document.getElementById('modal-nova-tarefa')
  if (formularioExistente) {
    return // Não cria novo formulário se já existir um
  }

  // Obtém a data de hoje no fuso horário local (Brasil)
  const agora = new Date()
  const hoje = new Date(agora.getTime() - agora.getTimezoneOffset() * 60000).toISOString().split('T')[0]
  
  // Cria o modal overlay
  const modalOverlay = document.createElement('div')
  modalOverlay.id = 'modal-nova-tarefa'
  modalOverlay.className = 'modal-overlay'
  
  // Cria o formulário dentro do modal
  const form = document.createElement('form')
  form.id = 'form-nova-tarefa'
  form.innerHTML = `
    <button type='button' class='modal-close' onclick='fecharFormulario()'>&times;</button>
    <h3>Nova Tarefa</h3>
    <label>Nome: <input type='text' name='nome' required></label><br>
    <label>Descrição: <input type='text' name='descricao' required></label><br>
    <label>Prazo: <input type='date' name='prazo' min='${hoje}'></label><br>
    <button type='submit'>Criar Tarefa</button>
    <button type='button' onclick='fecharFormulario()'>Cancelar</button>`
  
  modalOverlay.appendChild(form)
  document.body.appendChild(modalOverlay)
  
  // Fechar modal clicando no overlay
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      fecharFormulario()
    }
  })
  
  // Focar no primeiro campo
  setTimeout(() => {
    form.querySelector('input[name="nome"]').focus()
  }, 100)
    
    form.onsubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(form)
    const tarefa = {
      nome: formData.get('nome'),
      descricao: formData.get('descricao'),
      prazo: formData.get('prazo') ? formData.get('prazo').split('T')[0] : null
    }
    
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(tarefa)
      })
      
        if (!response.ok) {
          const errorData = await response.json()
          alert(`Erro ao criar tarefa: ${errorData.error || 'Erro desconhecido'}`)
          return
        }      alert('Tarefa criada com sucesso!')
      listarTarefasHj()
      // Atualiza a lista de todas as tarefas
      listarTarefas()
    } catch (error) {
      alert(`Erro de conexão: ${error.message}`)
    }
    
    fecharFormulario()
  }
}
// Inicialização
listarTarefasHj()
listarTarefas()

// Inicializar com visualização limitada e botão correto
document.addEventListener('DOMContentLoaded', () => {
  const listaTarefas = document.getElementById('lista-tarefas')
  const botao = document.querySelector('button[onclick="toggleListarTarefas()"]')
  
  listaTarefas.classList.add('limited')
  botao.textContent = 'Mostrar Mais'
})

setInterval(listarTarefasHj, 60000) // Atualiza a lista de tarefas do dia a cada minuto
setInterval(() => {
  // Só atualiza se não estiver em modo limitado ou se tiver poucas tarefas
  const listaTarefas = document.getElementById('lista-tarefas')
  if (!listaTarefas.classList.contains('limited') || listaTarefas.children.length <= 4) {
    listarTarefas()
  }
}, 60000) // Atualiza a lista completa a cada minuto

// ============== PWA SERVICE WORKER ==============

// Registra o Service Worker com sistema de auto-update
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ Service Worker registrado:', registration.scope);
      
      // Verifica por atualizações a cada 30 segundos
      setInterval(async () => {
        try {
          await registration.update();
          console.log('🔄 Verificando atualizações...');
        } catch (error) {
          console.log('Erro ao verificar atualizações:', error);
        }
      }, 30000);
      
      // Verifica por atualizações
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        console.log('🆕 Nova versão encontrada!');
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Nova versão disponível
            showUpdateNotification(newWorker);
          }
        });
      });
      
      // Escuta mensagens do service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'NEW_VERSION_READY') {
          showUpdateNotification();
        }
      });
      
    } catch (error) {
      console.log('❌ Falha ao registrar Service Worker:', error);
    }
  });
}

// Mostra notificação de atualização melhorada
function showUpdateNotification(newWorker = null) {
  // Remove notificação anterior se existir
  const existingNotification = document.getElementById('update-notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  const notification = document.createElement('div');
  notification.id = 'update-notification';
  notification.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(45deg, #2196F3, #1976D2);
      color: white;
      padding: 15px 20px;
      border-radius: 12px;
      box-shadow: 0 6px 20px rgba(33, 150, 243, 0.4);
      z-index: 10000;
      font-family: 'Poppins', sans-serif;
      max-width: 320px;
      animation: slideIn 0.3s ease-out;
    ">
      <div style="display: flex; align-items: center; margin-bottom: 8px;">
        <span style="font-size: 20px; margin-right: 8px;">�</span>
        <strong>Nova versão disponível!</strong>
      </div>
      <div style="font-size: 13px; margin-bottom: 12px; opacity: 0.9;">
        Clique para atualizar e ver as melhorias
      </div>
      <div style="display: flex; gap: 8px;">
        <button onclick="updateApp()" style="
          background: white;
          color: #1976D2;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          flex: 1;
        ">Atualizar</button>
        <button onclick="document.getElementById('update-notification').remove()" style="
          background: rgba(255,255,255,0.2);
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
        ">×</button>
      </div>
    </div>
  `;
  
  // Adiciona CSS de animação
  if (!document.getElementById('update-notification-styles')) {
    const styles = document.createElement('style');
    styles.id = 'update-notification-styles';
    styles.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(styles);
  }
  
  document.body.appendChild(notification);
  
  // Auto-remove após 15 segundos
  setTimeout(() => {
    if (document.getElementById('update-notification')) {
      document.getElementById('update-notification').remove();
    }
  }, 15000);
}

// Função para atualizar o app
function updateApp() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration().then((registration) => {
      if (registration && registration.waiting) {
        registration.waiting.postMessage({type: 'SKIP_WAITING'});
      }
    });
  }
  // Recarrega a página após um pequeno delay
  setTimeout(() => {
    window.location.reload();
  }, 500);
}

// Detecta quando está offline/online
window.addEventListener('online', () => {
  showConnectionStatus('🌐 Você está online!', '#4CAF50');
});

window.addEventListener('offline', () => {
  showConnectionStatus('📱 Modo offline ativado', '#ff9800');
});

function showConnectionStatus(message, color) {
  const notification = document.createElement('div');
  notification.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: ${color};
      color: white;
      padding: 10px 20px;
      border-radius: 25px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      font-family: 'Poppins', sans-serif;
      font-weight: 500;
    ">
      ${message}
    </div>
  `;
  document.body.appendChild(notification);
  
  // Remove após 3 segundos
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Botão de instalação do PWA
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  // Previne o prompt automático
  e.preventDefault();
  deferredPrompt = e;
  
  // Mostra botão de instalação personalizado
  showInstallButton();
});

function showInstallButton() {
  const installButton = document.createElement('button');
  installButton.innerHTML = '📱 Instalar App';
  installButton.className = 'btn-install';
  installButton.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: linear-gradient(45deg, #667eea, #764ba2);
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 25px;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    z-index: 10000;
    transition: all 0.3s ease;
  `;
  
  installButton.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('✅ PWA instalado!');
        showConnectionStatus('✅ App instalado com sucesso!', '#4CAF50');
      }
      
      deferredPrompt = null;
      installButton.remove();
    }
  });
  
  installButton.addEventListener('mouseenter', () => {
    installButton.style.transform = 'translateY(-2px)';
    installButton.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
  });
  
  installButton.addEventListener('mouseleave', () => {
    installButton.style.transform = 'translateY(0)';
    installButton.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
  });
  
  document.body.appendChild(installButton);
}

// ============== AUTO-RECONEXÃO E SINCRONIZAÇÃO ==============

let reconnectInterval;
let isReconnecting = false;

// Verifica conexão com backend
async function checkBackendConnection() {
  try {
    const response = await fetch(`${API_URL}/tasks`, { 
      method: 'HEAD',
      timeout: 5000 
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Inicia tentativas de reconexão
function startReconnection() {
  if (isReconnecting) return;
  
  isReconnecting = true;
  console.log('🔄 Iniciando tentativas de reconexão...');
  
  showConnectionStatus('🔄 Tentando reconectar...', '#ff9800');
  
  reconnectInterval = setInterval(async () => {
    const isOnline = await checkBackendConnection();
    
    if (isOnline) {
      console.log('✅ Reconectado com sucesso!');
      clearInterval(reconnectInterval);
      isReconnecting = false;
      
      showConnectionStatus('✅ Reconectado! Sincronizando...', '#4CAF50');
      
      // Recarrega os dados
      setTimeout(() => {
        listarTarefasHj();
        listarTarefas();
      }, 1000);
      
    } else {
      console.log('⏳ Ainda desconectado, tentando novamente...');
    }
  }, 10000); // Tenta reconectar a cada 10 segundos
}

// Para as tentativas de reconexão
function stopReconnection() {
  if (reconnectInterval) {
    clearInterval(reconnectInterval);
    reconnectInterval = null;
    isReconnecting = false;
  }
}

// Monitora status da conexão
async function monitorConnection() {
  const isOnline = await checkBackendConnection();
  
  if (!isOnline && !isReconnecting) {
    startReconnection();
  } else if (isOnline && isReconnecting) {
    stopReconnection();
  }
  
  return isOnline;
}

// Verifica conexão periodicamente
setInterval(monitorConnection, 30000); // Verifica a cada 30 segundos

// Verifica na inicialização
setTimeout(async () => {
  const isOnline = await checkBackendConnection();
  if (!isOnline) {
    showConnectionStatus('⚠️ Backend desconectado - Tentando reconectar...', '#ff9800');
    startReconnection();
  }
}, 2000);

// ============== NOTIFICAÇÃO DE STATUS APRIMORADA ==============

// Sobrescreve a função original para duração personalizada
function showConnectionStatus(message, color, duration = 3000) {
  // Remove notificação anterior se existir
  const existing = document.querySelector('.connection-status');
  if (existing) existing.remove();
  
  const notification = document.createElement('div');
  notification.className = 'connection-status';
  notification.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: ${color};
      color: white;
      padding: 12px 24px;
      border-radius: 25px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      font-family: 'Poppins', sans-serif;
      font-weight: 500;
      font-size: 14px;
      max-width: 90vw;
      text-align: center;
    ">
      ${message}
    </div>
  `;
  document.body.appendChild(notification);
  
  // Remove após duração especificada (exceto para status permanentes)
  if (duration > 0) {
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, duration);
  }
}