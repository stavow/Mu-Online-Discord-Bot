const fs = require('fs');
const ini = require('ini');
const IP = "127.0.0.1";
const PORT = 59000;
var net = require('net');
const Discord = require('discord.js');

module.exports = {
    getMods: function getMods(){
        var config = ini.parse(fs.readFileSync('config.ini', 'utf-8'));
        var modRoles = [];
        try {
            modRoles = config.Discord.ModerationRoles.slice(1, -1).split(', ');
            for(var i = 0; i < modRoles.length; i++){
                modRoles[i] = modRoles[i].replace(`'`, '');
                modRoles[i] = modRoles[i].replace(`'`, '');
            }
        }
        catch(err){
            console.log(err);
            return;
        }
    
        return modRoles;
    },

    getHighMods: function getHighMods(){
        var config = ini.parse(fs.readFileSync('config.ini', 'utf-8'));
        var modRoles = [];
        try {
            modRoles = config.Discord.DiscordHighModerationRoles.slice(1, -1).split(', ');
            for(var i = 0; i < modRoles.length; i++){
                modRoles[i] = modRoles[i].replace(`'`, '');
                modRoles[i] = modRoles[i].replace(`'`, '');
            }
        }
        catch(err){
            console.log(err);
            return;
        }
    
        return modRoles;
    },

    generateXP: function generateXP(){
        return Math.floor(Math.random() * (25 - 15) + 15)
    },

    getMathEvent: function getMathEvent(){
        var config = ini.parse(fs.readFileSync('config.ini', 'utf-8'));
        var mathEventQ = [];
        var mathEventA = [];
        var minPrize = parseInt(config.DiscordEvents.AutoMathEventRewards.slice(1, -1).split(', ')[0]);
        var maxPrize = parseInt(config.DiscordEvents.AutoMathEventRewards.slice(1, -1).split(', ')[1]);

        try {
            mathEventQ = config.DiscordEvents.AutoMathEvent.slice(1, -1).split(', ');
            for(var i = 0; i < mathEventQ.length; i++){
                mathEventQ[i] = mathEventQ[i].replace(`'`, '');
                mathEventQ[i] = mathEventQ[i].replace(`'`, '');
            }

            mathEventA = config.DiscordEvents.AutoMathEventAnswers.slice(1, -1).split(', ');
            for(var i = 0; i < mathEventA.length; i++){
                mathEventA[i] = mathEventA[i].replace(`'`, '');
                mathEventA[i] = mathEventA[i].replace(`'`, '');
            }
        }
        catch(err){
            console.log(err);
            return;
        }

        var randomNum = Math.floor(Math.random() * mathEventQ.length);
        var prize = Math.floor(Math.random() * (maxPrize - minPrize + 1)) + minPrize;
        var mathEventQA = [mathEventQ[randomNum], mathEventA[randomNum], prize]; 
        return mathEventQA;
    },

    getCurrency: function getCurrency(){
        var config = ini.parse(fs.readFileSync('config.ini', 'utf-8'));
        return config.Discord.CurrencyName;
    },
    
    getEventsChannel: function getEventsChannel(){
        var config = ini.parse(fs.readFileSync('config.ini', 'utf-8'));
        return config.DiscordEvents.EventsChannel;
    },

    getCategories: function getCategories(){
        var config = ini.parse(fs.readFileSync('config.ini', 'utf-8'));
        var categories = [];

        categories = config.DiscordShop.Categories.slice(1, -1).split(', ');
        for(var i = 0; i < categories.length; i++){
            categories[i] = categories[i].replace(`'`, '');
            categories[i] = categories[i].replace(`'`, '');
        }

        return categories;
    },

    switchCommand: function switchCommand(name){
        var cond = new RegExp("^[A-Za-z0-9]+$");
        if(!cond.test(name) || name == "" || name == undefined || name.length > 10 || name.length < 4) return;
        var client = new net.Socket();
        client.connect(PORT, IP, function() {
            console.log(`[${name}] Sending switch request to the game server...`);
            client.write(`${name};!switch ${name}`, 'utf8');
            client.destroy();
        });
        client.on('close', function() {
            console.log('Connection closed');
        });
        client.on('error', function(err) {
            return console.log(err);
        });
    },

    serverListCommand: function serverListCommand(name){
        var cond = new RegExp("^[A-Za-z0-9]+$");
        if(!cond.test(name) || name == "" || name == undefined || name.length > 10 || name.length < 4) return;
        var client = new net.Socket();
        client.connect(PORT, IP, function() {
            console.log(`[${name}] Sending server list request to the game server...`);
            client.write(`${name};!serverlist ${name}`, 'utf8');
            client.destroy();
        });
        client.on('close', function() {
            console.log('Connection closed');
        });
        client.on('error', function(err) {
            return console.log(err);
        });
    },

    disconnectCommand: function disconnectCommand(name){
        var cond = new RegExp("^[A-Za-z0-9]+$");
        if(!cond.test(name) || name == "" || name == undefined || name.length > 10 || name.length < 4) return;
        var client = new net.Socket();
        client.connect(PORT, IP, function() {
            console.log(`[${name}] Sending account disconnect request to the game server...`);
            client.write(`${name};!disconnectacc ${name} x`, 'utf8');
            client.destroy();
        });
        client.on('close', function() {
            console.log(`[${name}] Connection closed`);
        });
        client.on('error', function(err) {
            return console.log(err);
        });
    },

    disconnectAccountCommand: function disconnectAccountCommand(name){
        var cond = new RegExp("^[A-Za-z0-9]+$");
        if(!cond.test(name) || name == "" || name == undefined || name.length > 10 || name.length < 4) return;
        var client = new net.Socket();
        client.connect(PORT, IP, function() {
            console.log(`[${name}] Sending account disconnect request to the game server...`);
            client.write(`${name};!disconnectacc ${name} x`, 'utf8');
            client.destroy();
        });
        client.on('close', function() {
            console.log(`[${name}] Connection closed`);
        });
        client.on('error', function(err) {
            return console.log(err);
        });
    },

    craftMessage: function craftMessage(type, m){
        var craftedMessage = new Discord.RichEmbed();
        switch(type) {
            case "error":
                craftedMessage.setDescription(`<:Error:740603661960609823> ${m}`);
                craftedMessage.setColor("#fc0404");
                return craftedMessage;
            case "info":
                craftedMessage.setDescription(`<:Information:740603662178582610> ${m}`);
                craftedMessage.setColor("#0474fc");
                return craftedMessage;
            case "warning":
                craftedMessage.setDescription(`<:Warning:740603662291959944> ${m}`);
                craftedMessage.setColor("#fce40c");
                return craftedMessage;
            case "check":
                craftedMessage.setDescription(`<:Check:740603661507363026> ${m}`);
                craftedMessage.setColor("#24ac24");
                return craftedMessage;
        }
    },

    getDefaultMessage: function getDefaultMessage(type){
        var defaultMessage = new Discord.RichEmbed();
        switch(type){
            case "error":
                defaultMessage.setDescription(`<:Error:740603661960609823> Error occurred, please contact staff.`);
                defaultMessage.setColor("#fc0404");
                return defaultMessage;
            case "wrongusage":
                defaultMessage.setDescription('<:Error:740603661960609823> Wrong usage. Type `![command] usage` to get the correct usage.');
                defaultMessage.setColor("#fc0404");
                return defaultMessage;
            case "nomurderer":
                defaultMessage.setDescription(`<:Error:740603661960609823> Your character isn't a murderer.`);
                defaultMessage.setColor("#fc0404");
                return defaultMessage;
            case "nocharacter":
                defaultMessage.setDescription(`<:Error:740603661960609823> Character isn't given.`);
                defaultMessage.setColor("#fc0404");
                return defaultMessage;
            case "characternoexist":
                defaultMessage.setDescription(`<:Error:740603661960609823> Character doesn't exist.`);
                defaultMessage.setColor("#fc0404");
                return defaultMessage;
            case "noselectedcharacter":
                defaultMessage.setDescription(`<:Error:740603661960609823> You haven't selected a character yet\nUse: !selchar [charname] to select a character\nMake sure you authenticated the account that belong to this character`);
                defaultMessage.setColor("#fc0404");
                return defaultMessage;
            case "commanddisabled":
                defaultMessage.setDescription(`<:Error:740603661960609823> This command is is temporarily disabled.`);
                defaultMessage.setColor("#fc0404");
                return defaultMessage;
            case "characternomoney":
                defaultMessage.setDescription(`<:Error:740603661960609823> Your character doesn't have enough money to perform this action.`);
                defaultMessage.setColor("#fc0404");
                return defaultMessage;
            case "noperms":
                defaultMessage.setDescription(`<:Error:740603661960609823> Insufficient permissions.`);
                defaultMessage.setColor("#fc0404");
                return defaultMessage;
        }
    },

    getUsageInfo: function getUsageInfo(cmd){
        var usageInfo = new Discord.RichEmbed();
        switch(cmd){
            case "addbal":
                usageInfo.setDescription('<:Information:740603662178582610> `!addbal [@user] [amount]`\nExample: `!addbal @OnLyWiN 500`');
                usageInfo.setColor("#0474fc");
                return usageInfo;
            case "additem":
                usageInfo.setDescription('<:Information:740603662178582610> `!additem [category] [name] [price] [item_group] [item_index] [item_level] [skill] [luck] [option] [exc] [ancient] [periodtime] [socketslot] [socketbonus] [muunevoitemcat] [muunevoitemindex]`');
                usageInfo.setColor("#0474fc");
                return usageInfo;
            case "adminadd":
                usageInfo.setDescription('<:Information:740603662178582610> `!adminadd [character] [stat (Types: str | agi | vit | ene | cmd)] [amount]`\nExample: `!adminadd OnLyWiN str 500`');
                usageInfo.setColor("#0474fc");
                return usageInfo;
            case "banacc":
                usageInfo.setDescription('<:Information:740603662178582610> `!banacc [account]`\nExample: `!banacc stav`');
                usageInfo.setColor("#0474fc"); 
                return usageInfo;  
            case "banchar":
                usageInfo.setDescription('<:Information:740603662178582610> `!banchar [character]`\nExample: `!banchar OnLyWiN`');
                usageInfo.setColor("#0474fc"); 
                return usageInfo;  
            case "crewedit":
                usageInfo.setDescription('<:Information:740603662178582610> `!crewedit [mode (add - 1, remove - 0)], [character], [account], [role], [priority (lower priority - higher in the list)]`\nExample for adding: `!crewedit 1, OnLyWiN, onlywinAccount, Owner, 0`\nExample for removing: `!crewedit 0 OnLyWiN`');
                usageInfo.setColor("#0474fc");  
                return usageInfo; 
            case "dc":
                usageInfo.setDescription('<:Information:740603662178582610> `!dc [character]`\nExample: `!dc OnLyWiN`');
                usageInfo.setColor("#0474fc");
                return usageInfo;
            case "dcacc":
                usageInfo.setDescription('<:Information:740603662178582610> `!dcacc [account]`\nExample: `!dc stav`');
                usageInfo.setColor("#0474fc");
                return usageInfo;
            case "edititem":
                usageInfo.setDescription('<:Information:740603662178582610> `!edititem [id=num], [col=val], [col=val]`\nExample: `!edititem id=5, price=50, Name=Item Name, item_index=5`');
                usageInfo.setColor("#0474fc");
                return usageInfo;
            case "forcemarry":
                usageInfo.setDescription('<:Information:740603662178582610> `!forcemarry [character] [marry]`\nExample: `!forcemarry DriveBall ASAP`');
                usageInfo.setColor("#0474fc");
                return usageInfo;
            case "isonline":
                usageInfo.setDescription('<:Information:740603662178582610> `!isonline [char/acc (char - for character check, acc for account check)] [character/account name]`\nExample for character check: `!isonline char OnLyWiN\nExample for account check: `!isonline acc stav`')
                usageInfo.setColor("#0474fc");
                return usageInfo;
                case "notice":
                usageInfo.setDescription('<:Information:740603662178582610> `!notice [message]`\nExample: `!notice OnLyWiN is da best`');
                usageInfo.setColor("#0474fc");
                return usageInfo;
            case "removeitem":
                usageInfo.setDescription('<:Information:740603662178582610> `!removeitem [itemid]`\nExample `!removeitem 1`');
                usageInfo.setColor("#0474fc");
                return usageInfo;
            case "setbal":
                usageInfo.setDescription('<:Information:740603662178582610> `!setbal [@user] [amount]`\nExample: `!setbal @A$AP 9999999`');
                usageInfo.setColor("#0474fc");
                return usageInfo;
            case "setclass":
                usageInfo.setDescription('<:Information:740603662178582610> `!setclass [character] [class code (dk / sm / sr...)]`\nExample: `!setclass OnLyWiN rf`\nExplanation: Setting character OnLyWiN class to Rage Fighter');
                usageInfo.setColor("#0474fc");
                return usageInfo;
            case "setfull":
                usageInfo.setDescription('<:Information:740603662178582610> `!setfull [character]`\nExample: `!setfull OnLyWiN`');
                usageInfo.setColor("#0474fc");
                return usageInfo;
            case "setlevel":
                usageInfo.setDescription('<:Information:740603662178582610> `!setlevel [character] [level]`\nExample: `!setlevel OnLyWiN 400`');
                usageInfo.setColor("#0474fc");
                return usageInfo;
            case "setmoney":
                usageInfo.setDescription('<:Information:740603662178582610> `!setmoney [character] [amount (-1 for maximum)]`\nExample: `!setmoney OnLyWiN -1`');
                usageInfo.setColor("#0474fc");
                return usageInfo;
            case "setnick":
                usageInfo.setDescription('<:Information:740603662178582610> `!setnick [character] [new nick]`\nExample: `!setnick Royal DriveBall`');
                usageInfo.setColor("#0474fc");
                return usageInfo;
            case "setpklevel":
                usageInfo.setDescription('<:Information:740603662178582610> `!setpklevel [character] [pklevel]`\nExample: `!setpklevel OnLyWiN 0`');
                usageInfo.setColor("#0474fc");
                return usageInfo;
            case "setpoints":
                usageInfo.setDescription('<:Information:740603662178582610> `!setpoints [character] [stat (Types: str | agi | vit | ene | cmd)] [amount]`\nExample: `!setpoints OnLyWiN agi 5000`');
                usageInfo.setColor("#0474fc");
                return usageInfo;
            case "setresets":
                usageInfo.setDescription('<:Information:740603662178582610> `!setresets [character] [amount]`\nExample: `!setresets OnLyWiN 30`');
                usageInfo.setColor("#0474fc");
                return usageInfo;
            case "switch":
                usageInfo.setDescription('<:Information:740603662178582610> `!switch [character]`\nExample: `!switch OnLyWiN`');
                usageInfo.setColor("#0474fc");
                return usageInfo;
            case "unbanacc":
                usageInfo.setDescription('<:Information:740603662178582610> `!unbanacc [account]`\nExample: `!unbanacc stav`');
                usageInfo.setColor("#0474fc");
                return usageInfo;
            case "unbanchar":
                usageInfo.setDescription('<:Information:740603662178582610> `!unbanchar [character]`\nExample: `!unbanchar OnLyWiN`');
                usageInfo.setColor("#0474fc");
                return usageInfo;
            case "autotransfer":
                usageInfo.setDescription('<:Information:740603662178582610> `!autotransfer [account] [@user] [description (optional)]`\nExample: `!autotransfer stav @A$AP Trading account for Great Dragon Set`');
                usageInfo.setColor("#0474fc");
                return usageInfo;
            case "cancel":
                usageInfo.setDescription('<:Information:740603662178582610> `!cancel`\nExample: `!cancel`');
                usageInfo.setColor("#0474fc");
                return usageInfo;
            case "confirm":
                usageInfo.setDescription('<:Information:740603662178582610> `!confirm`\nExample: `!confirm`');
                usageInfo.setColor("#0474fc");
                return usageInfo;
            case "add":
                usageInfo.setDescription('<:Information:740603662178582610> `!add [stat (Types: str | agi | vit | ene | cmd)] [amount]`\nExample: `!add ene 500`');
                usageInfo.setColor("#0474fc");
                return usageInfo;
            case "auth":
                usageInfo.setDescription('<:Information:740603662178582610> `!auth [account] [password]`\nExample: `!auth OnLyWiN mipass`\nUSE ONLY ON DM`');
                usageInfo.setColor("#0474fc");
                return usageInfo;
            case "balance":
                usageInfo.setDescription('<:Information:740603662178582610> `!bal`\nExample:`!bal`');
                usageInfo.setColor("#0474fc");
                return usageInfo;
            case "buyitem":
                usageInfo.setDescription('<:Information:740603662178582610> `!buyitem [itemid]`\nExample: `!buyitem 4`\nUSE ONLY IF CONNECTED TO SELECTED CHARACTER');
                usageInfo.setColor("#0474fc");
                return usageInfo;
            case "crew":
                usageInfo.setDescription('<:Information:740603662178582610> `!crew`\nExample: `!crew`');
                usageInfo.setColor("#0474fc");
                return usageInfo;
            case "deauth":
                usageInfo.setDescription('<:Information:740603662178582610> `!deauth`\nExample: `!deauth`');
                usageInfo.setColor("#0474fc");
                return usageInfo;
            case "info":
                usageInfo.setDescription('<:Information:740603662178582610> `!info [character]`\nExample: `!info OnLyWiN`');
                usageInfo.setColor("#0474fc");
                return usageInfo;
            case "iteminfo":
                usageInfo.setDescription('<:Information:740603662178582610> `!iteminfo [itemid]`\nExample: `!iteminfo 4`');
                usageInfo.setColor("#0474fc");
                return usageInfo;
            case "marry":
                usageInfo.setDescription('<:Information:740603662178582610> `!marry [character]`\nExample: `!marry madisonbeer`');
                usageInfo.setColor("#0474fc");
                return usageInfo;
            case "pay":
                usageInfo.setDescription('<:Information:740603662178582610> `!pay [@user] [amount]`\nExample: `!pay @A$AP 1`');
                usageInfo.setColor("#0474fc");
                return usageInfo;
            case "pkclear":
                usageInfo.setDescription('<:Information:740603662178582610> `!pkclear`\nExample: `!pkclear`');
                usageInfo.setColor("#0474fc");
                return usageInfo;
            case "post":
                usageInfo.setDescription('<:Information:740603662178582610> `!post [message]`\nExample: `!post its yaboy`');
                usageInfo.setColor("#0474fc");
                return usageInfo;
            case "reset":
                usageInfo.setDescription('<:Information:740603662178582610> `!reset`\nExample: `!reset`');
                usageInfo.setColor("#0474fc");
                return usageInfo;
            case "selchar":
                usageInfo.setDescription('<:Information:740603662178582610> `!selchar [character]`\nExample: `!selchar OnLyWiN`\nYou have to authenticate the character account before.');
                usageInfo.setColor("#0474fc");
                return usageInfo;
            case "shop":
                usageInfo.setDescription('<:Information:740603662178582610> `!shop [category number (optional)]`\nExample: `!shop`\nExample: `!shop 5`');
                usageInfo.setColor("#0474fc");
                return usageInfo;
            case "topreset":
                usageInfo.setDescription('<:Information:740603662178582610> `!topreset`\nExample: `!topreset`');
                usageInfo.setColor("#0474fc");
                return usageInfo;
                
        }
    },

    getInfo: function getInfo(whatInfo){
        var config = ini.parse(fs.readFileSync('config.ini', 'utf-8'));

        switch (whatInfo){
            case "SQLSERVER":
                return config.SQL.Server;
            case "SQLDATABASE":
                return config.SQL.Database;
            case "SQLUSER":
                return config.SQL.User;
            case "SQLPASS":
                return config.SQL.Password;
            case "SQLPORT":
                return config.SQL.Port;
            case "SCHEMA":
                return config.Tables.Schema;
            case "MEMBERSTABLE":
                return config.Tables.Members;
            case "STATSTABLE":
                return config.Tables.Stats;
            case "ACCOUNTSTABLE":
                return config.Tables.Accounts;
            case "CHARACTERSTABLE":
                return config.Tables.Characters;
            case "MEMBERSIDCOL":
                return config.Members.MembersID;
            case "MEMBERSPASSWORDCOL":
                return config.Members.MembersPassword;
            case "MEMBERSNAMECOL":
                return config.Members.MembersName;
            case "MEMBERSPHONECOL":
                return config.Members.MembersPhone;
            case "MEMBERSMAIL":
                return config.Members.MembersMail;
            case "STATSMEMBERIDCOL":
                return config.Stats.StatsMembersID;
            case "CONNECTSTATCOL":
                return config.Stats.ConnectionStatus;
            case "ACCOUNTIDCOL":
                return config.Character.AccountID;
            case "STRCOL":
                return config.Character.Strength;
            case "DEXCOL":
                return config.Character.Dexterity;
            case "VITCOL":
                return config.Character.Vitality;
            case "ENECOL":
                return config.Character.Energy;
            case "COMCOL":
                return config.Character.Command;
            case "RESETSCOL":
                return config.Character.Resets;
            case "MONEYCOL":
                return config.Character.Money;
            case "CLASSCOL":
                return config.Character.Class;
            case "NAMECOL":
                return config.Character.CName;
            case "CTLCODECOL":
                return config.Character.CtlCode;
            case "LEVELCOL":
                return config.Character.CLevel;
            case "MAPNUMBERCOL":
                return config.Character.MapNumber;
            case "MAPXCOL":
                return config.Character.MapX;
            case "MAPYCOL":
                return config.Character.MapY;
            case "PKLEVELCOL":
                return config.Character.PkLevel;
            case "PKCOUNTCOL":
                return config.Character.PkCount;
            case "MARRIEDCOL":
                return config.Character.Married;
            case "MARRYNAMECOL":
                return config.Character.MarryName;
            case "LEVELUPPOINTCOL":
                return config.Character.LevelUpPoints;
            case "ServerName":
                return config.Information.ServName;
            case "ServerIP":
                return config.Information.IP;
            case "SiteDomain":
                return config.Information.SiteDomain;
            case "ServerLogo":
                return config.Information.ServerImage;
            case "PKCLEARCOST":
                return config.Information.PkClearCost;
            case "PKFIRSTMURDERERLEVEL":
                return config.Information.PkFirstMurderer;
            case "PKFIRSTHEROLEVEL":
                return config.Information.PkFirstHero;
            case "RESETLEVEL":
                return config.Information.ResetLevel;
            case "FULLSTAT":
                return config.Information.FullStat;
            case "PREFIX":
                return config.Information.Prefix;
            case "PKTOPHERO":
                return config.Information.PkTopHero;
            case "PKTOPMURDERER":
                return config.Information.PkTopMurderer;
            case "MAXMESSAGELENGTH":
                return config.Information.MaxMessageLength;
            case "COMMANDSCHANNEL":
                return config.Discord.CommandsChannel;
            case "ADMINCOMMANDSCHANNEL":
                return config.Discord.AdminCommandsChannel;
            case "COMMUNICATIONCHANNEL":
                return config.Discord.CommunicationChannel;
            case "LEVELUPCHANNEL":
                return config.Discord.LevelUpChannel;
            case "SPAMCHANNEL":
                return config.Discord.SpamChannel;
            case "AUTOTRANSFERCATEGORY":
                return config.Discord.AutoTransferCategory;
            case "AUTOTRANSFERINSTRUCTIONSCHANNEL":
                return config.Discord.AutoTransferInstructionsChannel;
            case "SERVEREMOJI":
                return config.DiscordEmojis.ServerEmoji;
            case "KNIGHTEMOJI":
                return config.DiscordEmojis.KnightEmoji;
            case "ELFEMOJI":
                return config.DiscordEmojis.ElfEmoji;
            case "WIZARDEMOJI":
                return config.DiscordEmojis.WizardEmoji;
            case "LORDEMOJI":
                return config.DiscordEmojis.LordEmoji;
            case "GLADIATOREMOJI":
                return config.DiscordEmojis.GladiatorEmoji;
            case "RFEMOJI":
                return config.DiscordEmojis.RageFighterEmoji;
            case "SUMMONEREMOJI":
                return config.DiscordEmojis.SummonerEmoji;
            case "ONLINEEMOJI":
                return config.DiscordEmojis.OnlineEmoji;
            case "OFFLINEEMOJI":
                return config.DiscordEmojis.OfflineEmoji;
            case "ADDBALANCECOMMAND":
                return config.DisableCommands.AddBalanceCommand;
            case "ADDITEMCOMMAND":
                return config.DisableCommands.AddItemCommand;
            case "ADMINADDCOMMAND":
                return config.DisableCommands.AdminAddCommand;
            case "BANACCCOMMAND":
                return config.DisableCommands.BanAccCommand;
            case "BANCHARCOMMAND":
                return config.DisableCommands.BanCharCommand;
            case "CREWEDITCOMMAND":
                return config.DisableCommands.CrewEditCommand;
            case "DCCOMMAND":
                return config.DisableCommands.DCCommand;
            case "DCACCCOMMAND":
                return config.DisableCommands.DCAccCommand;
            case "EDITITEMCOMMAND":
                return config.DisableCommands.EditItemCommand;
            case "FORCEMARRYCOMMAND":
                return config.DisableCommands.ForceMarryCommand;
            case "ISONLINECOMMAND":
                return config.DisableCommands.IsOnline;
            case "NOTICECOMMAND":
                return config.DisableCommands.NoticeCommand;
            case "REMOVEITEMCOMMAND":
                return config.DisableCommands.RemoveItemCommand;
            case "SETBALANCECOMMAND":
                return config.DisableCommands.SetBalanceCommand;
            case "SETCLASSCOMMAND":
                return config.DisableCommands.SetClassCommand;
            case "SETFULLCOMMAND":
                return config.DisableCommands.SetFullCommand;
            case "SETLEVELCOMMAND":
                return config.DisableCommands.SetLevelCommand;
            case "SETMONEYCOMMAND":
                return config.DisableCommands.SetMoneyCommand;
            case "SETNICKCOMMAND":
                return config.DisableCommands.SetNickCommand;
            case "SETPKLEVELCOMMAND":
                return config.DisableCommands.SetPKLevelCommand;
            case "SETPOINTSCOMMAND":
                return config.DisableCommands.SetPointsCommand;
            case "SETRESETSCOMMAND":
                return config.DisableCommands.SetResetsCommand;
            case "SWITCHCOMMAND":
                return config.DisableCommands.SwitchCommand;
            case "UNBANACCCOMMAND":
                return config.DisableCommands.UnBanAccCommand;
            case "UNBANCHARCOMMAND":
                return config.DisableCommands.UnBanCharCommand;
            case "AUTOTRANSFERCOMMAND":
                return config.DisableCommands.AutoTransferCommand;
            case "CANCELCOMMAND":
                return config.DisableCommands.CancelCommamnd;
            case "CONFIRMCOMMAND":
                return config.DisableCommands.ConfirmCommand;
            case "FORCEMATHEVENTCOMMAND":
                return config.DisableCommands.ForceMathEventCommand;
            case "ADDCOMMAND":
                return config.DisableCommands.AddCommand;
            case "AUTHCOMMAND":
                return config.DisableCommands.AuthCommand;
            case "BALANCECOMMAND":
                return config.DisableCommands.BalanceCommand;
            case "BUYITEMCOMMAND":
                return config.DisableCommands.BuyItemCommand;
            case "CREWCOMMAND":
                return config.DisableCommands.CrewCommand;
            case "DEAUTHCOMMAND":
                return config.DisableCommands.DeAuthCommand;
            case "INFOCOMMAND":
                return config.DisableCommands.InfoCommand;
            case "ITEMINFOCOMMAND":
                return config.DisableCommands.ItemInfoCommand;
            case "MARRYCOMMAND":
                return config.DisableCommands.MarryCommand;
            case "PAYCOMMAND":
                return config.DisableCommands.PayCommand;
            case "PKCLEARCOMMAND":
                return config.DisableCommands.PKClearCommand;
            case "POSTCOMMAND":
                return config.DisableCommands.PostCommand;
            case "RESETCOMMAND":
                return config.DisableCommands.ResetCommand;
            case "SELCHARCOMMAND":
                return config.DisableCommands.SelCharCommand;
            case "SHOPCOMMAND":
                return config.DisableCommands.ShopCommand;
            case "TESTCOMMAND":
                return config.DisableCommands.TestCommand;
            case "TOPRESETCOMMAND":
                return config.DisableCommands.TopResetCommand;
        }
    },

    isValidColumn: function isValidColumn(col, val){
        switch(col){
            case "id":
                if(!isNaN(parseInt(val)) && val >= 0){
                    return [1, 'number'];
                }
                else{
                    return [2, 'Number'];
                }
            case "category":
                if(typeof val === 'string'){
                    return [1, 'string'];
                }
                else {
                    return [2, 'String'];
                }
            case "name":
                if(typeof val === 'string'){
                    return [1, 'string'];
                }
                else {
                    return [2, 'String'];
                }
            case "price":
                if(!isNaN(parseInt(val)) && val >= 0){
                    return [1, 'number'];
                }
                else{
                    return [2, 'Number'];
                }
            case "item_group":
                if(!isNaN(parseInt(val)) && val >= 0){
                    return [1, 'number'];
                }
                else{
                    return [2, 'Number'];
                }
            case "item_index":
                if(!isNaN(parseInt(val)) && val >= 0){
                    return [1, 'number'];
                }
                else{
                    return [2, 'Number'];
                }
            case "item_level":
                if(!isNaN(parseInt(val)) && val >= 0){
                    return [1, 'number'];
                }
                else{
                    return [2, 'Number'];
                }
            case "skill":
                if(!isNaN(parseInt(val)) && val >= 0){
                    return [1, 'number'];
                }
                else{
                    return [2, 'Number'];
                }
            case "luck":
                if(!isNaN(parseInt(val)) && val >= 0){
                    return [1, 'number'];
                }
                else{
                    return [2, 'Number'];
                }
            case "option":
                if(!isNaN(parseInt(val)) && val >= 0){
                    return [1, 'number'];
                }
                else{
                    return [2, 'Number'];
                }
            case "ancient":
                if(!isNaN(parseInt(val)) && val >= 0){
                    return [1, 'number'];
                }
                else{
                    return [2, 'Number'];
                }
            case "exc":
                if(!isNaN(parseInt(val)) && val >= 0){
                    return [1, 'number'];
                }
                else{
                    return [2, 'Number'];
                }
            case "periodtime":
                if(!isNaN(parseInt(val)) && val >= 0){
                    return [1, 'number'];
                }
                else{
                    return [2, 'Number'];
                }
            case "socketslot":
                if(!isNaN(parseInt(val)) && val >= 0){
                    return [1, 'number'];
                }
                else{
                    return [2, 'Number'];
                }
            case "socketbonus":
                if(!isNaN(parseInt(val)) && val >= 0){
                    return [1, 'number'];
                }
                else{
                    return [2, 'Number'];s
                }
            case "muunevoitemcat":
                if(!isNaN(parseInt(val)) && val >= 0){
                    return [1, 'number'];
                }
                else{
                    return [2, 'Number'];
                }
            case "muunevoitemindex":
                if(!isNaN(parseInt(val)) && val >= 0){
                    return [1, 'number'];
                }
                else{
                    return [2, 'Number'];
                }
            default:
                return [3, ''];
        }
    }
}
