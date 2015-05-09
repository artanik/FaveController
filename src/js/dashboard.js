(function($) {
    var ipc = require('ipc');
    var vkapi = VKFC.vkapi;
    var dashboard = {};
    VKFC.dashboard = dashboard;
    VKFC.reverse = false;

    var resize = function() {
    };

    resize();

    $(window).on('resize', resize);

    $('.about').on('click', function() {
        $('.dashboard').addClass('hide');
        $('#about').removeClass('hide');
    });

    $('.about-back').on('click', function() {
        $('.dashboard').removeClass('hide');
        $('#about').addClass('hide');
    });

    $('.tabs li[data-tab]').on('click', function(e) {
        var tab = $(this).attr('data-tab');
        $(this).parent().find('.active').removeClass('active');
        $(this).addClass('active');

        $('.sub-tabs [data-tab]').removeClass('active').filter('[data-tab='+tab+']').addClass('active');
        
        $('.tabs-container .tab.active').removeClass('active');
        $('#'+tab).addClass('active');
        resize();
    });

    $('.sub-tabs [data-sub-tab]').on('click', function(e) {
        var tab = $(this).attr('data-sub-tab');
        $('.tabs-container .tab.active').scrollTop(0);
        $(this).parent().find('.active').removeClass('active');
        $(this).addClass('active');
        
        $('.tabs-container .tab.active .sub-tab.active').removeClass('active');
        $('#'+tab).addClass('active');
        resize();
    });

    dashboard.init = function() {
        dashboard.initPosts();
        dashboard.initStack();
        dashboard.initMedia('audio');
        dashboard.initMedia('note');
        dashboard.initMedia('graffiti');
        dashboard.initMedia('doc');
        dashboard.initMedia('poll');
        dashboard.initMedia('link');
        dashboard.initMedia('geo');
        dashboard.initMedia('page');
        dashboard.initMedia('album');
        dashboard.initSourse({platform:'instagram'});
        dashboard.initSourse({platform:'iphone'});
        dashboard.initSourse({platform:'android'});
        dashboard.initSourse({platform:'wphone'});
        dashboard.initSourse({type:'vk'});
        dashboard.initSourse({type:'widget'});
        dashboard.initSourse({type:'api'});
        dashboard.initSourse({type:'rss'});
        dashboard.initSourse({type:'sms'});
        dashboard.initSearch();
        dashboard.initVideos();
        dashboard.initPhotos();

        $(document).on('click', 'a[target="_blank"]', function() {
            var href = $(this).attr('href');
            require('shell').openExternal(href);
            return false;
        });

        $(document).on('click', '.reverse', function() {
            $(this).find('i').toggleClass('hide');
            if(VKFC.reverse) {
                VKFC.reverse = false;
            } else {
                VKFC.reverse = true;
            }

            $('#all').empty();

            dashboard.initPosts();

            $('[data-sub-tab="all"]').trigger('click');
            $('.tabs li[data-tab="posts"]').trigger('click');
        });

        $(document).on('click', '.fave-photo-like', function() {
            var from_id = $(this).attr('data-from-id');
            var owner_id = $(this).attr('data-owner-id');
            var id = parseInt($(this).attr('data-id'), 10);

            $(this).find('i').toggleClass('hide');
            
            if($(this).find('.fa-heart').hasClass('hide')) {
                vkapi.api('likes.delete', {
                  'type'      : 'photo',
                  'owner_id'  : owner_id,
                  'item_id'   : id,
                }, function(data) {});

                VKFC.photos.items = _.map(VKFC.photos.items, function(item) {
                    if(item && item.id === id) {
                        item.isLike = false;
                    }
                    return item;
                });
            } else {
                vkapi.api('likes.add', {
                  'type'       : 'photo',
                  'owner_id'   : owner_id,
                  'item_id'    : id,
                  'access_key' : VKFC.vkapi.token,
                }, function(data) {});

                VKFC.photos.items = _.map(VKFC.photos.items, function(item) {
                    if(item && item.id === id) {
                        item.isLike = true;
                    }
                    return item;
                });
            }

            VKFC.db.sync();

            return false;
        });

        $(document).on('click', '.fave-video-like', function() {
            var from_id = $(this).attr('data-from-id');
            var owner_id = $(this).attr('data-owner-id');
            var id = parseInt($(this).attr('data-id'), 10);

            $(this).find('i').toggleClass('hide');
            
            if($(this).find('.fa-heart').hasClass('hide')) {
                vkapi.api('likes.delete', {
                  'type'      : 'video',
                  'owner_id'  : owner_id,
                  'item_id'   : id,
                }, function(data) {});

                VKFC.videos.items = _.map(VKFC.videos.items, function(item) {
                    if(item && item.id === id) {
                        item.isLike = false;
                    }
                    return item;
                });
            } else {
                vkapi.api('likes.add', {
                  'type'       : 'video',
                  'owner_id'   : owner_id,
                  'item_id'    : id,
                  'access_key' : VKFC.vkapi.token,
                }, function(data) {});

                VKFC.videos.items = _.map(VKFC.videos.items, function(item) {
                    if(item && item.id === id) {
                        item.isLike = true;
                    }
                    return item;
                });
            }

            VKFC.db.sync();

            return false;
        });

        $(document).on('click', '.like', function() {
            var from_id = $(this).attr('data-from-id');
            var owner_id = $(this).attr('data-owner-id');
            var id = parseInt($(this).attr('data-id'), 10);
            var $likeNum = $(this).find('.like-num');
            var likes = $likeNum.text();

            $(this).find('i').toggleClass('hide');
            
            if($(this).find('.fa-heart').hasClass('hide')) {
                vkapi.api('likes.delete', {
                  'type'      : 'post',
                  'owner_id'  : owner_id,
                  'item_id'   : id,
                }, function(data) {
                    if(data.error) {
                        var error_code = data.error.error_code;
                        if (error_code === 14) {
                            var captcha_sid = data.error.captcha_sid;
                            var captcha_img = data.error.captcha_img;
                            var request_params = data.error.request_params;

                            vkapi.showCaptcha({
                                captcha_sid: captcha_sid,
                                captcha_img: captcha_img,
                                request_params: request_params
                            }, function(data) {
                                var response = data.response;
                                $likeNum.text(response.likes);
                            });
                        }
                    } else {
                      var response = data.response;
                      $likeNum.text(response.likes);
                    }
                });

                VKFC.data.items = _.map(VKFC.data.items, function(item) {
                    if(item && item.id === id) {
                        item.isLike = false;
                    }
                    return item;
                });
            } else {
                vkapi.api('likes.add', {
                  'type'       : 'post',
                  'owner_id'   : owner_id,
                  'item_id'    : id,
                  'access_key' : VKFC.vkapi.token,
                }, function(data) {
                  if(data.error) {
                    var error_code = data.error.error_code;
                    if (error_code === 14) {
                        var captcha_sid = data.error.captcha_sid;
                        var captcha_img = data.error.captcha_img;
                        var request_params = data.error.request_params;

                        vkapi.showCaptcha({
                            captcha_sid: captcha_sid,
                            captcha_img: captcha_img,
                            request_params: request_params
                        }, function(data) {
                            var response = data.response;
                            $likeNum.text(response.likes);
                        });
                    }
                  } else {
                    var response = data.response;
                    $likeNum.text(response.likes);
                  }
                });

                VKFC.data.items = _.map(VKFC.data.items, function(item) {
                    if(item && item.id === id) {
                        item.isLike = true;
                    }
                    return item;
                });
            }

            VKFC.db.sync();

            return false;
        });

        $(document).on('click', '.refresh', function() {
            $('.loader-wrapper').show();
            $('.wrapper').hide();
            ipc.send('dropData');
            ipc.send('dropVideos');
            ipc.send('dropPhotos');
            VKFC.load();
        });

        $(document).on('click', '.stack-item', function() {
            var id = parseInt($(this).attr('data-id'), 10);
            
            VKFC.db.getPosts({
                id: id
            }, function(data) {
                $('[data-sub-tab="stack-search"]').removeClass('hide').trigger('click');
                $('#stack-search').empty();
                var offset = 0;
                var count = 10;
                var _scroll = function() {
                    if ($('#stack-search').hasClass('active')) {
                        if (this.scrollHeight - this.scrollTop <= this.clientHeight + 600) {
                            offset += count;
                            _renderPosts($('#stack-search'), data, offset, count);
                        }
                    }
                };

                _renderPosts($('#stack-search'), data, offset, count);
                $('#posts').off('scroll.stack').on('scroll.stack', _scroll);
            });

            return false;
        });

        $(document).on('click', '.datepicker', function() {
            $(this).toggleClass('active');
            $('.container-date').toggle();
            return false;
        });

        var opt = {
          changeMonth: true,
          changeYear: true,
          dateFormat: 'mm/dd/yy',
            monthNames: [ "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь" ],
            monthNamesShort: [ "Янв", "Фев", "Мар", "Апр", "Мая", "Июн", "Июн", "Авг", "Сен", "Окт", "Ноя", "Дек" ],
            dayNames: [ "Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота" ],
            dayNamesMin: [ "Вс", "Пн", "Вт", "Ср", "Чт", "Пн", "Сб" ],
            dayNamesShort: [ "Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam" ],
        };
        
        $("#datepicker-to").datepicker(opt);
        $("#datepicker-from").datepicker(opt);
        $("#datepicker-to, #datepicker-from").on('focus', function() {
            $('.container-date').addClass('focus');
        }).on('blur', function() {
            $('.container-date').removeClass('focus');
        });

        $('#search-date').on('click', function() {
            var to = $( "#datepicker-to" ).val();
            var from = $( "#datepicker-from" ).val();

            if(!_.isEmpty(to) && !_.isEmpty(from)) {
                $('.datepicker').removeClass('active');
                $('.container-date').hide();
                VKFC.db.getPosts({
                    date: {
                       to: to,
                       from: from
                    }
                }, function(data) {
                    $('[data-sub-tab="date-search"]').removeClass('hide').trigger('click');
                    $('[data-sub-tab="date-search"] .count').text(data.items.length);
                    $('#date-search').empty();
                    var offset = 0;
                    var count = 10;
                    var _scroll = function() {
                        if ($('#date-search').hasClass('active')) {
                            if (this.scrollHeight - this.scrollTop <= this.clientHeight + 600) {
                                offset += count;
                                _renderPosts($('#date-search'), data, offset, count);
                            }
                        }
                    };

                    _renderPosts($('#date-search'), data, offset, count);
                    $('#posts').off('scroll.date').on('scroll.date', _scroll);
                });
            } else {
                if(_.isEmpty(from)) {
                    $( "#datepicker-from" ).focus();
                } else if(_.isEmpty(to)) {
                    $( "#datepicker-to" ).focus();
                }
            }
        });

        $(document).on('mousedown', function(e){
            var $container = $('.container-date');
            if ($container.has(e.target).length === 0 && !$container.hasClass('focus')) {
                $('.datepicker').removeClass('active');
                $('.container-date').hide();
            }
        });
    };

    dashboard.initVideos = function() {
        VKFC.db.getVideos(function(data) {
            $('[data-sub-tab="video"] .count').text(data.items.length);

            var _renderVideos = function _renderPosts ($to, data, offset, limit) {
                var items = data.items;
                _.each(items, function(item, index, list) {
                    index++;

                    if(index - offset > limit) {
                        return false;
                    }

                    if(index <= offset) {
                        return true;
                    }

                    var source   = $("#video-template").html();
                    var template = Handlebars.compile(source);
                    var context = {
                        id: item.id,
                        from_id: item.from_id,
                        owner_id: item.owner_id,
                        title: item.title,
                        duration: converSeconds(item.duration),
                        photo_url: item.photo_320,
                        link: 'https://vk.com/video'+item.owner_id+'_'+item.id,
                        isLike: _.isUndefined(item.isLike)? true: item.isLike
                    };

                    var html = template(context);

                    $to.append(html);
                });
            };

            var offset = 0;
            var count = 100;

            var _scroll = function() {
                if ($('#all').hasClass('active')) {
                    if (this.scrollHeight - this.scrollTop <= this.clientHeight + 600) {
                        offset += count;
                        _renderVideos($('#video'), data, offset, count);
                    }
                }
            };
            
            _renderVideos($('#video'), data, offset, count);
            $('#media').off('scroll.videos').on('scroll.videos', _scroll);
        });

        return false;
    };

    dashboard.initPhotos = function() {
        VKFC.db.getPhotos(function(data) {
            $('[data-sub-tab="photo"] .count').text(data.items.length);

            var _renderPhotos = function _renderPosts ($to, data, offset, limit) {
                var items = data.items;
                _.each(items, function(item, index, list) {
                    index++;

                    if(index - offset > limit) {
                        return false;
                    }

                    if(index <= offset) {
                        return true;
                    }

                    var source   = $("#photo-template").html();
                    var template = Handlebars.compile(source);
                    var context = {
                        id: item.id,
                        from_id: item.from_id,
                        owner_id: item.owner_id,
                        photo_url: item.photo_604,
                        link: 'https://vk.com/photo'+item.owner_id+'_'+item.id,
                        isLike: _.isUndefined(item.isLike)? true: item.isLike
                    };

                    var html = template(context);

                    $to.append(html);
                });
            };

            var offset = 0;
            var count = 100;

            var _scroll = function() {
                if ($('#all').hasClass('active')) {
                    if (this.scrollHeight - this.scrollTop <= this.clientHeight + 600) {
                        offset += count;
                        _renderPhotos($('#photo'), data, offset, count);
                    }
                }
            };
            
            _renderPhotos($('#photo'), data, offset, count);
            $('#media').off('scroll.photos').on('scroll.photos', _scroll);
        });

        return false;
    };

    dashboard.initSearch = function() {
        $(document).on('click', '.tab-close', function(e) {
            var id = $(this).parent().attr('data-sub-tab');
            $(this).parent().addClass('hide');
            if($(this).parent().hasClass('active')) {
                $('[data-sub-tab="all"]').trigger('click');
                $('.tabs li[data-tab="posts"]').trigger('click');
            }
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
        });

        $('#search').on('keyup', function(e) {
            if(e.keyCode !== 13) {
                return false;
            }

            var keyword = $(this).val();
            $('#keyword-search').empty();

            if(_.isEmpty(keyword)) {
                $('[data-sub-tab="keyword-search"]').addClass('hide');
                if($('[data-sub-tab="keyword-search"]').hasClass('active')) {
                    $('[data-sub-tab="all"]').trigger('click');
                    $('.tabs li[data-tab="posts"]').trigger('click');
                }
            } else {
                $('.tabs li[data-tab="posts"]').trigger('click');
                $('[data-sub-tab="keyword-search"]').removeClass('hide').trigger('click');

                VKFC.db.getPosts({
                    keyWord: keyword
                }, function(data) {
                    var offset = 0;
                    var count = 10;
                    $('[data-sub-tab="keyword-search"] .count').text(data.items.length);

                    var _scroll = function() {
                        if ($('#keyword-search').hasClass('active')) {
                            if (this.scrollHeight - this.scrollTop <= this.clientHeight + 600) {
                                offset += count;
                                _renderPosts($('#keyword-search'), data, offset, count);
                            }
                        }
                    };
                    
                    _renderPosts($('#keyword-search'), data, offset, count);
                    $('#posts').off('scroll.keyword').on('scroll.keyword', _scroll);
                });
            }
        });
    };

    dashboard.initStack = function() {
        VKFC.db.getStock(function(data) {
            var groups = data.groups;
            var profiles = data.profiles;
            var source   = $("#stack-template").html();
            var template = Handlebars.compile(source);
            var context = {};

            $('[data-sub-tab="stack"] .count').text(groups.length+'|'+profiles.length);

            _.each(groups, function(item, key, list) {
                context = {
                    id: item[0],
                    name: item[1].name,
                    count: item[1].count,
                    img: item[1].photo_50
                };
                var html = template(context);
                $('#stack-group').append(html);
            });

            _.each(profiles, function(item, key, list) {
                context = {
                    id: item[0],
                    name: item[1].first_name+' '+item[1].last_name,
                    count: item[1].count,
                    img: item[1].photo_50
                };
                var html = template(context);
                $('#stack-profiles').append(html);
            });
        });
    };

    dashboard.initSourse = function(params) {
        if(_.isUndefined(params)) {
            return false;
        }

        var source = '';
        
        if(params.platform) {
            source = params.platform;
        }
        
        if(params.type) {
            source = params.type;
        }

        VKFC.db.getPosts({
            source: source
        }, function(data) {
            var offset = 0;
            var count = 10;
            $('[data-sub-tab="'+source+'"] .count').text(data.items.length);


            var _scroll = function() {
                if ($('#'+source).hasClass('active')) {
                    if (this.scrollHeight - this.scrollTop <= this.clientHeight + 600) {
                        offset += count;
                        _renderPosts($('#'+source), data, offset, count);
                    }
                }
            };
            
            _renderPosts($('#'+source), data, offset, count);
            $('#source').off('scroll.'+source).on('scroll.'+source, _scroll);
        });
    };
    
    dashboard.initMedia = function(type) {
        if(_.isUndefined(type)) {
            return false;
        }
        
        VKFC.db.getPosts({
            attachmentsHasType: type
        },function(data) {
            var offset = 0;
            var count = 10;
            $('[data-sub-tab="'+type+'"] .count').text(data.items.length);


            var _scroll = function() {
                if ($('#'+type).hasClass('active')) {
                    if (this.scrollHeight - this.scrollTop <= this.clientHeight + 600) {
                        offset += count;
                        _renderPosts($('#'+type), data, offset, count);
                    }
                }
            };
            
            _renderPosts($('#'+type), data, offset, count);
            $('#media').off('scroll.'+type).on('scroll.'+type, _scroll);
        });
    };

    dashboard.initPosts = function() {
        VKFC.db.getPosts(function(data) {
            $('[data-sub-tab="all"] .count').text(data.items.length);
            var offset = 0;
            var count = 10;

            if(VKFC.reverse) {
                data.items.reverse();
            }

            var _scroll = function() {
                if ($('#all').hasClass('active')) {
                    if (this.scrollHeight - this.scrollTop <= this.clientHeight + 600) {
                        offset += count;
                        _renderPosts($('#all'), data, offset, count);
                    }
                }
            };
            
            _renderPosts($('#all'), data, offset, count);
            $('#posts').off('scroll.feed').on('scroll.feed', _scroll);
        });
    };


    function _renderPosts ($to, data, offset, limit) {
        var items = data.items;
        _.each(items, function(item, index, list) {
            index++;

            if(index - offset > limit) {
                return false;
            }

            if(index <= offset) {
                return true;
            }

            var copy_history = item.copy_history;
            var comments = item.comments.count;
            var likes = item.likes.count;
            var reposts = item.reposts.count;
            var text = item.text;
            var date = item.date;
            var attachments = item.attachments;
            var from_id = item.from_id;
            var owner_id = item.owner_id;
            var id = item.id;
            var fromInfo = getOwnerInfo(from_id);
            var attachmentsHTML = '';
            var _copy;

            if(copy_history) {
                _copy = copy_history[copy_history.length-1];
                attachments = _copy.attachments;
            }

            var fromName = fromInfo.name?fromInfo.name:fromInfo.first_name+' '+fromInfo.last_name;
            var photoCount = _.filter(attachments, function(attach) {return attach.type === 'photo';});
            photoCount = photoCount? photoCount.length : 0;

            var massonryClass = photoCount >= 3?' masonry-third':'';
            massonryClass = photoCount >= 7?' masonry-four':massonryClass;
            massonryClass = photoCount == 10?' masonry-five':massonryClass;

            attachmentsHTML += '<div class="masonry'+massonryClass+'">';
            _.each(attachments, function(attach, attachIndex, attachList) {
                if(attach.type === 'photo') {
                    attachmentsHTML += '<img class="attach-photo" src="'+attach.photo.photo_604+'">';
                }
            });
            attachmentsHTML += '</div>';

            _.each(attachments, function(attach, attachIndex, attachList) {
                if(attach.type === 'graffiti') {
                    attachmentsHTML += '<img class="attach-photo" src="'+attach.graffiti.photo_586+'">';
                }
                if(attach.type === 'video') {
                    attachmentsHTML += '<div class="attach-video"><img src="'+attach.video.photo_320+'"><span class="attach-video--name">'+attach.video.title+'</span><span class="attach-video--duration">'+converSeconds(attach.video.duration)+'</span></div>';
                }
                if(attach.type === 'album') {
                    attachmentsHTML += '<div class="attach-album"><img src="'+attach.album.thumb.photo_604+'"><span class="attach-album--name">'+attach.album.title+'</span><span class="attach-album--description">'+attach.album.description+'</span><span class="attach-album--size"><i class="fa fa-camera"></i> '+attach.album.size+'</span></div>';
                }
                if(attach.type === 'audio') {
                    var down = attach.audio.url?'<a href="'+attach.audio.url+'" target="_blank" class="btn"><i class="fa fa-download"></i></a>':'<span class="btn btn-disabled"><i class="fa fa-ban"></i></span>';
                    attachmentsHTML += '<div class="attach-audio">'+down+' <strong>'+attach.audio.artist+'</strong> - '+attach.audio.title+' <em>('+converSeconds(attach.audio.duration)+')</em></div>';
                }
                if(attach.type === 'doc') {
                    attachmentsHTML += '<div class="attach-doc"><a href="'+attach.doc.url+'" target="_blank" class="btn"><i class="fa fa-download"></i></a> <em>('+attach.doc.ext+')</em> '+attach.doc.title+'</div>';
                }
                if(attach.type === 'poll') {
                    var question = '<div class="attach-poll--question">'+attach.poll.question+'</div>';
                    var answers = attach.poll.answers;
                    var answer_id = attach.poll.answer_id;
                    var answersHTML = '';
                    _.each(answers, function(answer) {
                        var check = answer.id === answer_id? '<i class="fa fa-check"></i>': '';
                        var text = '<div class="attach-poll--answer_text">'+answer.text+'</div>';
                        var rate = answer.rate;
                        var votes = '<div class="attach-poll--answer_votes">'+check+'<div style="width:'+rate+'%;"></div><span>'+answer.votes+'</span></div>';

                        answersHTML += '<div class="attach-poll--attach">'+text+votes+'</div>';
                    });
                    attachmentsHTML += '<div class="attach-poll">'+question+answersHTML+'</div>';
                }
                if(attach.type === 'note') {
                    attachmentsHTML += '<div class="attach-note"><a href="'+attach.note.view_url+'" target="_blank" class="btn"><i class="fa fa-external-link"></i></a> <strong>'+attach.note.title+'</strong> <em>'+convertTimestamp(attach.note.date)+'</em></div>';
                }
                if(attach.type === 'page') {
                    var pageName = attach.page.title.replace(/</gm, '&lt;');
                    pageName = pageName.replace(/>/gm, '&gt;');
                    attachmentsHTML += '<div class="attach-page"><a href="'+attach.page.view_url+'" target="_blank"><i class="fa fa-edit"></i> '+pageName+'</a></div>';
                }
                if(attach.type === 'link') {
                    var linkName = attach.link.title.replace(/</gm, '&lt;');
                    linkName = linkName.replace(/>/gm, '&gt;');
                    attachmentsHTML += '<div class="attach-link"><a href="'+attach.link.url+'" target="_blank"><i class="fa fa-globe"></i> '+linkName+'</a></div>';
                }
            });


            if(item.geo) {
                var geo = item.geo;
                var place, img, title, address, country;

                if(geo.type === 'point') {
                    place = geo.place;
                    img = '<span class="attach-place--img"><img src="'+place.icon+'" alt="" /></span>';
                    title = '<span class="attach-place--title">'+place.title+'</span>';
                    address = '<span class="attach-place--city">'+place.city+'</span>';
                    country = '<span class="attach-place--county">'+place.country+'</span>';
                    attachmentsHTML += '<div class="attach-place">'+img+title+' ('+country+', '+address+'</div>';
                }

                if(geo.type === 'place') {
                    place = geo.place;
                    img = '<span class="attach-place--img"><img src="'+place.icon+'" alt="" /></span>';
                    title = '<span class="attach-place--title">'+place.title+'</span>';
                    address = '<span class="attach-place--address">'+place.address+'</span>';
                    //var country = '<span class="attach-place--address">'+_.findWhere(VKFC.places.countries, {id:place.country})+'</span>';
                    attachmentsHTML += '<div class="attach-place">'+img+title+ (place.address?' ('+address:'') +'</div>';
                }
            }

            var source   = $("#post-template").html();
            var template = Handlebars.compile(source);
            var context = {
                id: id,
                index: index,
                from_id: from_id,
                owner_id: owner_id,
                owner_img: fromInfo.photo_50,
                owner_name: fromName,
                text: new Handlebars.SafeString(text.replace(/\n/g, "<br />")),
                attachments: new Handlebars.SafeString(attachmentsHTML),
                likes: likes,
                reposts: reposts,
                comments: comments,
                original_url: 'https://vk.com/wall'+owner_id+'_'+id,
                date: convertTimestamp(date),
                copy: copy_history,
                isLike: _.isUndefined(item.isLike)? true: item.isLike
            };

            if(copy_history) {
                _copy = copy_history[copy_history.length-1];
                var ownerInfo = getOwnerInfo(_copy.owner_id);

                if(ownerInfo && _copy.owner_id !== owner_id) {
                    var ownerName = ownerInfo.name?ownerInfo.name:ownerInfo.first_name+' '+ownerInfo.last_name;
                    context.copy_owner_img = ownerInfo.photo_50;
                    context.copy_owner_name = ownerName;
                    context.copy_text = new Handlebars.SafeString(_copy.text.replace(/\n/g, "<br />"));
                    context.copy_attachments = context.attachments;
                    context.copy_date = convertTimestamp(_copy.date);
                } else {
                    context.copy = false;
                }
            }

            var html = template(context);

            $to.append(html);
        });
    }

})(jQuery);