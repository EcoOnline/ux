<script>
    import { onMount } from 'svelte';

    let bc = document.body.classList;
    let text_size = bc.contains('po_text_small') ? 'small' : bc.contains('po_text_large') ? 'large' : 'normal';

    //document.body.classList.add('my-class')

    export let tabnav;
    export let bodyScroll;

    let action_columns = [];
    let action_table;
    let colgroup;

    function init_table_actions() {
        action_table = document.getElementById('action_table');
        if(action_table) {
            console.log('actions table found')
            colgroup = action_table.querySelector('colgroup');
            let ths = action_table.querySelectorAll('thead th');
            [...ths].forEach((th, i)=>{
                action_columns.push({text: th.innerText, index: i, checked: (i<4)})
            });
            action_columns = action_columns;

        }
    }

    $: {
        let acs = action_columns;
       
            acs.forEach( (ac) => {
                let cells = action_table.querySelectorAll('th:nth-child('+(ac.index+1)+'), td:nth-child('+(ac.index+1)+')');

                [...cells].forEach((cell) => {
                    console.log(ac.index, ac.checked, cell)
                    cell.style.display = ac.checked ? 'table-cell' : 'none';
                    //cell.style.opacity = ac.checked ? 1 : 0.2;
                })
            })
        
    }

    onMount(() => {
		init_table_actions();
	});

</script>
<!--
<svelte:head>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bulma/0.9.3/css/bulma.min.css" integrity="sha512-IgmDkwzs96t4SrChW29No3NXBIBv8baW490zk5aXvhCD8vuZM3yUSkbyTBcXohkySecyzIrUwiF/qV0cuPcL3Q==" crossorigin="anonymous" referrerpolicy="no-referrer" />
</svelte:head>
-->




<div class="row">
    <div class="col12">
        


        <div class="print-options">
            <h2>Print Options</h2>

<code>The only thing known about the below table is the id.
    The only requirement is no colspans in the table and for it to have a thead with th's
</code>

