const auth = require('./auth.json')
const discord = require('discord.js')
const { MessageActionRow, MessageButton } = require('discord.js')
//$ for testing
var getMethods = (obj) => Object.getOwnPropertyNames(obj).filter((item) => typeof obj[item] === 'function')

const mongoose = require('mongoose')
mongoose.set('strictQuery', false)
mongoose.connect(auth.mongoURI, { useNewUrlParser: true })

var Role = require('./schema/Role.js')
var Server = require('./schema/Server.js')
var RoleGroup = require('./schema/RoleGroup.js')

var client = new discord.Client({ intents: [discord.Intents.FLAGS.GUILDS] })
client.login(auth.token)

client.once('ready', () => {
    console.log('Ready!')
})
client.on('interactionCreate', async (interaction) => {
    if (!interaction.inGuild()) return
    if (interaction.isCommand()) {
        const { commandName } = interaction
        try {
            var subcommand = interaction.options.getSubcommand()
        } catch (e) {
            console.log('no sub commands')
        }

        switch (commandName) {
            case 'roles':
                await interaction.reply({ content: 'Working on it...' })
                var mongoServer = await Server.findOne({ serverID: interaction.guild.id, selfAssign: true })
                if (!(await Server.exists({ serverID: interaction.guild.id, selfAssign: true }))) {
                    await interaction.editReply({ ephemeral: true, content: "Sorry, but you can't get roles right now." })
                    break
                }
                var group = interaction.options.getString('group')
                if (group) {
                    var roles = await RoleGroup.findOne({ serverID: interaction.guild.id, groupName: group })
                    if (!roles.assignable) {
                        await interaction.editReply({ ephemeral: true, content: "Sorry, but you can't get those right now." })
                        break
                    }
                    console.log(roles)
                    if (roles.roleIDs.length > 0) {
                        var row = new MessageActionRow()
                        var components = []

                        for (var i = 0; i < roles.roleIDs.length; i++) {
                            if (i > 24) {
                                break
                            }
                            if (i % 5 == 0 && i != 0) {
                                components.push(row)
                                row = new MessageActionRow()
                            }
                            var discordRole = await interaction.guild.roles.fetch(roles.roleIDs[i])
                            var button = new MessageButton()
                            button.setCustomId(discordRole.id)
                            button.setLabel(discordRole.name)
                            button.setStyle('PRIMARY')
                            row.addComponents(button)
                        }
                        components.push(row)
                        await interaction.editReply({ ephemeral: true, content: 'Here are the roles you can get:', components: components })
                    }
                } else {
                    var roles = await Role.find({ serverID: interaction.guild.id, assignable: true })
                    if (roles.length > 0) {
                        var row = new MessageActionRow()
                        var components = []
                        for (var i = 0; i < roles.length; i++) {
                            if (i > 24) {
                                break
                            }
                            if (i % 5 == 0 && i != 0) {
                                components.push(row)
                                row = new MessageActionRow()
                            }
                            var discordRole = await interaction.guild.roles.fetch(roles[i].roleID)
                            var button = new MessageButton()
                            button.setCustomId(discordRole.id)
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

                break
            case 'admin':
                await interaction.reply({ content: 'Working on it...' })
                if (subcommand == 'addrole') {
                    try {
                        var role = await interaction.guild.roles.create({
                            name: interaction.options.getString('name'),
                            color: 'BLUE',
                            permissions: [],
                            mentionable: true,
                            reason: `Added by Tumu as per slash command from ${interaction.member.user.username}#${interaction.member.user.discriminator}`,
                        })
                    } catch (e) {
                        await interaction.editReply({ ephemeral: true, content: "I don't have permission to create this role." })
                        break
                    }
                    await interaction.editReply({ ephemeral: false, content: role.toString() + ' was Added' })
                } else if (subcommand == 'delrole') {
                    var role = interaction.options.getRole('role')

                    var roleName = role.name
                    try {
                        await role.delete(
                            `Deleted by Tumu as per slash command from ${interaction.member.user.username}#${interaction.member.user.discriminator}`
                        )
                    } catch (e) {
                        interaction.editReply({ ephemeral: true, content: "I don't have permission to delete this role." })
                        break
                    }
                    await interaction.editReply({ ephemeral: false, content: roleName + ' was Deleted' })
                } else if (subcommand == 'configrole') {
                    var config = interaction.options.getString('config')
                    var role = interaction.options.getRole('role')

                    if (!(await Server.exists({ serverID: interaction.guild.id }))) {
                        await Server.create({ serverID: interaction.guild.id, selfAssign: false, allRolesAdded: [] })
                    }
                    var mongoServer = await Server.findOne({ serverID: interaction.guild.id })
                    if (config == 'assignable') {
                        try {
                            await role.setMentionable(role.mentionable)
                        } catch (e) {
                            interaction.editReply({ ephemeral: true, content: "I don't have permission to manage this role." })
                            break
                        }
                        if (mongoServer.allRolesAdded.includes(role.id)) {
                            var mongoRoleGroup = await RoleGroup.findOne({ roleIDs: role.id, serverID: interaction.guild.id })
                            if (mongoRoleGroup) {
                                interaction.editReply({ ephemeral: true, content: 'This role is already in the ' + mongoRoleGroup.groupName + ' group' })
                                break
                            } else {
                                interaction.editReply({ ephemeral: true, content: 'This role is already in the global group' })
                            }
                            break
                        }
                        if (await Role.findOne({ roleID: role.id })) {
                            await Role.findOneAndUpdate({ roleID: role.id }, { assignable: true })
                            var groupList = new Set(mongoServer.allRolesAdded)
                            groupList.add(role.id)
                            await Server.updateOne({ serverID: interaction.guild.id }, { allRolesAdded: [...groupList] })
                        } else {
                            var mongoRole = new Role({ roleID: role.id, assignable: true, serverID: interaction.guild.id })
                            var groupList = new Set(mongoServer.allRolesAdded)
                            groupList.add(role.id)
                            await Server.updateOne({ serverID: interaction.guild.id }, { allRolesAdded: [...groupList] })
                            await mongoRole.save()
                        }
                        await interaction.editReply({ ephemeral: false, content: `made ${role.name} ${config}` })
                        break
                    } else if (config == 'nonassignable') {
                        try {
                            await role.setMentionable(role.mentionable)
                        } catch (e) {
                            interaction.editReply({ ephemeral: true, content: "I don't have permission to manage this role." })
                            break
                        }
                        if (await Role.findOne({ roleID: role.id })) {
                            await Role.findOneAndUpdate({ roleID: role.id }, { assignable: false })
                            var groupList = new Set(mongoServer.allRolesAdded)
                            groupList.delete(role.id)
                            await Server.updateOne({ serverID: interaction.guild.id }, { allRolesAdded: [...groupList] })
                        }
                        await interaction.editReply({ ephemeral: false, content: `made ${role.name} ${config}` })
                        break
                    }
                } else if (subcommand == 'configgroup') {
                    var mongoServer = await Server.findOne({ serverID: interaction.guild.id })
                    if (!mongoServer) {
                        await Server.create({ serverID: interaction.guild.id, selfAssign: false, allRolesAdded: [] })
                        mongoServer = { serverID: interaction.guild.id, selfAssign: false, allRolesAdded: [] }
                    }

                    var config = interaction.options.getString('config')
                    var role = interaction.options.getRole('role')
                    if (config == 'addrole') {
                        if (mongoServer.allRolesAdded.includes(role.id)) {
                            var mongoRoleGroup = await RoleGroup.findOne({ roleIDs: role.id, serverID: interaction.guild.id })
                            if (mongoRoleGroup) {
                                interaction.editReply({ ephemeral: true, content: 'This role is already in the ' + mongoRoleGroup.groupName + ' group' })
                                break
                            } else {
                                interaction.editReply({ ephemeral: true, content: 'This role is already in the global group' })
                            }
                            break
                        }
                        var group = interaction.options.getString('group')
                        if (!(await RoleGroup.exists({ serverID: interaction.guild.id, groupName: group }))) {
                            await RoleGroup.create({ serverID: interaction.guild.id, groupName: group, roleIDs: [role.id], assignable: false })
                            await interaction.editReply({ ephemeral: false, content: `Added ${role.name} to ${group}` })
                        } else {
                            var mongoGroup = await RoleGroup.findOne({ serverID: interaction.guild.id, groupName: group })

                            await interaction.editReply({ ephemeral: false, content: `Added ${role.name} to ${group}` })

                            var mongoGroup = new Set(mongoGroup.roleIDs)
                            mongoGroup.add(role.id)

                            await RoleGroup.updateOne({ serverID: interaction.guild.id, groupName: group }, { roleIDs: [...mongoGroup] })
                        }

                        var groupList = new Set(mongoServer.allRolesAdded)
                        groupList.add(role.id)
                        await Server.updateOne({ serverID: interaction.guild.id }, { allRolesAdded: [...groupList] })
                    } else if (config == 'delrole') {
                        var group = interaction.options.getString('group')
                        if (!(await RoleGroup.exists({ serverID: interaction.guild.id, groupName: group }))) {
                            interaction.editReply({ ephemeral: true, content: 'This group does not exist' })
                        } else {
                            var mongoGroup = await RoleGroup.findOne({ serverID: interaction.guild.id, groupName: group })
                            var groupList = new Set(mongoGroup.roleIDs)
                            if (!groupList.has(role.id)) {
                                interaction.editReply({ ephemeral: true, content: 'This role is not in this group' })
                                break
                            }
                            console.log(groupList)

                            groupList.delete(role.id)
                            if (groupList.size == 0) {
                                await RoleGroup.deleteOne({ serverID: interaction.guild.id, groupName: group })
                                interaction.editReply({ ephemeral: true, content: 'Group is now empty, deleted' })
                            } else {
                                await RoleGroup.updateOne({ serverID: interaction.guild.id, groupName: group }, { roleIDs: [...groupList] })
                                interaction.editReply({ ephemeral: true, content: `Removed ${role.name} from ${group}` })
                            }
                            var roleList = new Set(mongoServer.allRolesAdded)
                            roleList.delete(role.id)
                            await Server.updateOne({ serverID: interaction.guild.id }, { allRolesAdded: [...roleList] })
                        }
                    }
                } else if (subcommand == 'toggle') {
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
                            interaction.editReply({ ephemeral: true, content: 'This group does not exist' })
                            break
                        } else {
                            await RoleGroup.updateOne({ serverID: interaction.guild.id, groupName: group }, { assignable: toggle })
                            interaction.editReply({ ephemeral: true, content: `Group ${group} is now ${toggle ? 'enabled' : 'disabled'}` })
                        }
                        //TODO: add group toggle
                    }
                }
                break
        }
    }

    if (interaction.isButton()) {
        var msg = interaction.message.content
        await interaction.reply({ ephemeral: true, content: 'working on it..' })
        if (msg.startsWith('Here are the roles')) {
            if (!(await Server.exists({ serverID: interaction.guild.id, selfAssign: true }))) {
                interaction.editReply({ ephemeral: true, content: 'Self assignable roles are disabled.' })
                return
            }
            var roles = await RoleGroup.findOne({ serverID: interaction.guild.id, roleIDs: interaction.customId, assignable: true })
            var memberRoles = interaction.member.roles.cache
            if (roles) {
                try {
                    for (var i = 0; i < roles.roleIDs.length; i++) {
                        if (memberRoles.has(roles.roleIDs[i])) {
                            await interaction.member.roles.remove(roles.roleIDs[i])
                        }
                    }
                    await interaction.member.roles.add(interaction.customId)
                    await interaction.editReply({ ephemeral: true, content: 'Added: ' + interaction.guild.roles.cache.get(interaction.customId).name })
                } catch (e) {
                    interaction.editReply({ ephemeral: true, content: "I don't have permission to add this role." })
                }
            } else if ((await Role.findOne({ serverID: interaction.guild.id })).assignable) {
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
                await interaction.editReply({ ephemeral: true, content: "Sorry, but you can't get roles right now." })
            }
        }
    }
    if (interaction.isAutocomplete()) {
        console.log(interaction.options.getFocused(true))
        if (interaction.options.getFocused(true).name == 'group') {
            var focusedValue = interaction.options.getFocused()
            
            var mongoGroups = await RoleGroup.find({ serverID: interaction.guild.id, assignable: true })
            var choices = []
            mongoGroups.forEach((group) => {
                choices.push(group.groupName)
            })
            
            var filtered = focusedValue.length<1 ? choices : choices.filter((choice) => choice.startsWith(focusedValue))

            interaction.respond(filtered.map((choice) => ({ name: choice, value: choice })))
        }
    }
})
