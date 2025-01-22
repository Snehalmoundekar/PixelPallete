window.onload = function () {
  let hexValRef = document.getElementById("hex-val-ref");
  let rgbValRef = document.getElementById("rgb-val-ref");
  let pickedColorRef = document.getElementById("picked-color-ref");

  const openPhotoBtn = document.getElementById("open-photo-btn");
  const popup = document.getElementById("popup");  
  const closePopupBtn = document.getElementById("close-popup-btn");
  const uploadImageBtn = document.getElementById("upload-image-btn");
  const urlImageBtn = document.getElementById("url-image-btn");
  const urlInputContainer = document.getElementById("url-input-container");
  const imageUrlInput = document.getElementById("image-url-input");
  const submitUrlBtn = document.getElementById("submit-url-btn");
  const dropZone = document.getElementById("drop-zone");
  const image = document.getElementById("image");
  const magnifier = document.getElementById("magnifier");
  const magnifierCanvas = document.getElementById("magnifier-canvas");
  const magnifierCtx = magnifierCanvas.getContext("2d");

  openPhotoBtn.addEventListener("click", () => {
    popup.classList.remove("hides");
    popup.classList.add("flex");
  });

  closePopupBtn.addEventListener("click", () => {
    popup.classList.add("hides");
    popup.classList.remove("flex");
  });

  uploadImageBtn.addEventListener("click", () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.click();

    fileInput.addEventListener("change", () => {
      const file = fileInput.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          image.src = e.target.result;
          popup.classList.add("hides");
          document.getElementById("controls").classList.remove("hide");
        };
        reader.readAsDataURL(file);
      }
    });
  });

  urlImageBtn.addEventListener("click", () => {
    // Show the input field for the image URL
    urlInputContainer.style.display = "block";
  });
  submitUrlBtn.addEventListener("click", () => {
    const imageUrl = imageUrlInput.value;
    if (imageUrl) {
      image.crossOrigin = "anonymous";
      image.src = imageUrl; 
      popup.classList.add("hides");
      document.getElementById("controls").classList.remove("hide");
    }
  });
  
  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragging");
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragging");
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragging");
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      loadImage(file);
    }
  });

  function loadImage(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      image.src = e.target.result;
      popup.classList.add("hides");
      document.getElementById("controls").classList.remove("hide");
    };
    reader.readAsDataURL(file);
  }

  image.onload = function () {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0, image.width, image.height);

    image.addEventListener("mousemove", (e) => {
      const rect = image.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Move the magnifier with the mouse
      magnifier.style.display = "block";
      magnifier.style.left = `${e.pageX - 110}px`;
      magnifier.style.top = `${e.pageY - 110}px`;

      showMagnifier(e, ctx);
    });

    image.addEventListener("click", (e) => {
      const rect = image.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Get the color data from the canvas
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      const color = [pixel[0], pixel[1], pixel[2]];

      // Display the selected color permanently
      displayColor(color);
    });

    image.addEventListener("mouseleave", () => {
      magnifier.style.display = "none";
    });
  };

  function showMagnifier(e, ctx) {
    const rect = image.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
  
    const pixelData = ctx.getImageData(x - 7, y - 7, 15, 15);
    magnifierCanvas.width = pixelData.width * 10;
    magnifierCanvas.height = pixelData.height * 10;
  
    magnifierCtx.clearRect(0, 0, magnifierCanvas.width, magnifierCanvas.height);
  
    // Draw magnified pixels
    for (let i = 0; i < pixelData.data.length; i += 4) {
      const r = pixelData.data[i];
      const g = pixelData.data[i + 1];
      const b = pixelData.data[i + 2];
      const a = pixelData.data[i + 3];
  
      const px = ((i / 4) % pixelData.width) * 10;
      const py = Math.floor(i / 4 / pixelData.width) * 10;
  
      magnifierCtx.fillStyle = `rgba(${r},${g},${b},${a / 255})`;
      magnifierCtx.fillRect(px, py, 10, 10);
    }
  
    // Draw grid lines
    magnifierCtx.strokeStyle = "rgba(0, 0, 0, 0.5)";
    magnifierCtx.lineWidth = 0.3;
    magnifierCtx.beginPath();
  
    // Draw vertical grid lines
    for (let i = 0; i <= magnifierCanvas.width; i += 10) {
      magnifierCtx.moveTo(i, 0);
      magnifierCtx.lineTo(i, magnifierCanvas.height);
    }
  
    // Draw horizontal grid lines
    for (let j = 0; j <= magnifierCanvas.height; j += 10) {
      magnifierCtx.moveTo(0, j);
      magnifierCtx.lineTo(magnifierCanvas.width, j);
    }
  
    magnifierCtx.stroke(); 
  }
  

  function displayColor(color) {
    const hexValue = rgbToHex(color);
    const rgbValue = `rgb(${color.join(", ")})`;
    hexValRef.value = hexValue;
    rgbValRef.value = rgbValue;
    pickedColorRef.style.backgroundColor = hexValue;
  }

  function rgbToHex(rgb) {
    return `#${rgb.map((x) => x.toString(16).padStart(2, "0")).join("")}`;
  }
};

// Copy function with type-specific message
let customAlert = document.getElementById("custom-alert");
let copy = (textId, type) => {
  const textToCopy = document.getElementById(textId).value;
  navigator.clipboard.writeText(textToCopy)
    .then(() => {
      // Show message based on the type
      customAlert.textContent = `${type} Color Copied To Clipboard!`;
      customAlert.style.display = "block";
      customAlert.style.animation = "fadeInAlert 0.5s ease";

      // Hide the alert after 2 seconds
      setTimeout(() => {
        customAlert.style.animation = "fadeOutAlert 0.5s ease";
        setTimeout(() => {
          customAlert.style.display = "none";
        }, 500);
      }, 2000);
    })
    .catch((err) => {
      console.error("Failed to copy text: ", err);
    });
};

