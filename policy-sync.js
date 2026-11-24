/*!
 * policy-sync.js —— 政策同步插件（《智能识糖》网页原型）
 * ---------------------------------------------------------------
 * 职责：按固定周期/手动 拉取「政策订阅源」，校验结构，与上次已并入的版本
 *       做增量比对（按 id + rev），把「新增 / 变更」条目抛给页面渲染。
 *       页面只负责展示与人工确认，不自动改写政策结论。
 *
 * 设计约束：
 *  1. 纯前端、零依赖；可直接 file:// 打开。
 *  2. 浏览器不允许跨域抓取政府网站，因此抓取端必须是「可订阅的 JSON 接口」
 *     （可由机构侧定时爬取并生成）。本插件提供适配器接口，可换成 RSS、
 *     内部 API、静态 JSON 等任意来源。
 *  3. 任何一次拉取失败都降级到内置快照，界面明确标注「离线快照」，不静默冒充最新。
 *
 * 对外 API（window.PolicySync）：
 *   check({url})        立即检查一次，返回 Promise<state>
 *   applyAll()          把当前待并入条目记为已并入（写入 localStorage）
 *   startAuto(minutes)  开启定时检查
 *   stopAuto()          关闭定时检查
 *   setFeedUrl(url)     修改订阅源地址
 *   registerAdapter()   注册自定义数据源适配器
 *   getState()          读取当前状态（只读副本）
 *   on(handler) / off() 订阅状态变化
 */
