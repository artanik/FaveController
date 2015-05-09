(function($) {
    var ipc = require('ipc');
    var vkapi = VKFC.vkapi;
    var login = {};
    VKFC.login = login;

    $('.logout').on('click', function() {
        VKFC.login.logout();
    });

    login.logout = function() {
        $('.loader-wrapper').show();
        $('.wrapper').hide();

        $.ajax({
            url: 'https://login.vk.com/?act=openapi&oauth=1&aid='+VKFC.config.appId+'&location=artanik.ru&do_logout=1&token='+VKFC.vkapi.token,
            //url: 'https://oauth.vk.com/logout?client_id='+VKFC.vkapi.token,
            //url: 'https://oauth.vk.com/logout',
            method: 'get',
            success: function() {
                ipc.send('dropData');
                ipc.send('dropVideos');
                ipc.send('dropPhotos');
                localStorage.removeItem('access_token');
                window.location.href = 'login.html';
            }
        });
    };

    login.init = function() {
        var $webview = $('#webview');
        $('.loader-wrapper').hide();
        $('.wrapper').show();

        $webview.attr('src', vkapi.getAuthUrl());

        $webview[0].addEventListener("did-get-redirect-request", function (e) {
            var parser = document.createElement('a');
            parser.href = e.newUrl;
            var hash = parser.hash.split('=');
            var query = parser.search;
            var code = hash[1];

            if(query.indexOf('error') !== -1) {
                $(webview).remove();
            }

            if(hash[0] === '#code') {
                $(webview).remove();
                $('.loader-wrapper').show();
                $('.wrapper').hide();
                vkapi.getToken(code, function(response) {
                    var token = response.access_token;
                    localStorage.setItem('access_token', token);
                    VKFC.load();
                });
            }

        });

        $('.singup-btn').on('click', function() {
            $('#webview-wrapper').show();
        });


        $('.version').text('v'+ipc.sendSync('getVersion'));
        
    };

})(jQuery);