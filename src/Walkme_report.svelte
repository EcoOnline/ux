<script>
    import { onMount } from 'svelte';
    import Papa from 'papaparse';
    import Encoding from 'encoding-japanese';
    
    const allowedExtensions = /(\.csv)$/i;

    //naive approach to removing fluff words
    const fluffWords = [
        "fluff","other", "the", "my", "at", "as", "in", "you", "get", "what", "is", "do", "an", "of", "not", "have", "to", "view", "this", "type", "how", "off", "on", "if", "i", "when", "want", "why", "line", "a", "can", "for"
    ];
    
    

    //structuring this way is faster but still naive
    //order is important but order is variable in objects :(
    const synonyms = {
        "edit_action": "edit_action",
        "edit_event": "edit_event",
        "edit_audit": "edit_audit",
        "edit_risk_assessment": "edit_risk_assessment",
        "edit_record": "edit_record",
        "edit_action": "edit_action",
        "edit_schedule": "edit_schedule",
        "edit_task": "edit_task",
        "edit_date": "edit_date",
        "injury": "accident",
        "near_miss": "accident",
        "lost_time": "accident",
        "lti": "accident",
        "close_call": "accident",
        "event": "incident",
        "events": "incident",
        "incidents": "incident",
        "lang": "language",
        "translation": "language",
        "translations": "language",
        "subscription": "notification",
        "turn_off": "notification",
        "company": "id"
    }
    $:syn_keys = Object.keys(synonyms);

    let no_results_only = true; //false = show all searches, true = only deal with searches that found results

    $: {
        let r = no_results_only;
        if(file_text !== '') {
            csv_to_structured_obj(file_text);
        }
    }
    $: {
        let n = normalisation;
        if(file_text !== '') {
            csv_to_structured_obj(file_text);
        }
    }

    let report_name = '';
    let f = false;
    let file_reader = false;
    let file_text = '';
    let file_obj = {
        "rows": [],
        "loading": -1
    };
    let invalid_file = false;
    let normalisation = true;

    let searches_rows_arr =[
        {"text": "All", "value": 99999},
        {"text": "None", "value": 0},
        {"text": "10", "value": 10},
        {"text": "30", "value": 30},
        {"text": "50", "value": 50},
        {"text": "100", "value": 100},
        {"text": "500", "value": 500},
        {"text": "1000", "value": 1000},
    ]
    let searches_rows = searches_rows_arr[1];
    let terms_rows_arr =[
        {"text": "All", "value": 99999},
        {"text": "5", "value": 5},
        {"text": "10", "value": 10},
        {"text": "30", "value": 30},
        {"text": "50", "value": 50},
        {"text": "100", "value": 100},
        {"text": "500", "value": 500},
        {"text": "1000", "value": 1000},
    ]
    let terms_rows = terms_rows_arr[1];
    let domains_rows_arr =[
        {"text": "All", "value": 99999},
        {"text": "5", "value": 5},
        {"text": "10", "value": 10},
        {"text": "30", "value": 30},
        {"text": "50", "value": 50},
        {"text": "100", "value": 100},
        {"text": "500", "value": 500},
        {"text": "1000", "value": 1000},
    ]
    let domains_rows = domains_rows_arr[1];

    let all_terms = {};
    let all_terms_sorted = [];

    let all_terms_count_limit = 1;
    $: {
        let entries = Object.entries(all_terms);
        let limit  = all_terms_count_limit;
        all_terms_sorted = entries.filter( (item) => { console.log(item);return item[1].count > limit }).sort((a, b) => b[1].count - a[1].count);
    }

    let all_urls = {};
    let all_urls_sorted = [];
    let url_count = 1;

    $: {
        let entries = Object.entries(all_urls);

        //add in pct to each entrul here
        all_urls_sorted = entries.sort((a, b) => b[1].count - a[1].count);
        let temp_url_count = all_urls_sorted.map(item => item[1].count).reduce((prev, curr) => prev + curr, 0);

        all_urls_sorted.forEach( (url) => {
            url[1].pct = (url[1].count / temp_url_count * 100).toFixed(2);
        })
        url_count = temp_url_count;
    }


    function file_chosen(event) {
        invalid_file = false;
        if(event.target.files.length) {
            f = event.target.files[0];
            //check file types
            //invalid_file
            if(!allowedExtensions.exec(event.target.value)){
                invalid_file = "Please upload CSV files only";
                return false;
            }
            file_reader.readAsArrayBuffer(f);

        } else {
            invalid_file = 'No file was chosen';
            file_text = '';
            csv_to_structured_obj(file_text);
        }
    };
    function cleanUrl(str) {
        //given "https:www.foobar.com/something/other" return something

        try {
            let u = new URL(str);
            let tail = u.href.substring(u.origin.length+1);
            return tail.split('/')[0];
        }
        catch(err) {
            return 'bad_url';
        }
    }
    function removeFluff(str) {
        //1 remove questions marks
        str = str.replace(/\?/g, '');

        //2 remove fluff words
        let arr = str.split(' ');
        
        fluffWords.forEach( (fluff) => {
            arr = arr.filter(t => t !== fluff)
        })

        str = ' ' + arr.join(' ').trim() + ' '; //back to string
        
        if(normalisation) {
             //3 replace synonyms (normalisation)
            syn_keys.forEach((key) => {
                let k = key.replace(/_/g, ' ');
                str = str.replace(new RegExp(k + ' ', 'g'), synonyms[key] + ' ');
            });
            str = str.trim();
        }
       
        
        return str;
    }

    function download(arr, limit, f_name) {
        var csv = 'Item,';  
      
        //merge the data with CSV  
        arr.forEach(function(row, i) {
                if(i == 0) {
                    //complete header
                    csv += Object.keys(row[1]).join(',') + "\n";
                } 
                if(i < limit.value) {
                    csv += row[0] + ',' + Object.values(row[1]).join(',') + "\n";  
                }
        });

        let hiddenElement = document.createElement('a');
        hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);  
        hiddenElement.target = '_blank';
    
        hiddenElement.download = (report_name == '' ? '': report_name + ' - ') + f_name + '.csv';  
        hiddenElement.click();  
    }

    function csv_to_structured_obj(str) {
        /*
            takes a file as a string and maps to our special structured object
            used for painting a result table and dealing with edits on the fly
            without having to re-upload csv data
        */

        
        str = str.replace(/\n$/, ""); //remove any trailing new lines

        invalid_file = false;
        all_terms = {};
        all_terms_sorted = [];

        file_obj.rows = [];

        let obj = Papa.parse(str).data;

        
        /*
        obj[0].forEach((h, i) => {
            file_obj.headers.push(h);
        });
        */

        obj.shift(); //remove headers from the csv rows
        obj.forEach((tr, row_index) => {
            let row = {
                "url": '',
                "clean_url": '',
                "search_term": '',
                "search_term_trimmed": '', /* remove fluff words */
                "terms": [],
                "found_result": false
            };

            /*
                walkme cols
                0 = datetime
                1 = client id
                2 = url
                3 = search term   <- key field
                4 = resulted action
                5 = action type
            */

            if(tr.join('') !== '') { // not an empty row
                //console.log('row');
                row.url = tr[2];
                row.found_result = tr[4] ? true : false;

                row.search_term = tr[3].toLowerCase();
                row.search_term_trimmed = removeFluff(row.search_term, row_index);
                row.terms = [...new Set(row.search_term_trimmed.split(' '))];

                if(row.terms[0] == '') {
                    row.terms = [];
                }

                row.terms.forEach( (term) => {
                    if(term !== '') {
                        all_terms[term] = all_terms[term] ? {"count": all_terms[term].count + 1}  : {"count":1} ;
                    }
                });

                let clean_url = cleanUrl(row.url);
                row.clean_url = clean_url;
                all_urls[clean_url] = all_urls[clean_url] ? {"count": all_urls[clean_url].count + 1}  : {"count":1};


                if(!no_results_only || (no_results_only && !row.found_result)) {
                    file_obj.rows.push(row);
                }
            }

        });
        file_obj.loading = 0;
    }
    function synonymit(str) {
        let syn = prompt("Type the word it's a synonym for", "");
        if (syn != null) {
            console.log(synonyms)
            synonyms[str] = syn;
            console.log(synonyms)

            file_obj.loading = 1;
            setTimeout(() => {
                csv_to_structured_obj(file_text);
            }, 10);
        }
    }
    function fluffit(str) {
        fluffWords.push(str);

        file_obj.loading = 1;
        setTimeout(() => {
            csv_to_structured_obj(file_text);
        }, 10);
        
    } 

    function reset_input(event) {
        event.target.value = '';
    }

    onMount( () => {

            if(typeof (FileReader) != "undefined") {
                file_reader = new FileReader();

                file_reader.onload = function (e) {

                    let codes = new Uint8Array(e.target.result);
                    let file_type = Encoding.detect(codes);

                    try {

                        let unicodeString = Encoding.convert(codes, {
                            to: 'unicode',
                            from: file_type,
                            type: 'string'
                        });

                        file_text = unicodeString;
                        file_obj.loading = 1;
                        setTimeout(() => {
                            csv_to_structured_obj(file_text);
                        }, 10);

                    } catch (e) {
                        // Uncaught RangeError: Maximum call stack size exceeded or something
                        console.error(e);
                    }
                }
            }
        });

