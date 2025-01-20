import { Result } from 'execa';
import type { FormattedTestResults } from '@jest/test-result';
type RunJestOptions = {
    keepTrailingNewline?: boolean;
    nodeOptions?: string;
    nodePath?: string;
    skipPkgJsonCheck?: boolean;
    stripAnsi?: boolean;
    timeout?: number;
    env?: NodeJS.ProcessEnv;
};
export default function runJest(dir: string, args?: Array<string>, options?: RunJestOptions): Promise<RunJestResult>;
export type RunJestResult = Result;
export interface RunJestJsonResult extends RunJestResult {
    json: FormattedTestResults;
}
export declare const json: (dir: string, args?: Array<string>, options?: RunJestOptions) => Promise<RunJestJsonResult>;
export {};
