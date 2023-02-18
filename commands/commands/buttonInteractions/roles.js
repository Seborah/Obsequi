const discordJSTypes = require('discord.js')

const { MessageActionRow, MessageButton } = require('discord.js')

var Role = require('../../schema/Role.js')
var Server = require('../../schema/Server.js')
var RoleGroup = require('../../schema/RoleGroup.js')

/**
 *
 * @param {discordJSTypes.ButtonInteraction} interaction
 */
async function command(interaction) {
    if (!(await Server.exists({ serverID: interaction.guild.id, selfAssign: true }))) {
        interaction.editReply({ ephemeral: true, content: 'Self assignable roles are disabled.' })
        return
    }

    var roleID = interaction.customId.split('_')[1]
    var memberRoles = interaction.member.roles.cache
    var mongoRoles = await RoleGroup.findOne({ serverID: interaction.guild.id, roleIDs: roleID, assignable: true })
    if (memberRoles.has(roleID)) {
        await interaction.editReply({ content: 'You already have this role.' })
        return
    }

    if (mongoRoles) {
        if (mongoRoles.exclusive) {
            var removeRoles = []
            for (var i = 0; i < mongoRoles.roleIDs.length; i++) {
                if (memberRoles.has(mongoRoles.roleIDs[i])) {
                    removeRoles.push(mongoRoles.roleIDs[i])
                }
            }
            await interaction.member.roles.remove(removeRoles)
        }

        try {
            await interaction.member.roles.add(interaction.customId)
            await interaction.editReply({ ephemeral: true, content: 'Added: ' + interaction.guild.roles.cache.get(roleID).name })
        } catch (e) {
            interaction.editReply({ content: "I don't have permission to add this role." })
        }
    } else if (await Role.exists({ serverID: interaction.guild.id, assignable: true })) {
        var discordRole = await interaction.guild.roles.fetch(interaction.customId)

        try {
            if (interaction.member.roles.cache.has(discordRole.id)) {
                await interaction.member.roles.remove(discordRole)
                await interaction.editReply({ ephemeral: true, content: 'Removed: ' + discordRole.name })
            } else {
                await interaction.member.roles.add(discordRole)
                await interaction.editReply({ ephemeral: true, content: 'Added: ' + discordRole.name })
            }
        } catch (e) {
            interaction.editReply({ ephemeral: true, content: "I don't have permission to add this role." })
            return
        }
    } else {
        await interaction.editReply({ ephemeral: true, content: "I couldn't find this role, it might not be assignable anymore" })
    }
}

module.exports = command
