/* BẢN SẮC Ecommerce - Microsoft SQL Server schema
   Chạy file này bằng SSMS với tài khoản có quyền CREATE DATABASE. */

IF DB_ID(N'bansacdb') IS NULL
BEGIN
    CREATE DATABASE bansacdb;
END;
GO

USE bansacdb;
GO

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
SET XACT_ABORT ON;
GO

/* Xóa object theo thứ tự phụ thuộc để script có thể chạy lại ở môi trường development. */
DROP VIEW IF EXISTS dbo.vw_ProductCatalog;
DROP VIEW IF EXISTS dbo.vw_OrderSummary;
DROP TABLE IF EXISTS dbo.AuditLogs;
DROP TABLE IF EXISTS dbo.SupportRequests;
DROP TABLE IF EXISTS dbo.NewsletterSubscribers;
DROP TABLE IF EXISTS dbo.PaymentTransactions;
DROP TABLE IF EXISTS dbo.OrderStatusHistory;
DROP TABLE IF EXISTS dbo.OrderItems;
DROP TABLE IF EXISTS dbo.PromotionUsages;
DROP TABLE IF EXISTS dbo.Orders;
DROP TABLE IF EXISTS dbo.Promotions;
DROP TABLE IF EXISTS dbo.CartItems;
DROP TABLE IF EXISTS dbo.Carts;
DROP TABLE IF EXISTS dbo.ProductImages;
DROP TABLE IF EXISTS dbo.ProductVariants;
DROP TABLE IF EXISTS dbo.Sizes;
DROP TABLE IF EXISTS dbo.Colors;
DROP TABLE IF EXISTS dbo.Products;
DROP TABLE IF EXISTS dbo.Categories;
DROP TABLE IF EXISTS dbo.PasswordResetTokens;
DROP TABLE IF EXISTS dbo.AuthSessions;
DROP TABLE IF EXISTS dbo.UserAddresses;
DROP TABLE IF EXISTS dbo.Users;
DROP TABLE IF EXISTS dbo.Roles;
GO

CREATE TABLE dbo.Roles (
    RoleId          TINYINT IDENTITY(1,1) PRIMARY KEY,
    RoleCode        VARCHAR(30) NOT NULL UNIQUE,
    RoleName        NVARCHAR(80) NOT NULL,
    Description     NVARCHAR(255) NULL,
    CreatedAt       DATETIME2(0) NOT NULL CONSTRAINT DF_Roles_CreatedAt DEFAULT SYSUTCDATETIME()
);
GO

CREATE TABLE dbo.Users (
    UserId          UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_Users PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    RoleId          TINYINT NOT NULL,
    FullName        NVARCHAR(100) NOT NULL,
    Email           VARCHAR(255) NOT NULL,
    Phone           VARCHAR(20) NULL,
    PasswordHash    VARCHAR(255) NOT NULL,
    AvatarUrl       NVARCHAR(1000) NULL,
    DateOfBirth     DATE NULL,
    Gender          VARCHAR(20) NULL,
    Status          VARCHAR(20) NOT NULL CONSTRAINT DF_Users_Status DEFAULT 'active',
    EmailVerifiedAt DATETIME2(0) NULL,
    LastLoginAt     DATETIME2(0) NULL,
    CreatedAt       DATETIME2(0) NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt       DATETIME2(0) NOT NULL CONSTRAINT DF_Users_UpdatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Users_Roles FOREIGN KEY (RoleId) REFERENCES dbo.Roles(RoleId),
    CONSTRAINT CK_Users_Status CHECK (Status IN ('active','locked','disabled')),
    CONSTRAINT CK_Users_Gender CHECK (Gender IS NULL OR Gender IN ('male','female','other'))
);
GO
CREATE UNIQUE INDEX UX_Users_Email ON dbo.Users(Email);
CREATE UNIQUE INDEX UX_Users_Phone ON dbo.Users(Phone) WHERE Phone IS NOT NULL;
CREATE INDEX IX_Users_Role_Status ON dbo.Users(RoleId, Status);
GO

