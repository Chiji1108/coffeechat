import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import MatchingHistoryDatastore from "../datastores/matching_history.ts";
import { getDifference, getRandom, removeItem } from "../utils/utils.ts";

export const MatchingFunction = DefineFunction({
  callback_id: "matching_function",
  title: "Matching Function",
  source_file: "functions/matching.ts",
  input_parameters: {
    properties: {
      channel: {
        type: Schema.slack.types.channel_id,
      },
    },
    required: ["channel"],
  },
});

export default SlackFunction(
  MatchingFunction,
  async ({ inputs, client }) => {
    const { channel } = inputs;

    //Validation
    const channelResponse = await client.conversations.info({
      channel,
    });
    if (!channelResponse.ok) {
      return { error: `Failed to get channel info: ${channelResponse.error}` };
    }
    if (!channelResponse.channel.is_channel) {
      const response = await client.chat.postMessage({
        channel,
        text:
          `マッチングに失敗しました😢\nグループやDMではマッチングできません🚧`,
      });
      if (!response.ok) {
        return { error: `Failed to send message: ${response.error}` };
      }
      return {
        outputs: {
          // error: "",
        },
      };
    }
    if (channelResponse.channel.is_ext_shared) {
      const response = await client.chat.postMessage({
        channel,
        text:
          `マッチングに失敗しました😢\n現在アラムナイを含むチャンネルではマッチングできません🚧`,
      });
      if (!response.ok) {
        return { error: `Failed to send message: ${response.error}` };
      }
      return {
        outputs: {
          // error: "",
        },
      };
    }

    const membersResponse = await client.conversations.members({ channel });
    if (!membersResponse.ok) {
      return {
        error: `Failed to get the channel's members: ${membersResponse.error}`,
      };
    }

    const unmatchedUsers: string[] = membersResponse.members;

    while (unmatchedUsers.length >= 2) {
      const userA = getRandom(unmatchedUsers);
      const unmatchedUsersExceptA = unmatchedUsers.filter((u) => u != userA);

      const getAResponse = await client.apps.datastore.get<
        typeof MatchingHistoryDatastore.definition
      >({
        datastore: MatchingHistoryDatastore.name,
        id: userA,
      });
      if (!getAResponse.ok) {
        return {
          error:
            `Failed to access matching history datastore: ${getAResponse.error}`,
        };
      }
      const matchedUsersForA = getAResponse.item.matched_users ?? [];
      console.log("matchedUsersForA", matchedUsersForA);

      const targetsForUserA: string[] = [];
      const difference = [
        ...getDifference(
          new Set(unmatchedUsersExceptA),
          new Set(matchedUsersForA),
        ),
      ];
      if (difference.length > 0) {
        targetsForUserA.push(...difference);
      } else {
        targetsForUserA.push(...unmatchedUsersExceptA);
      }

      const userB = getRandom(targetsForUserA);
      console.log("userB", userB);

      const getBResponse = await client.apps.datastore.get<
        typeof MatchingHistoryDatastore.definition
      >({
        datastore: MatchingHistoryDatastore.name,
        id: userB,
      });
      if (!getBResponse.ok) {
        return { error: `Failed to get B response: ${getBResponse.error}` };
      }
      const matchedUsersForB = getBResponse.item.matched_users ?? [];
      console.log("matchedUsersForB", matchedUsersForB);
      const putAResponse = await client.apps.datastore.put<
        typeof MatchingHistoryDatastore.definition
      >({
        datastore: MatchingHistoryDatastore.name,
        item: {
          user_id: userA,
          matched_users: [...new Set([...matchedUsersForA, userB])],
        },
      });
      if (!putAResponse.ok) {
        return { error: `Failed to put A Response: ${putAResponse.error}` };
      }
      const putBResponse = await client.apps.datastore.put<
        typeof MatchingHistoryDatastore.definition
      >({
        datastore: MatchingHistoryDatastore.name,
        item: {
          user_id: userB,
          matched_users: [...new Set([...matchedUsersForB, userA])],
        },
      });
      if (!putBResponse.ok) {
        return { error: `Failed to put B Response: ${putBResponse.error}` };
      }
      const users = userA + "," + userB;
      console.log("users", users);
      const convOpenResponse = await client.conversations.open({
        users,
      });
      if (!convOpenResponse.ok) {
        return {
          error:
            `Failed to open conversation for ${users}: ${convOpenResponse.error}`,
        };
      }
      const postMessageResponse = await client.chat.postMessage({
        channel: convOpenResponse.channel.id,
        text:
          `<@${userA}>さん<@${userB}>さんこんにちは👋\n<#${channel}>のコーヒーチャットの時間です🎉\n2人の予定を合わせて楽しいコーヒーチャットを☕️`,
      });
      if (!postMessageResponse.ok) {
        return {
          error: `Failed to send message: ${postMessageResponse.error}`,
        };
      }
      removeItem(unmatchedUsers, userA);
      removeItem(unmatchedUsers, userB);
    }

    for (const user of unmatchedUsers) {
      console.log("user", user);
      const convOpenResponse = await client.conversations.open({
        users: user,
      });
      if (!convOpenResponse.ok) {
        return {
          error:
            `Failed to open conversation for ${user}: ${convOpenResponse.error}`,
        };
      }
      const postMessageResponse = await client.chat.postMessage({
        channel: convOpenResponse.channel.id,
        text:
          `<#${channel}>のコーヒーチャットはマッチング運により今回お休みです☕️\n次回をお楽しみに👋`,
      });
      if (!postMessageResponse.ok) {
        return {
          error: `Failed to send message: ${postMessageResponse.error}`,
        };
      }
    }

    const compMessageResponse = await client.chat.postMessage({
      channel: channel,
      text: `マッチング完了しました🎉\nコーヒーチャットの写真の投稿待ってます✉️`,
    });
    if (!compMessageResponse.ok) {
      return {
        error: `Failed to send message: ${compMessageResponse.error}`,
      };
    }

    return { outputs: {} };
  },
);
