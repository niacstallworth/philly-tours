Drop recorded narration files here.

Expected path format:
- `assets/audio/<file-name>.mp3`

Tour stop data already references narration using app-relative paths like:
- `/audio/mother-bethel-ame-church.mp3`

After adding or changing files, regenerate the runtime map:

```bash
cd /Users/nia/Documents/GitHub/philly-tours
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"
npm run narration:map
```

Then rebuild the app if you want the new bundled audio available in a native build.
