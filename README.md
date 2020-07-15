# ambilight
ambilight + led streap + webcam input

# dependences
* install package to access webcam `brew install imagesnap`
* OpenCV
    - `export OPENCV4NODEJS_DISABLE_AUTOBUILD=1`
    - `brew update`
    - `brew install opencv@4`
    - `brew link --force opencv@4` 
    - `npm i opencv4nodejs --unsafe-perm` (not yarn)
    - *if happend this error "OpenCV: not authorized to capture video (status 0), requesting...", try execute with Terminal program
    - *if some error while build fix with this command `brew uninstall tesseract`

# browser capture
 - [screen](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API/Using_Screen_Capture)
 - [webcam](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
 - [record](https://developers.google.com/web/fundamentals/media/recording-video)

## calc
4 leds
0-25%
25-50% 
50-75%
75-100%

