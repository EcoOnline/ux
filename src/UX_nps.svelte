<script>
	



	//user details
	let score = -1;
	let comment = '';

	
	//main switches
	let survey = true; //whether to pop the survery or not
	let scored = false; //whether the user submitted a score 
	

</script>

{#if survey}
		<div id="MB_window" class="nps_window">
			<div id="MB_frame" style="">
				
				<div id="MB_content" class="text-center">
                        <div class="preload">
                            <i class="bob bob-shocked"></i>
                            <i class="bob bob-cry"></i>
                            <i class="bob bob-sad"></i>
                            <i class="bob bob-concerned"></i>
                            <i class="bob bob-meh"></i>
                            <i class="bob bob-happy"></i>
                            <i class="bob bob-wink"></i>
                        </div>
                    
						<i class="bob"
							class:bob-idea="{score < 0}"
							class:bob-shocked="{score == 0 }"
							class:bob-cry="{score >= 1 && score < 2}"
							class:bob-sad="{score >= 2 && score < 4}"
							class:bob-concerned="{score >= 4 && score < 7}"
							class:bob-meh="{score >= 7 && score < 9}"
							class:bob-happy="{score == 9}"
							class:bob-wink="{score > 9}"
						></i>
                        <!--
						<p>Please take one minute to leave us your candid feedback so we can continue to improve.<br>
							Our team will read <i>each and every response</i>.<br>
							Don't hold back, we want to know what you <i>really</i> think. Thank you!</p>-->
					
						<div class='panel'>
							<h5 class='mb-3'>How likely are you to recommend Engage EHS to a colleague?</h5>
							<div>
								{#each [0,1,2,3,4,5,6,7,8,9,10] as s}
									<div on:click="{() => { score = s }}" class="nps_score" class:nps_detractor="{s < 7}" class:nps_active="{s == score}" class:nps_passive="{s == 7 || s == 8}" class:nps_promoter="{s > 8}">{s}</div>
								{/each}
							</div>

							<div class="left-label">Not at all likely</div>
							<div class="right-label">Extremely likely</div>
						</div>

						<textarea bind:value="{comment}" class="form-control" placeholder="{(score == 0 ? 'Wow, please tell us what we\'ve got to fix fast!' : (score >= 9 ? 'Tell us what you love and what could be better?': 'Anything to add?'))}"></textarea>

						<div class="text-left mt-2">
							<button disabled="{score < 0}" class="btn btn-primary">Send</button>
							<button class="btn btn-outline-secondary">Not now</button>
						</div>

				</div>	
			</div>
		</div>
{/if}

<style>
    
	.nps_window {
		width: 540px;
		min-height: 185px;
		height: auto;
		top: 10% ! important;
		overflow: auto ! important;
		max-height: 90% ! important;
		left: 0px;
        background:#fff;
        text-align:center;
        margin:0 auto;
        border-radius:12px;
	}
    .preload {
        width:1px;
        height:1px;
        overflow: hidden;
    }
    .bob {
        display:inline-block;
        width:96px;
        height:96px;
        background-image:url('https://www.unco.co.nz/ux3/images/bob-idea.png');
        background-position: center center;
        background-size: contain;
        background-repeat: no-repeat;
    }

    .bob-shocked    { background-image:url('https://www.unco.co.nz/ux3/images/bob-shocked.png'); }
    .bob-cry        { background-image:url('https://www.unco.co.nz/ux3/images/bob-cry.png'); }
    .bob-sad        { background-image:url('https://www.unco.co.nz/ux3/images/bob-sad.png'); }
    .bob-concerned  { background-image:url('https://www.unco.co.nz/ux3/images/bob-concerned.png'); }
    .bob-meh        { background-image:url('https://www.unco.co.nz/ux3/images/bob-meh.png'); }
    .bob-happy      { background-image:url('https://www.unco.co.nz/ux3/images/bob-happy.png'); }
    .bob-wink       { background-image:url('https://www.unco.co.nz/ux3/images/bob-wink.png'); }


    .nps_window > div {
        margin:16px;
    }
	.nps_score { /* copied from promoter email style */
		line-height: 38px;
		margin-bottom: 0;
		font-size: 16px;
		font-weight: normal;
		text-align: center;
		vertical-align: middle;
		border: 1px solid #cccccc;
		border-bottom: 2px solid #cccccc;
		border-radius: 5px;
		white-space: nowrap;
		color: #000000;
		background-color: #ffffff;
		box-shadow: -1px 2px 2px #dddddd;
		cursor:pointer;
		height: 40px;
		width: 37px;
		margin: 1px;
		transition: all 0.5s ease-out;
		display: inline-block;
	}
    .left-label {
        float:left;
        margin-top:8px;
        font-size:14px;
    }
    .right-label {
        float:right;
        margin-top:8px;
        font-size:14px;
    }
	.nps_detractor {
		border-bottom-color: #e31a1c;
	}
	.nps_passive {
		border-bottom-color: #ff9900;
	}
	.nps_promoter {
		border-bottom-color: #33a02c;
	}
    .nps_active {
        transform: scale(1.2)
    }


	.nps_detractor.nps_active {
		background-color: #e31a1c;
	}
	.nps_passive.nps_active {
		background-color: #ff9900;
	}
	.nps_promoter.nps_active {
		background-color: #33a02c;
	}

	.panel {
		background-color:#f6f6f6;
        overflow:auto;
        padding:0 16px 16px 16px;
        border-radius:4px;
        margin-top:16px;
    
	}
    textarea {
        border:1px solid #d3d3d3;
        padding:8px;
        border-radius:4px;
        margin: 16px 0;
        width:100%;
        font-family: Inter;
        min-height:100px;

    }
    .btn {
        height:38px;
        line-height:38px;
        padding:0 32px;
        background-color: var(--blue);
        border: 1px solid var(--blue);
        border-radius:4px;
        cursor:not-allowed;
        text-transform: uppercase;
    }
    .btn:disabled {
        opacity:0.5;
    }
    .btn-outline-secondary {
        background:#fff;
        border: 1px solid var(--lightgrey);
    }
</style>