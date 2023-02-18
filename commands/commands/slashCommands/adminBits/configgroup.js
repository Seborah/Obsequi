const discordJSTypes = require('discord.js')

var Role = require('../../../schema/Role.js')
var Server = require('../../../schema/Server.js')
var RoleGroup = require('../../../schema/RoleGroup.js')

/**
 *
 * @param {discordJSTypes.CommandInteraction} interaction
 */
async function configgroup(interaction, subCommand) {
    var mongoServer = await Server.findOne({ serverID: interaction.guild.id })
    if (!mongoServer) {
        await Server.create({ serverID: interaction.guild.id, selfAssign: false, allRolesAdded: [] })
        mongoServer = { serverID: interaction.guild.id, selfAssign: false, allRolesAdded: [] }
    }

    var roleList = new Set(mongoServer.allRolesAdded)

    const group = interaction.options.getString('group')

    var mongoGroup = await RoleGroup.findOne({ serverID: interaction.guild.id, groupName: group })

    switch (subCommand) {
        case 'addrole':
            var role = interaction.options.getRole('role')
            if (!role) {
                await interaction.editReply({ content: 'Please provide a role' })
                return
            }
            if (mongoServer.allRolesAdded.includes(role.id)) {
                var mongoRoleGroup = await RoleGroup.findOne({ roleIDs: role.id, serverID: interaction.guild.id })
                if (mongoRoleGroup) {
                    await interaction.editReply({ content: 'This role is already in the ' + mongoRoleGroup.groupName + ' group' })
                    return
                } else {
                    await interaction.editReply({ content: 'This role is already in the global group' })
                }
                return
            }

            if (!mongoGroup) {
                await RoleGroup.create({ serverID: interaction.guild.id, groupName: group, roleIDs: [role.id], assignable: false })
                await interaction.editReply({ ephemeral: false, content: `Added ${role.name} to ${group}` })
            } else {
                if (mongoGroup.roleIDs.length >= 25) {
                    interaction.editReply({ content: `You have reached the maximum amount of roles you can add to the ${group} group.` })
                    return
                }
                await interaction.editReply({ ephemeral: false, content: `Added ${role.name} to ${group}` })

                var groupList = new Set(mongoGroup.roleIDs)
                groupList.add(role.id)

                await RoleGroup.updateOne({ serverID: interaction.guild.id, groupName: group }, { roleIDs: [...groupList] })
            }

            roleList.add(role.id)
            await Server.updateOne({ serverID: interaction.guild.id }, { allRolesAdded: [...roleList] })

            break
        case 'delrole':
            var role = interaction.options.getRole('role')
            if (!role) {
                await interaction.editReply({ content: 'Please provide a role' })
                return
            }
            if (!mongoGroup) {
                await interaction.editReply({ content: 'This group does not exist' })
            } else {
                var groupList = new Set(mongoGroup.roleIDs)

                if (!groupList.has(role.id)) {
                    await interaction.editReply({ content: 'This role is not in this group' })
                    return
                }

                groupList.delete(role.id)

                if (groupList.size == 0) {
                    await RoleGroup.deleteOne({ serverID: interaction.guild.id, groupName: group })
                    await interaction.editReply({ content: 'Group is now empty, deleted' })
                } else {
                    await RoleGroup.updateOne({ serverID: interaction.guild.id, groupName: group }, { roleIDs: [...groupList] })
                    await interaction.editReply({ content: `Removed ${role.name} from ${group}` })
                }

                roleList.delete(role.id)
                await Server.updateOne({ serverID: interaction.guild.id }, { allRolesAdded: [...roleList] })
            }
            break
        case 'exclusive':
            var exclusive = interaction.options.getBoolean('exclusive')
            if (mongoGroup) {
                await RoleGroup.findOneAndUpdate({ serverID: interaction.guild.id, groupName: group }, { exclusive: exclusive })
                await interaction.editReply({ content: `Set exclusive to ${exclusive} for ${group}` })
            } else {
                await interaction.editReply({ content: 'This group does not exist' })
            }
            break
        case 'rename':
            if (!mongoGroup) {
                await interaction.editReply({ content: 'This group does not exist' })
                return
            }
            var newName = interaction.options.getString('newname')
            if (await RoleGroup.exists({ serverID: interaction.guild.id, groupName: newName })) {
                await interaction.editReply({ content: `A group with the name ${newName} already exists` })
                return
            }

            await RoleGroup.findOneAndUpdate({ serverID: interaction.guild.id, groupName: group }, { groupName: newName })
            await interaction.editReply({ content: `Renamed ${group} to ${newName}` })
            break
    }
}

module.exports = configgroup
