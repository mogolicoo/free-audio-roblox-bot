// https://discord.com/api/oauth2/authorize?client_id=936662652573327412&permissions=8&scope=bot%20applications.commands
// TODO: NADA POR AHORA.
// modules
const { Client, Intents, MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");
const roblox = require("./handlers/roblox")
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// misc
const data = require("./keys.json")
const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]})

// saving settings
const current = {};

// templates
const creatingAudio = new MessageEmbed()
    .setThumbnail("https://tr.rbxcdn.com/c1d7cf47b3490944fdb21bdae101a250/420/420/Gear/Png")
    .setColor(10092799)
    .setTitle("Proceso de subir audio.")
    .setDescription("Bienvenido al proceso de subir audios, aquí tienes información sobre la configuración:\n```\n[🔒] \"Enviar al privado\" - Te enviare el enlace al audio en mensajes privado.\n[🔒] \"Desactivar venta\" - Desactiva la venta del audio, nadie podra comprarlo.\n[🔒] \"Desactivar comentarios\" - Desactiva los comentarios del audio, nadie podra decir ni una palabra.\n[🔒] \"Eliminar del inventario\" - Elimina el audio del inventario de la cuenta, util por si revisan el inventario.\n```\nPorfavor responda a este mensaje con\nel archivo del audio, **solo tienes 10 minutos.**")

// https://stackoverflow.com/questions/951021/ (i'm a lazy ass mf)
function wait(ms) { 
    return new Promise(resolve => setTimeout(resolve, ms));
}

// discord shit
client.on("ready", () => {
    console.log(`se ha iniciado sesión correctamente en ${client.user.tag}`)
    client.user.setPresence({
        status: "idle",
        activities: [{
            name: "ROBLOX",
            type: "PLAYING",
            url: "https://roblox.com/users/profile?username=skipperpee"
        }]
    })
})

