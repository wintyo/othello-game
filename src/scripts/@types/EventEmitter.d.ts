type tValues<T extends Object> = T[keyof T];
// voidのkeyリストを返す
type tEmptyValueKeys<T> = tValues<{
  [K in keyof T]: T[K] extends void ? K : never;
}>;
// void以外のkeyリストを返す
type tNonEmptyValuedKeys<T> = tValues<{
  [K in keyof T]: T[K] extends void ? never : K;
}>;

declare module 'events' {
  export interface EventEmitter<T> {
    addListener<K extends keyof T>(event: K, listener: (arg: T[K]) => any): this;
    on<K extends keyof T>(event: K, listener: (arg: T[K]) => any): this;
    off<K extends keyof T>(event: K, listener: (arg: T[K]) => any): this;
    once<K extends keyof T>(event: K, listener: (arg: T[K]) => any): this;
    removeListener<K extends keyof T>(event: K, listener: (arg: T[K]) => any): this;
    removeAllListeners<K extends keyof T>(event?: K): this;
    setMaxListeners(n: number): this;
    getMaxListeners(): number;
    listeners<K extends keyof T>(event: K): ((arg: T[K]) => any)[];
    emit<K extends tEmptyValueKeys<T>>(event: K): boolean;
    emit<K extends tNonEmptyValuedKeys<T>>(event: K, arg: T[K]): boolean;
    listenerCount<K extends keyof T>(type: K): number;
    // Added in Node 6...
    prependListener<K extends keyof T>(event: K, listener: (arg: T[K]) => any): this;
    prependOnceListener<K extends keyof T>(event: K, listener: (arg: T[K]) => any): this;
    eventNames(): (string | symbol)[];
  }
}
