import { DefineFunction, Schema } from "deno-slack-sdk/mod.ts";

export const SET_SCHEDULER_FUNCTION_CALLBACK_ID = "SET_scheduler_function";

export const SetSchedulerFunction = DefineFunction({
  callback_id: SET_SCHEDULER_FUNCTION_CALLBACK_ID,
  title: "Set scheduler function",
  source_file: "functions/set_scheduler/handler.ts",
  input_parameters: {
    properties: {
      triggered_user: {
        type: Schema.slack.types.user_id,
      },
      triggered_channel: {
        type: Schema.slack.types.channel_id,
      },
      start_time: {
        type: Schema.slack.types.timestamp,
      },
      // delete_matching_history: {
      //   type: Schema.types.boolean,
      // },
      frequency: {
        type: Schema.types.integer,
      },
    },
    required: [
      "triggered_user",
      "triggered_channel",
      "start_time",
      // "delete_matching_history",
      "frequency",
    ],
  },
});
