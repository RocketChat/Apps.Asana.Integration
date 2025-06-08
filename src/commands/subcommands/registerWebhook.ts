import {
  IModify,
  IPersistence,
  IRead,
  IHttp,
} from "@rocket.chat/apps-engine/definition/accessors";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { AsanaApp } from "../../../AsanaApp";
import { RocketChatAssociationModel } from "@rocket.chat/apps-engine/definition/metadata";
import { RocketChatAssociationRecord } from "@rocket.chat/apps-engine/definition/metadata";
import { sendDirectMessage } from "../../helpers/message";
import { establishWebhook } from "../../webhook/apiHandler";

export async function registerWebhook(
  app: AsanaApp,
  read: IRead,
  modify: IModify,
  user: IUser,
  params: string[],
  persistence: IPersistence,
  http: IHttp
) {
  if (!params || params.length === 0) {
    await sendDirectMessage({
      read,
      modify,
      user,
      persistence,
      message: "⚠️ Please provide a resource ID to register the webhook.",
    });
    return;
  }

  const assoc = new RocketChatAssociationRecord(
    RocketChatAssociationModel.USER,
    user.id
  );

  const storedTokens = await read
    .getPersistenceReader()
    .readByAssociation(assoc);

  const tokenData = storedTokens[0] as {
    token: string;
    refreshToken: string;
    scope?: string | null;
    expiresAt?: number;
  };

  const accessToken = tokenData.token;
  const refreshToken = tokenData.refreshToken;

  const serverUrl = await read
    .getEnvironmentReader()
    .getServerSettings()
    .getValueById("Site_Url");

  const appId = app.getID();

  const targetUri = `${serverUrl}/recieveWebhook`; // for dev purpose use hardcoded ngrok.
//   const targetUri = `https://e97f-60-243-254-90.ngrok-free.app/api/apps/public/${appId}/receiveWebhook?userId=${user.id}`;

  const resourceId = params[0];

  app.getLogger().log("Value of resourceId ", resourceId);
  app.getLogger().log("Value of targetUri ", targetUri);

  try {
    const webhook = await establishWebhook(
      app,
      accessToken,
      targetUri,
      resourceId,
      http
    );

    await sendDirectMessage({
      read,
      modify,
      user,
      persistence,
      message: `✅ Webhook registered successfully! ID: ${webhook.gid}`,
    });
  } catch (err: any) {
    await sendDirectMessage({
      read,
      modify,
      user,
      persistence,
      message: `❌ Error registering webhook: ${err.message || err}`,
    });
  }
}
