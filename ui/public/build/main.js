"use strict";
(() => {
  // node_modules/.pnpm/svelte@3.52.0/node_modules/svelte/internal/index.mjs
  function noop() {
  }
  function add_location(element2, file2, line, column, char) {
    element2.__svelte_meta = {
      loc: { file: file2, line, column, char }
    };
  }
  function run(fn) {
    return fn();
  }
  function blank_object() {
    return /* @__PURE__ */ Object.create(null);
  }
  function run_all(fns) {
    fns.forEach(run);
  }
  function is_function(thing) {
    return typeof thing === "function";
  }
  function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
  }
  function is_empty(obj) {
    return Object.keys(obj).length === 0;
  }
  var is_hydrating = false;
  function start_hydrating() {
    is_hydrating = true;
  }
  function end_hydrating() {
    is_hydrating = false;
  }
  function upper_bound(low, high, key, value) {
    while (low < high) {
      const mid = low + (high - low >> 1);
      if (key(mid) <= value) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    return low;
  }
  function init_hydrate(target) {
    if (target.hydrate_init)
      return;
    target.hydrate_init = true;
    let children2 = target.childNodes;
    if (target.nodeName === "HEAD") {
      const myChildren = [];
      for (let i = 0; i < children2.length; i++) {
        const node = children2[i];
        if (node.claim_order !== void 0) {
          myChildren.push(node);
        }
      }
      children2 = myChildren;
    }
    const m = new Int32Array(children2.length + 1);
    const p = new Int32Array(children2.length);
    m[0] = -1;
    let longest = 0;
    for (let i = 0; i < children2.length; i++) {
      const current = children2[i].claim_order;
      const seqLen = (longest > 0 && children2[m[longest]].claim_order <= current ? longest + 1 : upper_bound(1, longest, (idx) => children2[m[idx]].claim_order, current)) - 1;
      p[i] = m[seqLen] + 1;
      const newLen = seqLen + 1;
      m[newLen] = i;
      longest = Math.max(newLen, longest);
    }
    const lis = [];
    const toMove = [];
    let last = children2.length - 1;
    for (let cur = m[longest] + 1; cur != 0; cur = p[cur - 1]) {
      lis.push(children2[cur - 1]);
      for (; last >= cur; last--) {
        toMove.push(children2[last]);
      }
      last--;
    }
    for (; last >= 0; last--) {
      toMove.push(children2[last]);
    }
    lis.reverse();
    toMove.sort((a, b) => a.claim_order - b.claim_order);
    for (let i = 0, j = 0; i < toMove.length; i++) {
      while (j < lis.length && toMove[i].claim_order >= lis[j].claim_order) {
        j++;
      }
      const anchor = j < lis.length ? lis[j] : null;
      target.insertBefore(toMove[i], anchor);
    }
  }
  function append_hydration(target, node) {
    if (is_hydrating) {
      init_hydrate(target);
      if (target.actual_end_child === void 0 || target.actual_end_child !== null && target.actual_end_child.parentNode !== target) {
        target.actual_end_child = target.firstChild;
      }
      while (target.actual_end_child !== null && target.actual_end_child.claim_order === void 0) {
        target.actual_end_child = target.actual_end_child.nextSibling;
      }
      if (node !== target.actual_end_child) {
        if (node.claim_order !== void 0 || node.parentNode !== target) {
          target.insertBefore(node, target.actual_end_child);
        }
      } else {
        target.actual_end_child = node.nextSibling;
      }
    } else if (node.parentNode !== target || node.nextSibling !== null) {
      target.appendChild(node);
    }
  }
  function insert_hydration(target, node, anchor) {
    if (is_hydrating && !anchor) {
      append_hydration(target, node);
    } else if (node.parentNode !== target || node.nextSibling != anchor) {
      target.insertBefore(node, anchor || null);
    }
  }
  function detach(node) {
    node.parentNode.removeChild(node);
  }
  function element(name) {
    return document.createElement(name);
  }
  function text(data) {
    return document.createTextNode(data);
  }
  function space() {
    return text(" ");
  }
  function empty() {
    return text("");
  }
  function listen(node, event, handler, options) {
    node.addEventListener(event, handler, options);
    return () => node.removeEventListener(event, handler, options);
  }
  function prevent_default(fn) {
    return function(event) {
      event.preventDefault();
      return fn.call(this, event);
    };
  }
  function attr(node, attribute, value) {
    if (value == null)
      node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value)
      node.setAttribute(attribute, value);
  }
  function children(element2) {
    return Array.from(element2.childNodes);
  }
  function init_claim_info(nodes) {
    if (nodes.claim_info === void 0) {
      nodes.claim_info = { last_index: 0, total_claimed: 0 };
    }
  }
  function claim_node(nodes, predicate, processNode, createNode, dontUpdateLastIndex = false) {
    init_claim_info(nodes);
    const resultNode = (() => {
      for (let i = nodes.claim_info.last_index; i < nodes.length; i++) {
        const node = nodes[i];
        if (predicate(node)) {
          const replacement = processNode(node);
          if (replacement === void 0) {
            nodes.splice(i, 1);
          } else {
            nodes[i] = replacement;
          }
          if (!dontUpdateLastIndex) {
            nodes.claim_info.last_index = i;
          }
          return node;
        }
      }
      for (let i = nodes.claim_info.last_index - 1; i >= 0; i--) {
        const node = nodes[i];
        if (predicate(node)) {
          const replacement = processNode(node);
          if (replacement === void 0) {
            nodes.splice(i, 1);
          } else {
            nodes[i] = replacement;
          }
          if (!dontUpdateLastIndex) {
            nodes.claim_info.last_index = i;
          } else if (replacement === void 0) {
            nodes.claim_info.last_index--;
          }
          return node;
        }
      }
      return createNode();
    })();
    resultNode.claim_order = nodes.claim_info.total_claimed;
    nodes.claim_info.total_claimed += 1;
    return resultNode;
  }
  function claim_element_base(nodes, name, attributes, create_element) {
    return claim_node(nodes, (node) => node.nodeName === name, (node) => {
      const remove = [];
      for (let j = 0; j < node.attributes.length; j++) {
        const attribute = node.attributes[j];
        if (!attributes[attribute.name]) {
          remove.push(attribute.name);
        }
      }
      remove.forEach((v) => node.removeAttribute(v));
      return void 0;
    }, () => create_element(name));
  }
  function claim_element(nodes, name, attributes) {
    return claim_element_base(nodes, name, attributes, element);
  }
  function claim_text(nodes, data) {
    return claim_node(
      nodes,
      (node) => node.nodeType === 3,
      (node) => {
        const dataStr = "" + data;
        if (node.data.startsWith(dataStr)) {
          if (node.data.length !== dataStr.length) {
            return node.splitText(dataStr.length);
          }
        } else {
          node.data = dataStr;
        }
      },
      () => text(data),
      true
    );
  }
  function claim_space(nodes) {
    return claim_text(nodes, " ");
  }
  function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
    const e = document.createEvent("CustomEvent");
    e.initCustomEvent(type, bubbles, cancelable, detail);
    return e;
  }
  var current_component;
  function set_current_component(component) {
    current_component = component;
  }
  var dirty_components = [];
  var binding_callbacks = [];
  var render_callbacks = [];
  var flush_callbacks = [];
  var resolved_promise = Promise.resolve();
  var update_scheduled = false;
  function schedule_update() {
    if (!update_scheduled) {
      update_scheduled = true;
      resolved_promise.then(flush);
    }
  }
  function add_render_callback(fn) {
    render_callbacks.push(fn);
  }
  var seen_callbacks = /* @__PURE__ */ new Set();
  var flushidx = 0;
  function flush() {
    const saved_component = current_component;
    do {
      while (flushidx < dirty_components.length) {
        const component = dirty_components[flushidx];
        flushidx++;
        set_current_component(component);
        update(component.$$);
      }
      set_current_component(null);
      dirty_components.length = 0;
      flushidx = 0;
      while (binding_callbacks.length)
        binding_callbacks.pop()();
      for (let i = 0; i < render_callbacks.length; i += 1) {
        const callback = render_callbacks[i];
        if (!seen_callbacks.has(callback)) {
          seen_callbacks.add(callback);
          callback();
        }
      }
      render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
      flush_callbacks.pop()();
    }
    update_scheduled = false;
    seen_callbacks.clear();
    set_current_component(saved_component);
  }
  function update($$) {
    if ($$.fragment !== null) {
      $$.update();
      run_all($$.before_update);
      const dirty = $$.dirty;
      $$.dirty = [-1];
      $$.fragment && $$.fragment.p($$.ctx, dirty);
      $$.after_update.forEach(add_render_callback);
    }
  }
  var outroing = /* @__PURE__ */ new Set();
  function transition_in(block, local) {
    if (block && block.i) {
      outroing.delete(block);
      block.i(local);
    }
  }
  var globals = typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : global;
  function destroy_block(block, lookup) {
    block.d(1);
    lookup.delete(block.key);
  }
  function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block2, next, get_context) {
    let o = old_blocks.length;
    let n = list.length;
    let i = o;
    const old_indexes = {};
    while (i--)
      old_indexes[old_blocks[i].key] = i;
    const new_blocks = [];
    const new_lookup = /* @__PURE__ */ new Map();
    const deltas = /* @__PURE__ */ new Map();
    i = n;
    while (i--) {
      const child_ctx = get_context(ctx, list, i);
      const key = get_key(child_ctx);
      let block = lookup.get(key);
      if (!block) {
        block = create_each_block2(key, child_ctx);
        block.c();
      } else if (dynamic) {
        block.p(child_ctx, dirty);
      }
      new_lookup.set(key, new_blocks[i] = block);
      if (key in old_indexes)
        deltas.set(key, Math.abs(i - old_indexes[key]));
    }
    const will_move = /* @__PURE__ */ new Set();
    const did_move = /* @__PURE__ */ new Set();
    function insert(block) {
      transition_in(block, 1);
      block.m(node, next);
      lookup.set(block.key, block);
      next = block.first;
      n--;
    }
    while (o && n) {
      const new_block = new_blocks[n - 1];
      const old_block = old_blocks[o - 1];
      const new_key = new_block.key;
      const old_key = old_block.key;
      if (new_block === old_block) {
        next = new_block.first;
        o--;
        n--;
      } else if (!new_lookup.has(old_key)) {
        destroy(old_block, lookup);
        o--;
      } else if (!lookup.has(new_key) || will_move.has(new_key)) {
        insert(new_block);
      } else if (did_move.has(old_key)) {
        o--;
      } else if (deltas.get(new_key) > deltas.get(old_key)) {
        did_move.add(new_key);
        insert(new_block);
      } else {
        will_move.add(old_key);
        o--;
      }
    }
    while (o--) {
      const old_block = old_blocks[o];
      if (!new_lookup.has(old_block.key))
        destroy(old_block, lookup);
    }
    while (n)
      insert(new_blocks[n - 1]);
    return new_blocks;
  }
  function validate_each_keys(ctx, list, get_context, get_key) {
    const keys = /* @__PURE__ */ new Set();
    for (let i = 0; i < list.length; i++) {
      const key = get_key(get_context(ctx, list, i));
      if (keys.has(key)) {
        throw new Error("Cannot have duplicate keys in a keyed each");
      }
      keys.add(key);
    }
  }
  function mount_component(component, target, anchor, customElement) {
    const { fragment, after_update } = component.$$;
    fragment && fragment.m(target, anchor);
    if (!customElement) {
      add_render_callback(() => {
        const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
        if (component.$$.on_destroy) {
          component.$$.on_destroy.push(...new_on_destroy);
        } else {
          run_all(new_on_destroy);
        }
        component.$$.on_mount = [];
      });
    }
    after_update.forEach(add_render_callback);
  }
  function destroy_component(component, detaching) {
    const $$ = component.$$;
    if ($$.fragment !== null) {
      run_all($$.on_destroy);
      $$.fragment && $$.fragment.d(detaching);
      $$.on_destroy = $$.fragment = null;
      $$.ctx = [];
    }
  }
  function make_dirty(component, i) {
    if (component.$$.dirty[0] === -1) {
      dirty_components.push(component);
      schedule_update();
      component.$$.dirty.fill(0);
    }
    component.$$.dirty[i / 31 | 0] |= 1 << i % 31;
  }
  function init(component, options, instance2, create_fragment2, not_equal, props, append_styles, dirty = [-1]) {
    const parent_component = current_component;
    set_current_component(component);
    const $$ = component.$$ = {
      fragment: null,
      ctx: [],
      props,
      update: noop,
      not_equal,
      bound: blank_object(),
      on_mount: [],
      on_destroy: [],
      on_disconnect: [],
      before_update: [],
      after_update: [],
      context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
      callbacks: blank_object(),
      dirty,
      skip_bound: false,
      root: options.target || parent_component.$$.root
    };
    append_styles && append_styles($$.root);
    let ready = false;
    $$.ctx = instance2 ? instance2(component, options.props || {}, (i, ret, ...rest) => {
      const value = rest.length ? rest[0] : ret;
      if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
        if (!$$.skip_bound && $$.bound[i])
          $$.bound[i](value);
        if (ready)
          make_dirty(component, i);
      }
      return ret;
    }) : [];
    $$.update();
    ready = true;
    run_all($$.before_update);
    $$.fragment = create_fragment2 ? create_fragment2($$.ctx) : false;
    if (options.target) {
      if (options.hydrate) {
        start_hydrating();
        const nodes = children(options.target);
        $$.fragment && $$.fragment.l(nodes);
        nodes.forEach(detach);
      } else {
        $$.fragment && $$.fragment.c();
      }
      if (options.intro)
        transition_in(component.$$.fragment);
      mount_component(component, options.target, options.anchor, options.customElement);
      end_hydrating();
      flush();
    }
    set_current_component(parent_component);
  }
  var SvelteElement;
  if (typeof HTMLElement === "function") {
    SvelteElement = class extends HTMLElement {
      constructor() {
        super();
        this.attachShadow({ mode: "open" });
      }
      connectedCallback() {
        const { on_mount } = this.$$;
        this.$$.on_disconnect = on_mount.map(run).filter(is_function);
        for (const key in this.$$.slotted) {
          this.appendChild(this.$$.slotted[key]);
        }
      }
      attributeChangedCallback(attr2, _oldValue, newValue) {
        this[attr2] = newValue;
      }
      disconnectedCallback() {
        run_all(this.$$.on_disconnect);
      }
      $destroy() {
        destroy_component(this, 1);
        this.$destroy = noop;
      }
      $on(type, callback) {
        if (!is_function(callback)) {
          return noop;
        }
        const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
        callbacks.push(callback);
        return () => {
          const index = callbacks.indexOf(callback);
          if (index !== -1)
            callbacks.splice(index, 1);
        };
      }
      $set($$props) {
        if (this.$$set && !is_empty($$props)) {
          this.$$.skip_bound = true;
          this.$$set($$props);
          this.$$.skip_bound = false;
        }
      }
    };
  }
  var SvelteComponent = class {
    $destroy() {
      destroy_component(this, 1);
      this.$destroy = noop;
    }
    $on(type, callback) {
      if (!is_function(callback)) {
        return noop;
      }
      const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
      callbacks.push(callback);
      return () => {
        const index = callbacks.indexOf(callback);
        if (index !== -1)
          callbacks.splice(index, 1);
      };
    }
    $set($$props) {
      if (this.$$set && !is_empty($$props)) {
        this.$$.skip_bound = true;
        this.$$set($$props);
        this.$$.skip_bound = false;
      }
    }
  };
  function dispatch_dev(type, detail) {
    document.dispatchEvent(custom_event(type, Object.assign({ version: "3.52.0" }, detail), { bubbles: true }));
  }
  function append_hydration_dev(target, node) {
    dispatch_dev("SvelteDOMInsert", { target, node });
    append_hydration(target, node);
  }
  function insert_hydration_dev(target, node, anchor) {
    dispatch_dev("SvelteDOMInsert", { target, node, anchor });
    insert_hydration(target, node, anchor);
  }
  function detach_dev(node) {
    dispatch_dev("SvelteDOMRemove", { node });
    detach(node);
  }
  function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
    const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
    if (has_prevent_default)
      modifiers.push("preventDefault");
    if (has_stop_propagation)
      modifiers.push("stopPropagation");
    dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
    const dispose = listen(node, event, handler, options);
    return () => {
      dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
      dispose();
    };
  }
  function attr_dev(node, attribute, value) {
    attr(node, attribute, value);
    if (value == null)
      dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
    else
      dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
  }
  function set_data_dev(text2, data) {
    data = "" + data;
    if (text2.wholeText === data)
      return;
    dispatch_dev("SvelteDOMSetData", { node: text2, data });
    text2.data = data;
  }
  function validate_each_argument(arg) {
    if (typeof arg !== "string" && !(arg && typeof arg === "object" && "length" in arg)) {
      let msg = "{#each} only iterates over array-like objects.";
      if (typeof Symbol === "function" && arg && Symbol.iterator in arg) {
        msg += " You can use a spread to convert this iterable into an array.";
      }
      throw new Error(msg);
    }
  }
  function validate_slots(name, slot, keys) {
    for (const slot_key of Object.keys(slot)) {
      if (!~keys.indexOf(slot_key)) {
        console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
      }
    }
  }
  var SvelteComponentDev = class extends SvelteComponent {
    constructor(options) {
      if (!options || !options.target && !options.$$inline) {
        throw new Error("'target' is a required option");
      }
      super();
    }
    $destroy() {
      super.$destroy();
      this.$destroy = () => {
        console.warn("Component was already destroyed");
      };
    }
    $capture_state() {
    }
    $inject_state() {
    }
  };

  // src/Root.svelte
  var file = "src/Root.svelte";
  function get_each_context(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[7] = list[i];
    return child_ctx;
  }
  function create_if_block_4(ctx) {
    let div;
    let each_blocks = [];
    let each_1_lookup = /* @__PURE__ */ new Map();
    let each_value = ctx[0];
    validate_each_argument(each_value);
    const get_key = (ctx2) => ctx2[7].id;
    validate_each_keys(ctx, each_value, get_each_context, get_key);
    for (let i = 0; i < each_value.length; i += 1) {
      let child_ctx = get_each_context(ctx, each_value, i);
      let key = get_key(child_ctx);
      each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    }
    const block = {
      c: function create() {
        div = element("div");
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        this.h();
      },
      l: function claim(nodes) {
        div = claim_element(nodes, "DIV", { class: true });
        var div_nodes = children(div);
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].l(div_nodes);
        }
        div_nodes.forEach(detach_dev);
        this.h();
      },
      h: function hydrate() {
        attr_dev(div, "class", "field svelte-1srphmo");
        add_location(div, file, 76, 2, 2345);
      },
      m: function mount(target, anchor) {
        insert_hydration_dev(target, div, anchor);
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].m(div, null);
        }
      },
      p: function update2(ctx2, dirty) {
        if (dirty & 13) {
          each_value = ctx2[0];
          validate_each_argument(each_value);
          validate_each_keys(ctx2, each_value, get_each_context, get_key);
          each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx2, each_value, each_1_lookup, div, destroy_block, create_each_block, null, get_each_context);
        }
      },
      d: function destroy(detaching) {
        if (detaching)
          detach_dev(div);
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].d();
        }
      }
    };
    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block_4.name,
      type: "if",
      source: "(76:1) {#if counter < 10}",
      ctx
    });
    return block;
  }
  function create_each_block(key_1, ctx) {
    let div;
    let button;
    let h2;
    let t0_value = ctx[0][ctx[7].id - 1].value + "";
    let t0;
    let t1;
    let div_class_value;
    let mounted;
    let dispose;
    function click_handler() {
      return ctx[5](ctx[7]);
    }
    const block = {
      key: key_1,
      first: null,
      c: function create() {
        div = element("div");
        button = element("button");
        h2 = element("h2");
        t0 = text(t0_value);
        t1 = space();
        this.h();
      },
      l: function claim(nodes) {
        div = claim_element(nodes, "DIV", { class: true });
        var div_nodes = children(div);
        button = claim_element(div_nodes, "BUTTON", { class: true });
        var button_nodes = children(button);
        h2 = claim_element(button_nodes, "H2", {});
        var h2_nodes = children(h2);
        t0 = claim_text(h2_nodes, t0_value);
        h2_nodes.forEach(detach_dev);
        button_nodes.forEach(detach_dev);
        t1 = claim_space(div_nodes);
        div_nodes.forEach(detach_dev);
        this.h();
      },
      h: function hydrate() {
        add_location(h2, file, 84, 9, 2549);
        attr_dev(button, "class", "svelte-1srphmo");
        add_location(button, file, 79, 5, 2431);
        attr_dev(div, "class", div_class_value = "block" + ctx[7].id + " svelte-1srphmo");
        add_location(div, file, 78, 4, 2400);
        this.first = div;
      },
      m: function mount(target, anchor) {
        insert_hydration_dev(target, div, anchor);
        append_hydration_dev(div, button);
        append_hydration_dev(button, h2);
        append_hydration_dev(h2, t0);
        append_hydration_dev(div, t1);
        if (!mounted) {
          dispose = listen_dev(button, "click", prevent_default(click_handler), false, true, false);
          mounted = true;
        }
      },
      p: function update2(new_ctx, dirty) {
        ctx = new_ctx;
        if (dirty & 1 && t0_value !== (t0_value = ctx[0][ctx[7].id - 1].value + ""))
          set_data_dev(t0, t0_value);
        if (dirty & 1 && div_class_value !== (div_class_value = "block" + ctx[7].id + " svelte-1srphmo")) {
          attr_dev(div, "class", div_class_value);
        }
      },
      d: function destroy(detaching) {
        if (detaching)
          detach_dev(div);
        mounted = false;
        dispose();
      }
    };
    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_each_block.name,
      type: "each",
      source: "(78:3) {#each squares as i (i.id)}",
      ctx
    });
    return block;
  }
  function create_if_block_1(ctx) {
    let t;
    let if_block1_anchor;
    let if_block0 = ctx[1] % 2 == 0 && create_if_block_3(ctx);
    let if_block1 = ctx[1] % 2 == 1 && create_if_block_2(ctx);
    const block = {
      c: function create() {
        if (if_block0)
          if_block0.c();
        t = space();
        if (if_block1)
          if_block1.c();
        if_block1_anchor = empty();
      },
      l: function claim(nodes) {
        if (if_block0)
          if_block0.l(nodes);
        t = claim_space(nodes);
        if (if_block1)
          if_block1.l(nodes);
        if_block1_anchor = empty();
      },
      m: function mount(target, anchor) {
        if (if_block0)
          if_block0.m(target, anchor);
        insert_hydration_dev(target, t, anchor);
        if (if_block1)
          if_block1.m(target, anchor);
        insert_hydration_dev(target, if_block1_anchor, anchor);
      },
      p: function update2(ctx2, dirty) {
        if (ctx2[1] % 2 == 0) {
          if (if_block0) {
          } else {
            if_block0 = create_if_block_3(ctx2);
            if_block0.c();
            if_block0.m(t.parentNode, t);
          }
        } else if (if_block0) {
          if_block0.d(1);
          if_block0 = null;
        }
        if (ctx2[1] % 2 == 1) {
          if (if_block1) {
          } else {
            if_block1 = create_if_block_2(ctx2);
            if_block1.c();
            if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
          }
        } else if (if_block1) {
          if_block1.d(1);
          if_block1 = null;
        }
      },
      d: function destroy(detaching) {
        if (if_block0)
          if_block0.d(detaching);
        if (detaching)
          detach_dev(t);
        if (if_block1)
          if_block1.d(detaching);
        if (detaching)
          detach_dev(if_block1_anchor);
      }
    };
    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block_1.name,
      type: "if",
      source: '(91:1) {#if winner == \\"default\\"}',
      ctx
    });
    return block;
  }
  function create_if_block_3(ctx) {
    let h2;
    let t;
    const block = {
      c: function create() {
        h2 = element("h2");
        t = text("Player X turn");
        this.h();
      },
      l: function claim(nodes) {
        h2 = claim_element(nodes, "H2", {});
        var h2_nodes = children(h2);
        t = claim_text(h2_nodes, "Player X turn");
        h2_nodes.forEach(detach_dev);
        this.h();
      },
      h: function hydrate() {
        add_location(h2, file, 92, 3, 2692);
      },
      m: function mount(target, anchor) {
        insert_hydration_dev(target, h2, anchor);
        append_hydration_dev(h2, t);
      },
      d: function destroy(detaching) {
        if (detaching)
          detach_dev(h2);
      }
    };
    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block_3.name,
      type: "if",
      source: "(92:2) {#if counter % 2 == 0}",
      ctx
    });
    return block;
  }
  function create_if_block_2(ctx) {
    let h2;
    let t;
    const block = {
      c: function create() {
        h2 = element("h2");
        t = text("Player O turn");
        this.h();
      },
      l: function claim(nodes) {
        h2 = claim_element(nodes, "H2", {});
        var h2_nodes = children(h2);
        t = claim_text(h2_nodes, "Player O turn");
        h2_nodes.forEach(detach_dev);
        this.h();
      },
      h: function hydrate() {
        add_location(h2, file, 95, 3, 2751);
      },
      m: function mount(target, anchor) {
        insert_hydration_dev(target, h2, anchor);
        append_hydration_dev(h2, t);
      },
      d: function destroy(detaching) {
        if (detaching)
          detach_dev(h2);
      }
    };
    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block_2.name,
      type: "if",
      source: "(95:2) {#if counter % 2 == 1}",
      ctx
    });
    return block;
  }
  function create_if_block(ctx) {
    let h20;
    let t0;
    let t1;
    let h21;
    let t2;
    let t3;
    let button;
    let t4;
    let mounted;
    let dispose;
    const block = {
      c: function create() {
        h20 = element("h2");
        t0 = text("Game Done!");
        t1 = space();
        h21 = element("h2");
        t2 = text(ctx[2]);
        t3 = space();
        button = element("button");
        t4 = text("Reset");
        this.h();
      },
      l: function claim(nodes) {
        h20 = claim_element(nodes, "H2", {});
        var h20_nodes = children(h20);
        t0 = claim_text(h20_nodes, "Game Done!");
        h20_nodes.forEach(detach_dev);
        t1 = claim_space(nodes);
        h21 = claim_element(nodes, "H2", {});
        var h21_nodes = children(h21);
        t2 = claim_text(h21_nodes, ctx[2]);
        h21_nodes.forEach(detach_dev);
        t3 = claim_space(nodes);
        button = claim_element(nodes, "BUTTON", { class: true });
        var button_nodes = children(button);
        t4 = claim_text(button_nodes, "Reset");
        button_nodes.forEach(detach_dev);
        this.h();
      },
      h: function hydrate() {
        add_location(h20, file, 99, 2, 2818);
        add_location(h21, file, 100, 2, 2840);
        attr_dev(button, "class", "svelte-1srphmo");
        add_location(button, file, 101, 2, 2860);
      },
      m: function mount(target, anchor) {
        insert_hydration_dev(target, h20, anchor);
        append_hydration_dev(h20, t0);
        insert_hydration_dev(target, t1, anchor);
        insert_hydration_dev(target, h21, anchor);
        append_hydration_dev(h21, t2);
        insert_hydration_dev(target, t3, anchor);
        insert_hydration_dev(target, button, anchor);
        append_hydration_dev(button, t4);
        if (!mounted) {
          dispose = listen_dev(button, "click", ctx[6], false, false, false);
          mounted = true;
        }
      },
      p: function update2(ctx2, dirty) {
        if (dirty & 4)
          set_data_dev(t2, ctx2[2]);
      },
      d: function destroy(detaching) {
        if (detaching)
          detach_dev(h20);
        if (detaching)
          detach_dev(t1);
        if (detaching)
          detach_dev(h21);
        if (detaching)
          detach_dev(t3);
        if (detaching)
          detach_dev(button);
        mounted = false;
        dispose();
      }
    };
    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block.name,
      type: "if",
      source: '(99:1) {#if winner != \\"default\\"}',
      ctx
    });
    return block;
  }
  function create_fragment(ctx) {
    let main;
    let t0;
    let t1;
    let if_block0 = ctx[1] < 10 && create_if_block_4(ctx);
    let if_block1 = ctx[2] == "default" && create_if_block_1(ctx);
    let if_block2 = ctx[2] != "default" && create_if_block(ctx);
    const block = {
      c: function create() {
        main = element("main");
        if (if_block0)
          if_block0.c();
        t0 = space();
        if (if_block1)
          if_block1.c();
        t1 = space();
        if (if_block2)
          if_block2.c();
        this.h();
      },
      l: function claim(nodes) {
        main = claim_element(nodes, "MAIN", {});
        var main_nodes = children(main);
        if (if_block0)
          if_block0.l(main_nodes);
        t0 = claim_space(main_nodes);
        if (if_block1)
          if_block1.l(main_nodes);
        t1 = claim_space(main_nodes);
        if (if_block2)
          if_block2.l(main_nodes);
        main_nodes.forEach(detach_dev);
        this.h();
      },
      h: function hydrate() {
        add_location(main, file, 74, 0, 2316);
      },
      m: function mount(target, anchor) {
        insert_hydration_dev(target, main, anchor);
        if (if_block0)
          if_block0.m(main, null);
        append_hydration_dev(main, t0);
        if (if_block1)
          if_block1.m(main, null);
        append_hydration_dev(main, t1);
        if (if_block2)
          if_block2.m(main, null);
      },
      p: function update2(ctx2, [dirty]) {
        if (ctx2[1] < 10) {
          if (if_block0) {
            if_block0.p(ctx2, dirty);
          } else {
            if_block0 = create_if_block_4(ctx2);
            if_block0.c();
            if_block0.m(main, t0);
          }
        } else if (if_block0) {
          if_block0.d(1);
          if_block0 = null;
        }
        if (ctx2[2] == "default") {
          if (if_block1) {
            if_block1.p(ctx2, dirty);
          } else {
            if_block1 = create_if_block_1(ctx2);
            if_block1.c();
            if_block1.m(main, t1);
          }
        } else if (if_block1) {
          if_block1.d(1);
          if_block1 = null;
        }
        if (ctx2[2] != "default") {
          if (if_block2) {
            if_block2.p(ctx2, dirty);
          } else {
            if_block2 = create_if_block(ctx2);
            if_block2.c();
            if_block2.m(main, null);
          }
        } else if (if_block2) {
          if_block2.d(1);
          if_block2 = null;
        }
      },
      i: noop,
      o: noop,
      d: function destroy(detaching) {
        if (detaching)
          detach_dev(main);
        if (if_block0)
          if_block0.d();
        if (if_block1)
          if_block1.d();
        if (if_block2)
          if_block2.d();
      }
    };
    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_fragment.name,
      type: "component",
      source: "",
      ctx
    });
    return block;
  }
  function instance($$self, $$props, $$invalidate) {
    let { $$slots: slots = {}, $$scope } = $$props;
    validate_slots("Root", slots, []);
    let { squares = [
      { id: 1, value: " " },
      { id: 2, value: " " },
      { id: 3, value: " " },
      { id: 4, value: " " },
      { id: 5, value: " " },
      { id: 6, value: " " },
      { id: 7, value: " " },
      { id: 8, value: " " },
      { id: 9, value: " " }
    ] } = $$props;
    let counter = 0;
    let winner = "default";
    function set(c) {
      if (squares[c - 1].value == " " && counter % 2 == 0) {
        $$invalidate(0, squares[c - 1].value = "X", squares);
        $$invalidate(1, counter++, counter);
      }
      if (squares[c - 1].value == " " && counter % 2 == 1) {
        $$invalidate(0, squares[c - 1].value = "O", squares);
        $$invalidate(1, counter++, counter);
      }
      if (squares[0].value == squares[1].value && squares[0].value == squares[2].value && squares[0].value != " " || squares[3].value == squares[4].value && squares[3].value == squares[5].value && squares[3].value != " " || squares[6].value == squares[7].value && squares[6].value == squares[8].value && squares[6].value != " " || squares[0].value == squares[3].value && squares[0].value == squares[6].value && squares[0].value != " " || squares[1].value == squares[4].value && squares[1].value == squares[7].value && squares[1].value != " " || squares[2].value == squares[5].value && squares[2].value == squares[8].value && squares[2].value != " " || squares[4].value == squares[0].value && squares[4].value == squares[8].value && squares[4].value != " " || squares[4].value == squares[2].value && squares[4].value == squares[6].value && squares[4].value != " ") {
        if (counter % 2 == 0) {
          $$invalidate(2, winner = "O wins!");
        }
        if (counter % 2 == 1) {
          $$invalidate(2, winner = "X wins!");
        }
      }
      if (counter == 9 && winner == "default") {
        $$invalidate(2, winner = "Draw!");
      }
    }
    function reset() {
      $$invalidate(0, squares = [
        { id: 1, value: " " },
        { id: 2, value: " " },
        { id: 3, value: " " },
        { id: 4, value: " " },
        { id: 5, value: " " },
        { id: 6, value: " " },
        { id: 7, value: " " },
        { id: 8, value: " " },
        { id: 9, value: " " }
      ]);
      $$invalidate(1, counter = 0);
      $$invalidate(2, winner = "default");
    }
    const writable_props = ["squares"];
    Object.keys($$props).forEach((key) => {
      if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$" && key !== "slot")
        console.warn(`<Root> was created with unknown prop '${key}'`);
    });
    const click_handler = (i) => {
      if (winner == "default") {
        set(i.id);
      }
    };
    const click_handler_1 = () => reset();
    $$self.$$set = ($$props2) => {
      if ("squares" in $$props2)
        $$invalidate(0, squares = $$props2.squares);
    };
    $$self.$capture_state = () => ({ squares, counter, winner, set, reset });
    $$self.$inject_state = ($$props2) => {
      if ("squares" in $$props2)
        $$invalidate(0, squares = $$props2.squares);
      if ("counter" in $$props2)
        $$invalidate(1, counter = $$props2.counter);
      if ("winner" in $$props2)
        $$invalidate(2, winner = $$props2.winner);
    };
    if ($$props && "$$inject" in $$props) {
      $$self.$inject_state($$props.$$inject);
    }
    return [squares, counter, winner, set, reset, click_handler, click_handler_1];
  }
  var Root = class extends SvelteComponentDev {
    constructor(options) {
      super(options);
      init(this, options, instance, create_fragment, safe_not_equal, { squares: 0 });
      dispatch_dev("SvelteRegisterComponent", {
        component: this,
        tagName: "Root",
        options,
        id: create_fragment.name
      });
    }
    get squares() {
      throw new Error("<Root>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    }
    set squares(value) {
      throw new Error("<Root>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    }
  };
  var Root_default = Root;

  // src/main.ts
  var main_default = new Root_default({ target: document.body });
})();
//# sourceMappingURL=main.js.map
