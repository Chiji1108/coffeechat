import { DefineFunction, Schema } from "deno-slack-sdk/mod.ts";
import { MatchingResultCustomType } from "../../types/matching_result.ts";

export const SEND_MATCHING_RESULT_FUNCTION_CALLBACK_ID =
  "send_matching_result_function";

export const SendMatchingResultFunction = DefineFunction({
  callback_id: SEND_MATCHING_RESULT_FUNCTION_CALLBACK_ID,
  title: "Send Matching Result Function",
  source_file: "functions/send_matching_result/handler.ts",
  input_parameters: {
    properties: {
      channel: {
        type: Schema.slack.types.channel_id,
      },
      matching_result: {
        type: MatchingResultCustomType,
      },
    },
    required: ["channel", "matching_result"],
  },
});
