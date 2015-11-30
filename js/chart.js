
Number.prototype.pad = function() {
    var s = parseInt(this);
    if(s<10){
        s = "0"+s;
    }
    return s;
}

function daysInMonth(month,year) {
    return new Date(year, month, 0).getDate();
}


function chart_data_generate_30(optin_data, list_id){
    var today = new Date();
    var current_month = today.getMonth() + 1;
    var current_year = today.getFullYear();
    var current_day = today.getDate();
    var previous_month_required = false; //boolean to check if we had to go back to previous month

    var days_current_month = daysInMonth(current_month, current_year);
    if(days_current_month - current_day > 0){//see if we need to go into previous month get rest of dates
        //see if going to current month takes us to last year
        var previous_month_required = true;

        var days_from_previous_month =  30 - current_day; //returns how many days we will need from the previous month, need 29 so 30 day results will include today and not be 31 days
        if(current_month == 0){//0 is jan
            var previous_year = current_year - 1;
            var previous_month = 11;
            var days_previous_month = daysInMonth(previous_month, previous_year);
        }else{
            var previous_month = current_month -1;
            var previous_year = current_year;
            var days_previous_month = daysInMonth(previous_month, current_year);
        }
        var starting_date_previous_month = days_previous_month - days_from_previous_month;
    }

    data_array = [];
    if(previous_month_required == true){
        while(starting_date_previous_month <= days_previous_month){
            starting_date_previous_month = starting_date_previous_month.pad();
            data_array.push({'date': previous_year+'-'+previous_month+'-'+starting_date_previous_month, 'month':previous_month, 'day':starting_date_previous_month, 'year':previous_year, 'converstions': 0, 'list_ids':[]});

            starting_date_previous_month++;
        }
    }

    //add remaining days from this month
    var i = 1;
    while(i <= current_day){
        i = i.pad();
        data_array.push({'date': current_year+'-'+current_month+'-'+i, 'month':current_month, 'day':i, 'year':current_year,'converstions': 0});
        i++;
    }
    if(list_id === undefined){
        list_id = 'all';
    }else{
        list_id = list_id;
    }

    for(data_id in data_array){
        for(data in optin_data) {
            var record_date = rapid_getInfo(optin_data[data].record_date);
            optin_list_id = optin_data[data].list_id;
            var dataDate = data_array[data_id].date;
            if (list_id !== 'all') {
                if (record_date.full_date == dataDate && list_id == optin_list_id) {
                    if (data_array[data_id].converstions) {
                        data_array[data_id].converstions++;
                    } else {
                        data_array[data_id].converstions = 1;
                    }
                }
            } else {
                if (record_date.full_date == dataDate) {
                    if (data_array[data_id].converstions) {
                        data_array[data_id].converstions++;
                    } else {
                        data_array[data_id].converstions = 1;
                    }
                }
            }
        }
    }
    return data_array;
}

function chart_data_generate_12(optin_data, list_id){

    var today = new Date();
    var current_month = today.getMonth() + 1;
    var current_year = today.getFullYear();
    var previous_year_required = false; //boolean to check if we had to go back to previous month
    var data_array = [];

    //check if we need to go into previous year
    if(current_month - 12 < 0){
        previous_year_required	= true;
        previous_months_needed = current_month - 12;
        previous_months_needed = Math.abs(previous_months_needed); //change negative number to positive;
        var previous_year = current_year - 1;

        //make array with month number representation needed from previous year
        var previous_months = [];
        var mnths = 12; //start at december
        while(previous_months_needed >= 0){
            previous_months.push(mnths - previous_months_needed);
            previous_months_needed--;
        }
    }

    if(previous_year_required == true){
        for(month in previous_months){
            var month = previous_months[month].pad();
            data_array.push({'date': previous_year+'-'+month, 'month':month, 'year':previous_year,'converstions': 0});
        }
        //get number of current years months needed
        var current_months_required = 12 - Math.abs(previous_months_needed);
    }

    for( i = 1; i <= current_months_required; i++ ){
        i = i.pad();
        data_array.push({'date': current_year+'-'+i, 'month':i, 'year': current_year,'converstions': 0});
    }
    if(list_id === undefined){
        list_id = 'all';
    }else{
        list_id = list_id;
    }
    for(data_id in data_array){
        year = data_array[data_id].year;
        month = data_array[data_id].month;

        var regex_date = year+'-'+month;
        var regex = new RegExp(regex_date, "g");
        for(data in optin_data){
            var optin_list_id = optin_data[data].list_id;
            var record_date = rapid_getInfo(optin_data[data].record_date);
            var compare_date = record_date.year+'-'+record_date.month;
            var match = compare_date.match(regex);

            if(match){
                if(list_id !== 'all') {
                    if(list_id == optin_list_id) {
                        if (data_array[data_id].converstions) {
                            data_array[data_id].converstions++;
                        } else {
                            data_array[data_id].converstions = 1;
                        }
                    }
                }else{
                    if (data_array[data_id].converstions) {
                        data_array[data_id].converstions++;
                    } else {
                        data_array[data_id].converstions = 1;
                    }
                }
            }
        }

    }
    return data_array;
}

function rapid_getInfo(dateTime){
    var dateTime = dateTime;
    dateTime = dateTime.split(" ");
    var date = dateTime[0];
    date =  date.split("-");

    var optin_date_object = {'year': date[0], 'month': date[1], 'day': date[2], 'full_date': date[0]+'-'+date[1]+'-'+date[2]};
    return optin_date_object;
}

