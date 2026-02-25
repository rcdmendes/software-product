// public/assets/js/dashboard.js
document.addEventListener('DOMContentLoaded', async () => {

  /* ===========================
     EXIBIR NOME DO USUÁRIO
  =========================== */
  const sessionData = sessionStorage.getItem('usuario');

  if (sessionData) {
    const { usuario } = JSON.parse(sessionData);
    document.getElementById('nomeUsuario').textContent =
      usuario.NomeCompleto || usuario.Login || 'Usuário';
  }

  /* ===========================
     CARREGAR ESTATÍSTICAS
  =========================== */
  try {
    const usuarios = await apiRequest('/usuarios');
    document.getElementById('totalUsuarios').textContent = usuarios.length;

  } catch (error) {
    document.getElementById('totalUsuarios').textContent = '0';
    console.error('Erro ao carregar usuários:', error);
  }

});