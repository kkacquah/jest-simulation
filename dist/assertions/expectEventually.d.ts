export declare const expectEventually: <T>(fn: () => Promise<T> | T, timeout?: number, interval?: number) => Promise<void>;
