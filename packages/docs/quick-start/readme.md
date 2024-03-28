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

And for the editor we need the follwing `devDependencies`:

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

Create the folder where you want to store your animation definitions, in this case: `/src/animations`.

## Connect
