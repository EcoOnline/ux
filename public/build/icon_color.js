
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

    /* src/Icon_color.svelte generated by Svelte v3.35.0 */

    const { console: console_1 } = globals;
    const file = "src/Icon_color.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[68] = list[i];
    	child_ctx[70] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[68] = list[i];
    	child_ctx[72] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[73] = list[i];
    	return child_ctx;
    }

    // (287:1) {#each icons as ico}
    function create_each_block_2(ctx) {
    	let option;
    	let t0_value = /*ico*/ ctx[73] + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = /*ico*/ ctx[73];
    			option.value = option.__value;
    			add_location(option, file, 287, 2, 7309);
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
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(287:1) {#each icons as ico}",
    		ctx
    	});

    	return block;
    }

    // (303:1) {:else}
    function create_else_block_3(ctx) {
    	let span;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Paste in here";
    			attr_dev(span, "class", "svelte-4ta655");
    			add_location(span, file, 303, 2, 7667);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (!mounted) {
    				dispose = listen_dev(span, "click", /*click_handler*/ ctx[57], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_3.name,
    		type: "else",
    		source: "(303:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (301:1) {#if favourites.length}
    function create_if_block_9(ctx) {
    	let span;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Clear";
    			attr_dev(span, "class", "svelte-4ta655");
    			add_location(span, file, 301, 2, 7614);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (!mounted) {
    				dispose = listen_dev(span, "click", /*clear_fav*/ ctx[30], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(301:1) {#if favourites.length}",
    		ctx
    	});

    	return block;
    }

    // (307:0) {#if show_paste_fav}
    function create_if_block_8(ctx) {
    	let textarea;
    	let br0;
    	let t0;
    	let a;
    	let br1;
    	let br2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			textarea = element("textarea");
    			br0 = element("br");
    			t0 = space();
    			a = element("a");
    			a.textContent = "Do it";
    			br1 = element("br");
    			br2 = element("br");
    			add_location(textarea, file, 307, 1, 7786);
    			add_location(br0, file, 307, 47, 7832);
    			add_location(a, file, 308, 1, 7838);
    			add_location(br1, file, 308, 90, 7927);
    			add_location(br2, file, 308, 94, 7931);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, textarea, anchor);
    			set_input_value(textarea, /*paste_fav*/ ctx[1]);
    			insert_dev(target, br0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, a, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, br2, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[58]),
    					listen_dev(a, "click", prevent_default(/*click_handler_1*/ ctx[59]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*paste_fav*/ 2) {
    				set_input_value(textarea, /*paste_fav*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(textarea);
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(a);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(br2);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(307:0) {#if show_paste_fav}",
    		ctx
    	});

    	return block;
    }

    // (357:0) {:else}
    function create_else_block_2(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Click a tile to add here";
    			add_location(p, file, 357, 1, 16040);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(357:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (311:0) {#if favourites.length}
    function create_if_block_4(ctx) {
    	let t0;
    	let a;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*favourites*/ ctx[24];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			a = element("a");
    			a.textContent = "Copy to clipboard and send to Hayden";
    			attr_dev(a, "href", "./");
    			add_location(a, file, 355, 1, 15938);
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, t0, anchor);
    			insert_dev(target, a, anchor);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", prevent_default(/*copytoclip*/ ctx[26]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*favourites, remove_from_fav*/ 285212672) {
    				each_value_1 = /*favourites*/ ctx[24];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(t0.parentNode, t0);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(a);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(311:0) {#if favourites.length}",
    		ctx
    	});

    	return block;
    }

    // (348:3) {:else}
    function create_else_block_1(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M15.9999 30.6521C19.3124 30.6521 22.1405 29.4802 24.4843 27.1365C26.828 24.7927 27.9999 21.9646 27.9999 18.6521V6.6521L15.9999 2.6521L3.99988 6.6521V18.6521C3.99988 21.9646 5.17175 24.7927 7.5155 27.1365C9.85925 29.4802 12.6874 30.6521 15.9999 30.6521ZM15.9999 28.4021C13.3124 28.4021 11.0155 27.449 9.10925 25.5427C7.203 23.6365 6.24988 21.3396 6.24988 18.6521V8.3396L15.9999 4.9021L25.7499 8.3396V18.6521C25.7499 21.3396 24.7968 23.6365 22.8905 25.5427C20.9843 27.449 18.6874 28.4021 15.9999 28.4021ZM15.0936 21.9167L23.6059 13.4627L21.9905 11.9284L15.0936 18.7771L11.04 14.7422L9.45718 16.2679L15.0936 21.9167Z");
    			add_location(path, file, 350, 5, 15273);
    			attr_dev(svg, "class", "icon svelte-4ta655");
    			attr_dev(svg, "width", "96");
    			attr_dev(svg, "height", "96");
    			attr_dev(svg, "viewBox", "0 0 32 32");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file, 349, 4, 15171);
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
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(348:3) {:else}",
    		ctx
    	});

    	return block;
    }

    // (338:31) 
    function create_if_block_7(ctx) {
    	let svg;
    	let path0;
    	let path1;
    	let path2;
    	let path3;
    	let path4;
    	let path5;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			path5 = svg_element("path");
    			attr_dev(path0, "d", "M15.4998 13.551C16.3282 13.551 16.9998 12.8795 16.9998 12.051C16.9998 11.2226 16.3282 10.551 15.4998 10.551C14.6714 10.551 13.9998 11.2226 13.9998 12.051C13.9998 12.8795 14.6714 13.551 15.4998 13.551Z");
    			attr_dev(path0, "fill", "black");
    			add_location(path0, file, 340, 5, 12397);
    			attr_dev(path1, "d", "M20.4998 17.551C21.3282 17.551 21.9998 16.8795 21.9998 16.051C21.9998 15.2226 21.3282 14.551 20.4998 14.551C19.6714 14.551 18.9998 15.2226 18.9998 16.051C18.9998 16.8795 19.6714 17.551 20.4998 17.551Z");
    			attr_dev(path1, "fill", "black");
    			add_location(path1, file, 341, 5, 12628);
    			attr_dev(path2, "d", "M15.9998 17.551C16.5521 17.551 16.9998 17.1033 16.9998 16.551C16.9998 15.9987 16.5521 15.551 15.9998 15.551C15.4475 15.551 14.9998 15.9987 14.9998 16.551C14.9998 17.1033 15.4475 17.551 15.9998 17.551Z");
    			attr_dev(path2, "fill", "black");
    			add_location(path2, file, 342, 5, 12859);
    			attr_dev(path3, "d", "M16.4998 22.551C17.3282 22.551 17.9998 21.8795 17.9998 21.051C17.9998 20.2226 17.3282 19.551 16.4998 19.551C15.6714 19.551 14.9998 20.2226 14.9998 21.051C14.9998 21.8795 15.6714 22.551 16.4998 22.551Z");
    			attr_dev(path3, "fill", "black");
    			add_location(path3, file, 343, 5, 13090);
    			attr_dev(path4, "d", "M11.4998 18.551C12.3282 18.551 12.9998 17.8795 12.9998 17.051C12.9998 16.2226 12.3282 15.551 11.4998 15.551C10.6714 15.551 9.99982 16.2226 9.99982 17.051C9.99982 17.8795 10.6714 18.551 11.4998 18.551Z");
    			attr_dev(path4, "fill", "black");
    			add_location(path4, file, 344, 5, 13321);
    			attr_dev(path5, "d", "M27.9998 13.551V15.551H25.949C25.7522 13.5976 24.9818 11.7461 23.7347 10.2297L25.1714 8.79323L26.5857 10.2077L27.9998 8.79373L23.7576 4.55103L22.3436 5.96513L23.7576 7.37913L22.3206 8.81563C20.8043 7.56879 18.953 6.79852 16.9998 6.60183V4.55103H18.9998V2.55103H12.9998V4.55103H14.9998V6.60183C13.0466 6.79852 11.1953 7.56879 9.67902 8.81563L8.24202 7.37913L9.65602 5.96513L8.24202 4.55103L3.99982 8.79373L5.41392 10.2077L6.82822 8.79323L8.26492 10.2297C7.01787 11.7461 6.24743 13.5976 6.05062 15.551H3.99982V13.551H1.99982V19.551H3.99982V17.551H6.05062C6.24743 19.5044 7.01787 21.3559 8.26492 22.8723L6.82822 24.3088L5.41392 22.8943L3.99982 24.3083L8.24202 28.551L9.65602 27.1369L8.24202 25.7229L9.67902 24.2864C11.1953 25.5333 13.0466 26.3035 14.9998 26.5002V28.551H12.9998V30.551H18.9998V28.551H16.9998V26.5002C18.953 26.3035 20.8043 25.5333 22.3206 24.2864L23.7576 25.7229L22.3436 27.1369L23.7576 28.551L27.9998 24.3083L26.5857 22.8943L25.1714 24.3088L23.7347 22.8723C24.9818 21.3559 25.7522 19.5044 25.949 17.551H27.9998V19.551H29.9998V13.551H27.9998ZM15.9998 24.551C14.4176 24.551 12.8708 24.0818 11.5553 23.2028C10.2397 22.3237 9.21428 21.0743 8.60878 19.6125C8.00328 18.1507 7.84485 16.5422 8.15353 14.9903C8.46222 13.4385 9.22414 12.013 10.343 10.8942C11.4618 9.77535 12.8872 9.01343 14.4391 8.70474C15.9909 8.39606 17.5995 8.55449 19.0613 9.15999C20.5231 9.76549 21.7725 10.7909 22.6516 12.1065C23.5306 13.4221 23.9998 14.9688 23.9998 16.551C23.9974 18.672 23.1537 20.7054 21.654 22.2052C20.1542 23.705 18.1208 24.5486 15.9998 24.551Z");
    			attr_dev(path5, "fill", "black");
    			add_location(path5, file, 345, 5, 13552);
    			attr_dev(svg, "class", "icon svelte-4ta655");
    			attr_dev(svg, "width", "96");
    			attr_dev(svg, "height", "96");
    			attr_dev(svg, "viewBox", "0 0 32 32");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file, 339, 4, 12295);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(svg, path2);
    			append_dev(svg, path3);
    			append_dev(svg, path4);
    			append_dev(svg, path5);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(338:31) ",
    		ctx
    	});

    	return block;
    }

    // (333:39) 
    function create_if_block_6(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M24.9999 2.47803C22.7837 2.48169 20.6201 3.15414 18.7922 4.40741C16.9643 5.66069 15.5571 7.43645 14.7548 9.50243C14.1121 8.57007 13.2526 7.80772 12.2502 7.28091C11.2477 6.75409 10.1324 6.47857 8.99994 6.47803H5.99994V9.47803C6.002 11.3339 6.74016 13.1132 8.05247 14.4255C9.36478 15.7378 11.1441 16.476 12.9999 16.478H13.9999V25.5273C11.703 25.7519 9.55618 26.7701 7.92894 28.4067L9.34294 29.8208C10.1795 28.9844 11.1911 28.344 12.3049 27.9456C13.4187 27.5471 14.607 27.4007 15.7842 27.5167C16.9614 27.6328 18.0982 28.0084 19.1128 28.6167C20.1274 29.2249 20.9944 30.0506 21.6515 31.0342L23.3131 29.9214C22.4934 28.6964 21.4124 27.6681 20.1479 26.9105C18.8834 26.153 17.4668 25.6849 15.9999 25.54V16.478H16.9999C19.9163 16.4747 22.7123 15.3147 24.7745 13.2525C26.8366 11.1904 27.9966 8.39439 27.9999 5.47803V2.47803H24.9999ZM12.9999 14.478C11.6743 14.4765 10.4034 13.9493 9.46607 13.0119C8.52872 12.0745 8.00145 10.8036 7.99994 9.47803V8.47803H8.99994C10.3256 8.47946 11.5965 9.0067 12.5339 9.94407C13.4713 10.8814 13.9985 12.1524 13.9999 13.478V14.478H12.9999ZM25.9999 5.47803C25.9973 7.86416 25.0482 10.1518 23.361 11.8391C21.6737 13.5263 19.3861 14.4754 16.9999 14.478H15.9999V13.478C16.0026 11.0919 16.9516 8.80424 18.6389 7.11699C20.3262 5.42974 22.6138 4.48067 24.9999 4.47803H25.9999V5.47803Z");
    			add_location(path, file, 335, 5, 10919);
    			attr_dev(svg, "class", "icon svelte-4ta655");
    			attr_dev(svg, "width", "96");
    			attr_dev(svg, "height", "96");
    			attr_dev(svg, "viewBox", "0 0 32 32");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file, 334, 4, 10817);
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
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(333:39) ",
    		ctx
    	});

    	return block;
    }

    // (328:3) {#if t.icon == 'period_statistics'}
    function create_if_block_5(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M10.0599 17.88C10.3678 17.9549 10.6831 17.9952 10.9999 18C11.7943 17.9998 12.5706 17.7631 13.2299 17.32L16.4499 20.19C15.934 21.1697 15.8612 22.3232 16.2499 23.36C16.8033 24.952 18.2951 26.0264 19.9804 26.0465C21.6657 26.0667 23.1829 25.0283 23.7741 23.4499C24.3653 21.8716 23.9037 20.092 22.6199 19L25.1599 13.91C26.1617 14.1359 27.2122 13.9446 28.0699 13.38C29.5488 12.4774 30.2786 10.7254 29.8776 9.03989C29.4766 7.35437 28.0361 6.1186 26.3092 5.97869C24.5823 5.83877 22.9617 6.82651 22.2946 8.42548C21.6275 10.0245 22.0656 11.8711 23.3799 13L20.8399 18.09C20.5641 18.0294 20.2824 17.9992 19.9999 18C19.2056 18.0002 18.4293 18.2369 17.7699 18.68L14.5499 15.81C15.0659 14.8303 15.1387 13.6768 14.7499 12.64C14.2009 11.0602 12.727 9.98874 11.0549 9.95391C9.38277 9.91908 7.86551 10.9282 7.25119 12.4838C6.63688 14.0394 7.05521 15.8129 8.29994 16.93L3.99994 25V2H1.99994V28C1.99994 29.1046 2.89537 30 3.99994 30H29.9999V28H4.66994L10.0599 17.88ZM25.9999 8C27.1045 8 27.9999 8.89543 27.9999 10C27.9999 11.1046 27.1045 12 25.9999 12C24.8954 12 23.9999 11.1046 23.9999 10C23.9999 8.89543 24.8954 8 25.9999 8ZM21.9999 22C21.9999 23.1046 21.1045 24 19.9999 24C18.8954 24 17.9999 23.1046 17.9999 22C17.9999 20.8954 18.8954 20 19.9999 20C21.1045 20 21.9999 20.8954 21.9999 22ZM10.9999 12C12.1045 12 12.9999 12.8954 12.9999 14C12.9999 15.1046 12.1045 16 10.9999 16C9.89537 16 8.99994 15.1046 8.99994 14C8.99994 12.8954 9.89537 12 10.9999 12Z");
    			add_location(path, file, 330, 5, 9289);
    			attr_dev(svg, "class", "icon svelte-4ta655");
    			attr_dev(svg, "width", "96");
    			attr_dev(svg, "height", "96");
    			attr_dev(svg, "viewBox", "0 0 32 32");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file, 329, 4, 9187);
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
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(328:3) {#if t.icon == 'period_statistics'}",
    		ctx
    	});

    	return block;
    }

    // (312:1) {#each favourites as t, i}
    function create_each_block_1(ctx) {
    	let div;
    	let svg0;
    	let path0;
    	let path0_fill_value;
    	let t0;
    	let svg1;
    	let path1;
    	let path1_fill_value;
    	let t1;
    	let div_title_value;
    	let mounted;
    	let dispose;

    	function select_block_type_2(ctx, dirty) {
    		if (/*t*/ ctx[68].icon == "period_statistics") return create_if_block_5;
    		if (/*t*/ ctx[68].icon == "environmental") return create_if_block_6;
    		if (/*t*/ ctx[68].icon == "covid") return create_if_block_7;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type_2(ctx);
    	let if_block = current_block_type(ctx);

    	function click_handler_2() {
    		return /*click_handler_2*/ ctx[60](/*i*/ ctx[72]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t0 = space();
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t1 = space();
    			if_block.c();
    			attr_dev(path0, "d", "M21.42,0 C26.58,0 31.29,1.91 34.89,5.06 L34.89,14.78 C34.89,25.08 27.73,33.71 18.12,35.97 C17.96,36 17.79,36 17.63,35.97 C11.74,34.59 6.78,30.82 3.81,25.73 L3.11,24.47 C2.61,23.59 2.16,22.49 1.78,21.19 C1.49,20.23 1.27,19.18 1.11,18.11 C2.27,7.92 10.92,0 21.42,0 Z");
    			attr_dev(path0, "fill", path0_fill_value = /*t*/ ctx[68].col1);
    			add_location(path0, file, 316, 4, 8292);
    			attr_dev(svg0, "class", "seg1 svelte-4ta655");
    			attr_dev(svg0, "width", "108px");
    			attr_dev(svg0, "height", "108px");
    			attr_dev(svg0, "viewBox", "0 0 36 36");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			set_style(svg0, "transform", "rotate(" + /*t*/ ctx[68].rot1 + "deg) scale(" + /*t*/ ctx[68].scale1 + ")");
    			add_location(svg0, file, 315, 3, 8127);
    			attr_dev(path1, "d", "M18,3.06 C25.48,3.065 32.09,6.85 36,12.60 C35.04,22.55 27.78,30.67 18.27,32.91 C18.09,32.94 17.91,32.94 17.74,32.91 C11.48,31.44 6.2,27.43 3.04,22.01 L2.29,20.67 C1.75,19.73 1.28,18.56 0.87,17.17 C0.46,15.76 0.15,14.18 0,12.6 C3.91,6.84 10.52,3.06 18,3.06 Z");
    			attr_dev(path1, "fill", path1_fill_value = /*t*/ ctx[68].col2);
    			add_location(path1, file, 321, 4, 8790);
    			attr_dev(svg1, "class", "seg2 svelte-4ta655");
    			attr_dev(svg1, "width", "48px");
    			attr_dev(svg1, "height", "48px");
    			attr_dev(svg1, "viewBox", "0 0 36 36");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			set_style(svg1, "transform", "rotate(" + /*t*/ ctx[68].rot2 + "deg) scale(" + /*t*/ ctx[68].scale2 + ")");
    			add_location(svg1, file, 320, 3, 8627);
    			attr_dev(div, "class", "tile svelte-4ta655");
    			attr_dev(div, "title", div_title_value = "col1: " + /*t*/ ctx[68].col1 + ", col2:  " + /*t*/ ctx[68].col2);
    			add_location(div, file, 312, 2, 7996);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg0);
    			append_dev(svg0, path0);
    			append_dev(div, t0);
    			append_dev(div, svg1);
    			append_dev(svg1, path1);
    			append_dev(div, t1);
    			if_block.m(div, null);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler_2, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*favourites*/ 16777216 && path0_fill_value !== (path0_fill_value = /*t*/ ctx[68].col1)) {
    				attr_dev(path0, "fill", path0_fill_value);
    			}

    			if (dirty[0] & /*favourites*/ 16777216) {
    				set_style(svg0, "transform", "rotate(" + /*t*/ ctx[68].rot1 + "deg) scale(" + /*t*/ ctx[68].scale1 + ")");
    			}

    			if (dirty[0] & /*favourites*/ 16777216 && path1_fill_value !== (path1_fill_value = /*t*/ ctx[68].col2)) {
    				attr_dev(path1, "fill", path1_fill_value);
    			}

    			if (dirty[0] & /*favourites*/ 16777216) {
    				set_style(svg1, "transform", "rotate(" + /*t*/ ctx[68].rot2 + "deg) scale(" + /*t*/ ctx[68].scale2 + ")");
    			}

    			if (current_block_type !== (current_block_type = select_block_type_2(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}

    			if (dirty[0] & /*favourites*/ 16777216 && div_title_value !== (div_title_value = "col1: " + /*t*/ ctx[68].col1 + ", col2:  " + /*t*/ ctx[68].col2)) {
    				attr_dev(div, "title", div_title_value);
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
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(312:1) {#each favourites as t, i}",
    		ctx
    	});

    	return block;
    }

    // (398:3) {:else}
    function create_else_block(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M15.9999 30.6521C19.3124 30.6521 22.1405 29.4802 24.4843 27.1365C26.828 24.7927 27.9999 21.9646 27.9999 18.6521V6.6521L15.9999 2.6521L3.99988 6.6521V18.6521C3.99988 21.9646 5.17175 24.7927 7.5155 27.1365C9.85925 29.4802 12.6874 30.6521 15.9999 30.6521ZM15.9999 28.4021C13.3124 28.4021 11.0155 27.449 9.10925 25.5427C7.203 23.6365 6.24988 21.3396 6.24988 18.6521V8.3396L15.9999 4.9021L25.7499 8.3396V18.6521C25.7499 21.3396 24.7968 23.6365 22.8905 25.5427C20.9843 27.449 18.6874 28.4021 15.9999 28.4021ZM15.0936 21.9167L23.6059 13.4627L21.9905 11.9284L15.0936 18.7771L11.04 14.7422L9.45718 16.2679L15.0936 21.9167Z");
    			add_location(path, file, 400, 5, 23369);
    			attr_dev(svg, "class", "icon svelte-4ta655");
    			attr_dev(svg, "width", "96");
    			attr_dev(svg, "height", "96");
    			attr_dev(svg, "viewBox", "0 0 32 32");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file, 399, 4, 23267);
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
    		id: create_else_block.name,
    		type: "else",
    		source: "(398:3) {:else}",
    		ctx
    	});

    	return block;
    }

    // (388:31) 
    function create_if_block_3(ctx) {
    	let svg;
    	let path0;
    	let path1;
    	let path2;
    	let path3;
    	let path4;
    	let path5;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			path5 = svg_element("path");
    			attr_dev(path0, "d", "M15.4998 13.551C16.3282 13.551 16.9998 12.8795 16.9998 12.051C16.9998 11.2226 16.3282 10.551 15.4998 10.551C14.6714 10.551 13.9998 11.2226 13.9998 12.051C13.9998 12.8795 14.6714 13.551 15.4998 13.551Z");
    			attr_dev(path0, "fill", "black");
    			add_location(path0, file, 390, 5, 20493);
    			attr_dev(path1, "d", "M20.4998 17.551C21.3282 17.551 21.9998 16.8795 21.9998 16.051C21.9998 15.2226 21.3282 14.551 20.4998 14.551C19.6714 14.551 18.9998 15.2226 18.9998 16.051C18.9998 16.8795 19.6714 17.551 20.4998 17.551Z");
    			attr_dev(path1, "fill", "black");
    			add_location(path1, file, 391, 5, 20724);
    			attr_dev(path2, "d", "M15.9998 17.551C16.5521 17.551 16.9998 17.1033 16.9998 16.551C16.9998 15.9987 16.5521 15.551 15.9998 15.551C15.4475 15.551 14.9998 15.9987 14.9998 16.551C14.9998 17.1033 15.4475 17.551 15.9998 17.551Z");
    			attr_dev(path2, "fill", "black");
    			add_location(path2, file, 392, 5, 20955);
    			attr_dev(path3, "d", "M16.4998 22.551C17.3282 22.551 17.9998 21.8795 17.9998 21.051C17.9998 20.2226 17.3282 19.551 16.4998 19.551C15.6714 19.551 14.9998 20.2226 14.9998 21.051C14.9998 21.8795 15.6714 22.551 16.4998 22.551Z");
    			attr_dev(path3, "fill", "black");
    			add_location(path3, file, 393, 5, 21186);
    			attr_dev(path4, "d", "M11.4998 18.551C12.3282 18.551 12.9998 17.8795 12.9998 17.051C12.9998 16.2226 12.3282 15.551 11.4998 15.551C10.6714 15.551 9.99982 16.2226 9.99982 17.051C9.99982 17.8795 10.6714 18.551 11.4998 18.551Z");
    			attr_dev(path4, "fill", "black");
    			add_location(path4, file, 394, 5, 21417);
    			attr_dev(path5, "d", "M27.9998 13.551V15.551H25.949C25.7522 13.5976 24.9818 11.7461 23.7347 10.2297L25.1714 8.79323L26.5857 10.2077L27.9998 8.79373L23.7576 4.55103L22.3436 5.96513L23.7576 7.37913L22.3206 8.81563C20.8043 7.56879 18.953 6.79852 16.9998 6.60183V4.55103H18.9998V2.55103H12.9998V4.55103H14.9998V6.60183C13.0466 6.79852 11.1953 7.56879 9.67902 8.81563L8.24202 7.37913L9.65602 5.96513L8.24202 4.55103L3.99982 8.79373L5.41392 10.2077L6.82822 8.79323L8.26492 10.2297C7.01787 11.7461 6.24743 13.5976 6.05062 15.551H3.99982V13.551H1.99982V19.551H3.99982V17.551H6.05062C6.24743 19.5044 7.01787 21.3559 8.26492 22.8723L6.82822 24.3088L5.41392 22.8943L3.99982 24.3083L8.24202 28.551L9.65602 27.1369L8.24202 25.7229L9.67902 24.2864C11.1953 25.5333 13.0466 26.3035 14.9998 26.5002V28.551H12.9998V30.551H18.9998V28.551H16.9998V26.5002C18.953 26.3035 20.8043 25.5333 22.3206 24.2864L23.7576 25.7229L22.3436 27.1369L23.7576 28.551L27.9998 24.3083L26.5857 22.8943L25.1714 24.3088L23.7347 22.8723C24.9818 21.3559 25.7522 19.5044 25.949 17.551H27.9998V19.551H29.9998V13.551H27.9998ZM15.9998 24.551C14.4176 24.551 12.8708 24.0818 11.5553 23.2028C10.2397 22.3237 9.21428 21.0743 8.60878 19.6125C8.00328 18.1507 7.84485 16.5422 8.15353 14.9903C8.46222 13.4385 9.22414 12.013 10.343 10.8942C11.4618 9.77535 12.8872 9.01343 14.4391 8.70474C15.9909 8.39606 17.5995 8.55449 19.0613 9.15999C20.5231 9.76549 21.7725 10.7909 22.6516 12.1065C23.5306 13.4221 23.9998 14.9688 23.9998 16.551C23.9974 18.672 23.1537 20.7054 21.654 22.2052C20.1542 23.705 18.1208 24.5486 15.9998 24.551Z");
    			attr_dev(path5, "fill", "black");
    			add_location(path5, file, 395, 5, 21648);
    			attr_dev(svg, "class", "icon svelte-4ta655");
    			attr_dev(svg, "width", "96");
    			attr_dev(svg, "height", "96");
    			attr_dev(svg, "viewBox", "0 0 32 32");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file, 389, 4, 20391);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(svg, path2);
    			append_dev(svg, path3);
    			append_dev(svg, path4);
    			append_dev(svg, path5);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(388:31) ",
    		ctx
    	});

    	return block;
    }

    // (383:39) 
    function create_if_block_2(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M24.9999 2.47803C22.7837 2.48169 20.6201 3.15414 18.7922 4.40741C16.9643 5.66069 15.5571 7.43645 14.7548 9.50243C14.1121 8.57007 13.2526 7.80772 12.2502 7.28091C11.2477 6.75409 10.1324 6.47857 8.99994 6.47803H5.99994V9.47803C6.002 11.3339 6.74016 13.1132 8.05247 14.4255C9.36478 15.7378 11.1441 16.476 12.9999 16.478H13.9999V25.5273C11.703 25.7519 9.55618 26.7701 7.92894 28.4067L9.34294 29.8208C10.1795 28.9844 11.1911 28.344 12.3049 27.9456C13.4187 27.5471 14.607 27.4007 15.7842 27.5167C16.9614 27.6328 18.0982 28.0084 19.1128 28.6167C20.1274 29.2249 20.9944 30.0506 21.6515 31.0342L23.3131 29.9214C22.4934 28.6964 21.4124 27.6681 20.1479 26.9105C18.8834 26.153 17.4668 25.6849 15.9999 25.54V16.478H16.9999C19.9163 16.4747 22.7123 15.3147 24.7745 13.2525C26.8366 11.1904 27.9966 8.39439 27.9999 5.47803V2.47803H24.9999ZM12.9999 14.478C11.6743 14.4765 10.4034 13.9493 9.46607 13.0119C8.52872 12.0745 8.00145 10.8036 7.99994 9.47803V8.47803H8.99994C10.3256 8.47946 11.5965 9.0067 12.5339 9.94407C13.4713 10.8814 13.9985 12.1524 13.9999 13.478V14.478H12.9999ZM25.9999 5.47803C25.9973 7.86416 25.0482 10.1518 23.361 11.8391C21.6737 13.5263 19.3861 14.4754 16.9999 14.478H15.9999V13.478C16.0026 11.0919 16.9516 8.80424 18.6389 7.11699C20.3262 5.42974 22.6138 4.48067 24.9999 4.47803H25.9999V5.47803Z");
    			add_location(path, file, 385, 5, 19015);
    			attr_dev(svg, "class", "icon svelte-4ta655");
    			attr_dev(svg, "width", "96");
    			attr_dev(svg, "height", "96");
    			attr_dev(svg, "viewBox", "0 0 32 32");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file, 384, 4, 18913);
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
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(383:39) ",
    		ctx
    	});

    	return block;
    }

    // (378:3) {#if t.icon == 'period_statistics'}
    function create_if_block_1(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M10.0599 17.88C10.3678 17.9549 10.6831 17.9952 10.9999 18C11.7943 17.9998 12.5706 17.7631 13.2299 17.32L16.4499 20.19C15.934 21.1697 15.8612 22.3232 16.2499 23.36C16.8033 24.952 18.2951 26.0264 19.9804 26.0465C21.6657 26.0667 23.1829 25.0283 23.7741 23.4499C24.3653 21.8716 23.9037 20.092 22.6199 19L25.1599 13.91C26.1617 14.1359 27.2122 13.9446 28.0699 13.38C29.5488 12.4774 30.2786 10.7254 29.8776 9.03989C29.4766 7.35437 28.0361 6.1186 26.3092 5.97869C24.5823 5.83877 22.9617 6.82651 22.2946 8.42548C21.6275 10.0245 22.0656 11.8711 23.3799 13L20.8399 18.09C20.5641 18.0294 20.2824 17.9992 19.9999 18C19.2056 18.0002 18.4293 18.2369 17.7699 18.68L14.5499 15.81C15.0659 14.8303 15.1387 13.6768 14.7499 12.64C14.2009 11.0602 12.727 9.98874 11.0549 9.95391C9.38277 9.91908 7.86551 10.9282 7.25119 12.4838C6.63688 14.0394 7.05521 15.8129 8.29994 16.93L3.99994 25V2H1.99994V28C1.99994 29.1046 2.89537 30 3.99994 30H29.9999V28H4.66994L10.0599 17.88ZM25.9999 8C27.1045 8 27.9999 8.89543 27.9999 10C27.9999 11.1046 27.1045 12 25.9999 12C24.8954 12 23.9999 11.1046 23.9999 10C23.9999 8.89543 24.8954 8 25.9999 8ZM21.9999 22C21.9999 23.1046 21.1045 24 19.9999 24C18.8954 24 17.9999 23.1046 17.9999 22C17.9999 20.8954 18.8954 20 19.9999 20C21.1045 20 21.9999 20.8954 21.9999 22ZM10.9999 12C12.1045 12 12.9999 12.8954 12.9999 14C12.9999 15.1046 12.1045 16 10.9999 16C9.89537 16 8.99994 15.1046 8.99994 14C8.99994 12.8954 9.89537 12 10.9999 12Z");
    			add_location(path, file, 380, 5, 17385);
    			attr_dev(svg, "class", "icon svelte-4ta655");
    			attr_dev(svg, "width", "96");
    			attr_dev(svg, "height", "96");
    			attr_dev(svg, "viewBox", "0 0 32 32");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file, 379, 4, 17283);
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
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(378:3) {#if t.icon == 'period_statistics'}",
    		ctx
    	});

    	return block;
    }

    // (412:1) {#if (!harmonious_only && (j+1)%6==0) || (harmonious_only && (j+1)%3==0)}
    function create_if_block(ctx) {
    	let hr;

    	const block = {
    		c: function create() {
    			hr = element("hr");
    			add_location(hr, file, 412, 1, 24190);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, hr, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(hr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(412:1) {#if (!harmonious_only && (j+1)%6==0) || (harmonious_only && (j+1)%3==0)}",
    		ctx
    	});

    	return block;
    }

    // (362:0) {#each test as t, j}
    function create_each_block(ctx) {
    	let div;
    	let svg0;
    	let path0;
    	let path0_fill_value;
    	let t0;
    	let svg1;
    	let path1;
    	let path1_fill_value;
    	let t1;
    	let div_title_value;
    	let t2;
    	let if_block1_anchor;
    	let mounted;
    	let dispose;

    	function select_block_type_3(ctx, dirty) {
    		if (/*t*/ ctx[68].icon == "period_statistics") return create_if_block_1;
    		if (/*t*/ ctx[68].icon == "environmental") return create_if_block_2;
    		if (/*t*/ ctx[68].icon == "covid") return create_if_block_3;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type_3(ctx);
    	let if_block0 = current_block_type(ctx);

    	function click_handler_3() {
    		return /*click_handler_3*/ ctx[61](/*t*/ ctx[68]);
    	}

    	let if_block1 = (!/*harmonious_only*/ ctx[22] && (/*j*/ ctx[70] + 1) % 6 == 0 || /*harmonious_only*/ ctx[22] && (/*j*/ ctx[70] + 1) % 3 == 0) && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t0 = space();
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t1 = space();
    			if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			attr_dev(path0, "d", "M21.42,0 C26.58,0 31.29,1.91 34.89,5.06 L34.89,14.78 C34.89,25.08 27.73,33.71 18.12,35.97 C17.96,36 17.79,36 17.63,35.97 C11.74,34.59 6.78,30.82 3.81,25.73 L3.11,24.47 C2.61,23.59 2.16,22.49 1.78,21.19 C1.49,20.23 1.27,19.18 1.11,18.11 C2.27,7.92 10.92,0 21.42,0 Z");
    			attr_dev(path0, "fill", path0_fill_value = /*t*/ ctx[68].col1);
    			add_location(path0, file, 366, 3, 16394);
    			attr_dev(svg0, "class", "seg1 svelte-4ta655");
    			attr_dev(svg0, "width", "108px");
    			attr_dev(svg0, "height", "108px");
    			attr_dev(svg0, "viewBox", "0 0 36 36");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			set_style(svg0, "transform", "rotate(" + /*t*/ ctx[68].rot1 + "deg) scale(" + /*t*/ ctx[68].scale1 + ")");
    			add_location(svg0, file, 365, 2, 16230);
    			attr_dev(path1, "d", "M18,3.06 C25.48,3.065 32.09,6.85 36,12.60 C35.04,22.55 27.78,30.67 18.27,32.91 C18.09,32.94 17.91,32.94 17.74,32.91 C11.48,31.44 6.2,27.43 3.04,22.01 L2.29,20.67 C1.75,19.73 1.28,18.56 0.87,17.17 C0.46,15.76 0.15,14.18 0,12.6 C3.91,6.84 10.52,3.06 18,3.06 Z");
    			attr_dev(path1, "fill", path1_fill_value = /*t*/ ctx[68].col2);
    			add_location(path1, file, 371, 3, 16888);
    			attr_dev(svg1, "class", "seg2 svelte-4ta655");
    			attr_dev(svg1, "width", "48px");
    			attr_dev(svg1, "height", "48px");
    			attr_dev(svg1, "viewBox", "0 0 36 36");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			set_style(svg1, "transform", "rotate(" + /*t*/ ctx[68].rot2 + "deg) scale(" + /*t*/ ctx[68].scale2 + ")");
    			add_location(svg1, file, 370, 2, 16726);
    			attr_dev(div, "class", "tile svelte-4ta655");
    			attr_dev(div, "title", div_title_value = "col1: " + /*t*/ ctx[68].col1 + ", col2:  " + /*t*/ ctx[68].col2);
    			add_location(div, file, 362, 1, 16106);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg0);
    			append_dev(svg0, path0);
    			append_dev(div, t0);
    			append_dev(div, svg1);
    			append_dev(svg1, path1);
    			append_dev(div, t1);
    			if_block0.m(div, null);
    			insert_dev(target, t2, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler_3, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*test*/ 33554432 && path0_fill_value !== (path0_fill_value = /*t*/ ctx[68].col1)) {
    				attr_dev(path0, "fill", path0_fill_value);
    			}

    			if (dirty[0] & /*test*/ 33554432) {
    				set_style(svg0, "transform", "rotate(" + /*t*/ ctx[68].rot1 + "deg) scale(" + /*t*/ ctx[68].scale1 + ")");
    			}

    			if (dirty[0] & /*test*/ 33554432 && path1_fill_value !== (path1_fill_value = /*t*/ ctx[68].col2)) {
    				attr_dev(path1, "fill", path1_fill_value);
    			}

    			if (dirty[0] & /*test*/ 33554432) {
    				set_style(svg1, "transform", "rotate(" + /*t*/ ctx[68].rot2 + "deg) scale(" + /*t*/ ctx[68].scale2 + ")");
    			}

    			if (current_block_type !== (current_block_type = select_block_type_3(ctx))) {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div, null);
    				}
    			}

    			if (dirty[0] & /*test*/ 33554432 && div_title_value !== (div_title_value = "col1: " + /*t*/ ctx[68].col1 + ", col2:  " + /*t*/ ctx[68].col2)) {
    				attr_dev(div, "title", div_title_value);
    			}

    			if (!/*harmonious_only*/ ctx[22] && (/*j*/ ctx[70] + 1) % 6 == 0 || /*harmonious_only*/ ctx[22] && (/*j*/ ctx[70] + 1) % 3 == 0) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block0.d();
    			if (detaching) detach_dev(t2);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(362:0) {#each test as t, j}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let hr0;
    	let t0;
    	let h40;
    	let t2;
    	let input0;
    	let t3;
    	let br0;
    	let t4;
    	let input1;
    	let t5;
    	let input2;
    	let t6;
    	let input3;
    	let t7;
    	let br1;
    	let t8;
    	let input4;
    	let t9;
    	let br2;
    	let t10;
    	let input5;
    	let t11;
    	let input6;
    	let t12;
    	let input7;
    	let t13;
    	let br3;
    	let t14;
    	let input8;
    	let t15;
    	let input9;
    	let br4;
    	let t16;
    	let h41;
    	let t18;
    	let input10;
    	let t19;
    	let br5;
    	let t20;
    	let input11;
    	let t21;
    	let input12;
    	let t22;
    	let input13;
    	let t23;
    	let br6;
    	let t24;
    	let input14;
    	let t25;
    	let br7;
    	let t26;
    	let input15;
    	let t27;
    	let input16;
    	let t28;
    	let input17;
    	let t29;
    	let br8;
    	let t30;
    	let input18;
    	let t31;
    	let input19;
    	let br9;
    	let t32;
    	let input20;
    	let t33;
    	let br10;
    	let t34;
    	let h42;
    	let t36;
    	let select;
    	let t37;
    	let br11;
    	let br12;
    	let t38;
    	let div;
    	let button;
    	let t40;
    	let a0;
    	let t42;
    	let a1;
    	let t44;
    	let hr1;
    	let t45;
    	let h43;
    	let t46;
    	let t47;
    	let t48;
    	let t49;
    	let hr2;
    	let t50;
    	let each1_anchor;
    	let mounted;
    	let dispose;
    	let each_value_2 = /*icons*/ ctx[31];
    	validate_each_argument(each_value_2);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_1[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	function select_block_type(ctx, dirty) {
    		if (/*favourites*/ ctx[24].length) return create_if_block_9;
    		return create_else_block_3;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	let if_block1 = /*show_paste_fav*/ ctx[0] && create_if_block_8(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*favourites*/ ctx[24].length) return create_if_block_4;
    		return create_else_block_2;
    	}

    	let current_block_type_1 = select_block_type_1(ctx);
    	let if_block2 = current_block_type_1(ctx);
    	let each_value = /*test*/ ctx[25];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			hr0 = element("hr");
    			t0 = space();
    			h40 = element("h4");
    			h40.textContent = "Big segment";
    			t2 = space();
    			input0 = element("input");
    			t3 = text(" Randomise lightness");
    			br0 = element("br");
    			t4 = text("\nLighten ");
    			input1 = element("input");
    			t5 = text(" - ");
    			input2 = element("input");
    			t6 = text("times original (max) ");
    			input3 = element("input");
    			t7 = text(" (100 = white)");
    			br1 = element("br");
    			t8 = space();
    			input4 = element("input");
    			t9 = text(" Randomise saturation");
    			br2 = element("br");
    			t10 = text("\nSaturation ");
    			input5 = element("input");
    			t11 = text(" - ");
    			input6 = element("input");
    			t12 = text("times original (min) ");
    			input7 = element("input");
    			t13 = text(" (0 = grey)");
    			br3 = element("br");
    			t14 = text("\nScale ");
    			input8 = element("input");
    			t15 = text(" - ");
    			input9 = element("input");
    			br4 = element("br");
    			t16 = space();
    			h41 = element("h4");
    			h41.textContent = "Little segment";
    			t18 = space();
    			input10 = element("input");
    			t19 = text(" Randomise lightness");
    			br5 = element("br");
    			t20 = text("\nLighten ");
    			input11 = element("input");
    			t21 = text(" - ");
    			input12 = element("input");
    			t22 = text("times original (max) ");
    			input13 = element("input");
    			t23 = text(" (100 = white)");
    			br6 = element("br");
    			t24 = space();
    			input14 = element("input");
    			t25 = text(" Randomise saturation");
    			br7 = element("br");
    			t26 = text("\nSaturation ");
    			input15 = element("input");
    			t27 = text(" - ");
    			input16 = element("input");
    			t28 = text("times original (min) ");
    			input17 = element("input");
    			t29 = text(" (0 = grey)");
    			br8 = element("br");
    			t30 = text("\nScale ");
    			input18 = element("input");
    			t31 = text(" - ");
    			input19 = element("input");
    			br9 = element("br");
    			t32 = space();
    			input20 = element("input");
    			t33 = text(" Harmonious combinations only");
    			br10 = element("br");
    			t34 = space();
    			h42 = element("h4");
    			h42.textContent = "Icon";
    			t36 = space();
    			select = element("select");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t37 = space();
    			br11 = element("br");
    			br12 = element("br");
    			t38 = space();
    			div = element("div");
    			button = element("button");
    			button.textContent = "Generate";
    			t40 = space();
    			a0 = element("a");
    			a0.textContent = "Play";
    			t42 = space();
    			a1 = element("a");
    			a1.textContent = "Stop";
    			t44 = space();
    			hr1 = element("hr");
    			t45 = space();
    			h43 = element("h4");
    			t46 = text("Favourites \n\t");
    			if_block0.c();
    			t47 = space();
    			if (if_block1) if_block1.c();
    			t48 = space();
    			if_block2.c();
    			t49 = space();
    			hr2 = element("hr");
    			t50 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each1_anchor = empty();
    			add_location(hr0, file, 269, 0, 5682);
    			add_location(h40, file, 270, 0, 5687);
    			attr_dev(input0, "type", "checkbox");
    			add_location(input0, file, 271, 0, 5708);
    			add_location(br0, file, 271, 82, 5790);
    			attr_dev(input1, "type", "text");
    			add_location(input1, file, 272, 8, 5803);
    			attr_dev(input2, "type", "text");
    			add_location(input2, file, 272, 62, 5857);
    			attr_dev(input3, "type", "text");
    			add_location(input3, file, 272, 134, 5929);
    			add_location(br1, file, 272, 201, 5996);
    			attr_dev(input4, "type", "checkbox");
    			add_location(input4, file, 273, 0, 6001);
    			add_location(br2, file, 273, 84, 6085);
    			attr_dev(input5, "type", "text");
    			add_location(input5, file, 274, 11, 6101);
    			attr_dev(input6, "type", "text");
    			add_location(input6, file, 274, 66, 6156);
    			attr_dev(input7, "type", "text");
    			add_location(input7, file, 274, 139, 6229);
    			add_location(br3, file, 274, 205, 6295);
    			attr_dev(input8, "type", "text");
    			add_location(input8, file, 275, 6, 6306);
    			attr_dev(input9, "type", "text");
    			add_location(input9, file, 275, 56, 6356);
    			add_location(br4, file, 275, 103, 6403);
    			add_location(h41, file, 276, 0, 6408);
    			attr_dev(input10, "type", "checkbox");
    			add_location(input10, file, 277, 0, 6432);
    			add_location(br5, file, 277, 82, 6514);
    			attr_dev(input11, "type", "text");
    			add_location(input11, file, 278, 8, 6527);
    			attr_dev(input12, "type", "text");
    			add_location(input12, file, 278, 62, 6581);
    			attr_dev(input13, "type", "text");
    			add_location(input13, file, 278, 134, 6653);
    			add_location(br6, file, 278, 201, 6720);
    			attr_dev(input14, "type", "checkbox");
    			add_location(input14, file, 279, 0, 6725);
    			add_location(br7, file, 279, 84, 6809);
    			attr_dev(input15, "type", "text");
    			add_location(input15, file, 280, 11, 6825);
    			attr_dev(input16, "type", "text");
    			add_location(input16, file, 280, 66, 6880);
    			attr_dev(input17, "type", "text");
    			add_location(input17, file, 280, 139, 6953);
    			add_location(br8, file, 280, 205, 7019);
    			attr_dev(input18, "type", "text");
    			add_location(input18, file, 281, 6, 7030);
    			attr_dev(input19, "type", "text");
    			add_location(input19, file, 281, 56, 7080);
    			add_location(br9, file, 281, 103, 7127);
    			attr_dev(input20, "type", "checkbox");
    			add_location(input20, file, 282, 0, 7132);
    			add_location(br10, file, 282, 104, 7236);
    			add_location(h42, file, 284, 0, 7242);
    			if (/*icon*/ ctx[23] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[56].call(select));
    			add_location(select, file, 285, 0, 7256);
    			add_location(br11, file, 294, 0, 7372);
    			add_location(br12, file, 294, 4, 7376);
    			attr_dev(button, "class", "svelte-4ta655");
    			add_location(button, file, 296, 1, 7405);
    			attr_dev(a0, "href", "./");
    			add_location(a0, file, 296, 45, 7449);
    			attr_dev(a1, "href", "./");
    			add_location(a1, file, 296, 100, 7504);
    			attr_dev(div, "class", "controls svelte-4ta655");
    			add_location(div, file, 295, 0, 7381);
    			add_location(hr1, file, 298, 0, 7566);
    			attr_dev(h43, "class", "svelte-4ta655");
    			add_location(h43, file, 299, 0, 7571);
    			add_location(hr2, file, 360, 0, 16079);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, hr0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, h40, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, input0, anchor);
    			input0.checked = /*col1_lightness_random*/ ctx[5];
    			insert_dev(target, t3, anchor);
    			insert_dev(target, br0, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, input1, anchor);
    			set_input_value(input1, /*col1_lightness_min*/ ctx[2]);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, input2, anchor);
    			set_input_value(input2, /*col1_lightness_max*/ ctx[3]);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, input3, anchor);
    			set_input_value(input3, /*col1_lightness_roof*/ ctx[4]);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, input4, anchor);
    			input4.checked = /*col1_saturation_random*/ ctx[9];
    			insert_dev(target, t9, anchor);
    			insert_dev(target, br2, anchor);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, input5, anchor);
    			set_input_value(input5, /*col1_saturation_min*/ ctx[6]);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, input6, anchor);
    			set_input_value(input6, /*col1_saturation_max*/ ctx[7]);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, input7, anchor);
    			set_input_value(input7, /*col1_saturation_floor*/ ctx[8]);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, br3, anchor);
    			insert_dev(target, t14, anchor);
    			insert_dev(target, input8, anchor);
    			set_input_value(input8, /*col1_scale_min*/ ctx[10]);
    			insert_dev(target, t15, anchor);
    			insert_dev(target, input9, anchor);
    			set_input_value(input9, /*col1_scale_max*/ ctx[11]);
    			insert_dev(target, br4, anchor);
    			insert_dev(target, t16, anchor);
    			insert_dev(target, h41, anchor);
    			insert_dev(target, t18, anchor);
    			insert_dev(target, input10, anchor);
    			input10.checked = /*col2_lightness_random*/ ctx[15];
    			insert_dev(target, t19, anchor);
    			insert_dev(target, br5, anchor);
    			insert_dev(target, t20, anchor);
    			insert_dev(target, input11, anchor);
    			set_input_value(input11, /*col2_lightness_min*/ ctx[12]);
    			insert_dev(target, t21, anchor);
    			insert_dev(target, input12, anchor);
    			set_input_value(input12, /*col2_lightness_max*/ ctx[13]);
    			insert_dev(target, t22, anchor);
    			insert_dev(target, input13, anchor);
    			set_input_value(input13, /*col2_lightness_roof*/ ctx[14]);
    			insert_dev(target, t23, anchor);
    			insert_dev(target, br6, anchor);
    			insert_dev(target, t24, anchor);
    			insert_dev(target, input14, anchor);
    			input14.checked = /*col2_saturation_random*/ ctx[19];
    			insert_dev(target, t25, anchor);
    			insert_dev(target, br7, anchor);
    			insert_dev(target, t26, anchor);
    			insert_dev(target, input15, anchor);
    			set_input_value(input15, /*col2_saturation_min*/ ctx[16]);
    			insert_dev(target, t27, anchor);
    			insert_dev(target, input16, anchor);
    			set_input_value(input16, /*col2_saturation_max*/ ctx[17]);
    			insert_dev(target, t28, anchor);
    			insert_dev(target, input17, anchor);
    			set_input_value(input17, /*col2_saturation_floor*/ ctx[18]);
    			insert_dev(target, t29, anchor);
    			insert_dev(target, br8, anchor);
    			insert_dev(target, t30, anchor);
    			insert_dev(target, input18, anchor);
    			set_input_value(input18, /*col2_scale_min*/ ctx[20]);
    			insert_dev(target, t31, anchor);
    			insert_dev(target, input19, anchor);
    			set_input_value(input19, /*col2_scale_max*/ ctx[21]);
    			insert_dev(target, br9, anchor);
    			insert_dev(target, t32, anchor);
    			insert_dev(target, input20, anchor);
    			input20.checked = /*harmonious_only*/ ctx[22];
    			insert_dev(target, t33, anchor);
    			insert_dev(target, br10, anchor);
    			insert_dev(target, t34, anchor);
    			insert_dev(target, h42, anchor);
    			insert_dev(target, t36, anchor);
    			insert_dev(target, select, anchor);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(select, null);
    			}

    			select_option(select, /*icon*/ ctx[23]);
    			insert_dev(target, t37, anchor);
    			insert_dev(target, br11, anchor);
    			insert_dev(target, br12, anchor);
    			insert_dev(target, t38, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			append_dev(div, t40);
    			append_dev(div, a0);
    			append_dev(div, t42);
    			append_dev(div, a1);
    			insert_dev(target, t44, anchor);
    			insert_dev(target, hr1, anchor);
    			insert_dev(target, t45, anchor);
    			insert_dev(target, h43, anchor);
    			append_dev(h43, t46);
    			if_block0.m(h43, null);
    			insert_dev(target, t47, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t48, anchor);
    			if_block2.m(target, anchor);
    			insert_dev(target, t49, anchor);
    			insert_dev(target, hr2, anchor);
    			insert_dev(target, t50, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each1_anchor, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "change", /*input0_change_handler*/ ctx[35]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[36]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[37]),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[38]),
    					listen_dev(input4, "change", /*input4_change_handler*/ ctx[39]),
    					listen_dev(input5, "input", /*input5_input_handler*/ ctx[40]),
    					listen_dev(input6, "input", /*input6_input_handler*/ ctx[41]),
    					listen_dev(input7, "input", /*input7_input_handler*/ ctx[42]),
    					listen_dev(input8, "input", /*input8_input_handler*/ ctx[43]),
    					listen_dev(input9, "input", /*input9_input_handler*/ ctx[44]),
    					listen_dev(input10, "change", /*input10_change_handler*/ ctx[45]),
    					listen_dev(input11, "input", /*input11_input_handler*/ ctx[46]),
    					listen_dev(input12, "input", /*input12_input_handler*/ ctx[47]),
    					listen_dev(input13, "input", /*input13_input_handler*/ ctx[48]),
    					listen_dev(input14, "change", /*input14_change_handler*/ ctx[49]),
    					listen_dev(input15, "input", /*input15_input_handler*/ ctx[50]),
    					listen_dev(input16, "input", /*input16_input_handler*/ ctx[51]),
    					listen_dev(input17, "input", /*input17_input_handler*/ ctx[52]),
    					listen_dev(input18, "input", /*input18_input_handler*/ ctx[53]),
    					listen_dev(input19, "input", /*input19_input_handler*/ ctx[54]),
    					listen_dev(input20, "change", /*input20_change_handler*/ ctx[55]),
    					listen_dev(input20, "change", /*init*/ ctx[32], false, false, false),
    					listen_dev(select, "change", /*select_change_handler*/ ctx[56]),
    					listen_dev(button, "click", /*init*/ ctx[32], false, false, false),
    					listen_dev(a0, "click", prevent_default(/*play*/ ctx[33]), false, true, false),
    					listen_dev(a1, "click", prevent_default(/*stop*/ ctx[34]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*col1_lightness_random*/ 32) {
    				input0.checked = /*col1_lightness_random*/ ctx[5];
    			}

    			if (dirty[0] & /*col1_lightness_min*/ 4 && input1.value !== /*col1_lightness_min*/ ctx[2]) {
    				set_input_value(input1, /*col1_lightness_min*/ ctx[2]);
    			}

    			if (dirty[0] & /*col1_lightness_max*/ 8 && input2.value !== /*col1_lightness_max*/ ctx[3]) {
    				set_input_value(input2, /*col1_lightness_max*/ ctx[3]);
    			}

    			if (dirty[0] & /*col1_lightness_roof*/ 16 && input3.value !== /*col1_lightness_roof*/ ctx[4]) {
    				set_input_value(input3, /*col1_lightness_roof*/ ctx[4]);
    			}

    			if (dirty[0] & /*col1_saturation_random*/ 512) {
    				input4.checked = /*col1_saturation_random*/ ctx[9];
    			}

    			if (dirty[0] & /*col1_saturation_min*/ 64 && input5.value !== /*col1_saturation_min*/ ctx[6]) {
    				set_input_value(input5, /*col1_saturation_min*/ ctx[6]);
    			}

    			if (dirty[0] & /*col1_saturation_max*/ 128 && input6.value !== /*col1_saturation_max*/ ctx[7]) {
    				set_input_value(input6, /*col1_saturation_max*/ ctx[7]);
    			}

    			if (dirty[0] & /*col1_saturation_floor*/ 256 && input7.value !== /*col1_saturation_floor*/ ctx[8]) {
    				set_input_value(input7, /*col1_saturation_floor*/ ctx[8]);
    			}

    			if (dirty[0] & /*col1_scale_min*/ 1024 && input8.value !== /*col1_scale_min*/ ctx[10]) {
    				set_input_value(input8, /*col1_scale_min*/ ctx[10]);
    			}

    			if (dirty[0] & /*col1_scale_max*/ 2048 && input9.value !== /*col1_scale_max*/ ctx[11]) {
    				set_input_value(input9, /*col1_scale_max*/ ctx[11]);
    			}

    			if (dirty[0] & /*col2_lightness_random*/ 32768) {
    				input10.checked = /*col2_lightness_random*/ ctx[15];
    			}

    			if (dirty[0] & /*col2_lightness_min*/ 4096 && input11.value !== /*col2_lightness_min*/ ctx[12]) {
    				set_input_value(input11, /*col2_lightness_min*/ ctx[12]);
    			}

    			if (dirty[0] & /*col2_lightness_max*/ 8192 && input12.value !== /*col2_lightness_max*/ ctx[13]) {
    				set_input_value(input12, /*col2_lightness_max*/ ctx[13]);
    			}

    			if (dirty[0] & /*col2_lightness_roof*/ 16384 && input13.value !== /*col2_lightness_roof*/ ctx[14]) {
    				set_input_value(input13, /*col2_lightness_roof*/ ctx[14]);
    			}

    			if (dirty[0] & /*col2_saturation_random*/ 524288) {
    				input14.checked = /*col2_saturation_random*/ ctx[19];
    			}

    			if (dirty[0] & /*col2_saturation_min*/ 65536 && input15.value !== /*col2_saturation_min*/ ctx[16]) {
    				set_input_value(input15, /*col2_saturation_min*/ ctx[16]);
    			}

    			if (dirty[0] & /*col2_saturation_max*/ 131072 && input16.value !== /*col2_saturation_max*/ ctx[17]) {
    				set_input_value(input16, /*col2_saturation_max*/ ctx[17]);
    			}

    			if (dirty[0] & /*col2_saturation_floor*/ 262144 && input17.value !== /*col2_saturation_floor*/ ctx[18]) {
    				set_input_value(input17, /*col2_saturation_floor*/ ctx[18]);
    			}

    			if (dirty[0] & /*col2_scale_min*/ 1048576 && input18.value !== /*col2_scale_min*/ ctx[20]) {
    				set_input_value(input18, /*col2_scale_min*/ ctx[20]);
    			}

    			if (dirty[0] & /*col2_scale_max*/ 2097152 && input19.value !== /*col2_scale_max*/ ctx[21]) {
    				set_input_value(input19, /*col2_scale_max*/ ctx[21]);
    			}

    			if (dirty[0] & /*harmonious_only*/ 4194304) {
    				input20.checked = /*harmonious_only*/ ctx[22];
    			}

    			if (dirty[1] & /*icons*/ 1) {
    				each_value_2 = /*icons*/ ctx[31];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_2(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_2.length;
    			}

    			if (dirty[0] & /*icon*/ 8388608 | dirty[1] & /*icons*/ 1) {
    				select_option(select, /*icon*/ ctx[23]);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(h43, null);
    				}
    			}

    			if (/*show_paste_fav*/ ctx[0]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_8(ctx);
    					if_block1.c();
    					if_block1.m(t48.parentNode, t48);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type_1(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(t49.parentNode, t49);
    				}
    			}

    			if (dirty[0] & /*harmonious_only, test, add_to_fav*/ 574619648) {
    				each_value = /*test*/ ctx[25];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each1_anchor.parentNode, each1_anchor);
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
    			if (detaching) detach_dev(hr0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(h40);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(input0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(input1);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(input2);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(input3);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(input4);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(br2);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(input5);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(input6);
    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(input7);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(br3);
    			if (detaching) detach_dev(t14);
    			if (detaching) detach_dev(input8);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(input9);
    			if (detaching) detach_dev(br4);
    			if (detaching) detach_dev(t16);
    			if (detaching) detach_dev(h41);
    			if (detaching) detach_dev(t18);
    			if (detaching) detach_dev(input10);
    			if (detaching) detach_dev(t19);
    			if (detaching) detach_dev(br5);
    			if (detaching) detach_dev(t20);
    			if (detaching) detach_dev(input11);
    			if (detaching) detach_dev(t21);
    			if (detaching) detach_dev(input12);
    			if (detaching) detach_dev(t22);
    			if (detaching) detach_dev(input13);
    			if (detaching) detach_dev(t23);
    			if (detaching) detach_dev(br6);
    			if (detaching) detach_dev(t24);
    			if (detaching) detach_dev(input14);
    			if (detaching) detach_dev(t25);
    			if (detaching) detach_dev(br7);
    			if (detaching) detach_dev(t26);
    			if (detaching) detach_dev(input15);
    			if (detaching) detach_dev(t27);
    			if (detaching) detach_dev(input16);
    			if (detaching) detach_dev(t28);
    			if (detaching) detach_dev(input17);
    			if (detaching) detach_dev(t29);
    			if (detaching) detach_dev(br8);
    			if (detaching) detach_dev(t30);
    			if (detaching) detach_dev(input18);
    			if (detaching) detach_dev(t31);
    			if (detaching) detach_dev(input19);
    			if (detaching) detach_dev(br9);
    			if (detaching) detach_dev(t32);
    			if (detaching) detach_dev(input20);
    			if (detaching) detach_dev(t33);
    			if (detaching) detach_dev(br10);
    			if (detaching) detach_dev(t34);
    			if (detaching) detach_dev(h42);
    			if (detaching) detach_dev(t36);
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t37);
    			if (detaching) detach_dev(br11);
    			if (detaching) detach_dev(br12);
    			if (detaching) detach_dev(t38);
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t44);
    			if (detaching) detach_dev(hr1);
    			if (detaching) detach_dev(t45);
    			if (detaching) detach_dev(h43);
    			if_block0.d();
    			if (detaching) detach_dev(t47);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t48);
    			if_block2.d(detaching);
    			if (detaching) detach_dev(t49);
    			if (detaching) detach_dev(hr2);
    			if (detaching) detach_dev(t50);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each1_anchor);
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

    function get_random_rot() {
    	//randomly select one of 12 angles from 0 - 330 (deg)
    	return Math.floor(Math.random() * 13) * 30;
    }

    function get_colstr_from_obj(obj) {
    	//take {h:x, s:y, l:z}
    	//return "hsl(xdeg y% z%)",
    	return "hsl(" + obj.h + " " + obj.s + "% " + obj.l + "%)";
    }

    function get_random_scale(min, max) {
    	return Math.floor(Math.random() * ((max - min) * 10 + 1)) / 10 + min;
    }

    function bump_L(obj, minimum, maximum, roof, is_random) {
    	//takes an HSL obj and increases its lightness returning new HSL obj
    	let min = parseFloat(minimum);

    	let max = parseFloat(maximum);
    	let r = (max + min) / 2;

    	if (is_random) {
    		r = Math.floor(Math.random() * ((max - min) * 10 + 1)) / 10 + min;
    	}

    	return {
    		h: obj.h,
    		s: obj.s,
    		l: Math.min(parseInt(roof), obj.l * r)
    	};
    }

    function bump_S(obj, minimum, maximum, floor, is_random) {
    	//takes an HSL obj and randomises its saturation returning new HSL obj
    	let min = parseFloat(minimum);

    	let max = parseFloat(maximum);
    	let r = (max + min) / 2;
    	let s = obj.s;

    	if (is_random) {
    		r = Math.floor(Math.random() * ((max - min) * 10 + 1)) / 10 + min;
    		s = Math.max(parseInt(floor), obj.s * r);
    	}

    	return { h: obj.h, s, l: obj.l };
    }

    function get_cookie() {
    	let name = "ECO=";
    	console.log("COOOKIIIIEEEE", document.cookie);
    	let decodedCookie = decodeURIComponent(document.cookie);
    	let ca = decodedCookie.split(";");

    	for (var i = 0; i < ca.length; i++) {
    		var c = ca[i];

    		while (c.charAt(0) == " ") {
    			c = c.substring(1);
    		}

    		if (c.indexOf(name) == 0) {
    			var ret = c.substring(name.length, c.length);

    			try {
    				JSON.parse(ret);
    			} catch(e) {
    				console.warn("error with cookie, couldnt parse", ret, e);
    				return {};
    			}

    			return JSON.parse(ret);
    		}
    	}

    	return {};
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Icon_color", slots, []);
    	let cookie_monster = {};

    	async function copytoclip() {
    		var copy_value = JSON.stringify(favourites, null, 4);
    		await navigator.clipboard.writeText(copy_value);
    	}

    	function do_paste_fav() {
    		if (paste_fav !== "") {
    			$$invalidate(24, favourites = JSON.parse(paste_fav));
    		}
    	}

    	function remove_from_fav(i) {
    		favourites.splice(i, 1);
    		$$invalidate(24, favourites);
    		store_favs();
    	}

    	function add_to_fav(t) {
    		favourites.push(t);
    		$$invalidate(24, favourites);
    		store_favs();
    	}

    	function clear_fav() {
    		$$invalidate(24, favourites = []);
    		store_favs();
    	}

    	function store_favs() {
    		set_cookie("favs", JSON.stringify(favourites));
    	}

    	function retrieve_favs() {
    		cookie_monster = get_cookie();
    		let favs = cookie_monster.favs || "[]";
    		console.log(favs, JSON.parse(favs));
    		$$invalidate(24, favourites = JSON.parse(favs));
    	}

    	

    	function set_cookie(k, v) {
    		cookie_monster[k] = v;
    		var d = new Date();
    		d.setTime(d.getTime() + 365 * 7 * 24 * 60 * 60 * 1000); //expires 1 year
    		var expires = "expires=" + d.toUTCString();
    		var domain = "";
    		document.cookie = "ECO=" + encodeURIComponent(JSON.stringify(cookie_monster)) + ";SameSite=None;Secure;" + expires + ";path=/;" + domain;
    	}

    	onMount(() => {
    		retrieve_favs();
    		init();
    	});

    	let show_paste_fav = false;
    	let paste_fav = "";
    	let col1_lightness_min = 1.1;
    	let col1_lightness_max = 1.6;
    	let col1_lightness_roof = 90;
    	let col1_lightness_random = true;
    	let col1_saturation_min = 0.5;
    	let col1_saturation_max = 1.2;
    	let col1_saturation_floor = 50;
    	let col1_saturation_random = true;
    	let col1_scale_min = 0.8;
    	let col1_scale_max = 1.4;
    	let col2_lightness_min = 0.9;
    	let col2_lightness_max = 1.1;
    	let col2_lightness_roof = 70;
    	let col2_lightness_random = false;
    	let col2_saturation_min = 0.5;
    	let col2_saturation_max = 1.2;
    	let col2_saturation_floor = 50;
    	let col2_saturation_random = true;
    	let col2_scale_min = 0.8;
    	let col2_scale_max = 1.2;
    	let harmonious_only = false;
    	let icons = ["period_statistics", "covid", "environmental", "compliance"];
    	let icon = icons[0];

    	//starting point for our colors
    	let palette = [
    		{
    			//light blue
    			h: 192,
    			s: 80,
    			l: 65
    		},
    		{
    			//blue
    			h: 211,
    			s: 100,
    			l: 42
    		},
    		{
    			//teal
    			h: 180,
    			s: 55,
    			l: 35
    		},
    		{
    			//green
    			h: 94,
    			s: 60,
    			l: 55
    		},
    		{
    			//yellow
    			h: 48,
    			s: 90,
    			l: 57
    		},
    		{
    			//salmon
    			h: 9,
    			s: 80,
    			l: 65
    		},
    		{
    			//purple
    			h: 251,
    			s: 84,
    			l: 71
    		}
    	];

    	let favourites = [];
    	let test = [];

    	function init() {
    		$$invalidate(25, test = []);

    		palette.forEach((c1, i) => {
    			palette.forEach((c2, j) => {
    				if (!harmonious_only && c1 !== c2 || harmonious_only && (Math.abs(i - j) < 2 || Math.abs(i - j) == palette.length - 1)) {
    					//if(c1 !== c2) {
    					let random_c = c1;

    					random_c = bump_L(random_c, col1_lightness_min, col1_lightness_max, col1_lightness_roof, col1_lightness_random);
    					random_c = bump_S(random_c, col1_saturation_min, col1_saturation_max, col1_saturation_floor, col1_saturation_random);
    					let random_c2 = c2;
    					random_c2 = bump_L(random_c2, col2_lightness_min, col2_lightness_max, col2_lightness_roof, col2_lightness_random);
    					random_c2 = bump_S(random_c2, col2_saturation_min, col2_saturation_max, col2_saturation_floor, col2_saturation_random);

    					test.push({
    						col1: get_colstr_from_obj(random_c),
    						col2: get_colstr_from_obj(random_c2),
    						rot1: get_random_rot(),
    						rot2: get_random_rot(),
    						scale1: get_random_scale(col1_scale_min, col1_scale_max),
    						scale2: get_random_scale(col2_scale_min, col2_scale_max),
    						icon
    					});
    				}
    			});
    		});

    		$$invalidate(25, test);
    	}

    	let zombie_interval = false;

    	function play() {
    		zombie_interval = setInterval(init, 1000);
    	}

    	function stop() {
    		clearInterval(zombie_interval);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Icon_color> was created with unknown prop '${key}'`);
    	});

    	function input0_change_handler() {
    		col1_lightness_random = this.checked;
    		$$invalidate(5, col1_lightness_random);
    	}

    	function input1_input_handler() {
    		col1_lightness_min = this.value;
    		$$invalidate(2, col1_lightness_min);
    	}

    	function input2_input_handler() {
    		col1_lightness_max = this.value;
    		$$invalidate(3, col1_lightness_max);
    	}

    	function input3_input_handler() {
    		col1_lightness_roof = this.value;
    		$$invalidate(4, col1_lightness_roof);
    	}

    	function input4_change_handler() {
    		col1_saturation_random = this.checked;
    		$$invalidate(9, col1_saturation_random);
    	}

    	function input5_input_handler() {
    		col1_saturation_min = this.value;
    		$$invalidate(6, col1_saturation_min);
    	}

    	function input6_input_handler() {
    		col1_saturation_max = this.value;
    		$$invalidate(7, col1_saturation_max);
    	}

    	function input7_input_handler() {
    		col1_saturation_floor = this.value;
    		$$invalidate(8, col1_saturation_floor);
    	}

    	function input8_input_handler() {
    		col1_scale_min = this.value;
    		$$invalidate(10, col1_scale_min);
    	}

    	function input9_input_handler() {
    		col1_scale_max = this.value;
    		$$invalidate(11, col1_scale_max);
    	}

    	function input10_change_handler() {
    		col2_lightness_random = this.checked;
    		$$invalidate(15, col2_lightness_random);
    	}

    	function input11_input_handler() {
    		col2_lightness_min = this.value;
    		$$invalidate(12, col2_lightness_min);
    	}

    	function input12_input_handler() {
    		col2_lightness_max = this.value;
    		$$invalidate(13, col2_lightness_max);
    	}

    	function input13_input_handler() {
    		col2_lightness_roof = this.value;
    		$$invalidate(14, col2_lightness_roof);
    	}

    	function input14_change_handler() {
    		col2_saturation_random = this.checked;
    		$$invalidate(19, col2_saturation_random);
    	}

    	function input15_input_handler() {
    		col2_saturation_min = this.value;
    		$$invalidate(16, col2_saturation_min);
    	}

    	function input16_input_handler() {
    		col2_saturation_max = this.value;
    		$$invalidate(17, col2_saturation_max);
    	}

    	function input17_input_handler() {
    		col2_saturation_floor = this.value;
    		$$invalidate(18, col2_saturation_floor);
    	}

    	function input18_input_handler() {
    		col2_scale_min = this.value;
    		$$invalidate(20, col2_scale_min);
    	}

    	function input19_input_handler() {
    		col2_scale_max = this.value;
    		$$invalidate(21, col2_scale_max);
    	}

    	function input20_change_handler() {
    		harmonious_only = this.checked;
    		$$invalidate(22, harmonious_only);
    	}

    	function select_change_handler() {
    		icon = select_value(this);
    		$$invalidate(23, icon);
    		$$invalidate(31, icons);
    	}

    	const click_handler = () => {
    		$$invalidate(0, show_paste_fav = !show_paste_fav);
    	};

    	function textarea_input_handler() {
    		paste_fav = this.value;
    		$$invalidate(1, paste_fav);
    	}

    	const click_handler_1 = () => {
    		do_paste_fav();
    		$$invalidate(0, show_paste_fav = false);
    	};

    	const click_handler_2 = i => {
    		remove_from_fav(i);
    	};

    	const click_handler_3 = t => {
    		add_to_fav(t);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		cookie_monster,
    		get_random_rot,
    		get_colstr_from_obj,
    		get_random_scale,
    		copytoclip,
    		do_paste_fav,
    		bump_L,
    		bump_S,
    		remove_from_fav,
    		add_to_fav,
    		clear_fav,
    		store_favs,
    		retrieve_favs,
    		get_cookie,
    		set_cookie,
    		show_paste_fav,
    		paste_fav,
    		col1_lightness_min,
    		col1_lightness_max,
    		col1_lightness_roof,
    		col1_lightness_random,
    		col1_saturation_min,
    		col1_saturation_max,
    		col1_saturation_floor,
    		col1_saturation_random,
    		col1_scale_min,
    		col1_scale_max,
    		col2_lightness_min,
    		col2_lightness_max,
    		col2_lightness_roof,
    		col2_lightness_random,
    		col2_saturation_min,
    		col2_saturation_max,
    		col2_saturation_floor,
    		col2_saturation_random,
    		col2_scale_min,
    		col2_scale_max,
    		harmonious_only,
    		icons,
    		icon,
    		palette,
    		favourites,
    		test,
    		init,
    		zombie_interval,
    		play,
    		stop
    	});

    	$$self.$inject_state = $$props => {
    		if ("cookie_monster" in $$props) cookie_monster = $$props.cookie_monster;
    		if ("show_paste_fav" in $$props) $$invalidate(0, show_paste_fav = $$props.show_paste_fav);
    		if ("paste_fav" in $$props) $$invalidate(1, paste_fav = $$props.paste_fav);
    		if ("col1_lightness_min" in $$props) $$invalidate(2, col1_lightness_min = $$props.col1_lightness_min);
    		if ("col1_lightness_max" in $$props) $$invalidate(3, col1_lightness_max = $$props.col1_lightness_max);
    		if ("col1_lightness_roof" in $$props) $$invalidate(4, col1_lightness_roof = $$props.col1_lightness_roof);
    		if ("col1_lightness_random" in $$props) $$invalidate(5, col1_lightness_random = $$props.col1_lightness_random);
    		if ("col1_saturation_min" in $$props) $$invalidate(6, col1_saturation_min = $$props.col1_saturation_min);
    		if ("col1_saturation_max" in $$props) $$invalidate(7, col1_saturation_max = $$props.col1_saturation_max);
    		if ("col1_saturation_floor" in $$props) $$invalidate(8, col1_saturation_floor = $$props.col1_saturation_floor);
    		if ("col1_saturation_random" in $$props) $$invalidate(9, col1_saturation_random = $$props.col1_saturation_random);
    		if ("col1_scale_min" in $$props) $$invalidate(10, col1_scale_min = $$props.col1_scale_min);
    		if ("col1_scale_max" in $$props) $$invalidate(11, col1_scale_max = $$props.col1_scale_max);
    		if ("col2_lightness_min" in $$props) $$invalidate(12, col2_lightness_min = $$props.col2_lightness_min);
    		if ("col2_lightness_max" in $$props) $$invalidate(13, col2_lightness_max = $$props.col2_lightness_max);
    		if ("col2_lightness_roof" in $$props) $$invalidate(14, col2_lightness_roof = $$props.col2_lightness_roof);
    		if ("col2_lightness_random" in $$props) $$invalidate(15, col2_lightness_random = $$props.col2_lightness_random);
    		if ("col2_saturation_min" in $$props) $$invalidate(16, col2_saturation_min = $$props.col2_saturation_min);
    		if ("col2_saturation_max" in $$props) $$invalidate(17, col2_saturation_max = $$props.col2_saturation_max);
    		if ("col2_saturation_floor" in $$props) $$invalidate(18, col2_saturation_floor = $$props.col2_saturation_floor);
    		if ("col2_saturation_random" in $$props) $$invalidate(19, col2_saturation_random = $$props.col2_saturation_random);
    		if ("col2_scale_min" in $$props) $$invalidate(20, col2_scale_min = $$props.col2_scale_min);
    		if ("col2_scale_max" in $$props) $$invalidate(21, col2_scale_max = $$props.col2_scale_max);
    		if ("harmonious_only" in $$props) $$invalidate(22, harmonious_only = $$props.harmonious_only);
    		if ("icons" in $$props) $$invalidate(31, icons = $$props.icons);
    		if ("icon" in $$props) $$invalidate(23, icon = $$props.icon);
    		if ("palette" in $$props) palette = $$props.palette;
    		if ("favourites" in $$props) $$invalidate(24, favourites = $$props.favourites);
    		if ("test" in $$props) $$invalidate(25, test = $$props.test);
    		if ("zombie_interval" in $$props) zombie_interval = $$props.zombie_interval;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		show_paste_fav,
    		paste_fav,
    		col1_lightness_min,
    		col1_lightness_max,
    		col1_lightness_roof,
    		col1_lightness_random,
    		col1_saturation_min,
    		col1_saturation_max,
    		col1_saturation_floor,
    		col1_saturation_random,
    		col1_scale_min,
    		col1_scale_max,
    		col2_lightness_min,
    		col2_lightness_max,
    		col2_lightness_roof,
    		col2_lightness_random,
    		col2_saturation_min,
    		col2_saturation_max,
    		col2_saturation_floor,
    		col2_saturation_random,
    		col2_scale_min,
    		col2_scale_max,
    		harmonious_only,
    		icon,
    		favourites,
    		test,
    		copytoclip,
    		do_paste_fav,
    		remove_from_fav,
    		add_to_fav,
    		clear_fav,
    		icons,
    		init,
    		play,
    		stop,
    		input0_change_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input4_change_handler,
    		input5_input_handler,
    		input6_input_handler,
    		input7_input_handler,
    		input8_input_handler,
    		input9_input_handler,
    		input10_change_handler,
    		input11_input_handler,
    		input12_input_handler,
    		input13_input_handler,
    		input14_change_handler,
    		input15_input_handler,
    		input16_input_handler,
    		input17_input_handler,
    		input18_input_handler,
    		input19_input_handler,
    		input20_change_handler,
    		select_change_handler,
    		click_handler,
    		textarea_input_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3
    	];
    }

    class Icon_color extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {}, [-1, -1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Icon_color",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new Icon_color({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=icon_color.js.map
