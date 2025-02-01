import { ConversationMessage } from "./conversationGenerators/BaseConversationGenerator";

const colors = {
  debug: "\x1b[90m", // gray
  assistant: "\x1b[35m", // magenta
  user: "\x1b[36m", // cyan
  reset: "\x1b[0m",
  stop: "\x1b[31m" // red
} as const;

export class SimulationLogger {
  private isDebugMode: boolean;

  constructor(isDebugMode: boolean = false) {
    this.isDebugMode = isDebugMode;
  }

  debug(message: string, ...args: any[]) {
    if (this.isDebugMode) {
      process.stdout.write(`${colors.debug}[DEBUG] ${message}${colors.reset}\n`);
      if (args.length > 0) {
        process.stdout.write(`${colors.debug}${JSON.stringify(args, null, 2)}${colors.reset}\n`);
      }
    }
  }

  logConversation(message: ConversationMessage) {
    if (this.isDebugMode) {
      if ('stopTokenReturned' in message) {
        process.stdout.write(`[STOP TOKEN RETURNED] ${colors[message.role]}[${message.role}]${colors.reset}\n`);
        return;
      }
      process.stdout.write(`[CONVERSATION] ${colors[message.role]}[${message.role}]${colors.reset}: ${message.content}\n`);
    }
  }

  logExpectEvaluation(result: boolean) {
    if (this.isDebugMode) {
      process.stdout.write(`${colors.debug}[EXPECT] Condition evaluated to: ${result}${colors.reset}\n`);
    }
  }
}