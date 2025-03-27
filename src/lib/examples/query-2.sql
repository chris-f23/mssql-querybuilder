SELECT 
    [emp].[FirstName] AS [EmployeeFirstName],
    [emp].[LastName] AS [EmployeeLastName],
    [dept].[Name] AS [DepartmentName],
    [proj].[Name] AS [ProjectName]
FROM 
    [MyDatabase].[HumanResources].[Employees] AS [emp]
JOIN 
    [MyDatabase].[HumanResources].[Departments] AS [dept] 
    ON [emp].[Department_Id] = [dept].[Id]
LEFT JOIN 
    [MyDatabase].[HumanResources].[Projects] AS [proj] 
    ON [emp].[Project_Id] = [proj].[Id]
WHERE 
    [dept].[Name] = 'Human Resources'
    AND [proj].[Name] LIKE '%Innovation%'
ORDER BY 
    [emp].[LastName] ASC;