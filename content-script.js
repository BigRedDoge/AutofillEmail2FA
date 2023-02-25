(async () => {
    const response = await chrome.runtime.sendMessage({test: "hello"});
    console.log(response);
})();