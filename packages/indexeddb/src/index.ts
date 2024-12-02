import { AsyncCacheAbsract } from '@cachex/core'

interface CacheItem<T> {
	value: T
	expire?: number | undefined
}

export default class IndexedDBCache extends AsyncCacheAbsract {
	private db?: IDBDatabase
	private status: 'ready' | 'connecting' | 'failed' = 'connecting'
	private table = 'cache'
	public constructor(db: string = 'cachex') {
		super()
		const request = window.indexedDB.open(db, 1)

		// handle connection error
		request.onerror = () => {
			this.status = 'failed'
			console.error(`Database access refused !`)
		}

		// setup the database
		request.onupgradeneeded = (ev) => {
			// @ts-expect-error Typescirpt don't know the result
			const db: IDBDatabase = ev.target.result

			db.createObjectStore(this.table)
		}

		// on success
		request.onsuccess = (ev) => {
			// @ts-expect-error Typescirpt don't know the result
			this.db = ev.target.result
			this.status = 'ready'
		}
	}

	public override async get<T>(key: string, defaultValue?: T): Promise<T | undefined> {
		const data = await this.internalGet<T>(key)

		// handle expiration
		if (data && data.expire && data.expire < new Date().getTime()) {
			await this.delete(key)
			return defaultValue
		}

		// return the final value or the default value
		return data?.value ?? defaultValue
	}

	public override async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
		// create the entry
		const data: CacheItem<T> = {
			value: value,
			expire: ttl ? new Date().getTime() + ttl * 1000 : undefined
		}

		// check if the key already exists
		const exists = !!(await this.internalGet(key))

		// get a new transation (need to be after `exists`)
		const os = await this.getTransation()

		return new Promise((res) => {
			// need to run different request depending on if the data already exists or not
			let query: IDBRequest<IDBValidKey> = exists
				? os.put(data, key)
				: os.add(data, key)

			// handle result states
			query.onsuccess = () => res(true)
			query.onerror = () => res(false)
		})
	}

	public override async delete(key: string): Promise<boolean> {
		const os = await this.getTransation()

		return new Promise((res) => {
			// delete the entry
			const request = os.delete(key)

			// handle result states
			request.onsuccess = () => res(true)
			request.onerror = () => res(false)
		})
	}

	public override async clear(): Promise<boolean> {
		const os = await this.getTransation()

		return new Promise((res) => {
			// list keys
			const request = os.getAllKeys()
			request.onsuccess = async () => {
				// delete each keys
				res(await this.deleteMultiple(request.result as Array<string>))
			}
		})
	}

	public override async has(key: string): Promise<boolean> {
		return !!(await this.get(key))
	}

	/**
	* get the object from the database
	* @param key the key to get
	* @returns the object if in the database
	*/
	private async internalGet<T>(key: string): Promise<CacheItem<T> | undefined> {
		const os = await this.getTransation()

		return new Promise((res) => {
			// get the item from the DB
			const query = os.get(key)

			// handle result states
			query.onsuccess = () => res(query.result)
			query.onerror = () => res(undefined)
		})
	}

	/**
	 * helper to run a requeset against the database
	 *
	 * @returns the transation ObjectStore
	 */
	private async getTransation(): Promise<IDBObjectStore> {
		// wait for the database to be ready
		while (this.status !== 'ready') {

			// handle case where the database cannot be connected to
			if (this.status === 'failed') {
				throw new Error('cannot connect to DB')
			}

			// wait some time until it's ready
			await new Promise((res) => setTimeout(res, 20))
		}

		// create the transaction
		return this.db!
			.transaction(this.table, "readwrite")
			.objectStore(this.table)
	}
}
