import * as PIXI from "pixi.js";
import { Activation, brziLayer, NeuralNetwork } from "./nn";
import TestNN from "./test";

const windowWidth = 1200;
const windowHeight = 800;

let vremeSargarepa = 100; // време потребно да се створи шаргарепа
let brzina = 0.5;
let globalScale = 0.5; // величина сличица
let sansaMutacije = 15; // шанса за сваки неурон да мутира %
let snagaMutacije = 1; // снага мутације, ако мутира неурон, [-0.5, 0.5] * снага
let brojZeceva = 50; // број зечева у старту
let minZeceva = 25; // минималан број зечева
let hraneZaRazmnozavanje = 8; // колико хране треба да скупи зец за размножавање
let vremeZivotaZeca = 500;

let umiriPriDodiruZida = true;
let odlucan = true; // ако је true, одлука је или -1 или 1 (лево или десно), нема између
let drziMax = false; // кад умре зец одмах се размножи
let noviMutiraju = false; // ако је true, нови зечеви узимају гене најбољег

const maxUdaljenost = 100;

let poeni = 0;
let vreme = 50;
let sargarepe = [];
let zecevi = [];
let mapa = [];

let app = new PIXI.Application({
  width: windowWidth,
  height: windowHeight,
  backgroundColor: 0x7774bc,
});

const brPoena = document.getElementById("brojPoena");
const zecTekstura = PIXI.Texture.from("img/bunny.png");
const sargarepaTekstura = PIXI.Texture.from("img/carrot.png");
const travaTekstura = PIXI.Texture.from("img/grass.png");
const tanh = new Activation("Tanh", function (z) {
  return Math.tanh(z);
});

function genMap() {
  for (let i = 0; i < mapa.length; i++) {
    const element = mapa[i];
    app.stage.removeChild(element)
  }
  mapa = [];
  for (let i = 0; i < windowWidth / (470 * globalScale * 0.2); i++) {
    for (let j = 0; j < windowHeight / (403 * globalScale * 0.2); j++) {
      const trava = new PIXI.Sprite(travaTekstura);
      trava.scale.x = globalScale * 0.2;
      trava.scale.y = globalScale * 0.2;
      trava.position.x = i * (trava.width < 2? 470 * globalScale * 0.2 : trava.width);// * 470;
      trava.position.y = j * (trava.height < 2? 403 * globalScale * 0.2 : trava.height);// * 403;
      console.log(travaTekstura.width);
      app.stage.addChild(trava);
      mapa.push(trava);
    }
  }
}

genMap();

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
    this.izabranaSargarepa = null;
    zecevi.push(this);
    app.stage.addChild(this.zec);
  }

  pomeraj(delta) {
    if (sargarepe.length == 0) return;

    this.lifeTimer -= delta;

    if (this.lifeTimer < 0) {
      this.umri();
    }

    
    if (this.najblizaSargarepa == null || Math.sqrt((this.najblizaSargarepa.position.x - this.zec.position.x) ** 2 + (this.najblizaSargarepa.position.y - this.zec.position.y) ** 2) > maxUdaljenost) {
      this.najblizaSargarepa = najblizaSargarepa(
        this.zec.position.x,
        this.zec.position.y
      );
    }

    // console.log(`${this.najblizaSargarepa.position.x}, ${this.najblizaSargarepa.position.y}`);

    for (let i = 0; i < sargarepe.length; i++) {
      const sargarepa = sargarepe[i];
      if (hitTestRectangle(this.zec, sargarepa)) {
        app.stage.removeChild(sargarepa);
        sargarepe.splice(i, 1);
        if (sargarepa == this.izabranaSargarepa)
          this.izabranaSargarepa = null;
        poeni++;
        brPoena.innerHTML = "Поени: " + poeni;
        this.lifeTimer = vremeZivotaZeca;
        this.pojedenoHrane++;
        if (this.pojedenoHrane % hraneZaRazmnozavanje == 0) {
          console.log("УСПЕО!");
          mutirajOd(this.nn);
        }
      }
    }
    
    if (this.najblizaSargarepa == null) return;

    const inputs = [
      this.zec.position.x,
      this.zec.position.y,
      this.najblizaSargarepa.position.x,
      this.najblizaSargarepa.position.y,
    ];

    const outputs = this.nn.calcA(inputs);

    this.zec.position.x +=
      (odlucan ? (outputs[0] >= 0 ? 1 : -1) : outputs[0]) * brzina * delta;

    this.zec.position.y +=
      (odlucan ? (outputs[1] >= 0 ? 1 : -1) : outputs[1]) * brzina * delta;

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
  if (sargarepe.length == 1) return sargarepe[0];
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
  return sargarepe[najblizi];
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

  if (zecevi.length < minZeceva) 

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

function reload() {
  genMap();

  zecevi.forEach((element) => {
    element.umri();
  });
  sargarepe.forEach((element) => {
    app.stage.removeChild(element);
    sargarepe = [];
  });
}

window.onload = function () {
  const desniBar = document.querySelector("#desni-bar");
  desniBar.appendChild(app.view);
  const dugmeMutiraj = document.querySelector("#dugmeMutiraj");
  dugmeMutiraj.addEventListener("click", mutiraj);

  document
    .getElementById("sargarepeTimer")
    .addEventListener("onSliderChanged", function (e) {
      vremeSargarepa = e.detail.value * 200;
    });

  document
    .getElementById("brzinaZeceva")
    .addEventListener("onSliderChanged", function (e) {
      brzina = e.detail.value * 1;
    });
  document
    .getElementById("skalaSveta")
    .addEventListener("onSliderChanged", function (e) {
      globalScale = e.detail.value * 1;
      reload();
    });
  document
    .getElementById("sansaMutacije")
    .addEventListener("onSliderChanged", function (e) {
      sansaMutacije = e.detail.value * 30;
    });
  document
    .getElementById("snagaMutacije")
    .addEventListener("onSliderChanged", function (e) {
      snagaMutacije = e.detail.value * 2;
    });
  document
    .getElementById("brojZeceva")
    .addEventListener("onSliderChanged", function (e) {
      brojZeceva = e.detail.value * 100;
      reload();
    });
  document
    .getElementById("minZeceva")
    .addEventListener("onSliderChanged", function (e) {
      minZeceva = e.detail.value * 50;
      reload();
    });
  document
    .getElementById("hraneZaRazmnozavanje")
    .addEventListener("onSliderChanged", function (e) {
      hraneZaRazmnozavanje = e.detail.value * 15;
    });
  document
    .getElementById("vremeZivotaZeca")
    .addEventListener("onSliderChanged", function (e) {
      hraneZaRazmnozavanje = e.detail.value * 1000;
    });
  const cbUmirePriDodiruZida = document.getElementById("umirePriDodiruZida");
  const cbOdlucan = document.getElementById("odlucan");
  const cbDrziMax = document.getElementById("drziMax");
  const cbNoviMutiraju = document.getElementById("noviMutiraju");

  cbUmirePriDodiruZida.addEventListener("click", function (e) {
    umiriPriDodiruZida = cbUmirePriDodiruZida.checked;
  });
  cbOdlucan.addEventListener("click", function (e) {
    odlucan = cbOdlucan.checked;
  });
  cbDrziMax.addEventListener("click", function (e) {
    drziMax = cbDrziMax.checked;
    reload();
  });
  cbNoviMutiraju.addEventListener("click", function (e) {
    noviMutiraju = cbNoviMutiraju.checked;
    reload();
  });
};

TestNN();
