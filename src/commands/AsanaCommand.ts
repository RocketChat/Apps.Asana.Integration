import {
  IHttp,
  IModify,
  IPersistence,
  IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import {
  ISlashCommand,
  SlashCommandContext,
} from "@rocket.chat/apps-engine/definition/slashcommands";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { AsanaApp } from "../../AsanaApp";
import { sendNotification } from "../helpers/message";
import { authorize } from "./subcommands/authorize";
import { logoutUser } from "./subcommands/logout";
import { registerWebhook } from "./subcommands/registerWebhook";
import { deleteWebhook } from "./subcommands/deleteWebhook";

export class AsanaCommand implements ISlashCommand {
  public command = "asana";
  public i18nParamsExample = "slashcommand_params";
  public i18nDescription = "slashcommand_description";
  public providesPreview = false;

  constructor(private readonly app: AsanaApp) {}

  public async executor(
    context: SlashCommandContext,
    read: IRead,
    modify: IModify,
    http: IHttp,
    persistence: IPersistence
  ): Promise<void> {
    const [command, params] = this.getCommandFromContextArguments(context);

    if (!command) {
      return await this.displayAppHelpMessage(
        read,
        modify,
        context.getSender(),
        context.getRoom()
      );
    }

    switch (command) {
      case "auth":
        await authorize(
          this.app,
          read,
          modify,
          context.getSender(),
          persistence
        );
        break;

      case "register-webhook":
        await registerWebhook(
          this.app,
          read,
          modify,
          context.getSender(),
          params,
          persistence,
          http
        );
        break;

      case "delete-webhook":
        await deleteWebhook(
          this.app,
          read,
          modify,
          context.getSender(),
          params,
          persistence,
          http
        );
        break;

      case "logout":
        await logoutUser(read, modify, persistence, context.getSender());
        break;
      default:
        await this.displayAppHelpMessage(
          read,
          modify,
          context.getSender(),
          context.getRoom()
        );
        break;
    }
  }

  private getCommandFromContextArguments(
    context: SlashCommandContext
  ): [string, string[]] {
    const [command, ...params] = context.getArguments();
    return [command, params];
  }

  private async displayAppHelpMessage(
    read: IRead,
    modify: IModify,
    user: IUser,
    room: IRoom
  ): Promise<void> {
    const text = `Asana App provides you the following slash commands, /asana:
        1. \`help:\` Shows this list.
        2. \`auth:\` Starts the process to authorize your Asana Account.
        3. \`logout:\` logout or end the session from your Asana Account.
        4. \`register-webhook:\` Register the webhook with asana for recieveing real time events.
        5. \`delete-webhook:\` Disconnect the webhook, it will stop recieving the real time events from Asana.
    `;

    return sendNotification({
      modify: modify,
      user: user,
      room: room,
      message: text,
    });
  }
}
