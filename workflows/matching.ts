import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { MatchingFunction } from "../functions/matching/definition.ts";
import { SendMatchingResultFunction } from "../functions/send_matching_result/definition.ts";

export const MATCHING_WORKFLOW_CALLBACK_ID = "matching_workflow";

const MatchingWorkflow = DefineWorkflow({
  callback_id: MATCHING_WORKFLOW_CALLBACK_ID,
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

MatchingWorkflow.addStep(SendMatchingResultFunction, {
  channel: MatchingWorkflow.inputs.channel,
  matching_result: MatchingResult.outputs.matching_result,
});

export default MatchingWorkflow;
