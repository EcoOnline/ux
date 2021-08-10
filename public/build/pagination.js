
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

    /* src/Pag.svelte generated by Svelte v3.35.0 */

    const { console: console_1$1 } = globals;
    const file$1 = "src/Pag.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[30] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[33] = list[i];
    	child_ctx[35] = i;
    	return child_ctx;
    }

    // (180:1) {:else}
    function create_else_block_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("No items to paginate");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(180:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (122:1) {#if total_items}
    function create_if_block(ctx) {
    	let t0;
    	let t1;
    	let if_block2_anchor;
    	let if_block0 = /*show_items_range*/ ctx[5] && create_if_block_13(ctx);
    	let if_block1 = /*show_items_per_page_select*/ ctx[6] && create_if_block_12(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*number_of_pages*/ ctx[11] > 1) return create_if_block_1;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block2 = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if_block2.c();
    			if_block2_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			if_block2.m(target, anchor);
    			insert_dev(target, if_block2_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*show_items_range*/ ctx[5]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_13(ctx);
    					if_block0.c();
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*show_items_per_page_select*/ ctx[6]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_12(ctx);
    					if_block1.c();
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t1);
    			if_block2.d(detaching);
    			if (detaching) detach_dev(if_block2_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(122:1) {#if total_items}",
    		ctx
    	});

    	return block;
    }

    // (123:2) {#if show_items_range}
    function create_if_block_13(ctx) {
    	let span;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text(/*first_page_item*/ ctx[10]);
    			t1 = text(" – ");
    			t2 = text(/*last_page_item*/ ctx[13]);
    			t3 = text(" / ");
    			t4 = text(/*total_items*/ ctx[2]);
    			attr_dev(span, "class", "total_items svelte-1twx05x");
    			add_location(span, file$1, 123, 3, 2746);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    			append_dev(span, t2);
    			append_dev(span, t3);
    			append_dev(span, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*first_page_item*/ 1024) set_data_dev(t0, /*first_page_item*/ ctx[10]);
    			if (dirty[0] & /*last_page_item*/ 8192) set_data_dev(t2, /*last_page_item*/ ctx[13]);
    			if (dirty[0] & /*total_items*/ 4) set_data_dev(t4, /*total_items*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_13.name,
    		type: "if",
    		source: "(123:2) {#if show_items_range}",
    		ctx
    	});

    	return block;
    }

    // (126:2) {#if show_items_per_page_select}
    function create_if_block_12(ctx) {
    	let span;
    	let select;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*items_per_page_array*/ ctx[3];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			span = element("span");
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(select, "class", "svelte-1twx05x");
    			if (/*items_per_page_index*/ ctx[1] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[21].call(select));
    			add_location(select, file$1, 127, 4, 2911);
    			attr_dev(span, "class", "select_items svelte-1twx05x");
    			add_location(span, file$1, 126, 3, 2879);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*items_per_page_index*/ ctx[1]);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[21]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*items_per_page_array*/ 8) {
    				each_value_1 = /*items_per_page_array*/ ctx[3];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (dirty[0] & /*items_per_page_index*/ 2) {
    				select_option(select, /*items_per_page_index*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_12.name,
    		type: "if",
    		source: "(126:2) {#if show_items_per_page_select}",
    		ctx
    	});

    	return block;
    }

    // (129:5) {#each items_per_page_array as item, ind}
    function create_each_block_1(ctx) {
    	let option;
    	let t_value = /*item*/ ctx[33] + "";
    	let t;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = /*ind*/ ctx[35];
    			option.value = option.__value;
    			add_location(option, file$1, 129, 6, 3009);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*items_per_page_array*/ 8 && t_value !== (t_value = /*item*/ ctx[33] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(129:5) {#each items_per_page_array as item, ind}",
    		ctx
    	});

    	return block;
    }

    // (176:2) {:else}
    function create_else_block_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Only 1 page");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(176:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (136:2) {#if number_of_pages > 1}
    function create_if_block_1(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let if_block0 = /*show_prev*/ ctx[7] && create_if_block_11(ctx);
    	let if_block1 = /*number_of_buttons*/ ctx[9] !== 0 && create_if_block_3(ctx);
    	let if_block2 = /*show_next*/ ctx[8] && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			attr_dev(div, "class", "button_wrapper svelte-1twx05x");
    			add_location(div, file$1, 136, 3, 3125);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t0);
    			if (if_block1) if_block1.m(div, null);
    			append_dev(div, t1);
    			if (if_block2) if_block2.m(div, null);
    		},
    		p: function update(ctx, dirty) {
    			if (/*show_prev*/ ctx[7]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_11(ctx);
    					if_block0.c();
    					if_block0.m(div, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*number_of_buttons*/ ctx[9] !== 0) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_3(ctx);
    					if_block1.c();
    					if_block1.m(div, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*show_next*/ ctx[8]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_2(ctx);
    					if_block2.c();
    					if_block2.m(div, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(136:2) {#if number_of_pages > 1}",
    		ctx
    	});

    	return block;
    }

    // (139:4) {#if show_prev}
    function create_if_block_11(ctx) {
    	let button;
    	let t;
    	let button_disabled_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text("<");
    			button.disabled = button_disabled_value = !/*loop*/ ctx[4] && /*current_page*/ ctx[0] < 1;
    			attr_dev(button, "class", "svelte-1twx05x");
    			add_location(button, file$1, 139, 5, 3180);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*prev*/ ctx[14], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*loop, current_page*/ 17 && button_disabled_value !== (button_disabled_value = !/*loop*/ ctx[4] && /*current_page*/ ctx[0] < 1)) {
    				prop_dev(button, "disabled", button_disabled_value);
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
    		id: create_if_block_11.name,
    		type: "if",
    		source: "(139:4) {#if show_prev}",
    		ctx
    	});

    	return block;
    }

    // (142:4) {#if number_of_buttons !== 0}
    function create_if_block_3(ctx) {
    	let each_1_anchor;
    	let each_value = /*buttons_count_array*/ ctx[12];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
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
    			if (dirty[0] & /*current_page, buttons_count_array, number_of_buttons, go_to_page, number_of_pages*/ 72193) {
    				each_value = /*buttons_count_array*/ ctx[12];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
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
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(142:4) {#if number_of_buttons !== 0}",
    		ctx
    	});

    	return block;
    }

    // (164:8) {:else}
    function create_else_block(ctx) {
    	let button;
    	let t_value = /*i*/ ctx[30] + 1 + (/*current_page*/ ctx[0] - Math.floor(/*number_of_buttons*/ ctx[9] / 2)) + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler_4() {
    		return /*click_handler_4*/ ctx[26](/*i*/ ctx[30]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(t_value);
    			attr_dev(button, "class", "svelte-1twx05x");
    			toggle_class(button, "selected", /*current_page*/ ctx[0] == /*i*/ ctx[30] + (/*current_page*/ ctx[0] - Math.floor(/*number_of_buttons*/ ctx[9] / 2)));
    			add_location(button, file$1, 164, 9, 4766);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler_4, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*buttons_count_array, current_page, number_of_buttons*/ 4609 && t_value !== (t_value = /*i*/ ctx[30] + 1 + (/*current_page*/ ctx[0] - Math.floor(/*number_of_buttons*/ ctx[9] / 2)) + "")) set_data_dev(t, t_value);

    			if (dirty[0] & /*current_page, buttons_count_array, number_of_buttons*/ 4609) {
    				toggle_class(button, "selected", /*current_page*/ ctx[0] == /*i*/ ctx[30] + (/*current_page*/ ctx[0] - Math.floor(/*number_of_buttons*/ ctx[9] / 2)));
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
    		id: create_else_block.name,
    		type: "else",
    		source: "(164:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (162:66) 
    function create_if_block_10(ctx) {
    	let button;
    	let t_value = /*i*/ ctx[30] + 1 + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler_3() {
    		return /*click_handler_3*/ ctx[25](/*i*/ ctx[30]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(t_value);
    			attr_dev(button, "class", "svelte-1twx05x");
    			toggle_class(button, "selected", /*current_page*/ ctx[0] == /*i*/ ctx[30]);
    			add_location(button, file$1, 162, 9, 4649);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler_3, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*buttons_count_array*/ 4096 && t_value !== (t_value = /*i*/ ctx[30] + 1 + "")) set_data_dev(t, t_value);

    			if (dirty[0] & /*current_page, buttons_count_array*/ 4097) {
    				toggle_class(button, "selected", /*current_page*/ ctx[0] == /*i*/ ctx[30]);
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
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(162:66) ",
    		ctx
    	});

    	return block;
    }

    // (160:8) {#if current_page >= number_of_pages - Math.floor(number_of_buttons/2 + 1) }
    function create_if_block_9(ctx) {
    	let button;
    	let t_value = /*number_of_pages*/ ctx[11] - (/*number_of_buttons*/ ctx[9] - /*i*/ ctx[30]) + 1 + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler_2() {
    		return /*click_handler_2*/ ctx[24](/*i*/ ctx[30]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(t_value);
    			attr_dev(button, "class", "svelte-1twx05x");
    			toggle_class(button, "selected", /*current_page*/ ctx[0] == /*number_of_pages*/ ctx[11] - (/*number_of_buttons*/ ctx[9] - /*i*/ ctx[30]));
    			add_location(button, file$1, 160, 9, 4354);
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
    			if (dirty[0] & /*number_of_pages, number_of_buttons, buttons_count_array*/ 6656 && t_value !== (t_value = /*number_of_pages*/ ctx[11] - (/*number_of_buttons*/ ctx[9] - /*i*/ ctx[30]) + 1 + "")) set_data_dev(t, t_value);

    			if (dirty[0] & /*current_page, number_of_pages, number_of_buttons, buttons_count_array*/ 6657) {
    				toggle_class(button, "selected", /*current_page*/ ctx[0] == /*number_of_pages*/ ctx[11] - (/*number_of_buttons*/ ctx[9] - /*i*/ ctx[30]));
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
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(160:8) {#if current_page >= number_of_pages - Math.floor(number_of_buttons/2 + 1) }",
    		ctx
    	});

    	return block;
    }

    // (156:164) 
    function create_if_block_8(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "...";
    			attr_dev(button, "class", "refrain svelte-1twx05x");
    			add_location(button, file$1, 157, 8, 4208);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(156:164) ",
    		ctx
    	});

    	return block;
    }

    // (153:7) {#if i == 1 && (i!==number_of_pages-1)  && current_page >= Math.floor(number_of_buttons/2)+1 }
    function create_if_block_7(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "...";
    			attr_dev(button, "class", "refrain svelte-1twx05x");
    			add_location(button, file$1, 154, 8, 3963);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(153:7) {#if i == 1 && (i!==number_of_pages-1)  && current_page >= Math.floor(number_of_buttons/2)+1 }",
    		ctx
    	});

    	return block;
    }

    // (149:41) 
    function create_if_block_6(ctx) {
    	let button;
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(/*number_of_pages*/ ctx[11]);
    			attr_dev(button, "class", "svelte-1twx05x");
    			toggle_class(button, "selected", /*current_page*/ ctx[0] == /*number_of_pages*/ ctx[11] - 1);
    			add_location(button, file$1, 150, 7, 3668);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_1*/ ctx[23], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*number_of_pages*/ 2048) set_data_dev(t, /*number_of_pages*/ ctx[11]);

    			if (dirty[0] & /*current_page, number_of_pages*/ 2049) {
    				toggle_class(button, "selected", /*current_page*/ ctx[0] == /*number_of_pages*/ ctx[11] - 1);
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
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(149:41) ",
    		ctx
    	});

    	return block;
    }

    // (146:23) 
    function create_if_block_5(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "1";
    			attr_dev(button, "class", "svelte-1twx05x");
    			toggle_class(button, "selected", /*current_page*/ ctx[0] == 0);
    			add_location(button, file$1, 147, 7, 3504);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[22], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*current_page*/ 1) {
    				toggle_class(button, "selected", /*current_page*/ ctx[0] == 0);
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
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(146:23) ",
    		ctx
    	});

    	return block;
    }

    // (144:6) {#if i == 0 && number_of_buttons == 1}
    function create_if_block_4(ctx) {
    	let button;
    	let t_value = /*current_page*/ ctx[0] + 1 + "";
    	let t;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(t_value);
    			attr_dev(button, "class", "selected svelte-1twx05x");
    			add_location(button, file$1, 144, 7, 3393);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*current_page*/ 1 && t_value !== (t_value = /*current_page*/ ctx[0] + 1 + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(144:6) {#if i == 0 && number_of_buttons == 1}",
    		ctx
    	});

    	return block;
    }

    // (143:5) {#each buttons_count_array as i}
    function create_each_block$1(ctx) {
    	let show_if;
    	let show_if_1;
    	let show_if_2;
    	let show_if_3;
    	let if_block_anchor;

    	function select_block_type_2(ctx, dirty) {
    		if (/*i*/ ctx[30] == 0 && /*number_of_buttons*/ ctx[9] == 1) return create_if_block_4;
    		if (/*i*/ ctx[30] == 0) return create_if_block_5;
    		if (/*i*/ ctx[30] == /*number_of_buttons*/ ctx[9] - 1) return create_if_block_6;
    		if (show_if == null || dirty[0] & /*buttons_count_array, number_of_pages, current_page, number_of_buttons*/ 6657) show_if = !!(/*i*/ ctx[30] == 1 && /*i*/ ctx[30] !== /*number_of_pages*/ ctx[11] - 1 && /*current_page*/ ctx[0] >= Math.floor(/*number_of_buttons*/ ctx[9] / 2) + 1);
    		if (show_if) return create_if_block_7;
    		if (show_if_1 == null || dirty[0] & /*buttons_count_array, number_of_buttons, number_of_pages, current_page*/ 6657) show_if_1 = !!(/*i*/ ctx[30] == /*number_of_buttons*/ ctx[9] - 2 && /*number_of_buttons*/ ctx[9] !== /*number_of_pages*/ ctx[11] - 1 && /*current_page*/ ctx[0] + Math.floor(/*number_of_buttons*/ ctx[9] / 2) < /*number_of_pages*/ ctx[11] - 1);
    		if (show_if_1) return create_if_block_8;
    		if (show_if_2 == null || dirty[0] & /*current_page, number_of_pages, number_of_buttons*/ 2561) show_if_2 = !!(/*current_page*/ ctx[0] >= /*number_of_pages*/ ctx[11] - Math.floor(/*number_of_buttons*/ ctx[9] / 2 + 1));
    		if (show_if_2) return create_if_block_9;
    		if (show_if_3 == null || dirty[0] & /*current_page, number_of_buttons*/ 513) show_if_3 = !!(/*current_page*/ ctx[0] < Math.floor(/*number_of_buttons*/ ctx[9] / 2));
    		if (show_if_3) return create_if_block_10;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type_2(ctx, [-1]);
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
    			if (current_block_type === (current_block_type = select_block_type_2(ctx, dirty)) && if_block) {
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
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(143:5) {#each buttons_count_array as i}",
    		ctx
    	});

    	return block;
    }

    // (172:4) {#if show_next}
    function create_if_block_2(ctx) {
    	let button;
    	let t;
    	let button_disabled_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(">");
    			button.disabled = button_disabled_value = !/*loop*/ ctx[4] && /*current_page*/ ctx[0] >= /*number_of_pages*/ ctx[11] - 1;
    			attr_dev(button, "class", "svelte-1twx05x");
    			add_location(button, file$1, 172, 5, 5100);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*next*/ ctx[15], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*loop, current_page, number_of_pages*/ 2065 && button_disabled_value !== (button_disabled_value = !/*loop*/ ctx[4] && /*current_page*/ ctx[0] >= /*number_of_pages*/ ctx[11] - 1)) {
    				prop_dev(button, "disabled", button_disabled_value);
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
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(172:4) {#if show_next}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;

    	function select_block_type(ctx, dirty) {
    		if (/*total_items*/ ctx[2]) return create_if_block;
    		return create_else_block_2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "pagination_wrapper svelte-1twx05x");
    			add_location(div, file$1, 120, 0, 2666);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, dirty) {
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
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
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
    	let items_per_page;
    	let first_page_item;
    	let last_page_item;
    	let number_of_pages;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Pag", slots, []);
    	let loaded = false;
    	let { trigger_request_on_load = true } = $$props;
    	let { total_items } = $$props;
    	let { current_page = 0 } = $$props;
    	let { items_per_page_array = [10, 20, 50, 100] } = $$props;
    	let { items_per_page_index = 0 } = $$props;
    	let { max_pagination_buttons = 7 } = $$props; // must be zero or odd
    	let { loop = false } = $$props;
    	let { show_items_range = true } = $$props;
    	let { show_items_per_page_select = true } = $$props;
    	let { show_prev = true } = $$props;
    	let { show_next = true } = $$props;
    	let items_marker = items_per_page_array[items_per_page_index];

    	//actual number of buttons to show depends on current page and whether first and last are showing
    	let number_of_buttons = max_pagination_buttons;

    	console.log(number_of_buttons, number_of_pages);
    	let buttons_count_array = [];
    	const dispatch = createEventDispatcher();

    	function prev() {
    		$$invalidate(0, current_page -= 1);

    		if (current_page < 0) {
    			$$invalidate(0, current_page = number_of_pages - 1);
    		}
    	}

    	function next() {
    		$$invalidate(0, current_page += 1);

    		if (current_page >= number_of_pages) {
    			$$invalidate(0, current_page = 0);
    		}
    	}

    	function go_to_page(n) {
    		$$invalidate(0, current_page = n);
    	}

    	function pagination_change() {
    		//may be triggered on load and anytime items per page changes or current page or total items
    		dispatch("pagination", {
    			current_page,
    			items_per_page,
    			total_items
    		});
    	}

    	onMount(() => {
    		loaded = true;

    		if (trigger_request_on_load) {
    			console.log("pagination call from onMount");
    			pagination_change();
    		}
    	});

    	const writable_props = [
    		"trigger_request_on_load",
    		"total_items",
    		"current_page",
    		"items_per_page_array",
    		"items_per_page_index",
    		"max_pagination_buttons",
    		"loop",
    		"show_items_range",
    		"show_items_per_page_select",
    		"show_prev",
    		"show_next"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Pag> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		items_per_page_index = select_value(this);
    		$$invalidate(1, items_per_page_index);
    	}

    	const click_handler = () => go_to_page(0);
    	const click_handler_1 = () => go_to_page(number_of_pages - 1);

    	const click_handler_2 = i => {
    		go_to_page(number_of_pages - (number_of_buttons - i));
    	};

    	const click_handler_3 = i => go_to_page(i);

    	const click_handler_4 = i => {
    		go_to_page(i + (current_page - Math.floor(number_of_buttons / 2)));
    	};

    	$$self.$$set = $$props => {
    		if ("trigger_request_on_load" in $$props) $$invalidate(17, trigger_request_on_load = $$props.trigger_request_on_load);
    		if ("total_items" in $$props) $$invalidate(2, total_items = $$props.total_items);
    		if ("current_page" in $$props) $$invalidate(0, current_page = $$props.current_page);
    		if ("items_per_page_array" in $$props) $$invalidate(3, items_per_page_array = $$props.items_per_page_array);
    		if ("items_per_page_index" in $$props) $$invalidate(1, items_per_page_index = $$props.items_per_page_index);
    		if ("max_pagination_buttons" in $$props) $$invalidate(18, max_pagination_buttons = $$props.max_pagination_buttons);
    		if ("loop" in $$props) $$invalidate(4, loop = $$props.loop);
    		if ("show_items_range" in $$props) $$invalidate(5, show_items_range = $$props.show_items_range);
    		if ("show_items_per_page_select" in $$props) $$invalidate(6, show_items_per_page_select = $$props.show_items_per_page_select);
    		if ("show_prev" in $$props) $$invalidate(7, show_prev = $$props.show_prev);
    		if ("show_next" in $$props) $$invalidate(8, show_next = $$props.show_next);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		createEventDispatcher,
    		loaded,
    		trigger_request_on_load,
    		total_items,
    		current_page,
    		items_per_page_array,
    		items_per_page_index,
    		max_pagination_buttons,
    		loop,
    		show_items_range,
    		show_items_per_page_select,
    		show_prev,
    		show_next,
    		items_marker,
    		number_of_buttons,
    		buttons_count_array,
    		dispatch,
    		prev,
    		next,
    		go_to_page,
    		pagination_change,
    		items_per_page,
    		first_page_item,
    		last_page_item,
    		number_of_pages
    	});

    	$$self.$inject_state = $$props => {
    		if ("loaded" in $$props) loaded = $$props.loaded;
    		if ("trigger_request_on_load" in $$props) $$invalidate(17, trigger_request_on_load = $$props.trigger_request_on_load);
    		if ("total_items" in $$props) $$invalidate(2, total_items = $$props.total_items);
    		if ("current_page" in $$props) $$invalidate(0, current_page = $$props.current_page);
    		if ("items_per_page_array" in $$props) $$invalidate(3, items_per_page_array = $$props.items_per_page_array);
    		if ("items_per_page_index" in $$props) $$invalidate(1, items_per_page_index = $$props.items_per_page_index);
    		if ("max_pagination_buttons" in $$props) $$invalidate(18, max_pagination_buttons = $$props.max_pagination_buttons);
    		if ("loop" in $$props) $$invalidate(4, loop = $$props.loop);
    		if ("show_items_range" in $$props) $$invalidate(5, show_items_range = $$props.show_items_range);
    		if ("show_items_per_page_select" in $$props) $$invalidate(6, show_items_per_page_select = $$props.show_items_per_page_select);
    		if ("show_prev" in $$props) $$invalidate(7, show_prev = $$props.show_prev);
    		if ("show_next" in $$props) $$invalidate(8, show_next = $$props.show_next);
    		if ("items_marker" in $$props) $$invalidate(19, items_marker = $$props.items_marker);
    		if ("number_of_buttons" in $$props) $$invalidate(9, number_of_buttons = $$props.number_of_buttons);
    		if ("buttons_count_array" in $$props) $$invalidate(12, buttons_count_array = $$props.buttons_count_array);
    		if ("items_per_page" in $$props) $$invalidate(20, items_per_page = $$props.items_per_page);
    		if ("first_page_item" in $$props) $$invalidate(10, first_page_item = $$props.first_page_item);
    		if ("last_page_item" in $$props) $$invalidate(13, last_page_item = $$props.last_page_item);
    		if ("number_of_pages" in $$props) $$invalidate(11, number_of_pages = $$props.number_of_pages);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*items_per_page_array, items_per_page_index*/ 10) {
    			$$invalidate(20, items_per_page = items_per_page_array[items_per_page_index]);
    		}

    		if ($$self.$$.dirty[0] & /*items_per_page, items_marker*/ 1572864) {
    			/*$: {
    	let n = number_of_buttons;
    	if(show_last && current_page < number_of_pages - number_of_buttons)
    	(max_pagination_buttons == 0 ? 0 : (max_pagination_buttons) + (show_first?2:0) + (show_last?2:0))
    }*/
    			{

    				if (items_per_page !== items_marker) {
    					$$invalidate(0, current_page = 0);
    					$$invalidate(19, items_marker = items_per_page);
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*current_page, items_per_page*/ 1048577) {
    			$$invalidate(10, first_page_item = current_page * items_per_page + 1);
    		}

    		if ($$self.$$.dirty[0] & /*first_page_item, items_per_page, total_items*/ 1049604) {
    			$$invalidate(13, last_page_item = Math.min(first_page_item + items_per_page - 1, total_items));
    		}

    		if ($$self.$$.dirty[0] & /*total_items, items_per_page*/ 1048580) {
    			$$invalidate(11, number_of_pages = Math.ceil(total_items / items_per_page));
    		}

    		if ($$self.$$.dirty[0] & /*items_per_page, current_page*/ 1048577) {
    			{
    				pagination_change();
    			}
    		}

    		if ($$self.$$.dirty[0] & /*max_pagination_buttons, number_of_buttons, number_of_pages*/ 264704) {
    			{
    				$$invalidate(9, number_of_buttons = max_pagination_buttons);

    				if (number_of_buttons > 0) {
    					$$invalidate(12, buttons_count_array = [...Array(Math.min(number_of_buttons, number_of_pages)).keys()]);
    				}
    			}
    		}
    	};

    	return [
    		current_page,
    		items_per_page_index,
    		total_items,
    		items_per_page_array,
    		loop,
    		show_items_range,
    		show_items_per_page_select,
    		show_prev,
    		show_next,
    		number_of_buttons,
    		first_page_item,
    		number_of_pages,
    		buttons_count_array,
    		last_page_item,
    		prev,
    		next,
    		go_to_page,
    		trigger_request_on_load,
    		max_pagination_buttons,
    		items_marker,
    		items_per_page,
    		select_change_handler,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4
    	];
    }

    class Pag extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$1,
    			create_fragment$1,
    			safe_not_equal,
    			{
    				trigger_request_on_load: 17,
    				total_items: 2,
    				current_page: 0,
    				items_per_page_array: 3,
    				items_per_page_index: 1,
    				max_pagination_buttons: 18,
    				loop: 4,
    				show_items_range: 5,
    				show_items_per_page_select: 6,
    				show_prev: 7,
    				show_next: 8
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Pag",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*total_items*/ ctx[2] === undefined && !("total_items" in props)) {
    			console_1$1.warn("<Pag> was created without expected prop 'total_items'");
    		}
    	}

    	get trigger_request_on_load() {
    		throw new Error("<Pag>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set trigger_request_on_load(value) {
    		throw new Error("<Pag>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get total_items() {
    		throw new Error("<Pag>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set total_items(value) {
    		throw new Error("<Pag>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get current_page() {
    		throw new Error("<Pag>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set current_page(value) {
    		throw new Error("<Pag>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get items_per_page_array() {
    		throw new Error("<Pag>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items_per_page_array(value) {
    		throw new Error("<Pag>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get items_per_page_index() {
    		throw new Error("<Pag>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items_per_page_index(value) {
    		throw new Error("<Pag>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get max_pagination_buttons() {
    		throw new Error("<Pag>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set max_pagination_buttons(value) {
    		throw new Error("<Pag>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get loop() {
    		throw new Error("<Pag>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loop(value) {
    		throw new Error("<Pag>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get show_items_range() {
    		throw new Error("<Pag>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set show_items_range(value) {
    		throw new Error("<Pag>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get show_items_per_page_select() {
    		throw new Error("<Pag>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set show_items_per_page_select(value) {
    		throw new Error("<Pag>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get show_prev() {
    		throw new Error("<Pag>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set show_prev(value) {
    		throw new Error("<Pag>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get show_next() {
    		throw new Error("<Pag>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set show_next(value) {
    		throw new Error("<Pag>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Pagination.svelte generated by Svelte v3.35.0 */

    const { console: console_1 } = globals;
    const file = "src/Pagination.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[39] = list[i];
    	return child_ctx;
    }

    // (107:3) {#each demo1show as d}
    function create_each_block(ctx) {
    	let div;
    	let t0;
    	let t1_value = /*d*/ ctx[39] + 1 + "";
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("item ");
    			t1 = text(t1_value);
    			attr_dev(div, "class", "svelte-v6j69p");
    			add_location(div, file, 107, 4, 2520);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*demo1show*/ 1 && t1_value !== (t1_value = /*d*/ ctx[39] + 1 + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(107:3) {#each demo1show as d}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div8;
    	let div2;
    	let div1;
    	let div0;
    	let t0;
    	let pagination0;
    	let t1;
    	let div4;
    	let div3;
    	let t2;
    	let pagination1;
    	let t3;
    	let hr;
    	let t4;
    	let input0;
    	let t5;
    	let br0;
    	let t6;
    	let input1;
    	let t7;
    	let br1;
    	let t8;
    	let input2;
    	let t9;
    	let br2;
    	let t10;
    	let t11;
    	let t12;
    	let br3;
    	let t13;
    	let select;
    	let option0;
    	let t14;
    	let option0_selected_value;
    	let option1;
    	let t15;
    	let option1_selected_value;
    	let option2;
    	let t16;
    	let option2_selected_value;
    	let option3;
    	let t17;
    	let option3_selected_value;
    	let option4;
    	let t18;
    	let option4_selected_value;
    	let option5;
    	let t19;
    	let option5_selected_value;
    	let t20;
    	let div7;
    	let div6;
    	let div5;
    	let t21;
    	let pagination2;
    	let current;
    	let mounted;
    	let dispose;

    	pagination0 = new Pag({
    			props: {
    				total_items: /*total_items2*/ ctx[12],
    				current_page: /*current_page2*/ ctx[13],
    				items_per_page_array: /*items_per_page_array2*/ ctx[14],
    				items_per_page_index: /*items_per_page_index2*/ ctx[15],
    				max_pagination_buttons: /*number_of_buttons2*/ ctx[16],
    				loop: /*loop2*/ ctx[17],
    				show_items_range: /*show_items_range2*/ ctx[18],
    				show_items_per_page_select: /*show_items_per_page_select2*/ ctx[19]
    			},
    			$$inline: true
    		});

    	pagination0.$on("pagination", /*handlePagination2*/ ctx[20]);
    	let each_value = /*demo1show*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	pagination1 = new Pag({
    			props: {
    				total_items: /*total_items1*/ ctx[7],
    				current_page: /*current_page1*/ ctx[8],
    				items_per_page_array: /*items_per_page_array1*/ ctx[9],
    				items_per_page_index: /*items_per_page_index1*/ ctx[10],
    				max_pagination_buttons: /*number_of_buttons1*/ ctx[1],
    				show_items_range: /*show_items_range1*/ ctx[2],
    				show_items_per_page_select: /*show_items_per_page_select1*/ ctx[3],
    				show_prev: /*show_prev_and_next1*/ ctx[4],
    				show_next: /*show_prev_and_next1*/ ctx[4]
    			},
    			$$inline: true
    		});

    	pagination1.$on("pagination", /*handlePagination1*/ ctx[11]);

    	pagination2 = new Pag({
    			props: {
    				total_items: /*total_items3*/ ctx[21],
    				current_page: /*current_page3*/ ctx[22],
    				items_per_page_array: /*items_per_page_array3*/ ctx[23],
    				items_per_page_index: /*items_per_page_index3*/ ctx[24],
    				max_pagination_buttons: /*number_of_buttons3*/ ctx[25],
    				loop: /*loop3*/ ctx[26],
    				show_items_range: /*show_items_range3*/ ctx[27],
    				show_items_per_page_select: /*show_items_per_page_select3*/ ctx[28]
    			},
    			$$inline: true
    		});

    	pagination2.$on("pagination", /*handlePagination3*/ ctx[29]);

    	const block = {
    		c: function create() {
    			div8 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			create_component(pagination0.$$.fragment);
    			t1 = space();
    			div4 = element("div");
    			div3 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			create_component(pagination1.$$.fragment);
    			t3 = space();
    			hr = element("hr");
    			t4 = space();
    			input0 = element("input");
    			t5 = text(" Show items range");
    			br0 = element("br");
    			t6 = space();
    			input1 = element("input");
    			t7 = text(" Show items per page");
    			br1 = element("br");
    			t8 = space();
    			input2 = element("input");
    			t9 = text(" Show prev and next");
    			br2 = element("br");
    			t10 = space();
    			t11 = text(/*number_of_buttons1*/ ctx[1]);
    			t12 = text(" Number of buttons");
    			br3 = element("br");
    			t13 = space();
    			select = element("select");
    			option0 = element("option");
    			t14 = text("0");
    			option1 = element("option");
    			t15 = text("1");
    			option2 = element("option");
    			t16 = text("5");
    			option3 = element("option");
    			t17 = text("7");
    			option4 = element("option");
    			t18 = text("9");
    			option5 = element("option");
    			t19 = text("11");
    			t20 = space();
    			div7 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			t21 = space();
    			create_component(pagination2.$$.fragment);
    			attr_dev(div0, "class", "svelte-v6j69p");
    			add_location(div0, file, 85, 3, 2018);
    			attr_dev(div1, "class", "demo2 svelte-v6j69p");
    			add_location(div1, file, 84, 2, 1995);
    			attr_dev(div2, "class", "narrow svelte-v6j69p");
    			add_location(div2, file, 82, 1, 1969);
    			attr_dev(div3, "class", "demo1 svelte-v6j69p");
    			add_location(div3, file, 105, 2, 2470);
    			attr_dev(hr, "class", "svelte-v6j69p");
    			add_location(hr, file, 125, 2, 3014);
    			attr_dev(input0, "type", "checkbox");
    			add_location(input0, file, 126, 2, 3021);
    			add_location(br0, file, 126, 75, 3094);
    			attr_dev(input1, "type", "checkbox");
    			add_location(input1, file, 127, 2, 3101);
    			add_location(br1, file, 127, 88, 3187);
    			attr_dev(input2, "type", "checkbox");
    			add_location(input2, file, 128, 2, 3194);
    			add_location(br2, file, 128, 79, 3271);
    			add_location(br3, file, 129, 40, 3316);
    			option0.__value = "0";
    			option0.value = option0.__value;
    			option0.selected = option0_selected_value = /*number_of_buttons1*/ ctx[1] == 0;
    			add_location(option0, file, 131, 3, 3367);
    			option1.__value = "1";
    			option1.value = option1.__value;
    			option1.selected = option1_selected_value = /*number_of_buttons1*/ ctx[1] == 1;
    			add_location(option1, file, 132, 3, 3432);
    			option2.__value = "5";
    			option2.value = option2.__value;
    			option2.selected = option2_selected_value = /*number_of_buttons1*/ ctx[1] == 5;
    			add_location(option2, file, 133, 3, 3497);
    			option3.__value = "7";
    			option3.value = option3.__value;
    			option3.selected = option3_selected_value = /*number_of_buttons1*/ ctx[1] == 7;
    			add_location(option3, file, 134, 3, 3562);
    			option4.__value = "9";
    			option4.value = option4.__value;
    			option4.selected = option4_selected_value = /*number_of_buttons1*/ ctx[1] == 9;
    			add_location(option4, file, 135, 3, 3627);
    			option5.__value = "11";
    			option5.value = option5.__value;
    			option5.selected = option5_selected_value = /*number_of_buttons1*/ ctx[1] == 11;
    			add_location(option5, file, 136, 3, 3692);
    			attr_dev(select, "class", "svelte-v6j69p");
    			if (/*number_of_buttons1*/ ctx[1] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[34].call(select));
    			add_location(select, file, 130, 2, 3323);
    			attr_dev(div4, "class", "wide svelte-v6j69p");
    			add_location(div4, file, 104, 1, 2449);
    			attr_dev(div5, "class", "svelte-v6j69p");
    			add_location(div5, file, 141, 3, 3809);
    			attr_dev(div6, "class", "demo3 svelte-v6j69p");
    			add_location(div6, file, 140, 2, 3786);
    			attr_dev(div7, "class", "svelte-v6j69p");
    			add_location(div7, file, 139, 1, 3778);
    			attr_dev(div8, "class", "page svelte-v6j69p");
    			add_location(div8, file, 81, 0, 1949);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div8, anchor);
    			append_dev(div8, div2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			/*div0_binding*/ ctx[30](div0);
    			append_dev(div2, t0);
    			mount_component(pagination0, div2, null);
    			append_dev(div8, t1);
    			append_dev(div8, div4);
    			append_dev(div4, div3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div3, null);
    			}

    			append_dev(div4, t2);
    			mount_component(pagination1, div4, null);
    			append_dev(div4, t3);
    			append_dev(div4, hr);
    			append_dev(div4, t4);
    			append_dev(div4, input0);
    			input0.checked = /*show_items_range1*/ ctx[2];
    			append_dev(div4, t5);
    			append_dev(div4, br0);
    			append_dev(div4, t6);
    			append_dev(div4, input1);
    			input1.checked = /*show_items_per_page_select1*/ ctx[3];
    			append_dev(div4, t7);
    			append_dev(div4, br1);
    			append_dev(div4, t8);
    			append_dev(div4, input2);
    			input2.checked = /*show_prev_and_next1*/ ctx[4];
    			append_dev(div4, t9);
    			append_dev(div4, br2);
    			append_dev(div4, t10);
    			append_dev(div4, t11);
    			append_dev(div4, t12);
    			append_dev(div4, br3);
    			append_dev(div4, t13);
    			append_dev(div4, select);
    			append_dev(select, option0);
    			append_dev(option0, t14);
    			append_dev(select, option1);
    			append_dev(option1, t15);
    			append_dev(select, option2);
    			append_dev(option2, t16);
    			append_dev(select, option3);
    			append_dev(option3, t17);
    			append_dev(select, option4);
    			append_dev(option4, t18);
    			append_dev(select, option5);
    			append_dev(option5, t19);
    			select_option(select, /*number_of_buttons1*/ ctx[1]);
    			append_dev(div8, t20);
    			append_dev(div8, div7);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			/*div5_binding*/ ctx[35](div5);
    			append_dev(div7, t21);
    			mount_component(pagination2, div7, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "change", /*input0_change_handler*/ ctx[31]),
    					listen_dev(input1, "change", /*input1_change_handler*/ ctx[32]),
    					listen_dev(input2, "change", /*input2_change_handler*/ ctx[33]),
    					listen_dev(select, "change", /*select_change_handler*/ ctx[34])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*demo1show*/ 1) {
    				each_value = /*demo1show*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div3, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			const pagination1_changes = {};
    			if (dirty[0] & /*number_of_buttons1*/ 2) pagination1_changes.max_pagination_buttons = /*number_of_buttons1*/ ctx[1];
    			if (dirty[0] & /*show_items_range1*/ 4) pagination1_changes.show_items_range = /*show_items_range1*/ ctx[2];
    			if (dirty[0] & /*show_items_per_page_select1*/ 8) pagination1_changes.show_items_per_page_select = /*show_items_per_page_select1*/ ctx[3];
    			if (dirty[0] & /*show_prev_and_next1*/ 16) pagination1_changes.show_prev = /*show_prev_and_next1*/ ctx[4];
    			if (dirty[0] & /*show_prev_and_next1*/ 16) pagination1_changes.show_next = /*show_prev_and_next1*/ ctx[4];
    			pagination1.$set(pagination1_changes);

    			if (dirty[0] & /*show_items_range1*/ 4) {
    				input0.checked = /*show_items_range1*/ ctx[2];
    			}

    			if (dirty[0] & /*show_items_per_page_select1*/ 8) {
    				input1.checked = /*show_items_per_page_select1*/ ctx[3];
    			}

    			if (dirty[0] & /*show_prev_and_next1*/ 16) {
    				input2.checked = /*show_prev_and_next1*/ ctx[4];
    			}

    			if (!current || dirty[0] & /*number_of_buttons1*/ 2) set_data_dev(t11, /*number_of_buttons1*/ ctx[1]);

    			if (!current || dirty[0] & /*number_of_buttons1*/ 2 && option0_selected_value !== (option0_selected_value = /*number_of_buttons1*/ ctx[1] == 0)) {
    				prop_dev(option0, "selected", option0_selected_value);
    			}

    			if (!current || dirty[0] & /*number_of_buttons1*/ 2 && option1_selected_value !== (option1_selected_value = /*number_of_buttons1*/ ctx[1] == 1)) {
    				prop_dev(option1, "selected", option1_selected_value);
    			}

    			if (!current || dirty[0] & /*number_of_buttons1*/ 2 && option2_selected_value !== (option2_selected_value = /*number_of_buttons1*/ ctx[1] == 5)) {
    				prop_dev(option2, "selected", option2_selected_value);
    			}

    			if (!current || dirty[0] & /*number_of_buttons1*/ 2 && option3_selected_value !== (option3_selected_value = /*number_of_buttons1*/ ctx[1] == 7)) {
    				prop_dev(option3, "selected", option3_selected_value);
    			}

    			if (!current || dirty[0] & /*number_of_buttons1*/ 2 && option4_selected_value !== (option4_selected_value = /*number_of_buttons1*/ ctx[1] == 9)) {
    				prop_dev(option4, "selected", option4_selected_value);
    			}

    			if (!current || dirty[0] & /*number_of_buttons1*/ 2 && option5_selected_value !== (option5_selected_value = /*number_of_buttons1*/ ctx[1] == 11)) {
    				prop_dev(option5, "selected", option5_selected_value);
    			}

    			if (dirty[0] & /*number_of_buttons1*/ 2) {
    				select_option(select, /*number_of_buttons1*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(pagination0.$$.fragment, local);
    			transition_in(pagination1.$$.fragment, local);
    			transition_in(pagination2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(pagination0.$$.fragment, local);
    			transition_out(pagination1.$$.fragment, local);
    			transition_out(pagination2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div8);
    			/*div0_binding*/ ctx[30](null);
    			destroy_component(pagination0);
    			destroy_each(each_blocks, detaching);
    			destroy_component(pagination1);
    			/*div5_binding*/ ctx[35](null);
    			destroy_component(pagination2);
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
    	validate_slots("Pagination", slots, []);
    	let demo1 = [...Array(927).keys()];
    	let demo1show = demo1.slice(0);

    	//vars
    	let total_items1 = demo1.length;

    	let current_page1 = 0;
    	let items_per_page_array1 = [5, 10, 20, 50, 100, 500, 1000];
    	let items_per_page_index1 = 4;
    	let number_of_buttons1 = 7;

    	//show config 
    	let show_items_range1 = true;

    	let show_items_per_page_select1 = true;
    	let show_prev_and_next1 = true;

    	//functions
    	function handlePagination1(event) {
    		console.log("1", event.detail);
    		let start = event.detail.items_per_page * event.detail.current_page;
    		let end = start + event.detail.items_per_page;
    		$$invalidate(0, demo1show = demo1.slice(start, end));
    	}

    	/*
    	DEMO2
    */
    	let demo2 = [
    		"./images/corp/eco_corporate_presentation1.jpg",
    		"./images/corp/eco_corporate_presentation2.jpg",
    		"./images/corp/eco_corporate_presentation3.jpg"
    	];

    	let img;

    	//vars
    	let total_items2 = demo2.length;

    	let current_page2 = 0;
    	let items_per_page_array2 = [1];
    	let items_per_page_index2 = 0;
    	let number_of_buttons2 = 0;
    	let loop2 = true;
    	let show_items_range2 = false;
    	let show_items_per_page_select2 = false;

    	//functions
    	function handlePagination2(event) {
    		console.log("2", event.detail);
    		$$invalidate(5, img.style.backgroundImage = "url('" + demo2[event.detail.current_page] + "')", img);
    	}

    	/*
    	DEMO3
    */
    	let demo3 = [
    		"./images/corp/eco_corporate_presentation1.jpg",
    		"./images/corp/eco_corporate_presentation2.jpg",
    		"./images/corp/eco_corporate_presentation3.jpg"
    	];

    	let img3;

    	//vars
    	let total_items3 = demo3.length;

    	let current_page3 = 0;
    	let items_per_page_array3 = [1];
    	let items_per_page_index3 = 0;
    	let number_of_buttons3 = 1;
    	let loop3 = true;
    	let show_items_range3 = false;
    	let show_items_per_page_select3 = false;

    	//functions
    	function handlePagination3(event) {
    		console.log("3", event.detail);
    		$$invalidate(6, img3.style.backgroundImage = "url('" + demo2[event.detail.current_page] + "')", img3);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Pagination> was created with unknown prop '${key}'`);
    	});

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			img = $$value;
    			$$invalidate(5, img);
    		});
    	}

    	function input0_change_handler() {
    		show_items_range1 = this.checked;
    		$$invalidate(2, show_items_range1);
    	}

    	function input1_change_handler() {
    		show_items_per_page_select1 = this.checked;
    		$$invalidate(3, show_items_per_page_select1);
    	}

    	function input2_change_handler() {
    		show_prev_and_next1 = this.checked;
    		$$invalidate(4, show_prev_and_next1);
    	}

    	function select_change_handler() {
    		number_of_buttons1 = select_value(this);
    		$$invalidate(1, number_of_buttons1);
    	}

    	function div5_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			img3 = $$value;
    			$$invalidate(6, img3);
    		});
    	}

    	$$self.$capture_state = () => ({
    		Pagination: Pag,
    		demo1,
    		demo1show,
    		total_items1,
    		current_page1,
    		items_per_page_array1,
    		items_per_page_index1,
    		number_of_buttons1,
    		show_items_range1,
    		show_items_per_page_select1,
    		show_prev_and_next1,
    		handlePagination1,
    		demo2,
    		img,
    		total_items2,
    		current_page2,
    		items_per_page_array2,
    		items_per_page_index2,
    		number_of_buttons2,
    		loop2,
    		show_items_range2,
    		show_items_per_page_select2,
    		handlePagination2,
    		demo3,
    		img3,
    		total_items3,
    		current_page3,
    		items_per_page_array3,
    		items_per_page_index3,
    		number_of_buttons3,
    		loop3,
    		show_items_range3,
    		show_items_per_page_select3,
    		handlePagination3
    	});

    	$$self.$inject_state = $$props => {
    		if ("demo1" in $$props) demo1 = $$props.demo1;
    		if ("demo1show" in $$props) $$invalidate(0, demo1show = $$props.demo1show);
    		if ("total_items1" in $$props) $$invalidate(7, total_items1 = $$props.total_items1);
    		if ("current_page1" in $$props) $$invalidate(8, current_page1 = $$props.current_page1);
    		if ("items_per_page_array1" in $$props) $$invalidate(9, items_per_page_array1 = $$props.items_per_page_array1);
    		if ("items_per_page_index1" in $$props) $$invalidate(10, items_per_page_index1 = $$props.items_per_page_index1);
    		if ("number_of_buttons1" in $$props) $$invalidate(1, number_of_buttons1 = $$props.number_of_buttons1);
    		if ("show_items_range1" in $$props) $$invalidate(2, show_items_range1 = $$props.show_items_range1);
    		if ("show_items_per_page_select1" in $$props) $$invalidate(3, show_items_per_page_select1 = $$props.show_items_per_page_select1);
    		if ("show_prev_and_next1" in $$props) $$invalidate(4, show_prev_and_next1 = $$props.show_prev_and_next1);
    		if ("demo2" in $$props) demo2 = $$props.demo2;
    		if ("img" in $$props) $$invalidate(5, img = $$props.img);
    		if ("total_items2" in $$props) $$invalidate(12, total_items2 = $$props.total_items2);
    		if ("current_page2" in $$props) $$invalidate(13, current_page2 = $$props.current_page2);
    		if ("items_per_page_array2" in $$props) $$invalidate(14, items_per_page_array2 = $$props.items_per_page_array2);
    		if ("items_per_page_index2" in $$props) $$invalidate(15, items_per_page_index2 = $$props.items_per_page_index2);
    		if ("number_of_buttons2" in $$props) $$invalidate(16, number_of_buttons2 = $$props.number_of_buttons2);
    		if ("loop2" in $$props) $$invalidate(17, loop2 = $$props.loop2);
    		if ("show_items_range2" in $$props) $$invalidate(18, show_items_range2 = $$props.show_items_range2);
    		if ("show_items_per_page_select2" in $$props) $$invalidate(19, show_items_per_page_select2 = $$props.show_items_per_page_select2);
    		if ("demo3" in $$props) demo3 = $$props.demo3;
    		if ("img3" in $$props) $$invalidate(6, img3 = $$props.img3);
    		if ("total_items3" in $$props) $$invalidate(21, total_items3 = $$props.total_items3);
    		if ("current_page3" in $$props) $$invalidate(22, current_page3 = $$props.current_page3);
    		if ("items_per_page_array3" in $$props) $$invalidate(23, items_per_page_array3 = $$props.items_per_page_array3);
    		if ("items_per_page_index3" in $$props) $$invalidate(24, items_per_page_index3 = $$props.items_per_page_index3);
    		if ("number_of_buttons3" in $$props) $$invalidate(25, number_of_buttons3 = $$props.number_of_buttons3);
    		if ("loop3" in $$props) $$invalidate(26, loop3 = $$props.loop3);
    		if ("show_items_range3" in $$props) $$invalidate(27, show_items_range3 = $$props.show_items_range3);
    		if ("show_items_per_page_select3" in $$props) $$invalidate(28, show_items_per_page_select3 = $$props.show_items_per_page_select3);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		demo1show,
    		number_of_buttons1,
    		show_items_range1,
    		show_items_per_page_select1,
    		show_prev_and_next1,
    		img,
    		img3,
    		total_items1,
    		current_page1,
    		items_per_page_array1,
    		items_per_page_index1,
    		handlePagination1,
    		total_items2,
    		current_page2,
    		items_per_page_array2,
    		items_per_page_index2,
    		number_of_buttons2,
    		loop2,
    		show_items_range2,
    		show_items_per_page_select2,
    		handlePagination2,
    		total_items3,
    		current_page3,
    		items_per_page_array3,
    		items_per_page_index3,
    		number_of_buttons3,
    		loop3,
    		show_items_range3,
    		show_items_per_page_select3,
    		handlePagination3,
    		div0_binding,
    		input0_change_handler,
    		input1_change_handler,
    		input2_change_handler,
    		select_change_handler,
    		div5_binding
    	];
    }

    class Pagination_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {}, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Pagination_1",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new Pagination_1({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=pagination.js.map
