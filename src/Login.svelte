<script>
    import { onMount } from 'svelte';
    import Form from './components/form/Form.svelte';
    let channel = 'LOGIN';

    let step = "selection"; //create

    let f = [
        {
            item_type: "input_password",
            id: "0_1",
            label: "Password",
            hint: false,
            confirm: '0_2',
            answer: ""
        },
        {
            item_type: "input_password_confirm",
            id: "0_2",
            label: "Confirm password",
            hint: false,
            answer: ""
        }
    ];
    

</script>


<div class='login-space'>
    {#if step == 'selection'}
        <div class="center">
            <i class="i-logo i-40"></i>
            <h2>Welcome to EcoOnline</h2>
            <h3>How would you like to log in?</h3>
        </div>

        <a href="./" class="btn btn-mob btn-secondary"><i class='i-microsoft-color i-20'></i>Microsoft</a>
        <a href="./" class="btn btn-mob btn-secondary"><i class='i-feide-color i-20'></i>Feide</a>
        <p class="center">or</p>
        <a href="./" on:click|preventDefault="{ () => { step = 'password'} }" class="btn btn-mob">Create Password</a>
        <a href="./" class="btn btn-mob btn-clear">Help</a>

    {:else if step == 'password'}
        <div class="center">
            <i class="i-logo i-40"></i>
            <h2>Welcome to EcoOnline</h2>
            <h3>Create your password</h3>
        </div>

        <Form {f} {channel}></Form>

        <a href="./" class="btn btn-mob">Create Password</a>
        <a href="./" on:click|preventDefault="{ () => { step = 'selection'} }" class="btn btn-mob btn-clear">Other Login Options</a>
        <a href="./" class="btn btn-mob btn-clear">Help</a>
    {/if}
</div>


<style>
    .i-logo {
        margin:24px 0 8px 0;
        /*animation: flip 0.5s linear forwards;*/
    }
    @keyframes flip {
        from {
        transform: rotateY(1deg);
        }
        to {
        transform: rotateY(360deg);
        }
    }
    h2, h3 {
        font-weight:normal;
    }
    h3 {
        margin-bottom: 32px;
    }
   .login-space {
        width: 400px;
        background: #fff;
        padding: 16px;
        margin: 16px;
        border-radius: 12px;
        box-shadow:0 6px 10px rgba(186, 191, 195, 0.2);
        margin-top: calc((100vh - 750px)/2); /*dont center because expanding rules maake action look odd */
   }
   .center {
       text-align: center;
   }
   p {
       margin-top:0;
       text-transform: uppercase;
       font-size: 10px;
   }

   .btn .i-20 {
       position:absolute;
       top:12px;
       left:16px;
       transition: left 0.5s ease-out;
   }
   .btn:hover .i-20 {
       left:24px;
   }

</style>