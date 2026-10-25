let mediaList = [];
let currentIndex = 0;
let isDownloading = false;
let timer = null;

document.getElementById('txtFile').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
        const lines = evt.target.result.split('\n');
        mediaList = lines
            .map(l => l.trim())
            .filter(l => l.length > 0 && (l.startsWith('http://') || l.startsWith('https://')));

        if (mediaList.length === 0) {
            alert("Geçerli URL bulunamadı.");
            return;
        }

        currentIndex = 0;
        document.getElementById('status').innerText = "Hazır";
        document.getElementById('counter').innerText = `0 / ${mediaList.length}`;
        document.getElementById('startBtn').disabled = false;
    };
    reader.readAsText(file);
});

document.getElementById('startBtn').addEventListener('click', () => {
    if (mediaList.length === 0) return;

    isDownloading = true;
    document.getElementById('startBtn').disabled = true;
    document.getElementById('stopBtn').disabled = false;

    downloadNext();
});

document.getElementById('stopBtn').addEventListener('click', stopDownload);

function downloadNext() {
    if (!isDownloading || currentIndex >= mediaList.length) {
        if (currentIndex >= mediaList.length) {
            document.getElementById('status').innerText = "Bitti!";
        }
        stopDownload();
        return;
    }

    const url = mediaList[currentIndex];
    const filename = url.split('/').pop().split('?')[0] || `media_${currentIndex + 1}.jpg`;

    // Chrome/Edge İndirme API'si (Pop-up engeline kesinlikle takılmaz)
    chrome.downloads.download({
        url: url,
        filename: "CoomerDownloads/" + filename,
        conflictAction: 'uniquify'
    });

    currentIndex++;
    const progress = (currentIndex / mediaList.length) * 100;
    document.getElementById('progressBar').style.width = `${progress}%`;
    document.getElementById('counter').innerText = `${currentIndex} / ${mediaList.length}`;
    document.getElementById('status').innerText = `İndiriliyor (${currentIndex})`;

    const delay = parseFloat(document.getElementById('delayInput').value) * 1000;
    timer = setTimeout(downloadNext, delay);
}

function stopDownload() {
    isDownloading = false;
    if (timer) clearTimeout(timer);

    document.getElementById('startBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;

    if (currentIndex < mediaList.length) {
        document.getElementById('status').innerText = "Durduruldu";
    }
}