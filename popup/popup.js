THREAD_COUNT = 10;

function getToken() {
    const token = new Promise(function(resolve, reject) {
        return chrome.storage.sync.get('token').then((token) => {
            resolve(token.token);   
        });
    });
    return token;
}

function getEmail() {
    const email = new Promise(function(resolve, reject) {
        return chrome.storage.sync.get('email').then((email) => {
            resolve(email.email);   
        });
    });
    return email;
}


async function getEmailThreads(theadCount = 10) {
    let email = await getEmail();
    let token = await getToken();
    let threads = fetch(`https://gmail.googleapis.com/gmail/v1/users/${email}/threads?access_token=${token}&maxResults=${theadCount}`)
        .then((response) => response.json())
        .then((data) => {
            return getEmailThreadIds(data);
        });
    return threads;
}

function getEmailThreadIds(threads) {
    let tmap =  threads.threads.map((thread) => {
        return thread.id;
    });
    return tmap;
}

async function getMessage(thread_id) {
    let email = await getEmail();
    let token = await getToken();
    let message = fetch(`https://gmail.googleapis.com/gmail/v1/users/${email}/messages/${thread_id}?access_token=${token}`)
    return message;
}

async function getEmailMessages(thread_ids) {
    let messages = [];
    for (let i = 0; i < thread_ids.length; i++) {
        let message = await getMessage(thread_ids[i]);
        message = await message.json();
        console.log("Message: ", message);
        messages.push(message);
    }
    return messages;
}

async function getMessages() {
    let threads = await getEmailThreads(THREAD_COUNT);
    let messages = await getEmailMessages(threads);
    return messages;
}

getMessages().then((messages) => {
    message = messages[0];
    payload = message.payload;
    parts = payload.parts;
    b64text = parts[0].body;
    text = atob(b64text.data);
    console.log(text);
});

