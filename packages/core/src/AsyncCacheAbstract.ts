import { objectMap } from '@dzeio/object-util'
import type CacheInterface from '.'

export default abstract class AsyncCacheAsbract implements CacheInterface {

	public async getMultiple<T>(keys: Array<string>, defaultValues?: Array<T> | undefined): Promise<Record<string, T>> {
		const res: Record<string, T> = {}
		for (let idx = 0; idx < keys.length; idx++) {
			const key = keys[idx] as string
			const value = await this.get(key, defaultValues?.[idx]) as T | undefined
			if (typeof value === 'undefined') {
				continue
			}
			res[key] = value
		}
		return res
	}

	public async setMultiple<T>(values: Record<string, T>, ttl?: number | undefined): Promise<boolean> {
		await Promise.all(objectMap(values, (v, k) => {
			return this.set(k, v, ttl)
		}))
		return true
	}

	public async deleteMultiple(keys: Array<string>): Promise<boolean> {
		for await (const key of keys) {
			await this.delete(key)
		}
		return true
	}

	public abstract get<T>(key: string, defaultValue?: T): Promise<T | undefined>
	public abstract set<T>(key: string, value: T, ttl?: number): Promise<boolean>
	public abstract delete(key: string): Promise<boolean>
	public abstract clear(): Promise<boolean>
	public abstract has(key: string): Promise<boolean>
}
