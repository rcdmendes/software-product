// public/assets/js/auth.js
document.addEventListener('DOMContentLoaded', () => {

  /* ===========================
     CONFIGURAÇÃO
  =========================== */
  const AUTH_CONFIG = {
    sessionKey:     'usuario',
    maxSessionTime: 24 * 60 * 60 * 1000, // 24 horas
    checkInterval:   5 * 60 * 1000,       // verifica a cada 5 min
  };

  /* ===========================
     RECUPERAR SESSÃO
  =========================== */
  const getUsuarioLogado = () => {
    try {
      const usuarioJson = sessionStorage.getItem(AUTH_CONFIG.sessionKey);
      if (!usuarioJson) return null;

      const sessionData = JSON.parse(usuarioJson);

      // Valida estrutura da sessão
      if (!sessionData.usuario || !sessionData.loginTime) {
        clearSession();
        return null;
      }

      // Valida expiração (24h)
      if (Date.now() - sessionData.loginTime > AUTH_CONFIG.maxSessionTime) {
        clearSession();
        return null;
      }

      return sessionData.usuario;

    } catch (error) {
      clearSession();
      return null;
    }
  };

  /* ===========================
     LIMPAR SESSÃO
  =========================== */
  const clearSession = () => {
    sessionStorage.removeItem(AUTH_CONFIG.sessionKey);
    localStorage.removeItem('usuarioLogado');
  };

  /* ===========================
     EXIBIR MENSAGEM
  =========================== */
  const showMessage = (message, type = 'error') => {
    const existingAlert = document.querySelector('.auth-alert');
    if (existingAlert) existingAlert.remove();

    const alert = document.createElement('div');
    alert.className = `auth-alert alert-${type}`;
    alert.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px;
      background: ${type === 'error' ? '#e74c3c' : '#2ecc71'};
      color: white;
      border-radius: 5px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      z-index: 9999;
      max-width: 300px;
    `;
    alert.textContent = message;
    document.body.appendChild(alert);
    setTimeout(() => alert.remove(), 4000);
  };

  /* ===========================
     REDIRECIONAR PARA LOGIN
  =========================== */
  const redirectToLogin = () => {
    if (!window.location.pathname.includes('login.html')) {
      window.location.href = 'http://127.0.0.1:3000/pages/login.html';
    }
  };

  /* ===========================
     VERIFICAR AUTENTICAÇÃO
  =========================== */
  const verificarAutenticacao = () => {
    const usuario = getUsuarioLogado();

    if (!usuario) {
      redirectToLogin();
      return false;
    }

    // Exibe nome no header
    const nomeEl = document.getElementById('nomeUsuario');
    if (nomeEl) {
      nomeEl.textContent = usuario.NomeCompleto || usuario.Login || 'Usuário';
    }

    return true;
  };

  /* ===========================
     LOGOUT
  =========================== */
  const logout = () => {
    try {
      clearSession();
      showMessage('Logout realizado com sucesso.', 'success');
      setTimeout(() => {
        window.location.href = 'http://127.0.0.1:3000/pages/login.html';
      }, 1500);
    } catch (error) {
      clearSession();
      window.location.href = 'http://127.0.0.1:3000/pages/login.html';
    }
  };

  /* ===========================
     INICIALIZAÇÃO
  =========================== */
  const currentPath = window.location.pathname;
  const isProtectedPage =
    currentPath.includes('dashboard.html') ||
    currentPath.includes('admin.html');

  if (isProtectedPage) {
    const isAuthenticated = verificarAutenticacao();

    // Verificação periódica a cada 5 minutos
    if (isAuthenticated) {
      setInterval(() => {
        if (!getUsuarioLogado()) {
          showMessage('Sessão perdida. Redirecionando...');
          setTimeout(redirectToLogin, 2000);
        }
      }, AUTH_CONFIG.checkInterval);
    }
  }

  /* ===========================
     BOTÃO SAIR
     (gerenciado aqui — não no dashboard.js)
  =========================== */
  const btnSair = document.getElementById('btnSair');
  if (btnSair) {
    btnSair.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('Deseja realmente sair do sistema?')) {
        logout();
      }
    });
  }

  /* ===========================
     DETECÇÃO DE LOGOUT EM OUTRA ABA
  =========================== */
  window.addEventListener('storage', (e) => {
    if (e.key === AUTH_CONFIG.sessionKey && !e.newValue && isProtectedPage) {
      showMessage('Sessão encerrada em outra aba.');
      setTimeout(redirectToLogin, 2000);
    }
  });

  /* ===========================
     EXPORTAR FUNÇÕES GLOBALMENTE
  =========================== */
  window.logout                = logout;
  window.getUsuarioLogado      = getUsuarioLogado;
  window.verificarAutenticacao = verificarAutenticacao;

});