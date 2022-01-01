
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
    const file$5 = "src/Frame_home.svelte";

    // (219:29) 
    function create_if_block_3(ctx) {
    	let h2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "My Tasks";
    			add_location(h2, file$5, 219, 8, 10435);
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
    			add_location(h2, file$5, 217, 8, 10380);
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
    			add_location(h2, file$5, 215, 8, 10320);
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
    			add_location(div0, file$5, 34, 20, 1248);
    			add_location(b0, file$5, 35, 20, 1361);
    			attr_dev(a0, "href", "#ehs/incidents/incidents_new");
    			attr_dev(a0, "class", "add");
    			add_location(a0, file$5, 37, 24, 1442);
    			attr_dev(a1, "href", "#ehs/incidents/queries_new");
    			attr_dev(a1, "class", "filter");
    			add_location(a1, file$5, 38, 24, 1582);
    			attr_dev(a2, "href", "#ehs/incidents/summary");
    			attr_dev(a2, "class", "summary");
    			add_location(a2, file$5, 39, 24, 1721);
    			attr_dev(a3, "href", "#ehs/incidents/admin");
    			attr_dev(a3, "class", "tool");
    			add_location(a3, file$5, 40, 24, 1863);
    			attr_dev(div1, "class", "tools");
    			add_location(div1, file$5, 36, 20, 1398);
    			attr_dev(div2, "class", "tile");
    			add_location(div2, file$5, 33, 16, 1117);
    			attr_dev(div3, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div3, file$5, 32, 12, 1055);
    			attr_dev(div4, "class", "icon");
    			set_style(div4, "background-image", "url(./images/ehs_svgs_clean/actions.svg)");
    			add_location(div4, file$5, 46, 20, 2156);
    			add_location(b1, file$5, 47, 20, 2267);
    			attr_dev(a4, "href", "#incidents/incidents_new");
    			attr_dev(a4, "class", "add");
    			add_location(a4, file$5, 49, 24, 2346);
    			attr_dev(a5, "href", "queries_new");
    			attr_dev(a5, "class", "filter");
    			add_location(a5, file$5, 50, 24, 2423);
    			attr_dev(a6, "href", "./");
    			attr_dev(a6, "class", "summary");
    			add_location(a6, file$5, 51, 24, 2490);
    			attr_dev(a7, "href", "./");
    			attr_dev(a7, "class", "tool");
    			add_location(a7, file$5, 52, 24, 2549);
    			attr_dev(div5, "class", "tools");
    			add_location(div5, file$5, 48, 20, 2302);
    			attr_dev(div6, "class", "tile");
    			add_location(div6, file$5, 45, 16, 2117);
    			attr_dev(div7, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div7, file$5, 44, 12, 2055);
    			attr_dev(div8, "class", "icon");
    			set_style(div8, "background-image", "url(./images/ehs_svgs_clean/audits.svg)");
    			add_location(div8, file$5, 58, 20, 2763);
    			add_location(b2, file$5, 59, 20, 2873);
    			attr_dev(a8, "href", "./");
    			attr_dev(a8, "class", "add");
    			add_location(a8, file$5, 61, 24, 2963);
    			attr_dev(a9, "href", "./");
    			attr_dev(a9, "class", "filter");
    			add_location(a9, file$5, 62, 24, 3018);
    			attr_dev(a10, "href", "./");
    			attr_dev(a10, "class", "summary");
    			add_location(a10, file$5, 63, 24, 3076);
    			attr_dev(a11, "href", "./");
    			attr_dev(a11, "class", "tool");
    			add_location(a11, file$5, 64, 24, 3135);
    			attr_dev(div9, "class", "tools");
    			add_location(div9, file$5, 60, 20, 2919);
    			attr_dev(div10, "class", "tile");
    			add_location(div10, file$5, 57, 16, 2724);
    			attr_dev(div11, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div11, file$5, 56, 12, 2662);
    			attr_dev(div12, "class", "icon");
    			set_style(div12, "background-image", "url(./images/ehs_svgs_clean/observations.svg)");
    			add_location(div12, file$5, 70, 20, 3349);
    			add_location(b3, file$5, 71, 20, 3465);
    			attr_dev(a12, "href", "./");
    			attr_dev(a12, "class", "add");
    			add_location(a12, file$5, 73, 24, 3548);
    			attr_dev(a13, "href", "./");
    			attr_dev(a13, "class", "filter");
    			add_location(a13, file$5, 74, 24, 3603);
    			attr_dev(a14, "href", "./");
    			attr_dev(a14, "class", "summary");
    			add_location(a14, file$5, 75, 24, 3661);
    			attr_dev(a15, "href", "./");
    			attr_dev(a15, "class", "tool");
    			add_location(a15, file$5, 76, 24, 3720);
    			attr_dev(div13, "class", "tools");
    			add_location(div13, file$5, 72, 20, 3504);
    			attr_dev(div14, "class", "tile");
    			add_location(div14, file$5, 69, 16, 3310);
    			attr_dev(div15, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div15, file$5, 68, 12, 3248);
    			attr_dev(div16, "class", "icon");
    			set_style(div16, "background-image", "url(./images/ehs_svgs_clean/risk_assessment.svg)");
    			add_location(div16, file$5, 82, 20, 3934);
    			add_location(b4, file$5, 83, 20, 4053);
    			attr_dev(a16, "href", "./");
    			attr_dev(a16, "class", "add");
    			add_location(a16, file$5, 85, 24, 4140);
    			attr_dev(a17, "href", "./");
    			attr_dev(a17, "class", "filter");
    			add_location(a17, file$5, 86, 24, 4195);
    			attr_dev(a18, "href", "./");
    			attr_dev(a18, "class", "summary");
    			add_location(a18, file$5, 87, 24, 4253);
    			attr_dev(a19, "href", "./");
    			attr_dev(a19, "class", "tool");
    			add_location(a19, file$5, 88, 24, 4312);
    			attr_dev(div17, "class", "tools");
    			add_location(div17, file$5, 84, 20, 4096);
    			attr_dev(div18, "class", "tile");
    			add_location(div18, file$5, 81, 16, 3895);
    			attr_dev(div19, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div19, file$5, 80, 12, 3833);
    			attr_dev(div20, "class", "icon");
    			set_style(div20, "background-image", "url(./images/ehs_svgs_clean/scheduling.svg)");
    			add_location(div20, file$5, 94, 20, 4526);
    			add_location(b5, file$5, 95, 20, 4640);
    			attr_dev(a20, "href", "./");
    			attr_dev(a20, "class", "add");
    			add_location(a20, file$5, 97, 24, 4722);
    			attr_dev(a21, "href", "./");
    			attr_dev(a21, "class", "filter");
    			add_location(a21, file$5, 98, 24, 4777);
    			attr_dev(a22, "href", "./");
    			attr_dev(a22, "class", "summary");
    			add_location(a22, file$5, 99, 24, 4835);
    			attr_dev(a23, "href", "./");
    			attr_dev(a23, "class", "tool");
    			add_location(a23, file$5, 100, 24, 4894);
    			attr_dev(div21, "class", "tools");
    			add_location(div21, file$5, 96, 20, 4678);
    			attr_dev(div22, "class", "tile");
    			add_location(div22, file$5, 93, 16, 4487);
    			attr_dev(div23, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div23, file$5, 92, 12, 4425);
    			attr_dev(div24, "class", "icon");
    			set_style(div24, "background-image", "url(./images/ehs_svgs_clean/epr.svg)");
    			add_location(div24, file$5, 106, 20, 5108);
    			add_location(b6, file$5, 107, 20, 5215);
    			attr_dev(a24, "href", "./");
    			attr_dev(a24, "class", "add");
    			add_location(a24, file$5, 109, 24, 5300);
    			attr_dev(a25, "href", "./");
    			attr_dev(a25, "class", "filter");
    			add_location(a25, file$5, 110, 24, 5355);
    			attr_dev(a26, "href", "./");
    			attr_dev(a26, "class", "summary");
    			add_location(a26, file$5, 111, 24, 5413);
    			attr_dev(a27, "href", "./");
    			attr_dev(a27, "class", "tool");
    			add_location(a27, file$5, 112, 24, 5472);
    			attr_dev(div25, "class", "tools");
    			add_location(div25, file$5, 108, 20, 5256);
    			attr_dev(div26, "class", "tile");
    			add_location(div26, file$5, 105, 16, 5069);
    			attr_dev(div27, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div27, file$5, 104, 12, 5007);
    			attr_dev(div28, "class", "icon");
    			set_style(div28, "background-image", "url(./images/ehs_svgs_clean/period_statistics.svg)");
    			add_location(div28, file$5, 118, 20, 5686);
    			add_location(b7, file$5, 119, 20, 5807);
    			attr_dev(a28, "href", "./");
    			attr_dev(a28, "class", "add");
    			add_location(a28, file$5, 121, 24, 5896);
    			attr_dev(a29, "href", "./");
    			attr_dev(a29, "class", "filter");
    			add_location(a29, file$5, 122, 24, 5951);
    			attr_dev(a30, "href", "./");
    			attr_dev(a30, "class", "summary");
    			add_location(a30, file$5, 123, 24, 6009);
    			attr_dev(a31, "href", "./");
    			attr_dev(a31, "class", "tool");
    			add_location(a31, file$5, 124, 24, 6068);
    			attr_dev(div29, "class", "tools");
    			add_location(div29, file$5, 120, 20, 5852);
    			attr_dev(div30, "class", "tile");
    			add_location(div30, file$5, 117, 16, 5647);
    			attr_dev(div31, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div31, file$5, 116, 12, 5585);
    			attr_dev(div32, "class", "icon");
    			set_style(div32, "background-image", "url(./images/ehs_svgs_clean/register.svg)");
    			add_location(div32, file$5, 130, 20, 6282);
    			add_location(b8, file$5, 131, 20, 6394);
    			attr_dev(a32, "href", "./");
    			attr_dev(a32, "class", "add");
    			add_location(a32, file$5, 133, 24, 6474);
    			attr_dev(a33, "href", "./");
    			attr_dev(a33, "class", "filter");
    			add_location(a33, file$5, 134, 24, 6529);
    			attr_dev(a34, "href", "./");
    			attr_dev(a34, "class", "summary");
    			add_location(a34, file$5, 135, 24, 6587);
    			attr_dev(a35, "href", "./");
    			attr_dev(a35, "class", "tool");
    			add_location(a35, file$5, 136, 24, 6646);
    			attr_dev(div33, "class", "tools");
    			add_location(div33, file$5, 132, 20, 6430);
    			attr_dev(div34, "class", "tile");
    			add_location(div34, file$5, 129, 16, 6243);
    			attr_dev(div35, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div35, file$5, 128, 12, 6181);
    			attr_dev(div36, "class", "icon");
    			set_style(div36, "background-image", "url(./images/ehs_svgs_clean/advanced_rca.svg)");
    			add_location(div36, file$5, 142, 20, 6860);
    			add_location(b9, file$5, 143, 20, 6976);
    			attr_dev(a36, "href", "./");
    			attr_dev(a36, "class", "add");
    			add_location(a36, file$5, 145, 24, 7061);
    			attr_dev(a37, "href", "./");
    			attr_dev(a37, "class", "filter");
    			add_location(a37, file$5, 146, 24, 7116);
    			attr_dev(a38, "href", "./");
    			attr_dev(a38, "class", "summary");
    			add_location(a38, file$5, 147, 24, 7174);
    			attr_dev(a39, "href", "./");
    			attr_dev(a39, "class", "tool");
    			add_location(a39, file$5, 148, 24, 7233);
    			attr_dev(div37, "class", "tools");
    			add_location(div37, file$5, 144, 20, 7017);
    			attr_dev(div38, "class", "tile");
    			add_location(div38, file$5, 141, 16, 6821);
    			attr_dev(div39, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div39, file$5, 140, 12, 6759);
    			attr_dev(div40, "class", "icon");
    			set_style(div40, "background-image", "url(./images/ehs_svgs_clean/documents.svg)");
    			add_location(div40, file$5, 154, 20, 7447);
    			add_location(b10, file$5, 155, 20, 7560);
    			attr_dev(a40, "href", "./");
    			attr_dev(a40, "class", "add");
    			add_location(a40, file$5, 157, 24, 7640);
    			attr_dev(a41, "href", "./");
    			attr_dev(a41, "class", "filter");
    			add_location(a41, file$5, 158, 24, 7695);
    			attr_dev(a42, "href", "./");
    			attr_dev(a42, "class", "summary");
    			add_location(a42, file$5, 159, 24, 7753);
    			attr_dev(a43, "href", "./");
    			attr_dev(a43, "class", "tool");
    			add_location(a43, file$5, 160, 24, 7812);
    			attr_dev(div41, "class", "tools");
    			add_location(div41, file$5, 156, 20, 7596);
    			attr_dev(div42, "class", "tile");
    			add_location(div42, file$5, 153, 16, 7408);
    			attr_dev(div43, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div43, file$5, 152, 12, 7346);
    			attr_dev(div44, "class", "icon");
    			set_style(div44, "background-image", "url(./images/ehs_svgs_clean/tracker.svg)");
    			add_location(div44, file$5, 166, 20, 8026);
    			add_location(b11, file$5, 167, 20, 8137);
    			attr_dev(a44, "href", "./");
    			attr_dev(a44, "class", "add");
    			add_location(a44, file$5, 169, 24, 8225);
    			attr_dev(a45, "href", "./");
    			attr_dev(a45, "class", "filter");
    			add_location(a45, file$5, 170, 24, 8280);
    			attr_dev(a46, "href", "./");
    			attr_dev(a46, "class", "summary");
    			add_location(a46, file$5, 171, 24, 8338);
    			attr_dev(a47, "href", "./");
    			attr_dev(a47, "class", "tool");
    			add_location(a47, file$5, 172, 24, 8397);
    			attr_dev(div45, "class", "tools");
    			add_location(div45, file$5, 168, 20, 8181);
    			attr_dev(div46, "class", "tile");
    			add_location(div46, file$5, 165, 16, 7987);
    			attr_dev(div47, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div47, file$5, 164, 12, 7925);
    			attr_dev(div48, "class", "icon");
    			set_style(div48, "background-image", "url(./images/ehs_svgs_clean/pow_ra.svg)");
    			add_location(div48, file$5, 178, 20, 8611);
    			add_location(b12, file$5, 179, 20, 8721);
    			attr_dev(a48, "href", "./");
    			attr_dev(a48, "class", "add");
    			add_location(a48, file$5, 181, 24, 8806);
    			attr_dev(a49, "href", "./");
    			attr_dev(a49, "class", "filter");
    			add_location(a49, file$5, 182, 24, 8861);
    			attr_dev(a50, "href", "./");
    			attr_dev(a50, "class", "summary");
    			add_location(a50, file$5, 183, 24, 8919);
    			attr_dev(a51, "href", "./");
    			attr_dev(a51, "class", "tool");
    			add_location(a51, file$5, 184, 24, 8978);
    			attr_dev(div49, "class", "tools");
    			add_location(div49, file$5, 180, 20, 8762);
    			attr_dev(div50, "class", "tile");
    			add_location(div50, file$5, 177, 16, 8572);
    			attr_dev(div51, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div51, file$5, 176, 12, 8510);
    			attr_dev(div52, "class", "icon");
    			set_style(div52, "background-image", "url(./images/ehs_svgs_clean/lost_time.svg)");
    			add_location(div52, file$5, 190, 20, 9192);
    			add_location(b13, file$5, 191, 20, 9305);
    			attr_dev(a52, "href", "./");
    			attr_dev(a52, "class", "add");
    			add_location(a52, file$5, 193, 24, 9386);
    			attr_dev(a53, "href", "./");
    			attr_dev(a53, "class", "filter");
    			add_location(a53, file$5, 194, 24, 9441);
    			attr_dev(a54, "href", "./");
    			attr_dev(a54, "class", "summary");
    			add_location(a54, file$5, 195, 24, 9499);
    			attr_dev(a55, "href", "./");
    			attr_dev(a55, "class", "tool");
    			add_location(a55, file$5, 196, 24, 9558);
    			attr_dev(div53, "class", "tools");
    			add_location(div53, file$5, 192, 20, 9342);
    			attr_dev(div54, "class", "tile");
    			add_location(div54, file$5, 189, 16, 9153);
    			attr_dev(div55, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div55, file$5, 188, 12, 9091);
    			attr_dev(div56, "class", "icon");
    			set_style(div56, "background-image", "url(./images/ehs_svgs_clean/administration.svg)");
    			add_location(div56, file$5, 202, 20, 9772);
    			add_location(b14, file$5, 203, 20, 9890);
    			attr_dev(a56, "href", "./");
    			attr_dev(a56, "class", "add");
    			add_location(a56, file$5, 205, 24, 9976);
    			attr_dev(a57, "href", "./");
    			attr_dev(a57, "class", "filter");
    			add_location(a57, file$5, 206, 24, 10031);
    			attr_dev(a58, "href", "./");
    			attr_dev(a58, "class", "summary");
    			add_location(a58, file$5, 207, 24, 10089);
    			attr_dev(a59, "href", "./");
    			attr_dev(a59, "class", "tool");
    			add_location(a59, file$5, 208, 24, 10148);
    			attr_dev(div57, "class", "tools");
    			add_location(div57, file$5, 204, 20, 9932);
    			attr_dev(div58, "class", "tile");
    			add_location(div58, file$5, 201, 16, 9733);
    			attr_dev(div59, "class", "col6 col-sm-4 col-md-3 col-lg-2");
    			add_location(div59, file$5, 200, 12, 9671);
    			attr_dev(div60, "class", "row");
    			add_location(div60, file$5, 31, 8, 1025);
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
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(31:4) {#if tab == 'home'}",
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
    			add_location(a0, file$5, 15, 20, 320);
    			add_location(li0, file$5, 15, 16, 316);
    			add_location(li1, file$5, 16, 16, 367);
    			attr_dev(ul0, "class", "breadcrumb");
    			add_location(ul0, file$5, 14, 12, 276);
    			attr_dev(div0, "class", "col12");
    			add_location(div0, file$5, 13, 8, 244);
    			attr_dev(div1, "class", "row sticky");
    			add_location(div1, file$5, 12, 4, 211);
    			attr_dev(a1, "href", "/");
    			toggle_class(a1, "active", /*tab*/ ctx[0] == "home");
    			add_location(a1, file$5, 24, 12, 472);
    			add_location(li2, file$5, 24, 8, 468);
    			attr_dev(a2, "href", "/");
    			toggle_class(a2, "active", /*tab*/ ctx[0] == "dashboards");
    			add_location(a2, file$5, 25, 12, 594);
    			add_location(li3, file$5, 25, 8, 590);
    			attr_dev(a3, "href", "/");
    			toggle_class(a3, "active", /*tab*/ ctx[0] == "reports");
    			add_location(a3, file$5, 26, 12, 735);
    			add_location(li4, file$5, 26, 8, 731);
    			attr_dev(a4, "href", "/");
    			toggle_class(a4, "active", /*tab*/ ctx[0] == "tasks");
    			add_location(a4, file$5, 27, 12, 866);
    			add_location(li5, file$5, 27, 8, 862);
    			attr_dev(ul1, "class", "tabs");
    			add_location(ul1, file$5, 23, 4, 442);
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
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Frame_home",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/Frame_incidents.svelte generated by Svelte v3.35.0 */
    const file$4 = "src/Frame_incidents.svelte";

    // (132:28) 
    function create_if_block_1(ctx) {
    	let h2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Summary";
    			add_location(h2, file$4, 132, 4, 49579);
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
    		source: "(132:28) ",
    		ctx
    	});

    	return block;
    }

    // (45:0) {#if tab == 'dashboard'}
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
    			add_location(div0, file$4, 50, 24, 1790);
    			attr_dev(div1, "class", "big-num");
    			add_location(div1, file$4, 52, 28, 1909);
    			attr_dev(div2, "class", "card-body");
    			add_location(div2, file$4, 51, 24, 1857);
    			attr_dev(div3, "class", "card card-31");
    			add_location(div3, file$4, 49, 20, 1739);
    			attr_dev(div4, "class", "col6");
    			add_location(div4, file$4, 48, 16, 1700);
    			attr_dev(div5, "class", "card-header");
    			add_location(div5, file$4, 58, 24, 2126);
    			attr_dev(div6, "class", "big-num minor");
    			add_location(div6, file$4, 60, 28, 2256);
    			attr_dev(div7, "class", "card-body");
    			add_location(div7, file$4, 59, 24, 2204);
    			attr_dev(div8, "class", "card card-31");
    			add_location(div8, file$4, 57, 20, 2075);
    			attr_dev(div9, "class", "col6");
    			add_location(div9, file$4, 56, 16, 2036);
    			attr_dev(div10, "class", "card-header");
    			add_location(div10, file$4, 66, 24, 2479);
    			attr_dev(div11, "class", "big-num minor");
    			add_location(div11, file$4, 68, 28, 2603);
    			attr_dev(div12, "class", "card-body");
    			add_location(div12, file$4, 67, 24, 2551);
    			attr_dev(div13, "class", "card card-31");
    			add_location(div13, file$4, 65, 20, 2428);
    			attr_dev(div14, "class", "col6");
    			add_location(div14, file$4, 64, 16, 2389);
    			attr_dev(div15, "class", "card-header");
    			add_location(div15, file$4, 74, 24, 2825);
    			attr_dev(div16, "class", "big-num danger");
    			add_location(div16, file$4, 76, 28, 2956);
    			attr_dev(div17, "class", "card-body");
    			add_location(div17, file$4, 75, 24, 2904);
    			attr_dev(div18, "class", "card card-31");
    			add_location(div18, file$4, 73, 20, 2774);
    			attr_dev(div19, "class", "col6");
    			add_location(div19, file$4, 72, 16, 2735);
    			attr_dev(div20, "class", "row");
    			add_location(div20, file$4, 47, 12, 1666);
    			attr_dev(div21, "class", "col12 col-md-6");
    			add_location(div21, file$4, 46, 8, 1625);
    			attr_dev(div22, "class", "card-header");
    			add_location(div22, file$4, 85, 16, 3200);
    			attr_dev(defs, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-defs");
    			add_location(defs, file$4, 87, 229, 3515);
    			attr_dev(g0, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-main-c");
    			attr_dev(g0, "class", "zc-abs");
    			add_location(g0, file$4, 87, 374, 3660);
    			attr_dev(g1, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-objects-bottom");
    			attr_dev(g1, "class", "zc-abs");
    			add_location(g1, file$4, 87, 451, 3737);
    			attr_dev(g2, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-c");
    			attr_dev(g2, "class", "zc-abs zc-layer zc-persistent");
    			add_location(g2, file$4, 87, 687, 3973);
    			attr_dev(g3, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotarea-c");
    			attr_dev(g3, "class", "zc-abs zc-layer");
    			add_location(g3, file$4, 87, 862, 4148);
    			attr_dev(g4, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotarea");
    			add_location(g4, file$4, 87, 792, 4078);
    			attr_dev(path0, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-y-guide-6-path");
    			attr_dev(path0, "d", "M 35.5 162.5 L 407.5 162.5 M 35.5 138.5 L 407.5 138.5 M 35.5 114.5 L 407.5 114.5 M 35.5 91.5 L 407.5 91.5 M 35.5 67.5 L 407.5 67.5 M 35.5 43.5 L 407.5 43.5 M 35.5 19.5 L 407.5 19.5");
    			attr_dev(path0, "fill", "none");
    			attr_dev(path0, "stroke-linecap", "butt");
    			attr_dev(path0, "stroke-linejoin", "round");
    			attr_dev(path0, "stroke", "#DCDCDC");
    			attr_dev(path0, "stroke-width", "1");
    			attr_dev(path0, "stroke-opacity", "1");
    			add_location(path0, file$4, 87, 1212, 4498);
    			attr_dev(g5, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scales-bl-0-c");
    			attr_dev(g5, "class", "zc-abs zc-layer");
    			add_location(g5, file$4, 87, 1113, 4399);
    			attr_dev(g6, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scales-bl");
    			attr_dev(g6, "clip-path", "url(#AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-clip)");
    			add_location(g6, file$4, 87, 966, 4252);
    			attr_dev(g7, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plot-0-bl-0-c");
    			attr_dev(g7, "class", "zc-abs zc-layer zc-bl");
    			attr_dev(g7, "data-clip", "34,18,376,147");
    			set_style(g7, "display", "block");
    			add_location(g7, file$4, 87, 1756, 5042);
    			attr_dev(g8, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plot-1-bl-0-c");
    			attr_dev(g8, "class", "zc-abs zc-layer zc-bl");
    			attr_dev(g8, "data-clip", "34,18,376,147");
    			set_style(g8, "display", "block");
    			add_location(g8, file$4, 87, 1915, 5201);
    			attr_dev(g9, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plot-2-bl-0-c");
    			attr_dev(g9, "class", "zc-abs zc-layer zc-bl");
    			attr_dev(g9, "data-clip", "34,18,376,147");
    			set_style(g9, "display", "block");
    			add_location(g9, file$4, 87, 2074, 5360);
    			attr_dev(g10, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plot-3-bl-0-c");
    			attr_dev(g10, "class", "zc-abs zc-layer zc-bl");
    			attr_dev(g10, "data-clip", "34,18,376,147");
    			set_style(g10, "display", "block");
    			add_location(g10, file$4, 87, 2233, 5519);
    			attr_dev(g11, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plot-4-bl-0-c");
    			attr_dev(g11, "class", "zc-abs zc-layer zc-bl");
    			attr_dev(g11, "data-clip", "34,18,376,147");
    			set_style(g11, "display", "block");
    			add_location(g11, file$4, 87, 2392, 5678);
    			attr_dev(g12, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plots-bl-0");
    			attr_dev(g12, "clip-path", "url(#AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-clip)");
    			add_location(g12, file$4, 87, 1608, 4894);
    			attr_dev(path1, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-0-node-0-path");
    			attr_dev(path1, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-0-node-area zc-node-area");
    			attr_dev(path1, "d", "M 39.5 150.5 L 68.5 150.5 L 68.5 162.5 L 39.5 162.5 L 39.5 150.5 L 39.5 150.5");
    			attr_dev(path1, "fill", "#6F8CC4");
    			attr_dev(path1, "fill-opacity", "1");
    			attr_dev(path1, "stroke-linecap", "square");
    			attr_dev(path1, "stroke-linejoin", "miter");
    			attr_dev(path1, "stroke-opacity", "1");
    			add_location(path1, file$4, 87, 2858, 6144);
    			attr_dev(path2, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-0-node-1-path");
    			attr_dev(path2, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-0-node-area zc-node-area");
    			attr_dev(path2, "d", "M 76.5 138.5 L 105.5 138.5 L 105.5 162.5 L 76.5 162.5 L 76.5 138.5 L 76.5 138.5");
    			attr_dev(path2, "fill", "#6F8CC4");
    			attr_dev(path2, "fill-opacity", "1");
    			attr_dev(path2, "stroke-linecap", "square");
    			attr_dev(path2, "stroke-linejoin", "miter");
    			attr_dev(path2, "stroke-opacity", "1");
    			add_location(path2, file$4, 87, 3299, 6585);
    			attr_dev(path3, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-0-node-2-path");
    			attr_dev(path3, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-0-node-area zc-node-area");
    			attr_dev(path3, "d", "M 113.5 162.5 L 143.5 162.5 L 143.5 162.5 L 113.5 162.5 L 113.5 162.5 L 114.5 162.5");
    			attr_dev(path3, "fill", "#6F8CC4");
    			attr_dev(path3, "fill-opacity", "1");
    			attr_dev(path3, "stroke-linecap", "square");
    			attr_dev(path3, "stroke-linejoin", "miter");
    			attr_dev(path3, "stroke-opacity", "1");
    			add_location(path3, file$4, 87, 3742, 7028);
    			attr_dev(path4, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-0-node-3-path");
    			attr_dev(path4, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-0-node-area zc-node-area");
    			attr_dev(path4, "d", "M 151.5 162.5 L 180.5 162.5 L 180.5 162.5 L 151.5 162.5 L 151.5 162.5 L 151.5 162.5");
    			attr_dev(path4, "fill", "#6F8CC4");
    			attr_dev(path4, "fill-opacity", "1");
    			attr_dev(path4, "stroke-linecap", "square");
    			attr_dev(path4, "stroke-linejoin", "miter");
    			attr_dev(path4, "stroke-opacity", "1");
    			add_location(path4, file$4, 87, 4189, 7475);
    			attr_dev(path5, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-0-node-4-path");
    			attr_dev(path5, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-0-node-area zc-node-area");
    			attr_dev(path5, "d", "M 188.5 162.5 L 217.5 162.5 L 217.5 162.5 L 188.5 162.5 L 188.5 162.5 L 188.5 162.5");
    			attr_dev(path5, "fill", "#6F8CC4");
    			attr_dev(path5, "fill-opacity", "1");
    			attr_dev(path5, "stroke-linecap", "square");
    			attr_dev(path5, "stroke-linejoin", "miter");
    			attr_dev(path5, "stroke-opacity", "1");
    			add_location(path5, file$4, 87, 4636, 7922);
    			attr_dev(path6, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-0-node-5-path");
    			attr_dev(path6, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-0-node-area zc-node-area");
    			attr_dev(path6, "d", "M 225.5 150.5 L 254.5 150.5 L 254.5 162.5 L 225.5 162.5 L 225.5 150.5 L 225.5 150.5");
    			attr_dev(path6, "fill", "#6F8CC4");
    			attr_dev(path6, "fill-opacity", "1");
    			attr_dev(path6, "stroke-linecap", "square");
    			attr_dev(path6, "stroke-linejoin", "miter");
    			attr_dev(path6, "stroke-opacity", "1");
    			add_location(path6, file$4, 87, 5083, 8369);
    			attr_dev(path7, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-0-node-6-path");
    			attr_dev(path7, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-0-node-area zc-node-area");
    			attr_dev(path7, "d", "M 262.5 150.5 L 291.5 150.5 L 291.5 162.5 L 262.5 162.5 L 262.5 150.5 L 262.5 150.5");
    			attr_dev(path7, "fill", "#6F8CC4");
    			attr_dev(path7, "fill-opacity", "1");
    			attr_dev(path7, "stroke-linecap", "square");
    			attr_dev(path7, "stroke-linejoin", "miter");
    			attr_dev(path7, "stroke-opacity", "1");
    			add_location(path7, file$4, 87, 5530, 8816);
    			attr_dev(path8, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-0-node-7-path");
    			attr_dev(path8, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-0-node-area zc-node-area");
    			attr_dev(path8, "d", "M 299.5 150.5 L 329.5 150.5 L 329.5 162.5 L 299.5 162.5 L 299.5 150.5 L 300.5 150.5");
    			attr_dev(path8, "fill", "#6F8CC4");
    			attr_dev(path8, "fill-opacity", "1");
    			attr_dev(path8, "stroke-linecap", "square");
    			attr_dev(path8, "stroke-linejoin", "miter");
    			attr_dev(path8, "stroke-opacity", "1");
    			add_location(path8, file$4, 87, 5977, 9263);
    			attr_dev(path9, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-0-node-8-path");
    			attr_dev(path9, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-0-node-area zc-node-area");
    			attr_dev(path9, "d", "M 337.5 162.5 L 366.5 162.5 L 366.5 162.5 L 337.5 162.5 L 337.5 162.5 L 337.5 162.5");
    			attr_dev(path9, "fill", "#6F8CC4");
    			attr_dev(path9, "fill-opacity", "1");
    			attr_dev(path9, "stroke-linecap", "square");
    			attr_dev(path9, "stroke-linejoin", "miter");
    			attr_dev(path9, "stroke-opacity", "1");
    			add_location(path9, file$4, 87, 6424, 9710);
    			attr_dev(path10, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-0-node-9-path");
    			attr_dev(path10, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-0-node-area zc-node-area");
    			attr_dev(path10, "d", "M 374.5 126.5 L 403.5 126.5 L 403.5 162.5 L 374.5 162.5 L 374.5 126.5 L 374.5 126.5");
    			attr_dev(path10, "fill", "#6F8CC4");
    			attr_dev(path10, "fill-opacity", "1");
    			attr_dev(path10, "stroke-linecap", "square");
    			attr_dev(path10, "stroke-linejoin", "miter");
    			attr_dev(path10, "stroke-opacity", "1");
    			add_location(path10, file$4, 87, 6871, 10157);
    			attr_dev(g13, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plot-0-bl-1-c");
    			attr_dev(g13, "class", "zc-abs zc-layer zc-bl");
    			attr_dev(g13, "data-clip", "34,18,376,147");
    			set_style(g13, "display", "block");
    			add_location(g13, file$4, 87, 2703, 5989);
    			attr_dev(path11, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-1-node-0-path");
    			attr_dev(path11, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-1-node-area zc-node-area");
    			attr_dev(path11, "d", "M 39.5 138.5 L 68.5 138.5 L 68.5 150.5 L 39.5 150.5 L 39.5 138.5 L 39.5 138.5");
    			attr_dev(path11, "fill", "#CE735D");
    			attr_dev(path11, "fill-opacity", "1");
    			attr_dev(path11, "stroke-linecap", "square");
    			attr_dev(path11, "stroke-linejoin", "miter");
    			attr_dev(path11, "stroke-opacity", "1");
    			add_location(path11, file$4, 87, 7477, 10763);
    			attr_dev(path12, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-1-node-1-path");
    			attr_dev(path12, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-1-node-area zc-node-area");
    			attr_dev(path12, "d", "M 76.5 114.5 L 105.5 114.5 L 105.5 138.5 L 76.5 138.5 L 76.5 114.5 L 76.5 114.5");
    			attr_dev(path12, "fill", "#CE735D");
    			attr_dev(path12, "fill-opacity", "1");
    			attr_dev(path12, "stroke-linecap", "square");
    			attr_dev(path12, "stroke-linejoin", "miter");
    			attr_dev(path12, "stroke-opacity", "1");
    			add_location(path12, file$4, 87, 7918, 11204);
    			attr_dev(path13, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-1-node-2-path");
    			attr_dev(path13, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-1-node-area zc-node-area");
    			attr_dev(path13, "d", "M 113.5 162.5 L 143.5 162.5 L 143.5 162.5 L 113.5 162.5 L 113.5 162.5 L 114.5 162.5");
    			attr_dev(path13, "fill", "#CE735D");
    			attr_dev(path13, "fill-opacity", "1");
    			attr_dev(path13, "stroke-linecap", "square");
    			attr_dev(path13, "stroke-linejoin", "miter");
    			attr_dev(path13, "stroke-opacity", "1");
    			add_location(path13, file$4, 87, 8361, 11647);
    			attr_dev(path14, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-1-node-3-path");
    			attr_dev(path14, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-1-node-area zc-node-area");
    			attr_dev(path14, "d", "M 151.5 150.5 L 180.5 150.5 L 180.5 162.5 L 151.5 162.5 L 151.5 150.5 L 151.5 150.5");
    			attr_dev(path14, "fill", "#CE735D");
    			attr_dev(path14, "fill-opacity", "1");
    			attr_dev(path14, "stroke-linecap", "square");
    			attr_dev(path14, "stroke-linejoin", "miter");
    			attr_dev(path14, "stroke-opacity", "1");
    			add_location(path14, file$4, 87, 8808, 12094);
    			attr_dev(path15, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-1-node-4-path");
    			attr_dev(path15, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-1-node-area zc-node-area");
    			attr_dev(path15, "d", "M 188.5 162.5 L 217.5 162.5 L 217.5 162.5 L 188.5 162.5 L 188.5 162.5 L 188.5 162.5");
    			attr_dev(path15, "fill", "#CE735D");
    			attr_dev(path15, "fill-opacity", "1");
    			attr_dev(path15, "stroke-linecap", "square");
    			attr_dev(path15, "stroke-linejoin", "miter");
    			attr_dev(path15, "stroke-opacity", "1");
    			add_location(path15, file$4, 87, 9255, 12541);
    			attr_dev(path16, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-1-node-5-path");
    			attr_dev(path16, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-1-node-area zc-node-area");
    			attr_dev(path16, "d", "M 225.5 138.5 L 254.5 138.5 L 254.5 150.5 L 225.5 150.5 L 225.5 138.5 L 225.5 138.5");
    			attr_dev(path16, "fill", "#CE735D");
    			attr_dev(path16, "fill-opacity", "1");
    			attr_dev(path16, "stroke-linecap", "square");
    			attr_dev(path16, "stroke-linejoin", "miter");
    			attr_dev(path16, "stroke-opacity", "1");
    			add_location(path16, file$4, 87, 9702, 12988);
    			attr_dev(path17, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-1-node-6-path");
    			attr_dev(path17, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-1-node-area zc-node-area");
    			attr_dev(path17, "d", "M 262.5 126.5 L 291.5 126.5 L 291.5 150.5 L 262.5 150.5 L 262.5 126.5 L 262.5 126.5");
    			attr_dev(path17, "fill", "#CE735D");
    			attr_dev(path17, "fill-opacity", "1");
    			attr_dev(path17, "stroke-linecap", "square");
    			attr_dev(path17, "stroke-linejoin", "miter");
    			attr_dev(path17, "stroke-opacity", "1");
    			add_location(path17, file$4, 87, 10149, 13435);
    			attr_dev(path18, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-1-node-7-path");
    			attr_dev(path18, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-1-node-area zc-node-area");
    			attr_dev(path18, "d", "M 299.5 150.5 L 329.5 150.5 L 329.5 150.5 L 299.5 150.5 L 299.5 150.5 L 300.5 150.5");
    			attr_dev(path18, "fill", "#CE735D");
    			attr_dev(path18, "fill-opacity", "1");
    			attr_dev(path18, "stroke-linecap", "square");
    			attr_dev(path18, "stroke-linejoin", "miter");
    			attr_dev(path18, "stroke-opacity", "1");
    			add_location(path18, file$4, 87, 10596, 13882);
    			attr_dev(path19, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-1-node-8-path");
    			attr_dev(path19, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-1-node-area zc-node-area");
    			attr_dev(path19, "d", "M 337.5 162.5 L 366.5 162.5 L 366.5 162.5 L 337.5 162.5 L 337.5 162.5 L 337.5 162.5");
    			attr_dev(path19, "fill", "#CE735D");
    			attr_dev(path19, "fill-opacity", "1");
    			attr_dev(path19, "stroke-linecap", "square");
    			attr_dev(path19, "stroke-linejoin", "miter");
    			attr_dev(path19, "stroke-opacity", "1");
    			add_location(path19, file$4, 87, 11043, 14329);
    			attr_dev(path20, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-1-node-9-path");
    			attr_dev(path20, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-1-node-area zc-node-area");
    			attr_dev(path20, "d", "M 374.5 114.5 L 403.5 114.5 L 403.5 126.5 L 374.5 126.5 L 374.5 114.5 L 374.5 114.5");
    			attr_dev(path20, "fill", "#CE735D");
    			attr_dev(path20, "fill-opacity", "1");
    			attr_dev(path20, "stroke-linecap", "square");
    			attr_dev(path20, "stroke-linejoin", "miter");
    			attr_dev(path20, "stroke-opacity", "1");
    			add_location(path20, file$4, 87, 11490, 14776);
    			attr_dev(g14, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plot-1-bl-1-c");
    			attr_dev(g14, "class", "zc-abs zc-layer zc-bl");
    			attr_dev(g14, "data-clip", "34,18,376,147");
    			set_style(g14, "display", "block");
    			add_location(g14, file$4, 87, 7322, 10608);
    			attr_dev(path21, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-2-node-0-path");
    			attr_dev(path21, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-2-node-area zc-node-area");
    			attr_dev(path21, "d", "M 39.5 138.5 L 68.5 138.5 L 68.5 138.5 L 39.5 138.5 L 39.5 138.5 L 39.5 138.5");
    			attr_dev(path21, "fill", "#EEB55F");
    			attr_dev(path21, "fill-opacity", "1");
    			attr_dev(path21, "stroke-linecap", "square");
    			attr_dev(path21, "stroke-linejoin", "miter");
    			attr_dev(path21, "stroke-opacity", "1");
    			add_location(path21, file$4, 87, 12096, 15382);
    			attr_dev(path22, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-2-node-1-path");
    			attr_dev(path22, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-2-node-area zc-node-area");
    			attr_dev(path22, "d", "M 76.5 55.5 L 105.5 55.5 L 105.5 114.5 L 76.5 114.5 L 76.5 55.5 L 76.5 55.5");
    			attr_dev(path22, "fill", "#EEB55F");
    			attr_dev(path22, "fill-opacity", "1");
    			attr_dev(path22, "stroke-linecap", "square");
    			attr_dev(path22, "stroke-linejoin", "miter");
    			attr_dev(path22, "stroke-opacity", "1");
    			add_location(path22, file$4, 87, 12537, 15823);
    			attr_dev(path23, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-2-node-2-path");
    			attr_dev(path23, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-2-node-area zc-node-area");
    			attr_dev(path23, "d", "M 113.5 138.5 L 143.5 138.5 L 143.5 162.5 L 113.5 162.5 L 113.5 138.5 L 114.5 138.5");
    			attr_dev(path23, "fill", "#EEB55F");
    			attr_dev(path23, "fill-opacity", "1");
    			attr_dev(path23, "stroke-linecap", "square");
    			attr_dev(path23, "stroke-linejoin", "miter");
    			attr_dev(path23, "stroke-opacity", "1");
    			add_location(path23, file$4, 87, 12976, 16262);
    			attr_dev(path24, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-2-node-3-path");
    			attr_dev(path24, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-2-node-area zc-node-area");
    			attr_dev(path24, "d", "M 151.5 150.5 L 180.5 150.5 L 180.5 150.5 L 151.5 150.5 L 151.5 150.5 L 151.5 150.5");
    			attr_dev(path24, "fill", "#EEB55F");
    			attr_dev(path24, "fill-opacity", "1");
    			attr_dev(path24, "stroke-linecap", "square");
    			attr_dev(path24, "stroke-linejoin", "miter");
    			attr_dev(path24, "stroke-opacity", "1");
    			add_location(path24, file$4, 87, 13423, 16709);
    			attr_dev(path25, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-2-node-4-path");
    			attr_dev(path25, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-2-node-area zc-node-area");
    			attr_dev(path25, "d", "M 188.5 138.5 L 217.5 138.5 L 217.5 162.5 L 188.5 162.5 L 188.5 138.5 L 188.5 138.5");
    			attr_dev(path25, "fill", "#EEB55F");
    			attr_dev(path25, "fill-opacity", "1");
    			attr_dev(path25, "stroke-linecap", "square");
    			attr_dev(path25, "stroke-linejoin", "miter");
    			attr_dev(path25, "stroke-opacity", "1");
    			add_location(path25, file$4, 87, 13870, 17156);
    			attr_dev(path26, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-2-node-5-path");
    			attr_dev(path26, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-2-node-area zc-node-area");
    			attr_dev(path26, "d", "M 225.5 138.5 L 254.5 138.5 L 254.5 138.5 L 225.5 138.5 L 225.5 138.5 L 225.5 138.5");
    			attr_dev(path26, "fill", "#EEB55F");
    			attr_dev(path26, "fill-opacity", "1");
    			attr_dev(path26, "stroke-linecap", "square");
    			attr_dev(path26, "stroke-linejoin", "miter");
    			attr_dev(path26, "stroke-opacity", "1");
    			add_location(path26, file$4, 87, 14317, 17603);
    			attr_dev(path27, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-2-node-6-path");
    			attr_dev(path27, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-2-node-area zc-node-area");
    			attr_dev(path27, "d", "M 262.5 126.5 L 291.5 126.5 L 291.5 126.5 L 262.5 126.5 L 262.5 126.5 L 262.5 126.5");
    			attr_dev(path27, "fill", "#EEB55F");
    			attr_dev(path27, "fill-opacity", "1");
    			attr_dev(path27, "stroke-linecap", "square");
    			attr_dev(path27, "stroke-linejoin", "miter");
    			attr_dev(path27, "stroke-opacity", "1");
    			add_location(path27, file$4, 87, 14764, 18050);
    			attr_dev(path28, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-2-node-7-path");
    			attr_dev(path28, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-2-node-area zc-node-area");
    			attr_dev(path28, "d", "M 299.5 150.5 L 329.5 150.5 L 329.5 150.5 L 299.5 150.5 L 299.5 150.5 L 300.5 150.5");
    			attr_dev(path28, "fill", "#EEB55F");
    			attr_dev(path28, "fill-opacity", "1");
    			attr_dev(path28, "stroke-linecap", "square");
    			attr_dev(path28, "stroke-linejoin", "miter");
    			attr_dev(path28, "stroke-opacity", "1");
    			add_location(path28, file$4, 87, 15211, 18497);
    			attr_dev(path29, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-2-node-8-path");
    			attr_dev(path29, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-2-node-area zc-node-area");
    			attr_dev(path29, "d", "M 337.5 162.5 L 366.5 162.5 L 366.5 162.5 L 337.5 162.5 L 337.5 162.5 L 337.5 162.5");
    			attr_dev(path29, "fill", "#EEB55F");
    			attr_dev(path29, "fill-opacity", "1");
    			attr_dev(path29, "stroke-linecap", "square");
    			attr_dev(path29, "stroke-linejoin", "miter");
    			attr_dev(path29, "stroke-opacity", "1");
    			add_location(path29, file$4, 87, 15658, 18944);
    			attr_dev(path30, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-2-node-9-path");
    			attr_dev(path30, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-2-node-area zc-node-area");
    			attr_dev(path30, "d", "M 374.5 114.5 L 403.5 114.5 L 403.5 114.5 L 374.5 114.5 L 374.5 114.5 L 374.5 114.5");
    			attr_dev(path30, "fill", "#EEB55F");
    			attr_dev(path30, "fill-opacity", "1");
    			attr_dev(path30, "stroke-linecap", "square");
    			attr_dev(path30, "stroke-linejoin", "miter");
    			attr_dev(path30, "stroke-opacity", "1");
    			add_location(path30, file$4, 87, 16105, 19391);
    			attr_dev(g15, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plot-2-bl-1-c");
    			attr_dev(g15, "class", "zc-abs zc-layer zc-bl");
    			attr_dev(g15, "data-clip", "34,18,376,147");
    			set_style(g15, "display", "block");
    			add_location(g15, file$4, 87, 11941, 15227);
    			attr_dev(path31, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-3-node-0-path");
    			attr_dev(path31, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-3-node-area zc-node-area");
    			attr_dev(path31, "d", "M 39.5 138.5 L 68.5 138.5 L 68.5 138.5 L 39.5 138.5 L 39.5 138.5 L 39.5 138.5");
    			attr_dev(path31, "fill", "#5BA65F");
    			attr_dev(path31, "fill-opacity", "1");
    			attr_dev(path31, "stroke-linecap", "square");
    			attr_dev(path31, "stroke-linejoin", "miter");
    			attr_dev(path31, "stroke-opacity", "1");
    			add_location(path31, file$4, 87, 16711, 19997);
    			attr_dev(path32, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-3-node-1-path");
    			attr_dev(path32, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-3-node-area zc-node-area");
    			attr_dev(path32, "d", "M 76.5 55.5 L 105.5 55.5 L 105.5 55.5 L 76.5 55.5 L 76.5 55.5 L 76.5 55.5");
    			attr_dev(path32, "fill", "#5BA65F");
    			attr_dev(path32, "fill-opacity", "1");
    			attr_dev(path32, "stroke-linecap", "square");
    			attr_dev(path32, "stroke-linejoin", "miter");
    			attr_dev(path32, "stroke-opacity", "1");
    			add_location(path32, file$4, 87, 17152, 20438);
    			attr_dev(path33, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-3-node-2-path");
    			attr_dev(path33, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-3-node-area zc-node-area");
    			attr_dev(path33, "d", "M 113.5 138.5 L 143.5 138.5 L 143.5 138.5 L 113.5 138.5 L 113.5 138.5 L 114.5 138.5");
    			attr_dev(path33, "fill", "#5BA65F");
    			attr_dev(path33, "fill-opacity", "1");
    			attr_dev(path33, "stroke-linecap", "square");
    			attr_dev(path33, "stroke-linejoin", "miter");
    			attr_dev(path33, "stroke-opacity", "1");
    			add_location(path33, file$4, 87, 17589, 20875);
    			attr_dev(path34, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-3-node-3-path");
    			attr_dev(path34, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-3-node-area zc-node-area");
    			attr_dev(path34, "d", "M 151.5 150.5 L 180.5 150.5 L 180.5 150.5 L 151.5 150.5 L 151.5 150.5 L 151.5 150.5");
    			attr_dev(path34, "fill", "#5BA65F");
    			attr_dev(path34, "fill-opacity", "1");
    			attr_dev(path34, "stroke-linecap", "square");
    			attr_dev(path34, "stroke-linejoin", "miter");
    			attr_dev(path34, "stroke-opacity", "1");
    			add_location(path34, file$4, 87, 18036, 21322);
    			attr_dev(path35, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-3-node-4-path");
    			attr_dev(path35, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-3-node-area zc-node-area");
    			attr_dev(path35, "d", "M 188.5 138.5 L 217.5 138.5 L 217.5 138.5 L 188.5 138.5 L 188.5 138.5 L 188.5 138.5");
    			attr_dev(path35, "fill", "#5BA65F");
    			attr_dev(path35, "fill-opacity", "1");
    			attr_dev(path35, "stroke-linecap", "square");
    			attr_dev(path35, "stroke-linejoin", "miter");
    			attr_dev(path35, "stroke-opacity", "1");
    			add_location(path35, file$4, 87, 18483, 21769);
    			attr_dev(path36, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-3-node-5-path");
    			attr_dev(path36, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-3-node-area zc-node-area");
    			attr_dev(path36, "d", "M 225.5 138.5 L 254.5 138.5 L 254.5 138.5 L 225.5 138.5 L 225.5 138.5 L 225.5 138.5");
    			attr_dev(path36, "fill", "#5BA65F");
    			attr_dev(path36, "fill-opacity", "1");
    			attr_dev(path36, "stroke-linecap", "square");
    			attr_dev(path36, "stroke-linejoin", "miter");
    			attr_dev(path36, "stroke-opacity", "1");
    			add_location(path36, file$4, 87, 18930, 22216);
    			attr_dev(path37, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-3-node-6-path");
    			attr_dev(path37, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-3-node-area zc-node-area");
    			attr_dev(path37, "d", "M 262.5 114.5 L 291.5 114.5 L 291.5 126.5 L 262.5 126.5 L 262.5 114.5 L 262.5 114.5");
    			attr_dev(path37, "fill", "#5BA65F");
    			attr_dev(path37, "fill-opacity", "1");
    			attr_dev(path37, "stroke-linecap", "square");
    			attr_dev(path37, "stroke-linejoin", "miter");
    			attr_dev(path37, "stroke-opacity", "1");
    			add_location(path37, file$4, 87, 19377, 22663);
    			attr_dev(path38, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-3-node-7-path");
    			attr_dev(path38, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-3-node-area zc-node-area");
    			attr_dev(path38, "d", "M 299.5 150.5 L 329.5 150.5 L 329.5 150.5 L 299.5 150.5 L 299.5 150.5 L 300.5 150.5");
    			attr_dev(path38, "fill", "#5BA65F");
    			attr_dev(path38, "fill-opacity", "1");
    			attr_dev(path38, "stroke-linecap", "square");
    			attr_dev(path38, "stroke-linejoin", "miter");
    			attr_dev(path38, "stroke-opacity", "1");
    			add_location(path38, file$4, 87, 19824, 23110);
    			attr_dev(path39, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-3-node-8-path");
    			attr_dev(path39, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-3-node-area zc-node-area");
    			attr_dev(path39, "d", "M 337.5 162.5 L 366.5 162.5 L 366.5 162.5 L 337.5 162.5 L 337.5 162.5 L 337.5 162.5");
    			attr_dev(path39, "fill", "#5BA65F");
    			attr_dev(path39, "fill-opacity", "1");
    			attr_dev(path39, "stroke-linecap", "square");
    			attr_dev(path39, "stroke-linejoin", "miter");
    			attr_dev(path39, "stroke-opacity", "1");
    			add_location(path39, file$4, 87, 20271, 23557);
    			attr_dev(path40, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-3-node-9-path");
    			attr_dev(path40, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-3-node-area zc-node-area");
    			attr_dev(path40, "d", "M 374.5 102.5 L 403.5 102.5 L 403.5 114.5 L 374.5 114.5 L 374.5 102.5 L 374.5 102.5");
    			attr_dev(path40, "fill", "#5BA65F");
    			attr_dev(path40, "fill-opacity", "1");
    			attr_dev(path40, "stroke-linecap", "square");
    			attr_dev(path40, "stroke-linejoin", "miter");
    			attr_dev(path40, "stroke-opacity", "1");
    			add_location(path40, file$4, 87, 20718, 24004);
    			attr_dev(g16, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plot-3-bl-1-c");
    			attr_dev(g16, "class", "zc-abs zc-layer zc-bl");
    			attr_dev(g16, "data-clip", "34,18,376,147");
    			set_style(g16, "display", "block");
    			add_location(g16, file$4, 87, 16556, 19842);
    			attr_dev(path41, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-4-node-0-path");
    			attr_dev(path41, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-4-node-area zc-node-area");
    			attr_dev(path41, "d", "M 39.5 138.5 L 68.5 138.5 L 68.5 138.5 L 39.5 138.5 L 39.5 138.5 L 39.5 138.5");
    			attr_dev(path41, "fill", "#9E4BA0");
    			attr_dev(path41, "fill-opacity", "1");
    			attr_dev(path41, "stroke-linecap", "square");
    			attr_dev(path41, "stroke-linejoin", "miter");
    			attr_dev(path41, "stroke-opacity", "1");
    			add_location(path41, file$4, 87, 21324, 24610);
    			attr_dev(path42, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-4-node-1-path");
    			attr_dev(path42, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-4-node-area zc-node-area");
    			attr_dev(path42, "d", "M 76.5 31.5 L 105.5 31.5 L 105.5 55.5 L 76.5 55.5 L 76.5 31.5 L 76.5 31.5");
    			attr_dev(path42, "fill", "#9E4BA0");
    			attr_dev(path42, "fill-opacity", "1");
    			attr_dev(path42, "stroke-linecap", "square");
    			attr_dev(path42, "stroke-linejoin", "miter");
    			attr_dev(path42, "stroke-opacity", "1");
    			add_location(path42, file$4, 87, 21765, 25051);
    			attr_dev(path43, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-4-node-2-path");
    			attr_dev(path43, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-4-node-area zc-node-area");
    			attr_dev(path43, "d", "M 113.5 138.5 L 143.5 138.5 L 143.5 138.5 L 113.5 138.5 L 113.5 138.5 L 114.5 138.5");
    			attr_dev(path43, "fill", "#9E4BA0");
    			attr_dev(path43, "fill-opacity", "1");
    			attr_dev(path43, "stroke-linecap", "square");
    			attr_dev(path43, "stroke-linejoin", "miter");
    			attr_dev(path43, "stroke-opacity", "1");
    			add_location(path43, file$4, 87, 22202, 25488);
    			attr_dev(path44, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-4-node-3-path");
    			attr_dev(path44, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-4-node-area zc-node-area");
    			attr_dev(path44, "d", "M 151.5 150.5 L 180.5 150.5 L 180.5 150.5 L 151.5 150.5 L 151.5 150.5 L 151.5 150.5");
    			attr_dev(path44, "fill", "#9E4BA0");
    			attr_dev(path44, "fill-opacity", "1");
    			attr_dev(path44, "stroke-linecap", "square");
    			attr_dev(path44, "stroke-linejoin", "miter");
    			attr_dev(path44, "stroke-opacity", "1");
    			add_location(path44, file$4, 87, 22649, 25935);
    			attr_dev(path45, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-4-node-4-path");
    			attr_dev(path45, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-4-node-area zc-node-area");
    			attr_dev(path45, "d", "M 188.5 138.5 L 217.5 138.5 L 217.5 138.5 L 188.5 138.5 L 188.5 138.5 L 188.5 138.5");
    			attr_dev(path45, "fill", "#9E4BA0");
    			attr_dev(path45, "fill-opacity", "1");
    			attr_dev(path45, "stroke-linecap", "square");
    			attr_dev(path45, "stroke-linejoin", "miter");
    			attr_dev(path45, "stroke-opacity", "1");
    			add_location(path45, file$4, 87, 23096, 26382);
    			attr_dev(path46, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-4-node-5-path");
    			attr_dev(path46, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-4-node-area zc-node-area");
    			attr_dev(path46, "d", "M 225.5 138.5 L 254.5 138.5 L 254.5 138.5 L 225.5 138.5 L 225.5 138.5 L 225.5 138.5");
    			attr_dev(path46, "fill", "#9E4BA0");
    			attr_dev(path46, "fill-opacity", "1");
    			attr_dev(path46, "stroke-linecap", "square");
    			attr_dev(path46, "stroke-linejoin", "miter");
    			attr_dev(path46, "stroke-opacity", "1");
    			add_location(path46, file$4, 87, 23543, 26829);
    			attr_dev(path47, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-4-node-6-path");
    			attr_dev(path47, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-4-node-area zc-node-area");
    			attr_dev(path47, "d", "M 262.5 114.5 L 291.5 114.5 L 291.5 114.5 L 262.5 114.5 L 262.5 114.5 L 262.5 114.5");
    			attr_dev(path47, "fill", "#9E4BA0");
    			attr_dev(path47, "fill-opacity", "1");
    			attr_dev(path47, "stroke-linecap", "square");
    			attr_dev(path47, "stroke-linejoin", "miter");
    			attr_dev(path47, "stroke-opacity", "1");
    			add_location(path47, file$4, 87, 23990, 27276);
    			attr_dev(path48, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-4-node-7-path");
    			attr_dev(path48, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-4-node-area zc-node-area");
    			attr_dev(path48, "d", "M 299.5 150.5 L 329.5 150.5 L 329.5 150.5 L 299.5 150.5 L 299.5 150.5 L 300.5 150.5");
    			attr_dev(path48, "fill", "#9E4BA0");
    			attr_dev(path48, "fill-opacity", "1");
    			attr_dev(path48, "stroke-linecap", "square");
    			attr_dev(path48, "stroke-linejoin", "miter");
    			attr_dev(path48, "stroke-opacity", "1");
    			add_location(path48, file$4, 87, 24437, 27723);
    			attr_dev(path49, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-4-node-8-path");
    			attr_dev(path49, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-4-node-area zc-node-area");
    			attr_dev(path49, "d", "M 337.5 162.5 L 366.5 162.5 L 366.5 162.5 L 337.5 162.5 L 337.5 162.5 L 337.5 162.5");
    			attr_dev(path49, "fill", "#9E4BA0");
    			attr_dev(path49, "fill-opacity", "1");
    			attr_dev(path49, "stroke-linecap", "square");
    			attr_dev(path49, "stroke-linejoin", "miter");
    			attr_dev(path49, "stroke-opacity", "1");
    			add_location(path49, file$4, 87, 24884, 28170);
    			attr_dev(path50, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-4-node-9-path");
    			attr_dev(path50, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-node-area AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plotset-plot-4-node-area zc-node-area");
    			attr_dev(path50, "d", "M 374.5 102.5 L 403.5 102.5 L 403.5 102.5 L 374.5 102.5 L 374.5 102.5 L 374.5 102.5");
    			attr_dev(path50, "fill", "#9E4BA0");
    			attr_dev(path50, "fill-opacity", "1");
    			attr_dev(path50, "stroke-linecap", "square");
    			attr_dev(path50, "stroke-linejoin", "miter");
    			attr_dev(path50, "stroke-opacity", "1");
    			add_location(path50, file$4, 87, 25331, 28617);
    			attr_dev(g17, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plot-4-bl-1-c");
    			attr_dev(g17, "class", "zc-abs zc-layer zc-bl");
    			attr_dev(g17, "data-clip", "34,18,376,147");
    			set_style(g17, "display", "block");
    			add_location(g17, file$4, 87, 21169, 24455);
    			attr_dev(g18, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plots-bl-1");
    			attr_dev(g18, "clip-path", "url(#AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-clip)");
    			add_location(g18, file$4, 87, 2555, 5841);
    			attr_dev(g19, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plot-0-bl-2-c");
    			attr_dev(g19, "class", "zc-abs zc-layer zc-bl");
    			attr_dev(g19, "data-clip", "34,18,376,147");
    			set_style(g19, "display", "block");
    			add_location(g19, file$4, 87, 25934, 29220);
    			attr_dev(g20, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plot-1-bl-2-c");
    			attr_dev(g20, "class", "zc-abs zc-layer zc-bl");
    			attr_dev(g20, "data-clip", "34,18,376,147");
    			set_style(g20, "display", "block");
    			add_location(g20, file$4, 87, 26093, 29379);
    			attr_dev(g21, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plot-2-bl-2-c");
    			attr_dev(g21, "class", "zc-abs zc-layer zc-bl");
    			attr_dev(g21, "data-clip", "34,18,376,147");
    			set_style(g21, "display", "block");
    			add_location(g21, file$4, 87, 26252, 29538);
    			attr_dev(g22, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plot-3-bl-2-c");
    			attr_dev(g22, "class", "zc-abs zc-layer zc-bl");
    			attr_dev(g22, "data-clip", "34,18,376,147");
    			set_style(g22, "display", "block");
    			add_location(g22, file$4, 87, 26411, 29697);
    			attr_dev(g23, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plot-4-bl-2-c");
    			attr_dev(g23, "class", "zc-abs zc-layer zc-bl");
    			attr_dev(g23, "data-clip", "34,18,376,147");
    			set_style(g23, "display", "block");
    			add_location(g23, file$4, 87, 26570, 29856);
    			attr_dev(g24, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plots-bl-2");
    			attr_dev(g24, "clip-path", "url(#AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-clip)");
    			add_location(g24, file$4, 87, 25786, 29072);
    			attr_dev(path51, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-x-path");
    			attr_dev(path51, "d", "M 34.5 162.5 L 408.5 162.5 M 35.5 162.5 L 35.5 167.5 M 72.5 162.5 L 72.5 167.5 M 109.5 162.5 L 109.5 167.5 M 147.5 162.5 L 147.5 167.5 M 184.5 162.5 L 184.5 167.5 M 221.5 162.5 L 221.5 167.5 M 258.5 162.5 L 258.5 167.5 M 295.5 162.5 L 295.5 167.5 M 333.5 162.5 L 333.5 167.5 M 370.5 162.5 L 370.5 167.5 M 407.5 162.5 L 407.5 167.5");
    			attr_dev(path51, "fill", "none");
    			attr_dev(path51, "stroke-linecap", "butt");
    			attr_dev(path51, "stroke-linejoin", "round");
    			attr_dev(path51, "stroke", "#8C8C8C");
    			attr_dev(path51, "stroke-width", "1");
    			attr_dev(path51, "stroke-opacity", "1");
    			add_location(path51, file$4, 87, 26832, 30118);
    			attr_dev(path52, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-y-path");
    			attr_dev(path52, "d", "M 35.5 162.5 L 35.5 19.5");
    			attr_dev(path52, "fill", "none");
    			attr_dev(path52, "stroke-linecap", "butt");
    			attr_dev(path52, "stroke-linejoin", "round");
    			attr_dev(path52, "stroke", "#8C8C8C");
    			attr_dev(path52, "stroke-width", "1");
    			attr_dev(path52, "stroke-opacity", "1");
    			add_location(path52, file$4, 87, 27362, 30648);
    			attr_dev(path53, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-y-tick-6-path");
    			attr_dev(path53, "d", "M 35.5 162.5 L 30.5 162.5 M 35.5 138.5 L 30.5 138.5 M 35.5 114.5 L 30.5 114.5 M 35.5 91.5 L 30.5 91.5 M 35.5 67.5 L 30.5 67.5 M 35.5 43.5 L 30.5 43.5 M 35.5 19.5 L 30.5 19.5");
    			attr_dev(path53, "fill", "none");
    			attr_dev(path53, "stroke-linecap", "butt");
    			attr_dev(path53, "stroke-linejoin", "round");
    			attr_dev(path53, "stroke", "#8C8C8C");
    			attr_dev(path53, "stroke-width", "1");
    			attr_dev(path53, "stroke-opacity", "1");
    			add_location(path53, file$4, 87, 27586, 30872);
    			attr_dev(g25, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scales-ml-0-c");
    			attr_dev(g25, "class", "zc-abs zc-layer");
    			add_location(g25, file$4, 87, 26733, 30019);
    			attr_dev(g26, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plot-0-fl-0-c");
    			attr_dev(g26, "class", "zc-abs zc-layer zc-fl");
    			attr_dev(g26, "data-clip", "30,14,384,155");
    			set_style(g26, "display", "block");
    			add_location(g26, file$4, 87, 28042, 31328);
    			attr_dev(g27, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plot-1-fl-0-c");
    			attr_dev(g27, "class", "zc-abs zc-layer zc-fl");
    			attr_dev(g27, "data-clip", "30,14,384,155");
    			set_style(g27, "display", "block");
    			add_location(g27, file$4, 87, 28201, 31487);
    			attr_dev(g28, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plot-2-fl-0-c");
    			attr_dev(g28, "class", "zc-abs zc-layer zc-fl");
    			attr_dev(g28, "data-clip", "30,14,384,155");
    			set_style(g28, "display", "block");
    			add_location(g28, file$4, 87, 28360, 31646);
    			attr_dev(g29, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plot-3-fl-0-c");
    			attr_dev(g29, "class", "zc-abs zc-layer zc-fl");
    			attr_dev(g29, "data-clip", "30,14,384,155");
    			set_style(g29, "display", "block");
    			add_location(g29, file$4, 87, 28519, 31805);
    			attr_dev(g30, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plot-4-fl-0-c");
    			attr_dev(g30, "class", "zc-abs zc-layer zc-fl");
    			attr_dev(g30, "data-clip", "30,14,384,155");
    			set_style(g30, "display", "block");
    			add_location(g30, file$4, 87, 28678, 31964);
    			attr_dev(g31, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plots-fl-0");
    			add_location(g31, file$4, 87, 27970, 31256);
    			attr_dev(g32, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scales-fl-0-c");
    			attr_dev(g32, "class", "zc-abs zc-layer");
    			add_location(g32, file$4, 87, 28988, 32274);
    			attr_dev(g33, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scales-fl");
    			attr_dev(g33, "clip-path", "url(#AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-clip)");
    			add_location(g33, file$4, 87, 28841, 32127);
    			attr_dev(g34, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scroll");
    			add_location(g34, file$4, 87, 29095, 32381);
    			attr_dev(g35, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plot-0-vb-c");
    			attr_dev(g35, "class", "zc-abs zc-layer zc-vb");
    			add_location(g35, file$4, 87, 29237, 32523);
    			attr_dev(g36, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plot-1-vb-c");
    			attr_dev(g36, "class", "zc-abs zc-layer zc-vb");
    			add_location(g36, file$4, 87, 29344, 32630);
    			attr_dev(g37, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plot-2-vb-c");
    			attr_dev(g37, "class", "zc-abs zc-layer zc-vb");
    			add_location(g37, file$4, 87, 29451, 32737);
    			attr_dev(g38, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plot-3-vb-c");
    			attr_dev(g38, "class", "zc-abs zc-layer zc-vb");
    			add_location(g38, file$4, 87, 29558, 32844);
    			attr_dev(g39, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plot-4-vb-c");
    			attr_dev(g39, "class", "zc-abs zc-layer zc-vb");
    			add_location(g39, file$4, 87, 29665, 32951);
    			attr_dev(g40, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-plots-vb");
    			add_location(g40, file$4, 87, 29167, 32453);
    			attr_dev(g41, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0");
    			attr_dev(g41, "class", "zc-abs");
    			add_location(g41, file$4, 87, 611, 3897);
    			attr_dev(g42, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graphset");
    			attr_dev(g42, "class", "zc-abs");
    			add_location(g42, file$4, 87, 536, 3822);
    			attr_dev(g43, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-objects-maps");
    			attr_dev(g43, "class", "zc-abs");
    			add_location(g43, file$4, 87, 29784, 33070);
    			attr_dev(g44, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-objects-top");
    			attr_dev(g44, "class", "zc-abs");
    			add_location(g44, file$4, 87, 29867, 33153);
    			attr_dev(g45, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-hover-c");
    			attr_dev(g45, "class", "zc-abs zc-layer");
    			add_location(g45, file$4, 87, 30185, 33471);
    			attr_dev(g46, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-hover");
    			attr_dev(g46, "class", "zc-abs");
    			attr_dev(g46, "clip-path", "url(#AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-clip-hover)");
    			add_location(g46, file$4, 87, 30021, 33307);
    			attr_dev(g47, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-hover");
    			attr_dev(g47, "class", "zc-abs");
    			add_location(g47, file$4, 87, 29949, 33235);
    			attr_dev(g48, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-objects-front");
    			attr_dev(g48, "class", "zc-abs");
    			add_location(g48, file$4, 87, 30290, 33576);
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
    			add_location(tspan0, file$4, 87, 30713, 33999);
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
    			add_location(tspan1, file$4, 87, 31031, 34317);
    			attr_dev(text0, "x", "40.1");
    			attr_dev(text0, "y", "170");
    			attr_dev(text0, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale_x-item_0");
    			attr_dev(text0, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-x-item AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-item zc-scale-item");
    			attr_dev(text0, "opacity", "1");
    			add_location(text0, file$4, 87, 30453, 33739);
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
    			add_location(tspan2, file$4, 87, 31619, 34905);
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
    			add_location(tspan3, file$4, 87, 31938, 35224);
    			attr_dev(text1, "x", "374.9");
    			attr_dev(text1, "y", "170");
    			attr_dev(text1, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale_x-item_9");
    			attr_dev(text1, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-x-item AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-item zc-scale-item");
    			attr_dev(text1, "opacity", "1");
    			add_location(text1, file$4, 87, 31358, 34644);
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
    			add_location(tspan4, file$4, 87, 32526, 35812);
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
    			add_location(tspan5, file$4, 87, 32844, 36130);
    			attr_dev(text2, "x", "77.3");
    			attr_dev(text2, "y", "170");
    			attr_dev(text2, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale_x-item_1");
    			attr_dev(text2, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-x-item AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-item zc-scale-item");
    			attr_dev(text2, "opacity", "1");
    			add_location(text2, file$4, 87, 32266, 35552);
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
    			add_location(tspan6, file$4, 87, 33432, 36718);
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
    			add_location(tspan7, file$4, 87, 33751, 37037);
    			attr_dev(text3, "x", "114.5");
    			attr_dev(text3, "y", "170");
    			attr_dev(text3, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale_x-item_2");
    			attr_dev(text3, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-x-item AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-item zc-scale-item");
    			attr_dev(text3, "opacity", "1");
    			add_location(text3, file$4, 87, 33171, 36457);
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
    			add_location(tspan8, file$4, 87, 34340, 37626);
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
    			add_location(tspan9, file$4, 87, 34659, 37945);
    			attr_dev(text4, "x", "151.7");
    			attr_dev(text4, "y", "170");
    			attr_dev(text4, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale_x-item_3");
    			attr_dev(text4, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-x-item AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-item zc-scale-item");
    			attr_dev(text4, "opacity", "1");
    			add_location(text4, file$4, 87, 34079, 37365);
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
    			add_location(tspan10, file$4, 87, 35248, 38534);
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
    			add_location(tspan11, file$4, 87, 35567, 38853);
    			attr_dev(text5, "x", "188.9");
    			attr_dev(text5, "y", "170");
    			attr_dev(text5, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale_x-item_4");
    			attr_dev(text5, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-x-item AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-item zc-scale-item");
    			attr_dev(text5, "opacity", "1");
    			add_location(text5, file$4, 87, 34987, 38273);
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
    			add_location(tspan12, file$4, 87, 36156, 39442);
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
    			add_location(tspan13, file$4, 87, 36475, 39761);
    			attr_dev(text6, "x", "226.1");
    			attr_dev(text6, "y", "170");
    			attr_dev(text6, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale_x-item_5");
    			attr_dev(text6, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-x-item AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-item zc-scale-item");
    			attr_dev(text6, "opacity", "1");
    			add_location(text6, file$4, 87, 35895, 39181);
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
    			add_location(tspan14, file$4, 87, 37064, 40350);
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
    			add_location(tspan15, file$4, 87, 37383, 40669);
    			attr_dev(text7, "x", "263.3");
    			attr_dev(text7, "y", "170");
    			attr_dev(text7, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale_x-item_6");
    			attr_dev(text7, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-x-item AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-item zc-scale-item");
    			attr_dev(text7, "opacity", "1");
    			add_location(text7, file$4, 87, 36803, 40089);
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
    			add_location(tspan16, file$4, 87, 37972, 41258);
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
    			add_location(tspan17, file$4, 87, 38291, 41577);
    			attr_dev(text8, "x", "300.5");
    			attr_dev(text8, "y", "170");
    			attr_dev(text8, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale_x-item_7");
    			attr_dev(text8, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-x-item AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-item zc-scale-item");
    			attr_dev(text8, "opacity", "1");
    			add_location(text8, file$4, 87, 37711, 40997);
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
    			add_location(tspan18, file$4, 87, 38880, 42166);
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
    			add_location(tspan19, file$4, 87, 39199, 42485);
    			attr_dev(text9, "x", "337.7");
    			attr_dev(text9, "y", "170");
    			attr_dev(text9, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale_x-item_8");
    			attr_dev(text9, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-x-item AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-item zc-scale-item");
    			attr_dev(text9, "opacity", "1");
    			add_location(text9, file$4, 87, 38619, 41905);
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
    			add_location(tspan20, file$4, 87, 39790, 43076);
    			attr_dev(text10, "x", "21.41");
    			attr_dev(text10, "y", "155.2");
    			attr_dev(text10, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale_y-item_0");
    			attr_dev(text10, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-y-item AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-item zc-scale-item");
    			attr_dev(text10, "opacity", "1");
    			add_location(text10, file$4, 87, 39527, 42813);
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
    			add_location(tspan21, file$4, 87, 40375, 43661);
    			attr_dev(text11, "x", "13.81");
    			attr_dev(text11, "y", "12.2");
    			attr_dev(text11, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale_y-item_6");
    			attr_dev(text11, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-y-item AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-item zc-scale-item");
    			attr_dev(text11, "opacity", "1");
    			add_location(text11, file$4, 87, 40113, 43399);
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
    			add_location(tspan22, file$4, 87, 40962, 44248);
    			attr_dev(text12, "x", "21.41");
    			attr_dev(text12, "y", "131.37");
    			attr_dev(text12, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale_y-item_1");
    			attr_dev(text12, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-y-item AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-item zc-scale-item");
    			attr_dev(text12, "opacity", "1");
    			add_location(text12, file$4, 87, 40698, 43984);
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
    			add_location(tspan23, file$4, 87, 41550, 44836);
    			attr_dev(text13, "x", "21.41");
    			attr_dev(text13, "y", "107.54");
    			attr_dev(text13, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale_y-item_2");
    			attr_dev(text13, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-y-item AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-item zc-scale-item");
    			attr_dev(text13, "opacity", "1");
    			add_location(text13, file$4, 87, 41286, 44572);
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
    			add_location(tspan24, file$4, 87, 42136, 45422);
    			attr_dev(text14, "x", "21.41");
    			attr_dev(text14, "y", "83.7");
    			attr_dev(text14, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale_y-item_3");
    			attr_dev(text14, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-y-item AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-item zc-scale-item");
    			attr_dev(text14, "opacity", "1");
    			add_location(text14, file$4, 87, 41874, 45160);
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
    			add_location(tspan25, file$4, 87, 42721, 46007);
    			attr_dev(text15, "x", "21.41");
    			attr_dev(text15, "y", "59.87");
    			attr_dev(text15, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale_y-item_4");
    			attr_dev(text15, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-y-item AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-item zc-scale-item");
    			attr_dev(text15, "opacity", "1");
    			add_location(text15, file$4, 87, 42458, 45744);
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
    			add_location(tspan26, file$4, 87, 43307, 46593);
    			attr_dev(text16, "x", "13.81");
    			attr_dev(text16, "y", "36.04");
    			attr_dev(text16, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale_y-item_5");
    			attr_dev(text16, "class", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-y-item AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-scale-item zc-scale-item");
    			attr_dev(text16, "opacity", "1");
    			add_location(text16, file$4, 87, 43044, 46330);
    			attr_dev(g49, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-text");
    			attr_dev(g49, "class", "zc-abs zc-text");
    			add_location(g49, file$4, 87, 30374, 33660);
    			attr_dev(g50, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-legend");
    			attr_dev(g50, "class", "zc-abs");
    			add_location(g50, file$4, 87, 43635, 46921);
    			attr_dev(g51, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-static-c");
    			attr_dev(g51, "class", "zc-abs zc-layer");
    			add_location(g51, file$4, 87, 43784, 47070);
    			attr_dev(g52, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-guide-c");
    			attr_dev(g52, "class", "zc-abs zc-layer zc-guide-c");
    			add_location(g52, file$4, 87, 43872, 47158);
    			attr_dev(g53, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-trigger-c");
    			attr_dev(g53, "class", "zc-abs zc-layer");
    			add_location(g53, file$4, 87, 43970, 47256);
    			attr_dev(g54, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-print-c");
    			attr_dev(g54, "class", "zc-abs zc-layer");
    			add_location(g54, file$4, 87, 44059, 47345);
    			attr_dev(g55, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-textprint-c");
    			attr_dev(g55, "class", "zc-abs zc-layer");
    			add_location(g55, file$4, 87, 44146, 47432);
    			attr_dev(g56, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-tools");
    			attr_dev(g56, "class", "zc-abs");
    			add_location(g56, file$4, 87, 43712, 46998);
    			attr_dev(g57, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-text-top");
    			attr_dev(g57, "class", "zc-abs");
    			add_location(g57, file$4, 87, 44241, 47527);
    			attr_dev(g58, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-main");
    			attr_dev(g58, "class", "zc-rel zc-main");
    			add_location(g58, file$4, 87, 295, 3581);
    			attr_dev(polygon0, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-clip-shape");
    			attr_dev(polygon0, "points", "34,18 410,18 410,165 34,165 34,18");
    			add_location(polygon0, file$4, 87, 44397, 47683);
    			attr_dev(clipPath0, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-clip");
    			add_location(clipPath0, file$4, 87, 44324, 47610);
    			attr_dev(polygon1, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-clip-hover-shape");
    			attr_dev(polygon1, "points", "30,14 414,14 414,169 30,169 30,14");
    			add_location(polygon1, file$4, 87, 44618, 47904);
    			attr_dev(clipPath1, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-graph-id0-clip-hover");
    			add_location(clipPath1, file$4, 87, 44539, 47825);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "id", "AwUniqueId1d2b767a326d4b5eb97922f8f46c2a5e-svg");
    			attr_dev(svg, "class", "zc-svg");
    			attr_dev(svg, "viewBox", "0 0 428 203");
    			attr_dev(svg, "width", "90%");
    			attr_dev(svg, "display", "block");
    			add_location(svg, file$4, 87, 20, 3306);
    			attr_dev(div23, "class", "card-body");
    			add_location(div23, file$4, 86, 16, 3262);
    			attr_dev(div24, "class", "card card-32");
    			add_location(div24, file$4, 84, 12, 3157);
    			attr_dev(div25, "class", "col12 col-md-6");
    			add_location(div25, file$4, 83, 8, 3116);
    			attr_dev(div26, "class", "row");
    			add_location(div26, file$4, 45, 4, 1599);
    			add_location(h4, file$4, 95, 12, 48198);
    			add_location(th0, file$4, 100, 28, 48385);
    			add_location(th1, file$4, 101, 28, 48432);
    			add_location(th2, file$4, 102, 28, 48481);
    			add_location(th3, file$4, 103, 28, 48525);
    			add_location(th4, file$4, 104, 28, 48573);
    			add_location(th5, file$4, 105, 28, 48615);
    			add_location(th6, file$4, 106, 28, 48661);
    			add_location(th7, file$4, 107, 28, 48704);
    			add_location(th8, file$4, 108, 28, 48754);
    			add_location(tr0, file$4, 99, 24, 48352);
    			add_location(thead, file$4, 98, 20, 48320);
    			add_location(b, file$4, 113, 32, 48918);
    			add_location(td0, file$4, 113, 28, 48914);
    			add_location(td1, file$4, 114, 28, 48962);
    			add_location(td2, file$4, 115, 28, 49011);
    			add_location(td3, file$4, 116, 28, 49051);
    			add_location(td4, file$4, 117, 28, 49098);
    			add_location(td5, file$4, 118, 28, 49144);
    			add_location(td6, file$4, 119, 28, 49193);
    			add_location(td7, file$4, 120, 28, 49237);
    			add_location(td8, file$4, 121, 28, 49276);
    			add_location(tr1, file$4, 112, 24, 48881);
    			add_location(tbody, file$4, 111, 20, 48849);
    			attr_dev(table, "class", "table");
    			add_location(table, file$4, 97, 16, 48278);
    			attr_dev(div27, "class", "pagination");
    			add_location(div27, file$4, 126, 48, 49454);
    			attr_dev(div28, "class", "pagination-wrapper");
    			add_location(div28, file$4, 126, 16, 49422);
    			attr_dev(div29, "class", "sticky-wrapper svelte-1s2baiw");
    			add_location(div29, file$4, 96, 12, 48233);
    			attr_dev(div30, "class", "col12");
    			add_location(div30, file$4, 94, 8, 48166);
    			attr_dev(div31, "class", "row");
    			add_location(div31, file$4, 93, 4, 48140);
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
    		source: "(45:0) {#if tab == 'dashboard'}",
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
    			li5 = element("li");
    			a6 = element("a");
    			a6.textContent = "Admin";
    			t15 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(a0, "href", "#platform");
    			add_location(a0, file$4, 26, 16, 448);
    			add_location(li0, file$4, 26, 12, 444);
    			attr_dev(a1, "href", "#ehs");
    			add_location(a1, file$4, 27, 16, 541);
    			add_location(li1, file$4, 27, 12, 537);
    			add_location(li2, file$4, 28, 12, 614);
    			attr_dev(ul0, "class", "breadcrumb");
    			add_location(ul0, file$4, 25, 8, 408);
    			attr_dev(div0, "class", "col12 col-sm-5");
    			add_location(div0, file$4, 24, 4, 371);
    			attr_dev(a2, "href", "#ehs/incidents/queries_new");
    			attr_dev(a2, "class", "btn btn-secondary");
    			add_location(a2, file$4, 33, 8, 774);
    			attr_dev(a3, "href", "#ehs/incidents/incidents_new");
    			attr_dev(a3, "class", "btn");
    			add_location(a3, file$4, 34, 8, 896);
    			attr_dev(div1, "class", "col12 col-sm-7 text-right");
    			add_location(div1, file$4, 31, 4, 662);
    			attr_dev(div2, "class", "row sticky");
    			add_location(div2, file$4, 23, 0, 342);
    			attr_dev(a4, "href", "#ehs/incidents/dashboard");
    			toggle_class(a4, "active", /*tab*/ ctx[0] == "dashboard");
    			add_location(a4, file$4, 39, 8, 1043);
    			add_location(li3, file$4, 39, 4, 1039);
    			attr_dev(a5, "href", "#ehs/incidents/summary");
    			toggle_class(a5, "active", /*tab*/ ctx[0] == "summary");
    			add_location(a5, file$4, 40, 8, 1184);
    			add_location(li4, file$4, 40, 4, 1180);
    			attr_dev(a6, "href", "#ehs/incidents/admin");
    			toggle_class(a6, "active", /*tab*/ ctx[0] == "admin");
    			add_location(a6, file$4, 41, 8, 1318);
    			add_location(li5, file$4, 41, 4, 1314);
    			attr_dev(ul1, "class", "tabs");
    			add_location(ul1, file$4, 38, 0, 1017);
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
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(a0, "click", /*click_handler*/ ctx[3], false, false, false),
    					listen_dev(a1, "click", /*click_handler_1*/ ctx[4], false, false, false),
    					listen_dev(a2, "click", /*click_handler_2*/ ctx[5], false, false, false),
    					listen_dev(a3, "click", /*click_handler_3*/ ctx[6], false, false, false),
    					listen_dev(a4, "click", /*click_handler_4*/ ctx[7], false, false, false),
    					listen_dev(a5, "click", /*click_handler_5*/ ctx[8], false, false, false),
    					listen_dev(a6, "click", /*click_handler_6*/ ctx[9], false, false, false)
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

    			if (dirty & /*tab*/ 1) {
    				toggle_class(a6, "active", /*tab*/ ctx[0] == "admin");
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
    			if (detaching) detach_dev(t15);

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
    	const dispatch = createEventDispatcher();
    	let tab = "dashboard";
    	let { tabnav = "" } = $$props;

    	function nav(str) {
    		dispatch("nav", { text: str });
    	}

    	const writable_props = ["tabnav"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Frame_incidents> was created with unknown prop '${key}'`);
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
    		$$invalidate(0, tab = "dashboard");
    	};

    	const click_handler_5 = () => {
    		$$invalidate(0, tab = "summary");
    	};

    	const click_handler_6 = () => {
    		$$invalidate(0, tab = "admin");
    	};

    	$$self.$$set = $$props => {
    		if ("tabnav" in $$props) $$invalidate(2, tabnav = $$props.tabnav);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		tab,
    		tabnav,
    		nav
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

    				if (tabnav !== "") {
    					$$invalidate(0, tab = t);
    				}
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

    class Frame_incidents extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { tabnav: 2 });

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
    const file$3 = "src/Frame_incidents_new.svelte";

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
    	let div11;
    	let div5;
    	let h10;
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
    	let t23;
    	let li5;
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
    	let div10;
    	let h11;
    	let t39;
    	let div9;
    	let div8;
    	let h42;
    	let t41;
    	let div6;
    	let label0;
    	let t43;
    	let input0;
    	let t44;
    	let div7;
    	let label1;
    	let t46;
    	let input1;
    	let mounted;
    	let dispose;

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
    			div11 = element("div");
    			div5 = element("div");
    			h10 = element("h1");
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
    			li4.textContent = "Report";
    			t23 = space();
    			li5 = element("li");
    			li5.textContent = "Events";
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
    			div10 = element("div");
    			h11 = element("h1");
    			h11.textContent = "Report";
    			t39 = space();
    			div9 = element("div");
    			div8 = element("div");
    			h42 = element("h4");
    			h42.textContent = "Initial details";
    			t41 = space();
    			div6 = element("div");
    			label0 = element("label");
    			label0.textContent = "Site";
    			t43 = space();
    			input0 = element("input");
    			t44 = space();
    			div7 = element("div");
    			label1 = element("label");
    			label1.textContent = "Date and time of event";
    			t46 = space();
    			input1 = element("input");
    			attr_dev(a0, "href", "#platform");
    			add_location(a0, file$3, 17, 16, 317);
    			add_location(li0, file$3, 17, 12, 313);
    			attr_dev(a1, "href", "#ehs");
    			add_location(a1, file$3, 18, 16, 410);
    			add_location(li1, file$3, 18, 12, 406);
    			attr_dev(a2, "href", "#ehs/incidents");
    			add_location(a2, file$3, 19, 16, 487);
    			add_location(li2, file$3, 19, 12, 483);
    			add_location(li3, file$3, 20, 12, 582);
    			attr_dev(ul0, "class", "breadcrumb");
    			add_location(ul0, file$3, 16, 8, 277);
    			attr_dev(div0, "class", "col12 col-md-6");
    			add_location(div0, file$3, 15, 4, 240);
    			attr_dev(a3, "href", "/");
    			attr_dev(a3, "class", "i-trash i-24");
    			add_location(a3, file$3, 24, 8, 672);
    			attr_dev(a4, "href", "/");
    			attr_dev(a4, "class", "i-actions i-24");
    			add_location(a4, file$3, 25, 8, 719);
    			attr_dev(a5, "href", "/");
    			attr_dev(a5, "class", "i-attachment i-24");
    			add_location(a5, file$3, 26, 8, 768);
    			attr_dev(a6, "href", "/");
    			attr_dev(a6, "class", "i-printer i-24");
    			add_location(a6, file$3, 27, 8, 820);
    			attr_dev(a7, "href", "/");
    			attr_dev(a7, "class", "btn btn-secondary");
    			add_location(a7, file$3, 28, 8, 869);
    			attr_dev(a8, "href", "/");
    			attr_dev(a8, "class", "btn");
    			add_location(a8, file$3, 29, 8, 933);
    			attr_dev(div1, "class", "col12 col-md-6 text-right");
    			add_location(div1, file$3, 23, 4, 624);
    			attr_dev(div2, "class", "row sticky");
    			add_location(div2, file$3, 14, 0, 211);
    			attr_dev(i, "class", "i-incidents i-32");
    			add_location(i, file$3, 34, 12, 1049);
    			add_location(h10, file$3, 34, 8, 1045);
    			attr_dev(div3, "class", "card-body");
    			add_location(div3, file$3, 36, 12, 1135);
    			attr_dev(div4, "class", "card");
    			add_location(div4, file$3, 35, 8, 1104);
    			attr_dev(h40, "class", "svelte-nakteb");
    			add_location(h40, file$3, 40, 8, 1223);
    			attr_dev(li4, "class", "svelte-nakteb");
    			toggle_class(li4, "active", /*tab*/ ctx[0] == "report");
    			add_location(li4, file$3, 42, 12, 1280);
    			attr_dev(li5, "class", "svelte-nakteb");
    			add_location(li5, file$3, 43, 12, 1341);
    			attr_dev(ul1, "class", "side_menu svelte-nakteb");
    			add_location(ul1, file$3, 41, 8, 1245);
    			attr_dev(h41, "class", "svelte-nakteb");
    			add_location(h41, file$3, 45, 8, 1379);
    			attr_dev(li6, "class", "svelte-nakteb");
    			add_location(li6, file$3, 47, 12, 1437);
    			attr_dev(li7, "class", "svelte-nakteb");
    			add_location(li7, file$3, 48, 12, 1468);
    			attr_dev(li8, "class", "svelte-nakteb");
    			add_location(li8, file$3, 49, 12, 1498);
    			attr_dev(li9, "class", "svelte-nakteb");
    			add_location(li9, file$3, 50, 12, 1531);
    			attr_dev(li10, "class", "svelte-nakteb");
    			add_location(li10, file$3, 51, 12, 1558);
    			attr_dev(ul2, "class", "side_menu svelte-nakteb");
    			add_location(ul2, file$3, 46, 8, 1402);
    			attr_dev(div5, "class", "col12 col-md-3");
    			add_location(div5, file$3, 33, 4, 1008);
    			add_location(h11, file$3, 55, 8, 1639);
    			attr_dev(h42, "class", "svelte-nakteb");
    			add_location(h42, file$3, 58, 16, 1739);
    			add_location(label0, file$3, 61, 20, 1825);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "form-control");
    			add_location(input0, file$3, 62, 20, 1865);
    			attr_dev(div6, "class", "form-item");
    			add_location(div6, file$3, 60, 16, 1781);
    			add_location(label1, file$3, 65, 20, 1989);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "class", "form-control");
    			add_location(input1, file$3, 66, 20, 2047);
    			attr_dev(div7, "class", "form-item");
    			add_location(div7, file$3, 64, 16, 1945);
    			attr_dev(div8, "class", "card-body form");
    			add_location(div8, file$3, 57, 12, 1694);
    			attr_dev(div9, "class", "card");
    			add_location(div9, file$3, 56, 8, 1663);
    			attr_dev(div10, "class", "col12 col-md-9");
    			add_location(div10, file$3, 54, 4, 1602);
    			attr_dev(div11, "class", "row");
    			add_location(div11, file$3, 32, 0, 986);
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
    			insert_dev(target, div11, anchor);
    			append_dev(div11, div5);
    			append_dev(div5, h10);
    			append_dev(h10, i);
    			append_dev(h10, t16);
    			append_dev(div5, t17);
    			append_dev(div5, div4);
    			append_dev(div4, div3);
    			append_dev(div5, t19);
    			append_dev(div5, h40);
    			append_dev(div5, t21);
    			append_dev(div5, ul1);
    			append_dev(ul1, li4);
    			append_dev(ul1, t23);
    			append_dev(ul1, li5);
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
    			append_dev(div11, t37);
    			append_dev(div11, div10);
    			append_dev(div10, h11);
    			append_dev(div10, t39);
    			append_dev(div10, div9);
    			append_dev(div9, div8);
    			append_dev(div8, h42);
    			append_dev(div8, t41);
    			append_dev(div8, div6);
    			append_dev(div6, label0);
    			append_dev(div6, t43);
    			append_dev(div6, input0);
    			append_dev(div8, t44);
    			append_dev(div8, div7);
    			append_dev(div7, label1);
    			append_dev(div7, t46);
    			append_dev(div7, input1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(a0, "click", /*click_handler*/ ctx[2], false, false, false),
    					listen_dev(a1, "click", /*click_handler_1*/ ctx[3], false, false, false),
    					listen_dev(a2, "click", /*click_handler_2*/ ctx[4], false, false, false)
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
    			if (detaching) detach_dev(div11);
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
    	let tab = "report";

    	function nav(str) {
    		dispatch("nav", { text: str });
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Frame_incidents_new> was created with unknown prop '${key}'`);
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

    class Frame_incidents_new extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Frame_incidents_new",
    			options,
    			id: create_fragment$3.name
    		});
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
    const file = "src/Frame.svelte";

    // (58:0) {#if grid}
    function create_if_block(ctx) {
    	let div1;
    	let div0;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(div0, "class", "frame svelte-1s2lye6");
    			add_location(div0, file, 58, 18, 1401);
    			attr_dev(div1, "class", "grid svelte-1s2lye6");
    			add_location(div1, file, 58, 0, 1383);
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
    		source: "(58:0) {#if grid}",
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
    			add_location(path0, file, 65, 3, 1623);
    			attr_dev(path1, "d", "M39.292 22.0918V8.0918H48.252V10.1018H41.552V13.9918H47.632V16.0018H41.552V20.0918H48.252V22.0918H39.292Z");
    			attr_dev(path1, "fill", "black");
    			add_location(path1, file, 66, 3, 2771);
    			attr_dev(path2, "d", "M54.6821 22.3318C53.9321 22.3318 53.2621 22.2018 52.6721 21.9518C52.0821 21.7018 51.5922 21.3318 51.1922 20.8618C50.7922 20.3918 50.4821 19.8118 50.2721 19.1418C50.0621 18.4718 49.9521 17.7118 49.9521 16.8818C49.9521 16.0518 50.0621 15.3018 50.2721 14.6218C50.4821 13.9518 50.7922 13.3718 51.1922 12.9018C51.5922 12.4318 52.0921 12.0618 52.6721 11.8118C53.2621 11.5618 53.9321 11.4318 54.6821 11.4318C55.7221 11.4318 56.5821 11.6618 57.2521 12.1318C57.9221 12.6018 58.4121 13.2218 58.7121 14.0018L56.9121 14.8418C56.7621 14.3618 56.5121 13.9718 56.1421 13.6918C55.7721 13.4018 55.2922 13.2618 54.6922 13.2618C53.8922 13.2618 53.2822 13.5118 52.8722 14.0118C52.4622 14.5118 52.2621 15.1618 52.2621 15.9618V17.8218C52.2621 18.6218 52.4622 19.2718 52.8722 19.7718C53.2822 20.2718 53.8822 20.5218 54.6922 20.5218C55.3321 20.5218 55.8421 20.3618 56.2221 20.0518C56.6021 19.7418 56.9021 19.3218 57.1321 18.8018L58.7921 19.6818C58.4421 20.5418 57.9221 21.2018 57.2321 21.6618C56.5321 22.1018 55.6821 22.3318 54.6821 22.3318Z");
    			attr_dev(path2, "fill", "black");
    			add_location(path2, file, 67, 3, 2905);
    			attr_dev(path3, "d", "M64.8518 22.3318C64.1318 22.3318 63.4718 22.2018 62.8818 21.9518C62.2818 21.7018 61.7818 21.3318 61.3718 20.8618C60.9518 20.3918 60.6318 19.8118 60.4118 19.1418C60.1818 18.4718 60.0718 17.7118 60.0718 16.8818C60.0718 16.0518 60.1818 15.3018 60.4118 14.6218C60.6418 13.9518 60.9618 13.3718 61.3718 12.9018C61.7818 12.4318 62.2918 12.0618 62.8818 11.8118C63.4718 11.5618 64.1318 11.4318 64.8518 11.4318C65.5718 11.4318 66.2318 11.5618 66.8318 11.8118C67.4218 12.0618 67.9318 12.4318 68.3418 12.9018C68.7518 13.3718 69.0818 13.9518 69.3018 14.6218C69.5318 15.3018 69.6418 16.0518 69.6418 16.8818C69.6418 17.7118 69.5318 18.4618 69.3018 19.1418C69.0718 19.8218 68.7518 20.3918 68.3418 20.8618C67.9318 21.3318 67.4218 21.7018 66.8318 21.9518C66.2318 22.2018 65.5718 22.3318 64.8518 22.3318ZM64.8518 20.5018C65.6018 20.5018 66.2018 20.2718 66.6618 19.8118C67.1118 19.3518 67.3418 18.6618 67.3418 17.7518V15.9918C67.3418 15.0718 67.1118 14.3918 66.6618 13.9318C66.2018 13.4718 65.6018 13.2418 64.8518 13.2418C64.1018 13.2418 63.5018 13.4718 63.0518 13.9318C62.6018 14.3918 62.3718 15.0818 62.3718 15.9918V17.7518C62.3718 18.6718 62.6018 19.3518 63.0518 19.8118C63.5018 20.2718 64.1018 20.5018 64.8518 20.5018Z");
    			attr_dev(path3, "fill", "black");
    			add_location(path3, file, 68, 3, 3951);
    			attr_dev(path4, "d", "M77.832 22.3318C76.922 22.3318 76.092 22.1718 75.352 21.8618C74.612 21.5518 73.972 21.0918 73.442 20.4818C72.912 19.8718 72.502 19.1218 72.222 18.2118C71.932 17.3118 71.792 16.2718 71.792 15.0918C71.792 13.9118 71.932 12.8718 72.222 11.9718C72.512 11.0718 72.912 10.3118 73.442 9.70181C73.972 9.09181 74.602 8.63181 75.352 8.32181C76.092 8.01181 76.922 7.85181 77.832 7.85181C78.742 7.85181 79.562 8.01181 80.312 8.32181C81.052 8.63181 81.692 9.10181 82.222 9.70181C82.752 10.3118 83.162 11.0618 83.442 11.9718C83.732 12.8718 83.872 13.9118 83.872 15.0918C83.872 16.2718 83.732 17.3118 83.442 18.2118C83.152 19.1118 82.742 19.8718 82.222 20.4818C81.692 21.0918 81.062 21.5518 80.312 21.8618C79.562 22.1718 78.742 22.3318 77.832 22.3318ZM77.832 20.3218C78.362 20.3218 78.862 20.2318 79.302 20.0418C79.752 19.8518 80.132 19.5818 80.442 19.2218C80.752 18.8618 81.002 18.4318 81.172 17.9218C81.342 17.4118 81.432 16.8318 81.432 16.1918V13.9818C81.432 13.3418 81.342 12.7618 81.172 12.2518C81.002 11.7418 80.752 11.3118 80.442 10.9518C80.132 10.5918 79.742 10.3218 79.302 10.1318C78.852 9.94181 78.362 9.85181 77.832 9.85181C77.282 9.85181 76.792 9.94181 76.352 10.1318C75.912 10.3218 75.532 10.5918 75.222 10.9518C74.912 11.3118 74.662 11.7418 74.492 12.2518C74.322 12.7618 74.232 13.3418 74.232 13.9818V16.1918C74.232 16.8318 74.322 17.4118 74.492 17.9218C74.662 18.4318 74.912 18.8618 75.222 19.2218C75.532 19.5818 75.912 19.8518 76.352 20.0418C76.782 20.2318 77.282 20.3218 77.832 20.3218Z");
    			attr_dev(path4, "fill", "black");
    			add_location(path4, file, 69, 3, 5182);
    			attr_dev(path5, "d", "M86.1421 22.0918V11.6618H88.3321V13.3918H88.4321C88.6621 12.8318 89.0021 12.3618 89.4621 11.9918C89.9221 11.6218 90.5521 11.4318 91.3521 11.4318C92.4221 11.4318 93.2521 11.7818 93.8521 12.4818C94.4421 13.1818 94.7421 14.1818 94.7421 15.4818V22.0918H92.5521V15.7518C92.5521 14.1218 91.8921 13.3018 90.5821 13.3018C90.3021 13.3018 90.0221 13.3418 89.7521 13.4118C89.4821 13.4818 89.2321 13.5918 89.0221 13.7418C88.8121 13.8918 88.6421 14.0718 88.5121 14.3018C88.3821 14.5318 88.3221 14.7918 88.3221 15.1018V22.0918H86.1421Z");
    			attr_dev(path5, "fill", "black");
    			add_location(path5, file, 70, 3, 6699);
    			attr_dev(path6, "d", "M99.7522 22.0918C99.0022 22.0918 98.4422 21.9018 98.0822 21.5218C97.7122 21.1418 97.5322 20.6118 97.5322 19.9318V7.25183H99.7222V20.3018H101.162V22.0918H99.7522Z");
    			attr_dev(path6, "fill", "black");
    			add_location(path6, file, 71, 3, 7249);
    			attr_dev(path7, "d", "M104.102 9.80181C103.652 9.80181 103.312 9.69181 103.112 9.48181C102.902 9.27181 102.802 8.99181 102.802 8.66181V8.31181C102.802 7.98181 102.902 7.70181 103.112 7.49181C103.322 7.28181 103.652 7.17181 104.102 7.17181C104.552 7.17181 104.882 7.28181 105.082 7.49181C105.282 7.70181 105.382 7.98181 105.382 8.31181V8.65181C105.382 8.98181 105.282 9.26181 105.082 9.47181C104.882 9.69181 104.562 9.80181 104.102 9.80181ZM103.002 11.6618H105.192V22.0918H103.002V11.6618Z");
    			attr_dev(path7, "fill", "black");
    			add_location(path7, file, 72, 3, 7439);
    			attr_dev(path8, "d", "M108.052 22.0918V11.6618H110.242V13.3918H110.342C110.572 12.8318 110.912 12.3618 111.372 11.9918C111.832 11.6218 112.462 11.4318 113.262 11.4318C114.332 11.4318 115.162 11.7818 115.762 12.4818C116.352 13.1818 116.652 14.1818 116.652 15.4818V22.0918H114.462V15.7518C114.462 14.1218 113.802 13.3018 112.492 13.3018C112.212 13.3018 111.932 13.3418 111.662 13.4118C111.392 13.4818 111.142 13.5918 110.932 13.7418C110.722 13.8918 110.552 14.0718 110.422 14.3018C110.292 14.5318 110.232 14.7918 110.232 15.1018V22.0918H108.052Z");
    			attr_dev(path8, "fill", "black");
    			add_location(path8, file, 73, 3, 7934);
    			attr_dev(path9, "d", "M123.662 22.3318C122.912 22.3318 122.242 22.2018 121.652 21.9518C121.062 21.7018 120.562 21.3318 120.152 20.8618C119.742 20.3918 119.422 19.8118 119.202 19.1418C118.982 18.4718 118.872 17.7118 118.872 16.8818C118.872 16.0518 118.982 15.3018 119.202 14.6218C119.422 13.9518 119.742 13.3718 120.152 12.9018C120.562 12.4318 121.072 12.0618 121.652 11.8118C122.242 11.5618 122.912 11.4318 123.662 11.4318C124.422 11.4318 125.092 11.5618 125.682 11.8318C126.262 12.1018 126.752 12.4718 127.132 12.9418C127.512 13.4118 127.812 13.9718 128.002 14.5918C128.192 15.2218 128.292 15.8918 128.292 16.6218V17.4418H121.132V17.7818C121.132 18.5818 121.372 19.2318 121.842 19.7418C122.312 20.2518 122.992 20.5118 123.882 20.5118C124.522 20.5118 125.062 20.3718 125.502 20.0918C125.942 19.8118 126.312 19.4318 126.622 18.9518L127.902 20.2218C127.512 20.8618 126.952 21.3818 126.222 21.7618C125.492 22.1418 124.632 22.3318 123.662 22.3318ZM123.662 13.1218C123.292 13.1218 122.942 13.1918 122.632 13.3218C122.322 13.4518 122.052 13.6418 121.832 13.8818C121.612 14.1218 121.442 14.4118 121.322 14.7418C121.202 15.0718 121.142 15.4418 121.142 15.8418V15.9818H125.992V15.7818C125.992 14.9818 125.782 14.3318 125.372 13.8518C124.952 13.3718 124.382 13.1218 123.662 13.1218Z");
    			attr_dev(path9, "fill", "black");
    			add_location(path9, file, 74, 3, 8484);
    			attr_dev(svg, "width", "129");
    			attr_dev(svg, "height", "33");
    			attr_dev(svg, "viewBox", "0 0 129 33");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file, 64, 2, 1470);
    			attr_dev(i0, "class", "i-search i-20");
    			add_location(i0, file, 78, 3, 9800);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "Type a keyword to begin your search");
    			add_location(input, file, 79, 3, 9833);
    			attr_dev(div0, "class", "search-bar");
    			add_location(div0, file, 77, 2, 9772);
    			attr_dev(i1, "class", "i-rocket i-24");
    			add_location(i1, file, 83, 27, 9979);
    			attr_dev(span0, "class", "menu-icon");
    			add_location(span0, file, 83, 3, 9955);
    			attr_dev(i2, "class", "i-filter i-24");
    			add_location(i2, file, 84, 27, 10043);
    			attr_dev(span1, "class", "menu-icon");
    			add_location(span1, file, 84, 3, 10019);
    			attr_dev(i3, "class", "i-notification i-24");
    			add_location(i3, file, 85, 27, 10107);
    			attr_dev(span2, "class", "menu-icon");
    			add_location(span2, file, 85, 3, 10083);
    			attr_dev(i4, "class", "i-hinton-plot i-24");
    			add_location(i4, file, 86, 27, 10177);
    			attr_dev(span3, "class", "menu-icon");
    			add_location(span3, file, 86, 3, 10153);
    			attr_dev(span4, "class", "menu-icon profile-picture");
    			add_location(span4, file, 87, 3, 10222);
    			attr_dev(i5, "class", "i-menu i-24");
    			add_location(i5, file, 89, 34, 10306);
    			attr_dev(span5, "class", "menu-icon mobile");
    			add_location(span5, file, 89, 3, 10275);
    			attr_dev(div1, "class", "menu-icons text-right");
    			add_location(div1, file, 82, 2, 9916);
    			attr_dev(div2, "class", "frame svelte-1s2lye6");
    			add_location(div2, file, 62, 1, 1447);
    			attr_dev(nav, "class", "svelte-1s2lye6");
    			add_location(nav, file, 60, 0, 1439);
    			attr_dev(div3, "class", "frame svelte-1s2lye6");
    			add_location(div3, file, 98, 1, 10380);
    			attr_dev(main, "class", "svelte-1s2lye6");
    			add_location(main, file, 97, 0, 10372);
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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Frame> was created with unknown prop '${key}'`);
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
