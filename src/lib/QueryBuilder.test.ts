import { ClauseAlreadySetError, QueryBuilder } from "./QueryBuilder";

type PersonColumns = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

describe("QueryBuilder", () => {
  it("Should build a query correctly", () => {
    const query = new QueryBuilder()
      .from({
        database: "MainDB",
        table: "Person",
        as: "p",
      })
      .select(["name", "email", "phone"])
      .where("p.id", "=", "1")
      .build();

    expect(query).toEqual(
      [
        "SELECT [name], [email], [phone] FROM [MainDB].[dbo].[Person] AS p WHERE p.id = 1",
      ].join("\n")
    );
  });

  it("Should throw an error if a clause is already set", () => {
    const builder = new QueryBuilder()
      .select(["name", "email", "phone"])
      .from({
        database: "MainDB",
        table: "Person",
        as: "p",
      })
      .where("p.id", "=", "1");

    expect(() => builder.select(["name", "email", "phone"])).toThrow(
      ClauseAlreadySetError
    );

    expect(() =>
      builder.from({
        database: "MainDB",
        table: "Person",
        as: "p",
      })
    ).toThrow(ClauseAlreadySetError);

    expect(() => builder.where("pac.id", "=", "2")).toThrow(
      ClauseAlreadySetError
    );
  });
});
