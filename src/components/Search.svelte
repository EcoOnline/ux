<script>
    export let search_config = {
        conditions: []
    };


    //all the possible types of matching
    let matches = {
        is:             {"text": "is", "key": "equal"},
        is_not:         {'text': "isn't", "key": "not_equal"},
        contains:       {'text': "contains", "key": "contains"},
        starts_with:    {'text': "starts with", "key": "starts_with"},
        ends_with:      {'text': "ends with", "key": "ends_with"},
        not_contains:   {'text': "doesn't contain", "key": "not_contains"},
        equals:         {'text': "equals", "key": "equal"},
        not_equals:     {'text': "doesn't equal", "key": "not_equal"},
        less_than:      {'text': "is less than", "key": "less_than"},
        greater_than:   {'text': "is greater than", "key": "greater_than"},
        older_than:     {'text': "is older than", "key": "less_than"},
        newer_than:     {'text': "is newer than", "key": "greater_than"},
    }

    let fake_sql = '';
    $: {
        let sql = "SELECT * FROM " + search_config.domain.toLowerCase();
        if(search_config.conditions.length) {
            sql += ' WHERE ';
        }
        search_config.conditions.forEach( (con_set, i) => {
            if(con_set.length > 1) {
                sql += '(';
            }
            con_set.forEach( (con, j) => {
                sql += 'x = y';
            });
            if(con_set.length > 1 && i == con_set.length - 1) {
                sql += ')';
            }

        });

        fake_sql = sql;
    }


    function add_set() {
        search_config.conditions.push([]);
        let new_index = search_config.conditions.length - 1;
        add_condition(new_index);
    }
    function add_condition(set_index) {
        let temp_obj = {};
        search_config.conditions[set_index].push(temp_obj)
    }
</script>
<h2>Search all {search_config.domain}</h2>
<!--{JSON.stringify(search_config)}<br>-->

<span class='btn'>{search_config.btn}</span> <span class='btn btn-secondary'>Add Condition</span><br><br>

<code>{fake_sql}</code>


<style>
    h2 { font-weight:normal}
</style>