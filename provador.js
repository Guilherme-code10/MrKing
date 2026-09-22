const VirtualTryOn = (() => {
  let garmentImage = null;
  let personImage = null;
  let garmentType = "camiseta";

  const state = {
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0
  };

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => resolve(img);
      img.onerror = () =>
        reject(new Error("Não foi possível carregar a imagem."));

      img.src = src;
    });
  }

  async function fileToImage(file) {
    const url = URL.createObjectURL(file);

    try {
      return await loadImage(url);
    } finally {
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  }

  function reset() {
    state.x = 0;
    state.y = 0;
    state.scale = 1;
    state.rotation = 0;
  }

  async function prepare(personFile, garmentSrc) {
  personImage = await fileToImage(personFile);
  garmentImage = await loadImage(garmentSrc);

  const src = garmentSrc.toLowerCase();

  if (src.includes("bermuda")) {
    garmentType = "bermuda";
  } else if (src.includes("moletom")) {
    garmentType = "moletom";
  } else {
    garmentType = "camiseta";
  }

  reset();
}

  function render(canvas) {
    if (!personImage) return;

    const ctx = canvas.getContext("2d");

    canvas.width = 600;
    canvas.height = 800;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // FOTO DA PESSOA
    const personScale = Math.min(
      canvas.width / personImage.width,
      canvas.height / personImage.height
    );

    const personWidth =
      personImage.width * personScale;

    const personHeight =
      personImage.height * personScale;

    const personX =
      (canvas.width - personWidth) / 2;

    const personY =
      (canvas.height - personHeight) / 2;

    ctx.drawImage(
      personImage,
      personX,
      personY,
      personWidth,
      personHeight
    );

    if (!garmentImage) return;

    // ROUPA
    let baseWidth = 0.46;
let baseY = 0.36;

if (garmentType === "camiseta") {
  baseWidth = 0.52;
  baseY = 0.40;
}

if (garmentType === "moletom") {
  baseWidth = 0.48;
  baseY = 0.38;
}

if (garmentType === "bermuda") {
  baseWidth = 0.40;
  baseY = 0.67;
}

const garmentWidth =
  canvas.width * baseWidth * state.scale;

const ratio =
  garmentImage.height / garmentImage.width;

const garmentHeight =
  garmentWidth * ratio;

const centerX =
  canvas.width / 2 + state.x;

const centerY =
  canvas.height * baseY + state.y;

    ctx.save();

    ctx.translate(centerX, centerY);

    ctx.rotate(
      state.rotation * Math.PI / 180
    );

    ctx.drawImage(
      garmentImage,
      -garmentWidth / 2,
      -garmentHeight / 2,
      garmentWidth,
      garmentHeight
    );

    ctx.restore();
  }

  function setScale(value) {
    state.scale = Math.max(
      0.2,
      Math.min(3, Number(value))
    );
  }

  function changeScale(amount) {
    setScale(state.scale + amount);
  }

  function setX(value) {
    state.x = Number(value);
  }

  function setY(value) {
    state.y = Number(value);
  }

  function moveX(amount) {
    state.x += amount;
  }

  function moveY(amount) {
    state.y += amount;
  }

  function setRotation(value) {
    state.rotation = Number(value);
  }

  function rotate(amount) {
    state.rotation += amount;
  }

  function download(canvas) {
    if (!canvas) return;

    const link =
      document.createElement("a");

    link.download =
      "meu-look.png";

    link.href =
      canvas.toDataURL("image/png");

    link.click();
  }

  function enableDrag(canvas, onChange) {
    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    canvas.style.touchAction = "none";
    canvas.style.cursor = "grab";

    canvas.addEventListener(
      "pointerdown",
      (event) => {
        dragging = true;

        lastX = event.clientX;
        lastY = event.clientY;

        canvas.style.cursor =
          "grabbing";

        canvas.setPointerCapture(
          event.pointerId
        );
      }
    );

    canvas.addEventListener(
      "pointermove",
      (event) => {
        if (!dragging) return;

        const rect =
          canvas.getBoundingClientRect();

        const scaleX =
          canvas.width / rect.width;

        const scaleY =
          canvas.height / rect.height;

        state.x +=
          (event.clientX - lastX) *
          scaleX;

        state.y +=
          (event.clientY - lastY) *
          scaleY;

        lastX = event.clientX;
        lastY = event.clientY;

        render(canvas);

        if (onChange) {
          onChange({ ...state });
        }
      }
    );

    function stop() {
      dragging = false;
      canvas.style.cursor = "grab";
    }

    canvas.addEventListener(
      "pointerup",
      stop
    );

    canvas.addEventListener(
      "pointercancel",
      stop
    );
  }

  function getState() {
    return { ...state };
  }

  return {
    prepare,
    render,

    setScale,
    changeScale,

    setX,
    setY,

    moveX,
    moveY,

    setRotation,
    rotate,

    reset,
    download,
    enableDrag,
    getState
  };
})();

window.VirtualTryOn = VirtualTryOn;