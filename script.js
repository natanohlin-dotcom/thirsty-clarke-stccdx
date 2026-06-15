// ==========================================
// 1. INITIERING & GRUNDFUNKTIONER
// ==========================================
lucide.createIcons();

// Flik-motor (Single Page Navigation)
function switchPage(pageId, scrollToSection = null) {
  document.querySelectorAll(".page-view").forEach((el) => {
    el.classList.remove("active");
  });
  document.getElementById("view-" + pageId).classList.add("active");

  if (scrollToSection && pageId === "main") {
    setTimeout(() => {
      document
        .getElementById(scrollToSection)
        .scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

// Mobilmeny
document.addEventListener("DOMContentLoaded", function () {
  const mobileBtn = document.getElementById("mobile-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");
  const mobileLinks = document.querySelectorAll(".mobile-link");

  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener("click", () =>
      mobileMenu.classList.toggle("hidden")
    );
    mobileLinks.forEach((link) =>
      link.addEventListener("click", () => mobileMenu.classList.add("hidden"))
    );
    document.addEventListener("click", (event) => {
      const isMenuOpen = !mobileMenu.classList.contains("hidden");
      const isClickOutsideMenu = !mobileMenu.contains(event.target);
      const isClickOutsideBtn = !mobileBtn.contains(event.target);
      if (isMenuOpen && isClickOutsideMenu && isClickOutsideBtn) {
        mobileMenu.classList.add("hidden");
      }
    });
  }
});

// ==========================================
// 2. SLIDERS & SWIPE (Mobil)
// ==========================================
window.slideStates = {};
const standaloneSliders = {};

function changeSlide(cardIndex, direction, totalSlides) {
  let currentIndex = window.slideStates[cardIndex];
  let newIndex = currentIndex + direction;
  if (newIndex >= totalSlides) newIndex = 0;
  if (newIndex < 0) newIndex = totalSlides - 1;

  document
    .getElementById(`slide-${cardIndex}-${currentIndex}`)
    .classList.replace("opacity-100", "opacity-0");
  document
    .getElementById(`dot-${cardIndex}-${currentIndex}`)
    .classList.replace("bg-black", "bg-black/20");
  document
    .getElementById(`slide-${cardIndex}-${newIndex}`)
    .classList.replace("opacity-0", "opacity-100");
  document
    .getElementById(`dot-${cardIndex}-${newIndex}`)
    .classList.replace("bg-black/20", "bg-black");

  window.slideStates[cardIndex] = newIndex;
}

function enableSwipe(element, onSwipeLeft, onSwipeRight) {
  let touchStartX = 0;
  let touchEndX = 0;
  element.addEventListener(
    "touchstart",
    (e) => (touchStartX = e.changedTouches[0].screenX),
    { passive: true }
  );
  element.addEventListener(
    "touchend",
    (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const minSwipeDistance = 50;
      const swipeDistance = touchEndX - touchStartX;
      if (swipeDistance < -minSwipeDistance) onSwipeLeft();
      else if (swipeDistance > minSwipeDistance) onSwipeRight();
    },
    { passive: true }
  );
}

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".swipe-slider").forEach((slider) => {
    if (slider.id) {
      enableSwipe(
        slider,
        () => moveStandaloneSlide(slider.id, 1),
        () => moveStandaloneSlide(slider.id, -1)
      );
    }
  });
});

function moveStandaloneSlide(sliderId, step) {
  const slider = document.getElementById(sliderId);
  if (!slider) return;
  const images = slider.querySelectorAll(".slider-img");
  if (standaloneSliders[sliderId] === undefined)
    standaloneSliders[sliderId] = 0;

  let newIndex = standaloneSliders[sliderId] + step;
  if (newIndex >= images.length) newIndex = 0;
  if (newIndex < 0) newIndex = images.length - 1;

  goToStandaloneSlide(sliderId, newIndex);
}

function goToStandaloneSlide(sliderId, index) {
  const slider = document.getElementById(sliderId);
  if (!slider) return;
  standaloneSliders[sliderId] = index;

  slider.querySelectorAll(".slider-img").forEach((img, i) => {
    if (i === index) {
      img.classList.remove("opacity-0");
      img.classList.add("opacity-100");
    } else {
      img.classList.remove("opacity-100");
      img.classList.add("opacity-0");
    }
  });
  slider.querySelectorAll(".slider-dot").forEach((dot, i) => {
    if (i === index) {
      dot.classList.remove("bg-black/20");
      dot.classList.add("bg-black");
    } else {
      dot.classList.remove("bg-black");
      dot.classList.add("bg-black/20");
    }
  });
}

// ==========================================
// 3. DATABAS & BATTERIKORT (Startsida)
// ==========================================
let globalBatteryData = [];
const GOOGLE_SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSc3RNEr_mmiiT26h0YVYCkoJ97HzyHWmpbD1uVm8DFuSVc8t84iSxOMnJ0mBvfwIsG-5w_3Y_k3t-a/pub?gid=0&single=true&output=csv";

function parseCSVRow(row) {
  return row
    .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
    .map((col) => col.replace(/^"|"$/g, "").trim());
}

