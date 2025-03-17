import {
  ClauseAlreadySetError,
  QueryBuilder,
  TableDefinition,
} from "./QueryBuilder";

const personTable = new TableDefinition<{
  id: number;
  name: string;
  email: string;
  status_id: number;
}>({
  database: "MainDB",
  table: "Person",
});

const personStatusTable = new TableDefinition<{
  id: number;
  text: string;
}>({
  database: "MainDB",
  table: "PersonStatus",
});

describe("QueryBuilder", () => {
  it("Should build a query correctly", () => {
    const query = new QueryBuilder({
      person: personTable,
      status: personStatusTable,
    })
      .select((tables) => {
        return {
          personName: tables.person.colRef("name"),
          statusText: tables.status.colRef("text"),
        };
      })
      .from("person")
      // .join("person", "FULL", "status", (cb) => {
      //   return (
      //     tables.person.colRef("status_id") === tables.status.colRef("id") &&
      //     tables.status.colRef("id") === 1
      //   );
      //   return true;
      // })
      .build();

    expect(query).toEqual("");
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
