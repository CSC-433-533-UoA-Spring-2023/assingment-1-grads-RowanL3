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

//Function to process upload
const upload = async () => {
  if (input.files.length > 0) {
    const file = input.files[0];
    console.log("You chose", file.name);
    if (file.type) {
      console.log("It has type", file.type);
    }
    const fReader = new FileReader();
    fReader.readAsBinaryString(file);

    const ppm_img_data = await new Promise(
      (resolve) =>
        (fReader.onload = () => {
          //if successful, file data has the contents of the uploaded file
          const file_data = fReader.result;
          resolve(parsePPM(file_data));
        }),
    );

    /*
     * TODO: ADD CODE HERE TO DO 2D TRANSFORMATION and ANIMATION
     * Modify any code if needed
     * Hint: Write a rotation method, and call WebGL APIs to reuse the method for animation
     */
  }
};

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
    image_data.data[i + 3] = 255; // A channel is deafult to 255
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
