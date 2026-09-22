const TryOnService = (() => {
  const MODE = "demo";

  async function generate({
    personFile,
    garmentUrl,
    productName = ""
  }) {
    if (!personFile) {
      throw new Error("Envie uma foto da pessoa.");
    }

    if (!garmentUrl) {
      throw new Error("Nenhuma peça selecionada.");
    }

    if (MODE === "demo") {
      return generateDemo({
        personFile,
        garmentUrl,
        productName
      });
    }

    throw new Error("Motor de Virtual Try-On não configurado.");
  }

  async function generateDemo({
    personFile,
    garmentUrl
  }) {
    if (!window.VirtualTryOn) {
      throw new Error("VirtualTryOn não foi carregado.");
    }

    await window.VirtualTryOn.prepare(
      personFile,
      garmentUrl
    );

    const canvas = document.createElement("canvas");

    window.VirtualTryOn.render(canvas);

    return {
      imageUrl: canvas.toDataURL("image/png"),
      engine: "browser-demo"
    };
  }

  return {
    generate
  };
})();

window.TryOnService = TryOnService;
