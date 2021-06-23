const commando = require('discord.js-commando');
var essentials = require('../essentials');
const IP = "127.0.0.1";
const PORT = 59000;
var net = require('net');
var sql = require('mssql');
var sqlite = require('sqlite3');

class TestCommand extends commando.Command
{
    constructor(client)
    {
        super(client,{
            name: 'test',
            group: 'features',
            memberName: 'test',
            description: 'test'
        });
    }

    async run(message, args)
    {
        /*
        if(await essentials.getInfo("TESTCOMMAND") == "1") return message.channel.send(essentials.getDefaultMessage("commanddisabled"));
        if(await message.channel.id != essentials.getInfo("ADMINCOMMANDSCHANNEL")) {message.delete();return message.author.send(essentials.craftMessage("error", `This command is only allowed on the admins command channel:\n**${message.content.replace(args, "")}**`));}

        var mod = 0;
        var modRoles = essentials.getHighMods();
        for(var i = 0; i < modRoles.length; i++){
            if(message.member.roles.some(role => role.name === modRoles[i])){
                i = modRoles.length + 1;
                mod = 1;
            }
       }
       if(!mod)
        return message.channel.send(essentials.getDefaultMessage("noperms"));
        /*var character = "123123";
        var client = new net.Socket();
        client.connect(PORT, IP, function() {
            console.log(`[${character}] Sending post to the game server...`);
            client.write(`satav;!banchar satav`, 'utf8');
            client.destroy();
        });
        client.on('close', function() {
            console.log('Connection closed');
        });
*/
        /*let currDB = new sqlite.Database('./db/mubotdata.db');
        let q = `SELECT * FROM charsel WHERE char='stav' UNION SELECT * FROM charsel WHERE char='test'`;
        currDB.all(q, [], (err, rows) => {
            if(err) {console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}
            if (rows.length == 2) return console.log(2);
            if (rows.length == 1) return console.log(1);
        });*/
/*
        var conn = new sql.ConnectionPool(dbConfig);
        var req = new sql.Request(conn);    

        conn.connect(function(err) {
            req.query(`SELECT * FROM AccountCharacter WHERE GameID1='testik' OR GameID2='testik' OR GameID3='testik' OR GameID4='testik' OR GameID5='testik'`, function(err, data){
                console.log(data);
            });
        });
        */
    }

}

module.exports = TestCommand;