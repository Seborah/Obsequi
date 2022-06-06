const auth = require("./auth.json")
const { REST } = require("@discordjs/rest")
const { Routes } = require("discord-api-types/v9")
const { SlashCommandBuilder } = require("@discordjs/builders")
const { Permissions } = require("discord.js")
const commands = [
	new SlashCommandBuilder().setName("roles").setDescription("Sends Role Message"),
	new SlashCommandBuilder()
		.setName("admin")
		.setDefaultMemberPermissions(Permissions.FLAGS.ADMINISTRATOR)
		.setDescription("Administrative Commands")
		.addSubcommand((subCommand) =>
			subCommand
				.setName("addrole")
				.setDescription("Add a role")
				.addStringOption((option) => option.setName("name").setDescription("The name for the role").setRequired(true))
		)
		.addSubcommand((subCommand) =>
			subCommand
				.setName("delrole")
				.setDescription("Delete a role")
				.addRoleOption((option) => option.setName("role").setDescription("The role to delete").setRequired(true))
		)
		.addSubcommand((subCommand) =>
			subCommand
				.setName("configrole")
				.setDescription("Configure a role")
				.addStringOption((option) =>
					option
						.setName("config")
						.setDescription("config choices")
						.setRequired(true)
						.addChoices({ name: "assignable", value: "assignable" }, { name: "nonassignable", value: "nonassignable" })
				)

				.addRoleOption((option) => option.setName("role").setDescription("which role to configure").setRequired(true))
		)
		.addSubcommand((subCommand) =>
			subCommand
				.setName("selfrole")
				.setDescription("Toggle the self assign roles feature")
				.addBooleanOption((option) => option.setName("toggle").setDescription("on or off").setRequired(true))
		),
].map((command) => command.toJSON())

const rest = new REST({ version: "9" }).setToken(auth.tumuToken)

rest.put(Routes.applicationCommands(auth.clientID), {
	body: commands,
})