CREATE TABLE dbo.UserAddresses (
    AddressId       BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserId          UNIQUEIDENTIFIER NOT NULL,
    RecipientName   NVARCHAR(100) NOT NULL,
    RecipientPhone  VARCHAR(20) NOT NULL,
    AddressLine     NVARCHAR(255) NOT NULL,
    Ward            NVARCHAR(100) NULL,
    District        NVARCHAR(100) NOT NULL,
    City            NVARCHAR(100) NOT NULL,
    PostalCode      VARCHAR(20) NULL,
    IsDefault       BIT NOT NULL CONSTRAINT DF_UserAddresses_Default DEFAULT 0,
    CreatedAt       DATETIME2(0) NOT NULL CONSTRAINT DF_UserAddresses_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt       DATETIME2(0) NOT NULL CONSTRAINT DF_UserAddresses_UpdatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_UserAddresses_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId) ON DELETE CASCADE
);
GO
CREATE INDEX IX_UserAddresses_UserId ON dbo.UserAddresses(UserId);
CREATE UNIQUE INDEX UX_UserAddresses_OneDefault ON dbo.UserAddresses(UserId) WHERE IsDefault = 1;
GO

/* Token thuần không được lưu trong DB; chỉ lưu SHA-256 hex dài 64 ký tự. */
CREATE TABLE dbo.AuthSessions (
    SessionId       UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    UserId          UNIQUEIDENTIFIER NOT NULL,
    TokenHash       CHAR(64) NOT NULL,
    IpAddress       VARCHAR(45) NULL,
    UserAgent       NVARCHAR(500) NULL,
    ExpiresAt       DATETIME2(0) NOT NULL,
    RevokedAt       DATETIME2(0) NULL,
    CreatedAt       DATETIME2(0) NOT NULL CONSTRAINT DF_AuthSessions_CreatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_AuthSessions_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId) ON DELETE CASCADE
);
GO
CREATE UNIQUE INDEX UX_AuthSessions_TokenHash ON dbo.AuthSessions(TokenHash);
CREATE INDEX IX_AuthSessions_User_Expires ON dbo.AuthSessions(UserId, ExpiresAt) INCLUDE (RevokedAt);
GO

CREATE TABLE dbo.PasswordResetTokens (
    ResetTokenId    BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserId          UNIQUEIDENTIFIER NOT NULL,
    TokenHash       CHAR(64) NOT NULL,
    ExpiresAt       DATETIME2(0) NOT NULL,
    UsedAt          DATETIME2(0) NULL,
    CreatedAt       DATETIME2(0) NOT NULL CONSTRAINT DF_ResetTokens_CreatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_ResetTokens_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId) ON DELETE CASCADE
);
GO
CREATE UNIQUE INDEX UX_PasswordResetTokens_Hash ON dbo.PasswordResetTokens(TokenHash);
GO

CREATE TABLE dbo.Categories (
    CategoryId      INT IDENTITY(1,1) PRIMARY KEY,
    ParentId        INT NULL,
    CategoryCode    VARCHAR(50) NOT NULL UNIQUE,
    CategoryName    NVARCHAR(100) NOT NULL,
    Slug            VARCHAR(120) NOT NULL UNIQUE,
    Description     NVARCHAR(500) NULL,
    DisplayOrder    INT NOT NULL CONSTRAINT DF_Categories_Order DEFAULT 0,
    IsActive        BIT NOT NULL CONSTRAINT DF_Categories_Active DEFAULT 1,
    CreatedAt       DATETIME2(0) NOT NULL CONSTRAINT DF_Categories_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt       DATETIME2(0) NOT NULL CONSTRAINT DF_Categories_UpdatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Categories_Parent FOREIGN KEY (ParentId) REFERENCES dbo.Categories(CategoryId)
);
GO

