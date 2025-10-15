const CACHE_NAME = 'gerenciador-tarefas-v1.5.3.5.1'; // Sistema de auto-update implementado
const BUILD_VERSION = '20251013-2253'; // Atualizar a cada mudança no código
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/main.js',
  '/manifest.json',
  // Ícones do PWA
  '/icons/icon-16x16.png',
  '/icons/icon-32x32.png',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  // Google Fonts (serão cacheadas quando carregadas)
];

const API_CACHE_NAME = 'api-cache-v1.0.0';
const API_URL = 'http://localhost:5000';

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto, adicionando arquivos estáticos...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker instalado com sucesso!');
        // Força a ativação imediata
        return self.skipWaiting();
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker ativando...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Remove caches antigos
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker ativado!');
      // Assume controle imediatamente
      return self.clients.claim();
    })
  );
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
  const requestURL = new URL(event.request.url);
  
  // Estratégia para arquivos estáticos: Network First para desenvolvimento
  if (event.request.method === 'GET' && 
      (requestURL.origin === location.origin || 
       requestURL.hostname === 'fonts.googleapis.com' ||
       requestURL.hostname === 'fonts.gstatic.com')) {
    
    event.respondWith(
      // Tenta buscar da rede primeiro
      fetch(event.request)
        .then((response) => {
          // Se conseguiu da rede, atualiza o cache
          if (response && response.status === 200 && response.type === 'basic') {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
          }
          return response;
        })
        .catch(() => {
          // Se falhou na rede, usa o cache
          return caches.match(event.request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                console.log('📦 Servindo do cache (offline):', event.request.url);
                return cachedResponse;
              }
              
              // Se não tem no cache, retorna erro
              return new Response('Offline e sem cache disponível', {
                status: 503,
                statusText: 'Service Unavailable'
              });
            });
        })
    );
  }
  
  // Estratégia para API: Network First com fallback para cache
  else if (event.request.url.startsWith(API_URL)) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Se a requisição foi bem-sucedida, salva no cache
          if (response.status === 200) {
            const responseToCache = response.clone();
            caches.open(API_CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
          }
          return response;
        })
        .catch(() => {
          // Se não há internet, tenta buscar no cache
          return caches.match(event.request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              
              // Se não há cache, retorna resposta offline personalizada
              if (event.request.url.includes('/tasks')) {
                return new Response(
                  JSON.stringify({ 
                    message: 'Você está offline. Mostrando dados salvos.',
                    offline: true,
                    data: []
                  }),
                  {
                    status: 200,
                    statusText: 'OK',
                    headers: { 'Content-Type': 'application/json' }
                  }
                );
              }
            });
        })
    );
  }
});

// Sincronização em segundo plano (quando voltar online)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-tasks') {
    console.log('Sincronizando tarefas...');
    event.waitUntil(syncTasks());
  }
});

// Função para sincronizar tarefas pendentes
async function syncTasks() {
  try {
    // Aqui você pode implementar lógica para sincronizar 
    // tarefas que foram criadas/editadas offline
    console.log('Tarefas sincronizadas com sucesso!');
  } catch (error) {
    console.error('Erro ao sincronizar tarefas:', error);
  }
}

// Responde com informações de versão
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      cacheVersion: CACHE_NAME,
      buildVersion: BUILD_VERSION
    });
  }
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Notificações push (futuro)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nova notificação do Gerenciador de Tarefas',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('Gerenciador de Tarefas', options)
  );
});
