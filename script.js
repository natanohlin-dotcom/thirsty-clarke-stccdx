// Initiera ikoner från Lucide
lucide.createIcons();
// Håller koll på vilken bild som visas i varje kort (CardIndex: ImageIndex)
window.slideStates = {};

// Funktion för att byta bild i slideshowen
function changeSlide(cardIndex, direction, totalSlides) {
  let currentIndex = window.slideStates[cardIndex];
  let newIndex = currentIndex + direction;

  // Snurra runt om vi når slutet/början
  if (newIndex >= totalSlides) newIndex = 0;
  if (newIndex < 0) newIndex = totalSlides - 1;

  // Göm den gamla bilden och pricken
  document
    .getElementById(`slide-${cardIndex}-${currentIndex}`)
    .classList.replace("opacity-100", "opacity-0");
  document
    .getElementById(`dot-${cardIndex}-${currentIndex}`)
    .classList.replace("bg-black", "bg-black/20");

  // Visa den nya bilden och pricken
  document
    .getElementById(`slide-${cardIndex}-${newIndex}`)
    .classList.replace("opacity-0", "opacity-100");
  document
    .getElementById(`dot-${cardIndex}-${newIndex}`)
    .classList.replace("bg-black/20", "bg-black");

  // Uppdatera minnet
  window.slideStates[cardIndex] = newIndex;
}
// Flik-motor (Single Page Navigation)
function switchPage(pageId, scrollToSection = null) {
  // 1. Dölj alla vy-flikar
  document.querySelectorAll(".page-view").forEach((el) => {
    el.classList.remove("active");
  });

  // 2. Visa den valda vy-fliken
  document.getElementById("view-" + pageId).classList.add("active");

  // 3. Hantera scroll
  if (scrollToSection && pageId === "main") {
    // Om vi ska till en specifik sektion på startsidan (t.ex. Om oss)
    setTimeout(() => {
      document
        .getElementById(scrollToSection)
        .scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  } else {
    // Om vi byter till en textsida, scrolla till toppen
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

// Formulärlogik (Hantera stegen i flerstegsformuläret)
function goToStep(step) {
  // Göm alla steg
  document
    .querySelectorAll(".form-step")
    .forEach((el) => el.classList.add("hidden-step"));
  // Visa valt steg
  document.getElementById("step" + step).classList.remove("hidden-step");

  // Uppdatera progress bar (Nu uppdaterad till 4 steg)
  for (let i = 1; i <= 4; i++) {
    const p = document.getElementById("p-" + i);
    if (p) {
      if (i <= step) {
        p.classList.remove("bg-gray-200");
        p.classList.add("bg-black");
      } else {
        p.classList.remove("bg-black");
        p.classList.add("bg-gray-200");
      }
    }
  }
  // Scrolla till toppen av formuläret
  //document
  //.getElementById("skicka-in")
  //.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Hantera formulärets inskick
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzwTo-wxxs_L9tScydbeLMlZw0Rpa9NiHn7LmC4bg5Xau9LxmNSZTUfxs0cufezqQFsZA/exec";

document.addEventListener("DOMContentLoaded", function () {
  const repairForm = document.getElementById("repairForm");

  if (repairForm) {
    repairForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // --- HONUNGS CHECK (Nu krocksäker) ---
      // Vi kollar först om elementet faktiskt existerar innan vi läser av .value
      const botCheckEl = document.getElementById("form-botcheck");
      if (botCheckEl && botCheckEl.value !== "") {
        console.log("Bot detected! Silently ignoring.");
        alert("Tack för din förfrågan! Vi har mottagit ditt ärende.");
        document.getElementById("repairForm").reset();
        goToStep(1);
        return;
      }

      const submitBtn = document.querySelector('#step4 button[type="submit"]');
      let originalText = "Skicka in förfrågan";
      if (submitBtn) {
        originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = "Skickar in förfrågan...";
        submitBtn.disabled = true;
        submitBtn.classList.add("opacity-50");
      }

      // Kolla vilket fraktalternativ som är valt (Krocksäkert)
      const shipSelf = document.getElementById("ship-self");
      const shipLabel = document.getElementById("ship-label");
      let shippingChoice =
        shipSelf && shipSelf.checked
          ? shipSelf.value
          : shipLabel
          ? shipLabel.value
          : "Ej valt";

      // HÄMTA DET NYA VÄRDET FÖR FELTYP
      let selectedError = "";
      const errorRadio = document.querySelector(
        'input[name="error_type"]:checked'
      );
      if (errorRadio) {
        selectedError = errorRadio.value;
      }

      // Samla all data med FormData - Nu med säkerhetskontroller (?.value || "")
      // Detta förhindrar att scriptet kraschar om ett fält (t.ex. företagsnamn) är tomt eller saknas
      const formData = new FormData();
      formData.append(
        "brand",
        document.getElementById("form-brand")?.value || ""
      );
      formData.append(
        "model",
        document.getElementById("form-model")?.value || ""
      );
      formData.append(
        "voltage",
        document.getElementById("form-voltage")?.value || ""
      );
      formData.append(
        "capacity",
        document.getElementById("form-capacity")?.value || ""
      );

      formData.append("errorType", selectedError);
      formData.append(
        "problem",
        document.getElementById("form-problem")?.value || ""
      );

      formData.append(
        "name",
        document.getElementById("form-name")?.value || ""
      );
      formData.append(
        "email",
        document.getElementById("form-email")?.value || ""
      );
      formData.append(
        "phone",
        document.getElementById("form-phone")?.value || ""
      );

      // Adressuppgifter
      formData.append(
        "address",
        document.getElementById("form-address")?.value || ""
      );
      formData.append(
        "postcode",
        document.getElementById("form-postcode")?.value || ""
      );
      formData.append(
        "city",
        document.getElementById("form-city")?.value || ""
      );
      // Företagsuppgifter
      formData.append(
        "customerType",
        document.getElementById("form-customer-type")?.value || "private"
      );
      formData.append(
        "companyName",
        document.getElementById("form-company-name")?.value || ""
      );
      formData.append(
        "orgNr",
        document.getElementById("form-org-nr")?.value || ""
      );
      formData.append(
        "reference",
        document.getElementById("form-reference")?.value || ""
      );
      // Fraktval
      formData.append("shipping", shippingChoice);

      // Skicka datan till Google Sheets
      fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        body: formData,
      })
        .then((response) => {
          alert("Tack för din förfrågan! Vi har mottagit ditt ärende.");
          sessionStorage.removeItem("prefilledBattery");
          document.getElementById("repairForm").reset();
          goToStep(1);
          // Återställ eventuell företagsvy till privatvy efter lyckat inskick
          if (typeof setCustomerType === "function") {
            setCustomerType("private");
          }
        })
        .catch((error) => {
          console.error("Error!", error.message);
          alert(
            "Något gick fel. Vänligen försök igen eller kontakta oss via e-post."
          );
        })
        .finally(() => {
          if (submitBtn) {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            submitBtn.classList.remove("opacity-50");
          }
        });
    });
  }
});
function setCustomerType(type) {
  const companyInfo = document.getElementById("company-info");
  const btnPrivate = document.getElementById("btn-private");
  const btnBusiness = document.getElementById("btn-business");
  const typeInput = document.getElementById("form-customer-type");

  typeInput.value = type;

  if (type === "business") {
    companyInfo.classList.remove("hidden");
    // Styling för knappar
    btnBusiness.classList.add("bg-white", "shadow-sm", "text-black");
    btnBusiness.classList.remove("text-gray-500");
    btnPrivate.classList.remove("bg-white", "shadow-sm", "text-black");
    btnPrivate.classList.add("text-gray-500");

    // Gör företagsfält obligatoriska om företag är valt
    document.getElementById("form-company-name").required = true;
    document.getElementById("form-org-nr").required = true;
  } else {
    companyInfo.classList.add("hidden");
    // Styling för knappar
    btnPrivate.classList.add("bg-white", "shadow-sm", "text-black");
    btnPrivate.classList.remove("text-gray-500");
    btnBusiness.classList.remove("bg-white", "shadow-sm", "text-black");
    btnBusiness.classList.add("text-gray-500");

    // Ta bort krav på obligatoriska fält
    document.getElementById("form-company-name").required = false;
    document.getElementById("form-org-nr").required = false;
  }
}
// LOGIK FÖR ATT VÄLJA MODELL PÅ ANDRA SIDAN
window.selectBatteryOption = function (
  brand,
  model,
  selectedCap,
  originalCap,
  voltage
) {
  let problemText = "";
  if (selectedCap !== originalCap) {
    problemText = `Uppgradera kapaciteten till ${selectedCap}.`;
  }

  const batteryData = {
    brand: brand,
    model: model,
    capacity: originalCap,
    voltage: voltage,
    problem: problemText,
  };

  sessionStorage.setItem("prefilledBattery", JSON.stringify(batteryData));
  console.log("Sparar ner batteridata i minnet:", batteryData);
  window.location.href = "/index#skicka-in";
};

// LOGIK FÖR AUTOFILL NÄR MAN LANDAR PÅ FORMULÄRET
document.addEventListener("DOMContentLoaded", function () {
  const repairForm = document.getElementById("repairForm");

  if (repairForm) {
    const savedData = sessionStorage.getItem("prefilledBattery");

    if (savedData) {
      const battery = JSON.parse(savedData);

      if (document.getElementById("form-brand"))
        document.getElementById("form-brand").value = battery.brand || "";
      if (document.getElementById("form-model"))
        document.getElementById("form-model").value = battery.model || "";
      if (document.getElementById("form-voltage"))
        document.getElementById("form-voltage").value = battery.voltage || "";
      // SMART LOGIK FÖR KAPACITET
      if (document.getElementById("form-capacity")) {
        // Om det är en order, fyll i den kapacitet de valt att köpa. Annars originalkapacitet.
        if (battery.action === "order") {
          document.getElementById("form-capacity").value =
            battery.selectedCap || "";
        } else {
          document.getElementById("form-capacity").value =
            battery.capacity || "";
        }
      }
      // Fyll i fritexten
      if (document.getElementById("form-problem")) {
        document.getElementById("form-problem").value = battery.problem || "";

        // NYTT: Om texten innehåller ordet "Uppgradera", bocka i rätt radioknapp i det nya steget
        if (battery.problem && battery.problem.includes("Uppgradera")) {
          const upgradeRadio = document.getElementById("radio-upgrade");
          if (upgradeRadio) upgradeRadio.checked = true;
        }
      }
    }
  }
});
// Variabel för att tillfälligt minnas vilket batteri kunden klickade på
let currentSelectedBattery = null;

// Öppnar modalen och sätter in datan
window.openActionModal = function (
  brand,
  model,
  selectedCap,
  originalCap,
  voltage,
  hasBadge
) {
  currentSelectedBattery = { brand, model, selectedCap, originalCap, voltage };

  // Uppdatera texten i modalen
  document.getElementById(
    "modal-battery-info"
  ).innerText = `${brand} ${model} (${selectedCap})`;

  // Logik för att visa/dölja knappen för Direktköp
  const orderBtn = document.getElementById("modal-order-btn");
  const outOfStockMsg = document.getElementById("modal-out-of-stock-msg");

  if (hasBadge) {
    // Om den FINNS i lager: Visa köpknappen, dölj varningen
    orderBtn.classList.remove("hidden");
    orderBtn.classList.add("flex"); // Tailwinds flexbox-klass behövs för layouten
    outOfStockMsg.classList.add("hidden");
  } else {
    // Om den INTE finns i lager: Dölj köpknappen, visa varningen
    orderBtn.classList.remove("flex");
    orderBtn.classList.add("hidden");
    outOfStockMsg.classList.remove("hidden");
  }

  // Visa modalen med mjuk animation
  const modal = document.getElementById("action-modal");
  modal.classList.remove("hidden");

  setTimeout(() => {
    modal.classList.remove("opacity-0");
    modal.firstElementChild.classList.remove("scale-95");
    modal.firstElementChild.classList.add("scale-100");
  }, 10);
};

// Stänger modalen
window.closeActionModal = function () {
  const modal = document.getElementById("action-modal");
  modal.classList.add("opacity-0");
  modal.firstElementChild.classList.remove("scale-100");
  modal.firstElementChild.classList.add("scale-95");

  setTimeout(() => {
    modal.classList.add("hidden");
  }, 300); // 300ms matchar Tailwinds duration-300 klass
};

// Hanterar knapptrycken inuti modalen
window.handleModalChoice = function (choice) {
  if (!currentSelectedBattery) return;

  const { brand, model, selectedCap, originalCap, voltage } =
    currentSelectedBattery;

  // Förbered felbeskrivningen (används främst för renovering)
  let problemText = "";
  if (selectedCap !== originalCap && choice === "repair") {
    problemText = `Uppgradera kapaciteten till ${selectedCap}.`;
  }

  // Packa in all data (Nu skickar vi även med 'action' så mottagarsidan vet vad som valts)
  const batteryData = {
    brand: brand,
    model: model,
    capacity: originalCap,
    selectedCap: selectedCap,
    voltage: voltage,
    problem: problemText,
    action: choice, // Säger 'repair' eller 'order'
  };

  // Spara i webbläsarens minne
  sessionStorage.setItem("prefilledBattery", JSON.stringify(batteryData));

  // Stäng modalen innan vi byter sida
  closeActionModal();

  // Omdirigera kunden baserat på vad de klickade på
  if (choice === "repair") {
    window.location.href = "/index#skicka-in"; // Som förut
  } else if (choice === "order") {
    window.location.href = "/checkout"; // Skicka till din nya checkout-sida
  }
};
// Sökfunktion
function filterBatteries() {
  const query = document.getElementById("batterySearch").value.toLowerCase();
  const filtered = batteryData.filter(
    (b) =>
      b.brand.toLowerCase().includes(query) ||
      b.model.toLowerCase().includes(query)
  );
  renderBatteries(filtered);
}
// Hjälpfunktion för att skapa en prisrad med knapp
function generatePriceRow(
  brand,
  model,
  priceObj,
  originalCap,
  voltage,
  isSmall = false
) {
  const badgeHtml = priceObj.badge
    ? `<span class="bg-black text-white text-[10px] px-2 py-[3px] rounded-full tracking-tighter whitespace-nowrap shadow-sm">I lager</span>`
    : ``;

  const descHtml = priceObj.desc
    ? `<span class="text-gray-400 text-xs">${priceObj.desc}</span>`
    : ``;

  // NYTT: Kollar om badge existerar
  const hasBadge = priceObj.badge ? true : false;

  return `
      <div class="${
        isSmall ? "py-3" : "py-5"
      } flex justify-between items-center gap-4">
          <div class="flex items-center flex-wrap gap-3">
              <span class="${isSmall ? "text-base" : "text-lg"} font-medium">
                  ${priceObj.cap}
              </span>
              ${badgeHtml}
              ${descHtml}
          </div>
          <div class="flex items-center gap-4">
              <span class="${
                isSmall ? "text-base" : "text-xl"
              } font-medium whitespace-nowrap">${priceObj.price}</span>
              <button onclick="openActionModal('${brand}', '${model}', '${
    priceObj.cap
  }', '${originalCap}', '${voltage}', ${hasBadge})" 
                      class="bg-black text-white px-4 py-2 rounded-full text-xs font-medium hover:opacity-70 transition shadow-sm">
                  Välj
              </button>
          </div>
      </div>
  `;
}

function renderBatteries(data) {
  const container = document.getElementById("battery-container");
  // Avbryt funktionen direkt om vi inte är på startsidan där containern finns
  if (!container) return;
  const noResults = document.getElementById("no-results");
  container.innerHTML = "";

  if (data.length === 0) {
    noResults.classList.remove("hidden");
    return;
  } else {
    noResults.classList.add("hidden");
  }

  data.forEach((b, index) => {
    // --- 1. BYGG SLIDESHOW-SEKTIONEN ---
    let imageSection = "";
    if (b.images && b.images.length > 0) {
      window.slideStates[index] = 0; // Nollställ slidern för detta kort

      // Generera alla bilder (läggs ovanpå varandra med absolut positionering)
      let slidesHtml = b.images
        .map(
          (img, i) => `
            <img id="slide-${index}-${i}" src="${img}" 
                 class="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
                   i === 0 ? "opacity-100" : "opacity-0"
                 }" 
                 alt="${b.brand}">
        `
        )
        .join("");

      // Generera pilar och prickar BARA om det finns mer än 1 bild
      let controlsHtml = "";
      if (b.images.length > 1) {
        controlsHtml = `
                <button onclick="changeSlide(${index}, -1, ${
          b.images.length
        })" class="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2.5 rounded-full shadow-sm text-black transition z-10">
                    <i data-lucide="chevron-left" class="w-5 h-5"></i>
                </button>
                <button onclick="changeSlide(${index}, 1, ${
          b.images.length
        })" class="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2.5 rounded-full shadow-sm text-black transition z-10">
                    <i data-lucide="chevron-right" class="w-5 h-5"></i>
                </button>
                <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10 bg-white/50 backdrop-blur-md px-3 py-2 rounded-full">
                    ${b.images
                      .map(
                        (_, i) =>
                          `<div id="dot-${index}-${i}" class="w-2 h-2 rounded-full transition-colors ${
                            i === 0 ? "bg-black" : "bg-black/20"
                          }"></div>`
                      )
                      .join("")}
                </div>
            `;
      }

      imageSection = `
            <div class="w-full lg:w-2/5 shrink-0 relative min-h-[300px] lg:min-h-full bg-[#E8E6E1] rounded-[24px] overflow-hidden">
                ${slidesHtml}
                ${controlsHtml}
            </div>
        `;
    }

    // --- 2. BYGG KORTET MED DEN NYA LAYOUTEN ---
    let html = `
        <div class="glass-card p-6 md:p-10 bg-white border border-black/5 flex flex-col lg:flex-row gap-8 lg:gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            ${imageSection} <div class="flex-1 w-full flex flex-col justify-center"> <div class="mb-8">
                    <h2 class="text-3xl font-medium uppercase mb-1">${
                      b.brand
                    }</h2>
                    <p class="text-gray-400 text-sm font-mono uppercase tracking-widest">${
                      b.model
                    }</p>
                    ${
                      b.seasonOnly
                        ? `<span class="inline-block mt-3 bg-amber-50 text-amber-700 px-3 py-1 rounded-lg text-xs font-medium">${b.seasonOnly}</span>`
                        : ""
                    }
                </div>
                <div class="divide-y divide-gray-100">
    `;

    // ... (Här klistrar du in resten av din befintliga kod för b.prices och b.groups från förra steget) ...

    // Hantera vanliga kort
    if (!b.isMulti && b.prices) {
      b.prices.forEach((p) => {
        html += generatePriceRow(
          b.brand,
          b.model,
          p,
          b.original_cap,
          b.voltage
        );
      });
    }

    // Hantera Multi-kort (Grupper)
    if (b.isMulti && b.groups) {
      html += `<div class="grid md:grid-cols-2 gap-12 pt-4">`;
      b.groups.forEach((g) => {
        html += `
                  <div class="space-y-2">
                      <h4 class="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-6 pb-2 border-b border-gray-50">${g.name}</h4>
                      <div class="divide-y divide-gray-50">
              `;
        g.prices.forEach((p) => {
          html += generatePriceRow(
            b.brand,
            b.model,
            p,
            g.original_cap,
            g.voltage,
            true
          );
        });
        html += `</div></div>`;
      });
      html += `</div>`;
    }

    if (b.note) {
      html += `<div class="mt-10 p-6 bg-[#FAF9F6] rounded-2xl text-xs leading-relaxed text-gray-500 border border-black/5 italic">${b.note}</div>`;
    }

    html += `</div></div>`;
    container.innerHTML += html;
  });

  lucide.createIcons();
}
// Håller koll på vilken bild som visas i vilka sliders
const standaloneSliders = {};

function moveStandaloneSlide(sliderId, step) {
  const slider = document.getElementById(sliderId);
  if (!slider) return;

  const images = slider.querySelectorAll(".slider-img");

  if (standaloneSliders[sliderId] === undefined) {
    standaloneSliders[sliderId] = 0;
  }

  let newIndex = standaloneSliders[sliderId] + step;

  // Snurra runt om vi når slutet eller början
  if (newIndex >= images.length) newIndex = 0;
  if (newIndex < 0) newIndex = images.length - 1;

  goToStandaloneSlide(sliderId, newIndex);
}

function goToStandaloneSlide(sliderId, index) {
  const slider = document.getElementById(sliderId);
  if (!slider) return;

  const images = slider.querySelectorAll(".slider-img");
  const dots = slider.querySelectorAll(".slider-dot");

  // Uppdatera minnet
  standaloneSliders[sliderId] = index;

  // Växla bilder
  images.forEach((img, i) => {
    if (i === index) {
      img.classList.remove("opacity-0");
      img.classList.add("opacity-100");
    } else {
      img.classList.remove("opacity-100");
      img.classList.add("opacity-0");
    }
  });

  // Växla färg på prickarna
  dots.forEach((dot, i) => {
    if (i === index) {
      dot.classList.remove("bg-black/20");
      dot.classList.add("bg-black");
    } else {
      dot.classList.remove("bg-black");
      dot.classList.add("bg-black/20");
    }
  });
}
// Mobil drop-down meny
document.addEventListener("DOMContentLoaded", function () {
  // --- KOD FÖR MOBILMENYN ---
  const mobileBtn = document.getElementById("mobile-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");
  const mobileLinks = document.querySelectorAll(".mobile-link");

  // Körs bara om knapparna faktiskt finns på sidan
  if (mobileBtn && mobileMenu) {
    // Öppna/stäng menyn när man klickar på hamburgaren
    mobileBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });

    // Stäng menyn automatiskt när kunden klickar på en specifik länk
    mobileLinks.forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenu.classList.add("hidden");
      });
    });
  }
  // ----------------------------
});
// Kör rendering vid start

// ------------------------------------------------------------------------------------
//BATTERI-DATABAS (Fyll på med nya modeller enligt samma format)
const batteryData = [
  {
    brand: "Biltema pakethållare",
    model: "Universell passform (Passar fler cykelmärken)",
    voltage: "36V eller 24V",
    original_cap: "Varierande",
    isMulti: true,
    images: ["photos/biltema-pakethall.png"],
    note: "OBS! LED-indikatorn kommer inte att fungera efter reparation. Istället kan du se batteristatus på laddarens LED vis laddning och på cykelns display under cykling. OBS! Strömbrytaren kommer inte att fungera efter reparation. Se till att du har en strömbrytare på din cykel-display (se bild ovan), annars hör av dig för att få en ny strömbrytare monterad!",
    groups: [
      {
        name: "Om ditt batteri är 36V",
        voltage: "36V",
        original_cap: "10Ah",
        prices: [
          {
            cap: "10Ah",
            desc: "Originalkapacitet",
            price: "3 500 kr",
            badge: true,
          },
          {
            cap: "14Ah",
            desc: "40% extra räckvidd",
            price: "4 250 kr",
            badge: true,
          },
        ],
      },
      {
        name: "Om ditt batteri är 24V",
        voltage: "24V",
        original_cap: "10Ah",
        prices: [
          {
            cap: "10Ah",
            desc: "Originalkapacitet",
            price: "2 750 kr",
            badge: true,
          },
          {
            cap: "15Ah",
            desc: "50% extra räckvidd",
            price: "3 500 kr",
            badge: true,
          },
        ],
      },
    ],
  },
  {
    brand: "Biltema sadelstolpe",
    model: "Universell passform (Sadelstolpsmodell)",
    voltage: "24V",
    original_cap: "10Ah",
    images: ["photos/biltema-sadelstolp.png"],
    prices: [
      {
        cap: "10Ah",
        desc: "Originalkapacitet",
        price: "2 750 kr",
        badge: true,
      },
      {
        cap: "15Ah",
        desc: "50% extra räckvidd",
        price: "3 500 kr",
        badge: true,
      },
    ],
    note: "OBS! LED-indikatorn kommer inte att fungera efter reparation. Istället kan du se batteristatus på laddarens LED vid laddning eller på cykelns display under cykling. Strömbrytaren på batteriet kommer inte att fungera efter reparation. Se till att du har en strömbrytare på din cykel-display (se bild ovan), annars hör av dig för att få en ny strömbrytare monterad!",
  },
  {
    brand: "PROTANIUM",
    model: "Passar bl.a. Yosemite (Biltema) & IKEA",
    voltage: "36V",
    images: ["photos/biltema-sadelstolp.png", "photos/biltema-pakethall.png"],
    original_cap: "10Ah",

    prices: [
      {
        cap: "10Ah",
        desc: "Originalkapacitet",
        price: "3 500 kr",
        badge: true,
      },
      {
        cap: "14Ah",
        desc: "40% extra räckvidd",
        price: "4 250 kr",
        badge: true,
      },
    ],
    note: "OBS! LED-indikatorn kommer inte att fungera efter reparation. Istället kan du se batteristatus på laddarens LED vid laddning eller på cykelns display under cykling.",
  },
  {
    brand: "TranzX pakethållare",
    model: "Passar bl.a. Crescent m.fl.",
    voltage: "24V",
    original_cap: "10Ah",
    prices: [
      { cap: "10Ah", desc: "Original kapacitet", price: "2 750 kr" },
      {
        cap: "15Ah",
        desc: "50% extra räckvidd",
        price: "3 500 kr",
      },
      {
        cap: "20Ah",
        desc: "100% extra räckvidd",
        price: "4 250 kr",
      },
    ],
  },
  {
    brand: "Batavus äldre variant",
    model: "Passar äldre Batavus-modeller",
    voltage: "36V",
    original_cap: "10Ah",
    prices: [
      {
        cap: "10Ah",
        desc: "Originalkapacitet",
        price: "3 800 kr",
        badge: true,
      },
      {
        cap: "14Ah",
        desc: "40% extra räckvidd",
        price: "4 550 kr",
        badge: true,
      },
    ],
    note: "OBS! Originalladdaren kommer inte att fungera efter reparation. Ny laddare ingår i priset!",
  },
];
//------------------------------------------------------------------------------------

renderBatteries(batteryData);
