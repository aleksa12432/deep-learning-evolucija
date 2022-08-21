import * as PIXI from "pixi.js";
import TestNN from "./test";

let app = new PIXI.Application({
  width: 800,
  height: 600,
  backgroundColor: 0x7774bc,
});

const brPoena = document.getElementById("brojPoena");

const zecTekstura = PIXI.Texture.from("img/bunny.png");
const sargarepaTekstura = PIXI.Texture.from("img/carrot.png");
let sargarepe = [];

const zec = new PIXI.Sprite(zecTekstura);

app.stage.addChild(zec);

let brzina = [2, 3];
let smer = [1, 1];
let poeni = 0;

let vreme = 100;

function hitTestRectangle(r1, r2) {
  let combinedHalfWidths, combinedHalfHeights, vx, vy;

  r1.centerX = r1.x + r1.width / 2;
  r1.centerY = r1.y + r1.height / 2;
  r2.centerX = r2.x + r2.width / 2;
  r2.centerY = r2.y + r2.height / 2;

  r1.halfWidth = r1.width / 2;
  r1.halfHeight = r1.height / 2;
  r2.halfWidth = r2.width / 2;
  r2.halfHeight = r2.height / 2;

  vx = r1.centerX - r2.centerX;
  vy = r1.centerY - r2.centerY;

  combinedHalfWidths = r1.halfWidth + r2.halfWidth;
  combinedHalfHeights = r1.halfHeight + r2.halfHeight;

  if (Math.abs(vx) < combinedHalfWidths && Math.abs(vy) < combinedHalfHeights) {
    return true;
  }

  return false;
}

app.ticker.add((delta) => {
  zec.position.x += brzina[0] * smer[0] * delta;
  zec.position.y += brzina[1] * smer[1] * delta;

  if (zec.position.x + zec.width > app.view.width) smer[0] = -1;

  if (zec.position.x < 0) smer[0] = 1;

  if (zec.position.y + zec.height > app.view.height) smer[1] = -1;

  if (zec.position.y < 0) smer[1] = 1;

  vreme -= delta;

  if (vreme < 0) {
    const sargarepa = new PIXI.Sprite(sargarepaTekstura);

    sargarepa.position.x = Math.floor(
      Math.random() * app.view.width - sargarepa.width
    );
    sargarepa.position.y = Math.floor(
      Math.random() * app.view.height - sargarepa.height
    );
    app.stage.addChild(sargarepa);
    sargarepe.push(sargarepa);
    vreme = 100;
  }

  for (let index = 0; index < sargarepe.length; index++) {
    const element = sargarepe[index];

    if (hitTestRectangle(zec, element)) {
      console.log("+1");
      app.stage.removeChild(element);
      sargarepe.splice(index, 1);
      poeni++;
      brPoena.innerHTML = "Поени: " + poeni;
      break;
    }
  }
});

document
  .getElementById("speedx")
  .addEventListener("onSliderChanged", function (e) {
    brzina[0] = e.detail.value * 5;
  });

document
  .getElementById("speedy")
  .addEventListener("onSliderChanged", function (e) {
    brzina[1] = e.detail.value * 5;
  });

window.onload = function () {
  const desniBar = document.querySelector("#desni-bar");
  desniBar.appendChild(app.view);
};

TestNN();