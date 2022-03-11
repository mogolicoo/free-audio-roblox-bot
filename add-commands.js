const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { appId, mainGuild, token } = require('./keys.json');

const commands = [
	new SlashCommandBuilder().setName('audio').setDescription('pon un archivo al mandar el comando o no servire').addStringOption(opt=>opt.setName("nombre").setDescription("nombre del audio en roblox, default es \"xd\"").setRequired(false)),
]
.map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationGuildCommands(appId, mainGuild), { body: commands })