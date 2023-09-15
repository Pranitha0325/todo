const express = require("express")
const app = express()
app.use(express.json())
const path = require("path")
const {open} = require("sqlite")
const sqlite3 = require("sqlite3")
const format = require("date-fns/format")
const isMatch = require("date-fns/isMatch")
const isValid = require("date-fns/isValid")



const dbPath = path.join(__dirname, "todoApplication.db");

let database = null
const initializeDBAndServer = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const hasPriorityAndStatusProterties = (requestQuery) => {
    return (
        requestQuery.priority!==undefined && requestQuery.status!==undefined
    )
}

const hasPriorityProperty = (requestQuery) =>{
    return (
       requestQuery.priority!==undefined
    )
}

const hasStatusProperty = (requestQuery) =>{
    return (
       requestQuery.status!==undefined
    )
}
const hasCategoryAndStatus = (requestQuery) =>{
    return (
       requestQuery.category!==undefined && requestQuery.status!==undefined
    )
}
const hasCategoryAndPriority = (requestQuery) =>{
    return (
       requestQuery.category!==undefined && requestQuery.priority!==undefined
    )
}
const hasSearchProperty = (requestQuery) =>{
    return (
       requestQuery.search_q!==undefined 
    )
}

const hasCategoryProperty = (requestQuery) =>{
    return (
       requestQuery.category!==undefined 
    )
}

const outPutResult = (dbObject) => {
    return {
        id:dbObject.id,
        todo:dbObject.todo,
        priority:dbObject.priority,
        category:dbObject.category,
        status:dbObject.status,
        dueDate:dbObject.due_date
    }
}

app.get("/todos/", async (request, response)=> {
  let data=null
  let getTodosQuery = ""
  const {search_q="", priority, status, category } = request.query;
  switch (true){
    case hasPriorityAndStatusProterties(request.query):
    if (priority==="HIGH" || priority==="MEDIUM" || priority==="LOW"){
      if (status==="TO Do" || status==="IN PROGRESS" || status==="DONE"){
        getTodosQuery = `
        SELECT * FROM todo WHERE status='${status}' AND priority = '${priority}';`;
        data = await database.all(getTodosQuery);
        response.send(data.map((item)=>outPutResult(item)))
      }else{
        response.status(400);
        response.send("Invalid Todo Status")
      }
    }else{
      response.status(400);
      response.send("Invalid Todo Priority")
    }
    break;
    case hasCategoryAndStatus(request.query):
    if (category==="WORK" || category==="HOME" || category==="LEARNING"){
      if (status==="TO Do" || status==="IN PROGRESS" || status==="DONE"){
        getTodosQuery = `
        SELECT * FROM todo WHERE status='${status}' AND category = '${category}';`;
        data = await database.all(getTodosQuery);
        response.send(data.map((item)=>outPutResult(item)))
      }else{
        response.status(400);
        response.send("Invalid Todo Status")
      }
    }else{
      response.status(400);
      response.send("Invalid Todo Category")
    }
    break;
    case hasCategoryAndPriority(request.query):
    if (category==="WORK" || category==="HOME" || category==="LEARNING"){
      if (priority==="HIGH" || priority==="MEDIUM" || priority==="LOW"){
        getTodosQuery = `
        SELECT * FROM todo WHERE priority='${priority}' AND category = '${category}';`;
        data = await database.all(getTodosQuery);
        response.send(data.map((item)=>outPutResult(item)))
      }else{
        response.status(400);
        response.send("Invalid Todo Priority")
      }
    }else{
      response.status(400);
      response.send("Invalid Todo Category")
    }
    break;
    case hasPriorityProperty(request.query):
    if (priority==="HIGH" || priority==="MEDIUM" || priority==="LOW"){
       getTodosQuery = `
        SELECT * FROM todo WHERE priority='${priority}';`;
        data = await database.all(getTodosQuery);
        response.send(data.map((item)=>outPutResult(item)))
      }else{
        response.status(400);
        response.send("Invalid Todo Priority")
    }
    break;
    case hasStatusProperty(request.query):
    if (status==="TO DO" || status==="INPROGRESS" || status==="DONE"){
       getTodosQuery = `
        SELECT * FROM todo WHERE status='${status}';`;
        data = await database.all(getTodosQuery);
        console.log(data)
        response.send(data.map((item)=>outPutResult(item)))
      }else{
        response.status(400);
        response.send("Invalid Todo Status")
    }
    break;
    case hasSearchProperty(request.query):    
       getTodosQuery = `
        SELECT * FROM todo WHERE todo LIKE '%${search_q}%;`;
        data = await database.all(getTodosQuery);
        response.send(data.map((item)=>outPutResult(item)))
    break;
    case hasCategoryProperty(request.query):
    if (category==="WORK" || category==="HOME" || category==="LEARNING"){
       getTodosQuery = `
        SELECT * FROM todo WHERE category='${category}';`;
        data = await database.all(getTodosQuery);
        response.send(data.map((item)=>outPutResult(item)))
      }else{
        response.status(400);
        response.send("Invalid Todo Category")
    }
    break;
    default:
     getTodosQuery = `
        SELECT * FROM todo;`;
        data = await database.all(getTodosQuery);
        response.send(data.map((item)=>outPutResult(item)))
  }
});

