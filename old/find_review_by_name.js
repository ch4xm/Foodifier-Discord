
const { SlashCommandBuilder } = require('discord.js');
const read_write = require("../../data_read_write.js");
const main = require("../../main.js");
const { EmbedBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
	// Will print the overall rating average, as well as the specified numebr of reviews, with their corresponding ratings.
		.setName('name')
	// option of todays reviews
		.setDescription('Find all reviews by a certain user')
		.addUserOption(option =>
			option
        .setName('target')
				.setDescription('User whose reviews you want to see')
				.setRequired(true)),

	async execute(interaction) {
    const user = interaction.options.getUser("target");

    //console.log((user.id))

    const reviews = await read_write.findByName(user.id, "./user_reviews.csv");
    while(reviews.length > 10){
        reviews.pop()
    }
		await interaction.reply({ embeds: reviews });



      //await interaction.reply("User hasn't reviewed any menu items");

    

		console.log(`User ${interaction.user.tag} used command ${interaction}`);
	},
};
