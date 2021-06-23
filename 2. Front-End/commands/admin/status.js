const commando = require('discord.js-commando')
var sql = require('mssql');
var essentials = require('../essentials');
const IP = "127.0.0.1";
const PORT = 59000;
const Discord = require('discord.js');
var net = require('net');
var sqlite = require('sqlite3');

class StatusCommand extends commando.Command
{
    constructor(client)
    {
        super(client,{
            name: 'status',
            group: 'admin',
            memberName: 'status',
            description: 'Status Test'
        });
    }

    async run(message, args)
    {
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

       message.channel.send(essentials.craftMessage("info", "Please wait...")).then(msg => msg.delete(2000));
       let internalDB = new sqlite.Database('./db/mubotdata.db');

       const bot = this.client;

       const onlineEmoji = essentials.getInfo("ONLINEEMOJI");
       const offlineEmoji = essentials.getInfo("OFFLINEEMOJI");

       const ONLINE = 1;
       const OFFLINE = 0;

       var sqlConnection = OFFLINE;
       var gameServerConnection = ONLINE;
       var internalDatabaseConnection = OFFLINE;

       var sqlConnectionEmoji = offlineEmoji;
       var gameServerConnectionEmoji = onlineEmoji;
       var internalDatabaseConnectionEmoji = offlineEmoji;

        //Declaring SQL Connection Variables
        var conn = new sql.ConnectionPool(dbConfig);

        var client = new net.Socket();
        client.connect(PORT, IP, function() {
            console.log(`[StatusCommandExecuted] Connection opened`);
            client.write(`test;!disconnect test x`, 'utf8');
            client.destroy();
        });
        client.on('close', function() {
            console.log(`[StatusCommandExecuted] Connection closed`);
            sqlCheck();
        });
        client.on('error', function(err) {
            if(err){
                gameServerConnection = OFFLINE;
                gameServerConnectionEmoji = offlineEmoji;  
            }
        });

        function sqlCheck(){
            conn.connect(function(err) {
                if(err) {
                    console.log(err);
                }
                else {
                    sqlConnection = ONLINE;
                    sqlConnectionEmoji = onlineEmoji; 
                }
                conn.close();
            });
            setTimeout(gsCheck, 500);
        }
             
        function gsCheck(){

            setTimeout(internalCheck, 500);
        }

        function internalCheck(){
            internalDB.all(`SELECT * FROM xp;`, [], (err, r) => {
                if(err){
                    console.log(err);
                }
                else{
                    internalDatabaseConnection = ONLINE;
                    internalDatabaseConnectionEmoji = onlineEmoji;
                }
            });
            setTimeout(embedBuild, 500);
        }
        
        function embedBuild(){
            const serverImage = new Discord.Attachment(essentials.getInfo("ServerLogo"), `logo.png`);
            let statusEmbed = new Discord.RichEmbed();
            statusEmbed.attachFile(serverImage);
            statusEmbed.setThumbnail('attachment://logo.png');
            statusEmbed.setAuthor(`${bot.user.username}`, bot.user.avatarURL);
            statusEmbed.setColor(`PURPLE`)
            statusEmbed.setFooter(`${essentials.getInfo("ServerName")}`);
            statusEmbed.setTimestamp()
            statusEmbed.setDescription(`If something appears offline, check configuration.`);
            statusEmbed.addField(`SQL`, sqlConnectionEmoji, true);
            statusEmbed.addField(`GAMESERVER`, gameServerConnectionEmoji, true);
            statusEmbed.addField(`INTERNAL`, internalDatabaseConnectionEmoji, true);
            message.channel.send(statusEmbed);
        }

        
    }
}

module.exports = StatusCommand;