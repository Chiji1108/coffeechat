import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { MatchingFunction } from "../functions/matching.ts";

const MatchingWorkflow = DefineWorkflow({
  callback_id: "matching_workflow",
  title: "このチャンネルで一回限りのマッチングをする",
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
});

MatchingWorkflow.addStep(
  Schema.slack.functions.SendMessage,
  {
    channel_id: MatchingWorkflow.inputs.channel,
    message:
      `<@${MatchingWorkflow.inputs.user}>さんによってマッチングを開始します☕️`,
  },
);

MatchingWorkflow.addStep(
  MatchingFunction,
  {
    channel: MatchingWorkflow.inputs.channel,
    user: MatchingWorkflow.inputs.user,
  },
);

export default MatchingWorkflow;
