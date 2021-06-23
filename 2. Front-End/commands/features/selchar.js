const commando = require('discord.js-commando');
var sql = require('mssql');
var sqlite = require('sqlite3');
const essentials = require('../essentials');
class SelCharCommand extends commando.Command
{
    constructor(client)
    {
        super(client,{
            name: 'selchar',
            group: 'features',
            memberName: 'selchar',
            description: 'Select a character'
        });
    }

    async run(message, args)
    {
        if(essentials.getInfo("SELCHARCOMMAND") == "1") return message.channel.send(essentials.getDefaultMessage("commanddisabled"));
        if(await message.channel.id != essentials.getInfo("COMMANDSCHANNEL")) {message.delete();return;}
        if(args == "usage") return message.channel.send(essentials.getUsageInfo("selchar"));

        var character = args.split(" ")[0];
        var cond = new RegExp("^[A-Za-z0-9]+$");
        var account_id = "";
        let accDB = new sqlite.Database('./db/mubotdata.db');
        var noArgs = 0;
        var hasRecord = 0;

        var conn = new sql.ConnectionPool(dbConfig);
        var req = new sql.Request(conn); 

        if(args == ""){
            noArgs = 1;
            accDB.all(`SELECT * FROM charsel WHERE discord_id='${message.author.id}'`, [], (err, rows) => {
                if(err) {conn.close(); console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}
                if(rows.length < 1) return message.channel.send(essentials.getDefaultMessage("wrongusage"));
                return message.channel.send(essentials.craftMessage("info", `Your selected character is **${rows[0].char}**.`));
            });
        }
        else if(!cond.test(character) || character.length > 10 || character.length < 1) return message.channel.send(essentials.getDefaultMessage("wrongusage")); 
        
        accDB.all(`SELECT * FROM charsel WHERE discord_id='${message.author.id}'`, [], (err, rows) => {
            if(err) {message.channel.send(essentials.getDefaultMessage("error"));return console.log(err)}
            if(rows.length > 0)
                hasRecord = 1;
        });

        let ACCOUNTIDCOL = essentials.getInfo("ACCOUNTIDCOL"), SCHEMA = essentials.getInfo("SCHEMA"), CHARACTERSTBL = essentials.getInfo("CHARACTERSTABLE"),
            NAMECOL = essentials.getInfo("NAMECOL");

        if(!noArgs)    
            setTimeout(getAcc, 200);

        function getAcc(){
            conn.connect(function(err){
                req.query(`SELECT ${ACCOUNTIDCOL} FROM [${SCHEMA}].[${CHARACTERSTBL}] WHERE ${NAMECOL}='${character}'`, function(err, data){
                    if(err){conn.close(); console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}

                    if(data == undefined || data.recordset == undefined || data.rowsAffected.length < 1 || data.rowsAffected[0] == 0){
                        console.log(err);
                        conn.close();
                        return message.channel.send(essentials.getDefaultMessage("characternoexist"));
                    }

                    account_id = data.recordset[0][ACCOUNTIDCOL];
                    conn.close();

                    setTimeout(selChar, 500);
                });
            });
        }

        function selChar(){
            accDB.all(`SELECT * FROM accauth WHERE member_id='${account_id}'`, [], (err, rows) => {
                let errOccurred = 0;
                if(err) {errOccurred=1;return console.log(err);}
                if(rows.length < 1) {errOccurred=1;return message.channel.send(essentials.craftMessage("error", `Character's account wasn't authenticated yet.\nif the account belong to you use !auth [account] [password] on the private channel to authenticate your account.`));}
                if(rows[0].discord_id != message.author.id) {errOccurred=1;return message.channel.send(essentials.craftMessage("error", `Character's account doesn't belong to you`));}

                setTimeout(function() {
                    if(!errOccurred){
                        accDB.all(`SELECT * FROM charsel WHERE char='${character}'`, [], (err, rows) =>{
                            let errOccurred2 = 0;
                            if(err) {errOccurred2=1;return console.log(err)}
                            if(rows.length > 0 && rows[0].discord_id == message.author.id) {errOccurred2=1;return message.channel.send(essentials.craftMessage("error", `You already selected given character`))}
                            if(rows.length > 0) {errOccurred2=1;return message.channel.send(essentials.craftMessage("error", `Character given already selected by other user [Fatal Error, Contact Admins]`));}
                            
                            if(hasRecord){
                                setTimeout(function(){
                                    if(!errOccurred2){
                                        accDB.all(`UPDATE charsel SET char='${character}' WHERE discord_id='${message.author.id}'`, [], (err, rows) => {
                                            if(err) {return console.log(err)}
                                            
                                            message.channel.send(essentials.craftMessage("check", `Succsessfully selected ${character} as your character!`));
                                        });
                                    }
                                }, 200)
                            }
                            else{
                                setTimeout(function(){
                                    if(!errOccurred2){
                                        accDB.all(`INSERT OR IGNORE INTO charsel(char, discord_id) VALUES('${character}', '${message.author.id}')`, [], (err, rows) => {
                                            if(err) {return console.log(err)}
                                            
                                            message.channel.send(essentials.craftMessage("check", `Succsessfully selected ${character} as your character!`));
                                        });
                                    }
                                }, 200)
                            }
                            
                        });
                    }
                }, 200);
            });
        }
    }
}

module.exports = SelCharCommand;