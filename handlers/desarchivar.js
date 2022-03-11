let roblox = require("./roblox")

module.exports = {
    do: async function(interaction) {
        await interaction.reply({content: "`Espere un momento...`"})
        let id = interaction.options.get("id").value
        let res = await roblox.archiveAudio(id, false)
        if (res.status == 200) {
            await interaction.editReply({content: "Se ha desarchivado el audio con exito!"})
        } else {
            await interaction.editReply({content: "Hubo un error al intentar desarchivar el audio.\nMas información en la consola."})
            let json = await res.json()
            console.log(json)
        }
    }
}