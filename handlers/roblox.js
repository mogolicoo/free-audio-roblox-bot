// roblox functions
const data = require("./../keys.json")
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const modulo = {}

// misc
modulo.download = async function (url, isBase64){
    return new Promise(async (resolve) => {
		let response = await fetch(url);
		let buff = await response.buffer();
        if (isBase64 == true) {
            resolve(buff.toString('base64'))
        } else {
            resolve(buff)
        }
    })
}

modulo.getXCSRF = async function () {
    let res = await fetch("https://auth.roblox.qq.com/v2/logout", {
        method: "POST",
        headers: {
            "Cookie": `.ROBLOSECURITY=${data.roblosecurity}`
        }
    })
    return res.headers.get("x-csrf-token");
}

// account stuff
modulo.getAuthenticated = async function () {
    let res = await fetch("https://users.roblox.qq.com/v1/users/authenticated", {
        headers: {
            "User-Agent": "Roblox/WinInet",
            "Cookie": `.ROBLOSECURITY=${data.roblosecurity}`
        }
    })
    return await res.json();
}

modulo.getAccountStatus = async function () {
    let resData = await fetch("https://users.roblox.qq.com/v1/users/authenticated", {
        method: "GET",
        headers: {
            "User-Agent": "Roblox/WinInet",
            "Cookie": `.ROBLOSECURITY=${data.roblosecurity}`
        }
    })
    resData = await resData.json()
    if (resData["id"]) {
        return {message: "OK"}
    } else {
        let banInfo = await fetch("https://usermoderation.roblox.qq.com/v1/not-approved", {
            method: "GET",
            headers: {
                "Cookie": `.ROBLOSECURITY=${data.roblosecurity}`
            }
        })
        banInfo = await banInfo.json()
        return {message: "Baneado.", description: banInfo.punishmentTypeDescription, reason: banInfo.messageToUser}
    }
}

modulo.restoreBan = async function () {
    let XCSRFTOKEN = await modulo.getXCSRF()
    let res = await fetch("https://usermoderation.roblox.qq.com/v1/not-approved/reactivate", {
        method: "POST", 
        headers: {
            "Cookie": `.ROBLOSECURITY=${data.roblosecurity}`,
            "x-csrf-token": XCSRFTOKEN,
        }
    })
    return res
}

// audio stuff
modulo.upload = async function (content, name, gid) {
    let XCSRFTOKEN = await modulo.getXCSRF()
    let uploadData = {file: content, name: name, paymentSource: "User"}
    if (gid != null) {uploadData["groupId"] = gid}
    let res = await fetch(`https://publish.roblox.qq.com/v1/audio`, {
        method: "POST",
        headers: {
	        "Content-Type": "application/json",
            "User-Agent": "Roblox/WinInet",
            "x-csrf-token": XCSRFTOKEN,
            "Cookie": `.ROBLOSECURITY=${data.roblosecurity}`,
        },
        body: JSON.stringify(uploadData)
    })
    return [await res.json(), res.status]
}

modulo.archiveAudio = async function (id, status) {
    if (status == null) {
        return {"status": 200};
    } else if (status == true) {
        let XCSRFTOKEN = await modulo.getXCSRF()
        let res = await fetch(`https://develop.roblox.qq.com/v1/assets/${id}/archive`, {
            method: "POST", 
            headers: {
                "Cookie": `.ROBLOSECURITY=${data.roblosecurity}`,
                "x-csrf-token": XCSRFTOKEN,
            }
        })
        return res
    } else if (status == false) {
        let XCSRFTOKEN = await modulo.getXCSRF()
        let res = await fetch(`https://develop.roblox.qq.com/v1/assets/${id}/restore`, {
            method: "POST", 
            headers: {
                "Cookie": `.ROBLOSECURITY=${data.roblosecurity}`,
                "x-csrf-token": XCSRFTOKEN,
            }
        })
        return res
    }
}

modulo.getAudioStatus = async function (id, returnLink) {
    let assetRequest = await fetch(`https://assetdelivery.roblox.com/v1/assetId/${id}`, {
        method: "GET",
        headers: {
            "Cookie": `.ROBLOSECURITY=${data.americanCookie}`,
            "User-Agent": "Roblox/WinInet"
        }
    })
    assetRequest = await assetRequest.json()
    if (assetRequest["location"]) {
        if (returnLink == true) {
            return [200, assetRequest["location"]]
        } else {
            return [200, "Aprobado"]
        }
    } else if (assetRequest["errors"]) {
        let message = assetRequest["errors"][0]["message"]
        if (message == "Asset is not approved for the requester") {
            return [403, "No aprobado"]
        } else if (message == "Asset has not been reviewed") {
            return [403, "En verificación"]
        } else {
            return [403, "Desconocido"]
        }
    }
}

