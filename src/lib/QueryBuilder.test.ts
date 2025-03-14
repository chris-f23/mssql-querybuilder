import { ClauseAlreadySetError, QueryBuilder } from "./QueryBuilder";

describe("QueryBuilder", () => {
  it("Should build a query correctly", () => {
    const query = new QueryBuilder()
      .select(["name", "email", "phone"])
      .from("DB_PERSON", "dbo", "PAC_Paciente", "pac")
      .where("pac.id", "=", "1")
      .build();

    expect(query).toEqual(
      [
        "SELECT [name], [email], [phone] FROM [DB_PERSON].[dbo].[PAC_Paciente] AS pac WHERE pac.id = 1",
      ].join("\n")
    );
  });

  it("Should throw an error if a clause is already set", () => {
    const builder = new QueryBuilder()
      .select(["name", "email", "phone"])
      .from("DB_PERSON", "dbo", "PAC_Paciente", "pac")
      .where("pac.id", "=", "1");

    expect(() => builder.select(["name", "email", "phone"])).toThrow(
      ClauseAlreadySetError
    );

    expect(() =>
      builder.from("DB_PERSON", "dbo", "PAC_Paciente", "pac")
    ).toThrow(ClauseAlreadySetError);

    expect(() => builder.where("pac.id", "=", "2")).toThrow(
      ClauseAlreadySetError
    );
  });
});
