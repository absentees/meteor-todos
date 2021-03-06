Todos = new Meteor.Collection('todos');
Lists = new Meteor.Collection('lists');

Router.configure({
  layoutTemplate: 'main',
  loadingTemplate: 'loading'
});
Router.route('/register');
Router.route('/login');
Router.route('/', {
  name: 'home',
  template: 'home'
});
Router.route('/list/:_id', {
  name: 'listPage',
  template: 'listPage',
  data: function() {
    var currentList = this.params._id;
    var currentUser = Meteor.userId();
    return Lists.findOne({
      _id: currentList,
      createdBy: currentUser
    });
  },
  onRun: function() {
    console.log("you triggerd on Run");
    this.next();
  },
  onRerun: function() {
    console.log("you triggerd on rerun");
  },
  onBeforeAction: function() {
    var currentUser = Meteor.userId();
    if (currentUser) {
      this.next();
    } else {
      this.render("login");
    }
  },
  onAfterAction: function() {
    console.log("you triggered onafteraction")
  },
  onStop: function() {
    console.log("you triggered on stop");
  },
  waitOn: function(){
    var currentList = this.params._id;
    return [ Meteor.subscribe('lists'), Meteor.subscribe('todos', currentList)];  }
});

if (Meteor.isClient) {

  Template.todos.helpers({
    'todo': function() {
      var currentList = this._id;
      var currentUser = Meteor.userId();
      return Todos.find({
        listId: currentList,
        createdBy: currentUser
      }, {
        sort: {
          createdAt: -1
        }
      });
    }
  });
  Template.addTodo.events({
    'submit form': function(event) {
      event.preventDefault();
      var todoName = $('[name="todoName"]').val();
      var currentUser = Meteor.userId();
      var currentList = this._id;
      Todos.insert({
        name: todoName,
        completed: false,
        createdAt: new Date(),
        createdBy: currentUser,
        listId: currentList
      });
      $('[name="todoName"]').val('');
    }
  });
  Template.todoItem.helpers({
    'checked': function() {
      var isCompleted = this.completed;
      if (isCompleted) {
        return "checked";
      } else {
        return "";
      }
    }
  });
  Template.todoItem.events({
    'click .delete-todo': function() {
      event.preventDefault();
      var documentId = this._id;
      var confirm = window.confirm("Really bloody delete it?");
      if (confirm) {
        Todos.remove({
          _id: documentId
        });
      }
    },
    'keyup [name=todoItem]': function(event) {
      if (event.which == 13 || event.which == 27) {
        $(event.target).blur();
      } else {
        var documentId = this._id;
        var todoItem = $(event.target).val();
        Todos.update({
          _id: documentId
        }, {
          $set: {
            name: todoItem
          }
        });
      }
    },
    'change [type=checkbox]': function() {
      var documentId = this._id;
      var isCompleted = this.completed;
      if (isCompleted) {
        Todos.update({
          _id: documentId
        }, {
          $set: {
            completed: false
          }
        });
        console.log("task marked as incomplete");
      } else {
        Todos.update({
          _id: documentId
        }, {
          $set: {
            completed: true
          }
        });
        console.log("task marked as complete");
      }
    }
  });
  Template.todosCount.helpers({
    'totalTodos': function() {
      var currentList = this._id;
      return Todos.find({
        listId: currentList
      }).count();
    },
    'completedTodos': function() {
      var currentList = this._id;
      return Todos.find({
        listId: currentList,
        completed: true
      }).count();
    }
  });

  Template.addList.events({
    'submit form': function(event) {
      event.preventDefault();
      var listName = $('[name=listName]').val();
      var currentUser = Meteor.userId();
      Lists.insert({
        name: listName,
        createdBy: currentUser
      }, function(error, results) {
        Router.go('listPage', {
          _id: results
        });
      });
      $('[name=listName]').val('');
    }
  });

  Template.lists.helpers({
    'list': function() {
      var currentUser = Meteor.userId();
      return Lists.find({
        createdBy: currentUser
      }, {
        sort: {
          name: 1
        }
      });
    }
  });

  Template.lists.helpers({
    'list': function() {
      return Lists.find({}, {
        sort: {
          name: 1
        }
      })
    }
  });

  Template.register.events({
    'submit form': function(event) {
      event.preventDefault();
      /*

      */
    }
  });

  Template.register.onRendered(function() {
    var validator = $('.register').validate({
      submitHandler: function(event) {
        var email = $('[name=email]').val();
        var password = $('[name=password]').val();
        Accounts.createUser({
          email: email,
          password: password
        }, function(error) {
          if (error) {
            if (error.reason == "Email already exists.") {
              validator.showErrors({
                email: "That email already belongs to a registered"
              })
            }
          } else {
            Router.go("home");
          }
        });
      }
    });
  });

  Template.login.events({
    'submit form': function(event) {
      event.preventDefault();
      /*

      */
    }
  });

  Template.navigation.events({
    'click .logout': function(event) {
      event.preventDefault();
      Meteor.logout();
      Router.go('login');
    }
  });

  Template.login.onCreated(function() {
    console.log("The login was just created");
  });

  Template.login.onRendered(function() {
    var validator = $('.login').validate({
      submitHandler: function(event) {
        var email = $('[name=email]').val();
        var password = $('[name=password]').val();
        Meteor.loginWithPassword(email, password, function(err) {
          if (err) {
            if (err.reason == "User not found") {
              validator.showErrors({
                email: "That email doesn't belong to a registered user."
              })
            }
            if (err.reason == "Incorrect password") {
              validator.showErrors({
                password: "You entered an incorrect password."
              });
            }
          } else {
            var currentRoute = Router.current().route.getName();
            if (currentRoute == "login") {
              Router.go("home");
            }
          }
        });
      }
    });
  });

  Template.login.onDestroyed(function() {
    console.log("the login template was just destroyed");
  });

  $.validator.setDefaults({
    rules: {
      email: {
        required: true,
        email: true
      },
      password: {
        required: true,
        minlength: 6
      }
    },
    messages: {
      email: {
        required: "You must enter an email address.",
        email: "You've entered an invalid email address."
      },
      password: {
        required: "You must enter a password.",
        minlength: "Your password must be at least {0} characters."
      }
    }
  });

  Template.lists.onCreated(function(){
    this.subscribe('lists');
  })
}

if (Meteor.isServer) {
  Meteor.publish('lists', function(currentList){
    var currentUser = this.userId;
    return Lists.find({ createdBy: currentUser, listId: currentList });
  });
}
