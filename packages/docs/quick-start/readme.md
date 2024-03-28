# Quick start

## choose your framework

You can use variomotion in combination with any front-end framework.

For this example we use **React**

```bash
npx create-react-app variomotion-example --template typescript
```

## install

Install the variomotion core:

```bash
npm install @variomotion/core
```

And for the editor we need the following `devDependencies`:

```bash
npm install @variomotion/editor @variomotion/editor-connect --save-dev
```

## Setup the config file

Create a `vario.config.json` file in the root of your project, containing the follwing fields:

```json
{
  "animationFiles": "./src/animations"
}
```

Create the folder where you want to store your animation data, in this case: `/src/animations`.

## Create empty animation file

From the root of your project run:

```bash
touch ./src/animations/animation.json ; echo "{\"metaData\": { \"fileName\": \"animation.json\" }}" > ./src/animations/animation.json
```

## Connect variomotion to your app

Almost there! We can start connecting variomotion to your app. For our react app open the `App.tsx` file.
Add the follwing code snippets:

### imports

Import the variomotion package, and the animation file.

```javascript
import variomotion from "@variomotion/core";
import animationData from "./animations/animation.json";
```

### Connect variomotion

For react we use the `useEffect` hook to connect Variomotion:

```javascript
useEffect(() => {
  async function initVariomotion() {
    // Connect to the Variomotion Editor in development mode
    if (process.env.NODE_ENV === "development") {
      const { connectEditor } = await import("@variomotion/editor-connect");

      // Connect the editor
      await connectEditor(variomotion, async () => {
        return variomotion.init({
          animationData,
        });
      });
    } else {
      // For production, we dont want to connect to the editor
      await variomotion.init({
        animationData,
      });
    }
  }
  initVariomotion();
}, []);
```

### Expose the elements you want to animate

The last step before we can start animating, is expsosing elements for animation using the data-v attribute:

```html
<div data-v="logo">
  <img src="{logo}" className="App-logo" alt="logo" />
</div>
```

## Lets start the editor! :tada:

Step 1 run your (React) project

```bash
npm run start
```

Step 2 start the editor,

```bash
npx variomotion-editor --url=http://localhost:3000
```

**_important!: make sure the portnumber matches the port number from step 1._**

Now we are ready to make our first animation. Goto: the [Editor section](../editor/readme.md) to get started.
