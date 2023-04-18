import {ChatInputCommandInteraction, SlashCommandBuilder} from 'discord.js';

import { CookieDB } from 'cookie-driver';

import dotenv from 'dotenv';

dotenv.config()

let token: string = process.env.cookiedb_token!;

const cookieDB = new CookieDB(
  "https://cookiedb.com/api/db",
  token
)

module.exports = {
    data: new SlashCommandBuilder()
        .setName('review')
        .setDescription('Create, remove, or get reviews')
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Create a new food review')
                .addStringOption(option =>
                    option.setName('food')
                    .setDescription('The food item to create a new review for')
                    .setRequired(true))
                .addNumberOption(option =>
                    option.setName('rating')
                    .setDescription('Your numerical rating of the food')
                    .setRequired(true))
                .addStringOption(option =>
                    option.setName('review')
                    .setDescription('Textual review of the food')
                    .setRequired(true)
                ))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove one of your own food reviews')
                .addStringOption(option =>
                    option.setName('food')
                    .setDescription('The food item to remove your review for')
                    .setRequired(true))
                .addNumberOption(option =>
                    option.setName('rating')
                    .setDescription('Optional rating to narrow down which review to delete (in the case of multiple reviews on the same food)')
                    .setRequired(false)
                ))
        .addSubcommandGroup( group => 
                            group.setName("filter")
                            .addSubcommand(subcommand =>
                                subcommand
                                    .setName('filtername')
                                    .setDescription('Get a list of reviews from the specified user')
                                    .addUserOption(option => 
                                        option.setName('user')
                                        .setDescription('The user whose reviews you would like to see')
                                        .setRequired(true)
                                    ))
                            .addSubcommand(subcommand =>
                                subcommand
                                    .setName('filterfood')
                                    .setDescription('Get a list of reviews about the specified food')
                                    .addStringOption((option)=> 
                                        option.setName('food')
                                        .setDescription('Food you would like to see reviews about')
                                        .setRequired(true)
                           )
                )),
        async execute(interaction : ChatInputCommandInteraction){
          if(interaction.options.getSubcommand() === 'create'){
              await cookieDB.insert("reviews",{
                username: interaction.user.username,
                user_id : interaction.user.id,
                food_item : interaction.options.getString('food_item'),
                rating : interaction.options.getNumber('rating'),
                review : interaction.options.getString('review'),
                upvotes : 0,
                downvotes : 0
              })

              console.log(`User ${interaction.user.tag} used command ${interaction}`);
          }
        }

}
