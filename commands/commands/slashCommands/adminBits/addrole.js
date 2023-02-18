const discordJSTypes = require('discord.js')
/**
 *
 * @param {discordJSTypes.CommandInteraction} interaction
 */
async function addrole(interaction) {
    try {
        var role = await interaction.guild.roles.create({
            name: interaction.options.getString('name'),
            color: 'BLUE',
            permissions: [],
            mentionable: true,
            reason: `Added by Tumu as per slash command from ${interaction.member.user.username}#${interaction.member.user.discriminator}`,
        })
    } catch (e) {
        await interaction.editReply({ content: "I don't have permission to create this role." })
        return
    }
    await interaction.editReply({ ephemeral: false, content: role.toString() + ' was Added' })
}

module.exports = addrole
