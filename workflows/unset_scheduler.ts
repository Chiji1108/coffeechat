import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { UnsetSchedulerFunction } from "../functions/unset_scheduler/definition.ts";
// import { DeleteConfigFunction } from "../functions/delete_config.ts";

export const UNSET_SCHEDULER_WORKFLOW_CALLBACK_ID = "unset_scheduler_workflow";

const UnsetSchedulerWorkflow = DefineWorkflow({
  callback_id: UNSET_SCHEDULER_WORKFLOW_CALLBACK_ID,
  title: "このチャンネルのスケジューラーを削除する",
  input_parameters: {
    properties: {
      channel: {
        type: Schema.slack.types.channel_id,
      },
      user: {
        type: Schema.slack.types.user_id,
      },
    },
    required: ["channel", "user"],
  },
});

UnsetSchedulerWorkflow.addStep(
  UnsetSchedulerFunction,
  {
    triggered_channel: UnsetSchedulerWorkflow.inputs.channel,
    triggered_user: UnsetSchedulerWorkflow.inputs.user,
  },
);

export default UnsetSchedulerWorkflow;
