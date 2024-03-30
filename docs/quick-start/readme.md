# Quick start

## choose your framework

You can use variomotion in combination with any front-end framework.

For this example we use **React**. The end result of this quick start guide can be found here:
https://github.com/jk-wd/variomotion-react-example

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
  "animationFiles": {
    "variomotion-site": "./src/animation.json"
  }
}
```

## Create empty animation file

From the root of your project run:

```bash
touch ./src/animation.json ; echo "{}" > ./src/animation.json
```

## Connect variomotion to your app

Now we can start connecting variomotion to our app. Open the `App.tsx` file.
Add the follwing code snippets:

### imports

Import the variomotion package, and the animation file.

```javascript
import variomotion from "@variomotion/core";
import animationData from "./animation.json";
```

### Create a project

Create a project, notice how the name of the project matches the key in the `vario.config.json` file.

```javascript
const { project: varioProject, target } =
  variomotion.project("variomotion-site");
```

### Connect variomotion

For react we use the `useEffect` hook to connect Variomotion:

```javascript
useEffect(() => {
  async function initVariomotion() {
    // Connect to the Variomotion Editor in development mode
    if (process.env.NODE_ENV === "development") {
      // Connect the editor
      const { connectEditor } = await import("@variomotion/editor-connect");

      await connectEditor(async () => {
        return varioProject.init(animationData, {});
      });
    } else {
      // For production, we dont want to connect to the editor
      await varioProject.init(animationData, {});
    }
  }
  initVariomotion();
}, []);
```

### Expose the elements you want to animate

The last step before we can start animating, is expsosing elements for animation using the `data-v` attribute in combination with the `target` function:

```jsx
<div data-v={target("logo")}>
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

**_important!: make sure the port number matches the output port number from step 1._**

Now we are ready to make our first animation. Goto: the [Editor section](../editor/readme.md) to get started.
