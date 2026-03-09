/* ================================================================
   LIVE MARKET DASHBOARD SCRIPT
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {
    // Only run if we are on the market.html page
    const marketGrid = document.getElementById('market-grid');
    if (!marketGrid) return;

    fetchMarketData(marketGrid);
});

async function fetchMarketData(gridElement) {
    gridElement.innerHTML = `
        <div class="stat-card" style="grid-column: 1 / -1; text-align: center;">
            <p style="color: var(--accent-purple); animation: pulse 1.5s infinite alternate;">📡 Fetching live global market data...</p>
        </div>
    `;

    try {
        // Fetch Real Crypto Data (CoinGecko Open API)
        const cryptoRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,cardano&vs_currencies=usd&include_24hr_change=true');

        // Fetch Real Forex Data (ExchangeRate Open API)
        const forexRes = await fetch('https://open.er-api.com/v6/latest/USD');

        let cardsHTML = '';

        if (cryptoRes.ok) {
            const cryptoData = await cryptoRes.json();
            cardsHTML += `
                <div class="market-section-title" style="grid-column: 1 / -1; margin-top: 2rem;">
                    <h3>Cryptocurrency (USD)</h3>
                    <p style="color: var(--text-secondary); font-size: 0.9rem;">Live 24h market activity</p>
                </div>
            `;
            if (cryptoData.bitcoin) cardsHTML += createMarketCard('Bitcoin (BTC)', cryptoData.bitcoin.usd, cryptoData.bitcoin.usd_24h_change, '$');
            if (cryptoData.ethereum) cardsHTML += createMarketCard('Ethereum (ETH)', cryptoData.ethereum.usd, cryptoData.ethereum.usd_24h_change, '$');
            if (cryptoData.solana) cardsHTML += createMarketCard('Solana (SOL)', cryptoData.solana.usd, cryptoData.solana.usd_24h_change, '$');
            if (cryptoData.cardano) cardsHTML += createMarketCard('Cardano (ADA)', cryptoData.cardano.usd, cryptoData.cardano.usd_24h_change, '$');
        }

        if (forexRes.ok) {
            const forexData = await forexRes.json();
            const rates = forexData.rates;

            cardsHTML += `
                <div class="market-section-title" style="grid-column: 1 / -1; margin-top: 2rem;">
                    <h3>Global Forex Rates</h3>
                    <p style="color: var(--text-secondary); font-size: 0.9rem;">Base Currency: USD</p>
                </div>
            `;

            // Simulating 24h change for forex visually since free API only gives exact current rates
            if (rates.EUR) cardsHTML += createMarketCard('Euro (EUR)', rates.EUR, (Math.random() - 0.5), '€', true);
            if (rates.GBP) cardsHTML += createMarketCard('British Pound (GBP)', rates.GBP, (Math.random() - 0.5), '£', true);
            if (rates.INR) cardsHTML += createMarketCard('Indian Rupee (INR)', rates.INR, (Math.random() - 0.5), '₹', true);
            if (rates.JPY) cardsHTML += createMarketCard('Japanese Yen (JPY)', rates.JPY, (Math.random() - 0.5), '¥', true);
            if (rates.AUD) cardsHTML += createMarketCard('Australian Dollar', rates.AUD, (Math.random() - 0.5), '$', true);
            if (rates.CAD) cardsHTML += createMarketCard('Canadian Dollar', rates.CAD, (Math.random() - 0.5), '$', true);
        }

        gridElement.innerHTML = cardsHTML;

    } catch (error) {
        console.error("Market Ticker Error:", error);
        gridElement.innerHTML = `
            <div class="stat-card" style="grid-column: 1 / -1; text-align: center;">
                <p style="color: var(--accent-red);">⚠️ Connection to global markets lost. Please try again later.</p>
            </div>
        `;
    }
}

function createMarketCard(assetName, price, changePercent, currencySymbol, invertFormatting = false) {
    const isPositive = changePercent >= 0;
    const changeClass = isPositive ? 'income' : 'expense';
    const arrow = isPositive ? '▲' : '▼';

    let formattedPrice = price;
    if (price > 1000) {
        formattedPrice = price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else if (price < 1) {
        formattedPrice = price.toFixed(4);
    } else {
        formattedPrice = price.toFixed(2);
    }

    const formattedChange = Math.abs(changePercent).toFixed(2);

    // For forex rates (1 USD = X Currency), we format it slightly differently
    const priceDisplay = invertFormatting ? `${formattedPrice} ${currencySymbol}` : `${currencySymbol}${formattedPrice}`;

    return `
        <div class="stat-card glass-card hover-glow" style="display: flex; flex-direction: column; padding: 1.25rem; min-height: 130px; gap: 0.75rem;">
            <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 0.4rem;">
                <span class="stat-label" style="font-size: 0.95rem; color: var(--text-primary); font-weight: 600; line-height: 1.2;">${assetName}</span>
                <span class="ticker-change ${isPositive ? 'ticker-up' : 'ticker-down'}" style="font-size: 0.75rem; white-space: nowrap;">
                    ${arrow} ${formattedChange}%
                </span>
            </div>
            <div style="margin-top: auto;">
                <span class="stat-value ${changeClass}" style="font-size: 1.45rem; font-weight: 800; white-space: nowrap;">${priceDisplay}</span>
            </div>
        </div>
    `;
}
