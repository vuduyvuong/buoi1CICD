USE bansacdb;
GO

CREATE OR ALTER PROCEDURE dbo.usp_ChangeOrderStatus
    @OrderId BIGINT,
    @NewStatus VARCHAR(20),
    @ChangedByUserId UNIQUEIDENTIFIER = NULL,
    @Note NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF @NewStatus NOT IN ('pending','confirmed','shipping','completed','cancelled','returned')
        THROW 50001, N'Trạng thái đơn hàng không hợp lệ.', 1;

    DECLARE @OldStatus VARCHAR(20);
    SELECT @OldStatus = OrderStatus FROM dbo.Orders WITH (UPDLOCK, ROWLOCK) WHERE OrderId = @OrderId;
    IF @OldStatus IS NULL THROW 50002, N'Không tìm thấy đơn hàng.', 1;

    BEGIN TRANSACTION;
    UPDATE dbo.Orders
    SET OrderStatus = @NewStatus, UpdatedAt = SYSUTCDATETIME()
    WHERE OrderId = @OrderId;

    INSERT INTO dbo.OrderStatusHistory (OrderId, ChangedByUserId, OldStatus, NewStatus, Note)
    VALUES (@OrderId, @ChangedByUserId, @OldStatus, @NewStatus, @Note);
    COMMIT TRANSACTION;
END;
GO

CREATE OR ALTER PROCEDURE dbo.usp_ReserveVariantStock
    @VariantId BIGINT,
    @Quantity INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF @Quantity <= 0 THROW 50003, N'Số lượng phải lớn hơn 0.', 1;

    UPDATE dbo.ProductVariants WITH (UPDLOCK, ROWLOCK)
    SET ReservedQuantity = ReservedQuantity + @Quantity,
        UpdatedAt = SYSUTCDATETIME()
    WHERE VariantId = @VariantId
      AND Status = 'active'
      AND StockQuantity - ReservedQuantity >= @Quantity;

    IF @@ROWCOUNT = 0 THROW 50004, N'Sản phẩm không đủ tồn kho.', 1;
END;
GO

CREATE OR ALTER PROCEDURE dbo.usp_CleanupExpiredAuthData
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM dbo.AuthSessions WHERE ExpiresAt < SYSUTCDATETIME() OR RevokedAt IS NOT NULL;
    DELETE FROM dbo.PasswordResetTokens WHERE ExpiresAt < SYSUTCDATETIME() OR UsedAt IS NOT NULL;
    DELETE FROM dbo.Carts WHERE UserId IS NULL AND ExpiresAt < SYSUTCDATETIME();
END;
GO

PRINT N'Đã tạo stored procedures thành công.';
GO
