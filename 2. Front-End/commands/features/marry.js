const commando = require('discord.js-commando')
var sql = require('mssql');
var essentials = require('../essentials');
var sqlite = require('sqlite3');

class MarryCommand extends commando.Command
{
    constructor(client)
    {
        super(client,{
            name: 'marry',
            group: 'features',
            memberName: 'marry',
            description: 'Marry a person'
        });
    }

    async run(message, args)
    {
        if(await essentials.getInfo("MARRYCOMMAND") == "1") return message.channel.send(essentials.getDefaultMessage("commanddisabled"));
        if(await message.channel.id != essentials.getInfo("COMMANDSCHANNEL")) {message.delete();return;}
        if(args == "usage") return message.channel.send(essentials.getUsageInfo("marry"));

        //Vars Declaration
        var marry = args.split(" ")[0];
        var secondDiscordAccountId = "";
        let charsDB = new sqlite.Database('./db/mubotdata.db');
        var character = "";

        //Declaring SQL Connection Variables
        var conn = new sql.ConnectionPool(dbConfig);
        var req = new sql.Request(conn);    

        //Checking if stat type exist, if not exist, if it does get account id
        if(marry=="" || marry==undefined) return message.channel.send(essentials.getDefaultMessage("wrongusage"));
        
        charsDB.all(`SELECT char FROM charsel WHERE discord_id='${message.author.id}'`, [], (err, rows) => {
            if(err) {message.channel.send(essentials.getDefaultMessage("error"));return console.log(err)}
            if(rows.length < 1) return message.channel.send(essentials.getDefaultMessage("wrongusage"));
            character = rows[0].char;
        });


        setTimeout(validateOwnership, 100);
       
        function validateOwnership()
        {
            charsDB.all(`SELECT * FROM charsel WHERE char='${marry}'`, [], (err, rows) => {
                if(err) {message.channel.send(essentials.getDefaultMessage("error"));return console.log(err)}
                if(rows.length < 1) return message.channel.send(essentials.craftMessage("error", `No discord account has chosen this character yet or this character doesn't exist.`));
                secondDiscordAccountId = rows[0].discord_id;
            });
            setTimeout(marryChar, 200);
        }
        
        function marryChar(){  
            conn.connect(function(err) {
                if(err) {message.channel.send(essentials.getDefaultMessage("error"));return console.log(err)}

                message.channel.send(essentials.craftMessage("warning", ":hourglass_flowing_sand: Your partner has 30 seconds to reply to the marriage request, he/she can accept the request by typing `accept marriage @[your user on discord]`."));

                const filter = m => m.content.includes('!accept marriage') && toString(m.author.id) == toString(secondDiscordAccountId) && m.mentions.users.first().id == message.author.id;
                const collector = message.channel.createMessageCollector(filter, {time: 30000});

                let SCHEMA = essentials.getInfo("SCHEMA"), CHARACTERSTBL = essentials.getInfo("CHARACTERSTABLE"), MARRIEDCOL = essentials.getInfo("MARRIEDCOL"),
                    MARRYNAMECOL = essentials.getInfo("MARRYNAMECOL"), NAMECOL = essentials.getInfo("NAMECOL");

                collector.on('collect', m=> {   
                    essentials.switchCommand(character);
                    essentials.switchCommand(marry);
                    req.query(`IF (SELECT ${MARRIEDCOL} FROM [${SCHEMA}].[${CHARACTERSTBL}] WHERE ${NAMECOL}='${character}') = 0 BEGIN IF(SELECT ${MARRIEDCOL} FROM [${SCHEMA}].[${CHARACTERSTBL}] WHERE ${NAMECOL}='${marry}') = 0 BEGIN UPDATE [${SCHEMA}].[${CHARACTERSTBL}] SET ${MARRIEDCOL}=1, ${MARRYNAMECOL} = '${marry}' WHERE ${NAMECOL}='${character}'; UPDATE [${SCHEMA}].[${CHARACTERSTBL}] SET ${MARRIEDCOL}=1, ${MARRYNAMECOL}='${character}' WHERE ${MARRYNAMECOL}='${marry}' END END`, function(err, data){
                        //Error logging
                        if(err) {conn.close(); console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}
                        if(data == undefined) {conn.close();return message.channel.send(essentials.getDefaultMessage("error"));}
                        if(data.rowsAffected.length < 1) {conn.close();return message.channel.send(essentials.craftMessage("error",`One or both of the characters are not exists / One or both of the characters are already married.`));}
    
                        message.channel.send(essentials.craftMessage("check", `:bride_with_veil: :man_in_tuxedo: ${character} is now married to ${marry} , Congartulations :partying_face:!`));
                        //Success
                        conn.close();
                    });
                });

                collector.on('end', collected=>{
                    if(collected.size == 0){
                        message.channel.send(essentials.craftMessage("info", `:hourglass_flowing_sand: Time's up, your partner didn't answer in 30s.`));
                    }
                });
            });                
        }
    }
}

module.exports = MarryCommand;