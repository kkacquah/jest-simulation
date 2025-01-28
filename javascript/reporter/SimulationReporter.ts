import { SimulationResult } from "./types";

export class SimulationReport {
  constructor(private result: SimulationResult) {}

  private formatSimulationMessages(): string[] {
    const lines: string[] = [];
    const lastMessages = this.result.messages.slice(-6);

    lastMessages.forEach((msg, index) => {
      const stepNumber = this.result.messages.length - 6 + index + 1;
      const roleColor = msg.role === "user" ? "\x1b[36m" : "\x1b[35m";
      const resetColor = "\x1b[0m";
      lines.push(
        `  ${stepNumber}. ${roleColor}[${msg.role}]${resetColor} ${msg.content}`
      );
    });

    if (this.result.messages.length > 6) {
      lines.push(
        `  (${this.result.messages.length - 6} earlier steps not shown)`
      );
    }

    return lines;
  }

  toString(): string {
    const lines: string[] = [];
    lines.push(`\x1b[31m✗ ${this.result.testName}\x1b[0m`);

    // Always show the last 6 messages first
    if (this.result.messages.length > 0) {
      lines.push(...this.formatSimulationMessages());
      lines.push("");
    }

    // Then show the error
    if (this.result.error) {
      lines.push(`  \x1b[31m${this.result.error.message}\x1b[0m`);
      if (this.result.error.stack) {
        const stackLines = this.result.error.stack
          .split('\n')
          .slice(1) // Skip the first line as it contains the error message
          .map(line => `    ${line.trim()}`);
        lines.push("  Stack trace:");
        lines.push(...stackLines);
      }
    }

    return lines.join("\n");
  }
}

interface TestGroup {
  dirPath: string;
  results: SimulationResult[];
}

export class SimulationReporter {
  private testResults: Map<string, Map<string, SimulationResult>> = new Map();
  private totalTests: number = 0;
  private passedTests: number = 0;

  private write(message: string): void {
    process.stdout.write(message);
  }

  setSimulationResult(result: SimulationResult): void {
    let pathResults = this.testResults.get(result.path);
    if (!pathResults) {
      pathResults = new Map();
      this.testResults.set(result.path, pathResults);
    }

    // Only set the result if it doesn't exist or if the existing result has no error
    const existingResult = pathResults.get(result.testName);
    if (!existingResult || !existingResult.error) {
      pathResults.set(result.testName, result);
      this.totalTests++;
      
      if (!result.error) {
        this.passedTests++;
        this.write(`\x1b[32m✓ ${result.testName}\x1b[0m\n`);
      }
    }
  }

  private getFailedTests(): TestGroup[] {
    const groups: TestGroup[] = [];
    
    for (const [dirPath, pathResults] of this.testResults) {
      const failedResults = Array.from(pathResults.values())
        .filter(result => result.error);
      
      if (failedResults.length > 0) {
        groups.push({ dirPath, results: failedResults });
      }
    }

    return groups;
  }

  reportSimulation(): void {
    const failedGroups = this.getFailedTests();
    
    if (failedGroups.length === 0) {
      this.write(`\nAll ${this.totalTests} tests passed! ✨\n\n`);
      return;
    }

    const failureReports = failedGroups
      .map(group => {
        const failures = group.results
          .map(result => new SimulationReport(result).toString())
          .join('\n\n');
        return `\nIn ${group.dirPath}:\n${failures}`;
      })
      .join('\n');

    const summary = [
      '\nTest Failures:\n',
      failureReports,
      '\nTest Summary:',
      `Total Tests: ${this.totalTests}`,
      `Passed: \x1b[32m${this.passedTests}\x1b[0m`,
      `Failed: \x1b[31m${this.totalTests - this.passedTests}\x1b[0m\n`
    ].join('\n');

    this.write(summary);
  }

  getTestResults(): Map<string, Map<string, SimulationResult>> {
    return this.testResults;
  }
}

export default SimulationReporter;