</script>


<div>
    <div class="print_block">
        <h1>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle">
                <path d="M15.91 10.91L16.5 9.59C16.94 8.62 17.91 8 18.97 8C19.69 8 20.37 8.28 20.88 8.79L21.58 9.49C20.34 10.17 19.5 11.49 19.5 13V14.88C19.5 18.24 17.11 21.13 13.81 21.76L6.91 23.08C6.56 23.15 6.28 23.39 6.16 23.72C6.04 24.05 6.1 24.42 6.32 24.69C10.19 29.48 16.01 30.92 16.26 30.98C16.34 30.99 16.42 31 16.5 31C16.58 31 16.66 30.99 16.73 30.97C16.87 30.94 30 27.64 30 15V3C30 1.9 29.1 1 28 1H5C3.9 1 3 1.9 3 3V18.26L5 16.26V3H28V15C28 25.3 18.22 28.49 16.5 28.96C15.56 28.69 11.96 27.51 9.05 24.7L14.19 23.72C18.43 22.91 21.5 19.19 21.5 14.88V13C21.5 11.9 22.4 11 23.5 11H24.35C24.93 11 25.22 10.3 24.81 9.89L22.3 7.38C21.41 6.49 20.23 6 18.97 6C17.12 6 15.44 7.09 14.68 8.77L14.16 9.92L0 24.09V26.92L15.71 11.21C15.8 11.12 15.86 11.02 15.91 10.91Z" fill="#1A1919"/>
            </svg> Walkme Report — {report_name}</h1>
    </div>

    <div class="form-row no_print">
        <div class="form-item">
            <label>Walkme CSV file</label>
            <div class="form-control custom-file">
                <input on:mousedown="{reset_input}" on:change="{file_chosen}" type="file" class="custom-file-input" style="opacity:0">
                <label class="custom-file-label" for="inputGroupFile03">{f.name ? f.name : 'Choose file'}</label>
            </div>
        </div>
        <div class="form-item">
            <label>Report name</label>
            <input bind:value="{report_name}" type="text" class="form-control" placeholder="eg Q1 2022">
        </div>
    </div>
    <div class="form-row no_print">
        <div class="form-item">
            <label></label>
            <input type="checkbox" bind:checked="{no_results_only}" style="vertical-align:middle"> Only show searches without results.
            <label></label>
            <input type="checkbox" bind:checked="{normalisation}" style="vertical-align:middle"> Normalise key words (use synonyms)
        </div>
       
    </div>

    

    {#if file_obj.loading == 1}
        Loading...
    {:else if file_obj.loading == 0}

        <div class:no_print="{searches_rows.value == 0}">
            <h3>Searches</h3>
            <p>{file_obj.rows.length} searches made{no_results_only ? ' without results.' : '.'} 
                <span style="float:right;margin-top: -16px;margin-bottom: 16px;" class="no_print"> Print 
                <select class="form-control" style="width:100px"bind:value={searches_rows}>
                    {#each searches_rows_arr as item}
                        <option value={item}>
                            {item.text}
                        </option>
                    {/each}
            </select></span></p>
            <div class="sticky-wrapper print_all">
                <table class="table">
                    <thead>
                        <tr>
                            <th>URL</th>
                            <th>Domain</th>
                            <th>Search term</th>
                            <th>Relevant terms</th>
                            <th>Unique terms counted</th>
                            <th>Results found?</th>
                            
                        </tr>
                    </thead>
                    <tbody>
                        {#each file_obj.rows as row, i}
                            <tr class:no_print={i>=searches_rows.value}>
                                <td>{row.url}</td>
                                <td>{row.clean_url}</td>
                                <td>{row.search_term}</td>
                                <td>
                                    {#each row.search_term_trimmed.split(' ') as term}
                                        {#if term !== ''}
                                            <span class="badge">{term}</span>
                                        {/if}
                                    {/each}

                                </td>
                                <td>{row.terms.length}</td>
                                <td>
                                    {#if row.found_result}
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32">
                                            <polygon points="14 21.414 9 16.413 10.413 15 14 18.586 21.585 11 23 12.415 14 21.414"/>
                                            <path d="M16,2A14,14,0,1,0,30,16,14,14,0,0,0,16,2Zm0,26A12,12,0,1,1,28,16,12,12,0,0,1,16,28Z"/>
                                        </svg>
                                    {:else}
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32">
                                            <path d="M16,2C8.2,2,2,8.2,2,16s6.2,14,14,14s14-6.2,14-14S23.8,2,16,2z M16,28C9.4,28,4,22.6,4,16S9.4,4,16,4s12,5.4,12,12 S22.6,28,16,28z"/>
                                            <polygon points="21.4,23 16,17.6 10.6,23 9,21.4 14.4,16 9,10.6 10.6,9 16,14.4 21.4,9 23,10.6 17.6,16 23,21.4 "/>
                                        </svg>
                                    {/if}
                                </td>
                                    
                        
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>

        <h3>All terms sorted</h3>
        <p>{all_terms_sorted.length} unique terms
            <span style="float:right;margin-top: -16px;margin-bottom: 16px;" class="no_print"><span class="download_csv" on:click="{ () => download(all_terms_sorted, terms_rows, (terms_rows.text == 'All' ? 'All terms' : 'Top ' + terms_rows.text + ' terms')) }">Download</span> / Print 
                <select class="form-control" style="width:100px"bind:value={terms_rows}>
                    {#each terms_rows_arr as item}
                        <option value={item}>
                            {item.text}
                        </option>
                    {/each}
            </select></span></p>
        <div class="sticky-wrapper">
            <table class="table">
                <thead>
                    <tr>
                        <th>Term</th>
                        <th>Count <span class="header_input">above <input type="number" bind:value="{all_terms_count_limit}"/></span></th>
                        <th class="no_print"></th>
                        <th class="no_print"></th>
                    </tr>
                </thead>
                <tbody>
                    {#each all_terms_sorted as term, i}
                        <tr class:no_print={i>=terms_rows.value}>
                            <td>{term[0]}</td>
                            <td>{term[1].count}</td>
                            <td class="no_print"><span class="term_action"on:click="{() => { fluffit(term[0]) } }"><svg id="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32"><rect x="12" y="12" width="2" height="12"/><rect x="18" y="12" width="2" height="12"/><path d="M4,6V8H6V28a2,2,0,0,0,2,2H24a2,2,0,0,0,2-2V8h2V6ZM8,28V8H24V28Z"/><rect x="12" y="2" width="8" height="2"/></svg> Ignore</span></td>
                            <td class="no_print"><span class="term_action"on:click="{() => {synonymit(term[0]) } }"><svg id="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32"><path d="M17.8784,15.4648A2.9821,2.9821,0,0,1,17,13.3433V7.8281l4.5859,4.586L23,11,16,4,9,11l1.4141,1.4141L15,7.8281v5.5152a2.9805,2.9805,0,0,1-.8784,2.1211l-2.6572,2.6567A4.9682,4.9682,0,0,0,10,21.6567V28h2V21.6567a2.9805,2.9805,0,0,1,.8784-2.1211l2.6572-2.6567A5.0021,5.0021,0,0,0,16,16.3135a5.0021,5.0021,0,0,0,.4644.5654l2.6572,2.6563A2.9821,2.9821,0,0,1,20,21.6567V28h2V21.6567a4.9682,4.9682,0,0,0-1.4644-3.5356Z"/></svg> Merge</span></td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
        <h3>All domains sorted</h3>
        <p>{all_urls_sorted.length} unique domains<span style="float:right;margin-top: -16px;margin-bottom: 16px;" class="no_print"><span class="download_csv" on:click="{ () => download(all_urls_sorted, domains_rows, (domains_rows.text == 'All' ? 'All domains' : 'Top ' + domains_rows.text + ' domains')) }">Download</span> / Print 
            <select class="form-control" style="width:100px"bind:value={domains_rows}>
                {#each domains_rows_arr as item}
                    <option value={item}>
                        {item.text}
                    </option>
                {/each}
        </select></span></p>
        <div class="sticky-wrapper">
            <table class="table">
                <thead>
                    <tr>
                        <th>Domain</th>
                        <th>Count</th>
                        <th>%</th>
                    </tr>
                </thead>
                <tbody>
                    {#each all_urls_sorted as term, i}
                        <tr class:no_print={i>=domains_rows.value}>
                            <td>{term[0]}</td>
                            <td>{term[1].count}</td>
                            <td>{term[1].pct}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</div>


<style>
    .form-row {
        display: flex;
	    flex-direction: row;
    }
    .form-item {
        width:50%;
        display: inline-block;
    }
    .form-item > label {
        font-weight:bold;
        display:block;
        font-size:16px;
        margin: 0 0 8px 0;
    }

    .form-control {
        position:relative;
        background:#fff;
    }
    .custom-file-input {
        position: absolute;
        z-index: 2;
        opacity: 0;
        height:32px;
        width:100%;
        cursor:n-resize;
    }
    .custom-file-label {
        user-select: none;
        position: relative;
        cursor:n-resize;
        line-height: 24px;
        padding: 11px 8px;
    }

    .term_action {
        text-decoration: none;
        cursor:pointer;
    }
    .term_action:hover {
        text-decoration: underline;
    }

    .download_csv {
        cursor:pointer;
        text-decoration: underline;

    }
    .term_action svg {
        vertical-align:middle;
    }

    th {
        text-align:left;
    }

    .badge {
        font-size:12px;
        line-height:12px;
        text-transform: uppercase;
        display: inline-block;
        margin-right:4px;
        height:20px;
        padding:4px 8px;
        border-radius: 4px;
        background: var(--eo-surface-selected);

    }

    .header_input {
        font-weight:normal;
    }
    .header_input input {
        border:none;
        width: 50px;
        vertical-align: middle;
        padding: 4px;
        background: rgba(255,255,255,0.4);
        border-radius: 4px;
        margin-left: 4px;
    }

</style>