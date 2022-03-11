let roblox = require("./roblox")
let { MessageEmbed } = require("discord.js")

module.exports = {
    do: async function(interaction) {
        await interaction.reply({content: "`Espere un momento...`"})
        let id = interaction.options.get("id").value
        let audioInfo = await roblox.getAssetInfo(id)
        if (audioInfo.status != 200) {
            interaction.editReply({content: "Hubo un error al intentar agarrar información del audio.\nMás información en la consola de Heroku."})
            console.log(await audioInfo.text())
            console.log(id)
            return;
        }
        let jsonInfo = await audioInfo.json()
		if (!jsonInfo["data"]) {
			interaction.editReply({content: "Hubo un error al intentar agarrar información del audio.\nMás información en la consola de Heroku."})
            console.log(JSON.stringify(jsonInfo))
            console.log(id)
            return;
        }
		jsonInfo = jsonInfo.data[0]
        if (jsonInfo.typeId != 3) {
            interaction.editReply({content: "La ID que pasaste no es de un audio."})
            return;
        }
        let audioStatus = await roblox.getAudioStatus(id, false)
        let embed = new MessageEmbed()
            .setTitle("Información del audio:")
        // .setDescription(`\`Aquí esta toda la información recolectada de la ID ${id}\``)
            .setColor(10092799)
            .setTimestamp()
            .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.avatarURL()
            })
            .setThumbnail("https://media.discordapp.net/attachments/913940309321334814/941441272328126544/eadc8982548a4aa4c158ba1dad61ff14.png")
            .setFields([
                {
                    name: "Nombre:",
                    value: `"${jsonInfo.name}"`
                },
                {
                    name: "Es publico:",
                    value:  (jsonInfo["isCopyingAllowed"] == false && "No" || "Si")
                },
                {
                    name: "Estado:",
                    value: audioStatus[1]
                },
                {
                    name: "Tipo de creador:",
                    value: (jsonInfo.creator.type == "User" && "Usuario" || "Grupo")
                },
                {
                    name: "Nombre del creador:",
                    value: (jsonInfo.creator.type == "User" && `[Clickeame para ir a su perfil.](https://roblox.com/users/${jsonInfo.creator.targetId}/profile)` || `[Clickeame para ir al grupo](https://roblox.com/groups/${jsonInfo.creator.targetId}/)`)
                }
            ])
        interaction.editReply({content: "Resultado:", embeds: [embed]})
    }
}