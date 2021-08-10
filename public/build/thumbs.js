
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
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
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

    let current_component;
    function set_current_component(component) {
        current_component = component;
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
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
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

    /* src/Thumbs.svelte generated by Svelte v3.35.0 */

    const file = "src/Thumbs.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (34:6) {#each thumb_types as th}
    function create_each_block(ctx) {
    	let option;
    	let t0_value = /*th*/ ctx[3] + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = /*th*/ ctx[3];
    			option.value = option.__value;
    			add_location(option, file, 34, 7, 476);
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
    		id: create_each_block.name,
    		type: "each",
    		source: "(34:6) {#each thumb_types as th}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div9;
    	let table;
    	let tbody;
    	let tr0;
    	let td0;
    	let t1;
    	let td1;
    	let t3;
    	let tr1;
    	let td2;
    	let t5;
    	let td3;
    	let t7;
    	let tr2;
    	let td4;
    	let t9;
    	let td5;
    	let t11;
    	let tr3;
    	let td6;
    	let select;
    	let t12;
    	let tr4;
    	let td7;
    	let div8;
    	let div0;
    	let img0;
    	let img0_src_value;
    	let t13;
    	let div1;
    	let img1;
    	let img1_src_value;
    	let t14;
    	let div2;
    	let img2;
    	let img2_src_value;
    	let t15;
    	let div3;
    	let img3;
    	let img3_src_value;
    	let t16;
    	let div4;
    	let img4;
    	let img4_src_value;
    	let t17;
    	let div5;
    	let img5;
    	let img5_src_value;
    	let t18;
    	let div6;
    	let img6;
    	let img6_src_value;
    	let t19;
    	let div7;
    	let img7;
    	let img7_src_value;
    	let mounted;
    	let dispose;
    	let each_value = /*thumb_types*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div9 = element("div");
    			table = element("table");
    			tbody = element("tbody");
    			tr0 = element("tr");
    			td0 = element("td");
    			td0.textContent = "Attribute";
    			t1 = space();
    			td1 = element("td");
    			td1.textContent = "Value";
    			t3 = space();
    			tr1 = element("tr");
    			td2 = element("td");
    			td2.textContent = "Attribute";
    			t5 = space();
    			td3 = element("td");
    			td3.textContent = "Value";
    			t7 = space();
    			tr2 = element("tr");
    			td4 = element("td");
    			td4.textContent = "Attribute";
    			t9 = space();
    			td5 = element("td");
    			td5.textContent = "Value";
    			t11 = space();
    			tr3 = element("tr");
    			td6 = element("td");
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t12 = space();
    			tr4 = element("tr");
    			td7 = element("td");
    			div8 = element("div");
    			div0 = element("div");
    			img0 = element("img");
    			t13 = space();
    			div1 = element("div");
    			img1 = element("img");
    			t14 = space();
    			div2 = element("div");
    			img2 = element("img");
    			t15 = space();
    			div3 = element("div");
    			img3 = element("img");
    			t16 = space();
    			div4 = element("div");
    			img4 = element("img");
    			t17 = space();
    			div5 = element("div");
    			img5 = element("img");
    			t18 = space();
    			div6 = element("div");
    			img6 = element("img");
    			t19 = space();
    			div7 = element("div");
    			img7 = element("img");
    			attr_dev(td0, "class", "svelte-1eaz4h1");
    			add_location(td0, file, 19, 4, 205);
    			attr_dev(td1, "class", "svelte-1eaz4h1");
    			add_location(td1, file, 20, 4, 228);
    			add_location(tr0, file, 18, 3, 196);
    			attr_dev(td2, "class", "svelte-1eaz4h1");
    			add_location(td2, file, 23, 4, 264);
    			attr_dev(td3, "class", "svelte-1eaz4h1");
    			add_location(td3, file, 24, 4, 287);
    			add_location(tr1, file, 22, 3, 255);
    			attr_dev(td4, "class", "svelte-1eaz4h1");
    			add_location(td4, file, 27, 4, 323);
    			attr_dev(td5, "class", "svelte-1eaz4h1");
    			add_location(td5, file, 28, 4, 346);
    			add_location(tr2, file, 26, 3, 314);
    			if (/*thumb_type*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[2].call(select));
    			add_location(select, file, 32, 5, 404);
    			attr_dev(td6, "colspan", "2");
    			attr_dev(td6, "class", "svelte-1eaz4h1");
    			add_location(td6, file, 31, 4, 382);
    			add_location(tr3, file, 30, 3, 373);
    			if (img0.src !== (img0_src_value = "./images/marvel/captain_portrait.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "captain_portrait");
    			attr_dev(img0, "class", "svelte-1eaz4h1");
    			add_location(img0, file, 51, 7, 997);
    			attr_dev(div0, "class", "thumb svelte-1eaz4h1");
    			set_style(div0, "background-image", "url('./images/marvel/captain_portrait.png')");
    			add_location(div0, file, 50, 6, 900);
    			if (img1.src !== (img1_src_value = "./images/marvel/ironman_landscape.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "ironman_landscape");
    			attr_dev(img1, "class", "svelte-1eaz4h1");
    			add_location(img1, file, 54, 7, 1188);
    			attr_dev(div1, "class", "thumb svelte-1eaz4h1");
    			set_style(div1, "background-image", "url('./images/marvel/ironman_landscape.png')");
    			add_location(div1, file, 53, 6, 1090);
    			if (img2.src !== (img2_src_value = "./images/marvel/groot_portrait_skinny.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "groot_portrait_skinny");
    			attr_dev(img2, "class", "svelte-1eaz4h1");
    			add_location(img2, file, 57, 7, 1385);
    			attr_dev(div2, "class", "thumb svelte-1eaz4h1");
    			set_style(div2, "background-image", "url('./images/marvel/groot_portrait_skinny.png')");
    			add_location(div2, file, 56, 6, 1283);
    			if (img3.src !== (img3_src_value = "./images/marvel/spiderman_landscape_skinny.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "spiderman_landscape_skinny");
    			attr_dev(img3, "class", "svelte-1eaz4h1");
    			add_location(img3, file, 60, 7, 1595);
    			attr_dev(div3, "class", "thumb svelte-1eaz4h1");
    			set_style(div3, "background-image", "url('./images/marvel/spiderman_landscape_skinny.png')");
    			add_location(div3, file, 59, 6, 1488);
    			if (img4.src !== (img4_src_value = "./images/marvel/rogue_portrait.png")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "rogue_portrait");
    			attr_dev(img4, "class", "svelte-1eaz4h1");
    			add_location(img4, file, 65, 7, 1805);
    			attr_dev(div4, "class", "thumb svelte-1eaz4h1");
    			set_style(div4, "background-image", "url('./images/marvel/rogue_portrait.png')");
    			add_location(div4, file, 64, 6, 1710);
    			if (img5.src !== (img5_src_value = "./images/marvel/rocket_landscape.png")) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "alt", "rocket_landscape");
    			attr_dev(img5, "class", "svelte-1eaz4h1");
    			add_location(img5, file, 68, 7, 1991);
    			attr_dev(div5, "class", "thumb svelte-1eaz4h1");
    			set_style(div5, "background-image", "url('./images/marvel/rocket_landscape.png')");
    			add_location(div5, file, 67, 6, 1894);
    			if (img6.src !== (img6_src_value = "./images/marvel/spiderman_landscape_skinny.png")) attr_dev(img6, "src", img6_src_value);
    			attr_dev(img6, "alt", "spiderman_landscape_skinny");
    			attr_dev(img6, "class", "svelte-1eaz4h1");
    			add_location(img6, file, 71, 7, 2191);
    			attr_dev(div6, "class", "thumb svelte-1eaz4h1");
    			set_style(div6, "background-image", "url('./images/marvel/spiderman_landscape_skinny.png')");
    			add_location(div6, file, 70, 6, 2084);
    			if (img7.src !== (img7_src_value = "./images/marvel/ironman_landscape.png")) attr_dev(img7, "src", img7_src_value);
    			attr_dev(img7, "alt", "ironman_landscape");
    			attr_dev(img7, "class", "svelte-1eaz4h1");
    			add_location(img7, file, 74, 7, 2402);
    			attr_dev(div7, "class", "thumb svelte-1eaz4h1");
    			set_style(div7, "background-image", "url('./images/marvel/ironman_landscape.png')");
    			add_location(div7, file, 73, 6, 2304);
    			attr_dev(div8, "class", "thumbs svelte-1eaz4h1");
    			toggle_class(div8, "normal", /*thumb_type*/ ctx[0] == "normal");
    			toggle_class(div8, "fixed_widths", /*thumb_type*/ ctx[0] == "fixed_widths");
    			toggle_class(div8, "fixed_heights", /*thumb_type*/ ctx[0] == "fixed_heights");
    			toggle_class(div8, "cover", /*thumb_type*/ ctx[0] == "cover");
    			toggle_class(div8, "squashed", /*thumb_type*/ ctx[0] == "squashed");
    			add_location(div8, file, 43, 5, 608);
    			attr_dev(td7, "colspan", "2");
    			attr_dev(td7, "class", "svelte-1eaz4h1");
    			add_location(td7, file, 42, 4, 586);
    			add_location(tr4, file, 41, 3, 577);
    			add_location(tbody, file, 17, 2, 185);
    			attr_dev(table, "class", "svelte-1eaz4h1");
    			add_location(table, file, 16, 1, 175);
    			attr_dev(div9, "class", "page svelte-1eaz4h1");
    			add_location(div9, file, 15, 0, 155);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div9, anchor);
    			append_dev(div9, table);
    			append_dev(table, tbody);
    			append_dev(tbody, tr0);
    			append_dev(tr0, td0);
    			append_dev(tr0, t1);
    			append_dev(tr0, td1);
    			append_dev(tbody, t3);
    			append_dev(tbody, tr1);
    			append_dev(tr1, td2);
    			append_dev(tr1, t5);
    			append_dev(tr1, td3);
    			append_dev(tbody, t7);
    			append_dev(tbody, tr2);
    			append_dev(tr2, td4);
    			append_dev(tr2, t9);
    			append_dev(tr2, td5);
    			append_dev(tbody, t11);
    			append_dev(tbody, tr3);
    			append_dev(tr3, td6);
    			append_dev(td6, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*thumb_type*/ ctx[0]);
    			append_dev(tbody, t12);
    			append_dev(tbody, tr4);
    			append_dev(tr4, td7);
    			append_dev(td7, div8);
    			append_dev(div8, div0);
    			append_dev(div0, img0);
    			append_dev(div8, t13);
    			append_dev(div8, div1);
    			append_dev(div1, img1);
    			append_dev(div8, t14);
    			append_dev(div8, div2);
    			append_dev(div2, img2);
    			append_dev(div8, t15);
    			append_dev(div8, div3);
    			append_dev(div3, img3);
    			append_dev(div8, t16);
    			append_dev(div8, div4);
    			append_dev(div4, img4);
    			append_dev(div8, t17);
    			append_dev(div8, div5);
    			append_dev(div5, img5);
    			append_dev(div8, t18);
    			append_dev(div8, div6);
    			append_dev(div6, img6);
    			append_dev(div8, t19);
    			append_dev(div8, div7);
    			append_dev(div7, img7);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[2]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*thumb_types*/ 2) {
    				each_value = /*thumb_types*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*thumb_type, thumb_types*/ 3) {
    				select_option(select, /*thumb_type*/ ctx[0]);
    			}

    			if (dirty & /*thumb_type*/ 1) {
    				toggle_class(div8, "normal", /*thumb_type*/ ctx[0] == "normal");
    			}

    			if (dirty & /*thumb_type*/ 1) {
    				toggle_class(div8, "fixed_widths", /*thumb_type*/ ctx[0] == "fixed_widths");
    			}

    			if (dirty & /*thumb_type*/ 1) {
    				toggle_class(div8, "fixed_heights", /*thumb_type*/ ctx[0] == "fixed_heights");
    			}

    			if (dirty & /*thumb_type*/ 1) {
    				toggle_class(div8, "cover", /*thumb_type*/ ctx[0] == "cover");
    			}

    			if (dirty & /*thumb_type*/ 1) {
    				toggle_class(div8, "squashed", /*thumb_type*/ ctx[0] == "squashed");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div9);
    			destroy_each(each_blocks, detaching);
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
    	validate_slots("Thumbs", slots, []);
    	let thumb_types = ["normal", "fixed_widths", "fixed_heights", "cover", "squashed"];
    	let thumb_type = thumb_types[0];
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Thumbs> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		thumb_type = select_value(this);
    		$$invalidate(0, thumb_type);
    		$$invalidate(1, thumb_types);
    	}

    	$$self.$capture_state = () => ({ thumb_types, thumb_type });

    	$$self.$inject_state = $$props => {
    		if ("thumb_types" in $$props) $$invalidate(1, thumb_types = $$props.thumb_types);
    		if ("thumb_type" in $$props) $$invalidate(0, thumb_type = $$props.thumb_type);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [thumb_type, thumb_types, select_change_handler];
    }

    class Thumbs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Thumbs",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new Thumbs({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=thumbs.js.map
