
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
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
    const file$e = "src/Frame_home.svelte";

    // (219:29) 
    function create_if_block_3$2(ctx) {
    	let h2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "My Tasks";
    			add_location(h2, file$e, 219, 8, 10435);
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
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(219:29) ",
    		ctx
    	});

    	return block;
    }

    // (217:31) 
    function create_if_block_2$5(ctx) {
    	let h2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Reports";
    			add_location(h2, file$e, 217, 8, 10380);
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
    		id: create_if_block_2$5.name,
    		type: "if",
    		source: "(217:31) ",
    		ctx
    	});

    	return block;
    }

    // (215:34) 
    function create_if_block_1$8(ctx) {
    	let h2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Dashboards";
    			add_location(h2, file$e, 215, 8, 10320);
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
    		id: create_if_block_1$8.name,
    		type: "if",
    		source: "(215:34) ",
    		ctx
    	});

    	return block;
    }

    // (31:4) {#if tab == 'home'}
    function create_if_block$a(ctx) {
    	let div60;
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
    	let a6;
    	let t12;
    	let a7;
    	let t13;
    	let div11;
    	let div10;
    	let div8;
    	let t14;
    	let b2;
    	let t16;
    	let div9;
    	let a8;
    	let t17;
    	let a9;
    	let t18;
    	let a10;
    	let t19;
    	let a11;
    	let t20;
    	let div15;
    	let div14;
    	let div12;
    	let t21;
    	let b3;
    	let t23;
    	let div13;
    	let a12;
    	let t24;
    	let a13;
    	let t25;
    	let a14;
    	let t26;
    	let a15;
    	let t27;
    	let div19;
    	let div18;
    	let div16;
    	let t28;
    	let b4;
    	let t30;
    	let div17;
    	let a16;
    	let t31;
    	let a17;
    	let t32;
    	let a18;
    	let t33;
    	let a19;
    	let t34;
    	let div23;
    	let div22;
    	let div20;
    	let t35;
    	let b5;
    	let t37;
    	let div21;
    	let a20;
    	let t38;
    	let a21;
    	let t39;
    	let a22;
    	let t40;
    	let a23;
    	let t41;
    	let div27;
    	let div26;
    	let div24;
    	let t42;
    	let b6;
    	let t44;
    	let div25;
    	let a24;
    	let t45;
    	let a25;
    	let t46;
    	let a26;
    	let t47;
    	let a27;
    	let t48;
    	let div31;
    	let div30;
    	let div28;
    	let t49;
    	let b7;
    	let t51;
    	let div29;
    	let a28;
    	let t52;
    	let a29;
    	let t53;
    	let a30;
    	let t54;
    	let a31;
    	let t55;
    	let div35;
    	let div34;
    	let div32;
    	let t56;
    	let b8;
    	let t58;
    	let div33;
    	let a32;
    	let t59;
    	let a33;
    	let t60;
    	let a34;
    	let t61;
    	let a35;
    	let t62;
    	let div39;
    	let div38;
    	let div36;
    	let t63;
    	let b9;
    	let t65;
    	let div37;
    	let a36;
    	let t66;
    	let a37;
    	let t67;
    	let a38;
    	let t68;
    	let a39;
    	let t69;
    	let div43;
    	let div42;
    	let div40;
    	let t70;
    	let b10;
    	let t72;
    	let div41;
    	let a40;
    	let t73;
    	let a41;
    	let t74;
    	let a42;
    	let t75;
    	let a43;
    	let t76;
    	let div47;
    	let div46;
    	let div44;
    	let t77;
    	let b11;
    	let t79;
    	let div45;
    	let a44;
    	let t80;
    	let a45;
    	let t81;
    	let a46;
    	let t82;
    	let a47;
    	let t83;
    	let div51;
    	let div50;
    	let div48;
    	let t84;
    	let b12;
    	let t86;
    	let div49;
    	let a48;
    	let t87;
    	let a49;
    	let t88;
    	let a50;
    	let t89;
    	let a51;
    	let t90;
    	let div55;
    	let div54;
    	let div52;
    	let t91;
    	let b13;
    	let t93;
    	let div53;
    	let a52;
    	let t94;
    	let a53;
    	let t95;
    	let a54;
    	let t96;
    	let a55;
    	let t97;
    	let div59;
    	let div58;
    	let div56;
    	let t98;
    	let b14;
    	let t100;
    	let div57;
    	let a56;
    	let t101;
    	let a57;
    	let t102;
    	let a58;
    	let t103;
    	let a59;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div60 = element("div");
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
    			a6 = element("a");
    			t12 = space();
    			a7 = element("a");
    			t13 = space();
    			div11 = element("div");
    			div10 = element("div");
    			div8 = element("div");
    			t14 = space();
    			b2 = element("b");
    			b2.textContent = "Audit & Inspection";
    			t16 = space();
    			div9 = element("div");
    			a8 = element("a");
    			t17 = space();
    			a9 = element("a");
    			t18 = space();
    			a10 = element("a");
    			t19 = space();
    			a11 = element("a");
    			t20 = space();
    			div15 = element("div");
    			div14 = element("div");
    			div12 = element("div");
    			t21 = space();
    			b3 = element("b");
    			b3.textContent = "Observation";
    			t23 = space();
    			div13 = element("div");
    			a12 = element("a");
    			t24 = space();
    			a13 = element("a");
    			t25 = space();
    			a14 = element("a");
    			t26 = space();
    			a15 = element("a");
    			t27 = space();
    			div19 = element("div");
    			div18 = element("div");
    			div16 = element("div");
    			t28 = space();
    			b4 = element("b");
    			b4.textContent = "Risk Assessment";
    			t30 = space();
    			div17 = element("div");
    			a16 = element("a");
    			t31 = space();
    			a17 = element("a");
    			t32 = space();
    			a18 = element("a");
    			t33 = space();
    			a19 = element("a");
    			t34 = space();
    			div23 = element("div");
    			div22 = element("div");
    			div20 = element("div");
    			t35 = space();
    			b5 = element("b");
    			b5.textContent = "Scheduling";
    			t37 = space();
    			div21 = element("div");
    			a20 = element("a");
    			t38 = space();
    			a21 = element("a");
    			t39 = space();
    			a22 = element("a");
    			t40 = space();
    			a23 = element("a");
    			t41 = space();
    			div27 = element("div");
    			div26 = element("div");
    			div24 = element("div");
    			t42 = space();
    			b6 = element("b");
    			b6.textContent = "Environmental";
    			t44 = space();
    			div25 = element("div");
    			a24 = element("a");
    			t45 = space();
    			a25 = element("a");
    			t46 = space();
    			a26 = element("a");
    			t47 = space();
    			a27 = element("a");
    			t48 = space();
    			div31 = element("div");
    			div30 = element("div");
    			div28 = element("div");
    			t49 = space();
    			b7 = element("b");
    			b7.textContent = "Period Statistics";
    			t51 = space();
    			div29 = element("div");
    			a28 = element("a");
    			t52 = space();
    			a29 = element("a");
    			t53 = space();
    			a30 = element("a");
    			t54 = space();
    			a31 = element("a");
    			t55 = space();
    			div35 = element("div");
    			div34 = element("div");
    			div32 = element("div");
    			t56 = space();
    			b8 = element("b");
    			b8.textContent = "Register";
    			t58 = space();
    			div33 = element("div");
    			a32 = element("a");
    			t59 = space();
    			a33 = element("a");
    			t60 = space();
    			a34 = element("a");
    			t61 = space();
    			a35 = element("a");
    			t62 = space();
    			div39 = element("div");
    			div38 = element("div");
    			div36 = element("div");
    			t63 = space();
    			b9 = element("b");
    			b9.textContent = "Adavanced RCA";
    			t65 = space();
    			div37 = element("div");
    			a36 = element("a");
    			t66 = space();
    			a37 = element("a");
    			t67 = space();
    			a38 = element("a");
    			t68 = space();
    			a39 = element("a");
    			t69 = space();
    			div43 = element("div");
    			div42 = element("div");
    			div40 = element("div");
    			t70 = space();
    			b10 = element("b");
    			b10.textContent = "Document";
    			t72 = space();
    			div41 = element("div");
    			a40 = element("a");
    			t73 = space();
    			a41 = element("a");
    			t74 = space();
    			a42 = element("a");
    			t75 = space();
    			a43 = element("a");
    			t76 = space();
    			div47 = element("div");
    			div46 = element("div");
    			div44 = element("div");
    			t77 = space();
    			b11 = element("b");
    			b11.textContent = "COVID-19 Tracker";
    			t79 = space();
    			div45 = element("div");
    			a44 = element("a");
    			t80 = space();
    			a45 = element("a");
    			t81 = space();
    			a46 = element("a");
    			t82 = space();
    			a47 = element("a");
    			t83 = space();
    			div51 = element("div");
    			div50 = element("div");
    			div48 = element("div");
    			t84 = space();
    			b12 = element("b");
    			b12.textContent = "Point of Work";
    			t86 = space();
    			div49 = element("div");
    			a48 = element("a");
    			t87 = space();
    			a49 = element("a");
    			t88 = space();
    			a50 = element("a");
    			t89 = space();
    			a51 = element("a");
    			t90 = space();
    			div55 = element("div");
    			div54 = element("div");
    			div52 = element("div");
    			t91 = space();
    			b13 = element("b");
    			b13.textContent = "Lost Time";
    			t93 = space();
    			div53 = element("div");
    			a52 = element("a");
    			t94 = space();
    			a53 = element("a");
    			t95 = space();
    			a54 = element("a");
    			t96 = space();
    			a55 = element("a");
    			t97 = space();
    			div59 = element("div");
    			div58 = element("div");
    			div56 = element("div");
    			t98 = space();
    			b14 = element("b");
    			b14.textContent = "Administration";
    			t100 = space();
    			div57 = element("div");
    			a56 = element("a");
    			t101 = space();
    			a57 = element("a");
    			t102 = space();
    			a58 = element("a");
    			t103 = space();
    			a59 = element("a");
    			attr_dev(div0, "class", "icon");
    			set_style(div0, "background-image", "url(./images/ehs_svgs_clean/incidents.svg)");
    			add_location(div0, file$e, 34, 20, 1248);
    			add_location(b0, file$e, 35, 20, 1361);
    			attr_dev(a0, "href", "#ehs/incidents/incidents_new");
    			attr_dev(a0, "class", "add");
    			add_location(a0, file$e, 37, 24, 1442);
    			attr_dev(a1, "href", "#ehs/incidents/queries_new");
    			attr_dev(a1, "class", "filter");
    			add_location(a1, file$e, 38, 24, 1582);
    			attr_dev(a2, "href", "#ehs/incidents/summary");
    			attr_dev(a2, "class", "summary");
    			add_location(a2, file$e, 39, 24, 1721);
    			attr_dev(a3, "href", "#ehs/incidents/admin");
    			attr_dev(a3, "class", "tool");
    			add_location(a3, file$e, 40, 24, 1863);
    			attr_dev(div1, "class", "tools");
    			add_location(div1, file$e, 36, 20, 1398);
    			attr_dev(div2, "class", "tile");
    			add_location(div2, file$e, 33, 16, 1117);
    			attr_dev(div3, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div3, file$e, 32, 12, 1055);
    			attr_dev(div4, "class", "icon");
    			set_style(div4, "background-image", "url(./images/ehs_svgs_clean/actions.svg)");
    			add_location(div4, file$e, 46, 20, 2156);
    			add_location(b1, file$e, 47, 20, 2267);
    			attr_dev(a4, "href", "#incidents/incidents_new");
    			attr_dev(a4, "class", "add");
    			add_location(a4, file$e, 49, 24, 2346);
    			attr_dev(a5, "href", "queries_new");
    			attr_dev(a5, "class", "filter");
    			add_location(a5, file$e, 50, 24, 2423);
    			attr_dev(a6, "href", "./");
    			attr_dev(a6, "class", "summary");
    			add_location(a6, file$e, 51, 24, 2490);
    			attr_dev(a7, "href", "./");
    			attr_dev(a7, "class", "tool");
    			add_location(a7, file$e, 52, 24, 2549);
    			attr_dev(div5, "class", "tools");
    			add_location(div5, file$e, 48, 20, 2302);
    			attr_dev(div6, "class", "tile");
    			add_location(div6, file$e, 45, 16, 2117);
    			attr_dev(div7, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div7, file$e, 44, 12, 2055);
    			attr_dev(div8, "class", "icon");
    			set_style(div8, "background-image", "url(./images/ehs_svgs_clean/audits.svg)");
    			add_location(div8, file$e, 58, 20, 2763);
    			add_location(b2, file$e, 59, 20, 2873);
    			attr_dev(a8, "href", "./");
    			attr_dev(a8, "class", "add");
    			add_location(a8, file$e, 61, 24, 2963);
    			attr_dev(a9, "href", "./");
    			attr_dev(a9, "class", "filter");
    			add_location(a9, file$e, 62, 24, 3018);
    			attr_dev(a10, "href", "./");
    			attr_dev(a10, "class", "summary");
    			add_location(a10, file$e, 63, 24, 3076);
    			attr_dev(a11, "href", "./");
    			attr_dev(a11, "class", "tool");
    			add_location(a11, file$e, 64, 24, 3135);
    			attr_dev(div9, "class", "tools");
    			add_location(div9, file$e, 60, 20, 2919);
    			attr_dev(div10, "class", "tile");
    			add_location(div10, file$e, 57, 16, 2724);
    			attr_dev(div11, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div11, file$e, 56, 12, 2662);
    			attr_dev(div12, "class", "icon");
    			set_style(div12, "background-image", "url(./images/ehs_svgs_clean/observations.svg)");
    			add_location(div12, file$e, 70, 20, 3349);
    			add_location(b3, file$e, 71, 20, 3465);
    			attr_dev(a12, "href", "./");
    			attr_dev(a12, "class", "add");
    			add_location(a12, file$e, 73, 24, 3548);
    			attr_dev(a13, "href", "./");
    			attr_dev(a13, "class", "filter");
    			add_location(a13, file$e, 74, 24, 3603);
    			attr_dev(a14, "href", "./");
    			attr_dev(a14, "class", "summary");
    			add_location(a14, file$e, 75, 24, 3661);
    			attr_dev(a15, "href", "./");
    			attr_dev(a15, "class", "tool");
    			add_location(a15, file$e, 76, 24, 3720);
    			attr_dev(div13, "class", "tools");
    			add_location(div13, file$e, 72, 20, 3504);
    			attr_dev(div14, "class", "tile");
    			add_location(div14, file$e, 69, 16, 3310);
    			attr_dev(div15, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div15, file$e, 68, 12, 3248);
    			attr_dev(div16, "class", "icon");
    			set_style(div16, "background-image", "url(./images/ehs_svgs_clean/risk_assessment.svg)");
    			add_location(div16, file$e, 82, 20, 3934);
    			add_location(b4, file$e, 83, 20, 4053);
    			attr_dev(a16, "href", "./");
    			attr_dev(a16, "class", "add");
    			add_location(a16, file$e, 85, 24, 4140);
    			attr_dev(a17, "href", "./");
    			attr_dev(a17, "class", "filter");
    			add_location(a17, file$e, 86, 24, 4195);
    			attr_dev(a18, "href", "./");
    			attr_dev(a18, "class", "summary");
    			add_location(a18, file$e, 87, 24, 4253);
    			attr_dev(a19, "href", "./");
    			attr_dev(a19, "class", "tool");
    			add_location(a19, file$e, 88, 24, 4312);
    			attr_dev(div17, "class", "tools");
    			add_location(div17, file$e, 84, 20, 4096);
    			attr_dev(div18, "class", "tile");
    			add_location(div18, file$e, 81, 16, 3895);
    			attr_dev(div19, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div19, file$e, 80, 12, 3833);
    			attr_dev(div20, "class", "icon");
    			set_style(div20, "background-image", "url(./images/ehs_svgs_clean/scheduling.svg)");
    			add_location(div20, file$e, 94, 20, 4526);
    			add_location(b5, file$e, 95, 20, 4640);
    			attr_dev(a20, "href", "./");
    			attr_dev(a20, "class", "add");
    			add_location(a20, file$e, 97, 24, 4722);
    			attr_dev(a21, "href", "./");
    			attr_dev(a21, "class", "filter");
    			add_location(a21, file$e, 98, 24, 4777);
    			attr_dev(a22, "href", "./");
    			attr_dev(a22, "class", "summary");
    			add_location(a22, file$e, 99, 24, 4835);
    			attr_dev(a23, "href", "./");
    			attr_dev(a23, "class", "tool");
    			add_location(a23, file$e, 100, 24, 4894);
    			attr_dev(div21, "class", "tools");
    			add_location(div21, file$e, 96, 20, 4678);
    			attr_dev(div22, "class", "tile");
    			add_location(div22, file$e, 93, 16, 4487);
    			attr_dev(div23, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div23, file$e, 92, 12, 4425);
    			attr_dev(div24, "class", "icon");
    			set_style(div24, "background-image", "url(./images/ehs_svgs_clean/epr.svg)");
    			add_location(div24, file$e, 106, 20, 5108);
    			add_location(b6, file$e, 107, 20, 5215);
    			attr_dev(a24, "href", "./");
    			attr_dev(a24, "class", "add");
    			add_location(a24, file$e, 109, 24, 5300);
    			attr_dev(a25, "href", "./");
    			attr_dev(a25, "class", "filter");
    			add_location(a25, file$e, 110, 24, 5355);
    			attr_dev(a26, "href", "./");
    			attr_dev(a26, "class", "summary");
    			add_location(a26, file$e, 111, 24, 5413);
    			attr_dev(a27, "href", "./");
    			attr_dev(a27, "class", "tool");
    			add_location(a27, file$e, 112, 24, 5472);
    			attr_dev(div25, "class", "tools");
    			add_location(div25, file$e, 108, 20, 5256);
    			attr_dev(div26, "class", "tile");
    			add_location(div26, file$e, 105, 16, 5069);
    			attr_dev(div27, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div27, file$e, 104, 12, 5007);
    			attr_dev(div28, "class", "icon");
    			set_style(div28, "background-image", "url(./images/ehs_svgs_clean/period_statistics.svg)");
    			add_location(div28, file$e, 118, 20, 5686);
    			add_location(b7, file$e, 119, 20, 5807);
    			attr_dev(a28, "href", "./");
    			attr_dev(a28, "class", "add");
    			add_location(a28, file$e, 121, 24, 5896);
    			attr_dev(a29, "href", "./");
    			attr_dev(a29, "class", "filter");
    			add_location(a29, file$e, 122, 24, 5951);
    			attr_dev(a30, "href", "./");
    			attr_dev(a30, "class", "summary");
    			add_location(a30, file$e, 123, 24, 6009);
    			attr_dev(a31, "href", "./");
    			attr_dev(a31, "class", "tool");
    			add_location(a31, file$e, 124, 24, 6068);
    			attr_dev(div29, "class", "tools");
    			add_location(div29, file$e, 120, 20, 5852);
    			attr_dev(div30, "class", "tile");
    			add_location(div30, file$e, 117, 16, 5647);
    			attr_dev(div31, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div31, file$e, 116, 12, 5585);
    			attr_dev(div32, "class", "icon");
    			set_style(div32, "background-image", "url(./images/ehs_svgs_clean/register.svg)");
    			add_location(div32, file$e, 130, 20, 6282);
    			add_location(b8, file$e, 131, 20, 6394);
    			attr_dev(a32, "href", "./");
    			attr_dev(a32, "class", "add");
    			add_location(a32, file$e, 133, 24, 6474);
    			attr_dev(a33, "href", "./");
    			attr_dev(a33, "class", "filter");
    			add_location(a33, file$e, 134, 24, 6529);
    			attr_dev(a34, "href", "./");
    			attr_dev(a34, "class", "summary");
    			add_location(a34, file$e, 135, 24, 6587);
    			attr_dev(a35, "href", "./");
    			attr_dev(a35, "class", "tool");
    			add_location(a35, file$e, 136, 24, 6646);
    			attr_dev(div33, "class", "tools");
    			add_location(div33, file$e, 132, 20, 6430);
    			attr_dev(div34, "class", "tile");
    			add_location(div34, file$e, 129, 16, 6243);
    			attr_dev(div35, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div35, file$e, 128, 12, 6181);
    			attr_dev(div36, "class", "icon");
    			set_style(div36, "background-image", "url(./images/ehs_svgs_clean/advanced_rca.svg)");
    			add_location(div36, file$e, 142, 20, 6860);
    			add_location(b9, file$e, 143, 20, 6976);
    			attr_dev(a36, "href", "./");
    			attr_dev(a36, "class", "add");
    			add_location(a36, file$e, 145, 24, 7061);
    			attr_dev(a37, "href", "./");
    			attr_dev(a37, "class", "filter");
    			add_location(a37, file$e, 146, 24, 7116);
    			attr_dev(a38, "href", "./");
    			attr_dev(a38, "class", "summary");
    			add_location(a38, file$e, 147, 24, 7174);
    			attr_dev(a39, "href", "./");
    			attr_dev(a39, "class", "tool");
    			add_location(a39, file$e, 148, 24, 7233);
    			attr_dev(div37, "class", "tools");
    			add_location(div37, file$e, 144, 20, 7017);
    			attr_dev(div38, "class", "tile");
    			add_location(div38, file$e, 141, 16, 6821);
    			attr_dev(div39, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div39, file$e, 140, 12, 6759);
    			attr_dev(div40, "class", "icon");
    			set_style(div40, "background-image", "url(./images/ehs_svgs_clean/documents.svg)");
    			add_location(div40, file$e, 154, 20, 7447);
    			add_location(b10, file$e, 155, 20, 7560);
    			attr_dev(a40, "href", "./");
    			attr_dev(a40, "class", "add");
    			add_location(a40, file$e, 157, 24, 7640);
    			attr_dev(a41, "href", "./");
    			attr_dev(a41, "class", "filter");
    			add_location(a41, file$e, 158, 24, 7695);
    			attr_dev(a42, "href", "./");
    			attr_dev(a42, "class", "summary");
    			add_location(a42, file$e, 159, 24, 7753);
    			attr_dev(a43, "href", "./");
    			attr_dev(a43, "class", "tool");
    			add_location(a43, file$e, 160, 24, 7812);
    			attr_dev(div41, "class", "tools");
    			add_location(div41, file$e, 156, 20, 7596);
    			attr_dev(div42, "class", "tile");
    			add_location(div42, file$e, 153, 16, 7408);
    			attr_dev(div43, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div43, file$e, 152, 12, 7346);
    			attr_dev(div44, "class", "icon");
    			set_style(div44, "background-image", "url(./images/ehs_svgs_clean/tracker.svg)");
    			add_location(div44, file$e, 166, 20, 8026);
    			add_location(b11, file$e, 167, 20, 8137);
    			attr_dev(a44, "href", "./");
    			attr_dev(a44, "class", "add");
    			add_location(a44, file$e, 169, 24, 8225);
    			attr_dev(a45, "href", "./");
    			attr_dev(a45, "class", "filter");
    			add_location(a45, file$e, 170, 24, 8280);
    			attr_dev(a46, "href", "./");
    			attr_dev(a46, "class", "summary");
    			add_location(a46, file$e, 171, 24, 8338);
    			attr_dev(a47, "href", "./");
    			attr_dev(a47, "class", "tool");
    			add_location(a47, file$e, 172, 24, 8397);
    			attr_dev(div45, "class", "tools");
    			add_location(div45, file$e, 168, 20, 8181);
    			attr_dev(div46, "class", "tile");
    			add_location(div46, file$e, 165, 16, 7987);
    			attr_dev(div47, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div47, file$e, 164, 12, 7925);
    			attr_dev(div48, "class", "icon");
    			set_style(div48, "background-image", "url(./images/ehs_svgs_clean/pow_ra.svg)");
    			add_location(div48, file$e, 178, 20, 8611);
    			add_location(b12, file$e, 179, 20, 8721);
    			attr_dev(a48, "href", "./");
    			attr_dev(a48, "class", "add");
    			add_location(a48, file$e, 181, 24, 8806);
    			attr_dev(a49, "href", "./");
    			attr_dev(a49, "class", "filter");
    			add_location(a49, file$e, 182, 24, 8861);
    			attr_dev(a50, "href", "./");
    			attr_dev(a50, "class", "summary");
    			add_location(a50, file$e, 183, 24, 8919);
    			attr_dev(a51, "href", "./");
    			attr_dev(a51, "class", "tool");
    			add_location(a51, file$e, 184, 24, 8978);
    			attr_dev(div49, "class", "tools");
    			add_location(div49, file$e, 180, 20, 8762);
    			attr_dev(div50, "class", "tile");
    			add_location(div50, file$e, 177, 16, 8572);
    			attr_dev(div51, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div51, file$e, 176, 12, 8510);
    			attr_dev(div52, "class", "icon");
    			set_style(div52, "background-image", "url(./images/ehs_svgs_clean/lost_time.svg)");
    			add_location(div52, file$e, 190, 20, 9192);
    			add_location(b13, file$e, 191, 20, 9305);
    			attr_dev(a52, "href", "./");
    			attr_dev(a52, "class", "add");
    			add_location(a52, file$e, 193, 24, 9386);
    			attr_dev(a53, "href", "./");
    			attr_dev(a53, "class", "filter");
    			add_location(a53, file$e, 194, 24, 9441);
    			attr_dev(a54, "href", "./");
    			attr_dev(a54, "class", "summary");
    			add_location(a54, file$e, 195, 24, 9499);
    			attr_dev(a55, "href", "./");
    			attr_dev(a55, "class", "tool");
    			add_location(a55, file$e, 196, 24, 9558);
    			attr_dev(div53, "class", "tools");
    			add_location(div53, file$e, 192, 20, 9342);
    			attr_dev(div54, "class", "tile");
    			add_location(div54, file$e, 189, 16, 9153);
    			attr_dev(div55, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div55, file$e, 188, 12, 9091);
    			attr_dev(div56, "class", "icon");
    			set_style(div56, "background-image", "url(./images/ehs_svgs_clean/administration.svg)");
    			add_location(div56, file$e, 202, 20, 9772);
    			add_location(b14, file$e, 203, 20, 9890);
    			attr_dev(a56, "href", "./");
    			attr_dev(a56, "class", "add");
    			add_location(a56, file$e, 205, 24, 9976);
    			attr_dev(a57, "href", "./");
    			attr_dev(a57, "class", "filter");
    			add_location(a57, file$e, 206, 24, 10031);
    			attr_dev(a58, "href", "./");
    			attr_dev(a58, "class", "summary");
    			add_location(a58, file$e, 207, 24, 10089);
    			attr_dev(a59, "href", "./");
    			attr_dev(a59, "class", "tool");
    			add_location(a59, file$e, 208, 24, 10148);
    			attr_dev(div57, "class", "tools");
    			add_location(div57, file$e, 204, 20, 9932);
    			attr_dev(div58, "class", "tile");
    			add_location(div58, file$e, 201, 16, 9733);
    			attr_dev(div59, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div59, file$e, 200, 12, 9671);
    			attr_dev(div60, "class", "row");
    			add_location(div60, file$e, 31, 8, 1025);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div60, anchor);
    			append_dev(div60, div3);
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
    			append_dev(div60, t6);
    			append_dev(div60, div7);
    			append_dev(div7, div6);
    			append_dev(div6, div4);
    			append_dev(div6, t7);
    			append_dev(div6, b1);
    			append_dev(div6, t9);
    			append_dev(div6, div5);
    			append_dev(div5, a4);
    			append_dev(div5, t10);
    			append_dev(div5, a5);
    			append_dev(div5, t11);
    			append_dev(div5, a6);
    			append_dev(div5, t12);
    			append_dev(div5, a7);
    			append_dev(div60, t13);
    			append_dev(div60, div11);
    			append_dev(div11, div10);
    			append_dev(div10, div8);
    			append_dev(div10, t14);
    			append_dev(div10, b2);
    			append_dev(div10, t16);
    			append_dev(div10, div9);
    			append_dev(div9, a8);
    			append_dev(div9, t17);
    			append_dev(div9, a9);
    			append_dev(div9, t18);
    			append_dev(div9, a10);
    			append_dev(div9, t19);
    			append_dev(div9, a11);
    			append_dev(div60, t20);
    			append_dev(div60, div15);
    			append_dev(div15, div14);
    			append_dev(div14, div12);
    			append_dev(div14, t21);
    			append_dev(div14, b3);
    			append_dev(div14, t23);
    			append_dev(div14, div13);
    			append_dev(div13, a12);
    			append_dev(div13, t24);
    			append_dev(div13, a13);
    			append_dev(div13, t25);
    			append_dev(div13, a14);
    			append_dev(div13, t26);
    			append_dev(div13, a15);
    			append_dev(div60, t27);
    			append_dev(div60, div19);
    			append_dev(div19, div18);
    			append_dev(div18, div16);
    			append_dev(div18, t28);
    			append_dev(div18, b4);
    			append_dev(div18, t30);
    			append_dev(div18, div17);
    			append_dev(div17, a16);
    			append_dev(div17, t31);
    			append_dev(div17, a17);
    			append_dev(div17, t32);
    			append_dev(div17, a18);
    			append_dev(div17, t33);
    			append_dev(div17, a19);
    			append_dev(div60, t34);
    			append_dev(div60, div23);
    			append_dev(div23, div22);
    			append_dev(div22, div20);
    			append_dev(div22, t35);
    			append_dev(div22, b5);
    			append_dev(div22, t37);
    			append_dev(div22, div21);
    			append_dev(div21, a20);
    			append_dev(div21, t38);
    			append_dev(div21, a21);
    			append_dev(div21, t39);
    			append_dev(div21, a22);
    			append_dev(div21, t40);
    			append_dev(div21, a23);
    			append_dev(div60, t41);
    			append_dev(div60, div27);
    			append_dev(div27, div26);
    			append_dev(div26, div24);
    			append_dev(div26, t42);
    			append_dev(div26, b6);
    			append_dev(div26, t44);
    			append_dev(div26, div25);
    			append_dev(div25, a24);
    			append_dev(div25, t45);
    			append_dev(div25, a25);
    			append_dev(div25, t46);
    			append_dev(div25, a26);
    			append_dev(div25, t47);
    			append_dev(div25, a27);
    			append_dev(div60, t48);
    			append_dev(div60, div31);
    			append_dev(div31, div30);
    			append_dev(div30, div28);
    			append_dev(div30, t49);
    			append_dev(div30, b7);
    			append_dev(div30, t51);
    			append_dev(div30, div29);
    			append_dev(div29, a28);
    			append_dev(div29, t52);
    			append_dev(div29, a29);
    			append_dev(div29, t53);
    			append_dev(div29, a30);
    			append_dev(div29, t54);
    			append_dev(div29, a31);
    			append_dev(div60, t55);
    			append_dev(div60, div35);
    			append_dev(div35, div34);
    			append_dev(div34, div32);
    			append_dev(div34, t56);
    			append_dev(div34, b8);
    			append_dev(div34, t58);
    			append_dev(div34, div33);
    			append_dev(div33, a32);
    			append_dev(div33, t59);
    			append_dev(div33, a33);
    			append_dev(div33, t60);
    			append_dev(div33, a34);
    			append_dev(div33, t61);
    			append_dev(div33, a35);
    			append_dev(div60, t62);
    			append_dev(div60, div39);
    			append_dev(div39, div38);
    			append_dev(div38, div36);
    			append_dev(div38, t63);
    			append_dev(div38, b9);
    			append_dev(div38, t65);
    			append_dev(div38, div37);
    			append_dev(div37, a36);
    			append_dev(div37, t66);
    			append_dev(div37, a37);
    			append_dev(div37, t67);
    			append_dev(div37, a38);
    			append_dev(div37, t68);
    			append_dev(div37, a39);
    			append_dev(div60, t69);
    			append_dev(div60, div43);
    			append_dev(div43, div42);
    			append_dev(div42, div40);
    			append_dev(div42, t70);
    			append_dev(div42, b10);
    			append_dev(div42, t72);
    			append_dev(div42, div41);
    			append_dev(div41, a40);
    			append_dev(div41, t73);
    			append_dev(div41, a41);
    			append_dev(div41, t74);
    			append_dev(div41, a42);
    			append_dev(div41, t75);
    			append_dev(div41, a43);
    			append_dev(div60, t76);
    			append_dev(div60, div47);
    			append_dev(div47, div46);
    			append_dev(div46, div44);
    			append_dev(div46, t77);
    			append_dev(div46, b11);
    			append_dev(div46, t79);
    			append_dev(div46, div45);
    			append_dev(div45, a44);
    			append_dev(div45, t80);
    			append_dev(div45, a45);
    			append_dev(div45, t81);
    			append_dev(div45, a46);
    			append_dev(div45, t82);
    			append_dev(div45, a47);
    			append_dev(div60, t83);
    			append_dev(div60, div51);
    			append_dev(div51, div50);
    			append_dev(div50, div48);
    			append_dev(div50, t84);
    			append_dev(div50, b12);
    			append_dev(div50, t86);
    			append_dev(div50, div49);
    			append_dev(div49, a48);
    			append_dev(div49, t87);
    			append_dev(div49, a49);
    			append_dev(div49, t88);
    			append_dev(div49, a50);
    			append_dev(div49, t89);
    			append_dev(div49, a51);
    			append_dev(div60, t90);
    			append_dev(div60, div55);
    			append_dev(div55, div54);
    			append_dev(div54, div52);
    			append_dev(div54, t91);
    			append_dev(div54, b13);
    			append_dev(div54, t93);
    			append_dev(div54, div53);
    			append_dev(div53, a52);
    			append_dev(div53, t94);
    			append_dev(div53, a53);
    			append_dev(div53, t95);
    			append_dev(div53, a54);
    			append_dev(div53, t96);
    			append_dev(div53, a55);
    			append_dev(div60, t97);
    			append_dev(div60, div59);
    			append_dev(div59, div58);
    			append_dev(div58, div56);
    			append_dev(div58, t98);
    			append_dev(div58, b14);
    			append_dev(div58, t100);
    			append_dev(div58, div57);
    			append_dev(div57, a56);
    			append_dev(div57, t101);
    			append_dev(div57, a57);
    			append_dev(div57, t102);
    			append_dev(div57, a58);
    			append_dev(div57, t103);
    			append_dev(div57, a59);

    			if (!mounted) {
    				dispose = [
    					listen_dev(a0, "click", stop_propagation(/*click_handler_4*/ ctx[6]), false, false, true),
    					listen_dev(a1, "click", stop_propagation(/*click_handler_5*/ ctx[7]), false, false, true),
    					listen_dev(a2, "click", stop_propagation(/*click_handler_6*/ ctx[8]), false, false, true),
    					listen_dev(a3, "click", stop_propagation(/*click_handler_7*/ ctx[9]), false, false, true),
    					listen_dev(div2, "click", prevent_default(/*click_handler_8*/ ctx[10]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div60);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$a.name,
    		type: "if",
    		source: "(31:4) {#if tab == 'home'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
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
    		if (/*tab*/ ctx[0] == "home") return create_if_block$a;
    		if (/*tab*/ ctx[0] == "dashboards") return create_if_block_1$8;
    		if (/*tab*/ ctx[0] == "reports") return create_if_block_2$5;
    		if (/*tab*/ ctx[0] == "tasks") return create_if_block_3$2;
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
    			add_location(a0, file$e, 15, 20, 320);
    			add_location(li0, file$e, 15, 16, 316);
    			add_location(li1, file$e, 16, 16, 367);
    			attr_dev(ul0, "class", "breadcrumb");
    			add_location(ul0, file$e, 14, 12, 276);
    			attr_dev(div0, "class", "col12");
    			add_location(div0, file$e, 13, 8, 244);
    			attr_dev(div1, "class", "row sticky");
    			add_location(div1, file$e, 12, 4, 211);
    			attr_dev(a1, "href", "/");
    			toggle_class(a1, "active", /*tab*/ ctx[0] == "home");
    			add_location(a1, file$e, 24, 12, 472);
    			add_location(li2, file$e, 24, 8, 468);
    			attr_dev(a2, "href", "/");
    			toggle_class(a2, "active", /*tab*/ ctx[0] == "dashboards");
    			add_location(a2, file$e, 25, 12, 594);
    			add_location(li3, file$e, 25, 8, 590);
    			attr_dev(a3, "href", "/");
    			toggle_class(a3, "active", /*tab*/ ctx[0] == "reports");
    			add_location(a3, file$e, 26, 12, 735);
    			add_location(li4, file$e, 26, 8, 731);
    			attr_dev(a4, "href", "/");
    			toggle_class(a4, "active", /*tab*/ ctx[0] == "tasks");
    			add_location(a4, file$e, 27, 12, 866);
    			add_location(li5, file$e, 27, 8, 862);
    			attr_dev(ul1, "class", "tabs");
    			add_location(ul1, file$e, 23, 4, 442);
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
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
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
    		click_handler_8
    	];
    }

    class Frame_home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Frame_home",
    			options,
    			id: create_fragment$e.name
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

    /* src/components/form/InputSelect.svelte generated by Svelte v3.35.0 */

    const file$d = "src/components/form/InputSelect.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

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
    			add_location(label, file$d, 7, 8, 89);
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
    function create_if_block$9(ctx) {
    	let p;
    	let t_value = /*f*/ ctx[0].hint + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			add_location(p, file$d, 10, 8, 162);
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
    		source: "(10:4) {#if f.hint}",
    		ctx
    	});

    	return block;
    }

    // (14:8) {#each f.options as option}
    function create_each_block$5(ctx) {
    	let option;
    	let t_value = /*option*/ ctx[2].text + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*option*/ ctx[2].value;
    			option.value = option.__value;
    			add_location(option, file$d, 14, 12, 293);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*f*/ 1 && t_value !== (t_value = /*option*/ ctx[2].text + "")) set_data_dev(t, t_value);

    			if (dirty & /*f*/ 1 && option_value_value !== (option_value_value = /*option*/ ctx[2].value)) {
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
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(14:8) {#each f.options as option}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let select;
    	let mounted;
    	let dispose;
    	let if_block0 = /*f*/ ctx[0].label && create_if_block_1$7(ctx);
    	let if_block1 = /*f*/ ctx[0].hint && create_if_block$9(ctx);
    	let each_value = /*f*/ ctx[0].options;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
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
    			if (/*f*/ ctx[0].answer === void 0) add_render_callback(() => /*select_change_handler*/ ctx[1].call(select));
    			add_location(select, file$d, 12, 4, 192);
    			attr_dev(div, "class", "form-item");
    			add_location(div, file$d, 5, 0, 39);
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
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[1]);
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
    					if_block1 = create_if_block$9(ctx);
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
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
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
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("InputSelect", slots, []);
    	let { f } = $$props;
    	const writable_props = ["f"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<InputSelect> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		f.answer = select_value(this);
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

    	return [f, select_change_handler];
    }

    class InputSelect extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { f: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InputSelect",
    			options,
    			id: create_fragment$d.name
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
    }

    /* src/components/form/InputText.svelte generated by Svelte v3.35.0 */

    const file$c = "src/components/form/InputText.svelte";

    // (7:4) {#if f.label}
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
    			add_location(label, file$c, 7, 8, 89);
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
    		source: "(7:4) {#if f.label}",
    		ctx
    	});

    	return block;
    }

    // (10:4) {#if f.hint}
    function create_if_block$8(ctx) {
    	let p;
    	let t_value = /*f*/ ctx[0].hint + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			add_location(p, file$c, 10, 8, 162);
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
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(10:4) {#if f.hint}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let input;
    	let input_id_value;
    	let input_placeholder_value;
    	let mounted;
    	let dispose;
    	let if_block0 = /*f*/ ctx[0].label && create_if_block_1$6(ctx);
    	let if_block1 = /*f*/ ctx[0].hint && create_if_block$8(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			input = element("input");
    			attr_dev(input, "id", input_id_value = /*f*/ ctx[0].id);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", input_placeholder_value = /*f*/ ctx[0].placeholder ? /*f*/ ctx[0].placeholder : "");
    			attr_dev(input, "class", "form-control");
    			add_location(input, file$c, 12, 4, 192);
    			attr_dev(div, "class", "form-item");
    			add_location(div, file$c, 5, 0, 39);
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
    					if_block1 = create_if_block$8(ctx);
    					if_block1.c();
    					if_block1.m(div, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*f*/ 1 && input_id_value !== (input_id_value = /*f*/ ctx[0].id)) {
    				attr_dev(input, "id", input_id_value);
    			}

    			if (dirty & /*f*/ 1 && input_placeholder_value !== (input_placeholder_value = /*f*/ ctx[0].placeholder ? /*f*/ ctx[0].placeholder : "")) {
    				attr_dev(input, "placeholder", input_placeholder_value);
    			}

    			if (dirty & /*f*/ 1 && input.value !== /*f*/ ctx[0].answer) {
    				set_input_value(input, /*f*/ ctx[0].answer);
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
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
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

    	return [f, input_input_handler];
    }

    class InputText extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { f: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InputText",
    			options,
    			id: create_fragment$c.name
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
    const file$b = "src/components/form/InputMultiItem.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    // (26:4) {#if f.selectable}
    function create_if_block_1$5(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*f*/ ctx[0].selected) return create_if_block_2$4;
    		return create_else_block$4;
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
    		id: create_if_block_1$5.name,
    		type: "if",
    		source: "(26:4) {#if f.selectable}",
    		ctx
    	});

    	return block;
    }

    // (29:8) {:else}
    function create_else_block$4(ctx) {
    	let i;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "i-checkbox i-20");
    			add_location(i, file$b, 29, 12, 691);
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
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(29:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (27:8) {#if f.selected}
    function create_if_block_2$4(ctx) {
    	let i;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "i-checkbox-selected i-20");
    			add_location(i, file$b, 27, 12, 597);
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
    		id: create_if_block_2$4.name,
    		type: "if",
    		source: "(27:8) {#if f.selected}",
    		ctx
    	});

    	return block;
    }

    // (36:0) {#if f.children}
    function create_if_block$7(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*f*/ ctx[0].children;
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
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
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
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(36:0) {#if f.children}",
    		ctx
    	});

    	return block;
    }

    // (37:4) {#each f.children as f}
    function create_each_block$4(ctx) {
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
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(37:4) {#each f.children as f}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let div;
    	let t0;
    	let t1_value = /*f*/ ctx[0].value + "";
    	let t1;
    	let div_class_value;
    	let t2;
    	let if_block1_anchor;
    	let current;
    	let if_block0 = /*f*/ ctx[0].selectable && create_if_block_1$5(ctx);
    	let if_block1 = /*f*/ ctx[0].children && create_if_block$7(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			attr_dev(div, "class", div_class_value = "multi-item indent" + /*indent_class*/ ctx[2] + " svelte-1bmql47");
    			add_location(div, file$b, 24, 0, 490);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			insert_dev(target, t2, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*f*/ ctx[0].selectable) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$5(ctx);
    					if_block0.c();
    					if_block0.m(div, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if ((!current || dirty & /*f*/ 1) && t1_value !== (t1_value = /*f*/ ctx[0].value + "")) set_data_dev(t1, t1_value);

    			if (!current || dirty & /*indent_class*/ 4 && div_class_value !== (div_class_value = "multi-item indent" + /*indent_class*/ ctx[2] + " svelte-1bmql47")) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (/*f*/ ctx[0].children) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*f*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$7(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
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
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (detaching) detach_dev(t2);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
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

    	return [f, indent, indent_class, toggle_item, handleItemUpdate];
    }

    class InputMultiItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { f: 0, indent: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InputMultiItem",
    			options,
    			id: create_fragment$b.name
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

    const { console: console_1$4 } = globals;
    const file$a = "src/components/form/InputMulti.svelte";

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    function get_each_context_2$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[25] = list[i];
    	return child_ctx;
    }

    // (87:4) {#if f.label}
    function create_if_block_8(ctx) {
    	let label;
    	let t_value = /*f*/ ctx[0].label + "";
    	let t;
    	let label_for_value;

    	const block = {
    		c: function create() {
    			label = element("label");
    			t = text(t_value);
    			attr_dev(label, "for", label_for_value = /*f*/ ctx[0].id);
    			add_location(label, file$a, 87, 8, 2292);
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
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(87:4) {#if f.label}",
    		ctx
    	});

    	return block;
    }

    // (90:4) {#if f.hint}
    function create_if_block_7(ctx) {
    	let p;
    	let t_value = /*f*/ ctx[0].hint + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			add_location(p, file$a, 90, 8, 2365);
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
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(90:4) {#if f.hint}",
    		ctx
    	});

    	return block;
    }

    // (93:4) {#if dd_in}
    function create_if_block_6(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "multi-mask svelte-1bmg6xx");
    			add_location(div, file$a, 93, 8, 2415);
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
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(93:4) {#if dd_in}",
    		ctx
    	});

    	return block;
    }

    // (96:4) {#if selected_shortlist.length}
    function create_if_block_3$1(ctx) {
    	let t;
    	let if_block_anchor;
    	let each_value_2 = /*selected_shortlist*/ ctx[5];
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2$1(get_each_context_2$1(ctx, each_value_2, i));
    	}

    	let if_block = /*selected_shortlist*/ ctx[5].length < /*selected*/ ctx[4].length && create_if_block_4(ctx);

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
    					const child_ctx = get_each_context_2$1(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2$1(child_ctx);
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
    					if_block = create_if_block_4(ctx);
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
    		source: "(96:4) {#if selected_shortlist.length}",
    		ctx
    	});

    	return block;
    }

    // (100:12) {:else}
    function create_else_block_1(ctx) {
    	let div;
    	let t_value = /*tag*/ ctx[25].value + "";
    	let t;
    	let i;
    	let mounted;
    	let dispose;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[11](/*tag*/ ctx[25]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			i = element("i");
    			attr_dev(i, "class", "i-close i-20");
    			add_location(i, file$a, 100, 80, 2773);
    			attr_dev(div, "class", "tag svelte-1bmg6xx");
    			add_location(div, file$a, 100, 16, 2709);
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
    			if (dirty & /*selected_shortlist*/ 32 && t_value !== (t_value = /*tag*/ ctx[25].value + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(100:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (98:12) {#if tag.key == 'record_id'}
    function create_if_block_5(ctx) {
    	let div;
    	let t_value = /*tag*/ ctx[25].value + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "tag no_delete svelte-1bmg6xx");
    			add_location(div, file$a, 98, 16, 2628);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*selected_shortlist*/ 32 && t_value !== (t_value = /*tag*/ ctx[25].value + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(98:12) {#if tag.key == 'record_id'}",
    		ctx
    	});

    	return block;
    }

    // (97:8) {#each selected_shortlist as tag}
    function create_each_block_2$1(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*tag*/ ctx[25].key == "record_id") return create_if_block_5;
    		return create_else_block_1;
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
    		id: create_each_block_2$1.name,
    		type: "each",
    		source: "(97:8) {#each selected_shortlist as tag}",
    		ctx
    	});

    	return block;
    }

    // (104:8) {#if selected_shortlist.length < selected.length}
    function create_if_block_4(ctx) {
    	let div;
    	let t0;
    	let t1_value = /*selected*/ ctx[4].length - /*selected_shortlist*/ ctx[5].length + "";
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("+");
    			t1 = text(t1_value);
    			attr_dev(div, "class", "tag no_delete svelte-1bmg6xx");
    			add_location(div, file$a, 104, 12, 2912);
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
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(104:8) {#if selected_shortlist.length < selected.length}",
    		ctx
    	});

    	return block;
    }

    // (113:12) {:else}
    function create_else_block$3(ctx) {
    	let i;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "i-chevron-up i-20");
    			add_location(i, file$a, 113, 16, 3317);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);

    			if (!mounted) {
    				dispose = listen_dev(i, "click", /*click_handler_3*/ ctx[13], false, false, false);
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
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(113:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (111:12) {#if !dd_in}
    function create_if_block_2$3(ctx) {
    	let i;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "i-chevron-down i-20");
    			add_location(i, file$a, 111, 16, 3207);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);

    			if (!mounted) {
    				dispose = listen_dev(i, "click", /*click_handler_2*/ ctx[12], false, false, false);
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
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(111:12) {#if !dd_in}",
    		ctx
    	});

    	return block;
    }

    // (128:40) 
    function create_if_block_1$4(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value_1 = /*selected*/ ctx[4];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
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
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
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
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(128:40) ",
    		ctx
    	});

    	return block;
    }

    // (124:12) {#if tab == 'all'}
    function create_if_block$6(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*f*/ ctx[0].options;
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
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(124:12) {#if tab == 'all'}",
    		ctx
    	});

    	return block;
    }

    // (129:16) {#each selected as f}
    function create_each_block_1$1(ctx) {
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
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(129:16) {#each selected as f}",
    		ctx
    	});

    	return block;
    }

    // (125:16) {#each f.options as f}
    function create_each_block$3(ctx) {
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
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(125:16) {#each f.options as f}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let div3;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let div2;
    	let div0;
    	let input;
    	let input_placeholder_value;
    	let t4;
    	let t5;
    	let div1;
    	let ul;
    	let li0;
    	let a0;
    	let t7;
    	let li1;
    	let a1;
    	let t9;
    	let li2;
    	let a2;
    	let t11;
    	let current_block_type_index;
    	let if_block5;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*f*/ ctx[0].label && create_if_block_8(ctx);
    	let if_block1 = /*f*/ ctx[0].hint && create_if_block_7(ctx);
    	let if_block2 = /*dd_in*/ ctx[1] && create_if_block_6(ctx);
    	let if_block3 = /*selected_shortlist*/ ctx[5].length && create_if_block_3$1(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (!/*dd_in*/ ctx[1]) return create_if_block_2$3;
    		return create_else_block$3;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block4 = current_block_type(ctx);
    	const if_block_creators = [create_if_block$6, create_if_block_1$4];
    	const if_blocks = [];

    	function select_block_type_2(ctx, dirty) {
    		if (/*tab*/ ctx[2] == "all") return 0;
    		if (/*tab*/ ctx[2] == "selected") return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type_2(ctx))) {
    		if_block5 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
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
    			div2 = element("div");
    			div0 = element("div");
    			input = element("input");
    			t4 = space();
    			if_block4.c();
    			t5 = space();
    			div1 = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			a0.textContent = "Select";
    			t7 = space();
    			li1 = element("li");
    			a1 = element("a");
    			a1.textContent = "All";
    			t9 = space();
    			li2 = element("li");
    			a2 = element("a");
    			a2.textContent = "Selected";
    			t11 = space();
    			if (if_block5) if_block5.c();
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", input_placeholder_value = /*f*/ ctx[0].placeholder ? /*f*/ ctx[0].placeholder : "");
    			add_location(input, file$a, 109, 12, 3095);
    			attr_dev(div0, "class", "form-control");
    			add_location(div0, file$a, 108, 8, 3056);
    			attr_dev(a0, "class", "svelte-1bmg6xx");
    			add_location(a0, file$a, 119, 35, 3545);
    			attr_dev(li0, "class", "select svelte-1bmg6xx");
    			add_location(li0, file$a, 119, 16, 3526);
    			attr_dev(a1, "href", "#ehs/incidents/dashboard");
    			attr_dev(a1, "class", "svelte-1bmg6xx");
    			toggle_class(a1, "active", /*tab*/ ctx[2] == "all");
    			add_location(a1, file$a, 120, 20, 3584);
    			add_location(li1, file$a, 120, 16, 3580);
    			attr_dev(a2, "href", "#ehs/incidents/dashboard");
    			attr_dev(a2, "class", "svelte-1bmg6xx");
    			toggle_class(a2, "active", /*tab*/ ctx[2] == "selected");
    			add_location(a2, file$a, 121, 20, 3734);
    			add_location(li2, file$a, 121, 16, 3730);
    			attr_dev(ul, "class", "tabs svelte-1bmg6xx");
    			add_location(ul, file$a, 118, 12, 3492);
    			attr_dev(div1, "class", "multi-dropdown svelte-1bmg6xx");
    			toggle_class(div1, "dd_in", /*dd_in*/ ctx[1]);
    			add_location(div1, file$a, 117, 8, 3439);
    			attr_dev(div2, "class", "multi-wrapper svelte-1bmg6xx");
    			add_location(div2, file$a, 107, 4, 3020);
    			attr_dev(div3, "class", "form-item svelte-1bmg6xx");
    			add_location(div3, file$a, 85, 0, 2223);
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
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, input);
    			append_dev(div0, t4);
    			if_block4.m(div0, null);
    			append_dev(div2, t5);
    			append_dev(div2, div1);
    			append_dev(div1, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a0);
    			append_dev(ul, t7);
    			append_dev(ul, li1);
    			append_dev(li1, a1);
    			append_dev(ul, t9);
    			append_dev(ul, li2);
    			append_dev(li2, a2);
    			append_dev(div1, t11);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(div1, null);
    			}

    			/*div3_binding*/ ctx[16](div3);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(a1, "click", prevent_default(/*click_handler_4*/ ctx[14]), false, true, false),
    					listen_dev(a2, "click", prevent_default(/*click_handler_5*/ ctx[15]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*f*/ ctx[0].label) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_8(ctx);
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
    					if_block1 = create_if_block_7(ctx);
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
    					if_block2 = create_if_block_6(ctx);
    					if_block2.c();
    					if_block2.m(div3, t2);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*selected_shortlist*/ ctx[5].length) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_3$1(ctx);
    					if_block3.c();
    					if_block3.m(div3, t3);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (!current || dirty & /*f*/ 1 && input_placeholder_value !== (input_placeholder_value = /*f*/ ctx[0].placeholder ? /*f*/ ctx[0].placeholder : "")) {
    				attr_dev(input, "placeholder", input_placeholder_value);
    			}

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block4) {
    				if_block4.p(ctx, dirty);
    			} else {
    				if_block4.d(1);
    				if_block4 = current_block_type(ctx);

    				if (if_block4) {
    					if_block4.c();
    					if_block4.m(div0, null);
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
    				if (if_block5) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block5 = if_blocks[current_block_type_index];

    					if (!if_block5) {
    						if_block5 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block5.c();
    					} else {
    						if_block5.p(ctx, dirty);
    					}

    					transition_in(if_block5, 1);
    					if_block5.m(div1, null);
    				} else {
    					if_block5 = null;
    				}
    			}

    			if (dirty & /*dd_in*/ 2) {
    				toggle_class(div1, "dd_in", /*dd_in*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block5);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block5);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			if_block4.d();

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			/*div3_binding*/ ctx[16](null);
    			mounted = false;
    			run_all(dispose);
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

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("InputMulti", slots, []);
    	let { f } = $$props;
    	let orginal_options = JSON.parse(JSON.stringify(f.options));
    	let dd_in = false;
    	let opts = [];
    	let tab = "all";
    	let { channel = "ANSWER" } = $$props;
    	let item = false;
    	let selected = [];
    	let selected_shortlist = [];
    	let w = 0;

    	function recalc() {
    		$$invalidate(4, selected = tree_to_selected(opts));

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
    			answer.options = opts;
    			pubsub.publish(channel, answer);
    		}
    	}

    	function remove_tag(tag) {
    		tag.selected = false;

    		//opts = JSON.parse(JSON.stringify(f.options));
    		$$invalidate(0, f.options = JSON.parse(JSON.stringify(opts)), f);

    		recalc();
    	}

    	function handleItemUpdate(ev) {
    		opts = JSON.parse(JSON.stringify(f.options));
    		recalc();
    	}

    	function handleItemUpdate2(ev) {
    		console.log("selected update", ev.detail.item);
    		$$invalidate(0, f.options = JSON.parse(JSON.stringify(opts)), f);
    		recalc();
    	}

    	onMount(() => {
    		opts = JSON.parse(JSON.stringify(orginal_options));
    		w = item.offsetWidth;
    		recalc();
    	});

    	const writable_props = ["f", "channel"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$4.warn(`<InputMulti> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		$$invalidate(1, dd_in = false);
    	};

    	const click_handler_1 = tag => remove_tag(tag);

    	const click_handler_2 = () => {
    		$$invalidate(1, dd_in = !dd_in);
    	};

    	const click_handler_3 = () => {
    		$$invalidate(1, dd_in = !dd_in);
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
    		opts,
    		tab,
    		channel,
    		item,
    		selected,
    		selected_shortlist,
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
    		if ("opts" in $$props) opts = $$props.opts;
    		if ("tab" in $$props) $$invalidate(2, tab = $$props.tab);
    		if ("channel" in $$props) $$invalidate(9, channel = $$props.channel);
    		if ("item" in $$props) $$invalidate(3, item = $$props.item);
    		if ("selected" in $$props) $$invalidate(4, selected = $$props.selected);
    		if ("selected_shortlist" in $$props) $$invalidate(5, selected_shortlist = $$props.selected_shortlist);
    		if ("w" in $$props) w = $$props.w;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

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
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { f: 0, channel: 9 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InputMulti",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*f*/ ctx[0] === undefined && !("f" in props)) {
    			console_1$4.warn("<InputMulti> was created without expected prop 'f'");
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

    const file$9 = "src/components/form/InputTextarea.svelte";

    // (7:4) {#if f.label}
    function create_if_block_1$3(ctx) {
    	let label;
    	let t_value = /*f*/ ctx[0].label + "";
    	let t;
    	let label_for_value;

    	const block = {
    		c: function create() {
    			label = element("label");
    			t = text(t_value);
    			attr_dev(label, "for", label_for_value = /*f*/ ctx[0].id);
    			add_location(label, file$9, 7, 8, 89);
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
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(7:4) {#if f.label}",
    		ctx
    	});

    	return block;
    }

    // (10:4) {#if f.hint}
    function create_if_block$5(ctx) {
    	let p;
    	let t_value = /*f*/ ctx[0].hint + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			add_location(p, file$9, 10, 8, 162);
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
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(10:4) {#if f.hint}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let textarea;
    	let textarea_id_value;
    	let mounted;
    	let dispose;
    	let if_block0 = /*f*/ ctx[0].label && create_if_block_1$3(ctx);
    	let if_block1 = /*f*/ ctx[0].hint && create_if_block$5(ctx);

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
    			add_location(textarea, file$9, 12, 4, 192);
    			attr_dev(div, "class", "form-item");
    			add_location(div, file$9, 5, 0, 39);
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
    					if_block0 = create_if_block_1$3(ctx);
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
    					if_block1 = create_if_block$5(ctx);
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
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { f: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InputTextarea",
    			options,
    			id: create_fragment$9.name
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

    /* src/components/form/Section.svelte generated by Svelte v3.35.0 */
    const file$8 = "src/components/form/Section.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    // (21:4) {#if f.label}
    function create_if_block_2$2(ctx) {
    	let div;
    	let h3;
    	let t_value = /*f*/ ctx[0].label + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h3 = element("h3");
    			t = text(t_value);
    			attr_dev(h3, "class", "svelte-txjore");
    			add_location(h3, file$8, 22, 12, 472);
    			attr_dev(div, "class", "card-header");
    			add_location(div, file$8, 21, 8, 434);
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
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(21:4) {#if f.label}",
    		ctx
    	});

    	return block;
    }

    // (28:8) {#if f.children}
    function create_if_block$4(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*f*/ ctx[0].children;
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
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
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
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(28:8) {#if f.children}",
    		ctx
    	});

    	return block;
    }

    // (33:16) {:else}
    function create_else_block$2(ctx) {
    	let t0;
    	let b;
    	let t1_value = /*f*/ ctx[0].item_type + "";
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text("you tried loading an unknown component ");
    			b = element("b");
    			t1 = text(t1_value);
    			add_location(b, file$8, 33, 59, 813);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, b, anchor);
    			append_dev(b, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*f*/ 1 && t1_value !== (t1_value = /*f*/ ctx[0].item_type + "")) set_data_dev(t1, t1_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(b);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(33:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (31:16) {#if components[f.item_type]}
    function create_if_block_1$2(ctx) {
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
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(31:16) {#if components[f.item_type]}",
    		ctx
    	});

    	return block;
    }

    // (30:12) {#each f.children as f}
    function create_each_block$2(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$2, create_else_block$2];
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
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(30:12) {#each f.children as f}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let div1;
    	let t;
    	let div0;
    	let current;
    	let if_block0 = /*f*/ ctx[0].label && create_if_block_2$2(ctx);
    	let if_block1 = /*f*/ ctx[0].children && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			if (if_block0) if_block0.c();
    			t = space();
    			div0 = element("div");
    			if (if_block1) if_block1.c();
    			attr_dev(div0, "class", "card-body");
    			add_location(div0, file$8, 26, 4, 521);
    			attr_dev(div1, "class", "card svelte-txjore");
    			add_location(div1, file$8, 19, 0, 389);
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
    					if_block0 = create_if_block_2$2(ctx);
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
    					if_block1 = create_if_block$4(ctx);
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
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Section", slots, []);

    	let components = {
    		"input_text": InputText,
    		"input_multi": InputMulti,
    		"input_select": InputSelect,
    		"input_textarea": InputTextarea
    	};

    	let { f } = $$props;
    	const writable_props = ["f"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Section> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("f" in $$props) $$invalidate(0, f = $$props.f);
    	};

    	$$self.$capture_state = () => ({
    		InputSelect,
    		InputText,
    		InputMulti,
    		InputTextarea,
    		components,
    		f
    	});

    	$$self.$inject_state = $$props => {
    		if ("components" in $$props) $$invalidate(1, components = $$props.components);
    		if ("f" in $$props) $$invalidate(0, f = $$props.f);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [f, components];
    }

    class Section extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { f: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Section",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*f*/ ctx[0] === undefined && !("f" in props)) {
    			console.warn("<Section> was created without expected prop 'f'");
    		}
    	}

    	get f() {
    		throw new Error("<Section>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set f(value) {
    		throw new Error("<Section>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/form/Form.svelte generated by Svelte v3.35.0 */

    const { console: console_1$3 } = globals;
    const file$7 = "src/components/form/Form.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (29:4) {:else}
    function create_else_block$1(ctx) {
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
    			add_location(b, file$7, 29, 26, 771);
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
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(29:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (27:4) {#if components[f.item_type]}
    function create_if_block$3(ctx) {
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
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(27:4) {#if components[f.item_type]}",
    		ctx
    	});

    	return block;
    }

    // (26:0) {#each f as f}
    function create_each_block$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$3, create_else_block$1];
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
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(26:0) {#each f as f}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*f*/ ctx[1];
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
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
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
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Form", slots, []);
    	let { f } = $$props;
    	let { channel = "ANSWER" } = $$props;

    	let components = {
    		"section": Section,
    		"input_text": InputText,
    		"input_multi": InputMulti,
    		"input_select": InputSelect,
    		"input_textarea": InputTextarea
    	};

    	onMount(() => {
    		console.log("Form and all children are mounted");
    	});

    	const writable_props = ["f", "channel"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$3.warn(`<Form> was created with unknown prop '${key}'`);
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
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { f: 1, channel: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Form",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*f*/ ctx[1] === undefined && !("f" in props)) {
    			console_1$3.warn("<Form> was created without expected prop 'f'");
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

    const file$6 = "src/components/table/RecordID.svelte";

    function create_fragment$6(ctx) {
    	let a;
    	let t;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text(/*obj*/ ctx[0]);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "svelte-dqfw7i");
    			add_location(a, file$6, 4, 0, 40);
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
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { obj: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RecordID",
    			options,
    			id: create_fragment$6.name
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

    const file$5 = "src/components/table/Status.svelte";

    function create_fragment$5(ctx) {
    	let span;
    	let t_value = /*status_list*/ ctx[1][/*obj*/ ctx[0]].value + "";
    	let t;
    	let span_class_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", span_class_value = "badge " + /*status_list*/ ctx[1][/*obj*/ ctx[0]].color + " svelte-24a5sl");
    			add_location(span, file$5, 11, 0, 169);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*obj*/ 1 && t_value !== (t_value = /*status_list*/ ctx[1][/*obj*/ ctx[0]].value + "")) set_data_dev(t, t_value);

    			if (dirty & /*obj*/ 1 && span_class_value !== (span_class_value = "badge " + /*status_list*/ ctx[1][/*obj*/ ctx[0]].color + " svelte-24a5sl")) {
    				attr_dev(span, "class", span_class_value);
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
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Status", slots, []);
    	let { obj } = $$props;

    	let status_list = {
    		"in_progress": { value: "In Progress", color: "success" }
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
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { obj: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Status",
    			options,
    			id: create_fragment$5.name
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

    /* src/Frame_incidents.svelte generated by Svelte v3.35.0 */

    const { Object: Object_1, console: console_1$2 } = globals;
    const file$4 = "src/Frame_incidents.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[28] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[31] = list[i][0];
    	child_ctx[32] = list[i][1];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[31] = list[i][0];
    	child_ctx[32] = list[i][1];
    	return child_ctx;
    }

    // (425:28) 
    function create_if_block_3(ctx) {
    	let h2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Summary";
    			add_location(h2, file$4, 425, 4, 17595);
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
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(425:28) ",
    		ctx
    	});

    	return block;
    }

    // (264:0) {#if tab == 'dashboard'}
    function create_if_block_1$1(ctx) {
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
    		each_blocks_1[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value = /*table_data*/ ctx[10];
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
    			t8 = text("Awaiting SignOff");
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
    			add_location(a0, file$4, 269, 60, 8198);
    			attr_dev(div0, "class", "card-header");
    			add_location(div0, file$4, 269, 24, 8162);
    			attr_dev(div1, "class", "big-num");
    			add_location(div1, file$4, 271, 28, 8327);
    			attr_dev(div2, "class", "card-body");
    			add_location(div2, file$4, 270, 24, 8275);
    			attr_dev(div3, "class", "card card-31");
    			add_location(div3, file$4, 268, 20, 8111);
    			attr_dev(div4, "class", "col6");
    			add_location(div4, file$4, 267, 16, 8072);
    			attr_dev(a1, "href", "/");
    			attr_dev(a1, "class", "i-pin i-20 btn-right");
    			add_location(a1, file$4, 277, 71, 8591);
    			attr_dev(div5, "class", "card-header");
    			add_location(div5, file$4, 277, 24, 8544);
    			attr_dev(div6, "class", "big-num minor");
    			add_location(div6, file$4, 279, 28, 8720);
    			attr_dev(div7, "class", "card-body");
    			add_location(div7, file$4, 278, 24, 8668);
    			attr_dev(div8, "class", "card card-31");
    			add_location(div8, file$4, 276, 20, 8493);
    			attr_dev(div9, "class", "col6");
    			add_location(div9, file$4, 275, 16, 8454);
    			attr_dev(a2, "href", "/");
    			attr_dev(a2, "class", "i-pin i-20 btn-right");
    			add_location(a2, file$4, 285, 65, 8984);
    			attr_dev(div10, "class", "card-header");
    			add_location(div10, file$4, 285, 24, 8943);
    			attr_dev(div11, "class", "big-num minor");
    			add_location(div11, file$4, 287, 28, 9113);
    			attr_dev(div12, "class", "card-body");
    			add_location(div12, file$4, 286, 24, 9061);
    			attr_dev(div13, "class", "card card-31");
    			add_location(div13, file$4, 284, 20, 8892);
    			attr_dev(div14, "class", "col6");
    			add_location(div14, file$4, 283, 16, 8853);
    			attr_dev(a3, "href", "/");
    			attr_dev(a3, "class", "i-pin i-20 btn-right");
    			add_location(a3, file$4, 293, 72, 9383);
    			attr_dev(div15, "class", "card-header");
    			add_location(div15, file$4, 293, 24, 9335);
    			attr_dev(div16, "class", "big-num danger");
    			add_location(div16, file$4, 295, 28, 9512);
    			attr_dev(div17, "class", "card-body");
    			add_location(div17, file$4, 294, 24, 9460);
    			attr_dev(div18, "class", "card card-31");
    			add_location(div18, file$4, 292, 20, 9284);
    			attr_dev(div19, "class", "col6");
    			add_location(div19, file$4, 291, 16, 9245);
    			attr_dev(div20, "class", "row");
    			add_location(div20, file$4, 266, 12, 8038);
    			attr_dev(div21, "class", "col12 col-md-6");
    			add_location(div21, file$4, 265, 8, 7997);
    			attr_dev(a4, "href", "/");
    			attr_dev(a4, "class", "i-pin i-20 btn-right");
    			add_location(a4, file$4, 304, 55, 9795);
    			attr_dev(div22, "class", "card-header");
    			add_location(div22, file$4, 304, 16, 9756);
    			attr_dev(path0, "class", "grid_lines svelte-hz54gq");
    			attr_dev(path0, "d", "M 35 162 L 407 162 M 35 138 L 407 138 M 35 114 L 407 114 M 35 91 L 407 91 M 35 67 L 407 67 M 35 43 L 407 43 M 35 19 L 407 19");
    			add_location(path0, file$4, 309, 24, 10175);
    			attr_dev(rect0, "class", "leg1 svelte-hz54gq");
    			attr_dev(rect0, "x", "39");
    			attr_dev(rect0, "y", "150");
    			attr_dev(rect0, "width", "29");
    			attr_dev(rect0, "height", "12");
    			add_location(rect0, file$4, 311, 24, 10386);
    			attr_dev(rect1, "class", "leg1 svelte-hz54gq");
    			attr_dev(rect1, "x", "76");
    			attr_dev(rect1, "y", "138");
    			attr_dev(rect1, "width", "29");
    			attr_dev(rect1, "height", "24");
    			add_location(rect1, file$4, 312, 24, 10462);
    			attr_dev(rect2, "class", "leg1 svelte-hz54gq");
    			attr_dev(rect2, "x", "225");
    			attr_dev(rect2, "y", "150");
    			attr_dev(rect2, "width", "29");
    			attr_dev(rect2, "height", "12");
    			add_location(rect2, file$4, 313, 24, 10538);
    			attr_dev(rect3, "class", "leg1 svelte-hz54gq");
    			attr_dev(rect3, "x", "262");
    			attr_dev(rect3, "y", "150");
    			attr_dev(rect3, "width", "29");
    			attr_dev(rect3, "height", "12");
    			add_location(rect3, file$4, 314, 24, 10615);
    			attr_dev(rect4, "class", "leg1 svelte-hz54gq");
    			attr_dev(rect4, "x", "299");
    			attr_dev(rect4, "y", "150");
    			attr_dev(rect4, "width", "29");
    			attr_dev(rect4, "height", "12");
    			add_location(rect4, file$4, 315, 24, 10692);
    			attr_dev(rect5, "class", "leg1 svelte-hz54gq");
    			attr_dev(rect5, "x", "374");
    			attr_dev(rect5, "y", "126");
    			attr_dev(rect5, "width", "29");
    			attr_dev(rect5, "height", "36");
    			add_location(rect5, file$4, 316, 24, 10769);
    			attr_dev(rect6, "class", "leg2 svelte-hz54gq");
    			attr_dev(rect6, "x", "39");
    			attr_dev(rect6, "y", "138");
    			attr_dev(rect6, "width", "29");
    			attr_dev(rect6, "height", "12");
    			add_location(rect6, file$4, 319, 24, 10848);
    			attr_dev(rect7, "class", "leg2 svelte-hz54gq");
    			attr_dev(rect7, "x", "76");
    			attr_dev(rect7, "y", "114");
    			attr_dev(rect7, "width", "29");
    			attr_dev(rect7, "height", "24");
    			add_location(rect7, file$4, 320, 24, 10924);
    			attr_dev(rect8, "class", "leg2 svelte-hz54gq");
    			attr_dev(rect8, "x", "151");
    			attr_dev(rect8, "y", "150");
    			attr_dev(rect8, "width", "29");
    			attr_dev(rect8, "height", "12");
    			add_location(rect8, file$4, 321, 24, 11000);
    			attr_dev(rect9, "class", "leg2 svelte-hz54gq");
    			attr_dev(rect9, "x", "225");
    			attr_dev(rect9, "y", "138");
    			attr_dev(rect9, "width", "29");
    			attr_dev(rect9, "height", "12");
    			add_location(rect9, file$4, 322, 24, 11077);
    			attr_dev(rect10, "class", "leg2 svelte-hz54gq");
    			attr_dev(rect10, "x", "262");
    			attr_dev(rect10, "y", "126");
    			attr_dev(rect10, "width", "29");
    			attr_dev(rect10, "height", "24");
    			add_location(rect10, file$4, 323, 24, 11154);
    			attr_dev(rect11, "class", "leg2 svelte-hz54gq");
    			attr_dev(rect11, "x", "374");
    			attr_dev(rect11, "y", "114");
    			attr_dev(rect11, "width", "29");
    			attr_dev(rect11, "height", "12");
    			add_location(rect11, file$4, 324, 24, 11231);
    			attr_dev(rect12, "class", "leg3 svelte-hz54gq");
    			attr_dev(rect12, "x", "76");
    			attr_dev(rect12, "y", "55");
    			attr_dev(rect12, "width", "29");
    			attr_dev(rect12, "height", "60");
    			add_location(rect12, file$4, 327, 24, 11374);
    			attr_dev(rect13, "class", "leg3 svelte-hz54gq");
    			attr_dev(rect13, "x", "113");
    			attr_dev(rect13, "y", "138");
    			attr_dev(rect13, "width", "29");
    			attr_dev(rect13, "height", "24");
    			add_location(rect13, file$4, 328, 24, 11449);
    			attr_dev(rect14, "class", "leg3 svelte-hz54gq");
    			attr_dev(rect14, "x", "188");
    			attr_dev(rect14, "y", "138");
    			attr_dev(rect14, "width", "29");
    			attr_dev(rect14, "height", "24");
    			add_location(rect14, file$4, 329, 24, 11526);
    			attr_dev(rect15, "class", "leg4 svelte-hz54gq");
    			attr_dev(rect15, "x", "262");
    			attr_dev(rect15, "y", "114");
    			attr_dev(rect15, "width", "29");
    			attr_dev(rect15, "height", "12");
    			add_location(rect15, file$4, 331, 24, 11628);
    			attr_dev(rect16, "class", "leg4 svelte-hz54gq");
    			attr_dev(rect16, "x", "374");
    			attr_dev(rect16, "y", "102");
    			attr_dev(rect16, "width", "29");
    			attr_dev(rect16, "height", "12");
    			add_location(rect16, file$4, 332, 24, 11705);
    			attr_dev(rect17, "class", "leg5 svelte-hz54gq");
    			attr_dev(rect17, "x", "76");
    			attr_dev(rect17, "y", "31");
    			attr_dev(rect17, "width", "29");
    			attr_dev(rect17, "height", "24");
    			add_location(rect17, file$4, 334, 24, 11822);
    			attr_dev(path1, "class", "axis svelte-hz54gq");
    			attr_dev(path1, "d", "M 34 162 L 408 162 M 35 162 L 35 167 M 72 162 L 72 167 M 109 162 L 109 167 M 147 162 L 147 167 M 184 162 L 184 167 M 221 162 L 221 167 M 258 162 L 258 167 M 295 162 L 295 167 M 333 162 L 333 167 M 370 162 L 370 167 M 407 162 L 407 167");
    			add_location(path1, file$4, 337, 24, 11989);
    			attr_dev(path2, "class", "axis svelte-hz54gq");
    			attr_dev(path2, "d", "M 35 162 L 35 19 M 35 162 L 30 162 M 35 138 L 30 138 M 35 114 L 30 114 M 35 91 L 30 91 M 35 67 L 30 67 M 35 43 L 30 43 M 35 19 L 30 19");
    			add_location(path2, file$4, 339, 24, 12331);
    			attr_dev(tspan0, "x", "41.95");
    			attr_dev(tspan0, "y", "180");
    			attr_dev(tspan0, "dy", "0");
    			add_location(tspan0, file$4, 341, 59, 12557);
    			attr_dev(tspan1, "x", "45.38");
    			attr_dev(tspan1, "y", "180");
    			attr_dev(tspan1, "dy", "12.5");
    			add_location(tspan1, file$4, 341, 104, 12602);
    			attr_dev(text0, "x", "40.1");
    			attr_dev(text0, "y", "170");
    			attr_dev(text0, "opacity", "1");
    			attr_dev(text0, "class", "svelte-hz54gq");
    			add_location(text0, file$4, 341, 24, 12522);
    			attr_dev(tspan2, "x", "376.75");
    			attr_dev(tspan2, "y", "180");
    			attr_dev(tspan2, "dy", "0");
    			add_location(tspan2, file$4, 342, 60, 12717);
    			attr_dev(tspan3, "x", "380.18");
    			attr_dev(tspan3, "y", "180");
    			attr_dev(tspan3, "dy", "12.5");
    			add_location(tspan3, file$4, 342, 106, 12763);
    			attr_dev(text1, "x", "374.9");
    			attr_dev(text1, "y", "170");
    			attr_dev(text1, "opacity", "1");
    			attr_dev(text1, "class", "svelte-hz54gq");
    			add_location(text1, file$4, 342, 24, 12681);
    			attr_dev(tspan4, "x", "79.15");
    			attr_dev(tspan4, "y", "180");
    			attr_dev(tspan4, "dy", "0");
    			add_location(tspan4, file$4, 343, 59, 12878);
    			attr_dev(tspan5, "x", "82.58");
    			attr_dev(tspan5, "y", "180");
    			attr_dev(tspan5, "dy", "12.5");
    			add_location(tspan5, file$4, 343, 104, 12923);
    			attr_dev(text2, "x", "77.3");
    			attr_dev(text2, "y", "170");
    			attr_dev(text2, "opacity", "1");
    			attr_dev(text2, "class", "svelte-hz54gq");
    			add_location(text2, file$4, 343, 24, 12843);
    			attr_dev(tspan6, "x", "116.35");
    			attr_dev(tspan6, "y", "180");
    			attr_dev(tspan6, "dy", "0");
    			add_location(tspan6, file$4, 344, 60, 13038);
    			attr_dev(tspan7, "x", "119.78");
    			attr_dev(tspan7, "y", "180");
    			attr_dev(tspan7, "dy", "12.5");
    			add_location(tspan7, file$4, 344, 106, 13084);
    			attr_dev(text3, "x", "114.5");
    			attr_dev(text3, "y", "170");
    			attr_dev(text3, "opacity", "1");
    			attr_dev(text3, "class", "svelte-hz54gq");
    			add_location(text3, file$4, 344, 24, 13002);
    			attr_dev(tspan8, "x", "153.55");
    			attr_dev(tspan8, "y", "180");
    			attr_dev(tspan8, "dy", "0");
    			add_location(tspan8, file$4, 345, 60, 13200);
    			attr_dev(tspan9, "x", "156.98");
    			attr_dev(tspan9, "y", "180");
    			attr_dev(tspan9, "dy", "12.5");
    			add_location(tspan9, file$4, 345, 106, 13246);
    			attr_dev(text4, "x", "151.7");
    			attr_dev(text4, "y", "170");
    			attr_dev(text4, "opacity", "1");
    			attr_dev(text4, "class", "svelte-hz54gq");
    			add_location(text4, file$4, 345, 24, 13164);
    			attr_dev(tspan10, "x", "190.75");
    			attr_dev(tspan10, "y", "180");
    			attr_dev(tspan10, "dy", "0");
    			add_location(tspan10, file$4, 346, 60, 13362);
    			attr_dev(tspan11, "x", "194.18");
    			attr_dev(tspan11, "y", "180");
    			attr_dev(tspan11, "dy", "12.5");
    			add_location(tspan11, file$4, 346, 106, 13408);
    			attr_dev(text5, "x", "188.9");
    			attr_dev(text5, "y", "170");
    			attr_dev(text5, "opacity", "1");
    			attr_dev(text5, "class", "svelte-hz54gq");
    			add_location(text5, file$4, 346, 24, 13326);
    			attr_dev(tspan12, "x", "227.95");
    			attr_dev(tspan12, "y", "180");
    			attr_dev(tspan12, "dy", "0");
    			add_location(tspan12, file$4, 347, 60, 13524);
    			attr_dev(tspan13, "x", "231.38");
    			attr_dev(tspan13, "y", "180");
    			attr_dev(tspan13, "dy", "12.5");
    			add_location(tspan13, file$4, 347, 106, 13570);
    			attr_dev(text6, "x", "226.1");
    			attr_dev(text6, "y", "170");
    			attr_dev(text6, "opacity", "1");
    			attr_dev(text6, "class", "svelte-hz54gq");
    			add_location(text6, file$4, 347, 24, 13488);
    			attr_dev(tspan14, "x", "265.15");
    			attr_dev(tspan14, "y", "180");
    			attr_dev(tspan14, "dy", "0");
    			add_location(tspan14, file$4, 348, 60, 13686);
    			attr_dev(tspan15, "x", "268.58");
    			attr_dev(tspan15, "y", "180");
    			attr_dev(tspan15, "dy", "12.5");
    			add_location(tspan15, file$4, 348, 106, 13732);
    			attr_dev(text7, "x", "263.3");
    			attr_dev(text7, "y", "170");
    			attr_dev(text7, "opacity", "1");
    			attr_dev(text7, "class", "svelte-hz54gq");
    			add_location(text7, file$4, 348, 24, 13650);
    			attr_dev(tspan16, "x", "302.35");
    			attr_dev(tspan16, "y", "180");
    			attr_dev(tspan16, "dy", "0");
    			add_location(tspan16, file$4, 349, 60, 13848);
    			attr_dev(tspan17, "x", "305.78");
    			attr_dev(tspan17, "y", "180");
    			attr_dev(tspan17, "dy", "12.5");
    			add_location(tspan17, file$4, 349, 106, 13894);
    			attr_dev(text8, "x", "300.5");
    			attr_dev(text8, "y", "170");
    			attr_dev(text8, "opacity", "1");
    			attr_dev(text8, "class", "svelte-hz54gq");
    			add_location(text8, file$4, 349, 24, 13812);
    			attr_dev(tspan18, "x", "339.55");
    			attr_dev(tspan18, "y", "180");
    			attr_dev(tspan18, "dy", "0");
    			add_location(tspan18, file$4, 350, 60, 14010);
    			attr_dev(tspan19, "x", "342.98");
    			attr_dev(tspan19, "y", "180");
    			attr_dev(tspan19, "dy", "12.5");
    			add_location(tspan19, file$4, 350, 106, 14056);
    			attr_dev(text9, "x", "337.7");
    			attr_dev(text9, "y", "170");
    			attr_dev(text9, "opacity", "1");
    			attr_dev(text9, "class", "svelte-hz54gq");
    			add_location(text9, file$4, 350, 24, 13974);
    			attr_dev(tspan20, "x", "21.41");
    			attr_dev(tspan20, "y", "167.2");
    			attr_dev(tspan20, "dy", "0");
    			add_location(tspan20, file$4, 351, 62, 14174);
    			attr_dev(text10, "x", "21.41");
    			attr_dev(text10, "y", "155.2");
    			attr_dev(text10, "opacity", "1");
    			attr_dev(text10, "class", "svelte-hz54gq");
    			add_location(text10, file$4, 351, 24, 14136);
    			attr_dev(tspan21, "x", "13.81");
    			attr_dev(tspan21, "y", "24.2");
    			attr_dev(tspan21, "dy", "0");
    			add_location(tspan21, file$4, 352, 61, 14286);
    			attr_dev(text11, "x", "13.81");
    			attr_dev(text11, "y", "12.2");
    			attr_dev(text11, "opacity", "1");
    			attr_dev(text11, "class", "svelte-hz54gq");
    			add_location(text11, file$4, 352, 24, 14249);
    			attr_dev(tspan22, "x", "21.41");
    			attr_dev(tspan22, "y", "143.37");
    			attr_dev(tspan22, "dy", "0");
    			add_location(tspan22, file$4, 353, 63, 14400);
    			attr_dev(text12, "x", "21.41");
    			attr_dev(text12, "y", "131.37");
    			attr_dev(text12, "opacity", "1");
    			attr_dev(text12, "class", "svelte-hz54gq");
    			add_location(text12, file$4, 353, 24, 14361);
    			attr_dev(tspan23, "x", "21.41");
    			attr_dev(tspan23, "y", "119.54");
    			attr_dev(tspan23, "dy", "0");
    			add_location(tspan23, file$4, 354, 63, 14515);
    			attr_dev(text13, "x", "21.41");
    			attr_dev(text13, "y", "107.54");
    			attr_dev(text13, "opacity", "1");
    			attr_dev(text13, "class", "svelte-hz54gq");
    			add_location(text13, file$4, 354, 24, 14476);
    			attr_dev(tspan24, "x", "21.41");
    			attr_dev(tspan24, "y", "95.7");
    			attr_dev(tspan24, "dy", "0");
    			add_location(tspan24, file$4, 355, 61, 14628);
    			attr_dev(text14, "x", "21.41");
    			attr_dev(text14, "y", "83.7");
    			attr_dev(text14, "opacity", "1");
    			attr_dev(text14, "class", "svelte-hz54gq");
    			add_location(text14, file$4, 355, 24, 14591);
    			attr_dev(tspan25, "x", "21.41");
    			attr_dev(tspan25, "y", "71.87");
    			attr_dev(tspan25, "dy", "0");
    			add_location(tspan25, file$4, 356, 62, 14740);
    			attr_dev(text15, "x", "21.41");
    			attr_dev(text15, "y", "59.87");
    			attr_dev(text15, "opacity", "1");
    			attr_dev(text15, "class", "svelte-hz54gq");
    			add_location(text15, file$4, 356, 24, 14702);
    			attr_dev(tspan26, "x", "13.81");
    			attr_dev(tspan26, "y", "48.04");
    			attr_dev(tspan26, "dy", "0");
    			add_location(tspan26, file$4, 357, 62, 14853);
    			attr_dev(text16, "x", "13.81");
    			attr_dev(text16, "y", "36.04");
    			attr_dev(text16, "opacity", "1");
    			attr_dev(text16, "class", "svelte-hz54gq");
    			add_location(text16, file$4, 357, 24, 14815);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "class", "demo_graph svelte-hz54gq");
    			attr_dev(svg, "viewBox", "0 0 428 203");
    			attr_dev(svg, "width", "90%");
    			attr_dev(svg, "display", "block");
    			add_location(svg, file$4, 306, 20, 9908);
    			attr_dev(div23, "class", "card-body");
    			add_location(div23, file$4, 305, 16, 9864);
    			attr_dev(div24, "class", "card card-32");
    			add_location(div24, file$4, 303, 12, 9713);
    			attr_dev(div25, "class", "col12 col-md-6");
    			add_location(div25, file$4, 302, 8, 9672);
    			attr_dev(div26, "class", "row");
    			add_location(div26, file$4, 264, 4, 7971);
    			attr_dev(a5, "href", "/");
    			attr_dev(a5, "class", "i-pin i-20 btn-right");
    			add_location(a5, file$4, 368, 16, 15139);
    			attr_dev(a6, "href", "/");
    			attr_dev(a6, "class", "i-settings i-20 btn-right");
    			add_location(a6, file$4, 369, 16, 15202);
    			add_location(h4, file$4, 367, 12, 15096);
    			add_location(tr, file$4, 374, 24, 15450);
    			add_location(thead, file$4, 373, 20, 15418);
    			add_location(tbody, file$4, 390, 20, 16151);
    			attr_dev(table, "class", "table");
    			add_location(table, file$4, 372, 16, 15376);
    			attr_dev(div27, "class", "pagination");
    			add_location(div27, file$4, 419, 48, 17470);
    			attr_dev(div28, "class", "pagination-wrapper");
    			add_location(div28, file$4, 419, 16, 17438);
    			attr_dev(div29, "class", "sticky-wrapper svelte-hz54gq");
    			add_location(div29, file$4, 371, 12, 15331);
    			attr_dev(div30, "class", "col12");
    			add_location(div30, file$4, 366, 8, 15064);
    			attr_dev(div31, "class", "row");
    			add_location(div31, file$4, 365, 4, 15038);
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
    				dispose = listen_dev(a6, "click", prevent_default(/*show_table_drawer*/ ctx[11]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*selected_columns*/ 8) {
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

    			if (dirty[0] & /*selected_columns, components, table_data*/ 1160) {
    				each_value = /*table_data*/ ctx[10];
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
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(264:0) {#if tab == 'dashboard'}",
    		ctx
    	});

    	return block;
    }

    // (376:28) {#each Object.entries(selected_columns) as [k, th]}
    function create_each_block_2(ctx) {
    	let th;
    	let t_value = /*th*/ ctx[32].value + "";
    	let t;

    	const block = {
    		c: function create() {
    			th = element("th");
    			t = text(t_value);
    			add_location(th, file$4, 376, 32, 15567);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*selected_columns*/ 8 && t_value !== (t_value = /*th*/ ctx[32].value + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(376:28) {#each Object.entries(selected_columns) as [k, th]}",
    		ctx
    	});

    	return block;
    }

    // (398:40) {:else}
    function create_else_block(ctx) {
    	let t_value = /*row*/ ctx[28][/*th*/ ctx[32].key] + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*selected_columns*/ 8 && t_value !== (t_value = /*row*/ ctx[28][/*th*/ ctx[32].key] + "")) set_data_dev(t, t_value);
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
    		source: "(398:40) {:else}",
    		ctx
    	});

    	return block;
    }

    // (396:40) {#if components[th.key]}
    function create_if_block_2$1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*components*/ ctx[7][/*th*/ ctx[32].key];

    	function switch_props(ctx) {
    		return {
    			props: { obj: /*row*/ ctx[28][/*th*/ ctx[32].key] },
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
    			if (dirty[0] & /*selected_columns*/ 8) switch_instance_changes.obj = /*row*/ ctx[28][/*th*/ ctx[32].key];

    			if (switch_value !== (switch_value = /*components*/ ctx[7][/*th*/ ctx[32].key])) {
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
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(396:40) {#if components[th.key]}",
    		ctx
    	});

    	return block;
    }

    // (394:32) {#each Object.entries(selected_columns) as [k, th]}
    function create_each_block_1(ctx) {
    	let td;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block_2$1, create_else_block];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*components*/ ctx[7][/*th*/ ctx[32].key]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			td = element("td");
    			if_block.c();
    			add_location(td, file$4, 394, 36, 16362);
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
    		source: "(394:32) {#each Object.entries(selected_columns) as [k, th]}",
    		ctx
    	});

    	return block;
    }

    // (392:24) {#each table_data as row}
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
    			add_location(tr, file$4, 392, 28, 16237);
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
    			if (dirty[0] & /*components, selected_columns, table_data*/ 1160) {
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
    		source: "(392:24) {#each table_data as row}",
    		ctx
    	});

    	return block;
    }

    // (430:0) {#if show_drawer}
    function create_if_block$2(ctx) {
    	let div5;
    	let div0;
    	let t0;
    	let div4;
    	let div1;
    	let h2;
    	let t1;
    	let span0;
    	let i;
    	let t2;
    	let div3;
    	let form;
    	let t3;
    	let div2;
    	let span1;
    	let t5;
    	let span2;
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
    			div5 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div4 = element("div");
    			div1 = element("div");
    			h2 = element("h2");
    			t1 = text("Table settings ");
    			span0 = element("span");
    			i = element("i");
    			t2 = space();
    			div3 = element("div");
    			create_component(form.$$.fragment);
    			t3 = space();
    			div2 = element("div");
    			span1 = element("span");
    			span1.textContent = "Save";
    			t5 = space();
    			span2 = element("span");
    			span2.textContent = "Cancel";
    			attr_dev(div0, "class", "mask");
    			toggle_class(div0, "visible", /*mask_visible*/ ctx[6]);
    			toggle_class(div0, "block", /*mask_block*/ ctx[5]);
    			add_location(div0, file$4, 431, 8, 17671);
    			attr_dev(i, "class", "i-close i-24");
    			add_location(i, file$4, 434, 86, 17945);
    			attr_dev(span0, "class", "close");
    			add_location(span0, file$4, 434, 35, 17894);
    			add_location(h2, file$4, 434, 16, 17875);
    			attr_dev(div1, "class", "pullout-head");
    			add_location(div1, file$4, 433, 12, 17832);
    			attr_dev(span1, "class", "btn");
    			add_location(span1, file$4, 442, 20, 18206);
    			attr_dev(span2, "class", "btn btn-secondary");
    			add_location(span2, file$4, 443, 20, 18289);
    			attr_dev(div2, "class", "form-item");
    			add_location(div2, file$4, 441, 16, 18162);
    			attr_dev(div3, "class", "pullout-body form");
    			add_location(div3, file$4, 436, 12, 18017);
    			attr_dev(div4, "class", "pullout");
    			toggle_class(div4, "in", /*table_settings_pullout*/ ctx[4]);
    			add_location(div4, file$4, 432, 8, 17762);
    			attr_dev(div5, "class", "drawer");
    			add_location(div5, file$4, 430, 4, 17642);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div0);
    			append_dev(div5, t0);
    			append_dev(div5, div4);
    			append_dev(div4, div1);
    			append_dev(div1, h2);
    			append_dev(h2, t1);
    			append_dev(h2, span0);
    			append_dev(span0, i);
    			append_dev(div4, t2);
    			append_dev(div4, div3);
    			mount_component(form, div3, null);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			append_dev(div2, span1);
    			append_dev(div2, t5);
    			append_dev(div2, span2);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(span0, "click", /*hide_table_drawer*/ ctx[12], false, false, false),
    					listen_dev(span1, "click", /*save_table_settings*/ ctx[9], false, false, false),
    					listen_dev(span2, "click", /*hide_table_drawer*/ ctx[12], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*mask_visible*/ 64) {
    				toggle_class(div0, "visible", /*mask_visible*/ ctx[6]);
    			}

    			if (dirty[0] & /*mask_block*/ 32) {
    				toggle_class(div0, "block", /*mask_block*/ ctx[5]);
    			}

    			const form_changes = {};
    			if (dirty[0] & /*table_settings_form*/ 4) form_changes.f = /*table_settings_form*/ ctx[2];
    			form.$set(form_changes);

    			if (dirty[0] & /*table_settings_pullout*/ 16) {
    				toggle_class(div4, "in", /*table_settings_pullout*/ ctx[4]);
    			}
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
    			if (detaching) detach_dev(div5);
    			destroy_component(form);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(430:0) {#if show_drawer}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
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
    	let ul1;
    	let li3;
    	let a4;
    	let t11;
    	let li4;
    	let a5;
    	let t13;
    	let li5;
    	let a6;
    	let t15;
    	let current_block_type_index;
    	let if_block0;
    	let t16;
    	let if_block1_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block_1$1, create_if_block_3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*tab*/ ctx[1] == "dashboard") return 0;
    		if (/*tab*/ ctx[1] == "summary") return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	let if_block1 = /*show_drawer*/ ctx[0] && create_if_block$2(ctx);

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
    			ul1 = element("ul");
    			li3 = element("li");
    			a4 = element("a");
    			a4.textContent = "Dashboard";
    			t11 = space();
    			li4 = element("li");
    			a5 = element("a");
    			a5.textContent = "Summary";
    			t13 = space();
    			li5 = element("li");
    			a6 = element("a");
    			a6.textContent = "Admin";
    			t15 = space();
    			if (if_block0) if_block0.c();
    			t16 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			attr_dev(a0, "href", "#platform");
    			add_location(a0, file$4, 245, 16, 6820);
    			add_location(li0, file$4, 245, 12, 6816);
    			attr_dev(a1, "href", "#ehs");
    			add_location(a1, file$4, 246, 16, 6913);
    			add_location(li1, file$4, 246, 12, 6909);
    			add_location(li2, file$4, 247, 12, 6986);
    			attr_dev(ul0, "class", "breadcrumb");
    			add_location(ul0, file$4, 244, 8, 6780);
    			attr_dev(div0, "class", "col12 col-sm-5");
    			add_location(div0, file$4, 243, 4, 6743);
    			attr_dev(a2, "href", "#ehs/incidents/queries_new");
    			attr_dev(a2, "class", "btn btn-secondary");
    			add_location(a2, file$4, 252, 8, 7146);
    			attr_dev(a3, "href", "#ehs/incidents/incidents_new");
    			attr_dev(a3, "class", "btn");
    			add_location(a3, file$4, 253, 8, 7268);
    			attr_dev(div1, "class", "col12 col-sm-7 text-right");
    			add_location(div1, file$4, 250, 4, 7034);
    			attr_dev(div2, "class", "row sticky");
    			add_location(div2, file$4, 242, 0, 6714);
    			attr_dev(a4, "href", "#ehs/incidents/dashboard");
    			toggle_class(a4, "active", /*tab*/ ctx[1] == "dashboard");
    			add_location(a4, file$4, 258, 8, 7415);
    			add_location(li3, file$4, 258, 4, 7411);
    			attr_dev(a5, "href", "#ehs/incidents/summary");
    			toggle_class(a5, "active", /*tab*/ ctx[1] == "summary");
    			add_location(a5, file$4, 259, 8, 7556);
    			add_location(li4, file$4, 259, 4, 7552);
    			attr_dev(a6, "href", "#ehs/incidents/admin");
    			toggle_class(a6, "active", /*tab*/ ctx[1] == "admin");
    			add_location(a6, file$4, 260, 8, 7690);
    			add_location(li5, file$4, 260, 4, 7686);
    			attr_dev(ul1, "class", "tabs");
    			add_location(ul1, file$4, 257, 0, 7389);
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
    			insert_dev(target, ul1, anchor);
    			append_dev(ul1, li3);
    			append_dev(li3, a4);
    			append_dev(ul1, t11);
    			append_dev(ul1, li4);
    			append_dev(li4, a5);
    			append_dev(ul1, t13);
    			append_dev(ul1, li5);
    			append_dev(li5, a6);
    			insert_dev(target, t15, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, t16, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(a0, "click", /*click_handler*/ ctx[16], false, false, false),
    					listen_dev(a1, "click", /*click_handler_1*/ ctx[17], false, false, false),
    					listen_dev(a2, "click", /*click_handler_2*/ ctx[18], false, false, false),
    					listen_dev(a3, "click", /*click_handler_3*/ ctx[19], false, false, false),
    					listen_dev(a4, "click", /*click_handler_4*/ ctx[20], false, false, false),
    					listen_dev(a5, "click", /*click_handler_5*/ ctx[21], false, false, false),
    					listen_dev(a6, "click", /*click_handler_6*/ ctx[22], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*tab*/ 2) {
    				toggle_class(a4, "active", /*tab*/ ctx[1] == "dashboard");
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
    				if (if_block0) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block0 = if_blocks[current_block_type_index];

    					if (!if_block0) {
    						if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block0.c();
    					} else {
    						if_block0.p(ctx, dirty);
    					}

    					transition_in(if_block0, 1);
    					if_block0.m(t16.parentNode, t16);
    				} else {
    					if_block0 = null;
    				}
    			}

    			if (/*show_drawer*/ ctx[0]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*show_drawer*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
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
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(ul1);
    			if (detaching) detach_dev(t15);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(t16);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    			mounted = false;
    			run_all(dispose);
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
    	validate_slots("Frame_incidents", slots, []);
    	let components = { "record_id": RecordID, "status": Status };
    	const dispatch = createEventDispatcher();
    	let tab = "dashboard";
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
    					"pii": false
    				},
    				{
    					"key": "channel",
    					"value": "Channel",
    					"selectable": true,
    					"selected": true,
    					"pii": false
    				},
    				{
    					"key": "created_date",
    					"value": "Date created on",
    					"selectable": true,
    					"selected": true,
    					"pii": false
    				},
    				{
    					"key": "created_by",
    					"value": "Creator",
    					"selectable": true,
    					"selected": false,
    					"pii": true
    				},
    				{
    					"key": "updated_date",
    					"value": "Date updated on",
    					"selectable": true,
    					"selected": false,
    					"pii": false
    				},
    				{
    					"key": "updated_by",
    					"value": "Updated by",
    					"selectable": true,
    					"selected": false,
    					"pii": true
    				},
    				{
    					"key": "status",
    					"value": "Status",
    					"selectable": true,
    					"selected": true,
    					"pii": false
    				},
    				{
    					"key": "group",
    					"value": "Group",
    					"selectable": true,
    					"selected": false,
    					"pii": false
    				},
    				{
    					"key": "division",
    					"value": "Division",
    					"selectable": true,
    					"selected": false,
    					"pii": false
    				},
    				{
    					"key": "sector",
    					"value": "Sector",
    					"selectable": true,
    					"selected": false,
    					"pii": false
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
    		$$invalidate(15, columns = edit_columns);
    		$$invalidate(2, table_settings_form[0].options = edit_columns, table_settings_form);
    		hide_table_drawer();
    	}

    	let selected_columns = [];

    	let table_data = [
    		{
    			"created_date": "2022-01-24T3:48:19.430Z",
    			"created_by": "Mike Wazowski",
    			"update_date": "2022-01-24T3:48:19.430Z",
    			"update_by": "Mike Wazowski",
    			"group": "Ireland",
    			"division": "Cork",
    			"sector": "Plumbing",
    			"record_id": 485,
    			"channel": "rapid",
    			"primary_event_type": "Near miss",
    			"date_time": "2022-01-24T3:48:19.430Z",
    			"time_relative": "9hr 42min",
    			"location": "Main Office",
    			"custom_field_shift": "Yellow Shift",
    			"open_actions": 0,
    			"total_actions": 2,
    			"open_total_actions": "0/2",
    			"status": "in_progress"
    		}
    	];

    	let table_settings_pullout = false;
    	let show_drawer = false;
    	let mask_block = false;
    	let mask_visible = false;
    	let pullout = false;

    	function show_table_drawer() {
    		$$invalidate(0, show_drawer = true);
    		$$invalidate(5, mask_block = false);
    		$$invalidate(6, mask_visible = true);

    		setTimeout(
    			() => {
    				$$invalidate(4, table_settings_pullout = true);
    			},
    			300
    		);
    	}

    	function hide_table_drawer() {
    		$$invalidate(5, mask_block = false);
    		$$invalidate(6, mask_visible = false);
    		$$invalidate(4, table_settings_pullout = false);

    		setTimeout(
    			() => {
    				$$invalidate(0, show_drawer = false);
    				$$invalidate(2, table_settings_form.options = columns, table_settings_form);
    				(($$invalidate(2, table_settings_form), $$invalidate(0, show_drawer)), $$invalidate(15, columns));
    			},
    			1000
    		);
    	}

    	function nav(str) {
    		dispatch("nav", { text: str });
    	}

    	const writable_props = ["tabnav"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<Frame_incidents> was created with unknown prop '${key}'`);
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
    		$$invalidate(1, tab = "summary");
    	};

    	const click_handler_6 = () => {
    		$$invalidate(1, tab = "admin");
    	};

    	$$self.$$set = $$props => {
    		if ("tabnav" in $$props) $$invalidate(14, tabnav = $$props.tabnav);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		PubSub: pubsub,
    		Form,
    		RecordID,
    		Status,
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
    		table_settings_pullout,
    		show_drawer,
    		mask_block,
    		mask_visible,
    		pullout,
    		show_table_drawer,
    		hide_table_drawer,
    		nav
    	});

    	$$self.$inject_state = $$props => {
    		if ("components" in $$props) $$invalidate(7, components = $$props.components);
    		if ("tab" in $$props) $$invalidate(1, tab = $$props.tab);
    		if ("tabnav" in $$props) $$invalidate(14, tabnav = $$props.tabnav);
    		if ("columns" in $$props) $$invalidate(15, columns = $$props.columns);
    		if ("edit_columns" in $$props) edit_columns = $$props.edit_columns;
    		if ("table_settings_form" in $$props) $$invalidate(2, table_settings_form = $$props.table_settings_form);
    		if ("channel" in $$props) $$invalidate(8, channel = $$props.channel);
    		if ("sub" in $$props) sub = $$props.sub;
    		if ("selected_columns" in $$props) $$invalidate(3, selected_columns = $$props.selected_columns);
    		if ("table_data" in $$props) $$invalidate(10, table_data = $$props.table_data);
    		if ("table_settings_pullout" in $$props) $$invalidate(4, table_settings_pullout = $$props.table_settings_pullout);
    		if ("show_drawer" in $$props) $$invalidate(0, show_drawer = $$props.show_drawer);
    		if ("mask_block" in $$props) $$invalidate(5, mask_block = $$props.mask_block);
    		if ("mask_visible" in $$props) $$invalidate(6, mask_visible = $$props.mask_visible);
    		if ("pullout" in $$props) pullout = $$props.pullout;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*tabnav*/ 16384) {
    			{
    				let t = tabnav;

    				if (tabnav !== "") {
    					$$invalidate(1, tab = t);
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*columns*/ 32768) {
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

    		if ($$self.$$.dirty[0] & /*show_drawer, columns*/ 32769) {
    			{
    				let s = show_drawer;

    				if (s) {
    					console.log("drawer IS showing_____________________");

    					$$invalidate(2, table_settings_form = [
    						{
    							item_type: "input_multi",
    							id: "table_settings_multi",
    							label: "Columns to show",
    							hint: "Remember all users will see these changes. Any that contain personally identifiable information will be redacted if the user doesn't have permission.",
    							options: JSON.parse(JSON.stringify(columns)),
    							answer: ""
    						}
    					]);
    				} else {
    					console.log("drawer is NOT showing_________________");
    				}
    			}
    		}
    	};

    	return [
    		show_drawer,
    		tab,
    		table_settings_form,
    		selected_columns,
    		table_settings_pullout,
    		mask_block,
    		mask_visible,
    		components,
    		channel,
    		save_table_settings,
    		table_data,
    		show_table_drawer,
    		hide_table_drawer,
    		nav,
    		tabnav,
    		columns,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5,
    		click_handler_6
    	];
    }

    class Frame_incidents extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { tabnav: 14 }, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Frame_incidents",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get tabnav() {
    		throw new Error("<Frame_incidents>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tabnav(value) {
    		throw new Error("<Frame_incidents>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Frame_incidents_new.svelte generated by Svelte v3.35.0 */

    const { console: console_1$1 } = globals;
    const file$3 = "src/Frame_incidents_new.svelte";

    // (157:33) 
    function create_if_block_2(ctx) {
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
    	let a0;
    	let t11;
    	let a1;
    	let t13;
    	let span;
    	let mounted;
    	let dispose;

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
    			a0 = element("a");
    			a0.textContent = "Back";
    			t11 = space();
    			a1 = element("a");
    			a1.textContent = "Add primary event";
    			t13 = space();
    			span = element("span");
    			span.textContent = "Next";
    			add_location(h1, file$3, 158, 16, 4528);
    			add_location(div0, file$3, 157, 12, 4506);
    			if (img.src !== (img_src_value = "./images/illustrations/events.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "events illustration");
    			attr_dev(img, "class", "svelte-i6xr5l");
    			add_location(img, file$3, 162, 20, 4666);
    			attr_dev(h5, "class", "svelte-i6xr5l");
    			add_location(h5, file$3, 163, 20, 4758);
    			add_location(b, file$3, 164, 27, 4808);
    			add_location(br, file$3, 165, 62, 4925);
    			add_location(p, file$3, 164, 20, 4801);
    			attr_dev(div1, "class", "card-body blank_state svelte-i6xr5l");
    			add_location(div1, file$3, 161, 16, 4610);
    			attr_dev(div2, "class", "card svelte-i6xr5l");
    			add_location(div2, file$3, 160, 12, 4575);
    			attr_dev(a0, "class", "btn btn-secondary btn-left");
    			attr_dev(a0, "href", "#ehs/incidents/incidents_new/report");
    			add_location(a0, file$3, 170, 16, 5085);
    			attr_dev(a1, "href", "/");
    			attr_dev(a1, "class", "btn btn-secondary");
    			add_location(a1, file$3, 172, 16, 5266);
    			attr_dev(span, "class", "btn disabled");
    			add_location(span, file$3, 173, 16, 5388);
    			attr_dev(div3, "class", "text-right");
    			add_location(div3, file$3, 169, 12, 5044);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, h1);
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
    			append_dev(div3, a0);
    			append_dev(div3, t11);
    			append_dev(div3, a1);
    			append_dev(div3, t13);
    			append_dev(div3, span);

    			if (!mounted) {
    				dispose = [
    					listen_dev(a0, "click", /*click_handler_5*/ ctx[17], false, false, false),
    					listen_dev(a1, "click", prevent_default(/*show_event_drawer*/ ctx[8]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(div3);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(157:33) ",
    		ctx
    	});

    	return block;
    }

    // (152:8) {#if tab == 'report'}
    function create_if_block_1(ctx) {
    	let h1;
    	let t1;
    	let form;
    	let t2;
    	let span;
    	let current;
    	let mounted;
    	let dispose;

    	form = new Form({
    			props: { f: /*f*/ ctx[6] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Report";
    			t1 = space();
    			create_component(form.$$.fragment);
    			t2 = space();
    			span = element("span");
    			span.textContent = "Test";
    			add_location(h1, file$3, 152, 12, 4337);
    			add_location(span, file$3, 154, 12, 4396);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(form, target, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, span, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(span, "click", /*update_payload_text*/ ctx[7], false, false, false);
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
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			destroy_component(form, detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(span);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(152:8) {#if tab == 'report'}",
    		ctx
    	});

    	return block;
    }

    // (181:0) {#if show_drawer}
    function create_if_block$1(ctx) {
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
    			toggle_class(div0, "visible", /*mask_visible*/ ctx[2]);
    			toggle_class(div0, "block", /*mask_block*/ ctx[1]);
    			add_location(div0, file$3, 182, 8, 5531);
    			attr_dev(i, "class", "i-close i-24");
    			add_location(i, file$3, 185, 81, 5785);
    			attr_dev(span0, "class", "close");
    			add_location(span0, file$3, 185, 30, 5734);
    			add_location(h2, file$3, 185, 16, 5720);
    			attr_dev(div1, "class", "pullout-head");
    			add_location(div1, file$3, 184, 12, 5677);
    			add_location(label0, file$3, 190, 20, 5950);
    			option0.__value = "Accident";
    			option0.value = option0.__value;
    			add_location(option0, file$3, 192, 24, 6082);
    			option1.__value = "Occupational Illness";
    			option1.value = option1.__value;
    			add_location(option1, file$3, 193, 24, 6132);
    			option2.__value = "Environmental";
    			option2.value = option2.__value;
    			add_location(option2, file$3, 194, 24, 6194);
    			option3.__value = "Incident";
    			option3.value = option3.__value;
    			add_location(option3, file$3, 195, 24, 6249);
    			option4.__value = "Security";
    			option4.value = option4.__value;
    			add_location(option4, file$3, 196, 24, 6299);
    			option5.__value = "Process Safety";
    			option5.value = option5.__value;
    			add_location(option5, file$3, 197, 24, 6349);
    			option6.__value = "Near Miss";
    			option6.value = option6.__value;
    			add_location(option6, file$3, 198, 24, 6405);
    			attr_dev(select0, "class", "form-control");
    			if (/*event*/ ctx[4].event_type === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[18].call(select0));
    			add_location(select0, file$3, 191, 20, 5996);
    			attr_dev(div2, "class", "form-item");
    			add_location(div2, file$3, 189, 16, 5906);
    			add_location(label1, file$3, 202, 20, 6545);
    			option7.__value = "Riddor";
    			option7.value = option7.__value;
    			add_location(option7, file$3, 204, 24, 6649);
    			attr_dev(select1, "class", "form-control");
    			add_location(select1, file$3, 203, 20, 6595);
    			attr_dev(div3, "class", "form-item");
    			add_location(div3, file$3, 201, 16, 6501);
    			add_location(label2, file$3, 208, 20, 6786);
    			attr_dev(input0, "type", "radio");
    			add_location(input0, file$3, 211, 24, 6926);
    			attr_dev(div4, "class", "form-control radio inline svelte-i6xr5l");
    			add_location(div4, file$3, 210, 20, 6862);
    			attr_dev(input1, "type", "radio");
    			add_location(input1, file$3, 214, 24, 7062);
    			attr_dev(div5, "class", "form-control radio inline svelte-i6xr5l");
    			add_location(div5, file$3, 213, 20, 6998);
    			attr_dev(div6, "class", "form-item");
    			add_location(div6, file$3, 207, 16, 6742);
    			add_location(label3, file$3, 218, 20, 7196);
    			option8.__value = "Employee";
    			option8.value = option8.__value;
    			add_location(option8, file$3, 220, 24, 7309);
    			attr_dev(select2, "class", "form-control");
    			add_location(select2, file$3, 219, 20, 7255);
    			attr_dev(div7, "class", "form-item");
    			add_location(div7, file$3, 217, 16, 7152);
    			add_location(label4, file$3, 224, 20, 7448);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "class", "form-control");
    			add_location(input2, file$3, 225, 20, 7490);
    			attr_dev(div8, "class", "form-item");
    			add_location(div8, file$3, 223, 16, 7404);
    			add_location(label5, file$3, 228, 20, 7644);
    			attr_dev(input3, "type", "text");
    			attr_dev(input3, "class", "form-control");
    			add_location(input3, file$3, 229, 20, 7706);
    			attr_dev(div9, "class", "form-item");
    			add_location(div9, file$3, 227, 16, 7600);
    			add_location(label6, file$3, 232, 20, 7832);
    			attr_dev(input4, "type", "text");
    			attr_dev(input4, "class", "form-control");
    			add_location(input4, file$3, 233, 20, 7880);
    			attr_dev(div10, "class", "form-item");
    			add_location(div10, file$3, 231, 16, 7788);
    			attr_dev(input5, "type", "checkbox");
    			attr_dev(input5, "class", "svelte-i6xr5l");
    			add_location(input5, file$3, 237, 24, 8053);
    			attr_dev(span1, "class", "slider svelte-i6xr5l");
    			add_location(span1, file$3, 238, 24, 8135);
    			attr_dev(label7, "class", "switch svelte-i6xr5l");
    			add_location(label7, file$3, 236, 20, 8006);
    			attr_dev(div11, "class", "form-item");
    			add_location(div11, file$3, 235, 16, 7962);
    			attr_dev(input6, "type", "checkbox");
    			attr_dev(input6, "class", "svelte-i6xr5l");
    			add_location(input6, file$3, 244, 24, 8378);
    			attr_dev(span2, "class", "slider svelte-i6xr5l");
    			add_location(span2, file$3, 245, 24, 8461);
    			attr_dev(label8, "class", "switch svelte-i6xr5l");
    			add_location(label8, file$3, 243, 20, 8331);
    			attr_dev(div12, "class", "form-item");
    			add_location(div12, file$3, 242, 16, 8287);
    			attr_dev(span3, "class", "btn");
    			add_location(span3, file$3, 250, 20, 8651);
    			attr_dev(span4, "class", "btn btn-secondary");
    			add_location(span4, file$3, 251, 20, 8706);
    			attr_dev(div13, "class", "form-item");
    			add_location(div13, file$3, 249, 16, 8607);
    			attr_dev(div14, "class", "pullout-body form");
    			add_location(div14, file$3, 187, 12, 5857);
    			attr_dev(div15, "class", "pullout");
    			toggle_class(div15, "in", /*pullout*/ ctx[3]);
    			add_location(div15, file$3, 183, 8, 5622);
    			attr_dev(div16, "class", "drawer");
    			add_location(div16, file$3, 181, 4, 5502);
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
    			select_option(select0, /*event*/ ctx[4].event_type);
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
    			set_input_value(input2, /*event*/ ctx[4].person);
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
    			input5.checked = /*event*/ ctx[4].medical_bool;
    			append_dev(label7, t36);
    			append_dev(label7, span1);
    			append_dev(div11, t37);
    			append_dev(div14, t38);
    			append_dev(div14, div12);
    			append_dev(div12, label8);
    			append_dev(label8, input6);
    			input6.checked = /*event*/ ctx[4].losttime_bool;
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
    					listen_dev(span0, "click", /*hide_event_drawer*/ ctx[9], false, false, false),
    					listen_dev(select0, "change", /*select0_change_handler*/ ctx[18]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[19]),
    					listen_dev(input5, "change", /*input5_change_handler*/ ctx[20]),
    					listen_dev(input6, "change", /*input6_change_handler*/ ctx[21]),
    					listen_dev(span4, "click", /*hide_event_drawer*/ ctx[9], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*mask_visible*/ 4) {
    				toggle_class(div0, "visible", /*mask_visible*/ ctx[2]);
    			}

    			if (dirty & /*mask_block*/ 2) {
    				toggle_class(div0, "block", /*mask_block*/ ctx[1]);
    			}

    			if (dirty & /*event*/ 16) {
    				select_option(select0, /*event*/ ctx[4].event_type);
    			}

    			if (dirty & /*event*/ 16 && input2.value !== /*event*/ ctx[4].person) {
    				set_input_value(input2, /*event*/ ctx[4].person);
    			}

    			if (dirty & /*event*/ 16) {
    				input5.checked = /*event*/ ctx[4].medical_bool;
    			}

    			if (dirty & /*event*/ 16) {
    				input6.checked = /*event*/ ctx[4].losttime_bool;
    			}

    			if (dirty & /*pullout*/ 8) {
    				toggle_class(div15, "in", /*pullout*/ ctx[3]);
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
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(181:0) {#if show_drawer}",
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
    	let a2;
    	let t5;
    	let li3;
    	let t7;
    	let div1;
    	let a3;
    	let t8;
    	let a4;
    	let t9;
    	let a5;
    	let t10;
    	let a6;
    	let t11;
    	let a7;
    	let t13;
    	let a8;
    	let t15;
    	let div7;
    	let div5;
    	let h1;
    	let i;
    	let t16;
    	let t17;
    	let div4;
    	let div3;
    	let t19;
    	let h40;
    	let t21;
    	let ul1;
    	let li4;
    	let a9;
    	let t23;
    	let li5;
    	let a10;
    	let t25;
    	let h41;
    	let t27;
    	let ul2;
    	let li6;
    	let t29;
    	let li7;
    	let t31;
    	let li8;
    	let t33;
    	let li9;
    	let t35;
    	let li10;
    	let t37;
    	let div6;
    	let current_block_type_index;
    	let if_block0;
    	let t38;
    	let if_block1_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block_1, create_if_block_2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*tab*/ ctx[5] == "report") return 0;
    		if (/*tab*/ ctx[5] == "events") return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	let if_block1 = /*show_drawer*/ ctx[0] && create_if_block$1(ctx);

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
    			li3.textContent = "New";
    			t7 = space();
    			div1 = element("div");
    			a3 = element("a");
    			t8 = space();
    			a4 = element("a");
    			t9 = space();
    			a5 = element("a");
    			t10 = space();
    			a6 = element("a");
    			t11 = space();
    			a7 = element("a");
    			a7.textContent = "Save Progress";
    			t13 = space();
    			a8 = element("a");
    			a8.textContent = "Submit";
    			t15 = space();
    			div7 = element("div");
    			div5 = element("div");
    			h1 = element("h1");
    			i = element("i");
    			t16 = text(" Incident");
    			t17 = space();
    			div4 = element("div");
    			div3 = element("div");
    			div3.textContent = "Draft";
    			t19 = space();
    			h40 = element("h4");
    			h40.textContent = "Tabs";
    			t21 = space();
    			ul1 = element("ul");
    			li4 = element("li");
    			a9 = element("a");
    			a9.textContent = "Report";
    			t23 = space();
    			li5 = element("li");
    			a10 = element("a");
    			a10.textContent = "Events";
    			t25 = space();
    			h41 = element("h4");
    			h41.textContent = "Tools";
    			t27 = space();
    			ul2 = element("ul");
    			li6 = element("li");
    			li6.textContent = "Witnesses";
    			t29 = space();
    			li7 = element("li");
    			li7.textContent = "Vehicles";
    			t31 = space();
    			li8 = element("li");
    			li8.textContent = "Attachments";
    			t33 = space();
    			li9 = element("li");
    			li9.textContent = "Links";
    			t35 = space();
    			li10 = element("li");
    			li10.textContent = "Claim";
    			t37 = space();
    			div6 = element("div");
    			if (if_block0) if_block0.c();
    			t38 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			attr_dev(a0, "href", "#platform");
    			attr_dev(a0, "class", "svelte-i6xr5l");
    			add_location(a0, file$3, 111, 16, 2722);
    			attr_dev(li0, "class", "svelte-i6xr5l");
    			add_location(li0, file$3, 111, 12, 2718);
    			attr_dev(a1, "href", "#ehs");
    			attr_dev(a1, "class", "svelte-i6xr5l");
    			add_location(a1, file$3, 112, 16, 2815);
    			attr_dev(li1, "class", "svelte-i6xr5l");
    			add_location(li1, file$3, 112, 12, 2811);
    			attr_dev(a2, "href", "#ehs/incidents");
    			attr_dev(a2, "class", "svelte-i6xr5l");
    			add_location(a2, file$3, 113, 16, 2892);
    			attr_dev(li2, "class", "svelte-i6xr5l");
    			add_location(li2, file$3, 113, 12, 2888);
    			add_location(li3, file$3, 114, 12, 2987);
    			attr_dev(ul0, "class", "breadcrumb");
    			add_location(ul0, file$3, 110, 8, 2682);
    			attr_dev(div0, "class", "col12 col-md-6");
    			add_location(div0, file$3, 109, 4, 2645);
    			attr_dev(a3, "href", "/");
    			attr_dev(a3, "class", "i-trash i-24");
    			add_location(a3, file$3, 118, 8, 3077);
    			attr_dev(a4, "href", "/");
    			attr_dev(a4, "class", "i-actions i-24");
    			add_location(a4, file$3, 119, 8, 3124);
    			attr_dev(a5, "href", "/");
    			attr_dev(a5, "class", "i-attachment i-24");
    			add_location(a5, file$3, 120, 8, 3173);
    			attr_dev(a6, "href", "/");
    			attr_dev(a6, "class", "i-printer i-24");
    			add_location(a6, file$3, 121, 8, 3225);
    			attr_dev(a7, "href", "/");
    			attr_dev(a7, "class", "btn btn-secondary");
    			add_location(a7, file$3, 122, 8, 3274);
    			attr_dev(a8, "href", "/");
    			attr_dev(a8, "class", "btn");
    			add_location(a8, file$3, 123, 8, 3338);
    			attr_dev(div1, "class", "col12 col-md-6 text-right");
    			add_location(div1, file$3, 117, 4, 3029);
    			attr_dev(div2, "class", "row sticky");
    			add_location(div2, file$3, 108, 0, 2616);
    			attr_dev(i, "class", "i-incidents i-32");
    			add_location(i, file$3, 128, 12, 3454);
    			add_location(h1, file$3, 128, 8, 3450);
    			attr_dev(div3, "class", "card-body");
    			add_location(div3, file$3, 130, 12, 3540);
    			attr_dev(div4, "class", "card svelte-i6xr5l");
    			add_location(div4, file$3, 129, 8, 3509);
    			attr_dev(h40, "class", "svelte-i6xr5l");
    			add_location(h40, file$3, 134, 8, 3628);
    			attr_dev(a9, "href", "#ehs/incidents/incidents_new/report");
    			attr_dev(a9, "class", "svelte-i6xr5l");
    			add_location(a9, file$3, 136, 49, 3722);
    			attr_dev(li4, "class", "svelte-i6xr5l");
    			toggle_class(li4, "active", /*tab*/ ctx[5] == "report");
    			add_location(li4, file$3, 136, 12, 3685);
    			attr_dev(a10, "href", "#ehs/incidents/incidents_new/events");
    			attr_dev(a10, "class", "svelte-i6xr5l");
    			add_location(a10, file$3, 137, 49, 3895);
    			attr_dev(li5, "class", "svelte-i6xr5l");
    			toggle_class(li5, "active", /*tab*/ ctx[5] == "events");
    			add_location(li5, file$3, 137, 12, 3858);
    			attr_dev(ul1, "class", "side_menu svelte-i6xr5l");
    			add_location(ul1, file$3, 135, 8, 3650);
    			attr_dev(h41, "class", "svelte-i6xr5l");
    			add_location(h41, file$3, 139, 8, 4041);
    			attr_dev(li6, "class", "svelte-i6xr5l");
    			add_location(li6, file$3, 141, 12, 4099);
    			attr_dev(li7, "class", "svelte-i6xr5l");
    			add_location(li7, file$3, 142, 12, 4130);
    			attr_dev(li8, "class", "svelte-i6xr5l");
    			add_location(li8, file$3, 143, 12, 4160);
    			attr_dev(li9, "class", "svelte-i6xr5l");
    			add_location(li9, file$3, 144, 12, 4193);
    			attr_dev(li10, "class", "svelte-i6xr5l");
    			add_location(li10, file$3, 145, 12, 4220);
    			attr_dev(ul2, "class", "side_menu svelte-i6xr5l");
    			add_location(ul2, file$3, 140, 8, 4064);
    			attr_dev(div5, "class", "col12 col-md-3");
    			add_location(div5, file$3, 127, 4, 3413);
    			attr_dev(div6, "class", "col12 col-md-9");
    			add_location(div6, file$3, 148, 4, 4264);
    			attr_dev(div7, "class", "row");
    			add_location(div7, file$3, 126, 0, 3391);
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
    			append_dev(div1, t8);
    			append_dev(div1, a4);
    			append_dev(div1, t9);
    			append_dev(div1, a5);
    			append_dev(div1, t10);
    			append_dev(div1, a6);
    			append_dev(div1, t11);
    			append_dev(div1, a7);
    			append_dev(div1, t13);
    			append_dev(div1, a8);
    			insert_dev(target, t15, anchor);
    			insert_dev(target, div7, anchor);
    			append_dev(div7, div5);
    			append_dev(div5, h1);
    			append_dev(h1, i);
    			append_dev(h1, t16);
    			append_dev(div5, t17);
    			append_dev(div5, div4);
    			append_dev(div4, div3);
    			append_dev(div5, t19);
    			append_dev(div5, h40);
    			append_dev(div5, t21);
    			append_dev(div5, ul1);
    			append_dev(ul1, li4);
    			append_dev(li4, a9);
    			append_dev(ul1, t23);
    			append_dev(ul1, li5);
    			append_dev(li5, a10);
    			append_dev(div5, t25);
    			append_dev(div5, h41);
    			append_dev(div5, t27);
    			append_dev(div5, ul2);
    			append_dev(ul2, li6);
    			append_dev(ul2, t29);
    			append_dev(ul2, li7);
    			append_dev(ul2, t31);
    			append_dev(ul2, li8);
    			append_dev(ul2, t33);
    			append_dev(ul2, li9);
    			append_dev(ul2, t35);
    			append_dev(ul2, li10);
    			append_dev(div7, t37);
    			append_dev(div7, div6);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(div6, null);
    			}

    			insert_dev(target, t38, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(a0, "click", /*click_handler*/ ctx[12], false, false, false),
    					listen_dev(a1, "click", /*click_handler_1*/ ctx[13], false, false, false),
    					listen_dev(a2, "click", /*click_handler_2*/ ctx[14], false, false, false),
    					listen_dev(a9, "click", /*click_handler_3*/ ctx[15], false, false, false),
    					listen_dev(a10, "click", /*click_handler_4*/ ctx[16], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*tab*/ 32) {
    				toggle_class(li4, "active", /*tab*/ ctx[5] == "report");
    			}

    			if (dirty & /*tab*/ 32) {
    				toggle_class(li5, "active", /*tab*/ ctx[5] == "events");
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block0) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block0 = if_blocks[current_block_type_index];

    					if (!if_block0) {
    						if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block0.c();
    					} else {
    						if_block0.p(ctx, dirty);
    					}

    					transition_in(if_block0, 1);
    					if_block0.m(div6, null);
    				} else {
    					if_block0 = null;
    				}
    			}

    			if (/*show_drawer*/ ctx[0]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(div7);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			if (detaching) detach_dev(t38);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Frame_incidents_new", slots, []);
    	const dispatch = createEventDispatcher();
    	let form_test = "Form testttttt";

    	let f = [
    		{
    			item_type: "section",
    			label: "Section name",
    			children: [
    				{
    					item_type: "input_select",
    					id: "0_1",
    					label: "Type of ID",
    					hint: false,
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
    					label: "Name",
    					hint: "As it appears on your ID",
    					placeholder: "eg. Joe K Bloggs",
    					answer: ""
    				},
    				{
    					item_type: "input_textarea",
    					id: "0_3",
    					label: "Write a short essay",
    					hint: "Go on, let it all out",
    					answer: ""
    				}
    			]
    		}
    	];

    	let form_text = "";

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
    		$$invalidate(0, show_drawer = true);
    		$$invalidate(1, mask_block = false);
    		$$invalidate(2, mask_visible = true);

    		setTimeout(
    			() => {
    				$$invalidate(3, pullout = true);
    			},
    			300
    		);
    	}

    	function hide_event_drawer() {
    		$$invalidate(1, mask_block = false);
    		$$invalidate(2, mask_visible = false);
    		$$invalidate(3, pullout = false);

    		setTimeout(
    			() => {
    				$$invalidate(0, show_drawer = false);
    			},
    			1000
    		);
    	}

    	let tab = "report";
    	let { tabnav = "" } = $$props;

    	function nav(str) {
    		dispatch("nav", { text: str });
    	}

    	const writable_props = ["tabnav"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Frame_incidents_new> was created with unknown prop '${key}'`);
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

    	const click_handler_3 = () => nav("ehs/incidents/incidents_new/report");
    	const click_handler_4 = () => nav("ehs/incidents/incidents_new/events");
    	const click_handler_5 = () => nav("ehs/incidents/incidents_new/report");

    	function select0_change_handler() {
    		event.event_type = select_value(this);
    		$$invalidate(4, event);
    	}

    	function input2_input_handler() {
    		event.person = this.value;
    		$$invalidate(4, event);
    	}

    	function input5_change_handler() {
    		event.medical_bool = this.checked;
    		$$invalidate(4, event);
    	}

    	function input6_change_handler() {
    		event.losttime_bool = this.checked;
    		$$invalidate(4, event);
    	}

    	$$self.$$set = $$props => {
    		if ("tabnav" in $$props) $$invalidate(11, tabnav = $$props.tabnav);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		Form,
    		dispatch,
    		form_test,
    		f,
    		form_text,
    		update_payload_text,
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
    		nav
    	});

    	$$self.$inject_state = $$props => {
    		if ("form_test" in $$props) form_test = $$props.form_test;
    		if ("f" in $$props) $$invalidate(6, f = $$props.f);
    		if ("form_text" in $$props) form_text = $$props.form_text;
    		if ("show_drawer" in $$props) $$invalidate(0, show_drawer = $$props.show_drawer);
    		if ("mask_block" in $$props) $$invalidate(1, mask_block = $$props.mask_block);
    		if ("mask_visible" in $$props) $$invalidate(2, mask_visible = $$props.mask_visible);
    		if ("pullout" in $$props) $$invalidate(3, pullout = $$props.pullout);
    		if ("add_event" in $$props) add_event = $$props.add_event;
    		if ("events" in $$props) events = $$props.events;
    		if ("event" in $$props) $$invalidate(4, event = $$props.event);
    		if ("tab" in $$props) $$invalidate(5, tab = $$props.tab);
    		if ("tabnav" in $$props) $$invalidate(11, tabnav = $$props.tabnav);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*tabnav*/ 2048) {
    			{
    				let t = tabnav;

    				if (tabnav !== "") {
    					$$invalidate(5, tab = t);
    				}
    			}
    		}
    	};

    	{
    		let daform = f;
    		form_text = JSON.stringify(daform, null, 4);
    	}

    	return [
    		show_drawer,
    		mask_block,
    		mask_visible,
    		pullout,
    		event,
    		tab,
    		f,
    		update_payload_text,
    		show_event_drawer,
    		hide_event_drawer,
    		nav,
    		tabnav,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5,
    		select0_change_handler,
    		input2_input_handler,
    		input5_change_handler,
    		input6_change_handler
    	];
    }

    class Frame_incidents_new extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { tabnav: 11 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Frame_incidents_new",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get tabnav() {
    		throw new Error("<Frame_incidents_new>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tabnav(value) {
    		throw new Error("<Frame_incidents_new>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
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

    // (59:0) {#if grid}
    function create_if_block(ctx) {
    	let div1;
    	let div0;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(div0, "class", "frame svelte-1s2lye6");
    			add_location(div0, file, 59, 18, 1430);
    			attr_dev(div1, "class", "grid svelte-1s2lye6");
    			add_location(div1, file, 59, 0, 1412);
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
    		source: "(59:0) {#if grid}",
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
    			props: { tabnav: /*tabnav*/ ctx[0] },
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    		switch_instance.$on("nav", /*handleNav*/ ctx[3]);
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
    			add_location(path0, file, 66, 3, 1652);
    			attr_dev(path1, "d", "M39.292 22.0918V8.0918H48.252V10.1018H41.552V13.9918H47.632V16.0018H41.552V20.0918H48.252V22.0918H39.292Z");
    			attr_dev(path1, "fill", "black");
    			add_location(path1, file, 67, 3, 2800);
    			attr_dev(path2, "d", "M54.6821 22.3318C53.9321 22.3318 53.2621 22.2018 52.6721 21.9518C52.0821 21.7018 51.5922 21.3318 51.1922 20.8618C50.7922 20.3918 50.4821 19.8118 50.2721 19.1418C50.0621 18.4718 49.9521 17.7118 49.9521 16.8818C49.9521 16.0518 50.0621 15.3018 50.2721 14.6218C50.4821 13.9518 50.7922 13.3718 51.1922 12.9018C51.5922 12.4318 52.0921 12.0618 52.6721 11.8118C53.2621 11.5618 53.9321 11.4318 54.6821 11.4318C55.7221 11.4318 56.5821 11.6618 57.2521 12.1318C57.9221 12.6018 58.4121 13.2218 58.7121 14.0018L56.9121 14.8418C56.7621 14.3618 56.5121 13.9718 56.1421 13.6918C55.7721 13.4018 55.2922 13.2618 54.6922 13.2618C53.8922 13.2618 53.2822 13.5118 52.8722 14.0118C52.4622 14.5118 52.2621 15.1618 52.2621 15.9618V17.8218C52.2621 18.6218 52.4622 19.2718 52.8722 19.7718C53.2822 20.2718 53.8822 20.5218 54.6922 20.5218C55.3321 20.5218 55.8421 20.3618 56.2221 20.0518C56.6021 19.7418 56.9021 19.3218 57.1321 18.8018L58.7921 19.6818C58.4421 20.5418 57.9221 21.2018 57.2321 21.6618C56.5321 22.1018 55.6821 22.3318 54.6821 22.3318Z");
    			attr_dev(path2, "fill", "black");
    			add_location(path2, file, 68, 3, 2934);
    			attr_dev(path3, "d", "M64.8518 22.3318C64.1318 22.3318 63.4718 22.2018 62.8818 21.9518C62.2818 21.7018 61.7818 21.3318 61.3718 20.8618C60.9518 20.3918 60.6318 19.8118 60.4118 19.1418C60.1818 18.4718 60.0718 17.7118 60.0718 16.8818C60.0718 16.0518 60.1818 15.3018 60.4118 14.6218C60.6418 13.9518 60.9618 13.3718 61.3718 12.9018C61.7818 12.4318 62.2918 12.0618 62.8818 11.8118C63.4718 11.5618 64.1318 11.4318 64.8518 11.4318C65.5718 11.4318 66.2318 11.5618 66.8318 11.8118C67.4218 12.0618 67.9318 12.4318 68.3418 12.9018C68.7518 13.3718 69.0818 13.9518 69.3018 14.6218C69.5318 15.3018 69.6418 16.0518 69.6418 16.8818C69.6418 17.7118 69.5318 18.4618 69.3018 19.1418C69.0718 19.8218 68.7518 20.3918 68.3418 20.8618C67.9318 21.3318 67.4218 21.7018 66.8318 21.9518C66.2318 22.2018 65.5718 22.3318 64.8518 22.3318ZM64.8518 20.5018C65.6018 20.5018 66.2018 20.2718 66.6618 19.8118C67.1118 19.3518 67.3418 18.6618 67.3418 17.7518V15.9918C67.3418 15.0718 67.1118 14.3918 66.6618 13.9318C66.2018 13.4718 65.6018 13.2418 64.8518 13.2418C64.1018 13.2418 63.5018 13.4718 63.0518 13.9318C62.6018 14.3918 62.3718 15.0818 62.3718 15.9918V17.7518C62.3718 18.6718 62.6018 19.3518 63.0518 19.8118C63.5018 20.2718 64.1018 20.5018 64.8518 20.5018Z");
    			attr_dev(path3, "fill", "black");
    			add_location(path3, file, 69, 3, 3980);
    			attr_dev(path4, "d", "M77.832 22.3318C76.922 22.3318 76.092 22.1718 75.352 21.8618C74.612 21.5518 73.972 21.0918 73.442 20.4818C72.912 19.8718 72.502 19.1218 72.222 18.2118C71.932 17.3118 71.792 16.2718 71.792 15.0918C71.792 13.9118 71.932 12.8718 72.222 11.9718C72.512 11.0718 72.912 10.3118 73.442 9.70181C73.972 9.09181 74.602 8.63181 75.352 8.32181C76.092 8.01181 76.922 7.85181 77.832 7.85181C78.742 7.85181 79.562 8.01181 80.312 8.32181C81.052 8.63181 81.692 9.10181 82.222 9.70181C82.752 10.3118 83.162 11.0618 83.442 11.9718C83.732 12.8718 83.872 13.9118 83.872 15.0918C83.872 16.2718 83.732 17.3118 83.442 18.2118C83.152 19.1118 82.742 19.8718 82.222 20.4818C81.692 21.0918 81.062 21.5518 80.312 21.8618C79.562 22.1718 78.742 22.3318 77.832 22.3318ZM77.832 20.3218C78.362 20.3218 78.862 20.2318 79.302 20.0418C79.752 19.8518 80.132 19.5818 80.442 19.2218C80.752 18.8618 81.002 18.4318 81.172 17.9218C81.342 17.4118 81.432 16.8318 81.432 16.1918V13.9818C81.432 13.3418 81.342 12.7618 81.172 12.2518C81.002 11.7418 80.752 11.3118 80.442 10.9518C80.132 10.5918 79.742 10.3218 79.302 10.1318C78.852 9.94181 78.362 9.85181 77.832 9.85181C77.282 9.85181 76.792 9.94181 76.352 10.1318C75.912 10.3218 75.532 10.5918 75.222 10.9518C74.912 11.3118 74.662 11.7418 74.492 12.2518C74.322 12.7618 74.232 13.3418 74.232 13.9818V16.1918C74.232 16.8318 74.322 17.4118 74.492 17.9218C74.662 18.4318 74.912 18.8618 75.222 19.2218C75.532 19.5818 75.912 19.8518 76.352 20.0418C76.782 20.2318 77.282 20.3218 77.832 20.3218Z");
    			attr_dev(path4, "fill", "black");
    			add_location(path4, file, 70, 3, 5211);
    			attr_dev(path5, "d", "M86.1421 22.0918V11.6618H88.3321V13.3918H88.4321C88.6621 12.8318 89.0021 12.3618 89.4621 11.9918C89.9221 11.6218 90.5521 11.4318 91.3521 11.4318C92.4221 11.4318 93.2521 11.7818 93.8521 12.4818C94.4421 13.1818 94.7421 14.1818 94.7421 15.4818V22.0918H92.5521V15.7518C92.5521 14.1218 91.8921 13.3018 90.5821 13.3018C90.3021 13.3018 90.0221 13.3418 89.7521 13.4118C89.4821 13.4818 89.2321 13.5918 89.0221 13.7418C88.8121 13.8918 88.6421 14.0718 88.5121 14.3018C88.3821 14.5318 88.3221 14.7918 88.3221 15.1018V22.0918H86.1421Z");
    			attr_dev(path5, "fill", "black");
    			add_location(path5, file, 71, 3, 6728);
    			attr_dev(path6, "d", "M99.7522 22.0918C99.0022 22.0918 98.4422 21.9018 98.0822 21.5218C97.7122 21.1418 97.5322 20.6118 97.5322 19.9318V7.25183H99.7222V20.3018H101.162V22.0918H99.7522Z");
    			attr_dev(path6, "fill", "black");
    			add_location(path6, file, 72, 3, 7278);
    			attr_dev(path7, "d", "M104.102 9.80181C103.652 9.80181 103.312 9.69181 103.112 9.48181C102.902 9.27181 102.802 8.99181 102.802 8.66181V8.31181C102.802 7.98181 102.902 7.70181 103.112 7.49181C103.322 7.28181 103.652 7.17181 104.102 7.17181C104.552 7.17181 104.882 7.28181 105.082 7.49181C105.282 7.70181 105.382 7.98181 105.382 8.31181V8.65181C105.382 8.98181 105.282 9.26181 105.082 9.47181C104.882 9.69181 104.562 9.80181 104.102 9.80181ZM103.002 11.6618H105.192V22.0918H103.002V11.6618Z");
    			attr_dev(path7, "fill", "black");
    			add_location(path7, file, 73, 3, 7468);
    			attr_dev(path8, "d", "M108.052 22.0918V11.6618H110.242V13.3918H110.342C110.572 12.8318 110.912 12.3618 111.372 11.9918C111.832 11.6218 112.462 11.4318 113.262 11.4318C114.332 11.4318 115.162 11.7818 115.762 12.4818C116.352 13.1818 116.652 14.1818 116.652 15.4818V22.0918H114.462V15.7518C114.462 14.1218 113.802 13.3018 112.492 13.3018C112.212 13.3018 111.932 13.3418 111.662 13.4118C111.392 13.4818 111.142 13.5918 110.932 13.7418C110.722 13.8918 110.552 14.0718 110.422 14.3018C110.292 14.5318 110.232 14.7918 110.232 15.1018V22.0918H108.052Z");
    			attr_dev(path8, "fill", "black");
    			add_location(path8, file, 74, 3, 7963);
    			attr_dev(path9, "d", "M123.662 22.3318C122.912 22.3318 122.242 22.2018 121.652 21.9518C121.062 21.7018 120.562 21.3318 120.152 20.8618C119.742 20.3918 119.422 19.8118 119.202 19.1418C118.982 18.4718 118.872 17.7118 118.872 16.8818C118.872 16.0518 118.982 15.3018 119.202 14.6218C119.422 13.9518 119.742 13.3718 120.152 12.9018C120.562 12.4318 121.072 12.0618 121.652 11.8118C122.242 11.5618 122.912 11.4318 123.662 11.4318C124.422 11.4318 125.092 11.5618 125.682 11.8318C126.262 12.1018 126.752 12.4718 127.132 12.9418C127.512 13.4118 127.812 13.9718 128.002 14.5918C128.192 15.2218 128.292 15.8918 128.292 16.6218V17.4418H121.132V17.7818C121.132 18.5818 121.372 19.2318 121.842 19.7418C122.312 20.2518 122.992 20.5118 123.882 20.5118C124.522 20.5118 125.062 20.3718 125.502 20.0918C125.942 19.8118 126.312 19.4318 126.622 18.9518L127.902 20.2218C127.512 20.8618 126.952 21.3818 126.222 21.7618C125.492 22.1418 124.632 22.3318 123.662 22.3318ZM123.662 13.1218C123.292 13.1218 122.942 13.1918 122.632 13.3218C122.322 13.4518 122.052 13.6418 121.832 13.8818C121.612 14.1218 121.442 14.4118 121.322 14.7418C121.202 15.0718 121.142 15.4418 121.142 15.8418V15.9818H125.992V15.7818C125.992 14.9818 125.782 14.3318 125.372 13.8518C124.952 13.3718 124.382 13.1218 123.662 13.1218Z");
    			attr_dev(path9, "fill", "black");
    			add_location(path9, file, 75, 3, 8513);
    			attr_dev(svg, "width", "129");
    			attr_dev(svg, "height", "33");
    			attr_dev(svg, "viewBox", "0 0 129 33");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file, 65, 2, 1499);
    			attr_dev(i0, "class", "i-search i-20");
    			add_location(i0, file, 79, 3, 9829);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "Type a keyword to begin your search");
    			add_location(input, file, 80, 3, 9862);
    			attr_dev(div0, "class", "search-bar");
    			add_location(div0, file, 78, 2, 9801);
    			attr_dev(i1, "class", "i-rocket i-24");
    			add_location(i1, file, 84, 27, 10008);
    			attr_dev(span0, "class", "menu-icon");
    			add_location(span0, file, 84, 3, 9984);
    			attr_dev(i2, "class", "i-filter i-24");
    			add_location(i2, file, 85, 27, 10072);
    			attr_dev(span1, "class", "menu-icon");
    			add_location(span1, file, 85, 3, 10048);
    			attr_dev(i3, "class", "i-notification i-24");
    			add_location(i3, file, 86, 27, 10136);
    			attr_dev(span2, "class", "menu-icon");
    			add_location(span2, file, 86, 3, 10112);
    			attr_dev(i4, "class", "i-switcher i-24");
    			add_location(i4, file, 87, 27, 10206);
    			attr_dev(span3, "class", "menu-icon");
    			add_location(span3, file, 87, 3, 10182);
    			attr_dev(span4, "class", "menu-icon profile-picture");
    			add_location(span4, file, 88, 3, 10248);
    			attr_dev(i5, "class", "i-menu i-24");
    			add_location(i5, file, 90, 34, 10332);
    			attr_dev(span5, "class", "menu-icon mobile");
    			add_location(span5, file, 90, 3, 10301);
    			attr_dev(div1, "class", "menu-icons text-right");
    			add_location(div1, file, 83, 2, 9945);
    			attr_dev(div2, "class", "frame svelte-1s2lye6");
    			add_location(div2, file, 63, 1, 1476);
    			attr_dev(nav, "class", "svelte-1s2lye6");
    			add_location(nav, file, 61, 0, 1468);
    			attr_dev(div3, "class", "frame svelte-1s2lye6");
    			add_location(div3, file, 99, 1, 10406);
    			attr_dev(main, "class", "svelte-1s2lye6");
    			add_location(main, file, 98, 0, 10398);
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
    				dispose = listen_dev(svg, "click", /*click_handler*/ ctx[4], false, false, false);
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
    					switch_instance.$on("nav", /*handleNav*/ ctx[3]);
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
    			dispose();
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
    		QueriesNew: Frame_queries_new,
    		QueriesResult: Frame_queries_result,
    		tabnav,
    		comps,
    		comp,
    		hash,
    		grid,
    		handleNavStr,
    		handleNav
    	});

    	$$self.$inject_state = $$props => {
    		if ("tabnav" in $$props) $$invalidate(0, tabnav = $$props.tabnav);
    		if ("comp" in $$props) $$invalidate(1, comp = $$props.comp);
    		if ("hash" in $$props) hash = $$props.hash;
    		if ("grid" in $$props) $$invalidate(2, grid = $$props.grid);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [tabnav, comp, grid, handleNav, click_handler];
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
