document.getElementById("get-code").addEventListener("click", getCode);

function getCode() {
    let token = chrome.storage.sync.get('token').then((token) => {
        console.log(token);
        return token.token;   
    });

    chrome.runtime.sendMessage('', { 
        type: 'notification', 
        message: token 
    });
}

function onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    console.log('Name: ' + profile.getName());
    console.log('Image URL: ' + profile.getImageUrl());
    console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
  }


async function fetchAsync (url) {
    let response = await fetch(url);
    let data = await response.json();
    return data;
}

function gmailList(identity) {
    fetchAsync('https://gmail.googleapis.com/gmail/v1/users/' + identity + '/threads')
    .then(data => {
        console.log(data);
    })
}

chrome.identity.getProfileUserInfo(function(userInfo) {
    console.log(userInfo);
});