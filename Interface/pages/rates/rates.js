import { UserDataVar, UserKeyVar, UserNameVar } from '../../logic/consts.js';
import getActualRates from '../../logic/rates/get-actual-rates.js';
import loggedIn from '../../logic/user/is-logged-in.js';
import updateLocalStorage from '../../logic/local-storage/update-local-storage.js';
import updateRemoteStorage from '../../logic/user/update-remote-storage.js';
import cleanupLocalStorage from '../../logic/local-storage/cleanup-local-storage.js';

async function init() {
    if (!loggedIn()) {
        window.location.href = "../login/login.html";
        return;
    }

    const actualRatesResult = await getActualRates();

    if (!actualRatesResult.ok) {
        alert(actualRatesResult.error);
        return;
    }

    const userdataRaw = localStorage.getItem(UserDataVar);
    const userdata = JSON.parse(userdataRaw);

    renderPage(userdata, actualRatesResult.rates);

    registerAddPurchaseButtonListeners(actualRatesResult.rates);
    registerLogoutButtonListeners();

    unlockPage();

    function unlockPage() {
        document.getElementById("loader").style.display = "none";
        document.getElementById("app").style.display = "block";
    }
}

function renderTotalSummary(userdata, actualRates) {
    if (Object.keys(userdata.purchases).length === 0) {
        return;
    }

    const { totalCurrentCost, totalPurchaseCost } = calculateTotalSummary();

    const diff = totalCurrentCost - totalPurchaseCost;
    const percent = (diff / totalPurchaseCost) * 100;

    // Определяем цвет
    let colorClass = "gray";
    if (percent > 0.01) colorClass = "green";
    else if (percent < -0.01) colorClass = "red";

    const summaryElement = document.getElementById("total-summary");

    // Обновляем содержимое и стили
    summaryElement.className = `summary ${colorClass}`;
    summaryElement.innerHTML = `
        ${totalCurrentCost.toFixed(2)} <sup>${percent.toFixed(2)}%</sup>
    `;

    summaryElement.style.display = "";

    return;

    function calculateTotalSummary() {
        let totalCurrentCost = 0;
        let totalPurchaseCost = 0;
        
        Object.keys(userdata.purchases).forEach(currency => {
            const currentRate = actualRates[currency];

            if (!currentRate) {
                alert("Не удалось получить курс конвертации для валюты " + currency + ". Эта валюта не будет участвовать в расчётах");
                return;
            }

            for (const operation of userdata.purchases[currency]) {
                const { amount, price } = operation;
    
                totalPurchaseCost += amount * price;
                totalCurrentCost += amount * currentRate;
            }
        });
      
        return {
            totalCurrentCost,
            totalPurchaseCost
        };
    }
}

function renderCurrenciesTable(userdata, actualRates) {
    const container = document.getElementById("currency-list");
    container.innerHTML = "";
  
    Object.keys(userdata.purchases).forEach(currency => {
        const currentPrice = actualRates[currency];
        const purchases = userdata.purchases[currency];
    
        let totalAmount = 0;
        let totalCost = 0;
    
        for (const purchase of purchases) {
            totalAmount += purchase.amount;
            totalCost += purchase.amount * purchase.price;
        }
  
        const currentCost = totalAmount * currentPrice;
        const diff = currentCost - totalCost;
        const percent = (diff / totalCost) * 100;
    
        const colorClass =
            percent > 0.01 ? "green" :
            percent < -0.01 ? "red" : "gray";
    
        const wrapper = document.createElement("div");
        wrapper.className = "currency-item";
    
        const header = document.createElement("div");
        header.className = "currency-header";
    
        const name = document.createElement("div");
        name.className = "currency-name";
        name.textContent = currency.toUpperCase();
    
        const value = document.createElement("div");
        value.className = `currency-value ${colorClass}`;
        value.innerHTML = `${currentCost.toFixed(2)} <sup>${percent.toFixed(2)}%</sup>`;
    
        const table = document.createElement("table");
        table.className = "currency-table hidden";
        table.innerHTML = `
            <thead>
            <tr>
                <th>Количество</th>
                <th>Цена покупки</th>
                <th>Сумма покупки</th>
                <th>Текущая цена</th>
                <th>Текущая стоимость</th>
                <th>Отношение</th>
            </tr>
            </thead>
            <tbody>
            </tbody>
        `;
    
        const tbody = table.querySelector("tbody");
    
        purchases.forEach(purchase => {
            const buySum = purchase.amount * purchase.price;
            const currSum = purchase.amount * currentPrice;
            const ratio = ((currSum / buySum - 1) * 100).toFixed(2);
    
            const ratioClass =
            ratio > 0.01 ? "green" :
            ratio < -0.01 ? "red" : "gray";
    
            const row = document.createElement("tr");
            row.innerHTML = `
            <td>${purchase.amount}</td>
            <td>${purchase.price}</td>
            <td>${buySum.toFixed(2)}</td>
            <td>${currentPrice.toFixed(8)}</td>
            <td>${currSum.toFixed(2)}</td>
            <td class="${ratioClass}">${ratio}%</td>
            `;
            tbody.appendChild(row);
        });
    
        header.appendChild(name);
        header.appendChild(value);

        header.addEventListener("click", () => {
            table.classList.toggle("hidden");
        });
    
        wrapper.appendChild(header);
        wrapper.appendChild(table);
        container.appendChild(wrapper);
    });
}

init();

function registerAddPurchaseButtonListeners(actualRates) {
    const toggleBtn = document.getElementById("toggle-add-form");
    const closeBtn = document.getElementById("close-add-form");
    const form = document.getElementById("add-purchase-form");

    const tokenInput = document.getElementById("input-token");
    const amountInput = document.getElementById("input-amount");
    const priceInput = document.getElementById("input-price");
    const saveButton = document.getElementById("save-purchase-button");

    // Показ формы
    toggleBtn.addEventListener("click", () => {
        form.style.display = "flex";
        toggleBtn.style.display = "none";
        closeBtn.style.display = "inline-block";
    });

    // Закрытие формы
    closeBtn.addEventListener("click", () => {
        form.style.display = "none";
        toggleBtn.style.display = "inline-block";
        closeBtn.style.display = "none";
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const userdata = JSON.parse(
            localStorage.getItem(UserDataVar)
        );

        const username = localStorage.getItem(UserNameVar);
        const userkey = localStorage.getItem(UserKeyVar) ?? sessionStorage.getItem(UserKeyVar);

        updateLocalStorage(
            userdata,
            tokenInput.value.trim(),
            Number(amountInput.value.trim()),
            Number(priceInput.value.trim())
        );
        await updateRemoteStorage(username, userdata, userkey);

        renderPage(userdata, actualRates);
    
        form.reset();
        form.style.display = "none";
        toggleBtn.style.display = "inline-block";
        closeBtn.style.display = "none";
    });

    [tokenInput, amountInput, priceInput].forEach(input => {
        input.addEventListener("input", validateFormFields);
    });

    function validateFormFields() {
        const token = tokenInput.value.trim();
        const amount = amountInput.value.trim();
        const price = priceInput.value.trim();

        const isValid = token !== "" && amount !== "" && price !== "";

        saveButton.disabled = !isValid;
    }
}

function registerLogoutButtonListeners() {
    document
        .getElementById("logout-btn")
        .addEventListener(
            "click",
            () => {
                cleanupLocalStorage();
                window.location.href = "../login/login.html";
            }
        );
}

function renderPage(userdata, actualRates) {
    renderTotalSummary(userdata, actualRates);
    renderCurrenciesTable(userdata, actualRates);
}