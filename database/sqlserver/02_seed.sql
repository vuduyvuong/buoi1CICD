USE bansacdb;
GO
SET XACT_ABORT ON;
GO

BEGIN TRANSACTION;

INSERT INTO dbo.Roles (RoleCode, RoleName, Description)
VALUES
('customer', N'Khách hàng', N'Mua hàng và quản lý đơn của chính mình'),
('support', N'Chăm sóc khách hàng', N'Xem đơn và xử lý yêu cầu hỗ trợ'),
('warehouse', N'Nhân viên kho', N'Quản lý tồn kho và trạng thái giao hàng'),
('manager', N'Quản lý', N'Quản lý sản phẩm, khuyến mãi và đơn hàng'),
('admin', N'Quản trị viên', N'Toàn quyền hệ thống');

INSERT INTO dbo.Categories (CategoryCode, CategoryName, Slug, DisplayOrder)
VALUES
('clothes', N'Trang phục', 'trang-phuc', 1),
('accessories', N'Phụ kiện', 'phu-kien', 2);

INSERT INTO dbo.Colors (ColorCode, ColorName, HexCode)
VALUES
('brown', N'Nâu đất', '#8C6648'),
('cream', N'Be/Kem', '#E7DFD2'),
('black', N'Đen', '#222222'),
('navy', N'Xanh navy', '#243047'),
('gold', N'Ánh kim vàng', '#C5A467');

INSERT INTO dbo.Sizes (SizeCode, SizeName, DisplayOrder)
VALUES
('XS', 'XS', 1), ('S', 'S', 2), ('M', 'M', 3), ('L', 'L', 4), ('XL', 'XL', 5), ('ONE', N'Một cỡ', 6);

DECLARE @ClothesId INT = (SELECT CategoryId FROM dbo.Categories WHERE CategoryCode = 'clothes');
DECLARE @AccessoriesId INT = (SELECT CategoryId FROM dbo.Categories WHERE CategoryCode = 'accessories');

SET IDENTITY_INSERT dbo.Products ON;
INSERT INTO dbo.Products
    (ProductId, CategoryId, ProductName, Slug, ShortDescription, Gender, ProductType, Badge, BasePrice, Status, IsFeatured)
VALUES
(1, @ClothesId, N'Áo Sơ Mi Linen Nâu', 'ao-so-mi-linen-nau', N'Linen tự nhiên, phom suông thanh lịch', 'women', 'shirt', N'Mới', 1450000, 'active', 1),
(2, @ClothesId, N'Sơ Mi Lụa Cát', 'so-mi-lua-cat', N'Bề mặt mềm nhẹ, đường may tối giản', 'women', 'shirt', N'Độc quyền', 1690000, 'active', 0),
(3, @ClothesId, N'Blazer Cấu Trúc', 'blazer-cau-truc', N'Cầu vai sắc nét, tinh thần đương đại', 'women', 'blazer', N'Limited', 3290000, 'active', 0),
(4, @ClothesId, N'Áo Len Dệt Ấm', 'ao-len-det-am', N'Sợi len cao cấp cho những ngày se lạnh', 'women', 'knitwear', N'Bán chạy', 3850000, 'active', 1),
(5, @ClothesId, N'Đầm Midi Tĩnh Lặng', 'dam-midi-tinh-lang', N'Dáng rủ nữ tính cùng bảng màu trung tính', 'women', 'dress', NULL, 2890000, 'active', 0),
(6, @ClothesId, N'Áo Khoác Dạ Giao Mùa', 'ao-khoac-da-giao-mua', N'Kết cấu nhẹ, hoàn thiện thủ công', 'women', 'coat', NULL, 4590000, 'active', 0),
(7, @ClothesId, N'Sơ Mi Nam Essential', 'so-mi-nam-essential', N'Cotton thoáng mát, phom regular fit', 'men', 'shirt', N'Mới', 1590000, 'active', 1),
(8, @ClothesId, N'Áo Khoác Nam Studio', 'ao-khoac-nam-studio', N'Thiết kế đa lớp với chi tiết tinh giản', 'men', 'jacket', NULL, 3950000, 'active', 0),
(9, @ClothesId, N'Quần Âu Relaxed', 'quan-au-relaxed', N'Ly đứng mềm, chuyển động thoải mái', 'men', 'trousers', NULL, 1890000, 'active', 0),
(10, @ClothesId, N'Áo Polo Dệt Kim', 'ao-polo-det-kim', N'Chất dệt mịn, cổ áo hiện đại', 'men', 'shirt', NULL, 1750000, 'active', 0),
(11, @AccessoriesId, N'Đồng Hồ Nữ Ánh Kim', 'dong-ho-nu-anh-kim', N'Mặt số thanh mảnh, dây thép mạ vàng', 'women', 'watch', N'Phụ kiện', 4200000, 'active', 1),
(12, @AccessoriesId, N'Vòng Cổ Ngọc Trai Đen', 'vong-co-ngoc-trai-den', N'Ngọc trai tuyển chọn, hoàn thiện thủ công', 'women', 'necklace', N'Thủ công', 890000, 'active', 1);
SET IDENTITY_INSERT dbo.Products OFF;

