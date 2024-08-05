var models = require('../model/model.js');
var path = require('path');
var bodyParser = require('body-parser');

module.exports = function (app, io) {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));

    app.get('/', function (req, res) {
        res.sendFile(path.resolve(__dirname + "/../views/index.html"));
    });

    app.post('/register', async function (req, res) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader("Access-Control-Allow-Method", "'GET, POST, OPTIONS, PUT, PATCH, DELETE'");
        var user = {
            "name": req.body.name,
            "handle": req.body.handle,
            "password": req.body.password,
            "phone": req.body.phone,
            "email": req.body.email,
        };
        console.log(user);

        try {
            let doc = await models.user.findOne({ "handle": req.body.handle });
            if (doc == null) {
                await models.user.create(user);
                res.send("success");
            } else {
                res.send("User already found");
            }
        } catch (err) {
            res.json(err);
        }
    });

    var handle = null;
    var private = null;
    var users = {};
    var keys = {};

    app.post('/login', async function (req, res) {
        console.log(req.body.handle);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader("Access-Control-Allow-Method", "'GET, POST, OPTIONS, PUT, PATCH, DELETE'");
        handle = req.body.handle;
        try {
            let doc = await models.user.findOne({ "handle": req.body.handle, "password": req.body.password });
            if (doc == null) {
                res.send("User has not registered");
            } else {
                console.log("Asas" + __dirname);
                res.send("success");
            }
        } catch (err) {
            res.send(err);
        }
    });

    io.on('connection', async function (socket) {
        console.log("Connection :User is connected  " + handle);
        console.log("Connection : " + socket.id);
        io.to(socket.id).emit('handle', handle);
        users[handle] = socket.id;
        keys[socket.id] = handle;
        console.log("Users list : " + users);
        console.log("keys list : " + keys);

        try {
            let doc = await models.user.find({ "handle": handle }, { friends: 1, _id: 0 });
            friends = [];
            pending = [];
            all_friends = [];
            console.log("friends list: " + doc);
            list = doc[0].friends.slice();
            console.log(list);

            for (var i in list) {
                if (list[i].status == "Friend") {
                    friends.push(list[i].name);
                }
                else if (list[i].status == "Pending") {
                    pending.push(list[i].name);
                }
                else {
                    continue;
                }
            }
            console.log("pending list: " + pending);
            console.log("friends list: " + friends);
            io.to(socket.id).emit('friend_list', friends);
            io.to(socket.id).emit('pending_list', pending);
            io.emit('users', users);
        } catch (err) {
            res.json(err);
        }

        socket.on('group message', function (msg) {
            console.log(msg);
            io.emit('group', msg);
        });

        socket.on('private message', async function (msg) {
            console.log('message  :' + msg.split("#*@")[0]);
            await models.messages.create({
                "message": msg.split("#*@")[1],
                "sender": msg.split("#*@")[2],
                "reciever": msg.split("#*@")[0],
                "date": new Date()
            });
            io.to(users[msg.split("#*@")[0]]).emit('private message', msg);
        });

        socket.on('disconnect', function () {
            delete users[keys[socket.id]];
            delete keys[socket.id];
            io.emit('users', users);
            console.log(users);
        });
    });

    app.post('/friend_request', async function (req, res) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader("Access-Control-Allow-Method", "'GET, POST, OPTIONS, PUT, PATCH, DELETE'");
        try {
            let doc = await models.user.find({ "handle": req.body.my_handle, "friends.name": req.body.friend_handle });
            if (doc.length != 0) {
                console.log("Friend request : " + doc.length);
                console.log("Friend request : friend request already sent " + doc);
                res.send("Friend request already sent ");
            } else {
                console.log("Friend request : " + doc.length);
                await models.user.updateOne({
                    handle: req.body.my_handle
                }, {
                    $push: {
                        friends: {
                            name: req.body.friend_handle,
                            status: "Pending"
                        }
                    }
                }, {
                    upsert: true
                });
                io.to(users[req.body.friend_handle]).emit('message', req.body);
            }
        } catch (err) {
            res.json(err);
        }
    });

    app.post('/friend_request/confirmed', async function (req, res) {
        console.log("friend request confirmed : " + req.body);
        if (req.body.confirm == "Yes") {
            try {
                let doc = await models.user.find({
                    "handle": req.body.friend_handle,
                    "friends.name": req.body.my_handle
                });
                if (doc.length != 0) {
                    console.log("Friend request confirmed : " + doc.length);
                    console.log("Friend request confirmed : friend request already sent " + doc);
                    res.send("Friend request already accepted");
                } else {
                    await models.user.updateOne({
                        "handle": req.body.my_handle,
                        "friends.name": req.body.friend_handle
                    }, {
                        '$set': {
                            "friends.$.status": "Friend"
                        }
                    });
                    console.log("friend request confirmed : Inside yes confirmed");
                    io.to(users[req.body.friend_handle]).emit('friend', req.body.my_handle);
                    io.to(users[req.body.my_handle]).emit('friend', req.body.friend_handle);
                    await models.user.updateOne({
                        handle: req.body.friend_handle
                    }, {
                        $push: {
                            friends: {
                                name: req.body.my_handle,
                                status: "Friend"
                            }
                        }
                    }, { upsert: true });
                }
            } catch (err) {
                res.json(err);
            }
        } else {
            console.log("friend request confirmed : Inside No confirmed");
            try {
                await models.user.updateOne({
                    "handle": req.body.my_handle
                }, {
                    '$pull': {
                        'friends': {
                            "name": req.body.friend_handle,
                        }
                    }
                });
                console.log("No");
            } catch (err) {
                res.json(err);
            }
        }
    });
}