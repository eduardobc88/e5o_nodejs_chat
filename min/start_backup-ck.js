function sqlite_add_agent_user_chat(){console.log("ADD NEW AGENT USER"),db=new sqlite3.Database(file),db.serialize(function(){stmt=db.prepare("INSERT INTO olab_chat_users VALUES (?,?,?,?)"),stmt.bind("ebc@g4all.mx","Eduardo Beltran",md5("g4alalo2014"),timestamp("DD-MM-YYYY hh:mm:ss")),stmt.get(function(e,s){e?(console.log("ERROR - sqlite_add_agent_user_chat()"),sqlite_chat_print_all("olab_chat_users")):(console.log("RESULT NEW USER AGENT ADDED"),sqlite_chat_print_all("olab_chat_users"))})}),stmt.finalize(),db.close()}function sqlite_validate_user_data(e,s,t,n,i){var a;console.log("########################### START VALIDATION ###########################"),a=new sqlite3.Database(file),a.serialize(function(){var _;_="SELECT * FROM cms_chatuser WHERE username = '"+t+"';",a.all(_,function(t,a){var _,o,c;_=function(e){return e.render("page_agent_session",{server_ip_address:"http://"+server_ip_address+":"+server_port})},t&&console.log("ERROR - sqlite_validate_user_data()"),0===a.length?(console.log("Error authenticating."),c=e.body.user_name,n=e.body.user_pass,o=e.session.user,c===admin_user&&n===admin_pass?(e.session={user:{user_name:c,user_pass:n}},i()):o&&o.user_name&&o.user_pass&&o.user_name===admin_user&&o.user_pass===admin_pass?(e.session={user:{user_name:o.user_name,user_pass:o.user_pass}},i()):_(s)):crypto_hash.validatePassword(n,a[0].password)&&(i(),console.log("Correct user"))})}),a.close(),console.log("########################### END VALIDATION ###########################")}function sqlite_chat_print_all(e){db=new sqlite3.Database(file),db.serialize(function(){db.all("SELECT * FROM "+e+";",function(e,s){console.log(e?"ERROR - sqlite_chat_print_all()":s)})}),db.close()}function sqlite_chat_add_new_message(e,s){db=new sqlite3.Database(file),console.log("NEW MESSAGE TO SAVE"),db.serialize(function(){stmt=db.prepare("INSERT INTO olab_chat_history VALUES (?,?,?,?,?)"),stmt.bind(e.email_agent,e.email_client,e.email_from,e.message,timestamp("DD-MM-YYYY hh:mm:ss")),stmt.get(function(e,t){e?console.log("ERROR - sqlite_chat_add_new_message()"):(console.log("RESULT INSERT NEW MESSAGE"),sqlite_chat_print_all("olab_chat_history"),s({status:"ok"}))})}),stmt.finalize(),db.close()}function chat_send_message_for_disc_to_client(e){obj_client=get_ids_fron_email_given("_",e),0!=obj_client&&"undefined"!=typeof obj_client&&(agent_id=agents_ids_assoc_clients[obj_client.ak].agend_id,who_is=obj_client.client_or_agent,"client"==who_is&&(client_id=agents_ids_assoc_clients[obj_client.ak][obj_client.ok].client_id,agents_ids_assoc_clients[obj_client.ak][obj_client.ok].client_id="",io.sockets.socket(e).emit("message",{message_disc:"SE HA PERDIDO LA CONEXION!",type:"right"})))}function chat_add_agent(e,s){exist_agent=0;for(k in agents_ids_assoc_clients)"undefined"!=typeof agents_ids_assoc_clients[k]&&agents_ids_assoc_clients[k].agent_email==s.email&&(console.log("Este agente ya existe"),io.sockets.socket(e).emit("message",{status:"Este correo ya esta en uso."}),exist_agent=1);if(!exist_agent){for(object_clients={agend_id:e,agent_name:s.name,agent_email:s.email},i=0;max_clients_by_agents>i;i++)object_clients["client_id_"+i]={client_id:"",client_name:"",client_email:""};agents_ids_assoc_clients[total_agents++]=object_clients,io.sockets.socket(e).emit("message",{assoc:"ok"})}}function chat_add_client(e,s){if(console.log("#######chat_add_client#########"),console.log(agents_ids_assoc_clients),console.log("#######chat_add_client#########"),agents_ids_assoc_clients=shuffle(agents_ids_assoc_clients),chat_disconnect_client(s.email),agent_id_assoc="",agent_name_assoc="",total_agents>0){assoc_client=!1;for(var t=0;total_agents>t;t++)if(agent_element=agents_ids_assoc_clients[t],"undefined"!=typeof agent_element){agent_id_assoc=agents_ids_assoc_clients[t].agend_id,agent_name_assoc=agents_ids_assoc_clients[t].agent_name;for(var n in agent_element)if(""==agent_element[n].client_id){agent_element[n].client_id=e,agent_element[n].client_name=s.name,agent_element[n].client_email=s.email,assoc_client=!0;break}if(assoc_client)break}assoc_client?(io.sockets.socket(e).emit("message",{agent_assoc_id:agent_id_assoc,name:agent_name_assoc}),io.sockets.socket(agent_id_assoc).emit("message",{client_assoc_id:e,name:s.name})):(console.log("NO HAY AGENTES DISPONIBLES"),io.sockets.socket(e).emit("message",{agent_assoc_id:"-",name:"-"}))}else console.log("NO HAY AGENTES DISPONIBLES"),io.sockets.socket(e).emit("message",{agent_assoc_id:"-",name:"-"})}function shuffle(e){for(var s,t,n=e.length;n;s=parseInt(Math.random()*n,10),t=e[--n],e[n]=e[s],e[s]=t);return e}function get_ids_fron_email_given(e,s){if(client_email="",client_name="",client_id="",agent_name="",agent_id="",array_key="",object_key="",agent_or_client_assoc="",total_agents>0){assoc_client=!1;for(var t=0;total_agents>t;t++)if(array_key=t,agent_element=agents_ids_assoc_clients[t],"undefined"!=typeof agent_element){if(agent_id=agents_ids_assoc_clients[t].agend_id,agent_name=agents_ids_assoc_clients[t].agent_name,agent_id==s){agent_or_client_assoc="agent",assoc_client=!0;break}for(var n in agent_element)if(agent_element[n].client_email==e||agent_element[n].client_id==s){object_key=n,client_email=agent_element[n].client_email,client_name=agent_element[n].client_name,client_id=agent_element[n].client_id,agent_or_client_assoc="client",assoc_client=!0;break}if(assoc_client)break}else console.log("------------------------AGENTE UNDEFINED "+s+"------------------------");return assoc_client?""!=agent_or_client_assoc?{ak:array_key,ok:object_key,client_or_agent:agent_or_client_assoc}:{ak:array_key,ok:object_key}:!1}}function chat_disconnect_client(e){obj_client=get_ids_fron_email_given(e,"_"),0!=obj_client&&"undefined"!=typeof obj_client&&(console.log(agents_ids_assoc_clients[obj_client.ak]),client_id=agents_ids_assoc_clients[obj_client.ak][obj_client.ok].client_id,agent_id=agents_ids_assoc_clients[obj_client.ak].agend_id,agents_ids_assoc_clients[obj_client.ak][obj_client.ok].client_id="",io.sockets.socket(client_id).emit("message",{disc:"disc"}),io.sockets.socket(agent_id).emit("message",{disc:client_id}))}var fs=require("fs"),file="chat.db",exists=fs.existsSync(file),sqlite3=require("sqlite3").verbose(),db=new sqlite3.Database(file),timestamp=require("console-timestamp"),now=new Date;db.serialize(function(){exists||db.run("CREATE TABLE olab_chat_history (Email_agent TEXT, Email_client TEXT, Email_from TEXT, Message TEXT, Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL)")}),db.close();var md5=require("MD5");console.log("#################### CRYPTO #####################");var crypto_hash=require("./hasher");console.log(crypto_hash),console.log("#################### CRYPTO #####################");var express=require("express"),basicAuth=require("basic-auth"),bodyParser=require("body-parser"),session=require("cookie-session"),os=require("os"),app=express(),server_port=3e3,server_ip_address="198.61.147.96";app.set("view engine","jade"),app.engine("jade",require("jade").__express),app.use(function(e,s,t){s.setHeader("Access-Control-Allow-Origin","*"),s.setHeader("Access-Control-Allow-Methods","GET, POST"),s.setHeader("Access-Control-Allow-Headers","X-Requested-With,content-type"),s.setHeader("Access-Control-Allow-Credentials",!0),t()}),app.set("views",__dirname+"/tpl"),app.use(express.static(__dirname+"/public")),app.use(bodyParser()),app.use(session({keys:["keyolaba","keyolabb"],secureProxy:!1}));var admin_user="olabadminuser",admin_pass="olab2014adminchat*",auth=function(e,s,t){function n(e){return e.render("page_agent_session",{server_ip_address:"http://"+server_ip_address+":"+server_port})}user_name=e.body.user_name,user_pass=e.body.user_pass;var i=e.session.user;return"logout"==e.body.user_logout?(e.session=null,s.render("page_agent_session",{server_ip_address:"http://"+server_ip_address+":"+server_port})):void sqlite_validate_user_data(e,s,user_name,user_pass,t)},router=express.Router();router.get("/",auth,function(e,s){s.render("page_agent",{server_ip_address:"http://"+server_ip_address+":"+server_port,data:e})}),router.get("/olab_chat_agent",auth,function(e,s){s.render("page_agent",{server_ip_address:"http://"+server_ip_address+":"+server_port,data:e})}),router.post("/",auth,function(e,s){s.render("page_agent",{server_ip_address:"http://"+server_ip_address+":"+server_port,data:e})}),router.get("/olab_chat_client",function(e,s){s.render("page_client",{server_ip_address:"http://"+server_ip_address+":"+server_port})}),app.use("/",router);var io=require("socket.io").listen(app.listen(server_port)),agents_ids_assoc_clients=[],total_agents=0,max_clients_by_agents=10;io.sockets.on("connection",function(e){e.on("send",function(s){for(i=0;client_id=s.ids[i];i++)io.sockets.socket(client_id).emit("message",{message:s.message,connected:e.manager.connected,who:e.id,name:s.name,type:"right"});io.sockets.socket(e.id).emit("message",{message:s.message,connected:e.manager.connected,who:s.ids,name:s.name,type:"left"}),obj=get_ids_fron_email_given("_",s.ids),"client"==obj.client_or_agent?(console.log("agent->client"),client_email=agents_ids_assoc_clients[obj.ak][obj.ok].client_email,sqlite_chat_add_new_message({email_agent:s.email,email_client:client_email,email_from:s.email,message:s.message},function(e){console.log("saved")})):(console.log("client->agent"),agent_email=agents_ids_assoc_clients[obj.ak].agent_email,sqlite_chat_add_new_message({email_agent:agent_email,email_client:s.email,email_from:s.email,message:s.message},function(e){console.log("saved")})),console.log("SEND - MESSAGE END")}),e.on("type_user",function(s){"agent"==s.message?chat_add_agent(e.id,s):"client"==s.message&&chat_add_client(e.id,s)}),e.on("disc",function(e){id_client=e.id,email_client=e.email,chat_disconnect_client(email_client)}),e.on("disc_client",function(e){chat_send_message_for_disc_to_client(e.client_id)}),e.on("connecting",function(){console.log("connecting:")}),e.on("connect",function(){console.log("connect:")}),e.on("connect_failed",function(){console.log("connect_failed")}),e.on("reconnect_failed",function(){console.log("Client reconnect_failed")}),e.on("reconnecting",function(){console.log("reconnecting")}),e.on("reconnect",function(){console.log("reconnect")}),e.on("disconnect",function(){if(id_client_disconnect=e.id,console.log("START disconnect SE DESCONECTO="+id_client_disconnect),obj_client=get_ids_fron_email_given("_",id_client_disconnect),console.log("disconnect RESULTADO"),console.log(obj_client),0!=obj_client&&"undefined"!=typeof obj_client)if(agent_id=agents_ids_assoc_clients[obj_client.ak].agend_id,who_is=obj_client.client_or_agent,"client"==who_is)client_id=agents_ids_assoc_clients[obj_client.ak][obj_client.ok].client_id,agents_ids_assoc_clients[obj_client.ak][obj_client.ok].client_id="",io.sockets.socket(agent_id).emit("message",{message_disc:"ESTE USUARIO SE DESCONECTO...",who:client_id,name:"",type:"right"});else{obj=agents_ids_assoc_clients[obj_client.ak];for(var s in obj)"undefined"!=typeof agent_element[s].client_id&&io.sockets.socket(agent_element[s].client_id).emit("message",{message_disc:"SE HA PERDIDO LA CONEXION!",type:"right"});console.log("#######REMOVE AGENT#########"),console.log(agents_ids_assoc_clients),delete agents_ids_assoc_clients[obj_client.ak],total_agents-=1,console.log(agents_ids_assoc_clients),console.log("#######REMOVE AGENT#########"),console.log(" END AGENTE SE FUE!")}})}),console.log("IP ADDRESS:"+server_ip_address+"   PORT:"+server_port+"   INIT: "+timestamp("DD-MM-YYYY hh:mm:ss"));