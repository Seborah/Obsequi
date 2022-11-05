const auth = require("./auth.json")
const discord = require("discord.js")
const { MessageActionRow, MessageButton } = require("discord.js")

const mongoose = require("mongoose")
mongoose.connect(auth.mongoURI, { useNewUrlParser: true })
var Role = require("./schema/Role.js")
var Server = require("./schema/Server.js")

var client = new discord.Client({ intents: [discord.Intents.FLAGS.GUILDS] })
client.login(auth.tumuToken)

client.once("ready", () => {
	console.log("Ready!")
})
client.on("interactionCreate", async (interaction) => {
	if (!interaction.isCommand()) return
	if (!interaction.inGuild()) return

	const { commandName } = interaction
	try {
		var subcommand = interaction.options.getSubcommand()
	} catch (e) {
		console.log("no sub commands")
	}

	switch (commandName) {
		case "roles":
			if ((await Server.findOne({ ServerID: interaction.guild.id }))?.selfAssign) {
				var roles = await Role.find({ serverID: interaction.guild.id })
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
						button.setStyle("PRIMARY")
						row.addComponents(button)
					}
					components.push(row)
					await interaction.reply({ ephemeral: true, content: "Here are the roles you can get:", components: components })
				} else {
					await interaction.reply({ ephemeral: true, content: "There are no roles to assign." })
				}
			} else {
				await interaction.reply({ ephemeral: true, content: "Sorry, but you can't get roles right now." })
			}
			break
		case "admin":
			if (subcommand == "addrole") {
				try {
					var role = await interaction.guild.roles.create({
						name: interaction.options.getString("name"),
						color: "BLUE",
						permissions: [],
						mentionable: true,
						reason: `Added by Tumu as per slash command from ${interaction.member.user.username}#${interaction.member.user.discriminator}`,
					})
				} catch (e) {
					interaction.reply({ ephemeral: true, content: "I don't have permission to create this role." })
					break
				}
				await interaction.reply({ ephemeral: false, content: role.toString() + " was Added" })
			} else if (subcommand == "delrole") {
				var role = interaction.options.getRole("role")

				var roleName = role.name
				try {
					await role.delete(`Deleted by Tumu as per slash command from ${interaction.member.user.username}#${interaction.member.user.discriminator}`)
				} catch (e) {
					interaction.reply({ ephemeral: true, content: "I don't have permission to delete this role." })
					break
				}
				await interaction.reply({ ephemeral: false, content: roleName + " was Deleted" })
			} else if (subcommand == "configrole") {
				if (await Server.findOne({ serverID: interaction.guild.id })) {
				} else {
					var mongoServer = new Server({ serverID: interaction.guild.id, selfAssign: false })
					await mongoServer.save()
				}

				var config = interaction.options.getString("config")
				var role = interaction.options.getRole("role")

				if (config == "assignable") {
					try {
						role.setMentionable(true)
					} catch (e) {
						interaction.reply({ ephemeral: true, content: "I don't have permission to manage this role." })
						break
					}
					if (await Role.findOne({ roleID: role.id })) {
						await Role.findOneAndUpdate({ roleID: role.id }, { assignable: true })
					} else {
						var mongoRole = new Role({ roleID: role.id, assignable: true, serverID: interaction.guild.id })
						await mongoRole.save()
					}
				} else if (config == "nonassignable") {
					try {
						role.setMentionable(false)
					} catch (e) {
						interaction.reply({ ephemeral: true, content: "I don't have permission to manage this role." })
						break
					}
					if (await Role.findOne({ roleID: role.id })) {
						await Role.findOneAndUpdate({ roleID: role.id }, { assignable: false })
					} else {
						var mongoRole = new Role({ roleID: role.id, assignable: false, serverID: interaction.guild.id })
						await mongoRole.save()
					}
				}

				await interaction.reply({ ephemeral: false, content: `made ${role.name} ${config}` })
			} else if (subcommand == "selfrole") {
				var toggle = interaction.options.getBoolean("toggle")
				if (await Server.findOne({ serverID: interaction.guild.id })) {
					await Server.findOneAndUpdate({ serverID: interaction.guild.id }, { selfAssign: toggle })
				} else {
					var mongoServer = new Server({ serverID: interaction.guild.id, selfAssign: toggle })
					await mongoServer.save()
				}
				await interaction.reply({ ephemeral: false, content: `Self assignable roles are now ${toggle ? "enabled" : "disabled"}.` })
			}
			break
	}
	if (interaction.isButton()) {
		var msg = interaction.message.content

		if (msg.startsWith("Here are the roles")) {
			if ((await Server.findOne({ ServerID: interaction.guild.id })).selfAssign) {
				var discordRole = await interaction.guild.roles.fetch(interaction.customId)

				try {
					if (interaction.member.roles.cache.has(discordRole.id)) {
						await interaction.member.roles.remove(discordRole)
						await interaction.reply({ ephemeral: true, content: "Removed: " + discordRole.name })
					} else {
						await interaction.member.roles.add(discordRole)
						await interaction.reply({ ephemeral: true, content: "Added: " + discordRole.name })
					}
				} catch (e) {
					interaction.reply({ ephemeral: true, content: "I don't have permission to add this role." })

					return
				}
			} else {
				await interaction.reply({ ephemeral: true, content: "Sorry, but you can't get roles right now." })
			}
		}
	}
})