CREATE TABLE dbo.Products (
    ProductId       BIGINT IDENTITY(1,1) PRIMARY KEY,
    CategoryId      INT NOT NULL,
    ProductName     NVARCHAR(180) NOT NULL,
    Slug            VARCHAR(220) NOT NULL,
    ShortDescription NVARCHAR(500) NULL,
    Description     NVARCHAR(MAX) NULL,
    Gender          VARCHAR(20) NOT NULL CONSTRAINT DF_Products_Gender DEFAULT 'unisex',
    ProductType     VARCHAR(50) NULL,
    Badge           NVARCHAR(50) NULL,
    BasePrice       DECIMAL(19,2) NOT NULL,
    CompareAtPrice  DECIMAL(19,2) NULL,
    Status          VARCHAR(20) NOT NULL CONSTRAINT DF_Products_Status DEFAULT 'draft',
    IsFeatured      BIT NOT NULL CONSTRAINT DF_Products_Featured DEFAULT 0,
    CreatedAt       DATETIME2(0) NOT NULL CONSTRAINT DF_Products_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt       DATETIME2(0) NOT NULL CONSTRAINT DF_Products_UpdatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Products_Categories FOREIGN KEY (CategoryId) REFERENCES dbo.Categories(CategoryId),
    CONSTRAINT UX_Products_Slug UNIQUE (Slug),
    CONSTRAINT CK_Products_Gender CHECK (Gender IN ('men','women','unisex')),
    CONSTRAINT CK_Products_Status CHECK (Status IN ('draft','active','hidden','deleted')),
    CONSTRAINT CK_Products_Prices CHECK (BasePrice >= 0 AND (CompareAtPrice IS NULL OR CompareAtPrice >= BasePrice))
);
GO
CREATE INDEX IX_Products_Category_Status ON dbo.Products(CategoryId, Status);
CREATE INDEX IX_Products_Gender_Status ON dbo.Products(Gender, Status);
CREATE INDEX IX_Products_Featured ON dbo.Products(IsFeatured, Status) INCLUDE (ProductName, BasePrice);
GO

CREATE TABLE dbo.Colors (
    ColorId         INT IDENTITY(1,1) PRIMARY KEY,
    ColorCode       VARCHAR(30) NOT NULL UNIQUE,
    ColorName       NVARCHAR(80) NOT NULL,
    HexCode         CHAR(7) NULL,
    CONSTRAINT CK_Colors_Hex CHECK (HexCode IS NULL OR HexCode LIKE '#______')
);
GO

CREATE TABLE dbo.Sizes (
    SizeId          INT IDENTITY(1,1) PRIMARY KEY,
    SizeCode        VARCHAR(20) NOT NULL UNIQUE,
    SizeName        NVARCHAR(50) NOT NULL,
    DisplayOrder    INT NOT NULL CONSTRAINT DF_Sizes_Order DEFAULT 0
);
GO

CREATE TABLE dbo.ProductVariants (
    VariantId       BIGINT IDENTITY(1,1) PRIMARY KEY,
    ProductId       BIGINT NOT NULL,
    ColorId         INT NULL,
    SizeId          INT NULL,
    Sku             VARCHAR(80) NOT NULL,
    PriceOverride   DECIMAL(19,2) NULL,
    StockQuantity   INT NOT NULL CONSTRAINT DF_Variants_Stock DEFAULT 0,
    ReservedQuantity INT NOT NULL CONSTRAINT DF_Variants_Reserved DEFAULT 0,
    Status          VARCHAR(20) NOT NULL CONSTRAINT DF_Variants_Status DEFAULT 'active',
    CreatedAt       DATETIME2(0) NOT NULL CONSTRAINT DF_Variants_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt       DATETIME2(0) NOT NULL CONSTRAINT DF_Variants_UpdatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Variants_Products FOREIGN KEY (ProductId) REFERENCES dbo.Products(ProductId) ON DELETE CASCADE,
    CONSTRAINT FK_Variants_Colors FOREIGN KEY (ColorId) REFERENCES dbo.Colors(ColorId),
    CONSTRAINT FK_Variants_Sizes FOREIGN KEY (SizeId) REFERENCES dbo.Sizes(SizeId),
    CONSTRAINT UX_Variants_Sku UNIQUE (Sku),
    CONSTRAINT UX_Variants_Combination UNIQUE (ProductId, ColorId, SizeId),
    CONSTRAINT CK_Variants_Stock CHECK (StockQuantity >= 0 AND ReservedQuantity >= 0 AND ReservedQuantity <= StockQuantity),
    CONSTRAINT CK_Variants_Status CHECK (Status IN ('active','hidden','out_of_stock')),
    CONSTRAINT CK_Variants_Price CHECK (PriceOverride IS NULL OR PriceOverride >= 0)
);
GO
CREATE INDEX IX_Variants_Product_Status ON dbo.ProductVariants(ProductId, Status);
CREATE INDEX IX_Variants_LowStock ON dbo.ProductVariants(StockQuantity) INCLUDE (ProductId, Sku, ReservedQuantity);
GO

