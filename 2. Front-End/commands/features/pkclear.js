const commando = require('discord.js-commando');
var sql = require('mssql');
var essentials = require('../essentials');
var sqlite = require('sqlite3');

class PKClearCommand extends commando.Command
{
    constructor(client)
    {
        super(client,{
            name: 'pkclear',
            group: 'features',
            memberName: 'pkclear',
            description: 'Clears PK Of a Character'
        });
    }

    async run(message, args)
    {
        if(await essentials.getInfo("PKCLEARCOMMAND") == "1") return message.channel.send(essentials.getDefaultMessage("commanddisabled"));
        if(await message.channel.id != essentials.getInfo("COMMANDSCHANNEL")) {message.delete();return;}
        if(args == "usage") return message.channel.send(essentials.getUsageInfo("pkclear"));

        var money = parseInt(essentials.getInfo("PKCLEARCOST"));
        var charMoney = 0;
        var charPkLevel = 0;
        let charsDB = new sqlite.Database('./db/mubotdata.db');
        var character = "";

        //Declaring SQL Connection Variables
        var conn = new sql.ConnectionPool(dbConfig);
        var req = new sql.Request(conn);    

        charsDB.all(`SELECT char FROM charsel WHERE discord_id='${message.author.id}'`, [], (err, rows) => {
            if(err) {message.channel.send(essentials.getDefaultMessage("error"));return console.log(err)}
            if(rows.length < 1) return message.channel.send(essentials.getDefaultMessage("noselectedcharacter"));
            character = rows[0].char;
            essentials.switchCommand(character);
        });

        let PKLEVELCOL = essentials.getInfo("PKLEVELCOL"), MONEYCOL = essentials.getInfo("MONEYCOL"), SCHEMA = essentials.getInfo("SCHEMA"), 
            CHARACTERSTBL = essentials.getInfo("CHARACTERSTABLE"), NAMECOL = essentials.getInfo("NAMECOL"); 

        setTimeout(getCharInfo, 200);

        function getCharInfo()
        {
            conn.connect(function(err){
                req.query(`SELECT [${PKLEVELCOL}], [${MONEYCOL}] FROM [${SCHEMA}].[${CHARACTERSTBL}] WHERE ${NAMECOL}='${character}'`, function(err, data){
                    //Error logging
                    if(err) {conn.close();message.channel.send(essentials.getDefaultMessage("error"));return console.log(err)}
                    
                    //Charcter isn't exist fallback
                    if(data == undefined || data.recordset == undefined || data.rowsAffected.length < 1 || data.rowsAffected[0] == 0){ 
                        conn.close();
                        return message.channel.send(essentials.getDefaultMessage("characternoexist"));
                    }

                    try{
                        charMoney = data.recordset[0][MONEYCOL];
                        charPkLevel = data.recordset[0][PKLEVELCOL];
                    }
                    catch(err){
                        conn.close();message.channel.send(essentials.getDefaultMessage("error"));console.log(data);return console.log(err)
                    }

                    conn.close();
                    setTimeout(clear, 500);
                });
            });
        }
        
        function clear(){
            if(parseInt(charMoney) < money) return message.channel.send(essentials.getDefaultMessage("characternomoney"));
            if(charPkLevel < parseInt(essentials.getInfo("PKFIRSTMURDERERLEVEL"))) return message.channel.send(essentials.getDefaultMessage("nomurderer"));
            let pkHero = parseInt(essentials.getInfo("PKFIRSTHEROLEVEL"));
            conn.connect(function(err){
                setTimeout(function(){
                    if(money > 0){
                        req.query(`UPDATE [${SCHEMA}].[${CHARACTERSTBL}] SET [${PKLEVELCOL}] = ${pkHero}, [${MONEYCOL}] = [${MONEYCOL}] - ${money} WHERE ${NAMECOL}='${character}'`, function(err, data){
                            if(err) {conn.close();message.channel.send(essentials.getDefaultMessage("error"));return console.log(err)}
        
                            message.channel.send(essentials.craftMessage("check", `${character} has been PK cleared successfully!`)); 
                            conn.close();
                        });
                    }
                    else if (money == 0){
                        req.query(`UPDATE [${SCHEMA}].[${CHARACTERSTBL}] SET [${PKLEVELCOL}] = ${pkHero} WHERE ${NAMECOL}='${character}'`, function(err, data){
                            if(err) {conn.close();message.channel.send(essentials.getDefaultMessage("error"));return console.log(err)}
        
                            message.channel.send(essentials.craftMessage("check", `${character} has been PK cleared successfully!`)); 
                            conn.close();
                        });
                    }
                    else {  
                        console.log(`Configuration Error: Pk Cost has to be a number equals or higher than 0`);
                        conn.close();
                        return message.channel.send(essentials.getDefaultMessage("error"));
                    }
                }, 1000) 
            });           
        }   
    }
}

module.exports = PKClearCommand;