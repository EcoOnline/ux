<script>
    export let f;
    export let channel = 'ANSWER';
</script>


<div class="form-item">
    {#if f.label}
        <label for="{f.id}">{f.label}</label>
    {/if}
    {#if f.hint}
        <p>{f.hint}</p>
    {/if}
    {#each f.options as option}
           <div class="switch-holder">
                <label class="switch">
                    <input type="checkbox" bind:checked={option.value}>
                    <span class="slider"></span>
                </label>
                <span on:click="{ () => { option.value = !option.value}}">{option.text}</span>
            </div>
    {/each}
</div>

<style>
    p {padding-bottom:0; }
    .switch-holder {
        display:flex;
        flex-direction: row;
        align-items: center;
        padding:8px 0;
        cursor: pointer;
    }
     .switch {
  position: relative;
  display: inline-block;
  width: 36px;
  height: 20px;
  margin-right:8px;
}

/* Hide default HTML checkbox */
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

/* The slider */
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--eo-border-reduced);
  -webkit-transition: .4s;
  transition: .4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background:#fff url(../images/icons/switch-tick.svg) left top no-repeat;
  background-size: contain;
  -webkit-transition: .4s;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--eo-secondary-500);
}

input:checked + .slider:before {
  background-color: var(--eo-secondary-500);
  box-shadow: 3px 2px 3px rgba(0, 0, 0, 0.3);
}

input:focus + .slider {
  box-shadow: 0 0 1px var(--eo-secondary-500);
}

input:checked + .slider:before {
  -webkit-transform: translateX(16px);
  -ms-transform: translateX(16px);
  transform: translateX(16px);
}

</style>