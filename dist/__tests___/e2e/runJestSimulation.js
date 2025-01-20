"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.json = void 0;
exports.default = runJest;
const path_1 = __importDefault(require("path"));
const dedent_1 = __importDefault(require("dedent"));
const jest_util_1 = require("jest-util");
const execa_1 = require("execa");
const graceful_fs_1 = __importDefault(require("graceful-fs"));
const strip_ansi_1 = __importDefault(require("strip-ansi"));
const JEST_PATH = path_1.default.resolve(__dirname, '../packages/jest-cli/bin/jest.js');
// return the result of the spawned process:
//  [ 'status', 'signal', 'output', 'pid', 'stdout', 'stderr',
//    'envPairs', 'options', 'args', 'file' ]
async function runJest(dir, args, options = {}) {
    const result = await spawnJest(dir, args, options);
    if (result.isTerminated || result.isCanceled || result.isForcefullyTerminated) {
        throw new Error((0, dedent_1.default) `
      Spawned process was terminated.
      DETAILS:
        ${JSON.stringify(result, null, 2)}
    `);
    }
    return normalizeStdoutAndStderrOnResult(result, options);
}
// Spawns Jest and returns a Promise with the completed child process
async function spawnJest(dir, args = [], options = {}) {
    const isRelative = !path_1.default.isAbsolute(dir);
    if (isRelative) {
        dir = path_1.default.resolve(__dirname, dir);
    }
    const localPackageJson = path_1.default.resolve(dir, 'package.json');
    if (!options.skipPkgJsonCheck && !graceful_fs_1.default.existsSync(localPackageJson)) {
        throw new Error((0, dedent_1.default) `
      Make sure you have a local package.json file at
        ${localPackageJson}.
      Otherwise Jest will try to traverse the directory tree and find the global package.json, which will send Jest into infinite loop.
    `);
    }
    const env = {
        ...process.env,
        FORCE_COLOR: '0',
        NO_COLOR: '1',
        ...options.env,
    };
    if (options.nodeOptions)
        env['NODE_OPTIONS'] = options.nodeOptions;
    if (options.nodePath)
        env['NODE_PATH'] = options.nodePath;
    const spawnArgs = [JEST_PATH, ...args];
    const spawnOptions = {
        cwd: dir,
        env,
        reject: false,
        stripFinalNewline: !options.keepTrailingNewline,
        timeout: options.timeout || 0,
    };
    return (0, execa_1.execa)(process.execPath, spawnArgs, spawnOptions);
}
function normalizeStreamString(stream, options) {
    if (options.stripAnsi)
        stream = (0, strip_ansi_1.default)(stream);
    stream = (0, jest_util_1.normalizeIcons)(stream);
    return stream;
}
function normalizeStdoutAndStderrOnResult(result, options) {
    const stdout = normalizeStreamString(result.stdout, options);
    const stderr = normalizeStreamString(result.stderr, options);
    return { ...result, stderr, stdout };
}
// Runs `jest` with `--json` option and adds `json` property to the result obj.
//   'success', 'startTime', 'numTotalTests', 'numTotalTestSuites',
//   'numRuntimeErrorTestSuites', 'numPassedTests', 'numFailedTests',
//   'numPendingTests', 'testResults'
const json = async function (dir, args, options = {}) {
    args = [...(args || []), '--json'];
    const result = await runJest(dir, args, options);
    try {
        return {
            ...result,
            json: JSON.parse(result.stdout),
        };
    }
    catch (error) {
        throw new Error((0, dedent_1.default) `
      Can't parse JSON.
      ERROR: ${error.name} ${error.message}
      STDOUT: ${result.stdout}
      STDERR: ${result.stderr}
    `);
    }
};
exports.json = json;
