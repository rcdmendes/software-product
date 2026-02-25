USE SoftwareProduct;
GO

-- =========================================
-- 1) ZERAR TABELA E REINICIAR CONTADOR
-- =========================================
DELETE FROM dbo.Usuarios;
DBCC CHECKIDENT ('dbo.Usuarios', RESEED, 0);
GO

-- =========================================
-- 2) VERIFICAR SE ZEROU
-- =========================================
SELECT * FROM dbo.Usuarios;
GO

-- =========================================
-- 3) INSERIR REGISTRO DE TESTE
-- =========================================
INSERT INTO dbo.Usuarios (Login, Senha, NomeCompleto, Email, Ativo)
VALUES ('admin', 'Admin@123', 'Teste01', 'teste01@email.com', 1);
GO

-- =========================================
-- 4) ATUALIZAR (verifica trigger DataAtualizacao)
-- =========================================
UPDATE dbo.Usuarios
SET NomeCompleto = 'Administrador Atualizado'
WHERE Login = 'admin';
GO

-- =========================================
-- 5) SOFT DELETE (Ativo = 0, não apaga o registro)
-- =========================================
UPDATE dbo.Usuarios
SET Ativo = 0
WHERE Login = 'admin';
GO
