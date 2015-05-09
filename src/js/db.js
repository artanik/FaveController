(function($) {
  var ipc = require('ipc');
  var vkapi = VKFC.vkapi;
  var db = {};
  VKFC.db = db;

  db.init = function() {
    db.setPlaces();

    var json = ipc.sendSync('getPosts');
    var data = JSON.parse(json);
    VKFC.data = data;

    var jsonVideos = ipc.sendSync('getVideos');
    var videos = JSON.parse(jsonVideos);
    VKFC.videos = videos;

    var jsonPhotos = ipc.sendSync('getPhotos');
    var photos = JSON.parse(jsonPhotos);
    VKFC.photos = photos;
  };

  db.sync = function() {
    ipc.send('syncVideos', JSON.stringify(VKFC.videos));
    ipc.send('syncPhotos', JSON.stringify(VKFC.photos));
    ipc.send('syncData', JSON.stringify(VKFC.data));
  };

  db.getPosts = function() {
    var data = $.extend(true, {}, VKFC.data);
    var search = arguments[0];
    var callback = arguments[arguments.length - 1];
    var scheme = {
      items: [],
      wall: [],
      groups: [],
      profiles: []
    };

    if(_.isFunction(search)) {
      callback(data);
    } else {
      if(!_.isUndefined(search.id)) {
        scheme.profiles = data.profiles;
        scheme.groups = data.groups;
        scheme.wall = data.wall;

        var id = parseInt(search.id, 10);
        scheme.items = _.filter(data.items, function(item) {return item? Math.abs(item.owner_id) === id : false;});
        scheme.profiles = _.filter(data.profiles, function(item) {return item? item.id === id : false;});
        scheme.groups = _.filter(data.groups, function(item) {return item? item.id === id : false;});
        scheme.wall = _.filter(data.wall, function(item) {return item? item.id === id : false;});
      }

      if(!_.isUndefined(search.source)) {
        var source = search.source;

        scheme.items = _.filter(data.items, function(item) {
          var result = item? item.post_source.platform === source : false;
          var i, el;

          if(item.copy_history) {
            i = item.copy_history.length - 1;
            el = item.copy_history[i];
            result = el.post_source.platform? el.post_source.platform === source : result;
          }

          if(!result) {
            result = item? item.post_source.type === source : false;
            if(item.copy_history) {
              i = item.copy_history.length - 1;
              el = item.copy_history[i];
              result = el.post_source.type? el.post_source.type === source : result;
            }
          }
          
          return result;
        });
      }

      if(!_.isUndefined(search.attachmentsHasType)) {
        var type = search.attachmentsHasType;

        if(type === 'geo') {
          scheme.items = _.filter(data.items, function(item) {
            if(item.copy_history) {
              var i = item.copy_history.length - 1;
              return item? item.copy_history[i].geo : false;
            } else {
              return item? item.geo : false;
            }
          });
        } else {
          scheme.items = _.filter(data.items, function(item) {
            if(item.copy_history) {
              var i = item.copy_history.length - 1;
              return item? _.findWhere(item.copy_history[i].attachments, {type: type}) : false;
            } else {
              return item? _.findWhere(item.attachments, {type: type}) : false;
            }
          });
        }
        
      }

      if(!_.isUndefined(search.keyWord)) {
        var keyWord = $.trim(search.keyWord);
        var hasCommand = keyWord.match(/ext:|doc:|note:|page:|audio:|video:|link:|poll:|geo:/);
        var command = '';
        hasCommand = hasCommand? hasCommand.index === 0: false;

        if(hasCommand) {
          command = $.trim(keyWord.split(':')[0]);
          keyWord = $.trim(keyWord.split(':')[1]);

          if(command === 'ext') {
            scheme.items = _.filter(data.items, function(item) {
              if(item) {
                var attachments = item.attachments;
                var filter = new RegExp(keyWord, 'i');

                if(item.copy_history) {
                  attachments = item.copy_history[item.copy_history.length - 1].attachments;
                }

                _.each(attachments, function(attachment){
                  if(attachment.type === 'doc') {
                    attachment.doc.ext = attachment.doc.ext.replace(filter, highlight(attachment.doc.ext.match(filter)));
                  }
                });

                for (var key in attachments) {
                  var attachment = attachments[key];
                  if(attachment.type === 'doc') {
                    if(filter.test(attachment.doc.ext)) {
                      return item;
                    }
                  }
                }
              }
            });
          } else if(command === 'doc') {
            scheme.items = _.filter(data.items, function(item) {
              if(item) {
                var attachments = item.attachments;
                var filter = new RegExp(keyWord, 'i');

                if(item.copy_history) {
                  attachments = item.copy_history[item.copy_history.length - 1].attachments;
                }

                _.each(attachments, function(attachment){
                  if(attachment.type === 'doc') {
                    attachment.doc.title = attachment.doc.title.replace(filter, highlight(attachment.doc.title.match(filter)));
                  }
                });

                for (var key in attachments) {
                  var attachment = attachments[key];
                  if(attachment.type === 'doc') {
                    if(filter.test(attachment.doc.title)) {
                      return item;
                    }
                  }
                }
              }
            });
          } else if(command === 'link') {
            scheme.items = _.filter(data.items, function(item) {
              if(item) {
                var attachments = item.attachments;
                var filter = new RegExp(keyWord, 'i');

                if(item.copy_history) {
                  attachments = item.copy_history[item.copy_history.length - 1].attachments;
                }

                for (var key in attachments) {
                  var attachment = attachments[key];
                  if(attachment.type === 'link') {
                    if(filter.test(attachment.link.title)) {
                      return item;
                    }
                  }
                }
              }
            });
          } else if(command === 'video') {
            scheme.items = _.filter(data.items, function(item) {
              if(item) {
                var attachments = item.attachments;
                var filter = new RegExp(keyWord, 'i');

                if(item.copy_history) {
                  attachments = item.copy_history[item.copy_history.length - 1].attachments;
                }

                _.each(attachments, function(attachment){
                  if(attachment.type === 'video') {
                    attachment.video.title = attachment.video.title.replace(filter, highlight(attachment.video.title.match(filter)));
                  }
                });

                for (var key in attachments) {
                  var attachment = attachments[key];
                  if(attachment.type === 'video') {
                    if(filter.test(attachment.video.title)) {
                      return item;
                    }
                  }
                }
              }
            });
          } else if(command === 'audio') {
            scheme.items = _.filter(data.items, function(item) {
              if(item) {
                var attachments = item.attachments;
                var filter = new RegExp(keyWord, 'i');

                if(item.copy_history) {
                  attachments = item.copy_history[item.copy_history.length - 1].attachments;
                }

                _.each(attachments, function(attachment){
                  if(attachment.type === 'audio') {
                    attachment.audio.title = attachment.audio.title.replace(filter, highlight(attachment.audio.title.match(filter)));
                    attachment.audio.artist = attachment.audio.artist.replace(filter, highlight(attachment.audio.artist.match(filter)));
                  }
                });

                for (var key in attachments) {
                  var attachment = attachments[key];
                  if(attachment.type === 'audio') {
                    if(filter.test(attachment.audio.title)) {
                      return item;
                    }
                    if(filter.test(attachment.audio.artist)) {
                      return item;
                    }
                  }
                }
              }
            });
          } else if(command === 'poll') {
            scheme.items = _.filter(data.items, function(item) {
              if(item) {
                var attachments = item.attachments;
                var filter = new RegExp(keyWord, 'i');

                if(item.copy_history) {
                  attachments = item.copy_history[item.copy_history.length - 1].attachments;
                }

                _.each(attachments, function(attachment){
                  if(attachment.type === 'poll') {
                    attachment.poll.question = attachment.poll.question.replace(filter, highlight(attachment.poll.question.match(filter)));
                    _.each(attachment.poll.answers, function(answer, key, list) {
                        attachment.poll.answers[key].text = answer.text.replace(filter, highlight(answer.text.match(filter)));
                    });
                  }
                });

                for (var key in attachments) {
                  var attachment = attachments[key];
                  if(attachment.type === 'poll') {
                    if(filter.test(attachment.poll.question)) {
                      return item;
                    }
                    console.log(attachment.poll.answers);
                    for (var key2 in attachment.poll.answers) {
                      if(filter.test(attachment.poll.answers[key2].text)) {
                        return item;
                      }
                    }
                  }
                }
              }
            });
          } else if(command === 'note') {
            scheme.items = _.filter(data.items, function(item) {
              if(item) {
                var attachments = item.attachments;
                var filter = new RegExp(keyWord, 'i');

                if(item.copy_history) {
                  attachments = item.copy_history[item.copy_history.length - 1].attachments;
                }

                _.each(attachments, function(attachment){
                  if(attachment.type === 'note') {
                    attachment.note.title = attachment.note.title.replace(filter, highlight(attachment.note.title.match(filter)));
                  }
                });

                for (var key in attachments) {
                  var attachment = attachments[key];
                  if(attachment.type === 'note') {
                    if(filter.test(attachment.note.title)) {
                      return item;
                    }
                  }
                }
              }
            });
          } else if(command === 'page') {
            scheme.items = _.filter(data.items, function(item) {
              if(item) {
                var attachments = item.attachments;
                var filter = new RegExp(keyWord, 'i');

                if(item.copy_history) {
                  attachments = item.copy_history[item.copy_history.length - 1].attachments;
                }

                _.each(attachments, function(attachment){
                  if(attachment.type === 'page') {
                    attachment.page.title = attachment.page.title.replace(filter, highlight(attachment.page.title.match(filter)));
                  }
                });

                for (var key in attachments) {
                  var attachment = attachments[key];
                  if(attachment.type === 'page') {
                    if(filter.test(attachment.page.title)) {
                      return item;
                    }
                  }
                }
              }
            });
          }


        } else {
          scheme.items = _.filter(data.items, function(item) {
            if(item) {
              var attachments = item.attachments;
              var text = item.text;
              var fromInfo = getOwnerInfo(item.from_id);
              var fromName = fromInfo.name?fromInfo.name:fromInfo.first_name+' '+fromInfo.last_name;
              var filter = new RegExp(keyWord, 'i');
              var attachment, key, i;
              item.text = item.text.replace(filter, highlight(item.text.match(filter)));

              if(item.copy_history) {
                i = item.copy_history.length - 1;
                attachments = item.copy_history[i].attachments;
                item.copy_history[i].text = item.copy_history[i].text.replace(filter, highlight(item.copy_history[i].text.match(filter)));
              }

              if(attachments) {
                for (key in attachments) {
                  attachment = attachments[key];

                  if(attachment.type === 'audio') {
                    attachment.audio.title = attachment.audio.title.replace(filter, highlight(attachment.audio.title.match(filter)));
                    attachment.audio.artist = attachment.audio.artist.replace(filter, highlight(attachment.audio.artist.match(filter)));
                  }
                  if(attachment.type === 'video') {
                    attachment.video.title = attachment.video.title.replace(filter, highlight(attachment.video.title.match(filter)));
                  }
                  if(attachment.type === 'doc') {
                    attachment.doc.title = attachment.doc.title.replace(filter, highlight(attachment.doc.title.match(filter)));
                    attachment.doc.ext = attachment.doc.ext.replace(filter, highlight(attachment.doc.ext.match(filter)));
                  }
                  if(attachment.type === 'note') {
                    attachment.note.title = attachment.note.title.replace(filter, highlight(attachment.note.title.match(filter)));
                  }
                  if(attachment.type === 'page') {
                    attachment.page.title = attachment.page.title.replace(filter, highlight(attachment.page.title.match(filter)));
                  }
                  if(attachment.type === 'poll') {
                    attachment.poll.question = attachment.poll.question.replace(filter, highlight(attachment.poll.question.match(filter)));
                    _.each(attachment.poll.answers, function(answer, key, list) {
                      attachment.poll.answers[key] = answer.text.replace(filter, highlight(answer.text.match(filter)));
                    });
                  }
                }
              }

              if(filter.test(text)) {
                return item;
              }

              if(filter.test(fromName)) {
                //return item;
              }

              if(item.copy_history) {
                i = item.copy_history.length - 1;
                if(filter.test(item.copy_history[i].text)) {
                  return item;
                }
              }

              if(attachments) {
                for (key in attachments) {
                  attachment = attachments[key];

                  if(attachment.type === 'audio') {
                    if(filter.test(attachment.audio.title)) {return item;}
                    if(filter.test(attachment.audio.artist)) {return item;}
                  }
                  if(attachment.type === 'link') {
                    if(filter.test(attachment.link.title)) {return item;}
                  }
                  if(attachment.type === 'video') {
                    if(filter.test(attachment.video.title)) {return item;}
                  }
                  if(attachment.type === 'doc') {
                    if(filter.test(attachment.doc.title)) {return item;}
                    if(filter.test(attachment.doc.ext)) {return item;}
                  }
                  if(attachment.type === 'note') {
                    if(filter.test(attachment.note.title)) {return item;}
                  }
                  if(attachment.type === 'page') {
                    if(filter.test(attachment.page.title)) {return item;}
                  }
                  if(attachment.type === 'poll') {
                    if(filter.test(attachment.poll.question)) {return item;}
                    for (var key2 in attachment.poll.answers) {
                      if(filter.test(attachment.poll.answers[key2].text)) {return item;}
                    }
                  }
                }
              }

              return false;
            }

            return false;
          });
        }
      }

      if(!_.isUndefined(search.date)) {
        var _fromStamp = new Date(search.date.from).getTime()/1000;
        var _toStamp = new Date(search.date.to).getTime()/1000;
        var _from, _to;
        
        if(_toStamp < _fromStamp) {
          _from = _fromStamp;
          _to = _toStamp;
        } else {
          _from = _toStamp;
          _to = _fromStamp;
        }

        scheme.items = _.filter(data.items, function(item) {
          if(item) {
            if(_from > item.date && _to < item.date) {
              return item;
            }

            return false;
          }

          return false;
        });
      }

      callback(scheme);
    }
  };

  db.getPhotos = function() {
    var data = $.extend(true, {}, VKFC.photos);
    var search = arguments[0];
    var callback = arguments[arguments.length - 1];
    var scheme = {
      items: [],
    };

    if(_.isFunction(search)) {
      callback(data);
    } else {
      scheme.items = data.items;

      callback(scheme);
    }
  };

  db.getVideos = function() {
    var data = $.extend(true, {}, VKFC.videos);
    var search = arguments[0];
    var callback = arguments[arguments.length - 1];
    var scheme = {
      items: [],
    };

    if(_.isFunction(search)) {
      callback(data);
    } else {
      scheme.items = data.items;

      callback(scheme);
    }
  };

  db.getStock = function(callback) {
    var data = VKFC.data;
    var scheme = {
      groups: {},
      profiles: {}
    };

    _.each(data.groups, function(item, key, list) {
      var id = item.id;

      if(_.isUndefined(scheme.groups[id])) {
        var counts = _.filter(data.items, function(item) {return item? Math.abs(item.owner_id) === id : false;}).length;

        if(counts > 0) {
          scheme.groups[id] = item;
          scheme.groups[id].count = counts;
        }
      }
    });

    _.each(data.profiles, function(item, key, list) {
      var id = item.id;

      if(_.isUndefined(scheme.profiles[id])) {
        var counts = _.filter(data.items, function(item) {return item? Math.abs(item.owner_id) === id : false;}).length;

        if(counts > 0) {
          scheme.profiles[id] = item;
          scheme.profiles[id].count = counts;
        }
      }
    });

    var groups = _.pairs(scheme.groups);
    var profiles = _.pairs(scheme.profiles);

    groups = _.sortBy(groups, function(item){ return -item[1].count; });
    profiles = _.sortBy(profiles, function(item){ return -item[1].count; });

    scheme.groups = groups;
    scheme.profiles = profiles;

    callback(scheme);
  };

  db.setPosts = function(callback) {
    var _offset = 0;
    var _count = 0;
    _setPosts(_offset);

    function _setPosts(offset) {
      var pr = Math.round(offset/_count * 100) || 0;
      pr = pr > 100? 100: pr;

      if(offset > _count) {
        offset = _count;
      }

      $('.sub-title__loader .loader-posts span').text(pr);
      
      if(offset % _count > 3 || _count === 0) {
        setTimeout(function() {
          vkapi.api('fave.getPosts', {
            'offset'  : offset,
            'count'   : 100,
            'extended': 1
          }, function(data) {
            var response = data.response;
            var count = response.count;
            var items = response.items;
            _count = count;
            var pr = Math.round((offset+100)/_count * 100) || 0;
            pr = pr > 100? 100: pr;

            var res = ipc.sendSync('setData', JSON.stringify(response), pr);
            _offset += 100;
            _setPosts(_offset);
          });
        }, 200);
      }
    }
  };

  VKFC.places = {};
  VKFC.places.countries = [];
  db.setPlaces = function() {
    vkapi.api('database.getCountries', {
      'need_all': 1,
      'count'   : 1000,
    }, function(data) {
      var response = data.items;
      VKFC.places.countries = response;
    });
  };

  db.setPhotos = function(callback) {
    var _offset = 0;
    var _count = 0;
    _setPhotos(_offset);

    function _setPhotos(offset) {
      var pr = Math.round(offset/_count * 100) || 0;
      pr = pr > 100? 100: pr;

      if(offset > _count) {
        offset = _count;
      }

      $('.sub-title__loader .loader-photos span').text(pr);
      
      if(offset <= _count || _count === 0) {
        vkapi.api('fave.getPhotos', {
          'offset'  : offset,
          'count'   : 500,
        }, function(data) {
          var response = data.response;
          if(_.isEmpty(response.items)) {
            res = ipc.sendSync('setPhotos', JSON.stringify(response), 100);
            return false;
          }
          var count = response.count;
          var items = response.items;
          _count = count;
          var pr = Math.round((offset+500)/_count * 100) || 0;
          pr = pr > 100? 100: pr;

          var res = ipc.sendSync('setPhotos', JSON.stringify(response), pr);
          _offset += 500;
          _setPhotos(_offset);
        });
      }
    }
  };

  db.setVideos = function(callback) {
    var _offset = 0;
    var _count = 0;
    _setVideos(_offset);

    function _setVideos(offset) {
      var pr = Math.round(offset/_count * 100) || 0;
      pr = pr > 100? 100: pr;

      if(offset > _count) {
        offset = _count;
      }

      $('.sub-title__loader .loader-videos span').text(pr);
      
      if(offset < _count || _count === 0) {
        vkapi.api('fave.getVideos', {
          'offset'  : offset,
          'count'   : 300,
          'extended': 1
        }, function(data) {
          var response = data.response;
          if(_.isEmpty(response.items)) {
            res = ipc.sendSync('setVideos', JSON.stringify(response), 100);
            return false;
          }
          var count = response.count;
          var items = response.items;
          _count = count;
          var pr = Math.round((offset+300)/_count * 100) || 0;
          pr = pr > 100? 100: pr;

          var res = ipc.sendSync('setVideos', JSON.stringify(response), pr);
          _offset += 300;
          _setVideos(_offset);
        });
      }
    }
  };

})(jQuery);