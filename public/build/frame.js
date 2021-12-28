
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
    const file$2 = "src/Frame_home.svelte";

    // (219:29) 
    function create_if_block_3(ctx) {
    	let h2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "My Tasks";
    			add_location(h2, file$2, 219, 8, 10038);
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
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(219:29) ",
    		ctx
    	});

    	return block;
    }

    // (217:31) 
    function create_if_block_2(ctx) {
    	let h2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Reports";
    			add_location(h2, file$2, 217, 8, 9983);
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
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(217:31) ",
    		ctx
    	});

    	return block;
    }

    // (215:34) 
    function create_if_block_1$1(ctx) {
    	let h2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Dashboards";
    			add_location(h2, file$2, 215, 8, 9923);
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
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(215:34) ",
    		ctx
    	});

    	return block;
    }

    // (31:4) {#if tab == 'home'}
    function create_if_block$2(ctx) {
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
    			add_location(div0, file$2, 34, 20, 1210);
    			add_location(b0, file$2, 35, 20, 1323);
    			attr_dev(a0, "href", "./");
    			attr_dev(a0, "class", "add");
    			add_location(a0, file$2, 37, 24, 1404);
    			attr_dev(a1, "href", "./");
    			attr_dev(a1, "class", "filter");
    			add_location(a1, file$2, 38, 24, 1459);
    			attr_dev(a2, "href", "./");
    			attr_dev(a2, "class", "summary");
    			add_location(a2, file$2, 39, 24, 1517);
    			attr_dev(a3, "href", "./");
    			attr_dev(a3, "class", "tool");
    			add_location(a3, file$2, 40, 24, 1576);
    			attr_dev(div1, "class", "tools");
    			add_location(div1, file$2, 36, 20, 1360);
    			attr_dev(div2, "class", "tile");
    			add_location(div2, file$2, 33, 16, 1117);
    			attr_dev(div3, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div3, file$2, 32, 12, 1055);
    			attr_dev(div4, "class", "icon");
    			set_style(div4, "background-image", "url(./images/ehs_svgs_clean/actions.svg)");
    			add_location(div4, file$2, 46, 20, 1790);
    			add_location(b1, file$2, 47, 20, 1901);
    			attr_dev(a4, "href", "./");
    			attr_dev(a4, "class", "add");
    			add_location(a4, file$2, 49, 24, 1980);
    			attr_dev(a5, "href", "./");
    			attr_dev(a5, "class", "filter");
    			add_location(a5, file$2, 50, 24, 2035);
    			attr_dev(a6, "href", "./");
    			attr_dev(a6, "class", "summary");
    			add_location(a6, file$2, 51, 24, 2093);
    			attr_dev(a7, "href", "./");
    			attr_dev(a7, "class", "tool");
    			add_location(a7, file$2, 52, 24, 2152);
    			attr_dev(div5, "class", "tools");
    			add_location(div5, file$2, 48, 20, 1936);
    			attr_dev(div6, "class", "tile");
    			add_location(div6, file$2, 45, 16, 1751);
    			attr_dev(div7, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div7, file$2, 44, 12, 1689);
    			attr_dev(div8, "class", "icon");
    			set_style(div8, "background-image", "url(./images/ehs_svgs_clean/audits.svg)");
    			add_location(div8, file$2, 58, 20, 2366);
    			add_location(b2, file$2, 59, 20, 2476);
    			attr_dev(a8, "href", "./");
    			attr_dev(a8, "class", "add");
    			add_location(a8, file$2, 61, 24, 2566);
    			attr_dev(a9, "href", "./");
    			attr_dev(a9, "class", "filter");
    			add_location(a9, file$2, 62, 24, 2621);
    			attr_dev(a10, "href", "./");
    			attr_dev(a10, "class", "summary");
    			add_location(a10, file$2, 63, 24, 2679);
    			attr_dev(a11, "href", "./");
    			attr_dev(a11, "class", "tool");
    			add_location(a11, file$2, 64, 24, 2738);
    			attr_dev(div9, "class", "tools");
    			add_location(div9, file$2, 60, 20, 2522);
    			attr_dev(div10, "class", "tile");
    			add_location(div10, file$2, 57, 16, 2327);
    			attr_dev(div11, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div11, file$2, 56, 12, 2265);
    			attr_dev(div12, "class", "icon");
    			set_style(div12, "background-image", "url(./images/ehs_svgs_clean/observations.svg)");
    			add_location(div12, file$2, 70, 20, 2952);
    			add_location(b3, file$2, 71, 20, 3068);
    			attr_dev(a12, "href", "./");
    			attr_dev(a12, "class", "add");
    			add_location(a12, file$2, 73, 24, 3151);
    			attr_dev(a13, "href", "./");
    			attr_dev(a13, "class", "filter");
    			add_location(a13, file$2, 74, 24, 3206);
    			attr_dev(a14, "href", "./");
    			attr_dev(a14, "class", "summary");
    			add_location(a14, file$2, 75, 24, 3264);
    			attr_dev(a15, "href", "./");
    			attr_dev(a15, "class", "tool");
    			add_location(a15, file$2, 76, 24, 3323);
    			attr_dev(div13, "class", "tools");
    			add_location(div13, file$2, 72, 20, 3107);
    			attr_dev(div14, "class", "tile");
    			add_location(div14, file$2, 69, 16, 2913);
    			attr_dev(div15, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div15, file$2, 68, 12, 2851);
    			attr_dev(div16, "class", "icon");
    			set_style(div16, "background-image", "url(./images/ehs_svgs_clean/risk_assessment.svg)");
    			add_location(div16, file$2, 82, 20, 3537);
    			add_location(b4, file$2, 83, 20, 3656);
    			attr_dev(a16, "href", "./");
    			attr_dev(a16, "class", "add");
    			add_location(a16, file$2, 85, 24, 3743);
    			attr_dev(a17, "href", "./");
    			attr_dev(a17, "class", "filter");
    			add_location(a17, file$2, 86, 24, 3798);
    			attr_dev(a18, "href", "./");
    			attr_dev(a18, "class", "summary");
    			add_location(a18, file$2, 87, 24, 3856);
    			attr_dev(a19, "href", "./");
    			attr_dev(a19, "class", "tool");
    			add_location(a19, file$2, 88, 24, 3915);
    			attr_dev(div17, "class", "tools");
    			add_location(div17, file$2, 84, 20, 3699);
    			attr_dev(div18, "class", "tile");
    			add_location(div18, file$2, 81, 16, 3498);
    			attr_dev(div19, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div19, file$2, 80, 12, 3436);
    			attr_dev(div20, "class", "icon");
    			set_style(div20, "background-image", "url(./images/ehs_svgs_clean/scheduling.svg)");
    			add_location(div20, file$2, 94, 20, 4129);
    			add_location(b5, file$2, 95, 20, 4243);
    			attr_dev(a20, "href", "./");
    			attr_dev(a20, "class", "add");
    			add_location(a20, file$2, 97, 24, 4325);
    			attr_dev(a21, "href", "./");
    			attr_dev(a21, "class", "filter");
    			add_location(a21, file$2, 98, 24, 4380);
    			attr_dev(a22, "href", "./");
    			attr_dev(a22, "class", "summary");
    			add_location(a22, file$2, 99, 24, 4438);
    			attr_dev(a23, "href", "./");
    			attr_dev(a23, "class", "tool");
    			add_location(a23, file$2, 100, 24, 4497);
    			attr_dev(div21, "class", "tools");
    			add_location(div21, file$2, 96, 20, 4281);
    			attr_dev(div22, "class", "tile");
    			add_location(div22, file$2, 93, 16, 4090);
    			attr_dev(div23, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div23, file$2, 92, 12, 4028);
    			attr_dev(div24, "class", "icon");
    			set_style(div24, "background-image", "url(./images/ehs_svgs_clean/epr.svg)");
    			add_location(div24, file$2, 106, 20, 4711);
    			add_location(b6, file$2, 107, 20, 4818);
    			attr_dev(a24, "href", "./");
    			attr_dev(a24, "class", "add");
    			add_location(a24, file$2, 109, 24, 4903);
    			attr_dev(a25, "href", "./");
    			attr_dev(a25, "class", "filter");
    			add_location(a25, file$2, 110, 24, 4958);
    			attr_dev(a26, "href", "./");
    			attr_dev(a26, "class", "summary");
    			add_location(a26, file$2, 111, 24, 5016);
    			attr_dev(a27, "href", "./");
    			attr_dev(a27, "class", "tool");
    			add_location(a27, file$2, 112, 24, 5075);
    			attr_dev(div25, "class", "tools");
    			add_location(div25, file$2, 108, 20, 4859);
    			attr_dev(div26, "class", "tile");
    			add_location(div26, file$2, 105, 16, 4672);
    			attr_dev(div27, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div27, file$2, 104, 12, 4610);
    			attr_dev(div28, "class", "icon");
    			set_style(div28, "background-image", "url(./images/ehs_svgs_clean/period_statistics.svg)");
    			add_location(div28, file$2, 118, 20, 5289);
    			add_location(b7, file$2, 119, 20, 5410);
    			attr_dev(a28, "href", "./");
    			attr_dev(a28, "class", "add");
    			add_location(a28, file$2, 121, 24, 5499);
    			attr_dev(a29, "href", "./");
    			attr_dev(a29, "class", "filter");
    			add_location(a29, file$2, 122, 24, 5554);
    			attr_dev(a30, "href", "./");
    			attr_dev(a30, "class", "summary");
    			add_location(a30, file$2, 123, 24, 5612);
    			attr_dev(a31, "href", "./");
    			attr_dev(a31, "class", "tool");
    			add_location(a31, file$2, 124, 24, 5671);
    			attr_dev(div29, "class", "tools");
    			add_location(div29, file$2, 120, 20, 5455);
    			attr_dev(div30, "class", "tile");
    			add_location(div30, file$2, 117, 16, 5250);
    			attr_dev(div31, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div31, file$2, 116, 12, 5188);
    			attr_dev(div32, "class", "icon");
    			set_style(div32, "background-image", "url(./images/ehs_svgs_clean/register.svg)");
    			add_location(div32, file$2, 130, 20, 5885);
    			add_location(b8, file$2, 131, 20, 5997);
    			attr_dev(a32, "href", "./");
    			attr_dev(a32, "class", "add");
    			add_location(a32, file$2, 133, 24, 6077);
    			attr_dev(a33, "href", "./");
    			attr_dev(a33, "class", "filter");
    			add_location(a33, file$2, 134, 24, 6132);
    			attr_dev(a34, "href", "./");
    			attr_dev(a34, "class", "summary");
    			add_location(a34, file$2, 135, 24, 6190);
    			attr_dev(a35, "href", "./");
    			attr_dev(a35, "class", "tool");
    			add_location(a35, file$2, 136, 24, 6249);
    			attr_dev(div33, "class", "tools");
    			add_location(div33, file$2, 132, 20, 6033);
    			attr_dev(div34, "class", "tile");
    			add_location(div34, file$2, 129, 16, 5846);
    			attr_dev(div35, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div35, file$2, 128, 12, 5784);
    			attr_dev(div36, "class", "icon");
    			set_style(div36, "background-image", "url(./images/ehs_svgs_clean/advanced_rca.svg)");
    			add_location(div36, file$2, 142, 20, 6463);
    			add_location(b9, file$2, 143, 20, 6579);
    			attr_dev(a36, "href", "./");
    			attr_dev(a36, "class", "add");
    			add_location(a36, file$2, 145, 24, 6664);
    			attr_dev(a37, "href", "./");
    			attr_dev(a37, "class", "filter");
    			add_location(a37, file$2, 146, 24, 6719);
    			attr_dev(a38, "href", "./");
    			attr_dev(a38, "class", "summary");
    			add_location(a38, file$2, 147, 24, 6777);
    			attr_dev(a39, "href", "./");
    			attr_dev(a39, "class", "tool");
    			add_location(a39, file$2, 148, 24, 6836);
    			attr_dev(div37, "class", "tools");
    			add_location(div37, file$2, 144, 20, 6620);
    			attr_dev(div38, "class", "tile");
    			add_location(div38, file$2, 141, 16, 6424);
    			attr_dev(div39, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div39, file$2, 140, 12, 6362);
    			attr_dev(div40, "class", "icon");
    			set_style(div40, "background-image", "url(./images/ehs_svgs_clean/documents.svg)");
    			add_location(div40, file$2, 154, 20, 7050);
    			add_location(b10, file$2, 155, 20, 7163);
    			attr_dev(a40, "href", "./");
    			attr_dev(a40, "class", "add");
    			add_location(a40, file$2, 157, 24, 7243);
    			attr_dev(a41, "href", "./");
    			attr_dev(a41, "class", "filter");
    			add_location(a41, file$2, 158, 24, 7298);
    			attr_dev(a42, "href", "./");
    			attr_dev(a42, "class", "summary");
    			add_location(a42, file$2, 159, 24, 7356);
    			attr_dev(a43, "href", "./");
    			attr_dev(a43, "class", "tool");
    			add_location(a43, file$2, 160, 24, 7415);
    			attr_dev(div41, "class", "tools");
    			add_location(div41, file$2, 156, 20, 7199);
    			attr_dev(div42, "class", "tile");
    			add_location(div42, file$2, 153, 16, 7011);
    			attr_dev(div43, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div43, file$2, 152, 12, 6949);
    			attr_dev(div44, "class", "icon");
    			set_style(div44, "background-image", "url(./images/ehs_svgs_clean/tracker.svg)");
    			add_location(div44, file$2, 166, 20, 7629);
    			add_location(b11, file$2, 167, 20, 7740);
    			attr_dev(a44, "href", "./");
    			attr_dev(a44, "class", "add");
    			add_location(a44, file$2, 169, 24, 7828);
    			attr_dev(a45, "href", "./");
    			attr_dev(a45, "class", "filter");
    			add_location(a45, file$2, 170, 24, 7883);
    			attr_dev(a46, "href", "./");
    			attr_dev(a46, "class", "summary");
    			add_location(a46, file$2, 171, 24, 7941);
    			attr_dev(a47, "href", "./");
    			attr_dev(a47, "class", "tool");
    			add_location(a47, file$2, 172, 24, 8000);
    			attr_dev(div45, "class", "tools");
    			add_location(div45, file$2, 168, 20, 7784);
    			attr_dev(div46, "class", "tile");
    			add_location(div46, file$2, 165, 16, 7590);
    			attr_dev(div47, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div47, file$2, 164, 12, 7528);
    			attr_dev(div48, "class", "icon");
    			set_style(div48, "background-image", "url(./images/ehs_svgs_clean/pow_ra.svg)");
    			add_location(div48, file$2, 178, 20, 8214);
    			add_location(b12, file$2, 179, 20, 8324);
    			attr_dev(a48, "href", "./");
    			attr_dev(a48, "class", "add");
    			add_location(a48, file$2, 181, 24, 8409);
    			attr_dev(a49, "href", "./");
    			attr_dev(a49, "class", "filter");
    			add_location(a49, file$2, 182, 24, 8464);
    			attr_dev(a50, "href", "./");
    			attr_dev(a50, "class", "summary");
    			add_location(a50, file$2, 183, 24, 8522);
    			attr_dev(a51, "href", "./");
    			attr_dev(a51, "class", "tool");
    			add_location(a51, file$2, 184, 24, 8581);
    			attr_dev(div49, "class", "tools");
    			add_location(div49, file$2, 180, 20, 8365);
    			attr_dev(div50, "class", "tile");
    			add_location(div50, file$2, 177, 16, 8175);
    			attr_dev(div51, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div51, file$2, 176, 12, 8113);
    			attr_dev(div52, "class", "icon");
    			set_style(div52, "background-image", "url(./images/ehs_svgs_clean/lost_time.svg)");
    			add_location(div52, file$2, 190, 20, 8795);
    			add_location(b13, file$2, 191, 20, 8908);
    			attr_dev(a52, "href", "./");
    			attr_dev(a52, "class", "add");
    			add_location(a52, file$2, 193, 24, 8989);
    			attr_dev(a53, "href", "./");
    			attr_dev(a53, "class", "filter");
    			add_location(a53, file$2, 194, 24, 9044);
    			attr_dev(a54, "href", "./");
    			attr_dev(a54, "class", "summary");
    			add_location(a54, file$2, 195, 24, 9102);
    			attr_dev(a55, "href", "./");
    			attr_dev(a55, "class", "tool");
    			add_location(a55, file$2, 196, 24, 9161);
    			attr_dev(div53, "class", "tools");
    			add_location(div53, file$2, 192, 20, 8945);
    			attr_dev(div54, "class", "tile");
    			add_location(div54, file$2, 189, 16, 8756);
    			attr_dev(div55, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div55, file$2, 188, 12, 8694);
    			attr_dev(div56, "class", "icon");
    			set_style(div56, "background-image", "url(./images/ehs_svgs_clean/administration.svg)");
    			add_location(div56, file$2, 202, 20, 9375);
    			add_location(b14, file$2, 203, 20, 9493);
    			attr_dev(a56, "href", "./");
    			attr_dev(a56, "class", "add");
    			add_location(a56, file$2, 205, 24, 9579);
    			attr_dev(a57, "href", "./");
    			attr_dev(a57, "class", "filter");
    			add_location(a57, file$2, 206, 24, 9634);
    			attr_dev(a58, "href", "./");
    			attr_dev(a58, "class", "summary");
    			add_location(a58, file$2, 207, 24, 9692);
    			attr_dev(a59, "href", "./");
    			attr_dev(a59, "class", "tool");
    			add_location(a59, file$2, 208, 24, 9751);
    			attr_dev(div57, "class", "tools");
    			add_location(div57, file$2, 204, 20, 9535);
    			attr_dev(div58, "class", "tile");
    			add_location(div58, file$2, 201, 16, 9336);
    			attr_dev(div59, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div59, file$2, 200, 12, 9274);
    			attr_dev(div60, "class", "row");
    			add_location(div60, file$2, 31, 8, 1025);
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
    				dispose = listen_dev(div2, "click", prevent_default(/*click_handler_4*/ ctx[6]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div60);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(31:4) {#if tab == 'home'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
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
    		if (/*tab*/ ctx[0] == "home") return create_if_block$2;
    		if (/*tab*/ ctx[0] == "dashboards") return create_if_block_1$1;
    		if (/*tab*/ ctx[0] == "reports") return create_if_block_2;
    		if (/*tab*/ ctx[0] == "tasks") return create_if_block_3;
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
    			add_location(a0, file$2, 15, 20, 320);
    			add_location(li0, file$2, 15, 16, 316);
    			add_location(li1, file$2, 16, 16, 367);
    			attr_dev(ul0, "class", "breadcrumb");
    			add_location(ul0, file$2, 14, 12, 276);
    			attr_dev(div0, "class", "col12");
    			add_location(div0, file$2, 13, 8, 244);
    			attr_dev(div1, "class", "row sticky");
    			add_location(div1, file$2, 12, 4, 211);
    			attr_dev(a1, "href", "/");
    			toggle_class(a1, "active", /*tab*/ ctx[0] == "home");
    			add_location(a1, file$2, 24, 12, 472);
    			add_location(li2, file$2, 24, 8, 468);
    			attr_dev(a2, "href", "/");
    			toggle_class(a2, "active", /*tab*/ ctx[0] == "dashboards");
    			add_location(a2, file$2, 25, 12, 594);
    			add_location(li3, file$2, 25, 8, 590);
    			attr_dev(a3, "href", "/");
    			toggle_class(a3, "active", /*tab*/ ctx[0] == "reports");
    			add_location(a3, file$2, 26, 12, 735);
    			add_location(li4, file$2, 26, 8, 731);
    			attr_dev(a4, "href", "/");
    			toggle_class(a4, "active", /*tab*/ ctx[0] == "tasks");
    			add_location(a4, file$2, 27, 12, 866);
    			add_location(li5, file$2, 27, 8, 862);
    			attr_dev(ul1, "class", "tabs");
    			add_location(ul1, file$2, 23, 4, 442);
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
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
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
    		nav("incidents");
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
    		click_handler_4
    	];
    }

    class Frame_home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Frame_home",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/Frame_incidents.svelte generated by Svelte v3.35.0 */
    const file$1 = "src/Frame_incidents.svelte";

    // (122:28) 
    function create_if_block_1(ctx) {
    	let h2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Summary";
    			add_location(h2, file$1, 122, 4, 49182);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(122:28) ",
    		ctx
    	});

    	return block;
    }

    // (35:0) {#if tab == 'dashboard'}
    function create_if_block$1(ctx) {
    	let div26;
    	let div21;
    	let div20;
    	let div4;
    	let div3;
    	let div0;
    	let t1;
    	let div2;
    	let div1;
    	let t3;
    	let div9;
    	let div8;
    	let div5;
    	let t5;
    	let div7;
    	let div6;
    	let t7;
    	let div14;
    	let div13;
    	let div10;
    	let t9;
    	let div12;
    	let div11;
    	let t11;
    	let div19;
    	let div18;
    	let div15;
    	let t13;
    	let div17;
    	let div16;
    	let t15;
    	let div25;
    	let div24;
    	let div22;
    	let t17;
    	let div23;
    	let svg;
    	let defs;
    	let g58;
    	let g0;
    	let g1;
    	let g42;
    	let g41;
    	let g2;
    	let g4;
    	let g3;
    	let g6;
    	let g5;
    	let path0;
    	let g12;
    	let g7;
    	let g8;
    	let g9;
    	let g10;
    	let g11;
    	let g18;
    	let g13;
    	let path1;
    	let path2;
    	let path3;
    	let path4;
    	let path5;
    	let path6;
    	let path7;
    	let path8;
    	let path9;
    	let path10;
    	let g14;
    	let path11;
    	let path12;
    	let path13;
    	let path14;
    	let path15;
    	let path16;
    	let path17;
    	let path18;
    	let path19;
    	let path20;
    	let g15;
    	let path21;
    	let path22;
    	let path23;
    	let path24;
    	let path25;
    	let path26;
    	let path27;
    	let path28;
    	let path29;
    	let path30;
    	let g16;
    	let path31;
    	let path32;
    	let path33;
    	let path34;
    	let path35;
    	let path36;
    	let path37;
    	let path38;
    	let path39;
    	let path40;
    	let g17;
    	let path41;
    	let path42;
    	let path43;
    	let path44;
    	let path45;
    	let path46;
    	let path47;
    	let path48;
    	let path49;
    	let path50;
    	let g24;
    	let g19;
    	let g20;
    	let g21;
    	let g22;
    	let g23;
    	let g25;
    	let path51;
    	let path52;
    	let path53;
    	let g31;
    	let g26;
    	let g27;
    	let g28;
    	let g29;
    	let g30;
    	let g33;
    	let g32;
    	let g34;
    	let g40;
    	let g35;
    	let g36;
    	let g37;
    	let g38;
    	let g39;
    	let g43;
    	let g44;
    	let g47;
    	let g46;
    	let g45;
    	let g48;
    	let g49;
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
    	let g50;
    	let g56;
    	let g51;
    	let g52;
    	let g53;
    	let g54;
    	let g55;
    	let g57;
    	let clipPath0;
    	let polygon0;
    	let clipPath1;
    	let polygon1;
    	let t45;
    	let div31;
    	let div30;
    	let h4;
    	let t47;
    	let div29;
    	let table;
    	let thead;
    	let tr0;
    	let th0;
    	let t49;
    	let th1;
    	let t51;
    	let th2;
    	let t53;
    	let th3;
    	let t55;
    	let th4;
    	let t57;
    	let th5;
    	let t59;
    	let th6;
    	let t61;
    	let th7;
    	let t63;
    	let th8;
    	let t65;
    	let tbody;
    	let tr1;
    	let td0;
    	let b;
    	let t67;
    	let td1;
    	let t69;
    	let td2;
    	let t71;
    	let td3;
    	let t73;
    	let td4;
    	let t75;
    	let td5;
    	let t77;
    	let td6;
    	let t79;
    	let td7;
    	let t81;
    	let td8;
    	let t83;
    	let div28;
    	let div27;

    	const block = {
    		c: function create() {
    			div26 = element("div");
    			div21 = element("div");
    			div20 = element("div");
    			div4 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			div0.textContent = "Open Events";
    			t1 = space();
    			div2 = element("div");
    			div1 = element("div");
    			div1.textContent = "40";
    			t3 = space();
    			div9 = element("div");
    			div8 = element("div");
    			div5 = element("div");
    			div5.textContent = "Awaiting Investigation";
    			t5 = space();
    			div7 = element("div");
    			div6 = element("div");
    			div6.textContent = "11";
    			t7 = space();
    			div14 = element("div");
    			div13 = element("div");
    			div10 = element("div");
    			div10.textContent = "Awaiting SignOff";
    			t9 = space();
    			div12 = element("div");
    			div11 = element("div");
    			div11.textContent = "3";
    			t11 = space();
    			div19 = element("div");
    			div18 = element("div");
    			div15 = element("div");
    			div15.textContent = "High Potential Severity";
    			t13 = space();
    			div17 = element("div");
    			div16 = element("div");
    			div16.textContent = "1";
    			t15 = space();
    			div25 = element("div");
    			div24 = element("div");
    			div22 = element("div");
    			div22.textContent = "Events by Type";
    			t17 = space();
    			div23 = element("div");
    			svg = svg_element("svg");
    			defs = svg_element("defs");
    			g58 = svg_element("g");
    			g0 = svg_element("g");
    			g1 = svg_element("g");
    			g42 = svg_element("g");
    			g41 = svg_element("g");
    			g2 = svg_element("g");
    			g4 = svg_element("g");
    			g3 = svg_element("g");
    			g6 = svg_element("g");
    			g5 = svg_element("g");
    			path0 = svg_element("path");
    			g12 = svg_element("g");
    			g7 = svg_element("g");
    			g8 = svg_element("g");
    			g9 = svg_element("g");
    			g10 = svg_element("g");
    			g11 = svg_element("g");
    			g18 = svg_element("g");
    			g13 = svg_element("g");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			path5 = svg_element("path");
    			path6 = svg_element("path");
    			path7 = svg_element("path");
    			path8 = svg_element("path");
    			path9 = svg_element("path");
    			path10 = svg_element("path");
    			g14 = svg_element("g");
    			path11 = svg_element("path");
    			path12 = svg_element("path");
    			path13 = svg_element("path");
    			path14 = svg_element("path");
    			path15 = svg_element("path");
    			path16 = svg_element("path");
    			path17 = svg_element("path");
    			path18 = svg_element("path");
    			path19 = svg_element("path");
    			path20 = svg_element("path");
    			g15 = svg_element("g");
    			path21 = svg_element("path");
    			path22 = svg_element("path");
    			path23 = svg_element("path");
    			path24 = svg_element("path");
    			path25 = svg_element("path");
    			path26 = svg_element("path");
    			path27 = svg_element("path");
    			path28 = svg_element("path");
    			path29 = svg_element("path");
    			path30 = svg_element("path");
    			g16 = svg_element("g");
    			path31 = svg_element("path");
    			path32 = svg_element("path");
    			path33 = svg_element("path");
    			path34 = svg_element("path");
    			path35 = svg_element("path");
    			path36 = svg_element("path");
    			path37 = svg_element("path");
    			path38 = svg_element("path");
    			path39 = svg_element("path");
    			path40 = svg_element("path");
    			g17 = svg_element("g");
    			path41 = svg_element("path");
    			path42 = svg_element("path");
    			path43 = svg_element("path");
    			path44 = svg_element("path");
    			path45 = svg_element("path");
    			path46 = svg_element("path");
    			path47 = svg_element("path");
    			path48 = svg_element("path");
    			path49 = svg_element("path");
    			path50 = svg_element("path");
    			g24 = svg_element("g");
    			g19 = svg_element("g");
    			g20 = svg_element("g");
    			g21 = svg_element("g");
    			g22 = svg_element("g");
    			g23 = svg_element("g");
    			g25 = svg_element("g");
    			path51 = svg_element("path");
    			path52 = svg_element("path");
    			path53 = svg_element("path");
    			g31 = svg_element("g");
    			g26 = svg_element("g");
    			g27 = svg_element("g");
    			g28 = svg_element("g");
    			g29 = svg_element("g");
    			g30 = svg_element("g");
    			g33 = svg_element("g");
    			g32 = svg_element("g");
    			g34 = svg_element("g");
    			g40 = svg_element("g");
    			g35 = svg_element("g");
    			g36 = svg_element("g");
    			g37 = svg_element("g");
    			g38 = svg_element("g");
    			g39 = svg_element("g");
    			g43 = svg_element("g");
    			g44 = svg_element("g");
    			g47 = svg_element("g");
    			g46 = svg_element("g");
    			g45 = svg_element("g");
    			g48 = svg_element("g");
    			g49 = svg_element("g");
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
    			g50 = svg_element("g");
    			g56 = svg_element("g");
    			g51 = svg_element("g");
    			g52 = svg_element("g");
    			g53 = svg_element("g");
    			g54 = svg_element("g");
    			g55 = svg_element("g");
    			g57 = svg_element("g");
    			clipPath0 = svg_element("clipPath");
    			polygon0 = svg_element("polygon");
    			clipPath1 = svg_element("clipPath");
    			polygon1 = svg_element("polygon");
    			t45 = space();
    			div31 = element("div");
    			div30 = element("div");
    			h4 = element("h4");
    			h4.textContent = "Latest events";
    			t47 = space();
    			div29 = element("div");
    			table = element("table");
    			thead = element("thead");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "Record ID";
    			t49 = space();
    			th1 = element("th");
    			th1.textContent = "Report Type";
    			t51 = space();
    			th2 = element("th");
    			th2.textContent = "Source";
    			t53 = space();
    			th3 = element("th");
    			th3.textContent = "Event Type";
    			t55 = space();
    			th4 = element("th");
    			th4.textContent = "When";
    			t57 = space();
    			th5 = element("th");
    			th5.textContent = "Location";
    			t59 = space();
    			th6 = element("th");
    			th6.textContent = "Shift";
    			t61 = space();
    			th7 = element("th");
    			th7.textContent = "Open Actions";
    			t63 = space();
    			th8 = element("th");
    			th8.textContent = "Status";
    			t65 = space();
    			tbody = element("tbody");
    			tr1 = element("tr");
    			td0 = element("td");
    			b = element("b");
    			b.textContent = "485";
    			t67 = space();
    			td1 = element("td");
    			td1.textContent = "Full Report";
    			t69 = space();
    			td2 = element("td");
    			td2.textContent = "[]";
    			t71 = space();
    			td3 = element("td");
    			td3.textContent = "Near Miss";
    			t73 = space();
    			td4 = element("td");
    			td4.textContent = "9hr 4min";
    			t75 = space();
    			td5 = element("td");
    			td5.textContent = "Main Office";
    			t77 = space();
    			td6 = element("td");
    			td6.textContent = "Yellow";
    			t79 = space();
    			td7 = element("td");
    			td7.textContent = "0";
    			t81 = space();
    			td8 = element("td");
    			td8.textContent = "In Progress";
    			t83 = space();
    			div28 = element("div");
    			div27 = element("div");
    			attr_dev(div0, "class", "card-header");
    			add_location(div0, file$1, 40, 24, 1363);
    			attr_dev(div1, "class", "big-num");
    			add_location(div1, file$1, 42, 28, 1482);
    			attr_dev(div2, "class", "card-body");
    			add_location(div2, file$1, 41, 24, 1430);
    			attr_dev(div3, "class", "card card-31");
    			add_location(div3, file$1, 39, 20, 1312);
    			attr_dev(div4, "class", "col12 col-sm-6");
    			add_location(div4, file$1, 38, 16, 1263);
    			attr_dev(div5, "class", "card-header");
    			add_location(div5, file$1, 48, 24, 1709);
    			attr_dev(div6, "class", "big-num minor");
    			add_location(div6, file$1, 50, 28, 1839);
    			attr_dev(div7, "class", "card-body");
    			add_location(div7, file$1, 49, 24, 1787);
    			attr_dev(div8, "class", "card card-31");
    			add_location(div8, file$1, 47, 20, 1658);
    			attr_dev(div9, "class", "col12 col-sm-6");
    			add_location(div9, file$1, 46, 16, 1609);
    			attr_dev(div10, "class", "card-header");
    			add_location(div10, file$1, 56, 24, 2072);
    			attr_dev(div11, "class", "big-num minor");
    			add_location(div11, file$1, 58, 28, 2196);
    			attr_dev(div12, "class", "card-body");
    			add_location(div12, file$1, 57, 24, 2144);
    			attr_dev(div13, "class", "card card-31");
    			add_location(div13, file$1, 55, 20, 2021);
    			attr_dev(div14, "class", "col12 col-sm-6");
    			add_location(div14, file$1, 54, 16, 1972);
    			attr_dev(div15, "class", "card-header");
    			add_location(div15, file$1, 64, 24, 2428);
    			attr_dev(div16, "class", "big-num danger");
    			add_location(div16, file$1, 66, 28, 2559);
    			attr_dev(div17, "class", "card-body");
    			add_location(div17, file$1, 65, 24, 2507);
    			attr_dev(div18, "class", "card card-31");
    			add_location(div18, file$1, 63, 20, 2377);
    			attr_dev(div19, "class", "col12 col-sm-6");
    			add_location(div19, file$1, 62, 16, 2328);
    			attr_dev(div20, "class", "row");
    			add_location(div20, file$1, 37, 12, 1229);
    			attr_dev(div21, "class", "col12 col-md-6");
    			add_location(div21, file$1, 36, 8, 1188);
    			attr_dev(div22, "class", "card-header");
    			add_location(div22, file$1, 75, 16, 2803);
    			attr_dev(defs, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-defs");
    			add_location(defs, file$1, 77, 229, 3118);
    			attr_dev(g0, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-main-c");
    			attr_dev(g0, "class", "zc-abs");
    			add_location(g0, file$1, 77, 374, 3263);
    			attr_dev(g1, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-objects-bottom");
    			attr_dev(g1, "class", "zc-abs");
    			add_location(g1, file$1, 77, 451, 3340);
    			attr_dev(g2, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-c");
    			attr_dev(g2, "class", "zc-abs zc-layer zc-persistent");
    			add_location(g2, file$1, 77, 687, 3576);
    			attr_dev(g3, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotarea-c");
    			attr_dev(g3, "class", "zc-abs zc-layer");
    			add_location(g3, file$1, 77, 862, 3751);
    			attr_dev(g4, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotarea");
    			add_location(g4, file$1, 77, 792, 3681);
    			attr_dev(path0, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-y-guide-6-path");
    			attr_dev(path0, "d", "M 35.5 162.5 L 407.5 162.5 M 35.5 138.5 L 407.5 138.5 M 35.5 114.5 L 407.5 114.5 M 35.5 91.5 L 407.5 91.5 M 35.5 67.5 L 407.5 67.5 M 35.5 43.5 L 407.5 43.5 M 35.5 19.5 L 407.5 19.5");
    			attr_dev(path0, "fill", "none");
    			attr_dev(path0, "stroke-linecap", "butt");
    			attr_dev(path0, "stroke-linejoin", "round");
    			attr_dev(path0, "stroke", "#DCDCDC");
    			attr_dev(path0, "stroke-width", "1");
    			attr_dev(path0, "stroke-opacity", "1");
    			add_location(path0, file$1, 77, 1212, 4101);
    			attr_dev(g5, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scales-bl-0-c");
    			attr_dev(g5, "class", "zc-abs zc-layer");
    			add_location(g5, file$1, 77, 1113, 4002);
    			attr_dev(g6, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scales-bl");
    			attr_dev(g6, "clip-path", "url(#AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-clip)");
    			add_location(g6, file$1, 77, 966, 3855);
    			attr_dev(g7, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plot-0-bl-0-c");
    			attr_dev(g7, "class", "zc-abs zc-layer zc-bl");
    			attr_dev(g7, "data-clip", "34,18,376,147");
    			set_style(g7, "display", "block");
    			add_location(g7, file$1, 77, 1756, 4645);
    			attr_dev(g8, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plot-1-bl-0-c");
    			attr_dev(g8, "class", "zc-abs zc-layer zc-bl");
    			attr_dev(g8, "data-clip", "34,18,376,147");
    			set_style(g8, "display", "block");
    			add_location(g8, file$1, 77, 1915, 4804);
    			attr_dev(g9, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plot-2-bl-0-c");
    			attr_dev(g9, "class", "zc-abs zc-layer zc-bl");
    			attr_dev(g9, "data-clip", "34,18,376,147");
    			set_style(g9, "display", "block");
    			add_location(g9, file$1, 77, 2074, 4963);
    			attr_dev(g10, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plot-3-bl-0-c");
    			attr_dev(g10, "class", "zc-abs zc-layer zc-bl");
    			attr_dev(g10, "data-clip", "34,18,376,147");
    			set_style(g10, "display", "block");
    			add_location(g10, file$1, 77, 2233, 5122);
    			attr_dev(g11, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plot-4-bl-0-c");
    			attr_dev(g11, "class", "zc-abs zc-layer zc-bl");
    			attr_dev(g11, "data-clip", "34,18,376,147");
    			set_style(g11, "display", "block");
    			add_location(g11, file$1, 77, 2392, 5281);
    			attr_dev(g12, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plots-bl-0");
    			attr_dev(g12, "clip-path", "url(#AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-clip)");
    			add_location(g12, file$1, 77, 1608, 4497);
    			attr_dev(path1, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-0-node-0-path");
    			attr_dev(path1, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-0-node-area zc-node-area");
    			attr_dev(path1, "d", "M 39.5 150.5 L 68.5 150.5 L 68.5 162.5 L 39.5 162.5 L 39.5 150.5 L 39.5 150.5");
    			attr_dev(path1, "fill", "#6F8CC4");
    			attr_dev(path1, "fill-opacity", "1");
    			attr_dev(path1, "stroke-linecap", "square");
    			attr_dev(path1, "stroke-linejoin", "miter");
    			attr_dev(path1, "stroke-opacity", "1");
    			add_location(path1, file$1, 77, 2858, 5747);
    			attr_dev(path2, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-0-node-1-path");
    			attr_dev(path2, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-0-node-area zc-node-area");
    			attr_dev(path2, "d", "M 76.5 138.5 L 105.5 138.5 L 105.5 162.5 L 76.5 162.5 L 76.5 138.5 L 76.5 138.5");
    			attr_dev(path2, "fill", "#6F8CC4");
    			attr_dev(path2, "fill-opacity", "1");
    			attr_dev(path2, "stroke-linecap", "square");
    			attr_dev(path2, "stroke-linejoin", "miter");
    			attr_dev(path2, "stroke-opacity", "1");
    			add_location(path2, file$1, 77, 3299, 6188);
    			attr_dev(path3, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-0-node-2-path");
    			attr_dev(path3, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-0-node-area zc-node-area");
    			attr_dev(path3, "d", "M 113.5 162.5 L 143.5 162.5 L 143.5 162.5 L 113.5 162.5 L 113.5 162.5 L 114.5 162.5");
    			attr_dev(path3, "fill", "#6F8CC4");
    			attr_dev(path3, "fill-opacity", "1");
    			attr_dev(path3, "stroke-linecap", "square");
    			attr_dev(path3, "stroke-linejoin", "miter");
    			attr_dev(path3, "stroke-opacity", "1");
    			add_location(path3, file$1, 77, 3742, 6631);
    			attr_dev(path4, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-0-node-3-path");
    			attr_dev(path4, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-0-node-area zc-node-area");
    			attr_dev(path4, "d", "M 151.5 162.5 L 180.5 162.5 L 180.5 162.5 L 151.5 162.5 L 151.5 162.5 L 151.5 162.5");
    			attr_dev(path4, "fill", "#6F8CC4");
    			attr_dev(path4, "fill-opacity", "1");
    			attr_dev(path4, "stroke-linecap", "square");
    			attr_dev(path4, "stroke-linejoin", "miter");
    			attr_dev(path4, "stroke-opacity", "1");
    			add_location(path4, file$1, 77, 4189, 7078);
    			attr_dev(path5, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-0-node-4-path");
    			attr_dev(path5, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-0-node-area zc-node-area");
    			attr_dev(path5, "d", "M 188.5 162.5 L 217.5 162.5 L 217.5 162.5 L 188.5 162.5 L 188.5 162.5 L 188.5 162.5");
    			attr_dev(path5, "fill", "#6F8CC4");
    			attr_dev(path5, "fill-opacity", "1");
    			attr_dev(path5, "stroke-linecap", "square");
    			attr_dev(path5, "stroke-linejoin", "miter");
    			attr_dev(path5, "stroke-opacity", "1");
    			add_location(path5, file$1, 77, 4636, 7525);
    			attr_dev(path6, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-0-node-5-path");
    			attr_dev(path6, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-0-node-area zc-node-area");
    			attr_dev(path6, "d", "M 225.5 150.5 L 254.5 150.5 L 254.5 162.5 L 225.5 162.5 L 225.5 150.5 L 225.5 150.5");
    			attr_dev(path6, "fill", "#6F8CC4");
    			attr_dev(path6, "fill-opacity", "1");
    			attr_dev(path6, "stroke-linecap", "square");
    			attr_dev(path6, "stroke-linejoin", "miter");
    			attr_dev(path6, "stroke-opacity", "1");
    			add_location(path6, file$1, 77, 5083, 7972);
    			attr_dev(path7, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-0-node-6-path");
    			attr_dev(path7, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-0-node-area zc-node-area");
    			attr_dev(path7, "d", "M 262.5 150.5 L 291.5 150.5 L 291.5 162.5 L 262.5 162.5 L 262.5 150.5 L 262.5 150.5");
    			attr_dev(path7, "fill", "#6F8CC4");
    			attr_dev(path7, "fill-opacity", "1");
    			attr_dev(path7, "stroke-linecap", "square");
    			attr_dev(path7, "stroke-linejoin", "miter");
    			attr_dev(path7, "stroke-opacity", "1");
    			add_location(path7, file$1, 77, 5530, 8419);
    			attr_dev(path8, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-0-node-7-path");
    			attr_dev(path8, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-0-node-area zc-node-area");
    			attr_dev(path8, "d", "M 299.5 150.5 L 329.5 150.5 L 329.5 162.5 L 299.5 162.5 L 299.5 150.5 L 300.5 150.5");
    			attr_dev(path8, "fill", "#6F8CC4");
    			attr_dev(path8, "fill-opacity", "1");
    			attr_dev(path8, "stroke-linecap", "square");
    			attr_dev(path8, "stroke-linejoin", "miter");
    			attr_dev(path8, "stroke-opacity", "1");
    			add_location(path8, file$1, 77, 5977, 8866);
    			attr_dev(path9, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-0-node-8-path");
    			attr_dev(path9, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-0-node-area zc-node-area");
    			attr_dev(path9, "d", "M 337.5 162.5 L 366.5 162.5 L 366.5 162.5 L 337.5 162.5 L 337.5 162.5 L 337.5 162.5");
    			attr_dev(path9, "fill", "#6F8CC4");
    			attr_dev(path9, "fill-opacity", "1");
    			attr_dev(path9, "stroke-linecap", "square");
    			attr_dev(path9, "stroke-linejoin", "miter");
    			attr_dev(path9, "stroke-opacity", "1");
    			add_location(path9, file$1, 77, 6424, 9313);
    			attr_dev(path10, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-0-node-9-path");
    			attr_dev(path10, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-0-node-area zc-node-area");
    			attr_dev(path10, "d", "M 374.5 126.5 L 403.5 126.5 L 403.5 162.5 L 374.5 162.5 L 374.5 126.5 L 374.5 126.5");
    			attr_dev(path10, "fill", "#6F8CC4");
    			attr_dev(path10, "fill-opacity", "1");
    			attr_dev(path10, "stroke-linecap", "square");
    			attr_dev(path10, "stroke-linejoin", "miter");
    			attr_dev(path10, "stroke-opacity", "1");
    			add_location(path10, file$1, 77, 6871, 9760);
    			attr_dev(g13, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plot-0-bl-1-c");
    			attr_dev(g13, "class", "zc-abs zc-layer zc-bl");
    			attr_dev(g13, "data-clip", "34,18,376,147");
    			set_style(g13, "display", "block");
    			add_location(g13, file$1, 77, 2703, 5592);
    			attr_dev(path11, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-1-node-0-path");
    			attr_dev(path11, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-1-node-area zc-node-area");
    			attr_dev(path11, "d", "M 39.5 138.5 L 68.5 138.5 L 68.5 150.5 L 39.5 150.5 L 39.5 138.5 L 39.5 138.5");
    			attr_dev(path11, "fill", "#CE735D");
    			attr_dev(path11, "fill-opacity", "1");
    			attr_dev(path11, "stroke-linecap", "square");
    			attr_dev(path11, "stroke-linejoin", "miter");
    			attr_dev(path11, "stroke-opacity", "1");
    			add_location(path11, file$1, 77, 7477, 10366);
    			attr_dev(path12, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-1-node-1-path");
    			attr_dev(path12, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-1-node-area zc-node-area");
    			attr_dev(path12, "d", "M 76.5 114.5 L 105.5 114.5 L 105.5 138.5 L 76.5 138.5 L 76.5 114.5 L 76.5 114.5");
    			attr_dev(path12, "fill", "#CE735D");
    			attr_dev(path12, "fill-opacity", "1");
    			attr_dev(path12, "stroke-linecap", "square");
    			attr_dev(path12, "stroke-linejoin", "miter");
    			attr_dev(path12, "stroke-opacity", "1");
    			add_location(path12, file$1, 77, 7918, 10807);
    			attr_dev(path13, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-1-node-2-path");
    			attr_dev(path13, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-1-node-area zc-node-area");
    			attr_dev(path13, "d", "M 113.5 162.5 L 143.5 162.5 L 143.5 162.5 L 113.5 162.5 L 113.5 162.5 L 114.5 162.5");
    			attr_dev(path13, "fill", "#CE735D");
    			attr_dev(path13, "fill-opacity", "1");
    			attr_dev(path13, "stroke-linecap", "square");
    			attr_dev(path13, "stroke-linejoin", "miter");
    			attr_dev(path13, "stroke-opacity", "1");
    			add_location(path13, file$1, 77, 8361, 11250);
    			attr_dev(path14, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-1-node-3-path");
    			attr_dev(path14, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-1-node-area zc-node-area");
    			attr_dev(path14, "d", "M 151.5 150.5 L 180.5 150.5 L 180.5 162.5 L 151.5 162.5 L 151.5 150.5 L 151.5 150.5");
    			attr_dev(path14, "fill", "#CE735D");
    			attr_dev(path14, "fill-opacity", "1");
    			attr_dev(path14, "stroke-linecap", "square");
    			attr_dev(path14, "stroke-linejoin", "miter");
    			attr_dev(path14, "stroke-opacity", "1");
    			add_location(path14, file$1, 77, 8808, 11697);
    			attr_dev(path15, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-1-node-4-path");
    			attr_dev(path15, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-1-node-area zc-node-area");
    			attr_dev(path15, "d", "M 188.5 162.5 L 217.5 162.5 L 217.5 162.5 L 188.5 162.5 L 188.5 162.5 L 188.5 162.5");
    			attr_dev(path15, "fill", "#CE735D");
    			attr_dev(path15, "fill-opacity", "1");
    			attr_dev(path15, "stroke-linecap", "square");
    			attr_dev(path15, "stroke-linejoin", "miter");
    			attr_dev(path15, "stroke-opacity", "1");
    			add_location(path15, file$1, 77, 9255, 12144);
    			attr_dev(path16, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-1-node-5-path");
    			attr_dev(path16, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-1-node-area zc-node-area");
    			attr_dev(path16, "d", "M 225.5 138.5 L 254.5 138.5 L 254.5 150.5 L 225.5 150.5 L 225.5 138.5 L 225.5 138.5");
    			attr_dev(path16, "fill", "#CE735D");
    			attr_dev(path16, "fill-opacity", "1");
    			attr_dev(path16, "stroke-linecap", "square");
    			attr_dev(path16, "stroke-linejoin", "miter");
    			attr_dev(path16, "stroke-opacity", "1");
    			add_location(path16, file$1, 77, 9702, 12591);
    			attr_dev(path17, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-1-node-6-path");
    			attr_dev(path17, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-1-node-area zc-node-area");
    			attr_dev(path17, "d", "M 262.5 126.5 L 291.5 126.5 L 291.5 150.5 L 262.5 150.5 L 262.5 126.5 L 262.5 126.5");
    			attr_dev(path17, "fill", "#CE735D");
    			attr_dev(path17, "fill-opacity", "1");
    			attr_dev(path17, "stroke-linecap", "square");
    			attr_dev(path17, "stroke-linejoin", "miter");
    			attr_dev(path17, "stroke-opacity", "1");
    			add_location(path17, file$1, 77, 10149, 13038);
    			attr_dev(path18, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-1-node-7-path");
    			attr_dev(path18, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-1-node-area zc-node-area");
    			attr_dev(path18, "d", "M 299.5 150.5 L 329.5 150.5 L 329.5 150.5 L 299.5 150.5 L 299.5 150.5 L 300.5 150.5");
    			attr_dev(path18, "fill", "#CE735D");
    			attr_dev(path18, "fill-opacity", "1");
    			attr_dev(path18, "stroke-linecap", "square");
    			attr_dev(path18, "stroke-linejoin", "miter");
    			attr_dev(path18, "stroke-opacity", "1");
    			add_location(path18, file$1, 77, 10596, 13485);
    			attr_dev(path19, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-1-node-8-path");
    			attr_dev(path19, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-1-node-area zc-node-area");
    			attr_dev(path19, "d", "M 337.5 162.5 L 366.5 162.5 L 366.5 162.5 L 337.5 162.5 L 337.5 162.5 L 337.5 162.5");
    			attr_dev(path19, "fill", "#CE735D");
    			attr_dev(path19, "fill-opacity", "1");
    			attr_dev(path19, "stroke-linecap", "square");
    			attr_dev(path19, "stroke-linejoin", "miter");
    			attr_dev(path19, "stroke-opacity", "1");
    			add_location(path19, file$1, 77, 11043, 13932);
    			attr_dev(path20, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-1-node-9-path");
    			attr_dev(path20, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-1-node-area zc-node-area");
    			attr_dev(path20, "d", "M 374.5 114.5 L 403.5 114.5 L 403.5 126.5 L 374.5 126.5 L 374.5 114.5 L 374.5 114.5");
    			attr_dev(path20, "fill", "#CE735D");
    			attr_dev(path20, "fill-opacity", "1");
    			attr_dev(path20, "stroke-linecap", "square");
    			attr_dev(path20, "stroke-linejoin", "miter");
    			attr_dev(path20, "stroke-opacity", "1");
    			add_location(path20, file$1, 77, 11490, 14379);
    			attr_dev(g14, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plot-1-bl-1-c");
    			attr_dev(g14, "class", "zc-abs zc-layer zc-bl");
    			attr_dev(g14, "data-clip", "34,18,376,147");
    			set_style(g14, "display", "block");
    			add_location(g14, file$1, 77, 7322, 10211);
    			attr_dev(path21, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-2-node-0-path");
    			attr_dev(path21, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-2-node-area zc-node-area");
    			attr_dev(path21, "d", "M 39.5 138.5 L 68.5 138.5 L 68.5 138.5 L 39.5 138.5 L 39.5 138.5 L 39.5 138.5");
    			attr_dev(path21, "fill", "#EEB55F");
    			attr_dev(path21, "fill-opacity", "1");
    			attr_dev(path21, "stroke-linecap", "square");
    			attr_dev(path21, "stroke-linejoin", "miter");
    			attr_dev(path21, "stroke-opacity", "1");
    			add_location(path21, file$1, 77, 12096, 14985);
    			attr_dev(path22, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-2-node-1-path");
    			attr_dev(path22, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-2-node-area zc-node-area");
    			attr_dev(path22, "d", "M 76.5 55.5 L 105.5 55.5 L 105.5 114.5 L 76.5 114.5 L 76.5 55.5 L 76.5 55.5");
    			attr_dev(path22, "fill", "#EEB55F");
    			attr_dev(path22, "fill-opacity", "1");
    			attr_dev(path22, "stroke-linecap", "square");
    			attr_dev(path22, "stroke-linejoin", "miter");
    			attr_dev(path22, "stroke-opacity", "1");
    			add_location(path22, file$1, 77, 12537, 15426);
    			attr_dev(path23, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-2-node-2-path");
    			attr_dev(path23, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-2-node-area zc-node-area");
    			attr_dev(path23, "d", "M 113.5 138.5 L 143.5 138.5 L 143.5 162.5 L 113.5 162.5 L 113.5 138.5 L 114.5 138.5");
    			attr_dev(path23, "fill", "#EEB55F");
    			attr_dev(path23, "fill-opacity", "1");
    			attr_dev(path23, "stroke-linecap", "square");
    			attr_dev(path23, "stroke-linejoin", "miter");
    			attr_dev(path23, "stroke-opacity", "1");
    			add_location(path23, file$1, 77, 12976, 15865);
    			attr_dev(path24, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-2-node-3-path");
    			attr_dev(path24, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-2-node-area zc-node-area");
    			attr_dev(path24, "d", "M 151.5 150.5 L 180.5 150.5 L 180.5 150.5 L 151.5 150.5 L 151.5 150.5 L 151.5 150.5");
    			attr_dev(path24, "fill", "#EEB55F");
    			attr_dev(path24, "fill-opacity", "1");
    			attr_dev(path24, "stroke-linecap", "square");
    			attr_dev(path24, "stroke-linejoin", "miter");
    			attr_dev(path24, "stroke-opacity", "1");
    			add_location(path24, file$1, 77, 13423, 16312);
    			attr_dev(path25, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-2-node-4-path");
    			attr_dev(path25, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-2-node-area zc-node-area");
    			attr_dev(path25, "d", "M 188.5 138.5 L 217.5 138.5 L 217.5 162.5 L 188.5 162.5 L 188.5 138.5 L 188.5 138.5");
    			attr_dev(path25, "fill", "#EEB55F");
    			attr_dev(path25, "fill-opacity", "1");
    			attr_dev(path25, "stroke-linecap", "square");
    			attr_dev(path25, "stroke-linejoin", "miter");
    			attr_dev(path25, "stroke-opacity", "1");
    			add_location(path25, file$1, 77, 13870, 16759);
    			attr_dev(path26, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-2-node-5-path");
    			attr_dev(path26, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-2-node-area zc-node-area");
    			attr_dev(path26, "d", "M 225.5 138.5 L 254.5 138.5 L 254.5 138.5 L 225.5 138.5 L 225.5 138.5 L 225.5 138.5");
    			attr_dev(path26, "fill", "#EEB55F");
    			attr_dev(path26, "fill-opacity", "1");
    			attr_dev(path26, "stroke-linecap", "square");
    			attr_dev(path26, "stroke-linejoin", "miter");
    			attr_dev(path26, "stroke-opacity", "1");
    			add_location(path26, file$1, 77, 14317, 17206);
    			attr_dev(path27, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-2-node-6-path");
    			attr_dev(path27, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-2-node-area zc-node-area");
    			attr_dev(path27, "d", "M 262.5 126.5 L 291.5 126.5 L 291.5 126.5 L 262.5 126.5 L 262.5 126.5 L 262.5 126.5");
    			attr_dev(path27, "fill", "#EEB55F");
    			attr_dev(path27, "fill-opacity", "1");
    			attr_dev(path27, "stroke-linecap", "square");
    			attr_dev(path27, "stroke-linejoin", "miter");
    			attr_dev(path27, "stroke-opacity", "1");
    			add_location(path27, file$1, 77, 14764, 17653);
    			attr_dev(path28, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-2-node-7-path");
    			attr_dev(path28, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-2-node-area zc-node-area");
    			attr_dev(path28, "d", "M 299.5 150.5 L 329.5 150.5 L 329.5 150.5 L 299.5 150.5 L 299.5 150.5 L 300.5 150.5");
    			attr_dev(path28, "fill", "#EEB55F");
    			attr_dev(path28, "fill-opacity", "1");
    			attr_dev(path28, "stroke-linecap", "square");
    			attr_dev(path28, "stroke-linejoin", "miter");
    			attr_dev(path28, "stroke-opacity", "1");
    			add_location(path28, file$1, 77, 15211, 18100);
    			attr_dev(path29, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-2-node-8-path");
    			attr_dev(path29, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-2-node-area zc-node-area");
    			attr_dev(path29, "d", "M 337.5 162.5 L 366.5 162.5 L 366.5 162.5 L 337.5 162.5 L 337.5 162.5 L 337.5 162.5");
    			attr_dev(path29, "fill", "#EEB55F");
    			attr_dev(path29, "fill-opacity", "1");
    			attr_dev(path29, "stroke-linecap", "square");
    			attr_dev(path29, "stroke-linejoin", "miter");
    			attr_dev(path29, "stroke-opacity", "1");
    			add_location(path29, file$1, 77, 15658, 18547);
    			attr_dev(path30, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-2-node-9-path");
    			attr_dev(path30, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-2-node-area zc-node-area");
    			attr_dev(path30, "d", "M 374.5 114.5 L 403.5 114.5 L 403.5 114.5 L 374.5 114.5 L 374.5 114.5 L 374.5 114.5");
    			attr_dev(path30, "fill", "#EEB55F");
    			attr_dev(path30, "fill-opacity", "1");
    			attr_dev(path30, "stroke-linecap", "square");
    			attr_dev(path30, "stroke-linejoin", "miter");
    			attr_dev(path30, "stroke-opacity", "1");
    			add_location(path30, file$1, 77, 16105, 18994);
    			attr_dev(g15, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plot-2-bl-1-c");
    			attr_dev(g15, "class", "zc-abs zc-layer zc-bl");
    			attr_dev(g15, "data-clip", "34,18,376,147");
    			set_style(g15, "display", "block");
    			add_location(g15, file$1, 77, 11941, 14830);
    			attr_dev(path31, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-3-node-0-path");
    			attr_dev(path31, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-3-node-area zc-node-area");
    			attr_dev(path31, "d", "M 39.5 138.5 L 68.5 138.5 L 68.5 138.5 L 39.5 138.5 L 39.5 138.5 L 39.5 138.5");
    			attr_dev(path31, "fill", "#5BA65F");
    			attr_dev(path31, "fill-opacity", "1");
    			attr_dev(path31, "stroke-linecap", "square");
    			attr_dev(path31, "stroke-linejoin", "miter");
    			attr_dev(path31, "stroke-opacity", "1");
    			add_location(path31, file$1, 77, 16711, 19600);
    			attr_dev(path32, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-3-node-1-path");
    			attr_dev(path32, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-3-node-area zc-node-area");
    			attr_dev(path32, "d", "M 76.5 55.5 L 105.5 55.5 L 105.5 55.5 L 76.5 55.5 L 76.5 55.5 L 76.5 55.5");
    			attr_dev(path32, "fill", "#5BA65F");
    			attr_dev(path32, "fill-opacity", "1");
    			attr_dev(path32, "stroke-linecap", "square");
    			attr_dev(path32, "stroke-linejoin", "miter");
    			attr_dev(path32, "stroke-opacity", "1");
    			add_location(path32, file$1, 77, 17152, 20041);
    			attr_dev(path33, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-3-node-2-path");
    			attr_dev(path33, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-3-node-area zc-node-area");
    			attr_dev(path33, "d", "M 113.5 138.5 L 143.5 138.5 L 143.5 138.5 L 113.5 138.5 L 113.5 138.5 L 114.5 138.5");
    			attr_dev(path33, "fill", "#5BA65F");
    			attr_dev(path33, "fill-opacity", "1");
    			attr_dev(path33, "stroke-linecap", "square");
    			attr_dev(path33, "stroke-linejoin", "miter");
    			attr_dev(path33, "stroke-opacity", "1");
    			add_location(path33, file$1, 77, 17589, 20478);
    			attr_dev(path34, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-3-node-3-path");
    			attr_dev(path34, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-3-node-area zc-node-area");
    			attr_dev(path34, "d", "M 151.5 150.5 L 180.5 150.5 L 180.5 150.5 L 151.5 150.5 L 151.5 150.5 L 151.5 150.5");
    			attr_dev(path34, "fill", "#5BA65F");
    			attr_dev(path34, "fill-opacity", "1");
    			attr_dev(path34, "stroke-linecap", "square");
    			attr_dev(path34, "stroke-linejoin", "miter");
    			attr_dev(path34, "stroke-opacity", "1");
    			add_location(path34, file$1, 77, 18036, 20925);
    			attr_dev(path35, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-3-node-4-path");
    			attr_dev(path35, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-3-node-area zc-node-area");
    			attr_dev(path35, "d", "M 188.5 138.5 L 217.5 138.5 L 217.5 138.5 L 188.5 138.5 L 188.5 138.5 L 188.5 138.5");
    			attr_dev(path35, "fill", "#5BA65F");
    			attr_dev(path35, "fill-opacity", "1");
    			attr_dev(path35, "stroke-linecap", "square");
    			attr_dev(path35, "stroke-linejoin", "miter");
    			attr_dev(path35, "stroke-opacity", "1");
    			add_location(path35, file$1, 77, 18483, 21372);
    			attr_dev(path36, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-3-node-5-path");
    			attr_dev(path36, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-3-node-area zc-node-area");
    			attr_dev(path36, "d", "M 225.5 138.5 L 254.5 138.5 L 254.5 138.5 L 225.5 138.5 L 225.5 138.5 L 225.5 138.5");
    			attr_dev(path36, "fill", "#5BA65F");
    			attr_dev(path36, "fill-opacity", "1");
    			attr_dev(path36, "stroke-linecap", "square");
    			attr_dev(path36, "stroke-linejoin", "miter");
    			attr_dev(path36, "stroke-opacity", "1");
    			add_location(path36, file$1, 77, 18930, 21819);
    			attr_dev(path37, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-3-node-6-path");
    			attr_dev(path37, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-3-node-area zc-node-area");
    			attr_dev(path37, "d", "M 262.5 114.5 L 291.5 114.5 L 291.5 126.5 L 262.5 126.5 L 262.5 114.5 L 262.5 114.5");
    			attr_dev(path37, "fill", "#5BA65F");
    			attr_dev(path37, "fill-opacity", "1");
    			attr_dev(path37, "stroke-linecap", "square");
    			attr_dev(path37, "stroke-linejoin", "miter");
    			attr_dev(path37, "stroke-opacity", "1");
    			add_location(path37, file$1, 77, 19377, 22266);
    			attr_dev(path38, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-3-node-7-path");
    			attr_dev(path38, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-3-node-area zc-node-area");
    			attr_dev(path38, "d", "M 299.5 150.5 L 329.5 150.5 L 329.5 150.5 L 299.5 150.5 L 299.5 150.5 L 300.5 150.5");
    			attr_dev(path38, "fill", "#5BA65F");
    			attr_dev(path38, "fill-opacity", "1");
    			attr_dev(path38, "stroke-linecap", "square");
    			attr_dev(path38, "stroke-linejoin", "miter");
    			attr_dev(path38, "stroke-opacity", "1");
    			add_location(path38, file$1, 77, 19824, 22713);
    			attr_dev(path39, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-3-node-8-path");
    			attr_dev(path39, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-3-node-area zc-node-area");
    			attr_dev(path39, "d", "M 337.5 162.5 L 366.5 162.5 L 366.5 162.5 L 337.5 162.5 L 337.5 162.5 L 337.5 162.5");
    			attr_dev(path39, "fill", "#5BA65F");
    			attr_dev(path39, "fill-opacity", "1");
    			attr_dev(path39, "stroke-linecap", "square");
    			attr_dev(path39, "stroke-linejoin", "miter");
    			attr_dev(path39, "stroke-opacity", "1");
    			add_location(path39, file$1, 77, 20271, 23160);
    			attr_dev(path40, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-3-node-9-path");
    			attr_dev(path40, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-3-node-area zc-node-area");
    			attr_dev(path40, "d", "M 374.5 102.5 L 403.5 102.5 L 403.5 114.5 L 374.5 114.5 L 374.5 102.5 L 374.5 102.5");
    			attr_dev(path40, "fill", "#5BA65F");
    			attr_dev(path40, "fill-opacity", "1");
    			attr_dev(path40, "stroke-linecap", "square");
    			attr_dev(path40, "stroke-linejoin", "miter");
    			attr_dev(path40, "stroke-opacity", "1");
    			add_location(path40, file$1, 77, 20718, 23607);
    			attr_dev(g16, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plot-3-bl-1-c");
    			attr_dev(g16, "class", "zc-abs zc-layer zc-bl");
    			attr_dev(g16, "data-clip", "34,18,376,147");
    			set_style(g16, "display", "block");
    			add_location(g16, file$1, 77, 16556, 19445);
    			attr_dev(path41, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-4-node-0-path");
    			attr_dev(path41, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-4-node-area zc-node-area");
    			attr_dev(path41, "d", "M 39.5 138.5 L 68.5 138.5 L 68.5 138.5 L 39.5 138.5 L 39.5 138.5 L 39.5 138.5");
    			attr_dev(path41, "fill", "#9E4BA0");
    			attr_dev(path41, "fill-opacity", "1");
    			attr_dev(path41, "stroke-linecap", "square");
    			attr_dev(path41, "stroke-linejoin", "miter");
    			attr_dev(path41, "stroke-opacity", "1");
    			add_location(path41, file$1, 77, 21324, 24213);
    			attr_dev(path42, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-4-node-1-path");
    			attr_dev(path42, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-4-node-area zc-node-area");
    			attr_dev(path42, "d", "M 76.5 31.5 L 105.5 31.5 L 105.5 55.5 L 76.5 55.5 L 76.5 31.5 L 76.5 31.5");
    			attr_dev(path42, "fill", "#9E4BA0");
    			attr_dev(path42, "fill-opacity", "1");
    			attr_dev(path42, "stroke-linecap", "square");
    			attr_dev(path42, "stroke-linejoin", "miter");
    			attr_dev(path42, "stroke-opacity", "1");
    			add_location(path42, file$1, 77, 21765, 24654);
    			attr_dev(path43, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-4-node-2-path");
    			attr_dev(path43, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-4-node-area zc-node-area");
    			attr_dev(path43, "d", "M 113.5 138.5 L 143.5 138.5 L 143.5 138.5 L 113.5 138.5 L 113.5 138.5 L 114.5 138.5");
    			attr_dev(path43, "fill", "#9E4BA0");
    			attr_dev(path43, "fill-opacity", "1");
    			attr_dev(path43, "stroke-linecap", "square");
    			attr_dev(path43, "stroke-linejoin", "miter");
    			attr_dev(path43, "stroke-opacity", "1");
    			add_location(path43, file$1, 77, 22202, 25091);
    			attr_dev(path44, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-4-node-3-path");
    			attr_dev(path44, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-4-node-area zc-node-area");
    			attr_dev(path44, "d", "M 151.5 150.5 L 180.5 150.5 L 180.5 150.5 L 151.5 150.5 L 151.5 150.5 L 151.5 150.5");
    			attr_dev(path44, "fill", "#9E4BA0");
    			attr_dev(path44, "fill-opacity", "1");
    			attr_dev(path44, "stroke-linecap", "square");
    			attr_dev(path44, "stroke-linejoin", "miter");
    			attr_dev(path44, "stroke-opacity", "1");
    			add_location(path44, file$1, 77, 22649, 25538);
    			attr_dev(path45, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-4-node-4-path");
    			attr_dev(path45, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-4-node-area zc-node-area");
    			attr_dev(path45, "d", "M 188.5 138.5 L 217.5 138.5 L 217.5 138.5 L 188.5 138.5 L 188.5 138.5 L 188.5 138.5");
    			attr_dev(path45, "fill", "#9E4BA0");
    			attr_dev(path45, "fill-opacity", "1");
    			attr_dev(path45, "stroke-linecap", "square");
    			attr_dev(path45, "stroke-linejoin", "miter");
    			attr_dev(path45, "stroke-opacity", "1");
    			add_location(path45, file$1, 77, 23096, 25985);
    			attr_dev(path46, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-4-node-5-path");
    			attr_dev(path46, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-4-node-area zc-node-area");
    			attr_dev(path46, "d", "M 225.5 138.5 L 254.5 138.5 L 254.5 138.5 L 225.5 138.5 L 225.5 138.5 L 225.5 138.5");
    			attr_dev(path46, "fill", "#9E4BA0");
    			attr_dev(path46, "fill-opacity", "1");
    			attr_dev(path46, "stroke-linecap", "square");
    			attr_dev(path46, "stroke-linejoin", "miter");
    			attr_dev(path46, "stroke-opacity", "1");
    			add_location(path46, file$1, 77, 23543, 26432);
    			attr_dev(path47, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-4-node-6-path");
    			attr_dev(path47, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-4-node-area zc-node-area");
    			attr_dev(path47, "d", "M 262.5 114.5 L 291.5 114.5 L 291.5 114.5 L 262.5 114.5 L 262.5 114.5 L 262.5 114.5");
    			attr_dev(path47, "fill", "#9E4BA0");
    			attr_dev(path47, "fill-opacity", "1");
    			attr_dev(path47, "stroke-linecap", "square");
    			attr_dev(path47, "stroke-linejoin", "miter");
    			attr_dev(path47, "stroke-opacity", "1");
    			add_location(path47, file$1, 77, 23990, 26879);
    			attr_dev(path48, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-4-node-7-path");
    			attr_dev(path48, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-4-node-area zc-node-area");
    			attr_dev(path48, "d", "M 299.5 150.5 L 329.5 150.5 L 329.5 150.5 L 299.5 150.5 L 299.5 150.5 L 300.5 150.5");
    			attr_dev(path48, "fill", "#9E4BA0");
    			attr_dev(path48, "fill-opacity", "1");
    			attr_dev(path48, "stroke-linecap", "square");
    			attr_dev(path48, "stroke-linejoin", "miter");
    			attr_dev(path48, "stroke-opacity", "1");
    			add_location(path48, file$1, 77, 24437, 27326);
    			attr_dev(path49, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-4-node-8-path");
    			attr_dev(path49, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-4-node-area zc-node-area");
    			attr_dev(path49, "d", "M 337.5 162.5 L 366.5 162.5 L 366.5 162.5 L 337.5 162.5 L 337.5 162.5 L 337.5 162.5");
    			attr_dev(path49, "fill", "#9E4BA0");
    			attr_dev(path49, "fill-opacity", "1");
    			attr_dev(path49, "stroke-linecap", "square");
    			attr_dev(path49, "stroke-linejoin", "miter");
    			attr_dev(path49, "stroke-opacity", "1");
    			add_location(path49, file$1, 77, 24884, 27773);
    			attr_dev(path50, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-4-node-9-path");
    			attr_dev(path50, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-4-node-area zc-node-area");
    			attr_dev(path50, "d", "M 374.5 102.5 L 403.5 102.5 L 403.5 102.5 L 374.5 102.5 L 374.5 102.5 L 374.5 102.5");
    			attr_dev(path50, "fill", "#9E4BA0");
    			attr_dev(path50, "fill-opacity", "1");
    			attr_dev(path50, "stroke-linecap", "square");
    			attr_dev(path50, "stroke-linejoin", "miter");
    			attr_dev(path50, "stroke-opacity", "1");
    			add_location(path50, file$1, 77, 25331, 28220);
    			attr_dev(g17, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plot-4-bl-1-c");
    			attr_dev(g17, "class", "zc-abs zc-layer zc-bl");
    			attr_dev(g17, "data-clip", "34,18,376,147");
    			set_style(g17, "display", "block");
    			add_location(g17, file$1, 77, 21169, 24058);
    			attr_dev(g18, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plots-bl-1");
    			attr_dev(g18, "clip-path", "url(#AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-clip)");
    			add_location(g18, file$1, 77, 2555, 5444);
    			attr_dev(g19, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plot-0-bl-2-c");
    			attr_dev(g19, "class", "zc-abs zc-layer zc-bl");
    			attr_dev(g19, "data-clip", "34,18,376,147");
    			set_style(g19, "display", "block");
    			add_location(g19, file$1, 77, 25934, 28823);
    			attr_dev(g20, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plot-1-bl-2-c");
    			attr_dev(g20, "class", "zc-abs zc-layer zc-bl");
    			attr_dev(g20, "data-clip", "34,18,376,147");
    			set_style(g20, "display", "block");
    			add_location(g20, file$1, 77, 26093, 28982);
    			attr_dev(g21, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plot-2-bl-2-c");
    			attr_dev(g21, "class", "zc-abs zc-layer zc-bl");
    			attr_dev(g21, "data-clip", "34,18,376,147");
    			set_style(g21, "display", "block");
    			add_location(g21, file$1, 77, 26252, 29141);
    			attr_dev(g22, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plot-3-bl-2-c");
    			attr_dev(g22, "class", "zc-abs zc-layer zc-bl");
    			attr_dev(g22, "data-clip", "34,18,376,147");
    			set_style(g22, "display", "block");
    			add_location(g22, file$1, 77, 26411, 29300);
    			attr_dev(g23, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plot-4-bl-2-c");
    			attr_dev(g23, "class", "zc-abs zc-layer zc-bl");
    			attr_dev(g23, "data-clip", "34,18,376,147");
    			set_style(g23, "display", "block");
    			add_location(g23, file$1, 77, 26570, 29459);
    			attr_dev(g24, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plots-bl-2");
    			attr_dev(g24, "clip-path", "url(#AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-clip)");
    			add_location(g24, file$1, 77, 25786, 28675);
    			attr_dev(path51, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-x-path");
    			attr_dev(path51, "d", "M 34.5 162.5 L 408.5 162.5 M 35.5 162.5 L 35.5 167.5 M 72.5 162.5 L 72.5 167.5 M 109.5 162.5 L 109.5 167.5 M 147.5 162.5 L 147.5 167.5 M 184.5 162.5 L 184.5 167.5 M 221.5 162.5 L 221.5 167.5 M 258.5 162.5 L 258.5 167.5 M 295.5 162.5 L 295.5 167.5 M 333.5 162.5 L 333.5 167.5 M 370.5 162.5 L 370.5 167.5 M 407.5 162.5 L 407.5 167.5");
    			attr_dev(path51, "fill", "none");
    			attr_dev(path51, "stroke-linecap", "butt");
    			attr_dev(path51, "stroke-linejoin", "round");
    			attr_dev(path51, "stroke", "#8C8C8C");
    			attr_dev(path51, "stroke-width", "1");
    			attr_dev(path51, "stroke-opacity", "1");
    			add_location(path51, file$1, 77, 26832, 29721);
    			attr_dev(path52, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-y-path");
    			attr_dev(path52, "d", "M 35.5 162.5 L 35.5 19.5");
    			attr_dev(path52, "fill", "none");
    			attr_dev(path52, "stroke-linecap", "butt");
    			attr_dev(path52, "stroke-linejoin", "round");
    			attr_dev(path52, "stroke", "#8C8C8C");
    			attr_dev(path52, "stroke-width", "1");
    			attr_dev(path52, "stroke-opacity", "1");
    			add_location(path52, file$1, 77, 27362, 30251);
    			attr_dev(path53, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-y-tick-6-path");
    			attr_dev(path53, "d", "M 35.5 162.5 L 30.5 162.5 M 35.5 138.5 L 30.5 138.5 M 35.5 114.5 L 30.5 114.5 M 35.5 91.5 L 30.5 91.5 M 35.5 67.5 L 30.5 67.5 M 35.5 43.5 L 30.5 43.5 M 35.5 19.5 L 30.5 19.5");
    			attr_dev(path53, "fill", "none");
    			attr_dev(path53, "stroke-linecap", "butt");
    			attr_dev(path53, "stroke-linejoin", "round");
    			attr_dev(path53, "stroke", "#8C8C8C");
    			attr_dev(path53, "stroke-width", "1");
    			attr_dev(path53, "stroke-opacity", "1");
    			add_location(path53, file$1, 77, 27586, 30475);
    			attr_dev(g25, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scales-ml-0-c");
    			attr_dev(g25, "class", "zc-abs zc-layer");
    			add_location(g25, file$1, 77, 26733, 29622);
    			attr_dev(g26, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plot-0-fl-0-c");
    			attr_dev(g26, "class", "zc-abs zc-layer zc-fl");
    			attr_dev(g26, "data-clip", "30,14,384,155");
    			set_style(g26, "display", "block");
    			add_location(g26, file$1, 77, 28042, 30931);
    			attr_dev(g27, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plot-1-fl-0-c");
    			attr_dev(g27, "class", "zc-abs zc-layer zc-fl");
    			attr_dev(g27, "data-clip", "30,14,384,155");
    			set_style(g27, "display", "block");
    			add_location(g27, file$1, 77, 28201, 31090);
    			attr_dev(g28, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plot-2-fl-0-c");
    			attr_dev(g28, "class", "zc-abs zc-layer zc-fl");
    			attr_dev(g28, "data-clip", "30,14,384,155");
    			set_style(g28, "display", "block");
    			add_location(g28, file$1, 77, 28360, 31249);
    			attr_dev(g29, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plot-3-fl-0-c");
    			attr_dev(g29, "class", "zc-abs zc-layer zc-fl");
    			attr_dev(g29, "data-clip", "30,14,384,155");
    			set_style(g29, "display", "block");
    			add_location(g29, file$1, 77, 28519, 31408);
    			attr_dev(g30, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plot-4-fl-0-c");
    			attr_dev(g30, "class", "zc-abs zc-layer zc-fl");
    			attr_dev(g30, "data-clip", "30,14,384,155");
    			set_style(g30, "display", "block");
    			add_location(g30, file$1, 77, 28678, 31567);
    			attr_dev(g31, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plots-fl-0");
    			add_location(g31, file$1, 77, 27970, 30859);
    			attr_dev(g32, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scales-fl-0-c");
    			attr_dev(g32, "class", "zc-abs zc-layer");
    			add_location(g32, file$1, 77, 28988, 31877);
    			attr_dev(g33, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scales-fl");
    			attr_dev(g33, "clip-path", "url(#AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-clip)");
    			add_location(g33, file$1, 77, 28841, 31730);
    			attr_dev(g34, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scroll");
    			add_location(g34, file$1, 77, 29095, 31984);
    			attr_dev(g35, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plot-0-vb-c");
    			attr_dev(g35, "class", "zc-abs zc-layer zc-vb");
    			add_location(g35, file$1, 77, 29237, 32126);
    			attr_dev(g36, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plot-1-vb-c");
    			attr_dev(g36, "class", "zc-abs zc-layer zc-vb");
    			add_location(g36, file$1, 77, 29344, 32233);
    			attr_dev(g37, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plot-2-vb-c");
    			attr_dev(g37, "class", "zc-abs zc-layer zc-vb");
    			add_location(g37, file$1, 77, 29451, 32340);
    			attr_dev(g38, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plot-3-vb-c");
    			attr_dev(g38, "class", "zc-abs zc-layer zc-vb");
    			add_location(g38, file$1, 77, 29558, 32447);
    			attr_dev(g39, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plot-4-vb-c");
    			attr_dev(g39, "class", "zc-abs zc-layer zc-vb");
    			add_location(g39, file$1, 77, 29665, 32554);
    			attr_dev(g40, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plots-vb");
    			add_location(g40, file$1, 77, 29167, 32056);
    			attr_dev(g41, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0");
    			attr_dev(g41, "class", "zc-abs");
    			add_location(g41, file$1, 77, 611, 3500);
    			attr_dev(g42, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graphset");
    			attr_dev(g42, "class", "zc-abs");
    			add_location(g42, file$1, 77, 536, 3425);
    			attr_dev(g43, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-objects-maps");
    			attr_dev(g43, "class", "zc-abs");
    			add_location(g43, file$1, 77, 29784, 32673);
    			attr_dev(g44, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-objects-top");
    			attr_dev(g44, "class", "zc-abs");
    			add_location(g44, file$1, 77, 29867, 32756);
    			attr_dev(g45, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-hover-c");
    			attr_dev(g45, "class", "zc-abs zc-layer");
    			add_location(g45, file$1, 77, 30185, 33074);
    			attr_dev(g46, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-hover");
    			attr_dev(g46, "class", "zc-abs");
    			attr_dev(g46, "clip-path", "url(#AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-clip-hover)");
    			add_location(g46, file$1, 77, 30021, 32910);
    			attr_dev(g47, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-hover");
    			attr_dev(g47, "class", "zc-abs");
    			add_location(g47, file$1, 77, 29949, 32838);
    			attr_dev(g48, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-objects-front");
    			attr_dev(g48, "class", "zc-abs");
    			add_location(g48, file$1, 77, 30290, 33179);
    			attr_dev(tspan0, "x", "41.95");
    			attr_dev(tspan0, "y", "180");
    			attr_dev(tspan0, "color", "#808285");
    			attr_dev(tspan0, "fill", "#808285");
    			attr_dev(tspan0, "dy", "0");
    			set_style(tspan0, "font-weight", "normal");
    			set_style(tspan0, "font-style", "normal");
    			set_style(tspan0, "text-decoration", "none");
    			set_style(tspan0, "font-size", "10px");
    			set_style(tspan0, "font-family", "\"Lucida Sans Unicode\", \"Lucida Grande\", \"Lucida Sans\", Helvetica, Arial, sans-serif");
    			set_style(tspan0, "dominant-baseline", "auto");
    			add_location(tspan0, file$1, 77, 30713, 33602);
    			attr_dev(tspan1, "x", "45.38");
    			attr_dev(tspan1, "y", "180");
    			attr_dev(tspan1, "color", "#808285");
    			attr_dev(tspan1, "fill", "#808285");
    			attr_dev(tspan1, "dy", "12.5");
    			set_style(tspan1, "font-weight", "normal");
    			set_style(tspan1, "font-style", "normal");
    			set_style(tspan1, "text-decoration", "none");
    			set_style(tspan1, "font-size", "10px");
    			set_style(tspan1, "font-family", "\"Lucida Sans Unicode\", \"Lucida Grande\", \"Lucida Sans\", Helvetica, Arial, sans-serif");
    			set_style(tspan1, "dominant-baseline", "auto");
    			add_location(tspan1, file$1, 77, 31031, 33920);
    			attr_dev(text0, "x", "40.1");
    			attr_dev(text0, "y", "170");
    			attr_dev(text0, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale_x-item_0");
    			attr_dev(text0, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-x-item AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-item zc-scale-item");
    			attr_dev(text0, "opacity", "1");
    			add_location(text0, file$1, 77, 30453, 33342);
    			attr_dev(tspan2, "x", "376.75");
    			attr_dev(tspan2, "y", "180");
    			attr_dev(tspan2, "color", "#808285");
    			attr_dev(tspan2, "fill", "#808285");
    			attr_dev(tspan2, "dy", "0");
    			set_style(tspan2, "font-weight", "normal");
    			set_style(tspan2, "font-style", "normal");
    			set_style(tspan2, "text-decoration", "none");
    			set_style(tspan2, "font-size", "10px");
    			set_style(tspan2, "font-family", "\"Lucida Sans Unicode\", \"Lucida Grande\", \"Lucida Sans\", Helvetica, Arial, sans-serif");
    			set_style(tspan2, "dominant-baseline", "auto");
    			add_location(tspan2, file$1, 77, 31619, 34508);
    			attr_dev(tspan3, "x", "380.18");
    			attr_dev(tspan3, "y", "180");
    			attr_dev(tspan3, "color", "#808285");
    			attr_dev(tspan3, "fill", "#808285");
    			attr_dev(tspan3, "dy", "12.5");
    			set_style(tspan3, "font-weight", "normal");
    			set_style(tspan3, "font-style", "normal");
    			set_style(tspan3, "text-decoration", "none");
    			set_style(tspan3, "font-size", "10px");
    			set_style(tspan3, "font-family", "\"Lucida Sans Unicode\", \"Lucida Grande\", \"Lucida Sans\", Helvetica, Arial, sans-serif");
    			set_style(tspan3, "dominant-baseline", "auto");
    			add_location(tspan3, file$1, 77, 31938, 34827);
    			attr_dev(text1, "x", "374.9");
    			attr_dev(text1, "y", "170");
    			attr_dev(text1, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale_x-item_9");
    			attr_dev(text1, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-x-item AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-item zc-scale-item");
    			attr_dev(text1, "opacity", "1");
    			add_location(text1, file$1, 77, 31358, 34247);
    			attr_dev(tspan4, "x", "79.15");
    			attr_dev(tspan4, "y", "180");
    			attr_dev(tspan4, "color", "#808285");
    			attr_dev(tspan4, "fill", "#808285");
    			attr_dev(tspan4, "dy", "0");
    			set_style(tspan4, "font-weight", "normal");
    			set_style(tspan4, "font-style", "normal");
    			set_style(tspan4, "text-decoration", "none");
    			set_style(tspan4, "font-size", "10px");
    			set_style(tspan4, "font-family", "\"Lucida Sans Unicode\", \"Lucida Grande\", \"Lucida Sans\", Helvetica, Arial, sans-serif");
    			set_style(tspan4, "dominant-baseline", "auto");
    			add_location(tspan4, file$1, 77, 32526, 35415);
    			attr_dev(tspan5, "x", "82.58");
    			attr_dev(tspan5, "y", "180");
    			attr_dev(tspan5, "color", "#808285");
    			attr_dev(tspan5, "fill", "#808285");
    			attr_dev(tspan5, "dy", "12.5");
    			set_style(tspan5, "font-weight", "normal");
    			set_style(tspan5, "font-style", "normal");
    			set_style(tspan5, "text-decoration", "none");
    			set_style(tspan5, "font-size", "10px");
    			set_style(tspan5, "font-family", "\"Lucida Sans Unicode\", \"Lucida Grande\", \"Lucida Sans\", Helvetica, Arial, sans-serif");
    			set_style(tspan5, "dominant-baseline", "auto");
    			add_location(tspan5, file$1, 77, 32844, 35733);
    			attr_dev(text2, "x", "77.3");
    			attr_dev(text2, "y", "170");
    			attr_dev(text2, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale_x-item_1");
    			attr_dev(text2, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-x-item AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-item zc-scale-item");
    			attr_dev(text2, "opacity", "1");
    			add_location(text2, file$1, 77, 32266, 35155);
    			attr_dev(tspan6, "x", "116.35");
    			attr_dev(tspan6, "y", "180");
    			attr_dev(tspan6, "color", "#808285");
    			attr_dev(tspan6, "fill", "#808285");
    			attr_dev(tspan6, "dy", "0");
    			set_style(tspan6, "font-weight", "normal");
    			set_style(tspan6, "font-style", "normal");
    			set_style(tspan6, "text-decoration", "none");
    			set_style(tspan6, "font-size", "10px");
    			set_style(tspan6, "font-family", "\"Lucida Sans Unicode\", \"Lucida Grande\", \"Lucida Sans\", Helvetica, Arial, sans-serif");
    			set_style(tspan6, "dominant-baseline", "auto");
    			add_location(tspan6, file$1, 77, 33432, 36321);
    			attr_dev(tspan7, "x", "119.78");
    			attr_dev(tspan7, "y", "180");
    			attr_dev(tspan7, "color", "#808285");
    			attr_dev(tspan7, "fill", "#808285");
    			attr_dev(tspan7, "dy", "12.5");
    			set_style(tspan7, "font-weight", "normal");
    			set_style(tspan7, "font-style", "normal");
    			set_style(tspan7, "text-decoration", "none");
    			set_style(tspan7, "font-size", "10px");
    			set_style(tspan7, "font-family", "\"Lucida Sans Unicode\", \"Lucida Grande\", \"Lucida Sans\", Helvetica, Arial, sans-serif");
    			set_style(tspan7, "dominant-baseline", "auto");
    			add_location(tspan7, file$1, 77, 33751, 36640);
    			attr_dev(text3, "x", "114.5");
    			attr_dev(text3, "y", "170");
    			attr_dev(text3, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale_x-item_2");
    			attr_dev(text3, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-x-item AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-item zc-scale-item");
    			attr_dev(text3, "opacity", "1");
    			add_location(text3, file$1, 77, 33171, 36060);
    			attr_dev(tspan8, "x", "153.55");
    			attr_dev(tspan8, "y", "180");
    			attr_dev(tspan8, "color", "#808285");
    			attr_dev(tspan8, "fill", "#808285");
    			attr_dev(tspan8, "dy", "0");
    			set_style(tspan8, "font-weight", "normal");
    			set_style(tspan8, "font-style", "normal");
    			set_style(tspan8, "text-decoration", "none");
    			set_style(tspan8, "font-size", "10px");
    			set_style(tspan8, "font-family", "\"Lucida Sans Unicode\", \"Lucida Grande\", \"Lucida Sans\", Helvetica, Arial, sans-serif");
    			set_style(tspan8, "dominant-baseline", "auto");
    			add_location(tspan8, file$1, 77, 34340, 37229);
    			attr_dev(tspan9, "x", "156.98");
    			attr_dev(tspan9, "y", "180");
    			attr_dev(tspan9, "color", "#808285");
    			attr_dev(tspan9, "fill", "#808285");
    			attr_dev(tspan9, "dy", "12.5");
    			set_style(tspan9, "font-weight", "normal");
    			set_style(tspan9, "font-style", "normal");
    			set_style(tspan9, "text-decoration", "none");
    			set_style(tspan9, "font-size", "10px");
    			set_style(tspan9, "font-family", "\"Lucida Sans Unicode\", \"Lucida Grande\", \"Lucida Sans\", Helvetica, Arial, sans-serif");
    			set_style(tspan9, "dominant-baseline", "auto");
    			add_location(tspan9, file$1, 77, 34659, 37548);
    			attr_dev(text4, "x", "151.7");
    			attr_dev(text4, "y", "170");
    			attr_dev(text4, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale_x-item_3");
    			attr_dev(text4, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-x-item AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-item zc-scale-item");
    			attr_dev(text4, "opacity", "1");
    			add_location(text4, file$1, 77, 34079, 36968);
    			attr_dev(tspan10, "x", "190.75");
    			attr_dev(tspan10, "y", "180");
    			attr_dev(tspan10, "color", "#808285");
    			attr_dev(tspan10, "fill", "#808285");
    			attr_dev(tspan10, "dy", "0");
    			set_style(tspan10, "font-weight", "normal");
    			set_style(tspan10, "font-style", "normal");
    			set_style(tspan10, "text-decoration", "none");
    			set_style(tspan10, "font-size", "10px");
    			set_style(tspan10, "font-family", "\"Lucida Sans Unicode\", \"Lucida Grande\", \"Lucida Sans\", Helvetica, Arial, sans-serif");
    			set_style(tspan10, "dominant-baseline", "auto");
    			add_location(tspan10, file$1, 77, 35248, 38137);
    			attr_dev(tspan11, "x", "194.18");
    			attr_dev(tspan11, "y", "180");
    			attr_dev(tspan11, "color", "#808285");
    			attr_dev(tspan11, "fill", "#808285");
    			attr_dev(tspan11, "dy", "12.5");
    			set_style(tspan11, "font-weight", "normal");
    			set_style(tspan11, "font-style", "normal");
    			set_style(tspan11, "text-decoration", "none");
    			set_style(tspan11, "font-size", "10px");
    			set_style(tspan11, "font-family", "\"Lucida Sans Unicode\", \"Lucida Grande\", \"Lucida Sans\", Helvetica, Arial, sans-serif");
    			set_style(tspan11, "dominant-baseline", "auto");
    			add_location(tspan11, file$1, 77, 35567, 38456);
    			attr_dev(text5, "x", "188.9");
    			attr_dev(text5, "y", "170");
    			attr_dev(text5, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale_x-item_4");
    			attr_dev(text5, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-x-item AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-item zc-scale-item");
    			attr_dev(text5, "opacity", "1");
    			add_location(text5, file$1, 77, 34987, 37876);
    			attr_dev(tspan12, "x", "227.95");
    			attr_dev(tspan12, "y", "180");
    			attr_dev(tspan12, "color", "#808285");
    			attr_dev(tspan12, "fill", "#808285");
    			attr_dev(tspan12, "dy", "0");
    			set_style(tspan12, "font-weight", "normal");
    			set_style(tspan12, "font-style", "normal");
    			set_style(tspan12, "text-decoration", "none");
    			set_style(tspan12, "font-size", "10px");
    			set_style(tspan12, "font-family", "\"Lucida Sans Unicode\", \"Lucida Grande\", \"Lucida Sans\", Helvetica, Arial, sans-serif");
    			set_style(tspan12, "dominant-baseline", "auto");
    			add_location(tspan12, file$1, 77, 36156, 39045);
    			attr_dev(tspan13, "x", "231.38");
    			attr_dev(tspan13, "y", "180");
    			attr_dev(tspan13, "color", "#808285");
    			attr_dev(tspan13, "fill", "#808285");
    			attr_dev(tspan13, "dy", "12.5");
    			set_style(tspan13, "font-weight", "normal");
    			set_style(tspan13, "font-style", "normal");
    			set_style(tspan13, "text-decoration", "none");
    			set_style(tspan13, "font-size", "10px");
    			set_style(tspan13, "font-family", "\"Lucida Sans Unicode\", \"Lucida Grande\", \"Lucida Sans\", Helvetica, Arial, sans-serif");
    			set_style(tspan13, "dominant-baseline", "auto");
    			add_location(tspan13, file$1, 77, 36475, 39364);
    			attr_dev(text6, "x", "226.1");
    			attr_dev(text6, "y", "170");
    			attr_dev(text6, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale_x-item_5");
    			attr_dev(text6, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-x-item AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-item zc-scale-item");
    			attr_dev(text6, "opacity", "1");
    			add_location(text6, file$1, 77, 35895, 38784);
    			attr_dev(tspan14, "x", "265.15");
    			attr_dev(tspan14, "y", "180");
    			attr_dev(tspan14, "color", "#808285");
    			attr_dev(tspan14, "fill", "#808285");
    			attr_dev(tspan14, "dy", "0");
    			set_style(tspan14, "font-weight", "normal");
    			set_style(tspan14, "font-style", "normal");
    			set_style(tspan14, "text-decoration", "none");
    			set_style(tspan14, "font-size", "10px");
    			set_style(tspan14, "font-family", "\"Lucida Sans Unicode\", \"Lucida Grande\", \"Lucida Sans\", Helvetica, Arial, sans-serif");
    			set_style(tspan14, "dominant-baseline", "auto");
    			add_location(tspan14, file$1, 77, 37064, 39953);
    			attr_dev(tspan15, "x", "268.58");
    			attr_dev(tspan15, "y", "180");
    			attr_dev(tspan15, "color", "#808285");
    			attr_dev(tspan15, "fill", "#808285");
    			attr_dev(tspan15, "dy", "12.5");
    			set_style(tspan15, "font-weight", "normal");
    			set_style(tspan15, "font-style", "normal");
    			set_style(tspan15, "text-decoration", "none");
    			set_style(tspan15, "font-size", "10px");
    			set_style(tspan15, "font-family", "\"Lucida Sans Unicode\", \"Lucida Grande\", \"Lucida Sans\", Helvetica, Arial, sans-serif");
    			set_style(tspan15, "dominant-baseline", "auto");
    			add_location(tspan15, file$1, 77, 37383, 40272);
    			attr_dev(text7, "x", "263.3");
    			attr_dev(text7, "y", "170");
    			attr_dev(text7, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale_x-item_6");
    			attr_dev(text7, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-x-item AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-item zc-scale-item");
    			attr_dev(text7, "opacity", "1");
    			add_location(text7, file$1, 77, 36803, 39692);
    			attr_dev(tspan16, "x", "302.35");
    			attr_dev(tspan16, "y", "180");
    			attr_dev(tspan16, "color", "#808285");
    			attr_dev(tspan16, "fill", "#808285");
    			attr_dev(tspan16, "dy", "0");
    			set_style(tspan16, "font-weight", "normal");
    			set_style(tspan16, "font-style", "normal");
    			set_style(tspan16, "text-decoration", "none");
    			set_style(tspan16, "font-size", "10px");
    			set_style(tspan16, "font-family", "\"Lucida Sans Unicode\", \"Lucida Grande\", \"Lucida Sans\", Helvetica, Arial, sans-serif");
    			set_style(tspan16, "dominant-baseline", "auto");
    			add_location(tspan16, file$1, 77, 37972, 40861);
    			attr_dev(tspan17, "x", "305.78");
    			attr_dev(tspan17, "y", "180");
    			attr_dev(tspan17, "color", "#808285");
    			attr_dev(tspan17, "fill", "#808285");
    			attr_dev(tspan17, "dy", "12.5");
    			set_style(tspan17, "font-weight", "normal");
    			set_style(tspan17, "font-style", "normal");
    			set_style(tspan17, "text-decoration", "none");
    			set_style(tspan17, "font-size", "10px");
    			set_style(tspan17, "font-family", "\"Lucida Sans Unicode\", \"Lucida Grande\", \"Lucida Sans\", Helvetica, Arial, sans-serif");
    			set_style(tspan17, "dominant-baseline", "auto");
    			add_location(tspan17, file$1, 77, 38291, 41180);
    			attr_dev(text8, "x", "300.5");
    			attr_dev(text8, "y", "170");
    			attr_dev(text8, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale_x-item_7");
    			attr_dev(text8, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-x-item AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-item zc-scale-item");
    			attr_dev(text8, "opacity", "1");
    			add_location(text8, file$1, 77, 37711, 40600);
    			attr_dev(tspan18, "x", "339.55");
    			attr_dev(tspan18, "y", "180");
    			attr_dev(tspan18, "color", "#808285");
    			attr_dev(tspan18, "fill", "#808285");
    			attr_dev(tspan18, "dy", "0");
    			set_style(tspan18, "font-weight", "normal");
    			set_style(tspan18, "font-style", "normal");
    			set_style(tspan18, "text-decoration", "none");
    			set_style(tspan18, "font-size", "10px");
    			set_style(tspan18, "font-family", "\"Lucida Sans Unicode\", \"Lucida Grande\", \"Lucida Sans\", Helvetica, Arial, sans-serif");
    			set_style(tspan18, "dominant-baseline", "auto");
    			add_location(tspan18, file$1, 77, 38880, 41769);
    			attr_dev(tspan19, "x", "342.98");
    			attr_dev(tspan19, "y", "180");
    			attr_dev(tspan19, "color", "#808285");
    			attr_dev(tspan19, "fill", "#808285");
    			attr_dev(tspan19, "dy", "12.5");
    			set_style(tspan19, "font-weight", "normal");
    			set_style(tspan19, "font-style", "normal");
    			set_style(tspan19, "text-decoration", "none");
    			set_style(tspan19, "font-size", "10px");
    			set_style(tspan19, "font-family", "\"Lucida Sans Unicode\", \"Lucida Grande\", \"Lucida Sans\", Helvetica, Arial, sans-serif");
    			set_style(tspan19, "dominant-baseline", "auto");
    			add_location(tspan19, file$1, 77, 39199, 42088);
    			attr_dev(text9, "x", "337.7");
    			attr_dev(text9, "y", "170");
    			attr_dev(text9, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale_x-item_8");
    			attr_dev(text9, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-x-item AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-item zc-scale-item");
    			attr_dev(text9, "opacity", "1");
    			add_location(text9, file$1, 77, 38619, 41508);
    			attr_dev(tspan20, "x", "21.41");
    			attr_dev(tspan20, "y", "167.2");
    			attr_dev(tspan20, "color", "#808285");
    			attr_dev(tspan20, "fill", "#808285");
    			attr_dev(tspan20, "dy", "0");
    			set_style(tspan20, "font-weight", "normal");
    			set_style(tspan20, "font-style", "normal");
    			set_style(tspan20, "text-decoration", "none");
    			set_style(tspan20, "font-size", "12px");
    			set_style(tspan20, "font-family", "\"Lucida Sans Unicode\", \"Lucida Grande\", \"Lucida Sans\", Helvetica, Arial, sans-serif");
    			set_style(tspan20, "dominant-baseline", "auto");
    			add_location(tspan20, file$1, 77, 39790, 42679);
    			attr_dev(text10, "x", "21.41");
    			attr_dev(text10, "y", "155.2");
    			attr_dev(text10, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale_y-item_0");
    			attr_dev(text10, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-y-item AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-item zc-scale-item");
    			attr_dev(text10, "opacity", "1");
    			add_location(text10, file$1, 77, 39527, 42416);
    			attr_dev(tspan21, "x", "13.81");
    			attr_dev(tspan21, "y", "24.2");
    			attr_dev(tspan21, "color", "#808285");
    			attr_dev(tspan21, "fill", "#808285");
    			attr_dev(tspan21, "dy", "0");
    			set_style(tspan21, "font-weight", "normal");
    			set_style(tspan21, "font-style", "normal");
    			set_style(tspan21, "text-decoration", "none");
    			set_style(tspan21, "font-size", "12px");
    			set_style(tspan21, "font-family", "\"Lucida Sans Unicode\", \"Lucida Grande\", \"Lucida Sans\", Helvetica, Arial, sans-serif");
    			set_style(tspan21, "dominant-baseline", "auto");
    			add_location(tspan21, file$1, 77, 40375, 43264);
    			attr_dev(text11, "x", "13.81");
    			attr_dev(text11, "y", "12.2");
    			attr_dev(text11, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale_y-item_6");
    			attr_dev(text11, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-y-item AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-item zc-scale-item");
    			attr_dev(text11, "opacity", "1");
    			add_location(text11, file$1, 77, 40113, 43002);
    			attr_dev(tspan22, "x", "21.41");
    			attr_dev(tspan22, "y", "143.37");
    			attr_dev(tspan22, "color", "#808285");
    			attr_dev(tspan22, "fill", "#808285");
    			attr_dev(tspan22, "dy", "0");
    			set_style(tspan22, "font-weight", "normal");
    			set_style(tspan22, "font-style", "normal");
    			set_style(tspan22, "text-decoration", "none");
    			set_style(tspan22, "font-size", "12px");
    			set_style(tspan22, "font-family", "\"Lucida Sans Unicode\", \"Lucida Grande\", \"Lucida Sans\", Helvetica, Arial, sans-serif");
    			set_style(tspan22, "dominant-baseline", "auto");
    			add_location(tspan22, file$1, 77, 40962, 43851);
    			attr_dev(text12, "x", "21.41");
    			attr_dev(text12, "y", "131.37");
    			attr_dev(text12, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale_y-item_1");
    			attr_dev(text12, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-y-item AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-item zc-scale-item");
    			attr_dev(text12, "opacity", "1");
    			add_location(text12, file$1, 77, 40698, 43587);
    			attr_dev(tspan23, "x", "21.41");
    			attr_dev(tspan23, "y", "119.54");
    			attr_dev(tspan23, "color", "#808285");
    			attr_dev(tspan23, "fill", "#808285");
    			attr_dev(tspan23, "dy", "0");
    			set_style(tspan23, "font-weight", "normal");
    			set_style(tspan23, "font-style", "normal");
    			set_style(tspan23, "text-decoration", "none");
    			set_style(tspan23, "font-size", "12px");
    			set_style(tspan23, "font-family", "\"Lucida Sans Unicode\", \"Lucida Grande\", \"Lucida Sans\", Helvetica, Arial, sans-serif");
    			set_style(tspan23, "dominant-baseline", "auto");
    			add_location(tspan23, file$1, 77, 41550, 44439);
    			attr_dev(text13, "x", "21.41");
    			attr_dev(text13, "y", "107.54");
    			attr_dev(text13, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale_y-item_2");
    			attr_dev(text13, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-y-item AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-item zc-scale-item");
    			attr_dev(text13, "opacity", "1");
    			add_location(text13, file$1, 77, 41286, 44175);
    			attr_dev(tspan24, "x", "21.41");
    			attr_dev(tspan24, "y", "95.7");
    			attr_dev(tspan24, "color", "#808285");
    			attr_dev(tspan24, "fill", "#808285");
    			attr_dev(tspan24, "dy", "0");
    			set_style(tspan24, "font-weight", "normal");
    			set_style(tspan24, "font-style", "normal");
    			set_style(tspan24, "text-decoration", "none");
    			set_style(tspan24, "font-size", "12px");
    			set_style(tspan24, "font-family", "\"Lucida Sans Unicode\", \"Lucida Grande\", \"Lucida Sans\", Helvetica, Arial, sans-serif");
    			set_style(tspan24, "dominant-baseline", "auto");
    			add_location(tspan24, file$1, 77, 42136, 45025);
    			attr_dev(text14, "x", "21.41");
    			attr_dev(text14, "y", "83.7");
    			attr_dev(text14, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale_y-item_3");
    			attr_dev(text14, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-y-item AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-item zc-scale-item");
    			attr_dev(text14, "opacity", "1");
    			add_location(text14, file$1, 77, 41874, 44763);
    			attr_dev(tspan25, "x", "21.41");
    			attr_dev(tspan25, "y", "71.87");
    			attr_dev(tspan25, "color", "#808285");
    			attr_dev(tspan25, "fill", "#808285");
    			attr_dev(tspan25, "dy", "0");
    			set_style(tspan25, "font-weight", "normal");
    			set_style(tspan25, "font-style", "normal");
    			set_style(tspan25, "text-decoration", "none");
    			set_style(tspan25, "font-size", "12px");
    			set_style(tspan25, "font-family", "\"Lucida Sans Unicode\", \"Lucida Grande\", \"Lucida Sans\", Helvetica, Arial, sans-serif");
    			set_style(tspan25, "dominant-baseline", "auto");
    			add_location(tspan25, file$1, 77, 42721, 45610);
    			attr_dev(text15, "x", "21.41");
    			attr_dev(text15, "y", "59.87");
    			attr_dev(text15, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale_y-item_4");
    			attr_dev(text15, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-y-item AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-item zc-scale-item");
    			attr_dev(text15, "opacity", "1");
    			add_location(text15, file$1, 77, 42458, 45347);
    			attr_dev(tspan26, "x", "13.81");
    			attr_dev(tspan26, "y", "48.04");
    			attr_dev(tspan26, "color", "#808285");
    			attr_dev(tspan26, "fill", "#808285");
    			attr_dev(tspan26, "dy", "0");
    			set_style(tspan26, "font-weight", "normal");
    			set_style(tspan26, "font-style", "normal");
    			set_style(tspan26, "text-decoration", "none");
    			set_style(tspan26, "font-size", "12px");
    			set_style(tspan26, "font-family", "\"Lucida Sans Unicode\", \"Lucida Grande\", \"Lucida Sans\", Helvetica, Arial, sans-serif");
    			set_style(tspan26, "dominant-baseline", "auto");
    			add_location(tspan26, file$1, 77, 43307, 46196);
    			attr_dev(text16, "x", "13.81");
    			attr_dev(text16, "y", "36.04");
    			attr_dev(text16, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale_y-item_5");
    			attr_dev(text16, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-y-item AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-item zc-scale-item");
    			attr_dev(text16, "opacity", "1");
    			add_location(text16, file$1, 77, 43044, 45933);
    			attr_dev(g49, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-text");
    			attr_dev(g49, "class", "zc-abs zc-text");
    			add_location(g49, file$1, 77, 30374, 33263);
    			attr_dev(g50, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-legend");
    			attr_dev(g50, "class", "zc-abs");
    			add_location(g50, file$1, 77, 43635, 46524);
    			attr_dev(g51, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-static-c");
    			attr_dev(g51, "class", "zc-abs zc-layer");
    			add_location(g51, file$1, 77, 43784, 46673);
    			attr_dev(g52, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-guide-c");
    			attr_dev(g52, "class", "zc-abs zc-layer zc-guide-c");
    			add_location(g52, file$1, 77, 43872, 46761);
    			attr_dev(g53, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-trigger-c");
    			attr_dev(g53, "class", "zc-abs zc-layer");
    			add_location(g53, file$1, 77, 43970, 46859);
    			attr_dev(g54, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-print-c");
    			attr_dev(g54, "class", "zc-abs zc-layer");
    			add_location(g54, file$1, 77, 44059, 46948);
    			attr_dev(g55, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-textprint-c");
    			attr_dev(g55, "class", "zc-abs zc-layer");
    			add_location(g55, file$1, 77, 44146, 47035);
    			attr_dev(g56, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-tools");
    			attr_dev(g56, "class", "zc-abs");
    			add_location(g56, file$1, 77, 43712, 46601);
    			attr_dev(g57, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-text-top");
    			attr_dev(g57, "class", "zc-abs");
    			add_location(g57, file$1, 77, 44241, 47130);
    			attr_dev(g58, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-main");
    			attr_dev(g58, "class", "zc-rel zc-main");
    			add_location(g58, file$1, 77, 295, 3184);
    			attr_dev(polygon0, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-clip-shape");
    			attr_dev(polygon0, "points", "34,18 410,18 410,165 34,165 34,18");
    			add_location(polygon0, file$1, 77, 44397, 47286);
    			attr_dev(clipPath0, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-clip");
    			add_location(clipPath0, file$1, 77, 44324, 47213);
    			attr_dev(polygon1, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-clip-hover-shape");
    			attr_dev(polygon1, "points", "30,14 414,14 414,169 30,169 30,14");
    			add_location(polygon1, file$1, 77, 44618, 47507);
    			attr_dev(clipPath1, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-clip-hover");
    			add_location(clipPath1, file$1, 77, 44539, 47428);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-svg");
    			attr_dev(svg, "class", "zc-svg");
    			attr_dev(svg, "viewBox", "0 0 428 203");
    			attr_dev(svg, "width", "90%");
    			attr_dev(svg, "display", "block");
    			add_location(svg, file$1, 77, 20, 2909);
    			attr_dev(div23, "class", "card-body");
    			add_location(div23, file$1, 76, 16, 2865);
    			attr_dev(div24, "class", "card card-32");
    			add_location(div24, file$1, 74, 12, 2760);
    			attr_dev(div25, "class", "col12 col-md-6");
    			add_location(div25, file$1, 73, 8, 2719);
    			attr_dev(div26, "class", "row");
    			add_location(div26, file$1, 35, 4, 1162);
    			add_location(h4, file$1, 85, 12, 47801);
    			add_location(th0, file$1, 90, 28, 47988);
    			add_location(th1, file$1, 91, 28, 48035);
    			add_location(th2, file$1, 92, 28, 48084);
    			add_location(th3, file$1, 93, 28, 48128);
    			add_location(th4, file$1, 94, 28, 48176);
    			add_location(th5, file$1, 95, 28, 48218);
    			add_location(th6, file$1, 96, 28, 48264);
    			add_location(th7, file$1, 97, 28, 48307);
    			add_location(th8, file$1, 98, 28, 48357);
    			add_location(tr0, file$1, 89, 24, 47955);
    			add_location(thead, file$1, 88, 20, 47923);
    			add_location(b, file$1, 103, 32, 48521);
    			add_location(td0, file$1, 103, 28, 48517);
    			add_location(td1, file$1, 104, 28, 48565);
    			add_location(td2, file$1, 105, 28, 48614);
    			add_location(td3, file$1, 106, 28, 48654);
    			add_location(td4, file$1, 107, 28, 48701);
    			add_location(td5, file$1, 108, 28, 48747);
    			add_location(td6, file$1, 109, 28, 48796);
    			add_location(td7, file$1, 110, 28, 48840);
    			add_location(td8, file$1, 111, 28, 48879);
    			add_location(tr1, file$1, 102, 24, 48484);
    			add_location(tbody, file$1, 101, 20, 48452);
    			attr_dev(table, "class", "table");
    			add_location(table, file$1, 87, 16, 47881);
    			attr_dev(div27, "class", "pagination");
    			add_location(div27, file$1, 116, 48, 49057);
    			attr_dev(div28, "class", "pagination-wrapper");
    			add_location(div28, file$1, 116, 16, 49025);
    			attr_dev(div29, "class", "sticky-wrapper svelte-1s2baiw");
    			add_location(div29, file$1, 86, 12, 47836);
    			attr_dev(div30, "class", "col12");
    			add_location(div30, file$1, 84, 8, 47769);
    			attr_dev(div31, "class", "row");
    			add_location(div31, file$1, 83, 4, 47743);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div26, anchor);
    			append_dev(div26, div21);
    			append_dev(div21, div20);
    			append_dev(div20, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div0);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div20, t3);
    			append_dev(div20, div9);
    			append_dev(div9, div8);
    			append_dev(div8, div5);
    			append_dev(div8, t5);
    			append_dev(div8, div7);
    			append_dev(div7, div6);
    			append_dev(div20, t7);
    			append_dev(div20, div14);
    			append_dev(div14, div13);
    			append_dev(div13, div10);
    			append_dev(div13, t9);
    			append_dev(div13, div12);
    			append_dev(div12, div11);
    			append_dev(div20, t11);
    			append_dev(div20, div19);
    			append_dev(div19, div18);
    			append_dev(div18, div15);
    			append_dev(div18, t13);
    			append_dev(div18, div17);
    			append_dev(div17, div16);
    			append_dev(div26, t15);
    			append_dev(div26, div25);
    			append_dev(div25, div24);
    			append_dev(div24, div22);
    			append_dev(div24, t17);
    			append_dev(div24, div23);
    			append_dev(div23, svg);
    			append_dev(svg, defs);
    			append_dev(svg, g58);
    			append_dev(g58, g0);
    			append_dev(g58, g1);
    			append_dev(g58, g42);
    			append_dev(g42, g41);
    			append_dev(g41, g2);
    			append_dev(g41, g4);
    			append_dev(g4, g3);
    			append_dev(g41, g6);
    			append_dev(g6, g5);
    			append_dev(g5, path0);
    			append_dev(g41, g12);
    			append_dev(g12, g7);
    			append_dev(g12, g8);
    			append_dev(g12, g9);
    			append_dev(g12, g10);
    			append_dev(g12, g11);
    			append_dev(g41, g18);
    			append_dev(g18, g13);
    			append_dev(g13, path1);
    			append_dev(g13, path2);
    			append_dev(g13, path3);
    			append_dev(g13, path4);
    			append_dev(g13, path5);
    			append_dev(g13, path6);
    			append_dev(g13, path7);
    			append_dev(g13, path8);
    			append_dev(g13, path9);
    			append_dev(g13, path10);
    			append_dev(g18, g14);
    			append_dev(g14, path11);
    			append_dev(g14, path12);
    			append_dev(g14, path13);
    			append_dev(g14, path14);
    			append_dev(g14, path15);
    			append_dev(g14, path16);
    			append_dev(g14, path17);
    			append_dev(g14, path18);
    			append_dev(g14, path19);
    			append_dev(g14, path20);
    			append_dev(g18, g15);
    			append_dev(g15, path21);
    			append_dev(g15, path22);
    			append_dev(g15, path23);
    			append_dev(g15, path24);
    			append_dev(g15, path25);
    			append_dev(g15, path26);
    			append_dev(g15, path27);
    			append_dev(g15, path28);
    			append_dev(g15, path29);
    			append_dev(g15, path30);
    			append_dev(g18, g16);
    			append_dev(g16, path31);
    			append_dev(g16, path32);
    			append_dev(g16, path33);
    			append_dev(g16, path34);
    			append_dev(g16, path35);
    			append_dev(g16, path36);
    			append_dev(g16, path37);
    			append_dev(g16, path38);
    			append_dev(g16, path39);
    			append_dev(g16, path40);
    			append_dev(g18, g17);
    			append_dev(g17, path41);
    			append_dev(g17, path42);
    			append_dev(g17, path43);
    			append_dev(g17, path44);
    			append_dev(g17, path45);
    			append_dev(g17, path46);
    			append_dev(g17, path47);
    			append_dev(g17, path48);
    			append_dev(g17, path49);
    			append_dev(g17, path50);
    			append_dev(g41, g24);
    			append_dev(g24, g19);
    			append_dev(g24, g20);
    			append_dev(g24, g21);
    			append_dev(g24, g22);
    			append_dev(g24, g23);
    			append_dev(g41, g25);
    			append_dev(g25, path51);
    			append_dev(g25, path52);
    			append_dev(g25, path53);
    			append_dev(g41, g31);
    			append_dev(g31, g26);
    			append_dev(g31, g27);
    			append_dev(g31, g28);
    			append_dev(g31, g29);
    			append_dev(g31, g30);
    			append_dev(g41, g33);
    			append_dev(g33, g32);
    			append_dev(g41, g34);
    			append_dev(g41, g40);
    			append_dev(g40, g35);
    			append_dev(g40, g36);
    			append_dev(g40, g37);
    			append_dev(g40, g38);
    			append_dev(g40, g39);
    			append_dev(g58, g43);
    			append_dev(g58, g44);
    			append_dev(g58, g47);
    			append_dev(g47, g46);
    			append_dev(g46, g45);
    			append_dev(g58, g48);
    			append_dev(g58, g49);
    			append_dev(g49, text0);
    			append_dev(text0, tspan0);
    			append_dev(tspan0, t18);
    			append_dev(text0, tspan1);
    			append_dev(tspan1, t19);
    			append_dev(g49, text1);
    			append_dev(text1, tspan2);
    			append_dev(tspan2, t20);
    			append_dev(text1, tspan3);
    			append_dev(tspan3, t21);
    			append_dev(g49, text2);
    			append_dev(text2, tspan4);
    			append_dev(tspan4, t22);
    			append_dev(text2, tspan5);
    			append_dev(tspan5, t23);
    			append_dev(g49, text3);
    			append_dev(text3, tspan6);
    			append_dev(tspan6, t24);
    			append_dev(text3, tspan7);
    			append_dev(tspan7, t25);
    			append_dev(g49, text4);
    			append_dev(text4, tspan8);
    			append_dev(tspan8, t26);
    			append_dev(text4, tspan9);
    			append_dev(tspan9, t27);
    			append_dev(g49, text5);
    			append_dev(text5, tspan10);
    			append_dev(tspan10, t28);
    			append_dev(text5, tspan11);
    			append_dev(tspan11, t29);
    			append_dev(g49, text6);
    			append_dev(text6, tspan12);
    			append_dev(tspan12, t30);
    			append_dev(text6, tspan13);
    			append_dev(tspan13, t31);
    			append_dev(g49, text7);
    			append_dev(text7, tspan14);
    			append_dev(tspan14, t32);
    			append_dev(text7, tspan15);
    			append_dev(tspan15, t33);
    			append_dev(g49, text8);
    			append_dev(text8, tspan16);
    			append_dev(tspan16, t34);
    			append_dev(text8, tspan17);
    			append_dev(tspan17, t35);
    			append_dev(g49, text9);
    			append_dev(text9, tspan18);
    			append_dev(tspan18, t36);
    			append_dev(text9, tspan19);
    			append_dev(tspan19, t37);
    			append_dev(g49, text10);
    			append_dev(text10, tspan20);
    			append_dev(tspan20, t38);
    			append_dev(g49, text11);
    			append_dev(text11, tspan21);
    			append_dev(tspan21, t39);
    			append_dev(g49, text12);
    			append_dev(text12, tspan22);
    			append_dev(tspan22, t40);
    			append_dev(g49, text13);
    			append_dev(text13, tspan23);
    			append_dev(tspan23, t41);
    			append_dev(g49, text14);
    			append_dev(text14, tspan24);
    			append_dev(tspan24, t42);
    			append_dev(g49, text15);
    			append_dev(text15, tspan25);
    			append_dev(tspan25, t43);
    			append_dev(g49, text16);
    			append_dev(text16, tspan26);
    			append_dev(tspan26, t44);
    			append_dev(g58, g50);
    			append_dev(g58, g56);
    			append_dev(g56, g51);
    			append_dev(g56, g52);
    			append_dev(g56, g53);
    			append_dev(g56, g54);
    			append_dev(g56, g55);
    			append_dev(g58, g57);
    			append_dev(svg, clipPath0);
    			append_dev(clipPath0, polygon0);
    			append_dev(svg, clipPath1);
    			append_dev(clipPath1, polygon1);
    			insert_dev(target, t45, anchor);
    			insert_dev(target, div31, anchor);
    			append_dev(div31, div30);
    			append_dev(div30, h4);
    			append_dev(div30, t47);
    			append_dev(div30, div29);
    			append_dev(div29, table);
    			append_dev(table, thead);
    			append_dev(thead, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t49);
    			append_dev(tr0, th1);
    			append_dev(tr0, t51);
    			append_dev(tr0, th2);
    			append_dev(tr0, t53);
    			append_dev(tr0, th3);
    			append_dev(tr0, t55);
    			append_dev(tr0, th4);
    			append_dev(tr0, t57);
    			append_dev(tr0, th5);
    			append_dev(tr0, t59);
    			append_dev(tr0, th6);
    			append_dev(tr0, t61);
    			append_dev(tr0, th7);
    			append_dev(tr0, t63);
    			append_dev(tr0, th8);
    			append_dev(table, t65);
    			append_dev(table, tbody);
    			append_dev(tbody, tr1);
    			append_dev(tr1, td0);
    			append_dev(td0, b);
    			append_dev(tr1, t67);
    			append_dev(tr1, td1);
    			append_dev(tr1, t69);
    			append_dev(tr1, td2);
    			append_dev(tr1, t71);
    			append_dev(tr1, td3);
    			append_dev(tr1, t73);
    			append_dev(tr1, td4);
    			append_dev(tr1, t75);
    			append_dev(tr1, td5);
    			append_dev(tr1, t77);
    			append_dev(tr1, td6);
    			append_dev(tr1, t79);
    			append_dev(tr1, td7);
    			append_dev(tr1, t81);
    			append_dev(tr1, td8);
    			append_dev(div29, t83);
    			append_dev(div29, div28);
    			append_dev(div28, div27);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div26);
    			if (detaching) detach_dev(t45);
    			if (detaching) detach_dev(div31);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(35:0) {#if tab == 'dashboard'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
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
    	let if_block_anchor;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*tab*/ ctx[0] == "dashboard") return create_if_block$1;
    		if (/*tab*/ ctx[0] == "summary") return create_if_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

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
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(a0, "href", "/");
    			add_location(a0, file$1, 17, 16, 320);
    			add_location(li0, file$1, 17, 12, 316);
    			attr_dev(a1, "href", "/");
    			add_location(a1, file$1, 18, 16, 367);
    			add_location(li1, file$1, 18, 12, 363);
    			add_location(li2, file$1, 19, 12, 453);
    			attr_dev(ul0, "class", "breadcrumb");
    			add_location(ul0, file$1, 16, 8, 280);
    			attr_dev(div0, "class", "col12 col-sm-5");
    			add_location(div0, file$1, 15, 4, 243);
    			attr_dev(a2, "href", "/");
    			attr_dev(a2, "class", "btn btn-secondary");
    			add_location(a2, file$1, 24, 8, 613);
    			attr_dev(a3, "href", "/");
    			attr_dev(a3, "class", "btn");
    			add_location(a3, file$1, 25, 8, 669);
    			attr_dev(div1, "class", "col12 col-sm-7 text-right");
    			add_location(div1, file$1, 22, 4, 501);
    			attr_dev(div2, "class", "row sticky");
    			add_location(div2, file$1, 14, 0, 214);
    			attr_dev(a4, "href", "/");
    			toggle_class(a4, "active", /*tab*/ ctx[0] == "dashboard");
    			add_location(a4, file$1, 30, 8, 746);
    			add_location(li3, file$1, 30, 4, 742);
    			attr_dev(a5, "href", "/");
    			toggle_class(a5, "active", /*tab*/ ctx[0] == "summary");
    			add_location(a5, file$1, 31, 8, 879);
    			add_location(li4, file$1, 31, 4, 875);
    			attr_dev(ul1, "class", "tabs");
    			add_location(ul1, file$1, 29, 0, 720);
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
    			insert_dev(target, t13, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(a1, "click", prevent_default(/*click_handler*/ ctx[2]), false, true, false),
    					listen_dev(a4, "click", prevent_default(/*click_handler_1*/ ctx[3]), false, true, false),
    					listen_dev(a5, "click", prevent_default(/*click_handler_2*/ ctx[4]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*tab*/ 1) {
    				toggle_class(a4, "active", /*tab*/ ctx[0] == "dashboard");
    			}

    			if (dirty & /*tab*/ 1) {
    				toggle_class(a5, "active", /*tab*/ ctx[0] == "summary");
    			}

    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
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
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(ul1);
    			if (detaching) detach_dev(t13);

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
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Frame_incidents", slots, []);
    	const dispatch = createEventDispatcher();
    	let tab = "dashboard";

    	function nav(str) {
    		dispatch("nav", { text: str });
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Frame_incidents> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		nav("home");
    	};

    	const click_handler_1 = () => {
    		$$invalidate(0, tab = "dashboard");
    	};

    	const click_handler_2 = () => {
    		$$invalidate(0, tab = "summary");
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		tab,
    		nav
    	});

    	$$self.$inject_state = $$props => {
    		if ("tab" in $$props) $$invalidate(0, tab = $$props.tab);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [tab, nav, click_handler, click_handler_1, click_handler_2];
    }

    class Frame_incidents extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Frame_incidents",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/Frame.svelte generated by Svelte v3.35.0 */
    const file = "src/Frame.svelte";

    // (31:0) {#if grid}
    function create_if_block(ctx) {
    	let div1;
    	let div0;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(div0, "class", "frame svelte-1s2lye6");
    			add_location(div0, file, 31, 18, 612);
    			attr_dev(div1, "class", "grid svelte-1s2lye6");
    			add_location(div1, file, 31, 0, 594);
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
    		source: "(31:0) {#if grid}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let t0;
    	let nav;
    	let div0;
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
    	let main;
    	let div1;
    	let switch_instance;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*grid*/ ctx[1] && create_if_block(ctx);
    	var switch_value = /*comp*/ ctx[0].component;

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("nav", /*handleNav*/ ctx[2]);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			nav = element("nav");
    			div0 = element("div");
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
    			main = element("main");
    			div1 = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			attr_dev(path0, "d", "M16.202 11.0018L16.792 9.6818C17.232 8.7118 18.202 8.0918 19.262 8.0918C19.982 8.0918 20.662 8.3718 21.172 8.8818L21.872 9.5818C20.632 10.2618 19.792 11.5818 19.792 13.0918V14.9718C19.792 18.3318 17.402 21.2218 14.102 21.8518L7.20199 23.1718C6.85199 23.2418 6.57199 23.4818 6.45199 23.8118C6.33199 24.1418 6.39199 24.5118 6.61199 24.7818C10.482 29.5718 16.302 31.0118 16.552 31.0718C16.632 31.0818 16.712 31.0918 16.792 31.0918C16.872 31.0918 16.952 31.0818 17.022 31.0618C17.162 31.0318 30.292 27.7318 30.292 15.0918V3.0918C30.292 1.9918 29.392 1.0918 28.292 1.0918H5.29199C4.19199 1.0918 3.29199 1.9918 3.29199 3.0918V18.3518L5.29199 16.3518V3.0918H28.292V15.0918C28.292 25.3918 18.512 28.5818 16.792 29.0518C15.852 28.7818 12.252 27.6018 9.34199 24.7918L14.482 23.8118C18.722 23.0018 21.792 19.2818 21.792 14.9718V13.0918C21.792 11.9918 22.692 11.0918 23.792 11.0918H24.642C25.222 11.0918 25.512 10.3918 25.102 9.9818L22.592 7.4718C21.702 6.5818 20.522 6.0918 19.262 6.0918C17.412 6.0918 15.732 7.1818 14.972 8.8618L14.452 10.0118L0.291992 24.1818V27.0118L16.002 11.3018C16.092 11.2118 16.152 11.1118 16.202 11.0018Z");
    			attr_dev(path0, "fill", "black");
    			add_location(path0, file, 38, 1, 830);
    			attr_dev(path1, "d", "M39.292 22.0918V8.0918H48.252V10.1018H41.552V13.9918H47.632V16.0018H41.552V20.0918H48.252V22.0918H39.292Z");
    			attr_dev(path1, "fill", "black");
    			add_location(path1, file, 39, 1, 1976);
    			attr_dev(path2, "d", "M54.6821 22.3318C53.9321 22.3318 53.2621 22.2018 52.6721 21.9518C52.0821 21.7018 51.5922 21.3318 51.1922 20.8618C50.7922 20.3918 50.4821 19.8118 50.2721 19.1418C50.0621 18.4718 49.9521 17.7118 49.9521 16.8818C49.9521 16.0518 50.0621 15.3018 50.2721 14.6218C50.4821 13.9518 50.7922 13.3718 51.1922 12.9018C51.5922 12.4318 52.0921 12.0618 52.6721 11.8118C53.2621 11.5618 53.9321 11.4318 54.6821 11.4318C55.7221 11.4318 56.5821 11.6618 57.2521 12.1318C57.9221 12.6018 58.4121 13.2218 58.7121 14.0018L56.9121 14.8418C56.7621 14.3618 56.5121 13.9718 56.1421 13.6918C55.7721 13.4018 55.2922 13.2618 54.6922 13.2618C53.8922 13.2618 53.2822 13.5118 52.8722 14.0118C52.4622 14.5118 52.2621 15.1618 52.2621 15.9618V17.8218C52.2621 18.6218 52.4622 19.2718 52.8722 19.7718C53.2822 20.2718 53.8822 20.5218 54.6922 20.5218C55.3321 20.5218 55.8421 20.3618 56.2221 20.0518C56.6021 19.7418 56.9021 19.3218 57.1321 18.8018L58.7921 19.6818C58.4421 20.5418 57.9221 21.2018 57.2321 21.6618C56.5321 22.1018 55.6821 22.3318 54.6821 22.3318Z");
    			attr_dev(path2, "fill", "black");
    			add_location(path2, file, 40, 1, 2108);
    			attr_dev(path3, "d", "M64.8518 22.3318C64.1318 22.3318 63.4718 22.2018 62.8818 21.9518C62.2818 21.7018 61.7818 21.3318 61.3718 20.8618C60.9518 20.3918 60.6318 19.8118 60.4118 19.1418C60.1818 18.4718 60.0718 17.7118 60.0718 16.8818C60.0718 16.0518 60.1818 15.3018 60.4118 14.6218C60.6418 13.9518 60.9618 13.3718 61.3718 12.9018C61.7818 12.4318 62.2918 12.0618 62.8818 11.8118C63.4718 11.5618 64.1318 11.4318 64.8518 11.4318C65.5718 11.4318 66.2318 11.5618 66.8318 11.8118C67.4218 12.0618 67.9318 12.4318 68.3418 12.9018C68.7518 13.3718 69.0818 13.9518 69.3018 14.6218C69.5318 15.3018 69.6418 16.0518 69.6418 16.8818C69.6418 17.7118 69.5318 18.4618 69.3018 19.1418C69.0718 19.8218 68.7518 20.3918 68.3418 20.8618C67.9318 21.3318 67.4218 21.7018 66.8318 21.9518C66.2318 22.2018 65.5718 22.3318 64.8518 22.3318ZM64.8518 20.5018C65.6018 20.5018 66.2018 20.2718 66.6618 19.8118C67.1118 19.3518 67.3418 18.6618 67.3418 17.7518V15.9918C67.3418 15.0718 67.1118 14.3918 66.6618 13.9318C66.2018 13.4718 65.6018 13.2418 64.8518 13.2418C64.1018 13.2418 63.5018 13.4718 63.0518 13.9318C62.6018 14.3918 62.3718 15.0818 62.3718 15.9918V17.7518C62.3718 18.6718 62.6018 19.3518 63.0518 19.8118C63.5018 20.2718 64.1018 20.5018 64.8518 20.5018Z");
    			attr_dev(path3, "fill", "black");
    			add_location(path3, file, 41, 1, 3152);
    			attr_dev(path4, "d", "M77.832 22.3318C76.922 22.3318 76.092 22.1718 75.352 21.8618C74.612 21.5518 73.972 21.0918 73.442 20.4818C72.912 19.8718 72.502 19.1218 72.222 18.2118C71.932 17.3118 71.792 16.2718 71.792 15.0918C71.792 13.9118 71.932 12.8718 72.222 11.9718C72.512 11.0718 72.912 10.3118 73.442 9.70181C73.972 9.09181 74.602 8.63181 75.352 8.32181C76.092 8.01181 76.922 7.85181 77.832 7.85181C78.742 7.85181 79.562 8.01181 80.312 8.32181C81.052 8.63181 81.692 9.10181 82.222 9.70181C82.752 10.3118 83.162 11.0618 83.442 11.9718C83.732 12.8718 83.872 13.9118 83.872 15.0918C83.872 16.2718 83.732 17.3118 83.442 18.2118C83.152 19.1118 82.742 19.8718 82.222 20.4818C81.692 21.0918 81.062 21.5518 80.312 21.8618C79.562 22.1718 78.742 22.3318 77.832 22.3318ZM77.832 20.3218C78.362 20.3218 78.862 20.2318 79.302 20.0418C79.752 19.8518 80.132 19.5818 80.442 19.2218C80.752 18.8618 81.002 18.4318 81.172 17.9218C81.342 17.4118 81.432 16.8318 81.432 16.1918V13.9818C81.432 13.3418 81.342 12.7618 81.172 12.2518C81.002 11.7418 80.752 11.3118 80.442 10.9518C80.132 10.5918 79.742 10.3218 79.302 10.1318C78.852 9.94181 78.362 9.85181 77.832 9.85181C77.282 9.85181 76.792 9.94181 76.352 10.1318C75.912 10.3218 75.532 10.5918 75.222 10.9518C74.912 11.3118 74.662 11.7418 74.492 12.2518C74.322 12.7618 74.232 13.3418 74.232 13.9818V16.1918C74.232 16.8318 74.322 17.4118 74.492 17.9218C74.662 18.4318 74.912 18.8618 75.222 19.2218C75.532 19.5818 75.912 19.8518 76.352 20.0418C76.782 20.2318 77.282 20.3218 77.832 20.3218Z");
    			attr_dev(path4, "fill", "black");
    			add_location(path4, file, 42, 1, 4381);
    			attr_dev(path5, "d", "M86.1421 22.0918V11.6618H88.3321V13.3918H88.4321C88.6621 12.8318 89.0021 12.3618 89.4621 11.9918C89.9221 11.6218 90.5521 11.4318 91.3521 11.4318C92.4221 11.4318 93.2521 11.7818 93.8521 12.4818C94.4421 13.1818 94.7421 14.1818 94.7421 15.4818V22.0918H92.5521V15.7518C92.5521 14.1218 91.8921 13.3018 90.5821 13.3018C90.3021 13.3018 90.0221 13.3418 89.7521 13.4118C89.4821 13.4818 89.2321 13.5918 89.0221 13.7418C88.8121 13.8918 88.6421 14.0718 88.5121 14.3018C88.3821 14.5318 88.3221 14.7918 88.3221 15.1018V22.0918H86.1421Z");
    			attr_dev(path5, "fill", "black");
    			add_location(path5, file, 43, 1, 5896);
    			attr_dev(path6, "d", "M99.7522 22.0918C99.0022 22.0918 98.4422 21.9018 98.0822 21.5218C97.7122 21.1418 97.5322 20.6118 97.5322 19.9318V7.25183H99.7222V20.3018H101.162V22.0918H99.7522Z");
    			attr_dev(path6, "fill", "black");
    			add_location(path6, file, 44, 1, 6444);
    			attr_dev(path7, "d", "M104.102 9.80181C103.652 9.80181 103.312 9.69181 103.112 9.48181C102.902 9.27181 102.802 8.99181 102.802 8.66181V8.31181C102.802 7.98181 102.902 7.70181 103.112 7.49181C103.322 7.28181 103.652 7.17181 104.102 7.17181C104.552 7.17181 104.882 7.28181 105.082 7.49181C105.282 7.70181 105.382 7.98181 105.382 8.31181V8.65181C105.382 8.98181 105.282 9.26181 105.082 9.47181C104.882 9.69181 104.562 9.80181 104.102 9.80181ZM103.002 11.6618H105.192V22.0918H103.002V11.6618Z");
    			attr_dev(path7, "fill", "black");
    			add_location(path7, file, 45, 1, 6632);
    			attr_dev(path8, "d", "M108.052 22.0918V11.6618H110.242V13.3918H110.342C110.572 12.8318 110.912 12.3618 111.372 11.9918C111.832 11.6218 112.462 11.4318 113.262 11.4318C114.332 11.4318 115.162 11.7818 115.762 12.4818C116.352 13.1818 116.652 14.1818 116.652 15.4818V22.0918H114.462V15.7518C114.462 14.1218 113.802 13.3018 112.492 13.3018C112.212 13.3018 111.932 13.3418 111.662 13.4118C111.392 13.4818 111.142 13.5918 110.932 13.7418C110.722 13.8918 110.552 14.0718 110.422 14.3018C110.292 14.5318 110.232 14.7918 110.232 15.1018V22.0918H108.052Z");
    			attr_dev(path8, "fill", "black");
    			add_location(path8, file, 46, 1, 7125);
    			attr_dev(path9, "d", "M123.662 22.3318C122.912 22.3318 122.242 22.2018 121.652 21.9518C121.062 21.7018 120.562 21.3318 120.152 20.8618C119.742 20.3918 119.422 19.8118 119.202 19.1418C118.982 18.4718 118.872 17.7118 118.872 16.8818C118.872 16.0518 118.982 15.3018 119.202 14.6218C119.422 13.9518 119.742 13.3718 120.152 12.9018C120.562 12.4318 121.072 12.0618 121.652 11.8118C122.242 11.5618 122.912 11.4318 123.662 11.4318C124.422 11.4318 125.092 11.5618 125.682 11.8318C126.262 12.1018 126.752 12.4718 127.132 12.9418C127.512 13.4118 127.812 13.9718 128.002 14.5918C128.192 15.2218 128.292 15.8918 128.292 16.6218V17.4418H121.132V17.7818C121.132 18.5818 121.372 19.2318 121.842 19.7418C122.312 20.2518 122.992 20.5118 123.882 20.5118C124.522 20.5118 125.062 20.3718 125.502 20.0918C125.942 19.8118 126.312 19.4318 126.622 18.9518L127.902 20.2218C127.512 20.8618 126.952 21.3818 126.222 21.7618C125.492 22.1418 124.632 22.3318 123.662 22.3318ZM123.662 13.1218C123.292 13.1218 122.942 13.1918 122.632 13.3218C122.322 13.4518 122.052 13.6418 121.832 13.8818C121.612 14.1218 121.442 14.4118 121.322 14.7418C121.202 15.0718 121.142 15.4418 121.142 15.8418V15.9818H125.992V15.7818C125.992 14.9818 125.782 14.3318 125.372 13.8518C124.952 13.3718 124.382 13.1218 123.662 13.1218Z");
    			attr_dev(path9, "fill", "black");
    			add_location(path9, file, 47, 1, 7673);
    			attr_dev(svg, "width", "129");
    			attr_dev(svg, "height", "33");
    			attr_dev(svg, "viewBox", "0 0 129 33");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file, 37, 0, 679);
    			attr_dev(div0, "class", "frame svelte-1s2lye6");
    			add_location(div0, file, 35, 1, 658);
    			attr_dev(nav, "class", "svelte-1s2lye6");
    			add_location(nav, file, 33, 0, 650);
    			attr_dev(div1, "class", "frame svelte-1s2lye6");
    			add_location(div1, file, 53, 1, 8982);
    			attr_dev(main, "class", "svelte-1s2lye6");
    			add_location(main, file, 52, 0, 8974);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, nav, anchor);
    			append_dev(nav, div0);
    			append_dev(div0, svg);
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
    			insert_dev(target, t1, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, div1);

    			if (switch_instance) {
    				mount_component(switch_instance, div1, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(svg, "click", /*click_handler*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*grid*/ ctx[1]) {
    				if (if_block) ; else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(t0.parentNode, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (switch_value !== (switch_value = /*comp*/ ctx[0].component)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("nav", /*handleNav*/ ctx[2]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div1, null);
    				} else {
    					switch_instance = null;
    				}
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
    			if (detaching) detach_dev(t1);
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
    	const comps = [{ id: "home", component: Frame_home }, { id: "incidents", component: Frame_incidents }];
    	let comp = comps[1];

    	/*
    	a responsive frame to hold smaller experiments so that they don't have to be continually framed,
    */
    	let grid = false;

    	function handleNav(event) {
    		let ind = comps.findIndex(el => el.id == event.detail.text);

    		//alert(ind + ':' + event.detail.text);
    		if (ind >= 0) {
    			$$invalidate(0, comp = comps[ind]);
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Frame> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		$$invalidate(1, grid = !grid);
    		return false;
    	};

    	$$self.$capture_state = () => ({
    		Home: Frame_home,
    		Incidents: Frame_incidents,
    		comps,
    		comp,
    		grid,
    		handleNav
    	});

    	$$self.$inject_state = $$props => {
    		if ("comp" in $$props) $$invalidate(0, comp = $$props.comp);
    		if ("grid" in $$props) $$invalidate(1, grid = $$props.grid);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [comp, grid, handleNav, click_handler];
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
