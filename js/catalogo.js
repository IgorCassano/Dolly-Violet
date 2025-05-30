"use strict";

// Funzione principale chiamata al caricamento della finestra
window.onload = () => {
    showHideLoader();
    checkLoginStatus();
    caricaDati();
}

// Funzione per inviare la richiesta e gestire la risposta
function caricaDati() {
    let tipoProdotto = new URLSearchParams(window.location.search).get("type");
    showHideLoader();
    fetchWithTimeout(urlGetData, { method: "GET" })
        .then(response => response.json())
        .then(dati => {
            if (dati) {
                PopolaProdotti(tipoProdotto, dati);
            } else if (dati.error) {
                showModal("ERRORE", dati.error.message);
            } else {
                showModal("ERRORE", "Errore sconosciuto dal server");
            }
        })
        .catch(err => {
            showModal("ERRORE", err.message);
        })
        .finally(() => {
            showHideLoader();
        });
}

// Funzione per aggiungere una riga di prodotti
function aggiungiRigaProdotti(contenitoreProdotti, contatore, prodotto) {
    if (contatore === 0 || contatore === 4) {
        contatore = 0;
        let riga = document.createElement("div");
        riga.classList.add("row");
        contenitoreProdotti.appendChild(riga);
    }
    let colonnaProdotto = addProduct(prodotto);
    contenitoreProdotti.lastElementChild.appendChild(colonnaProdotto);

    contatore++;
    return contatore;
}

// Funzione per popolare i prodotti filtrati
function PopolaProdotti(tipo, dati) {
    intervalAnimation();
    let contatore;
    const contenitoreProdotti = document.getElementById("content");

    switch (tipo) {
        case "best-seller":
            document.getElementById("titolo").textContent = "BEST SELLER";
            document.getElementById("titolo").dataset.text = "BEST SELLER";
            contatore = 0;
            for (let prodotto of dati.Shop) {
                if (prodotto.bestSeller) {
                    contatore = aggiungiRigaProdotti(contenitoreProdotti, contatore, prodotto);
                }
            }
            break;
        case "offerte":
            document.getElementById("titolo").textContent = "PRODOTTI IN OFFERTA";
            document.getElementById("titolo").dataset.text = "PRODOTTI IN OFFERTA";
            contatore = 0;
            for (let prodotto of dati.Shop) {
                if (prodotto.salePrice != 0) {
                    contatore = aggiungiRigaProdotti(contenitoreProdotti, contatore, prodotto);
                }
            }
            break;
        case null:
            document.getElementById("titolo").textContent = "TUTTI I PRODOTTI";
            document.getElementById("titolo").dataset.text = "TUTTI I PRODOTTI";
            contatore = 0;
            for (let prodotto of dati.Shop) {
                contatore = aggiungiRigaProdotti(contenitoreProdotti, contatore, prodotto);
            }
            break;
        default:
            document.getElementById("titolo").textContent = "FILTRATI PER : " + tipo.toUpperCase();
            document.getElementById("titolo").dataset.text = "FILTRATI PER : " + tipo.toUpperCase();
            contatore = 0;
            let presente = false;
            for (let prodotto of dati.Shop) {
                let parolechiave = prodotto.keyWords.toLowerCase();
                let tipoMinuscolo = tipo.toLowerCase();
                if (parolechiave.includes(tipoMinuscolo)) {
                    contatore = aggiungiRigaProdotti(contenitoreProdotti, contatore, prodotto);
                    presente = true;
                }
            }

            if (!presente) {
                let NienteProdotti = document.createElement("h3");
                NienteProdotti.textContent = "Ci dispiace ma non è stato trovato nessun prodotto con ricerca : " + tipo;
                contenitoreProdotti.classList.add("text-center","mb-5");
                contenitoreProdotti.appendChild(NienteProdotti);

                let ButtonGoHome = document.createElement("button");
                ButtonGoHome.classList.add("btn","btnGoHome","mt-5");
                ButtonGoHome.textContent = "Ritorna alla home";
                ButtonGoHome.addEventListener("click", () => {
                    redirectTo("index.html");
                })
                contenitoreProdotti.appendChild(ButtonGoHome);
            }
            break;
    }

    animatedProduct();
}