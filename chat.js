// Generated by CoffeeScript 1.7.1
(function() {
  var admin_pass, admin_user, agents_ids_assoc_clients, app, auth, basicAuth, bodyParser, chat_add_agent, chat_add_client, chat_disconnect_client, chat_send_message_for_disc_to_client, crypto_hash, db, exists, express, file, fs, get_ids_fron_email_given, io, max_clients_by_agents, md5, now, os, router, server_ip_address, server_port, session, shuffle, sqlite3, sqlite_add_agent_user_chat, sqlite_chat_add_new_message, sqlite_chat_print_all, sqlite_validate_user_data, timestamp, total_agents;

  sqlite_add_agent_user_chat = function() {
    var db;
    console.log("ADD NEW AGENT USER");
    db = new sqlite3.Database(file);
    db.serialize(function() {
      var stmt;
      stmt = db.prepare("INSERT INTO olab_chat_users VALUES (?,?,?,?)");
      stmt.bind("ebc@g4all.mx", "Eduardo Beltran", md5("g4alalo2014"), timestamp("DD-MM-YYYY hh:mm:ss"));
      stmt.get(function(error, rows) {
        if (error) {
          console.log("ERROR - sqlite_add_agent_user_chat()");
          sqlite_chat_print_all("olab_chat_users");
        } else {
          console.log("RESULT NEW USER AGENT ADDED");
          sqlite_chat_print_all("olab_chat_users");
        }
      });
    });
    stmt.finalize();
    db.close();
  };
  awdaw

  sqlite_validate_user_data = function(req, res, user_email, user_pass, callback) {
    var db;
    console.log("########################### START VALIDATION ###########################");
    db = new sqlite3.Database(file);
    db.serialize(function() {
      var stmt;
      stmt = "SELECT * FROM cms_chatuser WHERE username = '" + user_email + "';";
      db.all(stmt, function(err, rows) {
        var unauthorized, user, user_name;
        unauthorized = function(res) {
          return res.render("page_agent_session", {
            server_ip_address: "http://" + server_ip_address + ":" + server_port
          });
        };
        if (err) {
          console.log("ERROR - sqlite_validate_user_data()");
        }
        if (rows.length === 0) {
          console.log("Error authenticating.");
          user_name = req.body.user_name;
          user_pass = req.body.user_pass;
          user = req.session.user;
          if (user_name === admin_user && user_pass === admin_pass) {
            req.session = {
              user: {
                user_name: user_name,
                user_pass: user_pass
              }
            };
            callback();
          } else if (!user || !user.user_name || !user.user_pass) {
            unauthorized(res);
          } else if (user.user_name === admin_user && user.user_pass === admin_pass) {
            req.session = {
              user: {
                user_name: user.user_name,
                user_pass: user.user_pass
              }
            };
            callback();
          } else {
            unauthorized(res);
          }
        } else if (crypto_hash.validatePassword(user_pass, rows[0].password)) {
          callback();
          console.log("Correct user");
        }
      });
    });
    db.close();
    console.log("########################### END VALIDATION ###########################");
  };

  sqlite_chat_print_all = function(table) {
    var db;
    db = new sqlite3.Database(file);
    db.serialize(function() {
      db.all("SELECT * FROM " + table + ";", function(err, rows) {
        if (err) {
          console.log("ERROR - sqlite_chat_print_all()");
        } else {
          console.log(rows);
        }
      });
    });
    db.close();
  };

  sqlite_chat_add_new_message = function(object_vals, callback) {
    var db;
    db = new sqlite3.Database(file);
    console.log("NEW MESSAGE TO SAVE");
    db.serialize(function() {
      var stmt;
      stmt = db.prepare("INSERT INTO olab_chat_history VALUES (?,?,?,?,?)");
      stmt.bind(object_vals.email_agent, object_vals.email_client, object_vals.email_from, object_vals.message, timestamp("DD-MM-YYYY hh:mm:ss"));
      stmt.get(function(error, rows) {
        if (error) {
          console.log("ERROR - sqlite_chat_add_new_message()");
        } else {
          console.log("RESULT INSERT NEW MESSAGE");
          sqlite_chat_print_all("olab_chat_history");
          callback({
            status: "ok"
          });
        }
      });
    });
    stmt.finalize();
    db.close();
  };

  chat_send_message_for_disc_to_client = function(this_client_id) {
    var agent_id, client_id, obj_client, who_is;
    obj_client = get_ids_fron_email_given("_", this_client_id);
    if (obj_client !== false && typeof obj_client !== "undefined") {
      agent_id = agents_ids_assoc_clients[obj_client.ak].agend_id;
      who_is = obj_client.client_or_agent;
      if (who_is === "client") {
        client_id = agents_ids_assoc_clients[obj_client.ak][obj_client.ok].client_id;
        agents_ids_assoc_clients[obj_client.ak][obj_client.ok].client_id = "";
        io.sockets.socket(this_client_id).emit("message", {
          message_disc: "SE HA PERDIDO LA CONEXION!",
          type: "right"
        });
      }
    }
  };

  chat_add_agent = function(id, data) {
    var exist_agent, i, k, object_clients;
    exist_agent = 0;
    for (k in agents_ids_assoc_clients) {
      if (typeof agents_ids_assoc_clients[k] !== "undefined") {
        if (agents_ids_assoc_clients[k].agent_email === data.email) {
          console.log("Este agente ya existe");
          io.sockets.socket(id).emit("message", {
            status: "Este correo ya esta en uso."
          });
          exist_agent = 1;
        }
      }
    }
    if (!exist_agent) {
      object_clients = {
        agend_id: id,
        agent_name: data.name,
        agent_email: data.email
      };
      i = 0;
      while (i < max_clients_by_agents) {
        object_clients["client_id_" + i] = {
          client_id: "",
          client_name: "",
          client_email: ""
        };
        i++;
      }
      agents_ids_assoc_clients[total_agents++] = object_clients;
      io.sockets.socket(id).emit("message", {
        assoc: "ok"
      });
    }
  };

  chat_add_client = function(id, data) {
    var agent_element, agent_id_assoc, agent_name_assoc, agents_ids_assoc_clients, assoc_client, e, i;
    console.log("#######chat_add_client#########");
    console.log(agents_ids_assoc_clients);
    console.log("#######chat_add_client#########");
    agents_ids_assoc_clients = shuffle(agents_ids_assoc_clients);
    chat_disconnect_client(data.email);
    agent_id_assoc = "";
    agent_name_assoc = "";
    if (total_agents > 0) {
      assoc_client = false;
      i = 0;
      while (i < total_agents) {
        agent_element = agents_ids_assoc_clients[i];
        if (typeof agent_element !== "undefined") {
          agent_id_assoc = agents_ids_assoc_clients[i].agend_id;
          agent_name_assoc = agents_ids_assoc_clients[i].agent_name;
          for (e in agent_element) {
            if (agent_element[e].client_id === "") {
              agent_element[e].client_id = id;
              agent_element[e].client_name = data.name;
              agent_element[e].client_email = data.email;
              assoc_client = true;
              break;
            }
          }
          if (assoc_client) {
            break;
          }
        }
        i++;
      }
      if (assoc_client) {
        io.sockets.socket(id).emit("message", {
          agent_assoc_id: agent_id_assoc,
          name: agent_name_assoc
        });
        io.sockets.socket(agent_id_assoc).emit("message", {
          client_assoc_id: id,
          name: data.name
        });
      } else {
        console.log("NO HAY AGENTES DISPONIBLES");
        io.sockets.socket(id).emit("message", {
          agent_assoc_id: "-",
          name: "-"
        });
      }
    } else {
      console.log("NO HAY AGENTES DISPONIBLES");
      io.sockets.socket(id).emit("message", {
        agent_assoc_id: "-",
        name: "-"
      });
    }
  };

  shuffle = function(arr) {
    var i, j, x;
    j = void 0;
    x = void 0;
    i = arr.length;
    while (i) {
      j = parseInt(Math.random() * i, 10);
      x = arr[--i];
      arr[i] = arr[j];
      arr[j] = x;
    }
    return arr;
  };

  get_ids_fron_email_given = function(email, id) {
    var agent_element, agent_id, agent_name, agent_or_client_assoc, array_key, assoc_client, client_email, client_id, client_name, e, i, object_key;
    client_email = "";
    client_name = "";
    client_id = "";
    agent_name = "";
    agent_id = "";
    array_key = "";
    object_key = "";
    agent_or_client_assoc = "";
    if (total_agents > 0) {
      assoc_client = false;
      i = 0;
      while (i < total_agents) {
        array_key = i;
        agent_element = agents_ids_assoc_clients[i];
        if (typeof agent_element !== "undefined") {
          agent_id = agents_ids_assoc_clients[i].agend_id;
          agent_name = agents_ids_assoc_clients[i].agent_name;
          if (agent_id === id) {
            agent_or_client_assoc = "agent";
            assoc_client = true;
            break;
          }
          for (e in agent_element) {
            if (agent_element[e].client_email === email || agent_element[e].client_id === id) {
              object_key = e;
              client_email = agent_element[e].client_email;
              client_name = agent_element[e].client_name;
              client_id = agent_element[e].client_id;
              agent_or_client_assoc = "client";
              assoc_client = true;
              break;
            }
          }
          if (assoc_client) {
            break;
          }
        } else {
          console.log("------------------------AGENTE UNDEFINED " + id + "------------------------");
        }
        i++;
      }
      if (assoc_client) {
        if (agent_or_client_assoc !== "") {
          return {
            ak: array_key,
            ok: object_key,
            client_or_agent: agent_or_client_assoc
          };
        } else {
          return {
            ak: array_key,
            ok: object_key
          };
        }
      } else {
        return false;
      }
    }
  };

  chat_disconnect_client = function(email_client) {
    var agent_id, client_id, obj_client;
    obj_client = get_ids_fron_email_given(email_client, "_");
    if (obj_client !== false && typeof obj_client !== "undefined") {
      console.log(agents_ids_assoc_clients[obj_client.ak]);
      client_id = agents_ids_assoc_clients[obj_client.ak][obj_client.ok].client_id;
      agent_id = agents_ids_assoc_clients[obj_client.ak].agend_id;
      agents_ids_assoc_clients[obj_client.ak][obj_client.ok].client_id = "";
      io.sockets.socket(client_id).emit("message", {
        disc: "disc"
      });
      io.sockets.socket(agent_id).emit("message", {
        disc: client_id
      });
    }
  };

  fs = require("fs");

  file = "chat.db";

  exists = fs.existsSync(file);

  sqlite3 = require("sqlite3").verbose();

  db = new sqlite3.Database(file);

  timestamp = require("console-timestamp");

  now = new Date();

  db.serialize(function() {
    if (!exists) {
      db.run("CREATE TABLE olab_chat_history (Email_agent TEXT, Email_client TEXT, Email_from TEXT, Message TEXT, Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL)");
    }
  });

  db.close();

  md5 = require("MD5");

  console.log("#################### CRYPTO #####################");

  crypto_hash = require("./hasher");

  console.log(crypto_hash);

  console.log("#################### CRYPTO #####################");

  express = require("express");

  basicAuth = require("basic-auth");

  bodyParser = require("body-parser");

  session = require("cookie-session");

  os = require("os");

  app = express();

  server_port = 3000;

  server_ip_address = 'http://192.168.0.104:3000';

  app.set("view engine", "jade");

  app.engine("jade", require("jade").__express);

  app.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST");
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");
    res.setHeader("Access-Control-Allow-Credentials", true);
    next();
  });

  app.set("views", __dirname + "/tpl");

  app.use(express["static"](__dirname + "/public"));

  app.use(bodyParser());

  app.use(session({
    keys: ["keyolaba", "keyolabb"],
    secureProxy: false
  }));

  admin_user = "olabadminuser";

  admin_pass = "olab2014adminchat*";

  auth = function(req, res, next) {
    var unauthorized, user, user_name, user_pass;
    unauthorized = function(res) {
      return res.render("page_agent_session", {
        server_ip_address: "http://" + server_ip_address + ":" + server_port
      });
    };
    user_name = req.body.user_name;
    user_pass = req.body.user_pass;
    user = req.session.user;
    if (req.body.user_logout === "logout") {
      req.session = null;
      return res.render("page_agent_session", {
        server_ip_address: "http://" + server_ip_address + ":" + server_port
      });
    }
    return sqlite_validate_user_data(req, res, user_name, user_pass, next);
  };

  router = express.Router();

  router.get("/", auth, function(req, res) {
    res.render("page_agent", {
      server_ip_address: "http://" + server_ip_address + ":" + server_port,
      data: req
    });
  });

  router.get("/olab_chat_agent", auth, function(req, res) {
    res.render("page_agent", {
      server_ip_address: "http://" + server_ip_address + ":" + server_port,
      data: req
    });
  });

  router.post("/", auth, function(req, res) {
    res.render("page_agent", {
      server_ip_address: "http://" + server_ip_address + ":" + server_port,
      data: req
    });
  });

  router.get("/olab_chat_client", function(req, res) {
    res.render("page_client", {
      server_ip_address: "http://" + server_ip_address + ":" + server_port
    });
  });

  app.use("/", router);

  io = require("socket.io").listen(app.listen(server_port));

  agents_ids_assoc_clients = [];

  total_agents = 0;

  max_clients_by_agents = 10;

  io.sockets.on("connection", function(socket) {
    socket.on("send", function(data) {
      var agent_email, client_email, client_id, i, obj;
      i = 0;
      while (client_id = data.ids[i]) {
        io.sockets.socket(client_id).emit("message", {
          message: data.message,
          connected: socket.manager.connected,
          who: socket.id,
          name: data.name,
          type: "right"
        });
        i++;
      }
      io.sockets.socket(socket.id).emit("message", {
        message: data.message,
        connected: socket.manager.connected,
        who: data.ids,
        name: data.name,
        type: "left"
      });
      obj = get_ids_fron_email_given("_", data.ids);
      if (obj.client_or_agent === "client") {
        console.log("agent->client");
        client_email = agents_ids_assoc_clients[obj.ak][obj.ok].client_email;
        sqlite_chat_add_new_message({
          email_agent: data.email,
          email_client: client_email,
          email_from: data.email,
          message: data.message
        }, function(data) {
          console.log("saved");
        });
      } else {
        console.log("client->agent");
        agent_email = agents_ids_assoc_clients[obj.ak].agent_email;
        sqlite_chat_add_new_message({
          email_agent: agent_email,
          email_client: data.email,
          email_from: data.email,
          message: data.message
        }, function(data) {
          console.log("saved");
        });
      }
      console.log("SEND - MESSAGE END");
    });
    socket.on("type_user", function(data) {
      if (data.message === "agent") {
        chat_add_agent(socket.id, data);
      } else {
        if (data.message === "client") {
          chat_add_client(socket.id, data);
        }
      }
    });
    socket.on("disc", function(data) {
      var email_client, id_client;
      id_client = data.id;
      email_client = data.email;
      chat_disconnect_client(email_client);
    });
    socket.on("disc_client", function(data) {
      chat_send_message_for_disc_to_client(data.client_id);
    });
    socket.on("connecting", function() {
      console.log("connecting:");
    });
    socket.on("connect", function() {
      console.log("connect:");
    });
    socket.on("connect_failed", function() {
      console.log("connect_failed");
    });
    socket.on("reconnect_failed", function() {
      console.log("Client reconnect_failed");
    });
    socket.on("reconnecting", function() {
      console.log("reconnecting");
    });
    socket.on("reconnect", function() {
      console.log("reconnect");
    });
    socket.on("disconnect", function() {
      var agent_id, client_id, e, id_client_disconnect, obj, obj_client, who_is;
      id_client_disconnect = socket.id;
      console.log("START disconnect SE DESCONECTO=" + id_client_disconnect);
      obj_client = get_ids_fron_email_given("_", id_client_disconnect);
      console.log("disconnect RESULTADO");
      console.log(obj_client);
      if (obj_client !== false && typeof obj_client !== "undefined") {
        agent_id = agents_ids_assoc_clients[obj_client.ak].agend_id;
        who_is = obj_client.client_or_agent;
        if (who_is === "client") {
          client_id = agents_ids_assoc_clients[obj_client.ak][obj_client.ok].client_id;
          agents_ids_assoc_clients[obj_client.ak][obj_client.ok].client_id = "";
          io.sockets.socket(agent_id).emit("message", {
            message_disc: "ESTE USUARIO SE DESCONECTO...",
            who: client_id,
            name: "",
            type: "right"
          });
        } else {
          obj = agents_ids_assoc_clients[obj_client.ak];
          for (e in obj) {
            if (typeof agent_element[e].client_id !== "undefined") {
              io.sockets.socket(agent_element[e].client_id).emit("message", {
                message_disc: "SE HA PERDIDO LA CONEXION!",
                type: "right"
              });
            }
          }
          console.log("#######REMOVE AGENT#########");
          console.log(agents_ids_assoc_clients);
          delete agents_ids_assoc_clients[obj_client.ak];
          total_agents = total_agents - 1;
          console.log(agents_ids_assoc_clients);
          console.log("#######REMOVE AGENT#########");
          console.log(" END AGENTE SE FUE!");
        }
      }
    });
  });

  console.log("IP ADDRESS:" + server_ip_address + "   PORT:" + server_port + "   INIT: " + timestamp("DD-MM-YYYY hh:mm:ss"));

}).call(this);