// public/assets/js/config.js

/* ===========================
   DETECÇÃO DE AMBIENTE
=========================== */
// Se porta 3000 = Node.js | Se porta 5500 = Live Server
const API_BASE_URL =
  window.location.port === '3000'
    ? `${window.location.origin}/api`
    : 'http://127.0.0.1:3000/api';

/* ===========================
   CONFIGURAÇÕES GLOBAIS
=========================== */
const CONFIG = {
  api: {
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' },
  },
  auth: {
    sessionKey: 'usuario',
    tokenExpiry: 24 * 60 * 60 * 1000, // 24 horas em ms
  },
  validation: {
    minPasswordLength: 6,
    emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  messages: {
    networkError:       'Erro de conexão. Verifique sua internet.',
    serverError:        'Erro interno do servidor. Tente novamente.',
    sessionExpired:     'Sessão expirada. Faça login novamente.',
    invalidCredentials: 'Email ou senha inválidos.',
  },
};

/* ===========================
   HELPER DE REQUISIÇÕES HTTP
=========================== */
const apiRequest = async (endpoint, options = {}) => {
  const url = `${CONFIG.api.baseURL}${endpoint}`;

  const defaultOptions = {
    method: 'GET',
    headers: { ...CONFIG.api.headers },
  };

  const finalOptions = { ...defaultOptions, ...options };

  // Serializa body automaticamente
  if (finalOptions.body && typeof finalOptions.body === 'object') {
    finalOptions.body = JSON.stringify(finalOptions.body);
  }

  try {
    const response = await fetch(url, finalOptions);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.erro || `HTTP ${response.status}`);
    }

    return await response.json();

  } catch (error) {
    if (error.name === 'TypeError') {
      throw new Error(CONFIG.messages.networkError);
    }
    throw error;
  }
};

/* ===========================
   HELPERS DE VALIDAÇÃO
=========================== */
const isValidEmail = (email) =>
  CONFIG.validation.emailRegex.test(email);

const isValidPassword = (password) =>
  password && password.length >= CONFIG.validation.minPasswordLength;

/* ===========================
   EXPORTAR GLOBALMENTE
=========================== */
window.CONFIG    = CONFIG;
window.apiRequest     = apiRequest;
window.isValidEmail   = isValidEmail;
window.isValidPassword = isValidPassword;