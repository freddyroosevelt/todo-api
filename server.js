/*

#Todo REST API with input validation using Postman.
## Also has Search and Filtering capabilities for a Todo item.

### Objective of API:

####1. POST/GET/DELETE/UPDATE a new Todo item.
####2. Has input validation so only a description/completed input can be made
####3. Delete a Todo item by :id
####4. Filter a Todo Completed item with the GET /todos?completed=true or false input.
####5. Search by Todo Description with the (eg:) GET /todos?q=work
                                and/or with GET /todos?q=work&completed=false.

##### Getting Started: First run: npm install for node modules

*/

var express = require('express');
var bodyParser = require('body-parser');
var underScore = require('underscore');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;


app.use(bodyParser.json());

// GET /todos and/or GET/todos?completed=true and/or by GET/todos?q=work
app.get('/todos', function(req, res) {
    // Filter for a completed Todo item
    var queryParams = req.query;
    // Filtered Todos
    var filteredTodos = todos;

    // if has property && completed === 'true'
    if(queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
        filteredTodos = underScore.where(filteredTodos, {completed: true});
    }else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
        // if has property && completed === 'false'
        filteredTodos = underScore.where(filteredTodos, {completed: false});
    }

    // Search a Todo item by its description
    if(queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
        // If it exist and not a emtpy string
        filteredTodos = underScore.filter(filteredTodos, function(todo) {
            return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;
        });
    }

    // return the todo array
    // convert to json then return
    res.json(filteredTodos);

});

// GET /todos/:id
app.get('/todos/:id', function(req, res) {
    var todoId = parseInt(req.params.id, 10);
    var matchedTodo = underScore.findWhere(todos, {id: todoId});

    if(matchedTodo) {
        res.json(matchedTodo);
        console.log('Success: Found a todo with that id.');
    }else {
        res.status(404).send();
        console.log('Error: No todo with that id!');
    }
});


// add todos through the Api
// POST REQUEST /todos - api route
app.post('/todos', function(req, res) {
    // validate and use underScore.pick to only pick description and completed for todos input
    var body = underScore.pick(req.body, 'description', 'completed');

    // validate for incorrect and corret input todo data
    if(!underScore.isBoolean(body.completed) || !underScore.isString(body.description) || body.description.trim().length === 0) {
        // send (400) - Bad Request if incorrect data is input
        console.log('A Bad Request was made! Input was not stored.');
        return res.status(400).send();
    }

    // set body.description to be trimmed value - get rid of empty spaces
    body.description = body.description.trim();

    // add the id feild to a todo and then add 1++ to it
    body.id = todoNextId;
    todoNextId++;

    // push body into array of todos
    todos.push(body);

    console.log('description: ' + body.description);
    res.json(body);
});

// DELETE /todos/:id
// Delete a todo by its id
app.delete('/todos/:id', function(req,res) {
    var todoId = parseInt(req.params.id, 10);
    // find todo item
    var matchedTodo = underScore.findWhere(todos, {id: todoId});

    // if no todo item send back a 404
    if(!matchedTodo) {
        res.status(404).json({"Error: ": "No Todo found with that id!"});
        console.log('Error: No Todo found with that id to delete!');
    }else {
        // if it is a todo item to delete
        todos = underScore.without(todos, matchedTodo);
        // sends the success 200 status
        res.json(matchedTodo);
        console.log('Success: deleted the Todo item!');
    }
});

// PUT /todos/:id
// Update/Create a Todo item
app.put('/todos/:id', function(req, res) {
    var todoId = parseInt(req.params.id, 10);
    // find todo item
    var matchedTodo = underScore.findWhere(todos, {id: todoId});
    var body = underScore.pick(req.body, 'description', 'completed');
    // store the values of the todos in the todos array
    var validAttributes = {};

    // If matchedTodo doesnt exists, send back a 404
    if(!matchedTodo) {
        // matchedTodo is not found
        return res.status(404).send();
    }

    // check if 'completed' attribute exist and if so validate it
    if(body.hasOwnProperty('completed') && underScore.isBoolean(body.completed)) {
        validAttributes.completed = body.completed;
    }else if(body.hasOwnProperty('completed')) {
        // Not a Bool and attribute is not valid
        console.log('Todo item for completed is not valid. Could not create or update!');
        return res.status(400).send();
    }

    // check if 'description' attribute exist and if so validate it
    if(body.hasOwnProperty('description') && underScore.isString(body.description) && body.description.trim().length > 0) {
        validAttributes.description = body.description;
    }else if(body.hasOwnProperty('description')) {
        // If description attribute is not valid
        console.log('Todo item for description is not valid. Could not create or update!');
        return res.status(400).send();
    }

    // Succes! Things went right to update
    underScore.extend(matchedTodo, validAttributes);
    res.json(matchedTodo);
    console.log('Succes: Todo items has been updated!');

});



app.listen(PORT, function() {
    console.log('Server Running on http://localhost' + ':' + PORT);
});
