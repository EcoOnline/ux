
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
    function to_number(value) {
        return value === '' ? null : +value;
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

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
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

    /* src/Grid.svelte generated by Svelte v3.35.0 */

    const { console: console_1 } = globals;
    const file = "src/Grid.svelte";

    function create_fragment(ctx) {
    	let div3;
    	let div2;
    	let div1;
    	let svg0;
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
    	let t0;
    	let div0;
    	let svg1;
    	let circle;
    	let path10;
    	let t1;
    	let div37;
    	let div36;
    	let p;
    	let input0;
    	let t2;
    	let t3;
    	let br0;
    	let t4;
    	let input1;
    	let t5;
    	let br1;
    	let t6;
    	let input2;
    	let t7;
    	let br2;
    	let t8;
    	let input3;
    	let t9;
    	let br3;
    	let t10;
    	let input4;
    	let t11;
    	let br4;
    	let t12;
    	let t13;
    	let t14;
    	let div34;
    	let div17;
    	let h30;
    	let t16;
    	let div16;
    	let div5;
    	let div4;
    	let t17;
    	let b0;
    	let t19;
    	let div7;
    	let div6;
    	let t20;
    	let b1;
    	let t22;
    	let div9;
    	let div8;
    	let t23;
    	let b2;
    	let t25;
    	let span1;
    	let t26;
    	let span0;
    	let t27;
    	let div11;
    	let div10;
    	let t28;
    	let b3;
    	let t30;
    	let span3;
    	let t31;
    	let span2;
    	let t32;
    	let div13;
    	let div12;
    	let t33;
    	let b4;
    	let t35;
    	let span5;
    	let t36;
    	let span4;
    	let t37;
    	let div15;
    	let div14;
    	let t38;
    	let b5;
    	let t40;
    	let div33;
    	let h31;
    	let t42;
    	let div32;
    	let div19;
    	let div18;
    	let t43;
    	let b6;
    	let t45;
    	let div21;
    	let div20;
    	let t46;
    	let b7;
    	let t48;
    	let div23;
    	let div22;
    	let t49;
    	let b8;
    	let t51;
    	let div25;
    	let div24;
    	let t52;
    	let b9;
    	let t54;
    	let div27;
    	let div26;
    	let t55;
    	let b10;
    	let t57;
    	let div29;
    	let div28;
    	let t58;
    	let b11;
    	let t60;
    	let div31;
    	let div30;
    	let t61;
    	let b12;
    	let t63;
    	let div35;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			svg0 = svg_element("svg");
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
    			t0 = space();
    			div0 = element("div");
    			svg1 = svg_element("svg");
    			circle = svg_element("circle");
    			path10 = svg_element("path");
    			t1 = space();
    			div37 = element("div");
    			div36 = element("div");
    			p = element("p");
    			input0 = element("input");
    			t2 = text(/*grid_opacity*/ ctx[5]);
    			t3 = text(" grid opacity");
    			br0 = element("br");
    			t4 = space();
    			input1 = element("input");
    			t5 = text(" cols");
    			br1 = element("br");
    			t6 = space();
    			input2 = element("input");
    			t7 = text(" col_width");
    			br2 = element("br");
    			t8 = space();
    			input3 = element("input");
    			t9 = text(" gutter");
    			br3 = element("br");
    			t10 = space();
    			input4 = element("input");
    			t11 = text(" margin");
    			br4 = element("br");
    			t12 = text("\n\t\t\tpage width: ");
    			t13 = text(/*page_width*/ ctx[6]);
    			t14 = space();
    			div34 = element("div");
    			div17 = element("div");
    			h30 = element("h3");
    			h30.textContent = "Group Header";
    			t16 = space();
    			div16 = element("div");
    			div5 = element("div");
    			div4 = element("div");
    			t17 = space();
    			b0 = element("b");
    			b0.textContent = "Platform";
    			t19 = space();
    			div7 = element("div");
    			div6 = element("div");
    			t20 = space();
    			b1 = element("b");
    			b1.textContent = "EcoOnline EHS";
    			t22 = space();
    			div9 = element("div");
    			div8 = element("div");
    			t23 = space();
    			b2 = element("b");
    			b2.textContent = "Chemical Manager";
    			t25 = space();
    			span1 = element("span");
    			t26 = text("Big Company");
    			span0 = element("span");
    			t27 = space();
    			div11 = element("div");
    			div10 = element("div");
    			t28 = space();
    			b3 = element("b");
    			b3.textContent = "Chemical Manager";
    			t30 = space();
    			span3 = element("span");
    			t31 = text("Little Company");
    			span2 = element("span");
    			t32 = space();
    			div13 = element("div");
    			div12 = element("div");
    			t33 = space();
    			b4 = element("b");
    			b4.textContent = "Chemical Manager";
    			t35 = space();
    			span5 = element("span");
    			t36 = text("Very long company name that doesn't end");
    			span4 = element("span");
    			t37 = space();
    			div15 = element("div");
    			div14 = element("div");
    			t38 = space();
    			b5 = element("b");
    			b5.textContent = "Learning Manager";
    			t40 = space();
    			div33 = element("div");
    			h31 = element("h3");
    			h31.textContent = "Group Header";
    			t42 = space();
    			div32 = element("div");
    			div19 = element("div");
    			div18 = element("div");
    			t43 = space();
    			b6 = element("b");
    			b6.textContent = "Dashboards & Analytics";
    			t45 = space();
    			div21 = element("div");
    			div20 = element("div");
    			t46 = space();
    			b7 = element("b");
    			b7.textContent = "Reseller";
    			t48 = space();
    			div23 = element("div");
    			div22 = element("div");
    			t49 = space();
    			b8 = element("b");
    			b8.textContent = "Publisher";
    			t51 = space();
    			div25 = element("div");
    			div24 = element("div");
    			t52 = space();
    			b9 = element("b");
    			b9.textContent = "Safety Manager";
    			t54 = space();
    			div27 = element("div");
    			div26 = element("div");
    			t55 = space();
    			b10 = element("b");
    			b10.textContent = "Chemdoc";
    			t57 = space();
    			div29 = element("div");
    			div28 = element("div");
    			t58 = space();
    			b11 = element("b");
    			b11.textContent = "Safedoc";
    			t60 = space();
    			div31 = element("div");
    			div30 = element("div");
    			t61 = space();
    			b12 = element("b");
    			b12.textContent = "Chemicontrol";
    			t63 = space();
    			div35 = element("div");
    			attr_dev(path0, "d", "M15.91 10.91L16.5 9.59C16.94 8.62 17.91 8 18.97 8C19.69 8 20.37 8.28 20.88 8.79L21.58 9.49C20.34 10.17 19.5 11.49 19.5 13V14.88C19.5 18.24 17.11 21.13 13.81 21.76L6.91 23.08C6.56 23.15 6.28 23.39 6.16 23.72C6.04 24.05 6.1 24.42 6.32 24.69C10.19 29.48 16.01 30.92 16.26 30.98C16.34 30.99 16.42 31 16.5 31C16.58 31 16.66 30.99 16.73 30.97C16.87 30.94 30 27.64 30 15V3C30 1.9 29.1 1 28 1H5C3.9 1 3 1.9 3 3V18.26L5 16.26V3H28V15C28 25.3 18.22 28.49 16.5 28.96C15.56 28.69 11.96 27.51 9.05 24.7L14.19 23.72C18.43 22.91 21.5 19.19 21.5 14.88V13C21.5 11.9 22.4 11 23.5 11H24.35C24.93 11 25.22 10.3 24.81 9.89L22.3 7.38C21.41 6.49 20.23 6 18.97 6C17.12 6 15.44 7.09 14.68 8.77L14.16 9.92L0 24.09V26.92L15.71 11.21C15.8 11.12 15.86 11.02 15.91 10.91Z");
    			attr_dev(path0, "fill", "#1A1919");
    			attr_dev(path0, "class", "svelte-1ix76wb");
    			add_location(path0, file, 31, 4, 970);
    			attr_dev(path1, "d", "M39 22V8H47.96V10.01H41.26V13.9H47.34V15.91H41.26V20H47.96V22H39Z");
    			attr_dev(path1, "fill", "#1A1919");
    			attr_dev(path1, "class", "svelte-1ix76wb");
    			add_location(path1, file, 32, 4, 1743);
    			attr_dev(path2, "d", "M54.39 22.2398C53.64 22.2398 52.97 22.1098 52.38 21.8598C51.79 21.6098 51.3 21.2398 50.9 20.7698C50.5 20.2998 50.19 19.7198 49.98 19.0498C49.77 18.3798 49.66 17.6198 49.66 16.7898C49.66 15.9598 49.77 15.2098 49.98 14.5298C50.19 13.8598 50.5 13.2798 50.9 12.8098C51.3 12.3398 51.8 11.9698 52.38 11.7198C52.97 11.4698 53.64 11.3398 54.39 11.3398C55.43 11.3398 56.29 11.5698 56.96 12.0398C57.63 12.5098 58.12 13.1298 58.42 13.9098L56.62 14.7498C56.47 14.2698 56.22 13.8798 55.85 13.5998C55.48 13.3098 55 13.1698 54.4 13.1698C53.6 13.1698 52.99 13.4198 52.58 13.9198C52.17 14.4198 51.97 15.0698 51.97 15.8698V17.7298C51.97 18.5298 52.17 19.1798 52.58 19.6798C52.99 20.1798 53.59 20.4298 54.4 20.4298C55.04 20.4298 55.55 20.2698 55.93 19.9598C56.31 19.6498 56.61 19.2298 56.84 18.7098L58.5 19.5898C58.15 20.4498 57.63 21.1098 56.94 21.5698C56.24 22.0098 55.39 22.2398 54.39 22.2398Z");
    			attr_dev(path2, "fill", "#1A1919");
    			attr_dev(path2, "class", "svelte-1ix76wb");
    			add_location(path2, file, 33, 4, 1840);
    			attr_dev(path3, "d", "M64.56 22.2398C63.84 22.2398 63.18 22.1098 62.59 21.8598C61.99 21.6098 61.49 21.2398 61.08 20.7698C60.66 20.2998 60.34 19.7198 60.12 19.0498C59.89 18.3798 59.78 17.6198 59.78 16.7898C59.78 15.9598 59.89 15.2098 60.12 14.5298C60.35 13.8598 60.67 13.2798 61.08 12.8098C61.49 12.3398 62 11.9698 62.59 11.7198C63.18 11.4698 63.84 11.3398 64.56 11.3398C65.28 11.3398 65.94 11.4698 66.54 11.7198C67.13 11.9698 67.64 12.3398 68.05 12.8098C68.46 13.2798 68.79 13.8598 69.01 14.5298C69.24 15.2098 69.35 15.9598 69.35 16.7898C69.35 17.6198 69.24 18.3698 69.01 19.0498C68.78 19.7298 68.46 20.2998 68.05 20.7698C67.64 21.2398 67.13 21.6098 66.54 21.8598C65.94 22.1098 65.28 22.2398 64.56 22.2398ZM64.56 20.4098C65.31 20.4098 65.91 20.1798 66.37 19.7198C66.82 19.2598 67.05 18.5698 67.05 17.6598V15.8998C67.05 14.9798 66.82 14.2998 66.37 13.8398C65.91 13.3798 65.31 13.1498 64.56 13.1498C63.81 13.1498 63.21 13.3798 62.76 13.8398C62.31 14.2998 62.08 14.9898 62.08 15.8998V17.6598C62.08 18.5798 62.31 19.2598 62.76 19.7198C63.21 20.1798 63.81 20.4098 64.56 20.4098Z");
    			attr_dev(path3, "fill", "#1A1919");
    			attr_dev(path3, "class", "svelte-1ix76wb");
    			add_location(path3, file, 34, 4, 2749);
    			attr_dev(path4, "d", "M77.54 22.2403C76.63 22.2403 75.8 22.0803 75.06 21.7703C74.32 21.4603 73.68 21.0003 73.15 20.3903C72.62 19.7803 72.21 19.0303 71.93 18.1203C71.64 17.2203 71.5 16.1803 71.5 15.0003C71.5 13.8203 71.64 12.7803 71.93 11.8803C72.22 10.9803 72.62 10.2203 73.15 9.61025C73.68 9.00025 74.31 8.54025 75.06 8.23025C75.8 7.92025 76.63 7.76025 77.54 7.76025C78.45 7.76025 79.27 7.92025 80.02 8.23025C80.76 8.54025 81.4 9.01025 81.93 9.61025C82.46 10.2203 82.87 10.9703 83.15 11.8803C83.44 12.7803 83.58 13.8203 83.58 15.0003C83.58 16.1803 83.44 17.2203 83.15 18.1203C82.86 19.0203 82.45 19.7803 81.93 20.3903C81.4 21.0003 80.77 21.4603 80.02 21.7703C79.27 22.0803 78.45 22.2403 77.54 22.2403ZM77.54 20.2303C78.07 20.2303 78.57 20.1403 79.01 19.9503C79.46 19.7603 79.84 19.4903 80.15 19.1303C80.46 18.7703 80.71 18.3403 80.88 17.8303C81.05 17.3203 81.14 16.7403 81.14 16.1003V13.8903C81.14 13.2503 81.05 12.6703 80.88 12.1603C80.71 11.6503 80.46 11.2203 80.15 10.8603C79.84 10.5003 79.45 10.2303 79.01 10.0403C78.56 9.85025 78.07 9.76025 77.54 9.76025C76.99 9.76025 76.5 9.85025 76.06 10.0403C75.62 10.2303 75.24 10.5003 74.93 10.8603C74.62 11.2203 74.37 11.6503 74.2 12.1603C74.03 12.6703 73.94 13.2503 73.94 13.8903V16.1003C73.94 16.7403 74.03 17.3203 74.2 17.8303C74.37 18.3403 74.62 18.7703 74.93 19.1303C75.24 19.4903 75.62 19.7603 76.06 19.9503C76.49 20.1403 76.99 20.2303 77.54 20.2303Z");
    			attr_dev(path4, "fill", "#1A1919");
    			attr_dev(path4, "class", "svelte-1ix76wb");
    			add_location(path4, file, 35, 4, 3832);
    			attr_dev(path5, "d", "M85.85 21.9998V11.5698H88.04V13.2998H88.14C88.37 12.7398 88.71 12.2698 89.17 11.8998C89.63 11.5298 90.26 11.3398 91.06 11.3398C92.13 11.3398 92.96 11.6898 93.56 12.3898C94.15 13.0898 94.45 14.0898 94.45 15.3898V21.9998H92.26V15.6598C92.26 14.0298 91.6 13.2098 90.29 13.2098C90.01 13.2098 89.73 13.2498 89.46 13.3198C89.19 13.3898 88.94 13.4998 88.73 13.6498C88.52 13.7998 88.35 13.9798 88.22 14.2098C88.09 14.4398 88.03 14.6998 88.03 15.0098V21.9998H85.85Z");
    			attr_dev(path5, "fill", "#1A1919");
    			attr_dev(path5, "class", "svelte-1ix76wb");
    			add_location(path5, file, 36, 4, 5244);
    			attr_dev(path6, "d", "M99.46 22.0002C98.71 22.0002 98.15 21.8102 97.79 21.4302C97.42 21.0502 97.24 20.5202 97.24 19.8402V7.16016H99.43V20.2102H100.87V22.0002H99.46Z");
    			attr_dev(path6, "fill", "#1A1919");
    			attr_dev(path6, "class", "svelte-1ix76wb");
    			add_location(path6, file, 37, 4, 5732);
    			attr_dev(path7, "d", "M103.81 9.71008C103.36 9.71008 103.02 9.60008 102.82 9.39008C102.61 9.18008 102.51 8.90008 102.51 8.57008V8.22008C102.51 7.89008 102.61 7.61008 102.82 7.40008C103.03 7.19008 103.36 7.08008 103.81 7.08008C104.26 7.08008 104.59 7.19008 104.79 7.40008C104.99 7.61008 105.09 7.89008 105.09 8.22008V8.56008C105.09 8.89008 104.99 9.17008 104.79 9.38008C104.59 9.60008 104.27 9.71008 103.81 9.71008ZM102.71 11.5701H104.9V22.0001H102.71V11.5701Z");
    			attr_dev(path7, "fill", "#1A1919");
    			attr_dev(path7, "class", "svelte-1ix76wb");
    			add_location(path7, file, 38, 4, 5906);
    			attr_dev(path8, "d", "M107.76 21.9998V11.5698H109.95V13.2998H110.05C110.28 12.7398 110.62 12.2698 111.08 11.8998C111.54 11.5298 112.17 11.3398 112.97 11.3398C114.04 11.3398 114.87 11.6898 115.47 12.3898C116.06 13.0898 116.36 14.0898 116.36 15.3898V21.9998H114.17V15.6598C114.17 14.0298 113.51 13.2098 112.2 13.2098C111.92 13.2098 111.64 13.2498 111.37 13.3198C111.1 13.3898 110.85 13.4998 110.64 13.6498C110.43 13.7998 110.26 13.9798 110.13 14.2098C110 14.4398 109.94 14.6998 109.94 15.0098V21.9998H107.76Z");
    			attr_dev(path8, "fill", "#1A1919");
    			attr_dev(path8, "class", "svelte-1ix76wb");
    			add_location(path8, file, 39, 4, 6375);
    			attr_dev(path9, "d", "M123.37 22.2398C122.62 22.2398 121.95 22.1098 121.36 21.8598C120.77 21.6098 120.27 21.2398 119.86 20.7698C119.45 20.2998 119.13 19.7198 118.91 19.0498C118.69 18.3798 118.58 17.6198 118.58 16.7898C118.58 15.9598 118.69 15.2098 118.91 14.5298C119.13 13.8598 119.45 13.2798 119.86 12.8098C120.27 12.3398 120.78 11.9698 121.36 11.7198C121.95 11.4698 122.62 11.3398 123.37 11.3398C124.13 11.3398 124.8 11.4698 125.39 11.7398C125.97 12.0098 126.46 12.3798 126.84 12.8498C127.22 13.3198 127.52 13.8798 127.71 14.4998C127.9 15.1298 128 15.7998 128 16.5298V17.3498H120.84V17.6898C120.84 18.4898 121.08 19.1398 121.55 19.6498C122.02 20.1598 122.7 20.4198 123.59 20.4198C124.23 20.4198 124.77 20.2798 125.21 19.9998C125.65 19.7198 126.02 19.3398 126.33 18.8598L127.61 20.1298C127.22 20.7698 126.66 21.2898 125.93 21.6698C125.2 22.0498 124.34 22.2398 123.37 22.2398ZM123.37 13.0298C123 13.0298 122.65 13.0998 122.34 13.2298C122.03 13.3598 121.76 13.5498 121.54 13.7898C121.32 14.0298 121.15 14.3198 121.03 14.6498C120.91 14.9798 120.85 15.3498 120.85 15.7498V15.8898H125.7V15.6898C125.7 14.8898 125.49 14.2398 125.08 13.7598C124.66 13.2798 124.09 13.0298 123.37 13.0298Z");
    			attr_dev(path9, "fill", "#1A1919");
    			attr_dev(path9, "class", "svelte-1ix76wb");
    			add_location(path9, file, 40, 4, 6891);
    			attr_dev(svg0, "width", "128");
    			attr_dev(svg0, "height", "32");
    			attr_dev(svg0, "viewBox", "0 0 128 32");
    			attr_dev(svg0, "fill", "none");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			set_style(svg0, "margin-top", "12px");
    			set_style(svg0, "margin-right", "16px");
    			attr_dev(svg0, "class", "svelte-1ix76wb");
    			add_location(svg0, file, 30, 3, 826);
    			attr_dev(circle, "cx", "16");
    			attr_dev(circle, "cy", "16");
    			attr_dev(circle, "r", "16");
    			attr_dev(circle, "fill", "#272F96");
    			attr_dev(circle, "class", "svelte-1ix76wb");
    			add_location(circle, file, 46, 5, 8240);
    			attr_dev(path10, "d", "M19.5017 9.936V18.972C19.5017 19.536 19.4057 20.046 19.2137 20.502C19.0337 20.958 18.7697 21.348 18.4217 21.672C18.0857 21.996 17.6717 22.248 17.1797 22.428C16.6877 22.608 16.1357 22.698 15.5237 22.698C14.3597 22.698 13.4537 22.398 12.8057 21.798C12.1577 21.186 11.7437 20.376 11.5637 19.368L13.7597 18.918C13.8677 19.458 14.0597 19.878 14.3357 20.178C14.6237 20.466 15.0137 20.61 15.5057 20.61C15.9737 20.61 16.3577 20.466 16.6577 20.178C16.9697 19.878 17.1257 19.422 17.1257 18.81V11.88H13.1657V9.936H19.5017Z");
    			attr_dev(path10, "fill", "white");
    			attr_dev(path10, "class", "svelte-1ix76wb");
    			add_location(path10, file, 47, 5, 8293);
    			attr_dev(svg1, "width", "32");
    			attr_dev(svg1, "height", "32");
    			attr_dev(svg1, "viewBox", "0 0 32 32");
    			attr_dev(svg1, "fill", "none");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "class", "svelte-1ix76wb");
    			add_location(svg1, file, 45, 4, 8139);
    			set_style(div0, "float", "right");
    			set_style(div0, "margin-top", "12px");
    			attr_dev(div0, "class", "svelte-1ix76wb");
    			add_location(div0, file, 43, 3, 8091);
    			attr_dev(div1, "class", "cols svelte-1ix76wb");
    			set_style(div1, "height", "100%");
    			set_style(div1, "width", /*cols_width*/ ctx[4] + "px");
    			set_style(div1, "max-width", "calc(100% - " + /*outside_margin*/ ctx[3] * 2 + "px)");
    			add_location(div1, file, 29, 2, 717);
    			attr_dev(div2, "class", "page svelte-1ix76wb");
    			set_style(div2, "height", "100%");
    			set_style(div2, "width", /*page_width*/ ctx[6] + "px");
    			set_style(div2, "border-color", "rgba(0,0,0," + /*grid_opacity*/ ctx[5] / 100 + ")");
    			add_location(div2, file, 28, 1, 611);
    			attr_dev(div3, "class", "nav svelte-1ix76wb");
    			add_location(div3, file, 27, 0, 592);
    			attr_dev(input0, "type", "range");
    			attr_dev(input0, "min", "0");
    			attr_dev(input0, "max", "30");
    			attr_dev(input0, "step", "1");
    			attr_dev(input0, "class", "svelte-1ix76wb");
    			add_location(input0, file, 56, 3, 9050);
    			attr_dev(br0, "class", "svelte-1ix76wb");
    			add_location(br0, file, 56, 104, 9151);
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "class", "svelte-1ix76wb");
    			add_location(input1, file, 57, 3, 9159);
    			attr_dev(br1, "class", "svelte-1ix76wb");
    			add_location(br1, file, 57, 52, 9208);
    			attr_dev(input2, "type", "number");
    			attr_dev(input2, "class", "svelte-1ix76wb");
    			add_location(input2, file, 58, 3, 9216);
    			attr_dev(br2, "class", "svelte-1ix76wb");
    			add_location(br2, file, 58, 55, 9268);
    			attr_dev(input3, "type", "number");
    			attr_dev(input3, "class", "svelte-1ix76wb");
    			add_location(input3, file, 59, 3, 9276);
    			attr_dev(br3, "class", "svelte-1ix76wb");
    			add_location(br3, file, 59, 53, 9326);
    			attr_dev(input4, "type", "number");
    			attr_dev(input4, "class", "svelte-1ix76wb");
    			add_location(input4, file, 60, 3, 9334);
    			attr_dev(br4, "class", "svelte-1ix76wb");
    			add_location(br4, file, 60, 61, 9392);
    			attr_dev(p, "class", "svelte-1ix76wb");
    			add_location(p, file, 55, 2, 9043);
    			attr_dev(h30, "class", "svelte-1ix76wb");
    			add_location(h30, file, 66, 4, 9494);
    			attr_dev(div4, "class", "icon svelte-1ix76wb");
    			set_style(div4, "background-image", "url(./images/platform_svgs_clean/platform.svg)");
    			add_location(div4, file, 69, 6, 9579);
    			attr_dev(b0, "class", "svelte-1ix76wb");
    			add_location(b0, file, 70, 6, 9682);
    			attr_dev(div5, "class", "tile svelte-1ix76wb");
    			add_location(div5, file, 68, 5, 9554);
    			attr_dev(div6, "class", "icon svelte-1ix76wb");
    			set_style(div6, "background-image", "url(./images/platform_svgs_clean/ehs.svg)");
    			add_location(div6, file, 73, 6, 9740);
    			attr_dev(b1, "class", "svelte-1ix76wb");
    			add_location(b1, file, 74, 6, 9838);
    			attr_dev(div7, "class", "tile svelte-1ix76wb");
    			add_location(div7, file, 72, 5, 9715);
    			attr_dev(div8, "class", "icon svelte-1ix76wb");
    			set_style(div8, "background-image", "url(./images/platform_svgs_clean/chemical_manager.svg)");
    			add_location(div8, file, 77, 6, 9901);
    			attr_dev(b2, "class", "svelte-1ix76wb");
    			add_location(b2, file, 78, 6, 10012);
    			attr_dev(span0, "class", "svelte-1ix76wb");
    			add_location(span0, file, 79, 23, 10059);
    			attr_dev(span1, "class", "svelte-1ix76wb");
    			add_location(span1, file, 79, 6, 10042);
    			attr_dev(div9, "class", "tile svelte-1ix76wb");
    			add_location(div9, file, 76, 5, 9876);
    			attr_dev(div10, "class", "icon svelte-1ix76wb");
    			set_style(div10, "background-image", "url(./images/platform_svgs_clean/chemical_manager.svg)");
    			add_location(div10, file, 82, 6, 10108);
    			attr_dev(b3, "class", "svelte-1ix76wb");
    			add_location(b3, file, 83, 6, 10219);
    			attr_dev(span2, "class", "svelte-1ix76wb");
    			add_location(span2, file, 84, 26, 10269);
    			attr_dev(span3, "class", "svelte-1ix76wb");
    			add_location(span3, file, 84, 6, 10249);
    			attr_dev(div11, "class", "tile svelte-1ix76wb");
    			add_location(div11, file, 81, 5, 10083);
    			attr_dev(div12, "class", "icon svelte-1ix76wb");
    			set_style(div12, "background-image", "url(./images/platform_svgs_clean/chemical_manager.svg)");
    			add_location(div12, file, 87, 6, 10318);
    			attr_dev(b4, "class", "svelte-1ix76wb");
    			add_location(b4, file, 88, 6, 10429);
    			attr_dev(span4, "class", "svelte-1ix76wb");
    			add_location(span4, file, 89, 51, 10504);
    			attr_dev(span5, "class", "svelte-1ix76wb");
    			add_location(span5, file, 89, 6, 10459);
    			attr_dev(div13, "class", "tile svelte-1ix76wb");
    			add_location(div13, file, 86, 5, 10293);
    			attr_dev(div14, "class", "icon svelte-1ix76wb");
    			set_style(div14, "background-image", "url(./images/platform_svgs_clean/learning_manager.svg)");
    			add_location(div14, file, 92, 6, 10553);
    			attr_dev(b5, "class", "svelte-1ix76wb");
    			add_location(b5, file, 93, 6, 10664);
    			attr_dev(div15, "class", "tile svelte-1ix76wb");
    			add_location(div15, file, 91, 5, 10528);
    			attr_dev(div16, "class", "tile-container svelte-1ix76wb");
    			add_location(div16, file, 67, 4, 9520);
    			attr_dev(div17, "class", "col-full col-m-half svelte-1ix76wb");
    			add_location(div17, file, 65, 3, 9456);
    			attr_dev(h31, "class", "svelte-1ix76wb");
    			add_location(h31, file, 99, 4, 10768);
    			attr_dev(div18, "class", "icon svelte-1ix76wb");
    			set_style(div18, "background-image", "url(./images/platform_svgs_clean/analytics.svg)");
    			add_location(div18, file, 102, 6, 10853);
    			attr_dev(b6, "class", "svelte-1ix76wb");
    			add_location(b6, file, 103, 6, 10957);
    			attr_dev(div19, "class", "tile svelte-1ix76wb");
    			add_location(div19, file, 101, 5, 10828);
    			attr_dev(div20, "class", "icon svelte-1ix76wb");
    			set_style(div20, "background-image", "url(./images/platform_svgs_clean/reseller.svg)");
    			add_location(div20, file, 106, 6, 11029);
    			attr_dev(b7, "class", "svelte-1ix76wb");
    			add_location(b7, file, 107, 6, 11132);
    			attr_dev(div21, "class", "tile svelte-1ix76wb");
    			add_location(div21, file, 105, 5, 11004);
    			attr_dev(div22, "class", "icon svelte-1ix76wb");
    			set_style(div22, "background-image", "url(./images/platform_svgs_clean/publisher.svg)");
    			add_location(div22, file, 110, 6, 11190);
    			attr_dev(b8, "class", "svelte-1ix76wb");
    			add_location(b8, file, 111, 6, 11294);
    			attr_dev(div23, "class", "tile svelte-1ix76wb");
    			add_location(div23, file, 109, 5, 11165);
    			attr_dev(div24, "class", "icon svelte-1ix76wb");
    			set_style(div24, "background-image", "url(./images/platform_svgs_clean/safety_manager.svg)");
    			add_location(div24, file, 114, 6, 11353);
    			attr_dev(b9, "class", "svelte-1ix76wb");
    			add_location(b9, file, 115, 6, 11462);
    			attr_dev(div25, "class", "tile svelte-1ix76wb");
    			add_location(div25, file, 113, 5, 11328);
    			attr_dev(div26, "class", "icon svelte-1ix76wb");
    			set_style(div26, "background-image", "url(./images/platform_svgs_clean/chem_doc.svg)");
    			add_location(div26, file, 118, 6, 11526);
    			attr_dev(b10, "class", "svelte-1ix76wb");
    			add_location(b10, file, 119, 6, 11629);
    			attr_dev(div27, "class", "tile svelte-1ix76wb");
    			add_location(div27, file, 117, 5, 11501);
    			attr_dev(div28, "class", "icon svelte-1ix76wb");
    			set_style(div28, "background-image", "url(./images/platform_svgs_clean/safe_doc.svg)");
    			add_location(div28, file, 122, 6, 11686);
    			attr_dev(b11, "class", "svelte-1ix76wb");
    			add_location(b11, file, 123, 6, 11789);
    			attr_dev(div29, "class", "tile svelte-1ix76wb");
    			add_location(div29, file, 121, 5, 11661);
    			attr_dev(div30, "class", "icon svelte-1ix76wb");
    			set_style(div30, "background-image", "url(./images/platform_svgs_clean/chemi_control.svg)");
    			add_location(div30, file, 126, 6, 11846);
    			attr_dev(b12, "class", "svelte-1ix76wb");
    			add_location(b12, file, 127, 6, 11954);
    			attr_dev(div31, "class", "tile svelte-1ix76wb");
    			add_location(div31, file, 125, 5, 11821);
    			attr_dev(div32, "class", "tile-container svelte-1ix76wb");
    			add_location(div32, file, 100, 4, 10794);
    			attr_dev(div33, "class", "col-full col-m-half svelte-1ix76wb");
    			add_location(div33, file, 98, 3, 10730);
    			attr_dev(div34, "class", "row svelte-1ix76wb");
    			add_location(div34, file, 64, 2, 9435);
    			attr_dev(div35, "class", "grid svelte-1ix76wb");
    			set_style(div35, "background", "transparent url(./grid_svg.php?w=" + /*col_w*/ ctx[1] + "&g=" + /*gutter*/ ctx[2] + ")");
    			set_style(div35, "opacity", /*grid_opacity*/ ctx[5] / 100);
    			add_location(div35, file, 135, 2, 12021);
    			attr_dev(div36, "class", "cols svelte-1ix76wb");
    			set_style(div36, "max-width", "calc(100% - " + /*outside_margin*/ ctx[3] * 2 + "px)");
    			add_location(div36, file, 54, 1, 8968);
    			attr_dev(div37, "class", "page svelte-1ix76wb");
    			set_style(div37, "width", /*page_width*/ ctx[6] + "px");
    			set_style(div37, "border-color", "rgba(0,0,0," + /*grid_opacity*/ ctx[5] / 100 + ")");
    			add_location(div37, file, 53, 0, 8875);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, svg0);
    			append_dev(svg0, path0);
    			append_dev(svg0, path1);
    			append_dev(svg0, path2);
    			append_dev(svg0, path3);
    			append_dev(svg0, path4);
    			append_dev(svg0, path5);
    			append_dev(svg0, path6);
    			append_dev(svg0, path7);
    			append_dev(svg0, path8);
    			append_dev(svg0, path9);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, svg1);
    			append_dev(svg1, circle);
    			append_dev(svg1, path10);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div37, anchor);
    			append_dev(div37, div36);
    			append_dev(div36, p);
    			append_dev(p, input0);
    			set_input_value(input0, /*grid_opacity*/ ctx[5]);
    			append_dev(p, t2);
    			append_dev(p, t3);
    			append_dev(p, br0);
    			append_dev(p, t4);
    			append_dev(p, input1);
    			set_input_value(input1, /*columns*/ ctx[0]);
    			append_dev(p, t5);
    			append_dev(p, br1);
    			append_dev(p, t6);
    			append_dev(p, input2);
    			set_input_value(input2, /*col_w*/ ctx[1]);
    			append_dev(p, t7);
    			append_dev(p, br2);
    			append_dev(p, t8);
    			append_dev(p, input3);
    			set_input_value(input3, /*gutter*/ ctx[2]);
    			append_dev(p, t9);
    			append_dev(p, br3);
    			append_dev(p, t10);
    			append_dev(p, input4);
    			set_input_value(input4, /*outside_margin*/ ctx[3]);
    			append_dev(p, t11);
    			append_dev(p, br4);
    			append_dev(p, t12);
    			append_dev(p, t13);
    			append_dev(div36, t14);
    			append_dev(div36, div34);
    			append_dev(div34, div17);
    			append_dev(div17, h30);
    			append_dev(div17, t16);
    			append_dev(div17, div16);
    			append_dev(div16, div5);
    			append_dev(div5, div4);
    			append_dev(div5, t17);
    			append_dev(div5, b0);
    			append_dev(div16, t19);
    			append_dev(div16, div7);
    			append_dev(div7, div6);
    			append_dev(div7, t20);
    			append_dev(div7, b1);
    			append_dev(div16, t22);
    			append_dev(div16, div9);
    			append_dev(div9, div8);
    			append_dev(div9, t23);
    			append_dev(div9, b2);
    			append_dev(div9, t25);
    			append_dev(div9, span1);
    			append_dev(span1, t26);
    			append_dev(span1, span0);
    			append_dev(div16, t27);
    			append_dev(div16, div11);
    			append_dev(div11, div10);
    			append_dev(div11, t28);
    			append_dev(div11, b3);
    			append_dev(div11, t30);
    			append_dev(div11, span3);
    			append_dev(span3, t31);
    			append_dev(span3, span2);
    			append_dev(div16, t32);
    			append_dev(div16, div13);
    			append_dev(div13, div12);
    			append_dev(div13, t33);
    			append_dev(div13, b4);
    			append_dev(div13, t35);
    			append_dev(div13, span5);
    			append_dev(span5, t36);
    			append_dev(span5, span4);
    			append_dev(div16, t37);
    			append_dev(div16, div15);
    			append_dev(div15, div14);
    			append_dev(div15, t38);
    			append_dev(div15, b5);
    			append_dev(div34, t40);
    			append_dev(div34, div33);
    			append_dev(div33, h31);
    			append_dev(div33, t42);
    			append_dev(div33, div32);
    			append_dev(div32, div19);
    			append_dev(div19, div18);
    			append_dev(div19, t43);
    			append_dev(div19, b6);
    			append_dev(div32, t45);
    			append_dev(div32, div21);
    			append_dev(div21, div20);
    			append_dev(div21, t46);
    			append_dev(div21, b7);
    			append_dev(div32, t48);
    			append_dev(div32, div23);
    			append_dev(div23, div22);
    			append_dev(div23, t49);
    			append_dev(div23, b8);
    			append_dev(div32, t51);
    			append_dev(div32, div25);
    			append_dev(div25, div24);
    			append_dev(div25, t52);
    			append_dev(div25, b9);
    			append_dev(div32, t54);
    			append_dev(div32, div27);
    			append_dev(div27, div26);
    			append_dev(div27, t55);
    			append_dev(div27, b10);
    			append_dev(div32, t57);
    			append_dev(div32, div29);
    			append_dev(div29, div28);
    			append_dev(div29, t58);
    			append_dev(div29, b11);
    			append_dev(div32, t60);
    			append_dev(div32, div31);
    			append_dev(div31, div30);
    			append_dev(div31, t61);
    			append_dev(div31, b12);
    			append_dev(div36, t63);
    			append_dev(div36, div35);

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "resize", /*handleResize*/ ctx[7], false, false, false),
    					listen_dev(input0, "change", /*input0_change_input_handler*/ ctx[8]),
    					listen_dev(input0, "input", /*input0_change_input_handler*/ ctx[8]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[9]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[10]),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[11]),
    					listen_dev(input4, "input", /*input4_input_handler*/ ctx[12])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*cols_width*/ 16) {
    				set_style(div1, "width", /*cols_width*/ ctx[4] + "px");
    			}

    			if (dirty & /*outside_margin*/ 8) {
    				set_style(div1, "max-width", "calc(100% - " + /*outside_margin*/ ctx[3] * 2 + "px)");
    			}

    			if (dirty & /*page_width*/ 64) {
    				set_style(div2, "width", /*page_width*/ ctx[6] + "px");
    			}

    			if (dirty & /*grid_opacity*/ 32) {
    				set_style(div2, "border-color", "rgba(0,0,0," + /*grid_opacity*/ ctx[5] / 100 + ")");
    			}

    			if (dirty & /*grid_opacity*/ 32) {
    				set_input_value(input0, /*grid_opacity*/ ctx[5]);
    			}

    			if (dirty & /*grid_opacity*/ 32) set_data_dev(t2, /*grid_opacity*/ ctx[5]);

    			if (dirty & /*columns*/ 1 && to_number(input1.value) !== /*columns*/ ctx[0]) {
    				set_input_value(input1, /*columns*/ ctx[0]);
    			}

    			if (dirty & /*col_w*/ 2 && to_number(input2.value) !== /*col_w*/ ctx[1]) {
    				set_input_value(input2, /*col_w*/ ctx[1]);
    			}

    			if (dirty & /*gutter*/ 4 && to_number(input3.value) !== /*gutter*/ ctx[2]) {
    				set_input_value(input3, /*gutter*/ ctx[2]);
    			}

    			if (dirty & /*outside_margin*/ 8 && to_number(input4.value) !== /*outside_margin*/ ctx[3]) {
    				set_input_value(input4, /*outside_margin*/ ctx[3]);
    			}

    			if (dirty & /*page_width*/ 64) set_data_dev(t13, /*page_width*/ ctx[6]);

    			if (dirty & /*col_w, gutter*/ 6) {
    				set_style(div35, "background", "transparent url(./grid_svg.php?w=" + /*col_w*/ ctx[1] + "&g=" + /*gutter*/ ctx[2] + ")");
    			}

    			if (dirty & /*grid_opacity*/ 32) {
    				set_style(div35, "opacity", /*grid_opacity*/ ctx[5] / 100);
    			}

    			if (dirty & /*outside_margin*/ 8) {
    				set_style(div36, "max-width", "calc(100% - " + /*outside_margin*/ ctx[3] * 2 + "px)");
    			}

    			if (dirty & /*page_width*/ 64) {
    				set_style(div37, "width", /*page_width*/ ctx[6] + "px");
    			}

    			if (dirty & /*grid_opacity*/ 32) {
    				set_style(div37, "border-color", "rgba(0,0,0," + /*grid_opacity*/ ctx[5] / 100 + ")");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div37);
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
    	let cols_width;
    	let page_width;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Grid", slots, []);
    	let grid_opacity = 5;
    	let columns = 18;
    	let col_w = 48;
    	let gutter = 0;
    	let outside_margin = 0;

    	function handleResize() {
    		console.log(this, "??");
    		$$invalidate(2, gutter = getComputedStyle(document.documentElement).getPropertyValue("--gutter_num"));
    		$$invalidate(3, outside_margin = getComputedStyle(document.documentElement).getPropertyValue("--margin_num"));
    	}

    	onMount(() => {
    		handleResize();
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Grid> was created with unknown prop '${key}'`);
    	});

    	function input0_change_input_handler() {
    		grid_opacity = to_number(this.value);
    		$$invalidate(5, grid_opacity);
    	}

    	function input1_input_handler() {
    		columns = to_number(this.value);
    		$$invalidate(0, columns);
    	}

    	function input2_input_handler() {
    		col_w = to_number(this.value);
    		$$invalidate(1, col_w);
    	}

    	function input3_input_handler() {
    		gutter = to_number(this.value);
    		$$invalidate(2, gutter);
    	}

    	function input4_input_handler() {
    		outside_margin = to_number(this.value);
    		$$invalidate(3, outside_margin);
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		grid_opacity,
    		columns,
    		col_w,
    		gutter,
    		outside_margin,
    		handleResize,
    		cols_width,
    		page_width
    	});

    	$$self.$inject_state = $$props => {
    		if ("grid_opacity" in $$props) $$invalidate(5, grid_opacity = $$props.grid_opacity);
    		if ("columns" in $$props) $$invalidate(0, columns = $$props.columns);
    		if ("col_w" in $$props) $$invalidate(1, col_w = $$props.col_w);
    		if ("gutter" in $$props) $$invalidate(2, gutter = $$props.gutter);
    		if ("outside_margin" in $$props) $$invalidate(3, outside_margin = $$props.outside_margin);
    		if ("cols_width" in $$props) $$invalidate(4, cols_width = $$props.cols_width);
    		if ("page_width" in $$props) $$invalidate(6, page_width = $$props.page_width);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*columns, col_w, gutter*/ 7) {
    			$$invalidate(4, cols_width = columns * col_w + (columns - 1) * gutter);
    		}

    		if ($$self.$$.dirty & /*cols_width, outside_margin*/ 24) {
    			$$invalidate(6, page_width = cols_width + outside_margin * 2);
    		}
    	};

    	return [
    		columns,
    		col_w,
    		gutter,
    		outside_margin,
    		cols_width,
    		grid_opacity,
    		page_width,
    		handleResize,
    		input0_change_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler
    	];
    }

    class Grid extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Grid",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new Grid({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=grid.js.map
