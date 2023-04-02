import { DefineType, Schema } from "deno-slack-sdk/mod.ts";

export const UsersCustomType = DefineType({
  name: "Users",
  type: Schema.types.array,
  items: {
    type: Schema.slack.types.user_id,
  },
});

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
