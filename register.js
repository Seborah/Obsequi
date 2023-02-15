const auth = require('./auth.json')
Error.stackTraceLimit = 30
const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
const { SlashCommandBuilder } = require('@discordjs/builders')
const { Permissions } = require('discord.js')
const commands = [
    new SlashCommandBuilder()
        .setName('roles')
        .setDescription('Sends Role Message')
        .addStringOption((option) => option.setName('group').setDescription('The role group.').setRequired(false).setAutocomplete(true)),

    new SlashCommandBuilder()
        .setName('admin')
        .setDefaultMemberPermissions(Permissions.FLAGS.ADMINISTRATOR)
        .setDescription('Administrative Commands')
        //$addrole
        .addSubcommand((subCommand) =>
            subCommand
                .setName('addrole')
                .setDescription('Add a role')
                .addStringOption((option) => option.setName('name').setDescription('The name for the role').setRequired(true))
        )
        //$delrole
        .addSubcommand((subCommand) =>
            subCommand
                .setName('delrole')
                .setDescription('Delete a role')
                .addRoleOption((option) => option.setName('role').setDescription('The role to delete').setRequired(true))
        )
        .addSubcommand((subCommand) =>
            subCommand
                .setName('announceroles')
                .setDescription('send a message with buttons to self assign roles to a channel')
                .addChannelOption((option) => option.setName('channel').setDescription('The channel to send the message to').setRequired(true))
                .addStringOption((option) => option.setName('group').setDescription('The role group.').setRequired(true).setAutocomplete(true))
                .addStringOption((option) => option.setName('message').setDescription('The message to send with the buttons').setRequired(false))
        )

        //$configrole
        .addSubcommand((subCommand) =>
            subCommand
                .setName('configrole')
                .setDescription('Configure a role')
                .addStringOption((option) =>
                    option
                        .setName('config')
                        .setDescription('config choices')
                        .setRequired(true)
                        .addChoices({ name: 'assignable', value: 'assignable' }, { name: 'nonassignable', value: 'nonassignable' })
                )
                .addRoleOption((option) => option.setName('role').setDescription('which role to configure').setRequired(true))
        )

        //$configgroup
        .addSubcommandGroup((subCommandGroup) =>
            subCommandGroup
                .setName('configgroup')
                .setDescription('Configure a group')
                .addSubcommand((subCommand) =>
                    subCommand
                        .setName('addrole')
                        .setDescription('Add a role to a group')
                        .addStringOption((option) => option.setName('group').setDescription('which group to configure').setRequired(true).setAutocomplete(true))
                        .addRoleOption((option) => option.setName('role').setDescription('which role to configure').setRequired(true))
                )
                .addSubcommand((subCommand) =>
                    subCommand
                        .setName('delrole')
                        .setDescription('Remove a role from a group')
                        .addStringOption((option) => option.setName('group').setDescription('which group to configure').setRequired(true).setAutocomplete(true))
                        .addRoleOption((option) => option.setName('role').setDescription('which role to configure').setRequired(true))
                )
                .addSubcommand((subCommand) =>
                    subCommand
                        .setName('exclusive')
                        .setDescription('Toggle exclusive roles for a group')
                        .addStringOption((option) => option.setName('group').setDescription('which group to configure').setRequired(true).setAutocomplete(true))
                        .addBooleanOption((option) =>
                            option.setName('exclusive').setDescription('whether or not to make the group exclusive').setRequired(true)
                        )
                )
                .addSubcommand((subCommand) =>
                    subCommand
                        .setName('rename')
                        .setDescription('Rename a group')
                        .addStringOption((option) => option.setName('group').setDescription('which group to configure').setRequired(true).setAutocomplete(true))
                        .addStringOption((option) => option.setName('newname').setDescription('the new name for the group').setRequired(true))
                )
        )
        //$toggle
        .addSubcommand((subCommand) =>
            subCommand
                .setName('toggle')
                .setDescription('Toggle the self assign roles feature for a group or entirely')
                .addBooleanOption((option) => option.setName('toggle').setDescription('on or off').setRequired(true))
                .addStringOption((option) =>
                    option.setName('group').setDescription('the role group to disable, ignore to disable globally.').setRequired(false).setAutocomplete(true)
                )
        ),
].map((command) => command.toJSON())

require('fs').writeFileSync('./commands.json', JSON.stringify(commands, null, 4))

const rest = new REST({ version: '9' }).setToken(auth.token)

rest.put(Routes.applicationCommands(auth.clientID), {
    body: commands,
})
