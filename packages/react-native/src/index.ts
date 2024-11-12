import { AsyncCacheAbsract } from "@cachex/core";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface CacheItem {
	expire?: number
	data: any
}

export default class ReactNativeCache extends AsyncCacheAbsract {
	public constructor(private readonly prefix?: string) {
		super()
	}
	public async get<T>(key: string, defaultValue?: T | undefined): Promise<T | undefined> {
		const raw = await AsyncStorage.getItem(this.getFinalKey(key))
		if (!raw) {
			return defaultValue != null ? defaultValue : undefined
		}

		const item = JSON.parse(raw)
		if (item.expire && item.expire < new Date().getTime()) {
			this.delete(key)
			return typeof defaultValue !== 'undefined' ? defaultValue : undefined
		}

		return item.data;
	}
	public async set<T>(key: string, value: T, ttl?: number | undefined): Promise<boolean> {
		let expire: number | undefined = undefined

		if (typeof ttl === 'number') {
			expire = new Date().getTime() + ttl * 1_000
		}

		const data: CacheItem = {
			data: value,
			expire
		}

		await AsyncStorage.setItem(this.getFinalKey(key), JSON.stringify(data))

		return true
	}

	public async delete(key: string): Promise<boolean> {
		await AsyncStorage.removeItem(this.getFinalKey(key))
		return true
	}

	public async clear(): Promise<boolean> {
		await AsyncStorage.multiRemove(await this.keys())
		return true
	}

	public async has(key: string): Promise<boolean> {
		return !!await this.get(key)
	}

	private async keys(): Promise<Array<string>> {
		const list: Array<string> = []

		for (const key of await AsyncStorage.getAllKeys()) {
			if (this.prefix && !key.startsWith(`@${this.prefix}/`)) {
				continue;
			}
			list.push(key);
		}

		return list;
	}

	private getFinalKey(key: string): string {
		if (typeof this.prefix !== 'string') {
			return key
		}

		return `@${this.prefix}/${key}`
	}
}