CREATE TABLE dbo.ProductImages (
    ImageId         BIGINT IDENTITY(1,1) PRIMARY KEY,
    ProductId       BIGINT NOT NULL,
    VariantId       BIGINT NULL,
    ImageUrl        NVARCHAR(1000) NOT NULL,
    AltText         NVARCHAR(255) NULL,
    DisplayOrder    INT NOT NULL CONSTRAINT DF_ProductImages_Order DEFAULT 0,
    IsPrimary       BIT NOT NULL CONSTRAINT DF_ProductImages_Primary DEFAULT 0,
    CONSTRAINT FK_ProductImages_Products FOREIGN KEY (ProductId) REFERENCES dbo.Products(ProductId) ON DELETE CASCADE,
    CONSTRAINT FK_ProductImages_Variants FOREIGN KEY (VariantId) REFERENCES dbo.ProductVariants(VariantId)
);
GO
CREATE INDEX IX_ProductImages_Product ON dbo.ProductImages(ProductId, DisplayOrder);
CREATE UNIQUE INDEX UX_ProductImages_Primary ON dbo.ProductImages(ProductId) WHERE IsPrimary = 1;
GO

CREATE TABLE dbo.Carts (
    CartId          UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    UserId          UNIQUEIDENTIFIER NULL,
    GuestToken      UNIQUEIDENTIFIER NULL,
    Status          VARCHAR(20) NOT NULL CONSTRAINT DF_Carts_Status DEFAULT 'active',
    ExpiresAt       DATETIME2(0) NULL,
    CreatedAt       DATETIME2(0) NOT NULL CONSTRAINT DF_Carts_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt       DATETIME2(0) NOT NULL CONSTRAINT DF_Carts_UpdatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Carts_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId),
    CONSTRAINT CK_Carts_Owner CHECK ((UserId IS NOT NULL AND GuestToken IS NULL) OR (UserId IS NULL AND GuestToken IS NOT NULL)),
    CONSTRAINT CK_Carts_Status CHECK (Status IN ('active','converted','abandoned'))
);
GO
CREATE UNIQUE INDEX UX_Carts_ActiveUser ON dbo.Carts(UserId) WHERE UserId IS NOT NULL AND Status = 'active';
CREATE UNIQUE INDEX UX_Carts_GuestToken ON dbo.Carts(GuestToken) WHERE GuestToken IS NOT NULL;
GO

CREATE TABLE dbo.CartItems (
    CartItemId      BIGINT IDENTITY(1,1) PRIMARY KEY,
    CartId          UNIQUEIDENTIFIER NOT NULL,
    VariantId       BIGINT NOT NULL,
    Quantity        INT NOT NULL,
    CreatedAt       DATETIME2(0) NOT NULL CONSTRAINT DF_CartItems_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt       DATETIME2(0) NOT NULL CONSTRAINT DF_CartItems_UpdatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_CartItems_Carts FOREIGN KEY (CartId) REFERENCES dbo.Carts(CartId) ON DELETE CASCADE,
    CONSTRAINT FK_CartItems_Variants FOREIGN KEY (VariantId) REFERENCES dbo.ProductVariants(VariantId),
    CONSTRAINT UX_CartItems_Line UNIQUE (CartId, VariantId),
    CONSTRAINT CK_CartItems_Quantity CHECK (Quantity BETWEEN 1 AND 20)
);
GO

