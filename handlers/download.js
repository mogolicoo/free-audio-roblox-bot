let roblox = require("./roblox")

module.exports = {
    do: async function(interaction) {
        await interaction.reply({content: "`Espere un momento...`", ephemeral: true})
        let id = interaction.options.get("id").value
        let status = await roblox.getAudioStatus(id, true);
        if (status[0] != 200) {
            interaction.editReply({content: "El audio no se puede descargar debido a que sigue en verificación o fue eliminado."})
            return
        }
        let buffer = await roblox.download(status[1], false);
        interaction.editReply({content: "Aquí tienes la descarga del audio:", files: [{
            attachment: buffer,
            name: "audio.ogg",
            description: "audio lol"
        }]})
    }
}