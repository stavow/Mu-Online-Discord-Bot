var sql = require('mssql');
const commando = require('discord.js-commando');
const Discord = require('discord.js');
var essentials = require('../essentials');
const sqlite = require('sqlite3');

class CrewCommand extends commando.Command
{
    constructor(client)
    {
        super(client,{
            name: 'crew',
            group: 'features',
            memberName: 'crew',
            description: 'Gets information about the top 10 resets'
        });
    }

    async run(message, args)
    {
        if(await essentials.getInfo("CREWCOMMAND") == "1") return message.channel.send(essentials.getDefaultMessage("commanddisabled"));
        if(await message.channel.id != essentials.getInfo("COMMANDSCHANNEL")) {message.delete();return;}
        if(args == "usage") return message.channel.send(essentials.getUsageInfo("crew"));

        var conn = new sql.ConnectionPool(dbConfig);
        var req = new sql.Request(conn);
        let crewDB = new sqlite.Database('./db/mubotdata.db');

        let SERVERLOGO = essentials.getInfo("ServerLogo"),SERVERNAME = essentials.getInfo("ServerName"), SITEDOMAIN = essentials.getInfo("SiteDomain"), 
            STATSTABLE = essentials.getInfo("STATSTABLE"), STATSMEMBERIDCOL = essentials.getInfo("STATSMEMBERIDCOL");

        crewDB.all(`SELECT * FROM crew ORDER BY priority ASC;`, [], (err, rows) => {
            if(err) {console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}
            let crewAcc = [];
            let crewChars = [];
            let crewRoles = [];
            let query = ``;
            for(var i = 0; i < rows.length; i++){
                crewAcc[i] = rows[i].account;
                crewChars[i] = rows[i].character;
                crewRoles[i] = rows[i].role;
            }
            for(var j = 0; j < crewAcc.length; j++){
                query += `SELECT * FROM ${STATSTABLE} WHERE ${STATSMEMBERIDCOL}='${crewAcc[j]}'`;
                if((j + 1) != crewAcc.length){
                    query += " UNION ";
                }
            }
            conn.connect(function(err){
                if(err) {console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}

                req.query(query, function(err, data) {
                    if(err) {console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}
                    if(data == undefined || data.recordset == undefined || data.rowsAffected.length < 1 || data.rowsAffected[0] == 0) return console.log(err);
                    
                    var embed = new Discord.RichEmbed();
                    const serverLogo = new Discord.Attachment(SERVERLOGO, 'serverLogo.png');
                    var status = "";
                    embed.attachFile(serverLogo);
                    embed.setAuthor(`${SERVERNAME}'s Crew`, 'attachment://serverLogo.png', SITEDOMAIN);
                    embed.setFooter(`${SERVERNAME}'s Crew`);
                    embed.setColor(`#000000`);
                    embed.setTimestamp();

                    for(var k = 0; k < data.recordset.length; k++){
                        if(data.recordset[k].ConnectStat == 0){
                            status = essentials.getInfo("OFFLINEEMOJI");
                        }
                        else{
                            status = essentials.getInfo("ONLINEEMOJI");
                        }

                        embed.addField(crewChars[k], `Role: ${crewRoles[k]}\nStatus: ` + status);
                    }

                    message.channel.send(embed);
                });
            });
        });
    }
}

module.exports = CrewCommand;