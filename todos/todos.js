Todos = new Meteor.Collection('todos');

if(Meteor.isClient){
    Template.todos.helpers({
      'todo': function(){
        return Todos.find({}, {sort: {createdAt: -1}});
      }
    });
    Template.addTodo.events({
      'submit form': function(event){
        event.preventDefault();
        var todoName = $('[name="todoName"]').val();
        Todos.insert({
          name: todoName,
          completed: false,
          createdAt: new Date()
        });
        $('[name="todoName"]').val('');
      }
    });
    Template.todoItem.events({
      'click .delete-todo': function(){
        event.preventDefault();
        var documentId = this._id;
        var confirm = window.confirm("Really bloody delete it?");
        if (confirm) {
          Todos.remove({ _id: documentId });
        }
      },
      'keyup [name=todoItem]': function(event){
        var documentId = this._id;
        var todoItem = $(event.target).val();
        Todos.update({ _id: documentId }, {$set: { name: todoItem }})
        console.log(event.which);
      }
    });
}

if(Meteor.isServer){
    // server code goes here
}
