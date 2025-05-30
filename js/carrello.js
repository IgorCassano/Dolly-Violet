"use strict";

window.onload = () => {
    showHideLoader();
    if(localStorage.getItem("User") == null)
        showModal("Errore","Devi essere loggato per accedere al carrello","index.html");
    else{
        checkLoginStatus(); // Verifica lo stato di login dell'utente
        sendRequest(); // Invia la richiesta per recuperare i dati
        checkEmptyCart();
        // Gestione checkout
        const checkoutBtn = document.getElementById("checkout-btn");
        checkoutBtn.addEventListener("click", checkoutFunction);
    }
}

function checkEmptyCart() {
    const products = JSON.parse(localStorage.getItem("cart"));
    const summary = document.getElementById("summaryId");

    if (!products || products.length === 0) {
        summary.classList.add("d-none");
    }
    else {
        summary.classList.remove("d-none");
    }
}

/**
 * Funzione per inviare la richiesta al server e gestire la risposta.
 */
function sendRequest() {

    showHideLoader();
    // Effettua la richiesta GET con timeout
    fetchWithTimeout(urlGetData, { method: "GET" })
        .then(response => response.json())
        .then(data => {
            if (data) {
                findUserCart(data); // Trova il carrello dell'utente
            } else if (data.error) {
                showModal("ERROR", data.error.message); // Mostra errore dal server
            } else {
                showModal("ERROR", "Unknown error from the server");
            }
        })
        .catch(error => {
            showModal("ERROR", error.message); // Mostra errore della richiesta
        })
        .finally(() => {
            showHideLoader(); // Nasconde l'indicatore di caricamento
        });
}

/**
 * Funzione per trovare il carrello dell'utente nel set di dati.
 */
function findUserCart(data) {
    let cart = null;
    const user = JSON.parse(localStorage.getItem("User")); // Recupera l'utente dal localStorage
    //console.log(user);
    // Cerca il carrello dell'utente nel set di dati
    data.Users.forEach(userData => {
        if (userData.username === user.username) {
            cart = userData.shoppingCart; // Trova il carrello corrispondente all'utente
        }
    });

    localStorage.setItem("cart", JSON.stringify(cart));

    populateCart(cart, user); // Popola il carrello nella pagina
}

/**
 * Funzione per popolare il carrello con i prodotti.
 */
function populateCart(cart, user) {
    const contentDiv = document.getElementById("content"); // Contenitore dei prodotti nel carrello

    if (cart.length == 0) {
        contentDiv.classList.add("text-center");
        contentDiv.style.display = "flex";
        contentDiv.style.flexDirection = "column";
        contentDiv.style.alignItems = "center";
        contentDiv.style.justifyContent = "center";

        let titolo = document.createElement("h2");
        titolo.classList.add("noPorducts", "mt-5", "mb-2", "mb-lg-5");
        titolo.textContent = "Non ci sono prodotti all'interno del tuo carrello";

        let linkCatalogo = document.createElement("a");
        linkCatalogo.href = "catalogo.html";
        linkCatalogo.textContent = "Acquistane alcuni qui";
        linkCatalogo.classList.add("LinkCatalogo", "mt-5")
        contentDiv.appendChild(titolo);
        contentDiv.appendChild(linkCatalogo);
    } else {
        contentDiv.classList.add("col-lg-8");
        for (let product of cart) {
            // Verifica se il prodotto esiste già nel carrello
            let existingProductDiv = Array.from(contentDiv.getElementsByClassName("product"))
                .find(div => {
                    const productName = div.querySelector(".productName").textContent.trim();
                    const productSize = div.querySelector(".size").textContent.trim().split(":")[1].trim();
                    return productName === product.name && productSize === product.size; // Confronto nome e taglia
                });

            if (existingProductDiv) {
                updateProductQuantity(existingProductDiv, product); // Aggiorna la quantità del prodotto
            } else {
                addNewProductToCart(contentDiv, product, user); // Aggiungi nuovo prodotto al carrello
            }

            popolaSummary(cart, user);
        }
    }
    checkEmptyCart();
}

/**
 * Funzione per aggiornare la quantità di un prodotto già presente nel carrello.
 */
