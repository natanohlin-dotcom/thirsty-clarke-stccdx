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

// Hantera formulärets inskick
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzkMVMoEkDyO4YiJn1h-nk8CvCMXcksuCXw6KRWdQbnlT23QE4oqGXDyhzv28YtnpNEaw/exec";

document.getElementById("repairForm").addEventListener("submit", function (e) {
  e.preventDefault(); // Stoppar sidan från att laddas om

  // --- HONUNGS CHECK ---
  const botCheck = document.getElementById("form-botcheck").value;
  if (botCheck !== "") {
    console.log("Bot detected! Silently ignoring.");
    // bot upptäckt, vi skickar inget.
    alert("Tack för din förfrågan! Vi har mottagit ditt ärende.");
    document.getElementById("repairForm").reset();
    goToStep(1);
    return; // Avbryter hela funktionen här!
  }
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
    brand: "Biltema pakethållare",
    model: "Förekommer på många cyklar, inte bara från biltema.",
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
    model: "Förekommer på fler cyklar",
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
    model: "Förekommer bland annat på cyklar från Biltema och IKEA",
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
    model: "Förekommer bland annat på cyklar Crescent",
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
    model: "Förekommer på äldre cyklar från Batavus",
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
    ? `<span class="bg-black text-white text-[10px] px-2 py-[3px] rounded-full tracking-tighter whitespace-nowrap shadow-sm">I lager</span>`
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
// Kör rendering vid start
renderBatteries(batteryData);