client.on("interactionCreate", async (interaction) => {
    // button handling
    if (interaction.isButton()) {
        let action = interaction.customId.split(":")[0]
        let real = interaction.customId.split(":")[1]
        if (real != interaction.user.id) {
            await interaction.deferUpdate()
            return
        }
        if (!current[interaction.user.id]) {
            await interaction.deferUpdate()
            return
        }
        if (action == "cancel") {
            delete current[interaction.user.id]
            let embed = new MessageEmbed(interaction.message.embeds[0])
                .setDescription("Se ha cancelado la operación.\nSe eliminara el mensaje.")
            await interaction.update({embeds: [embed], components: []})
            await wait(4000)
            await interaction.deleteReply()
        } else if (action == "private") {
            let result = !current[interaction.user.id].sendInDm
            let oldComponents = interaction.message.components[0];
            current[interaction.user.id].sendInDm = result 
            interaction.component.setStyle((result == false && "DANGER" || "SUCCESS"))
            interaction.component.setEmoji((result == false && "🔓" || "🔒"))
            interaction.update({
                components: [new MessageActionRow().setComponents([
                    interaction.component,
                    oldComponents.components[1],
                    oldComponents.components[2],
                    oldComponents.components[3],
                    oldComponents.components[4]
                ])]
            })
        } else if (action == "audiopriv") {
            let result = !current[interaction.user.id].audioPublico
            let oldComponents = interaction.message.components[0];
            current[interaction.user.id].audioPublico = result 
            interaction.component.setStyle((result == true && "DANGER" || "SUCCESS"))
            interaction.component.setEmoji((result == true && "✖" || "✔"))
            interaction.update({
                components: [new MessageActionRow().setComponents([
                    oldComponents.components[0],
                    interaction.component,
                    oldComponents.components[2],
                    oldComponents.components[3],
                    oldComponents.components[4]
                ])]
            })
        } else if (action == "audiocom") {
            let result = !current[interaction.user.id].comentariosActivados
            let oldComponents = interaction.message.components[0];
            current[interaction.user.id].comentariosActivados = result
            interaction.component.setStyle((result == true && "DANGER" || "SUCCESS"))
            interaction.component.setEmoji((result == true && "✖" || "✔"))
            interaction.update({
                components: [new MessageActionRow().setComponents([
                    oldComponents.components[0],
                    oldComponents.components[1],
                    interaction.component,
                    oldComponents.components[3],
                    oldComponents.components[4]
                ])]
            })
        } else if (action == "deleteass") {
            let result = !current[interaction.user.id].eliminar
            let oldComponents = interaction.message.components[0];
            current[interaction.user.id].eliminar = result
            interaction.component.setStyle((result == false && "DANGER" || "SUCCESS"))
            interaction.component.setEmoji((result == false && "✖" || "✔"))
            interaction.update({
                components: [new MessageActionRow().setComponents([
                    oldComponents.components[0],
                    oldComponents.components[1],
                    oldComponents.components[2],
                    interaction.component,
                    oldComponents.components[4],
                ])]
            })
        } 
    }
    // command handling
    if (interaction.isCommand()) {
        // audio uploading shit
        if (interaction.commandName == "audio") {
			if (!interaction.member.roles.cache.some(role => role.id === '943989552878600242') && interaction.guildId != "922891458447552532") {
				interaction.reply({content: "oye bozo no contribuiste de alguna forma al servidor, vete de aquí y no uses el comando hasta que hayas contribuido en algo."})
				return
			}
            if (current[interaction.user.id]) {
                await interaction.editReply({content: "espera a que termine o cancela tu otro proceso bozo", ephemeral: true})
                return;
            }
            let embed = new MessageEmbed(creatingAudio)
                .setTimestamp()
                .setFooter({
                    text: interaction.user.tag,
                    iconURL: interaction.user.avatarURL()
                });
            let row = new MessageActionRow()
                .setComponents([
                    new MessageButton()
                        .setCustomId("private:"+interaction.user.id)
                        .setEmoji("🔒")
                        .setLabel("Enviar al privado")
                        .setStyle("SUCCESS"),
                    new MessageButton()
                        .setCustomId("audiopriv:"+interaction.user.id)
                        .setEmoji("✔")
                        .setLabel("Desactivar venta")
                        .setStyle("SUCCESS"),
                    new MessageButton()
                        .setCustomId("audiocom:"+interaction.user.id)
                        .setEmoji("✔")
                        .setLabel("Desactivar comentarios")
                        .setStyle("SUCCESS"),
                    new MessageButton()
                        .setCustomId("deleteass:"+interaction.user.id)
                        .setEmoji("✔")
                        .setLabel("Eliminar del inventario")
                        .setStyle("SUCCESS"),
                    new MessageButton()
                        .setCustomId("cancel:"+interaction.user.id)
                        .setEmoji("✖")
                        .setLabel("Cancelar proceso")
                        .setStyle("DANGER")
                ])
            let audioName = (interaction.options.get("nombre") != null) && interaction.options.get("nombre").value || "Audio" 
            let audioDesc = (interaction.options.get("descripción") != null) && interaction.options.get("descripción").value || null
            let groupId = (interaction.options.get("grupo") != null) && interaction.options.get("grupo").value || null
            let reply = await interaction.reply({embeds: [embed], components: [row], fetchReply: true});    
            current[interaction.user.id] = {
                sendInDm: true,
                audioPublico: false,
                comentariosActivados: false,
                eliminar: true
            }
            let filter = msg => {
                return (msg.author.id == interaction.user.id && msg.mentions.repliedUser == client.user && msg.reference.messageId == reply.id) 
            }
            let collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 600000 });
            let userMsg = collected.first();
            if (userMsg) {
                if (!current[interaction.user.id]) {
                    return;
                }
				let attachment = userMsg.attachments.first();
                if (attachment) {
                    if (attachment.contentType == "audio/mpeg" || attachment.contentType == "audio/ogg") {
                        await wait(100) 
                        await userMsg.delete()
                        if (current[interaction.user.id].sendInDm == true) {
                            try {
                                let lol = await interaction.user.send('test')
                                await lol.delete()
                            } catch (err) {
                                delete current[interaction.user.id]
                                let embed2 = new MessageEmbed(embed)
                                    .setDescription("Hubo un error mientras se checkeaban los mensajes privados.\nIntenta abrir tus dms en el servidor.")
                                await interaction.editReply({embeds: [embed2], components: []})
                                return;
                            }
                        }
                        let embed2 = new MessageEmbed(embed)
                            .setDescription("Espera mientras descargo y\nsubo el audio a Roblox...")
                        await interaction.editReply({embeds: [embed2], components: []})
                        let fileData = await roblox.download(attachment.url, true);
                        let response = await roblox.upload(fileData, audioName, groupId)
                        let code = response[1]
                        if (code == 200) {
                            await roblox.changeSettings(response[0].Id, current[interaction.user.id].audioPublico, current[interaction.user.id].comentariosActivados, audioDesc)
                            if (current[interaction.user.id].eliminar == true) {
                                await roblox.deleteAssetFromInventory(response[0].Id)
                            }
                            if (current[interaction.user.id].sendInDm == true) {
                                delete current[interaction.user.id]
                                let embed3 = new MessageEmbed(embed)
                                    .setDescription("El audio ya se ha subido.\nRevisa tus mensajes privados para ver el link\nal audio!")
                                await interaction.editReply({embeds: [embed3]})
                                try {
                                    await interaction.user.send(`Link a tu audio: https://www.roblox.com/library/${response[0].Id}/`)
                                } catch (err) {
                                    console.log(`error intentando mandar mensaje privado a ${interaction.user.tag}: ${err}`)
                                }
                            } else {
                                let embed3 = new MessageEmbed(embed)
                                    .setDescription("El audio ya se subio.\nApreta el botón de aquí abajo para\nver tu audio!")
                                let row2 = new MessageActionRow()
                                    .setComponents([
                                        new MessageButton()
                                            .setLabel("Audio subido")
                                            .setEmoji("🔊")
                                            .setStyle("LINK")
                                            .setURL(`https://www.roblox.com/library/${response[0].Id}/`)
                                    ])
                                await interaction.editReply({embeds: [embed3], components: [row2]})
                                delete current[interaction.user.id]
                            }
                        } else {
                            delete current[interaction.user.id]
                            let embed2 = new MessageEmbed(embed)
                                .setDescription(`Hubo un error al intentar subir el audio.\nInformación JSON:\n\`\`\`\n${JSON.stringify(response)}\n\`\`\``)
                            await interaction.editReply({embeds: [embed2]})
                        }
                    } else {
                        delete current[interaction.user.id]
                        await wait(100) 
                        await userMsg.delete()
                        let embed2 = new MessageEmbed(embed)
                            .setDescription("Has mandado un archivo invalido.\nCancelando proceso...")
                        interaction.editReply({embeds: [embed2], components: []})
                        await wait(4000)
                        await interaction.deleteReply()
                    }
                } else {
                    delete current[interaction.user.id]
                    await wait(100) 
                    await userMsg.delete()
                    let embed2 = new MessageEmbed(embed)
                        .setDescription("No has mandado un archivo.\nCancelando proceso...")
                    interaction.editReply({embeds: [embed2], components: []})
                    await wait(4000)
                    await interaction.deleteReply()
                }
            } else {
                delete current[interaction.user.id]
                let embed2 = new MessageEmbed(embed)
                    .setDescription("Se ha acabado el tiempo de espera.\nCancelando proceso...")
                interaction.editReply({embeds: [embed2], components: []})
                await wait(4000)
                await interaction.deleteReply()
            }
        // handle shit with handlers
        } else {
            let handler = require('./handlers/'+interaction.commandName+'.js')
            handler.do(interaction)
        }
    }
})

if (process.env.PORT) {
    client.login(data.token)
	const http = require('http');  
    http.createServer(function (req, res) {     
        res.writeHead(200, {'Content-Type': 'text/plain'});     
        res.end('corriendo'); 
    }).listen(process.env.PORT || 5000);
} else {
	// LOCAL HOSTING SHIT.
    client.login(data.betaToken)
}