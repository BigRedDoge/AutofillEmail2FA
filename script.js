async function fetchCode() {
    const response = await fetch('https://google.com');
    const code = await response.text();
    return code;
}