document.getElementById('location').addEventListener('submit', function (event) {
    event.preventDefault();
    const cityInput = document.getElementById('city');
    const cityName = cityInput.value;
    sendCityToServer(cityName);
});

function sendCityToServer(cityName) {
    fetch('http://localhost:3000/citychange', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            city: cityName,
        }),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Server Response:', data);
            if (data.redirect) {
                window.location.href = data.redirect;
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}