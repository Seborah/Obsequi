const discordJSTypes = require('discord.js')

var Role = require('../../../schema/Role.js')
var Server = require('../../../schema/Server.js')
var RoleGroup = require('../../../schema/RoleGroup.js')

/**
 *
 * @param {discordJSTypes.CommandInteraction} interaction
 */
async function addrole(interaction) {
    var toggle = interaction.options.getBoolean('toggle')
    var group = interaction.options.getString('group')
    if (!group) {
        if (await Server.findOne({ serverID: interaction.guild.id })) {
            await Server.findOneAndUpdate({ serverID: interaction.guild.id }, { selfAssign: toggle })
        } else {
            var mongoServer = new Server({ serverID: interaction.guild.id, selfAssign: toggle })
            await mongoServer.save()
        }
        await interaction.editReply({ ephemeral: false, content: `Self assignable roles are now ${toggle ? 'enabled' : 'disabled'}.` })
    } else {
        var mongoGroup = await RoleGroup.findOne({ serverID: interaction.guild.id, groupName: group })
        if (!mongoGroup) {
            interaction.editReply({ content: 'This group does not exist' })
            return
        } else {
            await RoleGroup.updateOne({ serverID: interaction.guild.id, groupName: group }, { assignable: toggle })
            interaction.editReply({ content: `Group ${group} is now ${toggle ? 'enabled' : 'disabled'}` })
        }
        //TODO: add group toggle
    }
}

module.exports = addrole
