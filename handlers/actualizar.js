let roblox = require("./roblox")

module.exports = {
    do: async function(interaction) {
        await interaction.reply({content: "`Espere un momento...`"})
        // values
        let id = interaction.options.get("id").value
        let public = (interaction.options.get("publico") != null && interaction.options.get("publico").value) || null
        let comments = (interaction.options.get("comentarios") != null && interaction.options.get("comentarios").value) || null
        let descripcion = (interaction.options.get("descripcion") != null && interaction.options.get("descripcion").value) || null
        let name = (interaction.options.get("nombre") != null && interaction.options.get("nombre").value) || null
        // real shit
        let res = await roblox.changeSettings(id, public, comments, descripcion, name)
        if (res.status == 200) {
            await interaction.editReply({content: `Se ha actualizado el audio con exito!\nConfiguración actual:\`\`\`\nEs gratuito: ${(public == null && 'No cambiado') || public}\nComentarios activados: ${(comments == null && 'No cambiado') || comments}\nDescripción: "${(descripcion == null && 'No cambiado') || descripcion}"\nNombre: "${(name == null && 'No cambiado') || name}"\n\`\`\``})
        } else {
            await interaction.editReply({content: "Hubo un error al intentar actualizar el audio.\nMas información en la consola."})
            let json = await res.json()
            console.log(json)
        }
    }
}