import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';
import { ISlashCommand, SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { AsanaApp } from '../../AsanaApp';
import { sendNotification } from '../helpers/message';
import { authorize } from './subcommands/authorize';

export class AsanaCommand implements ISlashCommand {
  public command = 'asana';
  public i18nParamsExample = 'slashcommand_params';
  public i18nDescription = 'slashcommand_description';
  public providesPreview = false;

  constructor(private readonly app: AsanaApp) {}

  public async executor(
    context: SlashCommandContext,
    read: IRead,
    modify: IModify,
    http: IHttp,
    persistence: IPersistence
  ): Promise<void> {
    const command = this.getCommandFromContextArguments(context);
    if (!command) {
      return await this.displayAppHelpMessage(read, modify, context.getSender(), context.getRoom());
    }

    switch (command) {
     
      case 'auth':
        await authorize(this.app, read, modify, context.getSender(), persistence);
        break;
      default:
        await this.displayAppHelpMessage(read, modify, context.getSender(), context.getRoom());
        break;
    }
  }

  private getCommandFromContextArguments(context: SlashCommandContext): string {
    const [command] = context.getArguments();
    return command;
  }

  private async displayAppHelpMessage(
    read: IRead,
    modify: IModify,
    user: IUser,
    room: IRoom
  ): Promise<void> {
    const text = 
    `Asana App provides you the following slash commands, /asana:
        1. \`help:\` shows this list.
        2. \`auth:\` starts the process to authorize your Asana Account.
    `;

    return sendNotification({
      modify: modify,
      user: user,
      room: room,
      message: text,
    });
  }
}