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
            let ids = [];
            for (let i = 0; i < data.threads.length; i++) {
                ids.push(data.threads[i].id)
            }
            return ids;
        });
    return threads;
}

/**
 * Gets the email thread ids from the email threads
 * @param {*} threads
 * @returns Array of email thread ids
 */
function getEmailThreadIds(thread, index, threads) {
    threads[index] = thread.id;
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
        messages.push({
            "sender": senderEmail,
            "body": parsedMessage
        });
    }
    return messages;
}

/**
 * Gets the email messages from the email threads
 * @param {*} thread_ids
 * @returns Array of email messages
 */
async function getEmails() {
    let threads = await getEmailThreads(THREAD_COUNT);
    let emails = await getEmailMessages(threads);
    return emails;
}

/**
 * Converts the email message from base64 to text
 * @param {*} message
 * @returns Text of the email message
 */
function parseEmailBody(message) {
    let b64text = message.payload.body;
    if (!b64text || b64text.size == 0) {
        b64text = message.payload.parts[0].body.data;
    } else {
        b64text = b64text.data;
    }
    if (b64text) {
        b64text = b64text.replace(/-/g, '+').replace(/_/g, '/');
        let text = window.atob(b64text)
        return text;
    } else {
        return "";
    }  
}

/**
 * Gets the sender email address from the email message
 * @paraxm {*} message 
 * @returns sender email address
 */
function parseSenderEmail(message) {
    let sender = "";
    let headers = message.payload.headers;
    headers.forEach((header) => {
        if (header.name == "From") {
            sender = header.value;
        }
    });
    return sender;
}

/**
 * Searches the email messages for the 2FA code
 * @param {*} email
 * @returns 2FA code
 */
function get2FACode(body) {
    code = "";
    regex2fa = ['/(\d{6})/g', '/(\d{6})/g', '/(\d{7})/g', '/(\d{8})/g'];
    regex2fa.forEach((regex) => {
        if (body.match(regex)) {
            code = body.match(regex/g)[0];
        }
    });
    console.log(body.match(/(\d{6})/g));
    return code;
}

getEmails().then((messages) => {
    console.log("Messages: ", messages);
    messages.forEach((message) => {
        code = get2FACode(message.body);
        console.log("Code: ", code);
    });
});