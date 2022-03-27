<script>
    import { onMount} from 'svelte';
    
    
    let canvas;
    let context;
    let radius = 3;
    let dragging = false;
    let marks = false;


    let x1 = 0;
    let x2 = 0;
    let tick = 0;
    let log = '';


    function anounceSig() {
        let data = canvas.toDataURL();
    }

    function getMousePosition(e) {
        x2 = e.offsetX;
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
        }
    }




    function paint(e) {
        log += 'paint / ';
        if (dragging) {
            context.lineTo(getMousePosition(e).x, getMousePosition(e).y);
            context.lineWidth = radius * 2;
            context.stroke();
            context.beginPath();
            context.arc(getMousePosition(e).x, getMousePosition(e).y, radius, 0, Math.PI * 2);
            context.fill();
            context.beginPath();
            context.moveTo(getMousePosition(e).x, getMousePosition(e).y);
        }
    };

    function engage(e) {
        dragging = true;
        paint(e);
        marks = true;
        log += 'engage / ';

    };
    function disengage() {
        dragging = false;
        context.beginPath();
        log += 'disengage / ';


        //convert canvas to data and send up to parent
    };
    function touchengage(e) {
        dragging = true;
        marks = true;
        log += 'touchengage / ';

    };
    function touchdisengage() {
        dragging = false;
        context.beginPath();
        log += 'touchdisengage / ';


        //convert canvas to data and send up to parent
    };

    function touchpaint(e) {
        log += 'touchpaint / ' + (e.touches ? 'yes' : 'no');
        let touch = e.touches[0];
        
        paint({
            clientX: touch.clientX,
            offsetX: touch.offsetX,
            clientY: touch.clientY,
            offsetY: touch.offsetY
        });
    }
    
        
    onMount(() => {
        context = canvas.getContext('2d');
        context.mozImageSmoothingEnabled = false;
        context.imageSmoothingEnabled = false;
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
        on:touchmove="{touchpaint}"
        on:touchend="{touchdisengage}"
    ></canvas>
    {#if marks}
        <i class="i-trash i-20" on:click={clearCanvas}></i>
    {:else}
        <i class="i-trash i-20" style="opacity:0.5"></i>
    {/if}
    <br>
    {x1}:{x2}<br>
    {log}
    <br>
    <br>
    <br>
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