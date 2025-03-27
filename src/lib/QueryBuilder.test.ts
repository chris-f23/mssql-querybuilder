import { QueryBuilder } from "./QueryBuilder";
import { Ref } from "./Ref";
import { TableDefinition } from "./TableDefinition";
import fs from "fs";
import path from "path";

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

describe("QueryBuilder", () => {
  it(`Should build "SELECT [p].[name] + ' ' + [p].[last_name] AS [full_name]"`, () => {
    const query = new QueryBuilder({
      person: personTable,
    })
      .select(({ person }) => {
        return [
          person
            .get("name")
            .append(Ref.STRING(" "))
            .append(person.get("last_name"))
            .as("full_name"),
        ];
      })
      .build();

    expect(query).toEqual(
      "SELECT [p].[name] + ' ' + [p].[last_name] AS [full_name]"
    );
  });

  it("Should build examples/query-1.sql", () => {
    const query1 = fs
      .readFileSync(path.join("src", "lib", "examples", "query-1.sql"), {
        encoding: "utf-8",
      })
      .replace(/\s{2,}/gm, " ");

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
});
