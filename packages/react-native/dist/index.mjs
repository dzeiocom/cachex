// src/index.ts
import { AsyncCacheAbsract } from "@cachex/core";
import AsyncStorage from "@react-native-async-storage/async-storage";
var ReactNativeCache = class extends AsyncCacheAbsract {
  constructor(prefix) {
    super();
    this.prefix = prefix;
  }
  async get(key, defaultValue) {
    const raw = await AsyncStorage.getItem(this.getFinalKey(key));
    if (!raw) {
      return defaultValue != null ? defaultValue : void 0;
    }
    const item = JSON.parse(raw);
    if (item.expire && item.expire < (/* @__PURE__ */ new Date()).getTime()) {
      this.delete(key);
      return typeof defaultValue !== "undefined" ? defaultValue : void 0;
    }
    return item.data;
  }
  async set(key, value, ttl) {
    let expire = void 0;
    if (typeof ttl === "number") {
      expire = (/* @__PURE__ */ new Date()).getTime() + ttl * 1e3;
    }
    const data = {
      data: value,
      expire
    };
    await AsyncStorage.setItem(this.getFinalKey(key), JSON.stringify(data));
    return true;
  }
  async delete(key) {
    await AsyncStorage.removeItem(this.getFinalKey(key));
    return true;
  }
  async clear() {
    await AsyncStorage.multiRemove(await this.keys());
    return true;
  }
  async has(key) {
    return !!await this.get(key);
  }
  async keys() {
    const list = [];
    for (const key of await AsyncStorage.getAllKeys()) {
      if (this.prefix && !key.startsWith(`@${this.prefix}/`)) {
        continue;
      }
      list.push(key);
    }
    return list;
  }
  getFinalKey(key) {
    if (typeof this.prefix !== "string") {
      return key;
    }
    return `@${this.prefix}/${key}`;
  }
};
export {
  ReactNativeCache as default
};