{#each action_columns as col}
    <div><input type="checkbox" bind:checked={col.checked}> {col.text}</div>
{/each}



        </div>
        


        <table id='action_table' class="table">
            <thead>
                <tr>
                    <th>Record ID</th>
                    <th>Status</th>
                    <th>Action Type</th>
                    <th>Title</th>
                    <th>Summary</th>
                    <th>Assignee</th>
                    <th>Created By</th>
                    <th>Target Date</th>
                    <th>Completed Date</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>145</td>
                    <td>Completed</td>
                    <td>Corrective Action</td>
                    <td>Contain leakage</td>
                    <td>If possible isolate area of leaking vehicle</td>
                    <td>Ada Lovelace</td>
                    <td>Gary Long</td>
                    <td>11-Feb-2023</td>
                    <td>08-Jan-2023</td>
                </tr>
                <tr>
                    <td>146</td>
                    <td>Completed</td>
                    <td>Corrective Action</td>
                    <td>Vehicle storage</td>
                    <td>Store vehicle in vicinity of interceptor where possible</td>
                    <td>-</td>
                    <td>Gary Long</td>
                    <td>11-Feb-2023</td>
                    <td>08-Jan-2023</td>
                </tr>
            </tbody>
        </table>

        <!-- HTML copied from mike's risk assessment with all angular removed
        [a-z-]*ng-[a-z-]+="[$.\s\d:/;,\+=>a-z()\[\]!']+"
        -->

        <!--
        <aw-print-preview-record-renderer record="$ctrl.record" are-print-options-visible="$ctrl.hasPrintOptionsEnabled()" class="ng-isolate-scope">
            <aw-template-finder  >
                <div class="print-preview-header print-preview-step-container ng-scope" id="aw_ff_form_inner">
                    <h1>
                        <label aw-mlx="$ctrl.record.moduleUniqueId + ':Module_Name'" >Risk Assessment</label>
                    </h1>
                    <img class="custom-logo float-right ng-scope" src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wgARCABLASwDASIAAhEBAxEB/8QAHAABAQEAAwEBAQAAAAAAAAAAAAcGBQQDCAEC/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEAMQAAABrcMsk4OIXcQhc8sTVcPckNehV1AAAAAAAAAAAAAAOGnFHnBYCSnB6P00pFvoSQ18jF1hV1EzpkKPP9sfKnh79SOFuRqrneRHtFkxWy+cTk+Vs01KV/c44krqHbozVFl9OJhaJZzht0e6pa35ISvonXDrT2pyc9vdUxgN9Aiibrodshl3gt6EKusKOpy+65MxXMcb6Gtnumzxps5ymcNLN6zHD6QxvKzE7GYqkwPoH5++hfnk5+nTGikc1uS1ppp1SZ4bSbU+enI4m4/pkXvRjEZfHW0llN2wS3t5s2O6BitqJIrY68wq4mlH9BJ+9Sg4XmhHNFQQwe8DB7wZ3jtmMHymoHFcDsx1cJRRIql2wB1I5bhBPC+epN6SAAAAAAAAAAAAAAAH/8QALRAAAQQBAgMFCQEAAAAAAAAABAUGAwIBAAc1EBUTNhQWNzEzNFAREiBAISL/2gAIAQEAAQUCLmqMLVxuI2Tqzv11Z366s79dWd+urO/XVnfpuOFRlWP3V3gm2nueV71jpZyIlZIJYp4tV9R/3V3gm2nueTsNIVVuNlA9gEcQ21gAuA0WvqPyd66alF4dK/nHmhwagtm8P5ORwQJGKrzoL0lvCehFLVvTnuISQPlFta6OhjOCrn/Nd4Jtp7nTvcfZaZrfyDp2FSCIDNQAjQQRBwh6+o/LcniKPwnRZEQg0rqVjSAHYXAYWVAKHK6Vc2cB2lQF1tXNEmPrzqrXFav9PilS9vy7To13URCumOZe+jWXcLEW5ntQuBpTiNKcjtVyEgazoUZxEx3Fxm6UnYRIZ5lXE+VPLhODXeCbbRyVFd7j7LLQbnhMaf0mKN5i1zht6h/3uNy3J4iM3V6UZObq7CobjTWolsaGOJunpYJ8u40vYgM2GOFvbjwx5TWlNclqbe8e09e7O2eM/ZBHSV+SUrJGwPrVw7me1C4G3e/W5PwDLpSjb3HipVRWCJImS0FdOSY3A5EpSSkddKTBiYqEDuheoJG0G54TGs/zDqULLiqnjUCBkvWONm1se6eW5PEUtVTKJnWEnW4A+SEViqA0iOtuQJMmf0GS0dlKI0yNuGoDSDNEW4iBLiRtuoZXTCIXuujkDstPuAih+oGmH3k3M9renhkSG7363J+AZ3drcr4w0W5rMYpCbpTshp46R0hTCd7j7LLZQokyAl4JMWiXvLnEs7lcGm034Ummn4r1HEZaZlPSeTgb8SxP5HH15IH1iKnhzmULJKktAMSeSlZKGsoaSVJaAYk2lZMEVIJGPX70dqAAy6ibcUa5pEbcSWoLiQMrwN5BjR5QG3EIsuFHosQpIeE9PcKDGsSiRYHFWWmGdOMyIayCDwiDtBueFwcNEYIoJ0qEqN0lGLi5ONzjg1aqFMYR8gLHgLgVWkUNKO6FhPtcxxuHSC1Bgs/I5Yopa/If/8QAFBEBAAAAAAAAAAAAAAAAAAAAYP/aAAgBAwEBPwE//8QAFBEBAAAAAAAAAAAAAAAAAAAAYP/aAAgBAgEBPwE//8QARxAAAgEDAQEIDAwFBAMAAAAAAgEDBAAREiETYQUxcVEQQTIiwUKxNHOh4RQjstEVcoGDdJHClPBDUmIkUCBAY5KTMDVTgv/aAAgBAQAGPwKWoPLGIGbxvKzOigbBd7FBr034pUfhPRfilR+E9F+KVH4T0X4pUfhPRfilR+E9F+KVH4T0WPB3Cce08raGkheM/wCdX/VpPdd13yg7vSzMkIjtbb2K9zdeGd4Sa+3FqWGQJAfEQvK6Ppfuf51f9Wk913XfKDu9I8D0ZZjEtGE9hH1t8nw3g6qocuOyWMZ5LlgGYaiESxIhewvgdhU0564yv6X7nTDFTDCxMNT1jnrvKpI2vIl8N+Jx/wDCXw2BFxsU3/eo0O61JLKDOxb7vdqWGTc/9Gm1D3bUHC0KQ5wzEcEPKrRgSISWU11/2UO4VEsWdedBtZ7G6IzJkTpwbb6+1vXVes7nqLdSIu0a/wCiv+rSe67rvlB3eguDuDj9txSSj3u8t/8APIq+sWKgl2gfsXw3UywkxkwhT5svFutrQ3XUTEB1NJY67UFLEo41twr+l+500vku7dH5APd6DqJz0Rgsk7IOCqHtF/psz+e1T8M0u5rrJAxId9qzq5jShAc6rMeCqHtFzRsy+e1T8M0u5rrJAxId9q0aJMWs5vXU5YGTkNfwriXgVoRSEVsSXVfr6FKaBrJc4t4xZQG8unPC+S+Lu3LSThTjSxSmLLS9WFnf479ZCg3Cl71lCTWPlWYSAMdRH2SXES51dB9J926D6tH7qv4tkip1FrMcpPVszv71wyU4REzPD1p3CHB9Gp6pjqm0RkSDbsWLVPwrCKDOkiQ6SDlXR6rwNTKZ5xqYsmXIlY/GdAtzLnBg3yO46qnLMZr7Lr/q0nuu6uQgaAyHS+fGbLg7g4/bdjJIPe7y37Gurg/mOOON/p7/AC9Bi+/kEV4e5cL5yJ+foeP/AHPzD00vku7cUsdWCAwRD7YuK6eaWqFxhKJEt2LiTuCBcUkuX81wGI4KVkRvn24uKSrgUpRdjm6OjjSGMibwv4erz3TaFtkTMnzvN09Rp9oM2jO80/gsRbbIBONdy35EvCuir/8Aj31de+rIfesgkFEPrh7HyuyjkFEBLBJ9ashXXES8F0H0n3boPq0fuq/ppvAV0vlX4LpdIpatTLfeXdPKlgji7bfw7cyfblTRpv5WE/DcxVMcxTyPCYCngbmpVFUa3tBkC2P7bKCHsWeq5IJOwkFiXI7+KOCMCQ9oZh3n8K37Gurg/mOOON/p7/L0Zdw8H0HtIwLSOO/Ln5PTcNLH2MQIc8+/ZSG9Iist81z17WEOuX5y6vO+ml8l3bpQPhClEhhBNOVbNl/+SpP+VXHUx9tuJ6n8l/lXHR7oIzwtpi3taznK+244fGDb9ooy7BfDvXS18YliN5aaw0Jc/muGm3UVPCtJA3t4+O4aCKQZJVJuhaXnTsa7t04SLBl25Ll9GL16G4hLIr90b/PmtSx10GP4jSa+a/i6ikUqbzKY9jyb9juq0yzPdCT6uZW/rZ93ofkzug+k+7dHHHNGZjTx6hRZa7W/ppvAV0vlX4Lo+R+87pPJvw2qePabpQYrnaSePNctHXR0+si1RlKK2722ymqKejWFsFRjqLksaqChpscRJxLtXzWXB3Bx+27GWQe93lv/AJ5PjXhXSJitQiX6a5+W8R7vP8kMeG8U1AA78h5817mozGAuoR0R/b13uptS1RLtj6h3l0fFsJ+2mXtMd6PpvXKOJ6jtz3l1L88/THKdQcWgdOEs34/L/sV+Py/7FagNIw06WmuNXqpKs6cf2EOu1NUzOqIXkR06R+zrsgMUQksNPiavVSVZwC+8IdePPamqZXVEO0Ux0j9nRuVVHnHYkuyHkt7nwk0PUihy/DYzTEVVKPFqWBXzdHxr60erdXJo08/R62FUcj0tYY89jHUahYPIGPGrlkCoOXdFjaOL+M1VGRaiLRp58/DcURzFFuZatizcVGJs1H3z5bikOoOLc1jYObigTyowQ55LdRDK6WQtpYHIv5rzUV5yB+0I9Pn22FPTxqOMOIVY19cH8xxxxv8AT3+W5KWdZjkWHY+tUw1VPntc9jIu4718HQwRSLsgQITXSVPREM9TxZXYh6bXC/CuppvWAnxm/wBz3vzy/wBAKCoiGSMuNO/WeB5iLDyg1aTHkd7hwhT7o0v1B0He5wAQwPY9zWkPndjPWsamdcS7wfh/ommWMDXMSz/Qv//EACoQAQABAgQGAgEFAQAAAAAAAAERACExQXFRYYEQkaHwscHxUOEgQDDR/9oACAEBAAE/IROA3Ekj8U0jMQNksN6/O6fndPzun53T87p+d0KIRDDcAm1ts/7+D2G3WU/rODdaYpFieyEPNYItzTmdPk/32D2G3XEoNfQAwcIVDOO6P2ixzq/W7ctzZ8MlQcjZzHMdmvk9SIgyCmzJKANhIl46KhXwYRF0/nkF6Qdz6z4UDISjwEp8qvIY8nfN5Q8GgEUXkDgjt/Cx18uVkxTGJWlSJVoNbUUtmIycoDDhH+OD2G3SieVfPfzctaBWFVzs3i8HhsgD4wkmzCw705u1EGZEMzPClzchlu4st2vk9XmfnXq9nQp0vPccoqcTdAgt4WO3Nod7wTF5nE0i2+FSgQQzJlG82jWpUt+A5vCxOnNq7BgmhzOJpHOoUQBZE3mpIluv7D4KL+IBADIpgLIC5Emij33qdKvePLsCj9gLJ7ZKDLOg4sSoFhKs8oo4biu83Ll8TS968foQNlA7xRdhkypp7iYRE2hKnQlZiUAZmAZWPpoWmlO+YGZE/FKBLhSaegiDnluL2KiMw/ZA8UmSaJIVmPEemASkSlopRpNInKu3v5uWuAByrB3Pca4UlF9aT9FTKwK0mfXRSr48rPx18z86NGSRQgQiKBXqkkC2i9qcFLJzBh3R5UBLdATHgKmqxcYvkxiWwasEq2AABDbbwKdhIBXRY8oOVPUxBnm07ikgMDjaYchDlTNfrHIczE1xfJSUEjgMIeSmyDKslkaahZbiSvqvH6EDF6BQoMzQZFLvYDkURtQRoPn4r0JhEyVDtBBQylTFx0KgrshE2RnBtotMXdc6B9UJyw0wwQ/NW2JkJws9zlrgAcqwdz3GuFIRAC6tY1cGFcdAz1YVfCsBEjHmb0ENR2ALrTF5FwRDs7HXzPzqdYEigyN69j+6EGIoORE96O0gmFMbhg5aVDRsSLvv7HK04RXBFLjJkEcamWwAESgGZCc6waIUEAPFycOJTrTrMpyURCw8cS3EJNaT4klNRFco+EL0wMC8UMlrGN4kHTKhKB2AeCte336fableLQVAYKxYmVYvUKJntdlCOhYXCRrZzoVqh5wQzwYEGtXO0OFyBF/Zq/kN6xxVuNI3KuXv5uWtGu0+N59ctcFngjE8x8UoQZN8QfNQb+vYXFYOEulWMWwWM+Dxz4YdEEr6F6/CdyiiGAJDnfJXVHVj5GHK816p917h91nojoihE40jYL2I0ZGNZoR2EXvGT5RwpK3D5RZE2p7etYtDBjWaS31iusme8cOh3Ha+Fc19YWpaSfAA1DPamSlLmG5ffVejwK7MiZWnn0WWnOCjVJIGVxxybW4VDCFhQhrFq/ALRE8KBTECcrRQ23QCFlP3SwhSFKWlGlazgE+KZ1eKXNuIXXlQkwxAnmfhQUqjKf8AXjQFSiA7nuNcF8WHb6nEb0m3pczYydjJ3MYNc76MYnHDrigCSddz4O+yPHJ7L4Bnp+ghPPA/YeNYnBKa5I57OtQ7Yc3Avmcr70u2Hmpy46S6VfohDe0cXF7fokTLZgiedABAQGH6D//aAAwDAQACAAMAAAAQUMIEU88888888888888U4A4Uo8804wIQ8Acw80Qcg00o4Qkk88gcM8MAAIcs888sccs8sss8888c8c0c888888888888888//8QAFBEBAAAAAAAAAAAAAAAAAAAAYP/aAAgBAwEBPxA//8QAFBEBAAAAAAAAAAAAAAAAAAAAYP/aAAgBAgEBPxA//8QAJxABAQACAgIBAwQDAQAAAAAAAREhADFBYVEQcSCBUKHwkbHBMNH/2gAIAQEAAT8QKCRQpiPMWiWOIRbFSgcssYHH3r169evX1Q2Q8QZkRENDZ+hJsjUmhiSqMAHbtegdB+sZ5w08xrMVjERjT45f5ZfoSbI6t+DwAe/g+U2tMxnpkfUYzfZvUqg9u5AYToShoL68oLh9DhN5f55fM3CzQrBwoaHuTyJkR5E17R3BdHJAApHjL9+KjrqcHKCjBmHy1MosVoch7R5QK/CKrAyhAGJjTzIRNUDChon2ccRXkQSyvPt1aDo3ShlVVV1IL6VpjOdZnTAU/wCSbIvFW4VwsfgHic3T/lBOLHw2J2I5U01pQ0qkEQkMkOmWsRkhpRQiwHa4plWAJURTyrgDgN5f55fcEYrcknwHAHaYBlUDLtB25VsLZuMVHHZryG6BUi8xgLJBRBNQYCTg5JAOUe9qBoKEocH9OHHZpDX6KUTXMcFKgoIZuG1SgGETN3l0ODLn+j35ZulhicKgBgAxDZ5cU3wHMdeDHSI7jygSXwiegdbc9gY4RbQjgsY1i9wiM6xH3B1h5E+CkkDBFlyYHw2Gf4+7U7TTk8njSta7Qzctfd1tOI9ykZCQLIt1Vz0nUKFPQAK5lIUAFV4NBqFMlVAQRclM6ZW2iRHOZaUUrri3caKXCMHmARilMKR+E0Gn30yLugPl+urhVrFcLn4B4nN2MZSiB0P7D4hVgp9hbAKh5d/2y+OmFs8P+lfYEUsE0zySQQhjW/8A2U01NBw87nV4SD6P2flDoh47ybj9DTx51l84QhDFGbsGXGXUgTTHfDAPofQ0TfEBlz2gDwNkQ1yUF9lZ6z7dcR5FRgvorwNACgiPPw/stKhGrdQL9mhjyKqWR3gZt/CsAEDsRTVb/Ss/zB9rYaHWTehMWsO2Qeg4DSviRMin2yb6B1q2lacoVfXQC5cEKwkVUGHw4nwpcGgNwqQsHejUsRBibn6dGFX2EyemLO8WKjAf6KHic3Yx3KIHQ/sPiHBdQgB27UdVZZJfiaEwMlGudAMgmQ6aLy6ymZ4Eo8ALtmOAKX0/C+v7Agc6KisHBHCdfBg+1e4vZ95celetK/KUFh6KTI5S0lqDCh9BTInCq6ALRuchxkHuQ+Gxy5KlGmpQnFHqhgsJoQzAzewUhk5G+cUmnSII8N00AWrMcWKjJjxaaD+TV6flNpNvOLeK5FIgKdAatSUg7tgchdfYUEVfrWjgRcgwmqiZ7Pth1nSlLNYhEPahoZsKMSJrLLTNjPIUBfPYOSwvBagF0ko6N8PaoBpyI96sRGkVwsfgHic3TMx40xY9roZoMvRUPO3fKF/bTEtxAnmLsESy3wrfSo3x0rcSIqxkQOcsLzHA+BnhKTV7JxwzPcFFV7FouB7EBBEOPlieCIVVV8/CRljWECYksplhBhOM64w1UO8Sw8n50sMggGRswxiPZaFc5pSgwoUR96zxHkQ8TQMcnnTyZCIMjYY9PkXw1cKCQjCywqFRRhrplgHkAF+GxCKidwRoeJwgIPxY1+mVbmsO/j4UMFy5DaPU1PnjAiDBGFdoyTXdpxFjSL73uYGdYg3/AMNQB0Qbgy408mc+SIcdPxpu1yEjWp60SWVxIqOl1LV9J1WtKsoDvJVzSM/YGL+E3PF7sFqq1RVUqqqq6PJ1EB4H/DYgHYSHYnQAPsNP1kX36iicq4GT0NrfAmFAuYxVWW0Ph7XUY3tLBOJ4RomnuIY70LwcPoj1P0EtIFcPkeQ5AiORHR5fqkXEw+yRDLOr4WB9iNAHZVv9moBdXS4C7i5zutoWTM4RkyE2CGTFB/RBUSI0OGBL502YEAQD1+g//9k=">
                        <table class="print-preview-inspector">
                            <tbody>
                                <tr>
                                    <th  >Record ID</th>
                                    <td>
                                        <span class="id ng-binding ng-scope" >24</span>
                                    </td>
                                </tr>
                                <tr>
                                    <th  >Creator</th>
                                    <td class="ng-binding">Rob Leech</td>
                                </tr>
                                <tr>
                                    <th  >Date</th>
                                    <td>
                                        <span class="aw-timezoneit ng-binding ng-isolate-scope" title="Source time zone:
        09/03/2020 
        UTC time zone:
        09/03/2020 
        Current time zone:
        09/03/2020 " datetime="$ctrl.record.InitialViewModel.CreatedOn" timezone="$ctrl.record.InitialViewModel.CreatedOnTimeZoneOffset" type="d" full="false" start="source">09/03/2020 </span>
                                    </td>
                                </tr>
                                <tr>
                                    <th  >Date Updated On (UTC)</th>
                                    <td>
                                        <span class="aw-timezoneit ng-binding ng-isolate-scope" title="Source time zone:
        02/11/2022 
        UTC time zone:
        02/11/2022 
        Current time zone:
        02/11/2022 " datetime="$ctrl.record.InitialViewModel.UpdateOn" timezone="$ctrl.record.InitialViewModel.UpdateOnTimeZoneOffset" type="d" full="false" start="source">02/11/2022 </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div id="aw_ff_form_inner" class="print-preview-step-container ng-scope"  >
                        <aw-print-preview-step-renderer step="step" class="ng-isolate-scope">
                            <aw-template-finder  >
                                <div class="aw-ff-header ng-scope">
                                    <div class="aw-ff-header-row row">
                                        <div class="aw-ff-header-left">
                                            <h2>
                                                <label  class="ng-binding" >Initial Details</label>
                                            </h2>
                                        </div>
                                    </div>
                                </div>
                                <div class="ng-scope">
                                    <aw-print-preview-group-renderer  group="group" class="ng-scope ng-isolate-scope">
                                        <aw-template-finder  >
                                            <h3 class="margin-bottom group-label ng-scope" >
                                                <label  >Details</label>
                                            </h3>
                                            <div class="aw-ff-form-field-group ignore-select-scroll ng-scope">
                                                <div class="aw-ff-form-field on ignore-select-scroll ng-scope">
                                                    <aw-print-preview-field-renderer field="field" class="ng-isolate-scope">
                                                        <aw-template-finder  >
                                                            <div class="ng-scope">
                                                                <label  class="field-label ng-binding ng-scope"  >Site</label>
                                                                <div class="ng-scope">
                                                                    <div  data-hj-suppress="" class="ng-scope">
                                                                        <aw-print-preview-field-value-renderer field="$ctrl.field" class="ng-isolate-scope">
                                                                            <aw-template-finder  >
                                                                                <pre  ng-bind="$ctrl.value.SelectedText || ' '" class="ng-binding ng-scope">Dededo</pre>
                                                                            </aw-template-finder>
                                                                        </aw-print-preview-field-value-renderer>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </aw-template-finder>
                                                    </aw-print-preview-field-renderer>
                                                </div>
                                                <div class="aw-ff-form-field on ignore-select-scroll ng-scope">
                                                    <aw-print-preview-field-renderer field="field" class="ng-isolate-scope">
                                                        <aw-template-finder  >
                                                            <div class="ng-scope">
                                                                <label  class="field-label ng-binding ng-scope"  >Assessment Type</label>
                                                                <div class="ng-scope">
                                                                    <div  data-hj-suppress="" class="ng-scope">
                                                                        <aw-print-preview-field-value-renderer field="$ctrl.field" class="ng-isolate-scope">
                                                                            <aw-template-finder  >
                                                                                <pre  ng-bind="$ctrl.value.SelectedText || ' '" class="ng-binding ng-scope">Waste Collection Activities</pre>
                                                                            </aw-template-finder>
                                                                        </aw-print-preview-field-value-renderer>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </aw-template-finder>
                                                    </aw-print-preview-field-renderer>
                                                </div>
                                                <div class="aw-ff-form-field on ignore-select-scroll ng-scope">
                                                    <aw-print-preview-field-renderer field="field" class="ng-isolate-scope">
                                                        <aw-template-finder  >
                                                            <div class="ng-scope">
                                                                <label  class="field-label ng-binding ng-scope"  >Date of Assessment</label>
                                                                <div class="ng-scope">
                                                                    <div  data-hj-suppress="" class="ng-scope">
                                                                        <aw-print-preview-field-value-renderer field="$ctrl.field" class="ng-isolate-scope">
                                                                            <aw-template-finder  >
                                                                                <aw-date-time-readonly field-model="$ctrl.value" control-properties="$ctrl.field.Control.Properties" class="ng-scope ng-isolate-scope">
                                                                                            <span class="aw-ff-readonlytext">
                                                                                        <span class="aw-timezoneit ng-binding ng-scope ng-isolate-scope" title="2020/03/18" datetime="$ctrl.fieldModel.ActualDt1" timezone="$ctrl.fieldModel.TimeZoneOffset1" type="d" full="false" fallback="-" start="source" ignoredate="$ctrl.ignoreDate1" ignoretime="$ctrl.ignoreTime1" >18/03/2020 </span>
                                                                                    </span>
                                                                                </aw-date-time-readonly>
                                                                            </aw-template-finder>
                                                                        </aw-print-preview-field-value-renderer>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </aw-template-finder>
                                                    </aw-print-preview-field-renderer>
                                                </div>
                                                <div class="aw-ff-form-field on ignore-select-scroll ng-scope">
                                                    <aw-print-preview-field-renderer field="field" class="ng-isolate-scope">
                                                        <aw-template-finder  >
                                                            <div class="ng-scope">
                                                                <label  class="field-label ng-binding ng-scope"  >Manual Reference</label>
                                                                <div class="ng-scope">
                                                                    <div  data-hj-suppress="" class="ng-scope">
                                                                        <aw-print-preview-field-value-renderer field="$ctrl.field" class="ng-isolate-scope">
                                                                            <aw-template-finder  >
                                                                                <pre  ng-bind="$ctrl.value.TextValue || ' '" class="ng-binding ng-scope">Reg X39 OI2</pre>
                                                                            </aw-template-finder>
                                                                        </aw-print-preview-field-value-renderer>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </aw-template-finder>
                                                    </aw-print-preview-field-renderer>
                                                </div>
                                                <div class="aw-ff-form-field on ignore-select-scroll ng-scope">
                                                    <aw-print-preview-field-renderer field="field" class="ng-isolate-scope">
                                                        <aw-template-finder  >
                                                            <div class="ng-scope">
                                                                <label  class="field-label ng-binding ng-scope"  >Department</label>
                                                                <div class="ng-scope">
                                                                    <div  data-hj-suppress="" class="ng-scope">
                                                                        <aw-print-preview-field-value-renderer field="$ctrl.field" class="ng-isolate-scope">
                                                                            <aw-template-finder  >
                                                                                <pre  ng-bind="$ctrl.value.TextValue || ' '" class="ng-binding ng-scope">Reg PE15 XLL</pre>
                                                                            </aw-template-finder>
                                                                        </aw-print-preview-field-value-renderer>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </aw-template-finder>
                                                    </aw-print-preview-field-renderer>
                                                </div>
                                                <div class="aw-ff-form-field on ignore-select-scroll ng-scope">
                                                    <aw-print-preview-field-renderer field="field" class="ng-isolate-scope">
                                                        <aw-template-finder  >
                                                            <div class="ng-scope">
                                                                <label  class="field-label ng-binding ng-scope"  >Title</label>
                                                                <div class="ng-scope">
                                                                    <div  data-hj-suppress="" class="ng-scope">
                                                                        <aw-print-preview-field-value-renderer field="$ctrl.field" class="ng-isolate-scope">
                                                                            <aw-template-finder  >
                                                                                <pre  ng-bind="$ctrl.value.TextValue || ' '" class="ng-binding ng-scope">Daily Waste Collection Activities South West Region</pre>
                                                                            </aw-template-finder>
                                                                        </aw-print-preview-field-value-renderer>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </aw-template-finder>
                                                    </aw-print-preview-field-renderer>
                                                </div>
                                                <div class="aw-ff-form-field on ignore-select-scroll ng-scope">
                                                    <aw-print-preview-field-renderer field="field" class="ng-isolate-scope">
                                                        <aw-template-finder  >
                                                            <div class="ng-scope">
                                                                <label  class="field-label ng-binding ng-scope"  >Scope of Activity</label>
                                                                <div class="ng-scope">
                                                                    <div  data-hj-suppress="" class="ng-scope">
                                                                        <aw-print-preview-field-value-renderer field="$ctrl.field" class="ng-isolate-scope">
                                                                            <aw-template-finder  >
                                                                                <pre  ng-bind="$ctrl.value.TextValue || ' '" class="ng-binding ng-scope">Waste collection is a part of the process of waste management. It is the transfer of solid waste from the point of use and disposal to the point of treatment or landfill. 
        Waste collection also includes the curbside collection of recyclable materials that technically are not waste, as part of a municipal landfill diversion program.</pre>
                                                                            </aw-template-finder>
                                                                        </aw-print-preview-field-value-renderer>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </aw-template-finder>
                                                    </aw-print-preview-field-renderer>
                                                </div>
                                                <div class="aw-ff-form-field on ignore-select-scroll ng-scope">
                                                    <aw-print-preview-field-renderer field="field" class="ng-isolate-scope">
                                                        <aw-template-finder  >
                                                            <div class="ng-scope">
                                                                <label  class="field-label ng-binding ng-scope"  >Assessment Review Date</label>
                                                                <div class="ng-scope">
                                                                    <div  data-hj-suppress="" class="ng-scope">
                                                                        <aw-print-preview-field-value-renderer field="$ctrl.field" class="ng-isolate-scope">
                                                                            <aw-template-finder  >
                                                                                <aw-date-time-readonly field-model="$ctrl.value" control-properties="$ctrl.field.Control.Properties" class="ng-scope ng-isolate-scope">
                                                                                    
        <span class="aw-ff-readonlytext">
                                                                                        <span class="aw-timezoneit ng-binding ng-scope ng-isolate-scope" title="2021/03/26" datetime="$ctrl.fieldModel.ActualDt1" timezone="$ctrl.fieldModel.TimeZoneOffset1" type="d" full="false" fallback="-" start="source" ignoredate="$ctrl.ignoreDate1" ignoretime="$ctrl.ignoreTime1" >26/03/2021 </span>
                                                                                    </span>
                                                                                </aw-date-time-readonly>
                                                                            </aw-template-finder>
                                                                        </aw-print-preview-field-value-renderer>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </aw-template-finder>
                                                    </aw-print-preview-field-renderer>
                                                </div>
                                                <div class="aw-ff-form-field on ignore-select-scroll ng-scope">
                                                    <aw-print-preview-field-renderer field="field" class="ng-isolate-scope">
                                                        <aw-template-finder  >
                                                            <div class="ng-scope">
                                                                <label  class="field-label ng-binding ng-scope"  >Lead Assessor</label>
                                                                <div class="ng-scope">
                                                                    <div  data-hj-suppress="" class="ng-scope">
                                                                        <aw-print-preview-field-value-renderer field="$ctrl.field" class="ng-isolate-scope">
                                                                            <aw-template-finder  >
                                                                                <pre  ng-bind="$ctrl.value.SelectedText || ' '" class="ng-binding ng-scope">Rob Leech</pre>
                                                                            </aw-template-finder>
                                                                        </aw-print-preview-field-value-renderer>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </aw-template-finder>
                                                    </aw-print-preview-field-renderer>
                                                </div>
                                                <div class="aw-ff-form-field on ignore-select-scroll ng-scope">
                                                    <aw-print-preview-field-renderer field="field" class="ng-isolate-scope">
                                                        <aw-template-finder  >
                                                            <div class="ng-scope">
                                                                <label  class="field-label ng-binding ng-scope"  >Master Template</label>
                                                                <div class="ng-scope">
                                                                    <div  data-hj-suppress="" class="ng-scope">
                                                                        <aw-print-preview-field-value-renderer field="$ctrl.field" class="ng-isolate-scope">
                                                                            <aw-template-finder  >
                                                                                <pre class="ng-binding ng-scope">✔</pre>
                                                                            </aw-template-finder>
                                                                        </aw-print-preview-field-value-renderer>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </aw-template-finder>
                                                    </aw-print-preview-field-renderer>
                                                </div>
                                            </div>
                                        </aw-template-finder>
                                    </aw-print-preview-group-renderer>
                                </div>
                            </aw-template-finder>
                        </aw-print-preview-step-renderer>
                    </div>
                    <div id="aw_ff_form_inner" class="print-preview-step-container ng-scope"  >
                        <aw-print-preview-step-renderer step="step" class="ng-isolate-scope">
                            <aw-template-finder  >
                                <aw-print-preview-rsk-tasks-and-hazards-step step="$ctrl.step" class="ng-scope ng-isolate-scope">
                                    <h1>
                                        <aw-ml >Task Details</aw-ml>
                                    </h1>
                                    <table>
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <div class="task-detail-container ng-scope">
                                                        <div class="columns is-gapless is-marginless">
                                                            <div class="column task-description">
                                                                <span class="ng-binding">
                                                                    <strong>
                                                                        <label  >Task</label>: </strong>Assembling of collection crew at start of shift and pre-round activities </span>
                                                            </div>
                                                        </div>
                                                        <div class="hazard-detail-container ng-scope">
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Pre Controls</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Post Control</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Local Controls</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Post Actions</label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-name-cell ng-binding">
                                                                    <strong>
                                                                        <label  >Hazard</label>:</strong> Moving Vehicles
          </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Description of undesired event</label>:</strong>
          Loading and assembling crew could be hit by vehicle and other vehicles in loading bay and garage
        &gt;Reversing activity
        &gt;Non-segregation of pedestrians and vehicles
        &gt; Large number of vehicular manoeuvres
        &gt; Collection vehicle striking operatives 
        </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >What are the consequences of the undesired event?</label>:</strong>
          1. Significant injury to team 
        2. MOP Walking around vehicle, crushing injury
        </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >People or groups affected</label>:</strong>
          Operators
        </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Number of people in danger</label>:</strong>
          0 - 10
        </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Existing Controls</label>:</strong>
          ■ One-way traffic management system
        ■ Vehicles parked in designated bays away from office and staff cars
        ■ Safe, well-marked pedestrian routes
        ■ All areas well lit
        ■ High-visibility tabard worn by all those entering the yard
        ■ All visitors receive site rules/ site map
        </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Time relevant to the task</label>:</strong>
          10 - 30 mins
        </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Is this hazard significant?</label>:</strong>
          ✗
        </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Local Controls</label>:</strong>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Are further actions required?</label>:</strong>
          ✗
        </div>
                                                                </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless risk-rating-container">
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding"  style="background-color: rgb(254, 11, 11);">
          B4</span>
                                                                    </div>
                                                                </div>
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding"  style="background-color: rgb(91, 174, 79);">
          B2</span>
                                                                    </div>
                                                                </div>
                                                                <div class="column ng-scope" >
          </div>
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="hazard-detail-container ng-scope">
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Pre Controls</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Post Control</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Local Controls</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Post Actions</label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-name-cell ng-binding">
                                                                    <strong>
                                                                        <label  >Hazard</label>:</strong> Winter
          </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Description of undesired event</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >What are the consequences of the undesired event?</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >People or groups affected</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Number of people in danger</label>:</strong>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Existing Controls</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Time relevant to the task</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Is this hazard significant?</label>:</strong>
          ✗
        </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Local Controls</label>:</strong>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Are further actions required?</label>:</strong>
          ✗
        </div>
                                                                </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless risk-rating-container">
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                                <div class="column ng-scope" >
          </div>
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="task-detail-container ng-scope">
                                                        <div class="columns is-gapless is-marginless">
                                                            <div class="column task-description">
                                                                <span class="ng-binding">
                                                                    <strong>
                                                                        <label  >Task</label>: </strong>Driving from location to location </span>
                                                            </div>
                                                        </div>
                                                        <div class="hazard-detail-container ng-scope">
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Pre Controls</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Post Control</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Local Controls</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Post Actions</label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-name-cell ng-binding">
                                                                    <strong>
                                                                        <label  >Hazard</label>:</strong> Moving Vehicles
          </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Description of undesired event</label>:</strong>
          Generic driving activity capturing all driving of the collection vehicle. It is assumed to be independent of vehicle type and
        waste stream. On-street reversing is captured under this generic driving activity. 
        This hazard category is included twice to capture both falls from Stillage and falls from riding on tailgate of RCV for the Driving from location to location component. 
        </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >What are the consequences of the undesired event?</label>:</strong>
          Significant injury people being crushed 
        </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >People or groups affected</label>:</strong>
          Public and operators
        </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Number of people in danger</label>:</strong>
          0 - 10
        </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Existing Controls</label>:</strong>
          Driver drives collection vehicle to the first collection point on the round. They may stop to pick up other operatives
        along the route, who have not already arrived on the site by the departure time. The collection vehicle travels a predetermined route to the first collection point and then to the second collection point and so on. The route may vary
        depending on weather conditions, road conditions, road works and traffic-flow. 
        </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Time relevant to the task</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Is this hazard significant?</label>:</strong>
          ✗
        </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Local Controls</label>:</strong>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Are further actions required?</label>:</strong>
          ✗
        </div>
                                                                </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless risk-rating-container">
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding"  style="background-color: rgb(254, 164, 19);">
          B3</span>
                                                                    </div>
                                                                </div>
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding"  style="background-color: rgb(91, 174, 79);">
          B2</span>
                                                                    </div>
                                                                </div>
                                                                <div class="column ng-scope" >
          </div>
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding"  style="background-color: rgb(91, 174, 79);">
          B2</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="hazard-detail-container ng-scope">
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Pre Controls</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Post Control</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Local Controls</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Post Actions</label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-name-cell ng-binding">
                                                                    <strong>
                                                                        <label  >Hazard</label>:</strong> Winter
          </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Description of undesired event</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >What are the consequences of the undesired event?</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >People or groups affected</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Number of people in danger</label>:</strong>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Existing Controls</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Time relevant to the task</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Is this hazard significant?</label>:</strong>
          ✗
        </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Local Controls</label>:</strong>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Are further actions required?</label>:</strong>
          ✗
        </div>
                                                                </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless risk-rating-container">
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                                <div class="column ng-scope" >
          </div>
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="hazard-detail-container ng-scope">
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Pre Controls</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Post Control</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Local Controls</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Post Actions</label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-name-cell ng-binding">
                                                                    <strong>
                                                                        <label  >Hazard</label>:</strong> Contact with Lifting, Tipping and Compaction Equipment</div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Description of undesired event</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >What are the consequences of the undesired event?</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >People or groups affected</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Number of people in danger</label>:</strong>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Existing Controls</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Time relevant to the task</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Is this hazard significant?</label>:</strong>
          ✗
        </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Local Controls</label>:</strong>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Are further actions required?</label>:</strong>
          ✗
        </div>
                                                                </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless risk-rating-container">
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                                <div class="column ng-scope" >
          </div>
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="hazard-detail-container ng-scope">
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Pre Controls</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Post Control</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Local Controls</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Post Actions</label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-name-cell ng-binding">
                                                                    <strong>
                                                                        <label  >Hazard</label>:</strong> Fire on Vehicle
          </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Description of undesired event</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >What are the consequences of the undesired event?</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >People or groups affected</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Number of people in danger</label>:</strong>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Existing Controls</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Time relevant to the task</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Is this hazard significant?</label>:</strong>
          ✗
        </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Local Controls</label>:</strong>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Are further actions required?</label>:</strong>
          ✗
        </div>
                                                                </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless risk-rating-container">
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                                <div class="column ng-scope" >
          </div>
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="hazard-detail-container ng-scope">
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Pre Controls</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Post Control</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Local Controls</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Post Actions</label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-name-cell ng-binding">
                                                                    <strong>
                                                                        <label  >Hazard</label>:</strong> Crushing
          </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Description of undesired event</label>:</strong>
          Hands caught in machine
        </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >What are the consequences of the undesired event?</label>:</strong>
          major injury and serv. No such events in last 65month
        </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >People or groups affected</label>:</strong>
          operators and leinmanager
        </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Number of people in danger</label>:</strong>
          10 - 25
        </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Existing Controls</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Time relevant to the task</label>:</strong>
          10 - 30 mins
        </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Is this hazard significant?</label>:</strong>
          ✗
        </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Local Controls</label>:</strong>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Are further actions required?</label>:</strong>
          ✗
        </div>
                                                                </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless risk-rating-container">
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                                <div class="column ng-scope" >
          </div>
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="hazard-detail-container ng-scope">
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Pre Controls</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Post Control</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Local Controls</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Post Actions</label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-name-cell ng-binding">
                                                                    <strong>
                                                                        <label  >Hazard</label>:</strong> Pressure Systems
          </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Description of undesired event</label>:</strong>
          rEPALCE TYERES ON WASTE
        </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >What are the consequences of the undesired event?</label>:</strong>
          Injury sig last year some year
        </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >People or groups affected</label>:</strong>
          driver and meachinc
        </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Number of people in danger</label>:</strong>
          0 - 10
        </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Existing Controls</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Time relevant to the task</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Is this hazard significant?</label>:</strong>
          ✗
        </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Local Controls</label>:</strong>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Are further actions required?</label>:</strong>
          ✓
        </div>
                                                                </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless risk-rating-container">
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                                <div class="column ng-scope" >
          </div>
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="task-detail-container ng-scope">
                                                        <div class="columns is-gapless is-marginless">
                                                            <div class="column task-description">
                                                                <span class="ng-binding">
                                                                    <strong>
                                                                        <label  >Task</label>: </strong>Getting in and out of cab </span>
                                                            </div>
                                                        </div>
                                                        <div class="hazard-detail-container ng-scope">
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Pre Controls</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Post Control</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Local Controls</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Post Actions</label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-name-cell ng-binding">
                                                                    <strong>
                                                                        <label  >Hazard</label>:</strong> Repetitive Tasks
          </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Description of undesired event</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >What are the consequences of the undesired event?</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >People or groups affected</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Number of people in danger</label>:</strong>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Existing Controls</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Time relevant to the task</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Is this hazard significant?</label>:</strong>
          ✗
        </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Local Controls</label>:</strong>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Are further actions required?</label>:</strong>
          ✗
        </div>
                                                                </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless risk-rating-container">
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                                <div class="column ng-scope" >
          </div>
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="hazard-detail-container ng-scope">
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Pre Controls</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Post Control</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Local Controls</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Post Actions</label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-name-cell ng-binding">
                                                                    <strong>
                                                                        <label  >Hazard</label>:</strong> Slips-Trips-Falls on Level
          </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Description of undesired event</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >What are the consequences of the undesired event?</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >People or groups affected</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Number of people in danger</label>:</strong>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Existing Controls</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Time relevant to the task</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Is this hazard significant?</label>:</strong>
          ✗
        </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Local Controls</label>:</strong>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Are further actions required?</label>:</strong>
          ✗
        </div>
                                                                </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless risk-rating-container">
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                                <div class="column ng-scope" >
          </div>
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="task-detail-container ng-scope">
                                                        <div class="columns is-gapless is-marginless">
                                                            <div class="column task-description">
                                                                <span class="ng-binding">
                                                                    <strong>
                                                                        <label  >Task</label>: </strong>High-rise bags collect </span>
                                                            </div>
                                                        </div>
                                                        <div class="hazard-detail-container ng-scope">
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Pre Controls</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Post Control</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Local Controls</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Post Actions</label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-name-cell ng-binding">
                                                                    <strong>
                                                                        <label  >Hazard</label>:</strong> Manual Handling
          </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Description of undesired event</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >What are the consequences of the undesired event?</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >People or groups affected</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Number of people in danger</label>:</strong>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Existing Controls</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Time relevant to the task</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Is this hazard significant?</label>:</strong>
          ✗
        </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Local Controls</label>:</strong>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Are further actions required?</label>:</strong>
          ✗
        </div>
                                                                </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless risk-rating-container">
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                                <div class="column ng-scope" >
          </div>
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="task-detail-container ng-scope">
                                                        <div class="columns is-gapless is-marginless">
                                                            <div class="column task-description">
                                                                <span class="ng-binding">
                                                                    <strong>
                                                                        <label  >Task</label>: </strong>Big wheeled bins collect Euro and bin return</span>
                                                            </div>
                                                        </div>
                                                        <div class="hazard-detail-container ng-scope">
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Pre Controls</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Post Control</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Local Controls</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Post Actions</label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-name-cell ng-binding">
                                                                    <strong>
                                                                        <label  >Hazard</label>:</strong> Crushing
          </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Description of undesired event</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >What are the consequences of the undesired event?</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >People or groups affected</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Number of people in danger</label>:</strong>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Existing Controls</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Time relevant to the task</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Is this hazard significant?</label>:</strong>
          ✗
        </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Local Controls</label>:</strong>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Are further actions required?</label>:</strong>
          ✗
        </div>
                                                                </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless risk-rating-container">
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                                <div class="column ng-scope" >
          </div>
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="hazard-detail-container ng-scope">
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Pre Controls</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Post Control</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Local Controls</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Post Actions</label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-name-cell ng-binding">
                                                                    <strong>
                                                                        <label  >Hazard</label>:</strong> Contact with Lifting, Tipping and Compaction Equipment</div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Description of undesired event</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >What are the consequences of the undesired event?</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >People or groups affected</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Number of people in danger</label>:</strong>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Existing Controls</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Time relevant to the task</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Is this hazard significant?</label>:</strong>
          ✗
        </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Local Controls</label>:</strong>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Are further actions required?</label>:</strong>
          ✗
        </div>
                                                                </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless risk-rating-container">
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                                <div class="column ng-scope" >
          </div>
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="task-detail-container ng-scope">
                                                        <div class="columns is-gapless is-marginless">
                                                            <div class="column task-description">
                                                                <span class="ng-binding">
                                                                    <strong>
                                                                        <label  >Task</label>: </strong>Kerbside box collect and box return </span>
                                                            </div>
                                                        </div>
                                                        <div class="hazard-detail-container ng-scope">
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Pre Controls</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Post Control</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Local Controls</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Post Actions</label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-name-cell ng-binding">
                                                                    <strong>
                                                                        <label  >Hazard</label>:</strong> Confined Spaces
          </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Description of undesired event</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >What are the consequences of the undesired event?</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >People or groups affected</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Number of people in danger</label>:</strong>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Existing Controls</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Time relevant to the task</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Is this hazard significant?</label>:</strong>
          ✗
        </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Local Controls</label>:</strong>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Are further actions required?</label>:</strong>
          ✗
        </div>
                                                                </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless risk-rating-container">
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                                <div class="column ng-scope" >
          </div>
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="hazard-detail-container ng-scope">
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Pre Controls</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Post Control</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Local Controls</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Post Actions</label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-name-cell ng-binding">
                                                                    <strong>
                                                                        <label  >Hazard</label>:</strong> Manual Handling
          </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Description of undesired event</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >What are the consequences of the undesired event?</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >People or groups affected</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Number of people in danger</label>:</strong>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Existing Controls</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Time relevant to the task</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Is this hazard significant?</label>:</strong>
          ✗
        </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Local Controls</label>:</strong>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Are further actions required?</label>:</strong>
          ✗
        </div>
                                                                </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless risk-rating-container">
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                                <div class="column ng-scope" >
          </div>
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="task-detail-container ng-scope">
                                                        <div class="columns is-gapless is-marginless">
                                                            <div class="column task-description">
                                                                <span class="ng-binding">
                                                                    <strong>
                                                                        <label  >Task</label>: </strong>Wheeled bins empty </span>
                                                            </div>
                                                        </div>
                                                        <div class="hazard-detail-container ng-scope">
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Pre Controls</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Post Control</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Local Controls</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Post Actions</label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-name-cell ng-binding">
                                                                    <strong>
                                                                        <label  >Hazard</label>:</strong> Fire on Vehicle
          </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Description of undesired event</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >What are the consequences of the undesired event?</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >People or groups affected</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Number of people in danger</label>:</strong>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Existing Controls</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Time relevant to the task</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Is this hazard significant?</label>:</strong>
          ✗
        </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Local Controls</label>:</strong>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Are further actions required?</label>:</strong>
          ✗
        </div>
                                                                </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless risk-rating-container">
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                                <div class="column ng-scope" >
          </div>
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="task-detail-container ng-scope">
                                                        <div class="columns is-gapless is-marginless">
                                                            <div class="column task-description">
                                                                <span class="ng-binding">
                                                                    <strong>
                                                                        <label  >Task</label>: </strong>Walking to and from collection point </span>
                                                            </div>
                                                        </div>
                                                        <div class="hazard-detail-container ng-scope">
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Pre Controls</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Post Control</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Local Controls</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Post Actions</label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-name-cell ng-binding">
                                                                    <strong>
                                                                        <label  >Hazard</label>:</strong> Darkness during winter months</div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Description of undesired event</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >What are the consequences of the undesired event?</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >People or groups affected</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Number of people in danger</label>:</strong>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Existing Controls</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Time relevant to the task</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Is this hazard significant?</label>:</strong>
          ✗
        </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Local Controls</label>:</strong>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Are further actions required?</label>:</strong>
          ✗
        </div>
                                                                </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless risk-rating-container">
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                                <div class="column ng-scope" >
          </div>
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="hazard-detail-container ng-scope">
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Pre Controls</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Post Control</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Local Controls</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Post Actions</label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-name-cell ng-binding">
                                                                    <strong>
                                                                        <label  >Hazard</label>:</strong> Contact with Lifting, Tipping and Compaction Equipment</div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Description of undesired event</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >What are the consequences of the undesired event?</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >People or groups affected</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Number of people in danger</label>:</strong>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Existing Controls</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Time relevant to the task</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Is this hazard significant?</label>:</strong>
          ✗
        </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Local Controls</label>:</strong>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Are further actions required?</label>:</strong>
          ✗
        </div>
                                                                </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless risk-rating-container">
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                                <div class="column ng-scope" >
          </div>
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="task-detail-container ng-scope">
                                                        <div class="columns is-gapless is-marginless">
                                                            <div class="column task-description">
                                                                <span class="ng-binding">
                                                                    <strong>
                                                                        <label  >Task</label>: </strong> Operating vehicle machinery – RCV compaction </span>
                                                            </div>
                                                        </div>
                                                        <div class="hazard-detail-container ng-scope">
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Pre Controls</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Post Control</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Local Controls</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Post Actions</label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-name-cell ng-binding">
                                                                    <strong>
                                                                        <label  >Hazard</label>:</strong> Hazardous Substances
          </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Description of undesired event</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >What are the consequences of the undesired event?</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >People or groups affected</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Number of people in danger</label>:</strong>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Existing Controls</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Time relevant to the task</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Is this hazard significant?</label>:</strong>
          ✗
        </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Local Controls</label>:</strong>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Are further actions required?</label>:</strong>
          ✗
        </div>
                                                                </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless risk-rating-container">
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                                <div class="column ng-scope" >
          </div>
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="hazard-detail-container ng-scope">
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Pre Controls</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Post Control</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Local Controls</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Post Actions</label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-name-cell ng-binding">
                                                                    <strong>
                                                                        <label  >Hazard</label>:</strong> Crushing
          </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Description of undesired event</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >What are the consequences of the undesired event?</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >People or groups affected</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Number of people in danger</label>:</strong>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Existing Controls</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Time relevant to the task</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Is this hazard significant?</label>:</strong>
          ✗
        </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Local Controls</label>:</strong>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Are further actions required?</label>:</strong>
          ✗
        </div>
                                                                </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless risk-rating-container">
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                                <div class="column ng-scope" >
          </div>
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="hazard-detail-container ng-scope">
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Pre Controls</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Post Control</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Local Controls</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Post Actions</label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-name-cell ng-binding">
                                                                    <strong>
                                                                        <label  >Hazard</label>:</strong> Contact with Lifting, Tipping and Compaction Equipment</div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Description of undesired event</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >What are the consequences of the undesired event?</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >People or groups affected</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Number of people in danger</label>:</strong>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Existing Controls</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Time relevant to the task</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Is this hazard significant?</label>:</strong>
          ✗
        </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Local Controls</label>:</strong>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Are further actions required?</label>:</strong>
          ✗
        </div>
                                                                </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless risk-rating-container">
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                                <div class="column ng-scope" >
          </div>
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="task-detail-container ng-scope">
                                                        <div class="columns is-gapless is-marginless">
                                                            <div class="column task-description">
                                                                <span class="ng-binding">
                                                                    <strong>
                                                                        <label  >Task</label>: </strong>Emptying collection vehicle</span>
                                                            </div>
                                                        </div>
                                                        <div class="hazard-detail-container ng-scope">
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Pre Controls</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Post Control</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Local Controls</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Post Actions</label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-name-cell ng-binding">
                                                                    <strong>
                                                                        <label  >Hazard</label>:</strong> Contact with Lifting, Tipping and Compaction Equipment</div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Description of undesired event</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >What are the consequences of the undesired event?</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >People or groups affected</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Number of people in danger</label>:</strong>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Existing Controls</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Time relevant to the task</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Is this hazard significant?</label>:</strong>
          ✗
        </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Local Controls</label>:</strong>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Are further actions required?</label>:</strong>
          ✗
        </div>
                                                                </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless risk-rating-container">
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                                <div class="column ng-scope" >
          </div>
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="hazard-detail-container ng-scope">
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Pre Controls</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Post Control</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Local Controls</label>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-detail-ui-group-header ng-scope" >
                                                                    <div>
                                                                        <label  >Post Actions</label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-name-cell ng-binding">
                                                                    <strong>
                                                                        <label  >Hazard</label>:</strong> Fire on Vehicle
          </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless">
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Description of undesired event</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >What are the consequences of the undesired event?</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >People or groups affected</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Number of people in danger</label>:</strong>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Existing Controls</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Time relevant to the task</label>:</strong>
                                                                    </div>
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Is this hazard significant?</label>:</strong>
          ✗
        </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Local Controls</label>:</strong>
                                                                    </div>
                                                                </div>
                                                                <div class="column hazard-field-cell ng-scope" >
                                                                    <div class="ng-binding ng-scope">
                                                                        <strong>
                                                                            <label  >Are further actions required?</label>:</strong>
          ✗
        </div>
                                                                </div>
                                                            </div>
                                                            <div class="columns is-gapless is-marginless risk-rating-container">
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                                <div class="column ng-scope" >
          </div>
                                                                <div class="column ng-scope" >
                                                                    <div class="ng-scope">
                                                                        <strong>
                                                                            <label  >Risk Rating</label>:</strong>
                                                                        <span class="risk-rating-value ng-binding" >
          </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="task-detail-container ng-scope">
                                                        <div class="columns is-gapless is-marginless">
                                                            <div class="column task-description">
                                                                <span class="ng-binding">
                                                                    <strong>
                                                                        <label  >Task</label>: </strong>news</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </aw-print-preview-rsk-tasks-and-hazards-step>
                            </aw-template-finder>
                        </aw-print-preview-step-renderer>
                    </div>
                    <div id="aw_ff_form_inner" class="print-preview-step-container ng-scope"  >
                        <aw-print-preview-step-renderer step="step" class="ng-isolate-scope">
                            <aw-template-finder  >
                                <div class="aw-ff-header ng-scope">
                                    <div class="aw-ff-header-row row">
                                        <div class="aw-ff-header-left">
                                            <h2>
                                                <label  class="ng-binding" >Review</label>
                                            </h2>
                                        </div>
                                    </div>
                                </div>
                                <div class="ng-scope">
                                    <aw-print-preview-group-renderer  group="group" class="ng-scope ng-isolate-scope">
                                        <aw-template-finder  >
                                            <h3 class="margin-bottom group-label ng-scope" >
                                                <label  >Review</label>
                                            </h3>
                                            <div class="aw-ff-form-field-group ignore-select-scroll ng-scope">
                                                <div class="aw-ff-form-field on ignore-select-scroll ng-scope">
                                                    <aw-print-preview-field-renderer field="field" class="ng-isolate-scope">
                                                        <aw-template-finder  >
                                                            <div class="ng-scope">
                                                                <label  class="field-label ng-binding ng-scope"  >Review</label>
                                                                <div class="ng-scope">
                                                                    <div  data-hj-suppress="" class="ng-scope">
                                                                        <aw-print-preview-field-value-renderer field="$ctrl.field" class="ng-isolate-scope">
                                                                            <aw-template-finder  >
                                                                                <div class="ng-scope">
                                                                                    <pre ng-bind="$ctrl.value.NextStepNomineePersonName || ' '" class="ng-binding"> </pre>
                                                                                </div>
                                                                            </aw-template-finder>
                                                                        </aw-print-preview-field-value-renderer>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </aw-template-finder>
                                                    </aw-print-preview-field-renderer>
                                                </div>
                                            </div>
                                        </aw-template-finder>
                                    </aw-print-preview-group-renderer>
                                </div>
                            </aw-template-finder>
                        </aw-print-preview-step-renderer>
                    </div>
                    <div id="aw_ff_form_inner" class="print-preview-step-container ng-scope"  >
                        <aw-print-preview-step-renderer step="step" class="ng-isolate-scope">
                            <aw-template-finder  >
                                <div class="aw-ff-header ng-scope">
                                    <div class="aw-ff-header-row row">
                                        <div class="aw-ff-header-left">
                                            <h2>
                                                <label aw-ml="rsk:Step_SignOff1" class="ng-binding" data-ta="rsk:Step_SignOff1">Sign Off 1</label>
                                            </h2>
                                        </div>
                                    </div>
                                </div>
                                <div class="ng-scope">
                                    <aw-print-preview-group-renderer  group="group" class="ng-scope ng-isolate-scope">
                                        <aw-template-finder  >
                                            <h3 class="margin-bottom group-label ng-scope" >
                                                <label aw-ml=""/>
                                            </h3>
                                            <div class="aw-ff-form-field-group ignore-select-scroll ng-scope">
                                                <div class="aw-ff-form-field on ignore-select-scroll ng-scope">
                                                    <aw-print-preview-field-renderer field="field" class="ng-isolate-scope">
                                                        <aw-template-finder  >
                                                            <div class="ng-scope">
                                                                <label  class="field-label ng-binding ng-scope" aw-ml="rsk:Sign_Off_1" data-ta="rsk:Sign_Off_1">Sign Off 1</label>
                                                                <div class="ng-scope">
                                                                    <div  data-hj-suppress="" class="ng-scope">
                                                                        <aw-print-preview-field-value-renderer field="$ctrl.field" class="ng-isolate-scope">
                                                                            <aw-template-finder  >
                                                                                <div class="ng-scope">
                                                                                    <pre ng-bind="$ctrl.value.NextStepNomineePersonName || ' '" class="ng-binding">Rob Leech</pre>
                                                                                </div>
                                                                            </aw-template-finder>
                                                                        </aw-print-preview-field-value-renderer>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </aw-template-finder>
                                                    </aw-print-preview-field-renderer>
                                                </div>
                                            </div>
                                        </aw-template-finder>
                                    </aw-print-preview-group-renderer>
                                </div>
                            </aw-template-finder>
                        </aw-print-preview-step-renderer>
                    </div>
                    <div id="aw_ff_form_inner" class="print-preview-step-container ng-scope"  >
                        <aw-print-preview-step-renderer step="step" class="ng-isolate-scope">
                            <aw-template-finder  >
                                <div class="aw-ff-header ng-scope">
                                    <div class="aw-ff-header-row row">
                                        <div class="aw-ff-header-left">
                                            <h2>
                                                <label aw-ml="rsk:Step_SignOff2" class="ng-binding" data-ta="rsk:Step_SignOff2">Sign Off 2</label>
                                            </h2>
                                        </div>
                                    </div>
                                </div>
                                <div class="ng-scope">
                                    <aw-print-preview-group-renderer  group="group" class="ng-scope ng-isolate-scope">
                                        <aw-template-finder  >
                                            <h3 class="margin-bottom group-label ng-scope" >
                                                <label aw-ml=""/>
                                            </h3>
                                            <div class="aw-ff-form-field-group ignore-select-scroll ng-scope">
                                                <div class="aw-ff-form-field on ignore-select-scroll ng-scope">
                                                    <aw-print-preview-field-renderer field="field" class="ng-isolate-scope">
                                                        <aw-template-finder  >
                                                            <div class="ng-scope">
                                                                <label  class="field-label ng-binding ng-scope" aw-ml="rsk:Sign_Off_2" data-ta="rsk:Sign_Off_2">Sign Off 2</label>
                                                                <div class="ng-scope">
                                                                    <div  data-hj-suppress="" class="ng-scope">
                                                                        <aw-print-preview-field-value-renderer field="$ctrl.field" class="ng-isolate-scope">
                                                                            <aw-template-finder  >
                                                                                <div class="ng-scope">
                                                                                    <aw-ml >Assigned To</aw-ml>:
          <pre  class="ng-binding">Rob Leech</pre>
                                                                                    <aw-ml >Approved</aw-ml>:
          <pre class="ng-binding">✔</pre>
                                                                                    <aw-ml >Comment</aw-ml>:
          <pre ng-bind="$ctrl.value.Approved ? ($ctrl.value.ApprovalComment || ' ') : ($ctrl.value.RejectionComment || ' ')" class="ng-binding"> </pre>
                                                                                </div>
                                                                            </aw-template-finder>
                                                                        </aw-print-preview-field-value-renderer>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </aw-template-finder>
                                                    </aw-print-preview-field-renderer>
                                                </div>
                                            </div>
                                        </aw-template-finder>
                                    </aw-print-preview-group-renderer>
                                </div>
                            </aw-template-finder>
                        </aw-print-preview-step-renderer>
                    </div>
                    <div id="aw_ff_form_inner" class="print-preview-step-container ng-scope"  >
                        <aw-print-preview-step-renderer step="step" class="ng-isolate-scope">
                            <aw-template-finder  >
                                <div class="aw-ff-header ng-scope">
                                    <div class="aw-ff-header-row row">
                                        <div class="aw-ff-header-left">
                                            <h2>
                                                <label aw-ml="rsk:Step_SignOff3" class="ng-binding" data-ta="rsk:Step_SignOff3">Sign Off 3</label>
                                            </h2>
                                        </div>
                                    </div>
                                </div>
                                <div class="ng-scope">
                                    <aw-print-preview-group-renderer  group="group" class="ng-scope ng-isolate-scope">
                                        <aw-template-finder  >
                                            <h3 class="margin-bottom group-label ng-scope" >
                                                <label aw-ml=""/>
                                            </h3>
                                            <div class="aw-ff-form-field-group ignore-select-scroll ng-scope">
                                                <div class="aw-ff-form-field on ignore-select-scroll ng-scope">
                                                    <aw-print-preview-field-renderer field="field" class="ng-isolate-scope">
                                                        <aw-template-finder  >
                                                            <div class="ng-scope">
                                                                <label  class="field-label ng-binding ng-scope" aw-ml="rsk:Sign_Off_3" data-ta="rsk:Sign_Off_3">Sign Off 3</label>
                                                                <div class="ng-scope">
                                                                    <div  data-hj-suppress="" class="ng-scope">
                                                                        <aw-print-preview-field-value-renderer field="$ctrl.field" class="ng-isolate-scope">
                                                                            <aw-template-finder  >
                                                                                <div class="ng-scope">
                                                                                    <aw-ml >Assigned To</aw-ml>:
          <pre  class="ng-binding">Rob Leech</pre>
                                                                                    <aw-ml >Approved</aw-ml>:
          <pre class="ng-binding">✔</pre>
                                                                                    <aw-ml >Comment</aw-ml>:
          <pre ng-bind="$ctrl.value.Approved ? ($ctrl.value.ApprovalComment || ' ') : ($ctrl.value.RejectionComment || ' ')" class="ng-binding"> </pre>
                                                                                </div>
                                                                            </aw-template-finder>
                                                                        </aw-print-preview-field-value-renderer>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </aw-template-finder>
                                                    </aw-print-preview-field-renderer>
                                                </div>
                                            </div>
                                        </aw-template-finder>
                                    </aw-print-preview-group-renderer>
                                </div>
                            </aw-template-finder>
                        </aw-print-preview-step-renderer>
                    </div>
                    <div id="aw_ff_form_inner" class="print-preview-step-container ng-scope"  >
                        <aw-print-preview-step-renderer step="step" class="ng-isolate-scope">
                            <aw-template-finder  >
                                <div class="aw-ff-header ng-scope">
                                    <div class="aw-ff-header-row row">
                                        <div class="aw-ff-header-left">
                                            <h2>
                                                <label  class="ng-binding" >Archive</label>
                                            </h2>
                                        </div>
                                    </div>
                                </div>
                                <div class="ng-scope">
                                    <aw-print-preview-group-renderer  group="group" class="ng-scope ng-isolate-scope">
                                        <aw-template-finder  >
                                            <h3 class="margin-bottom group-label ng-scope" >
                                                <label  />
                                            </h3>
                                            <div class="aw-ff-form-field-group ignore-select-scroll ng-scope">
                                                <div class="aw-ff-form-field on ignore-select-scroll ng-scope">
                                                    <aw-print-preview-field-renderer field="field" class="ng-isolate-scope">
                                                        <aw-template-finder  >
                                                            <div class="ng-scope">
                                                                <label  class="field-label ng-binding ng-scope"  >Archive</label>
                                                                <div class="ng-scope">
                                                                    <div  data-hj-suppress="" class="ng-scope">
                                                                        <aw-print-preview-field-value-renderer field="$ctrl.field" class="ng-isolate-scope">
                                                                            <aw-template-finder  >
                                                                                <pre class="ng-binding ng-scope">✘</pre>
                                                                            </aw-template-finder>
                                                                        </aw-print-preview-field-value-renderer>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </aw-template-finder>
                                                    </aw-print-preview-field-renderer>
                                                </div>
                                                <div class="aw-ff-form-field on ignore-select-scroll ng-scope">
                                                    <aw-print-preview-field-renderer field="field" class="ng-isolate-scope">
                                                        <aw-template-finder  >
                                                            <div class="ng-scope">
                                                                <label  class="field-label ng-binding ng-scope"  >Reason for Archival</label>
                                                                <div class="ng-scope">
                                                                    <div  data-hj-suppress="" class="ng-scope">
                                                                        <aw-print-preview-field-value-renderer field="$ctrl.field" class="ng-isolate-scope">
                                                                            <aw-template-finder  >
                                                                                <pre  ng-bind="$ctrl.value.TextValue || ' '" class="ng-binding ng-scope"> </pre>
                                                                            </aw-template-finder>
                                                                        </aw-print-preview-field-value-renderer>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </aw-template-finder>
                                                    </aw-print-preview-field-renderer>
                                                </div>
                                            </div>
                                        </aw-template-finder>
                                    </aw-print-preview-group-renderer>
                                </div>
                            </aw-template-finder>
                        </aw-print-preview-step-renderer>
                    </div>
                    <div class="print-preview-step-container ng-scope"  id="aw_ff_form_inner">
                        <h2 id="action-title">
                            <label  >Actions</label>
                        </h2>
                        <aw-simple-custom-table-component table-rows="$ctrl.tableRows" class="ng-isolate-scope">
                            <table class="table-fancy table-vertical-middle">
                                <thead>
                                    <tr>
                                        <th  class="table-header ng-scope"  >Record Id</th>
                                        <th  class="table-header ng-scope"  >Status</th>
                                        <th  class="table-header ng-scope"  >Action Type</th>
                                        <th  class="table-header ng-scope"  >Title</th>
                                        <th  class="table-header ng-scope"  >Assignee</th>
                                        <th  class="table-header ng-scope"  >Created By</th>
                                        <th  class="table-header ng-scope"  >Target Date</th>
                                        <th  class="table-header ng-scope"  >Completed Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr class="border-bottom ng-scope not-clickable">
                                        <td class="record-id">
                                            <div class="icon-with-id">
                                                <span  class="icon bg-AC"/>
                                                <span  class="ng-scope">
                                                    <aw-mlx data-ta="1060">1060</aw-mlx>
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="status group-action"   >In Progress</div>
                                        </td>
                                        <td>
                                            <span  class="ng-scope">
                                                <aw-mlx >Training</aw-mlx>
                                            </span>
                                        </td>
                                        <td  data-ta="Training Action">Training Action</td>
                                        <td  data-ta="Airsweb Admin">Airsweb Admin</td>
                                        <td  data-ta="Oliver Fairclough">Oliver Fairclough</td>
                                        <td class="target-date overdue"   data-ta="08/02/2021">08/02/2021</td>
                                        <td aw-mlx="action.completedDate ? action.completedDate : '-'" data-ta="-">-</td>
                                    </tr>
                                </tbody>
                            </table>
                        </aw-simple-custom-table-component>
                    </div>
                </aw-template-finder>
            </aw-print-preview-record-renderer>
            -->
        <!-- end HTML -->

    </div>
</div>

<style>
  /* force background colour so that risk badges show */
  * {
    -webkit-print-color-adjust:exact !important;
    print-color-adjust:exact !important;
  }


  .print-options {
    border-radius:16px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    background:#fff;
    margin:64px 0;
    padding:32px;
  }

  @media print { 
    .print-options { display:none }
  }
  table {
    width:100%;
  }
  table th {
    vertical-align: top;
  }

  table td,
  table th
   {
    border-bottom: 1px solid rgba(0,0,0,0.1);
    padding:0px 8px 2px 8px ;
  }
    
</style>
	
        