BUILD_MODE='production' nodemon -i ./build -x 'npm run build && cp -r ./build/* ../gh-pages/subfolder/'