async function fetchAndRenderBatteries() {
  try {
    const response = await fetch(GOOGLE_SHEET_CSV_URL);
    const csvText = await response.text();
    const rows = csvText.split("\n").slice(1);
    globalBatteryData = [];

    rows.forEach((rowString) => {
      if (!rowString.trim()) return;
      const cols = parseCSVRow(rowString);
      if (!cols[0]) return;

      const battery = {
        brand: cols[0],
        model: cols[1],
        voltage: cols[2] || "36V",
        original_cap: cols[3],
        prices: [],
        note: cols[16] || "",
        images: cols[17] ? [cols[17]] : [],
      };

      if (cols[4])
        battery.prices.push({
          cap: cols[4],
          desc: cols[5],
          price: cols[6],
          badge: cols[7] === "TRUE",
        });
      if (cols[8])
        battery.prices.push({
          cap: cols[8],
          desc: cols[9],
          price: cols[10],
          badge: cols[11] === "TRUE",
        });
      if (cols[12])
        battery.prices.push({
          cap: cols[12],
          desc: cols[13],
          price: cols[14],
          badge: cols[15] === "TRUE",
        });

      globalBatteryData.push(battery);
    });

    renderBatteries(globalBatteryData);

    const loadingState = document.getElementById("loading-state");
    const batteryContainer = document.getElementById("battery-container");
    if (loadingState && batteryContainer) {
      loadingState.classList.add("hidden");
      batteryContainer.classList.remove("hidden");
    }
  } catch (error) {
    console.error("Kunde inte ladda batteridatan från Google Sheets:", error);
    const loadingState = document.getElementById("loading-state");
    if (loadingState) {
      loadingState.innerHTML = `
        <i data-lucide="alert-circle" class="w-10 h-10 text-red-500 mb-4 mx-auto"></i>
        <p class="text-lg font-medium text-gray-900">Kunde inte ladda modellerna</p>
        <p class="text-sm text-gray-500 mt-2">Vänligen ladda om sidan eller försök igen senare.</p>
      `;
      if (typeof lucide !== "undefined") lucide.createIcons();
    }
  }
}

function filterBatteries() {
  const query = document.getElementById("batterySearch").value.toLowerCase();
  const filtered = globalBatteryData.filter(
    (b) =>
      b.brand.toLowerCase().includes(query) ||
      b.model.toLowerCase().includes(query)
  );
  renderBatteries(filtered);
}

// NYTT: Nu tar generatePriceRow emot "noteEncoded" så vi kan skicka med varningen in i kassan
function generatePriceRow(
  brand,
  model,
  priceObj,
  originalCap,
  voltage,
  allPricesJson = "%5B%5D",
  noteEncoded = "",
  isSmall = false
) {
  const badgeHtml = priceObj.badge
    ? `<span class="bg-black text-white text-[10px] px-2 py-[3px] rounded-full tracking-tighter whitespace-nowrap shadow-sm">Tillgänglig för direktköp</span>`
    : ``;
  const descHtml = priceObj.desc
    ? `<span class="text-gray-400 text-xs">${priceObj.desc}</span>`
    : ``;
  const hasBadge = priceObj.badge ? true : false;

  return `
      <div class="${
        isSmall ? "py-3" : "py-5"
      } flex justify-between items-center gap-4">
          <div class="flex items-center flex-wrap gap-3">
              ${badgeHtml}
              ${descHtml}
          </div>
          <div class="flex items-center gap-4">
              <span class="${
                isSmall ? "text-base" : "text-xl"
              } font-medium whitespace-nowrap text-gray-800">Från ${
    priceObj.price
  }</span>
              
              <button onclick="openActionModal('${brand}', '${model}', '${
    priceObj.cap
  }', '${originalCap}', '${voltage}', ${hasBadge}, '${allPricesJson}', '${noteEncoded}')" 
                      class="bg-black text-white px-4 py-2 rounded-full text-xs font-medium hover:opacity-70 transition shadow-sm">
                  Välj
              </button>
          </div>
      </div>
  `;
}

