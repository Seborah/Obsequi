const discordJSTypes = require('discord.js')

/**
 *
 * @param {discordJSTypes.CommandInteraction} interaction
 */
async function delrole(interaction) {
    var role = interaction.options.getRole('role')
    var roleName = role.name
    try {
        await role.delete(`Deleted by Tumu as per slash command from ${interaction.member.user.username}#${interaction.member.user.discriminator}`)
    } catch (e) {
        interaction.editReply({ content: "I don't have permission to delete this role." })
        return
    }
    await interaction.editReply({ ephemeral: false, content: roleName + ' was Deleted' })
}

module.exports = delrole