app.get ("/todos/:todoId/", async (request, response)=>{
  const {todoId} = request.params
  const getTodoQuery = `SELECT * FROM todo WHERE id=${todoId}`;
  const responseResult = await database.get(getTodoQuery);
  response.rend(outPutResult(responseResult))
});

app.get ("/agenda/", async (request, response)=>{
  const {todoId} = request.params
  if (isMatch(date, "yyyy-mm-dd")){
    const newDate = format(new Date(date), "yyyy-mm-dd")
    const requestQuery = `SELECT * FROM todo WHERE due_date=${newDate};`;
    const responseResult = await database.all(requestQuery);
    response.send(responseResult.map((item)=>outPutResult(item)))
  }else{
    response.status(400);
    response.send("Invalid Due Date")
  }
});

app.post("/todos/", async(request, response)=>{
  const {id, todo, priority, status, category, dueDate} = request.body 
  if (priority==="HIGH" || priority==="MEDIUM" || priority==="LOW"){
    if (status==="TO Do" || status==="IN PROGRESS" || status==="DONE"){
      if (category==="WORK" || category==="HOME" || category==="LEARNING"){
        if (isMatch(date, "yyyy-mm-dd")){
          const postNewDueDate = format(new Date(date), "yyyy-mm-dd")
          const postTodoQuery = `
          INSERT INTO 
          todo(id, category, status, priority, due_date, todo)
          VALUES ('${id}', '${category}', '${status}', '${priority}', '${postNewDueDate}', '${todo}')`;
          await database.run(postTodoQuery)
          response.send("Todo Successfully Added")
        }else{
          response.status(400)
          response.rend("Invalid Due Date")
        }
      }else{
        response.status(400)
        response.rend("Invalid Todo Category")
      }
    }else{
      response.status(400)
      response.rend("Invalid Todo Status")
    }
  }else{
    response.status(400)
    response.rend("Invalid Todo Priority")
  }
});

app.put("/todos/:todoId", async (request, response)=> {
  const {todoId} = request.perams
  let updatedColumn = ""
  const requestBody = request.body
  const previousTodoQuery = `SELECT * FROM todo WHERE id=${todoId};`;
  const previousTodo = await database.get(previousTodoQuery)
  const {
    todo=previousTodo.todo,
    priority=previousTodo.priority,
    status = previousTodo.status,
    category = previousTodo.category,
    dueDate = previousTodo.dueDate
  } = request.body

  let updatedTodoQuery;
  switch (true){
    case requestBody.status!==undefined:
    if (status==="TO DO" || status==="INPROGRESS" || status==="DONE"){
      updatedTodoQuery = `
      UPDATE todo set todo='${todo}', priority='${priority}', status='${status}', category='${category}', due_date='${dueDate}' WHERE id='${todoId}';`;
      await database.run(updatedTodoQuery);
      response.send("Status Updated")
    }else{
      response.status(400);
      response.send("Invalid Todo Status")
    }
    break;

    case requestBody.priority!==undefined:
    if (priority==="HIGH" || priority==="MEDIUM" || priority==="LOW"){
      updatedTodoQuery = `
      UPDATE todo set todo='${todo}', priority='${priority}', status='${status}', category='${category}', due_date='${dueDate}' WHERE id='${todoId}';`;
      await database.run(updatedTodoQuery);
      response.send("Priority Updated")
    }else{
      response.status(400);
      response.send("Invalid Todo Priority")
    }
    break;
    case requestBody.todo!==undefined:
      updatedTodoQuery = `
      UPDATE todo set todo='${todo}', priority='${priority}', status='${status}', category='${category}', due_date='${dueDate}' WHERE id='${todoId}';`;
      await database.run(updatedTodoQuery);
      response.send("Todo Updated")
    break;

    case requestBody.category!==undefined:
    if (category==="WORK" || category==="HOME" || category==="LEARNING"){
      updatedTodoQuery = `
      UPDATE todo set todo='${todo}', priority='${priority}', status='${status}', category='${category}', due_date='${dueDate}' WHERE id='${todoId}';`;
      await database.run(updatedTodoQuery);
      response.send("Category Updated")
    }else{
      response.status(400);
      response.send("Invalid Todo Category")
    }
    break;

    case requestBody.dueDate!==undefined:
    if (isMatch(dueDate, "yyyy-mm-dd")){
      const newDueDate = format(new Date(date), "yyyy-mm-dd")
      updatedTodoQuery = `
      UPDATE todo set todo='${todo}', priority='${priority}', status='${status}', category='${category}', due_date='${newDueDate}' WHERE id='${todoId}';`;
      await database.run(updatedTodoQuery);
      response.send("Due Date Updated")
    }else{
      response.status(400);
      response.send("Invalid Due Date")
    }
    break;
  }
});

app.delete("/todos/:todoId", async (request, response)=> {
  const {todoId} = request.perams
  const deleteTodoQuery = `SELECT * FROM todo WHERE id='${todoId}';`;
  await database.run(deleteTodoQuery)
  response.send("Todo Deleated")
});

module.exports = app;