function renderBatteries(data) {
  const container = document.getElementById("battery-container");
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
    let imageSection = "";
    if (b.images && b.images.length > 0) {
      window.slideStates[index] = 0;
      
      // NYTT: Den första bilden (i === 0) sätts till 'relative h-auto'. 
      // Detta tvingar containern att bli exakt lika hög och bred som bildens originalproportioner!
      let slidesHtml = b.images
        .map(
          (img, i) => `
            <img id="slide-${index}-${i}" src="${img}" class="w-full object-cover transition-opacity duration-700 ease-in-out ${
            i === 0 ? "relative h-auto opacity-100" : "absolute inset-0 h-full opacity-0"
          }" alt="${b.brand}">
        `
        )
        .join("");

      let controlsHtml = "";
      if (b.images.length > 1) {
        controlsHtml = `
            <button onclick="changeSlide(${index}, -1, ${
          b.images.length
        })" class="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2.5 rounded-full shadow-sm text-black transition z-10"><i data-lucide="chevron-left" class="w-5 h-5"></i></button>
            <button onclick="changeSlide(${index}, 1, ${
          b.images.length
        })" class="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2.5 rounded-full shadow-sm text-black transition z-10"><i data-lucide="chevron-right" class="w-5 h-5"></i></button>
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
      
      // NYTT: Tog bort 'min-h-[300px]' och lade till 'h-fit self-center'
      // h-fit kramar åt bilden exakt, och self-center centrerar den bredvid texten ifall texten är jättelång.
      imageSection = `<div class="w-full lg:w-2/5 shrink-0 relative h-fit self-center bg-[#E8E6E1] rounded-[24px] overflow-hidden">${slidesHtml}${controlsHtml}</div>`;
    }

    let html = `
        <div class="glass-card p-6 md:p-10 bg-white border border-black/5 flex flex-col lg:flex-row gap-8 lg:gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            ${imageSection} 
            <div class="flex-1 w-full flex flex-col justify-center"> 
                <div class="mb-8">
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

    const noteEncoded = encodeURIComponent(b.note || "");
    const allPricesEncoded = encodeURIComponent(JSON.stringify(b.prices || []));

    if (!b.isMulti && b.prices && b.prices.length > 0) {
      const basePrice = b.prices[0];
      html += generatePriceRow(
        b.brand,
        b.model,
        basePrice,
        b.original_cap,
        b.voltage,
        allPricesEncoded,
        noteEncoded
      );
    }

    if (b.isMulti && b.groups) {
      html += `<div class="grid md:grid-cols-2 gap-12 pt-4">`;
      b.groups.forEach((g) => {
        html += `<div class="space-y-2"><h4 class="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-6 pb-2 border-b border-gray-50">${g.name}</h4><div class="divide-y divide-gray-50">`;
        g.prices.forEach((p) => {
          html += generatePriceRow(
            b.brand,
            b.model,
            p,
            g.original_cap,
            g.voltage,
            "%5B%5D",
            noteEncoded,
            true
          );
        });
        html += `</div></div>`;
      });
      html += `</div>`;
    }

    html += `</div></div></div>`;
    container.innerHTML += html;
  });

  lucide.createIcons();
}

document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("battery-container");
  const searchInput = document.getElementById("batterySearch");
  if (container) {
    fetchAndRenderBatteries();
    if (searchInput) searchInput.addEventListener("input", filterBatteries);
  }
});
// ==========================================
// 4. MODAL-FUNKTIONER
// ==========================================

// Huvudströmbrytare för modalen:
// true = Modalen öppnas som vanligt.
// false = Kunder skickas direkt till /skicka-in (reparation) när de klickar "Välj".
const MODAL_ON = false;

let currentSelectedBattery = null;

// FIXAT: Lade till allPricesEncoded och noteEncoded här
window.openActionModal = function (
  brand,
  model,
  selectedCap,
  originalCap,
  voltage,
  hasBadge,
  allPricesEncoded,
  noteEncoded
) {
  const allPrices = JSON.parse(
    decodeURIComponent(allPricesEncoded || "%5B%5D")
  );
  const note = decodeURIComponent(noteEncoded || "");

  // NYTT: Om modalen är avstängd, kringgå den helt och hållet
  if (!MODAL_ON) {
    const batteryData = {
      brand: brand,
      model: model,
      capacity: originalCap,
      selectedCap: selectedCap,
      voltage: voltage,
      action: "repair", // Tvingar valet till reparation
      options: allPrices,
      note: note,
    };
    sessionStorage.setItem("prefilledBattery", JSON.stringify(batteryData));
    window.location.href = "/skicka-in";
    return; // Avbryter funktionen så koden nedan inte körs
  }

  // Om MODAL_ON === true, körs koden nedan precis som vanligt
  currentSelectedBattery = {
    brand,
    model,
    selectedCap,
    originalCap,
    voltage,
    allPrices,
    note,
  };

  document.getElementById(
    "modal-battery-info"
  ).innerText = `${brand} ${model} (${selectedCap})`;

  const orderBtn = document.getElementById("modal-order-btn");
  const outOfStockMsg = document.getElementById("modal-out-of-stock-msg");
  if (hasBadge) {
    orderBtn.classList.remove("hidden");
    orderBtn.classList.add("flex");
    outOfStockMsg.classList.add("hidden");
  } else {
    orderBtn.classList.remove("flex");
    orderBtn.classList.add("hidden");
    outOfStockMsg.classList.remove("hidden");
  }

  const modal = document.getElementById("action-modal");
  modal.classList.remove("hidden");
  setTimeout(() => {
    modal.classList.remove("opacity-0");
    modal.firstElementChild.classList.remove("scale-95");
    modal.firstElementChild.classList.add("scale-100");
  }, 10);
};

window.closeActionModal = function () {
  const modal = document.getElementById("action-modal");
  modal.classList.add("opacity-0");
  modal.firstElementChild.classList.remove("scale-100");
  modal.firstElementChild.classList.add("scale-95");
  setTimeout(() => {
    modal.classList.add("hidden");
  }, 300);
};

