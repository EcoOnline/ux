
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
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
        flushing = false;
        seen_callbacks.clear();
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

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
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
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
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
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
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
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.35.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
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
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    /*
     * QRious v4.0.2
     * Copyright (C) 2017 Alasdair Mercer
     * Copyright (C) 2010 Tom Zerucha
     *
     * This program is free software: you can redistribute it and/or modify
     * it under the terms of the GNU General Public License as published by
     * the Free Software Foundation, either version 3 of the License, or
     * (at your option) any later version.
     *
     * This program is distributed in the hope that it will be useful,
     * but WITHOUT ANY WARRANTY; without even the implied warranty of
     * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     * GNU General Public License for more details.
     *
     * You should have received a copy of the GNU General Public License
     * along with this program.  If not, see <http://www.gnu.org/licenses/>.
     */

    var qrcode = createCommonjsModule(function (module, exports) {
    (function (global, factory) {
        module.exports = factory() ;
      }(commonjsGlobal, (function () {  
        /*
         * Copyright (C) 2017 Alasdair Mercer, !ninja
         *
         * Permission is hereby granted, free of charge, to any person obtaining a copy
         * of this software and associated documentation files (the "Software"), to deal
         * in the Software without restriction, including without limitation the rights
         * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
         * copies of the Software, and to permit persons to whom the Software is
         * furnished to do so, subject to the following conditions:
         *
         * The above copyright notice and this permission notice shall be included in all
         * copies or substantial portions of the Software.
         *
         * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
         * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
         * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
         * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
         * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
         * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
         * SOFTWARE.
         */
      
        /**
         * A bare-bones constructor for surrogate prototype swapping.
         *
         * @private
         * @constructor
         */
        var Constructor = /* istanbul ignore next */ function() {};
        /**
         * A reference to <code>Object.prototype.hasOwnProperty</code>.
         *
         * @private
         * @type {Function}
         */
        var hasOwnProperty = Object.prototype.hasOwnProperty;
        /**
         * A reference to <code>Array.prototype.slice</code>.
         *
         * @private
         * @type {Function}
         */
        var slice = Array.prototype.slice;
      
        /**
         * Creates an object which inherits the given <code>prototype</code>.
         *
         * Optionally, the created object can be extended further with the specified <code>properties</code>.
         *
         * @param {Object} prototype - the prototype to be inherited by the created object
         * @param {Object} [properties] - the optional properties to be extended by the created object
         * @return {Object} The newly created object.
         * @private
         */
        function createObject(prototype, properties) {
          var result;
          /* istanbul ignore next */
          if (typeof Object.create === 'function') {
            result = Object.create(prototype);
          } else {
            Constructor.prototype = prototype;
            result = new Constructor();
            Constructor.prototype = null;
          }
      
          if (properties) {
            extendObject(true, result, properties);
          }
      
          return result;
        }
      
        /**
         * Extends the constructor to which this method is associated with the <code>prototype</code> and/or
         * <code>statics</code> provided.
         *
         * If <code>name</code> is provided, it will be used as the class name and can be accessed via a special
         * <code>class_</code> property on the child constructor, otherwise the class name of the super constructor will be used
         * instead. The class name may also be used string representation for instances of the child constructor (via
         * <code>toString</code>), but this is not applicable to the <i>lite</i> version of Nevis.
         *
         * If <code>constructor</code> is provided, it will be used as the constructor for the child, otherwise a simple
         * constructor which only calls the super constructor will be used instead.
         *
         * The super constructor can be accessed via a special <code>super_</code> property on the child constructor.
         *
         * @param {string} [name=this.class_] - the class name to be used for the child constructor
         * @param {Function} [constructor] - the constructor for the child
         * @param {Object} [prototype] - the prototype properties to be defined for the child
         * @param {Object} [statics] - the static properties to be defined for the child
         * @return {Function} The child <code>constructor</code> provided or the one created if none was given.
         * @public
         */
        function extend(name, constructor, prototype, statics) {
          var superConstructor = this;
      
          if (typeof name !== 'string') {
            statics = prototype;
            prototype = constructor;
            constructor = name;
            name = null;
          }
      
          if (typeof constructor !== 'function') {
            statics = prototype;
            prototype = constructor;
            constructor = function() {
              return superConstructor.apply(this, arguments);
            };
          }
      
          extendObject(false, constructor, superConstructor, statics);
      
          constructor.prototype = createObject(superConstructor.prototype, prototype);
          constructor.prototype.constructor = constructor;
      
          constructor.class_ = name || superConstructor.class_;
          constructor.super_ = superConstructor;
      
          return constructor;
        }
      
        /**
         * Extends the specified <code>target</code> object with the properties in each of the <code>sources</code> provided.
         *
         * if any source is <code>null</code> it will be ignored.
         *
         * @param {boolean} own - <code>true</code> to only copy <b>own</b> properties from <code>sources</code> onto
         * <code>target</code>; otherwise <code>false</code>
         * @param {Object} target - the target object which should be extended
         * @param {...Object} [sources] - the source objects whose properties are to be copied onto <code>target</code>
         * @return {void}
         * @private
         */
        function extendObject(own, target, sources) {
          sources = slice.call(arguments, 2);
      
          var property;
          var source;
      
          for (var i = 0, length = sources.length; i < length; i++) {
            source = sources[i];
      
            for (property in source) {
              if (!own || hasOwnProperty.call(source, property)) {
                target[property] = source[property];
              }
            }
          }
        }
      
        var extend_1 = extend;
      
        /**
         * The base class from which all others should extend.
         *
         * @public
         * @constructor
         */
        function Nevis() {}
        Nevis.class_ = 'Nevis';
        Nevis.super_ = Object;
      
        /**
         * Extends the constructor to which this method is associated with the <code>prototype</code> and/or
         * <code>statics</code> provided.
         *
         * If <code>name</code> is provided, it will be used as the class name and can be accessed via a special
         * <code>class_</code> property on the child constructor, otherwise the class name of the super constructor will be used
         * instead. The class name may also be used string representation for instances of the child constructor (via
         * <code>toString</code>), but this is not applicable to the <i>lite</i> version of Nevis.
         *
         * If <code>constructor</code> is provided, it will be used as the constructor for the child, otherwise a simple
         * constructor which only calls the super constructor will be used instead.
         *
         * The super constructor can be accessed via a special <code>super_</code> property on the child constructor.
         *
         * @param {string} [name=this.class_] - the class name to be used for the child constructor
         * @param {Function} [constructor] - the constructor for the child
         * @param {Object} [prototype] - the prototype properties to be defined for the child
         * @param {Object} [statics] - the static properties to be defined for the child
         * @return {Function} The child <code>constructor</code> provided or the one created if none was given.
         * @public
         * @static
         * @memberof Nevis
         */
        Nevis.extend = extend_1;
      
        var nevis = Nevis;
      
        var lite = nevis;
      
        /**
         * Responsible for rendering a QR code {@link Frame} on a specific type of element.
         *
         * A renderer may be dependant on the rendering of another element, so the ordering of their execution is important.
         *
         * The rendering of a element can be deferred by disabling the renderer initially, however, any attempt get the element
         * from the renderer will result in it being immediately enabled and the element being rendered.
         *
         * @param {QRious} qrious - the {@link QRious} instance to be used
         * @param {*} element - the element onto which the QR code is to be rendered
         * @param {boolean} [enabled] - <code>true</code> this {@link Renderer} is enabled; otherwise <code>false</code>.
         * @public
         * @class
         * @extends Nevis
         */
        var Renderer = lite.extend(function(qrious, element, enabled) {
          /**
           * The {@link QRious} instance.
           *
           * @protected
           * @type {QRious}
           * @memberof Renderer#
           */
          this.qrious = qrious;
      
          /**
           * The element onto which this {@link Renderer} is rendering the QR code.
           *
           * @protected
           * @type {*}
           * @memberof Renderer#
           */
          this.element = element;
          this.element.qrious = qrious;
      
          /**
           * Whether this {@link Renderer} is enabled.
           *
           * @protected
           * @type {boolean}
           * @memberof Renderer#
           */
          this.enabled = Boolean(enabled);
        }, {
      
          /**
           * Draws the specified QR code <code>frame</code> on the underlying element.
           *
           * Implementations of {@link Renderer} <b>must</b> override this method with their own specific logic.
           *
           * @param {Frame} frame - the {@link Frame} to be drawn
           * @return {void}
           * @protected
           * @abstract
           * @memberof Renderer#
           */
          draw: function(frame) {},
      
          /**
           * Returns the element onto which this {@link Renderer} is rendering the QR code.
           *
           * If this method is called while this {@link Renderer} is disabled, it will be immediately enabled and rendered
           * before the element is returned.
           *
           * @return {*} The element.
           * @public
           * @memberof Renderer#
           */
          getElement: function() {
            if (!this.enabled) {
              this.enabled = true;
              this.render();
            }
      
            return this.element;
          },
      
          /**
           * Calculates the size (in pixel units) to represent an individual module within the QR code based on the
           * <code>frame</code> provided.
           *
           * Any configured padding will be excluded from the returned size.
           *
           * The returned value will be at least one, even in cases where the size of the QR code does not fit its contents.
           * This is done so that the inevitable clipping is handled more gracefully since this way at least something is
           * displayed instead of just a blank space filled by the background color.
           *
           * @param {Frame} frame - the {@link Frame} from which the module size is to be derived
           * @return {number} The pixel size for each module in the QR code which will be no less than one.
           * @protected
           * @memberof Renderer#
           */
          getModuleSize: function(frame) {
            var qrious = this.qrious;
            var padding = qrious.padding || 0;
            var pixels = Math.floor((qrious.size - (padding * 2)) / frame.width);
      
            return Math.max(1, pixels);
          },

          /**
           * Renders a QR code on the underlying element based on the <code>frame</code> provided.
           *
           * @param {Frame} frame - the {@link Frame} to be rendered
           * @return {void}
           * @public
           * @memberof Renderer#
           */
          render: function(frame) {
            if (this.enabled) {
              this.resize();
              this.reset();
              this.draw(frame);
            }
          },
      
          /**
           * Resets the underlying element, effectively clearing any previously rendered QR code.
           *
           * Implementations of {@link Renderer} <b>must</b> override this method with their own specific logic.
           *
           * @return {void}
           * @protected
           * @abstract
           * @memberof Renderer#
           */
          reset: function() {},
      
          /**
           * Ensures that the size of the underlying element matches that defined on the associated {@link QRious} instance.
           *
           * Implementations of {@link Renderer} <b>must</b> override this method with their own specific logic.
           *
           * @return {void}
           * @protected
           * @abstract
           * @memberof Renderer#
           */
          resize: function() {}
      
        });
      
        var Renderer_1 = Renderer;
      
        /**
         * An implementation of {@link Renderer} for working with <code>canvas</code> elements.
         *
         * @public
         * @class
         * @extends Renderer
         */
        var CanvasRenderer = Renderer_1.extend({
      
          /**
           * @override
           */
          draw: function(frame) {
            var i, j;
            var qrious = this.qrious;
            var moduleSize = this.getModuleSize(frame);
            var offset = parseInt((this.element.width-(frame.width * moduleSize)) / 2);
            var context = this.element.getContext('2d');
      
            context.fillStyle = qrious.foreground;
            context.globalAlpha = qrious.foregroundAlpha;
      
            for (i = 0; i < frame.width; i++) {
              for (j = 0; j < frame.width; j++) {
                if (frame.buffer[(j * frame.width) + i]) {
                  context.fillRect((moduleSize * i) + offset, (moduleSize * j) + offset, moduleSize, moduleSize);
                }
              }
            }
          },
      
          /**
           * @override
           */
          reset: function() {
            var qrious = this.qrious;
            var context = this.element.getContext('2d');
            var size = qrious.size;
      
            context.lineWidth = 1;
            context.clearRect(0, 0, size, size);
            context.fillStyle = qrious.background;
            context.globalAlpha = qrious.backgroundAlpha;
            context.fillRect(0, 0, size, size);
          },
      
          /**
           * @override
           */
          resize: function() {
            var element = this.element;
      
            element.width = element.height = this.qrious.size;
          }
      
        });
      
        var CanvasRenderer_1 = CanvasRenderer;
      
        /* eslint no-multi-spaces: "off" */
      
      
      
        /**
         * Contains alignment pattern information.
         *
         * @public
         * @class
         * @extends Nevis
         */
        var Alignment = lite.extend(null, {
      
          /**
           * The alignment pattern block.
           *
           * @public
           * @static
           * @type {number[]}
           * @memberof Alignment
           */
          BLOCK: [
            0,  11, 15, 19, 23, 27, 31,
            16, 18, 20, 22, 24, 26, 28, 20, 22, 24, 24, 26, 28, 28, 22, 24, 24,
            26, 26, 28, 28, 24, 24, 26, 26, 26, 28, 28, 24, 26, 26, 26, 28, 28
          ]
      
        });
      
        var Alignment_1 = Alignment;
      
        /* eslint no-multi-spaces: "off" */
      
      
      
        /**
         * Contains error correction information.
         *
         * @public
         * @class
         * @extends Nevis
         */
        var ErrorCorrection = lite.extend(null, {
      
          /**
           * The error correction blocks.
           *
           * There are four elements per version. The first two indicate the number of blocks, then the data width, and finally
           * the ECC width.
           *
           * @public
           * @static
           * @type {number[]}
           * @memberof ErrorCorrection
           */
          BLOCKS: [
            1,  0,  19,  7,     1,  0,  16,  10,    1,  0,  13,  13,    1,  0,  9,   17,
            1,  0,  34,  10,    1,  0,  28,  16,    1,  0,  22,  22,    1,  0,  16,  28,
            1,  0,  55,  15,    1,  0,  44,  26,    2,  0,  17,  18,    2,  0,  13,  22,
            1,  0,  80,  20,    2,  0,  32,  18,    2,  0,  24,  26,    4,  0,  9,   16,
            1,  0,  108, 26,    2,  0,  43,  24,    2,  2,  15,  18,    2,  2,  11,  22,
            2,  0,  68,  18,    4,  0,  27,  16,    4,  0,  19,  24,    4,  0,  15,  28,
            2,  0,  78,  20,    4,  0,  31,  18,    2,  4,  14,  18,    4,  1,  13,  26,
            2,  0,  97,  24,    2,  2,  38,  22,    4,  2,  18,  22,    4,  2,  14,  26,
            2,  0,  116, 30,    3,  2,  36,  22,    4,  4,  16,  20,    4,  4,  12,  24,
            2,  2,  68,  18,    4,  1,  43,  26,    6,  2,  19,  24,    6,  2,  15,  28,
            4,  0,  81,  20,    1,  4,  50,  30,    4,  4,  22,  28,    3,  8,  12,  24,
            2,  2,  92,  24,    6,  2,  36,  22,    4,  6,  20,  26,    7,  4,  14,  28,
            4,  0,  107, 26,    8,  1,  37,  22,    8,  4,  20,  24,    12, 4,  11,  22,
            3,  1,  115, 30,    4,  5,  40,  24,    11, 5,  16,  20,    11, 5,  12,  24,
            5,  1,  87,  22,    5,  5,  41,  24,    5,  7,  24,  30,    11, 7,  12,  24,
            5,  1,  98,  24,    7,  3,  45,  28,    15, 2,  19,  24,    3,  13, 15,  30,
            1,  5,  107, 28,    10, 1,  46,  28,    1,  15, 22,  28,    2,  17, 14,  28,
            5,  1,  120, 30,    9,  4,  43,  26,    17, 1,  22,  28,    2,  19, 14,  28,
            3,  4,  113, 28,    3,  11, 44,  26,    17, 4,  21,  26,    9,  16, 13,  26,
            3,  5,  107, 28,    3,  13, 41,  26,    15, 5,  24,  30,    15, 10, 15,  28,
            4,  4,  116, 28,    17, 0,  42,  26,    17, 6,  22,  28,    19, 6,  16,  30,
            2,  7,  111, 28,    17, 0,  46,  28,    7,  16, 24,  30,    34, 0,  13,  24,
            4,  5,  121, 30,    4,  14, 47,  28,    11, 14, 24,  30,    16, 14, 15,  30,
            6,  4,  117, 30,    6,  14, 45,  28,    11, 16, 24,  30,    30, 2,  16,  30,
            8,  4,  106, 26,    8,  13, 47,  28,    7,  22, 24,  30,    22, 13, 15,  30,
            10, 2,  114, 28,    19, 4,  46,  28,    28, 6,  22,  28,    33, 4,  16,  30,
            8,  4,  122, 30,    22, 3,  45,  28,    8,  26, 23,  30,    12, 28, 15,  30,
            3,  10, 117, 30,    3,  23, 45,  28,    4,  31, 24,  30,    11, 31, 15,  30,
            7,  7,  116, 30,    21, 7,  45,  28,    1,  37, 23,  30,    19, 26, 15,  30,
            5,  10, 115, 30,    19, 10, 47,  28,    15, 25, 24,  30,    23, 25, 15,  30,
            13, 3,  115, 30,    2,  29, 46,  28,    42, 1,  24,  30,    23, 28, 15,  30,
            17, 0,  115, 30,    10, 23, 46,  28,    10, 35, 24,  30,    19, 35, 15,  30,
            17, 1,  115, 30,    14, 21, 46,  28,    29, 19, 24,  30,    11, 46, 15,  30,
            13, 6,  115, 30,    14, 23, 46,  28,    44, 7,  24,  30,    59, 1,  16,  30,
            12, 7,  121, 30,    12, 26, 47,  28,    39, 14, 24,  30,    22, 41, 15,  30,
            6,  14, 121, 30,    6,  34, 47,  28,    46, 10, 24,  30,    2,  64, 15,  30,
            17, 4,  122, 30,    29, 14, 46,  28,    49, 10, 24,  30,    24, 46, 15,  30,
            4,  18, 122, 30,    13, 32, 46,  28,    48, 14, 24,  30,    42, 32, 15,  30,
            20, 4,  117, 30,    40, 7,  47,  28,    43, 22, 24,  30,    10, 67, 15,  30,
            19, 6,  118, 30,    18, 31, 47,  28,    34, 34, 24,  30,    20, 61, 15,  30
          ],
      
          /**
           * The final format bits with mask (level << 3 | mask).
           *
           * @public
           * @static
           * @type {number[]}
           * @memberof ErrorCorrection
           */
          FINAL_FORMAT: [
            // L
            0x77c4, 0x72f3, 0x7daa, 0x789d, 0x662f, 0x6318, 0x6c41, 0x6976,
            // M
            0x5412, 0x5125, 0x5e7c, 0x5b4b, 0x45f9, 0x40ce, 0x4f97, 0x4aa0,
            // Q
            0x355f, 0x3068, 0x3f31, 0x3a06, 0x24b4, 0x2183, 0x2eda, 0x2bed,
            // H
            0x1689, 0x13be, 0x1ce7, 0x19d0, 0x0762, 0x0255, 0x0d0c, 0x083b
          ],
      
          /**
           * A map of human-readable ECC levels.
           *
           * @public
           * @static
           * @type {Object.<string, number>}
           * @memberof ErrorCorrection
           */
          LEVELS: {
            L: 1,
            M: 2,
            Q: 3,
            H: 4
          }
      
        });
      
        var ErrorCorrection_1 = ErrorCorrection;
      
        /**
         * Contains Galois field information.
         *
         * @public
         * @class
         * @extends Nevis
         */
        var Galois = lite.extend(null, {
      
          /**
           * The Galois field exponent table.
           *
           * @public
           * @static
           * @type {number[]}
           * @memberof Galois
           */
          EXPONENT: [
            0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1d, 0x3a, 0x74, 0xe8, 0xcd, 0x87, 0x13, 0x26,
            0x4c, 0x98, 0x2d, 0x5a, 0xb4, 0x75, 0xea, 0xc9, 0x8f, 0x03, 0x06, 0x0c, 0x18, 0x30, 0x60, 0xc0,
            0x9d, 0x27, 0x4e, 0x9c, 0x25, 0x4a, 0x94, 0x35, 0x6a, 0xd4, 0xb5, 0x77, 0xee, 0xc1, 0x9f, 0x23,
            0x46, 0x8c, 0x05, 0x0a, 0x14, 0x28, 0x50, 0xa0, 0x5d, 0xba, 0x69, 0xd2, 0xb9, 0x6f, 0xde, 0xa1,
            0x5f, 0xbe, 0x61, 0xc2, 0x99, 0x2f, 0x5e, 0xbc, 0x65, 0xca, 0x89, 0x0f, 0x1e, 0x3c, 0x78, 0xf0,
            0xfd, 0xe7, 0xd3, 0xbb, 0x6b, 0xd6, 0xb1, 0x7f, 0xfe, 0xe1, 0xdf, 0xa3, 0x5b, 0xb6, 0x71, 0xe2,
            0xd9, 0xaf, 0x43, 0x86, 0x11, 0x22, 0x44, 0x88, 0x0d, 0x1a, 0x34, 0x68, 0xd0, 0xbd, 0x67, 0xce,
            0x81, 0x1f, 0x3e, 0x7c, 0xf8, 0xed, 0xc7, 0x93, 0x3b, 0x76, 0xec, 0xc5, 0x97, 0x33, 0x66, 0xcc,
            0x85, 0x17, 0x2e, 0x5c, 0xb8, 0x6d, 0xda, 0xa9, 0x4f, 0x9e, 0x21, 0x42, 0x84, 0x15, 0x2a, 0x54,
            0xa8, 0x4d, 0x9a, 0x29, 0x52, 0xa4, 0x55, 0xaa, 0x49, 0x92, 0x39, 0x72, 0xe4, 0xd5, 0xb7, 0x73,
            0xe6, 0xd1, 0xbf, 0x63, 0xc6, 0x91, 0x3f, 0x7e, 0xfc, 0xe5, 0xd7, 0xb3, 0x7b, 0xf6, 0xf1, 0xff,
            0xe3, 0xdb, 0xab, 0x4b, 0x96, 0x31, 0x62, 0xc4, 0x95, 0x37, 0x6e, 0xdc, 0xa5, 0x57, 0xae, 0x41,
            0x82, 0x19, 0x32, 0x64, 0xc8, 0x8d, 0x07, 0x0e, 0x1c, 0x38, 0x70, 0xe0, 0xdd, 0xa7, 0x53, 0xa6,
            0x51, 0xa2, 0x59, 0xb2, 0x79, 0xf2, 0xf9, 0xef, 0xc3, 0x9b, 0x2b, 0x56, 0xac, 0x45, 0x8a, 0x09,
            0x12, 0x24, 0x48, 0x90, 0x3d, 0x7a, 0xf4, 0xf5, 0xf7, 0xf3, 0xfb, 0xeb, 0xcb, 0x8b, 0x0b, 0x16,
            0x2c, 0x58, 0xb0, 0x7d, 0xfa, 0xe9, 0xcf, 0x83, 0x1b, 0x36, 0x6c, 0xd8, 0xad, 0x47, 0x8e, 0x00
          ],
      
          /**
           * The Galois field log table.
           *
           * @public
           * @static
           * @type {number[]}
           * @memberof Galois
           */
          LOG: [
            0xff, 0x00, 0x01, 0x19, 0x02, 0x32, 0x1a, 0xc6, 0x03, 0xdf, 0x33, 0xee, 0x1b, 0x68, 0xc7, 0x4b,
            0x04, 0x64, 0xe0, 0x0e, 0x34, 0x8d, 0xef, 0x81, 0x1c, 0xc1, 0x69, 0xf8, 0xc8, 0x08, 0x4c, 0x71,
            0x05, 0x8a, 0x65, 0x2f, 0xe1, 0x24, 0x0f, 0x21, 0x35, 0x93, 0x8e, 0xda, 0xf0, 0x12, 0x82, 0x45,
            0x1d, 0xb5, 0xc2, 0x7d, 0x6a, 0x27, 0xf9, 0xb9, 0xc9, 0x9a, 0x09, 0x78, 0x4d, 0xe4, 0x72, 0xa6,
            0x06, 0xbf, 0x8b, 0x62, 0x66, 0xdd, 0x30, 0xfd, 0xe2, 0x98, 0x25, 0xb3, 0x10, 0x91, 0x22, 0x88,
            0x36, 0xd0, 0x94, 0xce, 0x8f, 0x96, 0xdb, 0xbd, 0xf1, 0xd2, 0x13, 0x5c, 0x83, 0x38, 0x46, 0x40,
            0x1e, 0x42, 0xb6, 0xa3, 0xc3, 0x48, 0x7e, 0x6e, 0x6b, 0x3a, 0x28, 0x54, 0xfa, 0x85, 0xba, 0x3d,
            0xca, 0x5e, 0x9b, 0x9f, 0x0a, 0x15, 0x79, 0x2b, 0x4e, 0xd4, 0xe5, 0xac, 0x73, 0xf3, 0xa7, 0x57,
            0x07, 0x70, 0xc0, 0xf7, 0x8c, 0x80, 0x63, 0x0d, 0x67, 0x4a, 0xde, 0xed, 0x31, 0xc5, 0xfe, 0x18,
            0xe3, 0xa5, 0x99, 0x77, 0x26, 0xb8, 0xb4, 0x7c, 0x11, 0x44, 0x92, 0xd9, 0x23, 0x20, 0x89, 0x2e,
            0x37, 0x3f, 0xd1, 0x5b, 0x95, 0xbc, 0xcf, 0xcd, 0x90, 0x87, 0x97, 0xb2, 0xdc, 0xfc, 0xbe, 0x61,
            0xf2, 0x56, 0xd3, 0xab, 0x14, 0x2a, 0x5d, 0x9e, 0x84, 0x3c, 0x39, 0x53, 0x47, 0x6d, 0x41, 0xa2,
            0x1f, 0x2d, 0x43, 0xd8, 0xb7, 0x7b, 0xa4, 0x76, 0xc4, 0x17, 0x49, 0xec, 0x7f, 0x0c, 0x6f, 0xf6,
            0x6c, 0xa1, 0x3b, 0x52, 0x29, 0x9d, 0x55, 0xaa, 0xfb, 0x60, 0x86, 0xb1, 0xbb, 0xcc, 0x3e, 0x5a,
            0xcb, 0x59, 0x5f, 0xb0, 0x9c, 0xa9, 0xa0, 0x51, 0x0b, 0xf5, 0x16, 0xeb, 0x7a, 0x75, 0x2c, 0xd7,
            0x4f, 0xae, 0xd5, 0xe9, 0xe6, 0xe7, 0xad, 0xe8, 0x74, 0xd6, 0xf4, 0xea, 0xa8, 0x50, 0x58, 0xaf
          ]
      
        });
      
        var Galois_1 = Galois;
      
        /**
         * Contains version pattern information.
         *
         * @public
         * @class
         * @extends Nevis
         */
        var Version = lite.extend(null, {
      
          /**
           * The version pattern block.
           *
           * @public
           * @static
           * @type {number[]}
           * @memberof Version
           */
          BLOCK: [
            0xc94, 0x5bc, 0xa99, 0x4d3, 0xbf6, 0x762, 0x847, 0x60d, 0x928, 0xb78, 0x45d, 0xa17, 0x532,
            0x9a6, 0x683, 0x8c9, 0x7ec, 0xec4, 0x1e1, 0xfab, 0x08e, 0xc1a, 0x33f, 0xd75, 0x250, 0x9d5,
            0x6f0, 0x8ba, 0x79f, 0xb0b, 0x42e, 0xa64, 0x541, 0xc69
          ]
      
        });
      
        var Version_1 = Version;
      
        /**
         * Generates information for a QR code frame based on a specific value to be encoded.
         *
         * @param {Frame~Options} options - the options to be used
         * @public
         * @class
         * @extends Nevis
         */
        var Frame = lite.extend(function(options) {
          var dataBlock, eccBlock, index, neccBlock1, neccBlock2;
          var valueLength = options.value.length;
      
          this._badness = [];
          this._level = ErrorCorrection_1.LEVELS[options.level];
          this._polynomial = [];
          this._value = options.value;
          this._version = 0;
          this._stringBuffer = [];
      
          while (this._version < 40) {
            this._version++;
      
            index = ((this._level - 1) * 4) + ((this._version - 1) * 16);
      
            neccBlock1 = ErrorCorrection_1.BLOCKS[index++];
            neccBlock2 = ErrorCorrection_1.BLOCKS[index++];
            dataBlock = ErrorCorrection_1.BLOCKS[index++];
            eccBlock = ErrorCorrection_1.BLOCKS[index];
      
            index = (dataBlock * (neccBlock1 + neccBlock2)) + neccBlock2 - 3 + (this._version <= 9);
      
            if (valueLength <= index) {
              break;
            }
          }
      
          this._dataBlock = dataBlock;
          this._eccBlock = eccBlock;
          this._neccBlock1 = neccBlock1;
          this._neccBlock2 = neccBlock2;
      
          /**
           * The data width is based on version.
           *
           * @public
           * @type {number}
           * @memberof Frame#
           */
          // FIXME: Ensure that it fits instead of being truncated.
          var width = this.width = 17 + (4 * this._version);
      
          /**
           * The image buffer.
           *
           * @public
           * @type {number[]}
           * @memberof Frame#
           */
          this.buffer = Frame._createArray(width * width);
      
          this._ecc = Frame._createArray(dataBlock + ((dataBlock + eccBlock) * (neccBlock1 + neccBlock2)) + neccBlock2);
          this._mask = Frame._createArray(((width * (width + 1)) + 1) / 2);
      
          this._insertFinders();
          this._insertAlignments();
      
          // Insert single foreground cell.
          this.buffer[8 + (width * (width - 8))] = 1;
      
          this._insertTimingGap();
          this._reverseMask();
          this._insertTimingRowAndColumn();
          this._insertVersion();
          this._syncMask();
          this._convertBitStream(valueLength);
          this._calculatePolynomial();
          this._appendEccToData();
          this._interleaveBlocks();
          this._pack();
          this._finish();
        }, {
      
          _addAlignment: function(x, y) {
            var i;
            var buffer = this.buffer;
            var width = this.width;
      
            buffer[x + (width * y)] = 1;
      
            for (i = -2; i < 2; i++) {
              buffer[x + i + (width * (y - 2))] = 1;
              buffer[x - 2 + (width * (y + i + 1))] = 1;
              buffer[x + 2 + (width * (y + i))] = 1;
              buffer[x + i + 1 + (width * (y + 2))] = 1;
            }
      
            for (i = 0; i < 2; i++) {
              this._setMask(x - 1, y + i);
              this._setMask(x + 1, y - i);
              this._setMask(x - i, y - 1);
              this._setMask(x + i, y + 1);
            }
          },
      
          _appendData: function(data, dataLength, ecc, eccLength) {
            var bit, i, j;
            var polynomial = this._polynomial;
            var stringBuffer = this._stringBuffer;
      
            for (i = 0; i < eccLength; i++) {
              stringBuffer[ecc + i] = 0;
            }
      
            for (i = 0; i < dataLength; i++) {
              bit = Galois_1.LOG[stringBuffer[data + i] ^ stringBuffer[ecc]];
      
              if (bit !== 255) {
                for (j = 1; j < eccLength; j++) {
                  stringBuffer[ecc + j - 1] = stringBuffer[ecc + j] ^
                    Galois_1.EXPONENT[Frame._modN(bit + polynomial[eccLength - j])];
                }
              } else {
                for (j = ecc; j < ecc + eccLength; j++) {
                  stringBuffer[j] = stringBuffer[j + 1];
                }
              }
      
              stringBuffer[ecc + eccLength - 1] = bit === 255 ? 0 : Galois_1.EXPONENT[Frame._modN(bit + polynomial[0])];
            }
          },
      
          _appendEccToData: function() {
            var i;
            var data = 0;
            var dataBlock = this._dataBlock;
            var ecc = this._calculateMaxLength();
            var eccBlock = this._eccBlock;
      
            for (i = 0; i < this._neccBlock1; i++) {
              this._appendData(data, dataBlock, ecc, eccBlock);
      
              data += dataBlock;
              ecc += eccBlock;
            }
      
            for (i = 0; i < this._neccBlock2; i++) {
              this._appendData(data, dataBlock + 1, ecc, eccBlock);
      
              data += dataBlock + 1;
              ecc += eccBlock;
            }
          },
      
          _applyMask: function(mask) {
            var r3x, r3y, x, y;
            var buffer = this.buffer;
            var width = this.width;
      
            switch (mask) {
            case 0:
              for (y = 0; y < width; y++) {
                for (x = 0; x < width; x++) {
                  if (!((x + y) & 1) && !this._isMasked(x, y)) {
                    buffer[x + (y * width)] ^= 1;
                  }
                }
              }
      
              break;
            case 1:
              for (y = 0; y < width; y++) {
                for (x = 0; x < width; x++) {
                  if (!(y & 1) && !this._isMasked(x, y)) {
                    buffer[x + (y * width)] ^= 1;
                  }
                }
              }
      
              break;
            case 2:
              for (y = 0; y < width; y++) {
                for (r3x = 0, x = 0; x < width; x++, r3x++) {
                  if (r3x === 3) {
                    r3x = 0;
                  }
      
                  if (!r3x && !this._isMasked(x, y)) {
                    buffer[x + (y * width)] ^= 1;
                  }
                }
              }
      
              break;
            case 3:
              for (r3y = 0, y = 0; y < width; y++, r3y++) {
                if (r3y === 3) {
                  r3y = 0;
                }
      
                for (r3x = r3y, x = 0; x < width; x++, r3x++) {
                  if (r3x === 3) {
                    r3x = 0;
                  }
      
                  if (!r3x && !this._isMasked(x, y)) {
                    buffer[x + (y * width)] ^= 1;
                  }
                }
              }
      
              break;
            case 4:
              for (y = 0; y < width; y++) {
                for (r3x = 0, r3y = (y >> 1) & 1, x = 0; x < width; x++, r3x++) {
                  if (r3x === 3) {
                    r3x = 0;
                    r3y = !r3y;
                  }
      
                  if (!r3y && !this._isMasked(x, y)) {
                    buffer[x + (y * width)] ^= 1;
                  }
                }
              }
      
              break;
            case 5:
              for (r3y = 0, y = 0; y < width; y++, r3y++) {
                if (r3y === 3) {
                  r3y = 0;
                }
      
                for (r3x = 0, x = 0; x < width; x++, r3x++) {
                  if (r3x === 3) {
                    r3x = 0;
                  }
      
                  if (!((x & y & 1) + !(!r3x | !r3y)) && !this._isMasked(x, y)) {
                    buffer[x + (y * width)] ^= 1;
                  }
                }
              }
      
              break;
            case 6:
              for (r3y = 0, y = 0; y < width; y++, r3y++) {
                if (r3y === 3) {
                  r3y = 0;
                }
      
                for (r3x = 0, x = 0; x < width; x++, r3x++) {
                  if (r3x === 3) {
                    r3x = 0;
                  }
      
                  if (!((x & y & 1) + (r3x && r3x === r3y) & 1) && !this._isMasked(x, y)) {
                    buffer[x + (y * width)] ^= 1;
                  }
                }
              }
      
              break;
            case 7:
              for (r3y = 0, y = 0; y < width; y++, r3y++) {
                if (r3y === 3) {
                  r3y = 0;
                }
      
                for (r3x = 0, x = 0; x < width; x++, r3x++) {
                  if (r3x === 3) {
                    r3x = 0;
                  }
      
                  if (!((r3x && r3x === r3y) + (x + y & 1) & 1) && !this._isMasked(x, y)) {
                    buffer[x + (y * width)] ^= 1;
                  }
                }
              }
      
              break;
            }
          },
      
          _calculateMaxLength: function() {
            return (this._dataBlock * (this._neccBlock1 + this._neccBlock2)) + this._neccBlock2;
          },
      
          _calculatePolynomial: function() {
            var i, j;
            var eccBlock = this._eccBlock;
            var polynomial = this._polynomial;
      
            polynomial[0] = 1;
      
            for (i = 0; i < eccBlock; i++) {
              polynomial[i + 1] = 1;
      
              for (j = i; j > 0; j--) {
                polynomial[j] = polynomial[j] ? polynomial[j - 1] ^
                  Galois_1.EXPONENT[Frame._modN(Galois_1.LOG[polynomial[j]] + i)] : polynomial[j - 1];
              }
      
              polynomial[0] = Galois_1.EXPONENT[Frame._modN(Galois_1.LOG[polynomial[0]] + i)];
            }
      
            // Use logs for generator polynomial to save calculation step.
            for (i = 0; i <= eccBlock; i++) {
              polynomial[i] = Galois_1.LOG[polynomial[i]];
            }
          },
      
          _checkBadness: function() {
            var b, b1, h, x, y;
            var bad = 0;
            var badness = this._badness;
            var buffer = this.buffer;
            var width = this.width;
      
            // Blocks of same colour.
            for (y = 0; y < width - 1; y++) {
              for (x = 0; x < width - 1; x++) {
                // All foreground colour.
                if ((buffer[x + (width * y)] &&
                  buffer[x + 1 + (width * y)] &&
                  buffer[x + (width * (y + 1))] &&
                  buffer[x + 1 + (width * (y + 1))]) ||
                  // All background colour.
                  !(buffer[x + (width * y)] ||
                  buffer[x + 1 + (width * y)] ||
                  buffer[x + (width * (y + 1))] ||
                  buffer[x + 1 + (width * (y + 1))])) {
                  bad += Frame.N2;
                }
              }
            }
      
            var bw = 0;
      
            // X runs.
            for (y = 0; y < width; y++) {
              h = 0;
      
              badness[0] = 0;
      
              for (b = 0, x = 0; x < width; x++) {
                b1 = buffer[x + (width * y)];
      
                if (b === b1) {
                  badness[h]++;
                } else {
                  badness[++h] = 1;
                }
      
                b = b1;
                bw += b ? 1 : -1;
              }
      
              bad += this._getBadness(h);
            }
      
            if (bw < 0) {
              bw = -bw;
            }
      
            var count = 0;
            var big = bw;
            big += big << 2;
            big <<= 1;
      
            while (big > width * width) {
              big -= width * width;
              count++;
            }
      
            bad += count * Frame.N4;
      
            // Y runs.
            for (x = 0; x < width; x++) {
              h = 0;
      
              badness[0] = 0;
      
              for (b = 0, y = 0; y < width; y++) {
                b1 = buffer[x + (width * y)];
      
                if (b === b1) {
                  badness[h]++;
                } else {
                  badness[++h] = 1;
                }
      
                b = b1;
              }
      
              bad += this._getBadness(h);
            }
      
            return bad;
          },
      
          _convertBitStream: function(length) {
            var bit, i;
            var ecc = this._ecc;
            var version = this._version;
      
            // Convert string to bit stream. 8-bit data to QR-coded 8-bit data (numeric, alphanumeric, or kanji not supported).
            for (i = 0; i < length; i++) {
              ecc[i] = this._value.charCodeAt(i);
            }
      
            var stringBuffer = this._stringBuffer = ecc.slice();
            var maxLength = this._calculateMaxLength();
      
            if (length >= maxLength - 2) {
              length = maxLength - 2;
      
              if (version > 9) {
                length--;
              }
            }
      
            // Shift and re-pack to insert length prefix.
            var index = length;
      
            if (version > 9) {
              stringBuffer[index + 2] = 0;
              stringBuffer[index + 3] = 0;
      
              while (index--) {
                bit = stringBuffer[index];
      
                stringBuffer[index + 3] |= 255 & (bit << 4);
                stringBuffer[index + 2] = bit >> 4;
              }
      
              stringBuffer[2] |= 255 & (length << 4);
              stringBuffer[1] = length >> 4;
              stringBuffer[0] = 0x40 | (length >> 12);
            } else {
              stringBuffer[index + 1] = 0;
              stringBuffer[index + 2] = 0;
      
              while (index--) {
                bit = stringBuffer[index];
      
                stringBuffer[index + 2] |= 255 & (bit << 4);
                stringBuffer[index + 1] = bit >> 4;
              }
      
              stringBuffer[1] |= 255 & (length << 4);
              stringBuffer[0] = 0x40 | (length >> 4);
            }
      
            // Fill to end with pad pattern.
            index = length + 3 - (version < 10);
      
            while (index < maxLength) {
              stringBuffer[index++] = 0xec;
              stringBuffer[index++] = 0x11;
            }
          },
      
          _getBadness: function(length) {
            var i;
            var badRuns = 0;
            var badness = this._badness;
      
            for (i = 0; i <= length; i++) {
              if (badness[i] >= 5) {
                badRuns += Frame.N1 + badness[i] - 5;
              }
            }
      
            // FBFFFBF as in finder.
            for (i = 3; i < length - 1; i += 2) {
              if (badness[i - 2] === badness[i + 2] &&
                badness[i + 2] === badness[i - 1] &&
                badness[i - 1] === badness[i + 1] &&
                badness[i - 1] * 3 === badness[i] &&
                // Background around the foreground pattern? Not part of the specs.
                (badness[i - 3] === 0 || i + 3 > length ||
                badness[i - 3] * 3 >= badness[i] * 4 ||
                badness[i + 3] * 3 >= badness[i] * 4)) {
                badRuns += Frame.N3;
              }
            }
      
            return badRuns;
          },
      
          _finish: function() {
            // Save pre-mask copy of frame.
            this._stringBuffer = this.buffer.slice();
      
            var currentMask, i;
            var bit = 0;
            var mask = 30000;
      
            /*
             * Using for instead of while since in original Arduino code if an early mask was "good enough" it wouldn't try for
             * a better one since they get more complex and take longer.
             */
            for (i = 0; i < 8; i++) {
              // Returns foreground-background imbalance.
              this._applyMask(i);
      
              currentMask = this._checkBadness();
      
              // Is current mask better than previous best?
              if (currentMask < mask) {
                mask = currentMask;
                bit = i;
              }
      
              // Don't increment "i" to a void redoing mask.
              if (bit === 7) {
                break;
              }
      
              // Reset for next pass.
              this.buffer = this._stringBuffer.slice();
            }
      
            // Redo best mask as none were "good enough" (i.e. last wasn't bit).
            if (bit !== i) {
              this._applyMask(bit);
            }
      
            // Add in final mask/ECC level bytes.
            mask = ErrorCorrection_1.FINAL_FORMAT[bit + (this._level - 1 << 3)];
      
            var buffer = this.buffer;
            var width = this.width;
      
            // Low byte.
            for (i = 0; i < 8; i++, mask >>= 1) {
              if (mask & 1) {
                buffer[width - 1 - i + (width * 8)] = 1;
      
                if (i < 6) {
                  buffer[8 + (width * i)] = 1;
                } else {
                  buffer[8 + (width * (i + 1))] = 1;
                }
              }
            }
      
            // High byte.
            for (i = 0; i < 7; i++, mask >>= 1) {
              if (mask & 1) {
                buffer[8 + (width * (width - 7 + i))] = 1;
      
                if (i) {
                  buffer[6 - i + (width * 8)] = 1;
                } else {
                  buffer[7 + (width * 8)] = 1;
                }
              }
            }
          },
      
          _interleaveBlocks: function() {
            var i, j;
            var dataBlock = this._dataBlock;
            var ecc = this._ecc;
            var eccBlock = this._eccBlock;
            var k = 0;
            var maxLength = this._calculateMaxLength();
            var neccBlock1 = this._neccBlock1;
            var neccBlock2 = this._neccBlock2;
            var stringBuffer = this._stringBuffer;
      
            for (i = 0; i < dataBlock; i++) {
              for (j = 0; j < neccBlock1; j++) {
                ecc[k++] = stringBuffer[i + (j * dataBlock)];
              }
      
              for (j = 0; j < neccBlock2; j++) {
                ecc[k++] = stringBuffer[(neccBlock1 * dataBlock) + i + (j * (dataBlock + 1))];
              }
            }
      
            for (j = 0; j < neccBlock2; j++) {
              ecc[k++] = stringBuffer[(neccBlock1 * dataBlock) + i + (j * (dataBlock + 1))];
            }
      
            for (i = 0; i < eccBlock; i++) {
              for (j = 0; j < neccBlock1 + neccBlock2; j++) {
                ecc[k++] = stringBuffer[maxLength + i + (j * eccBlock)];
              }
            }
      
            this._stringBuffer = ecc;
          },
      
          _insertAlignments: function() {
            var i, x, y;
            var version = this._version;
            var width = this.width;
      
            if (version > 1) {
              i = Alignment_1.BLOCK[version];
              y = width - 7;
      
              for (;;) {
                x = width - 7;
      
                while (x > i - 3) {
                  this._addAlignment(x, y);
      
                  if (x < i) {
                    break;
                  }
      
                  x -= i;
                }
      
                if (y <= i + 9) {
                  break;
                }
      
                y -= i;
      
                this._addAlignment(6, y);
                this._addAlignment(y, 6);
              }
            }
          },
      
          _insertFinders: function() {
            var i, j, x, y;
            var buffer = this.buffer;
            var width = this.width;
      
            for (i = 0; i < 3; i++) {
              j = 0;
              y = 0;
      
              if (i === 1) {
                j = width - 7;
              }
              if (i === 2) {
                y = width - 7;
              }
      
              buffer[y + 3 + (width * (j + 3))] = 1;
      
              for (x = 0; x < 6; x++) {
                buffer[y + x + (width * j)] = 1;
                buffer[y + (width * (j + x + 1))] = 1;
                buffer[y + 6 + (width * (j + x))] = 1;
                buffer[y + x + 1 + (width * (j + 6))] = 1;
              }
      
              for (x = 1; x < 5; x++) {
                this._setMask(y + x, j + 1);
                this._setMask(y + 1, j + x + 1);
                this._setMask(y + 5, j + x);
                this._setMask(y + x + 1, j + 5);
              }
      
              for (x = 2; x < 4; x++) {
                buffer[y + x + (width * (j + 2))] = 1;
                buffer[y + 2 + (width * (j + x + 1))] = 1;
                buffer[y + 4 + (width * (j + x))] = 1;
                buffer[y + x + 1 + (width * (j + 4))] = 1;
              }
            }
          },
      
          _insertTimingGap: function() {
            var x, y;
            var width = this.width;
      
            for (y = 0; y < 7; y++) {
              this._setMask(7, y);
              this._setMask(width - 8, y);
              this._setMask(7, y + width - 7);
            }
      
            for (x = 0; x < 8; x++) {
              this._setMask(x, 7);
              this._setMask(x + width - 8, 7);
              this._setMask(x, width - 8);
            }
          },
      
          _insertTimingRowAndColumn: function() {
            var x;
            var buffer = this.buffer;
            var width = this.width;
      
            for (x = 0; x < width - 14; x++) {
              if (x & 1) {
                this._setMask(8 + x, 6);
                this._setMask(6, 8 + x);
              } else {
                buffer[8 + x + (width * 6)] = 1;
                buffer[6 + (width * (8 + x))] = 1;
              }
            }
          },
      
          _insertVersion: function() {
            var i, j, x, y;
            var buffer = this.buffer;
            var version = this._version;
            var width = this.width;
      
            if (version > 6) {
              i = Version_1.BLOCK[version - 7];
              j = 17;
      
              for (x = 0; x < 6; x++) {
                for (y = 0; y < 3; y++, j--) {
                  if (1 & (j > 11 ? version >> j - 12 : i >> j)) {
                    buffer[5 - x + (width * (2 - y + width - 11))] = 1;
                    buffer[2 - y + width - 11 + (width * (5 - x))] = 1;
                  } else {
                    this._setMask(5 - x, 2 - y + width - 11);
                    this._setMask(2 - y + width - 11, 5 - x);
                  }
                }
              }
            }
          },
      
          _isMasked: function(x, y) {
            var bit = Frame._getMaskBit(x, y);
      
            return this._mask[bit] === 1;
          },
      
          _pack: function() {
            var bit, i, j;
            var k = 1;
            var v = 1;
            var width = this.width;
            var x = width - 1;
            var y = width - 1;
      
            // Interleaved data and ECC codes.
            var length = ((this._dataBlock + this._eccBlock) * (this._neccBlock1 + this._neccBlock2)) + this._neccBlock2;
      
            for (i = 0; i < length; i++) {
              bit = this._stringBuffer[i];
      
              for (j = 0; j < 8; j++, bit <<= 1) {
                if (0x80 & bit) {
                  this.buffer[x + (width * y)] = 1;
                }
      
                // Find next fill position.
                do {
                  if (v) {
                    x--;
                  } else {
                    x++;
      
                    if (k) {
                      if (y !== 0) {
                        y--;
                      } else {
                        x -= 2;
                        k = !k;
      
                        if (x === 6) {
                          x--;
                          y = 9;
                        }
                      }
                    } else if (y !== width - 1) {
                      y++;
                    } else {
                      x -= 2;
                      k = !k;
      
                      if (x === 6) {
                        x--;
                        y -= 8;
                      }
                    }
                  }
      
                  v = !v;
                } while (this._isMasked(x, y));
              }
            }
          },
      
          _reverseMask: function() {
            var x, y;
            var width = this.width;
      
            for (x = 0; x < 9; x++) {
              this._setMask(x, 8);
            }
      
            for (x = 0; x < 8; x++) {
              this._setMask(x + width - 8, 8);
              this._setMask(8, x);
            }
      
            for (y = 0; y < 7; y++) {
              this._setMask(8, y + width - 7);
            }
          },
      
          _setMask: function(x, y) {
            var bit = Frame._getMaskBit(x, y);
      
            this._mask[bit] = 1;
          },
      
          _syncMask: function() {
            var x, y;
            var width = this.width;
      
            for (y = 0; y < width; y++) {
              for (x = 0; x <= y; x++) {
                if (this.buffer[x + (width * y)]) {
                  this._setMask(x, y);
                }
              }
            }
          }
      
        }, {
      
          _createArray: function(length) {
            var i;
            var array = [];
      
            for (i = 0; i < length; i++) {
              array[i] = 0;
            }
      
            return array;
          },
      
          _getMaskBit: function(x, y) {
            var bit;
      
            if (x > y) {
              bit = x;
              x = y;
              y = bit;
            }
      
            bit = y;
            bit += y * y;
            bit >>= 1;
            bit += x;
      
            return bit;
          },
      
          _modN: function(x) {
            while (x >= 255) {
              x -= 255;
              x = (x >> 8) + (x & 255);
            }
      
            return x;
          },
      
          // *Badness* coefficients.
          N1: 3,
          N2: 3,
          N3: 40,
          N4: 10
      
        });
      
        var Frame_1 = Frame;
      
        /**
         * The options used by {@link Frame}.
         *
         * @typedef {Object} Frame~Options
         * @property {string} level - The ECC level to be used.
         * @property {string} value - The value to be encoded.
         */
      
        /**
         * An implementation of {@link Renderer} for working with <code>img</code> elements.
         *
         * This depends on {@link CanvasRenderer} being executed first as this implementation simply applies the data URL from
         * the rendered <code>canvas</code> element as the <code>src</code> for the <code>img</code> element being rendered.
         *
         * @public
         * @class
         * @extends Renderer
         */
        var ImageRenderer = Renderer_1.extend({
      
          /**
           * @override
           */
          draw: function() {
            this.element.src = this.qrious.toDataURL();
          },
      
          /**
           * @override
           */
          reset: function() {
            this.element.src = '';
          },
      
          /**
           * @override
           */
          resize: function() {
            var element = this.element;
      
            element.width = element.height = this.qrious.size;
          }
      
        });
      
        var ImageRenderer_1 = ImageRenderer;
      
        /**
         * Defines an available option while also configuring how values are applied to the target object.
         *
         * Optionally, a default value can be specified as well a value transformer for greater control over how the option
         * value is applied.
         *
         * If no value transformer is specified, then any specified option will be applied directly. All values are maintained
         * on the target object itself as a field using the option name prefixed with a single underscore.
         *
         * When an option is specified as modifiable, the {@link OptionManager} will be required to include a setter for the
         * property that is defined on the target object that uses the option name.
         *
         * @param {string} name - the name to be used
         * @param {boolean} [modifiable] - <code>true</code> if the property defined on target objects should include a setter;
         * otherwise <code>false</code>
         * @param {*} [defaultValue] - the default value to be used
         * @param {Option~ValueTransformer} [valueTransformer] - the value transformer to be used
         * @public
         * @class
         * @extends Nevis
         */
        var Option = lite.extend(function(name, modifiable, defaultValue, valueTransformer) {
          /**
           * The name for this {@link Option}.
           *
           * @public
           * @type {string}
           * @memberof Option#
           */
          this.name = name;
      
          /**
           * Whether a setter should be included on the property defined on target objects for this {@link Option}.
           *
           * @public
           * @type {boolean}
           * @memberof Option#
           */
          this.modifiable = Boolean(modifiable);
      
          /**
           * The default value for this {@link Option}.
           *
           * @public
           * @type {*}
           * @memberof Option#
           */
          this.defaultValue = defaultValue;
      
          this._valueTransformer = valueTransformer;
        }, {
      
          /**
           * Transforms the specified <code>value</code> so that it can be applied for this {@link Option}.
           *
           * If a value transformer has been specified for this {@link Option}, it will be called upon to transform
           * <code>value</code>. Otherwise, <code>value</code> will be returned directly.
           *
           * @param {*} value - the value to be transformed
           * @return {*} The transformed value or <code>value</code> if no value transformer is specified.
           * @public
           * @memberof Option#
           */
          transform: function(value) {
            var transformer = this._valueTransformer;
            if (typeof transformer === 'function') {
              return transformer(value, this);
            }
      
            return value;
          }
      
        });
      
        var Option_1 = Option;
      
        /**
         * Returns a transformed value for the specified <code>value</code> to be applied for the <code>option</code> provided.
         *
         * @callback Option~ValueTransformer
         * @param {*} value - the value to be transformed
         * @param {Option} option - the {@link Option} for which <code>value</code> is being transformed
         * @return {*} The transform value.
         */
      
        /**
         * Contains utility methods that are useful throughout the library.
         *
         * @public
         * @class
         * @extends Nevis
         */
        var Utilities = lite.extend(null, {
      
          /**
           * Returns the absolute value of a given number.
           *
           * This method is simply a convenient shorthand for <code>Math.abs</code> while ensuring that nulls are returned as
           * <code>null</code> instead of zero.
           *
           * @param {number} value - the number whose absolute value is to be returned
           * @return {number} The absolute value of <code>value</code> or <code>null</code> if <code>value</code> is
           * <code>null</code>.
           * @public
           * @static
           * @memberof Utilities
           */
          abs: function(value) {
            return value != null ? Math.abs(value) : null;
          },
      
          /**
           * Returns whether the specified <code>object</code> has a property with the specified <code>name</code> as an own
           * (not inherited) property.
           *
           * @param {Object} object - the object on which the property is to be checked
           * @param {string} name - the name of the property to be checked
           * @return {boolean} <code>true</code> if <code>object</code> has an own property with <code>name</code>.
           * @public
           * @static
           * @memberof Utilities
           */
          hasOwn: function(object, name) {
            return Object.prototype.hasOwnProperty.call(object, name);
          },
      
          /**
           * A non-operation method that does absolutely nothing.
           *
           * @return {void}
           * @public
           * @static
           * @memberof Utilities
           */
          noop: function() {},
      
          /**
           * Transforms the specified <code>string</code> to upper case while remaining null-safe.
           *
           * @param {string} string - the string to be transformed to upper case
           * @return {string} <code>string</code> transformed to upper case if <code>string</code> is not <code>null</code>.
           * @public
           * @static
           * @memberof Utilities
           */
          toUpperCase: function(string) {
            return string != null ? string.toUpperCase() : null;
          }
      
        });
      
        var Utilities_1 = Utilities;
      
        /**
         * Manages multiple {@link Option} instances that are intended to be used by multiple implementations.
         *
         * Although the option definitions are shared between targets, the values are maintained on the targets themselves.
         *
         * @param {Option[]} options - the options to be used
         * @public
         * @class
         * @extends Nevis
         */
        var OptionManager = lite.extend(function(options) {
          /**
           * The available options for this {@link OptionManager}.
           *
           * @public
           * @type {Object.<string, Option>}
           * @memberof OptionManager#
           */
          this.options = {};
      
          options.forEach(function(option) {
            this.options[option.name] = option;
          }, this);
        }, {
      
          /**
           * Returns whether an option with the specified <code>name</code> is available.
           *
           * @param {string} name - the name of the {@link Option} whose existence is to be checked
           * @return {boolean} <code>true</code> if an {@link Option} exists with <code>name</code>; otherwise
           * <code>false</code>.
           * @public
           * @memberof OptionManager#
           */
          exists: function(name) {
            return this.options[name] != null;
          },
      
          /**
           * Returns the value of the option with the specified <code>name</code> on the <code>target</code> object provided.
           *
           * @param {string} name - the name of the {@link Option} whose value on <code>target</code> is to be returned
           * @param {Object} target - the object from which the value of the named {@link Option} is to be returned
           * @return {*} The value of the {@link Option} with <code>name</code> on <code>target</code>.
           * @public
           * @memberof OptionManager#
           */
          get: function(name, target) {
            return OptionManager._get(this.options[name], target);
          },
      
          /**
           * Returns a copy of all of the available options on the <code>target</code> object provided.
           *
           * @param {Object} target - the object from which the option name/value pairs are to be returned
           * @return {Object.<string, *>} A hash containing the name/value pairs of all options on <code>target</code>.
           * @public
           * @memberof OptionManager#
           */
          getAll: function(target) {
            var name;
            var options = this.options;
            var result = {};
      
            for (name in options) {
              if (Utilities_1.hasOwn(options, name)) {
                result[name] = OptionManager._get(options[name], target);
              }
            }
      
            return result;
          },
      
          /**
           * Initializes the available options for the <code>target</code> object provided and then applies the initial values
           * within the speciifed <code>options</code>.
           *
           * This method will throw an error if any of the names within <code>options</code> does not match an available option.
           *
           * This involves setting the default values and defining properties for all of the available options on
           * <code>target</code> before finally calling {@link OptionMananger#setAll} with <code>options</code> and
           * <code>target</code>. Any options that are configured to be modifiable will have a setter included in their defined
           * property that will allow its corresponding value to be modified.
           *
           * If a change handler is specified, it will be called whenever the value changes on <code>target</code> for a
           * modifiable option, but only when done so via the defined property's setter.
           *
           * @param {Object.<string, *>} options - the name/value pairs of the initial options to be set
           * @param {Object} target - the object on which the options are to be initialized
           * @param {Function} [changeHandler] - the function to be called whenever the value of an modifiable option changes on
           * <code>target</code>
           * @return {void}
           * @throws {Error} If <code>options</code> contains an invalid option name.
           * @public
           * @memberof OptionManager#
           */
          init: function(options, target, changeHandler) {
            if (typeof changeHandler !== 'function') {
              changeHandler = Utilities_1.noop;
            }
      
            var name, option;
      
            for (name in this.options) {
              if (Utilities_1.hasOwn(this.options, name)) {
                option = this.options[name];
      
                OptionManager._set(option, option.defaultValue, target);
                OptionManager._createAccessor(option, target, changeHandler);
              }
            }
      
            this._setAll(options, target, true);
          },
      
          /**
           * Sets the value of the option with the specified <code>name</code> on the <code>target</code> object provided to
           * <code>value</code>.
           *
           * This method will throw an error if <code>name</code> does not match an available option or matches an option that
           * cannot be modified.
           *
           * If <code>value</code> is <code>null</code> and the {@link Option} has a default value configured, then that default
           * value will be used instead. If the {@link Option} also has a value transformer configured, it will be used to
           * transform whichever value was determined to be used.
           *
           * This method returns whether the value of the underlying field on <code>target</code> was changed as a result.
           *
           * @param {string} name - the name of the {@link Option} whose value is to be set
           * @param {*} value - the value to be set for the named {@link Option} on <code>target</code>
           * @param {Object} target - the object on which <code>value</code> is to be set for the named {@link Option}
           * @return {boolean} <code>true</code> if the underlying field on <code>target</code> was changed; otherwise
           * <code>false</code>.
           * @throws {Error} If <code>name</code> is invalid or is for an option that cannot be modified.
           * @public
           * @memberof OptionManager#
           */
          set: function(name, value, target) {
            return this._set(name, value, target);
          },
      
          /**
           * Sets all of the specified <code>options</code> on the <code>target</code> object provided to their corresponding
           * values.
           *
           * This method will throw an error if any of the names within <code>options</code> does not match an available option
           * or matches an option that cannot be modified.
           *
           * If any value within <code>options</code> is <code>null</code> and the corresponding {@link Option} has a default
           * value configured, then that default value will be used instead. If an {@link Option} also has a value transformer
           * configured, it will be used to transform whichever value was determined to be used.
           *
           * This method returns whether the value for any of the underlying fields on <code>target</code> were changed as a
           * result.
           *
           * @param {Object.<string, *>} options - the name/value pairs of options to be set
           * @param {Object} target - the object on which the options are to be set
           * @return {boolean} <code>true</code> if any of the underlying fields on <code>target</code> were changed; otherwise
           * <code>false</code>.
           * @throws {Error} If <code>options</code> contains an invalid option name or an option that cannot be modiifed.
           * @public
           * @memberof OptionManager#
           */
          setAll: function(options, target) {
            return this._setAll(options, target);
          },
      
          _set: function(name, value, target, allowUnmodifiable) {
            var option = this.options[name];
            if (!option) {
              throw new Error('Invalid option: ' + name);
            }
            if (!option.modifiable && !allowUnmodifiable) {
              throw new Error('Option cannot be modified: ' + name);
            }
      
            return OptionManager._set(option, value, target);
          },
      
          _setAll: function(options, target, allowUnmodifiable) {
            if (!options) {
              return false;
            }
      
            var name;
            var changed = false;
      
            for (name in options) {
              if (Utilities_1.hasOwn(options, name) && this._set(name, options[name], target, allowUnmodifiable)) {
                changed = true;
              }
            }
      
            return changed;
          }
      
        }, {
      
          _createAccessor: function(option, target, changeHandler) {
            var descriptor = {
              get: function() {
                return OptionManager._get(option, target);
              }
            };
      
            if (option.modifiable) {
              descriptor.set = function(value) {
                if (OptionManager._set(option, value, target)) {
                  changeHandler(value, option);
                }
              };
            }
      
            Object.defineProperty(target, option.name, descriptor);
          },
      
          _get: function(option, target) {
            return target['_' + option.name];
          },
      
          _set: function(option, value, target) {
            var fieldName = '_' + option.name;
            var oldValue = target[fieldName];
            var newValue = option.transform(value != null ? value : option.defaultValue);
      
            target[fieldName] = newValue;
      
            return newValue !== oldValue;
          }
      
        });
      
        var OptionManager_1 = OptionManager;
      
        /**
         * Called whenever the value of a modifiable {@link Option} is changed on a target object via the defined property's
         * setter.
         *
         * @callback OptionManager~ChangeHandler
         * @param {*} value - the new value for <code>option</code> on the target object
         * @param {Option} option - the modifable {@link Option} whose value has changed on the target object.
         * @return {void}
         */
      
        /**
         * A basic manager for {@link Service} implementations that are mapped to simple names.
         *
         * @public
         * @class
         * @extends Nevis
         */
        var ServiceManager = lite.extend(function() {
          this._services = {};
        }, {
      
          /**
           * Returns the {@link Service} being managed with the specified <code>name</code>.
           *
           * @param {string} name - the name of the {@link Service} to be returned
           * @return {Service} The {@link Service} is being managed with <code>name</code>.
           * @throws {Error} If no {@link Service} is being managed with <code>name</code>.
           * @public
           * @memberof ServiceManager#
           */
          getService: function(name) {
            var service = this._services[name];
            if (!service) {
              throw new Error('Service is not being managed with name: ' + name);
            }
      
            return service;
          },
      
          /**
           * Sets the {@link Service} implementation to be managed for the specified <code>name</code> to the
           * <code>service</code> provided.
           *
           * @param {string} name - the name of the {@link Service} to be managed with <code>name</code>
           * @param {Service} service - the {@link Service} implementation to be managed
           * @return {void}
           * @throws {Error} If a {@link Service} is already being managed with the same <code>name</code>.
           * @public
           * @memberof ServiceManager#
           */
          setService: function(name, service) {
            if (this._services[name]) {
              throw new Error('Service is already managed with name: ' + name);
            }
      
            if (service) {
              this._services[name] = service;
            }
          }
      
        });
      
        var ServiceManager_1 = ServiceManager;
      
        var optionManager = new OptionManager_1([
          new Option_1('background', true, 'white'),
          new Option_1('backgroundAlpha', true, 1, Utilities_1.abs),
          new Option_1('element'),
          new Option_1('foreground', true, 'black'),
          new Option_1('foregroundAlpha', true, 1, Utilities_1.abs),
          new Option_1('level', true, 'L', Utilities_1.toUpperCase),
          new Option_1('mime', true, 'image/png'),
          new Option_1('padding', true, null, Utilities_1.abs),
          new Option_1('size', true, 100, Utilities_1.abs),
          new Option_1('value', true, '')
        ]);
        var serviceManager = new ServiceManager_1();
      
        /**
         * Enables configuration of a QR code generator which uses HTML5 <code>canvas</code> for rendering.
         *
         * @param {QRious~Options} [options] - the options to be used
         * @throws {Error} If any <code>options</code> are invalid.
         * @public
         * @class
         * @extends Nevis
         */
        var QRious = lite.extend(function(options) {
          optionManager.init(options, this, this.update.bind(this));
      
          var element = optionManager.get('element', this);
          var elementService = serviceManager.getService('element');
          var canvas = element && elementService.isCanvas(element) ? element : elementService.createCanvas();
          var image = element && elementService.isImage(element) ? element : elementService.createImage();
      
          this._canvasRenderer = new CanvasRenderer_1(this, canvas, true);
          this._imageRenderer = new ImageRenderer_1(this, image, image === element);
      
          this.update();
        }, {
      
          /**
           * Returns all of the options configured for this {@link QRious}.
           *
           * Any changes made to the returned object will not be reflected in the options themselves or their corresponding
           * underlying fields.
           *
           * @return {Object.<string, *>} A copy of the applied options.
           * @public
           * @memberof QRious#
           */
          get: function() {
            return optionManager.getAll(this);
          },
      
          /**
           * Sets all of the specified <code>options</code> and automatically updates this {@link QRious} if any of the
           * underlying fields are changed as a result.
           *
           * This is the preferred method for updating multiple options at one time to avoid unnecessary updates between
           * changes.
           *
           * @param {QRious~Options} options - the options to be set
           * @return {void}
           * @throws {Error} If any <code>options</code> are invalid or cannot be modified.
           * @public
           * @memberof QRious#
           */
          set: function(options) {
            if (optionManager.setAll(options, this)) {
              this.update();
            }
          },
      
          /**
           * Returns the image data URI for the generated QR code using the <code>mime</code> provided.
           *
           * @param {string} [mime] - the MIME type for the image
           * @return {string} The image data URI for the QR code.
           * @public
           * @memberof QRious#
           */
          toDataURL: function(mime) {
            return this.canvas.toDataURL(mime || this.mime);
          },
      
          /**
           * Updates this {@link QRious} by generating a new {@link Frame} and re-rendering the QR code.
           *
           * @return {void}
           * @protected
           * @memberof QRious#
           */
          update: function() {
            var frame = new Frame_1({
              level: this.level,
              value: this.value
            });
      
            this._canvasRenderer.render(frame);
            this._imageRenderer.render(frame);
          }
      
        }, {
      
          /**
           * Configures the <code>service</code> provided to be used by all {@link QRious} instances.
           *
           * @param {Service} service - the {@link Service} to be configured
           * @return {void}
           * @throws {Error} If a {@link Service} has already been configured with the same name.
           * @public
           * @static
           * @memberof QRious
           */
          use: function(service) {
            serviceManager.setService(service.getName(), service);
          }
      
        });
      
        Object.defineProperties(QRious.prototype, {
      
          canvas: {
            /**
             * Returns the <code>canvas</code> element being used to render the QR code for this {@link QRious}.
             *
             * @return {*} The <code>canvas</code> element.
             * @public
             * @memberof QRious#
             * @alias canvas
             */
            get: function() {
              return this._canvasRenderer.getElement();
            }
          },
      
          image: {
            /**
             * Returns the <code>img</code> element being used to render the QR code for this {@link QRious}.
             *
             * @return {*} The <code>img</code> element.
             * @public
             * @memberof QRious#
             * @alias image
             */
            get: function() {
              return this._imageRenderer.getElement();
            }
          }
      
        });
      
        var QRious_1$2 = QRious;
      
        /**
         * The options used by {@link QRious}.
         *
         * @typedef {Object} QRious~Options
         * @property {string} [background="white"] - The background color to be applied to the QR code.
         * @property {number} [backgroundAlpha=1] - The background alpha to be applied to the QR code.
         * @property {*} [element] - The element to be used to render the QR code which may either be an <code>canvas</code> or
         * <code>img</code>. The element(s) will be created if needed.
         * @property {string} [foreground="black"] - The foreground color to be applied to the QR code.
         * @property {number} [foregroundAlpha=1] - The foreground alpha to be applied to the QR code.
         * @property {string} [level="L"] - The error correction level to be applied to the QR code.
         * @property {string} [mime="image/png"] - The MIME type to be used to render the image for the QR code.
         * @property {number} [padding] - The padding for the QR code in pixels.
         * @property {number} [size=100] - The size of the QR code in pixels.
         * @property {string} [value=""] - The value to be encoded within the QR code.
         */
      
        var index = QRious_1$2;
      
        /**
         * Defines a service contract that must be met by all implementations.
         *
         * @public
         * @class
         * @extends Nevis
         */
        var Service = lite.extend({
      
          /**
           * Returns the name of this {@link Service}.
           *
           * @return {string} The service name.
           * @public
           * @abstract
           * @memberof Service#
           */
          getName: function() {}
      
        });
      
        var Service_1 = Service;
      
        /**
         * A service for working with elements.
         *
         * @public
         * @class
         * @extends Service
         */
        var ElementService = Service_1.extend({
      
          /**
           * Creates an instance of a canvas element.
           *
           * Implementations of {@link ElementService} <b>must</b> override this method with their own specific logic.
           *
           * @return {*} The newly created canvas element.
           * @public
           * @abstract
           * @memberof ElementService#
           */
          createCanvas: function() {},
      
          /**
           * Creates an instance of a image element.
           *
           * Implementations of {@link ElementService} <b>must</b> override this method with their own specific logic.
           *
           * @return {*} The newly created image element.
           * @public
           * @abstract
           * @memberof ElementService#
           */
          createImage: function() {},
      
          /**
           * @override
           */
          getName: function() {
            return 'element';
          },
      
          /**
           * Returns whether the specified <code>element</code> is a canvas.
           *
           * Implementations of {@link ElementService} <b>must</b> override this method with their own specific logic.
           *
           * @param {*} element - the element to be checked
           * @return {boolean} <code>true</code> if <code>element</code> is a canvas; otherwise <code>false</code>.
           * @public
           * @abstract
           * @memberof ElementService#
           */
          isCanvas: function(element) {},
      
          /**
           * Returns whether the specified <code>element</code> is an image.
           *
           * Implementations of {@link ElementService} <b>must</b> override this method with their own specific logic.
           *
           * @param {*} element - the element to be checked
           * @return {boolean} <code>true</code> if <code>element</code> is an image; otherwise <code>false</code>.
           * @public
           * @abstract
           * @memberof ElementService#
           */
          isImage: function(element) {}
      
        });
      
        var ElementService_1 = ElementService;
      
        /**
         * An implementation of {@link ElementService} intended for use within a browser environment.
         *
         * @public
         * @class
         * @extends ElementService
         */
        var BrowserElementService = ElementService_1.extend({
      
          /**
           * @override
           */
          createCanvas: function() {
            return document.createElement('canvas');
          },
      
          /**
           * @override
           */
          createImage: function() {
            return document.createElement('img');
          },
      
          /**
           * @override
           */
          isCanvas: function(element) {
            return element instanceof HTMLCanvasElement;
          },
      
          /**
           * @override
           */
          isImage: function(element) {
            return element instanceof HTMLImageElement;
          }
      
        });
      
        var BrowserElementService_1 = BrowserElementService;
      
        index.use(new BrowserElementService_1());
      
        var QRious_1 = index;
      
        return QRious_1;
      
      })));
    });

    /* node_modules/svelte-qrcode/src/lib/index.svelte generated by Svelte v3.35.0 */
    const file$2 = "node_modules/svelte-qrcode/src/lib/index.svelte";

    function create_fragment$2(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = /*image*/ ctx[2])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", /*value*/ ctx[0]);
    			attr_dev(img, "class", /*className*/ ctx[1]);
    			add_location(img, file$2, 41, 0, 681);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*image*/ 4 && img.src !== (img_src_value = /*image*/ ctx[2])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*value*/ 1) {
    				attr_dev(img, "alt", /*value*/ ctx[0]);
    			}

    			if (dirty & /*className*/ 2) {
    				attr_dev(img, "class", /*className*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Lib", slots, []);
    	const QRcode = new qrcode();
    	let { errorCorrection = "L" } = $$props;
    	let { background = "#fff" } = $$props;
    	let { color = "#000" } = $$props;
    	let { size = "200" } = $$props;
    	let { value = "" } = $$props;
    	let { padding = 0 } = $$props;
    	let { className = "qrcode" } = $$props;
    	let image = "";

    	function generateQrCode() {
    		QRcode.set({
    			background,
    			foreground: color,
    			level: errorCorrection,
    			padding,
    			size,
    			value
    		});

    		$$invalidate(2, image = QRcode.toDataURL("image/jpeg"));
    	}

    	onMount(() => {
    		generateQrCode();
    	});

    	const writable_props = [
    		"errorCorrection",
    		"background",
    		"color",
    		"size",
    		"value",
    		"padding",
    		"className"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Lib> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("errorCorrection" in $$props) $$invalidate(3, errorCorrection = $$props.errorCorrection);
    		if ("background" in $$props) $$invalidate(4, background = $$props.background);
    		if ("color" in $$props) $$invalidate(5, color = $$props.color);
    		if ("size" in $$props) $$invalidate(6, size = $$props.size);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("padding" in $$props) $$invalidate(7, padding = $$props.padding);
    		if ("className" in $$props) $$invalidate(1, className = $$props.className);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		QrCode: qrcode,
    		QRcode,
    		errorCorrection,
    		background,
    		color,
    		size,
    		value,
    		padding,
    		className,
    		image,
    		generateQrCode
    	});

    	$$self.$inject_state = $$props => {
    		if ("errorCorrection" in $$props) $$invalidate(3, errorCorrection = $$props.errorCorrection);
    		if ("background" in $$props) $$invalidate(4, background = $$props.background);
    		if ("color" in $$props) $$invalidate(5, color = $$props.color);
    		if ("size" in $$props) $$invalidate(6, size = $$props.size);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("padding" in $$props) $$invalidate(7, padding = $$props.padding);
    		if ("className" in $$props) $$invalidate(1, className = $$props.className);
    		if ("image" in $$props) $$invalidate(2, image = $$props.image);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*value*/ 1) {
    			{
    				if (value) {
    					generateQrCode();
    				}
    			}
    		}
    	};

    	return [value, className, image, errorCorrection, background, color, size, padding];
    }

    class Lib extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			errorCorrection: 3,
    			background: 4,
    			color: 5,
    			size: 6,
    			value: 0,
    			padding: 7,
    			className: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Lib",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get errorCorrection() {
    		throw new Error("<Lib>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set errorCorrection(value) {
    		throw new Error("<Lib>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get background() {
    		throw new Error("<Lib>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set background(value) {
    		throw new Error("<Lib>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Lib>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Lib>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Lib>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Lib>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Lib>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Lib>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get padding() {
    		throw new Error("<Lib>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set padding(value) {
    		throw new Error("<Lib>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get className() {
    		throw new Error("<Lib>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set className(value) {
    		throw new Error("<Lib>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/UX_qr.svelte generated by Svelte v3.35.0 */
    const file$1 = "src/UX_qr.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    // (47:12) {#each languages as item}
    function create_each_block_1$1(ctx) {
    	let option;
    	let t0_value = /*item*/ ctx[13].name + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = /*item*/ ctx[13];
    			option.value = option.__value;
    			add_location(option, file$1, 47, 16, 1797);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(47:12) {#each languages as item}",
    		ctx
    	});

    	return block;
    }

    // (56:12) {#each brands as item}
    function create_each_block$1(ctx) {
    	let option;
    	let t0_value = /*item*/ ctx[13].name + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = /*item*/ ctx[13];
    			option.value = option.__value;
    			add_location(option, file$1, 56, 16, 2071);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(56:12) {#each brands as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div2;
    	let div0;
    	let h50;
    	let t1;
    	let p0;
    	let t3;
    	let label;
    	let svg;
    	let rect;
    	let line0;
    	let line1;
    	let t4;
    	let t5;
    	let p1;
    	let t7;
    	let select0;
    	let t8;
    	let p2;
    	let t10;
    	let select1;
    	let t11;
    	let div1;
    	let h51;
    	let t13;
    	let qrcode;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*languages*/ ctx[4];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	let each_value = /*brands*/ ctx[5];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	qrcode = new Lib({
    			props: { value: /*value*/ ctx[3] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			h50 = element("h5");
    			h50.textContent = "Settings";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "View mode";
    			t3 = space();
    			label = element("label");
    			svg = svg_element("svg");
    			rect = svg_element("rect");
    			line0 = svg_element("line");
    			line1 = svg_element("line");
    			t4 = text("\n            Show as a single page");
    			t5 = space();
    			p1 = element("p");
    			p1.textContent = "Language";
    			t7 = space();
    			select0 = element("select");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t8 = space();
    			p2 = element("p");
    			p2.textContent = "Brand";
    			t10 = space();
    			select1 = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t11 = space();
    			div1 = element("div");
    			h51 = element("h5");
    			h51.textContent = "QR";
    			t13 = space();
    			create_component(qrcode.$$.fragment);
    			add_location(h50, file$1, 31, 8, 950);
    			attr_dev(p0, "class", "clue svelte-1fuol1a");
    			add_location(p0, file$1, 33, 8, 977);
    			attr_dev(rect, "x", "1");
    			attr_dev(rect, "y", "1");
    			attr_dev(rect, "width", "24");
    			attr_dev(rect, "height", "24");
    			attr_dev(rect, "rx", "4");
    			attr_dev(rect, "class", "svelte-1fuol1a");
    			add_location(rect, file$1, 37, 16, 1385);
    			attr_dev(line0, "x1", "21");
    			attr_dev(line0, "y1", "8");
    			attr_dev(line0, "x2", "11");
    			attr_dev(line0, "y2", "18");
    			attr_dev(line0, "class", "svelte-1fuol1a");
    			add_location(line0, file$1, 38, 16, 1457);
    			attr_dev(line1, "x1", "6");
    			attr_dev(line1, "y1", "13");
    			attr_dev(line1, "x2", "11");
    			attr_dev(line1, "y2", "18");
    			attr_dev(line1, "class", "svelte-1fuol1a");
    			add_location(line1, file$1, 39, 16, 1518);
    			attr_dev(svg, "class", "checkbox svelte-1fuol1a");
    			attr_dev(svg, "width", "26px");
    			attr_dev(svg, "height", "26px");
    			attr_dev(svg, "viewBox", "0 0 26 26");
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "stroke-width", "2");
    			attr_dev(svg, "stroke-linecap", "round");
    			set_style(svg, "vertical-align", "middle");
    			toggle_class(svg, "checked", /*single_page*/ ctx[0]);
    			add_location(svg, file$1, 36, 12, 1152);
    			add_location(label, file$1, 35, 8, 1080);
    			attr_dev(p1, "class", "clue svelte-1fuol1a");
    			add_location(p1, file$1, 44, 8, 1642);
    			attr_dev(select0, "id", "lang");
    			attr_dev(select0, "class", "form-control svelte-1fuol1a");
    			if (/*language*/ ctx[1] === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[10].call(select0));
    			add_location(select0, file$1, 45, 8, 1679);
    			attr_dev(p2, "class", "clue svelte-1fuol1a");
    			add_location(p2, file$1, 53, 8, 1924);
    			attr_dev(select1, "id", "brand");
    			attr_dev(select1, "class", "form-control svelte-1fuol1a");
    			if (/*brand*/ ctx[2] === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[11].call(select1));
    			add_location(select1, file$1, 54, 8, 1958);
    			attr_dev(div0, "class", "col");
    			add_location(div0, file$1, 30, 4, 924);
    			add_location(h51, file$1, 64, 8, 2231);
    			attr_dev(div1, "class", "col");
    			add_location(div1, file$1, 63, 4, 2205);
    			attr_dev(div2, "class", "row");
    			add_location(div2, file$1, 29, 0, 902);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, h50);
    			append_dev(div0, t1);
    			append_dev(div0, p0);
    			append_dev(div0, t3);
    			append_dev(div0, label);
    			append_dev(label, svg);
    			append_dev(svg, rect);
    			append_dev(svg, line0);
    			append_dev(svg, line1);
    			append_dev(label, t4);
    			append_dev(div0, t5);
    			append_dev(div0, p1);
    			append_dev(div0, t7);
    			append_dev(div0, select0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(select0, null);
    			}

    			select_option(select0, /*language*/ ctx[1]);
    			append_dev(div0, t8);
    			append_dev(div0, p2);
    			append_dev(div0, t10);
    			append_dev(div0, select1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select1, null);
    			}

    			select_option(select1, /*brand*/ ctx[2]);
    			append_dev(div2, t11);
    			append_dev(div2, div1);
    			append_dev(div1, h51);
    			append_dev(div1, t13);
    			mount_component(qrcode, div1, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(label, "click", /*click_handler*/ ctx[9], false, false, false),
    					listen_dev(select0, "change", /*select0_change_handler*/ ctx[10]),
    					listen_dev(select1, "change", /*select1_change_handler*/ ctx[11])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*single_page*/ 1) {
    				toggle_class(svg, "checked", /*single_page*/ ctx[0]);
    			}

    			if (dirty & /*languages*/ 16) {
    				each_value_1 = /*languages*/ ctx[4];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(select0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*language, languages*/ 18) {
    				select_option(select0, /*language*/ ctx[1]);
    			}

    			if (dirty & /*brands*/ 32) {
    				each_value = /*brands*/ ctx[5];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*brand, brands*/ 36) {
    				select_option(select1, /*brand*/ ctx[2]);
    			}

    			const qrcode_changes = {};
    			if (dirty & /*value*/ 8) qrcode_changes.value = /*value*/ ctx[3];
    			qrcode.$set(qrcode_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(qrcode.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(qrcode.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			destroy_component(qrcode);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let singlepage_param;
    	let language_param;
    	let brand_param;
    	let value;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("UX_qr", slots, []);
    	let base_url = "https://ecoonline.github.io/ux/public/rapid.html?src=uxdemo";
    	let single_page = true;

    	let languages = [
    		{ "code": "en", "name": "English" },
    		{ "code": "no", "name": "Norwegian" },
    		{ "code": "fi", "name": "Finnish" }
    	];

    	let language = languages[0];

    	let brands = [
    		{ "code": "no_brand", "name": "No Brand" },
    		{
    			"code": "mercedes",
    			"name": "Mercedes Benz"
    		},
    		{ "code": "metsa", "name": "Metsa" },
    		{ "code": "viridor", "name": "Viridor" },
    		{ "code": "fcc", "name": "FCC" }
    	];

    	let brand = brands[0];
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<UX_qr> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		$$invalidate(0, single_page = !single_page);
    	};

    	function select0_change_handler() {
    		language = select_value(this);
    		$$invalidate(1, language);
    		$$invalidate(4, languages);
    	}

    	function select1_change_handler() {
    		brand = select_value(this);
    		$$invalidate(2, brand);
    		$$invalidate(5, brands);
    	}

    	$$self.$capture_state = () => ({
    		QrCode: Lib,
    		base_url,
    		single_page,
    		languages,
    		language,
    		brands,
    		brand,
    		singlepage_param,
    		language_param,
    		brand_param,
    		value
    	});

    	$$self.$inject_state = $$props => {
    		if ("base_url" in $$props) $$invalidate(12, base_url = $$props.base_url);
    		if ("single_page" in $$props) $$invalidate(0, single_page = $$props.single_page);
    		if ("languages" in $$props) $$invalidate(4, languages = $$props.languages);
    		if ("language" in $$props) $$invalidate(1, language = $$props.language);
    		if ("brands" in $$props) $$invalidate(5, brands = $$props.brands);
    		if ("brand" in $$props) $$invalidate(2, brand = $$props.brand);
    		if ("singlepage_param" in $$props) $$invalidate(6, singlepage_param = $$props.singlepage_param);
    		if ("language_param" in $$props) $$invalidate(7, language_param = $$props.language_param);
    		if ("brand_param" in $$props) $$invalidate(8, brand_param = $$props.brand_param);
    		if ("value" in $$props) $$invalidate(3, value = $$props.value);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*single_page*/ 1) {
    			$$invalidate(6, singlepage_param = single_page ? "&singlepage=1" : "");
    		}

    		if ($$self.$$.dirty & /*language*/ 2) {
    			$$invalidate(7, language_param = "&lang=" + language.code);
    		}

    		if ($$self.$$.dirty & /*brand*/ 4) {
    			$$invalidate(8, brand_param = "&b_code=" + encodeURI(brand.code));
    		}

    		if ($$self.$$.dirty & /*singlepage_param, language_param, brand_param*/ 448) {
    			$$invalidate(3, value = base_url + singlepage_param + language_param + brand_param);
    		}
    	};

    	return [
    		single_page,
    		language,
    		brand,
    		value,
    		languages,
    		brands,
    		singlepage_param,
    		language_param,
    		brand_param,
    		click_handler,
    		select0_change_handler,
    		select1_change_handler
    	];
    }

    class UX_qr extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "UX_qr",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/UX.svelte generated by Svelte v3.35.0 */

    const { window: window_1 } = globals;
    const file = "src/UX.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	child_ctx[17] = i;
    	return child_ctx;
    }

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	child_ctx[17] = i;
    	return child_ctx;
    }

    // (123:1) {#if slide == 0}
    function create_if_block_21(ctx) {
    	let div;
    	let h1;
    	let t1;
    	let h3;
    	let t3;
    	let h4;
    	let t4;
    	let t5_value = (/*co*/ ctx[1] ? /*co*/ ctx[1] : "you") + "";
    	let t5;
    	let t6;
    	let div_intro;
    	let div_outro;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "UX";
    			t1 = space();
    			h3 = element("h3");
    			h3.textContent = "EcoOnline Incidents Project";
    			t3 = space();
    			h4 = element("h4");
    			t4 = text("(AKA here's how I could help ");
    			t5 = text(t5_value);
    			t6 = text(")");
    			attr_dev(h1, "class", "svelte-mltcig");
    			add_location(h1, file, 124, 12, 4125);
    			attr_dev(h3, "class", "svelte-mltcig");
    			add_location(h3, file, 125, 12, 4149);
    			attr_dev(h4, "class", "tip svelte-mltcig");
    			add_location(h4, file, 126, 12, 4198);
    			attr_dev(div, "class", "screen title svelte-mltcig");
    			add_location(div, file, 123, 8, 4040);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(div, t1);
    			append_dev(div, h3);
    			append_dev(div, t3);
    			append_dev(div, h4);
    			append_dev(h4, t4);
    			append_dev(h4, t5);
    			append_dev(h4, t6);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty & /*co*/ 2) && t5_value !== (t5_value = (/*co*/ ctx[1] ? /*co*/ ctx[1] : "you") + "")) set_data_dev(t5, t5_value);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, fly, { x: /*wx*/ ctx[2], duration: 1000 });
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_21.name,
    		type: "if",
    		source: "(123:1) {#if slide == 0}",
    		ctx
    	});

    	return block;
    }

    // (131:4) {#if slide == 1}
    function create_if_block_20(ctx) {
    	let div;
    	let h2;
    	let t1;
    	let h40;
    	let b0;
    	let t3;
    	let t4;
    	let h41;
    	let b1;
    	let t6;
    	let t7;
    	let h42;
    	let b2;
    	let t9;
    	let h43;
    	let t11;
    	let h44;
    	let div_intro;
    	let div_outro;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = "Incidents Project:";
    			t1 = space();
    			h40 = element("h4");
    			b0 = element("b");
    			b0.textContent = "Client:";
    			t3 = text(" EcoOnline Health & Safety Application");
    			t4 = space();
    			h41 = element("h4");
    			b1 = element("b");
    			b1.textContent = "My role:";
    			t6 = text(" Lead Designer");
    			t7 = space();
    			h42 = element("h4");
    			b2 = element("b");
    			b2.textContent = "Worked with:";
    			t9 = space();
    			h43 = element("h4");
    			h43.textContent = "— Aneta Kmiecik (Lead Researcher)";
    			t11 = space();
    			h44 = element("h4");
    			h44.textContent = "— Ran workshops with 3 other designers";
    			attr_dev(h2, "class", "svelte-mltcig");
    			add_location(h2, file, 132, 12, 4401);
    			attr_dev(b0, "class", "svelte-mltcig");
    			add_location(b0, file, 133, 16, 4445);
    			attr_dev(h40, "class", "svelte-mltcig");
    			add_location(h40, file, 133, 12, 4441);
    			attr_dev(b1, "class", "svelte-mltcig");
    			add_location(b1, file, 134, 16, 4519);
    			attr_dev(h41, "class", "svelte-mltcig");
    			add_location(h41, file, 134, 12, 4515);
    			attr_dev(b2, "class", "svelte-mltcig");
    			add_location(b2, file, 135, 16, 4570);
    			attr_dev(h42, "class", "svelte-mltcig");
    			add_location(h42, file, 135, 12, 4566);
    			attr_dev(h43, "class", "svelte-mltcig");
    			add_location(h43, file, 136, 12, 4607);
    			attr_dev(h44, "class", "svelte-mltcig");
    			add_location(h44, file, 137, 12, 4668);
    			attr_dev(div, "class", "screen svelte-mltcig");
    			add_location(div, file, 131, 8, 4322);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(div, t1);
    			append_dev(div, h40);
    			append_dev(h40, b0);
    			append_dev(h40, t3);
    			append_dev(div, t4);
    			append_dev(div, h41);
    			append_dev(h41, b1);
    			append_dev(h41, t6);
    			append_dev(div, t7);
    			append_dev(div, h42);
    			append_dev(h42, b2);
    			append_dev(div, t9);
    			append_dev(div, h43);
    			append_dev(div, t11);
    			append_dev(div, h44);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, fly, { x: /*wx*/ ctx[2], duration: 1000 });
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_20.name,
    		type: "if",
    		source: "(131:4) {#if slide == 1}",
    		ctx
    	});

    	return block;
    }

    // (141:4) {#if slide == 2}
    function create_if_block_19(ctx) {
    	let div;
    	let h2;
    	let t1;
    	let h40;
    	let t3;
    	let h41;
    	let t5;
    	let h42;
    	let t7;
    	let h43;
    	let div_intro;
    	let div_outro;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = "Business Context:";
    			t1 = space();
    			h40 = element("h4");
    			h40.textContent = "EcoOnline is the amalgamation of nearly a dozen companies.";
    			t3 = space();
    			h41 = element("h4");
    			h41.textContent = "It had recently gone through a rebrand so all products are in the long slow process of UI refresh with an evolving design system.";
    			t5 = space();
    			h42 = element("h4");
    			h42.textContent = "The Incidents Project was the first true full UX project from discovery & research to ideation and testing for a company accustomed to feature-driven development.";
    			t7 = space();
    			h43 = element("h4");
    			h43.textContent = "(Imagine how amazing a product could be doing great UX from the beginning)";
    			attr_dev(h2, "class", "svelte-mltcig");
    			add_location(h2, file, 142, 12, 4855);
    			attr_dev(h40, "class", "svelte-mltcig");
    			add_location(h40, file, 143, 12, 4894);
    			attr_dev(h41, "class", "svelte-mltcig");
    			add_location(h41, file, 144, 12, 4974);
    			attr_dev(h42, "class", "svelte-mltcig");
    			add_location(h42, file, 145, 12, 5125);
    			attr_dev(h43, "class", "tip svelte-mltcig");
    			add_location(h43, file, 146, 12, 5309);
    			attr_dev(div, "class", "screen svelte-mltcig");
    			add_location(div, file, 141, 8, 4776);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(div, t1);
    			append_dev(div, h40);
    			append_dev(div, t3);
    			append_dev(div, h41);
    			append_dev(div, t5);
    			append_dev(div, h42);
    			append_dev(div, t7);
    			append_dev(div, h43);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, fly, { x: /*wx*/ ctx[2], duration: 1000 });
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_19.name,
    		type: "if",
    		source: "(141:4) {#if slide == 2}",
    		ctx
    	});

    	return block;
    }

    // (151:4) {#if slide == 3}
    function create_if_block_18(ctx) {
    	let div;
    	let h2;
    	let t1;
    	let h40;
    	let t3;
    	let h41;
    	let t4;
    	let i;
    	let t6;
    	let t7;
    	let h42;
    	let t9;
    	let h43;
    	let b;
    	let t11;
    	let t12;
    	let h44;
    	let div_intro;
    	let div_outro;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = "Product Context:";
    			t1 = space();
    			h40 = element("h4");
    			h40.textContent = "The EcoOnline Incident Reporting module is how to report workplace incidents and accidents.";
    			t3 = space();
    			h41 = element("h4");
    			t4 = text("It is by ");
    			i = element("i");
    			i.textContent = "far";
    			t6 = text(" the most used of the EcoOnline Suite of modules (65%).");
    			t7 = space();
    			h42 = element("h4");
    			h42.textContent = "It's dynamic, no two clients are set up the same.";
    			t9 = space();
    			h43 = element("h4");
    			b = element("b");
    			b.textContent = "Reporting levels were actually dropping";
    			t11 = text(" as existing clients migrated.");
    			t12 = space();
    			h44 = element("h4");
    			h44.textContent = "(Hard problems are fun)";
    			attr_dev(h2, "class", "svelte-mltcig");
    			add_location(h2, file, 152, 12, 5539);
    			attr_dev(h40, "class", "svelte-mltcig");
    			add_location(h40, file, 153, 12, 5577);
    			add_location(i, file, 154, 25, 5703);
    			attr_dev(h41, "class", "svelte-mltcig");
    			add_location(h41, file, 154, 12, 5690);
    			attr_dev(h42, "class", "svelte-mltcig");
    			add_location(h42, file, 155, 12, 5786);
    			attr_dev(b, "class", "svelte-mltcig");
    			add_location(b, file, 156, 16, 5861);
    			attr_dev(h43, "class", "svelte-mltcig");
    			add_location(h43, file, 156, 12, 5857);
    			attr_dev(h44, "class", "tip svelte-mltcig");
    			add_location(h44, file, 157, 12, 5955);
    			attr_dev(div, "class", "screen svelte-mltcig");
    			add_location(div, file, 151, 8, 5460);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(div, t1);
    			append_dev(div, h40);
    			append_dev(div, t3);
    			append_dev(div, h41);
    			append_dev(h41, t4);
    			append_dev(h41, i);
    			append_dev(h41, t6);
    			append_dev(div, t7);
    			append_dev(div, h42);
    			append_dev(div, t9);
    			append_dev(div, h43);
    			append_dev(h43, b);
    			append_dev(h43, t11);
    			append_dev(div, t12);
    			append_dev(div, h44);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, fly, { x: /*wx*/ ctx[2], duration: 1000 });
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_18.name,
    		type: "if",
    		source: "(151:4) {#if slide == 3}",
    		ctx
    	});

    	return block;
    }

    // (162:4) {#if slide == 4}
    function create_if_block_17(ctx) {
    	let div;
    	let p;
    	let t1;
    	let h1;
    	let t3;
    	let h4;
    	let div_intro;
    	let div_outro;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			p.textContent = "General internal opinion:";
    			t1 = space();
    			h1 = element("h1");
    			h1.textContent = "“The module is great, it only needs a few changes”";
    			t3 = space();
    			h4 = element("h4");
    			h4.textContent = "Narrator: “It wasn’t and it didn’t”";
    			attr_dev(p, "class", "svelte-mltcig");
    			add_location(p, file, 163, 12, 6141);
    			attr_dev(h1, "class", "svelte-mltcig");
    			add_location(h1, file, 164, 12, 6186);
    			attr_dev(h4, "class", "svelte-mltcig");
    			add_location(h4, file, 165, 12, 6258);
    			attr_dev(div, "class", "screen marker svelte-mltcig");
    			add_location(div, file, 162, 8, 6055);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(div, t1);
    			append_dev(div, h1);
    			append_dev(div, t3);
    			append_dev(div, h4);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, fly, { x: /*wx*/ ctx[2], duration: 1000 });
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_17.name,
    		type: "if",
    		source: "(162:4) {#if slide == 4}",
    		ctx
    	});

    	return block;
    }

    // (169:4) {#if slide == 5}
    function create_if_block_16(ctx) {
    	let div;
    	let h2;
    	let t1;
    	let h40;
    	let b0;
    	let t3;
    	let t4;
    	let h41;
    	let b1;
    	let t6;
    	let t7;
    	let h42;
    	let b2;
    	let t9;
    	let t10;
    	let h43;
    	let t12;
    	let h44;
    	let t14;
    	let h45;
    	let t16;
    	let h46;
    	let t18;
    	let h47;
    	let t19;
    	let i;
    	let t21;
    	let b3;
    	let t23;
    	let div_intro;
    	let div_outro;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = "Discovery & Research:";
    			t1 = space();
    			h40 = element("h4");
    			b0 = element("b");
    			b0.textContent = "Interviews:";
    			t3 = text(" 10+ hours");
    			t4 = space();
    			h41 = element("h4");
    			b1 = element("b");
    			b1.textContent = "Survey:";
    			t6 = text(" 180 Responses");
    			t7 = space();
    			h42 = element("h4");
    			b2 = element("b");
    			b2.textContent = "Key findings:";
    			t9 = text(" (There were dozens more)");
    			t10 = space();
    			h43 = element("h4");
    			h43.textContent = "— End users were not using the report fully (config)";
    			t12 = space();
    			h44 = element("h4");
    			h44.textContent = "— Reporting was too complex (drop-off in submissions)";
    			t14 = space();
    			h45 = element("h4");
    			h45.textContent = "— Photos were underused as a source of evidence";
    			t16 = space();
    			h46 = element("h4");
    			h46.textContent = "— Big difference between safety manager and end users";
    			t18 = space();
    			h47 = element("h4");
    			t19 = text("(");
    			i = element("i");
    			i.textContent = "Really";
    			t21 = text(" grokking a problem is ");
    			b3 = element("b");
    			b3.textContent = "important";
    			t23 = text(")");
    			attr_dev(h2, "class", "svelte-mltcig");
    			add_location(h2, file, 170, 12, 6436);
    			attr_dev(b0, "class", "svelte-mltcig");
    			add_location(b0, file, 171, 16, 6483);
    			attr_dev(h40, "class", "svelte-mltcig");
    			add_location(h40, file, 171, 12, 6479);
    			attr_dev(b1, "class", "svelte-mltcig");
    			add_location(b1, file, 172, 16, 6533);
    			attr_dev(h41, "class", "svelte-mltcig");
    			add_location(h41, file, 172, 12, 6529);
    			attr_dev(b2, "class", "svelte-mltcig");
    			add_location(b2, file, 173, 16, 6583);
    			attr_dev(h42, "class", "svelte-mltcig");
    			add_location(h42, file, 173, 12, 6579);
    			attr_dev(h43, "class", "svelte-mltcig");
    			add_location(h43, file, 174, 12, 6646);
    			attr_dev(h44, "class", "svelte-mltcig");
    			add_location(h44, file, 175, 12, 6726);
    			attr_dev(h45, "class", "svelte-mltcig");
    			add_location(h45, file, 176, 12, 6807);
    			attr_dev(h46, "class", "svelte-mltcig");
    			add_location(h46, file, 177, 12, 6882);
    			add_location(i, file, 178, 29, 6980);
    			attr_dev(b3, "class", "svelte-mltcig");
    			add_location(b3, file, 178, 65, 7016);
    			attr_dev(h47, "class", "tip svelte-mltcig");
    			add_location(h47, file, 178, 12, 6963);
    			attr_dev(div, "class", "screen svelte-mltcig");
    			add_location(div, file, 169, 8, 6357);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(div, t1);
    			append_dev(div, h40);
    			append_dev(h40, b0);
    			append_dev(h40, t3);
    			append_dev(div, t4);
    			append_dev(div, h41);
    			append_dev(h41, b1);
    			append_dev(h41, t6);
    			append_dev(div, t7);
    			append_dev(div, h42);
    			append_dev(h42, b2);
    			append_dev(h42, t9);
    			append_dev(div, t10);
    			append_dev(div, h43);
    			append_dev(div, t12);
    			append_dev(div, h44);
    			append_dev(div, t14);
    			append_dev(div, h45);
    			append_dev(div, t16);
    			append_dev(div, h46);
    			append_dev(div, t18);
    			append_dev(div, h47);
    			append_dev(h47, t19);
    			append_dev(h47, i);
    			append_dev(h47, t21);
    			append_dev(h47, b3);
    			append_dev(h47, t23);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, fly, { x: /*wx*/ ctx[2], duration: 1000 });
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_16.name,
    		type: "if",
    		source: "(169:4) {#if slide == 5}",
    		ctx
    	});

    	return block;
    }

    // (183:4) {#if slide == 6}
    function create_if_block_15(ctx) {
    	let div1;
    	let h2;
    	let t1;
    	let div0;
    	let img;
    	let img_src_value;
    	let div1_intro;
    	let div1_outro;
    	let current;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Discovery & Research:";
    			t1 = space();
    			div0 = element("div");
    			img = element("img");
    			attr_dev(h2, "class", "svelte-mltcig");
    			add_location(h2, file, 184, 12, 7173);
    			if (img.src !== (img_src_value = "./images/ux/existing.png")) attr_dev(img, "src", img_src_value);
    			set_style(img, "margin", "0 auto");
    			attr_dev(img, "alt", "existing");
    			add_location(img, file, 186, 16, 7253);
    			attr_dev(div0, "class", "center svelte-mltcig");
    			add_location(div0, file, 185, 12, 7216);
    			attr_dev(div1, "class", "screen svelte-mltcig");
    			add_location(div1, file, 183, 8, 7094);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h2);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, img);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div1_outro) div1_outro.end(1);
    				if (!div1_intro) div1_intro = create_in_transition(div1, fly, { x: /*wx*/ ctx[2], duration: 1000 });
    				div1_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div1_intro) div1_intro.invalidate();
    			div1_outro = create_out_transition(div1, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (detaching && div1_outro) div1_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_15.name,
    		type: "if",
    		source: "(183:4) {#if slide == 6}",
    		ctx
    	});

    	return block;
    }

    // (192:4) {#if slide == 7}
    function create_if_block_14(ctx) {
    	let div4;
    	let h2;
    	let t1;
    	let div3;
    	let div0;
    	let h4;
    	let t3;
    	let p;
    	let t4;
    	let b0;
    	let t6;
    	let br;
    	let t7;
    	let b1;
    	let t9;
    	let t10;
    	let div1;
    	let ul0;
    	let li0;
    	let t12;
    	let li1;
    	let t14;
    	let li2;
    	let t16;
    	let li3;
    	let t18;
    	let li4;
    	let t20;
    	let li5;
    	let t22;
    	let li6;
    	let t24;
    	let li7;
    	let t26;
    	let li8;
    	let t28;
    	let li9;
    	let t30;
    	let li10;
    	let t32;
    	let li11;
    	let t34;
    	let li12;
    	let t36;
    	let li13;
    	let t38;
    	let li14;
    	let t40;
    	let li15;
    	let t42;
    	let li16;
    	let t44;
    	let div2;
    	let ul1;
    	let li17;
    	let t46;
    	let li18;
    	let t48;
    	let li19;
    	let t50;
    	let li20;
    	let t52;
    	let li21;
    	let t54;
    	let li22;
    	let t56;
    	let li23;
    	let t58;
    	let li24;
    	let t60;
    	let li25;
    	let t62;
    	let li26;
    	let t64;
    	let li27;
    	let t66;
    	let li28;
    	let t68;
    	let li29;
    	let t70;
    	let li30;
    	let t72;
    	let li31;
    	let t74;
    	let li32;
    	let t76;
    	let li33;
    	let div4_intro;
    	let div4_outro;
    	let current;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Ideation:";
    			t1 = space();
    			div3 = element("div");
    			div0 = element("div");
    			h4 = element("h4");
    			h4.textContent = "30+ ideas";
    			t3 = space();
    			p = element("p");
    			t4 = text("I developed ");
    			b0 = element("b");
    			b0.textContent = "high-fidelity";
    			t6 = text(" visual ideas");
    			br = element("br");
    			t7 = text(" for a ");
    			b1 = element("b");
    			b1.textContent = "multitude";
    			t9 = text(" of improvements");
    			t10 = space();
    			div1 = element("div");
    			ul0 = element("ul");
    			li0 = element("li");
    			li0.textContent = "ML prediction of a claim being made";
    			t12 = space();
    			li1 = element("li");
    			li1.textContent = "new menu";
    			t14 = space();
    			li2 = element("li");
    			li2.textContent = "single page view";
    			t16 = space();
    			li3 = element("li");
    			li3.textContent = "overview page";
    			t18 = space();
    			li4 = element("li");
    			li4.textContent = "submit checklist";
    			t20 = space();
    			li5 = element("li");
    			li5.textContent = "attachment quick links";
    			t22 = space();
    			li6 = element("li");
    			li6.textContent = "ML input shortcuts";
    			t24 = space();
    			li7 = element("li");
    			li7.textContent = "better pre-filling";
    			t26 = space();
    			li8 = element("li");
    			li8.textContent = "autosaving";
    			t28 = space();
    			li9 = element("li");
    			li9.textContent = "step through submission errors";
    			t30 = space();
    			li10 = element("li");
    			li10.textContent = "improved print options";
    			t32 = space();
    			li11 = element("li");
    			li11.textContent = "mobile first quick form";
    			t34 = space();
    			li12 = element("li");
    			li12.textContent = "personal info censorship";
    			t36 = space();
    			li13 = element("li");
    			li13.textContent = "email-to-attach";
    			t38 = space();
    			li14 = element("li");
    			li14.textContent = "inline tutorials";
    			t40 = space();
    			li15 = element("li");
    			li15.textContent = "CCTV playback";
    			t42 = space();
    			li16 = element("li");
    			li16.textContent = "“I don’t know”";
    			t44 = space();
    			div2 = element("div");
    			ul1 = element("ul");
    			li17 = element("li");
    			li17.textContent = "elapsed time and improved date suggestions";
    			t46 = space();
    			li18 = element("li");
    			li18.textContent = "form comments and subscription";
    			t48 = space();
    			li19 = element("li");
    			li19.textContent = "full-screen gallery view";
    			t50 = space();
    			li20 = element("li");
    			li20.textContent = "classified attachments";
    			t52 = space();
    			li21 = element("li");
    			li21.textContent = "time sensitive help";
    			t54 = space();
    			li22 = element("li");
    			li22.textContent = "reporting gamification";
    			t56 = space();
    			li23 = element("li");
    			li23.textContent = "safety year in review";
    			t58 = space();
    			li24 = element("li");
    			li24.textContent = "notification feedback loop";
    			t60 = space();
    			li25 = element("li");
    			li25.textContent = "dashboard";
    			t62 = space();
    			li26 = element("li");
    			li26.textContent = "risk matrix simplification";
    			t64 = space();
    			li27 = element("li");
    			li27.textContent = "action shortcuts";
    			t66 = space();
    			li28 = element("li");
    			li28.textContent = "progress tiles";
    			t68 = space();
    			li29 = element("li");
    			li29.textContent = "reporting plugin for other sites";
    			t70 = space();
    			li30 = element("li");
    			li30.textContent = "lock & sign witness statement";
    			t72 = space();
    			li31 = element("li");
    			li31.textContent = "inline signature";
    			t74 = space();
    			li32 = element("li");
    			li32.textContent = "User feedback for managers";
    			t76 = space();
    			li33 = element("li");
    			li33.textContent = "Voice input";
    			attr_dev(h2, "class", "svelte-mltcig");
    			add_location(h2, file, 193, 12, 7480);
    			attr_dev(h4, "class", "special svelte-mltcig");
    			add_location(h4, file, 196, 20, 7583);
    			add_location(b0, file, 197, 35, 7653);
    			add_location(br, file, 197, 68, 7686);
    			add_location(b1, file, 197, 79, 7697);
    			add_location(p, file, 197, 20, 7638);
    			attr_dev(div0, "class", "col");
    			add_location(div0, file, 195, 16, 7545);
    			attr_dev(li0, "class", "svelte-mltcig");
    			add_location(li0, file, 201, 24, 7840);
    			attr_dev(li1, "class", "hilight svelte-mltcig");
    			add_location(li1, file, 202, 24, 7909);
    			attr_dev(li2, "class", "svelte-mltcig");
    			add_location(li2, file, 203, 24, 7967);
    			attr_dev(li3, "class", "hilight svelte-mltcig");
    			add_location(li3, file, 204, 24, 8017);
    			attr_dev(li4, "class", "svelte-mltcig");
    			add_location(li4, file, 205, 24, 8080);
    			attr_dev(li5, "class", "svelte-mltcig");
    			add_location(li5, file, 206, 24, 8130);
    			attr_dev(li6, "class", "svelte-mltcig");
    			add_location(li6, file, 207, 24, 8186);
    			attr_dev(li7, "class", "svelte-mltcig");
    			add_location(li7, file, 208, 24, 8238);
    			attr_dev(li8, "class", "svelte-mltcig");
    			add_location(li8, file, 209, 24, 8290);
    			attr_dev(li9, "class", "svelte-mltcig");
    			add_location(li9, file, 210, 24, 8334);
    			attr_dev(li10, "class", "svelte-mltcig");
    			add_location(li10, file, 211, 24, 8398);
    			attr_dev(li11, "class", "hilight svelte-mltcig");
    			add_location(li11, file, 212, 24, 8454);
    			attr_dev(li12, "class", "svelte-mltcig");
    			add_location(li12, file, 213, 24, 8527);
    			attr_dev(li13, "class", "svelte-mltcig");
    			add_location(li13, file, 214, 24, 8585);
    			attr_dev(li14, "class", "svelte-mltcig");
    			add_location(li14, file, 215, 24, 8634);
    			attr_dev(li15, "class", "svelte-mltcig");
    			add_location(li15, file, 216, 24, 8684);
    			attr_dev(li16, "class", "svelte-mltcig");
    			add_location(li16, file, 217, 24, 8731);
    			attr_dev(ul0, "class", "svelte-mltcig");
    			add_location(ul0, file, 200, 20, 7811);
    			attr_dev(div1, "class", "col");
    			add_location(div1, file, 199, 16, 7773);
    			attr_dev(li17, "class", "svelte-mltcig");
    			add_location(li17, file, 222, 24, 8887);
    			attr_dev(li18, "class", "svelte-mltcig");
    			add_location(li18, file, 223, 24, 8963);
    			attr_dev(li19, "class", "svelte-mltcig");
    			add_location(li19, file, 224, 24, 9027);
    			attr_dev(li20, "class", "svelte-mltcig");
    			add_location(li20, file, 225, 24, 9085);
    			attr_dev(li21, "class", "svelte-mltcig");
    			add_location(li21, file, 226, 24, 9141);
    			attr_dev(li22, "class", "svelte-mltcig");
    			add_location(li22, file, 227, 24, 9194);
    			attr_dev(li23, "class", "svelte-mltcig");
    			add_location(li23, file, 228, 24, 9250);
    			attr_dev(li24, "class", "svelte-mltcig");
    			add_location(li24, file, 229, 24, 9305);
    			attr_dev(li25, "class", "hilight svelte-mltcig");
    			add_location(li25, file, 230, 24, 9365);
    			attr_dev(li26, "class", "svelte-mltcig");
    			add_location(li26, file, 231, 24, 9424);
    			attr_dev(li27, "class", "svelte-mltcig");
    			add_location(li27, file, 232, 24, 9484);
    			attr_dev(li28, "class", "svelte-mltcig");
    			add_location(li28, file, 233, 24, 9534);
    			attr_dev(li29, "class", "svelte-mltcig");
    			add_location(li29, file, 234, 24, 9582);
    			attr_dev(li30, "class", "svelte-mltcig");
    			add_location(li30, file, 235, 24, 9648);
    			attr_dev(li31, "class", "svelte-mltcig");
    			add_location(li31, file, 236, 24, 9711);
    			attr_dev(li32, "class", "svelte-mltcig");
    			add_location(li32, file, 237, 24, 9761);
    			attr_dev(li33, "class", "svelte-mltcig");
    			add_location(li33, file, 238, 24, 9821);
    			attr_dev(ul1, "class", "svelte-mltcig");
    			add_location(ul1, file, 221, 20, 8858);
    			attr_dev(div2, "class", "col");
    			add_location(div2, file, 220, 16, 8820);
    			attr_dev(div3, "class", "row");
    			add_location(div3, file, 194, 12, 7511);
    			attr_dev(div4, "class", "screen svelte-mltcig");
    			add_location(div4, file, 192, 8, 7401);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, h2);
    			append_dev(div4, t1);
    			append_dev(div4, div3);
    			append_dev(div3, div0);
    			append_dev(div0, h4);
    			append_dev(div0, t3);
    			append_dev(div0, p);
    			append_dev(p, t4);
    			append_dev(p, b0);
    			append_dev(p, t6);
    			append_dev(p, br);
    			append_dev(p, t7);
    			append_dev(p, b1);
    			append_dev(p, t9);
    			append_dev(div3, t10);
    			append_dev(div3, div1);
    			append_dev(div1, ul0);
    			append_dev(ul0, li0);
    			append_dev(ul0, t12);
    			append_dev(ul0, li1);
    			append_dev(ul0, t14);
    			append_dev(ul0, li2);
    			append_dev(ul0, t16);
    			append_dev(ul0, li3);
    			append_dev(ul0, t18);
    			append_dev(ul0, li4);
    			append_dev(ul0, t20);
    			append_dev(ul0, li5);
    			append_dev(ul0, t22);
    			append_dev(ul0, li6);
    			append_dev(ul0, t24);
    			append_dev(ul0, li7);
    			append_dev(ul0, t26);
    			append_dev(ul0, li8);
    			append_dev(ul0, t28);
    			append_dev(ul0, li9);
    			append_dev(ul0, t30);
    			append_dev(ul0, li10);
    			append_dev(ul0, t32);
    			append_dev(ul0, li11);
    			append_dev(ul0, t34);
    			append_dev(ul0, li12);
    			append_dev(ul0, t36);
    			append_dev(ul0, li13);
    			append_dev(ul0, t38);
    			append_dev(ul0, li14);
    			append_dev(ul0, t40);
    			append_dev(ul0, li15);
    			append_dev(ul0, t42);
    			append_dev(ul0, li16);
    			append_dev(div3, t44);
    			append_dev(div3, div2);
    			append_dev(div2, ul1);
    			append_dev(ul1, li17);
    			append_dev(ul1, t46);
    			append_dev(ul1, li18);
    			append_dev(ul1, t48);
    			append_dev(ul1, li19);
    			append_dev(ul1, t50);
    			append_dev(ul1, li20);
    			append_dev(ul1, t52);
    			append_dev(ul1, li21);
    			append_dev(ul1, t54);
    			append_dev(ul1, li22);
    			append_dev(ul1, t56);
    			append_dev(ul1, li23);
    			append_dev(ul1, t58);
    			append_dev(ul1, li24);
    			append_dev(ul1, t60);
    			append_dev(ul1, li25);
    			append_dev(ul1, t62);
    			append_dev(ul1, li26);
    			append_dev(ul1, t64);
    			append_dev(ul1, li27);
    			append_dev(ul1, t66);
    			append_dev(ul1, li28);
    			append_dev(ul1, t68);
    			append_dev(ul1, li29);
    			append_dev(ul1, t70);
    			append_dev(ul1, li30);
    			append_dev(ul1, t72);
    			append_dev(ul1, li31);
    			append_dev(ul1, t74);
    			append_dev(ul1, li32);
    			append_dev(ul1, t76);
    			append_dev(ul1, li33);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div4_outro) div4_outro.end(1);
    				if (!div4_intro) div4_intro = create_in_transition(div4, fly, { x: /*wx*/ ctx[2], duration: 1000 });
    				div4_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div4_intro) div4_intro.invalidate();
    			div4_outro = create_out_transition(div4, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if (detaching && div4_outro) div4_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_14.name,
    		type: "if",
    		source: "(192:4) {#if slide == 7}",
    		ctx
    	});

    	return block;
    }

    // (248:4) {#if slide == 8}
    function create_if_block_12(ctx) {
    	let div;
    	let h2;
    	let t1;
    	let div_intro;
    	let div_outro;
    	let current;

    	function select_block_type(ctx, dirty) {
    		if (/*sz*/ ctx[5] !== "xs") return create_if_block_13;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = "Ideation:";
    			t1 = space();
    			if_block.c();
    			attr_dev(h2, "class", "svelte-mltcig");
    			add_location(h2, file, 249, 12, 10054);
    			attr_dev(div, "class", "screen scatter svelte-mltcig");
    			add_location(div, file, 248, 8, 9967);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(div, t1);
    			if_block.m(div, null);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, fly, { x: /*wx*/ ctx[2], duration: 1000 });
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_12.name,
    		type: "if",
    		source: "(248:4) {#if slide == 8}",
    		ctx
    	});

    	return block;
    }

    // (255:12) {:else}
    function create_else_block(ctx) {
    	let div;
    	let each_value_1 = /*ideation*/ ctx[7];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "center svelte-mltcig");
    			add_location(div, file, 255, 16, 10320);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(255:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (251:12) {#if sz !== 'xs'}
    function create_if_block_13(ctx) {
    	let each_1_anchor;
    	let each_value = /*ideation*/ ctx[7];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*ideation, sz*/ 160) {
    				each_value = /*ideation*/ ctx[7];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_13.name,
    		type: "if",
    		source: "(251:12) {#if sz !== 'xs'}",
    		ctx
    	});

    	return block;
    }

    // (257:20) {#each ideation as idea, i}
    function create_each_block_1(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "class", "mob svelte-mltcig");
    			attr_dev(img, "alt", "id-" + /*i*/ ctx[17]);
    			if (img.src !== (img_src_value = "./images/ux/id" + /*i*/ ctx[17] + ".png")) attr_dev(img, "src", img_src_value);
    			add_location(img, file, 257, 24, 10413);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(257:20) {#each ideation as idea, i}",
    		ctx
    	});

    	return block;
    }

    // (252:16) {#each ideation as idea, i}
    function create_each_block(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "alt", "id-" + /*i*/ ctx[17]);
    			if (img.src !== (img_src_value = "./images/ux/id" + /*i*/ ctx[17] + ".png")) attr_dev(img, "src", img_src_value);
    			set_style(img, "left", /*idea*/ ctx[15][/*sz*/ ctx[5]].x + "%");
    			set_style(img, "top", /*idea*/ ctx[15][/*sz*/ ctx[5]].y + "%");
    			attr_dev(img, "class", "svelte-mltcig");
    			add_location(img, file, 252, 20, 10167);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*sz*/ 32) {
    				set_style(img, "left", /*idea*/ ctx[15][/*sz*/ ctx[5]].x + "%");
    			}

    			if (dirty & /*sz*/ 32) {
    				set_style(img, "top", /*idea*/ ctx[15][/*sz*/ ctx[5]].y + "%");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(252:16) {#each ideation as idea, i}",
    		ctx
    	});

    	return block;
    }

    // (265:4) {#if slide == 9}
    function create_if_block_11(ctx) {
    	let div4;
    	let p0;
    	let t1;
    	let h2;
    	let t3;
    	let h4;
    	let t5;
    	let div3;
    	let div0;
    	let svg0;
    	let polygon0;
    	let path0;
    	let t6;
    	let p1;
    	let t8;
    	let div1;
    	let svg1;
    	let polygon1;
    	let polygon2;
    	let path1;
    	let path2;
    	let t9;
    	let p2;
    	let t11;
    	let div2;
    	let svg2;
    	let path3;
    	let t12;
    	let p3;
    	let div4_intro;
    	let div4_outro;
    	let current;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			p0 = element("p");
    			p0.textContent = "Streamlined:";
    			t1 = space();
    			h2 = element("h2");
    			h2.textContent = "3 core proposals:";
    			t3 = space();
    			h4 = element("h4");
    			h4.textContent = "Given the pre-defined development window the ideas were reduced to the most impact for the space available to be tested with end users.";
    			t5 = space();
    			div3 = element("div");
    			div0 = element("div");
    			svg0 = svg_element("svg");
    			polygon0 = svg_element("polygon");
    			path0 = svg_element("path");
    			t6 = space();
    			p1 = element("p");
    			p1.textContent = "Mobile first quick report";
    			t8 = space();
    			div1 = element("div");
    			svg1 = svg_element("svg");
    			polygon1 = svg_element("polygon");
    			polygon2 = svg_element("polygon");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			t9 = space();
    			p2 = element("p");
    			p2.textContent = "Dashboard access";
    			t11 = space();
    			div2 = element("div");
    			svg2 = svg_element("svg");
    			path3 = svg_element("path");
    			t12 = space();
    			p3 = element("p");
    			p3.textContent = "Improved nav & overview";
    			attr_dev(p0, "class", "svelte-mltcig");
    			add_location(p0, file, 266, 12, 10682);
    			attr_dev(h2, "class", "svelte-mltcig");
    			add_location(h2, file, 267, 12, 10714);
    			attr_dev(h4, "class", "svelte-mltcig");
    			add_location(h4, file, 268, 12, 10753);
    			attr_dev(polygon0, "id", "Path");
    			attr_dev(polygon0, "points", "48 92.72 37.64 82.36 32 88 48 104 80 72 74.36 66.36");
    			add_location(polygon0, file, 272, 24, 11252);
    			attr_dev(path0, "d", "M8,96 L8,24 L56,24 L56,60 L64,60 L64,8 C63.9976,5.879 63.154,3.8456 61.654,2.34584 C60.1544,0.84608 58.1208,0.00244 56,7.10542736e-15 L8,7.10542736e-15 C5.87892,0.00212 3.84532,0.84564 2.34548,2.34548 C0.84564,3.84532 0.00212,5.87892 0,8 L0,96 C0.00244,98.1208 0.84608,100.1544 2.34584,101.654 C3.8456,103.154 5.879,103.9976 8,104 L24,104 L24,96 L8,96 Z M8,8 L56,8 L56,16 L8,16 L8,8 Z");
    			attr_dev(path0, "id", "Shape");
    			add_location(path0, file, 273, 24, 11367);
    			set_style(svg0, "margin-bottom", "24px");
    			attr_dev(svg0, "width", "80px");
    			attr_dev(svg0, "height", "104px");
    			attr_dev(svg0, "viewBox", "0 0 80 104");
    			attr_dev(svg0, "version", "1.1");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg0, "fill-rule", "nonzero");
    			attr_dev(svg0, "fill", "var(--grey)");
    			add_location(svg0, file, 271, 20, 11014);
    			attr_dev(p1, "class", "svelte-mltcig");
    			add_location(p1, file, 275, 20, 11828);
    			attr_dev(div0, "class", "col center svelte-mltcig");
    			add_location(div0, file, 270, 16, 10969);
    			attr_dev(polygon1, "id", "Path");
    			attr_dev(polygon1, "points", "96 76 88 76 88 96 96 96");
    			add_location(polygon1, file, 279, 24, 12185);
    			attr_dev(polygon2, "id", "Path");
    			attr_dev(polygon2, "points", "80 56 72 56 72 96 80 96");
    			add_location(polygon2, file, 280, 24, 12272);
    			attr_dev(path1, "d", "M36,96 C30.6976,95.9936 25.61412,93.8848 21.86476,90.1352 C18.1154,86.386 16.00624,81.3024 16,76 L24,76 C24,78.3732 24.7038,80.6936 26.02236,82.6668 C27.34096,84.6404 29.21508,86.1784 31.4078,87.0864 C33.6004,87.9948 36.0132,88.2324 38.3412,87.7696 C40.6688,87.3064 42.8072,86.1636 44.4852,84.4852 C46.1636,82.8072 47.3064,80.6688 47.7696,78.3412 C48.2324,76.0132 47.9948,73.6004 47.0864,71.4076 C46.1784,69.2152 44.6404,67.3408 42.6668,66.0224 C40.6936,64.7036 38.3732,64 36,64 L36,56 C41.3044,56 46.3916,58.1072 50.142,61.858 C53.8928,65.6084 56,70.6956 56,76 C56,81.3044 53.8928,86.3916 50.142,90.142 C46.3916,93.8928 41.3044,96 36,96 Z");
    			attr_dev(path1, "id", "Path");
    			add_location(path1, file, 281, 24, 12359);
    			attr_dev(path2, "d", "M104,0 L8,0 C5.87892,0.00212 3.84532,0.84564 2.34548,2.34548 C0.84564,3.84532 0.00212,5.87892 0,8 L0,104 C0.00244,106.1208 0.84608,108.1544 2.34584,109.654 C3.8456,111.154 5.879,111.9976 8,112 L104,112 C106.1208,111.9972 108.154,111.1532 109.6536,109.6536 C111.1532,108.154 111.9972,106.1208 112,104 L112,8 C111.9976,5.879 111.154,3.8456 109.654,2.34584 C108.1544,0.84608 106.1208,0.00244 104,0 L104,0 Z M104,36 L48,36 L48,8 L104,8 L104,36 Z M40,8 L40,36 L8,36 L8,8 L40,8 Z M8,104 L8,44 L104.0028,44 L104.008,104 L8,104 Z");
    			attr_dev(path2, "id", "Shape");
    			add_location(path2, file, 282, 24, 13051);
    			set_style(svg1, "margin-bottom", "16px");
    			attr_dev(svg1, "width", "113px");
    			attr_dev(svg1, "height", "112px");
    			attr_dev(svg1, "viewBox", "0 0 113 112");
    			attr_dev(svg1, "version", "1.1");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg1, "fill", "var(--grey)");
    			attr_dev(svg1, "fill-rule", "nonzero");
    			add_location(svg1, file, 278, 20, 11945);
    			attr_dev(p2, "class", "svelte-mltcig");
    			add_location(p2, file, 284, 20, 13649);
    			attr_dev(div1, "class", "col center svelte-mltcig");
    			add_location(div1, file, 277, 16, 11900);
    			attr_dev(path3, "d", "M112,16 L16,16 C11.581722,16 8,19.581722 8,24 L8,104 C8,108.418278 11.581722,112 16,112 L112,112 C116.418278,112 120,108.418278 120,104 L120,24 C120,19.581722 116.418278,16 112,16 Z M16,24 L40,24 L40,104 L16,104 L16,24 Z M112,104 L48,104 L48,24 L112,24 L112,104 Z");
    			attr_dev(path3, "id", "Shape");
    			add_location(path3, file, 288, 24, 13996);
    			set_style(svg2, "margin-bottom", "0px");
    			attr_dev(svg2, "width", "128px");
    			attr_dev(svg2, "height", "128px");
    			attr_dev(svg2, "viewBox", "0 0 128 128");
    			attr_dev(svg2, "version", "1.1");
    			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg2, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg2, "fill", "var(--grey)");
    			attr_dev(svg2, "fill-rule", "nonzero");
    			add_location(svg2, file, 287, 20, 13757);
    			attr_dev(p3, "class", "svelte-mltcig");
    			add_location(p3, file, 290, 20, 14344);
    			attr_dev(div2, "class", "col center svelte-mltcig");
    			add_location(div2, file, 286, 16, 13712);
    			attr_dev(div3, "class", "row");
    			set_style(div3, "margin-top", "100px");
    			add_location(div3, file, 269, 12, 10910);
    			attr_dev(div4, "class", "screen marker svelte-mltcig");
    			add_location(div4, file, 265, 8, 10596);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, p0);
    			append_dev(div4, t1);
    			append_dev(div4, h2);
    			append_dev(div4, t3);
    			append_dev(div4, h4);
    			append_dev(div4, t5);
    			append_dev(div4, div3);
    			append_dev(div3, div0);
    			append_dev(div0, svg0);
    			append_dev(svg0, polygon0);
    			append_dev(svg0, path0);
    			append_dev(div0, t6);
    			append_dev(div0, p1);
    			append_dev(div3, t8);
    			append_dev(div3, div1);
    			append_dev(div1, svg1);
    			append_dev(svg1, polygon1);
    			append_dev(svg1, polygon2);
    			append_dev(svg1, path1);
    			append_dev(svg1, path2);
    			append_dev(div1, t9);
    			append_dev(div1, p2);
    			append_dev(div3, t11);
    			append_dev(div3, div2);
    			append_dev(div2, svg2);
    			append_dev(svg2, path3);
    			append_dev(div2, t12);
    			append_dev(div2, p3);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div4_outro) div4_outro.end(1);
    				if (!div4_intro) div4_intro = create_in_transition(div4, fly, { x: /*wx*/ ctx[2], duration: 1000 });
    				div4_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div4_intro) div4_intro.invalidate();
    			div4_outro = create_out_transition(div4, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if (detaching && div4_outro) div4_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11.name,
    		type: "if",
    		source: "(265:4) {#if slide == 9}",
    		ctx
    	});

    	return block;
    }

    // (296:4) {#if slide == 10}
    function create_if_block_10(ctx) {
    	let div4;
    	let h2;
    	let t1;
    	let div3;
    	let div0;
    	let img0;
    	let img0_src_value;
    	let t2;
    	let div1;
    	let img1;
    	let img1_src_value;
    	let t3;
    	let div2;
    	let img2;
    	let img2_src_value;
    	let div4_intro;
    	let div4_outro;
    	let current;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Testing - Mobile Quick Report:";
    			t1 = space();
    			div3 = element("div");
    			div0 = element("div");
    			img0 = element("img");
    			t2 = space();
    			div1 = element("div");
    			img1 = element("img");
    			t3 = space();
    			div2 = element("div");
    			img2 = element("img");
    			attr_dev(h2, "class", "svelte-mltcig");
    			add_location(h2, file, 297, 12, 14551);
    			if (img0.src !== (img0_src_value = "./images/ux/mob1.png")) attr_dev(img0, "src", img0_src_value);
    			set_style(img0, "margin", "0 auto");
    			attr_dev(img0, "alt", "existing");
    			add_location(img0, file, 300, 20, 14682);
    			attr_dev(div0, "class", "col center svelte-mltcig");
    			add_location(div0, file, 299, 16, 14637);
    			if (img1.src !== (img1_src_value = "./images/ux/mob2.png")) attr_dev(img1, "src", img1_src_value);
    			set_style(img1, "margin", "0 auto");
    			attr_dev(img1, "alt", "existing");
    			add_location(img1, file, 303, 20, 14836);
    			attr_dev(div1, "class", "col center svelte-mltcig");
    			add_location(div1, file, 302, 16, 14791);
    			if (img2.src !== (img2_src_value = "./images/ux/mob3.png")) attr_dev(img2, "src", img2_src_value);
    			set_style(img2, "margin", "0 auto");
    			attr_dev(img2, "alt", "existing");
    			add_location(img2, file, 306, 20, 14990);
    			attr_dev(div2, "class", "col center svelte-mltcig");
    			add_location(div2, file, 305, 16, 14945);
    			attr_dev(div3, "class", "row");
    			add_location(div3, file, 298, 12, 14603);
    			attr_dev(div4, "class", "screen svelte-mltcig");
    			add_location(div4, file, 296, 8, 14472);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, h2);
    			append_dev(div4, t1);
    			append_dev(div4, div3);
    			append_dev(div3, div0);
    			append_dev(div0, img0);
    			append_dev(div3, t2);
    			append_dev(div3, div1);
    			append_dev(div1, img1);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			append_dev(div2, img2);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div4_outro) div4_outro.end(1);
    				if (!div4_intro) div4_intro = create_in_transition(div4, fly, { x: /*wx*/ ctx[2], duration: 1000 });
    				div4_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div4_intro) div4_intro.invalidate();
    			div4_outro = create_out_transition(div4, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if (detaching && div4_outro) div4_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(296:4) {#if slide == 10}",
    		ctx
    	});

    	return block;
    }

    // (312:4) {#if slide == 11}
    function create_if_block_9(ctx) {
    	let div;
    	let h2;
    	let t1;
    	let h4;
    	let t2;
    	let t3;
    	let t4;
    	let p;
    	let t6;
    	let uxqr;
    	let div_intro;
    	let div_outro;
    	let current;
    	uxqr = new UX_qr({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = "Testing - Mobile Quick Report:";
    			t1 = space();
    			h4 = element("h4");
    			t2 = text("Your turn to try ");
    			t3 = text(/*name*/ ctx[0]);
    			t4 = space();
    			p = element("p");
    			p.textContent = "I built a mobile prototype and a multi-lingual QR code configurator using sveltejs for on-site testing with clients in Finland and England.";
    			t6 = space();
    			create_component(uxqr.$$.fragment);
    			attr_dev(h2, "class", "svelte-mltcig");
    			add_location(h2, file, 313, 12, 15236);
    			attr_dev(h4, "class", "tip svelte-mltcig");
    			add_location(h4, file, 315, 12, 15289);
    			add_location(p, file, 316, 12, 15346);
    			attr_dev(div, "class", "screen svelte-mltcig");
    			add_location(div, file, 312, 8, 15157);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(div, t1);
    			append_dev(div, h4);
    			append_dev(h4, t2);
    			append_dev(h4, t3);
    			append_dev(div, t4);
    			append_dev(div, p);
    			append_dev(div, t6);
    			mount_component(uxqr, div, null);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (!current || dirty & /*name*/ 1) set_data_dev(t3, /*name*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(uxqr.$$.fragment, local);

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, fly, { x: /*wx*/ ctx[2], duration: 1000 });
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(uxqr.$$.fragment, local);
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(uxqr);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(312:4) {#if slide == 11}",
    		ctx
    	});

    	return block;
    }

    // (324:4) {#if slide == 12}
    function create_if_block_8(ctx) {
    	let div1;
    	let h2;
    	let t1;
    	let div0;
    	let img;
    	let img_src_value;
    	let div1_intro;
    	let div1_outro;
    	let current;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Testing - Dashboard:";
    			t1 = space();
    			div0 = element("div");
    			img = element("img");
    			attr_dev(h2, "class", "svelte-mltcig");
    			add_location(h2, file, 325, 12, 15679);
    			if (img.src !== (img_src_value = "./images/ux/dashboard.png")) attr_dev(img, "src", img_src_value);
    			set_style(img, "margin", "0 auto");
    			attr_dev(img, "alt", "dashboard");
    			add_location(img, file, 327, 16, 15758);
    			attr_dev(div0, "class", "center svelte-mltcig");
    			add_location(div0, file, 326, 12, 15721);
    			attr_dev(div1, "class", "screen svelte-mltcig");
    			add_location(div1, file, 324, 8, 15600);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h2);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, img);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div1_outro) div1_outro.end(1);
    				if (!div1_intro) div1_intro = create_in_transition(div1, fly, { x: /*wx*/ ctx[2], duration: 1000 });
    				div1_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div1_intro) div1_intro.invalidate();
    			div1_outro = create_out_transition(div1, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (detaching && div1_outro) div1_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(324:4) {#if slide == 12}",
    		ctx
    	});

    	return block;
    }

    // (333:4) {#if slide == 13}
    function create_if_block_7(ctx) {
    	let div1;
    	let h2;
    	let t1;
    	let div0;
    	let img;
    	let img_src_value;
    	let div1_intro;
    	let div1_outro;
    	let current;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Testing - Overview:";
    			t1 = space();
    			div0 = element("div");
    			img = element("img");
    			attr_dev(h2, "class", "svelte-mltcig");
    			add_location(h2, file, 334, 12, 15988);
    			if (img.src !== (img_src_value = "./images/ux/overview.png")) attr_dev(img, "src", img_src_value);
    			set_style(img, "margin", "0 auto");
    			attr_dev(img, "alt", "overview");
    			add_location(img, file, 336, 16, 16066);
    			attr_dev(div0, "class", "center svelte-mltcig");
    			add_location(div0, file, 335, 12, 16029);
    			attr_dev(div1, "class", "screen svelte-mltcig");
    			add_location(div1, file, 333, 8, 15909);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h2);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, img);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div1_outro) div1_outro.end(1);
    				if (!div1_intro) div1_intro = create_in_transition(div1, fly, { x: /*wx*/ ctx[2], duration: 1000 });
    				div1_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div1_intro) div1_intro.invalidate();
    			div1_outro = create_out_transition(div1, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (detaching && div1_outro) div1_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(333:4) {#if slide == 13}",
    		ctx
    	});

    	return block;
    }

    // (342:4) {#if slide == 14}
    function create_if_block_6(ctx) {
    	let div1;
    	let h2;
    	let t1;
    	let div0;
    	let img;
    	let img_src_value;
    	let div1_intro;
    	let div1_outro;
    	let current;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Testing - Future roadmap:";
    			t1 = space();
    			div0 = element("div");
    			img = element("img");
    			attr_dev(h2, "class", "svelte-mltcig");
    			add_location(h2, file, 343, 12, 16294);
    			if (img.src !== (img_src_value = "./images/ux/full_page.png")) attr_dev(img, "src", img_src_value);
    			set_style(img, "margin", "0 auto");
    			attr_dev(img, "alt", "full page");
    			add_location(img, file, 345, 16, 16378);
    			attr_dev(div0, "class", "center svelte-mltcig");
    			add_location(div0, file, 344, 12, 16341);
    			attr_dev(div1, "class", "screen svelte-mltcig");
    			add_location(div1, file, 342, 8, 16215);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h2);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, img);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div1_outro) div1_outro.end(1);
    				if (!div1_intro) div1_intro = create_in_transition(div1, fly, { x: /*wx*/ ctx[2], duration: 1000 });
    				div1_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div1_intro) div1_intro.invalidate();
    			div1_outro = create_out_transition(div1, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (detaching && div1_outro) div1_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(342:4) {#if slide == 14}",
    		ctx
    	});

    	return block;
    }

    // (350:4) {#if slide == 15}
    function create_if_block_5(ctx) {
    	let div1;
    	let h2;
    	let t1;
    	let div0;
    	let img0;
    	let img0_src_value;
    	let t2;
    	let img1;
    	let img1_src_value;
    	let t3;
    	let img2;
    	let img2_src_value;
    	let t4;
    	let h4;
    	let div1_intro;
    	let div1_outro;
    	let current;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Testing - on site:";
    			t1 = space();
    			div0 = element("div");
    			img0 = element("img");
    			t2 = space();
    			img1 = element("img");
    			t3 = space();
    			img2 = element("img");
    			t4 = space();
    			h4 = element("h4");
    			h4.textContent = "(I will literally go to the ends of the earth)";
    			attr_dev(h2, "class", "svelte-mltcig");
    			add_location(h2, file, 351, 12, 16607);
    			if (img0.src !== (img0_src_value = "./images/ux/testing1.png")) attr_dev(img0, "src", img0_src_value);
    			set_style(img0, "margin", "0 auto");
    			set_style(img0, "max-width", "37%");
    			attr_dev(img0, "alt", "testing1");
    			add_location(img0, file, 353, 16, 16684);
    			if (img1.src !== (img1_src_value = "./images/ux/testing2.png")) attr_dev(img1, "src", img1_src_value);
    			set_style(img1, "margin", "0 auto");
    			set_style(img1, "max-width", "37%");
    			attr_dev(img1, "alt", "testing2");
    			add_location(img1, file, 354, 16, 16788);
    			if (img2.src !== (img2_src_value = "./images/ux/testing3.png")) attr_dev(img2, "src", img2_src_value);
    			set_style(img2, "margin", "0 auto");
    			set_style(img2, "max-width", "24%");
    			attr_dev(img2, "alt", "testing3");
    			add_location(img2, file, 355, 16, 16892);
    			attr_dev(h4, "class", "tip svelte-mltcig");
    			add_location(h4, file, 356, 16, 16996);
    			attr_dev(div0, "class", "center svelte-mltcig");
    			add_location(div0, file, 352, 12, 16647);
    			attr_dev(div1, "class", "screen svelte-mltcig");
    			add_location(div1, file, 350, 8, 16528);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h2);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, img0);
    			append_dev(div0, t2);
    			append_dev(div0, img1);
    			append_dev(div0, t3);
    			append_dev(div0, img2);
    			append_dev(div0, t4);
    			append_dev(div0, h4);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div1_outro) div1_outro.end(1);
    				if (!div1_intro) div1_intro = create_in_transition(div1, fly, { x: /*wx*/ ctx[2], duration: 1000 });
    				div1_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div1_intro) div1_intro.invalidate();
    			div1_outro = create_out_transition(div1, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (detaching && div1_outro) div1_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(350:4) {#if slide == 15}",
    		ctx
    	});

    	return block;
    }

    // (362:4) {#if slide == 16}
    function create_if_block_4(ctx) {
    	let div28;
    	let p;
    	let t1;
    	let h1;
    	let t3;
    	let h4;
    	let t5;
    	let div20;
    	let div1;
    	let div0;
    	let t7;
    	let div3;
    	let div2;
    	let t9;
    	let div5;
    	let div4;
    	let t11;
    	let div7;
    	let div6;
    	let t13;
    	let div9;
    	let div8;
    	let t15;
    	let div11;
    	let div10;
    	let t17;
    	let div13;
    	let div12;
    	let t19;
    	let div15;
    	let div14;
    	let t21;
    	let div17;
    	let div16;
    	let t23;
    	let div19;
    	let div18;
    	let t25;
    	let div27;
    	let div22;
    	let div21;
    	let t26;
    	let br0;
    	let t27;
    	let t28;
    	let div24;
    	let div23;
    	let t29;
    	let br1;
    	let t30;
    	let t31;
    	let div26;
    	let div25;
    	let t32;
    	let br2;
    	let t33;
    	let div28_intro;
    	let div28_outro;
    	let current;

    	const block = {
    		c: function create() {
    			div28 = element("div");
    			p = element("p");
    			p.textContent = "Results:";
    			t1 = space();
    			h1 = element("h1");
    			h1.textContent = "“Is that it? Is it that easy? It’s not!... I can’t believe it”";
    			t3 = space();
    			h4 = element("h4");
    			h4.textContent = "Narrator: “It was and it is”";
    			t5 = space();
    			div20 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			div0.textContent = "Problem definition";
    			t7 = space();
    			div3 = element("div");
    			div2 = element("div");
    			div2.textContent = "Interviews & surveys";
    			t9 = space();
    			div5 = element("div");
    			div4 = element("div");
    			div4.textContent = "Synthesis";
    			t11 = space();
    			div7 = element("div");
    			div6 = element("div");
    			div6.textContent = "Ideation";
    			t13 = space();
    			div9 = element("div");
    			div8 = element("div");
    			div8.textContent = "Prototyping";
    			t15 = space();
    			div11 = element("div");
    			div10 = element("div");
    			div10.textContent = "On site testing";
    			t17 = space();
    			div13 = element("div");
    			div12 = element("div");
    			div12.textContent = "Refinement";
    			t19 = space();
    			div15 = element("div");
    			div14 = element("div");
    			div14.textContent = "Validation";
    			t21 = space();
    			div17 = element("div");
    			div16 = element("div");
    			div16.textContent = "Development";
    			t23 = space();
    			div19 = element("div");
    			div18 = element("div");
    			div18.textContent = "Review";
    			t25 = space();
    			div27 = element("div");
    			div22 = element("div");
    			div21 = element("div");
    			t26 = text("Research");
    			br0 = element("br");
    			t27 = text("2 months");
    			t28 = space();
    			div24 = element("div");
    			div23 = element("div");
    			t29 = text("Design");
    			br1 = element("br");
    			t30 = text("3 weeks");
    			t31 = space();
    			div26 = element("div");
    			div25 = element("div");
    			t32 = text("Development");
    			br2 = element("br");
    			t33 = text("2 months");
    			attr_dev(p, "class", "svelte-mltcig");
    			add_location(p, file, 363, 12, 17229);
    			attr_dev(h1, "class", "svelte-mltcig");
    			add_location(h1, file, 364, 12, 17257);
    			attr_dev(h4, "class", "svelte-mltcig");
    			add_location(h4, file, 365, 12, 17341);
    			attr_dev(div0, "class", "step svelte-mltcig");
    			add_location(div0, file, 372, 20, 17760);
    			attr_dev(div1, "class", "col");
    			add_location(div1, file, 371, 16, 17722);
    			attr_dev(div2, "class", "step svelte-mltcig");
    			add_location(div2, file, 375, 20, 17880);
    			attr_dev(div3, "class", "col");
    			add_location(div3, file, 374, 16, 17842);
    			attr_dev(div4, "class", "step svelte-mltcig");
    			add_location(div4, file, 378, 20, 18002);
    			attr_dev(div5, "class", "col");
    			add_location(div5, file, 377, 16, 17964);
    			attr_dev(div6, "class", "step svelte-mltcig");
    			add_location(div6, file, 381, 20, 18113);
    			attr_dev(div7, "class", "col");
    			add_location(div7, file, 380, 16, 18075);
    			attr_dev(div8, "class", "step svelte-mltcig");
    			add_location(div8, file, 384, 20, 18223);
    			attr_dev(div9, "class", "col");
    			add_location(div9, file, 383, 16, 18185);
    			attr_dev(div10, "class", "step svelte-mltcig");
    			add_location(div10, file, 387, 20, 18336);
    			attr_dev(div11, "class", "col");
    			add_location(div11, file, 386, 16, 18298);
    			attr_dev(div12, "class", "step svelte-mltcig");
    			add_location(div12, file, 390, 20, 18453);
    			attr_dev(div13, "class", "col");
    			add_location(div13, file, 389, 16, 18415);
    			attr_dev(div14, "class", "step svelte-mltcig");
    			add_location(div14, file, 393, 20, 18565);
    			attr_dev(div15, "class", "col");
    			add_location(div15, file, 392, 16, 18527);
    			attr_dev(div16, "class", "step nextstep here svelte-mltcig");
    			add_location(div16, file, 396, 20, 18677);
    			attr_dev(div17, "class", "col");
    			add_location(div17, file, 395, 16, 18639);
    			attr_dev(div18, "class", "step nextstep svelte-mltcig");
    			add_location(div18, file, 399, 20, 18804);
    			attr_dev(div19, "class", "col");
    			add_location(div19, file, 398, 16, 18766);
    			attr_dev(div20, "class", "row steps svelte-mltcig");
    			add_location(div20, file, 370, 12, 17682);
    			add_location(br0, file, 404, 46, 19017);
    			attr_dev(div21, "class", "step svelte-mltcig");
    			add_location(div21, file, 404, 20, 18991);
    			attr_dev(div22, "class", "col");
    			set_style(div22, "flex", "3");
    			add_location(div22, file, 403, 16, 18938);
    			add_location(br1, file, 407, 44, 19152);
    			attr_dev(div23, "class", "step svelte-mltcig");
    			add_location(div23, file, 407, 20, 19128);
    			attr_dev(div24, "class", "col");
    			set_style(div24, "flex", "5");
    			add_location(div24, file, 406, 16, 19075);
    			add_location(br2, file, 410, 64, 19306);
    			attr_dev(div25, "class", "step nextstep here2 svelte-mltcig");
    			add_location(div25, file, 410, 20, 19262);
    			attr_dev(div26, "class", "col");
    			set_style(div26, "flex", "2");
    			add_location(div26, file, 409, 16, 19209);
    			attr_dev(div27, "class", "row steps svelte-mltcig");
    			add_location(div27, file, 402, 12, 18898);
    			attr_dev(div28, "class", "screen marker svelte-mltcig");
    			add_location(div28, file, 362, 8, 17143);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div28, anchor);
    			append_dev(div28, p);
    			append_dev(div28, t1);
    			append_dev(div28, h1);
    			append_dev(div28, t3);
    			append_dev(div28, h4);
    			append_dev(div28, t5);
    			append_dev(div28, div20);
    			append_dev(div20, div1);
    			append_dev(div1, div0);
    			append_dev(div20, t7);
    			append_dev(div20, div3);
    			append_dev(div3, div2);
    			append_dev(div20, t9);
    			append_dev(div20, div5);
    			append_dev(div5, div4);
    			append_dev(div20, t11);
    			append_dev(div20, div7);
    			append_dev(div7, div6);
    			append_dev(div20, t13);
    			append_dev(div20, div9);
    			append_dev(div9, div8);
    			append_dev(div20, t15);
    			append_dev(div20, div11);
    			append_dev(div11, div10);
    			append_dev(div20, t17);
    			append_dev(div20, div13);
    			append_dev(div13, div12);
    			append_dev(div20, t19);
    			append_dev(div20, div15);
    			append_dev(div15, div14);
    			append_dev(div20, t21);
    			append_dev(div20, div17);
    			append_dev(div17, div16);
    			append_dev(div20, t23);
    			append_dev(div20, div19);
    			append_dev(div19, div18);
    			append_dev(div28, t25);
    			append_dev(div28, div27);
    			append_dev(div27, div22);
    			append_dev(div22, div21);
    			append_dev(div21, t26);
    			append_dev(div21, br0);
    			append_dev(div21, t27);
    			append_dev(div27, t28);
    			append_dev(div27, div24);
    			append_dev(div24, div23);
    			append_dev(div23, t29);
    			append_dev(div23, br1);
    			append_dev(div23, t30);
    			append_dev(div27, t31);
    			append_dev(div27, div26);
    			append_dev(div26, div25);
    			append_dev(div25, t32);
    			append_dev(div25, br2);
    			append_dev(div25, t33);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div28_outro) div28_outro.end(1);
    				if (!div28_intro) div28_intro = create_in_transition(div28, fly, { x: /*wx*/ ctx[2], duration: 1000 });
    				div28_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div28_intro) div28_intro.invalidate();
    			div28_outro = create_out_transition(div28, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div28);
    			if (detaching && div28_outro) div28_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(362:4) {#if slide == 16}",
    		ctx
    	});

    	return block;
    }

    // (416:4) {#if slide == 17}
    function create_if_block_3(ctx) {
    	let div;
    	let h1;
    	let t1;
    	let h30;
    	let t2;
    	let i;
    	let t4;
    	let t5;
    	let h31;
    	let t7;
    	let h32;
    	let t9;
    	let h33;
    	let t11;
    	let h4;
    	let t12;
    	let t13_value = (/*co*/ ctx[1] ? /*co*/ ctx[1] : "you") + "";
    	let t13;
    	let div_intro;
    	let div_outro;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "Key takeaways:";
    			t1 = space();
    			h30 = element("h3");
    			t2 = text("— Created something ");
    			i = element("i");
    			i.textContent = "loved";
    			t4 = text(" by end users");
    			t5 = space();
    			h31 = element("h3");
    			h31.textContent = "— Developed a product design language";
    			t7 = space();
    			h32 = element("h3");
    			h32.textContent = "— Leveraged one process for future product opportunities";
    			t9 = space();
    			h33 = element("h3");
    			h33.textContent = "— Exposed weaknesses in our own biases";
    			t11 = space();
    			h4 = element("h4");
    			t12 = text("— Can repeat this for ");
    			t13 = text(t13_value);
    			attr_dev(h1, "class", "svelte-mltcig");
    			add_location(h1, file, 417, 12, 19507);
    			add_location(i, file, 418, 42, 19573);
    			attr_dev(h30, "class", "svelte-mltcig");
    			add_location(h30, file, 418, 12, 19543);
    			attr_dev(h31, "class", "svelte-mltcig");
    			add_location(h31, file, 419, 12, 19616);
    			attr_dev(h32, "class", "svelte-mltcig");
    			add_location(h32, file, 420, 12, 19681);
    			attr_dev(h33, "class", "svelte-mltcig");
    			add_location(h33, file, 421, 12, 19765);
    			attr_dev(h4, "class", "tip svelte-mltcig");
    			add_location(h4, file, 422, 12, 19831);
    			attr_dev(div, "class", "screen title svelte-mltcig");
    			add_location(div, file, 416, 8, 19422);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(div, t1);
    			append_dev(div, h30);
    			append_dev(h30, t2);
    			append_dev(h30, i);
    			append_dev(h30, t4);
    			append_dev(div, t5);
    			append_dev(div, h31);
    			append_dev(div, t7);
    			append_dev(div, h32);
    			append_dev(div, t9);
    			append_dev(div, h33);
    			append_dev(div, t11);
    			append_dev(div, h4);
    			append_dev(h4, t12);
    			append_dev(h4, t13);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty & /*co*/ 2) && t13_value !== (t13_value = (/*co*/ ctx[1] ? /*co*/ ctx[1] : "you") + "")) set_data_dev(t13, t13_value);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, fly, { x: /*wx*/ ctx[2], duration: 1000 });
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(416:4) {#if slide == 17}",
    		ctx
    	});

    	return block;
    }

    // (426:4) {#if slide == 18}
    function create_if_block_2(ctx) {
    	let div;
    	let p;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let h1;
    	let t4;
    	let br;
    	let u;
    	let t6;
    	let div_intro;
    	let div_outro;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			t0 = text("So ");
    			t1 = text(/*name*/ ctx[0]);
    			t2 = text("...");
    			t3 = space();
    			h1 = element("h1");
    			t4 = text("How can I help solve");
    			br = element("br");
    			u = element("u");
    			u.textContent = "your";
    			t6 = text(" problems?");
    			attr_dev(p, "class", "svelte-mltcig");
    			add_location(p, file, 427, 12, 20036);
    			add_location(br, file, 428, 36, 20092);
    			set_style(u, "color", "var(--blue)");
    			add_location(u, file, 428, 40, 20096);
    			attr_dev(h1, "class", "svelte-mltcig");
    			add_location(h1, file, 428, 12, 20068);
    			attr_dev(div, "class", "screen end svelte-mltcig");
    			add_location(div, file, 426, 8, 19953);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			append_dev(p, t2);
    			append_dev(div, t3);
    			append_dev(div, h1);
    			append_dev(h1, t4);
    			append_dev(h1, br);
    			append_dev(h1, u);
    			append_dev(h1, t6);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (!current || dirty & /*name*/ 1) set_data_dev(t1, /*name*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, fly, { x: /*wx*/ ctx[2], duration: 1000 });
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(426:4) {#if slide == 18}",
    		ctx
    	});

    	return block;
    }

    // (441:4) {#if slide >= 1}
    function create_if_block_1(ctx) {
    	let svg;
    	let line0;
    	let line1;
    	let line2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			line0 = svg_element("line");
    			line1 = svg_element("line");
    			line2 = svg_element("line");
    			attr_dev(line0, "x1", "0");
    			attr_dev(line0, "y1", "40");
    			attr_dev(line0, "x2", "100");
    			attr_dev(line0, "y2", "40");
    			attr_dev(line0, "class", "svelte-mltcig");
    			add_location(line0, file, 441, 298, 20506);
    			attr_dev(line1, "x1", "40");
    			attr_dev(line1, "y1", "0");
    			attr_dev(line1, "x2", "0");
    			attr_dev(line1, "y2", "40");
    			attr_dev(line1, "class", "svelte-mltcig");
    			add_location(line1, file, 441, 343, 20551);
    			attr_dev(line2, "x1", "40");
    			attr_dev(line2, "y1", "80");
    			attr_dev(line2, "x2", "0");
    			attr_dev(line2, "y2", "40");
    			attr_dev(line2, "class", "svelte-mltcig");
    			add_location(line2, file, 441, 386, 20594);
    			attr_dev(svg, "class", "prev svelte-mltcig");
    			attr_dev(svg, "width", "51px");
    			attr_dev(svg, "height", "41px");
    			attr_dev(svg, "viewBox", "0 0 102 82");
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "stroke-width", "4");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "fill-rule", "evenodd");
    			attr_dev(svg, "stroke-linecap", "round");
    			toggle_class(svg, "pop", [0, 4, 9, 16, 17].indexOf(/*slide*/ ctx[3]) >= 0);
    			add_location(svg, file, 441, 4, 20212);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, line0);
    			append_dev(svg, line1);
    			append_dev(svg, line2);

    			if (!mounted) {
    				dispose = listen_dev(svg, "click", /*prev*/ ctx[9], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*slide*/ 8) {
    				toggle_class(svg, "pop", [0, 4, 9, 16, 17].indexOf(/*slide*/ ctx[3]) >= 0);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(441:4) {#if slide >= 1}",
    		ctx
    	});

    	return block;
    }

    // (444:4) {#if slide < total_slides - 1}
    function create_if_block(ctx) {
    	let svg;
    	let line0;
    	let line1;
    	let line2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			line0 = svg_element("line");
    			line1 = svg_element("line");
    			line2 = svg_element("line");
    			attr_dev(line0, "x1", "0");
    			attr_dev(line0, "y1", "40");
    			attr_dev(line0, "x2", "100");
    			attr_dev(line0, "y2", "40");
    			attr_dev(line0, "class", "svelte-mltcig");
    			add_location(line0, file, 444, 298, 20988);
    			attr_dev(line1, "x1", "60");
    			attr_dev(line1, "y1", "0");
    			attr_dev(line1, "x2", "100");
    			attr_dev(line1, "y2", "40");
    			attr_dev(line1, "class", "svelte-mltcig");
    			add_location(line1, file, 444, 343, 21033);
    			attr_dev(line2, "x1", "60");
    			attr_dev(line2, "y1", "80");
    			attr_dev(line2, "x2", "100");
    			attr_dev(line2, "y2", "40");
    			attr_dev(line2, "class", "svelte-mltcig");
    			add_location(line2, file, 444, 388, 21078);
    			attr_dev(svg, "class", "next svelte-mltcig");
    			attr_dev(svg, "width", "51px");
    			attr_dev(svg, "height", "41px");
    			attr_dev(svg, "viewBox", "0 0 102 82");
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "stroke-width", "4");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "fill-rule", "evenodd");
    			attr_dev(svg, "stroke-linecap", "round");
    			toggle_class(svg, "pop", [0, 4, 9, 16, 17].indexOf(/*slide*/ ctx[3]) >= 0);
    			add_location(svg, file, 444, 4, 20694);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, line0);
    			append_dev(svg, line1);
    			append_dev(svg, line2);

    			if (!mounted) {
    				dispose = listen_dev(svg, "click", /*next*/ ctx[8], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*slide*/ 8) {
    				toggle_class(svg, "pop", [0, 4, 9, 16, 17].indexOf(/*slide*/ ctx[3]) >= 0);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(444:4) {#if slide < total_slides - 1}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div2;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let t7;
    	let t8;
    	let t9;
    	let t10;
    	let t11;
    	let t12;
    	let t13;
    	let t14;
    	let t15;
    	let t16;
    	let t17;
    	let t18;
    	let t19;
    	let t20;
    	let div0;
    	let t21_value = /*slide*/ ctx[3] + 1 + "";
    	let t21;
    	let t22;
    	let t23;
    	let t24;
    	let div1;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*slide*/ ctx[3] == 0 && create_if_block_21(ctx);
    	let if_block1 = /*slide*/ ctx[3] == 1 && create_if_block_20(ctx);
    	let if_block2 = /*slide*/ ctx[3] == 2 && create_if_block_19(ctx);
    	let if_block3 = /*slide*/ ctx[3] == 3 && create_if_block_18(ctx);
    	let if_block4 = /*slide*/ ctx[3] == 4 && create_if_block_17(ctx);
    	let if_block5 = /*slide*/ ctx[3] == 5 && create_if_block_16(ctx);
    	let if_block6 = /*slide*/ ctx[3] == 6 && create_if_block_15(ctx);
    	let if_block7 = /*slide*/ ctx[3] == 7 && create_if_block_14(ctx);
    	let if_block8 = /*slide*/ ctx[3] == 8 && create_if_block_12(ctx);
    	let if_block9 = /*slide*/ ctx[3] == 9 && create_if_block_11(ctx);
    	let if_block10 = /*slide*/ ctx[3] == 10 && create_if_block_10(ctx);
    	let if_block11 = /*slide*/ ctx[3] == 11 && create_if_block_9(ctx);
    	let if_block12 = /*slide*/ ctx[3] == 12 && create_if_block_8(ctx);
    	let if_block13 = /*slide*/ ctx[3] == 13 && create_if_block_7(ctx);
    	let if_block14 = /*slide*/ ctx[3] == 14 && create_if_block_6(ctx);
    	let if_block15 = /*slide*/ ctx[3] == 15 && create_if_block_5(ctx);
    	let if_block16 = /*slide*/ ctx[3] == 16 && create_if_block_4(ctx);
    	let if_block17 = /*slide*/ ctx[3] == 17 && create_if_block_3(ctx);
    	let if_block18 = /*slide*/ ctx[3] == 18 && create_if_block_2(ctx);
    	let if_block19 = /*slide*/ ctx[3] >= 1 && create_if_block_1(ctx);
    	let if_block20 = /*slide*/ ctx[3] < /*total_slides*/ ctx[6] - 1 && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			if (if_block3) if_block3.c();
    			t3 = space();
    			if (if_block4) if_block4.c();
    			t4 = space();
    			if (if_block5) if_block5.c();
    			t5 = space();
    			if (if_block6) if_block6.c();
    			t6 = space();
    			if (if_block7) if_block7.c();
    			t7 = space();
    			if (if_block8) if_block8.c();
    			t8 = space();
    			if (if_block9) if_block9.c();
    			t9 = space();
    			if (if_block10) if_block10.c();
    			t10 = space();
    			if (if_block11) if_block11.c();
    			t11 = space();
    			if (if_block12) if_block12.c();
    			t12 = space();
    			if (if_block13) if_block13.c();
    			t13 = space();
    			if (if_block14) if_block14.c();
    			t14 = space();
    			if (if_block15) if_block15.c();
    			t15 = space();
    			if (if_block16) if_block16.c();
    			t16 = space();
    			if (if_block17) if_block17.c();
    			t17 = space();
    			if (if_block18) if_block18.c();
    			t18 = space();
    			if (if_block19) if_block19.c();
    			t19 = space();
    			if (if_block20) if_block20.c();
    			t20 = space();
    			div0 = element("div");
    			t21 = text(t21_value);
    			t22 = text(" / ");
    			t23 = text(/*total_slides*/ ctx[6]);
    			t24 = space();
    			div1 = element("div");
    			div1.textContent = "Prepared for Tom Frew - 18 March 2022";
    			attr_dev(div0, "class", "pg svelte-mltcig");
    			add_location(div0, file, 447, 4, 21146);
    			attr_dev(div1, "class", "prep svelte-mltcig");
    			add_location(div1, file, 448, 4, 21199);
    			attr_dev(div2, "class", "screens svelte-mltcig");
    			add_location(div2, file, 121, 0, 3971);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			if (if_block0) if_block0.m(div2, null);
    			append_dev(div2, t0);
    			if (if_block1) if_block1.m(div2, null);
    			append_dev(div2, t1);
    			if (if_block2) if_block2.m(div2, null);
    			append_dev(div2, t2);
    			if (if_block3) if_block3.m(div2, null);
    			append_dev(div2, t3);
    			if (if_block4) if_block4.m(div2, null);
    			append_dev(div2, t4);
    			if (if_block5) if_block5.m(div2, null);
    			append_dev(div2, t5);
    			if (if_block6) if_block6.m(div2, null);
    			append_dev(div2, t6);
    			if (if_block7) if_block7.m(div2, null);
    			append_dev(div2, t7);
    			if (if_block8) if_block8.m(div2, null);
    			append_dev(div2, t8);
    			if (if_block9) if_block9.m(div2, null);
    			append_dev(div2, t9);
    			if (if_block10) if_block10.m(div2, null);
    			append_dev(div2, t10);
    			if (if_block11) if_block11.m(div2, null);
    			append_dev(div2, t11);
    			if (if_block12) if_block12.m(div2, null);
    			append_dev(div2, t12);
    			if (if_block13) if_block13.m(div2, null);
    			append_dev(div2, t13);
    			if (if_block14) if_block14.m(div2, null);
    			append_dev(div2, t14);
    			if (if_block15) if_block15.m(div2, null);
    			append_dev(div2, t15);
    			if (if_block16) if_block16.m(div2, null);
    			append_dev(div2, t16);
    			if (if_block17) if_block17.m(div2, null);
    			append_dev(div2, t17);
    			if (if_block18) if_block18.m(div2, null);
    			append_dev(div2, t18);
    			if (if_block19) if_block19.m(div2, null);
    			append_dev(div2, t19);
    			if (if_block20) if_block20.m(div2, null);
    			append_dev(div2, t20);
    			append_dev(div2, div0);
    			append_dev(div0, t21);
    			append_dev(div0, t22);
    			append_dev(div0, t23);
    			append_dev(div2, t24);
    			append_dev(div2, div1);
    			/*div2_binding*/ ctx[13](div2);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window_1, "keydown", /*handleKeydown*/ ctx[10], false, false, false),
    					listen_dev(window_1, "resize", /*handleResize*/ ctx[11], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*slide*/ ctx[3] == 0) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*slide*/ 8) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_21(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div2, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*slide*/ ctx[3] == 1) {
    				if (if_block1) {
    					if (dirty & /*slide*/ 8) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_20(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div2, t1);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*slide*/ ctx[3] == 2) {
    				if (if_block2) {
    					if (dirty & /*slide*/ 8) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_19(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div2, t2);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (/*slide*/ ctx[3] == 3) {
    				if (if_block3) {
    					if (dirty & /*slide*/ 8) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block_18(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(div2, t3);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}

    			if (/*slide*/ ctx[3] == 4) {
    				if (if_block4) {
    					if (dirty & /*slide*/ 8) {
    						transition_in(if_block4, 1);
    					}
    				} else {
    					if_block4 = create_if_block_17(ctx);
    					if_block4.c();
    					transition_in(if_block4, 1);
    					if_block4.m(div2, t4);
    				}
    			} else if (if_block4) {
    				group_outros();

    				transition_out(if_block4, 1, 1, () => {
    					if_block4 = null;
    				});

    				check_outros();
    			}

    			if (/*slide*/ ctx[3] == 5) {
    				if (if_block5) {
    					if (dirty & /*slide*/ 8) {
    						transition_in(if_block5, 1);
    					}
    				} else {
    					if_block5 = create_if_block_16(ctx);
    					if_block5.c();
    					transition_in(if_block5, 1);
    					if_block5.m(div2, t5);
    				}
    			} else if (if_block5) {
    				group_outros();

    				transition_out(if_block5, 1, 1, () => {
    					if_block5 = null;
    				});

    				check_outros();
    			}

    			if (/*slide*/ ctx[3] == 6) {
    				if (if_block6) {
    					if (dirty & /*slide*/ 8) {
    						transition_in(if_block6, 1);
    					}
    				} else {
    					if_block6 = create_if_block_15(ctx);
    					if_block6.c();
    					transition_in(if_block6, 1);
    					if_block6.m(div2, t6);
    				}
    			} else if (if_block6) {
    				group_outros();

    				transition_out(if_block6, 1, 1, () => {
    					if_block6 = null;
    				});

    				check_outros();
    			}

    			if (/*slide*/ ctx[3] == 7) {
    				if (if_block7) {
    					if (dirty & /*slide*/ 8) {
    						transition_in(if_block7, 1);
    					}
    				} else {
    					if_block7 = create_if_block_14(ctx);
    					if_block7.c();
    					transition_in(if_block7, 1);
    					if_block7.m(div2, t7);
    				}
    			} else if (if_block7) {
    				group_outros();

    				transition_out(if_block7, 1, 1, () => {
    					if_block7 = null;
    				});

    				check_outros();
    			}

    			if (/*slide*/ ctx[3] == 8) {
    				if (if_block8) {
    					if_block8.p(ctx, dirty);

    					if (dirty & /*slide*/ 8) {
    						transition_in(if_block8, 1);
    					}
    				} else {
    					if_block8 = create_if_block_12(ctx);
    					if_block8.c();
    					transition_in(if_block8, 1);
    					if_block8.m(div2, t8);
    				}
    			} else if (if_block8) {
    				group_outros();

    				transition_out(if_block8, 1, 1, () => {
    					if_block8 = null;
    				});

    				check_outros();
    			}

    			if (/*slide*/ ctx[3] == 9) {
    				if (if_block9) {
    					if (dirty & /*slide*/ 8) {
    						transition_in(if_block9, 1);
    					}
    				} else {
    					if_block9 = create_if_block_11(ctx);
    					if_block9.c();
    					transition_in(if_block9, 1);
    					if_block9.m(div2, t9);
    				}
    			} else if (if_block9) {
    				group_outros();

    				transition_out(if_block9, 1, 1, () => {
    					if_block9 = null;
    				});

    				check_outros();
    			}

    			if (/*slide*/ ctx[3] == 10) {
    				if (if_block10) {
    					if (dirty & /*slide*/ 8) {
    						transition_in(if_block10, 1);
    					}
    				} else {
    					if_block10 = create_if_block_10(ctx);
    					if_block10.c();
    					transition_in(if_block10, 1);
    					if_block10.m(div2, t10);
    				}
    			} else if (if_block10) {
    				group_outros();

    				transition_out(if_block10, 1, 1, () => {
    					if_block10 = null;
    				});

    				check_outros();
    			}

    			if (/*slide*/ ctx[3] == 11) {
    				if (if_block11) {
    					if_block11.p(ctx, dirty);

    					if (dirty & /*slide*/ 8) {
    						transition_in(if_block11, 1);
    					}
    				} else {
    					if_block11 = create_if_block_9(ctx);
    					if_block11.c();
    					transition_in(if_block11, 1);
    					if_block11.m(div2, t11);
    				}
    			} else if (if_block11) {
    				group_outros();

    				transition_out(if_block11, 1, 1, () => {
    					if_block11 = null;
    				});

    				check_outros();
    			}

    			if (/*slide*/ ctx[3] == 12) {
    				if (if_block12) {
    					if (dirty & /*slide*/ 8) {
    						transition_in(if_block12, 1);
    					}
    				} else {
    					if_block12 = create_if_block_8(ctx);
    					if_block12.c();
    					transition_in(if_block12, 1);
    					if_block12.m(div2, t12);
    				}
    			} else if (if_block12) {
    				group_outros();

    				transition_out(if_block12, 1, 1, () => {
    					if_block12 = null;
    				});

    				check_outros();
    			}

    			if (/*slide*/ ctx[3] == 13) {
    				if (if_block13) {
    					if (dirty & /*slide*/ 8) {
    						transition_in(if_block13, 1);
    					}
    				} else {
    					if_block13 = create_if_block_7(ctx);
    					if_block13.c();
    					transition_in(if_block13, 1);
    					if_block13.m(div2, t13);
    				}
    			} else if (if_block13) {
    				group_outros();

    				transition_out(if_block13, 1, 1, () => {
    					if_block13 = null;
    				});

    				check_outros();
    			}

    			if (/*slide*/ ctx[3] == 14) {
    				if (if_block14) {
    					if (dirty & /*slide*/ 8) {
    						transition_in(if_block14, 1);
    					}
    				} else {
    					if_block14 = create_if_block_6(ctx);
    					if_block14.c();
    					transition_in(if_block14, 1);
    					if_block14.m(div2, t14);
    				}
    			} else if (if_block14) {
    				group_outros();

    				transition_out(if_block14, 1, 1, () => {
    					if_block14 = null;
    				});

    				check_outros();
    			}

    			if (/*slide*/ ctx[3] == 15) {
    				if (if_block15) {
    					if (dirty & /*slide*/ 8) {
    						transition_in(if_block15, 1);
    					}
    				} else {
    					if_block15 = create_if_block_5(ctx);
    					if_block15.c();
    					transition_in(if_block15, 1);
    					if_block15.m(div2, t15);
    				}
    			} else if (if_block15) {
    				group_outros();

    				transition_out(if_block15, 1, 1, () => {
    					if_block15 = null;
    				});

    				check_outros();
    			}

    			if (/*slide*/ ctx[3] == 16) {
    				if (if_block16) {
    					if (dirty & /*slide*/ 8) {
    						transition_in(if_block16, 1);
    					}
    				} else {
    					if_block16 = create_if_block_4(ctx);
    					if_block16.c();
    					transition_in(if_block16, 1);
    					if_block16.m(div2, t16);
    				}
    			} else if (if_block16) {
    				group_outros();

    				transition_out(if_block16, 1, 1, () => {
    					if_block16 = null;
    				});

    				check_outros();
    			}

    			if (/*slide*/ ctx[3] == 17) {
    				if (if_block17) {
    					if_block17.p(ctx, dirty);

    					if (dirty & /*slide*/ 8) {
    						transition_in(if_block17, 1);
    					}
    				} else {
    					if_block17 = create_if_block_3(ctx);
    					if_block17.c();
    					transition_in(if_block17, 1);
    					if_block17.m(div2, t17);
    				}
    			} else if (if_block17) {
    				group_outros();

    				transition_out(if_block17, 1, 1, () => {
    					if_block17 = null;
    				});

    				check_outros();
    			}

    			if (/*slide*/ ctx[3] == 18) {
    				if (if_block18) {
    					if_block18.p(ctx, dirty);

    					if (dirty & /*slide*/ 8) {
    						transition_in(if_block18, 1);
    					}
    				} else {
    					if_block18 = create_if_block_2(ctx);
    					if_block18.c();
    					transition_in(if_block18, 1);
    					if_block18.m(div2, t18);
    				}
    			} else if (if_block18) {
    				group_outros();

    				transition_out(if_block18, 1, 1, () => {
    					if_block18 = null;
    				});

    				check_outros();
    			}

    			if (/*slide*/ ctx[3] >= 1) {
    				if (if_block19) {
    					if_block19.p(ctx, dirty);
    				} else {
    					if_block19 = create_if_block_1(ctx);
    					if_block19.c();
    					if_block19.m(div2, t19);
    				}
    			} else if (if_block19) {
    				if_block19.d(1);
    				if_block19 = null;
    			}

    			if (/*slide*/ ctx[3] < /*total_slides*/ ctx[6] - 1) {
    				if (if_block20) {
    					if_block20.p(ctx, dirty);
    				} else {
    					if_block20 = create_if_block(ctx);
    					if_block20.c();
    					if_block20.m(div2, t20);
    				}
    			} else if (if_block20) {
    				if_block20.d(1);
    				if_block20 = null;
    			}

    			if ((!current || dirty & /*slide*/ 8) && t21_value !== (t21_value = /*slide*/ ctx[3] + 1 + "")) set_data_dev(t21, t21_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			transition_in(if_block3);
    			transition_in(if_block4);
    			transition_in(if_block5);
    			transition_in(if_block6);
    			transition_in(if_block7);
    			transition_in(if_block8);
    			transition_in(if_block9);
    			transition_in(if_block10);
    			transition_in(if_block11);
    			transition_in(if_block12);
    			transition_in(if_block13);
    			transition_in(if_block14);
    			transition_in(if_block15);
    			transition_in(if_block16);
    			transition_in(if_block17);
    			transition_in(if_block18);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			transition_out(if_block3);
    			transition_out(if_block4);
    			transition_out(if_block5);
    			transition_out(if_block6);
    			transition_out(if_block7);
    			transition_out(if_block8);
    			transition_out(if_block9);
    			transition_out(if_block10);
    			transition_out(if_block11);
    			transition_out(if_block12);
    			transition_out(if_block13);
    			transition_out(if_block14);
    			transition_out(if_block15);
    			transition_out(if_block16);
    			transition_out(if_block17);
    			transition_out(if_block18);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    			if (if_block5) if_block5.d();
    			if (if_block6) if_block6.d();
    			if (if_block7) if_block7.d();
    			if (if_block8) if_block8.d();
    			if (if_block9) if_block9.d();
    			if (if_block10) if_block10.d();
    			if (if_block11) if_block11.d();
    			if (if_block12) if_block12.d();
    			if (if_block13) if_block13.d();
    			if (if_block14) if_block14.d();
    			if (if_block15) if_block15.d();
    			if (if_block16) if_block16.d();
    			if (if_block17) if_block17.d();
    			if (if_block18) if_block18.d();
    			if (if_block19) if_block19.d();
    			if (if_block20) if_block20.d();
    			/*div2_binding*/ ctx[13](null);
    			mounted = false;
    			run_all(dispose);
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
    	validate_slots("UX", slots, []);
    	let name = false;
    	let co = false;
    	let w = 200;
    	let wx = w;
    	let slide = 0;
    	let holder = false;
    	let total_slides = 19;
    	let h = window.location.hash.substring(1);

    	if (h !== "") {
    		slide = parseInt(h, 10);

    		if (slide > total_slides) {
    			slide = total_slides;
    		}

    		if (slide < 1) {
    			slide = 1;
    		}

    		slide = slide - 1;
    	}

    	let sz = "lg";

    	let ideation = [
    		{
    			lg: { x: 55, y: 50 },
    			md: { x: 55, y: 80 },
    			sm: { x: 90, y: 54 },
    			xs: { x: 55, y: 50 }
    		},
    		{
    			lg: {
    				x: 20, //0 print
    				y: 90
    			},
    			md: { x: 5, y: 83 },
    			sm: { x: 52, y: 56 },
    			xs: { x: 55, y: 50 }
    		},
    		{
    			lg: {
    				x: 25, //1 action completed
    				y: 80
    			},
    			md: { x: 7, y: 70 },
    			sm: { x: 65, y: 65 },
    			xs: { x: 55, y: 50 }
    		},
    		{
    			lg: {
    				x: 75, //2 status
    				y: 75
    			},
    			md: { x: 30, y: 68 },
    			sm: { x: 28, y: 57 },
    			xs: { x: 55, y: 50 }
    		},
    		{
    			lg: {
    				x: 30, //3 witness
    				y: 65
    			},
    			md: { x: 70, y: 60 },
    			sm: { x: 25, y: 70 },
    			xs: { x: 55, y: 50 }
    		},
    		{
    			lg: {
    				x: 35, //4 ML claim
    				y: 52
    			},
    			md: { x: 48, y: 35 },
    			sm: { x: 50, y: 59 },
    			xs: { x: 55, y: 50 }
    		},
    		{
    			lg: {
    				x: 40, //5 actions hover
    				y: 37
    			},
    			md: { x: 5, y: 55 },
    			sm: { x: 355, y: 50 },
    			xs: { x: 55, y: 50 }
    		},
    		{
    			lg: {
    				x: 54, //6 metsa button
    				y: 75
    			},
    			md: { x: 76, y: 75 },
    			sm: { x: 55, y: 1 },
    			xs: { x: 55, y: 50 }
    		},
    		{
    			lg: {
    				x: 35, //7 single page
    				y: 20
    			},
    			md: { x: 53, y: 20 },
    			sm: { x: 90, y: 8 },
    			xs: { x: 55, y: 50 }
    		},
    		{
    			lg: {
    				x: 5, //8 input shortcut
    				y: 25
    			},
    			md: { x: 5, y: 25 },
    			sm: { x: 5, y: 25 },
    			xs: { x: 55, y: 50 }
    		},
    		{
    			lg: {
    				x: 60, //9 figma
    				y: 43
    			},
    			md: { x: 75, y: 15 },
    			sm: { x: 58, y: 20 },
    			xs: { x: 55, y: 50 }
    		},
    		{
    			lg: {
    				x: 60, //10 color blind
    				y: 1
    			},
    			md: { x: 71, y: 32 },
    			sm: { x: 55, y: 28 },
    			xs: { x: 55, y: 50 }
    		},
    		{
    			lg: {
    				x: 73, //11 whatsapp
    				y: 27
    			},
    			md: { x: 87, y: 24 },
    			sm: { x: 75, y: 70 },
    			xs: { x: 55, y: 50 }
    		},
    		{
    			lg: {
    				x: 40, //12 gamification
    				y: 80
    			},
    			md: { x: 15, y: 90 },
    			sm: { x: 30, y: 85 },
    			xs: { x: 55, y: 50 }
    		},
    		{
    			lg: {
    				x: 10, //13 checklist
    				y: 67
    			},
    			md: { x: 51, y: 50 },
    			sm: { x: 5, y: 60 },
    			xs: { x: 55, y: 50 }
    		},
    		{
    			lg: {
    				x: 43, //14 whos involved
    				y: 7
    			},
    			md: { x: 55, y: 1 },
    			sm: { x: 48, y: 5 },
    			xs: { x: 55, y: 50 }
    		}
    	]; //15 tooltop

    	function next() {
    		if (slide < total_slides - 1) {
    			$$invalidate(2, wx = w);
    			$$invalidate(3, slide++, slide);
    			$$invalidate(4, holder.scrollTop = 0, holder);
    			window.location.hash = slide + 1;
    		}
    	}

    	function prev() {
    		if (slide >= 1) {
    			$$invalidate(2, wx = w * -1);
    			$$invalidate(3, slide--, slide);
    			$$invalidate(4, holder.scrollTop = 0, holder);
    			window.location.hash = slide + 1;
    		}
    	}

    	function handleKeydown(event) {
    		if (event.key == "ArrowRight") {
    			next();
    		}

    		if (event.key == "ArrowLeft") {
    			prev();
    		}

    		if (event.key == "r") {
    			$$invalidate(2, wx = w * -1);
    			$$invalidate(3, slide = 0);
    			$$invalidate(4, holder.scrollTop = 0, holder);
    			window.location.hash = slide + 1;
    		}
    	}

    	function handleResize() {
    		$$invalidate(12, w = window.innerWidth);
    	}

    	onMount(() => {
    		$$invalidate(12, w = window.innerWidth);
    		$$invalidate(2, wx = w);

    		//try to get dynamic params
    		//btoa('{"name":"Tom","co":"Keel"}');
    		let address = window.location.search;

    		let parameterList = new URLSearchParams(address);
    		let ref = parameterList.get("ref");

    		if (ref) {
    			try {
    				let obj = JSON.parse(atob(ref));
    				$$invalidate(1, co = obj.co);
    				$$invalidate(0, name = obj.name);
    			} catch(error) {
    				$$invalidate(1, co = false);
    				$$invalidate(0, name = false);
    			}
    		} else {
    			$$invalidate(1, co = false);
    			$$invalidate(0, name = false);
    		}
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<UX> was created with unknown prop '${key}'`);
    	});

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			holder = $$value;
    			$$invalidate(4, holder);
    		});
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		fade,
    		fly,
    		UXQR: UX_qr,
    		name,
    		co,
    		w,
    		wx,
    		slide,
    		holder,
    		total_slides,
    		h,
    		sz,
    		ideation,
    		next,
    		prev,
    		handleKeydown,
    		handleResize
    	});

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("co" in $$props) $$invalidate(1, co = $$props.co);
    		if ("w" in $$props) $$invalidate(12, w = $$props.w);
    		if ("wx" in $$props) $$invalidate(2, wx = $$props.wx);
    		if ("slide" in $$props) $$invalidate(3, slide = $$props.slide);
    		if ("holder" in $$props) $$invalidate(4, holder = $$props.holder);
    		if ("total_slides" in $$props) $$invalidate(6, total_slides = $$props.total_slides);
    		if ("h" in $$props) h = $$props.h;
    		if ("sz" in $$props) $$invalidate(5, sz = $$props.sz);
    		if ("ideation" in $$props) $$invalidate(7, ideation = $$props.ideation);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*w*/ 4096) {
    			{
    				if (w < 600) {
    					$$invalidate(5, sz = "xs");
    				} else if (w < 900) {
    					$$invalidate(5, sz = "sm");
    				} else if (w < 1400) {
    					$$invalidate(5, sz = "md");
    				} else {
    					$$invalidate(5, sz = "lg");
    				}
    			}
    		}
    	};

    	return [
    		name,
    		co,
    		wx,
    		slide,
    		holder,
    		sz,
    		total_slides,
    		ideation,
    		next,
    		prev,
    		handleKeydown,
    		handleResize,
    		w,
    		div2_binding
    	];
    }

    class UX extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "UX",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new UX({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=ux.js.map
