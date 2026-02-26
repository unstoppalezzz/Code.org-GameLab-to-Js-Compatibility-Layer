# Code.org-GameLab-to-Js-Compatibility-Layer
This is a Compatibility Layer for code.org GameLab game to work in Js

# Setup 
Add your sprite images
Place any images you want for your sprites in the `images/` folder.  
Update the `imageFiles` array in `index.html`:

```js
const imageFiles = [
  "img1.png",   // sprites
  "img2.png",   // sprites
];
``` 
# Paste your Game Lab code

Open the `<script>` at the end of `build.html`:

```html
<script>
// Paste Code.org GameLab code
// change draw(); to drawGame();
</script>
``` 
Copy your Code.org Game Lab code inside this <script> tag.

Rename draw() to drawGame() so it works with this template.

4. Run on a local server

Important: Do not open index.html directly in the browser.

You need to serve the project using a local server (for example, Live Server in VS Code or any other web server).

Open the project URL in your browser.

## Attribution

This project uses [p5.js](https://p5js.org/), licensed under LGPL v2.1 or later.
This project itself is licensed under [GPL 3.0](https://www.gnu.org/licenses/gpl-3.0.en.html).
