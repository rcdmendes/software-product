// public/assets/js/login.js
document.addEventListener('DOMContentLoaded', () => {

  /* ===========================
     REDIRECIONAR SE JÁ LOGADO
  =========================== */
  if (sessionStorage.getItem('usuario')) {
    window.location.href = 'http://127.0.0.1:3000/pages/dashboard.html';
    return;
  }

  /* ===========================
     ELEMENTOS DO DOM
  =========================== */
  const form        = document.getElementById('formLogin');
  const inputEmail  = document.getElementById('email');
  const inputSenha  = document.getElementById('senha');
  const toggleSenha = document.getElementById('toggleSenha');
  const btnLogin    = form.querySelector('button[type="submit"]');

  /* ===========================
     TOGGLE DE SENHA
  =========================== */
  inputSenha.type = 'password';
  toggleSenha.innerHTML = `
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M4 4L20 20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `;

  toggleSenha.addEventListener('click', () => {
    inputSenha.type = inputSenha.type === 'password' ? 'text' : 'password';
  });

  /* ===========================
     EXIBIR MENSAGEM
  =========================== */
  const showMessage = (message, type = 'error') => {
    const existing = document.querySelector('.login-message');
    if (existing) existing.remove();

    const el = document.createElement('div');
    el.className = `login-message ${type}`;
    el.textContent = message;
    form.insertBefore(el, btnLogin);

    setTimeout(() => el.remove(), 5000);
  };

  /* ===========================
     ESTADO DE LOADING
  =========================== */
  const setLoadingState = (loading) => {
    btnLogin.disabled      = loading;
    btnLogin.textContent   = loading ? 'Entrando...' : 'Entrar';
    inputEmail.disabled    = loading;
    inputSenha.disabled    = loading;
  };

  /* ===========================
     SALVAR SESSÃO
  =========================== */
  const saveUserSession = (usuario) => {
    sessionStorage.setItem('usuario', JSON.stringify({
      usuario,
      loginTime:    Date.now(),
      lastActivity: Date.now(),
    }));
  };

  /* ===========================
     SUBMIT DO FORMULÁRIO
  =========================== */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = inputEmail.value.trim();
    const senha = inputSenha.value;

    if (!email || !senha) {
      showMessage('Usuário e senha são obrigatórios', 'error');
      return;
    }

    setLoadingState(true);

    try {
      const usuario = await apiRequest('/usuarios/login', {
        method: 'POST',
        body: { email, senha },
      });

      showMessage('Login realizado com sucesso!', 'success');
      saveUserSession(usuario);

      setTimeout(() => {
        window.location.href = 'http://127.0.0.1:3000/pages/dashboard.html';
      }, 1000);

    } catch (error) {
      if (error.message.includes('401') || error.message.includes('inválidos')) {
        showMessage('Usuário ou senha incorretos', 'error');
      } else if (error.message.includes('429')) {
        showMessage('Muitas tentativas. Aguarde alguns minutos.', 'error');
      } else {
        showMessage('Erro interno. Tente novamente.', 'error');
      }
    } finally {
      setLoadingState(false);
    }
  });

  /* ===========================
     FOCO AUTOMÁTICO
  =========================== */
  setTimeout(() => inputEmail.focus(), 300);

});