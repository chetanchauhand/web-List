const API_URL = "https://images-api.nasa.gov/search";

const planetSelect = document.getElementById("planetSelect");
const searchBtn = document.getElementById("nasaSearchBtn");
const gallery = document.getElementById("nasaGallery");
const statusText = document.getElementById("nasaStatus");

async function exploreNASA() {
    const query = planetSelect.value;

    gallery.innerHTML = "";
    statusText.textContent = "Connecting to NASA database...";

    searchBtn.disabled = true;
    searchBtn.textContent = "Loading...";

    try {
        const url = new URL(API_URL);

        url.searchParams.set("q", query);
        url.searchParams.set("media_type", "image");
        url.searchParams.set("page_size", "20");

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`NASA API error: ${response.status}`);
        }

        const data = await response.json();

        const items = data.collection?.items || [];

        if (items.length === 0) {
            statusText.textContent = "No NASA images found.";
            return;
        }

        let displayed = 0;

        for (const item of items) {
            const info = item.data?.[0];
            const imageURL = item.links?.find(
                link => link.render === "image"
            )?.href;

            if (!info || !imageURL) continue;

            const card = document.createElement("article");
            card.className = "nasa-card";

            const image = document.createElement("img");
            image.src = imageURL;
            image.alt = info.title || query;
            image.loading = "lazy";

            const content = document.createElement("div");
            content.className = "nasa-card-content";

            const heading = document.createElement("h3");
            heading.textContent = info.title || "NASA Space Image";

            const description = document.createElement("p");
            description.textContent =
                info.description?.slice(0, 160) ||
                "Image from NASA's public image library.";

            const link = document.createElement("a");
            link.href = imageURL;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = "View original image ↗";

            content.append(heading, description, link);
            card.append(image, content);
            gallery.appendChild(card);

            displayed++;
        }

        statusText.textContent = displayed
            ? `${displayed} NASA images found for ${query}.`
            : "NASA returned no usable images. Try another search.";

    } catch (error) {
        console.error("NASA API:", error);

        statusText.textContent =
            "Unable to load NASA images. Check your internet connection and try again.";

    } finally {
        searchBtn.disabled = false;
        searchBtn.textContent = "Explore";
    }
}

searchBtn.addEventListener("click", exploreNASA);

planetSelect.addEventListener("change", exploreNASA);

// Load the first planet automatically
exploreNASA();