const commando = require('discord.js-commando')
var essentials = require('../essentials');
const Discord = require('discord.js');
const sqlite = require('sqlite3');
var sql = require('mssql');
const IP = "127.0.0.1";
const PORT = 59000;
var net = require('net');

class BuyItemCommand extends commando.Command
{
    constructor(client)
    {
        super(client,{
            name: 'buyitem',
            group: 'features',
            memberName: 'buyitem',
            description: 'Buy an item'
        });
    }

    async run(message, args)
    {
        if(await essentials.getInfo("BUYITEMCOMMAND") == "1") return message.channel.send(essentials.getDefaultMessage("commanddisabled"));
        if(await message.channel.id != essentials.getInfo("COMMANDSCHANNEL")) {message.delete();return;}
        if(args == "usage") return message.channel.send(essentials.getUsageInfo("buyitem"));

        let itemsDB = new sqlite.Database('./db/mubotdata.db');
        let filter = m => !m.author.bot;
        const collector = message.channel.createMessageCollector(filter, {time: 60000});
        let balance = 0;
        let char = ``;
        let acc = ``;
        var continueExc = true;
        let SCHEMA = essentials.getInfo("SCHEMA"), ACCOUNTIDCOL = essentials.getInfo("ACCOUNTIDCOL"), CHARACTERSTBL = essentials.getInfo("CHARACTERSTABLE"),
            NAMECOL = essentials.getInfo("NAMECOL"), STATSTBL = essentials.getInfo("STATSTABLE"), MEMBERSIDCOL = essentials.getInfo("MEMBERSIDCOL"),
            CONNECTSTATCOL = essentials.getInfo("CONNECTSTATCOL");

        //Declaring SQL Connection Variables
        var conn = new sql.ConnectionPool(dbConfig);
        var req = new sql.Request(conn);

        if(isNaN(parseInt(args))) return message.channel.send(essentials.craftMessage("error", `ID Isn't a number`));

        let balQuery = `SELECT amount FROM currency WHERE id='${message.author.id}'`;
        itemsDB.all(balQuery, [], (err, rows) => {
            if(err) {console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}

            balance = rows[0].amount;
        });

        setTimeout(function (){
            itemsDB.all(`SELECT char FROM charsel WHERE discord_id='${message.author.id}'`, [], (err, rows) => {
                if(err) {message.channel.send(essentials.getDefaultMessage("error"));return console.log(err)}
                if(rows.length < 1) return message.channel.send(essentials.craftMessage("error", `You haven't selected a character yet\nUse: !selchar [charname] to select a character\nMake sure you authenticated the account that belong to this character`));
                char = rows[0].char;
                checkReq();
            });    
        }, 100)

        function checkReq(){
            conn.connect(function(err){
                req.query(`SELECT ${ACCOUNTIDCOL} FROM [${SCHEMA}].[${CHARACTERSTBL}] WHERE ${NAMECOL}='${char}'`, function(err, data){
                    if(err) {conn.close(); continueExc = false; console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}
                    
                    if(data == undefined || data.recordset == undefined || data.rowsAffected.length < 1 || data.rowsAffected[0] == 0){
                        conn.close(); continueExc = false; return message.channel.send(essentials.getDefaultMessage("error"));
                    }
                    
                    acc = data.recordset[0][ACCOUNTIDCOL];
                    conn.close();

                    if(!continueExc) return;
                    else setTimeout(isConnected, 200);
                });
            }); 

            if(continueExc == false) return;

            function isConnected(){
                conn.connect(function(err){
                    req.query(`SELECT ${CONNECTSTATCOL} FROM [${SCHEMA}].[${STATSTBL}] WHERE ${MEMBERSIDCOL}='${acc}'`, function(err, data){
                        if(err) {conn.close(); continueExc = false; console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}
    
                        if(data == undefined || data.recordset == undefined || data.rowsAffected.length < 1 || data.rowsAffected[0] == 0){
                            conn.close(); continueExc = false; return message.channel.send(essentials.getDefaultMessage("error"));
                        }

                        if(data.recordset[0][CONNECTSTATCOL] != 1){
                            continueExc = false;
                            return message.channel.send(essentials.craftMessage("error", `The account associated with your selected character isn't online!`));
                        }
                        conn.close();
                    });

                    if(!continueExc){
                        return;
                    }
                    else{
                        setTimeout(checkAndBuy, 200);
                    }
                }); 
            }
        }

        function checkAndBuy(){
            let query = `SELECT * FROM items WHERE id=${parseInt(args)}`;
            itemsDB.all(query, [], (err, rows) => {
                if(err) {console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}

                if(rows.length < 1) return message.channel.send(essentials.craftMessage("error", `Item ID Number ${args} Doesn't exist.`));
                
                if(parseInt(rows[0].price) > balance) return message.channel.send(essentials.craftMessage("error", `You don't have enough ${essentials.getCurrency()}.`)); 

                if(!continueExc) return;

                if(rows[0].image != ''){
                    const attachment = new Discord.Attachment(rows[0].image, 'item.jpg');
                    let itemPreviewWithImage = new Discord.RichEmbed()
                    .attachFile(attachment)
                    .setTitle(rows[0].name)
                    .setColor("#0ac7db")
                    .setDescription(
                        `
                        **Item ID:** ${rows[0].id}
                        **Category:** ${rows[0].category}
                        **Price:** ${rows[0].price}
                        **Item Group:** ${rows[0].item_group}
                        **Item Index:** ${rows[0].item_index}
                        **Item Level:** ${rows[0].item_level}
                        **Skill:** ${rows[0].skill}
                        **Luck:** ${rows[0].luck}
                        **Option:** ${rows[0].option * 4}
                        **Exc:** ${rows[0].exc}
                        **Ancient:** ${rows[0].ancient}
                        **Period Time:** ${rows[0].periodtime}s
                        **Socket Slot:** ${rows[0].socketslot}
                        **Socket Bonus:** ${rows[0].socketbonus}
                        **MuunEvolutionItemCat:** ${rows[0].muunevoitemcat}
                        **MuunEvolutionItemIndex:** ${rows[0].muunevoitemindex}
                        `
                    )
                    .setThumbnail('attachment://item.jpg');
                    message.channel.send(itemPreviewWithImage);
                }
                else{
                    let itemPreviewNoImage = new Discord.RichEmbed()
                    .setTitle(rows[0].name)
                    .setColor("#0ac7db")
                    .setDescription(
                        `
                        **Item ID:** ${rows[0].id}
                        **Category:** ${rows[0].category}
                        **Price:** ${rows[0].price}
                        **Item Group:** ${rows[0].item_group}
                        **Item Index:** ${rows[0].item_index}
                        **Item Level:** ${rows[0].item_level}
                        **Skill:** ${rows[0].skill}
                        **Luck:** ${rows[0].luck}
                        **Option:** ${rows[0].option * 4}
                        **Exc:** ${rows[0].exc}
                        **Ancient:** ${rows[0].ancient}
                        **Period Time:** ${rows[0].periodtime}s
                        **Socket Slot:** ${rows[0].socketslot}
                        **Socket Bonus:** ${rows[0].socketbonus}
                        **MuunEvolutionItemCat:** ${rows[0].muunevoitemcat}
                        **MuunEvolutionItemIndex:** ${rows[0].muunevoitemindex}
                        `
                    )
                    message.channel.send(itemPreviewNoImage);
                }

                setTimeout(buyItem, 100);
               
                function buyItem(){
                    if(continueExc == false) return;
                    setTimeout(function(){
                        message.channel.send(essentials.craftMessage("warning", `Are you sure you want to buy this item?\nYou have to be online with ${char}\nThe item will be dropped on ${char}, so we recommend to isolate the character\nType **!yes** for confirmation.`));
                    }, 1000);
                    var alreadyAnswered = 0;
                    query = `UPDATE currency SET amount=${balance} - ${rows[0].price} WHERE id='${message.author.id}'`;
        
                    collector.on('collect', m=>{
                        if(m.content == '!yes' && m.author.id == message.author.id && alreadyAnswered == 0){
                            alreadyAnswered = 1;
                            itemsDB.all(query, [], (err, rows)=>{
                                if(err) console.log(err);
                            });

                            let command = `${char};!item `
                            command += rows[0].muunevoitemindex + " " + rows[0].muunevoitemcat + " " + rows[0].socketbonus + " " + rows[0].socketslot + " " + rows[0].periodtime + " " + rows[0].ancient + " " + rows[0].exc + " " + rows[0].option + " " + rows[0].luck + " " + rows[0].skill + " " + rows[0].item_level + " " + rows[0].item_index + " " + rows[0].item_group;
                            var client = new net.Socket();
                            client.connect(PORT, IP, function() {
                                console.log(`[${char}] Sending buy item request to the game server...`);
                                client.write(`${command}`, 'utf8');
                                client.destroy();
                            });
                            client.on('close', function() {
                                console.log('Connection closed');
                            });
                            client.on('error', function(err) {
                                console.log(err);
                            });
                            return message.channel.send(essentials.craftMessage("check", `Item bought successfully.`));
                        }
                    });
            
                    collector.on('end', collected=>{
                        if(collected.size == 0){
                            return message.channel.send(essentials.craftMessage("error", `<@${message.author.id}> You didn't answer in 60s`));
                        }
                    });
                }
            });
        }
        
    }
}

module.exports = BuyItemCommand;