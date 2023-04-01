import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { DeleteConfigFunction } from "../functions/delete_config.ts";

const DeleteConfigWorkflow = DefineWorkflow({
  callback_id: "delete_config_workflow",
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

DeleteConfigWorkflow.addStep(
  DeleteConfigFunction,
  {
    triggered_channel: DeleteConfigWorkflow.inputs.channel,
    triggered_user: DeleteConfigWorkflow.inputs.user,
  },
);

export default DeleteConfigWorkflow;
