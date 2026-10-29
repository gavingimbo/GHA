import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
// Use the pre-installed Chromium so the render needs no browser download.
Config.setBrowserExecutable('/opt/pw-browsers/chromium');
