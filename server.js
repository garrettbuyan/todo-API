var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function(req, res){
    res.send('Todo API Root');
});
//GET /todos
app.get('/todos',function(req, res){
    var queryParams = req.query;
    var filteredTodos = todos;

    if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true'){
        filteredTodos = _.where(filteredTodos,{completed: true});
    }else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false'){
        filteredTodos = _.where(filteredTodos,{completed: false});
    }

    if(queryParams.hasOwnProperty('q') && queryParams.q.length > 0){
        filteredTodos = _.filter(filteredTodos,function(todo){
            return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;

        });
    }
    // if has property && completed === true
    // filteredTodos = _.where(filteredTodos,?);
    // else if has prop && completed if 'false'

    res.json(filteredTodos);
});
// GET /todos/id
app.get('/todos/:id',function(req, res){
    var todoId = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos,{id: todoId});

    if (matchedTodo){
        res.json(matchedTodo);
    }else{
        res.status(404).send();
    }
    // res.stats(404).send();

    // res.send('asking for todo with id of ' + req.params.id);
});

// POST request /todos
app.post('/todos',function(req, res){
    var body = _.pick(req.body,'description','completed');


    db.todo.create(body).then(function(todo){
        res.json(todo.toJSON());
    },function(e){
        res.status(400).json(e);
    });



    // call create on db.todo
    //  respond with 200 and todo
    //  e res.status(400).Json(e)


    // if(!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0){
    //     return res.status(400).send();
    // }
    //
    // body.description = body.description.trim();
    // body.id = todoNextId++;
    //
    // todos.push(body);
    //
    // console.log('description: ' + body.description);
    //
    // res.json(body);
});


// DELETE /todos/:id
app.delete('/todos/:id',function(req, res){
    var todoId = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos, {id: todoId});

    if(!matchedTodo){
        res.status(404).json({"error" : "no id found"});
    }else{
        todos = _.without(todos, matchedTodo);
        res.json(matchedTodo);
    }

});


app.put('/todos:id',function(req, res){
    var body = _.pick(req.body,'description','completed');
    var validAttributes = {};
    var todoId = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos, {id: todoId});

    if(!matchedTodo){
        return res.status(404).send();
    }



    if(body.hasOwnProperty('completed') && _.isBoolean(body.completed)){
        validAttributes.completed = body.completed;

    } else if (body.hasOwnProperty('completed')){
        //bad
        return res.status(400).send();
    }else{
        // never provided attribute, no problem
    }

    if(body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0){
        validAttributes.description = body.description;
    } else if (body.hasOwnProperty('description')){
        return res.status(400).send();
    }else{
    }

    _.extend(matchedTodo, validAttributes);
    res.json(matchedTodo);
});

db.sequelize.sync().then(function(){
    app.listen(PORT, function(){
        console.log('Express listing on port ' + PORT + '!');
    });

});

// app.listen(PORT,function(){
//     console.log('Express listening on port: '+ PORT);
// });
