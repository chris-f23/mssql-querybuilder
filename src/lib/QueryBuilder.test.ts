import { Fn } from "./Fn";
import { QueryBuilderError, QueryBuilder } from "./QueryBuilder";
import { Ref } from "./Ref";
import { TableDefinition } from "./TableDefinition";

describe("QueryBuilder", () => {
  it(`Should build "SELECT 1"`, () => {
    const query = new QueryBuilder()
      .select(() => {
        return [Ref.number(1)];
      })
      .build();

    expect(query).toEqual("SELECT 1");
  });

  it(`Should build "SELECT 'Hello World'"`, () => {
    const query = new QueryBuilder()
      .select(() => {
        return [Ref.string("Hello World")];
      })
      .build();

    expect(query).toEqual("SELECT 'Hello World'");
  });

  it(`Should build "SELECT 'Hello World' AS [message]"`, () => {
    const query = new QueryBuilder()
      .select(() => {
        return [Ref.string("Hello World").as("message")];
      })
      .build();

    expect(query).toEqual("SELECT 'Hello World' AS [message]");
  });

  it(`Should build "SELECT [p].[name] + ' ' + [p].[last_name] AS [full_name]"`, () => {
    const personTable = new TableDefinition<{
      name: string;
      last_name: string;
    }>({
      database: "MainDB",
      table: "Person",
      alias: "p",
    });

    const query = new QueryBuilder({
      person: personTable,
    })
      .select(({ person }) => {
        return [
          Fn.CONCAT(
            person.get("name"),
            Ref.string(" "),
            person.get("last_name")
          ).as("full_name"),
        ];
      })
      .build();

    expect(query).toEqual(
      "SELECT [p].[name] + ' ' + [p].[last_name] AS [full_name]"
    );
  });

  it("Should build a valid complex query", () => {
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
          Fn.UPPER(
            Fn.CONCAT(person.get("name"), Fn.SPACE(), person.get("last_name"))
          ).as("full_name"),
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
      });

    const { columnsSelected, fromTable, joinTables, whereCondition } =
      query.buildParts("\n");

    expect(columnsSelected).toStrictEqual([
      `UPPER([p].[name] + ' ' + [p].[last_name]) AS [full_name]`,
      `[ps].[text] AS [status]`,
    ]);

    expect(fromTable).toStrictEqual("FROM [MainDB].[dbo].[Person] AS [p]");
    expect(joinTables).toStrictEqual([
      `JOIN [MainDB].[dbo].[PersonStatus] AS [ps]\nON [p].[status_id] = [ps].[id] AND [ps].[is_deleted] = BIT(0) OR [ps].[text] IS NOT NULL`,
    ]);
  });
  // it("Should build a query correctly", () => {
  //   const query = new QueryBuilder()
  //     .from({
  //       database: "MainDB",
  //       table: "Person",
  //       as: "p",
  //     })
  //     .select(["name", "email", "phone"])
  //     .where("p.id", "=", "1")
  //     .build();

  //   expect(query).toEqual(
  //     [
  //       "SELECT [name], [email], [phone] FROM [MainDB].[dbo].[Person] AS p WHERE p.id = 1",
  //     ].join("\n")
  //   );
  // });

  // it("Should throw an error if a clause is already set", () => {
  //   const builder = new QueryBuilder()
  //     .select(["name", "email", "phone"])
  //     .from({
  //       database: "MainDB",
  //       table: "Person",
  //       as: "p",
  //     })
  //     .where("p.id", "=", "1");

  //   expect(() => builder.select(["name", "email", "phone"])).toThrow(
  //     ClauseAlreadySetError
  //   );

  //   expect(() =>
  //     builder.from({
  //       database: "MainDB",
  //       table: "Person",
  //       as: "p",
  //     })
  //   ).toThrow(ClauseAlreadySetError);

  //   expect(() => builder.where("pac.id", "=", "2")).toThrow(
  //     ClauseAlreadySetError
  //   );
  // });
});
