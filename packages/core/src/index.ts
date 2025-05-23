/*!
 * Library based on the awesome PHP Psr 16 SimpleCache
 *
 * CacheX is a simple, easy to use and meant to be replaceable Cache library for most usage
 */

import CacheAsbract from "./CacheAbstract"
import AsyncCacheAbsract from "./AsyncCacheAbstract"

export {
	CacheAsbract,
	AsyncCacheAbsract
}

export default interface CacheInterface {
	/**
	 * Fetches a value from the cache.
	 *
	 * @param {string} key the key of the item you want to get
	 * @param defaultValue The default value to return if the key does not exist
	 *
	 * @returns The value from the cache or `defaultValue` or `undefined`
	 */
	get<T>(key: string, defaultValue?: T): Promise<T | undefined> | T | undefined

	/**
	 * Persists data in the cache, uniquely referenced by a key with an optional expiration TTL time.
	 *
	 * @param {string} key The key of the item to store.
	 * @param value The value of the item to store. Must be serializable.
	 * @param {undefined|number} ttl The TTL value of this item. If no value is sent and the driver supports TTL then the library may set a default value for it or let the driver take care of that.
	 *
	 * @returns {boolean} True on success and false on failure.
	 */
	set<T>(key: string, value: T, ttl?: number | undefined): Promise<boolean> | boolean

	/**
	 * Delete an item from the cache by its unique key.
	 *
	 * @param {string} key The unique cache key of the item to delete.
	 *
	 * @return True if the item was successfully removed. False if there was an error.
	 */
	delete(key: string): Promise<boolean> | boolean

	/**
	 * Wipes clean the entire cache's keys.
	 *
	 * @return boolean True on success and false on failure.
	 */
	clear(): Promise<boolean> | boolean

	/**
	 * Obtains multiple cache items by their unique keys.
	 *
	 * @param keys A list of keys that can obtained in a single operation.
	 * @param defaultValues $default Default value to return for keys that do not exist.
	 *
	 * @return iterable A list of key => value pairs. Cache keys that do not exist or are stale will have $default as value.
	 */
	getMultiple<T>(keys: Array<string>, defaultValues?: Array<T>): Promise<Record<string, T>> | Record<string, T>

	/**
	 * Persists a set of key => value pairs in the cache, with an optional TTL.
	 *
	 * @param values A list of key => value pairs for a multiple-set operation.
	 * @param {number|undefined} ttl Optional. The TTL value of this item. If no value is sent and the driver supports TTL then the library may set a default value for it or let the driver take care of that.
	 *
	 * @return bool True on success and false on failure.
	 *
	 * @throws \Psr\SimpleCache\InvalidArgumentException
	 *   MUST be thrown if $values is neither an array nor a Traversable,
	 *   or if any of the $values are not a legal value.
	 */
	setMultiple<T>(values: Record<string, T>, ttl?: number): Promise<boolean> | boolean

	/**
	 * Deletes multiple cache items in a single operation.
	 *
	 * @param keys A list of string-based keys to be deleted.
	 *
	 * @return bool True if the items were successfully removed. False if there was an error.
	 *
	 * @throws \Psr\SimpleCache\InvalidArgumentException
	 *   MUST be thrown if $keys is neither an array nor a Traversable,
	 *   or if any of the $keys are not a legal value.
	 */
	deleteMultiple(keys: Array<string>): Promise<boolean> | boolean

	/**
	 * Determines whether an item is present in the cache.
	 *
	 * NOTE: It is recommended that has() is only to be used for cache warming type purposes
	 * and not to be used within your live applications operations for get/set, as this method
	 * is subject to a race condition where your has() will return true and immediately after,
	 * another script can remove it, making the state of your app out of date.
	 *
	 * @param key The cache item key.
	 *
	 * @return bool
	 *
	 * @throws \Psr\SimpleCache\InvalidArgumentException
	 *   MUST be thrown if the $key string is not a legal value.
	 */
	has(key: string): Promise<boolean> | boolean
}
