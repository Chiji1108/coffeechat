import { SlackFunction } from "deno-slack-sdk/mod.ts";
import { WEEKDAYS } from "deno-slack-api/typed-method-types/workflows/triggers/scheduled.ts";
type WeekdayUnion = typeof WEEKDAYS[keyof typeof WEEKDAYS];
import MatchingWorkflow from "../../workflows/matching.ts";
import { SetSchedulerFunction } from "./definition.ts";
import { TriggerTypes } from "deno-slack-api/mod.ts";

export default SlackFunction(
  SetSchedulerFunction,
  async ({ inputs, client }) => {
    const {
      triggered_channel,
      triggered_user,
      frequency,
      start_time,
    } = inputs;

    //Validation
    const startDate = new Date(start_time * 1000);
    if (startDate < new Date()) {
      const response = await client.chat.postEphemeral({
        channel: triggered_channel,
        text:
          `コーヒーチャットの設定に失敗しました😢\n現在より後の日付を選択してください🗓️`,
        user: triggered_user,
      });
      if (!response.ok) {
        return { error: `Failed to send ephemeral message: ${response.error}` };
      }

      return { outputs: {} };
    }
    const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long" })
      .format(
        startDate,
      );

    // 前のトリガーを削除
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
    // if (previousTriggerResponse.item.trigger_id) {
    //   const response = await client.workflows.triggers.delete(
    //     { trigger_id: previousTriggerResponse.item.trigger_id },
    //   );
    //   if (!response.ok) {
    //     return { error: `Failed to delete trigger: ${response.error}` };
    //   }
    //   const previousTriggerDeleteResponse = await client.apps.datastore.delete<
    //     typeof TriggerDatastore.definition
    //   >({
    //     datastore: TriggerDatastore.name,
    //     id: triggered_channel,
    //   });
    //   if (!previousTriggerDeleteResponse.ok) {
    //     return {
    //       error:
    //         `Failed to delete previous trigger: ${previousTriggerDeleteResponse.error}`,
    //     };
    //   }
    // }

    // トリガーを削除
    const allTriggers = await client.workflows.triggers.list();
    if (!allTriggers.ok) {
      return { error: `Failed to get triggers: ${allTriggers.error}` };
    }
    try {
      await Promise.allSettled(
        allTriggers.triggers.filter((trigger) =>
          trigger.workflow.callback_id ===
            MatchingWorkflow.definition.callback_id &&
          trigger.type === TriggerTypes.Scheduled &&
          trigger.inputs.channel.value === triggered_channel
        ).map(async (trigger) => {
          const response = await client.workflows.triggers.delete(
            { trigger_id: trigger.id },
          );
          if (!response.ok) {
            return { error: `Failed to delete trigger: ${response.error}` };
          }
        }),
      );
    } catch (error) {
      return { error };
    }

    // トリガー作成
    const triggerResponse = await client.workflows.triggers.create<
      typeof MatchingWorkflow.definition
    >({
      type: "scheduled",
      name: "Matching",
      workflow: `#/workflows/${MatchingWorkflow.definition.callback_id}`,
      inputs: {
        channel: { value: triggered_channel },
      },
      schedule: {
        start_time: startDate.toISOString(),
        timezone: "Asia/Tokyo",
        frequency: {
          type: "weekly",
          on_days: [
            weekday as WeekdayUnion,
          ],
          repeats_every: frequency,
        },
      },
    });
    if (!triggerResponse.ok) {
      return { error: `Failed to create trigger: ${triggerResponse.error}` };
    }
    // const putResponse = await client.apps.datastore.put<
    //   typeof TriggerDatastore.definition
    // >({
    //   datastore: TriggerDatastore.name,
    //   item: {
    //     trigger_id: triggerResponse.trigger.id,
    //     channel_id: triggered_channel,
    //   },
    // });
    // if (!putResponse.ok) {
    //   return { error: `Failed to put trigger: ${putResponse.error}` };
    // }

    // 完了メッセージ
    const postMessageResponse = await client.chat.postMessage({
      channel: triggered_channel,
      text:
        `<@${triggered_user}>さんがこのチャンネルでコーヒーチャットの設定をしました🎉\n[<!date^${start_time}^{date_pretty}]|???>から${frequency}週間毎の[${weekday}, <!date^${start_time}^{time}]|???>にマッチングします☕️`,
    });
    if (!postMessageResponse.ok) {
      return { error: `Failed to post message: ${postMessageResponse.error}` };
    }

    return { outputs: {} };
  },
);
