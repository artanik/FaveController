(function($) {
    var ipc = require('ipc');
    var vkapi = VKFC.vkapi;
    var db = VKFC.db;
    var pathname = window.location.pathname;
    var _token = localStorage.getItem('access_token');

    VKFC.load = function() {
        var _token = localStorage.getItem('access_token');
        var sync = {
            posts: false,
            photos: false,
            videos: false
        };
        
        var _reload = function() {
            if(sync.posts === 'done' && sync.photos === 'done' && sync.videos === 'done') {
                window.location.reload();
            }
        };

        if(!ipc.sendSync('checkData')) {
            $('.loader .title').html('Синхронизация');
            $('.loader .sub-title__loader').removeClass('hide');

            vkapi.setToken(_token);
            db.setPosts();
            db.setPhotos();
            db.setVideos();

            ipc.on('setData', function(arg) {
                sync.posts = arg;
                _reload();
            });

            ipc.on('setPhotos', function(arg) {
                sync.photos = arg;
                _reload();
            });

            ipc.on('setVideos', function(arg) {
                sync.videos = arg;
                _reload();
            });
        }
    };

    // disabled pinch zoom
    document.body.addEventListener('mousewheel', function(e) {
        if(e.ctrlKey) {
            e.preventDefault();
        }
    });

    if(_.isEmpty(_token)) {
        VKFC.login.init();
    } else if(!ipc.sendSync('checkData')) {
        VKFC.load();
    } else {
        if(pathname.indexOf('login.html') !== -1) {
            window.location.href = 'index.html';
        }
        $('.loader-wrapper').show();
        $('.wrapper').hide();

        vkapi.setToken(_token);
        db.init();
        VKFC.dashboard.init();

        $(window).on('load', function() {
            $('.loader-wrapper').hide();
            $('.wrapper').show();
        });
    }
})(jQuery);