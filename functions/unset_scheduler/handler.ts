import { SlackFunction } from "deno-slack-sdk/mod.ts";
import { UnsetSchedulerFunction } from "./definition.ts";
import MatchingWorkflow from "../../workflows/matching.ts";
import { TriggerTypes } from "deno-slack-api/mod.ts";
// import TriggerDatastore from "../../datastores/trigger.ts";

export default SlackFunction(
  UnsetSchedulerFunction,
  async ({ inputs, client }) => {
    const { triggered_channel, triggered_user } = inputs;
    // const previousTriggerResponse = await client.apps.datastore.get<
    //   typeof TriggerDatastore.definition
    // >({
    //   datastore: TriggerDatastore.name,
    //   id: triggered_channel,
    // });
    // if (!previousTriggerResponse.ok) {
    //   return {
    //     error:
    //       `Failed to get previous trigger: ${previousTriggerResponse.error}`,
    //   };
    // }
    const allTriggers = await client.workflows.triggers.list();
    if (!allTriggers.ok) {
      return { error: `Failed to get triggers: ${allTriggers.error}` };
    }
    const matchingTriggers = allTriggers.triggers.filter((trigger) =>
      trigger.workflow.callback_id ===
        MatchingWorkflow.definition.callback_id &&
      trigger.type === TriggerTypes.Scheduled &&
      trigger.inputs.channel.value === triggered_channel
    );

    if (matchingTriggers.length === 0) {
      const sendMessageResponse = await client.chat.postEphemeral({
        channel: triggered_channel,
        text: `このチャンネルにスケジューラーはまだ設定されてません🥲`,
        user: triggered_user,
      });
      if (!sendMessageResponse.ok) {
        return {
          error: `Failed to send message: ${sendMessageResponse.error}`,
        };
      }
      return { outputs: {} };
    }

    await Promise.allSettled(
      matchingTriggers.map(async (trigger) => {
        const response = await client.workflows.triggers.delete(
          { trigger_id: trigger.id },
        );
        if (!response.ok) {
          return { error: `Failed to delete trigger: ${response.error}` };
        }
      }),
    );

    const sendMessageResponse = await client.chat.postMessage({
      channel: triggered_channel,
      text:
        `<@${triggered_user}>さんがこのチャンネルのスケジューラーを削除しました🗑️`,
    });
    if (!sendMessageResponse.ok) {
      return {
        error: `Failed to send message: ${sendMessageResponse.error}`,
      };
    }
    return { outputs: {} };

    // if (previousTriggerResponse.item.trigger_id) {
    // const response = await client.workflows.triggers.delete(
    //   { trigger_id: previousTriggerResponse.item.trigger_id },
    // );
    // if (!response.ok) {
    //   return { error: `Failed to delete trigger: ${response.error}` };
    // }
    // const previousTriggerDeleteResponse = await client.apps.datastore.delete<
    //   typeof TriggerDatastore.definition
    // >({
    //   datastore: TriggerDatastore.name,
    //   id: triggered_channel,
    // });
    // if (!previousTriggerDeleteResponse.ok) {
    //   return {
    //     error:
    //       `Failed to delete previous trigger: ${previousTriggerDeleteResponse.error}`,
    //   };
    // }
  },
);
