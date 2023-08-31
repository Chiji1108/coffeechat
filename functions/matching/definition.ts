import { DefineFunction, Schema } from "deno-slack-sdk/mod.ts";
import { MatchingResultCustomType } from "../../types/matching_result.ts";

export const MATCHING_FUNCTION_CALLBACK_ID = "matching_function";

export const MatchingFunction = DefineFunction({
  callback_id: MATCHING_FUNCTION_CALLBACK_ID,
  title: "Matching Function",
  source_file: "functions/matching/handler.ts",
  input_parameters: {
    properties: {
      channel: {
        type: Schema.slack.types.channel_id,
      },
      user: {
        type: Schema.slack.types.user_id,
      },
    },
    required: ["channel"],
  },
  output_parameters: {
    properties: {
      matching_result: {
        type: MatchingResultCustomType,
      },
    },
    required: ["matching_result"],
  },
});
