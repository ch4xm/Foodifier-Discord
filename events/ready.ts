
const { Events } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client : any) { //FUCK THIS
		console.log(`Client logged in as user ${client.user.tag}`);
	},
};
