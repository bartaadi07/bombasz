function nyit_main_page() {
    document.getElementById("main_page").style.display = "block";
    document.getElementById("products_page").style.display = "none";
    document.getElementById("contacts_page").style.display = "none";
}
function nyit_products() {
    document.getElementById("main_page").style.display = "none";
    document.getElementById("products_page").style.display = "block";
    document.getElementById("contacts_page").style.display = "none";
    frissit();
}
function nyit_contacts() {
    document.getElementById("main_page").style.display = "none";
    document.getElementById("products_page").style.display = "none";
    document.getElementById("contacts_page").style.display = "block";
}
function getKosarMennyiseg(termek) {
    return parseInt(localStorage.getItem(termek) || "0", 10);
}

function setKosarMennyiseg(termek, mennyiseg) {
    if (mennyiseg > 0) {
        localStorage.setItem(termek, mennyiseg);
    } else {
        localStorage.removeItem(termek);
    }
}
function hozzaad() {
    const uj_a = parseInt(document.getElementById("alma_mezo").value)   || 0;
    const uj_k = parseInt(document.getElementById("korte_mezo").value)  || 0;
    const uj_b = parseInt(document.getElementById("banan_mezo").value)  || 0;
    let a = parseInt(localStorage.getItem("alma")   || "0", 10);
    let k = parseInt(localStorage.getItem("korte")  || "0", 10);
    let b = parseInt(localStorage.getItem("banan")  || "0", 10);
    a += uj_a;
    k += uj_k;
    b += uj_b;
    localStorage.setItem("alma",   a);
    localStorage.setItem("korte",  k);
    localStorage.setItem("banan",  b);
    frissit();    
}
function frissit() {
    const lista = document.getElementById("kosar_lista");
    if (!lista) return;

    lista.innerHTML = "";

    const termekek = [
        { nev: "Alma",  key: "alma",  ar: 500 },
        { nev: "Körte", key: "korte", ar: 600 },
        { nev: "Banán", key: "banan", ar: 700 }
    ];

    let vanBarmelyik = false;
    termekek.forEach(t => {
        const mennyiseg = getKosarMennyiseg(t.key);
        if (mennyiseg > 0) {
            vanBarmelyik = true;
            const osszeg = mennyiseg * t.ar;
            const li = document.createElement("li");
            li.innerHTML = `
                ${t.nev}: ${mennyiseg} kg 
                <span style="color:#4caf50; margin-left:10px;">
                    ${osszeg} Ft
                </span>
                <button onclick="torol('${t.key}')">Törlés</button>
            `;
            lista.appendChild(li);
        }
    });

    if (!vanBarmelyik) {
        lista.innerHTML = '<li class="empty-msg">A kosarad jelenleg még üres...</li>';
    }
}
function torol(mit) {
    localStorage.removeItem(mit);
    frissit();
}
document.addEventListener("DOMContentLoaded", () => {
    frissit();
});