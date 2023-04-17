import fs from 'fs';
import path from 'path'

import {Client, GatewayIntentBits, Collection} from 'discord.js'

import dotenv from 'dotenv'

dotenv.config()

const client : Client = new Client({ 
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent],
  allowedMentions: { parse: ['users', 'roles'], repliedUser: true }
});


client.login(process.env.token);
