-- Remove banco se existir
IF DB_ID('SoftwareProduct') IS NOT NULL
BEGIN
    ALTER DATABASE SoftwareProduct SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE SoftwareProduct;
END
GO


-- Criar banco
CREATE DATABASE SoftwareProduct
GO

USE SoftwareProduct;
GO

PRINT '✅ Banco SoftwareProduct criado!';