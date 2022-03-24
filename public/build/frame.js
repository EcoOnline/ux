
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
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
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function compute_slots(slots) {
        const result = {};
        for (const key in slots) {
            result[key] = true;
        }
        return result;
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
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function stop_propagation(fn) {
        return function (event) {
            event.stopPropagation();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function get_binding_group_value(group, __value, checked) {
        const value = new Set();
        for (let i = 0; i < group.length; i += 1) {
            if (group[i].checked)
                value.add(group[i].__value);
        }
        if (!checked) {
            value.delete(__value);
        }
        return Array.from(value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
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
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
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
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
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

    /* src/Frame_platform.svelte generated by Svelte v3.35.0 */

    const { console: console_1$7 } = globals;
    const file$u = "src/Frame_platform.svelte";

    function create_fragment$u(ctx) {
    	let h2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Platform...";
    			add_location(h2, file$u, 10, 0, 191);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$u.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$u($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Frame_platform", slots, []);

    	onMount(() => {
    		console.log("Platform not ready, re-directing to EHS");
    		window.location.hash = "#ehs";
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$7.warn(`<Frame_platform> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ onMount });
    	return [];
    }

    class Frame_platform extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$u, create_fragment$u, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Frame_platform",
    			options,
    			id: create_fragment$u.name
    		});
    	}
    }

    /* src/Frame_home.svelte generated by Svelte v3.35.0 */
    const file$t = "src/Frame_home.svelte";

    // (227:29) 
    function create_if_block_3$8(ctx) {
    	let h2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "My Tasks";
    			add_location(h2, file$t, 227, 8, 10717);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$8.name,
    		type: "if",
    		source: "(227:29) ",
    		ctx
    	});

    	return block;
    }

    // (225:31) 
    function create_if_block_2$e(ctx) {
    	let h2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Reports";
    			add_location(h2, file$t, 225, 8, 10662);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$e.name,
    		type: "if",
    		source: "(225:31) ",
    		ctx
    	});

    	return block;
    }

    // (223:34) 
    function create_if_block_1$h(ctx) {
    	let h2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Dashboards";
    			add_location(h2, file$t, 223, 8, 10602);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$h.name,
    		type: "if",
    		source: "(223:34) ",
    		ctx
    	});

    	return block;
    }

    // (36:4) {#if tab == 'home'}
    function create_if_block$n(ctx) {
    	let div63;
    	let div3;
    	let div2;
    	let div0;
    	let t0;
    	let b0;
    	let t2;
    	let div1;
    	let a0;
    	let t3;
    	let a1;
    	let t4;
    	let a2;
    	let t5;
    	let a3;
    	let t6;
    	let div7;
    	let div6;
    	let div4;
    	let t7;
    	let b1;
    	let t9;
    	let div5;
    	let a4;
    	let t10;
    	let a5;
    	let t11;
    	let div11;
    	let div10;
    	let div8;
    	let t12;
    	let b2;
    	let t14;
    	let div9;
    	let a6;
    	let t15;
    	let a7;
    	let t16;
    	let a8;
    	let t17;
    	let a9;
    	let t18;
    	let div15;
    	let div14;
    	let div12;
    	let t19;
    	let b3;
    	let t21;
    	let div13;
    	let a10;
    	let t22;
    	let a11;
    	let t23;
    	let a12;
    	let t24;
    	let a13;
    	let t25;
    	let div19;
    	let div18;
    	let div16;
    	let t26;
    	let b4;
    	let t28;
    	let div17;
    	let a14;
    	let t29;
    	let a15;
    	let t30;
    	let a16;
    	let t31;
    	let a17;
    	let t32;
    	let div23;
    	let div22;
    	let div20;
    	let t33;
    	let b5;
    	let t35;
    	let div21;
    	let a18;
    	let t36;
    	let a19;
    	let t37;
    	let a20;
    	let t38;
    	let div27;
    	let div26;
    	let div24;
    	let t39;
    	let b6;
    	let t41;
    	let div25;
    	let a21;
    	let t42;
    	let a22;
    	let t43;
    	let a23;
    	let t44;
    	let a24;
    	let t45;
    	let div31;
    	let div30;
    	let div28;
    	let t46;
    	let b7;
    	let t48;
    	let div29;
    	let a25;
    	let t49;
    	let a26;
    	let t50;
    	let a27;
    	let t51;
    	let a28;
    	let t52;
    	let div35;
    	let div34;
    	let div32;
    	let t53;
    	let b8;
    	let t55;
    	let div33;
    	let a29;
    	let t56;
    	let a30;
    	let t57;
    	let a31;
    	let t58;
    	let a32;
    	let t59;
    	let div39;
    	let div38;
    	let div36;
    	let t60;
    	let b9;
    	let t62;
    	let div37;
    	let a33;
    	let t63;
    	let a34;
    	let t64;
    	let a35;
    	let t65;
    	let a36;
    	let t66;
    	let div43;
    	let div42;
    	let div40;
    	let t67;
    	let b10;
    	let t69;
    	let div41;
    	let a37;
    	let t70;
    	let a38;
    	let t71;
    	let a39;
    	let t72;
    	let a40;
    	let t73;
    	let div47;
    	let div46;
    	let div44;
    	let t74;
    	let b11;
    	let t76;
    	let div45;
    	let a41;
    	let t77;
    	let a42;
    	let t78;
    	let a43;
    	let t79;
    	let a44;
    	let t80;
    	let div51;
    	let div50;
    	let div48;
    	let t81;
    	let b12;
    	let t83;
    	let div49;
    	let a45;
    	let t84;
    	let a46;
    	let t85;
    	let a47;
    	let t86;
    	let a48;
    	let t87;
    	let div55;
    	let div54;
    	let div52;
    	let t88;
    	let b13;
    	let t90;
    	let div53;
    	let a49;
    	let t91;
    	let a50;
    	let t92;
    	let a51;
    	let t93;
    	let a52;
    	let t94;
    	let div59;
    	let div58;
    	let div56;
    	let t95;
    	let b14;
    	let t97;
    	let div57;
    	let a53;
    	let t98;
    	let a54;
    	let t99;
    	let a55;
    	let t100;
    	let a56;
    	let t101;
    	let div62;
    	let div61;
    	let div60;
    	let t102;
    	let b15;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div63 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			t0 = space();
    			b0 = element("b");
    			b0.textContent = "Incidents";
    			t2 = space();
    			div1 = element("div");
    			a0 = element("a");
    			t3 = space();
    			a1 = element("a");
    			t4 = space();
    			a2 = element("a");
    			t5 = space();
    			a3 = element("a");
    			t6 = space();
    			div7 = element("div");
    			div6 = element("div");
    			div4 = element("div");
    			t7 = space();
    			b1 = element("b");
    			b1.textContent = "Actions";
    			t9 = space();
    			div5 = element("div");
    			a4 = element("a");
    			t10 = space();
    			a5 = element("a");
    			t11 = space();
    			div11 = element("div");
    			div10 = element("div");
    			div8 = element("div");
    			t12 = space();
    			b2 = element("b");
    			b2.textContent = "Audit & Inspection";
    			t14 = space();
    			div9 = element("div");
    			a6 = element("a");
    			t15 = space();
    			a7 = element("a");
    			t16 = space();
    			a8 = element("a");
    			t17 = space();
    			a9 = element("a");
    			t18 = space();
    			div15 = element("div");
    			div14 = element("div");
    			div12 = element("div");
    			t19 = space();
    			b3 = element("b");
    			b3.textContent = "Observation";
    			t21 = space();
    			div13 = element("div");
    			a10 = element("a");
    			t22 = space();
    			a11 = element("a");
    			t23 = space();
    			a12 = element("a");
    			t24 = space();
    			a13 = element("a");
    			t25 = space();
    			div19 = element("div");
    			div18 = element("div");
    			div16 = element("div");
    			t26 = space();
    			b4 = element("b");
    			b4.textContent = "Risk Assessment";
    			t28 = space();
    			div17 = element("div");
    			a14 = element("a");
    			t29 = space();
    			a15 = element("a");
    			t30 = space();
    			a16 = element("a");
    			t31 = space();
    			a17 = element("a");
    			t32 = space();
    			div23 = element("div");
    			div22 = element("div");
    			div20 = element("div");
    			t33 = space();
    			b5 = element("b");
    			b5.textContent = "Hazard Assessment";
    			t35 = space();
    			div21 = element("div");
    			a18 = element("a");
    			t36 = space();
    			a19 = element("a");
    			t37 = space();
    			a20 = element("a");
    			t38 = space();
    			div27 = element("div");
    			div26 = element("div");
    			div24 = element("div");
    			t39 = space();
    			b6 = element("b");
    			b6.textContent = "Scheduling";
    			t41 = space();
    			div25 = element("div");
    			a21 = element("a");
    			t42 = space();
    			a22 = element("a");
    			t43 = space();
    			a23 = element("a");
    			t44 = space();
    			a24 = element("a");
    			t45 = space();
    			div31 = element("div");
    			div30 = element("div");
    			div28 = element("div");
    			t46 = space();
    			b7 = element("b");
    			b7.textContent = "Environmental";
    			t48 = space();
    			div29 = element("div");
    			a25 = element("a");
    			t49 = space();
    			a26 = element("a");
    			t50 = space();
    			a27 = element("a");
    			t51 = space();
    			a28 = element("a");
    			t52 = space();
    			div35 = element("div");
    			div34 = element("div");
    			div32 = element("div");
    			t53 = space();
    			b8 = element("b");
    			b8.textContent = "Period Statistics";
    			t55 = space();
    			div33 = element("div");
    			a29 = element("a");
    			t56 = space();
    			a30 = element("a");
    			t57 = space();
    			a31 = element("a");
    			t58 = space();
    			a32 = element("a");
    			t59 = space();
    			div39 = element("div");
    			div38 = element("div");
    			div36 = element("div");
    			t60 = space();
    			b9 = element("b");
    			b9.textContent = "Register";
    			t62 = space();
    			div37 = element("div");
    			a33 = element("a");
    			t63 = space();
    			a34 = element("a");
    			t64 = space();
    			a35 = element("a");
    			t65 = space();
    			a36 = element("a");
    			t66 = space();
    			div43 = element("div");
    			div42 = element("div");
    			div40 = element("div");
    			t67 = space();
    			b10 = element("b");
    			b10.textContent = "Adavanced RCA";
    			t69 = space();
    			div41 = element("div");
    			a37 = element("a");
    			t70 = space();
    			a38 = element("a");
    			t71 = space();
    			a39 = element("a");
    			t72 = space();
    			a40 = element("a");
    			t73 = space();
    			div47 = element("div");
    			div46 = element("div");
    			div44 = element("div");
    			t74 = space();
    			b11 = element("b");
    			b11.textContent = "Document";
    			t76 = space();
    			div45 = element("div");
    			a41 = element("a");
    			t77 = space();
    			a42 = element("a");
    			t78 = space();
    			a43 = element("a");
    			t79 = space();
    			a44 = element("a");
    			t80 = space();
    			div51 = element("div");
    			div50 = element("div");
    			div48 = element("div");
    			t81 = space();
    			b12 = element("b");
    			b12.textContent = "COVID-19 Tracker";
    			t83 = space();
    			div49 = element("div");
    			a45 = element("a");
    			t84 = space();
    			a46 = element("a");
    			t85 = space();
    			a47 = element("a");
    			t86 = space();
    			a48 = element("a");
    			t87 = space();
    			div55 = element("div");
    			div54 = element("div");
    			div52 = element("div");
    			t88 = space();
    			b13 = element("b");
    			b13.textContent = "Point of Work";
    			t90 = space();
    			div53 = element("div");
    			a49 = element("a");
    			t91 = space();
    			a50 = element("a");
    			t92 = space();
    			a51 = element("a");
    			t93 = space();
    			a52 = element("a");
    			t94 = space();
    			div59 = element("div");
    			div58 = element("div");
    			div56 = element("div");
    			t95 = space();
    			b14 = element("b");
    			b14.textContent = "Lost Time";
    			t97 = space();
    			div57 = element("div");
    			a53 = element("a");
    			t98 = space();
    			a54 = element("a");
    			t99 = space();
    			a55 = element("a");
    			t100 = space();
    			a56 = element("a");
    			t101 = space();
    			div62 = element("div");
    			div61 = element("div");
    			div60 = element("div");
    			t102 = space();
    			b15 = element("b");
    			b15.textContent = "Administration";
    			attr_dev(div0, "class", "icon");
    			set_style(div0, "background-image", "url(./images/ehs_svgs_clean/incidents.svg)");
    			add_location(div0, file$t, 39, 20, 1175);
    			add_location(b0, file$t, 40, 20, 1288);
    			attr_dev(a0, "href", "#ehs/incidents/incidents_new");
    			attr_dev(a0, "class", "add");
    			add_location(a0, file$t, 42, 24, 1369);
    			attr_dev(a1, "href", "#ehs/incidents/queries_new");
    			attr_dev(a1, "class", "filter");
    			add_location(a1, file$t, 43, 24, 1509);
    			attr_dev(a2, "href", "#ehs/incidents/summary");
    			attr_dev(a2, "class", "summary");
    			add_location(a2, file$t, 44, 24, 1648);
    			attr_dev(a3, "href", "#ehs/incidents/incidents_admin");
    			attr_dev(a3, "class", "tool");
    			add_location(a3, file$t, 45, 24, 1790);
    			attr_dev(div1, "class", "tools");
    			add_location(div1, file$t, 41, 20, 1325);
    			attr_dev(div2, "class", "tile");
    			add_location(div2, file$t, 38, 16, 1044);
    			attr_dev(div3, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div3, file$t, 37, 12, 982);
    			attr_dev(div4, "class", "icon");
    			set_style(div4, "background-image", "url(./images/ehs_svgs_clean/actions.svg)");
    			add_location(div4, file$t, 51, 20, 2088);
    			add_location(b1, file$t, 52, 20, 2199);
    			attr_dev(a4, "href", "#incidents/incidents_new");
    			attr_dev(a4, "class", "add");
    			add_location(a4, file$t, 54, 24, 2278);
    			attr_dev(a5, "href", "queries_new");
    			attr_dev(a5, "class", "filter");
    			add_location(a5, file$t, 55, 24, 2355);
    			attr_dev(div5, "class", "tools");
    			add_location(div5, file$t, 53, 20, 2234);
    			attr_dev(div6, "class", "tile");
    			add_location(div6, file$t, 50, 16, 2049);
    			attr_dev(div7, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div7, file$t, 49, 12, 1987);
    			attr_dev(div8, "class", "icon");
    			set_style(div8, "background-image", "url(./images/ehs_svgs_clean/audits.svg)");
    			add_location(div8, file$t, 61, 20, 2580);
    			add_location(b2, file$t, 62, 20, 2690);
    			attr_dev(a6, "href", "./");
    			attr_dev(a6, "class", "add");
    			add_location(a6, file$t, 64, 24, 2780);
    			attr_dev(a7, "href", "./");
    			attr_dev(a7, "class", "filter");
    			add_location(a7, file$t, 65, 24, 2835);
    			attr_dev(a8, "href", "./");
    			attr_dev(a8, "class", "summary");
    			add_location(a8, file$t, 66, 24, 2893);
    			attr_dev(a9, "href", "./");
    			attr_dev(a9, "class", "tool");
    			add_location(a9, file$t, 67, 24, 2952);
    			attr_dev(div9, "class", "tools");
    			add_location(div9, file$t, 63, 20, 2736);
    			attr_dev(div10, "class", "tile");
    			add_location(div10, file$t, 60, 16, 2541);
    			attr_dev(div11, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div11, file$t, 59, 12, 2479);
    			attr_dev(div12, "class", "icon");
    			set_style(div12, "background-image", "url(./images/ehs_svgs_clean/observations.svg)");
    			add_location(div12, file$t, 73, 20, 3166);
    			add_location(b3, file$t, 74, 20, 3282);
    			attr_dev(a10, "href", "./");
    			attr_dev(a10, "class", "add");
    			add_location(a10, file$t, 76, 24, 3365);
    			attr_dev(a11, "href", "./");
    			attr_dev(a11, "class", "filter");
    			add_location(a11, file$t, 77, 24, 3420);
    			attr_dev(a12, "href", "./");
    			attr_dev(a12, "class", "summary");
    			add_location(a12, file$t, 78, 24, 3478);
    			attr_dev(a13, "href", "./");
    			attr_dev(a13, "class", "tool");
    			add_location(a13, file$t, 79, 24, 3537);
    			attr_dev(div13, "class", "tools");
    			add_location(div13, file$t, 75, 20, 3321);
    			attr_dev(div14, "class", "tile");
    			add_location(div14, file$t, 72, 16, 3127);
    			attr_dev(div15, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div15, file$t, 71, 12, 3065);
    			attr_dev(div16, "class", "icon");
    			set_style(div16, "background-image", "url(./images/ehs_svgs_clean/risk_assessment.svg)");
    			add_location(div16, file$t, 85, 20, 3751);
    			add_location(b4, file$t, 86, 20, 3870);
    			attr_dev(a14, "href", "./");
    			attr_dev(a14, "class", "add");
    			add_location(a14, file$t, 88, 24, 3957);
    			attr_dev(a15, "href", "./");
    			attr_dev(a15, "class", "filter");
    			add_location(a15, file$t, 89, 24, 4012);
    			attr_dev(a16, "href", "./");
    			attr_dev(a16, "class", "summary");
    			add_location(a16, file$t, 90, 24, 4070);
    			attr_dev(a17, "href", "./");
    			attr_dev(a17, "class", "tool");
    			add_location(a17, file$t, 91, 24, 4129);
    			attr_dev(div17, "class", "tools");
    			add_location(div17, file$t, 87, 20, 3913);
    			attr_dev(div18, "class", "tile");
    			add_location(div18, file$t, 84, 16, 3712);
    			attr_dev(div19, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div19, file$t, 83, 12, 3650);
    			attr_dev(div20, "class", "icon");
    			set_style(div20, "background-image", "url(./images/ehs_svgs_clean/hazard_assessment.svg)");
    			add_location(div20, file$t, 97, 20, 4453);
    			add_location(b5, file$t, 98, 20, 4574);
    			attr_dev(a18, "href", "./");
    			attr_dev(a18, "class", "add");
    			add_location(a18, file$t, 100, 24, 4663);
    			attr_dev(a19, "href", "./");
    			attr_dev(a19, "class", "filter");
    			add_location(a19, file$t, 101, 24, 4718);
    			attr_dev(a20, "href", "./");
    			attr_dev(a20, "class", "tool");
    			add_location(a20, file$t, 102, 24, 4776);
    			attr_dev(div21, "class", "tools");
    			add_location(div21, file$t, 99, 20, 4619);
    			attr_dev(div22, "class", "tile");
    			add_location(div22, file$t, 96, 16, 4304);
    			attr_dev(div23, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div23, file$t, 95, 12, 4242);
    			attr_dev(div24, "class", "icon");
    			set_style(div24, "background-image", "url(./images/ehs_svgs_clean/scheduling.svg)");
    			add_location(div24, file$t, 108, 20, 4990);
    			add_location(b6, file$t, 109, 20, 5104);
    			attr_dev(a21, "href", "./");
    			attr_dev(a21, "class", "add");
    			add_location(a21, file$t, 111, 24, 5186);
    			attr_dev(a22, "href", "./");
    			attr_dev(a22, "class", "filter");
    			add_location(a22, file$t, 112, 24, 5241);
    			attr_dev(a23, "href", "./");
    			attr_dev(a23, "class", "summary");
    			add_location(a23, file$t, 113, 24, 5299);
    			attr_dev(a24, "href", "./");
    			attr_dev(a24, "class", "tool");
    			add_location(a24, file$t, 114, 24, 5358);
    			attr_dev(div25, "class", "tools");
    			add_location(div25, file$t, 110, 20, 5142);
    			attr_dev(div26, "class", "tile");
    			add_location(div26, file$t, 107, 16, 4951);
    			attr_dev(div27, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div27, file$t, 106, 12, 4889);
    			attr_dev(div28, "class", "icon");
    			set_style(div28, "background-image", "url(./images/ehs_svgs_clean/epr.svg)");
    			add_location(div28, file$t, 120, 20, 5572);
    			add_location(b7, file$t, 121, 20, 5679);
    			attr_dev(a25, "href", "./");
    			attr_dev(a25, "class", "add");
    			add_location(a25, file$t, 123, 24, 5764);
    			attr_dev(a26, "href", "./");
    			attr_dev(a26, "class", "filter");
    			add_location(a26, file$t, 124, 24, 5819);
    			attr_dev(a27, "href", "./");
    			attr_dev(a27, "class", "summary");
    			add_location(a27, file$t, 125, 24, 5877);
    			attr_dev(a28, "href", "./");
    			attr_dev(a28, "class", "tool");
    			add_location(a28, file$t, 126, 24, 5936);
    			attr_dev(div29, "class", "tools");
    			add_location(div29, file$t, 122, 20, 5720);
    			attr_dev(div30, "class", "tile");
    			add_location(div30, file$t, 119, 16, 5533);
    			attr_dev(div31, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div31, file$t, 118, 12, 5471);
    			attr_dev(div32, "class", "icon");
    			set_style(div32, "background-image", "url(./images/ehs_svgs_clean/period_statistics.svg)");
    			add_location(div32, file$t, 132, 20, 6150);
    			add_location(b8, file$t, 133, 20, 6271);
    			attr_dev(a29, "href", "./");
    			attr_dev(a29, "class", "add");
    			add_location(a29, file$t, 135, 24, 6360);
    			attr_dev(a30, "href", "./");
    			attr_dev(a30, "class", "filter");
    			add_location(a30, file$t, 136, 24, 6415);
    			attr_dev(a31, "href", "./");
    			attr_dev(a31, "class", "summary");
    			add_location(a31, file$t, 137, 24, 6473);
    			attr_dev(a32, "href", "./");
    			attr_dev(a32, "class", "tool");
    			add_location(a32, file$t, 138, 24, 6532);
    			attr_dev(div33, "class", "tools");
    			add_location(div33, file$t, 134, 20, 6316);
    			attr_dev(div34, "class", "tile");
    			add_location(div34, file$t, 131, 16, 6111);
    			attr_dev(div35, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div35, file$t, 130, 12, 6049);
    			attr_dev(div36, "class", "icon");
    			set_style(div36, "background-image", "url(./images/ehs_svgs_clean/register.svg)");
    			add_location(div36, file$t, 144, 20, 6746);
    			add_location(b9, file$t, 145, 20, 6858);
    			attr_dev(a33, "href", "./");
    			attr_dev(a33, "class", "add");
    			add_location(a33, file$t, 147, 24, 6938);
    			attr_dev(a34, "href", "./");
    			attr_dev(a34, "class", "filter");
    			add_location(a34, file$t, 148, 24, 6993);
    			attr_dev(a35, "href", "./");
    			attr_dev(a35, "class", "summary");
    			add_location(a35, file$t, 149, 24, 7051);
    			attr_dev(a36, "href", "./");
    			attr_dev(a36, "class", "tool");
    			add_location(a36, file$t, 150, 24, 7110);
    			attr_dev(div37, "class", "tools");
    			add_location(div37, file$t, 146, 20, 6894);
    			attr_dev(div38, "class", "tile");
    			add_location(div38, file$t, 143, 16, 6707);
    			attr_dev(div39, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div39, file$t, 142, 12, 6645);
    			attr_dev(div40, "class", "icon");
    			set_style(div40, "background-image", "url(./images/ehs_svgs_clean/advanced_rca.svg)");
    			add_location(div40, file$t, 156, 20, 7324);
    			add_location(b10, file$t, 157, 20, 7440);
    			attr_dev(a37, "href", "./");
    			attr_dev(a37, "class", "add");
    			add_location(a37, file$t, 159, 24, 7525);
    			attr_dev(a38, "href", "./");
    			attr_dev(a38, "class", "filter");
    			add_location(a38, file$t, 160, 24, 7580);
    			attr_dev(a39, "href", "./");
    			attr_dev(a39, "class", "summary");
    			add_location(a39, file$t, 161, 24, 7638);
    			attr_dev(a40, "href", "./");
    			attr_dev(a40, "class", "tool");
    			add_location(a40, file$t, 162, 24, 7697);
    			attr_dev(div41, "class", "tools");
    			add_location(div41, file$t, 158, 20, 7481);
    			attr_dev(div42, "class", "tile");
    			add_location(div42, file$t, 155, 16, 7285);
    			attr_dev(div43, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div43, file$t, 154, 12, 7223);
    			attr_dev(div44, "class", "icon");
    			set_style(div44, "background-image", "url(./images/ehs_svgs_clean/documents.svg)");
    			add_location(div44, file$t, 168, 20, 7911);
    			add_location(b11, file$t, 169, 20, 8024);
    			attr_dev(a41, "href", "./");
    			attr_dev(a41, "class", "add");
    			add_location(a41, file$t, 171, 24, 8104);
    			attr_dev(a42, "href", "./");
    			attr_dev(a42, "class", "filter");
    			add_location(a42, file$t, 172, 24, 8159);
    			attr_dev(a43, "href", "./");
    			attr_dev(a43, "class", "summary");
    			add_location(a43, file$t, 173, 24, 8217);
    			attr_dev(a44, "href", "./");
    			attr_dev(a44, "class", "tool");
    			add_location(a44, file$t, 174, 24, 8276);
    			attr_dev(div45, "class", "tools");
    			add_location(div45, file$t, 170, 20, 8060);
    			attr_dev(div46, "class", "tile");
    			add_location(div46, file$t, 167, 16, 7872);
    			attr_dev(div47, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div47, file$t, 166, 12, 7810);
    			attr_dev(div48, "class", "icon");
    			set_style(div48, "background-image", "url(./images/ehs_svgs_clean/tracker.svg)");
    			add_location(div48, file$t, 180, 20, 8490);
    			add_location(b12, file$t, 181, 20, 8601);
    			attr_dev(a45, "href", "./");
    			attr_dev(a45, "class", "add");
    			add_location(a45, file$t, 183, 24, 8689);
    			attr_dev(a46, "href", "./");
    			attr_dev(a46, "class", "filter");
    			add_location(a46, file$t, 184, 24, 8744);
    			attr_dev(a47, "href", "./");
    			attr_dev(a47, "class", "summary");
    			add_location(a47, file$t, 185, 24, 8802);
    			attr_dev(a48, "href", "./");
    			attr_dev(a48, "class", "tool");
    			add_location(a48, file$t, 186, 24, 8861);
    			attr_dev(div49, "class", "tools");
    			add_location(div49, file$t, 182, 20, 8645);
    			attr_dev(div50, "class", "tile");
    			add_location(div50, file$t, 179, 16, 8451);
    			attr_dev(div51, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div51, file$t, 178, 12, 8389);
    			attr_dev(div52, "class", "icon");
    			set_style(div52, "background-image", "url(./images/ehs_svgs_clean/pow_ra.svg)");
    			add_location(div52, file$t, 192, 20, 9075);
    			add_location(b13, file$t, 193, 20, 9185);
    			attr_dev(a49, "href", "./");
    			attr_dev(a49, "class", "add");
    			add_location(a49, file$t, 195, 24, 9270);
    			attr_dev(a50, "href", "./");
    			attr_dev(a50, "class", "filter");
    			add_location(a50, file$t, 196, 24, 9325);
    			attr_dev(a51, "href", "./");
    			attr_dev(a51, "class", "summary");
    			add_location(a51, file$t, 197, 24, 9383);
    			attr_dev(a52, "href", "./");
    			attr_dev(a52, "class", "tool");
    			add_location(a52, file$t, 198, 24, 9442);
    			attr_dev(div53, "class", "tools");
    			add_location(div53, file$t, 194, 20, 9226);
    			attr_dev(div54, "class", "tile");
    			add_location(div54, file$t, 191, 16, 9036);
    			attr_dev(div55, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div55, file$t, 190, 12, 8974);
    			attr_dev(div56, "class", "icon");
    			set_style(div56, "background-image", "url(./images/ehs_svgs_clean/lost_time.svg)");
    			add_location(div56, file$t, 204, 20, 9656);
    			add_location(b14, file$t, 205, 20, 9769);
    			attr_dev(a53, "href", "./");
    			attr_dev(a53, "class", "add");
    			add_location(a53, file$t, 207, 24, 9850);
    			attr_dev(a54, "href", "./");
    			attr_dev(a54, "class", "filter");
    			add_location(a54, file$t, 208, 24, 9905);
    			attr_dev(a55, "href", "./");
    			attr_dev(a55, "class", "summary");
    			add_location(a55, file$t, 209, 24, 9963);
    			attr_dev(a56, "href", "./");
    			attr_dev(a56, "class", "tool");
    			add_location(a56, file$t, 210, 24, 10022);
    			attr_dev(div57, "class", "tools");
    			add_location(div57, file$t, 206, 20, 9806);
    			attr_dev(div58, "class", "tile");
    			add_location(div58, file$t, 203, 16, 9617);
    			attr_dev(div59, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div59, file$t, 202, 12, 9555);
    			attr_dev(div60, "class", "icon");
    			set_style(div60, "background-image", "url(./images/ehs_svgs_clean/administration.svg)");
    			add_location(div60, file$t, 216, 20, 10349);
    			add_location(b15, file$t, 217, 20, 10467);
    			attr_dev(div61, "class", "tile");
    			add_location(div61, file$t, 215, 16, 10197);
    			attr_dev(div62, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div62, file$t, 214, 12, 10135);
    			attr_dev(div63, "class", "row");
    			add_location(div63, file$t, 36, 8, 952);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div63, anchor);
    			append_dev(div63, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div2, t0);
    			append_dev(div2, b0);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, a0);
    			append_dev(div1, t3);
    			append_dev(div1, a1);
    			append_dev(div1, t4);
    			append_dev(div1, a2);
    			append_dev(div1, t5);
    			append_dev(div1, a3);
    			append_dev(div63, t6);
    			append_dev(div63, div7);
    			append_dev(div7, div6);
    			append_dev(div6, div4);
    			append_dev(div6, t7);
    			append_dev(div6, b1);
    			append_dev(div6, t9);
    			append_dev(div6, div5);
    			append_dev(div5, a4);
    			append_dev(div5, t10);
    			append_dev(div5, a5);
    			append_dev(div63, t11);
    			append_dev(div63, div11);
    			append_dev(div11, div10);
    			append_dev(div10, div8);
    			append_dev(div10, t12);
    			append_dev(div10, b2);
    			append_dev(div10, t14);
    			append_dev(div10, div9);
    			append_dev(div9, a6);
    			append_dev(div9, t15);
    			append_dev(div9, a7);
    			append_dev(div9, t16);
    			append_dev(div9, a8);
    			append_dev(div9, t17);
    			append_dev(div9, a9);
    			append_dev(div63, t18);
    			append_dev(div63, div15);
    			append_dev(div15, div14);
    			append_dev(div14, div12);
    			append_dev(div14, t19);
    			append_dev(div14, b3);
    			append_dev(div14, t21);
    			append_dev(div14, div13);
    			append_dev(div13, a10);
    			append_dev(div13, t22);
    			append_dev(div13, a11);
    			append_dev(div13, t23);
    			append_dev(div13, a12);
    			append_dev(div13, t24);
    			append_dev(div13, a13);
    			append_dev(div63, t25);
    			append_dev(div63, div19);
    			append_dev(div19, div18);
    			append_dev(div18, div16);
    			append_dev(div18, t26);
    			append_dev(div18, b4);
    			append_dev(div18, t28);
    			append_dev(div18, div17);
    			append_dev(div17, a14);
    			append_dev(div17, t29);
    			append_dev(div17, a15);
    			append_dev(div17, t30);
    			append_dev(div17, a16);
    			append_dev(div17, t31);
    			append_dev(div17, a17);
    			append_dev(div63, t32);
    			append_dev(div63, div23);
    			append_dev(div23, div22);
    			append_dev(div22, div20);
    			append_dev(div22, t33);
    			append_dev(div22, b5);
    			append_dev(div22, t35);
    			append_dev(div22, div21);
    			append_dev(div21, a18);
    			append_dev(div21, t36);
    			append_dev(div21, a19);
    			append_dev(div21, t37);
    			append_dev(div21, a20);
    			append_dev(div63, t38);
    			append_dev(div63, div27);
    			append_dev(div27, div26);
    			append_dev(div26, div24);
    			append_dev(div26, t39);
    			append_dev(div26, b6);
    			append_dev(div26, t41);
    			append_dev(div26, div25);
    			append_dev(div25, a21);
    			append_dev(div25, t42);
    			append_dev(div25, a22);
    			append_dev(div25, t43);
    			append_dev(div25, a23);
    			append_dev(div25, t44);
    			append_dev(div25, a24);
    			append_dev(div63, t45);
    			append_dev(div63, div31);
    			append_dev(div31, div30);
    			append_dev(div30, div28);
    			append_dev(div30, t46);
    			append_dev(div30, b7);
    			append_dev(div30, t48);
    			append_dev(div30, div29);
    			append_dev(div29, a25);
    			append_dev(div29, t49);
    			append_dev(div29, a26);
    			append_dev(div29, t50);
    			append_dev(div29, a27);
    			append_dev(div29, t51);
    			append_dev(div29, a28);
    			append_dev(div63, t52);
    			append_dev(div63, div35);
    			append_dev(div35, div34);
    			append_dev(div34, div32);
    			append_dev(div34, t53);
    			append_dev(div34, b8);
    			append_dev(div34, t55);
    			append_dev(div34, div33);
    			append_dev(div33, a29);
    			append_dev(div33, t56);
    			append_dev(div33, a30);
    			append_dev(div33, t57);
    			append_dev(div33, a31);
    			append_dev(div33, t58);
    			append_dev(div33, a32);
    			append_dev(div63, t59);
    			append_dev(div63, div39);
    			append_dev(div39, div38);
    			append_dev(div38, div36);
    			append_dev(div38, t60);
    			append_dev(div38, b9);
    			append_dev(div38, t62);
    			append_dev(div38, div37);
    			append_dev(div37, a33);
    			append_dev(div37, t63);
    			append_dev(div37, a34);
    			append_dev(div37, t64);
    			append_dev(div37, a35);
    			append_dev(div37, t65);
    			append_dev(div37, a36);
    			append_dev(div63, t66);
    			append_dev(div63, div43);
    			append_dev(div43, div42);
    			append_dev(div42, div40);
    			append_dev(div42, t67);
    			append_dev(div42, b10);
    			append_dev(div42, t69);
    			append_dev(div42, div41);
    			append_dev(div41, a37);
    			append_dev(div41, t70);
    			append_dev(div41, a38);
    			append_dev(div41, t71);
    			append_dev(div41, a39);
    			append_dev(div41, t72);
    			append_dev(div41, a40);
    			append_dev(div63, t73);
    			append_dev(div63, div47);
    			append_dev(div47, div46);
    			append_dev(div46, div44);
    			append_dev(div46, t74);
    			append_dev(div46, b11);
    			append_dev(div46, t76);
    			append_dev(div46, div45);
    			append_dev(div45, a41);
    			append_dev(div45, t77);
    			append_dev(div45, a42);
    			append_dev(div45, t78);
    			append_dev(div45, a43);
    			append_dev(div45, t79);
    			append_dev(div45, a44);
    			append_dev(div63, t80);
    			append_dev(div63, div51);
    			append_dev(div51, div50);
    			append_dev(div50, div48);
    			append_dev(div50, t81);
    			append_dev(div50, b12);
    			append_dev(div50, t83);
    			append_dev(div50, div49);
    			append_dev(div49, a45);
    			append_dev(div49, t84);
    			append_dev(div49, a46);
    			append_dev(div49, t85);
    			append_dev(div49, a47);
    			append_dev(div49, t86);
    			append_dev(div49, a48);
    			append_dev(div63, t87);
    			append_dev(div63, div55);
    			append_dev(div55, div54);
    			append_dev(div54, div52);
    			append_dev(div54, t88);
    			append_dev(div54, b13);
    			append_dev(div54, t90);
    			append_dev(div54, div53);
    			append_dev(div53, a49);
    			append_dev(div53, t91);
    			append_dev(div53, a50);
    			append_dev(div53, t92);
    			append_dev(div53, a51);
    			append_dev(div53, t93);
    			append_dev(div53, a52);
    			append_dev(div63, t94);
    			append_dev(div63, div59);
    			append_dev(div59, div58);
    			append_dev(div58, div56);
    			append_dev(div58, t95);
    			append_dev(div58, b14);
    			append_dev(div58, t97);
    			append_dev(div58, div57);
    			append_dev(div57, a53);
    			append_dev(div57, t98);
    			append_dev(div57, a54);
    			append_dev(div57, t99);
    			append_dev(div57, a55);
    			append_dev(div57, t100);
    			append_dev(div57, a56);
    			append_dev(div63, t101);
    			append_dev(div63, div62);
    			append_dev(div62, div61);
    			append_dev(div61, div60);
    			append_dev(div61, t102);
    			append_dev(div61, b15);

    			if (!mounted) {
    				dispose = [
    					listen_dev(a0, "click", stop_propagation(/*click_handler*/ ctx[3]), false, false, true),
    					listen_dev(a1, "click", stop_propagation(/*click_handler_1*/ ctx[4]), false, false, true),
    					listen_dev(a2, "click", stop_propagation(/*click_handler_2*/ ctx[5]), false, false, true),
    					listen_dev(a3, "click", /*click_handler_3*/ ctx[6], false, false, false),
    					listen_dev(div2, "click", prevent_default(/*click_handler_4*/ ctx[7]), false, true, false),
    					listen_dev(div22, "click", prevent_default(/*click_handler_5*/ ctx[8]), false, true, false),
    					listen_dev(div61, "click", prevent_default(/*click_handler_6*/ ctx[9]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div63);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$n.name,
    		type: "if",
    		source: "(36:4) {#if tab == 'home'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$t(ctx) {
    	let div1;
    	let div0;
    	let ul0;
    	let li0;
    	let a0;
    	let t1;
    	let li1;
    	let t3;
    	let ul1;
    	let li2;
    	let a1;
    	let t5;
    	let li3;
    	let a2;
    	let t7;
    	let li4;
    	let a3;
    	let t9;
    	let li5;
    	let a4;
    	let t11;
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*tab*/ ctx[0] == "home") return create_if_block$n;
    		if (/*tab*/ ctx[0] == "dashboards") return create_if_block_1$h;
    		if (/*tab*/ ctx[0] == "reports") return create_if_block_2$e;
    		if (/*tab*/ ctx[0] == "tasks") return create_if_block_3$8;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			ul0 = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			a0.textContent = "EcoOnline";
    			t1 = space();
    			li1 = element("li");
    			li1.textContent = "EHS";
    			t3 = space();
    			ul1 = element("ul");
    			li2 = element("li");
    			a1 = element("a");
    			a1.textContent = "Home";
    			t5 = space();
    			li3 = element("li");
    			a2 = element("a");
    			a2.textContent = "Dashboards";
    			t7 = space();
    			li4 = element("li");
    			a3 = element("a");
    			a3.textContent = "Reports";
    			t9 = space();
    			li5 = element("li");
    			a4 = element("a");
    			a4.textContent = "My Tasks";
    			t11 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(a0, "href", "#platform");
    			add_location(a0, file$t, 20, 20, 425);
    			add_location(li0, file$t, 20, 16, 421);
    			add_location(li1, file$t, 21, 16, 480);
    			attr_dev(ul0, "class", "breadcrumb");
    			add_location(ul0, file$t, 19, 12, 381);
    			attr_dev(div0, "class", "col12");
    			add_location(div0, file$t, 18, 8, 349);
    			attr_dev(div1, "class", "row sticky");
    			add_location(div1, file$t, 17, 4, 316);
    			attr_dev(a1, "href", "#ehs");
    			toggle_class(a1, "active", /*tab*/ ctx[0] == "home");
    			add_location(a1, file$t, 29, 12, 585);
    			add_location(li2, file$t, 29, 8, 581);
    			attr_dev(a2, "href", "#ehs/dashboards");
    			toggle_class(a2, "active", /*tab*/ ctx[0] == "dashboards");
    			add_location(a2, file$t, 30, 12, 657);
    			add_location(li3, file$t, 30, 8, 653);
    			attr_dev(a3, "href", "#ehs/reports");
    			toggle_class(a3, "active", /*tab*/ ctx[0] == "reports");
    			add_location(a3, file$t, 31, 12, 752);
    			add_location(li4, file$t, 31, 8, 748);
    			attr_dev(a4, "href", "#ehs/tasks");
    			toggle_class(a4, "active", /*tab*/ ctx[0] == "tasks");
    			add_location(a4, file$t, 32, 12, 838);
    			add_location(li5, file$t, 32, 8, 834);
    			attr_dev(ul1, "class", "tabs");
    			add_location(ul1, file$t, 28, 4, 555);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, ul0);
    			append_dev(ul0, li0);
    			append_dev(li0, a0);
    			append_dev(ul0, t1);
    			append_dev(ul0, li1);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, ul1, anchor);
    			append_dev(ul1, li2);
    			append_dev(li2, a1);
    			append_dev(ul1, t5);
    			append_dev(ul1, li3);
    			append_dev(li3, a2);
    			append_dev(ul1, t7);
    			append_dev(ul1, li4);
    			append_dev(li4, a3);
    			append_dev(ul1, t9);
    			append_dev(ul1, li5);
    			append_dev(li5, a4);
    			insert_dev(target, t11, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*tab*/ 1) {
    				toggle_class(a1, "active", /*tab*/ ctx[0] == "home");
    			}

    			if (dirty & /*tab*/ 1) {
    				toggle_class(a2, "active", /*tab*/ ctx[0] == "dashboards");
    			}

    			if (dirty & /*tab*/ 1) {
    				toggle_class(a3, "active", /*tab*/ ctx[0] == "reports");
    			}

    			if (dirty & /*tab*/ 1) {
    				toggle_class(a4, "active", /*tab*/ ctx[0] == "tasks");
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(ul1);
    			if (detaching) detach_dev(t11);

    			if (if_block) {
    				if_block.d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$t.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$t($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Frame_home", slots, []);
    	const dispatch = createEventDispatcher();

    	function nav(str) {
    		dispatch("nav", { text: str });
    	}

    	let tab = "home";
    	let { tabnav = "" } = $$props;
    	const writable_props = ["tabnav"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Frame_home> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		nav("incidents_new");
    	};

    	const click_handler_1 = () => {
    		nav("queries_new");
    	};

    	const click_handler_2 = () => {
    		nav("incidents/summary");
    	};

    	const click_handler_3 = () => {
    		nav("incidents/incidents_admin");
    	};

    	const click_handler_4 = () => {
    		nav("incidents");
    		window.location.hash = "#ehs/incidents";
    	};

    	const click_handler_5 = () => {
    		nav("hazard_assessments");
    		window.location.hash = "#ehs/hazard_assessments";
    	};

    	const click_handler_6 = () => {
    		nav("linkedfields");
    		window.location.hash = "#ehs/administration/linkedfields";
    	};

    	$$self.$$set = $$props => {
    		if ("tabnav" in $$props) $$invalidate(2, tabnav = $$props.tabnav);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		nav,
    		tab,
    		tabnav
    	});

    	$$self.$inject_state = $$props => {
    		if ("tab" in $$props) $$invalidate(0, tab = $$props.tab);
    		if ("tabnav" in $$props) $$invalidate(2, tabnav = $$props.tabnav);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*tabnav*/ 4) {
    			{
    				let t = tabnav;
    				$$invalidate(0, tab = t == "" ? "home" : t);
    			}
    		}
    	};

    	return [
    		tab,
    		nav,
    		tabnav,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5,
    		click_handler_6
    	];
    }

    class Frame_home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$t, create_fragment$t, safe_not_equal, { tabnav: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Frame_home",
    			options,
    			id: create_fragment$t.name
    		});
    	}

    	get tabnav() {
    		throw new Error("<Frame_home>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tabnav(value) {
    		throw new Error("<Frame_home>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /**
     * MIT License
     *
     * Copyright (c) 2018 Fabvalaaah - fabvalaaah@laposte.net
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
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
     * DISCLAIMER:
     * I am not responsible in any way of any consequence of the usage of this piece
     * of software. You are warned, use it at your own risks.
     */

    const initMatrix = (s1, s2) => {
      /* istanbul ignore next */
      if (undefined == s1 || undefined == s2) {
        return null;
      }

      let d = [];
      for (let i = 0; i <= s1.length; i++) {
        d[i] = [];
        d[i][0] = i;
      }
      for (let j = 0; j <= s2.length; j++) {
        d[0][j] = j;
      }

      return d;
    };

    const damerau = (i, j, s1, s2, d, cost) => {
      if (i > 1 && j > 1 && s1[i - 1] === s2[j - 2] && s1[i - 2] === s2[j - 1]) {
        d[i][j] = Math.min.apply(null, [d[i][j], d[i - 2][j - 2] + cost]);
      }
    };

    const distance = (s1, s2) => {
      if (
        undefined == s1 ||
        undefined == s2 ||
        "string" !== typeof s1 ||
        "string" !== typeof s2
      ) {
        return -1;
      }

      let d = initMatrix(s1, s2);
      /* istanbul ignore next */
      if (null === d) {
        return -1;
      }
      for (var i = 1; i <= s1.length; i++) {
        let cost;
        for (let j = 1; j <= s2.length; j++) {
          if (s1.charAt(i - 1) === s2.charAt(j - 1)) {
            cost = 0;
          } else {
            cost = 1;
          }

          d[i][j] = Math.min.apply(null, [
            d[i - 1][j] + 1,
            d[i][j - 1] + 1,
            d[i - 1][j - 1] + cost,
          ]);

          damerau(i, j, s1, s2, d, cost);
        }
      }

      return d[s1.length][s2.length];
    };

    const distanceProm = (s1, s2) =>
      new Promise((resolve, reject) => {
        let result = distance(s1, s2);
        if (0 <= result) {
          resolve(result);
        } else {
          reject(result);
        }
      });

    const minDistanceProm = (s1, list) =>
      new Promise((resolve, reject) => {
        if (undefined == list || !Array.isArray(list)) {
          reject(-1);
          return;
        } else if (0 === list.length) {
          resolve(distance(s1, ""));
          return;
        }

        let min = -2;

        list.forEach((s2) => {
          let d = distance(s1, s2);
          if (-2 === min || d < min) {
            min = d;
          }
        });

        if (0 <= min) {
          resolve(min);
        } else {
          reject(min);
        }
      });

    var app$1 = {
      distanceProm,
      distance,
      minDistanceProm,
    };

    /* src/Frame_administration_linkedfields.svelte generated by Svelte v3.35.0 */

    const { console: console_1$6 } = globals;
    const file$s = "src/Frame_administration_linkedfields.svelte";

    function get_each_context_4$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[45] = list[i];
    	return child_ctx;
    }

    function get_each_context_5$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[45] = list[i];
    	return child_ctx;
    }

    function get_each_context$f(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[36] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[39] = list[i];
    	return child_ctx;
    }

    function get_each_context_2$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[42] = list[i];
    	return child_ctx;
    }

    function get_each_context_3$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[45] = list[i];
    	child_ctx[47] = i;
    	return child_ctx;
    }

    function get_each_context_6$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[52] = list[i];
    	return child_ctx;
    }

    function get_each_context_7$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[55] = list[i];
    	return child_ctx;
    }

    // (207:24) {#each section.children as ll}
    function create_each_block_7$1(ctx) {
    	let p;
    	let t0_value = /*ll*/ ctx[55].parent_list.title + "";
    	let t0;
    	let t1;
    	let t2_value = /*ll*/ ctx[55].child_list.title + "";
    	let t2;
    	let mounted;
    	let dispose;

    	function click_handler_3() {
    		return /*click_handler_3*/ ctx[24](/*ll*/ ctx[55]);
    	}

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = text(" / ");
    			t2 = text(t2_value);
    			attr_dev(p, "class", "ll svelte-1xlyc15");
    			toggle_class(p, "active", /*selected_ll*/ ctx[6] == /*ll*/ ctx[55]);
    			add_location(p, file$s, 207, 28, 6635);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			append_dev(p, t2);

    			if (!mounted) {
    				dispose = listen_dev(p, "click", click_handler_3, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*lls*/ 1 && t0_value !== (t0_value = /*ll*/ ctx[55].parent_list.title + "")) set_data_dev(t0, t0_value);
    			if (dirty[0] & /*lls*/ 1 && t2_value !== (t2_value = /*ll*/ ctx[55].child_list.title + "")) set_data_dev(t2, t2_value);

    			if (dirty[0] & /*selected_ll, lls*/ 65) {
    				toggle_class(p, "active", /*selected_ll*/ ctx[6] == /*ll*/ ctx[55]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_7$1.name,
    		type: "each",
    		source: "(207:24) {#each section.children as ll}",
    		ctx
    	});

    	return block;
    }

    // (205:20) {#each lls as section}
    function create_each_block_6$1(ctx) {
    	let h3;
    	let i;
    	let i_class_value;
    	let t0;
    	let t1_value = /*section*/ ctx[52].title + "";
    	let t1;
    	let t2;
    	let t3_value = /*section*/ ctx[52].children.length + "";
    	let t3;
    	let t4;
    	let t5;
    	let each_1_anchor;
    	let each_value_7 = /*section*/ ctx[52].children;
    	validate_each_argument(each_value_7);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_7.length; i += 1) {
    		each_blocks[i] = create_each_block_7$1(get_each_context_7$1(ctx, each_value_7, i));
    	}

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			i = element("i");
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = text(" (");
    			t3 = text(t3_value);
    			t4 = text(")");
    			t5 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			attr_dev(i, "class", i_class_value = "i-" + /*section*/ ctx[52].icon + " i-32" + " svelte-1xlyc15");
    			add_location(i, file$s, 205, 45, 6465);
    			attr_dev(h3, "class", "ll-title svelte-1xlyc15");
    			add_location(h3, file$s, 205, 24, 6444);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			append_dev(h3, i);
    			append_dev(h3, t0);
    			append_dev(h3, t1);
    			append_dev(h3, t2);
    			append_dev(h3, t3);
    			append_dev(h3, t4);
    			insert_dev(target, t5, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*lls*/ 1 && i_class_value !== (i_class_value = "i-" + /*section*/ ctx[52].icon + " i-32" + " svelte-1xlyc15")) {
    				attr_dev(i, "class", i_class_value);
    			}

    			if (dirty[0] & /*lls*/ 1 && t1_value !== (t1_value = /*section*/ ctx[52].title + "")) set_data_dev(t1, t1_value);
    			if (dirty[0] & /*lls*/ 1 && t3_value !== (t3_value = /*section*/ ctx[52].children.length + "")) set_data_dev(t3, t3_value);

    			if (dirty[0] & /*selected_ll, lls, select_ll*/ 16449) {
    				each_value_7 = /*section*/ ctx[52].children;
    				validate_each_argument(each_value_7);
    				let i;

    				for (i = 0; i < each_value_7.length; i += 1) {
    					const child_ctx = get_each_context_7$1(ctx, each_value_7, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_7$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_7.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t5);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_6$1.name,
    		type: "each",
    		source: "(205:20) {#each lls as section}",
    		ctx
    	});

    	return block;
    }

    // (318:4) {:else}
    function create_else_block_2$2(ctx) {
    	let div5;
    	let div4;
    	let div3;
    	let h1;
    	let t1;
    	let div1;
    	let div0;
    	let label;
    	let t2_value = /*selected_ll*/ ctx[6].parent_list.title + "";
    	let t2;
    	let t3;
    	let select;
    	let option;
    	let t5;
    	let t6;
    	let div2;
    	let span;
    	let mounted;
    	let dispose;
    	let each_value_5 = /*selected_ll*/ ctx[6].parent_list.options;
    	validate_each_argument(each_value_5);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_5.length; i += 1) {
    		each_blocks[i] = create_each_block_5$1(get_each_context_5$1(ctx, each_value_5, i));
    	}

    	let if_block = /*parent_test*/ ctx[8] && /*parent_test*/ ctx[8].children.length && create_if_block_10$2(ctx);

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div4 = element("div");
    			div3 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Test";
    			t1 = space();
    			div1 = element("div");
    			div0 = element("div");
    			label = element("label");
    			t2 = text(t2_value);
    			t3 = space();
    			select = element("select");
    			option = element("option");
    			option.textContent = "Select one...";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t5 = space();
    			if (if_block) if_block.c();
    			t6 = space();
    			div2 = element("div");
    			span = element("span");
    			span.textContent = "OK";
    			add_location(h1, file$s, 321, 20, 15969);
    			add_location(label, file$s, 326, 28, 16184);
    			option.__value = false;
    			option.value = option.__value;
    			add_location(option, file$s, 328, 32, 16348);
    			attr_dev(select, "class", "form-control");
    			if (/*parent_test*/ ctx[8] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[33].call(select));
    			add_location(select, file$s, 327, 28, 16259);
    			attr_dev(div0, "class", "form-item");
    			add_location(div0, file$s, 325, 24, 16132);
    			attr_dev(div1, "class", "overflow svelte-1xlyc15");
    			add_location(div1, file$s, 323, 20, 16004);
    			attr_dev(span, "class", "btn right svelte-1xlyc15");
    			add_location(span, file$s, 349, 24, 17469);
    			set_style(div2, "max-width", "480px");
    			add_location(div2, file$s, 348, 20, 17414);
    			attr_dev(div3, "class", "card-body svelte-1xlyc15");
    			add_location(div3, file$s, 320, 16, 15925);
    			attr_dev(div4, "class", "card svelte-1xlyc15");
    			add_location(div4, file$s, 319, 12, 15890);
    			attr_dev(div5, "class", "col12 col-md-8");
    			add_location(div5, file$s, 318, 8, 15849);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div4);
    			append_dev(div4, div3);
    			append_dev(div3, h1);
    			append_dev(div3, t1);
    			append_dev(div3, div1);
    			append_dev(div1, div0);
    			append_dev(div0, label);
    			append_dev(label, t2);
    			append_dev(div0, t3);
    			append_dev(div0, select);
    			append_dev(select, option);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*parent_test*/ ctx[8]);
    			append_dev(div1, t5);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div3, t6);
    			append_dev(div3, div2);
    			append_dev(div2, span);

    			if (!mounted) {
    				dispose = [
    					listen_dev(select, "change", /*select_change_handler*/ ctx[33]),
    					listen_dev(span, "click", /*click_handler_10*/ ctx[34], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*selected_ll*/ 64 && t2_value !== (t2_value = /*selected_ll*/ ctx[6].parent_list.title + "")) set_data_dev(t2, t2_value);

    			if (dirty[0] & /*selected_ll*/ 64) {
    				each_value_5 = /*selected_ll*/ ctx[6].parent_list.options;
    				validate_each_argument(each_value_5);
    				let i;

    				for (i = 0; i < each_value_5.length; i += 1) {
    					const child_ctx = get_each_context_5$1(ctx, each_value_5, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_5$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_5.length;
    			}

    			if (dirty[0] & /*parent_test, selected_ll*/ 320) {
    				select_option(select, /*parent_test*/ ctx[8]);
    			}

    			if (/*parent_test*/ ctx[8] && /*parent_test*/ ctx[8].children.length) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_10$2(ctx);
    					if_block.c();
    					if_block.m(div1, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2$2.name,
    		type: "else",
    		source: "(318:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (216:4) {#if !test_mode}
    function create_if_block$m(ctx) {
    	let t;
    	let if_block1_anchor;
    	let if_block0 = /*selected_ll*/ ctx[6] && create_if_block_9$2(ctx);
    	let if_block1 = /*selected_parent*/ ctx[7] && create_if_block_1$g(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*selected_ll*/ ctx[6]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_9$2(ctx);
    					if_block0.c();
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*selected_parent*/ ctx[7]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$g(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$m.name,
    		type: "if",
    		source: "(216:4) {#if !test_mode}",
    		ctx
    	});

    	return block;
    }

    // (330:32) {#each selected_ll.parent_list.options as opt}
    function create_each_block_5$1(ctx) {
    	let option;
    	let t_value = /*opt*/ ctx[45].title + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*opt*/ ctx[45];
    			option.value = option.__value;
    			add_location(option, file$s, 330, 36, 16510);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*selected_ll*/ 64 && t_value !== (t_value = /*opt*/ ctx[45].title + "")) set_data_dev(t, t_value);

    			if (dirty[0] & /*selected_ll*/ 64 && option_value_value !== (option_value_value = /*opt*/ ctx[45])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_5$1.name,
    		type: "each",
    		source: "(330:32) {#each selected_ll.parent_list.options as opt}",
    		ctx
    	});

    	return block;
    }

    // (336:24) {#if parent_test && parent_test.children.length}
    function create_if_block_10$2(ctx) {
    	let div;
    	let label;
    	let t0_value = /*selected_ll*/ ctx[6].child_list.title + "";
    	let t0;
    	let t1;
    	let select;
    	let option;
    	let each_value_4 = /*parent_test*/ ctx[8].children;
    	validate_each_argument(each_value_4);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		each_blocks[i] = create_each_block_4$1(get_each_context_4$1(ctx, each_value_4, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			label = element("label");
    			t0 = text(t0_value);
    			t1 = space();
    			select = element("select");
    			option = element("option");
    			option.textContent = "Select one...";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(label, file$s, 338, 32, 16905);
    			option.__value = "Select one...";
    			option.value = option.__value;
    			add_location(option, file$s, 340, 36, 17050);
    			attr_dev(select, "class", "form-control");
    			add_location(select, file$s, 339, 32, 16983);
    			attr_dev(div, "class", "form-item");
    			add_location(div, file$s, 337, 28, 16849);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, label);
    			append_dev(label, t0);
    			append_dev(div, t1);
    			append_dev(div, select);
    			append_dev(select, option);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*selected_ll*/ 64 && t0_value !== (t0_value = /*selected_ll*/ ctx[6].child_list.title + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*parent_test*/ 256) {
    				each_value_4 = /*parent_test*/ ctx[8].children;
    				validate_each_argument(each_value_4);
    				let i;

    				for (i = 0; i < each_value_4.length; i += 1) {
    					const child_ctx = get_each_context_4$1(ctx, each_value_4, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_4$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_4.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10$2.name,
    		type: "if",
    		source: "(336:24) {#if parent_test && parent_test.children.length}",
    		ctx
    	});

    	return block;
    }

    // (342:36) {#each parent_test.children as opt}
    function create_each_block_4$1(ctx) {
    	let option;
    	let t_value = /*opt*/ ctx[45] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*opt*/ ctx[45];
    			option.value = option.__value;
    			add_location(option, file$s, 342, 40, 17193);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*parent_test*/ 256 && t_value !== (t_value = /*opt*/ ctx[45] + "")) set_data_dev(t, t_value);

    			if (dirty[0] & /*parent_test, selected_ll*/ 320 && option_value_value !== (option_value_value = /*opt*/ ctx[45])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_4$1.name,
    		type: "each",
    		source: "(342:36) {#each parent_test.children as opt}",
    		ctx
    	});

    	return block;
    }

    // (217:8) {#if selected_ll}
    function create_if_block_9$2(ctx) {
    	let div4;
    	let div3;
    	let div2;
    	let h1;
    	let t1;
    	let div0;
    	let t2;
    	let div1;
    	let span0;
    	let t4;
    	let span1;
    	let mounted;
    	let dispose;
    	let each_value_2 = /*selected_ll*/ ctx[6].parent_list.options;
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2$4(get_each_context_2$4(ctx, each_value_2, i));
    	}

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Parent Field & Child Options";
    			t1 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			div1 = element("div");
    			span0 = element("span");
    			span0.textContent = "Save";
    			t4 = space();
    			span1 = element("span");
    			span1.textContent = "Test Linked Fields";
    			add_location(h1, file$s, 220, 24, 7096);
    			attr_dev(div0, "class", "overflow svelte-1xlyc15");
    			add_location(div0, file$s, 221, 24, 7158);
    			attr_dev(span0, "class", "btn right svelte-1xlyc15");
    			toggle_class(span0, "disabled", !/*dirty_flag*/ ctx[9]);
    			add_location(span0, file$s, 232, 28, 8008);
    			attr_dev(span1, "class", "btn btn-secondary right svelte-1xlyc15");
    			add_location(span1, file$s, 233, 28, 8124);
    			add_location(div1, file$s, 231, 24, 7974);
    			attr_dev(div2, "class", "card-body svelte-1xlyc15");
    			add_location(div2, file$s, 219, 20, 7048);
    			attr_dev(div3, "class", "card svelte-1xlyc15");
    			add_location(div3, file$s, 218, 16, 7009);
    			attr_dev(div4, "class", "col12 col-md-4 ll2 svelte-1xlyc15");
    			add_location(div4, file$s, 217, 12, 6960);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, h1);
    			append_dev(div2, t1);
    			append_dev(div2, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, span0);
    			append_dev(div1, t4);
    			append_dev(div1, span1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(span0, "click", /*faux_save*/ ctx[17], false, false, false),
    					listen_dev(span1, "click", /*click_handler_6*/ ctx[27], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*selected_ll, remove_child_option, selected_parent, select_parent*/ 557248) {
    				each_value_2 = /*selected_ll*/ ctx[6].parent_list.options;
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2$4(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}

    			if (dirty[0] & /*dirty_flag*/ 512) {
    				toggle_class(span0, "disabled", !/*dirty_flag*/ ctx[9]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9$2.name,
    		type: "if",
    		source: "(217:8) {#if selected_ll}",
    		ctx
    	});

    	return block;
    }

    // (227:32) {:else}
    function create_else_block_1$3(ctx) {
    	let p;
    	let t0_value = /*selected_ll*/ ctx[6].child_list.title + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = text(" input will not be visible");
    			attr_dev(p, "class", "ll svelte-1xlyc15");
    			set_style(p, "opacity", "0.5");
    			add_location(p, file$s, 227, 36, 7747);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*selected_ll*/ 64 && t0_value !== (t0_value = /*selected_ll*/ ctx[6].child_list.title + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$3.name,
    		type: "else",
    		source: "(227:32) {:else}",
    		ctx
    	});

    	return block;
    }

    // (225:32) {#each pl.children.sort() as opt, i}
    function create_each_block_3$1(ctx) {
    	let p;
    	let t0_value = /*opt*/ ctx[45] + "";
    	let t0;
    	let t1;
    	let i_1;
    	let mounted;
    	let dispose;

    	function click_handler_5() {
    		return /*click_handler_5*/ ctx[26](/*pl*/ ctx[42], /*i*/ ctx[47]);
    	}

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			i_1 = element("i");
    			attr_dev(i_1, "class", "i-trash i-20 right svelte-1xlyc15");
    			add_location(i_1, file$s, 225, 103, 7632);
    			attr_dev(p, "class", "ll svelte-1xlyc15");
    			add_location(p, file$s, 225, 36, 7565);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			append_dev(p, i_1);

    			if (!mounted) {
    				dispose = listen_dev(p, "click", click_handler_5, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*selected_ll*/ 64 && t0_value !== (t0_value = /*opt*/ ctx[45] + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3$1.name,
    		type: "each",
    		source: "(225:32) {#each pl.children.sort() as opt, i}",
    		ctx
    	});

    	return block;
    }

    // (223:28) {#each selected_ll.parent_list.options as pl}
    function create_each_block_2$4(ctx) {
    	let h3;
    	let t0_value = /*pl*/ ctx[42].title + "";
    	let t0;
    	let t1;
    	let t2_value = /*pl*/ ctx[42].children.length + "";
    	let t2;
    	let t3;
    	let i;
    	let t4;
    	let each_1_anchor;
    	let mounted;
    	let dispose;

    	function click_handler_4() {
    		return /*click_handler_4*/ ctx[25](/*pl*/ ctx[42]);
    	}

    	let each_value_3 = /*pl*/ ctx[42].children.sort();
    	validate_each_argument(each_value_3);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks[i] = create_each_block_3$1(get_each_context_3$1(ctx, each_value_3, i));
    	}

    	let each_1_else = null;

    	if (!each_value_3.length) {
    		each_1_else = create_else_block_1$3(ctx);
    	}

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			t0 = text(t0_value);
    			t1 = text(" (");
    			t2 = text(t2_value);
    			t3 = text(") ");
    			i = element("i");
    			t4 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();

    			if (each_1_else) {
    				each_1_else.c();
    			}

    			attr_dev(i, "class", "i-add i-20 right svelte-1xlyc15");
    			add_location(i, file$s, 223, 167, 7422);
    			attr_dev(h3, "class", "ll-title svelte-1xlyc15");
    			toggle_class(h3, "active", /*selected_parent*/ ctx[7] == /*pl*/ ctx[42]);
    			add_location(h3, file$s, 223, 32, 7287);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			append_dev(h3, t0);
    			append_dev(h3, t1);
    			append_dev(h3, t2);
    			append_dev(h3, t3);
    			append_dev(h3, i);
    			insert_dev(target, t4, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);

    			if (each_1_else) {
    				each_1_else.m(target, anchor);
    			}

    			if (!mounted) {
    				dispose = listen_dev(h3, "click", click_handler_4, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*selected_ll*/ 64 && t0_value !== (t0_value = /*pl*/ ctx[42].title + "")) set_data_dev(t0, t0_value);
    			if (dirty[0] & /*selected_ll*/ 64 && t2_value !== (t2_value = /*pl*/ ctx[42].children.length + "")) set_data_dev(t2, t2_value);

    			if (dirty[0] & /*selected_parent, selected_ll*/ 192) {
    				toggle_class(h3, "active", /*selected_parent*/ ctx[7] == /*pl*/ ctx[42]);
    			}

    			if (dirty[0] & /*remove_child_option, selected_ll*/ 524352) {
    				each_value_3 = /*pl*/ ctx[42].children.sort();
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3$1(ctx, each_value_3, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_3$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_3.length;

    				if (!each_value_3.length && each_1_else) {
    					each_1_else.p(ctx, dirty);
    				} else if (!each_value_3.length) {
    					each_1_else = create_else_block_1$3(ctx);
    					each_1_else.c();
    					each_1_else.m(each_1_anchor.parentNode, each_1_anchor);
    				} else if (each_1_else) {
    					each_1_else.d(1);
    					each_1_else = null;
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t4);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    			if (each_1_else) each_1_else.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2$4.name,
    		type: "each",
    		source: "(223:28) {#each selected_ll.parent_list.options as pl}",
    		ctx
    	});

    	return block;
    }

    // (243:8) {#if selected_parent}
    function create_if_block_1$g(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let h1;
    	let t1;
    	let ul;
    	let li0;
    	let a0;
    	let t3;
    	let li1;
    	let a1;
    	let t5;
    	let t6;
    	let mounted;
    	let dispose;
    	let if_block0 = /*tab*/ ctx[4] == "select" && create_if_block_7$3(ctx);
    	let if_block1 = /*tab*/ ctx[4] == "paste" && create_if_block_2$d(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "New Child Options";
    			t1 = space();
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			a0.textContent = "Select List";
    			t3 = space();
    			li1 = element("li");
    			a1 = element("a");
    			a1.textContent = "Paste List";
    			t5 = space();
    			if (if_block0) if_block0.c();
    			t6 = space();
    			if (if_block1) if_block1.c();
    			add_location(h1, file$s, 246, 24, 8552);
    			attr_dev(a0, "href", "#ehs/administration/linkedlists/select");
    			toggle_class(a0, "active", /*tab*/ ctx[4] == "select");
    			add_location(a0, file$s, 249, 32, 8654);
    			add_location(li0, file$s, 249, 28, 8650);
    			attr_dev(a1, "href", "#ehs/administration/linkedlists/paste");
    			toggle_class(a1, "active", /*tab*/ ctx[4] == "paste");
    			add_location(a1, file$s, 250, 32, 8829);
    			add_location(li1, file$s, 250, 28, 8825);
    			attr_dev(ul, "class", "tabs");
    			add_location(ul, file$s, 248, 24, 8604);
    			attr_dev(div0, "class", "card-body svelte-1xlyc15");
    			add_location(div0, file$s, 245, 20, 8504);
    			attr_dev(div1, "class", "card svelte-1xlyc15");
    			add_location(div1, file$s, 244, 16, 8465);
    			attr_dev(div2, "class", "col12 col-md-4 ll3");
    			add_location(div2, file$s, 243, 12, 8416);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h1);
    			append_dev(div0, t1);
    			append_dev(div0, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a0);
    			append_dev(ul, t3);
    			append_dev(ul, li1);
    			append_dev(li1, a1);
    			append_dev(div0, t5);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(div0, t6);
    			if (if_block1) if_block1.m(div0, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(a0, "click", /*click_handler_7*/ ctx[28], false, false, false),
    					listen_dev(a1, "click", /*click_handler_8*/ ctx[29], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*tab*/ 16) {
    				toggle_class(a0, "active", /*tab*/ ctx[4] == "select");
    			}

    			if (dirty[0] & /*tab*/ 16) {
    				toggle_class(a1, "active", /*tab*/ ctx[4] == "paste");
    			}

    			if (/*tab*/ ctx[4] == "select") {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_7$3(ctx);
    					if_block0.c();
    					if_block0.m(div0, t6);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*tab*/ ctx[4] == "paste") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_2$d(ctx);
    					if_block1.c();
    					if_block1.m(div0, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$g.name,
    		type: "if",
    		source: "(243:8) {#if selected_parent}",
    		ctx
    	});

    	return block;
    }

    // (254:24) {#if tab == 'select'}
    function create_if_block_7$3(ctx) {
    	let div;
    	let each_value_1 = /*selected_ll*/ ctx[6].child_list.options;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$5(get_each_context_1$5(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "overflow svelte-1xlyc15");
    			add_location(div, file$s, 254, 28, 9098);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*selected_ll, selected_parent, add_child_option*/ 65728) {
    				each_value_1 = /*selected_ll*/ ctx[6].child_list.options;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$5(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7$3.name,
    		type: "if",
    		source: "(254:24) {#if tab == 'select'}",
    		ctx
    	});

    	return block;
    }

    // (259:36) {:else}
    function create_else_block$d(ctx) {
    	let p;
    	let t_value = /*city*/ ctx[39] + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler_9() {
    		return /*click_handler_9*/ ctx[30](/*city*/ ctx[39]);
    	}

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			attr_dev(p, "class", "ll svelte-1xlyc15");
    			add_location(p, file$s, 259, 40, 9470);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);

    			if (!mounted) {
    				dispose = listen_dev(p, "click", click_handler_9, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*selected_ll*/ 64 && t_value !== (t_value = /*city*/ ctx[39] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$d.name,
    		type: "else",
    		source: "(259:36) {:else}",
    		ctx
    	});

    	return block;
    }

    // (257:36) {#if selected_parent.children.indexOf(city) >= 0}
    function create_if_block_8$2(ctx) {
    	let p;
    	let t_value = /*city*/ ctx[39] + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			attr_dev(p, "class", "ll svelte-1xlyc15");
    			set_style(p, "opacity", "0.5");
    			set_style(p, "cursor", "default");
    			add_location(p, file$s, 257, 40, 9326);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*selected_ll*/ 64 && t_value !== (t_value = /*city*/ ctx[39] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8$2.name,
    		type: "if",
    		source: "(257:36) {#if selected_parent.children.indexOf(city) >= 0}",
    		ctx
    	});

    	return block;
    }

    // (256:32) {#each selected_ll.child_list.options as city}
    function create_each_block_1$5(ctx) {
    	let show_if;
    	let if_block_anchor;

    	function select_block_type_1(ctx, dirty) {
    		if (show_if == null || dirty[0] & /*selected_parent, selected_ll*/ 192) show_if = !!(/*selected_parent*/ ctx[7].children.indexOf(/*city*/ ctx[39]) >= 0);
    		if (show_if) return create_if_block_8$2;
    		return create_else_block$d;
    	}

    	let current_block_type = select_block_type_1(ctx, [-1]);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx, dirty)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$5.name,
    		type: "each",
    		source: "(256:32) {#each selected_ll.child_list.options as city}",
    		ctx
    	});

    	return block;
    }

    // (265:24) {#if tab == 'paste'}
    function create_if_block_2$d(ctx) {
    	let h5;
    	let t1;
    	let div;
    	let t2;
    	let textarea;
    	let t3;
    	let if_block_anchor;
    	let mounted;
    	let dispose;
    	let each_value = /*paste_list*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$f(get_each_context$f(ctx, each_value, i));
    	}

    	let if_block = /*paste_list*/ ctx[1].length && create_if_block_3$7(ctx);

    	const block = {
    		c: function create() {
    			h5 = element("h5");
    			h5.textContent = "Copy and Pasta";
    			t1 = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			textarea = element("textarea");
    			t3 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			add_location(h5, file$s, 265, 28, 9759);
    			attr_dev(textarea, "class", "svelte-1xlyc15");
    			add_location(textarea, file$s, 271, 32, 10073);
    			attr_dev(div, "class", "fakearea svelte-1xlyc15");
    			add_location(div, file$s, 267, 28, 9812);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h5, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t2);
    			append_dev(div, textarea);
    			/*textarea_binding*/ ctx[31](textarea);
    			set_input_value(textarea, /*pastetext*/ ctx[3]);
    			insert_dev(target, t3, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);

    			if (!mounted) {
    				dispose = listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[32]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*paste_list*/ 2) {
    				each_value = /*paste_list*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$f(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$f(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, t2);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty[0] & /*pastetext*/ 8) {
    				set_input_value(textarea, /*pastetext*/ ctx[3]);
    			}

    			if (/*paste_list*/ ctx[1].length) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_3$7(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h5);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			/*textarea_binding*/ ctx[31](null);
    			if (detaching) detach_dev(t3);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$d.name,
    		type: "if",
    		source: "(265:24) {#if tab == 'paste'}",
    		ctx
    	});

    	return block;
    }

    // (269:32) {#each paste_list as paste}
    function create_each_block$f(ctx) {
    	let p;
    	let i;
    	let i_class_value;
    	let t0;
    	let t1_value = /*paste*/ ctx[36].title + "";
    	let t1;

    	const block = {
    		c: function create() {
    			p = element("p");
    			i = element("i");
    			t0 = space();
    			t1 = text(t1_value);
    			attr_dev(i, "class", i_class_value = "dot " + /*paste*/ ctx[36].dot + " svelte-1xlyc15");
    			add_location(i, file$s, 269, 56, 9951);
    			attr_dev(p, "class", "paste-ll svelte-1xlyc15");
    			add_location(p, file$s, 269, 36, 9931);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, i);
    			append_dev(p, t0);
    			append_dev(p, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*paste_list*/ 2 && i_class_value !== (i_class_value = "dot " + /*paste*/ ctx[36].dot + " svelte-1xlyc15")) {
    				attr_dev(i, "class", i_class_value);
    			}

    			if (dirty[0] & /*paste_list*/ 2 && t1_value !== (t1_value = /*paste*/ ctx[36].title + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$f.name,
    		type: "each",
    		source: "(269:32) {#each paste_list as paste}",
    		ctx
    	});

    	return block;
    }

    // (275:28) {#if paste_list.length}
    function create_if_block_3$7(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let div;
    	let span;
    	let t3;
    	let t4;
    	let t5;
    	let t6_value = (/*grey_pastes*/ ctx[12] == 1 ? "" : "s") + "";
    	let t6;
    	let mounted;
    	let dispose;
    	let if_block0 = /*red_pastes*/ ctx[10] && create_if_block_6$3(ctx);
    	let if_block1 = /*orange_pastes*/ ctx[13] && create_if_block_5$4(ctx);
    	let if_block2 = /*grey_pastes*/ ctx[12] && create_if_block_4$6(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			div = element("div");
    			span = element("span");
    			t3 = text("Add ");
    			t4 = text(/*green_pastes*/ ctx[11]);
    			t5 = text(" option");
    			t6 = text(t6_value);
    			attr_dev(span, "class", "btn right svelte-1xlyc15");
    			add_location(span, file$s, 306, 32, 15508);
    			add_location(div, file$s, 305, 32, 15470);
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(span, t3);
    			append_dev(span, t4);
    			append_dev(span, t5);
    			append_dev(span, t6);

    			if (!mounted) {
    				dispose = listen_dev(span, "click", /*add_pastes*/ ctx[18], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*red_pastes*/ ctx[10]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_6$3(ctx);
    					if_block0.c();
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*orange_pastes*/ ctx[13]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_5$4(ctx);
    					if_block1.c();
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*grey_pastes*/ ctx[12]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_4$6(ctx);
    					if_block2.c();
    					if_block2.m(t2.parentNode, t2);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty[0] & /*green_pastes*/ 2048) set_data_dev(t4, /*green_pastes*/ ctx[11]);
    			if (dirty[0] & /*grey_pastes*/ 4096 && t6_value !== (t6_value = (/*grey_pastes*/ ctx[12] == 1 ? "" : "s") + "")) set_data_dev(t6, t6_value);
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$7.name,
    		type: "if",
    		source: "(275:28) {#if paste_list.length}",
    		ctx
    	});

    	return block;
    }

    // (276:32) {#if red_pastes}
    function create_if_block_6$3(ctx) {
    	let div;
    	let svg;
    	let path;
    	let t0;
    	let t1;
    	let t2;
    	let t3_value = (/*red_pastes*/ ctx[10] == 1 ? "" : "s") + "";
    	let t3;
    	let t4;
    	let br;

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t0 = space();
    			t1 = text(/*red_pastes*/ ctx[10]);
    			t2 = text(" item");
    			t3 = text(t3_value);
    			t4 = text(" cannot be added because they don’t exist in the child list. ");
    			br = element("br");
    			attr_dev(path, "d", "M2 16C2 18.7689 2.82109 21.4757 4.35943 23.778C5.89777 26.0803 8.08427 27.8747 10.6424 28.9343C13.2006 29.9939 16.0155 30.2712 18.7313 29.731C21.447 29.1908 23.9416 27.8574 25.8995 25.8995C27.8574 23.9416 29.1908 21.447 29.731 18.7313C30.2712 16.0155 29.9939 13.2006 28.9343 10.6424C27.8747 8.08427 26.0803 5.89777 23.778 4.35943C21.4757 2.82109 18.7689 2 16 2C12.287 2 8.72601 3.475 6.1005 6.1005C3.475 8.72601 2 12.287 2 16V16ZM25.15 23.75L8.25 6.85C10.5506 4.935 13.4839 3.94898 16.4742 4.08546C19.4644 4.22195 22.2957 5.47108 24.4123 7.5877C26.5289 9.70432 27.7781 12.5356 27.9145 15.5258C28.051 18.5161 27.065 21.4494 25.15 23.75V23.75ZM8.24 25.16C5.81832 23.1035 4.311 20.1706 4.04856 17.0044C3.78612 13.8382 4.78997 10.6972 6.84 8.27L23.73 25.16C21.5642 26.99 18.8204 27.994 15.985 27.994C13.1496 27.994 10.4058 26.99 8.24 25.16V25.16Z");
    			attr_dev(path, "fill", "#E40C0C");
    			add_location(path, file$s, 278, 44, 10546);
    			attr_dev(svg, "width", "24");
    			attr_dev(svg, "height", "24");
    			attr_dev(svg, "viewBox", "0 0 32 32");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "class", "svelte-1xlyc15");
    			add_location(svg, file$s, 277, 40, 10406);
    			add_location(br, file$s, 280, 144, 11607);
    			attr_dev(div, "class", "feedback svelte-1xlyc15");
    			add_location(div, file$s, 276, 36, 10343);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, path);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			append_dev(div, t3);
    			append_dev(div, t4);
    			append_dev(div, br);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*red_pastes*/ 1024) set_data_dev(t1, /*red_pastes*/ ctx[10]);
    			if (dirty[0] & /*red_pastes*/ 1024 && t3_value !== (t3_value = (/*red_pastes*/ ctx[10] == 1 ? "" : "s") + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$3.name,
    		type: "if",
    		source: "(276:32) {#if red_pastes}",
    		ctx
    	});

    	return block;
    }

    // (284:32) {#if orange_pastes}
    function create_if_block_5$4(ctx) {
    	let div;
    	let svg;
    	let path0;
    	let path1;
    	let path2;
    	let t0;
    	let t1;
    	let t2;
    	let t3_value = (/*orange_pastes*/ ctx[13] == 1 ? "" : "s") + "";
    	let t3;
    	let t4;
    	let t5_value = (/*orange_pastes*/ ctx[13] == 1 ? "s" : "") + "";
    	let t5;
    	let t6;
    	let br;

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			t0 = space();
    			t1 = text(/*orange_pastes*/ ctx[13]);
    			t2 = text(" item");
    			t3 = text(t3_value);
    			t4 = text(" need");
    			t5 = text(t5_value);
    			t6 = text(" attention");
    			br = element("br");
    			attr_dev(path0, "d", "M16 2C13.2311 2 10.5243 2.82109 8.22202 4.35943C5.91973 5.89777 4.12532 8.08427 3.06569 10.6424C2.00607 13.2006 1.72882 16.0155 2.26901 18.7313C2.80921 21.447 4.14258 23.9416 6.10051 25.8995C8.05845 27.8574 10.553 29.1908 13.2687 29.731C15.9845 30.2712 18.7994 29.9939 21.3576 28.9343C23.9157 27.8747 26.1022 26.0803 27.6406 23.778C29.1789 21.4757 30 18.7689 30 16C30 12.287 28.525 8.72601 25.8995 6.1005C23.274 3.475 19.713 2 16 2V2ZM16 28C13.6266 28 11.3066 27.2962 9.33316 25.9776C7.35977 24.6591 5.8217 22.7849 4.91345 20.5922C4.0052 18.3995 3.76756 15.9867 4.23058 13.6589C4.69361 11.3311 5.83649 9.19295 7.51472 7.51472C9.19295 5.83649 11.3312 4.6936 13.6589 4.23058C15.9867 3.76755 18.3995 4.00519 20.5922 4.91345C22.7849 5.8217 24.6591 7.35977 25.9776 9.33316C27.2962 11.3065 28 13.6266 28 16C28 19.1826 26.7357 22.2348 24.4853 24.4853C22.2349 26.7357 19.1826 28 16 28Z");
    			attr_dev(path0, "fill", "#EB961A");
    			add_location(path0, file$s, 286, 44, 11984);
    			attr_dev(path1, "d", "M17 8H15V19H17V8Z");
    			attr_dev(path1, "fill", "#EB961A");
    			add_location(path1, file$s, 287, 44, 12933);
    			attr_dev(path2, "d", "M16 22C15.7033 22 15.4133 22.088 15.1666 22.2528C14.92 22.4176 14.7277 22.6519 14.6142 22.926C14.5006 23.2001 14.4709 23.5017 14.5288 23.7926C14.5867 24.0836 14.7296 24.3509 14.9393 24.5607C15.1491 24.7704 15.4164 24.9133 15.7074 24.9712C15.9983 25.0291 16.2999 24.9993 16.574 24.8858C16.8481 24.7723 17.0824 24.58 17.2472 24.3334C17.412 24.0867 17.5 23.7967 17.5 23.5C17.5 23.1022 17.342 22.7206 17.0607 22.4393C16.7794 22.158 16.3978 22 16 22Z");
    			attr_dev(path2, "fill", "#EB961A");
    			add_location(path2, file$s, 288, 44, 13022);
    			attr_dev(svg, "width", "24");
    			attr_dev(svg, "height", "24");
    			attr_dev(svg, "viewBox", "0 0 32 32");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "class", "svelte-1xlyc15");
    			add_location(svg, file$s, 285, 40, 11844);
    			add_location(br, file$s, 291, 133, 13720);
    			attr_dev(div, "class", "feedback svelte-1xlyc15");
    			add_location(div, file$s, 284, 36, 11781);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(svg, path2);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			append_dev(div, t3);
    			append_dev(div, t4);
    			append_dev(div, t5);
    			append_dev(div, t6);
    			append_dev(div, br);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*orange_pastes*/ 8192) set_data_dev(t1, /*orange_pastes*/ ctx[13]);
    			if (dirty[0] & /*orange_pastes*/ 8192 && t3_value !== (t3_value = (/*orange_pastes*/ ctx[13] == 1 ? "" : "s") + "")) set_data_dev(t3, t3_value);
    			if (dirty[0] & /*orange_pastes*/ 8192 && t5_value !== (t5_value = (/*orange_pastes*/ ctx[13] == 1 ? "s" : "") + "")) set_data_dev(t5, t5_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$4.name,
    		type: "if",
    		source: "(284:32) {#if orange_pastes}",
    		ctx
    	});

    	return block;
    }

    // (295:32) {#if grey_pastes}
    function create_if_block_4$6(ctx) {
    	let div;
    	let svg;
    	let path0;
    	let path1;
    	let t0;
    	let t1;
    	let t2;
    	let t3_value = (/*grey_pastes*/ ctx[12] == 1 ? "" : "s") + "";
    	let t3;
    	let t4;
    	let t5_value = (/*grey_pastes*/ ctx[12] == 1 ? "s" : "") + "";
    	let t5;
    	let br;

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			t0 = space();
    			t1 = text(/*grey_pastes*/ ctx[12]);
    			t2 = text(" item");
    			t3 = text(t3_value);
    			t4 = text(" already exist");
    			t5 = text(t5_value);
    			br = element("br");
    			attr_dev(path0, "d", "M16 2C13.2311 2 10.5243 2.82109 8.22202 4.35943C5.91973 5.89777 4.12532 8.08427 3.06569 10.6424C2.00607 13.2006 1.72882 16.0155 2.26901 18.7313C2.80921 21.447 4.14258 23.9416 6.10051 25.8995C8.05845 27.8574 10.553 29.1908 13.2687 29.731C15.9845 30.2712 18.7994 29.9939 21.3576 28.9343C23.9157 27.8747 26.1022 26.0803 27.6406 23.778C29.1789 21.4757 30 18.7689 30 16C30 12.287 28.525 8.72601 25.8995 6.1005C23.274 3.475 19.713 2 16 2V2ZM16 28C13.6266 28 11.3066 27.2962 9.33316 25.9776C7.35977 24.6591 5.8217 22.7849 4.91345 20.5922C4.0052 18.3995 3.76756 15.9867 4.23058 13.6589C4.69361 11.3311 5.83649 9.19295 7.51472 7.51472C9.19295 5.83649 11.3312 4.6936 13.6589 4.23058C15.9867 3.76755 18.3995 4.00519 20.5922 4.91345C22.7849 5.8217 24.6591 7.35977 25.9776 9.33316C27.2962 11.3065 28 13.6266 28 16C28 19.1826 26.7357 22.2348 24.4853 24.4853C22.2349 26.7357 19.1826 28 16 28Z");
    			attr_dev(path0, "fill", "#BABFC3");
    			add_location(path0, file$s, 297, 44, 14095);
    			attr_dev(path1, "d", "M10.5 15V17H21.5V15H10.5Z");
    			attr_dev(path1, "fill", "#BABFC3");
    			add_location(path1, file$s, 298, 44, 15044);
    			attr_dev(svg, "width", "24");
    			attr_dev(svg, "height", "24");
    			attr_dev(svg, "viewBox", "0 0 32 32");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "class", "svelte-1xlyc15");
    			add_location(svg, file$s, 296, 40, 13955);
    			add_location(br, file$s, 301, 126, 15319);
    			attr_dev(div, "class", "feedback svelte-1xlyc15");
    			add_location(div, file$s, 295, 36, 13892);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			append_dev(div, t3);
    			append_dev(div, t4);
    			append_dev(div, t5);
    			append_dev(div, br);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*grey_pastes*/ 4096) set_data_dev(t1, /*grey_pastes*/ ctx[12]);
    			if (dirty[0] & /*grey_pastes*/ 4096 && t3_value !== (t3_value = (/*grey_pastes*/ ctx[12] == 1 ? "" : "s") + "")) set_data_dev(t3, t3_value);
    			if (dirty[0] & /*grey_pastes*/ 4096 && t5_value !== (t5_value = (/*grey_pastes*/ ctx[12] == 1 ? "s" : "") + "")) set_data_dev(t5, t5_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$6.name,
    		type: "if",
    		source: "(295:32) {#if grey_pastes}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$s(ctx) {
    	let div1;
    	let div0;
    	let ul;
    	let li0;
    	let a0;
    	let t1;
    	let li1;
    	let a1;
    	let t3;
    	let li2;
    	let a2;
    	let t5;
    	let li3;
    	let t7;
    	let div6;
    	let div5;
    	let div4;
    	let div3;
    	let h1;
    	let t9;
    	let div2;
    	let t10;
    	let mounted;
    	let dispose;
    	let each_value_6 = /*lls*/ ctx[0];
    	validate_each_argument(each_value_6);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_6.length; i += 1) {
    		each_blocks[i] = create_each_block_6$1(get_each_context_6$1(ctx, each_value_6, i));
    	}

    	function select_block_type(ctx, dirty) {
    		if (!/*test_mode*/ ctx[5]) return create_if_block$m;
    		return create_else_block_2$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			a0.textContent = "EcoOnline";
    			t1 = space();
    			li1 = element("li");
    			a1 = element("a");
    			a1.textContent = "EHS";
    			t3 = space();
    			li2 = element("li");
    			a2 = element("a");
    			a2.textContent = "Administration";
    			t5 = space();
    			li3 = element("li");
    			li3.textContent = "Linked Fields";
    			t7 = space();
    			div6 = element("div");
    			div5 = element("div");
    			div4 = element("div");
    			div3 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Linked Fields";
    			t9 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t10 = space();
    			if_block.c();
    			attr_dev(a0, "href", "#platform");
    			add_location(a0, file$s, 188, 16, 5844);
    			add_location(li0, file$s, 188, 12, 5840);
    			attr_dev(a1, "href", "#ehs");
    			add_location(a1, file$s, 189, 16, 5937);
    			add_location(li1, file$s, 189, 12, 5933);
    			attr_dev(a2, "href", "#ehs/administration");
    			add_location(a2, file$s, 190, 16, 6014);
    			add_location(li2, file$s, 190, 12, 6010);
    			add_location(li3, file$s, 191, 12, 6124);
    			attr_dev(ul, "class", "breadcrumb");
    			add_location(ul, file$s, 187, 8, 5804);
    			attr_dev(div0, "class", "col12");
    			add_location(div0, file$s, 186, 4, 5776);
    			attr_dev(div1, "class", "row sticky");
    			add_location(div1, file$s, 185, 0, 5747);
    			add_location(h1, file$s, 201, 16, 6314);
    			attr_dev(div2, "class", "overflow svelte-1xlyc15");
    			add_location(div2, file$s, 203, 16, 6354);
    			attr_dev(div3, "class", "card-body svelte-1xlyc15");
    			add_location(div3, file$s, 200, 11, 6274);
    			attr_dev(div4, "class", "card svelte-1xlyc15");
    			add_location(div4, file$s, 199, 8, 6244);
    			attr_dev(div5, "class", "col12 col-md-4 ll1");
    			add_location(div5, file$s, 198, 4, 6203);
    			attr_dev(div6, "class", "row");
    			add_location(div6, file$s, 197, 0, 6181);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a0);
    			append_dev(ul, t1);
    			append_dev(ul, li1);
    			append_dev(li1, a1);
    			append_dev(ul, t3);
    			append_dev(ul, li2);
    			append_dev(li2, a2);
    			append_dev(ul, t5);
    			append_dev(ul, li3);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div5);
    			append_dev(div5, div4);
    			append_dev(div4, div3);
    			append_dev(div3, h1);
    			append_dev(div3, t9);
    			append_dev(div3, div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			append_dev(div6, t10);
    			if_block.m(div6, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(a0, "click", /*click_handler*/ ctx[21], false, false, false),
    					listen_dev(a1, "click", /*click_handler_1*/ ctx[22], false, false, false),
    					listen_dev(a2, "click", /*click_handler_2*/ ctx[23], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*lls, selected_ll, select_ll*/ 16449) {
    				each_value_6 = /*lls*/ ctx[0];
    				validate_each_argument(each_value_6);
    				let i;

    				for (i = 0; i < each_value_6.length; i += 1) {
    					const child_ctx = get_each_context_6$1(ctx, each_value_6, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_6$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_6.length;
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div6, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(div6);
    			destroy_each(each_blocks, detaching);
    			if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$s.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function dot_color(ds) {
    	if (ds == 0) {
    		return "green"; //in list and not already added
    	} else if (ds == -10) {
    		return "grey"; //in list and already added
    	} else if (ds < 0.2) {
    		return "orange"; //too close to an option already in list
    	} else {
    		return "red"; //not in list
    	}
    }

    function instance$s($$self, $$props, $$invalidate) {
    	let dirty_flag;
    	let red_pastes;
    	let green_pastes;
    	let grey_pastes;
    	let orange_pastes;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Frame_administration_linkedfields", slots, []);
    	let tab = "select";

    	let lls = [
    		{
    			"icon": "incidents",
    			"title": "Incidents",
    			"children": [
    				{
    					"parent_list": {
    						"title": "Countries",
    						"options": [
    							{
    								"title": "Ireland",
    								"children": ["Cork", "Dublin", "Galway"]
    							},
    							{
    								"title": "England",
    								"children": ["Liverpool", "London", "Brighton"]
    							},
    							{
    								"title": "Wales",
    								"children": ["Cardiff"]
    							},
    							{ "title": "Zimbabwe", "children": [] }
    						]
    					},
    					"child_list": {
    						"title": "Cities",
    						"options": [
    							"Auckland",
    							"Brighton",
    							"Cardiff",
    							"Cork",
    							"Dublin",
    							"Leeds",
    							"Liverpool",
    							"London",
    							"Madrid",
    							"Paris",
    							"Sheffield",
    							"Southampton",
    							"St Albans",
    							"Stoke-on-Trent",
    							"Sunderland",
    							"Truro",
    							"Wakefield",
    							"Wells",
    							"Westminster",
    							"Winchester",
    							"Wolverhampton"
    						]
    					}
    				}
    			]
    		}
    	];

    	let test_mode = false;
    	let lls_copy = JSON.parse(JSON.stringify(lls));
    	let selected_ll = false;
    	let selected_parent = false;
    	let paste_list = [];
    	let pastearea = false;
    	let pastetext = "";
    	let parent_test = false;

    	function dl_score(str) {
    		//compare with all in selected_ll.child_list.options and take highest
    		let current_score = 99;

    		selected_ll.child_list.options.forEach(l => {
    			let dl_temp = app$1.distance(l, str);

    			//console.log("dl_temp", dl_temp, l, str);
    			if (dl_temp < current_score) {
    				current_score = dl_temp;
    			}
    		});

    		if (current_score == 0 && selected_parent.children.indexOf(str) >= 0) {
    			current_score = -10;
    		}

    		return current_score;
    	}

    	function select_ll(ll) {
    		$$invalidate(6, selected_ll = ll);
    		$$invalidate(7, selected_parent = false);
    	}

    	function select_parent(pl) {
    		$$invalidate(7, selected_parent = pl);
    	}

    	function add_child_option(city) {
    		selected_parent.children.push(city);
    		$$invalidate(6, selected_ll);
    		$$invalidate(0, lls);
    	}

    	function faux_save() {
    		if (dirty_flag) {
    			$$invalidate(20, lls_copy = JSON.parse(JSON.stringify(lls)));
    		}
    	}

    	function add_pastes() {
    		paste_list.forEach(paste => {
    			if (paste.dot == "green") {
    				add_child_option(paste.title);
    			}
    		});

    		$$invalidate(3, pastetext = "");
    	}

    	function remove_child_option(pl, index) {
    		pl.children.sort().splice(index, 1);
    		$$invalidate(7, selected_parent);
    		$$invalidate(7, selected_parent);
    		$$invalidate(6, selected_ll);
    		$$invalidate(0, lls);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$6.warn(`<Frame_administration_linkedfields> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		nav("platform");
    	};

    	const click_handler_1 = () => {
    		nav("ehs");
    	};

    	const click_handler_2 = () => {
    		nav("administration");
    	};

    	const click_handler_3 = ll => {
    		select_ll(ll);
    	};

    	const click_handler_4 = pl => {
    		select_parent(pl);
    	};

    	const click_handler_5 = (pl, i) => remove_child_option(pl, i);

    	const click_handler_6 = () => {
    		$$invalidate(5, test_mode = true);
    	};

    	const click_handler_7 = () => {
    		$$invalidate(4, tab = "select");
    	};

    	const click_handler_8 = () => {
    		$$invalidate(4, tab = "paste");
    	};

    	const click_handler_9 = city => add_child_option(city);

    	function textarea_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			pastearea = $$value;
    			$$invalidate(2, pastearea);
    		});
    	}

    	function textarea_input_handler() {
    		pastetext = this.value;
    		(($$invalidate(3, pastetext), $$invalidate(1, paste_list)), $$invalidate(2, pastearea));
    	}

    	function select_change_handler() {
    		parent_test = select_value(this);
    		$$invalidate(8, parent_test);
    		$$invalidate(6, selected_ll);
    	}

    	const click_handler_10 = () => {
    		$$invalidate(5, test_mode = false);
    	};

    	$$self.$capture_state = () => ({
    		dl: app$1.distance,
    		tab,
    		lls,
    		test_mode,
    		lls_copy,
    		selected_ll,
    		selected_parent,
    		paste_list,
    		pastearea,
    		pastetext,
    		parent_test,
    		dot_color,
    		dl_score,
    		select_ll,
    		select_parent,
    		add_child_option,
    		faux_save,
    		add_pastes,
    		remove_child_option,
    		dirty_flag,
    		red_pastes,
    		green_pastes,
    		grey_pastes,
    		orange_pastes
    	});

    	$$self.$inject_state = $$props => {
    		if ("tab" in $$props) $$invalidate(4, tab = $$props.tab);
    		if ("lls" in $$props) $$invalidate(0, lls = $$props.lls);
    		if ("test_mode" in $$props) $$invalidate(5, test_mode = $$props.test_mode);
    		if ("lls_copy" in $$props) $$invalidate(20, lls_copy = $$props.lls_copy);
    		if ("selected_ll" in $$props) $$invalidate(6, selected_ll = $$props.selected_ll);
    		if ("selected_parent" in $$props) $$invalidate(7, selected_parent = $$props.selected_parent);
    		if ("paste_list" in $$props) $$invalidate(1, paste_list = $$props.paste_list);
    		if ("pastearea" in $$props) $$invalidate(2, pastearea = $$props.pastearea);
    		if ("pastetext" in $$props) $$invalidate(3, pastetext = $$props.pastetext);
    		if ("parent_test" in $$props) $$invalidate(8, parent_test = $$props.parent_test);
    		if ("dirty_flag" in $$props) $$invalidate(9, dirty_flag = $$props.dirty_flag);
    		if ("red_pastes" in $$props) $$invalidate(10, red_pastes = $$props.red_pastes);
    		if ("green_pastes" in $$props) $$invalidate(11, green_pastes = $$props.green_pastes);
    		if ("grey_pastes" in $$props) $$invalidate(12, grey_pastes = $$props.grey_pastes);
    		if ("orange_pastes" in $$props) $$invalidate(13, orange_pastes = $$props.orange_pastes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*lls, lls_copy*/ 1048577) {
    			$$invalidate(9, dirty_flag = JSON.stringify(lls) != JSON.stringify(lls_copy));
    		}

    		if ($$self.$$.dirty[0] & /*pastetext, paste_list, pastearea*/ 14) {
    			{
    				let p = pastetext;

    				if (p !== "") {
    					$$invalidate(1, paste_list = []);
    					let temp_list = p.split(/\r?\n/);

    					temp_list.forEach(paste => {
    						let dls = dl_score(paste);
    						let mod = dls < 0 ? dls : dls / paste.length;

    						let temp_obj = {
    							dl: mod,
    							dot: dot_color(mod),
    							title: paste
    						};

    						paste_list.push(temp_obj);
    					});

    					$$invalidate(1, paste_list = paste_list.sort((a, b) => {
    						console.log(a.title, b.title);
    						return a.title.localeCompare(b.title);
    					}));

    					$$invalidate(3, pastetext = "");
    					pastearea.blur();
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*paste_list*/ 2) {
    			$$invalidate(10, red_pastes = paste_list.filter(el => {
    				return el.dot == "red";
    			}).length);
    		}

    		if ($$self.$$.dirty[0] & /*paste_list*/ 2) {
    			$$invalidate(11, green_pastes = paste_list.filter(el => {
    				return el.dot == "green";
    			}).length);
    		}

    		if ($$self.$$.dirty[0] & /*paste_list*/ 2) {
    			$$invalidate(12, grey_pastes = paste_list.filter(el => {
    				return el.dot == "grey";
    			}).length);
    		}

    		if ($$self.$$.dirty[0] & /*paste_list*/ 2) {
    			$$invalidate(13, orange_pastes = paste_list.filter(el => {
    				return el.dot == "orange";
    			}).length);
    		}
    	};

    	return [
    		lls,
    		paste_list,
    		pastearea,
    		pastetext,
    		tab,
    		test_mode,
    		selected_ll,
    		selected_parent,
    		parent_test,
    		dirty_flag,
    		red_pastes,
    		green_pastes,
    		grey_pastes,
    		orange_pastes,
    		select_ll,
    		select_parent,
    		add_child_option,
    		faux_save,
    		add_pastes,
    		remove_child_option,
    		lls_copy,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5,
    		click_handler_6,
    		click_handler_7,
    		click_handler_8,
    		click_handler_9,
    		textarea_binding,
    		textarea_input_handler,
    		select_change_handler,
    		click_handler_10
    	];
    }

    class Frame_administration_linkedfields extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$s, create_fragment$s, safe_not_equal, {}, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Frame_administration_linkedfields",
    			options,
    			id: create_fragment$s.name
    		});
    	}
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    /**
     * Copyright (c) 2010,2011,2012,2013,2014 Morgan Roderick http://roderick.dk
     * License: MIT - http://mrgnrdrck.mit-license.org
     *
     * https://github.com/mroderick/PubSubJS
     */

    var pubsub = createCommonjsModule(function (module, exports) {
    (function (root, factory){

        var PubSub = {};

        if (root.PubSub) {
            PubSub = root.PubSub;
            console.warn("PubSub already loaded, using existing version");
        } else {
            root.PubSub = PubSub;
            factory(PubSub);
        }
        // CommonJS and Node.js module support
        {
            if (module !== undefined && module.exports) {
                exports = module.exports = PubSub; // Node.js specific `module.exports`
            }
            exports.PubSub = PubSub; // CommonJS module 1.1.1 spec
            module.exports = exports = PubSub; // CommonJS
        }

    }(( typeof window === 'object' && window ) || commonjsGlobal, function (PubSub){

        var messages = {},
            lastUid = -1,
            ALL_SUBSCRIBING_MSG = '*';

        function hasKeys(obj){
            var key;

            for (key in obj){
                if ( Object.prototype.hasOwnProperty.call(obj, key) ){
                    return true;
                }
            }
            return false;
        }

        /**
         * Returns a function that throws the passed exception, for use as argument for setTimeout
         * @alias throwException
         * @function
         * @param { Object } ex An Error object
         */
        function throwException( ex ){
            return function reThrowException(){
                throw ex;
            };
        }

        function callSubscriberWithDelayedExceptions( subscriber, message, data ){
            try {
                subscriber( message, data );
            } catch( ex ){
                setTimeout( throwException( ex ), 0);
            }
        }

        function callSubscriberWithImmediateExceptions( subscriber, message, data ){
            subscriber( message, data );
        }

        function deliverMessage( originalMessage, matchedMessage, data, immediateExceptions ){
            var subscribers = messages[matchedMessage],
                callSubscriber = immediateExceptions ? callSubscriberWithImmediateExceptions : callSubscriberWithDelayedExceptions,
                s;

            if ( !Object.prototype.hasOwnProperty.call( messages, matchedMessage ) ) {
                return;
            }

            for (s in subscribers){
                if ( Object.prototype.hasOwnProperty.call(subscribers, s)){
                    callSubscriber( subscribers[s], originalMessage, data );
                }
            }
        }

        function createDeliveryFunction( message, data, immediateExceptions ){
            return function deliverNamespaced(){
                var topic = String( message ),
                    position = topic.lastIndexOf( '.' );

                // deliver the message as it is now
                deliverMessage(message, message, data, immediateExceptions);

                // trim the hierarchy and deliver message to each level
                while( position !== -1 ){
                    topic = topic.substr( 0, position );
                    position = topic.lastIndexOf('.');
                    deliverMessage( message, topic, data, immediateExceptions );
                }

                deliverMessage(message, ALL_SUBSCRIBING_MSG, data, immediateExceptions);
            };
        }

        function hasDirectSubscribersFor( message ) {
            var topic = String( message ),
                found = Boolean(Object.prototype.hasOwnProperty.call( messages, topic ) && hasKeys(messages[topic]));

            return found;
        }

        function messageHasSubscribers( message ){
            var topic = String( message ),
                found = hasDirectSubscribersFor(topic) || hasDirectSubscribersFor(ALL_SUBSCRIBING_MSG),
                position = topic.lastIndexOf( '.' );

            while ( !found && position !== -1 ){
                topic = topic.substr( 0, position );
                position = topic.lastIndexOf( '.' );
                found = hasDirectSubscribersFor(topic);
            }

            return found;
        }

        function publish( message, data, sync, immediateExceptions ){
            message = (typeof message === 'symbol') ? message.toString() : message;

            var deliver = createDeliveryFunction( message, data, immediateExceptions ),
                hasSubscribers = messageHasSubscribers( message );

            if ( !hasSubscribers ){
                return false;
            }

            if ( sync === true ){
                deliver();
            } else {
                setTimeout( deliver, 0 );
            }
            return true;
        }

        /**
         * Publishes the message, passing the data to it's subscribers
         * @function
         * @alias publish
         * @param { String } message The message to publish
         * @param {} data The data to pass to subscribers
         * @return { Boolean }
         */
        PubSub.publish = function( message, data ){
            return publish( message, data, false, PubSub.immediateExceptions );
        };

        /**
         * Publishes the message synchronously, passing the data to it's subscribers
         * @function
         * @alias publishSync
         * @param { String } message The message to publish
         * @param {} data The data to pass to subscribers
         * @return { Boolean }
         */
        PubSub.publishSync = function( message, data ){
            return publish( message, data, true, PubSub.immediateExceptions );
        };

        /**
         * Subscribes the passed function to the passed message. Every returned token is unique and should be stored if you need to unsubscribe
         * @function
         * @alias subscribe
         * @param { String } message The message to subscribe to
         * @param { Function } func The function to call when a new message is published
         * @return { String }
         */
        PubSub.subscribe = function( message, func ){
            if ( typeof func !== 'function'){
                return false;
            }

            message = (typeof message === 'symbol') ? message.toString() : message;

            // message is not registered yet
            if ( !Object.prototype.hasOwnProperty.call( messages, message ) ){
                messages[message] = {};
            }

            // forcing token as String, to allow for future expansions without breaking usage
            // and allow for easy use as key names for the 'messages' object
            var token = 'uid_' + String(++lastUid);
            messages[message][token] = func;

            // return token for unsubscribing
            return token;
        };

        PubSub.subscribeAll = function( func ){
            return PubSub.subscribe(ALL_SUBSCRIBING_MSG, func);
        };

        /**
         * Subscribes the passed function to the passed message once
         * @function
         * @alias subscribeOnce
         * @param { String } message The message to subscribe to
         * @param { Function } func The function to call when a new message is published
         * @return { PubSub }
         */
        PubSub.subscribeOnce = function( message, func ){
            var token = PubSub.subscribe( message, function(){
                // before func apply, unsubscribe message
                PubSub.unsubscribe( token );
                func.apply( this, arguments );
            });
            return PubSub;
        };

        /**
         * Clears all subscriptions
         * @function
         * @public
         * @alias clearAllSubscriptions
         */
        PubSub.clearAllSubscriptions = function clearAllSubscriptions(){
            messages = {};
        };

        /**
         * Clear subscriptions by the topic
         * @function
         * @public
         * @alias clearAllSubscriptions
         * @return { int }
         */
        PubSub.clearSubscriptions = function clearSubscriptions(topic){
            var m;
            for (m in messages){
                if (Object.prototype.hasOwnProperty.call(messages, m) && m.indexOf(topic) === 0){
                    delete messages[m];
                }
            }
        };

        /**
           Count subscriptions by the topic
         * @function
         * @public
         * @alias countSubscriptions
         * @return { Array }
        */
        PubSub.countSubscriptions = function countSubscriptions(topic){
            var m;
            // eslint-disable-next-line no-unused-vars
            var token;
            var count = 0;
            for (m in messages) {
                if (Object.prototype.hasOwnProperty.call(messages, m) && m.indexOf(topic) === 0) {
                    for (token in messages[m]) {
                        count++;
                    }
                    break;
                }
            }
            return count;
        };


        /**
           Gets subscriptions by the topic
         * @function
         * @public
         * @alias getSubscriptions
        */
        PubSub.getSubscriptions = function getSubscriptions(topic){
            var m;
            var list = [];
            for (m in messages){
                if (Object.prototype.hasOwnProperty.call(messages, m) && m.indexOf(topic) === 0){
                    list.push(m);
                }
            }
            return list;
        };

        /**
         * Removes subscriptions
         *
         * - When passed a token, removes a specific subscription.
         *
    	 * - When passed a function, removes all subscriptions for that function
         *
    	 * - When passed a topic, removes all subscriptions for that topic (hierarchy)
         * @function
         * @public
         * @alias subscribeOnce
         * @param { String | Function } value A token, function or topic to unsubscribe from
         * @example // Unsubscribing with a token
         * var token = PubSub.subscribe('mytopic', myFunc);
         * PubSub.unsubscribe(token);
         * @example // Unsubscribing with a function
         * PubSub.unsubscribe(myFunc);
         * @example // Unsubscribing from a topic
         * PubSub.unsubscribe('mytopic');
         */
        PubSub.unsubscribe = function(value){
            var descendantTopicExists = function(topic) {
                    var m;
                    for ( m in messages ){
                        if ( Object.prototype.hasOwnProperty.call(messages, m) && m.indexOf(topic) === 0 ){
                            // a descendant of the topic exists:
                            return true;
                        }
                    }

                    return false;
                },
                isTopic    = typeof value === 'string' && ( Object.prototype.hasOwnProperty.call(messages, value) || descendantTopicExists(value) ),
                isToken    = !isTopic && typeof value === 'string',
                isFunction = typeof value === 'function',
                result = false,
                m, message, t;

            if (isTopic){
                PubSub.clearSubscriptions(value);
                return;
            }

            for ( m in messages ){
                if ( Object.prototype.hasOwnProperty.call( messages, m ) ){
                    message = messages[m];

                    if ( isToken && message[value] ){
                        delete message[value];
                        result = value;
                        // tokens are unique, so we can just stop here
                        break;
                    }

                    if (isFunction) {
                        for ( t in message ){
                            if (Object.prototype.hasOwnProperty.call(message, t) && message[t] === value){
                                delete message[t];
                                result = true;
                            }
                        }
                    }
                }
            }

            return result;
        };
    }));
    });

    /* src/components/Pullout.svelte generated by Svelte v3.35.0 */
    const file$r = "src/components/Pullout.svelte";
    const get_nofs_slot_changes = dirty => ({});
    const get_nofs_slot_context = ctx => ({});
    const get_fs_slot_changes = dirty => ({});
    const get_fs_slot_context = ctx => ({});

    // (44:0) {#if drawer_bool}
    function create_if_block$l(ctx) {
    	let div4;
    	let div0;
    	let t0;
    	let div3;
    	let div1;
    	let h2;
    	let t1;
    	let t2;
    	let t3;
    	let span;
    	let i;
    	let t4;
    	let div2;
    	let current_block_type_index;
    	let if_block1;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*canfs*/ ctx[4] && create_if_block_3$6(ctx);
    	const if_block_creators = [create_if_block_1$f, create_else_block_1$2];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*$$slots*/ ctx[8].fs) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div3 = element("div");
    			div1 = element("div");
    			h2 = element("h2");
    			if (if_block0) if_block0.c();
    			t1 = space();
    			t2 = text(/*title*/ ctx[1]);
    			t3 = space();
    			span = element("span");
    			i = element("i");
    			t4 = space();
    			div2 = element("div");
    			if_block1.c();
    			attr_dev(div0, "class", "mask");
    			toggle_class(div0, "visible", /*mask_visible*/ ctx[2]);
    			toggle_class(div0, "block", /*mask_block*/ ctx[3]);
    			add_location(div0, file$r, 45, 8, 917);
    			attr_dev(i, "class", "i-close i-24");
    			add_location(i, file$r, 57, 69, 1555);
    			attr_dev(span, "class", "close");
    			add_location(span, file$r, 57, 20, 1506);
    			add_location(h2, file$r, 48, 16, 1108);
    			attr_dev(div1, "class", "pullout-head");
    			add_location(div1, file$r, 47, 12, 1065);
    			attr_dev(div2, "class", "pullout-body");
    			add_location(div2, file$r, 60, 12, 1644);
    			attr_dev(div3, "class", "pullout svelte-145fk5c");
    			toggle_class(div3, "in", /*drawer_in*/ ctx[5]);
    			add_location(div3, file$r, 46, 8, 1008);
    			attr_dev(div4, "class", "drawer svelte-145fk5c");
    			toggle_class(div4, "fs", /*fs*/ ctx[0]);
    			add_location(div4, file$r, 44, 4, 879);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			append_dev(div4, t0);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			append_dev(div1, h2);
    			if (if_block0) if_block0.m(h2, null);
    			append_dev(h2, t1);
    			append_dev(h2, t2);
    			append_dev(h2, t3);
    			append_dev(h2, span);
    			append_dev(span, i);
    			append_dev(div3, t4);
    			append_dev(div3, div2);
    			if_blocks[current_block_type_index].m(div2, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(span, "click", /*hide_the_drawer*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*mask_visible*/ 4) {
    				toggle_class(div0, "visible", /*mask_visible*/ ctx[2]);
    			}

    			if (dirty & /*mask_block*/ 8) {
    				toggle_class(div0, "block", /*mask_block*/ ctx[3]);
    			}

    			if (/*canfs*/ ctx[4]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_3$6(ctx);
    					if_block0.c();
    					if_block0.m(h2, t1);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (!current || dirty & /*title*/ 2) set_data_dev(t2, /*title*/ ctx[1]);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block1 = if_blocks[current_block_type_index];

    				if (!if_block1) {
    					if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block1.c();
    				} else {
    					if_block1.p(ctx, dirty);
    				}

    				transition_in(if_block1, 1);
    				if_block1.m(div2, null);
    			}

    			if (dirty & /*drawer_in*/ 32) {
    				toggle_class(div3, "in", /*drawer_in*/ ctx[5]);
    			}

    			if (dirty & /*fs*/ 1) {
    				toggle_class(div4, "fs", /*fs*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if (if_block0) if_block0.d();
    			if_blocks[current_block_type_index].d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$l.name,
    		type: "if",
    		source: "(44:0) {#if drawer_bool}",
    		ctx
    	});

    	return block;
    }

    // (50:20) {#if canfs}
    function create_if_block_3$6(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*fs*/ ctx[0]) return create_if_block_4$5;
    		return create_else_block_2$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$6.name,
    		type: "if",
    		source: "(50:20) {#if canfs}",
    		ctx
    	});

    	return block;
    }

    // (53:24) {:else}
    function create_else_block_2$1(ctx) {
    	let i;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "i-maximize i-24");
    			add_location(i, file$r, 53, 28, 1334);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);

    			if (!mounted) {
    				dispose = listen_dev(i, "click", /*click_handler_1*/ ctx[13], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2$1.name,
    		type: "else",
    		source: "(53:24) {:else}",
    		ctx
    	});

    	return block;
    }

    // (51:24) {#if fs}
    function create_if_block_4$5(ctx) {
    	let i;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "i-minimize i-24");
    			add_location(i, file$r, 51, 28, 1206);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);

    			if (!mounted) {
    				dispose = listen_dev(i, "click", /*click_handler*/ ctx[12], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$5.name,
    		type: "if",
    		source: "(51:24) {#if fs}",
    		ctx
    	});

    	return block;
    }

    // (71:16) {:else}
    function create_else_block_1$2(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[11].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1024) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[10], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$2.name,
    		type: "else",
    		source: "(71:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (63:16) {#if $$slots.fs}
    function create_if_block_1$f(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_2$c, create_else_block$c];
    	const if_blocks = [];

    	function select_block_type_2(ctx, dirty) {
    		if (/*fs*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_2(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_2(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$f.name,
    		type: "if",
    		source: "(63:16) {#if $$slots.fs}",
    		ctx
    	});

    	return block;
    }

    // (67:20) {:else}
    function create_else_block$c(ctx) {
    	let current;
    	const nofs_slot_template = /*#slots*/ ctx[11].nofs;
    	const nofs_slot = create_slot(nofs_slot_template, ctx, /*$$scope*/ ctx[10], get_nofs_slot_context);

    	const block = {
    		c: function create() {
    			if (nofs_slot) nofs_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (nofs_slot) {
    				nofs_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (nofs_slot) {
    				if (nofs_slot.p && dirty & /*$$scope*/ 1024) {
    					update_slot(nofs_slot, nofs_slot_template, ctx, /*$$scope*/ ctx[10], dirty, get_nofs_slot_changes, get_nofs_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(nofs_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(nofs_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (nofs_slot) nofs_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$c.name,
    		type: "else",
    		source: "(67:20) {:else}",
    		ctx
    	});

    	return block;
    }

    // (65:20) {#if fs}
    function create_if_block_2$c(ctx) {
    	let current;
    	const fs_slot_template = /*#slots*/ ctx[11].fs;
    	const fs_slot = create_slot(fs_slot_template, ctx, /*$$scope*/ ctx[10], get_fs_slot_context);

    	const block = {
    		c: function create() {
    			if (fs_slot) fs_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (fs_slot) {
    				fs_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (fs_slot) {
    				if (fs_slot.p && dirty & /*$$scope*/ 1024) {
    					update_slot(fs_slot, fs_slot_template, ctx, /*$$scope*/ ctx[10], dirty, get_fs_slot_changes, get_fs_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fs_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fs_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (fs_slot) fs_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$c.name,
    		type: "if",
    		source: "(65:20) {#if fs}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$r(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*drawer_bool*/ ctx[6] && create_if_block$l(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*drawer_bool*/ ctx[6]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*drawer_bool*/ 64) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$l(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$r.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$r($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Pullout", slots, ['fs','nofs','default']);
    	const $$slots = compute_slots(slots);
    	const dispatch = createEventDispatcher();
    	let { title = "Pullout drawer" } = $$props;
    	let { mask_visible = true } = $$props;
    	let { mask_block = true } = $$props;
    	let { show_drawer = false } = $$props;
    	let { canfs = false } = $$props;
    	let { fs = false } = $$props;
    	let drawer_in = false;
    	let drawer_bool = false;

    	function show_the_drawer() {
    		$$invalidate(6, drawer_bool = true);

    		setTimeout(
    			() => {
    				$$invalidate(5, drawer_in = true);
    			},
    			300
    		);
    	}

    	function hide_the_drawer() {
    		$$invalidate(5, drawer_in = false);

    		setTimeout(
    			() => {
    				$$invalidate(6, drawer_bool = false);
    			},
    			300
    		);

    		dispatch("close", {});
    	}

    	const writable_props = ["title", "mask_visible", "mask_block", "show_drawer", "canfs", "fs"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Pullout> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		$$invalidate(0, fs = false);
    	};

    	const click_handler_1 = () => {
    		$$invalidate(0, fs = true);
    	};

    	$$self.$$set = $$props => {
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("mask_visible" in $$props) $$invalidate(2, mask_visible = $$props.mask_visible);
    		if ("mask_block" in $$props) $$invalidate(3, mask_block = $$props.mask_block);
    		if ("show_drawer" in $$props) $$invalidate(9, show_drawer = $$props.show_drawer);
    		if ("canfs" in $$props) $$invalidate(4, canfs = $$props.canfs);
    		if ("fs" in $$props) $$invalidate(0, fs = $$props.fs);
    		if ("$$scope" in $$props) $$invalidate(10, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		title,
    		mask_visible,
    		mask_block,
    		show_drawer,
    		canfs,
    		fs,
    		drawer_in,
    		drawer_bool,
    		show_the_drawer,
    		hide_the_drawer
    	});

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("mask_visible" in $$props) $$invalidate(2, mask_visible = $$props.mask_visible);
    		if ("mask_block" in $$props) $$invalidate(3, mask_block = $$props.mask_block);
    		if ("show_drawer" in $$props) $$invalidate(9, show_drawer = $$props.show_drawer);
    		if ("canfs" in $$props) $$invalidate(4, canfs = $$props.canfs);
    		if ("fs" in $$props) $$invalidate(0, fs = $$props.fs);
    		if ("drawer_in" in $$props) $$invalidate(5, drawer_in = $$props.drawer_in);
    		if ("drawer_bool" in $$props) $$invalidate(6, drawer_bool = $$props.drawer_bool);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*show_drawer*/ 512) {
    			{
    				let s = show_drawer;

    				if (s) {
    					show_the_drawer();
    				} else {
    					hide_the_drawer();
    				}
    			}
    		}
    	};

    	return [
    		fs,
    		title,
    		mask_visible,
    		mask_block,
    		canfs,
    		drawer_in,
    		drawer_bool,
    		hide_the_drawer,
    		$$slots,
    		show_drawer,
    		$$scope,
    		slots,
    		click_handler,
    		click_handler_1
    	];
    }

    class Pullout extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$r, create_fragment$r, safe_not_equal, {
    			title: 1,
    			mask_visible: 2,
    			mask_block: 3,
    			show_drawer: 9,
    			canfs: 4,
    			fs: 0
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Pullout",
    			options,
    			id: create_fragment$r.name
    		});
    	}

    	get title() {
    		throw new Error("<Pullout>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Pullout>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mask_visible() {
    		throw new Error("<Pullout>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mask_visible(value) {
    		throw new Error("<Pullout>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mask_block() {
    		throw new Error("<Pullout>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mask_block(value) {
    		throw new Error("<Pullout>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get show_drawer() {
    		throw new Error("<Pullout>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set show_drawer(value) {
    		throw new Error("<Pullout>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get canfs() {
    		throw new Error("<Pullout>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set canfs(value) {
    		throw new Error("<Pullout>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fs() {
    		throw new Error("<Pullout>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fs(value) {
    		throw new Error("<Pullout>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/form/InputSelect.svelte generated by Svelte v3.35.0 */

    const file$q = "src/components/form/InputSelect.svelte";

    function get_each_context$e(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (8:4) {#if f.label}
    function create_if_block_1$e(ctx) {
    	let label;
    	let t_value = /*f*/ ctx[0].label + "";
    	let t;
    	let label_for_value;

    	const block = {
    		c: function create() {
    			label = element("label");
    			t = text(t_value);
    			attr_dev(label, "for", label_for_value = /*f*/ ctx[0].id);
    			add_location(label, file$q, 8, 8, 124);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*f*/ 1 && t_value !== (t_value = /*f*/ ctx[0].label + "")) set_data_dev(t, t_value);

    			if (dirty & /*f*/ 1 && label_for_value !== (label_for_value = /*f*/ ctx[0].id)) {
    				attr_dev(label, "for", label_for_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$e.name,
    		type: "if",
    		source: "(8:4) {#if f.label}",
    		ctx
    	});

    	return block;
    }

    // (11:4) {#if f.hint}
    function create_if_block$k(ctx) {
    	let p;
    	let t_value = /*f*/ ctx[0].hint + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			add_location(p, file$q, 11, 8, 197);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*f*/ 1 && t_value !== (t_value = /*f*/ ctx[0].hint + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$k.name,
    		type: "if",
    		source: "(11:4) {#if f.hint}",
    		ctx
    	});

    	return block;
    }

    // (15:8) {#each f.options as option}
    function create_each_block$e(ctx) {
    	let option;
    	let t_value = /*option*/ ctx[3].text + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*option*/ ctx[3].value;
    			option.value = option.__value;
    			add_location(option, file$q, 15, 12, 328);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*f*/ 1 && t_value !== (t_value = /*option*/ ctx[3].text + "")) set_data_dev(t, t_value);

    			if (dirty & /*f*/ 1 && option_value_value !== (option_value_value = /*option*/ ctx[3].value)) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$e.name,
    		type: "each",
    		source: "(15:8) {#each f.options as option}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$q(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let select;
    	let mounted;
    	let dispose;
    	let if_block0 = /*f*/ ctx[0].label && create_if_block_1$e(ctx);
    	let if_block1 = /*f*/ ctx[0].hint && create_if_block$k(ctx);
    	let each_value = /*f*/ ctx[0].options;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$e(get_each_context$e(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(select, "class", "form-control");
    			if (/*f*/ ctx[0].answer === void 0) add_render_callback(() => /*select_change_handler*/ ctx[2].call(select));
    			add_location(select, file$q, 13, 4, 227);
    			attr_dev(div, "class", "form-item");
    			add_location(div, file$q, 6, 0, 74);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t0);
    			if (if_block1) if_block1.m(div, null);
    			append_dev(div, t1);
    			append_dev(div, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*f*/ ctx[0].answer);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[2]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*f*/ ctx[0].label) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$e(ctx);
    					if_block0.c();
    					if_block0.m(div, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*f*/ ctx[0].hint) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$k(ctx);
    					if_block1.c();
    					if_block1.m(div, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*f*/ 1) {
    				each_value = /*f*/ ctx[0].options;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$e(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$e(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*f*/ 1) {
    				select_option(select, /*f*/ ctx[0].answer);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$q.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$q($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("InputSelect", slots, []);
    	let { f } = $$props;
    	let { channel = "ANSWER" } = $$props;
    	const writable_props = ["f", "channel"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<InputSelect> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		f.answer = select_value(this);
    		$$invalidate(0, f);
    	}

    	$$self.$$set = $$props => {
    		if ("f" in $$props) $$invalidate(0, f = $$props.f);
    		if ("channel" in $$props) $$invalidate(1, channel = $$props.channel);
    	};

    	$$self.$capture_state = () => ({ f, channel });

    	$$self.$inject_state = $$props => {
    		if ("f" in $$props) $$invalidate(0, f = $$props.f);
    		if ("channel" in $$props) $$invalidate(1, channel = $$props.channel);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [f, channel, select_change_handler];
    }

    class InputSelect extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$q, create_fragment$q, safe_not_equal, { f: 0, channel: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InputSelect",
    			options,
    			id: create_fragment$q.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*f*/ ctx[0] === undefined && !("f" in props)) {
    			console.warn("<InputSelect> was created without expected prop 'f'");
    		}
    	}

    	get f() {
    		throw new Error("<InputSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set f(value) {
    		throw new Error("<InputSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get channel() {
    		throw new Error("<InputSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set channel(value) {
    		throw new Error("<InputSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/form/Shortcuts.svelte generated by Svelte v3.35.0 */
    const file$p = "src/components/form/Shortcuts.svelte";

    function get_each_context$d(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (13:0) {#if f.shortcuts}
    function create_if_block$j(ctx) {
    	let div;
    	let each_value = /*f*/ ctx[0].shortcuts;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$d(get_each_context$d(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "shortcuts svelte-nlr8e4");
    			add_location(div, file$p, 13, 4, 250);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*click_shortcut, f*/ 3) {
    				each_value = /*f*/ ctx[0].shortcuts;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$d(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$d(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$j.name,
    		type: "if",
    		source: "(13:0) {#if f.shortcuts}",
    		ctx
    	});

    	return block;
    }

    // (15:8) {#each f.shortcuts as shortcut}
    function create_each_block$d(ctx) {
    	let div;
    	let t0_value = /*shortcut*/ ctx[4].text + "";
    	let t0;
    	let t1;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[2](/*shortcut*/ ctx[4]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(div, "class", "shortcut svelte-nlr8e4");
    			add_location(div, file$p, 15, 12, 326);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*f*/ 1 && t0_value !== (t0_value = /*shortcut*/ ctx[4].text + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$d.name,
    		type: "each",
    		source: "(15:8) {#each f.shortcuts as shortcut}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$p(ctx) {
    	let if_block_anchor;
    	let if_block = /*f*/ ctx[0].shortcuts && create_if_block$j(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*f*/ ctx[0].shortcuts) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$j(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$p.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$p($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Shortcuts", slots, []);
    	const dispatch = createEventDispatcher();
    	let { f } = $$props;

    	function click_shortcut(s) {
    		dispatch("shortcut", { value: s.value });
    	}

    	const writable_props = ["f"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Shortcuts> was created with unknown prop '${key}'`);
    	});

    	const click_handler = shortcut => {
    		click_shortcut(shortcut);
    	};

    	$$self.$$set = $$props => {
    		if ("f" in $$props) $$invalidate(0, f = $$props.f);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		f,
    		click_shortcut
    	});

    	$$self.$inject_state = $$props => {
    		if ("f" in $$props) $$invalidate(0, f = $$props.f);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [f, click_shortcut, click_handler];
    }

    class Shortcuts extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$p, create_fragment$p, safe_not_equal, { f: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Shortcuts",
    			options,
    			id: create_fragment$p.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*f*/ ctx[0] === undefined && !("f" in props)) {
    			console.warn("<Shortcuts> was created without expected prop 'f'");
    		}
    	}

    	get f() {
    		throw new Error("<Shortcuts>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set f(value) {
    		throw new Error("<Shortcuts>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/form/InputText.svelte generated by Svelte v3.35.0 */
    const file$o = "src/components/form/InputText.svelte";

    // (8:4) {#if f.label}
    function create_if_block_1$d(ctx) {
    	let label;
    	let t0_value = /*f*/ ctx[0].label + "";
    	let t0;
    	let t1;
    	let label_for_value;
    	let if_block = /*f*/ ctx[0].optional && create_if_block_2$b(ctx);

    	const block = {
    		c: function create() {
    			label = element("label");
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block) if_block.c();
    			attr_dev(label, "for", label_for_value = /*f*/ ctx[0].id);
    			add_location(label, file$o, 8, 8, 137);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, t0);
    			append_dev(label, t1);
    			if (if_block) if_block.m(label, null);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*f*/ 1 && t0_value !== (t0_value = /*f*/ ctx[0].label + "")) set_data_dev(t0, t0_value);

    			if (/*f*/ ctx[0].optional) {
    				if (if_block) ; else {
    					if_block = create_if_block_2$b(ctx);
    					if_block.c();
    					if_block.m(label, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*f*/ 1 && label_for_value !== (label_for_value = /*f*/ ctx[0].id)) {
    				attr_dev(label, "for", label_for_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$d.name,
    		type: "if",
    		source: "(8:4) {#if f.label}",
    		ctx
    	});

    	return block;
    }

    // (9:38) {#if f.optional}
    function create_if_block_2$b(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "(Optional)";
    			attr_dev(span, "class", "optional");
    			add_location(span, file$o, 8, 54, 183);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$b.name,
    		type: "if",
    		source: "(9:38) {#if f.optional}",
    		ctx
    	});

    	return block;
    }

    // (11:4) {#if f.hint}
    function create_if_block$i(ctx) {
    	let p;
    	let t_value = /*f*/ ctx[0].hint + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			add_location(p, file$o, 11, 8, 272);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*f*/ 1 && t_value !== (t_value = /*f*/ ctx[0].hint + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$i.name,
    		type: "if",
    		source: "(11:4) {#if f.hint}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$o(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let input;
    	let input_id_value;
    	let input_placeholder_value;
    	let t2;
    	let shortcuts;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*f*/ ctx[0].label && create_if_block_1$d(ctx);
    	let if_block1 = /*f*/ ctx[0].hint && create_if_block$i(ctx);

    	shortcuts = new Shortcuts({
    			props: { f: /*f*/ ctx[0] },
    			$$inline: true
    		});

    	shortcuts.$on("shortcut", /*shortcut_handler*/ ctx[2]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			input = element("input");
    			t2 = space();
    			create_component(shortcuts.$$.fragment);
    			attr_dev(input, "id", input_id_value = /*f*/ ctx[0].id);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", input_placeholder_value = /*f*/ ctx[0].placeholder ? /*f*/ ctx[0].placeholder : "");
    			attr_dev(input, "class", "form-control");
    			add_location(input, file$o, 13, 4, 302);
    			attr_dev(div, "class", "form-item");
    			add_location(div, file$o, 6, 0, 87);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t0);
    			if (if_block1) if_block1.m(div, null);
    			append_dev(div, t1);
    			append_dev(div, input);
    			set_input_value(input, /*f*/ ctx[0].answer);
    			append_dev(div, t2);
    			mount_component(shortcuts, div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[1]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*f*/ ctx[0].label) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$d(ctx);
    					if_block0.c();
    					if_block0.m(div, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*f*/ ctx[0].hint) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$i(ctx);
    					if_block1.c();
    					if_block1.m(div, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (!current || dirty & /*f*/ 1 && input_id_value !== (input_id_value = /*f*/ ctx[0].id)) {
    				attr_dev(input, "id", input_id_value);
    			}

    			if (!current || dirty & /*f*/ 1 && input_placeholder_value !== (input_placeholder_value = /*f*/ ctx[0].placeholder ? /*f*/ ctx[0].placeholder : "")) {
    				attr_dev(input, "placeholder", input_placeholder_value);
    			}

    			if (dirty & /*f*/ 1 && input.value !== /*f*/ ctx[0].answer) {
    				set_input_value(input, /*f*/ ctx[0].answer);
    			}

    			const shortcuts_changes = {};
    			if (dirty & /*f*/ 1) shortcuts_changes.f = /*f*/ ctx[0];
    			shortcuts.$set(shortcuts_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(shortcuts.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(shortcuts.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			destroy_component(shortcuts);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$o.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$o($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("InputText", slots, []);
    	let { f } = $$props;
    	const writable_props = ["f"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<InputText> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		f.answer = this.value;
    		$$invalidate(0, f);
    	}

    	const shortcut_handler = ev => {
    		$$invalidate(0, f.answer = ev.detail.value.toLocaleString(), f);
    	};

    	$$self.$$set = $$props => {
    		if ("f" in $$props) $$invalidate(0, f = $$props.f);
    	};

    	$$self.$capture_state = () => ({ Shortcuts, f });

    	$$self.$inject_state = $$props => {
    		if ("f" in $$props) $$invalidate(0, f = $$props.f);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [f, input_input_handler, shortcut_handler];
    }

    class InputText extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$o, create_fragment$o, safe_not_equal, { f: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InputText",
    			options,
    			id: create_fragment$o.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*f*/ ctx[0] === undefined && !("f" in props)) {
    			console.warn("<InputText> was created without expected prop 'f'");
    		}
    	}

    	get f() {
    		throw new Error("<InputText>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set f(value) {
    		throw new Error("<InputText>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/form/InputMultiItem.svelte generated by Svelte v3.35.0 */
    const file$n = "src/components/form/InputMultiItem.svelte";

    function get_each_context$c(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    // (24:0) {#if f.visible}
    function create_if_block$h(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let t2_value = /*f*/ ctx[0].value + "";
    	let t2;
    	let t3;
    	let div_class_value;
    	let t4;
    	let if_block3_anchor;
    	let current;
    	let if_block0 = /*f*/ ctx[0].children && create_if_block_5$3(ctx);
    	let if_block1 = /*f*/ ctx[0].selectable && create_if_block_3$5(ctx);
    	let if_block2 = /*f*/ ctx[0].pii && create_if_block_2$a(ctx);
    	let if_block3 = /*f*/ ctx[0].children && /*f*/ ctx[0].expanded && create_if_block_1$c(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			t2 = text(t2_value);
    			t3 = space();
    			if (if_block2) if_block2.c();
    			t4 = space();
    			if (if_block3) if_block3.c();
    			if_block3_anchor = empty();
    			attr_dev(div, "class", div_class_value = "multi-item indent" + /*indent_class*/ ctx[2] + " svelte-1bmql47");
    			add_location(div, file$n, 24, 4, 509);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t0);
    			if (if_block1) if_block1.m(div, null);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			append_dev(div, t3);
    			if (if_block2) if_block2.m(div, null);
    			insert_dev(target, t4, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert_dev(target, if_block3_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*f*/ ctx[0].children) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_5$3(ctx);
    					if_block0.c();
    					if_block0.m(div, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*f*/ ctx[0].selectable) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_3$5(ctx);
    					if_block1.c();
    					if_block1.m(div, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if ((!current || dirty & /*f*/ 1) && t2_value !== (t2_value = /*f*/ ctx[0].value + "")) set_data_dev(t2, t2_value);

    			if (/*f*/ ctx[0].pii) {
    				if (if_block2) ; else {
    					if_block2 = create_if_block_2$a(ctx);
    					if_block2.c();
    					if_block2.m(div, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (!current || dirty & /*indent_class*/ 4 && div_class_value !== (div_class_value = "multi-item indent" + /*indent_class*/ ctx[2] + " svelte-1bmql47")) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (/*f*/ ctx[0].children && /*f*/ ctx[0].expanded) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty & /*f*/ 1) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block_1$c(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(if_block3_anchor.parentNode, if_block3_anchor);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block3);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block3);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (detaching) detach_dev(t4);
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach_dev(if_block3_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$h.name,
    		type: "if",
    		source: "(24:0) {#if f.visible}",
    		ctx
    	});

    	return block;
    }

    // (26:8) {#if f.children}
    function create_if_block_5$3(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*f*/ ctx[0].expanded) return create_if_block_6$2;
    		if (/*f*/ ctx[0].expanded === false) return create_if_block_7$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) {
    				if_block.d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$3.name,
    		type: "if",
    		source: "(26:8) {#if f.children}",
    		ctx
    	});

    	return block;
    }

    // (29:43) 
    function create_if_block_7$2(ctx) {
    	let i;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "i-chevron-down i-20");
    			add_location(i, file$n, 29, 16, 765);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);

    			if (!mounted) {
    				dispose = listen_dev(i, "click", /*click_handler_1*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7$2.name,
    		type: "if",
    		source: "(29:43) ",
    		ctx
    	});

    	return block;
    }

    // (27:12) {#if f.expanded}
    function create_if_block_6$2(ctx) {
    	let i;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "i-chevron-up i-20");
    			add_location(i, file$n, 27, 16, 626);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);

    			if (!mounted) {
    				dispose = listen_dev(i, "click", /*click_handler*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$2.name,
    		type: "if",
    		source: "(27:12) {#if f.expanded}",
    		ctx
    	});

    	return block;
    }

    // (33:8) {#if f.selectable}
    function create_if_block_3$5(ctx) {
    	let if_block_anchor;

    	function select_block_type_1(ctx, dirty) {
    		if (/*f*/ ctx[0].selected) return create_if_block_4$4;
    		return create_else_block$b;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$5.name,
    		type: "if",
    		source: "(33:8) {#if f.selectable}",
    		ctx
    	});

    	return block;
    }

    // (36:12) {:else}
    function create_else_block$b(ctx) {
    	let i;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "i-checkbox i-20");
    			add_location(i, file$n, 36, 16, 1051);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);

    			if (!mounted) {
    				dispose = listen_dev(i, "click", /*toggle_item*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$b.name,
    		type: "else",
    		source: "(36:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (34:12) {#if f.selected}
    function create_if_block_4$4(ctx) {
    	let i;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "i-checkbox-selected i-20");
    			add_location(i, file$n, 34, 16, 949);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);

    			if (!mounted) {
    				dispose = listen_dev(i, "click", /*toggle_item*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$4.name,
    		type: "if",
    		source: "(34:12) {#if f.selected}",
    		ctx
    	});

    	return block;
    }

    // (41:8) {#if f.pii}
    function create_if_block_2$a(ctx) {
    	let i;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "title", "Personally Identifiable Information");
    			attr_dev(i, "class", "i-fingerprint i-16");
    			add_location(i, file$n, 41, 16, 1194);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$a.name,
    		type: "if",
    		source: "(41:8) {#if f.pii}",
    		ctx
    	});

    	return block;
    }

    // (47:4) {#if f.children && f.expanded}
    function create_if_block_1$c(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*f*/ ctx[0].children;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$c(get_each_context$c(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

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
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*f, indent, handleItemUpdate*/ 19) {
    				each_value = /*f*/ ctx[0].children;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$c(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$c(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$c.name,
    		type: "if",
    		source: "(47:4) {#if f.children && f.expanded}",
    		ctx
    	});

    	return block;
    }

    // (48:8) {#each f.children as f}
    function create_each_block$c(ctx) {
    	let inputmultiitem;
    	let current;

    	inputmultiitem = new InputMultiItem({
    			props: {
    				f: /*f*/ ctx[0],
    				indent: /*indent*/ ctx[1] + 1
    			},
    			$$inline: true
    		});

    	inputmultiitem.$on("item_update", /*handleItemUpdate*/ ctx[4]);

    	const block = {
    		c: function create() {
    			create_component(inputmultiitem.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(inputmultiitem, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const inputmultiitem_changes = {};
    			if (dirty & /*f*/ 1) inputmultiitem_changes.f = /*f*/ ctx[0];
    			if (dirty & /*indent*/ 2) inputmultiitem_changes.indent = /*indent*/ ctx[1] + 1;
    			inputmultiitem.$set(inputmultiitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(inputmultiitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(inputmultiitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(inputmultiitem, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$c.name,
    		type: "each",
    		source: "(48:8) {#each f.children as f}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$n(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*f*/ ctx[0].visible && create_if_block$h(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*f*/ ctx[0].visible) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*f*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$h(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$n($$self, $$props, $$invalidate) {
    	let indent_class;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("InputMultiItem", slots, []);
    	let { f } = $$props;
    	let { indent = 0 } = $$props;
    	const dispatch = createEventDispatcher();

    	function toggle_item() {
    		$$invalidate(0, f.selected = !f.selected, f);
    		dispatch("item_update", { item: f });
    	}

    	function handleItemUpdate(ev) {
    		dispatch("item_update", { item: ev.detail.item });
    	}

    	const writable_props = ["f", "indent"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<InputMultiItem> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		$$invalidate(0, f.expanded = false, f);
    	};

    	const click_handler_1 = () => {
    		$$invalidate(0, f.expanded = true, f);
    	};

    	$$self.$$set = $$props => {
    		if ("f" in $$props) $$invalidate(0, f = $$props.f);
    		if ("indent" in $$props) $$invalidate(1, indent = $$props.indent);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		Item: InputMultiItem,
    		f,
    		indent,
    		dispatch,
    		toggle_item,
    		handleItemUpdate,
    		indent_class
    	});

    	$$self.$inject_state = $$props => {
    		if ("f" in $$props) $$invalidate(0, f = $$props.f);
    		if ("indent" in $$props) $$invalidate(1, indent = $$props.indent);
    		if ("indent_class" in $$props) $$invalidate(2, indent_class = $$props.indent_class);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*indent*/ 2) {
    			$$invalidate(2, indent_class = indent > 5 ? 5 : indent);
    		}
    	};

    	return [
    		f,
    		indent,
    		indent_class,
    		toggle_item,
    		handleItemUpdate,
    		click_handler,
    		click_handler_1
    	];
    }

    class InputMultiItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, { f: 0, indent: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InputMultiItem",
    			options,
    			id: create_fragment$n.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*f*/ ctx[0] === undefined && !("f" in props)) {
    			console.warn("<InputMultiItem> was created without expected prop 'f'");
    		}
    	}

    	get f() {
    		throw new Error("<InputMultiItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set f(value) {
    		throw new Error("<InputMultiItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get indent() {
    		throw new Error("<InputMultiItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set indent(value) {
    		throw new Error("<InputMultiItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/form/InputMulti.svelte generated by Svelte v3.35.0 */
    const file$m = "src/components/form/InputMulti.svelte";

    function get_each_context_1$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    function get_each_context$b(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    function get_each_context_2$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[26] = list[i];
    	return child_ctx;
    }

    // (137:4) {#if f.label}
    function create_if_block_10$1(ctx) {
    	let label;
    	let t_value = /*f*/ ctx[0].label + "";
    	let t;
    	let label_for_value;

    	const block = {
    		c: function create() {
    			label = element("label");
    			t = text(t_value);
    			attr_dev(label, "for", label_for_value = /*f*/ ctx[0].id);
    			add_location(label, file$m, 137, 8, 3697);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*f*/ 1 && t_value !== (t_value = /*f*/ ctx[0].label + "")) set_data_dev(t, t_value);

    			if (dirty & /*f*/ 1 && label_for_value !== (label_for_value = /*f*/ ctx[0].id)) {
    				attr_dev(label, "for", label_for_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10$1.name,
    		type: "if",
    		source: "(137:4) {#if f.label}",
    		ctx
    	});

    	return block;
    }

    // (140:4) {#if f.hint}
    function create_if_block_9$1(ctx) {
    	let p;
    	let t_value = /*f*/ ctx[0].hint + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			add_location(p, file$m, 140, 8, 3770);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*f*/ 1 && t_value !== (t_value = /*f*/ ctx[0].hint + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9$1.name,
    		type: "if",
    		source: "(140:4) {#if f.hint}",
    		ctx
    	});

    	return block;
    }

    // (143:4) {#if f.max_warning}
    function create_if_block_7$1(ctx) {
    	let if_block_anchor;
    	let if_block = /*selected*/ ctx[4].length >= /*f*/ ctx[0].max_warning.value && create_if_block_8$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*selected*/ ctx[4].length >= /*f*/ ctx[0].max_warning.value) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_8$1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7$1.name,
    		type: "if",
    		source: "(143:4) {#if f.max_warning}",
    		ctx
    	});

    	return block;
    }

    // (144:8) {#if selected.length >= f.max_warning.value}
    function create_if_block_8$1(ctx) {
    	let div;
    	let i;
    	let p;
    	let t_value = /*f*/ ctx[0].max_warning.message + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			i = element("i");
    			p = element("p");
    			t = text(t_value);
    			attr_dev(i, "class", "i-idea i-24");
    			add_location(i, file$m, 144, 30, 3903);
    			attr_dev(p, "class", "svelte-1a5p6xm");
    			add_location(p, file$m, 144, 57, 3930);
    			attr_dev(div, "class", "idea svelte-1a5p6xm");
    			add_location(div, file$m, 144, 12, 3885);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, i);
    			append_dev(div, p);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*f*/ 1 && t_value !== (t_value = /*f*/ ctx[0].max_warning.message + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8$1.name,
    		type: "if",
    		source: "(144:8) {#if selected.length >= f.max_warning.value}",
    		ctx
    	});

    	return block;
    }

    // (148:4) {#if dd_in}
    function create_if_block_6$1(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "multi-mask svelte-1a5p6xm");
    			add_location(div, file$m, 148, 8, 4015);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler*/ ctx[10], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$1.name,
    		type: "if",
    		source: "(148:4) {#if dd_in}",
    		ctx
    	});

    	return block;
    }

    // (151:4) {#if selected_shortlist.length}
    function create_if_block_3$4(ctx) {
    	let t;
    	let if_block_anchor;
    	let each_value_2 = /*selected_shortlist*/ ctx[5];
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2$3(get_each_context_2$3(ctx, each_value_2, i));
    	}

    	let if_block = /*selected_shortlist*/ ctx[5].length < /*selected*/ ctx[4].length && create_if_block_4$3(ctx);

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*selected_shortlist, remove_tag*/ 96) {
    				each_value_2 = /*selected_shortlist*/ ctx[5];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2$3(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(t.parentNode, t);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}

    			if (/*selected_shortlist*/ ctx[5].length < /*selected*/ ctx[4].length) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_4$3(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$4.name,
    		type: "if",
    		source: "(151:4) {#if selected_shortlist.length}",
    		ctx
    	});

    	return block;
    }

    // (155:12) {:else}
    function create_else_block_1$1(ctx) {
    	let div;
    	let t_value = /*tag*/ ctx[26].value + "";
    	let t;
    	let i;
    	let mounted;
    	let dispose;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[11](/*tag*/ ctx[26]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			i = element("i");
    			attr_dev(i, "class", "i-close i-20");
    			add_location(i, file$m, 155, 80, 4385);
    			attr_dev(div, "class", "tag svelte-1a5p6xm");
    			add_location(div, file$m, 155, 16, 4321);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    			append_dev(div, i);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler_1, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*selected_shortlist*/ 32 && t_value !== (t_value = /*tag*/ ctx[26].value + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$1.name,
    		type: "else",
    		source: "(155:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (153:12) {#if tag.key == 'record_id'}
    function create_if_block_5$2(ctx) {
    	let div;
    	let t_value = /*tag*/ ctx[26].value + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "tag no_delete svelte-1a5p6xm");
    			add_location(div, file$m, 153, 16, 4240);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*selected_shortlist*/ 32 && t_value !== (t_value = /*tag*/ ctx[26].value + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$2.name,
    		type: "if",
    		source: "(153:12) {#if tag.key == 'record_id'}",
    		ctx
    	});

    	return block;
    }

    // (152:8) {#each selected_shortlist as tag}
    function create_each_block_2$3(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*tag*/ ctx[26].key == "record_id") return create_if_block_5$2;
    		return create_else_block_1$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2$3.name,
    		type: "each",
    		source: "(152:8) {#each selected_shortlist as tag}",
    		ctx
    	});

    	return block;
    }

    // (159:8) {#if selected_shortlist.length < selected.length}
    function create_if_block_4$3(ctx) {
    	let div;
    	let t0;
    	let t1_value = /*selected*/ ctx[4].length - /*selected_shortlist*/ ctx[5].length + "";
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("+");
    			t1 = text(t1_value);
    			attr_dev(div, "class", "tag no_delete svelte-1a5p6xm");
    			add_location(div, file$m, 159, 12, 4524);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*selected, selected_shortlist*/ 48 && t1_value !== (t1_value = /*selected*/ ctx[4].length - /*selected_shortlist*/ ctx[5].length + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$3.name,
    		type: "if",
    		source: "(159:8) {#if selected_shortlist.length < selected.length}",
    		ctx
    	});

    	return block;
    }

    // (168:12) {:else}
    function create_else_block$a(ctx) {
    	let i;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "i-chevron-up i-20");
    			add_location(i, file$m, 168, 16, 4997);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);

    			if (!mounted) {
    				dispose = listen_dev(i, "click", /*click_handler_3*/ ctx[14], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$a.name,
    		type: "else",
    		source: "(168:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (166:12) {#if !dd_in}
    function create_if_block_2$9(ctx) {
    	let i;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "i-chevron-down i-20");
    			add_location(i, file$m, 166, 16, 4887);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);

    			if (!mounted) {
    				dispose = listen_dev(i, "click", /*click_handler_2*/ ctx[13], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$9.name,
    		type: "if",
    		source: "(166:12) {#if !dd_in}",
    		ctx
    	});

    	return block;
    }

    // (186:40) 
    function create_if_block_1$b(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value_1 = /*selected*/ ctx[4];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$4(get_each_context_1$4(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

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
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*selected, handleItemUpdate2*/ 272) {
    				each_value_1 = /*selected*/ ctx[4];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$4(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1$4(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$b.name,
    		type: "if",
    		source: "(186:40) ",
    		ctx
    	});

    	return block;
    }

    // (179:12) {#if tab == 'all'}
    function create_if_block$g(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*f*/ ctx[0].options;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$b(get_each_context$b(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

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
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*f, handleItemUpdate*/ 129) {
    				each_value = /*f*/ ctx[0].options;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$b(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$b(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$g.name,
    		type: "if",
    		source: "(179:12) {#if tab == 'all'}",
    		ctx
    	});

    	return block;
    }

    // (187:16) {#each selected as f}
    function create_each_block_1$4(ctx) {
    	let item_1;
    	let current;

    	item_1 = new InputMultiItem({
    			props: { f: /*f*/ ctx[0] },
    			$$inline: true
    		});

    	item_1.$on("item_update", /*handleItemUpdate2*/ ctx[8]);

    	const block = {
    		c: function create() {
    			create_component(item_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(item_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const item_1_changes = {};
    			if (dirty & /*selected*/ 16) item_1_changes.f = /*f*/ ctx[0];
    			item_1.$set(item_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(item_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(item_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(item_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$4.name,
    		type: "each",
    		source: "(187:16) {#each selected as f}",
    		ctx
    	});

    	return block;
    }

    // (180:16) {#each f.options as f}
    function create_each_block$b(ctx) {
    	let item_1;
    	let current;

    	item_1 = new InputMultiItem({
    			props: { f: /*f*/ ctx[0] },
    			$$inline: true
    		});

    	item_1.$on("item_update", /*handleItemUpdate*/ ctx[7]);

    	const block = {
    		c: function create() {
    			create_component(item_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(item_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const item_1_changes = {};
    			if (dirty & /*f*/ 1) item_1_changes.f = /*f*/ ctx[0];
    			item_1.$set(item_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(item_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(item_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(item_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$b.name,
    		type: "each",
    		source: "(180:16) {#each f.options as f}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$m(ctx) {
    	let div3;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let div2;
    	let div0;
    	let input;
    	let input_placeholder_value;
    	let t5;
    	let t6;
    	let div1;
    	let ul;
    	let li0;
    	let a0;
    	let t8;
    	let li1;
    	let a1;
    	let t10;
    	let li2;
    	let a2;
    	let t12;
    	let current_block_type_index;
    	let if_block6;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*f*/ ctx[0].label && create_if_block_10$1(ctx);
    	let if_block1 = /*f*/ ctx[0].hint && create_if_block_9$1(ctx);
    	let if_block2 = /*f*/ ctx[0].max_warning && create_if_block_7$1(ctx);
    	let if_block3 = /*dd_in*/ ctx[1] && create_if_block_6$1(ctx);
    	let if_block4 = /*selected_shortlist*/ ctx[5].length && create_if_block_3$4(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (!/*dd_in*/ ctx[1]) return create_if_block_2$9;
    		return create_else_block$a;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block5 = current_block_type(ctx);
    	const if_block_creators = [create_if_block$g, create_if_block_1$b];
    	const if_blocks = [];

    	function select_block_type_2(ctx, dirty) {
    		if (/*tab*/ ctx[2] == "all") return 0;
    		if (/*tab*/ ctx[2] == "selected") return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type_2(ctx))) {
    		if_block6 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			div3 = element("div");
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
    			div2 = element("div");
    			div0 = element("div");
    			input = element("input");
    			t5 = space();
    			if_block5.c();
    			t6 = space();
    			div1 = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			a0.textContent = "Select";
    			t8 = space();
    			li1 = element("li");
    			a1 = element("a");
    			a1.textContent = "All";
    			t10 = space();
    			li2 = element("li");
    			a2 = element("a");
    			a2.textContent = "Selected";
    			t12 = space();
    			if (if_block6) if_block6.c();
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", input_placeholder_value = /*f*/ ctx[0].placeholder ? /*f*/ ctx[0].placeholder : "");
    			add_location(input, file$m, 164, 12, 4707);
    			attr_dev(div0, "class", "form-control");
    			add_location(div0, file$m, 163, 8, 4668);
    			attr_dev(a0, "class", "svelte-1a5p6xm");
    			add_location(a0, file$m, 174, 35, 5238);
    			attr_dev(li0, "class", "select svelte-1a5p6xm");
    			add_location(li0, file$m, 174, 16, 5219);
    			attr_dev(a1, "href", "#ehs/incidents/dashboard");
    			attr_dev(a1, "class", "svelte-1a5p6xm");
    			toggle_class(a1, "active", /*tab*/ ctx[2] == "all");
    			add_location(a1, file$m, 175, 20, 5277);
    			add_location(li1, file$m, 175, 16, 5273);
    			attr_dev(a2, "href", "#ehs/incidents/dashboard");
    			attr_dev(a2, "class", "svelte-1a5p6xm");
    			toggle_class(a2, "active", /*tab*/ ctx[2] == "selected");
    			add_location(a2, file$m, 176, 20, 5427);
    			add_location(li2, file$m, 176, 16, 5423);
    			attr_dev(ul, "class", "tabs svelte-1a5p6xm");
    			add_location(ul, file$m, 173, 12, 5185);
    			attr_dev(div1, "class", "multi-dropdown svelte-1a5p6xm");
    			toggle_class(div1, "dd_in", /*dd_in*/ ctx[1]);
    			add_location(div1, file$m, 172, 8, 5132);
    			attr_dev(div2, "class", "multi-wrapper svelte-1a5p6xm");
    			add_location(div2, file$m, 162, 4, 4632);
    			attr_dev(div3, "class", "form-item svelte-1a5p6xm");
    			add_location(div3, file$m, 135, 0, 3628);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			if (if_block0) if_block0.m(div3, null);
    			append_dev(div3, t0);
    			if (if_block1) if_block1.m(div3, null);
    			append_dev(div3, t1);
    			if (if_block2) if_block2.m(div3, null);
    			append_dev(div3, t2);
    			if (if_block3) if_block3.m(div3, null);
    			append_dev(div3, t3);
    			if (if_block4) if_block4.m(div3, null);
    			append_dev(div3, t4);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, input);
    			set_input_value(input, /*f*/ ctx[0].answer);
    			append_dev(div0, t5);
    			if_block5.m(div0, null);
    			append_dev(div2, t6);
    			append_dev(div2, div1);
    			append_dev(div1, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a0);
    			append_dev(ul, t8);
    			append_dev(ul, li1);
    			append_dev(li1, a1);
    			append_dev(ul, t10);
    			append_dev(ul, li2);
    			append_dev(li2, a2);
    			append_dev(div1, t12);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(div1, null);
    			}

    			/*div3_binding*/ ctx[17](div3);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[12]),
    					listen_dev(input, "focus", focus_handler$1, false, false, false),
    					listen_dev(a1, "click", prevent_default(/*click_handler_4*/ ctx[15]), false, true, false),
    					listen_dev(a2, "click", prevent_default(/*click_handler_5*/ ctx[16]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*f*/ ctx[0].label) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_10$1(ctx);
    					if_block0.c();
    					if_block0.m(div3, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*f*/ ctx[0].hint) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_9$1(ctx);
    					if_block1.c();
    					if_block1.m(div3, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*f*/ ctx[0].max_warning) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_7$1(ctx);
    					if_block2.c();
    					if_block2.m(div3, t2);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*dd_in*/ ctx[1]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_6$1(ctx);
    					if_block3.c();
    					if_block3.m(div3, t3);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*selected_shortlist*/ ctx[5].length) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block_3$4(ctx);
    					if_block4.c();
    					if_block4.m(div3, t4);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (!current || dirty & /*f*/ 1 && input_placeholder_value !== (input_placeholder_value = /*f*/ ctx[0].placeholder ? /*f*/ ctx[0].placeholder : "")) {
    				attr_dev(input, "placeholder", input_placeholder_value);
    			}

    			if (dirty & /*f*/ 1 && input.value !== /*f*/ ctx[0].answer) {
    				set_input_value(input, /*f*/ ctx[0].answer);
    			}

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block5) {
    				if_block5.p(ctx, dirty);
    			} else {
    				if_block5.d(1);
    				if_block5 = current_block_type(ctx);

    				if (if_block5) {
    					if_block5.c();
    					if_block5.m(div0, null);
    				}
    			}

    			if (dirty & /*tab*/ 4) {
    				toggle_class(a1, "active", /*tab*/ ctx[2] == "all");
    			}

    			if (dirty & /*tab*/ 4) {
    				toggle_class(a2, "active", /*tab*/ ctx[2] == "selected");
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_2(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block6) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block6 = if_blocks[current_block_type_index];

    					if (!if_block6) {
    						if_block6 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block6.c();
    					} else {
    						if_block6.p(ctx, dirty);
    					}

    					transition_in(if_block6, 1);
    					if_block6.m(div1, null);
    				} else {
    					if_block6 = null;
    				}
    			}

    			if (dirty & /*dd_in*/ 2) {
    				toggle_class(div1, "dd_in", /*dd_in*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block6);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block6);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    			if_block5.d();

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			/*div3_binding*/ ctx[17](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function filter_item$1(item, txt) {
    	let item_ok = false;

    	if (item.value.toLowerCase().indexOf(txt) >= 0) {
    		item_ok = true;
    	}

    	if (item.children) {
    		item.children.forEach(item => {
    			let child_ok = filter_item$1(item, txt);

    			if (child_ok) {
    				item_ok = true;
    			}
    		});
    	}

    	
    	return item_ok;
    }

    function cull$1(arr, txt) {
    	let found = false;

    	arr.forEach((item, i) => {
    		let found_in_children = false;

    		if (Array.isArray(item.children)) {
    			item.expanded = typeof item.expanded !== "undefined"
    			? item.expanded
    			: true; //default to open

    			if (cull$1(item.children, txt)) {
    				found_in_children = true;
    			}
    		}

    		/* if( item.value == 'Common Fields' || item.value == 'Report Event') {
         console.log(item.value, txt=='', item.value.toLowerCase().indexOf(txt) >= 0, found_in_children)
     }*/
    		if (txt == "" || item.value.toLowerCase().indexOf(txt) >= 0 || found_in_children) {
    			item.visible = true;
    			found = true;
    		} else {
    			item.visible = false;
    		}
    	});

    	return found;
    }

    function tree_to_selected$1(arr) {
    	let temp_selected = [];

    	arr.forEach(option => {
    		if (option.selected) {
    			temp_selected.push(option);
    		}

    		if (option.children && option.children.length) {
    			temp_selected = [...temp_selected, ...tree_to_selected$1(option.children)];
    		}
    	});

    	return temp_selected;
    }

    const focus_handler$1 = ev => {
    	ev.target.select();
    };

    function instance$m($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("InputMulti", slots, []);
    	let { f } = $$props;
    	let orginal_options = JSON.parse(JSON.stringify(f.options)); //make a copy for resetting
    	let dd_in = false;
    	let tab = "all";
    	let { channel = "ANSWER" } = $$props;
    	let item = false;
    	let selected = [];
    	let selected_shortlist = [];
    	let filtered = [];
    	let w = 0;

    	function recalc() {
    		cull$1(f.options, f.answer);

    		if (f.answer !== "") {
    			$$invalidate(1, dd_in = true);
    		}

    		$$invalidate(4, selected = tree_to_selected$1(f.options));

    		if (w > 0) {
    			let char_width = 12; //rough approximation
    			let max_chars = Math.floor(w / char_width);
    			let chars_used = 0;
    			let num_tags = 0;

    			selected.forEach(tag => {
    				let t_length = tag.value.length > 18 ? 18 : tag.value.length;
    				chars_used += t_length;

    				if (chars_used < max_chars) {
    					num_tags++;
    				}
    			});

    			$$invalidate(5, selected_shortlist = selected.slice(0, num_tags));
    			let answer = JSON.parse(JSON.stringify(f));

    			//answer.options = opts;
    			pubsub.publish(channel, answer);
    		}
    	}

    	function remove_tag(tag) {
    		tag.selected = false;
    		$$invalidate(0, f);
    		recalc();
    	}

    	function handleItemUpdate(ev) {
    		recalc();
    	}

    	function handleItemUpdate2(ev) {
    		recalc();
    	}

    	onMount(() => {
    		w = item.offsetWidth;
    		recalc();
    	});

    	const writable_props = ["f", "channel"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<InputMulti> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		$$invalidate(1, dd_in = false);
    		$$invalidate(0, f.answer = "", f);
    	};

    	const click_handler_1 = tag => remove_tag(tag);

    	function input_input_handler() {
    		f.answer = this.value;
    		$$invalidate(0, f);
    	}

    	const click_handler_2 = () => {
    		$$invalidate(1, dd_in = !dd_in);
    	};

    	const click_handler_3 = () => {
    		$$invalidate(1, dd_in = !dd_in);
    		$$invalidate(0, f.answer = "", f);
    	};

    	const click_handler_4 = () => {
    		$$invalidate(2, tab = "all");
    	};

    	const click_handler_5 = () => {
    		$$invalidate(2, tab = "selected");
    	};

    	function div3_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			item = $$value;
    			$$invalidate(3, item);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("f" in $$props) $$invalidate(0, f = $$props.f);
    		if ("channel" in $$props) $$invalidate(9, channel = $$props.channel);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		PubSub: pubsub,
    		Item: InputMultiItem,
    		f,
    		orginal_options,
    		dd_in,
    		tab,
    		channel,
    		item,
    		selected,
    		selected_shortlist,
    		filtered,
    		filter_item: filter_item$1,
    		cull: cull$1,
    		w,
    		tree_to_selected: tree_to_selected$1,
    		recalc,
    		remove_tag,
    		handleItemUpdate,
    		handleItemUpdate2
    	});

    	$$self.$inject_state = $$props => {
    		if ("f" in $$props) $$invalidate(0, f = $$props.f);
    		if ("orginal_options" in $$props) orginal_options = $$props.orginal_options;
    		if ("dd_in" in $$props) $$invalidate(1, dd_in = $$props.dd_in);
    		if ("tab" in $$props) $$invalidate(2, tab = $$props.tab);
    		if ("channel" in $$props) $$invalidate(9, channel = $$props.channel);
    		if ("item" in $$props) $$invalidate(3, item = $$props.item);
    		if ("selected" in $$props) $$invalidate(4, selected = $$props.selected);
    		if ("selected_shortlist" in $$props) $$invalidate(5, selected_shortlist = $$props.selected_shortlist);
    		if ("filtered" in $$props) filtered = $$props.filtered;
    		if ("w" in $$props) w = $$props.w;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*f*/ 1) {
    			{
    				f.answer;
    				recalc();
    			} /*
    console.log("filtering");
    cull(f.options, f.answer);
    if(f.answer !== '') {
        dd_in = true;
    }
    */
    		}
    	};

    	return [
    		f,
    		dd_in,
    		tab,
    		item,
    		selected,
    		selected_shortlist,
    		remove_tag,
    		handleItemUpdate,
    		handleItemUpdate2,
    		channel,
    		click_handler,
    		click_handler_1,
    		input_input_handler,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5,
    		div3_binding
    	];
    }

    class InputMulti extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, { f: 0, channel: 9 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InputMulti",
    			options,
    			id: create_fragment$m.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*f*/ ctx[0] === undefined && !("f" in props)) {
    			console.warn("<InputMulti> was created without expected prop 'f'");
    		}
    	}

    	get f() {
    		throw new Error("<InputMulti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set f(value) {
    		throw new Error("<InputMulti>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get channel() {
    		throw new Error("<InputMulti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set channel(value) {
    		throw new Error("<InputMulti>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/form/InputLookupItem.svelte generated by Svelte v3.35.0 */
    const file$l = "src/components/form/InputLookupItem.svelte";

    function get_each_context$a(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    // (24:0) {#if f.visible}
    function create_if_block$f(ctx) {
    	let div;
    	let t0;
    	let span;
    	let t1_value = /*f*/ ctx[0].value + "";
    	let t1;
    	let t2;
    	let div_class_value;
    	let t3;
    	let if_block2_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*f*/ ctx[0].children && create_if_block_3$3(ctx);
    	let if_block1 = /*f*/ ctx[0].pii && create_if_block_2$8(ctx);
    	let if_block2 = /*f*/ ctx[0].children && /*f*/ ctx[0].expanded && create_if_block_1$a(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			span = element("span");
    			t1 = text(t1_value);
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			if (if_block2) if_block2.c();
    			if_block2_anchor = empty();
    			add_location(span, file$l, 32, 8, 885);
    			attr_dev(div, "class", div_class_value = "multi-item indent" + /*indent_class*/ ctx[2] + " svelte-1bmql47");
    			add_location(div, file$l, 24, 4, 509);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t0);
    			append_dev(div, span);
    			append_dev(span, t1);
    			append_dev(div, t2);
    			if (if_block1) if_block1.m(div, null);
    			insert_dev(target, t3, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, if_block2_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(span, "click", /*toggle_item*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*f*/ ctx[0].children) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_3$3(ctx);
    					if_block0.c();
    					if_block0.m(div, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if ((!current || dirty & /*f*/ 1) && t1_value !== (t1_value = /*f*/ ctx[0].value + "")) set_data_dev(t1, t1_value);

    			if (/*f*/ ctx[0].pii) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block_2$8(ctx);
    					if_block1.c();
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (!current || dirty & /*indent_class*/ 4 && div_class_value !== (div_class_value = "multi-item indent" + /*indent_class*/ ctx[2] + " svelte-1bmql47")) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (/*f*/ ctx[0].children && /*f*/ ctx[0].expanded) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*f*/ 1) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_1$a(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (detaching) detach_dev(t3);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(if_block2_anchor);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$f.name,
    		type: "if",
    		source: "(24:0) {#if f.visible}",
    		ctx
    	});

    	return block;
    }

    // (26:8) {#if f.children}
    function create_if_block_3$3(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*f*/ ctx[0].expanded) return create_if_block_4$2;
    		if (/*f*/ ctx[0].expanded === false) return create_if_block_5$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) {
    				if_block.d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$3.name,
    		type: "if",
    		source: "(26:8) {#if f.children}",
    		ctx
    	});

    	return block;
    }

    // (29:43) 
    function create_if_block_5$1(ctx) {
    	let i;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "i-chevron-down i-20");
    			add_location(i, file$l, 29, 16, 765);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);

    			if (!mounted) {
    				dispose = listen_dev(i, "click", /*click_handler_1*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$1.name,
    		type: "if",
    		source: "(29:43) ",
    		ctx
    	});

    	return block;
    }

    // (27:12) {#if f.expanded}
    function create_if_block_4$2(ctx) {
    	let i;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "i-chevron-up i-20");
    			add_location(i, file$l, 27, 16, 626);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);

    			if (!mounted) {
    				dispose = listen_dev(i, "click", /*click_handler*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$2.name,
    		type: "if",
    		source: "(27:12) {#if f.expanded}",
    		ctx
    	});

    	return block;
    }

    // (36:8) {#if f.pii}
    function create_if_block_2$8(ctx) {
    	let i;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "title", "Personally Identifiable Information");
    			attr_dev(i, "class", "i-fingerprint i-16");
    			add_location(i, file$l, 36, 16, 991);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$8.name,
    		type: "if",
    		source: "(36:8) {#if f.pii}",
    		ctx
    	});

    	return block;
    }

    // (42:4) {#if f.children && f.expanded}
    function create_if_block_1$a(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*f*/ ctx[0].children;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$a(get_each_context$a(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

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
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*f, indent, handleItemUpdate*/ 19) {
    				each_value = /*f*/ ctx[0].children;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$a(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$a(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$a.name,
    		type: "if",
    		source: "(42:4) {#if f.children && f.expanded}",
    		ctx
    	});

    	return block;
    }

    // (43:8) {#each f.children as f}
    function create_each_block$a(ctx) {
    	let inputlookupitem;
    	let current;

    	inputlookupitem = new InputLookupItem({
    			props: {
    				f: /*f*/ ctx[0],
    				indent: /*indent*/ ctx[1] + 1
    			},
    			$$inline: true
    		});

    	inputlookupitem.$on("item_update", /*handleItemUpdate*/ ctx[4]);

    	const block = {
    		c: function create() {
    			create_component(inputlookupitem.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(inputlookupitem, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const inputlookupitem_changes = {};
    			if (dirty & /*f*/ 1) inputlookupitem_changes.f = /*f*/ ctx[0];
    			if (dirty & /*indent*/ 2) inputlookupitem_changes.indent = /*indent*/ ctx[1] + 1;
    			inputlookupitem.$set(inputlookupitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(inputlookupitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(inputlookupitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(inputlookupitem, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$a.name,
    		type: "each",
    		source: "(43:8) {#each f.children as f}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$l(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*f*/ ctx[0].visible && create_if_block$f(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*f*/ ctx[0].visible) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*f*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$f(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let indent_class;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("InputLookupItem", slots, []);
    	let { f } = $$props;
    	let { indent = 0 } = $$props;
    	const dispatch = createEventDispatcher();

    	function toggle_item() {
    		$$invalidate(0, f.selected = !f.selected, f);
    		dispatch("item_update", { item: f });
    	}

    	function handleItemUpdate(ev) {
    		dispatch("item_update", { item: ev.detail.item });
    	}

    	const writable_props = ["f", "indent"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<InputLookupItem> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		$$invalidate(0, f.expanded = false, f);
    	};

    	const click_handler_1 = () => {
    		$$invalidate(0, f.expanded = true, f);
    	};

    	$$self.$$set = $$props => {
    		if ("f" in $$props) $$invalidate(0, f = $$props.f);
    		if ("indent" in $$props) $$invalidate(1, indent = $$props.indent);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		Item: InputMultiItem,
    		f,
    		indent,
    		dispatch,
    		toggle_item,
    		handleItemUpdate,
    		indent_class
    	});

    	$$self.$inject_state = $$props => {
    		if ("f" in $$props) $$invalidate(0, f = $$props.f);
    		if ("indent" in $$props) $$invalidate(1, indent = $$props.indent);
    		if ("indent_class" in $$props) $$invalidate(2, indent_class = $$props.indent_class);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*indent*/ 2) {
    			$$invalidate(2, indent_class = indent > 5 ? 5 : indent);
    		}
    	};

    	return [
    		f,
    		indent,
    		indent_class,
    		toggle_item,
    		handleItemUpdate,
    		click_handler,
    		click_handler_1
    	];
    }

    class InputLookupItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, { f: 0, indent: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InputLookupItem",
    			options,
    			id: create_fragment$l.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*f*/ ctx[0] === undefined && !("f" in props)) {
    			console.warn("<InputLookupItem> was created without expected prop 'f'");
    		}
    	}

    	get f() {
    		throw new Error("<InputLookupItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set f(value) {
    		throw new Error("<InputLookupItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get indent() {
    		throw new Error("<InputLookupItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set indent(value) {
    		throw new Error("<InputLookupItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/form/InputLookup.svelte generated by Svelte v3.35.0 */
    const file$k = "src/components/form/InputLookup.svelte";

    function get_each_context$9(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    // (129:4) {#if f.label}
    function create_if_block_3$2(ctx) {
    	let label;
    	let t_value = /*f*/ ctx[0].label + "";
    	let t;
    	let label_for_value;

    	const block = {
    		c: function create() {
    			label = element("label");
    			t = text(t_value);
    			attr_dev(label, "for", label_for_value = /*f*/ ctx[0].id);
    			add_location(label, file$k, 129, 8, 3524);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*f*/ 1 && t_value !== (t_value = /*f*/ ctx[0].label + "")) set_data_dev(t, t_value);

    			if (dirty & /*f*/ 1 && label_for_value !== (label_for_value = /*f*/ ctx[0].id)) {
    				attr_dev(label, "for", label_for_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(129:4) {#if f.label}",
    		ctx
    	});

    	return block;
    }

    // (132:4) {#if f.hint}
    function create_if_block_2$7(ctx) {
    	let p;
    	let t_value = /*f*/ ctx[0].hint + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			add_location(p, file$k, 132, 8, 3597);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*f*/ 1 && t_value !== (t_value = /*f*/ ctx[0].hint + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$7.name,
    		type: "if",
    		source: "(132:4) {#if f.hint}",
    		ctx
    	});

    	return block;
    }

    // (135:4) {#if dd_in}
    function create_if_block_1$9(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "multi-mask svelte-1a5p6xm");
    			add_location(div, file$k, 135, 8, 3647);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$9.name,
    		type: "if",
    		source: "(135:4) {#if dd_in}",
    		ctx
    	});

    	return block;
    }

    // (143:12) {:else}
    function create_else_block$9(ctx) {
    	let i;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "i-chevron-up i-20");
    			add_location(i, file$k, 143, 16, 4142);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);

    			if (!mounted) {
    				dispose = listen_dev(i, "click", /*click_handler_2*/ ctx[9], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$9.name,
    		type: "else",
    		source: "(143:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (141:12) {#if !dd_in}
    function create_if_block$e(ctx) {
    	let i;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "i-chevron-down i-20");
    			add_location(i, file$k, 141, 16, 4020);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);

    			if (!mounted) {
    				dispose = listen_dev(i, "click", /*click_handler_1*/ ctx[8], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$e.name,
    		type: "if",
    		source: "(141:12) {#if !dd_in}",
    		ctx
    	});

    	return block;
    }

    // (149:12) {#each f.options as f}
    function create_each_block$9(ctx) {
    	let item_1;
    	let current;

    	item_1 = new InputLookupItem({
    			props: { f: /*f*/ ctx[0] },
    			$$inline: true
    		});

    	item_1.$on("item_update", /*handleItemUpdate*/ ctx[3]);

    	const block = {
    		c: function create() {
    			create_component(item_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(item_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const item_1_changes = {};
    			if (dirty & /*f*/ 1) item_1_changes.f = /*f*/ ctx[0];
    			item_1.$set(item_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(item_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(item_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(item_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$9.name,
    		type: "each",
    		source: "(149:12) {#each f.options as f}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$k(ctx) {
    	let div3;
    	let t0;
    	let t1;
    	let t2;
    	let div2;
    	let div0;
    	let input;
    	let input_placeholder_value;
    	let t3;
    	let t4;
    	let div1;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*f*/ ctx[0].label && create_if_block_3$2(ctx);
    	let if_block1 = /*f*/ ctx[0].hint && create_if_block_2$7(ctx);
    	let if_block2 = /*dd_in*/ ctx[1] && create_if_block_1$9(ctx);

    	function select_block_type(ctx, dirty) {
    		if (!/*dd_in*/ ctx[1]) return create_if_block$e;
    		return create_else_block$9;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block3 = current_block_type(ctx);
    	let each_value = /*f*/ ctx[0].options;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$9(get_each_context$9(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			div2 = element("div");
    			div0 = element("div");
    			input = element("input");
    			t3 = space();
    			if_block3.c();
    			t4 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", input_placeholder_value = /*f*/ ctx[0].placeholder ? /*f*/ ctx[0].placeholder : "");
    			add_location(input, file$k, 139, 12, 3804);
    			attr_dev(div0, "class", "form-control");
    			add_location(div0, file$k, 138, 8, 3765);
    			attr_dev(div1, "class", "multi-dropdown svelte-1a5p6xm");
    			toggle_class(div1, "dd_in", /*dd_in*/ ctx[1]);
    			add_location(div1, file$k, 147, 8, 4265);
    			attr_dev(div2, "class", "multi-wrapper svelte-1a5p6xm");
    			add_location(div2, file$k, 137, 4, 3729);
    			attr_dev(div3, "class", "form-item svelte-1a5p6xm");
    			add_location(div3, file$k, 127, 0, 3455);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			if (if_block0) if_block0.m(div3, null);
    			append_dev(div3, t0);
    			if (if_block1) if_block1.m(div3, null);
    			append_dev(div3, t1);
    			if (if_block2) if_block2.m(div3, null);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, input);
    			set_input_value(input, /*f*/ ctx[0].answer);
    			append_dev(div0, t3);
    			if_block3.m(div0, null);
    			append_dev(div2, t4);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			/*div3_binding*/ ctx[10](div3);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[6]),
    					listen_dev(input, "keyup", /*keyup_handler*/ ctx[7], false, false, false),
    					listen_dev(input, "focus", focus_handler, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*f*/ ctx[0].label) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_3$2(ctx);
    					if_block0.c();
    					if_block0.m(div3, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*f*/ ctx[0].hint) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_2$7(ctx);
    					if_block1.c();
    					if_block1.m(div3, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*dd_in*/ ctx[1]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_1$9(ctx);
    					if_block2.c();
    					if_block2.m(div3, t2);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (!current || dirty & /*f*/ 1 && input_placeholder_value !== (input_placeholder_value = /*f*/ ctx[0].placeholder ? /*f*/ ctx[0].placeholder : "")) {
    				attr_dev(input, "placeholder", input_placeholder_value);
    			}

    			if (dirty & /*f*/ 1 && input.value !== /*f*/ ctx[0].answer) {
    				set_input_value(input, /*f*/ ctx[0].answer);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block3) {
    				if_block3.p(ctx, dirty);
    			} else {
    				if_block3.d(1);
    				if_block3 = current_block_type(ctx);

    				if (if_block3) {
    					if_block3.c();
    					if_block3.m(div0, null);
    				}
    			}

    			if (dirty & /*f, handleItemUpdate*/ 9) {
    				each_value = /*f*/ ctx[0].options;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$9(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$9(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*dd_in*/ 2) {
    				toggle_class(div1, "dd_in", /*dd_in*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if_block3.d();
    			destroy_each(each_blocks, detaching);
    			/*div3_binding*/ ctx[10](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function filter_item(item, txt) {
    	let item_ok = false;

    	if (item.value.toLowerCase().indexOf(txt) >= 0) {
    		item_ok = true;
    	}

    	if (item.children) {
    		item.children.forEach(item => {
    			let child_ok = filter_item(item, txt);

    			if (child_ok) {
    				item_ok = true;
    			}
    		});
    	}

    	
    	return item_ok;
    }

    function cull(arr, txt) {
    	let found = false;

    	arr.forEach((item, i) => {
    		let found_in_children = false;

    		if (Array.isArray(item.children)) {
    			item.expanded = typeof item.expanded !== "undefined"
    			? item.expanded
    			: true; //default to open

    			if (cull(item.children, txt)) {
    				found_in_children = true;
    			}
    		}

    		/* if( item.value == 'Common Fields' || item.value == 'Report Event') {
         console.log(item.value, txt=='', item.value.toLowerCase().indexOf(txt) >= 0, found_in_children)
     }*/
    		if (txt == "" || item.value.toLowerCase().indexOf(txt) >= 0 || found_in_children) {
    			item.visible = true;
    			found = true;
    		} else {
    			item.visible = false;
    		}
    	});

    	return found;
    }

    function tree_to_selected(arr) {
    	let temp_selected = [];

    	arr.forEach(option => {
    		if (option.selected) {
    			temp_selected.push(option);
    		}

    		if (option.children && option.children.length) {
    			temp_selected = [...temp_selected, ...tree_to_selected(option.children)];
    		}
    	});

    	return temp_selected;
    }

    const focus_handler = ev => {
    	ev.target.select();
    };

    function instance$k($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("InputLookup", slots, []);
    	let { f } = $$props;
    	let orginal_options = JSON.parse(JSON.stringify(f.options)); //make a copy for resetting
    	let dd_in = false;
    	let tab = "all";
    	let { channel = "ANSWER" } = $$props;
    	let item = false;
    	let selected = [];
    	let selected_shortlist = [];
    	let filtered = [];
    	let w = 0;

    	function recalc() {
    		cull(f.options, f.answer);
    		selected = tree_to_selected(f.options);

    		if (w > 0) {
    			let char_width = 12; //rough approximation
    			let max_chars = Math.floor(w / char_width);
    			let chars_used = 0;
    			let num_tags = 0;

    			selected.forEach(tag => {
    				let t_length = tag.value.length > 18 ? 18 : tag.value.length;
    				chars_used += t_length;

    				if (chars_used < max_chars) {
    					num_tags++;
    				}
    			});

    			selected_shortlist = selected.slice(0, num_tags);
    			let answer = JSON.parse(JSON.stringify(f));

    			//answer.options = opts;
    			pubsub.publish(channel, answer);
    		}
    	}

    	function handleItemUpdate(ev) {
    		$$invalidate(0, f.answer = ev.detail.item.value, f);
    		recalc();
    		$$invalidate(1, dd_in = false);
    	}

    	onMount(() => {
    		w = item.offsetWidth;
    		recalc();
    	});

    	const writable_props = ["f", "channel"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<InputLookup> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		$$invalidate(1, dd_in = false);
    	};

    	function input_input_handler() {
    		f.answer = this.value;
    		$$invalidate(0, f);
    	}

    	const keyup_handler = () => {
    		$$invalidate(1, dd_in = true);
    	};

    	const click_handler_1 = () => {
    		$$invalidate(0, f.answer = "", f);
    		$$invalidate(1, dd_in = !dd_in);
    	};

    	const click_handler_2 = () => {
    		$$invalidate(1, dd_in = !dd_in);
    	};

    	function div3_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			item = $$value;
    			$$invalidate(2, item);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("f" in $$props) $$invalidate(0, f = $$props.f);
    		if ("channel" in $$props) $$invalidate(4, channel = $$props.channel);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		PubSub: pubsub,
    		Item: InputLookupItem,
    		f,
    		orginal_options,
    		dd_in,
    		tab,
    		channel,
    		item,
    		selected,
    		selected_shortlist,
    		filtered,
    		filter_item,
    		cull,
    		w,
    		tree_to_selected,
    		recalc,
    		handleItemUpdate
    	});

    	$$self.$inject_state = $$props => {
    		if ("f" in $$props) $$invalidate(0, f = $$props.f);
    		if ("orginal_options" in $$props) orginal_options = $$props.orginal_options;
    		if ("dd_in" in $$props) $$invalidate(1, dd_in = $$props.dd_in);
    		if ("tab" in $$props) tab = $$props.tab;
    		if ("channel" in $$props) $$invalidate(4, channel = $$props.channel);
    		if ("item" in $$props) $$invalidate(2, item = $$props.item);
    		if ("selected" in $$props) selected = $$props.selected;
    		if ("selected_shortlist" in $$props) selected_shortlist = $$props.selected_shortlist;
    		if ("filtered" in $$props) filtered = $$props.filtered;
    		if ("w" in $$props) w = $$props.w;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*f*/ 1) {
    			{
    				f.answer;
    				recalc();
    			} /*
    console.log("filtering");
    cull(f.options, f.answer);
    if(f.answer !== '') {
        dd_in = true;
    }
    */
    		}
    	};

    	return [
    		f,
    		dd_in,
    		item,
    		handleItemUpdate,
    		channel,
    		click_handler,
    		input_input_handler,
    		keyup_handler,
    		click_handler_1,
    		click_handler_2,
    		div3_binding
    	];
    }

    class InputLookup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, { f: 0, channel: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InputLookup",
    			options,
    			id: create_fragment$k.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*f*/ ctx[0] === undefined && !("f" in props)) {
    			console.warn("<InputLookup> was created without expected prop 'f'");
    		}
    	}

    	get f() {
    		throw new Error("<InputLookup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set f(value) {
    		throw new Error("<InputLookup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get channel() {
    		throw new Error("<InputLookup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set channel(value) {
    		throw new Error("<InputLookup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/form/InputTextarea.svelte generated by Svelte v3.35.0 */

    const file$j = "src/components/form/InputTextarea.svelte";

    // (7:4) {#if f.label}
    function create_if_block_1$8(ctx) {
    	let label;
    	let t_value = /*f*/ ctx[0].label + "";
    	let t;
    	let label_for_value;

    	const block = {
    		c: function create() {
    			label = element("label");
    			t = text(t_value);
    			attr_dev(label, "for", label_for_value = /*f*/ ctx[0].id);
    			add_location(label, file$j, 7, 8, 89);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*f*/ 1 && t_value !== (t_value = /*f*/ ctx[0].label + "")) set_data_dev(t, t_value);

    			if (dirty & /*f*/ 1 && label_for_value !== (label_for_value = /*f*/ ctx[0].id)) {
    				attr_dev(label, "for", label_for_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$8.name,
    		type: "if",
    		source: "(7:4) {#if f.label}",
    		ctx
    	});

    	return block;
    }

    // (10:4) {#if f.hint}
    function create_if_block$d(ctx) {
    	let p;
    	let t_value = /*f*/ ctx[0].hint + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			add_location(p, file$j, 10, 8, 162);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*f*/ 1 && t_value !== (t_value = /*f*/ ctx[0].hint + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$d.name,
    		type: "if",
    		source: "(10:4) {#if f.hint}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$j(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let textarea;
    	let textarea_id_value;
    	let mounted;
    	let dispose;
    	let if_block0 = /*f*/ ctx[0].label && create_if_block_1$8(ctx);
    	let if_block1 = /*f*/ ctx[0].hint && create_if_block$d(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			textarea = element("textarea");
    			attr_dev(textarea, "id", textarea_id_value = /*f*/ ctx[0].id);
    			attr_dev(textarea, "class", "form-control");
    			add_location(textarea, file$j, 12, 4, 192);
    			attr_dev(div, "class", "form-item");
    			add_location(div, file$j, 5, 0, 39);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t0);
    			if (if_block1) if_block1.m(div, null);
    			append_dev(div, t1);
    			append_dev(div, textarea);
    			set_input_value(textarea, /*f*/ ctx[0].answer);

    			if (!mounted) {
    				dispose = listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[1]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*f*/ ctx[0].label) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$8(ctx);
    					if_block0.c();
    					if_block0.m(div, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*f*/ ctx[0].hint) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$d(ctx);
    					if_block1.c();
    					if_block1.m(div, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*f*/ 1 && textarea_id_value !== (textarea_id_value = /*f*/ ctx[0].id)) {
    				attr_dev(textarea, "id", textarea_id_value);
    			}

    			if (dirty & /*f*/ 1) {
    				set_input_value(textarea, /*f*/ ctx[0].answer);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("InputTextarea", slots, []);
    	let { f } = $$props;
    	const writable_props = ["f"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<InputTextarea> was created with unknown prop '${key}'`);
    	});

    	function textarea_input_handler() {
    		f.answer = this.value;
    		$$invalidate(0, f);
    	}

    	$$self.$$set = $$props => {
    		if ("f" in $$props) $$invalidate(0, f = $$props.f);
    	};

    	$$self.$capture_state = () => ({ f });

    	$$self.$inject_state = $$props => {
    		if ("f" in $$props) $$invalidate(0, f = $$props.f);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [f, textarea_input_handler];
    }

    class InputTextarea extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, { f: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InputTextarea",
    			options,
    			id: create_fragment$j.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*f*/ ctx[0] === undefined && !("f" in props)) {
    			console.warn("<InputTextarea> was created without expected prop 'f'");
    		}
    	}

    	get f() {
    		throw new Error("<InputTextarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set f(value) {
    		throw new Error("<InputTextarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/form/InputSwitch.svelte generated by Svelte v3.35.0 */

    const file$i = "src/components/form/InputSwitch.svelte";

    function get_each_context$8(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[6] = list;
    	child_ctx[7] = i;
    	return child_ctx;
    }

    // (13:4) {#if f.label}
    function create_if_block_1$7(ctx) {
    	let label;
    	let t_value = /*f*/ ctx[0].label + "";
    	let t;
    	let label_for_value;

    	const block = {
    		c: function create() {
    			label = element("label");
    			t = text(t_value);
    			attr_dev(label, "for", label_for_value = /*f*/ ctx[0].id);
    			add_location(label, file$i, 13, 8, 298);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*f*/ 1 && t_value !== (t_value = /*f*/ ctx[0].label + "")) set_data_dev(t, t_value);

    			if (dirty & /*f*/ 1 && label_for_value !== (label_for_value = /*f*/ ctx[0].id)) {
    				attr_dev(label, "for", label_for_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$7.name,
    		type: "if",
    		source: "(13:4) {#if f.label}",
    		ctx
    	});

    	return block;
    }

    // (16:4) {#if f.hint}
    function create_if_block$c(ctx) {
    	let p;
    	let t_value = /*f*/ ctx[0].hint + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			attr_dev(p, "class", "svelte-12hkhrz");
    			add_location(p, file$i, 16, 8, 371);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*f*/ 1 && t_value !== (t_value = /*f*/ ctx[0].hint + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$c.name,
    		type: "if",
    		source: "(16:4) {#if f.hint}",
    		ctx
    	});

    	return block;
    }

    // (19:4) {#each f.options as option}
    function create_each_block$8(ctx) {
    	let div;
    	let label;
    	let input;
    	let t0;
    	let span0;
    	let t1;
    	let span1;
    	let t2_value = /*option*/ ctx[5].text + "";
    	let t2;
    	let t3;
    	let mounted;
    	let dispose;

    	function input_change_handler() {
    		/*input_change_handler*/ ctx[3].call(input, /*each_value*/ ctx[6], /*option_index*/ ctx[7]);
    	}

    	function click_handler() {
    		return /*click_handler*/ ctx[4](/*option*/ ctx[5], /*each_value*/ ctx[6], /*option_index*/ ctx[7]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			label = element("label");
    			input = element("input");
    			t0 = space();
    			span0 = element("span");
    			t1 = space();
    			span1 = element("span");
    			t2 = text(t2_value);
    			t3 = space();
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "class", "svelte-12hkhrz");
    			add_location(input, file$i, 21, 20, 527);
    			attr_dev(span0, "class", "slider svelte-12hkhrz");
    			add_location(span0, file$i, 22, 20, 599);
    			attr_dev(label, "class", "switch svelte-12hkhrz");
    			add_location(label, file$i, 20, 16, 484);
    			add_location(span1, file$i, 24, 16, 669);
    			attr_dev(div, "class", "switch-holder svelte-12hkhrz");
    			add_location(div, file$i, 19, 11, 440);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, label);
    			append_dev(label, input);
    			input.checked = /*option*/ ctx[5].value;
    			append_dev(label, t0);
    			append_dev(label, span0);
    			append_dev(div, t1);
    			append_dev(div, span1);
    			append_dev(span1, t2);
    			append_dev(div, t3);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", input_change_handler),
    					listen_dev(span1, "click", click_handler, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*f*/ 1) {
    				input.checked = /*option*/ ctx[5].value;
    			}

    			if (dirty & /*f*/ 1 && t2_value !== (t2_value = /*option*/ ctx[5].text + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$8.name,
    		type: "each",
    		source: "(19:4) {#each f.options as option}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let if_block0 = /*f*/ ctx[0].label && create_if_block_1$7(ctx);
    	let if_block1 = /*f*/ ctx[0].hint && create_if_block$c(ctx);
    	let each_value = /*f*/ ctx[0].options;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$8(get_each_context$8(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "form-item");
    			toggle_class(div, "clamp", /*f*/ ctx[0].clamp);
    			add_location(div, file$i, 11, 0, 226);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t0);
    			if (if_block1) if_block1.m(div, null);
    			append_dev(div, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*f*/ ctx[0].label) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$7(ctx);
    					if_block0.c();
    					if_block0.m(div, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*f*/ ctx[0].hint) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$c(ctx);
    					if_block1.c();
    					if_block1.m(div, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*f, announce*/ 3) {
    				each_value = /*f*/ ctx[0].options;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$8(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$8(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*f*/ 1) {
    				toggle_class(div, "clamp", /*f*/ ctx[0].clamp);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("InputSwitch", slots, []);
    	let { f } = $$props;
    	let { channel = "ANSWER" } = $$props;

    	function announce() {
    		let answer = JSON.parse(JSON.stringify(f));

    		//answer.options = opts;
    		PubSub.publish(channel, answer);
    	}

    	const writable_props = ["f", "channel"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<InputSwitch> was created with unknown prop '${key}'`);
    	});

    	function input_change_handler(each_value, option_index) {
    		each_value[option_index].value = this.checked;
    		$$invalidate(0, f);
    	}

    	const click_handler = (option, each_value, option_index) => {
    		$$invalidate(0, each_value[option_index].value = !option.value, f);
    		announce();
    	};

    	$$self.$$set = $$props => {
    		if ("f" in $$props) $$invalidate(0, f = $$props.f);
    		if ("channel" in $$props) $$invalidate(2, channel = $$props.channel);
    	};

    	$$self.$capture_state = () => ({ f, channel, announce });

    	$$self.$inject_state = $$props => {
    		if ("f" in $$props) $$invalidate(0, f = $$props.f);
    		if ("channel" in $$props) $$invalidate(2, channel = $$props.channel);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [f, announce, channel, input_change_handler, click_handler];
    }

    class InputSwitch extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, { f: 0, channel: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InputSwitch",
    			options,
    			id: create_fragment$i.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*f*/ ctx[0] === undefined && !("f" in props)) {
    			console.warn("<InputSwitch> was created without expected prop 'f'");
    		}
    	}

    	get f() {
    		throw new Error("<InputSwitch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set f(value) {
    		throw new Error("<InputSwitch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get channel() {
    		throw new Error("<InputSwitch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set channel(value) {
    		throw new Error("<InputSwitch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/form/InputMatrix.svelte generated by Svelte v3.35.0 */
    const file$h = "src/components/form/InputMatrix.svelte";

    // (15:4) {#if f.label}
    function create_if_block_1$6(ctx) {
    	let label;
    	let t0_value = /*f*/ ctx[0].label + "";
    	let t0;
    	let t1;
    	let label_for_value;
    	let if_block = /*f*/ ctx[0].optional && create_if_block_2$6(ctx);

    	const block = {
    		c: function create() {
    			label = element("label");
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block) if_block.c();
    			attr_dev(label, "for", label_for_value = /*f*/ ctx[0].id);
    			add_location(label, file$h, 15, 8, 298);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, t0);
    			append_dev(label, t1);
    			if (if_block) if_block.m(label, null);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*f*/ 1 && t0_value !== (t0_value = /*f*/ ctx[0].label + "")) set_data_dev(t0, t0_value);

    			if (/*f*/ ctx[0].optional) {
    				if (if_block) ; else {
    					if_block = create_if_block_2$6(ctx);
    					if_block.c();
    					if_block.m(label, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*f*/ 1 && label_for_value !== (label_for_value = /*f*/ ctx[0].id)) {
    				attr_dev(label, "for", label_for_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$6.name,
    		type: "if",
    		source: "(15:4) {#if f.label}",
    		ctx
    	});

    	return block;
    }

    // (16:38) {#if f.optional}
    function create_if_block_2$6(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "(Optional)";
    			attr_dev(span, "class", "optional");
    			add_location(span, file$h, 15, 54, 344);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$6.name,
    		type: "if",
    		source: "(16:38) {#if f.optional}",
    		ctx
    	});

    	return block;
    }

    // (18:4) {#if f.hint}
    function create_if_block$b(ctx) {
    	let p;
    	let t_value = /*f*/ ctx[0].hint + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			add_location(p, file$h, 18, 8, 433);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*f*/ 1 && t_value !== (t_value = /*f*/ ctx[0].hint + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$b.name,
    		type: "if",
    		source: "(18:4) {#if f.hint}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let div2;
    	let t0;
    	let t1;
    	let div1;
    	let div0;
    	let t2_value = (/*f*/ ctx[0].answer.text ? /*f*/ ctx[0].answer.text : "") + "";
    	let t2;
    	let t3;
    	let i;
    	let t4;
    	let shortcuts;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*f*/ ctx[0].label && create_if_block_1$6(ctx);
    	let if_block1 = /*f*/ ctx[0].hint && create_if_block$b(ctx);

    	shortcuts = new Shortcuts({
    			props: { f: /*f*/ ctx[0] },
    			$$inline: true
    		});

    	shortcuts.$on("shortcut", /*shortcut_handler*/ ctx[2]);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			div1 = element("div");
    			div0 = element("div");
    			t2 = text(t2_value);
    			t3 = space();
    			i = element("i");
    			t4 = space();
    			create_component(shortcuts.$$.fragment);
    			attr_dev(div0, "class", "matrix svelte-1l2uey6");
    			toggle_class(div0, "ok", /*f*/ ctx[0].answer.color == "ok");
    			toggle_class(div0, "warning", /*f*/ ctx[0].answer.color == "warning");
    			toggle_class(div0, "critical", /*f*/ ctx[0].answer.color == "critical");
    			add_location(div0, file$h, 21, 8, 523);
    			attr_dev(i, "class", "i-hinton-plot  i-20");
    			add_location(i, file$h, 22, 8, 724);
    			attr_dev(div1, "class", "form-control svelte-1l2uey6");
    			add_location(div1, file$h, 20, 4, 463);
    			attr_dev(div2, "class", "form-item");
    			add_location(div2, file$h, 13, 0, 248);
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
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, t2);
    			append_dev(div1, t3);
    			append_dev(div1, i);
    			append_dev(div2, t4);
    			mount_component(shortcuts, div2, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div1, "click", /*open_matrix*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*f*/ ctx[0].label) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$6(ctx);
    					if_block0.c();
    					if_block0.m(div2, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*f*/ ctx[0].hint) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$b(ctx);
    					if_block1.c();
    					if_block1.m(div2, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if ((!current || dirty & /*f*/ 1) && t2_value !== (t2_value = (/*f*/ ctx[0].answer.text ? /*f*/ ctx[0].answer.text : "") + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*f*/ 1) {
    				toggle_class(div0, "ok", /*f*/ ctx[0].answer.color == "ok");
    			}

    			if (dirty & /*f*/ 1) {
    				toggle_class(div0, "warning", /*f*/ ctx[0].answer.color == "warning");
    			}

    			if (dirty & /*f*/ 1) {
    				toggle_class(div0, "critical", /*f*/ ctx[0].answer.color == "critical");
    			}

    			const shortcuts_changes = {};
    			if (dirty & /*f*/ 1) shortcuts_changes.f = /*f*/ ctx[0];
    			shortcuts.$set(shortcuts_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(shortcuts.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(shortcuts.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			destroy_component(shortcuts);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("InputMatrix", slots, []);
    	let { f } = $$props;

    	function open_matrix() {
    		JSON.parse(JSON.stringify(f));
    		pubsub.publish("MATRIX", f);
    	}

    	const writable_props = ["f"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<InputMatrix> was created with unknown prop '${key}'`);
    	});

    	const shortcut_handler = ev => {
    		$$invalidate(0, f.answer = ev.detail.value.toLocaleString(), f);
    	};

    	$$self.$$set = $$props => {
    		if ("f" in $$props) $$invalidate(0, f = $$props.f);
    	};

    	$$self.$capture_state = () => ({ Shortcuts, PubSub: pubsub, f, open_matrix });

    	$$self.$inject_state = $$props => {
    		if ("f" in $$props) $$invalidate(0, f = $$props.f);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [f, open_matrix, shortcut_handler];
    }

    class InputMatrix extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, { f: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InputMatrix",
    			options,
    			id: create_fragment$h.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*f*/ ctx[0] === undefined && !("f" in props)) {
    			console.warn("<InputMatrix> was created without expected prop 'f'");
    		}
    	}

    	get f() {
    		throw new Error("<InputMatrix>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set f(value) {
    		throw new Error("<InputMatrix>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/form/Section.svelte generated by Svelte v3.35.0 */
    const file$g = "src/components/form/Section.svelte";

    function get_each_context$7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (27:4) {#if f.label}
    function create_if_block_2$5(ctx) {
    	let div;
    	let h3;
    	let t_value = /*f*/ ctx[1].label + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h3 = element("h3");
    			t = text(t_value);
    			attr_dev(h3, "class", "svelte-1q9p9bd");
    			add_location(h3, file$g, 28, 12, 731);
    			attr_dev(div, "class", "card-header");
    			add_location(div, file$g, 27, 8, 693);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h3);
    			append_dev(h3, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*f*/ 2 && t_value !== (t_value = /*f*/ ctx[1].label + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$5.name,
    		type: "if",
    		source: "(27:4) {#if f.label}",
    		ctx
    	});

    	return block;
    }

    // (34:8) {#if f.children}
    function create_if_block$a(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*f*/ ctx[1].children;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$7(get_each_context$7(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

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
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*components, f, channel*/ 7) {
    				each_value = /*f*/ ctx[1].children;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$7(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$7(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$a.name,
    		type: "if",
    		source: "(34:8) {#if f.children}",
    		ctx
    	});

    	return block;
    }

    // (39:16) {:else}
    function create_else_block$8(ctx) {
    	let div;
    	let t0;
    	let b;
    	let t1_value = /*f*/ ctx[1].item_type + "";
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("Tried loading an unknown component ");
    			b = element("b");
    			t1 = text(t1_value);
    			add_location(b, file$g, 39, 60, 1082);
    			add_location(div, file$g, 39, 20, 1042);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, b);
    			append_dev(b, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*f*/ 2 && t1_value !== (t1_value = /*f*/ ctx[1].item_type + "")) set_data_dev(t1, t1_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$8.name,
    		type: "else",
    		source: "(39:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (37:16) {#if components[f.item_type]}
    function create_if_block_1$5(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*components*/ ctx[2][/*f*/ ctx[1].item_type];

    	function switch_props(ctx) {
    		return {
    			props: {
    				f: /*f*/ ctx[1],
    				channel: /*channel*/ ctx[0]
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};
    			if (dirty & /*f*/ 2) switch_instance_changes.f = /*f*/ ctx[1];
    			if (dirty & /*channel*/ 1) switch_instance_changes.channel = /*channel*/ ctx[0];

    			if (switch_value !== (switch_value = /*components*/ ctx[2][/*f*/ ctx[1].item_type])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$5.name,
    		type: "if",
    		source: "(37:16) {#if components[f.item_type]}",
    		ctx
    	});

    	return block;
    }

    // (36:12) {#each f.children as f}
    function create_each_block$7(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$5, create_else_block$8];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*components*/ ctx[2][/*f*/ ctx[1].item_type]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$7.name,
    		type: "each",
    		source: "(36:12) {#each f.children as f}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let div1;
    	let t;
    	let div0;
    	let current;
    	let if_block0 = /*f*/ ctx[1].label && create_if_block_2$5(ctx);
    	let if_block1 = /*f*/ ctx[1].children && create_if_block$a(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			if (if_block0) if_block0.c();
    			t = space();
    			div0 = element("div");
    			if (if_block1) if_block1.c();
    			attr_dev(div0, "class", "card-body");
    			add_location(div0, file$g, 32, 4, 780);
    			attr_dev(div1, "class", "card svelte-1q9p9bd");
    			add_location(div1, file$g, 25, 0, 648);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div1, t);
    			append_dev(div1, div0);
    			if (if_block1) if_block1.m(div0, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*f*/ ctx[1].label) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2$5(ctx);
    					if_block0.c();
    					if_block0.m(div1, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*f*/ ctx[1].children) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*f*/ 2) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$a(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div0, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Section", slots, []);

    	let components = {
    		"input_text": InputText,
    		"input_multi": InputMulti,
    		"input_lookup": InputLookup,
    		"input_select": InputSelect,
    		"input_textarea": InputTextarea,
    		"input_switch": InputSwitch,
    		"input_matrix": InputMatrix
    	};

    	let { f } = $$props;
    	let { channel } = $$props;
    	const writable_props = ["f", "channel"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Section> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("f" in $$props) $$invalidate(1, f = $$props.f);
    		if ("channel" in $$props) $$invalidate(0, channel = $$props.channel);
    	};

    	$$self.$capture_state = () => ({
    		InputSelect,
    		InputText,
    		InputMulti,
    		InputLookup,
    		InputTextarea,
    		InputSwitch,
    		InputMatrix,
    		components,
    		f,
    		channel
    	});

    	$$self.$inject_state = $$props => {
    		if ("components" in $$props) $$invalidate(2, components = $$props.components);
    		if ("f" in $$props) $$invalidate(1, f = $$props.f);
    		if ("channel" in $$props) $$invalidate(0, channel = $$props.channel);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [channel, f, components];
    }

    class Section extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, { f: 1, channel: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Section",
    			options,
    			id: create_fragment$g.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*f*/ ctx[1] === undefined && !("f" in props)) {
    			console.warn("<Section> was created without expected prop 'f'");
    		}

    		if (/*channel*/ ctx[0] === undefined && !("channel" in props)) {
    			console.warn("<Section> was created without expected prop 'channel'");
    		}
    	}

    	get f() {
    		throw new Error("<Section>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set f(value) {
    		throw new Error("<Section>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get channel() {
    		throw new Error("<Section>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set channel(value) {
    		throw new Error("<Section>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/form/InputCheckbox.svelte generated by Svelte v3.35.0 */

    const file$f = "src/components/form/InputCheckbox.svelte";

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	child_ctx[4] = list;
    	child_ctx[5] = i;
    	return child_ctx;
    }

    // (9:4) {#if f.label}
    function create_if_block_2$4(ctx) {
    	let label;
    	let t_value = /*f*/ ctx[0].label + "";
    	let t;

    	const block = {
    		c: function create() {
    			label = element("label");
    			t = text(t_value);
    			add_location(label, file$f, 9, 8, 125);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*f*/ 1 && t_value !== (t_value = /*f*/ ctx[0].label + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$4.name,
    		type: "if",
    		source: "(9:4) {#if f.label}",
    		ctx
    	});

    	return block;
    }

    // (12:4) {#if f.hint}
    function create_if_block_1$4(ctx) {
    	let p;
    	let t_value = /*f*/ ctx[0].hint + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			add_location(p, file$f, 12, 8, 185);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*f*/ 1 && t_value !== (t_value = /*f*/ ctx[0].hint + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(12:4) {#if f.hint}",
    		ctx
    	});

    	return block;
    }

    // (19:12) {:else}
    function create_else_block$7(ctx) {
    	let i;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "i-checkbox i-20 svelte-17p0g6d");
    			add_location(i, file$f, 19, 16, 499);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$7.name,
    		type: "else",
    		source: "(19:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (17:12) {#if option.value}
    function create_if_block$9(ctx) {
    	let i;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "i-checkbox-selected i-20 svelte-17p0g6d");
    			add_location(i, file$f, 17, 16, 421);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$9.name,
    		type: "if",
    		source: "(17:12) {#if option.value}",
    		ctx
    	});

    	return block;
    }

    // (15:4) {#each f.options as option}
    function create_each_block$6(ctx) {
    	let div;
    	let t0;
    	let t1_value = /*option*/ ctx[3].text + "";
    	let t1;
    	let t2;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*option*/ ctx[3].value) return create_if_block$9;
    		return create_else_block$7;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	function click_handler() {
    		return /*click_handler*/ ctx[2](/*option*/ ctx[3], /*each_value*/ ctx[4], /*option_index*/ ctx[5]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(div, "class", "checkbox_label svelte-17p0g6d");
    			toggle_class(div, "simple", /*f*/ ctx[0].options.length == 1);
    			add_location(div, file$f, 15, 8, 251);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, t0);
    				}
    			}

    			if (dirty & /*f*/ 1 && t1_value !== (t1_value = /*option*/ ctx[3].text + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*f*/ 1) {
    				toggle_class(div, "simple", /*f*/ ctx[0].options.length == 1);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(15:4) {#each f.options as option}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let if_block0 = /*f*/ ctx[0].label && create_if_block_2$4(ctx);
    	let if_block1 = /*f*/ ctx[0].hint && create_if_block_1$4(ctx);
    	let each_value = /*f*/ ctx[0].options;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "form-item");
    			add_location(div, file$f, 7, 0, 75);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t0);
    			if (if_block1) if_block1.m(div, null);
    			append_dev(div, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*f*/ ctx[0].label) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2$4(ctx);
    					if_block0.c();
    					if_block0.m(div, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*f*/ ctx[0].hint) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$4(ctx);
    					if_block1.c();
    					if_block1.m(div, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*f*/ 1) {
    				each_value = /*f*/ ctx[0].options;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$6(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$6(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("InputCheckbox", slots, []);
    	let { f } = $$props;
    	let { channel = "ANSWER" } = $$props;
    	const writable_props = ["f", "channel"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<InputCheckbox> was created with unknown prop '${key}'`);
    	});

    	const click_handler = (option, each_value, option_index) => {
    		$$invalidate(0, each_value[option_index].value = !option.value, f);
    	};

    	$$self.$$set = $$props => {
    		if ("f" in $$props) $$invalidate(0, f = $$props.f);
    		if ("channel" in $$props) $$invalidate(1, channel = $$props.channel);
    	};

    	$$self.$capture_state = () => ({ f, channel });

    	$$self.$inject_state = $$props => {
    		if ("f" in $$props) $$invalidate(0, f = $$props.f);
    		if ("channel" in $$props) $$invalidate(1, channel = $$props.channel);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [f, channel, click_handler];
    }

    class InputCheckbox extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, { f: 0, channel: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InputCheckbox",
    			options,
    			id: create_fragment$f.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*f*/ ctx[0] === undefined && !("f" in props)) {
    			console.warn("<InputCheckbox> was created without expected prop 'f'");
    		}
    	}

    	get f() {
    		throw new Error("<InputCheckbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set f(value) {
    		throw new Error("<InputCheckbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get channel() {
    		throw new Error("<InputCheckbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set channel(value) {
    		throw new Error("<InputCheckbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/form/Form.svelte generated by Svelte v3.35.0 */

    const { console: console_1$5 } = globals;
    const file$e = "src/components/form/Form.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (37:4) {:else}
    function create_else_block$6(ctx) {
    	let t0;
    	let b;
    	let t1_value = /*f*/ ctx[1].item_type + "";
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			t0 = text("Unknown component ");
    			b = element("b");
    			t1 = text(t1_value);
    			t2 = text(" on Form.svelte.");
    			add_location(b, file$e, 37, 26, 1099);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, b, anchor);
    			append_dev(b, t1);
    			insert_dev(target, t2, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*f*/ 2 && t1_value !== (t1_value = /*f*/ ctx[1].item_type + "")) set_data_dev(t1, t1_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(b);
    			if (detaching) detach_dev(t2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$6.name,
    		type: "else",
    		source: "(37:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (35:4) {#if components[f.item_type]}
    function create_if_block$8(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*components*/ ctx[2][/*f*/ ctx[1].item_type];

    	function switch_props(ctx) {
    		return {
    			props: {
    				f: /*f*/ ctx[1],
    				channel: /*channel*/ ctx[0]
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};
    			if (dirty & /*f*/ 2) switch_instance_changes.f = /*f*/ ctx[1];
    			if (dirty & /*channel*/ 1) switch_instance_changes.channel = /*channel*/ ctx[0];

    			if (switch_value !== (switch_value = /*components*/ ctx[2][/*f*/ ctx[1].item_type])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(35:4) {#if components[f.item_type]}",
    		ctx
    	});

    	return block;
    }

    // (34:0) {#each f as f}
    function create_each_block$5(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$8, create_else_block$6];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*components*/ ctx[2][/*f*/ ctx[1].item_type]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(34:0) {#each f as f}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*f*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*components, f, channel*/ 7) {
    				each_value = /*f*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Form", slots, []);
    	let { f } = $$props;
    	let { channel = "ANSWER" } = $$props;

    	let components = {
    		"section": Section,
    		"input_text": InputText,
    		"input_multi": InputMulti,
    		"input_lookup": InputLookup,
    		"input_select": InputSelect,
    		"input_textarea": InputTextarea,
    		"input_checkbox": InputCheckbox,
    		"input_switch": InputSwitch,
    		"input_matrix": InputMatrix
    	};

    	onMount(() => {
    		console.log("Form and all children are mounted");
    	});

    	const writable_props = ["f", "channel"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$5.warn(`<Form> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("f" in $$props) $$invalidate(1, f = $$props.f);
    		if ("channel" in $$props) $$invalidate(0, channel = $$props.channel);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		Section,
    		InputSelect,
    		InputText,
    		InputMulti,
    		InputLookup,
    		InputTextarea,
    		InputCheckbox,
    		InputSwitch,
    		InputMatrix,
    		f,
    		channel,
    		components
    	});

    	$$self.$inject_state = $$props => {
    		if ("f" in $$props) $$invalidate(1, f = $$props.f);
    		if ("channel" in $$props) $$invalidate(0, channel = $$props.channel);
    		if ("components" in $$props) $$invalidate(2, components = $$props.components);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [channel, f, components];
    }

    class Form extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, { f: 1, channel: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Form",
    			options,
    			id: create_fragment$e.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*f*/ ctx[1] === undefined && !("f" in props)) {
    			console_1$5.warn("<Form> was created without expected prop 'f'");
    		}
    	}

    	get f() {
    		throw new Error("<Form>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set f(value) {
    		throw new Error("<Form>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get channel() {
    		throw new Error("<Form>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set channel(value) {
    		throw new Error("<Form>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/table/RecordID.svelte generated by Svelte v3.35.0 */

    const file$d = "src/components/table/RecordID.svelte";

    function create_fragment$d(ctx) {
    	let a;
    	let t;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text(/*obj*/ ctx[0]);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "svelte-dqfw7i");
    			add_location(a, file$d, 4, 0, 40);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*obj*/ 1) set_data_dev(t, /*obj*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("RecordID", slots, []);
    	let { obj } = $$props;
    	const writable_props = ["obj"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<RecordID> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("obj" in $$props) $$invalidate(0, obj = $$props.obj);
    	};

    	$$self.$capture_state = () => ({ obj });

    	$$self.$inject_state = $$props => {
    		if ("obj" in $$props) $$invalidate(0, obj = $$props.obj);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [obj];
    }

    class RecordID extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { obj: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RecordID",
    			options,
    			id: create_fragment$d.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*obj*/ ctx[0] === undefined && !("obj" in props)) {
    			console.warn("<RecordID> was created without expected prop 'obj'");
    		}
    	}

    	get obj() {
    		throw new Error("<RecordID>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set obj(value) {
    		throw new Error("<RecordID>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/table/Status.svelte generated by Svelte v3.35.0 */

    const file$c = "src/components/table/Status.svelte";

    // (21:0) {:else}
    function create_else_block$5(ctx) {
    	let span;
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(/*obj*/ ctx[0]);
    			attr_dev(span, "class", "badge unknown svelte-siduoh");
    			add_location(span, file$c, 21, 4, 513);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*obj*/ 1) set_data_dev(t, /*obj*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$5.name,
    		type: "else",
    		source: "(21:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (19:0) {#if status_list[obj]}
    function create_if_block$7(ctx) {
    	let span;
    	let t_value = /*status_list*/ ctx[1][/*obj*/ ctx[0]].value + "";
    	let t;
    	let span_class_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", span_class_value = "badge " + /*status_list*/ ctx[1][/*obj*/ ctx[0]].color + " svelte-siduoh");
    			add_location(span, file$c, 19, 4, 424);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*obj*/ 1 && t_value !== (t_value = /*status_list*/ ctx[1][/*obj*/ ctx[0]].value + "")) set_data_dev(t, t_value);

    			if (dirty & /*obj*/ 1 && span_class_value !== (span_class_value = "badge " + /*status_list*/ ctx[1][/*obj*/ ctx[0]].color + " svelte-siduoh")) {
    				attr_dev(span, "class", span_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(19:0) {#if status_list[obj]}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*status_list*/ ctx[1][/*obj*/ ctx[0]]) return create_if_block$7;
    		return create_else_block$5;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Status", slots, []);
    	let { obj } = $$props;

    	let status_list = {
    		"in_progress": { value: "In Progress", color: "success" },
    		"awaiting_triage": {
    			value: "Awaiting Triage",
    			color: "warning"
    		},
    		"awaiting_investigation": {
    			value: "Awaiting Investigation",
    			color: "critical"
    		}
    	};

    	const writable_props = ["obj"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Status> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("obj" in $$props) $$invalidate(0, obj = $$props.obj);
    	};

    	$$self.$capture_state = () => ({ obj, status_list });

    	$$self.$inject_state = $$props => {
    		if ("obj" in $$props) $$invalidate(0, obj = $$props.obj);
    		if ("status_list" in $$props) $$invalidate(1, status_list = $$props.status_list);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [obj, status_list];
    }

    class Status extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { obj: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Status",
    			options,
    			id: create_fragment$c.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*obj*/ ctx[0] === undefined && !("obj" in props)) {
    			console.warn("<Status> was created without expected prop 'obj'");
    		}
    	}

    	get obj() {
    		throw new Error("<Status>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set obj(value) {
    		throw new Error("<Status>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/table/Channel.svelte generated by Svelte v3.35.0 */

    const file$b = "src/components/table/Channel.svelte";

    // (17:0) {:else}
    function create_else_block$4(ctx) {
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text("?? ");
    			t1 = text(/*obj*/ ctx[0]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*obj*/ 1) set_data_dev(t1, /*obj*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(17:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (15:0) {#if status_list[obj]}
    function create_if_block$6(ctx) {
    	let span;
    	let i;
    	let i_class_value;
    	let t0;
    	let t1_value = /*status_list*/ ctx[1][/*obj*/ ctx[0]].value + "";
    	let t1;

    	const block = {
    		c: function create() {
    			span = element("span");
    			i = element("i");
    			t0 = space();
    			t1 = text(t1_value);
    			attr_dev(i, "class", i_class_value = "i-" + /*status_list*/ ctx[1][/*obj*/ ctx[0]].icon + " i-20");
    			add_location(i, file$b, 15, 10, 276);
    			attr_dev(span, "class", "svelte-1yatwl7");
    			add_location(span, file$b, 15, 4, 270);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, i);
    			append_dev(span, t0);
    			append_dev(span, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*obj*/ 1 && i_class_value !== (i_class_value = "i-" + /*status_list*/ ctx[1][/*obj*/ ctx[0]].icon + " i-20")) {
    				attr_dev(i, "class", i_class_value);
    			}

    			if (dirty & /*obj*/ 1 && t1_value !== (t1_value = /*status_list*/ ctx[1][/*obj*/ ctx[0]].value + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(15:0) {#if status_list[obj]}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*status_list*/ ctx[1][/*obj*/ ctx[0]]) return create_if_block$6;
    		return create_else_block$4;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Channel", slots, []);
    	let { obj } = $$props;

    	let status_list = {
    		"rapid": { value: "Quick Report", icon: "qr" },
    		"eco": { value: "Desktop", icon: "desktop" }
    	};

    	const writable_props = ["obj"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Channel> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("obj" in $$props) $$invalidate(0, obj = $$props.obj);
    	};

    	$$self.$capture_state = () => ({ obj, status_list });

    	$$self.$inject_state = $$props => {
    		if ("obj" in $$props) $$invalidate(0, obj = $$props.obj);
    		if ("status_list" in $$props) $$invalidate(1, status_list = $$props.status_list);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [obj, status_list];
    }

    class Channel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { obj: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Channel",
    			options,
    			id: create_fragment$b.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*obj*/ ctx[0] === undefined && !("obj" in props)) {
    			console.warn("<Channel> was created without expected prop 'obj'");
    		}
    	}

    	get obj() {
    		throw new Error("<Channel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set obj(value) {
    		throw new Error("<Channel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/table/Date.svelte generated by Svelte v3.35.0 */

    const file$a = "src/components/table/Date.svelte";

    function create_fragment$a(ctx) {
    	let span;
    	let t;
    	let span_title_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(/*formatted*/ ctx[1]);
    			attr_dev(span, "title", span_title_value = "UTC: " + /*obj*/ ctx[0]);
    			add_location(span, file$a, 9, 0, 275);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*formatted*/ 2) set_data_dev(t, /*formatted*/ ctx[1]);

    			if (dirty & /*obj*/ 1 && span_title_value !== (span_title_value = "UTC: " + /*obj*/ ctx[0])) {
    				attr_dev(span, "title", span_title_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let formatted;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Date", slots, []);
    	let { obj } = $$props; //assumes this is a date string
    	let str = JSON.parse(JSON.stringify(obj));
    	const writable_props = ["obj"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Date> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("obj" in $$props) $$invalidate(0, obj = $$props.obj);
    	};

    	$$self.$capture_state = () => ({ obj, str, formatted });

    	$$self.$inject_state = $$props => {
    		if ("obj" in $$props) $$invalidate(0, obj = $$props.obj);
    		if ("str" in $$props) str = $$props.str;
    		if ("formatted" in $$props) $$invalidate(1, formatted = $$props.formatted);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*obj*/ 1) {
    			$$invalidate(1, formatted = new Date(obj + "").toLocaleString([], {
    				year: "numeric",
    				month: "numeric",
    				day: "numeric",
    				hour: "2-digit",
    				minute: "2-digit"
    			}));
    		}
    	};

    	return [obj, formatted];
    }

    class Date_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { obj: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Date_1",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*obj*/ ctx[0] === undefined && !("obj" in props)) {
    			console.warn("<Date> was created without expected prop 'obj'");
    		}
    	}

    	get obj() {
    		throw new Error("<Date>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set obj(value) {
    		throw new Error("<Date>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Frame_incidents.svelte generated by Svelte v3.35.0 */

    const { Object: Object_1$1, console: console_1$4 } = globals;
    const file$9 = "src/Frame_incidents.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[37] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[40] = list[i][0];
    	child_ctx[41] = list[i][1];
    	return child_ctx;
    }

    function get_each_context_2$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[40] = list[i][0];
    	child_ctx[41] = list[i][1];
    	return child_ctx;
    }

    // (552:28) 
    function create_if_block_2$3(ctx) {
    	let h2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Summary";
    			add_location(h2, file$9, 552, 4, 22331);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(552:28) ",
    		ctx
    	});

    	return block;
    }

    // (401:0) {#if tab == 'overview'}
    function create_if_block$5(ctx) {
    	let div26;
    	let div21;
    	let div20;
    	let div4;
    	let div3;
    	let div0;
    	let t0;
    	let a0;
    	let t1;
    	let div2;
    	let div1;
    	let t3;
    	let div9;
    	let div8;
    	let div5;
    	let t4;
    	let a1;
    	let t5;
    	let div7;
    	let div6;
    	let t7;
    	let div14;
    	let div13;
    	let div10;
    	let t8;
    	let a2;
    	let t9;
    	let div12;
    	let div11;
    	let t11;
    	let div19;
    	let div18;
    	let div15;
    	let t12;
    	let a3;
    	let t13;
    	let div17;
    	let div16;
    	let t15;
    	let div25;
    	let div24;
    	let div22;
    	let t16;
    	let a4;
    	let t17;
    	let div23;
    	let svg;
    	let path0;
    	let rect0;
    	let rect1;
    	let rect2;
    	let rect3;
    	let rect4;
    	let rect5;
    	let rect6;
    	let rect7;
    	let rect8;
    	let rect9;
    	let rect10;
    	let rect11;
    	let rect12;
    	let rect13;
    	let rect14;
    	let rect15;
    	let rect16;
    	let rect17;
    	let path1;
    	let path2;
    	let text0;
    	let tspan0;
    	let t18;
    	let tspan1;
    	let t19;
    	let text1;
    	let tspan2;
    	let t20;
    	let tspan3;
    	let t21;
    	let text2;
    	let tspan4;
    	let t22;
    	let tspan5;
    	let t23;
    	let text3;
    	let tspan6;
    	let t24;
    	let tspan7;
    	let t25;
    	let text4;
    	let tspan8;
    	let t26;
    	let tspan9;
    	let t27;
    	let text5;
    	let tspan10;
    	let t28;
    	let tspan11;
    	let t29;
    	let text6;
    	let tspan12;
    	let t30;
    	let tspan13;
    	let t31;
    	let text7;
    	let tspan14;
    	let t32;
    	let tspan15;
    	let t33;
    	let text8;
    	let tspan16;
    	let t34;
    	let tspan17;
    	let t35;
    	let text9;
    	let tspan18;
    	let t36;
    	let tspan19;
    	let t37;
    	let text10;
    	let tspan20;
    	let t38;
    	let text11;
    	let tspan21;
    	let t39;
    	let text12;
    	let tspan22;
    	let t40;
    	let text13;
    	let tspan23;
    	let t41;
    	let text14;
    	let tspan24;
    	let t42;
    	let text15;
    	let tspan25;
    	let t43;
    	let text16;
    	let tspan26;
    	let t44;
    	let t45;
    	let div31;
    	let div30;
    	let h4;
    	let t46;
    	let a5;
    	let t47;
    	let a6;
    	let t48;
    	let div29;
    	let table;
    	let thead;
    	let tr;
    	let t49;
    	let tbody;
    	let t50;
    	let div28;
    	let div27;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_2 = Object.entries(/*selected_columns*/ ctx[3]);
    	validate_each_argument(each_value_2);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_1[i] = create_each_block_2$2(get_each_context_2$2(ctx, each_value_2, i));
    	}

    	let each_value = /*table_data_sorted*/ ctx[6];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div26 = element("div");
    			div21 = element("div");
    			div20 = element("div");
    			div4 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			t0 = text("Open Events");
    			a0 = element("a");
    			t1 = space();
    			div2 = element("div");
    			div1 = element("div");
    			div1.textContent = "40";
    			t3 = space();
    			div9 = element("div");
    			div8 = element("div");
    			div5 = element("div");
    			t4 = text("Awaiting Investigation");
    			a1 = element("a");
    			t5 = space();
    			div7 = element("div");
    			div6 = element("div");
    			div6.textContent = "11";
    			t7 = space();
    			div14 = element("div");
    			div13 = element("div");
    			div10 = element("div");
    			t8 = text("Awaiting Signoff");
    			a2 = element("a");
    			t9 = space();
    			div12 = element("div");
    			div11 = element("div");
    			div11.textContent = "3";
    			t11 = space();
    			div19 = element("div");
    			div18 = element("div");
    			div15 = element("div");
    			t12 = text("High Potential Severity");
    			a3 = element("a");
    			t13 = space();
    			div17 = element("div");
    			div16 = element("div");
    			div16.textContent = "1";
    			t15 = space();
    			div25 = element("div");
    			div24 = element("div");
    			div22 = element("div");
    			t16 = text("Events by Type");
    			a4 = element("a");
    			t17 = space();
    			div23 = element("div");
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			rect0 = svg_element("rect");
    			rect1 = svg_element("rect");
    			rect2 = svg_element("rect");
    			rect3 = svg_element("rect");
    			rect4 = svg_element("rect");
    			rect5 = svg_element("rect");
    			rect6 = svg_element("rect");
    			rect7 = svg_element("rect");
    			rect8 = svg_element("rect");
    			rect9 = svg_element("rect");
    			rect10 = svg_element("rect");
    			rect11 = svg_element("rect");
    			rect12 = svg_element("rect");
    			rect13 = svg_element("rect");
    			rect14 = svg_element("rect");
    			rect15 = svg_element("rect");
    			rect16 = svg_element("rect");
    			rect17 = svg_element("rect");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			text0 = svg_element("text");
    			tspan0 = svg_element("tspan");
    			t18 = text("2021 ");
    			tspan1 = svg_element("tspan");
    			t19 = text("-01 ");
    			text1 = svg_element("text");
    			tspan2 = svg_element("tspan");
    			t20 = text("2021 ");
    			tspan3 = svg_element("tspan");
    			t21 = text("-10 ");
    			text2 = svg_element("text");
    			tspan4 = svg_element("tspan");
    			t22 = text("2021 ");
    			tspan5 = svg_element("tspan");
    			t23 = text("-02 ");
    			text3 = svg_element("text");
    			tspan6 = svg_element("tspan");
    			t24 = text("2021 ");
    			tspan7 = svg_element("tspan");
    			t25 = text("-03 ");
    			text4 = svg_element("text");
    			tspan8 = svg_element("tspan");
    			t26 = text("2021 ");
    			tspan9 = svg_element("tspan");
    			t27 = text("-04 ");
    			text5 = svg_element("text");
    			tspan10 = svg_element("tspan");
    			t28 = text("2021 ");
    			tspan11 = svg_element("tspan");
    			t29 = text("-05 ");
    			text6 = svg_element("text");
    			tspan12 = svg_element("tspan");
    			t30 = text("2021 ");
    			tspan13 = svg_element("tspan");
    			t31 = text("-06 ");
    			text7 = svg_element("text");
    			tspan14 = svg_element("tspan");
    			t32 = text("2021 ");
    			tspan15 = svg_element("tspan");
    			t33 = text("-07 ");
    			text8 = svg_element("text");
    			tspan16 = svg_element("tspan");
    			t34 = text("2021 ");
    			tspan17 = svg_element("tspan");
    			t35 = text("-08 ");
    			text9 = svg_element("text");
    			tspan18 = svg_element("tspan");
    			t36 = text("2021 ");
    			tspan19 = svg_element("tspan");
    			t37 = text("-09 ");
    			text10 = svg_element("text");
    			tspan20 = svg_element("tspan");
    			t38 = text("0");
    			text11 = svg_element("text");
    			tspan21 = svg_element("tspan");
    			t39 = text("12");
    			text12 = svg_element("text");
    			tspan22 = svg_element("tspan");
    			t40 = text("2");
    			text13 = svg_element("text");
    			tspan23 = svg_element("tspan");
    			t41 = text("4");
    			text14 = svg_element("text");
    			tspan24 = svg_element("tspan");
    			t42 = text("6");
    			text15 = svg_element("text");
    			tspan25 = svg_element("tspan");
    			t43 = text("8");
    			text16 = svg_element("text");
    			tspan26 = svg_element("tspan");
    			t44 = text("10");
    			t45 = space();
    			div31 = element("div");
    			div30 = element("div");
    			h4 = element("h4");
    			t46 = text("Latest Events\n                ");
    			a5 = element("a");
    			t47 = space();
    			a6 = element("a");
    			t48 = space();
    			div29 = element("div");
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t49 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t50 = space();
    			div28 = element("div");
    			div27 = element("div");
    			attr_dev(a0, "href", "/");
    			attr_dev(a0, "class", "i-pin i-20 btn-right");
    			add_location(a0, file$9, 406, 60, 12812);
    			attr_dev(div0, "class", "card-header");
    			add_location(div0, file$9, 406, 24, 12776);
    			attr_dev(div1, "class", "big-num");
    			add_location(div1, file$9, 408, 28, 13005);
    			attr_dev(div2, "class", "card-body");
    			add_location(div2, file$9, 407, 24, 12953);
    			attr_dev(div3, "class", "card card-31");
    			add_location(div3, file$9, 405, 20, 12725);
    			attr_dev(div4, "class", "col6");
    			add_location(div4, file$9, 404, 16, 12686);
    			attr_dev(a1, "href", "/");
    			attr_dev(a1, "class", "i-pin i-20 btn-right");
    			add_location(a1, file$9, 414, 71, 13269);
    			attr_dev(div5, "class", "card-header");
    			add_location(div5, file$9, 414, 24, 13222);
    			attr_dev(div6, "class", "big-num minor");
    			add_location(div6, file$9, 416, 28, 13473);
    			attr_dev(div7, "class", "card-body");
    			add_location(div7, file$9, 415, 24, 13421);
    			attr_dev(div8, "class", "card card-31");
    			add_location(div8, file$9, 413, 20, 13171);
    			attr_dev(div9, "class", "col6");
    			add_location(div9, file$9, 412, 16, 13132);
    			attr_dev(a2, "href", "/");
    			attr_dev(a2, "class", "i-pin i-20 btn-right");
    			add_location(a2, file$9, 422, 65, 13737);
    			attr_dev(div10, "class", "card-header");
    			add_location(div10, file$9, 422, 24, 13696);
    			attr_dev(div11, "class", "big-num minor");
    			add_location(div11, file$9, 424, 28, 13935);
    			attr_dev(div12, "class", "card-body");
    			add_location(div12, file$9, 423, 24, 13883);
    			attr_dev(div13, "class", "card card-31");
    			add_location(div13, file$9, 421, 20, 13645);
    			attr_dev(div14, "class", "col6");
    			add_location(div14, file$9, 420, 16, 13606);
    			attr_dev(a3, "href", "/");
    			attr_dev(a3, "class", "i-pin i-20 btn-right");
    			add_location(a3, file$9, 430, 72, 14205);
    			attr_dev(div15, "class", "card-header");
    			add_location(div15, file$9, 430, 24, 14157);
    			attr_dev(div16, "class", "big-num danger");
    			add_location(div16, file$9, 432, 28, 14410);
    			attr_dev(div17, "class", "card-body");
    			add_location(div17, file$9, 431, 24, 14358);
    			attr_dev(div18, "class", "card card-31");
    			add_location(div18, file$9, 429, 20, 14106);
    			attr_dev(div19, "class", "col6");
    			add_location(div19, file$9, 428, 16, 14067);
    			attr_dev(div20, "class", "row");
    			add_location(div20, file$9, 403, 12, 12652);
    			attr_dev(div21, "class", "col12 col-md-6");
    			add_location(div21, file$9, 402, 8, 12611);
    			attr_dev(a4, "href", "/");
    			attr_dev(a4, "class", "i-pin i-20 btn-right");
    			add_location(a4, file$9, 441, 55, 14693);
    			attr_dev(div22, "class", "card-header");
    			add_location(div22, file$9, 441, 16, 14654);
    			attr_dev(path0, "class", "grid_lines svelte-hz54gq");
    			attr_dev(path0, "d", "M 35 162 L 407 162 M 35 138 L 407 138 M 35 114 L 407 114 M 35 91 L 407 91 M 35 67 L 407 67 M 35 43 L 407 43 M 35 19 L 407 19");
    			add_location(path0, file$9, 446, 24, 15140);
    			attr_dev(rect0, "class", "leg1 svelte-hz54gq");
    			attr_dev(rect0, "x", "39");
    			attr_dev(rect0, "y", "150");
    			attr_dev(rect0, "width", "29");
    			attr_dev(rect0, "height", "12");
    			add_location(rect0, file$9, 448, 24, 15351);
    			attr_dev(rect1, "class", "leg1 svelte-hz54gq");
    			attr_dev(rect1, "x", "76");
    			attr_dev(rect1, "y", "138");
    			attr_dev(rect1, "width", "29");
    			attr_dev(rect1, "height", "24");
    			add_location(rect1, file$9, 449, 24, 15427);
    			attr_dev(rect2, "class", "leg1 svelte-hz54gq");
    			attr_dev(rect2, "x", "225");
    			attr_dev(rect2, "y", "150");
    			attr_dev(rect2, "width", "29");
    			attr_dev(rect2, "height", "12");
    			add_location(rect2, file$9, 450, 24, 15503);
    			attr_dev(rect3, "class", "leg1 svelte-hz54gq");
    			attr_dev(rect3, "x", "262");
    			attr_dev(rect3, "y", "150");
    			attr_dev(rect3, "width", "29");
    			attr_dev(rect3, "height", "12");
    			add_location(rect3, file$9, 451, 24, 15580);
    			attr_dev(rect4, "class", "leg1 svelte-hz54gq");
    			attr_dev(rect4, "x", "299");
    			attr_dev(rect4, "y", "150");
    			attr_dev(rect4, "width", "29");
    			attr_dev(rect4, "height", "12");
    			add_location(rect4, file$9, 452, 24, 15657);
    			attr_dev(rect5, "class", "leg1 svelte-hz54gq");
    			attr_dev(rect5, "x", "374");
    			attr_dev(rect5, "y", "126");
    			attr_dev(rect5, "width", "29");
    			attr_dev(rect5, "height", "36");
    			add_location(rect5, file$9, 453, 24, 15734);
    			attr_dev(rect6, "class", "leg2 svelte-hz54gq");
    			attr_dev(rect6, "x", "39");
    			attr_dev(rect6, "y", "138");
    			attr_dev(rect6, "width", "29");
    			attr_dev(rect6, "height", "12");
    			add_location(rect6, file$9, 456, 24, 15813);
    			attr_dev(rect7, "class", "leg2 svelte-hz54gq");
    			attr_dev(rect7, "x", "76");
    			attr_dev(rect7, "y", "114");
    			attr_dev(rect7, "width", "29");
    			attr_dev(rect7, "height", "24");
    			add_location(rect7, file$9, 457, 24, 15889);
    			attr_dev(rect8, "class", "leg2 svelte-hz54gq");
    			attr_dev(rect8, "x", "151");
    			attr_dev(rect8, "y", "150");
    			attr_dev(rect8, "width", "29");
    			attr_dev(rect8, "height", "12");
    			add_location(rect8, file$9, 458, 24, 15965);
    			attr_dev(rect9, "class", "leg2 svelte-hz54gq");
    			attr_dev(rect9, "x", "225");
    			attr_dev(rect9, "y", "138");
    			attr_dev(rect9, "width", "29");
    			attr_dev(rect9, "height", "12");
    			add_location(rect9, file$9, 459, 24, 16042);
    			attr_dev(rect10, "class", "leg2 svelte-hz54gq");
    			attr_dev(rect10, "x", "262");
    			attr_dev(rect10, "y", "126");
    			attr_dev(rect10, "width", "29");
    			attr_dev(rect10, "height", "24");
    			add_location(rect10, file$9, 460, 24, 16119);
    			attr_dev(rect11, "class", "leg2 svelte-hz54gq");
    			attr_dev(rect11, "x", "374");
    			attr_dev(rect11, "y", "114");
    			attr_dev(rect11, "width", "29");
    			attr_dev(rect11, "height", "12");
    			add_location(rect11, file$9, 461, 24, 16196);
    			attr_dev(rect12, "class", "leg3 svelte-hz54gq");
    			attr_dev(rect12, "x", "76");
    			attr_dev(rect12, "y", "55");
    			attr_dev(rect12, "width", "29");
    			attr_dev(rect12, "height", "60");
    			add_location(rect12, file$9, 464, 24, 16339);
    			attr_dev(rect13, "class", "leg3 svelte-hz54gq");
    			attr_dev(rect13, "x", "113");
    			attr_dev(rect13, "y", "138");
    			attr_dev(rect13, "width", "29");
    			attr_dev(rect13, "height", "24");
    			add_location(rect13, file$9, 465, 24, 16414);
    			attr_dev(rect14, "class", "leg3 svelte-hz54gq");
    			attr_dev(rect14, "x", "188");
    			attr_dev(rect14, "y", "138");
    			attr_dev(rect14, "width", "29");
    			attr_dev(rect14, "height", "24");
    			add_location(rect14, file$9, 466, 24, 16491);
    			attr_dev(rect15, "class", "leg4 svelte-hz54gq");
    			attr_dev(rect15, "x", "262");
    			attr_dev(rect15, "y", "114");
    			attr_dev(rect15, "width", "29");
    			attr_dev(rect15, "height", "12");
    			add_location(rect15, file$9, 468, 24, 16593);
    			attr_dev(rect16, "class", "leg4 svelte-hz54gq");
    			attr_dev(rect16, "x", "374");
    			attr_dev(rect16, "y", "102");
    			attr_dev(rect16, "width", "29");
    			attr_dev(rect16, "height", "12");
    			add_location(rect16, file$9, 469, 24, 16670);
    			attr_dev(rect17, "class", "leg5 svelte-hz54gq");
    			attr_dev(rect17, "x", "76");
    			attr_dev(rect17, "y", "31");
    			attr_dev(rect17, "width", "29");
    			attr_dev(rect17, "height", "24");
    			add_location(rect17, file$9, 471, 24, 16787);
    			attr_dev(path1, "class", "axis svelte-hz54gq");
    			attr_dev(path1, "d", "M 34 162 L 408 162 M 35 162 L 35 167 M 72 162 L 72 167 M 109 162 L 109 167 M 147 162 L 147 167 M 184 162 L 184 167 M 221 162 L 221 167 M 258 162 L 258 167 M 295 162 L 295 167 M 333 162 L 333 167 M 370 162 L 370 167 M 407 162 L 407 167");
    			add_location(path1, file$9, 474, 24, 16954);
    			attr_dev(path2, "class", "axis svelte-hz54gq");
    			attr_dev(path2, "d", "M 35 162 L 35 19 M 35 162 L 30 162 M 35 138 L 30 138 M 35 114 L 30 114 M 35 91 L 30 91 M 35 67 L 30 67 M 35 43 L 30 43 M 35 19 L 30 19");
    			add_location(path2, file$9, 476, 24, 17296);
    			attr_dev(tspan0, "x", "41.95");
    			attr_dev(tspan0, "y", "180");
    			attr_dev(tspan0, "dy", "0");
    			add_location(tspan0, file$9, 478, 59, 17522);
    			attr_dev(tspan1, "x", "45.38");
    			attr_dev(tspan1, "y", "180");
    			attr_dev(tspan1, "dy", "12.5");
    			add_location(tspan1, file$9, 478, 104, 17567);
    			attr_dev(text0, "x", "40.1");
    			attr_dev(text0, "y", "170");
    			attr_dev(text0, "opacity", "1");
    			attr_dev(text0, "class", "svelte-hz54gq");
    			add_location(text0, file$9, 478, 24, 17487);
    			attr_dev(tspan2, "x", "376.75");
    			attr_dev(tspan2, "y", "180");
    			attr_dev(tspan2, "dy", "0");
    			add_location(tspan2, file$9, 479, 60, 17682);
    			attr_dev(tspan3, "x", "380.18");
    			attr_dev(tspan3, "y", "180");
    			attr_dev(tspan3, "dy", "12.5");
    			add_location(tspan3, file$9, 479, 106, 17728);
    			attr_dev(text1, "x", "374.9");
    			attr_dev(text1, "y", "170");
    			attr_dev(text1, "opacity", "1");
    			attr_dev(text1, "class", "svelte-hz54gq");
    			add_location(text1, file$9, 479, 24, 17646);
    			attr_dev(tspan4, "x", "79.15");
    			attr_dev(tspan4, "y", "180");
    			attr_dev(tspan4, "dy", "0");
    			add_location(tspan4, file$9, 480, 59, 17843);
    			attr_dev(tspan5, "x", "82.58");
    			attr_dev(tspan5, "y", "180");
    			attr_dev(tspan5, "dy", "12.5");
    			add_location(tspan5, file$9, 480, 104, 17888);
    			attr_dev(text2, "x", "77.3");
    			attr_dev(text2, "y", "170");
    			attr_dev(text2, "opacity", "1");
    			attr_dev(text2, "class", "svelte-hz54gq");
    			add_location(text2, file$9, 480, 24, 17808);
    			attr_dev(tspan6, "x", "116.35");
    			attr_dev(tspan6, "y", "180");
    			attr_dev(tspan6, "dy", "0");
    			add_location(tspan6, file$9, 481, 60, 18003);
    			attr_dev(tspan7, "x", "119.78");
    			attr_dev(tspan7, "y", "180");
    			attr_dev(tspan7, "dy", "12.5");
    			add_location(tspan7, file$9, 481, 106, 18049);
    			attr_dev(text3, "x", "114.5");
    			attr_dev(text3, "y", "170");
    			attr_dev(text3, "opacity", "1");
    			attr_dev(text3, "class", "svelte-hz54gq");
    			add_location(text3, file$9, 481, 24, 17967);
    			attr_dev(tspan8, "x", "153.55");
    			attr_dev(tspan8, "y", "180");
    			attr_dev(tspan8, "dy", "0");
    			add_location(tspan8, file$9, 482, 60, 18165);
    			attr_dev(tspan9, "x", "156.98");
    			attr_dev(tspan9, "y", "180");
    			attr_dev(tspan9, "dy", "12.5");
    			add_location(tspan9, file$9, 482, 106, 18211);
    			attr_dev(text4, "x", "151.7");
    			attr_dev(text4, "y", "170");
    			attr_dev(text4, "opacity", "1");
    			attr_dev(text4, "class", "svelte-hz54gq");
    			add_location(text4, file$9, 482, 24, 18129);
    			attr_dev(tspan10, "x", "190.75");
    			attr_dev(tspan10, "y", "180");
    			attr_dev(tspan10, "dy", "0");
    			add_location(tspan10, file$9, 483, 60, 18327);
    			attr_dev(tspan11, "x", "194.18");
    			attr_dev(tspan11, "y", "180");
    			attr_dev(tspan11, "dy", "12.5");
    			add_location(tspan11, file$9, 483, 106, 18373);
    			attr_dev(text5, "x", "188.9");
    			attr_dev(text5, "y", "170");
    			attr_dev(text5, "opacity", "1");
    			attr_dev(text5, "class", "svelte-hz54gq");
    			add_location(text5, file$9, 483, 24, 18291);
    			attr_dev(tspan12, "x", "227.95");
    			attr_dev(tspan12, "y", "180");
    			attr_dev(tspan12, "dy", "0");
    			add_location(tspan12, file$9, 484, 60, 18489);
    			attr_dev(tspan13, "x", "231.38");
    			attr_dev(tspan13, "y", "180");
    			attr_dev(tspan13, "dy", "12.5");
    			add_location(tspan13, file$9, 484, 106, 18535);
    			attr_dev(text6, "x", "226.1");
    			attr_dev(text6, "y", "170");
    			attr_dev(text6, "opacity", "1");
    			attr_dev(text6, "class", "svelte-hz54gq");
    			add_location(text6, file$9, 484, 24, 18453);
    			attr_dev(tspan14, "x", "265.15");
    			attr_dev(tspan14, "y", "180");
    			attr_dev(tspan14, "dy", "0");
    			add_location(tspan14, file$9, 485, 60, 18651);
    			attr_dev(tspan15, "x", "268.58");
    			attr_dev(tspan15, "y", "180");
    			attr_dev(tspan15, "dy", "12.5");
    			add_location(tspan15, file$9, 485, 106, 18697);
    			attr_dev(text7, "x", "263.3");
    			attr_dev(text7, "y", "170");
    			attr_dev(text7, "opacity", "1");
    			attr_dev(text7, "class", "svelte-hz54gq");
    			add_location(text7, file$9, 485, 24, 18615);
    			attr_dev(tspan16, "x", "302.35");
    			attr_dev(tspan16, "y", "180");
    			attr_dev(tspan16, "dy", "0");
    			add_location(tspan16, file$9, 486, 60, 18813);
    			attr_dev(tspan17, "x", "305.78");
    			attr_dev(tspan17, "y", "180");
    			attr_dev(tspan17, "dy", "12.5");
    			add_location(tspan17, file$9, 486, 106, 18859);
    			attr_dev(text8, "x", "300.5");
    			attr_dev(text8, "y", "170");
    			attr_dev(text8, "opacity", "1");
    			attr_dev(text8, "class", "svelte-hz54gq");
    			add_location(text8, file$9, 486, 24, 18777);
    			attr_dev(tspan18, "x", "339.55");
    			attr_dev(tspan18, "y", "180");
    			attr_dev(tspan18, "dy", "0");
    			add_location(tspan18, file$9, 487, 60, 18975);
    			attr_dev(tspan19, "x", "342.98");
    			attr_dev(tspan19, "y", "180");
    			attr_dev(tspan19, "dy", "12.5");
    			add_location(tspan19, file$9, 487, 106, 19021);
    			attr_dev(text9, "x", "337.7");
    			attr_dev(text9, "y", "170");
    			attr_dev(text9, "opacity", "1");
    			attr_dev(text9, "class", "svelte-hz54gq");
    			add_location(text9, file$9, 487, 24, 18939);
    			attr_dev(tspan20, "x", "21.41");
    			attr_dev(tspan20, "y", "167.2");
    			attr_dev(tspan20, "dy", "0");
    			add_location(tspan20, file$9, 488, 62, 19139);
    			attr_dev(text10, "x", "21.41");
    			attr_dev(text10, "y", "155.2");
    			attr_dev(text10, "opacity", "1");
    			attr_dev(text10, "class", "svelte-hz54gq");
    			add_location(text10, file$9, 488, 24, 19101);
    			attr_dev(tspan21, "x", "13.81");
    			attr_dev(tspan21, "y", "24.2");
    			attr_dev(tspan21, "dy", "0");
    			add_location(tspan21, file$9, 489, 61, 19251);
    			attr_dev(text11, "x", "13.81");
    			attr_dev(text11, "y", "12.2");
    			attr_dev(text11, "opacity", "1");
    			attr_dev(text11, "class", "svelte-hz54gq");
    			add_location(text11, file$9, 489, 24, 19214);
    			attr_dev(tspan22, "x", "21.41");
    			attr_dev(tspan22, "y", "143.37");
    			attr_dev(tspan22, "dy", "0");
    			add_location(tspan22, file$9, 490, 63, 19365);
    			attr_dev(text12, "x", "21.41");
    			attr_dev(text12, "y", "131.37");
    			attr_dev(text12, "opacity", "1");
    			attr_dev(text12, "class", "svelte-hz54gq");
    			add_location(text12, file$9, 490, 24, 19326);
    			attr_dev(tspan23, "x", "21.41");
    			attr_dev(tspan23, "y", "119.54");
    			attr_dev(tspan23, "dy", "0");
    			add_location(tspan23, file$9, 491, 63, 19480);
    			attr_dev(text13, "x", "21.41");
    			attr_dev(text13, "y", "107.54");
    			attr_dev(text13, "opacity", "1");
    			attr_dev(text13, "class", "svelte-hz54gq");
    			add_location(text13, file$9, 491, 24, 19441);
    			attr_dev(tspan24, "x", "21.41");
    			attr_dev(tspan24, "y", "95.7");
    			attr_dev(tspan24, "dy", "0");
    			add_location(tspan24, file$9, 492, 61, 19593);
    			attr_dev(text14, "x", "21.41");
    			attr_dev(text14, "y", "83.7");
    			attr_dev(text14, "opacity", "1");
    			attr_dev(text14, "class", "svelte-hz54gq");
    			add_location(text14, file$9, 492, 24, 19556);
    			attr_dev(tspan25, "x", "21.41");
    			attr_dev(tspan25, "y", "71.87");
    			attr_dev(tspan25, "dy", "0");
    			add_location(tspan25, file$9, 493, 62, 19705);
    			attr_dev(text15, "x", "21.41");
    			attr_dev(text15, "y", "59.87");
    			attr_dev(text15, "opacity", "1");
    			attr_dev(text15, "class", "svelte-hz54gq");
    			add_location(text15, file$9, 493, 24, 19667);
    			attr_dev(tspan26, "x", "13.81");
    			attr_dev(tspan26, "y", "48.04");
    			attr_dev(tspan26, "dy", "0");
    			add_location(tspan26, file$9, 494, 62, 19818);
    			attr_dev(text16, "x", "13.81");
    			attr_dev(text16, "y", "36.04");
    			attr_dev(text16, "opacity", "1");
    			attr_dev(text16, "class", "svelte-hz54gq");
    			add_location(text16, file$9, 494, 24, 19780);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "class", "demo_graph svelte-hz54gq");
    			attr_dev(svg, "viewBox", "0 0 428 203");
    			attr_dev(svg, "width", "90%");
    			attr_dev(svg, "display", "block");
    			add_location(svg, file$9, 443, 20, 14873);
    			attr_dev(div23, "class", "card-body");
    			add_location(div23, file$9, 442, 16, 14829);
    			attr_dev(div24, "class", "card card-32");
    			add_location(div24, file$9, 440, 12, 14611);
    			attr_dev(div25, "class", "col12 col-md-6");
    			add_location(div25, file$9, 439, 8, 14570);
    			attr_dev(div26, "class", "row");
    			add_location(div26, file$9, 401, 4, 12585);
    			attr_dev(a5, "href", "/");
    			attr_dev(a5, "class", "i-pin i-20 btn-right");
    			add_location(a5, file$9, 505, 16, 20104);
    			attr_dev(a6, "href", "/");
    			attr_dev(a6, "class", "i-settings i-20 btn-right");
    			add_location(a6, file$9, 506, 16, 20233);
    			add_location(h4, file$9, 504, 12, 20061);
    			add_location(tr, file$9, 511, 24, 20492);
    			add_location(thead, file$9, 510, 20, 20460);
    			add_location(tbody, file$9, 517, 20, 20880);
    			attr_dev(table, "class", "table");
    			add_location(table, file$9, 509, 16, 20418);
    			attr_dev(div27, "class", "pagination");
    			add_location(div27, file$9, 546, 48, 22206);
    			attr_dev(div28, "class", "pagination-wrapper");
    			add_location(div28, file$9, 546, 16, 22174);
    			attr_dev(div29, "class", "sticky-wrapper svelte-hz54gq");
    			add_location(div29, file$9, 508, 12, 20373);
    			attr_dev(div30, "class", "col12");
    			add_location(div30, file$9, 503, 8, 20029);
    			attr_dev(div31, "class", "row");
    			add_location(div31, file$9, 502, 4, 20003);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div26, anchor);
    			append_dev(div26, div21);
    			append_dev(div21, div20);
    			append_dev(div20, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div0);
    			append_dev(div0, t0);
    			append_dev(div0, a0);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div20, t3);
    			append_dev(div20, div9);
    			append_dev(div9, div8);
    			append_dev(div8, div5);
    			append_dev(div5, t4);
    			append_dev(div5, a1);
    			append_dev(div8, t5);
    			append_dev(div8, div7);
    			append_dev(div7, div6);
    			append_dev(div20, t7);
    			append_dev(div20, div14);
    			append_dev(div14, div13);
    			append_dev(div13, div10);
    			append_dev(div10, t8);
    			append_dev(div10, a2);
    			append_dev(div13, t9);
    			append_dev(div13, div12);
    			append_dev(div12, div11);
    			append_dev(div20, t11);
    			append_dev(div20, div19);
    			append_dev(div19, div18);
    			append_dev(div18, div15);
    			append_dev(div15, t12);
    			append_dev(div15, a3);
    			append_dev(div18, t13);
    			append_dev(div18, div17);
    			append_dev(div17, div16);
    			append_dev(div26, t15);
    			append_dev(div26, div25);
    			append_dev(div25, div24);
    			append_dev(div24, div22);
    			append_dev(div22, t16);
    			append_dev(div22, a4);
    			append_dev(div24, t17);
    			append_dev(div24, div23);
    			append_dev(div23, svg);
    			append_dev(svg, path0);
    			append_dev(svg, rect0);
    			append_dev(svg, rect1);
    			append_dev(svg, rect2);
    			append_dev(svg, rect3);
    			append_dev(svg, rect4);
    			append_dev(svg, rect5);
    			append_dev(svg, rect6);
    			append_dev(svg, rect7);
    			append_dev(svg, rect8);
    			append_dev(svg, rect9);
    			append_dev(svg, rect10);
    			append_dev(svg, rect11);
    			append_dev(svg, rect12);
    			append_dev(svg, rect13);
    			append_dev(svg, rect14);
    			append_dev(svg, rect15);
    			append_dev(svg, rect16);
    			append_dev(svg, rect17);
    			append_dev(svg, path1);
    			append_dev(svg, path2);
    			append_dev(svg, text0);
    			append_dev(text0, tspan0);
    			append_dev(tspan0, t18);
    			append_dev(text0, tspan1);
    			append_dev(tspan1, t19);
    			append_dev(svg, text1);
    			append_dev(text1, tspan2);
    			append_dev(tspan2, t20);
    			append_dev(text1, tspan3);
    			append_dev(tspan3, t21);
    			append_dev(svg, text2);
    			append_dev(text2, tspan4);
    			append_dev(tspan4, t22);
    			append_dev(text2, tspan5);
    			append_dev(tspan5, t23);
    			append_dev(svg, text3);
    			append_dev(text3, tspan6);
    			append_dev(tspan6, t24);
    			append_dev(text3, tspan7);
    			append_dev(tspan7, t25);
    			append_dev(svg, text4);
    			append_dev(text4, tspan8);
    			append_dev(tspan8, t26);
    			append_dev(text4, tspan9);
    			append_dev(tspan9, t27);
    			append_dev(svg, text5);
    			append_dev(text5, tspan10);
    			append_dev(tspan10, t28);
    			append_dev(text5, tspan11);
    			append_dev(tspan11, t29);
    			append_dev(svg, text6);
    			append_dev(text6, tspan12);
    			append_dev(tspan12, t30);
    			append_dev(text6, tspan13);
    			append_dev(tspan13, t31);
    			append_dev(svg, text7);
    			append_dev(text7, tspan14);
    			append_dev(tspan14, t32);
    			append_dev(text7, tspan15);
    			append_dev(tspan15, t33);
    			append_dev(svg, text8);
    			append_dev(text8, tspan16);
    			append_dev(tspan16, t34);
    			append_dev(text8, tspan17);
    			append_dev(tspan17, t35);
    			append_dev(svg, text9);
    			append_dev(text9, tspan18);
    			append_dev(tspan18, t36);
    			append_dev(text9, tspan19);
    			append_dev(tspan19, t37);
    			append_dev(svg, text10);
    			append_dev(text10, tspan20);
    			append_dev(tspan20, t38);
    			append_dev(svg, text11);
    			append_dev(text11, tspan21);
    			append_dev(tspan21, t39);
    			append_dev(svg, text12);
    			append_dev(text12, tspan22);
    			append_dev(tspan22, t40);
    			append_dev(svg, text13);
    			append_dev(text13, tspan23);
    			append_dev(tspan23, t41);
    			append_dev(svg, text14);
    			append_dev(text14, tspan24);
    			append_dev(tspan24, t42);
    			append_dev(svg, text15);
    			append_dev(text15, tspan25);
    			append_dev(tspan25, t43);
    			append_dev(svg, text16);
    			append_dev(text16, tspan26);
    			append_dev(tspan26, t44);
    			insert_dev(target, t45, anchor);
    			insert_dev(target, div31, anchor);
    			append_dev(div31, div30);
    			append_dev(div30, h4);
    			append_dev(h4, t46);
    			append_dev(h4, a5);
    			append_dev(h4, t47);
    			append_dev(h4, a6);
    			append_dev(div30, t48);
    			append_dev(div30, div29);
    			append_dev(div29, table);
    			append_dev(table, thead);
    			append_dev(thead, tr);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(tr, null);
    			}

    			append_dev(table, t49);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			append_dev(div29, t50);
    			append_dev(div29, div28);
    			append_dev(div28, div27);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(a0, "click", prevent_default(/*click_handler_3*/ ctx[24]), false, true, false),
    					listen_dev(a1, "click", prevent_default(/*click_handler_4*/ ctx[25]), false, true, false),
    					listen_dev(a2, "click", prevent_default(/*click_handler_5*/ ctx[26]), false, true, false),
    					listen_dev(a3, "click", prevent_default(/*click_handler_6*/ ctx[27]), false, true, false),
    					listen_dev(a4, "click", prevent_default(/*click_handler_7*/ ctx[28]), false, true, false),
    					listen_dev(a5, "click", prevent_default(/*click_handler_8*/ ctx[29]), false, true, false),
    					listen_dev(a6, "click", prevent_default(/*click_handler_9*/ ctx[30]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*selected_columns, sort_table*/ 1032) {
    				each_value_2 = Object.entries(/*selected_columns*/ ctx[3]);
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2$2(ctx, each_value_2, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_2$2(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(tr, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_2.length;
    			}

    			if (dirty[0] & /*selected_columns, components, table_data_sorted*/ 200) {
    				each_value = /*table_data_sorted*/ ctx[6];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div26);
    			if (detaching) detach_dev(t45);
    			if (detaching) detach_dev(div31);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(401:0) {#if tab == 'overview'}",
    		ctx
    	});

    	return block;
    }

    // (513:28) {#each Object.entries(selected_columns) as [k, th]}
    function create_each_block_2$2(ctx) {
    	let th;
    	let t_value = /*th*/ ctx[41].value + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler_10() {
    		return /*click_handler_10*/ ctx[31](/*th*/ ctx[41]);
    	}

    	const block = {
    		c: function create() {
    			th = element("th");
    			t = text(t_value);
    			toggle_class(th, "sortable", /*th*/ ctx[41].sortable);
    			toggle_class(th, "asc", /*th*/ ctx[41].sorted == "asc");
    			toggle_class(th, "desc", /*th*/ ctx[41].sorted == "desc");
    			add_location(th, file$9, 513, 32, 20609);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, t);

    			if (!mounted) {
    				dispose = listen_dev(th, "click", click_handler_10, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*selected_columns*/ 8 && t_value !== (t_value = /*th*/ ctx[41].value + "")) set_data_dev(t, t_value);

    			if (dirty[0] & /*selected_columns*/ 8) {
    				toggle_class(th, "sortable", /*th*/ ctx[41].sortable);
    			}

    			if (dirty[0] & /*selected_columns*/ 8) {
    				toggle_class(th, "asc", /*th*/ ctx[41].sorted == "asc");
    			}

    			if (dirty[0] & /*selected_columns*/ 8) {
    				toggle_class(th, "desc", /*th*/ ctx[41].sorted == "desc");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2$2.name,
    		type: "each",
    		source: "(513:28) {#each Object.entries(selected_columns) as [k, th]}",
    		ctx
    	});

    	return block;
    }

    // (525:40) {:else}
    function create_else_block$3(ctx) {
    	let t_value = /*row*/ ctx[37][/*th*/ ctx[41].key] + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*table_data_sorted, selected_columns*/ 72 && t_value !== (t_value = /*row*/ ctx[37][/*th*/ ctx[41].key] + "")) set_data_dev(t, t_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(525:40) {:else}",
    		ctx
    	});

    	return block;
    }

    // (523:40) {#if components[th.key]}
    function create_if_block_1$3(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*components*/ ctx[7][/*th*/ ctx[41].key];

    	function switch_props(ctx) {
    		return {
    			props: { obj: /*row*/ ctx[37][/*th*/ ctx[41].key] },
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};
    			if (dirty[0] & /*table_data_sorted, selected_columns*/ 72) switch_instance_changes.obj = /*row*/ ctx[37][/*th*/ ctx[41].key];

    			if (switch_value !== (switch_value = /*components*/ ctx[7][/*th*/ ctx[41].key])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(523:40) {#if components[th.key]}",
    		ctx
    	});

    	return block;
    }

    // (521:32) {#each Object.entries(selected_columns) as [k, th]}
    function create_each_block_1$3(ctx) {
    	let td;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block_1$3, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*components*/ ctx[7][/*th*/ ctx[41].key]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			td = element("td");
    			if_block.c();
    			add_location(td, file$9, 521, 36, 21098);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			if_blocks[current_block_type_index].m(td, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(td, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$3.name,
    		type: "each",
    		source: "(521:32) {#each Object.entries(selected_columns) as [k, th]}",
    		ctx
    	});

    	return block;
    }

    // (519:24) {#each table_data_sorted as row}
    function create_each_block$4(ctx) {
    	let tr;
    	let t;
    	let current;
    	let each_value_1 = Object.entries(/*selected_columns*/ ctx[3]);
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$3(get_each_context_1$3(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			tr = element("tr");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			add_location(tr, file$9, 519, 28, 20973);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}

    			append_dev(tr, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*components, selected_columns, table_data_sorted*/ 200) {
    				each_value_1 = Object.entries(/*selected_columns*/ ctx[3]);
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$3(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1$3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(tr, t);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(519:24) {#each table_data_sorted as row}",
    		ctx
    	});

    	return block;
    }

    // (557:0) <Pullout show_drawer={table_drawer} title="Table settings" on:close={table_cancel}>
    function create_default_slot_1$1(ctx) {
    	let form;
    	let t0;
    	let div;
    	let span0;
    	let t2;
    	let span1;
    	let current;
    	let mounted;
    	let dispose;

    	form = new Form({
    			props: {
    				f: /*table_settings_form*/ ctx[2],
    				channel: /*channel*/ ctx[8]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(form.$$.fragment);
    			t0 = space();
    			div = element("div");
    			span0 = element("span");
    			span0.textContent = "Save";
    			t2 = space();
    			span1 = element("span");
    			span1.textContent = "Cancel";
    			attr_dev(span0, "class", "btn");
    			add_location(span0, file$9, 559, 8, 22528);
    			attr_dev(span1, "class", "btn btn-secondary");
    			add_location(span1, file$9, 560, 8, 22599);
    			attr_dev(div, "class", "form-item");
    			add_location(div, file$9, 558, 4, 22496);
    		},
    		m: function mount(target, anchor) {
    			mount_component(form, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, span0);
    			append_dev(div, t2);
    			append_dev(div, span1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(span0, "click", /*save_table_settings*/ ctx[9], false, false, false),
    					listen_dev(span1, "click", /*table_cancel*/ ctx[11], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const form_changes = {};
    			if (dirty[0] & /*table_settings_form*/ 4) form_changes.f = /*table_settings_form*/ ctx[2];
    			form.$set(form_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(form.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(form.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(form, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(557:0) <Pullout show_drawer={table_drawer} title=\\\"Table settings\\\" on:close={table_cancel}>",
    		ctx
    	});

    	return block;
    }

    // (565:0) <Pullout show_drawer={pin_drawer} title={pin_title} on:close={pin_cancel}>
    function create_default_slot$1(ctx) {
    	let form;
    	let t0;
    	let span0;
    	let t2;
    	let span1;
    	let current;
    	let mounted;
    	let dispose;

    	form = new Form({
    			props: { f: /*pin_form*/ ctx[13] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(form.$$.fragment);
    			t0 = space();
    			span0 = element("span");
    			span0.textContent = "Pin";
    			t2 = space();
    			span1 = element("span");
    			span1.textContent = "Cancel";
    			attr_dev(span0, "class", "btn");
    			add_location(span0, file$9, 566, 4, 22804);
    			attr_dev(span1, "class", "btn btn-secondary");
    			add_location(span1, file$9, 568, 4, 22956);
    		},
    		m: function mount(target, anchor) {
    			mount_component(form, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, span0, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, span1, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(span0, "click", /*pin_save*/ ctx[15], false, false, false),
    					listen_dev(span1, "click", /*pin_cancel*/ ctx[16], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(form.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(form.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(form, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(span0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(span1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(565:0) <Pullout show_drawer={pin_drawer} title={pin_title} on:close={pin_cancel}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div2;
    	let div0;
    	let ul0;
    	let li0;
    	let a0;
    	let t1;
    	let li1;
    	let a1;
    	let t3;
    	let li2;
    	let t5;
    	let div1;
    	let a2;
    	let t7;
    	let h1;
    	let i;
    	let t8;
    	let t9;
    	let ul1;
    	let li3;
    	let a3;
    	let t11;
    	let li4;
    	let a4;
    	let t13;
    	let li5;
    	let a5;
    	let t15;
    	let li6;
    	let a6;
    	let t17;
    	let current_block_type_index;
    	let if_block;
    	let t18;
    	let pullout0;
    	let t19;
    	let pullout1;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block$5, create_if_block_2$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*tab*/ ctx[1] == "overview") return 0;
    		if (/*tab*/ ctx[1] == "summary") return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	pullout0 = new Pullout({
    			props: {
    				show_drawer: /*table_drawer*/ ctx[0],
    				title: "Table settings",
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	pullout0.$on("close", /*table_cancel*/ ctx[11]);

    	pullout1 = new Pullout({
    			props: {
    				show_drawer: /*pin_drawer*/ ctx[5],
    				title: /*pin_title*/ ctx[4],
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	pullout1.$on("close", /*pin_cancel*/ ctx[16]);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			ul0 = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			a0.textContent = "EcoOnline";
    			t1 = space();
    			li1 = element("li");
    			a1 = element("a");
    			a1.textContent = "EHS";
    			t3 = space();
    			li2 = element("li");
    			li2.textContent = "Incidents";
    			t5 = space();
    			div1 = element("div");
    			a2 = element("a");
    			a2.textContent = "New";
    			t7 = space();
    			h1 = element("h1");
    			i = element("i");
    			t8 = text("Incidents");
    			t9 = space();
    			ul1 = element("ul");
    			li3 = element("li");
    			a3 = element("a");
    			a3.textContent = "Overview";
    			t11 = space();
    			li4 = element("li");
    			a4 = element("a");
    			a4.textContent = "Query";
    			t13 = space();
    			li5 = element("li");
    			a5 = element("a");
    			a5.textContent = "Summary";
    			t15 = space();
    			li6 = element("li");
    			a6 = element("a");
    			a6.textContent = "Admin";
    			t17 = space();
    			if (if_block) if_block.c();
    			t18 = space();
    			create_component(pullout0.$$.fragment);
    			t19 = space();
    			create_component(pullout1.$$.fragment);
    			attr_dev(a0, "href", "#platform");
    			add_location(a0, file$9, 371, 16, 10821);
    			add_location(li0, file$9, 371, 12, 10817);
    			attr_dev(a1, "href", "#ehs");
    			add_location(a1, file$9, 372, 16, 10876);
    			add_location(li1, file$9, 372, 12, 10872);
    			add_location(li2, file$9, 373, 12, 10916);
    			attr_dev(ul0, "class", "breadcrumb");
    			add_location(ul0, file$9, 370, 8, 10781);
    			attr_dev(div0, "class", "col12 col-sm-5");
    			add_location(div0, file$9, 369, 4, 10744);
    			attr_dev(a2, "title", "New Incident");
    			attr_dev(a2, "href", "#ehs/incidents/incidents_new");
    			attr_dev(a2, "class", "btn");
    			add_location(a2, file$9, 383, 8, 11649);
    			attr_dev(div1, "class", "col12 col-sm-7 text-right");
    			add_location(div1, file$9, 376, 4, 10964);
    			attr_dev(div2, "class", "row sticky");
    			add_location(div2, file$9, 368, 0, 10715);
    			attr_dev(i, "class", "i-incidents i-32");
    			add_location(i, file$9, 391, 23, 12089);
    			attr_dev(h1, "class", "page-title");
    			add_location(h1, file$9, 391, 0, 12066);
    			attr_dev(a3, "href", "#ehs/incidents/overview");
    			toggle_class(a3, "active", /*tab*/ ctx[1] == "overview");
    			add_location(a3, file$9, 394, 8, 12163);
    			add_location(li3, file$9, 394, 4, 12159);
    			attr_dev(a4, "href", "#ehs/incidents/queries_new");
    			add_location(a4, file$9, 395, 8, 12300);
    			add_location(li4, file$9, 395, 4, 12296);
    			attr_dev(a5, "href", "#ehs/incidents/summary");
    			toggle_class(a5, "active", /*tab*/ ctx[1] == "summary");
    			add_location(a5, file$9, 396, 8, 12360);
    			add_location(li5, file$9, 396, 4, 12356);
    			attr_dev(a6, "href", "#ehs/incidents/incidents_admin");
    			add_location(a6, file$9, 397, 8, 12494);
    			add_location(li6, file$9, 397, 4, 12490);
    			attr_dev(ul1, "class", "tabs");
    			add_location(ul1, file$9, 393, 0, 12137);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, ul0);
    			append_dev(ul0, li0);
    			append_dev(li0, a0);
    			append_dev(ul0, t1);
    			append_dev(ul0, li1);
    			append_dev(li1, a1);
    			append_dev(ul0, t3);
    			append_dev(ul0, li2);
    			append_dev(div2, t5);
    			append_dev(div2, div1);
    			append_dev(div1, a2);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, h1, anchor);
    			append_dev(h1, i);
    			append_dev(h1, t8);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, ul1, anchor);
    			append_dev(ul1, li3);
    			append_dev(li3, a3);
    			append_dev(ul1, t11);
    			append_dev(ul1, li4);
    			append_dev(li4, a4);
    			append_dev(ul1, t13);
    			append_dev(ul1, li5);
    			append_dev(li5, a5);
    			append_dev(ul1, t15);
    			append_dev(ul1, li6);
    			append_dev(li6, a6);
    			insert_dev(target, t17, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, t18, anchor);
    			mount_component(pullout0, target, anchor);
    			insert_dev(target, t19, anchor);
    			mount_component(pullout1, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(a2, "click", /*click_handler*/ ctx[21], false, false, false),
    					listen_dev(a3, "click", /*click_handler_1*/ ctx[22], false, false, false),
    					listen_dev(a5, "click", /*click_handler_2*/ ctx[23], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*tab*/ 2) {
    				toggle_class(a3, "active", /*tab*/ ctx[1] == "overview");
    			}

    			if (dirty[0] & /*tab*/ 2) {
    				toggle_class(a5, "active", /*tab*/ ctx[1] == "summary");
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(t18.parentNode, t18);
    				} else {
    					if_block = null;
    				}
    			}

    			const pullout0_changes = {};
    			if (dirty[0] & /*table_drawer*/ 1) pullout0_changes.show_drawer = /*table_drawer*/ ctx[0];

    			if (dirty[0] & /*table_settings_form*/ 4 | dirty[1] & /*$$scope*/ 32768) {
    				pullout0_changes.$$scope = { dirty, ctx };
    			}

    			pullout0.$set(pullout0_changes);
    			const pullout1_changes = {};
    			if (dirty[0] & /*pin_drawer*/ 32) pullout1_changes.show_drawer = /*pin_drawer*/ ctx[5];
    			if (dirty[0] & /*pin_title*/ 16) pullout1_changes.title = /*pin_title*/ ctx[4];

    			if (dirty[1] & /*$$scope*/ 32768) {
    				pullout1_changes.$$scope = { dirty, ctx };
    			}

    			pullout1.$set(pullout1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(pullout0.$$.fragment, local);
    			transition_in(pullout1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(pullout0.$$.fragment, local);
    			transition_out(pullout1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(ul1);
    			if (detaching) detach_dev(t17);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(t18);
    			destroy_component(pullout0, detaching);
    			if (detaching) detach_dev(t19);
    			destroy_component(pullout1, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let table_data_sorted;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Frame_incidents", slots, []);

    	let components = {
    		"record_id": RecordID,
    		"status": Status,
    		"channel": Channel,
    		"created_date": Date_1
    	};

    	const dispatch = createEventDispatcher();
    	let tab = "overview";
    	let { tabnav = "" } = $$props;

    	let columns = [
    		{
    			"key": "section",
    			"value": "Common Fields",
    			"children": [
    				{
    					"key": "record_id",
    					"value": "Record ID",
    					"selectable": false,
    					"selected": true,
    					"pii": false,
    					"sortable": true,
    					"sorted": "desc"
    				},
    				{
    					"key": "channel",
    					"value": "Channel",
    					"selectable": true,
    					"selected": true,
    					"pii": false,
    					"sortable": true
    				},
    				{
    					"key": "created_date",
    					"value": "Date created on",
    					"selectable": true,
    					"selected": true,
    					"pii": false,
    					"sortable": true,
    					"sortable_type": "date"
    				},
    				{
    					"key": "created_by",
    					"value": "Creator",
    					"selectable": true,
    					"selected": true,
    					"pii": true,
    					"sortable": true
    				},
    				{
    					"key": "updated_date",
    					"value": "Date updated on",
    					"selectable": true,
    					"selected": false,
    					"pii": false,
    					"sortable": true,
    					"sortable_type": "date"
    				},
    				{
    					"key": "updated_by",
    					"value": "Updated by",
    					"selectable": true,
    					"selected": false,
    					"pii": true,
    					"sortable": true
    				},
    				{
    					"key": "status",
    					"value": "Status",
    					"selectable": true,
    					"selected": true,
    					"pii": false,
    					"sortable": true
    				},
    				{
    					"key": "group",
    					"value": "Group",
    					"selectable": true,
    					"selected": false,
    					"pii": false,
    					"sortable": true
    				},
    				{
    					"key": "division",
    					"value": "Division",
    					"selectable": true,
    					"selected": false,
    					"pii": false,
    					"sortable": true
    				},
    				{
    					"key": "sector",
    					"value": "Sector",
    					"selectable": true,
    					"selected": false,
    					"pii": false,
    					"sortable": true
    				}
    			]
    		},
    		{
    			"key": "section",
    			"value": "Report Event",
    			"children": [
    				{
    					"key": "site",
    					"value": "Site",
    					"selectable": true,
    					"selected": false,
    					"pii": false
    				},
    				{
    					"key": "primary_event_type",
    					"value": "Event",
    					"selectable": true,
    					"selected": true,
    					"pii": false
    				}
    			]
    		}
    	];

    	let edit_columns = [];
    	let table_settings_form = [];
    	let channel = "TABLE";
    	let sub = pubsub.subscribe(channel, read_answer);

    	function read_answer(msg, data) {
    		if (data.id == "table_settings_multi") {
    			edit_columns = data.options;
    		}
    	}

    	function save_table_settings() {
    		$$invalidate(18, columns = edit_columns);
    		$$invalidate(2, table_settings_form[0].options = edit_columns, table_settings_form);
    		table_cancel();
    	} /*
    table_settings_form.options = columns;
    table_settings_form = table_settings_form;
    */

    	let selected_columns = [];

    	let table_data = [
    		{
    			"created_date": "2022-01-22T13:08:10.430Z",
    			"created_by": "Mike Wazowski",
    			"updated_date": "2022-01-24T3:48:19.430Z",
    			"updated_by": "Mike Wazowski",
    			"group": "Ireland",
    			"division": "Cork",
    			"sector": "Plumbing",
    			"record_id": 485,
    			"channel": "rapid",
    			"primary_event_type": "Near miss",
    			"date_time": "2022-01-24T03:48:19.430Z",
    			"time_relative": "9hr 42min",
    			"location": "Main Office",
    			"custom_field_shift": "Yellow Shift",
    			"open_actions": 0,
    			"total_actions": 2,
    			"open_total_actions": "0/2",
    			"status": "in_progress"
    		},
    		{
    			"created_date": "2022-01-22T03:48:19.430Z",
    			"created_by": "James P Sullivan",
    			"updated_date": "2022-01-24T3:48:19.430Z",
    			"updated_by": "Fungus",
    			"group": "Ireland",
    			"division": "Cork",
    			"sector": "Plumbing",
    			"record_id": 484,
    			"channel": "eco",
    			"primary_event_type": "Accident",
    			"date_time": "2022-01-24T3:48:19.430Z",
    			"time_relative": "9hr 42min",
    			"location": "Main Office",
    			"custom_field_shift": "Red Shift",
    			"open_actions": 0,
    			"total_actions": 2,
    			"open_total_actions": "0/2",
    			"status": "awaiting_triage"
    		},
    		{
    			"created_date": "2022-01-22T18:56:19.430Z",
    			"created_by": "Boo",
    			"updated_date": "2022-01-24T3:48:19.430Z",
    			"updated_by": "Fungus",
    			"group": "Ireland",
    			"division": "Cork",
    			"sector": "Plumbing",
    			"record_id": 486,
    			"channel": "rapid",
    			"primary_event_type": "Accident",
    			"date_time": "2022-01-24T3:48:19.430Z",
    			"time_relative": "9hr 42min",
    			"location": "Main Office",
    			"custom_field_shift": "Blue Shift",
    			"open_actions": 0,
    			"total_actions": 2,
    			"open_total_actions": "0/2",
    			"status": "awaiting_investigation"
    		}
    	];

    	function sort_table(th) {
    		if (!th.sortable) {
    			console.log("cant sort this column");
    			return false;
    		}

    		let new_sort_dir = th.sorted == "desc" ? "asc" : "desc";
    		let new_sort_key = th.key;

    		//remove old key
    		let c = selected_columns[sort_key];

    		if (c) {
    			delete c.sorted;
    		}

    		//update new
    		th.sorted = new_sort_dir;

    		$$invalidate(20, sort_dir = new_sort_dir);
    		$$invalidate(19, sort_key = new_sort_key);
    		$$invalidate(18, columns);
    	}

    	let sort_key = "record_id";
    	let sort_dir = "desc";
    	let table_drawer = false;

    	function table_cancel() {
    		$$invalidate(0, table_drawer = false);
    	}

    	function nav(str) {
    		dispatch("nav", { text: str });
    	}

    	let pin_title = "Pin module";
    	let pin_drawer = false;

    	let pin_form = [
    		{
    			item_type: "input_select",
    			id: "pin_module_dashboard",
    			label: "Select a dashboard to pin it to",
    			options: [
    				{ "value": 1, "text": "Dashboard 1" },
    				{ "value": 2, "text": "Dashboard 2" },
    				{ "value": 3, "text": "Dashboard 3" },
    				{ "value": 4, "text": "Dashboard 4" },
    				{ "value": 5, "text": "Dashboard 5" }
    			],
    			answer: ""
    		},
    		{
    			item_type: "input_checkbox",
    			id: "pin_module_navigate",
    			options: [
    				{
    					"value": false,
    					"text": "Open the dashboard after you pin it?"
    				}
    			],
    			answer: ""
    		}
    	];

    	function pin_module(title) {
    		$$invalidate(4, pin_title = "Pin " + title);
    		$$invalidate(5, pin_drawer = true);
    	}

    	function pin_save() {
    		$$invalidate(5, pin_drawer = false);

    		if (pin_form[1].options[0].value) {
    			alert("Pinned");
    			window.location.hash = "#ehs/dashboards";
    		} else {
    			alert("Pinned");
    		}
    	}

    	function pin_cancel() {
    		$$invalidate(5, pin_drawer = false);
    	}

    	const writable_props = ["tabnav"];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$4.warn(`<Frame_incidents> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		nav("incidents_new");
    	};

    	const click_handler_1 = () => {
    		$$invalidate(1, tab = "overview");
    	};

    	const click_handler_2 = () => {
    		$$invalidate(1, tab = "summary");
    	};

    	const click_handler_3 = () => {
    		pin_module("Open Events");
    	};

    	const click_handler_4 = () => {
    		pin_module("Awaiting investigation");
    	};

    	const click_handler_5 = () => {
    		pin_module("Awaiting Signoff");
    	};

    	const click_handler_6 = () => {
    		pin_module("High Potential Severity");
    	};

    	const click_handler_7 = () => {
    		pin_module("Events by Type");
    	};

    	const click_handler_8 = () => {
    		pin_module("Latest Events");
    	};

    	const click_handler_9 = () => {
    		$$invalidate(0, table_drawer = true);
    	};

    	const click_handler_10 = th => {
    		sort_table(th);
    	};

    	$$self.$$set = $$props => {
    		if ("tabnav" in $$props) $$invalidate(17, tabnav = $$props.tabnav);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		PubSub: pubsub,
    		Pullout,
    		Form,
    		RecordID,
    		Status,
    		Channel,
    		DateComp: Date_1,
    		components,
    		dispatch,
    		tab,
    		tabnav,
    		columns,
    		edit_columns,
    		table_settings_form,
    		channel,
    		sub,
    		read_answer,
    		save_table_settings,
    		selected_columns,
    		table_data,
    		sort_table,
    		sort_key,
    		sort_dir,
    		table_drawer,
    		table_cancel,
    		nav,
    		pin_title,
    		pin_drawer,
    		pin_form,
    		pin_module,
    		pin_save,
    		pin_cancel,
    		table_data_sorted
    	});

    	$$self.$inject_state = $$props => {
    		if ("components" in $$props) $$invalidate(7, components = $$props.components);
    		if ("tab" in $$props) $$invalidate(1, tab = $$props.tab);
    		if ("tabnav" in $$props) $$invalidate(17, tabnav = $$props.tabnav);
    		if ("columns" in $$props) $$invalidate(18, columns = $$props.columns);
    		if ("edit_columns" in $$props) edit_columns = $$props.edit_columns;
    		if ("table_settings_form" in $$props) $$invalidate(2, table_settings_form = $$props.table_settings_form);
    		if ("channel" in $$props) $$invalidate(8, channel = $$props.channel);
    		if ("sub" in $$props) sub = $$props.sub;
    		if ("selected_columns" in $$props) $$invalidate(3, selected_columns = $$props.selected_columns);
    		if ("table_data" in $$props) $$invalidate(36, table_data = $$props.table_data);
    		if ("sort_key" in $$props) $$invalidate(19, sort_key = $$props.sort_key);
    		if ("sort_dir" in $$props) $$invalidate(20, sort_dir = $$props.sort_dir);
    		if ("table_drawer" in $$props) $$invalidate(0, table_drawer = $$props.table_drawer);
    		if ("pin_title" in $$props) $$invalidate(4, pin_title = $$props.pin_title);
    		if ("pin_drawer" in $$props) $$invalidate(5, pin_drawer = $$props.pin_drawer);
    		if ("pin_form" in $$props) $$invalidate(13, pin_form = $$props.pin_form);
    		if ("table_data_sorted" in $$props) $$invalidate(6, table_data_sorted = $$props.table_data_sorted);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*tabnav*/ 131072) {
    			{
    				let t = tabnav;

    				if (tabnav !== "") {
    					$$invalidate(1, tab = t);
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*columns*/ 262144) {
    			{
    				let temp_sel = {};
    				let c = columns;

    				c.forEach(group => {
    					group.children.forEach(col => {
    						if (col.selected == true) {
    							temp_sel[col.key] = col;
    						}
    					});
    				});

    				$$invalidate(3, selected_columns = temp_sel);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*sort_key, sort_dir*/ 1572864) {
    			$$invalidate(6, table_data_sorted = table_data.sort((a, b) => {
    				let A = (a[sort_key] + "").toLowerCase();
    				let B = (b[sort_key] + "").toLowerCase();

    				if (sort_dir == "desc") {
    					return A < B ? 1 : -1;
    				} else {
    					return A > B ? 1 : -1;
    				}
    			}));
    		}

    		if ($$self.$$.dirty[0] & /*table_drawer, columns*/ 262145) {
    			{
    				let s = table_drawer;

    				if (s) {
    					$$invalidate(2, table_settings_form = [
    						{
    							item_type: "input_multi",
    							id: "table_settings_multi",
    							label: "Columns to show",
    							hint: "All users will see these changes. Any that contain personally identifiable information will be redacted if the user doesn't have permission.",
    							max_warning: {
    								value: 10,
    								message: "If you have too many columns this page may become unresponsive for all users. You can always pin this table to your own dashboard to customize further."
    							},
    							options: JSON.parse(JSON.stringify(columns)),
    							answer: ""
    						}
    					]);
    				}
    			}
    		}
    	};

    	return [
    		table_drawer,
    		tab,
    		table_settings_form,
    		selected_columns,
    		pin_title,
    		pin_drawer,
    		table_data_sorted,
    		components,
    		channel,
    		save_table_settings,
    		sort_table,
    		table_cancel,
    		nav,
    		pin_form,
    		pin_module,
    		pin_save,
    		pin_cancel,
    		tabnav,
    		columns,
    		sort_key,
    		sort_dir,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5,
    		click_handler_6,
    		click_handler_7,
    		click_handler_8,
    		click_handler_9,
    		click_handler_10
    	];
    }

    class Frame_incidents extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { tabnav: 17 }, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Frame_incidents",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get tabnav() {
    		throw new Error("<Frame_incidents>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tabnav(value) {
    		throw new Error("<Frame_incidents>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
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

    function hslide(node, {
    	delay = 0,
    	duration = 120,
    	easing = cubicOut
    })  {
    	const style = getComputedStyle(node);
    	const opacity = +style.opacity;
    	const width = parseFloat(style.width);
    	const padding_left = parseFloat(style.paddingLeft);
    	const padding_right = parseFloat(style.paddingRight);
    	const margin_left = parseFloat(style.marginLeft);
    	const margin_right = parseFloat(style.marginRight);
    	const border_left_width = parseFloat(style.borderLeftWidth);
    	const border_right_width = parseFloat(style.borderRightWidth);

    	return {
    		delay,
    		duration,
    		easing,
    		css: t =>
    			`overflow: hidden;` +
    			`opacity: ${Math.min(t * 20, 1) * opacity};` +
    			`width: ${t * width}px;` +
    			`padding-left: ${t * padding_left}px;` +
    			`padding-right: ${t * padding_right}px;` +
    			`margin-left: ${t * margin_left}px;` +
    			`margin-right: ${t * margin_right}px;` +
    			`border-left-width: ${t * border_left_width}px;` +
    			`border-right-width: ${t * border_right_width}px;`
    	};
    }

    /* src/components/Slide.svelte generated by Svelte v3.35.0 */
    const file$8 = "src/components/Slide.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	child_ctx[13] = i;
    	return child_ctx;
    }

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	child_ctx[15] = i;
    	return child_ctx;
    }

    // (52:4) {#if id === cur}
    function create_if_block$4(ctx) {
    	let div;
    	let div_intro;
    	let div_outro;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			set_style(div, "background-image", "url(" + /*slide*/ ctx[11].img + ")");
    			attr_dev(div, "class", "slide svelte-jf2rr6");
    			add_location(div, file$8, 52, 4, 1048);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, hslide, /*transition_args*/ ctx[3]);
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, hslide, /*transition_args*/ ctx[3]);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(52:4) {#if id === cur}",
    		ctx
    	});

    	return block;
    }

    // (51:3) {#each slides as slide, id}
    function create_each_block_1$2(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*id*/ ctx[15] === /*cur*/ ctx[0] && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*id*/ ctx[15] === /*cur*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*cur*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(51:3) {#each slides as slide, id}",
    		ctx
    	});

    	return block;
    }

    // (75:1) {#each slides as slide, i}
    function create_each_block$3(ctx) {
    	let button;
    	let t_value = /*i*/ ctx[13] + 1 + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler_2() {
    		return /*click_handler_2*/ ctx[9](/*i*/ ctx[13]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(t_value);
    			attr_dev(button, "class", "dot svelte-jf2rr6");
    			toggle_class(button, "selected", /*cur*/ ctx[0] == /*i*/ ctx[13]);
    			add_location(button, file$8, 75, 2, 1465);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler_2, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*cur*/ 1) {
    				toggle_class(button, "selected", /*cur*/ ctx[0] == /*i*/ ctx[13]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(75:1) {#each slides as slide, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let div3;
    	let div2;
    	let div1;
    	let t0;
    	let div0;
    	let button0;
    	let t2;
    	let button1;
    	let t4;
    	let div4;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*slides*/ ctx[1];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks_1[i], 1, 1, () => {
    		each_blocks_1[i] = null;
    	});

    	let each_value = /*slides*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t0 = space();
    			div0 = element("div");
    			button0 = element("button");
    			button0.textContent = "<";
    			t2 = space();
    			button1 = element("button");
    			button1.textContent = ">";
    			t4 = space();
    			div4 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(button0, "class", "svelte-jf2rr6");
    			add_location(button0, file$8, 62, 4, 1263);
    			attr_dev(button1, "class", "svelte-jf2rr6");
    			add_location(button1, file$8, 65, 4, 1324);
    			attr_dev(div0, "class", "controls svelte-jf2rr6");
    			add_location(div0, file$8, 61, 3, 1236);
    			attr_dev(div1, "class", "inner-wrapper svelte-jf2rr6");
    			add_location(div1, file$8, 49, 2, 964);
    			attr_dev(div2, "class", "outer-wrapper svelte-jf2rr6");
    			add_location(div2, file$8, 48, 1, 934);
    			attr_dev(div3, "class", "extra-outer-wrapper svelte-jf2rr6");
    			add_location(div3, file$8, 47, 0, 899);
    			attr_dev(div4, "class", "dots svelte-jf2rr6");
    			add_location(div4, file$8, 73, 0, 1416);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div1, null);
    			}

    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, button0);
    			append_dev(div0, t2);
    			append_dev(div0, button1);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div4, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div4, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "keyup", /*handleShortcut*/ ctx[6], false, false, false),
    					listen_dev(button0, "click", /*click_handler*/ ctx[7], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[8], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*slides, transition_args, cur*/ 11) {
    				each_value_1 = /*slides*/ ctx[1];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    						transition_in(each_blocks_1[i], 1);
    					} else {
    						each_blocks_1[i] = create_each_block_1$2(child_ctx);
    						each_blocks_1[i].c();
    						transition_in(each_blocks_1[i], 1);
    						each_blocks_1[i].m(div1, t0);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks_1.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*cur, changeSlide*/ 5) {
    				each_value = /*slides*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div4, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks_1 = each_blocks_1.filter(Boolean);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div4);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const ARROW_LEFT = 37;
    const ARROW_RIGHT = 39;

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Slide", slots, []);

    	let slides = [
    		{ img: "./images/trees/t2.jpeg" },
    		{ img: "./images/trees/t3.jpeg" },
    		{ img: "./images/trees/t4.jpeg" },
    		{ img: "./images/trees/t5.jpeg" },
    		{ img: "./images/trees/t7.jpeg" },
    		{ img: "./images/trees/t8.jpeg" }
    	];

    	let cur = 0;

    	function changeSlide(slide) {
    		$$invalidate(0, cur = slide);
    	}

    	const clamp = (number, min, max) => Math.min(Math.max(number, min), max);
    	const transition_args = { duration: 500 };

    	function prev(e) {
    		$$invalidate(0, cur = clamp($$invalidate(0, --cur), 0, slides.length - 1));
    	}

    	function next(e) {
    		$$invalidate(0, cur = clamp($$invalidate(0, ++cur), 0, slides.length - 1));
    	}

    	function handleShortcut(e) {
    		if (e.keyCode === ARROW_LEFT) {
    			prev();
    		}

    		if (e.keyCode === ARROW_RIGHT) {
    			next();
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Slide> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => prev();
    	const click_handler_1 = () => next();
    	const click_handler_2 = i => changeSlide(i);

    	$$self.$capture_state = () => ({
    		hslide,
    		slides,
    		cur,
    		changeSlide,
    		clamp,
    		transition_args,
    		prev,
    		next,
    		ARROW_LEFT,
    		ARROW_RIGHT,
    		handleShortcut
    	});

    	$$self.$inject_state = $$props => {
    		if ("slides" in $$props) $$invalidate(1, slides = $$props.slides);
    		if ("cur" in $$props) $$invalidate(0, cur = $$props.cur);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		cur,
    		slides,
    		changeSlide,
    		transition_args,
    		prev,
    		next,
    		handleShortcut,
    		click_handler,
    		click_handler_1,
    		click_handler_2
    	];
    }

    class Slide extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Slide",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/Frame_incidents_new.svelte generated by Svelte v3.35.0 */

    const { console: console_1$3 } = globals;
    const file$7 = "src/Frame_incidents_new.svelte";

    function get_each_context_5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[112] = list[i];
    	child_ctx[106] = i;
    	return child_ctx;
    }

    function get_each_context_6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[116] = list[i];
    	child_ctx[102] = i;
    	return child_ctx;
    }

    function get_each_context_7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[118] = list[i];
    	child_ctx[106] = i;
    	return child_ctx;
    }

    function get_each_context_8(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[116] = list[i];
    	child_ctx[102] = i;
    	return child_ctx;
    }

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[100] = list[i];
    	child_ctx[102] = i;
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[103] = list[i].text;
    	child_ctx[104] = list[i].color;
    	child_ctx[106] = i;
    	return child_ctx;
    }

    function get_each_context_2$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[107] = list[i];
    	child_ctx[106] = i;
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[109] = list[i].label;
    	child_ctx[110] = list[i].selected;
    	child_ctx[102] = i;
    	return child_ctx;
    }

    function get_each_context_4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[112] = list[i];
    	return child_ctx;
    }

    function get_each_context_9(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[121] = list[i];
    	return child_ctx;
    }

    // (699:12) {:else}
    function create_else_block_3(ctx) {
    	let a;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			attr_dev(a, "title", "View as a single page");
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "i-page-single i-24 svelte-1w3yzpq");
    			add_location(a, file$7, 699, 16, 25391);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", prevent_default(/*click_handler_4*/ ctx[42]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_3.name,
    		type: "else",
    		source: "(699:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (697:12) {#if single_page}
    function create_if_block_31(ctx) {
    	let a;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			attr_dev(a, "title", "View as tabs");
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "i-page-tabs i-24 svelte-1w3yzpq");
    			add_location(a, file$7, 697, 16, 25233);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", prevent_default(/*click_handler_3*/ ctx[41]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_31.name,
    		type: "if",
    		source: "(697:12) {#if single_page}",
    		ctx
    	});

    	return block;
    }

    // (720:20) {:else}
    function create_else_block_2(ctx) {
    	let a;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "i-chevron-down i-24");
    			set_style(a, "position", "absolute");
    			set_style(a, "top", "8px");
    			set_style(a, "right", "8px");
    			add_location(a, file$7, 720, 24, 26585);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", prevent_default(/*click_handler_7*/ ctx[45]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(720:20) {:else}",
    		ctx
    	});

    	return block;
    }

    // (718:20) {#if inspector_details}
    function create_if_block_30(ctx) {
    	let a;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "i-chevron-up i-24");
    			set_style(a, "position", "absolute");
    			set_style(a, "top", "8px");
    			set_style(a, "right", "8px");
    			add_location(a, file$7, 718, 24, 26379);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", prevent_default(/*click_handler_6*/ ctx[44]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_30.name,
    		type: "if",
    		source: "(718:20) {#if inspector_details}",
    		ctx
    	});

    	return block;
    }

    // (759:12) {:else}
    function create_else_block_1(ctx) {
    	let h40;
    	let t1;
    	let ul0;
    	let t2;
    	let li0;
    	let a0;
    	let t4;
    	let li1;
    	let a1;
    	let t6;
    	let h41;
    	let t8;
    	let ul1;
    	let li2;
    	let a2;
    	let t10;
    	let li3;
    	let a3;
    	let t12;
    	let li4;
    	let a4;
    	let t14;
    	let li5;
    	let a5;
    	let t16;
    	let li6;
    	let a6;
    	let mounted;
    	let dispose;
    	let if_block = /*incident*/ ctx[2].id && create_if_block_29(ctx);

    	const block = {
    		c: function create() {
    			h40 = element("h4");
    			h40.textContent = "Tabs";
    			t1 = space();
    			ul0 = element("ul");
    			if (if_block) if_block.c();
    			t2 = space();
    			li0 = element("li");
    			a0 = element("a");
    			a0.textContent = "Report";
    			t4 = space();
    			li1 = element("li");
    			a1 = element("a");
    			a1.textContent = "Events";
    			t6 = space();
    			h41 = element("h4");
    			h41.textContent = "Tools";
    			t8 = space();
    			ul1 = element("ul");
    			li2 = element("li");
    			a2 = element("a");
    			a2.textContent = "Witnesses";
    			t10 = space();
    			li3 = element("li");
    			a3 = element("a");
    			a3.textContent = "Vehicles";
    			t12 = space();
    			li4 = element("li");
    			a4 = element("a");
    			a4.textContent = "Attachments";
    			t14 = space();
    			li5 = element("li");
    			a5 = element("a");
    			a5.textContent = "Links & Actions";
    			t16 = space();
    			li6 = element("li");
    			a6 = element("a");
    			a6.textContent = "Claim";
    			add_location(h40, file$7, 759, 16, 29112);
    			attr_dev(a0, "href", "#ehs/incidents/incidents_new/report");
    			attr_dev(a0, "class", "svelte-1w3yzpq");
    			add_location(a0, file$7, 764, 57, 29480);
    			attr_dev(li0, "class", "svelte-1w3yzpq");
    			toggle_class(li0, "active", /*tab*/ ctx[6] == "report");
    			add_location(li0, file$7, 764, 20, 29443);
    			attr_dev(a1, "href", "#ehs/incidents/incidents_new/events");
    			attr_dev(a1, "class", "svelte-1w3yzpq");
    			add_location(a1, file$7, 765, 57, 29661);
    			attr_dev(li1, "class", "svelte-1w3yzpq");
    			toggle_class(li1, "active", /*tab*/ ctx[6] == "events");
    			add_location(li1, file$7, 765, 20, 29624);
    			attr_dev(ul0, "class", "side_menu svelte-1w3yzpq");
    			add_location(ul0, file$7, 760, 16, 29142);
    			add_location(h41, file$7, 767, 16, 29823);
    			attr_dev(a2, "href", "#ehs/incidents/incidents_new/witnesses");
    			attr_dev(a2, "class", "svelte-1w3yzpq");
    			add_location(a2, file$7, 769, 60, 29937);
    			attr_dev(li2, "class", "svelte-1w3yzpq");
    			toggle_class(li2, "active", /*tab*/ ctx[6] == "witnesses");
    			add_location(li2, file$7, 769, 20, 29897);
    			attr_dev(a3, "href", "#ehs/incidents/incidents_new/vehicles");
    			attr_dev(a3, "class", "svelte-1w3yzpq");
    			add_location(a3, file$7, 770, 59, 30125);
    			attr_dev(li3, "class", "svelte-1w3yzpq");
    			toggle_class(li3, "active", /*tab*/ ctx[6] == "vehicles");
    			add_location(li3, file$7, 770, 20, 30086);
    			attr_dev(a4, "href", "#ehs/incidents/incidents_new/attachments");
    			attr_dev(a4, "class", "svelte-1w3yzpq");
    			add_location(a4, file$7, 771, 62, 30317);
    			attr_dev(li4, "class", "svelte-1w3yzpq");
    			toggle_class(li4, "active", /*tab*/ ctx[6] == "attachments");
    			add_location(li4, file$7, 771, 20, 30275);
    			attr_dev(a5, "href", "#ehs/incidents/incidents_new/links");
    			attr_dev(a5, "class", "svelte-1w3yzpq");
    			add_location(a5, file$7, 772, 56, 30512);
    			attr_dev(li5, "class", "svelte-1w3yzpq");
    			toggle_class(li5, "active", /*tab*/ ctx[6] == "links");
    			add_location(li5, file$7, 772, 20, 30476);
    			attr_dev(a6, "href", "#ehs/incidents/incidents_new/claim");
    			attr_dev(a6, "class", "svelte-1w3yzpq");
    			add_location(a6, file$7, 773, 56, 30699);
    			attr_dev(li6, "class", "svelte-1w3yzpq");
    			toggle_class(li6, "active", /*tab*/ ctx[6] == "claim");
    			add_location(li6, file$7, 773, 20, 30663);
    			attr_dev(ul1, "class", "side_menu svelte-1w3yzpq");
    			add_location(ul1, file$7, 768, 16, 29854);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h40, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, ul0, anchor);
    			if (if_block) if_block.m(ul0, null);
    			append_dev(ul0, t2);
    			append_dev(ul0, li0);
    			append_dev(li0, a0);
    			append_dev(ul0, t4);
    			append_dev(ul0, li1);
    			append_dev(li1, a1);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, h41, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, ul1, anchor);
    			append_dev(ul1, li2);
    			append_dev(li2, a2);
    			append_dev(ul1, t10);
    			append_dev(ul1, li3);
    			append_dev(li3, a3);
    			append_dev(ul1, t12);
    			append_dev(ul1, li4);
    			append_dev(li4, a4);
    			append_dev(ul1, t14);
    			append_dev(ul1, li5);
    			append_dev(li5, a5);
    			append_dev(ul1, t16);
    			append_dev(ul1, li6);
    			append_dev(li6, a6);

    			if (!mounted) {
    				dispose = [
    					listen_dev(a0, "click", /*click_handler_17*/ ctx[55], false, false, false),
    					listen_dev(a1, "click", /*click_handler_18*/ ctx[56], false, false, false),
    					listen_dev(a2, "click", /*click_handler_19*/ ctx[57], false, false, false),
    					listen_dev(a3, "click", /*click_handler_20*/ ctx[58], false, false, false),
    					listen_dev(a4, "click", /*click_handler_21*/ ctx[59], false, false, false),
    					listen_dev(a5, "click", /*click_handler_22*/ ctx[60], false, false, false),
    					listen_dev(a6, "click", /*click_handler_23*/ ctx[61], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*incident*/ ctx[2].id) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_29(ctx);
    					if_block.c();
    					if_block.m(ul0, t2);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty[0] & /*tab*/ 64) {
    				toggle_class(li0, "active", /*tab*/ ctx[6] == "report");
    			}

    			if (dirty[0] & /*tab*/ 64) {
    				toggle_class(li1, "active", /*tab*/ ctx[6] == "events");
    			}

    			if (dirty[0] & /*tab*/ 64) {
    				toggle_class(li2, "active", /*tab*/ ctx[6] == "witnesses");
    			}

    			if (dirty[0] & /*tab*/ 64) {
    				toggle_class(li3, "active", /*tab*/ ctx[6] == "vehicles");
    			}

    			if (dirty[0] & /*tab*/ 64) {
    				toggle_class(li4, "active", /*tab*/ ctx[6] == "attachments");
    			}

    			if (dirty[0] & /*tab*/ 64) {
    				toggle_class(li5, "active", /*tab*/ ctx[6] == "links");
    			}

    			if (dirty[0] & /*tab*/ 64) {
    				toggle_class(li6, "active", /*tab*/ ctx[6] == "claim");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h40);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(ul0);
    			if (if_block) if_block.d();
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(h41);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(ul1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(759:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (743:12) {#if single_page}
    function create_if_block_27(ctx) {
    	let h4;
    	let t1;
    	let ul;
    	let t2;
    	let li0;
    	let a0;
    	let t4;
    	let li1;
    	let a1;
    	let t6;
    	let li2;
    	let a2;
    	let t8;
    	let li3;
    	let a3;
    	let t10;
    	let li4;
    	let a4;
    	let t12;
    	let li5;
    	let a5;
    	let t14;
    	let li6;
    	let a6;
    	let t16;
    	let li7;
    	let t18;
    	let li8;
    	let mounted;
    	let dispose;
    	let if_block = /*incident*/ ctx[2].id && create_if_block_28(ctx);

    	const block = {
    		c: function create() {
    			h4 = element("h4");
    			h4.textContent = "Contents";
    			t1 = space();
    			ul = element("ul");
    			if (if_block) if_block.c();
    			t2 = space();
    			li0 = element("li");
    			a0 = element("a");
    			a0.textContent = "Report";
    			t4 = space();
    			li1 = element("li");
    			a1 = element("a");
    			a1.textContent = "Events";
    			t6 = space();
    			li2 = element("li");
    			a2 = element("a");
    			a2.textContent = "Witnesses";
    			t8 = space();
    			li3 = element("li");
    			a3 = element("a");
    			a3.textContent = "Vehicles";
    			t10 = space();
    			li4 = element("li");
    			a4 = element("a");
    			a4.textContent = "Attachments";
    			t12 = space();
    			li5 = element("li");
    			a5 = element("a");
    			a5.textContent = "Links & Actions";
    			t14 = space();
    			li6 = element("li");
    			a6 = element("a");
    			a6.textContent = "Claim";
    			t16 = space();
    			li7 = element("li");
    			li7.textContent = "Submit";
    			t18 = space();
    			li8 = element("li");
    			add_location(h4, file$7, 743, 16, 27674);
    			attr_dev(a0, "href", "#ehs/incidents/incidents_new/report");
    			attr_dev(a0, "class", "svelte-1w3yzpq");
    			add_location(a0, file$7, 748, 24, 27977);
    			attr_dev(li0, "class", "svelte-1w3yzpq");
    			add_location(li0, file$7, 748, 20, 27973);
    			attr_dev(a1, "href", "#ehs/incidents/incidents_new/events");
    			attr_dev(a1, "class", "svelte-1w3yzpq");
    			add_location(a1, file$7, 749, 24, 28112);
    			attr_dev(li1, "class", "svelte-1w3yzpq");
    			add_location(li1, file$7, 749, 20, 28108);
    			attr_dev(a2, "href", "#ehs/incidents/incidents_new/witnesses");
    			attr_dev(a2, "class", "svelte-1w3yzpq");
    			add_location(a2, file$7, 750, 24, 28247);
    			attr_dev(li2, "class", "svelte-1w3yzpq");
    			add_location(li2, file$7, 750, 20, 28243);
    			attr_dev(a3, "href", "#ehs/incidents/incidents_new/vehicles");
    			attr_dev(a3, "class", "svelte-1w3yzpq");
    			add_location(a3, file$7, 751, 24, 28391);
    			attr_dev(li3, "class", "svelte-1w3yzpq");
    			add_location(li3, file$7, 751, 20, 28387);
    			attr_dev(a4, "href", "#ehs/incidents/incidents_new/attachments");
    			attr_dev(a4, "class", "svelte-1w3yzpq");
    			add_location(a4, file$7, 752, 24, 28532);
    			attr_dev(li4, "class", "svelte-1w3yzpq");
    			add_location(li4, file$7, 752, 20, 28528);
    			attr_dev(a5, "href", "#ehs/incidents/incidents_new/links");
    			attr_dev(a5, "class", "svelte-1w3yzpq");
    			add_location(a5, file$7, 753, 24, 28682);
    			attr_dev(li5, "class", "svelte-1w3yzpq");
    			add_location(li5, file$7, 753, 20, 28678);
    			attr_dev(a6, "href", "#ehs/incidents/incidents_new/claim");
    			attr_dev(a6, "class", "svelte-1w3yzpq");
    			add_location(a6, file$7, 754, 24, 28824);
    			attr_dev(li6, "class", "svelte-1w3yzpq");
    			add_location(li6, file$7, 754, 20, 28820);
    			attr_dev(li7, "class", "svelte-1w3yzpq");
    			add_location(li7, file$7, 755, 20, 28952);
    			attr_dev(li8, "class", "fake-bar active svelte-1w3yzpq");
    			set_style(li8, "height", /*closest_el*/ ctx[8].y + "px");
    			add_location(li8, file$7, 756, 20, 28988);
    			attr_dev(ul, "class", "side_menu single_page svelte-1w3yzpq");
    			add_location(ul, file$7, 744, 16, 27708);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h4, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, ul, anchor);
    			if (if_block) if_block.m(ul, null);
    			append_dev(ul, t2);
    			append_dev(ul, li0);
    			append_dev(li0, a0);
    			append_dev(ul, t4);
    			append_dev(ul, li1);
    			append_dev(li1, a1);
    			append_dev(ul, t6);
    			append_dev(ul, li2);
    			append_dev(li2, a2);
    			append_dev(ul, t8);
    			append_dev(ul, li3);
    			append_dev(li3, a3);
    			append_dev(ul, t10);
    			append_dev(ul, li4);
    			append_dev(li4, a4);
    			append_dev(ul, t12);
    			append_dev(ul, li5);
    			append_dev(li5, a5);
    			append_dev(ul, t14);
    			append_dev(ul, li6);
    			append_dev(li6, a6);
    			append_dev(ul, t16);
    			append_dev(ul, li7);
    			append_dev(ul, t18);
    			append_dev(ul, li8);

    			if (!mounted) {
    				dispose = [
    					listen_dev(a0, "click", /*click_handler_9*/ ctx[47], false, false, false),
    					listen_dev(a1, "click", /*click_handler_10*/ ctx[48], false, false, false),
    					listen_dev(a2, "click", /*click_handler_11*/ ctx[49], false, false, false),
    					listen_dev(a3, "click", /*click_handler_12*/ ctx[50], false, false, false),
    					listen_dev(a4, "click", /*click_handler_13*/ ctx[51], false, false, false),
    					listen_dev(a5, "click", /*click_handler_14*/ ctx[52], false, false, false),
    					listen_dev(a6, "click", /*click_handler_15*/ ctx[53], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*incident*/ ctx[2].id) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_28(ctx);
    					if_block.c();
    					if_block.m(ul, t2);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty[0] & /*closest_el*/ 256) {
    				set_style(li8, "height", /*closest_el*/ ctx[8].y + "px");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h4);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(ul);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_27.name,
    		type: "if",
    		source: "(743:12) {#if single_page}",
    		ctx
    	});

    	return block;
    }

    // (762:20) {#if incident.id }
    function create_if_block_29(ctx) {
    	let li;
    	let a;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			a.textContent = "Overview";
    			attr_dev(a, "href", "#ehs/incidents/incidents_new/overview");
    			attr_dev(a, "class", "svelte-1w3yzpq");
    			add_location(a, file$7, 762, 63, 29267);
    			attr_dev(li, "class", "svelte-1w3yzpq");
    			toggle_class(li, "active", /*tab*/ ctx[6] == "overview");
    			add_location(li, file$7, 762, 24, 29228);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*click_handler_16*/ ctx[54], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*tab*/ 64) {
    				toggle_class(li, "active", /*tab*/ ctx[6] == "overview");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_29.name,
    		type: "if",
    		source: "(762:20) {#if incident.id }",
    		ctx
    	});

    	return block;
    }

    // (746:20) {#if incident.id }
    function create_if_block_28(ctx) {
    	let li;
    	let a;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			a.textContent = "Overview";
    			attr_dev(a, "href", "#ehs/incidents/incidents_new/overview");
    			attr_dev(a, "class", "svelte-1w3yzpq");
    			add_location(a, file$7, 746, 28, 27810);
    			attr_dev(li, "class", "svelte-1w3yzpq");
    			add_location(li, file$7, 746, 24, 27806);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*click_handler_8*/ ctx[46], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_28.name,
    		type: "if",
    		source: "(746:20) {#if incident.id }",
    		ctx
    	});

    	return block;
    }

    // (780:8) {#if print_mode}
    function create_if_block_25(ctx) {
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let t2;
    	let br;
    	let t3;
    	let label0;
    	let input0;
    	let t4;
    	let t5;
    	let label1;
    	let input1;
    	let t6;
    	let t7;
    	let div2_intro;
    	let div2_outro;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_9 = /*vis_pages*/ ctx[9];
    	validate_each_argument(each_value_9);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_9.length; i += 1) {
    		each_blocks[i] = create_each_block_9(get_each_context_9(ctx, each_value_9, i));
    	}

    	let if_block = /*censor_mode*/ ctx[12] && create_if_block_26(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = "Print options";
    			t1 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			br = element("br");
    			t3 = space();
    			label0 = element("label");
    			input0 = element("input");
    			t4 = text(" Censor PII");
    			t5 = space();
    			label1 = element("label");
    			input1 = element("input");
    			t6 = text(" Custom Censor");
    			t7 = space();
    			if (if_block) if_block.c();
    			attr_dev(div0, "class", "card-header svelte-1w3yzpq");
    			add_location(div0, file$7, 781, 12, 31031);
    			add_location(br, file$7, 788, 16, 31356);
    			attr_dev(input0, "type", "checkbox");
    			add_location(input0, file$7, 789, 23, 31384);
    			attr_dev(label0, "class", "svelte-1w3yzpq");
    			add_location(label0, file$7, 789, 16, 31377);
    			attr_dev(input1, "type", "checkbox");
    			add_location(input1, file$7, 790, 23, 31478);
    			attr_dev(label1, "class", "svelte-1w3yzpq");
    			add_location(label1, file$7, 790, 16, 31471);
    			attr_dev(div1, "class", "card-body print-options svelte-1w3yzpq");
    			add_location(div1, file$7, 784, 12, 31118);
    			attr_dev(div2, "class", "card svelte-1w3yzpq");
    			add_location(div2, file$7, 780, 8, 30952);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(div1, t2);
    			append_dev(div1, br);
    			append_dev(div1, t3);
    			append_dev(div1, label0);
    			append_dev(label0, input0);
    			input0.checked = /*censor_pii*/ ctx[11];
    			append_dev(label0, t4);
    			append_dev(div1, t5);
    			append_dev(div1, label1);
    			append_dev(label1, input1);
    			input1.checked = /*censor_mode*/ ctx[12];
    			append_dev(label1, t6);
    			append_dev(div1, t7);
    			if (if_block) if_block.m(div1, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "change", /*input0_change_handler*/ ctx[64]),
    					listen_dev(input1, "change", /*input1_change_handler*/ ctx[65])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*vis_pages, print_options*/ 528) {
    				each_value_9 = /*vis_pages*/ ctx[9];
    				validate_each_argument(each_value_9);
    				let i;

    				for (i = 0; i < each_value_9.length; i += 1) {
    					const child_ctx = get_each_context_9(ctx, each_value_9, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_9(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, t2);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_9.length;
    			}

    			if (dirty[0] & /*censor_pii*/ 2048) {
    				input0.checked = /*censor_pii*/ ctx[11];
    			}

    			if (dirty[0] & /*censor_mode*/ 4096) {
    				input1.checked = /*censor_mode*/ ctx[12];
    			}

    			if (/*censor_mode*/ ctx[12]) {
    				if (if_block) ; else {
    					if_block = create_if_block_26(ctx);
    					if_block.c();
    					if_block.m(div1, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div2_outro) div2_outro.end(1);
    				if (!div2_intro) div2_intro = create_in_transition(div2, fly, { y: -200, duration: 1000 });
    				div2_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div2_intro) div2_intro.invalidate();
    			div2_outro = create_out_transition(div2, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
    			if (detaching && div2_outro) div2_outro.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_25.name,
    		type: "if",
    		source: "(780:8) {#if print_mode}",
    		ctx
    	});

    	return block;
    }

    // (786:16) {#each vis_pages as page}
    function create_each_block_9(ctx) {
    	let label;
    	let input;
    	let input_value_value;
    	let t0;
    	let t1_value = /*page*/ ctx[121].title + "";
    	let t1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			label = element("label");
    			input = element("input");
    			t0 = space();
    			t1 = text(t1_value);
    			attr_dev(input, "type", "checkbox");
    			input.__value = input_value_value = /*page*/ ctx[121].key;
    			input.value = input.__value;
    			/*$$binding_groups*/ ctx[63][0].push(input);
    			add_location(input, file$7, 786, 27, 31225);
    			attr_dev(label, "class", "svelte-1w3yzpq");
    			add_location(label, file$7, 786, 20, 31218);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, input);
    			input.checked = ~/*print_options*/ ctx[4].indexOf(input.__value);
    			append_dev(label, t0);
    			append_dev(label, t1);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[62]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*vis_pages*/ 512 && input_value_value !== (input_value_value = /*page*/ ctx[121].key)) {
    				prop_dev(input, "__value", input_value_value);
    				input.value = input.__value;
    			}

    			if (dirty[0] & /*print_options*/ 16) {
    				input.checked = ~/*print_options*/ ctx[4].indexOf(input.__value);
    			}

    			if (dirty[0] & /*vis_pages*/ 512 && t1_value !== (t1_value = /*page*/ ctx[121].title + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			/*$$binding_groups*/ ctx[63][0].splice(/*$$binding_groups*/ ctx[63][0].indexOf(input), 1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_9.name,
    		type: "each",
    		source: "(786:16) {#each vis_pages as page}",
    		ctx
    	});

    	return block;
    }

    // (792:16) {#if censor_mode}
    function create_if_block_26(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("select text and hit 'Return'");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_26.name,
    		type: "if",
    		source: "(792:16) {#if censor_mode}",
    		ctx
    	});

    	return block;
    }

    // (798:8) {#if filtered_pages.length == 0}
    function create_if_block_23(ctx) {
    	let if_block_anchor;

    	function select_block_type_3(ctx, dirty) {
    		if (/*print_mode*/ ctx[3]) return create_if_block_24;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type_3(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type_3(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_23.name,
    		type: "if",
    		source: "(798:8) {#if filtered_pages.length == 0}",
    		ctx
    	});

    	return block;
    }

    // (801:12) {:else}
    function create_else_block$2(ctx) {
    	let h1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Nothing to see here";
    			add_location(h1, file$7, 801, 16, 31869);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(801:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (799:12) {#if print_mode}
    function create_if_block_24(ctx) {
    	let h1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Printing nothing saves trees :)";
    			add_location(h1, file$7, 799, 16, 31792);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_24.name,
    		type: "if",
    		source: "(799:12) {#if print_mode}",
    		ctx
    	});

    	return block;
    }

    // (805:8) {#if filtered_pages.indexOf('overview') >= 0}
    function create_if_block_22(ctx) {
    	let h1;
    	let t1;
    	let div34;
    	let div2;
    	let div0;
    	let t3;
    	let div1;
    	let p0;
    	let t4_value = (/*incident*/ ctx[2].id ? /*incident*/ ctx[2].id : "New") + "";
    	let t4;
    	let t5;
    	let div5;
    	let div3;
    	let t7;
    	let div4;
    	let p1;
    	let t8_value = /*incident*/ ctx[2].status + "";
    	let t8;
    	let t9;
    	let div7;
    	let div6;
    	let table;
    	let tr0;
    	let td0;
    	let i0;
    	let t10;
    	let b0;
    	let t12;
    	let td1;
    	let t14;
    	let tr1;
    	let td2;
    	let i1;
    	let t15;
    	let b1;
    	let t17;
    	let td3;
    	let t19;
    	let tr2;
    	let td4;
    	let i2;
    	let t20;
    	let b2;
    	let t22;
    	let td5;
    	let t23_value = date_format(/*incident*/ ctx[2].updated_date) + "";
    	let t23;
    	let t24;
    	let p2;
    	let t25;
    	let div10;
    	let div8;
    	let t27;
    	let div9;
    	let p3;
    	let t29;
    	let div13;
    	let div11;
    	let t31;
    	let div12;
    	let p4;
    	let i3;
    	let t32;
    	let t33;
    	let div16;
    	let div14;
    	let t35;
    	let div15;
    	let p5;
    	let t37;
    	let div20;
    	let div17;
    	let t39;
    	let div19;
    	let div18;
    	let i4;
    	let t40;
    	let t41;
    	let div23;
    	let div21;
    	let t43;
    	let div22;
    	let i5;
    	let t44;
    	let div27;
    	let div24;
    	let t46;
    	let div26;
    	let div25;
    	let t48;
    	let div30;
    	let div28;
    	let t50;
    	let div29;
    	let p6;
    	let t51_value = /*incident*/ ctx[2].description + "";
    	let t51;
    	let t52;
    	let div33;
    	let div31;
    	let t54;
    	let div32;
    	let slide;
    	let current;
    	slide = new Slide({ $$inline: true });

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Overview";
    			t1 = space();
    			div34 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = "Record ID";
    			t3 = space();
    			div1 = element("div");
    			p0 = element("p");
    			t4 = text(t4_value);
    			t5 = space();
    			div5 = element("div");
    			div3 = element("div");
    			div3.textContent = "Status";
    			t7 = space();
    			div4 = element("div");
    			p1 = element("p");
    			t8 = text(t8_value);
    			t9 = space();
    			div7 = element("div");
    			div6 = element("div");
    			table = element("table");
    			tr0 = element("tr");
    			td0 = element("td");
    			i0 = element("i");
    			t10 = space();
    			b0 = element("b");
    			b0.textContent = "Event type";
    			t12 = space();
    			td1 = element("td");
    			td1.textContent = "Injury";
    			t14 = space();
    			tr1 = element("tr");
    			td2 = element("td");
    			i1 = element("i");
    			t15 = space();
    			b1 = element("b");
    			b1.textContent = "Location";
    			t17 = space();
    			td3 = element("td");
    			td3.textContent = "London tower";
    			t19 = space();
    			tr2 = element("tr");
    			td4 = element("td");
    			i2 = element("i");
    			t20 = space();
    			b2 = element("b");
    			b2.textContent = "Last update";
    			t22 = space();
    			td5 = element("td");
    			t23 = text(t23_value);
    			t24 = space();
    			p2 = element("p");
    			t25 = space();
    			div10 = element("div");
    			div8 = element("div");
    			div8.textContent = "Elapsed time";
    			t27 = space();
    			div9 = element("div");
    			p3 = element("p");
    			p3.textContent = "1 day, 3 hours";
    			t29 = space();
    			div13 = element("div");
    			div11 = element("div");
    			div11.textContent = "Channel";
    			t31 = space();
    			div12 = element("div");
    			p4 = element("p");
    			i3 = element("i");
    			t32 = text(" Desktop");
    			t33 = space();
    			div16 = element("div");
    			div14 = element("div");
    			div14.textContent = "Reported by";
    			t35 = space();
    			div15 = element("div");
    			p5 = element("p");
    			p5.textContent = "John Smith";
    			t37 = space();
    			div20 = element("div");
    			div17 = element("div");
    			div17.textContent = "Actions";
    			t39 = space();
    			div19 = element("div");
    			div18 = element("div");
    			i4 = element("i");
    			t40 = text("x0");
    			t41 = space();
    			div23 = element("div");
    			div21 = element("div");
    			div21.textContent = "Medical attention given";
    			t43 = space();
    			div22 = element("div");
    			i5 = element("i");
    			t44 = space();
    			div27 = element("div");
    			div24 = element("div");
    			div24.textContent = "All fields";
    			t46 = space();
    			div26 = element("div");
    			div25 = element("div");
    			div25.textContent = "10/21";
    			t48 = space();
    			div30 = element("div");
    			div28 = element("div");
    			div28.textContent = "Description";
    			t50 = space();
    			div29 = element("div");
    			p6 = element("p");
    			t51 = text(t51_value);
    			t52 = space();
    			div33 = element("div");
    			div31 = element("div");
    			div31.textContent = "Attachments";
    			t54 = space();
    			div32 = element("div");
    			create_component(slide.$$.fragment);
    			attr_dev(h1, "class", "page-title");
    			add_location(h1, file$7, 805, 12, 31996);
    			attr_dev(div0, "class", "card-header svelte-1w3yzpq");
    			add_location(div0, file$7, 809, 20, 32179);
    			attr_dev(p0, "class", "svelte-1w3yzpq");
    			add_location(p0, file$7, 811, 24, 32288);
    			attr_dev(div1, "class", "card-body svelte-1w3yzpq");
    			add_location(div1, file$7, 810, 20, 32240);
    			attr_dev(div2, "class", "card overview_1 svelte-1w3yzpq");
    			add_location(div2, file$7, 808, 16, 32129);
    			attr_dev(div3, "class", "card-header svelte-1w3yzpq");
    			add_location(div3, file$7, 815, 20, 32447);
    			attr_dev(p1, "class", "svelte-1w3yzpq");
    			add_location(p1, file$7, 817, 24, 32553);
    			attr_dev(div4, "class", "card-body svelte-1w3yzpq");
    			add_location(div4, file$7, 816, 20, 32505);
    			attr_dev(div5, "class", "card overview_2 svelte-1w3yzpq");
    			add_location(div5, file$7, 814, 16, 32397);
    			attr_dev(i0, "class", "i-incidents i-20");
    			add_location(i0, file$7, 824, 36, 32845);
    			add_location(b0, file$7, 824, 69, 32878);
    			attr_dev(td0, "class", "svelte-1w3yzpq");
    			add_location(td0, file$7, 824, 32, 32841);
    			attr_dev(td1, "class", "svelte-1w3yzpq");
    			add_location(td1, file$7, 825, 32, 32933);
    			add_location(tr0, file$7, 823, 28, 32804);
    			attr_dev(i1, "class", "i-location i-20");
    			add_location(i1, file$7, 828, 36, 33052);
    			add_location(b1, file$7, 828, 68, 33084);
    			attr_dev(td2, "class", "svelte-1w3yzpq");
    			add_location(td2, file$7, 828, 32, 33048);
    			attr_dev(td3, "class", "svelte-1w3yzpq");
    			add_location(td3, file$7, 829, 32, 33137);
    			add_location(tr1, file$7, 827, 28, 33011);
    			attr_dev(i2, "class", "i-time i-20");
    			add_location(i2, file$7, 832, 36, 33262);
    			add_location(b2, file$7, 832, 64, 33290);
    			attr_dev(td4, "class", "svelte-1w3yzpq");
    			add_location(td4, file$7, 832, 32, 33258);
    			attr_dev(td5, "class", "svelte-1w3yzpq");
    			add_location(td5, file$7, 833, 32, 33346);
    			add_location(tr2, file$7, 831, 28, 33221);
    			attr_dev(table, "class", "overview_combined svelte-1w3yzpq");
    			add_location(table, file$7, 822, 24, 32742);
    			attr_dev(p2, "class", "svelte-1w3yzpq");
    			add_location(p2, file$7, 836, 24, 33483);
    			attr_dev(div6, "class", "card-body svelte-1w3yzpq");
    			add_location(div6, file$7, 821, 20, 32694);
    			attr_dev(div7, "class", "card overview_3 svelte-1w3yzpq");
    			add_location(div7, file$7, 820, 16, 32644);
    			attr_dev(div8, "class", "card-header svelte-1w3yzpq");
    			add_location(div8, file$7, 841, 20, 33608);
    			attr_dev(p3, "class", "svelte-1w3yzpq");
    			add_location(p3, file$7, 843, 24, 33720);
    			attr_dev(div9, "class", "card-body svelte-1w3yzpq");
    			add_location(div9, file$7, 842, 20, 33672);
    			attr_dev(div10, "class", "card overview_4 svelte-1w3yzpq");
    			add_location(div10, file$7, 840, 16, 33558);
    			attr_dev(div11, "class", "card-header svelte-1w3yzpq");
    			add_location(div11, file$7, 847, 20, 33858);
    			attr_dev(i3, "class", "i-desktop i-20");
    			add_location(i3, file$7, 849, 27, 33968);
    			attr_dev(p4, "class", "svelte-1w3yzpq");
    			add_location(p4, file$7, 849, 24, 33965);
    			attr_dev(div12, "class", "card-body svelte-1w3yzpq");
    			add_location(div12, file$7, 848, 20, 33917);
    			attr_dev(div13, "class", "card overview_5 svelte-1w3yzpq");
    			add_location(div13, file$7, 846, 16, 33808);
    			attr_dev(div14, "class", "card-header svelte-1w3yzpq");
    			add_location(div14, file$7, 853, 20, 34127);
    			attr_dev(p5, "class", "pii svelte-1w3yzpq");
    			toggle_class(p5, "censor_pii", /*censor_pii*/ ctx[11]);
    			add_location(p5, file$7, 855, 24, 34238);
    			attr_dev(div15, "class", "card-body svelte-1w3yzpq");
    			add_location(div15, file$7, 854, 20, 34190);
    			attr_dev(div16, "class", "card overview_6 svelte-1w3yzpq");
    			add_location(div16, file$7, 852, 16, 34077);
    			attr_dev(div17, "class", "card-header svelte-1w3yzpq");
    			add_location(div17, file$7, 859, 20, 34401);
    			attr_dev(i4, "class", "i-actions i-32");
    			add_location(i4, file$7, 861, 82, 34566);
    			attr_dev(div18, "class", "mid-num svelte-1w3yzpq");
    			set_style(div18, "color", "var(--eo-critical-500)");
    			add_location(div18, file$7, 861, 24, 34508);
    			attr_dev(div19, "class", "card-body svelte-1w3yzpq");
    			add_location(div19, file$7, 860, 20, 34460);
    			attr_dev(div20, "class", "card overview_7 svelte-1w3yzpq");
    			add_location(div20, file$7, 858, 16, 34351);
    			attr_dev(div21, "class", "card-header svelte-1w3yzpq");
    			add_location(div21, file$7, 865, 20, 34721);
    			attr_dev(i5, "class", "i-thumbs-up i-32");
    			add_location(i5, file$7, 867, 24, 34844);
    			attr_dev(div22, "class", "card-body svelte-1w3yzpq");
    			add_location(div22, file$7, 866, 20, 34796);
    			attr_dev(div23, "class", "card overview_8 svelte-1w3yzpq");
    			add_location(div23, file$7, 864, 16, 34671);
    			attr_dev(div24, "class", "card-header svelte-1w3yzpq");
    			add_location(div24, file$7, 871, 20, 34993);
    			attr_dev(div25, "class", "mid-num svelte-1w3yzpq");
    			add_location(div25, file$7, 873, 24, 35103);
    			attr_dev(div26, "class", "card-body svelte-1w3yzpq");
    			add_location(div26, file$7, 872, 20, 35055);
    			attr_dev(div27, "class", "card overview_9 svelte-1w3yzpq");
    			add_location(div27, file$7, 870, 16, 34943);
    			attr_dev(div28, "class", "card-header svelte-1w3yzpq");
    			add_location(div28, file$7, 877, 20, 35253);
    			attr_dev(p6, "class", "svelte-1w3yzpq");
    			add_location(p6, file$7, 879, 24, 35364);
    			attr_dev(div29, "class", "card-body svelte-1w3yzpq");
    			add_location(div29, file$7, 878, 20, 35316);
    			attr_dev(div30, "class", "card overview_10 svelte-1w3yzpq");
    			add_location(div30, file$7, 876, 16, 35202);
    			attr_dev(div31, "class", "card-header svelte-1w3yzpq");
    			add_location(div31, file$7, 883, 20, 35511);
    			attr_dev(div32, "class", "card-body svelte-1w3yzpq");
    			add_location(div32, file$7, 884, 20, 35574);
    			attr_dev(div33, "class", "card overview_11 svelte-1w3yzpq");
    			add_location(div33, file$7, 882, 16, 35460);
    			attr_dev(div34, "class", "overview_grid svelte-1w3yzpq");
    			add_location(div34, file$7, 806, 12, 32068);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			/*h1_binding*/ ctx[66](h1);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div34, anchor);
    			append_dev(div34, div2);
    			append_dev(div2, div0);
    			append_dev(div2, t3);
    			append_dev(div2, div1);
    			append_dev(div1, p0);
    			append_dev(p0, t4);
    			append_dev(div34, t5);
    			append_dev(div34, div5);
    			append_dev(div5, div3);
    			append_dev(div5, t7);
    			append_dev(div5, div4);
    			append_dev(div4, p1);
    			append_dev(p1, t8);
    			append_dev(div34, t9);
    			append_dev(div34, div7);
    			append_dev(div7, div6);
    			append_dev(div6, table);
    			append_dev(table, tr0);
    			append_dev(tr0, td0);
    			append_dev(td0, i0);
    			append_dev(td0, t10);
    			append_dev(td0, b0);
    			append_dev(tr0, t12);
    			append_dev(tr0, td1);
    			append_dev(table, t14);
    			append_dev(table, tr1);
    			append_dev(tr1, td2);
    			append_dev(td2, i1);
    			append_dev(td2, t15);
    			append_dev(td2, b1);
    			append_dev(tr1, t17);
    			append_dev(tr1, td3);
    			append_dev(table, t19);
    			append_dev(table, tr2);
    			append_dev(tr2, td4);
    			append_dev(td4, i2);
    			append_dev(td4, t20);
    			append_dev(td4, b2);
    			append_dev(tr2, t22);
    			append_dev(tr2, td5);
    			append_dev(td5, t23);
    			append_dev(div6, t24);
    			append_dev(div6, p2);
    			append_dev(div34, t25);
    			append_dev(div34, div10);
    			append_dev(div10, div8);
    			append_dev(div10, t27);
    			append_dev(div10, div9);
    			append_dev(div9, p3);
    			append_dev(div34, t29);
    			append_dev(div34, div13);
    			append_dev(div13, div11);
    			append_dev(div13, t31);
    			append_dev(div13, div12);
    			append_dev(div12, p4);
    			append_dev(p4, i3);
    			append_dev(p4, t32);
    			append_dev(div34, t33);
    			append_dev(div34, div16);
    			append_dev(div16, div14);
    			append_dev(div16, t35);
    			append_dev(div16, div15);
    			append_dev(div15, p5);
    			append_dev(div34, t37);
    			append_dev(div34, div20);
    			append_dev(div20, div17);
    			append_dev(div20, t39);
    			append_dev(div20, div19);
    			append_dev(div19, div18);
    			append_dev(div18, i4);
    			append_dev(div18, t40);
    			append_dev(div34, t41);
    			append_dev(div34, div23);
    			append_dev(div23, div21);
    			append_dev(div23, t43);
    			append_dev(div23, div22);
    			append_dev(div22, i5);
    			append_dev(div34, t44);
    			append_dev(div34, div27);
    			append_dev(div27, div24);
    			append_dev(div27, t46);
    			append_dev(div27, div26);
    			append_dev(div26, div25);
    			append_dev(div34, t48);
    			append_dev(div34, div30);
    			append_dev(div30, div28);
    			append_dev(div30, t50);
    			append_dev(div30, div29);
    			append_dev(div29, p6);
    			append_dev(p6, t51);
    			append_dev(div34, t52);
    			append_dev(div34, div33);
    			append_dev(div33, div31);
    			append_dev(div33, t54);
    			append_dev(div33, div32);
    			mount_component(slide, div32, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty[0] & /*incident*/ 4) && t4_value !== (t4_value = (/*incident*/ ctx[2].id ? /*incident*/ ctx[2].id : "New") + "")) set_data_dev(t4, t4_value);
    			if ((!current || dirty[0] & /*incident*/ 4) && t8_value !== (t8_value = /*incident*/ ctx[2].status + "")) set_data_dev(t8, t8_value);
    			if ((!current || dirty[0] & /*incident*/ 4) && t23_value !== (t23_value = date_format(/*incident*/ ctx[2].updated_date) + "")) set_data_dev(t23, t23_value);

    			if (dirty[0] & /*censor_pii*/ 2048) {
    				toggle_class(p5, "censor_pii", /*censor_pii*/ ctx[11]);
    			}

    			if ((!current || dirty[0] & /*incident*/ 4) && t51_value !== (t51_value = /*incident*/ ctx[2].description + "")) set_data_dev(t51, t51_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(slide.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(slide.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			/*h1_binding*/ ctx[66](null);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div34);
    			destroy_component(slide);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_22.name,
    		type: "if",
    		source: "(805:8) {#if filtered_pages.indexOf('overview') >= 0}",
    		ctx
    	});

    	return block;
    }

    // (891:8) {#if filtered_pages.indexOf('report') >= 0}
    function create_if_block_21(ctx) {
    	let h1;
    	let t1;
    	let form;
    	let current;

    	form = new Form({
    			props: { f: /*f*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Report";
    			t1 = space();
    			create_component(form.$$.fragment);
    			attr_dev(h1, "class", "page-title");
    			add_location(h1, file$7, 891, 12, 35779);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			/*h1_binding_1*/ ctx[67](h1);
    			insert_dev(target, t1, anchor);
    			mount_component(form, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const form_changes = {};
    			if (dirty[0] & /*f*/ 2) form_changes.f = /*f*/ ctx[1];
    			form.$set(form_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(form.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(form.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			/*h1_binding_1*/ ctx[67](null);
    			if (detaching) detach_dev(t1);
    			destroy_component(form, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_21.name,
    		type: "if",
    		source: "(891:8) {#if filtered_pages.indexOf('report') >= 0}",
    		ctx
    	});

    	return block;
    }

    // (895:8) {#if filtered_pages.indexOf('events') >= 0}
    function create_if_block_18(ctx) {
    	let div0;
    	let h1;
    	let t1;
    	let div2;
    	let div1;
    	let img;
    	let img_src_value;
    	let t2;
    	let h5;
    	let t4;
    	let p;
    	let t5;
    	let b;
    	let t7;
    	let br;
    	let t8;
    	let t9;
    	let div3;
    	let t10;
    	let a;
    	let t12;
    	let mounted;
    	let dispose;
    	let if_block0 = !/*single_page*/ ctx[0] && create_if_block_20(ctx);
    	let if_block1 = !/*single_page*/ ctx[0] && create_if_block_19(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Events";
    			t1 = space();
    			div2 = element("div");
    			div1 = element("div");
    			img = element("img");
    			t2 = space();
    			h5 = element("h5");
    			h5.textContent = "Primary event";
    			t4 = space();
    			p = element("p");
    			t5 = text("You ");
    			b = element("b");
    			b.textContent = "must";
    			t7 = text(" add at least one event and this should be \n                        the most serious part of the incident.");
    			br = element("br");
    			t8 = text("\n                        You can add others at any time.");
    			t9 = space();
    			div3 = element("div");
    			if (if_block0) if_block0.c();
    			t10 = space();
    			a = element("a");
    			a.textContent = "Add Primary Event";
    			t12 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(h1, "class", "page-title");
    			add_location(h1, file$7, 896, 16, 35968);
    			attr_dev(div0, "class", "svelte-1w3yzpq");
    			add_location(div0, file$7, 895, 12, 35946);
    			if (img.src !== (img_src_value = "./images/illustrations/events.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "events illustration");
    			attr_dev(img, "class", "svelte-1w3yzpq");
    			add_location(img, file$7, 900, 20, 36148);
    			attr_dev(h5, "class", "svelte-1w3yzpq");
    			add_location(h5, file$7, 901, 20, 36240);
    			add_location(b, file$7, 902, 27, 36290);
    			add_location(br, file$7, 903, 62, 36407);
    			attr_dev(p, "class", "svelte-1w3yzpq");
    			add_location(p, file$7, 902, 20, 36283);
    			attr_dev(div1, "class", "card-body blank_state svelte-1w3yzpq");
    			add_location(div1, file$7, 899, 16, 36092);
    			attr_dev(div2, "class", "card svelte-1w3yzpq");
    			add_location(div2, file$7, 898, 12, 36057);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "btn btn-secondary");
    			add_location(a, file$7, 911, 16, 36792);
    			attr_dev(div3, "class", "text-right svelte-1w3yzpq");
    			add_location(div3, file$7, 907, 12, 36526);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, h1);
    			/*h1_binding_2*/ ctx[68](h1);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, img);
    			append_dev(div1, t2);
    			append_dev(div1, h5);
    			append_dev(div1, t4);
    			append_dev(div1, p);
    			append_dev(p, t5);
    			append_dev(p, b);
    			append_dev(p, t7);
    			append_dev(p, br);
    			append_dev(p, t8);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, div3, anchor);
    			if (if_block0) if_block0.m(div3, null);
    			append_dev(div3, t10);
    			append_dev(div3, a);
    			append_dev(div3, t12);
    			if (if_block1) if_block1.m(div3, null);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", prevent_default(/*show_event_drawer*/ ctx[24]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!/*single_page*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_20(ctx);
    					if_block0.c();
    					if_block0.m(div3, t10);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (!/*single_page*/ ctx[0]) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block_19(ctx);
    					if_block1.c();
    					if_block1.m(div3, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			/*h1_binding_2*/ ctx[68](null);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(div3);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_18.name,
    		type: "if",
    		source: "(895:8) {#if filtered_pages.indexOf('events') >= 0}",
    		ctx
    	});

    	return block;
    }

    // (909:16) {#if !single_page}
    function create_if_block_20(ctx) {
    	let a;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			a.textContent = "Back";
    			attr_dev(a, "class", "btn btn-secondary btn-left");
    			attr_dev(a, "href", "#ehs/incidents/incidents_new/report");
    			add_location(a, file$7, 909, 16, 36602);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*click_handler_24*/ ctx[69], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_20.name,
    		type: "if",
    		source: "(909:16) {#if !single_page}",
    		ctx
    	});

    	return block;
    }

    // (913:16) {#if !single_page}
    function create_if_block_19(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Next";
    			attr_dev(span, "class", "btn disabled");
    			add_location(span, file$7, 913, 16, 36949);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_19.name,
    		type: "if",
    		source: "(913:16) {#if !single_page}",
    		ctx
    	});

    	return block;
    }

    // (919:8) {#if filtered_pages.indexOf('witnesses') >= 0}
    function create_if_block_15(ctx) {
    	let div0;
    	let h1;
    	let t1;
    	let div2;
    	let div1;
    	let img;
    	let img_src_value;
    	let t2;
    	let h5;
    	let t4;
    	let p;
    	let t6;
    	let div3;
    	let t7;
    	let a;
    	let t9;
    	let mounted;
    	let dispose;
    	let if_block0 = !/*single_page*/ ctx[0] && create_if_block_17(ctx);
    	let if_block1 = !/*single_page*/ ctx[0] && create_if_block_16(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Witnesses";
    			t1 = space();
    			div2 = element("div");
    			div1 = element("div");
    			img = element("img");
    			t2 = space();
    			h5 = element("h5");
    			h5.textContent = "Who saw this event?";
    			t4 = space();
    			p = element("p");
    			p.textContent = "Witnesses can be invaluable if claims are made and its important to get their statements as early as possible.";
    			t6 = space();
    			div3 = element("div");
    			if (if_block0) if_block0.c();
    			t7 = space();
    			a = element("a");
    			a.textContent = "Add Witness";
    			t9 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(h1, "class", "page-title");
    			add_location(h1, file$7, 920, 16, 37133);
    			attr_dev(div0, "class", "svelte-1w3yzpq");
    			add_location(div0, file$7, 919, 12, 37111);
    			if (img.src !== (img_src_value = "./images/illustrations/witnesses.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "witnesses illustration");
    			attr_dev(img, "class", "svelte-1w3yzpq");
    			add_location(img, file$7, 924, 20, 37316);
    			attr_dev(h5, "class", "svelte-1w3yzpq");
    			add_location(h5, file$7, 925, 20, 37414);
    			attr_dev(p, "class", "svelte-1w3yzpq");
    			add_location(p, file$7, 926, 20, 37463);
    			attr_dev(div1, "class", "card-body blank_state svelte-1w3yzpq");
    			add_location(div1, file$7, 923, 16, 37260);
    			attr_dev(div2, "class", "card svelte-1w3yzpq");
    			add_location(div2, file$7, 922, 12, 37225);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "btn btn-secondary");
    			add_location(a, file$7, 933, 16, 37901);
    			attr_dev(div3, "class", "text-right svelte-1w3yzpq");
    			add_location(div3, file$7, 929, 12, 37635);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, h1);
    			/*h1_binding_3*/ ctx[70](h1);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, img);
    			append_dev(div1, t2);
    			append_dev(div1, h5);
    			append_dev(div1, t4);
    			append_dev(div1, p);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div3, anchor);
    			if (if_block0) if_block0.m(div3, null);
    			append_dev(div3, t7);
    			append_dev(div3, a);
    			append_dev(div3, t9);
    			if (if_block1) if_block1.m(div3, null);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", prevent_default(/*show_event_drawer*/ ctx[24]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!/*single_page*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_17(ctx);
    					if_block0.c();
    					if_block0.m(div3, t7);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (!/*single_page*/ ctx[0]) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block_16(ctx);
    					if_block1.c();
    					if_block1.m(div3, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			/*h1_binding_3*/ ctx[70](null);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div3);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_15.name,
    		type: "if",
    		source: "(919:8) {#if filtered_pages.indexOf('witnesses') >= 0}",
    		ctx
    	});

    	return block;
    }

    // (931:16) {#if !single_page}
    function create_if_block_17(ctx) {
    	let a;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			a.textContent = "Back";
    			attr_dev(a, "class", "btn btn-secondary btn-left");
    			attr_dev(a, "href", "#ehs/incidents/incidents_new/report");
    			add_location(a, file$7, 931, 16, 37711);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*click_handler_25*/ ctx[71], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_17.name,
    		type: "if",
    		source: "(931:16) {#if !single_page}",
    		ctx
    	});

    	return block;
    }

    // (935:16) {#if !single_page}
    function create_if_block_16(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Next";
    			attr_dev(span, "class", "btn disabled");
    			add_location(span, file$7, 935, 16, 38052);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_16.name,
    		type: "if",
    		source: "(935:16) {#if !single_page}",
    		ctx
    	});

    	return block;
    }

    // (941:8) {#if filtered_pages.indexOf('vehicles') >= 0}
    function create_if_block_12(ctx) {
    	let div0;
    	let h1;
    	let t1;
    	let div2;
    	let div1;
    	let img;
    	let img_src_value;
    	let t2;
    	let h5;
    	let t4;
    	let p;
    	let t6;
    	let div3;
    	let t7;
    	let a;
    	let t9;
    	let mounted;
    	let dispose;
    	let if_block0 = !/*single_page*/ ctx[0] && create_if_block_14(ctx);
    	let if_block1 = !/*single_page*/ ctx[0] && create_if_block_13(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Vehicles";
    			t1 = space();
    			div2 = element("div");
    			div1 = element("div");
    			img = element("img");
    			t2 = space();
    			h5 = element("h5");
    			h5.textContent = "Add all vehicles then tell us what happened";
    			t4 = space();
    			p = element("p");
    			p.textContent = "Recording traffic accidents and damage helps us keep vehicles from breaking down.";
    			t6 = space();
    			div3 = element("div");
    			if (if_block0) if_block0.c();
    			t7 = space();
    			a = element("a");
    			a.textContent = "Add Vehicle";
    			t9 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(h1, "class", "page-title");
    			add_location(h1, file$7, 942, 16, 38235);
    			attr_dev(div0, "class", "svelte-1w3yzpq");
    			add_location(div0, file$7, 941, 12, 38213);
    			if (img.src !== (img_src_value = "./images/illustrations/vehicles.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "vehicles illustration");
    			attr_dev(img, "class", "svelte-1w3yzpq");
    			add_location(img, file$7, 946, 20, 38417);
    			attr_dev(h5, "class", "svelte-1w3yzpq");
    			add_location(h5, file$7, 947, 20, 38513);
    			attr_dev(p, "class", "svelte-1w3yzpq");
    			add_location(p, file$7, 948, 20, 38586);
    			attr_dev(div1, "class", "card-body blank_state svelte-1w3yzpq");
    			add_location(div1, file$7, 945, 16, 38361);
    			attr_dev(div2, "class", "card svelte-1w3yzpq");
    			add_location(div2, file$7, 944, 12, 38326);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "btn btn-secondary");
    			add_location(a, file$7, 955, 16, 38995);
    			attr_dev(div3, "class", "text-right svelte-1w3yzpq");
    			add_location(div3, file$7, 951, 12, 38729);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, h1);
    			/*h1_binding_4*/ ctx[72](h1);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, img);
    			append_dev(div1, t2);
    			append_dev(div1, h5);
    			append_dev(div1, t4);
    			append_dev(div1, p);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div3, anchor);
    			if (if_block0) if_block0.m(div3, null);
    			append_dev(div3, t7);
    			append_dev(div3, a);
    			append_dev(div3, t9);
    			if (if_block1) if_block1.m(div3, null);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", prevent_default(/*show_event_drawer*/ ctx[24]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!/*single_page*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_14(ctx);
    					if_block0.c();
    					if_block0.m(div3, t7);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (!/*single_page*/ ctx[0]) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block_13(ctx);
    					if_block1.c();
    					if_block1.m(div3, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			/*h1_binding_4*/ ctx[72](null);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div3);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_12.name,
    		type: "if",
    		source: "(941:8) {#if filtered_pages.indexOf('vehicles') >= 0}",
    		ctx
    	});

    	return block;
    }

    // (953:16) {#if !single_page}
    function create_if_block_14(ctx) {
    	let a;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			a.textContent = "Back";
    			attr_dev(a, "class", "btn btn-secondary btn-left");
    			attr_dev(a, "href", "#ehs/incidents/incidents_new/report");
    			add_location(a, file$7, 953, 16, 38805);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*click_handler_26*/ ctx[73], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_14.name,
    		type: "if",
    		source: "(953:16) {#if !single_page}",
    		ctx
    	});

    	return block;
    }

    // (957:16) {#if !single_page}
    function create_if_block_13(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Next";
    			attr_dev(span, "class", "btn disabled");
    			add_location(span, file$7, 957, 16, 39146);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_13.name,
    		type: "if",
    		source: "(957:16) {#if !single_page}",
    		ctx
    	});

    	return block;
    }

    // (964:8) {#if filtered_pages.indexOf('attachments') >= 0}
    function create_if_block_9(ctx) {
    	let div0;
    	let h1;
    	let t1;
    	let div2;
    	let div1;
    	let img;
    	let img_src_value;
    	let t2;
    	let h5;
    	let t4;
    	let p;
    	let t6;
    	let div3;
    	let t7;
    	let a;
    	let t9;
    	let mounted;
    	let dispose;
    	let if_block0 = !/*single_page*/ ctx[0] && create_if_block_11(ctx);
    	let if_block1 = !/*single_page*/ ctx[0] && create_if_block_10(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Attachments";
    			t1 = space();
    			div2 = element("div");
    			div1 = element("div");
    			img = element("img");
    			t2 = space();
    			h5 = element("h5");
    			h5.textContent = "Add an attachment";
    			t4 = space();
    			p = element("p");
    			p.textContent = "To add photos or video drag and drop here or select files.";
    			t6 = space();
    			div3 = element("div");
    			if (if_block0) if_block0.c();
    			t7 = space();
    			a = element("a");
    			a.textContent = "Select files";
    			t9 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(h1, "class", "page-title");
    			add_location(h1, file$7, 965, 16, 39341);
    			attr_dev(div0, "class", "svelte-1w3yzpq");
    			add_location(div0, file$7, 964, 12, 39319);
    			if (img.src !== (img_src_value = "./images/illustrations/attachments.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "attachments illustration");
    			attr_dev(img, "class", "svelte-1w3yzpq");
    			add_location(img, file$7, 969, 20, 39526);
    			attr_dev(h5, "class", "svelte-1w3yzpq");
    			add_location(h5, file$7, 970, 20, 39628);
    			attr_dev(p, "class", "svelte-1w3yzpq");
    			add_location(p, file$7, 971, 20, 39675);
    			attr_dev(div1, "class", "card-body blank_state svelte-1w3yzpq");
    			add_location(div1, file$7, 968, 16, 39470);
    			attr_dev(div2, "class", "card svelte-1w3yzpq");
    			add_location(div2, file$7, 967, 12, 39435);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "btn btn-secondary");
    			add_location(a, file$7, 979, 16, 40062);
    			attr_dev(div3, "class", "text-right svelte-1w3yzpq");
    			add_location(div3, file$7, 974, 12, 39795);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, h1);
    			/*h1_binding_5*/ ctx[74](h1);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, img);
    			append_dev(div1, t2);
    			append_dev(div1, h5);
    			append_dev(div1, t4);
    			append_dev(div1, p);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div3, anchor);
    			if (if_block0) if_block0.m(div3, null);
    			append_dev(div3, t7);
    			append_dev(div3, a);
    			append_dev(div3, t9);
    			if (if_block1) if_block1.m(div3, null);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", prevent_default(/*show_event_drawer*/ ctx[24]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!/*single_page*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_11(ctx);
    					if_block0.c();
    					if_block0.m(div3, t7);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (!/*single_page*/ ctx[0]) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block_10(ctx);
    					if_block1.c();
    					if_block1.m(div3, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			/*h1_binding_5*/ ctx[74](null);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div3);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(964:8) {#if filtered_pages.indexOf('attachments') >= 0}",
    		ctx
    	});

    	return block;
    }

    // (976:16) {#if !single_page}
    function create_if_block_11(ctx) {
    	let a;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			a.textContent = "Back";
    			attr_dev(a, "class", "btn btn-secondary btn-left");
    			attr_dev(a, "href", "#ehs/incidents/incidents_new/report");
    			add_location(a, file$7, 976, 16, 39871);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*click_handler_27*/ ctx[75], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11.name,
    		type: "if",
    		source: "(976:16) {#if !single_page}",
    		ctx
    	});

    	return block;
    }

    // (982:16) {#if !single_page}
    function create_if_block_10(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Next";
    			attr_dev(span, "class", "btn disabled");
    			add_location(span, file$7, 982, 16, 40231);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(982:16) {#if !single_page}",
    		ctx
    	});

    	return block;
    }

    // (990:8) {#if filtered_pages.indexOf('links') >= 0}
    function create_if_block_6(ctx) {
    	let div0;
    	let h1;
    	let t1;
    	let div2;
    	let div1;
    	let img;
    	let img_src_value;
    	let t2;
    	let h5;
    	let t4;
    	let p;
    	let t6;
    	let div3;
    	let t7;
    	let a0;
    	let t9;
    	let a1;
    	let t11;
    	let mounted;
    	let dispose;
    	let if_block0 = !/*single_page*/ ctx[0] && create_if_block_8(ctx);
    	let if_block1 = !/*single_page*/ ctx[0] && create_if_block_7(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Links & Actions";
    			t1 = space();
    			div2 = element("div");
    			div1 = element("div");
    			img = element("img");
    			t2 = space();
    			h5 = element("h5");
    			h5.textContent = "Take action, prevent further incidents.";
    			t4 = space();
    			p = element("p");
    			p.textContent = "You can assign multiple corrective actions. We can send reminders and even escalate if they aren't completed on time.";
    			t6 = space();
    			div3 = element("div");
    			if (if_block0) if_block0.c();
    			t7 = space();
    			a0 = element("a");
    			a0.textContent = "Search record";
    			t9 = space();
    			a1 = element("a");
    			a1.textContent = "Add action";
    			t11 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(h1, "class", "page-title");
    			add_location(h1, file$7, 991, 16, 40421);
    			attr_dev(div0, "class", "svelte-1w3yzpq");
    			add_location(div0, file$7, 990, 12, 40399);
    			if (img.src !== (img_src_value = "./images/illustrations/links.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "links illustration");
    			attr_dev(img, "class", "svelte-1w3yzpq");
    			add_location(img, file$7, 995, 20, 40610);
    			attr_dev(h5, "class", "svelte-1w3yzpq");
    			add_location(h5, file$7, 996, 20, 40700);
    			attr_dev(p, "class", "svelte-1w3yzpq");
    			add_location(p, file$7, 997, 20, 40769);
    			attr_dev(div1, "class", "card-body blank_state svelte-1w3yzpq");
    			add_location(div1, file$7, 994, 16, 40554);
    			attr_dev(div2, "class", "card svelte-1w3yzpq");
    			add_location(div2, file$7, 993, 12, 40519);
    			attr_dev(a0, "href", "/");
    			attr_dev(a0, "class", "btn btn-secondary");
    			add_location(a0, file$7, 1005, 16, 41215);
    			attr_dev(a1, "href", "/");
    			attr_dev(a1, "class", "btn btn-secondary");
    			add_location(a1, file$7, 1006, 16, 41333);
    			attr_dev(div3, "class", "text-right svelte-1w3yzpq");
    			add_location(div3, file$7, 1000, 12, 40948);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, h1);
    			/*h1_binding_6*/ ctx[76](h1);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, img);
    			append_dev(div1, t2);
    			append_dev(div1, h5);
    			append_dev(div1, t4);
    			append_dev(div1, p);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div3, anchor);
    			if (if_block0) if_block0.m(div3, null);
    			append_dev(div3, t7);
    			append_dev(div3, a0);
    			append_dev(div3, t9);
    			append_dev(div3, a1);
    			append_dev(div3, t11);
    			if (if_block1) if_block1.m(div3, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(a0, "click", prevent_default(/*show_event_drawer*/ ctx[24]), false, true, false),
    					listen_dev(a1, "click", prevent_default(/*show_event_drawer*/ ctx[24]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!/*single_page*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_8(ctx);
    					if_block0.c();
    					if_block0.m(div3, t7);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (!/*single_page*/ ctx[0]) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block_7(ctx);
    					if_block1.c();
    					if_block1.m(div3, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			/*h1_binding_6*/ ctx[76](null);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div3);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(990:8) {#if filtered_pages.indexOf('links') >= 0}",
    		ctx
    	});

    	return block;
    }

    // (1002:16) {#if !single_page}
    function create_if_block_8(ctx) {
    	let a;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			a.textContent = "Back";
    			attr_dev(a, "class", "btn btn-secondary btn-left");
    			attr_dev(a, "href", "#ehs/incidents/incidents_new/report");
    			add_location(a, file$7, 1002, 16, 41024);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*click_handler_28*/ ctx[77], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(1002:16) {#if !single_page}",
    		ctx
    	});

    	return block;
    }

    // (1009:16) {#if !single_page}
    function create_if_block_7(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Next";
    			attr_dev(span, "class", "btn disabled");
    			add_location(span, file$7, 1009, 16, 41500);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(1009:16) {#if !single_page}",
    		ctx
    	});

    	return block;
    }

    // (1019:8) {#if filtered_pages.indexOf('claim') >= 0}
    function create_if_block_3$1(ctx) {
    	let div0;
    	let h1;
    	let t1;
    	let div2;
    	let div1;
    	let img;
    	let img_src_value;
    	let t2;
    	let h5;
    	let t4;
    	let p;
    	let t5;
    	let b;
    	let t6;
    	let t7;
    	let t8;
    	let div3;
    	let t9;
    	let a;
    	let t11;
    	let mounted;
    	let dispose;
    	let if_block0 = !/*single_page*/ ctx[0] && create_if_block_5(ctx);
    	let if_block1 = !/*single_page*/ ctx[0] && create_if_block_4$1(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Claim";
    			t1 = space();
    			div2 = element("div");
    			div1 = element("div");
    			img = element("img");
    			t2 = space();
    			h5 = element("h5");
    			h5.textContent = "Has a claim been made against this incident?";
    			t4 = space();
    			p = element("p");
    			t5 = text("It's only been ");
    			b = element("b");
    			t6 = text(/*counter_phrase*/ ctx[18]);
    			t7 = text(" since this incident happened.");
    			t8 = space();
    			div3 = element("div");
    			if (if_block0) if_block0.c();
    			t9 = space();
    			a = element("a");
    			a.textContent = "Add claim";
    			t11 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(h1, "class", "page-title");
    			add_location(h1, file$7, 1020, 16, 41692);
    			attr_dev(div0, "class", "svelte-1w3yzpq");
    			add_location(div0, file$7, 1019, 12, 41670);
    			if (img.src !== (img_src_value = "./images/illustrations/claim.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "claim illustration");
    			attr_dev(img, "class", "svelte-1w3yzpq");
    			add_location(img, file$7, 1024, 20, 41871);
    			attr_dev(h5, "class", "svelte-1w3yzpq");
    			add_location(h5, file$7, 1025, 20, 41961);
    			add_location(b, file$7, 1026, 38, 42053);
    			attr_dev(p, "class", "svelte-1w3yzpq");
    			add_location(p, file$7, 1026, 20, 42035);
    			attr_dev(div1, "class", "card-body blank_state svelte-1w3yzpq");
    			add_location(div1, file$7, 1023, 16, 41815);
    			attr_dev(div2, "class", "card svelte-1w3yzpq");
    			add_location(div2, file$7, 1022, 12, 41780);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "btn btn-secondary");
    			add_location(a, file$7, 1034, 16, 42432);
    			attr_dev(div3, "class", "text-right svelte-1w3yzpq");
    			add_location(div3, file$7, 1029, 12, 42165);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, h1);
    			/*h1_binding_7*/ ctx[78](h1);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, img);
    			append_dev(div1, t2);
    			append_dev(div1, h5);
    			append_dev(div1, t4);
    			append_dev(div1, p);
    			append_dev(p, t5);
    			append_dev(p, b);
    			append_dev(b, t6);
    			append_dev(p, t7);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, div3, anchor);
    			if (if_block0) if_block0.m(div3, null);
    			append_dev(div3, t9);
    			append_dev(div3, a);
    			append_dev(div3, t11);
    			if (if_block1) if_block1.m(div3, null);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", prevent_default(/*show_event_drawer*/ ctx[24]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*counter_phrase*/ 262144) set_data_dev(t6, /*counter_phrase*/ ctx[18]);

    			if (!/*single_page*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_5(ctx);
    					if_block0.c();
    					if_block0.m(div3, t9);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (!/*single_page*/ ctx[0]) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block_4$1(ctx);
    					if_block1.c();
    					if_block1.m(div3, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			/*h1_binding_7*/ ctx[78](null);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(div3);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(1019:8) {#if filtered_pages.indexOf('claim') >= 0}",
    		ctx
    	});

    	return block;
    }

    // (1031:16) {#if !single_page}
    function create_if_block_5(ctx) {
    	let a;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			a.textContent = "Back";
    			attr_dev(a, "class", "btn btn-secondary btn-left");
    			attr_dev(a, "href", "#ehs/incidents/incidents_new/report");
    			add_location(a, file$7, 1031, 16, 42241);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*click_handler_29*/ ctx[79], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(1031:16) {#if !single_page}",
    		ctx
    	});

    	return block;
    }

    // (1037:16) {#if !single_page}
    function create_if_block_4$1(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Next";
    			attr_dev(span, "class", "btn disabled");
    			add_location(span, file$7, 1037, 16, 42598);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(1037:16) {#if !single_page}",
    		ctx
    	});

    	return block;
    }

    // (1046:0) {#if show_drawer}
    function create_if_block_2$2(ctx) {
    	let div16;
    	let div0;
    	let t0;
    	let div15;
    	let div1;
    	let h2;
    	let t1;
    	let span0;
    	let i;
    	let t2;
    	let div14;
    	let div2;
    	let label0;
    	let t4;
    	let select0;
    	let option0;
    	let option1;
    	let option2;
    	let option3;
    	let option4;
    	let option5;
    	let option6;
    	let t12;
    	let div3;
    	let label1;
    	let t14;
    	let select1;
    	let option7;
    	let t16;
    	let div6;
    	let label2;
    	let t18;
    	let div4;
    	let input0;
    	let t19;
    	let t20;
    	let div5;
    	let input1;
    	let t21;
    	let t22;
    	let div7;
    	let label3;
    	let t24;
    	let select2;
    	let option8;
    	let t26;
    	let div8;
    	let label4;
    	let t28;
    	let input2;
    	let t29;
    	let div9;
    	let label5;
    	let t31;
    	let input3;
    	let t32;
    	let div10;
    	let label6;
    	let t34;
    	let input4;
    	let t35;
    	let div11;
    	let label7;
    	let input5;
    	let t36;
    	let span1;
    	let t37;
    	let t38;
    	let div12;
    	let label8;
    	let input6;
    	let t39;
    	let span2;
    	let t40;
    	let t41;
    	let div13;
    	let span3;
    	let t43;
    	let span4;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div16 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div15 = element("div");
    			div1 = element("div");
    			h2 = element("h2");
    			t1 = text("Add event ");
    			span0 = element("span");
    			i = element("i");
    			t2 = space();
    			div14 = element("div");
    			div2 = element("div");
    			label0 = element("label");
    			label0.textContent = "Event type";
    			t4 = space();
    			select0 = element("select");
    			option0 = element("option");
    			option0.textContent = "Accident";
    			option1 = element("option");
    			option1.textContent = "Occupational Illness";
    			option2 = element("option");
    			option2.textContent = "Environmental";
    			option3 = element("option");
    			option3.textContent = "Incident";
    			option4 = element("option");
    			option4.textContent = "Security";
    			option5 = element("option");
    			option5.textContent = "Process Safety";
    			option6 = element("option");
    			option6.textContent = "Near Miss";
    			t12 = space();
    			div3 = element("div");
    			label1 = element("label");
    			label1.textContent = "Event sub-type";
    			t14 = space();
    			select1 = element("select");
    			option7 = element("option");
    			option7.textContent = "Riddor";
    			t16 = space();
    			div6 = element("div");
    			label2 = element("label");
    			label2.textContent = "Legally reportable?";
    			t18 = space();
    			div4 = element("div");
    			input0 = element("input");
    			t19 = text(" Yes");
    			t20 = space();
    			div5 = element("div");
    			input1 = element("input");
    			t21 = text(" No");
    			t22 = space();
    			div7 = element("div");
    			label3 = element("label");
    			label3.textContent = "Type of person affected";
    			t24 = space();
    			select2 = element("select");
    			option8 = element("option");
    			option8.textContent = "Employee";
    			t26 = space();
    			div8 = element("div");
    			label4 = element("label");
    			label4.textContent = "Person";
    			t28 = space();
    			input2 = element("input");
    			t29 = space();
    			div9 = element("div");
    			label5 = element("label");
    			label5.textContent = "Parts of the body affected";
    			t31 = space();
    			input3 = element("input");
    			t32 = space();
    			div10 = element("div");
    			label6 = element("label");
    			label6.textContent = "Illness type";
    			t34 = space();
    			input4 = element("input");
    			t35 = space();
    			div11 = element("div");
    			label7 = element("label");
    			input5 = element("input");
    			t36 = space();
    			span1 = element("span");
    			t37 = text("\n                    Was the person given medical care?");
    			t38 = space();
    			div12 = element("div");
    			label8 = element("label");
    			input6 = element("input");
    			t39 = space();
    			span2 = element("span");
    			t40 = text("\n                    Is there Lost Time involved?");
    			t41 = space();
    			div13 = element("div");
    			span3 = element("span");
    			span3.textContent = "Add event";
    			t43 = space();
    			span4 = element("span");
    			span4.textContent = "Cancel";
    			attr_dev(div0, "class", "mask svelte-1w3yzpq");
    			toggle_class(div0, "visible", /*mask_visible*/ ctx[15]);
    			toggle_class(div0, "block", /*mask_block*/ ctx[14]);
    			add_location(div0, file$7, 1047, 8, 42763);
    			attr_dev(i, "class", "i-close i-24");
    			add_location(i, file$7, 1050, 81, 43017);
    			attr_dev(span0, "class", "close");
    			add_location(span0, file$7, 1050, 30, 42966);
    			add_location(h2, file$7, 1050, 16, 42952);
    			attr_dev(div1, "class", "pullout-head svelte-1w3yzpq");
    			add_location(div1, file$7, 1049, 12, 42909);
    			add_location(label0, file$7, 1055, 20, 43182);
    			option0.__value = "Accident";
    			option0.value = option0.__value;
    			add_location(option0, file$7, 1057, 24, 43314);
    			option1.__value = "Occupational Illness";
    			option1.value = option1.__value;
    			add_location(option1, file$7, 1058, 24, 43364);
    			option2.__value = "Environmental";
    			option2.value = option2.__value;
    			add_location(option2, file$7, 1059, 24, 43426);
    			option3.__value = "Incident";
    			option3.value = option3.__value;
    			add_location(option3, file$7, 1060, 24, 43481);
    			option4.__value = "Security";
    			option4.value = option4.__value;
    			add_location(option4, file$7, 1061, 24, 43531);
    			option5.__value = "Process Safety";
    			option5.value = option5.__value;
    			add_location(option5, file$7, 1062, 24, 43581);
    			option6.__value = "Near Miss";
    			option6.value = option6.__value;
    			add_location(option6, file$7, 1063, 24, 43637);
    			attr_dev(select0, "class", "form-control");
    			if (/*event*/ ctx[17].event_type === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[80].call(select0));
    			add_location(select0, file$7, 1056, 20, 43228);
    			attr_dev(div2, "class", "form-item svelte-1w3yzpq");
    			add_location(div2, file$7, 1054, 16, 43138);
    			add_location(label1, file$7, 1067, 20, 43777);
    			option7.__value = "Riddor";
    			option7.value = option7.__value;
    			add_location(option7, file$7, 1069, 24, 43881);
    			attr_dev(select1, "class", "form-control");
    			add_location(select1, file$7, 1068, 20, 43827);
    			attr_dev(div3, "class", "form-item svelte-1w3yzpq");
    			add_location(div3, file$7, 1066, 16, 43733);
    			add_location(label2, file$7, 1073, 20, 44018);
    			attr_dev(input0, "type", "radio");
    			add_location(input0, file$7, 1076, 24, 44158);
    			attr_dev(div4, "class", "form-control radio inline svelte-1w3yzpq");
    			add_location(div4, file$7, 1075, 20, 44094);
    			attr_dev(input1, "type", "radio");
    			add_location(input1, file$7, 1079, 24, 44294);
    			attr_dev(div5, "class", "form-control radio inline svelte-1w3yzpq");
    			add_location(div5, file$7, 1078, 20, 44230);
    			attr_dev(div6, "class", "form-item svelte-1w3yzpq");
    			add_location(div6, file$7, 1072, 16, 43974);
    			add_location(label3, file$7, 1083, 20, 44428);
    			option8.__value = "Employee";
    			option8.value = option8.__value;
    			add_location(option8, file$7, 1085, 24, 44541);
    			attr_dev(select2, "class", "form-control");
    			add_location(select2, file$7, 1084, 20, 44487);
    			attr_dev(div7, "class", "form-item svelte-1w3yzpq");
    			add_location(div7, file$7, 1082, 16, 44384);
    			add_location(label4, file$7, 1089, 20, 44680);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "class", "form-control");
    			add_location(input2, file$7, 1090, 20, 44722);
    			attr_dev(div8, "class", "form-item svelte-1w3yzpq");
    			add_location(div8, file$7, 1088, 16, 44636);
    			add_location(label5, file$7, 1093, 20, 44876);
    			attr_dev(input3, "type", "text");
    			attr_dev(input3, "class", "form-control");
    			add_location(input3, file$7, 1094, 20, 44938);
    			attr_dev(div9, "class", "form-item svelte-1w3yzpq");
    			add_location(div9, file$7, 1092, 16, 44832);
    			add_location(label6, file$7, 1097, 20, 45064);
    			attr_dev(input4, "type", "text");
    			attr_dev(input4, "class", "form-control");
    			add_location(input4, file$7, 1098, 20, 45112);
    			attr_dev(div10, "class", "form-item svelte-1w3yzpq");
    			add_location(div10, file$7, 1096, 16, 45020);
    			attr_dev(input5, "type", "checkbox");
    			add_location(input5, file$7, 1102, 24, 45285);
    			attr_dev(span1, "class", "slider");
    			add_location(span1, file$7, 1103, 24, 45367);
    			attr_dev(label7, "class", "switch");
    			add_location(label7, file$7, 1101, 20, 45238);
    			attr_dev(div11, "class", "form-item svelte-1w3yzpq");
    			add_location(div11, file$7, 1100, 16, 45194);
    			attr_dev(input6, "type", "checkbox");
    			add_location(input6, file$7, 1109, 24, 45610);
    			attr_dev(span2, "class", "slider");
    			add_location(span2, file$7, 1110, 24, 45693);
    			attr_dev(label8, "class", "switch");
    			add_location(label8, file$7, 1108, 20, 45563);
    			attr_dev(div12, "class", "form-item svelte-1w3yzpq");
    			add_location(div12, file$7, 1107, 16, 45519);
    			attr_dev(span3, "class", "btn");
    			add_location(span3, file$7, 1115, 20, 45883);
    			attr_dev(span4, "class", "btn btn-secondary");
    			add_location(span4, file$7, 1116, 20, 45938);
    			attr_dev(div13, "class", "form-item svelte-1w3yzpq");
    			add_location(div13, file$7, 1114, 16, 45839);
    			attr_dev(div14, "class", "pullout-body form svelte-1w3yzpq");
    			add_location(div14, file$7, 1052, 12, 43089);
    			attr_dev(div15, "class", "pullout svelte-1w3yzpq");
    			toggle_class(div15, "in", /*pullout*/ ctx[16]);
    			add_location(div15, file$7, 1048, 8, 42854);
    			attr_dev(div16, "class", "drawer svelte-1w3yzpq");
    			add_location(div16, file$7, 1046, 4, 42734);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div16, anchor);
    			append_dev(div16, div0);
    			append_dev(div16, t0);
    			append_dev(div16, div15);
    			append_dev(div15, div1);
    			append_dev(div1, h2);
    			append_dev(h2, t1);
    			append_dev(h2, span0);
    			append_dev(span0, i);
    			append_dev(div15, t2);
    			append_dev(div15, div14);
    			append_dev(div14, div2);
    			append_dev(div2, label0);
    			append_dev(div2, t4);
    			append_dev(div2, select0);
    			append_dev(select0, option0);
    			append_dev(select0, option1);
    			append_dev(select0, option2);
    			append_dev(select0, option3);
    			append_dev(select0, option4);
    			append_dev(select0, option5);
    			append_dev(select0, option6);
    			select_option(select0, /*event*/ ctx[17].event_type);
    			append_dev(div14, t12);
    			append_dev(div14, div3);
    			append_dev(div3, label1);
    			append_dev(div3, t14);
    			append_dev(div3, select1);
    			append_dev(select1, option7);
    			append_dev(div14, t16);
    			append_dev(div14, div6);
    			append_dev(div6, label2);
    			append_dev(div6, t18);
    			append_dev(div6, div4);
    			append_dev(div4, input0);
    			append_dev(div4, t19);
    			append_dev(div6, t20);
    			append_dev(div6, div5);
    			append_dev(div5, input1);
    			append_dev(div5, t21);
    			append_dev(div14, t22);
    			append_dev(div14, div7);
    			append_dev(div7, label3);
    			append_dev(div7, t24);
    			append_dev(div7, select2);
    			append_dev(select2, option8);
    			append_dev(div14, t26);
    			append_dev(div14, div8);
    			append_dev(div8, label4);
    			append_dev(div8, t28);
    			append_dev(div8, input2);
    			set_input_value(input2, /*event*/ ctx[17].person);
    			append_dev(div14, t29);
    			append_dev(div14, div9);
    			append_dev(div9, label5);
    			append_dev(div9, t31);
    			append_dev(div9, input3);
    			append_dev(div14, t32);
    			append_dev(div14, div10);
    			append_dev(div10, label6);
    			append_dev(div10, t34);
    			append_dev(div10, input4);
    			append_dev(div14, t35);
    			append_dev(div14, div11);
    			append_dev(div11, label7);
    			append_dev(label7, input5);
    			input5.checked = /*event*/ ctx[17].medical_bool;
    			append_dev(label7, t36);
    			append_dev(label7, span1);
    			append_dev(div11, t37);
    			append_dev(div14, t38);
    			append_dev(div14, div12);
    			append_dev(div12, label8);
    			append_dev(label8, input6);
    			input6.checked = /*event*/ ctx[17].losttime_bool;
    			append_dev(label8, t39);
    			append_dev(label8, span2);
    			append_dev(div12, t40);
    			append_dev(div14, t41);
    			append_dev(div14, div13);
    			append_dev(div13, span3);
    			append_dev(div13, t43);
    			append_dev(div13, span4);

    			if (!mounted) {
    				dispose = [
    					listen_dev(span0, "click", /*hide_event_drawer*/ ctx[25], false, false, false),
    					listen_dev(select0, "change", /*select0_change_handler*/ ctx[80]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[81]),
    					listen_dev(input5, "change", /*input5_change_handler*/ ctx[82]),
    					listen_dev(input6, "change", /*input6_change_handler*/ ctx[83]),
    					listen_dev(span4, "click", /*hide_event_drawer*/ ctx[25], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*mask_visible*/ 32768) {
    				toggle_class(div0, "visible", /*mask_visible*/ ctx[15]);
    			}

    			if (dirty[0] & /*mask_block*/ 16384) {
    				toggle_class(div0, "block", /*mask_block*/ ctx[14]);
    			}

    			if (dirty[0] & /*event*/ 131072) {
    				select_option(select0, /*event*/ ctx[17].event_type);
    			}

    			if (dirty[0] & /*event*/ 131072 && input2.value !== /*event*/ ctx[17].person) {
    				set_input_value(input2, /*event*/ ctx[17].person);
    			}

    			if (dirty[0] & /*event*/ 131072) {
    				input5.checked = /*event*/ ctx[17].medical_bool;
    			}

    			if (dirty[0] & /*event*/ 131072) {
    				input6.checked = /*event*/ ctx[17].losttime_bool;
    			}

    			if (dirty[0] & /*pullout*/ 65536) {
    				toggle_class(div15, "in", /*pullout*/ ctx[16]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div16);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(1046:0) {#if show_drawer}",
    		ctx
    	});

    	return block;
    }

    // (1128:8) {#if matrix}
    function create_if_block_1$2(ctx) {
    	let t0;
    	let t1;
    	let div1;
    	let div0;

    	let t2_value = (/*matrix_col_selected*/ ctx[21] < 0 || /*matrix_row_selected*/ ctx[22] < 0
    	? ""
    	: /*matrix*/ ctx[19].values[/*matrix_row_selected*/ ctx[22]][/*matrix_col_selected*/ ctx[21]].text) + "";

    	let t2;
    	let t3;
    	let div2;
    	let span0;
    	let t5;
    	let span1;
    	let mounted;
    	let dispose;
    	let each_value_7 = /*matrix*/ ctx[19].y_criteria;
    	validate_each_argument(each_value_7);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_7.length; i += 1) {
    		each_blocks_1[i] = create_each_block_7(get_each_context_7(ctx, each_value_7, i));
    	}

    	let each_value_5 = /*matrix*/ ctx[19].x_criteria;
    	validate_each_argument(each_value_5);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_5.length; i += 1) {
    		each_blocks[i] = create_each_block_5(get_each_context_5(ctx, each_value_5, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t0 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			div1 = element("div");
    			div0 = element("div");
    			t2 = text(t2_value);
    			t3 = space();
    			div2 = element("div");
    			span0 = element("span");
    			span0.textContent = "Save";
    			t5 = space();
    			span1 = element("span");
    			span1.textContent = "Cancel";
    			attr_dev(div0, "class", "matrix_cell svelte-1w3yzpq");
    			toggle_class(div0, "ok", /*matrix_col_selected*/ ctx[21] >= 0 && /*matrix_row_selected*/ ctx[22] >= 0 && /*matrix*/ ctx[19].values[/*matrix_row_selected*/ ctx[22]][/*matrix_col_selected*/ ctx[21]].color == "ok");
    			toggle_class(div0, "warning", /*matrix_col_selected*/ ctx[21] >= 0 && /*matrix_row_selected*/ ctx[22] >= 0 && /*matrix*/ ctx[19].values[/*matrix_row_selected*/ ctx[22]][/*matrix_col_selected*/ ctx[21]].color == "warning");
    			toggle_class(div0, "critical", /*matrix_col_selected*/ ctx[21] >= 0 && /*matrix_row_selected*/ ctx[22] >= 0 && /*matrix*/ ctx[19].values[/*matrix_row_selected*/ ctx[22]][/*matrix_col_selected*/ ctx[21]].color == "critical");
    			add_location(div0, file$7, 1152, 16, 47589);
    			attr_dev(div1, "class", "form-item svelte-1w3yzpq");
    			add_location(div1, file$7, 1151, 12, 47549);
    			attr_dev(span0, "class", "btn");
    			toggle_class(span0, "disabled", /*matrix_row_selected*/ ctx[22] < 0 || /*matrix_col_selected*/ ctx[21] < 0);
    			add_location(span0, file$7, 1159, 16, 48331);
    			attr_dev(span1, "class", "btn btn-secondary");
    			add_location(span1, file$7, 1160, 16, 48472);
    			attr_dev(div2, "class", "form-item svelte-1w3yzpq");
    			add_location(div2, file$7, 1158, 12, 48291);
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(target, anchor);
    			}

    			insert_dev(target, t0, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, span0);
    			append_dev(div2, t5);
    			append_dev(div2, span1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(span0, "click", /*matrix_save*/ ctx[33], false, false, false),
    					listen_dev(span1, "click", /*matrix_cancel*/ ctx[32], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*select_criteria_y, matrix*/ 537395200) {
    				each_value_7 = /*matrix*/ ctx[19].y_criteria;
    				validate_each_argument(each_value_7);
    				let i;

    				for (i = 0; i < each_value_7.length; i += 1) {
    					const child_ctx = get_each_context_7(ctx, each_value_7, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_7(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(t0.parentNode, t0);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_7.length;
    			}

    			if (dirty[0] & /*select_criteria_x, matrix*/ 1074266112) {
    				each_value_5 = /*matrix*/ ctx[19].x_criteria;
    				validate_each_argument(each_value_5);
    				let i;

    				for (i = 0; i < each_value_5.length; i += 1) {
    					const child_ctx = get_each_context_5(ctx, each_value_5, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(t1.parentNode, t1);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_5.length;
    			}

    			if (dirty[0] & /*matrix_col_selected, matrix_row_selected, matrix*/ 6815744 && t2_value !== (t2_value = (/*matrix_col_selected*/ ctx[21] < 0 || /*matrix_row_selected*/ ctx[22] < 0
    			? ""
    			: /*matrix*/ ctx[19].values[/*matrix_row_selected*/ ctx[22]][/*matrix_col_selected*/ ctx[21]].text) + "")) set_data_dev(t2, t2_value);

    			if (dirty[0] & /*matrix_col_selected, matrix_row_selected, matrix*/ 6815744) {
    				toggle_class(div0, "ok", /*matrix_col_selected*/ ctx[21] >= 0 && /*matrix_row_selected*/ ctx[22] >= 0 && /*matrix*/ ctx[19].values[/*matrix_row_selected*/ ctx[22]][/*matrix_col_selected*/ ctx[21]].color == "ok");
    			}

    			if (dirty[0] & /*matrix_col_selected, matrix_row_selected, matrix*/ 6815744) {
    				toggle_class(div0, "warning", /*matrix_col_selected*/ ctx[21] >= 0 && /*matrix_row_selected*/ ctx[22] >= 0 && /*matrix*/ ctx[19].values[/*matrix_row_selected*/ ctx[22]][/*matrix_col_selected*/ ctx[21]].color == "warning");
    			}

    			if (dirty[0] & /*matrix_col_selected, matrix_row_selected, matrix*/ 6815744) {
    				toggle_class(div0, "critical", /*matrix_col_selected*/ ctx[21] >= 0 && /*matrix_row_selected*/ ctx[22] >= 0 && /*matrix*/ ctx[19].values[/*matrix_row_selected*/ ctx[22]][/*matrix_col_selected*/ ctx[21]].color == "critical");
    			}

    			if (dirty[0] & /*matrix_row_selected, matrix_col_selected*/ 6291456) {
    				toggle_class(span0, "disabled", /*matrix_row_selected*/ ctx[22] < 0 || /*matrix_col_selected*/ ctx[21] < 0);
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(1128:8) {#if matrix}",
    		ctx
    	});

    	return block;
    }

    // (1135:24) {#each ycrit.options as option, i}
    function create_each_block_8(ctx) {
    	let option;
    	let t_value = /*option*/ ctx[116].label + "";
    	let t;
    	let option_selected_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = /*i*/ ctx[102];
    			option.value = option.__value;
    			option.selected = option_selected_value = /*option*/ ctx[116].selected;
    			add_location(option, file$7, 1135, 28, 46772);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*matrix*/ 524288 && t_value !== (t_value = /*option*/ ctx[116].label + "")) set_data_dev(t, t_value);

    			if (dirty[0] & /*matrix*/ 524288 && option_selected_value !== (option_selected_value = /*option*/ ctx[116].selected)) {
    				prop_dev(option, "selected", option_selected_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_8.name,
    		type: "each",
    		source: "(1135:24) {#each ycrit.options as option, i}",
    		ctx
    	});

    	return block;
    }

    // (1130:12) {#each matrix.y_criteria as ycrit, j}
    function create_each_block_7(ctx) {
    	let div;
    	let label;
    	let t0_value = /*ycrit*/ ctx[118].label + "";
    	let t0;
    	let t1;
    	let select;
    	let option;
    	let mounted;
    	let dispose;
    	let each_value_8 = /*ycrit*/ ctx[118].options;
    	validate_each_argument(each_value_8);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_8.length; i += 1) {
    		each_blocks[i] = create_each_block_8(get_each_context_8(ctx, each_value_8, i));
    	}

    	function change_handler(...args) {
    		return /*change_handler*/ ctx[87](/*j*/ ctx[106], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			label = element("label");
    			t0 = text(t0_value);
    			t1 = space();
    			select = element("select");
    			option = element("option");
    			option.textContent = "Select one...";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(label, file$7, 1131, 20, 46465);
    			option.__value = "-1";
    			option.value = option.__value;
    			add_location(option, file$7, 1133, 24, 46645);
    			attr_dev(select, "class", "form-control");
    			add_location(select, file$7, 1132, 20, 46514);
    			attr_dev(div, "class", "form-item svelte-1w3yzpq");
    			add_location(div, file$7, 1130, 16, 46421);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, label);
    			append_dev(label, t0);
    			append_dev(div, t1);
    			append_dev(div, select);
    			append_dev(select, option);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			if (!mounted) {
    				dispose = listen_dev(select, "change", change_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*matrix*/ 524288 && t0_value !== (t0_value = /*ycrit*/ ctx[118].label + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*matrix*/ 524288) {
    				each_value_8 = /*ycrit*/ ctx[118].options;
    				validate_each_argument(each_value_8);
    				let i;

    				for (i = 0; i < each_value_8.length; i += 1) {
    					const child_ctx = get_each_context_8(ctx, each_value_8, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_8(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_8.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_7.name,
    		type: "each",
    		source: "(1130:12) {#each matrix.y_criteria as ycrit, j}",
    		ctx
    	});

    	return block;
    }

    // (1146:24) {#each xcrit.options as option, i}
    function create_each_block_6(ctx) {
    	let option;
    	let t_value = /*option*/ ctx[116].label + "";
    	let t;
    	let option_selected_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = /*i*/ ctx[102];
    			option.value = option.__value;
    			option.selected = option_selected_value = /*option*/ ctx[116].selected;
    			add_location(option, file$7, 1146, 28, 47363);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*matrix*/ 524288 && t_value !== (t_value = /*option*/ ctx[116].label + "")) set_data_dev(t, t_value);

    			if (dirty[0] & /*matrix*/ 524288 && option_selected_value !== (option_selected_value = /*option*/ ctx[116].selected)) {
    				prop_dev(option, "selected", option_selected_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_6.name,
    		type: "each",
    		source: "(1146:24) {#each xcrit.options as option, i}",
    		ctx
    	});

    	return block;
    }

    // (1141:12) {#each matrix.x_criteria as xcrit, j}
    function create_each_block_5(ctx) {
    	let div;
    	let label;
    	let t0_value = /*xcrit*/ ctx[112].label + "";
    	let t0;
    	let t1;
    	let select;
    	let option;
    	let mounted;
    	let dispose;
    	let each_value_6 = /*xcrit*/ ctx[112].options;
    	validate_each_argument(each_value_6);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_6.length; i += 1) {
    		each_blocks[i] = create_each_block_6(get_each_context_6(ctx, each_value_6, i));
    	}

    	function change_handler_1(...args) {
    		return /*change_handler_1*/ ctx[88](/*j*/ ctx[106], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			label = element("label");
    			t0 = text(t0_value);
    			t1 = space();
    			select = element("select");
    			option = element("option");
    			option.textContent = "Select one...";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(label, file$7, 1142, 20, 47056);
    			option.__value = "-1";
    			option.value = option.__value;
    			add_location(option, file$7, 1144, 24, 47236);
    			attr_dev(select, "class", "form-control");
    			add_location(select, file$7, 1143, 20, 47105);
    			attr_dev(div, "class", "form-item svelte-1w3yzpq");
    			add_location(div, file$7, 1141, 16, 47012);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, label);
    			append_dev(label, t0);
    			append_dev(div, t1);
    			append_dev(div, select);
    			append_dev(select, option);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			if (!mounted) {
    				dispose = listen_dev(select, "change", change_handler_1, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*matrix*/ 524288 && t0_value !== (t0_value = /*xcrit*/ ctx[112].label + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*matrix*/ 524288) {
    				each_value_6 = /*xcrit*/ ctx[112].options;
    				validate_each_argument(each_value_6);
    				let i;

    				for (i = 0; i < each_value_6.length; i += 1) {
    					const child_ctx = get_each_context_6(ctx, each_value_6, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_6(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_6.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_5.name,
    		type: "each",
    		source: "(1141:12) {#each matrix.x_criteria as xcrit, j}",
    		ctx
    	});

    	return block;
    }

    // (1127:4) 
    function create_nofs_slot(ctx) {
    	let div;
    	let if_block = /*matrix*/ ctx[19] && create_if_block_1$2(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "slot", "nofs");
    			attr_dev(div, "class", "svelte-1w3yzpq");
    			add_location(div, file$7, 1126, 4, 46315);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    		},
    		p: function update(ctx, dirty) {
    			if (/*matrix*/ ctx[19]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$2(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_nofs_slot.name,
    		type: "slot",
    		source: "(1127:4) ",
    		ctx
    	});

    	return block;
    }

    // (1166:8) {#if matrix}
    function create_if_block$3(ctx) {
    	let p;
    	let t1;
    	let table;
    	let tbody;
    	let tr0;
    	let td0;
    	let h40;
    	let td0_colspan_value;
    	let t3;
    	let td1;
    	let h41;
    	let t4_value = /*matrix*/ ctx[19].y_criteria[0].label + "";
    	let t4;
    	let t5;
    	let tr1;
    	let t6;
    	let td2;
    	let t7;
    	let t8;
    	let tr2;
    	let td3;
    	let td3_colspan_value;
    	let t9;
    	let td4;
    	let span0;
    	let t11;
    	let span1;
    	let mounted;
    	let dispose;
    	let each_value_4 = /*matrix*/ ctx[19].x_criteria;
    	validate_each_argument(each_value_4);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		each_blocks_2[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
    	}

    	let each_value_3 = /*matrix*/ ctx[19].y_criteria[0].options;
    	validate_each_argument(each_value_3);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks_1[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	let each_value = /*matrix*/ ctx[19].x_criteria[0].options;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "To choose the appropriate severity first choose the matrix row by scanning down each description and finding the lowest one appropriate to this event. Then choose the matrix column by scanning across from that row choosing the column with the number of people at risk in this event.";
    			t1 = space();
    			table = element("table");
    			tbody = element("tbody");
    			tr0 = element("tr");
    			td0 = element("td");
    			h40 = element("h4");
    			h40.textContent = "Description";
    			t3 = space();
    			td1 = element("td");
    			h41 = element("h4");
    			t4 = text(t4_value);
    			t5 = space();
    			tr1 = element("tr");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t6 = space();
    			td2 = element("td");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t7 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t8 = space();
    			tr2 = element("tr");
    			td3 = element("td");
    			t9 = space();
    			td4 = element("td");
    			span0 = element("span");
    			span0.textContent = "Save";
    			t11 = space();
    			span1 = element("span");
    			span1.textContent = "Cancel";
    			set_style(p, "width", "100%");
    			set_style(p, "max-width", "480px");
    			add_location(p, file$7, 1166, 12, 48642);
    			attr_dev(h40, "class", "svelte-1w3yzpq");
    			add_location(h40, file$7, 1172, 65, 49191);
    			attr_dev(td0, "colspan", td0_colspan_value = /*matrix*/ ctx[19].x_criteria.length);
    			attr_dev(td0, "class", "svelte-1w3yzpq");
    			add_location(td0, file$7, 1172, 24, 49150);
    			attr_dev(h41, "class", "svelte-1w3yzpq");
    			add_location(h41, file$7, 1173, 42, 49259);
    			attr_dev(td1, "width", "364px");
    			attr_dev(td1, "class", "svelte-1w3yzpq");
    			add_location(td1, file$7, 1173, 24, 49241);
    			add_location(tr0, file$7, 1171, 20, 49121);
    			attr_dev(td2, "class", "svelte-1w3yzpq");
    			add_location(td2, file$7, 1181, 24, 49630);
    			add_location(tr1, file$7, 1175, 20, 49348);
    			attr_dev(td3, "colspan", td3_colspan_value = /*matrix*/ ctx[19].x_criteria.length);
    			attr_dev(td3, "class", "svelte-1w3yzpq");
    			add_location(td3, file$7, 1201, 24, 50967);
    			attr_dev(span0, "class", "btn");
    			toggle_class(span0, "disabled", /*matrix_row_selected*/ ctx[22] < 0 || /*matrix_col_selected*/ ctx[21] < 0);
    			add_location(span0, file$7, 1203, 28, 51071);
    			attr_dev(span1, "class", "btn btn-secondary");
    			add_location(span1, file$7, 1204, 28, 51224);
    			attr_dev(td4, "class", "svelte-1w3yzpq");
    			add_location(td4, file$7, 1202, 24, 51038);
    			add_location(tr2, file$7, 1200, 20, 50938);
    			add_location(tbody, file$7, 1170, 16, 49093);
    			attr_dev(table, "class", "matrix_table svelte-1w3yzpq");
    			set_style(table, "width", window.innerWidth - 64 + "px");
    			add_location(table, file$7, 1169, 12, 49009);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, table, anchor);
    			append_dev(table, tbody);
    			append_dev(tbody, tr0);
    			append_dev(tr0, td0);
    			append_dev(td0, h40);
    			append_dev(tr0, t3);
    			append_dev(tr0, td1);
    			append_dev(td1, h41);
    			append_dev(h41, t4);
    			append_dev(tbody, t5);
    			append_dev(tbody, tr1);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(tr1, null);
    			}

    			append_dev(tr1, t6);
    			append_dev(tr1, td2);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(td2, null);
    			}

    			append_dev(tbody, t7);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			append_dev(tbody, t8);
    			append_dev(tbody, tr2);
    			append_dev(tr2, td3);
    			append_dev(tr2, t9);
    			append_dev(tr2, td4);
    			append_dev(td4, span0);
    			append_dev(td4, t11);
    			append_dev(td4, span1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(span0, "click", /*matrix_save*/ ctx[33], false, false, false),
    					listen_dev(span1, "click", /*matrix_cancel*/ ctx[32], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*matrix*/ 524288 && td0_colspan_value !== (td0_colspan_value = /*matrix*/ ctx[19].x_criteria.length)) {
    				attr_dev(td0, "colspan", td0_colspan_value);
    			}

    			if (dirty[0] & /*matrix*/ 524288 && t4_value !== (t4_value = /*matrix*/ ctx[19].y_criteria[0].label + "")) set_data_dev(t4, t4_value);

    			if (dirty[0] & /*matrix*/ 524288) {
    				each_value_4 = /*matrix*/ ctx[19].x_criteria;
    				validate_each_argument(each_value_4);
    				let i;

    				for (i = 0; i < each_value_4.length; i += 1) {
    					const child_ctx = get_each_context_4(ctx, each_value_4, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_4(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(tr1, t6);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_4.length;
    			}

    			if (dirty[0] & /*matrix, select_criteria_y*/ 537395200) {
    				each_value_3 = /*matrix*/ ctx[19].y_criteria[0].options;
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_3(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(td2, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_3.length;
    			}

    			if (dirty[0] & /*matrix, matrix_row_selected, matrix_col_selected, select_criteria_x*/ 1080557568 | dirty[1] & /*matrix_pick*/ 1) {
    				each_value = /*matrix*/ ctx[19].x_criteria[0].options;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tbody, t8);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty[0] & /*matrix*/ 524288 && td3_colspan_value !== (td3_colspan_value = /*matrix*/ ctx[19].x_criteria.length)) {
    				attr_dev(td3, "colspan", td3_colspan_value);
    			}

    			if (dirty[0] & /*matrix_row_selected, matrix_col_selected*/ 6291456) {
    				toggle_class(span0, "disabled", /*matrix_row_selected*/ ctx[22] < 0 || /*matrix_col_selected*/ ctx[21] < 0);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(1166:8) {#if matrix}",
    		ctx
    	});

    	return block;
    }

    // (1177:24) {#each matrix.x_criteria as xcrit}
    function create_each_block_4(ctx) {
    	let td;
    	let h4;
    	let t_value = /*xcrit*/ ctx[112].label + "";
    	let t;

    	const block = {
    		c: function create() {
    			td = element("td");
    			h4 = element("h4");
    			t = text(t_value);
    			attr_dev(h4, "class", "svelte-1w3yzpq");
    			add_location(h4, file$7, 1178, 32, 49517);
    			set_style(td, "width", "calc((100% - 364px) / 4)");
    			attr_dev(td, "class", "svelte-1w3yzpq");
    			add_location(td, file$7, 1177, 28, 49440);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			append_dev(td, h4);
    			append_dev(h4, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*matrix*/ 524288 && t_value !== (t_value = /*xcrit*/ ctx[112].label + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_4.name,
    		type: "each",
    		source: "(1177:24) {#each matrix.x_criteria as xcrit}",
    		ctx
    	});

    	return block;
    }

    // (1183:28) {#each matrix.y_criteria[0].options as {label, selected}
    function create_each_block_3(ctx) {
    	let div;
    	let t_value = /*label*/ ctx[109] + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler_30() {
    		return /*click_handler_30*/ ctx[84](/*i*/ ctx[102]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "matrix_cell svelte-1w3yzpq");
    			toggle_class(div, "selected", /*matrix*/ ctx[19].y_criteria[0].options[/*i*/ ctx[102]].selected);
    			add_location(div, file$7, 1183, 32, 49756);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler_30, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*matrix*/ 524288 && t_value !== (t_value = /*label*/ ctx[109] + "")) set_data_dev(t, t_value);

    			if (dirty[0] & /*matrix*/ 524288) {
    				toggle_class(div, "selected", /*matrix*/ ctx[19].y_criteria[0].options[/*i*/ ctx[102]].selected);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(1183:28) {#each matrix.y_criteria[0].options as {label, selected}",
    		ctx
    	});

    	return block;
    }

    // (1191:28) {#each matrix.x_criteria as col, j}
    function create_each_block_2$1(ctx) {
    	let td;
    	let t_value = /*matrix*/ ctx[19].x_criteria[/*j*/ ctx[106]].options[/*i*/ ctx[102]].label + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler_31() {
    		return /*click_handler_31*/ ctx[85](/*i*/ ctx[102], /*j*/ ctx[106]);
    	}

    	const block = {
    		c: function create() {
    			td = element("td");
    			t = text(t_value);
    			attr_dev(td, "class", "criteria svelte-1w3yzpq");
    			toggle_class(td, "selected", /*matrix*/ ctx[19].x_criteria[/*j*/ ctx[106]].options[/*i*/ ctx[102]].selected);
    			add_location(td, file$7, 1191, 32, 50187);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			append_dev(td, t);

    			if (!mounted) {
    				dispose = listen_dev(td, "click", click_handler_31, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*matrix*/ 524288 && t_value !== (t_value = /*matrix*/ ctx[19].x_criteria[/*j*/ ctx[106]].options[/*i*/ ctx[102]].label + "")) set_data_dev(t, t_value);

    			if (dirty[0] & /*matrix*/ 524288) {
    				toggle_class(td, "selected", /*matrix*/ ctx[19].x_criteria[/*j*/ ctx[106]].options[/*i*/ ctx[102]].selected);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2$1.name,
    		type: "each",
    		source: "(1191:28) {#each matrix.x_criteria as col, j}",
    		ctx
    	});

    	return block;
    }

    // (1195:32) {#each matrix.values[i] as {text, color}
    function create_each_block_1$1(ctx) {
    	let div;
    	let t_value = /*text*/ ctx[103] + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler_32() {
    		return /*click_handler_32*/ ctx[86](/*i*/ ctx[102], /*j*/ ctx[106]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "matrix_cell svelte-1w3yzpq");
    			toggle_class(div, "highlight", /*i*/ ctx[102] == /*matrix_row_selected*/ ctx[22] && /*j*/ ctx[106] == /*matrix_col_selected*/ ctx[21]);
    			toggle_class(div, "ok", /*color*/ ctx[104] == "ok");
    			toggle_class(div, "warning", /*color*/ ctx[104] == "warning");
    			toggle_class(div, "critical", /*color*/ ctx[104] == "critical");
    			add_location(div, file$7, 1195, 36, 50542);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler_32, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*matrix*/ 524288 && t_value !== (t_value = /*text*/ ctx[103] + "")) set_data_dev(t, t_value);

    			if (dirty[0] & /*matrix_row_selected, matrix_col_selected*/ 6291456) {
    				toggle_class(div, "highlight", /*i*/ ctx[102] == /*matrix_row_selected*/ ctx[22] && /*j*/ ctx[106] == /*matrix_col_selected*/ ctx[21]);
    			}

    			if (dirty[0] & /*matrix*/ 524288) {
    				toggle_class(div, "ok", /*color*/ ctx[104] == "ok");
    			}

    			if (dirty[0] & /*matrix*/ 524288) {
    				toggle_class(div, "warning", /*color*/ ctx[104] == "warning");
    			}

    			if (dirty[0] & /*matrix*/ 524288) {
    				toggle_class(div, "critical", /*color*/ ctx[104] == "critical");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(1195:32) {#each matrix.values[i] as {text, color}",
    		ctx
    	});

    	return block;
    }

    // (1188:20) {#each matrix.x_criteria[0].options as row, i}
    function create_each_block$2(ctx) {
    	let tr;
    	let t;
    	let td;
    	let each_value_2 = /*matrix*/ ctx[19].x_criteria;
    	validate_each_argument(each_value_2);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_1[i] = create_each_block_2$1(get_each_context_2$1(ctx, each_value_2, i));
    	}

    	let each_value_1 = /*matrix*/ ctx[19].values[/*i*/ ctx[102]];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t = space();
    			td = element("td");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(td, "class", "svelte-1w3yzpq");
    			add_location(td, file$7, 1193, 28, 50424);
    			add_location(tr, file$7, 1189, 24, 50086);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(tr, null);
    			}

    			append_dev(tr, t);
    			append_dev(tr, td);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(td, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*matrix, select_criteria_x*/ 1074266112) {
    				each_value_2 = /*matrix*/ ctx[19].x_criteria;
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2$1(ctx, each_value_2, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_2$1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(tr, t);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_2.length;
    			}

    			if (dirty[0] & /*matrix_row_selected, matrix_col_selected, matrix*/ 6815744 | dirty[1] & /*matrix_pick*/ 1) {
    				each_value_1 = /*matrix*/ ctx[19].values[/*i*/ ctx[102]];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(td, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(1188:20) {#each matrix.x_criteria[0].options as row, i}",
    		ctx
    	});

    	return block;
    }

    // (1165:4) 
    function create_fs_slot(ctx) {
    	let div;
    	let if_block = /*matrix*/ ctx[19] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "slot", "fs");
    			attr_dev(div, "class", "svelte-1w3yzpq");
    			add_location(div, file$7, 1164, 4, 48593);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    		},
    		p: function update(ctx, dirty) {
    			if (/*matrix*/ ctx[19]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fs_slot.name,
    		type: "slot",
    		source: "(1165:4) ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div4;
    	let div0;
    	let ul;
    	let li0;
    	let a0;
    	let t1;
    	let li1;
    	let a1;
    	let t3;
    	let li2;
    	let a2;
    	let t5;
    	let li3;

    	let t6_value = (!/*incident*/ ctx[2].id
    	? "New"
    	: "Incident " + /*incident*/ ctx[2].id) + "";

    	let t6;
    	let t7;
    	let div3;
    	let div1;
    	let a3;
    	let t8;
    	let t9;
    	let a4;
    	let t10;
    	let a5;
    	let t11;
    	let a6;
    	let t12;
    	let div2;
    	let a7;
    	let t14;
    	let a8;
    	let t16;
    	let div23;
    	let div21;
    	let div20;
    	let h1;
    	let i;
    	let t17;
    	let t18;
    	let div19;
    	let div18;
    	let t19;
    	let div17;
    	let div7;
    	let div5;
    	let t21;
    	let div6;
    	let t22_value = /*incident*/ ctx[2].status + "";
    	let t22;
    	let t23;
    	let div10;
    	let div8;
    	let t25;
    	let div9;
    	let t26_value = /*incident*/ ctx[2].created_by + "";
    	let t26;
    	let t27;
    	let div13;
    	let div11;
    	let t29;
    	let div12;
    	let t30_value = date_format(/*incident*/ ctx[2].created_date) + "";
    	let t30;
    	let t31;
    	let div16;
    	let div14;
    	let t33;
    	let div15;
    	let t34_value = date_format(/*incident*/ ctx[2].updated_date) + "";
    	let t34;
    	let t35;
    	let t36;
    	let div22;
    	let t37;
    	let t38;
    	let show_if_7 = /*filtered_pages*/ ctx[5].indexOf("overview") >= 0;
    	let t39;
    	let show_if_6 = /*filtered_pages*/ ctx[5].indexOf("report") >= 0;
    	let t40;
    	let show_if_5 = /*filtered_pages*/ ctx[5].indexOf("events") >= 0;
    	let t41;
    	let show_if_4 = /*filtered_pages*/ ctx[5].indexOf("witnesses") >= 0;
    	let t42;
    	let show_if_3 = /*filtered_pages*/ ctx[5].indexOf("vehicles") >= 0;
    	let t43;
    	let show_if_2 = /*filtered_pages*/ ctx[5].indexOf("attachments") >= 0;
    	let t44;
    	let show_if_1 = /*filtered_pages*/ ctx[5].indexOf("links") >= 0;
    	let t45;
    	let show_if = /*filtered_pages*/ ctx[5].indexOf("claim") >= 0;
    	let t46;
    	let t47;
    	let pullout_1;
    	let current;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*single_page*/ ctx[0]) return create_if_block_31;
    		return create_else_block_3;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*inspector_details*/ ctx[10]) return create_if_block_30;
    		return create_else_block_2;
    	}

    	let current_block_type_1 = select_block_type_1(ctx);
    	let if_block1 = current_block_type_1(ctx);

    	function select_block_type_2(ctx, dirty) {
    		if (/*single_page*/ ctx[0]) return create_if_block_27;
    		return create_else_block_1;
    	}

    	let current_block_type_2 = select_block_type_2(ctx);
    	let if_block2 = current_block_type_2(ctx);
    	let if_block3 = /*print_mode*/ ctx[3] && create_if_block_25(ctx);
    	let if_block4 = /*filtered_pages*/ ctx[5].length == 0 && create_if_block_23(ctx);
    	let if_block5 = show_if_7 && create_if_block_22(ctx);
    	let if_block6 = show_if_6 && create_if_block_21(ctx);
    	let if_block7 = show_if_5 && create_if_block_18(ctx);
    	let if_block8 = show_if_4 && create_if_block_15(ctx);
    	let if_block9 = show_if_3 && create_if_block_12(ctx);
    	let if_block10 = show_if_2 && create_if_block_9(ctx);
    	let if_block11 = show_if_1 && create_if_block_6(ctx);
    	let if_block12 = show_if && create_if_block_3$1(ctx);
    	let if_block13 = /*show_drawer*/ ctx[13] && create_if_block_2$2(ctx);

    	pullout_1 = new Pullout({
    			props: {
    				fs: /*matrix_fs*/ ctx[28],
    				canfs: true,
    				show_drawer: /*matrix_drawer*/ ctx[20],
    				title: "Pre controls risk rating",
    				$$slots: {
    					fs: [create_fs_slot],
    					nofs: [create_nofs_slot]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	pullout_1.$on("close", /*matrix_cancel*/ ctx[32]);

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			a0.textContent = "EcoOnline";
    			t1 = space();
    			li1 = element("li");
    			a1 = element("a");
    			a1.textContent = "EHS";
    			t3 = space();
    			li2 = element("li");
    			a2 = element("a");
    			a2.textContent = "Incidents";
    			t5 = space();
    			li3 = element("li");
    			t6 = text(t6_value);
    			t7 = space();
    			div3 = element("div");
    			div1 = element("div");
    			a3 = element("a");
    			t8 = space();
    			if_block0.c();
    			t9 = space();
    			a4 = element("a");
    			t10 = space();
    			a5 = element("a");
    			t11 = space();
    			a6 = element("a");
    			t12 = space();
    			div2 = element("div");
    			a7 = element("a");
    			a7.textContent = "Save Progress";
    			t14 = space();
    			a8 = element("a");
    			a8.textContent = "Submit";
    			t16 = space();
    			div23 = element("div");
    			div21 = element("div");
    			div20 = element("div");
    			h1 = element("h1");
    			i = element("i");
    			t17 = text(" Incident");
    			t18 = space();
    			div19 = element("div");
    			div18 = element("div");
    			if_block1.c();
    			t19 = space();
    			div17 = element("div");
    			div7 = element("div");
    			div5 = element("div");
    			div5.textContent = "Status";
    			t21 = space();
    			div6 = element("div");
    			t22 = text(t22_value);
    			t23 = space();
    			div10 = element("div");
    			div8 = element("div");
    			div8.textContent = "Creator";
    			t25 = space();
    			div9 = element("div");
    			t26 = text(t26_value);
    			t27 = space();
    			div13 = element("div");
    			div11 = element("div");
    			div11.textContent = "Date created";
    			t29 = space();
    			div12 = element("div");
    			t30 = text(t30_value);
    			t31 = space();
    			div16 = element("div");
    			div14 = element("div");
    			div14.textContent = "Date updated";
    			t33 = space();
    			div15 = element("div");
    			t34 = text(t34_value);
    			t35 = space();
    			if_block2.c();
    			t36 = space();
    			div22 = element("div");
    			if (if_block3) if_block3.c();
    			t37 = space();
    			if (if_block4) if_block4.c();
    			t38 = space();
    			if (if_block5) if_block5.c();
    			t39 = space();
    			if (if_block6) if_block6.c();
    			t40 = space();
    			if (if_block7) if_block7.c();
    			t41 = space();
    			if (if_block8) if_block8.c();
    			t42 = space();
    			if (if_block9) if_block9.c();
    			t43 = space();
    			if (if_block10) if_block10.c();
    			t44 = space();
    			if (if_block11) if_block11.c();
    			t45 = space();
    			if (if_block12) if_block12.c();
    			t46 = space();
    			if (if_block13) if_block13.c();
    			t47 = space();
    			create_component(pullout_1.$$.fragment);
    			attr_dev(a0, "href", "#platform");
    			attr_dev(a0, "class", "svelte-1w3yzpq");
    			add_location(a0, file$7, 687, 16, 24711);
    			attr_dev(li0, "class", "svelte-1w3yzpq");
    			add_location(li0, file$7, 687, 12, 24707);
    			attr_dev(a1, "href", "#ehs");
    			attr_dev(a1, "class", "svelte-1w3yzpq");
    			add_location(a1, file$7, 688, 16, 24804);
    			attr_dev(li1, "class", "svelte-1w3yzpq");
    			add_location(li1, file$7, 688, 12, 24800);
    			attr_dev(a2, "href", "#ehs/incidents");
    			attr_dev(a2, "class", "svelte-1w3yzpq");
    			add_location(a2, file$7, 689, 16, 24881);
    			attr_dev(li2, "class", "svelte-1w3yzpq");
    			add_location(li2, file$7, 689, 12, 24877);
    			add_location(li3, file$7, 690, 12, 24976);
    			attr_dev(ul, "class", "breadcrumb");
    			add_location(ul, file$7, 686, 8, 24671);
    			attr_dev(div0, "class", "col12 col-md-6 svelte-1w3yzpq");
    			add_location(div0, file$7, 685, 4, 24634);
    			attr_dev(a3, "href", "/");
    			attr_dev(a3, "class", "i-trash i-24 svelte-1w3yzpq");
    			add_location(a3, file$7, 695, 12, 25148);
    			attr_dev(a4, "href", "/");
    			attr_dev(a4, "class", "i-actions i-24 svelte-1w3yzpq");
    			add_location(a4, file$7, 701, 12, 25554);
    			attr_dev(a5, "href", "/");
    			attr_dev(a5, "class", "i-attachment i-24 svelte-1w3yzpq");
    			add_location(a5, file$7, 702, 12, 25607);
    			attr_dev(a6, "href", "/");
    			attr_dev(a6, "class", "i-printer i-24 svelte-1w3yzpq");
    			add_location(a6, file$7, 703, 12, 25663);
    			attr_dev(div1, "class", "menu-icons svelte-1w3yzpq");
    			add_location(div1, file$7, 694, 8, 25111);
    			attr_dev(a7, "href", "/");
    			attr_dev(a7, "class", "btn btn-secondary svelte-1w3yzpq");
    			add_location(a7, file$7, 706, 12, 25830);
    			attr_dev(a8, "href", "/");
    			attr_dev(a8, "class", "btn svelte-1w3yzpq");
    			add_location(a8, file$7, 707, 12, 25940);
    			attr_dev(div2, "class", "menu-buttons svelte-1w3yzpq");
    			add_location(div2, file$7, 705, 8, 25791);
    			attr_dev(div3, "class", "col12 col-md-6 menu-bar svelte-1w3yzpq");
    			add_location(div3, file$7, 693, 4, 25065);
    			attr_dev(div4, "class", "row sticky svelte-1w3yzpq");
    			add_location(div4, file$7, 684, 0, 24605);
    			attr_dev(i, "class", "i-incidents i-32");
    			add_location(i, file$7, 714, 35, 26170);
    			attr_dev(h1, "class", "page-title");
    			add_location(h1, file$7, 714, 12, 26147);
    			attr_dev(div5, "class", "svelte-1w3yzpq");
    			add_location(div5, file$7, 724, 28, 26906);
    			attr_dev(div6, "class", "svelte-1w3yzpq");
    			add_location(div6, file$7, 725, 28, 26952);
    			attr_dev(div7, "class", "svelte-1w3yzpq");
    			add_location(div7, file$7, 723, 24, 26872);
    			attr_dev(div8, "class", "svelte-1w3yzpq");
    			add_location(div8, file$7, 728, 28, 27070);
    			attr_dev(div9, "class", "svelte-1w3yzpq");
    			add_location(div9, file$7, 729, 28, 27117);
    			attr_dev(div10, "class", "svelte-1w3yzpq");
    			add_location(div10, file$7, 727, 24, 27036);
    			attr_dev(div11, "class", "svelte-1w3yzpq");
    			add_location(div11, file$7, 732, 28, 27239);
    			attr_dev(div12, "class", "svelte-1w3yzpq");
    			add_location(div12, file$7, 733, 28, 27291);
    			attr_dev(div13, "class", "svelte-1w3yzpq");
    			add_location(div13, file$7, 731, 24, 27205);
    			attr_dev(div14, "class", "svelte-1w3yzpq");
    			add_location(div14, file$7, 736, 28, 27428);
    			attr_dev(div15, "class", "svelte-1w3yzpq");
    			add_location(div15, file$7, 737, 28, 27480);
    			attr_dev(div16, "class", "svelte-1w3yzpq");
    			add_location(div16, file$7, 735, 24, 27394);
    			attr_dev(div17, "class", "inspector-details-table svelte-1w3yzpq");
    			toggle_class(div17, "inspector_details", /*inspector_details*/ ctx[10]);
    			add_location(div17, file$7, 722, 20, 26786);
    			attr_dev(div18, "class", "card-body inspector-details-card svelte-1w3yzpq");
    			add_location(div18, file$7, 716, 16, 26264);
    			attr_dev(div19, "class", "card svelte-1w3yzpq");
    			add_location(div19, file$7, 715, 12, 26229);
    			attr_dev(div20, "class", "side_menu_wrapper svelte-1w3yzpq");
    			set_style(div20, "position", "sticky");
    			set_style(div20, "top", "56px");
    			add_location(div20, file$7, 713, 8, 26070);
    			attr_dev(div21, "class", "col3 d960up-block svelte-1w3yzpq");
    			add_location(div21, file$7, 712, 4, 26030);
    			attr_dev(div22, "class", "col12 col-md-9 svelte-1w3yzpq");
    			add_location(div22, file$7, 778, 4, 30890);
    			attr_dev(div23, "class", "row svelte-1w3yzpq");
    			add_location(div23, file$7, 711, 0, 26008);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			append_dev(div0, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a0);
    			append_dev(ul, t1);
    			append_dev(ul, li1);
    			append_dev(li1, a1);
    			append_dev(ul, t3);
    			append_dev(ul, li2);
    			append_dev(li2, a2);
    			append_dev(ul, t5);
    			append_dev(ul, li3);
    			append_dev(li3, t6);
    			append_dev(div4, t7);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			append_dev(div1, a3);
    			append_dev(div1, t8);
    			if_block0.m(div1, null);
    			append_dev(div1, t9);
    			append_dev(div1, a4);
    			append_dev(div1, t10);
    			append_dev(div1, a5);
    			append_dev(div1, t11);
    			append_dev(div1, a6);
    			append_dev(div3, t12);
    			append_dev(div3, div2);
    			append_dev(div2, a7);
    			append_dev(div2, t14);
    			append_dev(div2, a8);
    			insert_dev(target, t16, anchor);
    			insert_dev(target, div23, anchor);
    			append_dev(div23, div21);
    			append_dev(div21, div20);
    			append_dev(div20, h1);
    			append_dev(h1, i);
    			append_dev(h1, t17);
    			append_dev(div20, t18);
    			append_dev(div20, div19);
    			append_dev(div19, div18);
    			if_block1.m(div18, null);
    			append_dev(div18, t19);
    			append_dev(div18, div17);
    			append_dev(div17, div7);
    			append_dev(div7, div5);
    			append_dev(div7, t21);
    			append_dev(div7, div6);
    			append_dev(div6, t22);
    			append_dev(div17, t23);
    			append_dev(div17, div10);
    			append_dev(div10, div8);
    			append_dev(div10, t25);
    			append_dev(div10, div9);
    			append_dev(div9, t26);
    			append_dev(div17, t27);
    			append_dev(div17, div13);
    			append_dev(div13, div11);
    			append_dev(div13, t29);
    			append_dev(div13, div12);
    			append_dev(div12, t30);
    			append_dev(div17, t31);
    			append_dev(div17, div16);
    			append_dev(div16, div14);
    			append_dev(div16, t33);
    			append_dev(div16, div15);
    			append_dev(div15, t34);
    			append_dev(div20, t35);
    			if_block2.m(div20, null);
    			append_dev(div23, t36);
    			append_dev(div23, div22);
    			if (if_block3) if_block3.m(div22, null);
    			append_dev(div22, t37);
    			if (if_block4) if_block4.m(div22, null);
    			append_dev(div22, t38);
    			if (if_block5) if_block5.m(div22, null);
    			append_dev(div22, t39);
    			if (if_block6) if_block6.m(div22, null);
    			append_dev(div22, t40);
    			if (if_block7) if_block7.m(div22, null);
    			append_dev(div22, t41);
    			if (if_block8) if_block8.m(div22, null);
    			append_dev(div22, t42);
    			if (if_block9) if_block9.m(div22, null);
    			append_dev(div22, t43);
    			if (if_block10) if_block10.m(div22, null);
    			append_dev(div22, t44);
    			if (if_block11) if_block11.m(div22, null);
    			append_dev(div22, t45);
    			if (if_block12) if_block12.m(div22, null);
    			insert_dev(target, t46, anchor);
    			if (if_block13) if_block13.m(target, anchor);
    			insert_dev(target, t47, anchor);
    			mount_component(pullout_1, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(a0, "click", /*click_handler*/ ctx[38], false, false, false),
    					listen_dev(a1, "click", /*click_handler_1*/ ctx[39], false, false, false),
    					listen_dev(a2, "click", /*click_handler_2*/ ctx[40], false, false, false),
    					listen_dev(a6, "click", prevent_default(/*click_handler_5*/ ctx[43]), false, true, false),
    					listen_dev(a7, "click", prevent_default(/*save_incident*/ ctx[23]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty[0] & /*incident*/ 4) && t6_value !== (t6_value = (!/*incident*/ ctx[2].id
    			? "New"
    			: "Incident " + /*incident*/ ctx[2].id) + "")) set_data_dev(t6, t6_value);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div1, t9);
    				}
    			}

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type_1(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div18, t19);
    				}
    			}

    			if ((!current || dirty[0] & /*incident*/ 4) && t22_value !== (t22_value = /*incident*/ ctx[2].status + "")) set_data_dev(t22, t22_value);
    			if ((!current || dirty[0] & /*incident*/ 4) && t26_value !== (t26_value = /*incident*/ ctx[2].created_by + "")) set_data_dev(t26, t26_value);
    			if ((!current || dirty[0] & /*incident*/ 4) && t30_value !== (t30_value = date_format(/*incident*/ ctx[2].created_date) + "")) set_data_dev(t30, t30_value);
    			if ((!current || dirty[0] & /*incident*/ 4) && t34_value !== (t34_value = date_format(/*incident*/ ctx[2].updated_date) + "")) set_data_dev(t34, t34_value);

    			if (dirty[0] & /*inspector_details*/ 1024) {
    				toggle_class(div17, "inspector_details", /*inspector_details*/ ctx[10]);
    			}

    			if (current_block_type_2 === (current_block_type_2 = select_block_type_2(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type_2(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(div20, null);
    				}
    			}

    			if (/*print_mode*/ ctx[3]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty[0] & /*print_mode*/ 8) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block_25(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(div22, t37);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}

    			if (/*filtered_pages*/ ctx[5].length == 0) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block_23(ctx);
    					if_block4.c();
    					if_block4.m(div22, t38);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (dirty[0] & /*filtered_pages*/ 32) show_if_7 = /*filtered_pages*/ ctx[5].indexOf("overview") >= 0;

    			if (show_if_7) {
    				if (if_block5) {
    					if_block5.p(ctx, dirty);

    					if (dirty[0] & /*filtered_pages*/ 32) {
    						transition_in(if_block5, 1);
    					}
    				} else {
    					if_block5 = create_if_block_22(ctx);
    					if_block5.c();
    					transition_in(if_block5, 1);
    					if_block5.m(div22, t39);
    				}
    			} else if (if_block5) {
    				group_outros();

    				transition_out(if_block5, 1, 1, () => {
    					if_block5 = null;
    				});

    				check_outros();
    			}

    			if (dirty[0] & /*filtered_pages*/ 32) show_if_6 = /*filtered_pages*/ ctx[5].indexOf("report") >= 0;

    			if (show_if_6) {
    				if (if_block6) {
    					if_block6.p(ctx, dirty);

    					if (dirty[0] & /*filtered_pages*/ 32) {
    						transition_in(if_block6, 1);
    					}
    				} else {
    					if_block6 = create_if_block_21(ctx);
    					if_block6.c();
    					transition_in(if_block6, 1);
    					if_block6.m(div22, t40);
    				}
    			} else if (if_block6) {
    				group_outros();

    				transition_out(if_block6, 1, 1, () => {
    					if_block6 = null;
    				});

    				check_outros();
    			}

    			if (dirty[0] & /*filtered_pages*/ 32) show_if_5 = /*filtered_pages*/ ctx[5].indexOf("events") >= 0;

    			if (show_if_5) {
    				if (if_block7) {
    					if_block7.p(ctx, dirty);
    				} else {
    					if_block7 = create_if_block_18(ctx);
    					if_block7.c();
    					if_block7.m(div22, t41);
    				}
    			} else if (if_block7) {
    				if_block7.d(1);
    				if_block7 = null;
    			}

    			if (dirty[0] & /*filtered_pages*/ 32) show_if_4 = /*filtered_pages*/ ctx[5].indexOf("witnesses") >= 0;

    			if (show_if_4) {
    				if (if_block8) {
    					if_block8.p(ctx, dirty);
    				} else {
    					if_block8 = create_if_block_15(ctx);
    					if_block8.c();
    					if_block8.m(div22, t42);
    				}
    			} else if (if_block8) {
    				if_block8.d(1);
    				if_block8 = null;
    			}

    			if (dirty[0] & /*filtered_pages*/ 32) show_if_3 = /*filtered_pages*/ ctx[5].indexOf("vehicles") >= 0;

    			if (show_if_3) {
    				if (if_block9) {
    					if_block9.p(ctx, dirty);
    				} else {
    					if_block9 = create_if_block_12(ctx);
    					if_block9.c();
    					if_block9.m(div22, t43);
    				}
    			} else if (if_block9) {
    				if_block9.d(1);
    				if_block9 = null;
    			}

    			if (dirty[0] & /*filtered_pages*/ 32) show_if_2 = /*filtered_pages*/ ctx[5].indexOf("attachments") >= 0;

    			if (show_if_2) {
    				if (if_block10) {
    					if_block10.p(ctx, dirty);
    				} else {
    					if_block10 = create_if_block_9(ctx);
    					if_block10.c();
    					if_block10.m(div22, t44);
    				}
    			} else if (if_block10) {
    				if_block10.d(1);
    				if_block10 = null;
    			}

    			if (dirty[0] & /*filtered_pages*/ 32) show_if_1 = /*filtered_pages*/ ctx[5].indexOf("links") >= 0;

    			if (show_if_1) {
    				if (if_block11) {
    					if_block11.p(ctx, dirty);
    				} else {
    					if_block11 = create_if_block_6(ctx);
    					if_block11.c();
    					if_block11.m(div22, t45);
    				}
    			} else if (if_block11) {
    				if_block11.d(1);
    				if_block11 = null;
    			}

    			if (dirty[0] & /*filtered_pages*/ 32) show_if = /*filtered_pages*/ ctx[5].indexOf("claim") >= 0;

    			if (show_if) {
    				if (if_block12) {
    					if_block12.p(ctx, dirty);
    				} else {
    					if_block12 = create_if_block_3$1(ctx);
    					if_block12.c();
    					if_block12.m(div22, null);
    				}
    			} else if (if_block12) {
    				if_block12.d(1);
    				if_block12 = null;
    			}

    			if (/*show_drawer*/ ctx[13]) {
    				if (if_block13) {
    					if_block13.p(ctx, dirty);
    				} else {
    					if_block13 = create_if_block_2$2(ctx);
    					if_block13.c();
    					if_block13.m(t47.parentNode, t47);
    				}
    			} else if (if_block13) {
    				if_block13.d(1);
    				if_block13 = null;
    			}

    			const pullout_1_changes = {};
    			if (dirty[0] & /*matrix_drawer*/ 1048576) pullout_1_changes.show_drawer = /*matrix_drawer*/ ctx[20];

    			if (dirty[0] & /*matrix_row_selected, matrix_col_selected, matrix*/ 6815744 | dirty[4] & /*$$scope*/ 1) {
    				pullout_1_changes.$$scope = { dirty, ctx };
    			}

    			pullout_1.$set(pullout_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block3);
    			transition_in(if_block5);
    			transition_in(if_block6);
    			transition_in(pullout_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block3);
    			transition_out(if_block5);
    			transition_out(if_block6);
    			transition_out(pullout_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if_block0.d();
    			if (detaching) detach_dev(t16);
    			if (detaching) detach_dev(div23);
    			if_block1.d();
    			if_block2.d();
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
    			if (detaching) detach_dev(t46);
    			if (if_block13) if_block13.d(detaching);
    			if (detaching) detach_dev(t47);
    			destroy_component(pullout_1, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function censor_it() {
    	let censor_span = document.createElement("span");
    	censor_span.classList.add("censor_custom");
    	let sel = window.getSelection();
    	let selection = window.getSelection().getRangeAt(0);
    	let selectedText = sel + "";
    	selection.extractContents();
    	censor_span.innerText = selectedText;
    	selection.insertNode(censor_span);
    }

    function logKey(e) {
    	
    }

    function date_format(str) {
    	return new Date(str).toLocaleString([], {
    		year: "numeric",
    		month: "numeric",
    		day: "numeric",
    		hour: "2-digit",
    		minute: "2-digit"
    	});
    }

    function getTimeDifference(sTimeDifference) {
    	const yearDifference = Math.floor(sTimeDifference / 31536000); // 31536000 - Average Seconds in one Year
    	const monthDifference = Math.floor(sTimeDifference % 31536000 / 2592000); // 2592000 - Average Seconds in one Month (30 Days)
    	const dayDifference = Math.floor(sTimeDifference % 2592000 / 86400); // 86400 - Seconds in one Day
    	const hourDifference = Math.floor(sTimeDifference % 86400 / 3600); // 3600 - Seconds in one Hour
    	const minuteDifference = Math.floor(sTimeDifference % 3600 / 60); // 60 - Seconds in one Minute
    	const secondDifference = Math.floor(sTimeDifference % 60);

    	return {
    		year: yearDifference,
    		month: monthDifference,
    		day: dayDifference,
    		hour: hourDifference,
    		minute: minuteDifference,
    		second: secondDifference
    	};
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let vis_pages;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Frame_incidents_new", slots, []);
    	const dispatch = createEventDispatcher();
    	let single_page = false; //view as tabs
    	let form_test = "Form testttttt";

    	let f = [
    		{
    			item_type: "section",
    			label: "Initial details",
    			children: [
    				{
    					item_type: "input_text",
    					id: "0_1",
    					label: "Site",
    					hint: false,
    					placeholder: "Click or type to select...",
    					options: [
    						{ value: "", text: "Select one" },
    						{ value: "PP", text: "Passport" },
    						{ value: "ID", text: "National ID" }
    					],
    					answer: ""
    				},
    				{
    					item_type: "input_text",
    					id: "0_2",
    					label: "Date and time of event",
    					hint: false,
    					answer: "",
    					shortcuts: [{ value: new Date(), text: "Now" }]
    				},
    				{
    					item_type: "input_text",
    					id: "0_3",
    					label: "Date and time reported",
    					hint: false,
    					answer: "",
    					shortcuts: [{ value: new Date(), text: "Now" }]
    				},
    				{
    					item_type: "input_text",
    					id: "0_4",
    					label: "Offsite location",
    					optional: true,
    					hint: false,
    					answer: ""
    				}
    			]
    		},
    		{
    			item_type: "section",
    			label: "Details of event",
    			children: [
    				{
    					item_type: "input_text",
    					id: "0_5",
    					label: "Manual reference number",
    					optional: true,
    					hint: false,
    					answer: ""
    				},
    				{
    					item_type: "input_text",
    					id: "0_6",
    					label: "Time into shift",
    					optional: true,
    					answer: ""
    				},
    				{
    					item_type: "input_switch",
    					id: "0_7",
    					label: "",
    					options: [{ value: false, text: "Medical care given" }]
    				},
    				{
    					item_type: "input_switch",
    					id: "0_8",
    					label: "Was lost time involved",
    					hint: "Turn this on if the person was or is still off work",
    					options: [{ value: false, text: "" }]
    				},
    				{
    					item_type: "input_matrix",
    					id: "0_9",
    					label: "Pre controls risk rating",
    					matrix: {
    						x_criteria: [
    							{
    								label: "Safety",
    								options: [
    									{
    										"label": "Injury requiring first aid but not medical intervention",
    										"selected": false
    									},
    									{
    										"label": "Injury requiring medical intervention (not life threatening)",
    										"selected": false
    									},
    									{
    										"label": "Injury requiring immediate medical intervention and hospitalisation",
    										"selected": false
    									},
    									{
    										"label": "Fatality or life threatening injury",
    										"selected": false
    									},
    									{
    										"label": "Multiple onsite fatalities. Any offsite fatalities",
    										"selected": false
    									}
    								]
    							},
    							{
    								label: "Incident",
    								options: [
    									{
    										"label": "Miscellaneous or minor damage",
    										"selected": false
    									},
    									{
    										"label": "Replacement cost/loss of 10k - 100k",
    										"selected": false
    									},
    									{
    										"label": "Replacement cost/loss of 100k - 1m",
    										"selected": false
    									},
    									{
    										"label": "Replacement cost/loss of 1m - 10m",
    										"selected": false
    									},
    									{
    										"label": "Replacement cost/loss of > 10m",
    										"selected": false
    									}
    								]
    							},
    							{
    								label: "Environment",
    								options: [
    									{
    										"label": "Emissions or discharges above internal limits",
    										"selected": false
    									},
    									{
    										"label": "Significant substance lost / definite visible / odour effects",
    										"selected": false
    									},
    									{
    										"label": "Release of hazardous materials that impact the environment",
    										"selected": false
    									},
    									{
    										"label": "Major loss of very harmful substances",
    										"selected": false
    									},
    									{
    										"label": "Very serious / extensive pllution or loss of amenity",
    										"selected": false
    									}
    								]
    							},
    							{
    								label: "Authorities",
    								options: [
    									{
    										"label": "Site issue only",
    										"selected": false
    									},
    									{
    										"label": "Notifiable to regulator with possibility of minor notice of violation",
    										"selected": false
    									},
    									{
    										"label": "Prosecution with potential for fines up to €20k",
    										"selected": false
    									},
    									{
    										"label": "Sever fines (>€20k) or custodial sentences",
    										"selected": false
    									},
    									{
    										"label": "Fines affecting profitability or significant custodial sentences",
    										"selected": false
    									}
    								]
    							}
    						],
    						y_criteria: [
    							{
    								label: "Forseeable number of people at risk",
    								options: [
    									{ "label": "0", "selected": false },
    									{ "label": "1", "selected": false },
    									{ "label": "2-10", "selected": false },
    									{ "label": "11-100", "selected": false },
    									{ "label": "> 100", "selected": false }
    								]
    							}
    						],
    						values: [
    							[
    								{ text: "A1", color: "ok" },
    								{ text: "B1", color: "ok" },
    								{ text: "C1", color: "ok" },
    								{ text: "D1", color: "warning" },
    								{ text: "E1", color: "warning" }
    							],
    							[
    								{ text: "A2", color: "ok" },
    								{ text: "B2", color: "ok" },
    								{ text: "C2", color: "warning" },
    								{ text: "D2", color: "warning" },
    								{ text: "E2", color: "warning" }
    							],
    							[
    								{ text: "A3", color: "warning" },
    								{ text: "B3", color: "warning" },
    								{ text: "C3", color: "warning" },
    								{ text: "D3", color: "critical" },
    								{ text: "E3", color: "critical" }
    							],
    							[
    								{ text: "A4", color: "warning" },
    								{ text: "B4", color: "critical" },
    								{ text: "C4", color: "critical" },
    								{ text: "D4", color: "critical" },
    								{ text: "E4", color: "critical" }
    							],
    							[
    								{ text: "A5", color: "critical" },
    								{ text: "B5", color: "critical" },
    								{ text: "C5", color: "critical" },
    								{ text: "D5", color: "critical" },
    								{ text: "E5", color: "critical" }
    							]
    						]
    					},
    					optional: true,
    					answer: {}
    				},
    				{
    					item_type: "input_matrix",
    					id: "0_9",
    					label: "Another Matrix",
    					matrix: {
    						x_criteria: [
    							{
    								label: "Safety",
    								options: [
    									{
    										"label": "Mostly harmless",
    										"selected": false
    									},
    									{
    										"label": "So long and thanks for all the fish",
    										"selected": false
    									},
    									{
    										"label": "Don't panic",
    										"selected": false
    									},
    									{
    										"label": "The ships hung in the sky much the same way that bricks don't",
    										"selected": false
    									}
    								]
    							}
    						],
    						y_criteria: [
    							{
    								label: "Forseeable number of people at risk",
    								options: [
    									{ "label": "0", "selected": false },
    									{ "label": "1", "selected": false },
    									{ "label": "2-10", "selected": false },
    									{ "label": "11-41", "selected": false },
    									{ "label": "> 42", "selected": false }
    								]
    							}
    						],
    						values: [
    							[
    								{ text: "A1", color: "ok" },
    								{ text: "B1", color: "ok" },
    								{ text: "C1", color: "ok" },
    								{ text: "D1", color: "warning" },
    								{ text: "E1", color: "warning" }
    							],
    							[
    								{ text: "A2", color: "ok" },
    								{ text: "B2", color: "ok" },
    								{ text: "C2", color: "warning" },
    								{ text: "D2", color: "warning" },
    								{ text: "E2", color: "warning" }
    							],
    							[
    								{ text: "A3", color: "warning" },
    								{ text: "B3", color: "warning" },
    								{ text: "C3", color: "warning" },
    								{ text: "D3", color: "critical" },
    								{ text: "E3", color: "critical" }
    							],
    							[
    								{ text: "A4", color: "warning" },
    								{ text: "B4", color: "critical" },
    								{ text: "C4", color: "critical" },
    								{ text: "D4", color: "critical" },
    								{ text: "42", color: "critical" }
    							]
    						]
    					},
    					optional: true,
    					answer: {}
    				},
    				{
    					item_type: "input_text",
    					id: "0_10",
    					label: "Time into shift",
    					optional: true,
    					answer: ""
    				}
    			]
    		}
    	];

    	let form_text = "";

    	let incident = {
    		"status": "Draft",
    		"id": false,
    		"created_by": "Hayden Chambers",
    		"created_date": "2022-02-07T17:06:09.111Z",
    		"updated_by": "Hayden Chambers",
    		"updated_date": new Date().toISOString(), //"2022-02-07T17:06:09.111Z"
    		"description": "Mike and I saw a really big tree branch had fallen down near the entrance"
    	};

    	function save_incident() {
    		$$invalidate(2, incident.status = "In Progress", incident);
    		$$invalidate(2, incident.id = "485", incident);
    		$$invalidate(2, incident.updated_date = new Date().toISOString(), incident);
    	}

    	let inspector_details = false;
    	let censor_pii = false;
    	let censor_mode = false;
    	let print_mode = false;
    	let print_options = ["overview", "report", "events"];

    	let total_pages = [
    		{
    			key: "overview",
    			title: "Overview",
    			type: "tab"
    		},
    		{
    			key: "report",
    			title: "Report",
    			type: "tab"
    		},
    		{
    			key: "events",
    			title: "Events",
    			type: "tab"
    		},
    		{
    			key: "witnesses",
    			title: "Witnesses",
    			type: "tool"
    		},
    		{
    			key: "vehicles",
    			title: "Vehicles",
    			type: "tool"
    		},
    		{
    			key: "attachments",
    			title: "Attachments",
    			type: "tool"
    		},
    		{
    			key: "links",
    			title: "Links & Actions",
    			type: "tool"
    		},
    		{
    			key: "claim",
    			title: "Claim",
    			type: "tool"
    		}
    	];

    	document.addEventListener("keydown", e => {
    		if (e.code == "Enter" && censor_mode) {
    			censor_it();
    		}
    	});

    	let filtered_pages = [];

    	function update_payload_text() {
    		console.log(form_test, JSON.stringify(f, null, 4));
    	}

    	let show_drawer = false;
    	let mask_block = false;
    	let mask_visible = false;
    	let pullout = false;
    	let add_event = false;
    	let events = [];

    	let event = {
    		event_type: false,
    		event_subtype: false,
    		reportable: -1,
    		type_of_person: false,
    		person: "",
    		parts_of_body: [],
    		illness_type: false,
    		medical_bool: false,
    		losttime_bool: false
    	};

    	function show_event_drawer() {
    		$$invalidate(13, show_drawer = true);
    		$$invalidate(14, mask_block = false);
    		$$invalidate(15, mask_visible = true);

    		setTimeout(
    			() => {
    				$$invalidate(16, pullout = true);
    			},
    			300
    		);
    	}

    	function hide_event_drawer() {
    		$$invalidate(14, mask_block = false);
    		$$invalidate(15, mask_visible = false);
    		$$invalidate(16, pullout = false);

    		setTimeout(
    			() => {
    				$$invalidate(13, show_drawer = false);
    			},
    			1000
    		);
    	}

    	let tab = "report";
    	let { tabnav = "" } = $$props;
    	let { bodyScroll = 0 } = $$props;

    	/*
    function print_mode(bool) {
        dispatch('print', {
            text: bool
        })
    }
    */
    	function nav(str) {
    		dispatch("nav", { text: str });
    	}

    	/*
        crappy code to position the sidemenu bar at the right 'tab'
    */
    	let hs = [
    		{
    			"key": "report",
    			"el": false,
    			"y": 40 + (incident.id ? 35 : 0)
    		},
    		{
    			"key": "events",
    			"el": false,
    			"y": 75 + (incident.id ? 35 : 0)
    		},
    		{
    			"key": "witnesses",
    			"el": false,
    			"y": 110 + (incident.id ? 35 : 0)
    		},
    		{
    			"key": "vehicles",
    			"el": false,
    			"y": 145 + (incident.id ? 35 : 0)
    		},
    		{
    			"key": "attachments",
    			"el": false,
    			"y": 180 + (incident.id ? 35 : 0)
    		},
    		{
    			"key": "links",
    			"el": false,
    			"y": 215 + (incident.id ? 35 : 0)
    		},
    		{
    			"key": "claim",
    			"el": false,
    			"y": 250 + (incident.id ? 35 : 0)
    		},
    		{ "key": "overview", "el": false, "y": 40 }
    	];

    	function single_page_scroll(key) {
    		let sel = hs.filter(h => {
    			return h.key == key;
    		});

    		if (sel && sel.length) {
    			sel[0];

    			//document.getElementsByTagName('main')[0].scrollTop = sel[0].el.offsetTop - window.innerHeight/2.5;
    			let y = sel[0].el.offsetTop - 112;

    			document.getElementsByTagName("main")[0].scroll({ top: y, behavior: "smooth" });
    		} else {
    			console.log("couldnt find ", key);
    		}
    	}

    	let closest = false;
    	let closest_el = hs[0];
    	let counter = 0;
    	let start_time = new Date().getTime();
    	let counter_phrase = "";
    	let sub = PubSub.subscribe("MATRIX", read_matrix);
    	let matrix = false;
    	let matrix_holder = false;
    	let matrix_drawer = false;
    	let matrix_fs = true;
    	let matrix_col_selected = -1;
    	let matrix_row_selected = -1;

    	function select_criteria_y(i, j) {
    		$$invalidate(21, matrix_col_selected = i);

    		matrix.y_criteria[j].options.forEach(el => {
    			el.selected = false; //deselect this column
    		});

    		$$invalidate(19, matrix.y_criteria[j].options[i].selected = true, matrix); //select the row in this column
    		$$invalidate(19, matrix);
    	}

    	function select_criteria_x(i, j) {
    		let currently_selected = matrix.x_criteria[j].options[i].selected;

    		matrix.x_criteria[j].options.forEach(el => {
    			el.selected = false; //deselect this column
    		});

    		$$invalidate(19, matrix.x_criteria[j].options[i].selected = !currently_selected, matrix); //select the row in this column

    		//iterate over all columns and find highest row selected
    		let highest_row = -1;

    		matrix.x_criteria.forEach(col => {
    			col.options.forEach((row, i) => {
    				if (row.selected && i > highest_row) {
    					highest_row = i;
    				}
    			});
    		});

    		$$invalidate(22, matrix_row_selected = highest_row);
    	}

    	function matrix_pick(i, j) {
    		$$invalidate(22, matrix_row_selected = i);
    		$$invalidate(21, matrix_col_selected = j);

    		matrix.x_criteria.forEach(col => {
    			col.options.forEach((row, x) => {
    				row.selected = false;

    				if (matrix_row_selected == x) {
    					row.selected = true;
    				}
    			});
    		});

    		matrix.y_criteria.forEach(col => {
    			col.options.forEach((row, x) => {
    				row.selected = false;

    				if (matrix_col_selected == x) {
    					row.selected = true;
    				}
    			});
    		});

    		$$invalidate(19, matrix);
    		$$invalidate(19, matrix);
    		console.log("done matrix pick", i, j);
    	}

    	function read_matrix(msg, data) {
    		matrix_holder = data;
    		$$invalidate(19, matrix = data.matrix);
    		$$invalidate(20, matrix_drawer = true);
    		$$invalidate(21, matrix_col_selected = -1);
    		$$invalidate(22, matrix_row_selected = -1);

    		matrix.values.forEach((row, i) => {
    			row.forEach((col, j) => {
    				if (col == matrix_holder.answer) {
    					$$invalidate(21, matrix_col_selected = j);
    					$$invalidate(22, matrix_row_selected = i);
    				}
    			});
    		});
    	}

    	function matrix_cancel() {
    		$$invalidate(20, matrix_drawer = false);
    	}

    	function matrix_save() {
    		matrix_holder.answer = matrix.values[matrix_row_selected][matrix_col_selected];
    		$$invalidate(1, f);
    		$$invalidate(20, matrix_drawer = false);
    	}

    	onMount(() => {
    		setInterval(
    			() => {
    				$$invalidate(37, counter += 10);
    			},
    			10000
    		); //updates every 10 seconds
    	});

    	const writable_props = ["tabnav", "bodyScroll"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$3.warn(`<Frame_incidents_new> was created with unknown prop '${key}'`);
    	});

    	const $$binding_groups = [[]];

    	const click_handler = () => {
    		nav("platform");
    	};

    	const click_handler_1 = () => {
    		nav("ehs");
    	};

    	const click_handler_2 = () => {
    		nav("incidents");
    	};

    	const click_handler_3 = () => {
    		$$invalidate(0, single_page = false);
    	};

    	const click_handler_4 = () => {
    		$$invalidate(0, single_page = true);
    	};

    	const click_handler_5 = () => {
    		$$invalidate(3, print_mode = !print_mode);
    	};

    	const click_handler_6 = () => {
    		$$invalidate(10, inspector_details = false);
    	};

    	const click_handler_7 = () => {
    		$$invalidate(10, inspector_details = true);
    	};

    	const click_handler_8 = () => single_page_scroll("overview");
    	const click_handler_9 = () => single_page_scroll("report");
    	const click_handler_10 = () => single_page_scroll("events");
    	const click_handler_11 = () => single_page_scroll("witnesses");
    	const click_handler_12 = () => single_page_scroll("vehicles");
    	const click_handler_13 = () => single_page_scroll("attachments");
    	const click_handler_14 = () => single_page_scroll("links");
    	const click_handler_15 = () => single_page_scroll("claim");
    	const click_handler_16 = () => nav("ehs/incidents/incidents_new/overview");
    	const click_handler_17 = () => nav("ehs/incidents/incidents_new/report");
    	const click_handler_18 = () => nav("ehs/incidents/incidents_new/events");
    	const click_handler_19 = () => nav("ehs/incidents/incidents_new/witnesses");
    	const click_handler_20 = () => nav("ehs/incidents/incidents_new/vehicles");
    	const click_handler_21 = () => nav("ehs/incidents/incidents_new/attachments");
    	const click_handler_22 = () => nav("ehs/incidents/incidents_new/links");
    	const click_handler_23 = () => nav("ehs/incidents/incidents_new/claim");

    	function input_change_handler() {
    		print_options = get_binding_group_value($$binding_groups[0], this.__value, this.checked);
    		$$invalidate(4, print_options);
    	}

    	function input0_change_handler() {
    		censor_pii = this.checked;
    		$$invalidate(11, censor_pii);
    	}

    	function input1_change_handler() {
    		censor_mode = this.checked;
    		$$invalidate(12, censor_mode);
    	}

    	function h1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			hs[7].el = $$value;
    			$$invalidate(7, hs);
    		});
    	}

    	function h1_binding_1($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			hs[0].el = $$value;
    			$$invalidate(7, hs);
    		});
    	}

    	function h1_binding_2($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			hs[1].el = $$value;
    			$$invalidate(7, hs);
    		});
    	}

    	const click_handler_24 = () => nav("ehs/incidents/incidents_new/report");

    	function h1_binding_3($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			hs[2].el = $$value;
    			$$invalidate(7, hs);
    		});
    	}

    	const click_handler_25 = () => nav("ehs/incidents/incidents_new/report");

    	function h1_binding_4($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			hs[3].el = $$value;
    			$$invalidate(7, hs);
    		});
    	}

    	const click_handler_26 = () => nav("ehs/incidents/incidents_new/report");

    	function h1_binding_5($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			hs[4].el = $$value;
    			$$invalidate(7, hs);
    		});
    	}

    	const click_handler_27 = () => nav("ehs/incidents/incidents_new/report");

    	function h1_binding_6($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			hs[5].el = $$value;
    			$$invalidate(7, hs);
    		});
    	}

    	const click_handler_28 = () => nav("ehs/incidents/incidents_new/report");

    	function h1_binding_7($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			hs[6].el = $$value;
    			$$invalidate(7, hs);
    		});
    	}

    	const click_handler_29 = () => nav("ehs/incidents/incidents_new/report");

    	function select0_change_handler() {
    		event.event_type = select_value(this);
    		$$invalidate(17, event);
    	}

    	function input2_input_handler() {
    		event.person = this.value;
    		$$invalidate(17, event);
    	}

    	function input5_change_handler() {
    		event.medical_bool = this.checked;
    		$$invalidate(17, event);
    	}

    	function input6_change_handler() {
    		event.losttime_bool = this.checked;
    		$$invalidate(17, event);
    	}

    	const click_handler_30 = i => {
    		select_criteria_y(i, 0);
    	};

    	const click_handler_31 = (i, j) => {
    		select_criteria_x(i, j);
    	};

    	const click_handler_32 = (i, j) => {
    		matrix_pick(i, j);
    	};

    	const change_handler = (j, ev) => {
    		select_criteria_y(parseInt(ev.target.value, 8), j);
    	};

    	const change_handler_1 = (j, ev) => {
    		select_criteria_x(parseInt(ev.target.value, 8), j);
    	};

    	$$self.$$set = $$props => {
    		if ("tabnav" in $$props) $$invalidate(34, tabnav = $$props.tabnav);
    		if ("bodyScroll" in $$props) $$invalidate(35, bodyScroll = $$props.bodyScroll);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		fade,
    		fly,
    		createEventDispatcher,
    		Pullout,
    		Form,
    		Slide,
    		dispatch,
    		single_page,
    		form_test,
    		f,
    		form_text,
    		incident,
    		save_incident,
    		inspector_details,
    		censor_pii,
    		censor_mode,
    		print_mode,
    		print_options,
    		total_pages,
    		censor_it,
    		logKey,
    		filtered_pages,
    		update_payload_text,
    		date_format,
    		show_drawer,
    		mask_block,
    		mask_visible,
    		pullout,
    		add_event,
    		events,
    		event,
    		show_event_drawer,
    		hide_event_drawer,
    		tab,
    		tabnav,
    		bodyScroll,
    		nav,
    		hs,
    		single_page_scroll,
    		closest,
    		closest_el,
    		counter,
    		start_time,
    		counter_phrase,
    		getTimeDifference,
    		sub,
    		matrix,
    		matrix_holder,
    		matrix_drawer,
    		matrix_fs,
    		matrix_col_selected,
    		matrix_row_selected,
    		select_criteria_y,
    		select_criteria_x,
    		matrix_pick,
    		read_matrix,
    		matrix_cancel,
    		matrix_save,
    		vis_pages
    	});

    	$$self.$inject_state = $$props => {
    		if ("single_page" in $$props) $$invalidate(0, single_page = $$props.single_page);
    		if ("form_test" in $$props) form_test = $$props.form_test;
    		if ("f" in $$props) $$invalidate(1, f = $$props.f);
    		if ("form_text" in $$props) form_text = $$props.form_text;
    		if ("incident" in $$props) $$invalidate(2, incident = $$props.incident);
    		if ("inspector_details" in $$props) $$invalidate(10, inspector_details = $$props.inspector_details);
    		if ("censor_pii" in $$props) $$invalidate(11, censor_pii = $$props.censor_pii);
    		if ("censor_mode" in $$props) $$invalidate(12, censor_mode = $$props.censor_mode);
    		if ("print_mode" in $$props) $$invalidate(3, print_mode = $$props.print_mode);
    		if ("print_options" in $$props) $$invalidate(4, print_options = $$props.print_options);
    		if ("total_pages" in $$props) $$invalidate(93, total_pages = $$props.total_pages);
    		if ("filtered_pages" in $$props) $$invalidate(5, filtered_pages = $$props.filtered_pages);
    		if ("show_drawer" in $$props) $$invalidate(13, show_drawer = $$props.show_drawer);
    		if ("mask_block" in $$props) $$invalidate(14, mask_block = $$props.mask_block);
    		if ("mask_visible" in $$props) $$invalidate(15, mask_visible = $$props.mask_visible);
    		if ("pullout" in $$props) $$invalidate(16, pullout = $$props.pullout);
    		if ("add_event" in $$props) add_event = $$props.add_event;
    		if ("events" in $$props) events = $$props.events;
    		if ("event" in $$props) $$invalidate(17, event = $$props.event);
    		if ("tab" in $$props) $$invalidate(6, tab = $$props.tab);
    		if ("tabnav" in $$props) $$invalidate(34, tabnav = $$props.tabnav);
    		if ("bodyScroll" in $$props) $$invalidate(35, bodyScroll = $$props.bodyScroll);
    		if ("hs" in $$props) $$invalidate(7, hs = $$props.hs);
    		if ("closest" in $$props) $$invalidate(36, closest = $$props.closest);
    		if ("closest_el" in $$props) $$invalidate(8, closest_el = $$props.closest_el);
    		if ("counter" in $$props) $$invalidate(37, counter = $$props.counter);
    		if ("start_time" in $$props) start_time = $$props.start_time;
    		if ("counter_phrase" in $$props) $$invalidate(18, counter_phrase = $$props.counter_phrase);
    		if ("sub" in $$props) sub = $$props.sub;
    		if ("matrix" in $$props) $$invalidate(19, matrix = $$props.matrix);
    		if ("matrix_holder" in $$props) matrix_holder = $$props.matrix_holder;
    		if ("matrix_drawer" in $$props) $$invalidate(20, matrix_drawer = $$props.matrix_drawer);
    		if ("matrix_fs" in $$props) $$invalidate(28, matrix_fs = $$props.matrix_fs);
    		if ("matrix_col_selected" in $$props) $$invalidate(21, matrix_col_selected = $$props.matrix_col_selected);
    		if ("matrix_row_selected" in $$props) $$invalidate(22, matrix_row_selected = $$props.matrix_row_selected);
    		if ("vis_pages" in $$props) $$invalidate(9, vis_pages = $$props.vis_pages);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*f*/ 2) {
    			{
    				let daform = f;
    				form_text = JSON.stringify(daform, null, 4);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*incident*/ 4) {
    			$$invalidate(9, vis_pages = total_pages.filter(page => {
    				if (incident.id) {
    					return true;
    				} else {
    					return page.key !== "overview";
    				}
    			}));
    		}

    		if ($$self.$$.dirty[1] & /*tabnav*/ 8) {
    			{
    				let t = tabnav;

    				if (tabnav !== "") {
    					$$invalidate(6, tab = t);
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*incident, vis_pages, tab, single_page, print_mode, filtered_pages, print_options*/ 637) {
    			{
    				//triggers
    				incident.id;
    				let t = tab;
    				let s = single_page;
    				let p = print_mode;
    				$$invalidate(5, filtered_pages = vis_pages.map(({ key }) => key));

    				if (!s && !p) {
    					//single page view
    					$$invalidate(5, filtered_pages = filtered_pages.filter(page => {
    						return page == t;
    					}));
    				}

    				if (p) {
    					//if in print mode only show the ones that selected to print
    					$$invalidate(5, filtered_pages = filtered_pages.filter(page => {
    						return print_options.indexOf(page) >= 0;
    					}));
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*single_page, hs, closest_el*/ 385 | $$self.$$.dirty[1] & /*bodyScroll, closest*/ 48) {
    			{
    				let s = bodyScroll;
    				let t = window.innerHeight / 2.5; //target position third way down page

    				if (single_page) {
    					$$invalidate(36, closest = false);
    					let temp = false;

    					hs.forEach(h => {
    						if (h.el) {
    							let delta = Math.abs(s + t - h.el.offsetTop);

    							if (delta < closest || closest === false) {
    								$$invalidate(36, closest = delta);
    								temp = h;
    							}
    						}
    					});

    					if (closest_el !== temp) {
    						window.location.hash = "ehs/incidents/incidents_new/" + temp.key;
    						$$invalidate(8, closest_el = temp);
    					}
    				}
    			}
    		}

    		if ($$self.$$.dirty[1] & /*counter*/ 64) {
    			{
    				let c = counter;
    				let timeObject = getTimeDifference(c);
    				let time = "";

    				if (timeObject.year > 0) {
    					time += timeObject.year;
    					time += timeObject.year === 1 ? " Year " : " Years ";
    				}

    				if (timeObject.month > 0) {
    					time += timeObject.month;
    					time += timeObject.month === 1 ? " Month " : " Months ";
    				}

    				if (timeObject.day > 0) {
    					time += timeObject.day;
    					time += timeObject.day === 1 ? " Day " : " Days ";
    				}

    				if (timeObject.hour > 0) {
    					time += timeObject.hour;
    					time += timeObject.hour === 1 ? " Hour " : " Hours ";
    				}

    				if (timeObject.minute > 0) {
    					time += timeObject.minute;
    					time += timeObject.minute === 1 ? " Minute " : " Minutes ";
    				}

    				if (timeObject.second > 0) {
    					time += timeObject.second;
    					time += timeObject.second === 1 ? " Second " : " Seconds ";
    				}

    				$$invalidate(18, counter_phrase = time);
    			}
    		}
    	};

    	return [
    		single_page,
    		f,
    		incident,
    		print_mode,
    		print_options,
    		filtered_pages,
    		tab,
    		hs,
    		closest_el,
    		vis_pages,
    		inspector_details,
    		censor_pii,
    		censor_mode,
    		show_drawer,
    		mask_block,
    		mask_visible,
    		pullout,
    		event,
    		counter_phrase,
    		matrix,
    		matrix_drawer,
    		matrix_col_selected,
    		matrix_row_selected,
    		save_incident,
    		show_event_drawer,
    		hide_event_drawer,
    		nav,
    		single_page_scroll,
    		matrix_fs,
    		select_criteria_y,
    		select_criteria_x,
    		matrix_pick,
    		matrix_cancel,
    		matrix_save,
    		tabnav,
    		bodyScroll,
    		closest,
    		counter,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5,
    		click_handler_6,
    		click_handler_7,
    		click_handler_8,
    		click_handler_9,
    		click_handler_10,
    		click_handler_11,
    		click_handler_12,
    		click_handler_13,
    		click_handler_14,
    		click_handler_15,
    		click_handler_16,
    		click_handler_17,
    		click_handler_18,
    		click_handler_19,
    		click_handler_20,
    		click_handler_21,
    		click_handler_22,
    		click_handler_23,
    		input_change_handler,
    		$$binding_groups,
    		input0_change_handler,
    		input1_change_handler,
    		h1_binding,
    		h1_binding_1,
    		h1_binding_2,
    		click_handler_24,
    		h1_binding_3,
    		click_handler_25,
    		h1_binding_4,
    		click_handler_26,
    		h1_binding_5,
    		click_handler_27,
    		h1_binding_6,
    		click_handler_28,
    		h1_binding_7,
    		click_handler_29,
    		select0_change_handler,
    		input2_input_handler,
    		input5_change_handler,
    		input6_change_handler,
    		click_handler_30,
    		click_handler_31,
    		click_handler_32,
    		change_handler,
    		change_handler_1
    	];
    }

    class Frame_incidents_new extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { tabnav: 34, bodyScroll: 35 }, [-1, -1, -1, -1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Frame_incidents_new",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get tabnav() {
    		throw new Error("<Frame_incidents_new>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tabnav(value) {
    		throw new Error("<Frame_incidents_new>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bodyScroll() {
    		throw new Error("<Frame_incidents_new>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bodyScroll(value) {
    		throw new Error("<Frame_incidents_new>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
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
    const file$6 = "node_modules/svelte-qrcode/src/lib/index.svelte";

    function create_fragment$6(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = /*image*/ ctx[2])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", /*value*/ ctx[0]);
    			attr_dev(img, "class", /*className*/ ctx[1]);
    			add_location(img, file$6, 41, 0, 681);
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
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
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

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
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
    			id: create_fragment$6.name
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

    /* src/Frame_incidents_admin.svelte generated by Svelte v3.35.0 */

    const { console: console_1$2 } = globals;
    const file$5 = "src/Frame_incidents_admin.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[30] = list[i];
    	return child_ctx;
    }

    // (488:29) 
    function create_if_block_4(ctx) {
    	let div1;
    	let div0;
    	let h2;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Response Lists";
    			add_location(h2, file$5, 490, 8, 22355);
    			attr_dev(div0, "class", "col12");
    			add_location(div0, file$5, 489, 8, 22327);
    			attr_dev(div1, "class", "row");
    			add_location(div1, file$5, 488, 4, 22301);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, h2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(488:29) ",
    		ctx
    	});

    	return block;
    }

    // (482:33) 
    function create_if_block_3(ctx) {
    	let div1;
    	let div0;
    	let h2;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Templates";
    			add_location(h2, file$5, 484, 8, 22222);
    			attr_dev(div0, "class", "col12");
    			add_location(div0, file$5, 483, 8, 22194);
    			attr_dev(div1, "class", "row");
    			add_location(div1, file$5, 482, 4, 22168);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, h2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(482:33) ",
    		ctx
    	});

    	return block;
    }

    // (382:0) {#if tab == 'qrcodes'}
    function create_if_block$2(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block_1$1, create_if_block_2$1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*new_qr*/ ctx[1]) return 0;
    		if (/*qrs*/ ctx[3].length) return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "row");
    			add_location(div, file$5, 396, 4, 15744);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(382:0) {#if tab == 'qrcodes'}",
    		ctx
    	});

    	return block;
    }

    // (459:12) {:else}
    function create_else_block$1(ctx) {
    	let div0;
    	let t0;
    	let div3;
    	let h2;
    	let t2;
    	let div2;
    	let div1;
    	let svg;
    	let path0;
    	let path1;
    	let path2;
    	let t3;
    	let h1;
    	let t5;
    	let p;
    	let t7;
    	let a;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			div3 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Quick Report QR Codes";
    			t2 = space();
    			div2 = element("div");
    			div1 = element("div");
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			t3 = space();
    			h1 = element("h1");
    			h1.textContent = "Create your first QR code for rapid reporting";
    			t5 = space();
    			p = element("p");
    			p.textContent = "By configuring a QR code your company can make reporting incidents faster & easier.";
    			t7 = space();
    			a = element("a");
    			a.textContent = "Add QR Code";
    			attr_dev(div0, "class", "col3 d960up-block");
    			add_location(div0, file$5, 459, 16, 19268);
    			add_location(h2, file$5, 461, 20, 19371);
    			attr_dev(path0, "d", "M61.7604 16.2498C62.8904 16.6598 63.4704 17.9198 63.0604 19.0398L50.4104 53.8098C49.1704 57.2198 47.5504 60.3698 45.6104 63.2498C43.2404 62.8398 40.8704 62.2198 38.5304 61.3598C17.4404 53.6898 6.56045 30.3498 14.2404 9.2498C15.3804 6.1198 16.8704 3.2098 18.6404 0.549805L61.7604 16.2498Z");
    			attr_dev(path0, "fill", "#D1F2FA");
    			add_location(path0, file$5, 466, 32, 19685);
    			attr_dev(path1, "d", "M24.04 35.2401C27.86 37.4801 30.54 40.9701 31.85 44.9001L27.7 52.2201C23.29 59.9701 14.3 63.3501 6.22 60.8801C6.08 60.8301 5.96 60.7601 5.85 60.6601C2.08 57.0701 0.02 52.0701 0 46.9601L0.02 45.7001C0.02 44.8101 0.16 43.8001 0.43 42.6501C0.63 41.8001 0.91 40.9101 1.25 40.0401C6.47 32.8701 16.26 30.6701 24.04 35.2401Z");
    			attr_dev(path1, "fill", "#EB6047");
    			add_location(path1, file$5, 467, 32, 20032);
    			attr_dev(path2, "fill-rule", "evenodd");
    			attr_dev(path2, "clip-rule", "evenodd");
    			attr_dev(path2, "d", "M53.21 20.54H56.49V8.5C56.49 7.94 56.05 7.5 55.49 7.5H43.37V10.76H53.21V20.54ZM10.78 20.63H7.5V8.59C7.5 8.04 7.94 7.59 8.5 7.59H20.62V10.85H10.78V20.63ZM7.5 55.5C7.5 56.05 7.94 56.5 8.5 56.5H20.62V53.23H10.78V43.45H7.5V55.5ZM55.49 56.4C56.05 56.4 56.49 55.95 56.49 55.4V43.36H53.21V53.14H43.37V56.4H55.49ZM17.12 27.7C16.64 27.7 16.25 27.31 16.25 26.83V17.12C16.25 16.64 16.64 16.25 17.12 16.25H26.83C27.31 16.25 27.7 16.64 27.7 17.12V26.83C27.7 27.31 27.31 27.7 26.83 27.7H17.12ZM24.84 19.11H19.11V24.84H24.84V19.11ZM47.75 17.12C47.75 16.64 47.35 16.25 46.87 16.25H37.16C36.68 16.25 36.29 16.64 36.29 17.12V26.83C36.29 27.31 36.68 27.7 37.16 27.7H46.87C47.35 27.7 47.75 27.31 47.75 26.83V17.12ZM44.88 24.84H39.15V19.11H44.88V24.84ZM26.83 36.29C27.31 36.29 27.7 36.68 27.7 37.16V46.87C27.7 47.35 27.31 47.75 26.83 47.75H17.12C16.64 47.75 16.25 47.35 16.25 46.87V37.16C16.25 36.68 16.64 36.29 17.12 36.29H26.83ZM19.11 44.88H24.84V39.15H19.11V44.88ZM33.43 30.56H47.75V33.43H33.43V47.75H30.56V33.43H16.25V30.56H30.56V16.25H33.43V30.56ZM47.75 36.29H37.16C36.68 36.29 36.29 36.68 36.29 37.16V47.75H39.15V39.15H47.75V36.29ZM44.88 41.42H42.02V47.75H44.88V41.42Z");
    			attr_dev(path2, "fill", "#1A1919");
    			add_location(path2, file$5, 468, 32, 20409);
    			attr_dev(svg, "class", "mt2 mb1");
    			attr_dev(svg, "width", "128");
    			attr_dev(svg, "height", "128");
    			attr_dev(svg, "viewBox", "0 0 64 64");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$5, 465, 28, 19539);
    			add_location(h1, file$5, 470, 28, 21697);
    			add_location(p, file$5, 471, 28, 21780);
    			attr_dev(a, "href", "#");
    			attr_dev(a, "class", "btn mt2 mb2");
    			add_location(a, file$5, 472, 28, 21899);
    			attr_dev(div1, "class", "card-body text-center");
    			add_location(div1, file$5, 464, 24, 19475);
    			attr_dev(div2, "class", "card");
    			add_location(div2, file$5, 462, 20, 19431);
    			attr_dev(div3, "class", "col12 col-md-6");
    			add_location(div3, file$5, 460, 16, 19322);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, h2);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, svg);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(svg, path2);
    			append_dev(div1, t3);
    			append_dev(div1, h1);
    			append_dev(div1, t5);
    			append_dev(div1, p);
    			append_dev(div1, t7);
    			append_dev(div1, a);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", prevent_default(/*click_handler_14*/ ctx[25]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div3);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(459:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (421:12) {#if qrs.length}
    function create_if_block_2$1(ctx) {
    	let div3;
    	let a;
    	let t1;
    	let h2;
    	let t3;
    	let div2;
    	let table;
    	let thead;
    	let tr;
    	let th0;
    	let t5;
    	let th1;
    	let t7;
    	let th2;
    	let t9;
    	let th3;
    	let t11;
    	let th4;
    	let t13;
    	let th5;
    	let t15;
    	let tbody;
    	let t16;
    	let div1;
    	let div0;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*qrs*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			a = element("a");
    			a.textContent = "Add QR Code";
    			t1 = space();
    			h2 = element("h2");
    			h2.textContent = "Quick Report QR Codes";
    			t3 = space();
    			div2 = element("div");
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "Record ID";
    			t5 = space();
    			th1 = element("th");
    			th1.textContent = "Uses";
    			t7 = space();
    			th2 = element("th");
    			th2.textContent = "Created By";
    			t9 = space();
    			th3 = element("th");
    			th3.textContent = "Creation Date";
    			t11 = space();
    			th4 = element("th");
    			th4.textContent = "Location";
    			t13 = space();
    			th5 = element("th");
    			th5.textContent = "Actions";
    			t15 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t16 = space();
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "btn btn-right mt1");
    			add_location(a, file$5, 422, 20, 16890);
    			add_location(h2, file$5, 423, 20, 17017);
    			add_location(th0, file$5, 428, 36, 17261);
    			add_location(th1, file$5, 429, 36, 17316);
    			add_location(th2, file$5, 430, 36, 17366);
    			add_location(th3, file$5, 431, 36, 17422);
    			add_location(th4, file$5, 432, 36, 17481);
    			add_location(th5, file$5, 433, 36, 17535);
    			add_location(tr, file$5, 427, 32, 17220);
    			add_location(thead, file$5, 426, 28, 17180);
    			add_location(tbody, file$5, 437, 28, 17692);
    			attr_dev(table, "class", "table");
    			add_location(table, file$5, 425, 24, 17130);
    			attr_dev(div0, "class", "pagination");
    			add_location(div0, file$5, 455, 56, 19144);
    			attr_dev(div1, "class", "pagination-wrapper");
    			add_location(div1, file$5, 455, 24, 19112);
    			attr_dev(div2, "class", "sticky-wrapper svelte-3zptin");
    			add_location(div2, file$5, 424, 20, 17077);
    			attr_dev(div3, "class", "col12 col-9-md");
    			add_location(div3, file$5, 421, 16, 16841);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, a);
    			append_dev(div3, t1);
    			append_dev(div3, h2);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			append_dev(div2, table);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t5);
    			append_dev(tr, th1);
    			append_dev(tr, t7);
    			append_dev(tr, th2);
    			append_dev(tr, t9);
    			append_dev(tr, th3);
    			append_dev(tr, t11);
    			append_dev(tr, th4);
    			append_dev(tr, t13);
    			append_dev(tr, th5);
    			append_dev(table, t15);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			append_dev(div2, t16);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(a, "click", prevent_default(/*click_handler_9*/ ctx[20]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*nav, qrs, components*/ 280) {
    				each_value = /*qrs*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(421:12) {#if qrs.length}",
    		ctx
    	});

    	return block;
    }

    // (398:8) {#if new_qr}
    function create_if_block_1$1(ctx) {
    	let div0;
    	let t0;
    	let div1;
    	let h20;
    	let t2;
    	let form;
    	let t3;
    	let a0;
    	let t5;
    	let a1;
    	let t7;
    	let div6;
    	let div5;
    	let h21;
    	let t9;
    	let div4;
    	let div3;
    	let h3;
    	let t11;
    	let div2;
    	let qrcode;
    	let current;
    	let mounted;
    	let dispose;

    	form = new Form({
    			props: {
    				f: /*f*/ ctx[6],
    				channel: /*channel*/ ctx[5]
    			},
    			$$inline: true
    		});

    	qrcode = new Lib({
    			props: { value: /*value*/ ctx[2] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			h20 = element("h2");
    			h20.textContent = "New Quick Report QR Code";
    			t2 = space();
    			create_component(form.$$.fragment);
    			t3 = space();
    			a0 = element("a");
    			a0.textContent = "Save QR code";
    			t5 = space();
    			a1 = element("a");
    			a1.textContent = "Cancel";
    			t7 = space();
    			div6 = element("div");
    			div5 = element("div");
    			h21 = element("h2");
    			h21.textContent = " ";
    			t9 = space();
    			div4 = element("div");
    			div3 = element("div");
    			h3 = element("h3");
    			h3.textContent = "QR test";
    			t11 = space();
    			div2 = element("div");
    			create_component(qrcode.$$.fragment);
    			attr_dev(div0, "class", "col3 d960up-block");
    			add_location(div0, file$5, 398, 8, 15791);
    			add_location(h20, file$5, 400, 16, 15886);
    			attr_dev(a0, "href", "#");
    			attr_dev(a0, "class", "btn mb2");
    			add_location(a0, file$5, 402, 16, 15989);
    			attr_dev(a1, "href", "#");
    			attr_dev(a1, "class", "btn btn-secondary mb2");
    			add_location(a1, file$5, 403, 16, 16123);
    			attr_dev(div1, "class", "col12 col-md-6");
    			add_location(div1, file$5, 399, 12, 15841);
    			add_location(h21, file$5, 407, 20, 16367);
    			set_style(h3, "font-weight", "100");
    			set_style(h3, "font-size", "20px");
    			add_location(h3, file$5, 410, 28, 16498);
    			attr_dev(div2, "class", "text-center mb2 mt2");
    			add_location(div2, file$5, 412, 28, 16607);
    			attr_dev(div3, "class", "card-body");
    			add_location(div3, file$5, 409, 24, 16446);
    			attr_dev(div4, "class", "card");
    			add_location(div4, file$5, 408, 20, 16403);
    			set_style(div5, "position", "sticky");
    			set_style(div5, "top", "0px");
    			add_location(div5, file$5, 406, 16, 16307);
    			attr_dev(div6, "class", "col3 d960up-block");
    			add_location(div6, file$5, 405, 12, 16259);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h20);
    			append_dev(div1, t2);
    			mount_component(form, div1, null);
    			append_dev(div1, t3);
    			append_dev(div1, a0);
    			append_dev(div1, t5);
    			append_dev(div1, a1);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div5);
    			append_dev(div5, h21);
    			append_dev(div5, t9);
    			append_dev(div5, div4);
    			append_dev(div4, div3);
    			append_dev(div3, h3);
    			append_dev(div3, t11);
    			append_dev(div3, div2);
    			mount_component(qrcode, div2, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(a0, "click", prevent_default(/*click_handler_7*/ ctx[18]), false, true, false),
    					listen_dev(a1, "click", prevent_default(/*click_handler_8*/ ctx[19]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const qrcode_changes = {};
    			if (dirty[0] & /*value*/ 4) qrcode_changes.value = /*value*/ ctx[2];
    			qrcode.$set(qrcode_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(form.$$.fragment, local);
    			transition_in(qrcode.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(form.$$.fragment, local);
    			transition_out(qrcode.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			destroy_component(form);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(div6);
    			destroy_component(qrcode);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(398:8) {#if new_qr}",
    		ctx
    	});

    	return block;
    }

    // (439:32) {#each qrs as row}
    function create_each_block$1(ctx) {
    	let tr;
    	let td0;
    	let switch_instance0;
    	let t0;
    	let td1;
    	let t1_value = /*row*/ ctx[30].use_count + "";
    	let t1;
    	let t2;
    	let td2;
    	let t3_value = /*row*/ ctx[30].created_by + "";
    	let t3;
    	let t4;
    	let td3;
    	let switch_instance1;
    	let t5;
    	let td4;

    	let t6_value = (/*row*/ ctx[30].location
    	? /*row*/ ctx[30].location
    	: "Not specified") + "";

    	let t6;
    	let t7;
    	let td5;
    	let a0;
    	let t8;
    	let a1;
    	let t9;
    	let a2;
    	let t10;
    	let a3;
    	let t11;
    	let current;
    	let mounted;
    	let dispose;
    	var switch_value = /*components*/ ctx[4].record_id;

    	function switch_props(ctx) {
    		return {
    			props: { obj: /*row*/ ctx[30].record_id },
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance0 = new switch_value(switch_props(ctx));
    	}

    	var switch_value_1 = /*components*/ ctx[4].created_date;

    	function switch_props_1(ctx) {
    		return {
    			props: { obj: /*row*/ ctx[30].created_date },
    			$$inline: true
    		};
    	}

    	if (switch_value_1) {
    		switch_instance1 = new switch_value_1(switch_props_1(ctx));
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			if (switch_instance0) create_component(switch_instance0.$$.fragment);
    			t0 = space();
    			td1 = element("td");
    			t1 = text(t1_value);
    			t2 = space();
    			td2 = element("td");
    			t3 = text(t3_value);
    			t4 = space();
    			td3 = element("td");
    			if (switch_instance1) create_component(switch_instance1.$$.fragment);
    			t5 = space();
    			td4 = element("td");
    			t6 = text(t6_value);
    			t7 = space();
    			td5 = element("td");
    			a0 = element("a");
    			t8 = space();
    			a1 = element("a");
    			t9 = space();
    			a2 = element("a");
    			t10 = space();
    			a3 = element("a");
    			t11 = space();
    			add_location(td0, file$5, 440, 40, 17832);
    			add_location(td1, file$5, 441, 40, 17950);
    			add_location(td2, file$5, 442, 40, 18015);
    			add_location(td3, file$5, 443, 40, 18081);
    			add_location(td4, file$5, 444, 40, 18205);
    			attr_dev(a0, "href", "#ehs/incidents/");
    			attr_dev(a0, "class", "btn-right i-trash i-24 ml2");
    			add_location(a0, file$5, 446, 44, 18351);
    			attr_dev(a1, "href", "#ehs/incidents/");
    			attr_dev(a1, "class", "btn-right i-qr i-24");
    			add_location(a1, file$5, 447, 44, 18501);
    			attr_dev(a2, "href", "#ehs/incidents/");
    			attr_dev(a2, "class", "btn-right i-edit i-24");
    			add_location(a2, file$5, 448, 44, 18644);
    			attr_dev(a3, "href", "#ehs/incidents/");
    			attr_dev(a3, "class", "btn-right i-link i-24");
    			add_location(a3, file$5, 449, 44, 18789);
    			add_location(td5, file$5, 445, 40, 18302);
    			add_location(tr, file$5, 439, 36, 17787);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);

    			if (switch_instance0) {
    				mount_component(switch_instance0, td0, null);
    			}

    			append_dev(tr, t0);
    			append_dev(tr, td1);
    			append_dev(td1, t1);
    			append_dev(tr, t2);
    			append_dev(tr, td2);
    			append_dev(td2, t3);
    			append_dev(tr, t4);
    			append_dev(tr, td3);

    			if (switch_instance1) {
    				mount_component(switch_instance1, td3, null);
    			}

    			append_dev(tr, t5);
    			append_dev(tr, td4);
    			append_dev(td4, t6);
    			append_dev(tr, t7);
    			append_dev(tr, td5);
    			append_dev(td5, a0);
    			append_dev(td5, t8);
    			append_dev(td5, a1);
    			append_dev(td5, t9);
    			append_dev(td5, a2);
    			append_dev(td5, t10);
    			append_dev(td5, a3);
    			append_dev(tr, t11);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(a0, "click", /*click_handler_10*/ ctx[21], false, false, false),
    					listen_dev(a1, "click", /*click_handler_11*/ ctx[22], false, false, false),
    					listen_dev(a2, "click", /*click_handler_12*/ ctx[23], false, false, false),
    					listen_dev(a3, "click", /*click_handler_13*/ ctx[24], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance0_changes = {};
    			if (dirty[0] & /*qrs*/ 8) switch_instance0_changes.obj = /*row*/ ctx[30].record_id;

    			if (switch_value !== (switch_value = /*components*/ ctx[4].record_id)) {
    				if (switch_instance0) {
    					group_outros();
    					const old_component = switch_instance0;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance0 = new switch_value(switch_props(ctx));
    					create_component(switch_instance0.$$.fragment);
    					transition_in(switch_instance0.$$.fragment, 1);
    					mount_component(switch_instance0, td0, null);
    				} else {
    					switch_instance0 = null;
    				}
    			} else if (switch_value) {
    				switch_instance0.$set(switch_instance0_changes);
    			}

    			if ((!current || dirty[0] & /*qrs*/ 8) && t1_value !== (t1_value = /*row*/ ctx[30].use_count + "")) set_data_dev(t1, t1_value);
    			if ((!current || dirty[0] & /*qrs*/ 8) && t3_value !== (t3_value = /*row*/ ctx[30].created_by + "")) set_data_dev(t3, t3_value);
    			const switch_instance1_changes = {};
    			if (dirty[0] & /*qrs*/ 8) switch_instance1_changes.obj = /*row*/ ctx[30].created_date;

    			if (switch_value_1 !== (switch_value_1 = /*components*/ ctx[4].created_date)) {
    				if (switch_instance1) {
    					group_outros();
    					const old_component = switch_instance1;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value_1) {
    					switch_instance1 = new switch_value_1(switch_props_1(ctx));
    					create_component(switch_instance1.$$.fragment);
    					transition_in(switch_instance1.$$.fragment, 1);
    					mount_component(switch_instance1, td3, null);
    				} else {
    					switch_instance1 = null;
    				}
    			} else if (switch_value_1) {
    				switch_instance1.$set(switch_instance1_changes);
    			}

    			if ((!current || dirty[0] & /*qrs*/ 8) && t6_value !== (t6_value = (/*row*/ ctx[30].location
    			? /*row*/ ctx[30].location
    			: "Not specified") + "")) set_data_dev(t6, t6_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance0) transition_in(switch_instance0.$$.fragment, local);
    			if (switch_instance1) transition_in(switch_instance1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance0) transition_out(switch_instance0.$$.fragment, local);
    			if (switch_instance1) transition_out(switch_instance1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			if (switch_instance0) destroy_component(switch_instance0);
    			if (switch_instance1) destroy_component(switch_instance1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(439:32) {#each qrs as row}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div1;
    	let div0;
    	let ul0;
    	let li0;
    	let a0;
    	let t1;
    	let li1;
    	let a1;
    	let t3;
    	let li2;
    	let a2;
    	let t5;
    	let li3;
    	let t7;
    	let h1;
    	let i;
    	let t8;
    	let t9;
    	let ul1;
    	let li4;
    	let a3;
    	let t11;
    	let li5;
    	let a4;
    	let t13;
    	let li6;
    	let a5;
    	let t15;
    	let li7;
    	let a6;
    	let t17;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block$2, create_if_block_3, create_if_block_4];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*tab*/ ctx[0] == "qrcodes") return 0;
    		if (/*tab*/ ctx[0] == "templates") return 1;
    		if (/*tab*/ ctx[0] == "lists") return 2;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			ul0 = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			a0.textContent = "EcoOnline";
    			t1 = space();
    			li1 = element("li");
    			a1 = element("a");
    			a1.textContent = "EHS";
    			t3 = space();
    			li2 = element("li");
    			a2 = element("a");
    			a2.textContent = "Incidents";
    			t5 = space();
    			li3 = element("li");
    			li3.textContent = "Incidents Admin";
    			t7 = space();
    			h1 = element("h1");
    			i = element("i");
    			t8 = text("Incidents Admin");
    			t9 = space();
    			ul1 = element("ul");
    			li4 = element("li");
    			a3 = element("a");
    			a3.textContent = "Overview";
    			t11 = space();
    			li5 = element("li");
    			a4 = element("a");
    			a4.textContent = "Query";
    			t13 = space();
    			li6 = element("li");
    			a5 = element("a");
    			a5.textContent = "Summary";
    			t15 = space();
    			li7 = element("li");
    			a6 = element("a");
    			a6.textContent = "Admin";
    			t17 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(a0, "href", "#platform");
    			attr_dev(a0, "class", "svelte-3zptin");
    			add_location(a0, file$5, 340, 16, 12308);
    			attr_dev(li0, "class", "svelte-3zptin");
    			add_location(li0, file$5, 340, 12, 12304);
    			attr_dev(a1, "href", "#ehs");
    			attr_dev(a1, "class", "svelte-3zptin");
    			add_location(a1, file$5, 341, 16, 12401);
    			attr_dev(li1, "class", "svelte-3zptin");
    			add_location(li1, file$5, 341, 12, 12397);
    			attr_dev(a2, "href", "#ehs/incidents");
    			attr_dev(a2, "class", "svelte-3zptin");
    			add_location(a2, file$5, 342, 16, 12478);
    			attr_dev(li2, "class", "svelte-3zptin");
    			add_location(li2, file$5, 342, 12, 12474);
    			add_location(li3, file$5, 343, 12, 12573);
    			attr_dev(ul0, "class", "breadcrumb");
    			add_location(ul0, file$5, 339, 8, 12268);
    			attr_dev(div0, "class", "col12 col-sm-6");
    			add_location(div0, file$5, 338, 4, 12231);
    			attr_dev(div1, "class", "row sticky");
    			add_location(div1, file$5, 337, 0, 12202);
    			attr_dev(i, "class", "i-tool i-32");
    			add_location(i, file$5, 367, 23, 13986);
    			attr_dev(h1, "class", "page-title");
    			add_location(h1, file$5, 367, 0, 13963);
    			attr_dev(a3, "href", "#ehs/incidents/overview");
    			attr_dev(a3, "class", "svelte-3zptin");
    			toggle_class(a3, "active", /*tab*/ ctx[0] == "overview");
    			add_location(a3, file$5, 369, 8, 14060);
    			attr_dev(li4, "class", "svelte-3zptin");
    			add_location(li4, file$5, 369, 4, 14056);
    			attr_dev(a4, "href", "#ehs/incidents/queries_new");
    			attr_dev(a4, "class", "svelte-3zptin");
    			toggle_class(a4, "active", /*tab*/ ctx[0] == "query");
    			add_location(a4, file$5, 370, 8, 14197);
    			attr_dev(li5, "class", "svelte-3zptin");
    			add_location(li5, file$5, 370, 4, 14193);
    			attr_dev(a5, "href", "#ehs/incidents/summary");
    			attr_dev(a5, "class", "svelte-3zptin");
    			toggle_class(a5, "active", /*tab*/ ctx[0] == "summary");
    			add_location(a5, file$5, 371, 8, 14334);
    			attr_dev(li6, "class", "svelte-3zptin");
    			add_location(li6, file$5, 371, 4, 14330);
    			attr_dev(a6, "href", "#ehs/incidents/admin");
    			attr_dev(a6, "class", "active svelte-3zptin");
    			add_location(a6, file$5, 372, 8, 14468);
    			attr_dev(li7, "class", "svelte-3zptin");
    			add_location(li7, file$5, 372, 4, 14464);
    			attr_dev(ul1, "class", "tabs");
    			add_location(ul1, file$5, 368, 0, 14034);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, ul0);
    			append_dev(ul0, li0);
    			append_dev(li0, a0);
    			append_dev(ul0, t1);
    			append_dev(ul0, li1);
    			append_dev(li1, a1);
    			append_dev(ul0, t3);
    			append_dev(ul0, li2);
    			append_dev(li2, a2);
    			append_dev(ul0, t5);
    			append_dev(ul0, li3);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, h1, anchor);
    			append_dev(h1, i);
    			append_dev(h1, t8);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, ul1, anchor);
    			append_dev(ul1, li4);
    			append_dev(li4, a3);
    			append_dev(ul1, t11);
    			append_dev(ul1, li5);
    			append_dev(li5, a4);
    			append_dev(ul1, t13);
    			append_dev(ul1, li6);
    			append_dev(li6, a5);
    			append_dev(ul1, t15);
    			append_dev(ul1, li7);
    			append_dev(li7, a6);
    			insert_dev(target, t17, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(a0, "click", /*click_handler*/ ctx[11], false, false, false),
    					listen_dev(a1, "click", /*click_handler_1*/ ctx[12], false, false, false),
    					listen_dev(a2, "click", /*click_handler_2*/ ctx[13], false, false, false),
    					listen_dev(a3, "click", /*click_handler_3*/ ctx[14], false, false, false),
    					listen_dev(a4, "click", /*click_handler_4*/ ctx[15], false, false, false),
    					listen_dev(a5, "click", /*click_handler_5*/ ctx[16], false, false, false),
    					listen_dev(a6, "click", /*click_handler_6*/ ctx[17], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*tab*/ 1) {
    				toggle_class(a3, "active", /*tab*/ ctx[0] == "overview");
    			}

    			if (dirty[0] & /*tab*/ 1) {
    				toggle_class(a4, "active", /*tab*/ ctx[0] == "query");
    			}

    			if (dirty[0] & /*tab*/ 1) {
    				toggle_class(a5, "active", /*tab*/ ctx[0] == "summary");
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(ul1);
    			if (detaching) detach_dev(t17);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function strip(arr) {
    	let temp = [];

    	arr.forEach(item => {
    		let temp_obj = {
    			id: item.id,
    			answer: item.answer,
    			options: item.options ? [item.options[0]] : []
    		};

    		if (item.children) {
    			temp_obj.children = strip(item.children);
    		}

    		temp.push(temp_obj);
    	});

    	return temp;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Frame_incidents_admin", slots, []);

    	let components = {
    		"record_id": RecordID,
    		"status": Status,
    		"channel": Channel,
    		"created_date": Date_1
    	};

    	const dispatch = createEventDispatcher();
    	let tab = "qrcodes";
    	let { tabnav = "" } = $$props;
    	let channel = "QR";
    	let sub = pubsub.subscribe(channel, read_answer);

    	function read_answer(msg, data) {
    		$$invalidate(10, fx = strip(f));
    		console.log("f updated", msg, data);
    	}

    	let new_qr = false;

    	let f = [
    		{
    			item_type: "section",
    			label: "Prefilled details",
    			children: [
    				{
    					item_type: "input_lookup",
    					id: "0_1",
    					label: "Site",
    					hint: "You can pre-define this QR for a particular site or leave blank to be filled in by the reporter",
    					placeholder: "Click or type to select...",
    					options: [
    						{
    							"key": "a",
    							"value": "England",
    							"selectable": true,
    							"selected": false,
    							"children": [
    								{
    									"key": "aa",
    									"value": "London HQ",
    									"selectable": true,
    									"selected": false,
    									"children": [
    										{
    											"key": "aaa",
    											"value": "Main Office",
    											"selectable": true,
    											"selected": false
    										}
    									]
    								}
    							]
    						},
    						{
    							"key": "a",
    							"value": "Ireland",
    							"selectable": true,
    							"selected": false,
    							"children": [
    								{
    									"key": "aa",
    									"value": "Dublin HQ",
    									"selectable": true,
    									"selected": false,
    									"children": [
    										{
    											"key": "aaa",
    											"value": "Main Office",
    											"selectable": true,
    											"selected": false
    										},
    										{
    											"key": "aab",
    											"value": "Warehouse",
    											"selectable": true,
    											"selected": false
    										}
    									]
    								},
    								{
    									"key": "ab",
    									"value": "Galway Shipping",
    									"selectable": true,
    									"selected": false,
    									"children": [
    										{
    											"key": "aba",
    											"value": "Main Office",
    											"selectable": true,
    											"selected": false
    										},
    										{
    											"key": "abb",
    											"value": "Packing bay",
    											"selectable": true,
    											"selected": false
    										}
    									]
    								}
    							]
    						}
    					],
    					answer: ""
    				},
    				{
    					item_type: "input_switch",
    					id: "0_2",
    					label: "",
    					clamp: true,
    					options: [
    						{
    							value: false,
    							text: "Allow user to say “I don’t know”"
    						}
    					]
    				},
    				{
    					item_type: "input_switch",
    					id: "0_3",
    					label: "",
    					clamp: true,
    					options: [
    						{
    							value: false,
    							text: "Add ‘specific location’ eg reporter can type “By the stairs”"
    						}
    					]
    				},
    				{
    					item_type: "input_multi",
    					id: "04",
    					label: "What type of incidents are permitted?",
    					hint: "You can enable all event types or just a sub-set for this QR",
    					options: [
    						{
    							"key": "nearmiss",
    							"value": "Near Miss",
    							"selectable": true,
    							"selected": true,
    							"pii": false,
    							"sortable": true,
    							"sorted": "desc"
    						},
    						{
    							"key": "hazard",
    							"value": "Hazard",
    							"selectable": true,
    							"selected": true,
    							"pii": false,
    							"sortable": true,
    							"sorted": "desc"
    						},
    						{
    							"key": "slip",
    							"value": "Slip Trip & Fall",
    							"selectable": true,
    							"selected": true,
    							"pii": false,
    							"sortable": true,
    							"sorted": "desc"
    						},
    						{
    							"key": "vehicle",
    							"value": "Vehicle Accident",
    							"selectable": true,
    							"selected": false,
    							"pii": false,
    							"sortable": true,
    							"sorted": "desc"
    						},
    						{
    							"key": "fatality",
    							"value": "Fatal Accident",
    							"selectable": true,
    							"selected": false,
    							"pii": false,
    							"sortable": true,
    							"sorted": "desc"
    						}
    					],
    					answer: ""
    				},
    				{
    					item_type: "input_switch",
    					id: "0_5",
    					label: "",
    					clamp: true,
    					options: [
    						{
    							value: false,
    							text: "Allow user to say “I don’t know”"
    						}
    					]
    				},
    				{
    					item_type: "input_text",
    					id: "0_8",
    					label: "Who is reporting?",
    					hint: false,
    					placeholder: "Click or type to select...",
    					options: [
    						{ value: "", text: "Select one" },
    						{ value: "PP", text: "Passport" },
    						{ value: "ID", text: "National ID" }
    					],
    					answer: ""
    				},
    				{
    					item_type: "input_switch",
    					id: "0_9",
    					label: "",
    					clamp: true,
    					options: [
    						{
    							value: false,
    							text: "Allow anonymous reporting"
    						}
    					]
    				}
    			], /*,
    {
        item_type: "input_switch",
        id: "0_10",
        label: "",
        clamp: true,
        options: [
            {value: false, text: "Add ‘specific location’ eg reporter can type “By the stairs”"}
        ]
    },*/
    			
    		},
    		{
    			item_type: "section",
    			label: "Other options",
    			children: [
    				{
    					item_type: "input_select",
    					id: "1_0",
    					label: "Status",
    					hint: "When reports with this QR are submitted they should be",
    					placeholder: "Click or type to select...",
    					options: [
    						{
    							value: "in_progress",
    							text: "In Progress"
    						},
    						{
    							value: "awaiting_triage",
    							text: "Awaiting Triage"
    						}
    					],
    					answer: ""
    				},
    				{
    					item_type: "input_text",
    					id: "1_1",
    					label: "Assign to",
    					hint: "This QR code can generate reports automatically assigned to a person",
    					placeholder: "Click or type to select...",
    					answer: ""
    				}
    			]
    		}
    	];

    	let fx = [];
    	let url = "https://ecoonline.github.io/ux/public/rapid.html?singlepage=1&fx=";
    	let value = "";
    	let qrs = [];

    	let prefilled_qrs = [
    		{
    			"created_date": "2022-03-12T13:08:10.430Z",
    			"created_by": "Mike Wazowski",
    			"updated_date": "2022-01-24T3:48:19.430Z",
    			"updated_by": "Mike Wazowski",
    			"record_id": 5,
    			"use_count": 0,
    			"location": false
    		},
    		{
    			"created_date": "2022-01-19T08:08:10.430Z",
    			"created_by": "Mike Wazowski",
    			"updated_date": "2022-01-24T3:48:19.430Z",
    			"updated_by": "Mike Wazowski",
    			"record_id": 4,
    			"use_count": 15,
    			"location": false
    		},
    		{
    			"created_date": "2021-12-25T21:08:10.430Z",
    			"created_by": "Mike Wazowski",
    			"updated_date": "2022-01-24T3:48:19.430Z",
    			"updated_by": "Mike Wazowski",
    			"record_id": 3,
    			"use_count": 127,
    			"location": "Packing Bay"
    		}
    	];

    	function nav(str) {
    		dispatch("nav", { text: str });
    	}

    	const writable_props = ["tabnav"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<Frame_incidents_admin> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		nav("platform");
    	};

    	const click_handler_1 = () => {
    		nav("ehs");
    	};

    	const click_handler_2 = () => {
    		nav("incidents");
    	};

    	const click_handler_3 = () => {
    		$$invalidate(0, tab = "overview");
    	};

    	const click_handler_4 = () => {
    		$$invalidate(0, tab = "queries_new");
    	};

    	const click_handler_5 = () => {
    		$$invalidate(0, tab = "summary");
    	};

    	const click_handler_6 = () => {
    		$$invalidate(0, tab = "admin");
    	};

    	const click_handler_7 = () => {
    		$$invalidate(3, qrs = prefilled_qrs);
    		$$invalidate(1, new_qr = false);
    	};

    	const click_handler_8 = () => {
    		$$invalidate(1, new_qr = false);
    	};

    	const click_handler_9 = () => {
    		$$invalidate(1, new_qr = true);
    	};

    	const click_handler_10 = () => {
    		nav("dashboard");
    	};

    	const click_handler_11 = () => {
    		nav("dashboard");
    	};

    	const click_handler_12 = () => {
    		nav("dashboard");
    	};

    	const click_handler_13 = () => {
    		nav("dashboard");
    	};

    	const click_handler_14 = () => {
    		$$invalidate(1, new_qr = true);
    	};

    	$$self.$$set = $$props => {
    		if ("tabnav" in $$props) $$invalidate(9, tabnav = $$props.tabnav);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		PubSub: pubsub,
    		QrCode: Lib,
    		Pullout,
    		Form,
    		RecordID,
    		Status,
    		Channel,
    		DateComp: Date_1,
    		components,
    		dispatch,
    		tab,
    		tabnav,
    		channel,
    		sub,
    		read_answer,
    		new_qr,
    		f,
    		fx,
    		url,
    		value,
    		strip,
    		qrs,
    		prefilled_qrs,
    		nav
    	});

    	$$self.$inject_state = $$props => {
    		if ("components" in $$props) $$invalidate(4, components = $$props.components);
    		if ("tab" in $$props) $$invalidate(0, tab = $$props.tab);
    		if ("tabnav" in $$props) $$invalidate(9, tabnav = $$props.tabnav);
    		if ("channel" in $$props) $$invalidate(5, channel = $$props.channel);
    		if ("sub" in $$props) sub = $$props.sub;
    		if ("new_qr" in $$props) $$invalidate(1, new_qr = $$props.new_qr);
    		if ("f" in $$props) $$invalidate(6, f = $$props.f);
    		if ("fx" in $$props) $$invalidate(10, fx = $$props.fx);
    		if ("url" in $$props) $$invalidate(29, url = $$props.url);
    		if ("value" in $$props) $$invalidate(2, value = $$props.value);
    		if ("qrs" in $$props) $$invalidate(3, qrs = $$props.qrs);
    		if ("prefilled_qrs" in $$props) $$invalidate(7, prefilled_qrs = $$props.prefilled_qrs);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*fx*/ 1024) {
    			{
    				//too big value = url +  encodeURIComponent(JSON.stringify(fx))
    				let str = JSON.stringify(fx);

    				let l = str.length;
    				console.log(l, str);
    				$$invalidate(2, value = url + btoa(l + ""));
    			}
    		}

    		if ($$self.$$.dirty[0] & /*tabnav*/ 512) {
    			{
    				let t = tabnav;

    				if (tabnav !== "") {
    					$$invalidate(0, tab = t);
    				}
    			}
    		}
    	};

    	return [
    		tab,
    		new_qr,
    		value,
    		qrs,
    		components,
    		channel,
    		f,
    		prefilled_qrs,
    		nav,
    		tabnav,
    		fx,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5,
    		click_handler_6,
    		click_handler_7,
    		click_handler_8,
    		click_handler_9,
    		click_handler_10,
    		click_handler_11,
    		click_handler_12,
    		click_handler_13,
    		click_handler_14
    	];
    }

    class Frame_incidents_admin extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { tabnav: 9 }, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Frame_incidents_admin",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get tabnav() {
    		throw new Error("<Frame_incidents_admin>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tabnav(value) {
    		throw new Error("<Frame_incidents_admin>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/cards/BigNumber.svelte generated by Svelte v3.35.0 */

    const file$4 = "src/components/cards/BigNumber.svelte";

    function create_fragment$4(ctx) {
    	let div3;
    	let div0;
    	let t0_value = /*t*/ ctx[0].title + "";
    	let t0;
    	let a;
    	let t1;
    	let div2;
    	let div1;
    	let t2_value = /*t*/ ctx[0].data.content + "";
    	let t2;
    	let div1_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			a = element("a");
    			t1 = space();
    			div2 = element("div");
    			div1 = element("div");
    			t2 = text(t2_value);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "i-pin i-20 btn-right");
    			add_location(a, file$4, 12, 38, 192);
    			attr_dev(div0, "class", "card-header");
    			add_location(div0, file$4, 12, 4, 158);
    			attr_dev(div1, "class", div1_class_value = "big-num " + /*t*/ ctx[0].data.status + " svelte-4fw7ay");
    			add_location(div1, file$4, 14, 8, 339);
    			attr_dev(div2, "class", "card-body");
    			add_location(div2, file$4, 13, 4, 307);
    			attr_dev(div3, "class", "card card-31");
    			add_location(div3, file$4, 11, 0, 127);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div0, t0);
    			append_dev(div0, a);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, t2);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", prevent_default(/*click_handler*/ ctx[1]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*t*/ 1 && t0_value !== (t0_value = /*t*/ ctx[0].title + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*t*/ 1 && t2_value !== (t2_value = /*t*/ ctx[0].data.content + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*t*/ 1 && div1_class_value !== (div1_class_value = "big-num " + /*t*/ ctx[0].data.status + " svelte-4fw7ay")) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("BigNumber", slots, []);

    	let { t = {
    		title: "Big Number",
    		data: { content: "-", status: "critical" }
    	} } = $$props;

    	const writable_props = ["t"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<BigNumber> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		pin_module(t.title);
    	};

    	$$self.$$set = $$props => {
    		if ("t" in $$props) $$invalidate(0, t = $$props.t);
    	};

    	$$self.$capture_state = () => ({ t });

    	$$self.$inject_state = $$props => {
    		if ("t" in $$props) $$invalidate(0, t = $$props.t);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [t, click_handler];
    }

    class BigNumber extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { t: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BigNumber",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get t() {
    		throw new Error("<BigNumber>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set t(value) {
    		throw new Error("<BigNumber>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Frame_hazard_assessments.svelte generated by Svelte v3.35.0 */

    const { Object: Object_1, console: console_1$1 } = globals;
    const file$3 = "src/Frame_hazard_assessments.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[36] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[39] = list[i][0];
    	child_ctx[40] = list[i][1];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[39] = list[i][0];
    	child_ctx[40] = list[i][1];
    	return child_ctx;
    }

    // (588:28) 
    function create_if_block_2(ctx) {
    	let h2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Summary";
    			add_location(h2, file$3, 588, 4, 22839);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(588:28) ",
    		ctx
    	});

    	return block;
    }

    // (393:0) {#if tab == 'overview'}
    function create_if_block$1(ctx) {
    	let div10;
    	let div5;
    	let div4;
    	let div0;
    	let bignumber0;
    	let t0;
    	let div1;
    	let bignumber1;
    	let t1;
    	let div2;
    	let bignumber2;
    	let t2;
    	let div3;
    	let bignumber3;
    	let t3;
    	let div9;
    	let div8;
    	let div6;
    	let t4;
    	let a0;
    	let t5;
    	let div7;
    	let svg;
    	let path0;
    	let rect0;
    	let rect1;
    	let rect2;
    	let rect3;
    	let rect4;
    	let rect5;
    	let rect6;
    	let rect7;
    	let rect8;
    	let rect9;
    	let rect10;
    	let rect11;
    	let rect12;
    	let rect13;
    	let rect14;
    	let rect15;
    	let rect16;
    	let rect17;
    	let rect18;
    	let rect19;
    	let rect20;
    	let rect21;
    	let rect22;
    	let rect23;
    	let rect24;
    	let rect25;
    	let rect26;
    	let rect27;
    	let rect28;
    	let path1;
    	let path2;
    	let text0;
    	let tspan0;
    	let t6;
    	let tspan1;
    	let t7;
    	let tspan2;
    	let t8;
    	let text1;
    	let tspan3;
    	let t9;
    	let tspan4;
    	let t10;
    	let text2;
    	let tspan5;
    	let t11;
    	let tspan6;
    	let t12;
    	let text3;
    	let tspan7;
    	let t13;
    	let tspan8;
    	let t14;
    	let text4;
    	let tspan9;
    	let t15;
    	let tspan10;
    	let t16;
    	let text5;
    	let tspan11;
    	let t17;
    	let tspan12;
    	let t18;
    	let text6;
    	let tspan13;
    	let t19;
    	let tspan14;
    	let t20;
    	let text7;
    	let tspan15;
    	let t21;
    	let text8;
    	let tspan16;
    	let t22;
    	let text9;
    	let tspan17;
    	let t23;
    	let text10;
    	let tspan18;
    	let t24;
    	let text11;
    	let tspan19;
    	let t25;
    	let text12;
    	let tspan20;
    	let t26;
    	let text13;
    	let tspan21;
    	let t27;
    	let t28;
    	let div15;
    	let div14;
    	let h4;
    	let t29;
    	let a1;
    	let t30;
    	let a2;
    	let t31;
    	let div13;
    	let table;
    	let thead;
    	let tr;
    	let t32;
    	let tbody;
    	let t33;
    	let div12;
    	let div11;
    	let current;
    	let mounted;
    	let dispose;

    	bignumber0 = new BigNumber({
    			props: {
    				t: {
    					"title": "Open Assessments",
    					"data": { "content": "40", "status": "xx" }
    				}
    			},
    			$$inline: true
    		});

    	bignumber1 = new BigNumber({
    			props: {
    				t: {
    					"title": "Awaiting Signoff",
    					"data": { "content": "11", "status": "minor" }
    				}
    			},
    			$$inline: true
    		});

    	bignumber2 = new BigNumber({
    			props: {
    				t: {
    					"title": "Awaiting Completion",
    					"data": { "content": "3", "status": "minor" }
    				}
    			},
    			$$inline: true
    		});

    	bignumber3 = new BigNumber({
    			props: {
    				t: {
    					"title": "Review Due Within 7 Days",
    					"data": { "content": "1", "status": "critical" }
    				}
    			},
    			$$inline: true
    		});

    	let each_value_2 = Object.entries(/*selected_columns*/ ctx[3]);
    	validate_each_argument(each_value_2);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_1[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value = /*table_data_sorted*/ ctx[6];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div10 = element("div");
    			div5 = element("div");
    			div4 = element("div");
    			div0 = element("div");
    			create_component(bignumber0.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			create_component(bignumber1.$$.fragment);
    			t1 = space();
    			div2 = element("div");
    			create_component(bignumber2.$$.fragment);
    			t2 = space();
    			div3 = element("div");
    			create_component(bignumber3.$$.fragment);
    			t3 = space();
    			div9 = element("div");
    			div8 = element("div");
    			div6 = element("div");
    			t4 = text("Hazard Assessments by Site/Status");
    			a0 = element("a");
    			t5 = space();
    			div7 = element("div");
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			rect0 = svg_element("rect");
    			rect1 = svg_element("rect");
    			rect2 = svg_element("rect");
    			rect3 = svg_element("rect");
    			rect4 = svg_element("rect");
    			rect5 = svg_element("rect");
    			rect6 = svg_element("rect");
    			rect7 = svg_element("rect");
    			rect8 = svg_element("rect");
    			rect9 = svg_element("rect");
    			rect10 = svg_element("rect");
    			rect11 = svg_element("rect");
    			rect12 = svg_element("rect");
    			rect13 = svg_element("rect");
    			rect14 = svg_element("rect");
    			rect15 = svg_element("rect");
    			rect16 = svg_element("rect");
    			rect17 = svg_element("rect");
    			rect18 = svg_element("rect");
    			rect19 = svg_element("rect");
    			rect20 = svg_element("rect");
    			rect21 = svg_element("rect");
    			rect22 = svg_element("rect");
    			rect23 = svg_element("rect");
    			rect24 = svg_element("rect");
    			rect25 = svg_element("rect");
    			rect26 = svg_element("rect");
    			rect27 = svg_element("rect");
    			rect28 = svg_element("rect");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			text0 = svg_element("text");
    			tspan0 = svg_element("tspan");
    			t6 = text("Amox");
    			tspan1 = svg_element("tspan");
    			t7 = text("Distribution");
    			tspan2 = svg_element("tspan");
    			t8 = text("Hub");
    			text1 = svg_element("text");
    			tspan3 = svg_element("tspan");
    			t9 = text("Dublin");
    			tspan4 = svg_element("tspan");
    			t10 = text("Office");
    			text2 = svg_element("text");
    			tspan5 = svg_element("tspan");
    			t11 = text("Golbrews");
    			tspan6 = svg_element("tspan");
    			t12 = text("South");
    			text3 = svg_element("text");
    			tspan7 = svg_element("tspan");
    			t13 = text("Ama");
    			tspan8 = svg_element("tspan");
    			t14 = text("Systems");
    			text4 = svg_element("text");
    			tspan9 = svg_element("tspan");
    			t15 = text("Crysalnite");
    			tspan10 = svg_element("tspan");
    			t16 = text("Facility");
    			text5 = svg_element("text");
    			tspan11 = svg_element("tspan");
    			t17 = text("Floatbed");
    			tspan12 = svg_element("tspan");
    			t18 = text("Plant");
    			text6 = svg_element("text");
    			tspan13 = svg_element("tspan");
    			t19 = text("Factory");
    			tspan14 = svg_element("tspan");
    			t20 = text("Line 2");
    			text7 = svg_element("text");
    			tspan15 = svg_element("tspan");
    			t21 = text("0");
    			text8 = svg_element("text");
    			tspan16 = svg_element("tspan");
    			t22 = text("12");
    			text9 = svg_element("text");
    			tspan17 = svg_element("tspan");
    			t23 = text("2");
    			text10 = svg_element("text");
    			tspan18 = svg_element("tspan");
    			t24 = text("4");
    			text11 = svg_element("text");
    			tspan19 = svg_element("tspan");
    			t25 = text("6");
    			text12 = svg_element("text");
    			tspan20 = svg_element("tspan");
    			t26 = text("8");
    			text13 = svg_element("text");
    			tspan21 = svg_element("tspan");
    			t27 = text("10");
    			t28 = space();
    			div15 = element("div");
    			div14 = element("div");
    			h4 = element("h4");
    			t29 = text("Latest Hazard Assessments\n                ");
    			a1 = element("a");
    			t30 = space();
    			a2 = element("a");
    			t31 = space();
    			div13 = element("div");
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t32 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t33 = space();
    			div12 = element("div");
    			div11 = element("div");
    			attr_dev(div0, "class", "col6");
    			add_location(div0, file$3, 396, 16, 12099);
    			attr_dev(div1, "class", "col6");
    			add_location(div1, file$3, 406, 16, 12431);
    			attr_dev(div2, "class", "col6");
    			add_location(div2, file$3, 415, 16, 12765);
    			attr_dev(div3, "class", "col6");
    			add_location(div3, file$3, 424, 16, 13101);
    			attr_dev(div4, "class", "row");
    			add_location(div4, file$3, 395, 12, 12065);
    			attr_dev(div5, "class", "col12 col-md-6");
    			add_location(div5, file$3, 394, 8, 12024);
    			attr_dev(a0, "href", "/");
    			attr_dev(a0, "class", "i-pin i-20 btn-right");
    			add_location(a0, file$3, 438, 74, 13614);
    			attr_dev(div6, "class", "card-header");
    			add_location(div6, file$3, 438, 16, 13556);
    			attr_dev(path0, "class", "grid_lines svelte-hz54gq");
    			attr_dev(path0, "d", "M 35 162 L 407 162 M 35 138 L 407 138 M 35 114 L 407 114 M 35 91 L 407 91 M 35 67 L 407 67 M 35 43 L 407 43 M 35 19 L 407 19");
    			add_location(path0, file$3, 443, 24, 14061);
    			attr_dev(rect0, "class", "leg1 svelte-hz54gq");
    			attr_dev(rect0, "x", "39");
    			attr_dev(rect0, "y", "150");
    			attr_dev(rect0, "width", "44");
    			attr_dev(rect0, "height", "12");
    			add_location(rect0, file$3, 445, 24, 14272);
    			attr_dev(rect1, "class", "leg1 svelte-hz54gq");
    			attr_dev(rect1, "x", "92");
    			attr_dev(rect1, "y", "90");
    			attr_dev(rect1, "width", "44");
    			attr_dev(rect1, "height", "72");
    			add_location(rect1, file$3, 446, 24, 14348);
    			attr_dev(rect2, "class", "leg1 svelte-hz54gq");
    			attr_dev(rect2, "x", "145");
    			attr_dev(rect2, "y", "126");
    			attr_dev(rect2, "width", "44");
    			attr_dev(rect2, "height", "36");
    			add_location(rect2, file$3, 447, 24, 14423);
    			attr_dev(rect3, "class", "leg1 svelte-hz54gq");
    			attr_dev(rect3, "x", "198");
    			attr_dev(rect3, "y", "126");
    			attr_dev(rect3, "width", "44");
    			attr_dev(rect3, "height", "36");
    			add_location(rect3, file$3, 448, 24, 14500);
    			attr_dev(rect4, "class", "leg1 svelte-hz54gq");
    			attr_dev(rect4, "x", "251");
    			attr_dev(rect4, "y", "102");
    			attr_dev(rect4, "width", "44");
    			attr_dev(rect4, "height", "60");
    			add_location(rect4, file$3, 449, 24, 14577);
    			attr_dev(rect5, "class", "leg1 svelte-hz54gq");
    			attr_dev(rect5, "x", "304");
    			attr_dev(rect5, "y", "114");
    			attr_dev(rect5, "width", "44");
    			attr_dev(rect5, "height", "48");
    			add_location(rect5, file$3, 450, 24, 14654);
    			attr_dev(rect6, "class", "leg1 svelte-hz54gq");
    			attr_dev(rect6, "x", "357");
    			attr_dev(rect6, "y", "126");
    			attr_dev(rect6, "width", "44");
    			attr_dev(rect6, "height", "36");
    			add_location(rect6, file$3, 451, 24, 14731);
    			attr_dev(rect7, "class", "leg2 svelte-hz54gq");
    			attr_dev(rect7, "x", "39");
    			attr_dev(rect7, "y", "126");
    			attr_dev(rect7, "width", "44");
    			attr_dev(rect7, "height", "24");
    			add_location(rect7, file$3, 454, 24, 14810);
    			attr_dev(rect8, "class", "leg2 svelte-hz54gq");
    			attr_dev(rect8, "x", "92");
    			attr_dev(rect8, "y", "78");
    			attr_dev(rect8, "width", "44");
    			attr_dev(rect8, "height", "12");
    			add_location(rect8, file$3, 455, 24, 14886);
    			attr_dev(rect9, "class", "leg2 svelte-hz54gq");
    			attr_dev(rect9, "x", "145");
    			attr_dev(rect9, "y", "114");
    			attr_dev(rect9, "width", "44");
    			attr_dev(rect9, "height", "12");
    			add_location(rect9, file$3, 456, 24, 14961);
    			attr_dev(rect10, "class", "leg2 svelte-hz54gq");
    			attr_dev(rect10, "x", "198");
    			attr_dev(rect10, "y", "126");
    			attr_dev(rect10, "width", "44");
    			attr_dev(rect10, "height", "0");
    			add_location(rect10, file$3, 457, 24, 15038);
    			attr_dev(rect11, "class", "leg2 svelte-hz54gq");
    			attr_dev(rect11, "x", "251");
    			attr_dev(rect11, "y", "66");
    			attr_dev(rect11, "width", "44");
    			attr_dev(rect11, "height", "36");
    			add_location(rect11, file$3, 458, 24, 15114);
    			attr_dev(rect12, "class", "leg2 svelte-hz54gq");
    			attr_dev(rect12, "x", "304");
    			attr_dev(rect12, "y", "102");
    			attr_dev(rect12, "width", "44");
    			attr_dev(rect12, "height", "12");
    			add_location(rect12, file$3, 459, 24, 15190);
    			attr_dev(rect13, "class", "leg2 svelte-hz54gq");
    			attr_dev(rect13, "x", "357");
    			attr_dev(rect13, "y", "126");
    			attr_dev(rect13, "width", "44");
    			attr_dev(rect13, "height", "0");
    			add_location(rect13, file$3, 460, 24, 15267);
    			attr_dev(rect14, "class", "leg3 svelte-hz54gq");
    			attr_dev(rect14, "x", "39");
    			attr_dev(rect14, "y", "126");
    			attr_dev(rect14, "width", "44");
    			attr_dev(rect14, "height", "0");
    			add_location(rect14, file$3, 462, 24, 15344);
    			attr_dev(rect15, "class", "leg3 svelte-hz54gq");
    			attr_dev(rect15, "x", "92");
    			attr_dev(rect15, "y", "66");
    			attr_dev(rect15, "width", "44");
    			attr_dev(rect15, "height", "12");
    			add_location(rect15, file$3, 463, 24, 15419);
    			attr_dev(rect16, "class", "leg3 svelte-hz54gq");
    			attr_dev(rect16, "x", "145");
    			attr_dev(rect16, "y", "102");
    			attr_dev(rect16, "width", "44");
    			attr_dev(rect16, "height", "12");
    			add_location(rect16, file$3, 464, 24, 15494);
    			attr_dev(rect17, "class", "leg3 svelte-hz54gq");
    			attr_dev(rect17, "x", "198");
    			attr_dev(rect17, "y", "126");
    			attr_dev(rect17, "width", "44");
    			attr_dev(rect17, "height", "0");
    			add_location(rect17, file$3, 465, 24, 15571);
    			attr_dev(rect18, "class", "leg3 svelte-hz54gq");
    			attr_dev(rect18, "x", "251");
    			attr_dev(rect18, "y", "54");
    			attr_dev(rect18, "width", "44");
    			attr_dev(rect18, "height", "12");
    			add_location(rect18, file$3, 466, 24, 15647);
    			attr_dev(rect19, "class", "leg3 svelte-hz54gq");
    			attr_dev(rect19, "x", "304");
    			attr_dev(rect19, "y", "90");
    			attr_dev(rect19, "width", "44");
    			attr_dev(rect19, "height", "12");
    			add_location(rect19, file$3, 467, 24, 15723);
    			attr_dev(rect20, "class", "leg3 svelte-hz54gq");
    			attr_dev(rect20, "x", "357");
    			attr_dev(rect20, "y", "78");
    			attr_dev(rect20, "width", "44");
    			attr_dev(rect20, "height", "48");
    			add_location(rect20, file$3, 468, 24, 15799);
    			attr_dev(rect21, "class", "leg4 svelte-hz54gq");
    			attr_dev(rect21, "x", "39");
    			attr_dev(rect21, "y", "90");
    			attr_dev(rect21, "width", "44");
    			attr_dev(rect21, "height", "36");
    			add_location(rect21, file$3, 470, 24, 15876);
    			attr_dev(rect22, "class", "leg4 svelte-hz54gq");
    			attr_dev(rect22, "x", "92");
    			attr_dev(rect22, "y", "66");
    			attr_dev(rect22, "width", "44");
    			attr_dev(rect22, "height", "0");
    			add_location(rect22, file$3, 471, 24, 15951);
    			attr_dev(rect23, "class", "leg4 svelte-hz54gq");
    			attr_dev(rect23, "x", "145");
    			attr_dev(rect23, "y", "102");
    			attr_dev(rect23, "width", "44");
    			attr_dev(rect23, "height", "0");
    			add_location(rect23, file$3, 472, 24, 16025);
    			attr_dev(rect24, "class", "leg4 svelte-hz54gq");
    			attr_dev(rect24, "x", "198");
    			attr_dev(rect24, "y", "126");
    			attr_dev(rect24, "width", "44");
    			attr_dev(rect24, "height", "0");
    			add_location(rect24, file$3, 473, 24, 16101);
    			attr_dev(rect25, "class", "leg4 svelte-hz54gq");
    			attr_dev(rect25, "x", "251");
    			attr_dev(rect25, "y", "30");
    			attr_dev(rect25, "width", "44");
    			attr_dev(rect25, "height", "24");
    			add_location(rect25, file$3, 474, 24, 16177);
    			attr_dev(rect26, "class", "leg4 svelte-hz54gq");
    			attr_dev(rect26, "x", "304");
    			attr_dev(rect26, "y", "78");
    			attr_dev(rect26, "width", "44");
    			attr_dev(rect26, "height", "12");
    			add_location(rect26, file$3, 475, 24, 16253);
    			attr_dev(rect27, "class", "leg4 svelte-hz54gq");
    			attr_dev(rect27, "x", "357");
    			attr_dev(rect27, "y", "78");
    			attr_dev(rect27, "width", "44");
    			attr_dev(rect27, "height", "0");
    			add_location(rect27, file$3, 476, 24, 16329);
    			attr_dev(rect28, "class", "leg5 svelte-hz54gq");
    			attr_dev(rect28, "x", "251");
    			attr_dev(rect28, "y", "18");
    			attr_dev(rect28, "width", "44");
    			attr_dev(rect28, "height", "12");
    			add_location(rect28, file$3, 479, 24, 16406);
    			attr_dev(path1, "class", "axis svelte-hz54gq");
    			attr_dev(path1, "d", "M 34 162 L 408 162 \n                            M 35 162 L 35 167 \n                            M 88 162 L 88 167 \n                            M 141 162 L 141 167 \n                            M 194 162 L 194 167 \n                            M 247 162 L 247 167 \n                            M 300 162 L 300 167 \n                            M 353 162 L 353 167 \n                            M 407 162 L 407 167");
    			add_location(path1, file$3, 503, 24, 17682);
    			attr_dev(path2, "class", "axis svelte-hz54gq");
    			attr_dev(path2, "d", "M 35 162 L 35 19 M 35 162 L 30 162 M 35 138 L 30 138 M 35 114 L 30 114 M 35 91 L 30 91 M 35 67 L 30 67 M 35 43 L 30 43 M 35 19 L 30 19");
    			add_location(path2, file$3, 513, 24, 18196);
    			attr_dev(tspan0, "text-anchor", "middle");
    			attr_dev(tspan0, "x", "61");
    			attr_dev(tspan0, "y", "180");
    			attr_dev(tspan0, "dy", "0");
    			add_location(tspan0, file$3, 515, 30, 18393);
    			attr_dev(tspan1, "text-anchor", "middle");
    			attr_dev(tspan1, "x", "61");
    			attr_dev(tspan1, "y", "180");
    			attr_dev(tspan1, "dy", "12.5");
    			add_location(tspan1, file$3, 515, 92, 18455);
    			attr_dev(tspan2, "text-anchor", "middle");
    			attr_dev(tspan2, "x", "61");
    			attr_dev(tspan2, "y", "180");
    			attr_dev(tspan2, "dy", "25");
    			add_location(tspan2, file$3, 515, 165, 18528);
    			attr_dev(text0, "class", "svelte-hz54gq");
    			add_location(text0, file$3, 515, 24, 18387);
    			attr_dev(tspan3, "text-anchor", "middle");
    			attr_dev(tspan3, "x", "114");
    			attr_dev(tspan3, "y", "180");
    			attr_dev(tspan3, "dy", "0");
    			add_location(tspan3, file$3, 516, 30, 18628);
    			attr_dev(tspan4, "text-anchor", "middle");
    			attr_dev(tspan4, "x", "114");
    			attr_dev(tspan4, "y", "180");
    			attr_dev(tspan4, "dy", "12.5");
    			add_location(tspan4, file$3, 516, 95, 18693);
    			attr_dev(text1, "class", "svelte-hz54gq");
    			add_location(text1, file$3, 516, 24, 18622);
    			attr_dev(tspan5, "text-anchor", "middle");
    			attr_dev(tspan5, "x", "167");
    			attr_dev(tspan5, "y", "180");
    			attr_dev(tspan5, "dy", "0");
    			add_location(tspan5, file$3, 517, 30, 18799);
    			attr_dev(tspan6, "text-anchor", "middle");
    			attr_dev(tspan6, "x", "167");
    			attr_dev(tspan6, "y", "180");
    			attr_dev(tspan6, "dy", "12.5");
    			add_location(tspan6, file$3, 517, 97, 18866);
    			attr_dev(text2, "class", "svelte-hz54gq");
    			add_location(text2, file$3, 517, 24, 18793);
    			attr_dev(tspan7, "text-anchor", "middle");
    			attr_dev(tspan7, "x", "220");
    			attr_dev(tspan7, "y", "180");
    			attr_dev(tspan7, "dy", "0");
    			add_location(tspan7, file$3, 518, 30, 18971);
    			attr_dev(tspan8, "text-anchor", "middle");
    			attr_dev(tspan8, "x", "220");
    			attr_dev(tspan8, "y", "180");
    			attr_dev(tspan8, "dy", "12.5");
    			add_location(tspan8, file$3, 518, 92, 19033);
    			attr_dev(text3, "class", "svelte-hz54gq");
    			add_location(text3, file$3, 518, 24, 18965);
    			attr_dev(tspan9, "text-anchor", "middle");
    			attr_dev(tspan9, "x", "273");
    			attr_dev(tspan9, "y", "180");
    			attr_dev(tspan9, "dy", "0");
    			add_location(tspan9, file$3, 519, 30, 19140);
    			attr_dev(tspan10, "text-anchor", "middle");
    			attr_dev(tspan10, "x", "273");
    			attr_dev(tspan10, "y", "180");
    			attr_dev(tspan10, "dy", "12.5");
    			add_location(tspan10, file$3, 519, 99, 19209);
    			attr_dev(text4, "class", "svelte-hz54gq");
    			add_location(text4, file$3, 519, 24, 19134);
    			attr_dev(tspan11, "text-anchor", "middle");
    			attr_dev(tspan11, "x", "326");
    			attr_dev(tspan11, "y", "180");
    			attr_dev(tspan11, "dy", "0");
    			add_location(tspan11, file$3, 520, 30, 19317);
    			attr_dev(tspan12, "text-anchor", "middle");
    			attr_dev(tspan12, "x", "326");
    			attr_dev(tspan12, "y", "180");
    			attr_dev(tspan12, "dy", "12.5");
    			add_location(tspan12, file$3, 520, 97, 19384);
    			attr_dev(text5, "class", "svelte-hz54gq");
    			add_location(text5, file$3, 520, 24, 19311);
    			attr_dev(tspan13, "text-anchor", "middle");
    			attr_dev(tspan13, "x", "379");
    			attr_dev(tspan13, "y", "180");
    			attr_dev(tspan13, "dy", "0");
    			add_location(tspan13, file$3, 521, 30, 19489);
    			attr_dev(tspan14, "text-anchor", "middle");
    			attr_dev(tspan14, "x", "379");
    			attr_dev(tspan14, "y", "180");
    			attr_dev(tspan14, "dy", "12.5");
    			add_location(tspan14, file$3, 521, 96, 19555);
    			attr_dev(text6, "class", "svelte-hz54gq");
    			add_location(text6, file$3, 521, 24, 19483);
    			attr_dev(tspan15, "x", "21.41");
    			attr_dev(tspan15, "y", "167.2");
    			attr_dev(tspan15, "dy", "0");
    			add_location(tspan15, file$3, 524, 50, 19707);
    			attr_dev(text7, "x", "21.41");
    			attr_dev(text7, "y", "155.2");
    			attr_dev(text7, "class", "svelte-hz54gq");
    			add_location(text7, file$3, 524, 24, 19681);
    			attr_dev(tspan16, "x", "13.81");
    			attr_dev(tspan16, "y", "24.2");
    			attr_dev(tspan16, "dy", "0");
    			add_location(tspan16, file$3, 525, 49, 19807);
    			attr_dev(text8, "x", "13.81");
    			attr_dev(text8, "y", "12.2");
    			attr_dev(text8, "class", "svelte-hz54gq");
    			add_location(text8, file$3, 525, 24, 19782);
    			attr_dev(tspan17, "x", "21.41");
    			attr_dev(tspan17, "y", "143.37");
    			attr_dev(tspan17, "dy", "0");
    			add_location(tspan17, file$3, 526, 51, 19909);
    			attr_dev(text9, "x", "21.41");
    			attr_dev(text9, "y", "131.37");
    			attr_dev(text9, "class", "svelte-hz54gq");
    			add_location(text9, file$3, 526, 24, 19882);
    			attr_dev(tspan18, "x", "21.41");
    			attr_dev(tspan18, "y", "119.54");
    			attr_dev(tspan18, "dy", "0");
    			add_location(tspan18, file$3, 527, 51, 20012);
    			attr_dev(text10, "x", "21.41");
    			attr_dev(text10, "y", "107.54");
    			attr_dev(text10, "class", "svelte-hz54gq");
    			add_location(text10, file$3, 527, 24, 19985);
    			attr_dev(tspan19, "x", "21.41");
    			attr_dev(tspan19, "y", "95.7");
    			attr_dev(tspan19, "dy", "0");
    			add_location(tspan19, file$3, 528, 49, 20113);
    			attr_dev(text11, "x", "21.41");
    			attr_dev(text11, "y", "83.7");
    			attr_dev(text11, "class", "svelte-hz54gq");
    			add_location(text11, file$3, 528, 24, 20088);
    			attr_dev(tspan20, "x", "21.41");
    			attr_dev(tspan20, "y", "71.87");
    			attr_dev(tspan20, "dy", "0");
    			add_location(tspan20, file$3, 529, 50, 20213);
    			attr_dev(text12, "x", "21.41");
    			attr_dev(text12, "y", "59.87");
    			attr_dev(text12, "class", "svelte-hz54gq");
    			add_location(text12, file$3, 529, 24, 20187);
    			attr_dev(tspan21, "x", "13.81");
    			attr_dev(tspan21, "y", "48.04");
    			attr_dev(tspan21, "dy", "0");
    			add_location(tspan21, file$3, 530, 50, 20314);
    			attr_dev(text13, "x", "13.81");
    			attr_dev(text13, "y", "36.04");
    			attr_dev(text13, "class", "svelte-hz54gq");
    			add_location(text13, file$3, 530, 24, 20288);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "class", "demo_graph svelte-hz54gq");
    			attr_dev(svg, "viewBox", "0 0 428 210");
    			attr_dev(svg, "width", "90%");
    			attr_dev(svg, "display", "block");
    			add_location(svg, file$3, 440, 20, 13794);
    			attr_dev(div7, "class", "card-body");
    			add_location(div7, file$3, 439, 16, 13750);
    			attr_dev(div8, "class", "card card-32");
    			add_location(div8, file$3, 437, 12, 13513);
    			attr_dev(div9, "class", "col12 col-md-6");
    			add_location(div9, file$3, 436, 8, 13472);
    			attr_dev(div10, "class", "row");
    			add_location(div10, file$3, 393, 4, 11998);
    			attr_dev(a1, "href", "/");
    			attr_dev(a1, "class", "i-pin i-20 btn-right");
    			add_location(a1, file$3, 541, 16, 20612);
    			attr_dev(a2, "href", "/");
    			attr_dev(a2, "class", "i-settings i-20 btn-right");
    			add_location(a2, file$3, 542, 16, 20741);
    			add_location(h4, file$3, 540, 12, 20557);
    			add_location(tr, file$3, 547, 24, 21000);
    			add_location(thead, file$3, 546, 20, 20968);
    			add_location(tbody, file$3, 553, 20, 21388);
    			attr_dev(table, "class", "table");
    			add_location(table, file$3, 545, 16, 20926);
    			attr_dev(div11, "class", "pagination");
    			add_location(div11, file$3, 582, 48, 22714);
    			attr_dev(div12, "class", "pagination-wrapper");
    			add_location(div12, file$3, 582, 16, 22682);
    			attr_dev(div13, "class", "sticky-wrapper svelte-hz54gq");
    			add_location(div13, file$3, 544, 12, 20881);
    			attr_dev(div14, "class", "col12");
    			add_location(div14, file$3, 539, 8, 20525);
    			attr_dev(div15, "class", "row");
    			add_location(div15, file$3, 538, 4, 20499);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div10, anchor);
    			append_dev(div10, div5);
    			append_dev(div5, div4);
    			append_dev(div4, div0);
    			mount_component(bignumber0, div0, null);
    			append_dev(div4, t0);
    			append_dev(div4, div1);
    			mount_component(bignumber1, div1, null);
    			append_dev(div4, t1);
    			append_dev(div4, div2);
    			mount_component(bignumber2, div2, null);
    			append_dev(div4, t2);
    			append_dev(div4, div3);
    			mount_component(bignumber3, div3, null);
    			append_dev(div10, t3);
    			append_dev(div10, div9);
    			append_dev(div9, div8);
    			append_dev(div8, div6);
    			append_dev(div6, t4);
    			append_dev(div6, a0);
    			append_dev(div8, t5);
    			append_dev(div8, div7);
    			append_dev(div7, svg);
    			append_dev(svg, path0);
    			append_dev(svg, rect0);
    			append_dev(svg, rect1);
    			append_dev(svg, rect2);
    			append_dev(svg, rect3);
    			append_dev(svg, rect4);
    			append_dev(svg, rect5);
    			append_dev(svg, rect6);
    			append_dev(svg, rect7);
    			append_dev(svg, rect8);
    			append_dev(svg, rect9);
    			append_dev(svg, rect10);
    			append_dev(svg, rect11);
    			append_dev(svg, rect12);
    			append_dev(svg, rect13);
    			append_dev(svg, rect14);
    			append_dev(svg, rect15);
    			append_dev(svg, rect16);
    			append_dev(svg, rect17);
    			append_dev(svg, rect18);
    			append_dev(svg, rect19);
    			append_dev(svg, rect20);
    			append_dev(svg, rect21);
    			append_dev(svg, rect22);
    			append_dev(svg, rect23);
    			append_dev(svg, rect24);
    			append_dev(svg, rect25);
    			append_dev(svg, rect26);
    			append_dev(svg, rect27);
    			append_dev(svg, rect28);
    			append_dev(svg, path1);
    			append_dev(svg, path2);
    			append_dev(svg, text0);
    			append_dev(text0, tspan0);
    			append_dev(tspan0, t6);
    			append_dev(text0, tspan1);
    			append_dev(tspan1, t7);
    			append_dev(text0, tspan2);
    			append_dev(tspan2, t8);
    			append_dev(svg, text1);
    			append_dev(text1, tspan3);
    			append_dev(tspan3, t9);
    			append_dev(text1, tspan4);
    			append_dev(tspan4, t10);
    			append_dev(svg, text2);
    			append_dev(text2, tspan5);
    			append_dev(tspan5, t11);
    			append_dev(text2, tspan6);
    			append_dev(tspan6, t12);
    			append_dev(svg, text3);
    			append_dev(text3, tspan7);
    			append_dev(tspan7, t13);
    			append_dev(text3, tspan8);
    			append_dev(tspan8, t14);
    			append_dev(svg, text4);
    			append_dev(text4, tspan9);
    			append_dev(tspan9, t15);
    			append_dev(text4, tspan10);
    			append_dev(tspan10, t16);
    			append_dev(svg, text5);
    			append_dev(text5, tspan11);
    			append_dev(tspan11, t17);
    			append_dev(text5, tspan12);
    			append_dev(tspan12, t18);
    			append_dev(svg, text6);
    			append_dev(text6, tspan13);
    			append_dev(tspan13, t19);
    			append_dev(text6, tspan14);
    			append_dev(tspan14, t20);
    			append_dev(svg, text7);
    			append_dev(text7, tspan15);
    			append_dev(tspan15, t21);
    			append_dev(svg, text8);
    			append_dev(text8, tspan16);
    			append_dev(tspan16, t22);
    			append_dev(svg, text9);
    			append_dev(text9, tspan17);
    			append_dev(tspan17, t23);
    			append_dev(svg, text10);
    			append_dev(text10, tspan18);
    			append_dev(tspan18, t24);
    			append_dev(svg, text11);
    			append_dev(text11, tspan19);
    			append_dev(tspan19, t25);
    			append_dev(svg, text12);
    			append_dev(text12, tspan20);
    			append_dev(tspan20, t26);
    			append_dev(svg, text13);
    			append_dev(text13, tspan21);
    			append_dev(tspan21, t27);
    			insert_dev(target, t28, anchor);
    			insert_dev(target, div15, anchor);
    			append_dev(div15, div14);
    			append_dev(div14, h4);
    			append_dev(h4, t29);
    			append_dev(h4, a1);
    			append_dev(h4, t30);
    			append_dev(h4, a2);
    			append_dev(div14, t31);
    			append_dev(div14, div13);
    			append_dev(div13, table);
    			append_dev(table, thead);
    			append_dev(thead, tr);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(tr, null);
    			}

    			append_dev(table, t32);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			append_dev(div13, t33);
    			append_dev(div13, div12);
    			append_dev(div12, div11);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(a0, "click", prevent_default(/*click_handler_6*/ ctx[27]), false, true, false),
    					listen_dev(a1, "click", prevent_default(/*click_handler_7*/ ctx[28]), false, true, false),
    					listen_dev(a2, "click", prevent_default(/*click_handler_8*/ ctx[29]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*selected_columns, sort_table*/ 1032) {
    				each_value_2 = Object.entries(/*selected_columns*/ ctx[3]);
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_2(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(tr, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_2.length;
    			}

    			if (dirty[0] & /*selected_columns, components, table_data_sorted*/ 200) {
    				each_value = /*table_data_sorted*/ ctx[6];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(bignumber0.$$.fragment, local);
    			transition_in(bignumber1.$$.fragment, local);
    			transition_in(bignumber2.$$.fragment, local);
    			transition_in(bignumber3.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(bignumber0.$$.fragment, local);
    			transition_out(bignumber1.$$.fragment, local);
    			transition_out(bignumber2.$$.fragment, local);
    			transition_out(bignumber3.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div10);
    			destroy_component(bignumber0);
    			destroy_component(bignumber1);
    			destroy_component(bignumber2);
    			destroy_component(bignumber3);
    			if (detaching) detach_dev(t28);
    			if (detaching) detach_dev(div15);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(393:0) {#if tab == 'overview'}",
    		ctx
    	});

    	return block;
    }

    // (549:28) {#each Object.entries(selected_columns) as [k, th]}
    function create_each_block_2(ctx) {
    	let th;
    	let t_value = /*th*/ ctx[40].value + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler_9() {
    		return /*click_handler_9*/ ctx[30](/*th*/ ctx[40]);
    	}

    	const block = {
    		c: function create() {
    			th = element("th");
    			t = text(t_value);
    			toggle_class(th, "sortable", /*th*/ ctx[40].sortable);
    			toggle_class(th, "asc", /*th*/ ctx[40].sorted == "asc");
    			toggle_class(th, "desc", /*th*/ ctx[40].sorted == "desc");
    			add_location(th, file$3, 549, 32, 21117);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, t);

    			if (!mounted) {
    				dispose = listen_dev(th, "click", click_handler_9, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*selected_columns*/ 8 && t_value !== (t_value = /*th*/ ctx[40].value + "")) set_data_dev(t, t_value);

    			if (dirty[0] & /*selected_columns*/ 8) {
    				toggle_class(th, "sortable", /*th*/ ctx[40].sortable);
    			}

    			if (dirty[0] & /*selected_columns*/ 8) {
    				toggle_class(th, "asc", /*th*/ ctx[40].sorted == "asc");
    			}

    			if (dirty[0] & /*selected_columns*/ 8) {
    				toggle_class(th, "desc", /*th*/ ctx[40].sorted == "desc");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(549:28) {#each Object.entries(selected_columns) as [k, th]}",
    		ctx
    	});

    	return block;
    }

    // (561:40) {:else}
    function create_else_block(ctx) {
    	let t_value = /*row*/ ctx[36][/*th*/ ctx[40].key] + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*table_data_sorted, selected_columns*/ 72 && t_value !== (t_value = /*row*/ ctx[36][/*th*/ ctx[40].key] + "")) set_data_dev(t, t_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(561:40) {:else}",
    		ctx
    	});

    	return block;
    }

    // (559:40) {#if components[th.key]}
    function create_if_block_1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*components*/ ctx[7][/*th*/ ctx[40].key];

    	function switch_props(ctx) {
    		return {
    			props: { obj: /*row*/ ctx[36][/*th*/ ctx[40].key] },
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};
    			if (dirty[0] & /*table_data_sorted, selected_columns*/ 72) switch_instance_changes.obj = /*row*/ ctx[36][/*th*/ ctx[40].key];

    			if (switch_value !== (switch_value = /*components*/ ctx[7][/*th*/ ctx[40].key])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(559:40) {#if components[th.key]}",
    		ctx
    	});

    	return block;
    }

    // (557:32) {#each Object.entries(selected_columns) as [k, th]}
    function create_each_block_1(ctx) {
    	let td;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block_1, create_else_block];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*components*/ ctx[7][/*th*/ ctx[40].key]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			td = element("td");
    			if_block.c();
    			add_location(td, file$3, 557, 36, 21606);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			if_blocks[current_block_type_index].m(td, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(td, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(557:32) {#each Object.entries(selected_columns) as [k, th]}",
    		ctx
    	});

    	return block;
    }

    // (555:24) {#each table_data_sorted as row}
    function create_each_block(ctx) {
    	let tr;
    	let t;
    	let current;
    	let each_value_1 = Object.entries(/*selected_columns*/ ctx[3]);
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			tr = element("tr");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			add_location(tr, file$3, 555, 28, 21481);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}

    			append_dev(tr, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*components, selected_columns, table_data_sorted*/ 200) {
    				each_value_1 = Object.entries(/*selected_columns*/ ctx[3]);
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(tr, t);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(555:24) {#each table_data_sorted as row}",
    		ctx
    	});

    	return block;
    }

    // (593:0) <Pullout show_drawer={table_drawer} title="Table settings" on:close={table_cancel}>
    function create_default_slot_1(ctx) {
    	let form;
    	let t0;
    	let div;
    	let span0;
    	let t2;
    	let span1;
    	let current;
    	let mounted;
    	let dispose;

    	form = new Form({
    			props: {
    				f: /*table_settings_form*/ ctx[2],
    				channel: /*channel*/ ctx[8]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(form.$$.fragment);
    			t0 = space();
    			div = element("div");
    			span0 = element("span");
    			span0.textContent = "Save";
    			t2 = space();
    			span1 = element("span");
    			span1.textContent = "Cancel";
    			attr_dev(span0, "class", "btn");
    			add_location(span0, file$3, 595, 8, 23036);
    			attr_dev(span1, "class", "btn btn-secondary");
    			add_location(span1, file$3, 596, 8, 23107);
    			attr_dev(div, "class", "form-item");
    			add_location(div, file$3, 594, 4, 23004);
    		},
    		m: function mount(target, anchor) {
    			mount_component(form, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, span0);
    			append_dev(div, t2);
    			append_dev(div, span1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(span0, "click", /*save_table_settings*/ ctx[9], false, false, false),
    					listen_dev(span1, "click", /*table_cancel*/ ctx[11], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const form_changes = {};
    			if (dirty[0] & /*table_settings_form*/ 4) form_changes.f = /*table_settings_form*/ ctx[2];
    			form.$set(form_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(form.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(form.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(form, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(593:0) <Pullout show_drawer={table_drawer} title=\\\"Table settings\\\" on:close={table_cancel}>",
    		ctx
    	});

    	return block;
    }

    // (601:0) <Pullout show_drawer={pin_drawer} title={pin_title} on:close={pin_cancel}>
    function create_default_slot(ctx) {
    	let form;
    	let t0;
    	let span0;
    	let t2;
    	let span1;
    	let current;
    	let mounted;
    	let dispose;

    	form = new Form({
    			props: { f: /*pin_form*/ ctx[13] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(form.$$.fragment);
    			t0 = space();
    			span0 = element("span");
    			span0.textContent = "Pin";
    			t2 = space();
    			span1 = element("span");
    			span1.textContent = "Cancel";
    			attr_dev(span0, "class", "btn");
    			add_location(span0, file$3, 602, 4, 23312);
    			attr_dev(span1, "class", "btn btn-secondary");
    			add_location(span1, file$3, 604, 4, 23464);
    		},
    		m: function mount(target, anchor) {
    			mount_component(form, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, span0, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, span1, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(span0, "click", /*pin_save*/ ctx[15], false, false, false),
    					listen_dev(span1, "click", /*pin_cancel*/ ctx[16], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(form.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(form.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(form, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(span0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(span1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(601:0) <Pullout show_drawer={pin_drawer} title={pin_title} on:close={pin_cancel}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div2;
    	let div0;
    	let ul0;
    	let li0;
    	let a0;
    	let t1;
    	let li1;
    	let a1;
    	let t3;
    	let li2;
    	let t5;
    	let div1;
    	let a2;
    	let t7;
    	let a3;
    	let t9;
    	let h1;
    	let i;
    	let t10;
    	let t11;
    	let ul1;
    	let li3;
    	let a4;
    	let t13;
    	let li4;
    	let a5;
    	let t15;
    	let current_block_type_index;
    	let if_block;
    	let t16;
    	let pullout0;
    	let t17;
    	let pullout1;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block$1, create_if_block_2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*tab*/ ctx[1] == "overview") return 0;
    		if (/*tab*/ ctx[1] == "summary") return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	pullout0 = new Pullout({
    			props: {
    				show_drawer: /*table_drawer*/ ctx[0],
    				title: "Table settings",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	pullout0.$on("close", /*table_cancel*/ ctx[11]);

    	pullout1 = new Pullout({
    			props: {
    				show_drawer: /*pin_drawer*/ ctx[5],
    				title: /*pin_title*/ ctx[4],
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	pullout1.$on("close", /*pin_cancel*/ ctx[16]);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			ul0 = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			a0.textContent = "EcoOnline";
    			t1 = space();
    			li1 = element("li");
    			a1 = element("a");
    			a1.textContent = "EHS";
    			t3 = space();
    			li2 = element("li");
    			li2.textContent = "Hazard Assessments";
    			t5 = space();
    			div1 = element("div");
    			a2 = element("a");
    			a2.textContent = "Query";
    			t7 = space();
    			a3 = element("a");
    			a3.textContent = "New";
    			t9 = space();
    			h1 = element("h1");
    			i = element("i");
    			t10 = text("Hazard Assessments");
    			t11 = space();
    			ul1 = element("ul");
    			li3 = element("li");
    			a4 = element("a");
    			a4.textContent = "Overview";
    			t13 = space();
    			li4 = element("li");
    			a5 = element("a");
    			a5.textContent = "Admin";
    			t15 = space();
    			if (if_block) if_block.c();
    			t16 = space();
    			create_component(pullout0.$$.fragment);
    			t17 = space();
    			create_component(pullout1.$$.fragment);
    			attr_dev(a0, "href", "#platform");
    			add_location(a0, file$3, 372, 16, 10886);
    			add_location(li0, file$3, 372, 12, 10882);
    			attr_dev(a1, "href", "#ehs");
    			add_location(a1, file$3, 373, 16, 10979);
    			add_location(li1, file$3, 373, 12, 10975);
    			add_location(li2, file$3, 374, 12, 11052);
    			attr_dev(ul0, "class", "breadcrumb");
    			add_location(ul0, file$3, 371, 8, 10846);
    			attr_dev(div0, "class", "col12 col-sm-5");
    			add_location(div0, file$3, 370, 4, 10809);
    			attr_dev(a2, "href", "#ehs/incidents/queries_new");
    			attr_dev(a2, "class", "btn btn-secondary");
    			add_location(a2, file$3, 379, 8, 11221);
    			attr_dev(a3, "href", "#ehs/incidents/incidents_new");
    			attr_dev(a3, "class", "btn");
    			add_location(a3, file$3, 380, 8, 11343);
    			attr_dev(div1, "class", "col12 col-sm-7 text-right");
    			add_location(div1, file$3, 377, 4, 11109);
    			attr_dev(div2, "class", "row sticky");
    			add_location(div2, file$3, 369, 0, 10780);
    			attr_dev(i, "class", "i-hazard-assessments i-32");
    			add_location(i, file$3, 385, 23, 11488);
    			attr_dev(h1, "class", "page-title");
    			add_location(h1, file$3, 385, 0, 11465);
    			attr_dev(a4, "href", "#ehs/incidents/overview");
    			toggle_class(a4, "active", /*tab*/ ctx[1] == "overview");
    			add_location(a4, file$3, 388, 8, 11580);
    			add_location(li3, file$3, 388, 4, 11576);
    			attr_dev(a5, "href", "#ehs/incidents/admin");
    			toggle_class(a5, "active", /*tab*/ ctx[1] == "admin");
    			add_location(a5, file$3, 389, 8, 11718);
    			add_location(li4, file$3, 389, 4, 11714);
    			attr_dev(ul1, "class", "tabs");
    			add_location(ul1, file$3, 387, 0, 11554);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, ul0);
    			append_dev(ul0, li0);
    			append_dev(li0, a0);
    			append_dev(ul0, t1);
    			append_dev(ul0, li1);
    			append_dev(li1, a1);
    			append_dev(ul0, t3);
    			append_dev(ul0, li2);
    			append_dev(div2, t5);
    			append_dev(div2, div1);
    			append_dev(div1, a2);
    			append_dev(div1, t7);
    			append_dev(div1, a3);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, h1, anchor);
    			append_dev(h1, i);
    			append_dev(h1, t10);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, ul1, anchor);
    			append_dev(ul1, li3);
    			append_dev(li3, a4);
    			append_dev(ul1, t13);
    			append_dev(ul1, li4);
    			append_dev(li4, a5);
    			insert_dev(target, t15, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, t16, anchor);
    			mount_component(pullout0, target, anchor);
    			insert_dev(target, t17, anchor);
    			mount_component(pullout1, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(a0, "click", /*click_handler*/ ctx[21], false, false, false),
    					listen_dev(a1, "click", /*click_handler_1*/ ctx[22], false, false, false),
    					listen_dev(a2, "click", /*click_handler_2*/ ctx[23], false, false, false),
    					listen_dev(a3, "click", /*click_handler_3*/ ctx[24], false, false, false),
    					listen_dev(a4, "click", /*click_handler_4*/ ctx[25], false, false, false),
    					listen_dev(a5, "click", /*click_handler_5*/ ctx[26], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*tab*/ 2) {
    				toggle_class(a4, "active", /*tab*/ ctx[1] == "overview");
    			}

    			if (dirty[0] & /*tab*/ 2) {
    				toggle_class(a5, "active", /*tab*/ ctx[1] == "admin");
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(t16.parentNode, t16);
    				} else {
    					if_block = null;
    				}
    			}

    			const pullout0_changes = {};
    			if (dirty[0] & /*table_drawer*/ 1) pullout0_changes.show_drawer = /*table_drawer*/ ctx[0];

    			if (dirty[0] & /*table_settings_form*/ 4 | dirty[1] & /*$$scope*/ 16384) {
    				pullout0_changes.$$scope = { dirty, ctx };
    			}

    			pullout0.$set(pullout0_changes);
    			const pullout1_changes = {};
    			if (dirty[0] & /*pin_drawer*/ 32) pullout1_changes.show_drawer = /*pin_drawer*/ ctx[5];
    			if (dirty[0] & /*pin_title*/ 16) pullout1_changes.title = /*pin_title*/ ctx[4];

    			if (dirty[1] & /*$$scope*/ 16384) {
    				pullout1_changes.$$scope = { dirty, ctx };
    			}

    			pullout1.$set(pullout1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(pullout0.$$.fragment, local);
    			transition_in(pullout1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(pullout0.$$.fragment, local);
    			transition_out(pullout1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(ul1);
    			if (detaching) detach_dev(t15);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(t16);
    			destroy_component(pullout0, detaching);
    			if (detaching) detach_dev(t17);
    			destroy_component(pullout1, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let table_data_sorted;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Frame_hazard_assessments", slots, []);

    	let components = {
    		"record_id": RecordID,
    		"status": Status,
    		"channel": Channel,
    		"created_date": Date_1
    	};

    	const dispatch = createEventDispatcher();
    	let tab = "overview";
    	let { tabnav = "" } = $$props;

    	let columns = [
    		{
    			"key": "section",
    			"value": "Common Fields",
    			"children": [
    				{
    					"key": "record_id",
    					"value": "Record ID",
    					"selectable": false,
    					"selected": true,
    					"pii": false,
    					"sortable": true,
    					"sorted": "desc"
    				},
    				{
    					"key": "channel",
    					"value": "Channel",
    					"selectable": true,
    					"selected": true,
    					"pii": false,
    					"sortable": true
    				},
    				{
    					"key": "created_date",
    					"value": "Date created on",
    					"selectable": true,
    					"selected": true,
    					"pii": false,
    					"sortable": true,
    					"sortable_type": "date"
    				},
    				{
    					"key": "created_by",
    					"value": "Creator",
    					"selectable": true,
    					"selected": true,
    					"pii": true,
    					"sortable": true
    				},
    				{
    					"key": "updated_date",
    					"value": "Date updated on",
    					"selectable": true,
    					"selected": false,
    					"pii": false,
    					"sortable": true,
    					"sortable_type": "date"
    				},
    				{
    					"key": "updated_by",
    					"value": "Updated by",
    					"selectable": true,
    					"selected": false,
    					"pii": true,
    					"sortable": true
    				},
    				{
    					"key": "status",
    					"value": "Status",
    					"selectable": true,
    					"selected": true,
    					"pii": false,
    					"sortable": true
    				},
    				{
    					"key": "group",
    					"value": "Group",
    					"selectable": true,
    					"selected": false,
    					"pii": false,
    					"sortable": true
    				},
    				{
    					"key": "division",
    					"value": "Division",
    					"selectable": true,
    					"selected": false,
    					"pii": false,
    					"sortable": true
    				},
    				{
    					"key": "sector",
    					"value": "Sector",
    					"selectable": true,
    					"selected": false,
    					"pii": false,
    					"sortable": true
    				}
    			]
    		},
    		{
    			"key": "section",
    			"value": "Report Event",
    			"children": [
    				{
    					"key": "site",
    					"value": "Site",
    					"selectable": true,
    					"selected": false,
    					"pii": false
    				},
    				{
    					"key": "primary_event_type",
    					"value": "Event",
    					"selectable": true,
    					"selected": true,
    					"pii": false
    				}
    			]
    		}
    	];

    	let edit_columns = [];
    	let table_settings_form = [];
    	let channel = "TABLE";
    	let sub = pubsub.subscribe(channel, read_answer);

    	function read_answer(msg, data) {
    		if (data.id == "table_settings_multi") {
    			edit_columns = data.options;
    		}
    	}

    	function save_table_settings() {
    		$$invalidate(18, columns = edit_columns);
    		$$invalidate(2, table_settings_form[0].options = edit_columns, table_settings_form);
    		table_cancel();
    	} /*
    table_settings_form.options = columns;
    table_settings_form = table_settings_form;
    */

    	let selected_columns = [];

    	let table_data = [
    		{
    			"created_date": "2022-01-22T13:08:10.430Z",
    			"created_by": "Mike Wazowski",
    			"updated_date": "2022-01-24T3:48:19.430Z",
    			"updated_by": "Mike Wazowski",
    			"group": "Ireland",
    			"division": "Cork",
    			"sector": "Plumbing",
    			"record_id": 485,
    			"channel": "rapid",
    			"primary_event_type": "Near miss",
    			"date_time": "2022-01-24T03:48:19.430Z",
    			"time_relative": "9hr 42min",
    			"location": "Main Office",
    			"custom_field_shift": "Yellow Shift",
    			"open_actions": 0,
    			"total_actions": 2,
    			"open_total_actions": "0/2",
    			"status": "in_progress"
    		},
    		{
    			"created_date": "2022-01-22T03:48:19.430Z",
    			"created_by": "James P Sullivan",
    			"updated_date": "2022-01-24T3:48:19.430Z",
    			"updated_by": "Fungus",
    			"group": "Ireland",
    			"division": "Cork",
    			"sector": "Plumbing",
    			"record_id": 484,
    			"channel": "eco",
    			"primary_event_type": "Accident",
    			"date_time": "2022-01-24T3:48:19.430Z",
    			"time_relative": "9hr 42min",
    			"location": "Main Office",
    			"custom_field_shift": "Red Shift",
    			"open_actions": 0,
    			"total_actions": 2,
    			"open_total_actions": "0/2",
    			"status": "awaiting_triage"
    		},
    		{
    			"created_date": "2022-01-22T18:56:19.430Z",
    			"created_by": "Boo",
    			"updated_date": "2022-01-24T3:48:19.430Z",
    			"updated_by": "Fungus",
    			"group": "Ireland",
    			"division": "Cork",
    			"sector": "Plumbing",
    			"record_id": 486,
    			"channel": "rapid",
    			"primary_event_type": "Accident",
    			"date_time": "2022-01-24T3:48:19.430Z",
    			"time_relative": "9hr 42min",
    			"location": "Main Office",
    			"custom_field_shift": "Blue Shift",
    			"open_actions": 0,
    			"total_actions": 2,
    			"open_total_actions": "0/2",
    			"status": "awaiting_investigation"
    		}
    	];

    	function sort_table(th) {
    		if (!th.sortable) {
    			console.log("cant sort this column");
    			return false;
    		}

    		let new_sort_dir = th.sorted == "desc" ? "asc" : "desc";
    		let new_sort_key = th.key;

    		//remove old key
    		let c = selected_columns[sort_key];

    		if (c) {
    			delete c.sorted;
    		}

    		//update new
    		th.sorted = new_sort_dir;

    		$$invalidate(20, sort_dir = new_sort_dir);
    		$$invalidate(19, sort_key = new_sort_key);
    		$$invalidate(18, columns);
    	}

    	let sort_key = "record_id";
    	let sort_dir = "desc";
    	let table_drawer = false;

    	function table_cancel() {
    		$$invalidate(0, table_drawer = false);
    	}

    	function nav(str) {
    		dispatch("nav", { text: str });
    	}

    	let pin_title = "Pin module";
    	let pin_drawer = false;

    	let pin_form = [
    		{
    			item_type: "input_select",
    			id: "pin_module_dashboard",
    			label: "Select a dashboard to pin it to",
    			options: [
    				{ "value": 1, "text": "Dashboard 1" },
    				{ "value": 2, "text": "Dashboard 2" },
    				{ "value": 3, "text": "Dashboard 3" },
    				{ "value": 4, "text": "Dashboard 4" },
    				{ "value": 5, "text": "Dashboard 5" }
    			],
    			answer: ""
    		},
    		{
    			item_type: "input_checkbox",
    			id: "pin_module_navigate",
    			options: [
    				{
    					"value": false,
    					"text": "Open the dashboard after you pin it?"
    				}
    			],
    			answer: ""
    		}
    	];

    	function pin_module(title) {
    		$$invalidate(4, pin_title = "Pin " + title);
    		$$invalidate(5, pin_drawer = true);
    	}

    	function pin_save() {
    		$$invalidate(5, pin_drawer = false);

    		if (pin_form[1].options[0].value) {
    			alert("Pinned");
    			window.location.hash = "#ehs/dashboards";
    		} else {
    			alert("Pinned");
    		}
    	}

    	function pin_cancel() {
    		$$invalidate(5, pin_drawer = false);
    	}

    	const writable_props = ["tabnav"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Frame_hazard_assessments> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		nav("platform");
    	};

    	const click_handler_1 = () => {
    		nav("ehs");
    	};

    	const click_handler_2 = () => {
    		nav("queries_new");
    	};

    	const click_handler_3 = () => {
    		nav("incidents_new");
    	};

    	const click_handler_4 = () => {
    		$$invalidate(1, tab = "dashboard");
    	};

    	const click_handler_5 = () => {
    		$$invalidate(1, tab = "admin");
    	};

    	const click_handler_6 = () => {
    		pin_module("Events by Type");
    	};

    	const click_handler_7 = () => {
    		pin_module("Latest Events");
    	};

    	const click_handler_8 = () => {
    		$$invalidate(0, table_drawer = true);
    	};

    	const click_handler_9 = th => {
    		sort_table(th);
    	};

    	$$self.$$set = $$props => {
    		if ("tabnav" in $$props) $$invalidate(17, tabnav = $$props.tabnav);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		PubSub: pubsub,
    		Pullout,
    		BigNumber,
    		Form,
    		RecordID,
    		Status,
    		Channel,
    		DateComp: Date_1,
    		components,
    		dispatch,
    		tab,
    		tabnav,
    		columns,
    		edit_columns,
    		table_settings_form,
    		channel,
    		sub,
    		read_answer,
    		save_table_settings,
    		selected_columns,
    		table_data,
    		sort_table,
    		sort_key,
    		sort_dir,
    		table_drawer,
    		table_cancel,
    		nav,
    		pin_title,
    		pin_drawer,
    		pin_form,
    		pin_module,
    		pin_save,
    		pin_cancel,
    		table_data_sorted
    	});

    	$$self.$inject_state = $$props => {
    		if ("components" in $$props) $$invalidate(7, components = $$props.components);
    		if ("tab" in $$props) $$invalidate(1, tab = $$props.tab);
    		if ("tabnav" in $$props) $$invalidate(17, tabnav = $$props.tabnav);
    		if ("columns" in $$props) $$invalidate(18, columns = $$props.columns);
    		if ("edit_columns" in $$props) edit_columns = $$props.edit_columns;
    		if ("table_settings_form" in $$props) $$invalidate(2, table_settings_form = $$props.table_settings_form);
    		if ("channel" in $$props) $$invalidate(8, channel = $$props.channel);
    		if ("sub" in $$props) sub = $$props.sub;
    		if ("selected_columns" in $$props) $$invalidate(3, selected_columns = $$props.selected_columns);
    		if ("table_data" in $$props) $$invalidate(35, table_data = $$props.table_data);
    		if ("sort_key" in $$props) $$invalidate(19, sort_key = $$props.sort_key);
    		if ("sort_dir" in $$props) $$invalidate(20, sort_dir = $$props.sort_dir);
    		if ("table_drawer" in $$props) $$invalidate(0, table_drawer = $$props.table_drawer);
    		if ("pin_title" in $$props) $$invalidate(4, pin_title = $$props.pin_title);
    		if ("pin_drawer" in $$props) $$invalidate(5, pin_drawer = $$props.pin_drawer);
    		if ("pin_form" in $$props) $$invalidate(13, pin_form = $$props.pin_form);
    		if ("table_data_sorted" in $$props) $$invalidate(6, table_data_sorted = $$props.table_data_sorted);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*tabnav*/ 131072) {
    			{
    				let t = tabnav;

    				if (tabnav !== "") {
    					$$invalidate(1, tab = t);
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*columns*/ 262144) {
    			{
    				let temp_sel = {};
    				let c = columns;

    				c.forEach(group => {
    					group.children.forEach(col => {
    						if (col.selected == true) {
    							temp_sel[col.key] = col;
    						}
    					});
    				});

    				$$invalidate(3, selected_columns = temp_sel);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*sort_key, sort_dir*/ 1572864) {
    			$$invalidate(6, table_data_sorted = table_data.sort((a, b) => {
    				let A = (a[sort_key] + "").toLowerCase();
    				let B = (b[sort_key] + "").toLowerCase();

    				if (sort_dir == "desc") {
    					return A < B ? 1 : -1;
    				} else {
    					return A > B ? 1 : -1;
    				}
    			}));
    		}

    		if ($$self.$$.dirty[0] & /*table_drawer, columns*/ 262145) {
    			{
    				let s = table_drawer;

    				if (s) {
    					$$invalidate(2, table_settings_form = [
    						{
    							item_type: "input_multi",
    							id: "table_settings_multi",
    							label: "Columns to show",
    							hint: "All users will see these changes. Any that contain personally identifiable information will be redacted if the user doesn't have permission.",
    							max_warning: {
    								value: 10,
    								message: "If you have too many columns this page may become unresponsive for all users. You can always pin this table to your own dashboard to customize further."
    							},
    							options: JSON.parse(JSON.stringify(columns)),
    							answer: ""
    						}
    					]);
    				}
    			}
    		}
    	};

    	return [
    		table_drawer,
    		tab,
    		table_settings_form,
    		selected_columns,
    		pin_title,
    		pin_drawer,
    		table_data_sorted,
    		components,
    		channel,
    		save_table_settings,
    		sort_table,
    		table_cancel,
    		nav,
    		pin_form,
    		pin_module,
    		pin_save,
    		pin_cancel,
    		tabnav,
    		columns,
    		sort_key,
    		sort_dir,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5,
    		click_handler_6,
    		click_handler_7,
    		click_handler_8,
    		click_handler_9
    	];
    }

    class Frame_hazard_assessments extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { tabnav: 17 }, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Frame_hazard_assessments",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get tabnav() {
    		throw new Error("<Frame_hazard_assessments>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tabnav(value) {
    		throw new Error("<Frame_hazard_assessments>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Frame_queries_new.svelte generated by Svelte v3.35.0 */
    const file$2 = "src/Frame_queries_new.svelte";

    function create_fragment$2(ctx) {
    	let div2;
    	let div0;
    	let ul0;
    	let li0;
    	let a0;
    	let t1;
    	let li1;
    	let a1;
    	let t3;
    	let li2;
    	let a2;
    	let t5;
    	let li3;
    	let t7;
    	let div1;
    	let a3;
    	let t9;
    	let h1;
    	let i;
    	let t10;
    	let t11;
    	let ul1;
    	let li4;
    	let a4;
    	let t13;
    	let li5;
    	let a5;
    	let t15;
    	let li6;
    	let a6;
    	let t17;
    	let li7;
    	let a7;
    	let t19;
    	let div9;
    	let div5;
    	let div4;
    	let div3;
    	let h20;
    	let t21;
    	let div8;
    	let div7;
    	let div6;
    	let h21;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			ul0 = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			a0.textContent = "EcoOnline";
    			t1 = space();
    			li1 = element("li");
    			a1 = element("a");
    			a1.textContent = "EHS";
    			t3 = space();
    			li2 = element("li");
    			a2 = element("a");
    			a2.textContent = "Incidents";
    			t5 = space();
    			li3 = element("li");
    			li3.textContent = "New Query";
    			t7 = space();
    			div1 = element("div");
    			a3 = element("a");
    			a3.textContent = "Run";
    			t9 = space();
    			h1 = element("h1");
    			i = element("i");
    			t10 = text(" New query");
    			t11 = space();
    			ul1 = element("ul");
    			li4 = element("li");
    			a4 = element("a");
    			a4.textContent = "Overview";
    			t13 = space();
    			li5 = element("li");
    			a5 = element("a");
    			a5.textContent = "Query";
    			t15 = space();
    			li6 = element("li");
    			a6 = element("a");
    			a6.textContent = "Summary";
    			t17 = space();
    			li7 = element("li");
    			a7 = element("a");
    			a7.textContent = "Admin";
    			t19 = space();
    			div9 = element("div");
    			div5 = element("div");
    			div4 = element("div");
    			div3 = element("div");
    			h20 = element("h2");
    			h20.textContent = "Add a filter";
    			t21 = space();
    			div8 = element("div");
    			div7 = element("div");
    			div6 = element("div");
    			h21 = element("h2");
    			h21.textContent = "Query filters";
    			attr_dev(a0, "href", "#platform");
    			add_location(a0, file$2, 17, 16, 320);
    			add_location(li0, file$2, 17, 12, 316);
    			attr_dev(a1, "href", "#ehs");
    			add_location(a1, file$2, 18, 16, 375);
    			add_location(li1, file$2, 18, 12, 371);
    			attr_dev(a2, "href", "#ehs/incidents");
    			add_location(a2, file$2, 19, 16, 419);
    			add_location(li2, file$2, 19, 12, 415);
    			add_location(li3, file$2, 20, 12, 475);
    			attr_dev(ul0, "class", "breadcrumb");
    			add_location(ul0, file$2, 16, 8, 280);
    			attr_dev(div0, "class", "col12 col-sm-7");
    			add_location(div0, file$2, 15, 4, 243);
    			attr_dev(a3, "href", "#ehs/incidents/queries_result");
    			attr_dev(a3, "class", "btn");
    			add_location(a3, file$2, 24, 8, 571);
    			attr_dev(div1, "class", "col12 col-sm-5 text-right");
    			add_location(div1, file$2, 23, 4, 523);
    			attr_dev(div2, "class", "row sticky");
    			add_location(div2, file$2, 14, 0, 214);
    			attr_dev(i, "class", "i-filter i-32");
    			add_location(i, file$2, 27, 23, 672);
    			attr_dev(h1, "class", "page-title");
    			add_location(h1, file$2, 27, 0, 649);
    			attr_dev(a4, "href", "#ehs/incidents");
    			add_location(a4, file$2, 29, 8, 743);
    			add_location(li4, file$2, 29, 4, 739);
    			attr_dev(a5, "href", "#ehs/incidents/queries_new");
    			attr_dev(a5, "class", "active");
    			add_location(a5, file$2, 30, 8, 794);
    			add_location(li5, file$2, 30, 4, 790);
    			attr_dev(a6, "href", "#ehs/incidents/summary");
    			add_location(a6, file$2, 31, 8, 869);
    			add_location(li6, file$2, 31, 4, 865);
    			attr_dev(a7, "href", "#ehs/incidents/incidents_admin");
    			add_location(a7, file$2, 32, 8, 927);
    			add_location(li7, file$2, 32, 4, 923);
    			attr_dev(ul1, "class", "tabs");
    			add_location(ul1, file$2, 28, 0, 717);
    			add_location(h20, file$2, 38, 16, 1121);
    			attr_dev(div3, "class", "card-header");
    			add_location(div3, file$2, 37, 12, 1079);
    			attr_dev(div4, "class", "card");
    			add_location(div4, file$2, 36, 8, 1048);
    			attr_dev(div5, "class", "col12 col-md-3");
    			add_location(div5, file$2, 35, 4, 1011);
    			add_location(h21, file$2, 45, 16, 1302);
    			attr_dev(div6, "class", "card-header");
    			add_location(div6, file$2, 44, 12, 1260);
    			attr_dev(div7, "class", "card");
    			add_location(div7, file$2, 43, 8, 1229);
    			attr_dev(div8, "class", "col12 col-md-9");
    			add_location(div8, file$2, 42, 4, 1192);
    			attr_dev(div9, "class", "row");
    			add_location(div9, file$2, 34, 0, 989);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, ul0);
    			append_dev(ul0, li0);
    			append_dev(li0, a0);
    			append_dev(ul0, t1);
    			append_dev(ul0, li1);
    			append_dev(li1, a1);
    			append_dev(ul0, t3);
    			append_dev(ul0, li2);
    			append_dev(li2, a2);
    			append_dev(ul0, t5);
    			append_dev(ul0, li3);
    			append_dev(div2, t7);
    			append_dev(div2, div1);
    			append_dev(div1, a3);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, h1, anchor);
    			append_dev(h1, i);
    			append_dev(h1, t10);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, ul1, anchor);
    			append_dev(ul1, li4);
    			append_dev(li4, a4);
    			append_dev(ul1, t13);
    			append_dev(ul1, li5);
    			append_dev(li5, a5);
    			append_dev(ul1, t15);
    			append_dev(ul1, li6);
    			append_dev(li6, a6);
    			append_dev(ul1, t17);
    			append_dev(ul1, li7);
    			append_dev(li7, a7);
    			insert_dev(target, t19, anchor);
    			insert_dev(target, div9, anchor);
    			append_dev(div9, div5);
    			append_dev(div5, div4);
    			append_dev(div4, div3);
    			append_dev(div3, h20);
    			append_dev(div9, t21);
    			append_dev(div9, div8);
    			append_dev(div8, div7);
    			append_dev(div7, div6);
    			append_dev(div6, h21);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(ul1);
    			if (detaching) detach_dev(t19);
    			if (detaching) detach_dev(div9);
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
    	validate_slots("Frame_queries_new", slots, []);
    	const dispatch = createEventDispatcher();
    	let tab = "dashboard";

    	function nav(str) {
    		dispatch("nav", { text: str });
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Frame_queries_new> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		tab,
    		nav
    	});

    	$$self.$inject_state = $$props => {
    		if ("tab" in $$props) tab = $$props.tab;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [];
    }

    class Frame_queries_new extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Frame_queries_new",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/Frame_queries_result.svelte generated by Svelte v3.35.0 */
    const file$1 = "src/Frame_queries_result.svelte";

    function create_fragment$1(ctx) {
    	let div2;
    	let div0;
    	let ul;
    	let li0;
    	let a0;
    	let t1;
    	let li1;
    	let a1;
    	let t3;
    	let li2;
    	let a2;
    	let t5;
    	let li3;
    	let t7;
    	let div1;
    	let a3;
    	let t8;
    	let i0;
    	let t9;
    	let a4;
    	let t11;
    	let a5;
    	let t13;
    	let a6;
    	let t15;
    	let h1;
    	let i1;
    	let t16;
    	let t17;
    	let div7;
    	let div6;
    	let div5;
    	let table;
    	let thead;
    	let tr0;
    	let th0;
    	let t19;
    	let th1;
    	let t21;
    	let th2;
    	let t23;
    	let th3;
    	let t25;
    	let th4;
    	let t27;
    	let th5;
    	let t29;
    	let th6;
    	let t31;
    	let th7;
    	let t33;
    	let th8;
    	let t35;
    	let tbody;
    	let tr1;
    	let td0;
    	let b;
    	let t37;
    	let td1;
    	let t39;
    	let td2;
    	let t41;
    	let td3;
    	let t43;
    	let td4;
    	let t45;
    	let td5;
    	let t47;
    	let td6;
    	let t49;
    	let td7;
    	let t51;
    	let td8;
    	let t53;
    	let div4;
    	let div3;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			a0.textContent = "EcoOnline";
    			t1 = space();
    			li1 = element("li");
    			a1 = element("a");
    			a1.textContent = "EHS";
    			t3 = space();
    			li2 = element("li");
    			a2 = element("a");
    			a2.textContent = "Incidents";
    			t5 = space();
    			li3 = element("li");
    			li3.textContent = "Query Result";
    			t7 = space();
    			div1 = element("div");
    			a3 = element("a");
    			t8 = space();
    			i0 = element("i");
    			t9 = space();
    			a4 = element("a");
    			a4.textContent = "New query";
    			t11 = space();
    			a5 = element("a");
    			a5.textContent = "Add to dashboard";
    			t13 = space();
    			a6 = element("a");
    			a6.textContent = "Save";
    			t15 = space();
    			h1 = element("h1");
    			i1 = element("i");
    			t16 = text(" Query results");
    			t17 = space();
    			div7 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			table = element("table");
    			thead = element("thead");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "Record ID";
    			t19 = space();
    			th1 = element("th");
    			th1.textContent = "Report Type";
    			t21 = space();
    			th2 = element("th");
    			th2.textContent = "Source";
    			t23 = space();
    			th3 = element("th");
    			th3.textContent = "Event Type";
    			t25 = space();
    			th4 = element("th");
    			th4.textContent = "When";
    			t27 = space();
    			th5 = element("th");
    			th5.textContent = "Location";
    			t29 = space();
    			th6 = element("th");
    			th6.textContent = "Shift";
    			t31 = space();
    			th7 = element("th");
    			th7.textContent = "Open Actions";
    			t33 = space();
    			th8 = element("th");
    			th8.textContent = "Status";
    			t35 = space();
    			tbody = element("tbody");
    			tr1 = element("tr");
    			td0 = element("td");
    			b = element("b");
    			b.textContent = "485";
    			t37 = space();
    			td1 = element("td");
    			td1.textContent = "Full Report";
    			t39 = space();
    			td2 = element("td");
    			td2.textContent = "[]";
    			t41 = space();
    			td3 = element("td");
    			td3.textContent = "Near Miss";
    			t43 = space();
    			td4 = element("td");
    			td4.textContent = "9hr 4min";
    			t45 = space();
    			td5 = element("td");
    			td5.textContent = "Main Office";
    			t47 = space();
    			td6 = element("td");
    			td6.textContent = "Yellow";
    			t49 = space();
    			td7 = element("td");
    			td7.textContent = "0";
    			t51 = space();
    			td8 = element("td");
    			td8.textContent = "In Progress";
    			t53 = space();
    			div4 = element("div");
    			div3 = element("div");
    			attr_dev(a0, "href", "#platform");
    			add_location(a0, file$1, 17, 16, 320);
    			add_location(li0, file$1, 17, 12, 316);
    			attr_dev(a1, "href", "#ehs");
    			add_location(a1, file$1, 18, 16, 375);
    			add_location(li1, file$1, 18, 12, 371);
    			attr_dev(a2, "href", "#ehs/incidents");
    			add_location(a2, file$1, 19, 16, 419);
    			add_location(li2, file$1, 19, 12, 415);
    			add_location(li3, file$1, 20, 12, 475);
    			attr_dev(ul, "class", "breadcrumb");
    			add_location(ul, file$1, 16, 8, 280);
    			attr_dev(div0, "class", "col12 col-md-5");
    			add_location(div0, file$1, 15, 4, 243);
    			attr_dev(a3, "title", "Edit this query");
    			attr_dev(a3, "class", "i-edit i-24");
    			attr_dev(a3, "href", "#ehs/incidents/queries_new");
    			add_location(a3, file$1, 24, 8, 574);
    			attr_dev(i0, "title", "Download these results");
    			attr_dev(i0, "class", "i-download i-24");
    			add_location(i0, file$1, 25, 8, 710);
    			attr_dev(a4, "href", "#ehs/incidents/queries_new");
    			attr_dev(a4, "class", "btn btn-secondary");
    			add_location(a4, file$1, 26, 8, 781);
    			attr_dev(a5, "href", "/");
    			attr_dev(a5, "class", "btn btn-secondary");
    			add_location(a5, file$1, 27, 8, 907);
    			attr_dev(a6, "href", "/");
    			attr_dev(a6, "class", "btn");
    			add_location(a6, file$1, 28, 8, 974);
    			attr_dev(div1, "class", "col12 col-md-7 text-right");
    			add_location(div1, file$1, 23, 4, 526);
    			attr_dev(div2, "class", "row sticky");
    			add_location(div2, file$1, 14, 0, 214);
    			attr_dev(i1, "class", "i-filter i-32");
    			add_location(i1, file$1, 31, 23, 1048);
    			attr_dev(h1, "class", "page-title");
    			add_location(h1, file$1, 31, 0, 1025);
    			add_location(th0, file$1, 39, 24, 1284);
    			add_location(th1, file$1, 40, 24, 1327);
    			add_location(th2, file$1, 41, 24, 1372);
    			add_location(th3, file$1, 42, 24, 1412);
    			add_location(th4, file$1, 43, 24, 1456);
    			add_location(th5, file$1, 44, 24, 1494);
    			add_location(th6, file$1, 45, 24, 1536);
    			add_location(th7, file$1, 46, 24, 1575);
    			add_location(th8, file$1, 47, 24, 1621);
    			add_location(tr0, file$1, 38, 20, 1255);
    			add_location(thead, file$1, 37, 16, 1227);
    			add_location(b, file$1, 52, 28, 1765);
    			add_location(td0, file$1, 52, 24, 1761);
    			add_location(td1, file$1, 53, 24, 1805);
    			add_location(td2, file$1, 54, 24, 1850);
    			add_location(td3, file$1, 55, 24, 1886);
    			add_location(td4, file$1, 56, 24, 1929);
    			add_location(td5, file$1, 57, 24, 1971);
    			add_location(td6, file$1, 58, 24, 2016);
    			add_location(td7, file$1, 59, 24, 2056);
    			add_location(td8, file$1, 60, 24, 2091);
    			add_location(tr1, file$1, 51, 20, 1732);
    			add_location(tbody, file$1, 50, 16, 1704);
    			attr_dev(table, "class", "table");
    			add_location(table, file$1, 36, 12, 1189);
    			attr_dev(div3, "class", "pagination");
    			add_location(div3, file$1, 65, 44, 2249);
    			attr_dev(div4, "class", "pagination-wrapper");
    			add_location(div4, file$1, 65, 12, 2217);
    			attr_dev(div5, "class", "sticky-wrapper");
    			add_location(div5, file$1, 35, 8, 1148);
    			attr_dev(div6, "class", "col12");
    			add_location(div6, file$1, 34, 4, 1120);
    			attr_dev(div7, "class", "row");
    			add_location(div7, file$1, 33, 0, 1098);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a0);
    			append_dev(ul, t1);
    			append_dev(ul, li1);
    			append_dev(li1, a1);
    			append_dev(ul, t3);
    			append_dev(ul, li2);
    			append_dev(li2, a2);
    			append_dev(ul, t5);
    			append_dev(ul, li3);
    			append_dev(div2, t7);
    			append_dev(div2, div1);
    			append_dev(div1, a3);
    			append_dev(div1, t8);
    			append_dev(div1, i0);
    			append_dev(div1, t9);
    			append_dev(div1, a4);
    			append_dev(div1, t11);
    			append_dev(div1, a5);
    			append_dev(div1, t13);
    			append_dev(div1, a6);
    			insert_dev(target, t15, anchor);
    			insert_dev(target, h1, anchor);
    			append_dev(h1, i1);
    			append_dev(h1, t16);
    			insert_dev(target, t17, anchor);
    			insert_dev(target, div7, anchor);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			append_dev(div5, table);
    			append_dev(table, thead);
    			append_dev(thead, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t19);
    			append_dev(tr0, th1);
    			append_dev(tr0, t21);
    			append_dev(tr0, th2);
    			append_dev(tr0, t23);
    			append_dev(tr0, th3);
    			append_dev(tr0, t25);
    			append_dev(tr0, th4);
    			append_dev(tr0, t27);
    			append_dev(tr0, th5);
    			append_dev(tr0, t29);
    			append_dev(tr0, th6);
    			append_dev(tr0, t31);
    			append_dev(tr0, th7);
    			append_dev(tr0, t33);
    			append_dev(tr0, th8);
    			append_dev(table, t35);
    			append_dev(table, tbody);
    			append_dev(tbody, tr1);
    			append_dev(tr1, td0);
    			append_dev(td0, b);
    			append_dev(tr1, t37);
    			append_dev(tr1, td1);
    			append_dev(tr1, t39);
    			append_dev(tr1, td2);
    			append_dev(tr1, t41);
    			append_dev(tr1, td3);
    			append_dev(tr1, t43);
    			append_dev(tr1, td4);
    			append_dev(tr1, t45);
    			append_dev(tr1, td5);
    			append_dev(tr1, t47);
    			append_dev(tr1, td6);
    			append_dev(tr1, t49);
    			append_dev(tr1, td7);
    			append_dev(tr1, t51);
    			append_dev(tr1, td8);
    			append_dev(div5, t53);
    			append_dev(div5, div4);
    			append_dev(div4, div3);

    			if (!mounted) {
    				dispose = [
    					listen_dev(a3, "click", /*click_handler*/ ctx[1], false, false, false),
    					listen_dev(a4, "click", /*click_handler_1*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t17);
    			if (detaching) detach_dev(div7);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Frame_queries_result", slots, []);
    	const dispatch = createEventDispatcher();
    	let tab = "dashboard";

    	function nav(str) {
    		dispatch("nav", { text: str });
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Frame_queries_result> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		nav("queries_new");
    	};

    	const click_handler_1 = () => {
    		nav("queries_new");
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		tab,
    		nav
    	});

    	$$self.$inject_state = $$props => {
    		if ("tab" in $$props) tab = $$props.tab;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [nav, click_handler, click_handler_1];
    }

    class Frame_queries_result extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Frame_queries_result",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/Frame.svelte generated by Svelte v3.35.0 */

    const { console: console_1, window: window_1 } = globals;
    const file = "src/Frame.svelte";

    // (80:0) {#if grid}
    function create_if_block(ctx) {
    	let div1;
    	let div0;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(div0, "class", "frame svelte-1s2lye6");
    			add_location(div0, file, 80, 18, 2002);
    			attr_dev(div1, "class", "grid svelte-1s2lye6");
    			add_location(div1, file, 80, 0, 1984);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(80:0) {#if grid}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let t0;
    	let nav;
    	let div2;
    	let svg;
    	let path0;
    	let path1;
    	let path2;
    	let path3;
    	let path4;
    	let path5;
    	let path6;
    	let path7;
    	let path8;
    	let path9;
    	let t1;
    	let div0;
    	let i0;
    	let t2;
    	let input;
    	let t3;
    	let div1;
    	let span0;
    	let i1;
    	let t4;
    	let span1;
    	let i2;
    	let t5;
    	let span2;
    	let i3;
    	let t6;
    	let span3;
    	let i4;
    	let t7;
    	let span4;
    	let t9;
    	let span5;
    	let i5;
    	let t10;
    	let main;
    	let div3;
    	let switch_instance;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*grid*/ ctx[2] && create_if_block(ctx);
    	var switch_value = /*comp*/ ctx[1];

    	function switch_props(ctx) {
    		return {
    			props: {
    				tabnav: /*tabnav*/ ctx[0],
    				bodyScroll: /*bodyScroll*/ ctx[3]
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    		switch_instance.$on("nav", /*handleNav*/ ctx[5]);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			nav = element("nav");
    			div2 = element("div");
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			path5 = svg_element("path");
    			path6 = svg_element("path");
    			path7 = svg_element("path");
    			path8 = svg_element("path");
    			path9 = svg_element("path");
    			t1 = space();
    			div0 = element("div");
    			i0 = element("i");
    			t2 = space();
    			input = element("input");
    			t3 = space();
    			div1 = element("div");
    			span0 = element("span");
    			i1 = element("i");
    			t4 = space();
    			span1 = element("span");
    			i2 = element("i");
    			t5 = space();
    			span2 = element("span");
    			i3 = element("i");
    			t6 = space();
    			span3 = element("span");
    			i4 = element("i");
    			t7 = space();
    			span4 = element("span");
    			span4.textContent = "A";
    			t9 = space();
    			span5 = element("span");
    			i5 = element("i");
    			t10 = space();
    			main = element("main");
    			div3 = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			attr_dev(path0, "d", "M16.202 11.0018L16.792 9.6818C17.232 8.7118 18.202 8.0918 19.262 8.0918C19.982 8.0918 20.662 8.3718 21.172 8.8818L21.872 9.5818C20.632 10.2618 19.792 11.5818 19.792 13.0918V14.9718C19.792 18.3318 17.402 21.2218 14.102 21.8518L7.20199 23.1718C6.85199 23.2418 6.57199 23.4818 6.45199 23.8118C6.33199 24.1418 6.39199 24.5118 6.61199 24.7818C10.482 29.5718 16.302 31.0118 16.552 31.0718C16.632 31.0818 16.712 31.0918 16.792 31.0918C16.872 31.0918 16.952 31.0818 17.022 31.0618C17.162 31.0318 30.292 27.7318 30.292 15.0918V3.0918C30.292 1.9918 29.392 1.0918 28.292 1.0918H5.29199C4.19199 1.0918 3.29199 1.9918 3.29199 3.0918V18.3518L5.29199 16.3518V3.0918H28.292V15.0918C28.292 25.3918 18.512 28.5818 16.792 29.0518C15.852 28.7818 12.252 27.6018 9.34199 24.7918L14.482 23.8118C18.722 23.0018 21.792 19.2818 21.792 14.9718V13.0918C21.792 11.9918 22.692 11.0918 23.792 11.0918H24.642C25.222 11.0918 25.512 10.3918 25.102 9.9818L22.592 7.4718C21.702 6.5818 20.522 6.0918 19.262 6.0918C17.412 6.0918 15.732 7.1818 14.972 8.8618L14.452 10.0118L0.291992 24.1818V27.0118L16.002 11.3018C16.092 11.2118 16.152 11.1118 16.202 11.0018Z");
    			attr_dev(path0, "fill", "black");
    			add_location(path0, file, 90, 3, 2270);
    			attr_dev(path1, "d", "M39.292 22.0918V8.0918H48.252V10.1018H41.552V13.9918H47.632V16.0018H41.552V20.0918H48.252V22.0918H39.292Z");
    			attr_dev(path1, "fill", "black");
    			add_location(path1, file, 91, 3, 3418);
    			attr_dev(path2, "d", "M54.6821 22.3318C53.9321 22.3318 53.2621 22.2018 52.6721 21.9518C52.0821 21.7018 51.5922 21.3318 51.1922 20.8618C50.7922 20.3918 50.4821 19.8118 50.2721 19.1418C50.0621 18.4718 49.9521 17.7118 49.9521 16.8818C49.9521 16.0518 50.0621 15.3018 50.2721 14.6218C50.4821 13.9518 50.7922 13.3718 51.1922 12.9018C51.5922 12.4318 52.0921 12.0618 52.6721 11.8118C53.2621 11.5618 53.9321 11.4318 54.6821 11.4318C55.7221 11.4318 56.5821 11.6618 57.2521 12.1318C57.9221 12.6018 58.4121 13.2218 58.7121 14.0018L56.9121 14.8418C56.7621 14.3618 56.5121 13.9718 56.1421 13.6918C55.7721 13.4018 55.2922 13.2618 54.6922 13.2618C53.8922 13.2618 53.2822 13.5118 52.8722 14.0118C52.4622 14.5118 52.2621 15.1618 52.2621 15.9618V17.8218C52.2621 18.6218 52.4622 19.2718 52.8722 19.7718C53.2822 20.2718 53.8822 20.5218 54.6922 20.5218C55.3321 20.5218 55.8421 20.3618 56.2221 20.0518C56.6021 19.7418 56.9021 19.3218 57.1321 18.8018L58.7921 19.6818C58.4421 20.5418 57.9221 21.2018 57.2321 21.6618C56.5321 22.1018 55.6821 22.3318 54.6821 22.3318Z");
    			attr_dev(path2, "fill", "black");
    			add_location(path2, file, 92, 3, 3552);
    			attr_dev(path3, "d", "M64.8518 22.3318C64.1318 22.3318 63.4718 22.2018 62.8818 21.9518C62.2818 21.7018 61.7818 21.3318 61.3718 20.8618C60.9518 20.3918 60.6318 19.8118 60.4118 19.1418C60.1818 18.4718 60.0718 17.7118 60.0718 16.8818C60.0718 16.0518 60.1818 15.3018 60.4118 14.6218C60.6418 13.9518 60.9618 13.3718 61.3718 12.9018C61.7818 12.4318 62.2918 12.0618 62.8818 11.8118C63.4718 11.5618 64.1318 11.4318 64.8518 11.4318C65.5718 11.4318 66.2318 11.5618 66.8318 11.8118C67.4218 12.0618 67.9318 12.4318 68.3418 12.9018C68.7518 13.3718 69.0818 13.9518 69.3018 14.6218C69.5318 15.3018 69.6418 16.0518 69.6418 16.8818C69.6418 17.7118 69.5318 18.4618 69.3018 19.1418C69.0718 19.8218 68.7518 20.3918 68.3418 20.8618C67.9318 21.3318 67.4218 21.7018 66.8318 21.9518C66.2318 22.2018 65.5718 22.3318 64.8518 22.3318ZM64.8518 20.5018C65.6018 20.5018 66.2018 20.2718 66.6618 19.8118C67.1118 19.3518 67.3418 18.6618 67.3418 17.7518V15.9918C67.3418 15.0718 67.1118 14.3918 66.6618 13.9318C66.2018 13.4718 65.6018 13.2418 64.8518 13.2418C64.1018 13.2418 63.5018 13.4718 63.0518 13.9318C62.6018 14.3918 62.3718 15.0818 62.3718 15.9918V17.7518C62.3718 18.6718 62.6018 19.3518 63.0518 19.8118C63.5018 20.2718 64.1018 20.5018 64.8518 20.5018Z");
    			attr_dev(path3, "fill", "black");
    			add_location(path3, file, 93, 3, 4598);
    			attr_dev(path4, "d", "M77.832 22.3318C76.922 22.3318 76.092 22.1718 75.352 21.8618C74.612 21.5518 73.972 21.0918 73.442 20.4818C72.912 19.8718 72.502 19.1218 72.222 18.2118C71.932 17.3118 71.792 16.2718 71.792 15.0918C71.792 13.9118 71.932 12.8718 72.222 11.9718C72.512 11.0718 72.912 10.3118 73.442 9.70181C73.972 9.09181 74.602 8.63181 75.352 8.32181C76.092 8.01181 76.922 7.85181 77.832 7.85181C78.742 7.85181 79.562 8.01181 80.312 8.32181C81.052 8.63181 81.692 9.10181 82.222 9.70181C82.752 10.3118 83.162 11.0618 83.442 11.9718C83.732 12.8718 83.872 13.9118 83.872 15.0918C83.872 16.2718 83.732 17.3118 83.442 18.2118C83.152 19.1118 82.742 19.8718 82.222 20.4818C81.692 21.0918 81.062 21.5518 80.312 21.8618C79.562 22.1718 78.742 22.3318 77.832 22.3318ZM77.832 20.3218C78.362 20.3218 78.862 20.2318 79.302 20.0418C79.752 19.8518 80.132 19.5818 80.442 19.2218C80.752 18.8618 81.002 18.4318 81.172 17.9218C81.342 17.4118 81.432 16.8318 81.432 16.1918V13.9818C81.432 13.3418 81.342 12.7618 81.172 12.2518C81.002 11.7418 80.752 11.3118 80.442 10.9518C80.132 10.5918 79.742 10.3218 79.302 10.1318C78.852 9.94181 78.362 9.85181 77.832 9.85181C77.282 9.85181 76.792 9.94181 76.352 10.1318C75.912 10.3218 75.532 10.5918 75.222 10.9518C74.912 11.3118 74.662 11.7418 74.492 12.2518C74.322 12.7618 74.232 13.3418 74.232 13.9818V16.1918C74.232 16.8318 74.322 17.4118 74.492 17.9218C74.662 18.4318 74.912 18.8618 75.222 19.2218C75.532 19.5818 75.912 19.8518 76.352 20.0418C76.782 20.2318 77.282 20.3218 77.832 20.3218Z");
    			attr_dev(path4, "fill", "black");
    			add_location(path4, file, 94, 3, 5829);
    			attr_dev(path5, "d", "M86.1421 22.0918V11.6618H88.3321V13.3918H88.4321C88.6621 12.8318 89.0021 12.3618 89.4621 11.9918C89.9221 11.6218 90.5521 11.4318 91.3521 11.4318C92.4221 11.4318 93.2521 11.7818 93.8521 12.4818C94.4421 13.1818 94.7421 14.1818 94.7421 15.4818V22.0918H92.5521V15.7518C92.5521 14.1218 91.8921 13.3018 90.5821 13.3018C90.3021 13.3018 90.0221 13.3418 89.7521 13.4118C89.4821 13.4818 89.2321 13.5918 89.0221 13.7418C88.8121 13.8918 88.6421 14.0718 88.5121 14.3018C88.3821 14.5318 88.3221 14.7918 88.3221 15.1018V22.0918H86.1421Z");
    			attr_dev(path5, "fill", "black");
    			add_location(path5, file, 95, 3, 7346);
    			attr_dev(path6, "d", "M99.7522 22.0918C99.0022 22.0918 98.4422 21.9018 98.0822 21.5218C97.7122 21.1418 97.5322 20.6118 97.5322 19.9318V7.25183H99.7222V20.3018H101.162V22.0918H99.7522Z");
    			attr_dev(path6, "fill", "black");
    			add_location(path6, file, 96, 3, 7896);
    			attr_dev(path7, "d", "M104.102 9.80181C103.652 9.80181 103.312 9.69181 103.112 9.48181C102.902 9.27181 102.802 8.99181 102.802 8.66181V8.31181C102.802 7.98181 102.902 7.70181 103.112 7.49181C103.322 7.28181 103.652 7.17181 104.102 7.17181C104.552 7.17181 104.882 7.28181 105.082 7.49181C105.282 7.70181 105.382 7.98181 105.382 8.31181V8.65181C105.382 8.98181 105.282 9.26181 105.082 9.47181C104.882 9.69181 104.562 9.80181 104.102 9.80181ZM103.002 11.6618H105.192V22.0918H103.002V11.6618Z");
    			attr_dev(path7, "fill", "black");
    			add_location(path7, file, 97, 3, 8086);
    			attr_dev(path8, "d", "M108.052 22.0918V11.6618H110.242V13.3918H110.342C110.572 12.8318 110.912 12.3618 111.372 11.9918C111.832 11.6218 112.462 11.4318 113.262 11.4318C114.332 11.4318 115.162 11.7818 115.762 12.4818C116.352 13.1818 116.652 14.1818 116.652 15.4818V22.0918H114.462V15.7518C114.462 14.1218 113.802 13.3018 112.492 13.3018C112.212 13.3018 111.932 13.3418 111.662 13.4118C111.392 13.4818 111.142 13.5918 110.932 13.7418C110.722 13.8918 110.552 14.0718 110.422 14.3018C110.292 14.5318 110.232 14.7918 110.232 15.1018V22.0918H108.052Z");
    			attr_dev(path8, "fill", "black");
    			add_location(path8, file, 98, 3, 8581);
    			attr_dev(path9, "d", "M123.662 22.3318C122.912 22.3318 122.242 22.2018 121.652 21.9518C121.062 21.7018 120.562 21.3318 120.152 20.8618C119.742 20.3918 119.422 19.8118 119.202 19.1418C118.982 18.4718 118.872 17.7118 118.872 16.8818C118.872 16.0518 118.982 15.3018 119.202 14.6218C119.422 13.9518 119.742 13.3718 120.152 12.9018C120.562 12.4318 121.072 12.0618 121.652 11.8118C122.242 11.5618 122.912 11.4318 123.662 11.4318C124.422 11.4318 125.092 11.5618 125.682 11.8318C126.262 12.1018 126.752 12.4718 127.132 12.9418C127.512 13.4118 127.812 13.9718 128.002 14.5918C128.192 15.2218 128.292 15.8918 128.292 16.6218V17.4418H121.132V17.7818C121.132 18.5818 121.372 19.2318 121.842 19.7418C122.312 20.2518 122.992 20.5118 123.882 20.5118C124.522 20.5118 125.062 20.3718 125.502 20.0918C125.942 19.8118 126.312 19.4318 126.622 18.9518L127.902 20.2218C127.512 20.8618 126.952 21.3818 126.222 21.7618C125.492 22.1418 124.632 22.3318 123.662 22.3318ZM123.662 13.1218C123.292 13.1218 122.942 13.1918 122.632 13.3218C122.322 13.4518 122.052 13.6418 121.832 13.8818C121.612 14.1218 121.442 14.4118 121.322 14.7418C121.202 15.0718 121.142 15.4418 121.142 15.8418V15.9818H125.992V15.7818C125.992 14.9818 125.782 14.3318 125.372 13.8518C124.952 13.3718 124.382 13.1218 123.662 13.1218Z");
    			attr_dev(path9, "fill", "black");
    			add_location(path9, file, 99, 3, 9131);
    			attr_dev(svg, "width", "129");
    			attr_dev(svg, "height", "33");
    			attr_dev(svg, "viewBox", "0 0 129 33");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file, 89, 2, 2117);
    			attr_dev(i0, "class", "i-search i-20");
    			add_location(i0, file, 103, 3, 10447);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "Type a keyword to begin your search");
    			add_location(input, file, 104, 3, 10480);
    			attr_dev(div0, "class", "search-bar");
    			add_location(div0, file, 102, 2, 10419);
    			attr_dev(i1, "class", "i-rocket i-24");
    			add_location(i1, file, 108, 27, 10626);
    			attr_dev(span0, "class", "menu-icon");
    			add_location(span0, file, 108, 3, 10602);
    			attr_dev(i2, "class", "i-filter i-24");
    			add_location(i2, file, 109, 27, 10690);
    			attr_dev(span1, "class", "menu-icon");
    			add_location(span1, file, 109, 3, 10666);
    			attr_dev(i3, "class", "i-notification i-24");
    			add_location(i3, file, 110, 27, 10754);
    			attr_dev(span2, "class", "menu-icon");
    			add_location(span2, file, 110, 3, 10730);
    			attr_dev(i4, "class", "i-switcher i-24");
    			add_location(i4, file, 111, 27, 10824);
    			attr_dev(span3, "class", "menu-icon");
    			add_location(span3, file, 111, 3, 10800);
    			attr_dev(span4, "class", "menu-icon profile-picture");
    			add_location(span4, file, 112, 3, 10866);
    			attr_dev(i5, "class", "i-menu i-24");
    			add_location(i5, file, 114, 34, 10950);
    			attr_dev(span5, "class", "menu-icon mobile");
    			add_location(span5, file, 114, 3, 10919);
    			attr_dev(div1, "class", "menu-icons text-right");
    			add_location(div1, file, 107, 2, 10563);
    			attr_dev(div2, "class", "frame svelte-1s2lye6");
    			add_location(div2, file, 87, 1, 2094);
    			attr_dev(nav, "class", "svelte-1s2lye6");
    			add_location(nav, file, 85, 0, 2086);
    			attr_dev(div3, "class", "frame svelte-1s2lye6");
    			add_location(div3, file, 123, 1, 11049);
    			attr_dev(main, "class", "svelte-1s2lye6");
    			add_location(main, file, 122, 0, 11016);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, nav, anchor);
    			append_dev(nav, div2);
    			append_dev(div2, svg);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(svg, path2);
    			append_dev(svg, path3);
    			append_dev(svg, path4);
    			append_dev(svg, path5);
    			append_dev(svg, path6);
    			append_dev(svg, path7);
    			append_dev(svg, path8);
    			append_dev(svg, path9);
    			append_dev(div2, t1);
    			append_dev(div2, div0);
    			append_dev(div0, i0);
    			append_dev(div0, t2);
    			append_dev(div0, input);
    			append_dev(div2, t3);
    			append_dev(div2, div1);
    			append_dev(div1, span0);
    			append_dev(span0, i1);
    			append_dev(div1, t4);
    			append_dev(div1, span1);
    			append_dev(span1, i2);
    			append_dev(div1, t5);
    			append_dev(div1, span2);
    			append_dev(span2, i3);
    			append_dev(div1, t6);
    			append_dev(div1, span3);
    			append_dev(span3, i4);
    			append_dev(div1, t7);
    			append_dev(div1, span4);
    			append_dev(div1, t9);
    			append_dev(div1, span5);
    			append_dev(span5, i5);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, div3);

    			if (switch_instance) {
    				mount_component(switch_instance, div3, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window_1, "hashchange", /*handleHash*/ ctx[4], false, false, false),
    					listen_dev(svg, "click", /*click_handler*/ ctx[7], false, false, false),
    					listen_dev(main, "scroll", /*handleScroll*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*grid*/ ctx[2]) {
    				if (if_block) ; else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(t0.parentNode, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			const switch_instance_changes = {};
    			if (dirty & /*tabnav*/ 1) switch_instance_changes.tabnav = /*tabnav*/ ctx[0];
    			if (dirty & /*bodyScroll*/ 8) switch_instance_changes.bodyScroll = /*bodyScroll*/ ctx[3];

    			if (switch_value !== (switch_value = /*comp*/ ctx[1])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					switch_instance.$on("nav", /*handleNav*/ ctx[5]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div3, null);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(nav);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(main);
    			if (switch_instance) destroy_component(switch_instance);
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
    	validate_slots("Frame", slots, []);
    	let tabnav = "";

    	const comps = {
    		"platform": Frame_platform,
    		"ehs": Frame_home,
    		"linkedfields": Frame_administration_linkedfields,
    		"incidents": Frame_incidents,
    		"incidents_new": Frame_incidents_new,
    		"incidents_admin": Frame_incidents_admin,
    		"queries_new": Frame_queries_new,
    		"queries_result": Frame_queries_result,
    		"hazard_assessments": Frame_hazard_assessments
    	};

    	let comp = comps.ehs;
    	let hash = window.location.hash.substring(1);

    	if (hash !== "") {
    		handleNavStr(hash);
    	}

    	let grid = false;

    	function handleHash() {
    		let hash = window.location.hash.substring(1);

    		if (hash !== "") {
    			handleNavStr(hash);
    		}
    	}

    	function handleNavStr(hash) {
    		$$invalidate(0, tabnav = "");
    		console.log("nav hash", hash);
    		let hash_arr = hash.split("/");
    		let id = hash_arr[hash_arr.length - 1];

    		if (comps[id]) {
    			$$invalidate(1, comp = comps[id]);
    			return;
    		} else {
    			$$invalidate(0, tabnav = id);
    			id = hash_arr[hash_arr.length - 2];

    			if (comps[id]) {
    				$$invalidate(1, comp = comps[id]);
    				return;
    			}
    		}

    		$$invalidate(1, comp = comps.ehs); //default to first
    	}

    	function handleNav(event) {
    		let hash = event.detail.text;
    		handleNavStr(hash);
    	}

    	let bodyScroll = 0;
    	let bodyHeight = 0;

    	function handleScroll(event) {
    		/* throttle this */
    		$$invalidate(3, bodyScroll = event.target.scrollTop);

    		bodyHeight = event.target.offsetHeight;
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Frame> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		$$invalidate(2, grid = !grid);
    		return false;
    	};

    	$$self.$capture_state = () => ({
    		Platform: Frame_platform,
    		Home: Frame_home,
    		AdminLinkedFields: Frame_administration_linkedfields,
    		Incidents: Frame_incidents,
    		IncidentsNew: Frame_incidents_new,
    		IncidentsAdmin: Frame_incidents_admin,
    		HazardAssessments: Frame_hazard_assessments,
    		QueriesNew: Frame_queries_new,
    		QueriesResult: Frame_queries_result,
    		tabnav,
    		comps,
    		comp,
    		hash,
    		grid,
    		handleHash,
    		handleNavStr,
    		handleNav,
    		bodyScroll,
    		bodyHeight,
    		handleScroll
    	});

    	$$self.$inject_state = $$props => {
    		if ("tabnav" in $$props) $$invalidate(0, tabnav = $$props.tabnav);
    		if ("comp" in $$props) $$invalidate(1, comp = $$props.comp);
    		if ("hash" in $$props) hash = $$props.hash;
    		if ("grid" in $$props) $$invalidate(2, grid = $$props.grid);
    		if ("bodyScroll" in $$props) $$invalidate(3, bodyScroll = $$props.bodyScroll);
    		if ("bodyHeight" in $$props) bodyHeight = $$props.bodyHeight;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		tabnav,
    		comp,
    		grid,
    		bodyScroll,
    		handleHash,
    		handleNav,
    		handleScroll,
    		click_handler
    	];
    }

    class Frame extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Frame",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new Frame({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=frame.js.map
