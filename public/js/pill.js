let pills = []; // Session pills are stored here

async function fetchRandomPill() {
    try {
        let response = await fetch('/random-pill');
        let data = await response.json();

        // Update the DOM with the fetched data
        updateRedpillContent(data);
        // Store the fetched pill in the session array
        pills.push(data);

       
        console.log(data); // For debugging
    } catch (error) {
        console.error('Error:', error);
    }
}

function updateRedpillContent(pill) {
    document.querySelector('.redpill-info-title').textContent = pill.title;
    document.querySelector('.author').textContent = pill.author;
    document.querySelector('.country').textContent = pill.country;
    document.querySelector('.redpilled').textContent = `${pill.redpilledCount} redpilled`;
    document.querySelector('.redpill-info-date').textContent = new Date(pill.createdAt).toLocaleString();
    document.querySelector('.redpill-info-id').textContent = `No. ${pill.pillId}`;
    
    const imagePathWithoutPublic = pill.imagePath.substring('public/'.length);
    document.querySelector('.redpill-image img').src = imagePathWithoutPublic;

    document.querySelector('.redpill-message p').textContent = pill.text;

    // Update message data
    let wordCount = pill.text.split(' ').length;
    let charCount = pill.text.length;
    document.querySelector('.word-count').textContent = `${wordCount} words`;
    document.querySelector('.char-count').textContent = `${charCount}/2000 letters`;
}

fetchRandomPill();