CREATE TABLE dbo.Promotions (
    PromotionId     BIGINT IDENTITY(1,1) PRIMARY KEY,
    PromotionCode   VARCHAR(50) NOT NULL UNIQUE,
    PromotionName   NVARCHAR(150) NOT NULL,
    DiscountType    VARCHAR(20) NOT NULL,
    DiscountValue   DECIMAL(19,2) NOT NULL,
    MinOrderValue   DECIMAL(19,2) NOT NULL CONSTRAINT DF_Promotions_Min DEFAULT 0,
    MaxDiscountValue DECIMAL(19,2) NULL,
    UsageLimit      INT NULL,
    UsagePerUser    INT NULL,
    StartsAt        DATETIME2(0) NOT NULL,
    EndsAt          DATETIME2(0) NULL,
    IsActive        BIT NOT NULL CONSTRAINT DF_Promotions_Active DEFAULT 1,
    CreatedAt       DATETIME2(0) NOT NULL CONSTRAINT DF_Promotions_CreatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_Promotions_Type CHECK (DiscountType IN ('percent','fixed','shipping')),
    CONSTRAINT CK_Promotions_Value CHECK (DiscountValue >= 0),
    CONSTRAINT CK_Promotions_Dates CHECK (EndsAt IS NULL OR EndsAt > StartsAt)
);
GO

CREATE TABLE dbo.PromotionUsages (
    PromotionUsageId BIGINT IDENTITY(1,1) PRIMARY KEY,
    PromotionId     BIGINT NOT NULL,
    UserId          UNIQUEIDENTIFIER NULL,
    OrderId         BIGINT NULL,
    DiscountAmount  DECIMAL(19,2) NOT NULL,
    UsedAt          DATETIME2(0) NOT NULL CONSTRAINT DF_PromotionUsages_UsedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_PromotionUsages_Promotions FOREIGN KEY (PromotionId) REFERENCES dbo.Promotions(PromotionId),
    CONSTRAINT FK_PromotionUsages_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId)
);
GO

