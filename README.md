# Setting up Webpack + TypeScript + VueJS from scratch

The following lists and explains the steps needed to configure a barebones
NPM project for Webpack 4, TypeScript 3 and VueJS 2, from scratch.


## Project setup

First, we'll create the NPM package description, `package.json`, in the root of the project folder:
```
{
  "name": "my-project",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "build": "webpack"
  }
}

```
The above gives a name to your project, "my-project", and a version, 1.0.0. The `private` property
tells NPM that this project should not be published to the NPM package repository. Strictly speaking,
the `private` property is not required but it is very good practice. We also preemptively defined
a "build" script which will simply call Webpack.

For this barebones project, we will use a single file for the source code. Let's
create a subfolder called `src` and inside a file called `main.ts` with some TypeScript:
```
function say(s: string) {
    console.log(s);
}

say('Hello world!');
```

By default, the output of the project build, `main.js`, will go into the `dist` subfolder. Let's create
this subfolder and add an `index.html` file to launch the app:
```
<html>
<head>
    <meta charset="utf-8" />
</head>
<body>
    <script src="main.js"></script>
</body>
</html>
```


## Webpack

Next, let's make this a Webpack project. In the root of the project, run
```
npm install --save-dev webpack webpack-cli typescript ts-loader
```
This will install Webpack, the Webpack command-line tool, the TypeScript compiler and the TypeScript loader
for your project. The TypeScript loader is a pre-processor for Webpack which allows the seamless use
of TypeScript code in a Webpack project by calling the compiler automatically during a build.

Further, we need to configure Webpack itself. Create the configuration file `webpack.config.js`
in the root of the project folder:
```
const path = require('path');

module.exports = {
    entry: './src/main.ts',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: 'ts-loader',
            },
        ],
    },
};
```
This is a very basic configuration and the only extra thing is that we tell Webpack to use
the TypeScript loader when handling TypeScript files.

Finally, we need to configure TypeScript using the `tsconfig.json` file in the root of the project:
```
{
    "compilerOptions": {
        "module": "es6",
        "moduleResolution": "node",
    }
}
```
In this project we'll use the ES6 style of importing modules and we'll use the NodeJS module
resolution strategy, so the TypeScript compiler has to be configured appropriately.

At this point, in the root of the project we can run:
```
npm run build
```
You will see that the build outputs `main.js` under the `dist` subfolder. Opening the
`index.html` file in a browser will result in *Hello world!* being printed in the console of
the browser.


## VueJS

Setting up VueJS is easy enough. In the root of the project, run
```
npm install vue
npm install --save-dev @types/vue
```
The second command installs the type definitions for VueJS so that we can use it conveniently
from TypeScript.

### Using runtime with template compiler

A critical point to note here is that the VueJS runtime which will be bundled by default
with our app will not include the Vue template compiler. The template compiler is required
if we use inline Vue code in our HTML page. To make the app work, we need to tell Webpack
to bundle a VueJS runtime which includes the template compiler.
This is done by declaring an alias for the "vue" module in `webpack.config.js` and choosing
the appropriate runtime (in this case, "vue/dist/vue.js"):
```
const path = require('path');

module.exports = {
    entry: './src/main.ts',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: 'ts-loader',
            },
        ],
    },
    resolve: {
        alias: {
            'vue': 'vue/dist/vue.js',
        },
    },
};
```

Following the basic example from the [VueJS tutorial](https://vuejs.org/v2/guide/), let's add a
`div` element to the HTML code to load the app:
```
<html>
<head>
    <meta charset="utf-8" />
</head>
<body>
    <div id="app">
        {{ message }}
    </div>
    <script src="main.js"></script>
</body>
</html>
```
Note that the `script` tag has to come after the HTML tag for the VueJS app.

Correspondingly, let's update the TypeScript code:
```
import Vue from 'vue'

var app = new Vue({
    el: '#app',
    data: {
        message: 'Hello world!'
    }
})
```

At this point, in the root of the project we can again run:
```
npm run build
```
Opening the `index.html` file in a browser will result in *Hello world!* being displayed on the page.

### Using single-file .vue components

Another way to write Vue code is to use single-file .vue components rather than inlining in the HTML of the page.
The VueJS template compiler will be invoked at build time and will not be needed at runtime.

In the root of the project, run
```
npm install --save-dev vue-loader vue-template-compiler
```
This adds to the project the VueJS template compiler and the component loader for Webpack.

Now, we need to reconfigure Webpack. First, we can remove the alias for the VueJS runtime
because the default runtime will suffice. Second, we need to tell Webpack to use the
corresponding loader for .vue components.
```
const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
    entry: './src/main.ts',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: 'ts-loader',
            },
            {
                test: /\.vue$/,
                use: 'vue-loader',
            },
        ],
    },
    plugins: [
        new VueLoaderPlugin(),
    ],
};
```

Next, we have to tell the TypeScript compiler how to handle .vue components. This is done by adding a file,
`vue-shims.d.ts` in the `src` subfolder:
```
declare module '*.vue' {
    import Vue from 'vue';
    export default Vue;
}
```

Now, we can create a simple .vue component, `App.vue`, under the `src` subfolder:
```
<template>
  <div>
    Hello world!
  </div>
</template>
```

Then, we change the `main.ts` file to make use of the component:
```
import Vue from 'vue'
import App from './App.vue'

var app = new Vue({
    el: '#app',
    render: h => h(App),
})
```
The `h` in the `render` property is a commonly used shorthand in the VueJS community to refer
to the function which generates the code for the given component. Any other valid identifier
can be used instead, e.g., `createElement`.

Finally, we update `index.html` to remove the inlined Vue code:
```
<html>
<head>
    <meta charset="utf-8" />
</head>
<body>
    <div id="app">
    </div>
    <script src="main.js"></script>
</body>
</html>
```

At this point, in the root of the project we can run:
```
npm run build
```
Opening the `index.html` file in a browser will result in *Hello world!* being displayed on the page.
Another thing to note is that the output of the build, `main.js`, is much smaller because we did not
bundle the VueJS template compiler with the app.
