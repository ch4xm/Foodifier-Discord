const BASE_URL = "https://nutrition.sa.ucsc.edu/longmenu.aspx?sName=UC+Santa+Cruz+Dining&locationNum=";

const LOCATION_URLS : Record<string,string> = {
    'Cowell/Stevenson': "05&locationName=Cowell%2fStevenson+Dining+Hall&naFlag=1",
	'Crown/Merrill': "20&locationName=Crown%2fMerrill+Dining+Hall&naFlag=1",
	'Nine/Ten': "40&locationName=College+Nine%2fJohn+R.+Lewis+Dining+Hall&naFlag=1",
	'Porter/Kresge': "25&locationName=Porter%2fKresge+Dining+Hall&naFlag=1",
}
const MEAL_URL = "&WeeksMenus=UCSC+-+This+Week%27s+Menus&mealName=";

const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Late Night'];

//-------------------------------------------------------------------------------------------------

const CAFE_URLS = {
    'Oakes Cafe': '23&locationName=Oakes+Cafe&naFlag=1',
    'Global Village Cafe': '46&locationName=Global+Village+Cafe&naFlag=1',
    'UCen Coffee Bar': '45&locationName=UCen+Coffee+Bar&naFlag=1',
    'Stevenson Coffee House': '26&locationName=Stevenson+Coffee+House&naFlag=1',
    'Porter Market': '50&locationName=Porter+Market&naFlag=1',
    'Perk Coffee Bars': '22&locationName=Perk+Coffee+Bars&naFlag=1',
}

const DIVIDERS = ['-- Soups --', '-- Breakfast --', '-- Grill --', '-- Entrees --', '-- Pizza --', '-- Clean Plate --', '-- DH Baked --', '-- Bakery --', '-- Open Bars --', '-- All Day --'];
// strings corresponding to the dividers, will be used to determine menu validity
// (eg if cereal is first divider found, then the dh is not open for that meal)

const EMOJIS = { 'veggie': '🥦', 'vegan': '🌱', 'halal': '🍖', 'eggs': '🥚', 'beef': '🐮', 'milk': '🥛', 'fish': '🐟', 'alcohol': '🍷', 'gluten': '🍞', 'soy': '🫘', 'treenut': '🥥', 'sesame': '', 'pork': '🐷', 'shellfish': '🦐', 'nuts': '🥜' };

import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';

import JSDOM from 'jsdom';

JSDOM.JSDOM;
import fs from 'fs';
import axios from 'axios';

async function get_site_with_cookie(url : string, location_url : string){
    let location_cookie = location_url.slice(0,2);
    const cookies = {
        'WebInaCartLocation': location_cookie,
        'WebInaCartDates': '',
        'WebInaCartMeals': '',
        'WebInaCartQtys': '',
        'WebInaCartRecipes': ''
    };
    
    return await axios.get(url, { 
        headers: {
            'Cookie': Object.entries(cookies).map(c => c.join('=')).join('; ')
        }
    }).then(response => {
        return response.data;
    }).catch(error => {
    console.error(error);
        return error;
    });
}

async function getMenu(college : string, full_url : string) {
    let food_items  : Record<any,any > = {};
    let location_url : string = LOCATION_URLS[college];
    let response = await get_site_with_cookie(full_url, location_url);
    const dom = new JSDOM(response);

    dom.window.document.querySelectorAll('tr').forEach((tr : any) => {
		if (tr.querySelector('div.longmenucolmenucat')) {
			// If current tr has a divider
			//console.log(tr.querySelector('div.longmenucolmenucat'));
			food_items[tr.querySelector('div.longmenucolmenucat').textContent] = null;
			return; // go to next tr
			}
			if (tr.querySelector('div.longmenucoldispname')) {
			// If current tr has a food item
			let food = tr.querySelector('div.longmenucoldispname').textContent;
			food_items[food] = []; // add food to dictionary
			for (let img of tr.querySelectorAll('img')) {
				// Iterate through dietary restrictions and get img src names
				let diets = img.getAttribute('src').split('/')[1].split('.')[0];
        if (food_items[food] == null) {
          continue;
        } else{
				  food_items[food].push(diets);
        }
			}
		}
  })

  if (Object.keys(food_items)[0] == '-- Cereal --') {
	return null;
  }
  return food_items;
}

async function getDiningHallMenu(college : string, meal : string, day_offset = 0) {
    const offsetDate = new Date((new Date()).getTime() + day_offset * 60000);
    let date : string = `&dtdate=${offsetDate.getMonth() + 1}%2F${offsetDate.getDate()}%2F${offsetDate.getFullYear().toString().substr(-2)}`;
	  let full_url : string = BASE_URL + LOCATION_URLS[college] + MEAL_URL + meal + date;

    const food_items = await getMenu(college, full_url);
    return food_items;
}

// async function getCafeMenu(cafe) {
//
// }

module.exports = {
    data: new SlashCommandBuilder()
        .setName('menu')
        .setDescription('Get the menu of the specified day at a dining hall')
        .addSubcommand(subcommand =>
            subcommand
                .setName('cafe')
                .setDescription('Get the menu of one of the UCSC cafes')
                .addStringOption(option =>
                    option.setName('location')
                    .setDescription('Which cafe to get the menu of')
                    .setRequired(true)
                )
        ).addSubcommand(subcommand =>
            subcommand
                .setName('dining_hall')
                .setDescription('Get the menu of one of the UCSC dining halls')
                .addStringOption(option =>
                    option.setName('location')
                    .setDescription('Which dining hall to get the menu of')
                    .setRequired(true))
                .addStringOption(option =>
                    option.setName('meal')
                    .setDescription('Which meal (note that not all meals will be available for every location')
                    .setRequired(true))
                .addStringOption(option =>
                    option.setName('day_offset')
                    .setDescription('How many days ahead to get the menu from. Default is 0 days (today)')
                    .setRequired(true)
                )
        ),

        async execute(interaction : ChatInputCommandInteraction) {
            await getDiningHallMenu('Cowell/Stevenson', 'Lunch')
            await interaction.reply('hi');
            console.log(`User ${interaction.user.tag} used command ${interaction}`);
        },
}