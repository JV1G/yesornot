// Make text with '>' till new line be green text for redpill-message paragraphs
function applyGreenTextAndLinks() {
    const messages = document.querySelectorAll('.redpill-message p');
    messages.forEach(message => {
        let content = linkify(message.innerText);  // First, make links clickable
        const lines = content.split('\n');
        const transformedLines = lines.map(line => {
            if (line.startsWith('>')) {
                return `<span class="greentext">${line}</span>`;
            }
            return line;
        });
        message.innerHTML = transformedLines.join('<br>');
    });
}

// When content is loaded, apply transformations
document.addEventListener('DOMContentLoaded', function() {
    applyGreenTextAndLinks();
});


function linkify(inputText) {
    const urlRegex = /((http|https):\/\/\S+)/gi;
    return inputText.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
}