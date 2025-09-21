<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Sound to Image Demo</title>
</head>
<body>
  <h2>Генерация дорожки</h2>
  <input type="file" id="fileInput" accept="audio/*">
  <canvas id="waveCanvas" width="800" height="200"></canvas>
  <button id="saveBtn">Сохранить PNG</button>

  <h2>Сканирование дорожки</h2>
  <video id="video" width="400" height="200" autoplay></video>
  <button id="scanBtn">Сканировать</button>
  <button id="playBtn">Играть звук</button>

  <script>
    const canvas = document.getElementById("waveCanvas");
    const ctx = canvas.getContext("2d");
    const fileInput = document.getElementById("fileInput");
    const saveBtn = document.getElementById("saveBtn");

    let audioData = [];

    // === Генерация картинки из аудио ===
    fileInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      const arrayBuffer = await file.arrayBuffer();
      const audioCtx = new AudioContext();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      const data = audioBuffer.getChannelData(0);

      audioData = data; // сохраним для декодера

      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.beginPath();
      ctx.moveTo(0, canvas.height/2);

      for (let i = 0; i < canvas.width; i++) {
        const sampleIndex = Math.floor(i * data.length / canvas.width);
        const v = data[sampleIndex] * (canvas.height/2);
        ctx.lineTo(i, (canvas.height/2) - v);
      }
      ctx.strokeStyle = "red";
      ctx.stroke();
    });

    saveBtn.addEventListener("click", () => {
      const link = document.createElement("a");
      link.download = "waveform.png";
      link.href = canvas.toDataURL();
      link.click();
    });

    // === Сканирование дорожки (камера) ===
    const video = document.getElementById("video");
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => video.srcObject = stream);

    document.getElementById("scanBtn").addEventListener("click", () => {
      const scanCanvas = document.createElement("canvas");
      scanCanvas.width = video.videoWidth;
      scanCanvas.height = video.videoHeight;
      const scanCtx = scanCanvas.getContext("2d");
      scanCtx.drawImage(video, 0, 0);
      const imgData = scanCtx.getImageData(0,0,scanCanvas.width,scanCanvas.height);

      // ⚡ Тут нужно распознать волну → массив амплитуд (упрощено!)
      // Сейчас для примера просто вернем сохранённый массив
      console.log("Сканирование картинок пока прототипное");
    });

    // === Воспроизведение ===
    document.getElementById("playBtn").addEventListener("click", () => {
      const audioCtx = new AudioContext();
      const buffer = audioCtx.createBuffer(1, audioData.length, audioCtx.sampleRate);
      buffer.getChannelData(0).set(audioData);

      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);
      source.start();
    });
  </script>
</body>
</html>