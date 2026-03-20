document.addEventListener("DOMContentLoaded", () => {
  initSearch("searchInput", "searchResults");
  initSearch("mobileSearchInput", "mobileSearchResults");
  initFavorites();
  initSlider();
  initTabs();
  initMobileMenu();
});

function debounce(fn, delay = 400) {
  let timeout;

  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

function initSearch(inputId, resultsId) {
  const input = document.getElementById(inputId);
  const results = document.getElementById(resultsId);

  if (!input || !results) return;

  const search = debounce(async (value) => {
    const query = value.trim();

    if (query.length <= 2) {
      results.classList.add("hidden");
      results.innerHTML = "";
      return;
    }

    results.innerHTML = `
      <div class="p-3 space-y-3">
        ${Array.from({ length: 3 })
          .map(
            () => `
              <div class="flex items-center gap-3 animate-pulse">
                <div class="h-12 w-12 rounded-lg bg-neutral-200"></div>
                <div class="flex-1">
                  <div class="h-3 w-2/3 rounded bg-neutral-200"></div>
                  <div class="mt-2 h-3 w-1/3 rounded bg-neutral-100"></div>
                </div>
              </div>
            `
          )
          .join("")}
      </div>
    `;
    results.classList.remove("hidden");

    try {
      const response = await fetch(`/search/?query=${encodeURIComponent(query)}`);
      const items = await response.json();

      renderResults(items, results);
    } catch (error) {
      results.innerHTML = `<div class="p-4 text-sm text-red-500">Search error</div>`;
      results.classList.remove("hidden");
      console.error(error);
    }
  }, 400);

  input.addEventListener("input", (event) => {
    search(event.target.value);
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      results.classList.add("hidden");
      input.blur();
    }
  });

  results.addEventListener("mousedown", (event) => {
    const button = event.target.closest("button[data-product-name]");
    if (!button) return;

    event.preventDefault();
    event.stopPropagation();

    handleSearchResultClick(button, input, results);
  });

  document.addEventListener("click", (event) => {
    if (!input.contains(event.target) && !results.contains(event.target)) {
      results.classList.add("hidden");
    }
  });
}

function renderResults(items, results) {
  if (!items.length) {
    results.innerHTML = `
      <div class="p-5 text-center">
        <div class="text-2xl">🔎</div>
        <div class="mt-2 text-sm font-medium">Nothing found</div>
        <div class="mt-1 text-xs text-neutral-500">Try another keyword</div>
      </div>
    `;
    results.classList.remove("hidden");
    return;
  }

  results.innerHTML = items
    .map(
      (item) => `
        <button
          class="flex w-full items-center gap-3 border-b border-neutral-100 p-3 text-left transition hover:bg-gray-50"
          data-product-name="${escapeHtml(item.name)}"
          type="button"
        >
          <img
            src="${escapeHtml(item.image)}"
            alt="${escapeHtml(item.name)}"
            class="h-12 w-12 rounded-lg object-cover"
          >
          <div class="min-w-0 flex-1">
            <div class="truncate text-sm font-medium">${escapeHtml(item.name)}</div>
            <div class="text-sm text-neutral-500">$${item.price}</div>
          </div>
        </button>
      `
    )
    .join("");

  results.classList.remove("hidden");

  results.animate(
    [
      { opacity: 0, transform: "translateY(-10px)" },
      { opacity: 1, transform: "translateY(0)" }
    ],
    { duration: 200, easing: "ease-out" }
  );
}

function handleSearchResultClick(button, input, results) {
  const productName = button.dataset.productName || "";

  input.value = productName;
  results.classList.add("hidden");
  results.innerHTML = "";
  input.blur();

  const allTab = document.querySelector('[data-tab="all"]');
  if (allTab) {
    allTab.click();
  }

  setTimeout(() => {
    const cards = document.querySelectorAll(".tab-item");

    const targetCard = Array.from(cards).find((card) => {
      const title = card.querySelector(".product-title");
      return title && title.textContent.trim() === productName;
    });

    if (targetCard) {
      targetCard.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });

      highlightProductCard(targetCard);
    } else {
      const catalog = document.getElementById("catalog");
      if (catalog) {
        catalog.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    }
  }, 150);
}