(function (global) {
  "use strict";

  var DEFAULTS = {
    feedUrl: "./policy-feed.json",
    intervalMinutes: 30,
    storageKey: "tangce.policy.feed.v1",
    timeoutMs: 8000
  };

  var state = {
    status: "idle",        // idle | checking | ok | offline | error
    feedUrl: DEFAULTS.feedUrl,
    adapter: "json",
    intervalMinutes: DEFAULTS.intervalMinutes,
    lastCheck: null,
    lastSuccess: null,
    version: null,
    feedUpdatedAt: null,   // 订阅源自带的更新日期，用于页面“政策核验日”
    source: "none",        // remote | snapshot
    error: null,
    items: [],
    pending: [],
    auto: false
  };

  var subscribers = [];
  var adapters = {};
  var timer = null;

  /* ---------------- 基础工具 ---------------- */

  function now() {
    return new Date();
  }

  function cloneState() {
    return JSON.parse(JSON.stringify(state));
  }

  function emit() {
    var snapshot = cloneState();
    subscribers.forEach(function (fn) {
      try {
        fn(snapshot);
      } catch (err) {
        console.warn("[PolicySync] 订阅回调异常", err);
      }
    });
    if (typeof global.dispatchEvent === "function" && typeof CustomEvent === "function") {
      global.dispatchEvent(new CustomEvent("policy-sync:update", { detail: snapshot }));
    }
  }

  function readApplied() {
    try {
      return JSON.parse(global.localStorage.getItem(DEFAULTS.storageKey)) || {};
    } catch (err) {
      return {};
    }
  }

  function writeApplied(map) {
    try {
      global.localStorage.setItem(DEFAULTS.storageKey, JSON.stringify(map));
    } catch (err) {
      /* 隐私模式或 file:// 受限时忽略，仅本次会话有效 */
    }
  }

  /* ---------------- 数据校验 ---------------- */

  function normalizeFeed(raw) {
    if (!raw || typeof raw !== "object") {
      throw new Error("订阅源格式错误：根节点不是对象");
    }
    var list = raw.items;
    if (!Array.isArray(list)) {
      throw new Error("订阅源格式错误：缺少 items 数组");
    }
    var seen = {};
    return list
      .filter(function (item) {
        return item && typeof item.id === "string" && typeof item.title === "string";
      })
      .map(function (item) {
        var normalized = {
          id: item.id,
          type: item.type === "notice" ? "notice" : "source",
          rev: String(item.rev || item.date || "1"),
          title: item.title,
          issuer: item.issuer || "",
          documentNumber: item.documentNumber || "",
          date: item.date || "",
          url: item.url || "",
          authority: item.authority || "",
          summary: item.summary || "",
          tags: Array.isArray(item.tags) ? item.tags : []
        };
        if (seen[normalized.id]) {
          console.warn("[PolicySync] 重复条目已忽略：" + normalized.id);
          return null;
        }
        seen[normalized.id] = true;
        return normalized;
      })
      .filter(Boolean);
  }

  /**
   * 增量比对：未见过 → added；rev/日期变化 → changed。
   * 只依赖 id + rev，避免整份列表刷新造成误报。
   */
  function diff(items, applied) {
    var pending = [];
    items.forEach(function (item) {
      var prev = applied[item.id];
      if (!prev) {
        pending.push(Object.assign({}, item, { change: "added" }));
      } else if (String(prev.rev) !== String(item.rev)) {
        pending.push(Object.assign({}, item, { change: "changed" }));
      }
    });
    return pending;
  }

  /* ---------------- 数据获取 ---------------- */

  function fetchJson(url) {
    var controller = typeof AbortController === "function" ? new AbortController() : null;
    var timeout = global.setTimeout(function () {
      if (controller) controller.abort();
    }, DEFAULTS.timeoutMs);

    return global
      .fetch(url, {
        cache: "no-store",
        signal: controller ? controller.signal : undefined
      })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .finally(function () {
        global.clearTimeout(timeout);
      });
  }

  function loadSnapshot() {
    if (global.POLICY_FEED_SNAPSHOT && Array.isArray(global.POLICY_FEED_SNAPSHOT.items)) {
      return global.POLICY_FEED_SNAPSHOT;
    }
    return null;
  }

  /* ---------------- 主流程 ---------------- */

  function check(options) {
    var opts = options || {};
    if (state.status === "checking") return Promise.resolve(cloneState());

    state.status = "checking";
    state.error = null;
    if (opts.url) state.feedUrl = opts.url;
    emit();

    var loader;
    if (state.adapter !== "json" && adapters[state.adapter]) {
      loader = Promise.resolve().then(function () {
        return adapters[state.adapter]({ url: state.feedUrl });
      });
    } else {
      loader = fetchJson(state.feedUrl);
    }

    return loader
      .then(function (raw) {
        var items = normalizeFeed(raw);
        state.items = items;
        state.version = raw.version || null;
        state.feedUpdatedAt = raw.updatedAt || null;
        state.source = "remote";
        state.status = "ok";
      })
      .catch(function (err) {
        var snapshot = loadSnapshot();
        state.error = err && err.message ? err.message : String(err);
        if (snapshot) {
          try {
            state.items = normalizeFeed(snapshot);
            state.version = snapshot.version || null;
            state.feedUpdatedAt = snapshot.updatedAt || null;
            state.source = "snapshot";
            state.status = "offline";
          } catch (fallbackErr) {
            state.items = [];
            state.source = "none";
            state.status = "error";
            state.error = fallbackErr.message;
          }
        } else {
          state.items = [];
          state.source = "none";
          state.status = "error";
        }
      })
      .then(function () {
        state.lastCheck = now();
        if (state.status === "ok" || state.status === "offline") {
          state.lastSuccess = now();
          state.pending = diff(state.items, readApplied());
        } else {
          state.pending = [];
        }
        emit();
        return cloneState();
      });
  }

  function applyAll() {
    var applied = readApplied();
    var stamp = new Date().toISOString();
    state.pending.forEach(function (item) {
      applied[item.id] = { id: item.id, rev: item.rev, date: item.date, appliedAt: stamp };
    });
    writeApplied(applied);
    state.pending = [];
    emit();
    return cloneState();
  }

  function startAuto(minutes) {
    var interval = Number(minutes) || state.intervalMinutes || DEFAULTS.intervalMinutes;
    stopAuto();
    state.intervalMinutes = interval;
    state.auto = true;
    timer = global.setInterval(function () {
      check();
    }, interval * 60 * 1000);
    emit();
    return interval;
  }

  function stopAuto() {
    if (timer) {
      global.clearInterval(timer);
      timer = null;
    }
    state.auto = false;
    emit();
  }

  function setFeedUrl(url) {
    if (!url) return;
    state.feedUrl = url;
    emit();
  }

  function registerAdapter(name, loader, makeDefault) {
    if (!name || typeof loader !== "function") {
      throw new Error("registerAdapter(name, loader) 参数不合法");
    }
    adapters[name] = loader;
    if (makeDefault) state.adapter = name;
  }

  function on(handler) {
    if (typeof handler === "function") subscribers.push(handler);
  }

  function off(handler) {
    subscribers = subscribers.filter(function (fn) {
      return fn !== handler;
    });
  }

  global.PolicySync = {
    check: check,
    applyAll: applyAll,
    startAuto: startAuto,
    stopAuto: stopAuto,
    setFeedUrl: setFeedUrl,
    registerAdapter: registerAdapter,
    on: on,
    off: off,
    getState: cloneState
  };
})(window);
