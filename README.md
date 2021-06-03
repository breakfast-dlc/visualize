# Visualize

Visualize is a library that uses the Web Audio API to create audio visualizations in the browser.

## Installation

You can add Visualize as a package using npm

```bash
npm install @breakfast-dlc/visualize
```

or you can add it to a page using a script tag.

```html
<script src="https://cdn.jsdelivr.net/npm/@breakfast-dlc/visualize@latest/dist/index.js"></script>
```

## Usage

To import the library

```javascript
import * as Visualize from "@breakfast-dlc/visualize";
```

or you can import specific visualizer classes.

```javascript
import { Oscillope } from "@breakfast-dlc/visualize";
```

## Getting Started

### Creating a Visualizer

Visualizers require an [AnalyserNode](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode) and a [canvas element](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement).

```javascript
//Get AnalyserNode
let audioContext = new window.AudioContext();
let analyser = audioContext.createAnalyser();
someMediaSource.connect(analyser);

//Get canvas element
let canvas = document.getElementById("canvas");

//Create Visualizer
let visual = new Visualize.FrequencyGraphBlocks(analyser, canvas);
```

### Visualizer Properties

All visualizers have the following properties:

-   **fps** {_number_}: The frames per second that the visualition should run at. Defaults to the highest possible fps in the browser, which
    is typically around 60 fps.
-   **aspectRatio** { {height: _number_ , width: _number_ } }: The aspect ratio to use when sizing the canvas. Defaults to 16:9.
-   **backgroundColor** {_string_ | _string[]_}: The background color to use for the visualization.
-   **color** {_string_ | _string[]_}: The foreground color to use for the visualization.

All properties can be set directly

```javascript
let visual = Visualize.Oscillope(analyser, canvas);
visual.lineWidth = 5;
visual.backgroundColor = ["#333333", "#DDDDDD"];
visual.color = "aqua";
```

as well as set when the object is created.

```javascript
let visual = Visualize.Oscillope(analyser, canvas, {
    lineWidth: 5,
    backgroundColor: ["#333333", "#DDDDDD"],
    color: "aqua",
});
```

### Available Visualizers

Here is a list of all available visualizers as well as any additional properties they may have:

#### Oscillope

-   **lineWidth** {_number_}: The width of the Oscillope's line in pixels.

#### FrequencyCurve

-   **lineWidth** {_number_}: The width of the Frequency Curve's line in pixels.
-   **fillColor** {_string | string[]_}: The color / array of color to fill the space under the curve.

#### FrequencyGraph

-   **columnCount** {_number_}: The number of columns or bars to use in the visualization.
-   **gap** {_number_}: The amount of space (in pixels) between each column.

#### FrequencyGraphBlocks

-   **columnCount** {_number_}: The number of columns or bars to use in the visualization.
-   **rowCount** {_number_}: The number of blocks each column will be split into.
-   **gap** {_number_}: The amount of space (in pixels) between each column and each row.

### Visualizer Callbacks

You can add a callback to a visualizer that will run at a specific point each time a frame of the visualization is rendered.

```javascript
let visual = new Visualize.FrequencyCurve(analyser, canvas);
visual.addCallback("setUpForeground", (canvasContext) => {
    canvasContext.shadowColor = "#CCCCCC";
    canvasContext.shadowBlur = 15;
});
```

#### Available Callback Events

-   **setUpForeground**: Runs right before the foreground element is rendered.

## Examples

### Live Examples

View a live example [here](https://breakfastdlc.com/code/visualize).

### Code Snippets

Connect a visualizer to an HTML audio element:

```javascript
//Create media element source from audio element
let context = new window.AudioContext();
let audio = document.getElementById("audio");
let track = context.createMediaElementSource(audio);
track.connect(context.destination);

//Create analyser node and connect audio to analyser
let analyser = context.createAnalyser();
track.connect(analyser);

//Get canvas element
let canvas = document.getElementById("canvas");

//Create Visualizer
let visual = new Visualize.FrequencyGraphBlocks(analyser, canvas);
visual.backgroundColor = ["#333333", "#CCCCCC"];
visual.color = ["orange", "gold", "yellow"];

//Start Audio
audio.play();
```

Make a visualizer fill an html element:

```javascript
let container = document.getElementById("canvas-container");
let visual = new Visualize.Oscillope(analyser, canvas);
visual.aspectRatio = {
    width: container.clientWidth,
    height: container.clientHeight,
};
```

Resize a visualizer when the window resizes:

```javascript
let visual = new Visualize.FrequencyGraph(analyser, canvas);

window.addEventListener("resize", () => {
    visual.resize();
});
```
