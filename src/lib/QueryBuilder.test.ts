import { QueryBuilder } from "./QueryBuilder";
import { Ref } from "./Ref";
import { TableDefinition } from "./TableDefinition";
import fs from "fs";
import path from "path";

describe("QueryBuilder", () => {
  it("Should build examples/query-1.sql", () => {
    const query1 = fs
      .readFileSync(path.join("src", "lib", "examples", "query-1.sql"), {
        encoding: "utf-8",
      })
      .replace(/\s{2,}/gm, " ");

    const personTable = new TableDefinition<{
      name: string;
      last_name: string;
      status_id: string;
    }>({
      database: "MainDB",
      table: "Person",
      alias: "p",
    });

    const personStatusTable = new TableDefinition<{
      id: string;
      text: string;
      is_deleted: boolean;
    }>({
      database: "MainDB",
      table: "PersonStatus",
      alias: "ps",
    });

    const query = new QueryBuilder({
      person: personTable,
      status: personStatusTable,
    })
      .select(({ person, status }) => {
        return [
          person
            .get("name")
            .append(" ")
            .append(person.get("last_name"))
            .toUpper()
            .as("full_name"),
          status.get("text").as("status"),
        ];
      })
      .from("person")
      .join("status", ({ person, status }) => {
        return person
          .get("status_id")
          .isEqualTo(status.get("id"))
          .and(status.get("is_deleted").isFalse())
          .or(status.get("text").isNotNull());
      })
      .where(({ person }) => {
        return person.get("last_name").contains(person.get("name"));
      });

    expect(query.build()).toStrictEqual(query1);
  });

  it("Should build examples/query-2.sql", () => {
    const query2 = fs
      .readFileSync(path.join("src", "lib", "examples", "query-2.sql"), {
        encoding: "utf-8",
      })
      .replace(/\s{2,}/gm, " ");

    const tableDefinitions = {
      employees: new TableDefinition<{
        FirstName: string;
        LastName: string;
        Department_Id: string;
        Project_Id: string;
      }>({
        database: "MyDatabase",
        schema: "HumanResources",
        table: "Employees",
        alias: "emp",
      }),
      departments: new TableDefinition<{
        Id: string;
        Name: string;
      }>({
        database: "MyDatabase",
        schema: "HumanResources",
        table: "Departments",
        alias: "dept",
      }),
      projects: new TableDefinition<{
        Id: string;
        Name: string;
      }>({
        database: "MyDatabase",
        schema: "HumanResources",
        table: "Projects",
        alias: "proj",
      }),
    };

    const query = new QueryBuilder(tableDefinitions)
      .select(({ employees, departments, projects }) => {
        return [
          employees.get("FirstName").as("EmployeeFirstName"),
          employees.get("LastName").as("EmployeeLastName"),
          departments.get("Name").as("DepartmentName"),
          projects.get("Name").as("ProjectName"),
        ];
      })
      .from("employees")
      .join("departments", ({ employees, departments }) => {
        return employees.get("Department_Id").isEqualTo(departments.get("Id"));
      })
      .leftJoin("projects", ({ employees, projects }) => {
        return employees.get("Project_Id").isEqualTo(projects.get("Id"));
      })
      .where(({ employees, departments, projects }) => {
        return departments
          .get("Name")
          .isEqualTo("Human Resources")
          .and(projects.get("Name").contains("Innovation"));
      })
      .orderBy(({ employees }) => {
        return [employees.get("LastName").ascending()];
      });

    expect(query.build()).toStrictEqual(query2);
  });
  
  it("Should build examples/query-3.sql", () => {
    const query3 = fs
      .readFileSync(path.join("src", "lib", "examples", "query-3.sql"), {
        encoding: "utf-8",
      })
      .replace(/\s{2,}/gm, " ");

    const tableDefinitions = {
      customers: new TableDefinition<{
        CustomerId: string;
        CustomerName: string;
        Email: string;
      }>({
        database: "SalesDatabase",
        schema: "SalesSchema",
        table: "Customers",
        alias: "cust",
      }),
      orders: new TableDefinition<{
        OrderId: string;
        OrderDate: string;
        CustomerId: string;
      }>({
        database: "SalesDatabase",
        schema: "SalesSchema",
        table: "Orders",
        alias: "ord",
      }),
      orderDetails: new TableDefinition<{
        OrderId: string;
        ProductId: string;
        Quantity: number;
      }>({
        database: "SalesDatabase",
        schema: "SalesSchema",
        table: "OrderDetails",
        alias: "ord_det",
      }),
      products: new TableDefinition<{
        ProductName: string;
        Price: number;
        ProductId: string;
        Category: string;
      }>({
        database: "SalesDatabase",
        schema: "SalesSchema",
        table: "Products",
        alias: "prod",
      }),
    };

    const query = new QueryBuilder(tableDefinitions)
      .select(({ customers, orders, orderDetails, products }) => {
        return [
          customers.get("CustomerName").as("CustomerFullName"),
          customers.get("Email").as("CustomerEmail"),
          orders.get("OrderId").as("OrderId"),
          orders.get("OrderDate").as("OrderDate"),
          products.get("ProductName").as("ProductName"),
          products.get("Price").as("ProductPrice"),
          orderDetails.get("Quantity").as("Quantity"),
          products
            .get("Price")
            .multipliedBy(orderDetails.get("Quantity"))
            .as("TotalRevenuePerProduct"),
          Ref.sumOverPartition(
            products.get("Price").multipliedBy(orderDetails.get("Quantity")),
            customers.get("CustomerId")
          ).as("TotalRevenuePerCustomer"),
        ];
      })
      .from("customers")
      .join("orders", ({ customers, orders }) =>
        customers.get("CustomerId").isEqualTo(orders.get("CustomerId"))
      )
      .join("orderDetails", ({ orders, orderDetails }) =>
        orders.get("OrderId").isEqualTo(orderDetails.get("OrderId"))
      )
      .join("products", ({ products, orderDetails }) =>
        orderDetails.get("ProductId").isEqualTo(products.get("ProductId"))
      )
      .where(({ orders, products }) =>
        orders
          .get("OrderDate")
          .isBetween("2025-01-01", "2025-12-31")
          .and(products.get("Category").isEqualTo("Electronics"))
      )
      .orderBy(({ customers, orders }) => [
        customers.get("CustomerName").ascending(),
        orders.get("OrderDate").descending(),
      ]);

    expect(query.build()).toStrictEqual(query3);
  });
});
