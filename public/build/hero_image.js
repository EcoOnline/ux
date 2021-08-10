
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
    function null_to_empty(value) {
        return value == null ? '' : value;
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

    /* src/Hero_image.svelte generated by Svelte v3.35.0 */

    const file = "src/Hero_image.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i];
    	return child_ctx;
    }

    // (82:1) {#each images as image}
    function create_each_block(ctx) {
    	let div1;
    	let div0;
    	let img;
    	let img_src_value;
    	let div1_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			img = element("img");
    			if (img.src !== (img_src_value = /*image*/ ctx[19].src)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "web screen");
    			attr_dev(img, "class", "svelte-1x6t5fj");
    			add_location(img, file, 82, 101, 2058);
    			attr_dev(div0, "class", "svelte-1x6t5fj");
    			add_location(div0, file, 82, 96, 2053);

    			attr_dev(div1, "class", div1_class_value = "" + (null_to_empty(/*image*/ ctx[19].type == "web"
    			? "web_image"
    			: "mobile_image") + " svelte-1x6t5fj"));

    			add_location(div1, file, 82, 2, 1959);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, img);

    			if (!mounted) {
    				dispose = listen_dev(div1, "click", /*download_image*/ ctx[12], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*images*/ 8 && img.src !== (img_src_value = /*image*/ ctx[19].src)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*images*/ 8 && div1_class_value !== (div1_class_value = "" + (null_to_empty(/*image*/ ctx[19].type == "web"
    			? "web_image"
    			: "mobile_image") + " svelte-1x6t5fj"))) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(82:1) {#each images as image}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div6;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let div0;
    	let p;
    	let t1;
    	let br0;
    	let t2;
    	let br1;
    	let t3;
    	let t4;
    	let input;
    	let t5;
    	let t6;
    	let div5;
    	let a;
    	let img1;
    	let img1_src_value;
    	let t7;
    	let div2;
    	let div1;
    	let img2;
    	let img2_src_value;
    	let t8;
    	let div4;
    	let div3;
    	let img3;
    	let img3_src_value;
    	let mounted;
    	let dispose;
    	let each_value = /*images*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			img0 = element("img");
    			t0 = space();
    			div0 = element("div");
    			p = element("p");
    			t1 = text("Drag an image here or click to select from files.");
    			br0 = element("br");
    			t2 = text("\n\t\t\tLandscape images will get browser UI, portrait images will get mobile UI");
    			br1 = element("br");
    			t3 = text("\n\t\t\tYou can then click the image to download it with the frame");
    			t4 = space();
    			input = element("input");
    			t5 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t6 = space();
    			div5 = element("div");
    			a = element("a");
    			img1 = element("img");
    			t7 = space();
    			div2 = element("div");
    			div1 = element("div");
    			img2 = element("img");
    			t8 = space();
    			div4 = element("div");
    			div3 = element("div");
    			img3 = element("img");
    			attr_dev(img0, "class", "loader_image svelte-1x6t5fj");
    			if (img0.src !== (img0_src_value = "")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "loader_img");
    			add_location(img0, file, 73, 1, 1321);
    			add_location(br0, file, 76, 52, 1700);
    			add_location(br1, file, 77, 75, 1780);
    			attr_dev(p, "class", "svelte-1x6t5fj");
    			add_location(p, file, 75, 2, 1644);
    			attr_dev(input, "type", "file");
    			attr_dev(input, "class", "svelte-1x6t5fj");
    			add_location(input, file, 79, 2, 1853);
    			attr_dev(div0, "id", "test");
    			attr_dev(div0, "class", "drop_region svelte-1x6t5fj");
    			attr_dev(div0, "ondragover", "return false");
    			toggle_class(div0, "highlight", /*highlight*/ ctx[1]);
    			add_location(div0, file, 74, 1, 1424);
    			if (img1.src !== (img1_src_value = "")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "downloader");
    			add_location(img1, file, 86, 37, 2188);
    			attr_dev(a, "download", "myImage.png");
    			attr_dev(a, "href", "/");
    			add_location(a, file, 86, 2, 2153);
    			if (img2.src !== (img2_src_value = "./images/webtest.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "web screen");
    			attr_dev(img2, "class", "svelte-1x6t5fj");
    			add_location(img2, file, 87, 30, 2329);
    			attr_dev(div1, "class", "svelte-1x6t5fj");
    			add_location(div1, file, 87, 25, 2324);
    			attr_dev(div2, "class", "web_image svelte-1x6t5fj");
    			add_location(div2, file, 87, 2, 2301);
    			if (img3.src !== (img3_src_value = "./images/mobiletest.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "mobile screen");
    			attr_dev(img3, "class", "svelte-1x6t5fj");
    			add_location(img3, file, 88, 33, 2425);
    			attr_dev(div3, "class", "svelte-1x6t5fj");
    			add_location(div3, file, 88, 28, 2420);
    			attr_dev(div4, "class", "mobile_image svelte-1x6t5fj");
    			add_location(div4, file, 88, 2, 2394);
    			set_style(div5, "display", "none");
    			add_location(div5, file, 85, 1, 2124);
    			attr_dev(div6, "class", "page svelte-1x6t5fj");
    			add_location(div6, file, 72, 0, 1301);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, img0);
    			/*img0_binding*/ ctx[13](img0);
    			append_dev(div6, t0);
    			append_dev(div6, div0);
    			append_dev(div0, p);
    			append_dev(p, t1);
    			append_dev(p, br0);
    			append_dev(p, t2);
    			append_dev(p, br1);
    			append_dev(p, t3);
    			append_dev(div0, t4);
    			append_dev(div0, input);
    			/*input_binding*/ ctx[14](input);
    			/*div0_binding*/ ctx[15](div0);
    			append_dev(div6, t5);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div6, null);
    			}

    			append_dev(div6, t6);
    			append_dev(div6, div5);
    			append_dev(div5, a);
    			append_dev(a, img1);
    			/*img1_binding*/ ctx[16](img1);
    			append_dev(div5, t7);
    			append_dev(div5, div2);
    			append_dev(div2, div1);
    			append_dev(div1, img2);
    			append_dev(div5, t8);
    			append_dev(div5, div4);
    			append_dev(div4, div3);
    			append_dev(div3, img3);

    			if (!mounted) {
    				dispose = [
    					listen_dev(img0, "load", /*save_image*/ ctx[6], false, false, false),
    					listen_dev(input, "change", /*change_file*/ ctx[8], false, false, false),
    					listen_dev(div0, "click", /*drop_click*/ ctx[7], false, false, false),
    					listen_dev(div0, "drop", /*drop_file*/ ctx[9], false, false, false),
    					listen_dev(div0, "dragenter", /*highlights*/ ctx[10], false, false, false),
    					listen_dev(div0, "dragleave", /*unhighlights*/ ctx[11], false, false, false),
    					listen_dev(img1, "load", load_handler, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*highlight*/ 2) {
    				toggle_class(div0, "highlight", /*highlight*/ ctx[1]);
    			}

    			if (dirty & /*images, download_image*/ 4104) {
    				each_value = /*images*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div6, t6);
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
    			if (detaching) detach_dev(div6);
    			/*img0_binding*/ ctx[13](null);
    			/*input_binding*/ ctx[14](null);
    			/*div0_binding*/ ctx[15](null);
    			destroy_each(each_blocks, detaching);
    			/*img1_binding*/ ctx[16](null);
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

    const load_handler = e => e.target.parentNode.click();

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Hero_image", slots, []);
    	let drop_region;
    	let highlight = false;
    	let file_input;
    	let images = [];
    	let loader_image;
    	let downloader;
    	let reader = new FileReader();

    	reader.onload = function (e) {
    		$$invalidate(4, loader_image.src = e.target.result, loader_image);
    	};

    	function save_image() {
    		let new_image = {
    			"type": loader_image.width > loader_image.height
    			? "web"
    			: "mobile",
    			"src": loader_image.src
    		};

    		images.unshift(new_image);
    		$$invalidate(4, loader_image.src = "", loader_image);
    		$$invalidate(3, images);
    	}

    	function drop_click() {
    		file_input.click();
    	}

    	function change_file() {
    		let files = file_input.files;
    		handle_files(files);
    	}

    	function drop_file(e) {
    		e.preventDefault();
    		let files = e.dataTransfer.files;
    		handle_files(files);
    		unhighlights();
    	}

    	function handle_files(files) {
    		for (var i = 0, len = files.length; i < len; i++) {
    			reader.readAsDataURL(files[i]);
    		}
    	}

    	function highlights() {
    		$$invalidate(1, highlight = true);
    	}

    	function unhighlights() {
    		$$invalidate(1, highlight = false);
    	}

    	function download_image(e) {
    		let t = e.target;

    		if (!t.classList.contains("web_image") && !t.classList.contains("mobile_image")) {
    			t = t.parentNode.parentNode;
    		}

    		html2canvas(t).then(canvas => {
    			let resource = canvas.toDataURL("image/png");
    			$$invalidate(5, downloader.parentNode.href = resource, downloader);
    			$$invalidate(5, downloader.src = resource, downloader);
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Hero_image> was created with unknown prop '${key}'`);
    	});

    	function img0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			loader_image = $$value;
    			$$invalidate(4, loader_image);
    		});
    	}

    	function input_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			file_input = $$value;
    			$$invalidate(2, file_input);
    		});
    	}

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			drop_region = $$value;
    			$$invalidate(0, drop_region);
    		});
    	}

    	function img1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			downloader = $$value;
    			$$invalidate(5, downloader);
    		});
    	}

    	$$self.$capture_state = () => ({
    		drop_region,
    		highlight,
    		file_input,
    		images,
    		loader_image,
    		downloader,
    		reader,
    		save_image,
    		drop_click,
    		change_file,
    		drop_file,
    		handle_files,
    		highlights,
    		unhighlights,
    		download_image
    	});

    	$$self.$inject_state = $$props => {
    		if ("drop_region" in $$props) $$invalidate(0, drop_region = $$props.drop_region);
    		if ("highlight" in $$props) $$invalidate(1, highlight = $$props.highlight);
    		if ("file_input" in $$props) $$invalidate(2, file_input = $$props.file_input);
    		if ("images" in $$props) $$invalidate(3, images = $$props.images);
    		if ("loader_image" in $$props) $$invalidate(4, loader_image = $$props.loader_image);
    		if ("downloader" in $$props) $$invalidate(5, downloader = $$props.downloader);
    		if ("reader" in $$props) reader = $$props.reader;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		drop_region,
    		highlight,
    		file_input,
    		images,
    		loader_image,
    		downloader,
    		save_image,
    		drop_click,
    		change_file,
    		drop_file,
    		highlights,
    		unhighlights,
    		download_image,
    		img0_binding,
    		input_binding,
    		div0_binding,
    		img1_binding
    	];
    }

    class Hero_image extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Hero_image",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new Hero_image({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=hero_image.js.map
