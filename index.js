function plot() {
  let axiom = document.getElementById("axiom").value;
  let rules = document.getElementById("rules").value;
  let generations = document.getElementById("generations").value;
  let angle = document.getElementById("angle").value * (Math.PI / 180);
  let output = document.getElementById("output");

  document.getElementById("turtleModule").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    console.log(file)
    if (!file) return;

    // Read as ArrayBuffer
    const bytes = await file.arrayBuffer();

    // Instantiate WebAssembly
    const { instance, module } = await WebAssembly.instantiate(bytes, {
      /* imports go here */
    });

    // Example call
    console.log(instance.exports);
  });

  axiom = axiom.trim().replace(/\s+/g, " ").split(" ");

  let rule_map = {};

  rules.split("\n").forEach(line => {
    let pair = line.split("=");
    symbol = pair[0].trim();

    if (symbol.includes(" ")) {
      alert("Symbol names cannot contain spaces. Symbol sequence expansion mar or may not be implemented someday.")
    }

    definition = pair[1].trim().replace(/\s+/g, " ").split(" ");

    rule_map[symbol] = definition;
  });

  let current_generation = axiom;

  for (let generation = 0; generation < generations; generation++) {
    let new_generation = [];

    for (let i = 0; i < current_generation.length; i++) {
      new_generation.push(...rule_map[current_generation[i]] ?? current_generation[i]);
    }

    current_generation = new_generation;
  }

  let step = 1;

  let points = [[0, 0]];
  let direction = 0;

  for (let i = 0; i < current_generation.length; i++) {
    let symbol = current_generation[i];

    switch (symbol) {
      case "F":
        previous_point = points[points.length - 1];
        new_point = [
          previous_point[0] + step * Math.cos(direction),
          previous_point[1] + step * Math.sin(direction)
        ]

        points.push(new_point)
        break;
      case "+":
        direction += angle;
        break;
      case "-":
        direction -= angle;
        break;
    }
  }

  // Calculate bounds
  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;
  points.forEach(([x, y]) => {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  });

  let shapeWidth = maxX - minX;
  let shapeHeight = maxY - minY;

  let canvas = document.getElementById("plot");
  let context = canvas.getContext("2d");

  let container = canvas.parentElement;

  // Set canvas internal resolution to match display size
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;


  console.log(canvas.width)

  // Calculate scale to fit with padding
  let padding = 20;
  let scaleX = (canvas.width - 2 * padding) / shapeWidth;
  let scaleY = (canvas.height - 2 * padding) / shapeHeight;
  let scale = Math.min(scaleX, scaleY); // Use the smaller scale to fit both dimensions

  // Center the scaled shape
  let scaledWidth = shapeWidth * scale;
  let scaledHeight = shapeHeight * scale;
  let offsetX = (canvas.width - scaledWidth) / 2 - minX * scale;
  let offsetY = (canvas.height - scaledHeight) / 2 - minY * scale;

  context.fillStyle="#f4f4f4";
  context.strokeStyle="#1a1c2c "

  context.fillRect(0, 0, canvas.width, canvas.height);

  context.beginPath();
  context.moveTo(
    points[0][0] * scale + offsetX,
    canvas.height - (points[0][1] * scale + offsetY)
  );
  for (let i = 1; i < points.length; i++) {
    context.lineTo(
      points[i][0] * scale + offsetX,
      canvas.height - (points[i][1] * scale + offsetY)
    );
  }
  context.stroke();
}
