import { DefineFunction, Schema } from "deno-slack-sdk/mod.ts";

export const UNSET_SCHEDULER_FUNCTION_CALLBACK_ID = "unset_scheduler_function";

export const UnsetSchedulerFunction = DefineFunction({
  callback_id: UNSET_SCHEDULER_FUNCTION_CALLBACK_ID,
  title: "Unset scheduler function",
  source_file: "functions/unset_scheduler/handler.ts",
  input_parameters: {
    properties: {
      triggered_channel: {
        type: Schema.slack.types.channel_id,
      },
      triggered_user: {
        type: Schema.slack.types.user_id,
      },
    },
    required: ["triggered_channel", "triggered_user"],
  },
});
