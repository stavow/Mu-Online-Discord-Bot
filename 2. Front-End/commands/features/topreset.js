var sql = require('mssql');
const commando = require('discord.js-commando');
const Discord = require('discord.js');
var essentials = require('../essentials');
const { serverListCommand } = require('../essentials');

class TopResetCommand extends commando.Command
{
    constructor(client)
    {
        super(client,{
            name: 'topreset',
            group: 'features',
            memberName: 'topreset',
            description: 'Gets information about the top 10 resets'
        });
    }

    async run(message, args)
    {
        if(await essentials.getInfo("TOPRESETCOMMAND") == "1") return message.channel.send(essentials.getDefaultMessage("commanddisabled"));
        if(await message.channel.id != essentials.getInfo("COMMANDSCHANNEL")) {message.delete();return;}
        if(args == "usage") return message.channel.send(essentials.getUsageInfo("topreset"));

        var conn = new sql.ConnectionPool(dbConfig);
        var req = new sql.Request(conn);

        let SCHEMA = essentials.getInfo("SCHEMA"), CHARACTERSTBL = essentials.getInfo("CHARACTERSTABLE"), CTLCODECOL = essentials.getInfo("CTLCODECOL"), RESETSCOL = essentials.getInfo("RESETSCOL"),
            LEVELCOL = essentials.getInfo("LEVELCOL"), CLASSCOL = essentials.getInfo("CLASSCOL"), NAMECOL = essentials.getInfo("NAMECOL"), SERVERLOGO = essentials.getInfo("ServerLogo"),
            SERVERNAME = essentials.getInfo("ServerName"), SITEDOMAIN = essentials.getInfo("SiteDomain"), BKEMOJI = essentials.getInfo("KNIGHTEMOJI"), ELFEMOJI = essentials.getInfo("ELFEMOJI"),
            SMEMOJI = essentials.getInfo("WIZARDEMOJI"), MGEMOJI = essentials.getInfo("GLADIATOREMOJI"), DLEMOJI = essentials.getInfo("LORDEMOJI"), RFEMOJI = essentials.getInfo("RFEMOJI"),
            SREMOJI = essentials.getInfo("SUMMONEREMOJI");

        conn.connect(function (err) {
            if (err){
                console.log(err);
                return message.channel.send(essentials.getDefaultMessage("error"));
            }
            req.query(`SELECT TOP 10 ${NAMECOL}, ${LEVELCOL}, ${RESETSCOL}, ${CLASSCOL} FROM [${SCHEMA}].[${CHARACTERSTBL}] WHERE ${CTLCODECOL} < 1 Order By ${RESETSCOL} DESC`, function(err, data){
                if (err){
                    console.log(err);
                    return message.channel.send(essentials.getDefaultMessage("error"));
                }
                else if(data == undefined || data.recordset == undefined || data.rowsAffected.length < 1 || data.rowsAffected[0] == 0){
                    console.log(err);
                    return message.channel.send(essentials.getDefaultMessage("error"));
                }
                else {
                    const result = new Discord.RichEmbed();
                    const serverLogo = new Discord.Attachment(SERVERLOGO, 'serverLogo.png');
                    var color = "";
                    var l = data.recordset.length;
                    result.attachFile(serverLogo);
                    result.setAuthor(`${SERVERNAME} - Top Reset`, 'attachment://serverLogo.png', SITEDOMAIN);
                    result.setTitle("Top Reset");
                    for(var i = 0; i < l; i++){
                        var class_str = "";
                        switch (data.recordset[i].Class)
                        {
                            case 16: class_str =BKEMOJI;color="#FF0000";break;
                            case 17: class_str =BKEMOJI;color="#FF0000";break;
                            case 18: class_str =BKEMOJI;color="#FF0000";break;
                            case 32: class_str=ELFEMOJI;color="#C0C0C0";break;
                            case 33: class_str=ELFEMOJI;color="#C0C0C0";break;
                            case 34: class_str=ELFEMOJI;color="#C0C0C0";break;
                            case 0: class_str=SMEMOJI;color="#2F2FFF";break;
                            case 1: class_str=SMEMOJI;color="#2F2FFF";break;
                            case 2: class_str=SMEMOJI;color="#2F2FFF";break;
                            case 48: class_str=MGEMOJI;color="#330033";break;
                            case 50: class_str=MGEMOJI;color="#330033";break;
                            case 64: class_str=DLEMOJI;color="#000000";break;
                            case 65: class_str=DLEMOJI;color="#000000";break;
                            case 80: class_str=SREMOJI;color="#846684";break;
                            case 81: class_str=SREMOJI;color="#846684";break;
                            case 82: class_str=SREMOJI;color="#846684";break;
                            case 96: class_str=RFEMOJI;color="#FFA500";break;
                            case 98: class_str=RFEMOJI;color="#FFA500";break;
                        }
                        result.addField(class_str + "   **" + data.recordset[i].Name + "**" , "Level: " + data.recordset[i].cLevel + "\nResets: " + data.recordset[i].RESETS);
                        
                    }
                    result.setColor(color);
                    result.setFooter(`Top Resets - ${SERVERNAME}`, 'attachment://serverLogo.png');
                    result.setTimestamp(); 
                    message.channel.send(result); 
                }
                conn.close();
            });
        });
    }
}

module.exports = TopResetCommand;