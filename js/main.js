import * as PIXI from 'pixi.js';

let app = new PIXI.Application(
    {
        width: 800,
        height: 600,
        backgroundColor: 0x7774bc
    }
);

window.onload = function () {
    const desniBar = document.querySelector("#desni-bar");
    desniBar.appendChild(app.view);
}
