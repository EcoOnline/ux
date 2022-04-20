<script>
    import { onMount } from 'svelte';
    import Form from './components/form/Form.svelte';
    let channel = 'LOGIN';
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
    <div class="center">
        <i class="i-logo i-40"></i>
        <h2>Welcome to EcoOnline</h2>
        <h3>Create your password</h3>
    </div>

    <Form {f} {channel}></Form>

    <a href="" class="btn btn-mob">Create Password</a>
    <a href="" class="btn btn-mob btn-clear">Other Login Options</a>
    <a href="" class="btn btn-mob btn-clear">Help</a>
</div>


<style>
    .i-logo {
        margin:24px 0 8px 0;
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

</style>