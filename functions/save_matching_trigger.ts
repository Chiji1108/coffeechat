import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { WEEKDAYS } from "https://deno.land/x/deno_slack_api@1.7.0/typed-method-types/workflows/triggers/scheduled.ts";
import MatchingWorkflow from "../workflows/matching.ts";
import TriggerDatastore from "../datastores/trigger.ts";

type WeekdayUnion = typeof WEEKDAYS[keyof typeof WEEKDAYS];

export const SaveMatchingTriggerFunction = DefineFunction({
  callback_id: "save_matching_trigger_function",
  title: "Save matching trigger",
  source_file: "functions/save_matching_trigger.ts",
  input_parameters: {
    properties: {
      triggered_user: {
        type: Schema.slack.types.user_id,
      },
      triggered_channel: {
        type: Schema.slack.types.channel_id,
      },
      start_time: {
        type: Schema.slack.types.timestamp,
      },
      // delete_matching_history: {
      //   type: Schema.types.boolean,
      // },
      frequency: {
        type: Schema.types.integer,
      },
    },
    required: [
      "triggered_user",
      "triggered_channel",
      "start_time",
      // "delete_matching_history",
      "frequency",
    ],
  },
});

export default SlackFunction(
  SaveMatchingTriggerFunction,
  async ({ inputs, client }) => {
    const {
      triggered_channel,
      triggered_user,
      frequency,
      start_time,
    } = inputs;

    // Validation & データ整形
    // const channelResponse = await client.conversations.info({
    //   channel: triggered_channel,
    // });
    // if (!channelResponse.ok) {
    //   return { error: `Failed to get channel info: ${channelResponse.error}` };
    // }
    // if (!channelResponse.channel.is_channel) {
    //   const response = await client.chat.postEphemeral({
    //     channel: triggered_channel,
    //     text:
    //       `コーヒーチャットの設定に失敗しました😢\nグループやDMでは設定できません🗓️`,
    //     user: triggered_user,
    //   });
    //   if (!response.ok) {
    //     return { error: `Failed to send ephemeral message: ${response.error}` };
    //   }
    //   return { outputs: {} };
    // }
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

    // 以前のマッチング履歴の削除
    // if (delete_matching_history) {
    //   const membersResponse = await client.conversations.members({
    //     channel: triggered_channel,
    //   });
    //   if (!membersResponse.ok) {
    //     return {
    //       error:
    //         `Failed to get the channel's members: ${membersResponse.error}`,
    //     };
    //   }
    //   for (const member of membersResponse.members) {
    //     const response = await client.apps.datastore.delete({
    //       datastore: MatchingHistoryDatastore.name,
    //       id: member,
    //     });
    //     //ここいらない？
    //     if (!response.ok) {
    //       return { error: `Failed to delete item: ${response}` };
    //     }
    //   }
    // }

    // 前のトリガーを削除
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

    // const allTriggers = await client.workflows.triggers.list();
    // if (!allTriggers.ok) {
    //   return { error: `Failed to get triggers: ${allTriggers.error}` };
    // }
    // const matchingTriggers = allTriggers.triggers.filter((trigger) =>
    //   trigger.workflow.callback_id ===
    //     MatchingWorkflow.definition.callback_id &&
    //   trigger.type === "scheduled"
    // );
    // for (const trigger of matchingTriggers) {
    //   const response = await client.workflows.triggers.delete(
    //     { trigger_id: trigger.id },
    //   );
    //   if (!response.ok) {
    //     return { error: `Failed to delete trigger: ${response.error}` };
    //   }
    // }

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
    const putResponse = await client.apps.datastore.put<
      typeof TriggerDatastore.definition
    >({
      datastore: TriggerDatastore.name,
      item: {
        trigger_id: triggerResponse.trigger.id,
        channel_id: triggered_channel,
      },
    });
    if (!putResponse.ok) {
      return { error: `Failed to put trigger: ${putResponse.error}` };
    }

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
