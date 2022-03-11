const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");
let roblox = require("./roblox")

module.exports = {
    do: async function(interaction) {
        await interaction.reply({content: "`Espere un momento...`"})
        let groupId = interaction.options.get("grupo").value
        let res = await roblox.leaveGroup(groupId)
        if (res.status == 200) {
            await interaction.editReply({content: "Se ha salido del grupo con exito."})
        } else {
            await interaction.editReply({content: "Hubo un error al intentar salir del grupo.\nMas información en la consola."})
            console.log(res.status, res.statusText, await res.text())
        }
    }
}