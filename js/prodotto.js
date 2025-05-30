"use strict";

let prodotto;

window.onload = () => {
    showHideLoader();
    checkLoginStatus();
    if (localStorage.getItem("User") == null) {
        showModal("Errore","Devi essre loggato se vuoi accedere a questa pagina", "index.html")
    } else
        ottieniProdotto();
}

/*Ottengo i dati del negozio */
function ottieniProdotto() {

    showHideLoader();
    fetchWithTimeout(urlGetData, { method: "GET" })
        .then(response => response.json())
        .then(response => {
            if (response)
                RicercaProdotto(response.Shop);
            else if (response.error) {
                showModal("ERRORE", response.error.message);
            }
            else {
                showModal("ERRORE", "Errore sconosciuto dal server");
            }
        }).catch(err => {
            showModal("ERRORE", err.message);
        }).then(_ => {
            showHideLoader();
        });
}

/*Ricerca per trovare il prodotto in base all'id*/
function RicercaProdotto(dati) {
    //console.log(dati);
    intervalAnimation();
    let codice = new URLSearchParams(window.location.search).get('id');
    
    for (let element of dati) {
        if (element.id == codice) {
            prodotto = element;
            break;
        }
    }

    if (prodotto == null) {

        showModal("Errore", "Nessuno prodotto trovato per questo codice, ci dispiace per il disagio creato", "index.html");
    }
    else {
        //console.log(prodotto);
        document.title = "DOLLY VIOLET - " + prodotto.name;
        AggiungiInformazioniDesktop();
        AggiungiInformazioniMobile();
    }
}

/* Popolamento informazioni carousel Mobile*/
function AggiungiInformazioniMobile() {

    let cont = 0;
    let carouselIndicators = document.getElementById("carousel-indicators");
    let carrouselInner = document.getElementById("carousel-inner");

    for (let img of prodotto.picture) {
        //console.log(img);
        let carouselItem = document.createElement("div");
        let target = document.createElement("li");

        carouselItem.classList.add("carousel-item");
        target.dataset.target = "#carouselExampleIndicators";
        target.dataset.SlideTo = cont;

        if (cont == 0) {
            carouselItem.classList.add("active");
            target.classList.add("active");
        }
        cont++;
        let image = document.createElement("img");
        image.src = img;
        image.classList.add("img-fluid", "w-100");

        //console.log(target);
        //console.log(image);

        carouselIndicators.appendChild(target);
        carouselItem.appendChild(image);
        carrouselInner.appendChild(carouselItem);
    }

    let buySectionMobile = document.getElementById("buySectionMobile");

    popolaSezioneAcquisto(buySectionMobile);
    intervalAnimation();
}

/*Popolamento informazioni desktop*/
function AggiungiInformazioniDesktop() {
    let divThumbnails = document.getElementById("divThumbnails");
    let divMainImage = document.getElementById("divMainImage");
    let cont = 0;

    for (let img of prodotto.picture) {
        let image = document.createElement("img");
        image.src = img;
        image.classList.add("thumnailsImg");
        divThumbnails.appendChild(image);
        image.addEventListener("click", () => {
            showHideLoader();
            var mainImg = document.getElementById('mainImg');
            mainImg.src = image.src;
            showHideLoader();
        })
        if (cont == 0) {
            let mainImg = document.createElement("img");
            mainImg.src = img;
            mainImg.id = "mainImg";
            mainImg.classList.add("img-fluid");
            divMainImage.appendChild(mainImg);
        }
        cont = 1;
    }

    let buySectionDesktop = document.getElementById("buySectionDesktop");
    popolaSezioneAcquisto(buySectionDesktop);

}

