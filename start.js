import chokidar from "chokidar";
import {build} from './build.js';

// One-liner for current directory
chokidar.watch(['src', 'content']).on('change', (event, path) => {
  build();
});

build();
