To convert svg to png, use
```shell
inkscape -z -e icon128.png -w 128 icon.svg
```
Put width after the `-w` (these sets height to the same), and change the filename.
The `-z` option runs this conversion headlessly, and `-e` triggers the export.
