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

  // Uppdatera progress bar
  for (let i = 1; i <= 3; i++) {
    const p = document.getElementById("p-" + i);
    if (i <= step) {
      p.classList.remove("bg-gray-200");
      p.classList.add("bg-black");
    } else {
      p.classList.remove("bg-black");
      p.classList.add("bg-gray-200");
    }
  }
  // Scrolla till toppen av formuläret så användaren ser nästa fråga
  document
    .getElementById("skicka-in")
    .scrollIntoView({ behavior: "smooth", block: "start" });
}

// Hantera formulärets inskick (Simulering)
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxWVov5g6DQvnlijeTS-1p5CZ1hSUlGtWt72UrsZwuultlxVL62oY0pGmWJ57X5hFFs0Q/exec";

document.getElementById("repairForm").addEventListener("submit", function (e) {
  e.preventDefault(); // Stoppar sidan från att laddas om

  // Hitta knappen och ändra texten så användaren ser att något händer
  const submitBtn = document.querySelector('#step3 button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = "Skickar in förfrågan...";
  submitBtn.disabled = true;
  submitBtn.classList.add("opacity-50");

  // Kolla vilket fraktalternativ som är valt
  let shippingChoice = document.getElementById("ship-self").checked
    ? document.getElementById("ship-self").value
    : document.getElementById("ship-label").value;

  // Samla all data med FormData
  const formData = new FormData();
  formData.append("brand", document.getElementById("form-brand").value);
  formData.append("model", document.getElementById("form-model").value);
  formData.append("voltage", document.getElementById("form-voltage").value);
  formData.append("capacity", document.getElementById("form-capacity").value);
  formData.append("problem", document.getElementById("form-problem").value);
  formData.append("name", document.getElementById("form-name").value);
  formData.append("email", document.getElementById("form-email").value);
  formData.append("phone", document.getElementById("form-phone").value);
  formData.append("address", document.getElementById("form-address").value);
  formData.append("postcode", document.getElementById("form-postcode").value);
  formData.append("city", document.getElementById("form-city").value);
  formData.append("shipping", shippingChoice);

  // Skicka datan till Google Sheets
  fetch(GOOGLE_SCRIPT_URL, {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      // Lyckat!
      alert("Tack för din förfrågan! Vi har mottagit ditt ärende.");

      // Återställ formuläret
      document.getElementById("repairForm").reset();
      goToStep(1);
    })
    .catch((error) => {
      // Något gick fel
      console.error("Error!", error.message);
      alert(
        "Något gick fel. Vänligen försök igen eller kontakta oss via e-post."
      );
    })
    .finally(() => {
      // Återställ knappen oavsett om det gick bra eller dåligt
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
      submitBtn.classList.remove("opacity-50");
    });
});

//BATTERI-DATABAS (Fyll på med nya modeller enligt samma format)
const batteryData = [
  {
    brand: "ECORIDE 2009-2016",
    model: "AE battery / King-CO m.fl.",
    voltage: "36V",
    original_cap: "10Ah",
    images: [
      "https://placehold.co/600x600/E8E6E1/A3A3A3?text=EcoRide+2009-2016",
    ],
    prices: [
      { cap: "10Ah", desc: "Originalkapacitet", price: "3 600 kr" },
      {
        cap: "13.5Ah",
        desc: "35% extra räckvidd",
        price: "4 100 kr",
        badge: true,
      },
      { cap: "17.0Ah", desc: "70% extra räckvidd*", price: "4 600 kr" },
      { cap: "20.0Ah", desc: "100% extra räckvidd*", price: "5 600 kr" },
    ],
    note: "*17Ah och 20Ah gäller endast de längre skalen där metallhöljet är ca 34-36cm långt.",
  },
  {
    brand: "Reention Brilliance",
    model: "Cargobike, Evobike, Lifebike m.fl.",
    voltage: "36V",
    original_cap: "10Ah",
    images: [
      "https://placehold.co/600x600/F3F2EE/A3A3A3?text=Reention+Brilliance",
    ],
    prices: [
      { cap: "10Ah", desc: "Originalkapacitet", price: "4 000 kr" },
      {
        cap: "13.5Ah",
        desc: "35% extra räckvidd",
        price: "4 500 kr",
        badge: true,
      },
      { cap: "17.0Ah", desc: "70% extra räckvidd", price: "5 100 kr" },
    ],
    note: "OBS! Strömbrytaren behövs normalt inte så denna kopplas endast in som tillval (350 kr extra). Du stänger istället av på styret.",
  },
  {
    brand: "Shan Shan Haibao II",
    model: "SSE-027, SSE-028 (Sjösala, Jula, Peak)",
    voltage: "Varierande",
    original_cap: "10Ah",
    isMulti: true,
    images: ["https://placehold.co/600x600/E8E6E1/A3A3A3?text=Haibao+II"],
    note: "OBS! Strömbrytaren behövs normalt inte så dessa kopplas inte in igen. Du stänger av på styret.",
    groups: [
      {
        name: "36V Versionen",
        voltage: "36V",
        original_cap: "10Ah",
        prices: [
          { cap: "10Ah", desc: "Originalkapacitet", price: "4 000 kr" },
          {
            cap: "13.5Ah",
            desc: "35% extra räckvidd",
            price: "4 600 kr",
            badge: true,
          },
        ],
      },
      {
        name: "24V Versionen",
        voltage: "24V",
        original_cap: "10Ah",
        prices: [
          { cap: "10Ah", desc: "Originalkapacitet", price: "3 200 kr" },
          {
            cap: "13.5Ah",
            desc: "60% extra räckvidd",
            price: "3 600 kr",
            badge: true,
          },
          { cap: "17.0Ah", desc: "90% extra räckvidd", price: "4 100 kr" },
        ],
      },
    ],
  },
  {
    brand: "Biltema 36V",
    model: "Art. 27-1402100 (Project Ares 115)",
    voltage: "36V",
    original_cap: "Varierande",
    isMulti: true,
    images: ["https://placehold.co/600x600/F3F2EE/A3A3A3?text=Biltema+36V"],
    note: "OBS! Strömbrytare på pakethållare och indikator går inte att koppla in efter renovering. Kolla spänning på styret istället.",
    groups: [
      {
        name: "Om ditt original är 10Ah",
        voltage: "36V",
        original_cap: "10Ah",
        prices: [
          { cap: "10Ah", desc: "Originalkapacitet", price: "3 600 kr" },
          {
            cap: "13.5Ah",
            desc: "35% extra räckvidd",
            price: "4 100 kr",
            badge: true,
          },
        ],
      },
      {
        name: "Om ditt original är 7.8Ah",
        voltage: "36V",
        original_cap: "7.8Ah",
        prices: [
          { cap: "10Ah", desc: "35% extra räckvidd", price: "3 600 kr" },
          {
            cap: "13.5Ah",
            desc: "80% extra räckvidd",
            price: "4 100 kr",
            badge: true,
          },
        ],
      },
    ],
  },
  {
    brand: "Giant Twist",
    model: "Standard (Flesta årsmodeller)",
    voltage: "36V",
    original_cap: "10Ah",
    images: ["https://placehold.co/600x600/E8E6E1/A3A3A3?text=Giant+Twist"],
    prices: [
      { cap: "10Ah", desc: "Originalkapacitet", price: "3 600 kr" },
      {
        cap: "13.5Ah",
        desc: "35% extra räckvidd",
        price: "4 100 kr",
        badge: true,
      },
      { cap: "19.0Ah", desc: "90% extra räckvidd", price: "4 600 kr" },
      { cap: "23.0Ah", desc: "130% extra räckvidd", price: "5 600 kr" },
    ],
    note: "OBS! Den gamla laddaren fungerar inte efter renovering men priset inkluderar en helt ny, passande laddare.",
  },
  {
    brand: "Clas Ohlson / Off Course",
    model: "Jeve VA3610 ITCPAMA",
    voltage: "36V",
    original_cap: "10Ah",
    // Här lägger du till bilderna (fungerar med 1 eller flera)
    images: [
      "https://placehold.co/600x600/E8E6E1/A3A3A3?text=Bild+1",
      "https://placehold.co/600x600/F3F2EE/A3A3A3?text=Bild+2",
    ],
    prices: [
      { cap: "10Ah", desc: "Originalkapacitet", price: "3 600 kr" },
      {
        cap: "13.5Ah",
        desc: "35% extra räckvidd",
        price: "4 100 kr",
        badge: true,
      },
      {
        cap: "17.0Ah",
        desc: "70% extra räckvidd",
        price: "5 600 kr",
        badge: false,
      },
    ],
  },
  {
    brand: "ECORIDE 2016-2023",
    model: "P11, P14, P17 samt B1 m.fl.",
    isMulti: true,
    images: [
      "https://placehold.co/600x600/E8E6E1/A3A3A3?text=Bild+1",
      // Har du bara en bild? Då döljs pilarna automatiskt!
    ],
    note: "OBS! Indikatorn kan ej kopplas in igen. Vi kan installera brytare för 500 kr extra.",
    groups: [
      {
        name: "P11, P14, P17",
        voltage: "36V",
        original_cap: "11Ah",
        prices: [
          { cap: "13.5Ah", desc: "+20% räckvidd", price: "4 100 kr" },
          { cap: "17.0Ah", desc: "+50% räckvidd", price: "4 600 kr" },
          { cap: "20.0Ah", desc: "+80% räckvidd", price: "5 600 kr" },
        ],
      },
      {
        name: "Modell B1",
        voltage: "36V",
        original_cap: "14.5Ah",
        images: [
          "https://placehold.co/600x600/E8E6E1/A3A3A3?text=EcoRide+Batteri",
          // Har du bara en bild? Då döljs pilarna automatiskt!
        ],
        prices: [
          { cap: "17.0Ah", desc: "+20% räckvidd", price: "4 600 kr" },
          { cap: "20.0Ah", desc: "+45% räckvidd", price: "5 600 kr" },
        ],
      },
    ],
  },
  {
    brand: "PROMOVEC",
    model: "No. 50651, 50637, 50172 m.fl.",
    seasonOnly: "Endast lågsäsong (Nov - Feb)",
    voltage: "36V",
    images: ["https://placehold.co/600x600/E8E6E1/A3A3A3?text=Giant+Twist"],
    original_cap: "10Ah",
    prices: [
      { cap: "13.5Ah", desc: "Upp till 120% extra kraft", price: "5 100 kr" },
    ],
  },
];

// NY FUNKTION: Sköter autofyllning och navigering
function selectBatteryOption(brand, model, selectedCap, originalCap, voltage) {
  // 1. Växla till formulär-fliken (startsidan)
  switchPage("main", "skicka-in");

  // 2. Fyll i fälten
  document.getElementById("form-brand").value = brand;
  document.getElementById("form-model").value = model;
  document.getElementById("form-capacity").value = originalCap;

  // NYTT: Fyller i spänningen dolt från klicket
  document.getElementById("form-voltage").value = voltage;

  // 3. Om kunden valt en uppgradering, fyll i felbeskrivningen
  const problemField = document.getElementById("form-problem");
  if (selectedCap !== originalCap) {
    problemField.value = `Uppgradera kapaciteten till ${selectedCap}.`;
  } else {
    problemField.value = ""; // Rensa om det är standard-reparation
  }

  console.log("Formulär autofyllt för:", brand, model, voltage);
}

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
  // 1. Skapa HTML för badge om den finns
  const badgeHtml = priceObj.badge
    ? `<span class="bg-black text-white text-[10px] px-2 py-[3px] rounded-full uppercase tracking-tighter whitespace-nowrap shadow-sm">Bäst val</span>`
    : ``;

  // 2. Skapa HTML för beskrivningen
  const descHtml = priceObj.desc
    ? `<span class="text-gray-400 text-xs">${priceObj.desc}</span>`
    : ``;

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
              <button onclick="selectBatteryOption('${brand}', '${model}', '${
    priceObj.cap
  }', '${originalCap}', '${voltage}')" 
                      class="bg-black text-white px-4 py-2 rounded-full text-xs font-medium hover:opacity-70 transition shadow-sm">
                  Välj
              </button>
          </div>
      </div>
  `;
}

function renderBatteries(data) {
  const container = document.getElementById("battery-container");
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
                    <h2 class="text-3xl font-medium mb-1">${b.brand}</h2>
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
// Kör rendering vid start
renderBatteries(batteryData);
