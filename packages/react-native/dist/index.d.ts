import { AsyncCacheAbsract } from '@cachex/core';

declare class ReactNativeCache extends AsyncCacheAbsract {
    private readonly prefix?;
    constructor(prefix?: string | undefined);
    get<T>(key: string, defaultValue?: T | undefined): Promise<T | undefined>;
    set<T>(key: string, value: T, ttl?: number | undefined): Promise<boolean>;
    delete(key: string): Promise<boolean>;
    clear(): Promise<boolean>;
    has(key: string): Promise<boolean>;
    private keys;
    private getFinalKey;
}

export { ReactNativeCache as default };
