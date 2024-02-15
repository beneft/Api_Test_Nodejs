function updateExchange() {
    const baseCurrency = document.getElementById("baseCurrencySelect").value;
    const targetCurrency = document.getElementById("targetCurrencySelect").value;
    sendExchangeToServer(baseCurrency, targetCurrency);
}

function sendExchangeToServer(base, target) {
    fetch('http://localhost:3000/exchangechange', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            base: base,
            target:target,
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