import "./style.css";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("App root not found");
}

app.innerHTML = `
  <main class="page">
    <header class="topbar">
      <div class="brand">ConstroMat</div>
      <nav class="menu">
        <a href="#">Home</a>
        <a href="#">Products</a>
        <a href="#">Technology</a>
        <a href="#">About</a>
      </nav>
    </header>

    <section class="hero-section">
      <div class="hero-copy">
        <h1><span>ConstroQuant</span> Estimate Quantity of Materials</h1>
        <p>
          Plan your next project with precision. Enter your dimensions and get a
          clear breakdown of required construction materials.
        </p>
        <div class="hero-icon" aria-hidden="true">🧮</div>
      </div>

      <section class="estimator-card">
        <h2>Estimate Materials</h2>
        <p class="subtitle">All fields are required</p>

        <form id="estimate-form">
          <label for="constructionType">Construction Type</label>
          <select id="constructionType" name="constructionType" required>
            <option value="">Select construction type...</option>
            <option value="wall">Brick Wall</option>
            <option value="slab">Concrete Slab</option>
            <option value="plaster">Plastering</option>
            <option value="flooring">Flooring</option>
          </select>

          <div class="input-grid">
            <div>
              <label for="length">Length (m)</label>
              <input id="length" name="length" type="number" min="0" step="0.1" placeholder="e.g. 10" required />
            </div>
            <div>
              <label for="width">Width (m)</label>
              <input id="width" name="width" type="number" min="0" step="0.1" placeholder="e.g. 5" required />
            </div>
            <div>
              <label for="depth">Depth (m)</label>
              <input id="depth" name="depth" type="number" min="0" step="0.1" placeholder="e.g. 0.2" required />
            </div>
          </div>

          <button type="submit">Calculate Materials</button>
        </form>

        <p id="result" aria-live="polite"></p>
      </section>
    </section>
  </main>
`;

const form = document.querySelector<HTMLFormElement>("#estimate-form");
const result = document.querySelector<HTMLParagraphElement>("#result");

if (!form || !result) {
  throw new Error("Estimator form not found");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const constructionType = String(formData.get("constructionType") ?? "");
  const length = Number(formData.get("length"));
  const width = Number(formData.get("width"));
  const depth = Number(formData.get("depth"));

  if (!constructionType || length <= 0 || width <= 0 || depth <= 0) {
    result.textContent = "Please select a construction type and enter valid dimensions.";
    result.classList.add("error");
    return;
  }

  const volume = length * width * depth;
  result.classList.remove("error");
  result.textContent = `Estimated volume for ${constructionType}: ${volume.toFixed(2)} m³`;
});