function updateProductQuantity(productDiv, product) {
    const quantityElement = productDiv.querySelector(".quantity");
    const priceElement = productDiv.querySelector(".price");
    const currentPrice = parseFloat(priceElement.textContent.replace(' €', '').trim());

    // Incrementa la quantità e aggiorna il prezzo
    quantityElement.textContent = parseInt(quantityElement.textContent) + 1;
    priceElement.textContent = (currentPrice + parseFloat(product.price))
        .toLocaleString('it-IT', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "€";
}

/**
 * Funzione per aggiungere un nuovo prodotto al carrello.
 */
function addNewProductToCart(contentDiv, product, user) {
    const productDiv = document.createElement("div");
    productDiv.classList.add("card", "p-2", "mb-3", "product");

    const rowDiv = document.createElement("div");
    rowDiv.classList.add("row");
    productDiv.appendChild(rowDiv);

    // Creazione della sezione immagine del prodotto
    const imageDiv = document.createElement("div");
    imageDiv.classList.add("col-md-5", "col-11", "mx-auto", "d-flex", "justify-content-center", "align-items-center", "shadow", "product_img");
    rowDiv.appendChild(imageDiv);

    const img = document.createElement("img");
    img.src = product.picture[0];
    img.classList.add("img-fluid");
    imageDiv.appendChild(img);

    // Creazione della sezione descrizione del prodotto
    const descriptionDiv = document.createElement("div");
    descriptionDiv.classList.add("col-md-7", "col-11", "mx-auto", "px-4", "mt-2");
    rowDiv.appendChild(descriptionDiv);

    const detailsDiv = document.createElement("div");
    detailsDiv.classList.add("row");
    descriptionDiv.appendChild(detailsDiv);

    const infoDiv = document.createElement("div");
    infoDiv.classList.add("col-12", "card-title", "mt-5");
    detailsDiv.appendChild(infoDiv);

    const productName = document.createElement("h1");
    productName.classList.add("mb-4", "productName");
    productName.textContent = product.name;
    infoDiv.appendChild(productName);

    const type = document.createElement("p");
    type.classList.add("mb-2");
    type.textContent = "• TYPE : " + product.type;
    infoDiv.appendChild(type);

    const size = document.createElement("p");
    size.classList.add("mb-2", "size");
    size.textContent = "• SIZE : " + product.size;
    infoDiv.appendChild(size);

    const productLink = document.createElement("a");
    productLink.href = `prodotto.html?id=${product.id}`;
    productLink.classList.add("mbh-3", "productLink");
    productLink.textContent = "• Pagina del Negozio";
    infoDiv.appendChild(productLink);

    // Creazione della sezione per la quantità e il prezzo
    const addDiv = document.createElement("div");
    addDiv.classList.add("row", "align-items-center", "mt-5");
    descriptionDiv.appendChild(addDiv);

    const quantityDiv = document.createElement("div");
    quantityDiv.classList.add("col-8", "d-flex", "align-items-center");
    addDiv.appendChild(quantityDiv);

    const subtractButton = document.createElement("button");
    subtractButton.textContent = "-";
    subtractButton.classList.add("minusButton", "btn", "mr-2", "mr-lg-3");
    subtractButton.addEventListener("click", () => {
        removeProductToCart(product, user);
    });
    quantityDiv.appendChild(subtractButton);

    const quantityElement = document.createElement("h2");
    quantityElement.textContent = "1";
    quantityElement.classList.add("quantity");
    quantityDiv.appendChild(quantityElement);

    const addButton = document.createElement("button");
    addButton.textContent = "+";
    addButton.classList.add("addButton", "btn", "ml-2", "ml-lg-3");
    addButton.addEventListener("click", () => {
        addProductToCart(product, user); // Aggiungi il prodotto al carrello
    });
    quantityDiv.appendChild(addButton);

    const priceDiv = document.createElement("div");
    priceDiv.classList.add("col-4", "d-flex", "justify-content-end", "price_money");
    addDiv.appendChild(priceDiv);

    const price = document.createElement("h3");
    price.classList.add("price");
    price.textContent = product.price.toLocaleString('it-IT', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + "€";
    priceDiv.appendChild(price);

    contentDiv.appendChild(productDiv); // Aggiungi il prodotto alla pagina
}

function removeProductToCart(product, user) {
    const params = {
        "id": product.id,
        "size": product.size, // Aggiungi la taglia del prodotto per una rimozione precisa
    };

    const urlParams = new URLSearchParams({
        "username": user.username
    });

    const finalUrl = `${urlRemoveCart}?${urlParams.toString()}`;

    showHideLoader();  // Mostra il loader mentre la richiesta è in corso

    fetchWithTimeout(finalUrl, {
        method: "DELETE", // Metodo DELETE per rimuovere il prodotto
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: params }) // Passiamo il prodotto nel corpo della richiesta
    })
        .then(response => response.json())
        .then(responseData => {
            if (responseData.message) {
                localStorageRefresh();
                window.location.reload();
            } else {
                showHideLoader(); // Nasconde l'indicatore di caricamento
                showModal("ERRORE", responseData.error || "Errore sconosciuto dal server");
            }
        })
        .catch(error => {
            showHideLoader(); // Nasconde l'indicatore di caricamento
            showModal("ERROR", error.message); // Mostra errore della richiesta
        })
}


