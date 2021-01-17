export const browser = {
  toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  },
  download(canvas, name = "pixelated-image") {
    const link = document.createElement("a");
    link.download = name + ".png";
    link.href = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
    document.querySelector("body").appendChild(link);
    link.click();
    document.querySelector("body").removeChild(link);
  },
  toDataURL: async (src, outputFormat) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    }).then((img) => {
      var canvas = document.createElement("CANVAS");
      var ctx = canvas.getContext("2d");
      var dataURL;
      canvas.height = img.naturalHeight;
      canvas.width = img.naturalWidth;
      ctx.drawImage(img, 0, 0);
      dataURL = canvas.toDataURL(outputFormat);
      return dataURL;
    });
  },
};

export const pixel = {
  convertGrayscale(ctx, drawTo) {
    const w = drawTo.width;
    const h = drawTo.height;
    var imgPixels = ctx.getImageData(0, 0, w, h);
    for (var y = 0; y < imgPixels.height; y++) {
      for (var x = 0; x < imgPixels.width; x++) {
        var i = y * 4 * imgPixels.width + x * 4;
        var avg =
          (imgPixels.data[i] + imgPixels.data[i + 1] + imgPixels.data[i + 2]) /
          3;
        imgPixels.data[i] = avg;
        imgPixels.data[i + 1] = avg;
        imgPixels.data[i + 2] = avg;
      }
    }
    ctx.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
  },
  createImage(activeImage) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = activeImage;
    });
  },
  async draw(drawFrom, drawTo, ctx, img) {
    drawTo.width = drawFrom.width;
    drawTo.height = drawFrom.height;
    ctx.drawImage(img, 0, 0);
    const canvasCopy = document.createElement("canvas");
    const copyContext = canvasCopy.getContext("2d");
    let ratio = 1.0;

    canvasCopy.width = drawTo.width;
    canvasCopy.height = drawTo.height;
    copyContext.drawImage(drawTo, 0, 0);

    drawTo.width = drawTo.width * ratio;
    drawTo.height = drawTo.height * ratio;
    ctx.drawImage(
      canvasCopy,
      0,
      0,
      canvasCopy.width,
      canvasCopy.height,
      0,
      0,
      drawTo.width,
      drawTo.height
    );
  },
  async drawPixelImage({
    to: drawTo,
    scale: originalScale,
    grayscale,
    sepia,
    activeImage,
    hue,
    gamma,
    exposure,
    noise,
    saturation,
    vibrance,
    invert,
  }) {
    const img = await this.createImage(activeImage);
    const scale = originalScale ? originalScale * 0.01 : 8 * 0.01;
    const ctx = drawTo.getContext("2d");

    await this.draw(img, drawTo, ctx, img);

    drawTo.width = img.width;
    drawTo.height = img.height;

    const scaledW = drawTo.width * scale;
    const scaledH = drawTo.height * scale;

    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;

    ctx.drawImage(img, 0, 0, scaledW, scaledH);
    ctx.drawImage(drawTo, 0, 0, scaledW, scaledH, 0, 0, img.width, img.height);

    Caman(drawTo, function () {
      if (grayscale) {
        this.greyscale().render();
      }

      if (sepia) {
        this.sepia(100).render();
      }

      if (hue) {
        this.hue(parseInt(hue)).render();
      }

      if (exposure) {
        this.exposure(parseInt(exposure)).render();
      }

      if (gamma) {
        this.gamma(parseInt(gamma)).render();
      }

      if (noise) {
        this.noise(parseInt(noise)).render();
      }
      if (saturation) {
        this.saturation(parseInt(saturation)).render();
      }

      if (vibrance) {
        this.vibrance(parseInt(vibrance)).render();
      }

      if (invert) {
        this.invert().render();
      }
    });
  },
};
