const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");
let roblox = require("./roblox")
const embed = new MessageEmbed()
    .setThumbnail("https://tr.rbxcdn.com/c1d7cf47b3490944fdb21bdae101a250/420/420/Gear/Png")
    .setColor(10092799)
    .setTitle("Proceso de unirse a un grupo.")


module.exports = {
    do: async function(interaction) {
        // discord shit
        let wait = new MessageEmbed(embed).setDescription("`Espere un momento...`")
        let reply = await interaction.reply({embeds: [wait], fetchReply: true})
        let groupId = interaction.options.get("grupo").value
        let groupInfo = await roblox.getGroupInfo(groupId)
        let firstTry = await roblox.joinGroup(groupId)
        let filter = msg => { return (msg.author.id == interaction.user.id && msg.mentions.repliedUser == interaction.client.user && msg.reference.messageId == reply.id) }
        // embed shit
        let retrying = new MessageEmbed(embed).setDescription("Espere mientras intento unir la cuenta\nal grupo.")
        let success = new MessageEmbed(embed).setDescription(`Todo ha salido correctamente.\nInformación del grupo:\`\`\`\nNombre del grupo: "${groupInfo.data[0].name}"\nDescripción: "${groupInfo.data[0].description}"\nID del grupo: ${groupId}\n\`\`\``)
        let fail2 = new MessageEmbed(embed).setDescription("Hubo un error inesperado, porfavor intentelo mas tarde.")
        let fail3 = new MessageEmbed(embed).setDescription("Se ha acabado el tiempo de espera.\nIntentelo de nuevo.")
        // handling
        if (firstTry[0] != 200) {
            let fail1 = new MessageEmbed(embed).setDescription("Hubo un error, por favor siga estos pasos:\n```\n- Aprete el texto para ir a la pagina.\n- Resuelva el captcha.\n- Copie la token y responda al mensaje con la token. (solo tienes 10 minutos)\n```\nUna vez completes estos pasos\nla cuenta ya estara listo!\n[Apreta aquí para completar el captcha!](https://rblx-groupcaptcha.herokuapp.com/captcha?data="+firstTry[1].blobData+")")
            await interaction.editReply({embeds: [fail1]})
            let collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 600000 });
            let userMsg = collected.first();
            if (userMsg) { 
                await userMsg.delete()
                await interaction.editReply({embeds: [retrying]})
                let decoded = Buffer.from(userMsg.content, 'base64').toString('utf-8')
                let secondTry = await roblox.joinGroup(groupId, {id: firstTry[1].captchaId, token: decoded})
                if (secondTry[0] != 200) {
					console.log('unir.js got error response:',secondTry[1])
                    await interaction.editReply({embeds: [fail2]})
                } else {
                    await interaction.editReply({embeds: [success]})
                }
            } else {
                await interaction.editReply({embeds: [fail3]})
            }
        } else {
            await interaction.editReply({embeds: [success]})
        }
    }
}