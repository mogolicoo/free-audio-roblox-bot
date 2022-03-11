let roblox = require("./roblox")
let whitelisted = ["842049122085240902","351802711555178528","463363940273881097","323947428006985732"]

module.exports = {
    do: async function(interaction) {
        await interaction.reply({content: "`Espere un momento...`"})
        let status = await roblox.getAccountStatus()
        if (!whitelisted.includes(interaction.user.id)) {
            interaction.editReply({content: "no tienes permisos de usar este comando."})
            return
        }
        if (status.message == "OK") {
            interaction.editReply({content: "la cuenta no tiene ban, bozo."})
            return
        }
        let response = await roblox.restoreBan()
        let json = await response.json()
        if (response.status == 200) {
            interaction.editReply({content: "cuenta desbaneada sin problema."})
        } else {
            interaction.editReply({content: `hubo un error al intentar restaurar la cuenta, información json:\n\`\`\`\n${JSON.stringify(json)}\n\`\`\``})
        }
    }
}