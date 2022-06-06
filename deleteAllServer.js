//deletes all global commands

const { SlashCommandBuilder } = require("@discordjs/builders")
const { REST } = require("@discordjs/rest")
const { Routes } = require("discord-api-types/v9")
const auth = require("./auth.json")

const token = auth.tumuToken
const clientId = auth.clientID
const guildID = auth.guildID

const rest = new REST({ version: "9" }).setToken(token)

rest.get(Routes.applicationGuildCommands(clientId, guildID)).then((data) => {
	const promises = []
	for (const command of data) {
		const deleteUrl = `${Routes.applicationGuildCommands(clientId, guildID)}/${command.id}`
		promises.push(rest.delete(deleteUrl))
	}
	return Promise.all(promises)
})
