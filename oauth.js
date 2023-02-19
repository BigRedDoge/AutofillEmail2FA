window.onload = function() {
    document.querySelector('button').addEventListener('click', function() {
        chrome.identity.getAuthToken({interactive: true}, function(token) {
            console.log(token);
            chrome.storage.sync.set({'token': token}, function() {
                console.log('Token saved');
            });
        });
    });
}