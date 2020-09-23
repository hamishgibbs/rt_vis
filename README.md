# rt_vis

A JavaScript library for displaying Rt estimates. 

Live implementations: https://hamishgibbs.github.io/rt_vis/ and https://epiforecasts.io/covid/posts/global/.

Use from `R` with [RtD3](https://github.com/epiforecasts/RtD3/issues)

To report an problem or suggest changes, please [open an issue](https://github.com/hamishgibbs/rt_vis/issues/new).

## Developer Guide

This project is written in `[Typescript](https://www.typescriptlang.org/)` and uses `[Grunt](https://gruntjs.com/)` as a task runner. 

**To develop this project locally:**

Check for an installation of `npm`:

``` {shell}
npm -v
```

If you do not have `nmp` installed, follow these [installation instructions](https://www.npmjs.com/get-npm).

Check for an installation of `Grunt`:

``` {shell}
grunt --version
```

If you do not have `Grunt` installed, follow these [installation instructions](https://gruntjs.com/getting-started).

When you have `npm` and `Grunt` installed, clone this repository into a directory of your choice:

``` {shell}
git clone https://github.com/hamishgibbs/rt_vis.git
```

Enter the new directory and install dependencies with `npm`:

``` {shell}
cd rt_vis
```

``` {shell}
npm install --save-dev
```

Run `Grunt` tasks (compile Typescript, concatenate and minify files) with:

``` {shell}
grunt
```

See `Gruntfile.js` for more details on the specifics of each task. 

**Note**: New files must be registered in `Gruntfile.js` in the appropriate task(s) in order to be included in the final build.

To have `Grunt` watch for changes to files during development:

``` {shell}
grunt watch
```

Open `index.html` in your browser and reload to observe changes to the library. Make note of the configuration variables and setup in `index.html`. 

If you are begninning to learn JavaScript, Typescript, and D3: 

* [Observable](https://observablehq.com/@d3) has useful interactive examples of D3.
* [D3.js](https://github.com/d3/d3/blob/master/API.md) has a limited but valuable API reference.
* [D3js.org](https://d3js.org/) has a basic introduction to the DOM manipulation model used in D3 (selections and attribute assignments).
* [Typescript Documentation](https://www.typescriptlang.org/docs) has valuable information on the errors that can arise from using `Typescript`.

**Note:** This project uses D3.js v5. D3 has gone through major changes over the course of its development and some online material may refer to previous versions of D3. 