window.handleModalChoice = function (choice) {
  if (!currentSelectedBattery) return;
  const { brand, model, selectedCap, originalCap, voltage, allPrices, note } =
    currentSelectedBattery;

  const batteryData = {
    brand: brand,
    model: model,
    capacity: originalCap,
    selectedCap: selectedCap,
    voltage: voltage,
    action: choice,
    options: allPrices,
    note: note, // Skickas nu med in i formuläret
  };

  sessionStorage.setItem("prefilledBattery", JSON.stringify(batteryData));
  closeActionModal();

  if (choice === "repair") window.location.href = "/skicka-in";
  else if (choice === "order") window.location.href = "/checkout";
};
// ==========================================
// 5. FORMULÄR & AUTOFILL & STAPELDIAGRAM
// ==========================================
window.currentBatteryData = null;
if (typeof currentBasePrice === "undefined") {
  window.currentBasePrice = 4500;
}

function getDynamicBasePrice() {
  return window.currentBasePrice || 0;
}

document.addEventListener("DOMContentLoaded", function () {
  const repairForm = document.getElementById("repairForm");

  if (repairForm) {
    const savedData = sessionStorage.getItem("prefilledBattery");
    const step1Display = document.getElementById("display-step1-model");
    const summaryModel = document.getElementById("summary-model");
    const originalPriceEl = document.getElementById("original-price");
    const finalPriceEl = document.getElementById("final-price");

    if (savedData) {
      const battery = JSON.parse(savedData);
      window.currentBatteryData = battery;

      if (document.getElementById("form-brand"))
        document.getElementById("form-brand").value = battery.brand || "";
      if (document.getElementById("form-model"))
        document.getElementById("form-model").value = battery.model || "";
      if (document.getElementById("form-voltage"))
        document.getElementById("form-voltage").value = battery.voltage || "";
      if (document.getElementById("form-capacity"))
        document.getElementById("form-capacity").value = battery.capacity || "";

      // HÄR LÄGGER VI IN OBS-TEXTEN (Om den finns)
      if (battery.note && battery.note.trim() !== "") {
        // Förhindra att den läggs till två gånger om kunden går fram och tillbaka
        if (!document.getElementById("step1-note-box")) {
          // Leta upp den ljusgrå rutan inuti Steg 1 där vi vill placera varningen
          const step1Card = document.querySelector("#step1 .bg-gray-50");
          if (step1Card) {
            const noteDiv = document.createElement("div");
            noteDiv.id = "step1-note-box";
            noteDiv.className =
              "mt-4 p-4 md:p-5 bg-amber-50 border border-amber-100 rounded-xl text-sm leading-relaxed text-amber-800";
            noteDiv.innerHTML = `<span class="font-bold">Information:</span> ${battery.note}`;
            step1Card.appendChild(noteDiv);
          }
        }
      }

      if (document.getElementById("form-problem")) {
        document.getElementById("form-problem").value = battery.problem || "";
        if (battery.problem && battery.problem.includes("Uppgradera")) {
          const upgradeRadio = document.getElementById("radio-upgrade");
          if (upgradeRadio) upgradeRadio.checked = true;
        }
      }
      // Läs ut grundpriset från originalbatteriet (index 0) för att kunna räkna ut mellanskillnaden
      const baseOptPrice =
        parseInt(String(battery.options[0].price).replace(/\D/g, "")) || 0;
      // Generera Uppgraderingar
      const upgradeContainer = document.getElementById("upgrade-options");
      if (upgradeContainer && battery.options && battery.options.length > 0) {
        upgradeContainer.innerHTML = "";
        battery.options.forEach((opt, index) => {
          const isBase = index === 0;
          const labelText = isBase
            ? "Behåll originalkapacitet"
            : "Uppgradera räckvidden";
          // NYTT: Räkna ut uppgraderingskostnaden!
          const optPrice = parseInt(String(opt.price).replace(/\D/g, "")) || 0;
          const diff = optPrice - baseOptPrice;
          const priceDisplay = isBase ? "Ingår" : `+${diff} kr`;

          upgradeContainer.innerHTML += `
         <label class="flex justify-between items-center p-4 md:p-6 bg-white border border-gray-200 rounded-2xl cursor-pointer hover:border-black transition has-[:checked]:border-black has-[:checked]:ring-1 has-[:checked]:ring-black">
             <div class="flex items-center">
                 <input type="radio" name="upgrade_choice" value="${index}" class="w-4 h-4 mr-3 md:mr-4 shrink-0 text-black focus:ring-black" onchange="selectUpgrade(${index})">
                 <div>
                     <p class="font-medium text-sm md:text-base">${opt.cap}</p>
                     <p class="text-xs md:text-sm text-gray-500 mt-1">${labelText}</p>
                 </div>
             </div>
             <span class="font-medium ${
               isBase ? "text-gray-500" : "text-black"
             }">${priceDisplay}</span>
         </label>
         `;
        });
        selectUpgrade(0);
        document.querySelector(
          'input[name="upgrade_choice"][value="0"]'
        ).checked = true;
      } else if (upgradeContainer) {
        upgradeContainer.innerHTML =
          "<p class='text-gray-500 italic'>Inga uppgraderingar tillgängliga för denna modell.</p>";
        if (battery.price) {
          const parsedPrice = parseInt(
            String(battery.price).replace(/\D/g, "")
          );
          if (!isNaN(parsedPrice)) window.currentBasePrice = parsedPrice;
        }
        if (originalPriceEl)
          originalPriceEl.innerText = `${window.currentBasePrice} kr`;
        if (finalPriceEl)
          finalPriceEl.innerText = `${window.currentBasePrice} kr`;
      }
    } else {
      if (step1Display)
        step1Display.innerText =
          "Inget batteri valt. Gå tillbaka och välj en modell.";
      if (summaryModel) summaryModel.innerText = "Inget batteri valt.";
      if (originalPriceEl) originalPriceEl.innerText = "0 kr";
      if (finalPriceEl) finalPriceEl.innerText = "0 kr";
    }
  }
});

