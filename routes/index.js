module.exports = function Route(app){
  var users = {};

  /* GET home page. */
  app.get('/', function(req, res) {
    res.render('index', { title: 'Ninja Chat' });
  });
  
  app.io.route("new_user", function(req){
    if( req.data.name.length < 2){
      req.io.emit('bad_user')
    }
    else{
      users[req.sessionID] = {name: req.data.name};
      console.log(users);
      req.io.emit("get_active_users", {users: users});
      req.io.broadcast("new_user_joined", {user: req.data.name, session: req.sessionID});
    }
  });

  app.io.route("chatSubmit", function(req){
    console.log(users[req.sessionID])
    if (users[req.sessionID] === undefined){
      req.io.emit("bad_user");        
    }
    else{
      app.io.broadcast("addChat", {name: users[req.sessionID].name, message: req.data.message })
    }
  });

  app.io.route("disconnect", function(req){
    for(user in users){
      if(user === req.sessionID){
        console.log(users[user].name + " disconnected.");
        delete users[user];
      }
    }
    app.io.broadcast("user_disconnected", {sessionid: req.sessionID} );
  });

}
