import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { MatchingFunction } from "../functions/matching.ts";
import { SendResultFunction } from "../functions/send_result.ts";

const MatchingWorkflow = DefineWorkflow({
  callback_id: "matching_workflow",
  title: "マッチングをする",
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

const MatchingResult = MatchingWorkflow.addStep(
  MatchingFunction,
  {
    channel: MatchingWorkflow.inputs.channel,
    user: MatchingWorkflow.inputs.user,
  },
);

MatchingWorkflow.addStep(SendResultFunction, {
  channel: MatchingWorkflow.inputs.channel,
  matching_result: MatchingResult.outputs.matching_result,
});

export default MatchingWorkflow;