// Funktionen som triggas när kunden byter uppgraderings-val
window.selectUpgrade = function (index) {
  const battery = window.currentBatteryData;
  if (!battery || !battery.options) return;

  const selectedOpt = battery.options[index];
  const baseOpt = battery.options[0]; // Originalet

  // Konvertera priser till siffror
  const priceNum = parseInt(String(selectedOpt.price).replace(/\D/g, "")) || 0;
  const basePriceNum = parseInt(String(baseOpt.price).replace(/\D/g, "")) || 0;
  const upgradeDiff = priceNum - basePriceNum; // Hur mycket extra kostar det?

  // Uppdatera det totala priset i minnet (som rabatt-koden använder)
  window.currentBasePrice = priceNum;

  // Uppdatera dold kapacitet
  const capField = document.getElementById("form-capacity");
  if (capField) capField.value = selectedOpt.cap;

  // Sätt namnet utan kapacitet (visas separat som tillval i kassan nu)
  const brand = battery.brand || "";
  const model = battery.model || "Okänd modell";
  const displayName = `${brand} ${model}`;

  const step1Display = document.getElementById("display-step1-model");
  const summaryModel = document.getElementById("summary-model");
  if (step1Display) step1Display.innerText = displayName;
  if (summaryModel) summaryModel.innerText = displayName;

  // Uppdatera kvitto-vyn i Steg 6
  const basePriceDisplay = document.getElementById("base-price-display");
  const upgradeRow = document.getElementById("upgrade-row");
  const upgradeCapDisplay = document.getElementById("upgrade-cap-display");
  const upgradePriceDisplay = document.getElementById("upgrade-price-display");

  // Visa grundpriset
  if (basePriceDisplay) basePriceDisplay.innerText = `${basePriceNum} kr`;

  // Visa eller dölj "Tillval"-raden beroende på vad man valt
  if (index > 0 && upgradeRow) {
    upgradeRow.classList.remove("hidden");
    if (upgradeCapDisplay) upgradeCapDisplay.innerText = selectedOpt.cap;
    if (upgradePriceDisplay)
      upgradePriceDisplay.innerText = `+${upgradeDiff} kr`;
  } else if (upgradeRow) {
    upgradeRow.classList.add("hidden");
  }

  // Kör resten (totalpris + diagram)
  updatePriceDisplay();
  renderChart(battery.options, index);
};

// Funktionen som bygger och animerar staplarna
function renderChart(options, selectedIndex) {
  const chartContainer = document.getElementById("upgrade-chart");
  const chartBars = document.getElementById("chart-bars");

  // Dölj diagrammet om det bara finns ETT (eller noll) val, eller om HTML saknas
  if (!chartContainer || options.length < 2) return;

  chartContainer.classList.remove("hidden");
  chartBars.innerHTML = "";

  // Leta upp den största kapaciteten för att räkna ut 100% bredd
  const getCapNum = (str) => parseFloat(str.replace(/[^\d.]/g, "")) || 0;
  const maxCap = Math.max(...options.map((o) => getCapNum(o.cap)));
  const baseCap = getCapNum(options[0].cap);

  options.forEach((opt, idx) => {
    const capNum = getCapNum(opt.cap);
    // Sätt en minsta bredd på 20% så små staplar ändå ser ut som en stapel
    const widthPct = Math.max(20, (capNum / maxCap) * 100);
    const isSelected = idx === selectedIndex;

    // Färg logik
    const barColor = isSelected ? "bg-black" : "bg-gray-300";
    const textColor = isSelected ? "font-bold text-black" : "text-gray-500";

    // Räkna ut procentuell ökning jämfört med originalet
    let increaseBadge = "";
    if (idx > 0 && baseCap > 0 && capNum > baseCap) {
      const increase = Math.round(((capNum - baseCap) / baseCap) * 100);
      increaseBadge = `<span class="text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded-full ml-2">+${increase}% räckvidd</span>`;
    }

    // Rita HTML för stapeln
    chartBars.innerHTML += `
         <div>
            <div class="flex items-center text-sm mb-2 ${textColor}">
               <span>${opt.cap}</span> ${increaseBadge}
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3 md:h-4 overflow-hidden relative">
               <div class="${barColor} h-full rounded-full transition-all duration-1000 ease-out" 
                    style="width: 0%;" 
                    data-target-width="${widthPct}%"></div>
            </div>
         </div>
      `;
  });

  // Animerar in staplarna mjukt
  setTimeout(() => {
    chartBars.querySelectorAll("[data-target-width]").forEach((bar) => {
      bar.style.width = bar.getAttribute("data-target-width");
    });
  }, 50);
}