CREATE TABLE dbo.Orders (
    OrderId         BIGINT IDENTITY(1,1) PRIMARY KEY,
    OrderNumber     VARCHAR(30) NOT NULL UNIQUE,
    UserId          UNIQUEIDENTIFIER NULL,
    PromotionId     BIGINT NULL,
    CustomerName    NVARCHAR(100) NOT NULL,
    CustomerEmail   VARCHAR(255) NOT NULL,
    CustomerPhone   VARCHAR(20) NOT NULL,
    ShippingAddress NVARCHAR(255) NOT NULL,
    ShippingWard    NVARCHAR(100) NULL,
    ShippingDistrict NVARCHAR(100) NOT NULL,
    ShippingCity    NVARCHAR(100) NOT NULL,
    CustomerNote    NVARCHAR(500) NULL,
    ShippingMethod  VARCHAR(20) NOT NULL,
    PaymentMethod   VARCHAR(20) NOT NULL,
    OrderStatus     VARCHAR(20) NOT NULL CONSTRAINT DF_Orders_Status DEFAULT 'pending',
    PaymentStatus   VARCHAR(20) NOT NULL CONSTRAINT DF_Orders_PaymentStatus DEFAULT 'unpaid',
    SubtotalAmount  DECIMAL(19,2) NOT NULL,
    DiscountAmount  DECIMAL(19,2) NOT NULL CONSTRAINT DF_Orders_Discount DEFAULT 0,
    ShippingAmount  DECIMAL(19,2) NOT NULL CONSTRAINT DF_Orders_Shipping DEFAULT 0,
    TotalAmount     AS (SubtotalAmount - DiscountAmount + ShippingAmount) PERSISTED,
    PlacedAt        DATETIME2(0) NOT NULL CONSTRAINT DF_Orders_PlacedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt       DATETIME2(0) NOT NULL CONSTRAINT DF_Orders_UpdatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Orders_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId),
    CONSTRAINT FK_Orders_Promotions FOREIGN KEY (PromotionId) REFERENCES dbo.Promotions(PromotionId),
    CONSTRAINT CK_Orders_Status CHECK (OrderStatus IN ('pending','confirmed','shipping','completed','cancelled','returned')),
    CONSTRAINT CK_Orders_PaymentStatus CHECK (PaymentStatus IN ('unpaid','pending','paid','failed','refunded')),
    CONSTRAINT CK_Orders_ShippingMethod CHECK (ShippingMethod IN ('standard','express')),
    CONSTRAINT CK_Orders_PaymentMethod CHECK (PaymentMethod IN ('cod','bank','card')),
    CONSTRAINT CK_Orders_Amounts CHECK (SubtotalAmount >= 0 AND DiscountAmount >= 0 AND ShippingAmount >= 0 AND DiscountAmount <= SubtotalAmount)
);
GO
CREATE INDEX IX_Orders_User_PlacedAt ON dbo.Orders(UserId, PlacedAt DESC);
CREATE INDEX IX_Orders_Status_PlacedAt ON dbo.Orders(OrderStatus, PlacedAt DESC);
CREATE INDEX IX_Orders_Email ON dbo.Orders(CustomerEmail);
GO

/* Snapshot dữ liệu sản phẩm để đơn cũ không thay đổi khi sản phẩm được sửa. */
CREATE TABLE dbo.OrderItems (
    OrderItemId     BIGINT IDENTITY(1,1) PRIMARY KEY,
    OrderId         BIGINT NOT NULL,
    ProductId       BIGINT NULL,
    VariantId       BIGINT NULL,
    ProductName     NVARCHAR(180) NOT NULL,
    Sku             VARCHAR(80) NOT NULL,
    ColorName       NVARCHAR(80) NULL,
    SizeName        NVARCHAR(50) NULL,
    ImageUrl        NVARCHAR(1000) NULL,
    UnitPrice       DECIMAL(19,2) NOT NULL,
    Quantity        INT NOT NULL,
    LineTotal       AS (UnitPrice * Quantity) PERSISTED,
    CONSTRAINT FK_OrderItems_Orders FOREIGN KEY (OrderId) REFERENCES dbo.Orders(OrderId) ON DELETE CASCADE,
    CONSTRAINT FK_OrderItems_Products FOREIGN KEY (ProductId) REFERENCES dbo.Products(ProductId),
    CONSTRAINT FK_OrderItems_Variants FOREIGN KEY (VariantId) REFERENCES dbo.ProductVariants(VariantId),
    CONSTRAINT CK_OrderItems_Values CHECK (UnitPrice >= 0 AND Quantity BETWEEN 1 AND 20)
);
GO
CREATE INDEX IX_OrderItems_OrderId ON dbo.OrderItems(OrderId);
GO

CREATE TABLE dbo.OrderStatusHistory (
    HistoryId       BIGINT IDENTITY(1,1) PRIMARY KEY,
    OrderId         BIGINT NOT NULL,
    ChangedByUserId UNIQUEIDENTIFIER NULL,
    OldStatus       VARCHAR(20) NULL,
    NewStatus       VARCHAR(20) NOT NULL,
    Note            NVARCHAR(500) NULL,
    CreatedAt       DATETIME2(0) NOT NULL CONSTRAINT DF_OrderHistory_CreatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_OrderHistory_Orders FOREIGN KEY (OrderId) REFERENCES dbo.Orders(OrderId) ON DELETE CASCADE,
    CONSTRAINT FK_OrderHistory_Users FOREIGN KEY (ChangedByUserId) REFERENCES dbo.Users(UserId)
);
GO