modulo.getAssetInfo = async function (id) {
    let res = await fetch(`https://develop.roblox.com/v1/assets?assetIds=${id}`, {
        method: "GET",
        headers: {
            "User-Agent": "Roblox/WinInet",
            "Cookie": `.ROBLOSECURITY=${data.americanCookie}`
        }
    })
    return res
}

modulo.changeSettings = async function (id, public, comments, description, name) {
    let settings = {}
    if (description != null) {
        settings["description"] = description
    } 
    if (name != null) {
        settings["name"] = name 
    }
    if (comments != null) {
        settings["enableComments"] = comments 
    }
    if (public != public) {
        settings["isCopyingAllowed"] = public
    }
    settings = JSON.stringify(settings)
    let XCSRFTOKEN = await modulo.getXCSRF()
    let res = await fetch(`https://develop.roblox.qq.com/v1/assets/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "User-Agent": "RobloxStudio/WinInet",
            "Cookie": `.ROBLOSECURITY=${data.roblosecurity}`,
            "x-csrf-token": XCSRFTOKEN
        },
        body: settings
    })
    return res
}

// asset info stuff
modulo.deleteAssetFromInventory = async function (id) {
    // workaround: set user-agent to Roblox/WinInet
    let XCSRFTOKEN = await modulo.getXCSRF()
    let res = await fetch(`https://www.roblox.qq.com/asset/delete-from-inventory?assetId=${id}`, {
        method: "POST",
        headers: {
            "Cookie": `.ROBLOSECURITY=${data.roblosecurity}`,
            "x-csrf-token": XCSRFTOKEN,
            "User-Agent": "Roblox/WinInet"
        }
    })
    res = await res.json()
    return res
}

// group stuff
modulo.joinGroup = async function (gid, captchaData) {
    let xcsrf = await fetch("https://groups.roblox.qq.com/v1/groups/"+gid+"/users", {method: "POST",headers: {"Cookie": `.ROBLOSECURITY=${data.roblosecurity}`, 'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36", 'origin': 'https://roblox.com', 'referer': 'https://roblox.com/', 'x-requested-with': 'XMLHttpRequest'}});xcsrf = xcsrf.headers.get("x-csrf-token")
    let requestData = {};
    if (captchaData != null) {
        requestData["captcha_provider"] = "PROVIDER_ARKOSE_LABS"
        requestData["captchaId"] = captchaData.id
        requestData["captchaToken"] = captchaData.token
    }
	console.log(xcsrf)
    let res = await fetch("https://groups.roblox.qq.com/v1/groups/"+gid+"/users", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Cookie": `.ROBLOSECURITY=${data.roblosecurity}`,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36",
			'Origin': 'https://roblox.com', 
			'Referer': 'https://roblox.com/', 
			'x-requested-with': 'XMLHttpRequest',
			"x-csrf-token": xcsrf,
        },
        body: JSON.stringify(requestData)
    })
    let status = res.status;
    res = await res.json()
	if (status!=200){console.log('roblox.js got group join error:',res)}
    if (res["errors"]) {
        let captchaData = JSON.parse(res.errors[0].fieldData)
        return [status, {"blobData": Buffer.from(captchaData.dxBlob).toString('base64'), "captchaId": captchaData.unifiedCaptchaId}]
    } else {
        return [status, res]
    }
}

modulo.leaveGroup = async function (gid) {
    let id = await modulo.getAuthenticated()
    id = id.id
    let xcsrf = await fetch("https://groups.roblox.qq.com/v1/groups/"+gid+"/users/"+id, {method: "DELETE",headers: {"Cookie": `.ROBLOSECURITY=${data.roblosecurity}`}});xcsrf = xcsrf.headers.get("x-csrf-token")
    let res = await fetch("https://groups.roblox.qq.com/v1/groups/"+gid+"/users/"+id, {
        method: "DELETE",
        headers: {
            "Cookie": `.ROBLOSECURITY=${data.roblosecurity}`,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36",
            "x-csrf-token": xcsrf
        }
    })
    return res
}

modulo.getGroupInfo = async function (gid) {
    let res = await fetch("https://groups.roblox.com/v2/groups?groupIds="+gid, {
        method: "GET",
        headers: {
            "Cookie": `.ROBLOSECURITY=${data.americanCookie}`,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36",
        }
    })
    return await res.json()
}

// exports
module.exports = modulo