/*
chrome.runtime.onMessage.addListener(data => {
    console.log('Service worker received message', data)
    
    if (data.type === 'notification') {
        console.log('Service worker received test message', data.message)
        chrome.notifications.create(
            '',
            {
                type: 'basic',
                title: 'Test notification',
                message: String(data.message) || "fail",
                iconUrl: './logo/logo-48.png',
            },
        )
    }
});
*/
chrome.tabs.create({ url: chrome.runtime.getURL('index.html')})

/**
 * Saves the user's email to chrome storage
 * @returns the user's email
 */
async function setEmail() {
    let token = await getToken();
    let email = fetch(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${token}`)
        .then((response) => response.json())
        .then((data) => {
            chrome.storage.sync.set({'email': data.email}, function() {
                console.log('Email saved');
            });
            return data.email;
        });
    return email;
}

/**
 * Gets the user's oauth token from chrome storage
 * @returns the user's oauth token
 */
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

setEmail().then((email) => {
    console.log(email);
});


async function getEmailThreads(theadCount = 10) {
    let email = await getEmail();
    let token = await getToken();
    let threads = fetch(`https://gmail.googleapis.com/gmail/v1/users/${email}/threads?access_token=${token}&maxResults=${theadCount}`)
        .then((response) => response.json())
        .then((data) => {
            return data;
        });
    return threads;
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log("Tab: ", sender);
        console.log("Request: ", request);
        /*
        console.log(sender.tab ?
                    "from a content script:" + sender.tab.url :
                    "from the extension");
        */
        if (request.tab)
            sendResponse({farewell: "goodbye"});
    }
);
