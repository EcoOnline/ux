<script>
    import Icon from './components/Icon.svelte';

    let easings = [
      {'name': 'linear', 'value': 'linear'},
      {'name': 'ease', 'value': 'ease'},
      {'name': 'ease in', 'value': 'ease-in'},
      {'name': 'ease out', 'value': 'ease-out'},
      {'name': 'ease in out', 'value': 'ease-in-out'},
      {'name': 'ease out back','value': 'cubic-bezier(0.34, 1.56, 0.64, 1)'},
      {'name': 'bounce','value': 'cubic-bezier(.23,-0.29,.75,1.31)'}   
    ];

    let timings = [
      {'name': 'duration 01', 'value': 70},
      {'name': 'duration 02', 'value': 110},
      {'name': 'duration 03', 'value': 150},
      {'name': 'duration 04', 'value': 240},
      {'name': 'duration 05', 'value': 600},
      {'name': 'duration 06', 'value': 1000},
    ]

    $: {
      let t = timings;
      let e = easings;

      examples = examples;
      example = example;
    }

    let examples = [
      {'name': 'button', 'animations': [
        {'name': 'shadow on hover', 'timing': timings[1], 'easing': easings[0]}
      ]},
      {'name': 'pullout drawer', 'animations': [
        {'name': 'enter', 'timing': timings[3], 'easing': easings[6]},
        {'name': 'exit', 'timing': timings[1], 'easing': easings[2]},
      ]},
      {'name': 'skeleton', 'animations': [
        {'name': 'shadow load', 'timing': timings[5], 'easing': easings[0]}
      ]},
    ]

    let example = examples[2];

    let drawer_in = false;

    function set_default_timings() {
      timings[0].value = 70;
      timings[1].value = 110;
      timings[2].value = 150;
      timings[3].value = 240;
      timings[4].value = 600;
      timings[5].value = 1000;
    }

</script>

