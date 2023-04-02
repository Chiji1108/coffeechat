import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import MatchingHistoryDatastore from "../datastores/matching_history.ts";
import { getDifference, getRandom, removeItem } from "../utils/utils.ts";
import { MatchingResultCustomType } from "../types/matching_result.ts";

export const MatchingFunction = DefineFunction({
  callback_id: "matching_function",
  title: "Matching Function",
  source_file: "functions/matching.ts",
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
  output_parameters: {
    properties: {
      matching_result: {
        type: MatchingResultCustomType,
      },
    },
    required: ["matching_result"],
  },
});

export default SlackFunction(
  MatchingFunction,
  async ({ inputs, client }) => {
    const { channel, user } = inputs;

    //Validation
    // const channelResponse = await client.conversations.info({
    //   channel,
    // });
    // if (!channelResponse.ok) {
    //   return { error: `Failed to get channel info: ${channelResponse.error}` };
    // }
    // if (!channelResponse.channel.is_channel) {
    //   if (user) {
    //     const response = await client.chat.postEphemeral({
    //       channel,
    //       text:
    //         `マッチングに失敗しました😢\nグループやDMではマッチングできません🚧`,
    //       user,
    //     });
    //     if (!response.ok) {
    //       return { error: `Failed to send message: ${response.error}` };
    //     }
    //     return {
    //       error:
    //         `マッチングに失敗しました😢\nグループやDMではマッチングできません🚧`,
    //     };
    //   } else {
    //     const response = await client.chat.postMessage({
    //       channel,
    //       text:
    //         `マッチングに失敗しました😢\nグループやDMではマッチングできません🚧`,
    //     });
    //     if (!response.ok) {
    //       return { error: `Failed to send message: ${response.error}` };
    //     }
    //     return {
    //       error:
    //         `マッチングに失敗しました😢\nグループやDMではマッチングできません🚧`,
    //     };
    //   }
    // }

    if (user) {
      await client.chat.postMessage({
        channel,
        text: `<@${user}>さんによってマッチングを開始します☕️`,
      });
    } else {
      await client.chat.postMessage({
        channel,
        text: `スケジューラーによりマッチングを開始します☕️`,
      });
    }

    const membersResponse = await client.conversations.members({ channel });
    if (!membersResponse.ok) {
      return {
        error: `Failed to get the channel's members: ${membersResponse.error}`,
      };
    }

    const matchedGroups: string[][] = [];
    const unmatchedUsers: string[] = membersResponse.members;

    const matchingHistory = new Map<string, string[]>();
    const getMatchedUsers = async (
      u: string,
    ) => {
      const datastoreResponse = await client.apps.datastore.get<
        typeof MatchingHistoryDatastore.definition
      >({
        datastore: MatchingHistoryDatastore.name,
        id: u,
      });
      if (!datastoreResponse.ok) {
        throw new Error(
          `Failed to access matching history datastore: ${datastoreResponse.error}`,
        );
      }
      matchingHistory.set(u, datastoreResponse.item.matched_users ?? []);
    };
    try {
      await Promise.all(
        unmatchedUsers.map(getMatchedUsers),
      );
    } catch (error) {
      return { error };
    }

    while (unmatchedUsers.length >= 2) {
      const userA = getRandom(unmatchedUsers);
      const matchedUsersForA = matchingHistory.get(userA);
      if (!matchedUsersForA) return { error: `Map() Coding Error` };
      console.log("matchedUsersForA", matchedUsersForA);

      const unmatchedUsersExceptA = unmatchedUsers.filter((u) => u != userA);
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
      const matchedUsersForB = matchingHistory.get(userB);
      if (!matchedUsersForB) return { error: `Map() Coding Error` };
      console.log("matchedUsersForB", matchedUsersForB);

      matchingHistory.set(userA, [...new Set([...matchedUsersForA, userB])]);
      matchingHistory.set(userB, [...new Set([...matchedUsersForB, userA])]);
      matchedGroups.push([userA, userB]);

      removeItem(unmatchedUsers, userA);
      removeItem(unmatchedUsers, userB);
    }

    const putMatchedUsers = async (u: string, users: string[]) => {
      const putDatastoreResponse = await client.apps.datastore.put<
        typeof MatchingHistoryDatastore.definition
      >({
        datastore: MatchingHistoryDatastore.name,
        item: {
          user_id: u,
          matched_users: [...new Set(users)],
        },
      });
      if (!putDatastoreResponse.ok) {
        throw new Error(
          `Failed to put B Response: ${putDatastoreResponse.error}`,
        );
      }
    };
    try {
      await Promise.all(
        Array.from(matchingHistory.entries()).map(([key, value]) =>
          putMatchedUsers(key, value)
        ),
      );
    } catch (error) {
      return { error };
    }

    return {
      outputs: {
        matching_result: {
          matched_groups: matchedGroups,
          unmatched_users: unmatchedUsers,
        },
      },
    };
  },
);
