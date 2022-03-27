<script>
    import { onMount} from 'svelte';
    
    
    let canvas;
    let context;
    let radius = 3;
    let dragging = false;
    let marks = false;

    let log = '';


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
        }
    }


    function paint(e) {

        if (dragging) {
            let pos = getMousePosition(e);
            log += 'paint / ' + pos.x + '/' + e.offsetX + '/' + canvas.width + '/' + canvas.clientWidth + '/';
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


        //convert canvas to data and send up to parent
    };
    function touchengage(e) {
        dragging = true;
        marks = true;

    };
    function touchdisengage() {
        dragging = false;
        context.beginPath();


        //convert canvas to data and send up to parent
    };

    function touchpaint(e) {
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
    {log}<br>
    <span on:click="{ ()=> { log=''}}"> CLear </span>
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