DECLARE @Brown INT = (SELECT ColorId FROM dbo.Colors WHERE ColorCode = 'brown');
DECLARE @Cream INT = (SELECT ColorId FROM dbo.Colors WHERE ColorCode = 'cream');
DECLARE @Black INT = (SELECT ColorId FROM dbo.Colors WHERE ColorCode = 'black');
DECLARE @Gold INT = (SELECT ColorId FROM dbo.Colors WHERE ColorCode = 'gold');
DECLARE @S INT = (SELECT SizeId FROM dbo.Sizes WHERE SizeCode = 'S');
DECLARE @M INT = (SELECT SizeId FROM dbo.Sizes WHERE SizeCode = 'M');
DECLARE @L INT = (SELECT SizeId FROM dbo.Sizes WHERE SizeCode = 'L');
DECLARE @XL INT = (SELECT SizeId FROM dbo.Sizes WHERE SizeCode = 'XL');
DECLARE @One INT = (SELECT SizeId FROM dbo.Sizes WHERE SizeCode = 'ONE');

/* Tạo biến thể mẫu cho trang phục nữ. */
INSERT INTO dbo.ProductVariants (ProductId, ColorId, SizeId, Sku, StockQuantity)
SELECT p.ProductId, c.ColorId, s.SizeId,
       CONCAT('BS-', RIGHT(CONCAT('000', p.ProductId), 3), '-', c.ColorCode, '-', s.SizeCode),
       CASE WHEN s.SizeCode = 'M' THEN 12 ELSE 8 END
FROM dbo.Products p
CROSS JOIN (SELECT ColorId, ColorCode FROM dbo.Colors WHERE ColorCode IN ('brown','cream')) c
CROSS JOIN (SELECT SizeId, SizeCode FROM dbo.Sizes WHERE SizeCode IN ('S','M','L')) s
WHERE p.ProductId BETWEEN 1 AND 6;

/* Tạo biến thể mẫu cho trang phục nam. */
INSERT INTO dbo.ProductVariants (ProductId, ColorId, SizeId, Sku, StockQuantity)
SELECT p.ProductId, c.ColorId, s.SizeId,
       CONCAT('BS-', RIGHT(CONCAT('000', p.ProductId), 3), '-', c.ColorCode, '-', s.SizeCode), 10
FROM dbo.Products p
CROSS JOIN (SELECT ColorId, ColorCode FROM dbo.Colors WHERE ColorCode IN ('black','cream')) c
CROSS JOIN (SELECT SizeId, SizeCode FROM dbo.Sizes WHERE SizeCode IN ('M','L','XL')) s
WHERE p.ProductId BETWEEN 7 AND 10;

INSERT INTO dbo.ProductVariants (ProductId, ColorId, SizeId, Sku, StockQuantity)
VALUES
(11, @Gold, @One, 'BS-011-gold-ONE', 8),
(12, @Black, @One, 'BS-012-black-ONE', 17);

INSERT INTO dbo.Promotions
    (PromotionCode, PromotionName, DiscountType, DiscountValue, MinOrderValue, MaxDiscountValue, StartsAt, EndsAt)
VALUES
('BANSAC10', N'Giảm 10% toàn bộ đơn hàng', 'percent', 10, 0, 1000000, SYSUTCDATETIME(), DATEADD(YEAR, 1, SYSUTCDATETIME())),
('FREESHIP', N'Miễn phí vận chuyển', 'shipping', 100, 0, NULL, SYSUTCDATETIME(), DATEADD(YEAR, 1, SYSUTCDATETIME()));

COMMIT TRANSACTION;
GO

/* Admin không được seed mật khẩu thuần trong SQL.
   Backend sẽ tạo admin và PasswordHash bằng scrypt từ biến môi trường. */
PRINT N'Đã seed dữ liệu nền thành công.';
GO
