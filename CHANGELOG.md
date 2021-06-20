## 0.2.0 (June 20,2021)

-   Updated constructor. Visualizers now only take one optional argument in the constructor, which is an object representing the initial configuration of the visualizer. Any properties that are not specified in the initial configuration are created / set automatically.
-   Added static helper methods for quickly creating visualizers using audio elements and audio streams.

## 0.1.1 (June 3, 2021)

-   Added live example to README.
-   Fixed bug where highest column in FrequencyGraph and FrequencyGraphBlocks was not being displayed.

## 0.1.0 (June 3, 2021)

-   Added new properties to FrequencyGraph classes. FrequencyGraph and FrequencyGraphBlocks now have the _gap_ property, which controls the spaces between columns and rows. FrequencyCurve now has the fillColor property, which allows for filling in the space under the curve with the specified color.
-   Added responsive upper padding for Frequency visualizers.
-   Frequency visualizers now span the entire width of their containers.

## 0.0.4 (June 1, 2021)

-   Build process improvements.

## 0.0.3 (May 31, 2021)

-   Added error message for invalid aspectRatio values.

## 0.0.2 (May 31, 2021)

-   Added _Usage_, _Getting Started_, and _Examples_ sections to README.md.
-   Changed library name in webpack config to _Visualize_.
-   Setting a visualizer's aspectRatio now automatically triggers a resize.
-   A visualizer's canvas element will no longer overflow outside of it's parent element.
-   Updated license in package.json.

## 0.0.1 (May 30, 2021)

-   Initial commit.
