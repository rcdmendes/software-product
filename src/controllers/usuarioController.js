// src/controllers/usuarioController.js
const usuarioRepository = require('../repositories/usuarioRepository');

class UsuarioController {

  /* ===========================
     LOGIN
  =========================== */
  async login(req, res) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
      }

      const usuario = await usuarioRepository.login(email.trim(), senha);

      if (!usuario) {
        return res.status(401).json({ erro: 'Usuário ou senha inválidos' });
      }

      // Remove campo Senha antes de retornar
      const { Senha, ...usuarioSemSenha } = usuario;
      res.json(usuarioSemSenha);

    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  /* ===========================
     RESET DE SENHA
  =========================== */
  async resetSenha(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ erro: 'Email é obrigatório' });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ erro: 'Formato de email inválido' });
      }

      const resultado = await usuarioRepository.resetSenha(email.trim());

      if (!resultado) {
        return res.status(404).json({ erro: 'Usuário não encontrado' });
      }

      res.json({
        mensagem: 'Reset realizado com sucesso',
        protocolo: resultado.protocolo,
      });

    } catch (error) {
      console.error('Erro no reset:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  /* ===========================
     LISTAR TODOS
  =========================== */
  async listarTodos(req, res) {
    try {
      const usuarios = await usuarioRepository.listarTodos();
      res.json(usuarios);
    } catch (error) {
      console.error('Erro ao listar:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  /* ===========================
     CRIAR
  =========================== */
  async criar(req, res) {
    try {
      const { login, senha, nomeCompleto, email } = req.body;

      if (!login || !senha || !nomeCompleto || !email) {
        return res.status(400).json({ erro: 'Login, senha, nome completo e email são obrigatórios' });
      }

      if (senha.length < 6) {
        return res.status(400).json({ erro: 'Senha deve ter pelo menos 6 caracteres' });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ erro: 'Formato de email inválido' });
      }

      const dadosLimpos = {
        login: login.trim(),
        senha,
        nomeCompleto: nomeCompleto.trim(),
        email: email.trim().toLowerCase(),
      };

      const usuario = await usuarioRepository.criar(dadosLimpos);
      res.status(201).json(usuario);

    } catch (error) {
      if (error.message.includes('UNIQUE')) {
        return res.status(409).json({ erro: 'Login ou email já existem' });
      }
      console.error('Erro ao criar:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  /* ===========================
     ATUALIZAR
  =========================== */
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { nomeCompleto, email, senha } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({ erro: 'ID inválido' });
      }

      if (!nomeCompleto || !email || !senha) {
        return res.status(400).json({ erro: 'Nome completo, email e senha são obrigatórios' });
      }

      if (senha.length < 6) {
        return res.status(400).json({ erro: 'Senha deve ter pelo menos 6 caracteres' });
      }

      const resultado = await usuarioRepository.atualizar(id, {
        nomeCompleto: nomeCompleto.trim(),
        email: email.trim().toLowerCase(),
        senha,
      });

      if (resultado === 0) {
        return res.status(404).json({ erro: 'Usuário não encontrado' });
      }

      res.json({ mensagem: 'Usuário atualizado com sucesso' });

    } catch (error) {
      console.error('Erro ao atualizar:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  /* ===========================
     DELETAR (soft delete)
  =========================== */
  async deletar(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({ erro: 'ID inválido' });
      }

      const resultado = await usuarioRepository.deletar(id);

      if (resultado === 0) {
        return res.status(404).json({ erro: 'Usuário não encontrado' });
      }

      res.json({ mensagem: 'Usuário excluído com sucesso' });

    } catch (error) {
      console.error('Erro ao deletar:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }
}

module.exports = new UsuarioController();
