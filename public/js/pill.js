let pills = []; // Session pills are stored here
const nextButtons = document.querySelectorAll('.next-btn');

async function fetchRandomPill() {
    try {
        let response = await fetch('/random-pill');
        let data = await response.json();

        // Update the DOM with the fetched data
        updateRedpillContent(data);
        // Store the fetched pill in the session array
        pills.push(data);

        displayUniquePill();
       
        console.log(data); // For debugging
    } catch (error) {
        console.error('Error:', error);
    }
}

nextButtons.forEach(button => {
    button.addEventListener('click', fetchRandomPill);
});

function displayUniquePill() {
}

function updateRedpillContent(pill) {
    document.querySelector('.redpill-info-title').textContent = pill.title;
    document.querySelector('.author').textContent = pill.author;
    document.querySelector('.country').textContent = pill.country;
    document.querySelector('.redpilled').textContent = `${pill.redpilledCount} redpilled`;
    document.querySelector('.redpill-info-date').textContent = formatDate(new Date(pill.createdAt));

    document.querySelector('.redpill-info-id').textContent = `No. ${pill.pillId}`;
    
    const imagePathWithoutPublic = pill.imagePath.substring('public/'.length);
    document.querySelector('.redpill-image img').src = imagePathWithoutPublic;

    document.querySelector('.image-name').textContent = pill.imageName;
    document.querySelector('.image-name').setAttribute('title', pill.imageName);
    document.querySelector('.image-size').textContent = `(${pill.imageSize},`;
    document.querySelector('.image-res').textContent = `${pill.imageResolution})`;

    document.querySelector('.redpill-message p').textContent = pill.text;

    // Update message data
    let wordCount = pill.text.split(' ').length;
    let charCount = pill.text.length;
    document.querySelector('.word-count').textContent = `${wordCount} words`;
    document.querySelector('.char-count').textContent = `${charCount}/2000 letters`;
}

fetchRandomPill();



function formatDate(dateObj) {
    let day = dateObj.getDate().toString().padStart(2, '0');
    let month = (dateObj.getMonth() + 1).toString().padStart(2, '0'); // Months are 0 based, so +1
    let year = dateObj.getFullYear().toString().substr(-2); // Get the last 2 digits of the year
    let weekday = dateObj.toLocaleString('default', { weekday: 'short' });
    let hours = dateObj.getHours().toString().padStart(2, '0');
    let minutes = dateObj.getMinutes().toString().padStart(2, '0');
    let seconds = dateObj.getSeconds().toString().padStart(2, '0');
    return `${day}/${month}/${year} (${weekday}) ${hours}:${minutes}:${seconds}`;
}
