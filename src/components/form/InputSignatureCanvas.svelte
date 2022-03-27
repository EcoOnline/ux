<script>
    import { onMount} from 'svelte';
	import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
    
    
    let canvas;
    let context;
    let radius = 1;
    let dragging = false;
    let marks = false;

    let offX = 0;
    let offY = 0;

    export let dataurl = false;

    $: {
        let d = dataurl;

        if(d) {
            //clear first
            context.clearRect(0, 0, canvas.width, canvas.height);
            //paint from message onto canvas
            let img = new Image;
            img.onload = function(){
                context.drawImage(img,0,0);
                marks = true;
            };
            img.src = d;
        }
    }


    function anounceSig() {
        let data = canvas.toDataURL();
    }

    function getMousePosition(e) {
        var mouseX = e.offsetX * canvas.width / canvas.clientWidth | 0;
        var mouseY = e.offsetY * canvas.height / canvas.clientHeight | 0;
        return {x: mouseX, y: mouseY};
    }

    function clearCanvas() {
        clearFunc(0);
        marks = false;

    }
    function clearFunc(i) {
        i+= 10;
        context.clearRect(0, 0, i, canvas.height);

        if(i < canvas.width){
            setTimeout(() => {
                clearFunc(i);
            }, 5);
        } else {
            dispatch('signature', {
                signature: canvas.toDataURL()
            });
        }
    }


    function paint(e) {

        if (dragging) {
            let pos = getMousePosition(e);
            context.lineTo(pos.x,pos.y);
            context.lineWidth = radius * 2;
            context.stroke();
            context.beginPath();
            context.arc(pos.x, pos.y, radius, 0, 3.14156 * 2);
            context.fill();
            context.beginPath();
            context.moveTo(pos.x, pos.y);
        }
    };

    function engage(e) {
        dragging = true;
        paint(e);
        marks = true;

    };
    function disengage() {
        dragging = false;
        context.beginPath();
        dispatch('signature', {
			signature: canvas.toDataURL()
		});

        //convert canvas to data and send up to parent
    };
    function touchengage(e) {
        dragging = true;
        marks = true;

    };
    function touchdisengage() {
        dragging = false;
        context.beginPath();
        dispatch('signature', {
			signature: canvas.toDataURL()
		});


        //convert canvas to data and send up to parent
    };

    function touchpaint(e) {
        let touch = e.touches[0];
        paint({
            clientX: touch.clientX,
            offsetX: touch.clientX - offX,
            clientY: touch.clientY,
            offsetY: touch.clientY - offY
        });
    }
    
        
    onMount(() => {
        context = canvas.getContext('2d');
        context.mozImageSmoothingEnabled = false;
        context.imageSmoothingEnabled = false;

        let rect = canvas.getBoundingClientRect();
        offX = rect.x;
        offY = rect.y;
    });

</script>
<div class="canvas-holder">
    <canvas 
        bind:this="{canvas}"
        on:mousedown="{engage}"
        on:mousemove="{paint}"
        on:mouseup="{disengage}"
        on:contextmenu="{disengage}"
        on:touchstart="{touchengage}"
        on:touchmove|preventDefault|stopPropagation="{touchpaint}"
        on:touchend="{touchdisengage}"
    ></canvas>
    {#if marks}
        <i class="i-reset i-20" on:click|stopPropagation|preventDefault={clearCanvas}></i>
    {:else}
        <i class="i-reset i-20" style="opacity:0.5"></i>
    {/if}
</div>
<style>
    .canvas-holder {
        position:relative;
        width:100%;
        height:100%;
    }
    canvas {
        box-shadow: 0 0 16px rgba(0,0,0,0.05);
        width:100%;
        height:100%;
    }
    .i-20 {
        position:absolute;
        top:8px;
        right:8px;
    }

</style>