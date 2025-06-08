import { IAppAccessors, IAppInstallationContext, IConfigurationExtend, IHttp, ILogger, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { IAuthData, IOAuth2Client, IOAuth2ClientOptions } from '@rocket.chat/apps-engine/definition/oauth2/IOAuth2';
import { isUserHighHierarchy, sendDirectMessage } from './src/helpers/message';
import { AsanaCommand } from './src/commands/AsanaCommand';
import { createOAuth2Client } from "@rocket.chat/apps-engine/definition/oauth2/OAuth2";
import { getUser } from "./src/webhook/apiHandler";
import {
  ApiVisibility,
  ApiSecurity,
} from "@rocket.chat/apps-engine/definition/api";
import { ReceiveWebhookEndpoint } from "./src/webhook/webhookServer";


export class AsanaApp extends App {
  public botUser: IUser;
  public readonly botUsername: string = "asana-app.bot";
  private readonly oauth2ClientInstance: IOAuth2Client;

  private oauth2Config: IOAuth2ClientOptions = {
    alias: "asana-app",
    accessTokenUri: "https://app.asana.com/-/oauth_token",
    authUri: "https://app.asana.com/-/oauth_authorize",
    refreshTokenUri: "https://app.asana.com/-/oauth_token",
    revokeTokenUri: "https://app.asana.com/-/oauth_revoke",
    authorizationCallback: this.authorizationCallback.bind(this),
    defaultScopes: [
      // "users:read",
      // "workspaces:read",
      // "tasks:read",
      // "tasks:write",
      // "tasks:delete",
      // "teams:read",
      // "projects:read",
      // "goals:read",
      // "attachments:write",
      "default",
    ],
  };

  constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
    super(info, logger, accessors);

    this.oauth2ClientInstance = createOAuth2Client(this, this.oauth2Config);
  }

  private async authorizationCallback(
    token: IAuthData,
    user: IUser,
    read: IRead,
    modify: IModify,
    http: IHttp,
    persistence: IPersistence
  ) {
    const msg = await getUser(token.token, http);
    const username = msg.name;
    const email = msg.email;

    const text = `✅ Successfully authenticated as ${username} - ${email}`;
    await sendDirectMessage({
      read: read,
      modify: modify,
      user: user,
      message: text,
      persistence: persistence,
    });
  }

  public async onInstall(
    context: IAppInstallationContext,
    read: IRead,
    http: IHttp,
    persistence: IPersistence,
    modify: IModify
  ): Promise<void> {
    const user = context.user;
    const quickReminder =
      "Quick reminder: Let your team members know about the Asana App, so everyone will be able to manage their tasks.\n";
    const text =
      `Welcome to the Asana Rocket.Chat App!\n` +
      `To start managing your workspaces, projects, tasks, etc. ` +
      `You first need to complete the app's setup and then authorize your Asana account.\n` +
      `To do so, type  \`/asana auth\`\n` +
      `${isUserHighHierarchy(user) ? quickReminder : ""}`;
    await sendDirectMessage({
      read: read,
      modify: modify,
      user: user,
      message: text,
      persistence: persistence,
    });
  }

  public getOauth2ClientInstance(): IOAuth2Client {
    return this.oauth2ClientInstance;
  }

  public async extendConfiguration(
    configuration: IConfigurationExtend
  ): Promise<void> {
    await Promise.all([
      this.getOauth2ClientInstance().setup(configuration),
      configuration.slashCommands.provideSlashCommand(new AsanaCommand(this)),
      configuration.api.provideApi({
        visibility: ApiVisibility.PUBLIC,
        endpoints: [new ReceiveWebhookEndpoint(this)],
        security: ApiSecurity.UNSECURE,
      }),
    ]);
  }
}