/* Không lưu số thẻ/CVV. Chỉ lưu mã giao dịch do cổng thanh toán trả về. */
CREATE TABLE dbo.PaymentTransactions (
    PaymentTransactionId BIGINT IDENTITY(1,1) PRIMARY KEY,
    OrderId         BIGINT NOT NULL,
    Provider        VARCHAR(50) NOT NULL,
    ProviderTransactionId VARCHAR(150) NULL,
    Amount          DECIMAL(19,2) NOT NULL,
    CurrencyCode    CHAR(3) NOT NULL CONSTRAINT DF_Payments_Currency DEFAULT 'VND',
    Status          VARCHAR(20) NOT NULL,
    ResponseCode    VARCHAR(50) NULL,
    MetadataJson    NVARCHAR(MAX) NULL,
    CreatedAt       DATETIME2(0) NOT NULL CONSTRAINT DF_Payments_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt       DATETIME2(0) NOT NULL CONSTRAINT DF_Payments_UpdatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Payments_Orders FOREIGN KEY (OrderId) REFERENCES dbo.Orders(OrderId),
    CONSTRAINT CK_Payments_Status CHECK (Status IN ('pending','success','failed','refunded')),
    CONSTRAINT CK_Payments_Amount CHECK (Amount >= 0),
    CONSTRAINT CK_Payments_MetadataJson CHECK (MetadataJson IS NULL OR ISJSON(MetadataJson) = 1)
);
GO
CREATE INDEX IX_Payments_OrderId ON dbo.PaymentTransactions(OrderId, CreatedAt DESC);
CREATE UNIQUE INDEX UX_Payments_ProviderTransaction ON dbo.PaymentTransactions(Provider, ProviderTransactionId) WHERE ProviderTransactionId IS NOT NULL;
GO

/* Bổ sung FK bị trì hoãn vì PromotionUsages được tạo trước Orders. */
ALTER TABLE dbo.PromotionUsages ADD CONSTRAINT FK_PromotionUsages_Orders FOREIGN KEY (OrderId) REFERENCES dbo.Orders(OrderId);
CREATE UNIQUE INDEX UX_PromotionUsages_Order ON dbo.PromotionUsages(OrderId) WHERE OrderId IS NOT NULL;
GO

CREATE TABLE dbo.NewsletterSubscribers (
    SubscriberId    BIGINT IDENTITY(1,1) PRIMARY KEY,
    Email           VARCHAR(255) NOT NULL UNIQUE,
    Status          VARCHAR(20) NOT NULL CONSTRAINT DF_Newsletter_Status DEFAULT 'subscribed',
    SubscribedAt    DATETIME2(0) NOT NULL CONSTRAINT DF_Newsletter_At DEFAULT SYSUTCDATETIME(),
    UnsubscribedAt  DATETIME2(0) NULL,
    CONSTRAINT CK_Newsletter_Status CHECK (Status IN ('subscribed','unsubscribed'))
);
GO

CREATE TABLE dbo.SupportRequests (
    SupportRequestId BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserId          UNIQUEIDENTIFIER NULL,
    FullName        NVARCHAR(100) NOT NULL,
    Email           VARCHAR(255) NOT NULL,
    Topic           NVARCHAR(100) NOT NULL,
    Message         NVARCHAR(MAX) NOT NULL,
    Status          VARCHAR(20) NOT NULL CONSTRAINT DF_Support_Status DEFAULT 'new',
    AssignedToUserId UNIQUEIDENTIFIER NULL,
    CreatedAt       DATETIME2(0) NOT NULL CONSTRAINT DF_Support_CreatedAt DEFAULT SYSUTCDATETIME(),
    ResolvedAt      DATETIME2(0) NULL,
    CONSTRAINT FK_Support_User FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId),
    CONSTRAINT FK_Support_Assignee FOREIGN KEY (AssignedToUserId) REFERENCES dbo.Users(UserId),
    CONSTRAINT CK_Support_Status CHECK (Status IN ('new','in_progress','resolved','closed'))
);
GO
CREATE INDEX IX_Support_Status_CreatedAt ON dbo.SupportRequests(Status, CreatedAt DESC);
GO

