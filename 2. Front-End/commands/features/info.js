var sql = require('mssql');
const commando = require('discord.js-commando');
const Discord = require('discord.js');
var essentials = require('../essentials');
var sqlite = require('sqlite3');

class InfoCommand extends commando.Command
{
    constructor(client)
    {
        super(client,{
            name: 'info',
            group: 'features',
            memberName: 'info',
            description: 'Gets information about a player'
        });
    }

    async run(message, args)
    {
        if(await essentials.getInfo("INFOCOMMAND") == "1") return message.channel.send(essentials.getDefaultMessage("commanddisabled"));
        if(await message.channel.id != essentials.getInfo("COMMANDSCHANNEL")) {message.delete();return;}
        if(args == "usage") return message.channel.send(essentials.getUsageInfo("info"));

        var player_name = args;
        var conn = new sql.ConnectionPool(dbConfig);
        var req = new sql.Request(conn);
        var discord_id_related = "";
        let charsDB = new sqlite.Database('./db/mubotdata.db');

        charsDB.all(`SELECT discord_id FROM charsel WHERE char='${player_name}'`, [], (err, rows) => {
            if(err) {message.channel.send(essentials.getDefaultMessage("error"));return console.log(err)}
            if(rows.length > 0) {
                discord_id_related =  `<@${rows[0].discord_id}>`;
            }
            else {
                discord_id_related = "None";
            }
        });


        var cond = new RegExp("^[A-Za-z0-9]+$");
        if(!cond.test(player_name) || player_name == "" || player_name == undefined || player_name.length > 10 || player_name.length < 4) return message.channel.send(essentials.craftMessage("error", `Character name is not valid.`));

        let SCHEMA = essentials.getInfo("SCHEMA"), CHARACTERSTBL = essentials.getInfo("CHARACTERSTABLE"), NAMECOL = essentials.getInfo("NAMECOL"), CLASSCOL = essentials.getInfo("CLASSCOL"),
            LEVELCOL = essentials.getInfo("LEVELCOL"), RESETSCOL = essentials.getInfo("RESETSCOL"), LEVELUPPOINTCOL = essentials.getInfo("LEVELUPPOINTCOL"), STRCOL = essentials.getInfo("STRCOL"),
            DEXCOL = essentials.getInfo("DEXCOL"), VITCOL = essentials.getInfo("VITCOL"), ENECOL = essentials.getInfo("ENECOL"), COMCOL = essentials.getInfo("COMCOL"), MONEYCOL = essentials.getInfo("MONEYCOL"),
            MARRIEDCOL = essentials.getInfo("MARRIEDCOL"), PKLEVELCOL = essentials.getInfo("PKLEVELCOL"), MAPNUMBERCOL = essentials.getInfo("MAPNUMBERCOL"), SERVERNAME = essentials.getInfo("ServerName");

        conn.connect(function (err) {
            if (err){
                console.log(err);
                return; 
            }
            req.query(`SELECT [${CLASSCOL}], [${LEVELCOL}], [${RESETSCOL}], [${LEVELUPPOINTCOL}], [${STRCOL}], [${DEXCOL}], [${VITCOL}], [${COMCOL}], [${ENECOL}], [${MONEYCOL}], [${MARRIEDCOL}], [${PKLEVELCOL}], [${MAPNUMBERCOL}] FROM [${SCHEMA}].[${CHARACTERSTBL}] WHERE [${NAMECOL}]='${player_name}'`, function(err, data){
                if (err){
                    console.log(err);
                    return;
                }
                else {
                    //Checking if character exists
                    if(data == undefined || data.recordset == undefined || data.rowsAffected.length < 1 || data.rowsAffected[0] == 0){
                        message.channel.send(essentials.getDefaultMessage("characternoexist")); 
                        conn.close();
                        return;
                    }

                    //Variables Declaration
                    var class_num = data.recordset[0][CLASSCOL];
                    var class_str = "";
                    var class_embed = "";
                    var color = "";
                    var married_emoji = ":no_entry:";
                    var pk_status = "Commoner";

                    //Assigning the color and class of the Character
                    switch (class_num)
                    {
                        case 16: class_embed = "Dark Knight";class_str="bk";color="#FF0000";break;
                        case 17: class_embed = "Blade Knight";class_str="bk";color="#FF0000";break;
                        case 18: class_embed = "Blade Master";class_str="bk";color="#FF0000";break;
                        case 32: class_embed = "Fairy Elf";class_str="elf";color="#C0C0C0";break;
                        case 33: class_embed = "Muse Elf";class_str="elf";color="#C0C0C0";break;
                        case 34: class_embed = "High Elf";class_str="elf";color="#C0C0C0";break;
                        case 0: class_embed = "Dark Wizard";class_str="sm";color="#2F2FFF";break;
                        case 1: class_embed = "Soul Master";class_str="sm";color="#2F2FFF";break;
                        case 2: class_embed = "Grand Master";class_str="sm";color="#2F2FFF";break;
                        case 48: class_embed = "Magic Gladiator";class_str="mg";color="#330033";break;
                        case 50: class_embed = "Duel Master";class_str="mg";color="#330033";break;
                        case 64: class_embed = "Dark Lord";class_str="dl";color="#000000";break;
                        case 65: class_embed = "Lord Emperor";class_str="dl";color="#000000";break;
                        case 80: class_embed = "Summoner";class_str="sr";color="#846684";break;
                        case 81: class_embed = "Bloody Summoner";class_str="sr";color="#846684";break;
                        case 82: class_embed = "Dimension Master";class_str="sr";color="#846684";break;
                        case 96: class_embed = "Rage Fighter";class_str="rf";color="#FFA500";break;
                        case 98: class_embed = "Fist Master";class_str="rf";color="#FFA500";break;
                    }

                    if(data.recordset[0][PKLEVELCOL] <= parseInt(essentials.getInfo("PKFIRSTHEROLEVEL")))
                        pk_status = "Hero";
                    else if(data.recordset[0][PKLEVELCOL] >= parseInt(essentials.getInfo("PKFIRSTMURDERERLEVEL")))
                        pk_status = "Murderer"
                    
                    //Checking if the player is married
                    if(data.recordset[0][MARRIEDCOL]) married_emoji=":white_check_mark:";

                    //Creating the character class image preview
                    const attachment = new Discord.Attachment('./class/' + class_str + '.jpg', 'class.jpg');

                    //Creating the result embed
                    if(data.recordset[0][COMCOL] > 0){
                        const result = new Discord.RichEmbed()
                        .setAuthor(player_name, 'attachment://class.jpg')
                        .attachFile(attachment)
                        .setThumbnail('attachment://class.jpg')
                        .setTitle("Character Info")
                        .setColor(color)
                        .addField("Level", data.recordset[0][LEVELCOL], true)
                        .addField("Resets", data.recordset[0][RESETSCOL], true)
                        .addField("Points", data.recordset[0][LEVELUPPOINTCOL], true)
                        .addField("Class", class_embed,true)
                        .addField("Strength", data.recordset[0][STRCOL],true)
                        .addField("Dexterity", data.recordset[0][DEXCOL],true)
                        .addField("Vitality", data.recordset[0][VITCOL],true)
                        .addField("Energy", data.recordset[0][ENECOL],true)
                        .addField("Command", data.recordset[0][COMCOL],true)
                        .addField("Money", data.recordset[0][MONEYCOL],true)
                        .addField("Married", married_emoji,true)
                        .addField("PK Status", pk_status, true)
                        .addField("Associated Discord", discord_id_related, true)
                        .setFooter(SERVERNAME)
                        .setTimestamp()
    
                        message.channel.send(result);
                    }
                    else {
                        const result = new Discord.RichEmbed()
                        .setAuthor(player_name, 'attachment://class.jpg')
                        .attachFile(attachment)
                        .setThumbnail('attachment://class.jpg')
                        .setTitle("Character Info")
                        .setColor(color)
                        .addField("Level", data.recordset[0][LEVELCOL], true)
                        .addField("Resets", data.recordset[0][RESETSCOL], true)
                        .addField("Points", data.recordset[0][LEVELUPPOINTCOL], true)
                        .addField("Class", class_embed,true)
                        .addField("Strength", data.recordset[0][STRCOL],true)
                        .addField("Dexterity", data.recordset[0][DEXCOL],true)
                        .addField("Vitality", data.recordset[0][VITCOL],true)
                        .addField("Energy", data.recordset[0][ENECOL],true)
                        .addField("Money", data.recordset[0][MONEYCOL],true)
                        .addField("Married", married_emoji,true)
                        .addField("PK Status", pk_status, true)
                        .addField("Associated Discord", discord_id_related, true)
                        .setFooter(SERVERNAME)
                        .setTimestamp()
    
                        message.channel.send(result);
                    }

                }
                conn.close();
            });
        });
    }

}

module.exports = InfoCommand;