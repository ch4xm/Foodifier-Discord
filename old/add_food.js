const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('new_food') // Allow a user to create a new food submission, and people can upvote or downvote if its an actual food item, eg breakfast burrito, ccb sandwich
        .setDescription('Create a new food submission, which can be voted on by others to decide if its accurate')
        .addStringOption(option =>
            option.setName('name')
            .setDescription('The full name of the food item, eg (Chicken Cordon Bleu Sandwich)')
            .setRequired(true))
        .addNumberOption(option =>
            option.setName('price')
            .setDescription('Numeric exact price of the item')
            .setRequired(true)
            .setMinValue(0)),

    async execute(interaction) {
        // Add new food to DB/csv file if not exists
        //
        await interaction.reply('Food item added! (not really)');
        console.log(`User ${interaction.user.tag} used command ${interaction}`);
    }
};