function initFavorites() {
  const STORAGE_KEY = "gw-favorites";
  const buttons = document.querySelectorAll(".favorite-btn");

  const getFavorites = () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  };

  const setFavorites = (favorites) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  };

  const updateButtonState = (button, isActive, animate = false) => {
    const icon = button.querySelector(".heart-icon");
    if (!icon) return;

    if (isActive) {
      icon.textContent = "♥";
      button.classList.add("bg-black", "text-white", "scale-110");
      button.classList.remove("bg-white");
    } else {
      icon.textContent = "♡";
      button.classList.remove("bg-black", "text-white", "scale-110");
      button.classList.add("bg-white");
    }

    if (animate) {
      button.animate(
        [
          { transform: "scale(1)" },
          { transform: "scale(1.3)" },
          { transform: "scale(1)" }
        ],
        { duration: 200 }
      );
    }
  };

  let favorites = getFavorites();
  updateFavoritesCounter(favorites.length);

  buttons.forEach((button) => {
    const productId = String(button.dataset.productId);

    updateButtonState(button, favorites.includes(productId), false);

    button.addEventListener("click", () => {
      const exists = favorites.includes(productId);

      if (exists) {
        favorites = favorites.filter((id) => id !== productId);
      } else {
        favorites.push(productId);
      }

      setFavorites(favorites);
      updateButtonState(button, !exists, true);
      updateFavoritesCounter(favorites.length);
    });
  });
}

function updateFavoritesCounter(count) {
  const counter = document.getElementById("favoritesCount");
  if (!counter) return;

  if (count > 0) {
    counter.textContent = count;
    counter.classList.remove("hidden");
    counter.classList.add("flex");
  } else {
    counter.classList.add("hidden");
    counter.classList.remove("flex");
  }
}

function initSlider() {
  const slides = document.querySelectorAll(".hero-slide");
  const dots = document.querySelectorAll(".hero-dot");

  if (!slides.length) return;

  let current = 0;
  let interval;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.style.opacity = i === index ? "1" : "0";
      slide.style.pointerEvents = i === index ? "auto" : "none";
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle("bg-white", i === index);
      dot.classList.toggle("bg-white/50", i !== index);
    });

    current = index;
  }

  function nextSlide() {
    const next = (current + 1) % slides.length;
    showSlide(next);
  }

  function start() {
    interval = setInterval(nextSlide, 4000);
  }

  function stop() {
    clearInterval(interval);
  }

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const index = Number(dot.dataset.index);
      stop();
      showSlide(index);
      start();
    });
  });

  showSlide(0);
  start();
}

function initTabs() {
  const tabs = document.querySelectorAll("[data-tab]");
  const items = document.querySelectorAll(".tab-item");
  const emptyState = document.getElementById("productsEmptyState");
  const grid = document.getElementById("productsGrid");

  if (!tabs.length || !items.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((btn) => btn.classList.remove("active"));
      tab.classList.add("active");

      const value = tab.dataset.tab;
      let visibleCount = 0;

      items.forEach((item) => {
        let visible = false;

        if (value === "all") visible = true;
        if (value === "new") visible = item.dataset.new === "true";
        if (value === "top") visible = item.dataset.top === "true";
        if (value === "available") visible = item.dataset.available === "true";

        if (visible) {
          visibleCount += 1;
          item.classList.remove("hidden");
          item.animate(
            [
              { opacity: 0, transform: "translateY(10px)" },
              { opacity: 1, transform: "translateY(0)" }
            ],
            { duration: 250, easing: "ease-out" }
          );
        } else {
          item.classList.add("hidden");
        }
      });

      if (emptyState && grid) {
        if (visibleCount === 0) {
          grid.classList.add("hidden");
          emptyState.classList.remove("hidden");
        } else {
          grid.classList.remove("hidden");
          emptyState.classList.add("hidden");
        }
      }
    });
  });
}

function initMobileMenu() {
  const button = document.getElementById("mobileMenuBtn");
  const menu = document.getElementById("mobileMenu");

  if (!button || !menu) return;

  button.addEventListener("click", () => {
    const isOpen = menu.style.maxHeight && menu.style.maxHeight !== "0px";
    menu.style.maxHeight = isOpen ? "0px" : `${menu.scrollHeight}px`;
  });
}

function highlightProductCard(card) {
  card.classList.add("ring-2", "ring-neutral-900", "ring-offset-2");

  card.animate(
    [
      { transform: "scale(1)" },
      { transform: "scale(1.02)" },
      { transform: "scale(1)" }
    ],
    { duration: 500, easing: "ease-out" }
  );

  setTimeout(() => {
    card.classList.remove("ring-2", "ring-neutral-900", "ring-offset-2");
  }, 1800);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}