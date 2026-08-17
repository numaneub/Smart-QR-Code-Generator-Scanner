const qrTypeEl = document.getElementById('qrType');
const qrInputEl = document.getElementById('qrInput');
const qrInputLabel = document.getElementById('qrInputLabel');
const generateBtn = document.getElementById('generateBtn');
const downloadBtn = document.getElementById('downloadBtn');
const clearBtn = document.getElementById('clearBtn');
const errorMsg = document.getElementById('errorMsg');
const qrPreview = document.getElementById('qrPreview');
const successMsg = document.getElementById('successMsg');

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const searchResult = document.getElementById('searchResult');
const sortBtn = document.getElementById('sortBtn');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const historyListEl = document.getElementById('historyList');

const themeToggle = document.getElementById('themeToggle');
const statsTotal = document.getElementById('statsTotal');

const startScanBtn = document.getElementById('startScanBtn');
const scanError = document.getElementById('scanError');
const scannerPreview = document.getElementById('scannerPreview');
const scanVideo = document.getElementById('scanVideo');
const scanResultBox = document.getElementById('scanResultBox');
const scanResultText = document.getElementById('scanResultText');
const copyResultBtn = document.getElementById('copyResultBtn');

let qrHistory = [];
themeToggle.addEventListener('click', function () {
  document.body.classList.toggle('dark-mode');
  const icon = themeToggle.querySelector('i');
  if (document.body.classList.contains('dark-mode')) {
    icon.className = 'fa-solid fa-moon';
  } else {
    icon.className = 'fa-solid fa-sun';
  }
});

function updateStats() {
  if (statsTotal) {
    statsTotal.textContent = qrHistory.length;
  }
}

function formatTimestamp(date) {
  const dateText = date.toLocaleDateString();
  const timeText = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return dateText + ', ' + timeText;
}

const placeholders = {
  url: { label: 'Enter URL', placeholder: 'e.g. eub.edu.bd' },
  phone: { label: 'Enter phone number', placeholder: 'e.g. 01700000000' },
  email: { label: 'Enter email address', placeholder: 'e.g. someone@example.com' }
};

qrTypeEl.addEventListener('change', function () {
  const cfg = placeholders[qrTypeEl.value];
  qrInputLabel.textContent = cfg.label;
  qrInputEl.placeholder = cfg.placeholder;
  errorMsg.textContent = '';
});

function validateInput(type, value) {
  if (value.trim() === '') {
    return 'Please enter a value before generating a QR code.';
  }

  if (type === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address.';
    }
  }

  if (type === 'phone') {
    const phoneRegex = /^[0-9+\-\s()]{6,20}$/;
    if (!phoneRegex.test(value)) {
      return 'Please enter a valid phone number.';
    }
  }

  return null;
}

  function cleanScannedValue(raw) {
  let text = raw.trim();
  text = text.replace(/^mailto:/i, '');
  text = text.replace(/^tel:/i, '');
  text = text.replace(/^(email|phone|url)\s*:\s*/i, '');
  return text.trim();
}

function buildEncodedString(type, value) {
  const trimmed = value.trim();

  if (type === 'url') {
    if (trimmed.indexOf('http://') === 0 || trimmed.indexOf('https://') === 0) {
      return trimmed;
    }
    return 'https://' + trimmed;
  }

  if (type === 'phone') {
    return 'Phone : ' + trimmed.replace(/[\s()\-]+/g, '');
  }

  if (type === 'email') {
    return ' Email : ' + trimmed;
  }

  return trimmed;
}

generateBtn.addEventListener('click', function () {
  const type = qrTypeEl.value;
  const value = qrInputEl.value;
  const error = validateInput(type, value);

  if (error) {
    errorMsg.textContent = error;
    return;
  }
  errorMsg.textContent = '';

  const encoded = buildEncodedString(type, value);

  qrPreview.innerHTML = '';

  new QRCode(qrPreview, {
    text: encoded,
    height: 200,
    width: 200,
    colorDark: '#145e53',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.H
  });

  downloadBtn.disabled = false;

  const typeLabels = { url: 'URL', phone: 'Phone', email: 'Email' };

  qrHistory.unshift({
    type: typeLabels[type],
    value: value.trim(),
    time: formatTimestamp(new Date())
  });

  successMsg.textContent = 'Congrats! Your QR code is ready ✅';
  setTimeout(function () {
    successMsg.textContent = '';
  }, 2500);

  renderHistory(qrHistory, -1);
  updateStats();
});

