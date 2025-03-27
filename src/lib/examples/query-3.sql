SELECT 
    [cust].[CustomerName] AS [CustomerFullName],
    [cust].[Email] AS [CustomerEmail],
    [ord].[OrderId] AS [OrderId],
    [ord].[OrderDate] AS [OrderDate],
    [prod].[ProductName] AS [ProductName],
    [prod].[Price] AS [ProductPrice],
    [ord_det].[Quantity] AS [Quantity],
    ([prod].[Price] * [ord_det].[Quantity]) AS [TotalRevenuePerProduct],
    SUM([prod].[Price] * [ord_det].[Quantity]) OVER (PARTITION BY [cust].[CustomerId]) AS [TotalRevenuePerCustomer]
FROM 
    [SalesDatabase].[SalesSchema].[Customers] AS [cust]
INNER JOIN 
    [SalesDatabase].[SalesSchema].[Orders] AS [ord] 
    ON [cust].[CustomerId] = [ord].[CustomerId]
INNER JOIN 
    [SalesDatabase].[SalesSchema].[OrderDetails] AS [ord_det] 
    ON [ord].[OrderId] = [ord_det].[OrderId]
INNER JOIN 
    [SalesDatabase].[SalesSchema].[Products] AS [prod] 
    ON [ord_det].[ProductId] = [prod].[ProductId]
WHERE 
    [ord].[OrderDate] BETWEEN '2025-01-01' AND '2025-12-31'
    AND [prod].[Category] = 'Electronics'
ORDER BY 
    [cust].[CustomerName] ASC, [ord].[OrderDate] DESC;