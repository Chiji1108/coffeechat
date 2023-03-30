import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";

export const TriggerDatastore = DefineDatastore({
  name: "trigger",
  primary_key: "channel_id",
  attributes: {
    channel_id: { type: Schema.slack.types.channel_id },
    trigger_id: { type: Schema.types.string },
  },
});

export default TriggerDatastore;