downloadBtn.addEventListener('click', function () {
  const canvas = qrPreview.querySelector('canvas');
  const img = qrPreview.querySelector('img');

  let dataUrl = '';
  if (canvas) {
    dataUrl = canvas.toDataURL('image/png');
  } else if (img) {
    dataUrl = img.src;
  }

  if (dataUrl === '') return;

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = 'qr-code.png';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

clearBtn.addEventListener('click', function () {
  qrInputEl.value = '';
  errorMsg.textContent = '';
  successMsg.textContent = '';
  qrPreview.innerHTML = '<span class="qr-placeholder">Your QR code will appear here</span>';
  downloadBtn.disabled = true;
});

function linearSearch(array, query) {
  const target = query.trim().toLowerCase();
  for (let i = 0; i < array.length; i++) {
    if (array[i].value.toLowerCase().indexOf(target) !== -1) {
      return i;
    }
  }
  return -1;
}

searchBtn.addEventListener('click', function () {
  const query = searchInput.value;

  if (query.trim() === '') {
    searchResult.textContent = 'Type something to search for.';
    renderHistory(qrHistory, -1);
    return;
  }

  const index = linearSearch(qrHistory, query);

  if (index === -1) {
    searchResult.textContent = 'No match found for "' + query + '".';
    renderHistory(qrHistory, -1);
  } else {
    const found = qrHistory[index];
    searchResult.textContent = 'Found at position ' + (index + 1) + ': [' + found.type + '] ' + found.value;
    renderHistory(qrHistory, index);
  }
});

function bubbleSort(array) {
  const arr = array.slice();

  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = 0; j < arr.length - 1 - i; j++) {
      if (arr[j].value.toLowerCase() > arr[j + 1].value.toLowerCase()) {
        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }

  return arr;
}

sortBtn.addEventListener('click', function () {
  if (qrHistory.length < 2) {
    searchResult.textContent = 'Need at least 2 items in history to sort.';
    return;
  }
  qrHistory = bubbleSort(qrHistory);
  searchResult.textContent = 'History sorted alphabetically using Bubble Sort.';
  renderHistory(qrHistory, -1);
});

clearHistoryBtn.addEventListener('click', function () {
  qrHistory = [];
  searchResult.textContent = '';
  renderHistory(qrHistory, -1);
  updateStats();
});

function renderHistory(array, highlightIndex) {
  historyListEl.innerHTML = '';

  if (array.length === 0) {
    historyListEl.innerHTML = '<li class="empty-state">No QR codes generated yet.</li>';
    return;
  }

  for (let i = 0; i < array.length; i++) {
    const item = array[i];
    const li = document.createElement('li');
    if (i === highlightIndex) {
      li.classList.add('highlight');
    }
    li.innerHTML =
      '<span class="item-type">' + item.type + '</span>' +
      '<span class="item-value">' + escapeHtml(item.value) + '</span>' +
      '<span class="item-time">' + escapeHtml(item.time) + '</span>';

    historyListEl.appendChild(li);
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

let scanStream = null;
const scanCanvas = document.createElement('canvas');
const scanCtx = scanCanvas.getContext('2d');
let scanAnimationId = null;

startScanBtn.addEventListener('click', function () {
  scanError.textContent = '';
  scanResultBox.style.display = 'none';
  scannerPreview.classList.remove('has-result');

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    scanError.textContent = 'Camera access is not supported in this browser.';
    return;
  }

  startScanBtn.disabled = true;
  startScanBtn.innerHTML = '<i class="fa-solid fa-camera btn-icon"></i> Scanning...';

  navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } } })
    .then(function (stream) {
      scanStream = stream;
      scanVideo.srcObject = stream;

      scanVideo.onloadedmetadata = function () {
        scanVideo.play();
        scannerPreview.classList.add('active');
        scanAnimationId = requestAnimationFrame(scanFrame);
      };
    })
    .catch(function (err) {
      scanError.textContent = 'Could not access camera. Please allow camera permission.';
      startScanBtn.disabled = false;
      startScanBtn.innerHTML = '<i class="fa-solid fa-camera btn-icon"></i> Start Scanner';
    });
});

function scanFrame() {
  if (!scanStream) return;

  if (scanVideo.readyState === scanVideo.HAVE_ENOUGH_DATA && scanVideo.videoWidth > 0) {
    try {
      scanCanvas.width = scanVideo.videoWidth;
      scanCanvas.height = scanVideo.videoHeight;
      scanCtx.drawImage(scanVideo, 0, 0, scanCanvas.width, scanCanvas.height);

      const imageData = scanCtx.getImageData(0, 0, scanCanvas.width, scanCanvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code && code.data) {
        let result = cleanScannedValue(code.data);

        result = result.trim().replace(/^email\s*:\s*/i, "");
        result = result.replace(/^phone\s*:\s*/i, "");

        if (/^https?:\/\//i.test(result)) {
          scanResultText.innerHTML = '<a href="' + result + '" target="_blank" rel="noopener noreferrer">' + result + '</a>';
        } else {
          scanResultText.textContent = result;
        }

        scannerPreview.classList.add('has-result');
        scanResultBox.style.display = 'block';
        qrHistory.push({
          type: 'Scanned QR',
          value: result,
          time: new Date().toLocaleString()
        });
        renderHistory(qrHistory, -1);
        updateStats();
        stopScanner();
        return;
      }
    } catch (e) {
      console.error("Error occurred while scanning QR code:", e);
    }
  }

  scanAnimationId = requestAnimationFrame(scanFrame);
}
function stopScanner() {
  if (scanAnimationId) {
    cancelAnimationFrame(scanAnimationId);
    scanAnimationId = null;
  }
  if (scanStream) {
    scanStream.getTracks().forEach(function (track) {
      track.stop();
    });
    scanStream = null;
  }
  scanVideo.srcObject = null;
  scannerPreview.classList.remove('active');
  startScanBtn.disabled = false;
  startScanBtn.innerHTML = '<i class="fa-solid fa-camera btn-icon"></i> Start Scanner';
}
copyResultBtn.addEventListener("click", async function () {
  const text = scanResultText.textContent.trim();
  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);
    copyResultBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
    setTimeout(function () {
      copyResultBtn.innerHTML = '<i class="fa-solid fa-copy"></i>';
    }, 1500);
  } catch (err) {
    alert("Copy failed!");
  }
});
const mobileWarning = document.getElementById('mobileWarning');
const closeMobileWarning = document.getElementById('closeMobileWarning');

if (window.innerWidth <= 768) {
  mobileWarning.style.display = 'flex';
}

closeMobileWarning.addEventListener('click', function () {
  mobileWarning.style.display = 'none';
});