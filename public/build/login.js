
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

    /* src/components/form/InputCheckbox.svelte generated by Svelte v3.35.0 */

    const file$i = "src/components/form/InputCheckbox.svelte";

    function get_each_context$9(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	child_ctx[3] = list;
    	child_ctx[4] = i;
    	return child_ctx;
    }

    // (9:4) {#if f.label}
    function create_if_block_2$a(ctx) {
    	let label;
    	let t_value = /*f*/ ctx[0].label + "";
    	let t;

    	const block = {
    		c: function create() {
    			label = element("label");
    			t = text(t_value);
    			add_location(label, file$i, 10, 8, 192);
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
    		id: create_if_block_2$a.name,
    		type: "if",
    		source: "(9:4) {#if f.label}",
    		ctx
    	});

    	return block;
    }

    // (13:4) {#if f.hint}
    function create_if_block_1$e(ctx) {
    	let p;
    	let t_value = /*f*/ ctx[0].hint + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			add_location(p, file$i, 13, 8, 252);
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
    		id: create_if_block_1$e.name,
    		type: "if",
    		source: "(13:4) {#if f.hint}",
    		ctx
    	});

    	return block;
    }

    // (20:12) {:else}
    function create_else_block$8(ctx) {
    	let i;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "i-checkbox i-20 svelte-17p0g6d");
    			add_location(i, file$i, 20, 16, 566);
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
    		id: create_else_block$8.name,
    		type: "else",
    		source: "(20:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (18:12) {#if option.value}
    function create_if_block$g(ctx) {
    	let i;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "i-checkbox-selected i-20 svelte-17p0g6d");
    			add_location(i, file$i, 18, 16, 488);
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
    		id: create_if_block$g.name,
    		type: "if",
    		source: "(18:12) {#if option.value}",
    		ctx
    	});

    	return block;
    }

    // (16:4) {#each f.options as option}
    function create_each_block$9(ctx) {
    	let div;
    	let t0;
    	let t1_value = /*option*/ ctx[2].text + "";
    	let t1;
    	let t2;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*option*/ ctx[2].value) return create_if_block$g;
    		return create_else_block$8;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	function click_handler() {
    		return /*click_handler*/ ctx[1](/*option*/ ctx[2], /*each_value*/ ctx[3], /*option_index*/ ctx[4]);
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
    			add_location(div, file$i, 16, 8, 318);
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

    			if (dirty & /*f*/ 1 && t1_value !== (t1_value = /*option*/ ctx[2].text + "")) set_data_dev(t1, t1_value);

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
    		id: create_each_block$9.name,
    		type: "each",
    		source: "(16:4) {#each f.options as option}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let if_block0 = /*f*/ ctx[0].label && create_if_block_2$a(ctx);
    	let if_block1 = /*f*/ ctx[0].hint && create_if_block_1$e(ctx);
    	let each_value = /*f*/ ctx[0].options;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$9(get_each_context$9(ctx, each_value, i));
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
    			add_location(div, file$i, 7, 0, 77);
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
    					if_block0 = create_if_block_2$a(ctx);
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
    					if_block1 = create_if_block_1$e(ctx);
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
    	validate_slots("InputCheckbox", slots, []);
    	let { f } = $$props;
    	const writable_props = ["f"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<InputCheckbox> was created with unknown prop '${key}'`);
    	});

    	const click_handler = (option, each_value, option_index) => {
    		$$invalidate(0, each_value[option_index].value = !option.value, f);
    	};

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

    	return [f, click_handler];
    }

    class InputCheckbox extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, { f: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InputCheckbox",
    			options,
    			id: create_fragment$i.name
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
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function getDefaultExportFromCjs (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

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

    /* src/components/form/InputMultiItem.svelte generated by Svelte v3.35.0 */
    const file$h = "src/components/form/InputMultiItem.svelte";

    function get_each_context$8(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    // (23:0) {#if f.visible}
    function create_if_block$f(ctx) {
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
    	let if_block1 = /*f*/ ctx[0].selectable && create_if_block_3$6(ctx);
    	let if_block2 = /*f*/ ctx[0].pii && create_if_block_2$9(ctx);
    	let if_block3 = /*f*/ ctx[0].children && /*f*/ ctx[0].expanded && create_if_block_1$d(ctx);

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
    			add_location(div, file$h, 23, 4, 461);
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
    					if_block1 = create_if_block_3$6(ctx);
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
    					if_block2 = create_if_block_2$9(ctx);
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
    					if_block3 = create_if_block_1$d(ctx);
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
    		id: create_if_block$f.name,
    		type: "if",
    		source: "(23:0) {#if f.visible}",
    		ctx
    	});

    	return block;
    }

    // (25:8) {#if f.children}
    function create_if_block_5$3(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*f*/ ctx[0].expanded) return create_if_block_6$2;
    		if (/*f*/ ctx[0].expanded === false) return create_if_block_7$1;
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
    		source: "(25:8) {#if f.children}",
    		ctx
    	});

    	return block;
    }

    // (28:43) 
    function create_if_block_7$1(ctx) {
    	let i;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "i-chevron-down i-20");
    			add_location(i, file$h, 28, 16, 717);
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
    		id: create_if_block_7$1.name,
    		type: "if",
    		source: "(28:43) ",
    		ctx
    	});

    	return block;
    }

    // (26:12) {#if f.expanded}
    function create_if_block_6$2(ctx) {
    	let i;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "i-chevron-up i-20");
    			add_location(i, file$h, 26, 16, 578);
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
    		source: "(26:12) {#if f.expanded}",
    		ctx
    	});

    	return block;
    }

    // (32:8) {#if f.selectable}
    function create_if_block_3$6(ctx) {
    	let if_block_anchor;

    	function select_block_type_1(ctx, dirty) {
    		if (/*f*/ ctx[0].selected) return create_if_block_4$3;
    		return create_else_block$7;
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
    		id: create_if_block_3$6.name,
    		type: "if",
    		source: "(32:8) {#if f.selectable}",
    		ctx
    	});

    	return block;
    }

    // (35:12) {:else}
    function create_else_block$7(ctx) {
    	let i;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "i-checkbox i-20");
    			add_location(i, file$h, 35, 16, 1003);
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
    		id: create_else_block$7.name,
    		type: "else",
    		source: "(35:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (33:12) {#if f.selected}
    function create_if_block_4$3(ctx) {
    	let i;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "i-checkbox-selected i-20");
    			add_location(i, file$h, 33, 16, 901);
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
    		id: create_if_block_4$3.name,
    		type: "if",
    		source: "(33:12) {#if f.selected}",
    		ctx
    	});

    	return block;
    }

    // (40:8) {#if f.pii}
    function create_if_block_2$9(ctx) {
    	let i;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "title", "Personally Identifiable Information");
    			attr_dev(i, "class", "i-fingerprint i-16");
    			add_location(i, file$h, 40, 16, 1146);
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
    		id: create_if_block_2$9.name,
    		type: "if",
    		source: "(40:8) {#if f.pii}",
    		ctx
    	});

    	return block;
    }

    // (46:4) {#if f.children && f.expanded}
    function create_if_block_1$d(ctx) {
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
    		id: create_if_block_1$d.name,
    		type: "if",
    		source: "(46:4) {#if f.children && f.expanded}",
    		ctx
    	});

    	return block;
    }

    // (47:8) {#each f.children as f}
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
    		source: "(47:8) {#each f.children as f}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
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
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, { f: 0, indent: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InputMultiItem",
    			options,
    			id: create_fragment$h.name
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

    /* src/components/form/InputLookupItem.svelte generated by Svelte v3.35.0 */
    const file$g = "src/components/form/InputLookupItem.svelte";

    function get_each_context$7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    // (24:0) {#if f.visible}
    function create_if_block$e(ctx) {
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
    	let if_block0 = /*f*/ ctx[0].children && create_if_block_3$5(ctx);
    	let if_block1 = /*f*/ ctx[0].pii && create_if_block_2$8(ctx);
    	let if_block2 = /*f*/ ctx[0].children && /*f*/ ctx[0].expanded && create_if_block_1$c(ctx);

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
    			add_location(span, file$g, 32, 8, 885);
    			attr_dev(div, "class", div_class_value = "multi-item indent" + /*indent_class*/ ctx[2] + " svelte-1bmql47");
    			add_location(div, file$g, 24, 4, 509);
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
    					if_block0 = create_if_block_3$5(ctx);
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
    					if_block2 = create_if_block_1$c(ctx);
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
    		id: create_if_block$e.name,
    		type: "if",
    		source: "(24:0) {#if f.visible}",
    		ctx
    	});

    	return block;
    }

    // (26:8) {#if f.children}
    function create_if_block_3$5(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*f*/ ctx[0].expanded) return create_if_block_4$2;
    		if (/*f*/ ctx[0].expanded === false) return create_if_block_5$2;
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
    		id: create_if_block_3$5.name,
    		type: "if",
    		source: "(26:8) {#if f.children}",
    		ctx
    	});

    	return block;
    }

    // (29:43) 
    function create_if_block_5$2(ctx) {
    	let i;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "i-chevron-down i-20");
    			add_location(i, file$g, 29, 16, 765);
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
    		id: create_if_block_5$2.name,
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
    			add_location(i, file$g, 27, 16, 626);
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
    			add_location(i, file$g, 36, 16, 991);
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
    function create_if_block_1$c(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*f*/ ctx[0].children;
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
    			if (dirty & /*f, indent, handleItemUpdate*/ 19) {
    				each_value = /*f*/ ctx[0].children;
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
    		id: create_if_block_1$c.name,
    		type: "if",
    		source: "(42:4) {#if f.children && f.expanded}",
    		ctx
    	});

    	return block;
    }

    // (43:8) {#each f.children as f}
    function create_each_block$7(ctx) {
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
    		id: create_each_block$7.name,
    		type: "each",
    		source: "(43:8) {#each f.children as f}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*f*/ ctx[0].visible && create_if_block$e(ctx);

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
    					if_block = create_if_block$e(ctx);
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
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, { f: 0, indent: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InputLookupItem",
    			options,
    			id: create_fragment$g.name
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
    const file$f = "src/components/form/InputLookup.svelte";

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    // (129:4) {#if f.label}
    function create_if_block_3$4(ctx) {
    	let label;
    	let t_value = /*f*/ ctx[0].label + "";
    	let t;
    	let label_for_value;

    	const block = {
    		c: function create() {
    			label = element("label");
    			t = text(t_value);
    			attr_dev(label, "for", label_for_value = /*f*/ ctx[0].id);
    			add_location(label, file$f, 129, 8, 3525);
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
    		id: create_if_block_3$4.name,
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
    			add_location(p, file$f, 132, 8, 3598);
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
    function create_if_block_1$b(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "multi-mask svelte-lym9df");
    			add_location(div, file$f, 135, 8, 3648);
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
    		id: create_if_block_1$b.name,
    		type: "if",
    		source: "(135:4) {#if dd_in}",
    		ctx
    	});

    	return block;
    }

    // (143:12) {:else}
    function create_else_block$6(ctx) {
    	let i;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "i-chevron-up i-20");
    			add_location(i, file$f, 143, 16, 4143);
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
    		id: create_else_block$6.name,
    		type: "else",
    		source: "(143:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (141:12) {#if !dd_in}
    function create_if_block$d(ctx) {
    	let i;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "i-chevron-down i-20");
    			add_location(i, file$f, 141, 16, 4021);
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
    		id: create_if_block$d.name,
    		type: "if",
    		source: "(141:12) {#if !dd_in}",
    		ctx
    	});

    	return block;
    }

    // (149:12) {#each f.options as f}
    function create_each_block$6(ctx) {
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
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(149:12) {#each f.options as f}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
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
    	let if_block0 = /*f*/ ctx[0].label && create_if_block_3$4(ctx);
    	let if_block1 = /*f*/ ctx[0].hint && create_if_block_2$7(ctx);
    	let if_block2 = /*dd_in*/ ctx[1] && create_if_block_1$b(ctx);

    	function select_block_type(ctx, dirty) {
    		if (!/*dd_in*/ ctx[1]) return create_if_block$d;
    		return create_else_block$6;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block3 = current_block_type(ctx);
    	let each_value = /*f*/ ctx[0].options;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
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
    			add_location(input, file$f, 139, 12, 3805);
    			attr_dev(div0, "class", "form-control");
    			add_location(div0, file$f, 138, 8, 3766);
    			attr_dev(div1, "class", "multi-dropdown svelte-lym9df");
    			toggle_class(div1, "dd_in", /*dd_in*/ ctx[1]);
    			add_location(div1, file$f, 147, 8, 4266);
    			attr_dev(div2, "class", "multi-wrapper svelte-lym9df");
    			add_location(div2, file$f, 137, 4, 3730);
    			attr_dev(div3, "class", "form-item svelte-lym9df");
    			add_location(div3, file$f, 127, 0, 3456);
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
    					listen_dev(input, "focus", focus_handler$1, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*f*/ ctx[0].label) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_3$4(ctx);
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
    					if_block2 = create_if_block_1$b(ctx);
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
    					const child_ctx = get_each_context$6(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$6(child_ctx);
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
    		id: create_fragment$f.name,
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

    function instance$f($$self, $$props, $$invalidate) {
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
    		cull$1(f.options, f.answer);
    		selected = tree_to_selected$1(f.options);

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
    		filter_item: filter_item$1,
    		cull: cull$1,
    		w,
    		tree_to_selected: tree_to_selected$1,
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
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, { f: 0, channel: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InputLookup",
    			options,
    			id: create_fragment$f.name
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

    /* src/components/form/Shortcuts.svelte generated by Svelte v3.35.0 */
    const file$e = "src/components/form/Shortcuts.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (13:0) {#if f.shortcuts}
    function create_if_block$c(ctx) {
    	let div;
    	let each_value = /*f*/ ctx[0].shortcuts;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "shortcuts svelte-nlr8e4");
    			add_location(div, file$e, 13, 4, 250);
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
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
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
    		id: create_if_block$c.name,
    		type: "if",
    		source: "(13:0) {#if f.shortcuts}",
    		ctx
    	});

    	return block;
    }

    // (15:8) {#each f.shortcuts as shortcut}
    function create_each_block$5(ctx) {
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
    			add_location(div, file$e, 15, 12, 326);
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
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(15:8) {#each f.shortcuts as shortcut}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let if_block_anchor;
    	let if_block = /*f*/ ctx[0].shortcuts && create_if_block$c(ctx);

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
    					if_block = create_if_block$c(ctx);
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
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, { f: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Shortcuts",
    			options,
    			id: create_fragment$e.name
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

    /* src/components/form/InputMatrix.svelte generated by Svelte v3.35.0 */
    const file$d = "src/components/form/InputMatrix.svelte";

    // (15:4) {#if f.label}
    function create_if_block_1$a(ctx) {
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
    			add_location(label, file$d, 15, 8, 298);
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
    		id: create_if_block_1$a.name,
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
    			add_location(span, file$d, 15, 54, 344);
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
    			add_location(p, file$d, 18, 8, 433);
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

    function create_fragment$d(ctx) {
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
    	let if_block0 = /*f*/ ctx[0].label && create_if_block_1$a(ctx);
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
    			add_location(div0, file$d, 21, 8, 523);
    			attr_dev(i, "class", "i-hinton-plot  i-20");
    			add_location(i, file$d, 22, 8, 724);
    			attr_dev(div1, "class", "form-control svelte-1l2uey6");
    			add_location(div1, file$d, 20, 4, 463);
    			attr_dev(div2, "class", "form-item");
    			add_location(div2, file$d, 13, 0, 248);
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
    					if_block0 = create_if_block_1$a(ctx);
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
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { f: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InputMatrix",
    			options,
    			id: create_fragment$d.name
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

    /* src/components/form/InputMulti.svelte generated by Svelte v3.35.0 */
    const file$c = "src/components/form/InputMulti.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[27] = list[i];
    	return child_ctx;
    }

    // (137:4) {#if f.label}
    function create_if_block_10(ctx) {
    	let label;
    	let t_value = /*f*/ ctx[0].label + "";
    	let t;
    	let label_for_value;

    	const block = {
    		c: function create() {
    			label = element("label");
    			t = text(t_value);
    			attr_dev(label, "for", label_for_value = /*f*/ ctx[0].id);
    			add_location(label, file$c, 137, 8, 3697);
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
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(137:4) {#if f.label}",
    		ctx
    	});

    	return block;
    }

    // (140:4) {#if f.hint}
    function create_if_block_9(ctx) {
    	let p;
    	let t_value = /*f*/ ctx[0].hint + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			add_location(p, file$c, 140, 8, 3770);
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
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(140:4) {#if f.hint}",
    		ctx
    	});

    	return block;
    }

    // (143:4) {#if f.max_warning}
    function create_if_block_7(ctx) {
    	let if_block_anchor;
    	let if_block = /*selected*/ ctx[4].length >= /*f*/ ctx[0].max_warning.value && create_if_block_8(ctx);

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
    					if_block = create_if_block_8(ctx);
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
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(143:4) {#if f.max_warning}",
    		ctx
    	});

    	return block;
    }

    // (144:8) {#if selected.length >= f.max_warning.value}
    function create_if_block_8(ctx) {
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
    			add_location(i, file$c, 144, 30, 3903);
    			attr_dev(p, "class", "svelte-1a5p6xm");
    			add_location(p, file$c, 144, 57, 3930);
    			attr_dev(div, "class", "idea svelte-1a5p6xm");
    			add_location(div, file$c, 144, 12, 3885);
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
    		id: create_if_block_8.name,
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
    			add_location(div, file$c, 148, 8, 4015);
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
    function create_if_block_3$3(ctx) {
    	let t;
    	let if_block_anchor;
    	let each_value_2 = /*selected_shortlist*/ ctx[5];
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
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
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
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
    		id: create_if_block_3$3.name,
    		type: "if",
    		source: "(151:4) {#if selected_shortlist.length}",
    		ctx
    	});

    	return block;
    }

    // (155:12) {:else}
    function create_else_block_1(ctx) {
    	let div;
    	let t_value = /*tag*/ ctx[27].value + "";
    	let t;
    	let i;
    	let mounted;
    	let dispose;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[11](/*tag*/ ctx[27]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			i = element("i");
    			attr_dev(i, "class", "i-close i-20");
    			add_location(i, file$c, 155, 80, 4385);
    			attr_dev(div, "class", "tag svelte-1a5p6xm");
    			add_location(div, file$c, 155, 16, 4321);
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
    			if (dirty & /*selected_shortlist*/ 32 && t_value !== (t_value = /*tag*/ ctx[27].value + "")) set_data_dev(t, t_value);
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
    		source: "(155:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (153:12) {#if tag.key == 'record_id'}
    function create_if_block_5$1(ctx) {
    	let div;
    	let t_value = /*tag*/ ctx[27].value + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "tag no_delete svelte-1a5p6xm");
    			add_location(div, file$c, 153, 16, 4240);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*selected_shortlist*/ 32 && t_value !== (t_value = /*tag*/ ctx[27].value + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$1.name,
    		type: "if",
    		source: "(153:12) {#if tag.key == 'record_id'}",
    		ctx
    	});

    	return block;
    }

    // (152:8) {#each selected_shortlist as tag}
    function create_each_block_2(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*tag*/ ctx[27].key == "record_id") return create_if_block_5$1;
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
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(152:8) {#each selected_shortlist as tag}",
    		ctx
    	});

    	return block;
    }

    // (159:8) {#if selected_shortlist.length < selected.length}
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
    			attr_dev(div, "class", "tag no_delete svelte-1a5p6xm");
    			add_location(div, file$c, 159, 12, 4524);
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
    		source: "(159:8) {#if selected_shortlist.length < selected.length}",
    		ctx
    	});

    	return block;
    }

    // (168:12) {:else}
    function create_else_block$5(ctx) {
    	let i;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "i-chevron-up i-20");
    			add_location(i, file$c, 168, 16, 4997);
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
    		id: create_else_block$5.name,
    		type: "else",
    		source: "(168:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (166:12) {#if !dd_in}
    function create_if_block_2$5(ctx) {
    	let i;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "i-chevron-down i-20");
    			add_location(i, file$c, 166, 16, 4887);
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
    		id: create_if_block_2$5.name,
    		type: "if",
    		source: "(166:12) {#if !dd_in}",
    		ctx
    	});

    	return block;
    }

    // (186:40) 
    function create_if_block_1$9(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value_1 = /*selected*/ ctx[4];
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
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
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
    		id: create_if_block_1$9.name,
    		type: "if",
    		source: "(186:40) ",
    		ctx
    	});

    	return block;
    }

    // (179:12) {#if tab == 'all'}
    function create_if_block$a(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*f*/ ctx[0].options;
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
    			if (dirty & /*f, handleItemUpdate*/ 129) {
    				each_value = /*f*/ ctx[0].options;
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
    		id: create_if_block$a.name,
    		type: "if",
    		source: "(179:12) {#if tab == 'all'}",
    		ctx
    	});

    	return block;
    }

    // (187:16) {#each selected as f}
    function create_each_block_1(ctx) {
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
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(187:16) {#each selected as f}",
    		ctx
    	});

    	return block;
    }

    // (180:16) {#each f.options as f}
    function create_each_block$4(ctx) {
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
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(180:16) {#each f.options as f}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
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
    	let if_block0 = /*f*/ ctx[0].label && create_if_block_10(ctx);
    	let if_block1 = /*f*/ ctx[0].hint && create_if_block_9(ctx);
    	let if_block2 = /*f*/ ctx[0].max_warning && create_if_block_7(ctx);
    	let if_block3 = /*dd_in*/ ctx[1] && create_if_block_6$1(ctx);
    	let if_block4 = /*selected_shortlist*/ ctx[5].length && create_if_block_3$3(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (!/*dd_in*/ ctx[1]) return create_if_block_2$5;
    		return create_else_block$5;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block5 = current_block_type(ctx);
    	const if_block_creators = [create_if_block$a, create_if_block_1$9];
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
    			add_location(input, file$c, 164, 12, 4707);
    			attr_dev(div0, "class", "form-control");
    			add_location(div0, file$c, 163, 8, 4668);
    			attr_dev(a0, "href", "#ehs/incidents/dashboard");
    			attr_dev(a0, "class", "svelte-1a5p6xm");
    			add_location(a0, file$c, 174, 35, 5238);
    			attr_dev(li0, "class", "select svelte-1a5p6xm");
    			add_location(li0, file$c, 174, 16, 5219);
    			attr_dev(a1, "href", "#ehs/incidents/dashboard");
    			attr_dev(a1, "class", "svelte-1a5p6xm");
    			toggle_class(a1, "active", /*tab*/ ctx[2] == "all");
    			add_location(a1, file$c, 175, 20, 5361);
    			add_location(li1, file$c, 175, 16, 5357);
    			attr_dev(a2, "href", "#ehs/incidents/dashboard");
    			attr_dev(a2, "class", "svelte-1a5p6xm");
    			toggle_class(a2, "active", /*tab*/ ctx[2] == "selected");
    			add_location(a2, file$c, 176, 20, 5511);
    			add_location(li2, file$c, 176, 16, 5507);
    			attr_dev(ul, "class", "tabs svelte-1a5p6xm");
    			add_location(ul, file$c, 173, 12, 5185);
    			attr_dev(div1, "class", "multi-dropdown svelte-1a5p6xm");
    			toggle_class(div1, "dd_in", /*dd_in*/ ctx[1]);
    			add_location(div1, file$c, 172, 8, 5132);
    			attr_dev(div2, "class", "multi-wrapper svelte-1a5p6xm");
    			add_location(div2, file$c, 162, 4, 4632);
    			attr_dev(div3, "class", "form-item svelte-1a5p6xm");
    			add_location(div3, file$c, 135, 0, 3628);
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

    			/*div3_binding*/ ctx[18](div3);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[12]),
    					listen_dev(input, "focus", focus_handler, false, false, false),
    					listen_dev(a0, "click", prevent_default(/*click_handler_4*/ ctx[15]), false, true, false),
    					listen_dev(a1, "click", prevent_default(/*click_handler_5*/ ctx[16]), false, true, false),
    					listen_dev(a2, "click", prevent_default(/*click_handler_6*/ ctx[17]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*f*/ ctx[0].label) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_10(ctx);
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
    					if_block1 = create_if_block_9(ctx);
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
    					if_block2 = create_if_block_7(ctx);
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
    					if_block4 = create_if_block_3$3(ctx);
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

    			/*div3_binding*/ ctx[18](null);
    			mounted = false;
    			run_all(dispose);
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

    function instance$c($$self, $$props, $$invalidate) {
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
    		$$invalidate(2, tab = "all");
    	};

    	const click_handler_6 = () => {
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
    		click_handler_6,
    		div3_binding
    	];
    }

    class InputMulti extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { f: 0, channel: 9 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InputMulti",
    			options,
    			id: create_fragment$c.name
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

    /* src/components/form/InputSelect.svelte generated by Svelte v3.35.0 */

    const file$b = "src/components/form/InputSelect.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (8:4) {#if f.label}
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
    			add_location(label, file$b, 8, 8, 126);
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
    		source: "(8:4) {#if f.label}",
    		ctx
    	});

    	return block;
    }

    // (11:4) {#if f.hint}
    function create_if_block$9(ctx) {
    	let p;
    	let t_value = /*f*/ ctx[0].hint + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			add_location(p, file$b, 11, 8, 199);
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
    		source: "(11:4) {#if f.hint}",
    		ctx
    	});

    	return block;
    }

    // (15:8) {#each f.options as option}
    function create_each_block$3(ctx) {
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
    			add_location(option, file$b, 15, 12, 330);
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
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(15:8) {#each f.options as option}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let select;
    	let mounted;
    	let dispose;
    	let if_block0 = /*f*/ ctx[0].label && create_if_block_1$8(ctx);
    	let if_block1 = /*f*/ ctx[0].hint && create_if_block$9(ctx);
    	let each_value = /*f*/ ctx[0].options;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
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
    			add_location(select, file$b, 13, 4, 229);
    			attr_dev(div, "class", "form-item");
    			add_location(div, file$b, 6, 0, 76);
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
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
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
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { f: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InputSelect",
    			options,
    			id: create_fragment$b.name
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
    const file$a = "src/components/form/InputText.svelte";

    // (8:4) {#if f.label}
    function create_if_block_1$7(ctx) {
    	let label;
    	let t0_value = /*f*/ ctx[0].label + "";
    	let t0;
    	let t1;
    	let label_for_value;
    	let if_block = /*f*/ ctx[0].optional && create_if_block_2$4(ctx);

    	const block = {
    		c: function create() {
    			label = element("label");
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block) if_block.c();
    			attr_dev(label, "for", label_for_value = /*f*/ ctx[0].id);
    			add_location(label, file$a, 8, 8, 137);
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
    					if_block = create_if_block_2$4(ctx);
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
    		id: create_if_block_1$7.name,
    		type: "if",
    		source: "(8:4) {#if f.label}",
    		ctx
    	});

    	return block;
    }

    // (9:38) {#if f.optional}
    function create_if_block_2$4(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "(Optional)";
    			attr_dev(span, "class", "optional");
    			add_location(span, file$a, 8, 54, 183);
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
    		id: create_if_block_2$4.name,
    		type: "if",
    		source: "(9:38) {#if f.optional}",
    		ctx
    	});

    	return block;
    }

    // (11:4) {#if f.hint}
    function create_if_block$8(ctx) {
    	let p;
    	let t_value = /*f*/ ctx[0].hint + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			add_location(p, file$a, 11, 8, 272);
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
    		source: "(11:4) {#if f.hint}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
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
    	let if_block0 = /*f*/ ctx[0].label && create_if_block_1$7(ctx);
    	let if_block1 = /*f*/ ctx[0].hint && create_if_block$8(ctx);

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
    			add_location(input, file$a, 13, 4, 302);
    			attr_dev(div, "class", "form-item");
    			add_location(div, file$a, 6, 0, 87);
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
    					if_block1 = create_if_block$8(ctx);
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
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { f: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InputText",
    			options,
    			id: create_fragment$a.name
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

    /* src/components/form/InputTextarea.svelte generated by Svelte v3.35.0 */

    const file$9 = "src/components/form/InputTextarea.svelte";

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
    		id: create_if_block_1$6.name,
    		type: "if",
    		source: "(7:4) {#if f.label}",
    		ctx
    	});

    	return block;
    }

    // (10:4) {#if f.hint}
    function create_if_block$7(ctx) {
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
    		id: create_if_block$7.name,
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
    	let if_block0 = /*f*/ ctx[0].label && create_if_block_1$6(ctx);
    	let if_block1 = /*f*/ ctx[0].hint && create_if_block$7(ctx);

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
    					if_block1 = create_if_block$7(ctx);
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

    /*! 5.0.1 / Consumer  */

    var pubnub_min = createCommonjsModule(function (module, exports) {
    !function(e,t){module.exports=t();}(window,(function(){return function(e){var t={};function n(r){if(t[r])return t[r].exports;var i=t[r]={i:r,l:!1,exports:{}};return e[r].call(i.exports,i,i.exports,n),i.l=!0,i.exports}return n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r});},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0});},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var i in e)n.d(r,i,function(t){return e[t]}.bind(null,i));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=31)}([function(e,t){e.exports=function(e){return e&&e.__esModule?e:{default:e}},e.exports.default=e.exports,e.exports.__esModule=!0;},function(e,t,n){Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;t.default={PNTimeOperation:"PNTimeOperation",PNHistoryOperation:"PNHistoryOperation",PNDeleteMessagesOperation:"PNDeleteMessagesOperation",PNFetchMessagesOperation:"PNFetchMessagesOperation",PNMessageCounts:"PNMessageCountsOperation",PNSubscribeOperation:"PNSubscribeOperation",PNUnsubscribeOperation:"PNUnsubscribeOperation",PNPublishOperation:"PNPublishOperation",PNSignalOperation:"PNSignalOperation",PNAddMessageActionOperation:"PNAddActionOperation",PNRemoveMessageActionOperation:"PNRemoveMessageActionOperation",PNGetMessageActionsOperation:"PNGetMessageActionsOperation",PNCreateUserOperation:"PNCreateUserOperation",PNUpdateUserOperation:"PNUpdateUserOperation",PNDeleteUserOperation:"PNDeleteUserOperation",PNGetUserOperation:"PNGetUsersOperation",PNGetUsersOperation:"PNGetUsersOperation",PNCreateSpaceOperation:"PNCreateSpaceOperation",PNUpdateSpaceOperation:"PNUpdateSpaceOperation",PNDeleteSpaceOperation:"PNDeleteSpaceOperation",PNGetSpaceOperation:"PNGetSpacesOperation",PNGetSpacesOperation:"PNGetSpacesOperation",PNGetMembersOperation:"PNGetMembersOperation",PNUpdateMembersOperation:"PNUpdateMembersOperation",PNGetMembershipsOperation:"PNGetMembershipsOperation",PNUpdateMembershipsOperation:"PNUpdateMembershipsOperation",PNListFilesOperation:"PNListFilesOperation",PNGenerateUploadUrlOperation:"PNGenerateUploadUrlOperation",PNPublishFileOperation:"PNPublishFileOperation",PNGetFileUrlOperation:"PNGetFileUrlOperation",PNDownloadFileOperation:"PNDownloadFileOperation",PNGetAllUUIDMetadataOperation:"PNGetAllUUIDMetadataOperation",PNGetUUIDMetadataOperation:"PNGetUUIDMetadataOperation",PNSetUUIDMetadataOperation:"PNSetUUIDMetadataOperation",PNRemoveUUIDMetadataOperation:"PNRemoveUUIDMetadataOperation",PNGetAllChannelMetadataOperation:"PNGetAllChannelMetadataOperation",PNGetChannelMetadataOperation:"PNGetChannelMetadataOperation",PNSetChannelMetadataOperation:"PNSetChannelMetadataOperation",PNRemoveChannelMetadataOperation:"PNRemoveChannelMetadataOperation",PNSetMembersOperation:"PNSetMembersOperation",PNSetMembershipsOperation:"PNSetMembershipsOperation",PNPushNotificationEnabledChannelsOperation:"PNPushNotificationEnabledChannelsOperation",PNRemoveAllPushNotificationsOperation:"PNRemoveAllPushNotificationsOperation",PNWhereNowOperation:"PNWhereNowOperation",PNSetStateOperation:"PNSetStateOperation",PNHereNowOperation:"PNHereNowOperation",PNGetStateOperation:"PNGetStateOperation",PNHeartbeatOperation:"PNHeartbeatOperation",PNChannelGroupsOperation:"PNChannelGroupsOperation",PNRemoveGroupOperation:"PNRemoveGroupOperation",PNChannelsForGroupOperation:"PNChannelsForGroupOperation",PNAddChannelsToGroupOperation:"PNAddChannelsToGroupOperation",PNRemoveChannelsFromGroupOperation:"PNRemoveChannelsFromGroupOperation",PNAccessManagerGrant:"PNAccessManagerGrant",PNAccessManagerGrantToken:"PNAccessManagerGrantToken",PNAccessManagerAudit:"PNAccessManagerAudit",PNAccessManagerRevokeToken:"PNAccessManagerRevokeToken",PNHandshakeOperation:"PNHandshakeOperation",PNReceiveMessagesOperation:"PNReceiveMessagesOperation"},e.exports=t.default;},function(e,t,n){e.exports={};},function(e,t,n){(function(t){function n(e){return encodeURIComponent(e).replace(/[!~*'()]/g,(function(e){return "%".concat(e.charCodeAt(0).toString(16).toUpperCase())}))}function r(e){return function(e){var t=[];return Object.keys(e).forEach((function(e){return t.push(e)})),t}(e).sort()}var i="The Objects v1 API has been deprecated.\nYou can learn more about Objects v2 API at https://www.pubnub.com/docs/web-javascript/api-reference-objects.\nIf you have questions about the Objects v2 API or require additional help with migrating to the new data model, please contact PubNub Support at support@pubnub.com.";e.exports={signPamFromParams:function(e){return r(e).map((function(t){return "".concat(t,"=").concat(n(e[t]))})).join("&")},endsWith:function(e,t){return -1!==e.indexOf(t,this.length-t.length)},createPromise:function(){var e,t;return {promise:new Promise((function(n,r){e=n,t=r;})),reject:t,fulfill:e}},encodeString:n,deprecated:function(e){return function(){var n,r;void 0!==t&&("test"!==(null===(n=t)||void 0===n||null===(r=n.env)||void 0===r?void 0:"production")&&console.warn(i));return e.apply(void 0,arguments)}}};}).call(this,n(42));},function(e,t){e.exports=function(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e},e.exports.default=e.exports,e.exports.__esModule=!0;},function(e,t){e.exports=function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")},e.exports.default=e.exports,e.exports.__esModule=!0;},function(e,t){function n(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r);}}e.exports=function(e,t,r){return t&&n(e.prototype,t),r&&n(e,r),e},e.exports.default=e.exports,e.exports.__esModule=!0;},function(e,t){function n(t){return "function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?(e.exports=n=function(e){return typeof e},e.exports.default=e.exports,e.exports.__esModule=!0):(e.exports=n=function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},e.exports.default=e.exports,e.exports.__esModule=!0),n(t)}e.exports=n,e.exports.default=e.exports,e.exports.__esModule=!0;},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var i=r(n(5)),o=r(n(6)),a=r(n(4)),u=r(n(17)),s=(n(2),function(){function e(t){var n,r,o,s=t.setup;if((0, i.default)(this,e),(0, a.default)(this,"subscribeKey",void 0),(0, a.default)(this,"publishKey",void 0),(0, a.default)(this,"secretKey",void 0),(0, a.default)(this,"cipherKey",void 0),(0, a.default)(this,"authKey",void 0),(0, a.default)(this,"UUID",void 0),(0, a.default)(this,"proxy",void 0),(0, a.default)(this,"instanceId",void 0),(0, a.default)(this,"sdkName",void 0),(0, a.default)(this,"sdkFamily",void 0),(0, a.default)(this,"partnerId",void 0),(0, a.default)(this,"filterExpression",void 0),(0, a.default)(this,"suppressLeaveEvents",void 0),(0, a.default)(this,"secure",void 0),(0, a.default)(this,"origin",void 0),(0, a.default)(this,"logVerbosity",void 0),(0, a.default)(this,"useInstanceId",void 0),(0, a.default)(this,"useRequestId",void 0),(0, a.default)(this,"keepAlive",void 0),(0, a.default)(this,"keepAliveSettings",void 0),(0, a.default)(this,"autoNetworkDetection",void 0),(0, a.default)(this,"announceSuccessfulHeartbeats",void 0),(0, a.default)(this,"announceFailedHeartbeats",void 0),(0, a.default)(this,"_presenceTimeout",void 0),(0, a.default)(this,"_heartbeatInterval",void 0),(0, a.default)(this,"_subscribeRequestTimeout",void 0),(0, a.default)(this,"_transactionalRequestTimeout",void 0),(0, a.default)(this,"_useSendBeacon",void 0),(0, a.default)(this,"_PNSDKSuffix",void 0),(0, a.default)(this,"requestMessageCountThreshold",void 0),(0, a.default)(this,"restore",void 0),(0, a.default)(this,"dedupeOnSubscribe",void 0),(0, a.default)(this,"maximumCacheSize",void 0),(0, a.default)(this,"customEncrypt",void 0),(0, a.default)(this,"customDecrypt",void 0),(0, a.default)(this,"fileUploadPublishRetryLimit",void 0),(0, a.default)(this,"useRandomIVs",void 0),(0, a.default)(this,"enableSubscribeBeta",void 0),this._PNSDKSuffix={},this.instanceId="pn-".concat(u.default.createUUID()),this.secretKey=s.secretKey||s.secret_key,this.subscribeKey=s.subscribeKey||s.subscribe_key,this.publishKey=s.publishKey||s.publish_key,this.sdkName=s.sdkName,this.sdkFamily=s.sdkFamily,this.partnerId=s.partnerId,this.setAuthKey(s.authKey),this.setCipherKey(s.cipherKey),this.setFilterExpression(s.filterExpression),"string"!=typeof s.origin&&!Array.isArray(s.origin)&&void 0!==s.origin)throw new Error("Origin must be either undefined, a string or a list of strings.");if(this.origin=s.origin||Array.from({length:20},(function(e,t){return "ps".concat(t+1,".pndsn.com")})),this.secure=s.ssl||!1,this.restore=s.restore||!1,this.proxy=s.proxy,this.keepAlive=s.keepAlive,this.keepAliveSettings=s.keepAliveSettings,this.autoNetworkDetection=s.autoNetworkDetection||!1,this.dedupeOnSubscribe=s.dedupeOnSubscribe||!1,this.maximumCacheSize=s.maximumCacheSize||100,this.customEncrypt=s.customEncrypt,this.customDecrypt=s.customDecrypt,this.fileUploadPublishRetryLimit=null!==(n=s.fileUploadPublishRetryLimit)&&void 0!==n?n:5,this.useRandomIVs=null===(r=s.useRandomIVs)||void 0===r||r,this.enableSubscribeBeta=null!==(o=s.enableSubscribeBeta)&&void 0!==o&&o,s.enableSubscribeBeta&&!0===s.enableSubscribeBeta)throw new Error("not implemented");"undefined"!=typeof location&&"https:"===location.protocol&&(this.secure=!0),this.logVerbosity=s.logVerbosity||!1,this.suppressLeaveEvents=s.suppressLeaveEvents||!1,this.announceFailedHeartbeats=s.announceFailedHeartbeats||!0,this.announceSuccessfulHeartbeats=s.announceSuccessfulHeartbeats||!1,this.useInstanceId=s.useInstanceId||!1,this.useRequestId=s.useRequestId||!1,this.requestMessageCountThreshold=s.requestMessageCountThreshold,this.setTransactionTimeout(s.transactionalRequestTimeout||15e3),this.setSubscribeTimeout(s.subscribeRequestTimeout||31e4),this.setSendBeaconConfig(s.useSendBeacon||!0),s.presenceTimeout?this.setPresenceTimeout(s.presenceTimeout):this._presenceTimeout=300,null!=s.heartbeatInterval&&this.setHeartbeatInterval(s.heartbeatInterval),this.setUUID(s.uuid);}return (0, o.default)(e,[{key:"getAuthKey",value:function(){return this.authKey}},{key:"setAuthKey",value:function(e){return this.authKey=e,this}},{key:"setCipherKey",value:function(e){return this.cipherKey=e,this}},{key:"getUUID",value:function(){return this.UUID}},{key:"setUUID",value:function(e){if(!e||"string"!=typeof e||0===e.trim().length)throw new Error("Missing uuid parameter. Provide a valid string uuid");return this.UUID=e,this}},{key:"getFilterExpression",value:function(){return this.filterExpression}},{key:"setFilterExpression",value:function(e){return this.filterExpression=e,this}},{key:"getPresenceTimeout",value:function(){return this._presenceTimeout}},{key:"setPresenceTimeout",value:function(e){return e>=20?this._presenceTimeout=e:(this._presenceTimeout=20,console.log("WARNING: Presence timeout is less than the minimum. Using minimum value: ",this._presenceTimeout)),this.setHeartbeatInterval(this._presenceTimeout/2-1),this}},{key:"setProxy",value:function(e){this.proxy=e;}},{key:"getHeartbeatInterval",value:function(){return this._heartbeatInterval}},{key:"setHeartbeatInterval",value:function(e){return this._heartbeatInterval=e,this}},{key:"getSubscribeTimeout",value:function(){return this._subscribeRequestTimeout}},{key:"setSubscribeTimeout",value:function(e){return this._subscribeRequestTimeout=e,this}},{key:"getTransactionTimeout",value:function(){return this._transactionalRequestTimeout}},{key:"setTransactionTimeout",value:function(e){return this._transactionalRequestTimeout=e,this}},{key:"isSendBeaconEnabled",value:function(){return this._useSendBeacon}},{key:"setSendBeaconConfig",value:function(e){return this._useSendBeacon=e,this}},{key:"getVersion",value:function(){return "5.0.1"}},{key:"_addPnsdkSuffix",value:function(e,t){this._PNSDKSuffix[e]=t;}},{key:"_getPnsdkSuffix",value:function(e){var t=this;return Object.keys(this._PNSDKSuffix).reduce((function(n,r){return n+e+t._PNSDKSuffix[r]}),"")}}]),e}());t.default=s,e.exports=t.default;},function(e,t,n){var r=n(80),i=n(81),o=n(82),a=n(84);e.exports=function(e,t){return r(e)||i(e,t)||o(e,t)||a()},e.exports.default=e.exports,e.exports.__esModule=!0;},function(e,t,n){Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;t.default={PNNetworkUpCategory:"PNNetworkUpCategory",PNNetworkDownCategory:"PNNetworkDownCategory",PNNetworkIssuesCategory:"PNNetworkIssuesCategory",PNTimeoutCategory:"PNTimeoutCategory",PNBadRequestCategory:"PNBadRequestCategory",PNAccessDeniedCategory:"PNAccessDeniedCategory",PNUnknownCategory:"PNUnknownCategory",PNReconnectedCategory:"PNReconnectedCategory",PNConnectedCategory:"PNConnectedCategory",PNRequestMessageCountExceededCategory:"PNRequestMessageCountExceededCategory"},e.exports=t.default;},function(e,t,n){e.exports=n(75);},function(e,t){function n(e,t,n,r,i,o,a){try{var u=e[o](a),s=u.value;}catch(e){return void n(e)}u.done?t(s):Promise.resolve(s).then(r,i);}e.exports=function(e){return function(){var t=this,r=arguments;return new Promise((function(i,o){var a=e.apply(t,r);function u(e){n(a,i,o,u,s,"next",e);}function s(e){n(a,i,o,u,s,"throw",e);}u(void 0);}))}},e.exports.default=e.exports,e.exports.__esModule=!0;},function(e,t){function n(t){return e.exports=n=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)},e.exports.default=e.exports,e.exports.__esModule=!0,n(t)}e.exports=n,e.exports.default=e.exports,e.exports.__esModule=!0;},function(e,t,n){var r=n(15);e.exports=function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&r(e,t);},e.exports.default=e.exports,e.exports.__esModule=!0;},function(e,t){function n(t,r){return e.exports=n=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e},e.exports.default=e.exports,e.exports.__esModule=!0,n(t,r)}e.exports=n,e.exports.default=e.exports,e.exports.__esModule=!0;},function(e,t,n){var r=n(7).default,i=n(22);e.exports=function(e,t){if(t&&("object"===r(t)||"function"==typeof t))return t;if(void 0!==t)throw new TypeError("Derived constructors may only return object or undefined");return i(e)},e.exports.default=e.exports,e.exports.__esModule=!0;},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var i=r(n(34)),o={createUUID:function(){return i.default.uuid?i.default.uuid():(0, i.default)()}};t.default=o,e.exports=t.default;},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.PubNubError=void 0,t.createValidationError=b,t.default=function(e,t){var n=e.networking,r=e.config,i=e.telemetryManager,o=e.tokenManager,a=l.default.createUUID(),u=null,s=null,c={};t.getOperation()===d.default.PNTimeOperation||t.getOperation()===d.default.PNChannelGroupsOperation?u=arguments.length<=2?void 0:arguments[2]:(c=arguments.length<=2?void 0:arguments[2],u=arguments.length<=3?void 0:arguments[3]);"undefined"==typeof Promise||u||(s=f.default.createPromise());var h=t.validateParams(e,c);if(h)return u?u(b(h)):s?(s.reject(new v("Validation failed, check status for details",b(h))),s.promise):void 0;var g,S=t.prepareParams(e,c),w=m(t,e,c),k={url:w,operation:t.getOperation(),timeout:t.getRequestTimeout(e),headers:t.getRequestHeaders?t.getRequestHeaders():{},ignoreBody:"function"==typeof t.ignoreBody&&t.ignoreBody(e),forceBuffered:"function"==typeof t.forceBuffered?t.forceBuffered(e,c):null,abortSignal:"function"==typeof t.getAbortSignal?t.getAbortSignal(e,c):null};S.uuid=r.UUID,S.pnsdk=_(r);var T=i.operationsLatencyForRequest();Object.keys(T).length&&(S=y(y({},S),T));r.useInstanceId&&(S.instanceid=r.instanceId);r.useRequestId&&(S.requestid=a);if(t.isAuthSupported()){var x=o.getToken()||r.getAuthKey();x&&(S.auth=x);}r.secretKey&&O(e,w,S,c,t);var A=function(n,r){var o;if(n.error)return t.handleError&&t.handleError(e,c,n),void(u?u(n):s&&s.reject(new v("PubNub call failed, check status for details",n)));i.stopLatencyMeasure(t.getOperation(),a);var l=t.handleResponse(e,r,c);"function"!=typeof(null===(o=l)||void 0===o?void 0:o.then)&&(l=Promise.resolve(l)),l.then((function(e){u?u(n,e):s&&s.fulfill(e);})).catch((function(e){if(u){var n=e;t.getOperation()===d.default.PNSubscribeOperation&&(n={statusCode:400,error:!0,operation:t.getOperation(),errorData:e,category:p.default.PNUnknownCategory}),u(n,null);}else s&&s.reject(new v("PubNub call failed, check status for details",e));}));};if(i.startLatencyMeasure(t.getOperation(),a),"POST"===P(e,t,c)){var M=t.postPayload(e,c);g=n.POST(S,M,k,A);}else if("PATCH"===P(e,t,c)){var E=t.patchPayload(e,c);g=n.PATCH(S,E,k,A);}else g="DELETE"===P(e,t,c)?n.DELETE(S,k,A):"GETFILE"===P(e,t,c)?n.GETFILE(S,k,A):n.GET(S,k,A);if(t.getOperation()===d.default.PNSubscribeOperation)return g;if(s)return s.promise},t.generatePNSDK=_,t.signRequest=O;var i=r(n(4)),o=r(n(5)),a=r(n(14)),u=r(n(16)),s=r(n(13)),c=r(n(48)),l=r(n(17)),f=(n(2),r(n(3))),d=(r(n(8)),r(n(1))),p=r(n(10));function h(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r);}return n}function y(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?h(Object(n),!0).forEach((function(t){(0, i.default)(e,t,n[t]);})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):h(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t));}));}return e}function g(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return !1;if(Reflect.construct.sham)return !1;if("function"==typeof Proxy)return !0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return !1}}();return function(){var n,r=(0, s.default)(e);if(t){var i=(0, s.default)(this).constructor;n=Reflect.construct(r,arguments,i);}else n=r.apply(this,arguments);return (0, u.default)(this,n)}}var v=function(e){(0, a.default)(n,e);var t=g(n);function n(e,r){var i;return (0, o.default)(this,n),(i=t.call(this,e)).name=i.constructor.name,i.status=r,i.message=e,i}return n}((0, c.default)(Error));function b(e){return (t={message:e}).type="validationError",t.error=!0,t;var t;}function m(e,t,n){return e.usePost&&e.usePost(t,n)?e.postURL(t,n):e.usePatch&&e.usePatch(t,n)?e.patchURL(t,n):e.useGetFile&&e.useGetFile(t,n)?e.getFileURL(t,n):e.getURL(t,n)}function _(e){if(e.sdkName)return e.sdkName;var t="PubNub-JS-".concat(e.sdkFamily);e.partnerId&&(t+="-".concat(e.partnerId)),t+="/".concat(e.getVersion());var n=e._getPnsdkSuffix(" ");return n.length>0&&(t+=n),t}function P(e,t,n){return t.usePost&&t.usePost(e,n)?"POST":t.usePatch&&t.usePatch(e,n)?"PATCH":t.useDelete&&t.useDelete(e,n)?"DELETE":t.useGetFile&&t.useGetFile(e,n)?"GETFILE":"GET"}function O(e,t,n,r,i){var o=e.config,a=e.crypto,u=P(e,i,r);n.timestamp=Math.floor((new Date).getTime()/1e3),"PNPublishOperation"===i.getOperation()&&i.usePost&&i.usePost(e,r)&&(u="GET"),"GETFILE"===u&&(u="GET");var s="".concat(u,"\n").concat(o.publishKey,"\n").concat(t,"\n").concat(f.default.signPamFromParams(n),"\n");if("POST"===u){var c=i.postPayload(e,r);s+="string"==typeof c?c:JSON.stringify(c);}else if("PATCH"===u){var l=i.patchPayload(e,r);s+="string"==typeof l?l:JSON.stringify(l);}var d="v2.".concat(a.HMACSHA256(s));d=(d=(d=d.replace(/\+/g,"-")).replace(/\//g,"_")).replace(/=+$/,""),n.signature=d;}t.PubNubError=v;},function(e,t,n){var r=SyntaxError,i=Function,o=TypeError,a=function(e){try{return i('"use strict"; return ('+e+").constructor;")()}catch(e){}},u=Object.getOwnPropertyDescriptor;if(u)try{u({},"");}catch(e){u=null;}var s=function(){throw new o},c=u?function(){try{return s}catch(e){try{return u(arguments,"callee").get}catch(e){return s}}}():s,l=n(138)(),f=Object.getPrototypeOf||function(e){return e.__proto__},d={},p="undefined"==typeof Uint8Array?void 0:f(Uint8Array),h={"%AggregateError%":"undefined"==typeof AggregateError?void 0:AggregateError,"%Array%":Array,"%ArrayBuffer%":"undefined"==typeof ArrayBuffer?void 0:ArrayBuffer,"%ArrayIteratorPrototype%":l?f([][Symbol.iterator]()):void 0,"%AsyncFromSyncIteratorPrototype%":void 0,"%AsyncFunction%":d,"%AsyncGenerator%":d,"%AsyncGeneratorFunction%":d,"%AsyncIteratorPrototype%":d,"%Atomics%":"undefined"==typeof Atomics?void 0:Atomics,"%BigInt%":"undefined"==typeof BigInt?void 0:BigInt,"%Boolean%":Boolean,"%DataView%":"undefined"==typeof DataView?void 0:DataView,"%Date%":Date,"%decodeURI%":decodeURI,"%decodeURIComponent%":decodeURIComponent,"%encodeURI%":encodeURI,"%encodeURIComponent%":encodeURIComponent,"%Error%":Error,"%eval%":eval,"%EvalError%":EvalError,"%Float32Array%":"undefined"==typeof Float32Array?void 0:Float32Array,"%Float64Array%":"undefined"==typeof Float64Array?void 0:Float64Array,"%FinalizationRegistry%":"undefined"==typeof FinalizationRegistry?void 0:FinalizationRegistry,"%Function%":i,"%GeneratorFunction%":d,"%Int8Array%":"undefined"==typeof Int8Array?void 0:Int8Array,"%Int16Array%":"undefined"==typeof Int16Array?void 0:Int16Array,"%Int32Array%":"undefined"==typeof Int32Array?void 0:Int32Array,"%isFinite%":isFinite,"%isNaN%":isNaN,"%IteratorPrototype%":l?f(f([][Symbol.iterator]())):void 0,"%JSON%":"object"==typeof JSON?JSON:void 0,"%Map%":"undefined"==typeof Map?void 0:Map,"%MapIteratorPrototype%":"undefined"!=typeof Map&&l?f((new Map)[Symbol.iterator]()):void 0,"%Math%":Math,"%Number%":Number,"%Object%":Object,"%parseFloat%":parseFloat,"%parseInt%":parseInt,"%Promise%":"undefined"==typeof Promise?void 0:Promise,"%Proxy%":"undefined"==typeof Proxy?void 0:Proxy,"%RangeError%":RangeError,"%ReferenceError%":ReferenceError,"%Reflect%":"undefined"==typeof Reflect?void 0:Reflect,"%RegExp%":RegExp,"%Set%":"undefined"==typeof Set?void 0:Set,"%SetIteratorPrototype%":"undefined"!=typeof Set&&l?f((new Set)[Symbol.iterator]()):void 0,"%SharedArrayBuffer%":"undefined"==typeof SharedArrayBuffer?void 0:SharedArrayBuffer,"%String%":String,"%StringIteratorPrototype%":l?f(""[Symbol.iterator]()):void 0,"%Symbol%":l?Symbol:void 0,"%SyntaxError%":r,"%ThrowTypeError%":c,"%TypedArray%":p,"%TypeError%":o,"%Uint8Array%":"undefined"==typeof Uint8Array?void 0:Uint8Array,"%Uint8ClampedArray%":"undefined"==typeof Uint8ClampedArray?void 0:Uint8ClampedArray,"%Uint16Array%":"undefined"==typeof Uint16Array?void 0:Uint16Array,"%Uint32Array%":"undefined"==typeof Uint32Array?void 0:Uint32Array,"%URIError%":URIError,"%WeakMap%":"undefined"==typeof WeakMap?void 0:WeakMap,"%WeakRef%":"undefined"==typeof WeakRef?void 0:WeakRef,"%WeakSet%":"undefined"==typeof WeakSet?void 0:WeakSet},y={"%ArrayBufferPrototype%":["ArrayBuffer","prototype"],"%ArrayPrototype%":["Array","prototype"],"%ArrayProto_entries%":["Array","prototype","entries"],"%ArrayProto_forEach%":["Array","prototype","forEach"],"%ArrayProto_keys%":["Array","prototype","keys"],"%ArrayProto_values%":["Array","prototype","values"],"%AsyncFunctionPrototype%":["AsyncFunction","prototype"],"%AsyncGenerator%":["AsyncGeneratorFunction","prototype"],"%AsyncGeneratorPrototype%":["AsyncGeneratorFunction","prototype","prototype"],"%BooleanPrototype%":["Boolean","prototype"],"%DataViewPrototype%":["DataView","prototype"],"%DatePrototype%":["Date","prototype"],"%ErrorPrototype%":["Error","prototype"],"%EvalErrorPrototype%":["EvalError","prototype"],"%Float32ArrayPrototype%":["Float32Array","prototype"],"%Float64ArrayPrototype%":["Float64Array","prototype"],"%FunctionPrototype%":["Function","prototype"],"%Generator%":["GeneratorFunction","prototype"],"%GeneratorPrototype%":["GeneratorFunction","prototype","prototype"],"%Int8ArrayPrototype%":["Int8Array","prototype"],"%Int16ArrayPrototype%":["Int16Array","prototype"],"%Int32ArrayPrototype%":["Int32Array","prototype"],"%JSONParse%":["JSON","parse"],"%JSONStringify%":["JSON","stringify"],"%MapPrototype%":["Map","prototype"],"%NumberPrototype%":["Number","prototype"],"%ObjectPrototype%":["Object","prototype"],"%ObjProto_toString%":["Object","prototype","toString"],"%ObjProto_valueOf%":["Object","prototype","valueOf"],"%PromisePrototype%":["Promise","prototype"],"%PromiseProto_then%":["Promise","prototype","then"],"%Promise_all%":["Promise","all"],"%Promise_reject%":["Promise","reject"],"%Promise_resolve%":["Promise","resolve"],"%RangeErrorPrototype%":["RangeError","prototype"],"%ReferenceErrorPrototype%":["ReferenceError","prototype"],"%RegExpPrototype%":["RegExp","prototype"],"%SetPrototype%":["Set","prototype"],"%SharedArrayBufferPrototype%":["SharedArrayBuffer","prototype"],"%StringPrototype%":["String","prototype"],"%SymbolPrototype%":["Symbol","prototype"],"%SyntaxErrorPrototype%":["SyntaxError","prototype"],"%TypedArrayPrototype%":["TypedArray","prototype"],"%TypeErrorPrototype%":["TypeError","prototype"],"%Uint8ArrayPrototype%":["Uint8Array","prototype"],"%Uint8ClampedArrayPrototype%":["Uint8ClampedArray","prototype"],"%Uint16ArrayPrototype%":["Uint16Array","prototype"],"%Uint32ArrayPrototype%":["Uint32Array","prototype"],"%URIErrorPrototype%":["URIError","prototype"],"%WeakMapPrototype%":["WeakMap","prototype"],"%WeakSetPrototype%":["WeakSet","prototype"]},g=n(20),v=n(141),b=g.call(Function.call,Array.prototype.concat),m=g.call(Function.apply,Array.prototype.splice),_=g.call(Function.call,String.prototype.replace),P=g.call(Function.call,String.prototype.slice),O=/[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g,S=/\\(\\)?/g,w=function(e){var t=P(e,0,1),n=P(e,-1);if("%"===t&&"%"!==n)throw new r("invalid intrinsic syntax, expected closing `%`");if("%"===n&&"%"!==t)throw new r("invalid intrinsic syntax, expected opening `%`");var i=[];return _(e,O,(function(e,t,n,r){i[i.length]=n?_(r,S,"$1"):t||e;})),i},k=function(e,t){var n,i=e;if(v(y,i)&&(i="%"+(n=y[i])[0]+"%"),v(h,i)){var u=h[i];if(u===d&&(u=function e(t){var n;if("%AsyncFunction%"===t)n=a("async function () {}");else if("%GeneratorFunction%"===t)n=a("function* () {}");else if("%AsyncGeneratorFunction%"===t)n=a("async function* () {}");else if("%AsyncGenerator%"===t){var r=e("%AsyncGeneratorFunction%");r&&(n=r.prototype);}else if("%AsyncIteratorPrototype%"===t){var i=e("%AsyncGenerator%");i&&(n=f(i.prototype));}return h[t]=n,n}(i)),void 0===u&&!t)throw new o("intrinsic "+e+" exists, but is not available. Please file an issue!");return {alias:n,name:i,value:u}}throw new r("intrinsic "+e+" does not exist!")};e.exports=function(e,t){if("string"!=typeof e||0===e.length)throw new o("intrinsic name must be a non-empty string");if(arguments.length>1&&"boolean"!=typeof t)throw new o('"allowMissing" argument must be a boolean');var n=w(e),i=n.length>0?n[0]:"",a=k("%"+i+"%",t),s=a.name,c=a.value,l=!1,f=a.alias;f&&(i=f[0],m(n,b([0,1],f)));for(var d=1,p=!0;d<n.length;d+=1){var y=n[d],g=P(y,0,1),_=P(y,-1);if(('"'===g||"'"===g||"`"===g||'"'===_||"'"===_||"`"===_)&&g!==_)throw new r("property names with quotes must have matching quotes");if("constructor"!==y&&p||(l=!0),v(h,s="%"+(i+="."+y)+"%"))c=h[s];else if(null!=c){if(!(y in c)){if(!t)throw new o("base intrinsic for "+e+" exists, but the property is not available.");return}if(u&&d+1>=n.length){var O=u(c,y);c=(p=!!O)&&"get"in O&&!("originalValue"in O.get)?O.get:c[y];}else p=v(c,y),c=c[y];p&&!l&&(h[s]=c);}}return c};},function(e,t,n){var r=n(140);e.exports=Function.prototype.bind||r;},function(e,t,n){var r=String.prototype.replace,i=/%20/g,o="RFC1738",a="RFC3986";e.exports={default:a,formatters:{RFC1738:function(e){return r.call(e,i,"+")},RFC3986:function(e){return String(e)}},RFC1738:o,RFC3986:a};},function(e,t){e.exports=function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e},e.exports.default=e.exports,e.exports.__esModule=!0;},function(e,t,n){(function(r){var i=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var o=i(n(5)),a=i(n(6)),u=i(n(4)),s=(i(n(8)),i(n(25)));function c(e){var t,n=[];for(t=0;t<e.length;t+=1)n[t/4|0]|=e[t]<<24-8*t;return s.default.lib.WordArray.create(n,e.length)}var l=function(){function e(t){var n=t.config;(0, o.default)(this,e),(0, u.default)(this,"_config",void 0),(0, u.default)(this,"_iv",void 0),(0, u.default)(this,"_allowedKeyEncodings",void 0),(0, u.default)(this,"_allowedKeyLengths",void 0),(0, u.default)(this,"_allowedModes",void 0),(0, u.default)(this,"_defaultOptions",void 0),this._config=n,this._iv="0123456789012345",this._allowedKeyEncodings=["hex","utf8","base64","binary"],this._allowedKeyLengths=[128,256],this._allowedModes=["ecb","cbc"],this._defaultOptions={encryptKey:!0,keyEncoding:"utf8",keyLength:256,mode:"cbc"};}return (0, a.default)(e,[{key:"HMACSHA256",value:function(e){return s.default.HmacSHA256(e,this._config.secretKey).toString(s.default.enc.Base64)}},{key:"SHA256",value:function(e){return s.default.SHA256(e).toString(s.default.enc.Hex)}},{key:"_parseOptions",value:function(e){var t=e||{};return t.hasOwnProperty("encryptKey")||(t.encryptKey=this._defaultOptions.encryptKey),t.hasOwnProperty("keyEncoding")||(t.keyEncoding=this._defaultOptions.keyEncoding),t.hasOwnProperty("keyLength")||(t.keyLength=this._defaultOptions.keyLength),t.hasOwnProperty("mode")||(t.mode=this._defaultOptions.mode),-1===this._allowedKeyEncodings.indexOf(t.keyEncoding.toLowerCase())&&(t.keyEncoding=this._defaultOptions.keyEncoding),-1===this._allowedKeyLengths.indexOf(parseInt(t.keyLength,10))&&(t.keyLength=this._defaultOptions.keyLength),-1===this._allowedModes.indexOf(t.mode.toLowerCase())&&(t.mode=this._defaultOptions.mode),t}},{key:"_decodeKey",value:function(e,t){return "base64"===t.keyEncoding?s.default.enc.Base64.parse(e):"hex"===t.keyEncoding?s.default.enc.Hex.parse(e):e}},{key:"_getPaddedKey",value:function(e,t){return e=this._decodeKey(e,t),t.encryptKey?s.default.enc.Utf8.parse(this.SHA256(e).slice(0,32)):e}},{key:"_getMode",value:function(e){return "ecb"===e.mode?s.default.mode.ECB:s.default.mode.CBC}},{key:"_getIV",value:function(e){return "cbc"===e.mode?s.default.enc.Utf8.parse(this._iv):null}},{key:"_getRandomIV",value:function(){return s.default.lib.WordArray.random(16)}},{key:"encrypt",value:function(e,t,n){return this._config.customEncrypt?this._config.customEncrypt(e):this.pnEncrypt(e,t,n)}},{key:"decrypt",value:function(e,t,n){return this._config.customDecrypt?this._config.customDecrypt(e):this.pnDecrypt(e,t,n)}},{key:"pnEncrypt",value:function(e,t,n){if(!t&&!this._config.cipherKey)return e;n=this._parseOptions(n);var r=this._getMode(n),i=this._getPaddedKey(t||this._config.cipherKey,n);if(this._config.useRandomIVs){var o=this._getRandomIV(),a=s.default.AES.encrypt(e,i,{iv:o,mode:r}).ciphertext;return o.clone().concat(a.clone()).toString(s.default.enc.Base64)}var u=this._getIV(n);return s.default.AES.encrypt(e,i,{iv:u,mode:r}).ciphertext.toString(s.default.enc.Base64)||e}},{key:"pnDecrypt",value:function(e,t,n){if(!t&&!this._config.cipherKey)return e;n=this._parseOptions(n);var i=this._getMode(n),o=this._getPaddedKey(t||this._config.cipherKey,n);if(this._config.useRandomIVs){var a=r.from(e,"base64"),u=c(a.slice(0,16)),l=c(a.slice(16));try{var f=s.default.AES.decrypt({ciphertext:l},o,{iv:u,mode:i}).toString(s.default.enc.Utf8);return JSON.parse(f)}catch(e){return null}}else {var d=this._getIV(n);try{var p=s.default.enc.Base64.parse(e),h=s.default.AES.decrypt({ciphertext:p},o,{iv:d,mode:i}).toString(s.default.enc.Utf8);return JSON.parse(h)}catch(e){return null}}}}]),e}();t.default=l,e.exports=t.default;}).call(this,n(24).Buffer);},function(e,t,n){(function(e){
    /*!
     * The buffer module from node.js, for the browser.
     *
     * @author   Feross Aboukhadijeh <http://feross.org>
     * @license  MIT
     */
    var r=n(36),i=n(37),o=n(38);function a(){return s.TYPED_ARRAY_SUPPORT?2147483647:1073741823}function u(e,t){if(a()<t)throw new RangeError("Invalid typed array length");return s.TYPED_ARRAY_SUPPORT?(e=new Uint8Array(t)).__proto__=s.prototype:(null===e&&(e=new s(t)),e.length=t),e}function s(e,t,n){if(!(s.TYPED_ARRAY_SUPPORT||this instanceof s))return new s(e,t,n);if("number"==typeof e){if("string"==typeof t)throw new Error("If encoding is specified then the first argument must be a string");return f(this,e)}return c(this,e,t,n)}function c(e,t,n,r){if("number"==typeof t)throw new TypeError('"value" argument must not be a number');return "undefined"!=typeof ArrayBuffer&&t instanceof ArrayBuffer?function(e,t,n,r){if(t.byteLength,n<0||t.byteLength<n)throw new RangeError("'offset' is out of bounds");if(t.byteLength<n+(r||0))throw new RangeError("'length' is out of bounds");t=void 0===n&&void 0===r?new Uint8Array(t):void 0===r?new Uint8Array(t,n):new Uint8Array(t,n,r);s.TYPED_ARRAY_SUPPORT?(e=t).__proto__=s.prototype:e=d(e,t);return e}(e,t,n,r):"string"==typeof t?function(e,t,n){"string"==typeof n&&""!==n||(n="utf8");if(!s.isEncoding(n))throw new TypeError('"encoding" must be a valid string encoding');var r=0|h(t,n),i=(e=u(e,r)).write(t,n);i!==r&&(e=e.slice(0,i));return e}(e,t,n):function(e,t){if(s.isBuffer(t)){var n=0|p(t.length);return 0===(e=u(e,n)).length||t.copy(e,0,0,n),e}if(t){if("undefined"!=typeof ArrayBuffer&&t.buffer instanceof ArrayBuffer||"length"in t)return "number"!=typeof t.length||(r=t.length)!=r?u(e,0):d(e,t);if("Buffer"===t.type&&o(t.data))return d(e,t.data)}var r;throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.")}(e,t)}function l(e){if("number"!=typeof e)throw new TypeError('"size" argument must be a number');if(e<0)throw new RangeError('"size" argument must not be negative')}function f(e,t){if(l(t),e=u(e,t<0?0:0|p(t)),!s.TYPED_ARRAY_SUPPORT)for(var n=0;n<t;++n)e[n]=0;return e}function d(e,t){var n=t.length<0?0:0|p(t.length);e=u(e,n);for(var r=0;r<n;r+=1)e[r]=255&t[r];return e}function p(e){if(e>=a())throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x"+a().toString(16)+" bytes");return 0|e}function h(e,t){if(s.isBuffer(e))return e.length;if("undefined"!=typeof ArrayBuffer&&"function"==typeof ArrayBuffer.isView&&(ArrayBuffer.isView(e)||e instanceof ArrayBuffer))return e.byteLength;"string"!=typeof e&&(e=""+e);var n=e.length;if(0===n)return 0;for(var r=!1;;)switch(t){case"ascii":case"latin1":case"binary":return n;case"utf8":case"utf-8":case void 0:return K(e).length;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return 2*n;case"hex":return n>>>1;case"base64":return B(e).length;default:if(r)return K(e).length;t=(""+t).toLowerCase(),r=!0;}}function y(e,t,n){var r=!1;if((void 0===t||t<0)&&(t=0),t>this.length)return "";if((void 0===n||n>this.length)&&(n=this.length),n<=0)return "";if((n>>>=0)<=(t>>>=0))return "";for(e||(e="utf8");;)switch(e){case"hex":return M(this,t,n);case"utf8":case"utf-8":return T(this,t,n);case"ascii":return x(this,t,n);case"latin1":case"binary":return A(this,t,n);case"base64":return k(this,t,n);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return E(this,t,n);default:if(r)throw new TypeError("Unknown encoding: "+e);e=(e+"").toLowerCase(),r=!0;}}function g(e,t,n){var r=e[t];e[t]=e[n],e[n]=r;}function v(e,t,n,r,i){if(0===e.length)return -1;if("string"==typeof n?(r=n,n=0):n>2147483647?n=2147483647:n<-2147483648&&(n=-2147483648),n=+n,isNaN(n)&&(n=i?0:e.length-1),n<0&&(n=e.length+n),n>=e.length){if(i)return -1;n=e.length-1;}else if(n<0){if(!i)return -1;n=0;}if("string"==typeof t&&(t=s.from(t,r)),s.isBuffer(t))return 0===t.length?-1:b(e,t,n,r,i);if("number"==typeof t)return t&=255,s.TYPED_ARRAY_SUPPORT&&"function"==typeof Uint8Array.prototype.indexOf?i?Uint8Array.prototype.indexOf.call(e,t,n):Uint8Array.prototype.lastIndexOf.call(e,t,n):b(e,[t],n,r,i);throw new TypeError("val must be string, number or Buffer")}function b(e,t,n,r,i){var o,a=1,u=e.length,s=t.length;if(void 0!==r&&("ucs2"===(r=String(r).toLowerCase())||"ucs-2"===r||"utf16le"===r||"utf-16le"===r)){if(e.length<2||t.length<2)return -1;a=2,u/=2,s/=2,n/=2;}function c(e,t){return 1===a?e[t]:e.readUInt16BE(t*a)}if(i){var l=-1;for(o=n;o<u;o++)if(c(e,o)===c(t,-1===l?0:o-l)){if(-1===l&&(l=o),o-l+1===s)return l*a}else -1!==l&&(o-=o-l),l=-1;}else for(n+s>u&&(n=u-s),o=n;o>=0;o--){for(var f=!0,d=0;d<s;d++)if(c(e,o+d)!==c(t,d)){f=!1;break}if(f)return o}return -1}function m(e,t,n,r){n=Number(n)||0;var i=e.length-n;r?(r=Number(r))>i&&(r=i):r=i;var o=t.length;if(o%2!=0)throw new TypeError("Invalid hex string");r>o/2&&(r=o/2);for(var a=0;a<r;++a){var u=parseInt(t.substr(2*a,2),16);if(isNaN(u))return a;e[n+a]=u;}return a}function _(e,t,n,r){return G(K(t,e.length-n),e,n,r)}function P(e,t,n,r){return G(function(e){for(var t=[],n=0;n<e.length;++n)t.push(255&e.charCodeAt(n));return t}(t),e,n,r)}function O(e,t,n,r){return P(e,t,n,r)}function S(e,t,n,r){return G(B(t),e,n,r)}function w(e,t,n,r){return G(function(e,t){for(var n,r,i,o=[],a=0;a<e.length&&!((t-=2)<0);++a)n=e.charCodeAt(a),r=n>>8,i=n%256,o.push(i),o.push(r);return o}(t,e.length-n),e,n,r)}function k(e,t,n){return 0===t&&n===e.length?r.fromByteArray(e):r.fromByteArray(e.slice(t,n))}function T(e,t,n){n=Math.min(e.length,n);for(var r=[],i=t;i<n;){var o,a,u,s,c=e[i],l=null,f=c>239?4:c>223?3:c>191?2:1;if(i+f<=n)switch(f){case 1:c<128&&(l=c);break;case 2:128==(192&(o=e[i+1]))&&(s=(31&c)<<6|63&o)>127&&(l=s);break;case 3:o=e[i+1],a=e[i+2],128==(192&o)&&128==(192&a)&&(s=(15&c)<<12|(63&o)<<6|63&a)>2047&&(s<55296||s>57343)&&(l=s);break;case 4:o=e[i+1],a=e[i+2],u=e[i+3],128==(192&o)&&128==(192&a)&&128==(192&u)&&(s=(15&c)<<18|(63&o)<<12|(63&a)<<6|63&u)>65535&&s<1114112&&(l=s);}null===l?(l=65533,f=1):l>65535&&(l-=65536,r.push(l>>>10&1023|55296),l=56320|1023&l),r.push(l),i+=f;}return function(e){var t=e.length;if(t<=4096)return String.fromCharCode.apply(String,e);var n="",r=0;for(;r<t;)n+=String.fromCharCode.apply(String,e.slice(r,r+=4096));return n}(r)}t.Buffer=s,t.SlowBuffer=function(e){+e!=e&&(e=0);return s.alloc(+e)},t.INSPECT_MAX_BYTES=50,s.TYPED_ARRAY_SUPPORT=void 0!==e.TYPED_ARRAY_SUPPORT?e.TYPED_ARRAY_SUPPORT:function(){try{var e=new Uint8Array(1);return e.__proto__={__proto__:Uint8Array.prototype,foo:function(){return 42}},42===e.foo()&&"function"==typeof e.subarray&&0===e.subarray(1,1).byteLength}catch(e){return !1}}(),t.kMaxLength=a(),s.poolSize=8192,s._augment=function(e){return e.__proto__=s.prototype,e},s.from=function(e,t,n){return c(null,e,t,n)},s.TYPED_ARRAY_SUPPORT&&(s.prototype.__proto__=Uint8Array.prototype,s.__proto__=Uint8Array,"undefined"!=typeof Symbol&&Symbol.species&&s[Symbol.species]===s&&Object.defineProperty(s,Symbol.species,{value:null,configurable:!0})),s.alloc=function(e,t,n){return function(e,t,n,r){return l(t),t<=0?u(e,t):void 0!==n?"string"==typeof r?u(e,t).fill(n,r):u(e,t).fill(n):u(e,t)}(null,e,t,n)},s.allocUnsafe=function(e){return f(null,e)},s.allocUnsafeSlow=function(e){return f(null,e)},s.isBuffer=function(e){return !(null==e||!e._isBuffer)},s.compare=function(e,t){if(!s.isBuffer(e)||!s.isBuffer(t))throw new TypeError("Arguments must be Buffers");if(e===t)return 0;for(var n=e.length,r=t.length,i=0,o=Math.min(n,r);i<o;++i)if(e[i]!==t[i]){n=e[i],r=t[i];break}return n<r?-1:r<n?1:0},s.isEncoding=function(e){switch(String(e).toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"latin1":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return !0;default:return !1}},s.concat=function(e,t){if(!o(e))throw new TypeError('"list" argument must be an Array of Buffers');if(0===e.length)return s.alloc(0);var n;if(void 0===t)for(t=0,n=0;n<e.length;++n)t+=e[n].length;var r=s.allocUnsafe(t),i=0;for(n=0;n<e.length;++n){var a=e[n];if(!s.isBuffer(a))throw new TypeError('"list" argument must be an Array of Buffers');a.copy(r,i),i+=a.length;}return r},s.byteLength=h,s.prototype._isBuffer=!0,s.prototype.swap16=function(){var e=this.length;if(e%2!=0)throw new RangeError("Buffer size must be a multiple of 16-bits");for(var t=0;t<e;t+=2)g(this,t,t+1);return this},s.prototype.swap32=function(){var e=this.length;if(e%4!=0)throw new RangeError("Buffer size must be a multiple of 32-bits");for(var t=0;t<e;t+=4)g(this,t,t+3),g(this,t+1,t+2);return this},s.prototype.swap64=function(){var e=this.length;if(e%8!=0)throw new RangeError("Buffer size must be a multiple of 64-bits");for(var t=0;t<e;t+=8)g(this,t,t+7),g(this,t+1,t+6),g(this,t+2,t+5),g(this,t+3,t+4);return this},s.prototype.toString=function(){var e=0|this.length;return 0===e?"":0===arguments.length?T(this,0,e):y.apply(this,arguments)},s.prototype.equals=function(e){if(!s.isBuffer(e))throw new TypeError("Argument must be a Buffer");return this===e||0===s.compare(this,e)},s.prototype.inspect=function(){var e="",n=t.INSPECT_MAX_BYTES;return this.length>0&&(e=this.toString("hex",0,n).match(/.{2}/g).join(" "),this.length>n&&(e+=" ... ")),"<Buffer "+e+">"},s.prototype.compare=function(e,t,n,r,i){if(!s.isBuffer(e))throw new TypeError("Argument must be a Buffer");if(void 0===t&&(t=0),void 0===n&&(n=e?e.length:0),void 0===r&&(r=0),void 0===i&&(i=this.length),t<0||n>e.length||r<0||i>this.length)throw new RangeError("out of range index");if(r>=i&&t>=n)return 0;if(r>=i)return -1;if(t>=n)return 1;if(this===e)return 0;for(var o=(i>>>=0)-(r>>>=0),a=(n>>>=0)-(t>>>=0),u=Math.min(o,a),c=this.slice(r,i),l=e.slice(t,n),f=0;f<u;++f)if(c[f]!==l[f]){o=c[f],a=l[f];break}return o<a?-1:a<o?1:0},s.prototype.includes=function(e,t,n){return -1!==this.indexOf(e,t,n)},s.prototype.indexOf=function(e,t,n){return v(this,e,t,n,!0)},s.prototype.lastIndexOf=function(e,t,n){return v(this,e,t,n,!1)},s.prototype.write=function(e,t,n,r){if(void 0===t)r="utf8",n=this.length,t=0;else if(void 0===n&&"string"==typeof t)r=t,n=this.length,t=0;else {if(!isFinite(t))throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");t|=0,isFinite(n)?(n|=0,void 0===r&&(r="utf8")):(r=n,n=void 0);}var i=this.length-t;if((void 0===n||n>i)&&(n=i),e.length>0&&(n<0||t<0)||t>this.length)throw new RangeError("Attempt to write outside buffer bounds");r||(r="utf8");for(var o=!1;;)switch(r){case"hex":return m(this,e,t,n);case"utf8":case"utf-8":return _(this,e,t,n);case"ascii":return P(this,e,t,n);case"latin1":case"binary":return O(this,e,t,n);case"base64":return S(this,e,t,n);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return w(this,e,t,n);default:if(o)throw new TypeError("Unknown encoding: "+r);r=(""+r).toLowerCase(),o=!0;}},s.prototype.toJSON=function(){return {type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}};function x(e,t,n){var r="";n=Math.min(e.length,n);for(var i=t;i<n;++i)r+=String.fromCharCode(127&e[i]);return r}function A(e,t,n){var r="";n=Math.min(e.length,n);for(var i=t;i<n;++i)r+=String.fromCharCode(e[i]);return r}function M(e,t,n){var r=e.length;(!t||t<0)&&(t=0),(!n||n<0||n>r)&&(n=r);for(var i="",o=t;o<n;++o)i+=L(e[o]);return i}function E(e,t,n){for(var r=e.slice(t,n),i="",o=0;o<r.length;o+=2)i+=String.fromCharCode(r[o]+256*r[o+1]);return i}function j(e,t,n){if(e%1!=0||e<0)throw new RangeError("offset is not uint");if(e+t>n)throw new RangeError("Trying to access beyond buffer length")}function R(e,t,n,r,i,o){if(!s.isBuffer(e))throw new TypeError('"buffer" argument must be a Buffer instance');if(t>i||t<o)throw new RangeError('"value" argument is out of bounds');if(n+r>e.length)throw new RangeError("Index out of range")}function N(e,t,n,r){t<0&&(t=65535+t+1);for(var i=0,o=Math.min(e.length-n,2);i<o;++i)e[n+i]=(t&255<<8*(r?i:1-i))>>>8*(r?i:1-i);}function C(e,t,n,r){t<0&&(t=4294967295+t+1);for(var i=0,o=Math.min(e.length-n,4);i<o;++i)e[n+i]=t>>>8*(r?i:3-i)&255;}function U(e,t,n,r,i,o){if(n+r>e.length)throw new RangeError("Index out of range");if(n<0)throw new RangeError("Index out of range")}function I(e,t,n,r,o){return o||U(e,0,n,4),i.write(e,t,n,r,23,4),n+4}function D(e,t,n,r,o){return o||U(e,0,n,8),i.write(e,t,n,r,52,8),n+8}s.prototype.slice=function(e,t){var n,r=this.length;if((e=~~e)<0?(e+=r)<0&&(e=0):e>r&&(e=r),(t=void 0===t?r:~~t)<0?(t+=r)<0&&(t=0):t>r&&(t=r),t<e&&(t=e),s.TYPED_ARRAY_SUPPORT)(n=this.subarray(e,t)).__proto__=s.prototype;else {var i=t-e;n=new s(i,void 0);for(var o=0;o<i;++o)n[o]=this[o+e];}return n},s.prototype.readUIntLE=function(e,t,n){e|=0,t|=0,n||j(e,t,this.length);for(var r=this[e],i=1,o=0;++o<t&&(i*=256);)r+=this[e+o]*i;return r},s.prototype.readUIntBE=function(e,t,n){e|=0,t|=0,n||j(e,t,this.length);for(var r=this[e+--t],i=1;t>0&&(i*=256);)r+=this[e+--t]*i;return r},s.prototype.readUInt8=function(e,t){return t||j(e,1,this.length),this[e]},s.prototype.readUInt16LE=function(e,t){return t||j(e,2,this.length),this[e]|this[e+1]<<8},s.prototype.readUInt16BE=function(e,t){return t||j(e,2,this.length),this[e]<<8|this[e+1]},s.prototype.readUInt32LE=function(e,t){return t||j(e,4,this.length),(this[e]|this[e+1]<<8|this[e+2]<<16)+16777216*this[e+3]},s.prototype.readUInt32BE=function(e,t){return t||j(e,4,this.length),16777216*this[e]+(this[e+1]<<16|this[e+2]<<8|this[e+3])},s.prototype.readIntLE=function(e,t,n){e|=0,t|=0,n||j(e,t,this.length);for(var r=this[e],i=1,o=0;++o<t&&(i*=256);)r+=this[e+o]*i;return r>=(i*=128)&&(r-=Math.pow(2,8*t)),r},s.prototype.readIntBE=function(e,t,n){e|=0,t|=0,n||j(e,t,this.length);for(var r=t,i=1,o=this[e+--r];r>0&&(i*=256);)o+=this[e+--r]*i;return o>=(i*=128)&&(o-=Math.pow(2,8*t)),o},s.prototype.readInt8=function(e,t){return t||j(e,1,this.length),128&this[e]?-1*(255-this[e]+1):this[e]},s.prototype.readInt16LE=function(e,t){t||j(e,2,this.length);var n=this[e]|this[e+1]<<8;return 32768&n?4294901760|n:n},s.prototype.readInt16BE=function(e,t){t||j(e,2,this.length);var n=this[e+1]|this[e]<<8;return 32768&n?4294901760|n:n},s.prototype.readInt32LE=function(e,t){return t||j(e,4,this.length),this[e]|this[e+1]<<8|this[e+2]<<16|this[e+3]<<24},s.prototype.readInt32BE=function(e,t){return t||j(e,4,this.length),this[e]<<24|this[e+1]<<16|this[e+2]<<8|this[e+3]},s.prototype.readFloatLE=function(e,t){return t||j(e,4,this.length),i.read(this,e,!0,23,4)},s.prototype.readFloatBE=function(e,t){return t||j(e,4,this.length),i.read(this,e,!1,23,4)},s.prototype.readDoubleLE=function(e,t){return t||j(e,8,this.length),i.read(this,e,!0,52,8)},s.prototype.readDoubleBE=function(e,t){return t||j(e,8,this.length),i.read(this,e,!1,52,8)},s.prototype.writeUIntLE=function(e,t,n,r){(e=+e,t|=0,n|=0,r)||R(this,e,t,n,Math.pow(2,8*n)-1,0);var i=1,o=0;for(this[t]=255&e;++o<n&&(i*=256);)this[t+o]=e/i&255;return t+n},s.prototype.writeUIntBE=function(e,t,n,r){(e=+e,t|=0,n|=0,r)||R(this,e,t,n,Math.pow(2,8*n)-1,0);var i=n-1,o=1;for(this[t+i]=255&e;--i>=0&&(o*=256);)this[t+i]=e/o&255;return t+n},s.prototype.writeUInt8=function(e,t,n){return e=+e,t|=0,n||R(this,e,t,1,255,0),s.TYPED_ARRAY_SUPPORT||(e=Math.floor(e)),this[t]=255&e,t+1},s.prototype.writeUInt16LE=function(e,t,n){return e=+e,t|=0,n||R(this,e,t,2,65535,0),s.TYPED_ARRAY_SUPPORT?(this[t]=255&e,this[t+1]=e>>>8):N(this,e,t,!0),t+2},s.prototype.writeUInt16BE=function(e,t,n){return e=+e,t|=0,n||R(this,e,t,2,65535,0),s.TYPED_ARRAY_SUPPORT?(this[t]=e>>>8,this[t+1]=255&e):N(this,e,t,!1),t+2},s.prototype.writeUInt32LE=function(e,t,n){return e=+e,t|=0,n||R(this,e,t,4,4294967295,0),s.TYPED_ARRAY_SUPPORT?(this[t+3]=e>>>24,this[t+2]=e>>>16,this[t+1]=e>>>8,this[t]=255&e):C(this,e,t,!0),t+4},s.prototype.writeUInt32BE=function(e,t,n){return e=+e,t|=0,n||R(this,e,t,4,4294967295,0),s.TYPED_ARRAY_SUPPORT?(this[t]=e>>>24,this[t+1]=e>>>16,this[t+2]=e>>>8,this[t+3]=255&e):C(this,e,t,!1),t+4},s.prototype.writeIntLE=function(e,t,n,r){if(e=+e,t|=0,!r){var i=Math.pow(2,8*n-1);R(this,e,t,n,i-1,-i);}var o=0,a=1,u=0;for(this[t]=255&e;++o<n&&(a*=256);)e<0&&0===u&&0!==this[t+o-1]&&(u=1),this[t+o]=(e/a>>0)-u&255;return t+n},s.prototype.writeIntBE=function(e,t,n,r){if(e=+e,t|=0,!r){var i=Math.pow(2,8*n-1);R(this,e,t,n,i-1,-i);}var o=n-1,a=1,u=0;for(this[t+o]=255&e;--o>=0&&(a*=256);)e<0&&0===u&&0!==this[t+o+1]&&(u=1),this[t+o]=(e/a>>0)-u&255;return t+n},s.prototype.writeInt8=function(e,t,n){return e=+e,t|=0,n||R(this,e,t,1,127,-128),s.TYPED_ARRAY_SUPPORT||(e=Math.floor(e)),e<0&&(e=255+e+1),this[t]=255&e,t+1},s.prototype.writeInt16LE=function(e,t,n){return e=+e,t|=0,n||R(this,e,t,2,32767,-32768),s.TYPED_ARRAY_SUPPORT?(this[t]=255&e,this[t+1]=e>>>8):N(this,e,t,!0),t+2},s.prototype.writeInt16BE=function(e,t,n){return e=+e,t|=0,n||R(this,e,t,2,32767,-32768),s.TYPED_ARRAY_SUPPORT?(this[t]=e>>>8,this[t+1]=255&e):N(this,e,t,!1),t+2},s.prototype.writeInt32LE=function(e,t,n){return e=+e,t|=0,n||R(this,e,t,4,2147483647,-2147483648),s.TYPED_ARRAY_SUPPORT?(this[t]=255&e,this[t+1]=e>>>8,this[t+2]=e>>>16,this[t+3]=e>>>24):C(this,e,t,!0),t+4},s.prototype.writeInt32BE=function(e,t,n){return e=+e,t|=0,n||R(this,e,t,4,2147483647,-2147483648),e<0&&(e=4294967295+e+1),s.TYPED_ARRAY_SUPPORT?(this[t]=e>>>24,this[t+1]=e>>>16,this[t+2]=e>>>8,this[t+3]=255&e):C(this,e,t,!1),t+4},s.prototype.writeFloatLE=function(e,t,n){return I(this,e,t,!0,n)},s.prototype.writeFloatBE=function(e,t,n){return I(this,e,t,!1,n)},s.prototype.writeDoubleLE=function(e,t,n){return D(this,e,t,!0,n)},s.prototype.writeDoubleBE=function(e,t,n){return D(this,e,t,!1,n)},s.prototype.copy=function(e,t,n,r){if(n||(n=0),r||0===r||(r=this.length),t>=e.length&&(t=e.length),t||(t=0),r>0&&r<n&&(r=n),r===n)return 0;if(0===e.length||0===this.length)return 0;if(t<0)throw new RangeError("targetStart out of bounds");if(n<0||n>=this.length)throw new RangeError("sourceStart out of bounds");if(r<0)throw new RangeError("sourceEnd out of bounds");r>this.length&&(r=this.length),e.length-t<r-n&&(r=e.length-t+n);var i,o=r-n;if(this===e&&n<t&&t<r)for(i=o-1;i>=0;--i)e[i+t]=this[i+n];else if(o<1e3||!s.TYPED_ARRAY_SUPPORT)for(i=0;i<o;++i)e[i+t]=this[i+n];else Uint8Array.prototype.set.call(e,this.subarray(n,n+o),t);return o},s.prototype.fill=function(e,t,n,r){if("string"==typeof e){if("string"==typeof t?(r=t,t=0,n=this.length):"string"==typeof n&&(r=n,n=this.length),1===e.length){var i=e.charCodeAt(0);i<256&&(e=i);}if(void 0!==r&&"string"!=typeof r)throw new TypeError("encoding must be a string");if("string"==typeof r&&!s.isEncoding(r))throw new TypeError("Unknown encoding: "+r)}else "number"==typeof e&&(e&=255);if(t<0||this.length<t||this.length<n)throw new RangeError("Out of range index");if(n<=t)return this;var o;if(t>>>=0,n=void 0===n?this.length:n>>>0,e||(e=0),"number"==typeof e)for(o=t;o<n;++o)this[o]=e;else {var a=s.isBuffer(e)?e:K(new s(e,r).toString()),u=a.length;for(o=0;o<n-t;++o)this[o+t]=a[o%u];}return this};var F=/[^+\/0-9A-Za-z-_]/g;function L(e){return e<16?"0"+e.toString(16):e.toString(16)}function K(e,t){var n;t=t||1/0;for(var r=e.length,i=null,o=[],a=0;a<r;++a){if((n=e.charCodeAt(a))>55295&&n<57344){if(!i){if(n>56319){(t-=3)>-1&&o.push(239,191,189);continue}if(a+1===r){(t-=3)>-1&&o.push(239,191,189);continue}i=n;continue}if(n<56320){(t-=3)>-1&&o.push(239,191,189),i=n;continue}n=65536+(i-55296<<10|n-56320);}else i&&(t-=3)>-1&&o.push(239,191,189);if(i=null,n<128){if((t-=1)<0)break;o.push(n);}else if(n<2048){if((t-=2)<0)break;o.push(n>>6|192,63&n|128);}else if(n<65536){if((t-=3)<0)break;o.push(n>>12|224,n>>6&63|128,63&n|128);}else {if(!(n<1114112))throw new Error("Invalid code point");if((t-=4)<0)break;o.push(n>>18|240,n>>12&63|128,n>>6&63|128,63&n|128);}}return o}function B(e){return r.toByteArray(function(e){if((e=function(e){return e.trim?e.trim():e.replace(/^\s+|\s+$/g,"")}(e).replace(F,"")).length<2)return "";for(;e.length%4!=0;)e+="=";return e}(e))}function G(e,t,n,r){for(var i=0;i<r&&!(i+n>=t.length||i>=e.length);++i)t[i+n]=e[i];return i}}).call(this,n(35));},function(e,t,n){var r,i,o,a,u,s=s||function(e,t){var n={},r=n.lib={},i=function(){},o=r.Base={extend:function(e){i.prototype=this;var t=new i;return e&&t.mixIn(e),t.hasOwnProperty("init")||(t.init=function(){t.$super.init.apply(this,arguments);}),t.init.prototype=t,t.$super=this,t},create:function(){var e=this.extend();return e.init.apply(e,arguments),e},init:function(){},mixIn:function(e){for(var t in e)e.hasOwnProperty(t)&&(this[t]=e[t]);e.hasOwnProperty("toString")&&(this.toString=e.toString);},clone:function(){return this.init.prototype.extend(this)}},a=r.WordArray=o.extend({init:function(e,t){e=this.words=e||[],this.sigBytes=null!=t?t:4*e.length;},toString:function(e){return (e||s).stringify(this)},concat:function(e){var t=this.words,n=e.words,r=this.sigBytes;if(e=e.sigBytes,this.clamp(),r%4)for(var i=0;i<e;i++)t[r+i>>>2]|=(n[i>>>2]>>>24-i%4*8&255)<<24-(r+i)%4*8;else if(65535<n.length)for(i=0;i<e;i+=4)t[r+i>>>2]=n[i>>>2];else t.push.apply(t,n);return this.sigBytes+=e,this},clamp:function(){var t=this.words,n=this.sigBytes;t[n>>>2]&=4294967295<<32-n%4*8,t.length=e.ceil(n/4);},clone:function(){var e=o.clone.call(this);return e.words=this.words.slice(0),e},random:function(t){for(var n=[],r=0;r<t;r+=4)n.push(4294967296*e.random()|0);return new a.init(n,t)}}),u=n.enc={},s=u.Hex={stringify:function(e){var t=e.words;e=e.sigBytes;for(var n=[],r=0;r<e;r++){var i=t[r>>>2]>>>24-r%4*8&255;n.push((i>>>4).toString(16)),n.push((15&i).toString(16));}return n.join("")},parse:function(e){for(var t=e.length,n=[],r=0;r<t;r+=2)n[r>>>3]|=parseInt(e.substr(r,2),16)<<24-r%8*4;return new a.init(n,t/2)}},c=u.Latin1={stringify:function(e){var t=e.words;e=e.sigBytes;for(var n=[],r=0;r<e;r++)n.push(String.fromCharCode(t[r>>>2]>>>24-r%4*8&255));return n.join("")},parse:function(e){for(var t=e.length,n=[],r=0;r<t;r++)n[r>>>2]|=(255&e.charCodeAt(r))<<24-r%4*8;return new a.init(n,t)}},l=u.Utf8={stringify:function(e){try{return decodeURIComponent(escape(c.stringify(e)))}catch(e){throw Error("Malformed UTF-8 data")}},parse:function(e){return c.parse(unescape(encodeURIComponent(e)))}},f=r.BufferedBlockAlgorithm=o.extend({reset:function(){this._data=new a.init,this._nDataBytes=0;},_append:function(e){"string"==typeof e&&(e=l.parse(e)),this._data.concat(e),this._nDataBytes+=e.sigBytes;},_process:function(t){var n=this._data,r=n.words,i=n.sigBytes,o=this.blockSize,u=i/(4*o);if(t=(u=t?e.ceil(u):e.max((0|u)-this._minBufferSize,0))*o,i=e.min(4*t,i),t){for(var s=0;s<t;s+=o)this._doProcessBlock(r,s);s=r.splice(0,t),n.sigBytes-=i;}return new a.init(s,i)},clone:function(){var e=o.clone.call(this);return e._data=this._data.clone(),e},_minBufferSize:0});r.Hasher=f.extend({cfg:o.extend(),init:function(e){this.cfg=this.cfg.extend(e),this.reset();},reset:function(){f.reset.call(this),this._doReset();},update:function(e){return this._append(e),this._process(),this},finalize:function(e){return e&&this._append(e),this._doFinalize()},blockSize:16,_createHelper:function(e){return function(t,n){return new e.init(n).finalize(t)}},_createHmacHelper:function(e){return function(t,n){return new d.HMAC.init(e,n).finalize(t)}}});var d=n.algo={};return n}(Math);!function(e){for(var t=s,n=(i=t.lib).WordArray,r=i.Hasher,i=t.algo,o=[],a=[],u=function(e){return 4294967296*(e-(0|e))|0},c=2,l=0;64>l;){var f;e:{f=c;for(var d=e.sqrt(f),p=2;p<=d;p++)if(!(f%p)){f=!1;break e}f=!0;}f&&(8>l&&(o[l]=u(e.pow(c,.5))),a[l]=u(e.pow(c,1/3)),l++),c++;}var h=[];i=i.SHA256=r.extend({_doReset:function(){this._hash=new n.init(o.slice(0));},_doProcessBlock:function(e,t){for(var n=this._hash.words,r=n[0],i=n[1],o=n[2],u=n[3],s=n[4],c=n[5],l=n[6],f=n[7],d=0;64>d;d++){if(16>d)h[d]=0|e[t+d];else {var p=h[d-15],y=h[d-2];h[d]=((p<<25|p>>>7)^(p<<14|p>>>18)^p>>>3)+h[d-7]+((y<<15|y>>>17)^(y<<13|y>>>19)^y>>>10)+h[d-16];}p=f+((s<<26|s>>>6)^(s<<21|s>>>11)^(s<<7|s>>>25))+(s&c^~s&l)+a[d]+h[d],y=((r<<30|r>>>2)^(r<<19|r>>>13)^(r<<10|r>>>22))+(r&i^r&o^i&o),f=l,l=c,c=s,s=u+p|0,u=o,o=i,i=r,r=p+y|0;}n[0]=n[0]+r|0,n[1]=n[1]+i|0,n[2]=n[2]+o|0,n[3]=n[3]+u|0,n[4]=n[4]+s|0,n[5]=n[5]+c|0,n[6]=n[6]+l|0,n[7]=n[7]+f|0;},_doFinalize:function(){var t=this._data,n=t.words,r=8*this._nDataBytes,i=8*t.sigBytes;return n[i>>>5]|=128<<24-i%32,n[14+(i+64>>>9<<4)]=e.floor(r/4294967296),n[15+(i+64>>>9<<4)]=r,t.sigBytes=4*n.length,this._process(),this._hash},clone:function(){var e=r.clone.call(this);return e._hash=this._hash.clone(),e}});t.SHA256=r._createHelper(i),t.HmacSHA256=r._createHmacHelper(i);}(Math),i=(r=s).enc.Utf8,r.algo.HMAC=r.lib.Base.extend({init:function(e,t){e=this._hasher=new e.init,"string"==typeof t&&(t=i.parse(t));var n=e.blockSize,r=4*n;t.sigBytes>r&&(t=e.finalize(t)),t.clamp();for(var o=this._oKey=t.clone(),a=this._iKey=t.clone(),u=o.words,s=a.words,c=0;c<n;c++)u[c]^=1549556828,s[c]^=909522486;o.sigBytes=a.sigBytes=r,this.reset();},reset:function(){var e=this._hasher;e.reset(),e.update(this._iKey);},update:function(e){return this._hasher.update(e),this},finalize:function(e){var t=this._hasher;return e=t.finalize(e),t.reset(),t.finalize(this._oKey.clone().concat(e))}}),a=(o=s).lib.WordArray,o.enc.Base64={stringify:function(e){var t=e.words,n=e.sigBytes,r=this._map;e.clamp(),e=[];for(var i=0;i<n;i+=3)for(var o=(t[i>>>2]>>>24-i%4*8&255)<<16|(t[i+1>>>2]>>>24-(i+1)%4*8&255)<<8|t[i+2>>>2]>>>24-(i+2)%4*8&255,a=0;4>a&&i+.75*a<n;a++)e.push(r.charAt(o>>>6*(3-a)&63));if(t=r.charAt(64))for(;e.length%4;)e.push(t);return e.join("")},parse:function(e){var t=e.length,n=this._map;(r=n.charAt(64))&&-1!=(r=e.indexOf(r))&&(t=r);for(var r=[],i=0,o=0;o<t;o++)if(o%4){var u=n.indexOf(e.charAt(o-1))<<o%4*2,s=n.indexOf(e.charAt(o))>>>6-o%4*2;r[i>>>2]|=(u|s)<<24-i%4*8,i++;}return a.create(r,i)},_map:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="},function(e){function t(e,t,n,r,i,o,a){return ((e=e+(t&n|~t&r)+i+a)<<o|e>>>32-o)+t}function n(e,t,n,r,i,o,a){return ((e=e+(t&r|n&~r)+i+a)<<o|e>>>32-o)+t}function r(e,t,n,r,i,o,a){return ((e=e+(t^n^r)+i+a)<<o|e>>>32-o)+t}function i(e,t,n,r,i,o,a){return ((e=e+(n^(t|~r))+i+a)<<o|e>>>32-o)+t}for(var o=s,a=(c=o.lib).WordArray,u=c.Hasher,c=o.algo,l=[],f=0;64>f;f++)l[f]=4294967296*e.abs(e.sin(f+1))|0;c=c.MD5=u.extend({_doReset:function(){this._hash=new a.init([1732584193,4023233417,2562383102,271733878]);},_doProcessBlock:function(e,o){for(var a=0;16>a;a++){var u=e[s=o+a];e[s]=16711935&(u<<8|u>>>24)|4278255360&(u<<24|u>>>8);}a=this._hash.words;var s=e[o+0],c=(u=e[o+1],e[o+2]),f=e[o+3],d=e[o+4],p=e[o+5],h=e[o+6],y=e[o+7],g=e[o+8],v=e[o+9],b=e[o+10],m=e[o+11],_=e[o+12],P=e[o+13],O=e[o+14],S=e[o+15],w=t(w=a[0],x=a[1],T=a[2],k=a[3],s,7,l[0]),k=t(k,w,x,T,u,12,l[1]),T=t(T,k,w,x,c,17,l[2]),x=t(x,T,k,w,f,22,l[3]);w=t(w,x,T,k,d,7,l[4]),k=t(k,w,x,T,p,12,l[5]),T=t(T,k,w,x,h,17,l[6]),x=t(x,T,k,w,y,22,l[7]),w=t(w,x,T,k,g,7,l[8]),k=t(k,w,x,T,v,12,l[9]),T=t(T,k,w,x,b,17,l[10]),x=t(x,T,k,w,m,22,l[11]),w=t(w,x,T,k,_,7,l[12]),k=t(k,w,x,T,P,12,l[13]),T=t(T,k,w,x,O,17,l[14]),w=n(w,x=t(x,T,k,w,S,22,l[15]),T,k,u,5,l[16]),k=n(k,w,x,T,h,9,l[17]),T=n(T,k,w,x,m,14,l[18]),x=n(x,T,k,w,s,20,l[19]),w=n(w,x,T,k,p,5,l[20]),k=n(k,w,x,T,b,9,l[21]),T=n(T,k,w,x,S,14,l[22]),x=n(x,T,k,w,d,20,l[23]),w=n(w,x,T,k,v,5,l[24]),k=n(k,w,x,T,O,9,l[25]),T=n(T,k,w,x,f,14,l[26]),x=n(x,T,k,w,g,20,l[27]),w=n(w,x,T,k,P,5,l[28]),k=n(k,w,x,T,c,9,l[29]),T=n(T,k,w,x,y,14,l[30]),w=r(w,x=n(x,T,k,w,_,20,l[31]),T,k,p,4,l[32]),k=r(k,w,x,T,g,11,l[33]),T=r(T,k,w,x,m,16,l[34]),x=r(x,T,k,w,O,23,l[35]),w=r(w,x,T,k,u,4,l[36]),k=r(k,w,x,T,d,11,l[37]),T=r(T,k,w,x,y,16,l[38]),x=r(x,T,k,w,b,23,l[39]),w=r(w,x,T,k,P,4,l[40]),k=r(k,w,x,T,s,11,l[41]),T=r(T,k,w,x,f,16,l[42]),x=r(x,T,k,w,h,23,l[43]),w=r(w,x,T,k,v,4,l[44]),k=r(k,w,x,T,_,11,l[45]),T=r(T,k,w,x,S,16,l[46]),w=i(w,x=r(x,T,k,w,c,23,l[47]),T,k,s,6,l[48]),k=i(k,w,x,T,y,10,l[49]),T=i(T,k,w,x,O,15,l[50]),x=i(x,T,k,w,p,21,l[51]),w=i(w,x,T,k,_,6,l[52]),k=i(k,w,x,T,f,10,l[53]),T=i(T,k,w,x,b,15,l[54]),x=i(x,T,k,w,u,21,l[55]),w=i(w,x,T,k,g,6,l[56]),k=i(k,w,x,T,S,10,l[57]),T=i(T,k,w,x,h,15,l[58]),x=i(x,T,k,w,P,21,l[59]),w=i(w,x,T,k,d,6,l[60]),k=i(k,w,x,T,m,10,l[61]),T=i(T,k,w,x,c,15,l[62]),x=i(x,T,k,w,v,21,l[63]);a[0]=a[0]+w|0,a[1]=a[1]+x|0,a[2]=a[2]+T|0,a[3]=a[3]+k|0;},_doFinalize:function(){var t=this._data,n=t.words,r=8*this._nDataBytes,i=8*t.sigBytes;n[i>>>5]|=128<<24-i%32;var o=e.floor(r/4294967296);for(n[15+(i+64>>>9<<4)]=16711935&(o<<8|o>>>24)|4278255360&(o<<24|o>>>8),n[14+(i+64>>>9<<4)]=16711935&(r<<8|r>>>24)|4278255360&(r<<24|r>>>8),t.sigBytes=4*(n.length+1),this._process(),n=(t=this._hash).words,r=0;4>r;r++)i=n[r],n[r]=16711935&(i<<8|i>>>24)|4278255360&(i<<24|i>>>8);return t},clone:function(){var e=u.clone.call(this);return e._hash=this._hash.clone(),e}}),o.MD5=u._createHelper(c),o.HmacMD5=u._createHmacHelper(c);}(Math),function(){var e,t=s,n=(e=t.lib).Base,r=e.WordArray,i=(e=t.algo).EvpKDF=n.extend({cfg:n.extend({keySize:4,hasher:e.MD5,iterations:1}),init:function(e){this.cfg=this.cfg.extend(e);},compute:function(e,t){for(var n=(u=this.cfg).hasher.create(),i=r.create(),o=i.words,a=u.keySize,u=u.iterations;o.length<a;){s&&n.update(s);var s=n.update(e).finalize(t);n.reset();for(var c=1;c<u;c++)s=n.finalize(s),n.reset();i.concat(s);}return i.sigBytes=4*a,i}});t.EvpKDF=function(e,t,n){return i.create(n).compute(e,t)};}(),s.lib.Cipher||function(e){var t=(h=s).lib,n=t.Base,r=t.WordArray,i=t.BufferedBlockAlgorithm,o=h.enc.Base64,a=h.algo.EvpKDF,u=t.Cipher=i.extend({cfg:n.extend(),createEncryptor:function(e,t){return this.create(this._ENC_XFORM_MODE,e,t)},createDecryptor:function(e,t){return this.create(this._DEC_XFORM_MODE,e,t)},init:function(e,t,n){this.cfg=this.cfg.extend(n),this._xformMode=e,this._key=t,this.reset();},reset:function(){i.reset.call(this),this._doReset();},process:function(e){return this._append(e),this._process()},finalize:function(e){return e&&this._append(e),this._doFinalize()},keySize:4,ivSize:4,_ENC_XFORM_MODE:1,_DEC_XFORM_MODE:2,_createHelper:function(e){return {encrypt:function(t,n,r){return ("string"==typeof n?y:p).encrypt(e,t,n,r)},decrypt:function(t,n,r){return ("string"==typeof n?y:p).decrypt(e,t,n,r)}}}});t.StreamCipher=u.extend({_doFinalize:function(){return this._process(!0)},blockSize:1});var c=h.mode={},l=function(e,t,n){var r=this._iv;r?this._iv=void 0:r=this._prevBlock;for(var i=0;i<n;i++)e[t+i]^=r[i];},f=(t.BlockCipherMode=n.extend({createEncryptor:function(e,t){return this.Encryptor.create(e,t)},createDecryptor:function(e,t){return this.Decryptor.create(e,t)},init:function(e,t){this._cipher=e,this._iv=t;}})).extend();f.Encryptor=f.extend({processBlock:function(e,t){var n=this._cipher,r=n.blockSize;l.call(this,e,t,r),n.encryptBlock(e,t),this._prevBlock=e.slice(t,t+r);}}),f.Decryptor=f.extend({processBlock:function(e,t){var n=this._cipher,r=n.blockSize,i=e.slice(t,t+r);n.decryptBlock(e,t),l.call(this,e,t,r),this._prevBlock=i;}}),c=c.CBC=f,f=(h.pad={}).Pkcs7={pad:function(e,t){for(var n,i=(n=(n=4*t)-e.sigBytes%n)<<24|n<<16|n<<8|n,o=[],a=0;a<n;a+=4)o.push(i);n=r.create(o,n),e.concat(n);},unpad:function(e){e.sigBytes-=255&e.words[e.sigBytes-1>>>2];}},t.BlockCipher=u.extend({cfg:u.cfg.extend({mode:c,padding:f}),reset:function(){u.reset.call(this);var e=(t=this.cfg).iv,t=t.mode;if(this._xformMode==this._ENC_XFORM_MODE)var n=t.createEncryptor;else n=t.createDecryptor,this._minBufferSize=1;this._mode=n.call(t,this,e&&e.words);},_doProcessBlock:function(e,t){this._mode.processBlock(e,t);},_doFinalize:function(){var e=this.cfg.padding;if(this._xformMode==this._ENC_XFORM_MODE){e.pad(this._data,this.blockSize);var t=this._process(!0);}else t=this._process(!0),e.unpad(t);return t},blockSize:4});var d=t.CipherParams=n.extend({init:function(e){this.mixIn(e);},toString:function(e){return (e||this.formatter).stringify(this)}}),p=(c=(h.format={}).OpenSSL={stringify:function(e){var t=e.ciphertext;return ((e=e.salt)?r.create([1398893684,1701076831]).concat(e).concat(t):t).toString(o)},parse:function(e){var t=(e=o.parse(e)).words;if(1398893684==t[0]&&1701076831==t[1]){var n=r.create(t.slice(2,4));t.splice(0,4),e.sigBytes-=16;}return d.create({ciphertext:e,salt:n})}},t.SerializableCipher=n.extend({cfg:n.extend({format:c}),encrypt:function(e,t,n,r){r=this.cfg.extend(r);var i=e.createEncryptor(n,r);return t=i.finalize(t),i=i.cfg,d.create({ciphertext:t,key:n,iv:i.iv,algorithm:e,mode:i.mode,padding:i.padding,blockSize:e.blockSize,formatter:r.format})},decrypt:function(e,t,n,r){return r=this.cfg.extend(r),t=this._parse(t,r.format),e.createDecryptor(n,r).finalize(t.ciphertext)},_parse:function(e,t){return "string"==typeof e?t.parse(e,this):e}})),h=(h.kdf={}).OpenSSL={execute:function(e,t,n,i){return i||(i=r.random(8)),e=a.create({keySize:t+n}).compute(e,i),n=r.create(e.words.slice(t),4*n),e.sigBytes=4*t,d.create({key:e,iv:n,salt:i})}},y=t.PasswordBasedCipher=p.extend({cfg:p.cfg.extend({kdf:h}),encrypt:function(e,t,n,r){return n=(r=this.cfg.extend(r)).kdf.execute(n,e.keySize,e.ivSize),r.iv=n.iv,(e=p.encrypt.call(this,e,t,n.key,r)).mixIn(n),e},decrypt:function(e,t,n,r){return r=this.cfg.extend(r),t=this._parse(t,r.format),n=r.kdf.execute(n,e.keySize,e.ivSize,t.salt),r.iv=n.iv,p.decrypt.call(this,e,t,n.key,r)}});}(),function(){for(var e=s,t=e.lib.BlockCipher,n=e.algo,r=[],i=[],o=[],a=[],u=[],c=[],l=[],f=[],d=[],p=[],h=[],y=0;256>y;y++)h[y]=128>y?y<<1:y<<1^283;var g=0,v=0;for(y=0;256>y;y++){var b=(b=v^v<<1^v<<2^v<<3^v<<4)>>>8^255&b^99;r[g]=b,i[b]=g;var m=h[g],_=h[m],P=h[_],O=257*h[b]^16843008*b;o[g]=O<<24|O>>>8,a[g]=O<<16|O>>>16,u[g]=O<<8|O>>>24,c[g]=O,O=16843009*P^65537*_^257*m^16843008*g,l[b]=O<<24|O>>>8,f[b]=O<<16|O>>>16,d[b]=O<<8|O>>>24,p[b]=O,g?(g=m^h[h[h[P^m]]],v^=h[h[v]]):g=v=1;}var S=[0,1,2,4,8,16,32,64,128,27,54];n=n.AES=t.extend({_doReset:function(){for(var e=(n=this._key).words,t=n.sigBytes/4,n=4*((this._nRounds=t+6)+1),i=this._keySchedule=[],o=0;o<n;o++)if(o<t)i[o]=e[o];else {var a=i[o-1];o%t?6<t&&4==o%t&&(a=r[a>>>24]<<24|r[a>>>16&255]<<16|r[a>>>8&255]<<8|r[255&a]):(a=r[(a=a<<8|a>>>24)>>>24]<<24|r[a>>>16&255]<<16|r[a>>>8&255]<<8|r[255&a],a^=S[o/t|0]<<24),i[o]=i[o-t]^a;}for(e=this._invKeySchedule=[],t=0;t<n;t++)o=n-t,a=t%4?i[o]:i[o-4],e[t]=4>t||4>=o?a:l[r[a>>>24]]^f[r[a>>>16&255]]^d[r[a>>>8&255]]^p[r[255&a]];},encryptBlock:function(e,t){this._doCryptBlock(e,t,this._keySchedule,o,a,u,c,r);},decryptBlock:function(e,t){var n=e[t+1];e[t+1]=e[t+3],e[t+3]=n,this._doCryptBlock(e,t,this._invKeySchedule,l,f,d,p,i),n=e[t+1],e[t+1]=e[t+3],e[t+3]=n;},_doCryptBlock:function(e,t,n,r,i,o,a,u){for(var s=this._nRounds,c=e[t]^n[0],l=e[t+1]^n[1],f=e[t+2]^n[2],d=e[t+3]^n[3],p=4,h=1;h<s;h++){var y=r[c>>>24]^i[l>>>16&255]^o[f>>>8&255]^a[255&d]^n[p++],g=r[l>>>24]^i[f>>>16&255]^o[d>>>8&255]^a[255&c]^n[p++],v=r[f>>>24]^i[d>>>16&255]^o[c>>>8&255]^a[255&l]^n[p++];d=r[d>>>24]^i[c>>>16&255]^o[l>>>8&255]^a[255&f]^n[p++],c=y,l=g,f=v;}y=(u[c>>>24]<<24|u[l>>>16&255]<<16|u[f>>>8&255]<<8|u[255&d])^n[p++],g=(u[l>>>24]<<24|u[f>>>16&255]<<16|u[d>>>8&255]<<8|u[255&c])^n[p++],v=(u[f>>>24]<<24|u[d>>>16&255]<<16|u[c>>>8&255]<<8|u[255&l])^n[p++],d=(u[d>>>24]<<24|u[c>>>16&255]<<16|u[l>>>8&255]<<8|u[255&f])^n[p++],e[t]=y,e[t+1]=g,e[t+2]=v,e[t+3]=d;},keySize:8});e.AES=t._createHelper(n);}(),s.mode.ECB=((u=s.lib.BlockCipherMode.extend()).Encryptor=u.extend({processBlock:function(e,t){this._cipher.encryptBlock(e,t);}}),u.Decryptor=u.extend({processBlock:function(e,t){this._cipher.decryptBlock(e,t);}}),u),e.exports=s;},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var i=r(n(5)),o=r(n(6)),a=r(n(4)),u=(n(2),r(n(10))),s=function(){function e(){(0, i.default)(this,e),(0, a.default)(this,"_listeners",void 0),this._listeners=[];}return (0, o.default)(e,[{key:"addListener",value:function(e){this._listeners.push(e);}},{key:"removeListener",value:function(e){var t=[];this._listeners.forEach((function(n){n!==e&&t.push(n);})),this._listeners=t;}},{key:"removeAllListeners",value:function(){this._listeners=[];}},{key:"announcePresence",value:function(e){this._listeners.forEach((function(t){t.presence&&t.presence(e);}));}},{key:"announceStatus",value:function(e){this._listeners.forEach((function(t){t.status&&t.status(e);}));}},{key:"announceMessage",value:function(e){this._listeners.forEach((function(t){t.message&&t.message(e);}));}},{key:"announceSignal",value:function(e){this._listeners.forEach((function(t){t.signal&&t.signal(e);}));}},{key:"announceMessageAction",value:function(e){this._listeners.forEach((function(t){t.messageAction&&t.messageAction(e);}));}},{key:"announceFile",value:function(e){this._listeners.forEach((function(t){t.file&&t.file(e);}));}},{key:"announceObjects",value:function(e){this._listeners.forEach((function(t){t.objects&&t.objects(e);}));}},{key:"announceUser",value:function(e){this._listeners.forEach((function(t){t.user&&t.user(e);}));}},{key:"announceSpace",value:function(e){this._listeners.forEach((function(t){t.space&&t.space(e);}));}},{key:"announceMembership",value:function(e){this._listeners.forEach((function(t){t.membership&&t.membership(e);}));}},{key:"announceNetworkUp",value:function(){var e={};e.category=u.default.PNNetworkUpCategory,this.announceStatus(e);}},{key:"announceNetworkDown",value:function(){var e={};e.category=u.default.PNNetworkDownCategory,this.announceStatus(e);}}]),e}();t.default=s,e.exports=t.default;},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=function(){return i.default.PNTimeOperation},t.getRequestTimeout=function(e){return e.config.getTransactionTimeout()},t.getURL=function(){return "/time/0"},t.handleResponse=function(e,t){return {timetoken:t[0]}},t.isAuthSupported=function(){return !1},t.prepareParams=function(){return {}},t.validateParams=function(){};n(2);var i=r(n(1));},function(e,t,n){},function(e,t,n){var r=n(21),i=Object.prototype.hasOwnProperty,o=Array.isArray,a=function(){for(var e=[],t=0;t<256;++t)e.push("%"+((t<16?"0":"")+t.toString(16)).toUpperCase());return e}(),u=function(e,t){for(var n=t&&t.plainObjects?Object.create(null):{},r=0;r<e.length;++r)void 0!==e[r]&&(n[r]=e[r]);return n};e.exports={arrayToObject:u,assign:function(e,t){return Object.keys(t).reduce((function(e,n){return e[n]=t[n],e}),e)},combine:function(e,t){return [].concat(e,t)},compact:function(e){for(var t=[{obj:{o:e},prop:"o"}],n=[],r=0;r<t.length;++r)for(var i=t[r],a=i.obj[i.prop],u=Object.keys(a),s=0;s<u.length;++s){var c=u[s],l=a[c];"object"==typeof l&&null!==l&&-1===n.indexOf(l)&&(t.push({obj:a,prop:c}),n.push(l));}return function(e){for(;e.length>1;){var t=e.pop(),n=t.obj[t.prop];if(o(n)){for(var r=[],i=0;i<n.length;++i)void 0!==n[i]&&r.push(n[i]);t.obj[t.prop]=r;}}}(t),e},decode:function(e,t,n){var r=e.replace(/\+/g," ");if("iso-8859-1"===n)return r.replace(/%[0-9a-f]{2}/gi,unescape);try{return decodeURIComponent(r)}catch(e){return r}},encode:function(e,t,n,i,o){if(0===e.length)return e;var u=e;if("symbol"==typeof e?u=Symbol.prototype.toString.call(e):"string"!=typeof e&&(u=String(e)),"iso-8859-1"===n)return escape(u).replace(/%u[0-9a-f]{4}/gi,(function(e){return "%26%23"+parseInt(e.slice(2),16)+"%3B"}));for(var s="",c=0;c<u.length;++c){var l=u.charCodeAt(c);45===l||46===l||95===l||126===l||l>=48&&l<=57||l>=65&&l<=90||l>=97&&l<=122||o===r.RFC1738&&(40===l||41===l)?s+=u.charAt(c):l<128?s+=a[l]:l<2048?s+=a[192|l>>6]+a[128|63&l]:l<55296||l>=57344?s+=a[224|l>>12]+a[128|l>>6&63]+a[128|63&l]:(c+=1,l=65536+((1023&l)<<10|1023&u.charCodeAt(c)),s+=a[240|l>>18]+a[128|l>>12&63]+a[128|l>>6&63]+a[128|63&l]);}return s},isBuffer:function(e){return !(!e||"object"!=typeof e)&&!!(e.constructor&&e.constructor.isBuffer&&e.constructor.isBuffer(e))},isRegExp:function(e){return "[object RegExp]"===Object.prototype.toString.call(e)},maybeMap:function(e,t){if(o(e)){for(var n=[],r=0;r<e.length;r+=1)n.push(t(e[r]));return n}return t(e)},merge:function e(t,n,r){if(!n)return t;if("object"!=typeof n){if(o(t))t.push(n);else {if(!t||"object"!=typeof t)return [t,n];(r&&(r.plainObjects||r.allowPrototypes)||!i.call(Object.prototype,n))&&(t[n]=!0);}return t}if(!t||"object"!=typeof t)return [t].concat(n);var a=t;return o(t)&&!o(n)&&(a=u(t,r)),o(t)&&o(n)?(n.forEach((function(n,o){if(i.call(t,o)){var a=t[o];a&&"object"==typeof a&&n&&"object"==typeof n?t[o]=e(a,n,r):t.push(n);}else t[o]=n;})),t):Object.keys(n).reduce((function(t,o){var a=n[o];return i.call(t,o)?t[o]=e(t[o],a,r):t[o]=a,t}),a)}};},function(e,t,n){function r(e){return (r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}e.exports=function(e){return null!==e&&"object"===r(e)};},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var i=r(n(5)),o=r(n(14)),a=r(n(16)),u=r(n(13)),s=r(n(7)),c=r(n(32)),l=r(n(33)),f=r(n(128)),d=r(n(25)),p=r(n(129)),h=r(n(130)),y=n(131),g=(n(2),r(n(151))),v=r(n(152));function b(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return !1;if(Reflect.construct.sham)return !1;if("function"==typeof Proxy)return !0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return !1}}();return function(){var n,r=(0, u.default)(e);if(t){var i=(0, u.default)(this).constructor;n=Reflect.construct(r,arguments,i);}else n=r.apply(this,arguments);return (0, a.default)(this,n)}}function m(e){if(!navigator||!navigator.sendBeacon)return !1;navigator.sendBeacon(e);}function _(e){for(var t=d.default.enc.Base64.parse(e).words,n=new ArrayBuffer(4*t.length),r=new Uint8Array(n),i=0,o=0,a=0;a<t.length;a+=1){var u=t[a];r[o=4*a]=(4278190080&u)>>24,r[o+1]=(16711680&u)>>16,r[o+2]=(65280&u)>>8,r[o+3]=255&u;}for(var s=o+3;s>=o;s-=1)0===r[s]&&i<3&&(i+=1);return i>0?r.buffer.slice(0,r.byteLength-i):r.buffer}function P(e){var t=function(e){return e&&"object"===(0, s.default)(e)&&e.constructor===Object};if(!t(e))return e;var n={};return Object.keys(e).forEach((function(r){var i=function(e){return "string"==typeof e||e instanceof String}(r),o=r,a=e[r];Array.isArray(r)||i&&r.indexOf(",")>=0?o=(i?r.split(","):r).reduce((function(e,t){return e+=String.fromCharCode(t)}),""):(function(e){return "number"==typeof e&&isFinite(e)}(r)||i&&!isNaN(r))&&(o=String.fromCharCode(i?parseInt(r,10):10));n[o]=t(a)?P(a):a;})),n}var O=function(e){(0, o.default)(n,e);var t=b(n);function n(e){var r;(0, i.default)(this,n);var o=e.listenToBrowserNetworkEvents,a=void 0===o||o;return e.db=p.default,e.sdkFamily="Web",e.networking=new f.default({del:y.del,get:y.get,post:y.post,patch:y.patch,sendBeacon:m,getfile:y.getfile,postfile:y.postfile}),e.cbor=new h.default((function(e){return P(c.default.decode(e))}),_),e.PubNubFile=v.default,e.cryptography=new g.default,r=t.call(this,e),a&&(window.addEventListener("offline",(function(){r.networkDownDetected();})),window.addEventListener("online",(function(){r.networkUpDetected();}))),r}return n}(l.default);t.default=O,e.exports=t.default;},function(e,t,n){var r,i;!function(o,a){var u=Math.pow(2,-24),s=Math.pow(2,32),c=Math.pow(2,53);void 0===(i="function"==typeof(r={encode:function(e){var t,n=new ArrayBuffer(256),r=new DataView(n),i=0;function o(e){for(var o=n.byteLength,a=i+e;o<a;)o*=2;if(o!==n.byteLength){var u=r;n=new ArrayBuffer(o),r=new DataView(n);for(var s=i+3>>2,c=0;c<s;++c)r.setUint32(4*c,u.getUint32(4*c));}return t=e,r}function a(){i+=t;}function u(e){a(o(1).setUint8(i,e));}function l(e){for(var t=o(e.length),n=0;n<e.length;++n)t.setUint8(i+n,e[n]);a();}function f(e,t){t<24?u(e<<5|t):t<256?(u(e<<5|24),u(t)):t<65536?(u(e<<5|25),function(e){a(o(2).setUint16(i,e));}(t)):t<4294967296?(u(e<<5|26),function(e){a(o(4).setUint32(i,e));}(t)):(u(e<<5|27),function(e){var t=e%s,n=(e-t)/s,r=o(8);r.setUint32(i,n),r.setUint32(i+4,t),a();}(t));}if(function e(t){var n;if(!1===t)return u(244);if(!0===t)return u(245);if(null===t)return u(246);if(void 0===t)return u(247);switch(typeof t){case"number":if(Math.floor(t)===t){if(0<=t&&t<=c)return f(0,t);if(-c<=t&&t<0)return f(1,-(t+1))}return u(251),function(e){a(o(8).setFloat64(i,e));}(t);case"string":var r=[];for(n=0;n<t.length;++n){var s=t.charCodeAt(n);s<128?r.push(s):s<2048?(r.push(192|s>>6),r.push(128|63&s)):s<55296?(r.push(224|s>>12),r.push(128|s>>6&63),r.push(128|63&s)):(s=(1023&s)<<10,s|=1023&t.charCodeAt(++n),s+=65536,r.push(240|s>>18),r.push(128|s>>12&63),r.push(128|s>>6&63),r.push(128|63&s));}return f(3,r.length),l(r);default:var d;if(Array.isArray(t))for(f(4,d=t.length),n=0;n<d;++n)e(t[n]);else if(t instanceof Uint8Array)f(2,t.length),l(t);else {var p=Object.keys(t);for(f(5,d=p.length),n=0;n<d;++n){var h=p[n];e(h),e(t[h]);}}}}(e),"slice"in n)return n.slice(0,i);for(var d=new ArrayBuffer(i),p=new DataView(d),h=0;h<i;++h)p.setUint8(h,r.getUint8(h));return d},decode:function(e,t,n){var r=new DataView(e),i=0;function o(e,t){return i+=t,e}function a(t){return o(new Uint8Array(e,i,t),t)}function c(){return o(r.getUint8(i),1)}function l(){return o(r.getUint16(i),2)}function f(){return o(r.getUint32(i),4)}function d(){return 255===r.getUint8(i)&&(i+=1,!0)}function p(e){if(e<24)return e;if(24===e)return c();if(25===e)return l();if(26===e)return f();if(27===e)return f()*s+f();if(31===e)return -1;throw "Invalid length encoding"}function h(e){var t=c();if(255===t)return -1;var n=p(31&t);if(n<0||t>>5!==e)throw "Invalid indefinite length element";return n}function y(e,t){for(var n=0;n<t;++n){var r=c();128&r&&(r<224?(r=(31&r)<<6|63&c(),t-=1):r<240?(r=(15&r)<<12|(63&c())<<6|63&c(),t-=2):(r=(15&r)<<18|(63&c())<<12|(63&c())<<6|63&c(),t-=3)),r<65536?e.push(r):(r-=65536,e.push(55296|r>>10),e.push(56320|1023&r));}}"function"!=typeof t&&(t=function(e){return e}),"function"!=typeof n&&(n=function(){});var g=function e(){var s,f,g=c(),v=g>>5,b=31&g;if(7===v)switch(b){case 25:return function(){var e=new ArrayBuffer(4),t=new DataView(e),n=l(),r=32768&n,i=31744&n,o=1023&n;if(31744===i)i=261120;else if(0!==i)i+=114688;else if(0!==o)return o*u;return t.setUint32(0,r<<16|i<<13|o<<13),t.getFloat32(0)}();case 26:return o(r.getFloat32(i),4);case 27:return o(r.getFloat64(i),8)}if((f=p(b))<0&&(v<2||6<v))throw "Invalid length";switch(v){case 0:return f;case 1:return -1-f;case 2:if(f<0){for(var m=[],_=0;(f=h(v))>=0;)_+=f,m.push(a(f));var P=new Uint8Array(_),O=0;for(s=0;s<m.length;++s)P.set(m[s],O),O+=m[s].length;return P}return a(f);case 3:var S=[];if(f<0)for(;(f=h(v))>=0;)y(S,f);else y(S,f);return String.fromCharCode.apply(null,S);case 4:var w;if(f<0)for(w=[];!d();)w.push(e());else for(w=new Array(f),s=0;s<f;++s)w[s]=e();return w;case 5:var k={};for(s=0;s<f||f<0&&!d();++s){k[e()]=e();}return k;case 6:return t(e(),f);case 7:switch(f){case 20:return !1;case 21:return !0;case 22:return null;case 23:return;default:return n(f)}}}();if(i!==e.byteLength)throw "Remaining bytes";return g}})?r.call(t,n,t,e):r)||(e.exports=i);}();},function(e,t,n){var r=n(0),i=n(7);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var o=r(n(5)),a=r(n(6)),u=r(n(4)),s=r(n(8)),c=r(n(23)),l=r(n(39)),f=r(n(43)),d=r(n(44)),p=r(n(26)),h=r(n(47)),y=r(n(18)),g=n(3),v=Ie(n(52)),b=Ie(n(53)),m=Ie(n(54)),_=Ie(n(55)),P=Ie(n(56)),O=Ie(n(57)),S=Ie(n(58)),w=Ie(n(59)),k=Ie(n(60)),T=Ie(n(61)),x=Ie(n(62)),A=Ie(n(63)),M=Ie(n(64)),E=Ie(n(65)),j=Ie(n(66)),R=Ie(n(67)),N=Ie(n(68)),C=Ie(n(69)),U=(n(28),Ie(n(70)),r(n(71))),I=r(n(72)),D=r(n(73)),F=r(n(74)),L=r(n(76)),K=r(n(77)),B=r(n(78)),G=r(n(79)),q=r(n(85)),H=r(n(86)),z=r(n(87)),W=r(n(88)),V=r(n(89)),Y=r(n(90)),J=r(n(91)),$=r(n(92)),X=r(n(93)),Q=r(n(94)),Z=r(n(95)),ee=Ie(n(96)),te=Ie(n(97)),ne=Ie(n(98)),re=Ie(n(99)),ie=Ie(n(100)),oe=Ie(n(101)),ae=Ie(n(102)),ue=Ie(n(103)),se=Ie(n(104)),ce=Ie(n(105)),le=Ie(n(106)),fe=Ie(n(107)),de=Ie(n(108)),pe=Ie(n(109)),he=Ie(n(110)),ye=Ie(n(111)),ge=Ie(n(112)),ve=Ie(n(113)),be=Ie(n(114)),me=Ie(n(115)),_e=Ie(n(116)),Pe=r(n(117)),Oe=Ie(n(118)),Se=Ie(n(119)),we=Ie(n(120)),ke=Ie(n(121)),Te=Ie(n(122)),xe=Ie(n(123)),Ae=Ie(n(27)),Me=Ie(n(124)),Ee=r(n(125)),je=r(n(126)),Re=(Ie(n(127)),r(n(1))),Ne=r(n(10)),Ce=(n(2),r(n(17)));function Ue(e){if("function"!=typeof WeakMap)return null;var t=new WeakMap,n=new WeakMap;return (Ue=function(e){return e?n:t})(e)}function Ie(e,t){if(!t&&e&&e.__esModule)return e;if(null===e||"object"!==i(e)&&"function"!=typeof e)return {default:e};var n=Ue(t);if(n&&n.has(e))return n.get(e);var r={},o=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var a in e)if("default"!==a&&Object.prototype.hasOwnProperty.call(e,a)){var u=o?Object.getOwnPropertyDescriptor(e,a):null;u&&(u.get||u.set)?Object.defineProperty(r,a,u):r[a]=e[a];}return r.default=e,n&&n.set(e,r),r}function De(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r);}return n}function Fe(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?De(Object(n),!0).forEach((function(t){(0, u.default)(e,t,n[t]);})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):De(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t));}));}return e}var Le=function(){function e(t){var n=this;(0, o.default)(this,e),(0, u.default)(this,"_config",void 0),(0, u.default)(this,"_telemetryManager",void 0),(0, u.default)(this,"_listenerManager",void 0),(0, u.default)(this,"_tokenManager",void 0),(0, u.default)(this,"time",void 0),(0, u.default)(this,"publish",void 0),(0, u.default)(this,"fire",void 0),(0, u.default)(this,"history",void 0),(0, u.default)(this,"deleteMessages",void 0),(0, u.default)(this,"messageCounts",void 0),(0, u.default)(this,"fetchMessages",void 0),(0, u.default)(this,"channelGroups",void 0),(0, u.default)(this,"push",void 0),(0, u.default)(this,"hereNow",void 0),(0, u.default)(this,"whereNow",void 0),(0, u.default)(this,"getState",void 0),(0, u.default)(this,"setState",void 0),(0, u.default)(this,"iAmHere",void 0),(0, u.default)(this,"iAmAway",void 0),(0, u.default)(this,"setPresenceState",void 0),(0, u.default)(this,"handshake",void 0),(0, u.default)(this,"receiveMessages",void 0),(0, u.default)(this,"grant",void 0),(0, u.default)(this,"grantToken",void 0),(0, u.default)(this,"audit",void 0),(0, u.default)(this,"revokeToken",void 0),(0, u.default)(this,"subscribe",void 0),(0, u.default)(this,"signal",void 0),(0, u.default)(this,"presence",void 0),(0, u.default)(this,"unsubscribe",void 0),(0, u.default)(this,"unsubscribeAll",void 0),(0, u.default)(this,"addMessageAction",void 0),(0, u.default)(this,"removeMessageAction",void 0),(0, u.default)(this,"getMessageActions",void 0),(0, u.default)(this,"File",void 0),(0, u.default)(this,"encryptFile",void 0),(0, u.default)(this,"decryptFile",void 0),(0, u.default)(this,"listFiles",void 0),(0, u.default)(this,"sendFile",void 0),(0, u.default)(this,"downloadFile",void 0),(0, u.default)(this,"getFileUrl",void 0),(0, u.default)(this,"deleteFile",void 0),(0, u.default)(this,"publishFile",void 0),(0, u.default)(this,"objects",void 0),(0, u.default)(this,"createUser",void 0),(0, u.default)(this,"updateUser",void 0),(0, u.default)(this,"deleteUser",void 0),(0, u.default)(this,"getUser",void 0),(0, u.default)(this,"getUsers",void 0),(0, u.default)(this,"createSpace",void 0),(0, u.default)(this,"updateSpace",void 0),(0, u.default)(this,"deleteSpace",void 0),(0, u.default)(this,"getSpaces",void 0),(0, u.default)(this,"getSpace",void 0),(0, u.default)(this,"getMembers",void 0),(0, u.default)(this,"addMembers",void 0),(0, u.default)(this,"updateMembers",void 0),(0, u.default)(this,"removeMembers",void 0),(0, u.default)(this,"getMemberships",void 0),(0, u.default)(this,"joinSpaces",void 0),(0, u.default)(this,"updateMemberships",void 0),(0, u.default)(this,"leaveSpaces",void 0),(0, u.default)(this,"disconnect",void 0),(0, u.default)(this,"reconnect",void 0),(0, u.default)(this,"destroy",void 0),(0, u.default)(this,"stop",void 0),(0, u.default)(this,"getSubscribedChannels",void 0),(0, u.default)(this,"getSubscribedChannelGroups",void 0),(0, u.default)(this,"addListener",void 0),(0, u.default)(this,"removeListener",void 0),(0, u.default)(this,"removeAllListeners",void 0),(0, u.default)(this,"parseToken",void 0),(0, u.default)(this,"setToken",void 0),(0, u.default)(this,"getToken",void 0),(0, u.default)(this,"getAuthKey",void 0),(0, u.default)(this,"setAuthKey",void 0),(0, u.default)(this,"setCipherKey",void 0),(0, u.default)(this,"setUUID",void 0),(0, u.default)(this,"getUUID",void 0),(0, u.default)(this,"getFilterExpression",void 0),(0, u.default)(this,"setFilterExpression",void 0),(0, u.default)(this,"setHeartbeatInterval",void 0),(0, u.default)(this,"setProxy",void 0),(0, u.default)(this,"encrypt",void 0),(0, u.default)(this,"decrypt",void 0);var r=t.networking,i=t.cbor,a=this._config=new s.default({setup:t}),d=new c.default({config:a}),Re=t.cryptography;r.init(a);var Ne=this._tokenManager=new h.default(a,i),Ce=this._telemetryManager=new f.default({maximumSamplesCount:6e4}),Ue={config:a,networking:r,crypto:d,cryptography:Re,tokenManager:Ne,telemetryManager:Ce,PubNubFile:t.PubNubFile};this.File=t.PubNubFile,this.encryptFile=function(e,t){return Re.encryptFile(e,t,n.File)},this.decryptFile=function(e,t){return Re.decryptFile(e,t,n.File)};var Ie=y.default.bind(this,Ue,Ae),De=y.default.bind(this,Ue,T),Le=y.default.bind(this,Ue,A),Ke=y.default.bind(this,Ue,E),Be=y.default.bind(this,Ue,Me),Ge=this._listenerManager=new p.default,qe=new l.default({timeEndpoint:Ie,leaveEndpoint:De,heartbeatEndpoint:Le,setStateEndpoint:Ke,subscribeEndpoint:Be,crypto:Ue.crypto,config:Ue.config,listenerManager:Ge,getFileUrl:function(e){return (0, L.default)(Ue,e)}});this.addListener=Ge.addListener.bind(Ge),this.removeListener=Ge.removeListener.bind(Ge),this.removeAllListeners=Ge.removeAllListeners.bind(Ge),this.parseToken=Ne.parseToken.bind(Ne),this.setToken=Ne.setToken.bind(Ne),this.getToken=Ne.getToken.bind(Ne),this.channelGroups={listGroups:y.default.bind(this,Ue,_),listChannels:y.default.bind(this,Ue,P),addChannels:y.default.bind(this,Ue,v),removeChannels:y.default.bind(this,Ue,b),deleteGroup:y.default.bind(this,Ue,m)},this.push={addChannels:y.default.bind(this,Ue,O),removeChannels:y.default.bind(this,Ue,S),deleteDevice:y.default.bind(this,Ue,k),listChannels:y.default.bind(this,Ue,w)},this.hereNow=y.default.bind(this,Ue,j),this.whereNow=y.default.bind(this,Ue,x),this.getState=y.default.bind(this,Ue,M),this.setState=qe.adaptStateChange.bind(qe),this.iAmHere=y.default.bind(this,Ue,A),this.iAmAway=y.default.bind(this,Ue,T),this.setPresenceState=y.default.bind(this,Ue,E),this.grant=y.default.bind(this,Ue,me),this.grantToken=y.default.bind(this,Ue,_e),this.audit=y.default.bind(this,Ue,be),this.revokeToken=y.default.bind(this,Ue,Pe.default),this.publish=y.default.bind(this,Ue,Oe),this.fire=function(e,t){return e.replicate=!1,e.storeInHistory=!1,n.publish(e,t)},this.signal=y.default.bind(this,Ue,Se),this.history=y.default.bind(this,Ue,we),this.deleteMessages=y.default.bind(this,Ue,ke),this.messageCounts=y.default.bind(this,Ue,Te),this.fetchMessages=y.default.bind(this,Ue,xe),this.addMessageAction=y.default.bind(this,Ue,R),this.removeMessageAction=y.default.bind(this,Ue,N),this.getMessageActions=y.default.bind(this,Ue,C),this.listFiles=y.default.bind(this,Ue,U.default);var He=y.default.bind(this,Ue,I.default);this.publishFile=y.default.bind(this,Ue,D.default),this.sendFile=(0, F.default)({generateUploadUrl:He,publishFile:this.publishFile,modules:Ue}),this.getFileUrl=function(e){return (0, L.default)(Ue,e)},this.downloadFile=y.default.bind(this,Ue,K.default),this.deleteFile=y.default.bind(this,Ue,B.default),this.handshake=y.default.bind(this,Ue,Ee.default),this.receiveMessages=y.default.bind(this,Ue,je.default),this.objects={getAllUUIDMetadata:y.default.bind(this,Ue,G.default),getUUIDMetadata:y.default.bind(this,Ue,q.default),setUUIDMetadata:y.default.bind(this,Ue,H.default),removeUUIDMetadata:y.default.bind(this,Ue,z.default),getAllChannelMetadata:y.default.bind(this,Ue,W.default),getChannelMetadata:y.default.bind(this,Ue,V.default),setChannelMetadata:y.default.bind(this,Ue,Y.default),removeChannelMetadata:y.default.bind(this,Ue,J.default),getChannelMembers:y.default.bind(this,Ue,$.default),setChannelMembers:function(e){for(var t=arguments.length,r=new Array(t>1?t-1:0),i=1;i<t;i++)r[i-1]=arguments[i];return y.default.call.apply(y.default,[n,Ue,X.default,Fe({type:"set"},e)].concat(r))},removeChannelMembers:function(e){for(var t=arguments.length,r=new Array(t>1?t-1:0),i=1;i<t;i++)r[i-1]=arguments[i];return y.default.call.apply(y.default,[n,Ue,X.default,Fe({type:"delete"},e)].concat(r))},getMemberships:y.default.bind(this,Ue,Q.default),setMemberships:function(e){for(var t=arguments.length,r=new Array(t>1?t-1:0),i=1;i<t;i++)r[i-1]=arguments[i];return y.default.call.apply(y.default,[n,Ue,Z.default,Fe({type:"set"},e)].concat(r))},removeMemberships:function(e){for(var t=arguments.length,r=new Array(t>1?t-1:0),i=1;i<t;i++)r[i-1]=arguments[i];return y.default.call.apply(y.default,[n,Ue,Z.default,Fe({type:"delete"},e)].concat(r))}},this.createUser=(0, g.deprecated)(y.default.bind(this,Ue,ee)),this.updateUser=(0, g.deprecated)(y.default.bind(this,Ue,te)),this.deleteUser=(0, g.deprecated)(y.default.bind(this,Ue,ne)),this.getUser=(0, g.deprecated)(y.default.bind(this,Ue,re)),this.getUsers=(0, g.deprecated)(y.default.bind(this,Ue,ie)),this.createSpace=(0, g.deprecated)(y.default.bind(this,Ue,oe)),this.updateSpace=(0, g.deprecated)(y.default.bind(this,Ue,ae)),this.deleteSpace=(0, g.deprecated)(y.default.bind(this,Ue,ue)),this.getSpaces=(0, g.deprecated)(y.default.bind(this,Ue,se)),this.getSpace=(0, g.deprecated)(y.default.bind(this,Ue,ce)),this.addMembers=(0, g.deprecated)(y.default.bind(this,Ue,fe)),this.updateMembers=(0, g.deprecated)(y.default.bind(this,Ue,de)),this.removeMembers=(0, g.deprecated)(y.default.bind(this,Ue,pe)),this.getMembers=(0, g.deprecated)(y.default.bind(this,Ue,le)),this.getMemberships=(0, g.deprecated)(y.default.bind(this,Ue,he)),this.joinSpaces=(0, g.deprecated)(y.default.bind(this,Ue,ge)),this.updateMemberships=(0, g.deprecated)(y.default.bind(this,Ue,ye)),this.leaveSpaces=(0, g.deprecated)(y.default.bind(this,Ue,ve)),this.time=Ie,this.subscribe=qe.adaptSubscribeChange.bind(qe),this.presence=qe.adaptPresenceChange.bind(qe),this.unsubscribe=qe.adaptUnsubscribeChange.bind(qe),this.disconnect=qe.disconnect.bind(qe),this.reconnect=qe.reconnect.bind(qe),this.destroy=function(e){qe.unsubscribeAll(e),qe.disconnect();},this.stop=this.destroy,this.unsubscribeAll=qe.unsubscribeAll.bind(qe),this.getSubscribedChannels=qe.getSubscribedChannels.bind(qe),this.getSubscribedChannelGroups=qe.getSubscribedChannelGroups.bind(qe),this.encrypt=d.encrypt.bind(d),this.decrypt=d.decrypt.bind(d),this.getAuthKey=Ue.config.getAuthKey.bind(Ue.config),this.setAuthKey=Ue.config.setAuthKey.bind(Ue.config),this.setCipherKey=Ue.config.setCipherKey.bind(Ue.config),this.getUUID=Ue.config.getUUID.bind(Ue.config),this.setUUID=Ue.config.setUUID.bind(Ue.config),this.getFilterExpression=Ue.config.getFilterExpression.bind(Ue.config),this.setFilterExpression=Ue.config.setFilterExpression.bind(Ue.config),this.setHeartbeatInterval=Ue.config.setHeartbeatInterval.bind(Ue.config),r.hasModule("proxy")&&(this.setProxy=function(e){Ue.config.setProxy(e),n.reconnect();});}return (0, a.default)(e,[{key:"getVersion",value:function(){return this._config.getVersion()}},{key:"_addPnsdkSuffix",value:function(e,t){this._config._addPnsdkSuffix(e,t);}},{key:"networkDownDetected",value:function(){this._listenerManager.announceNetworkDown(),this._config.restore?this.disconnect():this.destroy(!0);}},{key:"networkUpDetected",value:function(){this._listenerManager.announceNetworkUp(),this.reconnect();}}],[{key:"notificationPayload",value:function(e,t){return new d.default(e,t)}},{key:"generateUUID",value:function(){return Ce.default.createUUID()}}]),e}();t.default=Le,(0, u.default)(Le,"OPERATIONS",Re.default),(0, u.default)(Le,"CATEGORIES",Ne.default),e.exports=t.default;},function(e,t,n){var r,i,o;/*! lil-uuid - v0.1 - MIT License - https://github.com/lil-js/uuid */i=[t],void 0===(o="function"==typeof(r=function(e){var t={3:/^[0-9A-F]{8}-[0-9A-F]{4}-3[0-9A-F]{3}-[0-9A-F]{4}-[0-9A-F]{12}$/i,4:/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,5:/^[0-9A-F]{8}-[0-9A-F]{4}-5[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,all:/^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i};function n(){var e,t,n="";for(e=0;e<32;e++)t=16*Math.random()|0,8!==e&&12!==e&&16!==e&&20!==e||(n+="-"),n+=(12===e?4:16===e?3&t|8:t).toString(16);return n}function r(e,n){var r=t[n||"all"];return r&&r.test(e)||!1}n.isUUID=r,n.VERSION="0.1.0",e.uuid=n,e.isUUID=r;})?r.apply(t,i):r)||(e.exports=o);},function(e,t){var n;n=function(){return this}();try{n=n||new Function("return this")();}catch(e){"object"==typeof window&&(n=window);}e.exports=n;},function(e,t,n){t.byteLength=function(e){var t=c(e),n=t[0],r=t[1];return 3*(n+r)/4-r},t.toByteArray=function(e){var t,n,r=c(e),a=r[0],u=r[1],s=new o(function(e,t,n){return 3*(t+n)/4-n}(0,a,u)),l=0,f=u>0?a-4:a;for(n=0;n<f;n+=4)t=i[e.charCodeAt(n)]<<18|i[e.charCodeAt(n+1)]<<12|i[e.charCodeAt(n+2)]<<6|i[e.charCodeAt(n+3)],s[l++]=t>>16&255,s[l++]=t>>8&255,s[l++]=255&t;2===u&&(t=i[e.charCodeAt(n)]<<2|i[e.charCodeAt(n+1)]>>4,s[l++]=255&t);1===u&&(t=i[e.charCodeAt(n)]<<10|i[e.charCodeAt(n+1)]<<4|i[e.charCodeAt(n+2)]>>2,s[l++]=t>>8&255,s[l++]=255&t);return s},t.fromByteArray=function(e){for(var t,n=e.length,i=n%3,o=[],a=0,u=n-i;a<u;a+=16383)o.push(l(e,a,a+16383>u?u:a+16383));1===i?(t=e[n-1],o.push(r[t>>2]+r[t<<4&63]+"==")):2===i&&(t=(e[n-2]<<8)+e[n-1],o.push(r[t>>10]+r[t>>4&63]+r[t<<2&63]+"="));return o.join("")};for(var r=[],i=[],o="undefined"!=typeof Uint8Array?Uint8Array:Array,a="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",u=0,s=a.length;u<s;++u)r[u]=a[u],i[a.charCodeAt(u)]=u;function c(e){var t=e.length;if(t%4>0)throw new Error("Invalid string. Length must be a multiple of 4");var n=e.indexOf("=");return -1===n&&(n=t),[n,n===t?0:4-n%4]}function l(e,t,n){for(var i,o,a=[],u=t;u<n;u+=3)i=(e[u]<<16&16711680)+(e[u+1]<<8&65280)+(255&e[u+2]),a.push(r[(o=i)>>18&63]+r[o>>12&63]+r[o>>6&63]+r[63&o]);return a.join("")}i["-".charCodeAt(0)]=62,i["_".charCodeAt(0)]=63;},function(e,t){
    /*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
    t.read=function(e,t,n,r,i){var o,a,u=8*i-r-1,s=(1<<u)-1,c=s>>1,l=-7,f=n?i-1:0,d=n?-1:1,p=e[t+f];for(f+=d,o=p&(1<<-l)-1,p>>=-l,l+=u;l>0;o=256*o+e[t+f],f+=d,l-=8);for(a=o&(1<<-l)-1,o>>=-l,l+=r;l>0;a=256*a+e[t+f],f+=d,l-=8);if(0===o)o=1-c;else {if(o===s)return a?NaN:1/0*(p?-1:1);a+=Math.pow(2,r),o-=c;}return (p?-1:1)*a*Math.pow(2,o-r)},t.write=function(e,t,n,r,i,o){var a,u,s,c=8*o-i-1,l=(1<<c)-1,f=l>>1,d=23===i?Math.pow(2,-24)-Math.pow(2,-77):0,p=r?0:o-1,h=r?1:-1,y=t<0||0===t&&1/t<0?1:0;for(t=Math.abs(t),isNaN(t)||t===1/0?(u=isNaN(t)?1:0,a=l):(a=Math.floor(Math.log(t)/Math.LN2),t*(s=Math.pow(2,-a))<1&&(a--,s*=2),(t+=a+f>=1?d/s:d*Math.pow(2,1-f))*s>=2&&(a++,s/=2),a+f>=l?(u=0,a=l):a+f>=1?(u=(t*s-1)*Math.pow(2,i),a+=f):(u=t*Math.pow(2,f-1)*Math.pow(2,i),a=0));i>=8;e[n+p]=255&u,p+=h,u/=256,i-=8);for(a=a<<i|u,c+=i;c>0;e[n+p]=255&a,p+=h,a/=256,c-=8);e[n+p-h]|=128*y;};},function(e,t){var n={}.toString;e.exports=Array.isArray||function(e){return "[object Array]"==n.call(e)};},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var i=r(n(7)),o=r(n(5)),a=r(n(6)),u=r(n(4)),s=(r(n(23)),r(n(8)),r(n(26)),r(n(40))),c=r(n(41)),l=r(n(3)),f=(n(2),r(n(10))),d=function(){function e(t){var n=t.subscribeEndpoint,r=t.leaveEndpoint,i=t.heartbeatEndpoint,a=t.setStateEndpoint,l=t.timeEndpoint,f=t.getFileUrl,d=t.config,p=t.crypto,h=t.listenerManager;(0, o.default)(this,e),(0, u.default)(this,"_crypto",void 0),(0, u.default)(this,"_config",void 0),(0, u.default)(this,"_listenerManager",void 0),(0, u.default)(this,"_reconnectionManager",void 0),(0, u.default)(this,"_leaveEndpoint",void 0),(0, u.default)(this,"_heartbeatEndpoint",void 0),(0, u.default)(this,"_setStateEndpoint",void 0),(0, u.default)(this,"_subscribeEndpoint",void 0),(0, u.default)(this,"_getFileUrl",void 0),(0, u.default)(this,"_channels",void 0),(0, u.default)(this,"_presenceChannels",void 0),(0, u.default)(this,"_heartbeatChannels",void 0),(0, u.default)(this,"_heartbeatChannelGroups",void 0),(0, u.default)(this,"_channelGroups",void 0),(0, u.default)(this,"_presenceChannelGroups",void 0),(0, u.default)(this,"_currentTimetoken",void 0),(0, u.default)(this,"_lastTimetoken",void 0),(0, u.default)(this,"_storedTimetoken",void 0),(0, u.default)(this,"_region",void 0),(0, u.default)(this,"_subscribeCall",void 0),(0, u.default)(this,"_heartbeatTimer",void 0),(0, u.default)(this,"_subscriptionStatusAnnounced",void 0),(0, u.default)(this,"_autoNetworkDetection",void 0),(0, u.default)(this,"_isOnline",void 0),(0, u.default)(this,"_pendingChannelSubscriptions",void 0),(0, u.default)(this,"_pendingChannelGroupSubscriptions",void 0),(0, u.default)(this,"_dedupingManager",void 0),this._listenerManager=h,this._config=d,this._leaveEndpoint=r,this._heartbeatEndpoint=i,this._setStateEndpoint=a,this._subscribeEndpoint=n,this._getFileUrl=f,this._crypto=p,this._channels={},this._presenceChannels={},this._heartbeatChannels={},this._heartbeatChannelGroups={},this._channelGroups={},this._presenceChannelGroups={},this._pendingChannelSubscriptions=[],this._pendingChannelGroupSubscriptions=[],this._currentTimetoken=0,this._lastTimetoken=0,this._storedTimetoken=null,this._subscriptionStatusAnnounced=!1,this._isOnline=!0,this._reconnectionManager=new s.default({timeEndpoint:l}),this._dedupingManager=new c.default({config:d});}return (0, a.default)(e,[{key:"adaptStateChange",value:function(e,t){var n=this,r=e.state,i=e.channels,o=void 0===i?[]:i,a=e.channelGroups,u=void 0===a?[]:a;return o.forEach((function(e){e in n._channels&&(n._channels[e].state=r);})),u.forEach((function(e){e in n._channelGroups&&(n._channelGroups[e].state=r);})),this._setStateEndpoint({state:r,channels:o,channelGroups:u},t)}},{key:"adaptPresenceChange",value:function(e){var t=this,n=e.connected,r=e.channels,i=void 0===r?[]:r,o=e.channelGroups,a=void 0===o?[]:o;n?(i.forEach((function(e){t._heartbeatChannels[e]={state:{}};})),a.forEach((function(e){t._heartbeatChannelGroups[e]={state:{}};}))):(i.forEach((function(e){e in t._heartbeatChannels&&delete t._heartbeatChannels[e];})),a.forEach((function(e){e in t._heartbeatChannelGroups&&delete t._heartbeatChannelGroups[e];})),!1===this._config.suppressLeaveEvents&&this._leaveEndpoint({channels:i,channelGroups:a},(function(e){t._listenerManager.announceStatus(e);}))),this.reconnect();}},{key:"adaptSubscribeChange",value:function(e){var t=this,n=e.timetoken,r=e.channels,i=void 0===r?[]:r,o=e.channelGroups,a=void 0===o?[]:o,u=e.withPresence,s=void 0!==u&&u,c=e.withHeartbeats,l=void 0!==c&&c;this._config.subscribeKey&&""!==this._config.subscribeKey?(n&&(this._lastTimetoken=this._currentTimetoken,this._currentTimetoken=n),"0"!==this._currentTimetoken&&0!==this._currentTimetoken&&(this._storedTimetoken=this._currentTimetoken,this._currentTimetoken=0),i.forEach((function(e){t._channels[e]={state:{}},s&&(t._presenceChannels[e]={}),(l||t._config.getHeartbeatInterval())&&(t._heartbeatChannels[e]={}),t._pendingChannelSubscriptions.push(e);})),a.forEach((function(e){t._channelGroups[e]={state:{}},s&&(t._presenceChannelGroups[e]={}),(l||t._config.getHeartbeatInterval())&&(t._heartbeatChannelGroups[e]={}),t._pendingChannelGroupSubscriptions.push(e);})),this._subscriptionStatusAnnounced=!1,this.reconnect()):console&&console.log&&console.log("subscribe key missing; aborting subscribe");}},{key:"adaptUnsubscribeChange",value:function(e,t){var n=this,r=e.channels,i=void 0===r?[]:r,o=e.channelGroups,a=void 0===o?[]:o,u=[],s=[];i.forEach((function(e){e in n._channels&&(delete n._channels[e],u.push(e),e in n._heartbeatChannels&&delete n._heartbeatChannels[e]),e in n._presenceChannels&&(delete n._presenceChannels[e],u.push(e));})),a.forEach((function(e){e in n._channelGroups&&(delete n._channelGroups[e],s.push(e),e in n._heartbeatChannelGroups&&delete n._heartbeatChannelGroups[e]),e in n._presenceChannelGroups&&(delete n._presenceChannelGroups[e],s.push(e));})),0===u.length&&0===s.length||(!1!==this._config.suppressLeaveEvents||t||this._leaveEndpoint({channels:u,channelGroups:s},(function(e){e.affectedChannels=u,e.affectedChannelGroups=s,e.currentTimetoken=n._currentTimetoken,e.lastTimetoken=n._lastTimetoken,n._listenerManager.announceStatus(e);})),0===Object.keys(this._channels).length&&0===Object.keys(this._presenceChannels).length&&0===Object.keys(this._channelGroups).length&&0===Object.keys(this._presenceChannelGroups).length&&(this._lastTimetoken=0,this._currentTimetoken=0,this._storedTimetoken=null,this._region=null,this._reconnectionManager.stopPolling()),this.reconnect());}},{key:"unsubscribeAll",value:function(e){this.adaptUnsubscribeChange({channels:this.getSubscribedChannels(),channelGroups:this.getSubscribedChannelGroups()},e);}},{key:"getHeartbeatChannels",value:function(){return Object.keys(this._heartbeatChannels)}},{key:"getHeartbeatChannelGroups",value:function(){return Object.keys(this._heartbeatChannelGroups)}},{key:"getSubscribedChannels",value:function(){return Object.keys(this._channels)}},{key:"getSubscribedChannelGroups",value:function(){return Object.keys(this._channelGroups)}},{key:"reconnect",value:function(){this._startSubscribeLoop(),this._registerHeartbeatTimer();}},{key:"disconnect",value:function(){this._stopSubscribeLoop(),this._stopHeartbeatTimer(),this._reconnectionManager.stopPolling();}},{key:"_registerHeartbeatTimer",value:function(){this._stopHeartbeatTimer(),0!==this._config.getHeartbeatInterval()&&void 0!==this._config.getHeartbeatInterval()&&(this._performHeartbeatLoop(),this._heartbeatTimer=setInterval(this._performHeartbeatLoop.bind(this),1e3*this._config.getHeartbeatInterval()));}},{key:"_stopHeartbeatTimer",value:function(){this._heartbeatTimer&&(clearInterval(this._heartbeatTimer),this._heartbeatTimer=null);}},{key:"_performHeartbeatLoop",value:function(){var e=this,t=this.getHeartbeatChannels(),n=this.getHeartbeatChannelGroups(),r={};if(0!==t.length||0!==n.length){this.getSubscribedChannels().forEach((function(t){var n=e._channels[t].state;Object.keys(n).length&&(r[t]=n);})),this.getSubscribedChannelGroups().forEach((function(t){var n=e._channelGroups[t].state;Object.keys(n).length&&(r[t]=n);}));this._heartbeatEndpoint({channels:t,channelGroups:n,state:r},function(t){t.error&&e._config.announceFailedHeartbeats&&e._listenerManager.announceStatus(t),t.error&&e._config.autoNetworkDetection&&e._isOnline&&(e._isOnline=!1,e.disconnect(),e._listenerManager.announceNetworkDown(),e.reconnect()),!t.error&&e._config.announceSuccessfulHeartbeats&&e._listenerManager.announceStatus(t);}.bind(this));}}},{key:"_startSubscribeLoop",value:function(){var e=this;this._stopSubscribeLoop();var t={},n=[],r=[];if(Object.keys(this._channels).forEach((function(r){var i=e._channels[r].state;Object.keys(i).length&&(t[r]=i),n.push(r);})),Object.keys(this._presenceChannels).forEach((function(e){n.push("".concat(e,"-pnpres"));})),Object.keys(this._channelGroups).forEach((function(n){var i=e._channelGroups[n].state;Object.keys(i).length&&(t[n]=i),r.push(n);})),Object.keys(this._presenceChannelGroups).forEach((function(e){r.push("".concat(e,"-pnpres"));})),0!==n.length||0!==r.length){var i={channels:n,channelGroups:r,state:t,timetoken:this._currentTimetoken,filterExpression:this._config.filterExpression,region:this._region};this._subscribeCall=this._subscribeEndpoint(i,this._processSubscribeResponse.bind(this));}}},{key:"_processSubscribeResponse",value:function(e,t){var n=this;if(e.error)e.category===f.default.PNTimeoutCategory?this._startSubscribeLoop():e.category===f.default.PNNetworkIssuesCategory?(this.disconnect(),e.error&&this._config.autoNetworkDetection&&this._isOnline&&(this._isOnline=!1,this._listenerManager.announceNetworkDown()),this._reconnectionManager.onReconnection((function(){n._config.autoNetworkDetection&&!n._isOnline&&(n._isOnline=!0,n._listenerManager.announceNetworkUp()),n.reconnect(),n._subscriptionStatusAnnounced=!0;var t={category:f.default.PNReconnectedCategory,operation:e.operation,lastTimetoken:n._lastTimetoken,currentTimetoken:n._currentTimetoken};n._listenerManager.announceStatus(t);})),this._reconnectionManager.startPolling(),this._listenerManager.announceStatus(e)):e.category===f.default.PNBadRequestCategory?(this._stopHeartbeatTimer(),this._listenerManager.announceStatus(e)):this._listenerManager.announceStatus(e);else {if(this._storedTimetoken?(this._currentTimetoken=this._storedTimetoken,this._storedTimetoken=null):(this._lastTimetoken=this._currentTimetoken,this._currentTimetoken=t.metadata.timetoken),!this._subscriptionStatusAnnounced){var r={};r.category=f.default.PNConnectedCategory,r.operation=e.operation,r.affectedChannels=this._pendingChannelSubscriptions,r.subscribedChannels=this.getSubscribedChannels(),r.affectedChannelGroups=this._pendingChannelGroupSubscriptions,r.lastTimetoken=this._lastTimetoken,r.currentTimetoken=this._currentTimetoken,this._subscriptionStatusAnnounced=!0,this._listenerManager.announceStatus(r),this._pendingChannelSubscriptions=[],this._pendingChannelGroupSubscriptions=[];}var o=t.messages||[],a=this._config,u=a.requestMessageCountThreshold,s=a.dedupeOnSubscribe;if(u&&o.length>=u){var c={};c.category=f.default.PNRequestMessageCountExceededCategory,c.operation=e.operation,this._listenerManager.announceStatus(c);}o.forEach((function(e){var t=e.channel,r=e.subscriptionMatch,o=e.publishMetaData;if(t===r&&(r=null),s){if(n._dedupingManager.isDuplicate(e))return;n._dedupingManager.addEntry(e);}if(l.default.endsWith(e.channel,"-pnpres")){var a={channel:null,subscription:null};a.actualChannel=null!=r?t:null,a.subscribedChannel=null!=r?r:t,t&&(a.channel=t.substring(0,t.lastIndexOf("-pnpres"))),r&&(a.subscription=r.substring(0,r.lastIndexOf("-pnpres"))),a.action=e.payload.action,a.state=e.payload.data,a.timetoken=o.publishTimetoken,a.occupancy=e.payload.occupancy,a.uuid=e.payload.uuid,a.timestamp=e.payload.timestamp,e.payload.join&&(a.join=e.payload.join),e.payload.leave&&(a.leave=e.payload.leave),e.payload.timeout&&(a.timeout=e.payload.timeout),n._listenerManager.announcePresence(a);}else if(1===e.messageType){var u={channel:null,subscription:null};u.channel=t,u.subscription=r,u.timetoken=o.publishTimetoken,u.publisher=e.issuingClientId,e.userMetadata&&(u.userMetadata=e.userMetadata),u.message=e.payload,n._listenerManager.announceSignal(u);}else if(2===e.messageType){var c={channel:null,subscription:null};c.channel=t,c.subscription=r,c.timetoken=o.publishTimetoken,c.publisher=e.issuingClientId,e.userMetadata&&(c.userMetadata=e.userMetadata),c.message={event:e.payload.event,type:e.payload.type,data:e.payload.data},n._listenerManager.announceObjects(c),"user"===e.payload.type?n._listenerManager.announceUser(c):"space"===e.payload.type?n._listenerManager.announceSpace(c):"membership"===e.payload.type&&n._listenerManager.announceMembership(c);}else if(3===e.messageType){var f={};f.channel=t,f.subscription=r,f.timetoken=o.publishTimetoken,f.publisher=e.issuingClientId,f.data={messageTimetoken:e.payload.data.messageTimetoken,actionTimetoken:e.payload.data.actionTimetoken,type:e.payload.data.type,uuid:e.issuingClientId,value:e.payload.data.value},f.event=e.payload.event,n._listenerManager.announceMessageAction(f);}else if(4===e.messageType){var d={};d.channel=t,d.subscription=r,d.timetoken=o.publishTimetoken,d.publisher=e.issuingClientId;var p=e.payload;if(n._config.cipherKey){var h=n._crypto.decrypt(e.payload);"object"===(0, i.default)(h)&&null!==h&&(p=h);}e.userMetadata&&(d.userMetadata=e.userMetadata),d.message=p.message,d.file={id:p.file.id,name:p.file.name,url:n._getFileUrl({id:p.file.id,name:p.file.name,channel:t})},n._listenerManager.announceFile(d);}else {var y={channel:null,subscription:null};y.actualChannel=null!=r?t:null,y.subscribedChannel=null!=r?r:t,y.channel=t,y.subscription=r,y.timetoken=o.publishTimetoken,y.publisher=e.issuingClientId,e.userMetadata&&(y.userMetadata=e.userMetadata),n._config.cipherKey?y.message=n._crypto.decrypt(e.payload):y.message=e.payload,n._listenerManager.announceMessage(y);}})),this._region=t.metadata.region,this._startSubscribeLoop();}}},{key:"_stopSubscribeLoop",value:function(){this._subscribeCall&&("function"==typeof this._subscribeCall.abort&&this._subscribeCall.abort(),this._subscribeCall=null);}}]),e}();t.default=d,e.exports=t.default;},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var i=r(n(5)),o=r(n(6)),a=r(n(4)),u=(r(n(27)),n(2),function(){function e(t){var n=t.timeEndpoint;(0, i.default)(this,e),(0, a.default)(this,"_reconnectionCallback",void 0),(0, a.default)(this,"_timeEndpoint",void 0),(0, a.default)(this,"_timeTimer",void 0),this._timeEndpoint=n;}return (0, o.default)(e,[{key:"onReconnection",value:function(e){this._reconnectionCallback=e;}},{key:"startPolling",value:function(){this._timeTimer=setInterval(this._performTimeLoop.bind(this),3e3);}},{key:"stopPolling",value:function(){clearInterval(this._timeTimer);}},{key:"_performTimeLoop",value:function(){var e=this;this._timeEndpoint((function(t){t.error||(clearInterval(e._timeTimer),e._reconnectionCallback());}));}}]),e}());t.default=u,e.exports=t.default;},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var i=r(n(5)),o=r(n(6)),a=r(n(4)),u=(r(n(8)),n(2),function(){function e(t){var n=t.config;(0, i.default)(this,e),(0, a.default)(this,"_config",void 0),(0, a.default)(this,"hashHistory",void 0),this.hashHistory=[],this._config=n;}return (0, o.default)(e,[{key:"getKey",value:function(e){var t=function(e){var t=0;if(0===e.length)return t;for(var n=0;n<e.length;n+=1){t=(t<<5)-t+e.charCodeAt(n),t&=t;}return t}(JSON.stringify(e.payload)).toString(),n=e.publishMetaData.publishTimetoken;return "".concat(n,"-").concat(t)}},{key:"isDuplicate",value:function(e){return this.hashHistory.includes(this.getKey(e))}},{key:"addEntry",value:function(e){this.hashHistory.length>=this._config.maximumCacheSize&&this.hashHistory.shift(),this.hashHistory.push(this.getKey(e));}},{key:"clearHistory",value:function(){this.hashHistory=[];}}]),e}());t.default=u,e.exports=t.default;},function(e,t){var n,r,i=e.exports={};function o(){throw new Error("setTimeout has not been defined")}function a(){throw new Error("clearTimeout has not been defined")}function u(e){if(n===setTimeout)return setTimeout(e,0);if((n===o||!n)&&setTimeout)return n=setTimeout,setTimeout(e,0);try{return n(e,0)}catch(t){try{return n.call(null,e,0)}catch(t){return n.call(this,e,0)}}}!function(){try{n="function"==typeof setTimeout?setTimeout:o;}catch(e){n=o;}try{r="function"==typeof clearTimeout?clearTimeout:a;}catch(e){r=a;}}();var s,c=[],l=!1,f=-1;function d(){l&&s&&(l=!1,s.length?c=s.concat(c):f=-1,c.length&&p());}function p(){if(!l){var e=u(d);l=!0;for(var t=c.length;t;){for(s=c,c=[];++f<t;)s&&s[f].run();f=-1,t=c.length;}s=null,l=!1,function(e){if(r===clearTimeout)return clearTimeout(e);if((r===a||!r)&&clearTimeout)return r=clearTimeout,clearTimeout(e);try{r(e);}catch(t){try{return r.call(null,e)}catch(t){return r.call(this,e)}}}(e);}}function h(e,t){this.fun=e,this.array=t;}function y(){}i.nextTick=function(e){var t=new Array(arguments.length-1);if(arguments.length>1)for(var n=1;n<arguments.length;n++)t[n-1]=arguments[n];c.push(new h(e,t)),1!==c.length||l||u(p);},h.prototype.run=function(){this.fun.apply(null,this.array);},i.title="browser",i.browser=!0,i.env={},i.argv=[],i.version="",i.versions={},i.on=y,i.addListener=y,i.once=y,i.off=y,i.removeListener=y,i.removeAllListeners=y,i.emit=y,i.prependListener=y,i.prependOnceListener=y,i.listeners=function(e){return []},i.binding=function(e){throw new Error("process.binding is not supported")},i.cwd=function(){return "/"},i.chdir=function(e){throw new Error("process.chdir is not supported")},i.umask=function(){return 0};},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var i=r(n(5)),o=r(n(6)),a=r(n(4)),u=r(n(1)),s=function(){function e(t){(0, i.default)(this,e),(0, a.default)(this,"_maximumSamplesCount",100),(0, a.default)(this,"_trackedLatencies",{}),(0, a.default)(this,"_latencies",{}),this._maximumSamplesCount=t.maximumSamplesCount||this._maximumSamplesCount;}return (0, o.default)(e,[{key:"operationsLatencyForRequest",value:function(){var e=this,t={};return Object.keys(this._latencies).forEach((function(n){var r=e._latencies[n],i=e._averageLatency(r);i>0&&(t["l_".concat(n)]=i);})),t}},{key:"startLatencyMeasure",value:function(e,t){e!==u.default.PNSubscribeOperation&&t&&(this._trackedLatencies[t]=Date.now());}},{key:"stopLatencyMeasure",value:function(e,t){if(e!==u.default.PNSubscribeOperation&&t){var n=this._endpointName(e),r=this._latencies[n],i=this._trackedLatencies[t];r||(r=this._latencies[n]=[]),r.push(Date.now()-i),r.length>this._maximumSamplesCount&&r.splice(0,r.length-this._maximumSamplesCount),delete this._trackedLatencies[t];}}},{key:"_averageLatency",value:function(e){return Math.floor(e.reduce((function(e,t){return e+t}),0)/e.length)}},{key:"_endpointName",value:function(e){var t=null;switch(e){case u.default.PNPublishOperation:t="pub";break;case u.default.PNSignalOperation:t="sig";break;case u.default.PNHistoryOperation:case u.default.PNFetchMessagesOperation:case u.default.PNDeleteMessagesOperation:case u.default.PNMessageCounts:t="hist";break;case u.default.PNUnsubscribeOperation:case u.default.PNWhereNowOperation:case u.default.PNHereNowOperation:case u.default.PNHeartbeatOperation:case u.default.PNSetStateOperation:case u.default.PNGetStateOperation:t="pres";break;case u.default.PNAddChannelsToGroupOperation:case u.default.PNRemoveChannelsFromGroupOperation:case u.default.PNChannelGroupsOperation:case u.default.PNRemoveGroupOperation:case u.default.PNChannelsForGroupOperation:t="cg";break;case u.default.PNPushNotificationEnabledChannelsOperation:case u.default.PNRemoveAllPushNotificationsOperation:t="push";break;case u.default.PNCreateUserOperation:case u.default.PNUpdateUserOperation:case u.default.PNDeleteUserOperation:case u.default.PNGetUserOperation:case u.default.PNGetUsersOperation:case u.default.PNCreateSpaceOperation:case u.default.PNUpdateSpaceOperation:case u.default.PNDeleteSpaceOperation:case u.default.PNGetSpaceOperation:case u.default.PNGetSpacesOperation:case u.default.PNGetMembersOperation:case u.default.PNUpdateMembersOperation:case u.default.PNGetMembershipsOperation:case u.default.PNUpdateMembershipsOperation:t="obj";break;case u.default.PNAddMessageActionOperation:case u.default.PNRemoveMessageActionOperation:case u.default.PNGetMessageActionsOperation:t="msga";break;case u.default.PNAccessManagerGrant:case u.default.PNAccessManagerAudit:t="pam";break;case u.default.PNAccessManagerGrantToken:case u.default.PNAccessManagerRevokeToken:t="pamv3";break;default:t="time";}return t}}]),e}();t.default=s,e.exports=t.default;},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.default=t.MPNSNotificationPayload=t.FCMNotificationPayload=t.APNSNotificationPayload=void 0;var i=r(n(45)),o=r(n(22)),a=r(n(14)),u=r(n(16)),s=r(n(13)),c=r(n(5)),l=r(n(6)),f=r(n(4)),d=(n(2),["notification","data"]);function p(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r);}return n}function h(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?p(Object(n),!0).forEach((function(t){(0, f.default)(e,t,n[t]);})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):p(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t));}));}return e}function y(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return !1;if(Reflect.construct.sham)return !1;if("function"==typeof Proxy)return !0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return !1}}();return function(){var n,r=(0, s.default)(e);if(t){var i=(0, s.default)(this).constructor;n=Reflect.construct(r,arguments,i);}else n=r.apply(this,arguments);return (0, u.default)(this,n)}}var g=function(){function e(t,n,r){(0, c.default)(this,e),(0, f.default)(this,"_subtitle",void 0),(0, f.default)(this,"_payload",void 0),(0, f.default)(this,"_badge",void 0),(0, f.default)(this,"_sound",void 0),(0, f.default)(this,"_title",void 0),(0, f.default)(this,"_body",void 0),this._payload=t,this._setDefaultPayloadStructure(),this.title=n,this.body=r;}return (0, l.default)(e,[{key:"payload",get:function(){return this._payload}},{key:"title",set:function(e){this._title=e;}},{key:"subtitle",set:function(e){this._subtitle=e;}},{key:"body",set:function(e){this._body=e;}},{key:"badge",set:function(e){this._badge=e;}},{key:"sound",set:function(e){this._sound=e;}},{key:"_setDefaultPayloadStructure",value:function(){}},{key:"toObject",value:function(){return {}}}]),e}(),v=function(e){(0, a.default)(n,e);var t=y(n);function n(){var e;(0, c.default)(this,n);for(var r=arguments.length,i=new Array(r),a=0;a<r;a++)i[a]=arguments[a];return e=t.call.apply(t,[this].concat(i)),(0, f.default)((0, o.default)(e),"_configurations",void 0),(0, f.default)((0, o.default)(e),"_apnsPushType",void 0),(0, f.default)((0, o.default)(e),"_isSilent",void 0),e}return (0, l.default)(n,[{key:"configurations",set:function(e){e&&e.length&&(this._configurations=e);}},{key:"notification",get:function(){return this._payload.aps}},{key:"title",get:function(){return this._title},set:function(e){e&&e.length&&(this._payload.aps.alert.title=e,this._title=e);}},{key:"subtitle",get:function(){return this._subtitle},set:function(e){e&&e.length&&(this._payload.aps.alert.subtitle=e,this._subtitle=e);}},{key:"body",get:function(){return this._body},set:function(e){e&&e.length&&(this._payload.aps.alert.body=e,this._body=e);}},{key:"badge",get:function(){return this._badge},set:function(e){null!=e&&(this._payload.aps.badge=e,this._badge=e);}},{key:"sound",get:function(){return this._sound},set:function(e){e&&e.length&&(this._payload.aps.sound=e,this._sound=e);}},{key:"silent",set:function(e){this._isSilent=e;}},{key:"_setDefaultPayloadStructure",value:function(){this._payload.aps={alert:{}};}},{key:"toObject",value:function(){var e=this,t=h({},this._payload),n=t.aps,r=n.alert;if(this._isSilent&&(n["content-available"]=1),"apns2"===this._apnsPushType){if(!this._configurations||!this._configurations.length)throw new ReferenceError("APNS2 configuration is missing");var i=[];this._configurations.forEach((function(t){i.push(e._objectFromAPNS2Configuration(t));})),i.length&&(t.pn_push=i);}return r&&Object.keys(r).length||delete n.alert,this._isSilent&&(delete n.alert,delete n.badge,delete n.sound,r={}),this._isSilent||Object.keys(r).length?t:null}},{key:"_objectFromAPNS2Configuration",value:function(e){var t=this;if(!e.targets||!e.targets.length)throw new ReferenceError("At least one APNS2 target should be provided");var n=[];e.targets.forEach((function(e){n.push(t._objectFromAPNSTarget(e));}));var r=e.collapseId,i=e.expirationDate,o={auth_method:"token",targets:n,version:"v2"};return r&&r.length&&(o.collapse_id=r),i&&(o.expiration=i.toISOString()),o}},{key:"_objectFromAPNSTarget",value:function(e){if(!e.topic||!e.topic.length)throw new TypeError("Target 'topic' undefined.");var t=e.topic,n=e.environment,r=void 0===n?"development":n,i=e.excludedDevices,o=void 0===i?[]:i,a={topic:t,environment:r};return o.length&&(a.excluded_devices=o),a}}]),n}(g);t.APNSNotificationPayload=v;var b=function(e){(0, a.default)(n,e);var t=y(n);function n(){var e;(0, c.default)(this,n);for(var r=arguments.length,i=new Array(r),a=0;a<r;a++)i[a]=arguments[a];return e=t.call.apply(t,[this].concat(i)),(0, f.default)((0, o.default)(e),"_backContent",void 0),(0, f.default)((0, o.default)(e),"_backTitle",void 0),(0, f.default)((0, o.default)(e),"_count",void 0),(0, f.default)((0, o.default)(e),"_type",void 0),e}return (0, l.default)(n,[{key:"backContent",get:function(){return this._backContent},set:function(e){e&&e.length&&(this._payload.back_content=e,this._backContent=e);}},{key:"backTitle",get:function(){return this._backTitle},set:function(e){e&&e.length&&(this._payload.back_title=e,this._backTitle=e);}},{key:"count",get:function(){return this._count},set:function(e){null!=e&&(this._payload.count=e,this._count=e);}},{key:"title",get:function(){return this._title},set:function(e){e&&e.length&&(this._payload.title=e,this._title=e);}},{key:"type",get:function(){return this._type},set:function(e){e&&e.length&&(this._payload.type=e,this._type=e);}},{key:"subtitle",get:function(){return this.backTitle},set:function(e){this.backTitle=e;}},{key:"body",get:function(){return this.backContent},set:function(e){this.backContent=e;}},{key:"badge",get:function(){return this.count},set:function(e){this.count=e;}},{key:"toObject",value:function(){return Object.keys(this._payload).length?h({},this._payload):null}}]),n}(g);t.MPNSNotificationPayload=b;var m=function(e){(0, a.default)(n,e);var t=y(n);function n(){var e;(0, c.default)(this,n);for(var r=arguments.length,i=new Array(r),a=0;a<r;a++)i[a]=arguments[a];return e=t.call.apply(t,[this].concat(i)),(0, f.default)((0, o.default)(e),"_isSilent",void 0),(0, f.default)((0, o.default)(e),"_icon",void 0),(0, f.default)((0, o.default)(e),"_tag",void 0),e}return (0, l.default)(n,[{key:"notification",get:function(){return this._payload.notification}},{key:"data",get:function(){return this._payload.data}},{key:"title",get:function(){return this._title},set:function(e){e&&e.length&&(this._payload.notification.title=e,this._title=e);}},{key:"body",get:function(){return this._body},set:function(e){e&&e.length&&(this._payload.notification.body=e,this._body=e);}},{key:"sound",get:function(){return this._sound},set:function(e){e&&e.length&&(this._payload.notification.sound=e,this._sound=e);}},{key:"icon",get:function(){return this._icon},set:function(e){e&&e.length&&(this._payload.notification.icon=e,this._icon=e);}},{key:"tag",get:function(){return this._tag},set:function(e){e&&e.length&&(this._payload.notification.tag=e,this._tag=e);}},{key:"silent",set:function(e){this._isSilent=e;}},{key:"_setDefaultPayloadStructure",value:function(){this._payload.notification={},this._payload.data={};}},{key:"toObject",value:function(){var e=h({},this._payload.data),t=null,n={};if(Object.keys(this._payload).length>2){var r=this._payload,o=(r.notification,r.data,(0, i.default)(r,d));e=h(h({},e),o);}return this._isSilent?e.notification=this._payload.notification:t=this._payload.notification,Object.keys(e).length&&(n.data=e),t&&Object.keys(t).length&&(n.notification=t),Object.keys(n).length?n:null}}]),n}(g);t.FCMNotificationPayload=m;var _=function(){function e(t,n){(0, c.default)(this,e),(0, f.default)(this,"_payload",void 0),(0, f.default)(this,"_debugging",void 0),(0, f.default)(this,"_subtitle",void 0),(0, f.default)(this,"_badge",void 0),(0, f.default)(this,"_sound",void 0),(0, f.default)(this,"_title",void 0),(0, f.default)(this,"_body",void 0),(0, f.default)(this,"apns",void 0),(0, f.default)(this,"mpns",void 0),(0, f.default)(this,"fcm",void 0),this._payload={apns:{},mpns:{},fcm:{}},this._title=t,this._body=n,this.apns=new v(this._payload.apns,t,n),this.mpns=new b(this._payload.mpns,t,n),this.fcm=new m(this._payload.fcm,t,n);}return (0, l.default)(e,[{key:"debugging",set:function(e){this._debugging=e;}},{key:"title",get:function(){return this._title}},{key:"body",get:function(){return this._body}},{key:"subtitle",get:function(){return this._subtitle},set:function(e){this._subtitle=e,this.apns.subtitle=e,this.mpns.subtitle=e,this.fcm.subtitle=e;}},{key:"badge",get:function(){return this._badge},set:function(e){this._badge=e,this.apns.badge=e,this.mpns.badge=e,this.fcm.badge=e;}},{key:"sound",get:function(){return this._sound},set:function(e){this._sound=e,this.apns.sound=e,this.mpns.sound=e,this.fcm.sound=e;}},{key:"buildPayload",value:function(e){var t={};if(e.includes("apns")||e.includes("apns2")){this.apns._apnsPushType=e.includes("apns")?"apns":"apns2";var n=this.apns.toObject();n&&Object.keys(n).length&&(t.pn_apns=n);}if(e.includes("mpns")){var r=this.mpns.toObject();r&&Object.keys(r).length&&(t.pn_mpns=r);}if(e.includes("fcm")){var i=this.fcm.toObject();i&&Object.keys(i).length&&(t.pn_gcm=i);}return Object.keys(t).length&&this._debugging&&(t.pn_debug=!0),t}}]),e}();t.default=_;},function(e,t,n){var r=n(46);e.exports=function(e,t){if(null==e)return {};var n,i,o=r(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(i=0;i<a.length;i++)n=a[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n]);}return o},e.exports.default=e.exports,e.exports.__esModule=!0;},function(e,t){e.exports=function(e,t){if(null==e)return {};var n,r,i={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(i[n]=e[n]);return i},e.exports.default=e.exports,e.exports.__esModule=!0;},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var i=r(n(5)),o=r(n(6)),a=r(n(4)),u=(r(n(8)),n(2),function(){function e(t,n){(0, i.default)(this,e),(0, a.default)(this,"_config",void 0),(0, a.default)(this,"_cbor",void 0),(0, a.default)(this,"_token",void 0),this._config=t,this._cbor=n;}return (0, o.default)(e,[{key:"setToken",value:function(e){e&&e.length>0?this._token=e:this._token=void 0;}},{key:"getToken",value:function(){return this._token}},{key:"extractPermissions",value:function(e){var t={read:!1,write:!1,manage:!1,delete:!1,get:!1,update:!1,join:!1};return 128==(128&e)&&(t.join=!0),64==(64&e)&&(t.update=!0),32==(32&e)&&(t.get=!0),8==(8&e)&&(t.delete=!0),4==(4&e)&&(t.manage=!0),2==(2&e)&&(t.write=!0),1==(1&e)&&(t.read=!0),t}},{key:"parseToken",value:function(e){var t=this,n=this._cbor.decodeToken(e);if(void 0!==n){var r=n.res.uuid?Object.keys(n.res.uuid):[],i=Object.keys(n.res.chan),o=Object.keys(n.res.grp),a=n.pat.uuid?Object.keys(n.pat.uuid):[],u=Object.keys(n.pat.chan),s=Object.keys(n.pat.grp),c={version:n.v,timestamp:n.t,ttl:n.ttl,authorized_uuid:n.uuid},l=r.length>0,f=i.length>0,d=o.length>0;(l||f||d)&&(c.resources={},l&&(c.resources.uuids={},r.forEach((function(e){c.resources.uuids[e]=t.extractPermissions(n.res.uuid[e]);}))),f&&(c.resources.channels={},i.forEach((function(e){c.resources.channels[e]=t.extractPermissions(n.res.chan[e]);}))),d&&(c.resources.groups={},o.forEach((function(e){c.resources.groups[e]=t.extractPermissions(n.res.grp[e]);}))));var p=a.length>0,h=u.length>0,y=s.length>0;return (p||h||y)&&(c.patterns={},p&&(c.patterns.uuids={},a.forEach((function(e){c.patterns.uuids[e]=t.extractPermissions(n.pat.uuid[e]);}))),h&&(c.patterns.channels={},u.forEach((function(e){c.patterns.channels[e]=t.extractPermissions(n.pat.chan[e]);}))),y&&(c.patterns.groups={},s.forEach((function(e){c.patterns.groups[e]=t.extractPermissions(n.pat.grp[e]);})))),Object.keys(n.meta).length>0&&(c.meta=n.meta),c.signature=n.sig,c}}}]),e}());t.default=u,e.exports=t.default;},function(e,t,n){var r=n(13),i=n(15),o=n(49),a=n(50);function u(t){var n="function"==typeof Map?new Map:void 0;return e.exports=u=function(e){if(null===e||!o(e))return e;if("function"!=typeof e)throw new TypeError("Super expression must either be null or a function");if(void 0!==n){if(n.has(e))return n.get(e);n.set(e,t);}function t(){return a(e,arguments,r(this).constructor)}return t.prototype=Object.create(e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),i(t,e)},e.exports.default=e.exports,e.exports.__esModule=!0,u(t)}e.exports=u,e.exports.default=e.exports,e.exports.__esModule=!0;},function(e,t){e.exports=function(e){return -1!==Function.toString.call(e).indexOf("[native code]")},e.exports.default=e.exports,e.exports.__esModule=!0;},function(e,t,n){var r=n(15),i=n(51);function o(t,n,a){return i()?(e.exports=o=Reflect.construct,e.exports.default=e.exports,e.exports.__esModule=!0):(e.exports=o=function(e,t,n){var i=[null];i.push.apply(i,t);var o=new(Function.bind.apply(e,i));return n&&r(o,n.prototype),o},e.exports.default=e.exports,e.exports.__esModule=!0),o.apply(null,arguments)}e.exports=o,e.exports.default=e.exports,e.exports.__esModule=!0;},function(e,t){e.exports=function(){if("undefined"==typeof Reflect||!Reflect.construct)return !1;if(Reflect.construct.sham)return !1;if("function"==typeof Proxy)return !0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return !1}},e.exports.default=e.exports,e.exports.__esModule=!0;},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=function(){return i.default.PNAddChannelsToGroupOperation},t.getRequestTimeout=function(e){return e.config.getTransactionTimeout()},t.getURL=function(e,t){var n=t.channelGroup,r=e.config;return "/v1/channel-registration/sub-key/".concat(r.subscribeKey,"/channel-group/").concat(o.default.encodeString(n))},t.handleResponse=function(){return {}},t.isAuthSupported=function(){return !0},t.prepareParams=function(e,t){var n=t.channels;return {add:(void 0===n?[]:n).join(",")}},t.validateParams=function(e,t){var n=t.channels,r=t.channelGroup,i=e.config;if(!r)return "Missing Channel Group";if(!n||0===n.length)return "Missing Channels";if(!i.subscribeKey)return "Missing Subscribe Key"};n(2);var i=r(n(1)),o=r(n(3));},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=function(){return i.default.PNRemoveChannelsFromGroupOperation},t.getRequestTimeout=function(e){return e.config.getTransactionTimeout()},t.getURL=function(e,t){var n=t.channelGroup,r=e.config;return "/v1/channel-registration/sub-key/".concat(r.subscribeKey,"/channel-group/").concat(o.default.encodeString(n))},t.handleResponse=function(){return {}},t.isAuthSupported=function(){return !0},t.prepareParams=function(e,t){var n=t.channels;return {remove:(void 0===n?[]:n).join(",")}},t.validateParams=function(e,t){var n=t.channels,r=t.channelGroup,i=e.config;if(!r)return "Missing Channel Group";if(!n||0===n.length)return "Missing Channels";if(!i.subscribeKey)return "Missing Subscribe Key"};n(2);var i=r(n(1)),o=r(n(3));},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=function(){return i.default.PNRemoveGroupOperation},t.getRequestTimeout=function(e){return e.config.getTransactionTimeout()},t.getURL=function(e,t){var n=t.channelGroup,r=e.config;return "/v1/channel-registration/sub-key/".concat(r.subscribeKey,"/channel-group/").concat(o.default.encodeString(n),"/remove")},t.handleResponse=function(){return {}},t.isAuthSupported=function(){return !0},t.prepareParams=function(){return {}},t.validateParams=function(e,t){var n=t.channelGroup,r=e.config;if(!n)return "Missing Channel Group";if(!r.subscribeKey)return "Missing Subscribe Key"};n(2);var i=r(n(1)),o=r(n(3));},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=function(){return i.default.PNChannelGroupsOperation},t.getRequestTimeout=function(e){return e.config.getTransactionTimeout()},t.getURL=function(e){var t=e.config;return "/v1/channel-registration/sub-key/".concat(t.subscribeKey,"/channel-group")},t.handleResponse=function(e,t){return {groups:t.payload.groups}},t.isAuthSupported=function(){return !0},t.prepareParams=function(){return {}},t.validateParams=function(e){if(!e.config.subscribeKey)return "Missing Subscribe Key"};n(2);var i=r(n(1));},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=function(){return i.default.PNChannelsForGroupOperation},t.getRequestTimeout=function(e){return e.config.getTransactionTimeout()},t.getURL=function(e,t){var n=t.channelGroup,r=e.config;return "/v1/channel-registration/sub-key/".concat(r.subscribeKey,"/channel-group/").concat(o.default.encodeString(n))},t.handleResponse=function(e,t){return {channels:t.payload.channels}},t.isAuthSupported=function(){return !0},t.prepareParams=function(){return {}},t.validateParams=function(e,t){var n=t.channelGroup,r=e.config;if(!n)return "Missing Channel Group";if(!r.subscribeKey)return "Missing Subscribe Key"};n(2);var i=r(n(1)),o=r(n(3));},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=function(){return i.default.PNPushNotificationEnabledChannelsOperation},t.getRequestTimeout=function(e){return e.config.getTransactionTimeout()},t.getURL=function(e,t){var n=t.device,r=t.pushGateway,i=e.config;if("apns2"===r)return "/v2/push/sub-key/".concat(i.subscribeKey,"/devices-apns2/").concat(n);return "/v1/push/sub-key/".concat(i.subscribeKey,"/devices/").concat(n)},t.handleResponse=function(){return {}},t.isAuthSupported=function(){return !0},t.prepareParams=function(e,t){var n=t.pushGateway,r=t.channels,i=void 0===r?[]:r,o=t.environment,a=void 0===o?"development":o,u=t.topic,s={type:n,add:i.join(",")};"apns2"===n&&delete(s=Object.assign({},s,{environment:a,topic:u})).type;return s},t.validateParams=function(e,t){var n=t.device,r=t.pushGateway,i=t.channels,o=t.topic,a=e.config;if(!n)return "Missing Device ID (device)";if(!r)return "Missing GW Type (pushGateway: gcm, apns or apns2)";if("apns2"===r&&!o)return "Missing APNS2 topic";if(!i||0===i.length)return "Missing Channels";if(!a.subscribeKey)return "Missing Subscribe Key"};n(2);var i=r(n(1));},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=function(){return i.default.PNPushNotificationEnabledChannelsOperation},t.getRequestTimeout=function(e){return e.config.getTransactionTimeout()},t.getURL=function(e,t){var n=t.device,r=t.pushGateway,i=e.config;if("apns2"===r)return "/v2/push/sub-key/".concat(i.subscribeKey,"/devices-apns2/").concat(n);return "/v1/push/sub-key/".concat(i.subscribeKey,"/devices/").concat(n)},t.handleResponse=function(){return {}},t.isAuthSupported=function(){return !0},t.prepareParams=function(e,t){var n=t.pushGateway,r=t.channels,i=void 0===r?[]:r,o=t.environment,a=void 0===o?"development":o,u=t.topic,s={type:n,remove:i.join(",")};"apns2"===n&&delete(s=Object.assign({},s,{environment:a,topic:u})).type;return s},t.validateParams=function(e,t){var n=t.device,r=t.pushGateway,i=t.channels,o=t.topic,a=e.config;if(!n)return "Missing Device ID (device)";if(!r)return "Missing GW Type (pushGateway: gcm, apns or apns2)";if("apns2"===r&&!o)return "Missing APNS2 topic";if(!i||0===i.length)return "Missing Channels";if(!a.subscribeKey)return "Missing Subscribe Key"};n(2);var i=r(n(1));},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=function(){return i.default.PNPushNotificationEnabledChannelsOperation},t.getRequestTimeout=function(e){return e.config.getTransactionTimeout()},t.getURL=function(e,t){var n=t.device,r=t.pushGateway,i=e.config;if("apns2"===r)return "/v2/push/sub-key/".concat(i.subscribeKey,"/devices-apns2/").concat(n);return "/v1/push/sub-key/".concat(i.subscribeKey,"/devices/").concat(n)},t.handleResponse=function(e,t){return {channels:t}},t.isAuthSupported=function(){return !0},t.prepareParams=function(e,t){var n=t.pushGateway,r=t.environment,i=void 0===r?"development":r,o=t.topic,a={type:n};"apns2"===n&&delete(a=Object.assign({},a,{environment:i,topic:o})).type;return a},t.validateParams=function(e,t){var n=t.device,r=t.pushGateway,i=t.topic,o=e.config;if(!n)return "Missing Device ID (device)";if(!r)return "Missing GW Type (pushGateway: gcm, apns or apns2)";if("apns2"===r&&!i)return "Missing APNS2 topic";if(!o.subscribeKey)return "Missing Subscribe Key"};n(2);var i=r(n(1));},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=function(){return i.default.PNRemoveAllPushNotificationsOperation},t.getRequestTimeout=function(e){return e.config.getTransactionTimeout()},t.getURL=function(e,t){var n=t.device,r=t.pushGateway,i=e.config;if("apns2"===r)return "/v2/push/sub-key/".concat(i.subscribeKey,"/devices-apns2/").concat(n,"/remove");return "/v1/push/sub-key/".concat(i.subscribeKey,"/devices/").concat(n,"/remove")},t.handleResponse=function(){return {}},t.isAuthSupported=function(){return !0},t.prepareParams=function(e,t){var n=t.pushGateway,r=t.environment,i=void 0===r?"development":r,o=t.topic,a={type:n};"apns2"===n&&delete(a=Object.assign({},a,{environment:i,topic:o})).type;return a},t.validateParams=function(e,t){var n=t.device,r=t.pushGateway,i=t.topic,o=e.config;if(!n)return "Missing Device ID (device)";if(!r)return "Missing GW Type (pushGateway: gcm, apns or apns2)";if("apns2"===r&&!i)return "Missing APNS2 topic";if(!o.subscribeKey)return "Missing Subscribe Key"};n(2);var i=r(n(1));},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=function(){return i.default.PNUnsubscribeOperation},t.getRequestTimeout=function(e){return e.config.getTransactionTimeout()},t.getURL=function(e,t){var n=e.config,r=t.channels,i=void 0===r?[]:r,a=i.length>0?i.join(","):",";return "/v2/presence/sub-key/".concat(n.subscribeKey,"/channel/").concat(o.default.encodeString(a),"/leave")},t.handleResponse=function(){return {}},t.isAuthSupported=function(){return !0},t.prepareParams=function(e,t){var n=t.channelGroups,r=void 0===n?[]:n,i={};r.length>0&&(i["channel-group"]=r.join(","));return i},t.validateParams=function(e){if(!e.config.subscribeKey)return "Missing Subscribe Key"};n(2);var i=r(n(1)),o=r(n(3));},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=function(){return i.default.PNWhereNowOperation},t.getRequestTimeout=function(e){return e.config.getTransactionTimeout()},t.getURL=function(e,t){var n=e.config,r=t.uuid,i=void 0===r?n.UUID:r;return "/v2/presence/sub-key/".concat(n.subscribeKey,"/uuid/").concat(o.default.encodeString(i))},t.handleResponse=function(e,t){if(!t.payload)return {channels:[]};return {channels:t.payload.channels}},t.isAuthSupported=function(){return !0},t.prepareParams=function(){return {}},t.validateParams=function(e){if(!e.config.subscribeKey)return "Missing Subscribe Key"};n(2);var i=r(n(1)),o=r(n(3));},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=function(){return i.default.PNHeartbeatOperation},t.getRequestTimeout=function(e){return e.config.getTransactionTimeout()},t.getURL=function(e,t){var n=e.config,r=t.channels,i=void 0===r?[]:r,a=i.length>0?i.join(","):",";return "/v2/presence/sub-key/".concat(n.subscribeKey,"/channel/").concat(o.default.encodeString(a),"/heartbeat")},t.handleResponse=function(){return {}},t.isAuthSupported=function(){return !0},t.prepareParams=function(e,t){var n=t.channelGroups,r=void 0===n?[]:n,i=t.state,o=void 0===i?{}:i,a=e.config,u={};r.length>0&&(u["channel-group"]=r.join(","));return u.state=JSON.stringify(o),u.heartbeat=a.getPresenceTimeout(),u},t.validateParams=function(e){if(!e.config.subscribeKey)return "Missing Subscribe Key"};n(2);var i=r(n(1)),o=r(n(3));},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=function(){return i.default.PNGetStateOperation},t.getRequestTimeout=function(e){return e.config.getTransactionTimeout()},t.getURL=function(e,t){var n=e.config,r=t.uuid,i=void 0===r?n.UUID:r,a=t.channels,u=void 0===a?[]:a,s=u.length>0?u.join(","):",";return "/v2/presence/sub-key/".concat(n.subscribeKey,"/channel/").concat(o.default.encodeString(s),"/uuid/").concat(i)},t.handleResponse=function(e,t,n){var r=n.channels,i=void 0===r?[]:r,o=n.channelGroups,a=void 0===o?[]:o,u={};1===i.length&&0===a.length?u[i[0]]=t.payload:u=t.payload;return {channels:u}},t.isAuthSupported=function(){return !0},t.prepareParams=function(e,t){var n=t.channelGroups,r=void 0===n?[]:n,i={};r.length>0&&(i["channel-group"]=r.join(","));return i},t.validateParams=function(e){if(!e.config.subscribeKey)return "Missing Subscribe Key"};n(2);var i=r(n(1)),o=r(n(3));},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=function(){return i.default.PNSetStateOperation},t.getRequestTimeout=function(e){return e.config.getTransactionTimeout()},t.getURL=function(e,t){var n=e.config,r=t.channels,i=void 0===r?[]:r,a=i.length>0?i.join(","):",";return "/v2/presence/sub-key/".concat(n.subscribeKey,"/channel/").concat(o.default.encodeString(a),"/uuid/").concat(o.default.encodeString(n.UUID),"/data")},t.handleResponse=function(e,t){return {state:t.payload}},t.isAuthSupported=function(){return !0},t.prepareParams=function(e,t){var n=t.state,r=t.channelGroups,i=void 0===r?[]:r,o={};o.state=JSON.stringify(n),i.length>0&&(o["channel-group"]=i.join(","));return o},t.validateParams=function(e,t){var n=e.config,r=t.state,i=t.channels,o=void 0===i?[]:i,a=t.channelGroups,u=void 0===a?[]:a;if(!r)return "Missing State";if(!n.subscribeKey)return "Missing Subscribe Key";if(0===o.length&&0===u.length)return "Please provide a list of channels and/or channel-groups"};n(2);var i=r(n(1)),o=r(n(3));},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=function(){return o.default.PNHereNowOperation},t.getRequestTimeout=function(e){return e.config.getTransactionTimeout()},t.getURL=function(e,t){var n=e.config,r=t.channels,i=void 0===r?[]:r,o=t.channelGroups,u=void 0===o?[]:o,s="/v2/presence/sub-key/".concat(n.subscribeKey);if(i.length>0||u.length>0){var c=i.length>0?i.join(","):",";s+="/channel/".concat(a.default.encodeString(c));}return s},t.handleError=function(e,t,n){402!==n.statusCode||this.getURL(e,t).includes("channel")||(n.errorData.message="You have tried to perform a Global Here Now operation, your keyset configuration does not support that. Please provide a channel, or enable the Global Here Now feature from the Portal.");},t.handleResponse=function(e,t,n){var r,i=n.channels,o=void 0===i?[]:i,a=n.channelGroups,u=void 0===a?[]:a,s=n.includeUUIDs,c=void 0===s||s,l=n.includeState,f=void 0!==l&&l;r=o.length>1||u.length>0||0===u.length&&0===o.length?function(){var e={};return e.totalChannels=t.payload.total_channels,e.totalOccupancy=t.payload.total_occupancy,e.channels={},Object.keys(t.payload.channels).forEach((function(n){var r=t.payload.channels[n],i=[];return e.channels[n]={occupants:i,name:n,occupancy:r.occupancy},c&&r.uuids.forEach((function(e){f?i.push({state:e.state,uuid:e.uuid}):i.push({state:null,uuid:e});})),e})),e}():function(){var e={},n=[];return e.totalChannels=1,e.totalOccupancy=t.occupancy,e.channels={},e.channels[o[0]]={occupants:n,name:o[0],occupancy:t.occupancy},c&&t.uuids&&t.uuids.forEach((function(e){f?n.push({state:e.state,uuid:e.uuid}):n.push({state:null,uuid:e});})),e}();return r},t.isAuthSupported=function(){return !0},t.prepareParams=function(e,t){var n=t.channelGroups,r=void 0===n?[]:n,i=t.includeUUIDs,o=void 0===i||i,a=t.includeState,u=void 0!==a&&a,c=t.queryParameters,l=void 0===c?{}:c,f={};o||(f.disable_uuids=1);u&&(f.state=1);r.length>0&&(f["channel-group"]=r.join(","));return f=s(s({},f),l)},t.validateParams=function(e){if(!e.config.subscribeKey)return "Missing Subscribe Key"};var i=r(n(4)),o=(n(2),r(n(1))),a=r(n(3));function u(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r);}return n}function s(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?u(Object(n),!0).forEach((function(t){(0, i.default)(e,t,n[t]);})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):u(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t));}));}return e}},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=function(){return i.default.PNAddMessageActionOperation},t.getRequestHeaders=function(){return {"Content-Type":"application/json"}},t.getRequestTimeout=function(e){return e.config.getTransactionTimeout()},t.handleResponse=function(e,t){return {data:t.data}},t.isAuthSupported=function(){return !0},t.postPayload=function(e,t){return t.action},t.postURL=function(e,t){var n=e.config,r=t.channel,i=t.messageTimetoken;return "/v1/message-actions/".concat(n.subscribeKey,"/channel/").concat(o.default.encodeString(r),"/message/").concat(i)},t.prepareParams=function(){return {}},t.usePost=function(){return !0},t.validateParams=function(e,t){var n=e.config,r=t.action,i=t.channel;if(!t.messageTimetoken)return "Missing message timetoken";if(!n.subscribeKey)return "Missing Subscribe Key";if(!i)return "Missing message channel";if(!r)return "Missing Action";if(!r.value)return "Missing Action.value";if(!r.type)return "Missing Action.type";if(r.type.length>15)return "Action.type value exceed maximum length of 15"};n(2);var i=r(n(1)),o=r(n(3));},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=function(){return i.default.PNRemoveMessageActionOperation},t.getRequestTimeout=function(e){return e.config.getTransactionTimeout()},t.getURL=function(e,t){var n=e.config,r=t.channel,i=t.actionTimetoken,a=t.messageTimetoken;return "/v1/message-actions/".concat(n.subscribeKey,"/channel/").concat(o.default.encodeString(r),"/message/").concat(a,"/action/").concat(i)},t.handleResponse=function(e,t){return {data:t.data}},t.isAuthSupported=function(){return !0},t.prepareParams=function(){return {}},t.useDelete=function(){return !0},t.validateParams=function(e,t){var n=e.config,r=t.channel,i=t.actionTimetoken;if(!t.messageTimetoken)return "Missing message timetoken";if(!i)return "Missing action timetoken";if(!n.subscribeKey)return "Missing Subscribe Key";if(!r)return "Missing message channel"};n(2);var i=r(n(1)),o=r(n(3));},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=function(){return i.default.PNGetMessageActionsOperation},t.getRequestTimeout=function(e){return e.config.getTransactionTimeout()},t.getURL=function(e,t){var n=e.config,r=t.channel;return "/v1/message-actions/".concat(n.subscribeKey,"/channel/").concat(o.default.encodeString(r))},t.handleResponse=function(e,t){var n={data:t.data,start:null,end:null};n.data.length&&(n.end=n.data[n.data.length-1].actionTimetoken,n.start=n.data[0].actionTimetoken);return n},t.isAuthSupported=function(){return !0},t.prepareParams=function(e,t){var n=t.limit,r=t.start,i=t.end,o={};n&&(o.limit=n);r&&(o.start=r);i&&(o.end=i);return o},t.validateParams=function(e,t){var n=e.config,r=t.channel;if(!n.subscribeKey)return "Missing Subscribe Key";if(!r)return "Missing message channel"};n(2);var i=r(n(1)),o=r(n(3));},function(e,t,n){},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var i=r(n(1)),o=r(n(3)),a={getOperation:function(){return i.default.PNListFilesOperation},validateParams:function(e,t){if(null==t||!t.channel)return "channel can't be empty"},getURL:function(e,t){var n=e.config;return "/v1/files/".concat(n.subscribeKey,"/channels/").concat(o.default.encodeString(t.channel),"/files")},getRequestTimeout:function(e){return e.config.getTransactionTimeout()},isAuthSupported:function(){return !0},prepareParams:function(e,t){var n={};return t.limit&&(n.limit=t.limit),t.next&&(n.next=t.next),n},handleResponse:function(e,t){return {status:t.status,data:t.data,next:t.next,count:t.count}}};t.default=a,e.exports=t.default;},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var i=r(n(1)),o=r(n(3)),a={getOperation:function(){return i.default.PNGenerateUploadUrlOperation},validateParams:function(e,t){return null!=t&&t.channel?null!=t&&t.name?void 0:"name can't be empty":"channel can't be empty"},usePost:function(){return !0},postURL:function(e,t){var n=e.config;return "/v1/files/".concat(n.subscribeKey,"/channels/").concat(o.default.encodeString(t.channel),"/generate-upload-url")},postPayload:function(e,t){return {name:t.name}},getRequestTimeout:function(e){return e.config.getTransactionTimeout()},isAuthSupported:function(){return !0},prepareParams:function(){return {}},handleResponse:function(e,t){return {status:t.status,data:t.data,file_upload_request:t.file_upload_request}}};t.default=a,e.exports=t.default;},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var i=r(n(7)),o=r(n(1)),a=r(n(3)),u={getOperation:function(){return o.default.PNPublishFileOperation},validateParams:function(e,t){return null!=t&&t.channel?null!=t&&t.fileId?null!=t&&t.fileName?void 0:"file name can't be empty":"file id can't be empty":"channel can't be empty"},getURL:function(e,t){var n=e.config,r=n.publishKey,i=n.subscribeKey,o=function(e,t){var n=e.crypto,r=e.config,i=JSON.stringify(t);return r.cipherKey&&(i=n.encrypt(i),i=JSON.stringify(i)),i||""}(e,{message:t.message,file:{name:t.fileName,id:t.fileId}});return "/v1/files/publish-file/".concat(r,"/").concat(i,"/0/").concat(a.default.encodeString(t.channel),"/0/").concat(a.default.encodeString(o))},getRequestTimeout:function(e){return e.config.getTransactionTimeout()},isAuthSupported:function(){return !0},prepareParams:function(e,t){var n={};return t.ttl&&(n.ttl=t.ttl),void 0!==t.storeInHistory&&(n.store=t.storeInHistory?"1":"0"),t.meta&&"object"===(0, i.default)(t.meta)&&(n.meta=JSON.stringify(t.meta)),n},handleResponse:function(e,t){return {timetoken:t[2]}}};t.default=u,e.exports=t.default;},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var i=r(n(11)),o=r(n(12)),a=n(18),u=function(e){return new Promise((function(t){var n="";e.on("data",(function(e){n+=e.toString("utf8");})),e.on("end",(function(){t(n);}));}))};t.default=function(e){var t,n,r,s,c,l,f,d,p,h=(r=(t=e).generateUploadUrl,s=t.publishFile,c=t.modules,l=c.PubNubFile,f=c.config,d=c.cryptography,p=c.networking,n=(0, o.default)(i.default.mark((function e(t){var n,o,c,h,y,g,v,b,m,_,P,O,S,w,k,T,x,A,M,E,j,R;return i.default.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(n=t.channel,o=t.file,c=t.message,h=t.cipherKey,y=t.meta,g=t.ttl,v=t.storeInHistory,n){e.next=3;break}throw new a.PubNubError("Validation failed, check status for details",(0, a.createValidationError)("channel can't be empty"));case 3:if(o){e.next=5;break}throw new a.PubNubError("Validation failed, check status for details",(0, a.createValidationError)("file can't be empty"));case 5:return b=l.create(o),e.next=8,r({channel:n,name:b.name});case 8:if(m=e.sent,_=m.file_upload_request,P=_.url,O=_.form_fields,S=m.data,w=S.id,k=S.name,!l.supportsEncryptFile||!(null!=h?h:f.cipherKey)){e.next=19;break}return e.next=18,d.encryptFile(null!=h?h:f.cipherKey,b,l);case 18:b=e.sent;case 19:if(T=O,b.mimeType&&(T=O.map((function(e){return "Content-Type"===e.key?{key:e.key,value:b.mimeType}:e}))),e.prev=21,!l.supportsFileUri||!o.uri){e.next=34;break}return e.t0=p,e.t1=P,e.t2=T,e.next=28,b.toFileUri();case 28:return e.t3=e.sent,e.next=31,e.t0.POSTFILE.call(e.t0,e.t1,e.t2,e.t3);case 31:x=e.sent,e.next=71;break;case 34:if(!l.supportsFile){e.next=46;break}return e.t4=p,e.t5=P,e.t6=T,e.next=40,b.toFile();case 40:return e.t7=e.sent,e.next=43,e.t4.POSTFILE.call(e.t4,e.t5,e.t6,e.t7);case 43:x=e.sent,e.next=71;break;case 46:if(!l.supportsBuffer){e.next=58;break}return e.t8=p,e.t9=P,e.t10=T,e.next=52,b.toBuffer();case 52:return e.t11=e.sent,e.next=55,e.t8.POSTFILE.call(e.t8,e.t9,e.t10,e.t11);case 55:x=e.sent,e.next=71;break;case 58:if(!l.supportsBlob){e.next=70;break}return e.t12=p,e.t13=P,e.t14=T,e.next=64,b.toBlob();case 64:return e.t15=e.sent,e.next=67,e.t12.POSTFILE.call(e.t12,e.t13,e.t14,e.t15);case 67:x=e.sent,e.next=71;break;case 70:throw new Error("Unsupported environment");case 71:e.next=80;break;case 73:return e.prev=73,e.t16=e.catch(21),e.next=77,u(e.t16.response);case 77:throw A=e.sent,M=/<Message>(.*)<\/Message>/gi.exec(A),new a.PubNubError(M?"Upload to bucket failed: ".concat(M[1]):"Upload to bucket failed.",e.t16);case 80:if(204===x.status){e.next=82;break}throw new a.PubNubError("Upload to bucket was unsuccessful",x);case 82:E=f.fileUploadPublishRetryLimit,j=!1,R={timetoken:"0"};case 85:return e.prev=85,e.next=88,s({channel:n,message:c,fileId:w,fileName:k,meta:y,storeInHistory:v,ttl:g});case 88:R=e.sent,j=!0,e.next=95;break;case 92:e.prev=92,e.t17=e.catch(85),E-=1;case 95:if(!j&&E>0){e.next=85;break}case 96:if(j){e.next=100;break}throw new a.PubNubError("Publish failed. You may want to execute that operation manually using pubnub.publishFile",{channel:n,id:w,name:k});case 100:return e.abrupt("return",{timetoken:R.timetoken,id:w,name:k});case 101:case"end":return e.stop()}}),e,null,[[21,73],[85,92]])}))),function(e){return n.apply(this,arguments)});return function(e,t){var n=h(e);return "function"==typeof t?(n.then((function(e){return t(null,e)})).catch((function(e){return t(e,null)})),n):n}},e.exports=t.default;},function(e,t,n){var r=function(e){var t=Object.prototype,n=t.hasOwnProperty,r="function"==typeof Symbol?Symbol:{},i=r.iterator||"@@iterator",o=r.asyncIterator||"@@asyncIterator",a=r.toStringTag||"@@toStringTag";function u(e,t,n){return Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}),e[t]}try{u({},"");}catch(e){u=function(e,t,n){return e[t]=n};}function s(e,t,n,r){var i=t&&t.prototype instanceof f?t:f,o=Object.create(i.prototype),a=new S(r||[]);return o._invoke=function(e,t,n){var r="suspendedStart";return function(i,o){if("executing"===r)throw new Error("Generator is already running");if("completed"===r){if("throw"===i)throw o;return k()}for(n.method=i,n.arg=o;;){var a=n.delegate;if(a){var u=_(a,n);if(u){if(u===l)continue;return u}}if("next"===n.method)n.sent=n._sent=n.arg;else if("throw"===n.method){if("suspendedStart"===r)throw r="completed",n.arg;n.dispatchException(n.arg);}else "return"===n.method&&n.abrupt("return",n.arg);r="executing";var s=c(e,t,n);if("normal"===s.type){if(r=n.done?"completed":"suspendedYield",s.arg===l)continue;return {value:s.arg,done:n.done}}"throw"===s.type&&(r="completed",n.method="throw",n.arg=s.arg);}}}(e,n,a),o}function c(e,t,n){try{return {type:"normal",arg:e.call(t,n)}}catch(e){return {type:"throw",arg:e}}}e.wrap=s;var l={};function f(){}function d(){}function p(){}var h={};u(h,i,(function(){return this}));var y=Object.getPrototypeOf,g=y&&y(y(w([])));g&&g!==t&&n.call(g,i)&&(h=g);var v=p.prototype=f.prototype=Object.create(h);function b(e){["next","throw","return"].forEach((function(t){u(e,t,(function(e){return this._invoke(t,e)}));}));}function m(e,t){var r;this._invoke=function(i,o){function a(){return new t((function(r,a){!function r(i,o,a,u){var s=c(e[i],e,o);if("throw"!==s.type){var l=s.arg,f=l.value;return f&&"object"==typeof f&&n.call(f,"__await")?t.resolve(f.__await).then((function(e){r("next",e,a,u);}),(function(e){r("throw",e,a,u);})):t.resolve(f).then((function(e){l.value=e,a(l);}),(function(e){return r("throw",e,a,u)}))}u(s.arg);}(i,o,r,a);}))}return r=r?r.then(a,a):a()};}function _(e,t){var n=e.iterator[t.method];if(void 0===n){if(t.delegate=null,"throw"===t.method){if(e.iterator.return&&(t.method="return",t.arg=void 0,_(e,t),"throw"===t.method))return l;t.method="throw",t.arg=new TypeError("The iterator does not provide a 'throw' method");}return l}var r=c(n,e.iterator,t.arg);if("throw"===r.type)return t.method="throw",t.arg=r.arg,t.delegate=null,l;var i=r.arg;return i?i.done?(t[e.resultName]=i.value,t.next=e.nextLoc,"return"!==t.method&&(t.method="next",t.arg=void 0),t.delegate=null,l):i:(t.method="throw",t.arg=new TypeError("iterator result is not an object"),t.delegate=null,l)}function P(e){var t={tryLoc:e[0]};1 in e&&(t.catchLoc=e[1]),2 in e&&(t.finallyLoc=e[2],t.afterLoc=e[3]),this.tryEntries.push(t);}function O(e){var t=e.completion||{};t.type="normal",delete t.arg,e.completion=t;}function S(e){this.tryEntries=[{tryLoc:"root"}],e.forEach(P,this),this.reset(!0);}function w(e){if(e){var t=e[i];if(t)return t.call(e);if("function"==typeof e.next)return e;if(!isNaN(e.length)){var r=-1,o=function t(){for(;++r<e.length;)if(n.call(e,r))return t.value=e[r],t.done=!1,t;return t.value=void 0,t.done=!0,t};return o.next=o}}return {next:k}}function k(){return {value:void 0,done:!0}}return d.prototype=p,u(v,"constructor",p),u(p,"constructor",d),d.displayName=u(p,a,"GeneratorFunction"),e.isGeneratorFunction=function(e){var t="function"==typeof e&&e.constructor;return !!t&&(t===d||"GeneratorFunction"===(t.displayName||t.name))},e.mark=function(e){return Object.setPrototypeOf?Object.setPrototypeOf(e,p):(e.__proto__=p,u(e,a,"GeneratorFunction")),e.prototype=Object.create(v),e},e.awrap=function(e){return {__await:e}},b(m.prototype),u(m.prototype,o,(function(){return this})),e.AsyncIterator=m,e.async=function(t,n,r,i,o){void 0===o&&(o=Promise);var a=new m(s(t,n,r,i),o);return e.isGeneratorFunction(n)?a:a.next().then((function(e){return e.done?e.value:a.next()}))},b(v),u(v,a,"Generator"),u(v,i,(function(){return this})),u(v,"toString",(function(){return "[object Generator]"})),e.keys=function(e){var t=[];for(var n in e)t.push(n);return t.reverse(),function n(){for(;t.length;){var r=t.pop();if(r in e)return n.value=r,n.done=!1,n}return n.done=!0,n}},e.values=w,S.prototype={constructor:S,reset:function(e){if(this.prev=0,this.next=0,this.sent=this._sent=void 0,this.done=!1,this.delegate=null,this.method="next",this.arg=void 0,this.tryEntries.forEach(O),!e)for(var t in this)"t"===t.charAt(0)&&n.call(this,t)&&!isNaN(+t.slice(1))&&(this[t]=void 0);},stop:function(){this.done=!0;var e=this.tryEntries[0].completion;if("throw"===e.type)throw e.arg;return this.rval},dispatchException:function(e){if(this.done)throw e;var t=this;function r(n,r){return a.type="throw",a.arg=e,t.next=n,r&&(t.method="next",t.arg=void 0),!!r}for(var i=this.tryEntries.length-1;i>=0;--i){var o=this.tryEntries[i],a=o.completion;if("root"===o.tryLoc)return r("end");if(o.tryLoc<=this.prev){var u=n.call(o,"catchLoc"),s=n.call(o,"finallyLoc");if(u&&s){if(this.prev<o.catchLoc)return r(o.catchLoc,!0);if(this.prev<o.finallyLoc)return r(o.finallyLoc)}else if(u){if(this.prev<o.catchLoc)return r(o.catchLoc,!0)}else {if(!s)throw new Error("try statement without catch or finally");if(this.prev<o.finallyLoc)return r(o.finallyLoc)}}}},abrupt:function(e,t){for(var r=this.tryEntries.length-1;r>=0;--r){var i=this.tryEntries[r];if(i.tryLoc<=this.prev&&n.call(i,"finallyLoc")&&this.prev<i.finallyLoc){var o=i;break}}o&&("break"===e||"continue"===e)&&o.tryLoc<=t&&t<=o.finallyLoc&&(o=null);var a=o?o.completion:{};return a.type=e,a.arg=t,o?(this.method="next",this.next=o.finallyLoc,l):this.complete(a)},complete:function(e,t){if("throw"===e.type)throw e.arg;return "break"===e.type||"continue"===e.type?this.next=e.arg:"return"===e.type?(this.rval=this.arg=e.arg,this.method="return",this.next="end"):"normal"===e.type&&t&&(this.next=t),l},finish:function(e){for(var t=this.tryEntries.length-1;t>=0;--t){var n=this.tryEntries[t];if(n.finallyLoc===e)return this.complete(n.completion,n.afterLoc),O(n),l}},catch:function(e){for(var t=this.tryEntries.length-1;t>=0;--t){var n=this.tryEntries[t];if(n.tryLoc===e){var r=n.completion;if("throw"===r.type){var i=r.arg;O(n);}return i}}throw new Error("illegal catch attempt")},delegateYield:function(e,t,n){return this.delegate={iterator:w(e),resultName:t,nextLoc:n},"next"===this.method&&(this.arg=void 0),l}},e}(e.exports);try{regeneratorRuntime=r;}catch(e){"object"==typeof globalThis?globalThis.regeneratorRuntime=r:Function("r","regeneratorRuntime = r")(r);}},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var i=n(18),o=r(n(3));t.default=function(e,t){var n=t.channel,r=t.id,a=t.name,u=e.config,s=e.networking;if(!n)throw new i.PubNubError("Validation failed, check status for details",(0, i.createValidationError)("channel can't be empty"));if(!r)throw new i.PubNubError("Validation failed, check status for details",(0, i.createValidationError)("file id can't be empty"));if(!a)throw new i.PubNubError("Validation failed, check status for details",(0, i.createValidationError)("file name can't be empty"));var c="/v1/files/".concat(u.subscribeKey,"/channels/").concat(o.default.encodeString(n),"/files/").concat(r,"/").concat(a),l={};l.uuid=u.getUUID(),l.pnsdk=(0, i.generatePNSDK)(u),u.getAuthKey()&&(l.auth=u.getAuthKey()),u.secretKey&&(0, i.signRequest)(e,c,l,{},{getOperation:function(){return "PubNubGetFileUrlOperation"}});var f=Object.keys(l).map((function(e){return "".concat(encodeURIComponent(e),"=").concat(encodeURIComponent(l[e]))})).join("&");return ""!==f?"".concat(s.getStandardOrigin()).concat(c,"?").concat(f):"".concat(s.getStandardOrigin()).concat(c)},e.exports=t.default;},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var i,o=r(n(11)),a=r(n(12)),u=r(n(1)),s=r(n(3)),c={getOperation:function(){return u.default.PNDownloadFileOperation},validateParams:function(e,t){return null!=t&&t.channel?null!=t&&t.name?null!=t&&t.id?void 0:"id can't be empty":"name can't be empty":"channel can't be empty"},useGetFile:function(){return !0},getFileURL:function(e,t){var n=e.config;return "/v1/files/".concat(n.subscribeKey,"/channels/").concat(s.default.encodeString(t.channel),"/files/").concat(t.id,"/").concat(t.name)},getRequestTimeout:function(e){return e.config.getTransactionTimeout()},isAuthSupported:function(){return !0},ignoreBody:function(){return !0},forceBuffered:function(){return !0},prepareParams:function(){return {}},handleResponse:(i=(0, a.default)(o.default.mark((function e(t,n,r){var i,a,u,s,c,l,f;return o.default.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(u=t.PubNubFile,s=t.config,c=t.cryptography,l=n.response.body,!u.supportsEncryptFile||!(null!==(i=r.cipherKey)&&void 0!==i?i:s.cipherKey)){e.next=6;break}return e.next=5,c.decrypt(null!==(f=r.cipherKey)&&void 0!==f?f:s.cipherKey,l);case 5:l=e.sent;case 6:return e.abrupt("return",u.create({data:l,name:null!==(a=n.response.name)&&void 0!==a?a:r.name,mimeType:n.response.type}));case 7:case"end":return e.stop()}}),e)}))),function(e,t,n){return i.apply(this,arguments)})};t.default=c,e.exports=t.default;},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var i=r(n(1)),o=r(n(3)),a={getOperation:function(){return i.default.PNListFilesOperation},validateParams:function(e,t){return null!=t&&t.channel?null!=t&&t.id?null!=t&&t.name?void 0:"file name can't be empty":"file id can't be empty":"channel can't be empty"},useDelete:function(){return !0},getURL:function(e,t){var n=e.config;return "/v1/files/".concat(n.subscribeKey,"/channels/").concat(o.default.encodeString(t.channel),"/files/").concat(t.id,"/").concat(t.name)},getRequestTimeout:function(e){return e.config.getTransactionTimeout()},isAuthSupported:function(){return !0},prepareParams:function(){return {}},handleResponse:function(e,t){return {status:t.status}}};t.default=a,e.exports=t.default;},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var i=r(n(9)),o=r(n(1)),a={getOperation:function(){return o.default.PNGetAllUUIDMetadataOperation},validateParams:function(){},getURL:function(e){var t=e.config;return "/v2/objects/".concat(t.subscribeKey,"/uuids")},getRequestTimeout:function(e){return e.config.getTransactionTimeout()},isAuthSupported:function(){return !0},prepareParams:function(e,t){var n,r,o,a,u,s,c,l,f,d={};(null!=t&&null!==(n=t.include)&&void 0!==n&&n.customFields&&(d.include="custom"),null!=t&&null!==(r=t.include)&&void 0!==r&&r.totalCount)&&(d.count=null===(s=t.include)||void 0===s?void 0:s.totalCount);null!=t&&null!==(o=t.page)&&void 0!==o&&o.next&&(d.start=null===(c=t.page)||void 0===c?void 0:c.next);null!=t&&null!==(a=t.page)&&void 0!==a&&a.prev&&(d.end=null===(l=t.page)||void 0===l?void 0:l.prev);(null!=t&&t.filter&&(d.filter=t.filter),d.limit=null!==(u=null==t?void 0:t.limit)&&void 0!==u?u:100,null!=t&&t.sort)&&(d.sort=Object.entries(null!==(f=t.sort)&&void 0!==f?f:{}).map((function(e){var t=(0, i.default)(e,2),n=t[0],r=t[1];return "asc"===r||"desc"===r?"".concat(n,":").concat(r):n})));return d},handleResponse:function(e,t){return {status:t.status,data:t.data,totalCount:t.totalCount,next:t.next,prev:t.prev}}};t.default=a,e.exports=t.default;},function(e,t){e.exports=function(e){if(Array.isArray(e))return e},e.exports.default=e.exports,e.exports.__esModule=!0;},function(e,t){e.exports=function(e,t){var n=null==e?null:"undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(null!=n){var r,i,o=[],a=!0,u=!1;try{for(n=n.call(e);!(a=(r=n.next()).done)&&(o.push(r.value),!t||o.length!==t);a=!0);}catch(e){u=!0,i=e;}finally{try{a||null==n.return||n.return();}finally{if(u)throw i}}return o}},e.exports.default=e.exports,e.exports.__esModule=!0;},function(e,t,n){var r=n(83);e.exports=function(e,t){if(e){if("string"==typeof e)return r(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);return "Object"===n&&e.constructor&&(n=e.constructor.name),"Map"===n||"Set"===n?Array.from(e):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?r(e,t):void 0}},e.exports.default=e.exports,e.exports.__esModule=!0;},function(e,t){e.exports=function(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=new Array(t);n<t;n++)r[n]=e[n];return r},e.exports.default=e.exports,e.exports.__esModule=!0;},function(e,t){e.exports=function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")},e.exports.default=e.exports,e.exports.__esModule=!0;},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var i=r(n(1)),o=r(n(3)),a={getOperation:function(){return i.default.PNGetUUIDMetadataOperation},validateParams:function(){},getURL:function(e,t){var n,r=e.config;return "/v2/objects/".concat(r.subscribeKey,"/uuids/").concat(o.default.encodeString(null!==(n=null==t?void 0:t.uuid)&&void 0!==n?n:r.getUUID()))},getRequestTimeout:function(e){return e.config.getTransactionTimeout()},isAuthSupported:function(){return !0},prepareParams:function(e,t){var n,r,i,o=e.config;return {uuid:null!==(n=null==t?void 0:t.uuid)&&void 0!==n?n:o.getUUID(),include:(null===(r=null==t||null===(i=t.include)||void 0===i?void 0:i.customFields)||void 0===r||r)&&"custom"}},handleResponse:function(e,t){return {status:t.status,data:t.data}}};t.default=a,e.exports=t.default;},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var i=r(n(1)),o=r(n(3)),a={getOperation:function(){return i.default.PNSetUUIDMetadataOperation},validateParams:function(e,t){if(null==t||!t.data)return "Data cannot be empty"},usePatch:function(){return !0},patchURL:function(e,t){var n,r=e.config;return "/v2/objects/".concat(r.subscribeKey,"/uuids/").concat(o.default.encodeString(null!==(n=t.uuid)&&void 0!==n?n:r.getUUID()))},patchPayload:function(e,t){return t.data},getRequestTimeout:function(e){return e.config.getTransactionTimeout()},isAuthSupported:function(){return !0},prepareParams:function(e,t){var n,r,i,o=e.config;return {uuid:null!==(n=null==t?void 0:t.uuid)&&void 0!==n?n:o.getUUID(),include:(null===(r=null==t||null===(i=t.include)||void 0===i?void 0:i.customFields)||void 0===r||r)&&"custom"}},handleResponse:function(e,t){return {status:t.status,data:t.data}}};t.default=a,e.exports=t.default;},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var i=r(n(1)),o=r(n(3)),a={getOperation:function(){return i.default.PNRemoveUUIDMetadataOperation},validateParams:function(){},getURL:function(e,t){var n,r=e.config;return "/v2/objects/".concat(r.subscribeKey,"/uuids/").concat(o.default.encodeString(null!==(n=null==t?void 0:t.uuid)&&void 0!==n?n:r.getUUID()))},useDelete:function(){return !0},getRequestTimeout:function(e){return e.config.getTransactionTimeout()},isAuthSupported:function(){return !0},prepareParams:function(e,t){var n,r=e.config;return {uuid:null!==(n=null==t?void 0:t.uuid)&&void 0!==n?n:r.getUUID()}},handleResponse:function(e,t){return {status:t.status,data:t.data}}};t.default=a,e.exports=t.default;},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var i=r(n(9)),o=r(n(1)),a={getOperation:function(){return o.default.PNGetAllChannelMetadataOperation},validateParams:function(){},getURL:function(e){var t=e.config;return "/v2/objects/".concat(t.subscribeKey,"/channels")},getRequestTimeout:function(e){return e.config.getTransactionTimeout()},isAuthSupported:function(){return !0},prepareParams:function(e,t){var n,r,o,a,u,s,c,l,f,d={};(null!=t&&null!==(n=t.include)&&void 0!==n&&n.customFields&&(d.include="custom"),null!=t&&null!==(r=t.include)&&void 0!==r&&r.totalCount)&&(d.count=null===(s=t.include)||void 0===s?void 0:s.totalCount);null!=t&&null!==(o=t.page)&&void 0!==o&&o.next&&(d.start=null===(c=t.page)||void 0===c?void 0:c.next);null!=t&&null!==(a=t.page)&&void 0!==a&&a.prev&&(d.end=null===(l=t.page)||void 0===l?void 0:l.prev);(null!=t&&t.filter&&(d.filter=t.filter),d.limit=null!==(u=null==t?void 0:t.limit)&&void 0!==u?u:100,null!=t&&t.sort)&&(d.sort=Object.entries(null!==(f=t.sort)&&void 0!==f?f:{}).map((function(e){var t=(0, i.default)(e,2),n=t[0],r=t[1];return "asc"===r||"desc"===r?"".concat(n,":").concat(r):n})));return d},handleResponse:function(e,t){return {status:t.status,data:t.data,totalCount:t.totalCount,prev:t.prev,next:t.next}}};t.default=a,e.exports=t.default;},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var i=r(n(1)),o=r(n(3)),a={getOperation:function(){return i.default.PNGetChannelMetadataOperation},validateParams:function(e,t){if(null==t||!t.channel)return "Channel cannot be empty"},getURL:function(e,t){var n=e.config;return "/v2/objects/".concat(n.subscribeKey,"/channels/").concat(o.default.encodeString(t.channel))},getRequestTimeout:function(e){return e.config.getTransactionTimeout()},isAuthSupported:function(){return !0},prepareParams:function(e,t){var n,r;return {include:(null===(n=null==t||null===(r=t.include)||void 0===r?void 0:r.customFields)||void 0===n||n)&&"custom"}},handleResponse:function(e,t){return {status:t.status,data:t.data}}};t.default=a,e.exports=t.default;},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var i=r(n(1)),o=r(n(3)),a={getOperation:function(){return i.default.PNSetChannelMetadataOperation},validateParams:function(e,t){return null!=t&&t.channel?null!=t&&t.data?void 0:"Data cannot be empty":"Channel cannot be empty"},usePatch:function(){return !0},patchURL:function(e,t){var n=e.config;return "/v2/objects/".concat(n.subscribeKey,"/channels/").concat(o.default.encodeString(t.channel))},patchPayload:function(e,t){return t.data},getRequestTimeout:function(e){return e.config.getTransactionTimeout()},isAuthSupported:function(){return !0},prepareParams:function(e,t){var n,r;return {include:(null===(n=null==t||null===(r=t.include)||void 0===r?void 0:r.customFields)||void 0===n||n)&&"custom"}},handleResponse:function(e,t){return {status:t.status,data:t.data}}};t.default=a,e.exports=t.default;},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var i=r(n(1)),o=r(n(3)),a={getOperation:function(){return i.default.PNRemoveChannelMetadataOperation},validateParams:function(e,t){if(null==t||!t.channel)return "Channel cannot be empty"},getURL:function(e,t){var n=e.config;return "/v2/objects/".concat(n.subscribeKey,"/channels/").concat(o.default.encodeString(t.channel))},useDelete:function(){return !0},getRequestTimeout:function(e){return e.config.getTransactionTimeout()},isAuthSupported:function(){return !0},prepareParams:function(){return {}},handleResponse:function(e,t){return {status:t.status,data:t.data}}};t.default=a,e.exports=t.default;},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var i=r(n(9)),o=r(n(1)),a=r(n(3)),u={getOperation:function(){return o.default.PNGetMembersOperation},validateParams:function(e,t){if(null==t||!t.channel)return "UUID cannot be empty"},getURL:function(e,t){var n=e.config;return "/v2/objects/".concat(n.subscribeKey,"/channels/").concat(a.default.encodeString(t.channel),"/uuids")},getRequestTimeout:function(e){return e.config.getTransactionTimeout()},isAuthSupported:function(){return !0},prepareParams:function(e,t){var n,r,o,a,u,s,c,l,f,d,p,h,y={};null!=t&&t.include&&(y.include=[],null!==(u=t.include)&&void 0!==u&&u.customFields&&y.include.push("custom"),null!==(s=t.include)&&void 0!==s&&s.customUUIDFields&&y.include.push("uuid.custom"),(null===(c=null===(l=t.include)||void 0===l?void 0:l.UUIDFields)||void 0===c||c)&&y.include.push("uuid"),y.include=y.include.join(","));null!=t&&null!==(n=t.include)&&void 0!==n&&n.totalCount&&(y.count=null===(f=t.include)||void 0===f?void 0:f.totalCount);null!=t&&null!==(r=t.page)&&void 0!==r&&r.next&&(y.start=null===(d=t.page)||void 0===d?void 0:d.next);null!=t&&null!==(o=t.page)&&void 0!==o&&o.prev&&(y.end=null===(p=t.page)||void 0===p?void 0:p.prev);(null!=t&&t.filter&&(y.filter=t.filter),y.limit=null!==(a=null==t?void 0:t.limit)&&void 0!==a?a:100,null!=t&&t.sort)&&(y.sort=Object.entries(null!==(h=t.sort)&&void 0!==h?h:{}).map((function(e){var t=(0, i.default)(e,2),n=t[0],r=t[1];return "asc"===r||"desc"===r?"".concat(n,":").concat(r):n})));return y},handleResponse:function(e,t){return {status:t.status,data:t.data,totalCount:t.totalCount,prev:t.prev,next:t.next}}};t.default=u,e.exports=t.default;},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var i=r(n(9)),o=r(n(4)),a=r(n(1)),u=r(n(3)),s={getOperation:function(){return a.default.PNSetMembersOperation},validateParams:function(e,t){return null!=t&&t.channel?null!=t&&t.uuids&&0!==(null==t?void 0:t.uuids.length)?void 0:"UUIDs cannot be empty":"Channel cannot be empty"},usePatch:function(){return !0},patchURL:function(e,t){var n=e.config;return "/v2/objects/".concat(n.subscribeKey,"/channels/").concat(u.default.encodeString(t.channel),"/uuids")},patchPayload:function(e,t){return (0, o.default)({set:[],remove:[]},t.type,t.uuids.map((function(e){return "string"==typeof e?{uuid:{id:e}}:{uuid:{id:e.id},custom:e.custom}})))},getRequestTimeout:function(e){return e.config.getTransactionTimeout()},isAuthSupported:function(){return !0},prepareParams:function(e,t){var n,r,o,a,u,s,c,l,f,d={};null!=t&&t.include&&(d.include=[],null!==(a=t.include)&&void 0!==a&&a.customFields&&d.include.push("custom"),null!==(u=t.include)&&void 0!==u&&u.customUUIDFields&&d.include.push("uuid.custom"),null!==(s=t.include)&&void 0!==s&&s.UUIDFields&&d.include.push("uuid"),d.include=d.include.join(","));(null!=t&&null!==(n=t.include)&&void 0!==n&&n.totalCount&&(d.count=!0),null!=t&&null!==(r=t.page)&&void 0!==r&&r.next)&&(d.start=null===(c=t.page)||void 0===c?void 0:c.next);null!=t&&null!==(o=t.page)&&void 0!==o&&o.prev&&(d.end=null===(l=t.page)||void 0===l?void 0:l.prev);(null!=t&&t.filter&&(d.filter=t.filter),null!=t&&t.limit&&(d.limit=t.limit),null!=t&&t.sort)&&(d.sort=Object.entries(null!==(f=t.sort)&&void 0!==f?f:{}).map((function(e){var t=(0, i.default)(e,2),n=t[0],r=t[1];return "asc"===r||"desc"===r?"".concat(n,":").concat(r):n})));return d},handleResponse:function(e,t){return {status:t.status,data:t.data,totalCount:t.totalCount,prev:t.prev,next:t.next}}};t.default=s,e.exports=t.default;},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var i=r(n(9)),o=r(n(1)),a=r(n(3)),u={getOperation:function(){return o.default.PNGetMembershipsOperation},validateParams:function(){},getURL:function(e,t){var n,r=e.config;return "/v2/objects/".concat(r.subscribeKey,"/uuids/").concat(a.default.encodeString(null!==(n=null==t?void 0:t.uuid)&&void 0!==n?n:r.getUUID()),"/channels")},getRequestTimeout:function(e){return e.config.getTransactionTimeout()},isAuthSupported:function(){return !0},prepareParams:function(e,t){var n,r,o,a,u,s,c,l,f,d,p,h={};null!=t&&t.include&&(h.include=[],null!==(u=t.include)&&void 0!==u&&u.customFields&&h.include.push("custom"),null!==(s=t.include)&&void 0!==s&&s.customChannelFields&&h.include.push("channel.custom"),null!==(c=t.include)&&void 0!==c&&c.channelFields&&h.include.push("channel"),h.include=h.include.join(","));null!=t&&null!==(n=t.include)&&void 0!==n&&n.totalCount&&(h.count=null===(l=t.include)||void 0===l?void 0:l.totalCount);null!=t&&null!==(r=t.page)&&void 0!==r&&r.next&&(h.start=null===(f=t.page)||void 0===f?void 0:f.next);null!=t&&null!==(o=t.page)&&void 0!==o&&o.prev&&(h.end=null===(d=t.page)||void 0===d?void 0:d.prev);(null!=t&&t.filter&&(h.filter=t.filter),h.limit=null!==(a=null==t?void 0:t.limit)&&void 0!==a?a:100,null!=t&&t.sort)&&(h.sort=Object.entries(null!==(p=t.sort)&&void 0!==p?p:{}).map((function(e){var t=(0, i.default)(e,2),n=t[0],r=t[1];return "asc"===r||"desc"===r?"".concat(n,":").concat(r):n})));return h},handleResponse:function(e,t){return {status:t.status,data:t.data,totalCount:t.totalCount,prev:t.prev,next:t.next}}};t.default=u,e.exports=t.default;},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var i=r(n(9)),o=r(n(4)),a=r(n(1)),u=r(n(3)),s={getOperation:function(){return a.default.PNSetMembershipsOperation},validateParams:function(e,t){if(null==t||!t.channels||0===(null==t?void 0:t.channels.length))return "Channels cannot be empty"},usePatch:function(){return !0},patchURL:function(e,t){var n,r=e.config;return "/v2/objects/".concat(r.subscribeKey,"/uuids/").concat(u.default.encodeString(null!==(n=t.uuid)&&void 0!==n?n:r.getUUID()),"/channels")},patchPayload:function(e,t){return (0, o.default)({set:[],remove:[]},t.type,t.channels.map((function(e){return "string"==typeof e?{channel:{id:e}}:{channel:{id:e.id},custom:e.custom}})))},getRequestTimeout:function(e){return e.config.getTransactionTimeout()},isAuthSupported:function(){return !0},prepareParams:function(e,t){var n,r,o,a,u,s,c,l,f,d={};null!=t&&t.include&&(d.include=[],null!==(a=t.include)&&void 0!==a&&a.customFields&&d.include.push("custom"),null!==(u=t.include)&&void 0!==u&&u.customChannelFields&&d.include.push("channel.custom"),null!==(s=t.include)&&void 0!==s&&s.channelFields&&d.include.push("channel"),d.include=d.include.join(","));(null!=t&&null!==(n=t.include)&&void 0!==n&&n.totalCount&&(d.count=!0),null!=t&&null!==(r=t.page)&&void 0!==r&&r.next)&&(d.start=null===(c=t.page)||void 0===c?void 0:c.next);null!=t&&null!==(o=t.page)&&void 0!==o&&o.prev&&(d.end=null===(l=t.page)||void 0===l?void 0:l.prev);(null!=t&&t.filter&&(d.filter=t.filter),null!=t&&t.limit&&(d.limit=t.limit),null!=t&&t.sort)&&(d.sort=Object.entries(null!==(f=t.sort)&&void 0!==f?f:{}).map((function(e){var t=(0, i.default)(e,2),n=t[0],r=t[1];return "asc"===r||"desc"===r?"".concat(n,":").concat(r):n})));return d},handleResponse:function(e,t){return {status:t.status,data:t.data,totalCount:t.totalCount,prev:t.prev,next:t.next}}};t.default=s,e.exports=t.default;},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=function(){return i.default.PNCreateUserOperation},t.getRequestTimeout=function(e){return e.config.getTransactionTimeout()},t.getURL=function(e){var t=e.config;return "/v1/objects/".concat(t.subscribeKey,"/users")},t.handleResponse=function(e,t){return t},t.isAuthSupported=function(){return !0},t.postPayload=function(e,t){return function(e,t){return t}(0,t)},t.postURL=function(e){var t=e.config;return "/v1/objects/".concat(t.subscribeKey,"/users")},t.prepareParams=function(e,t){var n=t.include,r={};n?void 0===n.customFields&&(n.customFields=!0):n={customFields:!0};if(n){var i=[];n.customFields&&i.push("custom");var o=i.join(",");o.length>0&&(r.include=o);}return r},t.usePost=function(){return !0},t.validateParams=function(e,t){var n=e.config,r=t.id,i=t.name,o=t.custom;if(!r)return "Missing User.id";if(!i)return "Missing User.name";if(!n.subscribeKey)return "Missing Subscribe Key";if(o&&!Object.values(o).every((function(e){return "string"==typeof e||"number"==typeof e||"boolean"==typeof e})))return "Invalid custom type, only string, number and boolean values are allowed."};n(2);var i=r(n(1));},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=function(){return i.default.PNUpdateUserOperation},t.getRequestTimeout=function(e){return e.config.getTransactionTimeout()},t.getURL=function(e,t){var n=e.config,r=t.id;return "/v1/objects/".concat(n.subscribeKey,"/users/").concat(o.default.encodeString(r))},t.handleResponse=function(e,t){return t},t.isAuthSupported=function(){return !0},t.patchPayload=function(e,t){return function(e,t){return t}(0,t)},t.patchURL=function(e,t){var n=e.config,r=t.id;return "/v1/objects/".concat(n.subscribeKey,"/users/").concat(o.default.encodeString(r))},t.prepareParams=function(e,t){var n=t.include,r={};n?void 0===n.customFields&&(n.customFields=!0):n={customFields:!0};if(n){var i=[];n.customFields&&i.push("custom");var o=i.join(",");o.length>0&&(r.include=o);}return r},t.usePatch=function(){return !0},t.validateParams=function(e,t){var n=e.config,r=t.id,i=t.name,o=t.custom;if(!r)return "Missing User.id";if(!i)return "Missing User.name";if(!n.subscribeKey)return "Missing Subscribe Key";if(o&&!Object.values(o).every((function(e){return "string"==typeof e||"number"==typeof e||"boolean"==typeof e})))return "Invalid custom type, only string, number and boolean values are allowed."};n(2);var i=r(n(1)),o=r(n(3));},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=function(){return i.default.PNDeleteUserOperation},t.getRequestTimeout=function(e){return e.config.getTransactionTimeout()},t.getURL=function(e,t){var n=e.config;return "/v1/objects/".concat(n.subscribeKey,"/users/").concat(o.default.encodeString(t))},t.handleResponse=function(e,t){return t},t.isAuthSupported=function(){return !0},t.prepareParams=function(){return {}},t.useDelete=function(){return !0},t.validateParams=function(e,t){var n=e.config;if(!t)return "Missing UserId";if(!n.subscribeKey)return "Missing Subscribe Key"};n(2);var i=r(n(1)),o=r(n(3));},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=function(){return i.default.PNGetUserOperation},t.getRequestTimeout=function(e){return e.config.getTransactionTimeout()},t.getURL=function(e,t){var n=e.config;return "/v1/objects/".concat(n.subscribeKey,"/users/").concat(o.default.encodeString(t.userId))},t.handleResponse=function(e,t){return t},t.isAuthSupported=function(){return !0},t.prepareParams=function(e,t){var n=t.include,r={};n?void 0===n.customFields&&(n.customFields=!0):n={customFields:!0};if(n){var i=[];n.customFields&&i.push("custom");var o=i.join(",");o.length>0&&(r.include=o);}return r},t.validateParams=function(e,t){if(!t.userId)return "Missing userId"};n(2);var i=r(n(1)),o=r(n(3));},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=function(){return i.default.PNGetUsersOperation},t.getRequestTimeout=function(e){return e.config.getTransactionTimeout()},t.getURL=function(e){var t=e.config;return "/v1/objects/".concat(t.subscribeKey,"/users")},t.handleResponse=function(e,t){return t},t.isAuthSupported=function(){return !0},t.prepareParams=function(e,t){var n=t.include,r=t.limit,i=t.page,o=t.filter,a={};r&&(a.limit=r);if(n){var u=[];n.totalCount&&(a.count=!0),n.customFields&&u.push("custom");var s=u.join(",");s.length>0&&(a.include=s);}i&&(i.next&&(a.start=i.next),i.prev&&(a.end=i.prev));o&&(a.filter=o);return a},t.validateParams=function(){};n(2);var i=r(n(1));},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=function(){return i.default.PNCreateSpaceOperation},t.getRequestTimeout=function(e){return e.config.getTransactionTimeout()},t.getURL=function(e){var t=e.config;return "/v1/objects/".concat(t.subscribeKey,"/spaces")},t.handleResponse=function(e,t){return t},t.isAuthSupported=function(){return !0},t.postPayload=function(e,t){return function(e,t){return t}(0,t)},t.postURL=function(e){var t=e.config;return "/v1/objects/".concat(t.subscribeKey,"/spaces")},t.prepareParams=function(e,t){var n=t.include,r={};n?void 0===n.customFields&&(n.customFields=!0):n={customFields:!0};if(n){var i=[];n.customFields&&i.push("custom");var o=i.join(",");o.length>0&&(r.include=o);}return r},t.usePost=function(){return !0},t.validateParams=function(e,t){var n=e.config,r=t.id,i=t.name,o=t.custom;if(!r)return "Missing Space.id";if(!i)return "Missing Space.name";if(!n.subscribeKey)return "Missing Subscribe Key";if(o&&!Object.values(o).every((function(e){return "string"==typeof e||"number"==typeof e||"boolean"==typeof e})))return "Invalid custom type, only string, number and boolean values are allowed."};n(2);var i=r(n(1));},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=function(){return i.default.PNUpdateSpaceOperation},t.getRequestTimeout=function(e){return e.config.getTransactionTimeout()},t.getURL=function(e,t){var n=e.config,r=t.id;return "/v1/objects/".concat(n.subscribeKey,"/spaces/").concat(o.default.encodeString(r))},t.handleResponse=function(e,t){return t},t.isAuthSupported=function(){return !0},t.patchPayload=function(e,t){return function(e,t){return t}(0,t)},t.patchURL=function(e,t){var n=e.config,r=t.id;return "/v1/objects/".concat(n.subscribeKey,"/spaces/").concat(o.default.encodeString(r))},t.prepareParams=function(e,t){var n=t.include,r={};n?void 0===n.customFields&&(n.customFields=!0):n={customFields:!0};if(n){var i=[];n.customFields&&i.push("custom");var o=i.join(",");o.length>0&&(r.include=o);}return r},t.usePatch=function(){return !0},t.validateParams=function(e,t){var n=e.config,r=t.id,i=t.name,o=t.custom;if(!r)return "Missing Space.id";if(!i)return "Missing Space.name";if(!n.subscribeKey)return "Missing Subscribe Key";if(o&&!Object.values(o).every((function(e){return "string"==typeof e||"number"==typeof e||"boolean"==typeof e})))return "Invalid custom type, only string, number and boolean values are allowed."};n(2);var i=r(n(1)),o=r(n(3));},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=function(){return i.default.PNDeleteSpaceOperation},t.getRequestTimeout=function(e){return e.config.getTransactionTimeout()},t.getURL=function(e,t){var n=e.config;return "/v1/objects/".concat(n.subscribeKey,"/spaces/").concat(o.default.encodeString(t))},t.handleResponse=function(e,t){return t},t.isAuthSupported=function(){return !0},t.prepareParams=function(){return {}},t.useDelete=function(){return !0},t.validateParams=function(e,t){var n=e.config;if(!t)return "Missing SpaceId";if(!n.subscribeKey)return "Missing Subscribe Key"};n(2);var i=r(n(1)),o=r(n(3));},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=function(){return i.default.PNGetSpacesOperation},t.getRequestTimeout=function(e){return e.config.getTransactionTimeout()},t.getURL=function(e){var t=e.config;return "/v1/objects/".concat(t.subscribeKey,"/spaces")},t.handleResponse=function(e,t){return t},t.isAuthSupported=function(){return !0},t.prepareParams=function(e,t){var n=t.include,r=t.limit,i=t.page,o=t.filter,a={};r&&(a.limit=r);if(n){var u=[];n.totalCount&&(a.count=!0),n.customFields&&u.push("custom");var s=u.join(",");s.length>0&&(a.include=s);}i&&(i.next&&(a.start=i.next),i.prev&&(a.end=i.prev));o&&(a.filter=o);return a},t.validateParams=function(){};n(2);var i=r(n(1));},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=function(){return i.default.PNGetSpaceOperation},t.getRequestTimeout=function(e){return e.config.getTransactionTimeout()},t.getURL=function(e,t){var n=e.config;return "/v1/objects/".concat(n.subscribeKey,"/spaces/").concat(o.default.encodeString(t.spaceId))},t.handleResponse=function(e,t){return t},t.isAuthSupported=function(){return !0},t.prepareParams=function(e,t){var n=t.include,r={};n?void 0===n.customFields&&(n.customFields=!0):n={customFields:!0};if(n){var i=[];n.customFields&&i.push("custom");var o=i.join(",");o.length>0&&(r.include=o);}return r},t.validateParams=function(e,t){if(!t.spaceId)return "Missing spaceId"};n(2);var i=r(n(1)),o=r(n(3));},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=function(){return i.default.PNGetMembersOperation},t.getRequestTimeout=function(e){return e.config.getTransactionTimeout()},t.getURL=function(e,t){var n=e.config;return "/v1/objects/".concat(n.subscribeKey,"/spaces/").concat(o.default.encodeString(t.spaceId),"/users")},t.handleResponse=function(e,t){return t},t.isAuthSupported=function(){return !0},t.prepareParams=function(e,t){var n=t.include,r=t.limit,i=t.page,o=t.filter,a={};r&&(a.limit=r);if(n){var u=[];n.totalCount&&(a.count=!0),n.customFields&&u.push("custom"),n.userFields&&u.push("user"),n.customUserFields&&u.push("user.custom");var s=u.join(",");s.length>0&&(a.include=s);}i&&(i.next&&(a.start=i.next),i.prev&&(a.end=i.prev));o&&(a.filter=o);return a},t.validateParams=function(e,t){if(!t.spaceId)return "Missing spaceId"};n(2);var i=r(n(1)),o=r(n(3));},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=function(){return i.default.PNUpdateMembersOperation},t.getRequestTimeout=function(e){return e.config.getTransactionTimeout()},t.getURL=function(e,t){var n=e.config;return "/v1/objects/".concat(n.subscribeKey,"/spaces/").concat(o.default.encodeString(t.spaceId),"/users")},t.handleResponse=function(e,t){return t},t.isAuthSupported=function(){return !0},t.patchPayload=function(e,t){return function(e,t){var n=t.users,r={};n&&n.length>0&&(r.add=[],n.forEach((function(e){var t={id:e.id};e.custom&&(t.custom=e.custom),r.add.push(t);})));return r}(0,t)},t.patchURL=function(e,t){var n=e.config;return "/v1/objects/".concat(n.subscribeKey,"/spaces/").concat(o.default.encodeString(t.spaceId),"/users")},t.prepareParams=function(e,t){var n=t.include,r=t.limit,i=t.page,o={};r&&(o.limit=r);if(n){var a=[];n.totalCount&&(o.count=!0),n.customFields&&a.push("custom"),n.spaceFields&&a.push("space"),n.customSpaceFields&&a.push("space.custom");var u=a.join(",");u.length>0&&(o.include=u);}i&&(i.next&&(o.start=i.next),i.prev&&(o.end=i.prev));return o},t.usePatch=function(){return !0},t.validateParams=function(e,t){var n=t.spaceId,r=t.users;if(!n)return "Missing spaceId";if(!r)return "Missing users"};n(2);var i=r(n(1)),o=r(n(3));},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=function(){return i.default.PNUpdateMembersOperation},t.getRequestTimeout=function(e){return e.config.getTransactionTimeout()},t.getURL=function(e,t){var n=e.config;return "/v1/objects/".concat(n.subscribeKey,"/spaces/").concat(o.default.encodeString(t.spaceId),"/users")},t.handleResponse=function(e,t){return t},t.isAuthSupported=function(){return !0},t.patchPayload=function(e,t){return function(e,t){var n=t.addMembers,r=t.updateMembers,i=t.removeMembers,o=t.users,a={};n&&n.length>0&&(a.add=[],n.forEach((function(e){var t={id:e.id};e.custom&&(t.custom=e.custom),a.add.push(t);})));r&&r.length>0&&(a.update=[],r.forEach((function(e){var t={id:e.id};e.custom&&(t.custom=e.custom),a.update.push(t);})));o&&o.length>0&&(a.update=a.update||[],o.forEach((function(e){var t={id:e.id};e.custom&&(t.custom=e.custom),a.update.push(t);})));i&&i.length>0&&(a.remove=[],i.forEach((function(e){a.remove.push({id:e});})));return a}(0,t)},t.patchURL=function(e,t){var n=e.config;return "/v1/objects/".concat(n.subscribeKey,"/spaces/").concat(o.default.encodeString(t.spaceId),"/users")},t.prepareParams=function(e,t){var n=t.include,r=t.limit,i=t.page,o={};r&&(o.limit=r);if(n){var a=[];n.totalCount&&(o.count=!0),n.customFields&&a.push("custom"),n.spaceFields&&a.push("space"),n.customSpaceFields&&a.push("space.custom");var u=a.join(",");u.length>0&&(o.include=u);}i&&(i.next&&(o.start=i.next),i.prev&&(o.end=i.prev));return o},t.usePatch=function(){return !0},t.validateParams=function(e,t){var n=t.spaceId,r=t.users;if(!n)return "Missing spaceId";if(!r)return "Missing users"};n(2);var i=r(n(1)),o=r(n(3));},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=function(){return i.default.PNUpdateMembersOperation},t.getRequestTimeout=function(e){return e.config.getTransactionTimeout()},t.getURL=function(e,t){var n=e.config;return "/v1/objects/".concat(n.subscribeKey,"/spaces/").concat(o.default.encodeString(t.spaceId),"/users")},t.handleResponse=function(e,t){return t},t.isAuthSupported=function(){return !0},t.patchPayload=function(e,t){return function(e,t){var n=t.users,r={};n&&n.length>0&&(r.remove=[],n.forEach((function(e){r.remove.push({id:e});})));return r}(0,t)},t.patchURL=function(e,t){var n=e.config;return "/v1/objects/".concat(n.subscribeKey,"/spaces/").concat(o.default.encodeString(t.spaceId),"/users")},t.prepareParams=function(e,t){var n=t.include,r=t.limit,i=t.page,o={};r&&(o.limit=r);if(n){var a=[];n.totalCount&&(o.count=!0),n.customFields&&a.push("custom"),n.spaceFields&&a.push("space"),n.customSpaceFields&&a.push("space.custom");var u=a.join(",");u.length>0&&(o.include=u);}i&&(i.next&&(o.start=i.next),i.prev&&(o.end=i.prev));return o},t.usePatch=function(){return !0},t.validateParams=function(e,t){var n=t.spaceId,r=t.users;if(!n)return "Missing spaceId";if(!r)return "Missing users"};n(2);var i=r(n(1)),o=r(n(3));},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=function(){return i.default.PNGetMembershipsOperation},t.getRequestTimeout=function(e){return e.config.getTransactionTimeout()},t.getURL=function(e,t){var n=e.config;return "/v1/objects/".concat(n.subscribeKey,"/users/").concat(o.default.encodeString(t.userId),"/spaces")},t.handleResponse=function(e,t){return t},t.isAuthSupported=function(){return !0},t.prepareParams=function(e,t){var n=t.include,r=t.limit,i=t.page,o=t.filter,a={};r&&(a.limit=r);if(n){var u=[];n.totalCount&&(a.count=!0),n.customFields&&u.push("custom"),n.spaceFields&&u.push("space"),n.customSpaceFields&&u.push("space.custom");var s=u.join(",");s.length>0&&(a.include=s);}i&&(i.next&&(a.start=i.next),i.prev&&(a.end=i.prev));o&&(a.filter=o);return a},t.validateParams=function(e,t){if(!t.userId)return "Missing userId"};n(2);var i=r(n(1)),o=r(n(3));},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=function(){return i.default.PNUpdateMembershipsOperation},t.getRequestTimeout=function(e){return e.config.getTransactionTimeout()},t.getURL=function(e,t){var n=e.config;return "/v1/objects/".concat(n.subscribeKey,"/users/").concat(o.default.encodeString(t.userId),"/spaces")},t.handleResponse=function(e,t){return t},t.isAuthSupported=function(){return !0},t.patchPayload=function(e,t){return function(e,t){var n=t.addMemberships,r=t.updateMemberships,i=t.removeMemberships,o=t.spaces,a={};n&&n.length>0&&(a.add=[],n.forEach((function(e){var t={id:e.id};e.custom&&(t.custom=e.custom),a.add.push(t);})));r&&r.length>0&&(a.update=[],r.forEach((function(e){var t={id:e.id};e.custom&&(t.custom=e.custom),a.update.push(t);})));o&&o.length>0&&(a.update=a.update||[],o.forEach((function(e){var t={id:e.id};e.custom&&(t.custom=e.custom),a.update.push(t);})));i&&i.length>0&&(a.remove=[],i.forEach((function(e){a.remove.push({id:e});})));return a}(0,t)},t.patchURL=function(e,t){var n=e.config;return "/v1/objects/".concat(n.subscribeKey,"/users/").concat(o.default.encodeString(t.userId),"/spaces")},t.prepareParams=function(e,t){var n=t.include,r=t.limit,i=t.page,o={};r&&(o.limit=r);if(n){var a=[];n.totalCount&&(o.count=!0),n.customFields&&a.push("custom"),n.spaceFields&&a.push("space"),n.customSpaceFields&&a.push("space.custom");var u=a.join(",");u.length>0&&(o.include=u);}i&&(i.next&&(o.start=i.next),i.prev&&(o.end=i.prev));return o},t.usePatch=function(){return !0},t.validateParams=function(e,t){var n=t.userId,r=t.spaces;if(!n)return "Missing userId";if(!r)return "Missing spaces"};n(2);var i=r(n(1)),o=r(n(3));},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=function(){return i.default.PNUpdateMembershipsOperation},t.getRequestTimeout=function(e){return e.config.getTransactionTimeout()},t.getURL=function(e,t){var n=e.config;return "/v1/objects/".concat(n.subscribeKey,"/users/").concat(o.default.encodeString(t.userId),"/spaces")},t.handleResponse=function(e,t){return t},t.isAuthSupported=function(){return !0},t.patchPayload=function(e,t){return function(e,t){var n=t.spaces,r={};n&&n.length>0&&(r.add=[],n.forEach((function(e){var t={id:e.id};e.custom&&(t.custom=e.custom),r.add.push(t);})));return r}(0,t)},t.patchURL=function(e,t){var n=e.config;return "/v1/objects/".concat(n.subscribeKey,"/users/").concat(o.default.encodeString(t.userId),"/spaces")},t.prepareParams=function(e,t){var n=t.include,r=t.limit,i=t.page,o={};r&&(o.limit=r);if(n){var a=[];n.totalCount&&(o.count=!0),n.customFields&&a.push("custom"),n.spaceFields&&a.push("space"),n.customSpaceFields&&a.push("space.custom");var u=a.join(",");u.length>0&&(o.include=u);}i&&(i.next&&(o.start=i.next),i.prev&&(o.end=i.prev));return o},t.usePatch=function(){return !0},t.validateParams=function(e,t){var n=t.userId,r=t.spaces;if(!n)return "Missing userId";if(!r)return "Missing spaces"};n(2);var i=r(n(1)),o=r(n(3));},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=function(){return i.default.PNUpdateMembershipsOperation},t.getRequestTimeout=function(e){return e.config.getTransactionTimeout()},t.getURL=function(e,t){var n=e.config;return "/v1/objects/".concat(n.subscribeKey,"/users/").concat(o.default.encodeString(t.userId),"/spaces")},t.handleResponse=function(e,t){return t},t.isAuthSupported=function(){return !0},t.patchPayload=function(e,t){return function(e,t){var n=t.spaces,r={};n&&n.length>0&&(r.remove=[],n.forEach((function(e){r.remove.push({id:e});})));return r}(0,t)},t.patchURL=function(e,t){var n=e.config;return "/v1/objects/".concat(n.subscribeKey,"/users/").concat(o.default.encodeString(t.userId),"/spaces")},t.prepareParams=function(e,t){var n=t.include,r=t.limit,i=t.page,o={};r&&(o.limit=r);if(n){var a=[];n.totalCount&&(o.count=!0),n.customFields&&a.push("custom"),n.spaceFields&&a.push("space"),n.customSpaceFields&&a.push("space.custom");var u=a.join(",");u.length>0&&(o.include=u);}i&&(i.next&&(o.start=i.next),i.prev&&(o.end=i.prev));return o},t.usePatch=function(){return !0},t.validateParams=function(e,t){var n=t.userId,r=t.spaces;if(!n)return "Missing userId";if(!r)return "Missing spaces"};n(2);var i=r(n(1)),o=r(n(3));},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=function(){return i.default.PNAccessManagerAudit},t.getRequestTimeout=function(e){return e.config.getTransactionTimeout()},t.getURL=function(e){var t=e.config;return "/v2/auth/audit/sub-key/".concat(t.subscribeKey)},t.handleResponse=function(e,t){return t.payload},t.isAuthSupported=function(){return !1},t.prepareParams=function(e,t){var n=t.channel,r=t.channelGroup,i=t.authKeys,o=void 0===i?[]:i,a={};n&&(a.channel=n);r&&(a["channel-group"]=r);o.length>0&&(a.auth=o.join(","));return a},t.validateParams=function(e){if(!e.config.subscribeKey)return "Missing Subscribe Key"};n(2);var i=r(n(1));},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=function(){return i.default.PNAccessManagerGrant},t.getRequestTimeout=function(e){return e.config.getTransactionTimeout()},t.getURL=function(e){var t=e.config;return "/v2/auth/grant/sub-key/".concat(t.subscribeKey)},t.handleResponse=function(){return {}},t.isAuthSupported=function(){return !1},t.prepareParams=function(e,t){var n=t.channels,r=void 0===n?[]:n,i=t.channelGroups,o=void 0===i?[]:i,a=t.uuids,u=void 0===a?[]:a,s=t.ttl,c=t.read,l=void 0!==c&&c,f=t.write,d=void 0!==f&&f,p=t.manage,h=void 0!==p&&p,y=t.get,g=void 0!==y&&y,v=t.join,b=void 0!==v&&v,m=t.update,_=void 0!==m&&m,P=t.authKeys,O=void 0===P?[]:P,S=t.delete,w={};w.r=l?"1":"0",w.w=d?"1":"0",w.m=h?"1":"0",w.d=S?"1":"0",w.g=g?"1":"0",w.j=b?"1":"0",w.u=_?"1":"0",r.length>0&&(w.channel=r.join(","));o.length>0&&(w["channel-group"]=o.join(","));O.length>0&&(w.auth=O.join(","));u.length>0&&(w["target-uuid"]=u.join(","));(s||0===s)&&(w.ttl=s);return w},t.validateParams=function(e,t){var n=e.config;if(!n.subscribeKey)return "Missing Subscribe Key";if(!n.publishKey)return "Missing Publish Key";if(!n.secretKey)return "Missing Secret Key";if(null!=t.uuids&&!t.authKeys)return "authKeys are required for grant request on uuids";if(null!=t.uuids&&(null!=t.channels||null!=t.channelGroups))return "Both channel/channelgroup and uuid cannot be used in the same request"};n(2);var i=r(n(1));},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.extractPermissions=o,t.getOperation=function(){return i.default.PNAccessManagerGrantToken},t.getRequestTimeout=function(e){return e.config.getTransactionTimeout()},t.handleResponse=function(e,t){return t.data.token},t.isAuthSupported=function(){return !1},t.postPayload=function(e,t){return function(e,t){var n=t.ttl,r=t.resources,i=t.patterns,a=t.meta,u=t.authorized_uuid,s={ttl:0,permissions:{resources:{channels:{},groups:{},uuids:{},users:{},spaces:{}},patterns:{channels:{},groups:{},uuids:{},users:{},spaces:{}},meta:{}}};if(r){var c=r.uuids,l=r.channels,f=r.groups;c&&Object.keys(c).forEach((function(e){s.permissions.resources.uuids[e]=o(c[e]);})),l&&Object.keys(l).forEach((function(e){s.permissions.resources.channels[e]=o(l[e]);})),f&&Object.keys(f).forEach((function(e){s.permissions.resources.groups[e]=o(f[e]);}));}if(i){var d=i.uuids,p=i.channels,h=i.groups;d&&Object.keys(d).forEach((function(e){s.permissions.patterns.uuids[e]=o(d[e]);})),p&&Object.keys(p).forEach((function(e){s.permissions.patterns.channels[e]=o(p[e]);})),h&&Object.keys(h).forEach((function(e){s.permissions.patterns.groups[e]=o(h[e]);}));}(n||0===n)&&(s.ttl=n);a&&(s.permissions.meta=a);u&&(s.permissions.uuid="".concat(u));return s}(0,t)},t.postURL=function(e){var t=e.config;return "/v3/pam/".concat(t.subscribeKey,"/grant")},t.prepareParams=function(){return {}},t.usePost=function(){return !0},t.validateParams=function(e,t){var n=e.config;if(!n.subscribeKey)return "Missing Subscribe Key";if(!n.publishKey)return "Missing Publish Key";if(!n.secretKey)return "Missing Secret Key";if(!t.resources&&!t.patterns)return "Missing either Resources or Patterns.";if(t.resources&&(!t.resources.uuids||0===Object.keys(t.resources.uuids).length)&&(!t.resources.channels||0===Object.keys(t.resources.channels).length)&&(!t.resources.groups||0===Object.keys(t.resources.groups).length)||t.patterns&&(!t.patterns.uuids||0===Object.keys(t.patterns.uuids).length)&&(!t.patterns.channels||0===Object.keys(t.patterns.channels).length)&&(!t.patterns.groups||0===Object.keys(t.patterns.groups).length))return "Missing values for either Resources or Patterns."};n(2);var i=r(n(1));function o(e){var t=0;return e.join&&(t|=128),e.update&&(t|=64),e.get&&(t|=32),e.delete&&(t|=8),e.manage&&(t|=4),e.write&&(t|=2),e.read&&(t|=1),t}},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var i=r(n(1)),o=r(n(3)),a={getOperation:function(){return i.default.PNAccessManagerRevokeToken},validateParams:function(e,t){return e.config.secretKey?t?void 0:"token can't be empty":"Missing Secret Key"},getURL:function(e,t){var n=e.config;return "/v3/pam/".concat(n.subscribeKey,"/grant/").concat(o.default.encodeString(t))},useDelete:function(){return !0},getRequestTimeout:function(e){return e.config.getTransactionTimeout()},isAuthSupported:function(){return !1},prepareParams:function(e){return {uuid:e.config.getUUID()}},handleResponse:function(e,t){return {status:t.status,data:t.data}}};t.default=a,e.exports=t.default;},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=function(){return o.default.PNPublishOperation},t.getRequestTimeout=function(e){return e.config.getTransactionTimeout()},t.getURL=function(e,t){var n=e.config,r=t.channel,i=t.message,o=u(e,i);return "/publish/".concat(n.publishKey,"/").concat(n.subscribeKey,"/0/").concat(a.default.encodeString(r),"/0/").concat(a.default.encodeString(o))},t.handleResponse=function(e,t){return {timetoken:t[2]}},t.isAuthSupported=function(){return !0},t.postPayload=function(e,t){var n=t.message;return u(e,n)},t.postURL=function(e,t){var n=e.config,r=t.channel;return "/publish/".concat(n.publishKey,"/").concat(n.subscribeKey,"/0/").concat(a.default.encodeString(r),"/0")},t.prepareParams=function(e,t){var n=t.meta,r=t.replicate,o=void 0===r||r,a=t.storeInHistory,u=t.ttl,s={};null!=a&&(s.store=a?"1":"0");u&&(s.ttl=u);!1===o&&(s.norep="true");n&&"object"===(0, i.default)(n)&&(s.meta=JSON.stringify(n));return s},t.usePost=function(e,t){var n=t.sendByPost;return void 0!==n&&n},t.validateParams=function(e,t){var n=e.config,r=t.message;if(!t.channel)return "Missing Channel";if(!r)return "Missing Message";if(!n.subscribeKey)return "Missing Subscribe Key"};var i=r(n(7)),o=(n(2),r(n(1))),a=r(n(3));function u(e,t){var n=e.crypto,r=e.config,i=JSON.stringify(t);return r.cipherKey&&(i=n.encrypt(i),i=JSON.stringify(i)),i}},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=function(){return i.default.PNSignalOperation},t.getRequestTimeout=function(e){return e.config.getTransactionTimeout()},t.getURL=function(e,t){var n=e.config,r=t.channel,i=t.message,a=(u=i,JSON.stringify(u));var u;return "/signal/".concat(n.publishKey,"/").concat(n.subscribeKey,"/0/").concat(o.default.encodeString(r),"/0/").concat(o.default.encodeString(a))},t.handleResponse=function(e,t){return {timetoken:t[2]}},t.isAuthSupported=function(){return !0},t.prepareParams=function(){return {}},t.validateParams=function(e,t){var n=e.config,r=t.message;if(!t.channel)return "Missing Channel";if(!r)return "Missing Message";if(!n.subscribeKey)return "Missing Subscribe Key"};n(2);var i=r(n(1)),o=r(n(3));},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=function(){return i.default.PNHistoryOperation},t.getRequestTimeout=function(e){return e.config.getTransactionTimeout()},t.getURL=function(e,t){var n=t.channel,r=e.config;return "/v2/history/sub-key/".concat(r.subscribeKey,"/channel/").concat(o.default.encodeString(n))},t.handleResponse=function(e,t){var n={messages:[],startTimeToken:t[1],endTimeToken:t[2]};Array.isArray(t[0])&&t[0].forEach((function(t){var r={timetoken:t.timetoken,entry:a(e,t.message)};t.meta&&(r.meta=t.meta),n.messages.push(r);}));return n},t.isAuthSupported=function(){return !0},t.prepareParams=function(e,t){var n=t.start,r=t.end,i=t.reverse,o=t.count,a=void 0===o?100:o,u=t.stringifiedTimeToken,s=void 0!==u&&u,c=t.includeMeta,l=void 0!==c&&c,f={include_token:"true"};f.count=a,n&&(f.start=n);r&&(f.end=r);s&&(f.string_message_token="true");null!=i&&(f.reverse=i.toString());l&&(f.include_meta="true");return f},t.validateParams=function(e,t){var n=t.channel,r=e.config;if(!n)return "Missing channel";if(!r.subscribeKey)return "Missing Subscribe Key"};n(2);var i=r(n(1)),o=r(n(3));function a(e,t){var n=e.config,r=e.crypto;if(!n.cipherKey)return t;try{return r.decrypt(t)}catch(e){return t}}},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=function(){return i.default.PNDeleteMessagesOperation},t.getRequestTimeout=function(e){return e.config.getTransactionTimeout()},t.getURL=function(e,t){var n=t.channel,r=e.config;return "/v3/history/sub-key/".concat(r.subscribeKey,"/channel/").concat(o.default.encodeString(n))},t.handleResponse=function(e,t){return t.payload},t.isAuthSupported=function(){return !0},t.prepareParams=function(e,t){var n=t.start,r=t.end,i={};n&&(i.start=n);r&&(i.end=r);return i},t.useDelete=function(){return !0},t.validateParams=function(e,t){var n=t.channel,r=e.config;if(!n)return "Missing channel";if(!r.subscribeKey)return "Missing Subscribe Key"};n(2);var i=r(n(1)),o=r(n(3));},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=function(){return o.default.PNMessageCounts},t.getRequestTimeout=function(e){return e.config.getTransactionTimeout()},t.getURL=function(e,t){var n=t.channels,r=e.config,i=n.join(",");return "/v3/history/sub-key/".concat(r.subscribeKey,"/message-counts/").concat(a.default.encodeString(i))},t.handleResponse=function(e,t){return {channels:t.channels}},t.isAuthSupported=function(){return !0},t.prepareParams=function(e,t){var n=t.timetoken,r=t.channelTimetokens,o={};if(r&&1===r.length){var a=(0, i.default)(r,1)[0];o.timetoken=a;}else r?o.channelsTimetoken=r.join(","):n&&(o.timetoken=n);return o},t.validateParams=function(e,t){var n=t.channels,r=t.timetoken,i=t.channelTimetokens,o=e.config;if(!n)return "Missing channel";if(r&&i)return "timetoken and channelTimetokens are incompatible together";if(r&&i&&i.length>1&&n.length!==i.length)return "Length of channelTimetokens and channels do not match";if(!o.subscribeKey)return "Missing Subscribe Key"};var i=r(n(9)),o=r(n(1)),a=r(n(3));},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=function(){return i.default.PNFetchMessagesOperation},t.getRequestTimeout=function(e){return e.config.getTransactionTimeout()},t.getURL=function(e,t){var n=t.channels,r=void 0===n?[]:n,i=t.includeMessageActions,a=void 0!==i&&i,u=e.config,s=a?"history-with-actions":"history",c=r.length>0?r.join(","):",";return "/v3/".concat(s,"/sub-key/").concat(u.subscribeKey,"/channel/").concat(o.default.encodeString(c))},t.handleResponse=function(e,t){var n={channels:{}};Object.keys(t.channels||{}).forEach((function(r){n.channels[r]=[],(t.channels[r]||[]).forEach((function(t){var i={};i.channel=r,i.timetoken=t.timetoken,i.message=function(e,t){var n=e.config,r=e.crypto;if(!n.cipherKey)return t;try{return r.decrypt(t)}catch(e){return t}}(e,t.message),i.messageType=t.message_type,i.uuid=t.uuid,t.actions&&(i.actions=t.actions,i.data=t.actions),t.meta&&(i.meta=t.meta),n.channels[r].push(i);}));})),t.more&&(n.more=t.more);return n},t.isAuthSupported=function(){return !0},t.prepareParams=function(e,t){var n=t.channels,r=t.start,i=t.end,o=t.includeMessageActions,a=t.count,u=t.stringifiedTimeToken,s=void 0!==u&&u,c=t.includeMeta,l=void 0!==c&&c,f=t.includeUuid,d=t.includeUUID,p=void 0===d||d,h=t.includeMessageType,y=void 0===h||h,g={};g.max=a||(n.length>1||!0===o?25:100);r&&(g.start=r);i&&(g.end=i);s&&(g.string_message_token="true");l&&(g.include_meta="true");p&&!1!==f&&(g.include_uuid="true");y&&(g.include_message_type="true");return g},t.validateParams=function(e,t){var n=t.channels,r=t.includeMessageActions,i=void 0!==r&&r,o=e.config;if(!n||0===n.length)return "Missing channels";if(!o.subscribeKey)return "Missing Subscribe Key";if(i&&n.length>1)throw new TypeError("History can return actions data for a single channel only. Either pass a single channel or disable the includeMessageActions flag.")};n(2);var i=r(n(1)),o=r(n(3));},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.getOperation=function(){return i.default.PNSubscribeOperation},t.getRequestTimeout=function(e){return e.config.getSubscribeTimeout()},t.getURL=function(e,t){var n=e.config,r=t.channels,i=void 0===r?[]:r,a=i.length>0?i.join(","):",";return "/v2/subscribe/".concat(n.subscribeKey,"/").concat(o.default.encodeString(a),"/0")},t.handleResponse=function(e,t){var n=[];t.m.forEach((function(e){var t={publishTimetoken:e.p.t,region:e.p.r},r={shard:parseInt(e.a,10),subscriptionMatch:e.b,channel:e.c,messageType:e.e,payload:e.d,flags:e.f,issuingClientId:e.i,subscribeKey:e.k,originationTimetoken:e.o,userMetadata:e.u,publishMetaData:t};n.push(r);}));var r={timetoken:t.t.t,region:t.t.r};return {messages:n,metadata:r}},t.isAuthSupported=function(){return !0},t.prepareParams=function(e,t){var n=e.config,r=t.state,i=t.channelGroups,o=void 0===i?[]:i,a=t.timetoken,u=t.filterExpression,s=t.region,c={heartbeat:n.getPresenceTimeout()};o.length>0&&(c["channel-group"]=o.join(","));u&&u.length>0&&(c["filter-expr"]=u);Object.keys(r).length&&(c.state=JSON.stringify(r));a&&(c.tt=a);s&&(c.tr=s);return c},t.validateParams=function(e){if(!e.config.subscribeKey)return "Missing Subscribe Key"};n(2);var i=r(n(1)),o=r(n(3));},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var i=r(n(1)),o=r(n(3)),a={getOperation:function(){return i.default.PNHandshakeOperation},validateParams:function(e,t){if(!(null!=t&&t.channels||null!=t&&t.channelGroups))return "channels and channleGroups both should not be empty"},getURL:function(e,t){var n=e.config,r=t.channels?t.channels.join(","):",";return "/v2/subscribe/".concat(n.subscribeKey,"/").concat(o.default.encodeString(r),"/0")},getRequestTimeout:function(e){return e.config.getSubscribeTimeout()},isAuthSupported:function(){return !0},prepareParams:function(e,t){var n={};return t.channelGroups&&(n["channel-group"]=t.channelGroups.join(",")),n.tt=0,n},handleResponse:function(e,t){return {region:t.t.r,timetoken:t.t.t}}};t.default=a,e.exports=t.default;},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var i=r(n(1)),o=r(n(3)),a={getOperation:function(){return i.default.PNReceiveMessagesOperation},validateParams:function(e,t){return null!=t&&t.channels||null!=t&&t.channelGroups?null!=t&&t.timetoken?null!=t&&t.region?void 0:"region can not be empty":"timetoken can not be empty":"channels and channleGroups both should not be empty"},getURL:function(e,t){var n=e.config,r=t.channels?t.channels.join(","):",";return "/v2/subscribe/".concat(n.subscribeKey,"/").concat(o.default.encodeString(r),"/0")},getRequestTimeout:function(e){return e.config.getSubscribeTimeout()},isAuthSupported:function(){return !0},getAbortSignal:function(e,t){return t.abortSignal},prepareParams:function(e,t){var n={};return t.channelGroups&&(n["channel-group"]=t.channelGroups.join(",")),n.tt=t.timetoken,n.tr=t.region,n},handleResponse:function(e,t){var n=[];return t.m.forEach((function(e){var t={shard:parseInt(e.a,10),subscriptionMatch:e.b,channel:e.c,messageType:e.e,payload:e.d,flags:e.f,issuingClientId:e.i,subscribeKey:e.k,originationTimetoken:e.o,publishMetaData:{timetoken:e.p.t,region:e.p.r}};n.push(t);})),{messages:n,metadata:{region:t.t.r,timetoken:t.t.t}}}};t.default=a,e.exports=t.default;},function(e,t,n){},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var i=r(n(5)),o=r(n(6)),a=r(n(4)),u=(r(n(8)),r(n(10))),s=(n(2),function(){function e(t){var n=this;(0, i.default)(this,e),(0, a.default)(this,"_modules",void 0),(0, a.default)(this,"_config",void 0),(0, a.default)(this,"_currentSubDomain",void 0),(0, a.default)(this,"_standardOrigin",void 0),(0, a.default)(this,"_subscribeOrigin",void 0),(0, a.default)(this,"_requestTimeout",void 0),(0, a.default)(this,"_coreParams",void 0),this._modules={},Object.keys(t).forEach((function(e){n._modules[e]=t[e].bind(n);}));}return (0, o.default)(e,[{key:"init",value:function(e){this._config=e,Array.isArray(this._config.origin)?this._currentSubDomain=Math.floor(Math.random()*this._config.origin.length):this._currentSubDomain=0,this._coreParams={},this.shiftStandardOrigin();}},{key:"nextOrigin",value:function(){var e=this._config.secure?"https://":"http://";if("string"==typeof this._config.origin)return "".concat(e).concat(this._config.origin);this._currentSubDomain+=1,this._currentSubDomain>=this._config.origin.length&&(this._currentSubDomain=0);var t=this._config.origin[this._currentSubDomain];return "".concat(e).concat(t)}},{key:"hasModule",value:function(e){return e in this._modules}},{key:"shiftStandardOrigin",value:function(){return this._standardOrigin=this.nextOrigin(),this._standardOrigin}},{key:"getStandardOrigin",value:function(){return this._standardOrigin}},{key:"POSTFILE",value:function(e,t,n){return this._modules.postfile(e,t,n)}},{key:"GETFILE",value:function(e,t,n){return this._modules.getfile(e,t,n)}},{key:"POST",value:function(e,t,n,r){return this._modules.post(e,t,n,r)}},{key:"PATCH",value:function(e,t,n,r){return this._modules.patch(e,t,n,r)}},{key:"GET",value:function(e,t,n){return this._modules.get(e,t,n)}},{key:"DELETE",value:function(e,t,n){return this._modules.del(e,t,n)}},{key:"_detectErrorCategory",value:function(e){if("ENOTFOUND"===e.code)return u.default.PNNetworkIssuesCategory;if("ECONNREFUSED"===e.code)return u.default.PNNetworkIssuesCategory;if("ECONNRESET"===e.code)return u.default.PNNetworkIssuesCategory;if("EAI_AGAIN"===e.code)return u.default.PNNetworkIssuesCategory;if(0===e.status||e.hasOwnProperty("status")&&void 0===e.status)return u.default.PNNetworkIssuesCategory;if(e.timeout)return u.default.PNTimeoutCategory;if("ETIMEDOUT"===e.code)return u.default.PNNetworkIssuesCategory;if(e.response){if(e.response.badRequest)return u.default.PNBadRequestCategory;if(e.response.forbidden)return u.default.PNAccessDeniedCategory}return u.default.PNUnknownCategory}}]),e}());t.default=s,e.exports=t.default;},function(e,t,n){Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var r={get:function(e){try{return localStorage.getItem(e)}catch(e){return null}},set:function(e,t){try{return localStorage.setItem(e,t)}catch(e){return null}}};t.default=r,e.exports=t.default;},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var i=r(n(7)),o=r(n(5)),a=r(n(6)),u=r(n(4)),s=function(){function e(t,n){(0, o.default)(this,e),(0, u.default)(this,"_base64ToBinary",void 0),(0, u.default)(this,"_cborReader",void 0),this._base64ToBinary=n,this._decode=t;}return (0, a.default)(e,[{key:"decodeToken",value:function(e){var t="";e.length%4==3?t="=":e.length%4==2&&(t="==");var n=e.replace(/-/gi,"+").replace(/_/gi,"/")+t,r=this._decode(this._base64ToBinary(n));if("object"===(0, i.default)(r))return r}}]),e}();t.default=s,e.exports=t.default;},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.del=function(e,t,n){var r=a.default.delete(this.getStandardOrigin()+t.url).set(t.headers).query(e);return s.call(this,r,t,n)},t.get=function(e,t,n){var r=a.default.get(this.getStandardOrigin()+t.url).set(t.headers).query(e);return s.call(this,r,t,n)},t.getfile=function(e,t,n){var r=a.default.get(this.getStandardOrigin()+t.url).set(t.headers).query(e);return s.call(this,r,t,n)},t.patch=function(e,t,n,r){var i=a.default.patch(this.getStandardOrigin()+n.url).query(e).set(n.headers).send(t);return s.call(this,i,n,r)},t.post=function(e,t,n,r){var i=a.default.post(this.getStandardOrigin()+n.url).query(e).set(n.headers).send(t);return s.call(this,i,n,r)},t.postfile=function(e,t,n){return c.apply(this,arguments)};var i=r(n(11)),o=r(n(12)),a=r(n(132));n(2);function u(e){var t=(new Date).getTime(),n=(new Date).toISOString(),r=console&&console.log?console:window&&window.console&&window.console.log?window.console:console;r.log("<<<<<"),r.log("[".concat(n,"]"),"\n",e.url,"\n",e.qs),r.log("-----"),e.on("response",(function(n){var i=(new Date).getTime()-t,o=(new Date).toISOString();r.log(">>>>>>"),r.log("[".concat(o," / ").concat(i,"]"),"\n",e.url,"\n",e.qs,"\n",n.text),r.log("-----");}));}function s(e,t,n){var r=this;this._config.logVerbosity&&(e=e.use(u)),this._config.proxy&&this._modules.proxy&&(e=this._modules.proxy.call(this,e)),this._config.keepAlive&&this._modules.keepAlive&&(e=this._modules.keepAlive(e));var i=e;return t.abortSignal&&t.abortSignal.on("abort",(function(){i.abort();})),!0===t.forceBuffered?i="undefined"==typeof Blob?i.buffer().responseType("arraybuffer"):i.responseType("arraybuffer"):!1===t.forceBuffered&&(i=i.buffer(!1)),(i=i.timeout(t.timeout)).end((function(e,i){var o,a={};if(a.error=null!==e,a.operation=t.operation,i&&i.status&&(a.statusCode=i.status),e){if(e.response&&e.response.text&&!r._config.logVerbosity)try{a.errorData=JSON.parse(e.response.text);}catch(t){a.errorData=e;}else a.errorData=e;return a.category=r._detectErrorCategory(e),n(a,null)}if(t.ignoreBody)o={headers:i.headers,redirects:i.redirects,response:i};else try{o=JSON.parse(i.text);}catch(e){return a.errorData=i,a.error=!0,n(a,null)}return o.error&&1===o.error&&o.status&&o.message&&o.service?(a.errorData=o,a.statusCode=o.status,a.error=!0,a.category=r._detectErrorCategory(a),n(a,null)):(o.error&&o.error.message&&(a.errorData=o.error),n(a,o))})),i}function c(){return (c=(0, o.default)(i.default.mark((function e(t,n,r){var o,u;return i.default.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return o=a.default.post(t),n.forEach((function(e){var t=e.key,n=e.value;o=o.field(t,n);})),o.attach("file",r,{contentType:"application/octet-stream"}),e.next=5,o;case 5:return u=e.sent,e.abrupt("return",u);case 7:case"end":return e.stop()}}),e)})))).apply(this,arguments)}},function(e,t,n){function r(e){return (r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}var i;"undefined"!=typeof window?i=window:"undefined"==typeof self?(console.warn("Using browser-only version of superagent in non-browser environment"),i=void 0):i=self;var o=n(133),a=n(134),u=n(135),s=n(147),c=n(30),l=n(148),f=n(150);function d(){}e.exports=function(e,n){return "function"==typeof n?new t.Request("GET",e).end(n):1===arguments.length?new t.Request("GET",e):new t.Request(e,n)};var p=t=e.exports;t.Request=_,p.getXHR=function(){if(i.XMLHttpRequest&&(!i.location||"file:"!==i.location.protocol||!i.ActiveXObject))return new XMLHttpRequest;try{return new ActiveXObject("Microsoft.XMLHTTP")}catch(e){}try{return new ActiveXObject("Msxml2.XMLHTTP.6.0")}catch(e){}try{return new ActiveXObject("Msxml2.XMLHTTP.3.0")}catch(e){}try{return new ActiveXObject("Msxml2.XMLHTTP")}catch(e){}throw new Error("Browser-only version of superagent could not find XHR")};var h="".trim?function(e){return e.trim()}:function(e){return e.replace(/(^\s*|\s*$)/g,"")};function y(e){if(!c(e))return e;var t=[];for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&g(t,n,e[n]);return t.join("&")}function g(e,t,n){if(void 0!==n)if(null!==n)if(Array.isArray(n))n.forEach((function(n){g(e,t,n);}));else if(c(n))for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&g(e,"".concat(t,"[").concat(r,"]"),n[r]);else e.push(encodeURI(t)+"="+encodeURIComponent(n));else e.push(encodeURI(t));}function v(e){for(var t,n,r={},i=e.split("&"),o=0,a=i.length;o<a;++o)-1===(n=(t=i[o]).indexOf("="))?r[decodeURIComponent(t)]="":r[decodeURIComponent(t.slice(0,n))]=decodeURIComponent(t.slice(n+1));return r}function b(e){return /[/+]json($|[^-\w])/i.test(e)}function m(e){this.req=e,this.xhr=this.req.xhr,this.text="HEAD"!==this.req.method&&(""===this.xhr.responseType||"text"===this.xhr.responseType)||void 0===this.xhr.responseType?this.xhr.responseText:null,this.statusText=this.req.xhr.statusText;var t=this.xhr.status;1223===t&&(t=204),this._setStatusProperties(t),this.headers=function(e){for(var t,n,r,i,o=e.split(/\r?\n/),a={},u=0,s=o.length;u<s;++u)-1!==(t=(n=o[u]).indexOf(":"))&&(r=n.slice(0,t).toLowerCase(),i=h(n.slice(t+1)),a[r]=i);return a}(this.xhr.getAllResponseHeaders()),this.header=this.headers,this.header["content-type"]=this.xhr.getResponseHeader("content-type"),this._setHeaderProperties(this.header),null===this.text&&e._responseType?this.body=this.xhr.response:this.body="HEAD"===this.req.method?null:this._parseBody(this.text?this.text:this.xhr.response);}function _(e,t){var n=this;this._query=this._query||[],this.method=e,this.url=t,this.header={},this._header={},this.on("end",(function(){var e,t=null,r=null;try{r=new m(n);}catch(e){return (t=new Error("Parser is unable to parse the response")).parse=!0,t.original=e,n.xhr?(t.rawResponse=void 0===n.xhr.responseType?n.xhr.responseText:n.xhr.response,t.status=n.xhr.status?n.xhr.status:null,t.statusCode=t.status):(t.rawResponse=null,t.status=null),n.callback(t)}n.emit("response",r);try{n._isResponseOK(r)||(e=new Error(r.statusText||r.text||"Unsuccessful HTTP response"));}catch(t){e=t;}e?(e.original=t,e.response=r,e.status=r.status,n.callback(e,r)):n.callback(null,r);}));}function P(e,t,n){var r=p("DELETE",e);return "function"==typeof t&&(n=t,t=null),t&&r.send(t),n&&r.end(n),r}p.serializeObject=y,p.parseString=v,p.types={html:"text/html",json:"application/json",xml:"text/xml",urlencoded:"application/x-www-form-urlencoded",form:"application/x-www-form-urlencoded","form-data":"application/x-www-form-urlencoded"},p.serialize={"application/x-www-form-urlencoded":u.stringify,"application/json":a},p.parse={"application/x-www-form-urlencoded":v,"application/json":JSON.parse},l(m.prototype),m.prototype._parseBody=function(e){var t=p.parse[this.type];return this.req._parser?this.req._parser(this,e):(!t&&b(this.type)&&(t=p.parse["application/json"]),t&&e&&(e.length>0||e instanceof Object)?t(e):null)},m.prototype.toError=function(){var e=this.req,t=e.method,n=e.url,r="cannot ".concat(t," ").concat(n," (").concat(this.status,")"),i=new Error(r);return i.status=this.status,i.method=t,i.url=n,i},p.Response=m,o(_.prototype),s(_.prototype),_.prototype.type=function(e){return this.set("Content-Type",p.types[e]||e),this},_.prototype.accept=function(e){return this.set("Accept",p.types[e]||e),this},_.prototype.auth=function(e,t,n){1===arguments.length&&(t=""),"object"===r(t)&&null!==t&&(n=t,t=""),n||(n={type:"function"==typeof btoa?"basic":"auto"});var i=function(e){if("function"==typeof btoa)return btoa(e);throw new Error("Cannot use basic auth, btoa is not a function")};return this._auth(e,t,n,i)},_.prototype.query=function(e){return "string"!=typeof e&&(e=y(e)),e&&this._query.push(e),this},_.prototype.attach=function(e,t,n){if(t){if(this._data)throw new Error("superagent can't mix .send() and .attach()");this._getFormData().append(e,t,n||t.name);}return this},_.prototype._getFormData=function(){return this._formData||(this._formData=new i.FormData),this._formData},_.prototype.callback=function(e,t){if(this._shouldRetry(e,t))return this._retry();var n=this._callback;this.clearTimeout(),e&&(this._maxRetries&&(e.retries=this._retries-1),this.emit("error",e)),n(e,t);},_.prototype.crossDomainError=function(){var e=new Error("Request has been terminated\nPossible causes: the network is offline, Origin is not allowed by Access-Control-Allow-Origin, the page is being unloaded, etc.");e.crossDomain=!0,e.status=this.status,e.method=this.method,e.url=this.url,this.callback(e);},_.prototype.agent=function(){return console.warn("This is not supported in browser version of superagent"),this},_.prototype.ca=_.prototype.agent,_.prototype.buffer=_.prototype.ca,_.prototype.write=function(){throw new Error("Streaming is not supported in browser version of superagent")},_.prototype.pipe=_.prototype.write,_.prototype._isHost=function(e){return e&&"object"===r(e)&&!Array.isArray(e)&&"[object Object]"!==Object.prototype.toString.call(e)},_.prototype.end=function(e){this._endCalled&&console.warn("Warning: .end() was called twice. This is not supported in superagent"),this._endCalled=!0,this._callback=e||d,this._finalizeQueryString(),this._end();},_.prototype._setUploadTimeout=function(){var e=this;this._uploadTimeout&&!this._uploadTimeoutTimer&&(this._uploadTimeoutTimer=setTimeout((function(){e._timeoutError("Upload timeout of ",e._uploadTimeout,"ETIMEDOUT");}),this._uploadTimeout));},_.prototype._end=function(){if(this._aborted)return this.callback(new Error("The request has been aborted even before .end() was called"));var e=this;this.xhr=p.getXHR();var t=this.xhr,n=this._formData||this._data;this._setTimeouts(),t.onreadystatechange=function(){var n=t.readyState;if(n>=2&&e._responseTimeoutTimer&&clearTimeout(e._responseTimeoutTimer),4===n){var r;try{r=t.status;}catch(e){r=0;}if(!r){if(e.timedout||e._aborted)return;return e.crossDomainError()}e.emit("end");}};var r=function(t,n){n.total>0&&(n.percent=n.loaded/n.total*100,100===n.percent&&clearTimeout(e._uploadTimeoutTimer)),n.direction=t,e.emit("progress",n);};if(this.hasListeners("progress"))try{t.addEventListener("progress",r.bind(null,"download")),t.upload&&t.upload.addEventListener("progress",r.bind(null,"upload"));}catch(e){}t.upload&&this._setUploadTimeout();try{this.username&&this.password?t.open(this.method,this.url,!0,this.username,this.password):t.open(this.method,this.url,!0);}catch(e){return this.callback(e)}if(this._withCredentials&&(t.withCredentials=!0),!this._formData&&"GET"!==this.method&&"HEAD"!==this.method&&"string"!=typeof n&&!this._isHost(n)){var i=this._header["content-type"],o=this._serializer||p.serialize[i?i.split(";")[0]:""];!o&&b(i)&&(o=p.serialize["application/json"]),o&&(n=o(n));}for(var a in this.header)null!==this.header[a]&&Object.prototype.hasOwnProperty.call(this.header,a)&&t.setRequestHeader(a,this.header[a]);this._responseType&&(t.responseType=this._responseType),this.emit("request",this),t.send(void 0===n?null:n);},p.agent=function(){return new f},["GET","POST","OPTIONS","PATCH","PUT","DELETE"].forEach((function(e){f.prototype[e.toLowerCase()]=function(t,n){var r=new p.Request(e,t);return this._setDefaults(r),n&&r.end(n),r};})),f.prototype.del=f.prototype.delete,p.get=function(e,t,n){var r=p("GET",e);return "function"==typeof t&&(n=t,t=null),t&&r.query(t),n&&r.end(n),r},p.head=function(e,t,n){var r=p("HEAD",e);return "function"==typeof t&&(n=t,t=null),t&&r.query(t),n&&r.end(n),r},p.options=function(e,t,n){var r=p("OPTIONS",e);return "function"==typeof t&&(n=t,t=null),t&&r.send(t),n&&r.end(n),r},p.del=P,p.delete=P,p.patch=function(e,t,n){var r=p("PATCH",e);return "function"==typeof t&&(n=t,t=null),t&&r.send(t),n&&r.end(n),r},p.post=function(e,t,n){var r=p("POST",e);return "function"==typeof t&&(n=t,t=null),t&&r.send(t),n&&r.end(n),r},p.put=function(e,t,n){var r=p("PUT",e);return "function"==typeof t&&(n=t,t=null),t&&r.send(t),n&&r.end(n),r};},function(e,t,n){function r(e){if(e)return function(e){for(var t in r.prototype)e[t]=r.prototype[t];return e}(e)}e.exports=r,r.prototype.on=r.prototype.addEventListener=function(e,t){return this._callbacks=this._callbacks||{},(this._callbacks["$"+e]=this._callbacks["$"+e]||[]).push(t),this},r.prototype.once=function(e,t){function n(){this.off(e,n),t.apply(this,arguments);}return n.fn=t,this.on(e,n),this},r.prototype.off=r.prototype.removeListener=r.prototype.removeAllListeners=r.prototype.removeEventListener=function(e,t){if(this._callbacks=this._callbacks||{},0==arguments.length)return this._callbacks={},this;var n,r=this._callbacks["$"+e];if(!r)return this;if(1==arguments.length)return delete this._callbacks["$"+e],this;for(var i=0;i<r.length;i++)if((n=r[i])===t||n.fn===t){r.splice(i,1);break}return 0===r.length&&delete this._callbacks["$"+e],this},r.prototype.emit=function(e){this._callbacks=this._callbacks||{};for(var t=new Array(arguments.length-1),n=this._callbacks["$"+e],r=1;r<arguments.length;r++)t[r-1]=arguments[r];if(n){r=0;for(var i=(n=n.slice(0)).length;r<i;++r)n[r].apply(this,t);}return this},r.prototype.listeners=function(e){return this._callbacks=this._callbacks||{},this._callbacks["$"+e]||[]},r.prototype.hasListeners=function(e){return !!this.listeners(e).length};},function(e,t){e.exports=o,o.default=o,o.stable=s,o.stableStringify=s;var n=[],r=[];function i(){return {depthLimit:Number.MAX_SAFE_INTEGER,edgesLimit:Number.MAX_SAFE_INTEGER}}function o(e,t,o,u){var s;void 0===u&&(u=i()),function e(t,n,r,i,o,u,s){var c;if(u+=1,"object"==typeof t&&null!==t){for(c=0;c<i.length;c++)if(i[c]===t)return void a("[Circular]",t,n,o);if(void 0!==s.depthLimit&&u>s.depthLimit)return void a("[...]",t,n,o);if(void 0!==s.edgesLimit&&r+1>s.edgesLimit)return void a("[...]",t,n,o);if(i.push(t),Array.isArray(t))for(c=0;c<t.length;c++)e(t[c],c,c,i,t,u,s);else {var l=Object.keys(t);for(c=0;c<l.length;c++){var f=l[c];e(t[f],f,c,i,t,u,s);}}i.pop();}}(e,"",0,[],void 0,0,u);try{s=0===r.length?JSON.stringify(e,t,o):JSON.stringify(e,c(t),o);}catch(e){return JSON.stringify("[unable to serialize, circular reference is too complex to analyze]")}finally{for(;0!==n.length;){var l=n.pop();4===l.length?Object.defineProperty(l[0],l[1],l[3]):l[0][l[1]]=l[2];}}return s}function a(e,t,i,o){var a=Object.getOwnPropertyDescriptor(o,i);void 0!==a.get?a.configurable?(Object.defineProperty(o,i,{value:e}),n.push([o,i,t,a])):r.push([t,i,e]):(o[i]=e,n.push([o,i,t]));}function u(e,t){return e<t?-1:e>t?1:0}function s(e,t,o,s){void 0===s&&(s=i());var l,f=function e(t,r,i,o,s,c,l){var f;if(c+=1,"object"==typeof t&&null!==t){for(f=0;f<o.length;f++)if(o[f]===t)return void a("[Circular]",t,r,s);try{if("function"==typeof t.toJSON)return}catch(e){return}if(void 0!==l.depthLimit&&c>l.depthLimit)return void a("[...]",t,r,s);if(void 0!==l.edgesLimit&&i+1>l.edgesLimit)return void a("[...]",t,r,s);if(o.push(t),Array.isArray(t))for(f=0;f<t.length;f++)e(t[f],f,f,o,t,c,l);else {var d={},p=Object.keys(t).sort(u);for(f=0;f<p.length;f++){var h=p[f];e(t[h],h,f,o,t,c,l),d[h]=t[h];}if(void 0===s)return d;n.push([s,r,t]),s[r]=d;}o.pop();}}(e,"",0,[],void 0,0,s)||e;try{l=0===r.length?JSON.stringify(f,t,o):JSON.stringify(f,c(t),o);}catch(e){return JSON.stringify("[unable to serialize, circular reference is too complex to analyze]")}finally{for(;0!==n.length;){var d=n.pop();4===d.length?Object.defineProperty(d[0],d[1],d[3]):d[0][d[1]]=d[2];}}return l}function c(e){return e=void 0!==e?e:function(e,t){return t},function(t,n){if(r.length>0)for(var i=0;i<r.length;i++){var o=r[i];if(o[1]===t&&o[0]===n){n=o[2],r.splice(i,1);break}}return e.call(this,t,n)}}},function(e,t,n){var r=n(136),i=n(146),o=n(21);e.exports={formats:o,parse:i,stringify:r};},function(e,t,n){var r=n(137),i=n(29),o=n(21),a=Object.prototype.hasOwnProperty,u={brackets:function(e){return e+"[]"},comma:"comma",indices:function(e,t){return e+"["+t+"]"},repeat:function(e){return e}},s=Array.isArray,c=String.prototype.split,l=Array.prototype.push,f=function(e,t){l.apply(e,s(t)?t:[t]);},d=Date.prototype.toISOString,p=o.default,h={addQueryPrefix:!1,allowDots:!1,charset:"utf-8",charsetSentinel:!1,delimiter:"&",encode:!0,encoder:i.encode,encodeValuesOnly:!1,format:p,formatter:o.formatters[p],indices:!1,serializeDate:function(e){return d.call(e)},skipNulls:!1,strictNullHandling:!1},y={},g=function e(t,n,o,a,u,l,d,p,g,v,b,m,_,P,O){for(var S,w=t,k=O,T=0,x=!1;void 0!==(k=k.get(y))&&!x;){var A=k.get(t);if(T+=1,void 0!==A){if(A===T)throw new RangeError("Cyclic object value");x=!0;}void 0===k.get(y)&&(T=0);}if("function"==typeof d?w=d(n,w):w instanceof Date?w=v(w):"comma"===o&&s(w)&&(w=i.maybeMap(w,(function(e){return e instanceof Date?v(e):e}))),null===w){if(a)return l&&!_?l(n,h.encoder,P,"key",b):n;w="";}if("string"==typeof(S=w)||"number"==typeof S||"boolean"==typeof S||"symbol"==typeof S||"bigint"==typeof S||i.isBuffer(w)){if(l){var M=_?n:l(n,h.encoder,P,"key",b);if("comma"===o&&_){for(var E=c.call(String(w),","),j="",R=0;R<E.length;++R)j+=(0===R?"":",")+m(l(E[R],h.encoder,P,"value",b));return [m(M)+"="+j]}return [m(M)+"="+m(l(w,h.encoder,P,"value",b))]}return [m(n)+"="+m(String(w))]}var N,C=[];if(void 0===w)return C;if("comma"===o&&s(w))N=[{value:w.length>0?w.join(",")||null:void 0}];else if(s(d))N=d;else {var U=Object.keys(w);N=p?U.sort(p):U;}for(var I=0;I<N.length;++I){var D=N[I],F="object"==typeof D&&void 0!==D.value?D.value:w[D];if(!u||null!==F){var L=s(w)?"function"==typeof o?o(n,D):n:n+(g?"."+D:"["+D+"]");O.set(t,T);var K=r();K.set(y,O),f(C,e(F,L,o,a,u,l,d,p,g,v,b,m,_,P,K));}}return C};e.exports=function(e,t){var n,i=e,c=function(e){if(!e)return h;if(null!==e.encoder&&void 0!==e.encoder&&"function"!=typeof e.encoder)throw new TypeError("Encoder has to be a function.");var t=e.charset||h.charset;if(void 0!==e.charset&&"utf-8"!==e.charset&&"iso-8859-1"!==e.charset)throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");var n=o.default;if(void 0!==e.format){if(!a.call(o.formatters,e.format))throw new TypeError("Unknown format option provided.");n=e.format;}var r=o.formatters[n],i=h.filter;return ("function"==typeof e.filter||s(e.filter))&&(i=e.filter),{addQueryPrefix:"boolean"==typeof e.addQueryPrefix?e.addQueryPrefix:h.addQueryPrefix,allowDots:void 0===e.allowDots?h.allowDots:!!e.allowDots,charset:t,charsetSentinel:"boolean"==typeof e.charsetSentinel?e.charsetSentinel:h.charsetSentinel,delimiter:void 0===e.delimiter?h.delimiter:e.delimiter,encode:"boolean"==typeof e.encode?e.encode:h.encode,encoder:"function"==typeof e.encoder?e.encoder:h.encoder,encodeValuesOnly:"boolean"==typeof e.encodeValuesOnly?e.encodeValuesOnly:h.encodeValuesOnly,filter:i,format:n,formatter:r,serializeDate:"function"==typeof e.serializeDate?e.serializeDate:h.serializeDate,skipNulls:"boolean"==typeof e.skipNulls?e.skipNulls:h.skipNulls,sort:"function"==typeof e.sort?e.sort:null,strictNullHandling:"boolean"==typeof e.strictNullHandling?e.strictNullHandling:h.strictNullHandling}}(t);"function"==typeof c.filter?i=(0, c.filter)("",i):s(c.filter)&&(n=c.filter);var l,d=[];if("object"!=typeof i||null===i)return "";l=t&&t.arrayFormat in u?t.arrayFormat:t&&"indices"in t?t.indices?"indices":"repeat":"indices";var p=u[l];n||(n=Object.keys(i)),c.sort&&n.sort(c.sort);for(var y=r(),v=0;v<n.length;++v){var b=n[v];c.skipNulls&&null===i[b]||f(d,g(i[b],b,p,c.strictNullHandling,c.skipNulls,c.encode?c.encoder:null,c.filter,c.sort,c.allowDots,c.serializeDate,c.format,c.formatter,c.encodeValuesOnly,c.charset,y));}var m=d.join(c.delimiter),_=!0===c.addQueryPrefix?"?":"";return c.charsetSentinel&&("iso-8859-1"===c.charset?_+="utf8=%26%2310003%3B&":_+="utf8=%E2%9C%93&"),m.length>0?_+m:""};},function(e,t,n){var r=n(19),i=n(142),o=n(144),a=r("%TypeError%"),u=r("%WeakMap%",!0),s=r("%Map%",!0),c=i("WeakMap.prototype.get",!0),l=i("WeakMap.prototype.set",!0),f=i("WeakMap.prototype.has",!0),d=i("Map.prototype.get",!0),p=i("Map.prototype.set",!0),h=i("Map.prototype.has",!0),y=function(e,t){for(var n,r=e;null!==(n=r.next);r=n)if(n.key===t)return r.next=n.next,n.next=e.next,e.next=n,n};e.exports=function(){var e,t,n,r={assert:function(e){if(!r.has(e))throw new a("Side channel does not contain "+o(e))},get:function(r){if(u&&r&&("object"==typeof r||"function"==typeof r)){if(e)return c(e,r)}else if(s){if(t)return d(t,r)}else if(n)return function(e,t){var n=y(e,t);return n&&n.value}(n,r)},has:function(r){if(u&&r&&("object"==typeof r||"function"==typeof r)){if(e)return f(e,r)}else if(s){if(t)return h(t,r)}else if(n)return function(e,t){return !!y(e,t)}(n,r);return !1},set:function(r,i){u&&r&&("object"==typeof r||"function"==typeof r)?(e||(e=new u),l(e,r,i)):s?(t||(t=new s),p(t,r,i)):(n||(n={key:{},next:null}),function(e,t,n){var r=y(e,t);r?r.value=n:e.next={key:t,next:e.next,value:n};}(n,r,i));}};return r};},function(e,t,n){var r="undefined"!=typeof Symbol&&Symbol,i=n(139);e.exports=function(){return "function"==typeof r&&("function"==typeof Symbol&&("symbol"==typeof r("foo")&&("symbol"==typeof Symbol("bar")&&i())))};},function(e,t,n){e.exports=function(){if("function"!=typeof Symbol||"function"!=typeof Object.getOwnPropertySymbols)return !1;if("symbol"==typeof Symbol.iterator)return !0;var e={},t=Symbol("test"),n=Object(t);if("string"==typeof t)return !1;if("[object Symbol]"!==Object.prototype.toString.call(t))return !1;if("[object Symbol]"!==Object.prototype.toString.call(n))return !1;for(t in e[t]=42,e)return !1;if("function"==typeof Object.keys&&0!==Object.keys(e).length)return !1;if("function"==typeof Object.getOwnPropertyNames&&0!==Object.getOwnPropertyNames(e).length)return !1;var r=Object.getOwnPropertySymbols(e);if(1!==r.length||r[0]!==t)return !1;if(!Object.prototype.propertyIsEnumerable.call(e,t))return !1;if("function"==typeof Object.getOwnPropertyDescriptor){var i=Object.getOwnPropertyDescriptor(e,t);if(42!==i.value||!0!==i.enumerable)return !1}return !0};},function(e,t,n){var r="Function.prototype.bind called on incompatible ",i=Array.prototype.slice,o=Object.prototype.toString;e.exports=function(e){var t=this;if("function"!=typeof t||"[object Function]"!==o.call(t))throw new TypeError(r+t);for(var n,a=i.call(arguments,1),u=function(){if(this instanceof n){var r=t.apply(this,a.concat(i.call(arguments)));return Object(r)===r?r:this}return t.apply(e,a.concat(i.call(arguments)))},s=Math.max(0,t.length-a.length),c=[],l=0;l<s;l++)c.push("$"+l);if(n=Function("binder","return function ("+c.join(",")+"){ return binder.apply(this,arguments); }")(u),t.prototype){var f=function(){};f.prototype=t.prototype,n.prototype=new f,f.prototype=null;}return n};},function(e,t,n){var r=n(20);e.exports=r.call(Function.call,Object.prototype.hasOwnProperty);},function(e,t,n){var r=n(19),i=n(143),o=i(r("String.prototype.indexOf"));e.exports=function(e,t){var n=r(e,!!t);return "function"==typeof n&&o(e,".prototype.")>-1?i(n):n};},function(e,t,n){var r=n(20),i=n(19),o=i("%Function.prototype.apply%"),a=i("%Function.prototype.call%"),u=i("%Reflect.apply%",!0)||r.call(a,o),s=i("%Object.getOwnPropertyDescriptor%",!0),c=i("%Object.defineProperty%",!0),l=i("%Math.max%");if(c)try{c({},"a",{value:1});}catch(e){c=null;}e.exports=function(e){var t=u(r,a,arguments);if(s&&c){var n=s(t,"length");n.configurable&&c(t,"length",{value:1+l(0,e.length-(arguments.length-1))});}return t};var f=function(){return u(r,o,arguments)};c?c(e.exports,"apply",{value:f}):e.exports.apply=f;},function(e,t,n){var r="function"==typeof Map&&Map.prototype,i=Object.getOwnPropertyDescriptor&&r?Object.getOwnPropertyDescriptor(Map.prototype,"size"):null,o=r&&i&&"function"==typeof i.get?i.get:null,a=r&&Map.prototype.forEach,u="function"==typeof Set&&Set.prototype,s=Object.getOwnPropertyDescriptor&&u?Object.getOwnPropertyDescriptor(Set.prototype,"size"):null,c=u&&s&&"function"==typeof s.get?s.get:null,l=u&&Set.prototype.forEach,f="function"==typeof WeakMap&&WeakMap.prototype?WeakMap.prototype.has:null,d="function"==typeof WeakSet&&WeakSet.prototype?WeakSet.prototype.has:null,p="function"==typeof WeakRef&&WeakRef.prototype?WeakRef.prototype.deref:null,h=Boolean.prototype.valueOf,y=Object.prototype.toString,g=Function.prototype.toString,v=String.prototype.match,b="function"==typeof BigInt?BigInt.prototype.valueOf:null,m=Object.getOwnPropertySymbols,_="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?Symbol.prototype.toString:null,P="function"==typeof Symbol&&"object"==typeof Symbol.iterator,O="function"==typeof Symbol&&Symbol.toStringTag&&(typeof Symbol.toStringTag===P||"symbol")?Symbol.toStringTag:null,S=Object.prototype.propertyIsEnumerable,w=("function"==typeof Reflect?Reflect.getPrototypeOf:Object.getPrototypeOf)||([].__proto__===Array.prototype?function(e){return e.__proto__}:null),k=n(145).custom,T=k&&E(k)?k:null;function x(e,t,n){var r="double"===(n.quoteStyle||t)?'"':"'";return r+e+r}function A(e){return String(e).replace(/"/g,"&quot;")}function M(e){return !("[object Array]"!==N(e)||O&&"object"==typeof e&&O in e)}function E(e){if(P)return e&&"object"==typeof e&&e instanceof Symbol;if("symbol"==typeof e)return !0;if(!e||"object"!=typeof e||!_)return !1;try{return _.call(e),!0}catch(e){}return !1}e.exports=function e(t,n,r,i){var u=n||{};if(R(u,"quoteStyle")&&"single"!==u.quoteStyle&&"double"!==u.quoteStyle)throw new TypeError('option "quoteStyle" must be "single" or "double"');if(R(u,"maxStringLength")&&("number"==typeof u.maxStringLength?u.maxStringLength<0&&u.maxStringLength!==1/0:null!==u.maxStringLength))throw new TypeError('option "maxStringLength", if provided, must be a positive integer, Infinity, or `null`');var s=!R(u,"customInspect")||u.customInspect;if("boolean"!=typeof s&&"symbol"!==s)throw new TypeError("option \"customInspect\", if provided, must be `true`, `false`, or `'symbol'`");if(R(u,"indent")&&null!==u.indent&&"\t"!==u.indent&&!(parseInt(u.indent,10)===u.indent&&u.indent>0))throw new TypeError('options "indent" must be "\\t", an integer > 0, or `null`');if(void 0===t)return "undefined";if(null===t)return "null";if("boolean"==typeof t)return t?"true":"false";if("string"==typeof t)return function e(t,n){if(t.length>n.maxStringLength){var r=t.length-n.maxStringLength,i="... "+r+" more character"+(r>1?"s":"");return e(t.slice(0,n.maxStringLength),n)+i}return x(t.replace(/(['\\])/g,"\\$1").replace(/[\x00-\x1f]/g,U),"single",n)}(t,u);if("number"==typeof t)return 0===t?1/0/t>0?"0":"-0":String(t);if("bigint"==typeof t)return String(t)+"n";var y=void 0===u.depth?5:u.depth;if(void 0===r&&(r=0),r>=y&&y>0&&"object"==typeof t)return M(t)?"[Array]":"[Object]";var m=function(e,t){var n;if("\t"===e.indent)n="\t";else {if(!("number"==typeof e.indent&&e.indent>0))return null;n=Array(e.indent+1).join(" ");}return {base:n,prev:Array(t+1).join(n)}}(u,r);if(void 0===i)i=[];else if(C(i,t)>=0)return "[Circular]";function S(t,n,o){if(n&&(i=i.slice()).push(n),o){var a={depth:u.depth};return R(u,"quoteStyle")&&(a.quoteStyle=u.quoteStyle),e(t,a,r+1,i)}return e(t,u,r+1,i)}if("function"==typeof t){var k=function(e){if(e.name)return e.name;var t=v.call(g.call(e),/^function\s*([\w$]+)/);if(t)return t[1];return null}(t),j=K(t,S);return "[Function"+(k?": "+k:" (anonymous)")+"]"+(j.length>0?" { "+j.join(", ")+" }":"")}if(E(t)){var B=P?String(t).replace(/^(Symbol\(.*\))_[^)]*$/,"$1"):_.call(t);return "object"!=typeof t||P?B:I(B)}if(function(e){if(!e||"object"!=typeof e)return !1;if("undefined"!=typeof HTMLElement&&e instanceof HTMLElement)return !0;return "string"==typeof e.nodeName&&"function"==typeof e.getAttribute}(t)){for(var G="<"+String(t.nodeName).toLowerCase(),q=t.attributes||[],H=0;H<q.length;H++)G+=" "+q[H].name+"="+x(A(q[H].value),"double",u);return G+=">",t.childNodes&&t.childNodes.length&&(G+="..."),G+="</"+String(t.nodeName).toLowerCase()+">"}if(M(t)){if(0===t.length)return "[]";var z=K(t,S);return m&&!function(e){for(var t=0;t<e.length;t++)if(C(e[t],"\n")>=0)return !1;return !0}(z)?"["+L(z,m)+"]":"[ "+z.join(", ")+" ]"}if(function(e){return !("[object Error]"!==N(e)||O&&"object"==typeof e&&O in e)}(t)){var W=K(t,S);return 0===W.length?"["+String(t)+"]":"{ ["+String(t)+"] "+W.join(", ")+" }"}if("object"==typeof t&&s){if(T&&"function"==typeof t[T])return t[T]();if("symbol"!==s&&"function"==typeof t.inspect)return t.inspect()}if(function(e){if(!o||!e||"object"!=typeof e)return !1;try{o.call(e);try{c.call(e);}catch(e){return !0}return e instanceof Map}catch(e){}return !1}(t)){var V=[];return a.call(t,(function(e,n){V.push(S(n,t,!0)+" => "+S(e,t));})),F("Map",o.call(t),V,m)}if(function(e){if(!c||!e||"object"!=typeof e)return !1;try{c.call(e);try{o.call(e);}catch(e){return !0}return e instanceof Set}catch(e){}return !1}(t)){var Y=[];return l.call(t,(function(e){Y.push(S(e,t));})),F("Set",c.call(t),Y,m)}if(function(e){if(!f||!e||"object"!=typeof e)return !1;try{f.call(e,f);try{d.call(e,d);}catch(e){return !0}return e instanceof WeakMap}catch(e){}return !1}(t))return D("WeakMap");if(function(e){if(!d||!e||"object"!=typeof e)return !1;try{d.call(e,d);try{f.call(e,f);}catch(e){return !0}return e instanceof WeakSet}catch(e){}return !1}(t))return D("WeakSet");if(function(e){if(!p||!e||"object"!=typeof e)return !1;try{return p.call(e),!0}catch(e){}return !1}(t))return D("WeakRef");if(function(e){return !("[object Number]"!==N(e)||O&&"object"==typeof e&&O in e)}(t))return I(S(Number(t)));if(function(e){if(!e||"object"!=typeof e||!b)return !1;try{return b.call(e),!0}catch(e){}return !1}(t))return I(S(b.call(t)));if(function(e){return !("[object Boolean]"!==N(e)||O&&"object"==typeof e&&O in e)}(t))return I(h.call(t));if(function(e){return !("[object String]"!==N(e)||O&&"object"==typeof e&&O in e)}(t))return I(S(String(t)));if(!function(e){return !("[object Date]"!==N(e)||O&&"object"==typeof e&&O in e)}(t)&&!function(e){return !("[object RegExp]"!==N(e)||O&&"object"==typeof e&&O in e)}(t)){var J=K(t,S),$=w?w(t)===Object.prototype:t instanceof Object||t.constructor===Object,X=t instanceof Object?"":"null prototype",Q=!$&&O&&Object(t)===t&&O in t?N(t).slice(8,-1):X?"Object":"",Z=($||"function"!=typeof t.constructor?"":t.constructor.name?t.constructor.name+" ":"")+(Q||X?"["+[].concat(Q||[],X||[]).join(": ")+"] ":"");return 0===J.length?Z+"{}":m?Z+"{"+L(J,m)+"}":Z+"{ "+J.join(", ")+" }"}return String(t)};var j=Object.prototype.hasOwnProperty||function(e){return e in this};function R(e,t){return j.call(e,t)}function N(e){return y.call(e)}function C(e,t){if(e.indexOf)return e.indexOf(t);for(var n=0,r=e.length;n<r;n++)if(e[n]===t)return n;return -1}function U(e){var t=e.charCodeAt(0),n={8:"b",9:"t",10:"n",12:"f",13:"r"}[t];return n?"\\"+n:"\\x"+(t<16?"0":"")+t.toString(16).toUpperCase()}function I(e){return "Object("+e+")"}function D(e){return e+" { ? }"}function F(e,t,n,r){return e+" ("+t+") {"+(r?L(n,r):n.join(", "))+"}"}function L(e,t){if(0===e.length)return "";var n="\n"+t.prev+t.base;return n+e.join(","+n)+"\n"+t.prev}function K(e,t){var n=M(e),r=[];if(n){r.length=e.length;for(var i=0;i<e.length;i++)r[i]=R(e,i)?t(e[i],e):"";}var o,a="function"==typeof m?m(e):[];if(P){o={};for(var u=0;u<a.length;u++)o["$"+a[u]]=a[u];}for(var s in e)R(e,s)&&(n&&String(Number(s))===s&&s<e.length||P&&o["$"+s]instanceof Symbol||(/[^\w$]/.test(s)?r.push(t(s,e)+": "+t(e[s],e)):r.push(s+": "+t(e[s],e))));if("function"==typeof m)for(var c=0;c<a.length;c++)S.call(e,a[c])&&r.push("["+t(a[c])+"]: "+t(e[a[c]],e));return r}},function(e,t){},function(e,t,n){var r=n(29),i=Object.prototype.hasOwnProperty,o=Array.isArray,a={allowDots:!1,allowPrototypes:!1,allowSparse:!1,arrayLimit:20,charset:"utf-8",charsetSentinel:!1,comma:!1,decoder:r.decode,delimiter:"&",depth:5,ignoreQueryPrefix:!1,interpretNumericEntities:!1,parameterLimit:1e3,parseArrays:!0,plainObjects:!1,strictNullHandling:!1},u=function(e){return e.replace(/&#(\d+);/g,(function(e,t){return String.fromCharCode(parseInt(t,10))}))},s=function(e,t){return e&&"string"==typeof e&&t.comma&&e.indexOf(",")>-1?e.split(","):e},c=function(e,t,n,r){if(e){var o=n.allowDots?e.replace(/\.([^.[]+)/g,"[$1]"):e,a=/(\[[^[\]]*])/g,u=n.depth>0&&/(\[[^[\]]*])/.exec(o),c=u?o.slice(0,u.index):o,l=[];if(c){if(!n.plainObjects&&i.call(Object.prototype,c)&&!n.allowPrototypes)return;l.push(c);}for(var f=0;n.depth>0&&null!==(u=a.exec(o))&&f<n.depth;){if(f+=1,!n.plainObjects&&i.call(Object.prototype,u[1].slice(1,-1))&&!n.allowPrototypes)return;l.push(u[1]);}return u&&l.push("["+o.slice(u.index)+"]"),function(e,t,n,r){for(var i=r?t:s(t,n),o=e.length-1;o>=0;--o){var a,u=e[o];if("[]"===u&&n.parseArrays)a=[].concat(i);else {a=n.plainObjects?Object.create(null):{};var c="["===u.charAt(0)&&"]"===u.charAt(u.length-1)?u.slice(1,-1):u,l=parseInt(c,10);n.parseArrays||""!==c?!isNaN(l)&&u!==c&&String(l)===c&&l>=0&&n.parseArrays&&l<=n.arrayLimit?(a=[])[l]=i:a[c]=i:a={0:i};}i=a;}return i}(l,t,n,r)}};e.exports=function(e,t){var n=function(e){if(!e)return a;if(null!==e.decoder&&void 0!==e.decoder&&"function"!=typeof e.decoder)throw new TypeError("Decoder has to be a function.");if(void 0!==e.charset&&"utf-8"!==e.charset&&"iso-8859-1"!==e.charset)throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");var t=void 0===e.charset?a.charset:e.charset;return {allowDots:void 0===e.allowDots?a.allowDots:!!e.allowDots,allowPrototypes:"boolean"==typeof e.allowPrototypes?e.allowPrototypes:a.allowPrototypes,allowSparse:"boolean"==typeof e.allowSparse?e.allowSparse:a.allowSparse,arrayLimit:"number"==typeof e.arrayLimit?e.arrayLimit:a.arrayLimit,charset:t,charsetSentinel:"boolean"==typeof e.charsetSentinel?e.charsetSentinel:a.charsetSentinel,comma:"boolean"==typeof e.comma?e.comma:a.comma,decoder:"function"==typeof e.decoder?e.decoder:a.decoder,delimiter:"string"==typeof e.delimiter||r.isRegExp(e.delimiter)?e.delimiter:a.delimiter,depth:"number"==typeof e.depth||!1===e.depth?+e.depth:a.depth,ignoreQueryPrefix:!0===e.ignoreQueryPrefix,interpretNumericEntities:"boolean"==typeof e.interpretNumericEntities?e.interpretNumericEntities:a.interpretNumericEntities,parameterLimit:"number"==typeof e.parameterLimit?e.parameterLimit:a.parameterLimit,parseArrays:!1!==e.parseArrays,plainObjects:"boolean"==typeof e.plainObjects?e.plainObjects:a.plainObjects,strictNullHandling:"boolean"==typeof e.strictNullHandling?e.strictNullHandling:a.strictNullHandling}}(t);if(""===e||null==e)return n.plainObjects?Object.create(null):{};for(var l="string"==typeof e?function(e,t){var n,c={},l=t.ignoreQueryPrefix?e.replace(/^\?/,""):e,f=t.parameterLimit===1/0?void 0:t.parameterLimit,d=l.split(t.delimiter,f),p=-1,h=t.charset;if(t.charsetSentinel)for(n=0;n<d.length;++n)0===d[n].indexOf("utf8=")&&("utf8=%E2%9C%93"===d[n]?h="utf-8":"utf8=%26%2310003%3B"===d[n]&&(h="iso-8859-1"),p=n,n=d.length);for(n=0;n<d.length;++n)if(n!==p){var y,g,v=d[n],b=v.indexOf("]="),m=-1===b?v.indexOf("="):b+1;-1===m?(y=t.decoder(v,a.decoder,h,"key"),g=t.strictNullHandling?null:""):(y=t.decoder(v.slice(0,m),a.decoder,h,"key"),g=r.maybeMap(s(v.slice(m+1),t),(function(e){return t.decoder(e,a.decoder,h,"value")}))),g&&t.interpretNumericEntities&&"iso-8859-1"===h&&(g=u(g)),v.indexOf("[]=")>-1&&(g=o(g)?[g]:g),i.call(c,y)?c[y]=r.combine(c[y],g):c[y]=g;}return c}(e,n):e,f=n.plainObjects?Object.create(null):{},d=Object.keys(l),p=0;p<d.length;++p){var h=d[p],y=c(h,l[h],n,"string"==typeof e);f=r.merge(f,y,n);}return !0===n.allowSparse?f:r.compact(f)};},function(e,t,n){function r(e){return (r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}var i=n(30);function o(e){if(e)return function(e){for(var t in o.prototype)Object.prototype.hasOwnProperty.call(o.prototype,t)&&(e[t]=o.prototype[t]);return e}(e)}e.exports=o,o.prototype.clearTimeout=function(){return clearTimeout(this._timer),clearTimeout(this._responseTimeoutTimer),clearTimeout(this._uploadTimeoutTimer),delete this._timer,delete this._responseTimeoutTimer,delete this._uploadTimeoutTimer,this},o.prototype.parse=function(e){return this._parser=e,this},o.prototype.responseType=function(e){return this._responseType=e,this},o.prototype.serialize=function(e){return this._serializer=e,this},o.prototype.timeout=function(e){if(!e||"object"!==r(e))return this._timeout=e,this._responseTimeout=0,this._uploadTimeout=0,this;for(var t in e)if(Object.prototype.hasOwnProperty.call(e,t))switch(t){case"deadline":this._timeout=e.deadline;break;case"response":this._responseTimeout=e.response;break;case"upload":this._uploadTimeout=e.upload;break;default:console.warn("Unknown timeout option",t);}return this},o.prototype.retry=function(e,t){return 0!==arguments.length&&!0!==e||(e=1),e<=0&&(e=0),this._maxRetries=e,this._retries=0,this._retryCallback=t,this};var a=new Set(["ETIMEDOUT","ECONNRESET","EADDRINUSE","ECONNREFUSED","EPIPE","ENOTFOUND","ENETUNREACH","EAI_AGAIN"]),u=new Set([408,413,429,500,502,503,504,521,522,524]);o.prototype._shouldRetry=function(e,t){if(!this._maxRetries||this._retries++>=this._maxRetries)return !1;if(this._retryCallback)try{var n=this._retryCallback(e,t);if(!0===n)return !0;if(!1===n)return !1}catch(e){console.error(e);}if(t&&t.status&&u.has(t.status))return !0;if(e){if(e.code&&a.has(e.code))return !0;if(e.timeout&&"ECONNABORTED"===e.code)return !0;if(e.crossDomain)return !0}return !1},o.prototype._retry=function(){return this.clearTimeout(),this.req&&(this.req=null,this.req=this.request()),this._aborted=!1,this.timedout=!1,this.timedoutError=null,this._end()},o.prototype.then=function(e,t){var n=this;if(!this._fullfilledPromise){var r=this;this._endCalled&&console.warn("Warning: superagent request was sent twice, because both .end() and .then() were called. Never call .end() if you use promises"),this._fullfilledPromise=new Promise((function(e,t){r.on("abort",(function(){if(!(n._maxRetries&&n._maxRetries>n._retries))if(n.timedout&&n.timedoutError)t(n.timedoutError);else {var e=new Error("Aborted");e.code="ABORTED",e.status=n.status,e.method=n.method,e.url=n.url,t(e);}})),r.end((function(n,r){n?t(n):e(r);}));}));}return this._fullfilledPromise.then(e,t)},o.prototype.catch=function(e){return this.then(void 0,e)},o.prototype.use=function(e){return e(this),this},o.prototype.ok=function(e){if("function"!=typeof e)throw new Error("Callback required");return this._okCallback=e,this},o.prototype._isResponseOK=function(e){return !!e&&(this._okCallback?this._okCallback(e):e.status>=200&&e.status<300)},o.prototype.get=function(e){return this._header[e.toLowerCase()]},o.prototype.getHeader=o.prototype.get,o.prototype.set=function(e,t){if(i(e)){for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&this.set(n,e[n]);return this}return this._header[e.toLowerCase()]=t,this.header[e]=t,this},o.prototype.unset=function(e){return delete this._header[e.toLowerCase()],delete this.header[e],this},o.prototype.field=function(e,t){if(null==e)throw new Error(".field(name, val) name can not be empty");if(this._data)throw new Error(".field() can't be used if .send() is used. Please use only .send() or only .field() & .attach()");if(i(e)){for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&this.field(n,e[n]);return this}if(Array.isArray(t)){for(var r in t)Object.prototype.hasOwnProperty.call(t,r)&&this.field(e,t[r]);return this}if(null==t)throw new Error(".field(name, val) val can not be empty");return "boolean"==typeof t&&(t=String(t)),this._getFormData().append(e,t),this},o.prototype.abort=function(){return this._aborted||(this._aborted=!0,this.xhr&&this.xhr.abort(),this.req&&this.req.abort(),this.clearTimeout(),this.emit("abort")),this},o.prototype._auth=function(e,t,n,r){switch(n.type){case"basic":this.set("Authorization","Basic ".concat(r("".concat(e,":").concat(t))));break;case"auto":this.username=e,this.password=t;break;case"bearer":this.set("Authorization","Bearer ".concat(e));}return this},o.prototype.withCredentials=function(e){return void 0===e&&(e=!0),this._withCredentials=e,this},o.prototype.redirects=function(e){return this._maxRedirects=e,this},o.prototype.maxResponseSize=function(e){if("number"!=typeof e)throw new TypeError("Invalid argument");return this._maxResponseSize=e,this},o.prototype.toJSON=function(){return {method:this.method,url:this.url,data:this._data,headers:this._header}},o.prototype.send=function(e){var t=i(e),n=this._header["content-type"];if(this._formData)throw new Error(".send() can't be used if .attach() or .field() is used. Please use only .send() or only .field() & .attach()");if(t&&!this._data)Array.isArray(e)?this._data=[]:this._isHost(e)||(this._data={});else if(e&&this._data&&this._isHost(this._data))throw new Error("Can't merge these send calls");if(t&&i(this._data))for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&(this._data[r]=e[r]);else "string"==typeof e?(n||this.type("form"),(n=this._header["content-type"])&&(n=n.toLowerCase().trim()),this._data="application/x-www-form-urlencoded"===n?this._data?"".concat(this._data,"&").concat(e):e:(this._data||"")+e):this._data=e;return !t||this._isHost(e)||n||this.type("json"),this},o.prototype.sortQuery=function(e){return this._sort=void 0===e||e,this},o.prototype._finalizeQueryString=function(){var e=this._query.join("&");if(e&&(this.url+=(this.url.includes("?")?"&":"?")+e),this._query.length=0,this._sort){var t=this.url.indexOf("?");if(t>=0){var n=this.url.slice(t+1).split("&");"function"==typeof this._sort?n.sort(this._sort):n.sort(),this.url=this.url.slice(0,t)+"?"+n.join("&");}}},o.prototype._appendQueryString=function(){console.warn("Unsupported");},o.prototype._timeoutError=function(e,t,n){if(!this._aborted){var r=new Error("".concat(e+t,"ms exceeded"));r.timeout=t,r.code="ECONNABORTED",r.errno=n,this.timedout=!0,this.timedoutError=r,this.abort(),this.callback(r);}},o.prototype._setTimeouts=function(){var e=this;this._timeout&&!this._timer&&(this._timer=setTimeout((function(){e._timeoutError("Timeout of ",e._timeout,"ETIME");}),this._timeout)),this._responseTimeout&&!this._responseTimeoutTimer&&(this._responseTimeoutTimer=setTimeout((function(){e._timeoutError("Response timeout of ",e._responseTimeout,"ETIMEDOUT");}),this._responseTimeout));};},function(e,t,n){var r=n(149);function i(e){if(e)return function(e){for(var t in i.prototype)Object.prototype.hasOwnProperty.call(i.prototype,t)&&(e[t]=i.prototype[t]);return e}(e)}e.exports=i,i.prototype.get=function(e){return this.header[e.toLowerCase()]},i.prototype._setHeaderProperties=function(e){var t=e["content-type"]||"";this.type=r.type(t);var n=r.params(t);for(var i in n)Object.prototype.hasOwnProperty.call(n,i)&&(this[i]=n[i]);this.links={};try{e.link&&(this.links=r.parseLinks(e.link));}catch(e){}},i.prototype._setStatusProperties=function(e){var t=e/100|0;this.statusCode=e,this.status=this.statusCode,this.statusType=t,this.info=1===t,this.ok=2===t,this.redirect=3===t,this.clientError=4===t,this.serverError=5===t,this.error=(4===t||5===t)&&this.toError(),this.created=201===e,this.accepted=202===e,this.noContent=204===e,this.badRequest=400===e,this.unauthorized=401===e,this.notAcceptable=406===e,this.forbidden=403===e,this.notFound=404===e,this.unprocessableEntity=422===e;};},function(e,t,n){function r(e,t){var n;if("undefined"==typeof Symbol||null==e[Symbol.iterator]){if(Array.isArray(e)||(n=function(e,t){if(!e)return;if("string"==typeof e)return i(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);"Object"===n&&e.constructor&&(n=e.constructor.name);if("Map"===n||"Set"===n)return Array.from(e);if("Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return i(e,t)}(e))||t&&e&&"number"==typeof e.length){n&&(e=n);var r=0,o=function(){};return {s:o,n:function(){return r>=e.length?{done:!0}:{done:!1,value:e[r++]}},e:function(e){throw e},f:o}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var a,u=!0,s=!1;return {s:function(){n=e[Symbol.iterator]();},n:function(){var e=n.next();return u=e.done,e},e:function(e){s=!0,a=e;},f:function(){try{u||null==n.return||n.return();}finally{if(s)throw a}}}}function i(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=new Array(t);n<t;n++)r[n]=e[n];return r}t.type=function(e){return e.split(/ *; */).shift()},t.params=function(e){var t,n={},i=r(e.split(/ *; */));try{for(i.s();!(t=i.n()).done;){var o=t.value.split(/ *= */),a=o.shift(),u=o.shift();a&&u&&(n[a]=u);}}catch(e){i.e(e);}finally{i.f();}return n},t.parseLinks=function(e){var t,n={},i=r(e.split(/ *, */));try{for(i.s();!(t=i.n()).done;){var o=t.value.split(/ *; */),a=o[0].slice(1,-1);n[o[1].split(/ *= */)[1].slice(1,-1)]=a;}}catch(e){i.e(e);}finally{i.f();}return n},t.cleanHeader=function(e,t){return delete e["content-type"],delete e["content-length"],delete e["transfer-encoding"],delete e.host,t&&(delete e.authorization,delete e.cookie),e};},function(e,t,n){function r(e){return function(e){if(Array.isArray(e))return i(e)}(e)||function(e){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(e))return Array.from(e)}(e)||function(e,t){if(!e)return;if("string"==typeof e)return i(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);"Object"===n&&e.constructor&&(n=e.constructor.name);if("Map"===n||"Set"===n)return Array.from(e);if("Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return i(e,t)}(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function i(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=new Array(t);n<t;n++)r[n]=e[n];return r}function o(){this._defaults=[];}["use","on","once","set","query","type","accept","auth","withCredentials","sortQuery","retry","ok","redirects","timeout","buffer","serialize","parse","ca","key","pfx","cert","disableTLSCerts"].forEach((function(e){o.prototype[e]=function(){for(var t=arguments.length,n=new Array(t),r=0;r<t;r++)n[r]=arguments[r];return this._defaults.push({fn:e,args:n}),this};})),o.prototype._setDefaults=function(e){this._defaults.forEach((function(t){e[t.fn].apply(e,r(t.args));}));},e.exports=o;},function(e,t,n){(function(r){var i=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var o=i(n(11)),a=i(n(12)),u=i(n(5)),s=i(n(6)),c=i(n(4));function l(e,t){var n=new Uint8Array(e.byteLength+t.byteLength);return n.set(new Uint8Array(e),0),n.set(new Uint8Array(t),e.byteLength),n.buffer}var f=function(){function e(){(0, u.default)(this,e);}var t,n,i,c,f,d,p,h,y;return (0, s.default)(e,[{key:"algo",get:function(){return "aes-256-cbc"}},{key:"encrypt",value:(y=(0, a.default)(o.default.mark((function e(t,n){var r;return o.default.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,this.getKey(t);case 2:if(r=e.sent,!(n instanceof ArrayBuffer)){e.next=7;break}return e.abrupt("return",this.encryptArrayBuffer(r,n));case 7:if("string"!=typeof n){e.next=11;break}return e.abrupt("return",this.encryptString(r,n));case 11:throw new Error("Cannot encrypt this file. In browsers file encryption supports only string or ArrayBuffer");case 12:case"end":return e.stop()}}),e,this)}))),function(e,t){return y.apply(this,arguments)})},{key:"decrypt",value:(h=(0, a.default)(o.default.mark((function e(t,n){var r;return o.default.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,this.getKey(t);case 2:if(r=e.sent,!(n instanceof ArrayBuffer)){e.next=7;break}return e.abrupt("return",this.decryptArrayBuffer(r,n));case 7:if("string"!=typeof n){e.next=11;break}return e.abrupt("return",this.decryptString(r,n));case 11:throw new Error("Cannot decrypt this file. In browsers file decryption supports only string or ArrayBuffer");case 12:case"end":return e.stop()}}),e,this)}))),function(e,t){return h.apply(this,arguments)})},{key:"encryptFile",value:(p=(0, a.default)(o.default.mark((function e(t,n,r){var i,a,u;return o.default.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,this.getKey(t);case 2:return i=e.sent,e.next=5,n.toArrayBuffer();case 5:return a=e.sent,e.next=8,this.encryptArrayBuffer(i,a);case 8:return u=e.sent,e.abrupt("return",r.create({name:n.name,mimeType:"application/octet-stream",data:u}));case 10:case"end":return e.stop()}}),e,this)}))),function(e,t,n){return p.apply(this,arguments)})},{key:"decryptFile",value:(d=(0, a.default)(o.default.mark((function e(t,n,r){var i,a,u;return o.default.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,this.getKey(t);case 2:return i=e.sent,e.next=5,n.toArrayBuffer();case 5:return a=e.sent,e.next=8,this.decryptArrayBuffer(i,a);case 8:return u=e.sent,e.abrupt("return",r.create({name:n.name,data:u}));case 10:case"end":return e.stop()}}),e,this)}))),function(e,t,n){return d.apply(this,arguments)})},{key:"getKey",value:(f=(0, a.default)(o.default.mark((function e(t){var n,i,a;return o.default.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return n=r.from(t),e.next=3,crypto.subtle.digest("SHA-256",n.buffer);case 3:return i=e.sent,a=r.from(r.from(i).toString("hex").slice(0,32),"utf8").buffer,e.abrupt("return",crypto.subtle.importKey("raw",a,"AES-CBC",!0,["encrypt","decrypt"]));case 6:case"end":return e.stop()}}),e)}))),function(e){return f.apply(this,arguments)})},{key:"encryptArrayBuffer",value:(c=(0, a.default)(o.default.mark((function e(t,n){var r;return o.default.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return r=crypto.getRandomValues(new Uint8Array(16)),e.t0=l,e.t1=r.buffer,e.next=5,crypto.subtle.encrypt({name:"AES-CBC",iv:r},t,n);case 5:return e.t2=e.sent,e.abrupt("return",(0, e.t0)(e.t1,e.t2));case 7:case"end":return e.stop()}}),e)}))),function(e,t){return c.apply(this,arguments)})},{key:"decryptArrayBuffer",value:(i=(0, a.default)(o.default.mark((function e(t,n){var r;return o.default.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return r=n.slice(0,16),e.abrupt("return",crypto.subtle.decrypt({name:"AES-CBC",iv:r},t,n.slice(16)));case 2:case"end":return e.stop()}}),e)}))),function(e,t){return i.apply(this,arguments)})},{key:"encryptString",value:(n=(0, a.default)(o.default.mark((function e(t,n){var i,a,u,s;return o.default.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return i=crypto.getRandomValues(new Uint8Array(16)),a=r.from(n).buffer,e.next=4,crypto.subtle.encrypt({name:"AES-CBC",iv:i},t,a);case 4:return u=e.sent,s=l(i.buffer,u),e.abrupt("return",r.from(s).toString("utf8"));case 7:case"end":return e.stop()}}),e)}))),function(e,t){return n.apply(this,arguments)})},{key:"decryptString",value:(t=(0, a.default)(o.default.mark((function e(t,n){var i,a,u,s;return o.default.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return i=r.from(n),a=i.slice(0,16),u=i.slice(16),e.next=5,crypto.subtle.decrypt({name:"AES-CBC",iv:a},t,u);case 5:return s=e.sent,e.abrupt("return",r.from(s).toString("utf8"));case 7:case"end":return e.stop()}}),e)}))),function(e,n){return t.apply(this,arguments)})}]),e}();t.default=f,(0, c.default)(f,"IV_LENGTH",16),e.exports=t.default;}).call(this,n(24).Buffer);},function(e,t,n){var r=n(0);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var i,o,a=r(n(11)),u=r(n(12)),s=r(n(5)),c=r(n(6)),l=r(n(4)),f=(n(28),o=i=function(){function e(t){if((0, s.default)(this,e),(0, l.default)(this,"data",void 0),(0, l.default)(this,"name",void 0),(0, l.default)(this,"mimeType",void 0),t instanceof File)this.data=t,this.name=this.data.name,this.mimeType=this.data.type;else if(t.data){var n=t.data;this.data=new File([n],t.name,{type:t.mimeType}),this.name=t.name,t.mimeType&&(this.mimeType=t.mimeType);}if(void 0===this.data)throw new Error("Couldn't construct a file out of supplied options.");if(void 0===this.name)throw new Error("Couldn't guess filename out of the options. Please provide one.")}var t,n,r,i,o,f,d;return (0, c.default)(e,[{key:"toBuffer",value:(d=(0, u.default)(a.default.mark((function e(){return a.default.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:throw new Error("This feature is only supported in Node.js environments.");case 1:case"end":return e.stop()}}),e)}))),function(){return d.apply(this,arguments)})},{key:"toStream",value:(f=(0, u.default)(a.default.mark((function e(){return a.default.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:throw new Error("This feature is only supported in Node.js environments.");case 1:case"end":return e.stop()}}),e)}))),function(){return f.apply(this,arguments)})},{key:"toFileUri",value:(o=(0, u.default)(a.default.mark((function e(){return a.default.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:throw new Error("This feature is only supported in react native environments.");case 1:case"end":return e.stop()}}),e)}))),function(){return o.apply(this,arguments)})},{key:"toBlob",value:(i=(0, u.default)(a.default.mark((function e(){return a.default.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",this.data);case 1:case"end":return e.stop()}}),e,this)}))),function(){return i.apply(this,arguments)})},{key:"toArrayBuffer",value:(r=(0, u.default)(a.default.mark((function e(){var t=this;return a.default.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",new Promise((function(e,n){var r=new FileReader;r.addEventListener("load",(function(){if(r.result instanceof ArrayBuffer)return e(r.result)})),r.addEventListener("error",(function(){n(r.error);})),r.readAsArrayBuffer(t.data);})));case 1:case"end":return e.stop()}}),e)}))),function(){return r.apply(this,arguments)})},{key:"toString",value:(n=(0, u.default)(a.default.mark((function e(){var t=this;return a.default.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",new Promise((function(e,n){var r=new FileReader;r.addEventListener("load",(function(){if("string"==typeof r.result)return e(r.result)})),r.addEventListener("error",(function(){n(r.error);})),r.readAsBinaryString(t.data);})));case 1:case"end":return e.stop()}}),e)}))),function(){return n.apply(this,arguments)})},{key:"toFile",value:(t=(0, u.default)(a.default.mark((function e(){return a.default.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",this.data);case 1:case"end":return e.stop()}}),e,this)}))),function(){return t.apply(this,arguments)})}],[{key:"create",value:function(e){return new this(e)}}]),e}(),(0, l.default)(i,"supportsFile","undefined"!=typeof File),(0, l.default)(i,"supportsBlob","undefined"!=typeof Blob),(0, l.default)(i,"supportsArrayBuffer","undefined"!=typeof ArrayBuffer),(0, l.default)(i,"supportsBuffer",!1),(0, l.default)(i,"supportsStream",!1),(0, l.default)(i,"supportsString",!0),(0, l.default)(i,"supportsEncryptFile",!0),(0, l.default)(i,"supportsFileUri",!1),o);t.default=f,e.exports=t.default;}])}));
    });

    var PubNub = /*@__PURE__*/getDefaultExportFromCjs(pubnub_min);

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
    const file$8 = "node_modules/svelte-qrcode/src/lib/index.svelte";

    function create_fragment$8(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = /*image*/ ctx[2])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", /*value*/ ctx[0]);
    			attr_dev(img, "class", /*className*/ ctx[1]);
    			add_location(img, file$8, 41, 0, 681);
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
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
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

    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
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
    			id: create_fragment$8.name
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

    /* src/components/form/InputSignatureCanvas.svelte generated by Svelte v3.35.0 */

    const { console: console_1$3 } = globals;
    const file$7 = "src/components/form/InputSignatureCanvas.svelte";

    // (181:4) {#if typeof window.Passwordless !== 'undefined' && is_mobile }
    function create_if_block_1$5(ctx) {
    	let i;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "i-fingerprint i-20 left svelte-t48889");
    			add_location(i, file$7, 181, 8, 4702);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);

    			if (!mounted) {
    				dispose = listen_dev(i, "click", stop_propagation(prevent_default(/*faceid*/ ctx[12])), false, true, true);
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
    		id: create_if_block_1$5.name,
    		type: "if",
    		source: "(181:4) {#if typeof window.Passwordless !== 'undefined' && is_mobile }",
    		ctx
    	});

    	return block;
    }

    // (186:4) {:else}
    function create_else_block$4(ctx) {
    	let i;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "i-reset i-20 right svelte-t48889");
    			set_style(i, "opacity", "0.5");
    			add_location(i, file$7, 186, 8, 4934);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(186:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (184:4) {#if marks}
    function create_if_block$6(ctx) {
    	let i;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "i-reset i-20 right svelte-t48889");
    			add_location(i, file$7, 184, 8, 4825);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);

    			if (!mounted) {
    				dispose = listen_dev(i, "click", stop_propagation(prevent_default(/*clearCanvas*/ ctx[4])), false, true, true);
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
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(184:4) {#if marks}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div;
    	let canvas_1;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let span;
    	let mounted;
    	let dispose;
    	let if_block0 = typeof window.Passwordless !== "undefined" && /*is_mobile*/ ctx[0] && create_if_block_1$5(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*marks*/ ctx[2]) return create_if_block$6;
    		return create_else_block$4;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block1 = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			canvas_1 = element("canvas");
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			if_block1.c();
    			t2 = space();
    			t3 = text(/*output*/ ctx[3]);
    			t4 = space();
    			span = element("span");
    			span.textContent = "test register";
    			attr_dev(canvas_1, "class", "svelte-t48889");
    			add_location(canvas_1, file$7, 170, 4, 4297);
    			add_location(span, file$7, 191, 4, 5018);
    			attr_dev(div, "class", "canvas-holder svelte-t48889");
    			add_location(div, file$7, 169, 0, 4265);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, canvas_1);
    			/*canvas_1_binding*/ ctx[15](canvas_1);
    			append_dev(div, t0);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t1);
    			if_block1.m(div, null);
    			append_dev(div, t2);
    			append_dev(div, t3);
    			append_dev(div, t4);
    			append_dev(div, span);

    			if (!mounted) {
    				dispose = [
    					listen_dev(canvas_1, "mousedown", /*engage*/ ctx[6], false, false, false),
    					listen_dev(canvas_1, "mousemove", /*paint*/ ctx[5], false, false, false),
    					listen_dev(canvas_1, "mouseup", /*disengage*/ ctx[7], false, false, false),
    					listen_dev(canvas_1, "contextmenu", /*disengage*/ ctx[7], false, false, false),
    					listen_dev(canvas_1, "touchstart", /*touchengage*/ ctx[8], false, false, false),
    					listen_dev(canvas_1, "touchmove", stop_propagation(prevent_default(/*touchpaint*/ ctx[10])), false, true, true),
    					listen_dev(canvas_1, "touchend", /*touchdisengage*/ ctx[9], { passive: true }, false, false),
    					listen_dev(span, "click", /*click_handler*/ ctx[16], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (typeof window.Passwordless !== "undefined" && /*is_mobile*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$5(ctx);
    					if_block0.c();
    					if_block0.m(div, t1);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div, t2);
    				}
    			}

    			if (dirty & /*output*/ 8) set_data_dev(t3, /*output*/ ctx[3]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*canvas_1_binding*/ ctx[15](null);
    			if (if_block0) if_block0.d();
    			if_block1.d();
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

    const apiKey = "demobackend:public:c203e65b581443778ea4823b3ef0d6af";
    const backendUrl = "https://demo-backend.passwordless.dev";

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("InputSignatureCanvas", slots, []);
    	const dispatch = createEventDispatcher();
    	let canvas;
    	let context;
    	let radius = 1;
    	let dragging = false;
    	let marks = false;
    	let offX = 0;
    	let offY = 0;
    	let { dataurl = false } = $$props;
    	let { is_mobile = false } = $$props;

    	function anounceSig() {
    		canvas.toDataURL();
    	}

    	function getMousePosition(e) {
    		var mouseX = e.offsetX * canvas.width / canvas.clientWidth | 0;
    		var mouseY = e.offsetY * canvas.height / canvas.clientHeight | 0;
    		return { x: mouseX, y: mouseY };
    	}

    	function clearCanvas() {
    		$$invalidate(2, marks = false);
    		$$invalidate(13, dataurl = false);
    		clearFunc(0);
    	}

    	function clearFunc(i) {
    		i += 10;
    		context.clearRect(0, 0, i, canvas.height);

    		if (i <= canvas.width) {
    			setTimeout(
    				() => {
    					clearFunc(i);
    				},
    				5
    			);
    		} else {
    			dispatch("signature", { signature: canvas.toDataURL() });
    		}
    	}

    	function paint(e) {
    		if (dragging) {
    			let pos = getMousePosition(e);
    			context.lineTo(pos.x, pos.y);
    			$$invalidate(14, context.lineWidth = radius * 2, context);
    			context.stroke();
    			context.beginPath();
    			context.arc(pos.x, pos.y, radius, 0, 3.14156 * 2);
    			context.fill();
    			context.beginPath();
    			context.moveTo(pos.x, pos.y);
    		}
    	}

    	

    	function engage(e) {
    		dragging = true;
    		paint(e);
    		$$invalidate(2, marks = true);
    	}

    	

    	function disengage() {
    		dragging = false;
    		context.beginPath();
    		dispatch("signature", { signature: canvas.toDataURL() });
    	} //convert canvas to data and send up to parent

    	

    	function touchengage(e) {
    		dragging = true;
    		$$invalidate(2, marks = true);
    	}

    	

    	function touchdisengage() {
    		dragging = false;
    		context.beginPath();
    		dispatch("signature", { signature: canvas.toDataURL() });
    	} //convert canvas to data and send up to parent

    	

    	function touchpaint(e) {
    		let touch = e.touches[0];

    		paint({
    			clientX: touch.clientX,
    			offsetX: touch.clientX - offX,
    			clientY: touch.clientY,
    			offsetY: touch.clientY - offY
    		});
    	}

    	let output = "";
    	let email = "sample@ecoonline.com"; //should be actual client email

    	async function Register(alias) {
    		const p = new Passwordless.Client({ apiKey });
    		const myToken = await fetch(backendUrl + "/create-token?alias=" + alias).then(r => r.text());
    		await p.register(myToken);
    		$$invalidate(3, output += "Register succeded");
    	}

    	async function Signin(alias) {
    		const p = new Passwordless.Client({ apiKey });
    		const token = await p.signinWithAlias(alias);
    		const user = await fetch(backendUrl + "/verify-signin?token=" + token).then(r => r.json());
    		console.log("User details", user);
    		$$invalidate(3, output += "user");
    		$$invalidate(3, output += JSON.stringify(user));
    		return user;
    	}

    	function faceid() {
    		Signin(email);
    	} // Call Register('unique@email') to register with faceid/touchid/authenticator
    	// Call Signin('unique@email') to signin using faceid/touchid/authenticator

    	onMount(() => {
    		$$invalidate(14, context = canvas.getContext("2d"));
    		$$invalidate(14, context.mozImageSmoothingEnabled = false, context);
    		$$invalidate(14, context.imageSmoothingEnabled = false, context);
    		let rect = canvas.getBoundingClientRect();
    		offX = rect.x;
    		offY = rect.y;
    	});

    	const writable_props = ["dataurl", "is_mobile"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$3.warn(`<InputSignatureCanvas> was created with unknown prop '${key}'`);
    	});

    	function canvas_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			canvas = $$value;
    			$$invalidate(1, canvas);
    		});
    	}

    	const click_handler = () => Register("sample@ecoonline.com");

    	$$self.$$set = $$props => {
    		if ("dataurl" in $$props) $$invalidate(13, dataurl = $$props.dataurl);
    		if ("is_mobile" in $$props) $$invalidate(0, is_mobile = $$props.is_mobile);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		createEventDispatcher,
    		dispatch,
    		canvas,
    		context,
    		radius,
    		dragging,
    		marks,
    		offX,
    		offY,
    		dataurl,
    		is_mobile,
    		anounceSig,
    		getMousePosition,
    		clearCanvas,
    		clearFunc,
    		paint,
    		engage,
    		disengage,
    		touchengage,
    		touchdisengage,
    		touchpaint,
    		apiKey,
    		backendUrl,
    		output,
    		email,
    		Register,
    		Signin,
    		faceid
    	});

    	$$self.$inject_state = $$props => {
    		if ("canvas" in $$props) $$invalidate(1, canvas = $$props.canvas);
    		if ("context" in $$props) $$invalidate(14, context = $$props.context);
    		if ("radius" in $$props) radius = $$props.radius;
    		if ("dragging" in $$props) dragging = $$props.dragging;
    		if ("marks" in $$props) $$invalidate(2, marks = $$props.marks);
    		if ("offX" in $$props) offX = $$props.offX;
    		if ("offY" in $$props) offY = $$props.offY;
    		if ("dataurl" in $$props) $$invalidate(13, dataurl = $$props.dataurl);
    		if ("is_mobile" in $$props) $$invalidate(0, is_mobile = $$props.is_mobile);
    		if ("output" in $$props) $$invalidate(3, output = $$props.output);
    		if ("email" in $$props) email = $$props.email;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*dataurl, context, canvas*/ 24578) {
    			{
    				let d = dataurl;

    				if (d) {
    					//clear first
    					context.clearRect(0, 0, canvas.width, canvas.height);

    					//paint from message onto canvas
    					let img = new Image();

    					img.onload = function () {
    						context.drawImage(img, 0, 0);
    						$$invalidate(2, marks = true);
    					};

    					img.src = d;
    					$$invalidate(13, dataurl = false);
    				}
    			}
    		}
    	};

    	return [
    		is_mobile,
    		canvas,
    		marks,
    		output,
    		clearCanvas,
    		paint,
    		engage,
    		disengage,
    		touchengage,
    		touchdisengage,
    		touchpaint,
    		Register,
    		faceid,
    		dataurl,
    		context,
    		canvas_1_binding,
    		click_handler
    	];
    }

    class InputSignatureCanvas extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { dataurl: 13, is_mobile: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InputSignatureCanvas",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get dataurl() {
    		throw new Error("<InputSignatureCanvas>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dataurl(value) {
    		throw new Error("<InputSignatureCanvas>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get is_mobile() {
    		throw new Error("<InputSignatureCanvas>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set is_mobile(value) {
    		throw new Error("<InputSignatureCanvas>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/form/InputSignature.svelte generated by Svelte v3.35.0 */

    const { console: console_1$2 } = globals;
    const file$6 = "src/components/form/InputSignature.svelte";

    // (92:4) {#if f.label}
    function create_if_block_2$3(ctx) {
    	let label;
    	let t0_value = /*f*/ ctx[0].label + "";
    	let t0;
    	let t1;
    	let label_for_value;
    	let if_block = /*f*/ ctx[0].optional && create_if_block_3$2(ctx);

    	const block = {
    		c: function create() {
    			label = element("label");
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block) if_block.c();
    			attr_dev(label, "for", label_for_value = /*f*/ ctx[0].id);
    			add_location(label, file$6, 92, 8, 2295);
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
    					if_block = create_if_block_3$2(ctx);
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
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(92:4) {#if f.label}",
    		ctx
    	});

    	return block;
    }

    // (93:38) {#if f.optional}
    function create_if_block_3$2(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "(Optional)";
    			attr_dev(span, "class", "optional");
    			add_location(span, file$6, 92, 54, 2341);
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
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(93:38) {#if f.optional}",
    		ctx
    	});

    	return block;
    }

    // (95:4) {#if f.hint}
    function create_if_block_1$4(ctx) {
    	let p;
    	let t_value = /*f*/ ctx[0].hint + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			add_location(p, file$6, 95, 8, 2430);
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
    		source: "(95:4) {#if f.hint}",
    		ctx
    	});

    	return block;
    }

    // (103:8) {#if !is_mobile}
    function create_if_block$5(ctx) {
    	let div;
    	let qrcode;
    	let t0;
    	let span0;
    	let t2;
    	let span1;
    	let current;
    	let mounted;
    	let dispose;

    	qrcode = new Lib({
    			props: { value: /*qr_value*/ ctx[2] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(qrcode.$$.fragment);
    			t0 = space();
    			span0 = element("span");
    			span0.textContent = "Web-sign";
    			t2 = space();
    			span1 = element("span");
    			span1.textContent = "Mobile-sign";
    			attr_dev(span0, "class", "svelte-17qqaho");
    			toggle_class(span0, "selected", /*selected_qr*/ ctx[1] == "url");
    			add_location(span0, file$6, 105, 16, 2816);
    			attr_dev(span1, "class", "svelte-17qqaho");
    			toggle_class(span1, "selected", /*selected_qr*/ ctx[1] == "mobile");
    			add_location(span1, file$6, 106, 16, 2937);
    			attr_dev(div, "class", "signature-qr svelte-17qqaho");
    			add_location(div, file$6, 103, 12, 2730);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(qrcode, div, null);
    			append_dev(div, t0);
    			append_dev(div, span0);
    			append_dev(div, t2);
    			append_dev(div, span1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(span0, "click", /*click_handler*/ ctx[7], false, false, false),
    					listen_dev(span1, "click", /*click_handler_1*/ ctx[8], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const qrcode_changes = {};
    			if (dirty & /*qr_value*/ 4) qrcode_changes.value = /*qr_value*/ ctx[2];
    			qrcode.$set(qrcode_changes);

    			if (dirty & /*selected_qr*/ 2) {
    				toggle_class(span0, "selected", /*selected_qr*/ ctx[1] == "url");
    			}

    			if (dirty & /*selected_qr*/ 2) {
    				toggle_class(span1, "selected", /*selected_qr*/ ctx[1] == "mobile");
    			}
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
    			if (detaching) detach_dev(div);
    			destroy_component(qrcode);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(103:8) {#if !is_mobile}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div2;
    	let t0;
    	let t1;
    	let div1;
    	let div0;
    	let sigcanvas;
    	let t2;
    	let current;
    	let if_block0 = /*f*/ ctx[0].label && create_if_block_2$3(ctx);
    	let if_block1 = /*f*/ ctx[0].hint && create_if_block_1$4(ctx);

    	sigcanvas = new InputSignatureCanvas({
    			props: {
    				dataurl: /*dataurl*/ ctx[3],
    				is_mobile: /*is_mobile*/ ctx[4]
    			},
    			$$inline: true
    		});

    	sigcanvas.$on("signature", /*handleSignature*/ ctx[5]);
    	let if_block2 = !/*is_mobile*/ ctx[4] && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			div1 = element("div");
    			div0 = element("div");
    			create_component(sigcanvas.$$.fragment);
    			t2 = space();
    			if (if_block2) if_block2.c();
    			attr_dev(div0, "class", "form-control signature-box svelte-17qqaho");
    			add_location(div0, file$6, 98, 8, 2545);
    			attr_dev(div1, "class", "signature-holder svelte-17qqaho");
    			toggle_class(div1, "is_mobile", /*is_mobile*/ ctx[4]);
    			toggle_class(div1, "mandatory", !/*f*/ ctx[0].optional);
    			add_location(div1, file$6, 97, 4, 2460);
    			attr_dev(div2, "class", "form-item svelte-17qqaho");
    			add_location(div2, file$6, 90, 0, 2245);
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
    			mount_component(sigcanvas, div0, null);
    			append_dev(div1, t2);
    			if (if_block2) if_block2.m(div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*f*/ ctx[0].label) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2$3(ctx);
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
    					if_block1 = create_if_block_1$4(ctx);
    					if_block1.c();
    					if_block1.m(div2, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			const sigcanvas_changes = {};
    			if (dirty & /*dataurl*/ 8) sigcanvas_changes.dataurl = /*dataurl*/ ctx[3];
    			if (dirty & /*is_mobile*/ 16) sigcanvas_changes.is_mobile = /*is_mobile*/ ctx[4];
    			sigcanvas.$set(sigcanvas_changes);

    			if (!/*is_mobile*/ ctx[4]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*is_mobile*/ 16) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block$5(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div1, null);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*is_mobile*/ 16) {
    				toggle_class(div1, "is_mobile", /*is_mobile*/ ctx[4]);
    			}

    			if (dirty & /*f*/ 1) {
    				toggle_class(div1, "mandatory", !/*f*/ ctx[0].optional);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sigcanvas.$$.fragment, local);
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sigcanvas.$$.fragment, local);
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			destroy_component(sigcanvas);
    			if (if_block2) if_block2.d();
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
    	validate_slots("InputSignature", slots, []);
    	let { f } = $$props;
    	let ref = "";
    	let base_url = "https://ecoonline.github.io/ux/public/mobile_signature.html?ref=";
    	let base_mobile = "com.ecoonline.ecomobile://signature?id=";
    	let selected_qr = "url";
    	let qr_value = selected_qr == "url" ? base_url : base_mobile;
    	let dataurl = false;
    	let unique_num = (Math.random() + "").substring(2);
    	let is_mobile = false;
    	let coms_num = unique_num;

    	// pubnub creds
    	let pubnub = new PubNub({
    			publishKey: "pub-c-c7c40d64-0bf9-4f4f-9678-1342b3f5e289",
    			subscribeKey: "sub-c-fbe7422a-ad0f-11ec-b6fc-9aa0759238d3",
    			uuid: unique_num
    		});

    	function handleSignature(event) {
    		console.log("signature received");

    		if (is_mobile) {
    			pubnub.publish({
    				channel: "signature",
    				message: {
    					uuid: coms_num,
    					description: event.detail.signature
    				},
    				function(status, response) {
    					console.log("?", status, response);
    				}
    			});
    		}
    	}

    	onMount(() => {
    		let queryParams = new URLSearchParams(window.location.search);
    		ref = queryParams.get("ref");

    		if (ref) {
    			console.log("is mobile so setting var to true");
    			$$invalidate(4, is_mobile = true);
    			$$invalidate(6, coms_num = ref);
    		} else {
    			$$invalidate(4, is_mobile = false);
    		}

    		pubnub.addListener({
    			message(m) {
    				console.log("message received");

    				if (m.message.uuid == coms_num) {
    					console.log("SIGNATURE FROM LEGIT COMMS");
    					$$invalidate(3, dataurl = m.message.description);
    				}
    			}
    		});

    		if (!is_mobile) {
    			pubnub.subscribe({ channels: ["signature"] });
    		}
    	});

    	const writable_props = ["f"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<InputSignature> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		$$invalidate(1, selected_qr = "url");
    	};

    	const click_handler_1 = () => {
    		$$invalidate(1, selected_qr = "mobile");
    	};

    	$$self.$$set = $$props => {
    		if ("f" in $$props) $$invalidate(0, f = $$props.f);
    	};

    	$$self.$capture_state = () => ({
    		PubNub,
    		onMount,
    		QrCode: Lib,
    		SigCanvas: InputSignatureCanvas,
    		f,
    		ref,
    		base_url,
    		base_mobile,
    		selected_qr,
    		qr_value,
    		dataurl,
    		unique_num,
    		is_mobile,
    		coms_num,
    		pubnub,
    		handleSignature
    	});

    	$$self.$inject_state = $$props => {
    		if ("f" in $$props) $$invalidate(0, f = $$props.f);
    		if ("ref" in $$props) ref = $$props.ref;
    		if ("base_url" in $$props) $$invalidate(10, base_url = $$props.base_url);
    		if ("base_mobile" in $$props) $$invalidate(11, base_mobile = $$props.base_mobile);
    		if ("selected_qr" in $$props) $$invalidate(1, selected_qr = $$props.selected_qr);
    		if ("qr_value" in $$props) $$invalidate(2, qr_value = $$props.qr_value);
    		if ("dataurl" in $$props) $$invalidate(3, dataurl = $$props.dataurl);
    		if ("unique_num" in $$props) unique_num = $$props.unique_num;
    		if ("is_mobile" in $$props) $$invalidate(4, is_mobile = $$props.is_mobile);
    		if ("coms_num" in $$props) $$invalidate(6, coms_num = $$props.coms_num);
    		if ("pubnub" in $$props) pubnub = $$props.pubnub;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*coms_num, selected_qr*/ 66) {
    			{
    				let c = coms_num;
    				let s = selected_qr;
    				$$invalidate(2, qr_value = (s == "url" ? base_url : base_mobile) + c);
    			}
    		}
    	};

    	return [
    		f,
    		selected_qr,
    		qr_value,
    		dataurl,
    		is_mobile,
    		handleSignature,
    		coms_num,
    		click_handler,
    		click_handler_1
    	];
    }

    class InputSignature extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { f: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InputSignature",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*f*/ ctx[0] === undefined && !("f" in props)) {
    			console_1$2.warn("<InputSignature> was created without expected prop 'f'");
    		}
    	}

    	get f() {
    		throw new Error("<InputSignature>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set f(value) {
    		throw new Error("<InputSignature>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/form/InputSwitch.svelte generated by Svelte v3.35.0 */

    const file$5 = "src/components/form/InputSwitch.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[6] = list;
    	child_ctx[7] = i;
    	return child_ctx;
    }

    // (13:4) {#if f.label}
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
    			add_location(label, file$5, 13, 8, 298);
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
    		source: "(13:4) {#if f.label}",
    		ctx
    	});

    	return block;
    }

    // (16:4) {#if f.hint}
    function create_if_block$4(ctx) {
    	let p;
    	let t_value = /*f*/ ctx[0].hint + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			attr_dev(p, "class", "svelte-12hkhrz");
    			add_location(p, file$5, 16, 8, 371);
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
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(16:4) {#if f.hint}",
    		ctx
    	});

    	return block;
    }

    // (19:4) {#each f.options as option}
    function create_each_block$2(ctx) {
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
    			add_location(input, file$5, 21, 20, 527);
    			attr_dev(span0, "class", "slider svelte-12hkhrz");
    			add_location(span0, file$5, 22, 20, 599);
    			attr_dev(label, "class", "switch svelte-12hkhrz");
    			add_location(label, file$5, 20, 16, 484);
    			add_location(span1, file$5, 24, 16, 669);
    			attr_dev(div, "class", "switch-holder svelte-12hkhrz");
    			add_location(div, file$5, 19, 11, 440);
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
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(19:4) {#each f.options as option}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let if_block0 = /*f*/ ctx[0].label && create_if_block_1$3(ctx);
    	let if_block1 = /*f*/ ctx[0].hint && create_if_block$4(ctx);
    	let each_value = /*f*/ ctx[0].options;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
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
    			add_location(div, file$5, 11, 0, 226);
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
    					if_block1 = create_if_block$4(ctx);
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
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
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
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { f: 0, channel: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InputSwitch",
    			options,
    			id: create_fragment$5.name
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

    /* src/components/form/Section.svelte generated by Svelte v3.35.0 */
    const file$4 = "src/components/form/Section.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (32:4) {#if f.label}
    function create_if_block_2$2(ctx) {
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
    			add_location(h3, file$4, 33, 12, 919);
    			attr_dev(div, "class", "card-header");
    			add_location(div, file$4, 32, 8, 881);
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
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(32:4) {#if f.label}",
    		ctx
    	});

    	return block;
    }

    // (39:8) {#if f.children}
    function create_if_block$3(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*f*/ ctx[1].children;
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
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(39:8) {#if f.children}",
    		ctx
    	});

    	return block;
    }

    // (44:16) {:else}
    function create_else_block$3(ctx) {
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
    			add_location(b, file$4, 44, 60, 1270);
    			add_location(div, file$4, 44, 20, 1230);
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
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(44:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (42:16) {#if components[f.item_type]}
    function create_if_block_1$2(ctx) {
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
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(42:16) {#if components[f.item_type]}",
    		ctx
    	});

    	return block;
    }

    // (41:12) {#each f.children as f}
    function create_each_block$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$2, create_else_block$3];
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
    		source: "(41:12) {#each f.children as f}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div1;
    	let t;
    	let div0;
    	let current;
    	let if_block0 = /*f*/ ctx[1].label && create_if_block_2$2(ctx);
    	let if_block1 = /*f*/ ctx[1].children && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			if (if_block0) if_block0.c();
    			t = space();
    			div0 = element("div");
    			if (if_block1) if_block1.c();
    			attr_dev(div0, "class", "card-body");
    			add_location(div0, file$4, 37, 4, 968);
    			attr_dev(div1, "class", "card svelte-1q9p9bd");
    			add_location(div1, file$4, 30, 0, 836);
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
    					if_block0 = create_if_block_2$2(ctx);
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
    					if_block1 = create_if_block$3(ctx);
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
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Section", slots, []);

    	let components = {
    		"input_checkbox": InputCheckbox,
    		"input_lookup": InputLookup,
    		"input_matrix": InputMatrix,
    		"input_multi": InputMulti,
    		"input_select": InputSelect,
    		"input_signature": InputSignature,
    		"input_switch": InputSwitch,
    		"input_text": InputText,
    		"input_textarea": InputTextarea
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
    		InputCheckbox,
    		InputLookup,
    		InputMatrix,
    		InputMulti,
    		InputSelect,
    		InputText,
    		InputTextarea,
    		InputSignature,
    		InputSwitch,
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
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { f: 1, channel: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Section",
    			options,
    			id: create_fragment$4.name
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

    /* src/components/form/InputPassword.svelte generated by Svelte v3.35.0 */

    const { console: console_1$1 } = globals;
    const file$3 = "src/components/form/InputPassword.svelte";

    // (65:4) {#if f.label && channel}
    function create_if_block_5(ctx) {
    	let label;
    	let t0_value = /*f*/ ctx[0].label + "";
    	let t0;
    	let t1;
    	let label_for_value;
    	let if_block = /*f*/ ctx[0].optional && create_if_block_6(ctx);

    	const block = {
    		c: function create() {
    			label = element("label");
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block) if_block.c();
    			attr_dev(label, "for", label_for_value = /*f*/ ctx[0].id);
    			add_location(label, file$3, 65, 8, 1747);
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
    					if_block = create_if_block_6(ctx);
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
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(65:4) {#if f.label && channel}",
    		ctx
    	});

    	return block;
    }

    // (66:38) {#if f.optional}
    function create_if_block_6(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "(Optional)";
    			attr_dev(span, "class", "optional");
    			add_location(span, file$3, 65, 54, 1793);
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
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(66:38) {#if f.optional}",
    		ctx
    	});

    	return block;
    }

    // (68:4) {#if f.hint}
    function create_if_block_4(ctx) {
    	let p;
    	let t_value = /*f*/ ctx[0].hint + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			add_location(p, file$3, 68, 8, 1882);
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
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(68:4) {#if f.hint}",
    		ctx
    	});

    	return block;
    }

    // (92:8) {#if has_focus}
    function create_if_block_2$1(ctx) {
    	let if_block_anchor;
    	let if_block = /*v_all*/ ctx[12] && create_if_block_3$1(ctx);

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
    			if (/*v_all*/ ctx[12]) {
    				if (if_block) ; else {
    					if_block = create_if_block_3$1(ctx);
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
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(92:8) {#if has_focus}",
    		ctx
    	});

    	return block;
    }

    // (93:12) {#if v_all}
    function create_if_block_3$1(ctx) {
    	let i;
    	let t;

    	const block = {
    		c: function create() {
    			i = element("i");
    			t = text(" Password meets the requirements");
    			attr_dev(i, "class", "i-checkmark-green i-20");
    			add_location(i, file$3, 93, 16, 3483);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(93:12) {#if v_all}",
    		ctx
    	});

    	return block;
    }

    // (97:8) {#if validation_showing}
    function create_if_block$2(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*v_all*/ ctx[12]) return create_if_block_1$1;
    		return create_else_block$2;
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
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
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
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(97:8) {#if validation_showing}",
    		ctx
    	});

    	return block;
    }

    // (100:12) {:else}
    function create_else_block$2(ctx) {
    	let span;
    	let i;
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			i = element("i");
    			t = text(" Password does not meet the requirements");
    			attr_dev(i, "class", "i-error i-20");
    			add_location(i, file$3, 100, 36, 3786);
    			attr_dev(span, "class", "error svelte-y2ggbi");
    			add_location(span, file$3, 100, 16, 3766);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, i);
    			append_dev(span, t);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(100:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (98:12) {#if v_all}
    function create_if_block_1$1(ctx) {
    	let i;
    	let t;

    	const block = {
    		c: function create() {
    			i = element("i");
    			t = text(" Password meets the requirements");
    			attr_dev(i, "class", "i-checkmark-green i-20");
    			add_location(i, file$3, 98, 16, 3659);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(98:12) {#if v_all}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div4;
    	let t0;
    	let t1;
    	let div2;
    	let div0;
    	let input0;
    	let input0_id_value;
    	let input0_placeholder_value;
    	let t2;
    	let i0;
    	let t3;
    	let div1;
    	let input1;
    	let input1_id_value;
    	let input1_placeholder_value;
    	let t4;
    	let i1;
    	let t5;
    	let ul;
    	let li0;
    	let b;
    	let t7;
    	let li1;
    	let i2;
    	let t8;
    	let t9;
    	let li2;
    	let i3;
    	let t10;
    	let t11;
    	let li3;
    	let i4;
    	let t12;
    	let t13;
    	let li4;
    	let i5;
    	let t14;
    	let t15;
    	let li5;
    	let i6;
    	let t16;
    	let t17;
    	let div3;
    	let t18;
    	let mounted;
    	let dispose;
    	let if_block0 = /*f*/ ctx[0].label && /*channel*/ ctx[1] && create_if_block_5(ctx);
    	let if_block1 = /*f*/ ctx[0].hint && create_if_block_4(ctx);
    	let if_block2 = /*has_focus*/ ctx[8] && create_if_block_2$1(ctx);
    	let if_block3 = /*validation_showing*/ ctx[11] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			div2 = element("div");
    			div0 = element("div");
    			input0 = element("input");
    			t2 = space();
    			i0 = element("i");
    			t3 = space();
    			div1 = element("div");
    			input1 = element("input");
    			t4 = space();
    			i1 = element("i");
    			t5 = space();
    			ul = element("ul");
    			li0 = element("li");
    			b = element("b");
    			b.textContent = "Your password must contain at least:";
    			t7 = space();
    			li1 = element("li");
    			i2 = element("i");
    			t8 = text(" 10 characters");
    			t9 = space();
    			li2 = element("li");
    			i3 = element("i");
    			t10 = text(" 1 uppercase letter (A-Z)");
    			t11 = space();
    			li3 = element("li");
    			i4 = element("i");
    			t12 = text(" 1 lowercase letter (a-z)");
    			t13 = space();
    			li4 = element("li");
    			i5 = element("i");
    			t14 = text(" 1 number (0-9)");
    			t15 = space();
    			li5 = element("li");
    			i6 = element("i");
    			t16 = text(" 1 special character (!@#$^&)");
    			t17 = space();
    			div3 = element("div");
    			if (if_block2) if_block2.c();
    			t18 = space();
    			if (if_block3) if_block3.c();
    			attr_dev(input0, "id", input0_id_value = /*f*/ ctx[0].id);
    			attr_dev(input0, "type", "password");
    			attr_dev(input0, "placeholder", input0_placeholder_value = /*f*/ ctx[0].placeholder ? /*f*/ ctx[0].placeholder : "");
    			attr_dev(input0, "class", "form-control");
    			attr_dev(input0, "autocomplete", "off");
    			add_location(input0, file$3, 72, 12, 2029);
    			attr_dev(i0, "class", "i-view i-24 svelte-y2ggbi");
    			add_location(i0, file$3, 73, 12, 2271);
    			set_style(div0, "display", /*input_type*/ ctx[7] == "password" ? "block" : "none");
    			add_location(div0, file$3, 71, 8, 1949);
    			attr_dev(input1, "id", input1_id_value = "" + (/*f*/ ctx[0].id + "_alt"));
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "placeholder", input1_placeholder_value = /*f*/ ctx[0].placeholder ? /*f*/ ctx[0].placeholder : "");
    			attr_dev(input1, "class", "form-control");
    			attr_dev(input1, "autocomplete", "off");
    			add_location(input1, file$3, 76, 8, 2432);
    			attr_dev(i1, "class", "i-view i-24 svelte-y2ggbi");
    			add_location(i1, file$3, 77, 12, 2672);
    			set_style(div1, "display", /*input_type*/ ctx[7] == "text" ? "block" : "none");
    			add_location(div1, file$3, 75, 8, 2360);
    			attr_dev(div2, "class", "password-shell svelte-y2ggbi");
    			add_location(div2, file$3, 70, 4, 1912);
    			attr_dev(b, "class", "svelte-y2ggbi");
    			add_location(b, file$3, 82, 12, 2827);
    			add_location(li0, file$3, 82, 8, 2823);
    			attr_dev(i2, "class", "i-checkmark-green i-16 svelte-y2ggbi");
    			toggle_class(i2, "in", /*v_length*/ ctx[2]);
    			add_location(i2, file$3, 83, 12, 2888);
    			add_location(li1, file$3, 83, 8, 2884);
    			attr_dev(i3, "class", "i-checkmark-green i-16 svelte-y2ggbi");
    			toggle_class(i3, "in", /*v_uppercase*/ ctx[4]);
    			add_location(i3, file$3, 84, 12, 2978);
    			add_location(li2, file$3, 84, 8, 2974);
    			attr_dev(i4, "class", "i-checkmark-green i-16 svelte-y2ggbi");
    			toggle_class(i4, "in", /*v_lowercase*/ ctx[5]);
    			add_location(i4, file$3, 85, 12, 3082);
    			add_location(li3, file$3, 85, 8, 3078);
    			attr_dev(i5, "class", "i-checkmark-green i-16 svelte-y2ggbi");
    			toggle_class(i5, "in", /*v_number*/ ctx[3]);
    			add_location(i5, file$3, 86, 12, 3186);
    			add_location(li4, file$3, 86, 8, 3182);
    			attr_dev(i6, "class", "i-checkmark-green i-16 svelte-y2ggbi");
    			toggle_class(i6, "in", /*v_symbols*/ ctx[6]);
    			add_location(i6, file$3, 87, 12, 3277);
    			add_location(li5, file$3, 87, 8, 3273);
    			attr_dev(ul, "class", "rules svelte-y2ggbi");
    			toggle_class(ul, "in", /*has_focus*/ ctx[8] && !/*v_all*/ ctx[12]);
    			add_location(ul, file$3, 81, 4, 2765);
    			attr_dev(div3, "class", "validation-message svelte-y2ggbi");
    			add_location(div3, file$3, 90, 4, 3386);
    			attr_dev(div4, "class", "form-item svelte-y2ggbi");
    			add_location(div4, file$3, 63, 0, 1686);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			if (if_block0) if_block0.m(div4, null);
    			append_dev(div4, t0);
    			if (if_block1) if_block1.m(div4, null);
    			append_dev(div4, t1);
    			append_dev(div4, div2);
    			append_dev(div2, div0);
    			append_dev(div0, input0);
    			set_input_value(input0, /*f*/ ctx[0].answer);
    			/*input0_binding*/ ctx[17](input0);
    			append_dev(div0, t2);
    			append_dev(div0, i0);
    			append_dev(div2, t3);
    			append_dev(div2, div1);
    			append_dev(div1, input1);
    			set_input_value(input1, /*f*/ ctx[0].answer);
    			/*input1_binding*/ ctx[20](input1);
    			append_dev(div1, t4);
    			append_dev(div1, i1);
    			append_dev(div4, t5);
    			append_dev(div4, ul);
    			append_dev(ul, li0);
    			append_dev(li0, b);
    			append_dev(ul, t7);
    			append_dev(ul, li1);
    			append_dev(li1, i2);
    			append_dev(li1, t8);
    			append_dev(ul, t9);
    			append_dev(ul, li2);
    			append_dev(li2, i3);
    			append_dev(li2, t10);
    			append_dev(ul, t11);
    			append_dev(ul, li3);
    			append_dev(li3, i4);
    			append_dev(li3, t12);
    			append_dev(ul, t13);
    			append_dev(ul, li4);
    			append_dev(li4, i5);
    			append_dev(li4, t14);
    			append_dev(ul, t15);
    			append_dev(ul, li5);
    			append_dev(li5, i6);
    			append_dev(li5, t16);
    			append_dev(div4, t17);
    			append_dev(div4, div3);
    			if (if_block2) if_block2.m(div3, null);
    			append_dev(div3, t18);
    			if (if_block3) if_block3.m(div3, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[16]),
    					listen_dev(input0, "focus", /*focusPassword*/ ctx[14], false, false, false),
    					listen_dev(input0, "blur", /*blurPassword*/ ctx[15], false, false, false),
    					listen_dev(i0, "click", /*click_handler*/ ctx[18], false, false, false),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[19]),
    					listen_dev(input1, "focus", /*focusPassword*/ ctx[14], false, false, false),
    					listen_dev(input1, "blur", /*blurPassword*/ ctx[15], false, false, false),
    					listen_dev(i1, "click", /*click_handler_1*/ ctx[21], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*f*/ ctx[0].label && /*channel*/ ctx[1]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_5(ctx);
    					if_block0.c();
    					if_block0.m(div4, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*f*/ ctx[0].hint) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_4(ctx);
    					if_block1.c();
    					if_block1.m(div4, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*f*/ 1 && input0_id_value !== (input0_id_value = /*f*/ ctx[0].id)) {
    				attr_dev(input0, "id", input0_id_value);
    			}

    			if (dirty & /*f*/ 1 && input0_placeholder_value !== (input0_placeholder_value = /*f*/ ctx[0].placeholder ? /*f*/ ctx[0].placeholder : "")) {
    				attr_dev(input0, "placeholder", input0_placeholder_value);
    			}

    			if (dirty & /*f*/ 1 && input0.value !== /*f*/ ctx[0].answer) {
    				set_input_value(input0, /*f*/ ctx[0].answer);
    			}

    			if (dirty & /*input_type*/ 128) {
    				set_style(div0, "display", /*input_type*/ ctx[7] == "password" ? "block" : "none");
    			}

    			if (dirty & /*f*/ 1 && input1_id_value !== (input1_id_value = "" + (/*f*/ ctx[0].id + "_alt"))) {
    				attr_dev(input1, "id", input1_id_value);
    			}

    			if (dirty & /*f*/ 1 && input1_placeholder_value !== (input1_placeholder_value = /*f*/ ctx[0].placeholder ? /*f*/ ctx[0].placeholder : "")) {
    				attr_dev(input1, "placeholder", input1_placeholder_value);
    			}

    			if (dirty & /*f*/ 1 && input1.value !== /*f*/ ctx[0].answer) {
    				set_input_value(input1, /*f*/ ctx[0].answer);
    			}

    			if (dirty & /*input_type*/ 128) {
    				set_style(div1, "display", /*input_type*/ ctx[7] == "text" ? "block" : "none");
    			}

    			if (dirty & /*v_length*/ 4) {
    				toggle_class(i2, "in", /*v_length*/ ctx[2]);
    			}

    			if (dirty & /*v_uppercase*/ 16) {
    				toggle_class(i3, "in", /*v_uppercase*/ ctx[4]);
    			}

    			if (dirty & /*v_lowercase*/ 32) {
    				toggle_class(i4, "in", /*v_lowercase*/ ctx[5]);
    			}

    			if (dirty & /*v_number*/ 8) {
    				toggle_class(i5, "in", /*v_number*/ ctx[3]);
    			}

    			if (dirty & /*v_symbols*/ 64) {
    				toggle_class(i6, "in", /*v_symbols*/ ctx[6]);
    			}

    			if (dirty & /*has_focus, v_all*/ 4352) {
    				toggle_class(ul, "in", /*has_focus*/ ctx[8] && !/*v_all*/ ctx[12]);
    			}

    			if (/*has_focus*/ ctx[8]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_2$1(ctx);
    					if_block2.c();
    					if_block2.m(div3, t18);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*validation_showing*/ ctx[11]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block$2(ctx);
    					if_block3.c();
    					if_block3.m(div3, null);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			/*input0_binding*/ ctx[17](null);
    			/*input1_binding*/ ctx[20](null);
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
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
    	let v_length;
    	let v_number;
    	let v_uppercase;
    	let v_lowercase;
    	let v_symbols;
    	let v_all;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("InputPassword", slots, []);
    	let { f } = $$props;
    	let { channel } = $$props;
    	let input_type = "password";
    	let has_focus = false;
    	let input_password = false;
    	let input_text = false;
    	let validation_showing = false;

    	function eye(input) {
    		console.log("eye click");

    		if (input == "password") {
    			$$invalidate(7, input_type = "text");

    			setTimeout(
    				() => {
    					input_text.focus();
    				},
    				50
    			);
    		} else {
    			$$invalidate(7, input_type = "password");

    			setTimeout(
    				() => {
    					input_password.focus();
    				},
    				50
    			);
    		}
    	}

    	function focusPassword() {
    		$$invalidate(8, has_focus = true);
    		$$invalidate(11, validation_showing = false);
    	}

    	function blurPassword() {
    		setTimeout(
    			() => {
    				if (input_password !== document.activeElement && input_text !== document.activeElement) {
    					$$invalidate(8, has_focus = false);
    					$$invalidate(11, validation_showing = true);

    					if (v_all) {
    						//only show valid for a short time and then fade out
    						setTimeout(
    							() => {
    								$$invalidate(11, validation_showing = false);
    							},
    							3000
    						);
    					}
    				}
    			},
    			300
    		);
    	}

    	const writable_props = ["f", "channel"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<InputPassword> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		f.answer = this.value;
    		$$invalidate(0, f);
    	}

    	function input0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			input_password = $$value;
    			$$invalidate(9, input_password);
    		});
    	}

    	const click_handler = () => {
    		eye("password");
    	};

    	function input1_input_handler() {
    		f.answer = this.value;
    		$$invalidate(0, f);
    	}

    	function input1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			input_text = $$value;
    			$$invalidate(10, input_text);
    		});
    	}

    	const click_handler_1 = () => {
    		eye("text");
    	};

    	$$self.$$set = $$props => {
    		if ("f" in $$props) $$invalidate(0, f = $$props.f);
    		if ("channel" in $$props) $$invalidate(1, channel = $$props.channel);
    	};

    	$$self.$capture_state = () => ({
    		Shortcuts,
    		f,
    		channel,
    		input_type,
    		has_focus,
    		input_password,
    		input_text,
    		validation_showing,
    		eye,
    		focusPassword,
    		blurPassword,
    		v_length,
    		v_number,
    		v_uppercase,
    		v_lowercase,
    		v_symbols,
    		v_all
    	});

    	$$self.$inject_state = $$props => {
    		if ("f" in $$props) $$invalidate(0, f = $$props.f);
    		if ("channel" in $$props) $$invalidate(1, channel = $$props.channel);
    		if ("input_type" in $$props) $$invalidate(7, input_type = $$props.input_type);
    		if ("has_focus" in $$props) $$invalidate(8, has_focus = $$props.has_focus);
    		if ("input_password" in $$props) $$invalidate(9, input_password = $$props.input_password);
    		if ("input_text" in $$props) $$invalidate(10, input_text = $$props.input_text);
    		if ("validation_showing" in $$props) $$invalidate(11, validation_showing = $$props.validation_showing);
    		if ("v_length" in $$props) $$invalidate(2, v_length = $$props.v_length);
    		if ("v_number" in $$props) $$invalidate(3, v_number = $$props.v_number);
    		if ("v_uppercase" in $$props) $$invalidate(4, v_uppercase = $$props.v_uppercase);
    		if ("v_lowercase" in $$props) $$invalidate(5, v_lowercase = $$props.v_lowercase);
    		if ("v_symbols" in $$props) $$invalidate(6, v_symbols = $$props.v_symbols);
    		if ("v_all" in $$props) $$invalidate(12, v_all = $$props.v_all);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*f*/ 1) {
    			$$invalidate(2, v_length = f.answer.length >= 10);
    		}

    		if ($$self.$$.dirty & /*f*/ 1) {
    			$$invalidate(3, v_number = f.answer.match(/[0-9]/));
    		}

    		if ($$self.$$.dirty & /*f*/ 1) {
    			$$invalidate(4, v_uppercase = f.answer !== f.answer.toLowerCase());
    		}

    		if ($$self.$$.dirty & /*f*/ 1) {
    			$$invalidate(5, v_lowercase = f.answer !== f.answer.toUpperCase());
    		}

    		if ($$self.$$.dirty & /*f*/ 1) {
    			$$invalidate(6, v_symbols = f.answer.match(/[\.,\*\£\+&\(\)~$%@\^\#\-_!]/));
    		}

    		if ($$self.$$.dirty & /*v_length, v_number, v_uppercase, v_lowercase, v_symbols*/ 124) {
    			$$invalidate(12, v_all = v_length && v_number && v_uppercase && v_lowercase && v_symbols);
    		}
    	};

    	return [
    		f,
    		channel,
    		v_length,
    		v_number,
    		v_uppercase,
    		v_lowercase,
    		v_symbols,
    		input_type,
    		has_focus,
    		input_password,
    		input_text,
    		validation_showing,
    		v_all,
    		eye,
    		focusPassword,
    		blurPassword,
    		input0_input_handler,
    		input0_binding,
    		click_handler,
    		input1_input_handler,
    		input1_binding,
    		click_handler_1
    	];
    }

    class InputPassword extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { f: 0, channel: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InputPassword",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*f*/ ctx[0] === undefined && !("f" in props)) {
    			console_1$1.warn("<InputPassword> was created without expected prop 'f'");
    		}

    		if (/*channel*/ ctx[1] === undefined && !("channel" in props)) {
    			console_1$1.warn("<InputPassword> was created without expected prop 'channel'");
    		}
    	}

    	get f() {
    		throw new Error("<InputPassword>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set f(value) {
    		throw new Error("<InputPassword>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get channel() {
    		throw new Error("<InputPassword>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set channel(value) {
    		throw new Error("<InputPassword>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/form/InputPasswordConfirm.svelte generated by Svelte v3.35.0 */
    const file$2 = "src/components/form/InputPasswordConfirm.svelte";

    // (28:4) {#if f.label}
    function create_if_block_2(ctx) {
    	let label;
    	let t0_value = /*f*/ ctx[0].label + "";
    	let t0;
    	let t1;
    	let label_for_value;
    	let if_block = /*f*/ ctx[0].optional && create_if_block_3(ctx);

    	const block = {
    		c: function create() {
    			label = element("label");
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block) if_block.c();
    			attr_dev(label, "for", label_for_value = /*f*/ ctx[0].id);
    			add_location(label, file$2, 28, 8, 583);
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
    					if_block = create_if_block_3(ctx);
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
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(28:4) {#if f.label}",
    		ctx
    	});

    	return block;
    }

    // (29:38) {#if f.optional}
    function create_if_block_3(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "(Optional)";
    			attr_dev(span, "class", "optional");
    			add_location(span, file$2, 28, 54, 629);
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
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(29:38) {#if f.optional}",
    		ctx
    	});

    	return block;
    }

    // (31:4) {#if f.hint}
    function create_if_block_1(ctx) {
    	let p;
    	let t_value = /*f*/ ctx[0].hint + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			add_location(p, file$2, 31, 8, 718);
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
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(31:4) {#if f.hint}",
    		ctx
    	});

    	return block;
    }

    // (38:8) {:else}
    function create_else_block$1(ctx) {
    	let input;
    	let input_id_value;
    	let input_placeholder_value;
    	let t;
    	let i;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			t = space();
    			i = element("i");
    			attr_dev(input, "id", input_id_value = /*f*/ ctx[0].id);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", input_placeholder_value = /*f*/ ctx[0].placeholder ? /*f*/ ctx[0].placeholder : "");
    			attr_dev(input, "class", "form-control");
    			add_location(input, file$2, 38, 8, 1118);
    			attr_dev(i, "class", "i-view i-24 svelte-ha93rr");
    			add_location(i, file$2, 39, 12, 1258);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*f*/ ctx[0].answer);
    			insert_dev(target, t, anchor);
    			insert_dev(target, i, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler_1*/ ctx[4]),
    					listen_dev(i, "click", /*click_handler_1*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
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
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(i);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(38:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (35:8) {#if input_type == 'password'}
    function create_if_block$1(ctx) {
    	let input;
    	let input_id_value;
    	let input_placeholder_value;
    	let t;
    	let i;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			t = space();
    			i = element("i");
    			attr_dev(input, "id", input_id_value = /*f*/ ctx[0].id);
    			attr_dev(input, "type", "password");
    			attr_dev(input, "placeholder", input_placeholder_value = /*f*/ ctx[0].placeholder ? /*f*/ ctx[0].placeholder : "");
    			attr_dev(input, "class", "form-control");
    			add_location(input, file$2, 35, 12, 828);
    			attr_dev(i, "class", "i-view i-24 svelte-ha93rr");
    			add_location(i, file$2, 36, 12, 1024);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*f*/ ctx[0].answer);
    			insert_dev(target, t, anchor);
    			insert_dev(target, i, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[2]),
    					listen_dev(input, "focus", focusPassword, false, false, false),
    					listen_dev(input, "blur", blurPassword, false, false, false),
    					listen_dev(i, "click", /*click_handler*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
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
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(i);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(35:8) {#if input_type == 'password'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div2;
    	let t0;
    	let t1;
    	let div0;
    	let t2;
    	let div1;
    	let if_block0 = /*f*/ ctx[0].label && create_if_block_2(ctx);
    	let if_block1 = /*f*/ ctx[0].hint && create_if_block_1(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*input_type*/ ctx[1] == "password") return create_if_block$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block2 = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			div0 = element("div");
    			if_block2.c();
    			t2 = space();
    			div1 = element("div");
    			attr_dev(div0, "class", "password-shell svelte-ha93rr");
    			add_location(div0, file$2, 33, 4, 748);
    			attr_dev(div1, "class", "validation-message svelte-ha93rr");
    			add_location(div1, file$2, 42, 4, 1361);
    			attr_dev(div2, "class", "form-item svelte-ha93rr");
    			add_location(div2, file$2, 26, 0, 533);
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
    			append_dev(div2, div0);
    			if_block2.m(div0, null);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*f*/ ctx[0].label) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2(ctx);
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
    					if_block1 = create_if_block_1(ctx);
    					if_block1.c();
    					if_block1.m(div2, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(div0, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if_block2.d();
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

    function focusPassword() {
    	
    } /*has_focus = true;
    validation_showing = false*/

    function blurPassword() {
    	
    } /*has_focus = false;
    validation_showing = true;
    if(v_all) {
        //only show valid for a short time and then fade out
        setTimeout(() => {
            validation_showing = false;
        }, 3000);
    }
    */

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("InputPasswordConfirm", slots, []);
    	let { f } = $$props;
    	let input_type = "password";
    	const writable_props = ["f"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<InputPasswordConfirm> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		f.answer = this.value;
    		$$invalidate(0, f);
    	}

    	const click_handler = () => {
    		$$invalidate(1, input_type = "text");
    	};

    	function input_input_handler_1() {
    		f.answer = this.value;
    		$$invalidate(0, f);
    	}

    	const click_handler_1 = () => {
    		$$invalidate(1, input_type = "password");
    	};

    	$$self.$$set = $$props => {
    		if ("f" in $$props) $$invalidate(0, f = $$props.f);
    	};

    	$$self.$capture_state = () => ({
    		Shortcuts,
    		f,
    		input_type,
    		focusPassword,
    		blurPassword
    	});

    	$$self.$inject_state = $$props => {
    		if ("f" in $$props) $$invalidate(0, f = $$props.f);
    		if ("input_type" in $$props) $$invalidate(1, input_type = $$props.input_type);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		f,
    		input_type,
    		input_input_handler,
    		click_handler,
    		input_input_handler_1,
    		click_handler_1
    	];
    }

    class InputPasswordConfirm extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { f: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InputPasswordConfirm",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*f*/ ctx[0] === undefined && !("f" in props)) {
    			console.warn("<InputPasswordConfirm> was created without expected prop 'f'");
    		}
    	}

    	get f() {
    		throw new Error("<InputPasswordConfirm>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set f(value) {
    		throw new Error("<InputPasswordConfirm>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/form/Form.svelte generated by Svelte v3.35.0 */

    const { console: console_1 } = globals;
    const file$1 = "src/components/form/Form.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (43:4) {:else}
    function create_else_block(ctx) {
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
    			add_location(b, file$1, 43, 26, 1396);
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
    		id: create_else_block.name,
    		type: "else",
    		source: "(43:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (41:4) {#if components[f.item_type]}
    function create_if_block(ctx) {
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
    		id: create_if_block.name,
    		type: "if",
    		source: "(41:4) {#if components[f.item_type]}",
    		ctx
    	});

    	return block;
    }

    // (40:0) {#each f as f}
    function create_each_block(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
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
    		id: create_each_block.name,
    		type: "each",
    		source: "(40:0) {#each f as f}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*f*/ ctx[1];
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
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
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
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Form", slots, []);
    	let { f } = $$props;
    	let { channel = "ANSWER" } = $$props;

    	let components = {
    		"section": Section,
    		"input_checkbox": InputCheckbox,
    		"input_lookup": InputLookup,
    		"input_matrix": InputMatrix,
    		"input_multi": InputMulti,
    		"input_password": InputPassword,
    		"input_password_confirm": InputPasswordConfirm,
    		"input_select": InputSelect,
    		"input_signature": InputSignature,
    		"input_switch": InputSwitch,
    		"input_text": InputText,
    		"input_textarea": InputTextarea
    	};

    	onMount(() => {
    		console.log("Form and all children are mounted");
    	});

    	const writable_props = ["f", "channel"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Form> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("f" in $$props) $$invalidate(1, f = $$props.f);
    		if ("channel" in $$props) $$invalidate(0, channel = $$props.channel);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		Section,
    		InputCheckbox,
    		InputLookup,
    		InputMatrix,
    		InputMulti,
    		InputPassword,
    		InputPasswordConfirm,
    		InputSelect,
    		InputSignature,
    		InputSwitch,
    		InputText,
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
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { f: 1, channel: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Form",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*f*/ ctx[1] === undefined && !("f" in props)) {
    			console_1.warn("<Form> was created without expected prop 'f'");
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

    /* src/Login.svelte generated by Svelte v3.35.0 */
    const file = "src/Login.svelte";

    function create_fragment(ctx) {
    	let div1;
    	let div0;
    	let i;
    	let t0;
    	let h2;
    	let t2;
    	let h3;
    	let t4;
    	let form;
    	let t5;
    	let a;
    	let current;

    	form = new Form({
    			props: {
    				f: /*f*/ ctx[1],
    				channel: /*channel*/ ctx[0]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			i = element("i");
    			t0 = space();
    			h2 = element("h2");
    			h2.textContent = "Welcome to EcoOnline";
    			t2 = space();
    			h3 = element("h3");
    			h3.textContent = "Create your password";
    			t4 = space();
    			create_component(form.$$.fragment);
    			t5 = space();
    			a = element("a");
    			a.textContent = "Create Password";
    			attr_dev(i, "class", "i-logo i-40 svelte-14xsu3n");
    			add_location(i, file, 32, 8, 757);
    			attr_dev(h2, "class", "svelte-14xsu3n");
    			add_location(h2, file, 33, 8, 793);
    			attr_dev(h3, "class", "svelte-14xsu3n");
    			add_location(h3, file, 34, 8, 831);
    			attr_dev(div0, "class", "center svelte-14xsu3n");
    			add_location(div0, file, 31, 4, 728);
    			attr_dev(a, "href", "");
    			attr_dev(a, "class", "btn mob");
    			add_location(a, file, 39, 4, 910);
    			attr_dev(div1, "class", "login-space svelte-14xsu3n");
    			add_location(div1, file, 30, 0, 698);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, i);
    			append_dev(div0, t0);
    			append_dev(div0, h2);
    			append_dev(div0, t2);
    			append_dev(div0, h3);
    			append_dev(div1, t4);
    			mount_component(form, div1, null);
    			append_dev(div1, t5);
    			append_dev(div1, a);
    			current = true;
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
    			if (detaching) detach_dev(div1);
    			destroy_component(form);
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
    	validate_slots("Login", slots, []);
    	let channel = "LOGIN";

    	let f = [
    		{
    			item_type: "input_password",
    			id: "0_1",
    			label: "Password",
    			hint: false,
    			options: [
    				{ value: "", text: "Select one" },
    				{ value: "PP", text: "Passport" },
    				{ value: "ID", text: "National ID" }
    			],
    			answer: ""
    		},
    		{
    			item_type: "input_password_confirm",
    			id: "0_2",
    			label: "Confirm password",
    			hint: false,
    			answer: ""
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Login> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ onMount, Form, channel, f });

    	$$self.$inject_state = $$props => {
    		if ("channel" in $$props) $$invalidate(0, channel = $$props.channel);
    		if ("f" in $$props) $$invalidate(1, f = $$props.f);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [channel, f];
    }

    class Login extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Login",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new Login({
    	target: document.getElementById('app')
    });

    return app;

}());
//# sourceMappingURL=login.js.map
