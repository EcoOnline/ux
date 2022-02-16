
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

    /* src/Frame_home.svelte generated by Svelte v3.35.0 */
    const file$n = "src/Frame_home.svelte";

    // (228:29) 
    function create_if_block_3$4(ctx) {
    	let h2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "My Tasks";
    			add_location(h2, file$n, 228, 8, 10967);
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
    		id: create_if_block_3$4.name,
    		type: "if",
    		source: "(228:29) ",
    		ctx
    	});

    	return block;
    }

    // (226:31) 
    function create_if_block_2$a(ctx) {
    	let h2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Reports";
    			add_location(h2, file$n, 226, 8, 10912);
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
    		id: create_if_block_2$a.name,
    		type: "if",
    		source: "(226:31) ",
    		ctx
    	});

    	return block;
    }

    // (224:34) 
    function create_if_block_1$d(ctx) {
    	let h2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Dashboards";
    			add_location(h2, file$n, 224, 8, 10852);
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
    		id: create_if_block_1$d.name,
    		type: "if",
    		source: "(224:34) ",
    		ctx
    	});

    	return block;
    }

    // (31:4) {#if tab == 'home'}
    function create_if_block$i(ctx) {
    	let div64;
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
    	let div63;
    	let div62;
    	let div60;
    	let t102;
    	let b15;
    	let t104;
    	let div61;
    	let a57;
    	let t105;
    	let a58;
    	let t106;
    	let a59;
    	let t107;
    	let a60;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div64 = element("div");
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
    			div63 = element("div");
    			div62 = element("div");
    			div60 = element("div");
    			t102 = space();
    			b15 = element("b");
    			b15.textContent = "Administration";
    			t104 = space();
    			div61 = element("div");
    			a57 = element("a");
    			t105 = space();
    			a58 = element("a");
    			t106 = space();
    			a59 = element("a");
    			t107 = space();
    			a60 = element("a");
    			attr_dev(div0, "class", "icon");
    			set_style(div0, "background-image", "url(./images/ehs_svgs_clean/incidents.svg)");
    			add_location(div0, file$n, 34, 20, 1248);
    			add_location(b0, file$n, 35, 20, 1361);
    			attr_dev(a0, "href", "#ehs/incidents/incidents_new");
    			attr_dev(a0, "class", "add");
    			add_location(a0, file$n, 37, 24, 1442);
    			attr_dev(a1, "href", "#ehs/incidents/queries_new");
    			attr_dev(a1, "class", "filter");
    			add_location(a1, file$n, 38, 24, 1582);
    			attr_dev(a2, "href", "#ehs/incidents/summary");
    			attr_dev(a2, "class", "summary");
    			add_location(a2, file$n, 39, 24, 1721);
    			attr_dev(a3, "href", "#ehs/incidents/admin");
    			attr_dev(a3, "class", "tool");
    			add_location(a3, file$n, 40, 24, 1863);
    			attr_dev(div1, "class", "tools");
    			add_location(div1, file$n, 36, 20, 1398);
    			attr_dev(div2, "class", "tile");
    			add_location(div2, file$n, 33, 16, 1117);
    			attr_dev(div3, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div3, file$n, 32, 12, 1055);
    			attr_dev(div4, "class", "icon");
    			set_style(div4, "background-image", "url(./images/ehs_svgs_clean/actions.svg)");
    			add_location(div4, file$n, 46, 20, 2156);
    			add_location(b1, file$n, 47, 20, 2267);
    			attr_dev(a4, "href", "#incidents/incidents_new");
    			attr_dev(a4, "class", "add");
    			add_location(a4, file$n, 49, 24, 2346);
    			attr_dev(a5, "href", "queries_new");
    			attr_dev(a5, "class", "filter");
    			add_location(a5, file$n, 50, 24, 2423);
    			attr_dev(div5, "class", "tools");
    			add_location(div5, file$n, 48, 20, 2302);
    			attr_dev(div6, "class", "tile");
    			add_location(div6, file$n, 45, 16, 2117);
    			attr_dev(div7, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div7, file$n, 44, 12, 2055);
    			attr_dev(div8, "class", "icon");
    			set_style(div8, "background-image", "url(./images/ehs_svgs_clean/audits.svg)");
    			add_location(div8, file$n, 56, 20, 2648);
    			add_location(b2, file$n, 57, 20, 2758);
    			attr_dev(a6, "href", "./");
    			attr_dev(a6, "class", "add");
    			add_location(a6, file$n, 59, 24, 2848);
    			attr_dev(a7, "href", "./");
    			attr_dev(a7, "class", "filter");
    			add_location(a7, file$n, 60, 24, 2903);
    			attr_dev(a8, "href", "./");
    			attr_dev(a8, "class", "summary");
    			add_location(a8, file$n, 61, 24, 2961);
    			attr_dev(a9, "href", "./");
    			attr_dev(a9, "class", "tool");
    			add_location(a9, file$n, 62, 24, 3020);
    			attr_dev(div9, "class", "tools");
    			add_location(div9, file$n, 58, 20, 2804);
    			attr_dev(div10, "class", "tile");
    			add_location(div10, file$n, 55, 16, 2609);
    			attr_dev(div11, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div11, file$n, 54, 12, 2547);
    			attr_dev(div12, "class", "icon");
    			set_style(div12, "background-image", "url(./images/ehs_svgs_clean/observations.svg)");
    			add_location(div12, file$n, 68, 20, 3234);
    			add_location(b3, file$n, 69, 20, 3350);
    			attr_dev(a10, "href", "./");
    			attr_dev(a10, "class", "add");
    			add_location(a10, file$n, 71, 24, 3433);
    			attr_dev(a11, "href", "./");
    			attr_dev(a11, "class", "filter");
    			add_location(a11, file$n, 72, 24, 3488);
    			attr_dev(a12, "href", "./");
    			attr_dev(a12, "class", "summary");
    			add_location(a12, file$n, 73, 24, 3546);
    			attr_dev(a13, "href", "./");
    			attr_dev(a13, "class", "tool");
    			add_location(a13, file$n, 74, 24, 3605);
    			attr_dev(div13, "class", "tools");
    			add_location(div13, file$n, 70, 20, 3389);
    			attr_dev(div14, "class", "tile");
    			add_location(div14, file$n, 67, 16, 3195);
    			attr_dev(div15, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div15, file$n, 66, 12, 3133);
    			attr_dev(div16, "class", "icon");
    			set_style(div16, "background-image", "url(./images/ehs_svgs_clean/risk_assessment.svg)");
    			add_location(div16, file$n, 80, 20, 3819);
    			add_location(b4, file$n, 81, 20, 3938);
    			attr_dev(a14, "href", "./");
    			attr_dev(a14, "class", "add");
    			add_location(a14, file$n, 83, 24, 4025);
    			attr_dev(a15, "href", "./");
    			attr_dev(a15, "class", "filter");
    			add_location(a15, file$n, 84, 24, 4080);
    			attr_dev(a16, "href", "./");
    			attr_dev(a16, "class", "summary");
    			add_location(a16, file$n, 85, 24, 4138);
    			attr_dev(a17, "href", "./");
    			attr_dev(a17, "class", "tool");
    			add_location(a17, file$n, 86, 24, 4197);
    			attr_dev(div17, "class", "tools");
    			add_location(div17, file$n, 82, 20, 3981);
    			attr_dev(div18, "class", "tile");
    			add_location(div18, file$n, 79, 16, 3780);
    			attr_dev(div19, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div19, file$n, 78, 12, 3718);
    			attr_dev(div20, "class", "icon");
    			set_style(div20, "background-image", "url(./images/ehs_svgs_clean/hazard_assessment.svg)");
    			add_location(div20, file$n, 92, 20, 4521);
    			add_location(b5, file$n, 93, 20, 4642);
    			attr_dev(a18, "href", "./");
    			attr_dev(a18, "class", "add");
    			add_location(a18, file$n, 95, 24, 4731);
    			attr_dev(a19, "href", "./");
    			attr_dev(a19, "class", "filter");
    			add_location(a19, file$n, 96, 24, 4786);
    			attr_dev(a20, "href", "./");
    			attr_dev(a20, "class", "tool");
    			add_location(a20, file$n, 97, 24, 4844);
    			attr_dev(div21, "class", "tools");
    			add_location(div21, file$n, 94, 20, 4687);
    			attr_dev(div22, "class", "tile");
    			add_location(div22, file$n, 91, 16, 4372);
    			attr_dev(div23, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div23, file$n, 90, 12, 4310);
    			attr_dev(div24, "class", "icon");
    			set_style(div24, "background-image", "url(./images/ehs_svgs_clean/scheduling.svg)");
    			add_location(div24, file$n, 103, 20, 5058);
    			add_location(b6, file$n, 104, 20, 5172);
    			attr_dev(a21, "href", "./");
    			attr_dev(a21, "class", "add");
    			add_location(a21, file$n, 106, 24, 5254);
    			attr_dev(a22, "href", "./");
    			attr_dev(a22, "class", "filter");
    			add_location(a22, file$n, 107, 24, 5309);
    			attr_dev(a23, "href", "./");
    			attr_dev(a23, "class", "summary");
    			add_location(a23, file$n, 108, 24, 5367);
    			attr_dev(a24, "href", "./");
    			attr_dev(a24, "class", "tool");
    			add_location(a24, file$n, 109, 24, 5426);
    			attr_dev(div25, "class", "tools");
    			add_location(div25, file$n, 105, 20, 5210);
    			attr_dev(div26, "class", "tile");
    			add_location(div26, file$n, 102, 16, 5019);
    			attr_dev(div27, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div27, file$n, 101, 12, 4957);
    			attr_dev(div28, "class", "icon");
    			set_style(div28, "background-image", "url(./images/ehs_svgs_clean/epr.svg)");
    			add_location(div28, file$n, 115, 20, 5640);
    			add_location(b7, file$n, 116, 20, 5747);
    			attr_dev(a25, "href", "./");
    			attr_dev(a25, "class", "add");
    			add_location(a25, file$n, 118, 24, 5832);
    			attr_dev(a26, "href", "./");
    			attr_dev(a26, "class", "filter");
    			add_location(a26, file$n, 119, 24, 5887);
    			attr_dev(a27, "href", "./");
    			attr_dev(a27, "class", "summary");
    			add_location(a27, file$n, 120, 24, 5945);
    			attr_dev(a28, "href", "./");
    			attr_dev(a28, "class", "tool");
    			add_location(a28, file$n, 121, 24, 6004);
    			attr_dev(div29, "class", "tools");
    			add_location(div29, file$n, 117, 20, 5788);
    			attr_dev(div30, "class", "tile");
    			add_location(div30, file$n, 114, 16, 5601);
    			attr_dev(div31, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div31, file$n, 113, 12, 5539);
    			attr_dev(div32, "class", "icon");
    			set_style(div32, "background-image", "url(./images/ehs_svgs_clean/period_statistics.svg)");
    			add_location(div32, file$n, 127, 20, 6218);
    			add_location(b8, file$n, 128, 20, 6339);
    			attr_dev(a29, "href", "./");
    			attr_dev(a29, "class", "add");
    			add_location(a29, file$n, 130, 24, 6428);
    			attr_dev(a30, "href", "./");
    			attr_dev(a30, "class", "filter");
    			add_location(a30, file$n, 131, 24, 6483);
    			attr_dev(a31, "href", "./");
    			attr_dev(a31, "class", "summary");
    			add_location(a31, file$n, 132, 24, 6541);
    			attr_dev(a32, "href", "./");
    			attr_dev(a32, "class", "tool");
    			add_location(a32, file$n, 133, 24, 6600);
    			attr_dev(div33, "class", "tools");
    			add_location(div33, file$n, 129, 20, 6384);
    			attr_dev(div34, "class", "tile");
    			add_location(div34, file$n, 126, 16, 6179);
    			attr_dev(div35, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div35, file$n, 125, 12, 6117);
    			attr_dev(div36, "class", "icon");
    			set_style(div36, "background-image", "url(./images/ehs_svgs_clean/register.svg)");
    			add_location(div36, file$n, 139, 20, 6814);
    			add_location(b9, file$n, 140, 20, 6926);
    			attr_dev(a33, "href", "./");
    			attr_dev(a33, "class", "add");
    			add_location(a33, file$n, 142, 24, 7006);
    			attr_dev(a34, "href", "./");
    			attr_dev(a34, "class", "filter");
    			add_location(a34, file$n, 143, 24, 7061);
    			attr_dev(a35, "href", "./");
    			attr_dev(a35, "class", "summary");
    			add_location(a35, file$n, 144, 24, 7119);
    			attr_dev(a36, "href", "./");
    			attr_dev(a36, "class", "tool");
    			add_location(a36, file$n, 145, 24, 7178);
    			attr_dev(div37, "class", "tools");
    			add_location(div37, file$n, 141, 20, 6962);
    			attr_dev(div38, "class", "tile");
    			add_location(div38, file$n, 138, 16, 6775);
    			attr_dev(div39, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div39, file$n, 137, 12, 6713);
    			attr_dev(div40, "class", "icon");
    			set_style(div40, "background-image", "url(./images/ehs_svgs_clean/advanced_rca.svg)");
    			add_location(div40, file$n, 151, 20, 7392);
    			add_location(b10, file$n, 152, 20, 7508);
    			attr_dev(a37, "href", "./");
    			attr_dev(a37, "class", "add");
    			add_location(a37, file$n, 154, 24, 7593);
    			attr_dev(a38, "href", "./");
    			attr_dev(a38, "class", "filter");
    			add_location(a38, file$n, 155, 24, 7648);
    			attr_dev(a39, "href", "./");
    			attr_dev(a39, "class", "summary");
    			add_location(a39, file$n, 156, 24, 7706);
    			attr_dev(a40, "href", "./");
    			attr_dev(a40, "class", "tool");
    			add_location(a40, file$n, 157, 24, 7765);
    			attr_dev(div41, "class", "tools");
    			add_location(div41, file$n, 153, 20, 7549);
    			attr_dev(div42, "class", "tile");
    			add_location(div42, file$n, 150, 16, 7353);
    			attr_dev(div43, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div43, file$n, 149, 12, 7291);
    			attr_dev(div44, "class", "icon");
    			set_style(div44, "background-image", "url(./images/ehs_svgs_clean/documents.svg)");
    			add_location(div44, file$n, 163, 20, 7979);
    			add_location(b11, file$n, 164, 20, 8092);
    			attr_dev(a41, "href", "./");
    			attr_dev(a41, "class", "add");
    			add_location(a41, file$n, 166, 24, 8172);
    			attr_dev(a42, "href", "./");
    			attr_dev(a42, "class", "filter");
    			add_location(a42, file$n, 167, 24, 8227);
    			attr_dev(a43, "href", "./");
    			attr_dev(a43, "class", "summary");
    			add_location(a43, file$n, 168, 24, 8285);
    			attr_dev(a44, "href", "./");
    			attr_dev(a44, "class", "tool");
    			add_location(a44, file$n, 169, 24, 8344);
    			attr_dev(div45, "class", "tools");
    			add_location(div45, file$n, 165, 20, 8128);
    			attr_dev(div46, "class", "tile");
    			add_location(div46, file$n, 162, 16, 7940);
    			attr_dev(div47, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div47, file$n, 161, 12, 7878);
    			attr_dev(div48, "class", "icon");
    			set_style(div48, "background-image", "url(./images/ehs_svgs_clean/tracker.svg)");
    			add_location(div48, file$n, 175, 20, 8558);
    			add_location(b12, file$n, 176, 20, 8669);
    			attr_dev(a45, "href", "./");
    			attr_dev(a45, "class", "add");
    			add_location(a45, file$n, 178, 24, 8757);
    			attr_dev(a46, "href", "./");
    			attr_dev(a46, "class", "filter");
    			add_location(a46, file$n, 179, 24, 8812);
    			attr_dev(a47, "href", "./");
    			attr_dev(a47, "class", "summary");
    			add_location(a47, file$n, 180, 24, 8870);
    			attr_dev(a48, "href", "./");
    			attr_dev(a48, "class", "tool");
    			add_location(a48, file$n, 181, 24, 8929);
    			attr_dev(div49, "class", "tools");
    			add_location(div49, file$n, 177, 20, 8713);
    			attr_dev(div50, "class", "tile");
    			add_location(div50, file$n, 174, 16, 8519);
    			attr_dev(div51, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div51, file$n, 173, 12, 8457);
    			attr_dev(div52, "class", "icon");
    			set_style(div52, "background-image", "url(./images/ehs_svgs_clean/pow_ra.svg)");
    			add_location(div52, file$n, 187, 20, 9143);
    			add_location(b13, file$n, 188, 20, 9253);
    			attr_dev(a49, "href", "./");
    			attr_dev(a49, "class", "add");
    			add_location(a49, file$n, 190, 24, 9338);
    			attr_dev(a50, "href", "./");
    			attr_dev(a50, "class", "filter");
    			add_location(a50, file$n, 191, 24, 9393);
    			attr_dev(a51, "href", "./");
    			attr_dev(a51, "class", "summary");
    			add_location(a51, file$n, 192, 24, 9451);
    			attr_dev(a52, "href", "./");
    			attr_dev(a52, "class", "tool");
    			add_location(a52, file$n, 193, 24, 9510);
    			attr_dev(div53, "class", "tools");
    			add_location(div53, file$n, 189, 20, 9294);
    			attr_dev(div54, "class", "tile");
    			add_location(div54, file$n, 186, 16, 9104);
    			attr_dev(div55, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div55, file$n, 185, 12, 9042);
    			attr_dev(div56, "class", "icon");
    			set_style(div56, "background-image", "url(./images/ehs_svgs_clean/lost_time.svg)");
    			add_location(div56, file$n, 199, 20, 9724);
    			add_location(b14, file$n, 200, 20, 9837);
    			attr_dev(a53, "href", "./");
    			attr_dev(a53, "class", "add");
    			add_location(a53, file$n, 202, 24, 9918);
    			attr_dev(a54, "href", "./");
    			attr_dev(a54, "class", "filter");
    			add_location(a54, file$n, 203, 24, 9973);
    			attr_dev(a55, "href", "./");
    			attr_dev(a55, "class", "summary");
    			add_location(a55, file$n, 204, 24, 10031);
    			attr_dev(a56, "href", "./");
    			attr_dev(a56, "class", "tool");
    			add_location(a56, file$n, 205, 24, 10090);
    			attr_dev(div57, "class", "tools");
    			add_location(div57, file$n, 201, 20, 9874);
    			attr_dev(div58, "class", "tile");
    			add_location(div58, file$n, 198, 16, 9685);
    			attr_dev(div59, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div59, file$n, 197, 12, 9623);
    			attr_dev(div60, "class", "icon");
    			set_style(div60, "background-image", "url(./images/ehs_svgs_clean/administration.svg)");
    			add_location(div60, file$n, 211, 20, 10304);
    			add_location(b15, file$n, 212, 20, 10422);
    			attr_dev(a57, "href", "./");
    			attr_dev(a57, "class", "add");
    			add_location(a57, file$n, 214, 24, 10508);
    			attr_dev(a58, "href", "./");
    			attr_dev(a58, "class", "filter");
    			add_location(a58, file$n, 215, 24, 10563);
    			attr_dev(a59, "href", "./");
    			attr_dev(a59, "class", "summary");
    			add_location(a59, file$n, 216, 24, 10621);
    			attr_dev(a60, "href", "./");
    			attr_dev(a60, "class", "tool");
    			add_location(a60, file$n, 217, 24, 10680);
    			attr_dev(div61, "class", "tools");
    			add_location(div61, file$n, 213, 20, 10464);
    			attr_dev(div62, "class", "tile");
    			add_location(div62, file$n, 210, 16, 10265);
    			attr_dev(div63, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div63, file$n, 209, 12, 10203);
    			attr_dev(div64, "class", "row");
    			add_location(div64, file$n, 31, 8, 1025);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div64, anchor);
    			append_dev(div64, div3);
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
    			append_dev(div64, t6);
    			append_dev(div64, div7);
    			append_dev(div7, div6);
    			append_dev(div6, div4);
    			append_dev(div6, t7);
    			append_dev(div6, b1);
    			append_dev(div6, t9);
    			append_dev(div6, div5);
    			append_dev(div5, a4);
    			append_dev(div5, t10);
    			append_dev(div5, a5);
    			append_dev(div64, t11);
    			append_dev(div64, div11);
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
    			append_dev(div64, t18);
    			append_dev(div64, div15);
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
    			append_dev(div64, t25);
    			append_dev(div64, div19);
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
    			append_dev(div64, t32);
    			append_dev(div64, div23);
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
    			append_dev(div64, t38);
    			append_dev(div64, div27);
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
    			append_dev(div64, t45);
    			append_dev(div64, div31);
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
    			append_dev(div64, t52);
    			append_dev(div64, div35);
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
    			append_dev(div64, t59);
    			append_dev(div64, div39);
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
    			append_dev(div64, t66);
    			append_dev(div64, div43);
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
    			append_dev(div64, t73);
    			append_dev(div64, div47);
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
    			append_dev(div64, t80);
    			append_dev(div64, div51);
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
    			append_dev(div64, t87);
    			append_dev(div64, div55);
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
    			append_dev(div64, t94);
    			append_dev(div64, div59);
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
    			append_dev(div64, t101);
    			append_dev(div64, div63);
    			append_dev(div63, div62);
    			append_dev(div62, div60);
    			append_dev(div62, t102);
    			append_dev(div62, b15);
    			append_dev(div62, t104);
    			append_dev(div62, div61);
    			append_dev(div61, a57);
    			append_dev(div61, t105);
    			append_dev(div61, a58);
    			append_dev(div61, t106);
    			append_dev(div61, a59);
    			append_dev(div61, t107);
    			append_dev(div61, a60);

    			if (!mounted) {
    				dispose = [
    					listen_dev(a0, "click", stop_propagation(/*click_handler_4*/ ctx[6]), false, false, true),
    					listen_dev(a1, "click", stop_propagation(/*click_handler_5*/ ctx[7]), false, false, true),
    					listen_dev(a2, "click", stop_propagation(/*click_handler_6*/ ctx[8]), false, false, true),
    					listen_dev(a3, "click", stop_propagation(/*click_handler_7*/ ctx[9]), false, false, true),
    					listen_dev(div2, "click", prevent_default(/*click_handler_8*/ ctx[10]), false, true, false),
    					listen_dev(div22, "click", prevent_default(/*click_handler_9*/ ctx[11]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div64);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$i.name,
    		type: "if",
    		source: "(31:4) {#if tab == 'home'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$n(ctx) {
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
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*tab*/ ctx[0] == "home") return create_if_block$i;
    		if (/*tab*/ ctx[0] == "dashboards") return create_if_block_1$d;
    		if (/*tab*/ ctx[0] == "reports") return create_if_block_2$a;
    		if (/*tab*/ ctx[0] == "tasks") return create_if_block_3$4;
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
    			attr_dev(a0, "href", "/");
    			add_location(a0, file$n, 15, 20, 320);
    			add_location(li0, file$n, 15, 16, 316);
    			add_location(li1, file$n, 16, 16, 367);
    			attr_dev(ul0, "class", "breadcrumb");
    			add_location(ul0, file$n, 14, 12, 276);
    			attr_dev(div0, "class", "col12");
    			add_location(div0, file$n, 13, 8, 244);
    			attr_dev(div1, "class", "row sticky");
    			add_location(div1, file$n, 12, 4, 211);
    			attr_dev(a1, "href", "/");
    			toggle_class(a1, "active", /*tab*/ ctx[0] == "home");
    			add_location(a1, file$n, 24, 12, 472);
    			add_location(li2, file$n, 24, 8, 468);
    			attr_dev(a2, "href", "/");
    			toggle_class(a2, "active", /*tab*/ ctx[0] == "dashboards");
    			add_location(a2, file$n, 25, 12, 594);
    			add_location(li3, file$n, 25, 8, 590);
    			attr_dev(a3, "href", "/");
    			toggle_class(a3, "active", /*tab*/ ctx[0] == "reports");
    			add_location(a3, file$n, 26, 12, 735);
    			add_location(li4, file$n, 26, 8, 731);
    			attr_dev(a4, "href", "/");
    			toggle_class(a4, "active", /*tab*/ ctx[0] == "tasks");
    			add_location(a4, file$n, 27, 12, 866);
    			add_location(li5, file$n, 27, 8, 862);
    			attr_dev(ul1, "class", "tabs");
    			add_location(ul1, file$n, 23, 4, 442);
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

    			if (!mounted) {
    				dispose = [
    					listen_dev(a1, "click", prevent_default(/*click_handler*/ ctx[2]), false, true, false),
    					listen_dev(a2, "click", prevent_default(/*click_handler_1*/ ctx[3]), false, true, false),
    					listen_dev(a3, "click", prevent_default(/*click_handler_2*/ ctx[4]), false, true, false),
    					listen_dev(a4, "click", prevent_default(/*click_handler_3*/ ctx[5]), false, true, false)
    				];

    				mounted = true;
    			}
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
    			mounted = false;
    			run_all(dispose);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Frame_home", slots, []);
    	const dispatch = createEventDispatcher();

    	function nav(str) {
    		dispatch("nav", { text: str });
    	}

    	let tab = "home";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Frame_home> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		$$invalidate(0, tab = "home");
    	};

    	const click_handler_1 = () => {
    		$$invalidate(0, tab = "dashboards");
    	};

    	const click_handler_2 = () => {
    		$$invalidate(0, tab = "reports");
    	};

    	const click_handler_3 = () => {
    		$$invalidate(0, tab = "tasks");
    	};

    	const click_handler_4 = () => {
    		nav("incidents_new");
    	};

    	const click_handler_5 = () => {
    		nav("queries_new");
    	};

    	const click_handler_6 = () => {
    		nav("incidents/summary");
    	};

    	const click_handler_7 = () => {
    		nav("incidents/admin");
    	};

    	const click_handler_8 = () => {
    		nav("incidents");
    		window.location.hash = "#ehs/incidents";
    	};

    	const click_handler_9 = () => {
    		nav("hazard_assessments");
    		window.location.hash = "#ehs/hazard_assessments";
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		nav,
    		tab
    	});

    	$$self.$inject_state = $$props => {
    		if ("tab" in $$props) $$invalidate(0, tab = $$props.tab);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		tab,
    		nav,
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

    class Frame_home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Frame_home",
    			options,
    			id: create_fragment$n.name
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
    const file$m = "src/components/Pullout.svelte";
    const get_nofs_slot_changes = dirty => ({});
    const get_nofs_slot_context = ctx => ({});
    const get_fs_slot_changes = dirty => ({});
    const get_fs_slot_context = ctx => ({});

    // (44:0) {#if drawer_bool}
    function create_if_block$h(ctx) {
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
    	let if_block0 = /*canfs*/ ctx[4] && create_if_block_3$3(ctx);
    	const if_block_creators = [create_if_block_1$c, create_else_block_1$2];
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
    			add_location(div0, file$m, 45, 8, 917);
    			attr_dev(i, "class", "i-close i-24");
    			add_location(i, file$m, 57, 69, 1555);
    			attr_dev(span, "class", "close");
    			add_location(span, file$m, 57, 20, 1506);
    			add_location(h2, file$m, 48, 16, 1108);
    			attr_dev(div1, "class", "pullout-head");
    			add_location(div1, file$m, 47, 12, 1065);
    			attr_dev(div2, "class", "pullout-body");
    			add_location(div2, file$m, 60, 12, 1644);
    			attr_dev(div3, "class", "pullout svelte-145fk5c");
    			toggle_class(div3, "in", /*drawer_in*/ ctx[5]);
    			add_location(div3, file$m, 46, 8, 1008);
    			attr_dev(div4, "class", "drawer svelte-145fk5c");
    			toggle_class(div4, "fs", /*fs*/ ctx[0]);
    			add_location(div4, file$m, 44, 4, 879);
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
    					if_block0 = create_if_block_3$3(ctx);
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
    		id: create_if_block$h.name,
    		type: "if",
    		source: "(44:0) {#if drawer_bool}",
    		ctx
    	});

    	return block;
    }

    // (50:20) {#if canfs}
    function create_if_block_3$3(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*fs*/ ctx[0]) return create_if_block_4$3;
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
    		id: create_if_block_3$3.name,
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
    			add_location(i, file$m, 53, 28, 1334);
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
    function create_if_block_4$3(ctx) {
    	let i;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "i-minimize i-24");
    			add_location(i, file$m, 51, 28, 1206);
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
    		id: create_if_block_4$3.name,
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
    function create_if_block_1$c(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_2$9, create_else_block$a];
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
    		id: create_if_block_1$c.name,
    		type: "if",
    		source: "(63:16) {#if $$slots.fs}",
    		ctx
    	});

    	return block;
    }

    // (67:20) {:else}
    function create_else_block$a(ctx) {
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
    		id: create_else_block$a.name,
    		type: "else",
    		source: "(67:20) {:else}",
    		ctx
    	});

    	return block;
    }

    // (65:20) {#if fs}
    function create_if_block_2$9(ctx) {
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
    		id: create_if_block_2$9.name,
    		type: "if",
    		source: "(65:20) {#if fs}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$m(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*drawer_bool*/ ctx[6] && create_if_block$h(ctx);

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
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props, $$invalidate) {
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

    		init(this, options, instance$m, create_fragment$m, safe_not_equal, {
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
    			id: create_fragment$m.name
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

    const file$l = "src/components/form/InputSelect.svelte";

    function get_each_context$a(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (8:4) {#if f.label}
    function create_if_block_1$b(ctx) {
    	let label;
    	let t_value = /*f*/ ctx[0].label + "";
    	let t;
    	let label_for_value;

    	const block = {
    		c: function create() {
    			label = element("label");
    			t = text(t_value);
    			attr_dev(label, "for", label_for_value = /*f*/ ctx[0].id);
    			add_location(label, file$l, 8, 8, 124);
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
    		id: create_if_block_1$b.name,
    		type: "if",
    		source: "(8:4) {#if f.label}",
    		ctx
    	});

    	return block;
    }

    // (11:4) {#if f.hint}
    function create_if_block$g(ctx) {
    	let p;
    	let t_value = /*f*/ ctx[0].hint + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			add_location(p, file$l, 11, 8, 197);
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
    		id: create_if_block$g.name,
    		type: "if",
    		source: "(11:4) {#if f.hint}",
    		ctx
    	});

    	return block;
    }

    // (15:8) {#each f.options as option}
    function create_each_block$a(ctx) {
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
    			add_location(option, file$l, 15, 12, 328);
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
    		id: create_each_block$a.name,
    		type: "each",
    		source: "(15:8) {#each f.options as option}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$l(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let select;
    	let mounted;
    	let dispose;
    	let if_block0 = /*f*/ ctx[0].label && create_if_block_1$b(ctx);
    	let if_block1 = /*f*/ ctx[0].hint && create_if_block$g(ctx);
    	let each_value = /*f*/ ctx[0].options;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$a(get_each_context$a(ctx, each_value, i));
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
    			add_location(select, file$l, 13, 4, 227);
    			attr_dev(div, "class", "form-item");
    			add_location(div, file$l, 6, 0, 74);
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
    					if_block0 = create_if_block_1$b(ctx);
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
    					if_block1 = create_if_block$g(ctx);
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
    					const child_ctx = get_each_context$a(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$a(child_ctx);
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
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, { f: 0, channel: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InputSelect",
    			options,
    			id: create_fragment$l.name
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
    const file$k = "src/components/form/Shortcuts.svelte";

    function get_each_context$9(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (13:0) {#if f.shortcuts}
    function create_if_block$f(ctx) {
    	let div;
    	let each_value = /*f*/ ctx[0].shortcuts;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$9(get_each_context$9(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "shortcuts svelte-nlr8e4");
    			add_location(div, file$k, 13, 4, 250);
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
    					const child_ctx = get_each_context$9(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$9(child_ctx);
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
    		id: create_if_block$f.name,
    		type: "if",
    		source: "(13:0) {#if f.shortcuts}",
    		ctx
    	});

    	return block;
    }

    // (15:8) {#each f.shortcuts as shortcut}
    function create_each_block$9(ctx) {
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
    			add_location(div, file$k, 15, 12, 326);
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
    		id: create_each_block$9.name,
    		type: "each",
    		source: "(15:8) {#each f.shortcuts as shortcut}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$k(ctx) {
    	let if_block_anchor;
    	let if_block = /*f*/ ctx[0].shortcuts && create_if_block$f(ctx);

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
    					if_block = create_if_block$f(ctx);
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
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, { f: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Shortcuts",
    			options,
    			id: create_fragment$k.name
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
    const file$j = "src/components/form/InputText.svelte";

    // (8:4) {#if f.label}
    function create_if_block_1$a(ctx) {
    	let label;
    	let t0_value = /*f*/ ctx[0].label + "";
    	let t0;
    	let t1;
    	let label_for_value;
    	let if_block = /*f*/ ctx[0].optional && create_if_block_2$8(ctx);

    	const block = {
    		c: function create() {
    			label = element("label");
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block) if_block.c();
    			attr_dev(label, "for", label_for_value = /*f*/ ctx[0].id);
    			add_location(label, file$j, 8, 8, 137);
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
    					if_block = create_if_block_2$8(ctx);
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
    		id: create_if_block_1$a.name,
    		type: "if",
    		source: "(8:4) {#if f.label}",
    		ctx
    	});

    	return block;
    }

    // (9:38) {#if f.optional}
    function create_if_block_2$8(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "(Optional)";
    			attr_dev(span, "class", "optional");
    			add_location(span, file$j, 8, 54, 183);
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
    		id: create_if_block_2$8.name,
    		type: "if",
    		source: "(9:38) {#if f.optional}",
    		ctx
    	});

    	return block;
    }

    // (11:4) {#if f.hint}
    function create_if_block$e(ctx) {
    	let p;
    	let t_value = /*f*/ ctx[0].hint + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			add_location(p, file$j, 11, 8, 272);
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
    		id: create_if_block$e.name,
    		type: "if",
    		source: "(11:4) {#if f.hint}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$j(ctx) {
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
    	let if_block0 = /*f*/ ctx[0].label && create_if_block_1$a(ctx);
    	let if_block1 = /*f*/ ctx[0].hint && create_if_block$e(ctx);

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
    			add_location(input, file$j, 13, 4, 302);
    			attr_dev(div, "class", "form-item");
    			add_location(div, file$j, 6, 0, 87);
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
    					if_block0 = create_if_block_1$a(ctx);
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
    					if_block1 = create_if_block$e(ctx);
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
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, { f: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InputText",
    			options,
    			id: create_fragment$j.name
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
    const file$i = "src/components/form/InputMultiItem.svelte";

    function get_each_context$8(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    // (24:0) {#if f.visible}
    function create_if_block$d(ctx) {
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
    	let if_block0 = /*f*/ ctx[0].children && create_if_block_5$2(ctx);
    	let if_block1 = /*f*/ ctx[0].selectable && create_if_block_3$2(ctx);
    	let if_block2 = /*f*/ ctx[0].pii && create_if_block_2$7(ctx);
    	let if_block3 = /*f*/ ctx[0].children && /*f*/ ctx[0].expanded && create_if_block_1$9(ctx);

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
    			add_location(div, file$i, 24, 4, 509);
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
    					if_block0 = create_if_block_5$2(ctx);
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
    					if_block1 = create_if_block_3$2(ctx);
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
    					if_block2 = create_if_block_2$7(ctx);
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
    					if_block3 = create_if_block_1$9(ctx);
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
    		id: create_if_block$d.name,
    		type: "if",
    		source: "(24:0) {#if f.visible}",
    		ctx
    	});

    	return block;
    }

    // (26:8) {#if f.children}
    function create_if_block_5$2(ctx) {
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
    		id: create_if_block_5$2.name,
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
    			add_location(i, file$i, 29, 16, 765);
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
    			add_location(i, file$i, 27, 16, 626);
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
    function create_if_block_3$2(ctx) {
    	let if_block_anchor;

    	function select_block_type_1(ctx, dirty) {
    		if (/*f*/ ctx[0].selected) return create_if_block_4$2;
    		return create_else_block$9;
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
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(33:8) {#if f.selectable}",
    		ctx
    	});

    	return block;
    }

    // (36:12) {:else}
    function create_else_block$9(ctx) {
    	let i;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "i-checkbox i-20");
    			add_location(i, file$i, 36, 16, 1051);
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
    		id: create_else_block$9.name,
    		type: "else",
    		source: "(36:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (34:12) {#if f.selected}
    function create_if_block_4$2(ctx) {
    	let i;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "i-checkbox-selected i-20");
    			add_location(i, file$i, 34, 16, 949);
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
    		id: create_if_block_4$2.name,
    		type: "if",
    		source: "(34:12) {#if f.selected}",
    		ctx
    	});

    	return block;
    }

    // (41:8) {#if f.pii}
    function create_if_block_2$7(ctx) {
    	let i;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "title", "Personally Identifiable Information");
    			attr_dev(i, "class", "i-fingerprint i-16");
    			add_location(i, file$i, 41, 16, 1194);
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
    		id: create_if_block_2$7.name,
    		type: "if",
    		source: "(41:8) {#if f.pii}",
    		ctx
    	});

    	return block;
    }

    // (47:4) {#if f.children && f.expanded}
    function create_if_block_1$9(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*f*/ ctx[0].children;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$8(get_each_context$8(ctx, each_value, i));
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
    					const child_ctx = get_each_context$8(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$8(child_ctx);
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
    		id: create_if_block_1$9.name,
    		type: "if",
    		source: "(47:4) {#if f.children && f.expanded}",
    		ctx
    	});

    	return block;
    }

    // (48:8) {#each f.children as f}
    function create_each_block$8(ctx) {
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
    		id: create_each_block$8.name,
    		type: "each",
    		source: "(48:8) {#each f.children as f}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*f*/ ctx[0].visible && create_if_block$d(ctx);

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
    					if_block = create_if_block$d(ctx);
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
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, { f: 0, indent: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InputMultiItem",
    			options,
    			id: create_fragment$i.name
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

    const { console: console_1$5 } = globals;
    const file$h = "src/components/form/InputMulti.svelte";

    function get_each_context_1$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    function get_each_context$7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    function get_each_context_2$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[26] = list[i];
    	return child_ctx;
    }

    // (138:4) {#if f.label}
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
    			add_location(label, file$h, 138, 8, 3835);
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
    		source: "(138:4) {#if f.label}",
    		ctx
    	});

    	return block;
    }

    // (141:4) {#if f.hint}
    function create_if_block_9$1(ctx) {
    	let p;
    	let t_value = /*f*/ ctx[0].hint + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			add_location(p, file$h, 141, 8, 3908);
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
    		source: "(141:4) {#if f.hint}",
    		ctx
    	});

    	return block;
    }

    // (144:4) {#if f.max_warning}
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
    		source: "(144:4) {#if f.max_warning}",
    		ctx
    	});

    	return block;
    }

    // (145:8) {#if selected.length >= f.max_warning.value}
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
    			add_location(i, file$h, 145, 30, 4041);
    			attr_dev(p, "class", "svelte-1na24b2");
    			add_location(p, file$h, 145, 57, 4068);
    			attr_dev(div, "class", "idea svelte-1na24b2");
    			add_location(div, file$h, 145, 12, 4023);
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
    		source: "(145:8) {#if selected.length >= f.max_warning.value}",
    		ctx
    	});

    	return block;
    }

    // (149:4) {#if dd_in}
    function create_if_block_6$1(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "multi-mask svelte-1na24b2");
    			add_location(div, file$h, 149, 8, 4153);
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
    		source: "(149:4) {#if dd_in}",
    		ctx
    	});

    	return block;
    }

    // (152:4) {#if selected_shortlist.length}
    function create_if_block_3$1(ctx) {
    	let t;
    	let if_block_anchor;
    	let each_value_2 = /*selected_shortlist*/ ctx[5];
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2$3(get_each_context_2$3(ctx, each_value_2, i));
    	}

    	let if_block = /*selected_shortlist*/ ctx[5].length < /*selected*/ ctx[4].length && create_if_block_4$1(ctx);

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
    					if_block = create_if_block_4$1(ctx);
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
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(152:4) {#if selected_shortlist.length}",
    		ctx
    	});

    	return block;
    }

    // (156:12) {:else}
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
    			add_location(i, file$h, 156, 80, 4523);
    			attr_dev(div, "class", "tag svelte-1na24b2");
    			add_location(div, file$h, 156, 16, 4459);
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
    		source: "(156:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (154:12) {#if tag.key == 'record_id'}
    function create_if_block_5$1(ctx) {
    	let div;
    	let t_value = /*tag*/ ctx[26].value + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "tag no_delete svelte-1na24b2");
    			add_location(div, file$h, 154, 16, 4378);
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
    		id: create_if_block_5$1.name,
    		type: "if",
    		source: "(154:12) {#if tag.key == 'record_id'}",
    		ctx
    	});

    	return block;
    }

    // (153:8) {#each selected_shortlist as tag}
    function create_each_block_2$3(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*tag*/ ctx[26].key == "record_id") return create_if_block_5$1;
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
    		source: "(153:8) {#each selected_shortlist as tag}",
    		ctx
    	});

    	return block;
    }

    // (160:8) {#if selected_shortlist.length < selected.length}
    function create_if_block_4$1(ctx) {
    	let div;
    	let t0;
    	let t1_value = /*selected*/ ctx[4].length - /*selected_shortlist*/ ctx[5].length + "";
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("+");
    			t1 = text(t1_value);
    			attr_dev(div, "class", "tag no_delete svelte-1na24b2");
    			add_location(div, file$h, 160, 12, 4662);
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
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(160:8) {#if selected_shortlist.length < selected.length}",
    		ctx
    	});

    	return block;
    }

    // (169:12) {:else}
    function create_else_block$8(ctx) {
    	let i;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "i-chevron-up i-20");
    			add_location(i, file$h, 169, 16, 5135);
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
    		id: create_else_block$8.name,
    		type: "else",
    		source: "(169:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (167:12) {#if !dd_in}
    function create_if_block_2$6(ctx) {
    	let i;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "i-chevron-down i-20");
    			add_location(i, file$h, 167, 16, 5025);
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
    		id: create_if_block_2$6.name,
    		type: "if",
    		source: "(167:12) {#if !dd_in}",
    		ctx
    	});

    	return block;
    }

    // (187:40) 
    function create_if_block_1$8(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value_1 = /*selected*/ ctx[4];
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
    					const child_ctx = get_each_context_1$3(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1$3(child_ctx);
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
    		id: create_if_block_1$8.name,
    		type: "if",
    		source: "(187:40) ",
    		ctx
    	});

    	return block;
    }

    // (180:12) {#if tab == 'all'}
    function create_if_block$c(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*f*/ ctx[0].options;
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
    			if (dirty & /*f, handleItemUpdate*/ 129) {
    				each_value = /*f*/ ctx[0].options;
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
    		id: create_if_block$c.name,
    		type: "if",
    		source: "(180:12) {#if tab == 'all'}",
    		ctx
    	});

    	return block;
    }

    // (188:16) {#each selected as f}
    function create_each_block_1$3(ctx) {
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
    		id: create_each_block_1$3.name,
    		type: "each",
    		source: "(188:16) {#each selected as f}",
    		ctx
    	});

    	return block;
    }

    // (181:16) {#each f.options as f}
    function create_each_block$7(ctx) {
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
    		id: create_each_block$7.name,
    		type: "each",
    		source: "(181:16) {#each f.options as f}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
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
    	let if_block4 = /*selected_shortlist*/ ctx[5].length && create_if_block_3$1(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (!/*dd_in*/ ctx[1]) return create_if_block_2$6;
    		return create_else_block$8;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block5 = current_block_type(ctx);
    	const if_block_creators = [create_if_block$c, create_if_block_1$8];
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
    			add_location(input, file$h, 165, 12, 4845);
    			attr_dev(div0, "class", "form-control");
    			add_location(div0, file$h, 164, 8, 4806);
    			attr_dev(a0, "class", "svelte-1na24b2");
    			add_location(a0, file$h, 175, 35, 5376);
    			attr_dev(li0, "class", "select svelte-1na24b2");
    			add_location(li0, file$h, 175, 16, 5357);
    			attr_dev(a1, "href", "#ehs/incidents/dashboard");
    			attr_dev(a1, "class", "svelte-1na24b2");
    			toggle_class(a1, "active", /*tab*/ ctx[2] == "all");
    			add_location(a1, file$h, 176, 20, 5415);
    			add_location(li1, file$h, 176, 16, 5411);
    			attr_dev(a2, "href", "#ehs/incidents/dashboard");
    			attr_dev(a2, "class", "svelte-1na24b2");
    			toggle_class(a2, "active", /*tab*/ ctx[2] == "selected");
    			add_location(a2, file$h, 177, 20, 5565);
    			add_location(li2, file$h, 177, 16, 5561);
    			attr_dev(ul, "class", "tabs svelte-1na24b2");
    			add_location(ul, file$h, 174, 12, 5323);
    			attr_dev(div1, "class", "multi-dropdown svelte-1na24b2");
    			toggle_class(div1, "dd_in", /*dd_in*/ ctx[1]);
    			add_location(div1, file$h, 173, 8, 5270);
    			attr_dev(div2, "class", "multi-wrapper svelte-1na24b2");
    			add_location(div2, file$h, 163, 4, 4770);
    			attr_dev(div3, "class", "form-item svelte-1na24b2");
    			add_location(div3, file$h, 136, 0, 3766);
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
    					listen_dev(input, "focus", focus_handler, false, false, false),
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
    					if_block4 = create_if_block_3$1(ctx);
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
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function filter_item(item, txt) {
    	let item_ok = false;
    	console.log("found in item?", item.value.toLowerCase(), txt, item.value.toLowerCase().indexOf(txt) >= 0);

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

    function instance$h($$self, $$props, $$invalidate) {
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
    		console.log("recalcing");
    		cull(f.options, f.answer);

    		if (f.answer !== "") {
    			$$invalidate(1, dd_in = true);
    		}

    		$$invalidate(4, selected = tree_to_selected(f.options));

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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$5.warn(`<InputMulti> was created with unknown prop '${key}'`);
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
    		filter_item,
    		cull,
    		w,
    		tree_to_selected,
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
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, { f: 0, channel: 9 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InputMulti",
    			options,
    			id: create_fragment$h.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*f*/ ctx[0] === undefined && !("f" in props)) {
    			console_1$5.warn("<InputMulti> was created without expected prop 'f'");
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

    /* src/components/form/InputTextarea.svelte generated by Svelte v3.35.0 */

    const file$g = "src/components/form/InputTextarea.svelte";

    // (7:4) {#if f.label}
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
    			add_location(label, file$g, 7, 8, 89);
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
    		source: "(7:4) {#if f.label}",
    		ctx
    	});

    	return block;
    }

    // (10:4) {#if f.hint}
    function create_if_block$b(ctx) {
    	let p;
    	let t_value = /*f*/ ctx[0].hint + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			add_location(p, file$g, 10, 8, 162);
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
    		source: "(10:4) {#if f.hint}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let textarea;
    	let textarea_id_value;
    	let mounted;
    	let dispose;
    	let if_block0 = /*f*/ ctx[0].label && create_if_block_1$7(ctx);
    	let if_block1 = /*f*/ ctx[0].hint && create_if_block$b(ctx);

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
    			add_location(textarea, file$g, 12, 4, 192);
    			attr_dev(div, "class", "form-item");
    			add_location(div, file$g, 5, 0, 39);
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
    					if_block1 = create_if_block$b(ctx);
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
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, { f: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InputTextarea",
    			options,
    			id: create_fragment$g.name
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

    const file$f = "src/components/form/InputSwitch.svelte";

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	child_ctx[5] = list;
    	child_ctx[6] = i;
    	return child_ctx;
    }

    // (8:4) {#if f.label}
    function create_if_block_1$6(ctx) {
    	let label;
    	let t_value = /*f*/ ctx[0].label + "";
    	let t;
    	let label_for_value;

    	const block = {
    		c: function create() {
    			label = element("label");
    			t = text(t_value);
    			attr_dev(label, "for", label_for_value = /*f*/ ctx[0].id);
    			add_location(label, file$f, 8, 8, 124);
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
    		id: create_if_block_1$6.name,
    		type: "if",
    		source: "(8:4) {#if f.label}",
    		ctx
    	});

    	return block;
    }

    // (11:4) {#if f.hint}
    function create_if_block$a(ctx) {
    	let p;
    	let t_value = /*f*/ ctx[0].hint + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			attr_dev(p, "class", "svelte-1wnxz4y");
    			add_location(p, file$f, 11, 8, 197);
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
    		id: create_if_block$a.name,
    		type: "if",
    		source: "(11:4) {#if f.hint}",
    		ctx
    	});

    	return block;
    }

    // (14:4) {#each f.options as option}
    function create_each_block$6(ctx) {
    	let div;
    	let label;
    	let input;
    	let t0;
    	let span0;
    	let t1;
    	let span1;
    	let t2_value = /*option*/ ctx[4].text + "";
    	let t2;
    	let t3;
    	let mounted;
    	let dispose;

    	function input_change_handler() {
    		/*input_change_handler*/ ctx[2].call(input, /*each_value*/ ctx[5], /*option_index*/ ctx[6]);
    	}

    	function click_handler() {
    		return /*click_handler*/ ctx[3](/*option*/ ctx[4], /*each_value*/ ctx[5], /*option_index*/ ctx[6]);
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
    			attr_dev(input, "class", "svelte-1wnxz4y");
    			add_location(input, file$f, 16, 20, 353);
    			attr_dev(span0, "class", "slider svelte-1wnxz4y");
    			add_location(span0, file$f, 17, 20, 425);
    			attr_dev(label, "class", "switch svelte-1wnxz4y");
    			add_location(label, file$f, 15, 16, 310);
    			add_location(span1, file$f, 19, 16, 495);
    			attr_dev(div, "class", "switch-holder svelte-1wnxz4y");
    			add_location(div, file$f, 14, 11, 266);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, label);
    			append_dev(label, input);
    			input.checked = /*option*/ ctx[4].value;
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
    				input.checked = /*option*/ ctx[4].value;
    			}

    			if (dirty & /*f*/ 1 && t2_value !== (t2_value = /*option*/ ctx[4].text + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(14:4) {#each f.options as option}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let if_block0 = /*f*/ ctx[0].label && create_if_block_1$6(ctx);
    	let if_block1 = /*f*/ ctx[0].hint && create_if_block$a(ctx);
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
    			add_location(div, file$f, 6, 0, 74);
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
    					if_block0 = create_if_block_1$6(ctx);
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
    					if_block1 = create_if_block$a(ctx);
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
    	validate_slots("InputSwitch", slots, []);
    	let { f } = $$props;
    	let { channel = "ANSWER" } = $$props;
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

    	return [f, channel, input_change_handler, click_handler];
    }

    class InputSwitch extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, { f: 0, channel: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InputSwitch",
    			options,
    			id: create_fragment$f.name
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
    const file$e = "src/components/form/InputMatrix.svelte";

    // (15:4) {#if f.label}
    function create_if_block_1$5(ctx) {
    	let label;
    	let t0_value = /*f*/ ctx[0].label + "";
    	let t0;
    	let t1;
    	let label_for_value;
    	let if_block = /*f*/ ctx[0].optional && create_if_block_2$5(ctx);

    	const block = {
    		c: function create() {
    			label = element("label");
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block) if_block.c();
    			attr_dev(label, "for", label_for_value = /*f*/ ctx[0].id);
    			add_location(label, file$e, 15, 8, 298);
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
    					if_block = create_if_block_2$5(ctx);
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
    		id: create_if_block_1$5.name,
    		type: "if",
    		source: "(15:4) {#if f.label}",
    		ctx
    	});

    	return block;
    }

    // (16:38) {#if f.optional}
    function create_if_block_2$5(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "(Optional)";
    			attr_dev(span, "class", "optional");
    			add_location(span, file$e, 15, 54, 344);
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
    		id: create_if_block_2$5.name,
    		type: "if",
    		source: "(16:38) {#if f.optional}",
    		ctx
    	});

    	return block;
    }

    // (18:4) {#if f.hint}
    function create_if_block$9(ctx) {
    	let p;
    	let t_value = /*f*/ ctx[0].hint + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			add_location(p, file$e, 18, 8, 433);
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
    		id: create_if_block$9.name,
    		type: "if",
    		source: "(18:4) {#if f.hint}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
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
    	let if_block0 = /*f*/ ctx[0].label && create_if_block_1$5(ctx);
    	let if_block1 = /*f*/ ctx[0].hint && create_if_block$9(ctx);

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
    			add_location(div0, file$e, 21, 8, 523);
    			attr_dev(i, "class", "i-hinton-plot  i-20");
    			add_location(i, file$e, 22, 8, 724);
    			attr_dev(div1, "class", "form-control svelte-1l2uey6");
    			add_location(div1, file$e, 20, 4, 463);
    			attr_dev(div2, "class", "form-item");
    			add_location(div2, file$e, 13, 0, 248);
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
    					if_block0 = create_if_block_1$5(ctx);
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
    					if_block1 = create_if_block$9(ctx);
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
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, { f: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InputMatrix",
    			options,
    			id: create_fragment$e.name
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
    const file$d = "src/components/form/Section.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    // (25:4) {#if f.label}
    function create_if_block_2$4(ctx) {
    	let div;
    	let h3;
    	let t_value = /*f*/ ctx[0].label + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h3 = element("h3");
    			t = text(t_value);
    			attr_dev(h3, "class", "svelte-1q9p9bd");
    			add_location(h3, file$d, 26, 12, 651);
    			attr_dev(div, "class", "card-header");
    			add_location(div, file$d, 25, 8, 613);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h3);
    			append_dev(h3, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*f*/ 1 && t_value !== (t_value = /*f*/ ctx[0].label + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$4.name,
    		type: "if",
    		source: "(25:4) {#if f.label}",
    		ctx
    	});

    	return block;
    }

    // (32:8) {#if f.children}
    function create_if_block$8(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*f*/ ctx[0].children;
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
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*components, f*/ 3) {
    				each_value = /*f*/ ctx[0].children;
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
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(32:8) {#if f.children}",
    		ctx
    	});

    	return block;
    }

    // (37:16) {:else}
    function create_else_block$7(ctx) {
    	let div;
    	let t0;
    	let b;
    	let t1_value = /*f*/ ctx[0].item_type + "";
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("Tried loading an unknown component ");
    			b = element("b");
    			t1 = text(t1_value);
    			add_location(b, file$d, 37, 60, 993);
    			add_location(div, file$d, 37, 20, 953);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, b);
    			append_dev(b, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*f*/ 1 && t1_value !== (t1_value = /*f*/ ctx[0].item_type + "")) set_data_dev(t1, t1_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$7.name,
    		type: "else",
    		source: "(37:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (35:16) {#if components[f.item_type]}
    function create_if_block_1$4(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*components*/ ctx[1][/*f*/ ctx[0].item_type];

    	function switch_props(ctx) {
    		return {
    			props: { f: /*f*/ ctx[0] },
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
    			if (dirty & /*f*/ 1) switch_instance_changes.f = /*f*/ ctx[0];

    			if (switch_value !== (switch_value = /*components*/ ctx[1][/*f*/ ctx[0].item_type])) {
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
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(35:16) {#if components[f.item_type]}",
    		ctx
    	});

    	return block;
    }

    // (34:12) {#each f.children as f}
    function create_each_block$5(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$4, create_else_block$7];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*components*/ ctx[1][/*f*/ ctx[0].item_type]) return 0;
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
    		source: "(34:12) {#each f.children as f}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let div1;
    	let t;
    	let div0;
    	let current;
    	let if_block0 = /*f*/ ctx[0].label && create_if_block_2$4(ctx);
    	let if_block1 = /*f*/ ctx[0].children && create_if_block$8(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			if (if_block0) if_block0.c();
    			t = space();
    			div0 = element("div");
    			if (if_block1) if_block1.c();
    			attr_dev(div0, "class", "card-body");
    			add_location(div0, file$d, 30, 4, 700);
    			attr_dev(div1, "class", "card svelte-1q9p9bd");
    			add_location(div1, file$d, 23, 0, 568);
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
    			if (/*f*/ ctx[0].label) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2$4(ctx);
    					if_block0.c();
    					if_block0.m(div1, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*f*/ ctx[0].children) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*f*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$8(ctx);
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
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Section", slots, []);

    	let components = {
    		"input_text": InputText,
    		"input_multi": InputMulti,
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
    		if ("f" in $$props) $$invalidate(0, f = $$props.f);
    		if ("channel" in $$props) $$invalidate(2, channel = $$props.channel);
    	};

    	$$self.$capture_state = () => ({
    		InputSelect,
    		InputText,
    		InputMulti,
    		InputTextarea,
    		InputSwitch,
    		InputMatrix,
    		components,
    		f,
    		channel
    	});

    	$$self.$inject_state = $$props => {
    		if ("components" in $$props) $$invalidate(1, components = $$props.components);
    		if ("f" in $$props) $$invalidate(0, f = $$props.f);
    		if ("channel" in $$props) $$invalidate(2, channel = $$props.channel);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [f, components, channel];
    }

    class Section extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { f: 0, channel: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Section",
    			options,
    			id: create_fragment$d.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*f*/ ctx[0] === undefined && !("f" in props)) {
    			console.warn("<Section> was created without expected prop 'f'");
    		}

    		if (/*channel*/ ctx[2] === undefined && !("channel" in props)) {
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

    const file$c = "src/components/form/InputCheckbox.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	child_ctx[4] = list;
    	child_ctx[5] = i;
    	return child_ctx;
    }

    // (9:4) {#if f.label}
    function create_if_block_2$3(ctx) {
    	let label;
    	let t_value = /*f*/ ctx[0].label + "";
    	let t;

    	const block = {
    		c: function create() {
    			label = element("label");
    			t = text(t_value);
    			add_location(label, file$c, 9, 8, 125);
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
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(9:4) {#if f.label}",
    		ctx
    	});

    	return block;
    }

    // (12:4) {#if f.hint}
    function create_if_block_1$3(ctx) {
    	let p;
    	let t_value = /*f*/ ctx[0].hint + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			add_location(p, file$c, 12, 8, 185);
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
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(12:4) {#if f.hint}",
    		ctx
    	});

    	return block;
    }

    // (19:12) {:else}
    function create_else_block$6(ctx) {
    	let i;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "i-checkbox i-20 svelte-17p0g6d");
    			add_location(i, file$c, 19, 16, 499);
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
    		id: create_else_block$6.name,
    		type: "else",
    		source: "(19:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (17:12) {#if option.value}
    function create_if_block$7(ctx) {
    	let i;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "i-checkbox-selected i-20 svelte-17p0g6d");
    			add_location(i, file$c, 17, 16, 421);
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
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(17:12) {#if option.value}",
    		ctx
    	});

    	return block;
    }

    // (15:4) {#each f.options as option}
    function create_each_block$4(ctx) {
    	let div;
    	let t0;
    	let t1_value = /*option*/ ctx[3].text + "";
    	let t1;
    	let t2;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*option*/ ctx[3].value) return create_if_block$7;
    		return create_else_block$6;
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
    			add_location(div, file$c, 15, 8, 251);
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
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(15:4) {#each f.options as option}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let if_block0 = /*f*/ ctx[0].label && create_if_block_2$3(ctx);
    	let if_block1 = /*f*/ ctx[0].hint && create_if_block_1$3(ctx);
    	let each_value = /*f*/ ctx[0].options;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
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
    			add_location(div, file$c, 7, 0, 75);
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
    					if_block0 = create_if_block_2$3(ctx);
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
    					if_block1 = create_if_block_1$3(ctx);
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
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
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
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { f: 0, channel: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InputCheckbox",
    			options,
    			id: create_fragment$c.name
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

    const { console: console_1$4 } = globals;
    const file$b = "src/components/form/Form.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (35:4) {:else}
    function create_else_block$5(ctx) {
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
    			add_location(b, file$b, 35, 26, 1019);
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
    		id: create_else_block$5.name,
    		type: "else",
    		source: "(35:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (33:4) {#if components[f.item_type]}
    function create_if_block$6(ctx) {
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
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(33:4) {#if components[f.item_type]}",
    		ctx
    	});

    	return block;
    }

    // (32:0) {#each f as f}
    function create_each_block$3(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$6, create_else_block$5];
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
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(32:0) {#each f as f}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*f*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
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
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
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
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Form", slots, []);
    	let { f } = $$props;
    	let { channel = "ANSWER" } = $$props;

    	let components = {
    		"section": Section,
    		"input_text": InputText,
    		"input_multi": InputMulti,
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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$4.warn(`<Form> was created with unknown prop '${key}'`);
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
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { f: 1, channel: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Form",
    			options,
    			id: create_fragment$b.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*f*/ ctx[1] === undefined && !("f" in props)) {
    			console_1$4.warn("<Form> was created without expected prop 'f'");
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

    const file$a = "src/components/table/RecordID.svelte";

    function create_fragment$a(ctx) {
    	let a;
    	let t;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text(/*obj*/ ctx[0]);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "svelte-dqfw7i");
    			add_location(a, file$a, 4, 0, 40);
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
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { obj: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RecordID",
    			options,
    			id: create_fragment$a.name
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

    const file$9 = "src/components/table/Status.svelte";

    // (21:0) {:else}
    function create_else_block$4(ctx) {
    	let span;
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(/*obj*/ ctx[0]);
    			attr_dev(span, "class", "badge unknown svelte-siduoh");
    			add_location(span, file$9, 21, 4, 513);
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
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(21:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (19:0) {#if status_list[obj]}
    function create_if_block$5(ctx) {
    	let span;
    	let t_value = /*status_list*/ ctx[1][/*obj*/ ctx[0]].value + "";
    	let t;
    	let span_class_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", span_class_value = "badge " + /*status_list*/ ctx[1][/*obj*/ ctx[0]].color + " svelte-siduoh");
    			add_location(span, file$9, 19, 4, 424);
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
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(19:0) {#if status_list[obj]}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*status_list*/ ctx[1][/*obj*/ ctx[0]]) return create_if_block$5;
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
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { obj: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Status",
    			options,
    			id: create_fragment$9.name
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

    const file$8 = "src/components/table/Channel.svelte";

    // (17:0) {:else}
    function create_else_block$3(ctx) {
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
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(17:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (15:0) {#if status_list[obj]}
    function create_if_block$4(ctx) {
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
    			add_location(i, file$8, 15, 10, 276);
    			attr_dev(span, "class", "svelte-1yatwl7");
    			add_location(span, file$8, 15, 4, 270);
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
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(15:0) {#if status_list[obj]}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*status_list*/ ctx[1][/*obj*/ ctx[0]]) return create_if_block$4;
    		return create_else_block$3;
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
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { obj: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Channel",
    			options,
    			id: create_fragment$8.name
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

    const file$7 = "src/components/table/Date.svelte";

    function create_fragment$7(ctx) {
    	let span;
    	let t;
    	let span_title_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(/*formatted*/ ctx[1]);
    			attr_dev(span, "title", span_title_value = "UTC: " + /*obj*/ ctx[0]);
    			add_location(span, file$7, 9, 0, 275);
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
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { obj: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Date_1",
    			options,
    			id: create_fragment$7.name
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

    const { Object: Object_1$1, console: console_1$3 } = globals;
    const file$6 = "src/Frame_incidents.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[41] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[44] = list[i][0];
    	child_ctx[45] = list[i][1];
    	return child_ctx;
    }

    function get_each_context_2$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[44] = list[i][0];
    	child_ctx[45] = list[i][1];
    	return child_ctx;
    }

    // (544:28) 
    function create_if_block_2$2(ctx) {
    	let h2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Summary";
    			add_location(h2, file$6, 544, 4, 21785);
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
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(544:28) ",
    		ctx
    	});

    	return block;
    }

    // (393:0) {#if tab == 'overview'}
    function create_if_block$3(ctx) {
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
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
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
    			add_location(a0, file$6, 398, 60, 12266);
    			attr_dev(div0, "class", "card-header");
    			add_location(div0, file$6, 398, 24, 12230);
    			attr_dev(div1, "class", "big-num");
    			add_location(div1, file$6, 400, 28, 12459);
    			attr_dev(div2, "class", "card-body");
    			add_location(div2, file$6, 399, 24, 12407);
    			attr_dev(div3, "class", "card card-31");
    			add_location(div3, file$6, 397, 20, 12179);
    			attr_dev(div4, "class", "col6");
    			add_location(div4, file$6, 396, 16, 12140);
    			attr_dev(a1, "href", "/");
    			attr_dev(a1, "class", "i-pin i-20 btn-right");
    			add_location(a1, file$6, 406, 71, 12723);
    			attr_dev(div5, "class", "card-header");
    			add_location(div5, file$6, 406, 24, 12676);
    			attr_dev(div6, "class", "big-num minor");
    			add_location(div6, file$6, 408, 28, 12927);
    			attr_dev(div7, "class", "card-body");
    			add_location(div7, file$6, 407, 24, 12875);
    			attr_dev(div8, "class", "card card-31");
    			add_location(div8, file$6, 405, 20, 12625);
    			attr_dev(div9, "class", "col6");
    			add_location(div9, file$6, 404, 16, 12586);
    			attr_dev(a2, "href", "/");
    			attr_dev(a2, "class", "i-pin i-20 btn-right");
    			add_location(a2, file$6, 414, 65, 13191);
    			attr_dev(div10, "class", "card-header");
    			add_location(div10, file$6, 414, 24, 13150);
    			attr_dev(div11, "class", "big-num minor");
    			add_location(div11, file$6, 416, 28, 13389);
    			attr_dev(div12, "class", "card-body");
    			add_location(div12, file$6, 415, 24, 13337);
    			attr_dev(div13, "class", "card card-31");
    			add_location(div13, file$6, 413, 20, 13099);
    			attr_dev(div14, "class", "col6");
    			add_location(div14, file$6, 412, 16, 13060);
    			attr_dev(a3, "href", "/");
    			attr_dev(a3, "class", "i-pin i-20 btn-right");
    			add_location(a3, file$6, 422, 72, 13659);
    			attr_dev(div15, "class", "card-header");
    			add_location(div15, file$6, 422, 24, 13611);
    			attr_dev(div16, "class", "big-num danger");
    			add_location(div16, file$6, 424, 28, 13864);
    			attr_dev(div17, "class", "card-body");
    			add_location(div17, file$6, 423, 24, 13812);
    			attr_dev(div18, "class", "card card-31");
    			add_location(div18, file$6, 421, 20, 13560);
    			attr_dev(div19, "class", "col6");
    			add_location(div19, file$6, 420, 16, 13521);
    			attr_dev(div20, "class", "row");
    			add_location(div20, file$6, 395, 12, 12106);
    			attr_dev(div21, "class", "col12 col-md-6");
    			add_location(div21, file$6, 394, 8, 12065);
    			attr_dev(a4, "href", "/");
    			attr_dev(a4, "class", "i-pin i-20 btn-right");
    			add_location(a4, file$6, 433, 55, 14147);
    			attr_dev(div22, "class", "card-header");
    			add_location(div22, file$6, 433, 16, 14108);
    			attr_dev(path0, "class", "grid_lines svelte-hz54gq");
    			attr_dev(path0, "d", "M 35 162 L 407 162 M 35 138 L 407 138 M 35 114 L 407 114 M 35 91 L 407 91 M 35 67 L 407 67 M 35 43 L 407 43 M 35 19 L 407 19");
    			add_location(path0, file$6, 438, 24, 14594);
    			attr_dev(rect0, "class", "leg1 svelte-hz54gq");
    			attr_dev(rect0, "x", "39");
    			attr_dev(rect0, "y", "150");
    			attr_dev(rect0, "width", "29");
    			attr_dev(rect0, "height", "12");
    			add_location(rect0, file$6, 440, 24, 14805);
    			attr_dev(rect1, "class", "leg1 svelte-hz54gq");
    			attr_dev(rect1, "x", "76");
    			attr_dev(rect1, "y", "138");
    			attr_dev(rect1, "width", "29");
    			attr_dev(rect1, "height", "24");
    			add_location(rect1, file$6, 441, 24, 14881);
    			attr_dev(rect2, "class", "leg1 svelte-hz54gq");
    			attr_dev(rect2, "x", "225");
    			attr_dev(rect2, "y", "150");
    			attr_dev(rect2, "width", "29");
    			attr_dev(rect2, "height", "12");
    			add_location(rect2, file$6, 442, 24, 14957);
    			attr_dev(rect3, "class", "leg1 svelte-hz54gq");
    			attr_dev(rect3, "x", "262");
    			attr_dev(rect3, "y", "150");
    			attr_dev(rect3, "width", "29");
    			attr_dev(rect3, "height", "12");
    			add_location(rect3, file$6, 443, 24, 15034);
    			attr_dev(rect4, "class", "leg1 svelte-hz54gq");
    			attr_dev(rect4, "x", "299");
    			attr_dev(rect4, "y", "150");
    			attr_dev(rect4, "width", "29");
    			attr_dev(rect4, "height", "12");
    			add_location(rect4, file$6, 444, 24, 15111);
    			attr_dev(rect5, "class", "leg1 svelte-hz54gq");
    			attr_dev(rect5, "x", "374");
    			attr_dev(rect5, "y", "126");
    			attr_dev(rect5, "width", "29");
    			attr_dev(rect5, "height", "36");
    			add_location(rect5, file$6, 445, 24, 15188);
    			attr_dev(rect6, "class", "leg2 svelte-hz54gq");
    			attr_dev(rect6, "x", "39");
    			attr_dev(rect6, "y", "138");
    			attr_dev(rect6, "width", "29");
    			attr_dev(rect6, "height", "12");
    			add_location(rect6, file$6, 448, 24, 15267);
    			attr_dev(rect7, "class", "leg2 svelte-hz54gq");
    			attr_dev(rect7, "x", "76");
    			attr_dev(rect7, "y", "114");
    			attr_dev(rect7, "width", "29");
    			attr_dev(rect7, "height", "24");
    			add_location(rect7, file$6, 449, 24, 15343);
    			attr_dev(rect8, "class", "leg2 svelte-hz54gq");
    			attr_dev(rect8, "x", "151");
    			attr_dev(rect8, "y", "150");
    			attr_dev(rect8, "width", "29");
    			attr_dev(rect8, "height", "12");
    			add_location(rect8, file$6, 450, 24, 15419);
    			attr_dev(rect9, "class", "leg2 svelte-hz54gq");
    			attr_dev(rect9, "x", "225");
    			attr_dev(rect9, "y", "138");
    			attr_dev(rect9, "width", "29");
    			attr_dev(rect9, "height", "12");
    			add_location(rect9, file$6, 451, 24, 15496);
    			attr_dev(rect10, "class", "leg2 svelte-hz54gq");
    			attr_dev(rect10, "x", "262");
    			attr_dev(rect10, "y", "126");
    			attr_dev(rect10, "width", "29");
    			attr_dev(rect10, "height", "24");
    			add_location(rect10, file$6, 452, 24, 15573);
    			attr_dev(rect11, "class", "leg2 svelte-hz54gq");
    			attr_dev(rect11, "x", "374");
    			attr_dev(rect11, "y", "114");
    			attr_dev(rect11, "width", "29");
    			attr_dev(rect11, "height", "12");
    			add_location(rect11, file$6, 453, 24, 15650);
    			attr_dev(rect12, "class", "leg3 svelte-hz54gq");
    			attr_dev(rect12, "x", "76");
    			attr_dev(rect12, "y", "55");
    			attr_dev(rect12, "width", "29");
    			attr_dev(rect12, "height", "60");
    			add_location(rect12, file$6, 456, 24, 15793);
    			attr_dev(rect13, "class", "leg3 svelte-hz54gq");
    			attr_dev(rect13, "x", "113");
    			attr_dev(rect13, "y", "138");
    			attr_dev(rect13, "width", "29");
    			attr_dev(rect13, "height", "24");
    			add_location(rect13, file$6, 457, 24, 15868);
    			attr_dev(rect14, "class", "leg3 svelte-hz54gq");
    			attr_dev(rect14, "x", "188");
    			attr_dev(rect14, "y", "138");
    			attr_dev(rect14, "width", "29");
    			attr_dev(rect14, "height", "24");
    			add_location(rect14, file$6, 458, 24, 15945);
    			attr_dev(rect15, "class", "leg4 svelte-hz54gq");
    			attr_dev(rect15, "x", "262");
    			attr_dev(rect15, "y", "114");
    			attr_dev(rect15, "width", "29");
    			attr_dev(rect15, "height", "12");
    			add_location(rect15, file$6, 460, 24, 16047);
    			attr_dev(rect16, "class", "leg4 svelte-hz54gq");
    			attr_dev(rect16, "x", "374");
    			attr_dev(rect16, "y", "102");
    			attr_dev(rect16, "width", "29");
    			attr_dev(rect16, "height", "12");
    			add_location(rect16, file$6, 461, 24, 16124);
    			attr_dev(rect17, "class", "leg5 svelte-hz54gq");
    			attr_dev(rect17, "x", "76");
    			attr_dev(rect17, "y", "31");
    			attr_dev(rect17, "width", "29");
    			attr_dev(rect17, "height", "24");
    			add_location(rect17, file$6, 463, 24, 16241);
    			attr_dev(path1, "class", "axis svelte-hz54gq");
    			attr_dev(path1, "d", "M 34 162 L 408 162 M 35 162 L 35 167 M 72 162 L 72 167 M 109 162 L 109 167 M 147 162 L 147 167 M 184 162 L 184 167 M 221 162 L 221 167 M 258 162 L 258 167 M 295 162 L 295 167 M 333 162 L 333 167 M 370 162 L 370 167 M 407 162 L 407 167");
    			add_location(path1, file$6, 466, 24, 16408);
    			attr_dev(path2, "class", "axis svelte-hz54gq");
    			attr_dev(path2, "d", "M 35 162 L 35 19 M 35 162 L 30 162 M 35 138 L 30 138 M 35 114 L 30 114 M 35 91 L 30 91 M 35 67 L 30 67 M 35 43 L 30 43 M 35 19 L 30 19");
    			add_location(path2, file$6, 468, 24, 16750);
    			attr_dev(tspan0, "x", "41.95");
    			attr_dev(tspan0, "y", "180");
    			attr_dev(tspan0, "dy", "0");
    			add_location(tspan0, file$6, 470, 59, 16976);
    			attr_dev(tspan1, "x", "45.38");
    			attr_dev(tspan1, "y", "180");
    			attr_dev(tspan1, "dy", "12.5");
    			add_location(tspan1, file$6, 470, 104, 17021);
    			attr_dev(text0, "x", "40.1");
    			attr_dev(text0, "y", "170");
    			attr_dev(text0, "opacity", "1");
    			attr_dev(text0, "class", "svelte-hz54gq");
    			add_location(text0, file$6, 470, 24, 16941);
    			attr_dev(tspan2, "x", "376.75");
    			attr_dev(tspan2, "y", "180");
    			attr_dev(tspan2, "dy", "0");
    			add_location(tspan2, file$6, 471, 60, 17136);
    			attr_dev(tspan3, "x", "380.18");
    			attr_dev(tspan3, "y", "180");
    			attr_dev(tspan3, "dy", "12.5");
    			add_location(tspan3, file$6, 471, 106, 17182);
    			attr_dev(text1, "x", "374.9");
    			attr_dev(text1, "y", "170");
    			attr_dev(text1, "opacity", "1");
    			attr_dev(text1, "class", "svelte-hz54gq");
    			add_location(text1, file$6, 471, 24, 17100);
    			attr_dev(tspan4, "x", "79.15");
    			attr_dev(tspan4, "y", "180");
    			attr_dev(tspan4, "dy", "0");
    			add_location(tspan4, file$6, 472, 59, 17297);
    			attr_dev(tspan5, "x", "82.58");
    			attr_dev(tspan5, "y", "180");
    			attr_dev(tspan5, "dy", "12.5");
    			add_location(tspan5, file$6, 472, 104, 17342);
    			attr_dev(text2, "x", "77.3");
    			attr_dev(text2, "y", "170");
    			attr_dev(text2, "opacity", "1");
    			attr_dev(text2, "class", "svelte-hz54gq");
    			add_location(text2, file$6, 472, 24, 17262);
    			attr_dev(tspan6, "x", "116.35");
    			attr_dev(tspan6, "y", "180");
    			attr_dev(tspan6, "dy", "0");
    			add_location(tspan6, file$6, 473, 60, 17457);
    			attr_dev(tspan7, "x", "119.78");
    			attr_dev(tspan7, "y", "180");
    			attr_dev(tspan7, "dy", "12.5");
    			add_location(tspan7, file$6, 473, 106, 17503);
    			attr_dev(text3, "x", "114.5");
    			attr_dev(text3, "y", "170");
    			attr_dev(text3, "opacity", "1");
    			attr_dev(text3, "class", "svelte-hz54gq");
    			add_location(text3, file$6, 473, 24, 17421);
    			attr_dev(tspan8, "x", "153.55");
    			attr_dev(tspan8, "y", "180");
    			attr_dev(tspan8, "dy", "0");
    			add_location(tspan8, file$6, 474, 60, 17619);
    			attr_dev(tspan9, "x", "156.98");
    			attr_dev(tspan9, "y", "180");
    			attr_dev(tspan9, "dy", "12.5");
    			add_location(tspan9, file$6, 474, 106, 17665);
    			attr_dev(text4, "x", "151.7");
    			attr_dev(text4, "y", "170");
    			attr_dev(text4, "opacity", "1");
    			attr_dev(text4, "class", "svelte-hz54gq");
    			add_location(text4, file$6, 474, 24, 17583);
    			attr_dev(tspan10, "x", "190.75");
    			attr_dev(tspan10, "y", "180");
    			attr_dev(tspan10, "dy", "0");
    			add_location(tspan10, file$6, 475, 60, 17781);
    			attr_dev(tspan11, "x", "194.18");
    			attr_dev(tspan11, "y", "180");
    			attr_dev(tspan11, "dy", "12.5");
    			add_location(tspan11, file$6, 475, 106, 17827);
    			attr_dev(text5, "x", "188.9");
    			attr_dev(text5, "y", "170");
    			attr_dev(text5, "opacity", "1");
    			attr_dev(text5, "class", "svelte-hz54gq");
    			add_location(text5, file$6, 475, 24, 17745);
    			attr_dev(tspan12, "x", "227.95");
    			attr_dev(tspan12, "y", "180");
    			attr_dev(tspan12, "dy", "0");
    			add_location(tspan12, file$6, 476, 60, 17943);
    			attr_dev(tspan13, "x", "231.38");
    			attr_dev(tspan13, "y", "180");
    			attr_dev(tspan13, "dy", "12.5");
    			add_location(tspan13, file$6, 476, 106, 17989);
    			attr_dev(text6, "x", "226.1");
    			attr_dev(text6, "y", "170");
    			attr_dev(text6, "opacity", "1");
    			attr_dev(text6, "class", "svelte-hz54gq");
    			add_location(text6, file$6, 476, 24, 17907);
    			attr_dev(tspan14, "x", "265.15");
    			attr_dev(tspan14, "y", "180");
    			attr_dev(tspan14, "dy", "0");
    			add_location(tspan14, file$6, 477, 60, 18105);
    			attr_dev(tspan15, "x", "268.58");
    			attr_dev(tspan15, "y", "180");
    			attr_dev(tspan15, "dy", "12.5");
    			add_location(tspan15, file$6, 477, 106, 18151);
    			attr_dev(text7, "x", "263.3");
    			attr_dev(text7, "y", "170");
    			attr_dev(text7, "opacity", "1");
    			attr_dev(text7, "class", "svelte-hz54gq");
    			add_location(text7, file$6, 477, 24, 18069);
    			attr_dev(tspan16, "x", "302.35");
    			attr_dev(tspan16, "y", "180");
    			attr_dev(tspan16, "dy", "0");
    			add_location(tspan16, file$6, 478, 60, 18267);
    			attr_dev(tspan17, "x", "305.78");
    			attr_dev(tspan17, "y", "180");
    			attr_dev(tspan17, "dy", "12.5");
    			add_location(tspan17, file$6, 478, 106, 18313);
    			attr_dev(text8, "x", "300.5");
    			attr_dev(text8, "y", "170");
    			attr_dev(text8, "opacity", "1");
    			attr_dev(text8, "class", "svelte-hz54gq");
    			add_location(text8, file$6, 478, 24, 18231);
    			attr_dev(tspan18, "x", "339.55");
    			attr_dev(tspan18, "y", "180");
    			attr_dev(tspan18, "dy", "0");
    			add_location(tspan18, file$6, 479, 60, 18429);
    			attr_dev(tspan19, "x", "342.98");
    			attr_dev(tspan19, "y", "180");
    			attr_dev(tspan19, "dy", "12.5");
    			add_location(tspan19, file$6, 479, 106, 18475);
    			attr_dev(text9, "x", "337.7");
    			attr_dev(text9, "y", "170");
    			attr_dev(text9, "opacity", "1");
    			attr_dev(text9, "class", "svelte-hz54gq");
    			add_location(text9, file$6, 479, 24, 18393);
    			attr_dev(tspan20, "x", "21.41");
    			attr_dev(tspan20, "y", "167.2");
    			attr_dev(tspan20, "dy", "0");
    			add_location(tspan20, file$6, 480, 62, 18593);
    			attr_dev(text10, "x", "21.41");
    			attr_dev(text10, "y", "155.2");
    			attr_dev(text10, "opacity", "1");
    			attr_dev(text10, "class", "svelte-hz54gq");
    			add_location(text10, file$6, 480, 24, 18555);
    			attr_dev(tspan21, "x", "13.81");
    			attr_dev(tspan21, "y", "24.2");
    			attr_dev(tspan21, "dy", "0");
    			add_location(tspan21, file$6, 481, 61, 18705);
    			attr_dev(text11, "x", "13.81");
    			attr_dev(text11, "y", "12.2");
    			attr_dev(text11, "opacity", "1");
    			attr_dev(text11, "class", "svelte-hz54gq");
    			add_location(text11, file$6, 481, 24, 18668);
    			attr_dev(tspan22, "x", "21.41");
    			attr_dev(tspan22, "y", "143.37");
    			attr_dev(tspan22, "dy", "0");
    			add_location(tspan22, file$6, 482, 63, 18819);
    			attr_dev(text12, "x", "21.41");
    			attr_dev(text12, "y", "131.37");
    			attr_dev(text12, "opacity", "1");
    			attr_dev(text12, "class", "svelte-hz54gq");
    			add_location(text12, file$6, 482, 24, 18780);
    			attr_dev(tspan23, "x", "21.41");
    			attr_dev(tspan23, "y", "119.54");
    			attr_dev(tspan23, "dy", "0");
    			add_location(tspan23, file$6, 483, 63, 18934);
    			attr_dev(text13, "x", "21.41");
    			attr_dev(text13, "y", "107.54");
    			attr_dev(text13, "opacity", "1");
    			attr_dev(text13, "class", "svelte-hz54gq");
    			add_location(text13, file$6, 483, 24, 18895);
    			attr_dev(tspan24, "x", "21.41");
    			attr_dev(tspan24, "y", "95.7");
    			attr_dev(tspan24, "dy", "0");
    			add_location(tspan24, file$6, 484, 61, 19047);
    			attr_dev(text14, "x", "21.41");
    			attr_dev(text14, "y", "83.7");
    			attr_dev(text14, "opacity", "1");
    			attr_dev(text14, "class", "svelte-hz54gq");
    			add_location(text14, file$6, 484, 24, 19010);
    			attr_dev(tspan25, "x", "21.41");
    			attr_dev(tspan25, "y", "71.87");
    			attr_dev(tspan25, "dy", "0");
    			add_location(tspan25, file$6, 485, 62, 19159);
    			attr_dev(text15, "x", "21.41");
    			attr_dev(text15, "y", "59.87");
    			attr_dev(text15, "opacity", "1");
    			attr_dev(text15, "class", "svelte-hz54gq");
    			add_location(text15, file$6, 485, 24, 19121);
    			attr_dev(tspan26, "x", "13.81");
    			attr_dev(tspan26, "y", "48.04");
    			attr_dev(tspan26, "dy", "0");
    			add_location(tspan26, file$6, 486, 62, 19272);
    			attr_dev(text16, "x", "13.81");
    			attr_dev(text16, "y", "36.04");
    			attr_dev(text16, "opacity", "1");
    			attr_dev(text16, "class", "svelte-hz54gq");
    			add_location(text16, file$6, 486, 24, 19234);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "class", "demo_graph svelte-hz54gq");
    			attr_dev(svg, "viewBox", "0 0 428 203");
    			attr_dev(svg, "width", "90%");
    			attr_dev(svg, "display", "block");
    			add_location(svg, file$6, 435, 20, 14327);
    			attr_dev(div23, "class", "card-body");
    			add_location(div23, file$6, 434, 16, 14283);
    			attr_dev(div24, "class", "card card-32");
    			add_location(div24, file$6, 432, 12, 14065);
    			attr_dev(div25, "class", "col12 col-md-6");
    			add_location(div25, file$6, 431, 8, 14024);
    			attr_dev(div26, "class", "row");
    			add_location(div26, file$6, 393, 4, 12039);
    			attr_dev(a5, "href", "/");
    			attr_dev(a5, "class", "i-pin i-20 btn-right");
    			add_location(a5, file$6, 497, 16, 19558);
    			attr_dev(a6, "href", "/");
    			attr_dev(a6, "class", "i-settings i-20 btn-right");
    			add_location(a6, file$6, 498, 16, 19687);
    			add_location(h4, file$6, 496, 12, 19515);
    			add_location(tr, file$6, 503, 24, 19946);
    			add_location(thead, file$6, 502, 20, 19914);
    			add_location(tbody, file$6, 509, 20, 20334);
    			attr_dev(table, "class", "table");
    			add_location(table, file$6, 501, 16, 19872);
    			attr_dev(div27, "class", "pagination");
    			add_location(div27, file$6, 538, 48, 21660);
    			attr_dev(div28, "class", "pagination-wrapper");
    			add_location(div28, file$6, 538, 16, 21628);
    			attr_dev(div29, "class", "sticky-wrapper svelte-hz54gq");
    			add_location(div29, file$6, 500, 12, 19827);
    			attr_dev(div30, "class", "col12");
    			add_location(div30, file$6, 495, 8, 19483);
    			attr_dev(div31, "class", "row");
    			add_location(div31, file$6, 494, 4, 19457);
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
    					listen_dev(a0, "click", prevent_default(/*click_handler_7*/ ctx[28]), false, true, false),
    					listen_dev(a1, "click", prevent_default(/*click_handler_8*/ ctx[29]), false, true, false),
    					listen_dev(a2, "click", prevent_default(/*click_handler_9*/ ctx[30]), false, true, false),
    					listen_dev(a3, "click", prevent_default(/*click_handler_10*/ ctx[31]), false, true, false),
    					listen_dev(a4, "click", prevent_default(/*click_handler_11*/ ctx[32]), false, true, false),
    					listen_dev(a5, "click", prevent_default(/*click_handler_12*/ ctx[33]), false, true, false),
    					listen_dev(a6, "click", prevent_default(/*click_handler_13*/ ctx[34]), false, true, false)
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
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
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
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(393:0) {#if tab == 'overview'}",
    		ctx
    	});

    	return block;
    }

    // (505:28) {#each Object.entries(selected_columns) as [k, th]}
    function create_each_block_2$2(ctx) {
    	let th;
    	let t_value = /*th*/ ctx[45].value + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler_14() {
    		return /*click_handler_14*/ ctx[35](/*th*/ ctx[45]);
    	}

    	const block = {
    		c: function create() {
    			th = element("th");
    			t = text(t_value);
    			toggle_class(th, "sortable", /*th*/ ctx[45].sortable);
    			toggle_class(th, "asc", /*th*/ ctx[45].sorted == "asc");
    			toggle_class(th, "desc", /*th*/ ctx[45].sorted == "desc");
    			add_location(th, file$6, 505, 32, 20063);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, t);

    			if (!mounted) {
    				dispose = listen_dev(th, "click", click_handler_14, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*selected_columns*/ 8 && t_value !== (t_value = /*th*/ ctx[45].value + "")) set_data_dev(t, t_value);

    			if (dirty[0] & /*selected_columns*/ 8) {
    				toggle_class(th, "sortable", /*th*/ ctx[45].sortable);
    			}

    			if (dirty[0] & /*selected_columns*/ 8) {
    				toggle_class(th, "asc", /*th*/ ctx[45].sorted == "asc");
    			}

    			if (dirty[0] & /*selected_columns*/ 8) {
    				toggle_class(th, "desc", /*th*/ ctx[45].sorted == "desc");
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
    		source: "(505:28) {#each Object.entries(selected_columns) as [k, th]}",
    		ctx
    	});

    	return block;
    }

    // (517:40) {:else}
    function create_else_block$2(ctx) {
    	let t_value = /*row*/ ctx[41][/*th*/ ctx[45].key] + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*table_data_sorted, selected_columns*/ 72 && t_value !== (t_value = /*row*/ ctx[41][/*th*/ ctx[45].key] + "")) set_data_dev(t, t_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(517:40) {:else}",
    		ctx
    	});

    	return block;
    }

    // (515:40) {#if components[th.key]}
    function create_if_block_1$2(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*components*/ ctx[7][/*th*/ ctx[45].key];

    	function switch_props(ctx) {
    		return {
    			props: { obj: /*row*/ ctx[41][/*th*/ ctx[45].key] },
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
    			if (dirty[0] & /*table_data_sorted, selected_columns*/ 72) switch_instance_changes.obj = /*row*/ ctx[41][/*th*/ ctx[45].key];

    			if (switch_value !== (switch_value = /*components*/ ctx[7][/*th*/ ctx[45].key])) {
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
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(515:40) {#if components[th.key]}",
    		ctx
    	});

    	return block;
    }

    // (513:32) {#each Object.entries(selected_columns) as [k, th]}
    function create_each_block_1$2(ctx) {
    	let td;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block_1$2, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*components*/ ctx[7][/*th*/ ctx[45].key]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			td = element("td");
    			if_block.c();
    			add_location(td, file$6, 513, 36, 20552);
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
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(513:32) {#each Object.entries(selected_columns) as [k, th]}",
    		ctx
    	});

    	return block;
    }

    // (511:24) {#each table_data_sorted as row}
    function create_each_block$2(ctx) {
    	let tr;
    	let t;
    	let current;
    	let each_value_1 = Object.entries(/*selected_columns*/ ctx[3]);
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
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
    			add_location(tr, file$6, 511, 28, 20427);
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
    					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1$2(child_ctx);
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
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(511:24) {#each table_data_sorted as row}",
    		ctx
    	});

    	return block;
    }

    // (549:0) <Pullout show_drawer={table_drawer} title="Table settings" on:close={table_cancel}>
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
    			add_location(span0, file$6, 551, 8, 21982);
    			attr_dev(span1, "class", "btn btn-secondary");
    			add_location(span1, file$6, 552, 8, 22053);
    			attr_dev(div, "class", "form-item");
    			add_location(div, file$6, 550, 4, 21950);
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
    		source: "(549:0) <Pullout show_drawer={table_drawer} title=\\\"Table settings\\\" on:close={table_cancel}>",
    		ctx
    	});

    	return block;
    }

    // (557:0) <Pullout show_drawer={pin_drawer} title={pin_title} on:close={pin_cancel}>
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
    			add_location(span0, file$6, 558, 4, 22258);
    			attr_dev(span1, "class", "btn btn-secondary");
    			add_location(span1, file$6, 560, 4, 22410);
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
    		source: "(557:0) <Pullout show_drawer={pin_drawer} title={pin_title} on:close={pin_cancel}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
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
    	let li5;
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
    	const if_block_creators = [create_if_block$3, create_if_block_2$2];
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
    			a2.textContent = "Query";
    			t7 = space();
    			a3 = element("a");
    			a3.textContent = "New";
    			t9 = space();
    			h1 = element("h1");
    			i = element("i");
    			t10 = text("Incidents");
    			t11 = space();
    			ul1 = element("ul");
    			li3 = element("li");
    			a4 = element("a");
    			a4.textContent = "Overview";
    			t13 = space();
    			li4 = element("li");
    			a5 = element("a");
    			a5.textContent = "Summary";
    			t15 = space();
    			li5 = element("li");
    			a6 = element("a");
    			a6.textContent = "Admin";
    			t17 = space();
    			if (if_block) if_block.c();
    			t18 = space();
    			create_component(pullout0.$$.fragment);
    			t19 = space();
    			create_component(pullout1.$$.fragment);
    			attr_dev(a0, "href", "#platform");
    			add_location(a0, file$6, 371, 16, 10821);
    			add_location(li0, file$6, 371, 12, 10817);
    			attr_dev(a1, "href", "#ehs");
    			add_location(a1, file$6, 372, 16, 10914);
    			add_location(li1, file$6, 372, 12, 10910);
    			add_location(li2, file$6, 373, 12, 10987);
    			attr_dev(ul0, "class", "breadcrumb");
    			add_location(ul0, file$6, 370, 8, 10781);
    			attr_dev(div0, "class", "col12 col-sm-5");
    			add_location(div0, file$6, 369, 4, 10744);
    			attr_dev(a2, "href", "#ehs/incidents/queries_new");
    			attr_dev(a2, "class", "btn btn-secondary");
    			add_location(a2, file$6, 378, 8, 11147);
    			attr_dev(a3, "href", "#ehs/incidents/incidents_new");
    			attr_dev(a3, "class", "btn");
    			add_location(a3, file$6, 379, 8, 11269);
    			attr_dev(div1, "class", "col12 col-sm-7 text-right");
    			add_location(div1, file$6, 376, 4, 11035);
    			attr_dev(div2, "class", "row sticky");
    			add_location(div2, file$6, 368, 0, 10715);
    			attr_dev(i, "class", "i-incidents i-32");
    			add_location(i, file$6, 384, 23, 11414);
    			attr_dev(h1, "class", "page-title");
    			add_location(h1, file$6, 384, 0, 11391);
    			attr_dev(a4, "href", "#ehs/incidents/overview");
    			toggle_class(a4, "active", /*tab*/ ctx[1] == "overview");
    			add_location(a4, file$6, 387, 8, 11488);
    			add_location(li3, file$6, 387, 4, 11484);
    			attr_dev(a5, "href", "#ehs/incidents/summary");
    			toggle_class(a5, "active", /*tab*/ ctx[1] == "summary");
    			add_location(a5, file$6, 388, 8, 11625);
    			add_location(li4, file$6, 388, 4, 11621);
    			attr_dev(a6, "href", "#ehs/incidents/admin");
    			toggle_class(a6, "active", /*tab*/ ctx[1] == "admin");
    			add_location(a6, file$6, 389, 8, 11759);
    			add_location(li5, file$6, 389, 4, 11755);
    			attr_dev(ul1, "class", "tabs");
    			add_location(ul1, file$6, 386, 0, 11462);
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
    			append_dev(ul1, t15);
    			append_dev(ul1, li5);
    			append_dev(li5, a6);
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
    					listen_dev(a0, "click", /*click_handler*/ ctx[21], false, false, false),
    					listen_dev(a1, "click", /*click_handler_1*/ ctx[22], false, false, false),
    					listen_dev(a2, "click", /*click_handler_2*/ ctx[23], false, false, false),
    					listen_dev(a3, "click", /*click_handler_3*/ ctx[24], false, false, false),
    					listen_dev(a4, "click", /*click_handler_4*/ ctx[25], false, false, false),
    					listen_dev(a5, "click", /*click_handler_5*/ ctx[26], false, false, false),
    					listen_dev(a6, "click", /*click_handler_6*/ ctx[27], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*tab*/ 2) {
    				toggle_class(a4, "active", /*tab*/ ctx[1] == "overview");
    			}

    			if (dirty[0] & /*tab*/ 2) {
    				toggle_class(a5, "active", /*tab*/ ctx[1] == "summary");
    			}

    			if (dirty[0] & /*tab*/ 2) {
    				toggle_class(a6, "active", /*tab*/ ctx[1] == "admin");
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

    			if (dirty[0] & /*table_settings_form*/ 4 | dirty[1] & /*$$scope*/ 524288) {
    				pullout0_changes.$$scope = { dirty, ctx };
    			}

    			pullout0.$set(pullout0_changes);
    			const pullout1_changes = {};
    			if (dirty[0] & /*pin_drawer*/ 32) pullout1_changes.show_drawer = /*pin_drawer*/ ctx[5];
    			if (dirty[0] & /*pin_title*/ 16) pullout1_changes.title = /*pin_title*/ ctx[4];

    			if (dirty[1] & /*$$scope*/ 524288) {
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
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$3.warn(`<Frame_incidents> was created with unknown prop '${key}'`);
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
    		$$invalidate(1, tab = "overview");
    	};

    	const click_handler_5 = () => {
    		$$invalidate(1, tab = "summary");
    	};

    	const click_handler_6 = () => {
    		$$invalidate(1, tab = "admin");
    	};

    	const click_handler_7 = () => {
    		pin_module("Open Events");
    	};

    	const click_handler_8 = () => {
    		pin_module("Awaiting investigation");
    	};

    	const click_handler_9 = () => {
    		pin_module("Awaiting Signoff");
    	};

    	const click_handler_10 = () => {
    		pin_module("High Potential Severity");
    	};

    	const click_handler_11 = () => {
    		pin_module("Events by Type");
    	};

    	const click_handler_12 = () => {
    		pin_module("Latest Events");
    	};

    	const click_handler_13 = () => {
    		$$invalidate(0, table_drawer = true);
    	};

    	const click_handler_14 = th => {
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
    		if ("table_data" in $$props) $$invalidate(40, table_data = $$props.table_data);
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
    		click_handler_10,
    		click_handler_11,
    		click_handler_12,
    		click_handler_13,
    		click_handler_14
    	];
    }

    class Frame_incidents extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { tabnav: 17 }, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Frame_incidents",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get tabnav() {
    		throw new Error("<Frame_incidents>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tabnav(value) {
    		throw new Error("<Frame_incidents>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
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

    /* src/Frame_incidents_new.svelte generated by Svelte v3.35.0 */

    const { console: console_1$2 } = globals;
    const file$5 = "src/Frame_incidents_new.svelte";

    function get_each_context_5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[102] = list[i];
    	child_ctx[96] = i;
    	return child_ctx;
    }

    function get_each_context_6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[106] = list[i];
    	child_ctx[92] = i;
    	return child_ctx;
    }

    function get_each_context_7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[108] = list[i];
    	child_ctx[96] = i;
    	return child_ctx;
    }

    function get_each_context_8(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[106] = list[i];
    	child_ctx[92] = i;
    	return child_ctx;
    }

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[90] = list[i];
    	child_ctx[92] = i;
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[93] = list[i].text;
    	child_ctx[94] = list[i].color;
    	child_ctx[96] = i;
    	return child_ctx;
    }

    function get_each_context_2$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[97] = list[i];
    	child_ctx[96] = i;
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[99] = list[i].label;
    	child_ctx[100] = list[i].selected;
    	child_ctx[92] = i;
    	return child_ctx;
    }

    function get_each_context_4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[102] = list[i];
    	return child_ctx;
    }

    // (631:12) {:else}
    function create_else_block_2(ctx) {
    	let a;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			attr_dev(a, "title", "View as a single page");
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "i-page-single i-24 svelte-16q6s0n");
    			add_location(a, file$5, 631, 16, 23270);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", prevent_default(/*click_handler_4*/ ctx[37]), false, true, false);
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
    		source: "(631:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (629:12) {#if single_page}
    function create_if_block_27(ctx) {
    	let a;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			attr_dev(a, "title", "View as tabs");
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "i-page-tabs i-24 svelte-16q6s0n");
    			add_location(a, file$5, 629, 16, 23112);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", prevent_default(/*click_handler_3*/ ctx[36]), false, true, false);
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
    		id: create_if_block_27.name,
    		type: "if",
    		source: "(629:12) {#if single_page}",
    		ctx
    	});

    	return block;
    }

    // (652:20) {:else}
    function create_else_block_1(ctx) {
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
    			add_location(a, file$5, 652, 24, 24456);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", prevent_default(/*click_handler_7*/ ctx[40]), false, true, false);
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
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(652:20) {:else}",
    		ctx
    	});

    	return block;
    }

    // (650:20) {#if inspector_details}
    function create_if_block_26(ctx) {
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
    			add_location(a, file$5, 650, 24, 24250);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", prevent_default(/*click_handler_6*/ ctx[39]), false, true, false);
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
    		id: create_if_block_26.name,
    		type: "if",
    		source: "(650:20) {#if inspector_details}",
    		ctx
    	});

    	return block;
    }

    // (691:12) {:else}
    function create_else_block$1(ctx) {
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
    	let if_block = /*incident*/ ctx[4].id && create_if_block_25(ctx);

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
    			add_location(h40, file$5, 691, 16, 26983);
    			attr_dev(a0, "href", "#ehs/incidents/incidents_new/report");
    			attr_dev(a0, "class", "svelte-16q6s0n");
    			add_location(a0, file$5, 696, 57, 27351);
    			attr_dev(li0, "class", "svelte-16q6s0n");
    			toggle_class(li0, "active", /*tab*/ ctx[11] == "report");
    			add_location(li0, file$5, 696, 20, 27314);
    			attr_dev(a1, "href", "#ehs/incidents/incidents_new/events");
    			attr_dev(a1, "class", "svelte-16q6s0n");
    			add_location(a1, file$5, 697, 57, 27532);
    			attr_dev(li1, "class", "svelte-16q6s0n");
    			toggle_class(li1, "active", /*tab*/ ctx[11] == "events");
    			add_location(li1, file$5, 697, 20, 27495);
    			attr_dev(ul0, "class", "side_menu svelte-16q6s0n");
    			add_location(ul0, file$5, 692, 16, 27013);
    			add_location(h41, file$5, 699, 16, 27694);
    			attr_dev(a2, "href", "#ehs/incidents/incidents_new/witnesses");
    			attr_dev(a2, "class", "svelte-16q6s0n");
    			add_location(a2, file$5, 701, 60, 27808);
    			attr_dev(li2, "class", "svelte-16q6s0n");
    			toggle_class(li2, "active", /*tab*/ ctx[11] == "witnesses");
    			add_location(li2, file$5, 701, 20, 27768);
    			attr_dev(a3, "href", "#ehs/incidents/incidents_new/vehicles");
    			attr_dev(a3, "class", "svelte-16q6s0n");
    			add_location(a3, file$5, 702, 59, 27996);
    			attr_dev(li3, "class", "svelte-16q6s0n");
    			toggle_class(li3, "active", /*tab*/ ctx[11] == "vehicles");
    			add_location(li3, file$5, 702, 20, 27957);
    			attr_dev(a4, "href", "#ehs/incidents/incidents_new/attachments");
    			attr_dev(a4, "class", "svelte-16q6s0n");
    			add_location(a4, file$5, 703, 62, 28188);
    			attr_dev(li4, "class", "svelte-16q6s0n");
    			toggle_class(li4, "active", /*tab*/ ctx[11] == "attachments");
    			add_location(li4, file$5, 703, 20, 28146);
    			attr_dev(a5, "href", "#ehs/incidents/incidents_new/links");
    			attr_dev(a5, "class", "svelte-16q6s0n");
    			add_location(a5, file$5, 704, 56, 28383);
    			attr_dev(li5, "class", "svelte-16q6s0n");
    			toggle_class(li5, "active", /*tab*/ ctx[11] == "links");
    			add_location(li5, file$5, 704, 20, 28347);
    			attr_dev(a6, "href", "#ehs/incidents/incidents_new/claim");
    			attr_dev(a6, "class", "svelte-16q6s0n");
    			add_location(a6, file$5, 705, 56, 28570);
    			attr_dev(li6, "class", "svelte-16q6s0n");
    			toggle_class(li6, "active", /*tab*/ ctx[11] == "claim");
    			add_location(li6, file$5, 705, 20, 28534);
    			attr_dev(ul1, "class", "side_menu svelte-16q6s0n");
    			add_location(ul1, file$5, 700, 16, 27725);
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
    					listen_dev(a0, "click", /*click_handler_17*/ ctx[50], false, false, false),
    					listen_dev(a1, "click", /*click_handler_18*/ ctx[51], false, false, false),
    					listen_dev(a2, "click", /*click_handler_19*/ ctx[52], false, false, false),
    					listen_dev(a3, "click", /*click_handler_20*/ ctx[53], false, false, false),
    					listen_dev(a4, "click", /*click_handler_21*/ ctx[54], false, false, false),
    					listen_dev(a5, "click", /*click_handler_22*/ ctx[55], false, false, false),
    					listen_dev(a6, "click", /*click_handler_23*/ ctx[56], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*incident*/ ctx[4].id) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_25(ctx);
    					if_block.c();
    					if_block.m(ul0, t2);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty[0] & /*tab*/ 2048) {
    				toggle_class(li0, "active", /*tab*/ ctx[11] == "report");
    			}

    			if (dirty[0] & /*tab*/ 2048) {
    				toggle_class(li1, "active", /*tab*/ ctx[11] == "events");
    			}

    			if (dirty[0] & /*tab*/ 2048) {
    				toggle_class(li2, "active", /*tab*/ ctx[11] == "witnesses");
    			}

    			if (dirty[0] & /*tab*/ 2048) {
    				toggle_class(li3, "active", /*tab*/ ctx[11] == "vehicles");
    			}

    			if (dirty[0] & /*tab*/ 2048) {
    				toggle_class(li4, "active", /*tab*/ ctx[11] == "attachments");
    			}

    			if (dirty[0] & /*tab*/ 2048) {
    				toggle_class(li5, "active", /*tab*/ ctx[11] == "links");
    			}

    			if (dirty[0] & /*tab*/ 2048) {
    				toggle_class(li6, "active", /*tab*/ ctx[11] == "claim");
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
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(691:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (675:12) {#if single_page}
    function create_if_block_23(ctx) {
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
    	let if_block = /*incident*/ ctx[4].id && create_if_block_24(ctx);

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
    			add_location(h4, file$5, 675, 16, 25545);
    			attr_dev(a0, "href", "#ehs/incidents/incidents_new/report");
    			attr_dev(a0, "class", "svelte-16q6s0n");
    			add_location(a0, file$5, 680, 24, 25848);
    			attr_dev(li0, "class", "svelte-16q6s0n");
    			add_location(li0, file$5, 680, 20, 25844);
    			attr_dev(a1, "href", "#ehs/incidents/incidents_new/events");
    			attr_dev(a1, "class", "svelte-16q6s0n");
    			add_location(a1, file$5, 681, 24, 25983);
    			attr_dev(li1, "class", "svelte-16q6s0n");
    			add_location(li1, file$5, 681, 20, 25979);
    			attr_dev(a2, "href", "#ehs/incidents/incidents_new/witnesses");
    			attr_dev(a2, "class", "svelte-16q6s0n");
    			add_location(a2, file$5, 682, 24, 26118);
    			attr_dev(li2, "class", "svelte-16q6s0n");
    			add_location(li2, file$5, 682, 20, 26114);
    			attr_dev(a3, "href", "#ehs/incidents/incidents_new/vehicles");
    			attr_dev(a3, "class", "svelte-16q6s0n");
    			add_location(a3, file$5, 683, 24, 26262);
    			attr_dev(li3, "class", "svelte-16q6s0n");
    			add_location(li3, file$5, 683, 20, 26258);
    			attr_dev(a4, "href", "#ehs/incidents/incidents_new/attachments");
    			attr_dev(a4, "class", "svelte-16q6s0n");
    			add_location(a4, file$5, 684, 24, 26403);
    			attr_dev(li4, "class", "svelte-16q6s0n");
    			add_location(li4, file$5, 684, 20, 26399);
    			attr_dev(a5, "href", "#ehs/incidents/incidents_new/links");
    			attr_dev(a5, "class", "svelte-16q6s0n");
    			add_location(a5, file$5, 685, 24, 26553);
    			attr_dev(li5, "class", "svelte-16q6s0n");
    			add_location(li5, file$5, 685, 20, 26549);
    			attr_dev(a6, "href", "#ehs/incidents/incidents_new/claim");
    			attr_dev(a6, "class", "svelte-16q6s0n");
    			add_location(a6, file$5, 686, 24, 26695);
    			attr_dev(li6, "class", "svelte-16q6s0n");
    			add_location(li6, file$5, 686, 20, 26691);
    			attr_dev(li7, "class", "svelte-16q6s0n");
    			add_location(li7, file$5, 687, 20, 26823);
    			attr_dev(li8, "class", "fake-bar active svelte-16q6s0n");
    			set_style(li8, "height", /*closest_el*/ ctx[3].y + "px");
    			add_location(li8, file$5, 688, 20, 26859);
    			attr_dev(ul, "class", "side_menu single_page svelte-16q6s0n");
    			add_location(ul, file$5, 676, 16, 25579);
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
    					listen_dev(a0, "click", /*click_handler_9*/ ctx[42], false, false, false),
    					listen_dev(a1, "click", /*click_handler_10*/ ctx[43], false, false, false),
    					listen_dev(a2, "click", /*click_handler_11*/ ctx[44], false, false, false),
    					listen_dev(a3, "click", /*click_handler_12*/ ctx[45], false, false, false),
    					listen_dev(a4, "click", /*click_handler_13*/ ctx[46], false, false, false),
    					listen_dev(a5, "click", /*click_handler_14*/ ctx[47], false, false, false),
    					listen_dev(a6, "click", /*click_handler_15*/ ctx[48], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*incident*/ ctx[4].id) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_24(ctx);
    					if_block.c();
    					if_block.m(ul, t2);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty[0] & /*closest_el*/ 8) {
    				set_style(li8, "height", /*closest_el*/ ctx[3].y + "px");
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
    		id: create_if_block_23.name,
    		type: "if",
    		source: "(675:12) {#if single_page}",
    		ctx
    	});

    	return block;
    }

    // (694:20) {#if incident.id }
    function create_if_block_25(ctx) {
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
    			attr_dev(a, "class", "svelte-16q6s0n");
    			add_location(a, file$5, 694, 63, 27138);
    			attr_dev(li, "class", "svelte-16q6s0n");
    			toggle_class(li, "active", /*tab*/ ctx[11] == "overview");
    			add_location(li, file$5, 694, 24, 27099);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*click_handler_16*/ ctx[49], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*tab*/ 2048) {
    				toggle_class(li, "active", /*tab*/ ctx[11] == "overview");
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
    		id: create_if_block_25.name,
    		type: "if",
    		source: "(694:20) {#if incident.id }",
    		ctx
    	});

    	return block;
    }

    // (678:20) {#if incident.id }
    function create_if_block_24(ctx) {
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
    			attr_dev(a, "class", "svelte-16q6s0n");
    			add_location(a, file$5, 678, 28, 25681);
    			attr_dev(li, "class", "svelte-16q6s0n");
    			add_location(li, file$5, 678, 24, 25677);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*click_handler_8*/ ctx[41], false, false, false);
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
    		id: create_if_block_24.name,
    		type: "if",
    		source: "(678:20) {#if incident.id }",
    		ctx
    	});

    	return block;
    }

    // (713:8) {#if tab == 'overview' || (single_page && incident.id)}
    function create_if_block_22(ctx) {
    	let h1;
    	let t1;
    	let div34;
    	let div2;
    	let div0;
    	let t3;
    	let div1;
    	let p0;
    	let t4_value = (/*incident*/ ctx[4].id ? /*incident*/ ctx[4].id : "New") + "";
    	let t4;
    	let t5;
    	let div5;
    	let div3;
    	let t7;
    	let div4;
    	let p1;
    	let t8_value = /*incident*/ ctx[4].status + "";
    	let t8;
    	let t9;
    	let div7;
    	let div6;
    	let p2;
    	let t11;
    	let div10;
    	let div8;
    	let t13;
    	let div9;
    	let p3;
    	let t15;
    	let div13;
    	let div11;
    	let t17;
    	let div12;
    	let p4;
    	let i0;
    	let t18;
    	let t19;
    	let div16;
    	let div14;
    	let t21;
    	let div15;
    	let p5;
    	let t23;
    	let div20;
    	let div17;
    	let t25;
    	let div19;
    	let div18;
    	let i1;
    	let t26;
    	let t27;
    	let div23;
    	let div21;
    	let t29;
    	let div22;
    	let p6;
    	let t31;
    	let div27;
    	let div24;
    	let t33;
    	let div26;
    	let div25;
    	let t35;
    	let div30;
    	let div28;
    	let t37;
    	let div29;
    	let p7;
    	let t39;
    	let div33;
    	let div31;
    	let t41;
    	let div32;
    	let p8;

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
    			p2 = element("p");
    			p2.textContent = "stuff";
    			t11 = space();
    			div10 = element("div");
    			div8 = element("div");
    			div8.textContent = "Elapsed time";
    			t13 = space();
    			div9 = element("div");
    			p3 = element("p");
    			p3.textContent = "1 day, 3 hours";
    			t15 = space();
    			div13 = element("div");
    			div11 = element("div");
    			div11.textContent = "Channel";
    			t17 = space();
    			div12 = element("div");
    			p4 = element("p");
    			i0 = element("i");
    			t18 = text(" Desktop");
    			t19 = space();
    			div16 = element("div");
    			div14 = element("div");
    			div14.textContent = "Reported by";
    			t21 = space();
    			div15 = element("div");
    			p5 = element("p");
    			p5.textContent = "John Smith";
    			t23 = space();
    			div20 = element("div");
    			div17 = element("div");
    			div17.textContent = "Actions";
    			t25 = space();
    			div19 = element("div");
    			div18 = element("div");
    			i1 = element("i");
    			t26 = text("x0");
    			t27 = space();
    			div23 = element("div");
    			div21 = element("div");
    			div21.textContent = "Medical attention given";
    			t29 = space();
    			div22 = element("div");
    			p6 = element("p");
    			p6.textContent = "stuff";
    			t31 = space();
    			div27 = element("div");
    			div24 = element("div");
    			div24.textContent = "All fields";
    			t33 = space();
    			div26 = element("div");
    			div25 = element("div");
    			div25.textContent = "10/21";
    			t35 = space();
    			div30 = element("div");
    			div28 = element("div");
    			div28.textContent = "Description";
    			t37 = space();
    			div29 = element("div");
    			p7 = element("p");
    			p7.textContent = "I saw a big tree branch had fallen down near the entrance";
    			t39 = space();
    			div33 = element("div");
    			div31 = element("div");
    			div31.textContent = "Attachments";
    			t41 = space();
    			div32 = element("div");
    			p8 = element("p");
    			p8.textContent = "slideshow";
    			attr_dev(h1, "class", "page-title");
    			add_location(h1, file$5, 713, 12, 28867);
    			attr_dev(div0, "class", "card-header");
    			add_location(div0, file$5, 717, 20, 29050);
    			attr_dev(p0, "class", "svelte-16q6s0n");
    			add_location(p0, file$5, 719, 24, 29159);
    			attr_dev(div1, "class", "card-body");
    			add_location(div1, file$5, 718, 20, 29111);
    			attr_dev(div2, "class", "card overview_1 svelte-16q6s0n");
    			add_location(div2, file$5, 716, 16, 29000);
    			attr_dev(div3, "class", "card-header");
    			add_location(div3, file$5, 723, 20, 29318);
    			attr_dev(p1, "class", "svelte-16q6s0n");
    			add_location(p1, file$5, 725, 24, 29424);
    			attr_dev(div4, "class", "card-body");
    			add_location(div4, file$5, 724, 20, 29376);
    			attr_dev(div5, "class", "card overview_2 svelte-16q6s0n");
    			add_location(div5, file$5, 722, 16, 29268);
    			attr_dev(p2, "class", "svelte-16q6s0n");
    			add_location(p2, file$5, 730, 24, 29613);
    			attr_dev(div6, "class", "card-body");
    			add_location(div6, file$5, 729, 20, 29565);
    			attr_dev(div7, "class", "card overview_3 svelte-16q6s0n");
    			add_location(div7, file$5, 728, 16, 29515);
    			attr_dev(div8, "class", "card-header");
    			add_location(div8, file$5, 734, 20, 29742);
    			attr_dev(p3, "class", "svelte-16q6s0n");
    			add_location(p3, file$5, 736, 24, 29854);
    			attr_dev(div9, "class", "card-body");
    			add_location(div9, file$5, 735, 20, 29806);
    			attr_dev(div10, "class", "card overview_4 svelte-16q6s0n");
    			add_location(div10, file$5, 733, 16, 29692);
    			attr_dev(div11, "class", "card-header");
    			add_location(div11, file$5, 740, 20, 29992);
    			attr_dev(i0, "class", "i-desktop i-20");
    			add_location(i0, file$5, 742, 27, 30102);
    			attr_dev(p4, "class", "svelte-16q6s0n");
    			add_location(p4, file$5, 742, 24, 30099);
    			attr_dev(div12, "class", "card-body");
    			add_location(div12, file$5, 741, 20, 30051);
    			attr_dev(div13, "class", "card overview_5 svelte-16q6s0n");
    			add_location(div13, file$5, 739, 16, 29942);
    			attr_dev(div14, "class", "card-header");
    			add_location(div14, file$5, 746, 20, 30261);
    			attr_dev(p5, "class", "pii svelte-16q6s0n");
    			add_location(p5, file$5, 748, 24, 30372);
    			attr_dev(div15, "class", "card-body");
    			add_location(div15, file$5, 747, 20, 30324);
    			attr_dev(div16, "class", "card overview_6 svelte-16q6s0n");
    			add_location(div16, file$5, 745, 16, 30211);
    			attr_dev(div17, "class", "card-header");
    			add_location(div17, file$5, 752, 20, 30518);
    			attr_dev(i1, "class", "i-actions i-32");
    			add_location(i1, file$5, 754, 82, 30683);
    			attr_dev(div18, "class", "mid-num");
    			set_style(div18, "color", "var(--eo-critical-500)");
    			add_location(div18, file$5, 754, 24, 30625);
    			attr_dev(div19, "class", "card-body");
    			add_location(div19, file$5, 753, 20, 30577);
    			attr_dev(div20, "class", "card overview_7 svelte-16q6s0n");
    			add_location(div20, file$5, 751, 16, 30468);
    			attr_dev(div21, "class", "card-header");
    			add_location(div21, file$5, 758, 20, 30838);
    			attr_dev(p6, "class", "svelte-16q6s0n");
    			add_location(p6, file$5, 760, 24, 30961);
    			attr_dev(div22, "class", "card-body");
    			add_location(div22, file$5, 759, 20, 30913);
    			attr_dev(div23, "class", "card overview_8 svelte-16q6s0n");
    			add_location(div23, file$5, 757, 16, 30788);
    			attr_dev(div24, "class", "card-header");
    			add_location(div24, file$5, 764, 20, 31090);
    			attr_dev(div25, "class", "mid-num");
    			add_location(div25, file$5, 766, 24, 31200);
    			attr_dev(div26, "class", "card-body");
    			add_location(div26, file$5, 765, 20, 31152);
    			attr_dev(div27, "class", "card overview_9 svelte-16q6s0n");
    			add_location(div27, file$5, 763, 16, 31040);
    			attr_dev(div28, "class", "card-header");
    			add_location(div28, file$5, 770, 20, 31350);
    			attr_dev(p7, "class", "svelte-16q6s0n");
    			add_location(p7, file$5, 772, 24, 31461);
    			attr_dev(div29, "class", "card-body");
    			add_location(div29, file$5, 771, 20, 31413);
    			attr_dev(div30, "class", "card overview_10 svelte-16q6s0n");
    			add_location(div30, file$5, 769, 16, 31299);
    			attr_dev(div31, "class", "card-header");
    			add_location(div31, file$5, 776, 20, 31643);
    			attr_dev(p8, "class", "svelte-16q6s0n");
    			add_location(p8, file$5, 778, 24, 31754);
    			attr_dev(div32, "class", "card-body");
    			add_location(div32, file$5, 777, 20, 31706);
    			attr_dev(div33, "class", "card overview_11 svelte-16q6s0n");
    			add_location(div33, file$5, 775, 16, 31592);
    			attr_dev(div34, "class", "overview_grid svelte-16q6s0n");
    			add_location(div34, file$5, 714, 12, 28939);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			/*h1_binding*/ ctx[57](h1);
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
    			append_dev(div6, p2);
    			append_dev(div34, t11);
    			append_dev(div34, div10);
    			append_dev(div10, div8);
    			append_dev(div10, t13);
    			append_dev(div10, div9);
    			append_dev(div9, p3);
    			append_dev(div34, t15);
    			append_dev(div34, div13);
    			append_dev(div13, div11);
    			append_dev(div13, t17);
    			append_dev(div13, div12);
    			append_dev(div12, p4);
    			append_dev(p4, i0);
    			append_dev(p4, t18);
    			append_dev(div34, t19);
    			append_dev(div34, div16);
    			append_dev(div16, div14);
    			append_dev(div16, t21);
    			append_dev(div16, div15);
    			append_dev(div15, p5);
    			append_dev(div34, t23);
    			append_dev(div34, div20);
    			append_dev(div20, div17);
    			append_dev(div20, t25);
    			append_dev(div20, div19);
    			append_dev(div19, div18);
    			append_dev(div18, i1);
    			append_dev(div18, t26);
    			append_dev(div34, t27);
    			append_dev(div34, div23);
    			append_dev(div23, div21);
    			append_dev(div23, t29);
    			append_dev(div23, div22);
    			append_dev(div22, p6);
    			append_dev(div34, t31);
    			append_dev(div34, div27);
    			append_dev(div27, div24);
    			append_dev(div27, t33);
    			append_dev(div27, div26);
    			append_dev(div26, div25);
    			append_dev(div34, t35);
    			append_dev(div34, div30);
    			append_dev(div30, div28);
    			append_dev(div30, t37);
    			append_dev(div30, div29);
    			append_dev(div29, p7);
    			append_dev(div34, t39);
    			append_dev(div34, div33);
    			append_dev(div33, div31);
    			append_dev(div33, t41);
    			append_dev(div33, div32);
    			append_dev(div32, p8);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*incident*/ 16 && t4_value !== (t4_value = (/*incident*/ ctx[4].id ? /*incident*/ ctx[4].id : "New") + "")) set_data_dev(t4, t4_value);
    			if (dirty[0] & /*incident*/ 16 && t8_value !== (t8_value = /*incident*/ ctx[4].status + "")) set_data_dev(t8, t8_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			/*h1_binding*/ ctx[57](null);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div34);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_22.name,
    		type: "if",
    		source: "(713:8) {#if tab == 'overview' || (single_page && incident.id)}",
    		ctx
    	});

    	return block;
    }

    // (784:8) {#if tab == 'report' || single_page}
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
    			add_location(h1, file$5, 784, 12, 31911);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			/*h1_binding_1*/ ctx[58](h1);
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
    			/*h1_binding_1*/ ctx[58](null);
    			if (detaching) detach_dev(t1);
    			destroy_component(form, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_21.name,
    		type: "if",
    		source: "(784:8) {#if tab == 'report' || single_page}",
    		ctx
    	});

    	return block;
    }

    // (788:8) {#if tab =='events' || single_page}
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
    			add_location(h1, file$5, 789, 16, 32092);
    			add_location(div0, file$5, 788, 12, 32070);
    			if (img.src !== (img_src_value = "./images/illustrations/events.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "events illustration");
    			attr_dev(img, "class", "svelte-16q6s0n");
    			add_location(img, file$5, 793, 20, 32272);
    			attr_dev(h5, "class", "svelte-16q6s0n");
    			add_location(h5, file$5, 794, 20, 32364);
    			add_location(b, file$5, 795, 27, 32414);
    			add_location(br, file$5, 796, 62, 32531);
    			attr_dev(p, "class", "svelte-16q6s0n");
    			add_location(p, file$5, 795, 20, 32407);
    			attr_dev(div1, "class", "card-body blank_state svelte-16q6s0n");
    			add_location(div1, file$5, 792, 16, 32216);
    			attr_dev(div2, "class", "card svelte-16q6s0n");
    			add_location(div2, file$5, 791, 12, 32181);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "btn btn-secondary");
    			add_location(a, file$5, 804, 16, 32916);
    			attr_dev(div3, "class", "text-right");
    			add_location(div3, file$5, 800, 12, 32650);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, h1);
    			/*h1_binding_2*/ ctx[59](h1);
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
    				dispose = listen_dev(a, "click", prevent_default(/*show_event_drawer*/ ctx[18]), false, true, false);
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
    			/*h1_binding_2*/ ctx[59](null);
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
    		source: "(788:8) {#if tab =='events' || single_page}",
    		ctx
    	});

    	return block;
    }

    // (802:16) {#if !single_page}
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
    			add_location(a, file$5, 802, 16, 32726);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*click_handler_24*/ ctx[60], false, false, false);
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
    		source: "(802:16) {#if !single_page}",
    		ctx
    	});

    	return block;
    }

    // (806:16) {#if !single_page}
    function create_if_block_19(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Next";
    			attr_dev(span, "class", "btn disabled");
    			add_location(span, file$5, 806, 16, 33073);
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
    		source: "(806:16) {#if !single_page}",
    		ctx
    	});

    	return block;
    }

    // (812:8) {#if tab =='witnesses' || single_page}
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
    			add_location(h1, file$5, 813, 16, 33249);
    			add_location(div0, file$5, 812, 12, 33227);
    			if (img.src !== (img_src_value = "./images/illustrations/witnesses.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "witnesses illustration");
    			attr_dev(img, "class", "svelte-16q6s0n");
    			add_location(img, file$5, 817, 20, 33432);
    			attr_dev(h5, "class", "svelte-16q6s0n");
    			add_location(h5, file$5, 818, 20, 33530);
    			attr_dev(p, "class", "svelte-16q6s0n");
    			add_location(p, file$5, 819, 20, 33579);
    			attr_dev(div1, "class", "card-body blank_state svelte-16q6s0n");
    			add_location(div1, file$5, 816, 16, 33376);
    			attr_dev(div2, "class", "card svelte-16q6s0n");
    			add_location(div2, file$5, 815, 12, 33341);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "btn btn-secondary");
    			add_location(a, file$5, 826, 16, 34017);
    			attr_dev(div3, "class", "text-right");
    			add_location(div3, file$5, 822, 12, 33751);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, h1);
    			/*h1_binding_3*/ ctx[61](h1);
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
    				dispose = listen_dev(a, "click", prevent_default(/*show_event_drawer*/ ctx[18]), false, true, false);
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
    			/*h1_binding_3*/ ctx[61](null);
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
    		source: "(812:8) {#if tab =='witnesses' || single_page}",
    		ctx
    	});

    	return block;
    }

    // (824:16) {#if !single_page}
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
    			add_location(a, file$5, 824, 16, 33827);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*click_handler_25*/ ctx[62], false, false, false);
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
    		source: "(824:16) {#if !single_page}",
    		ctx
    	});

    	return block;
    }

    // (828:16) {#if !single_page}
    function create_if_block_16(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Next";
    			attr_dev(span, "class", "btn disabled");
    			add_location(span, file$5, 828, 16, 34168);
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
    		source: "(828:16) {#if !single_page}",
    		ctx
    	});

    	return block;
    }

    // (834:8) {#if tab =='vehicles' || single_page}
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
    			add_location(h1, file$5, 835, 16, 34343);
    			add_location(div0, file$5, 834, 12, 34321);
    			if (img.src !== (img_src_value = "./images/illustrations/vehicles.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "vehicles illustration");
    			attr_dev(img, "class", "svelte-16q6s0n");
    			add_location(img, file$5, 839, 20, 34525);
    			attr_dev(h5, "class", "svelte-16q6s0n");
    			add_location(h5, file$5, 840, 20, 34621);
    			attr_dev(p, "class", "svelte-16q6s0n");
    			add_location(p, file$5, 841, 20, 34694);
    			attr_dev(div1, "class", "card-body blank_state svelte-16q6s0n");
    			add_location(div1, file$5, 838, 16, 34469);
    			attr_dev(div2, "class", "card svelte-16q6s0n");
    			add_location(div2, file$5, 837, 12, 34434);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "btn btn-secondary");
    			add_location(a, file$5, 848, 16, 35103);
    			attr_dev(div3, "class", "text-right");
    			add_location(div3, file$5, 844, 12, 34837);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, h1);
    			/*h1_binding_4*/ ctx[63](h1);
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
    				dispose = listen_dev(a, "click", prevent_default(/*show_event_drawer*/ ctx[18]), false, true, false);
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
    			/*h1_binding_4*/ ctx[63](null);
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
    		source: "(834:8) {#if tab =='vehicles' || single_page}",
    		ctx
    	});

    	return block;
    }

    // (846:16) {#if !single_page}
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
    			add_location(a, file$5, 846, 16, 34913);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*click_handler_26*/ ctx[64], false, false, false);
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
    		source: "(846:16) {#if !single_page}",
    		ctx
    	});

    	return block;
    }

    // (850:16) {#if !single_page}
    function create_if_block_13(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Next";
    			attr_dev(span, "class", "btn disabled");
    			add_location(span, file$5, 850, 16, 35254);
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
    		source: "(850:16) {#if !single_page}",
    		ctx
    	});

    	return block;
    }

    // (857:8) {#if tab =='attachments' || single_page}
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
    			add_location(h1, file$5, 858, 16, 35433);
    			add_location(div0, file$5, 857, 12, 35411);
    			if (img.src !== (img_src_value = "./images/illustrations/attachments.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "attachments illustration");
    			attr_dev(img, "class", "svelte-16q6s0n");
    			add_location(img, file$5, 862, 20, 35618);
    			attr_dev(h5, "class", "svelte-16q6s0n");
    			add_location(h5, file$5, 863, 20, 35720);
    			attr_dev(p, "class", "svelte-16q6s0n");
    			add_location(p, file$5, 864, 20, 35767);
    			attr_dev(div1, "class", "card-body blank_state svelte-16q6s0n");
    			add_location(div1, file$5, 861, 16, 35562);
    			attr_dev(div2, "class", "card svelte-16q6s0n");
    			add_location(div2, file$5, 860, 12, 35527);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "btn btn-secondary");
    			add_location(a, file$5, 872, 16, 36154);
    			attr_dev(div3, "class", "text-right");
    			add_location(div3, file$5, 867, 12, 35887);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, h1);
    			/*h1_binding_5*/ ctx[65](h1);
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
    				dispose = listen_dev(a, "click", prevent_default(/*show_event_drawer*/ ctx[18]), false, true, false);
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
    			/*h1_binding_5*/ ctx[65](null);
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
    		source: "(857:8) {#if tab =='attachments' || single_page}",
    		ctx
    	});

    	return block;
    }

    // (869:16) {#if !single_page}
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
    			add_location(a, file$5, 869, 16, 35963);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*click_handler_27*/ ctx[66], false, false, false);
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
    		source: "(869:16) {#if !single_page}",
    		ctx
    	});

    	return block;
    }

    // (875:16) {#if !single_page}
    function create_if_block_10(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Next";
    			attr_dev(span, "class", "btn disabled");
    			add_location(span, file$5, 875, 16, 36323);
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
    		source: "(875:16) {#if !single_page}",
    		ctx
    	});

    	return block;
    }

    // (883:8) {#if tab =='links' || single_page}
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
    			add_location(h1, file$5, 884, 16, 36497);
    			add_location(div0, file$5, 883, 12, 36475);
    			if (img.src !== (img_src_value = "./images/illustrations/links.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "links illustration");
    			attr_dev(img, "class", "svelte-16q6s0n");
    			add_location(img, file$5, 888, 20, 36686);
    			attr_dev(h5, "class", "svelte-16q6s0n");
    			add_location(h5, file$5, 889, 20, 36776);
    			attr_dev(p, "class", "svelte-16q6s0n");
    			add_location(p, file$5, 890, 20, 36845);
    			attr_dev(div1, "class", "card-body blank_state svelte-16q6s0n");
    			add_location(div1, file$5, 887, 16, 36630);
    			attr_dev(div2, "class", "card svelte-16q6s0n");
    			add_location(div2, file$5, 886, 12, 36595);
    			attr_dev(a0, "href", "/");
    			attr_dev(a0, "class", "btn btn-secondary");
    			add_location(a0, file$5, 898, 16, 37291);
    			attr_dev(a1, "href", "/");
    			attr_dev(a1, "class", "btn btn-secondary");
    			add_location(a1, file$5, 899, 16, 37409);
    			attr_dev(div3, "class", "text-right");
    			add_location(div3, file$5, 893, 12, 37024);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, h1);
    			/*h1_binding_6*/ ctx[67](h1);
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
    					listen_dev(a0, "click", prevent_default(/*show_event_drawer*/ ctx[18]), false, true, false),
    					listen_dev(a1, "click", prevent_default(/*show_event_drawer*/ ctx[18]), false, true, false)
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
    			/*h1_binding_6*/ ctx[67](null);
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
    		source: "(883:8) {#if tab =='links' || single_page}",
    		ctx
    	});

    	return block;
    }

    // (895:16) {#if !single_page}
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
    			add_location(a, file$5, 895, 16, 37100);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*click_handler_28*/ ctx[68], false, false, false);
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
    		source: "(895:16) {#if !single_page}",
    		ctx
    	});

    	return block;
    }

    // (902:16) {#if !single_page}
    function create_if_block_7(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Next";
    			attr_dev(span, "class", "btn disabled");
    			add_location(span, file$5, 902, 16, 37576);
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
    		source: "(902:16) {#if !single_page}",
    		ctx
    	});

    	return block;
    }

    // (912:8) {#if tab =='claim' || single_page}
    function create_if_block_3(ctx) {
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
    	let if_block1 = !/*single_page*/ ctx[0] && create_if_block_4(ctx);

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
    			t6 = text(/*counter_phrase*/ ctx[12]);
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
    			add_location(h1, file$5, 913, 16, 37752);
    			add_location(div0, file$5, 912, 12, 37730);
    			if (img.src !== (img_src_value = "./images/illustrations/claim.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "claim illustration");
    			attr_dev(img, "class", "svelte-16q6s0n");
    			add_location(img, file$5, 917, 20, 37931);
    			attr_dev(h5, "class", "svelte-16q6s0n");
    			add_location(h5, file$5, 918, 20, 38021);
    			add_location(b, file$5, 919, 38, 38113);
    			attr_dev(p, "class", "svelte-16q6s0n");
    			add_location(p, file$5, 919, 20, 38095);
    			attr_dev(div1, "class", "card-body blank_state svelte-16q6s0n");
    			add_location(div1, file$5, 916, 16, 37875);
    			attr_dev(div2, "class", "card svelte-16q6s0n");
    			add_location(div2, file$5, 915, 12, 37840);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "btn btn-secondary");
    			add_location(a, file$5, 927, 16, 38492);
    			attr_dev(div3, "class", "text-right");
    			add_location(div3, file$5, 922, 12, 38225);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, h1);
    			/*h1_binding_7*/ ctx[69](h1);
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
    				dispose = listen_dev(a, "click", prevent_default(/*show_event_drawer*/ ctx[18]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*counter_phrase*/ 4096) set_data_dev(t6, /*counter_phrase*/ ctx[12]);

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
    					if_block1 = create_if_block_4(ctx);
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
    			/*h1_binding_7*/ ctx[69](null);
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
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(912:8) {#if tab =='claim' || single_page}",
    		ctx
    	});

    	return block;
    }

    // (924:16) {#if !single_page}
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
    			add_location(a, file$5, 924, 16, 38301);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*click_handler_29*/ ctx[70], false, false, false);
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
    		source: "(924:16) {#if !single_page}",
    		ctx
    	});

    	return block;
    }

    // (930:16) {#if !single_page}
    function create_if_block_4(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Next";
    			attr_dev(span, "class", "btn disabled");
    			add_location(span, file$5, 930, 16, 38658);
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
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(930:16) {#if !single_page}",
    		ctx
    	});

    	return block;
    }

    // (939:0) {#if show_drawer}
    function create_if_block_2$1(ctx) {
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
    			attr_dev(div0, "class", "mask");
    			toggle_class(div0, "visible", /*mask_visible*/ ctx[8]);
    			toggle_class(div0, "block", /*mask_block*/ ctx[7]);
    			add_location(div0, file$5, 940, 8, 38823);
    			attr_dev(i, "class", "i-close i-24");
    			add_location(i, file$5, 943, 81, 39077);
    			attr_dev(span0, "class", "close");
    			add_location(span0, file$5, 943, 30, 39026);
    			add_location(h2, file$5, 943, 16, 39012);
    			attr_dev(div1, "class", "pullout-head");
    			add_location(div1, file$5, 942, 12, 38969);
    			add_location(label0, file$5, 948, 20, 39242);
    			option0.__value = "Accident";
    			option0.value = option0.__value;
    			add_location(option0, file$5, 950, 24, 39374);
    			option1.__value = "Occupational Illness";
    			option1.value = option1.__value;
    			add_location(option1, file$5, 951, 24, 39424);
    			option2.__value = "Environmental";
    			option2.value = option2.__value;
    			add_location(option2, file$5, 952, 24, 39486);
    			option3.__value = "Incident";
    			option3.value = option3.__value;
    			add_location(option3, file$5, 953, 24, 39541);
    			option4.__value = "Security";
    			option4.value = option4.__value;
    			add_location(option4, file$5, 954, 24, 39591);
    			option5.__value = "Process Safety";
    			option5.value = option5.__value;
    			add_location(option5, file$5, 955, 24, 39641);
    			option6.__value = "Near Miss";
    			option6.value = option6.__value;
    			add_location(option6, file$5, 956, 24, 39697);
    			attr_dev(select0, "class", "form-control");
    			if (/*event*/ ctx[10].event_type === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[71].call(select0));
    			add_location(select0, file$5, 949, 20, 39288);
    			attr_dev(div2, "class", "form-item");
    			add_location(div2, file$5, 947, 16, 39198);
    			add_location(label1, file$5, 960, 20, 39837);
    			option7.__value = "Riddor";
    			option7.value = option7.__value;
    			add_location(option7, file$5, 962, 24, 39941);
    			attr_dev(select1, "class", "form-control");
    			add_location(select1, file$5, 961, 20, 39887);
    			attr_dev(div3, "class", "form-item");
    			add_location(div3, file$5, 959, 16, 39793);
    			add_location(label2, file$5, 966, 20, 40078);
    			attr_dev(input0, "type", "radio");
    			add_location(input0, file$5, 969, 24, 40218);
    			attr_dev(div4, "class", "form-control radio inline svelte-16q6s0n");
    			add_location(div4, file$5, 968, 20, 40154);
    			attr_dev(input1, "type", "radio");
    			add_location(input1, file$5, 972, 24, 40354);
    			attr_dev(div5, "class", "form-control radio inline svelte-16q6s0n");
    			add_location(div5, file$5, 971, 20, 40290);
    			attr_dev(div6, "class", "form-item");
    			add_location(div6, file$5, 965, 16, 40034);
    			add_location(label3, file$5, 976, 20, 40488);
    			option8.__value = "Employee";
    			option8.value = option8.__value;
    			add_location(option8, file$5, 978, 24, 40601);
    			attr_dev(select2, "class", "form-control");
    			add_location(select2, file$5, 977, 20, 40547);
    			attr_dev(div7, "class", "form-item");
    			add_location(div7, file$5, 975, 16, 40444);
    			add_location(label4, file$5, 982, 20, 40740);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "class", "form-control");
    			add_location(input2, file$5, 983, 20, 40782);
    			attr_dev(div8, "class", "form-item");
    			add_location(div8, file$5, 981, 16, 40696);
    			add_location(label5, file$5, 986, 20, 40936);
    			attr_dev(input3, "type", "text");
    			attr_dev(input3, "class", "form-control");
    			add_location(input3, file$5, 987, 20, 40998);
    			attr_dev(div9, "class", "form-item");
    			add_location(div9, file$5, 985, 16, 40892);
    			add_location(label6, file$5, 990, 20, 41124);
    			attr_dev(input4, "type", "text");
    			attr_dev(input4, "class", "form-control");
    			add_location(input4, file$5, 991, 20, 41172);
    			attr_dev(div10, "class", "form-item");
    			add_location(div10, file$5, 989, 16, 41080);
    			attr_dev(input5, "type", "checkbox");
    			add_location(input5, file$5, 995, 24, 41345);
    			attr_dev(span1, "class", "slider");
    			add_location(span1, file$5, 996, 24, 41427);
    			attr_dev(label7, "class", "switch");
    			add_location(label7, file$5, 994, 20, 41298);
    			attr_dev(div11, "class", "form-item");
    			add_location(div11, file$5, 993, 16, 41254);
    			attr_dev(input6, "type", "checkbox");
    			add_location(input6, file$5, 1002, 24, 41670);
    			attr_dev(span2, "class", "slider");
    			add_location(span2, file$5, 1003, 24, 41753);
    			attr_dev(label8, "class", "switch");
    			add_location(label8, file$5, 1001, 20, 41623);
    			attr_dev(div12, "class", "form-item");
    			add_location(div12, file$5, 1000, 16, 41579);
    			attr_dev(span3, "class", "btn");
    			add_location(span3, file$5, 1008, 20, 41943);
    			attr_dev(span4, "class", "btn btn-secondary");
    			add_location(span4, file$5, 1009, 20, 41998);
    			attr_dev(div13, "class", "form-item");
    			add_location(div13, file$5, 1007, 16, 41899);
    			attr_dev(div14, "class", "pullout-body form");
    			add_location(div14, file$5, 945, 12, 39149);
    			attr_dev(div15, "class", "pullout");
    			toggle_class(div15, "in", /*pullout*/ ctx[9]);
    			add_location(div15, file$5, 941, 8, 38914);
    			attr_dev(div16, "class", "drawer");
    			add_location(div16, file$5, 939, 4, 38794);
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
    			select_option(select0, /*event*/ ctx[10].event_type);
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
    			set_input_value(input2, /*event*/ ctx[10].person);
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
    			input5.checked = /*event*/ ctx[10].medical_bool;
    			append_dev(label7, t36);
    			append_dev(label7, span1);
    			append_dev(div11, t37);
    			append_dev(div14, t38);
    			append_dev(div14, div12);
    			append_dev(div12, label8);
    			append_dev(label8, input6);
    			input6.checked = /*event*/ ctx[10].losttime_bool;
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
    					listen_dev(span0, "click", /*hide_event_drawer*/ ctx[19], false, false, false),
    					listen_dev(select0, "change", /*select0_change_handler*/ ctx[71]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[72]),
    					listen_dev(input5, "change", /*input5_change_handler*/ ctx[73]),
    					listen_dev(input6, "change", /*input6_change_handler*/ ctx[74]),
    					listen_dev(span4, "click", /*hide_event_drawer*/ ctx[19], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*mask_visible*/ 256) {
    				toggle_class(div0, "visible", /*mask_visible*/ ctx[8]);
    			}

    			if (dirty[0] & /*mask_block*/ 128) {
    				toggle_class(div0, "block", /*mask_block*/ ctx[7]);
    			}

    			if (dirty[0] & /*event*/ 1024) {
    				select_option(select0, /*event*/ ctx[10].event_type);
    			}

    			if (dirty[0] & /*event*/ 1024 && input2.value !== /*event*/ ctx[10].person) {
    				set_input_value(input2, /*event*/ ctx[10].person);
    			}

    			if (dirty[0] & /*event*/ 1024) {
    				input5.checked = /*event*/ ctx[10].medical_bool;
    			}

    			if (dirty[0] & /*event*/ 1024) {
    				input6.checked = /*event*/ ctx[10].losttime_bool;
    			}

    			if (dirty[0] & /*pullout*/ 512) {
    				toggle_class(div15, "in", /*pullout*/ ctx[9]);
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
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(939:0) {#if show_drawer}",
    		ctx
    	});

    	return block;
    }

    // (1021:8) {#if matrix}
    function create_if_block_1$1(ctx) {
    	let t0;
    	let t1;
    	let div1;
    	let div0;

    	let t2_value = (/*matrix_col_selected*/ ctx[15] < 0 || /*matrix_row_selected*/ ctx[16] < 0
    	? ""
    	: /*matrix*/ ctx[13].values[/*matrix_row_selected*/ ctx[16]][/*matrix_col_selected*/ ctx[15]].text) + "";

    	let t2;
    	let t3;
    	let div2;
    	let span0;
    	let t5;
    	let span1;
    	let mounted;
    	let dispose;
    	let each_value_7 = /*matrix*/ ctx[13].y_criteria;
    	validate_each_argument(each_value_7);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_7.length; i += 1) {
    		each_blocks_1[i] = create_each_block_7(get_each_context_7(ctx, each_value_7, i));
    	}

    	let each_value_5 = /*matrix*/ ctx[13].x_criteria;
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
    			attr_dev(div0, "class", "matrix_cell svelte-16q6s0n");
    			toggle_class(div0, "ok", /*matrix_col_selected*/ ctx[15] >= 0 && /*matrix_row_selected*/ ctx[16] >= 0 && /*matrix*/ ctx[13].values[/*matrix_row_selected*/ ctx[16]][/*matrix_col_selected*/ ctx[15]].color == "ok");
    			toggle_class(div0, "warning", /*matrix_col_selected*/ ctx[15] >= 0 && /*matrix_row_selected*/ ctx[16] >= 0 && /*matrix*/ ctx[13].values[/*matrix_row_selected*/ ctx[16]][/*matrix_col_selected*/ ctx[15]].color == "warning");
    			toggle_class(div0, "critical", /*matrix_col_selected*/ ctx[15] >= 0 && /*matrix_row_selected*/ ctx[16] >= 0 && /*matrix*/ ctx[13].values[/*matrix_row_selected*/ ctx[16]][/*matrix_col_selected*/ ctx[15]].color == "critical");
    			add_location(div0, file$5, 1045, 16, 43649);
    			attr_dev(div1, "class", "form-item");
    			add_location(div1, file$5, 1044, 12, 43609);
    			attr_dev(span0, "class", "btn");
    			toggle_class(span0, "disabled", /*matrix_row_selected*/ ctx[16] < 0 || /*matrix_col_selected*/ ctx[15] < 0);
    			add_location(span0, file$5, 1052, 16, 44391);
    			attr_dev(span1, "class", "btn btn-secondary");
    			add_location(span1, file$5, 1053, 16, 44532);
    			attr_dev(div2, "class", "form-item");
    			add_location(div2, file$5, 1051, 12, 44351);
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
    					listen_dev(span0, "click", /*matrix_save*/ ctx[28], false, false, false),
    					listen_dev(span1, "click", /*matrix_cancel*/ ctx[27], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*select_criteria_y, matrix*/ 16785408) {
    				each_value_7 = /*matrix*/ ctx[13].y_criteria;
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

    			if (dirty[0] & /*select_criteria_x, matrix*/ 33562624) {
    				each_value_5 = /*matrix*/ ctx[13].x_criteria;
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

    			if (dirty[0] & /*matrix_col_selected, matrix_row_selected, matrix*/ 106496 && t2_value !== (t2_value = (/*matrix_col_selected*/ ctx[15] < 0 || /*matrix_row_selected*/ ctx[16] < 0
    			? ""
    			: /*matrix*/ ctx[13].values[/*matrix_row_selected*/ ctx[16]][/*matrix_col_selected*/ ctx[15]].text) + "")) set_data_dev(t2, t2_value);

    			if (dirty[0] & /*matrix_col_selected, matrix_row_selected, matrix*/ 106496) {
    				toggle_class(div0, "ok", /*matrix_col_selected*/ ctx[15] >= 0 && /*matrix_row_selected*/ ctx[16] >= 0 && /*matrix*/ ctx[13].values[/*matrix_row_selected*/ ctx[16]][/*matrix_col_selected*/ ctx[15]].color == "ok");
    			}

    			if (dirty[0] & /*matrix_col_selected, matrix_row_selected, matrix*/ 106496) {
    				toggle_class(div0, "warning", /*matrix_col_selected*/ ctx[15] >= 0 && /*matrix_row_selected*/ ctx[16] >= 0 && /*matrix*/ ctx[13].values[/*matrix_row_selected*/ ctx[16]][/*matrix_col_selected*/ ctx[15]].color == "warning");
    			}

    			if (dirty[0] & /*matrix_col_selected, matrix_row_selected, matrix*/ 106496) {
    				toggle_class(div0, "critical", /*matrix_col_selected*/ ctx[15] >= 0 && /*matrix_row_selected*/ ctx[16] >= 0 && /*matrix*/ ctx[13].values[/*matrix_row_selected*/ ctx[16]][/*matrix_col_selected*/ ctx[15]].color == "critical");
    			}

    			if (dirty[0] & /*matrix_row_selected, matrix_col_selected*/ 98304) {
    				toggle_class(span0, "disabled", /*matrix_row_selected*/ ctx[16] < 0 || /*matrix_col_selected*/ ctx[15] < 0);
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
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(1021:8) {#if matrix}",
    		ctx
    	});

    	return block;
    }

    // (1028:24) {#each ycrit.options as option, i}
    function create_each_block_8(ctx) {
    	let option;
    	let t_value = /*option*/ ctx[106].label + "";
    	let t;
    	let option_selected_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = /*i*/ ctx[92];
    			option.value = option.__value;
    			option.selected = option_selected_value = /*option*/ ctx[106].selected;
    			add_location(option, file$5, 1028, 28, 42832);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*matrix*/ 8192 && t_value !== (t_value = /*option*/ ctx[106].label + "")) set_data_dev(t, t_value);

    			if (dirty[0] & /*matrix*/ 8192 && option_selected_value !== (option_selected_value = /*option*/ ctx[106].selected)) {
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
    		source: "(1028:24) {#each ycrit.options as option, i}",
    		ctx
    	});

    	return block;
    }

    // (1023:12) {#each matrix.y_criteria as ycrit, j}
    function create_each_block_7(ctx) {
    	let div;
    	let label;
    	let t0_value = /*ycrit*/ ctx[108].label + "";
    	let t0;
    	let t1;
    	let select;
    	let option;
    	let mounted;
    	let dispose;
    	let each_value_8 = /*ycrit*/ ctx[108].options;
    	validate_each_argument(each_value_8);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_8.length; i += 1) {
    		each_blocks[i] = create_each_block_8(get_each_context_8(ctx, each_value_8, i));
    	}

    	function change_handler(...args) {
    		return /*change_handler*/ ctx[78](/*j*/ ctx[96], ...args);
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

    			add_location(label, file$5, 1024, 20, 42525);
    			option.__value = "-1";
    			option.value = option.__value;
    			add_location(option, file$5, 1026, 24, 42705);
    			attr_dev(select, "class", "form-control");
    			add_location(select, file$5, 1025, 20, 42574);
    			attr_dev(div, "class", "form-item");
    			add_location(div, file$5, 1023, 16, 42481);
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
    			if (dirty[0] & /*matrix*/ 8192 && t0_value !== (t0_value = /*ycrit*/ ctx[108].label + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*matrix*/ 8192) {
    				each_value_8 = /*ycrit*/ ctx[108].options;
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
    		source: "(1023:12) {#each matrix.y_criteria as ycrit, j}",
    		ctx
    	});

    	return block;
    }

    // (1039:24) {#each xcrit.options as option, i}
    function create_each_block_6(ctx) {
    	let option;
    	let t_value = /*option*/ ctx[106].label + "";
    	let t;
    	let option_selected_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = /*i*/ ctx[92];
    			option.value = option.__value;
    			option.selected = option_selected_value = /*option*/ ctx[106].selected;
    			add_location(option, file$5, 1039, 28, 43423);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*matrix*/ 8192 && t_value !== (t_value = /*option*/ ctx[106].label + "")) set_data_dev(t, t_value);

    			if (dirty[0] & /*matrix*/ 8192 && option_selected_value !== (option_selected_value = /*option*/ ctx[106].selected)) {
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
    		source: "(1039:24) {#each xcrit.options as option, i}",
    		ctx
    	});

    	return block;
    }

    // (1034:12) {#each matrix.x_criteria as xcrit, j}
    function create_each_block_5(ctx) {
    	let div;
    	let label;
    	let t0_value = /*xcrit*/ ctx[102].label + "";
    	let t0;
    	let t1;
    	let select;
    	let option;
    	let mounted;
    	let dispose;
    	let each_value_6 = /*xcrit*/ ctx[102].options;
    	validate_each_argument(each_value_6);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_6.length; i += 1) {
    		each_blocks[i] = create_each_block_6(get_each_context_6(ctx, each_value_6, i));
    	}

    	function change_handler_1(...args) {
    		return /*change_handler_1*/ ctx[79](/*j*/ ctx[96], ...args);
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

    			add_location(label, file$5, 1035, 20, 43116);
    			option.__value = "-1";
    			option.value = option.__value;
    			add_location(option, file$5, 1037, 24, 43296);
    			attr_dev(select, "class", "form-control");
    			add_location(select, file$5, 1036, 20, 43165);
    			attr_dev(div, "class", "form-item");
    			add_location(div, file$5, 1034, 16, 43072);
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
    			if (dirty[0] & /*matrix*/ 8192 && t0_value !== (t0_value = /*xcrit*/ ctx[102].label + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*matrix*/ 8192) {
    				each_value_6 = /*xcrit*/ ctx[102].options;
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
    		source: "(1034:12) {#each matrix.x_criteria as xcrit, j}",
    		ctx
    	});

    	return block;
    }

    // (1020:4) 
    function create_nofs_slot(ctx) {
    	let div;
    	let if_block = /*matrix*/ ctx[13] && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "slot", "nofs");
    			add_location(div, file$5, 1019, 4, 42375);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    		},
    		p: function update(ctx, dirty) {
    			if (/*matrix*/ ctx[13]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$1(ctx);
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
    		source: "(1020:4) ",
    		ctx
    	});

    	return block;
    }

    // (1059:8) {#if matrix}
    function create_if_block$2(ctx) {
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
    	let t4_value = /*matrix*/ ctx[13].y_criteria[0].label + "";
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
    	let each_value_4 = /*matrix*/ ctx[13].x_criteria;
    	validate_each_argument(each_value_4);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		each_blocks_2[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
    	}

    	let each_value_3 = /*matrix*/ ctx[13].y_criteria[0].options;
    	validate_each_argument(each_value_3);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks_1[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	let each_value = /*matrix*/ ctx[13].x_criteria[0].options;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
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
    			add_location(p, file$5, 1059, 12, 44702);
    			attr_dev(h40, "class", "svelte-16q6s0n");
    			add_location(h40, file$5, 1065, 65, 45251);
    			attr_dev(td0, "colspan", td0_colspan_value = /*matrix*/ ctx[13].x_criteria.length);
    			attr_dev(td0, "class", "svelte-16q6s0n");
    			add_location(td0, file$5, 1065, 24, 45210);
    			attr_dev(h41, "class", "svelte-16q6s0n");
    			add_location(h41, file$5, 1066, 42, 45319);
    			attr_dev(td1, "width", "364px");
    			attr_dev(td1, "class", "svelte-16q6s0n");
    			add_location(td1, file$5, 1066, 24, 45301);
    			add_location(tr0, file$5, 1064, 20, 45181);
    			attr_dev(td2, "class", "svelte-16q6s0n");
    			add_location(td2, file$5, 1074, 24, 45690);
    			add_location(tr1, file$5, 1068, 20, 45408);
    			attr_dev(td3, "colspan", td3_colspan_value = /*matrix*/ ctx[13].x_criteria.length);
    			attr_dev(td3, "class", "svelte-16q6s0n");
    			add_location(td3, file$5, 1094, 24, 47027);
    			attr_dev(span0, "class", "btn");
    			toggle_class(span0, "disabled", /*matrix_row_selected*/ ctx[16] < 0 || /*matrix_col_selected*/ ctx[15] < 0);
    			add_location(span0, file$5, 1096, 28, 47131);
    			attr_dev(span1, "class", "btn btn-secondary");
    			add_location(span1, file$5, 1097, 28, 47284);
    			attr_dev(td4, "class", "svelte-16q6s0n");
    			add_location(td4, file$5, 1095, 24, 47098);
    			add_location(tr2, file$5, 1093, 20, 46998);
    			add_location(tbody, file$5, 1063, 16, 45153);
    			attr_dev(table, "class", "matrix_table svelte-16q6s0n");
    			set_style(table, "width", window.innerWidth - 64 + "px");
    			add_location(table, file$5, 1062, 12, 45069);
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
    					listen_dev(span0, "click", /*matrix_save*/ ctx[28], false, false, false),
    					listen_dev(span1, "click", /*matrix_cancel*/ ctx[27], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*matrix*/ 8192 && td0_colspan_value !== (td0_colspan_value = /*matrix*/ ctx[13].x_criteria.length)) {
    				attr_dev(td0, "colspan", td0_colspan_value);
    			}

    			if (dirty[0] & /*matrix*/ 8192 && t4_value !== (t4_value = /*matrix*/ ctx[13].y_criteria[0].label + "")) set_data_dev(t4, t4_value);

    			if (dirty[0] & /*matrix*/ 8192) {
    				each_value_4 = /*matrix*/ ctx[13].x_criteria;
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

    			if (dirty[0] & /*matrix, select_criteria_y*/ 16785408) {
    				each_value_3 = /*matrix*/ ctx[13].y_criteria[0].options;
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

    			if (dirty[0] & /*matrix, matrix_row_selected, matrix_col_selected, matrix_pick, select_criteria_x*/ 100769792) {
    				each_value = /*matrix*/ ctx[13].x_criteria[0].options;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tbody, t8);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty[0] & /*matrix*/ 8192 && td3_colspan_value !== (td3_colspan_value = /*matrix*/ ctx[13].x_criteria.length)) {
    				attr_dev(td3, "colspan", td3_colspan_value);
    			}

    			if (dirty[0] & /*matrix_row_selected, matrix_col_selected*/ 98304) {
    				toggle_class(span0, "disabled", /*matrix_row_selected*/ ctx[16] < 0 || /*matrix_col_selected*/ ctx[15] < 0);
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
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(1059:8) {#if matrix}",
    		ctx
    	});

    	return block;
    }

    // (1070:24) {#each matrix.x_criteria as xcrit}
    function create_each_block_4(ctx) {
    	let td;
    	let h4;
    	let t_value = /*xcrit*/ ctx[102].label + "";
    	let t;

    	const block = {
    		c: function create() {
    			td = element("td");
    			h4 = element("h4");
    			t = text(t_value);
    			attr_dev(h4, "class", "svelte-16q6s0n");
    			add_location(h4, file$5, 1071, 32, 45577);
    			set_style(td, "width", "calc((100% - 364px) / 4)");
    			attr_dev(td, "class", "svelte-16q6s0n");
    			add_location(td, file$5, 1070, 28, 45500);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			append_dev(td, h4);
    			append_dev(h4, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*matrix*/ 8192 && t_value !== (t_value = /*xcrit*/ ctx[102].label + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_4.name,
    		type: "each",
    		source: "(1070:24) {#each matrix.x_criteria as xcrit}",
    		ctx
    	});

    	return block;
    }

    // (1076:28) {#each matrix.y_criteria[0].options as {label, selected}
    function create_each_block_3(ctx) {
    	let div;
    	let t_value = /*label*/ ctx[99] + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler_30() {
    		return /*click_handler_30*/ ctx[75](/*i*/ ctx[92]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "matrix_cell svelte-16q6s0n");
    			toggle_class(div, "selected", /*matrix*/ ctx[13].y_criteria[0].options[/*i*/ ctx[92]].selected);
    			add_location(div, file$5, 1076, 32, 45816);
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
    			if (dirty[0] & /*matrix*/ 8192 && t_value !== (t_value = /*label*/ ctx[99] + "")) set_data_dev(t, t_value);

    			if (dirty[0] & /*matrix*/ 8192) {
    				toggle_class(div, "selected", /*matrix*/ ctx[13].y_criteria[0].options[/*i*/ ctx[92]].selected);
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
    		source: "(1076:28) {#each matrix.y_criteria[0].options as {label, selected}",
    		ctx
    	});

    	return block;
    }

    // (1084:28) {#each matrix.x_criteria as col, j}
    function create_each_block_2$1(ctx) {
    	let td;
    	let t_value = /*matrix*/ ctx[13].x_criteria[/*j*/ ctx[96]].options[/*i*/ ctx[92]].label + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler_31() {
    		return /*click_handler_31*/ ctx[76](/*i*/ ctx[92], /*j*/ ctx[96]);
    	}

    	const block = {
    		c: function create() {
    			td = element("td");
    			t = text(t_value);
    			attr_dev(td, "class", "criteria svelte-16q6s0n");
    			toggle_class(td, "selected", /*matrix*/ ctx[13].x_criteria[/*j*/ ctx[96]].options[/*i*/ ctx[92]].selected);
    			add_location(td, file$5, 1084, 32, 46247);
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
    			if (dirty[0] & /*matrix*/ 8192 && t_value !== (t_value = /*matrix*/ ctx[13].x_criteria[/*j*/ ctx[96]].options[/*i*/ ctx[92]].label + "")) set_data_dev(t, t_value);

    			if (dirty[0] & /*matrix*/ 8192) {
    				toggle_class(td, "selected", /*matrix*/ ctx[13].x_criteria[/*j*/ ctx[96]].options[/*i*/ ctx[92]].selected);
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
    		source: "(1084:28) {#each matrix.x_criteria as col, j}",
    		ctx
    	});

    	return block;
    }

    // (1088:32) {#each matrix.values[i] as {text, color}
    function create_each_block_1$1(ctx) {
    	let div;
    	let t_value = /*text*/ ctx[93] + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler_32() {
    		return /*click_handler_32*/ ctx[77](/*i*/ ctx[92], /*j*/ ctx[96]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "matrix_cell svelte-16q6s0n");
    			toggle_class(div, "highlight", /*i*/ ctx[92] == /*matrix_row_selected*/ ctx[16] && /*j*/ ctx[96] == /*matrix_col_selected*/ ctx[15]);
    			toggle_class(div, "ok", /*color*/ ctx[94] == "ok");
    			toggle_class(div, "warning", /*color*/ ctx[94] == "warning");
    			toggle_class(div, "critical", /*color*/ ctx[94] == "critical");
    			add_location(div, file$5, 1088, 36, 46602);
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
    			if (dirty[0] & /*matrix*/ 8192 && t_value !== (t_value = /*text*/ ctx[93] + "")) set_data_dev(t, t_value);

    			if (dirty[0] & /*matrix_row_selected, matrix_col_selected*/ 98304) {
    				toggle_class(div, "highlight", /*i*/ ctx[92] == /*matrix_row_selected*/ ctx[16] && /*j*/ ctx[96] == /*matrix_col_selected*/ ctx[15]);
    			}

    			if (dirty[0] & /*matrix*/ 8192) {
    				toggle_class(div, "ok", /*color*/ ctx[94] == "ok");
    			}

    			if (dirty[0] & /*matrix*/ 8192) {
    				toggle_class(div, "warning", /*color*/ ctx[94] == "warning");
    			}

    			if (dirty[0] & /*matrix*/ 8192) {
    				toggle_class(div, "critical", /*color*/ ctx[94] == "critical");
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
    		source: "(1088:32) {#each matrix.values[i] as {text, color}",
    		ctx
    	});

    	return block;
    }

    // (1081:20) {#each matrix.x_criteria[0].options as row, i}
    function create_each_block$1(ctx) {
    	let tr;
    	let t;
    	let td;
    	let each_value_2 = /*matrix*/ ctx[13].x_criteria;
    	validate_each_argument(each_value_2);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_1[i] = create_each_block_2$1(get_each_context_2$1(ctx, each_value_2, i));
    	}

    	let each_value_1 = /*matrix*/ ctx[13].values[/*i*/ ctx[92]];
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

    			attr_dev(td, "class", "svelte-16q6s0n");
    			add_location(td, file$5, 1086, 28, 46484);
    			add_location(tr, file$5, 1082, 24, 46146);
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
    			if (dirty[0] & /*matrix, select_criteria_x*/ 33562624) {
    				each_value_2 = /*matrix*/ ctx[13].x_criteria;
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

    			if (dirty[0] & /*matrix_row_selected, matrix_col_selected, matrix, matrix_pick*/ 67215360) {
    				each_value_1 = /*matrix*/ ctx[13].values[/*i*/ ctx[92]];
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
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(1081:20) {#each matrix.x_criteria[0].options as row, i}",
    		ctx
    	});

    	return block;
    }

    // (1058:4) 
    function create_fs_slot(ctx) {
    	let div;
    	let if_block = /*matrix*/ ctx[13] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "slot", "fs");
    			add_location(div, file$5, 1057, 4, 44653);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    		},
    		p: function update(ctx, dirty) {
    			if (/*matrix*/ ctx[13]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
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
    		source: "(1058:4) ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
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

    	let t6_value = (!/*incident*/ ctx[4].id
    	? "New"
    	: "Incident " + /*incident*/ ctx[4].id) + "";

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
    	let t22_value = /*incident*/ ctx[4].status + "";
    	let t22;
    	let t23;
    	let div10;
    	let div8;
    	let t25;
    	let div9;
    	let t26_value = /*incident*/ ctx[4].created_by + "";
    	let t26;
    	let t27;
    	let div13;
    	let div11;
    	let t29;
    	let div12;
    	let t30_value = date_format(/*incident*/ ctx[4].created_date) + "";
    	let t30;
    	let t31;
    	let div16;
    	let div14;
    	let t33;
    	let div15;
    	let t34_value = date_format(/*incident*/ ctx[4].updated_date) + "";
    	let t34;
    	let t35;
    	let t36;
    	let div22;
    	let t37;
    	let t38;
    	let t39;
    	let t40;
    	let t41;
    	let t42;
    	let t43;
    	let t44;
    	let t45;
    	let pullout_1;
    	let current;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*single_page*/ ctx[0]) return create_if_block_27;
    		return create_else_block_2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*inspector_details*/ ctx[5]) return create_if_block_26;
    		return create_else_block_1;
    	}

    	let current_block_type_1 = select_block_type_1(ctx);
    	let if_block1 = current_block_type_1(ctx);

    	function select_block_type_2(ctx, dirty) {
    		if (/*single_page*/ ctx[0]) return create_if_block_23;
    		return create_else_block$1;
    	}

    	let current_block_type_2 = select_block_type_2(ctx);
    	let if_block2 = current_block_type_2(ctx);
    	let if_block3 = (/*tab*/ ctx[11] == "overview" || /*single_page*/ ctx[0] && /*incident*/ ctx[4].id) && create_if_block_22(ctx);
    	let if_block4 = (/*tab*/ ctx[11] == "report" || /*single_page*/ ctx[0]) && create_if_block_21(ctx);
    	let if_block5 = (/*tab*/ ctx[11] == "events" || /*single_page*/ ctx[0]) && create_if_block_18(ctx);
    	let if_block6 = (/*tab*/ ctx[11] == "witnesses" || /*single_page*/ ctx[0]) && create_if_block_15(ctx);
    	let if_block7 = (/*tab*/ ctx[11] == "vehicles" || /*single_page*/ ctx[0]) && create_if_block_12(ctx);
    	let if_block8 = (/*tab*/ ctx[11] == "attachments" || /*single_page*/ ctx[0]) && create_if_block_9(ctx);
    	let if_block9 = (/*tab*/ ctx[11] == "links" || /*single_page*/ ctx[0]) && create_if_block_6(ctx);
    	let if_block10 = (/*tab*/ ctx[11] == "claim" || /*single_page*/ ctx[0]) && create_if_block_3(ctx);
    	let if_block11 = /*show_drawer*/ ctx[6] && create_if_block_2$1(ctx);

    	pullout_1 = new Pullout({
    			props: {
    				fs: /*matrix_fs*/ ctx[23],
    				canfs: true,
    				show_drawer: /*matrix_drawer*/ ctx[14],
    				title: "Pre controls risk rating",
    				$$slots: {
    					fs: [create_fs_slot],
    					nofs: [create_nofs_slot]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	pullout_1.$on("close", /*matrix_cancel*/ ctx[27]);

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
    			create_component(pullout_1.$$.fragment);
    			attr_dev(a0, "href", "#platform");
    			attr_dev(a0, "class", "svelte-16q6s0n");
    			add_location(a0, file$5, 619, 16, 22590);
    			attr_dev(li0, "class", "svelte-16q6s0n");
    			add_location(li0, file$5, 619, 12, 22586);
    			attr_dev(a1, "href", "#ehs");
    			attr_dev(a1, "class", "svelte-16q6s0n");
    			add_location(a1, file$5, 620, 16, 22683);
    			attr_dev(li1, "class", "svelte-16q6s0n");
    			add_location(li1, file$5, 620, 12, 22679);
    			attr_dev(a2, "href", "#ehs/incidents");
    			attr_dev(a2, "class", "svelte-16q6s0n");
    			add_location(a2, file$5, 621, 16, 22760);
    			attr_dev(li2, "class", "svelte-16q6s0n");
    			add_location(li2, file$5, 621, 12, 22756);
    			add_location(li3, file$5, 622, 12, 22855);
    			attr_dev(ul, "class", "breadcrumb");
    			add_location(ul, file$5, 618, 8, 22550);
    			attr_dev(div0, "class", "col12 col-md-6");
    			add_location(div0, file$5, 617, 4, 22513);
    			attr_dev(a3, "href", "/");
    			attr_dev(a3, "class", "i-trash i-24 svelte-16q6s0n");
    			add_location(a3, file$5, 627, 12, 23027);
    			attr_dev(a4, "href", "/");
    			attr_dev(a4, "class", "i-actions i-24 svelte-16q6s0n");
    			add_location(a4, file$5, 633, 12, 23433);
    			attr_dev(a5, "href", "/");
    			attr_dev(a5, "class", "i-attachment i-24 svelte-16q6s0n");
    			add_location(a5, file$5, 634, 12, 23486);
    			attr_dev(a6, "href", "/");
    			attr_dev(a6, "class", "i-printer i-24 svelte-16q6s0n");
    			add_location(a6, file$5, 635, 12, 23542);
    			attr_dev(div1, "class", "menu-icons svelte-16q6s0n");
    			add_location(div1, file$5, 626, 8, 22990);
    			attr_dev(a7, "href", "/");
    			attr_dev(a7, "class", "btn btn-secondary");
    			add_location(a7, file$5, 638, 12, 23701);
    			attr_dev(a8, "href", "/");
    			attr_dev(a8, "class", "btn");
    			add_location(a8, file$5, 639, 12, 23811);
    			attr_dev(div2, "class", "menu-buttons svelte-16q6s0n");
    			add_location(div2, file$5, 637, 8, 23662);
    			attr_dev(div3, "class", "col12 col-md-6 menu-bar svelte-16q6s0n");
    			add_location(div3, file$5, 625, 4, 22944);
    			attr_dev(div4, "class", "row sticky");
    			add_location(div4, file$5, 616, 0, 22484);
    			attr_dev(i, "class", "i-incidents i-32");
    			add_location(i, file$5, 646, 35, 24041);
    			attr_dev(h1, "class", "page-title");
    			add_location(h1, file$5, 646, 12, 24018);
    			attr_dev(div5, "class", "svelte-16q6s0n");
    			add_location(div5, file$5, 656, 28, 24777);
    			attr_dev(div6, "class", "svelte-16q6s0n");
    			add_location(div6, file$5, 657, 28, 24823);
    			attr_dev(div7, "class", "svelte-16q6s0n");
    			add_location(div7, file$5, 655, 24, 24743);
    			attr_dev(div8, "class", "svelte-16q6s0n");
    			add_location(div8, file$5, 660, 28, 24941);
    			attr_dev(div9, "class", "svelte-16q6s0n");
    			add_location(div9, file$5, 661, 28, 24988);
    			attr_dev(div10, "class", "svelte-16q6s0n");
    			add_location(div10, file$5, 659, 24, 24907);
    			attr_dev(div11, "class", "svelte-16q6s0n");
    			add_location(div11, file$5, 664, 28, 25110);
    			attr_dev(div12, "class", "svelte-16q6s0n");
    			add_location(div12, file$5, 665, 28, 25162);
    			attr_dev(div13, "class", "svelte-16q6s0n");
    			add_location(div13, file$5, 663, 24, 25076);
    			attr_dev(div14, "class", "svelte-16q6s0n");
    			add_location(div14, file$5, 668, 28, 25299);
    			attr_dev(div15, "class", "svelte-16q6s0n");
    			add_location(div15, file$5, 669, 28, 25351);
    			attr_dev(div16, "class", "svelte-16q6s0n");
    			add_location(div16, file$5, 667, 24, 25265);
    			attr_dev(div17, "class", "inspector-details-table svelte-16q6s0n");
    			toggle_class(div17, "inspector_details", /*inspector_details*/ ctx[5]);
    			add_location(div17, file$5, 654, 20, 24657);
    			attr_dev(div18, "class", "card-body inspector-details-card svelte-16q6s0n");
    			add_location(div18, file$5, 648, 16, 24135);
    			attr_dev(div19, "class", "card svelte-16q6s0n");
    			add_location(div19, file$5, 647, 12, 24100);
    			attr_dev(div20, "class", "side_menu_wrapper");
    			set_style(div20, "position", "sticky");
    			set_style(div20, "top", "56px");
    			add_location(div20, file$5, 645, 8, 23941);
    			attr_dev(div21, "class", "col3 d960up-block");
    			add_location(div21, file$5, 644, 4, 23901);
    			attr_dev(div22, "class", "col12 col-md-9");
    			add_location(div22, file$5, 710, 4, 28761);
    			attr_dev(div23, "class", "row");
    			add_location(div23, file$5, 643, 0, 23879);
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
    			insert_dev(target, t44, anchor);
    			if (if_block11) if_block11.m(target, anchor);
    			insert_dev(target, t45, anchor);
    			mount_component(pullout_1, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(a0, "click", /*click_handler*/ ctx[33], false, false, false),
    					listen_dev(a1, "click", /*click_handler_1*/ ctx[34], false, false, false),
    					listen_dev(a2, "click", /*click_handler_2*/ ctx[35], false, false, false),
    					listen_dev(a6, "click", prevent_default(/*click_handler_5*/ ctx[38]), false, true, false),
    					listen_dev(a7, "click", prevent_default(/*save_incident*/ ctx[17]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty[0] & /*incident*/ 16) && t6_value !== (t6_value = (!/*incident*/ ctx[4].id
    			? "New"
    			: "Incident " + /*incident*/ ctx[4].id) + "")) set_data_dev(t6, t6_value);

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

    			if ((!current || dirty[0] & /*incident*/ 16) && t22_value !== (t22_value = /*incident*/ ctx[4].status + "")) set_data_dev(t22, t22_value);
    			if ((!current || dirty[0] & /*incident*/ 16) && t26_value !== (t26_value = /*incident*/ ctx[4].created_by + "")) set_data_dev(t26, t26_value);
    			if ((!current || dirty[0] & /*incident*/ 16) && t30_value !== (t30_value = date_format(/*incident*/ ctx[4].created_date) + "")) set_data_dev(t30, t30_value);
    			if ((!current || dirty[0] & /*incident*/ 16) && t34_value !== (t34_value = date_format(/*incident*/ ctx[4].updated_date) + "")) set_data_dev(t34, t34_value);

    			if (dirty[0] & /*inspector_details*/ 32) {
    				toggle_class(div17, "inspector_details", /*inspector_details*/ ctx[5]);
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

    			if (/*tab*/ ctx[11] == "overview" || /*single_page*/ ctx[0] && /*incident*/ ctx[4].id) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_22(ctx);
    					if_block3.c();
    					if_block3.m(div22, t37);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*tab*/ ctx[11] == "report" || /*single_page*/ ctx[0]) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);

    					if (dirty[0] & /*tab, single_page*/ 2049) {
    						transition_in(if_block4, 1);
    					}
    				} else {
    					if_block4 = create_if_block_21(ctx);
    					if_block4.c();
    					transition_in(if_block4, 1);
    					if_block4.m(div22, t38);
    				}
    			} else if (if_block4) {
    				group_outros();

    				transition_out(if_block4, 1, 1, () => {
    					if_block4 = null;
    				});

    				check_outros();
    			}

    			if (/*tab*/ ctx[11] == "events" || /*single_page*/ ctx[0]) {
    				if (if_block5) {
    					if_block5.p(ctx, dirty);
    				} else {
    					if_block5 = create_if_block_18(ctx);
    					if_block5.c();
    					if_block5.m(div22, t39);
    				}
    			} else if (if_block5) {
    				if_block5.d(1);
    				if_block5 = null;
    			}

    			if (/*tab*/ ctx[11] == "witnesses" || /*single_page*/ ctx[0]) {
    				if (if_block6) {
    					if_block6.p(ctx, dirty);
    				} else {
    					if_block6 = create_if_block_15(ctx);
    					if_block6.c();
    					if_block6.m(div22, t40);
    				}
    			} else if (if_block6) {
    				if_block6.d(1);
    				if_block6 = null;
    			}

    			if (/*tab*/ ctx[11] == "vehicles" || /*single_page*/ ctx[0]) {
    				if (if_block7) {
    					if_block7.p(ctx, dirty);
    				} else {
    					if_block7 = create_if_block_12(ctx);
    					if_block7.c();
    					if_block7.m(div22, t41);
    				}
    			} else if (if_block7) {
    				if_block7.d(1);
    				if_block7 = null;
    			}

    			if (/*tab*/ ctx[11] == "attachments" || /*single_page*/ ctx[0]) {
    				if (if_block8) {
    					if_block8.p(ctx, dirty);
    				} else {
    					if_block8 = create_if_block_9(ctx);
    					if_block8.c();
    					if_block8.m(div22, t42);
    				}
    			} else if (if_block8) {
    				if_block8.d(1);
    				if_block8 = null;
    			}

    			if (/*tab*/ ctx[11] == "links" || /*single_page*/ ctx[0]) {
    				if (if_block9) {
    					if_block9.p(ctx, dirty);
    				} else {
    					if_block9 = create_if_block_6(ctx);
    					if_block9.c();
    					if_block9.m(div22, t43);
    				}
    			} else if (if_block9) {
    				if_block9.d(1);
    				if_block9 = null;
    			}

    			if (/*tab*/ ctx[11] == "claim" || /*single_page*/ ctx[0]) {
    				if (if_block10) {
    					if_block10.p(ctx, dirty);
    				} else {
    					if_block10 = create_if_block_3(ctx);
    					if_block10.c();
    					if_block10.m(div22, null);
    				}
    			} else if (if_block10) {
    				if_block10.d(1);
    				if_block10 = null;
    			}

    			if (/*show_drawer*/ ctx[6]) {
    				if (if_block11) {
    					if_block11.p(ctx, dirty);
    				} else {
    					if_block11 = create_if_block_2$1(ctx);
    					if_block11.c();
    					if_block11.m(t45.parentNode, t45);
    				}
    			} else if (if_block11) {
    				if_block11.d(1);
    				if_block11 = null;
    			}

    			const pullout_1_changes = {};
    			if (dirty[0] & /*matrix_drawer*/ 16384) pullout_1_changes.show_drawer = /*matrix_drawer*/ ctx[14];

    			if (dirty[0] & /*matrix_row_selected, matrix_col_selected, matrix*/ 106496 | dirty[3] & /*$$scope*/ 262144) {
    				pullout_1_changes.$$scope = { dirty, ctx };
    			}

    			pullout_1.$set(pullout_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block4);
    			transition_in(pullout_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block4);
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
    			if (detaching) detach_dev(t44);
    			if (if_block11) if_block11.d(detaching);
    			if (detaching) detach_dev(t45);
    			destroy_component(pullout_1, detaching);
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

    function instance$5($$self, $$props, $$invalidate) {
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
    				},
    				{
    					item_type: "input_lookup",
    					id: "0_11",
    					label: "Location level 1",
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
    		"updated_date": "2022-02-07T17:06:09.111Z"
    	};

    	function save_incident() {
    		$$invalidate(4, incident.status = "In Progress", incident);
    		$$invalidate(4, incident.id = "485", incident);
    		$$invalidate(4, incident.updated_date = new Date().toISOString(), incident);
    	}

    	let inspector_details = false;

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
    		$$invalidate(6, show_drawer = true);
    		$$invalidate(7, mask_block = false);
    		$$invalidate(8, mask_visible = true);

    		setTimeout(
    			() => {
    				$$invalidate(9, pullout = true);
    			},
    			300
    		);
    	}

    	function hide_event_drawer() {
    		$$invalidate(7, mask_block = false);
    		$$invalidate(8, mask_visible = false);
    		$$invalidate(9, pullout = false);

    		setTimeout(
    			() => {
    				$$invalidate(6, show_drawer = false);
    			},
    			1000
    		);
    	}

    	let tab = "report";
    	let { tabnav = "" } = $$props;
    	let { bodyScroll = 0 } = $$props;

    	function print_mode(bool) {
    		dispatch("print", { text: bool });
    	}

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
    	let matrix_fs = false;
    	let matrix_col_selected = -1;
    	let matrix_row_selected = -1;

    	function select_criteria_y(i, j) {
    		$$invalidate(15, matrix_col_selected = i);

    		matrix.y_criteria[j].options.forEach(el => {
    			el.selected = false; //deselect this column
    		});

    		$$invalidate(13, matrix.y_criteria[j].options[i].selected = true, matrix); //select the row in this column
    		$$invalidate(13, matrix);
    	}

    	function select_criteria_x(i, j) {
    		let currently_selected = matrix.x_criteria[j].options[i].selected;

    		matrix.x_criteria[j].options.forEach(el => {
    			el.selected = false; //deselect this column
    		});

    		$$invalidate(13, matrix.x_criteria[j].options[i].selected = !currently_selected, matrix); //select the row in this column

    		//iterate over all columns and find highest row selected
    		let highest_row = -1;

    		matrix.x_criteria.forEach(col => {
    			col.options.forEach((row, i) => {
    				if (row.selected && i > highest_row) {
    					highest_row = i;
    				}
    			});
    		});

    		$$invalidate(16, matrix_row_selected = highest_row);
    	}

    	function matrix_pick(i, j) {
    		$$invalidate(16, matrix_row_selected = i);
    		$$invalidate(15, matrix_col_selected = j);

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

    		$$invalidate(13, matrix);
    		$$invalidate(13, matrix);
    		console.log("done matrix pick", i, j);
    	}

    	function read_matrix(msg, data) {
    		matrix_holder = data;
    		$$invalidate(13, matrix = data.matrix);
    		$$invalidate(14, matrix_drawer = true);
    		$$invalidate(15, matrix_col_selected = -1);
    		$$invalidate(16, matrix_row_selected = -1);

    		matrix.values.forEach((row, i) => {
    			row.forEach((col, j) => {
    				if (col == matrix_holder.answer) {
    					$$invalidate(15, matrix_col_selected = j);
    					$$invalidate(16, matrix_row_selected = i);
    				}
    			});
    		});
    	}

    	function matrix_cancel() {
    		$$invalidate(14, matrix_drawer = false);
    	}

    	function matrix_save() {
    		matrix_holder.answer = matrix.values[matrix_row_selected][matrix_col_selected];
    		$$invalidate(1, f);
    		$$invalidate(14, matrix_drawer = false);
    	}

    	onMount(() => {
    		setInterval(
    			() => {
    				$$invalidate(32, counter += 10);
    			},
    			10000
    		); //updates every 10 seconds
    	});

    	const writable_props = ["tabnav", "bodyScroll"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<Frame_incidents_new> was created with unknown prop '${key}'`);
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
    		$$invalidate(0, single_page = false);
    	};

    	const click_handler_4 = () => {
    		$$invalidate(0, single_page = true);
    	};

    	const click_handler_5 = () => {
    		print_mode(true);
    	};

    	const click_handler_6 = () => {
    		$$invalidate(5, inspector_details = false);
    	};

    	const click_handler_7 = () => {
    		$$invalidate(5, inspector_details = true);
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

    	function h1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			hs[7].el = $$value;
    			$$invalidate(2, hs);
    		});
    	}

    	function h1_binding_1($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			hs[0].el = $$value;
    			$$invalidate(2, hs);
    		});
    	}

    	function h1_binding_2($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			hs[1].el = $$value;
    			$$invalidate(2, hs);
    		});
    	}

    	const click_handler_24 = () => nav("ehs/incidents/incidents_new/report");

    	function h1_binding_3($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			hs[2].el = $$value;
    			$$invalidate(2, hs);
    		});
    	}

    	const click_handler_25 = () => nav("ehs/incidents/incidents_new/report");

    	function h1_binding_4($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			hs[3].el = $$value;
    			$$invalidate(2, hs);
    		});
    	}

    	const click_handler_26 = () => nav("ehs/incidents/incidents_new/report");

    	function h1_binding_5($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			hs[4].el = $$value;
    			$$invalidate(2, hs);
    		});
    	}

    	const click_handler_27 = () => nav("ehs/incidents/incidents_new/report");

    	function h1_binding_6($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			hs[5].el = $$value;
    			$$invalidate(2, hs);
    		});
    	}

    	const click_handler_28 = () => nav("ehs/incidents/incidents_new/report");

    	function h1_binding_7($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			hs[6].el = $$value;
    			$$invalidate(2, hs);
    		});
    	}

    	const click_handler_29 = () => nav("ehs/incidents/incidents_new/report");

    	function select0_change_handler() {
    		event.event_type = select_value(this);
    		$$invalidate(10, event);
    	}

    	function input2_input_handler() {
    		event.person = this.value;
    		$$invalidate(10, event);
    	}

    	function input5_change_handler() {
    		event.medical_bool = this.checked;
    		$$invalidate(10, event);
    	}

    	function input6_change_handler() {
    		event.losttime_bool = this.checked;
    		$$invalidate(10, event);
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
    		if ("tabnav" in $$props) $$invalidate(29, tabnav = $$props.tabnav);
    		if ("bodyScroll" in $$props) $$invalidate(30, bodyScroll = $$props.bodyScroll);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		fade,
    		createEventDispatcher,
    		Pullout,
    		Form,
    		dispatch,
    		single_page,
    		form_test,
    		f,
    		form_text,
    		incident,
    		save_incident,
    		inspector_details,
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
    		print_mode,
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
    		matrix_save
    	});

    	$$self.$inject_state = $$props => {
    		if ("single_page" in $$props) $$invalidate(0, single_page = $$props.single_page);
    		if ("form_test" in $$props) form_test = $$props.form_test;
    		if ("f" in $$props) $$invalidate(1, f = $$props.f);
    		if ("form_text" in $$props) form_text = $$props.form_text;
    		if ("incident" in $$props) $$invalidate(4, incident = $$props.incident);
    		if ("inspector_details" in $$props) $$invalidate(5, inspector_details = $$props.inspector_details);
    		if ("show_drawer" in $$props) $$invalidate(6, show_drawer = $$props.show_drawer);
    		if ("mask_block" in $$props) $$invalidate(7, mask_block = $$props.mask_block);
    		if ("mask_visible" in $$props) $$invalidate(8, mask_visible = $$props.mask_visible);
    		if ("pullout" in $$props) $$invalidate(9, pullout = $$props.pullout);
    		if ("add_event" in $$props) add_event = $$props.add_event;
    		if ("events" in $$props) events = $$props.events;
    		if ("event" in $$props) $$invalidate(10, event = $$props.event);
    		if ("tab" in $$props) $$invalidate(11, tab = $$props.tab);
    		if ("tabnav" in $$props) $$invalidate(29, tabnav = $$props.tabnav);
    		if ("bodyScroll" in $$props) $$invalidate(30, bodyScroll = $$props.bodyScroll);
    		if ("hs" in $$props) $$invalidate(2, hs = $$props.hs);
    		if ("closest" in $$props) $$invalidate(31, closest = $$props.closest);
    		if ("closest_el" in $$props) $$invalidate(3, closest_el = $$props.closest_el);
    		if ("counter" in $$props) $$invalidate(32, counter = $$props.counter);
    		if ("start_time" in $$props) start_time = $$props.start_time;
    		if ("counter_phrase" in $$props) $$invalidate(12, counter_phrase = $$props.counter_phrase);
    		if ("sub" in $$props) sub = $$props.sub;
    		if ("matrix" in $$props) $$invalidate(13, matrix = $$props.matrix);
    		if ("matrix_holder" in $$props) matrix_holder = $$props.matrix_holder;
    		if ("matrix_drawer" in $$props) $$invalidate(14, matrix_drawer = $$props.matrix_drawer);
    		if ("matrix_fs" in $$props) $$invalidate(23, matrix_fs = $$props.matrix_fs);
    		if ("matrix_col_selected" in $$props) $$invalidate(15, matrix_col_selected = $$props.matrix_col_selected);
    		if ("matrix_row_selected" in $$props) $$invalidate(16, matrix_row_selected = $$props.matrix_row_selected);
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

    		if ($$self.$$.dirty[0] & /*tabnav*/ 536870912) {
    			{
    				let t = tabnav;

    				if (tabnav !== "") {
    					$$invalidate(11, tab = t);
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*bodyScroll, single_page, hs, closest_el*/ 1073741837 | $$self.$$.dirty[1] & /*closest*/ 1) {
    			{
    				let s = bodyScroll;
    				let t = window.innerHeight / 2.5; //target position third way down page

    				if (single_page) {
    					$$invalidate(31, closest = false);
    					let temp = false;

    					hs.forEach(h => {
    						if (h.el) {
    							let delta = Math.abs(s + t - h.el.offsetTop);

    							if (delta < closest || closest === false) {
    								$$invalidate(31, closest = delta);
    								temp = h;
    							}
    						}
    					});

    					if (closest_el !== temp) {
    						window.location.hash = "ehs/incidents/incidents_new/" + temp.key;
    						$$invalidate(3, closest_el = temp);
    					}
    				}
    			}
    		}

    		if ($$self.$$.dirty[1] & /*counter*/ 2) {
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

    				$$invalidate(12, counter_phrase = time);
    			}
    		}
    	};

    	return [
    		single_page,
    		f,
    		hs,
    		closest_el,
    		incident,
    		inspector_details,
    		show_drawer,
    		mask_block,
    		mask_visible,
    		pullout,
    		event,
    		tab,
    		counter_phrase,
    		matrix,
    		matrix_drawer,
    		matrix_col_selected,
    		matrix_row_selected,
    		save_incident,
    		show_event_drawer,
    		hide_event_drawer,
    		print_mode,
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
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { tabnav: 29, bodyScroll: 30 }, [-1, -1, -1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Frame_incidents_new",
    			options,
    			id: create_fragment$5.name
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
    	let t9;
    	let h1;
    	let i;
    	let t10;
    	let t11;
    	let div9;
    	let div5;
    	let div4;
    	let div3;
    	let h20;
    	let t13;
    	let div8;
    	let div7;
    	let div6;
    	let h21;
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
    			div9 = element("div");
    			div5 = element("div");
    			div4 = element("div");
    			div3 = element("div");
    			h20 = element("h2");
    			h20.textContent = "Add a filter";
    			t13 = space();
    			div8 = element("div");
    			div7 = element("div");
    			div6 = element("div");
    			h21 = element("h2");
    			h21.textContent = "Query filters";
    			attr_dev(a0, "href", "#platform");
    			add_location(a0, file$2, 17, 16, 320);
    			add_location(li0, file$2, 17, 12, 316);
    			attr_dev(a1, "href", "#ehs");
    			add_location(a1, file$2, 18, 16, 413);
    			add_location(li1, file$2, 18, 12, 409);
    			attr_dev(a2, "href", "#ehs/incidents");
    			add_location(a2, file$2, 19, 16, 490);
    			add_location(li2, file$2, 19, 12, 486);
    			add_location(li3, file$2, 20, 12, 585);
    			attr_dev(ul, "class", "breadcrumb");
    			add_location(ul, file$2, 16, 8, 280);
    			attr_dev(div0, "class", "col12 col-sm-7");
    			add_location(div0, file$2, 15, 4, 243);
    			attr_dev(a3, "href", "#ehs/incidents/queries_result");
    			attr_dev(a3, "class", "btn");
    			add_location(a3, file$2, 24, 8, 681);
    			attr_dev(div1, "class", "col12 col-sm-5 text-right");
    			add_location(div1, file$2, 23, 4, 633);
    			attr_dev(div2, "class", "row sticky");
    			add_location(div2, file$2, 14, 0, 214);
    			attr_dev(i, "class", "i-filter i-32");
    			add_location(i, file$2, 27, 4, 807);
    			add_location(h1, file$2, 27, 0, 803);
    			add_location(h20, file$2, 33, 16, 985);
    			attr_dev(div3, "class", "card-header");
    			add_location(div3, file$2, 32, 12, 943);
    			attr_dev(div4, "class", "card");
    			add_location(div4, file$2, 31, 8, 912);
    			attr_dev(div5, "class", "col12 col-md-3");
    			add_location(div5, file$2, 30, 4, 875);
    			add_location(h21, file$2, 40, 16, 1166);
    			attr_dev(div6, "class", "card-header");
    			add_location(div6, file$2, 39, 12, 1124);
    			attr_dev(div7, "class", "card");
    			add_location(div7, file$2, 38, 8, 1093);
    			attr_dev(div8, "class", "col12 col-md-9");
    			add_location(div8, file$2, 37, 4, 1056);
    			attr_dev(div9, "class", "row");
    			add_location(div9, file$2, 29, 0, 853);
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
    			insert_dev(target, t9, anchor);
    			insert_dev(target, h1, anchor);
    			append_dev(h1, i);
    			append_dev(h1, t10);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, div9, anchor);
    			append_dev(div9, div5);
    			append_dev(div5, div4);
    			append_dev(div4, div3);
    			append_dev(div3, h20);
    			append_dev(div9, t13);
    			append_dev(div9, div8);
    			append_dev(div8, div7);
    			append_dev(div7, div6);
    			append_dev(div6, h21);

    			if (!mounted) {
    				dispose = [
    					listen_dev(a0, "click", /*click_handler*/ ctx[1], false, false, false),
    					listen_dev(a1, "click", /*click_handler_1*/ ctx[2], false, false, false),
    					listen_dev(a2, "click", /*click_handler_2*/ ctx[3], false, false, false),
    					listen_dev(a3, "click", /*click_handler_3*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(div9);
    			mounted = false;
    			run_all(dispose);
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
    		nav("queries_result");
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

    	return [nav, click_handler, click_handler_1, click_handler_2, click_handler_3];
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
    			add_location(a1, file$1, 18, 16, 413);
    			add_location(li1, file$1, 18, 12, 409);
    			attr_dev(a2, "href", "#ehs/incidents");
    			add_location(a2, file$1, 19, 16, 490);
    			add_location(li2, file$1, 19, 12, 486);
    			add_location(li3, file$1, 20, 12, 585);
    			attr_dev(ul, "class", "breadcrumb");
    			add_location(ul, file$1, 16, 8, 280);
    			attr_dev(div0, "class", "col12 col-md-5");
    			add_location(div0, file$1, 15, 4, 243);
    			attr_dev(a3, "title", "Edit this query");
    			attr_dev(a3, "class", "i-edit i-24");
    			attr_dev(a3, "href", "#ehs/incidents/queries_new");
    			add_location(a3, file$1, 24, 8, 684);
    			attr_dev(i0, "title", "Download these results");
    			attr_dev(i0, "class", "i-download i-24");
    			add_location(i0, file$1, 25, 8, 820);
    			attr_dev(a4, "href", "#ehs/incidents/queries_new");
    			attr_dev(a4, "class", "btn btn-secondary");
    			add_location(a4, file$1, 26, 8, 891);
    			attr_dev(a5, "href", "/");
    			attr_dev(a5, "class", "btn btn-secondary");
    			add_location(a5, file$1, 27, 8, 1017);
    			attr_dev(a6, "href", "/");
    			attr_dev(a6, "class", "btn");
    			add_location(a6, file$1, 28, 8, 1084);
    			attr_dev(div1, "class", "col12 col-md-7 text-right");
    			add_location(div1, file$1, 23, 4, 636);
    			attr_dev(div2, "class", "row sticky");
    			add_location(div2, file$1, 14, 0, 214);
    			attr_dev(i1, "class", "i-filter i-32");
    			add_location(i1, file$1, 31, 4, 1139);
    			add_location(h1, file$1, 31, 0, 1135);
    			add_location(th0, file$1, 39, 24, 1375);
    			add_location(th1, file$1, 40, 24, 1418);
    			add_location(th2, file$1, 41, 24, 1463);
    			add_location(th3, file$1, 42, 24, 1503);
    			add_location(th4, file$1, 43, 24, 1547);
    			add_location(th5, file$1, 44, 24, 1585);
    			add_location(th6, file$1, 45, 24, 1627);
    			add_location(th7, file$1, 46, 24, 1666);
    			add_location(th8, file$1, 47, 24, 1712);
    			add_location(tr0, file$1, 38, 20, 1346);
    			add_location(thead, file$1, 37, 16, 1318);
    			add_location(b, file$1, 52, 28, 1856);
    			add_location(td0, file$1, 52, 24, 1852);
    			add_location(td1, file$1, 53, 24, 1896);
    			add_location(td2, file$1, 54, 24, 1941);
    			add_location(td3, file$1, 55, 24, 1977);
    			add_location(td4, file$1, 56, 24, 2020);
    			add_location(td5, file$1, 57, 24, 2062);
    			add_location(td6, file$1, 58, 24, 2107);
    			add_location(td7, file$1, 59, 24, 2147);
    			add_location(td8, file$1, 60, 24, 2182);
    			add_location(tr1, file$1, 51, 20, 1823);
    			add_location(tbody, file$1, 50, 16, 1795);
    			attr_dev(table, "class", "table");
    			add_location(table, file$1, 36, 12, 1280);
    			attr_dev(div3, "class", "pagination");
    			add_location(div3, file$1, 65, 44, 2340);
    			attr_dev(div4, "class", "pagination-wrapper");
    			add_location(div4, file$1, 65, 12, 2308);
    			attr_dev(div5, "class", "sticky-wrapper");
    			add_location(div5, file$1, 35, 8, 1239);
    			attr_dev(div6, "class", "col12");
    			add_location(div6, file$1, 34, 4, 1211);
    			attr_dev(div7, "class", "row");
    			add_location(div7, file$1, 33, 0, 1189);
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
    					listen_dev(a0, "click", /*click_handler*/ ctx[1], false, false, false),
    					listen_dev(a1, "click", /*click_handler_1*/ ctx[2], false, false, false),
    					listen_dev(a2, "click", /*click_handler_2*/ ctx[3], false, false, false),
    					listen_dev(a3, "click", /*click_handler_3*/ ctx[4], false, false, false),
    					listen_dev(a4, "click", /*click_handler_4*/ ctx[5], false, false, false)
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
    		nav("platform");
    	};

    	const click_handler_1 = () => {
    		nav("ehs");
    	};

    	const click_handler_2 = () => {
    		nav("incidents");
    	};

    	const click_handler_3 = () => {
    		nav("queries_new");
    	};

    	const click_handler_4 = () => {
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

    	return [
    		nav,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4
    	];
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

    const { console: console_1 } = globals;
    const file = "src/Frame.svelte";

    // (68:0) {#if grid}
    function create_if_block(ctx) {
    	let div1;
    	let div0;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(div0, "class", "frame svelte-1s2lye6");
    			add_location(div0, file, 68, 18, 1776);
    			attr_dev(div1, "class", "grid svelte-1s2lye6");
    			add_location(div1, file, 68, 0, 1758);
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
    		source: "(68:0) {#if grid}",
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
    	var switch_value = /*comp*/ ctx[1].component;

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
    		switch_instance.$on("nav", /*handleNav*/ ctx[4]);
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
    			add_location(path0, file, 75, 3, 1998);
    			attr_dev(path1, "d", "M39.292 22.0918V8.0918H48.252V10.1018H41.552V13.9918H47.632V16.0018H41.552V20.0918H48.252V22.0918H39.292Z");
    			attr_dev(path1, "fill", "black");
    			add_location(path1, file, 76, 3, 3146);
    			attr_dev(path2, "d", "M54.6821 22.3318C53.9321 22.3318 53.2621 22.2018 52.6721 21.9518C52.0821 21.7018 51.5922 21.3318 51.1922 20.8618C50.7922 20.3918 50.4821 19.8118 50.2721 19.1418C50.0621 18.4718 49.9521 17.7118 49.9521 16.8818C49.9521 16.0518 50.0621 15.3018 50.2721 14.6218C50.4821 13.9518 50.7922 13.3718 51.1922 12.9018C51.5922 12.4318 52.0921 12.0618 52.6721 11.8118C53.2621 11.5618 53.9321 11.4318 54.6821 11.4318C55.7221 11.4318 56.5821 11.6618 57.2521 12.1318C57.9221 12.6018 58.4121 13.2218 58.7121 14.0018L56.9121 14.8418C56.7621 14.3618 56.5121 13.9718 56.1421 13.6918C55.7721 13.4018 55.2922 13.2618 54.6922 13.2618C53.8922 13.2618 53.2822 13.5118 52.8722 14.0118C52.4622 14.5118 52.2621 15.1618 52.2621 15.9618V17.8218C52.2621 18.6218 52.4622 19.2718 52.8722 19.7718C53.2822 20.2718 53.8822 20.5218 54.6922 20.5218C55.3321 20.5218 55.8421 20.3618 56.2221 20.0518C56.6021 19.7418 56.9021 19.3218 57.1321 18.8018L58.7921 19.6818C58.4421 20.5418 57.9221 21.2018 57.2321 21.6618C56.5321 22.1018 55.6821 22.3318 54.6821 22.3318Z");
    			attr_dev(path2, "fill", "black");
    			add_location(path2, file, 77, 3, 3280);
    			attr_dev(path3, "d", "M64.8518 22.3318C64.1318 22.3318 63.4718 22.2018 62.8818 21.9518C62.2818 21.7018 61.7818 21.3318 61.3718 20.8618C60.9518 20.3918 60.6318 19.8118 60.4118 19.1418C60.1818 18.4718 60.0718 17.7118 60.0718 16.8818C60.0718 16.0518 60.1818 15.3018 60.4118 14.6218C60.6418 13.9518 60.9618 13.3718 61.3718 12.9018C61.7818 12.4318 62.2918 12.0618 62.8818 11.8118C63.4718 11.5618 64.1318 11.4318 64.8518 11.4318C65.5718 11.4318 66.2318 11.5618 66.8318 11.8118C67.4218 12.0618 67.9318 12.4318 68.3418 12.9018C68.7518 13.3718 69.0818 13.9518 69.3018 14.6218C69.5318 15.3018 69.6418 16.0518 69.6418 16.8818C69.6418 17.7118 69.5318 18.4618 69.3018 19.1418C69.0718 19.8218 68.7518 20.3918 68.3418 20.8618C67.9318 21.3318 67.4218 21.7018 66.8318 21.9518C66.2318 22.2018 65.5718 22.3318 64.8518 22.3318ZM64.8518 20.5018C65.6018 20.5018 66.2018 20.2718 66.6618 19.8118C67.1118 19.3518 67.3418 18.6618 67.3418 17.7518V15.9918C67.3418 15.0718 67.1118 14.3918 66.6618 13.9318C66.2018 13.4718 65.6018 13.2418 64.8518 13.2418C64.1018 13.2418 63.5018 13.4718 63.0518 13.9318C62.6018 14.3918 62.3718 15.0818 62.3718 15.9918V17.7518C62.3718 18.6718 62.6018 19.3518 63.0518 19.8118C63.5018 20.2718 64.1018 20.5018 64.8518 20.5018Z");
    			attr_dev(path3, "fill", "black");
    			add_location(path3, file, 78, 3, 4326);
    			attr_dev(path4, "d", "M77.832 22.3318C76.922 22.3318 76.092 22.1718 75.352 21.8618C74.612 21.5518 73.972 21.0918 73.442 20.4818C72.912 19.8718 72.502 19.1218 72.222 18.2118C71.932 17.3118 71.792 16.2718 71.792 15.0918C71.792 13.9118 71.932 12.8718 72.222 11.9718C72.512 11.0718 72.912 10.3118 73.442 9.70181C73.972 9.09181 74.602 8.63181 75.352 8.32181C76.092 8.01181 76.922 7.85181 77.832 7.85181C78.742 7.85181 79.562 8.01181 80.312 8.32181C81.052 8.63181 81.692 9.10181 82.222 9.70181C82.752 10.3118 83.162 11.0618 83.442 11.9718C83.732 12.8718 83.872 13.9118 83.872 15.0918C83.872 16.2718 83.732 17.3118 83.442 18.2118C83.152 19.1118 82.742 19.8718 82.222 20.4818C81.692 21.0918 81.062 21.5518 80.312 21.8618C79.562 22.1718 78.742 22.3318 77.832 22.3318ZM77.832 20.3218C78.362 20.3218 78.862 20.2318 79.302 20.0418C79.752 19.8518 80.132 19.5818 80.442 19.2218C80.752 18.8618 81.002 18.4318 81.172 17.9218C81.342 17.4118 81.432 16.8318 81.432 16.1918V13.9818C81.432 13.3418 81.342 12.7618 81.172 12.2518C81.002 11.7418 80.752 11.3118 80.442 10.9518C80.132 10.5918 79.742 10.3218 79.302 10.1318C78.852 9.94181 78.362 9.85181 77.832 9.85181C77.282 9.85181 76.792 9.94181 76.352 10.1318C75.912 10.3218 75.532 10.5918 75.222 10.9518C74.912 11.3118 74.662 11.7418 74.492 12.2518C74.322 12.7618 74.232 13.3418 74.232 13.9818V16.1918C74.232 16.8318 74.322 17.4118 74.492 17.9218C74.662 18.4318 74.912 18.8618 75.222 19.2218C75.532 19.5818 75.912 19.8518 76.352 20.0418C76.782 20.2318 77.282 20.3218 77.832 20.3218Z");
    			attr_dev(path4, "fill", "black");
    			add_location(path4, file, 79, 3, 5557);
    			attr_dev(path5, "d", "M86.1421 22.0918V11.6618H88.3321V13.3918H88.4321C88.6621 12.8318 89.0021 12.3618 89.4621 11.9918C89.9221 11.6218 90.5521 11.4318 91.3521 11.4318C92.4221 11.4318 93.2521 11.7818 93.8521 12.4818C94.4421 13.1818 94.7421 14.1818 94.7421 15.4818V22.0918H92.5521V15.7518C92.5521 14.1218 91.8921 13.3018 90.5821 13.3018C90.3021 13.3018 90.0221 13.3418 89.7521 13.4118C89.4821 13.4818 89.2321 13.5918 89.0221 13.7418C88.8121 13.8918 88.6421 14.0718 88.5121 14.3018C88.3821 14.5318 88.3221 14.7918 88.3221 15.1018V22.0918H86.1421Z");
    			attr_dev(path5, "fill", "black");
    			add_location(path5, file, 80, 3, 7074);
    			attr_dev(path6, "d", "M99.7522 22.0918C99.0022 22.0918 98.4422 21.9018 98.0822 21.5218C97.7122 21.1418 97.5322 20.6118 97.5322 19.9318V7.25183H99.7222V20.3018H101.162V22.0918H99.7522Z");
    			attr_dev(path6, "fill", "black");
    			add_location(path6, file, 81, 3, 7624);
    			attr_dev(path7, "d", "M104.102 9.80181C103.652 9.80181 103.312 9.69181 103.112 9.48181C102.902 9.27181 102.802 8.99181 102.802 8.66181V8.31181C102.802 7.98181 102.902 7.70181 103.112 7.49181C103.322 7.28181 103.652 7.17181 104.102 7.17181C104.552 7.17181 104.882 7.28181 105.082 7.49181C105.282 7.70181 105.382 7.98181 105.382 8.31181V8.65181C105.382 8.98181 105.282 9.26181 105.082 9.47181C104.882 9.69181 104.562 9.80181 104.102 9.80181ZM103.002 11.6618H105.192V22.0918H103.002V11.6618Z");
    			attr_dev(path7, "fill", "black");
    			add_location(path7, file, 82, 3, 7814);
    			attr_dev(path8, "d", "M108.052 22.0918V11.6618H110.242V13.3918H110.342C110.572 12.8318 110.912 12.3618 111.372 11.9918C111.832 11.6218 112.462 11.4318 113.262 11.4318C114.332 11.4318 115.162 11.7818 115.762 12.4818C116.352 13.1818 116.652 14.1818 116.652 15.4818V22.0918H114.462V15.7518C114.462 14.1218 113.802 13.3018 112.492 13.3018C112.212 13.3018 111.932 13.3418 111.662 13.4118C111.392 13.4818 111.142 13.5918 110.932 13.7418C110.722 13.8918 110.552 14.0718 110.422 14.3018C110.292 14.5318 110.232 14.7918 110.232 15.1018V22.0918H108.052Z");
    			attr_dev(path8, "fill", "black");
    			add_location(path8, file, 83, 3, 8309);
    			attr_dev(path9, "d", "M123.662 22.3318C122.912 22.3318 122.242 22.2018 121.652 21.9518C121.062 21.7018 120.562 21.3318 120.152 20.8618C119.742 20.3918 119.422 19.8118 119.202 19.1418C118.982 18.4718 118.872 17.7118 118.872 16.8818C118.872 16.0518 118.982 15.3018 119.202 14.6218C119.422 13.9518 119.742 13.3718 120.152 12.9018C120.562 12.4318 121.072 12.0618 121.652 11.8118C122.242 11.5618 122.912 11.4318 123.662 11.4318C124.422 11.4318 125.092 11.5618 125.682 11.8318C126.262 12.1018 126.752 12.4718 127.132 12.9418C127.512 13.4118 127.812 13.9718 128.002 14.5918C128.192 15.2218 128.292 15.8918 128.292 16.6218V17.4418H121.132V17.7818C121.132 18.5818 121.372 19.2318 121.842 19.7418C122.312 20.2518 122.992 20.5118 123.882 20.5118C124.522 20.5118 125.062 20.3718 125.502 20.0918C125.942 19.8118 126.312 19.4318 126.622 18.9518L127.902 20.2218C127.512 20.8618 126.952 21.3818 126.222 21.7618C125.492 22.1418 124.632 22.3318 123.662 22.3318ZM123.662 13.1218C123.292 13.1218 122.942 13.1918 122.632 13.3218C122.322 13.4518 122.052 13.6418 121.832 13.8818C121.612 14.1218 121.442 14.4118 121.322 14.7418C121.202 15.0718 121.142 15.4418 121.142 15.8418V15.9818H125.992V15.7818C125.992 14.9818 125.782 14.3318 125.372 13.8518C124.952 13.3718 124.382 13.1218 123.662 13.1218Z");
    			attr_dev(path9, "fill", "black");
    			add_location(path9, file, 84, 3, 8859);
    			attr_dev(svg, "width", "129");
    			attr_dev(svg, "height", "33");
    			attr_dev(svg, "viewBox", "0 0 129 33");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file, 74, 2, 1845);
    			attr_dev(i0, "class", "i-search i-20");
    			add_location(i0, file, 88, 3, 10175);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "Type a keyword to begin your search");
    			add_location(input, file, 89, 3, 10208);
    			attr_dev(div0, "class", "search-bar");
    			add_location(div0, file, 87, 2, 10147);
    			attr_dev(i1, "class", "i-rocket i-24");
    			add_location(i1, file, 93, 27, 10354);
    			attr_dev(span0, "class", "menu-icon");
    			add_location(span0, file, 93, 3, 10330);
    			attr_dev(i2, "class", "i-filter i-24");
    			add_location(i2, file, 94, 27, 10418);
    			attr_dev(span1, "class", "menu-icon");
    			add_location(span1, file, 94, 3, 10394);
    			attr_dev(i3, "class", "i-notification i-24");
    			add_location(i3, file, 95, 27, 10482);
    			attr_dev(span2, "class", "menu-icon");
    			add_location(span2, file, 95, 3, 10458);
    			attr_dev(i4, "class", "i-switcher i-24");
    			add_location(i4, file, 96, 27, 10552);
    			attr_dev(span3, "class", "menu-icon");
    			add_location(span3, file, 96, 3, 10528);
    			attr_dev(span4, "class", "menu-icon profile-picture");
    			add_location(span4, file, 97, 3, 10594);
    			attr_dev(i5, "class", "i-menu i-24");
    			add_location(i5, file, 99, 34, 10678);
    			attr_dev(span5, "class", "menu-icon mobile");
    			add_location(span5, file, 99, 3, 10647);
    			attr_dev(div1, "class", "menu-icons text-right");
    			add_location(div1, file, 92, 2, 10291);
    			attr_dev(div2, "class", "frame svelte-1s2lye6");
    			add_location(div2, file, 72, 1, 1822);
    			attr_dev(nav, "class", "svelte-1s2lye6");
    			add_location(nav, file, 70, 0, 1814);
    			attr_dev(div3, "class", "frame svelte-1s2lye6");
    			add_location(div3, file, 108, 1, 10777);
    			attr_dev(main, "class", "svelte-1s2lye6");
    			add_location(main, file, 107, 0, 10744);
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
    					listen_dev(svg, "click", /*click_handler*/ ctx[6], false, false, false),
    					listen_dev(main, "scroll", /*handleScroll*/ ctx[5], false, false, false)
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

    			if (switch_value !== (switch_value = /*comp*/ ctx[1].component)) {
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
    					switch_instance.$on("nav", /*handleNav*/ ctx[4]);
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

    	const comps = [
    		{ id: "ehs", component: Frame_home },
    		{ id: "incidents", component: Frame_incidents },
    		{
    			id: "incidents_new",
    			component: Frame_incidents_new
    		},
    		{ id: "queries_new", component: Frame_queries_new },
    		{
    			id: "queries_result",
    			component: Frame_queries_result
    		},
    		{
    			id: "hazard_assessments",
    			component: Frame_hazard_assessments
    		}
    	];

    	let comp = comps[0];
    	let hash = window.location.hash.substring(1);

    	if (hash !== "") {
    		handleNavStr(hash);
    	}

    	let grid = false;

    	function handleNavStr(hash) {
    		$$invalidate(0, tabnav = "");
    		console.log("hash", hash);
    		let hash_arr = hash.split("/");
    		let id = hash_arr[hash_arr.length - 1];
    		let ind = comps.findIndex(el => el.id == id);

    		if (ind >= 0) {
    			$$invalidate(1, comp = comps[ind]);
    			return;
    		} else {
    			$$invalidate(0, tabnav = id);
    			id = hash_arr[hash_arr.length - 2];
    			ind = comps.findIndex(el => el.id == id);

    			if (ind >= 0) {
    				$$invalidate(1, comp = comps[ind]);
    				return;
    			}
    		}

    		$$invalidate(1, comp = comps[0]); //default to first
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
    		Home: Frame_home,
    		Incidents: Frame_incidents,
    		IncidentsNew: Frame_incidents_new,
    		HazardAssessments: Frame_hazard_assessments,
    		QueriesNew: Frame_queries_new,
    		QueriesResult: Frame_queries_result,
    		tabnav,
    		comps,
    		comp,
    		hash,
    		grid,
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

    	return [tabnav, comp, grid, bodyScroll, handleNav, handleScroll, click_handler];
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
