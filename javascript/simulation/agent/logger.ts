export class SimulationLogger {
  private isDebugMode: boolean;

  constructor(isDebugMode: boolean = false) {
    this.isDebugMode = isDebugMode;
  }

  debug(message: string, ...args: any[]) {
    if (this.isDebugMode) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }

  logConversation(role: string, content: string) {
    if (this.isDebugMode) {
      console.log(`[CONVERSATION] ${role}: ${content}`);
    }
  }

  logExpectEvaluation(result: boolean) {
    if (this.isDebugMode) {
      console.log(`[EXPECT] Condition evaluated to: ${result}`);
    }
  }
}