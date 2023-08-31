import { DefineType, Schema } from "deno-slack-sdk/mod.ts";

export const UsersCustomType = DefineType({
  name: "Users",
  type: Schema.types.array,
  items: {
    type: Schema.slack.types.user_id,
  },
});

export type UsersType = string[];
