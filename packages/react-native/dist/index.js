"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  default: () => ReactNativeCache
});
module.exports = __toCommonJS(src_exports);
var import_core = require("@cachex/core");
var import_async_storage = __toESM(require("@react-native-async-storage/async-storage"));
var ReactNativeCache = class extends import_core.AsyncCacheAbsract {
  constructor(prefix) {
    super();
    this.prefix = prefix;
  }
  async get(key, defaultValue) {
    const raw = await import_async_storage.default.getItem(this.getFinalKey(key));
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
    await import_async_storage.default.setItem(this.getFinalKey(key), JSON.stringify(data));
    return true;
  }
  async delete(key) {
    await import_async_storage.default.removeItem(this.getFinalKey(key));
    return true;
  }
  async clear() {
    await import_async_storage.default.multiRemove(await this.keys());
    return true;
  }
  async has(key) {
    return !!await this.get(key);
  }
  async keys() {
    const list = [];
    for (const key of await import_async_storage.default.getAllKeys()) {
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