CREATE TABLE dbo.AuditLogs (
    AuditLogId      BIGINT IDENTITY(1,1) PRIMARY KEY,
    ActorUserId     UNIQUEIDENTIFIER NULL,
    ActionCode      VARCHAR(80) NOT NULL,
    EntityType      VARCHAR(80) NOT NULL,
    EntityId        VARCHAR(100) NULL,
    OldValuesJson   NVARCHAR(MAX) NULL,
    NewValuesJson   NVARCHAR(MAX) NULL,
    IpAddress       VARCHAR(45) NULL,
    CreatedAt       DATETIME2(0) NOT NULL CONSTRAINT DF_AuditLogs_CreatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_AuditLogs_Users FOREIGN KEY (ActorUserId) REFERENCES dbo.Users(UserId),
    CONSTRAINT CK_AuditLogs_OldJson CHECK (OldValuesJson IS NULL OR ISJSON(OldValuesJson) = 1),
    CONSTRAINT CK_AuditLogs_NewJson CHECK (NewValuesJson IS NULL OR ISJSON(NewValuesJson) = 1)
);
GO
CREATE INDEX IX_AuditLogs_Entity ON dbo.AuditLogs(EntityType, EntityId, CreatedAt DESC);
CREATE INDEX IX_AuditLogs_Actor ON dbo.AuditLogs(ActorUserId, CreatedAt DESC);
GO

CREATE VIEW dbo.vw_ProductCatalog AS
SELECT
    p.ProductId, p.ProductName, p.Slug, p.ShortDescription, p.Gender,
    p.ProductType, p.Badge, p.BasePrice, p.CompareAtPrice,
    c.CategoryCode, c.CategoryName,
    pi.ImageUrl AS PrimaryImageUrl,
    SUM(CASE WHEN v.Status = 'active' THEN v.StockQuantity - v.ReservedQuantity ELSE 0 END) AS AvailableStock
FROM dbo.Products p
JOIN dbo.Categories c ON c.CategoryId = p.CategoryId
LEFT JOIN dbo.ProductVariants v ON v.ProductId = p.ProductId
LEFT JOIN dbo.ProductImages pi ON pi.ProductId = p.ProductId AND pi.IsPrimary = 1
WHERE p.Status = 'active'
GROUP BY p.ProductId, p.ProductName, p.Slug, p.ShortDescription, p.Gender,
         p.ProductType, p.Badge, p.BasePrice, p.CompareAtPrice,
         c.CategoryCode, c.CategoryName, pi.ImageUrl;
GO

CREATE VIEW dbo.vw_OrderSummary AS
SELECT
    o.OrderId, o.OrderNumber, o.UserId, o.CustomerName, o.CustomerEmail,
    o.CustomerPhone, o.OrderStatus, o.PaymentStatus, o.PaymentMethod,
    o.SubtotalAmount, o.DiscountAmount, o.ShippingAmount, o.TotalAmount,
    o.PlacedAt, COUNT(oi.OrderItemId) AS LineCount, SUM(oi.Quantity) AS ItemCount
FROM dbo.Orders o
JOIN dbo.OrderItems oi ON oi.OrderId = o.OrderId
GROUP BY o.OrderId, o.OrderNumber, o.UserId, o.CustomerName, o.CustomerEmail,
         o.CustomerPhone, o.OrderStatus, o.PaymentStatus, o.PaymentMethod,
         o.SubtotalAmount, o.DiscountAmount, o.ShippingAmount, o.TotalAmount, o.PlacedAt;
GO

PRINT N'Đã tạo schema bansacdb thành công.';
SELECT DB_NAME() AS CurrentDatabase, COUNT(*) AS TableCount
FROM sys.tables
WHERE is_ms_shipped = 0;
GO
