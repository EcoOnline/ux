
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35730/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
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
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
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
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
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
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
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
    const outroing = new Set();
    let outros;
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
        else if (callback) {
            callback();
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
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
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
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
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
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
            if (!is_function(callback)) {
                return noop;
            }
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.52.0' }, detail), { bubbles: true }));
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

    /* src/EcoPlusForm.svelte generated by Svelte v3.52.0 */

    const file$2 = "src/EcoPlusForm.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	child_ctx[5] = list;
    	child_ctx[6] = i;
    	return child_ctx;
    }

    // (80:1) {#each form_data as item}
    function create_each_block$1(ctx) {
    	let div1;
    	let label;
    	let t0_value = /*item*/ ctx[4].f.label + "";
    	let t0;
    	let t1;
    	let input;
    	let t2;
    	let div0;
    	let t3;
    	let mounted;
    	let dispose;

    	function input_input_handler() {
    		/*input_input_handler*/ ctx[2].call(input, /*each_value*/ ctx[5], /*item_index*/ ctx[6]);
    	}

    	function click_handler() {
    		return /*click_handler*/ ctx[3](/*item*/ ctx[4]);
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			label = element("label");
    			t0 = text(t0_value);
    			t1 = space();
    			input = element("input");
    			t2 = space();
    			div0 = element("div");
    			t3 = space();
    			add_location(label, file$2, 81, 3, 1379);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "form-control svelte-14skv19");
    			add_location(input, file$2, 82, 3, 1412);
    			attr_dev(div0, "class", "shield svelte-14skv19");
    			add_location(div0, file$2, 83, 3, 1484);
    			attr_dev(div1, "class", "form_item svelte-14skv19");
    			toggle_class(div1, "selected", /*selected*/ ctx[0] && /*selected*/ ctx[0].f.id == /*item*/ ctx[4].f.id);
    			add_location(div1, file$2, 80, 2, 1296);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, label);
    			append_dev(label, t0);
    			append_dev(div1, t1);
    			append_dev(div1, input);
    			set_input_value(input, /*item*/ ctx[4].f.answer);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			append_dev(div1, t3);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", input_input_handler),
    					listen_dev(div0, "click", click_handler, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*form_data*/ 2 && t0_value !== (t0_value = /*item*/ ctx[4].f.label + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*form_data*/ 2 && input.value !== /*item*/ ctx[4].f.answer) {
    				set_input_value(input, /*item*/ ctx[4].f.answer);
    			}

    			if (dirty & /*selected, form_data*/ 3) {
    				toggle_class(div1, "selected", /*selected*/ ctx[0] && /*selected*/ ctx[0].f.id == /*item*/ ctx[4].f.id);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(80:1) {#each form_data as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div0;
    	let t;
    	let div3;
    	let div2;
    	let div1;
    	let each_value = /*form_data*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			attr_dev(div0, "class", "wrapper svelte-14skv19");
    			add_location(div0, file$2, 78, 0, 1245);
    			attr_dev(div1, "class", "simulated-progress svelte-14skv19");
    			add_location(div1, file$2, 91, 2, 1727);
    			set_style(div2, "margin", "0 auto");
    			set_style(div2, "width", "240px");
    			set_style(div2, "height", "8px");
    			set_style(div2, "overflow", "hidden");
    			set_style(div2, "border-radius", "4px");
    			set_style(div2, "background", "#E4E7EB");
    			add_location(div2, file$2, 90, 1, 1621);
    			set_style(div3, "margin", "32px");
    			set_style(div3, "text-align", "center");
    			add_location(div3, file$2, 89, 0, 1576);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			insert_dev(target, t, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*selected, form_data*/ 3) {
    				each_value = /*form_data*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
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
    			if (detaching) detach_dev(div0);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div3);
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
    	validate_slots('EcoPlusForm', slots, []);

    	let form_data = [
    		{
    			/* product name obtained by ML */
    			ml: {
    				confirmed: false,
    				value_obtained: true,
    				value: "1,1,1-Trifluoroacetone",
    				rects: [{ x0: 220, y0: 180, x1: 397, y1: 210 }]
    			},
    			f: {
    				item_type: "input_text",
    				id: "f1",
    				label: "Product name",
    				placeholder: '',
    				hint: false,
    				optional: true,
    				answer: "1,1,1-Trifluoroacetone"
    			}
    		},
    		{
    			/* 
    	reach obtained by earlier version not ml 
    	ml has no suggestions
    */
    			ml: {
    				confirmed: false,
    				value_obtained: false,
    				value: "",
    				rects: []
    			},
    			f: {
    				item_type: "input_text",
    				id: "f2",
    				label: "REACH Reg. No., comments",
    				placeholder: '',
    				hint: false,
    				optional: true,
    				answer: "None available"
    			}
    		},
    		{
    			/* 
    	cas no obtained by ML 
    	ML in wrong place
    */
    			ml: {
    				confirmed: false,
    				value_obtained: true,
    				value: "T62804",
    				rects: [{ x0: 216, y0: 207, x1: 270, y1: 227 }]
    			},
    			f: {
    				item_type: "input_text",
    				id: "f3",
    				label: "CAS No.",
    				placeholder: '',
    				hint: false,
    				optional: true,
    				answer: "T62804"
    			}
    		}
    	];

    	let { selected } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (selected === undefined && !('selected' in $$props || $$self.$$.bound[$$self.$$.props['selected']])) {
    			console.warn("<EcoPlusForm> was created without expected prop 'selected'");
    		}
    	});

    	const writable_props = ['selected'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<EcoPlusForm> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler(each_value, item_index) {
    		each_value[item_index].f.answer = this.value;
    		$$invalidate(1, form_data);
    	}

    	const click_handler = item => {
    		$$invalidate(0, selected = item);
    	};

    	$$self.$$set = $$props => {
    		if ('selected' in $$props) $$invalidate(0, selected = $$props.selected);
    	};

    	$$self.$capture_state = () => ({ form_data, selected });

    	$$self.$inject_state = $$props => {
    		if ('form_data' in $$props) $$invalidate(1, form_data = $$props.form_data);
    		if ('selected' in $$props) $$invalidate(0, selected = $$props.selected);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [selected, form_data, input_input_handler, click_handler];
    }

    class EcoPlusForm extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { selected: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EcoPlusForm",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get selected() {
    		throw new Error("<EcoPlusForm>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<EcoPlusForm>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/EcoPlusSDS.svelte generated by Svelte v3.52.0 */

    const { console: console_1 } = globals;
    const file$1 = "src/EcoPlusSDS.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[21] = list[i];
    	return child_ctx;
    }

    // (162:2) {#if show_progress}
    function create_if_block_2(ctx) {
    	let t0;
    	let t1;
    	let t2;

    	function select_block_type(ctx, dirty) {
    		if (/*progress*/ ctx[5] < 30) return create_if_block_3;
    		if (/*progress*/ ctx[5] < 70) return create_if_block_4;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			t0 = space();
    			t1 = text(/*progress*/ ctx[5]);
    			t2 = text("%");
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(t0.parentNode, t0);
    				}
    			}

    			if (dirty & /*progress*/ 32) set_data_dev(t1, /*progress*/ ctx[5]);
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(162:2) {#if show_progress}",
    		ctx
    	});

    	return block;
    }

    // (167:3) {:else}
    function create_else_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("OK nearly done");
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
    		id: create_else_block.name,
    		type: "else",
    		source: "(167:3) {:else}",
    		ctx
    	});

    	return block;
    }

    // (165:27) 
    function create_if_block_4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Hmmn interesting");
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
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(165:27) ",
    		ctx
    	});

    	return block;
    }

    // (163:3) {#if progress < 30}
    function create_if_block_3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Reading the PDF");
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
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(163:3) {#if progress < 30}",
    		ctx
    	});

    	return block;
    }

    // (172:2) {#if selected}
    function create_if_block_1(ctx) {
    	let t_value = /*selected*/ ctx[0].f.answer + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*selected*/ 1 && t_value !== (t_value = /*selected*/ ctx[0].f.answer + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(172:2) {#if selected}",
    		ctx
    	});

    	return block;
    }

    // (179:2) {#each selected_words as word}
    function create_each_block(ctx) {
    	let rect_1;
    	let rect_1_x_value;
    	let rect_1_y_value;
    	let rect_1_width_value;
    	let rect_1_height_value;

    	const block = {
    		c: function create() {
    			rect_1 = svg_element("rect");
    			attr_dev(rect_1, "x", rect_1_x_value = /*word*/ ctx[21].bbox.x0);
    			attr_dev(rect_1, "y", rect_1_y_value = /*word*/ ctx[21].bbox.y0);
    			attr_dev(rect_1, "width", rect_1_width_value = /*word*/ ctx[21].bbox.x1 - /*word*/ ctx[21].bbox.x0);
    			attr_dev(rect_1, "height", rect_1_height_value = /*word*/ ctx[21].bbox.y1 - /*word*/ ctx[21].bbox.y0);
    			attr_dev(rect_1, "fill", "rgba(23,173,211,0.5)");
    			add_location(rect_1, file$1, 179, 3, 6332);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, rect_1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*selected_words*/ 4 && rect_1_x_value !== (rect_1_x_value = /*word*/ ctx[21].bbox.x0)) {
    				attr_dev(rect_1, "x", rect_1_x_value);
    			}

    			if (dirty & /*selected_words*/ 4 && rect_1_y_value !== (rect_1_y_value = /*word*/ ctx[21].bbox.y0)) {
    				attr_dev(rect_1, "y", rect_1_y_value);
    			}

    			if (dirty & /*selected_words*/ 4 && rect_1_width_value !== (rect_1_width_value = /*word*/ ctx[21].bbox.x1 - /*word*/ ctx[21].bbox.x0)) {
    				attr_dev(rect_1, "width", rect_1_width_value);
    			}

    			if (dirty & /*selected_words*/ 4 && rect_1_height_value !== (rect_1_height_value = /*word*/ ctx[21].bbox.y1 - /*word*/ ctx[21].bbox.y0)) {
    				attr_dev(rect_1, "height", rect_1_height_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(rect_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(179:2) {#each selected_words as word}",
    		ctx
    	});

    	return block;
    }

    // (184:2) {#if mode == 'choose'}
    function create_if_block(ctx) {
    	let rect_1;
    	let rect_1_x_value;
    	let rect_1_y_value;
    	let rect_1_width_value;
    	let rect_1_height_value;

    	const block = {
    		c: function create() {
    			rect_1 = svg_element("rect");
    			attr_dev(rect_1, "x", rect_1_x_value = /*rect*/ ctx[1].x0);
    			attr_dev(rect_1, "y", rect_1_y_value = /*rect*/ ctx[1].y0);
    			attr_dev(rect_1, "width", rect_1_width_value = /*rect*/ ctx[1].x1 - /*rect*/ ctx[1].x0);
    			attr_dev(rect_1, "height", rect_1_height_value = /*rect*/ ctx[1].y1 - /*rect*/ ctx[1].y0);
    			attr_dev(rect_1, "rx", "4");
    			attr_dev(rect_1, "stroke", "rgb(23,173,211)");
    			attr_dev(rect_1, "stroke-width", "4");
    			attr_dev(rect_1, "fill", "transparent");
    			add_location(rect_1, file$1, 184, 3, 6686);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, rect_1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*rect*/ 2 && rect_1_x_value !== (rect_1_x_value = /*rect*/ ctx[1].x0)) {
    				attr_dev(rect_1, "x", rect_1_x_value);
    			}

    			if (dirty & /*rect*/ 2 && rect_1_y_value !== (rect_1_y_value = /*rect*/ ctx[1].y0)) {
    				attr_dev(rect_1, "y", rect_1_y_value);
    			}

    			if (dirty & /*rect*/ 2 && rect_1_width_value !== (rect_1_width_value = /*rect*/ ctx[1].x1 - /*rect*/ ctx[1].x0)) {
    				attr_dev(rect_1, "width", rect_1_width_value);
    			}

    			if (dirty & /*rect*/ 2 && rect_1_height_value !== (rect_1_height_value = /*rect*/ ctx[1].y1 - /*rect*/ ctx[1].y0)) {
    				attr_dev(rect_1, "height", rect_1_height_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(rect_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(184:2) {#if mode == 'choose'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div1;
    	let div0;
    	let svg0;
    	let path0;
    	let path1;
    	let path2;
    	let path3;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let canvas_1;
    	let t5;
    	let svg1;
    	let rect_1;
    	let rect_1_x_value;
    	let rect_1_y_value;
    	let rect_1_width_value;
    	let rect_1_height_value;
    	let svg1_viewBox_value;
    	let mounted;
    	let dispose;
    	let if_block0 = /*show_progress*/ ctx[6] && create_if_block_2(ctx);
    	let if_block1 = /*selected*/ ctx[0] && create_if_block_1(ctx);
    	let each_value = /*selected_words*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	let if_block2 = /*mode*/ ctx[3] == 'choose' && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			t2 = space();
    			t3 = text(/*mode*/ ctx[3]);
    			t4 = space();
    			canvas_1 = element("canvas");
    			t5 = space();
    			svg1 = svg_element("svg");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			rect_1 = svg_element("rect");
    			if (if_block2) if_block2.c();
    			attr_dev(path0, "d", "M16 25C14.8449 25.001 13.7076 24.7157 12.6897 24.1698C11.6719 23.6238 10.8051 22.8341 10.167 21.8713L11.833 20.7639C12.2892 21.4515 12.9084 22.0155 13.6355 22.4057C14.3625 22.7958 15.1749 23 16 23C16.8251 23 17.6374 22.7958 18.3645 22.4057C19.0916 22.0155 19.7108 21.4515 20.167 20.7639L21.833 21.8713C21.1949 22.8341 20.3281 23.6238 19.3102 24.1698C18.2924 24.7157 17.1551 25.001 16 25V25Z");
    			attr_dev(path0, "fill", "white");
    			add_location(path0, file$1, 154, 3, 3359);
    			attr_dev(path1, "d", "M20 14.0001C19.6044 14.0001 19.2178 14.1174 18.8889 14.3372C18.56 14.5569 18.3036 14.8693 18.1522 15.2347C18.0009 15.6002 17.9613 16.0023 18.0384 16.3903C18.1156 16.7782 18.3061 17.1346 18.5858 17.4143C18.8655 17.694 19.2219 17.8845 19.6098 17.9617C19.9978 18.0388 20.3999 17.9992 20.7654 17.8479C21.1308 17.6965 21.4432 17.4401 21.6629 17.1112C21.8827 16.7823 22 16.3957 22 16.0001C22.0026 15.7367 21.9526 15.4755 21.853 15.2317C21.7535 14.9879 21.6062 14.7663 21.42 14.5801C21.2338 14.3939 21.0122 14.2466 20.7684 14.1471C20.5246 14.0475 20.2634 13.9975 20 14.0001V14.0001Z");
    			attr_dev(path1, "fill", "white");
    			add_location(path1, file$1, 155, 3, 3778);
    			attr_dev(path2, "d", "M12 14.0001C11.6044 14.0001 11.2178 14.1174 10.8889 14.3372C10.56 14.5569 10.3036 14.8693 10.1522 15.2347C10.0009 15.6002 9.96126 16.0023 10.0384 16.3903C10.1156 16.7782 10.3061 17.1346 10.5858 17.4143C10.8655 17.694 11.2219 17.8845 11.6098 17.9617C11.9978 18.0388 12.3999 17.9992 12.7654 17.8479C13.1308 17.6965 13.4432 17.4401 13.6629 17.1112C13.8827 16.7823 14 16.3957 14 16.0001C14.0026 15.7367 13.9526 15.4755 13.853 15.2317C13.7534 14.9879 13.6062 14.7663 13.42 14.5801C13.2338 14.3939 13.0122 14.2466 12.7684 14.1471C12.5246 14.0475 12.2634 13.9975 12 14.0001V14.0001Z");
    			attr_dev(path2, "fill", "white");
    			add_location(path2, file$1, 156, 3, 4382);
    			attr_dev(path3, "d", "M30 16V14H28V10C27.9988 8.9395 27.577 7.92278 26.8271 7.17289C26.0772 6.423 25.0605 6.00119 24 6H22V2H20V6H12V2H10V6H8C6.9395 6.00119 5.92278 6.423 5.17289 7.17289C4.423 7.92278 4.00119 8.9395 4 10V14H2V16H4V21H2V23H4V26C4.00119 27.0605 4.423 28.0772 5.17289 28.8271C5.92278 29.577 6.9395 29.9988 8 30H24C25.0605 29.9988 26.0772 29.577 26.8271 28.8271C27.577 28.0772 27.9988 27.0605 28 26V23H30V21H28V16H30ZM26 26C25.9994 26.5302 25.7885 27.0386 25.4135 27.4135C25.0386 27.7885 24.5302 27.9994 24 28H8C7.46975 27.9994 6.9614 27.7885 6.58646 27.4135C6.21152 27.0386 6.00061 26.5302 6 26V10C6.00061 9.46975 6.21152 8.9614 6.58646 8.58646C6.9614 8.21152 7.46975 8.00061 8 8H24C24.5302 8.00061 25.0386 8.21152 25.4135 8.58646C25.7885 8.9614 25.9994 9.46975 26 10V26Z");
    			attr_dev(path3, "fill", "white");
    			add_location(path3, file$1, 157, 3, 4986);
    			attr_dev(svg0, "width", "32");
    			attr_dev(svg0, "height", "32");
    			attr_dev(svg0, "viewBox", "0 0 32 32");
    			attr_dev(svg0, "fill", "none");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg0, file$1, 153, 2, 3260);
    			attr_dev(div0, "class", "header svelte-18yduv0");
    			add_location(div0, file$1, 152, 1, 3237);
    			attr_dev(canvas_1, "class", "viewport svelte-18yduv0");
    			add_location(canvas_1, file$1, 176, 1, 6035);
    			attr_dev(rect_1, "x", rect_1_x_value = /*rect*/ ctx[1].x0);
    			attr_dev(rect_1, "y", rect_1_y_value = /*rect*/ ctx[1].y0);
    			attr_dev(rect_1, "width", rect_1_width_value = /*rect*/ ctx[1].x1 - /*rect*/ ctx[1].x0);
    			attr_dev(rect_1, "height", rect_1_height_value = /*rect*/ ctx[1].y1 - /*rect*/ ctx[1].y0);
    			attr_dev(rect_1, "rx", "4");
    			attr_dev(rect_1, "stroke", "rgb(23,173,211)");
    			attr_dev(rect_1, "stroke-width", "4");
    			attr_dev(rect_1, "fill", "transparent");
    			add_location(rect_1, file$1, 181, 2, 6495);
    			attr_dev(svg1, "class", "viewport svelte-18yduv0");
    			attr_dev(svg1, "width", /*svg_width*/ ctx[7]);
    			attr_dev(svg1, "height", /*svg_height*/ ctx[8]);
    			attr_dev(svg1, "viewBox", svg1_viewBox_value = "0 0 " + /*svg_width*/ ctx[7] + " " + /*svg_height*/ ctx[8]);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg1, file$1, 177, 1, 6090);
    			attr_dev(div1, "class", "wrapper svelte-18yduv0");
    			add_location(div1, file$1, 151, 0, 3214);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, svg0);
    			append_dev(svg0, path0);
    			append_dev(svg0, path1);
    			append_dev(svg0, path2);
    			append_dev(svg0, path3);
    			append_dev(div0, t0);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(div0, t1);
    			if (if_block1) if_block1.m(div0, null);
    			append_dev(div0, t2);
    			append_dev(div0, t3);
    			append_dev(div1, t4);
    			append_dev(div1, canvas_1);
    			/*canvas_1_binding*/ ctx[15](canvas_1);
    			append_dev(div1, t5);
    			append_dev(div1, svg1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(svg1, null);
    			}

    			append_dev(svg1, rect_1);
    			if (if_block2) if_block2.m(svg1, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(svg1, "mousedown", /*startRect*/ ctx[9], false, false, false),
    					listen_dev(svg1, "mousemove", /*dragRect*/ ctx[10], false, false, false),
    					listen_dev(svg1, "mouseup", /*stopRect*/ ctx[11], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*show_progress*/ ctx[6]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					if_block0.m(div0, t1);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*selected*/ ctx[0]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1(ctx);
    					if_block1.c();
    					if_block1.m(div0, t2);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*mode*/ 8) set_data_dev(t3, /*mode*/ ctx[3]);

    			if (dirty & /*selected_words*/ 4) {
    				each_value = /*selected_words*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(svg1, rect_1);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*rect*/ 2 && rect_1_x_value !== (rect_1_x_value = /*rect*/ ctx[1].x0)) {
    				attr_dev(rect_1, "x", rect_1_x_value);
    			}

    			if (dirty & /*rect*/ 2 && rect_1_y_value !== (rect_1_y_value = /*rect*/ ctx[1].y0)) {
    				attr_dev(rect_1, "y", rect_1_y_value);
    			}

    			if (dirty & /*rect*/ 2 && rect_1_width_value !== (rect_1_width_value = /*rect*/ ctx[1].x1 - /*rect*/ ctx[1].x0)) {
    				attr_dev(rect_1, "width", rect_1_width_value);
    			}

    			if (dirty & /*rect*/ 2 && rect_1_height_value !== (rect_1_height_value = /*rect*/ ctx[1].y1 - /*rect*/ ctx[1].y0)) {
    				attr_dev(rect_1, "height", rect_1_height_value);
    			}

    			if (/*mode*/ ctx[3] == 'choose') {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block(ctx);
    					if_block2.c();
    					if_block2.m(svg1, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty & /*svg_width*/ 128) {
    				attr_dev(svg1, "width", /*svg_width*/ ctx[7]);
    			}

    			if (dirty & /*svg_height*/ 256) {
    				attr_dev(svg1, "height", /*svg_height*/ ctx[8]);
    			}

    			if (dirty & /*svg_width, svg_height*/ 384 && svg1_viewBox_value !== (svg1_viewBox_value = "0 0 " + /*svg_width*/ ctx[7] + " " + /*svg_height*/ ctx[8])) {
    				attr_dev(svg1, "viewBox", svg1_viewBox_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			/*canvas_1_binding*/ ctx[15](null);
    			destroy_each(each_blocks, detaching);
    			if (if_block2) if_block2.d();
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
    	let selected_words;
    	let selected_term;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('EcoPlusSDS', slots, []);
    	let { selected } = $$props;
    	let mode = false;
    	let canvas = false;
    	let words = [];
    	let progress = 0;
    	let show_progress = false;
    	let pdf_src = './pdfs/sds_sample.pdf';
    	let pdfjsLib = window['pdfjs-dist/build/pdf'];
    	let w = 100;
    	let svg_width = 100;
    	let svg_height = 100;
    	let scale = 1;
    	let rect = { x0: -10, y0: -10, x1: -5, y1: -5 };
    	pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';

    	async function get_pdf() {
    		let loadingTask = pdfjsLib.getDocument(pdf_src);

    		loadingTask.promise.then(
    			function (pdf) {
    				console.log('PDF loaded');

    				// Fetch the first page
    				var pageNumber = 1;

    				pdf.getPage(pageNumber).then(function (page) {
    					console.log('Page loaded');
    					$$invalidate(14, scale = w / 595);
    					var viewport = page.getViewport({ scale });
    					var context = canvas.getContext('2d');
    					$$invalidate(4, canvas.height = viewport.height, canvas);
    					$$invalidate(4, canvas.width = viewport.width, canvas);
    					$$invalidate(8, svg_height = viewport.height);
    					$$invalidate(7, svg_width = viewport.width);

    					// Render PDF page into canvas context
    					var renderContext = { canvasContext: context, viewport };

    					var renderTask = page.render(renderContext);

    					renderTask.promise.then(function () {
    						console.log('Page rendered');

    						//time to read with OCR
    						$$invalidate(6, show_progress = true);

    						Tesseract.recognize(canvas, 'eng', {
    							logger: m => $$invalidate(5, progress = (m.progress * 100).toFixed(0))
    						}).then(job => {
    							$$invalidate(12, words = job.data.words);
    							$$invalidate(6, show_progress = false);
    						});
    					});
    				});
    			},
    			function (reason) {
    				// PDF loading error
    				console.error(reason);
    			}
    		);
    	}

    	let boxing = false;

    	function startRect(e) {
    		$$invalidate(1, rect.startx = e.offsetX, rect);
    		$$invalidate(1, rect.starty = e.offsetY, rect);
    		$$invalidate(1, rect.x0 = e.offsetX, rect);
    		$$invalidate(1, rect.y0 = e.offsetY, rect);
    		$$invalidate(1, rect.x1 = e.offsetX, rect);
    		$$invalidate(1, rect.y1 = e.offsetY, rect);
    		boxing = true;
    	}

    	function dragRect(e) {
    		if (boxing) {
    			if (e.offsetX < rect.startx) {
    				$$invalidate(1, rect.x0 = e.offsetX, rect);
    			} else {
    				$$invalidate(1, rect.x1 = e.offsetX, rect);
    			}

    			if (e.offsetY < rect.starty) {
    				$$invalidate(1, rect.y0 = e.offsetY, rect);
    			} else {
    				$$invalidate(1, rect.y1 = e.offsetY, rect);
    			}
    		}
    	}

    	function stopRect(e) {
    		boxing = false;
    	}

    	onMount(() => {
    		$$invalidate(13, w = canvas.parentNode.clientWidth);

    		//boundings_ctx = boundings.getContext('2d');
    		get_pdf();
    	});

    	$$self.$$.on_mount.push(function () {
    		if (selected === undefined && !('selected' in $$props || $$self.$$.bound[$$self.$$.props['selected']])) {
    			console_1.warn("<EcoPlusSDS> was created without expected prop 'selected'");
    		}
    	});

    	const writable_props = ['selected'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<EcoPlusSDS> was created with unknown prop '${key}'`);
    	});

    	function canvas_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			canvas = $$value;
    			$$invalidate(4, canvas);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('selected' in $$props) $$invalidate(0, selected = $$props.selected);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		selected,
    		mode,
    		canvas,
    		words,
    		progress,
    		show_progress,
    		pdf_src,
    		pdfjsLib,
    		w,
    		svg_width,
    		svg_height,
    		scale,
    		rect,
    		get_pdf,
    		boxing,
    		startRect,
    		dragRect,
    		stopRect,
    		selected_words,
    		selected_term
    	});

    	$$self.$inject_state = $$props => {
    		if ('selected' in $$props) $$invalidate(0, selected = $$props.selected);
    		if ('mode' in $$props) $$invalidate(3, mode = $$props.mode);
    		if ('canvas' in $$props) $$invalidate(4, canvas = $$props.canvas);
    		if ('words' in $$props) $$invalidate(12, words = $$props.words);
    		if ('progress' in $$props) $$invalidate(5, progress = $$props.progress);
    		if ('show_progress' in $$props) $$invalidate(6, show_progress = $$props.show_progress);
    		if ('pdf_src' in $$props) pdf_src = $$props.pdf_src;
    		if ('pdfjsLib' in $$props) pdfjsLib = $$props.pdfjsLib;
    		if ('w' in $$props) $$invalidate(13, w = $$props.w);
    		if ('svg_width' in $$props) $$invalidate(7, svg_width = $$props.svg_width);
    		if ('svg_height' in $$props) $$invalidate(8, svg_height = $$props.svg_height);
    		if ('scale' in $$props) $$invalidate(14, scale = $$props.scale);
    		if ('rect' in $$props) $$invalidate(1, rect = $$props.rect);
    		if ('boxing' in $$props) boxing = $$props.boxing;
    		if ('selected_words' in $$props) $$invalidate(2, selected_words = $$props.selected_words);
    		if ('selected_term' in $$props) selected_term = $$props.selected_term;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*selected, scale*/ 16385) {
    			{
    				let s = selected;
    				let scaler = scale;

    				if (s) {
    					if (s.ml.value_obtained && s.ml.rects.length == 1) {
    						//obtained a value through ml and have 1 rect
    						$$invalidate(1, rect.x0 = s.ml.rects[0].x0 * scaler, rect);

    						$$invalidate(1, rect.y0 = s.ml.rects[0].y0 * scaler, rect);
    						$$invalidate(1, rect.x1 = s.ml.rects[0].x1 * scaler, rect);
    						$$invalidate(1, rect.y1 = s.ml.rects[0].y1 * scaler, rect);
    						$$invalidate(3, mode = 'confirm');
    					}

    					if (s.ml.rects.length > 1) {
    						//a choice of rects
    						$$invalidate(3, mode = 'choose');

    						$$invalidate(1, rect.x0 = -20, rect);
    						$$invalidate(1, rect.y0 = -20, rect);
    						$$invalidate(1, rect.x1 = -10, rect);
    						$$invalidate(1, rect.y1 = -10, rect);
    					}

    					if (!s.ml.value_obtained && !s.ml.rects.length) {
    						$$invalidate(3, mode = 'draw');
    						$$invalidate(1, rect.x0 = -20, rect);
    						$$invalidate(1, rect.y0 = -20, rect);
    						$$invalidate(1, rect.x1 = -10, rect);
    						$$invalidate(1, rect.y1 = -10, rect);
    					}
    				}
    			}
    		}

    		if ($$self.$$.dirty & /*words, rect*/ 4098) {
    			$$invalidate(2, selected_words = words.filter(w => {
    				return w.bbox.x0 > rect.x0 && w.bbox.x1 < rect.x1 && w.bbox.y0 > rect.y0 && w.bbox.y1 < rect.y1;
    			}));
    		}

    		if ($$self.$$.dirty & /*selected_words*/ 4) {
    			selected_term = selected_words.reduce((a, b) => a + ' ' + b.text, '');
    		}
    	};

    	return [
    		selected,
    		rect,
    		selected_words,
    		mode,
    		canvas,
    		progress,
    		show_progress,
    		svg_width,
    		svg_height,
    		startRect,
    		dragRect,
    		stopRect,
    		words,
    		w,
    		scale,
    		canvas_1_binding
    	];
    }

    class EcoPlusSDS extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { selected: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EcoPlusSDS",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get selected() {
    		throw new Error("<EcoPlusSDS>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<EcoPlusSDS>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/EcoPlus.svelte generated by Svelte v3.52.0 */
    const file = "src/EcoPlus.svelte";

    function create_fragment(ctx) {
    	let div2;
    	let div0;
    	let ecoplusform;
    	let updating_selected;
    	let t;
    	let div1;
    	let ecoplussds;
    	let updating_selected_1;
    	let current;

    	function ecoplusform_selected_binding(value) {
    		/*ecoplusform_selected_binding*/ ctx[1](value);
    	}

    	let ecoplusform_props = {};

    	if (/*sel*/ ctx[0] !== void 0) {
    		ecoplusform_props.selected = /*sel*/ ctx[0];
    	}

    	ecoplusform = new EcoPlusForm({ props: ecoplusform_props, $$inline: true });
    	binding_callbacks.push(() => bind(ecoplusform, 'selected', ecoplusform_selected_binding));

    	function ecoplussds_selected_binding(value) {
    		/*ecoplussds_selected_binding*/ ctx[2](value);
    	}

    	let ecoplussds_props = {};

    	if (/*sel*/ ctx[0] !== void 0) {
    		ecoplussds_props.selected = /*sel*/ ctx[0];
    	}

    	ecoplussds = new EcoPlusSDS({ props: ecoplussds_props, $$inline: true });
    	binding_callbacks.push(() => bind(ecoplussds, 'selected', ecoplussds_selected_binding));

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			create_component(ecoplusform.$$.fragment);
    			t = space();
    			div1 = element("div");
    			create_component(ecoplussds.$$.fragment);
    			attr_dev(div0, "class", "svelte-156jv1q");
    			add_location(div0, file, 8, 1, 155);
    			attr_dev(div1, "class", "sds svelte-156jv1q");
    			add_location(div1, file, 11, 1, 207);
    			attr_dev(div2, "id", "ecoplus_wrapper");
    			attr_dev(div2, "class", "svelte-156jv1q");
    			add_location(div2, file, 7, 0, 127);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			mount_component(ecoplusform, div0, null);
    			append_dev(div2, t);
    			append_dev(div2, div1);
    			mount_component(ecoplussds, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const ecoplusform_changes = {};

    			if (!updating_selected && dirty & /*sel*/ 1) {
    				updating_selected = true;
    				ecoplusform_changes.selected = /*sel*/ ctx[0];
    				add_flush_callback(() => updating_selected = false);
    			}

    			ecoplusform.$set(ecoplusform_changes);
    			const ecoplussds_changes = {};

    			if (!updating_selected_1 && dirty & /*sel*/ 1) {
    				updating_selected_1 = true;
    				ecoplussds_changes.selected = /*sel*/ ctx[0];
    				add_flush_callback(() => updating_selected_1 = false);
    			}

    			ecoplussds.$set(ecoplussds_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(ecoplusform.$$.fragment, local);
    			transition_in(ecoplussds.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(ecoplusform.$$.fragment, local);
    			transition_out(ecoplussds.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(ecoplusform);
    			destroy_component(ecoplussds);
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
    	validate_slots('EcoPlus', slots, []);
    	let sel;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<EcoPlus> was created with unknown prop '${key}'`);
    	});

    	function ecoplusform_selected_binding(value) {
    		sel = value;
    		$$invalidate(0, sel);
    	}

    	function ecoplussds_selected_binding(value) {
    		sel = value;
    		$$invalidate(0, sel);
    	}

    	$$self.$capture_state = () => ({ EcoPlusForm, EcoPlusSDS, sel });

    	$$self.$inject_state = $$props => {
    		if ('sel' in $$props) $$invalidate(0, sel = $$props.sel);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [sel, ecoplusform_selected_binding, ecoplussds_selected_binding];
    }

    class EcoPlus extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EcoPlus",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new EcoPlus({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=ecoplus.js.map
