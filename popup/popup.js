THREAD_COUNT = 10;
/**
 * Get the token from the chrome storage
 * @returns {Promise} token as a Promise 
 */
function getToken() {
    const token = new Promise(function(resolve, reject) {
        return chrome.storage.sync.get('token').then((token) => {
            resolve(token.token);   
        });
    });
    return token;
}

/**
 * Get the user email from chrome storage
 * @returns {Promise} email as a Promise 
 */
function getEmail() {
    const email = new Promise(function(resolve, reject) {
        return chrome.storage.sync.get('email').then((email) => {
            resolve(email.email);   
        });
    });
    return email;
}

/**
 * Gets the email threads from the user's inbox
 * @param {*} theadCount 
 * @returns Array of email thread ids
 */
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

/**
 * Gets the email thread ids from the email threads
 * @param {*} threads
 * @returns Array of email thread ids
 */
function getEmailThreadIds(threads) {
    let tmap =  threads.threads.map((thread) => {
        return thread.id;
    });
    return tmap;
}

/**
 * Gets the email message data using the thread id
 * @param {*} thread_id
 * @returns Email message
 */
async function getMessage(thread_id) {
    let email = await getEmail();
    let token = await getToken();
    let message = fetch(`https://gmail.googleapis.com/gmail/v1/users/${email}/messages/${thread_id}?access_token=${token}`)
    return message;
}

/**
 * Gets the email messages from the email threads
 * @param {*} thread_ids
 * @returns Array of email messages
 */
async function getEmailMessages(thread_ids) {
    let messages = [];
    for (let i = 0; i < thread_ids.length; i++) {
        let message = await getMessage(thread_ids[i]);
        message = await message.json();
        //console.log("Message: ", message);
        parsedMessage = parseEmailBody(message);
        senderEmail = parseSenderEmail(message);
        messages.push(parsedMessage);
    }
    return messages;
}

/**
 * Gets the email messages from the email threads
 * @param {*} thread_ids
 * @returns Array of email messages
 */
async function getMessages() {
    let threads = await getEmailThreads(THREAD_COUNT);
    let messages = await getEmailMessages(threads);
    return messages;
}

getMessages().then((messages) => {
    for (let i = 0; i < messages.length; i++) {
        console.log(messages[i]);
    }
});

/**
 * Converts the email message from base64 to text
 * @param {*} message
 * @returns Text of the email message
 */
function parseEmailBody(message) {
    let b64text = message.payload.body;
    if (b64text.size == 0) {
        b64text = message.payload.parts[0].body.data;
    } else {
        b64text = b64text.data;
    }
    b64text = b64text.replace(/-/g, '+').replace(/_/g, '/');
    let text = window.atob(b64text)
    return text;
}

function parseSenderEmail(message) {
    
}