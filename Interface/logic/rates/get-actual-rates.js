export default async function getActualRates() {
    const actualRatesResult = await fetchActualRates();

    if (!actualRatesResult.ok) {
        return actualRatesResult;
    }

    const rates = actualRatesResult.rates
        .filter(rate => rate.symbol.endsWith("USDT"))
        .map(
            rate => [
                rate.symbol.slice(0, -4), // обрезаем USDT в конце, остаётся только название токена
                Number(rate.lastPrice)
            ]
        );

    return { ok: true, rates: Object.fromEntries(rates), error: null };
}

async function fetchActualRates() {
    try {
        const response = await fetch(
            "https://api.bybit.com/v5/market/tickers?category=spot",
            {
                method: 'GET',
                headers: {
                    "Content-Type": "text/plain"
                }
            }
        );

        if (!response.ok) {
            console.error("Ошибка при загрузке актуальных курсов: " + response.status);

            return { ok: false, error: "Не удалось получить актуальные курсы валют", rates: null };
        }

        const actualRatesRaw = await response.text();
        const actualRates = JSON.parse(actualRatesRaw).result.list;

        return { ok: true, rates: actualRates, error: null };
    } catch (error) {
        console.error("Ошибка при получении актуальных курсов: " + error);

        return { ok: false, error: "Не удалось получить актуальные курсы валют", rates: null };
    }
}