// src/repositories/usuarioRepository.js
const { getPool, sql } = require('../config/database');
const bcrypt = require('bcrypt');

class UsuarioRepository {

  /* ===========================
     LOGIN
  =========================== */
  async login(email, senha) {
    const pool = await getPool();

    const result = await pool
      .request()
      .input('email', sql.NVarChar, email)
      .query(`
        SELECT *
        FROM dbo.Usuarios
        WHERE (Email = @email OR Login = @email)
          AND Ativo = 1
      `);

    const usuario = result.recordset[0];
    if (!usuario) return null;

    // bcrypt.compare — valida sem descriptografar
    const senhaValida = await bcrypt.compare(senha, usuario.Senha);
    return senhaValida ? usuario : null;
  }

  /* ===========================
     LISTAR TODOS
  =========================== */
  async listarTodos() {
    const pool = await getPool();

    const result = await pool
      .request()
      .query(`
        SELECT UsuarioId, Login, NomeCompleto, Email, Ativo, DataCriacao
        FROM dbo.Usuarios
        WHERE Ativo = 1
      `);

    return result.recordset;
  }

  /* ===========================
     CRIAR
  =========================== */
  async criar(dados) {
    const pool = await getPool();

    // Hash da senha antes de gravar
    const senhaHash = await bcrypt.hash(dados.senha, 10);

    const result = await pool
      .request()
      .input('login', sql.NVarChar, dados.login)
      .input('senha', sql.NVarChar, senhaHash)
      .input('nomeCompleto', sql.NVarChar, dados.nomeCompleto)
      .input('email', sql.NVarChar, dados.email)
      .query(`
        INSERT INTO dbo.Usuarios (Login, Senha, NomeCompleto, Email, Ativo)
        OUTPUT
          INSERTED.UsuarioId,
          INSERTED.Login,
          INSERTED.NomeCompleto,
          INSERTED.Email,
          INSERTED.Ativo,
          INSERTED.DataCriacao
        VALUES (@login, @senha, @nomeCompleto, @email, 1)
      `);

    return result.recordset[0];
  }

  /* ===========================
     ATUALIZAR
  =========================== */
  async atualizar(id, dados) {
    const pool = await getPool();

    const senhaHash = await bcrypt.hash(dados.senha, 10);

    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .input('nomeCompleto', sql.NVarChar, dados.nomeCompleto)
      .input('email', sql.NVarChar, dados.email)
      .input('senha', sql.NVarChar, senhaHash)
      .query(`
        UPDATE dbo.Usuarios
        SET NomeCompleto = @nomeCompleto,
            Email        = @email,
            Senha        = @senha
        WHERE UsuarioId = @id
      `);

    return result.rowsAffected[0];
  }

  /* ===========================
     DELETAR (soft delete)
  =========================== */
  async deletar(id) {
    const pool = await getPool();

    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query(`
        UPDATE dbo.Usuarios
        SET Ativo = 0
        WHERE UsuarioId = @id
      `);

    return result.rowsAffected[0];
  }

  /* ===========================
     RESET DE SENHA
  =========================== */
  async resetSenha(email) {
    const pool = await getPool();

    // Verifica se usuário existe
    const user = await pool
      .request()
      .input('email', sql.NVarChar, email)
      .query(`
        SELECT UsuarioId
        FROM dbo.Usuarios
        WHERE Email = @email AND Ativo = 1
      `);

    if (!user.recordset[0]) return null;

    // Gera nova senha aleatória e faz hash
    const novaSenha = Math.random().toString(36).slice(-8);
    const senhaHash = await bcrypt.hash(novaSenha, 10);

    await pool
      .request()
      .input('email', sql.NVarChar, email)
      .input('senha', sql.NVarChar, senhaHash)
      .query(`
        UPDATE dbo.Usuarios
        SET Senha = @senha
        WHERE Email = @email
      `);

    // Gera protocolo de atendimento
    const ano = new Date().getFullYear();
    const protocolo = `TI-${ano}-${Math.floor(100000 + Math.random() * 900000)}`;

    console.log('RESET SENHA => Email:', email, '| Protocolo:', protocolo);

    return { protocolo };
  }
}

module.exports = new UsuarioRepository();