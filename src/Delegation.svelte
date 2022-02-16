<script>
	
    let accountability = 0; //right
    let responsibility = 100; //left
    let authority = 100; //up
    const min = 5;
    let shiftx = 0;
    let shifty = 0;



    $: topw = Math.max(accountability, min);
    $: toph = Math.max(responsibility, min);
    $: sidew = Math.max(authority, min);
    $: sideh = Math.max(accountability, min);
    $: facew = Math.max(responsibility, min);
    $: faceh = Math.max(authority, min);


    $: {
        let x = responsibility;
        let y = accountability;
        let z = authority;

        shifty = 50 - authority;
        shifty -= (50 - responsibility)/1.9
        shifty -= (50 - accountability)/1.9

        shiftx = 0;
        shiftx -= responsibility/(1.127) 
        shiftx += accountability/(1.127)
    }

</script>

<div class="page">
    
    <svg width="420" height="400" viewBox="0 0 420 400" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <g transform="translate(100, 70)">
            <g transform="translate(13, 20)">
                <line x1="100" y1="115.50" x2="100" y2="0"></line>
                <line x1="0" y1="174" x2="100" y2="115.50" ></line>
                <line x1="100" y1="115.5" x2="200" y2="174"></line>
            </g>
            <text transform="rotate(-90) translate(20, 120)"><tspan x="0" y="0" text-anchor="middle">Authority</tspan></text>
            <text transform="rotate(-30) skewX(-30) translate(-40, 180)"><tspan x="0" y="0" text-anchor="middle">Responsibility</tspan></text>
            <text transform="rotate(30) skewX(30) translate(300, 70)"><tspan x="0" y="0" text-anchor="middle">Accountability</tspan></text> 

            <g id="holder" transform="translate({shiftx}, {shifty})">
                <rect class="face" x=0 y=0 width="{facew}" height="{faceh}"></rect>
                <rect class="top" x=0 y=0 width="{topw}" height="{toph}"></rect>
                <rect class="side" x=0 y=0 width="{sidew}" height="{sideh}"></rect>
            </g>
        </g>
    </svg>
    <br>

    <label><input type="range" min="0" max="100" step="5" bind:value="{accountability}"> Accountability ({accountability})</label><br>
    <label><input type="range" min="0" max="100" step="5" bind:value="{responsibility}"> Responsibility ({responsibility})</label><br>
    <label><input type="range" min="0" max="100" step="5" bind:value="{authority}"> Authority ({authority})</label><br>

</div>

<style>
    .page {
        margin:50px;
        background:#fff;
        padding:32px;
    }
    svg {
        margin:50px;
    }
    g {
        
    }
    rect {
        transform-origin: 0 0;
        transition: all 0.3s linear
    }
    #holder {
        transition: all 0.3s linear

    }
    .face { transform: rotate(-30deg) skewX(-30deg) translate(130px, 172px) scaleY(0.864);fill: rgba(255,230,100,0.8) }
    .side { transform: rotate(90deg) skewX(-30deg) translate(69px, -113px) scaleY(0.864);fill: rgba(255,250,200,0.8)}
    .top {  transform: rotate(210deg) skew(-30deg) translate(-200px, -60px) scaleY(0.864);fill: rgba(255,200,0,0.8)}

    line {
        stroke: #333;
        stroke-width: 1;
    }
</style>