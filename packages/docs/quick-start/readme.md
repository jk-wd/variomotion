# Quick start

## install

```bash
npm install @variomotion/core
```

and the `devDependencies`, needed for running the editor:

```bash
npm install @variomotion/editor @variomotion/editor-connect --save-dev
```

## choose your framework

You can use variomotion in combination with any framework.

For this example we use React

```bash
npx create-react-app variomotion-example
```

## Create config file

Create a `vario.config.json` file in the root of your project,

```json
{
  "animationFiles": "./src/animations"
}
```

Create the folder where you want to store your animation definition files, in this case: `/src/animations`

## Connect

Create a `vario.config.json` file in the root of your project,
