/* Listen for enter on search */
searchInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        const searchTerm = e.target.value;
        window.location.href = `http://localhost:3000/pills/search?term=${encodeURIComponent(searchTerm)}`;
    }
});