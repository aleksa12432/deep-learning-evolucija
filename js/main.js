import * as PIXI from "pixi.js";
import { Activation, brziLayer, NeuralNetwork } from "./nn";
import TestNN from "./test";

const vremeSargarepa = 5; // време потребно да се створи шаргарепа
const brzina = 3;
const globalScale = 0.3; // величина сличица
const sansaMutacije = 10; // шанса за сваки неурон да мутира %
const snagaMutacije = 0.5; // снага мутације, ако мутира неурон, [-0.5, 0.5] * снага
const brojZeceva = 100; // број зечева у старту
const minZeceva = 50; // минималан број зечева
const hraneZaRazmnozavanje = 10; // колико хране треба да скупи зец за размножавање
const vremeZivotaZeca = 500;
const umiriPriDodiruZida = true;
const odlucan = true; // ако је true, одлука је или -1 или 1 (лево или десно), нема између
const drziMax = false; // кад умре зец одмах се размножи
const noviMutiraju = false; // ако је true, нови зечеви узимају гене најбољег

let poeni = 0;
let vreme = 50;
let sargarepe = [];
let zecevi = [];

let app = new PIXI.Application({
  width: 800,
  height: 600,
  backgroundColor: 0x7774bc,
});

const brPoena = document.getElementById("brojPoena");
const zecTekstura = PIXI.Texture.from("img/bunny.png");
const sargarepaTekstura = PIXI.Texture.from("img/carrot.png");
const tanh = new Activation("Tanh", function (z) {
  return Math.tanh(z);
});

class Zec {
  constructor(x, y, nn) {
    this.zec = new PIXI.Sprite(zecTekstura);
    this.zec.scale.x = globalScale;
    this.zec.scale.y = globalScale;
    this.zec.position.x = x;
    this.zec.position.y = y;
    this.nn = nn;
    this.pojedenoHrane = 0;
    this.lifeTimer = vremeZivotaZeca;
    zecevi.push(this);
    app.stage.addChild(this.zec);
  }

  pomeraj(delta) {
    if (sargarepe.length == 0) return;

    this.lifeTimer -= delta;

    if (this.lifeTimer < 0) {
      this.umri();
    }

    const najblizaHrana = najblizaSargarepa(
      this.zec.position.x,
      this.zec.position.y
    );

    if (hitTestRectangle(this.zec, sargarepe[najblizaHrana])) {
      app.stage.removeChild(sargarepe[najblizaHrana]);
      sargarepe.splice(najblizaHrana, 1);
      poeni++;
      brPoena.innerHTML = "Поени: " + poeni;
      this.lifeTimer = vremeZivotaZeca;
      this.pojedenoHrane++;
      if (this.pojedenoHrane % hraneZaRazmnozavanje == 0) {
        console.log("УСПЕО!");
        mutirajOd(this.nn);
      }
    }

    if (sargarepe[najblizaHrana] == null) return;

    const inputs = [
      this.zec.position.x,
      this.zec.position.y,
      sargarepe[najblizaHrana].position.x,
      sargarepe[najblizaHrana].position.y,
    ];

    const outputs = this.nn.calcA(inputs);

    this.zec.position.x += odlucan
      ? outputs[0] >= 0
        ? 1
        : -1
      : outputs[0] * brzina * delta;
    this.zec.position.y += odlucan
      ? outputs[1] >= 0
        ? 1
        : -1
      : outputs[1] * brzina * delta;

    if (this.zec.position.x + this.zec.width > app.view.width) {
      if (umiriPriDodiruZida) {
        this.umri();
        return;
      }
      this.zec.position.x = app.view.width - this.zec.width;
    }

    if (this.zec.position.x < 0) {
      if (umiriPriDodiruZida) {
        this.umri();
        return;
      }
      this.zec.position.x = 0;
    }

    if (this.zec.position.y + this.zec.height > app.view.height) {
      if (umiriPriDodiruZida) {
        this.umri();
        return;
      }
      this.zec.position.y = app.view.height - this.zec.height;
    }

    if (this.zec.position.y < 0) {
      this.zec.position.y = 0;
      if (umiriPriDodiruZida) {
        this.umri();
        return;
      }
    }
  }

