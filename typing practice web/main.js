let paragraphText = '';
let started = false;
let startTime = 0;
let errors = 0;
let intervalId = null;
let imageAltText = '';
let imageMode = false;

const paragraphElem = document.getElementById('paragraph');
const inputElem = document.getElementById('input');
const wpmElem = document.getElementById('wpm');
const accuracyElem = document.getElementById('accuracy');
const errorsElem = document.getElementById('errors');
const restartBtn = document.getElementById('restart');
const imageModeCheckbox = document.getElementById('imageMode');
const practiceImage = document.getElementById('practiceImage');

/**
 * Fetch a new random paragraph and reset everything.
 */
function fetchParagraph() {
  paragraphElem.style.display = 'block';
  practiceImage.style.display = 'none';
  paragraphElem.textContent = "Loading...";
  inputElem.value = '';
  inputElem.disabled = true;
  resetStats();

  fetch('https://baconipsum.com/api/?type=meat-and-filler&paras=1')
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch paragraph");
      return res.json();
    })
    .then(data => {
      paragraphText = data[0];
      paragraphElem.textContent = paragraphText;
      inputElem.disabled = false;
      inputElem.focus();
    })
    .catch(err => {
      paragraphElem.textContent = "Error fetching paragraph. Try again.";
      console.error(err);
    });
}

/**
 * Fetch a random image and set its alt text as the typing target.
 */
function fetchImage() {
  paragraphElem.style.display = 'none';
  practiceImage.style.display = 'block';
  inputElem.value = '';
  inputElem.disabled = true;
  resetStats();

  fetch('https://source.unsplash.com/random/600x300')
    .then(response => {
      // Example alt texts for demonstration
      const altTexts = [
        "A beautiful landscape with mountains.",
        "A close-up of vibrant flowers.",
        "A city skyline at sunset.",
        "A serene beach with blue water.",
        "A forest filled with tall trees.",
        "A bustling street in an urban city.",
        "A calm lake reflecting the sky.",
        "A snowy mountain peak under clear sky.",
        "A field of wildflowers in bloom.",
        "A cozy cabin surrounded by nature."
      ];
      imageAltText = altTexts[Math.floor(Math.random() * altTexts.length)];
      practiceImage.src = response.url;
      practiceImage.alt = imageAltText;
      paragraphText = imageAltText;
      inputElem.disabled = false;
      inputElem.focus();
    })
    .catch(err => {
      practiceImage.style.display = 'none';
      paragraphElem.style.display = 'block';
      paragraphElem.textContent = "Error fetching image. Try again.";
      console.error(err);
    });
}

/**
 * Reset typing stats and clear interval.
 */
function resetStats() {
  started = false;
  startTime = 0;
  errors = 0;
  wpmElem.textContent = 'WPM: 0';
  accuracyElem.textContent = 'Accuracy: 100%';
  errorsElem.textContent = 'Errors: 0';
  clearInterval(intervalId);
}

/**
 * Input event handler for typing logic and live stats update.
 */
inputElem.addEventListener('input', () => {
  if (!started) {
    started = true;
    startTime = new Date().getTime();
    intervalId = setInterval(updateStats, 200);
  }

  let input = inputElem.value;
  let correct = 0;
  errors = 0;

  // Count correct and error characters
  for (let i = 0; i < input.length; i++) {
    if (input[i] === paragraphText[i]) {
      correct++;
    } else {
      errors++;
    }
  }

  // Highlight correct and incorrect letters only for paragraph mode
  if (!imageMode) {
    let colored = '';
    for (let i = 0; i < paragraphText.length; i++) {
      if (input[i] === undefined) {
        colored += `<span>${paragraphText[i]}</span>`;
      } else if (input[i] === paragraphText[i]) {
        colored += `<span style="background: #bfffc2">${paragraphText[i]}</span>`;
      } else {
        colored += `<span style="background: #ffc2c2">${paragraphText[i]}</span>`;
      }
    }
    paragraphElem.innerHTML = colored;
  }

  // Update stats
  errorsElem.textContent = `Errors: ${errors}`;
  let acc = input.length ? Math.max(0, ((correct / input.length) * 100).toFixed(0)) : 100;
  accuracyElem.textContent = `Accuracy: ${acc}%`;

  // If finished
  if (input === paragraphText) {
    clearInterval(intervalId);
    updateStats(true);
    inputElem.disabled = true;
  }
});

/**
 * Update WPM and optionally show complete message.
 */
function updateStats(finished = false) {
  let now = new Date().getTime();
  let timeElapsed = ((now - startTime) / 1000 / 60); // in minutes
  let wordsTyped = inputElem.value.trim().split(/\s+/).filter(Boolean).length;
  let wpm = timeElapsed > 0 ? Math.round(wordsTyped / timeElapsed) : 0;
  wpmElem.textContent = `WPM: ${wpm}`;
  if (finished) {
    wpmElem.textContent += " (Complete!)";
  }
}

// Fetch new paragraph or image on restart button click
restartBtn.addEventListener('click', () => {
  if (imageMode) {
    fetchImage();
  } else {
    fetchParagraph();
  }
});

// Toggle image mode

imageModeCheckbox.addEventListener('change', (e) => {
  imageMode = e.target.checked;
  if (imageMode) {
    fetchImage();
    inputElem.placeholder = "Type the image description (ALT text) here";
  } else {
    fetchParagraph();
    inputElem.placeholder = "Start typing here";
  }
});

// Fetch a paragraph on initial page load
window.onload = fetchParagraph;