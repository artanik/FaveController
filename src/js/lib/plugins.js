function http_build_query(formdata, numeric_prefix, arg_separator) {
  //  discuss at: http://phpjs.org/functions/http_build_query/
  // original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // improved by: Legaev Andrey
  // improved by: Michael White (http://getsprink.com)
  // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // improved by: Brett Zamir (http://brett-zamir.me)
  //  revised by: stag019
  //    input by: Dreamer
  // bugfixed by: Brett Zamir (http://brett-zamir.me)
  // bugfixed by: MIO_KODUKI (http://mio-koduki.blogspot.com/)
  //        note: If the value is null, key and value are skipped in the http_build_query of PHP while in phpjs they are not.
  //  depends on: urlencode
  //   example 1: http_build_query({foo: 'bar', php: 'hypertext processor', baz: 'boom', cow: 'milk'}, '', '&amp;');
  //   returns 1: 'foo=bar&amp;php=hypertext+processor&amp;baz=boom&amp;cow=milk'
  //   example 2: http_build_query({'php': 'hypertext processor', 0: 'foo', 1: 'bar', 2: 'baz', 3: 'boom', 'cow': 'milk'}, 'myvar_');
  //   returns 2: 'myvar_0=foo&myvar_1=bar&myvar_2=baz&myvar_3=boom&php=hypertext+processor&cow=milk'

  var value, key, tmp = [],
    that = this;

  var _http_build_query_helper = function(key, val, arg_separator) {
    var k, tmp = [];
    if (val === true) {
      val = '1';
    } else if (val === false) {
      val = '0';
    }
    if (val != null) {
      if (typeof val === 'object') {
        for (k in val) {
          if (val[k] != null) {
            tmp.push(_http_build_query_helper(key + '[' + k + ']', val[k], arg_separator));
          }
        }
        return tmp.join(arg_separator);
      } else if (typeof val !== 'function') {
        return encodeURIComponent(key) + '=' + encodeURIComponent(val);
      } else {
        throw new Error('There was an error processing for http_build_query().');
      }
    } else {
      return '';
    }
  };

  if (!arg_separator) {
    arg_separator = '&';
  }
  for (key in formdata) {
    value = formdata[key];
    if (numeric_prefix && !isNaN(key)) {
      key = String(numeric_prefix) + key;
    }
    var query = _http_build_query_helper(key, value, arg_separator);
    if (query !== '') {
      tmp.push(query);
    }
  }

  return tmp.join(arg_separator);
}

function converSeconds(totalSec) {
  var hours = parseInt( totalSec / 3600 ) % 24;
  var minutes = parseInt( totalSec / 60 ) % 60;
  var seconds = totalSec % 60;

  var result = (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds  < 10 ? "0" + seconds : seconds);

  if(hours !== 0) {
    result = (hours < 10 ? "0" + hours : hours) + ":" + result;
  }

  return result;
}

function highlight(string) {
  return '<strong class="highlight">' + string + '</strong>';
}



function getOwnerInfo(_id) {
  var fromId = parseInt(_id, 10);
  var profiles = VKFC.data.profiles;
  var groups = VKFC.data.groups;

  if(fromId < 0) {
      return _.find(groups, {id: Math.abs(fromId)});
  } else {
      return _.find(profiles, {id: fromId});
  }
}

function convertMonth(argument) {
  var _arg = parseInt(argument, 10);
  switch(_arg) {
    case 1: return 'Января';
    case 2: return 'Феврала';
    case 3: return 'Марта';
    case 4: return 'Апреля';
    case 5: return 'Мая';
    case 6: return 'Июня';
    case 7: return 'Июля';
    case 8: return 'Августа';
    case 9: return 'Сентября';
    case 10: return 'Октября';
    case 11: return 'Ноября';
    case 12: return 'Декабря';
  }
}

function getTimeByTimestamp(timestamp) {
  var d = new Date(timestamp * 1000), // Convert the passed timestamp to milliseconds
    yyyy = d.getFullYear(),
    mm = ((d.getMonth() + 1)),  // Months are zero based. Add leading 0.
    dd = (d.getDate()),     // Add leading 0.
    hh = d.getHours(),
    h = hh,
    min = (d.getMinutes());   // Add leading 0.

  return {
    year: yyyy,
    month: mm,
    day: dd,
    hours: hh,
    minutes: min
  };
}

function convertTimestamp(timestamp) {
  var d = new Date(timestamp * 1000), // Convert the passed timestamp to milliseconds
    yyyy = d.getFullYear(),
    mm = ('0' + (d.getMonth() + 1)).slice(-2),  // Months are zero based. Add leading 0.
    dd = ('0' + d.getDate()).slice(-2),     // Add leading 0.
    hh = d.getHours(),
    h = hh,
    min = ('0' + d.getMinutes()).slice(-2),   // Add leading 0.
    ampm = 'AM',
    time;
  
  // ie: 2013-02-18, 8:35 AM  
  time = dd + ' ' + convertMonth(mm) + ' ' + yyyy + ' в ' + h + ':' + min;
    
  return time;
}