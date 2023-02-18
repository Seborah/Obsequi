const discordJSTypes = require('discord.js')

var Role = require('../../../schema/Role.js')
var Server = require('../../../schema/Server.js')
var RoleGroup = require('../../../schema/RoleGroup.js')

/**
 *
 * @param {discordJSTypes.CommandInteraction} interaction
 */
async function configrole(interaction) {
    var config = interaction.options.getString('config')
    /**
     * @type {discordJSTypes.Role}
     */
    var role = interaction.options.getRole('role')

    var mongoServer = await Server.findOne({ serverID: interaction.guild.id })
    if (!mongoServer) {
        await Server.create({ serverID: interaction.guild.id, selfAssign: false, allRolesAdded: [] })
        mongoServer = { serverID: interaction.guild.id, selfAssign: false, allRolesAdded: [] }
    }

    var mongoServer = await Server.findOne({ serverID: interaction.guild.id })
    var roleList = new Set(mongoServer.allRolesAdded)

    if (config == 'assignable') {
        try {
            await role.setMentionable(role.mentionable)
        } catch (e) {
            interaction.editReply({ content: "I don't have permission to manage this role." })
            return
        }

        if (roleList.has(role.id)) {
            var mongoRoleGroup = await RoleGroup.findOne({ roleIDs: role.id, serverID: interaction.guild.id })
            if (mongoRoleGroup) {
                interaction.editReply({ content: 'This role is already in the ' + mongoRoleGroup.groupName + ' group' })
            } else {
                interaction.editReply({ content: 'This role is already in the global group' })
            }
            return
        }
        if (roleList.size >= 25) {
            interaction.editReply({ content: 'You have reached the maximum amount of roles you can add to the global group.' })
            return
        }
        roleList.add(role.id)

        await Role.create({ roleID: role.id, assignable: true, serverID: interaction.guild.id })

        await Server.updateOne({ serverID: interaction.guild.id }, { allRolesAdded: [...roleList] })

        await interaction.editReply({ ephemeral: false, content: `made ${role.name} ${config}` })
        return
    } else if (config == 'nonassignable') {
        try {
            await role.setMentionable(role.mentionable)
        } catch (e) {
            interaction.editReply({ content: "I don't have permission to manage this role." })
            return
        }

        if (await Role.findOne({ roleID: role.id })) {
            await Role.deleteOne({ roleID: role.id })

            roleList.delete(role.id)
            await Server.updateOne({ serverID: interaction.guild.id }, { allRolesAdded: [...roleList] })
        }
        await interaction.editReply({ ephemeral: false, content: `made ${role.name} ${config}` })
        return
    }
}

module.exports = configrole
