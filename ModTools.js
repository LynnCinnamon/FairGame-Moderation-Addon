

setTimeout(() => {


    let modSocket = new SockJS('https://fair.kaliburg.de/fairsocket');
let modStompClient = Stomp.over(modSocket);
stompClient.debug = null;

window.moderation = {
    ban(event) {
        let dataSet = event;
        if (confirm(`Are you sure you want to ban "${dataSet.username}" (${dataSet.accountId})`)) {
            moderation.send("/app/mod/ban/" + dataSet.accountId);
        }
    },
    mute(event) {
        let dataSet = event;
        if (confirm(`Are you sure you want to mute "${dataSet.username}" (${dataSet.accountId})`)) {
            moderation.send("/app/mod/mute/" + dataSet.accountId);
        }
    },
    rename(event) {
        let dataSet = event;
        let newName = prompt(`What would you like to name "${dataSet.username}" (${dataSet.accountId})`);
        if (newName) {
            moderation.send("/app/mod/name/" + dataSet.accountId, newName);
        }
    },
    free(event) {
        let dataSet = event;
        if (confirm(`Are you sure you want to free "${dataSet.username}" (${dataSet.accountId})`)) {
            moderation.send("/app/mod/free/" + dataSet.accountId);
        }
    },
    getModInfo()
    {
        console.log(modStompClient.subscribe('/user/queue/mod/info', (message) => this.displayModInfo(JSON.parse(message.body)), {uuid: getCookie("_uuid")}));
        moderation.send("/app/mod/info");
    },
    displayModInfo(message)
    {
        console.log(message);
    },
    send(destination) {
        moderation.send(destination, null);
    },
    send(destination, content) {
        let data = {uuid: getCookie("_uuid")}
        if (content) data.content = content;
        modStompClient.send(destination, {}, JSON.stringify(data));
    }
};

    let oldUpdateChat = window.updateChat;
    window.updateChat = function () {
        for (let i = chatData.messages.length-1; i >= 0; i--) {
            let message = chatData.messages[i];
            let modTools = `<a onclick="moderation.ban({username: '${message.username}', accountId: ${message.accountId}})">🔨</a> <a onclick="moderation.mute({username: '${message.username}', accountId: ${message.accountId}})">🤐</a> <a onclick="moderation.rename({username: '${message.username}', accountId: ${message.accountId}})">💬</a> <a onclick="moderation.free({username: '${message.username}', accountId: ${message.accountId}})">🔙</a> `;
            if(!message.timeCreated.includes("moderation.ban"))
            {
                message.timeCreated = modTools + message.timeCreated;
            }

            if(!message.checked)
            {
                //check message for words we want to ban
                window.bannedWords = [
                    "nigger",
                    "neggro",
                    "Naygor",
                    "卐",
                ];
                let banned = false;
                let instaBanned = false;
                for(let i = 0; i < window.bannedWords.length; i++)
                {
                    if(message.message.toLowerCase().includes(window.bannedWords[i].toLowerCase()) || message.username.toLowerCase().includes(window.bannedWords[i].toLowerCase()))
                    {
                        banned = true;
                        break;
                    }
                }
                if((banned || instaBanned) && !rankersAlreadyBanned.includes(message.accountId))
                {
                    if (instaBanned || true || confirm(`Are you sure you want to ban "${message.username}" (${message.accountId}) for saying "${message.message}"`)) {
                        moderation.send("/app/mod/ban/" + message.accountId);
                        rankersAlreadyBanned.push(message.accountId);
                    }
                    message.checked = true;
                }
            }
        }
        oldUpdateChat();



    }
    initChat(identityData.highestCurrentLadder);
}, 1000);