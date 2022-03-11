let roblox = require("./roblox")
module.exports = {
    do: async function(interaction) {
        await interaction.reply({content: "`Espere un momento...`"})
        let status = await roblox.getAccountStatus()
        if (status.message == "OK") {
            interaction.editReply({content: `Estado de la cuenta: \`${status.message}\``})
        } else {
            interaction.editReply({content: `Estado de la cuenta: \`${status.message}\`\nTipo de ban: \`${status.description}.\`\nDescripción: \`"${status.reason}"\``})
        }
    }
}