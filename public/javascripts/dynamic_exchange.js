document.addEventListener('DOMContentLoaded', function () {
    const exchangeData = JSON.parse(document.getElementById('exchangeData').textContent);

    const baseCurrencySelect = document.getElementById('baseCurrencySelect');
    const targetCurrencySelect = document.getElementById('targetCurrencySelect');

    exchangeData.exchangeKeys.forEach(currency => {
        const option = document.createElement('option');
        option.value = currency;
        option.text = currency;
        baseCurrencySelect.appendChild(option);
        const targetOption = option.cloneNode(true);
        targetCurrencySelect.appendChild(targetOption);
    });

    baseCurrencySelect.value = exchangeData.baseCurrency;
    targetCurrencySelect.value = exchangeData.targetCurrency;
});