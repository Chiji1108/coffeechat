import { DefineType, Schema } from "deno-slack-sdk/mod.ts";
import { UsersCustomType, UsersType } from "./users.ts";

export const MatchingResultCustomType = DefineType({
  name: "MatchingResult",
  type: Schema.types.object,
  properties: {
    matched_groups: {
      type: Schema.types.array,
      items: {
        type: UsersCustomType,
      },
    },
    unmatched_users: {
      type: UsersCustomType,
    },
  },
  required: ["matched_groups", "unmatched_users"],
});

export type MatchingResultType = {
  matched_groups: UsersType[];
  unmatched_users: string[];
};
