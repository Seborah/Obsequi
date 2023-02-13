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
        .addSubcommand((subCommand) =>
            subCommand
                .setName('addrole')
                .setDescription('Add a role')
                .addStringOption((option) => option.setName('name').setDescription('The name for the role').setRequired(true))
    )
        //$addrole
        .addSubcommand((subCommand) =>
            subCommand
                .setName('delrole')
                .setDescription('Delete a role')
                .addRoleOption((option) => option.setName('role').setDescription('The role to delete').setRequired(true))
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
        .addSubcommand((subCommand) =>
            subCommand
                .setName('configgroup')
                .setDescription('Configure a group')
                .addStringOption((option) =>
                    option
                        .setName('config')
                        .setDescription('config choices')
                        .setRequired(true)
                        .addChoices({ name: 'addrole', value: 'addrole' }, { name: 'delrole', value: 'delrole' })
                )
                .addStringOption((option) => option.setName('group').setDescription('which group to configure').setRequired(true))
                .addRoleOption((option) => option.setName('role').setDescription('which role to configure').setRequired(true))
    )
        //$toggle
        .addSubcommand((subCommand) =>
            subCommand
                .setName('toggle')
                .setDescription('Toggle the self assign roles feature for a group or entirely')
                .addBooleanOption((option) => option.setName('toggle').setDescription('on or off').setRequired(true))
                .addStringOption((option) => option.setName('group').setDescription('the role group to disable').setRequired(false))
        ),
].map((command) => command.toJSON())

//require("fs").writeFileSync("./commands.json", JSON.stringify(commands, null, 4))

const rest = new REST({ version: '9' }).setToken(auth.token)

rest.put(Routes.applicationCommands(auth.clientID), {
    body: commands,
})
