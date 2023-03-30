import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";

export const MatchingHistoryDatastore = DefineDatastore({
  name: "matching_history",
  primary_key: "user_id",
  attributes: {
    user_id: { type: Schema.slack.types.user_id },
    matched_users: {
      type: Schema.types.array,
      items: { type: Schema.slack.types.user_id },
    },
  },
});

export default MatchingHistoryDatastore;
