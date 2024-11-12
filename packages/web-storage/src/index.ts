import { CacheAsbract } from '@cachex/core'

interface CacheItem<T> {
	data: T
	expire?: number | undefined
}

/**
 * A cache implementation that uses browser storage.
 *
 * This class extends `CacheAsbract` and provides a concrete implementation
 * of the caching interface. It stores cached items in browser storage,
 * which is suitable for storing small amounts of data.
 */
export default class BrowserStorageCache extends CacheAsbract {
	private storage: Storage

	public constructor(private readonly prefix?: string, session = false) {
		super()
		try {
			window
		} catch {
			throw new Error('The current context is not in a browser or the variable "window" is not available.')
		}
		if (session) {
			this.storage = window.sessionStorage
		} else {
			this.storage = window.localStorage
		}
		if (!this.storage) {
			throw new Error('window.localStorage or window.sessionStorage are unavailable.')
		}
	}

	public get<T>(key: string, defaultValue?: T | undefined): T | undefined {
		const raw = this.storage.getItem(this.getFinalKey(key))

		if (!raw) {
			return defaultValue ?? undefined
		}

		const item: CacheItem<T> = JSON.parse(raw)

		if (item.expire && item.expire < new Date().getTime()) {
			this.delete(key)
			return defaultValue ?? undefined
		}

		return item.data
	}

	public set<T>(key: string, value: T, ttl?: number | undefined): boolean {
		let expire = undefined
		if (ttl) {
			expire = (new Date()).getTime() + (ttl * 1000)
		}
		const data: CacheItem<unknown> = {
			data: value,
			expire: expire
		}
		this.storage.setItem(this.getFinalKey(key), JSON.stringify(data))

		return true
	}

	public delete(key: string): boolean {
		this.storage.removeItem(this.getFinalKey(key))

		return true
	}

	public clear(): boolean {
		const keys = this.keys()
		return this.deleteMultiple(keys)
	}

	public has(key: string): boolean {
		return !!this.storage.getItem(this.getFinalKey(key))
	}

	/**
	* get the list of keys that are in the context of this cache component
	*/
	private keys(): Array<string> {
		const list: Array<string> = []

		for (let idx = 0; idx < this.storage.length; idx++) {
			const key = this.storage.key(idx)
			if (typeof key !== 'string' || this.prefix && !key?.startsWith(`@${this.prefix}/`)) {
				continue
			}
			list.push(key)
		}

		return list
	}

	/**
	* retrieve the prefixed key from the original
	* @param key the original key without prefix
	* @returns the new key with the prefix if set
	*/
	private getFinalKey(key: string): string {
		if (!this.prefix) {
			return key
		}
		return `@${this.prefix}/${key}`
	}
}
