import type { Reporter, Test, TestResult } from '@jest/reporters';
import type { AggregatedResult, TestContext } from '@jest/test-result';
import { SimulationResult } from './types';

export class SimulationReporter implements Reporter {
  private testResults: Map<string, SimulationResult> = new Map();

  onRunStart(): void {
    console.log('\nStarting Simulation Tests...\n');
  }

  onTestStart(test: Test): void {
    this.testResults.set(test.path, { messages: [] });
  }

  /**
   * Format a successful test result
   * Output format: [test title] (in green)
   */
  private formatSuccessResult(title: string): string {
    return `\x1b[32m✓ ${title}\x1b[0m`;
  }

  /**
   * Format error messages from Jest failure output
   * Output format:
   *   Error: [error message] (in red)
   *   Expected: [expected value]
   *   Received: [received value]
   */
  private formatErrorMessages(failureMessages: string[]): string[] {
    const formattedMessages: string[] = [];
    
    failureMessages.forEach((msg) => {
      const errorMatch = msg.match(/Error:(.+?)(?=\n|$)/);
      if (errorMatch) {
        formattedMessages.push(`  \x1b[31mError: ${errorMatch[1].trim()}\x1b[0m`);
      }

      if (msg.includes('matcherResult')) {
        const matcherLines = msg.split('\n')
          .filter(line => line.includes('Expected:') || line.includes('Received:'))
          .map(line => `  ${line.trim()}`);
        formattedMessages.push(...matcherLines);
      }
    });

    return formattedMessages;
  }

  /**
   * Format simulation messages with role-based colors
   * Output format:
   *   [step number]. [role] message (user in cyan, assistant in magenta)
   *   Error: [error message] (if present, in red)
   */
  private formatSimulationMessages(result: SimulationResult): string[] {
    const formattedMessages: string[] = [];
    const lastMessages = result.messages.slice(-6);
    
    lastMessages.forEach((msg, index) => {
      const stepNumber = result.messages.length - 6 + index + 1;
      const roleColor = msg.role === 'user' ? '\x1b[36m' : '\x1b[35m';
      const resetColor = '\x1b[0m';
      formattedMessages.push(
        `  ${stepNumber}. ${roleColor}[${msg.role}]${resetColor} ${msg.content}`
      );
    });

    if (result.error) {
      formattedMessages.push(
        `     \x1b[31mError: ${result.error.message}\x1b[0m`
      );
    }

    if (result.messages.length > 6) {
      formattedMessages.push(`  (${result.messages.length - 6} earlier steps not shown)`);
    }

    return formattedMessages;
  }

  onTestResult(
    test: Test,
    testResult: TestResult,
  ): void {
    const simulationResult = this.testResults.get(test.path) || { messages: [] };
    
    if (testResult.testResults) {
      testResult.testResults.forEach((assertionResult) => {
        if (assertionResult.status === 'passed') {
          console.log(this.formatSuccessResult(assertionResult.title));
        } else if (assertionResult.status === 'failed') {
          console.log(`\x1b[31m✗ ${assertionResult.title}\x1b[0m`);
          
          if (assertionResult.failureMessages) {
            console.log(`\nError Messages: ${assertionResult.failureMessages.length}`);
            console.log(`\nSimulation Result: ${simulationResult}`);
            const errorMessages = this.formatErrorMessages(assertionResult.failureMessages);
            errorMessages.forEach(msg => console.log(msg));
          }

          if (simulationResult.messages.length > 0) {
            console.log('\nLast 6 Simulation Steps Leading to Failure:');
            const formattedMessages = this.formatSimulationMessages(simulationResult);
            formattedMessages.forEach(msg => console.log(msg));
            console.log('\n');
          }
        }
      });
    }
  }

  onRunComplete(contexts: Set<TestContext>, results: AggregatedResult): void {
    console.log('\nSimulation Test Results:');
    console.log(`Total Tests: ${results.numPassedTests + results.numFailedTests}`);
    console.log(`Passed: ${results.numPassedTests}`);
    console.log(`Failed: ${results.numFailedTests}`);
    console.log(`Duration: ${(Date.now() - results.startTime) / 1000}s\n`);
  }

  addSimulationMessages(testPath: string, result: SimulationResult): void {
    this.testResults.set(testPath, result);
  }
}

export default SimulationReporter;
