if (Meteor.isClient) {

  directories = new Meteor.Collection('userNames');
  Meteor.subscribe('names');

  Template.body.helpers({
    tasks: function () {
      return directories.find({});
    }
  });

  Template.hello.events({
    'click button': function () {
      Meteor.call('putWord', document.getElementById("todoname").value);
    }
  });
}

if (Meteor.isServer) {
    Meteor.methods({
        putWord: function(word){
            _MYARRAY.Add(word);
        }
    });

  Meteor.publish("names", function () {
    var self = this;
    var cursor =  _MYARRAY.GetCursor();

    var handle = cursor.observeChanges({
      added: function (id, fields) {
        console.log("added",id,fields);
        self.added('userNames', id, fields);
      },
      changed: function (id, fields) {
        self.changed('userNames', id, fields);
      },
      removed: function (id) {
        self.removed('userNames', id);
      }
    });

    cursor.fetch().forEach(function(item){
      self.added("userNames",item.id,item);
    });

    self.ready();

    self.onStop(function () {
      handle.stop();
    });

  });

  Meteor.startup(function () {

    _MYARRAY=(function(){

      var _data = [];
      var _observeCallbacks = [];

      var _getCursor = function(){

        return {
          forEach:function(callback, arg){
            return _data.forEach(callback);
          },
          map:function(callback, arg){
            return _data.map(callback);
          },
          fetch:function(){
            return _data;
          },
          count:function(){
            return _data.length;
          },
          observe:function(callbacks){
            _observeCallbacks.push(callbacks);

            return{stop:function(){
              var index = _observeCallbacks.indexOf(callbacks);
              _observeCallbacks.splice(index,1);
            }};
          },
          observeChanges:function(callbacks){
            _observeCallbacks.push(callbacks);

            return{stop:function(){
              var index = _observeCallbacks.indexOf(callbacks);
              _observeCallbacks.splice(index,1);
            }};
          },
        };
      };

      var _add = function(data){
        var id = _data.length;
        var item = {name:data,id:id};
        _data.push(item);

        _observeCallbacks.forEach(function(callback){
          callback.added(id, item);
        });
      };

      return {GetCursor:_getCursor, Add:_add};

    }());

  });
}
