/*
  Basic File I/O for displaying
  Skeleton Author: Joshua A. Levine
  Modified by: Amir Mohammad Esmaieeli Sikaroudi
  Email: amesmaieeli@email.arizona.edu
  */

//access DOM elements we'll use
const input = document.getElementById("load_image");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
// prevents memory leak when uploading new files
let process_counter = 0;

// transformations
const shift = (x, y) => [
  [1, 0, x],
  [0, 1, y],
  [0, 0, 1],
];
const rotate = (theta) => [
  [Math.cos(theta), -Math.sin(theta), 0],
  [Math.sin(theta), Math.cos(theta), 0],
  [0, 0, 1],
];

const scale = (xScale, yScale) => [
  [xScale, 0, 0],
  [0, yScale, 0],
  [0, 0, 1],
];

const upload = async () => {
  process_counter++;
  const process_id = process_counter;
  if (input.files.length > 0) {
    const file = input.files[0];
    console.log("You chose", file.name);
    if (file.type) {
      console.log("It has type", file.type);
    }
    const fReader = new FileReader();
    fReader.readAsBinaryString(file);

    const sourceImage = await new Promise(
      (resolve) =>
        (fReader.onload = () => {
          //if successful, file data has the contents of the uploaded file
          const file_data = fReader.result;
          resolve(parsePPM(file_data));
        }),
    );
    const outputImage = ctx.createImageData(canvas.width, canvas.height);
    const { width, height } = canvas;

    const render = (time) => {
      const theta = 0.001 * time;
      const thetaModulo = theta % (Math.PI / 2);
      const xScale =
        (width * Math.cos(thetaModulo) + height * Math.sin(thetaModulo)) /
        width;
      const yScale =
        (width * Math.sin(thetaModulo) + height * Math.cos(thetaModulo)) /
        height;
      const maxScale = Math.max(xScale, yScale);

      const transformations = bulkMultiplyMatrix3x3([
        shift(canvas.width / 2, canvas.height / 2),
        scale(maxScale, maxScale),
        rotate(theta),
        shift(-canvas.width / 2, -canvas.height / 2),
      ]);
      showMatrix(transformations);
      for (let x = 0; x < canvas.width; x++) {
        for (let y = 0; y < canvas.height; y++) {
          const source = toCartesian(
            multiplyVectorMatrix3x3(transformations, toHomogeneous([x, y])),
          );
          const sourceX = Math.round(source[0]);
          const sourceY = Math.round(source[1]);
          const outputIndex = (y * sourceImage.width + x) * 4;
          if (
            sourceX > sourceImage.width ||
            sourceX < 0 ||
            sourceY > sourceImage.height ||
            sourceY < 0
          ) {
            outputImage.data[outputIndex] = 255;
            outputImage.data[outputIndex + 1] = 255;
            outputImage.data[outputIndex + 2] = 255;
            outputImage.data[outputIndex + 3] = 255;
          } else {
            const sourceIndex = (sourceY * sourceImage.width + sourceX) * 4;
            outputImage.data[outputIndex] = sourceImage.data[sourceIndex];
            outputImage.data[outputIndex + 1] =
              sourceImage.data[sourceIndex + 1];
            outputImage.data[outputIndex + 2] =
              sourceImage.data[sourceIndex + 2];
            outputImage.data[outputIndex + 3] =
              sourceImage.data[sourceIndex + 3];
          }
        }
      }

      ctx.putImageData(outputImage, 0, 0);

      if (process_id === process_counter) {
        requestAnimationFrame(render);
      }
    };
    requestAnimationFrame(render);
  }
};

function showMatrix(matrix) {
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      matrix[i][j] = Math.floor(matrix[i][j] * 100) / 100;
    }
  }
  document.getElementById("row1").innerHTML =
    "row 1:[ " + matrix[0].toString().replaceAll(",", ",\t") + " ]";
  document.getElementById("row2").innerHTML =
    "row 2:[ " + matrix[1].toString().replaceAll(",", ",\t") + " ]";
  document.getElementById("row3").innerHTML =
    "row 3:[ " + matrix[2].toString().replaceAll(",", ",\t") + " ]";
}

// Load PPM Image to Canvas
function parsePPM(file_data) {
  /*
   * Extract header
   */
  const lines = file_data.split(/#[^\n]*\s*|\s+/); // split text by whitespace or text following '#' ending with whitespace
  // get attributes
  const format = lines[0];
  const width = lines[1];
  const height = lines[2];
  const max_v = Number(lines[3]);

  console.log("Format: " + format);
  console.log("Width: " + width);
  console.log("Height: " + height);
  console.log("Max Value: " + max_v);
  /*
   * Extract Pixel Data
   */
  const bytes = new Uint8Array(3 * width * height); // i-th R pixel is at 3 * i; i-th G is at 3 * i + 1; etc.
  // i-th pixel is on Row i / width and on Column i % width
  // Raw data must be last 3 X W X H bytes of the image file
  const raw_data = file_data.substring(file_data.length - width * height * 3);
  for (let i = 0; i < width * height * 3; i++) {
    // convert raw data byte-by-byte
    bytes[i] = raw_data.charCodeAt(i);
  }
  // update width and height of canvas
  document.getElementById("canvas").setAttribute("width", width);
  document.getElementById("canvas").setAttribute("height", height);
  // create ImageData object
  const image_data = ctx.createImageData(width, height);
  // fill ImageData
  for (let i = 0; i < image_data.data.length; i += 4) {
    let pixel_pos = i / 4;
    image_data.data[i] = bytes[pixel_pos * 3]; // Red ~ i + 0
    image_data.data[i + 1] = bytes[pixel_pos * 3 + 1]; // Green ~ i + 1
    image_data.data[i + 2] = bytes[pixel_pos * 3 + 2]; // Blue ~ i + 2
    image_data.data[i + 3] = 255; // A channel is default to 255
  }
  ctx.putImageData(
    image_data,
    canvas.width / 2 - width / 2,
    canvas.height / 2 - height / 2,
  );

  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

//Connect event listeners
input.addEventListener("change", upload);
