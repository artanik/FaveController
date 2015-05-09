(function() {
    var vkapi = {};
    VKFC.vkapi = vkapi;

    var API_VERSION = '5.30';
    var CALLBACK_BLANK = 'https://oauth.vk.com/blank.html';
    var AUTHORIZE_URL = 'https://oauth.vk.com/authorize?client_id={client_id}&scope={scope}&redirect_uri={redirect_uri}&display={display}&v={api_version}&response_type={response_type}';
    var GET_TOKEN_URL = 'https://oauth.vk.com/access_token?client_id={client_id}&client_secret={client_secret}&code={code}&redirect_uri={redirect_uri}';
    var METHOD_URL = 'https://api.vk.com/method/';


    var appId = VKFC.config.appId;
    var scope = 'offline,friends,wall';
    var token = null;

    function _showCaptcha(img, callback) {
        $('.captcha').removeClass('hide');
        $('#captcha-content').html('<img src="'+img+'" alt="" />');
        $('#captcha-send').off('click').on('click', function() {
            callback($('#captcha').val());
        });
    }

    $('#captcha-bg').on('click', function() {
        $('.captcha').addClass('hide');
    });

    vkapi.showCaptcha = function(params, callback) {
        var method = _.findWhere(params.request_params, {key: 'method'});
        var sendParams = {};

        _.each(params.request_params, function(param) {
            if(param.key === 'method') {
                return true;
            }
            sendParams[param.key] = param.value;
        });

        _showCaptcha(params.captcha_img, function(key) {
            $('.captcha').addClass('hide');
            sendParams.captcha_sid = params.captcha_sid;
            sendParams.captcha_key = key;

            vkapi.api(method.value, sendParams, callback);
        });
    };

    vkapi.api = function(method, vars, callback) {
        var params = http_build_query(vars);
        var url = _http_build_query(method, params);
        _call(url, callback);
    };

    vkapi.setToken = function(_token) {
        VKFC.vkapi.token = _token;
        token = _token;
    };

    vkapi.getAuthUrl = function() {
        var url = _createUrl(AUTHORIZE_URL);
        return url;
    };

    vkapi.getToken = function(code, callback) {
        var url = _createUrl(GET_TOKEN_URL, {code: code});
        _call(url, callback);
    };

    function _call(url, callback) {
        $.ajax({
            url: url,
            dataType : 'json',
            success: function(response) {
                callback(response);
            }
        });
    }

    function _http_build_query(method, params){
        return  METHOD_URL + method + '?' + params+'&access_token=' + token+'&v=' + API_VERSION;
    }

    function _createUrl(url, _params) {
        var params = _params || {};
        var client_id = params.client_id || VKFC.config.appId;
        var client_secret = params.client_secret || VKFC.config.appKey;
        var scope = params.scope || VKFC.config.scope;
        var redirect_uri = params.redirect_uri || CALLBACK_BLANK;
        var api_version = params.api_version || API_VERSION;
        var display = params.display || 'page';
        var response_type = params.response_type || 'code';
        var code = params.code || '';

        url = url.replace('{client_id}', client_id);
        url = url.replace('{client_secret}', client_secret);
        url = url.replace('{scope}', scope);
        url = url.replace('{redirect_uri}', redirect_uri);
        url = url.replace('{api_version}', api_version);
        url = url.replace('{display}', display);
        url = url.replace('{response_type}', response_type);
        url = url.replace('{code}', code);

        return url;
    }

})();