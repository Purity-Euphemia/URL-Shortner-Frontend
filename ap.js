async function shortenURL() {
    const urlInput = document.getElementById('urlInput').value;
    const responseDiv = document.getElementById('response');

    if (!urlInput.trim()) {
        responseDiv.innerHTML = 'Please enter a URL to shorten.';
        return;
    }

    try {
        const response = await fetch("http://localhost:8080/shorten", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: urlInput })
        });

        if (!response.ok) {
            responseDiv.innerText = 'Failed to shorten URL. Please try again.';
            return;
        }

        const data = await response.json();
        const shortUrl = data.shortenedUrl;

        resultDiv.innerHTML = `Shortened URL: <a href="${shortUrl}" target="_blank">${shortUrl}</a>`;

    } catch (error) {
        console.error('Error:', error);
        responseDiv.innerHTML = 'Failed to connect to the server.';
    }
}