<div class="wrapper">

  {#each timings as time}
    <div>
      {time.name} <input type='range' bind:value={time.value} min="0" max="2000"> {time.value}
    </div>
  {/each}

  <hr>
  <select bind:value={example} style="margin-bottom:16px;">
    {#each examples as ex}
      <option value={ex}>{ex.name}</option>
    {/each}
  </select>
  <br>

  {#if example}
    <b>{example.name}</b><br>
    {#each example.animations as animation}
      <div>
      {animation.name} <select bind:value={animation.easing}>
        {#each easings as e}
          <option value={e}>{e.name}</option>
        {/each}
      </select> <select bind:value={animation.timing}>
        {#each timings as t}
          <option value={t}>{t.name} {t.value}ms</option>
        {/each}
      </select>
    </div>
    {/each}
    <hr>

    {#if example.name == 'button'}
      <!-- svelte-ignore a11y-missing-attribute -->
      <a href="/" class='btn' style:transition-duration={example.animations[0].timing.value +'ms'} style:transition-timing-function={example.animations[0].easing.value}>Hover to test</a>
    {/if}
    {#if example.name == 'pullout drawer'}
      <a href="/" class='btn' on:click|preventDefault={()=> { drawer_in = !drawer_in}}>Click to toggle drawer</a>
    {/if}
    {#if example.name == 'skeleton'}
      <table class='table skeleton' style:--skeleton_timing={example.animations[0].timing.value + 'ms'}>
        <thead>
          <tr>
            <th style="width:200px"><b></b></th>
            <th style="width:60px"><b></b></th>
            <th><b></b></th>
            <th><b></b></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><b></b></td>
            <td><b></b></td>
            <td><b></b></td>
            <td><b></b></td>
          </tr>
          <tr>
            <td><b></b></td>
            <td><b></b></td>
            <td><b></b></td>
            <td><b></b></td>
          </tr>
        </tbody>
      </table>
    {/if}
  {/if}

</div>

{#if example.name == 'pullout drawer'}
  <div class="animedrawer" class:in={drawer_in} style:transition-duration={example.animations[(drawer_in?0:1)].timing.value +'ms'} style:transition-timing-function={example.animations[(drawer_in?0:1)].easing.value}>

    this is  right hand side drawer
  </div>
{/if}




<Icon key='admin_color' size='96'></Icon>
<Icon key='admin_bw' size='32'></Icon>
<Icon key='admin_bw'></Icon>
<Icon key='fjkljsfdkljdskl'></Icon>

<style>

  :root {
    --skeleton_easing: linear;
    --skeleton_timing: 1000ms;
  }

  .wrapper {
    margin:40px;
  }

  .table {
    width:100%;
    border-collapse: collapse;
    border-radius:8px;
    overflow: hidden;
    box-sizing: border-box;
  }

  .table th{
    padding:8px 16px;
    text-align: left;
    background:#ccc;
  }
  .table td {
    padding:8px 16px;
    border-bottom:1px solid #ccc;
  }
  .btn {
    cursor:pointer !important;
    display: inline-block;
  }
  .btn:hover {
    box-shadow: 0 4px 8px rgba(0,0,0,0.5);
    transition-property: box-shadow;
    cursor:pointer !important;
  }


  .skeleton b {
    display: inline-block;
    height:12px;
    width:100%;
    max-width:120px;
    border-radius:2px;
    background: linear-gradient(90deg, rgba(0,0,0,0.3), rgba(0,0,0,0.1));
    background-size: 200% 200%;

    -webkit-animation: skeleton var(--skeleton_timing) var(--skeleton_easing) infinite;
    -moz-animation: skeleton var(--skeleton_timing) var(--skeleton_easing) infinite;
    animation: skeleton var(--skeleton_timing) var(--skeleton_easing) infinite;
}

@-webkit-keyframes skeleton {
    0%{background-position:0% 50%}
    50%{background-position:100% 50%}
    100%{background-position:0% 50%}
}
@-moz-keyframes skeleton {
    0%{background-position:0% 50%}
    50%{background-position:100% 50%}
    100%{background-position:0% 50%}
}
@keyframes skeleton {
    0%{background-position:0% 50%}
    50%{background-position:100% 50%}
    100%{background-position:0% 50%}
}

  .animedrawer {
      position:absolute;
      top:0;
      padding:16px 36px 16px 16px;
      right:-532px;
      width:532px;
      height:100vh;
      background:#fff;
      border-left:1px solid #ccc;
      transition-property: right;
  }
  .animedrawer.in {
    right:-20px;
  }
  /*
  input[type='range'] {
    width:400px;
    transition: 1s all linear;
  }
  input[type='range']::-ms-thumb,
  input[type='range']::-moz-range-thumb,
  input[type='range']::-webkit-range-thumb {
    transition: 1s all linear;
    background-color:red;
  }*/

  input[type=range] {
   -webkit-appearance: none;
}
input[type=range]::-webkit-slider-runnable-track {
   width: 300px;
   height: 5px;
   background: #ddd;
   border: none;
   border-radius: 3px;
}
input[type=range]::-webkit-slider-thumb {
   -webkit-appearance: none;
   border: none;
   height: 16px;
   width: 16px;
   border-radius: 50%;
   background: #1CD994;
   transition: All 500ms linear;
   margin-top: -4px;
}
input[type=range]:focus {
   outline: none;
}
 input[type=range]:focus::-webkit-slider-runnable-track {
   background: #ccc;
}
input[type=range] {
   /* fix for FF unable to apply focus style bug  */
   border: 1px solid white;
   /*required for proper track sizing in FF*/
   width: 300px;
}
 input[type=range]::-moz-range-track {
   width: 300px;
   height: 5px;
   background: #ddd;
   border: none;
   border-radius: 3px;
}
 input[type=range]::-moz-range-thumb {
   border: none;
   height: 12px;
   width: 12px;
   border-radius: 50%;
   background: #1CD994;
   transition: All 500ms linear;
}

/*hide the outline behind the border*/
input[type=range]:-moz-focusring {
   outline: 1px solid white;
   outline-offset: -1px;
}
 input[type=range]:focus::-moz-range-track {
   background: #ccc;
}

/* for ie */

input[type=range]::-ms-track {
   width: 300px;
   height: 5px;

/*remove bg colour from the track, we'll use ms-fill-lower and ms-fill-upper instead */
   background: transparent;

/*leave room for the larger thumb to overflow with a transparent border */
   border-color: transparent;
   border-width: 6px 0;

/*remove default tick marks*/
   color: transparent;
}
input[type=range]::-ms-fill-lower {
   background: #777;
   border-radius: 10px;
}
input[type=range]::-ms-fill-upper {
   background: #ddd;
   border-radius: 10px;
}
input[type=range]::-ms-thumb {
   border: none;
   height: 12px;
   width: 12px;
   border-radius: 50%;
   background: #1CD994;
   transition: All 500ms linear;
}
input[type=range]:focus::-ms-fill-lower {
   background: #888;
}
input[type=range]:focus::-ms-fill-upper {
   background: #ccc;
}
</style>