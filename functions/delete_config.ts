import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import TriggerDatastore from "../datastores/trigger.ts";

export const DeleteConfigFunction = DefineFunction({
  callback_id: "delete_config_function",
  title: "Delete config function",
  source_file: "functions/delete_config.ts",
  input_parameters: {
    properties: {
      triggered_channel: {
        type: Schema.slack.types.channel_id,
      },
    },
    required: ["triggered_channel"],
  },
});

export default SlackFunction(
  DeleteConfigFunction,
  async ({ inputs, client }) => {
    const { triggered_channel } = inputs;
    const previousTriggerResponse = await client.apps.datastore.get<
      typeof TriggerDatastore.definition
    >({
      datastore: TriggerDatastore.name,
      id: triggered_channel,
    });
    if (!previousTriggerResponse.ok) {
      return {
        error:
          `Failed to get previous trigger: ${previousTriggerResponse.error}`,
      };
    }
    if (previousTriggerResponse.item.trigger_id) {
      const response = await client.workflows.triggers.delete(
        { trigger_id: previousTriggerResponse.item.trigger_id },
      );
      if (!response.ok) {
        return { error: `Failed to delete trigger: ${response.error}` };
      }
      const previousTriggerDeleteResponse = await client.apps.datastore.delete<
        typeof TriggerDatastore.definition
      >({
        datastore: TriggerDatastore.name,
        id: triggered_channel,
      });
      if (!previousTriggerDeleteResponse.ok) {
        return {
          error:
            `Failed to delete previous trigger: ${previousTriggerDeleteResponse.error}`,
        };
      }
    }
    return { outputs: {} };
  },
);
