const discordJSTypes = require('discord.js')
const { MessageActionRow, MessageButton } = require('discord.js')

var RoleGroup = require('../../../schema/RoleGroup.js')

/**
 *
 * @param {discordJSTypes.CommandInteraction} interaction
 */
async function announceroles(interaction) {
    var group = interaction.options.getString('group')
    var channel = interaction.options.getChannel('channel')
    var message = interaction.options.getString('message')
    var mongoGroup = await RoleGroup.findOne({ serverID: interaction.guild.id, groupName: group })
    if (!mongoGroup) {
        interaction.editReply({ content: 'This group does not exist' })
        return
    } else {
        try {


            if (!mongoGroup.assignable) {
                await interaction.editReply({ ephemeral: true, content: "These roles aren't selfassignable, toggle them before you post." })
                return
            }
            var row = new MessageActionRow()
            var components = []
            for (var i = 0; i < mongoGroup.roleIDs.length; i++) {
                if (i > 24) {
                    break
                }
                //$ this is the line that is different between the two
                var discordRole = await interaction.guild.roles.fetch(mongoGroup.roleIDs[i])
                if (!discordRole) {
                    await RoleGroup.findOneAndUpdate({ serverID: interaction.guild.id, groupName: group }, { $pull: { roleIDs: mongoGroup.roleIDs[i] } })
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

            
            await channel.send({ content: message ? message : mongoGroup.groupName, components: components })
        } catch (e) {
            console.log(e)
            interaction.editReply({ content: 'I do not have permission to post to that channel' })
            return
        }

        interaction.editReply({ content: `Posted role message to <#${channel.id}>` })

        
    }
    //TODO: add group toggle
}

module.exports = announceroles
