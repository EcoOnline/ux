
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

    /* src/Multiselect-item.svelte generated by Svelte v3.35.0 */
    const file$1 = "src/Multiselect-item.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	child_ctx[14] = list;
    	child_ctx[15] = i;
    	return child_ctx;
    }

    // (23:0) {#if items.length}
    function create_if_block$1(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*items*/ ctx[0];
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
    			if (dirty & /*items, indent_next, search_word, indentW, bubbleCheck, indent, alert, handleCheck, JSON*/ 127) {
    				each_value = /*items*/ ctx[0];
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
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(23:0) {#if items.length}",
    		ctx
    	});

    	return block;
    }

    // (25:8) {#if search_word == '' || item.name.startsWith(search_word) || JSON.stringify(item.children).indexOf('"name":"' + search_word)>=0}
    function create_if_block_1$1(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let show_if;
    	let t2;
    	let if_block3_anchor;
    	let current;
    	let if_block0 = /*item*/ ctx[13].children.length && create_if_block_6(ctx);
    	let if_block1 = /*item*/ ctx[13].permission && create_if_block_4(ctx);

    	function select_block_type_2(ctx, dirty) {
    		if (show_if == null || dirty & /*search_word, items*/ 9) show_if = !!(/*search_word*/ ctx[3] == "" || /*item*/ ctx[13].name.indexOf(/*search_word*/ ctx[3]) !== 0);
    		if (show_if) return create_if_block_3$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type_2(ctx, -1);
    	let if_block2 = current_block_type(ctx);
    	let if_block3 = (/*item*/ ctx[13].open || /*search_word*/ ctx[3] !== "") && create_if_block_2$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if_block2.c();
    			t2 = space();
    			if (if_block3) if_block3.c();
    			if_block3_anchor = empty();
    			attr_dev(div, "class", "dropdown-item svelte-ib82xs");
    			set_style(div, "margin-left", /*indentW*/ ctx[2] * /*indent*/ ctx[1] + "px");
    			add_location(div, file$1, 25, 12, 693);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t0);
    			if (if_block1) if_block1.m(div, null);
    			append_dev(div, t1);
    			if_block2.m(div, null);
    			insert_dev(target, t2, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert_dev(target, if_block3_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*item*/ ctx[13].children.length) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_6(ctx);
    					if_block0.c();
    					if_block0.m(div, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*item*/ ctx[13].permission) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_4(ctx);
    					if_block1.c();
    					if_block1.m(div, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (current_block_type === (current_block_type = select_block_type_2(ctx, dirty)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(div, null);
    				}
    			}

    			if (!current || dirty & /*indentW, indent*/ 6) {
    				set_style(div, "margin-left", /*indentW*/ ctx[2] * /*indent*/ ctx[1] + "px");
    			}

    			if (/*item*/ ctx[13].open || /*search_word*/ ctx[3] !== "") {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty & /*items, search_word*/ 9) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block_2$1(ctx);
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
    			if_block2.d();
    			if (detaching) detach_dev(t2);
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach_dev(if_block3_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(25:8) {#if search_word == '' || item.name.startsWith(search_word) || JSON.stringify(item.children).indexOf('\\\"name\\\":\\\"' + search_word)>=0}",
    		ctx
    	});

    	return block;
    }

    // (27:16) {#if item.children.length}
    function create_if_block_6(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*item*/ ctx[13].open || /*search_word*/ ctx[3] !== "") return create_if_block_7;
    		return create_else_block_2;
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
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(27:16) {#if item.children.length}",
    		ctx
    	});

    	return block;
    }

    // (32:20) {:else}
    function create_else_block_2(ctx) {
    	let svg;
    	let polygon;
    	let mounted;
    	let dispose;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[8](/*item*/ ctx[13], /*each_value*/ ctx[14], /*item_index*/ ctx[15]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			polygon = svg_element("polygon");
    			attr_dev(polygon, "points", "16,22 6,12 7.4,10.6 16,19.2 24.6,10.6 26,12 ");
    			add_location(polygon, file$1, 33, 28, 1608);
    			attr_dev(svg, "width", "24");
    			attr_dev(svg, "height", "24");
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "x", "0px");
    			attr_dev(svg, "y", "0px");
    			attr_dev(svg, "viewBox", "0 0 32 32");
    			set_style(svg, "enable-background", "new 0 0 32 32");
    			attr_dev(svg, "xml:space", "preserve");
    			attr_dev(svg, "class", "svelte-ib82xs");
    			add_location(svg, file$1, 32, 24, 1321);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, polygon);

    			if (!mounted) {
    				dispose = listen_dev(svg, "click", click_handler_1, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(32:20) {:else}",
    		ctx
    	});

    	return block;
    }

    // (28:20) {#if item.open || search_word !== ''}
    function create_if_block_7(ctx) {
    	let svg;
    	let polygon;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[7](/*item*/ ctx[13], /*each_value*/ ctx[14], /*item_index*/ ctx[15]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			polygon = svg_element("polygon");
    			attr_dev(polygon, "points", "16,10 26,20 24.6,21.4 16,12.8 7.4,21.4 6,20 ");
    			add_location(polygon, file$1, 29, 28, 1173);
    			attr_dev(svg, "width", "24");
    			attr_dev(svg, "height", "24");
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "x", "0px");
    			attr_dev(svg, "y", "0px");
    			attr_dev(svg, "viewBox", "0 0 32 32");
    			set_style(svg, "enable-background", "new 0 0 32 32");
    			attr_dev(svg, "xml:space", "preserve");
    			attr_dev(svg, "class", "svelte-ib82xs");
    			add_location(svg, file$1, 28, 24, 885);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, polygon);

    			if (!mounted) {
    				dispose = listen_dev(svg, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(28:20) {#if item.open || search_word !== ''}",
    		ctx
    	});

    	return block;
    }

    // (38:16) {#if item.permission}
    function create_if_block_4(ctx) {
    	let if_block_anchor;

    	function select_block_type_1(ctx, dirty) {
    		if (/*item*/ ctx[13].disabled) return create_if_block_5;
    		return create_else_block_1$1;
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
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(38:16) {#if item.permission}",
    		ctx
    	});

    	return block;
    }

    // (41:20) {:else}
    function create_else_block_1$1(ctx) {
    	let input;
    	let input_disabled_value;
    	let mounted;
    	let dispose;

    	function input_change_handler() {
    		/*input_change_handler*/ ctx[10].call(input, /*each_value*/ ctx[14], /*item_index*/ ctx[15]);
    	}

    	function change_handler() {
    		return /*change_handler*/ ctx[11](/*item*/ ctx[13]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "checkbox");
    			input.disabled = input_disabled_value = /*item*/ ctx[13].disabled;
    			attr_dev(input, "class", "svelte-ib82xs");
    			add_location(input, file$1, 41, 24, 2004);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			input.checked = /*item*/ ctx[13].checked;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", input_change_handler),
    					listen_dev(input, "change", change_handler, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*items*/ 1 && input_disabled_value !== (input_disabled_value = /*item*/ ctx[13].disabled)) {
    				prop_dev(input, "disabled", input_disabled_value);
    			}

    			if (dirty & /*items*/ 1) {
    				input.checked = /*item*/ ctx[13].checked;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$1.name,
    		type: "else",
    		source: "(41:20) {:else}",
    		ctx
    	});

    	return block;
    }

    // (39:20) {#if item.disabled}
    function create_if_block_5(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "fake-checkbox svelte-ib82xs");
    			add_location(div, file$1, 39, 24, 1856);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler_2*/ ctx[9], false, false, false);
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
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(39:20) {#if item.disabled}",
    		ctx
    	});

    	return block;
    }

    // (47:16) {:else}
    function create_else_block$1(ctx) {
    	let b;
    	let t0;
    	let t1_value = /*item*/ ctx[13].name.substr(/*search_word*/ ctx[3].length) + "";
    	let t1;

    	const block = {
    		c: function create() {
    			b = element("b");
    			t0 = text(/*search_word*/ ctx[3]);
    			t1 = text(t1_value);
    			add_location(b, file$1, 47, 20, 2327);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, b, anchor);
    			append_dev(b, t0);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*search_word*/ 8) set_data_dev(t0, /*search_word*/ ctx[3]);
    			if (dirty & /*items, search_word*/ 9 && t1_value !== (t1_value = /*item*/ ctx[13].name.substr(/*search_word*/ ctx[3].length) + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(b);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(47:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (45:16) {#if search_word == '' || item.name.indexOf(search_word) !== 0}
    function create_if_block_3$1(ctx) {
    	let t_value = /*item*/ ctx[13].name + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*items*/ 1 && t_value !== (t_value = /*item*/ ctx[13].name + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(45:16) {#if search_word == '' || item.name.indexOf(search_word) !== 0}",
    		ctx
    	});

    	return block;
    }

    // (52:12) {#if item.open || search_word !== ''}
    function create_if_block_2$1(ctx) {
    	let items_1;
    	let current;

    	items_1 = new Multiselect_item({
    			props: {
    				items: /*item*/ ctx[13].children.sort(func),
    				indent: /*indent_next*/ ctx[4],
    				search_word: /*search_word*/ ctx[3],
    				indentW: /*indentW*/ ctx[2]
    			},
    			$$inline: true
    		});

    	items_1.$on("handleCheck", /*bubbleCheck*/ ctx[6]);

    	const block = {
    		c: function create() {
    			create_component(items_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(items_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const items_1_changes = {};
    			if (dirty & /*items*/ 1) items_1_changes.items = /*item*/ ctx[13].children.sort(func);
    			if (dirty & /*indent_next*/ 16) items_1_changes.indent = /*indent_next*/ ctx[4];
    			if (dirty & /*search_word*/ 8) items_1_changes.search_word = /*search_word*/ ctx[3];
    			if (dirty & /*indentW*/ 4) items_1_changes.indentW = /*indentW*/ ctx[2];
    			items_1.$set(items_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(items_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(items_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(items_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(52:12) {#if item.open || search_word !== ''}",
    		ctx
    	});

    	return block;
    }

    // (24:4) {#each items as item }
    function create_each_block$1(ctx) {
    	let show_if = /*search_word*/ ctx[3] == "" || /*item*/ ctx[13].name.startsWith(/*search_word*/ ctx[3]) || JSON.stringify(/*item*/ ctx[13].children).indexOf("\"name\":\"" + /*search_word*/ ctx[3]) >= 0;
    	let if_block_anchor;
    	let current;
    	let if_block = show_if && create_if_block_1$1(ctx);

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
    			if (dirty & /*search_word, items*/ 9) show_if = /*search_word*/ ctx[3] == "" || /*item*/ ctx[13].name.startsWith(/*search_word*/ ctx[3]) || JSON.stringify(/*item*/ ctx[13].children).indexOf("\"name\":\"" + /*search_word*/ ctx[3]) >= 0;

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*search_word, items*/ 9) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$1(ctx);
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
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(24:4) {#each items as item }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*items*/ ctx[0].length && create_if_block$1(ctx);

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
    			if (/*items*/ ctx[0].length) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*items*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
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
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const func = function (a, b) {
    	return a.name.toLowerCase() < b.name.toLowerCase();
    };

    function instance$1($$self, $$props, $$invalidate) {
    	let indent_next;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Multiselect_item", slots, []);
    	const dispatch = createEventDispatcher();
    	let { items = [] } = $$props;
    	let { indent = 0 } = $$props;
    	let { indentW = 0 } = $$props;
    	let { search_word = "" } = $$props;

    	function handleCheck(item) {
    		dispatch("handleCheck", item);
    	}

    	function bubbleCheck(event) {
    		dispatch("handleCheck", event.detail);
    	}

    	const writable_props = ["items", "indent", "indentW", "search_word"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Multiselect_item> was created with unknown prop '${key}'`);
    	});

    	const click_handler = (item, each_value, item_index) => {
    		$$invalidate(0, each_value[item_index].open = false, items);
    	};

    	const click_handler_1 = (item, each_value, item_index) => {
    		$$invalidate(0, each_value[item_index].open = true, items);
    	};

    	const click_handler_2 = () => {
    		alert("Items must be on the same level");
    	};

    	function input_change_handler(each_value, item_index) {
    		each_value[item_index].checked = this.checked;
    		$$invalidate(0, items);
    	}

    	const change_handler = item => {
    		handleCheck(item);
    	};

    	$$self.$$set = $$props => {
    		if ("items" in $$props) $$invalidate(0, items = $$props.items);
    		if ("indent" in $$props) $$invalidate(1, indent = $$props.indent);
    		if ("indentW" in $$props) $$invalidate(2, indentW = $$props.indentW);
    		if ("search_word" in $$props) $$invalidate(3, search_word = $$props.search_word);
    	};

    	$$self.$capture_state = () => ({
    		Items: Multiselect_item,
    		createEventDispatcher,
    		dispatch,
    		items,
    		indent,
    		indentW,
    		search_word,
    		handleCheck,
    		bubbleCheck,
    		indent_next
    	});

    	$$self.$inject_state = $$props => {
    		if ("items" in $$props) $$invalidate(0, items = $$props.items);
    		if ("indent" in $$props) $$invalidate(1, indent = $$props.indent);
    		if ("indentW" in $$props) $$invalidate(2, indentW = $$props.indentW);
    		if ("search_word" in $$props) $$invalidate(3, search_word = $$props.search_word);
    		if ("indent_next" in $$props) $$invalidate(4, indent_next = $$props.indent_next);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*indent*/ 2) {
    			$$invalidate(4, indent_next = parseInt(indent, 10) + 1);
    		}
    	};

    	return [
    		items,
    		indent,
    		indentW,
    		search_word,
    		indent_next,
    		handleCheck,
    		bubbleCheck,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		input_change_handler,
    		change_handler
    	];
    }

    class Multiselect_item extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			items: 0,
    			indent: 1,
    			indentW: 2,
    			search_word: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Multiselect_item",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get items() {
    		throw new Error("<Multiselect_item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<Multiselect_item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get indent() {
    		throw new Error("<Multiselect_item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set indent(value) {
    		throw new Error("<Multiselect_item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get indentW() {
    		throw new Error("<Multiselect_item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set indentW(value) {
    		throw new Error("<Multiselect_item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get search_word() {
    		throw new Error("<Multiselect_item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set search_word(value) {
    		throw new Error("<Multiselect_item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Multiselect.svelte generated by Svelte v3.35.0 */

    const { console: console_1 } = globals;
    const file = "src/Multiselect.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i];
    	child_ctx[20] = list;
    	child_ctx[21] = i;
    	return child_ctx;
    }

    // (338:12) {:else}
    function create_else_block_1(ctx) {
    	let svg;
    	let polygon;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			polygon = svg_element("polygon");
    			attr_dev(polygon, "points", "16,22 6,12 7.4,10.6 16,19.2 24.6,10.6 26,12 ");
    			add_location(polygon, file, 339, 20, 6983);
    			attr_dev(svg, "width", "24");
    			attr_dev(svg, "height", "24");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 32 32");
    			attr_dev(svg, "class", "svelte-10uilbs");
    			add_location(svg, file, 338, 16, 6879);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, polygon);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(338:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (334:12) {#if dd_open}
    function create_if_block_3(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M29,27.5859l-7.5521-7.5521a11.0177,11.0177,0,1,0-1.4141,1.4141L27.5859,29ZM4,13a9,9,0,1,1,9,9A9.01,9.01,0,0,1,4,13Z");
    			attr_dev(path, "transform", "translate(0 0)");
    			add_location(path, file, 335, 20, 6665);
    			attr_dev(svg, "width", "24");
    			attr_dev(svg, "height", "24");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 32 32");
    			attr_dev(svg, "class", "svelte-10uilbs");
    			add_location(svg, file, 334, 16, 6561);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(334:12) {#if dd_open}",
    		ctx
    	});

    	return block;
    }

    // (350:5) {:else}
    function create_else_block(ctx) {
    	let polygon;

    	const block = {
    		c: function create() {
    			polygon = svg_element("polygon");
    			attr_dev(polygon, "points", "16,22 6,12 7.4,10.6 16,19.2 24.6,10.6 26,12 ");
    			add_location(polygon, file, 350, 6, 7544);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, polygon, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(polygon);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(350:5) {:else}",
    		ctx
    	});

    	return block;
    }

    // (348:5) {#if global_open}
    function create_if_block_2(ctx) {
    	let polygon;

    	const block = {
    		c: function create() {
    			polygon = svg_element("polygon");
    			attr_dev(polygon, "points", "16,10 26,20 24.6,21.4 16,12.8 7.4,21.4 6,20 ");
    			add_location(polygon, file, 348, 6, 7460);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, polygon, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(polygon);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(348:5) {#if global_open}",
    		ctx
    	});

    	return block;
    }

    // (363:29) 
    function create_if_block_1(ctx) {
    	let div;
    	let t0;
    	let t1_value = /*checked_set*/ ctx[4].length - 2 + "";
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("+");
    			t1 = text(t1_value);
    			attr_dev(div, "class", "badge end svelte-10uilbs");
    			add_location(div, file, 363, 12, 8219);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*checked_set*/ 16 && t1_value !== (t1_value = /*checked_set*/ ctx[4].length - 2 + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(363:29) ",
    		ctx
    	});

    	return block;
    }

    // (359:8) {#if index < 2}
    function create_if_block(ctx) {
    	let div;
    	let t0_value = /*item*/ ctx[19].name + "";
    	let t0;
    	let t1;
    	let svg;
    	let polygon;
    	let t2;
    	let mounted;
    	let dispose;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[13](/*item*/ ctx[19], /*each_value*/ ctx[20], /*index*/ ctx[21]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			svg = svg_element("svg");
    			polygon = svg_element("polygon");
    			t2 = space();
    			attr_dev(polygon, "points", "24 9.4 22.6 8 16 14.6 9.4 8 8 9.4 14.6 16 8 22.6 9.4 24 16 17.4 22.6 24 24 22.6 17.4 16 24 9.4");
    			add_location(polygon, file, 360, 99, 8037);
    			attr_dev(svg, "width", "20");
    			attr_dev(svg, "height", "20");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 32 32");
    			attr_dev(svg, "class", "svelte-10uilbs");
    			add_location(svg, file, 360, 16, 7954);
    			attr_dev(div, "class", "badge svelte-10uilbs");
    			add_location(div, file, 359, 12, 7839);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, svg);
    			append_dev(svg, polygon);
    			append_dev(div, t2);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", stop_propagation(click_handler_1), false, false, true);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*checked_set*/ 16 && t0_value !== (t0_value = /*item*/ ctx[19].name + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(359:8) {#if index < 2}",
    		ctx
    	});

    	return block;
    }

    // (358:4) {#each checked_set as item, index}
    function create_each_block(ctx) {
    	let if_block_anchor;

    	function select_block_type_2(ctx, dirty) {
    		if (/*index*/ ctx[21] < 2) return create_if_block;
    		if (/*index*/ ctx[21] == 2) return create_if_block_1;
    	}

    	let current_block_type = select_block_type_2(ctx);
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
    			if (if_block) if_block.p(ctx, dirty);
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
    		id: create_each_block.name,
    		type: "each",
    		source: "(358:4) {#each checked_set as item, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div4;
    	let div3;
    	let div0;
    	let input;
    	let t0;
    	let t1;
    	let div2;
    	let div1;
    	let svg;
    	let t2;
    	let items;
    	let t3;
    	let current;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*dd_open*/ ctx[3]) return create_if_block_3;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*global_open*/ ctx[2]) return create_if_block_2;
    		return create_else_block;
    	}

    	let current_block_type_1 = select_block_type_1(ctx);
    	let if_block1 = current_block_type_1(ctx);

    	items = new Multiselect_item({
    			props: {
    				items: /*src_filtered*/ ctx[6],
    				search_word: /*search_word*/ ctx[1],
    				indent: 0,
    				indentW: /*indentW*/ ctx[5]
    			},
    			$$inline: true
    		});

    	items.$on("handleCheck", /*handleCheck*/ ctx[9]);
    	let each_value = /*checked_set*/ ctx[4];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			input = element("input");
    			t0 = space();
    			if_block0.c();
    			t1 = space();
    			div2 = element("div");
    			div1 = element("div");
    			svg = svg_element("svg");
    			if_block1.c();
    			t2 = space();
    			create_component(items.$$.fragment);
    			t3 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", " svelte-10uilbs");
    			attr_dev(input, "placeholder", "Select or type");
    			add_location(input, file, 331, 3, 6395);
    			attr_dev(div0, "class", "form-control svelte-10uilbs");
    			add_location(div0, file, 330, 2, 6365);
    			attr_dev(svg, "width", "24");
    			attr_dev(svg, "height", "24");
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "x", "0px");
    			attr_dev(svg, "y", "0px");
    			attr_dev(svg, "viewBox", "0 0 32 32");
    			set_style(svg, "enable-background", "new 0 0 32 32");
    			attr_dev(svg, "xml:space", "preserve");
    			add_location(svg, file, 346, 4, 7188);
    			attr_dev(div1, "class", "dropdown-item svelte-10uilbs");
    			add_location(div1, file, 345, 3, 7156);
    			attr_dev(div2, "class", "dropdown svelte-10uilbs");
    			toggle_class(div2, "dd_open", /*dd_open*/ ctx[3]);
    			add_location(div2, file, 344, 2, 7115);
    			attr_dev(div3, "class", "comp svelte-10uilbs");
    			set_style(div3, "width", /*maxW*/ ctx[7] + "px");
    			add_location(div3, file, 329, 1, 6256);
    			attr_dev(div4, "class", "page");
    			add_location(div4, file, 328, 0, 6197);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div0);
    			append_dev(div0, input);
    			set_input_value(input, /*search_word*/ ctx[1]);
    			append_dev(div0, t0);
    			if_block0.m(div0, null);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, svg);
    			if_block1.m(svg, null);
    			append_dev(div2, t2);
    			mount_component(items, div2, null);
    			append_dev(div4, t3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div4, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[10]),
    					listen_dev(input, "focus", /*focus_handler*/ ctx[11], false, false, false),
    					listen_dev(svg, "click", /*click_open*/ ctx[8], false, false, false),
    					listen_dev(div3, "click", stop_propagation(/*click_handler*/ ctx[12]), false, false, true),
    					listen_dev(div4, "click", /*click_handler_2*/ ctx[14], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*search_word*/ 2 && input.value !== /*search_word*/ ctx[1]) {
    				set_input_value(input, /*search_word*/ ctx[1]);
    			}

    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div0, null);
    				}
    			}

    			if (current_block_type_1 !== (current_block_type_1 = select_block_type_1(ctx))) {
    				if_block1.d(1);
    				if_block1 = current_block_type_1(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(svg, null);
    				}
    			}

    			const items_changes = {};
    			if (dirty & /*src_filtered*/ 64) items_changes.items = /*src_filtered*/ ctx[6];
    			if (dirty & /*search_word*/ 2) items_changes.search_word = /*search_word*/ ctx[1];
    			if (dirty & /*indentW*/ 32) items_changes.indentW = /*indentW*/ ctx[5];
    			items.$set(items_changes);

    			if (dirty & /*dd_open*/ 8) {
    				toggle_class(div2, "dd_open", /*dd_open*/ ctx[3]);
    			}

    			if (dirty & /*checked_set, src*/ 17) {
    				each_value = /*checked_set*/ ctx[4];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
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
    			transition_in(items.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(items.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if_block0.d();
    			if_block1.d();
    			destroy_component(items);
    			destroy_each(each_blocks, detaching);
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

    function count_checked(arr) {
    	let count = 0;

    	arr.forEach(item => {
    		count += item.checked ? 1 : 0;
    		count += count_checked(item.children);
    	});

    	return count;
    }

    function toggle_open(arr, bool) {
    	arr.forEach(item => {
    		item.open = bool;
    		toggle_open(item.children, bool);
    	});
    }

    function activate_levels(arr) {
    	arr.forEach(item => {
    		item.disabled = false;
    		activate_levels(item.children);
    	});
    }

    function instance($$self, $$props, $$invalidate) {
    	let indentW;
    	let src_filtered;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Multiselect", slots, []);
    	let maxW = 480;
    	let search_word = "";

    	let src = [
    		{
    			id: "0",
    			name: "England",
    			level: 1,
    			checked: false,
    			disabled: false, //can be disabled if not at the same level of another selected item
    			permission: false, //might not have rights at this item
    			open: false,
    			children: [
    				{
    					id: "0-0",
    					name: "Manchester",
    					level: 2,
    					checked: false,
    					disabled: false,
    					permission: true,
    					open: false,
    					children: [
    						{
    							id: "0-0-0",
    							name: "Office",
    							level: 3,
    							checked: false,
    							disabled: false,
    							permission: true,
    							open: false,
    							children: [
    								{
    									id: "0-0-0-0",
    									name: "Floor 1",
    									level: 4,
    									checked: false,
    									disabled: false,
    									permission: true,
    									open: false,
    									children: []
    								},
    								{
    									id: "0-0-0-1",
    									name: "Basement",
    									level: 4,
    									checked: false,
    									disabled: false,
    									permission: true,
    									open: false,
    									children: []
    								}
    							]
    						},
    						{
    							id: "0-0-1",
    							name: "Warehouse",
    							level: 3,
    							checked: false,
    							disabled: false,
    							permission: true,
    							open: false,
    							children: []
    						}
    					]
    				},
    				{
    					id: "0-1",
    					name: "Liverpool",
    					level: 2,
    					checked: false,
    					disabled: false,
    					permission: true,
    					open: false,
    					children: [
    						{
    							id: "0-1-0",
    							name: "Office",
    							level: 3,
    							checked: false,
    							disabled: false,
    							permission: true,
    							open: false,
    							children: [
    								{
    									id: "0-1-0-0",
    									name: "Floor 1",
    									level: 4,
    									checked: false,
    									disabled: false,
    									permission: true,
    									open: false,
    									children: []
    								},
    								{
    									id: "0-1-0-1",
    									name: "Basement",
    									level: 4,
    									checked: false,
    									disabled: false,
    									permission: true,
    									open: false,
    									children: []
    								}
    							]
    						},
    						{
    							id: "0-1-1",
    							name: "Warehouse",
    							level: 3,
    							checked: false,
    							disabled: false,
    							permission: true,
    							open: false,
    							children: []
    						}
    					]
    				},
    				{
    					id: "0-2",
    					name: "Head Office",
    					level: 3,
    					checked: false,
    					disabled: false,
    					permission: true,
    					open: false,
    					children: []
    				}
    			]
    		},
    		{
    			id: "1",
    			name: "Ireland",
    			level: 1,
    			checked: false,
    			disabled: false, //can be disabled if not at the same level of another selected item
    			permission: false, //might not have rights at this item
    			open: false,
    			children: [
    				{
    					id: "1-0",
    					name: "Dublin",
    					level: 2,
    					checked: false,
    					disabled: false,
    					permission: true,
    					open: false,
    					children: [
    						{
    							id: "1-0-0",
    							name: "Office",
    							level: 3,
    							checked: false,
    							disabled: false,
    							permission: true,
    							open: false,
    							children: []
    						},
    						{
    							id: "1-0-1",
    							name: "Pump Station",
    							level: 3,
    							checked: false,
    							disabled: false,
    							permission: true,
    							open: false,
    							children: []
    						}
    					]
    				},
    				{
    					id: "1-1",
    					name: "Galway",
    					level: 2,
    					checked: false,
    					disabled: false,
    					permission: true,
    					open: false,
    					children: [
    						{
    							id: "1-1-0",
    							name: "Solar farm",
    							level: 3,
    							checked: false,
    							disabled: false,
    							permission: true,
    							open: false,
    							children: []
    						},
    						{
    							id: "1-1-1",
    							name: "Pump Station 2",
    							level: 3,
    							checked: false,
    							disabled: false,
    							permission: true,
    							open: false,
    							children: []
    						}
    					]
    				}
    			]
    		}
    	];

    	let level_checked = -1;
    	let global_open = false;
    	let dd_open = false;
    	let number_checked = 0;
    	
    	let checked_set = [];
    	

    	function list_checked(arr) {
    		arr.forEach(item => {
    			if (item.checked) {
    				checked_set.push(item);
    			}

    			list_checked(item.children);
    		});
    	}

    	function click_open() {
    		$$invalidate(2, global_open = !global_open);
    		toggle_open(src, global_open);
    		$$invalidate(0, src);
    	}

    	function block_other_levels(arr) {
    		arr.forEach(item => {
    			if (item.level !== level_checked) {
    				item.disabled = true;
    			}

    			block_other_levels(item.children);
    		});
    	}

    	function handleCheck(event) {
    		let item = event.detail;
    		$$invalidate(0, src); //trigger repaint

    		if (item.checked === true) {
    			if (level_checked < 0) {
    				level_checked = item.level;

    				//go and disable all other levels
    				console.log("time to disable other levels");

    				block_other_levels(src);
    				$$invalidate(0, src);
    			} else {
    				console.log("already disabled other levels");
    			}
    		} else {
    			if (number_checked < 2) {
    				level_checked = -1;
    				activate_levels(src);
    				$$invalidate(0, src);
    			}
    		}

    		setTimeout(
    			() => {
    				$$invalidate(3, dd_open = true);
    			},
    			10
    		);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Multiselect> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		search_word = this.value;
    		$$invalidate(1, search_word);
    	}

    	const focus_handler = () => {
    		$$invalidate(3, dd_open = true);
    	};

    	const click_handler = () => {
    		console.log("comp click");
    	};

    	const click_handler_1 = (item, each_value, index) => {
    		$$invalidate(4, each_value[index].checked = false, checked_set);
    		$$invalidate(0, src);
    	};

    	const click_handler_2 = () => {
    		$$invalidate(3, dd_open = false);
    	};

    	$$self.$capture_state = () => ({
    		Items: Multiselect_item,
    		maxW,
    		search_word,
    		src,
    		level_checked,
    		global_open,
    		dd_open,
    		number_checked,
    		count_checked,
    		checked_set,
    		list_checked,
    		click_open,
    		toggle_open,
    		block_other_levels,
    		activate_levels,
    		handleCheck,
    		indentW,
    		src_filtered
    	});

    	$$self.$inject_state = $$props => {
    		if ("maxW" in $$props) $$invalidate(7, maxW = $$props.maxW);
    		if ("search_word" in $$props) $$invalidate(1, search_word = $$props.search_word);
    		if ("src" in $$props) $$invalidate(0, src = $$props.src);
    		if ("level_checked" in $$props) level_checked = $$props.level_checked;
    		if ("global_open" in $$props) $$invalidate(2, global_open = $$props.global_open);
    		if ("dd_open" in $$props) $$invalidate(3, dd_open = $$props.dd_open);
    		if ("number_checked" in $$props) number_checked = $$props.number_checked;
    		if ("checked_set" in $$props) $$invalidate(4, checked_set = $$props.checked_set);
    		if ("indentW" in $$props) $$invalidate(5, indentW = $$props.indentW);
    		if ("src_filtered" in $$props) $$invalidate(6, src_filtered = $$props.src_filtered);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*src*/ 1) {
    			$$invalidate(6, src_filtered = src.sort(function (a, b) {
    				return a.name.toLowerCase() < b.name.toLowerCase();
    			}));
    		}

    		if ($$self.$$.dirty & /*src*/ 1) {
    			{
    				let s = src;
    				number_checked = count_checked(s);
    			}
    		}

    		if ($$self.$$.dirty & /*src*/ 1) {
    			{
    				let s = src;
    				$$invalidate(4, checked_set = []);
    				list_checked(s);
    			}
    		}
    	};

    	$$invalidate(5, indentW = Math.ceil(maxW / 20));

    	return [
    		src,
    		search_word,
    		global_open,
    		dd_open,
    		checked_set,
    		indentW,
    		src_filtered,
    		maxW,
    		click_open,
    		handleCheck,
    		input_input_handler,
    		focus_handler,
    		click_handler,
    		click_handler_1,
    		click_handler_2
    	];
    }

    class Multiselect extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Multiselect",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new Multiselect({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=multiselect.js.map
