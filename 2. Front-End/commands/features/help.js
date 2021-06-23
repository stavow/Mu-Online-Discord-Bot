const commando = require('discord.js-commando');
var sqlite = require('sqlite3');
const essentials = require('../essentials');
const Discord = require('discord.js');

class HelpCommand extends commando.Command
{
    constructor(client)
    {
        super(client,{
            name: 'help',
            group: 'features',
            memberName: 'help',
            description: 'Help Command'
        });
    }

    async run(message, args)
    {
        const serverImage = new Discord.Attachment(essentials.getInfo("ServerLogo"), `logo.png`);
        let helpEmbed = new Discord.RichEmbed();
        helpEmbed.attachFile(serverImage);
        helpEmbed.setThumbnail('attachment://logo.png');
        helpEmbed.setAuthor(`${this.client.user.username}`, this.client.user.avatarURL);
        helpEmbed.setColor(`RED`)
        helpEmbed.setFooter(`${essentials.getInfo("ServerName")}`);
        helpEmbed.setTimestamp()
        helpEmbed.setDescription(`For any bug reports, report to my creator, <@260132199129415680>.`);

        if(args == "" || args == undefined){
            helpEmbed.setTitle(`${essentials.getInfo("ServerName")}`);
            helpEmbed.addField(`Player Command List`, `!help cmds`);
            helpEmbed.addField(`Admin Command List`, `!help admincmds`);
            helpEmbed.addField(`Auto Transfer Command List`, `!help at`);
            helpEmbed.addField(`Command Information`, `![command] usage`);
        }
        else if (args == "cmds"){
            helpEmbed.setTitle(`Commands`);
            helpEmbed.addField(`MU Actions Commands`, '`!add`|`!auth`|`!deauth`|`!marry`|`!pkclear`|`!post`|`!reset`|`!selchar`');
            helpEmbed.addField(`MU Information Commands`, '`!crew`|`!info`|`!topreset`');
            helpEmbed.addField(`Economy System Commands`, '`!bal`|`!buyitem`|`!iteminfo`|`!shop`|`!pay`');
        }
        else if (args == "admincmds"){
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
            helpEmbed.setTitle(`Admin Commands`);
            helpEmbed.addField(`MU Actions Commands`, '`!adminadd`|`!banacc`|`!banchar`|`!dc`|`!dcacc`|`!forcemarry`|`!notice`|`!setclass`|`!setfull`|`!setlevel`|`!setmoney`|`!setnick`\n`!setpklevel`|`!setpoints`|`!setresets`|`!switch`|`unbanchar`|`!unbanacc`');
            helpEmbed.addField(`MU Information Commands`, '`!crewedit`|`!isonline`');
            helpEmbed.addField(`Economy System Commands`, '`!addbal`|`!additem`|`!removeitem`|`!edititem`|`!setbal`');
        }
        else if (args == "at"){
            helpEmbed.setTitle(`Auto Transfer Commands`);
            helpEmbed.addField(`Commands`, '`!autotranfer`|`!confirm`|`!cancel`');
            helpEmbed.addField(`Admin Restricted`, '`!finish cancel`');
        }

        message.channel.send(helpEmbed);
    }
}

module.exports = HelpCommand;