  mutiraj(sansa, snaga) {
    this.nn.mutacija(sansa, snaga);
  }

  umri() {
    console.log("Мртав!");
    for (let i = 0; i < zecevi.length; i++) {
      const element = zecevi[i];
      if (element === this) {
        zecevi.splice(i, 1);
      }
      app.stage.removeChild(this.zec);
    }
    if (drziMax || zecevi.length < minZeceva)
      if (noviMutiraju) mutirajNajboljeg();
      else randomZec();
  }
}

// ова функција враћа координате најближе шаргарепе
function najblizaSargarepa(x, y) {
  if (sargarepe.length == 0) return 0;
  if (sargarepe.length == 1) return 0;
  let najblizi = 0;
  let d = Math.sqrt(
    (sargarepe[0].position.x - x) ** 2 + (sargarepe[1].position.y - y) ** 2
  );
  for (let i = 1; i < sargarepe.length; i++) {
    const element = sargarepe[i];
    let d2 = Math.sqrt(
      (element.position.x - x) ** 2 + (element.position.y - y) ** 2
    );
    if (d2 < d) {
      najblizi = i;
      d = d2;
    }
  }
  return najblizi;
}

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

function mutiraj() {
  zecevi.forEach((element) => {
    element.mutiraj(sansaMutacije, snagaMutacije);
  });
}

function mutirajOd(zecNN) {
  const z = new Zec(
    Math.random() * app.view.width,
    Math.random() * app.view.height,
    Object.assign(Object.create(Object.getPrototypeOf(zecNN)), zecNN)
  );
  z.mutiraj(sansaMutacije, snagaMutacije);
}

function mutirajNajboljeg() {
  let indexNajboljeg = 0;
  for (let i = 1; i < zecevi.length; i++) {
    const element = zecevi[i];
    if (element.pojedenoHrane > zecevi[indexNajboljeg].pojedenoHrane)
      indexNajboljeg = i;
  }
  const najboljiZecNN = zecevi[indexNajboljeg].nn;
  mutirajOd(najboljiZecNN);
}

function randomZec() {
  new Zec(
    Math.random() * app.view.width,
    Math.random() * app.view.height,
    new NeuralNetwork([
      brziLayer(tanh, 5, 4), // скривени слој, 4 улаза 5 неурона
      brziLayer(tanh, 2, 5),
    ])
  );
}

for (let i = 0; i < brojZeceva; i++) {
  randomZec();
}

app.ticker.add((delta) => {
    // console.log(app.ticker.FPS);
  for (let i = 0; i < zecevi.length; i++) {
    const element = zecevi[i];
    element.pomeraj(delta);
  }

  vreme -= delta;

  if (vreme < 0) {
    const sargarepa = new PIXI.Sprite(sargarepaTekstura);
    sargarepa.scale.x = globalScale;
    sargarepa.scale.y = globalScale;

    sargarepa.position.x = Math.floor(
      Math.random() * app.view.width - sargarepa.width
    );
    sargarepa.position.y = Math.floor(
      Math.random() * app.view.height - sargarepa.height
    );
    app.stage.addChild(sargarepa);
    sargarepe.push(sargarepa);
    vreme = vremeSargarepa;
  }
});

document
  .getElementById("speedx")
  .addEventListener("onSliderChanged", function (e) {
    // brzina[0] = e.detail.value * 5;
  });

document
  .getElementById("speedy")
  .addEventListener("onSliderChanged", function (e) {
    // brzina[1] = e.detail.value * 5;
  });

window.onload = function () {
  const desniBar = document.querySelector("#desni-bar");
  desniBar.appendChild(app.view);
  const dugmeMutiraj = document.querySelector("#dugmeMutiraj");
  dugmeMutiraj.addEventListener("click", mutiraj);
};

TestNN();