function validateStep(stepId) {
  const stepEl = document.getElementById(stepId);
  if (!stepEl) return true;
  const requiredFields = stepEl.querySelectorAll("[required]");
  let isValid = true;

  requiredFields.forEach((field) => {
    const oldError = field.nextElementSibling;
    if (oldError && oldError.classList.contains("error-msg")) oldError.remove();
    field.classList.remove("border-red-500", "ring-1", "ring-red-500");

    if (!field.value.trim() || (field.type === "checkbox" && !field.checked)) {
      isValid = false;
      field.classList.add("border-red-500", "ring-1", "ring-red-500");
      const errorText = document.createElement("p");
      errorText.className = "error-msg text-red-500 text-xs mt-1 font-medium";
      errorText.innerText = "Detta fält måste fyllas i.";
      field.parentNode.insertBefore(errorText, field.nextSibling);

      field.addEventListener("input", function removeError() {
        field.classList.remove("border-red-500", "ring-1", "ring-red-500");
        if (errorText.parentNode) errorText.remove();
        field.removeEventListener("input", removeError);
      });
    }
  });
  return isValid;
}

function goToStep(targetStep) {
  const currentStepEl = document.querySelector(".form-step:not(.hidden-step)");
  let currentStep = 1;
  if (currentStepEl)
    currentStep = parseInt(currentStepEl.id.replace("step", ""));

  if (targetStep > currentStep) {
    if (!validateStep("step" + currentStep)) return;
  }

  document
    .querySelectorAll(".form-step")
    .forEach((el) => el.classList.add("hidden-step"));
  document.getElementById("step" + targetStep).classList.remove("hidden-step");

  for (let i = 1; i <= 6; i++) {
    const p = document.getElementById("p-" + i);
    if (p) {
      if (i <= targetStep) {
        p.classList.replace("bg-gray-200", "bg-black");
      } else {
        p.classList.replace("bg-black", "bg-gray-200");
      }
    }
  }

  const formSection = document.getElementById("skicka-in");
  if (formSection)
    formSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function setCustomerType(type) {
  const companyInfo = document.getElementById("company-info");
  const btnPrivate = document.getElementById("btn-private");
  const btnBusiness = document.getElementById("btn-business");
  const typeInput = document.getElementById("form-customer-type");

  typeInput.value = type;
  if (type === "business") {
    companyInfo.classList.remove("hidden");
    btnBusiness.classList.add("bg-white", "shadow-sm", "text-black");
    btnBusiness.classList.remove("text-gray-500");
    btnPrivate.classList.remove("bg-white", "shadow-sm", "text-black");
    btnPrivate.classList.add("text-gray-500");
    document.getElementById("form-company-name").required = true;
    document.getElementById("form-org-nr").required = true;
  } else {
    companyInfo.classList.add("hidden");
    btnPrivate.classList.add("bg-white", "shadow-sm", "text-black");
    btnPrivate.classList.remove("text-gray-500");
    btnBusiness.classList.remove("bg-white", "shadow-sm", "text-black");
    btnBusiness.classList.add("text-gray-500");
    document.getElementById("form-company-name").required = false;
    document.getElementById("form-org-nr").required = false;
  }
}

// ==========================================
// 6. RABATTKODSMOTOR
// ==========================================
let currentDiscountCodeUsed = "";
let currentDiscountPercent = 0;
const GOOGLE_DISCOUNT_URL =
  "https://script.google.com/macros/s/AKfycbx-ZW7Z_ZZrCNWGj5Em09_Qvc_0HUC1Qp9rPo2txXVhTzLh1j-yk8RS_dAZSwAfuC-w/exec"; // Ersätt vid behov

async function checkDiscountCode() {
  const inputField = document.getElementById("discount-input");
  const btn = document.getElementById("apply-discount-btn");
  const code = inputField.value.trim().toUpperCase();

  if (!code) {
    showMessage("Vänligen ange en rabattkod.", "text-red-500");
    return;
  }

  btn.innerText = "Laddar...";
  btn.disabled = true;

  try {
    const response = await fetch(`${GOOGLE_DISCOUNT_URL}?code=${code}`);
    const data = await response.json();

    if (data.success) {
      currentDiscountPercent = data.discount;
      currentDiscountCodeUsed = code;
      showMessage(
        `Rabattkod aktiverad! ${data.discount}% dras av.`,
        "text-green-600"
      );
      updatePriceDisplay();
      inputField.disabled = true;
      btn.innerText = "Tillagd";
    } else {
      showMessage("Ogiltig eller utgången rabattkod.", "text-red-500");
      currentDiscountPercent = 0;
      updatePriceDisplay();
      btn.innerText = "Använd";
      btn.disabled = false;
    }
  } catch (error) {
    showMessage("Något gick fel vid verifieringen.", "text-red-500");
    btn.innerText = "Använd";
    btn.disabled = false;
  }
}

function updatePriceDisplay() {
  const basePrice = getDynamicBasePrice();
  const discountRow = document.getElementById("discount-row");
  const discountPercentDisplay = document.getElementById(
    "discount-percent-display"
  );
  const discountAmountDisplay = document.getElementById("discount-amount");
  const finalPriceDisplay = document.getElementById("final-price");

  if (currentDiscountPercent > 0 && basePrice > 0) {
    const discountAmount = basePrice * (currentDiscountPercent / 100);
    const finalPrice = basePrice - discountAmount;

    discountPercentDisplay.innerText = currentDiscountPercent;
    discountAmountDisplay.innerText = `-${Math.round(discountAmount)} kr`;
    finalPriceDisplay.innerText = `${Math.round(finalPrice)} kr`;
    discountRow.classList.remove("hidden");
  } else {
    discountRow.classList.add("hidden");
    if (finalPriceDisplay) {
      finalPriceDisplay.innerText = `${
        basePrice > 0 ? basePrice + " kr" : "0 kr"
      }`;
    }
  }
}

function showMessage(text, colorClass) {
  const messageEl = document.getElementById("discount-message");
  messageEl.innerText = text;
  messageEl.className = `text-sm mt-2 ${colorClass}`;
  messageEl.classList.remove("hidden");
}
//
// ==========================================
// 7. GOOGLE SHEETS SUBMIT LOGIK & FRAKTDYNAMIK
// ==========================================
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzyPHu2uscFr_oAVOowqivXvxIOOW9u5-r-EtI8PwjJDCIpISbayHg1fxN327OjiiGUVg/exec";

function generateOrderNumber() {
  const timePart = Date.now().toString(36).toUpperCase();
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomPart = "";
  for (let i = 0; i < 3; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `BL-${timePart}-${randomPart}`;
}

// NYTT: Funktion för att uppdatera frakttexten i Steg 6 dynamiskt
function updateShippingSummary() {
  const shipSelf = document.getElementById("ship-self");
  const shipLabel = document.getElementById("ship-label");

  const summaryChoiceEl = document.getElementById("summary-shipping-choice");
  const summaryPriceEl = document.getElementById("shipping-price-display");

  if (!summaryChoiceEl || !summaryPriceEl) return;

  if (shipSelf && shipSelf.checked) {
    summaryChoiceEl.innerText = "(Inlämning)";
    summaryPriceEl.innerText = "Gratis";
  } else if (shipLabel && shipLabel.checked) {
    summaryChoiceEl.innerText = "(Post)";
    // Ändra "Gratis" till t.ex. "149 kr" här om du tar betalt för frakt i framtiden
    summaryPriceEl.innerText = "Gratis";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const repairForm = document.getElementById("repairForm");

  if (repairForm) {
    // Koppla lyssnare på frakt-radioknapparna så att Steg 6 uppdateras i realtid när man klickar
    const shipSelf = document.getElementById("ship-self");
    const shipLabel = document.getElementById("ship-label");
    if (shipSelf) shipSelf.addEventListener("change", updateShippingSummary);
    if (shipLabel) shipLabel.addEventListener("change", updateShippingSummary);

    repairForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const botCheckEl = document.getElementById("form-botcheck");
      if (botCheckEl && botCheckEl.value !== "") {
        window.location.href = "/bekraftelse.html";
        return;
      }

      const submitBtn = document.getElementById("submit-btn");
      let originalText = "Skicka in";
      if (submitBtn) {
        originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = "Bearbetar...";
        submitBtn.disabled = true;
        submitBtn.classList.add("opacity-50");
      }

      const orderNumber = generateOrderNumber();
      const selectedError =
        document.querySelector('input[name="error_type"]:checked')?.value || "";

      // Hämta fraktdata för inskicket
      let shippingChoice = "Ej valt";
      let shippingCostDisplay = "Gratis";

      if (shipSelf && shipSelf.checked) {
        shippingChoice = shipSelf.value;
        shippingCostDisplay = "Gratis";
      } else if (shipLabel && shipLabel.checked) {
        shippingChoice = shipLabel.value;
        shippingCostDisplay = "Gratis"; // Kan ändras till t.ex. "149 kr"
      }

      let orderType = "Nybeställning";
      if (shippingChoice === "Allmänt inskick") {
        orderType = "Allmän förfrågan";
      } else if (
        window.location.href.includes("skicka-in") ||
        window.location.href.includes("reparation")
      ) {
        orderType = "Reparation / Renovering";
      }

      const basePrice =
        document.getElementById("base-price-display")?.innerText || "";
      const finalPrice =
        document.getElementById("final-price")?.innerText || "";
      const upgradeRow = document.getElementById("upgrade-row");
      const upgradePrice =
        !upgradeRow || upgradeRow.classList.contains("hidden")
          ? ""
          : document.getElementById("upgrade-price-display")?.innerText || "";
      const discountRow = document.getElementById("discount-row");
      const discountAmount =
        !discountRow || discountRow.classList.contains("hidden")
          ? ""
          : document.getElementById("discount-amount")?.innerText || "";

      const formData = new FormData();
      formData.append("orderType", orderType);
      formData.append("orderNumber", orderNumber);
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

      formData.append("shipping", shippingChoice);
      formData.append("shippingCost", shippingCostDisplay);

      const safeDiscountCode =
        typeof currentDiscountCodeUsed !== "undefined"
          ? currentDiscountCodeUsed
          : "";
      formData.append("discountCode", safeDiscountCode);

      formData.append("basePrice", basePrice);
      formData.append("upgradePrice", upgradePrice);
      formData.append("discountAmount", discountAmount);
      formData.append("finalPrice", finalPrice);

      fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        body: formData,
      })
        .then((response) => response.text()) // FIXAT: Läser som .text() istället för .json() för att klara "Success"
        .then((text) => {
          if (text.includes("error")) throw new Error(text);

          sessionStorage.removeItem("prefilledBattery");
          const brandVal = formData.get("brand") || "Ej angivet";
          const modelVal = formData.get("model") || "Ej angivet";
          const capacityVal = formData.get("capacity") || "";

          const params = new URLSearchParams({
            order: orderNumber,
            brand: brandVal,
            model: modelVal,
            capacity: capacityVal,
            basePrice: basePrice,
            upgradePrice: upgradePrice,
            discountAmount: discountAmount,
            finalPrice: finalPrice,
            orderType: orderType,
            shippingChoice: shippingChoice,
            shippingCost: shippingCostDisplay,
          });
          window.location.href = `/confirmation?${params.toString()}`;
        })
        .catch((error) => {
          console.error("Fel:", error.message);
          alert("Något gick fel vid inskicket. Vänligen försök igen.");
          if (submitBtn) {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            submitBtn.classList.remove("opacity-50");
          }
        });
    });
  }
});
// ==========================================
// 8. FAQ LOGIK
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const tabButtons = document.querySelectorAll(".faq-tab-btn");
  const faqItems = document.querySelectorAll(".faq-item");

  // --- LOGIK FÖR FLIKAR (KATEGORIER) ---
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetCategory = button.getAttribute("data-target");

      // 1. Uppdatera aktiva/inaktiva klasser på knapparna för Tailwind-stilen
      tabButtons.forEach((btn) => {
        btn.classList.remove("bg-stone-200", "text-black", "font-medium");
        btn.classList.add("text-stone-500", "hover:text-black");
      });
      button.classList.add("bg-stone-200", "text-black", "font-medium");
      button.classList.remove("text-stone-500", "hover:text-black");

      // 2. Visa rätt frågor och dölj resten, samt stäng eventuellt öppna svar
      faqItems.forEach((item) => {
        const itemCategory = item.getAttribute("data-category");

        if (itemCategory === targetCategory) {
          item.classList.remove("hidden");
        } else {
          item.classList.add("hidden");
        }

        // Återställ alla frågor till stängt läge när man byter kategori
        const content = item.querySelector(".faq-content");
        const icon = item.querySelector(".faq-icon");
        content.classList.add("hidden");
        if (icon) icon.textContent = "+";
      });
    });
  });

  // --- LOGIK FÖR DRAGSPEL (ÖPPNA/STÄNGA FRÅGOR) ---
  faqItems.forEach((item) => {
    const trigger = item.querySelector(".faq-trigger");
    const content = item.querySelector(".faq-content");
    const icon = item.querySelector(".faq-icon");

    trigger.addEventListener("click", () => {
      const isOpen = !content.classList.contains("hidden");

      // Valfritt: Stäng alla andra öppna frågor i SAMMA kategori först
      if (!isOpen) {
        faqItems.forEach((otherItem) => {
          if (
            otherItem.getAttribute("data-category") ===
            item.getAttribute("data-category")
          ) {
            otherItem.querySelector(".faq-content").classList.add("hidden");
            const otherIcon = otherItem.querySelector(".faq-icon");
            if (otherIcon) otherIcon.textContent = "+";
          }
        });
      }

      // Växla (toggle) synlighet för den klickade frågan
      if (isOpen) {
        content.classList.add("hidden");
        if (icon) icon.textContent = "+";
      } else {
        content.classList.remove("hidden");
        if (icon) icon.textContent = "−"; // Använder ett riktigt minustecken
      }
    });
  });
  // --- LOGIK FÖR SÖKFUNKTION ---
  const searchInput = document.getElementById("faq-search");
  const faqTabsContainer = document.getElementById("faq-tabs");

  // LÄGG TILL DENNA IF-SATS: Kör bara koden om sökfältet faktiskt existerar på sidan
  if (searchInput && faqTabsContainer) {
    searchInput.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase().trim();

      if (searchTerm === "") {
        faqTabsContainer.style.display = "flex";

        const activeTab = document.querySelector(".faq-tab-btn.bg-stone-200");
        const activeCategory = activeTab
          ? activeTab.getAttribute("data-target")
          : "allmant";

        faqItems.forEach((item) => {
          if (item.getAttribute("data-category") === activeCategory) {
            item.classList.remove("hidden");
          } else {
            item.classList.add("hidden");
          }

          const content = item.querySelector(".faq-content");
          const icon = item.querySelector(".faq-icon");
          content.classList.add("hidden");
          if (icon) icon.textContent = "+";
        });
      } else {
        faqTabsContainer.style.display = "none";

        faqItems.forEach((item) => {
          const questionText = item
            .querySelector(".faq-trigger")
            .textContent.toLowerCase();
          const answerText = item
            .querySelector(".faq-content")
            .textContent.toLowerCase();

          if (
            questionText.includes(searchTerm) ||
            answerText.includes(searchTerm)
          ) {
            item.classList.remove("hidden");
            item.querySelector(".faq-content").classList.remove("hidden");
            const icon = item.querySelector(".faq-icon");
            if (icon) icon.textContent = "−";
          } else {
            item.classList.add("hidden");
          }
        });
      }
    });
  } // Stäng if-satsen här
});
