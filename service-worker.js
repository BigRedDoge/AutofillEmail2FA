chrome.runtime.onMessage.addListener(data => {
    console.log('Service worker received message', data)
    
    if (data.type === 'notification') {
        console.log('Service worker received test message', data.message)
        chrome.notifications.create(
            '',
            {
                type: 'basic',
                title: 'Test notification',
                message: data.message || "fail",
                iconUrl: './logo/logo-48.png',
            },
        )
    }
});

chrome.tabs.create({ url: chrome.runtime.getURL('index.html')})


