const discordJSTypes = require('discord.js')

const { MessageActionRow, MessageButton } = require('discord.js')

var Role = require('../../schema/Role.js')
var Server = require('../../schema/Server.js')
var RoleGroup = require('../../schema/RoleGroup.js')

/**
 *
 * @param {discordJSTypes.CommandInteraction} interaction
 * @param {String} subCommandGroup
 * @param {String} subCommand
 */
async function command(interaction, subCommandGroup, subCommand) {
    var group = interaction.options.getString('group')

    if (!(await Server.exists({ serverID: interaction.guild.id, selfAssign: true }))) {
        await interaction.editReply({ ephemeral: true, content: "Sorry, but you can't get roles right now." })
        return
    }

    if (group) {
        var roles = await RoleGroup.findOne({ serverID: interaction.guild.id, groupName: group })

        if (!roles) {
            await interaction.editReply({ ephemeral: true, content: "That group doesn't exist. Make sure you input the correct name." })
            return
        }

        if (!roles.assignable) {
            await interaction.editReply({ ephemeral: true, content: "Sorry, but you can't get those right now." })
            return
        }
        var row = new MessageActionRow()
        var components = []
        for (var i = 0; i < roles.roleIDs.length; i++) {
            if (i > 24) {
                break
            }
            //$ this is the line that is different between the two
            var discordRole = await interaction.guild.roles.fetch(roles.roleIDs[i])
            if (!discordRole) {
                await RoleGroup.findOneAndUpdate({ serverID: interaction.guild.id, groupName: group }, { $pull: { roleIDs: roles.roleIDs[i] } })
                continue
            }
            if (i % 5 == 0 && i != 0) {
                components.push(row)
                row = new MessageActionRow()
            }

            
            var button = new MessageButton()
            button.setCustomId('roles_' + discordRole.id)
            button.setLabel(discordRole.name)
            button.setStyle('PRIMARY')
            row.addComponents(button)
        }
        components.push(row)
        await interaction.editReply({ ephemeral: true, content: 'Here are the roles you can get:', components: components })
    } else {
        var roles = await Role.find({ serverID: interaction.guild.id, assignable: true })
        if (roles.length > 0) {
            var row = new MessageActionRow()
            var components = []
            for (var i = 0; i < roles.length; i++) {
                if (i > 24) {
                    break
                }
                var discordRole = await interaction.guild.roles.fetch(roles[i].roleID)
                if (!discordRole) {
                    await Role.deleteOne({ serverID: interaction.guild.id, roleID:roles[i].roleID  })
                    continue
                }
                if (i % 5 == 0 && i != 0) {
                    components.push(row)
                    row = new MessageActionRow()
                }

                //$ this is the line that is different between the two
                
                var button = new MessageButton()
                button.setCustomId('roles_' + discordRole.id)
                button.setLabel(discordRole.name)
                button.setStyle('PRIMARY')
                row.addComponents(button)
            }
            components.push(row)
            await interaction.editReply({ ephemeral: true, content: 'Here are the roles you can get:', components: components })
        } else {
            await interaction.editReply({ ephemeral: true, content: 'There are no roles to assign, maybe check for a role group?' })
        }
    }
}

module.exports = command
