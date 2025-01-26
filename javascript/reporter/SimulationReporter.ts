import type { Reporter, Test, TestResult } from '@jest/reporters';
import type { AggregatedResult, TestContext } from '@jest/test-result';

export class SimulationReporter implements Reporter {
  private testResults: Map<string, any[]> = new Map();

  onRunStart(): void {
    console.log('\nStarting Simulation Tests...\n');
  }

  onTestStart(test: Test): void {
    this.testResults.set(test.path, []);
  }

  onTestResult(
    test: Test,
    testResult: TestResult,
    results: AggregatedResult
  ): void {
    const messages = this.testResults.get(test.path) || [];
    
    if (testResult.testResults) {
      testResult.testResults.forEach((result) => {
        if (result.status === 'passed') {
          console.log(`✓ ${result.title}`);
        } else if (result.status === 'failed') {
          console.log(`✗ ${result.title}`);
          if (result.failureMessages) {
            result.failureMessages.forEach((msg) => {
              console.log(`  ${msg}`);
            });
          }
          // Only show simulation messages for failed tests
          if (messages.length > 0) {
            console.log('\nSimulation Messages Leading to Failure:');
            messages.forEach((msg) => {
              console.log(`  ${msg.content}`);
            });
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

  addSimulationMessages(testPath: string, messages: any[]): void {
    const existingMessages = this.testResults.get(testPath) || [];
    this.testResults.set(testPath, [...existingMessages, ...messages]);
  }
}

export default SimulationReporter;
