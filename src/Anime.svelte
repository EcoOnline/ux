<script>
    import anime from "animejs/lib/anime.es.js";
    let cats = [
      { id: 1, name: "Keyboard Cat" },
      { id: 2, name: "Maru" },
      { id: 3, name: "Henri The Existential Cat" }
    ];
    let visible = false;

    function reverse(node, { targets, duration }) {
    return {
      css: t => {
        return anime({
          targets,
          duration,
          easing: "easeInOutCirc",
          opacity: [1, 0],
          delay: anime.stagger(200),
        });
      }
    };

  }
    function forward(node, { targets, duration }) {
    return {
      css: t => {
        console.log(anime({
          targets,
          duration,
          easing: "linear",
          opacity: [0, 1]
        }));
        anime({
          targets,
          duration,
          easing: "linear",
          opacity: [0, 1]
        });
      }
    };

  }
</script>

<input type="checkbox" bind:checked={visible}>
{#if visible}
<ul>
{#each cats as {name},i}
    <h1 class="animate"
         in:forward="{{ targets: '.animate', duration: 1500 }}"
         out:reverse="{{ targets: '.animate', duration: 1500 }}">
         {i +1}.{name} 
    </h1>
{/each}
</ul>
{/if}