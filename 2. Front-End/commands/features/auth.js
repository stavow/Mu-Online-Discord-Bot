const commando = require('discord.js-commando');
var sql = require('mssql');
var sqlite = require('sqlite3');
const essentials = require('../essentials');

class AuthCommand extends commando.Command
{
    constructor(client)
    {
        super(client,{
            name: 'auth',
            group: 'features',
            memberName: 'auth',
            description: 'Authenticate over a user'
        });
    }

    async run(message, args)
    {
        if(await message.channel.type != 'dm') return message.delete();
        if(await essentials.getInfo("AUTHCOMMAND") == "1") return message.channel.send(essentials.getDefaultMessage("commanddisabled"));
        if(args == "usage") return message.channel.send(essentials.getUsageInfo("auth"));

        //Variabels Declaration
        var username = args.split(" ")[0];
        var password = args.split(" ")[1];
        let accDB = new sqlite.Database('./db/mubotdata.db');
        let errOccurred = 0;
        var alreadyHasAuth = 0;
        let MEMBERSPASSWORDCOL = essentials.getInfo("MEMBERSPASSWORDCOL"), SCHEMA = essentials.getInfo("SCHEMA"), MEMBERSTABLE = essentials.getInfo("MEMBERSTABLE"),
            MEMBERSIDCOL = essentials.getInfo("MEMBERSIDCOL");

        //Declaring SQL Connection Variables
        var conn = new sql.ConnectionPool(dbConfig);
        var req = new sql.Request(conn);

        accDB.all(`SELECT * FROM accauth WHERE member_id='${username}'`, [], (err,rows) => {
            if(err) {errOccurred=1; console.log(err)}
            if(rows.length > 0 && rows[0].discord_id == message.author.id) {errOccurred=1; return message.channel.send(essentials.craftMessage("error", `You already authenticated this account`));}
            if(rows.length > 0) {errOccurred=1;return message.channel.send(essentials.craftMessage("error", `Someone else already authenticated this account`));}
        });

        setTimeout(function() {
            accDB.all(`SELECT * FROM accauth WHERE discord_id='${message.author.id}'`, [], (err,rows) => {
                if(err) {errOccurred=1; console.log(err)}
                if(rows.length > 0) {alreadyHasAuth=1}
            });
        }, 200)

        setTimeout(auth, 200);
        function auth(){
            if(errOccurred) return;
            conn.connect(function(err){
                if(err) {conn.close(); console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}

                req.query(`SELECT [${MEMBERSPASSWORDCOL}] FROM [${SCHEMA}].[${MEMBERSTABLE}] WHERE [${MEMBERSIDCOL}]='${username}'`, function(err,data){
                    if(err) {conn.close(); console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}

                    //Checking if user isn't found
                    if(data == undefined || data.recordset == undefined || data.rowsAffected.length < 1 || data.rowsAffected[0] == 0){
                        message.channel.send(essentials.craftMessage("error", "User not found or password is incorrect."));
                        conn.close()
                        return;
                    }
    
                    //Checking if password is incorrect
                    if(data.recordset[0][MEMBERSPASSWORDCOL] != password){
                        message.channel.send(essentials.craftMessage("error","User not found or password is incorrect."));
                        conn.close();
                        return;
                    }
                    conn.close();
    
                    //Username and password matched, Authenticating.
                    if(errOccurred) return;
                    if(alreadyHasAuth){
                        accDB.all(`UPDATE accauth SET member_id='${username}' WHERE '${message.author.id}'`, [], (err, rows) => {
                            if(err) {console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}
                        });
                        accDB.all(`DELETE FROM charsel WHERE discord_id='${message.author.id}'`, [], (err, rows) => {
                            if(err) {console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}
                            return message.channel.send(essentials.craftMessage("check", `Successfully authenticated your account`));
                        });
                    }
                    else{
                        accDB.all(`INSERT OR IGNORE INTO accauth(member_id, discord_id) VALUES('${username}', '${message.author.id}')`, [], (err, rows) => {
                            if(err) {console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}
                        });
                        accDB.all(`DELETE FROM charsel WHERE discord_id='${message.author.id}'`, [], (err, rows) => {
                            if(err) {console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}
                            return message.channel.send(essentials.craftMessage("check", `Successfully authenticated your account`));
                        });
                    } 
                });
            });
        } 
    }
}

module.exports = AuthCommand;