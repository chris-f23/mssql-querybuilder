SELECT
    UPPER([p].[name] + ' ' + [p].[last_name]) AS [full_name],
    [ps].[text] AS [status]
FROM [MainDB].[dbo].[Person] AS [p]
JOIN [MainDB].[dbo].[PersonStatus] AS [ps]
    ON [p].[status_id] = [ps].[id] AND [ps].[is_deleted] = BIT(0) OR [ps].[text] IS NOT NULL
WHERE
    [p].[last_name] LIKE '%' + [p].[name] + '%'