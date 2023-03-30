import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { DeleteConfigFunction } from "../functions/delete_config.ts";

const DeleteConfigWorkflow = DefineWorkflow({
  callback_id: "delete_config_workflow",
  title: "Delete config workflow",
  input_parameters: {
    properties: {
      channel: {
        type: Schema.slack.types.channel_id,
      },
    },
    required: ["channel"],
  },
});

// DeleteConfigWorkflow.addStep(
//   Schema.slack.functions.OpenForm,
//   {},
// );

DeleteConfigWorkflow.addStep(
  DeleteConfigFunction,
  {
    triggered_channel: DeleteConfigWorkflow.inputs.channel,
  },
);

DeleteConfigWorkflow.addStep(
  Schema.slack.functions.SendMessage,
  {
    channel_id: DeleteConfigWorkflow.inputs.channel,
    message: `チャンネルを削除しました！`,
  },
);

export default DeleteConfigWorkflow;