/*Popolazione summary*/
function popolaSezioneAcquisto(div) {
    let titlo = document.createElement("h1");
    titlo.textContent = prodotto.name;
    div.appendChild(titlo);

    let SizeTitle = document.createElement("h5");
    SizeTitle.textContent = "TAGLIA";
    SizeTitle.classList.add("mt-4")
    div.appendChild(SizeTitle);

    let cont = 0;

    let taglie = ["Small", "Medim", "Large", "XLarge", "XLLarge"];
    for (let element of prodotto.size) {
        let button = document.createElement("button");
        button.classList.add("sizeButton");
        button.textContent = taglie[cont++];
        if (!element)
            button.disabled = true;
        else
            button.addEventListener("click", () => {
                let buttons = document.querySelectorAll(".sizeButton");
                for (let btn of buttons) {
                    btn.classList.remove("selected");
                    btnAggiungiAlCarrello.disabled = false;
                }
                button.classList.add("selected");
            });
        div.appendChild(button);
    }

    let price = document.createElement("p");
    price.classList.add("price", "mt-4");
    if (prodotto.salePrice == 0) {
        price.textContent = "Prezzo : " + prodotto.price.toLocaleString('it-IT', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) + "€";
    }
    else {
        price.innerHTML = "Prezzo originale : " + "<s>" + prodotto.price.toLocaleString('it-IT', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) + "€" + "</s>" + "<br>" + "Prezzo scontato: " + prodotto.salePrice.toLocaleString('it-IT', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) + "€";
    }
    div.appendChild(price);

    let btnAggiungiAlCarrello = document.createElement("button");
    btnAggiungiAlCarrello.disabled = true;
    btnAggiungiAlCarrello.classList.add("btnAggiungiAlCarrello");
    btnAggiungiAlCarrello.textContent = "AGGIUNGI AL CARRELLO";
    btnAggiungiAlCarrello.addEventListener("click", addProductCarelloUtente);

    let divAcquisto = document.createElement("div");
    divAcquisto.classList.add("mt-4");
    divAcquisto.appendChild(btnAggiungiAlCarrello);
    div.appendChild(divAcquisto);

    let btnShowDetails = document.createElement("button");
    btnShowDetails.textContent = "Mostra dettagli";
    btnShowDetails.id = "Mostra";
    btnShowDetails.classList.add("showDetails", "mt-3");
    btnShowDetails.addEventListener("click", () => {
        if (btnShowDetails.id == "Nascondi") {
            btnShowDetails.id = "Mostra";
            details.classList.add("d-none");
            btnShowDetails.textContent = "Mostra dettagli";
        }
        else {
            btnShowDetails.id = "Nascondi";
            details.classList.remove("d-none");
            btnShowDetails.textContent = "Nascondi dettagli";
        }
    });
    div.appendChild(btnShowDetails);

    let details = document.createElement("p");
    details.classList.add("details", "d-none", "mt-4");
    details.innerHTML = prodotto.details;
    div.appendChild(details);

    intervalAnimation();
}

/* Aggiunta prodotto al carrello dell'utente */
function addProductCarelloUtente() {
    if (localStorage.getItem("User") == null)
        showModal("ERRORE", "Devi essere loggato se vuoi aggiungere prodotti al carrello");
    let taglia;
    let buttons = document.querySelectorAll(".sizeButton");
    for (let btn of buttons) {
        if (btn.classList.contains("selected"))
            taglia = btn.textContent;
    }
    //console.log(taglia);

    let utente = localStorage.getItem("User");
    utente = JSON.parse(utente);

    let prezzo;
    if (prodotto.salePrice == 0)
        prezzo = prodotto.price;
    else
        prezzo = prodotto.salePrice;

    let params = {
        "id": prodotto.id,
        "type": prodotto.type,
        "name": prodotto.name,
        "price": prezzo,
        "picture": prodotto.picture,
        "size": taglia
    };


    let UrlParams = new URLSearchParams({
        "username": utente.username,
    });

    let finalUrl = urlAddCart + "?" + UrlParams.toString();
    showHideLoader();

    fetch(finalUrl, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: params })
    })
        .then(response => response.json())
        .then(response => {
            if (response) {
                let buttonCarrello = document.createElement("button");
                buttonCarrello.classList.add("btn", "btn-success");
                buttonCarrello.textContent = "Vai al carrello";
                buttonCarrello.addEventListener("click", () => {
                    window.location.href = "carrello.html";
                })
                showModal("SUCCESSO", "Il prodotto è stato aggiunto con successo al carrello", "", [buttonCarrello]);
                localStorageRefresh();
            }
            else if (response.error) {
                showModal("ERRORE", response.error.message);
            }
            else {
                showModal("ERRORE", "Errore sconosciuto dal server");
            }
        }).catch(err => {
            showModal("ERRORE", err.message);
        }).then(_ => {
            showHideLoader();
        });
}