/**
 * Funzione per aggiungere un prodotto al carrello dell'utente.
 */
function addProductToCart(product, user) {

    const params = {
        "id": product.id,
        "type": product.type,
        "name": product.name,
        "price": product.price,
        "picture": product.picture,
        "size": product.size
    };

    const urlParams = new URLSearchParams({
        "username": user.username
    });

    const finalUrl = `${urlAddCart}?${urlParams.toString()}`;

    showHideLoader();

    fetch(finalUrl, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: params })
    })
        .then(response => response.json())
        .then(responseData => {
            if (responseData) {
                localStorageRefresh();
                window.location.reload();
            } else if (responseData.error) {
                showHideLoader(); // Nasconde l'indicatore di caricamento
                showModal("ERRORE", responseData.error.message); // Mostra l'errore
            } else {
                showHideLoader(); // Nasconde l'indicatore di caricamento
                showModal("ERRORE", "Unknown error from the server");
            }
        })
        .catch(error => {
            showHideLoader(); // Nasconde l'indicatore di caricamento
            showModal("ERROR", error.message); // Mostra errore della richiesta
        })
}

function popolaSummary(cart, user) {
    let totale = 0;
    let spedizione = 0;
    let product_total_amt = document.getElementById("product_total_amt");
    let Spedizione = document.getElementById("Spedizione");

    // Calcola il totale del carrello
    for (let product of cart) {
        totale += parseFloat(product.price);
    }

    // Calcola la spedizione in base al paese dell'utente
    switch (user.country) {
        case 'America':
            spedizione = 25.00; // Spedizione per l'America
            break;
        case 'Japan':
            spedizione = 18.00; // Spedizione per il Giappone
            break;
        case 'India':
            spedizione = 15.00; // Spedizione per l'India
            break;
        case 'Nepal':
            spedizione = 20.00; // Spedizione per il Nepal
            break;
        case 'Italia':
            spedizione = 10.00; // Spedizione per l'Italia
            break;
        case 'Australia':
            spedizione = 30.00; // Spedizione per l'Australia
            break;
        case 'Germany':
            spedizione = 12.00; // Spedizione per la Germania
            break;
        case 'France':
            spedizione = 12.00; // Spedizione per la Francia
            break;
        case 'United Kingdom':
            spedizione = 15.00; // Spedizione per il Regno Unito
            break;
        case 'Canada':
            spedizione = 20.00; // Spedizione per il Canada
            break;
        case 'Brazil':
            spedizione = 25.00; // Spedizione per il Brasile
            break;
        case 'Mexico':
            spedizione = 20.00; // Spedizione per il Messico
            break;
        case 'China':
            spedizione = 18.00; // Spedizione per la Cina
            break;
        case 'South Korea':
            spedizione = 15.00; // Spedizione per la Corea del Sud
            break;
        case 'Russia':
            spedizione = 22.00; // Spedizione per la Russia
            break;
        case 'Spain':
            spedizione = 12.00; // Spedizione per la Spagna
            break;
        case 'Argentina':
            spedizione = 30.00; // Spedizione per l'Argentina
            break;
        case 'South Africa':
            spedizione = 28.00; // Spedizione per il Sud Africa
            break;
        case 'Egypt':
            spedizione = 25.00; // Spedizione per l'Egitto
            break;
        case 'Saudi Arabia':
            spedizione = 22.00; // Spedizione per l'Arabia Saudita
            break;
        case 'Turkey':
            spedizione = 20.00; // Spedizione per la Turchia
            break;
        case 'Portugal':
            spedizione = 12.00; // Spedizione per il Portogallo
            break;
        case 'Netherlands':
            spedizione = 12.00; // Spedizione per i Paesi Bassi
            break;
        case 'Sweden':
            spedizione = 15.00; // Spedizione per la Svezia
            break;
        case 'Belgium':
            spedizione = 12.00; // Spedizione per il Belgio
            break;
        case 'Switzerland':
            spedizione = 15.00; // Spedizione per la Svizzera
            break;
        default:
            spedizione = 30.00; // Spedizione di default
            break;
    }

    // Imposta il totale del prodotto
    product_total_amt.textContent = totale.toLocaleString('it-IT', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "€";
    // Imposta il totale della spedizione
    Spedizione.textContent = spedizione.toLocaleString('it-IT', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "€";

    // Aggiungi il totale finale (carrello + spedizione)
    let totalWithShipping = totale + spedizione;
    let total_amt = document.getElementById("total_amt");
    total_amt.textContent = totalWithShipping.toLocaleString('it-IT', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "€";
}

// Al momento non funzionante
function checkoutFunction() {
    const user = JSON.parse(localStorage.getItem("User"));
    const products = JSON.parse(localStorage.getItem("cart"));

    if (!products || products.length === 0) {
        showModal("ERROR", "Impossibile completare l'acquisto, il carrello è vuoto");
        return; // Esce dalla funzione se il carrello è vuoto
    }

    if (user.cvv == null || user.cardNumber == null || user.expirationDate == null || user.cardName == null) {
        let BtnUserPage = document.createElement("button");
        BtnUserPage.classList.add("btn", "btn-warning");
        BtnUserPage.textContent = "Vai a gestione account";
        BtnUserPage.addEventListener("click", () => {
            window.location.href = "account.html";
        })
        showModal("ERRORE", "Per favore inserisci i dati della tua carta per procedere all'acquisto", "", [BtnUserPage]);
    } else {
        const finalUrl = `${urlAddHistory}?username=${user.username}`;
        showHideLoader(); // Mostra il loader per l'inizio dell'operazione

        // Prima invio i prodotti alla cronologia acquisti
        fetchWithTimeout(finalUrl, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ products: products }) // Invia i prodotti come JSON
        })
            .then(response => response.json())
            .then(responseData => {
                if (responseData) {
                    removeFromShoppingCart(urlRemoveAllProducts + "?username=" + user.username);
                } else {
                    showModal("ERRORE", responseData.error || "Errore sconosciuto durante l'aggiunta alla cronologia degli acquisti");
                }
            })
            .catch(error => {
                showModal("ERROR", error.message); // Mostra errore della richiesta POST
            })
            .finally(() => {
                showHideLoader(); // Nasconde l'indicatore di caricamento, sia in caso di successo che errore
            });
    }
}

function removeFromShoppingCart(url) {
    showHideLoader();
    fetchWithTimeout(url, {
        method: "DELETE", // Metodo DELETE per rimuovere il prodotto
        headers: { 'Content-Type': 'application/json' }
    })
        .then(response => response.json())
        .then(responseData => {
            if (responseData.message) {
                localStorageRefresh();
                showModal("SUCCESSO", "Acquisto effettuato con successo spera che arrivinio i tuoi prodotti :D", "carrello.html");
            } else {
                showModal("ERRORE", responseData.error || "Errore sconosciuto dal server");
            }
        })
        .catch(error => {
            showModal("ERROR", error.message); // Mostra errore della richiesta
        })
        .finally(() => {
            showHideLoader(); // Nasconde l'indicatore di caricamento
        });
}