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
    },
    required: ["channel"],
  },
});

MatchingWorkflow.addStep(
  MatchingFunction,
  {
    channel: MatchingWorkflow.inputs.channel,
  },
);

export default MatchingWorkflow;
